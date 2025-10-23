import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { Network } from '@nexscript/nexscript'
import { getWalletConnection, WalletConnection, ConnectionStatus } from '../services/WalletConnection'
import { useSession } from '../hooks/useSession'

interface WalletContextType {
  status: ConnectionStatus
  address: string | null
  balance: bigint
  network: Network
  pairingURI: string | null
  connect: (network: Network) => Promise<void>
  disconnect: () => void
  cancelConnection: () => void
  switchToAccount: (targetAddress: string, targetNetwork: Network) => Promise<boolean>
  isConnected: boolean
  error: string | null
  hasStoredSession: boolean
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
  initialNetwork?: Network
}

export const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  initialNetwork = Network.TESTNET
}) => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<bigint>(0n)
  const [network, setNetwork] = useState<Network>(initialNetwork)
  const [pairingURI, setPairingURI] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [walletConnection] = useState<WalletConnection>(() => getWalletConnection(initialNetwork))
  const [restoringSession, setRestoringSession] = useState(false)
  const [switchingAccount, setSwitchingAccount] = useState(false)
  const restoreAttemptedRef = useRef(false)

  const {
    session,
    saveSession,
    endSession,
    addRecentConnection,
    isSessionExpired,
    recentConnections,
  } = useSession()

  useEffect(() => {
    walletConnection.onStateChangeCallback((state) => {
      if (state.status === 'disconnected' && switchingAccount) {
        return
      }

      setStatus(state.status)
      setAddress(state.address)
      setBalance(state.balance)
      setNetwork(state.network)

      if (state.status === 'disconnected') {
        setPairingURI(null)
        setError(null)
      }
    })
  }, [walletConnection, switchingAccount])

  const connect = useCallback(async (selectedNetwork: Network): Promise<void> => {
    try {
      setStatus('connecting')
      setError(null)
      setNetwork(selectedNetwork)

      const uri = await walletConnection.initialize(selectedNetwork)
      setPairingURI(uri)

      const connectedAddress = await walletConnection.waitForWallet(60000)

      setAddress(connectedAddress)
      setStatus('connected')
      setPairingURI(null)

      const sessionInfo = walletConnection.getSessionInfo()
      if (sessionInfo) {
        const sessionData = {
          sessionId: sessionInfo.sessionId,
          secret: sessionInfo.secret,
          relayUrl: sessionInfo.relayUrl,
          version: sessionInfo.version
        }
        saveSession(connectedAddress, selectedNetwork, uri, sessionData)
        addRecentConnection(connectedAddress, selectedNetwork, sessionData)
      } else {
        saveSession(connectedAddress, selectedNetwork, uri)
        addRecentConnection(connectedAddress, selectedNetwork)
      }

    } catch (err: any) {
      setStatus('disconnected')
      setError(err.message || 'Failed to connect wallet')
      setPairingURI(null)
      throw err
    }
  }, [walletConnection, saveSession, addRecentConnection])

  const disconnect = (): void => {
    walletConnection.disconnect()
    setStatus('disconnected')
    setAddress(null)
    setBalance(0n)
    setPairingURI(null)
    setError(null)
    endSession()
  }

  const cancelConnection = (): void => {
    walletConnection.cancelWaitForWallet()
    setStatus('disconnected')
    setPairingURI(null)
    setError(null)
  }

  const attemptSessionRestore = useCallback(async (): Promise<boolean> => {
    if (!session || isSessionExpired()) {
      return false
    }

    if (!session.sessionId || !session.secret || !session.relayUrl || !session.version) {
      endSession()
      return false
    }

    try {
      setRestoringSession(true)
      setStatus('connecting')

      await walletConnection.initialize(session.network, {
        sessionId: session.sessionId,
        secret: session.secret,
        relayUrl: session.relayUrl,
        version: session.version
      })

      await new Promise(resolve => setTimeout(resolve, 500))

      const rejoined = await walletConnection.rejoinSession(5000)

      if (rejoined) {
        walletConnection.setConnectedAddress(session.address)
        setAddress(session.address)
        setNetwork(session.network)
        setStatus('connected')
        addRecentConnection(session.address, session.network)
        setRestoringSession(false)
        return true
      }

      setStatus('disconnected')
      endSession()
      setRestoringSession(false)
      return false
    } catch (err: any) {
      setStatus('disconnected')
      endSession()
      setRestoringSession(false)
      return false
    }
  }, [session, isSessionExpired, walletConnection, addRecentConnection, endSession])

  const switchToAccount = useCallback(async (targetAddress: string, targetNetwork: Network): Promise<boolean> => {
    if (address === targetAddress && network === targetNetwork) {
      return true
    }

    try {
      setSwitchingAccount(true)
      setStatus('connecting')
      setError(null)

      const targetConnection = recentConnections.find(conn => conn.address === targetAddress)

      if (!targetConnection) {
        throw new Error('Connection not found in recent connections')
      }

      if (targetConnection.sessionId && targetConnection.secret &&
          targetConnection.relayUrl && targetConnection.version) {
        await walletConnection.initialize(targetNetwork, {
          sessionId: targetConnection.sessionId,
          secret: targetConnection.secret,
          relayUrl: targetConnection.relayUrl,
          version: targetConnection.version
        })

        await new Promise(resolve => setTimeout(resolve, 500))

        const rejoined = await walletConnection.rejoinSession(5000)

        if (rejoined) {
          walletConnection.setConnectedAddress(targetAddress)
          setAddress(targetAddress)
          setNetwork(targetNetwork)
          setStatus('connected')

          saveSession(targetAddress, targetNetwork, undefined, {
            sessionId: targetConnection.sessionId,
            secret: targetConnection.secret,
            relayUrl: targetConnection.relayUrl,
            version: targetConnection.version
          })

          setSwitchingAccount(false)
          return true
        }
      }

      endSession()
      await connect(targetNetwork)
      setSwitchingAccount(false)
      return true
    } catch (err: any) {
      console.error('Failed to switch account:', err)
      setStatus('disconnected')
      setError(err.message)
      setSwitchingAccount(false)
      return false
    }
  }, [address, network, recentConnections, walletConnection, endSession, connect, saveSession])

  useEffect(() => {
    if (restoreAttemptedRef.current) {
      return
    }

    let cancelled = false

    const tryRestore = async () => {
      if (cancelled) return
      if (session && !isSessionExpired() && !restoringSession && status === 'disconnected') {
        restoreAttemptedRef.current = true
        await attemptSessionRestore()
      }
    }

    void tryRestore()

    return () => {
      cancelled = true
    }
  }, [])

  const value: WalletContextType = {
    status,
    address,
    balance,
    network,
    pairingURI,
    connect,
    disconnect,
    cancelConnection,
    switchToAccount,
    isConnected: status === 'connected',
    error,
    hasStoredSession: !!session && !isSessionExpired(),
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

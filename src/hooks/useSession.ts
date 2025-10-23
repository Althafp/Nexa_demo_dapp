import { useCallback } from 'react'
import { Network } from '@nexscript/nexscript'
import { useLocalStorage } from './useLocalStorage'
import { WalletSession, RecentConnection, STORAGE_KEYS } from '../types/storage'

const MAX_RECENT_CONNECTIONS = 10

export function useSession() {
  const [session, setSession, clearSession] = useLocalStorage<WalletSession | null>(
    STORAGE_KEYS.SESSION,
    null
  )

  const [recentConnections, setRecentConnections] = useLocalStorage<RecentConnection[]>(
    STORAGE_KEYS.RECENT_CONNECTIONS,
    []
  )

  const [pubkeys, setPubkeys] = useLocalStorage<Record<string, string>>(
    STORAGE_KEYS.PUBKEYS,
    {}
  )

  const saveSession = useCallback((
    address: string,
    network: Network,
    pairingURI?: string,
    sessionInfo?: { sessionId: string; secret: string; relayUrl: string; version: string }
  ) => {
    const newSession: WalletSession = {
      address,
      network,
      pairingURI,
      timestamp: Date.now(),
      ...(sessionInfo && {
        sessionId: sessionInfo.sessionId,
        secret: sessionInfo.secret,
        relayUrl: sessionInfo.relayUrl,
        version: sessionInfo.version
      })
    }
    setSession(newSession)
  }, [setSession])

  const updateSession = useCallback((updates: Partial<WalletSession>) => {
    if (!session) return
    setSession({ ...session, ...updates })
  }, [session, setSession])

  const endSession = useCallback(() => {
    clearSession()
  }, [clearSession])

  const addRecentConnection = useCallback((
    address: string,
    network: Network,
    sessionCredentials?: { sessionId: string; secret: string; relayUrl: string; version: string },
    nickname?: string
  ) => {
    const newConnection: RecentConnection = {
      address,
      network,
      nickname,
      lastConnected: Date.now(),
      ...(sessionCredentials && {
        sessionId: sessionCredentials.sessionId,
        secret: sessionCredentials.secret,
        relayUrl: sessionCredentials.relayUrl,
        version: sessionCredentials.version
      })
    }

    setRecentConnections((prev) => {
      const filtered = prev.filter((conn) => conn.address !== address)
      const updated = [newConnection, ...filtered]
      return updated.slice(0, MAX_RECENT_CONNECTIONS)
    })
  }, [setRecentConnections])

  const updateConnectionNickname = useCallback((address: string, nickname: string) => {
    setRecentConnections((prev) =>
      prev.map((conn) =>
        conn.address === address ? { ...conn, nickname } : conn
      )
    )
  }, [setRecentConnections])

  const removeRecentConnection = useCallback((address: string) => {
    setRecentConnections((prev) => prev.filter((conn) => conn.address !== address))
  }, [setRecentConnections])

  const clearRecentConnections = useCallback(() => {
    setRecentConnections([])
  }, [setRecentConnections])

  const savePubkey = useCallback((address: string, pubkey: string) => {
    setPubkeys((prev) => ({ ...prev, [address]: pubkey }))
  }, [setPubkeys])

  const getPubkey = useCallback((address: string): string | undefined => {
    return pubkeys[address]
  }, [pubkeys])

  const isSessionExpired = useCallback((): boolean => {
    if (!session) return true
    const twentyFourHours = 24 * 60 * 60 * 1000
    return Date.now() - session.timestamp > twentyFourHours
  }, [session])

  return {
    session,
    saveSession,
    updateSession,
    endSession,
    isSessionExpired,
    recentConnections,
    addRecentConnection,
    updateConnectionNickname,
    removeRecentConnection,
    clearRecentConnections,
    pubkeys,
    savePubkey,
    getPubkey,
  }
}

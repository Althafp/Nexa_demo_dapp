import { WalletProvider, type DAppInfo, type SessionDetails } from 'wallet-comms-sdk'
import { rostrumProvider } from 'nexa-wallet-sdk'
import { Network } from '@nexscript/nexscript'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

export interface WalletConnectionState {
  status: ConnectionStatus
  address: string | null
  balance: bigint
  network: Network
}

const RELAY_URL = 'wss://relay.otoplo.com'

const DAPP_INFO: DAppInfo = {
  name: 'Token Swap Demo',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://swap-demo.nexa.org',
  description: 'A simple demo showing wallet connectivity and token swaps',
  icon: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : ''
}

export class WalletConnection {
  private provider: WalletProvider | null = null
  private currentNetwork: Network = Network.MAINNET
  private connectedAddress: string | null = null
  private onStateChange?: (state: WalletConnectionState) => void

  constructor(network: Network = Network.MAINNET) {
    this.currentNetwork = network
  }

  getSessionInfo(): SessionDetails | null {
    if (this.provider) {
      return this.provider.getSessionInfo()
    }
    return null
  }

  async initialize(
    network: Network,
    sessionInfo?: { sessionId: string; secret: string; relayUrl: string; version: string }
  ): Promise<string> {
    if (this.provider) {
      this.provider.disconnect()
      this.provider = null
    }

    this.currentNetwork = network
    const networkStr = network === Network.MAINNET ? 'mainnet' : 'testnet'

    const rostrumParams = {
      scheme: 'wss' as const,
      host: network === Network.MAINNET ? 'electrum.nexa.org' : 'testnet-electrum.nexa.org',
      port: network === Network.MAINNET ? 20004 : 30004
    }
    await rostrumProvider.connect(networkStr, rostrumParams)

    if (sessionInfo) {
      this.provider = new WalletProvider(
        sessionInfo.relayUrl,
        DAPP_INFO,
        sessionInfo.version,
        sessionInfo.secret,
        sessionInfo.sessionId
      )
      await this.provider.connect()
    } else {
      this.provider = new WalletProvider(RELAY_URL, DAPP_INFO)
      await this.provider.connect()
      await this.provider.createSession()
    }

    this.setupEventHandlers()
    return this.provider.getPairingURI()
  }

  private setupEventHandlers(): void {
    if (!this.provider) return

    this.provider.onWalletJoin((address: string) => {
      this.connectedAddress = address
      this.notifyStateChange('connected', address)
    })

    this.provider.onPeerDisconnect(() => {
      this.connectedAddress = null
      this.notifyStateChange('disconnected', null)
    })

    this.provider.onClose(() => {
      this.connectedAddress = null
      this.notifyStateChange('disconnected', null)
    })

    this.provider.onSessionDelete(() => {
      this.connectedAddress = null
      this.notifyStateChange('disconnected', null)
    })
  }

  async waitForWallet(timeout: number = 60000): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized. Call initialize() first.')
    }

    const address = await this.provider.waitForWallet(timeout)
    this.connectedAddress = address
    return address
  }

  cancelWaitForWallet(): void {
    if (this.provider) {
      this.provider.cancelWaitForWallet()
    }
  }

  async rejoinSession(timeout: number = 10000): Promise<boolean> {
    if (!this.provider) {
      return false
    }
    try {
      const result = await this.provider.rejoinSession(timeout)
      return result
    } catch (error) {
      return false
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.provider || !this.connectedAddress) {
      throw new Error('No wallet connected')
    }
    return await this.provider.signMessage(this.connectedAddress, message)
  }

  async signAndBroadcast(unsignedTxHex: string): Promise<string> {
    if (!this.provider || !this.connectedAddress) {
      throw new Error('No wallet connected')
    }
    return await this.provider.signTransaction(this.connectedAddress, unsignedTxHex, true)
  }

  disconnect(): void {
    if (this.provider) {
      this.provider.disconnect()
      this.provider = null
    }
    this.connectedAddress = null
    rostrumProvider.disconnect()
    this.notifyStateChange('disconnected', null)
  }

  getConnectedAddress(): string | null {
    return this.connectedAddress
  }

  setConnectedAddress(address: string): void {
    this.connectedAddress = address
  }

  isConnected(): boolean {
    return this.connectedAddress !== null
  }

  getNetwork(): Network {
    return this.currentNetwork
  }

  onStateChangeCallback(callback: (state: WalletConnectionState) => void): void {
    this.onStateChange = callback
  }

  private notifyStateChange(status: ConnectionStatus, address: string | null): void {
    if (this.onStateChange) {
      this.onStateChange({
        status,
        address,
        balance: 0n,
        network: this.currentNetwork
      })
    }
  }

  getProvider(): WalletProvider | null {
    return this.provider
  }
}

let walletConnectionInstance: WalletConnection | null = null

export const getWalletConnection = (network?: Network): WalletConnection => {
  if (!walletConnectionInstance) {
    walletConnectionInstance = new WalletConnection(network || Network.TESTNET)
  }
  return walletConnectionInstance
}

export const resetWalletConnection = (): void => {
  if (walletConnectionInstance) {
    walletConnectionInstance.disconnect()
    walletConnectionInstance = null
  }
}

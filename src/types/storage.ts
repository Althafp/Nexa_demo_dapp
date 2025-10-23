import { Network } from '@nexscript/nexscript'

export interface WalletSession {
  address: string
  network: Network
  pairingURI?: string
  timestamp: number
  sessionId?: string
  secret?: string
  relayUrl?: string
  version?: string
}

export interface RecentConnection {
  address: string
  nickname?: string
  network: Network
  lastConnected: number
  sessionId?: string
  secret?: string
  relayUrl?: string
  version?: string
}

export interface SwapDemoStorage {
  session: WalletSession | null
  recentConnections: RecentConnection[]
  pubkeys: Record<string, string>
}

export const STORAGE_KEYS = {
  SESSION: 'swap-demo-session',
  RECENT_CONNECTIONS: 'swap-demo-recent-connections',
  PUBKEYS: 'swap-demo-pubkeys',
} as const

import React, { useState } from 'react'
import { Card, ListGroup, Button, Form, InputGroup, Badge } from 'react-bootstrap'
import { useSession } from '../hooks/useSession'
import { useWallet } from '../contexts/WalletContext'
import { Network } from '@nexscript/nexscript'

const AccountManagement: React.FC = () => {
  const { address, switchToAccount, network } = useWallet()
  const {
    recentConnections,
    updateConnectionNickname,
    removeRecentConnection,
    clearRecentConnections,
  } = useSession()
  const [editingAddress, setEditingAddress] = useState<string | null>(null)
  const [nicknameInput, setNicknameInput] = useState('')
  const [switchingTo, setSwitchingTo] = useState<string | null>(null)

  const handleEditNickname = (addr: string, currentNickname?: string) => {
    setEditingAddress(addr)
    setNicknameInput(currentNickname || '')
  }

  const handleSaveNickname = (addr: string) => {
    if (nicknameInput.trim()) {
      updateConnectionNickname(addr, nicknameInput.trim())
    }
    setEditingAddress(null)
    setNicknameInput('')
  }

  const handleCancelEdit = () => {
    setEditingAddress(null)
    setNicknameInput('')
  }

  const handleSwitchAccount = async (addr: string, accountNetwork: Network) => {
    if (addr === address) return

    setSwitchingTo(addr)
    try {
      await switchToAccount(addr, accountNetwork)
    } catch (err) {
      console.error('Failed to switch account:', err)
    } finally {
      setSwitchingTo(null)
    }
  }

  const formatAddress = (addr: string): string => {
    if (addr.length < 20) return addr
    return `${addr.slice(0, 12)}...${addr.slice(-8)}`
  }

  const getNetworkBadge = (net: Network) => {
    return net === Network.MAINNET ? 'success' : 'warning'
  }

  if (recentConnections.length === 0) {
    return null
  }

  return (
    <Card className="mt-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Recent Connections</h5>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={clearRecentConnections}
          >
            Clear History
          </Button>
        </div>

        <ListGroup variant="flush">
          {recentConnections.map((conn) => {
            const isCurrentAccount = conn.address === address
            const isEditing = editingAddress === conn.address

            return (
              <ListGroup.Item
                key={conn.address}
                className="px-0"
                style={{ backgroundColor: isCurrentAccount ? '#f0f8ff' : 'transparent' }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    {isEditing ? (
                      <InputGroup size="sm" className="mb-2" style={{ maxWidth: '300px' }}>
                        <Form.Control
                          type="text"
                          placeholder="Enter nickname..."
                          value={nicknameInput}
                          onChange={(e) => setNicknameInput(e.target.value)}
                          autoFocus
                        />
                        <Button
                          variant="success"
                          onClick={() => handleSaveNickname(conn.address)}
                        >
                          ✓
                        </Button>
                        <Button variant="secondary" onClick={handleCancelEdit}>
                          ✕
                        </Button>
                      </InputGroup>
                    ) : (
                      <div className="d-flex align-items-center gap-2 mb-1">
                        {conn.nickname && (
                          <strong style={{ fontSize: '0.95rem' }}>{conn.nickname}</strong>
                        )}
                        {isCurrentAccount && (
                          <Badge bg="primary" pill>
                            Current
                          </Badge>
                        )}
                        <Badge bg={getNetworkBadge(conn.network)} pill>
                          {conn.network === Network.MAINNET ? 'Mainnet' : 'Testnet'}
                        </Badge>
                      </div>
                    )}

                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        color: '#666',
                      }}
                    >
                      {formatAddress(conn.address)}
                    </div>

                    <small className="text-muted">
                      Last connected: {new Date(conn.lastConnected).toLocaleString()}
                    </small>
                  </div>

                  <div className="d-flex gap-1">
                    {!isEditing && (
                      <>
                        {!isCurrentAccount && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleSwitchAccount(conn.address, conn.network)}
                            disabled={switchingTo === conn.address}
                          >
                            {switchingTo === conn.address ? '⏳ Switching...' : 'Switch'}
                          </Button>
                        )}
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleEditNickname(conn.address, conn.nickname)}
                        >
                          {conn.nickname ? 'Edit' : 'Add'} Nickname
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeRecentConnection(conn.address)}
                        >
                          ✕
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </ListGroup.Item>
            )
          })}
        </ListGroup>
      </Card.Body>
    </Card>
  )
}

export default AccountManagement

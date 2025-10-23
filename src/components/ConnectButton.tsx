import React, { useState } from 'react'
import { Button, Dropdown } from 'react-bootstrap'
import { useWallet } from '../contexts/WalletContext'
import { Network } from '@nexscript/nexscript'
import PairingModal from './PairingModal'

interface ConnectButtonProps {
  network: Network
}

const ConnectButton: React.FC<ConnectButtonProps> = ({ network }) => {
  const { status, address, connect, disconnect, cancelConnection } = useWallet()
  const [showModal, setShowModal] = useState(false)

  const handleConnect = async () => {
    try {
      setShowModal(true)
      await connect(network)
      setShowModal(false)
    } catch (err) {
      setShowModal(false)
    }
  }

  const handleDisconnect = () => {
    if (status === 'connecting') {
      cancelConnection()
    } else {
      disconnect()
    }
    setShowModal(false)
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
    }
  }

  const formatAddress = (addr: string): string => {
    if (addr.length < 20) return addr
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
  }

  if (status === 'connected' && address) {
    return (
      <Dropdown align="end">
        <Dropdown.Toggle variant="success" size="sm" style={{ minWidth: '140px' }}>
          {formatAddress(address)}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={copyAddress}>
            📋 Copy Address
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={handleDisconnect} className="text-danger">
            🔌 Disconnect
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    )
  }

  if (status === 'connecting') {
    return (
      <>
        <Button
          variant="warning"
          size="sm"
          disabled
          style={{ minWidth: '140px' }}
        >
          ⏳ Connecting...
        </Button>
        <PairingModal
          show={showModal}
          onHide={() => setShowModal(false)}
          onDisconnect={handleDisconnect}
        />
      </>
    )
  }

  return (
    <Button
      variant="primary"
      size="sm"
      onClick={handleConnect}
      style={{ minWidth: '140px' }}
    >
      Connect Wallet
    </Button>
  )
}

export default ConnectButton

import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import QRCode from 'react-qr-code'
import { useWallet } from '../contexts/WalletContext'

interface PairingModalProps {
  show: boolean
  onHide: () => void
  onDisconnect: () => void
}

const PairingModal: React.FC<PairingModalProps> = ({ show, onHide, onDisconnect }) => {
  const { pairingURI } = useWallet()

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Connect Your Wallet</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center py-4">
        <p className="mb-4">
          Scan this QR code with your Nexa wallet app to connect
        </p>
        {pairingURI && (
          <div className="d-flex justify-content-center mb-4">
            <div style={{ background: 'white', padding: '16px', borderRadius: '8px' }}>
              <QRCode value={pairingURI} size={300} />
            </div>
          </div>
        )}
        {pairingURI && (<div>{pairingURI}</div>)}
        <p className="text-muted small">
          Waiting for wallet to connect...
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onDisconnect}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default PairingModal

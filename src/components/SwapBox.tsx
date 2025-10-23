import React, { useState } from 'react'
import { Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap'
import { useWallet } from '../contexts/WalletContext'
import { getWalletConnection } from '../services/WalletConnection'

interface SwapBoxProps {
  contractAddress: string
  tokenSymbol: string
  swapRate: number // tokens per 1000 sats
}

const SwapBox: React.FC<SwapBoxProps> = ({ contractAddress, tokenSymbol, swapRate }) => {
  const { isConnected, address } = useWallet()
  const [nexaAmount, setNexaAmount] = useState('')
  const [swapping, setSwapping] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const calculateTokenAmount = (sats: string): string => {
    if (!sats || isNaN(Number(sats))) return '0'
    const satoshis = Number(sats)
    const tokens = (satoshis / 1000) * swapRate
    return tokens.toFixed(2)
  }

  const handleSwap = async () => {
    if (!isConnected || !address || !nexaAmount) return

    const satoshis = Number(nexaAmount)
    if (satoshis < 1000) {
      setError('Minimum swap amount is 1000 satoshis')
      return
    }

    setSwapping(true)
    setError(null)
    setTxHash(null)

    try {
      // In a real implementation, you would:
      // 1. Build the transaction using the contract
      // 2. Get the unsigned transaction hex
      // 3. Sign it with the wallet
      // 4. Broadcast it

      const walletConnection = getWalletConnection()

      // Placeholder for unsigned transaction hex
      // This would come from your contract builder
      const unsignedTxHex = '...' // TODO: Build actual transaction

      // Sign and broadcast
      const result = await walletConnection.signAndBroadcast(unsignedTxHex)

      setTxHash(result)
      setNexaAmount('')
    } catch (err: any) {
      console.error('Swap failed:', err)
      setError(err.message || 'Failed to complete swap')
    } finally {
      setSwapping(false)
    }
  }

  return (
    <Card className="shadow-lg" style={{ maxWidth: '500px', margin: '0 auto' }}>
      <Card.Body className="p-4">
        <div className="text-center mb-4">
          <h2 className="mb-2">🔄 Token Swap</h2>
          <p className="text-muted">
            Swap NEXA for {tokenSymbol} tokens
          </p>
          <small className="text-muted">
            Rate: {swapRate} {tokenSymbol} per 1000 satoshis
          </small>
        </div>

        {!isConnected && (
          <Alert variant="info" className="mb-4">
            <Alert.Heading className="h6">Connect Your Wallet</Alert.Heading>
            <p className="mb-0 small">
              Please connect your wallet to start swapping tokens.
            </p>
          </Alert>
        )}

        <Form onSubmit={(e) => { e.preventDefault(); handleSwap(); }}>
          {/* NEXA Input */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">You Send</Form.Label>
            <InputGroup>
              <Form.Control
                type="number"
                placeholder="0"
                value={nexaAmount}
                onChange={(e) => setNexaAmount(e.target.value)}
                disabled={!isConnected || swapping}
                min="1000"
                step="1"
              />
              <InputGroup.Text>
                <span className="fw-bold">NEXA (sats)</span>
              </InputGroup.Text>
            </InputGroup>
            <Form.Text className="text-muted">
              Minimum: 1,000 satoshis
            </Form.Text>
          </Form.Group>

          {/* Swap Arrow */}
          <div className="text-center mb-3">
            <div style={{ fontSize: '1.5rem' }}>⬇️</div>
          </div>

          {/* Token Output (read-only) */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">You Receive</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                value={calculateTokenAmount(nexaAmount)}
                disabled
                readOnly
              />
              <InputGroup.Text>
                <span className="fw-bold">{tokenSymbol}</span>
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          {/* Swap Button */}
          <Button
            variant="primary"
            type="submit"
            className="w-100 py-3"
            disabled={!isConnected || !nexaAmount || swapping || Number(nexaAmount) < 1000}
            size="lg"
          >
            {swapping ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Swapping...
              </>
            ) : (
              '🔄 Swap Tokens'
            )}
          </Button>
        </Form>

        {/* Error Message */}
        {error && (
          <Alert variant="danger" className="mt-3 mb-0" dismissible onClose={() => setError(null)}>
            <small>{error}</small>
          </Alert>
        )}

        {/* Success Message */}
        {txHash && (
          <Alert variant="success" className="mt-3 mb-0">
            <Alert.Heading className="h6">✅ Swap Successful!</Alert.Heading>
            <p className="mb-0 small">
              Transaction: <code className="text-break">{txHash}</code>
            </p>
          </Alert>
        )}

        {/* Contract Info */}
        <div className="mt-4 pt-3 border-top">
          <small className="text-muted d-block mb-1">Contract Address:</small>
          <code className="small text-break">{contractAddress}</code>
        </div>
      </Card.Body>
    </Card>
  )
}

export default SwapBox

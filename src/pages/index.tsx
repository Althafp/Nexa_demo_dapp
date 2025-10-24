import React from 'react'
import { Container, Row, Col, Navbar, Card, Button } from 'react-bootstrap'
import { Network } from '@nexscript/nexscript'
import { WalletProvider } from '../contexts/WalletContext'
import ConnectButton from '../components/ConnectButton'
import SwapBox from '../components/SwapBox'
import AccountManagement from '../components/AccountManagement'
// Demo configuration
const CONTRACT_ADDRESS = 'nexa:nqtsq5g5sjkqk7wzd9wwh9423rr0tda7aqf5dfwf2qwfqwkp'
const TOKEN_SYMBOL = 'DEMO'
const SWAP_RATE = 100 // 100 DEMO tokens per 1000 sats

function App() {
  return (
    <WalletProvider initialNetwork={Network.TESTNET}>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        {/* Header */}
        <Navbar bg="dark" variant="dark" className="shadow-sm">
          <Container>
            <Navbar.Brand>
              <span style={{ fontSize: '1.5rem' }}>🔄</span>
              {' '}
              Token Swap Demo
            </Navbar.Brand>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-light" 
                size="sm"
                onClick={() => window.open('https://nexa-faucet.vercel.app/', '_blank')}
                style={{ fontSize: '0.875rem' }}
              >
                💧 Get Testnet NEXA
              </Button>
              <ConnectButton network={Network.TESTNET} />
            </div>
          </Container>
        </Navbar>

        {/* Main Content */}
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col lg={8}>
              {/* Info Card */}
              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <h4 className="mb-3">📚 About This Demo</h4>
                  <p className="mb-2">
                    This demo showcases a complete wallet integration with a simple token swap smart contract.
                  </p>
                  <p className="mb-2">
                    <strong>Features:</strong>
                  </p>
                  <ul className="mb-0">
                    <li>Connect wallet using WalletComms SDK</li>
                    <li>Session persistence (reconnects automatically on page reload)</li>
                    <li>Multi-account management with session switching</li>
                    <li>Account nicknames and connection history</li>
                    {/* <li>Simple token swap UI</li> */}
                  </ul>
                </Card.Body>
              </Card>

              {/* Swap Box */}
              <SwapBox
                contractAddress={CONTRACT_ADDRESS}
                tokenSymbol={TOKEN_SYMBOL}
                swapRate={SWAP_RATE}
              />

              {/* Account Management */}
              <AccountManagement />

              {/* Instructions */}
              <Card className="mt-4 shadow-sm">
                <Card.Body>
                  <h5 className="mb-3">🎓 Instructions for Students</h5>
                  <ol className="mb-0">
                    <li className="mb-2">
                      <strong>Get testnet tokens:</strong> Click "💧 Get Testnet NEXA" to claim 1000 tNEXA from the faucet
                    </li>
                    <li className="mb-2">
                      <strong>Connect your wallet:</strong> Click the "Connect Wallet" button in the top right
                    </li>
                    <li className="mb-2">
                      <strong>Scan the QR code:</strong> Use your Nexa mobile wallet to scan the pairing QR code
                    </li>
                    <li className="mb-2">
                      <strong>Enter swap amount:</strong> Enter the amount of NEXA (in satoshis) you want to swap
                    </li>
                    <li className="mb-2">
                      <strong>Execute swap:</strong> Click "Swap Tokens" to sign and broadcast the transaction
                    </li>
                    <li className="mb-0">
                      <strong>Try multiple accounts:</strong> Connect different wallet accounts and switch between them seamlessly
                    </li>
                  </ol>
                </Card.Body>
              </Card>

              {/* Technical Details */}
              <Card className="mt-4 shadow-sm bg-light">
                <Card.Body>
                  <h5 className="mb-3">⚙️ Technical Details</h5>
                  <div className="small">
                    <p className="mb-2">
                      <strong>Network:</strong> Testnet
                    </p>
                    <p className="mb-2">
                      <strong>Contract Address:</strong>
                      <br />
                      <code className="text-break">{CONTRACT_ADDRESS}</code>
                    </p>
                    <p className="mb-2">
                      <strong>Swap Rate:</strong> {SWAP_RATE} {TOKEN_SYMBOL} per 1,000 satoshis
                    </p>
                    <p className="mb-0">
                      <strong>Session Storage:</strong> LocalStorage with 24-hour expiry
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* Footer */}
        <footer className="text-center text-white py-4 mt-5">
          <Container>
            <p className="mb-0">
              Built with ❤️ using NexScript, wallet-comms-sdk, and React
            </p>
          </Container>
        </footer>
      </div>
    </WalletProvider>
  )
}

export default App

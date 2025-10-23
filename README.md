# Token Swap Demo

A complete educational demo showing wallet connectivity and smart contract interaction on Nexa blockchain.

## Features

### Wallet Connectivity
- **Connect with QR Code**: Scan with mobile wallet using WalletComms SDK
- **Session Persistence**: Automatic reconnection on page reload (24-hour sessions)
- **Multi-Account Support**: Connect multiple wallets and switch between them seamlessly
- **Account Nicknames**: Label your accounts for easy identification
- **Connection History**: View and manage up to 10 recent connections

### Token Swap
- Simple UI for swapping NEXA testnet coins for DEMO tokens
- Real-time calculation of token amounts
- Transaction signing through connected wallet
- Broadcasting to testnet

### Educational Purpose
This demo is designed to teach students:
1. How to integrate wallet connectivity into a dApp
2. Session management and persistence
3. Building transaction UIs
4. Smart contract interaction patterns
5. Multi-account handling

## Quick Start

```bash
# Install dependencies
cd demo
yarn install

# build (must use node version < 22. 22+ will break)
yarn build

# Start development server
yarn start
```

The app will open at `http://localhost:3000`

## Project Structure

```
demo/
├── src/
│   ├── components/          # React components
│   │   ├── App.tsx          # Main application
│   │   ├── ConnectButton.tsx    # Wallet connect button
│   │   ├── SwapBox.tsx          # Token swap interface
│   │   ├── AccountManagement.tsx # Account switcher
│   │   └── PairingModal.tsx     # QR code modal
│   ├── contexts/
│   │   └── WalletContext.tsx    # Wallet state management
│   ├── hooks/
│   │   ├── useSession.ts        # Session persistence
│   │   └── useLocalStorage.ts   # LocalStorage hook
│   ├── services/
│   │   └── WalletConnection.ts  # WalletProvider wrapper
│   ├── types/
│   │   └── storage.ts           # TypeScript interfaces
│   └── utils/
│       └── pubkeyExtraction.ts  # Public key recovery
├── public/
│   └── index.html
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

### 1. Wallet Connection Flow

```
User clicks "Connect Wallet"
  ↓
QR code displayed in modal
  ↓
User scans with mobile wallet
  ↓
Wallet joins session via relay
  ↓
Session credentials saved to localStorage
  ↓
Address displayed in header
```

### 2. Session Persistence

```
Page loads
  ↓
Check localStorage for saved session
  ↓
If found and not expired:
  - Restore session credentials
  - Rejoin existing relay session
  - Auto-connect without QR scan
  ↓
If not found or expired:
  - Show connect button
```

### 3. Multi-Account Switching

```
User clicks "Switch" on recent account
  ↓
Retrieve stored session credentials
  ↓
Initialize new WalletProvider with credentials
  ↓
Rejoin that account's session
  ↓
Instantly switch without re-pairing
```

## Configuration

Edit these values in `src/App.tsx`:

```typescript
const CONTRACT_ADDRESS = 'nexa:nqtsq...' // Your contract address
const TOKEN_SYMBOL = 'DEMO'              // Token symbol
const SWAP_RATE = 100                    // Tokens per 1000 sats
```

## Dependencies

- **React 18** - UI framework
- **React Bootstrap** - UI components
- **@nexscript/nexscript** - NexScript SDK
- **wallet-comms-sdk** - Wallet communication protocol
- **nexa-wallet-sdk** - Nexa utilities
- **libnexa-ts** - Cryptographic operations
- **react-qr-code** - QR code generation

## Demo Contract

The demo uses a simple token swap contract (not included in this repo). The contract should:
- Accept NEXA input
- Calculate token amount based on swap rate
- Send tokens to user's address
- Keep NEXA in contract as liquidity

## For Students

### Learning Objectives

1. **Understand wallet connectivity**
   - How dApps communicate with wallets
   - QR code pairing process
   - Session management

2. **Master session persistence**
   - Why persistence matters for UX
   - How to store session credentials securely
   - Session expiry and cleanup

3. **Handle multiple accounts**
   - Why users need multi-account support
   - How to switch between sessions
   - Managing connection history

4. **Build transaction UIs**
   - Input validation
   - Amount calculations
   - Transaction signing flow
   - Error handling

### Try These Exercises

1. **Add a feature**: Implement transaction history tracking
2. **Improve UX**: Add loading animations
3. **Extend functionality**: Add support for multiple token types
4. **Test edge cases**: Handle network errors gracefully

## Troubleshooting

**QR code won't scan?**
- Ensure your wallet app is updated
- Check you're on testnet
- Try refreshing the page

**Session won't restore?**
- Check if session expired (24 hours)
- Clear localStorage and reconnect
- Verify wallet is still connected to relay

**Can't switch accounts?**
- Ensure both accounts have active sessions
- Try reconnecting the account manually
- Check browser console for errors

## Production Checklist

Before deploying to production:

- [ ] Replace testnet with mainnet
- [ ] Update contract address
- [ ] Add proper error boundaries
- [ ] Implement analytics
- [ ] Add rate limiting
- [ ] Secure API endpoints (if any)
- [ ] Test on multiple devices
- [ ] Add loading states everywhere
- [ ] Implement proper logging
- [ ] Add user feedback mechanisms

## License

MIT - Feel free to use for educational purposes

## Questions?

This is a learning resource. Experiment, break things, and learn!

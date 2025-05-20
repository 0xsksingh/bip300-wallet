# BIP300 Wallet

A cross-platform multi-chain wallet for Bitcoin and BIP300 sidechains.

## Features

- Multi-platform support (iOS, Android, Web)
- Bitcoin mainnet, testnet, and regtest support
- BIP300 sidechain support:
  - Thunder: High performance large block sidechain
  - zSide: Zero-knowledge privacy sidechain
  - BitNames: Username management sidechain
  - BitAssets: NFT and token management sidechain
- Bitcoin-native asset support via Rebar Labs API:
  - Ordinals: View and manage inscriptions with rarity information
  - BRC-20: Track fungible token balances and transfers
  - Runes: View and manage Rune balances
- SPV wallet with Electrum server connectivity
- HD wallet with BIP39 mnemonic support
- BIP300 sidechain deposit (M5) and withdrawal (M6) transactions
- Secure key storage with device keychain
- Transaction history tracking

## Architecture

The BIP300 wallet is built with the following technologies:

- **React Native** and **Expo** for cross-platform development
- **TypeScript** for type safety
- **Bitcoin.js** for Bitcoin transaction creation and signing
- **React Navigation** for navigation
- **React Native Paper** for UI components
- **React Native Keychain** for secure key storage
- **BIP39** for mnemonic generation and validation
- **Rebar Labs API** for Bitcoin-native asset data

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

## Project Structure

- `/app` - Expo Router pages and navigation
- `/components` - Reusable UI components
- `/services` - Business logic and API services
  - `electrum.ts` - SPV wallet functionality using Electrum servers
  - `bip300.ts` - BIP300 sidechain interaction logic
  - `wallet.ts` - Wallet management service
  - `rebarLabs.ts` - Integration with Rebar Labs API for Bitcoin-native assets
- `/types` - TypeScript type definitions
- `/constants` - Application constants
- `/hooks` - Custom React hooks
- `/assets` - Static assets like images and fonts

## BIP300 Background

[BIP300](https://bips.xyz/300) is a Bitcoin Improvement Proposal that enables a new type of Layer 2 solution, where "withdrawals" (L2-to-L1 transactions) are governed by proof-of-work instead of a federation or fixed set of pubkeys.

The key concepts in BIP300 are:
1. **Hashrate Escrows**: Bitcoin miners collectively hold sidechain funds in escrow
2. **Blind Merged Mining**: Allows sidechain to inherit Bitcoin's security
3. **Two-way Peg**: Enable moving bitcoins from mainchain to sidechain and back
4. **Withdrawal Bundles**: A batch of withdrawal requests validated by miners

## Bitcoin-Native Assets

The wallet integrates with the Rebar Labs API to provide support for Bitcoin-native assets:

### Ordinals

[Ordinals](https://docs.ordinals.com/) are NFTs on Bitcoin, assigning unique identities to individual satoshis. The wallet allows you to:
- View your inscriptions with details like sat rarity and content type
- Browse inscription content
- Track inscription transfers

### BRC-20

BRC-20 is a fungible token standard for Bitcoin built on top of Ordinals. The wallet enables you to:
- View BRC-20 token balances
- Track available and transferrable balances
- Monitor token minting and transfers

### Runes

[Runes](https://runesprotocol.org/) is a Bitcoin-native fungible token protocol. The wallet supports:
- Viewing Rune balances
- Tracking Rune transfers
- Monitoring Rune etching events

## Sidechain Operations

### Deposit (M5)
To deposit funds to a sidechain:
1. Select a sidechain from the sidechains tab
2. Enter the amount to deposit
3. Confirm the transaction

### Withdrawal (M6)
Withdrawals require confirmation from miners:
1. First, a withdrawal bundle is created on the sidechain
2. Miners "ACK" the bundle by including a reference in their coinbase transaction
3. After sufficient ACKs (~13,150, roughly 3 months), the withdrawal can be executed
4. The wallet will monitor withdrawal bundles and notify when they're ready

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Development

This project was created as part of the BitcoinLayerTwo Hackathon challenge to build applications using BIP300 sidechains.

## Credits

Developed based on the work of LayerTwo Labs and Paul Sztorc, the creator of BIP300/301.
Integration with Bitcoin-native assets powered by the [Rebar Labs API](https://rebarlabs.io/).

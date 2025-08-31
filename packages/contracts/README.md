# 🚀 CrypteK Smart Contracts

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

## 📋 CrypteK Contracts

This project contains the smart contracts for CrypteK - a decentralized chat platform with tipping functionality.

### Contracts Overview

#### Core Contracts (`src/cryptic/`)
- **ProfileRegistry**: User profile management with ENS integration
- **ChatRegistry**: Group chat creation and management
- **MessageCommit**: Message storage with IPFS integration
- **TipRouter**: ERC20 tipping system

#### Zama FHE Contracts (`contracts/zama/`)
- **EncryptedMessageVault**: Privacy-preserving message storage
- **PrivateTipVault**: Confidential tipping with homomorphic encryption

#### Lisk Contracts (`contracts/lisk/`)
- **TipRouter**: Tipping system optimized for Lisk network

## 🔧 Setup & Installation

### Prerequisites
```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install
```

### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit with your keys (NEVER commit .env!)
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_key
```

## 🚀 Deployment

### Quick Deploy (Recommended)
```bash
# Interactive deployment script
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment

#### Local Testing
```bash
# Start local node
anvil

# Deploy contracts
forge script script/Deploy.s.sol --fork-url http://localhost:8545 --broadcast
```

#### Testnet Deployment
```bash
# Sepolia
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify

# Lisk Sepolia
forge script script/Deploy.s.sol --rpc-url lisk_sepolia --broadcast --verify
```

## 🧪 Testing & Development

### Build
```shell
$ forge build
```

### Test
```shell
$ forge test
```

### Format
```shell
$ forge fmt
```

### Gas Snapshots
```shell
$ forge snapshot
```

## 🛠️ Advanced Usage

### Anvil (Local Node)
```shell
$ anvil
```

### Deploy Script
```shell
$ forge script script/Deploy.s.sol --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast (Contract Interaction)
```shell
$ cast <subcommand>
```

## 📚 Documentation

- [Foundry Book](https://book.getfoundry.sh/)
- [CrypteK Architecture](../README.md)

## 🆘 Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```

## 🔒 Security Notes

- Never commit `.env` files
- Use dedicated deployment wallets
- Test thoroughly on testnets before mainnet
- Keep sufficient funds for gas fees

---

**Happy coding with CrypteK! 🚀**

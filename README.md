# 🔥 Tanden Power Meter | 丹田パワー測定器

> A Web3 dApp that measures and records your "Tanden Power" (core energy) on the Ethereum blockchain — mint NFTs and earn tokens as proof of your training.
>
> 丹田の力をブロックチェーンに刻み、NFTとトークンで証明するWeb3 dAppです。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Network](https://img.shields.io/badge/network-Sepolia%20Testnet-orange.svg)
![Built with](https://img.shields.io/badge/built%20with-Scaffold--ETH%202-blueviolet.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![Solidity](https://img.shields.io/badge/Solidity-0.8.x-363636.svg)

---

## 🌐 Live Demo

**▶ [https://tanden-dapp-nextjs.vercel.app](https://tanden-dapp-nextjs.vercel.app)**

> Connect MetaMask to **Sepolia Testnet** to try it out!
> MetaMaskを **Sepoliaテストネット** に接続してお試しください！

---

## ✨ Features | 機能

| Feature | Description |
|---|---|
| 🔥 **Power Measurement** | Record your Tanden Power (0–100%) on-chain |
| 🏆 **NFT Minting** | Reach 100% to mint a "Tanden Master" NFT |
| 🪙 **Token Rewards** | Earn TDN tokens for every training session |
| 📊 **Score Tracking** | Cumulative score recorded on the blockchain |
| 🔐 **Wallet Integration** | Connect via MetaMask / RainbowKit |

---

## 🛠 Tech Stack | 技術スタック

### Smart Contracts
| Contract | Address (Sepolia) |
|---|---|
| `TandenBank` | `0x489CFa5FeE93a96782E95558fCFc19486605455D` |

### Frontend & Infrastructure
```
Framework   : Next.js 15 (App Router)
Web3        : Wagmi v2 + Viem + RainbowKit
Scaffold    : Scaffold-ETH 2
Language    : TypeScript
Styling     : Tailwind CSS + DaisyUI
Deploy      : Vercel
```

### Blockchain
```
Network     : Ethereum Sepolia Testnet
Language    : Solidity ^0.8.x
Token       : ERC-20 (TDN Token)
NFT         : ERC-721 (Tanden Master NFT)
```

---

## 🚀 Getting Started | ローカル起動手順

### Prerequisites
- Node.js >= v20.18.3
- Yarn v1 or v2+
- Git
- MetaMask (browser extension)

### Installation

```bash
# Clone the repository
git clone https://github.com/kognavi/tanden-dapp.git
cd tanden-dapp

# Install dependencies
yarn install
```

### Run locally

```bash
# Terminal 1: Start local blockchain
yarn chain

# Terminal 2: Deploy contracts
yarn deploy

# Terminal 3: Start frontend
yarn start
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 📖 How to Use | 使い方

```
1. Connect MetaMask to Sepolia Testnet
   MetaMaskをSepoliaテストネットに接続

2. Click "丹田パワーを測定する！" button
   ボタンを押して丹田パワーを測定

3. Power reaches 100% → NFT is minted automatically!
   パワーが100%に達するとNFTが自動ミント！

4. Earn TDN tokens for each session
   セッションごとにTDNトークンを獲得
```

---

## 🔗 Contract Details | コントラクト詳細

- **Network:** Ethereum Sepolia Testnet
- **Contract Address:** `0x489CFa5FeE93a96782E95558fCFc19486605455D`
- **Explorer:** [View on Etherscan](https://sepolia.etherscan.io/address/0x489CFa5FeE93a96782E95558fCFc19486605455D)

---

## 🗺 Roadmap | 今後の展望

- [ ] Mainnet deployment
- [ ] Leaderboard (ranking system)
- [ ] AI Agent integration for training advice
- [ ] Mobile app (React Native)
- [ ] DAO governance for Tanden Masters

---

## 👤 Author | 作者

**kognavi**
- GitHub: [@kognavi](https://github.com/kognavi)
- Built as a Web3 portfolio project | Web3ポートフォリオとして開発

---

## 📄 License

MIT License © 2026 kognavi
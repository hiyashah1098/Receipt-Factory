<div align="center">

# 🏭 Receipt Factory

### *Your Golden Ticket to Consumer Protection*

[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-11-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini_2.5-Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

<br/>

<img src="assets/images/icon.png" alt="Receipt Factory Logo" width="180"/>

<br/>

**AI-powered receipt analysis that protects your wallet.**  
*Detect hidden fees • Split bills fairly • Track warranties • Fight for refunds*

<br/>

[Getting Started](#-getting-started) •
[Features](#-features) •
[Tech Stack](#-tech-stack) •
[Contributing](#-contributing)

---

</div>

## 🎪 The Problem

> *"Where did all my money go?"*

Hidden fees cost consumers **millions of dollars** every year. Service charges appear out of nowhere. Automatic gratuities lead to accidental double-tipping. Inflated "original prices" make fake discounts look real. And when something goes wrong? Good luck finding that receipt.

**Receipt Factory changes everything.**

<br/>

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔍 Golden Scan
Snap a photo of any receipt. Our AI instantly detects:
- Hidden service charges
- Automatic gratuities
- **Double-tip warnings** (bold red alert!)
- Suspicious line items

</td>
<td width="50%">

### 🧑‍🤝‍🧑 Fizzy Split
Split bills using natural language:
> *"Sam pays for appetizers, Alex didn't drink"*

AI handles proportional tax & tip distribution automatically.

</td>
</tr>
<tr>
<td width="50%">

### 📊 Rip-Off Score
Compare prices against US market averages.
- **Score 1-10** rating system
- Highlights overpriced items
- Powered by real-time data

</td>
<td width="50%">

### ⏰ WonkaVision
Never miss a return window again:
- Categorizes durables vs consumables
- **48-hour** advance notifications
- Automatic deadline tracking

</td>
</tr>
<tr>
<td width="50%">

### 🎫 Golden Ticket Reminders
Your warranty guardian:
- Return deadline alerts
- Warranty expiration tracking
- Important receipt event reminders

</td>
<td width="50%">

### 🏦 Receipt Vault
Secure, organized storage:
- Cloud-synced receipts
- Full-text search
- Easy retrieval for disputes

</td>
</tr>
<tr>
<td colspan="2" align="center">

### 👩‍⚖️ The Loompa Legal Team
*AI-powered consumer advocacy*

Generates perfectly worded dispute emails and SMS messages for refunds when hidden fees, double-tips, or expired items are detected. Your personal consumer protection assistant.

</td>
</tr>
</table>

<br/>

## 🛠 Tech Stack

<div align="center">

| Layer | Technology |
|:---:|:---|
| 📱 **Frontend** | React Native 0.81 + Expo 54 |
| 🧭 **Navigation** | Expo Router (file-based) |
| 🔥 **Backend** | Firebase Auth, Firestore, Storage |
| 🤖 **AI Engine** | Google Gemini 2.5 Flash |
| 📸 **Camera** | expo-camera with custom overlay |
| 🔔 **Notifications** | expo-notifications |
| ✨ **Animations** | Lottie + React Native Reanimated |

</div>

<br/>

## 🚀 Getting Started

### Prerequisites

```
Node.js 18+
Expo CLI
iOS Simulator / Android Emulator / Physical Device
```

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/Receipt-Factory.git
cd Receipt-Factory

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your API keys to .env

# Start development server
npx expo start
```

### Running the App

| Platform | Command |
|:---:|:---|
| 📱 **Expo Go** | Scan QR code with your device |
| 🤖 **Android** | Press `a` in terminal |
| 🍎 **iOS** | Press `i` in terminal |
| 🌐 **Web** | Press `w` in terminal |

<br/>

## 📁 Project Structure

```
Receipt-Factory/
├── 📂 app/                      # Expo Router screens
│   ├── 📂 (tabs)/               # Tab navigation
│   │   ├── index.tsx            # 🏠 Home dashboard
│   │   ├── scan.tsx             # 📸 Camera scanning
│   │   ├── split.tsx            # 💰 Bill splitting
│   │   └── alerts.tsx           # 🔔 Warranty tracking
│   ├── (auth)/                  # 🔐 Authentication
│   ├── results.tsx              # 📊 Analysis results
│   └── dispute.tsx              # ⚖️ Dispute generation
│
├── 📂 src/
│   ├── 📂 components/           # Reusable UI
│   │   ├── GoldenTicketAnimation.tsx
│   │   ├── RipOffScore.tsx
│   │   ├── BillSplitCard.tsx
│   │   └── WarningBanner.tsx
│   │
│   ├── 📂 services/             # API integrations
│   │   ├── firebaseSetup.ts
│   │   ├── geminiVision.ts
│   │   └── receiptService.ts
│   │
│   └── 📂 utils/                # Helpers
│       ├── mathSplits.ts
│       └── notifications.ts
│
└── 📂 assets/                   # Images & animations
```

<br/>

## 🔒 Privacy & Security

<div align="center">

| | |
|:---:|:---|
| 🔐 | **On-device scheduling** for all notifications |
| 🚫 | **No financial data** stored on external servers without consent |
| 🛡️ | **Firebase Auth** with secure token management |
| 📱 | **Local-first** architecture for sensitive operations |

</div>

<br/>

## 🤝 Contributing

We welcome contributions! Here's how to get started:

```bash
# Fork & clone
git clone https://github.com/YOUR_USERNAME/Receipt-Factory.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make your changes & commit
git commit -m "Add amazing feature"

# Push & create PR
git push origin feature/amazing-feature
```

<br/>

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

<br/>

---

<div align="center">

### 🏭 Built with ❤️ for **Hacklytics 2026: Golden Byte**

<br/>

*"Come with me, and you'll be, in a world of pure financial transparency"*

<br/>

[![Made with Expo](https://img.shields.io/badge/Made_with-Expo-4630EB?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![Powered by Gemini](https://img.shields.io/badge/Powered_by-Gemini_AI-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)

</div>

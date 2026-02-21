
# 🍫 Receipt Factory

## Why Receipt Factory Matters

Recent events like the Ashley Furniture Class Action Lawsuit highlight the need for consumer protection against deceptive pricing and false advertising. Ashley Furniture displayed inflated "original" prices to create the illusion of discounts, resulting in a $750,000 settlement. Many consumers are unaware when receipts list prices at least 10% higher than the actual invoice price, creating a false perception of savings.

**Receipt Factory** was built to address these issues. Standard banking apps only log totals, but Receipt Factory audits your receipts like a lawyer. Using Google Gemini, it analyzes every line item to find mistakes, hidden fees, and overcharges that most apps miss. This empowers consumers to:
- Detect deceptive pricing and hidden fees
- Receive timely reminders for returns and warranties
- Split bills fairly and transparently
- Advocate for refunds and dispute unfair charges
- Track and organize receipts for legal and financial protection

## Project Overview

Receipt Factory is a web and mobile app designed for real-world consumer protection. Each feature is crafted to solve a specific problem:

- **Golden Scan:** Finds hidden fees and double-tipping risks, protecting you from overpaying.
- **Fizzy Split:** Makes bill splitting easy and fair, handling complex scenarios and ensuring everyone pays their share.
- **Oompa Loompa Price Check:** Flags overpriced items and gives a Rip-off Score, so you know when you're being overcharged.
- **Wonkavision:** Tracks warranty and return deadlines, sending reminders before you lose the chance to return or claim.
- **Golden Ticket Reminder System:** Ensures you never miss important receipt events, like warranty expiration or return windows.
- **Receipt Vault:** Organizes and secures your receipts, making them easy to find for returns, warranties, or disputes.
- **Loompa Legal Team:** Generates professional refund requests and dispute messages, helping you advocate for your rights.
- **Alerts & Notifications:** Keeps you informed about all receipt-related events, customizable to your needs.
- **WonkaVision AI:** Uses advanced vision AI to analyze receipts, detect mistakes, and automate bill splitting.
- **Instant Advocate:** Provides AI-powered support for consumer disputes and refund requests.
- **Golden Ticket Animation:** Adds fun and motivation to your savings journey.

Receipt Factory is more than an expense tracker—it's your personal consumer protection toolkit.


## ✨ Features

### 🔍 Golden Scan
Automatically detects hidden fees, service charges, and automatic gratuities. Shows a **bold RED warning** if you're about to double-tip!

### 🧑‍🤝‍🧑 Fizzy Split
Describe how to split the bill in natural language. The AI handles proportional tax and tip distribution, and can accommodate custom rules (e.g., "Sam pays for apps, Alex didn't drink alcohol").

### 📈 Oompa Loompa Price Check
Compares receipt prices against US market averages and gives you a "Rip-off Score" (1-10). Highlights items that are abnormally expensive.

### ⏰ Wonkavision
Categorizes durable goods vs consumables and schedules push notifications **48 hours before** return deadlines expire.

### 🏆 Golden Ticket Reminder System
Tracks warranty dates, return deadlines, and sends reminders for important receipt events. Never miss a return window or warranty expiration.

### 🏦 Receipt Vault
Securely stores and organizes all your scanned receipts, making them searchable and easy to retrieve for returns, warranties, or expense tracking.

### 👩‍⚖️ The Loompa Legal Team
Generates perfectly worded emails or SMS to merchants for refunds if hidden fees, double-tips, or expired items are detected. AI-powered consumer advocacy for disputes and refund requests.

### 🛡️ Oompa Loompa Price Check
Checks prices against market averages and flags rip-offs. Provides a "Rip-off Score" and highlights overpriced items.

### 🔔 Alerts & Notifications
Push notifications for warranty, return, and split reminders. Customizable alert settings.

### 🪄 WonkaVision AI
Uses Google Gemini 2.5 Flash vision to analyze receipts, detect mistakes, and automate bill splitting.

### 🎫 Golden Ticket Animation
Fun, animated feedback for special events and achievements in the app.

### And More!
Continuous updates and new features for smarter receipt management.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator / Physical Device

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Receipt-Factory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   The `.env` file is already configured with API keys. For production, replace with your own:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your device**
   - Scan the QR code with Expo Go (iOS/Android)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator

## 📁 Project Structure

```
Receipt-Factory/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation
│   │   ├── index.tsx        # Home screen
│   │   ├── scan.tsx         # Camera receipt scanning
│   │   ├── split.tsx        # Bill splitting
│   │   └── alerts.tsx       # Warranty/return tracking
│   ├── results.tsx          # Analysis results screen
│   └── _layout.tsx          # Root layout
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── WarningBanner.tsx
│   │   ├── ReceiptCard.tsx
│   │   ├── CameraOverlay.tsx
│   │   ├── RipOffScore.tsx
│   │   ├── BillSplitCard.tsx
│   │   └── WarrantyItemCard.tsx
│   ├── services/            # API integrations
│   │   ├── firebaseSetup.ts # Firebase configuration
│   │   └── geminiVision.ts  # Gemini AI API calls
│   └── utils/               # Helper functions
│       ├── mathSplits.ts    # Bill splitting calculations
│       ├── dateFormatting.ts # Date utilities
│       └── notifications.ts  # Push notification handling
└── .env                     # Environment variables
```

## 🛠 Tech Stack

- **Framework:** React Native with Expo
- **Navigation:** Expo Router (file-based)
- **Camera:** expo-camera
- **Notifications:** expo-notifications
- **Backend:** Firebase (Auth, Firestore, Storage)
- **AI Engine:** Google Gemini 2.5 Flash (REST API)

## 🤖 Gemini API Integration

All AI calls use direct REST fetch to avoid Node module polyfill issues:

```typescript
const response = await fetch(
  `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ inline_data: { ... } }, { text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    })
  }
);
```

## 📱 Screenshots

| Home | Scan | Split | Alerts |
|------|------|-------|--------|
| Dashboard with recent scans | Camera with overlay | Natural language splitting | Warranty tracking |

## 🔒 Privacy

Receipt Factory analyzes receipts using cloud AI but **never stores** your financial data on external servers without consent. All notification scheduling happens on-device.

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ for Hacklytics 2026: Golden Byte

# 🍫 Receipt Factory

**Your Golden Ticket to Savings.** Unlike standard expense trackers that just log totals, Receipt Factory uses Google's Gemini 2.5 Flash vision capabilities to analyze line items, find mistakes, detect hidden fees, split complex bills, and track warranty dates.

## ✨ Features

### 🔍 Golden Scan
Automatically detects hidden fees, service charges, and automatic gratuities. Shows a **bold RED warning** if you're about to double-tip!

### 🧑‍🤝‍🧑 Fizzy Split
Simply describe how to split the bill: *"Split between me, Alex, and Sam. Alex didn't drink alcohol, Sam pays for apps."* The AI handles the rest, including proportional tax and tip distribution.

### 📈 Oompa Loompa Price Check
Compares your receipt prices against typical US market averages and gives you a "Rip-off Score" (1-10). Highlights items that are abnormally expensive.

### ⏰ Wonkavision
Automatically categorizes durable goods (electronics, clothing) vs consumables (food). Schedules push notifications **48 hours before** return deadlines expire.

### The Loompa Legal Team
Generates a perfectly worded email or SMS to the merchant's consumer service requesting a refund if a hidden fee, double-tip or expired item sold is detected.

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

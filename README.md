# 💰 ExpenseTracker AI

A modern, AI-powered expense tracking web application built with Next.js 15, featuring intelligent categorization, real-time analytics, and personalized financial insights.

![ExpenseTracker AI](https://img.shields.io/badge/Next.js-15.3.5-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🤖 AI-Powered Intelligence

- **Smart Categorization**: AI automatically suggests expense categories based on descriptions
- **Financial Insights**: Personalized recommendations and spending pattern analysis
- **Interactive AI Chat**: Get detailed explanations and advice for any insight
- **AI Financial Assistant**: Comprehensive chat interface with goal-based prompts for budget planning, debt management, investment advice, and more

### 💼 Core Functionality

- **Expense Tracking**: Add, edit, and delete expenses with ease
- **Real-time Charts**: Beautiful visualizations using Chart.js
- **Statistics Dashboard**: Comprehensive spending analytics
- **Expense History**: Complete transaction history with search and filter

### 🎨 Modern UI/UX

- **Light & Dark Mode**: Seamless theme switching with smooth transitions
- **Fully Responsive**: Optimized for all screen sizes
- **Beautiful Animations**: Smooth interactions and hover effects
- **Gradient Designs**: Modern card layouts with backdrop blur effects

### 📈 Market Data & News

- **Stock Market Tracking**: Real-time prices for Indian stocks (BSE/NSE)
- **Cryptocurrency Prices**: Live crypto market data with price changes
- **Financial News**: Latest market updates and financial news
- **Search Functionality**: Find specific stocks and cryptocurrencies

### 🔐 Authentication & Security

- **Multiple Login Options**: Google, GitHub, Facebook, or email/password
- **Secure Sessions**: Managed by Clerk authentication
- **User Profiles**: Personalized dashboards with user information

## 🛠️ Tech Stack

### Frontend

- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[React 19](https://react.dev)** - Latest React with concurrent features
- **[TypeScript](https://typescriptlang.org)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[Chart.js](https://chartjs.org)** - Beautiful charts and visualizations

### Backend & Database

- **[Neon](https://get.neon.com/0pFcBSF)** - Serverless PostgreSQL database
- **[Prisma](https://prisma.io)** - Type-safe database ORM
- **Server Actions** - Direct server functions in Next.js

### AI & Authentication

- **[Google Gemini](https://ai.google.dev)** - Advanced AI for financial analysis and chat
- **[Clerk](https://go.clerk.com/WSe7K8F)** - Complete authentication solution
- **Context-Aware AI** - Personalized responses based on user profile

### Market Data & APIs

- **[Twelve Data](https://twelvedata.com)** - Real-time stock market and cryptocurrency data
- **[NewsAPI](https://newsapi.org)** - Financial news aggregation (optional)

### Deployment

- **[Vercel](https://vercel.com)** - Serverless deployment platform

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sahandghavidel/next-expense-tracker-ai.git
   cd next-expense-tracker-ai
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="your-neon-database-url"

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
   CLERK_SECRET_KEY="your-clerk-secret-key"
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
   NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"

   # AI Features (Gemini API)
   GEMINI_API_KEY="your-gemini-api-key"

   # Stock Market & Crypto Data
   TWELVE_DATA_API_KEY="your-twelve-data-api-key"

   # Financial News (Optional)
   NEWS_API_KEY="your-news-api-key"

   # App URL
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

The application uses a simple yet effective database schema:

- **User**: Stores user information from Clerk
- **Record**: Stores expense transactions with categories and amounts

View the complete database diagram: [Eraser Diagram](https://app.eraser.io/workspace/XhlJP6Rdmx6nrGR0SpKz?origin=share)

## 🎯 Key Features Walkthrough

### 1. Smart Expense Adding

- Enter description, date, and amount
- Click the ✨ button for AI category suggestions
- Manual category selection from predefined options

### 2. AI Insights Dashboard

- Real-time spending pattern analysis
- Categorized insights: warnings, tips, success, info
- Interactive expandable AI explanations
- Confidence scores for each insight

### 3. Visual Analytics

- Interactive Chart.js charts
- Daily, weekly, and monthly views
- Color-coded spending categories
- Responsive design for all devices

### 4. Expense Management

- Complete transaction history
- Search and filter capabilities
- One-click expense deletion
- Real-time updates across all components

### 5. AI Financial Assistant

- Personalized chat interface with user profile integration
- Goal-based financial planning prompts
- Context-aware responses based on user's financial situation
- Conversation history and memory

### 6. Stock Market & Crypto Analysis

- Real-time Indian stock prices (BSE/NSE)
- Live cryptocurrency data
- AI-powered stock analysis with buy/sell/hold recommendations
- Direct integration with [Groww](https://groww.in/) for trading
- Technical analysis with confidence scores

## 🌐 Deployment

### Deploy on Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**
2. **Add environment variables in Vercel dashboard**
3. **Deploy automatically on every push to main branch**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sahandghavidel/next-expense-tracker-ai)

## 🚀 Quick Setup Guide

### 1. Clone and Install
```bash
git clone https://github.com/yourusername/next-expense-tracker-ai.git
cd next-expense-tracker-ai
npm install
```

### 2. Environment Setup
```bash
# Copy the environment template
cp env.template .env.local

# Edit .env.local with your API keys
nano .env.local
```

### 3. Required API Keys

#### Google Gemini API (Required)
- Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- Add to `.env.local` as `GEMINI_API_KEY`

#### Twelve Data API (Required for Stock Market)
- Visit [Twelve Data](https://twelvedata.com/pricing)
- Sign up for free account (800 requests/day)
- Add to `.env.local` as `TWELVE_DATA_API_KEY`

#### Clerk Authentication (Required)
- Visit [Clerk Dashboard](https://dashboard.clerk.com/)
- Create new application
- Add keys to `.env.local`

### 4. Database Setup (Optional - Skip for now)
```bash
# Only run when you have DATABASE_URL configured
npx prisma generate
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

### 6. Open Application
Navigate to [http://localhost:3000](http://localhost:3000)

## 📎 Useful Links

- **[Neon Database](https://get.neon.com/0pFcBSF)** - Serverless PostgreSQL
- **[Clerk Authentication](https://go.clerk.com/WSe7K8F)** - User management
- **[GitHub Repository](https://github.com/sahandghavidel/next-expense-tracker-ai)** - Source code
- **[Database Diagram](https://app.eraser.io/workspace/XhlJP6Rdmx6nrGR0SpKz?origin=share)** - Visual schema
- **[Next.js Documentation](https://nextjs.org)** - Framework docs
- **[Tailwind CSS](https://tailwindcss.com)** - Styling framework
- **[Vercel Platform](https://vercel.com)** - Deployment platform

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 💖 Support

If you find this project helpful, please give it a ⭐ on GitHub!

---

**Built with ❤️ by [Sahand Ghavidel](https://github.com/sahandghavidel)**

_Demonstrating modern full-stack development with AI integration, completely free to build and deploy._

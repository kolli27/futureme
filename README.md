# 🚀 FutureSync - AI-Powered Life Transformation

> Transform your life through AI-powered daily habits that align with your future identity.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/futureme)

## ✨ Features

### 🎯 **Vision-Based Goal Setting**
- Create personalized visions for health, career, relationships, and personal growth
- AI analyzes your goals and provides intelligent recommendations

### 🤖 **AI-Powered Daily Actions**
- GPT-4 generates personalized daily tasks based on your visions
- Smart time estimation and priority optimization
- Real-time progress tracking with victory celebrations

### ⏰ **Intelligent Time Budget**
- Allocate daily time across your life areas
- Visual progress tracking and optimization suggestions
- Balance recommendations from AI insights

### 📊 **Progress Analytics**
- Comprehensive insights dashboard with AI-powered recommendations
- Streak tracking and achievement system
- Weekly and monthly progress reports

### 🔒 **Privacy-First Architecture**
- All data stored locally in your browser (localStorage)
- Export/import your data anytime
- No server-side data collection

### ♿ **Accessibility & Performance**
- WCAG AA compliant with full keyboard navigation
- Responsive design for all devices
- Optimized for Core Web Vitals

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **AI**: OpenAI GPT-4o-mini
- **Storage**: Client-side localStorage
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/futureme.git
cd futureme
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env.local
```

Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🌐 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/futureme)

1. Click the deploy button above
2. Connect your GitHub account
3. Add your `OPENAI_API_KEY` environment variable
4. Deploy!

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📱 App Flow

1. **Welcome & Onboarding** - Create your first vision
2. **Time Budget Setup** - Allocate daily time to your goals  
3. **AI Action Generation** - Get personalized daily tasks
4. **Daily Execution** - Complete actions with built-in timers
5. **Progress Tracking** - View insights and celebrate victories
6. **Continuous Improvement** - AI learns and optimizes suggestions

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript compilation check
npm run prod:build   # Full production build with checks
```

### Docker Development
```bash
# Build and run with Docker
docker build -t futureme .
docker run -p 3000:3000 futureme

# Or use Docker Compose
docker-compose up
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL | No |

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Comprehensive deployment instructions
- [Production Checklist](./PRODUCTION_CHECKLIST.md) - Pre-deployment verification

## 🏗️ Architecture

### Client-Side First
- **localStorage** for data persistence
- **React hooks** for state management
- **Error boundaries** for graceful failure handling

### AI Integration
- **OpenAI GPT-4o-mini** for action generation
- **Rate limiting** and **caching** for optimal performance
- **Fallback modes** when AI is unavailable

### Performance
- **Next.js optimizations** (standalone output, image optimization)
- **Code splitting** and **lazy loading**
- **Core Web Vitals** optimization

## 🎨 Design System

- **Color Palette**: Purple/pink gradient theme
- **Typography**: Manrope font family
- **Components**: Radix UI primitives
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API
- **Vercel** for hosting platform
- **Next.js** team for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework

---

**Built with ❤️ for personal transformation through consistent daily action.**
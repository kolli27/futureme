# 🚀 Deploy FutureSync to Vercel - Step by Step

Your FutureSync app is ready for deployment! Follow these steps to get it live on Vercel.

## 📋 Prerequisites

✅ **You have:**
- Your OpenAI API key
- A GitHub account
- A Vercel account (free tier works perfectly)

## 🔧 Step 1: Push to GitHub

### Option A: Create New Repository on GitHub.com
1. Go to [github.com](https://github.com) and click "New repository"
2. Name it `futureme` or `futureme-app`
3. Make it **Public** (required for free Vercel deployment)
4. **Don't** initialize with README (we already have one)
5. Click "Create repository"

### Option B: Use GitHub CLI (if you have it)
```bash
gh repo create futureme --public --source . --push
```

### Manual Push (after creating repo on GitHub)
```bash
# Add your GitHub repository as origin (replace with your username)
git remote add origin https://github.com/YOUR_USERNAME/futureme.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🌐 Step 2: Deploy to Vercel

### Method 1: One-Click Deploy (Easiest)
1. Go to your GitHub repository page
2. Click the "Deploy to Vercel" button in the README
3. Log in to Vercel with your GitHub account
4. Import your repository

### Method 2: Manual Vercel Setup
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Next.js project

## ⚙️ Step 3: Configure Environment Variables

**CRITICAL:** Add your OpenAI API key:

1. In Vercel dashboard, go to your project
2. Click "Settings" tab
3. Click "Environment Variables"
4. Add:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `your_openai_api_key_here`
   - **Environment**: Production
5. Click "Save"

## 🚀 Step 4: Deploy!

1. Click "Deploy" in Vercel
2. Wait 2-3 minutes for build to complete
3. Get your live URL (e.g., `https://futureme-abc123.vercel.app`)

## ✅ Step 5: Test Your Live App

Visit your Vercel URL and test:

1. **Welcome page loads** ✅
2. **Create a vision** in onboarding ✅
3. **Set time budget** ✅
4. **AI generates actions** (should work with your API key) ✅
5. **All navigation works** ✅
6. **Data persists** after refresh ✅

## 🔧 Troubleshooting

### Build Fails?
- Check the build logs in Vercel dashboard
- Ensure your OpenAI API key is added
- Try redeploying

### AI Not Working?
- Verify your OpenAI API key in Vercel settings
- Check it starts with `sk-`
- Ensure you have credits in your OpenAI account

### Pages Not Loading?
- Check the Functions tab in Vercel for errors
- Look at the Real-time logs

## 🎉 Success!

Your FutureSync app is now live! Share your URL and start transforming lives with AI-powered daily habits.

### 📱 What Your Users Get:
- **Personalized visions** in 4 life areas
- **AI-generated daily actions** 
- **Time budget management**
- **Progress tracking & victories**
- **Beautiful, accessible design**
- **Complete privacy** (data stays in their browser)

### 🔄 Future Updates

To update your live app:
1. Make changes locally
2. Commit and push to GitHub
3. Vercel automatically redeploys!

---

**🎯 Your AI-powered life transformation app is now live and ready to help people achieve their goals!**
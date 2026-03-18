# 4Fans — AI Football Predictions Website

## 🚀 Deploy to Vercel (Step by Step)

### Step 1 — Upload to GitHub
1. Go to github.com → click "New repository"
2. Name it `4fans` → click "Create repository"
3. Click "uploading an existing file"
4. Drag and drop ALL files from this ZIP → click "Commit changes"

### Step 2 — Deploy on Vercel
1. Go to vercel.com → click "Add New Project"
2. Click "Import" next to your `4fans` GitHub repo
3. Under **Environment Variables**, add:
   - Key: `VITE_ANTHROPIC_API_KEY`
   - Value: (paste your Anthropic API key from console.anthropic.com)
4. Click **Deploy** — done! ✅

### Step 3 — Connect Your Domain
1. In Vercel, go to your project → Settings → Domains
2. Type your domain name → click Add
3. Copy the 2 DNS values Vercel gives you
4. Log into your domain registrar → DNS Settings
5. Paste the 2 values → Save
6. Wait 10-30 minutes → your site is live! 🌍

## 💰 Monetization Setup

### Google AdSense (Ad Banners)
1. Sign up at adsense.google.com
2. Get your Publisher ID
3. Replace the AdBanner component placeholder content with your real ad code

### Stripe (VIP Subscriptions & Shop Payments)
1. Sign up at stripe.com
2. Create products matching your VIP plans
3. Add Stripe Checkout links to the "GET" buttons in VIPPage

### PayPal (Alternative Payments)
1. Sign up at paypal.com/business
2. Create payment buttons
3. Link them to Shop checkout

## 📞 Support
Built by Claude AI. For customizations, return to your Claude chat.

# Looks Mens Wear — Premium Storefront (Mehdawal, UP)

A production-ready, mobile-first product catalogue and WhatsApp enquiry web application built for **Looks Mens Wear**, Anjahiya Bazar, Mehdawal, Uttar Pradesh.

Powered by **React**, **TypeScript**, **Tailwind CSS**, and **Cloud Firestore**, featuring:
- **Direct WhatsApp Chat ("WhatsApp Par Baat Karein")** with pre-filled product details, sizes, colors, and prices.
- **Confidential Store Manager Access (Admin Panel)** accessible strictly via the Menu button with Google Sign-In, Email/Password, or secure Passcode.
- **Dark Mode & Light Mode** toggle with instant local storage persistence.
- **Client-Side WebP Image Compression** optimizing garment photos under 180 KB for Firestore.
- **1-Click Starter Products Loader** to instantly populate your catalogue.

---

## 1. Verified Store Details

- **Store Name:** Looks Mens Wear
- **Category:** Men's Clothing Store
- **Address:** Anjahiya Bazar, Mehdawal, Menhdawal, Uttar Pradesh 272271, India
- **Phone & WhatsApp:** `+91 91182 68554`
- **Google Business Rating:** 3.5 / 5.0 (2 reviews)
- **Direct WhatsApp Link:** `https://wa.me/919118268554?text=...`
- **Call Link:** `tel:+919118268554`
- **Google Maps Directions:** `https://www.google.com/maps/search/?api=1&query=Looks+Mens+Wear+Anjahiya+Bazar+Mehdawal+Uttar+Pradesh+272271`

---

## 2. Local Setup & Running

```bash
# 1. Clone repository & install dependencies
npm install

# 2. Configure your environment variables in .env (see .env.example)
cp .env.example .env

# 3. Start local development server
npm run dev
```

The app will run locally at `http://localhost:3000`.

---

## 3. Store Manager Access (Admin Panel)

Per store security guidelines, the Admin Panel is **NOT** exposed publicly on the homepage or footer:
1. Click the **Menu** button (top right on desktop or hamburger on mobile).
2. At the bottom of the menu, click **"Store Manager Access"**.
3. Choose your preferred authentication method:
   - **Google Sign-In**: Click "Sign in with Google" (Authorized store owner email only).
   - **Email & Password**: Log in with authorized credentials.
   - **Store Passcode**: Authenticate via the master store security key.
4. **Features inside Admin Panel**:
   - Add new products with automatic WebP compression under 180 KB.
   - Edit prices, descriptions, sizes, colors, and photos of existing garments.
   - 1-click **In Store / Out of Stock** toggle.
   - 1-click **Visible / Hidden** toggle.
   - Delete products.
   - 1-click **Load 6 Starter Menswear Products** (instantly adds linen shirts, denim jeans, royal kurta, formal blazer, polo tee, and chinos).

---

## 4. Deployment Guide (Vercel & Netlify)

### Deploying to Vercel
1. Push this project to GitHub.
2. In [Vercel](https://vercel.com), click **Add New Project** and select this repository.
3. In **Environment Variables**, add the values from your Firebase Console project settings:
   ```env
   VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT_ID.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT_ID.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
   ```
4. Build command: `npm run build`
5. Output folder: `dist`
6. Click **Deploy**.

### Deploying to Netlify
1. Connect repository in [Netlify](https://netlify.com).
2. Set Build Command: `npm run build` and Publish directory: `dist`.
3. Add the `VITE_FIREBASE_*` variables in Site configuration &gt; Environment variables.
4. Deploy site.

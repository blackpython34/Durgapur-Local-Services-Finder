# 📍 Durgapur Local Services Finder

**Durgapur Local Services Finder** is a hyper-local marketplace platform designed to connect residents of Durgapur with verified service providers like electricians, plumbers, tutors, and more. 

Built by **Pixel Pioneers**, this platform provides a seamless, secure, and high-performance experience for both customers and service professionals.

---

## 🚀 Key Features

* **Dynamic Search & Filtering:** Find experts by category (Electrician, Plumber, etc.) or specific services with real-time search.
* **Google Maps Integration:** One-click navigation to a provider's service area using dynamic Google Maps URL generation.
* **Partner Registration:** A dedicated onboarding flow for professionals to register their services and upload profile images directly from their computers.
* **Dual-Action Booking:** Choose between direct WhatsApp communication or a secure internal "Book Now" workflow with transaction tracking.
* **Real-time Database:** Powered by Firestore for instant updates on service availability and user orders.
* **Verified Profiles:** Dedicated profile pages featuring transparent pricing, ratings, and verified service badges.

---

## 🛠️ Tech Stack

* **Frontend:** [Next.js 14](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Backend:** [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)
* **Deployment:** [Firebase Hosting](https://firebase.google.com/docs/hosting)

---

## 📦 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/blackpython34/Durgapur-Local-Services-Finder.git](https://github.com/blackpython34/Durgapur-Local-Services-Finder.git)
    cd Durgapur-Local-Services-Finder
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup (CRITICAL):**
    Create a `.env.local` file in the root directory and add your Firebase configuration. These keys are kept out of GitHub for security:
    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="durgapur-local-services-f8df7.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="durgapur-local-services-f8df7"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="durgapur-local-services-f8df7.firebasestorage.app"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="543682469046"
    NEXT_PUBLIC_FIREBASE_APP_ID="1:543682469046:web:18f514bf0ef3b910c91a17"
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-S1N6G8JJGZ"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

---

## 🛡️ Security & Rules

The project uses strictly defined **Firestore Security Rules** to protect user data:
* **Users:** Only authenticated owners can read/write their own profiles.
* **Providers:** Publicly readable; registration (creation) requires authentication.
* **Orders:** Securely tracked to ensure customers can only view their own booking history.

---

## 🏗️ Deployment

This project is configured for **Static Export** on Firebase Hosting.

1.  **Build the project:**
    ```bash
    npm run build
    ```
2.  **Deploy to Firebase:**
    ```bash
    firebase deploy
    ```
*Note: Ensure your domain is added to **Firebase Authentication > Settings > Authorized Domains**.*

---

**Developed with ❤️ by Pixel Pioneers** *Empowering the Durgapur community through digital innovation.*

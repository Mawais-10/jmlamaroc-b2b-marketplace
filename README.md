#  jmlamaroc - Premium Wholesale Marketplace

jmlamaroc is a high-performance, full-stack wholesale marketplace designed to connect suppliers and buyers with a seamless, AI-powered experience. Built with a focus on speed, security, and visual discovery.

![ChouFliya Preview](https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80)

## Key Features

###  AI Visual Search (New!)
*   **Visual Fingerprinting**: Uses **TensorFlow.js (MobileNet)** to analyze product images and generate 1024-dimension embeddings.
*   **Vector Search**: Integrated with **MongoDB Atlas Vector Search** for lightning-fast image-to-image matching.
*   **Discovery**: Buyers can upload photos or click search icons on existing products to find similar wholesale items instantly.

###  Dual Ecosystem
*   **Supplier Portal**: Dedicated dashboard for store management, product uploads with automatic AI indexing, and cover image customization.
*   **Buyer Dashboard**: Clean interface for browsing, favoriting products, and tracking support requests.

###  Enterprise-Grade Security
*   **Session Isolation**: Custom context-aware authentication that prevents session leakage between Admin and User tabs.
*   **Role-Based Access**: Secure middleware for Admin, Supplier, and Buyer roles.

###  Professional Support System
*   **Ticket Tracking**: Integrated support system allowing users to submit tickets and track real-time status updates (Pending, In-Progress, Resolved).
*   **Admin Management**: Powerful admin interface for managing community health and support resolutions.

---

##  Tech Stack

*   **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide Icons.
*   **Backend**: Node.js, Express, MongoDB Atlas.
*   **AI/ML**: TensorFlow.js (MobileNet), jpeg-js/pngjs decoders.
*   **Storage**: Cloudinary (Image management).
*   **Styling**: Premium Custom UI with Glassmorphism and Micro-animations.

---

##  Installation & Setup

### 1. Prerequisites
*   Node.js (v18+)
*   MongoDB Atlas Account
*   Cloudinary Account

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### 3. Frontend Setup
```bash
npm install
npm run dev
```

### 4. AI Index Setup
Run the seeding script to index existing products:
```bash
cd server
node seed-vectors.js
```

---

## 📄 License
This project is for demonstration and PRD implementation purposes.

---
*Developed with ❤️ for the Wholesale Community.*

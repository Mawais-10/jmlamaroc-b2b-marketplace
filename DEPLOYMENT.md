# Deployment Guide - ChouFliya Marketplace

This guide explains how to deploy the ChouFliya B2B Marketplace to a production environment like Namecheap.

## 1. Prerequisites
- A Namecheap domain and hosting (Shared Hosting with Node.js support or a VPS).
- MongoDB Atlas cluster (already configured in your `.env`).
- Cloudinary account for images (already configured in your `.env`).

## 2. Backend Deployment (Node.js)

If using Namecheap **Shared Hosting**:
1. Log in to cPanel.
2. Search for "Setup Node.js App".
3. Click "Create Application".
4. Set **Application root** to `backend` (or wherever you upload the server files).
5. Set **Application URL** to your domain (e.g., `choufliya.ma/api`).
6. Set **Application startup file** to `index.js`.
7. Click "Create".
8. **Upload Files**: Upload the `server` directory contents to the application root.
9. **Environment Variables**: In the Node.js App setup, add the following variables:
   - `PORT`: `5000` (or whatever the hosting provides)
   - `MONGODB_URI`: (Your Atlas URI)
   - `JWT_SECRET`: (A strong random string)
   - `FRONTEND_URL`: `https://yourdomain.com`
   - `ADMIN_URL`: `https://yourdomain.com`
   - `CLOUDINARY_CLOUD_NAME`: (From your .env)
   - `CLOUDINARY_API_KEY`: (From your .env)
   - `CLOUDINARY_API_SECRET`: (From your .env)
10. **Install Dependencies**: Click "Run JS Script" and choose `npm install`.

## 3. Frontend Deployment (Vite/React)

1. **Prepare for Build**:
   Create a `.env.production` file in the root directory:
   ```env
   VITE_API_URL=https://yourdomain.com/api
   ```

2. **Build the project**:
   Run the following command locally:
   ```bash
   npm run build
   ```
   This will create a `dist` folder.

3. **Upload to Namecheap**:
   - Upload the contents of the `dist` folder to your `public_html` directory (or the root of your domain).
   - Ensure you have an `.htaccess` file in `public_html` to handle React Router:
     ```apache
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
     </IfModule>
     ```

## 4. Admin Panel
The admin panel is integrated into the frontend. You can access it at `/admin` (or however your routing is set up). Ensure the `ADMIN_URL` in the backend matches the domain.

## 5. Final Checks
- Verify CORS: The `FRONTEND_URL` in the backend must match the domain where the frontend is hosted.
- SSL: Ensure your domain has an active SSL certificate (Namecheap provides Namecheap SSL or Let's Encrypt via cPanel).

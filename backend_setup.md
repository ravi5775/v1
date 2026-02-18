# Backend Setup Guide (EC2 / Production)

The application is now configured in **Server Mode**. This means all data is stored centrally on your server (EC2), allowing different devices (PCs, Mobiles) to see the same data in real-time.

## 1. Prerequisites

- **Node.js** (v16 or higher)
- **pnpm** (Recommended) or npm

## 2. Installation on EC2

1. Connect to your EC2 instance via SSH.
2. Navigate to the `backend` directory.
3. Install dependencies:
   ```bash
   cd backend
   pnpm install
   ```

## 3. Configuration

1. Rename `.env.example.txt` to `.env`.
2. **IMPORTANT**: Set a strong `JWT_SECRET`.
3. Configure the default admin credentials.

```env
JWT_SECRET=your_super_secret_random_string
PORT=3001
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=password123
```

## 4. Running with PM2 (Recommended for EC2)

To keep the server running even after you close the terminal:

1. Install PM2: `sudo npm install -g pm2`
2. Start the backend:
   ```bash
   cd backend
   pm2 start src/index.js --name "svt-backend"
   ```
3. Save PM2 list: `pm2 save`

## 5. Deployment Note

Ensure your EC2 Security Group allows inbound traffic on:
- **Port 80/443** (For the Frontend)
- **Port 3001** (For the Backend API and WebSockets)

The Frontend is configured to automatically communicate with the Backend using the same host address.

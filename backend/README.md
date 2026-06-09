# RJIT Inventory Management ERP - Backend API

This is the Express.js API backend for the **RJ Institute of Technology (RJIT) Inventory Management System**. It uses Prisma ORM with a PostgreSQL database, JWT for authentication, and Zod for schema validation.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** running locally or on the network.

## Installation

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Copy `.env.example` to `.env` and adjust the variables (such as database credentials and JWT secret):
   ```bash
   cp .env.example .env
   ```

4. Database Setup & Sync:
   Create the database specified in your `DATABASE_URL` (default: `college_inventory_erp`) and run Prisma push to sync the schema:
   ```bash
   npx prisma db push
   ```

5. Seed Initial Data:
   Seed the database with the default users, system settings, approval sequences, and initial inventory:
   ```bash
   npm run db:seed
   ```

## Running the Server

- **Development Mode** (with hot-reloading):
  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm run start
  ```

The backend server runs on `http://localhost:5000` by default.

## LAN Deployment Configuration

To access this application over your college LAN:
1. Find the host machine's local IP address (e.g., `192.168.1.10`):
   - **Mac**: `ipconfig getifaddr en0` or check Network Settings.
   - **Windows**: `ipconfig`
2. Update the frontend `API_URL` configuration inside `frontend/src/context/StoreContext.jsx` to point to `http://<YOUR_LAN_IP>:5000/api` instead of `localhost`.
3. Keep port `5000` open on the host's firewall to allow LAN requests.

## Seed User Credentials

You can use the following default credentials to test different permission roles:

| Name | Email | Password | Role |
|---|---|---|---|
| Rahul Sharma | `rahul@rjit.edu.in` | `admin` | Admin (All permissions) |
| Priya Singh | `priya@rjit.edu.in` | `manager` | Store Manager |
| Amit Verma | `amit@rjit.edu.in` | `officer` | Purchase Officer |
| Dr. Roy | `principal@rjit.edu.in` | `principal` | Principal (Approval & Analytics) |
| Sanjay Mehta | `accounts@rjit.edu.in` | `accounts` | Account Office (Approval) |

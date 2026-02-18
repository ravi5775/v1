
# Sri Vinayaka Tenders - Project Report

## 1. Project Overview

**Sri Vinayaka Tenders** is a comprehensive financial management application designed for administrators to manage loans and track investor payments. It is a self-hosted, multi-user system built with modern web technologies, providing a secure, reliable, and user-friendly experience.

The application's core design principle is to provide a single source of truth for all financial data, with real-time updates synchronized across all active administrator sessions. This eliminates data silos and ensures that all users are working with the most current information.

### Core Features:

- **Secure Admin Authentication:** User access is protected by a robust JWT (JSON Web Token) authentication system.
- **Bilingual Interface:** Fully supports both **English** and **Telugu**, with a simple toggle to switch languages.
- **Comprehensive Loan Management:** Full CRUD (Create, Read, Update, Delete) capabilities for three distinct loan types:
    - **Finance:** Standard principal + interest loans over a period of months.
    - **Tender:** Short-term loans with a fixed repayment amount and profit.
    - **Interest Rate:** Loans where interest is calculated and potentially compounded monthly based on the outstanding principal.
- **Investor Payment Dashboard:** A dedicated module for managing investors, tracking investment amounts, calculating profits based on a simple interest model, and logging payments.
- **Real-time Data Synchronization:** Utilizes WebSockets to instantly broadcast data changes (e.g., a new loan, a payment) to all connected clients, ensuring a consistent view for all admins.
- **Data Export:** Functionality to export loan and investor data to CSV for external analysis or record-keeping.
- **PDF Receipt Generation:** On-the-fly generation of PDF receipts for loan transactions.
- **Zero-Setup Backend:** The backend is designed to be self-contained, running its own embedded, persistent MongoDB database, which requires no external database installation or configuration.

---

## 2. Technology Stack

The application is a modern full-stack JavaScript project, leveraging the following technologies:

| Category      | Technology                                                                          | Purpose                                                                                |
|---------------|-------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| **Frontend**  | **React 18** & **TypeScript**                                                       | Building a fast, type-safe, and component-based user interface.                        |
|               | **Vite**                                                                            | Next-generation frontend tooling for rapid development and optimized builds.           |
|               | **Tailwind CSS**                                                                    | A utility-first CSS framework for creating custom designs without leaving the HTML.    |
|               | **React Router**                                                                    | For client-side routing and navigation within the single-page application.             |
|               | **Lucide React**                                                                    | A library of simple and beautiful SVG icons.                                           |
|               | **jsPDF**                                                                           | A client-side library for generating PDF documents.                                    |
| **Backend**   | **Node.js** & **Express.js**                                                        | A fast and minimalist web framework for building the REST API and WebSocket server.      |
|               | **MongoDB** (via `mongodb-memory-server`)                                           | A NoSQL database used for data persistence, embedded directly into the backend.        |
|               | **Mongoose**                                                                        | An Object Data Modeling (ODM) library for MongoDB and Node.js for schema validation.   |
|               | **JSON Web Tokens (JWT)**                                                           | For implementing a secure, token-based authentication system.                          |
|               | **ws (WebSocket)**                                                                  | For enabling real-time, bidirectional communication between the client and server.     |

---

## 3. Project Structure

The project is organized into a monorepo structure with a `frontend` (root) and a `backend` directory.

### 3.1 Frontend (Root Directory)

```
.
├── components/         # Reusable React components
├── contexts/           # React Context providers for global state management
├── hooks/              # Custom React hooks
├── pages/              # Top-level page components for each route
├── utils/              # Helper functions, calculations, and services
├── assets/             # Static assets like the default logo
├── App.tsx             # Main application component with routing setup
├── index.css           # Global styles and Tailwind CSS imports
├── index.tsx           # Entry point for the React application
├── tailwind.config.js  # Configuration for Tailwind CSS
└── vite.config.ts      # Configuration for the Vite build tool
```

#### File Breakdown:

- **`App.tsx`**: The root component that sets up all context providers (`Auth`, `Loan`, `Language`, etc.) and defines the application's routing structure using `React Router`. It distinguishes between public routes (`/login`) and protected routes.

- **`components/`**: Contains reusable UI components used across the application.
  - `Header.tsx`: The main navigation bar, including language switcher, notifications, and logout button.
  - `Footer.tsx`: The application footer.
  - `LoansTable.tsx`: The main table for displaying, selecting, and managing loans.
  - `InvestorsTable.tsx`: The main table for displaying and managing investors.
  - `LoanForm.tsx`: The form for creating and editing all types of loans.
  - `InvestorForm.tsx`: The modal form for creating and editing investors.
  - `PaymentModal.tsx`: The modal for viewing loan transaction history and managing payments.
  - `ConfirmationModal.tsx`: A generic modal for confirming destructive actions like deletion.
  - `SummaryCard.tsx`: A reusable card component for displaying key metrics on the dashboards.
  - `ErrorBoundary.tsx`: A component that catches JavaScript errors anywhere in its child component tree and displays a fallback UI.

- **`contexts/`**: Manages global application state using React's Context API.
  - `AuthContext.tsx`: Manages user authentication state (user object, loading state, sign-in/sign-out functions).
  - `LoanContext.tsx`: Manages the state for all loans, including fetching, adding, updating, and deleting loans and their transactions.
  - `InvestorContext.tsx`: Manages the state for all investors and their payments.
  - `LanguageContext.tsx`: Manages the current language (`en`/`te`) and provides the translation function `t()`.
  - `NotificationContext.tsx`: Manages fetching and display of admin notifications.
  - `WebSocketContext.tsx`: Manages the WebSocket connection for real-time updates.

- **`pages/`**: Contains the main page components rendered by React Router.
  - `AdminDashboard.tsx`: The main landing page after login, displaying loan summaries and the `LoansTable`.
  - `InvestorDashboard.tsx`: The page for managing all investor-related data.
  - `LoginPage.tsx`: The login page for admin authentication.
  - `LoanForm.tsx`: The page wrapper for the `LoanForm` component, handling new and edit modes.
  - `RepaymentPage.tsx`: A dedicated page for quickly logging new payments for any loan type.

- **`utils/`**: Contains shared utility functions.
  - `apiService.ts`: A centralized service for making all API calls to the backend. It handles authentication headers and response processing.
  - `planCalculations.ts`: **(Critical)** Contains all the business logic and formulas for calculating loan metrics (balance, profit, status, etc.).
  - `investorCalculations.ts`: **(Critical)** Contains all business logic for calculating investor metrics (profit, status, missed months, etc.).
  - `translations.ts`: The dictionary holding all English and Telugu translations.
  - `pdfGenerator.ts`: The utility for generating PDF loan receipts.
  - `csvUtils.ts`: The utility for generating and downloading CSV files.

### 3.2 Backend

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js     # Connects to the embedded MongoDB instance
│   │   └── initDb.js       # Creates the default admin user on first run
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── loanController.js
│   │   └── ... (controllers for each resource)
│   ├── middleware/
│   │   ├── authMiddleware.js # Protects routes, verifies JWT
│   │   └── errorHandler.js   # Global error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Loan.js
│   │   └── ... (Mongoose schemas for each data collection)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── loanRoutes.js
│   │   └── ... (Express routes for each API endpoint)
│   └── index.js            # Entry point for the backend server, sets up Express and WebSockets
├── .env                  # Environment variables (JWT secret, admin credentials)
└── package.json
```

---

## 4. Core Concepts & Logic Explained

### 4.1 Authentication Flow (JWT)

1.  **Login Request:** The user enters their email and password on the `LoginPage`. The `signIn` function in `AuthContext` calls `apiService.login`.
2.  **API Call:** `apiService.login` sends a `POST` request to `/api/auth/login` on the backend.
3.  **Backend Verification:**
    - The `authController` finds the user in the database by email.
    - It uses `bcrypt.compare` to securely check if the provided password matches the stored hashed password.
4.  **Token Generation:** If credentials are valid, the backend creates a JWT containing the user's ID and email (`payload`). This token is signed with the secret key from the `.env` file.
5.  **Response:** The backend sends the JWT back to the frontend.
6.  **Token Storage:** The frontend stores the JWT in `localStorage`.
7.  **Authenticated Requests:** For all subsequent API calls, `apiService` retrieves the token from `localStorage` and includes it in the `Authorization: Bearer <token>` header.
8.  **Route Protection:** The `authMiddleware` on the backend intercepts these requests, verifies the JWT's signature, and attaches the user payload to the request object (`req.user`), granting access to the protected route.

### 4.2 Financial Calculations

This is the core business logic of the application.

#### A. Investor Profit Calculation (Simple Monthly Interest)

The system uses a simple, non-compounding interest model for investors, as specified. The logic resides in **`utils/investorCalculations.ts`**.

**Formulas Used:**

1.  **Monthly Interest** = `Principal × (Monthly Rate / 100)`
2.  **Accrued Profit** = `Monthly Interest × Months Completed`
3.  **Pending Profit** = `Accrued Profit − Total Paid`

**Example: Investor "TEJA"**

Let's walk through the example from the prompt to see how the code implements it.

-   **Principal:** ₹6,00,000
-   **Rate:** 1.25% per month
-   **Start Date:** 16-09-2025
-   **Today:** 17-11-2025
-   **Total Paid:** ₹0

**Code Execution in `calculateInvestorMetrics`:**

1.  **Calculate Monthly Profit:**
    ```typescript
    // const monthlyProfit = investor.investmentAmount * (investor.profitRate / 100);
    const monthlyProfit = 600000 * (1.25 / 100); 
    // monthlyProfit = 7500
    ```
    Result: **₹7,500**

2.  **Calculate Full Months Completed:** The code calculates the difference in months between the start date and today. Since today's date (17th) is after the start date's day (16th), it counts the current month.
    -   September to October = 1 month
    -   October to November = 1 month
    Result: **2 months**

3.  **Calculate Accrued (Accumulated) Profit:**
    ```typescript
    // const accumulatedProfit = monthlyProfit * monthsCompleted;
    const accumulatedProfit = 7500 * 2;
    // accumulatedProfit = 15000
    ```
    Result: **₹15,000**

4.  **Calculate Total Paid:** The code sums all payments.
    Result: **₹0**

5.  **Calculate Pending Profit:**
    ```typescript
    // const pendingProfit = accumulatedProfit - totalPaid;
    const pendingProfit = 15000 - 0;
    // pendingProfit = 15000
    ```
    Result: **₹15,000**

6.  **Calculate Missed Months:**
    ```typescript
    // const missedMonths = Math.floor(pendingProfit / monthlyProfit);
    const missedMonths = Math.floor(15000 / 7500);
    // missedMonths = 2
    ```
    Result: **2**

7.  **Determine Status:** Since `pendingProfit` (15,000) is greater than zero, the status is set to `Delayed`.

These results are then displayed in the `InvestorsTable`, perfectly matching the required output.

#### B. Loan Calculations

The logic for loans resides in **`utils/planCalculations.ts`**.

**1. Finance Loan Type**

-   **Total Amount (to be paid):** `Loan Amount + (Loan Amount * (Interest Rate / 100) * Duration in Months)`
-   **Profit:** `Total Amount - Given Amount`
-   **Balance:** `Total Amount - Amount Paid`
-   **Status:** `Completed` if balance is zero. `Overdue` if the final due date has passed and balance is > 0. Otherwise, `Active`.

**2. Tender Loan Type**

-   **Total Amount (to be paid):** This is simply the `Loan Amount`.
-   **Profit:** `Loan Amount - Given Amount`
-   **Balance:** `Loan Amount - Amount Paid`
-   **Status:** `Completed` if balance is zero. `Overdue` if the `Start Date + Duration in Days` has passed and balance is > 0. Otherwise, `Active`.

**3. Interest Rate Loan Type (Dynamic Balance)**

This is the most complex type. The balance is not fixed; it changes monthly based on payments and compounding of unpaid interest.

-   **How it works (`getInterestRateCalculationDetails`):**
    1.  The function iterates through each **full month** that has passed since the loan started.
    2.  For each month, it calculates the interest due for that month: `Current Principal * (Interest Rate / 100)`.
    3.  It then subtracts any payments made within that specific month.
    4.  If there is any **unpaid interest** at the end of the month, that amount is **added to the principal** for the next month's calculation (this is compounding).
    5.  If payments exceeded the interest, the excess is subtracted from the principal.
    6.  After iterating through all past months, it subtracts any payments made in the current, not-yet-compounded month to give the final, up-to-date balance.
-   **Total Amount:** `Current Balance + Total Amount Paid`
-   **Profit:** `Total Amount - Given Amount`
-   **Status:** `Completed` if balance is zero. `Overdue` if there has ever been unpaid interest that was compounded, or if the final loan duration has passed. Otherwise, `Active`.

### 4.3 Real-time Updates via WebSockets

To ensure data consistency across multiple admin sessions, the application uses WebSockets.

1.  **Connection:** When an admin logs in, the `WebSocketProvider` establishes a WebSocket connection to the backend server.
2.  **Subscription:** Components that need real-time data (like `LoanContext` and `InvestorContext`) use the `useWebSocket` hook to `subscribe` to specific event types (e.g., `'LOANS_UPDATED'`, `'INVESTORS_UPDATED'`).
3.  **Backend Broadcast:** When a user performs an action that changes data (e.g., creates a loan, adds a payment), the corresponding backend controller completes the database operation and then calls the `broadcast()` function.
4.  **Message Sending:** The `broadcast` function sends a JSON message (e.g., `{ type: 'LOANS_UPDATED' }`) to **all connected clients**.
5.  **Client-side Reaction:** The `WebSocketProvider` on each client receives the message. It checks the message `type` and invokes the callback functions that subscribed to that type.
6.  **Data Refresh:** The callback function in `LoanContext` triggers a silent data refetch (`fetchLoans(true)`). This updates the local state with the latest data from the server, causing the UI to re-render automatically and immediately for all users.

# Sri Vinayaka Tenders - Backend Server

This directory contains the Node.js/Express.js backend for the application. It serves a RESTful API that the React frontend consumes.

## Features

- **Embedded MongoDB:** Uses `mongodb-memory-server` to run a persistent, file-based MongoDB instance automatically. **No database installation needed.**
- **Mongoose Models:** Uses Mongoose for elegant data modeling and validation.
- **RESTful API:** Provides endpoints for all CRUD operations on loans, investors, transactions, and notifications.
- **JWT Authentication:** Secures endpoints using JSON Web Tokens.

## API Endpoints

- `POST /api/auth/login`: Authenticate a user and receive a JWT.
- `GET /api/loans`: Get all loans for the authenticated user.
- `POST /api/loans`: Create a new loan.
- ... and more for all other resources.

## Setup

### Recommended: Using `pnpm` for Fast Installation

The first-time installation can be slow because this backend downloads its own copy of MongoDB (~500MB). To speed this up significantly and avoid potential installation errors, we strongly recommend using `pnpm`.

If you don't have `pnpm`, install it first with this one-time command:
```bash
npm install -g pnpm
```

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```
    ***Alternative:*** If you have trouble with the `pnpm` command, you can use `npm install` instead. Please be patient, as the first installation will be very slow while it downloads the embedded database.

2.  **Create Environment File (Required):**
    The server requires a `.env` file to load critical secrets, like the one used for signing login tokens.
    *   Simply **rename** the `.env.example.txt` file to `.env`.
    ```bash
    # On Windows (Command Prompt)
    rename .env.example.txt .env
    
    # On macOS, Linux, or Git Bash
    mv .env.example.txt .env
    ```
    *   The default values in this file are sufficient to run the server.
3.  **Start the server:**
    ```bash
    pnpm start
    ```
    *(Or `npm start` if you used npm to install.)*
    
The server will start, create a local database file in a `.mongodb` directory, and create the default admin user. That's it!
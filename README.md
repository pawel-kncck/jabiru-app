# Jabiru App

Jabiru is a full-stack application with a React frontend and a FastAPI backend. This guide will walk you through setting up and running the application locally for development.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Docker and Docker Compose:** To run the required services like PostgreSQL and Redis.
- **Node.js (v18.0.0 or higher):** For the frontend application.
- **Python (v3.11+ recommended):** For the backend application.

## Getting Started

Follow these steps to get the Jabiru app up and running on your local machine.

### 1\. Clone the Repository

First, clone the project repository to your local machine.

```bash
git clone <repository-url>
cd jabiru-app
```

### 2\. Set Up Environment Variables

You need to create `.env` files for both the frontend and backend.

- **Backend (`backend/.env`):**
  Navigate to the `backend` directory and create a `.env` file by copying the example file.

  ```bash
  cp backend/.env.example backend/.env
  ```

  Your `backend/.env` file should look like this:

  ```
  PORT=5001
  ENVIRONMENT=development
  DATABASE_URL=postgresql://jabiru_user:jabiru_password@localhost:5432/jabiru
  JWT_SECRET_KEY=your-super-secret-key-that-no-one-will-guess
  JWT_ALGORITHM=HS256
  JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
  OPENAI_API_KEY=your-openai-api-key-here
  UPLOAD_DIRECTORY=uploads
  ```

- **Frontend (`frontend/.env`):**
  Navigate to the `frontend` directory and create a `.env` file by copying the example file.

  ```bash
  cp frontend/.env.example frontend/.env
  ```

  Your `frontend/.env` file should look like this:

  ```
  VITE_API_URL=http://localhost:5001/api/v1
  ```

### 3\. Start Dependent Services

The application relies on PostgreSQL and Redis. You can easily start these services using Docker Compose. From the root directory of the project, run:

```bash
docker-compose up -d
```

This command will start the PostgreSQL and Redis containers in detached mode.

### 4\. Set Up and Run the Backend

1.  **Navigate to the `backend` directory:**

    ```bash
    cd backend
    ```

2.  **Create and activate a Python virtual environment:**

    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

    _(On Windows, use `venv\Scripts\activate`)_

3.  **Install the required Python packages:**

    ```bash
    pip install -r requirements.txt
    ```

4.  **Apply database migrations:** This will set up the necessary tables in the database.

    ```bash
    alembic upgrade head
    ```

5.  **Run the backend server:**

    ```bash
    uvicorn src.main:app --reload --port 5001
    ```

    The backend API will now be running and accessible at `http://localhost:5001`.

### 5\. Set Up and Run the Frontend

1.  **Open a new terminal** and navigate to the `frontend` directory:

    ```bash
    cd frontend
    ```

2.  **Install the required Node.js packages:**

    ```bash
    npm install
    ```

3.  **Run the frontend development server:**

    ```bash
    npm run dev
    ```

    The frontend application will now be running, typically on `http://localhost:5173`.

## Verification

To ensure that everything is running correctly:

- **Backend:** Open your browser and navigate to `http://localhost:5001/health`. You should see a JSON response like `{"status": "healthy"}`.
- **Frontend:** Open your browser and navigate to the address provided by the `npm run dev` command (e.g., `http://localhost:5173`). You should see the Jabiru application interface.

You can now register a new user and start using the application.

## Technologies Used

- **Backend:** FastAPI, Python, SQLAlchemy, PostgreSQL, Alembic
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Services:** Docker, Redis

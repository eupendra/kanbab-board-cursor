# Upen.AI Status Board

A modern Upen.AI board application for tracking weekly status from team members in a software development company.

## Features

- **Upen.AI Board Setup**: Track tasks over weeks
  - Private view for each team member
  - Option to make tasks public on a team board
  - Personal history of weekly tasks

- **Authentication System**
  - Simple username and password authentication
  - Password reset option

- **User Roles**
  - User, Manager, Admin
  - Admins: Add/manage users, view all tasks (including private)
  - Managers: View public tasks only

- **Exports**
  - Individual team member exports
  - Options for weekly, monthly, quarterly, yearly exports
  - Includes date range, tasks completed/planned, team member's name, and email

## Tech Stack

- **Backend**: Python with FastAPI
- **Frontend**: React with TypeScript
- **Database**: SQLite (for development), PostgreSQL (for production)
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

### Installation

1. Clone the repository
2. Set up the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend
```bash
cd frontend
npm install
```

### Running the Application

1. Start the backend server
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

2. Start the frontend development server
```bash
cd frontend
npm run dev
```

3. Access the application at http://localhost:5173

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
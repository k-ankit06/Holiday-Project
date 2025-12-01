# TaskWave - Productivity Suite

TaskWave is a comprehensive productivity application built with React, Vite, and MongoDB. It helps users manage tasks, track productivity, and collaborate with teams.

## Features

- Task Management (Create, Read, Update, Delete tasks)
- User Authentication (Register, Login, Logout)
- Calendar Integration
- Analytics and Statistics
- Team Collaboration
- Responsive Design
- Dark/Light Theme Support

## Project Structure

```
TaskWake/
├── backend/          # Backend API (Node.js, Express, MongoDB)
├── src/              # Frontend source code (React)
├── public/           # Public assets
└── ...               # Configuration files
```

## Tech Stack

### Frontend
- React 18
- Vite
- React Router v6
- Tailwind CSS
- Lucide React Icons
- Chart.js for data visualization

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd TaskWake
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

4. Configure environment variables (see SETUP.md for details)

### Running the Application

#### Development Mode

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. In a new terminal, start the frontend development server:
   ```bash
   npm run dev
   ```

Alternatively, you can use the provided batch scripts:
- Double-click `start-dev.bat` to start both servers
- Double-click `start-backend.bat` to start only the backend

### Building for Production

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Start the backend in production mode:
   ```bash
   cd backend
   npm start
   ```

## API Documentation

The backend provides a RESTful API for all application functionality. See `backend/README.md` for detailed API documentation.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
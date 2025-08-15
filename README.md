# SINC - Shared Calendar Application

A modern shared calendar web application for group event planning with real-time collaboration features.

## Features

- **User Authentication**: JWT-based authentication with secure login/registration
- **Group Management**: Create, manage, and join public/private groups
- **Event Planning**: Create events with dates, times, locations, and descriptions
- **Real-time Collaboration**: Chat-like comments and collaborative to-do lists
- **Friend System**: Add friends and share calendars
- **Responsive Design**: Modern, minimalist dark theme UI
- **File Uploads**: Profile pictures and event images

## Tech Stack

### Frontend
- **React** with Vite
- **TailwindCSS** for styling
- **React Big Calendar** for calendar display
- **React Hook Form** for form management
- **Axios** for API calls
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **SQLite3** database (can be migrated to PostgreSQL/Supabase)
- **JWT** authentication
- **Multer** for file uploads
- **Express Validator** for input validation

## Local Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sinc.git
   cd sinc
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Start the development servers**
   ```bash
   # Start backend (from backend directory)
   npm start
   
   # Start frontend (from frontend directory)
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Deployment

### Vercel + Supabase Setup

1. **Database Migration to Supabase**
   - Create a Supabase project
   - Migrate SQLite schema to PostgreSQL
   - Update database connection in backend

2. **Backend Deployment**
   - Deploy to Vercel as serverless functions
   - Configure environment variables
   - Set up database connection

3. **Frontend Deployment**
   - Deploy to Vercel
   - Configure API endpoints
   - Set up environment variables

## Environment Variables

### Backend (.env)
```
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=your_database_url_here
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Groups
- `GET /groups` - Get user's groups
- `POST /groups` - Create new group
- `PUT /groups/:id` - Update group
- `DELETE /groups/:id` - Delete group
- `GET /groups/search/public` - Search public groups
- `POST /groups/:id/join` - Join public group
- `POST /groups/:id/leave` - Leave group

### Events
- `GET /events` - Get events
- `POST /events` - Create event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `POST /events/:id/attend` - Update attendance
- `POST /events/:id/comments` - Add comment
- `POST /events/:id/tasks` - Add task

### Friends
- `GET /friends` - Get friends list
- `POST /friends/request` - Send friend request
- `POST /friends/accept` - Accept friend request
- `DELETE /friends/:id` - Remove friend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, please open an issue on GitHub or contact the development team.

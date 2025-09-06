# UniLink - Social Blogging Platform for College Students

A private social media and blogging platform built with the MERN stack, exclusively for college students with official college email addresses.

## 🚀 Features

- **Authentication**: Sign up/Login only with @college.edu emails
- **JWT-based Authentication**: Secure token-based authentication
- **Role-based Access**: User and Admin roles
- **Groups**: Create, join, leave, and manage groups
- **Posts**: Create posts with text, images, and videos
- **Interactions**: Like and comment on posts
- **Admin Panel**: Full moderation and user management capabilities

## 🛠 Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- Cloudinary for file uploads
- Multer for file handling

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios for API calls

## 📁 Project Structure

```
UniLink/
├── server/                     # Backend
│   ├── src/
│   │   ├── config/             # DB connection, env setup
│   │   ├── models/             # Mongoose schemas
│   │   ├── middleware/         # Auth, error handling
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Helpers
│   │   └── index.js            # Entry point
│   └── package.json
├── client/                     # Frontend (React)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page-level components
│   │   ├── context/            # Auth/Group context
│   │   ├── services/           # API calls
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Cloudinary account for file uploads

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd UniLink
```

2. Install backend dependencies
```bash
cd server
npm install
```

3. Install frontend dependencies
```bash
cd ../client
npm install
```

4. Set up environment variables
   - Copy `.env.example` to `.env` in both `server/` and `client/` directories
   - Fill in your MongoDB URI, JWT secret, and Cloudinary credentials

5. Start the development servers

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm run dev
```

## 🌐 Deployment

This project is designed to be deployed on:
- **Backend**: Render
- **Frontend**: Vercel

Make sure to set up the environment variables in your deployment platforms.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create new group
- `GET /api/groups/:id` - Get group by ID
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/leave` - Leave group

### Posts
- `GET /api/posts` - Get posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get post by ID
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Add comment

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

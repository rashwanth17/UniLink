# UniLink Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (already configured with your connection string)
- Cloudinary account for file uploads

### 1. Environment Setup

#### Backend Environment
1. Copy `server/env.example` to `server/.env`
2. Update the following values in `server/.env`:
   ```env
   # JWT Secret (generate a strong secret)
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
   
   # Cloudinary Credentials (get from cloudinary.com)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

#### Frontend Environment
1. Copy `client/env.example` to `client/.env`
2. The default values should work for local development:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_CLIENT_URL=http://localhost:5173
   ```

### 2. Install Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

### 3. Start Development Servers

#### Backend (Terminal 1)
```bash
cd server
npm run dev
```
Server will run on http://localhost:5000

#### Frontend (Terminal 2)
```bash
cd client
npm run dev
```
Frontend will run on http://localhost:5173

### 4. First Admin User

To create the first admin user, you can either:

1. **Register normally** and then manually update the database:
   - Register with your .edu email
   - In MongoDB Atlas, find your user document
   - Change `role` from `"user"` to `"admin"`

2. **Or use the API directly** (after starting the server):
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Admin User",
       "email": "admin@yourcollege.edu",
       "password": "yourpassword",
       "college": "Your College Name"
     }'
   ```

## 🎯 Features Implemented

### ✅ Authentication
- JWT-based authentication
- College email validation (.edu only)
- Role-based access (User/Admin)
- Password hashing with bcrypt

### ✅ User Management
- User profiles with photos, bio, college info
- Profile editing and avatar upload
- College-based user discovery

### ✅ Groups
- Create, join, leave groups
- Group privacy settings
- Member management (admin/moderator roles)
- Group tags and descriptions

### ✅ Posts
- Text, image, and video posts
- Like and comment system
- Post visibility settings
- Media upload with Cloudinary

### ✅ Admin Panel
- User management
- Group moderation
- Post moderation
- Analytics dashboard

### ✅ UI/UX
- Modern, responsive design with Tailwind CSS
- Mobile-friendly interface
- Loading states and error handling
- Toast notifications

## 🔧 Configuration

### MongoDB
- Already configured with your Atlas connection string
- Database: `unilink`
- Collections: `users`, `groups`, `posts`

### Cloudinary Setup
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from the dashboard
3. Add them to `server/.env`

### File Upload Limits
- Maximum file size: 50MB
- Maximum files per post: 5
- Supported formats: Images (jpg, png, gif) and Videos (mp4, mov, avi)

## 🚀 Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy from the `server` directory

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Set environment variables

### Environment Variables for Production
```env
# Backend
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLIENT_URL=https://your-frontend-domain.vercel.app

# Frontend
VITE_API_URL=https://your-backend-domain.onrender.com/api
```

## 📱 Usage

1. **Register** with your college email (.edu)
2. **Create or join groups** for your college
3. **Share posts** with text, images, or videos
4. **Interact** with likes and comments
5. **Admin users** can moderate content and users

## 🛠 Development

### Project Structure
```
UniLink/
├── server/                 # Backend (Node.js/Express)
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── models/         # Mongoose models
│   │   ├── middleware/     # Auth & error handling
│   │   ├── controllers/    # Route handlers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # File upload helpers
│   └── package.json
├── client/                 # Frontend (React/Vite)
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── services/       # API services
│   │   └── App.jsx
│   └── package.json
└── README.md
```

### API Endpoints
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/groups` - Get groups
- `POST /api/groups` - Create group
- `GET /api/posts` - Get posts
- `POST /api/posts` - Create post
- And many more...

## 🎉 You're Ready!

Your UniLink platform is now ready for college students to connect, share, and collaborate. The platform includes all the core features you requested:

- ✅ College email authentication
- ✅ Group creation and management
- ✅ Post sharing with media
- ✅ Like and comment system
- ✅ Admin moderation panel
- ✅ Modern, responsive UI

Start the servers and begin testing with your college email!

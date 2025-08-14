# StakeCraft Full-Stack System

A comprehensive blockchain validator platform with admin panel for content management.

## Project Structure

```
stakecraft.com-development/
├── stakecraft-frontend/     # Vue.js frontend application
├── stakecraft-backend/      # Node.js/Express backend API
├── .git/                    # Git repository
├── .github/                 # GitHub workflows
└── README.md               # This file
```

## Features

### Frontend (Vue.js)

- Modern, responsive design
- Multi-blockchain wallet integration
- Theme switching (light/dark)
- Admin panel with content management
- SEO optimized

### Backend (Node.js/Express)

- RESTful API with MongoDB
- JWT authentication
- File upload handling
- Health monitoring endpoints
- Rate limiting and security

### Admin Panel Features

- **Content Management**: Add, edit, delete content for all sections
- **Menu Items**: Manage navigation menu
- **Mainnet Cards**: Upload images, add text, stake codes
- **Testnet Cards**: Upload images, add descriptions
- **Partnerships**: Add icons and partnership information
- **About Section**: Edit capabilities and team member photos
- **Dashboard**: Statistics and system monitoring

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd stakecraft.com-development
```

### 2. Backend Setup

```bash
cd stakecraft-backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your configuration
# MONGODB_URI=mongodb://localhost:27017/stakecraft
# JWT_SECRET=your-super-secret-jwt-key
# FRONTEND_URL=http://localhost:3000

# Create uploads directory
mkdir uploads

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd stakecraft-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Database Setup

Ensure MongoDB is running and accessible. The application will automatically create the necessary collections.

### 5. Create Admin User

After starting the backend, create an admin user:

```bash
curl -X POST http://localhost:5000/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@stakecraft.com",
    "password": "your-secure-password"
  }'
```

### 6. Seed Sample Data (Optional)

To populate the database with sample content for testing:

```bash
cd stakecraft-backend
npm run seed
```

This will create sample mainnet networks, testnet networks, partnerships, about content, and team members.

## API Endpoints

### Health Monitoring

- `GET /health` - Basic health check
- `GET /api/health/detailed` - Detailed health information
- `GET /api/health/simple` - Simple health check for monitoring

### Authentication

- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `POST /api/auth/setup` - Create initial admin user

### Content Management

- `GET /api/content/:type` - Get content by type
- `GET /api/content/:type/:id` - Get specific content
- `POST /api/content/:type` - Create new content
- `PUT /api/content/:type/:id` - Update content
- `DELETE /api/content/:type/:id` - Delete content
- `PATCH /api/content/:type/reorder` - Reorder content

### Admin Panel

- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/content` - Admin content list
- `GET /api/admin/content-types` - Available content types
- `POST /api/admin/content/bulk-action` - Bulk operations
- `GET /api/admin/system-info` - System information

## Admin Panel Access

Access the admin panel at: `http://localhost:3000/notadmin`

## Environment Variables

### Backend (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/stakecraft

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Content Types

The system supports the following content types:

1. **menu** - Navigation menu items
2. **mainnet** - Mainnet validator cards
3. **testnet** - Testnet validator cards
4. **partnership** - Partnership information
5. **about** - About section content
6. **team** - Team member information

## File Uploads

- Supported formats: JPEG, JPG, PNG, GIF, SVG
- Maximum file size: 5MB
- Files are stored in the `uploads/` directory
- Automatic cleanup of old files (configurable)

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Input validation
- File upload security
- Helmet.js for security headers

## Monitoring

The `/health` endpoint is designed for monitoring systems like Prometheus/Grafana:

```bash
# Basic health check
curl http://localhost:5000/health

# Detailed health information
curl http://localhost:5000/api/health/detailed
```

## Development

### Backend Development

```bash
cd stakecraft-backend
npm run dev  # Start with nodemon
npm test     # Run tests
```

### Frontend Development

```bash
cd stakecraft-frontend
npm run dev  # Start development server
npm run build  # Build for production
npm run lint   # Run ESLint
```

## Production Deployment

### Backend

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure MongoDB with authentication
4. Set up proper CORS origins
5. Use a reverse proxy (nginx) for SSL termination

### Frontend

1. Build the application: `npm run build`
2. Serve static files with a web server
3. Configure environment variables for production API endpoints

## Contributing

1. Create a feature branch
2. Make your changes
3. Add tests if applicable
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.

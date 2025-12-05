# TestReady.pk - Complete Backend and Student Panel

A comprehensive test preparation platform with student dashboard, admin panel, and WhatsApp notifications.

## 🚀 Features

### Student Features
- **Registration & Login**: Secure authentication with JWT tokens
- **Profile Completion**: Collect school, age, class, and WhatsApp details on first login
- **Test Dashboard**: View available tests, progress tracking, and performance analytics
- **Test Taking**: Interactive test interface with timer and progress tracking
- **Results & Analytics**: Detailed test results with explanations and performance trends
- **WhatsApp Notifications**: Optional test result notifications via WhatsApp

### Admin Features
- **Student Management**: View, edit, delete, and export student data
- **Test Management**: Create, edit, and manage tests and questions
- **Analytics Dashboard**: View student performance statistics and trends
- **WhatsApp Integration**: Send notifications and manage consent
- **CSV Import/Export**: Bulk student management

### Security Features
- JWT authentication with secure token management
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- Encrypted WhatsApp numbers in database
- CORS protection

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** database with Prisma ORM
- **JWT** for authentication
- **Twilio** for WhatsApp integration
- **bcryptjs** for password hashing

### Frontend
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **TanStack Query** for data fetching

## 📦 Installation & Setup

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/testready_db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_EXPIRES_IN="7d"
   PORT=5000
   NODE_ENV="development"
   TWILIO_ACCOUNT_SID="your-twilio-account-sid"
   TWILIO_AUTH_TOKEN="your-twilio-auth-token"
   TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
   ENCRYPTION_KEY="your-32-character-encryption-key"
   ```

4. **Set up database**:
   ```bash
   # Generate Prisma client
   npm run generate
   
   # Run database migrations
   npm run migrate
   
   # Seed the database with sample data
   npm run seed
   ```

5. **Start the backend server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd testready-pk-smartprep-main
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend development server**:
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The application uses the following main tables:

- **users**: User authentication and basic info
- **students**: Student profile information
- **admins**: Admin user information
- **tests**: Test definitions
- **questions**: Test questions with options
- **test_attempts**: Student test attempts and scores
- **notifications**: WhatsApp notification logs
- **login_logs**: Authentication logs

## 🔐 Authentication Flow

1. **Registration**: Students register with email, username, password, and basic info
2. **Profile Completion**: On first login, students complete their profile with school, age, class, and WhatsApp details
3. **JWT Tokens**: Secure authentication using JWT tokens with 7-day expiration
4. **Role-based Access**: Different access levels for students and admins

## 📱 WhatsApp Integration

- **Twilio WhatsApp API**: Send test result notifications
- **Consent Management**: Students must explicitly consent to receive notifications
- **Encrypted Storage**: WhatsApp numbers are encrypted in the database
- **Notification Logs**: Track all notification attempts and status

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### Student
- `POST /api/students/profile/complete` - Complete student profile
- `GET /api/students/profile` - Get student profile
- `PUT /api/students/profile` - Update student profile
- `GET /api/students/progress` - Get student progress

### Tests
- `GET /api/tests` - Get available tests
- `GET /api/tests/:id` - Get test details
- `POST /api/tests/:id/start` - Start test attempt
- `POST /api/tests/submit` - Submit test answers
- `GET /api/tests/history/all` - Get test history

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/students` - Get students list
- `GET /api/admin/students/export` - Export students to CSV
- `POST /api/admin/students/import` - Import students from CSV
- `GET /api/admin/tests` - Get all tests
- `POST /api/admin/tests` - Create new test
- `PUT /api/admin/tests/:id` - Update test
- `DELETE /api/admin/tests/:id` - Delete test

### WhatsApp
- `POST /api/whatsapp/send` - Send WhatsApp message
- `POST /api/whatsapp/test-result/:attemptId` - Send test result notification
- `GET /api/whatsapp/logs` - Get notification logs

## 🧪 Testing

### Sample Data
The database is seeded with:
- Admin user: `admin@testready.pk` / `admin123`
- Sample student: `student@testready.pk` / `student123`
- Sample biology test with 5 questions

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run migrate      # Run database migrations
npm run generate     # Generate Prisma client
npm run studio       # Open Prisma Studio
```

### Frontend Development
```bash
cd testready-pk-smartprep-main
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/testready_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV="development"
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
ENCRYPTION_KEY="your-32-character-encryption-key"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
UPLOAD_PATH="./uploads"
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npm run migrate`
4. Build and start: `npm run build && npm start`

### Frontend Deployment
1. Configure API URL in environment variables
2. Build: `npm run build`
3. Deploy the `dist` folder to your hosting service

## 📞 Support

For support and questions, please contact the development team.

## 📄 License

This project is licensed under the MIT License.
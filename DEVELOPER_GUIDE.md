# 🛠️ Developer Guide: Appointment Booking System

This guide is designed for developers, system administrators, and technical users who need to understand the technical architecture, API endpoints, and development setup of the Appointment Booking System.

## 🎯 Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Development Setup](#development-setup)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Authentication System](#authentication-system)
7. [Component Structure](#component-structure)
8. [State Management](#state-management)
9. [Testing & Deployment](#testing--deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🏗️ System Architecture

### Overview
The Appointment Booking System follows a **client-server architecture** with a **React frontend** and **Spring Boot backend**.

```
┌─────────────────┐    HTTP/HTTPS    ┌─────────────────┐
│   Frontend      │ ◄──────────────► │    Backend      │
│   (Next.js)     │                  │  (Spring Boot)  │
└─────────────────┘                  └─────────────────┘
         │                                     │
         │                                     │
         ▼                                     ▼
┌─────────────────┐                  ┌─────────────────┐
│   Browser       │                  │   Database      │
│   Storage       │                  │   (MySQL/PostgreSQL) │
└─────────────────┘                  └─────────────────┘
```

### Frontend Architecture
- **Next.js 14** with App Router
- **React 18** with functional components and hooks
- **Material-UI** for component library
- **Tailwind CSS** for utility-first styling
- **Context API** for global state management

### Backend Architecture
- **Spring Boot 3.x** with Java 17+
- **Spring Security** for authentication and authorization
- **Spring Data JPA** for data persistence
- **MySQL/PostgreSQL** for data storage
- **JWT** for stateless authentication

---

## 🚀 Technology Stack

### Frontend Technologies

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **Next.js** | 14.x | React framework with SSR/SSG | [Next.js Docs](https://nextjs.org/docs) |
| **React** | 18.x | UI library | [React Docs](https://react.dev/) |
| **Material-UI** | 7.x | Component library | [MUI Docs](https://mui.com/) |
| **Tailwind CSS** | 3.x | Utility-first CSS | [Tailwind Docs](https://tailwindcss.com/) |
| **React Hook Form** | 7.x | Form handling | [RHF Docs](https://react-hook-form.com/) |
| **Axios** | 1.x | HTTP client | [Axios Docs](https://axios-http.com/) |
| **date-fns** | 2.x | Date manipulation | [date-fns Docs](https://date-fns.org/) |

### Backend Technologies

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **Spring Boot** | 3.x | Java framework | [Spring Docs](https://spring.io/projects/spring-boot) |
| **Java** | 17+ | Programming language | [Java Docs](https://docs.oracle.com/en/java/) |
| **Spring Security** | 6.x | Security framework | [Spring Security Docs](https://spring.io/projects/spring-security) |
| **Spring Data JPA** | 3.x | Data persistence | [Spring Data Docs](https://spring.io/projects/spring-data-jpa) |
| **MySQL/PostgreSQL** | 8.x/14.x | Database | [MySQL Docs](https://dev.mysql.com/doc/) / [PostgreSQL Docs](https://www.postgresql.org/docs/) |

### Development Tools

| Tool | Purpose | Configuration |
|------|---------|---------------|
| **ESLint** | Code linting | `.eslintrc.js` |
| **Prettier** | Code formatting | `.prettierrc` |
| **Husky** | Git hooks | `.husky/` |
| **lint-staged** | Pre-commit linting | `package.json` |

---

## 🛠️ Development Setup

### Prerequisites

#### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher (or yarn 1.22+)
- **Java**: 17 or higher
- **Database**: MySQL 8.0+ or PostgreSQL 14+
- **Git**: Latest version

#### IDE Recommendations
- **Frontend**: VS Code with React extensions
- **Backend**: IntelliJ IDEA, Eclipse, or VS Code with Java extensions

### Frontend Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd appointment-booking
```

#### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

#### 3. Environment Configuration
Create `.env.local` file:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true
```

#### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

#### 5. Access Application
Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Setup

#### 1. Clone Backend Repository
```bash
git clone <backend-repository-url>
cd appointment-booking-backend
```

#### 2. Configure Database
Update `application.properties`:
```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/appointment_booking
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT Configuration
jwt.secret=your_jwt_secret_key_here
jwt.expiration=86400000
```

#### 3. Run Backend
```bash
./mvnw spring-boot:run
# or
mvn spring-boot:run
```

#### 4. Verify Backend
Check [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

---

## 🌐 API Documentation

### Base URL
```
http://localhost:8080/api
```

### Authentication Endpoints

#### POST /api/auth/register
**Description**: Register a new user account

**Request Body**:
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "role": "USER"
  }
}
```

#### POST /api/auth/login
**Description**: Authenticate user and get JWT token

**Request Body**:
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "role": "USER"
    }
  }
}
```

### Appointment Endpoints

#### GET /api/appointments
**Description**: Get appointments (user's or all for admin)

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `status`: Filter by status (PENDING, COMPLETED, CANCELLED)
- `date`: Filter by specific date (YYYY-MM-DD)
- `page`: Page number for pagination
- `size`: Page size for pagination

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "fullName": "John Doe",
      "email": "john.doe@example.com",
      "bookedDate": "2024-01-15",
      "bookedTime": "14:00",
      "notes": "Regular checkup",
      "bookingStatus": "PENDING",
      "createdAt": "2024-01-10T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "size": 10,
    "totalElements": 1,
    "totalPages": 1
  }
}
```

#### POST /api/appointments
**Description**: Create a new appointment

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "date": "2024-01-15",
  "time": "14:00",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "notes": "Regular checkup appointment"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "data": {
    "id": 1,
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "bookedDate": "2024-01-15",
    "bookedTime": "14:00",
    "notes": "Regular checkup appointment",
    "bookingStatus": "PENDING"
  }
}
```

#### PUT /api/appointments/{id}
**Description**: Update appointment status

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "bookingStatus": "COMPLETED"
}
```

#### DELETE /api/appointments/{id}
**Description**: Cancel appointment

**Headers**:
```
Authorization: Bearer <jwt_token>
```

### User Endpoints

#### GET /api/users/profile
**Description**: Get current user profile

**Headers**:
```
Authorization: Bearer <jwt_token>
```

#### PUT /api/users/profile
**Description**: Update user profile

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "fullName": "John Smith",
  "email": "john.smith@example.com"
}
```

### Error Responses

#### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "timestamp": "2024-01-10T10:00:00Z"
}
```

#### Common Error Codes
- `AUTHENTICATION_FAILED`: Invalid credentials
- `UNAUTHORIZED`: Missing or invalid token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid input data
- `INTERNAL_SERVER_ERROR`: Server-side error

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Appointments Table
```sql
CREATE TABLE appointments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    booked_date DATE NOT NULL,
    booked_time TIME NOT NULL,
    notes TEXT,
    booking_status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### Indexes
```sql
-- Performance optimization indexes
CREATE INDEX idx_appointments_date ON appointments(booked_date);
CREATE INDEX idx_appointments_status ON appointments(booking_status);
CREATE INDEX idx_appointments_user ON appointments(user_id);
CREATE INDEX idx_users_email ON users(email);
```

---

## 🔐 Authentication System

### JWT Token Structure

#### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### Payload
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1642348800,
  "exp": 1642435200
}
```

#### Claims
- `sub`: Subject (user ID)
- `email`: User's email address
- `role`: User role (USER/ADMIN)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp

### Security Implementation

#### Frontend Security
```javascript
// Token storage in localStorage
localStorage.setItem('authToken', token);

// Automatic token inclusion in requests
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Token refresh logic
const refreshToken = async () => {
  try {
    const response = await authAPI.refreshToken();
    localStorage.setItem('authToken', response.data.token);
  } catch (error) {
    // Redirect to login if refresh fails
    router.push('/login');
  }
};
```

#### Backend Security
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

---

## 🧩 Component Structure

### Page Components

#### App Router Structure
```
app/
├── page.jsx                 # Landing page
├── layout.jsx               # Root layout
├── globals.css              # Global styles
├── login/
│   └── page.jsx            # Login page
├── register/
│   └── page.jsx            # Registration page
├── dashboard/
│   └── page.jsx            # User dashboard
├── appointments/
│   ├── page.jsx            # Appointments list
│   └── book/
│       └── page.jsx        # Booking page
├── profile/
│   └── page.jsx            # Profile management
└── admin/
    └── page.jsx            # Admin panel
```

### Reusable Components

#### Core Components
```javascript
// components/Navigation.jsx
export default function Navigation() {
  // Navigation logic
}

// components/Calendar.jsx
export default function AppointmentCalendar() {
  // Calendar functionality
}

// components/AppointmentCard.jsx
export default function AppointmentCard() {
  // Appointment display
}
```

#### Form Components
```javascript
// components/LoginForm.jsx
export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  // Form logic
}

// components/RegisterForm.jsx
export default function RegisterForm() {
  // Registration form logic
}
```

### Component Patterns

#### Functional Components with Hooks
```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function ExampleComponent() {
  const [data, setData] = useState(null);
  const { user } = useAuth();
  
  useEffect(() => {
    // Component logic
  }, []);
  
  return (
    // JSX
  );
}
```

#### Custom Hooks
```javascript
// hooks/useAppointments.js
export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchAppointments = async () => {
    // Fetch logic
  };
  
  return { appointments, loading, fetchAppointments };
};
```

---

## 📊 State Management

### Context API Implementation

#### AuthContext
```javascript
// contexts/AuthContext.jsx
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const login = async (credentials) => {
    // Login logic
  };
  
  const logout = () => {
    // Logout logic
  };
  
  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin: user?.role === 'ADMIN'
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Usage in Components
```javascript
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedComponent() {
  const { user, isAdmin } = useAuth();
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      Welcome, {user.fullName}!
      {isAdmin && <AdminPanel />}
    </div>
  );
}
```

### Local State Management

#### useState for Component State
```javascript
const [selectedDate, setSelectedDate] = useState(null);
const [selectedTime, setSelectedTime] = useState('');
const [submitting, setSubmitting] = useState(false);
```

#### useEffect for Side Effects
```javascript
useEffect(() => {
  if (user) {
    fetchAppointments();
  }
}, [user]);
```

---

## 🧪 Testing & Deployment

### Testing Strategy

#### Frontend Testing
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

#### Test Examples
```javascript
// __tests__/components/AppointmentCard.test.jsx
import { render, screen } from '@testing-library/react';
import AppointmentCard from '../../components/AppointmentCard';

describe('AppointmentCard', () => {
  test('renders appointment information', () => {
    const appointment = {
      fullName: 'John Doe',
      bookedDate: '2024-01-15',
      bookedTime: '14:00'
    };
    
    render(<AppointmentCard appointment={appointment} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });
});
```

### Deployment

#### Frontend Deployment

##### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
```

##### Netlify
```bash
# Build the project
npm run build

# Deploy to Netlify
# Upload dist/ folder or connect Git repository
```

#### Backend Deployment

##### Docker
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/appointment-booking-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

```bash
# Build Docker image
docker build -t appointment-booking .

# Run container
docker run -p 8080:8080 appointment-booking
```

##### Traditional Server
```bash
# Build JAR file
mvn clean package

# Run on server
java -jar target/appointment-booking-*.jar
```

### Environment Configuration

#### Production Environment
```env
# Frontend (.env.production)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NODE_ENV=production

# Backend (application-prod.properties)
spring.profiles.active=prod
spring.datasource.url=jdbc:mysql://prod-db:3306/appointment_booking
jwt.secret=${JWT_SECRET}
```

---

## 🚨 Troubleshooting

### Common Development Issues

#### Frontend Issues

**Port Already in Use**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**API Connection Issues**
```bash
# Check backend status
curl http://localhost:8080/actuator/health

# Verify CORS configuration
# Check browser console for CORS errors
```

#### Backend Issues

**Database Connection**
```bash
# Check database status
mysql -u root -p -e "SHOW DATABASES;"

# Verify connection properties
# Check firewall settings
```

**Port Conflicts**
```bash
# Check what's using port 8080
netstat -tulpn | grep :8080

# Use different port
java -jar app.jar --server.port=8081
```

### Performance Optimization

#### Frontend Optimization
```javascript
// Lazy loading components
const LazyComponent = lazy(() => import('./LazyComponent'));

// Memoization for expensive calculations
const memoizedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// Debounced API calls
const debouncedSearch = useCallback(
  debounce((query) => {
    searchAPI(query);
  }, 300),
  []
);
```

#### Backend Optimization
```java
// Database query optimization
@Query("SELECT a FROM Appointment a WHERE a.user.id = :userId AND a.bookingStatus = :status")
List<Appointment> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);

// Caching frequently accessed data
@Cacheable("appointments")
public List<Appointment> getUpcomingAppointments() {
    // Implementation
}
```

---

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)

### Community
- [Next.js GitHub](https://github.com/vercel/next.js)
- [React GitHub](https://github.com/facebook/react)
- [Spring Framework GitHub](https://github.com/spring-projects/spring-framework)

### Learning Resources
- [React Tutorial](https://react.dev/learn)
- [Next.js Tutorial](https://nextjs.org/learn)
- [Spring Boot Tutorial](https://spring.io/guides)

---

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Code Standards
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

### Pull Request Guidelines
- Clear description of changes
- Screenshots for UI changes
- Test coverage for new features
- Documentation updates
- Link to related issues

---

**Happy Coding! 🚀**

*This developer guide provides comprehensive technical information for working with the Appointment Booking System. For user-focused documentation, see the [User Guide](USER_GUIDE.md).*

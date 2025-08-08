# Appointment Booking System

A modern, full-stack appointment booking system built with Next.js, React, and JavaScript. This application provides a complete solution for managing appointments with user authentication, role-based access control, and a clean, responsive UI.

## Features

### For Users
- **User Registration & Authentication**: Secure signup and login system
- **Appointment Booking**: Interactive calendar with real-time availability
- **Appointment Management**: View, cancel, and manage personal appointments
- **Profile Management**: Update personal information and account settings

### For Administrators
- **Admin Dashboard**: Comprehensive overview of all appointments
- **Appointment Management**: View, cancel, and reschedule any appointment
- **User Management**: Access to all user information and appointments
- **System Statistics**: Real-time statistics and analytics

### Technical Features
- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Real-time Calendar**: Interactive calendar component with availability checking
- **Form Validation**: Comprehensive client-side and server-side validation
- **Error Handling**: Robust error handling and user feedback
- **JavaScript**: Modern JavaScript with ES6+ features
- **API Integration**: RESTful API integration with Spring Boot backend

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: Modern React with hooks
- **JavaScript**: Modern JavaScript with ES6+ features
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form handling and validation
- **React Calendar**: Calendar component for date selection
- **Lucide React**: Beautiful icon library
- **Axios**: HTTP client for API requests

### Backend Integration
- **Spring Boot**: Java backend (separate repository)
- **RESTful APIs**: Standard REST endpoints
- **JWT Authentication**: Secure token-based authentication
- **CORS Support**: Cross-origin resource sharing

## Project Structure

```
appointment-booking/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   ├── appointments/      # Appointment management pages
│   ├── dashboard/         # User dashboard
│   ├── login/            # Authentication pages
│   ├── profile/          # User profile management
│   ├── register/         # User registration
│   ├── globals.css       # Global styles
│   ├── layout.jsx        # Root layout
│   └── page.jsx          # Landing page
├── components/           # Reusable React components
│   ├── AppointmentCard.jsx
│   ├── Calendar.jsx
│   ├── LoginForm.jsx
│   ├── Navigation.jsx
│   └── RegisterForm.jsx
├── contexts/            # React contexts
│   └── AuthContext.jsx
├── lib/                 # Utility libraries
│   ├── api.js          # API client and endpoints
│   └── utils.js        # Utility functions
├── types/              # JavaScript constants and utilities
│   └── index.js
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
└── README.md          # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Spring Boot backend running (see backend repository)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd appointment-booking
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Backend Setup

This frontend application is designed to work with a Spring Boot backend. Make sure your backend is running on `http://localhost:8080` and provides the following API endpoints:

#### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

#### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

#### Appointment Endpoints
- `GET /api/appointments` - Get appointments (user's or all for admin)
- `GET /api/appointments/{id}` - Get specific appointment
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Cancel appointment
- `GET /api/appointments/available` - Get available dates and times

## Usage

### For Regular Users

1. **Registration/Login**
   - Visit `/register` to create a new account
   - Visit `/login` to sign in to existing account

2. **Booking Appointments**
   - Navigate to `/appointments/book`
   - Select an available date from the calendar
   - Choose an available time slot
   - Add optional notes
   - Confirm booking

3. **Managing Appointments**
   - View all appointments at `/appointments`
   - Cancel upcoming appointments
   - View appointment history

### For Administrators

1. **Admin Access**
   - Login with admin credentials
   - Access admin panel at `/admin`

2. **System Management**
   - View all appointments across all users
   - Cancel or reschedule any appointment
   - Monitor system statistics
   - Filter appointments by status

## API Integration

The application uses Axios for API communication with automatic token management:

```typescript
// Example API call
const response = await appointmentAPI.createAppointment({
  date: '2024-01-15',
  time: '14:00',
  notes: 'Optional notes'
});
```

### Authentication Flow

1. User submits login/register form
2. Backend validates credentials and returns JWT token
3. Token is stored in localStorage
4. All subsequent API calls include the token in Authorization header
5. Token is automatically refreshed or user is redirected to login on expiration

## Styling

The application uses Tailwind CSS with custom utility classes:

```css
/* Custom button styles */
.btn-primary {
  @apply bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200;
}

/* Custom input styles */
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- Use JavaScript for all components and utilities
- Follow React hooks best practices
- Use functional components with hooks
- Implement proper error handling
- Add loading states for better UX

### Component Structure

Components are organized by functionality:
- **Forms**: Login, registration, and appointment booking forms
- **Layout**: Navigation and page layouts
- **UI**: Reusable UI components like cards and calendars
- **Contexts**: Global state management

## Deployment

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm run start
   ```

### Environment Variables

For production, set the following environment variables:
- `NEXT_PUBLIC_API_URL`: Your production API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

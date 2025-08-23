# 📅 Appointment Booking System

A modern, full-stack appointment booking system built with **Next.js 14**, **React 18**, and **Material-UI**. This application provides a complete solution for managing appointments with user authentication, role-based access control, and an intuitive, responsive user interface.

## 🎯 What This App Is About

The **Appointment Booking System** is designed to streamline the process of scheduling and managing appointments. It serves two main user types:

- **👥 Regular Users**: Can book appointments, view their schedule, and manage their bookings
- **👨‍💼 Administrators**: Can oversee all appointments, manage users, and control the system

### Key Features

✅ **User Authentication & Registration**  
✅ **Interactive Calendar Booking**  
✅ **Real-time Availability Checking**  
✅ **Appointment Management**  
✅ **Admin Dashboard**  
✅ **Responsive Design**  
✅ **Form Validation**  
✅ **Error Handling**  

## 🚀 How to Get Started

### Prerequisites

- **Node.js 18+** installed on your system
- **npm** or **yarn** package manager
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Step 1: Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd appointment-booking
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 How to Use the Application

### 🔐 First Time Setup

#### 1. Create Your Account
- Click **"Get Started"** on the homepage
- Fill in your details:
  - Full Name
  - Email Address
  - Password
- Click **"Create Account"**

#### 2. Log In
- Enter your email and password
- Click **"Sign In"**
- You'll be redirected to your dashboard

### 📅 Booking Your First Appointment

#### Step 1: Navigate to Booking
- From your dashboard, click **"Book New Appointment"**
- Or go directly to `/appointments/book`

#### Step 2: Select Date & Time
- **Choose a Date**: Click on an available date in the calendar
- **Pick a Time**: Select an available time slot from the list
- Available slots are highlighted in green

#### Step 3: Confirm Details
- Your information is automatically filled in
- Add any **notes** or special requirements
- Click **"Book Your Appointment"**

#### Step 4: Confirmation
- You'll see a success message
- You'll be redirected to view all your appointments

### 📋 Managing Your Appointments

#### View All Appointments
- Go to **Dashboard** → **"View All Appointments"**
- Or navigate to `/appointments`

#### Cancel an Appointment
- Find the appointment you want to cancel
- Click the **cancel button** (🗑️ icon)
- Confirm the cancellation

#### Appointment Status
- **🟡 PENDING**: Your appointment is confirmed
- **🟢 COMPLETED**: Appointment has been completed
- **🔴 CANCELLED**: Appointment was cancelled

### 👨‍💼 For Administrators

#### Access Admin Panel
- Login with admin credentials
- Navigate to `/admin` or click **"Admin Panel"**

#### Admin Features
- **View All Appointments**: See every appointment in the system
- **Manage Users**: Access user information and appointments
- **System Statistics**: Monitor booking trends and system usage
- **Filter Appointments**: Sort by status (Scheduled, Completed, Cancelled)

#### Booking for Clients
- Go to **"Book New Appointment"**
- Select date and time
- Enter client's name and email
- Add any special notes
- Confirm booking

## 🏗️ Application Structure

```
appointment-booking/
├── 📁 app/                    # Next.js App Router pages
│   ├── 🏠 page.jsx           # Landing page
│   ├── 🔐 login/             # Login page
│   ├── 📝 register/          # Registration page
│   ├── 📊 dashboard/         # User dashboard
│   ├── 📅 appointments/      # Appointment management
│   │   └── 📖 book/         # Booking page
│   ├── 👤 profile/          # User profile
│   ├── ⚙️ admin/            # Admin panel
│   └── 🎨 globals.css       # Global styles
├── 📁 components/            # Reusable React components
│   ├── 📅 Calendar.jsx      # Interactive calendar
│   ├── 🧭 Navigation.jsx    # Navigation bar
│   ├── 📋 AppointmentCard.jsx # Appointment display
│   └── 🔐 Auth forms        # Login/Register forms
├── 📁 contexts/             # React contexts
│   └── 🔐 AuthContext.jsx   # Authentication state
├── 📁 lib/                  # Utility libraries
│   ├── 🌐 api.js            # API client
│   └── 🛠️ utils.js         # Helper functions
└── 📁 types/                # Type definitions
```

## 🎨 User Interface Guide

### Navigation
- **Home**: Landing page with app overview
- **Dashboard**: Your personal appointment overview
- **Book Appointment**: Schedule new appointments
- **My Appointments**: View and manage your bookings
- **Profile**: Update your account information
- **Admin Panel**: System management (admin only)

### Color Coding
- **🟢 Green**: Available time slots, completed appointments
- **🟡 Yellow**: Pending appointments
- **🔴 Red**: Cancelled appointments, errors
- **🔵 Blue**: Primary actions, selected items

### Icons
- **📅 Calendar**: Date selection
- **🕐 Clock**: Time selection
- **👤 User**: Profile and user management
- **➕ Plus**: Add new appointments
- **❌ Cancel**: Remove appointments

## 🔧 Technical Details

### Built With
- **Frontend**: Next.js 14, React 18, Material-UI
- **Styling**: Tailwind CSS, Material-UI components
- **Forms**: React Hook Form with validation
- **State Management**: React Context API
- **HTTP Client**: Axios for API calls
- **Date Handling**: date-fns library

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚨 Troubleshooting

### Common Issues

#### Can't Book Appointment
- **Check**: Are you logged in?
- **Check**: Is the time slot still available?
- **Check**: Is the date in the future?

#### Calendar Not Loading
- **Refresh**: Try refreshing the page
- **Browser**: Clear browser cache
- **Network**: Check your internet connection

#### Login Issues
- **Credentials**: Verify email and password
- **Account**: Make sure you've registered
- **Browser**: Try a different browser

### Getting Help
- Check the console for error messages
- Verify your backend API is running
- Ensure all environment variables are set

## 📱 Mobile Experience

The application is fully responsive and works great on:
- 📱 Smartphones
- 📱 Tablets
- 💻 Desktop computers
- 🖥️ Large displays

### Mobile Tips
- **Touch-friendly**: All buttons are sized for touch
- **Swipe gestures**: Navigate between sections easily
- **Responsive calendar**: Optimized for small screens

## 🔒 Security Features

- **JWT Authentication**: Secure token-based login
- **Password Protection**: Encrypted password storage
- **Session Management**: Automatic token refresh
- **Role-based Access**: Admin vs. regular user permissions
- **Input Validation**: Client and server-side validation

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check this README first
- **Issues**: Open a GitHub issue
- **Questions**: Contact the development team

---

**Happy Booking! 🎉**

*This application makes appointment scheduling simple, efficient, and user-friendly.*

import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext.jsx'
import ThemeProvider from '../components/ThemeProvider.jsx'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Appointment Booking System',
  description: 'A modern appointment booking system built with Next.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

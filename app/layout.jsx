import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext.jsx'
import { ColorModeProvider } from '../contexts/ColorModeContext.jsx'
import ThemeProvider from '../components/ThemeProvider.jsx'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Appointment Booking System',
  description: 'A modern appointment booking system.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ColorModeProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </ColorModeProvider>
      </body>
    </html>
  )
}

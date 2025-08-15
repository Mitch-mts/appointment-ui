'use client';

import { useRouter } from 'next/navigation';
import { User, Shield, ArrowLeft } from 'lucide-react';

export default function GetStartedPage() {
  const router = useRouter();

  const handleUserTypeSelection = (userType) => {
    if (userType === 'client') {
      router.push('/register');
    } else if (userType === 'admin') {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Get Started
          </h1>
          <p className="text-gray-600">
            Choose how you'd like to use our appointment booking system
          </p>
        </div>

        {/* User Type Selection Cards */}
        <div className="space-y-4">
          {/* Client Card */}
          <div
            onClick={() => handleUserTypeSelection('client')}
            className="bg-white rounded-lg border-2 border-gray-200 p-6 cursor-pointer hover:border-primary-500 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <User className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                  I'm a Client
                </h3>
                <p className="text-gray-600 text-sm">
                  Book appointments, manage your schedule, and view your history
                </p>
              </div>
            </div>
          </div>

          {/* Admin Card */}
          <div
            onClick={() => handleUserTypeSelection('admin')}
            className="bg-white rounded-lg border-2 border-gray-200 p-6 cursor-pointer hover:border-primary-500 hover:shadow-lg transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <Shield className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">
                  I'm an Admin
                </h3>
                <p className="text-gray-600 text-sm">
                  Manage appointments, users, and system settings
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

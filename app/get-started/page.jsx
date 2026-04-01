'use client';

import { useRouter } from 'next/navigation';
import { User, Shield, ArrowLeft } from 'lucide-react';
import ColorModeToggle from '../../components/ColorModeToggle.jsx';

export default function GetStartedPage() {
  const router = useRouter();

  const handleUserTypeSelection = (userType) => {
    if (userType === 'client') {
      router.push('/register');
    } else if (userType === 'admin') {
      router.push('/login');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-950">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <ColorModeToggle />
      </div>
      <div className="mx-auto w-full max-w-md px-4">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-8 flex items-center text-gray-600 transition-colors hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-slate-100">
            Get Started
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Choose how you'd like to use our appointment booking system
          </p>
        </div>

        {/* User Type Selection Cards */}
        <div className="space-y-4">
          {/* Client Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleUserTypeSelection('client')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleUserTypeSelection('client');
              }
            }}
            className="group cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-6 transition-all duration-200 hover:border-primary-500 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:hover:border-primary-400"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 transition-colors group-hover:bg-primary-200 dark:bg-primary-900/40 dark:group-hover:bg-primary-800/50">
                  <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-primary-700 dark:text-slate-100 dark:group-hover:text-primary-400">
                  I'm a Client
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Book appointments, manage your schedule, and view your history
                </p>
              </div>
            </div>
          </div>

          {/* Admin Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => handleUserTypeSelection('admin')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleUserTypeSelection('admin');
              }
            }}
            className="group cursor-pointer rounded-lg border-2 border-gray-200 bg-white p-6 transition-all duration-200 hover:border-primary-500 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:hover:border-primary-400"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 transition-colors group-hover:bg-primary-200 dark:bg-primary-900/40 dark:group-hover:bg-primary-800/50">
                  <Shield className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-primary-700 dark:text-slate-100 dark:group-hover:text-primary-400">
                  I'm an Admin
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Manage appointments, users, and system settings
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

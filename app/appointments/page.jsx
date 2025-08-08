'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation.jsx';
import AppointmentCard from '@/components/AppointmentCard.jsx';
import { appointmentAPI } from '@/lib/api.js';
import { Plus, Filter } from 'lucide-react';
import Link from 'next/link';

export default function AppointmentsPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getAppointments();
      if (response.success && response.data) {
        setAppointments(response.data);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      const response = await appointmentAPI.cancelAppointment(id);
      if (response.success) {
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    switch (filter) {
      case 'scheduled':
        return appointment.status === 'SCHEDULED';
      case 'completed':
        return appointment.status === 'COMPLETED';
      case 'cancelled':
        return appointment.status === 'CANCELLED';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="mt-2 text-gray-600">
              {isAdmin ? 'Manage all appointments' : 'View and manage your appointments'}
            </p>
          </div>
          <Link
            href="/appointments/book"
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Book Appointment</span>
          </Link>
        </div>

        {/* Filter */}
        <div className="card mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'scheduled', label: 'Scheduled' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' },
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {loadingAppointments ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancel={handleCancelAppointment}
                showUserInfo={isAdmin}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'You don\'t have any appointments yet.'
                : `No ${filter} appointments found.`
              }
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="btn-primary"
              >
                View all appointments
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

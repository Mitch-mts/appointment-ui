'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation.jsx';
import AppointmentCalendar from '@/components/Calendar.jsx';
import { appointmentAPI } from '@/lib/api.js';
import { format } from 'date-fns';
import { Calendar, Clock, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BookAppointmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const onSubmit = async (data) => {
    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const appointmentData = {
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        notes: data.notes,
      };

      const response = await appointmentAPI.createAppointment(appointmentData);
      if (response.success) {
        router.push('/appointments?success=true');
      } else {
        setError(response.message || 'Failed to book appointment');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/appointments"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
          <p className="mt-2 text-gray-600">Select a date and time for your appointment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div>
            <AppointmentCalendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              onTimeSelect={handleTimeSelect}
              selectedTime={selectedTime}
              showTimeSlots={true}
            />
          </div>

          {/* Booking Form */}
          <div>
            <div className="card">
              <h2 className="text-xl font-semibold mb-6">Appointment Details</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Selected Date and Time Display */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500">Selected Date</p>
                      <p className="font-medium text-gray-900">
                        {selectedDate ? format(selectedDate, 'EEEE, MMMM dd, yyyy') : 'Not selected'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-500">Selected Time</p>
                      <p className="font-medium text-gray-900">
                        {selectedTime || 'Not selected'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes Field */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="h-4 w-4 inline mr-2" />
                    Notes (Optional)
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={4}
                    className="input-field"
                    placeholder="Add any additional notes or special requirements..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedDate || !selectedTime || submitting}
                  className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Booking Appointment...
                    </div>
                  ) : (
                    'Book Appointment'
                  )}
                </button>
              </form>
            </div>

            {/* Instructions */}
            <div className="card mt-6">
              <h3 className="text-lg font-semibold mb-4">How to Book</h3>
              <ol className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                    1
                  </span>
                  Select an available date from the calendar
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                    2
                  </span>
                  Choose an available time slot
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                    3
                  </span>
                  Add any optional notes
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                    4
                  </span>
                  Click "Book Appointment" to confirm
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

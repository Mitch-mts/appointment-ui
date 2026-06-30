'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRequireAuth } from '../../hooks/useRequireAuth.js';
import AppointmentsListSkeleton from '../../components/AppointmentsListSkeleton.jsx';
import { hasCachedSession } from '../../lib/sessionUser.js';
import AppointmentCard from '../../components/AppointmentCard.jsx';
import RescheduleDialog from '../../components/RescheduleDialog.jsx';
import { appointmentAPI } from '../../lib/api';
import { collectAllPages } from '../../lib/pagination';
import { providerAPI } from '../../lib/providers.js';
import { buildProvidersMap } from '../../lib/appointmentHelpers.js';
import { Plus, Filter } from 'lucide-react';
import Link from 'next/link';

export default function AppointmentsPage() {
  const { user, isAdmin, showAuthSpinner, ready } = useRequireAuth();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const fetchGeneration = useRef(0);
  const hasListData = useRef(false);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [providersById, setProvidersById] = useState({});
  const [rescheduleTarget, setRescheduleTarget] = useState(null);

  const userEmail = user?.email;

  const fetchProviders = useCallback(async () => {
    try {
      const res = await providerAPI.listProviders();
      if (res?.success && Array.isArray(res.data)) {
        setProvidersById(buildProvidersMap(res.data));
      }
    } catch {
      setProvidersById({});
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    if (!userEmail) return;

    const generation = ++fetchGeneration.current;
    if (!hasListData.current) setLoadingAppointments(true);

    try {
      const items = isAdmin
        ? await collectAllPages((page) =>
            appointmentAPI.getAllAppointments({ page, size: 50 })
          )
        : await collectAllPages((page) =>
            appointmentAPI.getUserAppointments(userEmail, { page, size: 50 })
          );
      if (generation !== fetchGeneration.current) return;
      setAppointments(items);
      hasListData.current = items.length > 0;
    } catch (error) {
      if (generation !== fetchGeneration.current) return;
      console.error('Error fetching appointments:', error);
    } finally {
      if (generation === fetchGeneration.current) {
        setLoadingAppointments(false);
      }
    }
  }, [userEmail, isAdmin]);

  useEffect(() => {
    if (!userEmail) return;
    fetchAppointments();
    fetchProviders();
  }, [userEmail, isAdmin, fetchAppointments, fetchProviders]);

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

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await appointmentAPI.updateAppointmentStatus(id, newStatus);
      if (response && response.success) {
        // Successfully updated the status, refresh the appointments
        await fetchAppointments();
        console.log(`Appointment ${id} status updated to ${newStatus}`);
      } else {
        // API call succeeded but returned an error
        throw new Error(response?.message || 'Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      // Re-throw the error so the AppointmentCard can handle it
      throw error;
    }
  };

  const handleDeleteAppointment = async (id) => {
    try {
      const response = await appointmentAPI.deleteAppointment(id);
      if (response && response.success) {
        // Successfully deleted the appointment, refresh the list
        await fetchAppointments();
        console.log(`Appointment ${id} deleted successfully`);
      } else {
        // API call succeeded but returned an error
        throw new Error(response?.message || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    switch (filter) {
      case 'scheduled':
        return appointment.bookingStatus === 'SCHEDULED';
      case 'completed':
        return appointment.bookingStatus === 'COMPLETED';
      case 'cancelled':
        return appointment.bookingStatus === 'CANCELLED';
      case 'pending':
        return (
          appointment.bookingStatus === 'PENDING' ||
          appointment.bookingStatus === 'SCHEDULED' ||
          appointment.bookingStatus === null
        );
      default:
        return true;
    }
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  if (showAuthSpinner && !hasCachedSession()) {
    return <AppointmentsListSkeleton />;
  }
  if (!ready) return null;

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Appointments</h1>
            <p className="mt-2 text-gray-600 dark:text-slate-400">
              {isAdmin ? 'Manage all appointments across the system' : 'View and manage your personal appointments'}
            </p>
          </div>
          <Link
            href="/appointments/book"
            prefetch
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Book Appointment</span>
          </Link>
        </div>

        {/* Filter */}
        <div className="card mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-500 dark:text-slate-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Filter:</span>
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'pending', label: 'Upcoming' },
                { key: 'scheduled', label: 'Scheduled' },
                { key: 'completed', label: 'Completed' },
                { key: 'cancelled', label: 'Cancelled' },
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  type="button"
                  onClick={() => setFilter(filterOption.key)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    filter === filterOption.key
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appointments List */}
        {loadingAppointments && appointments.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card h-28 animate-pulse bg-slate-100 dark:bg-slate-800/60" />
            ))}
          </div>
        ) : currentAppointments.length > 0 ? (
          <div className="space-y-3">
            {currentAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancel={handleCancelAppointment}
                onReschedule={setRescheduleTarget}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteAppointment}
                showUserInfo={isAdmin}
                isAdmin={isAdmin}
                providersById={providersById}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="mb-4 text-gray-400 dark:text-slate-500">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-slate-100">No appointments found</h3>
            <p className="mb-6 text-gray-500 dark:text-slate-400">
              {filter === 'all' 
                ? 'You don\'t have any appointments yet.'
                : `No ${filter} appointments found.`
              }
            </p>
            {filter !== 'all' && (
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="btn-primary"
              >
                View all appointments
              </button>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-gray-700 dark:text-slate-300">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAppointments.length)} of {filteredAppointments.length} appointments
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <RescheduleDialog
        open={Boolean(rescheduleTarget)}
        appointment={rescheduleTarget}
        onClose={() => setRescheduleTarget(null)}
        onSuccess={fetchAppointments}
      />
    </>
  );
}

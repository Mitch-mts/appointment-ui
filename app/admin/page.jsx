'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '../../hooks/useRequireAuth.js';
import AppPageShell from '../../components/AppPageShell.jsx';
import PageSpinner from '../../components/PageSpinner.jsx';
import AppointmentCard from '../../components/AppointmentCard.jsx';
import { appointmentAPI, userAPI } from '../../lib/api';
import { getPageContent, getPageMeta } from '../../lib/pagination';
import { Calendar, Users, Filter, TrendingUp, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin, showAuthSpinner, ready } = useRequireAuth({ adminOnly: true });
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentAppointmentsPage, setCurrentAppointmentsPage] = useState(0);
  const [appointmentsMeta, setAppointmentsMeta] = useState(null);
  const [currentUsersPage, setCurrentUsersPage] = useState(0);
  const [usersMeta, setUsersMeta] = useState(null);
  const [usersPerPage] = useState(9); // 3x3 grid
  const [appointmentsPerPage] = useState(20);
  const [stats, setStats] = useState({ 
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    if (user && isAdmin) {
      fetchAppointmentStats();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAppointments(currentAppointmentsPage);
    }
  }, [user, isAdmin, filter, currentAppointmentsPage]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchUsers(currentUsersPage);
    }
  }, [user, isAdmin, currentUsersPage]);

  const bookingStatusForFilter = (activeFilter) => {
    switch (activeFilter) {
      case 'scheduled':
        return 'PENDING';
      case 'completed':
        return 'COMPLETED';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return undefined;
    }
  };

  const fetchAppointmentStats = async () => {
    try {
      const [totalRes, pendingRes, completedRes, cancelledRes] = await Promise.all([
        appointmentAPI.getAppointments({ page: 0, size: 1 }),
        appointmentAPI.getAppointments({ page: 0, size: 1, bookingStatus: 'PENDING' }),
        appointmentAPI.getAppointments({ page: 0, size: 1, bookingStatus: 'COMPLETED' }),
        appointmentAPI.getAppointments({ page: 0, size: 1, bookingStatus: 'CANCELLED' }),
      ]);

      setStats({
        total: getPageMeta(totalRes)?.totalElements ?? 0,
        scheduled: getPageMeta(pendingRes)?.totalElements ?? 0,
        completed: getPageMeta(completedRes)?.totalElements ?? 0,
        cancelled: getPageMeta(cancelledRes)?.totalElements ?? 0,
      });
    } catch (error) {
      console.error('Error fetching appointment stats:', error);
    }
  };

  const fetchAppointments = async (page = 0) => {
    try {
      setLoadingAppointments(true);
      const response = await appointmentAPI.getAppointments({
        page,
        size: appointmentsPerPage,
        bookingStatus: bookingStatusForFilter(filter),
      });
      if (response.success) {
        setAppointments(getPageContent(response));
        setAppointmentsMeta(getPageMeta(response));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchUsers = async (page = 0) => {
    try {
      setLoadingUsers(true);
      const response = await userAPI.listUsers({ page, size: usersPerPage });
      if (response.success) {
        setUsers(getPageContent(response));
        setUsersMeta(getPageMeta(response));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      const response = await appointmentAPI.cancelAppointment(id);
      if (response.success) {
        fetchAppointments(currentAppointmentsPage);
        fetchAppointmentStats();
      }
    } catch (error) {
      console.error('Error canceling appointment:', error);
    }
  };

  const filteredAppointments = appointments;

  const totalAppointmentsPages = appointmentsMeta?.totalPages ?? 1;

  const handleFilterChange = (nextFilter) => {
    setFilter(nextFilter);
    setCurrentAppointmentsPage(0);
  };

  const handleAppointmentsPageChange = (page) => {
    setCurrentAppointmentsPage(page);
  };

  const currentUsers = users;
  const totalUsersPages = usersMeta?.totalPages ?? 1;

  const handleUsersPageChange = (page) => {
    setCurrentUsersPage(page);
    // Scroll to users section when changing pages
    document.getElementById('users')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (showAuthSpinner) return <PageSpinner />;
  if (!ready) return null;

  return (
    <AppPageShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Admin Panel</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">Manage all appointments and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Appointments</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Scheduled</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{stats.scheduled}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Completed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-red-600 dark:text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Cancelled</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{stats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments */}
        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Appointments</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', 'scheduled', 'completed', 'cancelled'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleFilterChange(value)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                    filter === value
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {loadingAppointments ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600 dark:border-primary-400" />
            </div>
          ) : filteredAppointments.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={handleCancelAppointment}
                    showActions
                  />
                ))}
              </div>
              {totalAppointmentsPages > 1 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAppointmentsPageChange(currentAppointmentsPage - 1)}
                    disabled={currentAppointmentsPage === 0}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 dark:text-slate-400">
                    Page {currentAppointmentsPage + 1} of {totalAppointmentsPages}
                    {appointmentsMeta?.totalElements != null &&
                      ` (${appointmentsMeta.totalElements} total)`}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAppointmentsPageChange(currentAppointmentsPage + 1)}
                    disabled={currentAppointmentsPage >= totalAppointmentsPages - 1}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="py-8 text-center text-gray-500 dark:text-slate-400">No appointments found.</p>
          )}
        </div>
        
        {/* Users List (Admin only) */}
        <div id="users" className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Registered Users</h2>
            </div>
            {!loadingUsers && usersMeta && (
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Showing {currentUsersPage * usersPerPage + 1}-
                {Math.min((currentUsersPage + 1) * usersPerPage, usersMeta.totalElements)} of{' '}
                {usersMeta.totalElements} users
              </p>
            )}
          </div>

          {loadingUsers ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600 dark:border-primary-400" />
              <p className="mt-4 text-gray-600 dark:text-slate-400">Loading users...</p>
            </div>
          ) : users && users.length > 0 ? (
            <>
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {currentUsers.map((u) => (
                  <div key={u.id || u._id || u.email} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-slate-100">
                          {u.fullName || u.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{u.email}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {u.role || 'USER'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalUsersPages > 1 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUsersPageChange(currentUsersPage - 1)}
                    disabled={currentUsersPage === 0}
                    className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      currentUsersPage === 0
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-600'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-1">
                    {Array.from({ length: totalUsersPages }, (_, i) => i).map((page) => {
                      const displayPage = page + 1;
                      if (
                        page === 0 ||
                        page === totalUsersPages - 1 ||
                        (page >= currentUsersPage - 1 && page <= currentUsersPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => handleUsersPageChange(page)}
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                              currentUsersPage === page
                                ? 'bg-primary-600 text-white'
                                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {displayPage}
                          </button>
                        );
                      } else if (
                        page === currentUsersPage - 2 ||
                        page === currentUsersPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-gray-500 dark:text-slate-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUsersPageChange(currentUsersPage + 1)}
                    disabled={currentUsersPage >= totalUsersPages - 1}
                    className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      currentUsersPage >= totalUsersPages - 1
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-600'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="mb-4 text-gray-400 dark:text-slate-500">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 110 7.75M8 3.13a4 4 0 110 7.75" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-slate-100">No users found</h3>
              <p className="text-gray-500 dark:text-slate-400">There are no registered users to display.</p>
            </div>
          )}
        </div>
      </div>
    </AppPageShell>
  );
}

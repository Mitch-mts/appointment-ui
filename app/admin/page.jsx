'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation.jsx';
import AppointmentCard from '../../components/AppointmentCard.jsx';
import { appointmentAPI, userAPI } from '../../lib/api';
import { formatDate, formatTime } from '../../lib/utils';
import { Calendar, Users, Filter, TrendingUp, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [filter, setFilter] = useState('all');
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const [usersPerPage] = useState(9); // 3x3 grid
  const [stats, setStats] = useState({ 
    total: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAppointments();
      fetchUsers();
    }
  }, [user, isAdmin]);

  const fetchAppointments = async () => {
    try {
      const response = await appointmentAPI.getAppointments();
      if (response.success && response.data) {
        setAppointments(response.data);
        
        // Calculate stats
        const stats = {
          total: response.data.length,
          scheduled: response.data.filter(apt => apt.status === 'SCHEDULED').length,
          completed: response.data.filter(apt => apt.status === 'COMPLETED').length,
          cancelled: response.data.filter(apt => apt.status === 'CANCELLED').length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.listUsers();
      if (response.success && response.data) {
        setUsers(response.data);
        setCurrentUsersPage(1); // Reset to first page when users are fetched
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

  // Pagination for users
  const indexOfLastUser = currentUsersPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalUsersPages = Math.ceil(users.length / usersPerPage);

  const handleUsersPageChange = (page) => {
    setCurrentUsersPage(page);
    // Scroll to users section when changing pages
    document.getElementById('users')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">Manage all appointments and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Appointments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Scheduled</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.scheduled}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cancelled</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Users List (Admin only) */}
        <div id="users" className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Registered Users</h2>
            </div>
            {!loadingUsers && users.length > 0 && (
              <p className="text-sm text-gray-600">
                Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, users.length)} of {users.length} users
              </p>
            )}
          </div>

          {loadingUsers ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : users && users.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {currentUsers.map((u) => (
                  <div key={u.id || u._id || u.email} className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-900 font-medium">{u.fullName || u.name || 'Unknown'}</p>
                        <p className="text-gray-600 text-sm">{u.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        (u.role === 'ADMIN') ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {u.role || 'USER'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalUsersPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => handleUsersPageChange(currentUsersPage - 1)}
                    disabled={currentUsersPage === 1}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentUsersPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalUsersPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalUsersPages ||
                        (page >= currentUsersPage - 1 && page <= currentUsersPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handleUsersPageChange(page)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentUsersPage === page
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentUsersPage - 2 ||
                        page === currentUsersPage + 2
                      ) {
                        return (
                          <span key={page} className="px-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handleUsersPageChange(currentUsersPage + 1)}
                    disabled={currentUsersPage === totalUsersPages}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentUsersPage === totalUsersPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 110 7.75M8 3.13a4 4 0 110 7.75" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">There are no registered users to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

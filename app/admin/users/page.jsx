'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import Navigation from '../../../components/Navigation.jsx';
import { useAuth } from '../../../contexts/AuthContext.jsx';
import { userAPI } from '../../../lib/api';

export default function AdminUsersPage() {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const [usersPerPage] = useState(9);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    const fetchUsers = async () => {
      try {
        const response = await userAPI.listUsers();
        if (response.success && response.data) {
          setUsers(response.data);
          setCurrentUsersPage(1);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-sky-600 dark:border-cyan-400" />
      </div>
    );
  }

  if (!user || !isAdmin) return null;

  const indexOfLastUser = currentUsersPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalUsersPages = Math.ceil(users.length / usersPerPage);

  const handleUsersPageChange = (page) => {
    setCurrentUsersPage(page);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-32 h-72 w-72 rounded-full bg-blue-100 blur-3xl dark:bg-sky-900/40" />
        <div className="absolute top-32 -right-24 h-80 w-80 rounded-full bg-cyan-100 blur-3xl dark:bg-indigo-900/30" />
        <div className="absolute bottom-[-80px] left-12 h-72 w-72 rounded-full bg-indigo-100 blur-3xl dark:bg-blue-900/25" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      </div>

      <Navigation />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Users</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">Registered users in the system</p>
        </div>

        <div id="users">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">Registered Users</h2>
            </div>
            {!loadingUsers && users.length > 0 && (
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, users.length)} of {users.length} users
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
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

              {totalUsersPages > 1 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUsersPageChange(currentUsersPage - 1)}
                    disabled={currentUsersPage === 1}
                    className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      currentUsersPage === 1
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-600'
                        : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-1">
                    {Array.from({ length: totalUsersPages }, (_, i) => i + 1).map((page) => (
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
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUsersPageChange(currentUsersPage + 1)}
                    disabled={currentUsersPage === totalUsersPages}
                    className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      currentUsersPage === totalUsersPages
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 110 7.75M8 3.13a4 4 0 110 7.75"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-slate-100">No users found</h3>
              <p className="text-gray-500 dark:text-slate-400">There are no registered users to display.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


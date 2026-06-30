'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useRequireAuth } from '../../../hooks/useRequireAuth.js';
import AppPageShell from '../../../components/AppPageShell.jsx';
import PageSpinner from '../../../components/PageSpinner.jsx';
import { userAPI } from '../../../lib/api';
import { getPageContent, getPageMeta } from '../../../lib/pagination';

export default function AdminUsersPage() {
  const { user, isAdmin, showAuthSpinner, ready } = useRequireAuth({ adminOnly: true });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [currentUsersPage, setCurrentUsersPage] = useState(0);
  const [usersMeta, setUsersMeta] = useState(null);
  const [usersPerPage] = useState(9);

  useEffect(() => {
    if (!user || !isAdmin) return;
    const fetchUsers = async () => {
      try {
        const response = await userAPI.listUsers({
          page: currentUsersPage,
          size: usersPerPage,
        });
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

    fetchUsers();
  }, [user, isAdmin, currentUsersPage]);

  if (showAuthSpinner) return <PageSpinner />;
  if (!ready) return null;

  const currentUsers = users;
  const totalUsersPages = usersMeta?.totalPages ?? 1;

  const handleUsersPageChange = (page) => {
    setCurrentUsersPage(page);
  };

  return (
    <AppPageShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
                    {Array.from({ length: totalUsersPages }, (_, i) => i).map((page) => (
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
                        {page + 1}
                      </button>
                    ))}
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
    </AppPageShell>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation.jsx';
import { userAPI } from '../../lib/api';
import { User as UserIcon, Mail, Shield, Lock } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // New state variables
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showDeleteResponseDialog, setShowDeleteResponseDialog] = useState(false);
  const [deleteResponseMessage, setDeleteResponseMessage] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      reset({
        name: user.fullName || user.name,
        email: user.email,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await userAPI.updateProfile(user.id, {
        fullName: data.name,
        email: data.email
      });
      console.log('Profile update response:', response);
      if (response.success && response.data) {
        // Update the user context with new data
        console.log('Updating user context with:', response.data);
        updateUser(response.data);
        setShowSuccessDialog(true);
        setEditing(false);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleChangePassword = async (data) => {
    setPasswordError('');
    setPasswordSuccess('');
    setChangingPassword(true);

    try {
      const response = await userAPI.changePassword(user.id, {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      if (response.success && response.data) {
        setPasswordSuccess('Password changed successfully!');
        setShowChangePasswordDialog(false);
        resetPassword();
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setPasswordError(response.message || 'Failed to change password');
      }
    } catch (err) {
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const response = await userAPI.deleteUser(user.id);
      if (response.success) {
        setDeleteResponseMessage(response.data || response.message || 'Account deleted successfully');
        setShowDeleteConfirmDialog(false);
        setShowDeleteResponseDialog(true);
      } else {
        setDeleteResponseMessage(response.message || 'Failed to delete account');
        setShowDeleteConfirmDialog(false);
        setShowDeleteResponseDialog(true);
      }
    } catch (err) {
      setDeleteResponseMessage('An error occurred while deleting the account');
      setShowDeleteConfirmDialog(false);
      setShowDeleteResponseDialog(true);
    } finally {
      setDeletingAccount(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-600">Manage your account information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className="btn-secondary"
                >
                  {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    <UserIcon className="h-4 w-4 inline mr-2" />
                    Full Name
                  </label>
                  <input
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 3 characters',
                      },
                    })}
                    type="text"
                    disabled={!editing}
                    placeholder={user?.fullName || user?.name || 'Enter your full name'}
                    className={`input-field ${!editing ? 'bg-gray-100' : ''}`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-2" />
                    Email Address
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    disabled={!editing}
                    className={`input-field ${!editing ? 'bg-gray-100' : ''}`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {editing && (
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary"
                    >
                      {saving ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        reset({
                          name: user.fullName || user.name,
                          email: user.email,
                        });
                        setError('');
                        setSuccess('');
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Account Info */}
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Account Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-medium text-gray-900">
                      {user.role === 'ADMIN' ? 'Administrator' : 'Client'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowChangePasswordDialog(true)}
                  className="w-full btn-secondary text-left"
                >
                  Change Password
                </button>
                <button 
                  onClick={() => setShowDeleteConfirmDialog(true)}
                  className="w-full btn-danger text-left"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Updated Successfully!</h3>
              <p className="text-sm text-gray-500 mb-6">Your profile information has been updated.</p>
              <button
                onClick={() => {
                  setShowSuccessDialog(false);
                  window.location.reload();
                }}
                className="w-full btn-primary"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Dialog */}
      {showChangePasswordDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowChangePasswordDialog(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleSubmitPassword(handleChangePassword)} className="space-y-4">
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Current Password
                </label>
                <input
                  {...registerPassword('oldPassword', {
                    required: 'Current password is required',
                  })}
                  type="password"
                  className="input-field"
                />
                {passwordErrors.oldPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.oldPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="h-4 w-4 inline mr-2" />
                  New Password
                </label>
                <input
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  className="input-field"
                />
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 btn-primary"
                >
                  {changingPassword ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Changing...
                    </div>
                  ) : (
                    'Change Password'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordDialog(false);
                    resetPassword();
                    setPasswordError('');
                    setPasswordSuccess('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete your account? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirmDialog(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="flex-1 btn-danger"
                >
                  {deletingAccount ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </div>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Response Dialog */}
      {showDeleteResponseDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Account Response</h3>
              <p className="text-sm text-gray-600 mb-6">
                {deleteResponseMessage}
              </p>
              <button
                onClick={() => {
                  setShowDeleteResponseDialog(false);
                  // If account was successfully deleted, redirect to login
                  if (deleteResponseMessage.includes('successfully') || deleteResponseMessage.includes('deleted')) {
                    // Clear local storage and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.push('/login');
                  }
                }}
                className="w-full btn-primary"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

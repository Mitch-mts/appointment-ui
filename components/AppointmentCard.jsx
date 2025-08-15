'use client';

import React from 'react';
import { formatDate, getStatusColor } from '../lib/utils.js';
import { Calendar, Clock, User, Trash2, Edit } from 'lucide-react';

export default function AppointmentCard({
  appointment,
  onCancel,
  onEdit,
  showUserInfo = false,
  isAdmin = false,
}) {
  const handleCancel = () => {
    if (onCancel && confirm('Are you sure you want to cancel this appointment?')) {
      onCancel(appointment.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(appointment);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {appointment.fullName}
              </h3>
              <span className="text-xs text-gray-500">
                {appointment.email}
              </span>
            </div>
            
            <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
              <span>
                <Calendar className="inline h-4 w-4 mr-1" />
                {appointment.bookedDate ? formatDate(appointment.bookedDate) : 'No date set'}
              </span>
              <span>
                <Clock className="inline h-4 w-4 mr-1" />
                {appointment.bookedTime || 'No time set'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.bookingStatus || 'PENDING')}`}>
            {appointment.bookingStatus || 'UNKNOWN'}
          </span>
          
          {appointment.referenceNumber && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Ref: {appointment.referenceNumber}
            </span>
          )}
          
          <div className="flex items-center space-x-2">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="text-primary-600 hover:text-primary-700 p-1 rounded"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            
            {onCancel && (
              <button
                onClick={handleCancel}
                className="text-red-600 hover:text-red-700 p-1 rounded"
                title="Cancel"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

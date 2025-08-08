'use client';

import React from 'react';
import { formatDate, formatTime, getStatusColor } from '@/lib/utils.js';
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
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-primary-600" />
          <span className="font-semibold text-lg">{formatDate(appointment.date)}</span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-gray-700">{formatTime(appointment.time)}</span>
        </div>

        {showUserInfo && appointment.user && (
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{appointment.user.name}</span>
            <span className="text-gray-500">({appointment.user.email})</span>
          </div>
        )}

        {appointment.notes && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">{appointment.notes}</p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          Created: {formatDate(appointment.createdAt)}
        </div>
      </div>

      {(onCancel || onEdit) && appointment.status === 'SCHEDULED' && (
        <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}
          
          {onCancel && (
            <button
              onClick={handleCancel}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700 text-sm font-medium"
            >
              <Trash2 className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

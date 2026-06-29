import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function CardModal({ isOpen, onClose, onSubmit, card = null }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditMode = !!card;

  // Initialize fields on open or change of card
  useEffect(() => {
    if (isOpen) {
      setError('');
      if (card) {
        setTitle(card.title || '');
        setDescription(card.description || '');
        setAssigneeId(card.assignee?.id || card.assignee?._id || '');
        setPriority(card.priority || 'medium');
        setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
      } else {
        setTitle('');
        setDescription('');
        setAssigneeId('');
        setPriority('medium');
        setDueDate('');
      }
      fetchUsers();
    }
  }, [isOpen, card]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/users/assignees');
      setUsers(response.data.users);
    } catch (err) {
      console.error('Failed to load assignees directory', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      title: title.trim(),
      description: description.trim(),
      assignee: assigneeId || null,
      priority,
      dueDate: dueDate || null,
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save card');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white border border-gray-200 p-6 sm:p-8 rounded-lg shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditMode ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 text-sm rounded-r-md">
            {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Implement drag-and-drop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows="4"
              placeholder="Provide context or instructions for this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            />
          </div>

          {/* Assignee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Assignee</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              disabled={loadingUsers}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Priority & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority pills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority Tag</label>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map((p) => {
                  const colors = {
                    low: 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
                    medium: 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100',
                    high: 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100',
                  };
                  const activeColors = {
                    low: 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
                    medium: 'bg-amber-600 text-white border-amber-600 shadow-sm',
                    high: 'bg-rose-600 text-white border-rose-600 shadow-sm',
                  };
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 rounded-md text-xs font-semibold capitalize border transition-all ${
                        isSelected ? activeColors[p] : colors[p]
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-medium rounded-md text-white transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

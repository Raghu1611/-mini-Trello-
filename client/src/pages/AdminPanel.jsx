import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import { Shield, UserCog, Trash2, ShieldAlert } from 'lucide-react';

export default function AdminPanel() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.users);
    } catch (err) {
      setError('Failed to fetch user directory');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = async (user) => {
    setError('');
    setSuccess('');
    const newRole = user.role === 'admin' ? 'member' : 'admin';

    // Prevent changing own role (otherwise could lose admin permissions)
    if (user.id === currentUser.id) {
      setError('Cannot change your own role.');
      return;
    }

    try {
      const response = await api.patch(`/users/${user.id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? response.data.user : u))
      );
      setSuccess(`Updated ${user.name}'s role to ${newRole}`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const triggerDeleteUser = (user) => {
    if (user.id === currentUser.id) {
      setError('Cannot delete your own account.');
      return;
    }
    setUserToDelete(user);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setSuccess(`Successfully deleted account for ${userToDelete.name}`);
      setTimeout(() => setSuccess(''), 4000);
      setIsConfirmOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8 pb-5 border-b border-gray-200 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              User Administration
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage system users, toggle administrative privileges, or remove accounts.
            </p>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-md text-sm mb-6 max-w-2xl">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 px-4 py-3 rounded-r-md text-sm mb-6 max-w-2xl">
            {success}
          </div>
        )}

        {/* Content Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      User Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email Address
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      System Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const isSelf = user.id === currentUser.id;
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        {/* Name */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                          {user.name}
                          {isSelf && (
                            <span className="text-[10px] bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </td>
                        
                        {/* Email */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        
                        {/* Role badge */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${
                            user.role === 'admin' 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {user.role === 'admin' ? <ShieldAlert size={12} /> : <UserCog size={12} />}
                            {user.role}
                          </span>
                        </td>
                        
                        {/* Joined at */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </td>
                        
                        {/* Action buttons */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                          <button
                            onClick={() => handleRoleToggle(user)}
                            disabled={isSelf}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                              isSelf
                                ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                                : 'text-gray-700 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500'
                            }`}
                          >
                            <UserCog size={14} />
                            Toggle Role
                          </button>
                          
                          <button
                            onClick={() => triggerDeleteUser(user)}
                            disabled={isSelf}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                              isSelf
                                ? 'text-gray-400 border-gray-200 bg-gray-50 cursor-not-allowed'
                                : 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500'
                            }`}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Delete User Confirmation */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete the user account for "${userToDelete?.name}"? All cards created by this user will lose their ownership link. This cannot be undone.`}
        confirmText="Delete Account"
      />
    </div>
  );
}

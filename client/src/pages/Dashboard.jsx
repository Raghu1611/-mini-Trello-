import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Plus, LayoutTemplate, Clock, User as UserIcon } from 'lucide-react';

export default function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [boardDescription, setBoardDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await api.get('/boards');
      setBoards(response.data.boards);
    } catch (err) {
      setError('Failed to fetch boards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!boardName) return;

    setSubmitting(true);
    setError('');
    try {
      const response = await api.post('/boards', {
        name: boardName,
        description: boardDescription,
      });
      setBoards([response.data.board, ...boards]);
      setIsModalOpen(false);
      setBoardName('');
      setBoardDescription('');
    } catch (err) {
      setError('Failed to create board. Try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-5 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Workspaces
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your projects and collaborate with your team
            </p>
          </div>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-medium rounded-md text-white transition-colors shadow-sm"
          >
            <Plus size={18} />
            New Board
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 text-sm rounded-r-md mb-6 max-w-lg">
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : boards.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white border border-gray-200 rounded-lg max-w-lg mx-auto shadow-sm">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
              <LayoutTemplate size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No boards created</h3>
            <p className="text-sm text-gray-500 mt-2 px-6">
              Get started by creating a new board to organize your tasks.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-6 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors shadow-sm"
            >
              Create Board
            </button>
          </div>
        ) : (
          /* Board Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link
                key={board.id}
                to={`/boards/${board.id}`}
                className="group flex flex-col justify-between bg-white border border-gray-200 hover:border-gray-300 rounded-lg transition-all shadow-sm hover:shadow-md overflow-hidden"
              >
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {board.name}
                  </h3>
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2 min-h-[2.5rem]">
                    {board.description || 'No description provided.'}
                  </p>
                </div>

                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <UserIcon size={14} className="text-gray-400" />
                    <span>{board.creator?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" />
                    <span>{new Date(board.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-gray-200 p-6 sm:p-8 rounded-lg shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h2 className="text-lg font-medium text-gray-900">Create New Workspace</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Board Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Sprint Tracker"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows="3"
                  placeholder="What is this board for?"
                  value={boardDescription}
                  onChange={(e) => setBoardDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-sm font-medium rounded-md text-white transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

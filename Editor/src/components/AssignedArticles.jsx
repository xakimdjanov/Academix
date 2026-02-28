import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiClock,
  FiUser,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiSearch,
  FiFilter,
  FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { ReviewAssignments } from '../services/api';
import { getEditorIdFromToken } from '../utils/getEditorIdFromToken';

const AssignedArticles = () => {
  const navigate = useNavigate();
  const editorId = getEditorIdFromToken();
  
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'in_progress', label: 'In Progress', color: 'blue' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
  ];

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const res = await ReviewAssignments.getAll();
      const all = res.data || [];
      
      // Filter by editor ID
      const myAssignments = all.filter(
        (a) => Number(a.editor_id) === Number(editorId)
      );
      
      console.log('My assignments:', myAssignments);
      setAssignments(myAssignments);
      setFilteredAssignments(myAssignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (editorId) {
      loadAssignments();
    }
  }, [editorId]);

  // Filter assignments based on search and status
  useEffect(() => {
    let filtered = [...assignments];
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.article?.title?.toLowerCase().includes(term) ||
        a.article?.authors?.[0]?.fullName?.toLowerCase().includes(term) ||
        a.assigner?.full_name?.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.status === statusFilter);
    }
    
    setFilteredAssignments(filtered);
  }, [searchTerm, statusFilter, assignments]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
      completed: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewDetails = (assignmentId) => {
    navigate(`/review/${assignmentId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assigned articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#002147] mb-2">Assigned Articles</h1>
          <p className="text-gray-600">
            You have {filteredAssignments.length} article{filteredAssignments.length !== 1 ? 's' : ''} assigned for review
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by title, author, or assigner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002147]"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative min-w-[200px]">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002147] appearance-none bg-white"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="text-8xl mb-4 text-gray-300">📭</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No articles found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'You have no assigned articles yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  {/* Header with Status */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-xl bg-[#002147] flex items-center justify-center text-white shadow-md">
                        <FiFileText size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-1">
                          {assignment.article?.title || 'Untitled Article'}
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <FiUser size={14} />
                          <span>{assignment.article?.authors?.[0]?.fullName || 'Unknown Author'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <span className={`px-4 py-2 rounded-full text-xs font-semibold border ${getStatusColor(assignment.status)}`}>
                      {assignment.status?.replace('_', ' ') || 'Pending'}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <FiCalendar className="text-blue-500" size={16} />
                      <span className="text-gray-600">Assigned:</span>
                      <span className="font-medium text-gray-800">{formatDate(assignment.assigned_at)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <FiClock className="text-orange-500" size={16} />
                      <span className="text-gray-600">Due:</span>
                      <span className="font-medium text-gray-800">{formatDate(assignment.due_date)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <FiUser className="text-green-500" size={16} />
                      <span className="text-gray-600">Assigned by:</span>
                      <span className="font-medium text-gray-800">{assignment.assigner?.full_name || 'Admin'}</span>
                    </div>
                  </div>

                  {/* Message if any */}
                  {assignment.message && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold text-blue-700">Note:</span> {assignment.message}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleViewDetails(assignment.id)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#002147] text-white rounded-xl hover:bg-blue-800 transition-all shadow-md hover:shadow-lg"
                    >
                      <FiEye size={18} />
                      <span>Review Article</span>
                      <FiChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedArticles;
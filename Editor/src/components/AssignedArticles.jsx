import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiFileText,
  FiClock,
  FiUser,
  FiCalendar,
  FiSearch,
  FiFilter,
  FiChevronRight,
  FiInbox,
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
  
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'revision', label: 'Revision' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'accepted', label: 'Accepted' },
  ];

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const res = await ReviewAssignments.getAll();
      const all = res.data || [];
      const myAssignments = all.filter(
        (a) => Number(a.editor_id) === Number(editorId)
      );
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
    if (editorId) loadAssignments();
  }, [editorId]);

  useEffect(() => {
    let filtered = [...assignments];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.article?.title?.toLowerCase().includes(term) ||
        a.article?.authors?.[0]?.fullName?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(a => a.article?.status?.toLowerCase() === statusFilter.toLowerCase());
    }
    setFilteredAssignments(filtered);
  }, [searchTerm, statusFilter, assignments]);

  const getStatusBadgeClass = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'submitted': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'revision': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'accepted': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#002147] tracking-tight">
            Assigned Articles
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">
            Manage and evaluate your pending review tasks
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search papers..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 bg-white outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative min-w-[160px]">
            <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              className="w-full pl-11 pr-8 py-3 rounded-xl border border-slate-200 appearance-none bg-white outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-slate-700 font-medium"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Articles List */}
        <div className="space-y-4">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-slate-100 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  
                  {/* Info Section */}
                  <div className="flex gap-4">
                    <div className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                      <FiFileText size={24} />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeClass(item.article?.status)}`}>
                          {item.article?.status || 'Submitted'}
                        </span>
                        <h3 className="text-base md:text-lg font-bold text-slate-800 truncate pr-2">
                          {item.article?.title}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm text-slate-500">
                        <span className="flex items-center gap-1.5 min-w-fit">
                          <FiUser className="shrink-0" /> {item.article?.authors?.[0]?.fullName || 'Unknown Author'}
                        </span>
                        <span className="flex items-center gap-1.5 min-w-fit">
                          <FiCalendar className="shrink-0" /> Assigned: {formatDate(item.assigned_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center justify-between md:justify-end gap-4 md:gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Due Date</span>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-orange-600">
                        <FiClock size={14} />
                        {formatDate(item.due_date)}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/review/${item.id}`)}
                      className="bg-[#002147] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-900 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                    >
                      View <FiChevronRight className="hidden md:block" />
                    </button>
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiInbox className="text-slate-300 text-3xl" />
              </div>
              <h3 className="text-slate-800 font-bold text-lg">No assignments found</h3>
              <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignedArticles;
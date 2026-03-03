import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiFileText, FiCalendar, FiClock, FiDownload,
  FiCheckCircle, FiXCircle, FiEdit2, FiSave, FiUpload, FiPaperclip, FiUser
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Review, ReviewAssignments, articleService } from '../services/api';
import { getEditorIdFromToken } from '../utils/getEditorIdFromToken';

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const editorId = getEditorIdFromToken();

  const [assignment, setAssignment] = useState(null);
  const [article, setArticle] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [recommendation, setRecommendation] = useState('');
  const [commentsToAuthor, setCommentsToAuthor] = useState('');
  const [commentsToAdmin, setCommentsToAdmin] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);

  const fileInputRef = useRef(null);

  // Load data and check for existing review
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await ReviewAssignments.getById(id);
      const data = res.data;

      if (Number(data.editor_id) !== Number(editorId)) {
        toast.error('Access Denied');
        navigate('/assigned');
        return;
      }

      setAssignment(data);
      setArticle(data.article);

      const reviewRes = await Review.getAll();
      const foundReview = (reviewRes.data || []).find(r => Number(r.assignment_id) === Number(id));

      if (foundReview) {
        setExistingReview(foundReview);
        setRecommendation(foundReview.recommendation || '');
        setCommentsToAuthor(foundReview.comments_to_author || '');
        setCommentsToAdmin(foundReview.comments_to_admin || '');
      }
    } catch (error) {
      toast.error('Failed to load review data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && editorId) loadData();
  }, [id, editorId]);

  const handleSubmitReview = async () => {
    if (!recommendation) return toast.error('Please select a recommendation');
    if (!commentsToAuthor.trim()) return toast.error('Please provide comments for the author');

    try {
      setSubmitting(true);

      const reviewFormData = new FormData();
      reviewFormData.append('assignment_id', id);
      reviewFormData.append('article_id', article?.id);
      reviewFormData.append('editor_id', editorId);
      reviewFormData.append('recommendation', recommendation);
      reviewFormData.append('comments_to_author', commentsToAuthor);
      reviewFormData.append('comments_to_admin', commentsToAdmin || '');
      if (attachedFile) reviewFormData.append('attached_file', attachedFile);

      if (existingReview) {
        await Review.update(existingReview.id, reviewFormData);
      } else {
        await Review.create(reviewFormData);
      }

      // Update Article Status
      try {
        const statusMap = {
          'accept': 'Accepted',
          'reject': 'Rejected',
          'revision': 'Needs Revision'
        };

        await articleService.update(article.id, { 
          status: statusMap[recommendation] 
        });
      } catch (articleUpdateError) {
        console.warn("Status update failed (Enum error), but review was saved.");
      }

      // Complete assignment
      await ReviewAssignments.update(id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

      toast.success('Review submitted successfully!');
      setTimeout(() => navigate('/assigned'), 1000);

    } catch (error) {
      console.error("Submission Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Server error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading details...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate('/assigned')} 
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-[#002147] font-bold transition-all group text-sm"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to List
        </button>

        {/* Article Quick Info */}
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full">
            <div className="h-12 w-12 bg-[#002147] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
              <FiFileText size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base md:text-lg font-bold text-slate-800 truncate">{article?.title}</h1>
              <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">
                Current Status: <span className="text-blue-600 font-bold">{article?.status}</span>
              </p>
            </div>
          </div>
          {article?.file_url && (
            <a 
              href={article.file_url} 
              target="_blank" 
              rel="noreferrer" 
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-100 transition-all text-sm"
            >
              <FiDownload /> Download Manuscript
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content: Review Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold mb-6 text-slate-800 border-b pb-4">Peer Review Assessment</h2>
              
              {/* Recommendation Buttons - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {[
                  { id: 'accept', label: 'Accept', icon: <FiCheckCircle />, color: 'green', ring: 'ring-green-100', border: 'border-green-500', text: 'text-green-700', bg: 'bg-green-50' },
                  { id: 'revision', label: 'Revision', icon: <FiEdit2 />, color: 'amber', ring: 'ring-amber-100', border: 'border-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
                  { id: 'reject', label: 'Reject', icon: <FiXCircle />, color: 'red', ring: 'ring-red-100', border: 'border-red-500', text: 'text-red-700', bg: 'bg-red-50' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRecommendation(item.id)}
                    className={`flex items-center sm:flex-col justify-start sm:justify-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                      recommendation === item.id 
                      ? `${item.border} ${item.bg} ${item.text} ring-2 ${item.ring}` 
                      : 'border-slate-50 hover:border-slate-200 bg-slate-50/50 text-slate-400'
                    }`}
                  >
                    {React.cloneElement(item.icon, { size: 22 })}
                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Comments to Author *</label>
                  <textarea
                    rows="6"
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm leading-relaxed"
                    placeholder="Provide detailed feedback for the author..."
                    value={commentsToAuthor}
                    onChange={(e) => setCommentsToAuthor(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Comments to Editor (Confidential)</label>
                  <textarea
                    rows="3"
                    className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    placeholder="Internal notes for the editorial team..."
                    value={commentsToAdmin}
                    onChange={(e) => setCommentsToAdmin(e.target.value)}
                  />
                </div>

                {/* File Upload Section */}
                <div className="p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 group hover:border-blue-300 transition-colors">
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setAttachedFile(e.target.files[0])} />
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button 
                      onClick={() => fileInputRef.current.click()} 
                      type="button" 
                      className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#002147] px-6 py-3.5 rounded-xl hover:brightness-125 transition-all shadow-md shrink-0"
                    >
                      <FiUpload /> {attachedFile ? 'Change File' : 'Upload Annotated File'}
                    </button>
                    {attachedFile && (
                      <span className="text-xs text-slate-500 font-medium italic truncate w-full sm:max-w-[250px] text-center sm:text-left">
                        <FiPaperclip className="inline mr-1" /> {attachedFile.name}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  disabled={submitting}
                  onClick={handleSubmitReview}
                  className="w-full bg-[#002147] text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-900/10 hover:brightness-110 active:scale-[0.99] transition-all flex justify-center items-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : <><FiSave /> Submit Final Review</>}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-[11px] uppercase tracking-widest border-b pb-3">
                  <FiUser className="text-blue-600"/> Authors
                </h3>
                <div className="space-y-4">
                  {article?.authors?.map((auth, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center font-bold text-blue-700 text-[10px] shrink-0 border border-blue-100">
                        {auth.fullName?.[0]}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 truncate">{auth.fullName}</span>
                    </div>
                  ))}
                </div>
             </div>

             <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-3xl p-6 shadow-sm">
                <h3 className="font-bold text-[#9a3412] mb-2 flex items-center gap-2 text-sm"><FiClock /> Deadline</h3>
                <p className="text-[#c2410c] font-black text-2xl tracking-tight">
                  {assignment?.due_date ? new Date(assignment.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-- --, ----'}
                </p>
                <p className="text-[10px] text-[#ea580c] mt-2 font-bold uppercase tracking-widest opacity-80 italic">Submission before deadline is encouraged</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail;
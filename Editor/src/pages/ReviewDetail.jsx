import React, { useEffect, useState, useRef } from 'react'; // useRef qo'shildi!
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft,
  FiFileText,
  FiUser,
  FiCalendar,
  FiClock,
  FiDownload,
  FiCheckCircle,
  FiXCircle,
  FiEdit2,
  FiSave,
  FiStar,
  FiMessageSquare,
  FiMail,
  FiPhone,
  FiUpload,
  FiPaperclip,
  FiX,
} from 'react-icons/fi';
import { FaRegFilePdf, FaRegFileWord } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Review, ReviewAssignments } from '../services/api';
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
  
  // Review form state
  const [recommendation, setRecommendation] = useState('');
  const [commentsToAuthor, setCommentsToAuthor] = useState('');
  const [commentsToAdmin, setCommentsToAdmin] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedFilePreview, setAttachedFilePreview] = useState('');

  const fileInputRef = useRef(null); // Endi ishlaydi

  const loadAssignment = async () => {
    try {
      setLoading(true);
      
      const res = await ReviewAssignments.getById(id);
      const data = res.data;
      
      console.log('Assignment details:', data);
      
      if (Number(data.editor_id) !== Number(editorId)) {
        toast.error('You do not have permission to view this assignment');
        navigate('/assigned');
        return;
      }
      
      setAssignment(data);
      setArticle(data.article);
      
      try {
        const reviewRes = await Review.getAll();
        const reviews = reviewRes.data || [];
        const foundReview = reviews.find(r => r.assignment_id === Number(id));
        
        if (foundReview) {
          setExistingReview(foundReview);
          setRecommendation(foundReview.recommendation || '');
          setCommentsToAuthor(foundReview.comments_to_author || '');
          setCommentsToAdmin(foundReview.comments_to_admin || '');
        }
      } catch (error) {
        console.log('No existing review found');
      }
      
    } catch (error) {
      console.error('Error loading assignment:', error);
      toast.error('Failed to load assignment details');
      navigate('/assigned');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && editorId) {
      loadAssignment();
    }
  }, [id, editorId]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getFileIcon = (fileName) => {
    const ext = fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FaRegFilePdf className="text-red-500" size={24} />;
    if (ext === 'doc' || ext === 'docx') return <FaRegFileWord className="text-blue-500" size={24} />;
    return <FiFileText className="text-gray-500" size={24} />;
  };

  const handleDownload = (fileUrl, fileName) => {
    window.open(fileUrl, '_blank');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }
      setAttachedFile(file);
      setAttachedFilePreview(file.name);
    }
  };

  const clearAttachedFile = () => {
    setAttachedFile(null);
    setAttachedFilePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitReview = async () => {
    if (!recommendation) {
      toast.error('Please select a recommendation');
      return;
    }

    if (!commentsToAuthor.trim()) {
      toast.error('Please provide comments to the author');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('assignment_id', id);
      formData.append('article_id', article?.id);
      formData.append('editor_id', editorId);
      formData.append('recommendation', recommendation);
      formData.append('comments_to_author', commentsToAuthor);
      formData.append('comments_to_admin', commentsToAdmin || '');
      
      if (attachedFile) {
        formData.append('attached_file', attachedFile);
      }

      if (existingReview) {
        await Review.update(existingReview.id, formData);
        toast.success('Review updated successfully');
      } else {
        await Review.create(formData);
        toast.success('Review submitted successfully');
      }

      await ReviewAssignments.update(id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

      setTimeout(() => {
        navigate('/assigned');
      }, 1500);

    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const getRecommendationColor = (rec) => {
    const colors = {
      accept: 'bg-green-100 text-green-700 border-green-200',
      reject: 'bg-red-100 text-red-700 border-red-200',
      revision: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    };
    return colors[rec] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review details...</p>
        </div>
      </div>
    );
  }

  if (!assignment || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 text-gray-300">❌</div>
          <p className="text-gray-600">Assignment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/assigned')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-gray-600 hover:text-[#002147] hover:bg-white/80 transition-all shadow-sm"
        >
          <FiArrowLeft size={18} />
          <span>Back to Assigned Articles</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-[#002147] flex items-center justify-center text-white shadow-md">
                <FiFileText size={32} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold border border-yellow-200">
                    {assignment.status || 'Pending'}
                  </span>
                  {existingReview && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRecommendationColor(existingReview.recommendation)}`}>
                      {existingReview.recommendation?.toUpperCase()}
                    </span>
                  )}
                  <span className="text-gray-500">ID: #{article.id}</span>
                </div>
              </div>
            </div>
            
            {article.file_url && (
              <button
                onClick={() => handleDownload(article.file_url, article.title)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
              >
                <FiDownload size={18} />
                <span>Download Article</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Review Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6">
                {existingReview ? 'Update Review' : 'Submit Your Review'}
              </h2>
              
              {/* Recommendation */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Recommendation *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setRecommendation('accept')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      recommendation === 'accept'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-200'
                    }`}
                  >
                    <FiCheckCircle className={`mx-auto mb-2 ${recommendation === 'accept' ? 'text-green-500' : 'text-gray-400'}`} size={24} />
                    <p className={`font-medium ${recommendation === 'accept' ? 'text-green-700' : 'text-gray-600'}`}>
                      Accept
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Approve for publication</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setRecommendation('reject')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      recommendation === 'reject'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-200'
                    }`}
                  >
                    <FiXCircle className={`mx-auto mb-2 ${recommendation === 'reject' ? 'text-red-500' : 'text-gray-400'}`} size={24} />
                    <p className={`font-medium ${recommendation === 'reject' ? 'text-red-700' : 'text-gray-600'}`}>
                      Reject
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Decline publication</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setRecommendation('revision')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      recommendation === 'revision'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-yellow-200'
                    }`}
                  >
                    <FiEdit2 className={`mx-auto mb-2 ${recommendation === 'revision' ? 'text-yellow-500' : 'text-gray-400'}`} size={24} />
                    <p className={`font-medium ${recommendation === 'revision' ? 'text-yellow-700' : 'text-gray-600'}`}>
                      Revision
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Changes required</p>
                  </button>
                </div>
              </div>

              {/* Comments to Author */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments to Author *
                </label>
                <textarea
                  value={commentsToAuthor}
                  onChange={(e) => setCommentsToAuthor(e.target.value)}
                  rows="5"
                  placeholder="Provide detailed feedback, suggestions for improvement, or specific changes needed..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002147]"
                />
              </div>

              {/* Comments to Admin (Optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments to Admin (Optional)
                </label>
                <textarea
                  value={commentsToAdmin}
                  onChange={(e) => setCommentsToAdmin(e.target.value)}
                  rows="3"
                  placeholder="Private comments for the editorial team..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#002147]"
                />
              </div>

              {/* File Upload (Optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attach File (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    <FiUpload size={18} />
                    <span>Choose File</span>
                  </button>
                  
                  {attachedFilePreview && (
                    <div className="flex items-center gap-2 flex-1">
                      <FiPaperclip className="text-blue-500" />
                      <span className="text-sm text-gray-600 truncate">{attachedFilePreview}</span>
                      <button
                        onClick={clearAttachedFile}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiX size={18} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                </p>
              </div>

              {/* Existing Review Info */}
              {existingReview && (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-700 mb-2">
                    <FiMessageSquare className="inline mr-1" />
                    You have already submitted a review for this article.
                  </p>
                  <p className="text-xs text-blue-600">
                    Submitted on: {formatDate(existingReview.createdAt)}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmitReview}
                disabled={submitting || !recommendation || !commentsToAuthor.trim()}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#002147] text-white rounded-xl hover:bg-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FiSave size={18} />
                    <span>{existingReview ? 'Update Review' : 'Submit Review'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Assignment Info</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-blue-500" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Assigned Date</p>
                    <p className="font-medium text-gray-800">{formatDate(assignment.assigned_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <FiClock className="text-orange-500" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className="font-medium text-gray-800">{formatDate(assignment.due_date)}</p>
                  </div>
                </div>
                
                {assignment.message && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Assignment Note:</p>
                    <p className="text-sm text-gray-700">{assignment.message}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Author Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Author</h2>
              {article.authors?.map((author, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center gap-3">
                    {author.imageUrl ? (
                      <img
                        src={author.imageUrl}
                        alt={author.fullName}
                        className="h-12 w-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-xl bg-[#002147] flex items-center justify-center text-white text-lg font-bold">
                        {author.fullName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">{author.fullName}</p>
                      {author.orcidId && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FiStar size={12} className="text-orange-500" />
                          ORCID: {author.orcidId}
                        </p>
                      )}
                    </div>
                  </div>
                  {author.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiPhone size={14} className="text-green-500" />
                      <span>{author.phone}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Review Guidelines */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiMessageSquare className="text-blue-500" />
                Review Guidelines
              </h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="p-3 bg-green-50 rounded-xl">
                  <p className="font-medium text-green-700 mb-1">✅ Accept</p>
                  <p>Approve for publication with minor or no changes.</p>
                </div>
                
                <div className="p-3 bg-red-50 rounded-xl">
                  <p className="font-medium text-red-700 mb-1">❌ Reject</p>
                  <p>Decline publication due to major issues.</p>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <p className="font-medium text-yellow-700 mb-1">📝 Revision</p>
                  <p>Request specific changes before acceptance.</p>
                </div>
                
                <div className="border-t border-gray-100 pt-3 mt-3">
                  <p className="font-medium text-gray-800 mb-2">Quick Tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 text-xs">
                    <li>Be specific and constructive</li>
                    <li>Focus on the research, not the author</li>
                    <li>Explain your recommendation clearly</li>
                    <li>Meet the deadline</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail;
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiFileText, FiCalendar, FiClock, FiDownload,
  FiCheckCircle, FiXCircle, FiEdit2, FiSave, FiUpload, FiPaperclip, FiUser, FiInfo, FiChevronRight,
  FiPhone, FiGlobe
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
  
  // View toggle: true = Details, false = Review Form
  const [viewMode, setViewMode] = useState(true);

  // Lightbox state
  const [selectedImg, setSelectedImg] = useState(null);

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
        toast.error('Kirish rad etildi');
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
      toast.error('Taqriz ma\'lumotlarini yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && editorId) loadData();
  }, [id, editorId]);

  const handleSubmitReview = async () => {
    if (!recommendation) return toast.error('Iltimos, tavsiyani tanlang');
    if (!commentsToAuthor.trim()) return toast.error('Iltimos, muallif uchun izoh qoldiring');

    try {
      setSubmitting(true);

      const reviewFormData = new FormData();
      reviewFormData.append('assignment_id', Number(id));
      reviewFormData.append('article_id', Number(article?.id));
      reviewFormData.append('editor_id', Number(editorId));
      reviewFormData.append('recommendation', recommendation);
      reviewFormData.append('comments_to_author', commentsToAuthor);
      reviewFormData.append('comments_to_admin', commentsToAdmin || '');

      if (attachedFile) {
        reviewFormData.append('attached_file_url', attachedFile);
      }

      if (existingReview) {
        await Review.update(existingReview.id, reviewFormData);
      } else {
        await Review.create(reviewFormData);
      }

      // Maqola statusini yangilash
      try {
        const statusMap = {
          'accept': 'Accepted',
          'reject': 'Rejected',
          'revision': 'Needs Revision'
        };
        await articleService.update(article.id, { 
          status: statusMap[recommendation] 
        });
      } catch (e) {
        console.warn("Status update issue:", e);
      }

      // Assignmentni yakunlash
      await ReviewAssignments.update(id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

      toast.success('Taqriz muvaffaqiyatli yuborildi!');
      setTimeout(() => navigate('/assigned'), 1000);

    } catch (error) {
      console.error("Submission Error:", error.response?.data);
      toast.error(error.response?.data?.message || 'Serverda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Yuklanmoqda...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => navigate('/assigned')} 
            className="flex items-center gap-2 text-slate-500 hover:text-[#002147] font-bold transition-all group text-sm"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Ro'yxatga qaytish
          </button>
          
          {viewMode ? (
            <button 
              onClick={() => setViewMode(false)}
              className="bg-[#002147] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-900 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/10 active:scale-95"
            >
              Status yozish <FiChevronRight />
            </button>
          ) : (
            <button 
              onClick={() => setViewMode(true)}
              className="bg-white text-slate-700 border border-slate-200 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
            >
              <FiArrowLeft /> Ma'lumotlarga qaytish
            </button>
          )}
        </div>

        {/* Article Quick Info */}
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 w-full">
            <div className="h-12 w-12 bg-[#002147] rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
              <FiFileText size={24} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base md:text-lg font-bold text-slate-800 truncate">{article?.title}</h1>
              <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider">
                Joriy holat: <span className="text-blue-600 font-bold">{article?.status}</span>
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
              <FiDownload /> Maqolani yuklab olish
            </a>
          )}
        </div>

        {viewMode ? (
          /* ARTICLE DETAILS VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold mb-6 text-slate-800 border-b pb-4 flex items-center gap-2">
                  <FiInfo className="text-blue-600" /> Maqola tafsilotlari
                </h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Maqola sarlavhasi</h3>
                    <p className="text-slate-800 font-semibold text-lg leading-relaxed">
                      {article?.title}
                    </p>
                  </div>

                  {article?.abstract && (
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Annotatsiya</h3>
                      <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        {article.abstract}
                      </p>
                    </div>
                  )}

                  {article?.keywords && (
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Kalit so'zlar</h3>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(article.keywords) ? article.keywords : (typeof article.keywords === 'string' ? article.keywords.split(',') : [])).map((kw, i) => (
                          <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100">
                            {String(kw).trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Details */}
            <div className="space-y-6">
               <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-[11px] uppercase tracking-widest border-b pb-3">
                    <FiUser className="text-blue-600"/> Mualliflar
                  </h3>
                  <div className="space-y-6">
                    {article?.authors?.map((auth, i) => (
                      <div key={i} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                        <div className="flex items-center gap-3 mb-3">
                          <div 
                            className="h-10 w-10 bg-blue-600 rounded-lg overflow-hidden flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-md cursor-zoom-in group/img"
                            onClick={() => auth.imageUrl && setSelectedImg(auth.imageUrl)}
                          >
                            {auth.imageUrl ? (
                              <img 
                                src={auth.imageUrl} 
                                alt={auth.fullName} 
                                className="w-full h-full object-cover transition-transform group-hover/img:scale-110" 
                                onError={(e) => (e.currentTarget.style.display = "none")}
                              />
                            ) : (
                              <span>{auth.fullName?.[0]}</span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-slate-800 truncate">{auth.fullName}</span>
                        </div>
                        
                        <div className="space-y-2 ml-1">
                          {auth.phone && (
                            <div className="flex items-center gap-2 text-[11px] text-slate-600">
                              <FiPhone className="text-blue-500 shrink-0" size={12} />
                              <span className="font-medium">{auth.phone}</span>
                            </div>
                          )}
                          {(auth.orcidId || auth.orcid) && (
                            <div className="flex items-center gap-2 text-[11px] text-slate-600">
                              <FiGlobe className="text-blue-500 shrink-0" size={12} />
                              <span className="font-medium truncate">{auth.orcidId || auth.orcid}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="bg-[#fff7ed] border border-[#ffedd5] rounded-3xl p-6 shadow-sm">
                  <h3 className="font-bold text-[#9a3412] mb-2 flex items-center gap-2 text-sm"><FiClock /> Muddat</h3>
                  <p className="text-[#c2410c] font-black text-2xl tracking-tight">
                    {assignment?.due_date ? new Date(assignment.due_date).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', year: 'numeric' }) : '-- --, ----'}
                  </p>
                  <p className="text-[10px] text-[#ea580c] mt-2 font-bold uppercase tracking-widest opacity-80 italic">Muddatidan oldin topshirish tavsiya etiladi</p>
               </div>
            </div>
          </div>
        ) : (
          /* REVIEW FORM VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-right duration-500">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100">
                <h2 className="text-lg font-bold mb-6 text-slate-800 border-b pb-4 flex items-center gap-2">
                  <FiEdit2 className="text-blue-600" /> Taqriz baholash
                </h2>
                
                {/* Recommendation Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                  {[
                    { id: 'accept', label: 'Qabul qilish', icon: <FiCheckCircle />, color: 'green', ring: 'ring-green-100', border: 'border-green-500', text: 'text-green-700', bg: 'bg-green-50' },
                    { id: 'revision', label: 'Tahrir qilish', icon: <FiEdit2 />, color: 'amber', ring: 'ring-amber-100', border: 'border-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
                    { id: 'reject', label: 'Rad etish', icon: <FiXCircle />, color: 'red', ring: 'ring-red-100', border: 'border-red-500', text: 'text-red-700', bg: 'bg-red-50' }
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
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Muallif uchun izohlar *</label>
                    <textarea
                      rows="6"
                      className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm leading-relaxed"
                      placeholder="Muallif uchun batafsil fikr-mulohazalaringizni yozing..."
                      value={commentsToAuthor}
                      onChange={(e) => setCommentsToAuthor(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Muharrir uchun izohlar (maxfiy)</label>
                    <textarea
                      rows="3"
                      className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      placeholder="Tahririyat guruhi uchun ichki eslatmalar..."
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
                        <FiUpload /> {attachedFile ? 'Faylni o\'zgartirish' : 'Izohlangan faylni yuklash'}
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
                    {submitting ? 'Yuborilmoqda...' : <><FiSave /> Yakuniy taqrizni yuborish</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar (Form View) */}
            <div className="space-y-6">
               <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-sm"><FiInfo /> Eslatma</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Sizning baholashingiz jurnal sifatini ta'minlashda juda muhim. Iltimos, xolis va konstruktiv bo'ling.
                  </p>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox / Zoomed Image Modal */}
      {selectedImg && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300"
          onClick={() => setSelectedImg(null)}
        >
          <button 
            onClick={() => setSelectedImg(null)}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-full"
          >
            ✕
          </button>
          <div className="max-w-4xl max-h-full overflow-hidden rounded-3xl shadow-2xl animate-in zoom-in duration-300">
            <img 
              src={selectedImg} 
              alt="Enlarged profile" 
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewDetail;
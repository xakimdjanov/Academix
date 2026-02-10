import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiBookOpen,
  FiLoader,
  FiMail,
  FiPhone,
  FiGlobe,
  FiUser,
  FiX,
  FiAlertCircle
} from "react-icons/fi";
import { journalService } from "../../../services/api";

const JournalList = () => {
  const [journals, setJournals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();
  const currentAdminId = Number(localStorage.getItem("journal_admin_id"));

  const fetchJournals = async () => {
    try {
      setLoading(true);
      const res = await journalService.getAll();
      const list = res?.data?.data || res?.data || [];
      const allJournals = Array.isArray(list) ? list : [];

      const myJournals = allJournals.filter(
        (j) => j?.admin && String(j.admin.id) === String(currentAdminId)
      );

      setJournals(myJournals);
      setProfile(myJournals[0]?.admin || null);
    } catch (err) {
      toast.error("Failed to load journals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentAdminId) {
      toast.error("Admin ID not found. Please login again.");
      setLoading(false);
      return;
    }
    fetchJournals();
  }, [currentAdminId]);

  const openDeleteModal = (journal) => {
    setSelectedJournal(journal);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedJournal) return;
    try {
      setDeleting(true);
      await journalService.delete(selectedJournal.id);
      toast.success("Journal deleted successfully");
      setDeleteOpen(false);
      setSelectedJournal(null);
      fetchJournals();
    } catch {
      toast.error("Failed to delete journal");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center text-blue-600">
        <FiLoader className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 mx-auto max-w-7xl  animate-in fade-in duration-500">
      
      {/* ===== ADMIN PROFILE CARD ===== */}
      {profile && (
        <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
          
          <div className="relative">
            <img
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=0D8ABC&color=fff`}
              className="w-32 h-32 rounded-2xl object-cover ring-4 ring-slate-50 shadow-lg transition-transform duration-300 group-hover:scale-105"
              alt="Profile"
            />
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{profile.full_name}</h2>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider border border-blue-100">
                  {profile.role}
                </span>
              </div>
              <p className="text-slate-500 font-medium flex items-center gap-2 mt-1 italic">
                {profile.affiliation || "Academic Research Member"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-600 text-sm">
                <FiMail className="text-blue-500" /> {profile.email}
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-600 text-sm">
                <FiPhone className="text-blue-500" /> {profile.phone}
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 text-slate-600 text-sm">
                <FiGlobe className="text-blue-500" /> {profile.country}
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-md shadow-blue-200">
                <FiUser /> ORCID: {profile.orcid}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== JOURNALS TABLE SECTION ===== */}
      <div className="space-y-6 mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Journals</h1>
            <p className="text-slate-500">Manage and monitor your publications effectively.</p>
          </div>

          <button
            onClick={() => navigate("/journal-list/addjournal")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-95"
          >
            <FiPlus size={20} /> Add New Journal
          </button>
        </div>

        {journals.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
              <FiBookOpen size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No journals found</h3>
            <p className="text-slate-400 max-w-xs mx-auto text-sm italic">You haven't added any journals yet. Start by clicking the "Add New Journal" button.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-[0_5px_15px_rgb(0,0,0,0.02)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Journal Name</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">ISSN Number</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Current Status</th>
                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {journals.map((j) => (
                    <tr key={j.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4 font-bold text-slate-800">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                            <FiBookOpen />
                          </div>
                          {j.name}
                        </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-sm text-slate-600 bg-slate-50/40">{j.issn}</td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border ${
                          j.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${j.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {j.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/journal-list/editjournal/${j.id}`, { state: { journal: j } })}
                            className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(j)}
                            className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-all"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ===== MODERN DELETE MODAL ===== */}
      {deleteOpen && (
<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md relative shadow-2xl border border-slate-100 scale-in-center animate-in zoom-in-95 duration-200">
      <button
        onClick={() => setDeleteOpen(false)}
        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
      >
        <FiX size={20} />
      </button>

      <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-6">
        <FiAlertCircle size={32} />
      </div>

      <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight tracking-tight">Confirm Deletion</h3>
      <p className="text-slate-500 mb-8 leading-relaxed">
        Are you sure you want to delete <span className="font-bold text-slate-800 italic underline decoration-rose-200 underline-offset-4 tracking-tight">"{selectedJournal?.name}"</span>? 
        This process is permanent and data cannot be recovered.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => setDeleteOpen(false)}
          className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 transition-all"
        >
          Keep it
        </button>
        <button
          onClick={confirmDelete}
          disabled={deleting}
          className="flex-[1.5] px-6 py-4 rounded-2xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deleting ? "Processing..." : "Yes, Delete Now"}
        </button>
      </div>
    </div>
  </div>
      )}
    </div>
  );
};

export default JournalList;
import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";
import { FiCheck, FiX, FiRefreshCw, FiUser, FiMail, FiBook } from "react-icons/fi";
import { editorService, journalService } from "../../../services/api";

const EditorRequests = () => {
  const [loading, setLoading] = useState(true);
  const [allEditors, setAllEditors] = useState([]);
  const [allJournals, setAllJournals] = useState([]);
  
  const myAdminId = useMemo(() => localStorage.getItem("journal_admin_id"), []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const [edRes, jrRes] = await Promise.all([
        editorService.getAll(),
        journalService.getAll(),
      ]);

      // Har xil javob formatlarini qo'llab-quvvatlash
      const editors = Array.isArray(edRes?.data) 
        ? edRes.data 
        : Array.isArray(edRes?.data?.data) 
          ? edRes.data.data 
          : [];

      const journals = Array.isArray(jrRes?.data) 
        ? jrRes.data 
        : Array.isArray(jrRes?.data?.data) 
          ? jrRes.data.data 
          : [];

      console.log("📋 All editors from API:", editors.map(e => ({
        id: e.id, name: e.fullname, status: e.status, journal_id: e.journal_id
      })));
      console.log("📚 All journals from API:", journals.map(j => ({
        id: j.id, name: j.name, admin_id: j.journal_admin_id
      })));
      console.log("👤 My Admin ID:", myAdminId);

      setAllEditors(editors);
      setAllJournals(journals);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("So'rovlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Menga tegishli jurnallar
  const myJournalIds = useMemo(() => {
    if (!myAdminId) return [];
    const ids = allJournals
      .filter(j => String(j.journal_admin_id) === String(myAdminId))
      .map(j => String(j.id));
    console.log("🗂️ My journal IDs:", ids);
    return ids;
  }, [allJournals, myAdminId]);

  // Mening jurnallarimga kelgan Pending so'rovlar
  const pendingRequests = useMemo(() => {
    const filtered = allEditors.filter(ed => {
      const isPending = ed.status === "Pending";
      const isMyJournal = myJournalIds.includes(String(ed.journal_id));
      console.log(`Editor ${ed.fullname}: status=${ed.status}, journal_id=${ed.journal_id}, isPending=${isPending}, isMyJournal=${isMyJournal}`);
      return isPending && isMyJournal;
    });
    console.log("✅ Filtered pending requests:", filtered.length);
    return filtered;
  }, [allEditors, myJournalIds]);

  const handleApprove = async (id) => {
    try {
      await editorService.updateStatus(id, "Active");
      toast.success("Muharrir muvaffaqiyatli qabul qilindi ✅");
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error("Qabul qilishda xatolik yuz berdi");
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Haqiqatdan ham ushbu so'rovni rad etib o'chirasizmi?")) return;
    try {
      await editorService.delete(id);
      toast.success("So'rov rad etildi va o'chirildi");
      fetchRequests();
    } catch (error) {
      console.error(error);
      toast.error("Rad etishda xatolik yuz berdi");
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#1F4F8F] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Muharrir So'rovlari</h1>
          <p className="text-gray-500 mt-1">
            Sizning jurnallaringizga kelgan yangi muharrirlik arizalari
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition-all font-semibold"
        >
          <FiRefreshCw /> Yangilash
        </button>
      </div>

      {/* Debug info */}
      {!myAdminId && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm font-semibold">
          ⚠️ Admin ID topilmadi. Iltimos, qayta login qiling.
        </div>
      )}

      {myAdminId && myJournalIds.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm font-semibold">
          ℹ️ Sizga biriktirilgan jurnal topilmadi (Admin ID: {myAdminId}). Avval jurnal yarating.
        </div>
      )}

      {/* Editor cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingRequests.map((ed) => (
          <div
            key={ed.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
          >
            {/* Card header */}
            <div className="h-24 bg-gradient-to-r from-blue-600 to-[#1F4F8F] relative">
              <div className="absolute -bottom-10 left-6">
                {ed.profile_img ? (
                  <img
                    src={ed.profile_img}
                    alt={ed.fullname}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-sm"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center border-4 border-white shadow-sm">
                    <FiUser className="text-3xl text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-12 p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{ed.fullname}</h3>
                <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                  <FiMail className="flex-shrink-0" />
                  <span className="truncate">{ed.email}</span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-3">
                <FiBook className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Jurnal</p>
                  <p className="text-sm font-semibold text-blue-900">
                    {ed.journal?.name ||
                      allJournals.find(j => String(j.id) === String(ed.journal_id))?.name ||
                      `Jurnal #${ed.journal_id}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleApprove(ed.id)}
                  className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                >
                  <FiCheck /> Qabul
                </button>
                <button
                  onClick={() => handleReject(ed.id)}
                  className="flex items-center justify-center gap-2 bg-rose-500 text-white py-2.5 rounded-xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 active:scale-95"
                >
                  <FiX /> Rad etish
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {pendingRequests.length === 0 && myJournalIds.length > 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-sm">
            <FiUser className="text-3xl text-gray-300" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Yangi so'rovlar mavjud emas</h2>
          <p className="text-gray-500 mt-2">Hozirda barcha so'rovlar ko'rib chiqilgan.</p>
        </div>
      )}
    </div>
  );
};

export default EditorRequests;

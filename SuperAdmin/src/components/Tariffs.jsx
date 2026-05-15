import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { tariffService } from "../services/api";
import { toast } from "react-hot-toast";
import { FiPlus, FiTrash2, FiEdit, FiCheck, FiX, FiDollarSign } from "react-icons/fi";

const Tariffs = () => {
    const [tariffs, setTariffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: "Journal",
        price: 0,
        journal_limit: "",
        article_limit: "",
        duration_days: "",
        description: ""
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchTariffs();
    }, []);

    const fetchTariffs = async () => {
        try {
            const res = await tariffService.getAll();
            setTariffs(res.data);
        } catch (error) {
            toast.error("Tariflarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                journal_limit: formData.journal_limit === "" ? null : parseInt(formData.journal_limit),
                article_limit: formData.article_limit === "" ? null : parseInt(formData.article_limit),
                duration_days: formData.duration_days === "" ? null : parseInt(formData.duration_days),
                price: parseFloat(formData.price)
            };

            if (editingId) {
                await tariffService.update(editingId, data);
                toast.success("Tarif yangilandi");
            } else {
                await tariffService.create(data);
                toast.success("Tarif qo'shildi");
            }
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ name: "", type: "Journal", price: 0, journal_limit: "", article_limit: "", duration_days: "", description: "" });
            fetchTariffs();
        } catch (error) {
            toast.error(error.response?.data || "Xatolik yuz berdi");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Haqiqatan ham ushbu tarifni o'chirmoqchimisiz?")) return;
        try {
            await tariffService.delete(id);
            toast.success("Tarif o'chirildi");
            fetchTariffs();
        } catch (error) {
            toast.error("O'chirishda xatolik");
        }
    };

    const handleEdit = (tariff) => {
        setEditingId(tariff.id);
        setFormData({
            name: tariff.name,
            type: tariff.type,
            price: tariff.price,
            journal_limit: tariff.journal_limit || "",
            article_limit: tariff.article_limit || "",
            duration_days: tariff.duration_days || "",
            description: tariff.description || ""
        });
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tariflar & Narxlar</h1>
                    <p className="text-gray-500 mt-1">Jurnal va maqolalar uchun obuna rejalari</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: "", type: "Journal", price: 0, journal_limit: "", article_limit: "", duration_days: "", description: "" });
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#002147] text-white rounded-2xl font-bold hover:bg-[#003366] transition shadow-lg shadow-blue-100"
                >
                    <FiPlus /> Yangi tarif
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tariffs.map((tariff) => (
                        <div key={tariff.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                            <div className={`p-6 ${tariff.type === 'Journal' ? 'bg-indigo-50/50' : 'bg-emerald-50/50'}`}>
                                <div className="flex justify-between items-start">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tariff.type === 'Journal' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {tariff.type}
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(tariff)} className="p-2 bg-white text-gray-400 hover:text-blue-600 rounded-xl border border-gray-100 shadow-sm transition-all"><FiEdit size={16} /></button>
                                        <button onClick={() => handleDelete(tariff.id)} className="p-2 bg-white text-gray-400 hover:text-red-600 rounded-xl border border-gray-100 shadow-sm transition-all"><FiTrash2 size={16} /></button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mt-4">{tariff.name}</h3>
                                <div className="mt-4 flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-gray-900">${tariff.price}</span>
                                    <span className="text-gray-400 text-sm">/ {tariff.duration_days ? `${tariff.duration_days} kun` : 'umrbod'}</span>
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-gray-500 text-sm line-clamp-2 min-h-[2.5rem]">{tariff.description || "Tavsif mavjud emas"}</p>
                                <div className="space-y-3 pt-4 border-t border-gray-50">
                                    {tariff.type === 'Journal' ? (
                                        <div className="flex items-center gap-3 text-sm text-gray-700">
                                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><FiCheck size={14}/></div>
                                            <span>Jurnallar limiti: <b>{tariff.journal_limit || "Cheksiz"}</b></span>
                                        </div>
                                    ) : null}
                                    <div className="flex items-center gap-3 text-sm text-gray-700">
                                        <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><FiCheck size={14}/></div>
                                        <span>Maqolalar limiti: <b>{tariff.article_limit || "Cheksiz"}</b></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                    <div 
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
                        onClick={() => setIsModalOpen(false)} 
                    />
                    <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-gray-50 bg-[#002147] text-white shrink-0">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold">{editingId ? "Tarifni tahrirlash" : "Yangi tarif yaratish"}</h2>
                                    <p className="text-blue-200 text-xs mt-1 font-medium">Barcha maydonlarni to'ldiring</p>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)} 
                                    className="p-3 hover:bg-white/10 rounded-2xl text-white/70 hover:text-white transition-all cursor-pointer"
                                >
                                    <FiX size={24}/>
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto scrollbar-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tarif nomi</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Masalan: Premium Journal Plan"
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none font-medium"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Turi</label>
                                    <select
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none font-bold text-gray-700"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="Journal">Jurnal uchun</option>
                                        <option value="Article">Maqola uchun</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Narxi ($)</label>
                                    <div className="relative">
                                        <FiDollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            required
                                            type="number"
                                            step="0.01"
                                            className="w-full pl-10 pr-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none font-bold"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                </div>
                                {formData.type === 'Journal' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Jurnallar limiti</label>
                                        <input
                                            type="number"
                                            placeholder="Cheksiz uchun bo'sh"
                                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none font-bold"
                                            value={formData.journal_limit}
                                            onChange={(e) => setFormData({ ...formData, journal_limit: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Maqolalar limiti</label>
                                    <input
                                        type="number"
                                        placeholder="Cheksiz uchun bo'sh"
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none font-bold"
                                        value={formData.article_limit}
                                        onChange={(e) => setFormData({ ...formData, article_limit: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Muddati (kun)</label>
                                    <input
                                        type="number"
                                        placeholder="Umrbod uchun bo'sh"
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none font-bold"
                                        value={formData.duration_days}
                                        onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tavsif</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Tarif haqida qisqacha..."
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white transition-all outline-none font-medium resize-none"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all cursor-pointer"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    className="flex-2 px-10 py-4 rounded-2xl bg-[#002147] text-white font-black shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                                >
                                    {editingId ? "Saqlash" : "Yaratish"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default Tariffs;

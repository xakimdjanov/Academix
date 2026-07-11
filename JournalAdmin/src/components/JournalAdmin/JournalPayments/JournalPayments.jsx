import React, { useEffect, useState } from "react";
import { FiCreditCard, FiSearch, FiRefreshCw, FiClock, FiCheckCircle } from "react-icons/fi";
import { paymentService } from "../../../services/api";
import toast from "react-hot-toast";

const JournalPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentService.getJournalPayments();
      if (res.data && res.data.success) {
        setPayments(res.data.payments);
      }
    } catch (error) {
      toast.error("To'lovlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((payment) =>
    payment.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.journal?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.order_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiCreditCard className="text-blue-600" /> Jurnal To'lovlari
          </h1>
          <p className="text-gray-500 text-sm mt-1">Mualliflar tomonidan amalga oshirilgan barcha to'lovlar tarixi</p>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Yangilash
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Qidiruv (Ism, jurnal, buyurtma ID)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">T/r</th>
                <th className="px-6 py-4">Foydalanuvchi</th>
                <th className="px-6 py-4">Jurnal</th>
                <th className="px-6 py-4">Miqdor (UZS)</th>
                <th className="px-6 py-4">Holat</th>
                <th className="px-6 py-4">Sana</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment, index) => (
                  <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-medium">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{payment.user?.full_name || "Noma'lum"}</div>
                      <div className="text-xs text-gray-500">{payment.user?.email || ""}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-blue-700">{payment.journal?.name || "Noma'lum"}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">{payment.amount.toLocaleString()} UZS</td>
                    <td className="px-6 py-4">
                      {payment.status === 'success' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                          <FiCheckCircle /> Muvaffaqiyatli
                        </span>
                      ) : payment.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                          <FiClock /> Kutilmoqda
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                          Xatolik
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                    Hech qanday to'lov topilmadi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JournalPayments;

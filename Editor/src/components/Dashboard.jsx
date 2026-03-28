import React, { useEffect, useState, useMemo } from 'react';
import {
  FiFileText, FiCheckCircle, FiXCircle, FiClock,
  FiTrendingUp, FiArrowUpRight, FiActivity, FiCalendar
} from 'react-icons/fi';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';

import { ReviewAssignments } from '../services/api';
import { getEditorIdFromToken } from '../utils/getEditorIdFromToken';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

const Dashboard = () => {
  const editorId = getEditorIdFromToken();
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('weekly'); // 'weekly' yoki 'monthly'
  const [rawAssignments, setRawAssignments] = useState([]);
  
  const [stats, setStats] = useState({
    total: 0, accepted: 0, rejected: 0, revision: 0, pending: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!editorId) return;
      try {
        setLoading(true);
        const res = await ReviewAssignments.getAll();
        const myData = res.data?.filter(a => Number(a.editor_id) === Number(editorId)) || [];
        
        setRawAssignments(myData);
        
        // Asosiy statistika
        setStats({
          total: myData.length,
          accepted: myData.filter(a => a.article?.status === 'Accepted').length,
          rejected: myData.filter(a => a.article?.status === 'Rejected').length,
          revision: myData.filter(a => a.article?.status === 'Needs Revision').length,
          pending: myData.filter(a => ['Under Review', 'submitted'].includes(a.article?.status)).length,
        });
      } catch (error) {
        toast.error("Analitika ma'lumotlarini yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [editorId]);

  // Grafik ma'lumotlarini hisoblash (Haftalik va Oylik)
  const chartData = useMemo(() => {
    if (viewType === 'weekly') {
      // Oxirgi 7 kun
      return [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = rawAssignments.filter(a => a.createdAt?.startsWith(dateStr)).length;
        const days = { Mon: 'Dush', Tue: 'Sesh', Wed: 'Chor', Thu: 'Pay', Fri: 'Jum', Sat: 'Shan', Sun: 'Yak' };
        const enDay = d.toLocaleDateString('en-US', { weekday: 'short' });
        return { name: days[enDay] || enDay, reviews: count };
      }).reverse();
    } else {
      // Oxirgi 4 hafta (Oylik ko'rinish)
      return [...Array(4)].map((_, i) => {
        const start = new Date();
        start.setDate(start.getDate() - (i + 1) * 7);
        const end = new Date();
        end.setDate(end.getDate() - i * 7);
        
        const count = rawAssignments.filter(a => {
          const createDate = new Date(a.createdAt);
          return createDate >= start && createDate <= end;
        }).length;
        
        return { name: `${4 - i}-hafta`, reviews: count };
      }).reverse();
    }
  }, [rawAssignments, viewType]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#002147] border-t-transparent"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-[#002147] tracking-tight">Analitika paneli</h1>
          </div>
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button 
              onClick={() => setViewType('weekly')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewType === 'weekly' ? 'bg-[#002147] text-white' : 'text-slate-400'}`}
            >
              Haftalik
            </button>
            <button 
              onClick={() => setViewType('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewType === 'monthly' ? 'bg-[#002147] text-white' : 'text-slate-400'}`}
            >
              Oylik
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Jami topshiriqlar" value={stats.total} icon={<FiFileText />} color="blue" />
          <StatCard title="Qabul qilingan" value={stats.accepted} icon={<FiCheckCircle />} color="green" />
          <StatCard title="Tahrirda" value={stats.revision} icon={<FiClock />} color="yellow" />
          <StatCard title="Rad etilgan" value={stats.rejected} icon={<FiXCircle />} color="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Activity Chart */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <FiTrendingUp className="text-blue-600" /> Taqriz faolligi ({viewType === 'weekly' ? 'Haftalik' : 'Oylik'})
              </h3>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)'}}
                    cursor={{stroke: '#3b82f6', strokeWidth: 2}}
                  />
                  <Area type="monotone" dataKey="reviews" stroke="#3b82f6" strokeWidth={4} fill="url(#colorReviews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
            <h3 className="font-bold text-slate-800 text-lg mb-6 self-start">Taqsimot</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Accepted', value: stats.accepted },
                      { name: 'Rejected', value: stats.rejected },
                      { name: 'Revision', value: stats.revision },
                      { name: 'Pending', value: stats.pending },
                    ]}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => <Cell key={index} fill={color} stroke="none" />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-8">
              {[
                { label: 'Qabul qilingan', key: 'Accepted' },
                { label: 'Rad etilgan', key: 'Rejected' },
                { label: 'Tahrirda', key: 'Revision' },
                { label: 'Kutilmoqda', key: 'Pending' }
              ].map((item, i) => (
                <div key={item.key} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i]}}></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => {
  const themes = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-emerald-600 bg-emerald-50',
    yellow: 'text-amber-600 bg-amber-50',
    red: 'text-rose-600 bg-rose-50',
  };

  return (
    <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:translate-y-[-5px] transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-4 rounded-2xl ${themes[color]} text-2xl group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <FiArrowUpRight className="text-slate-200 group-hover:text-blue-500 transition-colors" size={24} />
      </div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{title}</p>
      <h3 className="text-4xl font-black text-slate-800 mt-1">{value}</h3>
    </div>
  );
};

export default Dashboard
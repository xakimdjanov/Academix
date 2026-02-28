import React, { useEffect, useState } from 'react';
import {
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiEye,
  FiTrendingUp,
  FiUsers,
  FiCalendar,
  FiStar,
} from 'react-icons/fi';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import toast from 'react-hot-toast';
import { ReviewAssignments, articleService, Review } from '../services/api';
import { getEditorIdFromToken } from '../utils/getEditorIdFromToken';

const Dashboard = () => {
  const editorId = getEditorIdFromToken();
  
  const [stats, setStats] = useState({
    totalArticles: 0,
    reviewed: 0,
    pending: 0,
    inProgress: 0,
    accepted: 0,
    rejected: 0,
    revision: 0,
  });
  
  const [recentActivities, setRecentActivities] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Colors for charts
  const COLORS = ['#002147', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    if (editorId) {
      loadDashboardData();
    }
  }, [editorId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get all assignments for this editor
      const assignmentsRes = await ReviewAssignments.getAll();
      const allAssignments = assignmentsRes.data || [];
      
      const myAssignments = allAssignments.filter(
        a => Number(a.editor_id) === Number(editorId)
      );
      
      // Get all reviews by this editor
      const reviewsRes = await Review.getAll();
      const allReviews = reviewsRes.data || [];
      
      const myReviews = allReviews.filter(
        r => Number(r.editor_id) === Number(editorId)
      );
      
      // Calculate statistics
      const totalArticles = myAssignments.length;
      const reviewed = myReviews.length;
      const pending = myAssignments.filter(a => a.status === 'pending').length;
      const inProgress = myAssignments.filter(a => a.status === 'in_progress').length;
      const accepted = myReviews.filter(r => r.recommendation === 'accept').length;
      const rejected = myReviews.filter(r => r.recommendation === 'reject').length;
      const revision = myReviews.filter(r => r.recommendation === 'revision').length;
      
      setStats({
        totalArticles,
        reviewed,
        pending,
        inProgress,
        accepted,
        rejected,
        revision,
      });
      
      // Generate monthly data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      
      const monthly = [];
      for (let i = 5; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const monthName = months[monthIndex];
        
        // Count reviews in this month
        const monthReviews = myReviews.filter(r => {
          const reviewDate = new Date(r.createdAt);
          return reviewDate.getMonth() === monthIndex;
        }).length;
        
        monthly.push({
          name: monthName,
          reviews: monthReviews,
          assignments: Math.floor(Math.random() * 5) + 1, // Replace with actual data
        });
      }
      setMonthlyData(monthly);
      
      // Recent activities
      const activities = [
        ...myReviews.map(r => ({
          id: r.id,
          type: 'review',
          action: `Reviewed article #${r.article_id}`,
          recommendation: r.recommendation,
          date: r.createdAt,
        })),
        ...myAssignments.map(a => ({
          id: a.id,
          type: 'assignment',
          action: `Assigned to review: ${a.article?.title || 'Article'}`,
          status: a.status,
          date: a.assigned_at,
        })),
      ];
      
      activities.sort((a, b) => new Date(b.date) - new Date(a.date));
      setRecentActivities(activities.slice(0, 5));
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationColor = (rec) => {
    const colors = {
      accept: 'text-green-600 bg-green-50',
      reject: 'text-red-600 bg-red-50',
      revision: 'text-yellow-600 bg-yellow-50',
    };
    return colors[rec] || 'text-gray-600 bg-gray-50';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      in_progress: 'text-blue-600 bg-blue-50',
      completed: 'text-green-600 bg-green-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#002147] mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back! Here's an overview of your reviewing activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<FiFileText className="text-blue-600" size={24} />}
            title="Total Articles"
            value={stats.totalArticles}
            subtitle="Assigned to you"
            color="blue"
          />
          
          <StatCard
            icon={<FiCheckCircle className="text-green-600" size={24} />}
            title="Reviewed"
            value={stats.reviewed}
            subtitle={`${stats.reviewed} completed`}
            color="green"
          />
          
          <StatCard
            icon={<FiClock className="text-yellow-600" size={24} />}
            title="Pending"
            value={stats.pending}
            subtitle="Awaiting review"
            color="yellow"
          />
          
          <StatCard
            icon={<FiEye className="text-purple-600" size={24} />}
            title="In Progress"
            value={stats.inProgress}
            subtitle="Currently reviewing"
            color="purple"
          />
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCardSmall
            icon={<FiCheckCircle />}
            title="Accepted"
            value={stats.accepted}
            percentage={stats.reviewed ? Math.round((stats.accepted / stats.reviewed) * 100) : 0}
            color="green"
          />
          
          <StatCardSmall
            icon={<FiXCircle />}
            title="Rejected"
            value={stats.rejected}
            percentage={stats.reviewed ? Math.round((stats.rejected / stats.reviewed) * 100) : 0}
            color="red"
          />
          
          <StatCardSmall
            icon={<FiStar />}
            title="Revision"
            value={stats.revision}
            percentage={stats.reviewed ? Math.round((stats.revision / stats.reviewed) * 100) : 0}
            color="yellow"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Activity Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Monthly Activity</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#002147" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#002147" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="reviews" 
                    stroke="#002147" 
                    fillOpacity={1} 
                    fill="url(#colorReviews)" 
                    name="Reviews"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Review Distribution Pie Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Review Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Accepted', value: stats.accepted },
                      { name: 'Rejected', value: stats.rejected },
                      { name: 'Revision', value: stats.revision },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.accepted > 0 && <Cell fill="#10b981" />}
                    {stats.rejected > 0 && <Cell fill="#ef4444" />}
                    {stats.revision > 0 && <Cell fill="#f59e0b" />}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb'
                    }} 
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bar Chart for Recommendations */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Reviews by Recommendation</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Accept', value: stats.accepted },
                { name: 'Reject', value: stats.rejected },
                { name: 'Revision', value: stats.revision },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb'
                  }} 
                />
                <Bar dataKey="value" fill="#002147" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activities</p>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'review' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {activity.type === 'review' ? (
                      <FiCheckCircle className="text-green-600" size={16} />
                    ) : (
                      <FiClock className="text-blue-600" size={16} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {activity.recommendation && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getRecommendationColor(activity.recommendation)}`}>
                          {activity.recommendation}
                        </span>
                      )}
                      {activity.status && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
                          {activity.status.replace('_', ' ')}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        <FiCalendar className="inline mr-1" size={12} />
                        {formatDate(activity.date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Small Stat Card
const StatCardSmall = ({ icon, title, value, percentage, color }) => {
  const colorClasses = {
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    yellow: 'text-yellow-600 bg-yellow-50',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </span>
        <span className="text-sm font-medium text-gray-500">{percentage}%</span>
      </div>
      <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </div>
  );
};

export default Dashboard;
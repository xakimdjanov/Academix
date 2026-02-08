import React, { useEffect, useMemo, useState } from "react";
import { articleService } from "../../../services/api";
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiDollarSign,
} from "react-icons/fi";

const APC_PRICE = 150; // har maqola uchun to‘lov (misol)

const Dashboard = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await articleService.getAll();
        const data = res?.data?.data || res?.data || [];
        setArticles(data);
      } catch (err) {
        console.error("Error loading articles", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 📊 Statistikalar
  const total = articles.length;

  const published = useMemo(
    () => articles.filter((a) => a.apc_paid === true).length,
    [articles]
  );

  const underReview = useMemo(
    () => articles.filter((a) => a.apc_paid === false).length,
    [articles]
  );

  const revenue = useMemo(
    () => published * APC_PRICE,
    [published]
  );

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">
          Journal Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Overview of journal performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Total Submissions */}
        <StatCard
          title="Total Submissions"
          value={total}
          icon={<FiFileText />}
          bg="bg-blue-500/10"
          text="text-blue-600"
        />

        {/* Under Review */}
        <StatCard
          title="Under Review"
          value={underReview}
          icon={<FiClock />}
          bg="bg-yellow-500/10"
          text="text-yellow-600"
        />

        {/* Published */}
        <StatCard
          title="Published"
          value={published}
          icon={<FiCheckCircle />}
          bg="bg-green-500/10"
          text="text-green-600"
        />

        {/* Revenue */}
        <StatCard
          title="Revenue (APC)"
          value={`$${revenue}`}
          icon={<FiDollarSign />}
          bg="bg-purple-500/10"
          text="text-purple-600"
        />
      </div>

      {/* Recent Articles */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-lg font-semibold mb-4">
          Recent Submissions
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr>
                <th className="py-2">Title</th>
                <th>Author</th>
                <th>Language</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {articles.slice(0, 5).map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{a.title}</td>
                  <td>{a.authors}</td>
                  <td>{a.language}</td>
                  <td>
                    {a.apc_paid ? (
                      <span className="text-green-600 font-medium">
                        Published
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-medium">
                        Under Review
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {articles.length === 0 && (
            <p className="text-gray-400 mt-4">
              No submissions yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

/* ============================= */
/* Reusable Stat Card Component  */
/* ============================= */

const StatCard = ({ title, value, icon, bg, text }) => {
  return (
    <div className="bg-white rounded-2xl shadow p-5 flex items-center justify-between hover:shadow-lg transition">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div
        className={`w-12 h-12 flex items-center justify-center rounded-xl ${bg} ${text} text-xl`}
      >
        {icon}
      </div>
    </div>
  );
};

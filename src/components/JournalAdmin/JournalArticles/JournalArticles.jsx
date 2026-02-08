import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { articleService } from "../../../services/api";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";

const STATUSES = [
  "Submitted",
  "Under Review",
  "Needs Revision",
  "Accepted",
  "Rejected",
];

function getStatus(article) {
  // ✅ 1) backend status bo‘lsa
  if (article?.status) return article.status;

  // ✅ 2) fallback (sizning model bo‘yicha)
  if (article?.apc_paid === true) return "Accepted";
  return "Under Review";
}

function getId(article) {
  return article?.id || article?._id || article?.article_id;
}

function getAuthor(article) {
  return article?.authors || article?.author || article?.author_name || "-";
}

function getAssignedEditor(article) {
  // backenddan shu field kelishi kerak:
  return (
    article?.assigned_editor_name ||
    article?.assignedEditorName ||
    article?.editor_name ||
    "-"
  );
}

const JournalArticles = () => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState("Submitted");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await articleService.getAll();
        const list = res?.data?.data || res?.data || [];
        setArticles(Array.isArray(list) ? list : []);
      } catch (e) {
        toast.error("Articles load failed");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return articles.filter((a) => getStatus(a) === filter);
  }, [articles, filter]);

  const onDelete = async (article) => {
    const id = getId(article);
    if (!id) return toast.error("ID topilmadi");

    if (!confirm("Delete this article?")) return;

    try {
      await articleService.delete(id);
      toast.success("Deleted");
      setArticles((prev) => prev.filter((x) => getId(x) !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Articles</h1>
        <p className="text-sm text-gray-500">
          Filter and manage submissions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={[
                "px-4 py-2 rounded-xl text-sm font-semibold transition border",
                filter === s
                  ? "bg-[#002147] text-white border-[#002147]"
                  : "bg-white text-[#1F2937] border-gray-200 hover:bg-gray-50",
              ].join(" ")}
            >
              {s}
              <span className="ml-2 text-xs opacity-80">
                (
                {articles.filter((a) => getStatus(a) === s).length}
                )
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="px-5 py-4 border-b">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="font-semibold text-[#1F2937]">
              {filter} Articles
            </div>
            <div className="text-sm text-gray-500">
              Total: {filtered.length}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr>
                <th className="py-3 px-5">Title</th>
                <th className="py-3 px-5">Author</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Assigned editor</th>
                <th className="py-3 px-5 w-[220px]">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((a) => {
                const id = getId(a);
                const status = getStatus(a);

                return (
                  <tr key={id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-5 font-medium text-[#1F2937]">
                      {a?.title || "-"}
                    </td>
                    <td className="py-3 px-5">{getAuthor(a)}</td>
                    <td className="py-3 px-5">
                      <StatusPill status={status} />
                    </td>
                    <td className="py-3 px-5">{getAssignedEditor(a)}</td>
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2">
                        <button
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                          onClick={() => toast(`View: ${id}`)}
                        >
                          <FiEye />
                          View
                        </button>

                        <button
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100"
                          onClick={() => toast(`Edit: ${id}`)}
                        >
                          <FiEdit2 />
                          Edit
                        </button>

                        <button
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(a)}
                        >
                          <FiTrash2 />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-400">
                    No articles in "{filter}"
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

export default JournalArticles;

function StatusPill({ status }) {
  const cls =
    status === "Accepted"
      ? "bg-green-100 text-green-700"
      : status === "Rejected"
      ? "bg-red-100 text-red-700"
      : status === "Needs Revision"
      ? "bg-orange-100 text-orange-700"
      : status === "Under Review"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-blue-100 text-blue-700"; // Submitted

  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}
  
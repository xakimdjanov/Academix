import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { articleService, commentService } from "../../../services/api";
import { FiSend, FiMessageSquare, FiTrash2 } from "react-icons/fi";

const DECISIONS = ["Accept", "Reject", "Needs Revision"];
const VISIBILITY = ["Author", "Editor", "Private"];

function getId(x) {
  return x?.id || x?._id || x?.comment_id;
}

function getArticleId(a) {
  return a?.id || a?._id || a?.article_id;
}

const JournalDecisions = () => {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState([]);
  const [comments, setComments] = useState([]);

  const [articleId, setArticleId] = useState("");
  const [decision, setDecision] = useState("Accept");
  const [visibility, setVisibility] = useState("Author");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);

  const userId = useMemo(() => {
    // jurnal admin id bo‘lsa shu
    const id = localStorage.getItem("journal_admin_id");
    return id ? Number(id) || id : 0;
  }, []);

  // 1) Load articles
  useEffect(() => {
    const load = async () => {
      try {
        const res = await articleService.getAll();
        const list = res?.data?.data || res?.data || [];
        const arr = Array.isArray(list) ? list : [];
        setArticles(arr);

        // default select first article
        if (arr.length > 0) {
          const firstId = getArticleId(arr[0]);
          setArticleId(String(firstId));
        }
      } catch {
        toast.error("Articles load failed");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 2) Load all comments (sizda getByArticle endpoint yo‘q)
  useEffect(() => {
    const loadComments = async () => {
      try {
        const res = await commentService.getAll();
        const list = res?.data?.data || res?.data || [];
        setComments(Array.isArray(list) ? list : []);
      } catch {
        setComments([]);
      }
    };
    loadComments();
  }, []);

  // Filter comments by selected article
  const articleComments = useMemo(() => {
    if (!articleId) return [];
    return comments.filter((c) => String(c.article_id) === String(articleId));
  }, [comments, articleId]);

  const selectedArticle = useMemo(() => {
    return articles.find((a) => String(getArticleId(a)) === String(articleId));
  }, [articles, articleId]);

  const sendDecision = async () => {
    if (!articleId) return toast.error("Select an article");
    if (!comment.trim()) return toast.error("Write a comment first");

    setSending(true);
    try {
      const payload = {
        article_id: Number(articleId) || articleId,
        user_id: userId,
        visibility,
        comment: `[DECISION: ${decision}] ${comment.trim()}`,
      };

      await commentService.create(payload);

      toast.success("Decision sent");

      // refresh comments
      const res = await commentService.getAll();
      const list = res?.data?.data || res?.data || [];
      setComments(Array.isArray(list) ? list : []);

      // clear comment box
      setComment("");
    } catch {
      toast.error("Send failed");
    } finally {
      setSending(false);
    }
  };

  const deleteComment = async (row) => {
    const id = getId(row);
    if (!id) return toast.error("Comment ID not found");
    if (!confirm("Delete this comment?")) return;

    try {
      await commentService.delete(id);
      toast.success("Deleted");
      setComments((prev) => prev.filter((x) => getId(x) !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F2937]">Decisions</h1>
        <p className="text-sm text-gray-500">
          Send decision with review comments
        </p>
      </div>

      {/* Top: Select Article */}
      <div className="bg-white rounded-2xl shadow p-5">
        <label className="block text-sm font-medium text-[#1F2937] mb-2">
          Select article
        </label>

        <select
          value={articleId}
          onChange={(e) => setArticleId(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4F8F] focus:border-transparent"
        >
          {articles.map((a) => {
            const id = getArticleId(a);
            return (
              <option key={id} value={String(id)}>
                {a?.title || "Untitled"} (ID: {id})
              </option>
            );
          })}
        </select>

        {selectedArticle && (
          <div className="mt-4 rounded-xl bg-gray-50 p-4">
            <p className="text-sm font-semibold text-[#1F2937]">
              {selectedArticle.title || "Untitled"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Author: {selectedArticle.authors || "-"} • Language:{" "}
              {selectedArticle.language || "-"}
            </p>
          </div>
        )}
      </div>

      {/* Decision Form */}
      <div className="bg-white rounded-2xl shadow p-5">
        <div className="flex items-center gap-2 mb-4">
          <FiMessageSquare className="text-[#002147]" />
          <h2 className="text-lg font-semibold">Review comments</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Decision */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">
              Decision
            </label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4F8F] focus:border-transparent"
            >
              {DECISIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4F8F] focus:border-transparent"
            >
              {VISIBILITY.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Send */}
          <div className="flex items-end">
            <button
              onClick={sendDecision}
              disabled={sending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#002147] text-white font-semibold hover:opacity-95 disabled:opacity-60"
            >
              <FiSend />
              {sending ? "Sending..." : "Send decision"}
            </button>
          </div>
        </div>

        {/* Comment box */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-[#1F2937] mb-2">
            Comment
          </label>
          <textarea
            rows={6}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write review comment here..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F4F8F] focus:border-transparent"
          />
        </div>
      </div>

      {/* Comments history */}
      <div className="bg-white rounded-2xl shadow p-5">
        <h2 className="text-lg font-semibold mb-4">Decision history</h2>

        {articleComments.length === 0 ? (
          <p className="text-gray-400 text-sm">No comments for this article.</p>
        ) : (
          <div className="space-y-3">
            {articleComments
              .slice()
              .reverse()
              .map((c) => (
                <div
                  key={getId(c)}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500">
                        Visibility:{" "}
                        <span className="font-semibold">{c.visibility}</span>
                      </p>
                      <p className="mt-2 text-sm text-[#1F2937] whitespace-pre-wrap">
                        {c.comment}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteComment(c)}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <FiTrash2 />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalDecisions;

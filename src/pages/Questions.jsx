import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { qaApi } from "../services/qa.api";

const displayName = (user) =>
  user?.fullName ||
  `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
  user?.name ||
  "Unknown";

function QuestionsPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const auth = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth") || "{}");
    } catch {
      return {};
    }
  })();

  const loadQuestions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await qaApi.getQuestions();
      setQuestions(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const submitQuestion = async (e) => {
    e.preventDefault();
    if (!auth?.token) {
      navigate("/login");
      return;
    }

    try {
      setPosting(true);
      setError("");
      await qaApi.createQuestion({ title, body });
      setTitle("");
      setBody("");
      await loadQuestions();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to post question");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold">Questions</h1>
          <span className="text-sm text-slate-500">{questions.length} total</span>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <Link
                key={q._id}
                to={`/questions/${q._id}`}
                className="block border rounded-lg p-3 hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">{q.title}</h2>
                  <span className="text-xs px-2 py-1 rounded bg-slate-100">{q.status}</span>
                </div>
                <p className="text-sm text-slate-700 mt-1 line-clamp-2">{q.body}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Asked by {displayName(q.authorId)}
                </p>
              </Link>
            ))}
            {!questions.length && <p className="text-slate-600">No questions yet.</p>}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-3">Ask a question</h2>
        <form onSubmit={submitQuestion} className="space-y-3">
          <input
            className="w-full border rounded-md px-3 py-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            className="w-full border rounded-md px-3 py-2 min-h-28"
            placeholder="Explain your question"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-header text-white disabled:opacity-60"
            disabled={posting}
          >
            {posting ? "Posting..." : "Post Question"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default QuestionsPage;

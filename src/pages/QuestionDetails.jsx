import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { qaApi } from "../services/qa.api";

const displayName = (user) =>
  user?.fullName ||
  `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
  user?.name ||
  "Unknown";

function QuestionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [postingAnswer, setPostingAnswer] = useState(false);
  const [commentDrafts, setCommentDrafts] = useState({});

  const auth = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth") || "{}");
    } catch {
      return {};
    }
  })();
  const currentUser = auth?.user || null;

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [q, a] = await Promise.all([
        qaApi.getQuestionById(id),
        qaApi.getAnswersByQuestion(id),
      ]);
      setQuestion(q);
      setAnswers(a);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!auth?.token) {
      navigate("/login");
      return;
    }
    if (!newAnswer.trim()) return;

    try {
      setPostingAnswer(true);
      await qaApi.postAnswer(id, { body: newAnswer });
      setNewAnswer("");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to post answer");
    } finally {
      setPostingAnswer(false);
    }
  };

  const canMarkBest = (answer) => {
    if (!currentUser || !question) return false;
    const isOwner = question.authorId?._id === currentUser.id;
    const isModerator = ["moderator", "admin"].includes(currentUser.role);
    return !answer.isBest && (isOwner || isModerator);
  };

  const canEdit = (answer) => currentUser && answer.authorId?._id === currentUser.id;

  const canDelete = (answer) =>
    currentUser &&
    (answer.authorId?._id === currentUser.id ||
      ["moderator", "admin"].includes(currentUser.role));

  const onDelete = async (answerId) => {
    try {
      await qaApi.deleteAnswer(answerId);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Delete failed");
    }
  };

  const onMarkBest = async (answerId) => {
    try {
      await qaApi.markBestAnswer(answerId);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Mark best failed");
    }
  };

  const onEdit = async (answer) => {
    const body = window.prompt("Edit your answer", answer.body);
    if (body === null) return;
    if (!body.trim()) return;

    try {
      await qaApi.editAnswer(answer._id, { body });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Edit failed");
    }
  };

  const addComment = async (answerId) => {
    const text = commentDrafts[answerId] || "";
    if (!text.trim()) return;
    try {
      await qaApi.addCommentToAnswer(answerId, { body: text });
      setCommentDrafts((prev) => ({ ...prev, [answerId]: "" }));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Comment failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!question) return <div className="p-6">Question not found</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Link to="/questions" className="text-sm text-blue-600 hover:underline">
        Back to questions
      </Link>

      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex justify-between items-start gap-3">
          <h1 className="text-2xl font-bold">{question.title}</h1>
          <span className="text-xs px-2 py-1 rounded bg-slate-100">{question.status}</span>
        </div>
        <p className="mt-2 text-slate-700">{question.body}</p>
        <p className="mt-3 text-xs text-slate-500">Asked by {displayName(question.authorId)}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-3">Your answer</h2>
        <form onSubmit={submitAnswer} className="space-y-3">
          <textarea
            className="w-full border rounded-md px-3 py-2 min-h-28"
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            placeholder="Write your answer"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-header text-white disabled:opacity-60"
            disabled={postingAnswer}
          >
            {postingAnswer ? "Submitting..." : "Submit Answer"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-3">Answers ({answers.length})</h2>
        <div className="space-y-3">
          {answers.map((answer) => (
            <div
              key={answer._id}
              className={`border rounded-lg p-3 ${answer.isBest ? "border-green-500 bg-green-50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{displayName(answer.authorId)}</p>
                {answer.isBest && <span className="text-xs text-green-700 font-semibold">Best</span>}
              </div>
              <p className="text-slate-700 mt-1">{answer.body}</p>

              <div className="flex gap-2 mt-3">
                {canMarkBest(answer) && (
                  <button
                    className="px-3 py-1 rounded border text-sm"
                    onClick={() => onMarkBest(answer._id)}
                  >
                    Mark best
                  </button>
                )}
                {canEdit(answer) && (
                  <button
                    className="px-3 py-1 rounded border text-sm"
                    onClick={() => onEdit(answer)}
                  >
                    Edit
                  </button>
                )}
                {canDelete(answer) && (
                  <button
                    className="px-3 py-1 rounded border border-red-300 text-red-600 text-sm"
                    onClick={() => onDelete(answer._id)}
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="flex gap-2 mt-3">
                <input
                  className="flex-1 border rounded-md px-3 py-2"
                  placeholder="Add comment"
                  value={commentDrafts[answer._id] || ""}
                  onChange={(e) =>
                    setCommentDrafts((prev) => ({ ...prev, [answer._id]: e.target.value }))
                  }
                />
                <button
                  className="px-3 py-2 rounded border text-sm"
                  onClick={() => addComment(answer._id)}
                >
                  Comment
                </button>
              </div>
            </div>
          ))}
          {!answers.length && <p className="text-slate-600">No answers yet.</p>}
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}

export default QuestionDetailsPage;

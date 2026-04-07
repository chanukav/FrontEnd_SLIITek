import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { qaApi } from "../services/qa.api";
import { API_ORIGIN } from "../lib/api";
import { ImageDropZone } from "../components/ImageDropZone";
import { FaRegThumbsDown, FaRegThumbsUp, FaThumbsDown, FaThumbsUp } from "react-icons/fa";

const displayName = (user) =>
  user?.fullName ||
  `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
  user?.name ||
  "Unknown";

/** @param {{ viewUrl?: string; url?: string } | string} imgOrUrl */
const questionImageSrc = (imgOrUrl) => {
  const raw =
    typeof imgOrUrl === "string"
      ? imgOrUrl.trim()
      : (imgOrUrl?.viewUrl || imgOrUrl?.url || "").trim();
  if (!raw) return "";
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return `${API_ORIGIN}${raw}`;
  return `${API_ORIGIN}/${raw}`;
};

const patchAnswerInTree = (items, answerId, patch) => {
  const idStr = String(answerId);
  return items.map((item) => {
    if (String(item._id) === idStr) {
      return { ...item, ...patch };
    }
    if (item.replies?.length) {
      return { ...item, replies: patchAnswerInTree(item.replies, answerId, patch) };
    }
    return item;
  });
};

function QuestionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [postingAnswer, setPostingAnswer] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState(null);
  // Store reply textarea values without state updates, to prevent "stuck typing".
  const replyTextareasRef = useRef({});

  const auth = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth") || "{}");
    } catch {
      return {};
    }
  })();
  const currentUser = auth?.user || null;

  const isQuestionOwner =
    !!currentUser && !!question && question.authorId?._id === currentUser.id;

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

  useEffect(() => {
    if (!imagePreviewSrc) return;
    const onKey = (e) => {
      if (e.key === "Escape") setImagePreviewSrc(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imagePreviewSrc]);

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!auth?.token) {
      navigate("/login");
      return;
    }

    const trimmed = newAnswer.trim();
    if (!trimmed) {
      setAnswerError("Please write an answer before submitting.");
      return;
    }

    try {
      setPostingAnswer(true);
      setAnswerError("");
      await qaApi.postAnswer(id, { body: trimmed });
      setNewAnswer("");
      await load();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        localStorage.removeItem("auth");
        navigate("/login");
        return;
      }
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

  const uploadQuestionImageFiles = async (fileBatch) => {
    const remaining = Math.max(0, 8 - (question?.images?.length ?? 0));
    const files = fileBatch.slice(0, remaining);
    if (!files.length || !auth?.token) return;
    try {
      setError("");
      setUploadingImages(true);
      const res = await qaApi.uploadQuestionImages(id, files);
      if (res?.question) setQuestion(res.question);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Upload failed");
    } finally {
      setUploadingImages(false);
    }
  };

  const onRemoveQuestionImage = async (url) => {
    if (!auth?.token) return;
    try {
      setError("");
      const res = await qaApi.removeQuestionImage(id, url);
      if (res?.question) setQuestion(res.question);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Remove failed");
    }
  };

  const onEditQuestion = async () => {
    if (!auth?.token) {
      navigate("/login");
      return;
    }
    if (!isQuestionOwner) return;

    const nextTitle = window.prompt("Edit question title", question.title);
    if (nextTitle === null) return;
    const nextBody = window.prompt("Edit question body", question.body);
    if (nextBody === null) return;

    const nextCategory = window.prompt(
      "Edit question category (Academic, Career & Internships, Campus Life, Technical / Programming Help, Study Resources, Clubs & Events, General / Other)",
      question.category || "General / Other"
    );
    if (nextCategory === null) return;

    if (!nextTitle.trim() || !nextBody.trim() || !nextCategory.trim()) {
      setError("Title, body, and category are required");
      return;
    }

    try {
      await qaApi.editQuestion(id, {
        title: nextTitle,
        body: nextBody,
        category: nextCategory,
      });
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Edit failed");
    }
  };

  const onDeleteQuestion = async () => {
    if (!auth?.token) {
      navigate("/login");
      return;
    }
    if (!isQuestionOwner) return;

    const ok = window.confirm("Delete this question? This cannot be undone.");
    if (!ok) return;

    try {
      await qaApi.deleteQuestion(id);
      navigate("/questions", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Delete failed");
    }
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

  const onVoteAnswer = async (answerId, type) => {
    if (!auth?.token) {
      navigate("/login");
      return;
    }
    try {
      setError("");
      const res = await qaApi.voteAnswer(answerId, { type });
      setAnswers((prev) =>
        patchAnswerInTree(prev, answerId, {
          voteScore: res.voteScore,
          dislikeCount: res.dislikeCount ?? 0,
          likedByMe: !!res.likedByMe,
          dislikedByMe: !!res.dislikedByMe,
          myVote: res.myVote ?? 0,
        })
      );
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Vote failed");
    }
  };

  const submitReply = async (parentAnswerId) => {
    if (!auth?.token) {
      navigate("/login");
      return;
    }

    const key = String(parentAnswerId);
    const el = replyTextareasRef.current?.[key];
    const text = el?.value || "";
    const trimmed = text.trim();
    if (!trimmed) return;

    try {
      await qaApi.postAnswer(id, { body: trimmed, parentAnswerId });
      if (el) el.value = "";
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Reply failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!question) return <div className="p-6">Question not found</div>;
  const bestAnswerId = answers?.[0]?._id;

  const AnswerCard = ({ answer, depth }) => {
    const isBest = bestAnswerId && answer._id === bestAnswerId;
    return (
      <div
        className={`border rounded-lg p-3 ${isBest ? "border-green-500 bg-green-50" : ""} ${
          depth > 0 ? "ml-4 border-l-2 border-slate-200 pl-4" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-medium">{displayName(answer.authorId)}</p>
          {isBest && <span className="text-xs text-green-700 font-semibold">Best</span>}
        </div>

        <p className="text-slate-700 mt-1">{answer.body}</p>

        <div className="flex flex-wrap gap-2 mt-3">
          {(() => {
            const liked = !!answer.likedByMe;
            const disliked = !!answer.dislikedByMe;
            const likeCount = answer.voteScore ?? 0;
            const unlikeCount = answer.dislikeCount ?? 0;
            return (
              <>
                <button
                  type="button"
                  className={`px-3 py-1 rounded border text-sm flex items-center gap-2 border-blue-400 bg-blue-50 ${
                    liked ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => onVoteAnswer(answer._id, "like")}
                >
                  {liked ? <FaThumbsUp size={16} /> : <FaRegThumbsUp size={16} />}
                  Like ({likeCount})
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded border text-sm flex items-center gap-2 border-blue-400 bg-blue-50 ${
                    disliked ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => onVoteAnswer(answer._id, "dislike")}
                >
                  {disliked ? <FaThumbsDown size={16} /> : <FaRegThumbsDown size={16} />}
                  Unlike ({unlikeCount})
                </button>
              </>
            );
          })()}

          {canMarkBest(answer) && (
            <button
              type="button"
              className="px-3 py-1 rounded border text-sm"
              onClick={() => onMarkBest(answer._id)}
            >
              Mark best
            </button>
          )}

          {canEdit(answer) && (
            <button
              type="button"
              className="px-3 py-1 rounded border text-sm"
              onClick={() => onEdit(answer)}
            >
              Edit
            </button>
          )}

          {canDelete(answer) && (
            <button
              type="button"
              className="px-3 py-1 rounded border border-red-300 text-red-600 text-sm"
              onClick={() => onDelete(answer._id)}
            >
              Delete
            </button>
          )}
        </div>

        {auth?.token ? (
          <div className="mt-3">
            <textarea
              className="w-full border rounded-md px-3 py-2 min-h-20"
              placeholder="Write a reply"
              ref={(el) => {
                if (!el) return;
                replyTextareasRef.current[String(answer._id)] = el;
              }}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                className="px-3 py-2 rounded-md bg-header text-white"
                onClick={() => submitReply(answer._id)}
              >
                Reply
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 mt-2">Login to reply</p>
        )}

        {answer.replies?.length ? (
          <div className="mt-3 space-y-3">
            {answer.replies.map((reply) => (
              <AnswerCard key={reply._id} answer={reply} depth={depth + 1} />
            ))}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Link to="/questions" className="text-sm text-blue-600 hover:underline">
        Back to questions
      </Link>

      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex justify-between items-start gap-3">
          <h1 className="text-2xl font-bold">{question.title}</h1>
          <div className="flex items-center gap-2">
            {isQuestionOwner && (
              <>
                <button
                  type="button"
                  className="px-3 py-1 rounded border text-sm"
                  onClick={onEditQuestion}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="px-3 py-1 rounded border border-red-300 text-red-600 text-sm"
                  onClick={onDeleteQuestion}
                >
                  Delete
                </button>
              </>
            )}
            {question.category && (
              <span className="text-xs px-2 py-1 rounded bg-slate-100">{question.category}</span>
            )}
            <span className="text-xs px-2 py-1 rounded bg-slate-100">{question.status}</span>
          </div>
        </div>
        <p className="mt-2 text-slate-700">{question.body}</p>

        {question.images?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {question.images.map((img) => (
              <div
                key={`${img.blobName || ""}-${img.url}`}
                className="relative inline-block rounded-lg border border-slate-200 bg-slate-50 overflow-hidden"
              >
                <button
                  type="button"
                  className="block p-0 border-0 bg-transparent cursor-pointer"
                  onClick={() => setImagePreviewSrc(questionImageSrc(img))}
                  title="Click to preview"
                >
                  <img
                    src={questionImageSrc(img)}
                    alt="Question attachment"
                    className="h-28 w-28 object-cover"
                  />
                </button>
                {isQuestionOwner && (
                  <button
                    type="button"
                    className="absolute top-1 right-1 rounded bg-red-600/90 px-2 py-0.5 text-xs text-white opacity-90 hover:opacity-100 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveQuestionImage(img.url);
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {isQuestionOwner && (
          <div className="mt-3 space-y-1">
            <ImageDropZone
              maxFiles={Math.max(0, 8 - (question.images?.length ?? 0))}
              disabled={uploadingImages || (question.images?.length ?? 0) >= 8}
              onFilesReady={(files) => void uploadQuestionImageFiles(files)}
              label="Add images (drag & drop or click)"
              hint={
                uploadingImages
                  ? "Uploading…"
                  : (question.images?.length ?? 0) >= 8
                    ? "Maximum 8 images on this question."
                    : "Drop files here or click to browse · JPEG, PNG, GIF, WebP"
              }
            />
            <p className="text-xs text-slate-500">
              {(question.images?.length ?? 0)}/8 images · max 5MB per file
            </p>
          </div>
        )}

        <p className="mt-3 text-xs text-slate-500">Asked by {displayName(question.authorId)}</p>
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-3">Your answer</h2>
        <form onSubmit={submitAnswer} className="space-y-3">
          <textarea
            className="w-full border rounded-md px-3 py-2 min-h-28"
            value={newAnswer}
            onChange={(e) => {
              setNewAnswer(e.target.value);
              if (answerError) setAnswerError("");
            }}
            placeholder="Write your answer"
          />
          {answerError && <p className="text-red-500 text-sm">{answerError}</p>}
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
            <AnswerCard key={answer._id} answer={answer} depth={0} />
          ))}
          {!answers.length && <p className="text-slate-600">No answers yet.</p>}
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {imagePreviewSrc ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setImagePreviewSrc(null)}
          role="presentation"
        >
          <button
            type="button"
            className="absolute top-4 right-4 rounded-md bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20"
            onClick={() => setImagePreviewSrc(null)}
          >
            Close
          </button>
          <img
            src={imagePreviewSrc}
            alt="Preview"
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}

export default QuestionDetailsPage;

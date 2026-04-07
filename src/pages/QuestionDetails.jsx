import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { qaApi } from "../services/qa.api";
import { API_ORIGIN } from "../lib/api";
import { ImageDropZone } from "../components/ImageDropZone";
import { QuestionImageGallery } from "../components/QuestionImageGallery";
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

const insertReplyInTree = (items, parentAnswerId, reply) => {
  const parentIdStr = String(parentAnswerId);
  return items.map((item) => {
    if (String(item._id) === parentIdStr) {
      return { ...item, replies: [...(item.replies || []), reply] };
    }
    if (item.replies?.length) {
      return { ...item, replies: insertReplyInTree(item.replies, parentAnswerId, reply) };
    }
    return item;
  });
};

const ANSWER_MIN_LENGTH = 1;
const ANSWER_MAX_LENGTH = 2000;

const getAnswerValidationError = (text) => {
  const trimmed = text.trim();
  if (!trimmed) return "Please write an answer before submitting.";
  if (trimmed.length < ANSWER_MIN_LENGTH) {
    return `Answer must be at least ${ANSWER_MIN_LENGTH} characters.`;
  }
  if (trimmed.length > ANSWER_MAX_LENGTH) {
    return `Answer must be less than ${ANSWER_MAX_LENGTH + 1} characters.`;
  }
  return "";
};

function QuestionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [answerError, setAnswerError] = useState("");
  const [replyErrors, setReplyErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [postingAnswer, setPostingAnswer] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [questionMenuOpen, setQuestionMenuOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  // Store reply textarea values without state updates, to prevent "stuck typing".
  const replyTextareasRef = useRef({});
  const questionMenuRef = useRef(null);

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
    if (loading || !answers.length) return;
    const hash = (location.hash || "").trim();
    const m = /^#answer-(.+)$/.exec(hash);
    if (!m) return;

    const answerAnchor = `answer-${decodeURIComponent(m[1])}`;
    let cancelled = false;
    let highlightTimer;

    const scrollTimer = window.setTimeout(() => {
      if (cancelled) return;
      const el = document.getElementById(answerAnchor);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-amber-400", "ring-offset-2", "rounded-lg");
      highlightTimer = window.setTimeout(() => {
        if (!cancelled) {
          el.classList.remove("ring-2", "ring-amber-400", "ring-offset-2", "rounded-lg");
        }
      }, 2600);
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(scrollTimer);
      window.clearTimeout(highlightTimer);
    };
  }, [loading, answers, location.hash]);

  useEffect(() => {
    if (!questionMenuOpen) return;
    const onDown = (e) => {
      if (e.key === "Escape") setQuestionMenuOpen(false);
    };
    const onClick = (e) => {
      const el = questionMenuRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setQuestionMenuOpen(false);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("mousedown", onClick);
    };
  }, [questionMenuOpen]);

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!auth?.token) {
      navigate("/login");
      return;
    }

    const trimmed = newAnswer.trim();
    const validationError = getAnswerValidationError(trimmed);
    if (validationError) {
      setAnswerError(validationError);
      return;
    }

    try {
      setPostingAnswer(true);
      setAnswerError("");
      const res = await qaApi.postAnswer(id, { body: trimmed });
      const created = res?.answer;
      if (created?._id) {
        const createdAnswer = {
          ...created,
          authorId: currentUser
            ? {
                _id: currentUser.id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                fullName: currentUser.fullName,
                name: currentUser.name,
              }
            : created.authorId,
          replies: [],
          likedByMe: false,
          dislikedByMe: false,
          myVote: 0,
          voteScore: created.voteScore ?? 0,
          dislikeCount: created.dislikeCount ?? 0,
        };
        setAnswers((prev) => [createdAnswer, ...prev]);
      }
      setNewAnswer("");
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

  const onEditQuestion = () => {
    if (!isQuestionOwner) return;
    navigate(`/questions/${id}/edit`);
  };

  const onDeleteQuestion = async () => {
    if (!auth?.token) {
      navigate("/login");
      return;
    }
    if (!isQuestionOwner) return;

    try {
      await qaApi.deleteQuestion(id);
      navigate("/questions", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Delete failed");
    }
  };

  const onToggleQuestionVote = async () => {
    if (!auth?.token) {
      navigate("/login");
      return;
    }
    try {
      setError("");
      const liked = !!question?.likedByMe;
      const res = liked ? await qaApi.unvoteQuestion(id) : await qaApi.voteQuestion(id);
      setQuestion((prev) =>
        prev
          ? {
              ...prev,
              voteScore: res.voteScore,
              likedByMe: !!res.likedByMe,
            }
          : prev
      );
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Vote failed");
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
    const validationError = getAnswerValidationError(trimmed);
    if (validationError) {
      setReplyErrors((prev) => ({ ...prev, [key]: validationError }));
      return;
    }

    try {
      setReplyErrors((prev) => ({ ...prev, [key]: "" }));
      setError("");
      const res = await qaApi.postAnswer(id, { body: trimmed, parentAnswerId });
      const created = res?.answer;
      if (created?._id) {
        const createdReply = {
          ...created,
          authorId: currentUser
            ? {
                _id: currentUser.id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName,
                fullName: currentUser.fullName,
                name: currentUser.name,
              }
            : created.authorId,
          replies: [],
          likedByMe: false,
          dislikedByMe: false,
          myVote: 0,
          voteScore: created.voteScore ?? 0,
          dislikeCount: created.dislikeCount ?? 0,
        };
        setAnswers((prev) => insertReplyInTree(prev, parentAnswerId, createdReply));
      }
      if (el) el.value = "";
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Reply failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!question) return <div className="p-6">Question not found</div>;
  const bestAnswerId = answers?.[0]?._id;

  const AnswerCard = ({ answer, depth }) => {
    const isBest = bestAnswerId && answer._id === bestAnswerId;
    const domId =
      answer?._id != null ? `answer-${String(answer._id)}` : undefined;
    return (
      <div
        id={domId}
        className={`border rounded-lg p-3 scroll-mt-24 ${isBest ? "border-green-500 bg-green-50" : ""} ${
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
              maxLength={ANSWER_MAX_LENGTH}
              onChange={() => {
                const replyKey = String(answer._id);
                if (replyErrors[replyKey]) {
                  setReplyErrors((prev) => ({ ...prev, [replyKey]: "" }));
                }
              }}
              ref={(el) => {
                if (!el) return;
                replyTextareasRef.current[String(answer._id)] = el;
              }}
            />
            <p className="text-xs text-slate-500 mt-1">
              Minimum {ANSWER_MIN_LENGTH} character{ANSWER_MIN_LENGTH > 1 ? "s" : ""} ·
              {" "}Maximum {ANSWER_MAX_LENGTH} characters
            </p>
            {replyErrors[String(answer._id)] && (
              <p className="text-red-500 text-sm mt-1">{replyErrors[String(answer._id)]}</p>
            )}
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
            <button
              type="button"
              className={`px-3 py-1 rounded border text-sm ${
                question.likedByMe ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:bg-slate-50"
              }`}
              onClick={onToggleQuestionVote}
            >
              Vote ({question.voteScore ?? 0})
            </button>
            {question.category && (
              <span className="text-xs px-2 py-1 rounded bg-slate-100">{question.category}</span>
            )}
            <span className="text-xs px-2 py-1 rounded bg-slate-100">{question.status}</span>
            {isQuestionOwner && (
              <div className="relative ml-2" ref={questionMenuRef}>
                <button
                  type="button"
                  className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                  onClick={() => setQuestionMenuOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={questionMenuOpen}
                  title="More"
                >
                  <span className="text-xl leading-none">⋯</span>
                </button>
                {questionMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-40 rounded-md border border-slate-200 bg-white shadow-lg overflow-hidden z-20"
                    role="menu"
                  >
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                      role="menuitem"
                      onClick={() => {
                        setQuestionMenuOpen(false);
                        onEditQuestion();
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      role="menuitem"
                      onClick={() => {
                        setQuestionMenuOpen(false);
                        setConfirmDeleteOpen(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="mt-2 text-slate-700">{question.body}</p>

        <QuestionImageGallery
          images={question.images || []}
          origin={API_ORIGIN}
          maxPreview={4}
          canRemove={isQuestionOwner}
          onRemoveUrl={(url) => onRemoveQuestionImage(url)}
        />

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
            maxLength={ANSWER_MAX_LENGTH}
            onChange={(e) => {
              setNewAnswer(e.target.value);
              if (answerError) setAnswerError("");
            }}
            placeholder="Write your answer"
          />
          <p className="text-xs text-slate-500">
            Minimum {ANSWER_MIN_LENGTH} characters · {newAnswer.trim().length}/{ANSWER_MAX_LENGTH}
          </p>
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

      {confirmDeleteOpen ? (
        <div
          className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center p-4"
          role="presentation"
          onClick={() => setConfirmDeleteOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Delete question?</h3>
            <p className="text-sm text-slate-600 mt-1">
              This cannot be undone. Your question and screenshots will be removed.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md border"
                onClick={() => setConfirmDeleteOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                onClick={async () => {
                  setConfirmDeleteOpen(false);
                  await onDeleteQuestion();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}

export default QuestionDetailsPage;

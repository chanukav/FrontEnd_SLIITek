import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { qaApi } from "../services/qa.api";
import { API_ORIGIN } from "../lib/api";
import { ImageDropZone } from "../components/ImageDropZone";
import { QuestionImageGallery } from "../components/QuestionImageGallery";
import { FaRegThumbsDown, FaRegThumbsUp, FaThumbsDown, FaThumbsUp } from "react-icons/fa";
import { ShieldAlert } from "lucide-react";

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

const removeAnswerFromTree = (items, answerId) => {
  const idStr = String(answerId);
  return items
    .filter((item) => String(item._id) !== idStr)
    .map((item) => ({
      ...item,
      replies: item.replies?.length ? removeAnswerFromTree(item.replies, answerId) : [],
    }));
};

const ANSWER_MIN_LENGTH = 1;
const ANSWER_MAX_LENGTH = 2000;
const ANSWER_BLOCKED_WORDS = /\b(fuck|fucking|fucker|shit|bitch|bastard|asshole)\b/i;

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

const MAX_ANSWER_IMAGES = 4;
/** One photo per answer/reply from the + control (matches UX: text + one photo). */
const INLINE_ANSWER_IMAGE_MAX = 1;

const normalizeImageList = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
};

const findAnswerInTree = (items, answerId) => {
  const idStr = String(answerId);
  for (const item of items) {
    if (String(item._id) === idStr) return item;
    if (item.replies?.length) {
      const found = findAnswerInTree(item.replies, answerId);
      if (found) return found;
    }
  }
  return null;
};

const initialsFromDisplayName = (displayName) => {
  if (!displayName) return "?";
  return displayName
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const shortAnswerTime = (createdAt) => {
  if (!createdAt) return "now";
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSecs < 60) return "now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;

  return date.toLocaleDateString();
};

function QuestionDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [newAnswerFiles, setNewAnswerFiles] = useState([]);
  const [answerError, setAnswerError] = useState("");
  const [replyErrors, setReplyErrors] = useState({});
  const [replyImageFiles, setReplyImageFiles] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [postingAnswer, setPostingAnswer] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [questionMenuOpen, setQuestionMenuOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  
  // Report states
  const [reportingTarget, setReportingTarget] = useState(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [reportError, setReportError] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);

  const [editAnswerId, setEditAnswerId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingAnswerImages, setUploadingAnswerImages] = useState(false);
  // Store reply textarea values without state updates, to prevent "stuck typing".
  const replyTextareasRef = useRef({});
  const newAnswerImageInputRef = useRef(null);
  const replyImageInputRefs = useRef({});
  const questionMenuRef = useRef(null);
  const [newAnswerImagePreviewUrl, setNewAnswerImagePreviewUrl] = useState("");

  useEffect(() => {
    const file = newAnswerFiles[0];
    if (!file) {
      setNewAnswerImagePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
      return undefined;
    }
    const u = URL.createObjectURL(file);
    setNewAnswerImagePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return u;
    });
  }, [newAnswerFiles]);

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

  const onNewAnswerImageInputChange = (e) => {
    const picked = Array.from(e.target.files || [])[0];
    e.target.value = "";
    if (!picked) return;
    const t = (picked.type || "").toLowerCase();
    const ok =
      t === "image/jpeg" ||
      t === "image/png" ||
      t === "image/gif" ||
      t === "image/webp" ||
      /\.(jpe?g|png|gif|webp)$/i.test(picked.name);
    if (!ok) {
      setAnswerError("Please choose a JPEG, PNG, GIF, or WebP image.");
      return;
    }
    setAnswerError("");
    setNewAnswerFiles([picked]);
  };

  const onReplyImageInputChange = (answerId, e) => {
    const picked = Array.from(e.target.files || [])[0];
    e.target.value = "";
    const key = String(answerId);
    if (!picked) return;
    const t = (picked.type || "").toLowerCase();
    const ok =
      t === "image/jpeg" ||
      t === "image/png" ||
      t === "image/gif" ||
      t === "image/webp" ||
      /\.(jpe?g|png|gif|webp)$/i.test(picked.name);
    if (!ok) {
      setReplyErrors((prev) => ({
        ...prev,
        [key]: "Please choose a JPEG, PNG, GIF, or WebP image.",
      }));
      return;
    }
    setReplyErrors((prev) => ({ ...prev, [key]: "" }));
    setReplyImageFiles((prev) => ({ ...prev, [key]: [picked] }));
  };

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!auth?.token) {
      navigate("/login");
      return;
    }

    const trimmed = newAnswer.trim();
    const hasFiles = newAnswerFiles.length > 0;
    if (!trimmed && !hasFiles) {
      setAnswerError("Please write an answer or attach an image.");
      return;
    }
    if (trimmed) {
      const validationError = getAnswerValidationError(trimmed);
      if (validationError) {
        setAnswerError(validationError);
        return;
      }
    }
    if (trimmed && ANSWER_BLOCKED_WORDS.test(trimmed)) {
      setAnswerError("Please remove offensive words from your answer.");
      return;
    }

    try {
      setPostingAnswer(true);
      setAnswerError("");
      const res = await qaApi.postAnswer(id, {
        body: trimmed,
        ...(hasFiles ? { files: newAnswerFiles.slice(0, INLINE_ANSWER_IMAGE_MAX) } : {}),
      });
      const created = res?.answer;
      let images = normalizeImageList(created?.images);
      if (created?._id && hasFiles && !images.length) {
        const up = await qaApi.uploadAnswerImages(
          created._id,
          newAnswerFiles.slice(0, INLINE_ANSWER_IMAGE_MAX)
        );
        images = normalizeImageList(up?.answer?.images);
      }
      if (created?._id) {
        const createdAnswer = {
          ...created,
          images,
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
      setNewAnswerFiles([]);
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
      navigate("/home", { replace: true });
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
      setAnswers((prev) => removeAnswerFromTree(prev, answerId));
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

  const onEdit = (answer) => {
    setEditAnswerId(answer._id);
    setEditDraft(answer.body || "");
    setEditError("");
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
    const files = replyImageFiles[key] || [];
    const hasFiles = files.length > 0;
    if (!trimmed && !hasFiles) {
      setReplyErrors((prev) => ({
        ...prev,
        [key]: "Please write a reply or attach an image.",
      }));
      return;
    }
    if (trimmed) {
      const validationError = getAnswerValidationError(trimmed);
      if (validationError) {
        setReplyErrors((prev) => ({ ...prev, [key]: validationError }));
        return;
      }
    }

    try {
      setReplyErrors((prev) => ({ ...prev, [key]: "" }));
      setError("");
      const res = await qaApi.postAnswer(id, {
        body: trimmed,
        parentAnswerId,
        ...(hasFiles ? { files: files.slice(0, INLINE_ANSWER_IMAGE_MAX) } : {}),
      });
      const created = res?.answer;
      let images = normalizeImageList(created?.images);
      if (created?._id && hasFiles && !images.length) {
        const up = await qaApi.uploadAnswerImages(
          created._id,
          files.slice(0, INLINE_ANSWER_IMAGE_MAX)
        );
        images = normalizeImageList(up?.answer?.images);
      }
      if (created?._id) {
        const createdReply = {
          ...created,
          images,
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
      setReplyImageFiles((prev) => ({ ...prev, [key]: [] }));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Reply failed");
    }
  };

  const closeEditAnswer = () => {
    setEditAnswerId(null);
    setEditDraft("");
    setEditError("");
  };

  const saveEditAnswer = async () => {
    if (!editAnswerId) return;
    const trimmed = editDraft.trim();
    const editTarget = findAnswerInTree(answers, editAnswerId);
    if (!editTarget) return;

    const editImages = normalizeImageList(editTarget.images);
    if (!trimmed && !editImages.length) {
      setEditError("Text or images required");
      return;
    }

    try {
      setSavingEdit(true);
      setEditError("");
      await qaApi.editAnswer(editAnswerId, { body: trimmed });
      setAnswers((prev) =>
        patchAnswerInTree(prev, editAnswerId, { body: trimmed })
      );
      closeEditAnswer();
    } catch (err) {
      setEditError(err?.response?.data?.message || err.message || "Edit failed");
    } finally {
      setSavingEdit(false);
    }
  };

  const uploadEditAnswerImageFiles = async (fileBatch) => {
    if (!editAnswerId || !auth?.token) return;
    try {
      setEditError("");
      setUploadingAnswerImages(true);
      const res = await qaApi.uploadAnswerImages(editAnswerId, fileBatch);
      if (res?.answer) {
        setAnswers((prev) =>
          patchAnswerInTree(prev, editAnswerId, { images: res.answer.images })
        );
      }
    } catch (err) {
      setEditError(err?.response?.data?.message || err.message || "Upload failed");
    } finally {
      setUploadingAnswerImages(false);
    }
  };

  const onRemoveEditAnswerImage = async (url) => {
    if (!editAnswerId || !auth?.token) return;
    try {
      setEditError("");
      const res = await qaApi.removeAnswerImage(editAnswerId, url);
      if (res?.answer) {
        setAnswers((prev) =>
          patchAnswerInTree(prev, editAnswerId, { images: res.answer.images })
        );
      }
    } catch (err) {
      setEditError(err?.response?.data?.message || err.message || "Remove failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!question) return <div className="p-6">Question not found</div>;
  const bestAnswerId = answers?.[0]?._id;

  const AnswerCard = ({ answer, depth }) => {
    const isBest = bestAnswerId && answer._id === bestAnswerId;
    const authorLabel = displayName(answer.authorId);
    const initials = initialsFromDisplayName(authorLabel);
    const when = shortAnswerTime(answer.createdAt);
    const editedWhen = shortAnswerTime(answer.updatedAt);
    const isEdited =
      !!answer.updatedAt &&
      !!answer.createdAt &&
      new Date(answer.updatedAt).getTime() - new Date(answer.createdAt).getTime() > 1500;
    const answerImages = normalizeImageList(answer.images);
    const hasImages = answerImages.length > 0;
    const hasText = !!answer.body?.trim();
    const hasBubble = hasText || hasImages;
    const domId = `answer-${answer._id}`;

    return (
      <div
        id={domId}
        className={`border rounded-lg p-3 scroll-mt-24 ${isBest ? "border-green-500 bg-green-50" : ""} ${
          depth > 0 ? "ml-4 border-l-2 border-slate-200 pl-4" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-medium">{displayName(answer.authorId)}</p>
            <p className="text-xs text-slate-500">
              {when}
              {isEdited ? ` · edited ${editedWhen}` : ""}
            </p>
          </div>
          {isBest && <span className="text-xs text-green-700 font-semibold">Best</span>}
        </div>

            {hasBubble ? (
              <div
                className={`mt-1.5 rounded-2xl px-3.5 py-2.5 ${
                  isBest
                    ? "bg-emerald-50/95 ring-1 ring-emerald-200/90"
                    : "bg-slate-100 ring-1 ring-black/6"
                }`}
              >
                {hasText ? (
                  <p className="text-[15px] leading-snug text-slate-900 whitespace-pre-wrap">
                    {answer.body}
                  </p>
                ) : null}
                <QuestionImageGallery
                  variant="bubble"
                  className={hasText ? "mt-2" : ""}
                  images={answerImages}
                  origin={API_ORIGIN}
                  maxPreview={4}
                  canRemove={false}
                />
              </div>
            ) : null}

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
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onVoteAnswer(answer._id, "like");
                  }}
                >
                  {liked ? <FaThumbsUp size={16} /> : <FaRegThumbsUp size={16} />}
                  Like ({likeCount})
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded border text-sm flex items-center gap-2 border-blue-400 bg-blue-50 ${
                    disliked ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onVoteAnswer(answer._id, "dislike");
                  }}
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

          {currentUser && answer.authorId?._id !== currentUser.id && (
            <button
              type="button"
              className="px-3 py-1 rounded border text-sm text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 flex items-center gap-1 transition-colors"
              onClick={() => {
                setReportingTarget({ type: answer.parentAnswerId ? "comment" : "answer", id: answer._id });
                setReportReason("spam");
                setReportDetails("");
                setReportSuccess(false);
                setReportError("");
              }}
            >
              Report
            </button>
          )}

        </div>

        {auth?.token ? (
          <div className="mt-3">
            <div className="relative">
              <button
                type="button"
                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-lg leading-none text-slate-700 hover:bg-slate-50"
                onClick={() => replyImageInputRefs.current[String(answer._id)]?.click()}
                title="Add one photo"
                aria-label="Add one photo"
              >
                +
              </button>
              <textarea
                className="w-full border rounded-md px-3 py-2 pr-12 min-h-20"
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
              <input
                ref={(el) => {
                  if (!el) return;
                  replyImageInputRefs.current[String(answer._id)] = el;
                }}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="sr-only"
                onChange={(e) => onReplyImageInputChange(answer._id, e)}
              />
            </div>
            {(replyImageFiles[String(answer._id)] || [])[0] ? (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span>1 photo selected</span>
                <span className="truncate max-w-[200px]">
                  {(replyImageFiles[String(answer._id)][0] || {}).name}
                </span>
                <button
                  type="button"
                  className="text-red-600 underline"
                  onClick={() =>
                    setReplyImageFiles((prev) => ({
                      ...prev,
                      [String(answer._id)]: [],
                    }))
                  }
                >
                  Remove
                </button>
              </div>
            ) : null}
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
            {(isQuestionOwner || auth?.token) && (
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
                    {isQuestionOwner && (
                      <>
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
                      </>
                    )}
                    {!isQuestionOwner && auth?.token && (
                      <button
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex flex-row items-center gap-2"
                        role="menuitem"
                        onClick={() => {
                          setQuestionMenuOpen(false);
                          setReportingTarget({ type: "question", id: question._id });
                          setReportReason("spam");
                          setReportDetails("");
                          setReportSuccess(false);
                          setReportError("");
                        }}
                      >
                        Report
                      </button>
                    )}
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
          <div className="relative">
            <button
              type="button"
              className={`absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-md border text-xl leading-none transition ${
                postingAnswer
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
              onClick={() => newAnswerImageInputRef.current?.click()}
              disabled={postingAnswer}
              title="Add one photo"
              aria-label="Add one photo"
            >
              +
            </button>
            <textarea
              className="w-full border rounded-md px-3 py-2 pr-12 min-h-28"
              value={newAnswer}
              maxLength={ANSWER_MAX_LENGTH}
              onChange={(e) => {
                setNewAnswer(e.target.value);
                if (answerError) setAnswerError("");
              }}
              placeholder="Write your answer"
            />
            <input
              ref={newAnswerImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="sr-only"
              onChange={onNewAnswerImageInputChange}
            />
          </div>
          {newAnswerFiles[0] ? (
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              {newAnswerImagePreviewUrl ? (
                <img
                  src={newAnswerImagePreviewUrl}
                  alt=""
                  className="h-16 w-16 rounded-md border border-slate-200 object-cover"
                />
              ) : null}
              <div className="flex flex-col gap-0.5">
                <span>1 photo selected</span>
                <span className="text-xs text-slate-500 truncate max-w-xs">{newAnswerFiles[0].name}</span>
              </div>
              <button
                type="button"
                className="text-sm text-red-600 underline"
                onClick={() => setNewAnswerFiles([])}
              >
                Remove
              </button>
            </div>
          ) : null}
          <p className="text-xs text-slate-500">
            Minimum {ANSWER_MIN_LENGTH} characters (if you use text) · {newAnswer.trim().length}/
            {ANSWER_MAX_LENGTH}
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

      <Dialog
        open={editAnswerId !== null}
        onOpenChange={(open) => {
          if (!open) closeEditAnswer();
        }}
      >
        <DialogContent className="max-w-2xl gap-0 overflow-hidden border-slate-200 p-0 shadow-2xl sm:max-w-2xl">
          <div className="border-b border-slate-100 bg-linear-to-br from-slate-50 via-white to-slate-50/80 px-6 py-5">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
                Edit answer
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Update your answer text.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="space-y-3 px-6 py-5">
            <textarea
              className="w-full min-h-40 resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] leading-relaxed text-slate-800 shadow-inner shadow-slate-100/50 ring-offset-background transition placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azureBlue focus-visible:ring-offset-2"
              value={editDraft}
              maxLength={ANSWER_MAX_LENGTH}
              onChange={(e) => {
                setEditDraft(e.target.value);
                if (editError) setEditError("");
              }}
              placeholder="Write your answer…"
              aria-invalid={!!editError}
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                {editDraft.trim().length}/{ANSWER_MAX_LENGTH} characters
              </span>
            </div>
            {editError && (
              <p className="text-sm font-medium text-red-600" role="alert">
                {editError}
              </p>
            )}
          </div>
          <DialogFooter className="flex-row justify-end gap-2 border-t border-slate-100 bg-slate-50/90 px-6 py-4 sm:justify-end">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              onClick={closeEditAnswer}
              disabled={savingEdit}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-header px-5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 disabled:opacity-50"
              onClick={() => void saveEditAnswer()}
              disabled={savingEdit}
            >
              {savingEdit ? "Saving…" : "Save changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {confirmDeleteOpen ? (
        <div
          className="fixed inset-0 z-120 bg-black/50 flex items-center justify-center p-4"
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

      {/* Report Modal */}
      {reportingTarget ? (
        <div
          className="fixed inset-0 z-[130] bg-black/50 flex items-center justify-center p-4"
          role="presentation"
          onClick={() => setReportingTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white shadow-xl p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold border-b pb-2 mb-3 text-red-600 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" /> Report Content
            </h3>
            
            <p className="text-sm text-slate-600 mb-3">
              Why are you reporting this {reportingTarget.type}?
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <select
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                >
                  <option value="spam">Spam</option>
                  <option value="misinformation">Misinformation</option>
                  <option value="abuse">Abuse / Harassment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Details (Optional)</label>
                <textarea
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500 min-h-20"
                  placeholder="Provide additional details to help moderators..."
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  maxLength={1000}
                />
              </div>
            </div>

            {reportError && <p className="text-red-500 text-sm mt-3">{reportError}</p>}
            {reportSuccess && <p className="text-green-600 text-sm mt-3 font-medium">Report submitted. Thank you.</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded-md border text-sm hover:bg-slate-50"
                onClick={() => setReportingTarget(null)}
                disabled={submittingReport}
              >
                Close
              </button>
              {!reportSuccess && (
                <button
                  type="button"
                  className="px-4 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  onClick={async () => {
                    const { createReport } = await import("../services/reportService");
                    setSubmittingReport(true);
                    setReportError("");
                    try {
                      await createReport({
                        targetType: reportingTarget.type,
                        targetId: reportingTarget.id,
                        reason: reportReason,
                        details: reportDetails
                      });
                      setReportSuccess(true);
                      setTimeout(() => setReportingTarget(null), 2000);
                    } catch (err) {
                      setReportError(err.message || "Failed to submit report");
                    } finally {
                      setSubmittingReport(false);
                    }
                  }}
                  disabled={submittingReport}
                >
                  {submittingReport ? "Submitting..." : "Submit Report"}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}

export default QuestionDetailsPage;
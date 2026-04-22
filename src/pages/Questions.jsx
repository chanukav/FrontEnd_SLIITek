import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";
import { qaApi } from "../services/qa.api";
import { API_ORIGIN } from "../lib/api";
import { ImageDropZone } from "../components/ImageDropZone";

const displayName = (user) =>
  user?.fullName ||
  `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
  user?.name ||
  "Unknown";

const questionThumbSrc = (img) => {
  const u = (img?.viewUrl || img?.url || "").trim();
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return `${API_ORIGIN}${u}`;
  return `${API_ORIGIN}/${u}`;
};

const authorIdString = (author) => {
  if (author == null) return "";
  const id = typeof author === "object" ? author._id : author;
  return id != null ? String(id) : "";
};

const TAGS_BY_CATEGORY = {
  Academic: [
    "itpm",
    "oop",
    "dbms",
    "ds",
    "se",
    "os",
    "cn",
    "maths",
    "statistics",
    "assignment",
    "exam",
    "past-papers",
    "presentation",
    "group-project",
    "final-year-project",
  ],
  "Technical / Programming Help": [
    "java",
    "python",
    "javascript",
    "c",
    "c++",
    "react",
    "nodejs",
    "express",
    "mongodb",
    "mysql",
    "html",
    "css",
    "api",
    "git",
    "github",
    "debugging",
    "error",
  ],
  "Campus Life": [
    "timetable",
    "lecture",
    "lab",
    "hostel",
    "accommodation",
    "canteen",
    "transport",
    "bus",
    "parking",
    "wifi",
    "library",
    "medical",
  ],
  "Career & Internships": [
    "internship",
    "cv",
    "resume",
    "interview",
    "job",
    "linkedin",
    "portfolio",
    "career-advice",
    "software-engineer",
    "training",
  ],
  "Study Resources": [
    "notes",
    "tutorial",
    "ebook",
    "slides",
    "recordings",
    "youtube",
    "materials",
    "download",
  ],
  "Clubs & Events": [
    "event",
    "workshop",
    "hackathon",
    "seminar",
    "competition",
    "club",
    "volunteer",
    "meetup",
  ],
  "General / Other": ["help", "question", "advice", "discussion", "other"],
};

const getTagListFromInput = (rawInput) =>
  rawInput
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

function QuestionsPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("General / Other");
  const [tagsInput, setTagsInput] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [posting, setPosting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [myQuestions, setMyQuestions] = useState([]);
  const [myAnswers, setMyAnswers] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const categories = [
    "Academic",
    "Career & Internships",
    "Campus Life",
    "Technical / Programming Help",
    "Study Resources",
    "Clubs & Events",
    "General / Other",
  ];

  const auth = (() => {
    try {
      return JSON.parse(localStorage.getItem("auth") || "{}");
    } catch {
      return {};
    }
  })();
  const viewerId = auth?.user?.id ?? auth?.user?._id;
  const selectedTags = getTagListFromInput(tagsInput);
  const categoryTags = TAGS_BY_CATEGORY[category] || [];
  const activeTagTerm = (() => {
    const parts = tagsInput.split(",");
    return (parts[parts.length - 1] || "").trim().toLowerCase();
  })();
  const suggestedTags = categoryTags
    .filter((tag) => tag.includes(activeTagTerm) && !selectedTags.includes(tag))
    .slice(0, 8);

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

  const loadMyHistory = async () => {
    if (!auth?.token) return;
    setHistoryLoading(true);
    try {
      const [mq, ma] = await Promise.all([
        qaApi.getMyQuestions(),
        qaApi.getMyAnswers(),
      ]);
      setMyQuestions(Array.isArray(mq) ? mq : []);
      setMyAnswers(Array.isArray(ma) ? ma : []);
    } catch {
      setMyQuestions([]);
      setMyAnswers([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    if (!historyOpen || !auth?.token) return;
    loadMyHistory();
  }, [historyOpen]);

  const submitSearch = async (e) => {
    e.preventDefault();
    const q = searchQuery.trim();

    if (!q) {
      await loadQuestions();
      return;
    }

    try {
      setSearching(true);
      setError("");
      const data = await qaApi.searchQuestions(q);
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to search questions");
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const q = title.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }

    const handle = setTimeout(async () => {
      try {
        setSuggestionsLoading(true);
        const data = await qaApi.getQuestionSuggestions(q);
        setSuggestions(Array.isArray(data) ? data : []);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 350);

    return () => clearTimeout(handle);
  }, [title]);

  const submitQuestion = async (e) => {
    e.preventDefault();
    if (!auth?.token) {
      navigate("/login");
      return;
    }

    try {
      setPosting(true);
      setError("");
      const tags = getTagListFromInput(tagsInput);
      const data = await qaApi.createQuestion({ title, body, category, tags });
      const qId = data?.question?._id;
      if (imageFiles.length && qId) {
        await qaApi.uploadQuestionImages(qId, imageFiles);
      }
      setTitle("");
      setBody("");
      setCategory("General / Other");
      setTagsInput("");
      setImageFiles([]);
      await loadQuestions();
      await loadMyHistory();
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        localStorage.removeItem("auth");
        navigate("/login");
        return;
      }
      setError(err?.response?.data?.message || err.message || "Failed to post question");
    } finally {
      setPosting(false);
    }
  };

  const replaceActiveTagWith = (nextTag) => {
    const parts = tagsInput.split(",");
    parts[parts.length - 1] = ` ${nextTag}`;
    const normalized = parts
      .map((part, index) => (index === 0 ? part.trim() : ` ${part.trim()}`))
      .join(",");
    setTagsInput(`${normalized}, `);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-3">Ask a Question</h2>

        {auth?.token && (
          <div className="mb-5 max-w-3xl rounded-lg border border-slate-200 bg-slate-50/80 overflow-hidden">
            <button
              type="button"
              onClick={() => setHistoryOpen((o) => !o)}
              aria-expanded={historyOpen}
              aria-controls="questions-page-qa-history-panel"
              id="questions-page-qa-history-toggle"
              className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-800 bg-transparent border-none cursor-pointer font-[inherit] hover:bg-slate-100/80 transition-colors"
            >
              <span>Q&amp;A history</span>
              <span className="text-slate-500 flex-shrink-0" aria-hidden>
                {historyOpen ? <FiChevronDown size={20} /> : <FiChevronRight size={20} />}
              </span>
            </button>
            {historyOpen && (
              <div
                id="questions-page-qa-history-panel"
                role="region"
                aria-labelledby="questions-page-qa-history-toggle"
                className="px-4 pb-4 border-t border-slate-200"
              >
                {historyLoading ? (
                  <p className="text-sm text-slate-500 pt-3">Loading your history…</p>
                ) : !myQuestions.length && !myAnswers.length ? (
                  <p className="text-sm text-slate-600 pt-3">
                    You have not posted any questions or answers yet. They will appear here.
                  </p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 pt-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                        Your questions
                      </p>
                      <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {myQuestions.length === 0 ? (
                          <li className="text-sm text-slate-500">None yet.</li>
                        ) : (
                          myQuestions.map((q) => (
                            <li key={q._id}>
                              <Link
                                to={`/questions/${q._id}`}
                                className="text-sm font-medium text-blue-700 hover:underline line-clamp-2"
                              >
                                {q.title}
                              </Link>
                              <div className="flex flex-wrap gap-2 mt-0.5 text-xs text-slate-500">
                                <span>{q.answerCount ?? 0} answers</span>
                                {q.status && <span className="capitalize">{q.status}</span>}
                              </div>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                        Your answers
                      </p>
                      <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {myAnswers.length === 0 ? (
                          <li className="text-sm text-slate-500">None yet.</li>
                        ) : (
                          myAnswers.map((a) => {
                            const qRef = a.questionId;
                            const qid =
                              qRef && typeof qRef === "object" ? qRef._id : qRef;
                            const qTitle =
                              qRef && typeof qRef === "object" ? qRef.title : "Question";
                            if (!qid) return null;
                            const preview =
                              (a.body || "").length > 140
                                ? `${(a.body || "").slice(0, 140)}…`
                                : a.body || "";
                            return (
                              <li key={a._id}>
                                <Link
                                  to={`/questions/${qid}`}
                                  className="text-sm text-blue-700 hover:underline line-clamp-1"
                                >
                                  Re: {qTitle}
                                </Link>
                                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{preview}</p>
                              </li>
                            );
                          })
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={submitQuestion} className="space-y-3 max-w-3xl">
          <div>
            <label htmlFor="q-title" className="block text-sm font-semibold text-slate-700 mb-1">
              Title
            </label>
            <input
              id="q-title"
              className="w-full border rounded-md px-3 py-2"
              placeholder="What is your question? Be specific."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="q-body" className="block text-sm font-semibold text-slate-700 mb-1">
              Body
            </label>
            <textarea
              id="q-body"
              className="w-full border rounded-md px-3 py-2 min-h-32"
              placeholder="Describe your question in detail. Include code, error messages, what you've tried, etc."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="q-category" className="block text-sm font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              id="q-category"
              className="w-full border rounded-md px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="q-tags" className="block text-sm font-semibold text-slate-700 mb-1">
              Tags (comma separated)
            </label>
            <input
              id="q-tags"
              className="w-full border rounded-md px-3 py-2"
              placeholder="e.g. javascript, react, computing"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
            <p className="text-xs text-slate-500 mt-1">
              Suggested tags for {category}: type to filter and click to add.
            </p>
            {!!suggestedTags.length && (
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="text-xs px-2 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                    onClick={() => replaceActiveTagWith(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <ImageDropZone
            files={imageFiles}
            onFilesChange={setImageFiles}
            maxFiles={8}
            disabled={posting}
            label="Screenshots & images (optional, up to 8)"
          />

          {(suggestionsLoading || suggestions.length > 0) && (
            <div className="border rounded-md p-3 bg-slate-50">
              <p className="text-sm font-semibold">Suggested questions</p>
              {suggestionsLoading ? (
                <p className="text-sm text-slate-600 mt-1">Loading...</p>
              ) : (
                <div className="mt-2 space-y-1">
                  {suggestions.map((s) => (
                    <Link
                      key={s._id}
                      to={`/questions/${s._id}`}
                      className="block text-sm text-blue-600 hover:underline"
                    >
                      {s.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

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

      <div className="bg-white rounded-xl shadow p-5">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold">Questions</h1>
          <div className="flex items-center gap-3">
            <form onSubmit={submitSearch} className="flex items-center gap-2">
              <input
                className="border rounded-md px-3 py-2"
                placeholder="Search questions"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-header text-white disabled:opacity-60"
                disabled={searching}
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </form>
            <span className="text-sm text-slate-500">{questions.length} total</span>
          </div>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => {
              const isMine =
                Boolean(viewerId && authorIdString(q.authorId) === String(viewerId));
              return (
              <Link
                key={q._id}
                to={`/questions/${q._id}`}
                className={`block rounded-lg p-3 hover:bg-slate-50 relative border ${
                  isMine
                    ? "border-amber-300/80 bg-amber-50/40 border-l-4 border-l-amber-400"
                    : "border-slate-200"
                }`}
              >
                {isMine && (
                  <span className="absolute top-2 right-2 text-[0.65rem] font-extrabold uppercase tracking-wide text-slate-900 bg-amber-200/90 px-1.5 py-0.5 rounded border border-amber-400/60">
                    Yours
                  </span>
                )}
                {q.images?.length > 0 && (
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {q.images.slice(0, 3).map((img) => (
                      <img
                        key={`${img.blobName || ""}-${img.url}`}
                        src={questionThumbSrc(img)}
                        alt=""
                        className="h-12 w-12 object-cover rounded-md border bg-slate-50"
                      />
                    ))}
                    {q.images.length > 3 && (
                      <span className="text-xs font-semibold text-slate-600 border rounded-md px-2 py-1 bg-white">
                        +{q.images.length - 3}
                      </span>
                    )}
                  </div>
                )}
                <div className={`flex items-center justify-between gap-2 ${isMine ? "pr-16" : ""}`}>
                  <h2 className="font-semibold">{q.title}</h2>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {q.category && (
                      <span className="text-xs px-2 py-1 rounded bg-slate-100">
                        {q.category}
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 rounded bg-slate-100">{q.status}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-700 mt-1 line-clamp-2">{q.body}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs px-2 py-1 rounded bg-slate-100">
                    {q.answerCount ?? 0} answers
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-slate-100">
                    {q.voteScore ?? 0} votes
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Asked by {isMine ? "You" : displayName(q.authorId)}
                </p>
              </Link>
            );
            })}
            {!questions.length && <p className="text-slate-600">No questions yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionsPage;

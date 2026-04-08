import React, { useEffect, useMemo, useState } from "react";
import {
  HelpCircle,
  Users,
  Search,
  ChevronRight,
  ChevronDown,
  Monitor,
  Star,
  Check,
  ChevronLeft,
  MoreHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { UserDashboardShell } from "../../components/user/UserDashboardShell";

/** Fallback when API is unavailable; same shape as GET /user-dashboard/me/recent-answers */
const DUMMY_RECENT_ANSWERS = [
  {
    id: "dummy-1",
    questionId: "q-itpm-zip",
    questionTitle: "How to submit ITPM assignment ZIP?",
    answerSnippet: "Include project without node_modules...",
    fullAnswer:
      "Include your project folder without node_modules, then zip the root. Upload via the LMS submission link before the deadline.",
    upvotes: 15,
    isBestAnswer: true,
    date: "2026-03-24T12:00:00.000Z",
  },
  {
    id: "dummy-2",
    questionId: "q-rest-api",
    questionTitle: "What is REST API?",
    answerSnippet: "REST is an architectural style...",
    fullAnswer:
      "REST is an architectural style for networked applications. It uses HTTP methods and stateless communication.",
    upvotes: 8,
    isBestAnswer: false,
    date: "2026-03-23T12:00:00.000Z",
  },
  {
    id: "dummy-3",
    questionId: "q-mongo-connect",
    questionTitle: "How to connect MongoDB?",
    answerSnippet: "Use mongoose.connect() with URI...",
    fullAnswer: "Use mongoose.connect(process.env.MONGO_URI) after loading dotenv.",
    upvotes: 20,
    isBestAnswer: true,
    date: "2026-03-22T12:00:00.000Z",
  },
  {
    id: "dummy-4",
    questionId: "q-tcp-udp",
    questionTitle: "Difference between TCP and UDP?",
    answerSnippet: "TCP is reliable, UDP is faster...",
    fullAnswer:
      "TCP provides reliable, ordered delivery. UDP is connectionless and faster but may drop packets.",
    upvotes: 5,
    isBestAnswer: false,
    date: "2026-03-21T12:00:00.000Z",
  },
  {
    id: "dummy-5",
    questionId: "q-summer",
    questionTitle: "Summer answers",
    answerSnippet: "TCP is reliable, UDP is faster...",
    fullAnswer: "Compare reliability, ordering, and use cases for exam-style answers.",
    upvotes: 5,
    isBestAnswer: false,
    date: "2026-03-21T14:00:00.000Z",
  },
];

const DashboardPage = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({
    profile: null,
    stats: {
      reputationPoints: 0,
      myQuestions: 0,
      myAnswers: 0,
      communitiesJoined: 0,
      unreadNotifications: 0,
    },
  });
  const [recentAnswers, setRecentAnswers] = useState([]);
  const [answersSearch, setAnswersSearch] = useState("");
  const [bestAnswerFilter, setBestAnswerFilter] = useState("all");
  const [answersPage, setAnswersPage] = useState(1);
  const answersPageSize = 5;
  const [fullAnswerModal, setFullAnswerModal] = useState({
    open: false,
    questionTitle: "",
    fullAnswer: "",
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!auth?.token) return;
      setLoading(true);
      setError("");

      try {
        const overviewRes = await api.get("/user-dashboard/me/overview", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        const overviewData = overviewRes.data?.data || {};
        setDashboardData((prev) => ({
          ...prev,
          ...overviewData,
        }));
      } catch {
        setDashboardData((prev) => ({
          ...prev,
          profile: {
            firstName: auth?.user?.name?.split(" ")?.[0] || "User",
          },
        }));
        setError("Some dashboard data could not be loaded.");
      }

      try {
        const answersRes = await api.get("/user-dashboard/me/recent-answers", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        const list = answersRes.data?.data;
        setRecentAnswers(Array.isArray(list) ? list : DUMMY_RECENT_ANSWERS);
      } catch {
        setRecentAnswers(DUMMY_RECENT_ANSWERS);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token]);

  const stats = [
    {
      title: "Reputation points",
      value: dashboardData.stats.reputationPoints,
      growth: "Live score",
      icon: <Users size={24} className="text-blue-600" />,
      bg: "bg-blue-100",
    },
    {
      title: "My Questions",
      value: dashboardData.stats.myQuestions,
      growth: "Live count",
      icon: <HelpCircle size={24} className="text-purple-600" />,
      bg: "bg-purple-100",
    },
    {
      title: "My Answer",
      value: dashboardData.stats.myAnswers,
      growth: "Live count",
      icon: <Monitor size={24} className="text-emerald-600" />,
      bg: "bg-emerald-100",
    },
  ];

  const filteredRecentAnswers = useMemo(() => {
    const q = answersSearch.trim().toLowerCase();
    return (recentAnswers || []).filter((row) => {
      const hay = `${row.questionTitle || ""} ${row.answerSnippet || ""}`.toLowerCase();
      const matchesSearch = !q || hay.includes(q);
      const matchesBest =
        bestAnswerFilter === "all" ||
        (bestAnswerFilter === "yes" && row.isBestAnswer) ||
        (bestAnswerFilter === "no" && !row.isBestAnswer);
      return matchesSearch && matchesBest;
    });
  }, [recentAnswers, answersSearch, bestAnswerFilter]);

  const totalAnswerPages = Math.max(
    1,
    Math.ceil(filteredRecentAnswers.length / answersPageSize)
  );
  const paginatedAnswers = useMemo(() => {
    const start = (answersPage - 1) * answersPageSize;
    return filteredRecentAnswers.slice(start, start + answersPageSize);
  }, [filteredRecentAnswers, answersPage, answersPageSize]);

  useEffect(() => {
    setAnswersPage((p) => (p > totalAnswerPages ? 1 : p));
  }, [totalAnswerPages, filteredRecentAnswers.length]);

  return (
    <UserDashboardShell>
          {/* Top Bar */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-[#1f2937] sm:text-2xl">
              Hello {dashboardData.profile?.firstName || auth?.user?.name || "User"}{" "}
              <span className="text-lg sm:text-xl">👋🏻</span>
            </h2>

            <div className="flex h-11 w-full max-w-[240px] items-center gap-2.5 rounded-xl bg-white px-3.5 shadow-sm sm:w-[220px]">
              <Search size={17} className="shrink-0 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Stats */}
          {loading && <p className="mb-4 text-xs font-medium text-[#334155]">Loading dashboard...</p>}
          {error && <p className="mb-4 text-xs font-medium text-red-600">{error}</p>}
          <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
            {stats.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 shadow-sm"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${item.bg}`}
                  >
                    {item.icon}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-400">
                      {item.title}
                    </p>
                    <h3 className="mt-0.5 text-3xl font-bold leading-none text-[#20263a]">{item.value}</h3>
                    <p className="mt-1.5 text-xs font-semibold text-emerald-500">
                      ↑ <span className="font-bold">{item.growth}</span>
                    </p>
                  </div>
                </div>

                {index === 2 && (
                  <div className="hidden flex-col items-end justify-between xl:flex">
                    <div className="h-12 w-24 rounded-lg bg-gradient-to-br from-emerald-50 to-white p-1.5">
                      <svg viewBox="0 0 100 40" className="h-full w-full">
                        <polyline
                          fill="none"
                          stroke="#34d399"
                          strokeWidth="3"
                          points="5,30 20,18 32,30 48,10 62,24 78,6 92,12"
                        />
                      </svg>
                    </div>
                    <div className="mt-2 flex -space-x-1.5">
                      <img
                        src="https://i.pravatar.cc/40?img=1"
                        alt="user1"
                        className="h-7 w-7 rounded-full border-2 border-white"
                      />
                      <img
                        src="https://i.pravatar.cc/40?img=2"
                        alt="user2"
                        className="h-7 w-7 rounded-full border-2 border-white"
                      />
                      <img
                        src="https://i.pravatar.cc/40?img=3"
                        alt="user3"
                        className="h-7 w-7 rounded-full border-2 border-white"
                      />
                      <img
                        src="https://i.pravatar.cc/40?img=4"
                        alt="user4"
                        className="h-7 w-7 rounded-full border-2 border-white"
                      />
                      <img
                        src="https://i.pravatar.cc/40?img=5"
                        alt="user5"
                        className="h-7 w-7 rounded-full border-2 border-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Recent Answers */}
          <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#20263a] sm:text-xl">Recent Answers</h3>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="flex h-11 min-w-[180px] items-center gap-2.5 rounded-xl bg-[#f7f7fb] px-3.5">
                  <Search size={17} className="shrink-0 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions or answers..."
                    value={answersSearch}
                    onChange={(e) => {
                      setAnswersSearch(e.target.value);
                      setAnswersPage(1);
                    }}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />
                </div>

                <div className="flex h-11 items-center gap-2 rounded-xl bg-[#f7f7fb] px-3.5">
                  <span className="text-xs font-semibold text-[#6b7280]">Best answer</span>
                  <select
                    value={bestAnswerFilter}
                    onChange={(e) => {
                      setBestAnswerFilter(e.target.value);
                      setAnswersPage(1);
                    }}
                    className="rounded-md border-0 bg-transparent text-sm font-semibold text-[#30384f] outline-none"
                  >
                    <option value="all">All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  <ChevronDown size={16} className="text-[#6b7280]" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#edf0f6]">
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className="bg-[#f1f5f9] text-left text-[#64748b]">
                    <th className="px-4 py-2.5 text-xs font-semibold">Question</th>
                    <th className="px-4 py-2.5 text-xs font-semibold">Answer</th>
                    <th className="px-4 py-2.5 text-xs font-semibold">Upvotes</th>
                    <th className="px-4 py-2.5 text-xs font-semibold">Best Answer</th>
                    <th className="px-4 py-2.5 text-xs font-semibold">Date</th>
                    <th className="px-4 py-2.5 text-xs font-semibold"> </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedAnswers.map((row) => {
                    const rowKey = row.id || `${row.questionId}-${row.date}`;
                    const d = row.date ? new Date(row.date) : null;
                    const dateStr = d && !Number.isNaN(d.getTime())
                      ? d.toLocaleDateString("en-GB")
                      : "—";
                    return (
                      <tr
                        key={rowKey}
                        className="border-b border-[#edf0f6] text-sm text-[#334155] last:border-b-0"
                      >
                        <td className="max-w-[200px] px-4 py-3">
                          <Link
                            to={`/questions/${row.questionId}`}
                            className="font-medium text-[#4f46e5] hover:underline"
                          >
                            {row.questionTitle}
                          </Link>
                        </td>
                        <td className="max-w-[240px] px-4 py-3 text-[#475569]">
                          {row.answerSnippet}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="inline-flex items-center gap-1 font-semibold text-[#ca8a04]">
                            <Star size={15} className="fill-amber-400 text-amber-400" />
                            {row.upvotes ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {row.isBestAnswer ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                              <Check size={14} strokeWidth={3} />
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                              <MoreHorizontal size={14} />
                              No
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-[#64748b]">{dateStr}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              setFullAnswerModal({
                                open: true,
                                questionTitle: row.questionTitle || "",
                                fullAnswer: row.fullAnswer || row.answerSnippet || "",
                              })
                            }
                            className="rounded-lg bg-[#f9bf3b] px-3 py-1.5 text-xs font-bold text-[#343e43] transition hover:brightness-95"
                          >
                            View full answer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!paginatedAnswers.length && (
                    <tr>
                      <td className="px-4 py-6 text-center text-sm text-[#64748b]" colSpan={6}>
                        No answers match your search or filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end gap-1.5">
              <button
                type="button"
                disabled={answersPage <= 1}
                onClick={() => setAnswersPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e8f0] bg-white text-[#64748b] disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={17} />
              </button>
              <span className="flex h-8 min-w-[2rem] items-center justify-center rounded-md bg-[#dbeafe] text-xs font-bold text-[#2563eb]">
                {answersPage}
              </span>
              <button
                type="button"
                disabled={answersPage >= totalAnswerPages}
                onClick={() => setAnswersPage((p) => Math.min(totalAnswerPages, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#e2e8f0] bg-white text-[#64748b] disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          {fullAnswerModal.open && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="full-answer-title"
            >
              <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-4 shadow-xl sm:p-5">
                <h4 id="full-answer-title" className="text-base font-bold text-[#20263a]">
                  {fullAnswerModal.questionTitle}
                </h4>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#475569]">
                  {fullAnswerModal.fullAnswer}
                </p>
                <button
                  type="button"
                  onClick={() => setFullAnswerModal((m) => ({ ...m, open: false }))}
                  className="mt-4 w-full rounded-lg bg-[#f9bf3b] py-2.5 text-sm font-bold text-[#343e43] hover:brightness-95"
                >
                  Close
                </button>
              </div>
            </div>
          )}
    </UserDashboardShell>
  );
};

export default DashboardPage;
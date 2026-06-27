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
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { UserDashboardShell } from "../../components/user/UserDashboardShell";
import { Notifications } from "../User/Notifications/Notifications";
import { Settings as UserSettingsPanel } from "../User/Settings/Settings";

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
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab");
  const notificationsTab = tab === "notifications";
  const settingsTab = tab === "settings";
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
      icon: <HelpCircle size={34} className="text-amberGold" />,
      bg: "bg-amberGold/20",
    },
    {
      title: "My Answer",
      value: dashboardData.stats.myAnswers,
      growth: "Live count",
      icon: <Monitor size={34} className="text-deepNavy" />,
      bg: "bg-deepNavy/10",
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
      {notificationsTab ? (
        <Notifications />
      ) : settingsTab ? (
        <UserSettingsPanel />
      ) : (
        <>
          {/* Top Bar */}
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-[28px] font-bold text-richBlack">
              <span className="text-deepNavy">Hello</span>{" "}
              {dashboardData.profile?.firstName || auth?.user?.name || "User"}{" "}
              <span className="text-2xl">👋🏻</span>
            </h2>

            <div className="flex h-14 w-[270px] items-center gap-3 rounded-2xl border border-border bg-card px-4 shadow-soft">
              <Search size={20} className="text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Stats */}
          {loading && <p className="mb-6 text-sm font-medium text-muted-foreground">Loading dashboard...</p>}
          {error && <p className="mb-6 text-sm font-medium text-destructive">{error}</p>}
          <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {stats.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-[28px] border border-border/80 bg-card px-6 py-7 shadow-card"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-full ring-2 ring-white ${item.bg}`}
                  >
                    {item.icon}
                  </div>

                  <div>
                    <p className="text-lg font-medium text-muted-foreground">
                      {item.title}
                    </p>
                    <h3 className="mt-1 text-5xl font-bold text-richBlack">{item.value}</h3>
                    <p
                      className={`mt-2 text-base font-semibold ${
                        index === 1 ? "text-amberGold" : "text-azureBlue"
                      }`}
                    >
                      ↑ <span className="font-bold">{item.growth}</span>
                    </p>
                  </div>
                </div>

                {index === 2 && (
                  <div className="hidden flex-col items-end justify-between xl:flex">
                    <div className="h-16 w-28 rounded-xl bg-gradient-to-br from-amberGold/15 via-coolSilver to-card p-2 ring-1 ring-amberGold/25">
                      <svg viewBox="0 0 100 40" className="h-full w-full text-azureBlue">
                        <polyline
                          fill="none"
                          stroke="currentColor"
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
          <div className="rounded-[30px] border border-border/80 bg-card p-8 shadow-card">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="border-l-4 border-amberGold pl-4">
                <h3 className="text-[24px] font-bold text-richBlack">Recent Answers</h3>
                <p className="mt-1 text-sm text-muted-foreground">Your latest activity on the forum</p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex h-14 min-w-[220px] items-center gap-3 rounded-2xl border border-border bg-muted px-4">
                  <Search size={20} className="text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search questions or answers..."
                    value={answersSearch}
                    onChange={(e) => {
                      setAnswersSearch(e.target.value);
                      setAnswersPage(1);
                    }}
                    className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>

                <div className="flex h-14 items-center gap-2 rounded-2xl border border-border bg-muted px-4">
                  <span className="text-sm font-semibold text-muted-foreground">Best answer</span>
                  <select
                    value={bestAnswerFilter}
                    onChange={(e) => {
                      setBestAnswerFilter(e.target.value);
                      setAnswersPage(1);
                    }}
                    className="rounded-lg border-0 bg-transparent text-[15px] font-semibold text-richBlack outline-none"
                  >
                    <option value="all">All</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                  <ChevronDown size={18} className="text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="bg-muted text-left text-muted-foreground">
                    <th className="px-6 py-4 text-sm font-semibold">Question</th>
                    <th className="px-6 py-4 text-sm font-semibold">Answer</th>
                    <th className="px-6 py-4 text-sm font-semibold">Upvotes</th>
                    <th className="px-6 py-4 text-sm font-semibold">Best Answer</th>
                    <th className="px-6 py-4 text-sm font-semibold">Date</th>
                    <th className="px-6 py-4 text-sm font-semibold"> </th>
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
                        className="border-b border-border text-[15px] text-foreground/90 last:border-b-0"
                      >
                        <td className="max-w-[200px] px-4 py-3">
                          <Link
                            to={`/questions/${row.questionId}`}
                            className="font-medium text-azureBlue transition hover:text-deepNavy hover:underline"
                          >
                            {row.questionTitle}
                          </Link>
                        </td>
                        <td className="max-w-[280px] px-6 py-5 text-muted-foreground">
                          {row.answerSnippet}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-amberGold">
                            <Star size={18} className="fill-amberGold text-amberGold" />
                            {row.upvotes ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {row.isBestAnswer ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-azureBlue/12 px-3 py-1 text-sm font-semibold text-deepNavy">
                              <Check size={16} strokeWidth={3} className="text-azureBlue" />
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-sm font-semibold text-muted-foreground">
                              <MoreHorizontal size={16} />
                              No
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5 text-muted-foreground">{dateStr}</td>
                        <td className="px-6 py-5">
                          <button
                            type="button"
                            onClick={() =>
                              setFullAnswerModal({
                                open: true,
                                questionTitle: row.questionTitle || "",
                                fullAnswer: row.fullAnswer || row.answerSnippet || "",
                              })
                            }
                            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
                          >
                            View full answer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!paginatedAnswers.length && (
                    <tr>
                      <td className="px-6 py-8 text-center text-muted-foreground" colSpan={6}>
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
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-azureBlue/40 hover:text-azureBlue disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={17} />
              </button>
              <span className="flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg bg-azureBlue/12 text-sm font-bold text-azureBlue ring-1 ring-azureBlue/20">
                {answersPage}
              </span>
              <button
                type="button"
                disabled={answersPage >= totalAnswerPages}
                onClick={() => setAnswersPage((p) => Math.min(totalAnswerPages, p + 1))}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-azureBlue/40 hover:text-azureBlue disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>

          {fullAnswerModal.open && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-richBlack/50 p-4 backdrop-blur-[2px]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="full-answer-title"
            >
              <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-elevated ring-1 ring-deepNavy/10">
                <h4 id="full-answer-title" className="text-lg font-bold text-richBlack">
                  {fullAnswerModal.questionTitle}
                </h4>
                <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-muted-foreground">
                  {fullAnswerModal.fullAnswer}
                </p>
                <button
                  type="button"
                  onClick={() => setFullAnswerModal((m) => ({ ...m, open: false }))}
                  className="mt-6 w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground shadow-sm transition hover:bg-primary-hover"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </UserDashboardShell>
  );
};

export default DashboardPage;
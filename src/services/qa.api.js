import { api } from "../lib/api";

const getToken = () => {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch {
    return null;
  }
};

const withAuth = (config = {}) => {
  const token = getToken();
  if (!token) return config;

  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  };
};

const unwrap = (response) => response.data;

export const qaApi = {
  getQuestions: async () => unwrap(await api.get("/questions")),
  getMyQuestions: async () => unwrap(await api.get("/questions/me", withAuth())),
  getMyAnswers: async () => unwrap(await api.get("/answers/me", withAuth())),
  searchQuestions: async (q, { category, status, page, limit } = {}) =>
    unwrap(
      await api.get("/questions/search", {
        params: {
          q,
          ...(category ? { category } : {}),
          ...(status ? { status } : {}),
          ...(page ? { page } : {}),
          ...(limit ? { limit } : {}),
        },
      })
    ),
  getQuestionById: async (id) => unwrap(await api.get(`/questions/${id}`)),
  getQuestionSuggestions: async (title) =>
    unwrap(
      await api.get("/questions/suggestions", {
        params: { title },
      })
    ),
  createQuestion: async (payload) =>
    unwrap(await api.post("/questions", payload, withAuth())),
  uploadQuestionImages: async (questionId, files) => {
    const form = new FormData();
    for (const f of files) {
      form.append("images", f);
    }
    return unwrap(await api.post(`/questions/${questionId}/images`, form, withAuth()));
  },
  removeQuestionImage: async (questionId, url) =>
    unwrap(
      await api.delete(`/questions/${questionId}/images`, {
        ...withAuth(),
        data: { url },
      })
    ),
  voteQuestion: async (questionId) =>
    unwrap(await api.post(`/questions/${questionId}/vote`, {}, withAuth())),
  unvoteQuestion: async (questionId) =>
    unwrap(await api.delete(`/questions/${questionId}/vote`, withAuth())),
  editQuestion: async (id, payload) =>
    unwrap(await api.put(`/questions/${id}`, payload, withAuth())),
  deleteQuestion: async (id) => unwrap(await api.delete(`/questions/${id}`, withAuth())),

  getAnswersByQuestion: async (questionId) =>
    unwrap(await api.get(`/answers/question/${questionId}`)),
  postAnswer: async (questionId, payload) =>
    unwrap(await api.post(`/answers/${questionId}`, payload, withAuth())),
  editAnswer: async (answerId, payload) =>
    unwrap(await api.put(`/answers/${answerId}`, payload, withAuth())),
  deleteAnswer: async (answerId) =>
    unwrap(await api.delete(`/answers/${answerId}`, withAuth())),
  markBestAnswer: async (answerId) =>
    unwrap(await api.patch(`/answers/${answerId}/best`, {}, withAuth())),
  voteAnswer: async (answerId, payload = {}) =>
    unwrap(await api.post(`/answers/${answerId}/vote`, payload, withAuth())),
  unvoteAnswer: async (answerId) =>
    unwrap(await api.delete(`/answers/${answerId}/vote`, withAuth())),
  uploadAnswerImages: async (answerId, files) => {
    const form = new FormData();
    for (const f of files) {
      form.append("images", f);
    }
    return unwrap(await api.post(`/answers/${answerId}/images`, form, withAuth()));
  },
  removeAnswerImage: async (answerId, url) =>
    unwrap(
      await api.delete(`/answers/${answerId}/images`, {
        ...withAuth(),
        data: { url },
      })
    ),
  addCommentToAnswer: async (answerId, payload) =>
    unwrap(await api.post(`/answers/${answerId}/comments`, payload, withAuth())),
};

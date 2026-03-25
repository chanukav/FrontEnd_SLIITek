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
  getQuestionById: async (id) => unwrap(await api.get(`/questions/${id}`)),
  createQuestion: async (payload) =>
    unwrap(await api.post("/questions", payload, withAuth())),

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
  addCommentToAnswer: async (answerId, payload) =>
    unwrap(await api.post(`/answers/${answerId}/comments`, payload, withAuth())),
};

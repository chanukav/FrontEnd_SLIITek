import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { qaApi } from "../services/qa.api";

const CATEGORIES = [
  "Academic",
  "Career & Internships",
  "Campus Life",
  "Technical / Programming Help",
  "Study Resources",
  "Clubs & Events",
  "General / Other",
];

export default function EditQuestionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("General / Other");

  const auth = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("auth") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const q = await qaApi.getQuestionById(id);
        setTitle(q?.title || "");
        setBody(q?.body || "");
        setCategory(q?.category || "General / Other");
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load question");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const validateEditForm = () => {
    const nextTitle = title.trim();
    const nextBody = body.trim();
    const nextCategory = category.trim();

    // Title validation
    if (!nextTitle) {
      return "Title is required";
    }
    if (nextTitle.length < 10) {
      return "Title must be at least 10 characters long";
    }
    if (nextTitle.length > 200) {
      return "Title must not exceed 200 characters";
    }
    if (!/^[a-zA-Z0-9\s\?.,!()&\-':;]/.test(nextTitle)) {
      return "Title contains invalid characters";
    }

    // Body validation
    if (!nextBody) {
      return "Description is required";
    }
    if (nextBody.length < 20) {
      return "Description must be at least 20 characters long";
    }
    if (nextBody.length > 5000) {
      return "Description must not exceed 5000 characters";
    }
    const bodyWords = nextBody.split(/\s+/).filter(Boolean);
    if (bodyWords.length < 5) {
      return "Description must contain at least 5 words";
    }

    // Category validation
    const validCategories = CATEGORIES;
    if (!nextCategory || !validCategories.includes(nextCategory)) {
      return "Please select a valid category";
    }

    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!auth?.token) {
      navigate("/login");
      return;
    }

    // Validate form
    const validationError = validateEditForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const nextTitle = title.trim();
    const nextBody = body.trim();
    const nextCategory = category.trim();

    try {
      setSaving(true);
      setError("");
      await qaApi.editQuestion(id, {
        title: nextTitle,
        body: nextBody,
        category: nextCategory,
      });
      navigate("/home", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        localStorage.removeItem("auth");
        navigate("/login");
        return;
      }
      setError(err?.response?.data?.message || err.message || "Edit failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-3xl mx-auto p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Link to={`/questions/${id}`} className="text-sm text-blue-600 hover:underline">
        Back to question
      </Link>

      <div className="bg-white rounded-xl shadow p-5">
        <h1 className="text-xl font-bold mb-4">Edit question</h1>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Body</label>
            <textarea
              className="w-full border rounded-md px-3 py-2 min-h-32"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-md bg-header text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md border"
              onClick={() => navigate(`/questions/${id}`)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


import { CheckSquare, Loader2, Plus, Search, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import api, { getApiError } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const sortOptions = {
  newest: '-createdAt',
  oldest: 'createdAt',
  name: 'name'
};

export default function Projects() {
  const { isAdmin } = useAuth();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState({ data: [], total: 0, totalPages: 0, hasNext: false, hasPrev: false });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const params = useMemo(() => {
    const next = new URLSearchParams({
      page: String(page),
      limit: '9',
      sort: sortOptions[sort]
    });
    if (debouncedSearch) {
      next.set('search', debouncedSearch);
    }
    return next.toString();
  }, [debouncedSearch, page, sort]);

  function loadProjects() {
    setLoading(true);
    api
      .get(`/projects?${params}`)
      .then((response) => {
        setProjects(response.data);
        setError('');
      })
      .catch((apiError) => setError(getApiError(apiError, 'Unable to load projects')))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProjects();
  }, [params]);

  async function createProject(event) {
    event.preventDefault();
    setError('');

    if (form.name.trim().length < 2) {
      setError('Project name must be at least 2 characters');
      return;
    }

    setSaving(true);
    try {
      await api.post('/projects', {
        name: form.name.trim(),
        description: form.description.trim()
      });
      setForm({ name: '', description: '' });
      setModalOpen(false);
      loadProjects();
    } catch (apiError) {
      setError(getApiError(apiError, 'Unable to create project'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Projects</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Browse active project spaces</p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            New Project
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-3 md:grid-cols-[1fr_12rem] dark:border-zinc-800 dark:bg-zinc-900">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            placeholder="Search projects"
          />
        </label>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="name">Name A-Z</option>
        </select>
      </div>

      {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading projects</p>
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.data.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-teal-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-teal-500"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">{project.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{project.description || 'No description'}</p>
                </div>
                <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {project.memberCount}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4" />
                  {project.taskCount}
                </span>
                <span className="truncate">By {project.creatorName}</span>
              </div>
            </Link>
          ))}
        </section>
      )}

      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          disabled={!projects.hasPrev}
          onClick={() => setPage((current) => Math.max(current - 1, 1))}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
        >
          Prev
        </button>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Page {projects.totalPages === 0 ? 0 : page} of {projects.totalPages}
        </span>
        <button
          type="button"
          disabled={!projects.hasNext}
          onClick={() => setPage((current) => current + 1)}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
        >
          Next
        </button>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/60 px-4">
          <form onSubmit={createProject} className="w-full max-w-lg rounded-lg border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">New Project</h2>
            <div className="mt-4 space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="mt-1 min-h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium dark:border-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Create
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

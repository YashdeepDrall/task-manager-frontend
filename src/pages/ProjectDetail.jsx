import { ArrowLeft, KanbanSquare, Loader2, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import api, { getApiError } from '../api/axios';
import MemberBadge from '../components/MemberBadge';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetail() {
  const { isAdmin } = useAuth();
  const { projectId } = useParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [project, setProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [users, setUsers] = useState([]);

  function loadProject() {
    setLoading(true);
    api
      .get(`/projects/${projectId}`)
      .then((response) => {
        setProject(response.data);
        setError('');
      })
      .catch((apiError) => setError(getApiError(apiError, 'Unable to load project')))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (!modalOpen || !isAdmin) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSearching(true);
      const params = new URLSearchParams({ limit: '20' });
      if (search.trim()) {
        params.set('search', search.trim());
      }
      api
        .get(`/auth/users?${params.toString()}`)
        .then((response) => setUsers(response.data))
        .catch((apiError) => setError(getApiError(apiError, 'Unable to search users')))
        .finally(() => setSearching(false));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [modalOpen, search, isAdmin]);

  async function addMember(userId) {
    setSaving(true);
    try {
      const response = await api.post(`/projects/${projectId}/members`, { userId });
      setProject(response.data);
      setModalOpen(false);
      setSearch('');
      setUsers([]);
      setError('');
    } catch (apiError) {
      setError(getApiError(apiError, 'Unable to add member'));
    } finally {
      setSaving(false);
    }
  }

  async function removeMember(userId) {
    setSaving(true);
    try {
      const response = await api.delete(`/projects/${projectId}/members/${userId}`);
      setProject(response.data);
      setError('');
    } catch (apiError) {
      setError(getApiError(apiError, 'Unable to remove member'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading project</p>;
  }

  if (error && !project) {
    return <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">{error}</p>;
  }

  const memberIds = new Set(project.members.map((member) => member.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <Link to="/projects" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Projects
          </Link>
          <h1 className="text-2xl font-semibold tracking-normal">{project.name}</h1>
          <p className="mt-1 max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">{project.description || 'No description'}</p>
        </div>
        <Link
          to={`/projects/${project.id}/board`}
          className="flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          <KanbanSquare className="h-4 w-4" />
          Task Board
        </Link>
      </div>

      {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">{error}</p> : null}

      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Members</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{project.memberCount} people on this project</p>
          </div>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {project.members.map((member) => (
            <MemberBadge
              key={member.id}
              member={member}
              removable={isAdmin}
              onRemove={removeMember}
            />
          ))}
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/60 px-4">
          <section className="w-full max-w-xl rounded-lg border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Add Member</h2>
            <label className="relative mt-4 block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                placeholder="Search by name or email"
              />
            </label>

            <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
              {searching ? <p className="text-sm text-zinc-500 dark:text-zinc-400">Searching users</p> : null}
              {users
                .filter((user) => !memberIds.has(user.id))
                .map((user) => (
                  <button
                    type="button"
                    key={user.id}
                    onClick={() => addMember(user.id)}
                    disabled={saving}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2 text-left hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:hover:bg-zinc-800"
                  >
                    <span>
                      <span className="block text-sm font-medium">{user.name}</span>
                      <span className="block text-xs text-zinc-500 dark:text-zinc-400">{user.email}</span>
                    </span>
                    <span className="text-xs capitalize text-zinc-500 dark:text-zinc-400">{user.role}</span>
                  </button>
                ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium dark:border-zinc-700"
              >
                Cancel
              </button>
              {saving ? (
                <span className="flex items-center gap-2 px-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving
                </span>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

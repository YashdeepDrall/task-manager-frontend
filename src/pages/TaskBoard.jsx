import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import api, { getApiError } from '../api/axios';
import FilterBar from '../components/FilterBar';
import KanbanColumn from '../components/KanbanColumn';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';

const columns = [
  { key: 'todo', title: 'Todo' },
  { key: 'in-progress', title: 'In Progress' },
  { key: 'done', title: 'Done' }
];

const initialTaskForm = {
  title: '',
  description: '',
  assignedTo: '',
  priority: 'medium',
  deadline: ''
};

export default function TaskBoard() {
  const { isAdmin } = useAuth();
  const { projectId } = useParams();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [activeTask, setActiveTask] = useState(null);
  const [assignee, setAssignee] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [priority, setPriority] = useState('');
  const [project, setProject] = useState(null);
  const [saving, setSaving] = useState(false);
  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(filterSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [filterSearch]);

  function loadProject() {
    return api.get(`/projects/${projectId}`).then((response) => setProject(response.data));
  }

  function loadTasks() {
    const params = new URLSearchParams({
      projectId,
      page: '1',
      limit: '100',
      sort: 'createdAt'
    });
    if (assignee) {
      params.set('assignedTo', assignee);
    }
    if (priority) {
      params.set('priority', priority);
    }
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    }
    if (overdueOnly) {
      params.set('overdue', 'true');
    }
    return api.get(`/tasks?${params.toString()}`).then((response) => setTasks(response.data.data));
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([loadProject(), loadTasks()])
      .then(() => setError(''))
      .catch((apiError) => setError(getApiError(apiError, 'Unable to load task board')))
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => {
    if (!project) {
      return;
    }
    loadTasks().catch((apiError) => setError(getApiError(apiError, 'Unable to load tasks')));
  }, [assignee, priority, debouncedSearch, overdueOnly]);

  const tasksByStatus = useMemo(() => {
    return columns.reduce((result, column) => {
      result[column.key] = tasks.filter((task) => task.status === column.key);
      return result;
    }, {});
  }, [tasks]);

  async function createTask(event) {
    event.preventDefault();
    setError('');

    if (taskForm.title.trim().length < 2) {
      setError('Task title must be at least 2 characters');
      return;
    }

    setSaving(true);
    try {
      await api.post('/tasks', {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        projectId,
        assignedTo: taskForm.assignedTo || null,
        status: 'todo',
        priority: taskForm.priority,
        deadline: taskForm.deadline ? new Date(taskForm.deadline).toISOString() : null
      });
      setTaskForm(initialTaskForm);
      setModalOpen(false);
      await loadTasks();
    } catch (apiError) {
      setError(getApiError(apiError, 'Unable to create task'));
    } finally {
      setSaving(false);
    }
  }

  async function openTask(taskId) {
    setError('');
    try {
      const response = await api.get(`/tasks/${taskId}`);
      setDetail(response.data);
    } catch (apiError) {
      setError(getApiError(apiError, 'Unable to load task'));
    }
  }

  function handleDragStart(event) {
    setActiveTask(event.active.data.current?.task || null);
  }

  async function handleDragEnd(event) {
    const task = event.active.data.current?.task;
    const nextStatus = event.over?.id;
    setActiveTask(null);

    if (!task || !nextStatus || task.status === nextStatus) {
      return;
    }

    const previousTasks = tasks;
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, status: nextStatus } : item))
    );

    try {
      await api.patch(`/tasks/${task.id}`, { status: nextStatus });
      await loadTasks();
    } catch (apiError) {
      setTasks(previousTasks);
      setError(getApiError(apiError, 'Unable to update task status'));
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading task board</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <Link to={`/projects/${projectId}`} className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Project
          </Link>
          <h1 className="text-2xl font-semibold tracking-normal">{project?.name}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Kanban task board</p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        ) : null}
      </div>

      <FilterBar
        assignee={assignee}
        members={project?.members || []}
        overdueOnly={overdueOnly}
        priority={priority}
        search={filterSearch}
        setAssignee={setAssignee}
        setOverdueOnly={setOverdueOnly}
        setPriority={setPriority}
        setSearch={setFilterSearch}
      />

      {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">{error}</p> : null}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <section className="grid gap-4 lg:grid-cols-3">
          {columns.map((column) => (
            <KanbanColumn
              key={column.key}
              status={column.key}
              title={column.title}
              count={tasksByStatus[column.key]?.length || 0}
            >
              {tasksByStatus[column.key]?.map((task) => (
                <TaskCard key={task.id} task={task} onClick={() => openTask(task.id)} />
              ))}
            </KanbanColumn>
          ))}
        </section>
        <DragOverlay>
          {activeTask ? (
            <div className="rounded-lg border border-teal-300 bg-white p-3 text-sm font-semibold shadow-lg dark:border-teal-500 dark:bg-zinc-950">
              {activeTask.title}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/60 px-4">
          <form onSubmit={createTask} className="w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Task</h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">Title</span>
                <input
                  value={taskForm.title}
                  onChange={(event) => setTaskForm((current) => ({ ...current, title: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">Description</span>
                <textarea
                  value={taskForm.description}
                  onChange={(event) => setTaskForm((current) => ({ ...current, description: event.target.value }))}
                  className="mt-1 min-h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Assignee</span>
                <select
                  value={taskForm.assignedTo}
                  onChange={(event) => setTaskForm((current) => ({ ...current, assignedTo: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="">Unassigned</option>
                  {project?.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Priority</span>
                <select
                  value={taskForm.priority}
                  onChange={(event) => setTaskForm((current) => ({ ...current, priority: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">Deadline</span>
                <input
                  type="datetime-local"
                  value={taskForm.deadline}
                  onChange={(event) => setTaskForm((current) => ({ ...current, deadline: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
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

      {detail ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/60 px-4">
          <section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-zinc-200 bg-white p-5 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{detail.title}</h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{detail.description || 'No description'}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Status</p>
                <p className="mt-1 text-sm font-semibold">{detail.status}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Priority</p>
                <p className="mt-1 text-sm font-semibold">{detail.priority}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Assignee</p>
                <p className="mt-1 text-sm font-semibold">{detail.assigneeName || 'Unassigned'}</p>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-semibold">Activity Log</h3>
              <div className="mt-3 space-y-2">
                {detail.activityLog.map((item) => (
                  <div key={`${item.action}-${item.at}`} className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                    <p className="text-sm">{item.action}</p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{new Date(item.at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

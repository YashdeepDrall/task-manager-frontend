import { useDraggable } from '@dnd-kit/core';
import { CalendarClock } from 'lucide-react';

const priorityClass = {
  high: 'bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-200',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200',
  low: 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200'
};

function isOverdue(deadline, status) {
  return deadline && status !== 'done' && new Date(deadline) < new Date();
}

export default function TaskCard({ task, onClick }) {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    id: task.id,
    data: { task }
  });
  const overdue = isOverdue(task.deadline, task.status);

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border border-zinc-200 bg-white p-3 text-left shadow-sm transition hover:border-teal-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-teal-500 ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-sm font-semibold leading-5">{task.title}</h3>
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${priorityClass[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">{task.description || 'No description'}</p>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="truncate">{task.assigneeName || 'Unassigned'}</span>
        {task.deadline ? (
          <span className={`flex items-center gap-1 ${overdue ? 'font-semibold text-rose-600 dark:text-rose-300' : ''}`}>
            <CalendarClock className="h-3.5 w-3.5" />
            {new Date(task.deadline).toLocaleDateString()}
          </span>
        ) : null}
      </div>
    </button>
  );
}

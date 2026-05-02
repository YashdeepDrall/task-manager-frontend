import { useDroppable } from '@dnd-kit/core';

export default function KanbanColumn({ children, count, status, title }) {
  const { isOver, setNodeRef } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={`flex min-h-[26rem] flex-col rounded-lg border border-zinc-200 bg-zinc-100/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/70 ${
        isOver ? 'ring-2 ring-teal-500' : ''
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300">
          {count}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3">{children}</div>
    </section>
  );
}

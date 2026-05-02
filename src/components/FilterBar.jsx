import { Search } from 'lucide-react';

export default function FilterBar({
  assignee,
  members,
  overdueOnly,
  priority,
  search,
  setAssignee,
  setOverdueOnly,
  setPriority,
  setSearch
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-zinc-200 bg-white p-3 md:grid-cols-[1fr_11rem_10rem_auto] dark:border-zinc-800 dark:bg-zinc-900">
      <label className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          placeholder="Search tasks"
        />
      </label>
      <select
        value={assignee}
        onChange={(event) => setAssignee(event.target.value)}
        className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      >
        <option value="">All assignees</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
      <select
        value={priority}
        onChange={(event) => setPriority(event.target.value)}
        className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
      >
        <option value="">All priority</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
      <label className="flex h-10 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm dark:border-zinc-700">
        <input
          type="checkbox"
          checked={overdueOnly}
          onChange={(event) => setOverdueOnly(event.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-teal-600"
        />
        Overdue only
      </label>
    </div>
  );
}

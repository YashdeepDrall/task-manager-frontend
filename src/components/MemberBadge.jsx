export default function MemberBadge({ member, onRemove, removable }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-100 text-sm font-semibold text-teal-700 dark:bg-teal-400/15 dark:text-teal-200">
          {member.name?.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{member.name}</p>
          <p className="text-xs capitalize text-zinc-500 dark:text-zinc-400">{member.role}</p>
        </div>
      </div>
      {removable ? (
        <button
          type="button"
          onClick={() => onRemove(member.id)}
          className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 dark:border-rose-400/30 dark:text-rose-200 dark:hover:bg-rose-400/10"
        >
          Remove
        </button>
      ) : null}
    </div>
  );
}

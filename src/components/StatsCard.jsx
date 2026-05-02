export default function StatsCard({ icon: Icon, label, tone = 'teal', value }) {
  const tones = {
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-200',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-200',
    sky: 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200',
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-200'
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-normal">{value}</p>
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

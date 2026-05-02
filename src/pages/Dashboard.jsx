import { AlertTriangle, CheckCircle2, Clock3, ListChecks } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import api, { getApiError } from '../api/axios';
import StatsCard from '../components/StatsCard';

const statusColors = {
  todo: '#0ea5e9',
  'in-progress': '#f59e0b',
  done: '#14b8a6'
};

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/dashboard')
      .then((response) => {
        setDashboard(response.data);
        setError('');
      })
      .catch((apiError) => setError(getApiError(apiError, 'Unable to load dashboard')))
      .finally(() => setLoading(false));
  }, []);

  const statusData = useMemo(() => {
    if (!dashboard) {
      return [];
    }
    return Object.entries(dashboard.tasksByStatus).map(([name, value]) => ({ name, value }));
  }, [dashboard]);

  if (loading) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading dashboard</p>;
  }

  if (error) {
    return <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-normal">Dashboard</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Current project and task workload</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon={ListChecks} label="Total Tasks" value={dashboard.totalTasks} tone="teal" />
        <StatsCard icon={CheckCircle2} label="Completed" value={dashboard.completedTasks} tone="sky" />
        <StatsCard icon={Clock3} label="Pending" value={dashboard.pendingTasks} tone="amber" />
        <StatsCard icon={AlertTriangle} label="Overdue" value={dashboard.overdueTasks} tone="rose" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Task Status</h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{dashboard.totalProjects} projects</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={statusColors[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold">Priority Mix</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(dashboard.tasksByPriority).map(([name, value]) => ({ name, value }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                >
                  <Cell fill="#0ea5e9" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#e11d48" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold">Upcoming Deadlines</h2>
          <div className="space-y-3">
            {dashboard.upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No upcoming deadlines</p>
            ) : (
              dashboard.upcomingDeadlines.map((task) => (
                <div key={task.id} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{task.assigneeName || 'Unassigned'}</p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-amber-700 dark:text-amber-200">
                    {new Date(task.deadline).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold">Recent Activity</h2>
          <div className="space-y-3">
            {dashboard.recentActivity.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No recent activity</p>
            ) : (
              dashboard.recentActivity.map((item) => (
                <div key={`${item.taskId}-${item.at}`} className="rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.taskTitle} · {new Date(item.at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

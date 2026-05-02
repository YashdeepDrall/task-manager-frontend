import { ClipboardCheck, FolderKanban, LayoutDashboard, LogOut, Moon, Sun } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navLinkClass = ({ isActive }) =>
  [
    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive
      ? 'bg-teal-600 text-white'
      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white'
  ].join(' ');

export default function Navbar() {
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-base font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-teal-600 text-white">
              <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            Task Management
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 lg:hidden dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink to="/projects" className={navLinkClass}>
            <FolderKanban className="h-4 w-4" />
            Projects
          </NavLink>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800">
            <span className="text-sm font-medium">{user?.name}</span>
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-400/15 dark:text-amber-200">
              {user?.role}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden h-9 w-9 place-items-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 lg:grid dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

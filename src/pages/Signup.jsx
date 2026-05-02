import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { getApiError } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (form.name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (!emailPattern.test(form.email)) {
      setError('Enter a valid email address');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signup({ ...form, name: form.name.trim() });
      navigate('/dashboard');
    } catch (apiError) {
      setError(getApiError(apiError, 'Unable to create account'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Create account</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Start with the right role</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Name</span>
            <input
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              autoComplete="email"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Role</span>
            <select
              value={form.role}
              onChange={(event) => updateField('role', event.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <div className="mt-1 flex h-11 rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                className="h-full min-w-0 flex-1 rounded-lg border-0 bg-transparent px-3 text-sm focus:ring-0"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="grid w-11 place-items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-200">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Create account
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}

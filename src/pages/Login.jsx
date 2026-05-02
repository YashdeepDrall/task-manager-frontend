import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { getApiError } from '../api/axios';
import { useAuth } from '../context/AuthContext';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!emailPattern.test(email)) {
      setError('Enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (apiError) {
      setError(getApiError(apiError, 'Unable to sign in'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Sign in</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Open your project workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <div className="mt-1 flex h-11 rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-full min-w-0 flex-1 rounded-lg border-0 bg-transparent px-3 text-sm focus:ring-0"
                autoComplete="current-password"
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
            Sign in
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Need an account?{' '}
          <Link to="/signup" className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}

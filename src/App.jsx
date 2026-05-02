import { Navigate, Outlet, Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import Signup from './pages/Signup';
import TaskBoard from './pages/TaskBoard';

function AppShell() {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-zinc-50 text-sm text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300">
        Loading workspace
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-zinc-50 text-sm text-zinc-600 dark:bg-zinc-950 dark:text-zinc-300">
        Loading workspace
      </div>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:projectId" element={<ProjectDetail />} />
          <Route path="/projects/:projectId/board" element={<TaskBoard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

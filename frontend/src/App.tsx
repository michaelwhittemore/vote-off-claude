import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Vote } from './pages/Vote';
import { Results } from './pages/Results';
import { Dashboard } from './pages/Dashboard';
import { NewBracket } from './pages/NewBracket';
import { Manage } from './pages/Manage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Landing } from './pages/Landing';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/brackets/new" element={<ProtectedRoute><NewBracket /></ProtectedRoute>} />
          <Route path="/b/:slug/manage" element={<ProtectedRoute><Manage /></ProtectedRoute>} />
          <Route path="/b/:slug" element={<Vote />} />
          <Route path="/b/:slug/results" element={<Results />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

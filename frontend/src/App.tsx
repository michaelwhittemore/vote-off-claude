import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Vote } from './pages/Vote';
import { Results } from './pages/Results';
import { Dashboard } from './pages/Dashboard';
import { NewBracket } from './pages/NewBracket';
import { Manage } from './pages/Manage';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/brackets/new" element={<NewBracket />} />
          <Route path="/b/:slug" element={<Vote />} />
          <Route path="/b/:slug/results" element={<Results />} />
          <Route path="/b/:slug/manage" element={<Manage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

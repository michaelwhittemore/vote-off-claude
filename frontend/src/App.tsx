import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Vote } from './pages/Vote';
import { Results } from './pages/Results';

const queryClient = new QueryClient();
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/b/:slug" element={<Vote />} />
          <Route path="/b/:slug/results" element={<Results />} />
          <Route path="*" element={<Navigate to="/b/mock" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

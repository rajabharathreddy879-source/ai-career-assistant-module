import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/lib/auth-context';
import { AuthGuard } from '@/components/AuthGuard';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Chat from '@/pages/Chat';
import Resumes from '@/pages/Resumes';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      <Route path="/dashboard">
        {() => (
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        )}
      </Route>

      <Route path="/chat">
        {() => (
          <AuthGuard>
            <Chat />
          </AuthGuard>
        )}
      </Route>

      <Route path="/resumes">
        {() => (
          <AuthGuard>
            <Resumes />
          </AuthGuard>
        )}
      </Route>

      <Route path="/reports">
        {() => (
          <AuthGuard>
            <Reports />
          </AuthGuard>
        )}
      </Route>

      <Route path="/settings">
        {() => (
          <AuthGuard>
            <Settings />
          </AuthGuard>
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, '') : ''}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

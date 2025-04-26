import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';

import Layout from '@/components/Layout';
import KanbanBoard from '@/components/KanbanBoard';
import LoginPage from '@/pages/LoginPage';
import UsersPage from '@/pages/UsersPage';
import DashboardPage from '@/pages/DashboardPage';
import PublicBoardPage from '@/pages/PublicBoardPage';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';

// Create a client for React Query
const queryClient = new QueryClient();

// Create theme using Upen.AI brand colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#1B1F3B', // Midnight Blue - Primary (text, accents)
      light: '#30365B',
      dark: '#13172A',
    },
    secondary: {
      main: '#4DC8F0', // Sky Blue - Accent/highlight
      light: '#7AD8F5',
      dark: '#29AFDC',
    },
    background: {
      default: '#F5F7FA', // Very Light Gray - Background
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333', // Charcoal - Body text
      secondary: '#666666',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#FFC107', // Amber - CTA buttons (if needed)
    },
    info: {
      main: '#4DC8F0', // Sky Blue
    },
    success: {
      main: '#10B981',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          padding: '8px 16px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
});

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { fetchUser, isAuthenticated } = useAuthStore();
  const { fetchTasksByWeek, currentWeek, currentYear } = useTaskStore();
  
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  
  useEffect(() => {
    if (isAuthenticated && currentWeek && currentYear) {
      fetchTasksByWeek(currentWeek, currentYear);
    }
  }, [fetchTasksByWeek, currentWeek, currentYear, isAuthenticated]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/tasks" 
                element={
                  <ProtectedRoute>
                    <KanbanBoard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/public" 
                element={
                  <ProtectedRoute>
                    <PublicBoardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/users" 
                element={
                  <ProtectedRoute>
                    <UsersPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/fr';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import JobOffersList from './pages/job-offers/JobOffersList';
import JobOfferDetails from './pages/job-offers/JobOfferDetails';
import JobOfferForm from './pages/job-offers/JobOfferForm';
import ApplicationsList from './pages/applications/ApplicationsList';
import ApplicationDetails from './pages/applications/ApplicationDetails';
import NotFound from './pages/NotFound';

// Layouts
import MainLayout from './components/layouts/MainLayout';

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Protected route component
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Show loading if auth state is still being determined
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if role requirement is met (if specified)
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Auth routes - available only when NOT authenticated */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Protected routes - require authentication */}
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
                {/* Dashboard - common to all users */}
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Job offers routes */}
                <Route path="job-offers">
                  <Route index element={<JobOffersList />} />
                  <Route path=":id" element={<JobOfferDetails />} />
                  <Route path="new" element={
                    <ProtectedRoute requiredRole="recruiter">
                      <JobOfferForm />
                    </ProtectedRoute>
                  } />
                  <Route path=":id/edit" element={
                    <ProtectedRoute requiredRole="recruiter">
                      <JobOfferForm />
                    </ProtectedRoute>
                  } />
                </Route>
                
                {/* Applications routes */}
                <Route path="applications">
                  <Route index element={<ApplicationsList />} />
                  <Route path=":id" element={<ApplicationDetails />} />
                </Route>
              </Route>
              
              {/* 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
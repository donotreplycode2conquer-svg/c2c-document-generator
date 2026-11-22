import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AdminLayout from './layouts/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import GenerateOfferLetterPage from './pages/GenerateOfferLetterPage';
import GenerateCertificatePage from './pages/GenerateCertificatePage';
import IssuedCertificatesPage from './pages/IssuedCertificatesPage';
import DocumentHistoryPage from './pages/DocumentHistoryPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-navy-900 border-t-gold-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Initializing Code2Conquer Portal...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="generate-offer-letter" element={<GenerateOfferLetterPage />} />
            <Route path="generate-certificate" element={<GenerateCertificatePage />} />
            <Route path="issued-certificates" element={<IssuedCertificatesPage />} />
            <Route path="document-history" element={<DocumentHistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MenuPage from './pages/MenuPage';
import KitchenPage from './pages/KitchenPage';
import AdminPage from './pages/AdminPage';
import FeedbackPage from './pages/FeedbackPage';

// Giriş yapmadan korumalı sayfaya erişilemesin
function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />

          <Route path="/dashboard" element={
            <PrivateRoute><DashboardPage /></PrivateRoute>
          } />

          <Route path="/kitchen" element={
            <PrivateRoute roles={['KITCHEN', 'ADMIN']}>
              <KitchenPage />
            </PrivateRoute>
          } />

          <Route path="/admin" element={
            <PrivateRoute roles={['ADMIN']}>
              <AdminPage />
            </PrivateRoute>
          } />

          {/* Anasayfaya girilirse dashboard'a yönlendir */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

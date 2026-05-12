import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage      from './pages/LoginPage';
import DashboardPage  from './pages/DashboardPage';
import MenuPage       from './pages/MenuPage';
import KitchenPage    from './pages/KitchenPage';
import AdminPage      from './pages/AdminPage';
import FeedbackPage   from './pages/FeedbackPage';
import ReservationsPage from './pages/ReservationsPage';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return null; // ← localStorage okunana kadar bekle, login'e gitme

  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/menu"     element={<MenuPage />} />
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

          <Route path="/reservations" element={
            <PrivateRoute roles={['ADMIN', 'WAITER']}>
              <ReservationsPage />
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

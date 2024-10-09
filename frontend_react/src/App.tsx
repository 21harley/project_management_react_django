import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/authContext';
import Register from './pages/register';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import ProtectedRoute from './components/protectedRoute/protectedRoute';

const App = () => {
  return (
    <AuthProvider>
      <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Otras rutas */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
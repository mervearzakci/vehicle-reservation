import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './Pages/LoginPage';
import CompanyPanel from './Pages/CompanyPanel';
import AdminPanel from './Pages/AdminPanel';
import AddVehicle from './Pages/AddVehicle';
import AdminRegisterVerify from './Pages/AdminRegisterVerify';
import ForgotPasswordPage from './Pages/ForgotPasswordPage';

function App() {
  const isLoggedIn = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/add-vehicle" element={<AddVehicle />} />
        <Route path="/register-admin" element={<AdminRegisterVerify />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route
          path="/company"
          element={
            isLoggedIn && role === 'User' ? <CompanyPanel /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/admin"
          element={
            isLoggedIn && role === 'Admin' ? <AdminPanel /> : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/"
          element={
            isLoggedIn
              ? role === 'Admin'
                ? <Navigate to="/admin" replace />
                : <Navigate to="/company" replace />
              : <Navigate to="/login" replace />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    
  );
}

export default App;

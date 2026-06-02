import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage   from './pages/LoginPage';
import Dashboard   from './pages/Dashboard';
import AdminPanel  from './pages/AdminPanel';
import './App.css';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={
                        <ProtectedRoute requiredRole="USER">
                            <Dashboard />
                        </ProtectedRoute>
                    }/>
                    <Route path="/admin" element={
                        <ProtectedRoute requiredRole="ADMIN">
                            <AdminPanel />
                        </ProtectedRoute>
                    }/>
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

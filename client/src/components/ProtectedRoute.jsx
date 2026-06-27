import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🏥</div>
        <div style={{ fontSize: 14, color: '#64748b' }}>Loading...</div>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
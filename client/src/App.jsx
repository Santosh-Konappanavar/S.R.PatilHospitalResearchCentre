import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Patients from './pages/Patients';
import OPD from './pages/OPD';
import IPD from './pages/IPD';
import Staff from './pages/Staff';
import PurchaseOrders from './pages/PurchaseOrders';
import Licenses from './pages/Licenses';
import Updates from './pages/Upadates';
import Users from './pages/Users';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="departments" element={<Departments />} />
            <Route path="patients" element={<Patients />} />
            <Route path="opd" element={<OPD />} />
            <Route path="ipd" element={<IPD />} />
            <Route path="staff" element={<Staff />} />
            <Route path="purchase" element={<PurchaseOrders />} />
            <Route path="licenses" element={<Licenses />} />
            <Route path="updates" element={<Updates />} />
            <Route path="users" element={<Users />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
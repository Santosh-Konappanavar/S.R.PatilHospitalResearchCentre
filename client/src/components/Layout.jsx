import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const TITLES = {
  '/dashboard':   'Dashboard',
  '/departments': 'Departments',
  '/patients':    'Patients',
  '/opd':         'OPD — Outpatient',
  '/ipd':         'IPD — Inpatient',
  '/staff':       'Staff Management',
  '/purchase':    'Purchase Orders',
  '/licenses':    'Licenses & Renewals',
  '/updates':     'Hospital Updates',
  '/users':       'User Management',
};

export default function Layout() {
  const { pathname } = useLocation();
  const title = TITLES[pathname] || '';

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: 248, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar title={title} />
        <main style={{ flex: 1, padding: 24, background: '#f0f4f8' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
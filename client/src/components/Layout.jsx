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
    <div className="srp-canvas" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{
        marginLeft: 'var(--sidebar-w)', flex: 1,
        display: 'flex', flexDirection: 'column',
        minHeight: '100vh',
        minWidth: 0,
      }}>
        <Navbar title={title} />
        <main style={{
          flex: 1,
          padding: '28px 32px 48px',
          maxWidth: 'var(--content-max)',
          width: '100%',
          margin: '0 auto',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
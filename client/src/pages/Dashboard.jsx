import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function DepartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dept, setDept] = useState(null);
  const [staff, setStaff] = useState([]);
  const [opd, setOpd] = useState([]);
  const [ipd, setIpd] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/departments/${id}`),
      api.get(`/staff?department=${id}&limit=50`).catch(() => ({ data: { staff: [] } })),
      api.get(`/opd?department=${id}&limit=10`).catch(() => ({ data: { visits: [] } })),
      api.get(`/ipd?department=${id}&limit=10`).catch(() => ({ data: { admissions: [] } })),
    ]).then(([d, s, o, i]) => {
      setDept(d.data);
      setStaff(s.data.staff || []);
      setOpd(o.data.visits || []);
      setIpd(i.data.admissions || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ color: '#4a6080' }}>Loading...</p>;
  if (!dept) return <p>Department not found.</p>;

  const tabs = ['overview', 'staff', 'opd', 'ipd'];
  const tabStyle = (t) => ({
    padding: '9px 18px', border: 'none', background: tab === t ? '#1a3a5c' : '#f0f3f8',
    color: tab === t ? '#fff' : '#4a6080', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13
  });

  const statuses = { Active: '#27ae60', 'On Leave': '#f39c12', Inactive: '#e74c3c' };
  const roleColors = { Doctor: '#3498db', Nurse: '#27ae60', Technician: '#9b59b6', Admin: '#c8873a', Pharmacist: '#16a085' };

  return (
    <div>
      {/* Back + Header */}
      <button onClick={() => navigate('/departments')} style={{ background: 'none', border: 'none', color: '#2563a8', cursor: 'pointer', fontSize: 13, marginBottom: 14, fontWeight: 600 }}>
        ← Back to Departments
      </button>

      <div style={{ background: dept.color || '#1a3a5c', borderRadius: 12, padding: '22px 24px', color: '#fff', marginBottom: 22 }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>🏥</div>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>{dept.name}</h2>
        <p style={{ opacity: 0.8, fontSize: 13, marginTop: 4 }}>{dept.code} {dept.description ? `— ${dept.description}` : ''}</p>
        <div style={{ display: 'flex', gap: 24, marginTop: 14, flexWrap: 'wrap' }}>
          {dept.headDoctor && <div style={{ fontSize: 13 }}>👨‍⚕️ {dept.headDoctor}</div>}
          {dept.location   && <div style={{ fontSize: 13 }}>📍 {dept.location}</div>}
          {dept.phone      && <div style={{ fontSize: 13 }}>📞 {dept.phone}</div>}
          {dept.totalBeds > 0 && <div style={{ fontSize: 13 }}>🛏️ {dept.totalBeds} beds</div>}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 22 }}>
        {[
          { label: 'Total Staff', value: staff.length },
          { label: 'Active Staff', value: staff.filter(s => s.status === 'Active').length },
          { label: "Today's OPD", value: opd.length },
          { label: 'Current IPD', value: ipd.filter(i => i.status === 'Admitted').length },
        ].map(m => (
          <div key={m.label} style={{ background: '#fff', border: '1px solid #e4e9f2', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1a3a5c' }}>{m.value}</div>
            <div style={{ fontSize: 12, color: '#8a9fb8', marginTop: 3 }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {tabs.map(t => <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{t.toUpperCase()}</button>)}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div style={{ background: '#fff', border: '1px solid #e4e9f2', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: '#1a3a5c' }}>Department Details</h3>
          {[
            ['Name', dept.name], ['Code', dept.code], ['Head Doctor', dept.headDoctor || '—'],
            ['Location', dept.location || '—'], ['Phone', dept.phone || '—'],
            ['Total Beds', dept.totalBeds || 0], ['Description', dept.description || '—'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 16, padding: '9px 0', borderBottom: '1px solid #f0f3f8' }}>
              <div style={{ width: 130, fontSize: 13, color: '#8a9fb8', fontWeight: 600, flexShrink: 0 }}>{k}</div>
              <div style={{ fontSize: 13 }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Staff Tab */}
      {tab === 'staff' && (
        <div style={{ background: '#fff', border: '1px solid #e4e9f2', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f3f8' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a3a5c' }}>Staff — {dept.name} ({staff.length})</h3>
          </div>
          {staff.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#8a9fb8' }}>No staff records found for this department.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ background: '#f8f9fb' }}>
                <tr>{['ID','Name','Role','Qualification','Shift','Status'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#8a9fb8', textTransform: 'uppercase' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s._id} style={{ borderTop: '1px solid #f0f3f8' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1a3a5c' }}>{s.employeeId}</td>
                    <td style={{ padding: '10px 14px' }}>{s.name}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: roleColors[s.role] + '22', color: roleColors[s.role] || '#666', padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{s.role}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#4a6080' }}>{s.qualification || '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#4a6080' }}>{s.shift}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: (statuses[s.status] || '#999') + '22', color: statuses[s.status] || '#999', padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* OPD Tab */}
      {tab === 'opd' && (
        <div style={{ background: '#fff', border: '1px solid #e4e9f2', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f3f8' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a3a5c' }}>Recent OPD Visits ({opd.length})</h3>
          </div>
          {opd.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#8a9fb8' }}>No OPD records found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ background: '#f8f9fb' }}>
                <tr>{['Visit ID','Patient','Doctor','Date','Status'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#8a9fb8', textTransform: 'uppercase' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {opd.map(v => (
                  <tr key={v._id} style={{ borderTop: '1px solid #f0f3f8' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1a3a5c' }}>{v.visitId}</td>
                    <td style={{ padding: '10px 14px' }}>{v.patientName || v.patient?.firstName}</td>
                    <td style={{ padding: '10px 14px' }}>{v.doctor}</td>
                    <td style={{ padding: '10px 14px', color: '#4a6080' }}>{new Date(v.visitDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: v.status === 'Done' ? '#d6f0e4' : '#fef3e2', color: v.status === 'Done' ? '#27ae60' : '#c87a00', padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{v.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* IPD Tab */}
      {tab === 'ipd' && (
        <div style={{ background: '#fff', border: '1px solid #e4e9f2', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #f0f3f8' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a3a5c' }}>IPD Admissions ({ipd.length})</h3>
          </div>
          {ipd.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#8a9fb8' }}>No IPD records found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ background: '#f8f9fb' }}>
                <tr>{['Admission ID','Patient','Doctor','Ward/Bed','Admit Date','Status'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#8a9fb8', textTransform: 'uppercase' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {ipd.map(a => (
                  <tr key={a._id} style={{ borderTop: '1px solid #f0f3f8' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1a3a5c' }}>{a.admissionId}</td>
                    <td style={{ padding: '10px 14px' }}>{a.patientName}</td>
                    <td style={{ padding: '10px 14px' }}>{a.admittingDoctor}</td>
                    <td style={{ padding: '10px 14px', color: '#4a6080' }}>{a.ward} {a.bedNumber ? `/ Bed ${a.bedNumber}` : ''}</td>
                    <td style={{ padding: '10px 14px', color: '#4a6080' }}>{new Date(a.admissionDate).toLocaleDateString('en-IN')}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: a.status === 'Admitted' ? '#dce8f8' : '#d6f0e4', color: a.status === 'Admitted' ? '#1a3a5c' : '#27ae60', padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
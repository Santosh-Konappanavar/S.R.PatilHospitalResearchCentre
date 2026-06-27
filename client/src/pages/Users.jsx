import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const PERMS = [
  ['canViewOPD','OPD'],['canViewIPD','IPD'],['canViewStaff','Staff'],
  ['canViewReports','Reports'],['canViewPurchase','Purchase'],['canPostUpdates','Post Updates']
];

export default function Users() {
  // ✅ ALL hooks must come first — before any conditional returns
  const { isAdmin } = useAuth();

  const [users, setUsers] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name:'', username:'', password:'', department:'', departmentName:'', email:'', phone:'',
    permissions: { canViewOPD:false, canViewIPD:false, canViewStaff:false, canViewReports:false, canViewPurchase:false, canPostUpdates:true }
  });

  const load = () => {
    Promise.all([api.get('/users'), api.get('/departments')]).then(([u, d]) => {
      setUsers(u.data); setDepts(d.data); setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(load, []);

  // ✅ Guard comes AFTER all hooks
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', { ...form, role: 'department' });
      toast.success('Department user created'); setShowAdd(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const toggle = async (id) => {
    try { await api.put(`/users/${id}/toggle`); load(); toast.success('Status updated'); }
    catch { toast.error('Error'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await api.delete(`/users/${id}`); load(); toast.success('Deleted'); }
    catch { toast.error('Error'); }
  };

  const updatePerm = async (id, perms) => {
    try { await api.put(`/users/${id}/permissions`, perms); load(); toast.success('Permissions updated'); }
    catch { toast.error('Error'); }
  };

  if (loading) return <div style={{ padding: 40, color: '#64748b', textAlign: 'center' }}>Loading...</div>;

  const inp = { width:'100%', padding:'10px 12px', border:'1.5px solid #e2e8f0', borderRadius:8, fontSize:13, outline:'none', background:'#f8fafc' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, color:'#0d2137' }}>User Management</h2>
          <p style={{ fontSize:13, color:'#64748b', marginTop:2 }}>{users.length} department users</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding:'10px 20px', background:'#2563eb', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer' }}>
          + Add Department User
        </button>
      </div>

      {showAdd && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.4)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#fff', borderRadius:16, padding:28, width:520, maxHeight:'90vh', overflowY:'auto' }}>
            <h3 style={{ fontSize:16, fontWeight:800, marginBottom:20 }}>Add Department User</h3>
            <form onSubmit={handleAdd}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
                <div><label style={{ fontSize:12, fontWeight:600, color:'#374151' }}>Full Name</label><input required style={inp} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
                <div><label style={{ fontSize:12, fontWeight:600, color:'#374151' }}>Username</label><input required style={inp} value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value}))} /></div>
                <div><label style={{ fontSize:12, fontWeight:600, color:'#374151' }}>Password</label><input required type="password" style={inp} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} /></div>
                <div><label style={{ fontSize:12, fontWeight:600, color:'#374151' }}>Department</label>
                  <select required style={inp} value={form.department} onChange={e => {
                    const d = depts.find(x=>x._id===e.target.value);
                    setForm(p=>({...p,department:e.target.value,departmentName:d?.name||''}));
                  }}>
                    <option value="">Select department</option>
                    {depts.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div><label style={{ fontSize:12, fontWeight:600, color:'#374151' }}>Email</label><input type="email" style={inp} value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} /></div>
                <div><label style={{ fontSize:12, fontWeight:600, color:'#374151' }}>Phone</label><input style={inp} value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} /></div>
              </div>
              <div style={{ marginBottom:18 }}>
                <label style={{ fontSize:12, fontWeight:600, color:'#374151', marginBottom:8, display:'block' }}>Permissions</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {PERMS.map(([key,label])=>(
                    <label key={key} style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, cursor:'pointer' }}>
                      <input type="checkbox" checked={form.permissions[key]} onChange={e=>setForm(p=>({...p,permissions:{...p.permissions,[key]:e.target.checked}}))} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setShowAdd(false)} style={{ padding:'9px 20px', border:'1.5px solid #e2e8f0', borderRadius:8, background:'#fff', fontSize:13, cursor:'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding:'9px 20px', background:'#2563eb', color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' }}>Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {users.map(u => (
          <div key={u._id} style={{ background:'#fff', borderRadius:12, padding:'16px 20px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
            <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,#0d2137,#2563eb)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:16, flexShrink:0 }}>
              {u.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex:1, minWidth:180 }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#0d2137' }}>{u.name}</div>
              <div style={{ fontSize:12, color:'#64748b' }}>@{u.username} · {u.departmentName}</div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {PERMS.filter(([k])=>u.permissions?.[k]).map(([k,l])=>(
                <span key={k} style={{ fontSize:10, fontWeight:700, background:'#eff6ff', color:'#2563eb', padding:'3px 8px', borderRadius:20 }}>{l}</span>
              ))}
            </div>
            <span style={{ fontSize:11, fontWeight:700, padding:'4px 12px', borderRadius:20, background:u.isActive?'#d1fae5':'#fee2e2', color:u.isActive?'#059669':'#ef4444' }}>
              {u.isActive ? 'Active' : 'Inactive'}
            </span>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={()=>toggle(u._id)} style={{ padding:'6px 12px', border:'1.5px solid #e2e8f0', borderRadius:7, fontSize:12, background:'#fff', cursor:'pointer' }}>
                {u.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={()=>del(u._id)} style={{ padding:'6px 12px', border:'1.5px solid #fecaca', borderRadius:7, fontSize:12, background:'#fff', color:'#ef4444', cursor:'pointer' }}>Delete</button>
            </div>
          </div>
        ))}
        {users.length === 0 && <div style={{ textAlign:'center', padding:60, color:'#64748b' }}>No department users found. Add one to get started.</div>}
      </div>
    </div>
  );
}
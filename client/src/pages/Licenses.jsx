import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const lbl={display:'block',fontSize:12,fontWeight:600,color:'#4a6080',marginBottom:5};
const inp={width:'100%',padding:'9px 11px',border:'1px solid #d1d9e6',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'};
const stColors={Active:'#27ae60',Pending:'#f39c12',Expired:'#e74c3c'};
const emptyForm={name:'',authority:'',licenseNo:'',issueDate:'',expiryDate:'',responsible:'',notes:''};

export default function Licenses() {
  const [licenses,setLicenses]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState(emptyForm);
  const [editing,setEditing]=useState(null);
  const [saving,setSaving]=useState(false);

  const load=()=>{ api.get('/licenses').then(r=>{setLicenses(r.data);setLoading(false);}).catch(()=>setLoading(false)); };
  useEffect(load,[]);

  const openEdit=(l)=>{
    setForm({name:l.name,authority:l.authority,licenseNo:l.licenseNo,issueDate:l.issueDate?.split('T')[0]||'',expiryDate:l.expiryDate?.split('T')[0]||'',responsible:l.responsible||'',notes:l.notes||''});
    setEditing(l._id);setShowForm(true);
  };

  const save=async(e)=>{
    e.preventDefault();
    if(!form.name||!form.authority||!form.licenseNo||!form.issueDate||!form.expiryDate)return toast.error('All required fields missing');
    setSaving(true);
    try{
      if(editing){await api.put(`/licenses/${editing}`,form);toast.success('License updated');}
      else{await api.post('/licenses',form);toast.success('License added');}
      setShowForm(false);setEditing(null);load();
    }catch(err){toast.error(err.response?.data?.message||'Error');}
    finally{setSaving(false);}
  };

  const del=async(id,name)=>{
    if(!window.confirm(`Delete license "${name}"?`))return;
    try{await api.delete(`/licenses/${id}`);toast.success('Deleted');load();}
    catch(err){toast.error('Error deleting');}
  };

  const expired=licenses.filter(l=>l.status==='Expired').length;
  const pending=licenses.filter(l=>l.status==='Pending').length;
  const active=licenses.filter(l=>l.status==='Active').length;

  const daysLeft=(expiry)=>{
    const d=Math.ceil((new Date(expiry)-new Date())/(1000*60*60*24));
    return d;
  };

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700,color:'#1a3a5c'}}>📜 NMC & Licenses</h2>
          <p style={{fontSize:13,color:'#4a6080',marginTop:3}}>{licenses.length} certificates tracked</p>
        </div>
        <button onClick={()=>{setForm(emptyForm);setEditing(null);setShowForm(true);}} style={{background:'#1a3a5c',color:'#fff',border:'none',padding:'9px 18px',borderRadius:8,fontWeight:600,fontSize:13,cursor:'pointer'}}>+ Add License</button>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))',gap:12,marginBottom:18}}>
        {[{l:'Active',v:active,c:'#27ae60'},{l:'Renew Soon',v:pending,c:'#f39c12'},{l:'Expired',v:expired,c:'#e74c3c'}].map(s=>(
          <div key={s.l} style={{background:'#fff',border:'1px solid #e4e9f2',borderRadius:10,padding:'14px 16px',borderLeft:`4px solid ${s.c}`}}>
            <div style={{fontSize:11,fontWeight:600,color:'#8a9fb8',textTransform:'uppercase'}}>{s.l}</div>
            <div style={{fontSize:26,fontWeight:700,color:'#0f1e30',marginTop:3}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {expired>0&&<div style={{background:'#fee8e8',border:'1px solid #f5c6c6',borderLeft:'4px solid #e74c3c',borderRadius:10,padding:'12px 16px',marginBottom:12,fontSize:13}}>
        🚨 <strong>{expired} license(s) expired!</strong> Renew immediately to avoid legal issues.
      </div>}
      {pending>0&&<div style={{background:'#fef3e2',border:'1px solid #f9d4a0',borderLeft:'4px solid #f39c12',borderRadius:10,padding:'12px 16px',marginBottom:16,fontSize:13}}>
        ⚠️ <strong>{pending} license(s)</strong> expire within 90 days. Plan renewal.
      </div>}

      {/* Grid */}
      {loading?<p style={{color:'#8a9fb8'}}>Loading...</p>:(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
          {licenses.map(l=>{
            const days=daysLeft(l.expiryDate);
            return(
              <div key={l._id} style={{background:'#fff',border:`1px solid ${l.status==='Expired'?'#f5c6c6':l.status==='Pending'?'#f9d4a0':'#e4e9f2'}`,borderRadius:12,padding:'16px 18px',boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:'#0f1e30',marginBottom:3}}>{l.name}</div>
                    <div style={{fontSize:12,color:'#8a9fb8'}}>{l.authority} — {l.licenseNo}</div>
                  </div>
                  <span style={{background:(stColors[l.status]||'#999')+'22',color:stColors[l.status]||'#999',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700,flexShrink:0,marginLeft:8}}>{l.status}</span>
                </div>
                <div style={{display:'flex',gap:16,fontSize:12,color:'#4a6080',marginBottom:10}}>
                  <div><span style={{color:'#8a9fb8'}}>Issued: </span>{new Date(l.issueDate).toLocaleDateString('en-IN')}</div>
                  <div><span style={{color:'#8a9fb8'}}>Expires: </span>{new Date(l.expiryDate).toLocaleDateString('en-IN')}</div>
                </div>
                {days>0?<div style={{fontSize:12,fontWeight:600,color:days<30?'#e74c3c':days<90?'#f39c12':'#27ae60',marginBottom:8}}>
                  {days<90?`⏰ ${days} days remaining`:`✅ Valid for ${days} days`}
                </div>:<div style={{fontSize:12,fontWeight:700,color:'#e74c3c',marginBottom:8}}>🚨 EXPIRED {Math.abs(days)} days ago</div>}
                {l.responsible&&<div style={{fontSize:12,color:'#8a9fb8',marginBottom:10}}>Responsible: {l.responsible}</div>}
                {l.notes&&<div style={{fontSize:12,color:'#4a6080',background:'#f8f9fb',borderRadius:6,padding:'6px 10px',marginBottom:10}}>{l.notes}</div>}
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>openEdit(l)} style={{flex:1,background:'#eef1f7',border:'none',padding:'7px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer',color:'#2563a8'}}>Edit</button>
                  <button onClick={()=>del(l._id,l.name)} style={{flex:1,background:'#fee8e8',border:'none',padding:'7px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer',color:'#e74c3c'}}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:16}}>
          <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:520,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{padding:'18px 22px 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{fontSize:16,fontWeight:700,color:'#1a3a5c'}}>{editing?'Edit':'Add'} License / Certificate</h3>
              <button onClick={()=>setShowForm(false)} style={{background:'#f0f3f8',border:'none',borderRadius:8,width:30,height:30,fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <form onSubmit={save} style={{padding:22}}>
              <div style={{marginBottom:12}}><label style={lbl}>License / Certificate Name *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Hospital Registration" style={inp} required/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Issuing Authority *</label><input value={form.authority} onChange={e=>setForm({...form,authority:e.target.value})} placeholder="e.g. State Health Dept." style={inp} required/></div>
                <div><label style={lbl}>License Number *</label><input value={form.licenseNo} onChange={e=>setForm({...form,licenseNo:e.target.value})} placeholder="License/cert number" style={inp} required/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Issue Date *</label><input type="date" value={form.issueDate} onChange={e=>setForm({...form,issueDate:e.target.value})} style={inp} required/></div>
                <div><label style={lbl}>Expiry Date *</label><input type="date" value={form.expiryDate} onChange={e=>setForm({...form,expiryDate:e.target.value})} style={inp} required/></div>
              </div>
              <div style={{marginBottom:12}}><label style={lbl}>Responsible Person</label><input value={form.responsible} onChange={e=>setForm({...form,responsible:e.target.value})} placeholder="Who manages this license" style={inp}/></div>
              <div style={{marginBottom:16}}><label style={lbl}>Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={3} placeholder="Any additional notes..." style={{...inp,resize:'vertical'}}/></div>
              <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                <button type="button" onClick={()=>setShowForm(false)} style={{padding:'9px 18px',background:'#f0f3f8',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>Cancel</button>
                <button type="submit" disabled={saving} style={{padding:'9px 22px',background:'#1a3a5c',color:'#fff',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>{saving?'Saving...':editing?'Update':'Add License'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
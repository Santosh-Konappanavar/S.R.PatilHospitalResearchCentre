import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const typeColors={urgent:'#e74c3c',warning:'#f39c12',success:'#27ae60',info:'#3498db',general:'#1a3a5c'};
const typeEmoji={urgent:'🔴',warning:'⚠️',success:'✅',info:'📋',general:'📝'};
const typeBg={urgent:'#fee8e8',warning:'#fef3e2',success:'#d6f0e4',info:'#dce8f8',general:'#f0f3f8'};

export default function Updates() {
  const { user, isAdmin } = useAuth();
  const [updates,setUpdates]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({title:'',content:'',type:'general'});
  const [saving,setSaving]=useState(false);

  const load=()=>{
    api.get('/updates').then(r=>{setUpdates(r.data);setLoading(false);}).catch(()=>setLoading(false));
  };
  useEffect(load,[]);

  const save=async(e)=>{
    e.preventDefault();
    if(!form.title.trim()||!form.content.trim())return toast.error('Title and content required');
    setSaving(true);
    try{
      await api.post('/updates',form);
      toast.success('Update posted!');
      setShowForm(false);setForm({title:'',content:'',type:'general'});load();
    }catch(err){toast.error(err.response?.data?.message||'Error posting update');}
    finally{setSaving(false);}
  };

  const del=async(id)=>{
    if(!window.confirm('Remove this update?'))return;
    try{await api.delete(`/updates/${id}`);toast.success('Removed');load();}
    catch(err){toast.error('Error removing');}
  };

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22,flexWrap:'wrap',gap:10}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700,color:'#1a3a5c'}}>📋 Daily Updates</h2>
          <p style={{fontSize:13,color:'#4a6080',marginTop:3}}>
            {user?.role==='department'?`Posting as: ${user?.departmentName}`:'All hospital updates'}
          </p>
        </div>
        <button onClick={()=>setShowForm(true)} style={{background:'#1a3a5c',color:'#fff',border:'none',padding:'9px 18px',borderRadius:8,fontWeight:600,fontSize:13,cursor:'pointer'}}>+ Post Update</button>
      </div>

      {/* Info banner for dept users */}
      {user?.role==='department'&&(
        <div style={{background:'#e8f4fd',border:'1px solid #b3d7f0',borderRadius:10,padding:'12px 16px',marginBottom:18,fontSize:13,color:'#1a5276'}}>
          <strong>ℹ️ Department User:</strong> You can post updates for your department — <strong>{user?.departmentName}</strong>. All staff and admin will see your updates.
        </div>
      )}

      {loading?<p style={{color:'#8a9fb8'}}>Loading updates...</p>:
      updates.length===0?(
        <div style={{textAlign:'center',padding:'60px 20px',color:'#8a9fb8'}}>
          <div style={{fontSize:48,marginBottom:12}}>📋</div>
          <h3 style={{marginBottom:8}}>No updates yet</h3>
          <p style={{fontSize:13}}>Post the first update for today!</p>
        </div>
      ):(
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {updates.map(u=>(
            <div key={u._id} style={{background:'#fff',border:'1px solid #e4e9f2',borderLeft:`4px solid ${typeColors[u.type]||'#1a3a5c'}`,borderRadius:10,padding:'16px 18px',boxShadow:'0 1px 6px rgba(0,0,0,0.05)'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                    <span style={{background:typeBg[u.type]||'#f0f3f8',color:typeColors[u.type]||'#1a3a5c',padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>
                      {typeEmoji[u.type]} {u.type.toUpperCase()}
                    </span>
                    <span style={{fontSize:11,color:'#8a9fb8'}}>From: <strong>{u.departmentName||u.postedByName}</strong></span>
                    <span style={{fontSize:11,color:'#8a9fb8'}}>{new Date(u.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
                  </div>
                  <h3 style={{fontSize:15,fontWeight:700,color:'#0f1e30',marginBottom:6}}>{u.title}</h3>
                  <p style={{fontSize:13,color:'#4a6080',lineHeight:1.6,whiteSpace:'pre-wrap'}}>{u.content}</p>
                </div>
                {isAdmin&&(
                  <button onClick={()=>del(u._id)} style={{background:'#fee8e8',border:'none',padding:'5px 10px',borderRadius:6,fontSize:12,cursor:'pointer',color:'#e74c3c',fontWeight:600,flexShrink:0}}>Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Post Update Modal */}
      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:16}}>
          <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:520,boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{padding:'18px 22px 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{fontSize:16,fontWeight:700,color:'#1a3a5c'}}>Post Daily Update</h3>
              <button onClick={()=>setShowForm(false)} style={{background:'#f0f3f8',border:'none',borderRadius:8,width:30,height:30,fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <form onSubmit={save} style={{padding:22}}>
              <div style={{marginBottom:14}}>
                <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4a6080',marginBottom:5}}>Type</label>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {Object.entries(typeColors).map(([t,c])=>(
                    <button key={t} type="button" onClick={()=>setForm({...form,type:t})} style={{padding:'6px 14px',background:form.type===t?c:'#f0f3f8',color:form.type===t?'#fff':'#4a6080',border:'none',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer'}}>
                      {typeEmoji[t]} {t.charAt(0).toUpperCase()+t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:14}}>
                <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4a6080',marginBottom:5}}>Title *</label>
                <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Update title / heading..." style={{width:'100%',padding:'9px 11px',border:'1px solid #d1d9e6',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}} required/>
              </div>
              <div style={{marginBottom:16}}>
                <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4a6080',marginBottom:5}}>Details *</label>
                <textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows={5} placeholder="Write detailed update here..." style={{width:'100%',padding:'9px 11px',border:'1px solid #d1d9e6',borderRadius:8,fontSize:13,outline:'none',resize:'vertical',boxSizing:'border-box'}} required/>
              </div>
              <div style={{background:'#f0f3f8',borderRadius:8,padding:'10px 14px',marginBottom:16,fontSize:12,color:'#4a6080'}}>
                Posting as: <strong>{user?.departmentName||user?.name}</strong>
              </div>
              <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                <button type="button" onClick={()=>setShowForm(false)} style={{padding:'9px 18px',background:'#f0f3f8',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>Cancel</button>
                <button type="submit" disabled={saving} style={{padding:'9px 22px',background:typeColors[form.type]||'#1a3a5c',color:'#fff',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>{saving?'Posting...':'Post Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
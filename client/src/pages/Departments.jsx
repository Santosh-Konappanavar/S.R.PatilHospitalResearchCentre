import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const COLORS=['#1a3a5c','#e74c3c','#27ae60','#f39c12','#9b59b6','#3498db','#c8873a','#16a085','#2980b9','#e91e8c','#c0392b','#1abc9c'];
const lbl={display:'block',fontSize:12,fontWeight:600,color:'#4a6080',marginBottom:5};
const inp={width:'100%',padding:'9px 11px',border:'1px solid #d1d9e6',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'};
const emptyForm={name:'',code:'',description:'',headDoctor:'',location:'',phone:'',totalBeds:0,color:'#1a3a5c'};

export default function Departments() {
  const [depts,setDepts]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState(emptyForm);
  const [editing,setEditing]=useState(null);
  const [saving,setSaving]=useState(false);
  const navigate=useNavigate();

  const load=()=>{ api.get('/departments').then(r=>{setDepts(r.data);setLoading(false);}).catch(()=>setLoading(false)); };
  useEffect(load,[]);

  const openAdd=()=>{setForm(emptyForm);setEditing(null);setShowForm(true);};
  const openEdit=(d)=>{setForm({name:d.name,code:d.code,description:d.description||'',headDoctor:d.headDoctor||'',location:d.location||'',phone:d.phone||'',totalBeds:d.totalBeds||0,color:d.color||'#1a3a5c'});setEditing(d._id);setShowForm(true);};

  const save=async(e)=>{
    e.preventDefault();
    if(!form.name||!form.code)return toast.error('Name and Code required');
    setSaving(true);
    try{
      if(editing){await api.put(`/departments/${editing}`,form);toast.success('Department updated');}
      else{await api.post('/departments',form);toast.success('Department created');}
      setShowForm(false);load();
    }catch(err){toast.error(err.response?.data?.message||'Error saving');}
    finally{setSaving(false);}
  };

  const del=async(id,name)=>{
    if(!window.confirm(`Delete "${name}"?`))return;
    try{await api.delete(`/departments/${id}`);toast.success('Deleted');load();}
    catch(err){toast.error(err.response?.data?.message||'Error');}
  };

  if(loading)return <p style={{color:'#4a6080'}}>Loading departments...</p>;

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22,flexWrap:'wrap',gap:10}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700,color:'#1a3a5c'}}>🏥 Departments</h2>
          <p style={{fontSize:13,color:'#4a6080',marginTop:3}}>{depts.length} departments</p>
        </div>
        <button onClick={openAdd} style={{background:'#1a3a5c',color:'#fff',border:'none',padding:'9px 18px',borderRadius:8,fontWeight:600,fontSize:13,cursor:'pointer'}}>+ Add Department</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))',gap:16}}>
        {depts.map(d=>(
          <div key={d._id} style={{background:'#fff',border:'1px solid #e4e9f2',borderRadius:12,overflow:'hidden',boxShadow:'0 1px 6px rgba(0,0,0,0.06)'}}>
            <div style={{background:d.color||'#1a3a5c',padding:'16px 18px',color:'#fff'}}>
              <div style={{fontSize:20,marginBottom:4}}>🏥</div>
              <div style={{fontSize:15,fontWeight:700}}>{d.name}</div>
              <div style={{fontSize:11,opacity:0.8,marginTop:2}}>{d.code}</div>
            </div>
            <div style={{padding:'14px 18px'}}>
              {d.headDoctor&&<div style={{fontSize:13,marginBottom:5}}><span style={{color:'#8a9fb8'}}>Head: </span>{d.headDoctor}</div>}
              {d.location&&<div style={{fontSize:13,marginBottom:5}}><span style={{color:'#8a9fb8'}}>Location: </span>{d.location}</div>}
              {d.phone&&<div style={{fontSize:13,marginBottom:5}}><span style={{color:'#8a9fb8'}}>Phone: </span>{d.phone}</div>}
              {d.totalBeds>0&&<div style={{fontSize:13,marginBottom:5}}><span style={{color:'#8a9fb8'}}>Beds: </span>{d.totalBeds}</div>}
              {d.description&&<div style={{fontSize:12,color:'#4a6080',marginTop:6,borderTop:'1px solid #f0f3f8',paddingTop:8}}>{d.description}</div>}
              <div style={{display:'flex',gap:8,marginTop:12}}>
                <button onClick={()=>navigate(`/departments/${d._id}`)} style={{flex:1,background:'#f0f3f8',border:'none',padding:'7px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer',color:'#1a3a5c'}}>View</button>
                <button onClick={()=>openEdit(d)} style={{flex:1,background:'#eef1f7',border:'none',padding:'7px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer',color:'#2563a8'}}>Edit</button>
                <button onClick={()=>del(d._id,d.name)} style={{flex:1,background:'#fee8e8',border:'none',padding:'7px',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer',color:'#e74c3c'}}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {depts.length===0&&<div style={{textAlign:'center',padding:'60px 20px',color:'#8a9fb8'}}><div style={{fontSize:48,marginBottom:12}}>🏥</div><h3>No departments yet</h3></div>}

      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:16}}>
          <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:540,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{padding:'18px 22px 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 style={{fontSize:16,fontWeight:700,color:'#1a3a5c'}}>{editing?'Edit':'Add'} Department</h3>
              <button onClick={()=>setShowForm(false)} style={{background:'#f0f3f8',border:'none',borderRadius:8,width:30,height:30,fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <form onSubmit={save} style={{padding:22}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Department Name *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Cardiology" style={inp} required/></div>
                <div><label style={lbl}>Code *</label><input value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} placeholder="e.g. CARD" style={inp} required/></div>
              </div>
              <div style={{marginBottom:12}}><label style={lbl}>Head Doctor</label><input value={form.headDoctor} onChange={e=>setForm({...form,headDoctor:e.target.value})} placeholder="Dr. Name" style={inp}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Location / Room</label><input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Block A, Floor 2" style={inp}/></div>
                <div><label style={lbl}>Phone</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Extension" style={inp}/></div>
              </div>
              <div style={{marginBottom:12}}>
                <label style={lbl}>Total Beds</label>
                <input type="number" min={0} value={form.totalBeds} onChange={e=>setForm({...form,totalBeds:+e.target.value})} style={inp}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={lbl}>Color</label>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:4}}>
                  {COLORS.map(c=><div key={c} onClick={()=>setForm({...form,color:c})} style={{width:26,height:26,borderRadius:'50%',background:c,cursor:'pointer',border:form.color===c?'3px solid #000':'2px solid transparent'}}/>)}
                </div>
              </div>
              <div style={{marginBottom:16}}><label style={lbl}>Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} placeholder="Brief description..." style={{...inp,resize:'vertical'}}/></div>
              <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                <button type="button" onClick={()=>setShowForm(false)} style={{padding:'9px 18px',background:'#f0f3f8',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>Cancel</button>
                <button type="submit" disabled={saving} style={{padding:'9px 22px',background:'#1a3a5c',color:'#fff',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>{saving?'Saving...':editing?'Update':'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
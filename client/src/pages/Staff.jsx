import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const lbl={display:'block',fontSize:12,fontWeight:600,color:'#4a6080',marginBottom:5};
const inp={width:'100%',padding:'9px 11px',border:'1px solid #d1d9e6',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'};
const roles=['Doctor','Nurse','Technician','Admin','Pharmacist','D-Group','Security','Housekeeping','Other'];
const grades=['A1','A2','B1','B2','C1','C2','D1','D2'];
const shifts=['Morning','Evening','Night','General'];
const statusList=['Active','Inactive','On Leave'];
const roleColors={Doctor:'#3498db',Nurse:'#27ae60',Technician:'#9b59b6',Admin:'#c8873a',Pharmacist:'#16a085','D-Group':'#e74c3c',Security:'#c0392b',Housekeeping:'#f39c12',Other:'#7f8c8d'};
const gradeInfo={A1:'₹1,20,000',A2:'₹80,000',B1:'₹47,000',B2:'₹29,400',C1:'₹33,500',C2:'₹24,100',D1:'₹15,900',D2:'₹13,200'};
const emptyForm={name:'',role:'Doctor',department:'',departmentName:'',qualification:'',specialization:'',phone:'',email:'',address:'',joinDate:'',salaryGrade:'C1',shift:'General',status:'Active',aadhaar:''};

export default function Staff() {
  const [staff,setStaff]=useState([]);
  const [depts,setDepts]=useState([]);
  const [total,setTotal]=useState(0);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState(emptyForm);
  const [editing,setEditing]=useState(null);
  const [saving,setSaving]=useState(false);
  const [search,setSearch]=useState('');
  const [filterRole,setFilterRole]=useState('');
  const [page,setPage]=useState(1);
  const [pages,setPages]=useState(1);

  useEffect(()=>{ api.get('/departments').then(r=>setDepts(r.data)).catch(()=>{}); },[]);

  const load=()=>{
    setLoading(true);
    const q=new URLSearchParams({search,page,limit:15,...(filterRole?{role:filterRole}:{})}).toString();
    api.get(`/staff?${q}`).then(r=>{setStaff(r.data.staff);setTotal(r.data.total);setPages(r.data.pages);setLoading(false);}).catch(()=>setLoading(false));
  };
  useEffect(load,[search,filterRole,page]);

  const openAdd=()=>{setForm(emptyForm);setEditing(null);setShowForm(true);};
  const openEdit=(s)=>{
    setForm({name:s.name,role:s.role,department:s.department?._id||'',departmentName:s.departmentName||'',qualification:s.qualification||'',specialization:s.specialization||'',phone:s.phone||'',email:s.email||'',address:s.address||'',joinDate:s.joinDate?s.joinDate.split('T')[0]:'',salaryGrade:s.salaryGrade||'C1',shift:s.shift||'General',status:s.status||'Active',aadhaar:s.aadhaar||''});
    setEditing(s._id);setShowForm(true);
  };

  const save=async(e)=>{
    e.preventDefault();
    if(!form.name||!form.role)return toast.error('Name and role required');
    setSaving(true);
    try{
      const payload={...form,departmentName:depts.find(d=>d._id===form.department)?.name||form.departmentName};
      if(editing){await api.put(`/staff/${editing}`,payload);toast.success('Staff updated');}
      else{await api.post('/staff',payload);toast.success('Staff added');}
      setShowForm(false);load();
    }catch(err){toast.error(err.response?.data?.message||'Error');}
    finally{setSaving(false);}
  };

  const del=async(id,name)=>{
    if(!window.confirm(`Remove "${name}" from staff?`))return;
    try{await api.delete(`/staff/${id}`);toast.success('Removed');load();}
    catch(err){toast.error(err.response?.data?.message||'Error');}
  };

  const roleCount=(r)=>staff.filter(s=>s.role===r).length;

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700,color:'#1a3a5c'}}>👥 All Staff</h2>
          <p style={{fontSize:13,color:'#4a6080',marginTop:3}}>Total {total} staff members</p>
        </div>
        <button onClick={openAdd} style={{background:'#1a3a5c',color:'#fff',border:'none',padding:'9px 18px',borderRadius:8,fontWeight:600,fontSize:13,cursor:'pointer'}}>+ Add Staff</button>
      </div>

      {/* Summary chips */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>
        {roles.slice(0,6).map(r=>(
          <span key={r} style={{background:roleColors[r]+'22',color:roleColors[r],padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:600,cursor:'pointer'}} onClick={()=>setFilterRole(filterRole===r?'':r)}>
            {r}: {staff.filter(s=>s.role===r).length}
          </span>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="🔍 Search name or ID..." style={{...inp,maxWidth:260,flex:1}}/>
        <select value={filterRole} onChange={e=>{setFilterRole(e.target.value);setPage(1);}} style={{...inp,width:'auto'}}>
          <option value="">All Roles</option>
          {roles.map(r=><option key={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{background:'#fff',border:'1px solid #e4e9f2',borderRadius:12,overflow:'hidden',boxShadow:'0 1px 6px rgba(0,0,0,0.06)'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead style={{background:'#f8f9fb'}}>
            <tr>{['ID','Name','Role','Department','Qualification','Shift','Grade','Salary (CTC)','Status','Actions'].map(h=><th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'#8a9fb8',textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading?<tr><td colSpan={10} style={{padding:30,textAlign:'center',color:'#8a9fb8'}}>Loading...</td></tr>:
            staff.length===0?<tr><td colSpan={10} style={{padding:30,textAlign:'center',color:'#8a9fb8'}}>No staff found</td></tr>:
            staff.map(s=>(
              <tr key={s._id} style={{borderTop:'1px solid #f0f3f8'}}>
                <td style={{padding:'10px 12px',fontWeight:600,color:'#1a3a5c',whiteSpace:'nowrap'}}>{s.employeeId}</td>
                <td style={{padding:'10px 12px',fontWeight:500}}>{s.name}</td>
                <td style={{padding:'10px 12px'}}>
                  <span style={{background:roleColors[s.role]+'22',color:roleColors[s.role]||'#666',padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:600}}>{s.role}</span>
                </td>
                <td style={{padding:'10px 12px',color:'#4a6080',maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.departmentName||'—'}</td>
                <td style={{padding:'10px 12px',color:'#4a6080'}}>{s.qualification||'—'}</td>
                <td style={{padding:'10px 12px',color:'#4a6080'}}>{s.shift}</td>
                <td style={{padding:'10px 12px'}}><span style={{background:'#f0f3f8',padding:'2px 8px',borderRadius:6,fontWeight:600,fontSize:12}}>{s.salaryGrade}</span></td>
                <td style={{padding:'10px 12px',color:'#27ae60',fontWeight:600,fontSize:12}}>{gradeInfo[s.salaryGrade]||'—'}</td>
                <td style={{padding:'10px 12px'}}>
                  <span style={{background:s.status==='Active'?'#d6f0e4':s.status==='On Leave'?'#fef3e2':'#fee8e8',color:s.status==='Active'?'#27ae60':s.status==='On Leave'?'#c87a00':'#e74c3c',padding:'2px 9px',borderRadius:20,fontSize:11,fontWeight:600}}>{s.status}</span>
                </td>
                <td style={{padding:'10px 12px'}}>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>openEdit(s)} style={{background:'#eef1f7',border:'none',padding:'5px 10px',borderRadius:6,fontSize:12,cursor:'pointer',color:'#2563a8',fontWeight:600}}>Edit</button>
                    <button onClick={()=>del(s._id,s.name)} style={{background:'#fee8e8',border:'none',padding:'5px 10px',borderRadius:6,fontSize:12,cursor:'pointer',color:'#e74c3c',fontWeight:600}}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages>1&&<div style={{display:'flex',gap:8,justifyContent:'center',marginTop:16}}>
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} style={{padding:'7px 14px',background:'#f0f3f8',border:'none',borderRadius:7,cursor:'pointer',fontWeight:600}}>← Prev</button>
        <span style={{padding:'7px 14px',fontSize:13,color:'#4a6080'}}>Page {page} of {pages}</span>
        <button disabled={page>=pages} onClick={()=>setPage(p=>p+1)} style={{padding:'7px 14px',background:'#f0f3f8',border:'none',borderRadius:7,cursor:'pointer',fontWeight:600}}>Next →</button>
      </div>}

      {/* Modal */}
      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:16}}>
          <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:620,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{padding:'18px 22px 0',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,background:'#fff',zIndex:1,borderBottom:'1px solid #f0f3f8',paddingBottom:14}}>
              <h3 style={{fontSize:16,fontWeight:700,color:'#1a3a5c'}}>{editing?'Edit':'Add'} Staff Member</h3>
              <button onClick={()=>setShowForm(false)} style={{background:'#f0f3f8',border:'none',borderRadius:8,width:30,height:30,fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <form onSubmit={save} style={{padding:22}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Full Name *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Employee full name" style={inp} required/></div>
                <div><label style={lbl}>Role *</label>
                  <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} style={inp}>
                    {roles.map(r=><option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Department</label>
                  <select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={inp}>
                    <option value="">Select Department</option>
                    {depts.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Qualification</label><input value={form.qualification} onChange={e=>setForm({...form,qualification:e.target.value})} placeholder="e.g. MBBS, BSc Nursing" style={inp}/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Specialization</label><input value={form.specialization} onChange={e=>setForm({...form,specialization:e.target.value})} placeholder="e.g. Cardiology" style={inp}/></div>
                <div><label style={lbl}>Phone</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Mobile number" style={inp}/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="Email address" style={inp}/></div>
                <div><label style={lbl}>Joining Date</label><input type="date" value={form.joinDate} onChange={e=>setForm({...form,joinDate:e.target.value})} style={inp}/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Salary Grade</label>
                  <select value={form.salaryGrade} onChange={e=>setForm({...form,salaryGrade:e.target.value})} style={inp}>
                    {grades.map(g=><option key={g} value={g}>{g} — {gradeInfo[g]}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Shift</label>
                  <select value={form.shift} onChange={e=>setForm({...form,shift:e.target.value})} style={inp}>
                    {shifts.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Status</label>
                  <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inp}>
                    {statusList.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                <div><label style={lbl}>Aadhaar Number</label><input value={form.aadhaar} onChange={e=>setForm({...form,aadhaar:e.target.value})} placeholder="12-digit Aadhaar" maxLength={12} style={inp}/></div>
                <div><label style={lbl}>Address</label><input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Residential address" style={inp}/></div>
              </div>
              <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                <button type="button" onClick={()=>setShowForm(false)} style={{padding:'9px 18px',background:'#f0f3f8',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>Cancel</button>
                <button type="submit" disabled={saving} style={{padding:'9px 22px',background:'#1a3a5c',color:'#fff',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>{saving?'Saving...':editing?'Update':'Add Staff'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
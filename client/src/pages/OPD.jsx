import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const lbl={display:'block',fontSize:12,fontWeight:600,color:'#4a6080',marginBottom:5};
const inp={width:'100%',padding:'9px 11px',border:'1px solid #d1d9e6',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'};
const statusColors={Waiting:'#f39c12',Done:'#27ae60','In-Consultation':'#3498db',Cancelled:'#e74c3c'};

export default function OPD() {
  const [visits,setVisits]=useState([]);
  const [depts,setDepts]=useState([]);
  const [patients,setPatients]=useState([]);
  const [total,setTotal]=useState(0);
  const [pages,setPages]=useState(1);
  const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [saving,setSaving]=useState(false);
  const [stats,setStats]=useState({});
  const [filterDate,setFilterDate]=useState(new Date().toISOString().split('T')[0]);
  const [patientSearch,setPatientSearch]=useState('');
  const [searching,setSearching]=useState(false);
  const [form,setForm]=useState({patient:'',patientName:'',uhid:'',department:'',departmentName:'',doctor:'',visitDate:new Date().toISOString().split('T')[0],visitType:'New',chiefComplaint:'',diagnosis:'',prescription:'',bp:'',pulse:'',temperature:'',weight:'',fees:0,paymentStatus:'Pending',status:'Waiting'});

  useEffect(()=>{
    api.get('/departments').then(r=>setDepts(r.data)).catch(()=>{});
    api.get('/opd/stats/today').then(r=>setStats(r.data)).catch(()=>{});
  },[]);

  const load=()=>{
    setLoading(true);
    const q=new URLSearchParams({page,limit:15,...(filterDate?{date:filterDate}:{})}).toString();
    api.get(`/opd?${q}`).then(r=>{setVisits(r.data.visits);setTotal(r.data.total);setPages(r.data.pages);setLoading(false);}).catch(()=>setLoading(false));
  };
  useEffect(load,[filterDate,page]);

  const searchPatient=async(q)=>{
    if(q.length<2)return;
    setSearching(true);
    try{
      const r=await api.get(`/patients?search=${q}&limit=10`);
      setPatients(r.data.patients);
    }catch{}
    finally{setSearching(false);}
  };

  const selectPatient=(p)=>{
    setForm(prev=>({...prev,patient:p._id,patientName:`${p.firstName} ${p.lastName}`,uhid:p.uhid}));
    setPatients([]);setPatientSearch(`${p.firstName} ${p.lastName} (${p.uhid})`);
  };

  const save=async(e)=>{
    e.preventDefault();
    if(!form.patient||!form.department||!form.doctor)return toast.error('Patient, department and doctor required');
    setSaving(true);
    try{
      const dept=depts.find(d=>d._id===form.department);
      await api.post('/opd',{...form,departmentName:dept?.name||''});
      toast.success('OPD visit registered!');
      setShowForm(false);load();
      api.get('/opd/stats/today').then(r=>setStats(r.data));
    }catch(err){toast.error(err.response?.data?.message||'Error');}
    finally{setSaving(false);}
  };

  const updateStatus=async(id,status)=>{
    try{await api.put(`/opd/${id}`,{status});toast.success('Status updated');load();}
    catch(err){toast.error('Error updating status');}
  };

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700,color:'#1a3a5c'}}>🩺 OPD — Outpatient Department</h2>
          <p style={{fontSize:13,color:'#4a6080',marginTop:3}}>Total {total} visits</p>
        </div>
        <button onClick={()=>setShowForm(true)} style={{background:'#1a3a5c',color:'#fff',border:'none',padding:'9px 18px',borderRadius:8,fontWeight:600,fontSize:13,cursor:'pointer'}}>+ Register OPD Visit</button>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:12,marginBottom:18}}>
        {[{l:"Today's Total",v:stats.total||0,c:'#1a3a5c'},{l:'Waiting',v:stats.waiting||0,c:'#f39c12'},{l:'Consulting',v:stats.inConsultation||0,c:'#3498db'},{l:'Done',v:stats.done||0,c:'#27ae60'}].map(s=>(
          <div key={s.l} style={{background:'#fff',border:'1px solid #e4e9f2',borderRadius:10,padding:'14px 16px',borderLeft:`4px solid ${s.c}`}}>
            <div style={{fontSize:11,fontWeight:600,color:'#8a9fb8',textTransform:'uppercase'}}>{s.l}</div>
            <div style={{fontSize:26,fontWeight:700,color:'#0f1e30',marginTop:4}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{display:'flex',gap:10,marginBottom:14,flexWrap:'wrap'}}>
        <input type="date" value={filterDate} onChange={e=>{setFilterDate(e.target.value);setPage(1);}} style={{...inp,width:'auto'}}/>
        <button onClick={()=>{setFilterDate('');setPage(1);}} style={{padding:'9px 14px',background:'#f0f3f8',border:'none',borderRadius:8,cursor:'pointer',fontSize:13}}>Show All</button>
      </div>

      {/* Table */}
      <div style={{background:'#fff',border:'1px solid #e4e9f2',borderRadius:12,overflow:'auto',boxShadow:'0 1px 6px rgba(0,0,0,0.06)'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,minWidth:800}}>
          <thead style={{background:'#f8f9fb'}}>
            <tr>{['Token','Visit ID','Patient','UHID','Department','Doctor','Date','Type','Status','Action'].map(h=><th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'#8a9fb8',textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading?<tr><td colSpan={10} style={{padding:30,textAlign:'center',color:'#8a9fb8'}}>Loading...</td></tr>:
            visits.length===0?<tr><td colSpan={10} style={{padding:30,textAlign:'center',color:'#8a9fb8'}}>No OPD visits found</td></tr>:
            visits.map(v=>(
              <tr key={v._id} style={{borderTop:'1px solid #f0f3f8'}}>
                <td style={{padding:'10px 12px',fontWeight:700,fontSize:18,color:'#1a3a5c',textAlign:'center'}}>{v.tokenNumber}</td>
                <td style={{padding:'10px 12px',fontWeight:600,color:'#2563a8',fontSize:12}}>{v.visitId}</td>
                <td style={{padding:'10px 12px',fontWeight:500}}>{v.patientName||v.patient?.firstName}</td>
                <td style={{padding:'10px 12px',color:'#4a6080',fontSize:12}}>{v.uhid}</td>
                <td style={{padding:'10px 12px',color:'#4a6080'}}>{v.departmentName}</td>
                <td style={{padding:'10px 12px'}}>{v.doctor}</td>
                <td style={{padding:'10px 12px',color:'#4a6080',fontSize:12}}>{new Date(v.visitDate).toLocaleDateString('en-IN')}</td>
                <td style={{padding:'10px 12px'}}><span style={{background:'#f0f3f8',padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:600}}>{v.visitType}</span></td>
                <td style={{padding:'10px 12px'}}>
                  <span style={{background:(statusColors[v.status]||'#999')+'22',color:statusColors[v.status]||'#999',padding:'2px 9px',borderRadius:20,fontSize:11,fontWeight:600}}>{v.status}</span>
                </td>
                <td style={{padding:'10px 12px'}}>
                  <select value={v.status} onChange={e=>updateStatus(v._id,e.target.value)} style={{...inp,width:'auto',padding:'4px 8px',fontSize:12}}>
                    <option>Waiting</option><option>In-Consultation</option><option>Done</option><option>Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages>1&&<div style={{display:'flex',gap:8,justifyContent:'center',marginTop:16}}>
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} style={{padding:'7px 14px',background:'#f0f3f8',border:'none',borderRadius:7,cursor:'pointer',fontWeight:600}}>← Prev</button>
        <span style={{padding:'7px 14px',fontSize:13,color:'#4a6080'}}>Page {page} of {pages}</span>
        <button disabled={page>=pages} onClick={()=>setPage(p=>p+1)} style={{padding:'7px 14px',background:'#f0f3f8',border:'none',borderRadius:7,cursor:'pointer',fontWeight:600}}>Next →</button>
      </div>}

      {/* Register Modal */}
      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:16}}>
          <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:620,maxHeight:'94vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{padding:'18px 22px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,background:'#fff',zIndex:1,borderBottom:'1px solid #f0f3f8'}}>
              <h3 style={{fontSize:16,fontWeight:700,color:'#1a3a5c'}}>Register OPD Visit</h3>
              <button onClick={()=>setShowForm(false)} style={{background:'#f0f3f8',border:'none',borderRadius:8,width:30,height:30,fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <form onSubmit={save} style={{padding:22}}>
              {/* Patient Search */}
              <div style={{marginBottom:14,position:'relative'}}>
                <label style={lbl}>Search Patient (by name/UHID/ABHA) *</label>
                <input value={patientSearch} onChange={e=>{setPatientSearch(e.target.value);searchPatient(e.target.value);setForm(prev=>({...prev,patient:'',patientName:'',uhid:''}));}} placeholder="Type name, UHID or ABHA number..." style={inp}/>
                {patients.length>0&&(
                  <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:'1px solid #d1d9e6',borderRadius:8,boxShadow:'0 4px 16px rgba(0,0,0,0.1)',zIndex:10,maxHeight:200,overflowY:'auto'}}>
                    {patients.map(p=>(
                      <div key={p._id} onClick={()=>selectPatient(p)} style={{padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid #f0f3f8',fontSize:13}} onMouseEnter={e=>e.target.style.background='#f0f3f8'} onMouseLeave={e=>e.target.style.background='#fff'}>
                        <strong>{p.firstName} {p.lastName}</strong> — {p.uhid} — {p.phone}
                        {p.abhaNumber&&<span style={{color:'#3498db',marginLeft:8,fontSize:11}}>ABHA: {p.abhaNumber}</span>}
                      </div>
                    ))}
                  </div>
                )}
                {searching&&<div style={{fontSize:12,color:'#4a6080',marginTop:4}}>Searching...</div>}
                {form.patient&&<div style={{fontSize:12,color:'#27ae60',marginTop:4}}>✅ Patient selected: {form.patientName} ({form.uhid})</div>}
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Department *</label>
                  <select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={inp} required>
                    <option value="">Select Department</option>
                    {depts.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Doctor *</label><input value={form.doctor} onChange={e=>setForm({...form,doctor:e.target.value})} placeholder="Doctor name" style={inp} required/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Visit Date</label><input type="date" value={form.visitDate} onChange={e=>setForm({...form,visitDate:e.target.value})} style={inp}/></div>
                <div><label style={lbl}>Visit Type</label>
                  <select value={form.visitType} onChange={e=>setForm({...form,visitType:e.target.value})} style={inp}>
                    <option>New</option><option>Follow-up</option><option>Emergency</option>
                  </select>
                </div>
              </div>
              <div style={{marginBottom:12}}><label style={lbl}>Chief Complaint</label><textarea value={form.chiefComplaint} onChange={e=>setForm({...form,chiefComplaint:e.target.value})} rows={2} placeholder="Patient's main complaint" style={{...inp,resize:'vertical'}}/></div>

              {/* Vitals */}
              <div style={{fontSize:13,fontWeight:700,color:'#1a3a5c',marginBottom:10}}>Vitals (Optional)</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:12}}>
                {[['BP','bp','mmHg'],['Pulse','pulse','bpm'],['Temp','temperature','°F'],['Weight','weight','kg']].map(([l,k,u])=>(
                  <div key={k}><label style={lbl}>{l} ({u})</label><input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={u} style={inp}/></div>
                ))}
              </div>

              <div style={{marginBottom:12}}><label style={lbl}>Diagnosis</label><textarea value={form.diagnosis} onChange={e=>setForm({...form,diagnosis:e.target.value})} rows={2} placeholder="Diagnosis (fill after consultation)" style={{...inp,resize:'vertical'}}/></div>
              <div style={{marginBottom:12}}><label style={lbl}>Prescription</label><textarea value={form.prescription} onChange={e=>setForm({...form,prescription:e.target.value})} rows={3} placeholder="Medicines prescribed" style={{...inp,resize:'vertical'}}/></div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                <div><label style={lbl}>Consultation Fees (₹)</label><input type="number" min={0} value={form.fees} onChange={e=>setForm({...form,fees:+e.target.value})} style={inp}/></div>
                <div><label style={lbl}>Payment Status</label>
                  <select value={form.paymentStatus} onChange={e=>setForm({...form,paymentStatus:e.target.value})} style={inp}>
                    <option>Pending</option><option>Paid</option><option>Waived</option>
                  </select>
                </div>
              </div>

              <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                <button type="button" onClick={()=>setShowForm(false)} style={{padding:'9px 18px',background:'#f0f3f8',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>Cancel</button>
                <button type="submit" disabled={saving} style={{padding:'9px 22px',background:'#1a3a5c',color:'#fff',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>{saving?'Registering...':'Register OPD Visit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
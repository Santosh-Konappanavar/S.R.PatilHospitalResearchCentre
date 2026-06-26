import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const lbl={display:'block',fontSize:12,fontWeight:600,color:'#4a6080',marginBottom:5};
const inp={width:'100%',padding:'9px 11px',border:'1px solid #d1d9e6',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'};
const statusColors={Admitted:'#3498db',Discharged:'#27ae60',LAMA:'#f39c12',Transferred:'#9b59b6',Expired:'#e74c3c'};

export default function IPD() {
  const [admissions,setAdmissions]=useState([]);
  const [depts,setDepts]=useState([]);
  const [total,setTotal]=useState(0);
  const [pages,setPages]=useState(1);
  const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [saving,setSaving]=useState(false);
  const [viewing,setViewing]=useState(null);
  const [noteText,setNoteText]=useState('');
  const [addingNote,setAddingNote]=useState(false);
  const [filterStatus,setFilterStatus]=useState('Admitted');
  const [patientSearch,setPatientSearch]=useState('');
  const [patients,setPatients]=useState([]);
  const [form,setForm]=useState({patient:'',patientName:'',uhid:'',department:'',departmentName:'',ward:'',bedNumber:'',admittingDoctor:'',admissionType:'Planned',diagnosis:'',totalAmount:0,paidAmount:0,paymentStatus:'Pending'});

  useEffect(()=>{ api.get('/departments').then(r=>setDepts(r.data)).catch(()=>{}); },[]);

  const load=()=>{
    setLoading(true);
    const q=new URLSearchParams({page,limit:15,...(filterStatus?{status:filterStatus}:{})}).toString();
    api.get(`/ipd?${q}`).then(r=>{setAdmissions(r.data.admissions);setTotal(r.data.total);setPages(r.data.pages);setLoading(false);}).catch(()=>setLoading(false));
  };
  useEffect(load,[filterStatus,page]);

  const searchPatient=async(q)=>{
    if(q.length<2)return;
    try{ const r=await api.get(`/patients?search=${q}&limit=8`); setPatients(r.data.patients); }catch{}
  };
  const selectPatient=(p)=>{
    setForm(prev=>({...prev,patient:p._id,patientName:`${p.firstName} ${p.lastName}`,uhid:p.uhid}));
    setPatients([]); setPatientSearch(`${p.firstName} ${p.lastName} (${p.uhid})`);
  };

  const save=async(e)=>{
    e.preventDefault();
    if(!form.patient||!form.department||!form.admittingDoctor)return toast.error('Patient, department and doctor required');
    setSaving(true);
    try{
      const dept=depts.find(d=>d._id===form.department);
      await api.post('/ipd',{...form,departmentName:dept?.name||''});
      toast.success('Patient admitted successfully!');
      setShowForm(false); load();
    }catch(err){toast.error(err.response?.data?.message||'Error');}
    finally{setSaving(false);}
  };

  const addNote=async()=>{
    if(!noteText.trim())return;
    setAddingNote(true);
    try{
      const r=await api.post(`/ipd/${viewing._id}/note`,{note:noteText});
      setViewing(r.data);
      setNoteText('');
      toast.success('Note added');
    }catch(err){toast.error('Error adding note');}
    finally{setAddingNote(false);}
  };

  const discharge=async(id)=>{
    const summary=window.prompt('Enter discharge summary:');
    if(summary===null)return;
    try{
      await api.put(`/ipd/${id}`,{status:'Discharged',dischargeDate:new Date().toISOString(),dischargeSummary:summary,paymentStatus:'Pending'});
      toast.success('Patient discharged');
      setViewing(null); load();
    }catch(err){toast.error('Error discharging');}
  };

  const totalAdmitted=admissions.filter(a=>a.status==='Admitted').length;

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700,color:'#1a3a5c'}}>🛏️ IPD — Inpatient Department</h2>
          <p style={{fontSize:13,color:'#4a6080',marginTop:3}}>Total {total} records | {totalAdmitted} currently admitted</p>
        </div>
        <button onClick={()=>setShowForm(true)} style={{background:'#1a3a5c',color:'#fff',border:'none',padding:'9px 18px',borderRadius:8,fontWeight:600,fontSize:13,cursor:'pointer'}}>+ Admit Patient</button>
      </div>

      {/* Filter */}
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        {['Admitted','Discharged','LAMA','Transferred','Expired',''].map(s=>(
          <button key={s||'all'} onClick={()=>{setFilterStatus(s);setPage(1);}} style={{padding:'7px 14px',background:filterStatus===s?'#1a3a5c':'#f0f3f8',color:filterStatus===s?'#fff':'#4a6080',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:12}}>
            {s||'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{background:'#fff',border:'1px solid #e4e9f2',borderRadius:12,overflow:'auto',boxShadow:'0 1px 6px rgba(0,0,0,0.06)'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,minWidth:900}}>
          <thead style={{background:'#f8f9fb'}}>
            <tr>{['Admission ID','Patient','UHID','Department','Doctor','Ward/Bed','Admit Date','Type','Status','Actions'].map(h=><th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'#8a9fb8',textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading?<tr><td colSpan={10} style={{padding:30,textAlign:'center',color:'#8a9fb8'}}>Loading...</td></tr>:
            admissions.length===0?<tr><td colSpan={10} style={{padding:30,textAlign:'center',color:'#8a9fb8'}}>No IPD records found</td></tr>:
            admissions.map(a=>(
              <tr key={a._id} style={{borderTop:'1px solid #f0f3f8'}}>
                <td style={{padding:'10px 12px',fontWeight:600,color:'#2563a8',fontSize:12}}>{a.admissionId}</td>
                <td style={{padding:'10px 12px',fontWeight:500}}>{a.patientName}</td>
                <td style={{padding:'10px 12px',color:'#4a6080',fontSize:12}}>{a.uhid}</td>
                <td style={{padding:'10px 12px',color:'#4a6080'}}>{a.departmentName}</td>
                <td style={{padding:'10px 12px'}}>{a.admittingDoctor}</td>
                <td style={{padding:'10px 12px',color:'#4a6080'}}>{a.ward||'—'}{a.bedNumber?` / Bed ${a.bedNumber}`:''}</td>
                <td style={{padding:'10px 12px',color:'#4a6080',fontSize:12}}>{new Date(a.admissionDate).toLocaleDateString('en-IN')}</td>
                <td style={{padding:'10px 12px'}}><span style={{background:'#f0f3f8',padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:600}}>{a.admissionType}</span></td>
                <td style={{padding:'10px 12px'}}>
                  <span style={{background:(statusColors[a.status]||'#999')+'22',color:statusColors[a.status]||'#999',padding:'2px 9px',borderRadius:20,fontSize:11,fontWeight:600}}>{a.status}</span>
                </td>
                <td style={{padding:'10px 12px'}}>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={async()=>{const r=await api.get(`/ipd/${a._id}`);setViewing(r.data);}} style={{background:'#dce8f8',border:'none',padding:'5px 10px',borderRadius:6,fontSize:12,cursor:'pointer',color:'#1a3a5c',fontWeight:600}}>View</button>
                    {a.status==='Admitted'&&<button onClick={()=>discharge(a._id)} style={{background:'#d6f0e4',border:'none',padding:'5px 10px',borderRadius:6,fontSize:12,cursor:'pointer',color:'#27ae60',fontWeight:600}}>Discharge</button>}
                  </div>
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

      {/* View / Notes Modal */}
      {viewing&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:16}}>
          <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:640,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{padding:'18px 22px',display:'flex',justifyContent:'space-between',alignItems:'center',background:'#1a3a5c',color:'#fff',borderRadius:'14px 14px 0 0'}}>
              <div><div style={{fontSize:11,opacity:0.7}}>{viewing.admissionId}</div><h3 style={{fontSize:16,fontWeight:700}}>{viewing.patientName}</h3></div>
              <button onClick={()=>setViewing(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',borderRadius:8,width:30,height:30,fontSize:16,cursor:'pointer',color:'#fff'}}>✕</button>
            </div>
            <div style={{padding:20}}>
              {/* Details */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16}}>
                {[['UHID',viewing.uhid],['Department',viewing.departmentName],['Doctor',viewing.admittingDoctor],['Ward/Bed',`${viewing.ward||'—'}${viewing.bedNumber?` / Bed ${viewing.bedNumber}`:''}`],['Admission Type',viewing.admissionType],['Status',viewing.status],['Admit Date',new Date(viewing.admissionDate).toLocaleString('en-IN')],['Diagnosis',viewing.diagnosis||'—']].map(([k,v])=>(
                  <div key={k} style={{background:'#f8f9fb',borderRadius:8,padding:'8px 12px'}}>
                    <div style={{fontSize:11,color:'#8a9fb8',fontWeight:600}}>{k}</div>
                    <div style={{fontSize:13,marginTop:2}}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Nursing Notes */}
              <div style={{marginBottom:16}}>
                <div style={{fontSize:14,fontWeight:700,color:'#1a3a5c',marginBottom:10}}>📝 Nursing Notes ({viewing.nursingNotes?.length||0})</div>
                <div style={{maxHeight:180,overflowY:'auto',marginBottom:10}}>
                  {viewing.nursingNotes?.length===0&&<p style={{color:'#8a9fb8',fontSize:13}}>No notes yet.</p>}
                  {viewing.nursingNotes?.map((n,i)=>(
                    <div key={i} style={{background:'#f8f9fb',borderRadius:8,padding:'10px 14px',marginBottom:8}}>
                      <div style={{fontSize:13}}>{n.note}</div>
                      <div style={{fontSize:11,color:'#8a9fb8',marginTop:4}}>{n.addedBy} — {new Date(n.addedAt).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
                {viewing.status==='Admitted'&&(
                  <div style={{display:'flex',gap:8}}>
                    <input value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Add nursing note..." style={{...inp,flex:1}} onKeyDown={e=>{if(e.key==='Enter')addNote();}}/>
                    <button onClick={addNote} disabled={addingNote} style={{padding:'9px 16px',background:'#1a3a5c',color:'#fff',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer',whiteSpace:'nowrap'}}>{addingNote?'Adding...':'Add Note'}</button>
                  </div>
                )}
              </div>

              {/* Billing Summary */}
              <div style={{background:'#f0f3f8',borderRadius:10,padding:'12px 16px'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#1a3a5c',marginBottom:8}}>💰 Billing</div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}><span>Total Amount</span><span style={{fontWeight:700}}>₹{viewing.totalAmount?.toLocaleString('en-IN')||0}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}><span>Paid Amount</span><span style={{fontWeight:700,color:'#27ae60'}}>₹{viewing.paidAmount?.toLocaleString('en-IN')||0}</span></div>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}><span>Balance</span><span style={{fontWeight:700,color:'#e74c3c'}}>₹{((viewing.totalAmount||0)-(viewing.paidAmount||0)).toLocaleString('en-IN')}</span></div>
              </div>

              {viewing.status==='Admitted'&&(
                <button onClick={()=>discharge(viewing._id)} style={{width:'100%',marginTop:14,padding:'11px',background:'#27ae60',color:'#fff',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer',fontSize:14}}>✅ Discharge Patient</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admit Modal */}
      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:16}}>
          <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:600,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{padding:'18px 22px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,background:'#fff',zIndex:1,borderBottom:'1px solid #f0f3f8'}}>
              <h3 style={{fontSize:16,fontWeight:700,color:'#1a3a5c'}}>Admit Patient to IPD</h3>
              <button onClick={()=>setShowForm(false)} style={{background:'#f0f3f8',border:'none',borderRadius:8,width:30,height:30,fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <form onSubmit={save} style={{padding:22}}>
              <div style={{marginBottom:14,position:'relative'}}>
                <label style={lbl}>Search Patient *</label>
                <input value={patientSearch} onChange={e=>{setPatientSearch(e.target.value);searchPatient(e.target.value);setForm(p=>({...p,patient:'',patientName:'',uhid:''}));}} placeholder="Name, UHID or ABHA..." style={inp}/>
                {patients.length>0&&(
                  <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:'1px solid #d1d9e6',borderRadius:8,boxShadow:'0 4px 16px rgba(0,0,0,0.1)',zIndex:10,maxHeight:180,overflowY:'auto'}}>
                    {patients.map(p=>(
                      <div key={p._id} onClick={()=>selectPatient(p)} style={{padding:'10px 14px',cursor:'pointer',fontSize:13,borderBottom:'1px solid #f0f3f8'}} onMouseEnter={e=>e.target.style.background='#f0f3f8'} onMouseLeave={e=>e.target.style.background='#fff'}>
                        <strong>{p.firstName} {p.lastName}</strong> — {p.uhid} — {p.phone}
                      </div>
                    ))}
                  </div>
                )}
                {form.patient&&<div style={{fontSize:12,color:'#27ae60',marginTop:4}}>✅ {form.patientName} ({form.uhid})</div>}
              </div>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Department *</label>
                  <select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={inp} required>
                    <option value="">Select Department</option>
                    {depts.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Admitting Doctor *</label><input value={form.admittingDoctor} onChange={e=>setForm({...form,admittingDoctor:e.target.value})} placeholder="Doctor name" style={inp} required/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Ward</label><input value={form.ward} onChange={e=>setForm({...form,ward:e.target.value})} placeholder="e.g. General Ward" style={inp}/></div>
                <div><label style={lbl}>Bed Number</label><input value={form.bedNumber} onChange={e=>setForm({...form,bedNumber:e.target.value})} placeholder="e.g. B-12" style={inp}/></div>
                <div><label style={lbl}>Admission Type</label>
                  <select value={form.admissionType} onChange={e=>setForm({...form,admissionType:e.target.value})} style={inp}>
                    <option>Planned</option><option>Emergency</option><option>Transfer</option>
                  </select>
                </div>
              </div>
              <div style={{marginBottom:12}}><label style={lbl}>Diagnosis / Reason for Admission</label><textarea value={form.diagnosis} onChange={e=>setForm({...form,diagnosis:e.target.value})} rows={3} placeholder="Diagnosis or reason for admission" style={{...inp,resize:'vertical'}}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
                <div><label style={lbl}>Estimated Charges (₹)</label><input type="number" min={0} value={form.totalAmount} onChange={e=>setForm({...form,totalAmount:+e.target.value})} style={inp}/></div>
                <div><label style={lbl}>Advance Paid (₹)</label><input type="number" min={0} value={form.paidAmount} onChange={e=>setForm({...form,paidAmount:+e.target.value})} style={inp}/></div>
              </div>
              <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                <button type="button" onClick={()=>setShowForm(false)} style={{padding:'9px 18px',background:'#f0f3f8',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>Cancel</button>
                <button type="submit" disabled={saving} style={{padding:'9px 22px',background:'#1a3a5c',color:'#fff',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>{saving?'Admitting...':'Admit Patient'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
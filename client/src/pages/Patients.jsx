import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const lbl={display:'block',fontSize:12,fontWeight:600,color:'#4a6080',marginBottom:5};
const inp={width:'100%',padding:'9px 11px',border:'1px solid #d1d9e6',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'};
const emptyForm={firstName:'',lastName:'',dob:'',age:'',gender:'Male',bloodGroup:'Unknown',phone:'',alternatePhone:'',email:'',address:'',city:'',pincode:'',aadhaarNumber:'',abhaNumber:'',abhaAddress:'',allergies:'',chronicConditions:'',emergencyName:'',emergencyPhone:'',emergencyRelation:'',isAyushmanBharat:false,insurancePolicyNo:''};

export default function Patients() {
  const [patients,setPatients]=useState([]);
  const [total,setTotal]=useState(0);
  const [pages,setPages]=useState(1);
  const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState(emptyForm);
  const [saving,setSaving]=useState(false);
  const [viewing,setViewing]=useState(null);
  const [abhaForm,setAbhaForm]=useState({ abhaNumber:'', abhaAddress:'' });
  const [linkingAbha,setLinkingAbha]=useState(false);

  const load=()=>{
    setLoading(true);
    api.get(`/patients?search=${search}&page=${page}&limit=15`).then(r=>{
      setPatients(r.data.patients);setTotal(r.data.total);setPages(r.data.pages);setLoading(false);
    }).catch(()=>setLoading(false));
  };
  useEffect(load,[search,page]);

  const f=(k)=>(e)=>setForm({...form,[k]:e.target.type==='checkbox'?e.target.checked:e.target.value});

  const save=async(e)=>{
    e.preventDefault();
    if(!form.firstName||!form.gender||!form.phone)return toast.error('First name, gender and phone required');
    setSaving(true);
    try{
      const r=await api.post('/patients',form);
      toast.success(`Patient registered! UHID: ${r.data.patient.uhid}`);
      setShowForm(false);setForm(emptyForm);load();
    }catch(err){toast.error(err.response?.data?.message||'Error registering patient');}
    finally{setSaving(false);}
  };

  const bloodColors={'A+':'#e74c3c','A-':'#c0392b','B+':'#3498db','B-':'#2980b9','O+':'#27ae60','O-':'#16a085','AB+':'#9b59b6','AB-':'#8e44ad',Unknown:'#7f8c8d'};

  const linkAbha = async () => {
    if (!abhaForm.abhaNumber.trim()) return toast.error('Enter an ABHA number');
    setLinkingAbha(true);
    try {
      const r = await api.put(`/patients/${viewing._id}/abha`, abhaForm);
      toast.success('ABHA linked successfully');
      setViewing(r.data.patient);
      setAbhaForm({ abhaNumber: '', abhaAddress: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error linking ABHA');
    } finally {
      setLinkingAbha(false);
    }
  };

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700,color:'#1a3a5c'}}>👤 Patients</h2>
          <p style={{fontSize:13,color:'#4a6080',marginTop:3}}>Total {total} registered patients</p>
        </div>
        <button onClick={()=>{setForm(emptyForm);setShowForm(true);}} style={{background:'#1a3a5c',color:'#fff',border:'none',padding:'9px 18px',borderRadius:8,fontWeight:600,fontSize:13,cursor:'pointer'}}>+ Register Patient</button>
      </div>

      <div style={{marginBottom:14}}>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="🔍 Search by name, UHID, phone or ABHA number..." style={{...inp,maxWidth:420}}/>
      </div>

      {/* Table */}
      <div style={{background:'#fff',border:'1px solid #e4e9f2',borderRadius:12,overflow:'auto',boxShadow:'0 1px 6px rgba(0,0,0,0.06)'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,minWidth:700}}>
          <thead style={{background:'#f8f9fb'}}>
            <tr>{['UHID','Name','Age/Sex','Blood','Phone','ABHA','Ayushman','Registered','Action'].map(h=><th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'#8a9fb8',textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading?<tr><td colSpan={9} style={{padding:30,textAlign:'center',color:'#8a9fb8'}}>Loading...</td></tr>:
            patients.length===0?<tr><td colSpan={9} style={{padding:30,textAlign:'center',color:'#8a9fb8'}}>No patients found</td></tr>:
            patients.map(p=>(
              <tr key={p._id} style={{borderTop:'1px solid #f0f3f8'}}>
                <td style={{padding:'10px 12px',fontWeight:700,color:'#1a3a5c'}}>{p.uhid}</td>
                <td style={{padding:'10px 12px',fontWeight:500}}>{p.firstName} {p.lastName}</td>
                <td style={{padding:'10px 12px',color:'#4a6080'}}>{p.age||'—'} / {p.gender[0]}</td>
                <td style={{padding:'10px 12px'}}>
                  <span style={{background:(bloodColors[p.bloodGroup]||'#999')+'22',color:bloodColors[p.bloodGroup]||'#999',padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:700}}>{p.bloodGroup}</span>
                </td>
                <td style={{padding:'10px 12px'}}>{p.phone}</td>
                <td style={{padding:'10px 12px',color:'#4a6080',fontSize:12}}>{p.abhaNumber||<span style={{color:'#d1d9e6'}}>—</span>}</td>
                <td style={{padding:'10px 12px',textAlign:'center'}}>{p.isAyushmanBharat?'✅':'—'}</td>
                <td style={{padding:'10px 12px',color:'#8a9fb8',fontSize:12}}>{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                <td style={{padding:'10px 12px'}}>
                  <button onClick={()=>setViewing(p)} style={{background:'#dce8f8',border:'none',padding:'5px 10px',borderRadius:6,fontSize:12,cursor:'pointer',color:'#1a3a5c',fontWeight:600}}>View</button>
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

      {/* View Modal */}
      {viewing&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:16}}>
          <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:560,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{padding:'18px 22px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #f0f3f8',background:'#1a3a5c',color:'#fff',borderRadius:'14px 14px 0 0'}}>
              <div>
                <div style={{fontSize:11,opacity:0.7}}>{viewing.uhid}</div>
                <h3 style={{fontSize:17,fontWeight:700}}>{viewing.firstName} {viewing.lastName}</h3>
              </div>
              <button onClick={()=>setViewing(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',borderRadius:8,width:30,height:30,fontSize:16,cursor:'pointer',color:'#fff'}}>✕</button>
            </div>
            <div style={{padding:22}}>
              {[
                ['UHID',viewing.uhid],['Age',viewing.age||'—'],['Gender',viewing.gender],['Blood Group',viewing.bloodGroup],
                ['Phone',viewing.phone],['Alternate Phone',viewing.alternatePhone||'—'],['Email',viewing.email||'—'],
                ['Address',[viewing.address,viewing.city,viewing.pincode].filter(Boolean).join(', ')||'—'],
                ['Aadhaar',viewing.aadhaarNumber||'—'],
                ['ABHA Number',viewing.abhaNumber||'Not registered'],
                ['ABHA Address',viewing.abhaAddress||'—'],
                ['Ayushman Bharat',viewing.isAyushmanBharat?'Yes':'No'],
                ['Insurance Policy',viewing.insurancePolicyNo||'—'],
                ['Allergies',viewing.allergies||'None'],
                ['Chronic Conditions',viewing.chronicConditions||'None'],
                ['Emergency Contact',viewing.emergencyName?`${viewing.emergencyName} (${viewing.emergencyRelation}) - ${viewing.emergencyPhone}`:'—'],
                ['Registered On',new Date(viewing.createdAt).toLocaleString('en-IN')],
              ].map(([k,v])=>(
                <div key={k} style={{display:'flex',gap:16,padding:'8px 0',borderBottom:'1px solid #f8f9fb'}}>
                  <div style={{width:150,fontSize:12,color:'#8a9fb8',fontWeight:600,flexShrink:0}}>{k}</div>
                  <div style={{fontSize:13,color:'#0f1e30'}}>{v}</div>
                </div>
              ))}

              {/* Link ABHA inline form — shown when patient has no ABHA yet */}
              {!viewing.abhaNumber && (
                <div style={{marginTop:16,background:'#e8f4fd',border:'1px solid #b3d7f0',borderRadius:10,padding:14}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#1a5276',marginBottom:10}}>🆔 Link ABHA (no OTP required)</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                    <div>
                      <label style={lbl}>ABHA Number (14-digit)</label>
                      <input value={abhaForm.abhaNumber}
                        onChange={e=>setAbhaForm({...abhaForm, abhaNumber:e.target.value})}
                        placeholder="xx-xxxx-xxxx-xxxx" maxLength={17} style={inp}/>
                    </div>
                    <div>
                      <label style={lbl}>ABHA Address (@abdm)</label>
                      <input value={abhaForm.abhaAddress}
                        onChange={e=>setAbhaForm({...abhaForm, abhaAddress:e.target.value})}
                        placeholder="name@abdm" style={inp}/>
                    </div>
                  </div>
                  <button onClick={linkAbha} disabled={linkingAbha}
                    style={{padding:'8px 18px',background:'#2563eb',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>
                    {linkingAbha ? 'Saving…' : 'Save ABHA'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:16}}>
          <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:660,maxHeight:'94vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{padding:'18px 22px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,background:'#fff',zIndex:1,borderBottom:'1px solid #f0f3f8'}}>
              <h3 style={{fontSize:16,fontWeight:700,color:'#1a3a5c'}}>Register New Patient</h3>
              <button onClick={()=>setShowForm(false)} style={{background:'#f0f3f8',border:'none',borderRadius:8,width:30,height:30,fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <form onSubmit={save} style={{padding:22}}>
              {/* ABHA Section */}
              <div style={{background:'#e8f4fd',border:'1px solid #b3d7f0',borderRadius:10,padding:14,marginBottom:18}}>
                <div style={{fontSize:13,fontWeight:700,color:'#1a5276',marginBottom:10}}>🆔 ABHA Details (Optional — No OTP required)</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div><label style={lbl}>ABHA Number (14-digit)</label><input value={form.abhaNumber} onChange={f('abhaNumber')} placeholder="xx-xxxx-xxxx-xxxx" maxLength={17} style={inp}/></div>
                  <div><label style={lbl}>ABHA Address (@abdm)</label><input value={form.abhaAddress} onChange={f('abhaAddress')} placeholder="name@abdm" style={inp}/></div>
                </div>
              </div>

              {/* Basic Info */}
              <div style={{fontSize:13,fontWeight:700,color:'#1a3a5c',marginBottom:10}}>Basic Information *</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>First Name *</label><input value={form.firstName} onChange={f('firstName')} placeholder="First name" style={inp} required/></div>
                <div><label style={lbl}>Last Name</label><input value={form.lastName} onChange={f('lastName')} placeholder="Last name" style={inp}/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Date of Birth</label><input type="date" value={form.dob} onChange={f('dob')} style={inp}/></div>
                <div><label style={lbl}>Age</label><input type="number" min={0} max={150} value={form.age} onChange={f('age')} placeholder="Years" style={inp}/></div>
                <div><label style={lbl}>Gender *</label>
                  <select value={form.gender} onChange={f('gender')} style={inp}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Blood Group</label>
                  <select value={form.bloodGroup} onChange={f('bloodGroup')} style={inp}>
                    {['A+','A-','B+','B-','O+','O-','AB+','AB-','Unknown'].map(b=><option key={b}>{b}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Phone *</label><input value={form.phone} onChange={f('phone')} placeholder="Mobile number" style={inp} required/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Alternate Phone</label><input value={form.alternatePhone} onChange={f('alternatePhone')} placeholder="Optional" style={inp}/></div>
                <div><label style={lbl}>Email</label><input type="email" value={form.email} onChange={f('email')} placeholder="Optional" style={inp}/></div>
              </div>
              <div style={{marginBottom:12}}><label style={lbl}>Address</label><input value={form.address} onChange={f('address')} placeholder="Street address" style={inp}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>City</label><input value={form.city} onChange={f('city')} placeholder="City" style={inp}/></div>
                <div><label style={lbl}>Pincode</label><input value={form.pincode} onChange={f('pincode')} placeholder="Pincode" maxLength={6} style={inp}/></div>
              </div>
              <div style={{marginBottom:12}}><label style={lbl}>Aadhaar Number</label><input value={form.aadhaarNumber} onChange={f('aadhaarNumber')} placeholder="12-digit Aadhaar" maxLength={12} style={inp}/></div>

              {/* Medical */}
              <div style={{fontSize:13,fontWeight:700,color:'#1a3a5c',margin:'16px 0 10px'}}>Medical History</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Known Allergies</label><input value={form.allergies} onChange={f('allergies')} placeholder="e.g. Penicillin, Dust" style={inp}/></div>
                <div><label style={lbl}>Chronic Conditions</label><input value={form.chronicConditions} onChange={f('chronicConditions')} placeholder="e.g. Diabetes, Hypertension" style={inp}/></div>
              </div>

              {/* Emergency */}
              <div style={{fontSize:13,fontWeight:700,color:'#1a3a5c',margin:'16px 0 10px'}}>Emergency Contact</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Name</label><input value={form.emergencyName} onChange={f('emergencyName')} placeholder="Contact person" style={inp}/></div>
                <div><label style={lbl}>Phone</label><input value={form.emergencyPhone} onChange={f('emergencyPhone')} placeholder="Phone number" style={inp}/></div>
                <div><label style={lbl}>Relation</label><input value={form.emergencyRelation} onChange={f('emergencyRelation')} placeholder="e.g. Son, Wife" style={inp}/></div>
              </div>

              {/* Insurance */}
              <div style={{fontSize:13,fontWeight:700,color:'#1a3a5c',margin:'16px 0 10px'}}>Insurance</div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                <input type="checkbox" id="ab" checked={form.isAyushmanBharat} onChange={f('isAyushmanBharat')} style={{width:16,height:16}}/>
                <label htmlFor="ab" style={{fontSize:13,fontWeight:600,color:'#27ae60',cursor:'pointer'}}>Ayushman Bharat (PMJAY) beneficiary</label>
              </div>
              <div><label style={lbl}>Insurance Policy No.</label><input value={form.insurancePolicyNo} onChange={f('insurancePolicyNo')} placeholder="Policy number (if any)" style={inp}/></div>

              <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:20}}>
                <button type="button" onClick={()=>setShowForm(false)} style={{padding:'9px 18px',background:'#f0f3f8',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>Cancel</button>
                <button type="submit" disabled={saving} style={{padding:'9px 22px',background:'#1a3a5c',color:'#fff',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>{saving?'Registering...':'Register Patient'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
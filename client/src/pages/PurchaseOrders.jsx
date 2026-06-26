import { useEffect, useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const lbl={display:'block',fontSize:12,fontWeight:600,color:'#4a6080',marginBottom:5};
const inp={width:'100%',padding:'9px 11px',border:'1px solid #d1d9e6',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'};
const stColors={Pending:'#f39c12',Approved:'#27ae60',Rejected:'#e74c3c',Delivered:'#3498db',Cancelled:'#7f8c8d'};
const emptyForm={vendor:'',vendorContact:'',department:'',items:'',totalAmount:0,priority:'Normal',remarks:'',expectedDelivery:''};

export default function PurchaseOrders() {
  const [pos,setPos]=useState([]);
  const [depts,setDepts]=useState([]);
  const [total,setTotal]=useState(0);
  const [pages,setPages]=useState(1);
  const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState(emptyForm);
  const [saving,setSaving]=useState(false);
  const [filterStatus,setFilterStatus]=useState('');
  const [viewing,setViewing]=useState(null);

  useEffect(()=>{ api.get('/departments').then(r=>setDepts(r.data)).catch(()=>{}); },[]);

  const load=()=>{
    setLoading(true);
    const q=new URLSearchParams({page,limit:15,...(filterStatus?{status:filterStatus}:{})}).toString();
    api.get(`/purchase?${q}`).then(r=>{setPos(r.data.pos);setTotal(r.data.total);setPages(r.data.pages);setLoading(false);}).catch(()=>setLoading(false));
  };
  useEffect(load,[filterStatus,page]);

  const save=async(e)=>{
    e.preventDefault();
    if(!form.vendor||!form.items||!form.totalAmount)return toast.error('Vendor, items and amount required');
    setSaving(true);
    try{
      const dept=depts.find(d=>d._id===form.department);
      await api.post('/purchase',{...form,departmentName:dept?.name||''});
      toast.success('Purchase order created!');setShowForm(false);load();
    }catch(err){toast.error(err.response?.data?.message||'Error');}
    finally{setSaving(false);}
  };

  const approve=async(id)=>{
    try{await api.put(`/purchase/${id}/approve`);toast.success('PO Approved!');load();}
    catch(err){toast.error('Error approving');}
  };

  const reject=async(id)=>{
    if(!window.confirm('Reject this PO?'))return;
    try{await api.put(`/purchase/${id}/reject`);toast.success('PO Rejected');load();}
    catch(err){toast.error('Error rejecting');}
  };

  const pendingCount=pos.filter(p=>p.status==='Pending').length;

  return(
    <div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div>
          <h2 style={{fontSize:20,fontWeight:700,color:'#1a3a5c'}}>🛒 Purchase Orders</h2>
          <p style={{fontSize:13,color:'#4a6080',marginTop:3}}>Total {total} orders{pendingCount>0?` | ⚠️ ${pendingCount} pending approval`:''}</p>
        </div>
        <button onClick={()=>{setForm(emptyForm);setShowForm(true);}} style={{background:'#1a3a5c',color:'#fff',border:'none',padding:'9px 18px',borderRadius:8,fontWeight:600,fontSize:13,cursor:'pointer'}}>+ Create PO</button>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',gap:12,marginBottom:18}}>
        {[{l:'Total',v:total,c:'#1a3a5c'},{l:'Pending',v:pos.filter(p=>p.status==='Pending').length,c:'#f39c12'},{l:'Approved',v:pos.filter(p=>p.status==='Approved').length,c:'#27ae60'},{l:'Delivered',v:pos.filter(p=>p.status==='Delivered').length,c:'#3498db'}].map(s=>(
          <div key={s.l} style={{background:'#fff',border:'1px solid #e4e9f2',borderRadius:10,padding:'12px 14px',borderLeft:`4px solid ${s.c}`}}>
            <div style={{fontSize:10,fontWeight:600,color:'#8a9fb8',textTransform:'uppercase'}}>{s.l}</div>
            <div style={{fontSize:24,fontWeight:700,color:'#0f1e30',marginTop:3}}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        {['','Pending','Approved','Rejected','Delivered','Cancelled'].map(s=>(
          <button key={s||'all'} onClick={()=>{setFilterStatus(s);setPage(1);}} style={{padding:'7px 14px',background:filterStatus===s?'#1a3a5c':'#f0f3f8',color:filterStatus===s?'#fff':'#4a6080',border:'none',borderRadius:8,cursor:'pointer',fontWeight:600,fontSize:12}}>
            {s||'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{background:'#fff',border:'1px solid #e4e9f2',borderRadius:12,overflow:'auto',boxShadow:'0 1px 6px rgba(0,0,0,0.06)'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,minWidth:800}}>
          <thead style={{background:'#f8f9fb'}}>
            <tr>{['PO Number','Vendor','Department','Amount','Priority','Status','Requested By','Approved By','Actions'].map(h=><th key={h} style={{padding:'10px 12px',textAlign:'left',fontSize:11,fontWeight:700,color:'#8a9fb8',textTransform:'uppercase',whiteSpace:'nowrap'}}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading?<tr><td colSpan={9} style={{padding:30,textAlign:'center',color:'#8a9fb8'}}>Loading...</td></tr>:
            pos.length===0?<tr><td colSpan={9} style={{padding:30,textAlign:'center',color:'#8a9fb8'}}>No purchase orders found</td></tr>:
            pos.map(p=>(
              <tr key={p._id} style={{borderTop:'1px solid #f0f3f8'}}>
                <td style={{padding:'10px 12px',fontWeight:700,color:'#1a3a5c'}}>{p.poNumber}</td>
                <td style={{padding:'10px 12px',fontWeight:500}}>{p.vendor}</td>
                <td style={{padding:'10px 12px',color:'#4a6080'}}>{p.departmentName||'—'}</td>
                <td style={{padding:'10px 12px',fontWeight:700,color:'#27ae60'}}>₹{p.totalAmount?.toLocaleString('en-IN')}</td>
                <td style={{padding:'10px 12px'}}>
                  <span style={{background:p.priority==='Critical'?'#fee8e8':p.priority==='Urgent'?'#fef3e2':'#f0f3f8',color:p.priority==='Critical'?'#e74c3c':p.priority==='Urgent'?'#c87a00':'#4a6080',padding:'2px 9px',borderRadius:20,fontSize:11,fontWeight:600}}>{p.priority}</span>
                </td>
                <td style={{padding:'10px 12px'}}>
                  <span style={{background:(stColors[p.status]||'#999')+'22',color:stColors[p.status]||'#999',padding:'2px 9px',borderRadius:20,fontSize:11,fontWeight:600}}>{p.status}</span>
                </td>
                <td style={{padding:'10px 12px',color:'#4a6080',fontSize:12}}>{p.requestedByName||'—'}</td>
                <td style={{padding:'10px 12px',color:'#4a6080',fontSize:12}}>{p.approvedByName||'—'}</td>
                <td style={{padding:'10px 12px'}}>
                  <div style={{display:'flex',gap:5}}>
                    <button onClick={()=>setViewing(p)} style={{background:'#f0f3f8',border:'none',padding:'5px 9px',borderRadius:6,fontSize:11,cursor:'pointer',fontWeight:600}}>View</button>
                    {p.status==='Pending'&&<>
                      <button onClick={()=>approve(p._id)} style={{background:'#d6f0e4',border:'none',padding:'5px 9px',borderRadius:6,fontSize:11,cursor:'pointer',color:'#27ae60',fontWeight:600}}>Approve</button>
                      <button onClick={()=>reject(p._id)} style={{background:'#fee8e8',border:'none',padding:'5px 9px',borderRadius:6,fontSize:11,cursor:'pointer',color:'#e74c3c',fontWeight:600}}>Reject</button>
                    </>}
                    {p.status==='Approved'&&<button onClick={async()=>{await api.put(`/purchase/${p._id}`,{status:'Delivered'});toast.success('Marked as delivered');load();}} style={{background:'#dce8f8',border:'none',padding:'5px 9px',borderRadius:6,fontSize:11,cursor:'pointer',color:'#1a3a5c',fontWeight:600}}>Delivered</button>}
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

      {/* View Modal */}
      {viewing&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:16}}>
          <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:540,maxHeight:'88vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{padding:'18px 22px',display:'flex',justifyContent:'space-between',alignItems:'center',background:'#1a3a5c',color:'#fff',borderRadius:'14px 14px 0 0'}}>
              <div><div style={{fontSize:11,opacity:0.7}}>Purchase Order</div><h3 style={{fontSize:16,fontWeight:700}}>{viewing.poNumber}</h3></div>
              <button onClick={()=>setViewing(null)} style={{background:'rgba(255,255,255,0.2)',border:'none',borderRadius:8,width:30,height:30,fontSize:16,cursor:'pointer',color:'#fff'}}>✕</button>
            </div>
            <div style={{padding:20}}>
              {[['Vendor',viewing.vendor],['Vendor Contact',viewing.vendorContact||'—'],['Department',viewing.departmentName||'—'],['Total Amount',`₹${viewing.totalAmount?.toLocaleString('en-IN')}`],['Priority',viewing.priority],['Status',viewing.status],['Requested By',viewing.requestedByName||'—'],['Approved By',viewing.approvedByName||'—'],['Expected Delivery',viewing.expectedDelivery?new Date(viewing.expectedDelivery).toLocaleDateString('en-IN'):'—'],['Remarks',viewing.remarks||'—'],['Created On',new Date(viewing.createdAt).toLocaleString('en-IN')]].map(([k,v])=>(
                <div key={k} style={{display:'flex',gap:16,padding:'8px 0',borderBottom:'1px solid #f8f9fb'}}>
                  <div style={{width:140,fontSize:12,color:'#8a9fb8',fontWeight:600,flexShrink:0}}>{k}</div>
                  <div style={{fontSize:13}}>{v}</div>
                </div>
              ))}
              <div style={{marginTop:12}}>
                <div style={{fontSize:12,color:'#8a9fb8',fontWeight:600,marginBottom:6}}>Items</div>
                <div style={{background:'#f8f9fb',borderRadius:8,padding:'10px 14px',fontSize:13,whiteSpace:'pre-wrap'}}>{viewing.items}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create PO Modal */}
      {showForm&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:16}}>
          <div style={{background:'#fff',borderRadius:14,width:'100%',maxWidth:560,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.3)'}}>
            <div style={{padding:'18px 22px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0,background:'#fff',zIndex:1,borderBottom:'1px solid #f0f3f8'}}>
              <h3 style={{fontSize:16,fontWeight:700,color:'#1a3a5c'}}>Create Purchase Order</h3>
              <button onClick={()=>setShowForm(false)} style={{background:'#f0f3f8',border:'none',borderRadius:8,width:30,height:30,fontSize:16,cursor:'pointer'}}>✕</button>
            </div>
            <form onSubmit={save} style={{padding:22}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Vendor Name *</label><input value={form.vendor} onChange={e=>setForm({...form,vendor:e.target.value})} placeholder="Company/vendor name" style={inp} required/></div>
                <div><label style={lbl}>Vendor Contact</label><input value={form.vendorContact} onChange={e=>setForm({...form,vendorContact:e.target.value})} placeholder="Phone or email" style={inp}/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Department</label>
                  <select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={inp}>
                    <option value="">Select Department</option>
                    {depts.map(d=><option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Priority</label>
                  <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} style={inp}>
                    <option>Normal</option><option>Urgent</option><option>Critical</option>
                  </select>
                </div>
              </div>
              <div style={{marginBottom:12}}><label style={lbl}>Items (List all items) *</label><textarea value={form.items} onChange={e=>setForm({...form,items:e.target.value})} rows={4} placeholder="Item 1 - Qty - Unit Price&#10;Item 2 - Qty - Unit Price" style={{...inp,resize:'vertical'}} required/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                <div><label style={lbl}>Total Amount (₹) *</label><input type="number" min={0} value={form.totalAmount} onChange={e=>setForm({...form,totalAmount:+e.target.value})} style={inp} required/></div>
                <div><label style={lbl}>Expected Delivery</label><input type="date" value={form.expectedDelivery} onChange={e=>setForm({...form,expectedDelivery:e.target.value})} style={inp}/></div>
              </div>
              <div style={{marginBottom:16}}><label style={lbl}>Remarks / Justification</label><textarea value={form.remarks} onChange={e=>setForm({...form,remarks:e.target.value})} rows={2} placeholder="Reason for purchase..." style={{...inp,resize:'vertical'}}/></div>
              <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
                <button type="button" onClick={()=>setShowForm(false)} style={{padding:'9px 18px',background:'#f0f3f8',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>Cancel</button>
                <button type="submit" disabled={saving} style={{padding:'9px 22px',background:'#1a3a5c',color:'#fff',border:'none',borderRadius:8,fontWeight:600,cursor:'pointer'}}>{saving?'Creating...':'Create PO'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
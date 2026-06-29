require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
const License = require('../models/License');
const Patient = require('../models/Patient');
const OPDVisit = require('../models/OPDVisit');
const IPDAdmission = require('../models/IPDAdmission');
const Update = require('../models/Update');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create departments
  const deptData = [
    { name:'Cardiology',       code:'CARD',  description:'Heart & cardiovascular care',   headDoctor:'Dr. Arvind Patel',  totalBeds:15, color:'#e74c3c' },
    { name:'General Surgery',  code:'SURG',  description:'Surgical procedures',           headDoctor:'Dr. Rajan Kumar',   totalBeds:20, color:'#2ecc71' },
    { name:'Gynecology & OBG', code:'GYNEC', description:'Women health & maternity',      headDoctor:'Dr. Sneha Mehta',   totalBeds:25, color:'#e91e8c' },
    { name:'ICU / ICCU',       code:'ICU',   description:'Intensive critical care',       headDoctor:'Dr. Priya Nair',    totalBeds:10, color:'#e74c3c' },
    { name:'Pediatrics',       code:'PEDS',  description:'Children health care',          headDoctor:'Dr. Anil Sharma',   totalBeds:15, color:'#3498db' },
    { name:'Orthopedics',      code:'ORTH',  description:'Bone & joint care',             headDoctor:'Dr. Amit Joshi',    totalBeds:20, color:'#f39c12' },
    { name:'Pathology / Lab',  code:'LAB',   description:'Diagnostics & lab tests',      headDoctor:'Dr. Meena Patil',   totalBeds:0,  color:'#9b59b6' },
    { name:'Radiology',        code:'RADIO', description:'Imaging & radiology',           headDoctor:'Dr. Suresh Rao',    totalBeds:0,  color:'#1abc9c' },
    { name:'Pharmacy',         code:'PHARM', description:'Medicine dispensing & stock',  headDoctor:'Mr. Vikram Joshi',  totalBeds:0,  color:'#27ae60' },
    { name:'Emergency',        code:'EMRG',  description:'24/7 emergency services',      headDoctor:'Dr. Kavya Singh',   totalBeds:10, color:'#c0392b' },
    { name:'OPD',              code:'OPD',   description:'Outpatient department',        headDoctor:'Dr. Ramesh Patil',  totalBeds:0,  color:'#2980b9' },
    { name:'General Ward',     code:'GWD',   description:'General inpatient care',       headDoctor:'Dr. Sunita Kamble', totalBeds:40, color:'#16a085' },
    { name:'Scheme',           code:'SCHM',  description:'Govt. health schemes (PMJAY / Ayushman)', headDoctor:'Mr. Ganesh Patil', totalBeds:0, color:'#8b5cf6' },
  ];

  let depts = {};
  for (const d of deptData) {
    let dept = await Department.findOne({ code: d.code });
    if (!dept) dept = await Department.create(d);
    depts[d.code] = dept;
    console.log(`  Dept: ${d.name}`);
  }

  // Create Chairman
  let chairman = await User.findOne({ username: 'chairman' });
  if (!chairman) {
    chairman = await User.create({
      name: 'Shri S R Patil', username: 'chairman', password: 'chairman@123',
      role: 'chairman', email: 'chairman@srphospital.in',
      permissions: { canViewOPD:true, canViewIPD:true, canViewStaff:true, canViewReports:true, canViewPurchase:true, canPostUpdates:true }
    });
    console.log('  Created: chairman / chairman@123');
  }

  // Create Admin
  let admin = await User.findOne({ username: 'admin' });
  if (!admin) {
    admin = await User.create({
      name: 'Hospital Admin', username: 'admin', password: 'admin@123',
      role: 'admin', email: 'admin@srphospital.in',
      permissions: { canViewOPD:true, canViewIPD:true, canViewStaff:true, canViewReports:true, canViewPurchase:true, canPostUpdates:true }
    });
    console.log('  Created: admin / admin@123');
  }

  // Create Accountant
  let accountant = await User.findOne({ username: 'accountant' });
  if (!accountant) {
    accountant = await User.create({
      name: 'Chief Accountant', username: 'accountant', password: 'account@123',
      role: 'accountant', email: 'accounts@srphospital.in',
      permissions: {
        canViewOPD:false, canViewIPD:false, canViewStaff:false, canViewReports:false,
        canViewPurchase:true, canPostUpdates:true, canCreatePurchase:true,
      },
    });
    console.log('  Created: accountant / account@123');
  }

  // Create department users
  const deptUsers = [
    { name:'Dr. Arvind Patel',  username:'cardiology',  dept:'CARD',  deptName:'Cardiology',       perms:{canViewOPD:true, canPostUpdates:true} },
    { name:'Dr. Rajan Kumar',   username:'surgery',     dept:'SURG',  deptName:'General Surgery',  perms:{canViewOPD:true, canViewIPD:true, canPostUpdates:true} },
    { name:'Dr. Sneha Mehta',   username:'gynecology',  dept:'GYNEC', deptName:'Gynecology & OBG', perms:{canViewOPD:true, canViewIPD:true, canPostUpdates:true} },
    { name:'ICU Admin',         username:'icu',         dept:'ICU',   deptName:'ICU / ICCU',       perms:{canViewIPD:true, canPostUpdates:true} },
    { name:'Lab Admin',         username:'lab',         dept:'LAB',   deptName:'Pathology / Lab',  perms:{canPostUpdates:true} },
    { name:'Pharmacy Admin',    username:'pharmacy',    dept:'PHARM', deptName:'Pharmacy',         perms:{canPostUpdates:true} },
    { name:'OPD Desk',          username:'opd',         dept:'OPD',   deptName:'OPD',              perms:{canViewOPD:true, canPostUpdates:true} },
    { name:'Emergency Admin',   username:'emergency',   dept:'EMRG',  deptName:'Emergency',        perms:{canViewOPD:true, canViewIPD:true, canPostUpdates:true} },
    { name:'Scheme Officer',    username:'scheme',      dept:'SCHM',  deptName:'Scheme',           perms:{canViewOPD:true, canPostUpdates:true} },
  ];

  const deptUserDocs = {};
  for (const du of deptUsers) {
    let u = await User.findOne({ username: du.username });
    if (!u) {
      u = await User.create({
        name: du.name, username: du.username, password: `${du.username}@123`,
        role: 'department', department: depts[du.dept]._id, departmentName: du.deptName,
        permissions: {
          canViewOPD:      !!du.perms.canViewOPD,
          canViewIPD:      !!du.perms.canViewIPD,
          canViewStaff:    false, canViewReports: false, canViewPurchase: false,
          canPostUpdates:  du.perms.canPostUpdates !== false,
        }
      });
      console.log(`  Created: ${du.username} / ${du.username}@123`);
    }
    deptUserDocs[du.username] = u;
  }

  // Sample patients (so dashboards aren't empty)
  const patientCount = await Patient.countDocuments();
  if (patientCount === 0) {
    const samplePatients = [
      { firstName:'Ramesh',   lastName:'Patil',   gender:'Male',   age:54, phone:'9876543210', abhaNumber:'12345678901234', bloodGroup:'B+',  city:'Badgandi' },
      { firstName:'Sita',     lastName:'Kamble',  gender:'Female', age:32, phone:'9876543211', abhaNumber:'23456789012345', bloodGroup:'O+',  city:'Belgaum', isAyushmanBharat:true },
      { firstName:'Vijay',    lastName:'Desai',   gender:'Male',   age:67, phone:'9876543212', abhaNumber:'34567890123456', bloodGroup:'A+',  city:'Hubli' },
      { firstName:'Anita',    lastName:'Joshi',   gender:'Female', age:28, phone:'9876543213', abhaNumber:'45678901234567', bloodGroup:'AB+', city:'Dharwad' },
      { firstName:'Suresh',   lastName:'Naik',    gender:'Male',   age:45, phone:'9876543214',                              bloodGroup:'B-',  city:'Badgandi' },
    ];
    for (const p of samplePatients) {
      await Patient.create({ ...p, registeredBy: admin._id });
    }
    console.log(`  Patients: ${samplePatients.length}`);
  }

  // Sample OPD visits for today
  const today = new Date(); today.setHours(0,0,0,0);
  const opdCount = await OPDVisit.countDocuments({ visitDate: { $gte: today } });
  if (opdCount === 0) {
    const patients = await Patient.find().limit(5);
    const opdSeed = [];
    for (let i = 0; i < patients.length; i++) {
      const p = patients[i];
      const dCode = ['CARD','OPD','GYNEC','PEDS','EMRG'][i % 5];
      const dept = depts[dCode];
      opdSeed.push({
        patient: p._id, patientName: `${p.firstName} ${p.lastName}`, uhid: p.uhid,
        department: dept._id, departmentName: dept.name,
        doctor: ['Dr. Arvind Patel','OPD Desk','Dr. Sneha Mehta','Dr. Anil Sharma','Dr. Kavya Singh'][i % 5],
        visitType: i % 3 === 0 ? 'Follow-up' : 'New',
        chiefComplaint: ['Chest pain','Fever','Routine check','Cough','Headache'][i],
        status: ['Waiting','In-Consultation','Done'][i % 3],
        fees: 200, paymentStatus: 'Paid',
        registeredBy: deptUserDocs[['cardiology','opd','gynecology','opd','emergency'][i % 5]]?._id || admin._id,
      });
    }
    for (const v of opdSeed) await OPDVisit.create(v);
    console.log(`  OPD visits: ${opdSeed.length}`);
  }

  // Sample IPD admissions
  const ipdCount = await IPDAdmission.countDocuments({ status: 'Admitted' });
  if (ipdCount === 0) {
    const patients = await Patient.find().limit(3);
    const ipdSeed = patients.map((p, i) => ({
      patient: p._id, patientName: `${p.firstName} ${p.lastName}`, uhid: p.uhid,
      department: depts[['ICU','SURG','GWD'][i]]._id,
      departmentName: depts[['ICU','SURG','GWD'][i]].name,
      admittingDoctor: ['Dr. Priya Nair','Dr. Rajan Kumar','Dr. Sunita Kamble'][i],
      ward: ['ICU-A','Surgery Ward','General Ward'][i],
      bedNumber: ['A-01','SW-12','GW-04'][i],
      admissionType: i === 0 ? 'Emergency' : 'Planned',
      diagnosis: ['Cardiac arrest observation','Post-op recovery','Pneumonia'][i],
      totalAmount: 25000, paidAmount: 10000,
      registeredBy: deptUserDocs[['icu','surgery','opd'][i]]?._id || admin._id,
    }));
    for (const a of ipdSeed) await IPDAdmission.create(a);
    console.log(`  IPD admissions: ${ipdSeed.length}`);
  }

  // Sample updates
  const updateCount = await Update.countDocuments();
  if (updateCount === 0) {
    const updSeed = [
      { title:'OPD running on schedule',     content:'Token system in place. Average wait 12 minutes.',  type:'info',    departmentName:'OPD',          postedBy: deptUserDocs['opd']?._id },
      { title:'ICU bed availability',        content:'3 ICU beds free as of 09:30.',                    type:'success', departmentName:'ICU / ICCU',  postedBy: deptUserDocs['icu']?._id },
      { title:'Power shutdown notice',       content:'Generator test on Saturday 10am–11am.',          type:'warning', departmentName:'General Ward',postedBy: admin._id },
    ];
    for (const u of updSeed) {
      await Update.create({
        title: u.title, content: u.content, type: u.type,
        departmentName: u.departmentName,
        postedBy: u.postedBy, postedByName: (await User.findById(u.postedBy))?.name || 'Admin',
      });
    }
    console.log(`  Updates: ${updSeed.length}`);
  }

  // Sample licenses
  const licenseData = [
    { name:'Hospital Registration',  authority:'State Health Dept.', licenseNo:'KAR/HOS/4421', issueDate: new Date('2023-04-01'), expiryDate: new Date('2026-03-31'), responsible:'CEO' },
    { name:'NMC Accreditation',      authority:'NMC India',          licenseNo:'NMC/2022/8931', issueDate: new Date('2022-01-15'), expiryDate: new Date('2026-01-14'), responsible:'Medical Supt.' },
    { name:'Fire NOC',               authority:'Fire Department',    licenseNo:'FIRE/KAR/0892', issueDate: new Date('2022-12-01'), expiryDate: new Date('2024-11-30'), responsible:'Admin Officer' },
    { name:'Blood Bank License',     authority:'DCGI',               licenseNo:'BB/KAR/214',   issueDate: new Date('2023-09-01'), expiryDate: new Date('2026-08-31'), responsible:'Blood Bank Officer' },
    { name:'Pharmacy License',       authority:'State Pharmacy',    licenseNo:'PH/KAR/8821',  issueDate: new Date('2023-06-01'), expiryDate: new Date('2026-05-31'), responsible:'Chief Pharmacist' },
    { name:'Bio-Medical Waste',      authority:'KSPCB',              licenseNo:'BMW/2022/441', issueDate: new Date('2022-08-15'), expiryDate: new Date('2025-08-14'), responsible:'Infection Control' },
    { name:'Clinical Lab NABL',      authority:'NABL',               licenseNo:'NABL/MC/2248', issueDate: new Date('2023-11-01'), expiryDate: new Date('2026-10-31'), responsible:'Lab Head' },
    { name:'CT Scan AERB',           authority:'AERB',               licenseNo:'AERB/CT/1124', issueDate: new Date('2024-02-01'), expiryDate: new Date('2027-01-31'), responsible:'Radiology Head' },
  ];

  for (const l of licenseData) {
    const ex = await License.findOne({ licenseNo: l.licenseNo });
    if (!ex) { await License.create({ ...l, addedBy: admin._id }); console.log(`  License: ${l.name}`); }
  }

  console.log('\n✅ Seed complete!\n');
  console.log('═══════════════════════════════════════');
  console.log('LOGIN CREDENTIALS:');
  console.log('  Chairman  : chairman  / chairman@123');
  console.log('  Admin     : admin     / admin@123');
  console.log('  Accountant: accountant / account@123');
  console.log('  Dept users: e.g. opd / opd@123, scheme / scheme@123');
  console.log('═══════════════════════════════════════');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
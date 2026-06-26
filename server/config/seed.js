require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
const License = require('../models/License');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Create departments
  const deptData = [
    { name:'Cardiology',       code:'CARD', description:'Heart & cardiovascular care',   headDoctor:'Dr. Arvind Patel',  totalBeds:15, color:'#e74c3c' },
    { name:'General Surgery',  code:'SURG', description:'Surgical procedures',           headDoctor:'Dr. Rajan Kumar',   totalBeds:20, color:'#2ecc71' },
    { name:'Gynecology & OBG', code:'GYNEC',description:'Women health & maternity',      headDoctor:'Dr. Sneha Mehta',   totalBeds:25, color:'#e91e8c' },
    { name:'ICU / ICCU',       code:'ICU',  description:'Intensive critical care',       headDoctor:'Dr. Priya Nair',    totalBeds:10, color:'#e74c3c' },
    { name:'Pediatrics',       code:'PEDS', description:'Children health care',          headDoctor:'Dr. Anil Sharma',   totalBeds:15, color:'#3498db' },
    { name:'Orthopedics',      code:'ORTH', description:'Bone & joint care',             headDoctor:'Dr. Amit Joshi',    totalBeds:20, color:'#f39c12' },
    { name:'Pathology / Lab',  code:'LAB',  description:'Diagnostics & lab tests',      headDoctor:'Dr. Meena Patil',   totalBeds:0,  color:'#9b59b6' },
    { name:'Radiology',        code:'RADIO',description:'Imaging & radiology',           headDoctor:'Dr. Suresh Rao',    totalBeds:0,  color:'#1abc9c' },
    { name:'Pharmacy',         code:'PHARM',description:'Medicine dispensing & stock',  headDoctor:'Mr. Vikram Joshi',  totalBeds:0,  color:'#27ae60' },
    { name:'Emergency',        code:'EMRG', description:'24/7 emergency services',      headDoctor:'Dr. Kavya Singh',   totalBeds:10, color:'#c0392b' },
    { name:'OPD',              code:'OPD',  description:'Outpatient department',        headDoctor:'Dr. Ramesh Patil',  totalBeds:0,  color:'#2980b9' },
    { name:'General Ward',     code:'GWD',  description:'General inpatient care',       headDoctor:'Dr. Sunita Kamble', totalBeds:40, color:'#16a085' },
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

  // Create department users
  const deptUsers = [
    { name:'Dr. Arvind Patel',  username:'cardiology',  dept:'CARD', deptName:'Cardiology'       },
    { name:'Dr. Rajan Kumar',   username:'surgery',     dept:'SURG', deptName:'General Surgery'  },
    { name:'Dr. Sneha Mehta',   username:'gynecology',  dept:'GYNEC',deptName:'Gynecology & OBG' },
    { name:'ICU Admin',         username:'icu',         dept:'ICU',  deptName:'ICU / ICCU'       },
    { name:'Lab Admin',         username:'lab',         dept:'LAB',  deptName:'Pathology / Lab'  },
    { name:'Pharmacy Admin',    username:'pharmacy',    dept:'PHARM',deptName:'Pharmacy'         },
    { name:'OPD Desk',          username:'opd',         dept:'OPD',  deptName:'OPD'              },
    { name:'Emergency Admin',   username:'emergency',   dept:'EMRG', deptName:'Emergency'        },
  ];

  for (const du of deptUsers) {
    let u = await User.findOne({ username: du.username });
    if (!u) {
      await User.create({
        name: du.name, username: du.username, password: `${du.username}@123`,
        role: 'department', department: depts[du.dept]._id, departmentName: du.deptName,
        permissions: { canViewOPD:true, canViewIPD:false, canViewStaff:false, canViewReports:false, canViewPurchase:false, canPostUpdates:true }
      });
      console.log(`  Created: ${du.username} / ${du.username}@123`);
    }
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
  console.log('  Chairman : chairman / chairman@123');
  console.log('  Admin    : admin    / admin@123');
  console.log('  Dept users: e.g. cardiology / cardiology@123');
  console.log('═══════════════════════════════════════');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
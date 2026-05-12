// ── AUTH ──────────────────────────────────────────────────
const ADMIN_PASS_KEY='srms_admin_pass';
const SESSION_KEY='srms_session';
let currentRole=null;
let currentStudentId=null;

function getAdminPass(){return localStorage.getItem(ADMIN_PASS_KEY)||'admin123'}

function switchAuthTab(tab,el){
  document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('authAdmin').style.display=tab==='admin'?'block':'none';
  document.getElementById('authStudent').style.display=tab==='student'?'block':'none';
  document.getElementById('adminError').classList.remove('show');
  document.getElementById('studentError').classList.remove('show');
}

function loginAdmin(){
  const pass=document.getElementById('adminPass').value;
  if(pass===getAdminPass()){
    currentRole='admin';currentStudentId=null;
    sessionStorage.setItem(SESSION_KEY,JSON.stringify({role:'admin'}));
    enterApp();
  }else{
    document.getElementById('adminError').classList.add('show');
    document.getElementById('adminPass').value='';
  }
}

function loginStudent(){
  const roll=document.getElementById('studentRoll').value.trim().toUpperCase();
  const found=students.find(s=>s.roll.toUpperCase()===roll);
  if(found){
    currentRole='student';currentStudentId=found.id;
    sessionStorage.setItem(SESSION_KEY,JSON.stringify({role:'student',id:found.id}));
    enterApp();
    viewDetail(found.id);
  }else{
    document.getElementById('studentError').classList.add('show');
  }
}

function enterApp(){
  document.getElementById('authScreen').classList.add('hidden');
  const badge=document.getElementById('roleBadge');
  const label=document.getElementById('roleLabel');
  
  if(currentRole==='admin'){
    badge.className='role-badge admin';
    label.textContent='Admin';
    document.getElementById('addStudentBtn').style.display='';
    document.querySelectorAll('.sidebar .nav-item, .sidebar .stat-mini-item, .sidebar .nav-group-label').forEach(el=>el.style.display='');
    document.querySelector('.sidebar').style.display='';
  }else{
    badge.className='role-badge student';
    label.textContent='Student View';
    document.getElementById('addStudentBtn').style.display='none';
    document.querySelector('.search-wrap').style.display='none';
    document.querySelector('.sidebar').style.display='none';
    document.querySelector('.shell').style.gridTemplateColumns='1fr';
  }
  renderAll();
}

function logout(){
  sessionStorage.removeItem(SESSION_KEY);
  currentRole=null;currentStudentId=null;
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('adminPass').value='';
  document.getElementById('studentRoll').value='';
  document.getElementById('adminError').classList.remove('show');
  document.getElementById('studentError').classList.remove('show');
  document.querySelector('.search-wrap').style.display='';
  document.querySelector('.sidebar').style.display='';
  document.querySelector('.shell').style.gridTemplateColumns='';
}

function isAdmin(){return currentRole==='admin'}

function restoreSession(){
  const raw=sessionStorage.getItem(SESSION_KEY);
  if(!raw)return false;
  try{
    const s=JSON.parse(raw);
    if(s.role==='admin'){
      currentRole='admin';
      enterApp();
      return true;
    }else if(s.role==='student'&&s.id){
      const found=students.find(x=>x.id===s.id);
      if(found){
        currentRole='student';currentStudentId=s.id;
        enterApp();
        viewDetail(s.id);
        return true;
      }
    }
  }catch(e){}
  return false;
}

// ── DATA ──────────────────────────────────────────────────
const SUBJECTS = ['Mathematics','Physics / Science','Programming','Electronics / Core','English / Comm.','Elective'];
const SUBJECT_KEYS = ['m1','m2','m3','m4','m5','m6'];
let students = JSON.parse(localStorage.getItem('srms_students') || '[]');
let editId = null;
let currentSearch = '';

function save(){localStorage.setItem('srms_students',JSON.stringify(students))}

// ── GRADE / GPA CALC ──────────────────────────────────────
function calcGPA(avg){
  if(avg>=90)return 10;if(avg>=80)return 9;if(avg>=70)return 8;
  if(avg>=60)return 7;if(avg>=50)return 6;if(avg>=40)return 5;return 0;
}
function calcGrade(avg){
  if(avg>=90)return'A+';if(avg>=80)return'A';if(avg>=70)return'B+';
  if(avg>=60)return'B';if(avg>=50)return'C';if(avg>=40)return'D';return'F';
}
function isPass(marks){return marks.every(m=>m>=40)}
function avg(marks){return marks.reduce((a,b)=>a+b,0)/marks.length}

function gradeClass(g){
  if(g.startsWith('A'))return'grade-A';
  if(g.startsWith('B'))return'grade-B';
  if(g.startsWith('C'))return'grade-C';
  if(g.startsWith('D'))return'grade-D';
  return'grade-F';
}
function progressColor(pct){
  if(pct>=80)return'var(--accent)';
  if(pct>=60)return'var(--info)';
  if(pct>=40)return'var(--warn)';
  return'var(--danger)';
}

function toast(msg,type='success'){
  const t=document.createElement('div');
  t.className=`toast ${type}`;
  t.innerHTML=`<span>${type==='success'?'✓':type==='error'?'✕':'i'}</span>${msg}`;
  document.getElementById('toastWrap').appendChild(t);
  setTimeout(()=>{t.style.animation='fadeOut .3s ease forwards';setTimeout(()=>t.remove(),300)},2800);
}

// ── NAVIGATION ────────────────────────────────────────────
function showPage(id,el){
  if(currentRole==='student' && id!=='detail'){
    toast('Students can only view their own results.','error');
    return;
  }
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  if(el)el.classList.add('active');
  if(id==='dashboard')renderDashboard();
  if(id==='students')renderStudentsTable();
  if(id==='analytics')renderAnalytics();
}

// ── MODAL (admin only) ────────────────────────────────────
function openAddModal(){
  if(!isAdmin()){toast('Only admins can add students.','error');return;}
  editId=null;
  document.getElementById('modalTitle').textContent='Add New Student';
  ['fRoll','fName','fM1','fM2','fM3','fM4','fM5','fM6'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('fBranch').value='ECE';
  document.getElementById('fSem').value='1';
  document.getElementById('studentModal').classList.add('open');
}
function openEditModal(id){
  if(!isAdmin()){toast('Only admins can edit student records.','error');return;}
  const s=students.find(x=>x.id===id);if(!s)return;
  editId=id;
  document.getElementById('modalTitle').textContent='Edit Student';
  document.getElementById('fRoll').value=s.roll;
  document.getElementById('fName').value=s.name;
  document.getElementById('fBranch').value=s.branch;
  document.getElementById('fSem').value=s.sem;
  SUBJECT_KEYS.forEach((k,i)=>document.getElementById('fM'+(i+1)).value=s.marks[k]);
  document.getElementById('studentModal').classList.add('open');
}
function closeModal(){document.getElementById('studentModal').classList.remove('open')}

function saveStudent(){
  if(!isAdmin()){toast('Permission denied.','error');closeModal();return;}
  const roll=document.getElementById('fRoll').value.trim();
  const name=document.getElementById('fName').value.trim();
  if(!roll||!name){toast('Roll number and name are required.','error');return;}
  const marks={};
  let valid=true;
  SUBJECT_KEYS.forEach((k,i)=>{
    const v=parseInt(document.getElementById('fM'+(i+1)).value);
    if(isNaN(v)||v<0||v>100){valid=false;return;}
    marks[k]=v;
  });
  if(!valid){toast('Enter valid marks (0–100) for all subjects.','error');return;}
  const marksArr=SUBJECT_KEYS.map(k=>marks[k]);
  const average=avg(marksArr);
  const student={
    id:editId||Date.now().toString(),
    roll,name,
    branch:document.getElementById('fBranch').value,
    sem:document.getElementById('fSem').value,
    marks,
    avg:+average.toFixed(1),
    gpa:calcGPA(average),
    grade:calcGrade(average),
    pass:isPass(marksArr),
    createdAt:editId?students.find(x=>x.id===editId).createdAt:Date.now()
  };
  if(editId){
    const idx=students.findIndex(x=>x.id===editId);
    students[idx]=student;
    toast('Student updated successfully!');
  }else{
    if(students.find(x=>x.roll===roll)){toast('Roll number already exists.','error');return;}
    students.unshift(student);
    toast('Student added successfully!');
  }
  save();closeModal();renderAll();
}

function deleteStudent(id){
  if(!isAdmin()){toast('Only admins can delete records.','error');return;}
  if(!confirm('Delete this student record?'))return;
  students=students.filter(x=>x.id!==id);
  save();renderAll();toast('Student deleted.','info');
}

function renderAll(){renderDashboard();renderStudentsTable();updateSidebar()}

function renderDashboard(){
  const total=students.length;
  const passed=students.filter(s=>s.pass).length;
  const failed=total-passed;
  const avgGPA=total?+(students.reduce((a,s)=>a+s.gpa,0)/total).toFixed(1):0;
  document.getElementById('dashTotal').textContent=total;
  document.getElementById('dashPass').textContent=passed;
  document.getElementById('dashFail').textContent=failed;
  document.getElementById('dashAvg').textContent=total?avgGPA.toFixed(1):'—';
  document.getElementById('dashPassRate').textContent=total?Math.round(passed/total*100)+'%':'0%';
  document.getElementById('dashFailRate').textContent=total?Math.round(failed/total*100)+'%':'0%';
  const recent=students.slice(0,8);
  const tbody=document.getElementById('dashTableBody');
  document.getElementById('dashEmpty').style.display=total?'none':'block';
  tbody.innerHTML=recent.map(s=>`
    <tr style="cursor:pointer" onclick="viewDetail('${s.id}')">
      <td><span style="font-family:var(--mono);font-size:12px;color:var(--muted)">${s.roll}</span></td>
      <td style="font-weight:600">${s.name}</td>
      <td><span style="font-size:12px;background:var(--surface2);padding:3px 8px;border-radius:4px">${s.branch}</span></td>
      <td><span style="font-family:var(--mono);font-weight:600">${s.gpa.toFixed(1)}</span></td>
      <td><span class="grade-badge ${gradeClass(s.grade)}">${s.grade}</span></td>
      <td>${s.pass?'<span class="status-pass">✓ Pass</span>':'<span class="status-fail">✗ Fail</span>'}</td>
    </tr>`).join('');
}

function renderStudentsTable(){
  const branch=document.getElementById('filterBranch').value;
  const status=document.getElementById('filterStatus').value;
  const grade=document.getElementById('filterGrade').value;
  let data=students;
  if(currentSearch)data=data.filter(s=>s.name.toLowerCase().includes(currentSearch)||s.roll.toLowerCase().includes(currentSearch));
  if(branch)data=data.filter(s=>s.branch===branch);
  if(status)data=data.filter(s=>(status==='Pass'?s.pass:!s.pass));
  if(grade)data=data.filter(s=>s.grade.startsWith(grade));
  document.getElementById('studentCount').textContent=`${data.length} student${data.length!==1?'s':''} enrolled`;
  document.getElementById('studentsEmpty').style.display=data.length?'none':'block';
  
  const admin=isAdmin();
  document.getElementById('studentsTableBody').innerHTML=data.map(s=>`
    <tr>
      <td><span style="font-family:var(--mono);font-size:12px;color:var(--muted)">${s.roll}</span></td>
      <td style="font-weight:600;cursor:pointer;color:var(--accent)" onclick="viewDetail('${s.id}')">${s.name}</td>
      <td><span style="font-size:12px;background:var(--surface2);padding:3px 8px;border-radius:4px">${s.branch}</span></td>
      <td style="font-family:var(--mono);font-size:13px">${s.sem}</td>
      <td style="font-family:var(--mono);font-weight:500">${s.avg}</td>
      <td style="font-family:var(--mono);font-weight:600">${s.gpa.toFixed(1)}</td>
      <td><span class="grade-badge ${gradeClass(s.grade)}">${s.grade}</span></td>
      <td>${s.pass?'<span class="status-pass">✓ Pass</span>':'<span class="status-fail">✗ Fail</span>'}</td>
      <td>${admin?`<div class="actions-cell">
        <button class="btn btn-ghost btn-sm" onclick="openEditModal('${s.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteStudent('${s.id}')">Del</button>
      </div>`:'<span style="color:var(--muted);font-size:12px">View only</span>'}</td>
    </tr>`).join('');
}

function renderAnalytics(){
  if(!students.length){return;}
  const topscorer=students.reduce((a,b)=>a.avg>b.avg?a:b,students[0]);
  const highGPA=students.reduce((a,b)=>a.gpa>b.gpa?a:b,students[0]);
  const passRate=Math.round(students.filter(s=>s.pass).length/students.length*100);
  const avgGPA=+(students.reduce((a,s)=>a+s.gpa,0)/students.length).toFixed(1);
  document.getElementById('anTop').textContent=topscorer.name.split(' ')[0];
  document.getElementById('anHighGPA').textContent=highGPA.gpa.toFixed(1);
  document.getElementById('anPassRate').textContent=passRate+'%';
  document.getElementById('anAvgGPA').textContent=avgGPA;

  const subAvgs=SUBJECT_KEYS.map(k=>+(students.reduce((a,s)=>a+s.marks[k],0)/students.length).toFixed(1));
  const shortNames=['Math','Phys','Prog','Elec','Eng','Elec2'];
  const barColors=['var(--accent)','var(--info)','var(--warn)','#C084FC','#F472B6','var(--accent2)'];
  document.getElementById('subjectBarChart').innerHTML=subAvgs.map((v,i)=>`
    <div class="bar-col">
      <div class="bar-val">${v}</div>
      <div class="bar" style="height:${(v/100)*110}px;background:${barColors[i]}"></div>
      <div class="bar-label">${shortNames[i]}</div>
    </div>`).join('');

  const grades=['A+','A','B+','B','C','D','F'];
  const gradeColors={'A+':'var(--accent)','A':'var(--accent2)','B+':'var(--info)','B':'#60a5fa','C':'var(--warn)','D':'#fb923c','F':'var(--danger)'};
  const gradeCounts=grades.map(g=>students.filter(s=>s.grade===g).length);
  const maxG=Math.max(...gradeCounts,1);
  document.getElementById('gradeDist').innerHTML=grades.map((g,i)=>`
    <div class="dist-row">
      <div class="dist-label" style="color:${gradeColors[g]}">${g}</div>
      <div class="dist-bar-bg"><div class="dist-bar-fill" style="width:${(gradeCounts[i]/maxG)*100}%;background:${gradeColors[g]}"></div></div>
      <div class="dist-count">${gradeCounts[i]}</div>
    </div>`).join('');

  const branches=['ECE','CSE','ME','EE','CE'];
  const bCounts=branches.map(b=>students.filter(s=>s.branch===b).length);
  const maxB=Math.max(...bCounts,1);
  document.getElementById('branchBarChart').innerHTML=branches.map((b,i)=>`
    <div class="bar-col">
      <div class="bar-val">${bCounts[i]}</div>
      <div class="bar" style="height:${(bCounts[i]/maxB)*90}px;background:${barColors[i]}"></div>
      <div class="bar-label">${b}</div>
    </div>`).join('');
}

function viewDetail(id){
  const s=students.find(x=>x.id===id);if(!s)return;
  if(currentRole==='student' && id!==currentStudentId){
    toast('You can only view your own results.','error');
    return;
  }
  document.getElementById('detailName').textContent=s.name;
  document.getElementById('detailSub').textContent=`${s.roll} · ${s.branch} · Sem ${s.sem}`;
  
  const editBtn=document.getElementById('detailEditBtn');
  const delBtn=document.getElementById('detailDeleteBtn');
  if(isAdmin()){
    editBtn.style.display='';
    delBtn.style.display='';
    editBtn.onclick=()=>openEditModal(id);
    delBtn.onclick=()=>{deleteStudent(id);showPage('students',document.querySelector('[onclick*=students]'))};
  }else{
    editBtn.style.display='none';
    delBtn.style.display='none';
  }

  document.getElementById('detailSubjects').innerHTML=SUBJECTS.map((sub,i)=>{
    const m=s.marks[SUBJECT_KEYS[i]];
    const pct=m;
    const pass=m>=40;
    return`<div class="subject-row">
      <div>
        <div class="subject-name">${sub}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${progressColor(pct)}"></div></div>
      </div>
      <div style="text-align:right;min-width:60px">
        <div class="subject-marks" style="color:${progressColor(pct)}">${m}<span style="font-size:11px;color:var(--muted)">/100</span></div>
        <div style="font-size:10px;color:${pass?'var(--accent)':'var(--danger)'};font-weight:600">${pass?'PASS':'FAIL'}</div>
      </div>
    </div>`}).join('');

  document.getElementById('detailSummary').innerHTML=`
    <div style="display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:13px;color:var(--muted)">Average Marks</span>
        <span style="font-family:var(--mono);font-weight:600;font-size:16px">${s.avg}<span style="font-size:11px;color:var(--muted)">/100</span></span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:13px;color:var(--muted)">GPA (10 scale)</span>
        <span style="font-family:var(--mono);font-weight:600;font-size:22px;color:var(--accent)">${s.gpa.toFixed(1)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
        <span style="font-size:13px;color:var(--muted)">Grade</span>
        <span class="grade-badge ${gradeClass(s.grade)}" style="width:auto;padding:4px 14px;font-size:14px">${s.grade}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0">
        <span style="font-size:13px;color:var(--muted)">Result</span>
        ${s.pass?'<span class="status-pass" style="font-size:14px;padding:6px 16px">✓ PASSED</span>':'<span class="status-fail" style="font-size:14px;padding:6px 16px">✗ FAILED</span>'}
      </div>
    </div>`;

  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-detail').classList.add('active');
}

function updateSidebar(){
  const total=students.length;
  const passed=students.filter(s=>s.pass).length;
  const avgGPA=total?+(students.reduce((a,s)=>a+s.gpa,0)/total).toFixed(1):0;
  document.getElementById('sideTotal').textContent=total;
  document.getElementById('sidePass').textContent=total?Math.round(passed/total*100)+'%':'—';
  document.getElementById('sideAvg').textContent=total?avgGPA:'—';
}

function handleGlobalSearch(val){
  if(!isAdmin())return;
  currentSearch=val.toLowerCase();
  renderStudentsTable();
  if(val&&document.getElementById('page-students').classList.contains('active'))return;
  if(val)showPage('students',document.querySelector('[onclick*=students]'));
}

function seedDemo(){
  if(students.length>0)return;
  const names=[['Arjun Sharma','ECE',2],['Priya Patel','CSE',3],['Rahul Verma','ME',1],
    ['Sneha Gupta','ECE',2],['Amit Kumar','CSE',4],['Anjali Singh','EE',1]];
  names.forEach(([name,branch,sem],i)=>{
    const marks={};
    SUBJECT_KEYS.forEach(k=>{marks[k]=Math.floor(Math.random()*40)+55});
    const marksArr=SUBJECT_KEYS.map(k=>marks[k]);
    const average=avg(marksArr);
    students.push({
      id:Date.now().toString()+i,
      roll:`${branch}2024${String(i+1).padStart(3,'0')}`,
      name,branch,sem:String(sem),marks,
      avg:+average.toFixed(1),gpa:calcGPA(average),
      grade:calcGrade(average),pass:isPass(marksArr),
      createdAt:Date.now()-i*86400000
    });
  });
  save();
}

// ── INIT ──────────────────────────────────────────────────
seedDemo();
if(!restoreSession()){
  // Auth screen visible by default
}
/* FindIt PAU — front-end classroom prototype.
   Data is stored in this browser with localStorage. Do not use this as production security. */
const DB = {
  users: "findit_users_v1",
  current: "findit_current_user_v1",
  reports: "findit_reports_v1",
  claims: "findit_claims_v1",
  notifications: "findit_notifications_v1"
};
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const today = () => new Date().toISOString().slice(0,10);
const safe = (value="") => String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
let users = read(DB.users, []);
let reports = read(DB.reports, []);
let claims = read(DB.claims, []);
let notifications = read(DB.notifications, []);
let currentUser = read(DB.current, null);
let reportKind = "lost";
let authMode = "login";
let toastTimeout;

function seedDemoData() {
  if (reports.length) return;
  reports = [
    {id:"demo1",ownerId:"demo",ownerName:"PAU Community",title:"Wireless earbuds",kind:"found",category:"Electronics",date:"2026-11-19",location:"PAU Library",description:"Dark wireless earbuds in a small charging case.",image:"",status:"open",createdAt:Date.now()-500000},
    {id:"demo2",ownerId:"demo",ownerName:"PAU Community",title:"Student ID card",kind:"lost",category:"Cards & IDs",date:"2026-11-20",location:"Main campus walkway",description:"Student ID card. Owner should verify identifying details privately.",image:"",status:"open",createdAt:Date.now()-400000},
    {id:"demo3",ownerId:"demo",ownerName:"PAU Community",title:"Blue water bottle",kind:"found",category:"Personal items",date:"2026-11-18",location:"Cafeteria",description:"Blue reusable water bottle.",image:"",status:"open",createdAt:Date.now()-300000},
    {id:"demo4",ownerId:"demo",ownerName:"PAU Community",title:"Calculus notebook",kind:"lost",category:"Books & stationery",date:"2026-11-21",location:"Lecture hall",description:"A notebook with handwritten course notes.",image:"",status:"open",createdAt:Date.now()-200000},
    {id:"demo5",ownerId:"demo",ownerName:"PAU Community",title:"Black wristwatch",kind:"found",category:"Personal items",date:"2026-11-17",location:"Sports area",description:"Black wristwatch found near the sports area.",image:"",status:"open",createdAt:Date.now()-100000}
  ];
  write(DB.reports, reports);
}
seedDemoData();

function persistAll() {
  write(DB.users, users); write(DB.reports, reports);
  write(DB.claims, claims); write(DB.notifications, notifications);
}
function showToast(message) {
  const el=$("#toast"); el.textContent=message; el.classList.add("show");
  clearTimeout(toastTimeout); toastTimeout=setTimeout(()=>el.classList.remove("show"),3000);
}
function notify(userId, message, relatedId="") {
  notifications.unshift({id:crypto.randomUUID?.() || String(Date.now()+Math.random()),userId,message,relatedId,read:false,createdAt:Date.now()});
  write(DB.notifications, notifications);
}
function activeUser() { return currentUser ? users.find(u=>u.id===currentUser.id) || null : null; }
function requireLogin() {
  if (activeUser()) return true;
  openAuth("login"); showToast("Please log in to continue."); return false;
}
function setCurrentUser(user) { currentUser={id:user.id}; write(DB.current,currentUser); updateHeader(); renderAll(); }
function updateHeader() {
  const user=activeUser();
  $("#loginOpen").classList.toggle("hidden",!!user);
  $("#registerOpen").classList.toggle("hidden",!!user);
  $("#userMenu").classList.toggle("hidden",!user);
  $("#userName").textContent=user?.name || "";
  $("#userInitials").textContent=(user?.name || "U").split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase();
  $$(".auth-only").forEach(el=>el.classList.toggle("hidden",!user));
  $$(".admin-only").forEach(el=>el.classList.toggle("hidden",user?.role!=="admin"));
  const unread=user?notifications.filter(n=>n.userId===user.id&&!n.read).length:0;
  $("#navNotificationCount").textContent=unread;
  $("#navNotificationCount").classList.toggle("hidden",!unread);
}
function openAuth(mode="login") {
  authMode=mode; $("#authModal").classList.remove("hidden"); updateAuthMode();
}
function updateAuthMode() {
  const registering=authMode==="register";
  $("#authTitle").textContent=registering?"Create your account":"Log in to your account";
  $("#nameWrap").classList.toggle("hidden",!registering);
  $("#roleWrap").classList.toggle("hidden",!registering);
  $("#authForm").elements.name.required=registering;
  $("#authSubmit").textContent=registering?"Create account":"Log in";
  $$(".auth-tab").forEach(b=>b.classList.toggle("active",b.dataset.authMode===authMode));
}
function navigate(view) {
  if (view==="my-reports"||view==="notifications"||view==="admin") {
    if (!requireLogin()) return;
    if (view==="admin" && activeUser()?.role!=="admin") { showToast("Administrator access is required."); return; }
  }
  $$(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${view}`));
  $$(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  $("#mobileNav").classList.add("hidden");
  if(view==="browse") renderBrowse();
  if(view==="my-reports") renderMyReports();
  if(view==="notifications") renderNotifications();
  if(view==="admin") renderAdmin();
  window.scrollTo({top:0,behavior:"smooth"});
}
function openReport(kind) {
  if(!requireLogin()) return;
  reportKind=kind; $("#reportModal").classList.remove("hidden"); updateReportKind();
}
function updateReportKind() {
  $("#reportTitle").textContent=reportKind==="lost"?"Report a lost item":"Report a found item";
  $$(".report-tab").forEach(b=>b.classList.toggle("active",b.dataset.reportKind===reportKind));
}
function closeModal(id) { $(`#${id}`).classList.add("hidden"); }
function reportCard(item,index=0) {
  const status=item.status==="returned"?'<span class="pill returned">RETURNED</span>':`<span class="pill ${item.kind}">${item.kind.toUpperCase()}</span>`;
  const visual=item.image?`<img src="${item.image}" alt="Photo of ${safe(item.title)}">`:(item.kind==="lost"?"🔎":"📦");
  return `<article class="item-card"><div class="item-visual v${(index%6)+1}">${status}${visual}</div><div class="item-info"><h3>${safe(item.title)}</h3><p>${safe(item.description.slice(0,105))}${item.description.length>105?"…":""}</p><div class="item-meta"><span>⌖ ${safe(item.location)}</span><button class="text-action" data-detail="${safe(item.id)}">View details ↗</button></div></div></article>`;
}
function renderHome() {
  const visible=reports.filter(r=>r.status!=="removed").slice().sort((a,b)=>b.createdAt-a.createdAt);
  $("#homeRecent").innerHTML=visible.slice(0,3).map((r,i)=>reportCard(r,i)).join("");
  $("#homeEmpty").classList.toggle("hidden",visible.length>0);
  $("#statReports").textContent=reports.filter(r=>r.status!=="removed").length;
  $("#statReturned").textContent=reports.filter(r=>r.status==="returned").length;
}
function renderBrowse() {
  const q=$("#searchInput").value.trim().toLowerCase(), type=$("#typeFilter").value, category=$("#categoryFilter").value;
  const filtered=reports.filter(r=>r.status!=="removed"&&(type==="all"||r.kind===type)&&(category==="all"||r.category===category)&&[r.title,r.description,r.location,r.category].join(" ").toLowerCase().includes(q)).sort((a,b)=>b.createdAt-a.createdAt);
  $("#browseGrid").innerHTML=filtered.map((r,i)=>reportCard(r,i)).join("");
  $("#browseEmpty").classList.toggle("hidden",filtered.length>0);
}
function renderMyReports() {
  const user=activeUser();
  const mine=reports.filter(r=>r.ownerId===user.id);
  const myClaims=claims.filter(c=>c.claimantId===user.id);
  const rows=[
    ...mine.map(r=>({title:r.title,detail:`${r.kind} report · ${r.location} · ${r.date}`,status:r.status,emoji:r.kind==="lost"?"🔎":"📦"})),
    ...myClaims.map(c=>({title:`Claim: ${reports.find(r=>r.id===c.reportId)?.title||"Item"}`,detail:c.message,status:c.status,emoji:"✦"}))
  ];
  $("#myReportsList").innerHTML=rows.map(row=>`<article class="list-card"><div class="list-thumb">${row.emoji}</div><div class="list-main"><b>${safe(row.title)}</b><p>${safe(row.detail)}</p></div><span class="status-label ${safe(row.status)}">${safe(row.status)}</span></article>`).join("");
  $("#myReportsEmpty").classList.toggle("hidden",rows.length>0);
}
function renderNotifications() {
  const user=activeUser(), mine=notifications.filter(n=>n.userId===user.id);
  $("#notificationsList").innerHTML=mine.map(n=>`<article class="list-card"><div class="list-thumb">✦</div><div class="list-main"><b>${safe(n.message)}</b><p>${new Date(n.createdAt).toLocaleString()}</p></div><span class="status-label ${n.read?"":"pending"}">${n.read?"read":"new"}</span></article>`).join("");
  $("#notificationsEmpty").classList.toggle("hidden",mine.length>0);
  mine.forEach(n=>n.read=true); write(DB.notifications,notifications); updateHeader();
}
function renderAdmin() {
  const open=reports.filter(r=>r.status==="open").length, returned=reports.filter(r=>r.status==="returned").length, pending=claims.filter(c=>c.status==="pending").length;
  $("#adminStats").innerHTML=[["Total reports",reports.length],["Open reports",open],["Returned items",returned],["Pending claims",pending]].map(x=>`<div class="admin-stat"><b>${x[1]}</b><span>${x[0]}</span></div>`).join("");
  $("#adminReports").innerHTML=reports.filter(r=>r.status!=="removed").map(r=>`<article class="list-card"><div class="list-thumb">${r.kind==="lost"?"🔎":"📦"}</div><div class="list-main"><b>${safe(r.title)} <span class="status-label">${safe(r.kind)}</span></b><p>${safe(r.location)} · submitted by ${safe(r.ownerName)}</p></div><span class="status-label ${safe(r.status)}">${safe(r.status)}</span><div class="admin-actions"><button data-admin-action="returned" data-id="${safe(r.id)}">Mark returned</button><button class="danger" data-admin-action="remove" data-id="${safe(r.id)}">Remove</button></div></article>`).join("") || '<p class="muted">No reports to review.</p>';
  $("#adminClaims").innerHTML=claims.map(c=>{const r=reports.find(x=>x.id===c.reportId);return `<article class="list-card"><div class="list-thumb">✦</div><div class="list-main"><b>${safe(r?.title||"Item claim")}</b><p>Claim by ${safe(c.claimantName)} · ${safe(c.message)}</p></div><span class="status-label ${safe(c.status)}">${safe(c.status)}</span><div class="admin-actions">${c.status==="pending"?`<button data-claim-action="approve" data-id="${safe(c.id)}">Approve</button><button class="danger" data-claim-action="reject" data-id="${safe(c.id)}">Reject</button>`:""}</div></article>`;}).join("") || '<p class="muted">No ownership claims submitted yet.</p>';
}
function renderAll(){updateHeader();renderHome();if($("#view-browse").classList.contains("active"))renderBrowse();}
function showDetail(id) {
  const item=reports.find(r=>r.id===id); if(!item)return;
  const user=activeUser();
  const alreadyClaimed=claims.some(c=>c.reportId===id&&c.claimantId===user?.id&&c.status!=="rejected");
  $("#detailContent").innerHTML=`
    <span class="eyebrow">${safe(item.kind.toUpperCase())} ITEM REPORT</span>
    <h2 id="detailTitle">${safe(item.title)}</h2>
    ${item.image?`<img class="detail-image" src="${item.image}" alt="Item photograph">`:`<div class="detail-emoji">${item.kind==="lost"?"🔎":"📦"}</div>`}
    <p class="modal-copy">${safe(item.description)}</p>
    <div class="detail-grid"><div><small>Category</small><b>${safe(item.category)}</b></div><div><small>Reported date</small><b>${safe(item.date)}</b></div><div><small>Campus location</small><b>${safe(item.location)}</b></div><div><small>Report status</small><b>${safe(item.status)}</b></div></div>
    ${item.kind==="found"&&item.status==="open"?(!user?'<button class="btn btn-primary full-width" id="detailLogin">Log in to claim this item</button>':item.ownerId===user.id?'<p class="field-help">This is your own report.</p>':alreadyClaimed?'<p class="field-help">You have already submitted a claim for this item.</p>':`<form id="claimForm"><label>Ownership details<textarea name="message" rows="3" required maxlength="400" placeholder="Describe a detail that helps verify this item belongs to you. Do not share passwords or sensitive account details."></textarea></label><button class="btn btn-primary full-width" type="submit">Submit ownership claim</button></form>`):""}
    <p class="field-help">Safety: do not post passwords, full ID numbers or private identifying details in public listings. Arrange collection through an approved campus contact point.</p>`;
  $("#detailModal").classList.remove("hidden");
  $("#detailLogin")?.addEventListener("click",()=>{closeModal("detailModal");openAuth("login");});
  $("#claimForm")?.addEventListener("submit",submitClaim);
}
function submitClaim(e) {
  e.preventDefault();const user=activeUser();if(!user)return;
  const itemId=$("#detailContent").querySelector("#claimForm").dataset.itemId || currentDetailId;
  const item=reports.find(r=>r.id===itemId);const message=new FormData(e.currentTarget).get("message").trim();
  if(!item||!message)return;
  const claim={id:crypto.randomUUID?.()||String(Date.now()),reportId:item.id,claimantId:user.id,claimantName:user.name,message,status:"pending",createdAt:Date.now()};
  claims.unshift(claim);notify(item.ownerId,`${user.name} submitted an ownership claim for "${item.title}".`,item.id);persistAll();closeModal("detailModal");showToast("Claim submitted. An administrator will review it.");renderAll();
}
let currentDetailId=null;
function handleReportSubmit(e) {
  e.preventDefault();const user=activeUser();if(!user)return;
  const form=e.currentTarget, data=new FormData(form), file=data.get("image");
  const saveReport=(image="")=>{
    const report={id:crypto.randomUUID?.()||String(Date.now()),ownerId:user.id,ownerName:user.name,title:data.get("title").trim(),kind:reportKind,category:data.get("category"),date:data.get("date"),location:data.get("location").trim(),description:data.get("description").trim(),image,status:"open",createdAt:Date.now()};
    reports.unshift(report);
    // Basic keyword/category matching: not proof that two reports refer to the same object.
    const opposite=reports.filter(r=>r.id!==report.id&&r.status==="open"&&r.kind!==report.kind&&(
      r.category===report.category || r.title.toLowerCase().split(/\s+/).some(w=>w.length>3&&r.title.toLowerCase().includes(w))
    ));
    if(opposite.length){notify(user.id,`There may be a related report for "${report.title}". Check the Browse Items page.`,report.id);}
    persistAll();closeModal("reportModal");form.reset();renderAll();showToast("Your report has been added to the community board.");navigate("my-reports");
  };
  if(file&&file.size){
    if(!file.type.startsWith("image/")){showToast("Please choose an image file.");return;}
    if(file.size>1.5*1024*1024){showToast("Image must be 1.5 MB or smaller.");return;}
    const reader=new FileReader();reader.onload=()=>saveReport(reader.result);reader.onerror=()=>showToast("Could not read that image.");reader.readAsDataURL(file);
  } else saveReport();
}
function handleAuthSubmit(e) {
  e.preventDefault();const data=new FormData(e.currentTarget),email=data.get("email").trim().toLowerCase(),password=data.get("password");
  if(authMode==="register"){
    const name=data.get("name").trim(),role=data.get("role");
    if(users.some(u=>u.email===email)){showToast("An account with that email already exists.");return;}
    const user={id:crypto.randomUUID?.()||String(Date.now()),name,email,password,role,createdAt:Date.now()};
    users.push(user);persistAll();setCurrentUser(user);closeModal("authModal");e.currentTarget.reset();showToast("Account created successfully.");
  } else {
    const user=users.find(u=>u.email===email&&u.password===password);
    if(!user){showToast("Email or password is incorrect. Register first if this is your first visit.");return;}
    setCurrentUser(user);closeModal("authModal");e.currentTarget.reset();showToast(`Welcome back, ${user.name}.`);
  }
}
function handleAdminAction(action,id) {
  const item=reports.find(r=>r.id===id);if(!item)return;
  if(action==="returned"){item.status="returned";notify(item.ownerId,`Your report "${item.title}" has been marked as returned.`,item.id);showToast("Item marked as returned.");}
  if(action==="remove"){item.status="removed";notify(item.ownerId,`Your report "${item.title}" was removed by an administrator.`,item.id);showToast("Report removed from the public board.");}
  persistAll();renderAll();renderAdmin();
}
function handleClaimAction(action,id) {
  const claim=claims.find(c=>c.id===id);if(!claim)return;
  claim.status=action==="approve"?"approved":"rejected";
  const item=reports.find(r=>r.id===claim.reportId);
  if(action==="approve"&&item){item.status="returned";notify(claim.claimantId,`Your claim for "${item.title}" was approved. Follow the agreed campus handover process.`,item.id);notify(item.ownerId,`A claim for "${item.title}" was approved by the administrator.`,item.id);}
  else notify(claim.claimantId,`Your ownership claim for "${item?.title||"an item"}" was not approved. Contact the administrator if you need clarification.`,claim.reportId);
  persistAll();renderAdmin();renderAll();showToast(action==="approve"?"Claim approved.":"Claim rejected.");
}

// Global event wiring
document.addEventListener("click",e=>{
  const viewBtn=e.target.closest("[data-view]");if(viewBtn){e.preventDefault();navigate(viewBtn.dataset.view);}
  const reportBtn=e.target.closest("[data-report]");if(reportBtn)openReport(reportBtn.dataset.report);
  const closeBtn=e.target.closest("[data-close]");if(closeBtn)closeModal(closeBtn.dataset.close);
  const detailBtn=e.target.closest("[data-detail]");if(detailBtn){currentDetailId=detailBtn.dataset.detail;showDetail(currentDetailId);}
  const adminBtn=e.target.closest("[data-admin-action]");if(adminBtn)handleAdminAction(adminBtn.dataset.adminAction,adminBtn.dataset.id);
  const claimBtn=e.target.closest("[data-claim-action]");if(claimBtn)handleClaimAction(claimBtn.dataset.claimAction,claimBtn.dataset.id);
  const authTab=e.target.closest("[data-auth-mode]");if(authTab){authMode=authTab.dataset.authMode;updateAuthMode();}
  const reportTab=e.target.closest("[data-report-kind]");if(reportTab){reportKind=reportTab.dataset.reportKind;updateReportKind();}
});
$("#loginOpen").addEventListener("click",()=>openAuth("login"));
$("#registerOpen").addEventListener("click",()=>openAuth("register"));
$("#logoutBtn").addEventListener("click",()=>{currentUser=null;localStorage.removeItem(DB.current);updateHeader();navigate("home");showToast("You have logged out.");});
$("#mobileMenuBtn").addEventListener("click",()=>$("#mobileNav").classList.toggle("hidden"));
$("#authForm").addEventListener("submit",handleAuthSubmit);
$("#reportForm").addEventListener("submit",handleReportSubmit);
["searchInput","typeFilter","categoryFilter"].forEach(id=>$("#"+id).addEventListener("input",renderBrowse));
["authModal","reportModal","detailModal"].forEach(id=>$("#"+id).addEventListener("click",e=>{if(e.target.id===id)closeModal(id);}));
document.addEventListener("keydown",e=>{if(e.key==="Escape")["authModal","reportModal","detailModal"].forEach(closeModal);});

updateHeader();renderAll();

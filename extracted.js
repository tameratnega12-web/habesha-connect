





const $=id=>document.getElementById(id);
const pages=['home','account','profile','services','shipping','rentals','marketplace','jobs','truck','home_services','taxi','business','events','messages','notifications','admin','about','contact','help','report','privacy','terms'];
const labels={home:'Home',account:'Account',profile:'Profile',services:'My Services',shipping:'Shipping',rentals:'Rentals',marketplace:'Marketplace',jobs:'Jobs',truck:'Trucking',home_services:'Home Services',taxi:'Taxi/Limo',business:'Business Directory',events:'Events',messages:'Messages',notifications:'Notifications',admin:'Admin',about:'About',contact:'Contact',help:'Help / FAQ',report:'Report Problem',privacy:'Privacy',terms:'Terms'};
const hcSupabase=(window.supabase&&window.SUPABASE_URL&&window.SUPABASE_ANON_KEY)?window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY):null;
function authReady(){return !!hcSupabase}
function cleanEmail(v){return String(v||'').trim().toLowerCase();}
function showAuthStatus(){let el=$("authStatus"); if(el) el.textContent=authReady()?"Supabase connected":"Not connected";}
function togglePassword(id,btn){let input=$(id);if(!input)return;input.type=input.type==='password'?'text':'password';if(btn)btn.textContent=input.type==='password'?'👁️':'🙈';}
function passwordField(id,placeholder,auto){return `<div style="display:flex;gap:8px;align-items:center"><input id="${id}" type="password" placeholder="${placeholder||''}" autocomplete="${auto||'current-password'}" style="flex:1"><button type="button" class="btn ghost" onclick="togglePassword('${id}',this)" title="Show password">👁️</button></div>`;}
const ROLE_INFO={traveler:{icon:'✈️',title:'Traveler',desc:'Post trips and accept sender package requests.'},sender:{icon:'📦',title:'Sender',desc:'Find travelers and request package space.'},owner:{icon:'🏠',title:'Property Owner',desc:'Post and manage rental properties.'},rent_seeker:{icon:'🔍',title:'Rent Seeker',desc:'Search rentals and request viewings.'},truck_owner:{icon:'🚛',title:'Truck Owner',desc:'Post trucks, hire drivers, track records, and manage loads.'},driver:{icon:'🚚',title:'Truck Driver',desc:'Manage trucking jobs and deliveries.'},business_owner:{icon:'🏢',title:'Business Owner',desc:'Create a business profile so customers can find what you serve.'},marketplace:{icon:'🛒',title:'Marketplace',desc:'Buy, sell, post items, browse items, and manage marketplace requests.'},event_organizer:{icon:'📅',title:'Events Organizer',desc:'Create community, church, concert, festival, business, charity, family, and sports events.'},service_provider:{icon:'🛠️',title:'Home Service Provider',desc:'Post home services and manage customer requests.'},taxi_limo_owner:{icon:'🚕',title:'Taxi/Limo Owner',desc:'Manage taxi/limo vehicles, owner dashboard, and driver requests.'},taxi_limo_driver:{icon:'🚕',title:'Taxi/Limo Driver',desc:'Apply to drive for taxi/limo owners and manage approved hiring connections.'},taxi_driver:{icon:'🚕',title:'Taxi/Limo Driver',desc:'Apply to drive for taxi/limo owners and manage approved hiring connections.'},customer:{icon:'🧭',title:'Customer',desc:'Browse marketplace, taxi, jobs, messages, and notifications.'},admin:{icon:'⚙️',title:'Admin',desc:'Manage the full platform.'}};
const ROLE_LIST=['traveler','sender','owner','rent_seeker','truck_owner','driver','taxi_limo_owner','taxi_limo_driver','service_provider','business_owner','event_organizer','marketplace','customer'];
function serviceRoleChoices(currentRoles){let list=[...ROLE_LIST]; if((currentRoles||[]).includes('admin')&&!list.includes('admin'))list.push('admin'); return list;}

const HC_STORAGE_KEY='hc_v35';
function stripLargeForStorage(value){
  try{
    return JSON.parse(JSON.stringify(value,function(key,val){
      if(typeof val==='string'){
        if(val.startsWith('data:image')||val.startsWith('data:video')||val.startsWith('data:application'))return '';
        if(val.length>2000)return val.slice(0,500)+'...';
      }
      return val;
    }),function(key,val){
      if(Array.isArray(val))return val.filter(x=>x!==''&&x!==null&&x!==undefined);
      return val;
    });
  }catch(e){console.warn('Storage cleanup failed; saving minimum session only.',e);return null;}
}
function minimalStorageData(){
  return {currentUser:currentUser||null,users:(data&&data.users)||[],settings:(data&&data.settings)||Object.assign({},DEFAULT_SETTINGS),notifications:[],payments:[],messages:[],favorites:[],reviews:[],shipments:[],trips:[],rentals:[],rentalRequests:[],market:[],marketRequests:[],savedMarketItems:[],jobs:[],trucks:[],truckJobs:[],truckApplications:[],truckDriverProfiles:[],trailerRentals:[],homeServicePosts:[],homeServiceRequests:[],taxiDriverApps:[],taxiRideRequests:[],taxiLimoOwners:[],taxiLimoVehicles:[],taxiLimoDriverAssignments:[],businesses:[],events:[]};
}
function safeSetHC(obj){
  try{
    let slim=stripLargeForStorage(obj)||minimalStorageData();
    localStorage.setItem(HC_STORAGE_KEY,JSON.stringify(slim));
    return true;
  }catch(e){
    console.warn('Browser storage was full. Saving only small login/session data so buttons keep working.',e);
    try{localStorage.removeItem(HC_STORAGE_KEY);localStorage.setItem(HC_STORAGE_KEY,JSON.stringify(minimalStorageData()));return true;}catch(e2){console.warn('Minimum storage save failed; app will continue without freezing.',e2);return false;}
  }
}
function safeLoadData(){
  try{
    let raw=localStorage.getItem(HC_STORAGE_KEY);
    if(!raw)return seed();
    let parsed=JSON.parse(raw)||seed();
    return stripLargeForStorage(parsed)||seed();
  }catch(e){console.warn('Old browser storage could not be loaded; starting clean local cache.',e);try{localStorage.removeItem(HC_STORAGE_KEY);}catch(_e){}return seed();}
}
function persistOnly(){data.currentUser=currentUser;safeSetHC(data);}


// V7.8.41: button/navigation no-wait helpers. Normal screen changes should not wait for Supabase.
function fireAndForget(promise,label){
 try{Promise.resolve(promise).catch(e=>console.warn((label||'background task')+' failed',e));}catch(e){console.warn((label||'background task')+' failed',e);}
}
async function safeAsync(promise,ms,label){
 let timeout;
 try{
   return await Promise.race([
     Promise.resolve(promise),
     new Promise(resolve=>{timeout=setTimeout(()=>{console.warn((label||'Supabase task')+' timed out; continuing locally.');resolve(null);},ms||5000)})
   ]);
 }finally{if(timeout)clearTimeout(timeout);}
}
function normalizeRoles(profile){let roles=Array.isArray(profile?.roles)?profile.roles.filter(Boolean):[];let base=profile?.role||profile?.active_role||'customer';if(base&&!roles.includes(base))roles.unshift(base);roles=[...new Set(roles.length?roles:['customer'])];return roles}
function roleTitle(role){return (ROLE_INFO[role]&&ROLE_INFO[role].title)||role}
function upsertLocalUser(profile){if(!profile||!profile.email)return null;let u=data.users.find(x=>x.email===profile.email);let roles=normalizeRoles(profile);let savedRole=localStorage.getItem('hc_active_role_'+profile.email);let activeRole=(savedRole&&roles.includes(savedRole))?savedRole:(profile.active_role&&roles.includes(profile.active_role)?profile.active_role:(profile.role&&roles.includes(profile.role)?profile.role:roles[0]));let cleaned={id:profile.id||profile.profile_id||'',auth_user_id:profile.auth_user_id||'',name:profile.name||profile.full_name||profile.email,phone:profile.phone||'',email:profile.email,role:activeRole,active_role:activeRole,roles,verified:!!profile.verified,city:profile.city||''};if(u)Object.assign(u,cleaned);else data.users.push(cleaned);return data.users.find(x=>x.email===profile.email)}
async function loadSupabaseProfile(user){if(!authReady()||!user)return null;let {data:profile,error}=await hcSupabase.from('profiles').select('*').eq('auth_user_id',user.id).maybeSingle();if(error)console.warn('Profile load error',error);if(!profile){profile={auth_user_id:user.id,name:user.user_metadata?.name||user.email,phone:user.user_metadata?.phone||'',email:user.email,role:user.user_metadata?.role||'customer',roles:user.user_metadata?.roles||[user.user_metadata?.role||'customer'],active_role:user.user_metadata?.active_role||user.user_metadata?.role||'customer',verified:false};let res=await hcSupabase.from('profiles').upsert(profile,{onConflict:'email'}).select().single();profile=res.data||profile;}return upsertLocalUser(profile)}
async function initAuth(){if(!authReady()){console.warn('Supabase config not loaded. Please check configuration.');return;}let {data:sessionData}=await hcSupabase.auth.getSession();if(sessionData&&sessionData.session&&sessionData.session.user){let u=await loadSupabaseProfile(sessionData.session.user);if(u){currentUser=u;data.currentUser=currentUser;safeSetHC(data);render();setTimeout(()=>refreshCurrentPage(),120);}}}

const PROPERTY_TYPES=['Home','Apartment','Basement','Roommate','Town House','Business'];
const DEFAULT_SETTINGS={ownerListingFee:25,seekerViewingFee:10,shippingRatePerLb:9,appCommissionPerLb:2,travelerCommissionPerLb:2,travelerTripListingFee:10,airlineChargeMin:200,airlineChargeMax:300,registrationOpen:true,maintenanceMode:false};
function settings(){data.settings=Object.assign({},DEFAULT_SETTINGS,data.settings||{});return data.settings}
function setMoneySetting(key,val){let v=Number(val);if(!isNaN(v)&&v>=0){settings()[key]=v;save()}}
const US_CITIES=['Atlanta, GA','Washington, DC','New York, NY','Chicago, IL','Dallas, TX','Houston, TX','Los Angeles, CA','Seattle, WA','Boston, MA','Miami, FL','Minneapolis, MN','Denver, CO','Philadelphia, PA','San Francisco, CA'];
const ETHIOPIA_CITIES=['Addis Ababa','Adama (Nazret)','Bahir Dar','Gondar','Hawassa','Dire Dawa','Mekelle','Jimma','Dessie','Bishoftu (Debre Zeit)','Harar','Arba Minch','Shashemene'];
function options(arr,selected=''){return arr.map(x=>`<option ${x===selected?'selected':''}>${x}</option>`).join('')}
function routeSelects(prefix='ship'){return `<div class="grid two"><div><label>From (U.S. City)</label><select id="${prefix}From">${options(US_CITIES,'Atlanta, GA')}</select></div><div><label>To (Ethiopia City)</label><select id="${prefix}To">${options(ETHIOPIA_CITIES,'Addis Ababa')}</select></div></div><p class="muted">Use the arrows to choose the main U.S. city and Ethiopia destination city.</p>`}

let data=safeLoadData();
// V7.3.4 beta cleanup: do not show old old browser records from browser storage.
// Keep users, current login, profile roles, and settings, but reset marketplace activity
// so every dashboard displays only real new activity after this update.
const BETA_CLEANUP_KEY='hc_v734_storage_cleanup_done';
if(!localStorage.getItem(BETA_CLEANUP_KEY)){
  ['payments','messages','notifications','favorites','reviews','shipments','trips','rentals','rentalRequests','market','jobs','trucks','truckJobs','truckApplications','truckDriverProfiles','trailerRentals','homeServicePosts','homeServiceRequests','taxiDriverApps','taxiRideRequests','taxiLimoOwners','taxiLimoVehicles','taxiLimoDriverAssignments','businesses','events'].forEach(k=>{data[k]=[];});
  localStorage.setItem(BETA_CLEANUP_KEY,'1');
}
// Always ignore old browser-only payment/message/notification histories. These now load from Supabase.
data.payments=[];
data.messages=[];
data.notifications=[];

// V7.8.31 Taxi/Limo cleanup: remove old browser-only Taxi/Limo rows.
// If old test rows were stored in localStorage, they can still appear even after
// Supabase table rows are deleted. This cleanup clears those local-only records once.
const TAXI_LIMO_LOCAL_CLEANUP_KEY='hc_v7831_taxi_limo_local_cleanup_done';
if(!localStorage.getItem(TAXI_LIMO_LOCAL_CLEANUP_KEY)){
  data.taxiDriverApps=[];
  data.taxiRideRequests=[];
  data.taxiLimoOwners=[];
  data.taxiLimoVehicles=[];
  data.taxiLimoDriverAssignments=[];
  localStorage.setItem(TAXI_LIMO_LOCAL_CLEANUP_KEY,'1');
}

let currentUser=data.currentUser||null;
safeSetHC(data);

function seed(){return {currentUser:null,users:[],notifications:[],payments:[],messages:[],favorites:[],reviews:[],shipments:[],trips:[],rentals:[],rentalRequests:[],market:[],jobs:[],trucks:[],truckJobs:[],truckApplications:[],truckDriverProfiles:[],trailerRentals:[],homeServicePosts:[],homeServiceRequests:[],taxiDriverApps:[],taxiRideRequests:[],taxiLimoOwners:[],taxiLimoVehicles:[],taxiLimoDriverAssignments:[],marketRequests:[],savedMarketItems:[],businesses:[],events:[],settings:Object.assign({},DEFAULT_SETTINGS)}}
function save(){data.currentUser=currentUser;safeSetHC(data);render()}
function money(n){return '$'+Number(n||0).toLocaleString()}

// V7.8.58 Taxi/Limo cleanup: owner-driver hiring only; remove legacy ride-request demo rows from browser state.
data.taxiRideRequests=[];
function ensureArrays(){if(!data.trucks)data.trucks=[];if(!data.truckJobs)data.truckJobs=[];if(!data.truckApplications)data.truckApplications=[];if(!data.truckDriverProfiles)data.truckDriverProfiles=[];if(!data.trailerRentals)data.trailerRentals=[];if(!data.homeServicePosts)data.homeServicePosts=[];if(!data.homeServiceRequests)data.homeServiceRequests=[];if(!data.taxiDriverApps)data.taxiDriverApps=[];if(!data.taxiRideRequests)data.taxiRideRequests=[];if(!data.taxiLimoOwners)data.taxiLimoOwners=[];if(!data.taxiLimoVehicles)data.taxiLimoVehicles=[];if(!data.taxiLimoDriverAssignments)data.taxiLimoDriverAssignments=[];if(!data.marketRequests)data.marketRequests=[];if(!data.savedMarketItems)data.savedMarketItems=[];if(!data.events)data.events=[];if(!data.rentalRequests)data.rentalRequests=[];if(!data.rentals)data.rentals=[];if(!data.shipments)data.shipments=[];if(!data.trips)data.trips=[];if(!data.favorites)data.favorites=[];if(!data.reviews)data.reviews=[];data.users.forEach(u=>{if(u.verified===undefined)u.verified=false});data.trips.forEach(t=>{t.totalSpace=+t.totalSpace||0;t.availableSpace=(t.availableSpace===undefined?+t.totalSpace:+t.availableSpace)||0;t.travelerPhone=t.travelerPhone||'';t.travelerEmail=t.travelerEmail||'';t.travelerVerified=!!(data.users.find(u=>u.email===t.travelerEmail)?.verified||t.travelerVerified);t.status=t.status||'Open';t.listingFeePaid=!!t.listingFeePaid;t.listingFeeAmount=Number(t.listingFeeAmount||settings().travelerTripListingFee||10);t.listingFeeRefunded=!!t.listingFeeRefunded;});data.shipments.forEach(s=>{s.senderPhone=s.senderPhone||'';s.travelerPhone=s.travelerPhone||'';s.receiver=s.receiver||'Receiver not entered';s.receiverPhone=s.receiverPhone||'';s.tracking=s.tracking||('HC-'+s.id);s.packagePhotos=s.packagePhotos||[];s.senderVerified=!!(data.users.find(u=>u.email===s.senderEmail)?.verified||s.senderVerified);s.travelerVerified=!!(data.users.find(u=>u.email===s.travelerEmail)?.verified||s.travelerVerified);if(s.paid===undefined)s.paid=(s.status==='Paid'||s.status==='Payment Pending Admin Review'||s.status==='Approved'||s.paymentStatus==='Paid');s.travelerListingFeeRefund=Number(s.travelerListingFeeRefund||0);s.travelerPayoutAmount=Number(s.travelerPayoutAmount||0);});data.rentals.forEach(r=>{r.ownerPhone=r.ownerPhone||'';r.ownerEmail=r.ownerEmail||'';r.owner=r.owner||'Owner';r.status=r.status||'Pending';r.propertyType=r.propertyType||'Home';r.appFee=r.appFee||settings().seekerViewingFee;r.ownerFee=r.ownerFee||settings().ownerListingFee;if(r.ownerPaid===undefined)r.ownerPaid=(r.status==='Approved'||r.status==='Available');r.photos=r.photos||[];r.deposit=r.deposit||0;r.moveDate=r.moveDate||'';r.leaseTerm=r.leaseTerm||'';r.pets=r.pets||'No';r.parking=r.parking||'No';r.furnished=r.furnished||'No';r.utilities=r.utilities||'Not included';r.ownerRating=avgOwnerRating(r.ownerEmail)});}
function verifiedBadge(ok){return ok?'<span class="pill good">Verified</span>':'<span class="pill warn">Not Verified</span>'}
function avgOwnerRating(email){let rev=(data.reviews||[]).filter(x=>x.type==='owner'&&x.target===email);return rev.length?(rev.reduce((a,b)=>a+(+b.rating||0),0)/rev.length).toFixed(1):''}
function photoNamesFromInput(id){let el=$(id);return el&&el.files?[...el.files].map(f=>f.name):[]}
function contactLine(label,name,phone,email){return `<p><b>${label}:</b> ${name||'Not assigned'} ${phone?` • ${phone}`:''} ${email?` • ${email}`:''}</p>`}
ensureArrays();
const PUBLIC_PAGES=['about','contact','help','report','privacy','terms'];
const ROLE_PAGES={
 guest:['home','account','shipping','rentals','marketplace','jobs','truck','home_services','business','events',...PUBLIC_PAGES],
 traveler:['home','services','profile','shipping','messages','notifications','events',...PUBLIC_PAGES],
 sender:['home','services','profile','shipping','messages','notifications','events',...PUBLIC_PAGES],
 owner:['home','services','profile','rentals','messages','notifications','events',...PUBLIC_PAGES],
 rent_seeker:['home','services','profile','rentals','messages','notifications','events',...PUBLIC_PAGES],
 admin:['home','services','profile','shipping','rentals','marketplace','jobs','truck','home_services','taxi','business','events','messages','notifications','admin',...PUBLIC_PAGES],
 customer:['home','services','profile','home_services','marketplace','jobs','messages','notifications','events',...PUBLIC_PAGES],
 truck_owner:['home','profile','services','truck','messages','notifications','events',...PUBLIC_PAGES],
 driver:['home','services','profile','truck','home_services','messages','notifications','events',...PUBLIC_PAGES],
 service_provider:['home','services','profile','home_services','messages','notifications','events',...PUBLIC_PAGES],
 taxi_limo_owner:['home','services','profile','taxi','messages','notifications','events',...PUBLIC_PAGES],
 taxi_limo_driver:['home','services','profile','taxi','messages','notifications','events',...PUBLIC_PAGES],
 taxi_driver:['home','services','profile','taxi','messages','notifications','events',...PUBLIC_PAGES],
 business_owner:['home','services','profile','business','home_services','marketplace','jobs','messages','notifications','events',...PUBLIC_PAGES],
 event_organizer:['home','services','profile','events','messages','notifications',...PUBLIC_PAGES],
 marketplace:['home','services','profile','marketplace','messages','notifications','events',...PUBLIC_PAGES],
};
const ROLE_NAV_PAGES={
 guest:['home','account','shipping','rentals','marketplace','jobs','truck','home_services','business','events'],
 traveler:['home','profile','services','shipping'],
 sender:['home','profile','services','shipping'],
 owner:['home','profile','services','rentals'],
 rent_seeker:['home','profile','services','rentals'],
 truck_owner:['home','profile','services','truck'],
 driver:['home','profile','services','truck'],
 service_provider:['home','profile','services','home_services'],
 taxi_limo_owner:['home','profile','services','taxi'],
 taxi_limo_driver:['home','profile','services','taxi'],
 taxi_driver:['home','profile','services','taxi'],
 business_owner:['home','profile','services','business','events'],
 event_organizer:['home','profile','services','events'],
 marketplace:['home','profile','services','marketplace'],
 customer:['home','profile','services','home_services','events'],
 admin:['home','profile','services','admin','taxi','events']
};
function rolePages(){return currentUser?(ROLE_PAGES[currentUser.role]||ROLE_PAGES.customer):ROLE_PAGES.guest}
function roleNavPages(){return currentUser?(ROLE_NAV_PAGES[currentUser.role]||ROLE_NAV_PAGES.customer):ROLE_NAV_PAGES.guest}
function isAllowedPage(p){return rolePages().includes(p)}
function visiblePages(){return pages.filter(p=>isAllowedPage(p))}
function taxiNavAllowed(){return currentUser&&['taxi_limo_owner','taxi_limo_driver','taxi_driver','admin'].includes(currentUser.role)}
function nav(){let visible=roleNavPages().filter(p=>isAllowedPage(p)).filter(p=>p!=='taxi'||taxiNavAllowed());let n=visible.map(p=>`<button onclick="show('${p}')" id="nav_${p}">${labels[p]}</button>`).join('');$('nav').innerHTML=n;$('mobileNav').innerHTML=visible.map(p=>`<option value="${p}">${labels[p]}</option>`).join('')}
let currentPage='home';
let renderingPage=false;
let adminLoading=false;
let adminDataLoaded=false;
let adminBackgroundRefreshing=false;
let pageSyncRunning=false;
let lastPageSyncAt={};
function isSharedDataPage(p){return ['shipping','rentals','marketplace','truck','home_services','taxi','business','events','messages','notifications','profile','admin'].includes(p);}
async function backgroundPageSync(p,force=false){
 if(!authReady()||!isSharedDataPage(p))return;
 if(pageSyncRunning)return;
 let now=Date.now();
 if(!force && (now-(lastPageSyncAt[p]||0)<2500))return;
 lastPageSyncAt[p]=now;
 pageSyncRunning=true;
 try{
   await safeAsync(refreshPageData(p),12000,'page sync '+p);
   if(currentPage===p){
     await renderPage(p);
   }
 }catch(e){
   console.warn('Background page sync failed',p,e);
 }finally{
   pageSyncRunning=false;
 }
}
function refreshCurrentPage(){backgroundPageSync(currentPage,true);}
window.addEventListener('focus',()=>refreshCurrentPage());
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshCurrentPage();});
async function show(p){
 if(!pages.includes(p))p='home';
 if(!isAllowedPage(p)){p=currentUser?'services':'account'}
 // V7.8.41: switch visible page immediately. Do not show a Supabase loading screen for normal button clicks.
 const oldScroll=window.scrollY||document.documentElement.scrollTop||0;
 pages.forEach(x=>{let el=$(x); if(el)el.classList.add('hide')});
 let pageEl=$(p); if(pageEl)pageEl.classList.remove('hide');
 document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
 let nb=$('nav_'+p);if(nb)nb.classList.add('active');
 if($('mobileNav'))$('mobileNav').value=p;
 if(p==='admin' && currentPage!=='admin'){
   $('admin').innerHTML='<div class="card"><b>Loading Admin Dashboard...</b><p class="muted">Please wait.</p></div>';
 }
 currentPage=p;
 renderingPage=true;
 try{
   await renderPage(p);
   setTimeout(()=>backgroundPageSync(p),80);
 }catch(err){
   console.error('Page render error',err);
   if($(p))$(p).innerHTML='<div class="card"><h2>Page loading problem</h2><p>Something stopped this page from opening. Please refresh once. If it continues, send a screenshot of this page.</p><button class="btn primary" onclick="location.reload()">Refresh App</button></div>';
 }finally{
   renderingPage=false;
   if(p==='admin')setTimeout(()=>window.scrollTo(0,oldScroll),0);
 }
}
async function openTruckSection(sectionId){
 if(!requireLogin())return;
 await show('truck');
 setTimeout(()=>document.getElementById(sectionId)?.scrollIntoView({behavior:'smooth',block:'start'}),150);
}
async function refreshPageData(p){
 if(!authReady())return;
 if(p==='profile'||p==='shipping'||p==='admin'){
   await loadSupabaseTrips();
   await loadSupabaseShipments();
   recalcTripSpacesFromShipments();
   if(p==='profile'||p==='admin')await loadSupabasePayments();
 }
 if(p==='profile'||p==='rentals'||p==='admin'){
   await loadSupabaseRentals();
   if(typeof loadSupabaseRentalRequests==='function')await loadSupabaseRentalRequests();
 }
 if(p==='marketplace'||p==='admin'||p==='profile'){
   if(typeof loadSupabaseMarketplace==='function')await loadSupabaseMarketplace();
 }
 if(p==='messages'||p==='admin'){
   await loadSupabaseMessages();
 }
 if(p==='notifications'||p==='admin'){
   await loadSupabaseNotifications();
 }
 if(p==='truck'||p==='admin'){
   await loadSupabaseTrucking();
 }
 if(p==='home_services'||p==='admin'||p==='profile'){
   await loadSupabaseHomeServices();
 }
 if(p==='taxi'||p==='admin'||p==='profile'){
   await loadSupabaseTaxiLimo();
 }
 if(p==='business'||p==='admin'||p==='profile'){
   if(typeof loadBusinessFromSupabase==='function')await loadBusinessFromSupabase({force:true});
 }
 if(p==='events'||p==='admin'||p==='profile'){
   if(typeof loadEventsFromSupabase==='function')await loadEventsFromSupabase({force:true});
 }
 if(p==='admin' && !adminDataLoaded){
   await loadAdminProfiles();
 }
}
function roleSwitcherHtml(){if(!currentUser)return '';let roles=currentUser.roles||[currentUser.role||'customer'];let opts=roles.map(r=>`<option value="${r}" ${r===currentUser.role?'selected':''}>${(ROLE_INFO[r]?.icon||'')+' '+roleTitle(r)}</option>`).join('');return `<select id="topRoleSwitch" onchange="switchRole(this.value)" style="width:auto;min-width:150px;margin:0 6px;padding:9px;border-radius:10px;font-weight:700">${opts}</select>`}
function render(){nav();$('userBox').innerHTML=currentUser?`Signed in: <b>${currentUser.name}</b> <span class="pill">${roleTitle(currentUser.role)}</span> ${roleSwitcherHtml()} <button class="btn ghost" onclick="show('services')">My Services</button> <button class="btn" onclick="logout()">Logout</button>`:`<button class="btn" onclick="show('account')">Login / Register</button>`;let active=pages.find(p=>!$(p).classList.contains('hide'))||'home';if(!isAllowedPage(active))active='home';renderPage(active).catch(err=>{console.error('Render error',err);if($(active))$(active).innerHTML='<div class="card"><h2>Page loading problem</h2><p>Please refresh the app and try again.</p></div>';})}
function requireLogin(){if(!currentUser){show('account');return false}return true}
async function login(){let e=cleanEmail($('loginEmail')?.value),p=String($('loginPass')?.value||'');if(!e||!p)return alert('Enter your email and password.');if(!e.includes('@'))return alert('Please enter the full email address you used to create the account.');if(authReady()){let {data:authData,error}=await hcSupabase.auth.signInWithPassword({email:e,password:p});if(error){let localAdmin=data.users.find(x=>cleanEmail(x.email)===e&&x.pass===p&&x.role==='admin');if(localAdmin){currentUser=localAdmin;addNote(localAdmin.email,'You signed in with local admin access.');save();show('home');return;}let msg=String(error.message||'');if(msg.toLowerCase().includes('invalid'))msg='Login failed. Please check the email and password. Make sure there are no spaces and use the same email used during signup.';return alert(msg);}let u=await loadSupabaseProfile(authData.user);if(!u)return alert('Login worked, but profile was not found.');currentUser=u;addNote(u.email,'You signed in successfully.');save();show('home');return;}let u=data.users.find(x=>cleanEmail(x.email)===e&&x.pass===p);if(!u)return alert('Wrong email or password');currentUser=u;addNote(u.email,'You signed in successfully.');save();show('home')}
async function register(){let name=$('regName').value.trim(),phone=$('regPhone').value.trim(),email=cleanEmail($('regEmail')?.value),pass=$('regPass').value;let selected=[...document.querySelectorAll('.roleCheck:checked')].map(x=>x.value);if(!selected.length)selected=['customer'];let role=selected[0];if(!name||!phone||!email||!pass)return alert('Please complete all fields including phone number');if($('agreeTerms')&&!$('agreeTerms').checked)return alert('Please agree to the Terms and Privacy Policy.');if(!settings().registrationOpen&&(!currentUser||currentUser.role!=='admin'))return alert('Registration is currently closed.');if(authReady()){let {data:authData,error}=await hcSupabase.auth.signUp({email,password:pass,options:{data:{name,phone,role,roles:selected,active_role:role}}});if(error)return alert(error.message);let authUser=authData.user;let profile={auth_user_id:authUser?authUser.id:null,name,phone,email,role,roles:selected,active_role:role,verified:false};if(authUser){let res=await hcSupabase.from('profiles').upsert(profile,{onConflict:'email'}).select().single();if(res.error){console.warn('Profile save error',res.error);alert('Account created, but profile roles were not saved. Please run the V6 SQL migration if you have not run it yet.');}}
let u=upsertLocalUser(profile);currentUser=u;addNote(email,'Account created. Check your email if Supabase asks you to confirm before login.');sendEmailNotice({to:email,name,subject:'Welcome to Habesha Agenagn',summary:'Your Habesha Agenagn account was created successfully. You can open your dashboard and continue setup.',buttonText:'Open My Dashboard',page:'services',details:{Role:role,Phone:phone}});sendAdminEmailNotice('New user registered','A new user registered on Habesha Agenagn.',{Name:name,Email:email,Role:role});save();alert('Account created. If email confirmation is enabled, please check your email before signing in.');show('home');return;}if(data.users.some(u=>u.email===email))return alert('Account already exists');let u={name,phone,email,pass,role,roles:selected,active_role:role,verified:false};data.users.push(u);currentUser=u;addNote(email,'Account created. Welcome to Habesha Connect.');sendEmailNotice({to:email,name,subject:'Welcome to Habesha Agenagn',summary:'Your Habesha Agenagn account was created successfully. You can open your dashboard and continue setup.',buttonText:'Open My Dashboard',page:'services',details:{Role:role,Phone:phone}});sendAdminEmailNotice('New user registered','A new user registered on Habesha Agenagn.',{Name:name,Email:email,Role:role});save();show('home')}
async function logout(){currentUser=null;save();show('home');if(authReady())fireAndForget(hcSupabase.auth.signOut(),'Supabase sign out')}
function resetAppData(){if(confirm('Clear all saved Habesha Connect app data and reload?')){Object.keys(localStorage).filter(k=>k.startsWith('hc')).forEach(k=>localStorage.removeItem(k));location.reload();}}
async function getProfileByEmail(email){
 email=cleanEmail(email||'');
 if(!email)return null;
 let local=(data.users||[]).find(u=>cleanEmail(u.email)===email);
 if(local&&local.id)return local;
 if(authReady()){
   let {data:prof,error}=await hcSupabase.from('profiles').select('*').eq('email',email).maybeSingle();
   if(!error&&prof)return upsertLocalUser(prof);
 }
 return local||null;
}
function addNote(to,text){
 let note={to,text,time:new Date().toLocaleString(),read:false,source:authReady()?'supabase-pending':'local'};
 if(authReady()){
   (async()=>{
     try{
       let prof=await getProfileByEmail(to);
       if(prof&&prof.id){
         await hcSupabase.from('notifications').insert({user_id:prof.id,message:text,is_read:false,created_at:new Date().toISOString()});
         await loadSupabaseNotifications();
       }
     }catch(e){console.warn('Notification save error',e)}
   })();
 }else{
   data.notifications.unshift(note);
 }
}
async function recordPayment(service,amount,desc,userEmail){
 let d=new Date();
 let payment={user:userEmail||(currentUser&&currentUser.email)||'unknown',role:(currentUser&&currentUser.role)||'',service,amount:Number(amount)||0,desc:desc||'',time:d.toLocaleString(),month:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'),quarter:d.getFullYear()+' Q'+(Math.floor(d.getMonth()/3)+1),year:String(d.getFullYear()),source:'local'};
 if(authReady()){
   let profile=(data.users||[]).find(u=>cleanEmail(u.email)===cleanEmail(payment.user));
   let payload={user_id:(profile&&profile.id)||null,service:payment.service,description:payment.desc,amount:payment.amount,status:'Paid',created_at:d.toISOString()};
   let {error}=await hcSupabase.from('payments').insert(payload);
   if(error)console.warn('Payment Supabase insert error',error);
   await loadSupabasePayments();
   return payment;
 }
 data.payments.unshift(payment);
 return payment;
}
async function pay(service,amount,desc){
 if(!requireLogin())return;
 await recordPayment(service,amount,desc,currentUser.email);
 addNote(currentUser.email,`Payment recorded: ${money(amount)} for ${desc}`);
 save();
 alert('Payment recorded successfully.');
}


/* V7.4.0 Email notification helpers - client calls Vercel API only. No workflow/database changes. */
const HC_EMAIL_ADMIN='admin.habeshaconnect@gmail.com';
const HC_EMAIL_ADMIN_GMAIL='admin.habeshaconnect@gmail.com';
const HC_EMAIL_SITE='https://habeshaagenagnapp.com';
function hcDashboardUrl(page){return HC_EMAIL_SITE+(page?('/#'+page):'');}
function sendEmailNotice({to,name,subject,summary,buttonText='Open Dashboard',page='services',details={}}={}){
  to=cleanEmail(to||'');
  if(!to||!subject||!summary)return;
  try{
    fetch('/api/send-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to,name:name||'Habesha Agenagn User',subject,summary,buttonText,dashboardUrl:hcDashboardUrl(page),details})}).catch(e=>console.warn('Email notice failed',e));
  }catch(e){console.warn('Email notice error',e)}
}
function sendAdminEmailNotice(subject,summary,details={},page='admin'){
  // Keep the original support email and also send a copy to the Gmail admin inbox.
  sendEmailNotice({to:HC_EMAIL_ADMIN,name:'Admin',subject,summary,buttonText:'Open Admin Dashboard',page,details});
  if(cleanEmail(HC_EMAIL_ADMIN_GMAIL)!==cleanEmail(HC_EMAIL_ADMIN)){
    sendEmailNotice({to:HC_EMAIL_ADMIN_GMAIL,name:'Habesha Agenagn Admin',subject,summary,buttonText:'Open Admin Dashboard',page,details});
  }
}
function userDisplayByEmail(email,fallback){let u=(data.users||[]).find(x=>cleanEmail(x.email)===cleanEmail(email||''));return (u&&u.name)||fallback||'Habesha Agenagn User';}
function paymentVisibleForActiveRole(p){
 if(!currentUser)return false;
 if(currentUser.role==='admin')return true;
 if(p.user!==currentUser.email)return false;
 const role=currentUser.role;
 const service=String(p.service||'');
 const desc=String(p.desc||'');
 if(role==='sender'||role==='customer')return service==='Shipping' && /Shipment/i.test(desc) && !/Traveler|Payout|listing fee/i.test(desc);
 if(role==='traveler')return service==='Traveler Payout' || /Traveler trip listing fee|Traveler commission|Listing Fee Refund|Total Expected Payout|Total Payout/i.test(desc);
 if(role==='owner')return service==='Rentals' && /Owner|listing|Publish|Property/i.test(desc) && !/Viewing request/i.test(desc);
 if(role==='rent_seeker')return service==='Rentals' && /Viewing request/i.test(desc);
 return !!p.role && p.role===role;
}
async function renderPage(p){
 // V7.8.41: render from local app data first. Supabase refreshes are only done on sign-in,
 // admin dashboard, and real submit/approve/pay actions. This stops every navigation button
 // from calling Supabase and freezing on phone/slow network.
 if(p==='home')home();
 if(p==='account')account();
 if(p==='profile')await profile();
 if(p==='services')services();
 if(p==='shipping')await shipping();
 if(p==='rentals')await rentals();
 if(p==='marketplace')marketplace();
 if(p==='jobs')jobs();
 if(p==='truck')truck();
 if(p==='home_services')homeServices();
 if(p==='taxi')taxi();
 if(p==='business')business();
 if(p==='events')events();
 if(p==='messages')messages();
 if(p==='notifications')notifications();
 if(p==='admin')await admin();
 if(p==='about')about();
 if(p==='contact')contact();
 if(p==='help')help();
 if(p==='report')report();
 if(p==='privacy')privacy();
 if(p==='terms')terms();
}
function roleWelcome(){
 if(!currentUser)return '<p>Create an account or sign in to open your dashboard.</p>';
 const role=currentUser.role;
 if(role==='traveler')return '<p><b>Traveler dashboard:</b> post trips, review sender requests, manage available space, messages, and notifications.</p>';
 if(role==='sender')return '<p><b>Sender dashboard:</b> create shipments, find verified travelers, track packages, and manage payments.</p>';
 if(role==='owner')return '<p><b>Owner dashboard:</b> add rental listings, manage viewing requests, payments, and messages.</p>';
 if(role==='rent_seeker')return '<p><b>Rent seeker dashboard:</b> search rentals, save favorites, request viewings, and message owners.</p>';
 if(role==='taxi_limo_owner')return '<p><b>Taxi/Limo owner dashboard:</b> manage vehicles, driver requests, and taxi/limo activity.</p>';
 if(role==='taxi_limo_driver'||role==='taxi_driver')return '<p><b>Taxi/Limo driver dashboard:</b> apply for approval, show availability, review owner hire requests, and manage current employment.</p>';
 if(role==='event_organizer')return '<p><b>Events Organizer dashboard:</b> create events, track approval status, and help the community find programs, festivals, concerts, church events, and family activities.</p>';
 if(role==='marketplace')return '<p><b>Marketplace dashboard:</b> post items, browse approved listings, request items, and manage marketplace activity.</p>';
 if(role==='admin')return '<p><b>Admin dashboard:</b> manage users, approvals, reports, payments, settings, rentals, taxi, and shipping.</p>';
 return '<p><b>Your dashboard:</b> open the tools available for your Habesha Connect role.</p>';
}
function roleServices(){
 const info={shipping:['📦','Shipping','Traveler/sender matching, trips, requests, tracking, and payments.'],rentals:['🏠','Rentals','Listings, favorites, viewing requests, owner tools, and approvals.'],messages:['💬','Messages','Chat with users connected to your requests and listings.'],notifications:['🔔','Notifications','Account alerts, request updates, approvals, and payment notices.'],admin:['⚙️','Admin Center','Verify users, manage reports, payments, settings, and approvals.'],marketplace:['🛒','Marketplace','Buy and sell community items with messaging.'],jobs:['💼','Jobs','Local jobs, employers, seekers, and applications.'],truck:['🚚','Trucking','Truck owners, drivers, hiring posts, records, tracking, maintenance, and job applications.'],home_services:['🛠️','Home Services','Cleaners, movers, repair, electricians, plumbers, and helpers.'],taxi:['🚕','Taxi/Limo','Taxi/Limo owners hire approved available drivers. Drivers apply first and show their availability.'],business:['🏢','Business Directory','Create or browse community business profiles, services, hours, phone, menu, and directions.'],events:['📅','Events','Community, church, cultural, business, family, charity, and sports events.']};
 const allowed=visiblePages().filter(p=>info[p]);
 return allowed.map(p=>service(info[p][0],info[p][1],info[p][2],p)).join('');
}
function homeQuickActions(){
 if(!currentUser)return `<button class="btn primary" onclick="show('account')">Create Account</button>`;
 const role=currentUser.role;
 let main='services', label='Open My Services', extra='';
 if(role==='traveler'||role==='sender'){main='shipping';label='Open Shipping';}
 if(role==='owner'||role==='rent_seeker'){main='rentals';label='Open Rentals';}
 if(role==='truck_owner'||role==='driver'){main='truck';label='Open Trucking';}
 if(role==='taxi_limo_owner'||role==='taxi_limo_driver'||role==='taxi_driver'){main='taxi';label='Open Taxi/Limo';}
 if(role==='service_provider'){main='home_services';label='Open Home Services';}
 if(role==='business_owner'){main='business';label='Open Business Directory';}
 if(role==='event_organizer'){main='events';label='Open Events';}
 if(role==='marketplace'){main='marketplace';label='Open Marketplace';}
 if(role==='admin'){main='admin';label='Open Admin Dashboard';}
 return `<button class="btn primary" onclick="show('profile')">Profile</button><button class="btn" onclick="show('services')">My Services</button><button class="btn dark" onclick="show('${main}')">${label}</button>${extra}`;
}
function homeInfoSupport(){return `<h2 style="margin-top:22px">Information & Support</h2><div class="grid"><div class="card"><div class="service-icon">ℹ️</div><h3>About</h3><p class="muted">Learn what Habesha Connect does for the community.</p><button class="btn" onclick="show('about')">Open</button></div><div class="card"><div class="service-icon">📞</div><h3>Contact</h3><p class="muted">Contact support or the Habesha Connect team.</p><button class="btn" onclick="show('contact')">Open</button></div><div class="card"><div class="service-icon">❓</div><h3>Help / FAQ</h3><p class="muted">Get answers about accounts, services, and requests.</p><button class="btn" onclick="show('help')">Open</button></div><div class="card"><div class="service-icon">🐞</div><h3>Report Problem</h3><p class="muted">Tell us if something is confusing or broken.</p><button class="btn" onclick="show('report')">Open</button></div><div class="card"><div class="service-icon">🔒</div><h3>Privacy</h3><p class="muted">Review privacy information for the app.</p><button class="btn" onclick="show('privacy')">Open</button></div><div class="card"><div class="service-icon">📄</div><h3>Terms</h3><p class="muted">Review the terms and user responsibilities.</p><button class="btn" onclick="show('terms')">Open</button></div></div>`}
function home(){$('home').innerHTML=`<div class="hero"><h1>Habesha Connect</h1><p><b>Connecting the Ethiopian community through shipping, rentals, taxi, trucking, home services, jobs, marketplace, business directory, and events.</b></p><div class="notice"><b>Welcome:</b> The top menu is simplified so each user sees only the main pages they need. More information and support links are below.</div>${roleWelcome()}<div class="actions">${homeQuickActions()}</div></div><h2 style="margin-top:22px">Available Services</h2><div class="grid">${roleServices()}</div>${homeInfoSupport()}<h2 style="margin-top:22px">Coming Soon</h2><div class="grid"><div class="card locked"><div class="service-icon">🧾</div><h3>Immigration / Translation</h3><p class="muted">Find translation, forms, and local support providers.</p><span class="pill warn">Coming Soon</span></div></div>`}
function service(icon,title,text,page){return `<div class="card"><div class="service-icon">${icon}</div><h3>${title}</h3><p class="muted">${text}</p><button class="btn primary" onclick="show('${page}')">Open</button></div>`}
function account(){$('account').innerHTML=`<div class="grid"><div class="card"><h2>Login</h2><label>Email</label><input id="loginEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" placeholder="you@example.com"><label>Password</label>${passwordField('loginPass','Enter password','current-password')}<button class="btn primary" onclick="login()">Login</button><p class="muted">Use your real email/password account. Admin verification is managed in Supabase profiles.</p><button class="btn ghost" onclick="forgotPass()">Forgot Password</button><p class="small">Auth status: <b id="authStatus">Checking...</b></p></div><div class="card"><h2>Create Account</h2><label>Full Name</label><input id="regName"><label>Phone Number</label><input id="regPhone" placeholder="404-555-1234"><label>Email</label><input id="regEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false"><label>Password</label>${passwordField('regPass','Create password','new-password')}<label>Choose your services</label><div class="item" style="margin:6px 0 12px">${ROLE_LIST.map((r,i)=>`<label style="display:block;margin:7px 0"><input class="roleCheck" type="checkbox" value="${r}" ${i<2?'checked':''} style="width:auto;margin-right:8px">${ROLE_INFO[r].icon} ${ROLE_INFO[r].title}</label>`).join('')}</div><label><input type="checkbox" id="agreeTerms" style="width:auto;margin-right:8px">I agree to the Terms and Privacy Policy</label><button class="btn primary" onclick="register()">Create Account</button></div></div>`;showAuthStatus()}

async function forgotPass(){let defaultEmail=cleanEmail($('loginEmail')?.value||'');let e=prompt('Enter the email address for password reset',defaultEmail);if(!e)return;e=cleanEmail(e);if(!e.includes('@'))return alert('Please enter a valid full email address.');if(authReady()){let redirect=location.origin+location.pathname;let {error}=await hcSupabase.auth.resetPasswordForEmail(e,{redirectTo:redirect});if(error)return alert('Password reset could not be sent: '+error.message);alert('Password reset email sent. Open the email and click the reset link. It will show New Password and Confirm Password boxes.');return;}addNote(e,'Password reset requested. In the real app, an email reset link will be sent.');save();alert('Password reset notification created.');}
function recoveryParams(){let url=new URL(location.href);let hash=new URLSearchParams((location.hash||'').replace(/^#/,''));return {url,hash,type:url.searchParams.get('type')||hash.get('type'),code:url.searchParams.get('code')||hash.get('code'),access_token:hash.get('access_token')}}
function isPasswordRecoveryUrl(){let r=recoveryParams();return r.type==='recovery'||!!r.code||!!r.access_token}
function showPasswordResetForm(msg=''){
  nav();
  $('userBox').innerHTML='<span class="pill warn">Password reset</span>';
  pages.forEach(x=>$(x).classList.add('hide'));
  $('account').classList.remove('hide');
  document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
  let nb=$('nav_account'); if(nb)nb.classList.add('active');
  if($('mobileNav'))$('mobileNav').value='account';
  $('account').innerHTML=`<div class="card" style="max-width:560px;margin:0 auto"><h2>Reset Password</h2><p class="muted">Enter a new password for your Habesha Connect account.</p>${msg?`<div class="notice">${msg}</div>`:''}<label>New Password</label>${passwordField('newResetPass','New password','new-password')}<label>Confirm Password</label>${passwordField('confirmResetPass','Confirm new password','new-password')}<button class="btn primary" onclick="updatePasswordFromReset()">Update Password</button><button class="btn ghost" onclick="location.href=location.origin+location.pathname">Back to Login</button><p class="small">If this page does not update your password, open the reset email again and use the newest link.</p></div>`;
}
async function handlePasswordRecovery(){
  if(!authReady()||!isPasswordRecoveryUrl())return false;
  let r=recoveryParams();
  if(r.code){
    let {error}=await hcSupabase.auth.exchangeCodeForSession(r.code);
    if(error){console.warn('Recovery code exchange failed',error);showPasswordResetForm('Reset link opened, but Supabase could not validate it. Please request a new reset email if update fails.');return true;}
  }
  showPasswordResetForm();
  try{history.replaceState(null,'',location.origin+location.pathname)}catch(e){}
  return true;
}
async function updatePasswordFromReset(){
  if(!authReady())return alert('Supabase is not connected.');
  let p=String($('newResetPass')?.value||'');let c=String($('confirmResetPass')?.value||'');
  if(p.length<8)return alert('Password must be at least 8 characters.');
  if(p!==c)return alert('Passwords do not match.');
  let {error}=await hcSupabase.auth.updateUser({password:p});
  if(error)return alert('Could not update password: '+error.message+'\nPlease request a new reset link and try again.');
  await hcSupabase.auth.signOut();
  alert('Password updated successfully. Please log in with your new password.');
  location.href=location.origin+location.pathname;
}
function roleDashboardCards(){
 if(!currentUser)return '';
 if(currentUser.role==='traveler')return '';
 if(currentUser.role==='sender')return `<div class="grid"><div class="card"><h3>📦 Create Shipment</h3><p class="muted">Find verified travelers and request space.</p><button class="btn primary" onclick="show('shipping')">Start Shipping</button></div><div class="card"><h3>🧾 My Payments</h3><p class="muted">PayPal online and Zelle verification will be added later.</p></div><div class="card"><h3>🔔 Tracking</h3><p class="muted">Track package status and traveler responses.</p></div></div>`;
 if(currentUser.role==='owner')return `<div class="grid"><div class="card"><h3>🏠 Property Owner</h3><p class="muted">Rental actions are now inside the Rentals page.</p><button class="btn primary" onclick="show('rentals')">Open Rentals</button></div><div class="card"><h3>⭐ Reviews</h3><p class="muted">Owner ratings and feedback.</p></div></div>`;
 if(currentUser.role==='rent_seeker')return `<div class="grid"><div class="card"><h3>🔍 Search Rentals</h3><p class="muted">Find available homes and rooms.</p><button class="btn primary" onclick="show('rentals')">Find Rentals</button></div><div class="card"><h3>❤️ Favorites</h3><p class="muted">Save properties you like.</p></div><div class="card"><h3>📅 Viewing Requests</h3><p class="muted">Track paid viewing access and requests.</p></div></div>`;
 if(currentUser.role==='truck_owner')return `<div class="grid"><div class="card"><h3>🚛 Truck Owner Profile</h3><p class="muted">Manage your account information and verification here. Trucking actions are now inside the Trucking page.</p><button class="btn primary" onclick="show('truck')">Open Trucking Dashboard</button></div><div class="card"><h3>👤 Account Information</h3><p class="muted">Update your name, phone, city, and profile details below.</p></div></div>`;
 if(currentUser.role==='driver')return `<div class="grid"><div class="card"><h3>🚚 Trucking Dashboard</h3><p class="muted">Open Trucking to see available jobs, applications, and trailers for rent.</p><button class="btn primary" onclick="show('truck')">Open Trucking</button></div></div>`;
 if(currentUser.role==='service_provider')return `<div class="grid"><div class="card"><h3>🛠️ My Home Services</h3><p class="muted">Post services and manage customer requests after admin approval.</p><button class="btn primary" onclick="show('home_services')">Open Home Services</button></div><div class="card"><h3>📋 Requests</h3><p class="muted">View approved customer requests and accept or decline.</p><button class="btn" onclick="show('home_services')">See Requests</button></div></div>`;
 if(currentUser.role==='event_organizer')return `<div class="grid"><div class="card"><h3>📅 Events Organizer</h3><p class="muted">Create community events and track admin approval status.</p><button class="btn primary" onclick="show('events')">Open Events Dashboard</button></div></div>`;
 if(currentUser.role==='admin')return `<div class="grid"><div class="card"><h3>⚙️ Admin Center</h3><p class="muted">Manage users, verification, payments, reports, and settings.</p><button class="btn primary" onclick="show('admin')">Open Admin</button></div><div class="card"><h3>🏠 Rentals</h3><p class="muted">Approve properties and manage requests.</p></div><div class="card"><h3>📦 Shipping</h3><p class="muted">Review trips, shipments, and payments.</p></div></div>`;
 return `<div class="card"><h3>Welcome</h3><p class="muted">Your role is ${currentUser.role}. Your available tools are shown in the top menu.</p></div>`;
}
function services(){if(!requireLogin())return;let roles=currentUser.roles||[currentUser.role||'customer'];let cards=roles.map(r=>{let info=ROLE_INFO[r]||ROLE_INFO.customer;let active=r===currentUser.role;return `<div class="card ${active?'':'locked'}"><div class="service-icon">${info.icon}</div><h3>${info.title} ${active?'<span class="pill good">Active</span>':''}</h3><p class="muted">${info.desc}</p><button class="btn ${active?'ghost':'primary'}" onclick="switchRole('${r}')">${active?'Current Dashboard':'Continue as '+info.title}</button></div>`}).join('');let options=serviceRoleChoices(roles).map(r=>{let has=roles.includes(r);let info=ROLE_INFO[r];let adminNote=r==='admin'?'<span class="small"> — owner only</span>':'';return `<label style="display:block;margin:8px 0"><input class="svcCheck" type="checkbox" value="${r}" ${has?'checked':''} ${r==='admin'?'disabled':''} style="width:auto;margin-right:8px">${info.icon} ${info.title}${adminNote}</label>`}).join('');$('services').innerHTML=`<h2>🧭 My Services</h2><div class="hero"><h1>Welcome back, ${currentUser.name}</h1><p><b>What would you like to do today?</b></p><p>One Habesha Connect account can be a traveler today, sender tomorrow, property owner later, and business owner in the future.</p></div><h3 style="margin-top:22px">Continue as</h3><div class="grid">${cards}</div><div class="card" style="margin-top:18px"><h3>Manage My Roles</h3><p class="muted">Turn services on or off for this account. Admin is protected and cannot be removed from this page.</p><div class="grid"><div>${options}</div><div><p><b>Current active role:</b> <span class="pill">${roleTitle(currentUser.role)}</span></p><p class="muted">The active role controls which dashboard and menu you see.</p><button class="btn primary" onclick="saveRoleChoices()">Save My Services</button></div></div></div>`}
async function switchRole(role){if(!currentUser)return;if(!(currentUser.roles||[]).includes(role))return alert('Please add this service to your profile first.');currentUser.role=role;currentUser.active_role=role;localStorage.setItem('hc_active_role_'+currentUser.email,role);let u=data.users.find(x=>x.email===currentUser.email);if(u){u.role=role;u.active_role=role}persistOnly();render();show('profile');if(authReady()&&currentUser.id){fireAndForget(hcSupabase.from('profiles').update({active_role:role,role:role}).eq('id',currentUser.id),'active role sync')}}
async function saveRoleChoices(){if(!currentUser)return;let roles=[...document.querySelectorAll('.svcCheck:checked')].map(x=>x.value);if((currentUser.roles||[]).includes('admin')&&!roles.includes('admin'))roles.push('admin');if(!roles.length)return alert('Choose at least one service.');if(!roles.includes(currentUser.role))currentUser.role=roles[0];currentUser.roles=[...new Set(roles)];currentUser.active_role=currentUser.role;let u=data.users.find(x=>x.email===currentUser.email);if(u){u.roles=currentUser.roles;u.role=currentUser.role;u.active_role=currentUser.role}persistOnly();render();show('services');alert('Your services were saved. Use the top role switcher to change dashboards.');if(authReady()){let query=hcSupabase.from('profiles').update({roles:currentUser.roles,active_role:currentUser.role,role:currentUser.role});fireAndForget(currentUser.id?query.eq('id',currentUser.id):query.eq('email',currentUser.email),'roles sync')}}
async function profile(){
 if(!requireLogin())return;
 let payments=data.payments.filter(p=>paymentVisibleForActiveRole(p));
 let myShips=data.shipments.filter(x=>x.senderEmail===currentUser.email||x.travelerEmail===currentUser.email||String(x.travelerId||'')===String(currentUser.id||'')||String(x.senderId||'')===String(currentUser.id||'')).length;
 let myRentals=data.rentals.filter(x=>x.ownerEmail===currentUser.email).length;
 let myReqs=(data.rentalRequests||[]).filter(x=>x.seekerEmail===currentUser.email||x.ownerEmail===currentUser.email).length;
 let myTrips=data.trips.filter(x=>x.travelerEmail===currentUser.email||String(x.travelerId||'')===String(currentUser.id||'')).length;
 const isMyTravelerShipment=s=>s.travelerEmail===currentUser.email||String(s.travelerId||'')===String(currentUser.id||'');
 const myTravelerShipments=(data.shipments||[]).filter(isMyTravelerShipment);
 const travelerRows=[];
 myTravelerShipments.forEach(s=>{
   const commission=(Number(s.weight)||0)*Number(settings().travelerCommissionPerLb||0);
   let trip=s.tripId?data.trips.find(t=>String(t.id)===String(s.tripId)||String(t.dbId)===String(s.tripId)):null;
   let refund=Number(s.travelerListingFeeRefund||0);
   if(!refund && trip && trip.listingFeePaid && (s.travelerPaid || ['Delivered','Completed'].includes(s.status||'')) && !trip.listingFeeRefunded){refund=Number(trip.listingFeeAmount||settings().travelerTripListingFee||10);}
   const total=s.travelerPaid?Number(s.travelerPayoutAmount||commission+refund):(commission+refund);
   if(commission>0){
     travelerRows.push({service:s.travelerPaid?'Traveler Payout Paid':'Traveler Commission',desc:`Commission for shipment ${s.tracking||s.id} (${Number(s.weight)||0} lb × ${money(settings().travelerCommissionPerLb)}/lb)`,amount:commission,time:s.travelerPaidAt||s.createdAt||'Pending'});
   }
   if(refund>0){
     travelerRows.push({service:s.travelerPaid?'Listing Fee Refunded':'Listing Fee Refund',desc:`Trip listing fee refund for shipment ${s.tracking||s.id}`,amount:refund,time:s.travelerPaidAt||'Pending payout'});
   }
   if(total>0){
     travelerRows.push({service:s.travelerPaid?'Total Payout Paid':'Total Expected Payout',desc:`Total traveler payout for shipment ${s.tracking||s.id}`,amount:total,time:s.travelerPaidAt||'Pending payout'});
   }
 });
 let travelerEarningsTable=myTravelerShipments.length?`<h3>My Traveler Earnings</h3><table><tr><th>Type</th><th>Description</th><th>Amount</th><th>Status / Time</th></tr>${travelerRows.map(p=>`<tr><td>${p.service}</td><td>${p.desc}</td><td>${money(p.amount)}</td><td>${p.time}</td></tr>`).join('')||'<tr><td colspan="4">No traveler earnings yet.</td></tr>'}</table>`:'';
 $('profile').innerHTML=`<h2>👤 My Dashboard</h2>${roleDashboardCards()}<h3 style="margin-top:22px">My Activity</h3><div class="grid"><div class="card"><p>Shipping</p><div class="stat">${myShips}</div></div><div class="card"><p>Trips</p><div class="stat">${myTrips}</div></div><div class="card"><p>Rentals</p><div class="stat">${myRentals}</div></div><div class="card"><p>Viewing Requests</p><div class="stat">${myReqs}</div></div></div><div class="grid"><div class="card"><h3>Account Information</h3><label>Name</label><input id="profName" value="${currentUser.name}"><label>Phone</label><input id="profPhone" value="${currentUser.phone||''}" placeholder="Phone number"><label>City</label><input id="profCity" value="${currentUser.city||''}" placeholder="City"><p>Active Role: <span class="pill">${roleTitle(currentUser.role)}</span></p><p>Services: ${(currentUser.roles||[currentUser.role]).map(r=>`<span class="pill">${roleTitle(r)}</span>`).join(' ')}</p><button class="btn ghost" onclick="show('services')">Switch / Manage Services</button><p>Verification: <span class="pill ${currentUser.verified?'good':'warn'}">${currentUser.verified?'Verified':'Not verified'}</span></p><button class="btn primary" onclick="saveProfile()">Save Profile</button></div><div class="card"><h3>Account Tools</h3><p class="muted">Your account is connected to Supabase. Open messages, notifications, and account tools for your active role.</p><button class="btn" onclick="show('messages')">Open Messages</button><button class="btn" onclick="show('notifications')">Open Notifications</button></div></div>${travelerEarningsTable}<h3>My Payment History</h3><table><tr><th>Service</th><th>Description</th><th>Amount</th><th>Time</th></tr>${payments.map(p=>`<tr><td>${p.service}</td><td>${p.desc}</td><td>${money(p.amount)}</td><td>${p.time}</td></tr>`).join('')||'<tr><td colspan="4">No payments yet.</td></tr>'}</table>`
}
function saveProfile(){currentUser.name=$('profName').value;currentUser.phone=$('profPhone').value;currentUser.city=$('profCity').value;let u=data.users.find(x=>x.email===currentUser.email);Object.assign(u,currentUser);addNote(currentUser.email,'Profile updated.');save();show('profile')}
async function sendMessage(){
 if(!requireLogin())return;
 let to=$('msgTo').value||'admin.habeshaconnect@gmail.com',txt=$('msgText').value.trim();
 if(!txt)return alert('Write a message first');
 if(authReady()){
   let sender=await getProfileByEmail(currentUser.email);
   let receiver=await getProfileByEmail(to);
   if(!receiver||!receiver.id)return alert('Receiver account was not found. Choose a registered user.');
   let {error}=await hcSupabase.from('messages').insert({sender_id:sender&&sender.id,receiver_id:receiver.id,message:txt,created_at:new Date().toISOString()});
   if(error)return alert('Could not send message: '+error.message);
   addNote(to,'New message from '+currentUser.name);sendEmailNotice({to,name:userDisplayByEmail(to),subject:'New message received',summary:'You received a new message from '+currentUser.name+'.',buttonText:'Open Messages',page:'messages',details:{From:currentUser.name,Message:txt.slice(0,180)}});
   await loadSupabaseMessages();
   show('messages');
   return;
 }
 data.messages.unshift({from:currentUser.email,to,text:txt,time:new Date().toLocaleString(),source:'local'});
 addNote(to,'New message from '+currentUser.name);sendEmailNotice({to,name:userDisplayByEmail(to),subject:'New message received',summary:'You received a new message from '+currentUser.name+'.',buttonText:'Open Messages',page:'messages',details:{From:currentUser.name,Message:txt.slice(0,180)}});
 save();show('messages')
}
function messages(){if(!requireLogin())return;let msgs=data.messages.filter(m=>m.to==='all'||m.to===currentUser.email||m.from===currentUser.email||currentUser.role==='admin');let users=data.users.filter(u=>u.email!==currentUser.email).map(u=>`<option value="${u.email}">${u.name} — ${u.role}</option>`).join('');$('messages').innerHTML=`<h2>💬 Messages</h2><div class="grid"><div class="card"><h3>Send Message</h3><label>Choose User</label><select id="msgUserPick" onchange="$('msgTo').value=this.value"><option value="admin.habeshaconnect@gmail.com">Support / Admin</option>${users}</select><label>To Email</label><input id="msgTo" value="admin.habeshaconnect@gmail.com" placeholder="user@email.com"><label>Message</label><textarea id="msgText" rows="4" placeholder="Write your message"></textarea><button class="btn primary" onclick="sendMessage()">Send</button></div><div class="card"><h3>Message History</h3><p class="muted">Messages now load from Supabase only. Old browser test messages are ignored.</p><div class="stat">${msgs.length}</div><p>Visible messages</p></div></div><div class="list" style="margin-top:14px">${msgs.map(m=>`<div class="item"><b>${m.from}</b> → <span>${m.to}</span><p>${m.text}</p><p class="muted">${m.time}</p></div>`).join('')||'<p>No messages yet.</p>'}</div>`}




function mapDbMessage(row){
 const sender=row.sender||row.profiles||{};
 const receiver=row.receiver||{};
 let d=row.created_at?new Date(row.created_at):new Date();
 return {id:row.id||'',dbId:row.id||'',from:sender.email||row.sender_email||'Unknown',to:receiver.email||row.receiver_email||'Unknown',text:row.message||row.text||'',time:d.toLocaleString(),source:'supabase'};
}


/* V7.3.7 Trucking mobile/dashboard sync fix: Supabase-backed trucking records */
let hcTruckRealtimeReady=false;
function localRefFromDb(row,prefix){return row.local_ref||String(row.id||prefix+Date.now().toString().slice(-6));}
function mapTruckJob(row){return {dbId:row.id,id:localRefFromDb(row,'TJ'),ownerName:row.owner_name||'',ownerEmail:row.owner_email||'',ownerPhone:row.owner_phone||'',title:row.title||'',route:row.route||'',pay:row.pay||'',schedule:row.schedule||'',requirements:row.requirements||'',truckDetails:row.truck_details||'',status:row.status||'Pending Admin Approval',createdAt:row.created_at?new Date(row.created_at).toLocaleString():'',approvedAt:row.approved_at?new Date(row.approved_at).toLocaleString():'',hiredDriverName:row.hired_driver_name||'',hiredDriverEmail:row.hired_driver_email||'',hiredAt:row.hired_at?new Date(row.hired_at).toLocaleString():''};}
function mapTruckApplication(row){return {dbId:row.id,id:localRefFromDb(row,'TA'),jobId:row.job_local_ref||row.job_id||'',jobDbId:row.job_id||'',jobTitle:row.job_title||'',ownerName:row.owner_name||'',ownerEmail:row.owner_email||'',driverName:row.driver_name||'',driverEmail:row.driver_email||'',driverPhone:row.driver_phone||'',city:row.city||'',license:row.license||'',experience:row.experience||'',looking:row.looking||'',notes:row.notes||'',status:row.status||'Pending Admin Approval',createdAt:row.created_at?new Date(row.created_at).toLocaleString():'',adminApprovedAt:row.admin_approved_at?new Date(row.admin_approved_at).toLocaleString():'',approvedAt:row.approved_at?new Date(row.approved_at).toLocaleString():'',hiredAt:row.hired_at?new Date(row.hired_at).toLocaleString():'',closedAt:row.closed_at?new Date(row.closed_at).toLocaleString():''};}
function mapTruckDriverProfile(row){return {dbId:row.id,driverName:row.name||'',driverEmail:row.driver_email||'',name:row.name||'',phone:row.phone||'',city:row.city||'',license:row.license||'',experience:row.experience||'',looking:row.looking||'',notes:row.notes||'',updatedAt:row.updated_at?new Date(row.updated_at).toLocaleString():''};}
function mapTrailerRental(row){return {dbId:row.id,id:localRefFromDb(row,'TLR'),ownerName:row.owner_name||'',ownerEmail:row.owner_email||'',ownerPhone:row.owner_phone||'',trailerType:row.trailer_type||'',location:row.location||'',price:row.price||'',deposit:row.deposit||'',availability:row.availability||'',description:row.description||'',status:row.status||'Available',renterName:row.renter_name||'',renterEmail:row.renter_email||'',renterPhone:row.renter_phone||'',createdAt:row.created_at?new Date(row.created_at).toLocaleString():'',rentedAt:row.rented_at?new Date(row.rented_at).toLocaleString():''};}
async function syncTrailerRentalToSupabase(item){
 if(!authReady())return {error:null,data:null};
 let payload={local_ref:item.id,owner_name:item.ownerName,owner_email:item.ownerEmail,owner_phone:item.ownerPhone,trailer_type:item.trailerType,location:item.location,price:item.price,deposit:item.deposit,availability:item.availability,description:item.description,status:item.status,renter_name:item.renterName||'',renter_email:item.renterEmail||'',renter_phone:item.renterPhone||''};
 let res=await hcSupabase.from('trailer_rentals').insert(payload).select().single();
 if(!res.error&&res.data)item.dbId=res.data.id;
 return res;
}
async function updateTrailerRentalDb(item,fields){if(!authReady()||!item)return {error:null};let q=hcSupabase.from('trailer_rentals').update(fields);return item.dbId?await q.eq('id',item.dbId):await q.eq('local_ref',item.id);}
async function deleteTrailerRentalDb(item){if(!authReady()||!item)return {error:null};let q=hcSupabase.from('trailer_rentals').delete();return item.dbId?await q.eq('id',item.dbId):await q.eq('local_ref',item.id);}

async function loadSupabaseTrucking(){
 if(!authReady())return;
 let jobs=await hcSupabase.from('trucking_jobs').select('*').order('created_at',{ascending:false});
 if(jobs.error){console.warn('Trucking jobs load error',jobs.error);return;}
 data.truckJobs=(jobs.data||[]).map(mapTruckJob);
 let apps=await hcSupabase.from('trucking_applications').select('*').order('created_at',{ascending:false});
 if(!apps.error)data.truckApplications=(apps.data||[]).map(mapTruckApplication);else console.warn('Trucking applications load error',apps.error);
 let profiles=await hcSupabase.from('trucking_driver_profiles').select('*').order('updated_at',{ascending:false});
 if(!profiles.error)data.truckDriverProfiles=(profiles.data||[]).map(mapTruckDriverProfile);else console.warn('Trucking driver profiles load error',profiles.error);
 let trailers=await hcSupabase.from('trailer_rentals').select('*').order('created_at',{ascending:false});
 if(!trailers.error)data.trailerRentals=(trailers.data||[]).map(mapTrailerRental);else console.warn('Trailer rentals load error',trailers.error);
 persistOnly();
 initTruckRealtime();
}
async function syncTruckJobToSupabase(job){
 if(!authReady())return {error:null,data:null};
 let payload={local_ref:job.id,owner_name:job.ownerName,owner_email:job.ownerEmail,owner_phone:job.ownerPhone,title:job.title,route:job.route,pay:job.pay,schedule:job.schedule,requirements:job.requirements,truck_details:job.truckDetails,status:job.status};
 let res=await hcSupabase.from('trucking_jobs').insert(payload).select().single();
 if(!res.error&&res.data)job.dbId=res.data.id;
 return res;
}
async function syncTruckDriverProfileToSupabase(profile){
 if(!authReady())return {error:null,data:null};
 let payload={driver_email:profile.driverEmail,name:profile.name||profile.driverName||'',phone:profile.phone||'',city:profile.city||'',license:profile.license||'',experience:profile.experience||'',looking:profile.looking||'',notes:profile.notes||'',updated_at:new Date().toISOString()};
 let res=await hcSupabase.from('trucking_driver_profiles').upsert(payload,{onConflict:'driver_email'}).select().single();
 if(!res.error&&res.data)profile.dbId=res.data.id;
 return res;
}
async function syncTruckApplicationToSupabase(app,job){
 if(!authReady())return {error:null,data:null};
 let payload={local_ref:app.id,job_id:(job&&job.dbId)||app.jobDbId||null,job_local_ref:app.jobId,job_title:app.jobTitle,owner_name:app.ownerName,owner_email:app.ownerEmail,driver_name:app.driverName,driver_email:app.driverEmail,driver_phone:app.driverPhone,city:app.city,license:app.license,experience:app.experience,looking:app.looking,notes:app.notes,status:app.status};
 let res=await hcSupabase.from('trucking_applications').insert(payload).select().single();
 if(!res.error&&res.data)app.dbId=res.data.id;
 return res;
}
async function updateTruckJobDb(job,fields){if(!authReady()||!job)return {error:null};let q=hcSupabase.from('trucking_jobs').update(fields);return job.dbId?await q.eq('id',job.dbId):await q.eq('local_ref',job.id);}
async function updateTruckApplicationDb(app,fields){if(!authReady()||!app)return {error:null};let q=hcSupabase.from('trucking_applications').update(fields);return app.dbId?await q.eq('id',app.dbId):await q.eq('local_ref',app.id);}
async function deleteTruckJobDb(j){if(!authReady()||!j)return {error:null};let q=hcSupabase.from('trucking_jobs').delete();return j.dbId?await q.eq('id',j.dbId):await q.eq('local_ref',j.id);}
async function deleteTruckApplicationDb(a){if(!authReady()||!a)return {error:null};let q=hcSupabase.from('trucking_applications').delete();return a.dbId?await q.eq('id',a.dbId):await q.eq('local_ref',a.id);}
async function initTruckRealtime(){
 if(!authReady()||hcTruckRealtimeReady)return;
 hcTruckRealtimeReady=true;
 ['trucking_jobs','trucking_applications','trucking_driver_profiles','trailer_rentals'].forEach(tbl=>{
   hcSupabase.channel('hc_'+tbl).on('postgres_changes',{event:'*',schema:'public',table:tbl},async()=>{
     await loadSupabaseTrucking();
     if(currentPage==='truck')truck();
     if(currentPage==='admin')adminSuccess();
   }).subscribe();
 });
}
async function loadSupabaseMessages(){
 if(!authReady()){return;}
 let res=await hcSupabase.from('messages').select('*, sender:sender_id(email,name), receiver:receiver_id(email,name)').order('created_at',{ascending:false});
 let rows=res.data||[], error=res.error;
 if(error){console.warn('Message relationship load error, retrying basic select',error);let retry=await hcSupabase.from('messages').select('*').order('created_at',{ascending:false});rows=retry.data||[];error=retry.error;}
 if(error){console.warn('Message load error',error);data.messages=[];return;}
 data.messages=(rows||[]).map(mapDbMessage);
}
function mapDbNotification(row){
 const prof=row.profile||row.profiles||{};
 let d=row.created_at?new Date(row.created_at):new Date();
 return {id:row.id||'',dbId:row.id||'',to:prof.email||row.user_email||'',text:row.message||row.text||'',time:d.toLocaleString(),read:!!row.is_read,source:'supabase'};
}
async function loadSupabaseNotifications(){
 if(!authReady()){return;}
 let res=await hcSupabase.from('notifications').select('*, profile:user_id(email,name)').order('created_at',{ascending:false});
 let rows=res.data||[], error=res.error;
 if(error){console.warn('Notification relationship load error, retrying basic select',error);let retry=await hcSupabase.from('notifications').select('*').order('created_at',{ascending:false});rows=retry.data||[];error=retry.error;}
 if(error){console.warn('Notification load error',error);data.notifications=[];return;}
 data.notifications=(rows||[]).map(mapDbNotification);
}

function mapDbPayment(row){
 const prof=row.profile||row.profiles||{};
 let d=row.created_at?new Date(row.created_at):new Date();
 return {
   id:row.id||'',dbId:row.id||'',user:prof.email||row.user_email||'Unknown',
   role:prof.role||'',service:row.service||'Payment',desc:row.description||row.desc||'',
   amount:Number(row.amount||0),time:d.toLocaleString(),
   month:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'),
   quarter:d.getFullYear()+' Q'+(Math.floor(d.getMonth()/3)+1),year:String(d.getFullYear()),source:'supabase'
 };
}
async function loadSupabasePayments(){
 if(!authReady()){return;}
 let rows=[], error=null;
 let res=await hcSupabase.from('payments').select('*, profile:user_id(email,name,role)').order('created_at',{ascending:false});
 rows=res.data||[]; error=res.error;
 if(error){
   console.warn('Payment relationship load error, retrying basic select', error);
   let retry=await hcSupabase.from('payments').select('*').order('created_at',{ascending:false});
   rows=retry.data||[]; error=retry.error;
 }
 if(error){console.warn('Payment load error', error);data.payments=[];return;}
 data.payments=(rows||[]).map(mapDbPayment);
}

function mapDbTrip(row){
  let prof=row.profiles||{};
  return {
    id:row.id,
    dbId:row.id,
    route:(row.from_city||'')+' → '+(row.to_city||''),
    fromCity:row.from_city||'',
    toCity:row.to_city||'',
    travelDate:row.travel_date||'',
    totalSpace:Number(row.original_space_lb||0),
    availableSpace:Number(row.remaining_space_lb||0),
    traveler:prof.name||row.traveler_name||'Traveler',
    travelerPhone:prof.phone||'',
    travelerEmail:prof.email||'',
    travelerVerified:!!prof.verified,
    travelerId:row.traveler_id||'',
    status:row.status||'Open',
    listingFeePaid:!!row.listing_fee_paid,
    listingFeeAmount:Number(row.listing_fee||settings().travelerTripListingFee||10),
    listingFeeRefunded:!!row.listing_fee_refunded,
    listingFeePaidAt:row.listing_fee_paid_at||'',
    source:'supabase'
  };
}
async function loadSupabaseTrips(){
  if(!authReady())return;
  let {data:rows,error}=await hcSupabase.from('trips').select('*, profiles:traveler_id(name,email,phone,verified)').order('created_at',{ascending:false});
  if(error){console.warn('Trip load error',error);return;}
  let dbTrips=(rows||[]).map(mapDbTrip);
  let localOnly=(data.trips||[]).filter(t=>t.source!=='supabase'&&!t.dbId);
  data.trips=[...dbTrips,...localOnly];
}

function mapDbShipment(row){
  let sender=row.sender||row.sender_profile||{};
  let traveler=row.traveler||row.traveler_profile||{};
  let from=row.from_city||'';
  let to=row.to_city||'';
  let sid=row.id||'';
  return {
    id:sid,
    dbId:sid,
    route:from+' → '+to,
    fromCity:from,
    toCity:to,
    weight:Number(row.weight_lb||0),
    fee:Number(row.weight_lb||0)*settings().shippingRatePerLb,
    status:row.status||'Requested',
    tracking:row.tracking_number||('HC-'+String(sid).slice(0,6)),
    packagePhotos:row.package_photo?[row.package_photo]:[],
    sender:sender.name||row.sender_name||'Sender',
    senderPhone:sender.phone||row.sender_phone||'',
    senderEmail:sender.email||'',
    senderVerified:!!sender.verified,
    senderId:row.sender_id||'',
    receiver:row.receiver_name||'Receiver not entered',
    receiverPhone:row.receiver_phone||'',
    traveler:traveler.name||row.traveler_name||'Traveler',
    travelerPhone:traveler.phone||'',
    travelerEmail:traveler.email||'',
    travelerVerified:!!traveler.verified,
    travelerId:row.traveler_id||'',
    travelerPaid:!!row.traveler_paid,
    travelerPaidAt:row.traveler_paid_at||'',
    travelerListingFeeRefund:Number(row.listing_fee_refund||0),
    travelerPayoutAmount:Number(row.traveler_payout_amount||0),
    travelerPayoutMethod:row.traveler_payout_method||'',
    travelerPayoutNote:row.traveler_payout_note||'',
    tripId:row.trip_id||'',
    appFee:Number(row.weight_lb||0)*settings().appCommissionPerLb,
    paid:!!row.paid,
    paymentStatus:row.paid?'Paid':'Unpaid',
    spaceDeducted:['Accepted','Paid','Ready for Delivery','Completed'].includes(row.status||''),
    source:'supabase'
  };
}
async function loadSupabaseShipments(){
  if(!authReady())return;
  let {data:rows,error}=await hcSupabase.from('shipments').select('*, sender:sender_id(name,email,phone,verified), traveler:traveler_id(name,email,phone,verified)').order('created_at',{ascending:false});
  if(error){
    console.warn('Shipment relationship load error, retrying basic select',error);
    let retry=await hcSupabase.from('shipments').select('*').order('created_at',{ascending:false});
    rows=retry.data||[]; error=retry.error;
  }
  if(error){console.warn('Shipment load error',error);return;}
  let dbShips=(rows||[]).map(mapDbShipment);
  let localOnly=(data.shipments||[]).filter(x=>x.source!=='supabase'&&!x.dbId);
  data.shipments=[...dbShips,...localOnly];
}

function recalcTripSpacesFromShipments(){
  (data.trips||[]).forEach(t=>{
    const used=(data.shipments||[])
      .filter(s=>String(s.tripId||'')===String(t.id||'') && ['Approved','Ready for Delivery','In Transit','Delivered','Completed'].includes(s.status||''))
      .reduce((sum,s)=>sum+(Number(s.weight)||0),0);
    const calculated=Math.max(0,(Number(t.totalSpace)||0)-used);
    if(!Number.isNaN(calculated)){
      if(t.availableSpace===undefined || calculated < Number(t.availableSpace)) t.availableSpace=calculated;
      if(t.availableSpace<=0) t.status='Full';
    }
  });
}

async function updateSupabaseTripStatus(t,status){
  if(!authReady()||!t||!t.dbId)return false;
  let {error}=await hcSupabase.from('trips').update({status}).eq('id',t.dbId);
  if(error){alert('Could not update Supabase trip: '+error.message);return false;}
  return true;
}

function addDaysIso(days){let d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+days);return d.toISOString().slice(0,10);}
function daysUntil(dateStr){if(!dateStr)return null;let d=new Date(dateStr+'T00:00:00');let now=new Date();now.setHours(0,0,0,0);return Math.ceil((d-now)/86400000);}
function expiryBadge(dateStr,label){let n=daysUntil(dateStr);if(n===null)return '<span class="pill warn">No '+label+' date</span>';if(n<0)return '<span class="pill bad">'+label+' expired</span>';if(n<=30)return '<span class="pill warn">'+label+' expires in '+n+' days</span>';return '<span class="pill good">'+label+' OK</span>';}
function activeTripSort(a,b){let ar=Number(a.availableSpace||0),br=Number(b.availableSpace||0);let ad=a.travelDate||'',bd=b.travelDate||'';if((ar>0)!==(br>0))return ar>0?-1:1; if(ad!==bd)return ad.localeCompare(bd);return String(b.id||'').localeCompare(String(a.id||''));}
function isTripBookable(t){let remaining=Number(t.availableSpace ?? t.remaining_space_lb ?? 0);let status=String(t.status||'Open');let travel=t.travelDate||'';let notFlown=!travel || travel>=addDaysIso(0);return remaining>0 && notFlown && ['Open','Approved'].includes(status) && !['Full','Closed','Cancelled','Canceled','Completed','Delivered','Flown'].includes(status);}
function goTravelerShipSection(section){
  show('shipping');
  setTimeout(()=>{
    let el=$(section==='post'?'travelerPostTrip':(section==='requests'?'travelerShipRequests':'travelerOpenTrips'));
    if(el&&el.scrollIntoView) el.scrollIntoView({behavior:'smooth',block:'start'});
  },80);
}
function travelerShippingDashboardCards(){
 return `<div class="grid"><div class="card"><h3>✈️ Open Trip</h3><p class="muted">Post a new traveler trip for senders.</p><button class="btn primary" onclick="goTravelerShipSection('post')">Open Trip</button></div><div class="card"><h3>🧳 My Open Trips</h3><p class="muted">Manage trips you already posted.</p><button class="btn primary" onclick="goTravelerShipSection('trips')">My Open Trips</button></div><div class="card"><h3>📦 Sender Requests</h3><p class="muted">Review requests and update space after accepting.</p><button class="btn primary" onclick="goTravelerShipSection('requests')">View Requests</button></div><div class="card"><h3>💬 Messages</h3><p class="muted">Chat with senders.</p><button class="btn primary" onclick="show('messages')">Messages</button></div></div>`;
}

async function shipping(){
 let role=currentUser?currentUser.role:null;
 let syncNotice='<div class="notice"><b>Phone sync:</b> This page refreshes shared shipping data from Supabase in the background. If another phone just posted or admin just approved, tap <button class="btn ghost" onclick="refreshCurrentPage()">Refresh Latest Data</button></div>';
 let intro = syncNotice + (role==='traveler' ? '<div class="notice">Traveler note: accept or decline sender requests. Space is reserved only after the sender pays and admin approves the shipment.</div>' : '<div class="notice">Shipping note: senders can search verified travelers, request space, and pay after the traveler accepts. Contact information is released after approval.</div>');
 let tripBox = role==='traveler' ? `<section id="travelerPostTrip" class="card"><h3>Post Traveler Trip</h3>${routeSelects('trip')}<label>Travel Date</label><input id="tripDate" type="date" min="${addDaysIso(5)}"><label>Available Space lb</label><input id="tripSpace" type="number" value="100"><p class="muted">Post your available luggage space. Sender and traveler can agree on details before payment.</p><button class="btn primary" onclick="addTrip()">Publish Trip</button></section>` : '';
 let shipFilter=($('shipSearch')&&$('shipSearch').value||'').toLowerCase();
 let visibleTrips=data.trips.filter(t=>{let openForBooking=role==='admin'||isTripBookable(t);let matches=!shipFilter||String(t.route||'').toLowerCase().includes(shipFilter)||String(t.travelDate||'').includes(shipFilter)||String(t.fromCity||'').toLowerCase().includes(shipFilter)||String(t.toCity||'').toLowerCase().includes(shipFilter);return openForBooking&&matches;}).sort(activeTripSort);
 let terminalStatuses=['Completed'];
 let shipments=data.shipments.filter(s=>{
   if(role==='admin')return true;
   if(terminalStatuses.includes(s.status||'') || ((s.status==='Delivered'||s.status==='Completed') && s.travelerPaid))return false;
   if(!currentUser)return true;
   if(role==='traveler')return (String(s.travelerId||'')===String(currentUser.id||'') || (s.travelerEmail&&s.travelerEmail===currentUser.email));
   if(role==='sender'||role==='customer')return (String(s.senderId||'')===String(currentUser.id||'') || (s.senderEmail&&s.senderEmail===currentUser.email));
   return (s.senderEmail===currentUser.email || s.travelerEmail===currentUser.email);
 });
 let myTrips=data.trips.filter(t=>{let mine=currentUser&&(String(t.travelerId||'')===String(currentUser.id||'')||t.travelerEmail===currentUser.email);let status=String(t.status||'Open');return mine&&!['Closed','Cancelled','Canceled','Completed','Delivered','Flown'].includes(status);}).sort(activeTripSort);
 let statsHtml='';
 if(role==='admin'){
   statsHtml=`<h3>Shipping Connect</h3><div class="grid"><div class="card"><p>Total Trips</p><div class="stat">${data.trips.length}</div></div><div class="card"><p>Total Shipments</p><div class="stat">${data.shipments.length}</div></div><div class="card"><p>Paid Shipments</p><div class="stat">${data.shipments.filter(x=>x.paid).length}</div></div></div>`;
 } else if(role==='traveler'){
   statsHtml=`<h3>Shipping Connect</h3><div class="grid"><div class="card"><p>My Trips</p><div class="stat">${myTrips.length}</div></div><div class="card"><p>Shipment Requests</p><div class="stat">${shipments.length}</div></div><div class="card"><p>Approved / Active</p><div class="stat">${shipments.filter(x=>['Approved','Ready for Delivery','In Transit'].includes(x.status||'')).length}</div></div></div>`;
 } else {
   statsHtml=`<h3>Shipping Connect</h3><div class="grid"><div class="card"><p>Total Shipments</p><div class="stat">${shipments.length}</div></div></div>`;
 }
 let searchBox=`<div class="card"><h3>Search Filters</h3><label>Search route, city, or date</label><input id="shipSearch" value="${shipFilter}" oninput="shipping()" placeholder="Atlanta, Addis Ababa, 2026-07"><button class="btn ghost" onclick="$('shipSearch').value='';shipping()">Show All</button></div>`;
 let availableTripsHtml=`<h3>Available Traveler Trips</h3><div class="list">${visibleTrips.map(t=>tripCard(t,role)).join('')||'<div class="item">No traveler trips posted yet.</div>'}</div>`;
 let shipmentRequestsHtml=`<section id="travelerShipRequests"><h3>Shipment Requests</h3><div class="list">${shipments.map(s=>shipCard(s,role)).join('')||'<div class="item">No shipment requests yet.</div>'}</div></section>`;
 if(role==='traveler'){
   $('shipping').innerHTML=`<h2>🚢 Shipping Dashboard</h2>${travelerShippingDashboardCards()}${tripBox}${shipmentRequestsHtml}<section id="travelerOpenTrips"><h3>My Traveler Trips</h3><div class="list">${myTrips.map(t=>tripCard(t,role)).join('')||'<div class="item">You have not posted a trip yet.</div>'}</div></section>${statsHtml}${intro}`;
 } else if(role==='sender'||role==='customer'||!currentUser){
   $('shipping').innerHTML=`<h2>📦 Shipping Connect</h2>${searchBox}${availableTripsHtml}${shipmentRequestsHtml}${statsHtml}${intro}`;
 } else if(role==='admin'){
   $('shipping').innerHTML=`<h2>📦 Shipping Connect</h2>${statsHtml}${availableTripsHtml}${shipmentRequestsHtml}`;
 } else {
   $('shipping').innerHTML=`<h2>📦 Shipping Connect</h2>${statsHtml}${intro}`;
 }
}
function tripCard(t,role){
 let canRequest=(role==='sender'||role==='customer'||!currentUser) && t.availableSpace>0;
 let request=canRequest?`<label>Request lb</label><input id="req_${t.id}" type="number" value="25" max="${t.availableSpace}"><button class="btn primary" onclick="requestTrip('${t.id}')">Request Space</button>`:'';
 let ownerActions=(currentUser&&t.travelerEmail===currentUser.email)?`<button class="btn bad" onclick="closeTrip('${t.id}')">Close Trip</button>`:'';
 let showTripPhone=role==='admin'||(currentUser&&t.travelerEmail===currentUser.email);return `<div class="item"><div class="item-head"><b>${t.id} ${t.route}</b><span class="pill good">${t.availableSpace} lb available</span></div><p><b>Traveler:</b> ${t.traveler} ${verifiedBadge(t.travelerVerified)}</p><p><b>Phone:</b> ${showTripPhone?(t.travelerPhone||'Not entered'):'Shown after admin approval'} • <b>Date:</b> ${t.travelDate||'Ask traveler'}</p><p><b>Status:</b> <span class="pill ${String(t.status||'Open').includes('Pending')?'warn':(String(t.status||'Open')==='Declined'?'bad':'good')}">${t.status||'Open'}</span></p><p><b>Original space:</b> ${t.totalSpace} lb • <b>Remaining:</b> ${t.availableSpace} lb</p>${role==='admin'?`<p><b>Trip listing fee:</b> ${t.listingFeePaid?'<span class="pill good">Paid '+money(t.listingFeeAmount)+'</span>':'<span class="pill warn">Not paid</span>'} ${t.listingFeeRefunded?'<span class="pill good">Refunded in payout</span>':''}</p>`:''}<div class="actions">${request}${ownerActions}</div></div>`;
}
function shipCard(s,role){
 let statusClass=['Paid','Payment Pending Admin Review','Approved','Ready for Delivery'].includes(s.status)?'good':(s.status==='Declined'?'bad':'warn');
 let photos=(s.packagePhotos||[]).map(x=>`<span class="photoThumb">📷 ${x}</span>`).join('')||'<span class="small">No package photo yet</span>';
 let relatedTripForPayout=s.tripId?data.trips.find(t=>String(t.id)===String(s.tripId)):null;
 let refundEligible=relatedTripForPayout&&relatedTripForPayout.listingFeePaid&&!relatedTripForPayout.listingFeeRefunded;
 let listingRefund=Number(s.travelerListingFeeRefund||0)||(refundEligible?Number(relatedTripForPayout.listingFeeAmount||settings().travelerTripListingFee||10):0);
 let payoutAmt=s.weight*settings().travelerCommissionPerLb;
 let totalPayout=payoutAmt+listingRefund;
 let payoutLine=`<p><b>Traveler payout:</b> ${money(totalPayout)} • ${s.travelerPaid?'<span class="pill good">Traveler Paid</span>':'<span class="pill warn">Not Paid Yet</span>'} ${s.travelerPayoutMethod?(' • '+s.travelerPayoutMethod):''}</p>`;
 let adminInfo = `<p><b>Tracking:</b> ${s.tracking||''}</p><div class="photoStrip">${photos}</div><p>${s.weight} lb • Sender pays ${money(s.weight*settings().shippingRatePerLb)} • App fee ${money(s.appFee)} • Traveler commission ${money(payoutAmt)} ${listingRefund?(' • Listing fee refund '+money(listingRefund)) : ''}</p>${payoutLine}${contactLine('Sender',s.sender,s.senderPhone,s.senderEmail)} ${verifiedBadge(s.senderVerified)}${contactLine('Receiver',s.receiver,s.receiverPhone,'')}${contactLine('Traveler',s.traveler,s.travelerPhone,s.travelerEmail)} ${s.travelerEmail?verifiedBadge(s.travelerVerified):''}`;
 let approvedContact=['Approved','Ready for Delivery','In Transit'].includes(s.status||'') && !s.travelerPaid;let travelerPayoutDetails=`<p class="muted">Beta: shipping charges are hidden. Sender and traveler should agree on airline/luggage and delivery details before payment.</p>`;let travelerInfo = `<p><b>Tracking:</b> ${s.tracking||''}</p><div class="photoStrip">${photos}</div><p><b>Weight:</b> ${s.weight} lb</p>${travelerPayoutDetails}${verifiedBadge(s.senderVerified)} ${approvedContact?contactLine('Sender',s.sender,s.senderPhone,'')+contactLine('Receiver',s.receiver,s.receiverPhone,''):'<p class="muted">Sender and receiver contact will show after payment is approved by admin.</p>'}`;
 let relatedTrip=s.tripId?data.trips.find(t=>String(t.id)===String(s.tripId)||String(t.dbId)===String(s.tripId)):null;let tripSpace=relatedTrip?`<p><b>Traveler space:</b> Original ${relatedTrip.totalSpace} lb • Remaining ${relatedTrip.availableSpace} lb</p>`:'';let senderCanSeeTraveler=['Approved','Ready for Delivery','In Transit'].includes(s.status||'') && !s.travelerPaid;let senderInfo = `<p><b>Tracking:</b> ${s.tracking||''}</p><div class="photoStrip">${photos}</div><p><b>Weight:</b> ${s.weight} lb ${s.paid?'<span class="pill good">✅ Agreement Confirmed</span>':''}</p><p class="muted">Beta: shipping charges are hidden. Please agree with the traveler about luggage/airline and delivery details before payment.</p>${verifiedBadge(s.senderVerified)} ${s.travelerEmail&&senderCanSeeTraveler?contactLine('Traveler',s.traveler,s.travelerPhone,'')+verifiedBadge(s.travelerVerified)+tripSpace:(s.travelerEmail?'<p class="muted">Traveler contact will show after admin approves payment.</p>':'')}`;
 let info = role==='admin' ? adminInfo : (role==='traveler' ? travelerInfo : senderInfo);
 let actions='';
 if(role==='traveler') actions=(s.status==='Requested'?`<button class="btn primary" onclick="acceptShip('${s.id}')">Accept</button><button class="btn bad" onclick="declineShip('${s.id}')">Decline</button>`:'')+`<button class="btn ghost" onclick="reviewUser('${s.senderEmail}','sender')">Review Sender</button>`;
 else if(role==='admin') actions=`<button class="btn primary" onclick="approveShipment('${s.id}')">Approve Payment</button><button class="btn ghost" onclick="markDelivered('${s.id}')">Mark Delivered</button><button class="btn ghost" onclick="payTraveler('${s.id}')">Pay Traveler</button><button class="btn bad" onclick="declineShip('${s.id}')">Decline</button>`;
 else actions=`${s.paid?'<button class="btn ghost" disabled>Agreement sent - waiting admin approval</button>':(s.status==='Accepted'?`<button class="btn primary" onclick="payShipment('${s.id}')">Confirm Agreement</button>`:'<button class="btn ghost" disabled>Waiting traveler approval</button>')}<button class="btn ghost" onclick="reviewUser('${s.travelerEmail||''}','traveler')">Review Traveler</button>`;
 return `<div class="item"><div class="item-head"><b>${s.id} ${s.route}</b><span class="pill ${statusClass}">${s.status}</span></div>${info}<div class="actions">${actions}</div></div>`;
}
async function addTrip(){if(!requireLogin())return;if(currentUser.role!=='traveler'&&currentUser.role!=='admin')return alert('Only travelers can post trips.');let from=$('tripFrom').value,to=$('tripTo').value;if(from===to)return alert('From and To cannot be the same.');let travelDate=$('tripDate').value;if(!travelDate)return alert('Please enter travel date.');if(travelDate<addDaysIso(0))return alert('You cannot post a trip for a previous day.');if(travelDate<addDaysIso(5))return alert('Please post traveler trips at least 5 days before the flight date.');let space=+$('tripSpace').value||0;if(space<=0)return alert('Enter available space.');let fee=Number(settings().travelerTripListingFee||10);if(!confirm('Publish this traveler trip? Sender and traveler will agree on shipping details before payment.'))return;if(authReady()){let travelerProfile=currentUser&&currentUser.id?currentUser:await getProfileByEmail(currentUser.email);if(!travelerProfile||!travelerProfile.id)return alert('Your profile is still loading on this device. Please refresh once, sign in again, and post the trip. The trip was not submitted to admin yet.');let payload={traveler_id:travelerProfile.id,from_city:from,to_city:to,travel_date:travelDate,original_space_lb:space,remaining_space_lb:space,status:'Pending Admin Approval',listing_fee_paid:true,listing_fee:fee,listing_fee_refunded:false,listing_fee_paid_at:new Date().toISOString()};let {data:row,error}=await hcSupabase.from('trips').insert(payload).select('*, profiles:traveler_id(name,email,phone,verified)').single();if(error){if(String(error.message||'').toLowerCase().includes('column'))return alert('Supabase is missing traveler trip fee columns. Please run the latest Supabase SQL for this project, then try again.');return alert('Could not save trip to Supabase: '+error.message);}data.trips.unshift(mapDbTrip(row));addNote('all','New traveler trip posted by '+currentUser.name+' with '+space+' lb available.');addNote('admin.habeshaconnect@gmail.com','Traveler trip waiting for approval by '+currentUser.name+' for '+from+' → '+to+'.');sendAdminEmailNotice('Traveler posted a trip','A traveler posted a new trip and it is ready for admin review.',{Traveler:currentUser.name,Email:currentUser.email,Route:from+' → '+to,Space:space+' lb',Status:'Pending Admin Approval'},'shipping');save();show('shipping');return;}let id='T'+Date.now().toString().slice(-5);data.trips.unshift({id,route:from+' → '+to,travelDate:travelDate,totalSpace:space,availableSpace:space,traveler:currentUser.name,travelerPhone:currentUser.phone||'',travelerEmail:currentUser.email,travelerVerified:!!currentUser.verified,status:'Pending Admin Approval',listingFeePaid:true,listingFeeAmount:fee,listingFeeRefunded:false,listingFeePaidAt:new Date().toLocaleString()});addNote('all','New traveler trip posted by '+currentUser.name+' with '+space+' lb available.');sendAdminEmailNotice('Traveler posted a trip','A traveler posted a new trip and it is ready for admin review.',{Traveler:currentUser.name,Email:currentUser.email,Route:from+' → '+to,Space:space,Status:'Pending Admin Approval'},'shipping');save();shipping()}
async function requestTrip(id){
 if(!requireLogin())return;
 if(currentUser.role!=='sender'&&currentUser.role!=='customer'&&currentUser.role!=='admin')return alert('Only senders can request traveler space.');
 let t=data.trips.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));if(!t)return alert('Trip not found. Please refresh and try again.');
 let wRaw=String(($('req_'+id)?.value||'')).trim();
 if(!wRaw)return alert('Please enter the number of pounds you want to request.');
 if(!/^\d+$/.test(wRaw))return alert('Requested pounds must be numbers only.');
 let w=Number(wRaw);
 if(w<=0)return alert('Requested pounds must be greater than 0.');
 if(w>Number(t.availableSpace||0))return alert('Only '+t.availableSpace+' lb is available.');
 const phoneOk=v=>/^\d{7,15}$/.test(String(v||'').trim());
 const askRequired=(label,def='',validator=null,err='')=>{
   let value=prompt(label,def);
   if(value===null)return null;
   value=String(value||'').trim();
   if(!value){alert('Please complete this required field: '+label.replace(':',''));return null;}
   if(validator&&!validator(value)){alert(err||('Please enter a valid value for '+label));return null;}
   return value;
 };
 let desc=askRequired('Package description:', ''); if(desc===null)return;
 let senderName=askRequired('Sender full name:', currentUser.name||''); if(senderName===null)return;
 let senderPhone=askRequired('Sender phone number:', String(currentUser.phone||'').replace(/\D/g,''), phoneOk, 'Sender phone number must be numbers only, 7 to 15 digits. Example: 4045551234'); if(senderPhone===null)return;
 let receiver=askRequired('Receiver name in Ethiopia:', ''); if(receiver===null)return;
 let receiverPhone=askRequired('Receiver phone number:', '', phoneOk, 'Receiver phone number must be numbers only, 7 to 15 digits. Example: 251911123456'); if(receiverPhone===null)return;
 const confirmMsg='Please confirm your request:\n\nPackage: '+desc+'\nSender: '+senderName+'\nSender Phone: '+senderPhone+'\nReceiver: '+receiver+'\nReceiver Phone: '+receiverPhone+'\nWeight: '+w+' lb\n\nClick OK to submit this request.';
 if(!confirm(confirmMsg))return;
 const tracking='HC-'+Date.now().toString().slice(-6);
 if(authReady()&&currentUser.id&&t.dbId){
   const payload={tracking_number:tracking,sender_id:currentUser.id,traveler_id:t.travelerId||null,trip_id:t.dbId,from_city:t.fromCity||((t.route||'').split('→')[0]||'Atlanta, GA').trim(),to_city:t.toCity||((t.route||'').split('→')[1]||'Addis Ababa').trim(),weight_lb:w,sender_name:senderName,sender_phone:senderPhone,receiver_name:receiver,receiver_phone:receiverPhone,package_description:desc,paid:false,status:'Requested'};
   if(!payload.traveler_id)return alert('This trip is missing traveler_id. Please refresh the page and try again.');
   let inserted=await hcSupabase.from('shipments').insert(payload).select('*').single();
   if(inserted.error){const msg=String(inserted.error.message||'');if(msg.toLowerCase().includes('sender_name')||msg.toLowerCase().includes('sender_phone')||msg.toLowerCase().includes('package_description'))return alert('Supabase is missing sender shipment/package columns. Please run the latest Supabase SQL for this project, then try again.');return alert('Could not save request to Supabase: '+inserted.error.message);}
   let row=inserted.data;
   row.sender={name:senderName,email:currentUser.email,phone:senderPhone,verified:!!currentUser.verified};
   row.traveler={name:t.traveler,email:t.travelerEmail,phone:t.travelerPhone,verified:!!t.travelerVerified};
   data.shipments.unshift(mapDbShipment(row));
   addNote(t.travelerEmail||'all','New '+w+' lb space request from '+senderName+'.');
   addNote(currentUser.email,'Space request sent to '+t.traveler+'.');sendAdminEmailNotice('Sender requested luggage space','A sender requested traveler luggage space.',{Sender:senderName,SenderEmail:currentUser.email,Traveler:t.traveler,TravelerEmail:t.travelerEmail,Weight:w+' lb',Route:t.route},'admin');sendEmailNotice({to:t.travelerEmail,name:t.traveler,subject:'Someone requested your luggage space',summary:'A sender requested luggage space on your trip. Please open your Traveler Dashboard to review or accept the request.',buttonText:'Open Traveler Dashboard',page:'shipping',details:{Sender:senderName,SenderEmail:currentUser.email,Route:t.route,Weight:w+' lb',Receiver:receiver,Tracking:tracking}});
   save();await loadSupabaseShipments();alert('Your request was entered correctly and submitted.');show('shipping');return;
 }
 let sid='S'+Date.now().toString().slice(-5);
 data.shipments.unshift({id:sid,route:t.route,weight:w,fee:w*settings().shippingRatePerLb,status:'Requested',tracking:'HC-'+sid,packagePhotos:[],sender:senderName,senderPhone:senderPhone,senderEmail:currentUser.email,senderId:currentUser.id||'',senderVerified:!!currentUser.verified,receiver:receiver,receiverPhone:receiverPhone,traveler:t.traveler,travelerPhone:t.travelerPhone,travelerEmail:t.travelerEmail,travelerId:t.travelerId||'',travelerVerified:t.travelerVerified,tripId:t.id,appFee:w*settings().appCommissionPerLb,paid:false,paymentStatus:'Unpaid'});
 addNote(t.travelerEmail,'New '+w+' lb space request from '+senderName+'.');addNote(currentUser.email,'Space request sent to '+t.traveler+'.');sendAdminEmailNotice('Sender requested luggage space','A sender requested traveler luggage space.',{Sender:senderName,SenderEmail:currentUser.email,Traveler:t.traveler,TravelerEmail:t.travelerEmail,Weight:w+' lb',Route:t.route},'admin');sendEmailNotice({to:t.travelerEmail,name:t.traveler,subject:'Someone requested your luggage space',summary:'A sender requested luggage space on your trip. Please open your Traveler Dashboard to review or accept the request.',buttonText:'Open Traveler Dashboard',page:'shipping',details:{Sender:senderName,SenderEmail:currentUser.email,Route:t.route,Weight:w+' lb',Receiver:receiver,Tracking:'HC-'+sid}});save();alert('Your request was entered correctly and submitted.');shipping()}


async function closeTrip(id){let t=data.trips.find(x=>x.id===id);if(!t)return;if(t.source==='supabase'){let ok=await updateSupabaseTripStatus(t,'Closed');if(!ok)return;}t.status='Closed';save();shipping()}
function addShipment(){
  alert('This old shipping form is no longer used. Please use Available Traveler Trips and Request Space.');
}


async function payShipment(id){if(!requireLogin())return;let s=data.shipments.find(x=>x.id===id);if(!s)return;if(currentUser.role!=='admin'&&s.senderEmail!==currentUser.email&&String(s.senderId||'')!==String(currentUser.id||''))return alert('Only the sender can pay for this shipment.');if(s.status!=='Accepted'&&currentUser.role!=='admin')return alert('Please wait for the traveler to accept before paying.');if(s.paid){alert('Agreement already sent. Waiting for admin approval.');shipping();return;}pay('Shipping',s.weight*settings().shippingRatePerLb,'Shipment '+s.id+' agreement');if(authReady()&&s.dbId){let {error}=await hcSupabase.from('shipments').update({paid:true,status:'Payment Pending Admin Review'}).eq('id',s.dbId);if(error)alert('Payment recorded locally, but Supabase update failed: '+error.message);}s.paid=true;s.paymentStatus='Paid';s.status='Payment Pending Admin Review';addNote('admin.habeshaconnect@gmail.com','Sender paid for shipment '+s.id+' tracking '+(s.tracking||'')+'. Admin approval is needed.');sendAdminEmailNotice('Payment requires admin approval','A shipping transaction/payment requires admin approval.',{Sender:s.sender||currentUser.name,Email:s.senderEmail||currentUser.email,Tracking:s.tracking||s.id,Amount:money(s.weight*settings().shippingRatePerLb)},'admin');addNote(s.senderEmail||currentUser.email,'Agreement confirmed. Waiting for admin approval.');save();shipping()}
async function acceptShip(id){
 if(!requireLogin())return;let s=data.shipments.find(x=>x.id===id);if(!s)return;
 if(currentUser.role!=='admin'&&s.travelerEmail&&s.travelerEmail!==currentUser.email&&String(s.travelerId||'')!==String(currentUser.id||''))return alert('This request belongs to another traveler.');
 if(s.tripId){let t=data.trips.find(x=>x.id===s.tripId);if(t&&s.weight>t.availableSpace)return alert('Not enough space left. Remaining: '+t.availableSpace+' lb');}
 if(authReady()&&s.dbId){let {error}=await hcSupabase.from('shipments').update({status:'Accepted'}).eq('id',s.dbId);if(error)return alert('Could not accept request: '+error.message);}
 s.status='Accepted';s.traveler=currentUser.name;s.travelerPhone=currentUser.phone||'';s.travelerEmail=currentUser.email;s.travelerVerified=!!currentUser.verified;
 addNote(s.senderEmail||'all','Your shipment was accepted by '+currentUser.name+'. Please confirm the agreement so admin can approve and reserve the space.');
 if(s.senderEmail)sendEmailNotice({to:s.senderEmail,name:s.sender||'Sender',subject:'Traveler accepted your shipping request',summary:'The traveler accepted your shipping request. Please open Shipping and confirm the agreement so admin can approve and reserve the space.',buttonText:'Open Shipping Dashboard',page:'shipping',details:{Tracking:s.tracking||id,Traveler:currentUser.name,Weight:(s.weight||0)+' lb',Status:'Accepted'}});
 save();shipping()}
async function declineShip(id){let s=data.shipments.find(x=>x.id===id);if(!s)return;if(authReady()&&s.dbId){let {error}=await hcSupabase.from('shipments').update({status:'Declined'}).eq('id',s.dbId);if(error)return alert('Could not decline request: '+error.message);}s.status='Declined';addNote(s.senderEmail||'all','Your shipment request was declined.');sendEmailNotice({to:s.senderEmail,name:s.sender,subject:'Shipping request rejected',summary:'Your shipment request was declined.',buttonText:'Open Shipping Dashboard',page:'shipping',details:{Tracking:s.tracking||id,Status:'Declined'}});save();shipping()}
function reviewUser(email,type){if(!requireLogin())return;if(!email)return alert('No user assigned yet to review.');let rating=prompt('Rating 1-5:','5');if(rating===null)return;let text=prompt('Write a short review:','Good service');data.reviews.unshift({type,target:email,from:currentUser.email,rating:+rating||5,text:text||'',time:new Date().toLocaleString()});addNote(email,'You received a new rating/review.');save();}

function mapDbRental(row){
  const owner=row.owner||{};
  return {
    id: row.id || ('R'+Date.now().toString().slice(-5)),
    dbId: row.id || '',
    title: row.title || row.property || 'Rental Property',
    propertyType: row.property_type || row.type || 'Home',
    city: row.city || '',
    price: Number(row.monthly_rent || row.price || 0),
    deposit: Number(row.security_deposit || row.deposit || 0),
    bed: Number(row.bedrooms || row.bed || 0),
    bath: Number(row.bathrooms || row.bath || 0),
    moveDate: row.move_in_date || row.move_date || '',
    leaseTerm: row.lease_term || '',
    pets: row.pets_allowed || 'Ask Owner',
    parking: row.parking || 'Ask Owner',
    furnished: (row.furnished===true?'Yes':(row.furnished===false?'No':(row.furnished||'No'))),
    utilities: row.utilities_included || row.utilities || 'Ask owner',
    photos: Array.isArray(row.photos)?row.photos:(row.photos?[row.photos]:[]),
    owner: owner.name || row.owner_name || 'Owner',
    ownerPhone: owner.phone || row.owner_phone || '',
    ownerEmail: owner.email || row.owner_email || '',
    ownerId: row.owner_id || '',
    status: row.status || 'Pending',
    ownerPaid: row.owner_paid===undefined ? ['Pending','Approved','Available'].includes(row.status||'') : !!row.owner_paid,
    ownerFee: Number(row.owner_fee || settings().ownerListingFee),
    appFee: Number(row.app_fee || settings().seekerViewingFee),
    ownerRating: avgOwnerRating(owner.email || row.owner_email || ''),
    source:'supabase'
  };
}
async function loadSupabaseRentals(){
  if(!authReady())return;
  let {data:rows,error}=await hcSupabase.from('properties').select('*, owner:owner_id(name,email,phone,verified)').order('created_at',{ascending:false});
  if(error){
    console.warn('Rental relationship load error, retrying basic select', error);
    let retry=await hcSupabase.from('properties').select('*').order('created_at',{ascending:false});
    rows=retry.data||[]; error=retry.error;
  }
  if(error){console.warn('Rental load error', error);return;}
  let dbRentals=(rows||[]).map(mapDbRental);
  let localOnly=(data.rentals||[]).filter(x=>x.source!=='supabase'&&!x.dbId);
  data.rentals=[...dbRentals,...localOnly];
}

function mapDbRentalRequest(row){
  const prop=row.property||row.properties||{};
  const seeker=row.seeker||{};
  const owner=prop.owner||{};
  let localRental=data.rentals.find(r=>String(r.dbId||r.id)===String(row.property_id||prop.id));
  return {
    id: row.id || ('RQ'+Date.now().toString().slice(-5)),
    dbId: row.id || '',
    rentalId: row.property_id || prop.id || (localRental&&localRental.id) || '',
    propertyTitle: (localRental&&localRental.title) || prop.title || prop.property || 'Rental Property',
    seekerName: seeker.name || row.seeker_name || 'Rent Seeker',
    seekerPhone: seeker.phone || row.seeker_phone || '',
    seekerEmail: seeker.email || row.seeker_email || '',
    seekerId: row.seeker_id || '',
    ownerName: (localRental&&localRental.owner) || owner.name || prop.owner_name || 'Owner',
    ownerPhone: (localRental&&localRental.ownerPhone) || owner.phone || prop.owner_phone || '',
    ownerEmail: (localRental&&localRental.ownerEmail) || owner.email || prop.owner_email || '',
    ownerId: prop.owner_id || (localRental&&localRental.ownerId) || '',
    status: row.status || 'Pending',
    paymentStatus: row.paid===false?'Unpaid':'Paid',
    paid: row.paid!==false,
    amountPaid: Number(row.amount_paid || settings().seekerViewingFee || 10),
    time: row.created_at || new Date().toLocaleString(),
    source:'supabase'
  };
}
async function loadSupabaseRentalRequests(){
  if(!authReady())return;
  let rows=[], error=null;
  let res=await hcSupabase.from('rental_requests').select('*, property:property_id(*, owner:owner_id(name,email,phone,verified)), seeker:seeker_id(name,email,phone,verified)').order('created_at',{ascending:false});
  rows=res.data||[]; error=res.error;
  if(error){
    console.warn('Rental request relationship load error, retrying basic select', error);
    let retry=await hcSupabase.from('rental_requests').select('*').order('created_at',{ascending:false});
    rows=retry.data||[]; error=retry.error;
  }
  if(error){console.warn('Rental request load error', error);return;}
  let dbRequests=(rows||[]).map(mapDbRentalRequest);
  // Important: when Supabase is connected, use Supabase as the source of truth.
  // Old local-only rental requests can make iPhone Safari show "Pending" even when
  // nothing was saved for Admin/Owner to review. Do not merge stale local requests.
  data.rentalRequests=dbRequests;
}


function friendlyRentalId(r,i){
  let raw=String((r&&r.id)||'');
  if(raw.startsWith('R')&&raw.length<=8)return raw;
  let n=(typeof i==='number'?i+1:Math.abs(raw.split('').reduce((a,c)=>a+c.charCodeAt(0),0))%9999);
  return 'HC-R'+String(n).padStart(4,'0');
}
function rentalStatusBadge(status){
  let st=String(status||'Pending');
  let cls=(st==='Approved'||st==='Available')?'good':(st==='Rented'?'warn':(st==='Closed'?'bad':'warn'));
  let icon=st==='Rented'?'🔵 ':st==='Approved'||st==='Available'?'🟢 ':st==='Closed'?'🔴 ':'🟠 ';
  return `<span class="pill ${cls}">${icon}${st}</span>`;
}
function rentalStatsFor(list,reqs){
  list=list||[]; reqs=reqs||[];
  let active=list.filter(r=>['Approved','Available'].includes(r.status)&&r.ownerPaid).length;
  let rented=list.filter(r=>r.status==='Rented').length;
  let ownerFees=list.filter(r=>r.ownerPaid).reduce((a,r)=>a+Number(r.ownerFee||settings().ownerListingFee||0),0);
  let seekerFees=reqs.filter(q=>(q.paymentStatus||'Paid')==='Paid'||q.paid).reduce((a,q)=>a+Number(q.amountPaid||settings().seekerViewingFee||0),0);
  return {total:list.length,active,rented,requests:reqs.length,ownerFees,seekerFees,totalRevenue:ownerFees+seekerFees};
}
function rentalRequestPaymentDisplay(q,role){
 if(role==='admin')return (q.paymentStatus||'Paid')+(q.amountPaid?(' '+money(q.amountPaid)):'');
 if(role==='rent_seeker'||role==='customer')return 'Request sent';
 if(role==='owner')return q.status==='Approved'?'Admin approved':'Pending admin/owner action';
 return 'Hidden';
}
function paymentPrivacyNotice(){return '<div class="notice"><b>Payment privacy:</b> Travelers, senders, owners, and seekers only see their own payment information. Admin can see all party payments.</div>';}
function rentalStatsCards(title,st){
  return `<h3>${title}</h3><div class="grid"><div class="card"><p>Total Properties</p><div class="stat">${st.total}</div></div><div class="card"><p>Available</p><div class="stat">${st.active}</div></div><div class="card"><p>Rented</p><div class="stat">${st.rented}</div></div><div class="card"><p>Viewing Requests</p><div class="stat">${st.requests}</div></div><div class="card"><p>Owner Fees</p><div class="stat">${money(st.ownerFees)}</div></div><div class="card"><p>Seeker Fees</p><div class="stat">${money(st.seekerFees)}</div></div></div>`;
}
function rentalStatsCardsCustom(title,items){
  return `<h3>${title}</h3><div class="grid">${items.map(x=>`<div class="card"><p>${x[0]}</p><div class="stat">${x[1]}</div></div>`).join('')}</div>`;
}
function rentalRequestActionButtons(q,role){
  const st=String(q.status||'Pending');
  const id=q.id;
  if(role==='admin'){
    if(st==='Pending Admin Review'||st==='Pending')return `<button class="btn primary" onclick="adminApproveRentalReq('${id}')">Approve for Owner</button> <button class="btn bad" onclick="adminDeclineRentalReq('${id}')">Decline</button>`;
    if(st==='Owner Accepted - Waiting Final Admin Approval')return `<button class="btn primary" onclick="adminFinalApproveRentalReq('${id}')">Final Approve</button> <button class="btn bad" onclick="adminDeclineRentalReq('${id}')">Decline</button>`;
    return '-';
  }
  if(role==='owner'){
    if(st==='Waiting Owner Review')return `<button class="btn primary" onclick="ownerAcceptRentalReq('${id}')">Accept</button> <button class="btn bad" onclick="ownerDeclineRentalReq('${id}')">Decline</button>`;
    return '-';
  }
  return '-';
}
function rentalRequestsTable(reqs,role){
  let wrapId=role==='owner'?' id="ownerRentalRequests"':'';
  return `<div${wrapId}><h3>Rental Requests / Contacts</h3><table><tr><th>Property</th><th>Rent Seeker</th><th>Phone</th><th>Owner</th><th>Owner Phone</th><th>Status</th><th>Beta Status</th><th>Action</th></tr>${reqs.map(q=>`<tr><td>${q.propertyTitle}</td><td>${q.seekerName}</td><td>${q.seekerPhone}</td><td>${q.ownerName}</td><td>${q.status==='Approved'||q.status==='Owner Accepted - Waiting Final Admin Approval'||role==='admin'||role==='owner'?q.ownerPhone:'Shown after approval'}</td><td>${q.status}</td><td>${rentalRequestPaymentDisplay(q,role)}</td><td>${rentalRequestActionButtons(q,role)}</td></tr>`).join('')||'<tr><td colspan="8">No rental requests yet.</td></tr>'}</table></div>`;
}
function scrollToRentalRequests(){let el=document.getElementById('ownerRentalRequests');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});}

async function rentals(){
 let role=currentUser?currentUser.role:'guest';
 let ownerReqs=data.rentalRequests.filter(q=>currentUser&&(q.ownerEmail===currentUser.email||role==='admin'));
 let seekerReqs=data.rentalRequests.filter(q=>currentUser&&q.seekerEmail===currentUser.email);
 let visibleRentals=data.rentals.filter(r=>role==='admin'||(role==='owner'&&currentUser&&r.ownerEmail===currentUser.email)||((role!=='owner')&&['Approved','Available'].includes(r.status)&&r.ownerPaid));
 let myRentals=data.rentals.filter(r=>currentUser&&r.ownerEmail===currentUser.email);
 let canPost=currentUser&&(role==='owner'||role==='admin');
 let ownerStats=rentalStatsFor(myRentals,ownerReqs);
 let availableForSeeker=data.rentals.filter(r=>['Approved','Available'].includes(r.status)&&r.ownerPaid);
 let seekerStats=rentalStatsFor(availableForSeeker,seekerReqs);
 let adminStats=rentalStatsFor(data.rentals,data.rentalRequests);
 let addPropertyCard=`<div class="card"><h3>Add Property</h3><label>Property Photos</label><input id="rentPhotos" type="file" multiple accept="image/*"><label>Property Type</label><select id="rentType">${options(PROPERTY_TYPES)}</select><label>Title</label><input id="rentTitle" placeholder="3 Bedroom House"><label>City</label><input id="rentCity" placeholder="Clarkston, GA"><div class="row"><div><label>Monthly Rent</label><input id="rentPrice" type="number" value="1500"></div><div><label>Security Deposit</label><input id="rentDeposit" type="number" value="1500"></div></div><div class="row"><div><label>Bedrooms</label><input id="rentBed" type="number" value="2"></div><div><label>Bathrooms</label><input id="rentBath" type="number" value="1"></div></div><label>Available Move-in Date</label><input id="rentMoveDate" type="date" min="${addDaysIso(0)}"><label>Lease Term</label><select id="rentLease"><option>Month-to-Month</option><option selected>12 Months</option><option>6 Months</option><option>Negotiable</option></select><div class="row"><div><label>Pets Allowed</label><select id="rentPets"><option>No</option><option>Yes</option><option>Ask Owner</option></select></div><div><label>Parking</label><select id="rentParking"><option>Yes</option><option>No</option><option>Street Parking</option></select></div></div><div class="row"><div><label>Furnished</label><select id="rentFurnished"><option>No</option><option>Yes</option><option>Partly</option></select></div><div><label>Utilities Included</label><input id="rentUtilities" placeholder="Water, trash, internet..."></div></div><button class="btn primary" onclick="addRental()">Publish Property</button><p class="small">Your property is saved and sent to Admin for approval.</p></div>`;
 let searchFilters=`<div class="card"><h3>Search Filters</h3><label>Property Type</label><select id="filterType"><option>All</option>${options(PROPERTY_TYPES)}</select><label>City</label><input id="filterCity" placeholder="Search city"><label>Max Price</label><input id="filterPrice" type="number" placeholder="2000"><button class="btn" onclick="filterRentals()">Filter</button><button class="btn ghost" onclick="rentals()">Show All</button></div>`;
 let ownerPanel=role==='owner'?`<h3>Available Rent Seekers</h3><table><tr><th>Property</th><th>Rent Seeker</th><th>Phone</th><th>Status</th><th>Action</th></tr>${ownerReqs.map(q=>`<tr><td>${q.propertyTitle}</td><td>${q.seekerName}</td><td>${q.seekerPhone}</td><td>${q.status}</td><td>${rentalRequestActionButtons(q,'owner')}</td></tr>`).join('')||'<tr><td colspan="5">No rent seeker requests yet.</td></tr>'}</table>`:'';
 let ownerSummary=rentalStatsCardsCustom('🏠 My Rental Performance',[
   ['Total Properties',ownerStats.total],['Available',ownerStats.active],['Rented',ownerStats.rented],['Viewing Requests',ownerStats.requests],['Owner Fees',money(ownerStats.ownerFees)]
 ]);
 let seekerSummary=rentalStatsCardsCustom('🔍 My Rental Activity',[
   ['Available',availableForSeeker.length],['Seeker Fees',money(seekerStats.seekerFees)]
 ]);
 let adminSummary=rentalStatsCards('📊 Rental Statistics',adminStats);
 let ownerDashboard=`<h2>🏠 Rental Dashboard</h2><div class="grid"><div class="card"><h3>🏠 My Properties</h3><p class="muted">Add and manage rental listings.</p><button class="btn primary" onclick="document.getElementById('rentTitle')?.focus()">Add Property</button></div><div class="card"><h3>👀 Rental Requests</h3><p class="muted">See rent seeker requests and approve or decline them.</p><button class="btn primary" onclick="scrollToRentalRequests()">See Rental Requests</button></div><div class="card"><h3>⭐ Reviews</h3><p class="muted">Owner ratings and feedback.</p></div></div>`;
 let ownerRequestsHtml=rentalRequestsTable(ownerReqs,'owner');
 let seekerRequestsHtml=rentalRequestsTable(seekerReqs,'rent_seeker');
 let adminRequests=[...ownerReqs,...data.rentalRequests.filter(q=>!ownerReqs.includes(q))];
 if(role==='owner'){
   $('rentals').innerHTML=`${ownerDashboard}${addPropertyCard}${ownerPanel}<h3>My Properties</h3><div id="rentalList" class="grid">${rentalCards(myRentals,role)}</div>${ownerRequestsHtml}${ownerSummary}`;
 } else if(role==='rent_seeker'||role==='customer'||!currentUser){
   $('rentals').innerHTML=`<h3>Available Owners / Rentals</h3><div id="rentalList" class="grid">${rentalCards(visibleRentals,role)}</div>${searchFilters}${seekerRequestsHtml}${seekerSummary}`;
 } else if(role==='admin'){
   $('rentals').innerHTML=`<h2>🏠 Rental Connect</h2>${adminSummary}${canPost?`<div class="grid">${addPropertyCard}${searchFilters}</div>`:searchFilters}<h3>All Rental Listings</h3><div id="rentalList" class="grid">${rentalCards(visibleRentals,role)}</div>${rentalRequestsTable(adminRequests,'admin')}`;
 } else {
   $('rentals').innerHTML=`<h2>🏠 Rental Connect</h2><h3>Available Owners / Rentals</h3><div id="rentalList" class="grid">${rentalCards(visibleRentals,role)}</div>${searchFilters}`;
 }
}
function rentalCards(list,role){return list.map((r,i)=>{let displayId=friendlyRentalId(r,i);let isOwner=currentUser&&r.ownerEmail===currentUser.email;let existing=currentUser?data.rentalRequests.find(q=>q.rentalId===r.id&&q.seekerEmail===currentUser.email):null;let fav=currentUser&&data.favorites.some(f=>f.user===currentUser.email&&f.rentalId===r.id);let rating=avgOwnerRating(r.ownerEmail)||r.ownerRating||'New';let photos=(r.photos||[]).map(x=>`<span class="photoThumb">📷 ${x}</span>`).join('')||'<span class="small">No photos uploaded</span>';let seekerBtns=(role==='rent_seeker'||role==='customer'||!currentUser)?(existing?`<button class="btn ghost" disabled>✅ Request Sent</button><span class="pill warn">${existing.status}</span><button class="btn" onclick="toggleFavorite('${r.id}')">${fav?'★ Saved':'☆ Save'}</button><button class="btn ghost" onclick="messageOwner('${r.ownerEmail}')">Message Owner</button><button class="btn ghost" onclick="reviewUser('${r.ownerEmail}','owner')">Rate Owner</button>`:`<button class="btn primary" onclick="requestViewing('${r.id}')">Request Viewing</button><button class="btn" onclick="toggleFavorite('${r.id}')">${fav?'★ Saved':'☆ Save'}</button><button class="btn ghost" onclick="messageOwner('${r.ownerEmail}')">Message Owner</button>`):'';let ownerBtns=isOwner?`<button class="btn ghost" onclick="editRental('${r.id}')">Edit</button> <button class="btn bad" onclick="deleteRental('${r.id}')">Delete</button> ${r.ownerPaid?`<button class="btn ghost" disabled>✅ Published</button>`:`<button class="btn primary" onclick="payPublishRental('${r.id}')">Publish Listing</button>`}`:'';let adminBtns=role==='admin'?`<button class="btn primary" onclick="approveRental('${r.id}')">Approve</button> <button class="btn ghost" onclick="editRental('${r.id}')">Edit</button> <button class="btn bad" onclick="deleteRental('${r.id}')">Delete</button>`:'';return `<div class="card"><h3>${r.title}</h3><p class="small"><b>Property ID:</b> ${displayId}</p><div class="photoStrip">${photos}</div><p>${r.city}</p><p><b>${money(r.price)}/month</b> • Deposit ${money(r.deposit)} • ${r.propertyType||'Property'} • ${r.bed||''} bed • ${r.bath||''} bath</p><p><b>Move-in:</b> ${r.moveDate||'Ask owner'} • <b>Lease:</b> ${r.leaseTerm||'Ask owner'}</p><p><b>Pets:</b> ${r.pets} • <b>Parking:</b> ${r.parking} • <b>Furnished:</b> ${r.furnished}</p><p><b>Utilities:</b> ${r.utilities}</p><p><b>Owner Rating:</b> ⭐ ${rating}</p>${role==='admin'||isOwner?contactLine('Owner',r.owner,r.ownerPhone,r.ownerEmail):`<p>Owner: ${r.owner}</p>`}${rentalStatusBadge(r.status)}${role==='admin'?(r.ownerPaid?'<span class="pill good">Owner Fee Paid</span>':'<span class="pill warn">Owner Fee Pending</span>'):''}<div class="actions">${seekerBtns}${ownerBtns}${adminBtns}</div></div>`}).join('')||'<div class="card"><p>No rental listings to show yet.</p></div>'}
function filterRentals(){let role=currentUser?currentUser.role:'guest';let type=$('filterType').value,city=($('filterCity').value||'').toLowerCase(),max=+$('filterPrice').value||Infinity;let list=data.rentals.filter(r=>role==='admin'||(role==='owner'&&currentUser&&r.ownerEmail===currentUser.email)||((role!=='owner')&&['Approved','Available'].includes(r.status)&&r.ownerPaid));list=list.filter(r=>(type==='All'||(r.propertyType||'').toLowerCase()===type.toLowerCase())&&(!city||(r.city||'').toLowerCase().includes(city))&&(+r.price||0)<=max);$('rentalList').innerHTML=rentalCards(list,role)}
async function addRental(){
  if(!requireLogin())return;
  if(!['owner','admin'].includes(currentUser.role))return alert('Only property owners can add property listings.');
  let propertyType=$('rentType')?$('rentType').value:'Home',title=$('rentTitle').value||propertyType,city=$('rentCity').value||'Atlanta, GA',price=+$('rentPrice').value||0,deposit=+$('rentDeposit').value||0,bed=+$('rentBed').value||0,bath=+$('rentBath').value||0;
  if(!title||!city||!price)return alert('Please enter property title, city, and monthly rent.');
  let moveDate=$('rentMoveDate').value;
  if(moveDate && moveDate<addDaysIso(0))return alert('Please choose today or a future move-in date. Previous days are not allowed.');
  let fee=0;
  if(!confirm('Publish this property? Admin approval is required before seekers can see it.'))return;
  let localRental={id:'R'+Date.now().toString().slice(-5),title,propertyType,city,price,deposit,bed,bath,moveDate:moveDate,leaseTerm:$('rentLease').value,pets:$('rentPets').value,parking:$('rentParking').value,furnished:$('rentFurnished').value,utilities:$('rentUtilities').value||'Ask owner',photos:photoNamesFromInput('rentPhotos'),owner:currentUser.name,ownerPhone:currentUser.phone||'',ownerEmail:currentUser.email,ownerId:currentUser.id||'',status:(currentUser.role==='admin'?'Approved':'Pending'),appFee:0,ownerFee:fee,ownerPaid:true};
  if(authReady()){
    let payload={owner_id:currentUser.id||null,title:localRental.title,city:localRental.city,property_type:localRental.propertyType,bedrooms:localRental.bed,bathrooms:localRental.bath,monthly_rent:localRental.price,security_deposit:localRental.deposit,move_in_date:localRental.moveDate||null,lease_term:localRental.leaseTerm,pets_allowed:localRental.pets,parking:localRental.parking,furnished:(localRental.furnished==='Yes'),utilities_included:localRental.utilities,photos:localRental.photos,owner_paid:true,status:localRental.status};
    let res=await hcSupabase.from('properties').insert(payload).select('*').single();
    if(res.error){
      alert('Property could not be saved to Supabase: '+res.error.message+'\nPlease send this screenshot/message so we can fix the property columns.');
      return;
    }
    localRental.dbId=res.data.id; localRental.id=res.data.id; localRental.source='supabase';
  }
  data.rentals.unshift(localRental);
  addNote('admin.habeshaconnect@gmail.com','Rental listing from '+currentUser.name+' needs approval.');sendAdminEmailNotice('New Property Published','A property owner published a rental property for admin approval.',{Owner:currentUser.name,Email:currentUser.email,Property:title,Type:propertyType,City:city,Monthly_Rent:money(price)},'admin');
  addNote(currentUser.email,'Your property was submitted and is waiting for admin approval.');
  save();
  alert('Property submitted successfully. Admin approval is required before seekers can see it.');
  show('rentals');
}
async function payPublishRental(id){
  if(!requireLogin())return;
  let r=data.rentals.find(x=>x.id===id);if(!r)return;
  if(!(currentUser.role==='admin'||r.ownerEmail===currentUser.email))return alert('Only the owner can pay to publish this listing.');
  if(r.ownerPaid){alert('This listing is already published.');return;}
  r.ownerPaid=true;r.status=currentUser.role==='admin'?'Approved':'Pending';
  if(authReady()&&r.dbId){let {error}=await hcSupabase.from('properties').update({owner_paid:true,status:r.status}).eq('id',r.dbId);if(error)return alert('Payment recorded, but Supabase update failed: '+error.message);}
  addNote('admin.habeshaconnect@gmail.com','Rental listing from '+r.owner+' needs approval.');
  addNote(r.ownerEmail,'Your property is waiting for admin approval.');save();rentals();
}
async function requestViewing(id){
 if(!requireLogin())return;
 if(!authReady())return alert('Supabase is required to send rental viewing requests. Please refresh the page and log in again.');
 if(!currentUser.id)return alert('Your profile ID is missing. Please log out, log back in, and try again.');
 await loadSupabaseRentals();
 await loadSupabaseRentalRequests();
 let r=data.rentals.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
 if(!r)return alert('Rental listing not found. Please refresh and try again.');
 let propertyKey=r.dbId||r.id;
 if(!propertyKey)return alert('Property ID is missing. Please refresh and try again.');
 let existing=data.rentalRequests.find(q=>(String(q.rentalId)===String(r.id)||String(q.rentalId)===String(r.dbId)||String(q.rentalId)===String(propertyKey))&&(String(q.seekerId||'')===String(currentUser.id||'')||q.seekerEmail===currentUser.email));
 if(existing){alert('You already sent a viewing request for this property.');await rentals();return;}
 let fee=0;
 let payload={property_id:propertyKey,seeker_id:currentUser.id,paid:true,status:'Pending Admin Review'};
 let res=await hcSupabase.from('rental_requests').insert(payload).select('*').single();
 if(res.error){
   console.error('Rental request save failed',res.error,payload);
   if(String(res.error.message||'').toLowerCase().includes('duplicate'))return alert('You already submitted a viewing request for this property.');
   return alert('Viewing request could not be saved to Supabase: '+res.error.message+'\nNo payment was recorded. Please send this message so we can fix it.');
 }
 // Beta: no visible viewing charge. Keep the request record only.
 let localReq={id:res.data.id,dbId:res.data.id,rentalId:propertyKey,propertyTitle:r.title,seekerName:currentUser.name,seekerPhone:currentUser.phone||'',seekerEmail:currentUser.email,seekerId:currentUser.id||'',ownerName:r.owner,ownerPhone:r.ownerPhone||'',ownerEmail:r.ownerEmail||'',ownerId:r.ownerId||'',status:'Pending Admin Review',paymentStatus:'Requested',paid:true,amountPaid:fee,time:new Date().toLocaleString(),source:'supabase'};
 data.rentalRequests.unshift(localReq);
 addNote('admin.habeshaconnect@gmail.com','New rental viewing request for '+r.title+' from '+currentUser.name+'. Admin approval is needed before owner review.');sendAdminEmailNotice('Seeker requested a viewing','A rent seeker requested a property viewing.',{Seeker:currentUser.name,Email:currentUser.email,Property:r.title,Owner:r.owner,OwnerEmail:r.ownerEmail},'admin');
 addNote(currentUser.email,'Your viewing request was sent to admin first. After admin approval, the owner can accept or decline.');
 persistOnly();
 alert('Viewing request submitted. Waiting for admin approval first.');
 await rentals();
}
function toggleFavorite(id){if(!requireLogin())return;let i=data.favorites.findIndex(f=>f.user===currentUser.email&&f.rentalId===id);if(i>=0){data.favorites.splice(i,1);addNote(currentUser.email,'Property removed from favorites.')}else{data.favorites.push({user:currentUser.email,rentalId:id,time:new Date().toLocaleString()});addNote(currentUser.email,'Property saved to favorites.')}save();}
function messageOwner(email){if(!requireLogin())return;show('messages');setTimeout(()=>{if($('msgTo'))$('msgTo').value=email||''},50)}
async function updateRentalReqStatus(q,newStatus){
  const old=q.status;
  q.status=newStatus;
  persistOnly();
  let res={error:null};
  if(authReady()&&q.dbId){res=await hcSupabase.from('rental_requests').update({status:newStatus}).eq('id',q.dbId);}
  if(res.error){q.status=old;persistOnly();alert('Could not update rental request: '+res.error.message);return false;}
  return true;
}
async function adminApproveRentalReq(id){
  if(!requireAdmin())return;
  let q=data.rentalRequests.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!q)return alert('Rental request not found.');
  if(!['Pending','Pending Admin Review'].includes(String(q.status||'')))return alert('This request is not waiting for admin approval.');
  if(!(await updateRentalReqStatus(q,'Waiting Owner Review')))return;
  addNote(q.ownerEmail,'Admin approved a rental viewing request. Please review and accept or decline.');
  if(q.ownerEmail){sendEmailNotice({to:q.ownerEmail,name:q.ownerName||'Property Owner',subject:'Rental request ready for owner review',summary:'Admin approved a rent seeker request. Please open Rentals and accept or decline it.',buttonText:'Open Rentals',page:'rentals',details:{Property:q.propertyTitle,Seeker:q.seekerName,Status:'Waiting Owner Review'}});}
  addNote(q.seekerEmail,'Admin approved your viewing request. Waiting for owner accept/decline.');
  await admin();
}
async function adminFinalApproveRentalReq(id){
  if(!requireAdmin())return;
  let q=data.rentalRequests.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!q)return alert('Rental request not found.');
  if(String(q.status||'')!=='Owner Accepted - Waiting Final Admin Approval')return alert('Owner has not accepted this request yet.');
  if(!(await updateRentalReqStatus(q,'Approved')))return;
  addNote(q.seekerEmail,'Your rental viewing request is fully approved. Owner contact is now available.');
  addNote(q.ownerEmail,'Admin gave final approval for the rental viewing request.');
  sendEmailNotice({to:q.seekerEmail,name:q.seekerName,subject:'Rental viewing fully approved',summary:'Your rental viewing request was approved by owner and admin. Owner contact is now available.',buttonText:'Open Rental Dashboard',page:'rentals',details:{Property:q.propertyTitle,Status:'Approved'}});
  await admin();
}
async function adminDeclineRentalReq(id){
  if(!requireAdmin())return;
  let q=data.rentalRequests.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!q)return alert('Rental request not found.');
  if(!(await updateRentalReqStatus(q,'Declined')))return;
  addNote(q.seekerEmail,'Your rental request was declined by admin.');
  addNote(q.ownerEmail,'A rental request was declined by admin.');
  await admin();
}
async function ownerAcceptRentalReq(id){
  if(!requireLogin())return;
  let q=data.rentalRequests.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!q)return alert('Rental request not found.');
  if(q.ownerEmail!==currentUser.email&&String(q.ownerId||'')!==String(currentUser.id||''))return alert('Only the property owner can accept this request.');
  if(String(q.status||'')!=='Waiting Owner Review')return alert('Admin must approve first before owner can accept.');
  if(!(await updateRentalReqStatus(q,'Owner Accepted - Waiting Final Admin Approval')))return;
  addNote('admin.habeshaconnect@gmail.com','Owner accepted rental viewing request for '+q.propertyTitle+'. Final admin approval is needed.');
  sendAdminEmailNotice('Rental request needs final approval','Owner accepted a rental viewing request. Final admin approval is needed.',{Property:q.propertyTitle,Owner:q.ownerName,Seeker:q.seekerName},'admin');
  addNote(q.seekerEmail,'Owner accepted your viewing request. Waiting for final admin approval.');
  await rentals();
}
async function ownerDeclineRentalReq(id){
  if(!requireLogin())return;
  let q=data.rentalRequests.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!q)return alert('Rental request not found.');
  if(q.ownerEmail!==currentUser.email&&String(q.ownerId||'')!==String(currentUser.id||''))return alert('Only the property owner can decline this request.');
  if(String(q.status||'')!=='Waiting Owner Review')return alert('This request is not waiting for owner review.');
  if(!(await updateRentalReqStatus(q,'Owner Declined')))return;
  addNote(q.seekerEmail,'The property owner declined your rental request.');
  sendEmailNotice({to:q.seekerEmail,name:q.seekerName,subject:'Rental request declined by owner',summary:'The property owner declined your viewing request.',buttonText:'Open Rental Dashboard',page:'rentals',details:{Property:q.propertyTitle,Status:'Owner Declined'}});
  await rentals();
}
async function approveRentalReq(id){
  if(currentUser&&currentUser.role==='admin')return adminApproveRentalReq(id);
  if(currentUser&&currentUser.role==='owner')return ownerAcceptRentalReq(id);
}
async function declineRentalReq(id){
  if(currentUser&&currentUser.role==='admin')return adminDeclineRentalReq(id);
  if(currentUser&&currentUser.role==='owner')return ownerDeclineRentalReq(id);
}

function marketplace(){
 if(!data.marketRequests)data.marketRequests=[];if(!data.savedMarketItems)data.savedMarketItems=[];if(!data.events)data.events=[];
 let role=currentUser?currentUser.role:'guest';
 let isAdmin=role==='admin';
 let myEmail=currentUser?currentUser.email:'';
 let approved=(data.market||[]).filter(m=>m.status==='Approved'||m.status==='Available');
 let visible=(data.market||[]).filter(m=>isAdmin||m.sellerEmail===myEmail||m.status==='Approved'||m.status==='Available');
 let myListings=(data.market||[]).filter(m=>currentUser&&m.sellerEmail===myEmail);
 let myRequests=(data.marketRequests||[]).filter(r=>currentUser&&(r.buyerEmail===myEmail||r.sellerEmail===myEmail||isAdmin));
 let adminBox=isAdmin?`<h3 style="margin-top:22px">Admin Marketplace Approvals</h3><div class="grid">${marketAdminCards()}</div>`:'';
 $('marketplace').innerHTML=`<h2>🛒 Marketplace</h2>
 <div class="notice"><b>Marketplace flow:</b> seller posts item → item appears in Admin Dashboard for approval → admin approves → approved item appears for all users → buyer requests → admin approves request → seller accepts → admin approves contact connection → seller marks sold.</div>
 <div class="card"><h3>Marketplace Dashboard</h3><p class="muted">Choose what you want to do in Marketplace.</p><div class="actions"><button class="btn primary" onclick="marketJump('marketPostPanel')">➕ Post Item</button><button class="btn ghost" onclick="openMarketplaceAvailableItems()">🔍 Browse Marketplace</button></div></div>
 <div class="grid two">
  <div class="card" id="marketPostPanel"><h3>➕ Post Item</h3>
   <label>Item Title</label><input id="mTitle" placeholder="Example: iPhone, sofa, dining table">
   <div class="grid two"><div><label>Category</label><select id="mCategory"><option>Vehicles</option><option>Electronics</option><option>Furniture</option><option>Clothing</option><option>Home & Garden</option><option>Baby Items</option><option>Books</option><option>Tools</option><option>Business Equipment</option><option>Other</option></select></div><div><label>Condition</label><select id="mCondition"><option>New</option><option>Like New</option><option>Good</option><option>Fair</option><option>For Parts</option></select></div></div>
   <div class="grid two"><div><label>Price</label><input id="mPrice" type="number" placeholder="Price"></div><div><label>City</label><input id="mCity" placeholder="City"></div></div>
   <label>Description</label><textarea id="mDesc" rows="3" placeholder="Describe the item, pickup area, and important details"></textarea>
   <label>Add Pictures / Photos (up to 10)</label><input id="mPhotoFiles" type="file" accept="image/*" multiple onchange="previewMarketPhotos()">
   <div id="mPhotoPreview" class="photoPreview"></div>
   <label>Photo Links (optional)</label><input id="mPhotos" placeholder="Optional: paste photo links separated by commas">
   <p class="small">You can upload pictures from your device or paste photo links. Admin must approve the item before buyers see it.</p>
   <button class="btn primary" onclick="addMarket()">Submit Item for Admin Approval</button>
  </div>
  <div class="card" id="marketBrowsePanel"><h3>🔍 Browse Marketplace</h3><p class="muted">Only admin-approved items show to buyers.</p>
   <div class="grid two"><input id="mSearch" placeholder="Search keyword" oninput="filterMarket()"><input id="mFilterCity" placeholder="City" oninput="filterMarket()"></div>
   <div class="grid two"><select id="mFilterCategory" onchange="filterMarket()"><option>All Categories</option><option>Vehicles</option><option>Electronics</option><option>Furniture</option><option>Clothing</option><option>Home & Garden</option><option>Baby Items</option><option>Books</option><option>Tools</option><option>Business Equipment</option><option>Other</option></select><select id="mFilterCondition" onchange="filterMarket()"><option>All Conditions</option><option>New</option><option>Like New</option><option>Good</option><option>Fair</option><option>For Parts</option></select></div>
   <p><b>${approved.length}</b> approved item(s) available.</p>
  </div>
 </div>
 <h3 id="marketAvailableTitle" style="margin-top:22px">Available Marketplace Items</h3><div id="marketList" class="grid">${approved.map(marketCard).join('')||'<div class="card"><p>No approved marketplace items available yet.</p></div>'}</div>
 <h3 style="margin-top:22px">My Marketplace Activity</h3><div class="grid two"><div class="card"><h3>📋 My Listings</h3>${myListings.map(m=>`<div class="item"><b>${m.title}</b><p>${money(m.price)} • ${m.city}</p><span class="pill ${m.status==='Approved'||m.status==='Available'?'good':m.status==='Declined'?'bad':'warn'}">${m.status}</span></div>`).join('')||'<p class="muted">No listings yet.</p>'}</div><div class="card"><h3>📦 Requests</h3>${myRequests.map(marketRequestCard).join('')||'<p class="muted">No requests yet.</p>'}</div></div>${adminBox}`;
}
function marketJump(id){let el=document.getElementById(id);if(el){el.scrollIntoView({behavior:'smooth',block:'start'});el.style.outline='3px solid #fde68a';setTimeout(()=>{el.style.outline='';},1200);}}
function openMarketplaceAvailableItems(){let panel=document.getElementById('marketBrowsePanel');let list=document.getElementById('marketAvailableTitle')||document.getElementById('marketList');if(panel){panel.scrollIntoView({behavior:'smooth',block:'start'});}setTimeout(()=>{if(list){list.scrollIntoView({behavior:'smooth',block:'start'});let box=document.getElementById('marketList');if(box){box.style.outline='3px solid #14b8a6';box.style.borderRadius='12px';setTimeout(()=>{box.style.outline='';},1400);}}},250);filterMarket();}
function marketPhotosHtml(m){let photos=Array.isArray(m.photos)?m.photos:[];if(!photos.length)return '';return `<div class="photoStrip">${photos.slice(0,10).map((ph,i)=>{let src=String(ph||'');if(src.startsWith('data:image')||src.startsWith('http://')||src.startsWith('https://'))return `<img class="marketPhoto" src="${src}" alt="${m.title||'Marketplace item'} photo ${i+1}">`;return `<span class="photoThumb">📷 ${src}</span>`;}).join('')}</div>`}
function marketCard(m){let myEmail=currentUser?currentUser.email:'';let isOwner=currentUser&&m.sellerEmail===myEmail;let isAdmin=currentUser&&currentUser.role==='admin';let canBuy=currentUser&&!isOwner&&!isAdmin&&(m.status==='Approved'||m.status==='Available');let statusClass=(m.status==='Approved'||m.status==='Available')?'good':m.status==='Declined'?'bad':'warn';return `<div class="card"><h3>${m.title}</h3>${marketPhotosHtml(m)}<p class="muted">${m.category||'Other'} • ${m.condition||'Good'} • ${m.city||''}</p><p><b>${money(m.price)}</b></p><p>${m.description||''}</p><p class="muted">Seller: ${m.seller||'Seller'}</p><span class="pill ${statusClass}">${m.status}</span><div class="actions">${canBuy?`<button class="btn primary" onclick="marketRequestBuy('${m.id}')">Request to Buy</button><button class="btn ghost" onclick="marketSaveItem('${m.id}')">Save Item</button>`:''}${isOwner&&['Approved','Available'].includes(m.status)?`<button class="btn primary" onclick="marketMarkSold('${m.id}')">Mark Sold</button>`:''}${isAdmin&&m.status==='Pending Admin Approval'?`<button class="btn primary" onclick="marketAdminApproveListing('${m.id}')">Approve Listing</button><button class="btn danger" onclick="marketAdminDeclineListing('${m.id}')">Decline</button>`:''}${isAdmin&&m.status==='Sold Waiting Admin Verification'?`<button class="btn primary" onclick="marketAdminVerifySale('${m.id}')">Verify Sold</button>`:''}</div></div>`}
function marketRequestCard(r){let isSeller=currentUser&&r.sellerEmail===currentUser.email;let isBuyer=currentUser&&r.buyerEmail===currentUser.email;let isAdmin=currentUser&&currentUser.role==='admin';let cls=r.status.includes('Approved')?'good':r.status.includes('Declined')?'bad':'warn';return `<div class="item"><b>${r.itemTitle}</b><p>${r.buyerName} wants to buy from ${r.sellerName}</p><span class="pill ${cls}">${r.status}</span><div class="actions">${isSeller&&r.status==='Admin Approved - Waiting Seller'?`<button class="btn primary" onclick="marketSellerAcceptReq('${r.id}')">Accept</button><button class="btn danger" onclick="marketSellerDeclineReq('${r.id}')">Decline</button>`:''}${isAdmin&&r.status==='Buyer Request Pending Admin'?`<button class="btn primary" onclick="marketAdminApproveBuyerReq('${r.id}')">Approve Request</button><button class="btn danger" onclick="marketAdminDeclineBuyerReq('${r.id}')">Decline</button>`:''}${isAdmin&&r.status==='Seller Accepted - Waiting Admin'?`<button class="btn primary" onclick="marketAdminApproveConnection('${r.id}')">Approve Connection</button>`:''}${isBuyer&&r.status==='Connection Approved'?`<button class="btn ghost" onclick="alert('Seller: ${r.sellerName}\nPhone: ${r.sellerPhone||'Not provided'}\nEmail: ${r.sellerEmail}')">Seller Contact</button>`:''}${isSeller&&r.status==='Connection Approved'?`<button class="btn ghost" onclick="alert('Buyer: ${r.buyerName}\nPhone: ${r.buyerPhone||'Not provided'}\nEmail: ${r.buyerEmail}')">Buyer Contact</button>`:''}</div></div>`}
function marketAdminCards(){let pendListings=(data.market||[]).filter(m=>m.status==='Pending Admin Approval');let pendReqs=(data.marketRequests||[]).filter(r=>r.status==='Buyer Request Pending Admin'||r.status==='Seller Accepted - Waiting Admin');let sold=(data.market||[]).filter(m=>m.status==='Sold Waiting Admin Verification');return `<div class="card"><h3>⏳ Pending Listings</h3>${pendListings.map(marketCard).join('')||'<p class="muted">No pending listings.</p>'}</div><div class="card"><h3>⏳ Pending Buyer Requests</h3>${pendReqs.map(marketRequestCard).join('')||'<p class="muted">No pending requests.</p>'}</div><div class="card"><h3>✅ Sold Verification</h3>${sold.map(marketCard).join('')||'<p class="muted">No sold items waiting.</p>'}</div>`}
function marketplaceAdminManagementHtml(){
 let pendListings=(data.market||[]).filter(m=>m.status==='Pending Admin Approval');
 let activeListings=(data.market||[]).filter(m=>m.status==='Approved'||m.status==='Available');
 let pendBuyer=(data.marketRequests||[]).filter(r=>r.status==='Buyer Request Pending Admin');
 let pendConnections=(data.marketRequests||[]).filter(r=>r.status==='Seller Accepted - Waiting Admin');
 let sold=(data.market||[]).filter(m=>m.status==='Sold Waiting Admin Verification');
 return `<h3>Marketplace Management</h3>
 <div class="notice"><b>Marketplace approval flow:</b> seller post shows here first. After admin approval, the item becomes visible to all users in Marketplace.</div>
 <div class="grid"><div class="card"><p>Pending Listings</p><div class="stat">${pendListings.length}</div></div><div class="card"><p>Approved Public Items</p><div class="stat">${activeListings.length}</div></div><div class="card"><p>Buyer Requests</p><div class="stat">${pendBuyer.length}</div></div><div class="card"><p>Connection Approvals</p><div class="stat">${pendConnections.length}</div></div></div>
 <div class="grid three">
  <div class="card"><h3>⏳ Pending Seller Listings</h3>${pendListings.map(marketCard).join('')||'<p class="muted">No seller listings waiting for approval.</p>'}</div>
  <div class="card"><h3>⏳ Pending Buyer Requests</h3>${pendBuyer.map(marketRequestCard).join('')||'<p class="muted">No buyer requests waiting for approval.</p>'}</div>
  <div class="card"><h3>🤝 Pending Connection Approval</h3>${pendConnections.map(marketRequestCard).join('')||'<p class="muted">No seller-accepted requests waiting for approval.</p>'}</div>
 </div>
 <div class="card"><h3>✅ Sold Items Waiting Verification</h3>${sold.map(marketCard).join('')||'<p class="muted">No sold items waiting for verification.</p>'}</div>`;
}
function readMarketPhotoFile(file){return new Promise((resolve,reject)=>{let reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file);});}
async function getMarketUploadedPhotos(){let input=$('mPhotoFiles');let files=input&&input.files?Array.from(input.files).slice(0,10):[];let photos=[];for(let f of files){if(f&&f.type&&f.type.startsWith('image/'))photos.push(await readMarketPhotoFile(f));}return photos;}
async function previewMarketPhotos(){let box=$('mPhotoPreview');if(!box)return;let input=$('mPhotoFiles');let files=input&&input.files?Array.from(input.files).slice(0,10):[];box.innerHTML=files.map((f,i)=>`<span class="photoThumb">📷 ${f.name}</span>`).join('')+(input&&input.files&&input.files.length>10?'<p class="small">Only the first 10 photos will be saved.</p>':'');}
async function addMarket(){if(!requireLogin())return;let title=($('mTitle').value||'').trim(),price=+$('mPrice').value||0,city=($('mCity').value||'').trim();if(!title||!price||!city)return alert('Please enter item title, price, and city.');let linkPhotos=($('mPhotos').value||'').split(',').map(x=>x.trim()).filter(Boolean);let uploadedPhotos=await getMarketUploadedPhotos();let photos=[...uploadedPhotos,...linkPhotos].slice(0,10);let item={id:'M'+Date.now().toString().slice(-5),title,category:$('mCategory').value,condition:$('mCondition').value,price,city,description:$('mDesc').value||'',photos,seller:currentUser.name,sellerEmail:currentUser.email,sellerPhone:currentUser.phone||'',status:currentUser.role==='admin'?'Approved':'Pending Admin Approval',createdAt:new Date().toLocaleString()};data.market.unshift(item);addNote('admin.habeshaconnect@gmail.com','Marketplace listing waiting for approval: '+title+' by '+currentUser.name);if(typeof sendAdminEmailNotice==='function')sendAdminEmailNotice('Marketplace listing waiting for approval','A seller posted a marketplace item.',{Seller:currentUser.name,Email:currentUser.email,Item:title,Price:money(price),City:city,Photos:String(photos.length),Status:item.status},'marketplace');persistOnly();marketplace();alert('Item submitted with '+photos.length+' photo(s). Admin must approve before buyers can see it.');}
function filterMarket(){let q=($('mSearch')?.value||'').toLowerCase(),city=($('mFilterCity')?.value||'').toLowerCase(),cat=$('mFilterCategory')?.value||'All Categories',cond=$('mFilterCondition')?.value||'All Conditions';let list=(data.market||[]).filter(m=>m.status==='Approved'||m.status==='Available');list=list.filter(m=>(!q||String(m.title+' '+m.description).toLowerCase().includes(q))&&(!city||String(m.city||'').toLowerCase().includes(city))&&(cat==='All Categories'||m.category===cat)&&(cond==='All Conditions'||m.condition===cond));$('marketList').innerHTML=list.map(marketCard).join('')||'<div class="card"><p>No matching available items.</p></div>'; }
function marketRequestBuy(id){if(!requireLogin())return;let m=(data.market||[]).find(x=>x.id===id);if(!m)return;let exists=(data.marketRequests||[]).find(r=>r.itemId===id&&r.buyerEmail===currentUser.email&&!['Cancelled','Admin Declined','Seller Declined'].includes(r.status));if(exists)return alert('You already requested this item.');let r={id:'MR'+Date.now().toString().slice(-5),itemId:m.id,itemTitle:m.title,buyerName:currentUser.name,buyerEmail:currentUser.email,buyerPhone:currentUser.phone||'',sellerName:m.seller,sellerEmail:m.sellerEmail,sellerPhone:m.sellerPhone||'',status:'Buyer Request Pending Admin',createdAt:new Date().toLocaleString()};data.marketRequests.unshift(r);addNote('admin.habeshaconnect@gmail.com','Marketplace buyer request waiting for approval: '+currentUser.name+' wants '+m.title);if(typeof sendAdminEmailNotice==='function')sendAdminEmailNotice('Marketplace buyer request waiting for approval','A buyer requested to buy a marketplace item.',{Buyer:currentUser.name,BuyerEmail:currentUser.email,Item:m.title,Seller:m.seller,Status:r.status},'marketplace');persistOnly();marketplace();alert('Request sent to admin for approval.');}

function marketRefreshAfterAction(){persistOnly();if(currentPage==='admin'){adminSuccess();}else{marketplace();}}
function marketSaveItem(id){if(!requireLogin())return;if(!data.savedMarketItems)data.savedMarketItems=[];if(!data.events)data.events=[];if(!data.savedMarketItems.includes(id))data.savedMarketItems.push(id);persistOnly();alert('Item saved.');}
function marketAdminApproveListing(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let m=data.market.find(x=>x.id===id);if(!m)return;m.status='Approved';addNote(m.sellerEmail,'Your marketplace listing was approved: '+m.title);marketRefreshAfterAction();}
function marketAdminDeclineListing(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let m=data.market.find(x=>x.id===id);if(!m)return;m.status='Declined';addNote(m.sellerEmail,'Your marketplace listing was declined: '+m.title);marketRefreshAfterAction();}
function marketAdminApproveBuyerReq(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let r=data.marketRequests.find(x=>x.id===id);if(!r)return;r.status='Admin Approved - Waiting Seller';addNote(r.sellerEmail,'Marketplace buyer request approved by admin. Please accept or decline: '+r.itemTitle);addNote(r.buyerEmail,'Your marketplace request is approved by admin and waiting for seller response: '+r.itemTitle);marketRefreshAfterAction();}
function marketAdminDeclineBuyerReq(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let r=data.marketRequests.find(x=>x.id===id);if(!r)return;r.status='Admin Declined';addNote(r.buyerEmail,'Your marketplace buyer request was declined: '+r.itemTitle);marketRefreshAfterAction();}
function marketSellerAcceptReq(id){let r=data.marketRequests.find(x=>x.id===id);if(!r||!currentUser||r.sellerEmail!==currentUser.email)return alert('Seller only.');r.status='Seller Accepted - Waiting Admin';addNote('admin.habeshaconnect@gmail.com','Marketplace seller accepted buyer request. Admin connection approval needed: '+r.itemTitle);if(typeof sendAdminEmailNotice==='function')sendAdminEmailNotice('Marketplace seller accepted request','Seller accepted a buyer request and admin approval is needed before contact sharing.',{Seller:r.sellerName,Buyer:r.buyerName,Item:r.itemTitle,Status:r.status},'marketplace');marketRefreshAfterAction();}
function marketSellerDeclineReq(id){let r=data.marketRequests.find(x=>x.id===id);if(!r||!currentUser||r.sellerEmail!==currentUser.email)return alert('Seller only.');r.status='Seller Declined';addNote(r.buyerEmail,'Seller declined your marketplace request: '+r.itemTitle);marketRefreshAfterAction();}
function marketAdminApproveConnection(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let r=data.marketRequests.find(x=>x.id===id);if(!r)return;r.status='Connection Approved';addNote(r.buyerEmail,'Marketplace connection approved. Seller contact is now available for '+r.itemTitle);addNote(r.sellerEmail,'Marketplace connection approved. Buyer contact is now available for '+r.itemTitle);marketRefreshAfterAction();}
function marketMarkSold(id){let m=data.market.find(x=>x.id===id);if(!m||!currentUser||m.sellerEmail!==currentUser.email)return alert('Seller only.');m.status='Sold Waiting Admin Verification';addNote('admin.habeshaconnect@gmail.com','Marketplace item marked sold and waiting for verification: '+m.title);if(typeof sendAdminEmailNotice==='function')sendAdminEmailNotice('Marketplace sold item verification needed','Seller marked item as sold. Admin verification is needed.',{Seller:m.seller,Item:m.title,Price:money(m.price),Status:m.status},'marketplace');marketRefreshAfterAction();}
function marketAdminVerifySale(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let m=data.market.find(x=>x.id===id);if(!m)return;m.status='Sold Verified';addNote(m.sellerEmail,'Marketplace sold item verified: '+m.title);marketRefreshAfterAction();}

/* V7.8.42 Marketplace phone + Supabase sync fix
   Scope: Marketplace only. Other workflows are not changed. */
let __marketplaceLoadedOnce_V7842=false;
const __marketplaceLocalRender_V7842=marketplace;
function marketDbStatusToUi(status,type){
  const s=String(status||'').toLowerCase();
  if(type==='request'){
    return ({pending_admin:'Buyer Request Pending Admin',admin_approved:'Admin Approved - Waiting Seller',admin_declined:'Admin Declined',seller_accepted_waiting_admin:'Seller Accepted - Waiting Admin',seller_declined:'Seller Declined',connection_admin_approved:'Connection Approved',connection_admin_declined:'Connection Declined',completed:'Completed',cancelled:'Cancelled'})[s]||status||'Buyer Request Pending Admin';
  }
  return ({pending_admin:'Pending Admin Approval',admin_approved:'Approved',admin_declined:'Declined',sold_waiting_admin:'Sold Waiting Admin Verification',sold_admin_approved:'Sold Verified',removed:'Removed'})[s]||status||'Pending Admin Approval';
}
function marketUiStatusToDb(status,type){
  const s=String(status||'');
  if(type==='request'){
    return ({'Buyer Request Pending Admin':'pending_admin','Admin Approved - Waiting Seller':'admin_approved','Admin Declined':'admin_declined','Seller Accepted - Waiting Admin':'seller_accepted_waiting_admin','Seller Declined':'seller_declined','Connection Approved':'connection_admin_approved','Connection Declined':'connection_admin_declined','Completed':'completed','Cancelled':'cancelled'})[s]||s.toLowerCase().replaceAll(' ','_');
  }
  return ({'Pending Admin Approval':'pending_admin','Approved':'admin_approved','Available':'admin_approved','Declined':'admin_declined','Sold Waiting Admin Verification':'sold_waiting_admin','Sold Verified':'sold_admin_approved','Removed':'removed'})[s]||s.toLowerCase().replaceAll(' ','_');
}
async function marketAuthUserId(){
  if(!authReady())return null;
  if(currentUser&&currentUser.auth_user_id)return currentUser.auth_user_id;
  try{let {data}=await hcSupabase.auth.getUser();return data&&data.user?data.user.id:null;}catch(e){return null;}
}
function mapSupabaseMarketListing(row){
  return {id:row.id,dbId:row.id,title:row.title||'Marketplace Item',category:row.category||'Other',condition:row.item_condition||'Good',price:Number(row.price||0),city:row.city||'',description:row.description||'',photos:Array.isArray(row.photo_urls)?row.photo_urls:[],seller:row.seller_name||'Seller',sellerEmail:row.seller_email||'',sellerPhone:row.seller_phone||'',sellerAuthId:row.seller_id||'',status:marketDbStatusToUi(row.status,'listing'),createdAt:row.created_at?new Date(row.created_at).toLocaleString():''};
}
function mapSupabaseMarketRequest(row){
  let listing=row.marketplace_listings||row.listing||{};
  return {id:row.id,dbId:row.id,itemId:row.listing_id,itemTitle:listing.title||row.item_title||'Marketplace Item',buyerName:row.buyer_name||'Buyer',buyerEmail:row.buyer_email||'',buyerPhone:row.buyer_phone||'',sellerName:listing.seller_name||row.seller_name||'Seller',sellerEmail:listing.seller_email||row.seller_email||'',sellerPhone:listing.seller_phone||row.seller_phone||'',message:row.message||'',status:marketDbStatusToUi(row.status,'request'),createdAt:row.created_at?new Date(row.created_at).toLocaleString():''};
}
async function loadSupabaseMarketplace(){
  if(!authReady())return;
  let listings=await hcSupabase.from('marketplace_listings').select('*').order('created_at',{ascending:false});
  if(!listings.error)data.market=(listings.data||[]).map(mapSupabaseMarketListing);else console.warn('Marketplace listings load error',listings.error);
  let reqs=await hcSupabase.from('marketplace_purchase_requests').select('*, marketplace_listings(*)').order('created_at',{ascending:false});
  if(!reqs.error)data.marketRequests=(reqs.data||[]).map(mapSupabaseMarketRequest);else console.warn('Marketplace requests load error',reqs.error);
  let uid=await marketAuthUserId();
  if(uid){let saved=await hcSupabase.from('marketplace_saved_items').select('listing_id').eq('user_id',uid);if(!saved.error)data.savedMarketItems=(saved.data||[]).map(x=>x.listing_id);}
  persistOnly();
}
marketplace=function(){
  __marketplaceLocalRender_V7842();
  if(authReady()){
    loadSupabaseMarketplace().then(()=>{if(currentPage==='marketplace')__marketplaceLocalRender_V7842();}).catch(err=>console.warn('Marketplace refresh error',err));
  }
};
async function compressMarketImage(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onload=()=>{
      const img=new Image();
      img.onload=()=>{
        const max=900;
        let w=img.width,h=img.height;
        if(w>h&&w>max){h=Math.round(h*max/w);w=max;}else if(h>max){w=Math.round(w*max/h);h=max;}
        const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
        const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL('image/jpeg',0.68));
      };
      img.onerror=reject;img.src=reader.result;
    };
    reader.onerror=reject;reader.readAsDataURL(file);
  });
}
readMarketPhotoFile=compressMarketImage;
getMarketUploadedPhotos=async function(){let input=$('mPhotoFiles');let files=input&&input.files?Array.from(input.files).slice(0,4):[];let photos=[];for(let f of files){if(f&&f.type&&f.type.startsWith('image/'))photos.push(await compressMarketImage(f));}return photos;};
previewMarketPhotos=async function(){let box=$('mPhotoPreview');if(!box)return;let input=$('mPhotoFiles');let files=input&&input.files?Array.from(input.files).slice(0,4):[];box.innerHTML=files.map((f,i)=>`<span class="photoThumb">📷 ${f.name}</span>`).join('')+(input&&input.files&&input.files.length>4?'<p class="small">Phone-safe mode: only first 4 photos will be saved.</p>':'');};
async function insertMarketListingDb(item){
  if(!authReady())return {error:null,data:null};
  let uid=await marketAuthUserId();
  if(!uid)return {error:{message:'Please sign in again before posting to Marketplace.'}};
  let payload={seller_id:uid,seller_name:item.seller,seller_email:item.sellerEmail,seller_phone:item.sellerPhone,title:item.title,description:item.description,category:item.category,price:item.price,item_condition:item.condition,city:item.city,photo_urls:item.photos,status:marketUiStatusToDb(item.status,'listing')};
  return await hcSupabase.from('marketplace_listings').insert(payload).select().single();
}
async function updateMarketListingDb(item,status){
  if(!authReady()||!item)return {error:null};
  let id=item.dbId||item.id;
  return await hcSupabase.from('marketplace_listings').update({status:marketUiStatusToDb(status||item.status,'listing')}).eq('id',id);
}
async function insertMarketRequestDb(req){
  if(!authReady())return {error:null,data:null};
  let uid=await marketAuthUserId();
  if(!uid)return {error:{message:'Please sign in again before requesting this item.'}};
  let payload={listing_id:req.itemId,buyer_id:uid,buyer_name:req.buyerName,buyer_email:req.buyerEmail,buyer_phone:req.buyerPhone,message:req.message||'',status:marketUiStatusToDb(req.status,'request')};
  return await hcSupabase.from('marketplace_purchase_requests').insert(payload).select().single();
}
async function updateMarketRequestDb(req,status){
  if(!authReady()||!req)return {error:null};
  let id=req.dbId||req.id;
  return await hcSupabase.from('marketplace_purchase_requests').update({status:marketUiStatusToDb(status||req.status,'request')}).eq('id',id);
}
addMarket=async function(){
  if(!requireLogin())return;
  let title=($('mTitle').value||'').trim(),price=+$('mPrice').value||0,city=($('mCity').value||'').trim();
  if(!title||!price||!city)return alert('Please enter item title, price, and city.');
  let linkPhotos=($('mPhotos').value||'').split(',').map(x=>x.trim()).filter(Boolean);
  let uploadedPhotos=await getMarketUploadedPhotos();
  let photos=[...uploadedPhotos,...linkPhotos].slice(0,10);
  let item={id:'M'+Date.now().toString().slice(-5),title,category:$('mCategory').value,condition:$('mCondition').value,price,city,description:$('mDesc').value||'',photos,seller:currentUser.name,sellerEmail:currentUser.email,sellerPhone:currentUser.phone||'',status:currentUser.role==='admin'?'Approved':'Pending Admin Approval',createdAt:new Date().toLocaleString()};
  let res=await insertMarketListingDb(item);
  if(res.error)return alert('Marketplace item was not saved to Supabase. Please run the Marketplace SQL, then try again. '+res.error.message);
  if(res.data){let mapped=mapSupabaseMarketListing(res.data);Object.assign(item,mapped);}
  data.market.unshift(item);
  addNote('admin.habeshaconnect@gmail.com','Marketplace listing waiting for approval: '+title+' by '+currentUser.name);
  if(typeof sendAdminEmailNotice==='function')sendAdminEmailNotice('Marketplace listing waiting for approval','A seller posted a marketplace item.',{Seller:currentUser.name,Email:currentUser.email,Item:title,Price:money(price),City:city,Photos:String(photos.length),Status:item.status},'marketplace');
  persistOnly();marketplace();alert('Item submitted with '+photos.length+' photo(s). Admin must approve before buyers can see it.');
};
marketRequestBuy=async function(id){
  if(!requireLogin())return;
  let m=(data.market||[]).find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));if(!m)return;
  let exists=(data.marketRequests||[]).find(r=>String(r.itemId)===String(m.dbId||m.id)&&r.buyerEmail===currentUser.email&&!['Cancelled','Admin Declined','Seller Declined'].includes(r.status));
  if(exists)return alert('You already requested this item.');
  let r={id:'MR'+Date.now().toString().slice(-5),itemId:m.dbId||m.id,itemTitle:m.title,buyerName:currentUser.name,buyerEmail:currentUser.email,buyerPhone:currentUser.phone||'',sellerName:m.seller,sellerEmail:m.sellerEmail,sellerPhone:m.sellerPhone||'',status:'Buyer Request Pending Admin',createdAt:new Date().toLocaleString()};
  let res=await insertMarketRequestDb(r);
  if(res.error)return alert('Marketplace request was not saved to Supabase. Please run the Marketplace SQL, then try again. '+res.error.message);
  if(res.data){r.id=res.data.id;r.dbId=res.data.id;}
  data.marketRequests.unshift(r);
  addNote('admin.habeshaconnect@gmail.com','Marketplace buyer request waiting for approval: '+currentUser.name+' wants '+m.title);
  if(typeof sendAdminEmailNotice==='function')sendAdminEmailNotice('Marketplace buyer request waiting for approval','A buyer requested to buy a marketplace item.',{Buyer:currentUser.name,BuyerEmail:currentUser.email,Item:m.title,Seller:m.seller,Status:r.status},'marketplace');
  persistOnly();marketplace();alert('Request sent to admin for approval.');
};
marketRefreshAfterAction=async function(){persistOnly();await loadSupabaseMarketplace().catch(()=>{});if(currentPage==='admin'){adminSuccess();}else{marketplace();}};
marketSaveItem=async function(id){
  if(!requireLogin())return;if(!data.savedMarketItems)data.savedMarketItems=[];if(!data.events)data.events=[];
  if(!data.savedMarketItems.includes(id))data.savedMarketItems.push(id);
  let uid=await marketAuthUserId();if(authReady()&&uid){await hcSupabase.from('marketplace_saved_items').upsert({listing_id:id,user_id:uid},{onConflict:'listing_id,user_id'}).catch(()=>{});}
  persistOnly();alert('Item saved.');
};
marketAdminApproveListing=async function(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let m=data.market.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));if(!m)return;m.status='Approved';let r=await updateMarketListingDb(m,'Approved');if(r.error)return alert('Could not approve Marketplace listing: '+r.error.message);addNote(m.sellerEmail,'Your marketplace listing was approved: '+m.title);await marketRefreshAfterAction();};
marketAdminDeclineListing=async function(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let m=data.market.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));if(!m)return;m.status='Declined';let r=await updateMarketListingDb(m,'Declined');if(r.error)return alert('Could not decline Marketplace listing: '+r.error.message);addNote(m.sellerEmail,'Your marketplace listing was declined: '+m.title);await marketRefreshAfterAction();};
marketAdminApproveBuyerReq=async function(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let r=data.marketRequests.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));if(!r)return;r.status='Admin Approved - Waiting Seller';let res=await updateMarketRequestDb(r,r.status);if(res.error)return alert('Could not approve Marketplace buyer request: '+res.error.message);addNote(r.sellerEmail,'Marketplace buyer request approved by admin. Please accept or decline: '+r.itemTitle);addNote(r.buyerEmail,'Your marketplace request is approved by admin and waiting for seller response: '+r.itemTitle);await marketRefreshAfterAction();};
marketAdminDeclineBuyerReq=async function(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let r=data.marketRequests.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));if(!r)return;r.status='Admin Declined';let res=await updateMarketRequestDb(r,r.status);if(res.error)return alert('Could not decline Marketplace buyer request: '+res.error.message);addNote(r.buyerEmail,'Your marketplace buyer request was declined: '+r.itemTitle);await marketRefreshAfterAction();};
marketSellerAcceptReq=async function(id){let r=data.marketRequests.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));if(!r||!currentUser||r.sellerEmail!==currentUser.email)return alert('Seller only.');r.status='Seller Accepted - Waiting Admin';let res=await updateMarketRequestDb(r,r.status);if(res.error)return alert('Could not accept Marketplace request: '+res.error.message);addNote('admin.habeshaconnect@gmail.com','Marketplace seller accepted buyer request. Admin connection approval needed: '+r.itemTitle);if(typeof sendAdminEmailNotice==='function')sendAdminEmailNotice('Marketplace seller accepted request','Seller accepted a buyer request and admin approval is needed before contact sharing.',{Seller:r.sellerName,Buyer:r.buyerName,Item:r.itemTitle,Status:r.status},'marketplace');await marketRefreshAfterAction();};
marketSellerDeclineReq=async function(id){let r=data.marketRequests.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));if(!r||!currentUser||r.sellerEmail!==currentUser.email)return alert('Seller only.');r.status='Seller Declined';let res=await updateMarketRequestDb(r,r.status);if(res.error)return alert('Could not decline Marketplace request: '+res.error.message);addNote(r.buyerEmail,'Seller declined your marketplace request: '+r.itemTitle);await marketRefreshAfterAction();};
marketAdminApproveConnection=async function(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let r=data.marketRequests.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));if(!r)return;r.status='Connection Approved';let res=await updateMarketRequestDb(r,r.status);if(res.error)return alert('Could not approve Marketplace connection: '+res.error.message);addNote(r.buyerEmail,'Marketplace connection approved. Seller contact is now available for '+r.itemTitle);addNote(r.sellerEmail,'Marketplace connection approved. Buyer contact is now available for '+r.itemTitle);await marketRefreshAfterAction();};
marketMarkSold=async function(id){let m=data.market.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));if(!m||!currentUser||m.sellerEmail!==currentUser.email)return alert('Seller only.');m.status='Sold Waiting Admin Verification';let r=await updateMarketListingDb(m,m.status);if(r.error)return alert('Could not mark Marketplace item sold: '+r.error.message);addNote('admin.habeshaconnect@gmail.com','Marketplace item marked sold and waiting for verification: '+m.title);if(typeof sendAdminEmailNotice==='function')sendAdminEmailNotice('Marketplace sold item verification needed','Seller marked item as sold. Admin verification is needed.',{Seller:m.seller,Item:m.title,Price:money(m.price),Status:m.status},'marketplace');await marketRefreshAfterAction();};
marketAdminVerifySale=async function(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let m=data.market.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));if(!m)return;m.status='Sold Verified';let r=await updateMarketListingDb(m,m.status);if(r.error)return alert('Could not verify Marketplace sale: '+r.error.message);addNote(m.sellerEmail,'Marketplace sold item verified: '+m.title);await marketRefreshAfterAction();};

function jobs(){$('jobs').innerHTML=`<h2>💼 Jobs</h2><div class="grid"><div class="card"><h3>Post Job</h3><input id="jTitle" placeholder="Job title"><input id="jCompany" placeholder="Company"><input id="jCity" placeholder="City"><input id="jPay" placeholder="$15/hr"><button class="btn primary" onclick="addJob()">Post Job</button></div>${data.jobs.map(j=>`<div class="card"><h3>${j.title}</h3><p>${j.company} • ${j.city}</p><p><b>${j.pay}</b></p><span class="pill good">${j.status}</span><div class="actions"><button class="btn primary" onclick="applyJob('${j.id}')">Apply</button><button class="btn">Save</button></div></div>`).join('')}</div>`}
function addJob(){if(!requireLogin())return;data.jobs.unshift({id:'J'+Date.now().toString().slice(-5),title:$('jTitle').value||'Job',company:$('jCompany').value||'Company',city:$('jCity').value||'Atlanta',pay:$('jPay').value||'Negotiable',status:'Open'});save()}
function applyJob(id){if(!requireLogin())return;addNote(currentUser.email,'Job application submitted for '+id);save();alert('Application submitted.')}

function showTruckExpiryWarnings(){
 if(!currentUser)return;
 let role=currentUser.role;
 if(!['truck_owner','driver','admin'].includes(role))return;
 let key='hc_truck_expiry_notice_'+currentUser.email+'_'+new Date().toISOString().slice(0,10);
 if(sessionStorage.getItem(key))return;
 let records=(data.trucks||[]).filter(t=>role==='admin'||t.ownerEmail===currentUser.email||t.driverEmail===currentUser.email);
 let warnings=[];
 records.forEach(t=>{
   [['Insurance',t.insurance],['Registration',t.registration]].forEach(([label,val])=>{
     let n=daysUntil(val);
     if(n===null)return;
     if(n<0)warnings.push((t.truck||'Truck')+' '+label+' expired.');
     else if(n<=30)warnings.push((t.truck||'Truck')+' '+label+' will expire in '+n+' days.');
   });
 });
 if(warnings.length){sessionStorage.setItem(key,'1');alert('Truck document notice:\n\n'+warnings.join('\n'));}
}
function truckAdminManagementHtml(){
 let trucks=data.trucks||[], jobs=data.truckJobs||[], apps=data.truckApplications||[], profiles=data.truckDriverProfiles||[], trailers=data.trailerRentals||[];
 return `<h3>🚛 Truck Owner / Truck Driver Management</h3>
 <div class="grid"><div class="card"><p>Truck Owners / Trucks</p><div class="stat">${trucks.length}</div></div><div class="card"><p>Driver Job Posts</p><div class="stat">${jobs.length}</div></div><div class="card"><p>Driver Applications</p><div class="stat">${apps.length}</div></div><div class="card"><p>Driver Profiles</p><div class="stat">${profiles.length}</div></div><div class="card"><p>Trailer Rentals</p><div class="stat">${trailers.length}</div></div></div>
 <h3>Truck Records</h3><table><tr><th>Owner</th><th>Truck</th><th>Driver</th><th>Insurance</th><th>Registration</th><th>Status</th><th>Action</th></tr>${trucks.map(t=>`<tr><td>${t.ownerName||''}<br><span class="small">${t.ownerEmail||''}</span></td><td>${t.truck||''}<br><span class="small">Plate: ${t.plate||''} VIN: ${t.vin||''}</span></td><td>${t.driver||''}<br><span class="small">${t.driverEmail||''}</span></td><td>${t.insurance||''}<br>${expiryBadge(t.insurance,'Insurance')}</td><td>${t.registration||''}<br>${expiryBadge(t.registration,'Registration')}</td><td>${t.status||''}</td><td><button class="btn bad" onclick="deleteTruckRecord('${t.id}')">Delete</button></td></tr>`).join('')||'<tr><td colspan="7">No truck records yet.</td></tr>'}</table>
 <h3>Truck Driver Job Posts</h3><table><tr><th>Owner</th><th>Job</th><th>Route</th><th>Pay</th><th>Status</th><th>Action</th></tr>${jobs.map(j=>`<tr><td>${j.ownerName||''}<br><span class="small">${j.ownerEmail||''}</span></td><td>${j.title||''}</td><td>${j.route||''}</td><td>${j.pay||''}</td><td><span class="pill ${j.status==='Open'?'good':j.status==='Hired'?'good':j.status==='Closed'?'bad':'warn'}">${j.status||'Pending Admin Approval'}</span></td><td>${j.status==='Pending Admin Approval'?`<button class="btn primary" onclick="adminApproveTruckJob('${j.id}')">Approve Publish</button> `:''}<button class="btn ghost" onclick="closeTruckJob('${j.id}')">Close</button> <button class="btn bad" onclick="deleteTruckJob('${j.id}')">Delete</button></td></tr>`).join('')||'<tr><td colspan="6">No truck jobs yet.</td></tr>'}</table>
 <h3>Truck Driver Applications</h3><table><tr><th>Job</th><th>Owner</th><th>Driver</th><th>Phone</th><th>License</th><th>Status</th><th>Action</th></tr>${apps.map(a=>{let action='';if(a.status==='Pending Admin Approval')action=`<button class="btn primary" onclick="adminApproveTruckApplication('${a.id}')">Approve to Owner</button> <button class="btn bad" onclick="declineTruckApp('${a.id}')">Decline</button> <button class="btn ghost" onclick="deleteTruckApplication('${a.id}')">Delete</button>`;else if(a.status==='Pending Final Admin Approval')action=`<button class="btn primary" onclick="approveTruckApp('${a.id}')">Final Approve Hire</button> <button class="btn bad" onclick="declineTruckApp('${a.id}')">Decline</button> <button class="btn ghost" onclick="deleteTruckApplication('${a.id}')">Delete</button>`;else if(a.status==='Pending Owner Review')action=`<span class="small">Waiting for truck owner</span> <button class="btn bad" onclick="declineTruckApp('${a.id}')">Decline</button> <button class="btn ghost" onclick="deleteTruckApplication('${a.id}')">Delete</button>`;else action=`<button class="btn ghost" onclick="deleteTruckApplication('${a.id}')">Delete</button>`;return `<tr><td>${a.jobTitle||''}</td><td>${a.ownerName||''}<br><span class="small">${a.ownerEmail||''}</span></td><td>${a.driverName||''}<br><span class="small">${a.driverEmail||''}</span></td><td>${a.driverPhone||''}</td><td>${a.license||''}</td><td><span class="pill ${(a.status==='Approved'||a.status==='Hired')?'good':a.status==='Declined'?'bad':'warn'}">${a.status||'Pending Admin Approval'}</span></td><td>${action}</td></tr>`}).join('')||'<tr><td colspan="8">No applications yet.</td></tr>'}</table>
 <h3>Truck Driver Profiles</h3><table><tr><th>Driver</th><th>Phone</th><th>City</th><th>License</th><th>Experience</th><th>Looking For</th><th>Action</th></tr>${profiles.map(p=>`<tr><td>${p.name||p.driverName||''}<br><span class="small">${p.driverEmail||''}</span></td><td>${p.phone||''}</td><td>${p.city||''}</td><td>${p.license||''}</td><td>${p.experience||''}</td><td>${p.looking||''}</td><td><button class="btn bad" onclick="deleteDriverProfile('${p.driverEmail}')">Delete</button></td></tr>`).join('')||'<tr><td colspan="7">No driver profiles yet.</td></tr>'}</table>
 <h3>Trailer Rentals</h3><table><tr><th>Owner</th><th>Trailer</th><th>Location</th><th>Price</th><th>Status</th><th>Renter</th><th>Action</th></tr>${trailers.map(t=>{let isRequest=!!(t.renterEmail||t.renterName);let adminAction=(t.status==='Pending Admin Approval'&&!isRequest)?`<button class="btn primary" onclick="adminApproveTrailerListing('${t.id}')">Approve Listing</button> <button class="btn bad" onclick="adminDeclineTrailerListing('${t.id}')">Decline Listing</button> <button class="btn ghost" onclick="deleteTrailerRental('${t.id}')">Delete</button>`:(t.status==='Pending Admin Approval'&&isRequest)?`<button class="btn primary" onclick="adminApproveTrailerRequest('${t.id}')">Approve Request</button> <button class="btn bad" onclick="adminDeclineTrailerRequest('${t.id}')">Decline Request</button>`:t.status==='Pending Final Admin Approval'?`<button class="btn primary" onclick="adminFinalizeTrailerRental('${t.id}')">Final Approve</button> <button class="btn bad" onclick="adminDeclineTrailerRequest('${t.id}')">Decline</button>`:`<button class="btn bad" onclick="deleteTrailerRental('${t.id}')">Delete</button>`;return `<tr><td>${t.ownerName||''}<br><span class="small">${t.ownerEmail||''}</span></td><td>${t.trailerType||''}<br><span class="small">${t.description||''}</span></td><td>${t.location||''}</td><td>${t.price||''}<br><span class="small">Deposit: ${t.deposit||''}</span></td><td><span class="pill ${t.status==='Available'?'good':t.status==='Rented'?'bad':'warn'}">${t.status||'Available'}</span></td><td>${t.renterName||''}<br><span class="small">${t.renterEmail||''}</span></td><td>${adminAction}</td></tr>`}).join('')||'<tr><td colspan="7">No trailer rentals yet.</td></tr>'}</table>`;
}
function deleteTruckRecord(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');if(!confirm('Delete this truck record?'))return;data.trucks=(data.trucks||[]).filter(t=>t.id!==id);persistOnly();adminSuccess();}
async function closeTruckJob(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let j=(data.truckJobs||[]).find(x=>x.id===id);if(j){j.status='Closed';let r=await updateTruckJobDb(j,{status:'Closed'});if(r.error)return alert('Could not close job in Supabase: '+r.error.message);}persistOnly();adminSuccess();}
async function adminApproveTruckJob(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let j=(data.truckJobs||[]).find(x=>x.id===id);if(!j)return alert('Job not found.');j.status='Open';j.approvedAt=new Date().toLocaleString();let r=await updateTruckJobDb(j,{status:'Open',approved_at:new Date().toISOString()});if(r.error)return alert('Could not publish job in Supabase: '+r.error.message);addNote(j.ownerEmail,'Your truck driver job post was approved and published: '+j.title+'.');sendEmailNotice({to:j.ownerEmail,name:j.ownerName,subject:'Truck job approved',summary:'Your truck driver job post was approved and published.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Job:j.title,Status:'Open'}});persistOnly();adminSuccess();}
async function adminApproveTruckApplication(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let a=(data.truckApplications||[]).find(x=>x.id===id);if(!a)return alert('Application not found.');let old={...a};a.status='Pending Owner Review';a.adminApprovedAt=new Date().toLocaleString();let r=await updateTruckApplicationDb(a,{status:'Pending Owner Review',admin_approved_at:new Date().toISOString()});if(r.error){Object.assign(a,old);return alert('Could not approve application in Supabase: '+r.error.message);}addNote(a.ownerEmail,'Driver application approved by admin for your review: '+a.driverName+' applied for '+a.jobTitle+'.');sendEmailNotice({to:a.ownerEmail,name:a.ownerName,subject:'Truck application approved for your review',summary:'Admin approved a driver application and sent it to you for final review.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Driver:a.driverName,Job:a.jobTitle,Status:'Pending Owner Review'}});addNote(a.driverEmail,'Your application for '+a.jobTitle+' was approved by admin and sent to the truck owner.');sendEmailNotice({to:a.driverEmail,name:a.driverName,subject:'Truck application approved',summary:'Your truck application was approved by admin and sent to the truck owner.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Job:a.jobTitle,Status:'Pending Owner Review'}});persistOnly();adminSuccess();alert('Application approved and sent to truck owner.');}


async function adminApproveTrailerListing(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let item=(data.trailerRentals||[]).find(x=>x.id===id);if(!item)return alert('Trailer listing not found.');if(item.renterEmail)return alert('This is a rental request, not a new listing.');let old={...item};item.status='Available';item.approvedAt=new Date().toLocaleString();let r=await updateTrailerRentalDb(item,{status:'Available'});if(r.error){Object.assign(item,old);return alert('Could not approve trailer listing: '+r.error.message);}sendEmailNotice({to:item.ownerEmail,name:item.ownerName,subject:'Trailer listing approved',summary:'Your trailer rental listing was approved and is now available for truck owners/drivers to request.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Trailer:item.trailerType,Location:item.location,Price:item.price,Status:'Available'}});persistOnly();adminSuccess();setTimeout(()=>loadSupabaseTrucking().catch(console.warn),0);alert('Trailer listing approved and published as Available.');}
async function adminDeclineTrailerListing(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let item=(data.trailerRentals||[]).find(x=>x.id===id);if(!item)return alert('Trailer listing not found.');if(item.renterEmail)return alert('This is a rental request, not a new listing.');let old={...item};item.status='Declined';let r=await updateTrailerRentalDb(item,{status:'Declined'});if(r.error){Object.assign(item,old);return alert('Could not decline trailer listing: '+r.error.message);}sendEmailNotice({to:item.ownerEmail,name:item.ownerName,subject:'Trailer listing declined',summary:'Your trailer rental listing was declined by admin.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Trailer:item.trailerType,Status:'Declined'}});persistOnly();adminSuccess();setTimeout(()=>loadSupabaseTrucking().catch(console.warn),0);alert('Trailer listing declined.');}
async function adminApproveTrailerRequest(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let item=(data.trailerRentals||[]).find(x=>x.id===id);if(!item)return alert('Trailer request not found.');if(!item.renterEmail)return alert('This is a trailer listing, not a rental request.');if(item.status!=='Pending Admin Approval')return alert('This request is not waiting for admin approval.');let old={...item};item.status='Pending Owner Review';item.adminApprovedAt=new Date().toLocaleString();let r=await updateTrailerRentalDb(item,{status:'Pending Owner Review'});if(r.error){Object.assign(item,old);return alert('Could not approve trailer request: '+r.error.message);}sendEmailNotice({to:item.ownerEmail,name:item.ownerName,subject:'Trailer rental request approved for your review',summary:'Admin approved a trailer rental request and sent it to you for acceptance or decline.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Requester:item.renterName,RequesterEmail:item.renterEmail,Trailer:item.trailerType,Location:item.location,Price:item.price}});sendEmailNotice({to:item.renterEmail,name:item.renterName,subject:'Trailer request approved by admin',summary:'Admin approved your trailer request and sent it to the trailer owner for review.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Trailer:item.trailerType,Owner:item.ownerName,Status:'Pending Owner Review'}});persistOnly();adminSuccess();setTimeout(()=>loadSupabaseTrucking().catch(console.warn),0);alert('Trailer request approved and sent to the trailer owner.');}
async function adminFinalizeTrailerRental(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let item=(data.trailerRentals||[]).find(x=>x.id===id);if(!item)return alert('Trailer request not found.');if(!item.renterEmail)return alert('This trailer has no renter request to finalize.');if(item.status!=='Pending Final Admin Approval')return alert('This request is not waiting for final admin approval.');let old={...item};item.status='Rented';item.rentedAt=new Date().toLocaleString();let r=await updateTrailerRentalDb(item,{status:'Rented',rented_at:new Date().toISOString()});if(r.error){Object.assign(item,old);return alert('Could not finalize trailer rental: '+r.error.message);}sendEmailNotice({to:item.renterEmail,name:item.renterName,subject:'Complete your trailer rental',summary:'The trailer owner accepted your request and admin gave final approval. You can now complete the rent.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Trailer:item.trailerType,Owner:item.ownerName,OwnerEmail:item.ownerEmail,Location:item.location,Price:item.price,Status:'Ready to Complete Rent'}});sendEmailNotice({to:item.ownerEmail,name:item.ownerName,subject:'Trailer rental final approved',summary:'Admin gave final approval for the trailer rental request.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Requester:item.renterName,RequesterEmail:item.renterEmail,Trailer:item.trailerType,Status:'Rented'}});persistOnly();adminSuccess();setTimeout(()=>loadSupabaseTrucking().catch(console.warn),0);alert('Trailer rental final approved. Requester was notified.');}
async function adminDeclineTrailerRequest(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let item=(data.trailerRentals||[]).find(x=>x.id===id);if(!item)return alert('Trailer request not found.');if(!item.renterEmail)return alert('This trailer has no renter request to decline.');let renterEmail=item.renterEmail,renterName=item.renterName,trailerType=item.trailerType,ownerEmail=item.ownerEmail,ownerName=item.ownerName;item.status='Available';item.renterName='';item.renterEmail='';item.renterPhone='';let r=await updateTrailerRentalDb(item,{status:'Available',renter_name:'',renter_email:'',renter_phone:'',rented_at:null});if(r.error)return alert('Could not decline trailer request: '+r.error.message);if(renterEmail)sendEmailNotice({to:renterEmail,name:renterName,subject:'Trailer rental request declined',summary:'Your trailer rental request was declined by admin.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Trailer:trailerType,Status:'Declined'}});if(ownerEmail)sendEmailNotice({to:ownerEmail,name:ownerName,subject:'Trailer rental request declined by admin',summary:'Admin declined a trailer rental request for your trailer.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Requester:renterName,Trailer:trailerType,Status:'Declined'}});persistOnly();adminSuccess();setTimeout(()=>loadSupabaseTrucking().catch(console.warn),0);alert('Trailer request declined and trailer is available again.');}

async function deleteTruckJob(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');if(!confirm('Delete this truck job post?'))return;let j=(data.truckJobs||[]).find(x=>x.id===id);let r=await deleteTruckJobDb(j);if(r.error)return alert('Could not delete truck job in Supabase: '+r.error.message);data.truckJobs=(data.truckJobs||[]).filter(j=>j.id!==id);data.truckApplications=(data.truckApplications||[]).filter(a=>a.jobId!==id&&a.jobDbId!==(j&&j.dbId));persistOnly();adminSuccess();}
async function deleteTruckApplication(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');if(!confirm('Delete this driver application?'))return;let a=(data.truckApplications||[]).find(x=>x.id===id);let r=await deleteTruckApplicationDb(a);if(r.error)return alert('Could not delete application in Supabase: '+r.error.message);data.truckApplications=(data.truckApplications||[]).filter(a=>a.id!==id);persistOnly();adminSuccess();}
function deleteDriverProfile(email){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');if(!confirm('Delete this driver profile?'))return;data.truckDriverProfiles=(data.truckDriverProfiles||[]).filter(p=>p.driverEmail!==email);persistOnly();adminSuccess();}
function truck(){
 if(!currentUser){$('truck').innerHTML=`<h2>🚚 Trucking Connect</h2><div class="notice">Create an account or sign in as Truck Owner or Truck Driver to use the trucking dashboard.</div><div class="grid"><div class="card"><h3>Truck Owners</h3><p>Post driver jobs, record trucks, drivers, insurance, registration, maintenance, loads, income, expenses, and tracking.</p></div><div class="card"><h3>Drivers</h3><p>Create a driver profile, search truck driving jobs, apply, and track applications.</p></div></div>`;return;}
 let role=currentUser.role;
 let myTruckRecords=(data.trucks||[]).filter(t=>role==='admin'||t.ownerEmail===currentUser.email||t.driverEmail===currentUser.email);
 let myJobs=(data.truckJobs||[]).filter(j=>role==='admin'||j.ownerEmail===currentUser.email);
 let availableJobs=(data.truckJobs||[]).filter(j=>j.status==='Open');
 let myApps=(data.truckApplications||[]).filter(a=>role==='admin'||a.driverEmail===currentUser.email||(a.ownerEmail===currentUser.email&&a.status!=='Pending Admin Approval'));
 let driverProfile=(data.truckDriverProfiles||[]).find(p=>p.driverEmail===currentUser.email);
 let driverProfiles=(data.truckDriverProfiles||[]).filter(p=>role==='admin'||role==='truck_owner'||p.driverEmail===currentUser.email);
 let trailerRentals=(data.trailerRentals||[]).filter(t=>role==='admin'||t.status==='Available'||t.ownerEmail===currentUser.email||t.renterEmail===currentUser.email);
 let ownerQuick=`<div class="grid"><div class="card"><h3>📢 Post Jobs</h3><p class="muted">Create a driver job post. Admin approval is required before drivers can apply.</p><button class="btn primary" onclick="document.getElementById('jobPostCard')?.scrollIntoView({behavior:'smooth'})">Post Jobs</button></div><div class="card"><h3>👥 Driver Applications</h3><p class="muted">Review admin-approved driver applications for your jobs.</p><button class="btn primary" onclick="document.getElementById('truckApplicationsTable')?.scrollIntoView({behavior:'smooth'})">See Driver Applications</button></div><div class="card"><h3>🚛 Post Trailer Rent</h3><p class="muted">Post your trailer for rent and manage trailer rental requests.</p><button class="btn primary" onclick="document.getElementById('trailerRentCard')?.scrollIntoView({behavior:'smooth'})">Post Trailer Rent</button></div><div class="card"><h3>🔎 Available Trailers for Rent</h3><p class="muted">See trailers posted by other owners that are available to rent.</p><button class="btn primary" onclick="document.getElementById('trailerRentalsTable')?.scrollIntoView({behavior:'smooth'})">Available Trailers for Rent</button></div></div><div class="actions"><button class="btn ghost" onclick="document.getElementById('driverProfilesTable')?.scrollIntoView({behavior:'smooth'})"></button></div>`;
 let ownerPanel=`<div class="grid"><div class="card"><h3>🚛 Truck Owner Record</h3><label>Truck / Unit Number</label><input id="tTruck" placeholder="Unit 101 / Freightliner Cascadia"><label>License Plate</label><input id="tPlate" placeholder="Plate number"><label>VIN</label><input id="tVin" placeholder="VIN"><label>Driver Name</label><input id="tDriver" placeholder="Assigned driver"><label>Driver Email</label><input id="tDriverEmail" placeholder="driver@email.com"><label>Insurance Expiration</label><input id="tInsurance" type="date"><label>Registration Expiration</label><input id="tRegistration" type="date"><label>Maintenance / Notes</label><textarea id="tMaintenance" placeholder="Oil change, tires, brakes, repair notes"></textarea><div class="row"><div><label>Income</label><input id="tIncome" type="number" placeholder="Income"></div><div><label>Expenses</label><input id="tExpenses" type="number" placeholder="Fuel, toll, repair, permit expenses"></div></div><div class="row"><div><label>Mileage</label><input id="tMileage" type="number" placeholder="Mileage"></div><div><label>Status / Tracking</label><select id="tStatus"><option>Available</option><option>Assigned</option><option>Pickup</option><option>On the road</option><option>Delivered</option><option>Maintenance</option></select></div></div><button class="btn primary" onclick="addTruck()">Save Truck Record</button></div><div class="card" id="jobPostCard"><h3>📢 Post Driver Job</h3><label>Job Title</label><input id="jobTitle" placeholder="CDL Driver Needed"><label>Location / Route</label><input id="jobRoute" placeholder="Atlanta to regional / local"><label>Pay</label><input id="jobPay" placeholder="$1,500 weekly or 30%"><label>Schedule</label><input id="jobSchedule" placeholder="Full time, weekends, local"><label>Requirements</label><textarea id="jobReq" placeholder="CDL class, experience, clean MVR, language, documents"></textarea><label>Truck Details</label><textarea id="jobTruck" placeholder="Truck type, trailer, automatic/manual, owner operator/company driver"></textarea><button class="btn primary" onclick="postTruckJob()">Post Jobs</button></div><div class="card" id="trailerRentCard"><h3>🚛 Trailer Rent</h3><label>Trailer Type</label><input id="trType" placeholder="Dry van, reefer, flatbed, box trailer"><label>Location</label><input id="trLocation" placeholder="Atlanta, GA"><label>Rent Price</label><input id="trPrice" placeholder="$100/day or $700/week"><label>Deposit</label><input id="trDeposit" placeholder="$500"><label>Availability</label><input id="trAvailability" placeholder="Available now / weekdays / weekends"><label>Description</label><textarea id="trDescription" placeholder="Size, condition, requirements, pickup location"></textarea><button class="btn primary" onclick="postTrailerRental()">Post Trailer for Rent</button></div></div>`;
 let driverQuick=`<div class="grid"><div class="card"><h3>🚚 Available Truck Jobs</h3><p class="muted">See approved truck owner hiring posts and apply.</p><button class="btn primary" onclick="document.getElementById('availableTruckJobs')?.scrollIntoView({behavior:'smooth'})">See Available Truck Jobs</button></div><div class="card"><h3>📋 My Applications</h3><p class="muted">Track your truck driving applications and approval status.</p><button class="btn primary" onclick="document.getElementById('truckApplicationsTable')?.scrollIntoView({behavior:'smooth'})">See My Applications</button></div><div class="card"><h3>🔎 Available Trailers for Rent</h3><p class="muted">See trailers posted by owners that are available to rent.</p><button class="btn primary" onclick="document.getElementById('trailerRentalsTable')?.scrollIntoView({behavior:'smooth'})">Available Trailers for Rent</button></div></div>`;
 let driverPanel=`<div class="grid"><div class="card" id="driverProfileCard"><h3>👤 Driver Job Profile</h3><label>Full Name</label><input id="dpName" value="${driverProfile?.name||currentUser.name||''}"><label>Phone</label><input id="dpPhone" value="${driverProfile?.phone||currentUser.phone||''}"><label>City</label><input id="dpCity" value="${driverProfile?.city||currentUser.city||''}"><label>CDL / License Type</label><input id="dpLicense" value="${driverProfile?.license||''}" placeholder="CDL A, CDL B, Box truck"><label>Experience</label><input id="dpExperience" value="${driverProfile?.experience||''}" placeholder="5 years, local, OTR"><label>Looking For</label><select id="dpLooking"><option ${driverProfile?.looking==='Full Time'?'selected':''}>Full Time</option><option ${driverProfile?.looking==='Part Time'?'selected':''}>Part Time</option><option ${driverProfile?.looking==='Owner Operator'?'selected':''}>Owner Operator</option><option ${driverProfile?.looking==='Box Truck'?'selected':''}>Box Truck</option></select><label>Skills / Notes</label><textarea id="dpNotes" placeholder="Routes, languages, availability, safety record">${driverProfile?.notes||''}</textarea><button class="btn primary" onclick="saveDriverProfile()">Save Driver Profile</button></div><div class="card"><h3>🔎 Driver Job Search</h3><p>Drivers can apply to truck owner posts. Owner will see full driver details and can approve or decline.</p><button class="btn" onclick="truck()">Refresh Jobs</button></div></div>`;
 let jobsTable=`<h3 id="availableTruckJobs">🚛 Approved Owner Hiring Posts — Drivers See This First</h3><table><tr><th>Owner</th><th>Job</th><th>Route</th><th>Schedule</th><th>Requirements</th><th>Status</th><th>Action</th></tr>${availableJobs.map(j=>{let already=(data.truckApplications||[]).find(a=>a.jobId===j.id&&a.driverEmail===currentUser.email);let action=role==='driver'?(already?`<span class="pill good">Applied</span><br><span class="small">${already.status}</span>`:`<button class="btn primary" onclick="applyTruckJob('${j.id}')">Apply This Job</button>`):(role==='truck_owner'&&j.ownerEmail===currentUser.email?`<span class="pill good">Owner Post</span>`:'-');return `<tr><td>${j.ownerName}<br><span class="small">${j.ownerPhone||''}</span></td><td>${j.title}<br><span class="small">${j.truckDetails||''}</span></td><td>${j.route}</td><td>${j.schedule}</td><td>${j.requirements}</td><td><span class="pill good">Published</span></td><td>${action}</td></tr>`}).join('')||'<tr><td colspan="7">No approved truck owner hiring posts yet.</td></tr>'}</table>`;
 let driverProfilesTable=`<h3 id="driverProfilesTable">👤 Drivers Looking for Truck Driving Jobs — Owners See This First</h3><table><tr><th>Driver</th><th>Phone</th><th>City</th><th>License</th><th>Experience</th><th>Looking For</th><th>Skills / Notes</th><th>Updated</th></tr>${driverProfiles.map(p=>`<tr><td>${p.name||p.driverName||'Driver'}<br><span class="small">${p.driverEmail||''}</span></td><td>${p.phone||''}</td><td>${p.city||''}</td><td>${p.license||''}</td><td>${p.experience||''}</td><td>${p.looking||''}</td><td>${p.notes||''}</td><td>${p.updatedAt||''}</td></tr>`).join('')||'<tr><td colspan="8">No driver looking-for-job posts yet.</td></tr>'}</table>`;
 let appsTable=`<h3 id="truckApplicationsTable">Driver Applications / Hiring Records</h3><table><tr><th>Job</th><th>Driver</th><th>Phone</th><th>License</th><th>Experience</th><th>Looking For / Notes</th><th>Status</th><th>Action</th></tr>${myApps.map(a=>{let canManage=role==='truck_owner'&&a.ownerEmail===currentUser.email&&a.status==='Pending Owner Review';return `<tr><td>${a.jobTitle}</td><td>${a.driverName}<br><span class="small">${a.driverEmail}</span></td><td>${a.driverPhone}</td><td>${a.license}</td><td>${a.experience}</td><td>${a.looking||''}<br><span class="small">${a.notes||''}</span></td><td><span class="pill ${(a.status==='Approved'||a.status==='Hired')?'good':a.status==='Declined'?'bad':'warn'}">${a.status}</span></td><td>${canManage?`<button class="btn primary" onclick="approveTruckApp('${a.id}')">Accept Driver</button> <button class="btn bad" onclick="declineTruckApp('${a.id}')">Decline</button>`:'-'}</td></tr>`}).join('')||'<tr><td colspan="8">No applications yet.</td></tr>'}</table>`;
 let recordsTable=`<h3>Truck Owner / Driver Records</h3><table><tr><th>Truck</th><th>Plate</th><th>Driver</th><th>Status</th><th>Insurance</th><th>Registration</th><th>Income</th><th>Expenses</th><th>Profit</th><th>Mileage</th><th>Maintenance</th></tr>${myTruckRecords.map(t=>`<tr><td>${t.truck}<br><span class="small">VIN: ${t.vin||''}</span></td><td>${t.plate||''}</td><td>${t.driver}<br><span class="small">${t.driverEmail||''}</span></td><td>${t.status||'Available'}</td><td>${t.insurance||''}<br>${expiryBadge(t.insurance,'Insurance')}</td><td>${t.registration||''}<br>${expiryBadge(t.registration,'Registration')}</td><td>${money(t.income)}</td><td>${money(t.expenses)}</td><td>${money((+t.income||0)-(+t.expenses||0))}</td><td>${t.mileage}</td><td>${t.maintenance||''}</td></tr>`).join('')||'<tr><td colspan="11">No truck records yet.</td></tr>'}</table>`;
 let trailerTable=`<h3 id="trailerRentalsTable">🚛 Trailer Rentals</h3><table><tr><th>Owner</th><th>Trailer</th><th>Location</th><th>Price</th><th>Available</th><th>Status</th><th>Action</th></tr>${trailerRentals.map(t=>{let mine=t.ownerEmail===currentUser.email;let requested=t.renterEmail===currentUser.email;let ownerManage=mine&&t.status==='Pending Owner Review';let action=ownerManage?`<button class="btn primary" onclick="approveTrailerRental('${t.id}')">Accept Request</button> <button class="btn bad" onclick="declineTrailerRental('${t.id}')">Decline</button>`:(t.status==='Available'&&!mine&&(role==='driver'||role==='truck_owner')?`<button class="btn primary" onclick="requestTrailerRental('${t.id}')">Request Trailer</button>`:(requested?`<span class="pill warn">${t.status}</span>`:(mine?(t.status==='Pending Admin Approval'?'<span class="pill warn">Waiting Admin Approval</span>':'<span class="pill good">Your Trailer</span>'):'-')));return `<tr><td>${t.ownerName||''}<br><span class="small">${t.ownerEmail||''}</span></td><td>${t.trailerType||''}<br><span class="small">${t.description||''}</span></td><td>${t.location||''}</td><td>${t.price||''}<br><span class="small">Deposit: ${t.deposit||''}</span></td><td>${t.availability||''}</td><td><span class="pill ${t.status==='Available'?'good':t.status==='Rented'?'bad':'warn'}">${t.status||'Available'}</span></td><td>${action}</td></tr>`}).join('')||'<tr><td colspan="7">No trailer rentals posted yet.</td></tr>'}</table>`;

 let summary=`<div class="grid"><div class="card"><p>Total Truck Records</p><div class="stat">${myTruckRecords.length}</div></div><div class="card"><p>Open Driver Jobs</p><div class="stat">${availableJobs.length}</div></div><div class="card"><p>Applications</p><div class="stat">${myApps.length}</div></div><div class="card"><p>Trailer Rentals</p><div class="stat">${trailerRentals.length}</div></div><div class="card"><p>Truck Profit</p><div class="stat">${money(myTruckRecords.reduce((a,t)=>a+(+t.income||0)-(+t.expenses||0),0))}</div></div></div>`;
 let topMatchPanels=(role==='driver')?jobsTable:(role==='truck_owner')?appsTable+driverProfilesTable:driverProfilesTable+jobsTable;
 $('truck').innerHTML=`<h2>🚚 Trucking Connect</h2>${role==='truck_owner'?ownerQuick:''}${role==='driver'?driverQuick:''}${topMatchPanels}${summary}${(role==='truck_owner'||role==='admin')?ownerPanel:''}${(role==='driver'||role==='admin')?driverPanel:''}${role==='truck_owner'?'':appsTable}${trailerTable}${recordsTable}`;
 setTimeout(showTruckExpiryWarnings,80);
}
function addTruck(){if(!requireLogin())return;if(currentUser.role!=='truck_owner'&&currentUser.role!=='admin')return alert('Only truck owners or admin can save truck owner records.');let truck=($('tTruck').value||'').trim();if(!truck)return alert('Truck / Unit is required.');let ins=$('tInsurance').value, reg=$('tRegistration').value;let warnings=[];[['Insurance',ins],['Registration',reg]].forEach(([label,val])=>{let n=daysUntil(val);if(n!==null&&n<0)warnings.push(label+' is expired.');else if(n!==null&&n<=30)warnings.push(label+' will expire in '+n+' days.');});if(warnings.length)alert(warnings.join('\n'));data.trucks.unshift({id:'TRK'+Date.now().toString().slice(-6),ownerName:currentUser.name,ownerEmail:currentUser.email,ownerPhone:currentUser.phone||'',truck,plate:($('tPlate').value||'').trim(),vin:($('tVin').value||'').trim(),driver:($('tDriver').value||'Unassigned').trim(),driverEmail:cleanEmail($('tDriverEmail').value),insurance:ins,registration:reg,maintenance:($('tMaintenance').value||'').trim(),status:$('tStatus').value,income:+$('tIncome').value||0,expenses:+$('tExpenses').value||0,mileage:+$('tMileage').value||0,createdAt:new Date().toLocaleString()});addNote(currentUser.email,'Truck record saved for '+truck+'.');save()}
async function postTruckJob(){if(!requireLogin())return;if(currentUser.role!=='truck_owner'&&currentUser.role!=='admin')return alert('Only truck owners can post driver hiring jobs.');let title=($('jobTitle').value||'').trim(),route=($('jobRoute').value||'').trim(),pay=($('jobPay').value||'').trim();if(!title||!route||!pay)return alert('Job title, route/location, and pay are required.');let status=currentUser.role==='admin'?'Open':'Pending Admin Approval';let job={id:'TJ'+Date.now().toString().slice(-6),ownerName:currentUser.name,ownerEmail:currentUser.email,ownerPhone:currentUser.phone||'',title,route,pay,schedule:($('jobSchedule').value||'').trim(),requirements:($('jobReq').value||'').trim(),truckDetails:($('jobTruck').value||'').trim(),status,createdAt:new Date().toLocaleString()};let res=await syncTruckJobToSupabase(job);if(res.error)return alert('Job was not posted to the shared dashboard. Please run the trucking Supabase migration, then try again. '+res.error.message);data.truckJobs.unshift(job);if(currentUser.role==='admin'){addNote(currentUser.email,'Truck driver hiring job published: '+title+'.');persistOnly();alert('Job published. Drivers can now see and apply.');truck();return;}addNote(currentUser.email,'Driver hiring job submitted: '+title+'. Admin approval is required before it is published.');addNote('admin.habeshaconnect@gmail.com','Truck owner job waiting for approval: '+title+' by '+currentUser.name+'.');sendAdminEmailNotice('Truck owner posted a job','A truck owner posted a driver hiring job for admin approval.',{Owner:currentUser.name,Email:currentUser.email,Job:title,Route:route,Pay:pay},'admin');persistOnly();alert('Job submitted. Admin approval is required before drivers can see and apply.');truck()}

async function postTrailerRental(){if(!requireLogin())return;if(currentUser.role!=='truck_owner'&&currentUser.role!=='admin')return alert('Only truck owners can post trailer rentals.');let trailerType=($('trType').value||'').trim(),location=($('trLocation').value||'').trim(),price=($('trPrice').value||'').trim();if(!trailerType||!location||!price)return alert('Trailer type, location, and price are required.');let item={id:'TLR'+Date.now().toString().slice(-6),ownerName:currentUser.name,ownerEmail:currentUser.email,ownerPhone:currentUser.phone||'',trailerType,location,price,deposit:($('trDeposit').value||'').trim(),availability:($('trAvailability').value||'').trim(),description:($('trDescription').value||'').trim(),status:'Pending Admin Approval',renterName:'',renterEmail:'',renterPhone:'',createdAt:new Date().toLocaleString()};let res=await syncTrailerRentalToSupabase(item);if(res.error)return alert('Trailer rental was not saved to Supabase. Please run the trailer rent SQL first, then try again. '+res.error.message);if(res.data){item.dbId=res.data.id;item.id=item.local_ref||item.id;}data.trailerRentals.unshift(item);addNote(currentUser.email,'Trailer rental submitted for admin approval: '+trailerType+'.');sendAdminEmailNotice('Trailer listing waiting for approval','A truck owner posted a trailer for rent. Admin approval is required before it becomes available.',{Owner:currentUser.name,Email:currentUser.email,Trailer:trailerType,Location:location,Price:price,Status:'Pending Admin Approval'},'admin');save();alert('Trailer rental submitted. Admin approval is required before drivers and truck owners can request it.');truck()}
async function requestTrailerRental(id){if(!requireLogin())return;if(currentUser.role!=='driver'&&currentUser.role!=='truck_owner')return alert('Only truck drivers or truck owners can request trailer rentals.');let item=(data.trailerRentals||[]).find(x=>x.id===id);if(!item)return alert('Trailer rental not found.');if(item.ownerEmail===currentUser.email)return alert('You cannot request your own trailer.');if(item.status!=='Available')return alert('This trailer is not available.');let old={...item};item.status='Pending Admin Approval';item.renterName=currentUser.name||'';item.renterEmail=currentUser.email;item.renterPhone=currentUser.phone||'';let res=await updateTrailerRentalDb(item,{status:'Pending Admin Approval',renter_name:item.renterName,renter_email:item.renterEmail,renter_phone:item.renterPhone});if(res.error){Object.assign(item,old);return alert('Could not request trailer rental: '+res.error.message);}sendAdminEmailNotice('Trailer rental request waiting for approval','A truck owner/driver requested a trailer rental. Admin approval is required before it goes to the trailer owner.',{Requester:item.renterName,RequesterEmail:item.renterEmail,Trailer:item.trailerType,Owner:item.ownerName,OwnerEmail:item.ownerEmail,Location:item.location,Price:item.price},'admin');addNote(currentUser.email,'Trailer rental request submitted for admin approval: '+item.trailerType+'.');sendEmailNotice({to:item.renterEmail,name:item.renterName,subject:'Trailer request submitted',summary:'Your trailer rental request was submitted and is waiting for admin approval.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Trailer:item.trailerType,Status:'Pending Admin Approval'}});save();alert('Trailer request submitted. Admin approval is required before the owner reviews it.');truck()}
async function approveTrailerRental(id){if(!requireLogin())return;let item=(data.trailerRentals||[]).find(x=>x.id===id);if(!item)return alert('Trailer rental not found.');if(currentUser.role!=='admin'&&item.ownerEmail!==currentUser.email)return alert('Only the trailer owner can accept this request.');if(currentUser.role!=='admin'&&item.status!=='Pending Owner Review')return alert('This trailer request is waiting for admin approval.');let old={...item};item.status='Pending Final Admin Approval';item.ownerAcceptedAt=new Date().toLocaleString();let res=await updateTrailerRentalDb(item,{status:'Pending Final Admin Approval'});if(res.error){Object.assign(item,old);return alert('Could not accept trailer rental: '+res.error.message);}sendAdminEmailNotice('Trailer owner accepted request','The trailer owner accepted a rental request. Final admin approval is needed so the requester can complete the rent.',{Owner:item.ownerName,OwnerEmail:item.ownerEmail,Requester:item.renterName,RequesterEmail:item.renterEmail,Trailer:item.trailerType,Location:item.location,Price:item.price},'admin');sendEmailNotice({to:item.renterEmail,name:item.renterName,subject:'Trailer owner accepted your request',summary:'The trailer owner accepted your request. Admin final approval is pending before you complete the rent.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Trailer:item.trailerType,Owner:item.ownerName,Status:'Pending Final Admin Approval'}});save();alert('Request accepted. Admin received final approval email.');truck()}
async function declineTrailerRental(id){if(!requireLogin())return;let item=(data.trailerRentals||[]).find(x=>x.id===id);if(!item)return alert('Trailer rental not found.');if(currentUser.role!=='admin'&&item.ownerEmail!==currentUser.email)return alert('Only the trailer owner can decline this request.');if(!item.renterEmail)return alert('This trailer has no active request to decline.');let renterEmail=item.renterEmail,renterName=item.renterName,trailerType=item.trailerType;item.status='Available';item.renterName='';item.renterEmail='';item.renterPhone='';let res=await updateTrailerRentalDb(item,{status:'Available',renter_name:'',renter_email:'',renter_phone:'',rented_at:null});if(res.error)return alert('Could not decline trailer rental: '+res.error.message);if(renterEmail)sendEmailNotice({to:renterEmail,name:renterName,subject:'Trailer Rental Request Declined',summary:'Your trailer rental request was declined by the trailer owner.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Trailer:trailerType,Status:'Declined'}});sendAdminEmailNotice('Trailer owner declined request','A trailer owner declined a trailer rental request.',{Owner:item.ownerName,Requester:renterName,RequesterEmail:renterEmail,Trailer:trailerType},'admin');save();alert('Trailer rental request declined.');truck()}
async function deleteTrailerRental(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');if(!confirm('Delete this trailer rental?'))return;let item=(data.trailerRentals||[]).find(x=>x.id===id);let res=await deleteTrailerRentalDb(item);if(res.error)return alert('Could not delete trailer rental: '+res.error.message);data.trailerRentals=(data.trailerRentals||[]).filter(x=>x.id!==id);persistOnly();if(currentPage==='admin')adminSuccess();else truck();}
async function saveDriverProfile(){if(!requireLogin())return;if(currentUser.role!=='driver'&&currentUser.role!=='admin')return alert('Only drivers or admin can save a driver job profile.');let profile={driverName:($('dpName').value||currentUser.name).trim(),driverEmail:currentUser.email,name:($('dpName').value||currentUser.name).trim(),phone:($('dpPhone').value||currentUser.phone||'').trim(),city:($('dpCity').value||currentUser.city||'').trim(),license:($('dpLicense').value||'').trim(),experience:($('dpExperience').value||'').trim(),looking:$('dpLooking').value,notes:($('dpNotes').value||'').trim(),updatedAt:new Date().toLocaleString()};if(!profile.name||!profile.phone||!profile.license||!profile.experience)return alert('Please complete your name, phone, license, and experience before saving.');let res=await syncTruckDriverProfileToSupabase(profile);if(res.error)return alert('Driver profile was not saved to the shared dashboard. Please run the trucking Supabase migration, then try again. '+res.error.message);let old=(data.truckDriverProfiles||[]).findIndex(p=>p.driverEmail===currentUser.email);if(old>=0)data.truckDriverProfiles[old]=profile;else data.truckDriverProfiles.unshift(profile);addNote(currentUser.email,'Driver job profile saved.');save();alert('Driver profile saved. You can apply now.');truck()}
async function applyTruckJob(id){if(!requireLogin())return;if(currentUser.role!=='driver')return alert('Only truck drivers can apply for truck driving jobs.');let j=(data.truckJobs||[]).find(x=>x.id===id);if(!j)return alert('Job not found.');if(j.status!=='Open')return alert('This job is waiting for admin approval or is closed.');if((data.truckApplications||[]).some(a=>a.jobId===id&&a.driverEmail===currentUser.email))return alert('You already applied for this job.');let p=(data.truckDriverProfiles||[]).find(x=>x.driverEmail===currentUser.email)||{};if(!p.license||!p.experience){alert('Please complete your Driver Job Profile before applying.');return;}let app={id:'TA'+Date.now().toString().slice(-6),jobId:j.id,jobDbId:j.dbId||'',jobTitle:j.title,ownerName:j.ownerName,ownerEmail:j.ownerEmail,driverName:p.name||currentUser.name,driverEmail:currentUser.email,driverPhone:p.phone||currentUser.phone||'',city:p.city||'',license:p.license||'',experience:p.experience||'',looking:p.looking||'',notes:p.notes||'',status:'Pending Admin Approval',createdAt:new Date().toLocaleString()};let res=await syncTruckApplicationToSupabase(app,j);if(res.error)return alert('Application was not sent to Admin. Please run the trucking Supabase migration, then try again. '+res.error.message);data.truckApplications.unshift(app);addNote('admin.habeshaconnect@gmail.com','Driver application waiting for approval: '+(p.name||currentUser.name)+' applied for '+j.title+'.');sendAdminEmailNotice('New Truck Driver Application','A truck driver submitted a job application for admin approval.',{Driver:p.name||currentUser.name,Email:currentUser.email,Job:j.title,Owner:j.ownerName,OwnerEmail:j.ownerEmail},'admin');if(j.ownerEmail){sendEmailNotice({to:j.ownerEmail,name:j.ownerName,subject:'A Driver Applied for Your Job',summary:'A truck driver has applied for your job posting. Admin approval is still required before final hiring.',buttonText:'Open Truck Owner Dashboard',page:'truck',details:{Driver:p.name||currentUser.name,DriverEmail:currentUser.email,Job:j.title,Route:j.route||'',License:p.license||'',Experience:p.experience||''}});}addNote(currentUser.email,'Application submitted for '+j.title+'. Admin approval is required before the owner can review it.');save();alert('Applied. Admin approval is required before the truck owner can see and review your application.');truck()}
async function approveTruckApp(id){
 let a=(data.truckApplications||[]).find(x=>x.id===id);
 if(!a)return alert('Application not found.');
 if(!currentUser)return alert('Please sign in.');
 let now=new Date().toISOString();
 if(currentUser.role==='admin'){
   if(a.status!=='Pending Final Admin Approval')return alert('Final approval is available only after the truck owner accepts the driver.');
   let oldApp={...a};
   a.status='Hired';a.approvedAt=new Date().toLocaleString();a.hiredAt=new Date().toLocaleString();
   let r=await updateTruckApplicationDb(a,{status:'Hired',approved_at:now,hired_at:now});
   if(r.error){Object.assign(a,oldApp);return alert('Could not final approve hire in Supabase: '+r.error.message);}
   let j=(data.truckJobs||[]).find(x=>x.id===a.jobId||x.dbId===a.jobDbId);
   let oldJob=j?{...j}:null;
   if(j){
     j.status='Hired';j.hiredDriverName=a.driverName||'';j.hiredDriverEmail=a.driverEmail||'';j.hiredAt=new Date().toLocaleString();
     let jr=await updateTruckJobDb(j,{status:'Hired',hired_driver_name:a.driverName||'',hired_driver_email:a.driverEmail||'',hired_at:now});
     if(jr.error){Object.assign(a,oldApp);if(oldJob)Object.assign(j,oldJob);return alert('Hire approved, but job could not be marked Hired in Supabase: '+jr.error.message);}
   }
   for(let other of (data.truckApplications||[])){
     if((other.jobId===a.jobId||other.jobDbId===a.jobDbId)&&other.id!==a.id&&!['Declined','Closed - Position Filled'].includes(other.status)){
       other.status='Closed - Position Filled';other.closedAt=new Date().toLocaleString();
       await updateTruckApplicationDb(other,{status:'Closed - Position Filled',closed_at:now});
     }
   }
   addNote(a.driverEmail,'Admin final approved your truck driving hire for '+a.jobTitle+'.');
   addNote(a.ownerEmail,'Admin final approved your truck driver hire: '+a.driverName+' for '+a.jobTitle+'.');
   sendEmailNotice({to:a.driverEmail,name:a.driverName,subject:'Truck job hire approved',summary:'Admin final approved your truck driving hire.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Job:a.jobTitle,Status:'Hired'}});
   sendEmailNotice({to:a.ownerEmail,name:a.ownerName,subject:'Truck driver hire approved',summary:'Admin final approved your truck driver hire.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Driver:a.driverName,Job:a.jobTitle,Status:'Hired'}});
   persistOnly();adminSuccess();alert('Final approved. Driver is now hired.');return;
 }
 if(a.ownerEmail!==currentUser.email)return alert('Only the truck owner can accept this application.');
 if(a.status!=='Pending Owner Review')return alert('This application is not ready for owner review. Admin must approve it first.');
 let old={...a};
 a.status='Pending Final Admin Approval';a.ownerAcceptedAt=new Date().toLocaleString();
 let r=await updateTruckApplicationDb(a,{status:'Pending Final Admin Approval',approved_at:now});
 if(r.error){Object.assign(a,old);return alert('Could not send owner acceptance to admin: '+r.error.message);}
 addNote(a.driverEmail,'Truck owner accepted your application for '+a.jobTitle+'. Waiting for final admin approval.');
 addNote('admin.habeshaconnect@gmail.com','Truck owner accepted driver and needs final approval: '+a.driverName+' for '+a.jobTitle+'.');
 sendAdminEmailNotice('Truck driver hire waiting final approval','A truck owner accepted a driver application. Admin final approval is required before the driver is marked hired.',{Owner:a.ownerName,OwnerEmail:a.ownerEmail,Driver:a.driverName,DriverEmail:a.driverEmail,Job:a.jobTitle},'admin');
 sendEmailNotice({to:a.driverEmail,name:a.driverName,subject:'Truck owner accepted your application',summary:'The truck owner accepted your application. Admin final approval is now pending.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Job:a.jobTitle,Owner:a.ownerName,Status:'Pending Final Admin Approval'}});
 persistOnly();truck();alert('Driver accepted. Admin final approval is now required.');
}
async function declineTruckApp(id){let a=(data.truckApplications||[]).find(x=>x.id===id);if(!a)return alert('Application not found.');if(currentUser.role!=='admin'&&a.ownerEmail!==currentUser.email)return alert('Only the truck owner can decline this application.');let old={...a};a.status='Declined';a.declinedAt=new Date().toLocaleString();let r=await updateTruckApplicationDb(a,{status:'Declined',closed_at:new Date().toISOString()});if(r.error){Object.assign(a,old);return alert('Could not decline application in Supabase: '+r.error.message);}addNote(a.driverEmail,'Your truck driving application for '+a.jobTitle+' was declined.');sendEmailNotice({to:a.driverEmail,name:a.driverName,subject:'Truck application rejected',summary:'Your truck driving application was declined.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Job:a.jobTitle,Status:'Declined'}});persistOnly();if(currentUser.role==='admin')adminSuccess();else truck();}

/* V7.7.3 Home Services workflow: provider post -> admin approval -> customer request with calendar/time -> admin approval -> provider accept/decline */
const HOME_SERVICE_CATEGORIES=['House Cleaning','Moving Help','General Repair','Plumbing','Electrical','HVAC','Painting','Lawn Care','Handyman','Appliance Repair','Roofing','Flooring','Carpentry','Pest Control','Landscaping','Junk Removal','Home Repair','Snow Removal','Window Cleaning','Furniture Assembly'];
function mapHomeServicePost(row){return {dbId:row.id,id:row.local_ref||row.id,providerName:row.provider_name||'',providerEmail:row.provider_email||'',providerPhone:row.provider_phone||'',category:row.category||'',title:row.title||'',city:row.city||'',price:row.price||'',description:row.description||'',status:row.status||'Pending Admin Approval',createdAt:row.created_at?new Date(row.created_at).toLocaleString():'',approvedAt:row.approved_at?new Date(row.approved_at).toLocaleString():'',declinedAt:row.declined_at?new Date(row.declined_at).toLocaleString():''};}
function mapHomeServiceRequest(row){return {dbId:row.id,id:row.local_ref||row.id,serviceId:row.service_id||'',serviceLocalRef:row.service_local_ref||'',serviceTitle:row.service_title||row.service_name||'',providerName:row.provider_name||'',providerEmail:row.provider_email||'',customerName:row.customer_name||'',customerEmail:row.customer_email||'',customerPhone:row.customer_phone||'',city:row.city||row.address_city||'',preferredDate:row.preferred_date||'',preferredTime:row.preferred_time||'',details:row.job_description||row.details||row.notes||'',status:row.status||'Pending Admin Approval',createdAt:row.created_at?new Date(row.created_at).toLocaleString():'',adminApprovedAt:row.admin_approved_at?new Date(row.admin_approved_at).toLocaleString():'',providerRespondedAt:row.provider_responded_at?new Date(row.provider_responded_at).toLocaleString():''};}
async function loadSupabaseHomeServices(){if(!authReady())return;let posts=await hcSupabase.from('home_service_posts').select('*').order('created_at',{ascending:false});if(!posts.error)data.homeServicePosts=(posts.data||[]).map(mapHomeServicePost);else console.warn('Home service posts load error',posts.error);let reqs=await hcSupabase.from('home_service_requests').select('*').order('created_at',{ascending:false});if(!reqs.error)data.homeServiceRequests=(reqs.data||[]).map(mapHomeServiceRequest);else console.warn('Home service requests load error',reqs.error);persistOnly();}
async function syncHomeServicePostToSupabase(item){if(!authReady())return {error:null,data:null};let payload={local_ref:item.id,provider_name:item.providerName,provider_email:item.providerEmail,provider_phone:item.providerPhone,category:item.category,title:item.title,city:item.city,price:item.price,description:item.description,status:item.status};let res=await hcSupabase.from('home_service_posts').insert(payload).select().single();if(!res.error&&res.data)item.dbId=res.data.id;return res;}
async function syncHomeServiceRequestToSupabase(req,service){if(!authReady())return {error:null,data:null};let payload={local_ref:req.id,service_id:(service&&service.dbId)||null,service_local_ref:(service&&service.id)||req.serviceLocalRef,service_title:req.serviceTitle,provider_name:req.providerName,provider_email:req.providerEmail,customer_name:req.customerName,customer_email:req.customerEmail,customer_phone:req.customerPhone,city:req.city,preferred_date:req.preferredDate,preferred_time:req.preferredTime||'',job_description:req.details||'',details:req.details||'',notes:req.details||'',status:req.status};let res=await hcSupabase.from('home_service_requests').insert(payload).select().single();if(res.error){let msg=String(res.error.message||'');let cleaned={...payload};if(msg.includes("'details' column"))delete cleaned.details;if(msg.includes("'notes' column"))delete cleaned.notes;if(msg.includes("'preferred_time' column"))delete cleaned.preferred_time;if(msg.includes("'city' column"))delete cleaned.city;if(msg.includes("'service_id' column"))delete cleaned.service_id;if(msg.includes("'service_local_ref' column"))delete cleaned.service_local_ref;if(msg.includes("'service_title' column"))delete cleaned.service_title;if(msg.includes("'job_description' column"))delete cleaned.job_description;if(Object.keys(cleaned).length!==Object.keys(payload).length){res=await hcSupabase.from('home_service_requests').insert(cleaned).select().single();}}
 if(!res.error&&res.data)req.dbId=res.data.id;return res;}
async function updateHomeServicePostDb(item,fields){if(!authReady()||!item)return {error:null};let q=hcSupabase.from('home_service_posts').update(fields);return item.dbId?await q.eq('id',item.dbId):await q.eq('local_ref',item.id);}
async function updateHomeServiceRequestDb(req,fields){if(!authReady()||!req)return {error:null};let q=hcSupabase.from('home_service_requests').update(fields);return req.dbId?await q.eq('id',req.dbId):await q.eq('local_ref',req.id);}
function homeServiceStatusBadge(s){return `<span class="pill ${s==='Approved'||s==='Provider Accepted'?'good':s==='Declined'||s==='Provider Declined'?'bad':'warn'}">${s}</span>`}
function homeServices(){
 if(!requireLogin())return;
 let role=currentUser.role;
 let canPost=role==='service_provider'||role==='business_owner'||role==='admin';
 let canRequest=role!=='service_provider';
 let posts=data.homeServicePosts||[], reqs=data.homeServiceRequests||[];
 let approved=posts.filter(p=>p.status==='Approved'||p.status==='Available'||role==='admin'||p.providerEmail===currentUser.email);
 let myPosts=posts.filter(p=>p.providerEmail===currentUser.email||role==='admin');
 let myReqs=reqs.filter(r=>r.customerEmail===currentUser.email||r.providerEmail===currentUser.email||role==='admin');
 let providerForm=canPost?`<div class="card"><h3>Post Home Service</h3><p class="muted">Choose the exact service you provide. Your service goes to admin first. After admin approves it, customers can request it.</p><label>Service Type</label><select id="hsCategory">${HOME_SERVICE_CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select><label>Service Title</label><input id="hsTitle" placeholder="Example: Deep house cleaning, appliance repair"><label>City / Area You Serve</label><input id="hsCity" placeholder="Enter any city or area you serve"><label>Price</label><input id="hsPrice" placeholder="Example: $80, hourly, estimate"><label>Description</label><textarea id="hsDescription" rows="4" placeholder="Describe your service, availability, experience, and what the customer should know"></textarea><button class="btn primary" onclick="postHomeService()">Submit Service for Admin Approval</button></div>`:'';
 let customerBox=canRequest?`<div class="card"><h3>Available Home Services</h3><p class="muted">Choose a listed provider below and request service. You can enter any city or address area. Admin reviews the request before sending it to the service provider.</p><p class="small"><b>Service list:</b> ${HOME_SERVICE_CATEGORIES.join(', ')}</p></div>`:'';
 let activeService=(data.homeServicePosts||[]).find(p=>p.id===activeHomeServiceRequestId);
 let requestForm=(canRequest&&activeService)?`<div class="card" id="homeServiceRequestForm"><h3>Request Home Service</h3><p class="muted"><b>Service:</b> ${activeService.title} • ${activeService.category}</p><div class="grid two"><div><label>Phone Number</label><input id="hsReqPhone" value="${currentUser.phone||''}" placeholder="404-555-1234"></div><div><label>City / Address Area</label><input id="hsReqCity" placeholder="Enter any city or address area"></div><div><label>Preferred Date</label><input id="hsReqDate" type="date"></div><div><label>Preferred Time</label><input id="hsReqTime" type="time"></div></div><label>Describe what you need</label><textarea id="hsReqDetails" rows="4" placeholder="Tell the provider what work you need done"></textarea><button class="btn primary" onclick="submitHomeServiceRequest()">Review Request</button> <button class="btn ghost" onclick="cancelHomeServiceRequest()">Cancel</button><p class="small">After you click Review Request, you will see a summary. If something is wrong, cancel and revise before submitting.</p></div>`:'';
 let serviceRows=approved.map(p=>`<tr><td>${p.category}</td><td>${p.title}<br><span class="small">${p.description||''}</span></td><td>${p.city||''}</td><td>${p.price||''}</td><td>${p.providerName||''}<br><span class="small">${p.providerEmail||''}</span></td><td>${homeServiceStatusBadge(p.status)}</td><td>${canRequest&&p.status==='Approved'&&p.providerEmail!==currentUser.email?`<button class="btn primary" onclick="requestHomeService('${p.id}')">Request Service</button>`:'-'}</td></tr>`).join('')||'<tr><td colspan="7">No approved home services yet.</td></tr>';
 let postRows=myPosts.map(p=>`<tr><td>${p.title}</td><td>${p.category}</td><td>${p.city||''}</td><td>${p.price||''}</td><td>${homeServiceStatusBadge(p.status)}</td><td>${p.createdAt||''}</td></tr>`).join('')||'<tr><td colspan="6">No service posts yet.</td></tr>';
 let reqRows=myReqs.map(r=>{let canProviderAnswer=(r.providerEmail===currentUser.email&&r.status==='Pending Provider Review');return `<tr><td>${r.serviceTitle}</td><td>${r.customerName}<br><span class="small">${r.customerEmail}</span></td><td>${r.customerPhone||''}</td><td>${r.city||''}</td><td>${r.preferredDate||''} ${r.preferredTime||''}</td><td>${r.details||''}</td><td>${homeServiceStatusBadge(r.status)}</td><td>${canProviderAnswer?`<button class="btn primary" onclick="providerAcceptHomeServiceRequest('${r.id}')">Accept</button> <button class="btn bad" onclick="providerDeclineHomeServiceRequest('${r.id}')">Decline</button>`:'-'}</td></tr>`}).join('')||'<tr><td colspan="8">No home service requests yet.</td></tr>';
 $('home_services').innerHTML=`<h2>🛠️ Home Services</h2><div class="hero"><h1>Home Services</h1><p><b>${HOME_SERVICE_CATEGORIES.join(', ')}.</b></p><p class="muted">Flow: provider posts service → admin approves → customer requests with calendar/time → customer reviews summary → admin approves → provider accepts/declines.</p></div><div class="grid">${providerForm}${customerBox}${requestForm}</div><h3>Approved Services</h3><table><tr><th>Category</th><th>Service</th><th>City</th><th>Price</th><th>Provider</th><th>Status</th><th>Action</th></tr>${serviceRows}</table><h3>My Service Posts</h3><table><tr><th>Service</th><th>Category</th><th>City</th><th>Price</th><th>Status</th><th>Created</th></tr>${postRows}</table><h3>My Home Service Requests</h3><table><tr><th>Service</th><th>Customer</th><th>Phone</th><th>City</th><th>Date / Time</th><th>Details</th><th>Status</th><th>Action</th></tr>${reqRows}</table>`;
}
async function postHomeService(){if(!requireLogin())return;if(currentUser.role!=='service_provider'&&currentUser.role!=='business_owner'&&currentUser.role!=='admin')return alert('Only service providers, business owners, or admin can post home services. Add Home Service Provider in My Services first.');let title=($('hsTitle').value||'').trim(),category=$('hsCategory').value,city=($('hsCity').value||'').trim(),price=($('hsPrice').value||'').trim(),description=($('hsDescription').value||'').trim();if(!title||!city||!price||!description)return alert('Please complete service type, title, city, price, and description.');let item={id:'HS'+Date.now().toString().slice(-6),providerName:currentUser.name,providerEmail:currentUser.email,providerPhone:currentUser.phone||'',category,title,city,price,description,status:currentUser.role==='admin'?'Approved':'Pending Admin Approval',createdAt:new Date().toLocaleString()};let res=await syncHomeServicePostToSupabase(item);if(res.error)return alert('Home service was not saved to Supabase. Please run the Home Services SQL, then try again. '+res.error.message);data.homeServicePosts.unshift(item);addNote(currentUser.email,currentUser.role==='admin'?'Home service posted and approved: '+title+'.':'Home service submitted for admin approval: '+title+'.');if(currentUser.role!=='admin')sendAdminEmailNotice('Home service waiting for approval','A service provider submitted a new home service for admin approval.',{Provider:currentUser.name,Email:currentUser.email,Service:title,Category:category,City:city,Price:price},'admin');persistOnly();alert(currentUser.role==='admin'?'Home service posted and approved.':'Home service submitted. Admin approval is required before customers can request it.');homeServices();}
let activeHomeServiceRequestId='';
function requestHomeService(id){if(!requireLogin())return;let svc=(data.homeServicePosts||[]).find(p=>p.id===id);if(!svc)return alert('Service not found.');if(svc.status!=='Approved'&&svc.status!=='Available')return alert('This service is not approved yet.');if(svc.providerEmail===currentUser.email)return alert('You cannot request your own service.');activeHomeServiceRequestId=id;homeServices();setTimeout(()=>{let el=$('homeServiceRequestForm');if(el)el.scrollIntoView({behavior:'smooth',block:'start'});},50);}
function cancelHomeServiceRequest(){activeHomeServiceRequestId='';homeServices();}
async function submitHomeServiceRequest(){
 if(!requireLogin())return;
 let svc=(data.homeServicePosts||[]).find(p=>p.id===activeHomeServiceRequestId);
 if(!svc)return alert('Service not found. Please choose the service again.');
 let phone=($('hsReqPhone')?.value||'').trim();
 let city=($('hsReqCity')?.value||'').trim();
 let date=($('hsReqDate')?.value||'').trim();
 let time=($('hsReqTime')?.value||'').trim();
 let details=($('hsReqDetails')?.value||'').trim();
 if(!phone||!city||!date||!time||!details)return alert('Please complete phone, city/address area, preferred date, preferred time, and request details.');
 let preferredDate=date+' '+time;
 let summary='Please review your home service request before submitting:\n\nService: '+svc.title+'\nCategory: '+svc.category+'\nProvider: '+(svc.providerName||'')+'\nPhone: '+phone+'\nCity / Area: '+city+'\nPreferred Date: '+date+'\nPreferred Time: '+time+'\nDetails: '+details+'\n\nClick OK to submit this request, or Cancel to revise it.';
 if(!confirm(summary))return;
 let req={id:'HSR'+Date.now().toString().slice(-6),serviceId:svc.dbId||'',serviceLocalRef:svc.id,serviceTitle:svc.title,providerName:svc.providerName,providerEmail:svc.providerEmail,customerName:currentUser.name,customerEmail:currentUser.email,customerPhone:phone,city,preferredDate,preferredTime:time,details,status:'Pending Admin Approval',createdAt:new Date().toLocaleString()};
 let res=await syncHomeServiceRequestToSupabase(req,svc);
 if(res.error)return alert('Request was not saved to Supabase. Please run the Home Services SQL, then try again. '+res.error.message);
 data.homeServiceRequests.unshift(req);
 addNote(currentUser.email,'Home service request sent for admin approval: '+svc.title+'.');
 sendAdminEmailNotice('Home service request waiting for approval','A customer requested a home service. Admin approval is required before the provider receives it.',{Customer:currentUser.name,CustomerEmail:currentUser.email,Provider:svc.providerName,ProviderEmail:svc.providerEmail,Service:svc.title,City:city,PreferredDate:preferredDate,PreferredTime:time,Details:details},'admin');
 activeHomeServiceRequestId='';
 persistOnly();
 alert('Request sent. Admin approval is required before the provider receives it.');
 homeServices();
}
async function adminApproveHomeServicePost(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let p=(data.homeServicePosts||[]).find(x=>x.id===id);if(!p)return alert('Service not found.');if(p.status!=='Pending Admin Approval')return alert('This service is not waiting for admin approval.');p.status='Approved';p.approvedAt=new Date().toLocaleString();let r=await updateHomeServicePostDb(p,{status:'Approved',approved_at:new Date().toISOString()});if(r.error)return alert('Could not approve service: '+r.error.message);addNote(p.providerEmail,'Your home service was approved: '+p.title+'.');sendEmailNotice({to:p.providerEmail,name:p.providerName,subject:'Home service approved',summary:'Your home service post was approved and customers can now request it.',buttonText:'Open Home Services',page:'home_services',details:{Service:p.title,Status:'Approved'}});persistOnly();adminSuccess();}
async function adminDeclineHomeServicePost(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let p=(data.homeServicePosts||[]).find(x=>x.id===id);if(!p)return alert('Service not found.');if(p.status!=='Pending Admin Approval')return alert('This service is not waiting for admin approval.');p.status='Declined';p.declinedAt=new Date().toLocaleString();let r=await updateHomeServicePostDb(p,{status:'Declined',declined_at:new Date().toISOString()});if(r.error)return alert('Could not decline service: '+r.error.message);sendEmailNotice({to:p.providerEmail,name:p.providerName,subject:'Home service declined',summary:'Your home service post was declined by admin.',buttonText:'Open Home Services',page:'home_services',details:{Service:p.title,Status:'Declined'}});persistOnly();adminSuccess();}
async function adminApproveHomeServiceRequest(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let r=(data.homeServiceRequests||[]).find(x=>x.id===id);if(!r)return alert('Request not found.');if(r.status!=='Pending Admin Approval')return alert('This request is not waiting for admin approval.');r.status='Pending Provider Review';r.adminApprovedAt=new Date().toLocaleString();let res=await updateHomeServiceRequestDb(r,{status:'Pending Provider Review',admin_approved_at:new Date().toISOString()});if(res.error)return alert('Could not approve request: '+res.error.message);addNote(r.providerEmail,'Home service request approved by admin for your review: '+r.serviceTitle+'.');sendEmailNotice({to:r.providerEmail,name:r.providerName,subject:'New approved home service request',summary:'Admin approved a customer request and sent it to you for final review.',buttonText:'Open Home Services',page:'home_services',details:{Customer:r.customerName,CustomerEmail:r.customerEmail,Phone:r.customerPhone,Service:r.serviceTitle,City:r.city,PreferredDate:r.preferredDate,PreferredTime:r.preferredTime||'',Details:r.details}});sendEmailNotice({to:r.customerEmail,name:r.customerName,subject:'Home service request approved by admin',summary:'Your request was approved by admin and sent to the service provider.',buttonText:'Open Home Services',page:'home_services',details:{Service:r.serviceTitle,Provider:r.providerName,Status:'Pending Provider Review'}});persistOnly();adminSuccess();}
async function adminDeclineHomeServiceRequest(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let r=(data.homeServiceRequests||[]).find(x=>x.id===id);if(!r)return alert('Request not found.');if(r.status!=='Pending Admin Approval')return alert('This request is not waiting for admin approval.');r.status='Declined';let res=await updateHomeServiceRequestDb(r,{status:'Declined'});if(res.error)return alert('Could not decline request: '+res.error.message);sendEmailNotice({to:r.customerEmail,name:r.customerName,subject:'Home service request declined',summary:'Your home service request was declined by admin.',buttonText:'Open Home Services',page:'home_services',details:{Service:r.serviceTitle,Status:'Declined'}});persistOnly();adminSuccess();}
async function providerAcceptHomeServiceRequest(id){if(!requireLogin())return;let r=(data.homeServiceRequests||[]).find(x=>x.id===id);if(!r)return alert('Request not found.');if(r.providerEmail!==currentUser.email&&currentUser.role!=='admin')return alert('Only the provider can accept this request.');if(r.status!=='Pending Provider Review')return alert('This request is not waiting for provider review.');r.status='Provider Accepted';r.providerRespondedAt=new Date().toLocaleString();let res=await updateHomeServiceRequestDb(r,{status:'Provider Accepted',provider_responded_at:new Date().toISOString()});if(res.error)return alert('Could not accept request: '+res.error.message);sendEmailNotice({to:r.customerEmail,name:r.customerName,subject:'Home service provider accepted your request',summary:'The service provider accepted your request. Please contact each other to confirm details.',buttonText:'Open Home Services',page:'home_services',details:{Service:r.serviceTitle,Provider:r.providerName,ProviderEmail:r.providerEmail,Status:'Accepted'}});persistOnly();alert('Request accepted and customer was notified.');homeServices();}
async function providerDeclineHomeServiceRequest(id){if(!requireLogin())return;let r=(data.homeServiceRequests||[]).find(x=>x.id===id);if(!r)return alert('Request not found.');if(r.providerEmail!==currentUser.email&&currentUser.role!=='admin')return alert('Only the provider can decline this request.');if(r.status!=='Pending Provider Review')return alert('This request is not waiting for provider review.');r.status='Provider Declined';r.providerRespondedAt=new Date().toLocaleString();let res=await updateHomeServiceRequestDb(r,{status:'Provider Declined',provider_responded_at:new Date().toISOString()});if(res.error)return alert('Could not decline request: '+res.error.message);sendEmailNotice({to:r.customerEmail,name:r.customerName,subject:'Home service provider declined your request',summary:'The service provider declined your request.',buttonText:'Open Home Services',page:'home_services',details:{Service:r.serviceTitle,Status:'Declined'}});persistOnly();alert('Request declined and customer was notified.');homeServices();}
function homeServicesAdminHtml(){let posts=data.homeServicePosts||[], reqs=data.homeServiceRequests||[];let pendingPosts=posts.filter(p=>p.status==='Pending Admin Approval');let pendingReqs=reqs.filter(r=>r.status==='Pending Admin Approval');return `<h3>🛠️ Home Services Management</h3><div class="grid"><div class="card"><p>Pending Service Posts</p><div class="stat">${pendingPosts.length}</div></div><div class="card"><p>Pending Service Requests</p><div class="stat">${pendingReqs.length}</div></div><div class="card"><p>Total Services</p><div class="stat">${posts.length}</div></div><div class="card"><p>Total Requests</p><div class="stat">${reqs.length}</div></div></div><h3>Service Posts Waiting Approval</h3><table><tr><th>Provider</th><th>Service</th><th>Category</th><th>City</th><th>Price</th><th>Status</th><th>Actions</th></tr>${posts.map(p=>`<tr><td>${p.providerName}<br><span class="small">${p.providerEmail}</span></td><td>${p.title}<br><span class="small">${p.description||''}</span></td><td>${p.category}</td><td>${p.city||''}</td><td>${p.price||''}</td><td>${homeServiceStatusBadge(p.status)}</td><td>${p.status==='Pending Admin Approval'?`<button class="btn primary" onclick="adminApproveHomeServicePost('${p.id}')">Approve</button> <button class="btn bad" onclick="adminDeclineHomeServicePost('${p.id}')">Decline</button>`:'-'}</td></tr>`).join('')||'<tr><td colspan="7">No home service posts yet.</td></tr>'}</table><h3>Service Requests Waiting Approval</h3><table><tr><th>Service</th><th>Customer</th><th>Provider</th><th>Phone</th><th>City</th><th>Date / Time</th><th>Status</th><th>Actions</th></tr>${reqs.map(r=>`<tr><td>${r.serviceTitle}</td><td>${r.customerName}<br><span class="small">${r.customerEmail}</span></td><td>${r.providerName}<br><span class="small">${r.providerEmail}</span></td><td>${r.customerPhone||''}</td><td>${r.city||''}</td><td>${r.preferredDate||''}</td><td>${homeServiceStatusBadge(r.status)}</td><td>${r.status==='Pending Admin Approval'?`<button class="btn primary" onclick="adminApproveHomeServiceRequest('${r.id}')">Approve</button> <button class="btn bad" onclick="adminDeclineHomeServiceRequest('${r.id}')">Decline</button>`:'-'}</td></tr>`).join('')||'<tr><td colspan="8">No home service requests yet.</td></tr>'}</table>`;}


/* V7.8.32 Taxi/Limo Supabase sync helpers - removes local-only Taxi/Limo flow */
function taxiUiStatus(s){
  s=String(s||'').trim();
  const map={
    pending_admin:'Pending Admin Approval', pending:'Pending Admin Approval', approved:'Approved', declined:'Declined', suspended:'Suspended', inactive:'Inactive', ended:'Ended',
    waiting_driver_acceptance:'Waiting Driver Acceptance', pending_driver_acceptance:'Waiting Driver Acceptance',
    driver_accepted_pending_admin:'Pending Admin Approval', driver_declined:'Driver Declined'
  };
  return map[s]||s||'Pending Admin Approval';
}
function taxiOwnerDbStatus(s){
  s=taxiUiStatus(s);
  if(s==='Approved')return 'approved'; if(s==='Declined')return 'declined'; if(s==='Suspended')return 'suspended';
  return 'pending_admin';
}
function taxiDriverDbStatus(s){
  s=taxiUiStatus(s);
  if(s==='Approved')return 'approved'; if(s==='Declined')return 'declined';
  return 'pending';
}
function taxiAssignmentDbStatus(s){
  s=taxiUiStatus(s);
  if(s==='Waiting Driver Acceptance')return 'waiting_driver_acceptance';
  if(s==='Pending Admin Approval')return 'driver_accepted_pending_admin';
  if(s==='Approved')return 'approved';
  if(s==='Driver Declined')return 'driver_declined';
  if(s==='Declined')return 'declined';
  if(s==='Ended')return 'ended';
  return 'waiting_driver_acceptance';
}
async function taxiCurrentAuthUserId(){
  if(!authReady())return null;
  try{let {data}=await hcSupabase.auth.getUser();return data&&data.user?data.user.id:null;}catch(e){return null;}
}
async function loadSupabaseTaxiLimo(){
  if(!authReady())return;
  try{
    let owners=await hcSupabase.from('taxi_limo_owners').select('*').order('created_at',{ascending:false});
    if(!owners.error){data.taxiLimoOwners=(owners.data||[]).map(o=>({dbId:o.id,id:o.id,ownerId:o.owner_id,ownerName:o.owner_name||o.ownerName||'',ownerEmail:o.owner_email||o.ownerEmail||'',phone:o.phone||'',companyName:o.company_name||o.companyName||'',city:o.city||'',status:taxiUiStatus(o.status),adminNote:o.admin_note||'',createdAt:o.created_at||''}));}
  }catch(e){console.warn('Taxi/Limo owners load skipped',e);}
  try{
    let vehicles=await hcSupabase.from('taxi_limo_vehicles').select('*').order('created_at',{ascending:false});
    if(!vehicles.error){data.taxiLimoVehicles=(vehicles.data||[]).map(v=>({dbId:v.id,id:v.id,ownerId:v.owner_application_id||v.owner_id,ownerName:v.owner_name||'',ownerEmail:v.owner_email||'',companyName:v.company_name||'',vehicleType:v.vehicle_type||'Taxi',make:v.make||'',model:v.model||'',year:v.year||'',plate:v.plate_number||v.plate||'',docs:v.docs_note||'',status:taxiUiStatus(v.status),createdAt:v.created_at||''}));}
  }catch(e){console.warn('Taxi/Limo vehicles load skipped',e);}
  try{
    let drivers=await hcSupabase.from('taxi_driver_applications').select('*').order('created_at',{ascending:false});
    if(!drivers.error){data.taxiDriverApps=(drivers.data||[]).map(a=>({dbId:a.id,id:a.id,name:a.full_name||a.name||a.driver_name||'',email:a.email||a.driver_email||'',phone:a.phone||'',license:a.license_number||a.license||'',experience:a.experience||'',availability:a.availability||'',area:a.service_area||a.area||'',notes:a.driver_notes||a.notes||'',status:taxiUiStatus(a.status),ownerEmail:a.owner_email||'',assignedVehicleId:a.assigned_vehicle_id||'',assignedVehicle:a.assigned_vehicle_label||a.assigned_vehicle||'',availabilityStatus:a.availability_status||(!a.owner_email?'Available':'Hired'),createdAt:a.created_at||''}));}
  }catch(e){console.warn('Taxi/Limo driver apps load skipped',e);}
  try{
    let assigns=await hcSupabase.from('taxi_limo_driver_assignments').select('*').order('created_at',{ascending:false});
    if(!assigns.error){data.taxiLimoDriverAssignments=(assigns.data||[]).map(a=>({dbId:a.id,id:a.id,ownerId:a.owner_application_id||a.owner_id,ownerName:a.owner_name||'',ownerEmail:a.owner_email||'',driverName:a.driver_name||'',driverEmail:a.driver_email||'',vehicleId:a.vehicle_id||'',vehicleLabel:a.vehicle_label||'',status:taxiUiStatus(a.status),driverAcceptedAt:a.driver_responded_at||'',hiredAt:a.hired_at||'',endedAt:a.ended_at||'',endedBy:a.ended_by||'',createdAt:a.created_at||''}));}
  }catch(e){console.warn('Taxi/Limo assignments load skipped',e);}
  persistOnly();
}
async function insertTaxiOwnerDb(o){
  if(!authReady())return {error:null,data:null};
  let owner_id=await taxiCurrentAuthUserId();
  let payload={owner_id,owner_name:o.ownerName,owner_email:o.ownerEmail,phone:o.phone,company_name:o.companyName,city:o.city,status:'pending_admin'};
  return await hcSupabase.from('taxi_limo_owners').insert(payload).select().single();
}
async function updateTaxiOwnerDb(o,fields){
  if(!authReady())return {error:null};
  let payload={};
  if(fields.status!==undefined)payload.status=taxiOwnerDbStatus(fields.status);
  if(fields.admin_note!==undefined)payload.admin_note=fields.admin_note;
  payload.updated_at=new Date().toISOString();
  let q=hcSupabase.from('taxi_limo_owners').update(payload);
  return await q.eq('id',o.dbId||o.id);
}
async function insertTaxiVehicleDb(v){
  if(!authReady())return {error:null,data:null};
  let owner_id=await taxiCurrentAuthUserId();
  let payload={owner_id,owner_application_id:v.ownerId,owner_email:v.ownerEmail,company_name:v.companyName,vehicle_type:v.vehicleType,make:v.make,model:v.model,year:v.year,plate_number:v.plate,docs_note:v.docs,status:'pending_admin'};
  return await hcSupabase.from('taxi_limo_vehicles').insert(payload).select().single();
}
async function updateTaxiVehicleDb(v,fields){
  if(!authReady())return {error:null};
  let payload={};
  if(fields.status!==undefined)payload.status=taxiOwnerDbStatus(fields.status);
  payload.updated_at=new Date().toISOString();
  return await hcSupabase.from('taxi_limo_vehicles').update(payload).eq('id',v.dbId||v.id);
}
async function insertTaxiDriverDb(app){
  if(!authReady())return {error:null,data:null};
  let user_id=await taxiCurrentAuthUserId();
  let payload={user_id,full_name:app.name,email:app.email,phone:app.phone,license_number:app.license,experience:app.experience,availability:app.availability,service_area:app.area,driver_notes:app.notes,status:'pending'};
  return await hcSupabase.from('taxi_driver_applications').insert(payload).select().single();
}
async function updateTaxiDriverDb(app,fields){
  if(!authReady())return {error:null};
  let payload={};
  if(fields.status!==undefined)payload.status=taxiDriverDbStatus(fields.status);
  if(fields.ownerEmail!==undefined)payload.owner_email=fields.ownerEmail;
  if(fields.assignedVehicleId!==undefined)payload.assigned_vehicle_id=fields.assignedVehicleId||null;
  if(fields.assignedVehicle!==undefined)payload.assigned_vehicle_label=fields.assignedVehicle;
  if(fields.availabilityStatus!==undefined)payload.availability_status=fields.availabilityStatus;
  return await hcSupabase.from('taxi_driver_applications').update(payload).eq('id',app.dbId||app.id);
}
async function insertTaxiAssignmentDb(a){
  if(!authReady())return {error:null,data:null};
  let owner_id=await taxiCurrentAuthUserId();
  let payload={owner_id,owner_application_id:a.ownerId,owner_email:a.ownerEmail,driver_email:a.driverEmail,driver_name:a.driverName,vehicle_id:a.vehicleId,vehicle_label:a.vehicleLabel,status:taxiAssignmentDbStatus(a.status)};
  return await hcSupabase.from('taxi_limo_driver_assignments').insert(payload).select().single();
}
async function updateTaxiAssignmentDb(a,fields){
  if(!authReady())return {error:null};
  let payload={updated_at:new Date().toISOString()};
  if(fields.status!==undefined)payload.status=taxiAssignmentDbStatus(fields.status);
  if(fields.driver_responded_at!==undefined)payload.driver_responded_at=fields.driver_responded_at;
  if(fields.hired_at!==undefined)payload.hired_at=fields.hired_at;
  if(fields.ended_at!==undefined)payload.ended_at=fields.ended_at;
  if(fields.ended_by!==undefined)payload.ended_by=fields.ended_by;
  return await hcSupabase.from('taxi_limo_driver_assignments').update(payload).eq('id',a.dbId||a.id);
}

function taxiBadge(s){return `<span class="pill ${String(s||'').includes('Declined')?'bad':String(s||'').includes('Approved')||String(s||'').includes('Completed')||String(s||'').includes('Paid')?'good':'warn'}">${s||'Pending'}</span>`}
function taxiAdminHtml(){
 let apps=data.taxiDriverApps||[], owners=data.taxiLimoOwners||[], vehicles=data.taxiLimoVehicles||[], assignments=data.taxiLimoDriverAssignments||[];
 const pendingOwners=owners.filter(o=>o.status==='Pending Admin Approval').length;
 const pendingVehicles=vehicles.filter(v=>v.status==='Pending Admin Approval').length;
 const pendingDrivers=apps.filter(a=>a.status==='Pending Admin Approval').length;
 const pendingHires=assignments.filter(a=>a.status==='Pending Admin Approval').length;
 const activeHires=assignments.filter(a=>a.status==='Approved').length;
 const availableDrivers=apps.filter(a=>a.status==='Approved'&&!a.ownerEmail).length;
 function card(title,subtitle,status,actions){return `<div class="card"><h4>${title}</h4><p class="small">${subtitle||''}</p><p>${taxiBadge(status||'')}</p><div class="actions">${actions||'-'}</div></div>`}
 let ownerCards=owners.map(o=>card('Owner: '+(o.ownerName||'Owner'),`${o.companyName||''} • ${o.city||''}<br>${o.ownerEmail||''} • ${o.phone||''}`,o.status,o.status==='Pending Admin Approval'?`<button class="btn primary" onclick="adminApproveTaxiOwner('${o.id}')">Approve</button><button class="btn bad" onclick="adminDeclineTaxiOwner('${o.id}')">Decline</button>`:'-')).join('')||'<div class="card"><p class="muted">No taxi/limo owner applications yet.</p></div>';
 let vehicleCards=vehicles.map(v=>card('Vehicle: '+[v.year,v.make,v.model].filter(Boolean).join(' '),`${v.ownerName||''} • ${v.ownerEmail||''}<br>${v.vehicleType||''} • Plate: ${v.plate||''}`,v.status,v.status==='Pending Admin Approval'?`<button class="btn primary" onclick="adminApproveTaxiVehicle('${v.id}')">Approve</button><button class="btn bad" onclick="adminDeclineTaxiVehicle('${v.id}')">Decline</button>`:'-')).join('')||'<div class="card"><p class="muted">No taxi/limo vehicles yet.</p></div>';
 let driverCards=apps.map(a=>card('Driver: '+(a.name||'Driver'),`${a.email||''} • ${a.phone||''}<br>License: ${a.license||''} • Availability: ${a.availability||''} • Area: ${a.area||''}<br>${a.ownerEmail?'Current owner: '+a.ownerEmail:'Available for owners after approval'}`,a.ownerEmail?'Hired / Not Available':a.status,a.status==='Pending Admin Approval'?`<button class="btn primary" onclick="adminApproveTaxiDriver('${a.id}')">Approve</button><button class="btn bad" onclick="adminDeclineTaxiDriver('${a.id}')">Decline</button>`:'-')).join('')||'<div class="card"><p class="muted">No taxi/limo driver applications yet.</p></div>';
 let assignmentCards=assignments.map(a=>card('Hire: '+(a.ownerName||'Owner')+' → '+(a.driverName||'Driver'),`${a.ownerEmail||''}<br>${a.driverEmail||''}<br>${a.vehicleLabel||''}`,a.status,a.status==='Pending Admin Approval'?`<button class="btn primary" onclick="adminApproveTaxiAssignment('${a.id}')">Approve</button><button class="btn bad" onclick="adminDeclineTaxiAssignment('${a.id}')">Decline</button>`:'-')).join('')||'<div class="card"><p class="muted">No owner/driver hire requests yet.</p></div>';
 return `<h3>🚕 Taxi/Limo Management</h3>
 <div class="notice"><b>Clean Taxi/Limo flow:</b> This module is now focused on owner-driver hiring only. Ride request transactions are hidden to avoid incomplete/unclear workflows.</div>
 <div class="notice"><b>Flow:</b> Driver applies → Admin approves → Driver shows as Available → Owner applies → Admin approves → Owner adds vehicle → Admin approves → Owner sends hire request → Driver accepts/declines → Admin approves hire → Driver becomes Hired and disappears from other owners. If the job ends, owner or driver can end employment without admin and the driver becomes Available again.</div>
 <div class="grid"><div class="card"><p>Pending Owners</p><div class="stat">${pendingOwners}</div></div><div class="card"><p>Pending Vehicles</p><div class="stat">${pendingVehicles}</div></div><div class="card"><p>Pending Drivers</p><div class="stat">${pendingDrivers}</div></div><div class="card"><p>Pending Hires</p><div class="stat">${pendingHires}</div></div><div class="card"><p>Active Hires</p><div class="stat">${activeHires}</div></div><div class="card"><p>Available Drivers</p><div class="stat">${availableDrivers}</div></div></div>
 <h4>Phone View: Taxi/Limo Transactions</h4><div class="grid">${ownerCards}${vehicleCards}${driverCards}${assignmentCards}</div>
 <h4>Taxi/Limo Owner Applications</h4><div class="tableWrap"><table><tr><th>Owner</th><th>Company</th><th>Phone</th><th>Status</th><th>Action</th></tr>${owners.map(o=>`<tr><td>${o.ownerName}<br><span class="small">${o.ownerEmail}</span></td><td>${o.companyName||''}<br><span class="small">${o.city||''}</span></td><td>${o.phone||''}</td><td>${taxiBadge(o.status)}</td><td>${o.status==='Pending Admin Approval'?`<button class="btn primary" onclick="adminApproveTaxiOwner('${o.id}')">Approve</button> <button class="btn bad" onclick="adminDeclineTaxiOwner('${o.id}')">Decline</button>`:'-'}</td></tr>`).join('')||'<tr><td colspan="5">No owner applications.</td></tr>'}</table></div>
 <h4>Taxi/Limo Vehicle Approvals</h4><div class="tableWrap"><table><tr><th>Owner</th><th>Vehicle</th><th>Plate</th><th>Status</th><th>Action</th></tr>${vehicles.map(v=>`<tr><td>${v.ownerName}<br><span class="small">${v.ownerEmail}</span></td><td>${v.year||''} ${v.make||''} ${v.model||''}<br><span class="small">${v.vehicleType||''}</span></td><td>${v.plate||''}</td><td>${taxiBadge(v.status)}</td><td>${v.status==='Pending Admin Approval'?`<button class="btn primary" onclick="adminApproveTaxiVehicle('${v.id}')">Approve</button> <button class="btn bad" onclick="adminDeclineTaxiVehicle('${v.id}')">Decline</button>`:'-'}</td></tr>`).join('')||'<tr><td colspan="5">No vehicles.</td></tr>'}</table></div>
 <h4>Taxi/Limo Driver Applications</h4><div class="tableWrap"><table><tr><th>Driver</th><th>Availability</th><th>Area</th><th>Experience</th><th>Status</th><th>Action</th></tr>${apps.map(a=>`<tr><td>${a.name}<br><span class="small">${a.email}</span></td><td>${a.availability||''}</td><td>${a.area||''}</td><td>${a.experience||''}</td><td>${taxiBadge(a.ownerEmail?'Hired / Not Available':a.status)}</td><td>${a.status==='Pending Admin Approval'?`<button class="btn primary" onclick="adminApproveTaxiDriver('${a.id}')">Approve</button> <button class="btn bad" onclick="adminDeclineTaxiDriver('${a.id}')">Decline</button>`:'-'}</td></tr>`).join('')||'<tr><td colspan="6">No driver applications.</td></tr>'}</table></div>
 <h4>Owner / Driver Hire Requests</h4><div class="tableWrap"><table><tr><th>Owner</th><th>Driver</th><th>Vehicle</th><th>Status</th><th>Action</th></tr>${assignments.map(a=>`<tr><td>${a.ownerName}<br><span class="small">${a.ownerEmail}</span></td><td>${a.driverName}<br><span class="small">${a.driverEmail}</span></td><td>${a.vehicleLabel||''}</td><td>${taxiBadge(a.status)}</td><td>${a.status==='Pending Admin Approval'?`<button class="btn primary" onclick="adminApproveTaxiAssignment('${a.id}')">Approve</button> <button class="btn bad" onclick="adminDeclineTaxiAssignment('${a.id}')">Decline</button>`:'-'}</td></tr>`).join('')||'<tr><td colspan="5">No hire requests.</td></tr>'}</table></div>`;
}
function taxiAdminActions(r){
 if(r.status==='Pending Admin Approval')return `<button class="btn primary" onclick="adminApproveTaxiRide('${r.id}')">Approve Request</button> <button class="btn bad" onclick="adminDeclineTaxiRide('${r.id}')">Decline</button>`;
 if(r.status==='Driver Accepted - Waiting Admin Approval')return `<button class="btn primary" onclick="adminApproveTaxiAcceptance('${r.id}')">Approve Driver</button> <button class="btn bad" onclick="adminDeclineTaxiAcceptance('${r.id}')">Decline Driver</button>`;
 if(r.status==='Completed - Waiting Admin Verification')return `<button class="btn primary" onclick="adminVerifyTaxiComplete('${r.id}')">Verify Complete</button>`;
 return '-';
}
async function taxi(){
 if(!requireLogin())return;
 fireAndForget(loadSupabaseTaxiLimo().then(()=>{ if(currentPage==='taxi') taxiRenderOnly(); }), 'taxi/limo background load');
 taxiRenderOnly();
}
function taxiRenderOnly(){
 if(!currentUser)return;
 let apps=data.taxiDriverApps||[], owners=data.taxiLimoOwners||[], vehicles=data.taxiLimoVehicles||[], assignments=data.taxiLimoDriverAssignments||[];
 let myApp=apps.find(a=>a.email===currentUser.email);
 let myOwner=owners.find(o=>o.ownerEmail===currentUser.email);
 let ownerApproved=myOwner&&myOwner.status==='Approved';
 let isOwner=currentUser.role==='taxi_limo_owner';
 let isDriver=currentUser.role==='taxi_limo_driver'||currentUser.role==='taxi_driver'||(myApp&&myApp.status==='Approved');
 let driverForm='';
 if(currentUser.role==='taxi_limo_driver'||currentUser.role==='taxi_driver'){
   driverForm=!myApp?`<div class="card"><h3>Apply as Taxi/Limo Driver</h3><p class="muted">Drivers apply first and show availability. Vehicle information is not needed because the owner provides the taxi/limo vehicle.</p><label>Driver License Number</label><input id="taxiLicense" placeholder="License number"><label>Years of Driving Experience</label><input id="taxiExperience" placeholder="Example: 5 years"><label>Availability</label><select id="taxiAvailability"><option>Full-time</option><option>Part-time</option><option>Weekdays</option><option>Weekends</option><option>Temporary</option><option>Monthly</option><option>Yearly</option><option>On Call</option></select><label>City / Service Area</label><input id="taxiArea" placeholder="Atlanta, Clarkston, airport..."><label>Notes</label><textarea id="taxiDriverNotes" placeholder="Airport experience, limo experience, preferred schedule, languages, etc."></textarea><button class="btn primary" onclick="applyTaxiDriver()">Submit Driver Application</button></div>`:`<div class="card"><h3>Taxi/Limo Driver Profile</h3><p>Status: ${taxiBadge(myApp.ownerEmail?'Hired / Not Available':myApp.status)}</p><p class="muted">${myApp.ownerEmail?'You are currently hired and hidden from other Taxi/Limo Owner dashboards. If the job ends, click Leave Current Employer to become available again.':(myApp.status==='Approved'?'Owners can see your approved driver profile and send you a hire request.':'Wait for admin approval before owners can see your profile.')}</p><p class="small"><b>Availability:</b> ${myApp.availability||'Not entered'}<br><b>Service Area:</b> ${myApp.area||''}<br><b>Experience:</b> ${myApp.experience||''}<br><b>Current Vehicle:</b> ${myApp.assignedVehicle||'Not assigned'}</p>${myApp.ownerEmail?`<button class="btn bad" onclick="taxiDriverLeaveEmployer()">Leave Current Employer</button>`:''}</div>`;
 }
 let myVehicles=vehicles.filter(v=>v.ownerEmail===currentUser.email);
 let myAssignments=assignments.filter(a=>a.ownerEmail===currentUser.email||a.driverEmail===currentUser.email);
 let myDriverHireRequests=assignments.filter(a=>a.driverEmail===currentUser.email);
 let vehicleRows=myVehicles.map(v=>`<tr><td>${v.year||''} ${v.make||''} ${v.model||''}</td><td>${v.vehicleType||''}</td><td>${v.plate||''}</td><td>${taxiBadge(v.status)}</td></tr>`).join('')||'<tr><td colspan="4">No vehicles yet.</td></tr>';
 let approvedVehicleOptions=myVehicles.filter(v=>v.status==='Approved').map(v=>`<option value="${v.id}">${v.year||''} ${v.make||''} ${v.model||''} - ${v.plate||''}</option>`).join('');
 let approvedDriverOptions=apps.filter(a=>a.status==='Approved'&&!a.ownerEmail).map(a=>`<option value="${a.email}">${a.name} - ${a.availability||'Available'} - ${a.area||''}</option>`).join('');
 let activeDriverRows=myAssignments.filter(a=>a.ownerEmail===currentUser.email&&a.status==='Approved').map(a=>`<tr><td>${a.driverName}</td><td>${a.vehicleLabel}</td><td>${taxiBadge('Hired')}</td><td><button class="btn bad" onclick="taxiOwnerEndEmployment('${a.id}')">End Employment</button></td></tr>`).join('')||'<tr><td colspan="4">No active drivers yet.</td></tr>';
 let assignmentRows=myAssignments.filter(a=>a.status!=='Approved').map(a=>`<tr><td>${a.driverName}</td><td>${a.vehicleLabel}</td><td>${taxiBadge(a.status)}</td><td>-</td></tr>`).join('')||'<tr><td colspan="4">No pending or past hire requests yet.</td></tr>';
 let driverHireRows=myDriverHireRequests.map(a=>`<tr><td>${a.ownerName}<br><span class="small">${a.ownerEmail}</span></td><td>${a.vehicleLabel||''}</td><td>${taxiBadge(a.status)}</td><td>${a.status==='Waiting Driver Acceptance'?`<button class="btn primary" onclick="taxiDriverAcceptHire('${a.id}')">Accept</button> <button class="btn bad" onclick="taxiDriverDeclineHire('${a.id}')">Decline</button>`:(a.status==='Approved'?`<button class="btn bad" onclick="taxiDriverLeaveEmployer()">Leave Employer</button>`:'-')}</td></tr>`).join('')||'<tr><td colspan="4">No owner hire requests yet.</td></tr>';
 let availableDriverRows=apps.filter(a=>a.status==='Approved'&&!a.ownerEmail).map(a=>`<tr><td>${a.name}<br><span class="small">${a.email}</span></td><td>${a.phone||''}</td><td>${a.availability||''}</td><td>${a.area||''}</td><td>${a.experience||''}</td><td>${a.notes||''}</td></tr>`).join('')||'<tr><td colspan="6">No available taxi/limo drivers yet.</td></tr>'; 
 let ownerForm=isOwner?`<div class="card"><h3>Taxi/Limo Owner Application</h3>${!myOwner?`<p class="muted">Register your taxi/limo business or fleet for admin approval.</p><label>Company / Business Name</label><input id="taxiOwnerCompany" placeholder="Company name"><label>City / Service Area</label><input id="taxiOwnerCity" placeholder="Atlanta, Clarkston, Airport"><label>Phone</label><input id="taxiOwnerPhone" value="${currentUser.phone||''}"><button class="btn primary" onclick="applyTaxiOwner()">Submit Owner Application</button>`:`<p>Status: ${taxiBadge(myOwner.status)}</p><p><b>${myOwner.companyName||''}</b></p><p class="muted">${ownerApproved?'You can add vehicles, see approved available drivers, and send hire requests. Admin approval is required for each vehicle. Driver hire requests go to the driver first, then admin approval after the driver accepts.':'Wait for admin approval before adding vehicles or requesting drivers.'}</p>`}</div>${ownerApproved?`<div class="card"><h3>Add Taxi/Limo Vehicle</h3><label>Vehicle Type</label><select id="taxiVehicleType"><option>Taxi</option><option>Limo</option><option>SUV</option><option>Van</option></select><div class="row"><input id="taxiVehicleMake" placeholder="Make"><input id="taxiVehicleModel" placeholder="Model"></div><div class="row"><input id="taxiVehicleYear" placeholder="Year"><input id="taxiVehiclePlate" placeholder="Plate number"></div><label>Insurance / Registration Note</label><input id="taxiVehicleDocs" placeholder="Insurance/registration info"><button class="btn primary" onclick="addTaxiVehicle()">Submit Vehicle for Admin Approval</button></div><div class="card"><h3>Request / Hire Driver</h3><p class="muted">Choose an approved available driver and one of your approved vehicles. The driver must accept first, then admin approves the hire.</p><label>Driver</label><select id="taxiAssignDriver"><option value="">Choose approved driver</option>${approvedDriverOptions}</select><label>Vehicle</label><select id="taxiAssignVehicle"><option value="">Choose approved vehicle</option>${approvedVehicleOptions}</select><button class="btn primary" onclick="assignTaxiDriverToVehicle()">Send Hire Request to Driver</button></div><div class="card"><h3>My Vehicles</h3><table><tr><th>Vehicle</th><th>Type</th><th>Plate</th><th>Status</th></tr>${vehicleRows}</table></div><div class="card"><h3>My Active Drivers</h3><table><tr><th>Driver</th><th>Vehicle</th><th>Status</th><th>Action</th></tr>${activeDriverRows}</table></div><div class="card"><h3>Hire Request History</h3><table><tr><th>Driver</th><th>Vehicle</th><th>Status</th><th>Action</th></tr>${assignmentRows}</table></div><div class="card"><h3>Available Taxi/Limo Drivers</h3><table><tr><th>Driver</th><th>Phone</th><th>Availability</th><th>Area</th><th>Experience</th><th>Notes</th></tr>${availableDriverRows}</table></div>`:''}`:'';
 $('taxi').innerHTML=`<h2>🚕 Taxi/Limo</h2><div class="hero"><h1>Habesha Taxi/Limo Hiring</h1><p><b>Connect taxi/limo owners with available drivers.</b></p><p class="muted">Clean flow: Driver applies → Admin approves → Owner sees available drivers → Owner sends hire request → Driver accepts/declines → Admin approves hire → Driver becomes hired and disappears from other owners. If the job ends, owner or driver can end employment without admin and the driver becomes available again.</p></div><div class="grid">${driverForm}${ownerForm}</div>${isDriver?`<h3>Owner Hire Requests</h3><table><tr><th>Owner</th><th>Vehicle</th><th>Status</th><th>Action</th></tr>${driverHireRows}</table>`:''}`;
}
function taxiRideActions(r){
 let out=[];
 if(r.riderEmail===currentUser.email && r.status==='Pending Admin Approval')out.push(`<button class="btn bad" onclick="cancelTaxiRide('${r.id}')">Cancel</button>`);
 if(r.driverEmail===currentUser.email && r.status==='Driver Approved - Contact Shared')out.push(`<button class="btn ghost" onclick="taxiArrived('${r.id}')">Arrived</button><button class="btn primary" onclick="taxiStartRide('${r.id}')">Start Ride</button>`);
 if(r.driverEmail===currentUser.email && r.status==='In Progress')out.push(`<button class="btn primary" onclick="taxiCompleteRide('${r.id}')">Complete Ride</button>`);
 if(r.driverEmail===currentUser.email && r.status==='Completed - Admin Verified')out.push(`<button class="btn primary" onclick="taxiPaymentReceived('${r.id}')">Payment Received</button>`);
 return out.join(' ')||'-';
}

function findTaxiOwner(email){return (data.taxiLimoOwners||[]).find(o=>o.ownerEmail===email)}
function findTaxiVehicle(id){return (data.taxiLimoVehicles||[]).find(v=>v.id===id)}
async function applyTaxiOwner(){let company=($('taxiOwnerCompany')?.value||'').trim(),city=($('taxiOwnerCity')?.value||'').trim(),phone=($('taxiOwnerPhone')?.value||'').trim();if(!company||!city||!phone)return alert('Please complete company name, city/service area, and phone.');let existing=findTaxiOwner(currentUser.email);if(existing)return alert('You already submitted a Taxi/Limo owner application.');let o={id:'TLO'+Date.now().toString().slice(-6),ownerName:currentUser.name,ownerEmail:currentUser.email,phone,companyName:company,city,status:'Pending Admin Approval',createdAt:new Date().toLocaleString()};let res=await insertTaxiOwnerDb(o);if(res.error)return alert('Owner application was not saved to Supabase. Please run the Taxi/Limo SQL, then try again. '+res.error.message);if(res.data){o.id=res.data.id;o.dbId=res.data.id;}data.taxiLimoOwners.unshift(o);sendAdminEmailNotice('Taxi/Limo owner application waiting for approval','A taxi/limo owner submitted an application.',{Owner:o.ownerName,Email:o.ownerEmail,Company:company,City:city,Phone:phone},'admin');persistOnly();fireAndForget(loadSupabaseTaxiLimo(), 'taxi/limo owner refresh');alert('Taxi/Limo owner application submitted. Admin approval is required.');taxi();}
async function addTaxiVehicle(){let owner=findTaxiOwner(currentUser.email);if(!owner||owner.status!=='Approved')return alert('Admin must approve your Taxi/Limo owner application first.');let vehicleType=$('taxiVehicleType').value,make=($('taxiVehicleMake').value||'').trim(),model=($('taxiVehicleModel').value||'').trim(),year=($('taxiVehicleYear').value||'').trim(),plate=($('taxiVehiclePlate').value||'').trim(),docs=($('taxiVehicleDocs').value||'').trim();if(!make||!model||!year||!plate)return alert('Please complete make, model, year, and plate.');let v={id:'TLV'+Date.now().toString().slice(-6),ownerId:owner.dbId||owner.id,ownerName:owner.ownerName,ownerEmail:owner.ownerEmail,companyName:owner.companyName,vehicleType,make,model,year,plate,docs,status:'Pending Admin Approval',createdAt:new Date().toLocaleString()};let res=await insertTaxiVehicleDb(v);if(res.error)return alert('Vehicle was not saved to Supabase. Please run the Taxi/Limo SQL, then try again. '+res.error.message);if(res.data){v.id=res.data.id;v.dbId=res.data.id;}data.taxiLimoVehicles.unshift(v);sendAdminEmailNotice('Taxi/Limo vehicle waiting for approval','A taxi/limo owner added a vehicle. Admin approval is required.',{Owner:owner.ownerName,Company:owner.companyName,Vehicle:`${year} ${make} ${model}`,Plate:plate,Type:vehicleType},'admin');persistOnly();fireAndForget(loadSupabaseTaxiLimo(), 'taxi/limo vehicle refresh');alert('Vehicle submitted. Admin approval is required.');taxi();}
async function assignTaxiDriverToVehicle(){let owner=findTaxiOwner(currentUser.email);if(!owner||owner.status!=='Approved')return alert('Admin must approve your Taxi/Limo owner application first.');let driverEmail=$('taxiAssignDriver').value,vehicleId=$('taxiAssignVehicle').value;if(!driverEmail||!vehicleId)return alert('Choose an approved driver and an approved vehicle.');let d=(data.taxiDriverApps||[]).find(a=>a.email===driverEmail&&a.status==='Approved'&&!a.ownerEmail),v=findTaxiVehicle(vehicleId);if(!d||!v)return alert('Driver or vehicle was not found.');if(v.ownerEmail!==currentUser.email||v.status!=='Approved')return alert('Choose one of your approved Taxi/Limo vehicles.');let existing=(data.taxiLimoDriverAssignments||[]).find(x=>x.driverEmail===driverEmail&&['Waiting Driver Acceptance','Pending Admin Approval','Approved'].includes(x.status));if(existing)return alert('This driver already has an active hire request or job.');let a={id:'TLA'+Date.now().toString().slice(-6),ownerId:owner.dbId||owner.id,ownerName:owner.ownerName,ownerEmail:owner.ownerEmail,driverName:d.name,driverEmail:d.email,vehicleId:v.dbId||v.id,vehicleLabel:`${v.year} ${v.make} ${v.model} - ${v.plate}`,status:'Waiting Driver Acceptance',createdAt:new Date().toLocaleString()};let res=await insertTaxiAssignmentDb(a);if(res.error)return alert('Hire request was not saved to Supabase. Please run the Taxi/Limo SQL, then try again. '+res.error.message);if(res.data){a.id=res.data.id;a.dbId=res.data.id;}data.taxiLimoDriverAssignments.unshift(a);addNote(d.email,'Taxi/Limo owner wants to hire you: '+owner.companyName+' / '+a.vehicleLabel);sendEmailNotice({to:d.email,name:d.name,subject:'Taxi/Limo owner hire request',summary:'A taxi/limo owner wants to hire you. Please accept or decline in your Taxi/Limo dashboard.',buttonText:'Open Taxi/Limo',page:'taxi',details:{Owner:owner.ownerName,Company:owner.companyName,Vehicle:a.vehicleLabel,Status:a.status}});persistOnly();fireAndForget(loadSupabaseTaxiLimo(), 'taxi/limo assignment refresh');alert('Hire request sent to the driver. If the driver accepts, admin will approve the connection.');taxi();}
async function adminApproveTaxiOwner(id){let o=(data.taxiLimoOwners||[]).find(x=>x.id===id);if(!o)return;let res=await updateTaxiOwnerDb(o,{status:'Approved'});if(res.error)return alert('Could not approve owner: '+res.error.message);o.status='Approved';addNote(o.ownerEmail,'Your Taxi/Limo owner application was approved. You can add vehicles.');sendEmailNotice({to:o.ownerEmail,name:o.ownerName,subject:'Taxi/Limo owner approved',summary:'Your Taxi/Limo owner application was approved.',buttonText:'Open Taxi/Limo',page:'taxi',details:{Company:o.companyName,Status:'Approved'}});persistOnly();fireAndForget(loadSupabaseTaxiLimo(), 'taxi/limo admin refresh');adminSuccess();}
async function adminDeclineTaxiOwner(id){let o=(data.taxiLimoOwners||[]).find(x=>x.id===id);if(!o)return;let res=await updateTaxiOwnerDb(o,{status:'Declined'});if(res.error)return alert('Could not decline owner: '+res.error.message);o.status='Declined';addNote(o.ownerEmail,'Your Taxi/Limo owner application was declined.');persistOnly();fireAndForget(loadSupabaseTaxiLimo(), 'taxi/limo admin refresh');adminSuccess();}
async function adminApproveTaxiVehicle(id){let v=(data.taxiLimoVehicles||[]).find(x=>x.id===id);if(!v)return;let res=await updateTaxiVehicleDb(v,{status:'Approved'});if(res.error)return alert('Could not approve vehicle: '+res.error.message);v.status='Approved';addNote(v.ownerEmail,'Your Taxi/Limo vehicle was approved: '+[v.year,v.make,v.model].filter(Boolean).join(' ')+'.');persistOnly();fireAndForget(loadSupabaseTaxiLimo(), 'taxi/limo admin refresh');adminSuccess();}
async function adminDeclineTaxiVehicle(id){let v=(data.taxiLimoVehicles||[]).find(x=>x.id===id);if(!v)return;let res=await updateTaxiVehicleDb(v,{status:'Declined'});if(res.error)return alert('Could not decline vehicle: '+res.error.message);v.status='Declined';addNote(v.ownerEmail,'Your Taxi/Limo vehicle was declined: '+[v.year,v.make,v.model].filter(Boolean).join(' ')+'.');persistOnly();fireAndForget(loadSupabaseTaxiLimo(), 'taxi/limo admin refresh');adminSuccess();}
async function taxiDriverAcceptHire(id){let a=(data.taxiLimoDriverAssignments||[]).find(x=>x.id===id);if(!a)return alert('Hire request not found.');if(a.driverEmail!==currentUser.email)return alert('Only this driver can accept the hire request.');if(a.status!=='Waiting Driver Acceptance')return alert('This hire request is not waiting for driver acceptance.');let res=await updateTaxiAssignmentDb(a,{status:'Pending Admin Approval',driver_responded_at:new Date().toISOString()});if(res.error)return alert('Could not accept hire request: '+res.error.message);a.status='Pending Admin Approval';a.driverAcceptedAt=new Date().toLocaleString();addNote(a.ownerEmail,'Taxi/Limo driver accepted your hire request. Waiting for admin approval: '+a.driverName);sendAdminEmailNotice('Taxi/Limo hire request accepted - waiting admin approval','A taxi/limo driver accepted an owner hire request. Admin approval is now required before they are connected.',{Owner:a.ownerName,OwnerEmail:a.ownerEmail,Driver:a.driverName,DriverEmail:a.driverEmail,Vehicle:a.vehicleLabel},'admin');persistOnly();fireAndForget(loadSupabaseTaxiLimo(), 'taxi/limo hire refresh');alert('You accepted the hire request. Admin approval is now required.');taxi();}
async function taxiDriverDeclineHire(id){let a=(data.taxiLimoDriverAssignments||[]).find(x=>x.id===id);if(!a)return alert('Hire request not found.');if(a.driverEmail!==currentUser.email)return alert('Only this driver can decline the hire request.');if(a.status!=='Waiting Driver Acceptance')return alert('This hire request is not waiting for driver acceptance.');let res=await updateTaxiAssignmentDb(a,{status:'Driver Declined',driver_responded_at:new Date().toISOString()});if(res.error)return alert('Could not decline hire request: '+res.error.message);a.status='Driver Declined';a.driverDeclinedAt=new Date().toLocaleString();addNote(a.ownerEmail,'Taxi/Limo driver declined your hire request: '+a.driverName);sendEmailNotice({to:a.ownerEmail,name:a.ownerName,subject:'Taxi/Limo driver declined hire request',summary:'The driver declined your hire request.',buttonText:'Open Taxi/Limo',page:'taxi',details:{Driver:a.driverName,Vehicle:a.vehicleLabel,Status:a.status}});persistOnly();fireAndForget(loadSupabaseTaxiLimo(), 'taxi/limo hire refresh');alert('You declined the hire request.');taxi();}
async function adminApproveTaxiAssignment(id){let a=(data.taxiLimoDriverAssignments||[]).find(x=>x.id===id);if(!a)return;if(a.status!=='Pending Admin Approval')return alert('This hire request is not waiting for final admin approval.');let d=(data.taxiDriverApps||[]).find(x=>x.email===a.driverEmail);let res=await updateTaxiAssignmentDb(a,{status:'Approved',hired_at:new Date().toISOString()});if(res.error)return alert('Could not approve hire: '+res.error.message);a.status='Approved';a.hiredAt=new Date().toLocaleString();if(d){d.ownerEmail=a.ownerEmail;d.assignedVehicleId=a.vehicleId;d.assignedVehicle=a.vehicleLabel;d.availabilityStatus='Hired';let dr=await updateTaxiDriverDb(d,{ownerEmail:a.ownerEmail,assignedVehicleId:a.vehicleId,assignedVehicle:a.vehicleLabel,availabilityStatus:'Hired'});if(dr.error)return alert('Hire was approved, but driver availability was not updated: '+dr.error.message);}addNote(a.ownerEmail,'Taxi/Limo hire connection approved by admin: '+a.driverName);addNote(a.driverEmail,'Your Taxi/Limo hire connection was approved by admin. Vehicle: '+a.vehicleLabel);persistOnly();fireAndForget(loadSupabaseTaxiLimo(), 'taxi/limo admin refresh');adminSuccess();}
async function adminDeclineTaxiAssignment(id){let a=(data.taxiLimoDriverAssignments||[]).find(x=>x.id===id);if(!a)return;if(a.status!=='Pending Admin Approval')return alert('This hire request is not waiting for final admin decision.');let res=await updateTaxiAssignmentDb(a,{status:'Declined'});if(res.error)return alert('Could not decline hire: '+res.error.message);a.status='Declined';addNote(a.ownerEmail,'Taxi/Limo driver assignment declined: '+a.driverName);persistOnly();fireAndForget(loadSupabaseTaxiLimo(), 'taxi/limo admin refresh');adminSuccess();}


async function endTaxiEmploymentByAssignment(a,endedBy){
 if(!a)return alert('Employment record not found.');
 if(a.status!=='Approved')return alert('Only approved/current employment can be ended.');
 let res=await updateTaxiAssignmentDb(a,{status:'Ended',ended_at:new Date().toISOString(),ended_by:endedBy});
 if(res.error)return alert('Could not end employment: '+res.error.message);
 a.status='Ended';
 a.endedBy=endedBy;
 a.endedAt=new Date().toLocaleString();
 let d=(data.taxiDriverApps||[]).find(x=>x.email===a.driverEmail);
 if(d){d.ownerEmail='';d.assignedVehicleId='';d.assignedVehicle='';d.availabilityStatus='Available';let dr=await updateTaxiDriverDb(d,{ownerEmail:'',assignedVehicleId:'',assignedVehicle:'',availabilityStatus:'Available'});if(dr.error)return alert('Employment ended, but driver availability was not updated: '+dr.error.message);}
 addNote(a.ownerEmail,'Taxi/Limo employment ended for driver: '+a.driverName+'. Driver is now available again.');
 addNote(a.driverEmail,'Taxi/Limo employment ended with owner: '+a.ownerName+'. Your profile is now available again.');
 persistOnly();
 await loadSupabaseTaxiLimo();
 alert('Employment ended. Driver is now available again for Taxi/Limo owners.');
 taxi();
}

async function taxiOwnerEndEmployment(id){let a=(data.taxiLimoDriverAssignments||[]).find(x=>x.id===id);if(!a)return alert('Employment record not found.');if(a.ownerEmail!==currentUser.email&&currentUser.role!=='admin')return alert('Only this owner can end this employment.');if(!confirm('End employment for '+a.driverName+'? The driver will become available to other Taxi/Limo owners.'))return;await endTaxiEmploymentByAssignment(a,'Owner');}
async function taxiDriverLeaveEmployer(){let a=(data.taxiLimoDriverAssignments||[]).find(x=>x.driverEmail===currentUser.email&&x.status==='Approved');if(!a)return alert('You do not have an active Taxi/Limo employment record.');if(!confirm('Leave your current Taxi/Limo employer? Your driver profile will become available again.'))return;await endTaxiEmploymentByAssignment(a,'Driver');}

async function applyTaxiDriver(){let license=($('taxiLicense')?.value||'').trim(),experience=($('taxiExperience')?.value||'').trim(),availability=($('taxiAvailability')?.value||'').trim(),area=($('taxiArea')?.value||'').trim(),notes=($('taxiDriverNotes')?.value||'').trim();if(!license||!experience||!availability||!area)return alert('Please complete license, experience, availability, and service area.');let existing=(data.taxiDriverApps||[]).find(a=>a.email===currentUser.email&&a.status!=='Declined');if(existing)return alert('You already have a Taxi/Limo driver profile. If you leave a job, your approved profile becomes available again.');let app={id:'TD'+Date.now().toString().slice(-6),name:currentUser.name,email:currentUser.email,phone:currentUser.phone||'',license,experience,availability,area,notes,status:'Pending Admin Approval',createdAt:new Date().toLocaleString()};let res=await insertTaxiDriverDb(app);if(res.error)return alert('Driver application was not saved to Supabase. Please run the Taxi/Limo SQL, then try again. '+res.error.message);if(res.data){app.id=res.data.id;app.dbId=res.data.id;}data.taxiDriverApps.unshift(app);addNote('admin.habeshaconnect@gmail.com','Taxi/Limo driver application needs approval: '+currentUser.name);sendAdminEmailNotice('Taxi/Limo driver application waiting for approval','A taxi/limo driver submitted availability for owner matching. Vehicle information is not required because the owner provides the vehicle.',{Driver:currentUser.name,Email:currentUser.email,Phone:currentUser.phone||'',License:license,Experience:experience,Availability:availability,Area:area,Notes:notes},'admin');persistOnly();fireAndForget(loadSupabaseTaxiLimo(), 'taxi/limo driver refresh');alert('Taxi/Limo driver application submitted. Admin approval is required.');taxi();}
function submitTaxiRide(){alert('Taxi/Limo ride request flow is disabled in this version. Taxi/Limo is now owner-driver hiring only.');}
function findTaxiRide(id){return (data.taxiRideRequests||[]).find(r=>r.id===id)}
function findTaxiApp(email){return (data.taxiDriverApps||[]).find(a=>a.email===email&&a.status==='Approved')}
async function adminApproveTaxiDriver(id){let a=(data.taxiDriverApps||[]).find(x=>x.id===id);if(!a)return;let res=await updateTaxiDriverDb(a,{status:'Approved',availabilityStatus:'Available'});if(res.error)return alert('Could not approve driver: '+res.error.message);a.status='Approved';a.availabilityStatus='Available';addNote(a.email,'Your taxi/limo driver application was approved. Taxi/Limo owners can now see your availability.');sendEmailNotice({to:a.email,name:a.name,subject:'Taxi/Limo driver approved',summary:'Your taxi/limo driver application was approved. Owners can now send hire requests.',buttonText:'Open Taxi/Limo',page:'taxi',details:{Status:'Approved',Availability:a.availability||'',Area:a.area||''}});persistOnly();fireAndForget(loadSupabaseTaxiLimo(), 'taxi/limo admin refresh');adminSuccess();}
async function adminDeclineTaxiDriver(id){let a=(data.taxiDriverApps||[]).find(x=>x.id===id);if(!a)return;let res=await updateTaxiDriverDb(a,{status:'Declined'});if(res.error)return alert('Could not decline driver: '+res.error.message);a.status='Declined';addNote(a.email,'Your taxi/limo driver application was declined.');sendEmailNotice({to:a.email,name:a.name,subject:'Taxi/Limo driver application declined',summary:'Your taxi/limo driver application was declined.',buttonText:'Open Taxi/Limo',page:'taxi',details:{Status:'Declined'}});persistOnly();fireAndForget(loadSupabaseTaxiLimo(), 'taxi/limo admin refresh');adminSuccess();}
function adminApproveTaxiRide(id){let r=findTaxiRide(id);if(!r)return;r.status='Approved - Waiting Driver';addNote(r.riderEmail,'Your taxi request was approved by admin. Waiting for a driver to accept.');sendEmailNotice({to:r.riderEmail,name:r.riderName,subject:'Taxi request approved',summary:'Your taxi request was approved. Waiting for a driver.',buttonText:'Open Taxi',page:'taxi',details:{Pickup:r.pickup,Destination:r.destination,Status:r.status}});persistOnly();adminSuccess();}
function adminDeclineTaxiRide(id){let r=findTaxiRide(id);if(!r)return;r.status='Declined by Admin';addNote(r.riderEmail,'Your taxi request was declined by admin.');persistOnly();adminSuccess();}
function driverAcceptTaxi(id){let r=findTaxiRide(id),a=findTaxiApp(currentUser.email);if(!r)return alert('Taxi ride not found.');
 if(!a)return alert('Admin must approve your taxi driver application before you accept rides.');r.driverName=currentUser.name;r.driverEmail=currentUser.email;r.driverPhone=currentUser.phone||a.phone||'';r.driverAvailability=a.availability||'';r.status='Driver Accepted - Waiting Admin Approval';addNote('admin.habeshaconnect@gmail.com','Taxi driver accepted ride '+id+'. Admin approval is required.');sendAdminEmailNotice('Taxi driver acceptance waiting for approval','A taxi driver accepted a ride. Admin approval is required before contact details are shared.',{Ride:id,Driver:currentUser.name,Rider:r.riderName,Pickup:r.pickup,Destination:r.destination},'admin');persistOnly();alert('You accepted the ride. Admin approval is required before the rider receives your information.');taxi();}
function driverDeclineTaxi(id){let r=findTaxiRide(id);if(!r)return;r.declinedBy=(r.declinedBy||[]).concat(currentUser.email);alert('Ride declined.');taxi();}
function adminApproveTaxiAcceptance(id){let r=findTaxiRide(id);if(!r)return;r.status='Driver Approved - Contact Shared';addNote(r.riderEmail,'Admin approved your taxi driver. Driver: '+r.driverName+' Phone: '+(r.driverPhone||''));addNote(r.driverEmail,'Admin approved your taxi ride acceptance. Rider: '+r.riderName+' Phone: '+(r.riderPhone||''));sendEmailNotice({to:r.riderEmail,name:r.riderName,subject:'Taxi driver assigned',summary:'Admin approved the taxi driver for your ride.',buttonText:'Open Taxi',page:'taxi',details:{Driver:r.driverName,DriverPhone:r.driverPhone,Vehicle:r.vehicle,Pickup:r.pickup,Destination:r.destination}});sendEmailNotice({to:r.driverEmail,name:r.driverName,subject:'Taxi ride approved',summary:'Admin approved your taxi ride acceptance.',buttonText:'Open Taxi',page:'taxi',details:{Rider:r.riderName,RiderPhone:r.riderPhone,Pickup:r.pickup,Destination:r.destination}});persistOnly();adminSuccess();}
function adminDeclineTaxiAcceptance(id){let r=findTaxiRide(id);if(!r)return;let driverEmail=r.driverEmail; r.driverName='';r.driverEmail='';r.driverPhone='';r.vehicle='';r.status='Approved - Waiting Driver';if(driverEmail)addNote(driverEmail,'Admin declined your taxi ride acceptance.');persistOnly();adminSuccess();}
function taxiArrived(id){let r=findTaxiRide(id);if(!r)return;r.status='Driver Arrived';addNote(r.riderEmail,'Your taxi driver has arrived.');sendEmailNotice({to:r.riderEmail,name:r.riderName,subject:'Taxi driver arrived',summary:'Your taxi driver has arrived.',buttonText:'Open Taxi',page:'taxi',details:{Driver:r.driverName,Phone:r.driverPhone}});persistOnly();taxi();}
function taxiStartRide(id){let r=findTaxiRide(id);if(!r)return;r.status='In Progress';addNote(r.riderEmail,'Your taxi ride has started.');persistOnly();taxi();}
function taxiCompleteRide(id){let r=findTaxiRide(id);if(!r)return;r.status='Completed - Waiting Admin Verification';addNote('admin.habeshaconnect@gmail.com','Taxi ride completed and needs admin verification: '+id);sendAdminEmailNotice('Taxi ride completion waiting for verification','A taxi driver marked a ride completed. Admin verification is required.',{Ride:id,Driver:r.driverName,Rider:r.riderName,Pickup:r.pickup,Destination:r.destination},'admin');persistOnly();taxi();}
function adminVerifyTaxiComplete(id){let r=findTaxiRide(id);if(!r)return;r.status='Completed - Admin Verified';addNote(r.riderEmail,'Your taxi ride was marked completed.');addNote(r.driverEmail,'Taxi ride completed and verified by admin.');persistOnly();adminSuccess();}
function taxiPaymentReceived(id){let r=findTaxiRide(id);if(!r)return;r.status='Payment Received / History';addNote(r.riderEmail,'Taxi driver marked payment received. Thank you.');persistOnly();taxi();}
function cancelTaxiRide(id){let r=findTaxiRide(id);if(!r)return;if(r.riderEmail!==currentUser.email)return;r.status='Cancelled by Rider';persistOnly();taxi();}

function businessRecords(){data.businesses=Array.isArray(data.businesses)?data.businesses:[];return data.businesses}
function businessUserKey(){return currentUser?(currentUser.id||currentUser.auth_user_id||currentUser.email||'local'):'local'}
function bmEsc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function bmProfileRecords(){return businessRecords().filter(b=>b.recordType==='business_profile'||b.record_type==='business_profile'||b.category||b.offers||b.about)}
function bmPublicProfiles(){return bmProfileRecords().filter(b=>(b.status||'Pending Admin Approval')==='Approved'||(currentUser&&currentUser.role==='admin')||(currentUser&&((b.ownerEmail||b.createdBy||'')===currentUser.email)));}
function bmPendingProfiles(){return bmProfileRecords().filter(b=>(b.status||'Pending Admin Approval')==='Pending Admin Approval');}
function bmMyProfile(){if(!currentUser)return null;return bmProfileRecords().find(b=>(b.ownerEmail||b.owner_email||b.createdBy||'').toLowerCase()===(currentUser.email||'').toLowerCase())||null}
function mapBusinessRecordFromDb(row){let d=row.details||{};return Object.assign({},d,{id:row.local_ref||row.id,dbId:row.id,recordType:row.record_type||d.recordType||'business_profile',businessName:row.business_name||d.businessName||d.name||'Business',name:row.business_name||d.name||'Business',category:row.business_type||d.category||d.type||'Other',type:row.business_type||d.type||d.category||'Other',ownerEmail:row.owner_email||d.ownerEmail||'',date:row.record_date||d.date||new Date().toISOString().slice(0,10),status:row.status||d.status||'Pending Admin Approval',source:'supabase'});}
let businessDirectoryLoading=false;
let businessDirectoryLoadedAt=0;
async function loadBusinessFromSupabase(options){
  options=options||{};
  if(!authReady())return;
  if(businessDirectoryLoading)return;
  if(!options.force && Date.now()-businessDirectoryLoadedAt<30000)return;
  businessDirectoryLoading=true;
  try{
    let q=hcSupabase.from('business_records').select('*').eq('record_type','business_profile').order('created_at',{ascending:false});
    let res=await q;
    if(res.error){console.warn('Business Directory Supabase load error',res.error);return;}
    let remote=(res.data||[]).map(mapBusinessRecordFromDb);
    let localOnly=businessRecords().filter(x=>x.source!=='supabase'&&!x.dbId);
    data.businesses=[...remote,...localOnly];
    businessDirectoryLoadedAt=Date.now();
    persistOnly();
    // Do NOT rebuild the full Business Directory page here. Rebuilding while a user taps
    // a select/drop-down on phone closes the list and makes the arrow look broken.
    if(currentPage==='business' && $('businessList')){
      filterBusinessDirectory();
    }
  }catch(e){
    console.warn('Business Directory background load failed',e);
  }finally{
    businessDirectoryLoading=false;
  }
}
async function syncBusinessRecordToSupabase(rec){if(!authReady()||!currentUser||!rec)return {error:null};try{let payload={local_ref:rec.id,business_name:rec.businessName||rec.name||'Business',business_type:rec.category||rec.type||'Other',record_type:'business_profile',period:'Directory',record_date:rec.date||new Date().toISOString().slice(0,10),income_amount:0,expense_amount:0,amount:0,notes:rec.about||rec.description||'',owner_email:currentUser.email||rec.ownerEmail||'',owner_id:businessUserKey(),details:rec};let res=await hcSupabase.from('business_records').upsert(payload,{onConflict:'local_ref'}).select().single();if(!res.error&&res.data){rec.dbId=res.data.id;rec.source='supabase';persistOnly();}else if(res.error){console.warn('Business Directory Supabase save error',res.error);}return res;}catch(e){console.warn('Business Directory background save failed',e);return {error:e};}}
function addBusinessLocal(rec){let arr=businessRecords();let i=arr.findIndex(x=>x.id===rec.id||((x.ownerEmail||x.createdBy)===(rec.ownerEmail||rec.createdBy)&&x.recordType==='business_profile'));if(i>=0)arr[i]=rec;else arr.unshift(rec);persistOnly();fireAndForget(syncBusinessRecordToSupabase(rec),'business directory sync');business();return rec}
function businessCategoryOptions(selected){let cats=['Restaurant / Food','Coffee Shop / Bakery','Grocery / Market','Tax / Accounting','Insurance','Mechanic / Auto','Beauty Salon / Barber','Home Service','Real Estate','Doctor / Dentist','Church / Community','Trucking / Transport','Taxi / Limo','Retail Store','Other'];return cats.map(c=>`<option ${c===selected?'selected':''}>${c}</option>`).join('')}
function businessCard(b){let offers=(b.offers||'').split(',').map(x=>x.trim()).filter(Boolean).slice(0,8).map(x=>`<span class="pill">${bmEsc(x)}</span>`).join(' ');let socials=[b.website?`<a href="${bmEsc(b.website)}" target="_blank">Website</a>`:'',b.facebook?`<a href="${bmEsc(b.facebook)}" target="_blank">Facebook</a>`:'',b.instagram?`<a href="${bmEsc(b.instagram)}" target="_blank">Instagram</a>`:''].filter(Boolean).join(' • ');return `<div class="card"><h3>🏢 ${bmEsc(b.businessName||b.name||'Business')}</h3><p><span class="pill good">${bmEsc(b.category||b.type||'Business')}</span> ${b.city?'<span class="pill">📍 '+bmEsc(b.city)+'</span>':''}</p><p>${bmEsc(b.about||'This business has not added a description yet.')}</p><p><b>Offers:</b> ${offers||'<span class="muted">Not listed yet</span>'}</p><p><b>Phone:</b> ${bmEsc(b.phone||'Not listed')} ${b.address?' • <b>Address:</b> '+bmEsc(b.address):''}</p><p><b>Hours:</b> ${bmEsc(b.hours||'Not listed')}</p>${b.menuUrl?`<p><b>Menu / Info:</b> <a href="${bmEsc(b.menuUrl)}" target="_blank">Open</a></p>`:''}${socials?`<p>${socials}</p>`:''}<div class="actions">${b.phone?`<a class="btn primary" href="tel:${bmEsc(b.phone)}">Call Business</a>`:''}${b.address?`<a class="btn ghost" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}">Directions</a>`:''}</div></div>`}
function business(){let profiles=bmPublicProfiles();let my=bmMyProfile();let isOwner=currentUser&&(currentUser.role==='business_owner'||(currentUser.roles||[]).includes('business_owner')||currentUser.role==='admin');let rows=profiles.map(businessCard).join('')||'<div class="card"><p class="muted">No businesses listed yet.</p></div>';let ownerPanel=isOwner?businessProfileForm(my):`<div class="card"><h3>Own a business?</h3><p>Create a business profile so the community can find what you serve, your hours, phone number, address, menu, and services.</p><button class="btn primary" onclick="show('services')">Add Business Owner Role</button></div>`;$('business').innerHTML=`<h2>🏢 Business Directory</h2><div class="hero"><h1>Find Habesha community businesses</h1><p><b>Restaurants, stores, tax offices, insurance agents, mechanics, salons, home services, trucking, taxi/limo, and more.</b></p><p class="muted">Business owners can create a profile that explains what they serve to the community.</p></div><div class="grid two">${ownerPanel}<div class="card"><h3>Search Businesses</h3><input id="bizSearch" placeholder="Search restaurant, tax, insurance, city, service..." oninput="filterBusinessDirectory()"><select id="bizCategory" onchange="filterBusinessDirectory()"><option>All Categories</option>${businessCategoryOptions('')}</select><p class="muted">Customers can browse, call, get directions, and view what each business offers.</p></div></div><h3 style="margin-top:20px">Business Listings</h3><div id="businessList" class="grid">${rows}</div>`;fireAndForget(loadBusinessFromSupabase(),'business directory load');}
function businessProfileForm(b){b=b||{};return `<div class="card"><h3>${b.id?'Update My Business Profile':'Create My Business Profile'}</h3><input id="bizId" type="hidden" value="${bmEsc(b.id||'')}"><label>Business Name</label><input id="bizName" placeholder="Example: Habesha Restaurant" value="${bmEsc(b.businessName||b.name||'')}"><div class="grid two"><div><label>Business Category</label><select id="bizType">${businessCategoryOptions(b.category||b.type)}</select></div><div><label>City / Area</label><input id="bizCity" placeholder="Clarkston, Atlanta, Decatur..." value="${bmEsc(b.city||'')}"></div></div><label>About / What do you serve?</label><textarea id="bizAbout" placeholder="Tell the community what you serve, what you sell, or what services you provide.">${bmEsc(b.about||'')}</textarea><label>What do you offer?  Separate with commas</label><input id="bizOffers" placeholder="Injera, tibs, vegan food, catering, coffee, delivery" value="${bmEsc(b.offers||'')}"><div class="grid two"><div><label>Phone</label><input id="bizPhone" placeholder="Phone number" value="${bmEsc(b.phone||'')}"></div><div><label>Email</label><input id="bizEmail" placeholder="Business email" value="${bmEsc(b.email||currentUser.email||'')}"></div></div><label>Address</label><input id="bizAddress" placeholder="Business address" value="${bmEsc(b.address||'')}"><label>Business Hours</label><input id="bizHours" placeholder="Mon-Sat 10am-9pm, Sunday closed" value="${bmEsc(b.hours||'')}"><label>Menu / Website Link</label><input id="bizMenu" placeholder="Menu, website, or Google listing link" value="${bmEsc(b.menuUrl||b.website||'')}"><div class="grid two"><div><label>Facebook Link</label><input id="bizFacebook" placeholder="optional" value="${bmEsc(b.facebook||'')}"></div><div><label>Instagram Link</label><input id="bizInstagram" placeholder="optional" value="${bmEsc(b.instagram||'')}"></div></div><label>Languages</label><input id="bizLanguages" placeholder="English, Amharic, Afaan Oromo, Tigrinya" value="${bmEsc(b.languages||'')}"><label>Payment Methods</label><input id="bizPayments" placeholder="Cash, card, Zelle, Apple Pay" value="${bmEsc(b.payments||'')}"><button class="btn primary" onclick="saveBusinessProfile()">Save Business Profile</button></div>`}
function filterBusinessDirectory(){let q=($('bizSearch')&&$('bizSearch').value||'').toLowerCase();let c=($('bizCategory')&&$('bizCategory').value)||'All Categories';let list=bmPublicProfiles().filter(b=>{let hay=[b.businessName,b.name,b.category,b.type,b.city,b.about,b.offers,b.address].join(' ').toLowerCase();let okQ=!q||hay.includes(q);let okC=c==='All Categories'||(b.category||b.type||'')===c;return okQ&&okC;});$('businessList').innerHTML=list.map(businessCard).join('')||'<div class="card"><p class="muted">No matching businesses found.</p></div>';}
function saveBusinessProfile(){if(!requireLogin())return;let name=($('bizName').value||'').trim();let category=$('bizType').value;let about=($('bizAbout').value||'').trim();let phone=($('bizPhone').value||'').trim();if(!name||!category||!about||!phone)return alert('Please enter business name, category, about/what you serve, and phone number.');let existingId=$('bizId').value||'';let existing=existingId?businessRecords().find(x=>x.id===existingId):bmMyProfile();let rec={id:existing?existing.id:'BD'+Date.now().toString().slice(-8),dbId:existing?existing.dbId:undefined,source:existing?existing.source:undefined,recordType:'business_profile',businessName:name,name:name,category:category,type:category,about:about,offers:$('bizOffers').value||'',phone:phone,email:$('bizEmail').value||currentUser.email||'',address:$('bizAddress').value||'',city:$('bizCity').value||'',hours:$('bizHours').value||'',menuUrl:$('bizMenu').value||'',website:$('bizMenu').value||'',facebook:$('bizFacebook').value||'',instagram:$('bizInstagram').value||'',languages:$('bizLanguages').value||'',payments:$('bizPayments').value||'',ownerName:currentUser.name||'',ownerEmail:currentUser.email||'',createdBy:currentUser.email||'',status:existing?((existing.status==='Approved')?'Pending Admin Approval':existing.status||'Pending Admin Approval'):'Pending Admin Approval',date:new Date().toISOString().slice(0,10),time:new Date().toLocaleString()};addBusinessLocal(rec);alert('Business profile saved. It is waiting for admin approval before it becomes public.');}
function addBusiness(){saveBusinessProfile()}


/* V7.8.51 Events - community event listings and admin approval */
function eventCategories(selected){let cats=['Festival','Concert','Church Event','Education / Training','Business Networking','Sports','Charity / Fundraiser','Family Event','Food Festival','Cultural Show','Kids Activity','Community Meeting','Other'];return cats.map(c=>`<option ${c===selected?'selected':''}>${c}</option>`).join('')}
function eventRecords(){if(!data.events)data.events=[];return data.events}
function eventEsc(v){return String(v||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function eventVisibleList(){let now=new Date().toISOString().slice(0,10);return eventRecords().filter(e=>{if(currentUser&&currentUser.role==='admin')return true;if(currentUser&&e.organizerEmail===currentUser.email)return true;return e.status==='Approved'&&(!e.date||e.date>=now);}).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||'')))}
async function syncEventToSupabase(ev){if(!authReady()||!ev)return {error:null};try{return await hcSupabase.from('community_events').upsert({local_ref:ev.id,title:ev.title,category:ev.category,organizer_name:ev.organizerName,organizer_email:ev.organizerEmail,phone:ev.phone,email:ev.email,description:ev.description,event_date:ev.date,start_time:ev.startTime,end_time:ev.endTime,venue:ev.venue,address:ev.address,city:ev.city,state:ev.state,zip:ev.zip,admission:ev.admission,adult_price:Number(ev.adultPrice||0),child_price:Number(ev.childPrice||0),vip_price:Number(ev.vipPrice||0),capacity:Number(ev.capacity||0),flyer_url:ev.flyerUrl,social_link:ev.social,status:ev.status,details:ev},{onConflict:'local_ref'});}catch(e){console.warn('Event Supabase sync failed',e);return {error:e};}}
async function loadEventsFromSupabase(options){if(!authReady())return;try{let res=await hcSupabase.from('community_events').select('*').order('event_date',{ascending:true});if(res.error)return console.warn('Events load error',res.error);let remote=(res.data||[]).map(r=>Object.assign({},r.details||{}, {id:(r.details&&r.details.id)||r.local_ref||String(r.id), dbId:r.id, title:r.title, category:r.category, organizerName:r.organizer_name, organizerEmail:r.organizer_email, phone:r.phone, email:r.email, description:r.description, date:r.event_date, startTime:r.start_time, endTime:r.end_time, venue:r.venue, address:r.address, city:r.city, state:r.state, zip:r.zip, admission:r.admission, adultPrice:r.adult_price, childPrice:r.child_price, vipPrice:r.vip_price, capacity:r.capacity, flyerUrl:r.flyer_url, social:r.social_link, status:r.status||'Pending Admin Approval', source:'supabase'}));let localOnly=eventRecords().filter(x=>x.source!=='supabase'&&!x.dbId);data.events=[...remote,...localOnly];persistOnly();if(currentPage==='events')filterEvents();}catch(e){console.warn('Events background load failed',e)}}
function eventCard(e){let price=e.admission==='Paid'?`Paid${e.adultPrice?' • Adult '+money(e.adultPrice):''}${e.childPrice?' • Child '+money(e.childPrice):''}`:'Free';let waiting=(e.status||'Pending Admin Approval')==='Pending Admin Approval';let adminActions=(currentUser&&currentUser.role==='admin'&&waiting)?`<div class="actions"><button class="btn primary" onclick="approveEvent('${e.id}')">Approve</button><button class="btn bad" onclick="declineEvent('${e.id}')">Decline</button></div>`:'';let ownerStatus=(currentUser&&e.organizerEmail===currentUser.email&&currentUser.role!=='admin')?`<p><b>Status:</b> <span class="pill ${e.status==='Approved'?'good':e.status==='Declined'?'bad':'warn'}">${eventEsc(e.status)}</span></p>`:'';let isOrganizer=currentUser&&e.organizerEmail===currentUser.email;let canRegister=currentUser&&currentUser.role!=='admin'&&!isOrganizer&&e.status==='Approved';let registerBtn=!currentUser?`<button class="btn ghost" onclick="show('account')">Login to Register</button>`:(canRegister?`<button class="btn ghost" onclick="registerForEvent('${e.id}')">Register Interest</button>`:'');return `<div class="card"><h3>📅 ${eventEsc(e.title)}</h3><p><span class="pill good">${eventEsc(e.category||'Event')}</span> <span class="pill">${eventEsc(price)}</span> ${e.status&&e.status!=='Approved'?'<span class="pill warn">'+eventEsc(e.status)+'</span>':''}</p>${e.flyerUrl?`<p><img src="${eventEsc(e.flyerUrl)}" style="max-width:100%;border-radius:12px" alt="Event flyer"></p>`:''}<p><b>Date:</b> ${eventEsc(e.date||'Not listed')} ${e.startTime?' • <b>Time:</b> '+eventEsc(e.startTime)+(e.endTime?' - '+eventEsc(e.endTime):''):''}</p><p><b>Location:</b> ${eventEsc([e.venue,e.city,e.state].filter(Boolean).join(', ')||'Not listed')}</p><p>${eventEsc(e.description||'No description yet.')}</p>${ownerStatus}<p><b>Organizer:</b> ${eventEsc(e.organizerName||'Organizer')} ${e.phone?' • <b>Phone:</b> '+eventEsc(e.phone):''}</p><div class="actions">${e.phone?`<a class="btn primary" href="tel:${eventEsc(e.phone)}">Call Organizer</a>`:''}${e.address?`<a class="btn ghost" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.address+' '+(e.city||''))}">Directions</a>`:''}${e.social?`<a class="btn ghost" target="_blank" href="${eventEsc(e.social)}">Website / Social</a>`:''}${registerBtn}</div>${adminActions}</div>`}
function eventsPendingList(){return eventRecords().filter(e=>(e.status||'Pending Admin Approval')==='Pending Admin Approval')}
function eventsAdminManagementHtml(){let rows=eventsPendingList().map(e=>`<tr><td>${eventEsc(e.title||'Event')}</td><td>${eventEsc(e.category||'')}</td><td>${eventEsc(e.date||'')}</td><td>${eventEsc([e.city,e.state].filter(Boolean).join(', '))}</td><td>${eventEsc(e.organizerName||'')}</td><td>${eventEsc(e.phone||'')}</td><td><button class="btn primary" onclick="approveEvent('${e.id}')">Approve</button> <button class="btn bad" onclick="declineEvent('${e.id}')">Decline</button></td></tr>`).join('')||'<tr><td colspan="7">No events waiting for approval.</td></tr>';return `<h3>Events Approvals</h3><table><tr><th>Event</th><th>Category</th><th>Date</th><th>City</th><th>Organizer</th><th>Phone</th><th>Actions</th></tr>${rows}</table>`}
function events(){let isLogged=!!currentUser;let myBiz=bmMyProfile?bmMyProfile():null;let organizer=(currentUser&&(currentUser.role==='event_organizer'||currentUser.role==='business_owner'||currentUser.role==='admin'||currentUser.role==='service_provider'||(currentUser.roles||[]).includes('event_organizer')||(currentUser.roles||[]).includes('business_owner')));let form=!isLogged?`<div class="card"><h3>Create Event</h3><p>Login to post church, cultural, business, charity, family, sports, or community events.</p><button class="btn primary" onclick="show('account')">Login / Register</button></div>`:(organizer?eventForm(myBiz):`<div class="card"><h3>Create Event</h3><p>To post events, add the 📅 Events Organizer service in My Services.</p><button class="btn primary" onclick="show('services')">Add Events Organizer Role</button></div>`);$('events').innerHTML=`<h2>📅 Events</h2><div class="hero"><h1>Habesha Community Events</h1><p><b>Find church programs, concerts, festivals, business networking, charity events, sports, family activities, and cultural shows.</b></p><p class="muted">Event organizers submit events first. Admin approves before the public sees them.</p></div><div class="grid two">${form}<div class="card"><h3>Search Events</h3><input id="eventSearch" placeholder="Search event, city, organizer..." oninput="filterEvents()"><select id="eventCategory" onchange="filterEvents()"><option>All Categories</option>${eventCategories('')}</select><div class="grid two"><input id="eventCity" placeholder="City" oninput="filterEvents()"><select id="eventFree" onchange="filterEvents()"><option>All</option><option>Free</option><option>Paid</option></select></div><p class="muted">Customers can call organizers, get directions, and register interest.</p></div></div><h3 style="margin-top:20px">Upcoming Events</h3><div id="eventList" class="grid">${eventVisibleList().map(eventCard).join('')||'<div class="card"><p class="muted">No events listed yet.</p></div>'}</div>`;fireAndForget(loadEventsFromSupabase(),'events load')}
function eventForm(myBiz){myBiz=myBiz||{};return `<div class="card"><h3>Create Event</h3><label>Event Name</label><input id="evTitle" placeholder="Example: Ethiopian Summer Festival"><div class="grid two"><div><label>Category</label><select id="evCategory">${eventCategories('')}</select></div><div><label>Organizer Name</label><input id="evOrganizer" value="${eventEsc(myBiz.businessName||currentUser.name||'')}"></div></div><label>Description</label><textarea id="evDescription" placeholder="Tell the community about this event."></textarea><div class="grid two"><div><label>Date</label><input id="evDate" type="date"></div><div><label>Start Time</label><input id="evStart" type="time"></div></div><div class="grid two"><div><label>End Time</label><input id="evEnd" type="time"></div><div><label>Admission</label><select id="evAdmission"><option>Free</option><option>Paid</option></select></div></div><div class="grid three"><input id="evAdult" type="number" placeholder="Adult price"><input id="evChild" type="number" placeholder="Child price"><input id="evVip" type="number" placeholder="VIP price"></div><label>Venue Name</label><input id="evVenue" placeholder="Hall, church, restaurant, park..."><label>Address</label><input id="evAddress" placeholder="Full event address"><div class="grid three"><input id="evCity" placeholder="City"><input id="evState" placeholder="State"><input id="evZip" placeholder="ZIP"></div><div class="grid two"><input id="evPhone" placeholder="Organizer phone" value="${eventEsc(myBiz.phone||currentUser.phone||'')}"><input id="evEmail" placeholder="Organizer email" value="${eventEsc(myBiz.email||currentUser.email||'')}"></div><label>Flyer / Photo Link</label><input id="evFlyer" placeholder="Paste flyer image link or website image link"><label>Website / Social Link</label><input id="evSocial" placeholder="Facebook, Instagram, Eventbrite, website"><input id="evCapacity" type="number" placeholder="Maximum attendees optional"><button class="btn primary" onclick="submitEvent()">Submit Event for Admin Approval</button></div>`}
function filterEvents(){let q=($('eventSearch')&&$('eventSearch').value||'').toLowerCase();let c=($('eventCategory')&&$('eventCategory').value)||'All Categories';let city=($('eventCity')&&$('eventCity').value||'').toLowerCase();let admission=($('eventFree')&&$('eventFree').value)||'All';let list=eventVisibleList().filter(e=>{let hay=[e.title,e.category,e.organizerName,e.description,e.venue,e.address,e.city,e.state].join(' ').toLowerCase();return (!q||hay.includes(q))&&(c==='All Categories'||e.category===c)&&(!city||String(e.city||'').toLowerCase().includes(city))&&(admission==='All'||e.admission===admission);});if($('eventList'))$('eventList').innerHTML=list.map(eventCard).join('')||'<div class="card"><p class="muted">No matching events found.</p></div>';}
function submitEvent(){if(!requireLogin())return;let allowed=currentUser&&(currentUser.role==='event_organizer'||currentUser.role==='business_owner'||currentUser.role==='admin'||currentUser.role==='service_provider'||(currentUser.roles||[]).includes('event_organizer')||(currentUser.roles||[]).includes('business_owner'));if(!allowed)return alert('Please add the Events Organizer service first.');let title=($('evTitle').value||'').trim(),date=$('evDate').value,desc=($('evDescription').value||'').trim(),phone=($('evPhone').value||'').trim();if(!title||!date||!desc||!phone)return alert('Please enter event name, date, description, and phone number.');let ev={id:'EV'+Date.now().toString().slice(-8),title,category:$('evCategory').value,organizerName:($('evOrganizer').value||currentUser.name||'').trim(),organizerEmail:currentUser.email||'',phone,email:$('evEmail').value||currentUser.email||'',description:desc,date,startTime:$('evStart').value||'',endTime:$('evEnd').value||'',admission:$('evAdmission').value,adultPrice:$('evAdult').value||0,childPrice:$('evChild').value||0,vipPrice:$('evVip').value||0,venue:$('evVenue').value||'',address:$('evAddress').value||'',city:$('evCity').value||'',state:$('evState').value||'',zip:$('evZip').value||'',flyerUrl:$('evFlyer').value||'',social:$('evSocial').value||'',capacity:$('evCapacity').value||0,registered:[],status:currentUser.role==='admin'?'Approved':'Pending Admin Approval',createdAt:new Date().toLocaleString()};eventRecords().unshift(ev);addNote('admin.habeshaconnect@gmail.com','Event waiting for approval: '+title+' by '+ev.organizerName);sendAdminEmailNotice('Event waiting for approval','A community event was submitted for admin approval.',{Event:title,Organizer:ev.organizerName,Date:date,City:ev.city,Status:ev.status},'events');persistOnly();fireAndForget(syncEventToSupabase(ev),'event save');events();alert('Event submitted. Admin must approve before customers see it.');}
function approveEvent(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let e=eventRecords().find(x=>x.id===id);if(!e)return;if((e.status||'Pending Admin Approval')!=='Pending Admin Approval')return alert('This event is not waiting for admin approval.');e.status='Approved';addNote(e.organizerEmail,'Your event was approved: '+e.title);persistOnly();fireAndForget(syncEventToSupabase(e),'event approve');events();}
function declineEvent(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let e=eventRecords().find(x=>x.id===id);if(!e)return;if((e.status||'Pending Admin Approval')!=='Pending Admin Approval')return alert('This event is not waiting for admin decision.');if(!confirm('Decline this event?'))return;e.status='Declined';addNote(e.organizerEmail,'Your event was declined: '+e.title);persistOnly();fireAndForget(syncEventToSupabase(e),'event decline');events();}
function registerForEvent(id){if(!requireLogin())return;let e=eventRecords().find(x=>x.id===id);if(!e)return;if(e.status!=='Approved')return alert('This event is not open for registration yet.');if(e.organizerEmail===currentUser.email)return alert('You cannot register for your own event.');if(currentUser.role==='admin')return alert('Admin cannot register from the admin account.');if(!e.registered)e.registered=[];if(e.registered.some(r=>r.email===currentUser.email))return alert('You already registered interest for this event.');e.registered.push({name:currentUser.name,email:currentUser.email,phone:currentUser.phone||'',time:new Date().toLocaleString()});addNote(e.organizerEmail,currentUser.name+' registered interest for your event: '+e.title);persistOnly();fireAndForget(syncEventToSupabase(e),'event registration');alert('Registered interest. The organizer can contact you.');}

function about(){
 $('about').innerHTML=`<h2>About Habesha Connect</h2><div class="card"><p><b>Habesha Connect</b> is a beta community platform built to help Ethiopian and Habesha communities connect around shipping, rentals, trucking, jobs, marketplace listings, and business directory.</p><p class="muted">This platform is for community use. Users are responsible for confirming identity, details, safety, pricing, pickup, delivery, property information, and job/trucking terms before completing any agreement.</p><div class="actions"><button class="btn primary" onclick="show('account')">Create Account</button><button class="btn ghost" onclick="show('contact')">Contact Us</button></div></div>`;
}
function contact(){
 $('contact').innerHTML=`<h2>Contact Us</h2><div class="grid"><div class="card"><h3>Support</h3><p>For app problems, account help, or suggestions, contact Habesha Connect support.</p><p><b>Email:</b> admin.habeshaconnect@gmail.com</p><p class="muted"></p></div><div class="card"><h3>Quick Help</h3><p>Use Report Problem to send a bug report with the page name, role used, and what happened.</p><button class="btn primary" onclick="show('report')">Report a Problem</button></div></div>`;
}
function help(){
 $('help').innerHTML=`<h2>Help / FAQ</h2><div class="grid"><div class="card"><h3>Is this app live?</h3><p>Some payments and charges may be shown only after admin approval.</p></div><div class="card"><h3>Can one account use many roles?</h3><p>Yes. One account can use sender, traveler, property owner, seeker, truck owner, driver, business owner, and customer services.</p></div><div class="card"><h3>How do shipping payments work now?</h3><p>sender and traveler agree on luggage/airline and delivery details before payment. Admin can still keep internal records.</p></div><div class="card"><h3>How do rentals work?</h3><p>Owners post properties. Seekers request viewing/contact. Admin and owner can review requests.</p></div><div class="card"><h3>How does trucking work?</h3><p>Truck owners can post driver jobs and record truck information. Drivers can post job profiles and apply.</p></div><div class="card"><h3>Need help?</h3><button class="btn primary" onclick="show('contact')">Contact Us</button></div></div>`;
}
function report(){
 $('report').innerHTML=`<h2>Report a Problem</h2><div class="card"><p class="muted">Beta testers can report bugs, broken buttons, confusing screens, missing records, or dashboard issues.</p><label>Your Email</label><input id="rpEmail" value="${currentUser?.email||''}" placeholder="you@example.com"><label>Page / Service</label><select id="rpPage"><option>Shipping</option><option>Rentals</option><option>Trucking</option><option>Account</option><option>Payments</option><option>Notifications</option><option>Other</option></select><label>What happened?</label><textarea id="rpText" placeholder="Example: I signed in as driver, clicked Apply, and nothing happened."></textarea><button class="btn primary" onclick="submitReport()">Send Report</button></div>`;
}
function submitReport(){let email=($('rpEmail')?.value||'').trim(),page=$('rpPage')?.value||'Other',text=($('rpText')?.value||'').trim();if(!email||!text)return alert('Please enter your email and what happened.');addNote('admin.habeshaconnect@gmail.com','Problem report from '+email+' on '+page+': '+text);if(currentUser)addNote(currentUser.email,'Thank you. Your problem report was sent.');persistOnly();alert('Thank you. Your report was saved for admin review.');show('home');}
function privacy(){
 $('privacy').innerHTML=`<h2>Privacy Policy</h2><div class="card"><p><b>Effective:</b> Current Version</p><p>Habesha Connect collects information users provide, such as name, email, phone number, selected services/roles, shipping requests, trip posts, property listings, rental requests, trucking records, driver profiles, job posts, messages, notifications, and support reports.</p><p>We use this information to create accounts, connect users, show listings, manage requests, improve the app, prevent misuse, and support users.</p><p>service charges may be hidden from regular users. Admin may still see internal records for testing and management.</p><p>Habesha Connect does not intentionally store full payment card numbers. If online payments are added later, payment processing should be handled by a secure third-party provider.</p><p>Users should not post sensitive private information, illegal items, or information they are not authorized to share.</p><p>To request account help or data correction, contact support.</p><div class="actions"><button class="btn ghost" onclick="show('terms')">View Terms</button><button class="btn primary" onclick="show('account')">Back to Account</button></div></div>`;
}
function terms(){
 $('terms').innerHTML=`<h2>Terms of Service</h2><div class="card"><p><b>Effective:</b> Current Version</p><p>Habesha Connect is a community marketplace platform. We connect users for shipping, rentals, trucking, jobs, marketplace, and business services. Users are responsible for verifying people, listings, prices, pickup/delivery details, property details, driver/truck details, and any agreement before completing a transaction.</p><p><b>Shipping:</b> Senders and travelers must agree on package details, luggage/airline requirements, prohibited items, pickup, delivery, and payment before moving any item. Do not ship illegal, dangerous, restricted, or prohibited items.</p><p><b>Rentals:</b> Owners are responsible for accurate property information and legal permission to list. Seekers are responsible for verifying the property and agreement before paying rent or deposit.</p><p><b>Trucking:</b> Truck owners and drivers are responsible for licenses, insurance, registration, safety, job terms, and legal compliance.</p><p><b>Accounts:</b> Habesha Connect may suspend or remove accounts, listings, or posts that appear unsafe, false, abusive, illegal, or harmful to the community.</p><p><b>Testing:</b> Please verify details carefully and report problems if something does not work correctly.</p><p><b>Limitation:</b> Habesha Connect is not responsible for user agreements, losses, damages, inaccurate listings, missed deliveries, rental disputes, job disputes, or third-party actions.</p><div class="actions"><button class="btn ghost" onclick="show('privacy')">View Privacy</button><button class="btn primary" onclick="show('account')">Back to Account</button></div></div>`;
}

function notifications(){let notes=data.notifications.filter(n=>n.to==='all'||(currentUser&&n.to===currentUser.email));$('notifications').innerHTML=`<h2>🔔 Notifications</h2><div class="card"><p class="muted">Better notifications for registrations, requests, payments, approvals, messages, and account updates.</p><button class="btn ghost" onclick="markNotifsRead()">Mark All Read</button></div><div class="list" style="margin-top:14px">${notes.map(n=>`<div class="item"><b>${n.read?'':'🟢 '}${n.text}</b><p class="muted">${n.time}</p></div>`).join('')||'<p>No notifications yet.</p>'}</div>`}
async function markNotifsRead(){let visible=data.notifications.filter(n=>n.to==='all'||(currentUser&&n.to===currentUser.email));visible.forEach(n=>n.read=true);if(authReady()){let ids=visible.map(n=>n.dbId||n.id).filter(Boolean);if(ids.length){await hcSupabase.from('notifications').update({is_read:true}).in('id',ids);await loadSupabaseNotifications();}}else save();show('notifications')}

async function loadAdminProfiles(){
 if(!authReady())return data.users;
 let {data:profiles,error}=await hcSupabase.from('profiles').select('*').order('created_at',{ascending:false});
 if(error){console.warn('Admin profile load error',error);return data.users;}
 (profiles||[]).forEach(p=>upsertLocalUser(p));
 persistOnly();
 return data.users;
}
function allUserRoles(u){return Array.isArray(u.roles)&&u.roles.length?u.roles:[u.role||'customer']}
function userRoleText(u){return allUserRoles(u).map(r=>roleTitle(r)).join(', ')}

function travelerTripAdminHtml(){
 const pending=(data.trips||[]).filter(t=>['Pending Admin Approval','Pending','Submitted','Waiting Admin Approval','Pending Approval'].includes(String(t.status||'').trim()));
 return `<h3>Traveler Trips Waiting Admin Approval</h3><table><tr><th>Trip</th><th>Traveler</th><th>Phone</th><th>Route</th><th>Date</th><th>Space</th><th>Status</th><th>Actions</th></tr>${pending.map(t=>`<tr><td>${t.id}</td><td>${t.traveler||''}<br><span class="small">${t.travelerEmail||''}</span></td><td>${t.travelerPhone||''}</td><td>${t.route||''}</td><td>${t.travelDate||''}</td><td>${t.availableSpace||0} lb</td><td><span class="pill warn">${t.status}</span></td><td><button class="btn primary" onclick="approveTravelerTrip('${t.id}')">Approve</button> <button class="btn bad" onclick="declineTravelerTrip('${t.id}')">Decline</button></td></tr>`).join('')||'<tr><td colspan="8">No traveler trips waiting for approval.</td></tr>'}</table>`;
}
async function approveTravelerTrip(id){
 if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');
 let t=(data.trips||[]).find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
 if(!t)return alert('Trip not found.');
 let old=t.status;t.status='Open';
 if(authReady()&&t.dbId){let {error}=await hcSupabase.from('trips').update({status:'Open'}).eq('id',t.dbId);if(error){t.status=old;return alert('Could not approve trip: '+error.message);}}
 addNote(t.travelerEmail,'Your traveler trip '+(t.route||'')+' was approved by admin and is now visible to senders.');
 if(t.travelerEmail)sendEmailNotice({to:t.travelerEmail,name:t.traveler||'Traveler',subject:'Traveler Trip Approved',summary:'Your traveler trip was approved by admin and is now visible to senders.',buttonText:'Open Shipping Dashboard',page:'shipping',details:{Route:t.route||'',Date:t.travelDate||'',Space:(t.availableSpace||0)+' lb',Status:'Approved'}});
 persistOnly();adminSuccess();
}
async function declineTravelerTrip(id){
 if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');
 let t=(data.trips||[]).find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
 if(!t)return alert('Trip not found.');
 let reason=prompt('Reason for declining this trip?','Admin declined this traveler trip.');
 if(reason===null)return;
 let old=t.status;t.status='Declined';
 if(authReady()&&t.dbId){let {error}=await hcSupabase.from('trips').update({status:'Declined'}).eq('id',t.dbId);if(error){t.status=old;return alert('Could not decline trip: '+error.message);}}
 addNote(t.travelerEmail,'Your traveler trip '+(t.route||'')+' was declined by admin. '+(reason||''));
 if(t.travelerEmail)sendEmailNotice({to:t.travelerEmail,name:t.traveler||'Traveler',subject:'Traveler Trip Declined',summary:'Your traveler trip was declined by admin.',buttonText:'Open Shipping Dashboard',page:'shipping',details:{Route:t.route||'',Date:t.travelDate||'',Reason:reason||'Admin declined this trip',Status:'Declined'}});
 persistOnly();adminSuccess();
}


function businessAdminManagementHtml(){let rows=bmPendingProfiles().map(b=>`<tr><td>${bmEsc(b.businessName||b.name||'Business')}</td><td>${bmEsc(b.category||b.type||'')}</td><td>${bmEsc(b.city||'')}</td><td>${bmEsc(b.ownerEmail||'')}</td><td>${bmEsc(b.phone||'')}</td><td>${bmEsc(b.status||'Pending Admin Approval')}</td><td><button class="btn primary" onclick="adminApproveBusinessProfile('${b.id}')">Approve</button> <button class="btn bad" onclick="adminDeclineBusinessProfile('${b.id}')">Decline</button></td></tr>`).join('')||'<tr><td colspan="7">No business profiles waiting for approval.</td></tr>';return `<h3>Business Directory Approvals</h3><table><tr><th>Business</th><th>Category</th><th>City</th><th>Owner</th><th>Phone</th><th>Status</th><th>Actions</th></tr>${rows}</table>`}
async function adminApproveBusinessProfile(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let b=businessRecords().find(x=>x.id===id||x.dbId===id);if(!b)return alert('Business profile not found.');if((b.status||'Pending Admin Approval')!=='Pending Admin Approval')return alert('This business profile is not waiting for admin approval.');b.status='Approved';b.approvedAt=new Date().toLocaleString();persistOnly();fireAndForget(syncBusinessRecordToSupabase(b),'business approve sync');addNote(b.ownerEmail,'Your Business Directory profile was approved and is now public.');sendEmailNotice({to:b.ownerEmail,name:b.ownerName||b.businessName,subject:'Business profile approved',summary:'Your Business Directory profile was approved and is now visible to customers.',buttonText:'Open Business Directory',page:'business',details:{Business:b.businessName||b.name,Category:b.category||b.type,Status:'Approved'}});adminSuccess('Business profile approved.');}
async function adminDeclineBusinessProfile(id){if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');let b=businessRecords().find(x=>x.id===id||x.dbId===id);if(!b)return alert('Business profile not found.');if((b.status||'Pending Admin Approval')!=='Pending Admin Approval')return alert('This business profile is not waiting for admin decision.');b.status='Declined';b.declinedAt=new Date().toLocaleString();persistOnly();fireAndForget(syncBusinessRecordToSupabase(b),'business decline sync');addNote(b.ownerEmail,'Your Business Directory profile was declined by admin.');sendEmailNotice({to:b.ownerEmail,name:b.ownerName||b.businessName,subject:'Business profile declined',summary:'Your Business Directory profile was declined by admin.',buttonText:'Open Business Directory',page:'business',details:{Business:b.businessName||b.name,Status:'Declined'}});adminSuccess('Business profile declined.');}

async function admin(){
 document.documentElement.style.overflowY='auto'; document.documentElement.style.overflow='auto'; document.body.style.overflowY='auto'; document.body.style.overflow='auto'; document.body.style.position='static'; document.body.style.touchAction='pan-y';
 if(!currentUser||currentUser.role!=='admin'){$('admin').innerHTML='<div class="card"><h2>Admin Access Required</h2><p>Please login as admin or switch to the Admin role.</p></div>';return}
 adminLoading=true;
 try{
   // V7.8.46 Admin fast-load fix: open Admin immediately from current/local data.
   // Supabase refresh runs in the background and re-renders Admin when finished.
   if(authReady()&&!adminDataLoaded&&!adminBackgroundRefreshing){
     adminBackgroundRefreshing=true;
     (async()=>{
       const adminSafeLoad=async(fn,label)=>{
         try{ if(typeof fn==='function') await safeAsync(fn(),3500,label); }
         catch(e){ console.warn((label||'Admin data load')+' failed; Admin stayed open with available local data.',e); }
       };
       try{
         await adminSafeLoad(loadSupabaseRentals,'Admin rentals load');
         await adminSafeLoad(loadSupabaseRentalRequests,'Admin rental requests load');
         await adminSafeLoad(loadSupabasePayments,'Admin payments load');
         await adminSafeLoad(loadSupabaseTrucking,'Admin trucking load');
         await adminSafeLoad(loadSupabaseMarketplace,'Admin marketplace load');
         await adminSafeLoad(loadAdminProfiles,'Admin profiles load');
         adminDataLoaded=true;
       }finally{
         adminBackgroundRefreshing=false;
         if(currentPage==='admin')admin();
       }
     })();
   }
 let revenue=data.payments.reduce((a,p)=>a+p.amount,0);
 let managedRoles=['sender','traveler','owner','rent_seeker','truck_owner','customer','driver','business_owner','marketplace','taxi_limo_owner','taxi_limo_driver','admin'];
 let q=($('userSearch')&&$('userSearch').value||'').toLowerCase();
 let managedUsers=data.users.filter(u=>managedRoles.some(r=>allUserRoles(u).includes(r))).filter(u=>!q||(u.name||'').toLowerCase().includes(q)||(u.email||'').toLowerCase().includes(q)||(u.phone||'').includes(q)||userRoleText(u).toLowerCase().includes(q));
 let monthly=reportRows('month'), quarterly=reportRows('quarter'), yearly=reportRows('year');
 $('admin').innerHTML=`<h2>⚙️ Admin Verification Center</h2>${adminBackgroundRefreshing?'<div class="notice"><b>Refreshing Admin data from Supabase...</b> You can keep working while this updates in the background.</div>':''}<div class='notice'><b>Admin Final Cleanup:</b> Admin opens immediately, then Supabase refreshes in the background so buttons do not freeze.</div>
 <h3>Daily Admin Management</h3><div class="notice"><b>Priority:</b> Shipping Management, Rental Listing Management, and Rental Requests Management are now at the top for faster daily work.</div>
 ${marketplaceAdminManagementHtml()}${taxiAdminHtml()}${homeServicesAdminHtml()}${businessAdminManagementHtml()}${eventsAdminManagementHtml()}${travelerTripAdminHtml()}<h3>Shipping Management</h3><div class="card"><h3>Official Shipping Money Flow</h3><ol><li>Sender requests space from a traveler trip.</li><li>Traveler accepts or declines.</li><li>Sender pays Habesha Connect.</li><li>Admin approves payment, contact details unlock, and remaining space is reduced.</li><li>Package is delivered.</li><li>Admin manually pays traveler commission and marks Traveler Paid.</li></ol><p class="muted">For Version 1, traveler payouts are manual: Zelle, PayPal, Cash App, or bank transfer. The app records the payout status for admin reports.</p></div><table><tr><th>ID</th><th>Tracking</th><th>Route</th><th>Sender</th><th>Traveler</th><th>Status</th><th>Beta Status</th><th>Traveler Payout</th><th>Actions</th></tr>${data.shipments.map(s=>`<tr><td>${s.id}</td><td>${s.tracking||''}</td><td>${s.route}</td><td>${s.sender} ${verifiedBadge(s.senderVerified)}</td><td>${s.traveler} ${s.travelerEmail?verifiedBadge(s.travelerVerified):''}</td><td>${s.status}</td><td>${s.paid?'Paid':'Unpaid'}</td><td>${s.travelerPaid?'Paid':'Not paid'} ${s.travelerPayoutMethod?('('+s.travelerPayoutMethod+')'):''}</td><td><button class="btn primary" onclick="approveShipment('${s.id}')">Approve Payment</button> <button class="btn ghost" onclick="markDelivered('${s.id}')">Mark Delivered</button> <button class="btn ghost" onclick="payTraveler('${s.id}')">Pay Traveler</button> <button class="btn ghost" onclick="editShipment('${s.id}')">Edit</button> <button class="btn bad" onclick="deleteShipment('${s.id}')">Delete</button></td></tr>`).join('')}</table>
 
 ${rentalStatsCards('📊 Rental Statistics',rentalStatsFor(data.rentals,data.rentalRequests))}<h3>Rental Listings Management</h3><table><tr><th>ID</th><th>Type</th><th>Property</th><th>City</th><th>Owner</th><th>Rating</th><th>Owner Fee</th><th>Status</th><th>Actions</th></tr>${data.rentals.map((r,i)=>`<tr><td>${friendlyRentalId(r,i)}</td><td>${r.propertyType||'Property'}</td><td>${r.title}</td><td>${r.city}</td><td>${r.owner}</td><td>⭐ ${avgOwnerRating(r.ownerEmail)||'New'}</td><td>${r.ownerPaid?'Paid '+money(r.ownerFee||settings().ownerListingFee):'Pending'}</td><td>${rentalStatusBadge(r.status)}</td><td><button class="btn primary" onclick="approveRental('${r.id}')">Approve</button> <button class="btn ghost" onclick="editRental('${r.id}')">Edit</button> <button class="btn bad" onclick="deleteRental('${r.id}')">Delete</button></td></tr>`).join('')||'<tr><td colspan="9">No rental listings yet.</td></tr>'}</table>
 
 <h3>Rental Requests Management</h3><table><tr><th>ID</th><th>Property</th><th>Owner</th><th>Rent Seeker</th><th>Phone</th><th>Beta Status</th><th>Status</th><th>Actions</th></tr>${data.rentalRequests.map(q=>`<tr><td>${q.id}</td><td>${q.propertyTitle}</td><td>${q.ownerName}</td><td>${q.seekerName}</td><td>${q.seekerPhone||''}</td><td>${q.paymentStatus||'Paid'} ${q.amountPaid?money(q.amountPaid):''}</td><td>${rentalStatusBadge(q.status)}</td><td><button class="btn primary" onclick="approveRentalReq('${q.id}')">Approve</button> <button class="btn ghost" onclick="editRentalRequest('${q.id}')">Edit</button> <button class="btn bad" onclick="deleteRentalRequest('${q.id}')">Delete</button></td></tr>`).join('')||'<tr><td colspan="8">No rental requests yet.</td></tr>'}</table>${truckAdminManagementHtml()}<div class='actions'><button class='btn ghost' onclick='exportData()'>Export Data</button></div>
 
 <h3>Verify Users</h3><div class="card"><p class="muted">Click Verify after reviewing the user. This changes the real Supabase <b>profiles.verified</b> value.</p><table><tr><th>Name</th><th>Phone</th><th>Email</th><th>Services</th><th>Status</th><th>Action</th></tr>${managedUsers.map(u=>`<tr><td>${u.name}</td><td>${u.phone||''}</td><td>${u.email}</td><td>${userRoleText(u)}</td><td>${u.verified?'<span class="pill good">Verified</span>':'<span class="pill warn">Not Verified</span>'}</td><td>${u.verified?`<button type="button" class="btn warn" onclick="unverifyUser('${u.email}')">Unverify</button>`:`<button type="button" class="btn primary" onclick="approveUser('${u.email}')">Verify</button>`}</td></tr>`).join('')||'<tr><td colspan="6">No users found.</td></tr>'}</table></div>
 <div class="grid"><div class="card"><p>Users</p><div class="stat">${managedUsers.length}</div></div><div class="card"><p>Total Revenue</p><div class="stat">${money(revenue)}</div></div><div class="card"><p>Favorites Saved</p><div class="stat">${data.favorites.length}</div></div><div class="card"><p>Reviews</p><div class="stat">${data.reviews.length}</div></div></div>
 <h3>Admin Settings</h3><div class="grid"><div class="card"><h3>Prices</h3><label>Owner listing fee</label><input type="number" value="${settings().ownerListingFee}" onchange="setMoneySetting('ownerListingFee',this.value)"><label>Seeker viewing fee</label><input type="number" value="${settings().seekerViewingFee}" onchange="setMoneySetting('seekerViewingFee',this.value)"><label>Shipping rate per lb</label><input type="number" value="${settings().shippingRatePerLb}" onchange="setMoneySetting('shippingRatePerLb',this.value)"><label>App commission per lb</label><input type="number" value="${settings().appCommissionPerLb}" onchange="setMoneySetting('appCommissionPerLb',this.value)"><label>Traveler commission per lb</label><input type="number" value="${settings().travelerCommissionPerLb}" onchange="setMoneySetting('travelerCommissionPerLb',this.value)"><label>Traveler trip listing fee</label><input type="number" value="${settings().travelerTripListingFee}" onchange="setMoneySetting('travelerTripListingFee',this.value)"></div><div class="card"><h3>Launch Controls</h3><p><b>Registration:</b> ${settings().registrationOpen?'Open':'Closed'}</p><p><b>Maintenance Mode:</b> ${settings().maintenanceMode?'On':'Off'}</p><div class="actions"><button class="btn ghost" onclick="toggleRegistration()">Toggle Registration</button><button class="btn warn" onclick="toggleMaintenance()">Toggle Maintenance</button></div><p class="muted">Use these controls before going live. Real database, Stripe/PayPal, and cloud image storage are the next deployment connections.</p></div></div><h3>Launch Checklist</h3><div class="card"><p>✅ UI complete • ✅ Admin reports • ✅ User verification • ✅ Payment records • ✅ Chat • ✅ Notifications • ✅ Export data</p><p class="muted">Use this admin checklist to verify database, payments, messaging, notifications, and image storage before public launch.</p></div><h3>Search Users / Verification</h3><div class="card"><label>Search by name, email, phone, or role</label><input id="userSearch" value="${q}" oninput="admin()" placeholder="Search users"><p class="muted">Verify users after reviewing ID, ticket/booking, phone, and account details. Shipment space updates after sender payment and admin approval. Non-admin users only see their own payment information.</p></div><div class="tableWrap"><table><tr><th>Name</th><th>Phone</th><th>Email</th><th>Services</th><th>Active Role</th><th>Status</th><th>Actions</th></tr>${managedUsers.map(u=>`<tr><td>${u.name}</td><td>${u.phone||''}</td><td>${u.email}</td><td>${userRoleText(u)}</td><td>${roleTitle(u.role||u.active_role||'customer')}</td><td>${u.verified?'<span class="pill good">Verified</span>':'<span class="pill warn">Not Verified</span>'}</td><td>${u.verified?`<button class="btn warn" onclick="unverifyUser('${u.email}')">Unverify</button>`:`<button class="btn primary" onclick="approveUser('${u.email}')">Verify</button>`} <button class="btn ghost" onclick="editUser('${u.email}')">Edit</button> <button class="btn bad" onclick="deleteUser('${u.email}')">Delete</button></td></tr>`).join('')||'<tr><td colspan="7">No matching users.</td></tr>'}</table>
 <h3>Payment History</h3><table><tr><th>User</th><th>Service</th><th>Description</th><th>Amount</th><th>Time</th></tr>${data.payments.map(p=>`<tr><td>${p.user}</td><td>${p.service}</td><td>${p.desc}</td><td>${money(p.amount)}</td><td>${p.time}</td></tr>`).join('')||'<tr><td colspan="5">No payments yet.</td></tr>'}</table>
 <h3>Reports</h3><div class="grid"><div class="card"><h3>Monthly</h3>${monthly}</div><div class="card"><h3>Quarterly</h3>${quarterly}</div><div class="card"><h3>Yearly</h3>${yearly}</div></div>
 <h3>Traveler Listing Fees</h3><table><tr><th>Traveler</th><th>Trip</th><th>Fee</th><th>Status</th></tr>${data.trips.map(t=>`<tr><td>${t.traveler}</td><td>${t.route}</td><td>${money(t.listingFeeAmount||settings().travelerTripListingFee)}</td><td>${t.listingFeeRefunded?'<span class="pill good">Refunded</span>':(t.listingFeePaid?'<span class="pill warn">Pending Refund</span>':'<span class="pill bad">Unpaid</span>')}</td></tr>`).join('')||'<tr><td colspan="4">No traveler listing fees yet.</td></tr>'}</table>

 `
 } finally { adminLoading=false; }
}
function reportRows(field){let rows={};(data.payments||[]).forEach(p=>{let k=p[field]||'Unknown';rows[k]=(rows[k]||0)+(+p.amount||0)});let keys=Object.keys(rows).sort().reverse();return keys.length?`<table><tr><th>Period</th><th>Total</th></tr>${keys.map(k=>`<tr><td>${k}</td><td>${money(rows[k])}</td></tr>`).join('')}</table>`:'<p class="muted">No payments yet.</p>'}
async function saveAppSettingsToSupabase(){if(!authReady())return {error:null};let payload={id:1,owner_listing_fee:settings().ownerListingFee,seeker_viewing_fee:settings().seekerViewingFee,shipping_rate_per_lb:settings().shippingRatePerLb,traveler_commission_per_lb:settings().travelerCommissionPerLb,traveler_trip_listing_fee:settings().travelerTripListingFee,app_commission_per_lb:settings().appCommissionPerLb,registration_open:settings().registrationOpen,maintenance_mode:settings().maintenanceMode,updated_at:new Date().toISOString()};return await hcSupabase.from('app_settings').upsert(payload,{onConflict:'id'});}
async function toggleRegistration(){settings().registrationOpen=!settings().registrationOpen;let res=await saveAppSettingsToSupabase();if(res.error){settings().registrationOpen=!settings().registrationOpen;return alert('Could not update registration setting: '+res.error.message)}persistOnly();adminSuccess()}
async function toggleMaintenance(){settings().maintenanceMode=!settings().maintenanceMode;let res=await saveAppSettingsToSupabase();if(res.error){settings().maintenanceMode=!settings().maintenanceMode;return alert('Could not update maintenance setting: '+res.error.message)}persistOnly();adminSuccess()}
async function approveUser(email){
  let u=data.users.find(x=>x.email===email);
  if(!u)return alert('User not found.');
  let old=!!u.verified; u.verified=true;
  let res={error:null};
  if(authReady())res=await hcSupabase.from('profiles').update({verified:true}).eq('email',email);
  if(res.error){u.verified=old;return alert('Could not verify user in Supabase: '+res.error.message)}
  data.trips.forEach(t=>{if(t.travelerEmail===email)t.travelerVerified=true});
  data.shipments.forEach(s=>{if(s.senderEmail===email)s.senderVerified=true;if(s.travelerEmail===email)s.travelerVerified=true});
  addNote(u.email,'Your Habesha Connect account was verified by admin.');
  persistOnly();
  await refreshAdminData();
  adminSuccess();
}
async function unverifyUser(email){
  let u=data.users.find(x=>x.email===email);
  if(!u)return alert('User not found.');
  if(!confirm('Remove verified status from '+u.name+'?'))return;
  let old=!!u.verified; u.verified=false;
  let res={error:null};
  if(authReady())res=await hcSupabase.from('profiles').update({verified:false}).eq('email',email);
  if(res.error){u.verified=old;return alert('Could not unverify user in Supabase: '+res.error.message)}
  data.trips.forEach(t=>{if(t.travelerEmail===email)t.travelerVerified=false});
  data.shipments.forEach(s=>{if(s.senderEmail===email)s.senderVerified=false;if(s.travelerEmail===email)s.travelerVerified=false});
  addNote(u.email,'Your Habesha Connect verification status was changed by admin.');
  persistOnly();
  await refreshAdminData();
  adminSuccess();
}
async function editUser(email){
  let u=data.users.find(x=>x.email===email);
  if(!u)return alert('User not found.');
  let name=prompt('Edit full name:',u.name); if(name===null)return;
  let phone=prompt('Edit phone number:',u.phone||''); if(phone===null)return;
  let role=prompt('Edit active role (sender, traveler, owner, rent_seeker, customer, driver, business_owner, admin):',u.role||u.active_role||'customer'); if(role===null)return;
  name=name.trim()||u.name; phone=phone.trim(); role=role.trim()||u.role||'customer';
  let old={name:u.name,phone:u.phone,role:u.role,active_role:u.active_role,roles:[...(u.roles||[])]};
  u.name=name;u.phone=phone;u.role=role;u.active_role=role;if(!Array.isArray(u.roles))u.roles=[];if(!u.roles.includes(role))u.roles.push(role);
  let res={error:null};
  if(authReady())res=await hcSupabase.from('profiles').update({name,phone,role,active_role:role,roles:u.roles}).eq('email',email);
  if(res.error){Object.assign(u,old);return alert('Could not edit user in Supabase: '+res.error.message)}
  persistOnly(); await refreshAdminData(); adminSuccess();
}
async function deleteUser(email){
  let u=data.users.find(x=>x.email===email);
  if(!u)return alert('User not found.');
  if((u.roles||[]).includes('admin')||u.role==='admin')return alert('Admin account cannot be deleted here.');
  if(!confirm('Delete profile for '+u.name+'? This removes the profile row, not the Supabase Auth login.'))return;
  let backup=[...data.users];
  data.users=data.users.filter(x=>x.email!==email);
  let res={error:null};
  if(authReady())res=await hcSupabase.from('profiles').delete().eq('email',email);
  if(res.error){data.users=backup;return alert('Could not delete profile in Supabase: '+res.error.message)}
  persistOnly(); await refreshAdminData(); adminSuccess();
}
async function approveShipment(id){
  let s=data.shipments.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!s)return alert('Shipment not found.');
  let old={status:s.status,paid:s.paid,paymentStatus:s.paymentStatus,spaceDeducted:s.spaceDeducted};
  let t=s.tripId?data.trips.find(x=>String(x.id)===String(s.tripId)):null;
  let oldTrip=t?{availableSpace:t.availableSpace,status:t.status}:null;
  if(t&&!s.spaceDeducted){if(s.weight>t.availableSpace)return alert('Not enough space left. Remaining: '+t.availableSpace+' lb');t.availableSpace=Math.max(0,Number(t.availableSpace||0)-Number(s.weight||0));t.status=t.availableSpace===0?'Full':'Open';s.spaceDeducted=true;}
  s.status='Approved';s.paid=true;s.paymentStatus='Paid';
  let res={error:null};
  if(authReady()&&s.dbId){res=await hcSupabase.from('shipments').update({status:'Approved',paid:true}).eq('id',s.dbId);}
  if(!res.error&&authReady()&&t&&t.dbId){res=await hcSupabase.from('trips').update({remaining_space_lb:t.availableSpace,status:t.status}).eq('id',t.dbId);}
  if(res.error){Object.assign(s,old);if(t&&oldTrip)Object.assign(t,oldTrip);return alert('Could not approve shipment in Supabase: '+res.error.message)}
  addNote(s.senderEmail||'all','Your shipment '+(s.tracking||id)+' was approved by admin. Traveler contact is now available.');sendEmailNotice({to:s.senderEmail,name:s.sender,subject:'Shipping request approved',summary:'Your shipping request was approved by admin. Traveler contact is now available.',buttonText:'Open Shipping Dashboard',page:'shipping',details:{Tracking:s.tracking||id,Status:'Approved'}});
  if(s.travelerEmail){addNote(s.travelerEmail,'Shipment '+(s.tracking||id)+' was approved by admin. Sender and receiver contact are now available.');sendEmailNotice({to:s.travelerEmail,name:s.traveler,subject:'Shipping request approved',summary:'A shipment was approved by admin. Sender and receiver contact are now available.',buttonText:'Open Shipping Dashboard',page:'shipping',details:{Tracking:s.tracking||id,Status:'Approved'}});}
  persistOnly(); await refreshAdminData(); adminSuccess();
}
async function markDelivered(id){
  let s=data.shipments.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!s)return alert('Shipment not found.');
  if(!confirm('Mark shipment '+(s.tracking||id)+' as delivered/completed? It will only show in Admin after this.'))return;
  let old=s.status;s.status='Delivered';
  let relatedTrip=s.tripId?data.trips.find(t=>String(t.id)===String(s.tripId)||String(t.dbId)===String(s.tripId)):null;
  let oldTrip=relatedTrip?{status:relatedTrip.status,availableSpace:relatedTrip.availableSpace}:null;
  if(relatedTrip){relatedTrip.status='Delivered';relatedTrip.availableSpace=0;}
  let res={error:null};
  if(authReady()&&s.dbId)res=await hcSupabase.from('shipments').update({status:'Delivered'}).eq('id',s.dbId);
  if(!res.error&&authReady()&&relatedTrip&&relatedTrip.dbId)res=await hcSupabase.from('trips').update({status:'Delivered',remaining_space_lb:0}).eq('id',relatedTrip.dbId);
  if(res.error){s.status=old;if(relatedTrip&&oldTrip)Object.assign(relatedTrip,oldTrip);return alert('Could not mark delivered in Supabase: '+res.error.message)}
  addNote('admin.habeshaconnect@gmail.com','Shipment '+(s.tracking||id)+' was marked delivered. The related traveler trip is removed from sender availability.');
  if(s.senderEmail){addNote(s.senderEmail,'Your shipment '+(s.tracking||id)+' was marked delivered.');sendEmailNotice({to:s.senderEmail,name:s.sender||'Sender',subject:'Shipment delivered',summary:'Your shipment was marked delivered.',buttonText:'Open Shipping Dashboard',page:'shipping',details:{Tracking:s.tracking||id,Status:'Delivered'}});}
  if(s.travelerEmail){addNote(s.travelerEmail,'Shipment '+(s.tracking||id)+' was marked delivered. Admin can now process payout.');sendEmailNotice({to:s.travelerEmail,name:s.traveler||'Traveler',subject:'Shipment marked delivered',summary:'The shipment was marked delivered. Admin can now process traveler payout.',buttonText:'Open Shipping Dashboard',page:'shipping',details:{Tracking:s.tracking||id,Status:'Delivered'}});}
  persistOnly(); await refreshAdminData(); adminSuccess();
}

async function payTraveler(id){
  let s=data.shipments.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!s)return alert('Shipment not found.');
  if(!['Delivered','Completed'].includes(s.status||'')){
    if(!confirm('Traveler payout is recommended only after delivery is completed. Continue anyway?'))return;
  }
  if(s.travelerPaid){alert('Traveler payout is already marked paid.');return;}
  let baseAmount=Number(s.weight||0)*settings().travelerCommissionPerLb;
  let trip=s.tripId?data.trips.find(t=>String(t.id)===String(s.tripId)):null;
  let listingRefund=(trip&&trip.listingFeePaid&&!trip.listingFeeRefunded)?Number(trip.listingFeeAmount||settings().travelerTripListingFee||10):0;
  let amount=baseAmount+listingRefund;
  let method=prompt('Payout method (Zelle, PayPal, Cash App, Bank Transfer, Cash):','Zelle'); if(method===null)return;
  let note=prompt('Payout note or confirmation number:','Manual payout completed'); if(note===null)return;
  s.travelerPaid=true;
  s.travelerPaidAt=new Date().toLocaleString();
  s.travelerPayoutMethod=method||'Manual';
  s.travelerPayoutNote=note||'';
  s.status='Completed';
  await recordPayment('Traveler Payout',amount,'Traveler commission payout for shipment '+(s.tracking||s.id)+(listingRefund?' including '+money(listingRefund)+' trip listing fee refund':'')+' via '+s.travelerPayoutMethod,s.travelerEmail||'traveler');
  let res={error:null};
  if(authReady()&&s.dbId){
    res=await hcSupabase.from('shipments').update({traveler_paid:true,traveler_paid_at:new Date().toISOString(),traveler_payout_method:s.travelerPayoutMethod,traveler_payout_note:s.travelerPayoutNote,listing_fee_refund:listingRefund,status:'Completed'}).eq('id',s.dbId);
    if(res.error&&String(res.error.message||'').toLowerCase().includes('column')){
      alert('Traveler payout was recorded locally. Supabase is missing traveler payout columns. Please run the latest Supabase SQL for this project.');
      res={error:null};
    }
  }
  if(res.error){s.travelerPaid=false;return alert('Could not save traveler payout in Supabase: '+res.error.message)}
  s.travelerListingFeeRefund=listingRefund;s.travelerPayoutAmount=amount;
  if(trip&&listingRefund){trip.listingFeeRefunded=true;if(authReady()&&trip.dbId){await hcSupabase.from('trips').update({listing_fee_refunded:true}).eq('id',trip.dbId);}}
  addNote(s.travelerEmail||'all','Your traveler commission for shipment '+(s.tracking||s.id)+' was marked paid by admin.');
  sendEmailNotice({
    to:s.travelerEmail,
    name:s.traveler,
    subject:'Your Payout Has Been Released',
    summary:'Good news! Your payout for the completed shipment has been released.',
    buttonText:'Open Traveler Dashboard',
    page:'shipping',
    details:{
      Tracking:s.tracking||s.id,
      Sender:s.sender||'Sender',
      Route:s.route||'',
      Amount:money(amount),
      Method:s.travelerPayoutMethod||'Manual',
      Note:s.travelerPayoutNote||''
    }
  });
  persistOnly(); await refreshAdminData(); adminSuccess();
}

async function editShipment(id){
  let s=data.shipments.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!s)return alert('Shipment not found.');
  let route=prompt('Edit route:',s.route||''); if(route===null)return;
  let status=prompt('Edit status:',s.status||'Requested'); if(status===null)return;
  let receiver=prompt('Edit receiver name:',s.receiver||''); if(receiver===null)return;
  let receiverPhone=prompt('Edit receiver phone:',s.receiverPhone||''); if(receiverPhone===null)return;
  let old={route:s.route,status:s.status,receiver:s.receiver,receiverPhone:s.receiverPhone};
  s.route=route.trim()||s.route; s.status=status.trim()||s.status; s.receiver=receiver.trim(); s.receiverPhone=receiverPhone.trim();
  let res={error:null};
  if(authReady()&&s.dbId){let parts=(s.route||'').split('→').map(x=>x.trim());let payload={status:s.status,receiver_name:s.receiver,receiver_phone:s.receiverPhone};if(parts[0])payload.from_city=parts[0];if(parts[1])payload.to_city=parts[1];res=await hcSupabase.from('shipments').update(payload).eq('id',s.dbId)}
  if(res.error){Object.assign(s,old);return alert('Could not edit shipment in Supabase: '+res.error.message)}
  persistOnly(); await refreshAdminData(); adminSuccess();
}
async function deleteShipment(id){
  let s=data.shipments.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!s)return alert('Shipment not found.');
  if(!confirm('Delete shipment '+(s.tracking||id)+'?'))return;
  let backup=[...data.shipments]; data.shipments=data.shipments.filter(x=>String(x.id)!==String(id)&&String(x.dbId)!==String(id));
  let res={error:null};
  if(authReady()&&s.dbId)res=await hcSupabase.from('shipments').delete().eq('id',s.dbId);
  if(res.error){data.shipments=backup;return alert('Could not delete shipment in Supabase: '+res.error.message)}
  persistOnly(); await refreshAdminData(); adminSuccess();
}
async function approveRental(id){
  let r=data.rentals.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!r)return alert('Rental not found.');
  if(!r.ownerPaid&&currentUser&&currentUser.role==='admin')return alert('Owner listing fee is not paid yet.');
  r.status='Approved';
  let res={error:null};
  if(authReady()&&r.dbId)res=await hcSupabase.from('properties').update({status:'Approved'}).eq('id',r.dbId);
  if(res.error)return alert('Could not approve rental in Supabase: '+res.error.message);
  addNote(r.ownerEmail||'all','Your rental listing '+id+' was approved by admin.');sendEmailNotice({to:r.ownerEmail,name:r.owner,subject:'Property listing approved',summary:'Your rental listing was approved by admin and is now available.',buttonText:'Open Rental Dashboard',page:'rentals',details:{Property:r.title,Status:'Approved'}});
  persistOnly(); adminSuccess();
}
async function editRental(id){
  let r=data.rentals.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!r)return alert('Rental not found.');
  let type=prompt('Edit property type (Home, Apartment, Basement, Roommate, Town House, Business):',r.propertyType||'Home'); if(type===null)return;
  let title=prompt('Edit property title:',r.title); if(title===null)return;
  let city=prompt('Edit city:',r.city); if(city===null)return;
  let price=prompt('Edit monthly rent:',r.price); if(price===null)return;
  let status=prompt('Edit status:',r.status); if(status===null)return;
  r.propertyType=type.trim()||r.propertyType||'Home'; r.title=title.trim()||r.title; r.city=city.trim()||r.city; r.price=Number(price)||r.price; r.status=status.trim()||r.status;
  let res={error:null};
  if(authReady()&&r.dbId)res=await hcSupabase.from('properties').update({property_type:r.propertyType,title:r.title,city:r.city,monthly_rent:r.price,status:r.status}).eq('id',r.dbId);
  if(res.error)return alert('Could not edit rental in Supabase: '+res.error.message);
  persistOnly();
  if(currentPage==='admin') adminSuccess(); else await rentals();
}
async function deleteRental(id){
  let r=data.rentals.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!r)return alert('Rental not found.');
  if(!confirm('Delete rental listing '+id+'?'))return;
  let res={error:null}; if(authReady()&&r.dbId)res=await hcSupabase.from('properties').delete().eq('id',r.dbId);
  if(res.error)return alert('Could not delete rental in Supabase: '+res.error.message);
  data.rentals=data.rentals.filter(x=>String(x.id)!==String(id)&&String(x.dbId)!==String(id));
  data.rentalRequests=data.rentalRequests.filter(x=>String(x.rentalId)!==String(id)&&String(x.rentalId)!==String(r.dbId||''));
  persistOnly();
  if(currentPage==='admin') adminSuccess(); else await rentals();
}
async function editRentalRequest(id){
  let q=data.rentalRequests.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!q)return alert('Rental request not found.');
  let status=prompt('Edit request status:',q.status); if(status===null)return;
  let seekerPhone=prompt('Edit rent seeker phone:',q.seekerPhone||''); if(seekerPhone===null)return;
  q.status=status.trim()||q.status; q.seekerPhone=seekerPhone.trim();
  let res={error:null}; if(authReady()&&q.dbId)res=await hcSupabase.from('rental_requests').update({status:q.status}).eq('id',q.dbId);
  if(res.error)return alert('Could not edit rental request in Supabase: '+res.error.message);
  persistOnly(); adminSuccess();
}
async function deleteRentalRequest(id){
  let q=data.rentalRequests.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!q)return alert('Rental request not found.');
  if(!confirm('Delete rental request '+id+'?'))return;
  let res={error:null}; if(authReady()&&q.dbId)res=await hcSupabase.from('rental_requests').delete().eq('id',q.dbId);
  if(res.error)return alert('Could not delete rental request in Supabase: '+res.error.message);
  data.rentalRequests=data.rentalRequests.filter(x=>String(x.id)!==String(id)&&String(x.dbId)!==String(id));
  persistOnly(); adminSuccess();
}
async function refreshAdminData(){
  if(authReady()){
    await loadAdminProfiles();
    await loadSupabaseTrips();
    await loadSupabaseShipments();
    await loadSupabaseRentals();
    await loadSupabaseRentalRequests();
  }
}


function setupAdminOneClickProtection(){
  document.addEventListener('click', function(e){
    const btn=e.target.closest('#admin button, #services button');
    if(!btn) return;
    if(btn.dataset.busy==='1'){
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
    const isActionButton = /Verify|Unverify|Approve|Delete|Edit|Toggle|Save My Services/.test((btn.textContent||''));
    if(!isActionButton) return;
    btn.dataset.busy='1';
    btn.dataset.oldText=btn.textContent;
    setTimeout(()=>{
      btn.disabled=true;
      btn.textContent='Working...';
      btn.style.opacity='0.65';
      btn.style.cursor='wait';
    },0);
    // Re-enable fallback in case a prompt is cancelled or Supabase is slow.
    setTimeout(()=>{
      if(document.body.contains(btn)){
        btn.disabled=false;
        btn.textContent=btn.dataset.oldText||btn.textContent;
        btn.dataset.busy='0';
        btn.style.opacity='';
        btn.style.cursor='';
      }
    },6500);
  }, true);
}
setupAdminOneClickProtection();
function adminSuccess(message){
  if(message) console.log(message);
  persistOnly();
  adminDataLoaded=false;
  if(currentPage==='admin'){setTimeout(()=>admin(),150)}else{setTimeout(()=>show('admin'),150);}
}


function exportData(){let blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='habesha-connect-data.json';a.click();}

/* V7.0.0 Language Support: English / Amharic */
const LANG_KEY='hc_language';
const HC_I18N={
  am:{
    'Home':'መነሻ','Account':'መለያ','Profile':'መገለጫ','My Services':'የእኔ አገልግሎቶች','Shipping':'ጭነት','Rentals':'ቤት ኪራይ','Marketplace':'ገበያ','Jobs':'ስራዎች','Trucking':'የጭነት መኪና','Business Directory':'የንግድ ማውጫ','Events':'ዝግጅቶች','Messages':'መልዕክቶች','Notifications':'ማሳወቂያዎች','Admin':'አስተዳዳሪ',
    'Login / Register':'ግባ / ተመዝገብ','Login':'ግባ','Create Account':'መለያ ፍጠር','Logout':'ውጣ','Save':'አስቀምጥ','Cancel':'ሰርዝ','Approve':'አጽድቅ','Decline':'ውድቅ','Delete':'ሰርዝ','Edit':'አስተካክል','Open':'ክፈት','Open My Dashboard':'የእኔን ዳሽቦርድ ክፈት','Admin Dashboard':'የአስተዳዳሪ ዳሽቦርድ','Start Shipping':'ጭነት ጀምር','Find Rentals':'ቤት ኪራይ ፈልግ','Show All':'ሁሉንም አሳይ',
    'Traveler':'ተጓዥ','Sender':'ላኪ','Property Owner':'የቤት ባለቤት','Rent Seeker':'ቤት ፈላጊ','Truck Driver':'የጭነት መኪና አሽከርካሪ','Business Owner':'የንግድ ባለቤት','Events Organizer':'የዝግጅት አዘጋጅ','Customer':'ደንበኛ','Verified':'ተረጋግጧል','Not Verified':'አልተረጋገጠም','Pending':'በመጠባበቅ ላይ','Approved':'ጸድቋል','Paid':'ተከፍሏል','Available':'ይገኛል','Rented':'ተከራይቷል',
    'Request Space':'ቦታ ጠይቅ','Request Viewing':'ቤት ለማየት ጠይቅ','Request Viewing - Pay $10':'ቤት ማየት ጠይቅ - $10 ክፈል','Pay Now':'አሁን ክፈል','Pay Traveler':'ተጓዥን ክፈል','Approve Payment':'ክፍያ አጽድቅ','Mark Delivered':'እንደደረሰ ምልክት አድርግ','Pay $25 & Publish Property':'$25 ክፈል እና ቤቱን አትም','Pay $10 & Publish Trip':'$10 ክፈል እና ጉዞ አትም',
    'Full Name':'ሙሉ ስም','Phone Number':'ስልክ ቁጥር','Email':'ኢሜይል','Password':'የይለፍ ቃል','New Password':'አዲስ የይለፍ ቃል','Confirm Password':'የይለፍ ቃል ያረጋግጡ','Forgot Password':'የይለፍ ቃል ረሳሁ','Update Password':'የይለፍ ቃል አዘምን','Name':'ስም','Phone':'ስልክ','City':'ከተማ','Status':'ሁኔታ','Payment':'ክፍያ','Payments':'ክፍያዎች','Amount':'መጠን','Time':'ጊዜ','Description':'መግለጫ','Property':'ቤት','Owner':'ባለቤት','Seeker':'ፈላጊ','Traveler commission':'የተጓዥ ኮሚሽን','Trip listing fee refund':'የጉዞ ማስታወቂያ ክፍያ ተመላሽ','Total traveler payout':'ጠቅላላ የተጓዥ ክፍያ',
    'Available Services':'ያሉ አገልግሎቶች','My Dashboard':'የእኔ ዳሽቦርድ','My Activity':'የእኔ እንቅስቃሴ','My Payment History':'የእኔ የክፍያ ታሪክ','Rental Listings Management':'የቤት ዝርዝር አስተዳደር','Rental Requests Management':'የቤት ማየት ጥያቄዎች አስተዳደር','No rental requests yet.':'እስካሁን የቤት ማየት ጥያቄ የለም።','No rental listings to show yet.':'እስካሁን የሚታይ የቤት ዝርዝር የለም።','Language':'ቋንቋ'
  }
};
function currentLang(){return localStorage.getItem(LANG_KEY)||'en';}
function tText(s){if(currentLang()==='en')return s;let d=HC_I18N.am||{};let exact=d[s];if(exact)return exact;let out=s;Object.keys(d).sort((a,b)=>b.length-a.length).forEach(k=>{if(out.includes(k))out=out.split(k).join(d[k]);});return out;}
function translateNodeTree(root){if(!root||currentLang()==='en')return;let skip=['SCRIPT','STYLE','INPUT','TEXTAREA','OPTION','SELECT'];let walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){let p=node.parentElement;if(!p||skip.includes(p.tagName))return NodeFilter.FILTER_REJECT;let v=node.nodeValue;if(!v||!v.trim())return NodeFilter.FILTER_REJECT;return NodeFilter.FILTER_ACCEPT;}});let nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(n=>{n.nodeValue=tText(n.nodeValue);});document.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(el=>{el.placeholder=tText(el.placeholder);});document.querySelectorAll('button,th,td,label,p,h1,h2,h3,span,option').forEach(el=>{if(el.childNodes.length===1&&el.childNodes[0].nodeType===3)el.textContent=tText(el.textContent);});}
function languageSwitcherHtml(){return `<select id="langSwitch" onchange="setLanguage(this.value)" style="width:auto;min-width:130px;margin:0 6px;padding:9px;border-radius:10px;font-weight:700"><option value="en" ${currentLang()==='en'?'selected':''}>🇺🇸 English</option><option value="am" ${currentLang()==='am'?'selected':''}>🇪🇹 አማርኛ</option></select>`;}
function setLanguage(lang){localStorage.setItem(LANG_KEY,lang==='am'?'am':'en');render();setTimeout(()=>translateNodeTree(document.body),0);}
function applyLanguageUi(){
  let userBox=$('userBox');
  if(userBox && !$('langSwitch')) userBox.insertAdjacentHTML('afterbegin',languageSwitcherHtml());
  let mobile=$('mobileNav'); if(mobile && currentLang()==='am') Array.from(mobile.options).forEach(o=>o.text=tText(o.text));
  document.documentElement.lang=currentLang()==='am'?'am':'en';
  translateNodeTree(document.body);
}
const _hcRender=render; render=function(){_hcRender();applyLanguageUi();};
const _hcRenderPage=renderPage; renderPage=async function(p){await _hcRenderPage(p);applyLanguageUi();};
const _hcShow=show; show=function(p){let r=_hcShow(p);applyLanguageUi();return r;};

// V7.8.44: global click guard. If any async action or Supabase request leaves the page in a bad state,
// normal navigation buttons still work without needing to refresh/reset the page.
document.addEventListener('click',function(e){
  const btn=e.target&&e.target.closest?e.target.closest('button[onclick]'):null;
  if(!btn)return;
  document.body.style.pointerEvents='auto';
  document.documentElement.style.pointerEvents='auto';
  const code=btn.getAttribute('onclick')||'';
  const m=code.match(/^\s*show\(['"]([^'"]+)['"]\)\s*;?\s*$/);
  if(m){e.preventDefault();e.stopPropagation();show(m[1]);}
},true);
if(window.addEventListener){
window.addEventListener('error',function(e){console.warn('App error caught without freezing buttons:',e.message||e.error);document.body.style.pointerEvents='auto';document.documentElement.style.pointerEvents='auto';});
window.addEventListener('unhandledrejection',function(e){console.warn('Background task failed without freezing buttons:',e.reason);document.body.style.pointerEvents='auto';document.documentElement.style.pointerEvents='auto';});
}



// V7.8.59 Marketplace category cleanup (Marketplace only)
// Keeps the public flow the same, but removes old weak stages and prevents stale/mobile marketplace screens.
let __marketRefreshInFlight_V7859=false;
let __marketLastRefreshAt_V7859=0;
async function marketRefreshBackgroundV7859(force){
  if(!authReady())return;
  const now=Date.now();
  if(!force && (now-__marketLastRefreshAt_V7859)<2500)return;
  if(__marketRefreshInFlight_V7859)return;
  __marketRefreshInFlight_V7859=true;
  __marketLastRefreshAt_V7859=now;
  try{await loadSupabaseMarketplace();}
  catch(e){console.warn('Marketplace background refresh skipped:',e);}
  finally{__marketRefreshInFlight_V7859=false;}
}
const __marketplaceRenderBeforeV7859=marketplace;
marketplace=function(){
  __marketplaceLocalRender_V7842();
  marketRefreshBackgroundV7859(false).then(()=>{if(currentPage==='marketplace')__marketplaceLocalRender_V7842();});
};
function marketFindItemV7859(id){return (data.market||[]).find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));}
function marketFindRequestV7859(id){return (data.marketRequests||[]).find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));}
function marketItemStillAvailableV7859(item){return item && ['Approved','Available'].includes(item.status);}
marketRequestBuy=async function(id){
  if(!requireLogin())return;
  let m=marketFindItemV7859(id);if(!m)return alert('Marketplace item was not found. Please refresh Marketplace and try again.');
  if(!marketItemStillAvailableV7859(m))return alert('This item is not available for buyer requests.');
  if(m.sellerEmail===currentUser.email)return alert('You cannot request your own item.');
  let exists=(data.marketRequests||[]).find(r=>String(r.itemId)===String(m.dbId||m.id)&&r.buyerEmail===currentUser.email&&!['Cancelled','Admin Declined','Seller Declined','Connection Declined','Completed'].includes(r.status));
  if(exists)return alert('You already requested this item.');
  let r={id:'MR'+Date.now().toString().slice(-5),itemId:m.dbId||m.id,itemTitle:m.title,buyerName:currentUser.name,buyerEmail:currentUser.email,buyerPhone:currentUser.phone||'',sellerName:m.seller,sellerEmail:m.sellerEmail,sellerPhone:m.sellerPhone||'',status:'Buyer Request Pending Admin',createdAt:new Date().toLocaleString()};
  let res=await insertMarketRequestDb(r);
  if(res.error)return alert('Marketplace request was not saved to Supabase. Please run the Marketplace SQL, then try again. '+res.error.message);
  if(res.data){r.id=res.data.id;r.dbId=res.data.id;}
  data.marketRequests.unshift(r);
  addNote('admin.habeshaconnect@gmail.com','Marketplace buyer request waiting for approval: '+currentUser.name+' wants '+m.title);
  if(typeof sendAdminEmailNotice==='function')sendAdminEmailNotice('Marketplace buyer request waiting for approval','A buyer requested to buy a marketplace item.',{Buyer:currentUser.name,BuyerEmail:currentUser.email,Item:m.title,Seller:m.seller,Status:r.status},'marketplace');
  persistOnly();marketplace();alert('Request sent to admin for approval.');
};
marketAdminApproveListing=async function(id){
  if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');
  let m=marketFindItemV7859(id);if(!m)return;
  if(m.status!=='Pending Admin Approval')return alert('This listing is not waiting for admin approval.');
  m.status='Approved';let r=await updateMarketListingDb(m,'Approved');if(r.error)return alert('Could not approve Marketplace listing: '+r.error.message);
  addNote(m.sellerEmail,'Your marketplace listing was approved: '+m.title);await marketRefreshAfterAction();
};
marketAdminDeclineListing=async function(id){
  if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');
  let m=marketFindItemV7859(id);if(!m)return;
  if(m.status!=='Pending Admin Approval')return alert('This listing is not waiting for admin decline.');
  m.status='Declined';let r=await updateMarketListingDb(m,'Declined');if(r.error)return alert('Could not decline Marketplace listing: '+r.error.message);
  addNote(m.sellerEmail,'Your marketplace listing was declined: '+m.title);await marketRefreshAfterAction();
};
marketAdminApproveBuyerReq=async function(id){
  if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');
  let r=marketFindRequestV7859(id);if(!r)return;
  if(r.status!=='Buyer Request Pending Admin')return alert('This buyer request is not waiting for first admin approval.');
  let item=marketFindItemV7859(r.itemId);if(item&&!marketItemStillAvailableV7859(item))return alert('The item is no longer available.');
  r.status='Admin Approved - Waiting Seller';let res=await updateMarketRequestDb(r,r.status);if(res.error)return alert('Could not approve Marketplace buyer request: '+res.error.message);
  addNote(r.sellerEmail,'Marketplace buyer request approved by admin. Please accept or decline: '+r.itemTitle);addNote(r.buyerEmail,'Your marketplace request is approved by admin and waiting for seller response: '+r.itemTitle);await marketRefreshAfterAction();
};
marketAdminDeclineBuyerReq=async function(id){
  if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');
  let r=marketFindRequestV7859(id);if(!r)return;
  if(r.status!=='Buyer Request Pending Admin')return alert('This buyer request is not waiting for admin decline.');
  r.status='Admin Declined';let res=await updateMarketRequestDb(r,r.status);if(res.error)return alert('Could not decline Marketplace buyer request: '+res.error.message);
  addNote(r.buyerEmail,'Your marketplace buyer request was declined: '+r.itemTitle);await marketRefreshAfterAction();
};
marketSellerAcceptReq=async function(id){
  let r=marketFindRequestV7859(id);if(!r||!currentUser||r.sellerEmail!==currentUser.email)return alert('Seller only.');
  if(r.status!=='Admin Approved - Waiting Seller')return alert('This request is not ready for seller acceptance yet.');
  let item=marketFindItemV7859(r.itemId);if(item&&!marketItemStillAvailableV7859(item))return alert('This item is no longer available.');
  r.status='Seller Accepted - Waiting Admin';let res=await updateMarketRequestDb(r,r.status);if(res.error)return alert('Could not accept Marketplace request: '+res.error.message);
  addNote('admin.habeshaconnect@gmail.com','Marketplace seller accepted buyer request. Admin connection approval needed: '+r.itemTitle);if(typeof sendAdminEmailNotice==='function')sendAdminEmailNotice('Marketplace seller accepted request','Seller accepted a buyer request and admin approval is needed before contact sharing.',{Seller:r.sellerName,Buyer:r.buyerName,Item:r.itemTitle,Status:r.status},'marketplace');await marketRefreshAfterAction();
};
marketSellerDeclineReq=async function(id){
  let r=marketFindRequestV7859(id);if(!r||!currentUser||r.sellerEmail!==currentUser.email)return alert('Seller only.');
  if(r.status!=='Admin Approved - Waiting Seller')return alert('This request is not ready for seller decline.');
  r.status='Seller Declined';let res=await updateMarketRequestDb(r,r.status);if(res.error)return alert('Could not decline Marketplace request: '+res.error.message);
  addNote(r.buyerEmail,'Seller declined your marketplace request: '+r.itemTitle);await marketRefreshAfterAction();
};
marketAdminApproveConnection=async function(id){
  if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');
  let r=marketFindRequestV7859(id);if(!r)return;
  if(r.status!=='Seller Accepted - Waiting Admin')return alert('This connection is not waiting for final admin approval.');
  r.status='Connection Approved';let res=await updateMarketRequestDb(r,r.status);if(res.error)return alert('Could not approve Marketplace connection: '+res.error.message);
  addNote(r.buyerEmail,'Marketplace connection approved. Seller contact is now available for '+r.itemTitle);addNote(r.sellerEmail,'Marketplace connection approved. Buyer contact is now available for '+r.itemTitle);await marketRefreshAfterAction();
};
marketMarkSold=async function(id){
  let m=marketFindItemV7859(id);if(!m||!currentUser||m.sellerEmail!==currentUser.email)return alert('Seller only.');
  if(!marketItemStillAvailableV7859(m))return alert('Only available approved items can be marked sold.');
  m.status='Sold Waiting Admin Verification';let r=await updateMarketListingDb(m,m.status);if(r.error)return alert('Could not mark Marketplace item sold: '+r.error.message);
  (data.marketRequests||[]).filter(req=>String(req.itemId)===String(m.dbId||m.id)&&!['Completed','Cancelled','Admin Declined','Seller Declined'].includes(req.status)).forEach(req=>{if(req.status!=='Connection Approved')req.status='Cancelled';});
  addNote('admin.habeshaconnect@gmail.com','Marketplace item marked sold and waiting for verification: '+m.title);if(typeof sendAdminEmailNotice==='function')sendAdminEmailNotice('Marketplace sold item verification needed','Seller marked item as sold. Admin verification is needed.',{Seller:m.seller,Item:m.title,Price:money(m.price),Status:m.status},'marketplace');await marketRefreshAfterAction();
};
marketAdminVerifySale=async function(id){
  if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');
  let m=marketFindItemV7859(id);if(!m)return;
  if(m.status!=='Sold Waiting Admin Verification')return alert('This item is not waiting for sold verification.');
  m.status='Sold Verified';let r=await updateMarketListingDb(m,m.status);if(r.error)return alert('Could not verify Marketplace sale: '+r.error.message);
  addNote(m.sellerEmail,'Marketplace sold item verified: '+m.title);await marketRefreshAfterAction();
};



/* V7.8.64 Simplified Admin + Manual Payment Flow
   Keep admin approval for new public posts/listings/profiles/events.
   Remove admin approval from the middle of user-to-user requests.
   Payment buttons remain manual beta payment: user clicks pay/confirm, admin approves payment. */

function v7864SafeStatusUpdate(tableName, record, fields){
  try{
    if(!authReady()||!record)return Promise.resolve({error:null});
    let q=hcSupabase.from(tableName).update(fields);
    return record.dbId ? q.eq('id',record.dbId) : q.eq('id',record.id);
  }catch(e){return Promise.resolve({error:e});}
}

/* RENTALS: Seeker request goes directly to owner review. Admin only approves property listing. */
const __requestViewingBeforeV7864 = typeof requestViewing==='function' ? requestViewing : null;
requestViewing = async function(id){
 if(!requireLogin())return;
 if(!authReady())return alert('Supabase is required to send rental viewing requests. Please refresh the page and log in again.');
 if(!currentUser.id)return alert('Your profile ID is missing. Please log out, log back in, and try again.');
 await loadSupabaseRentals();
 await loadSupabaseRentalRequests();
 let r=data.rentals.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
 if(!r)return alert('Rental listing not found. Please refresh and try again.');
 if(r.ownerEmail===currentUser.email)return alert('You cannot request your own rental listing.');
 let propertyKey=r.dbId||r.id;
 let existing=data.rentalRequests.find(q=>(String(q.rentalId)===String(r.id)||String(q.rentalId)===String(r.dbId)||String(q.rentalId)===String(propertyKey))&&(String(q.seekerId||'')===String(currentUser.id||'')||q.seekerEmail===currentUser.email));
 if(existing){alert('You already sent a viewing request for this property.');await rentals();return;}
 let payload={property_id:propertyKey,seeker_id:currentUser.id,paid:true,status:'Pending Owner Review'};
 let res=await hcSupabase.from('rental_requests').insert(payload).select('*').single();
 if(res.error){
   let msg=String(res.error.message||'');
   if(msg.toLowerCase().includes('status')){
     payload.status='Pending';
     res=await hcSupabase.from('rental_requests').insert(payload).select('*').single();
   }
   if(res.error)return alert('Viewing request could not be saved to Supabase: '+res.error.message);
 }
 let localReq={id:res.data.id,dbId:res.data.id,rentalId:propertyKey,propertyTitle:r.title,seekerName:currentUser.name,seekerPhone:currentUser.phone||'',seekerEmail:currentUser.email,seekerId:currentUser.id||'',ownerName:r.owner,ownerPhone:r.ownerPhone||'',ownerEmail:r.ownerEmail||'',ownerId:r.ownerId||'',status:'Pending Owner Review',paymentStatus:'Requested',paid:true,amountPaid:0,time:new Date().toLocaleString(),source:'supabase'};
 data.rentalRequests.unshift(localReq);
 addNote(r.ownerEmail||'all','New rental viewing request from '+currentUser.name+'. Please accept or decline.');
 if(r.ownerEmail){sendEmailNotice({to:r.ownerEmail,name:r.owner||'Property Owner',subject:'New rental viewing request',summary:'A rent seeker requested to view your property. Please accept or decline from your Rental dashboard.',buttonText:'Open Owner Dashboard',page:'rentals',details:{Seeker:currentUser.name,SeekerEmail:currentUser.email,Property:r.title,Status:'Pending Owner Review'}});}
 addNote(currentUser.email,'Your viewing request was sent directly to the owner.');
 persistOnly();
 alert('Viewing request submitted. The property owner can now approve or decline it.');
 await rentals();
};

const __rentalRequestsHtmlBeforeV7864 = typeof rentalRequestsHtml==='function' ? rentalRequestsHtml : null;
rentalRequestsHtml=function(reqs,role,anchor){
  let wrapId=anchor?` id="${anchor}"`:'';
  return `<div${wrapId}><h3>Rental Requests / Contacts</h3><table><tr><th>Property</th><th>Rent Seeker</th><th>Phone</th><th>Owner</th><th>Owner Phone</th><th>Status</th><th>Beta Status</th><th>Action</th></tr>${reqs.map(q=>{let pending=['Pending','Pending Owner Review'].includes(q.status);return `<tr><td>${q.propertyTitle}</td><td>${q.seekerName}</td><td>${q.seekerPhone||''}</td><td>${q.ownerName}</td><td>${q.status==='Approved'||role==='admin'||role==='owner'?q.ownerPhone:'Shown after owner approval'}</td><td>${q.status}</td><td>${rentalRequestPaymentDisplay(q,role)}</td><td>${(role==='owner'||role==='admin')&&pending?`<button class="btn primary" onclick="approveRentalReq('${q.id}')">Approve</button> <button class="btn bad" onclick="declineRentalReq('${q.id}')">Decline</button>`:'-'}</td></tr>`}).join('')||'<tr><td colspan="8">No rental requests yet.</td></tr>'}</table></div>`;
};

approveRentalReq=async function(id){
  let q=data.rentalRequests.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));
  if(!q)return alert('Rental request not found.');
  if(currentUser&&currentUser.role!=='admin'&&q.ownerEmail!==currentUser.email)return alert('Only the property owner can approve this request.');
  let oldStatus=q.status;
  q.status='Approved';
  addNote(q.seekerEmail,'Your rental request was approved by the owner. Owner contact is now available.');
  sendEmailNotice({to:q.seekerEmail,name:q.seekerName,subject:'Rental viewing approved',summary:'The property owner approved your viewing request. Owner contact is now available.',buttonText:'Open Rental Dashboard',page:'rentals',details:{Property:q.propertyTitle,Owner:q.ownerName,OwnerPhone:q.ownerPhone,Status:'Approved'}});
  persistOnly();
  if(currentPage==='admin') adminSuccess(); else await rentals();
  let res={error:null};
  if(authReady()&&q.dbId)res=await hcSupabase.from('rental_requests').update({status:'Approved'}).eq('id',q.dbId);
  if(res.error){q.status=oldStatus;persistOnly();if(currentPage==='admin')adminSuccess();else await rentals();return alert('Could not approve rental request in Supabase: '+res.error.message);}
};

declineRentalReq=async function(id){
  let q=data.rentalRequests.find(x=>String(x.id)===String(id)||String(x.dbId)===String(id));if(!q)return;
  if(currentUser&&currentUser.role!=='admin'&&q.ownerEmail!==currentUser.email)return alert('Only the property owner can decline this request.');
  q.status='Declined';
  if(authReady()&&q.dbId){let {error}=await hcSupabase.from('rental_requests').update({status:'Declined'}).eq('id',q.dbId);if(error)return alert('Could not decline rental request: '+error.message);}
  addNote(q.seekerEmail,'Your rental request was declined by the owner.');
  sendEmailNotice({to:q.seekerEmail,name:q.seekerName,subject:'Rental viewing declined',summary:'The property owner declined your viewing request.',buttonText:'Open Rental Dashboard',page:'rentals',details:{Property:q.propertyTitle,Status:'Declined'}});
  persistOnly(); if(currentPage==='admin')adminSuccess();else await rentals();
};

/* MARKETPLACE: Admin approves listing only. Buyer request goes directly to seller. Seller accept waits for admin manual payment approval. */
marketRequestBuy=async function(id){
  if(!requireLogin())return;
  let m=marketFindItemV7859(id);if(!m)return alert('Marketplace item was not found. Please refresh Marketplace and try again.');
  if(!marketItemStillAvailableV7859(m))return alert('This item is not available for buyer requests.');
  if(m.sellerEmail===currentUser.email)return alert('You cannot request your own item.');
  let exists=(data.marketRequests||[]).find(r=>String(r.itemId)===String(m.dbId||m.id)&&r.buyerEmail===currentUser.email&&!['Cancelled','Admin Declined','Seller Declined','Connection Declined','Completed'].includes(r.status));
  if(exists)return alert('You already requested this item.');
  let r={id:'MR'+Date.now().toString().slice(-5),itemId:m.dbId||m.id,itemTitle:m.title,buyerName:currentUser.name,buyerEmail:currentUser.email,buyerPhone:currentUser.phone||'',sellerName:m.seller,sellerEmail:m.sellerEmail,sellerPhone:m.sellerPhone||'',status:'Waiting Seller Review',createdAt:new Date().toLocaleString()};
  let res=await insertMarketRequestDb(r);
  if(res.error)return alert('Marketplace request was not saved to Supabase. Please run the Marketplace SQL, then try again. '+res.error.message);
  if(res.data){r.id=res.data.id;r.dbId=res.data.id;}
  data.marketRequests.unshift(r);
  addNote(r.sellerEmail,'New buyer request for '+m.title+' from '+currentUser.name+'. Please accept or decline.');
  sendEmailNotice({to:r.sellerEmail,name:r.sellerName,subject:'New marketplace buyer request',summary:'A buyer requested your marketplace item. Please accept or decline.',buttonText:'Open Marketplace',page:'marketplace',details:{Buyer:r.buyerName,BuyerEmail:r.buyerEmail,Item:r.itemTitle,Status:r.status}});
  persistOnly();marketplace();alert('Request sent directly to the seller.');
};

marketRequestCard=function(r){
 let isSeller=currentUser&&r.sellerEmail===currentUser.email;let isBuyer=currentUser&&r.buyerEmail===currentUser.email;let isAdmin=currentUser&&currentUser.role==='admin';let cls=String(r.status||'').includes('Approved')?'good':String(r.status||'').includes('Declined')?'bad':'warn';
 let sellerWaiting=['Waiting Seller Review','Admin Approved - Waiting Seller'].includes(r.status);
 let paymentWaiting=['Seller Accepted - Waiting Admin','Payment Pending Admin Approval'].includes(r.status);
 return `<div class="item"><b>${r.itemTitle}</b><p>${r.buyerName} wants to buy from ${r.sellerName}</p><span class="pill ${cls}">${r.status}</span><div class="actions">${isSeller&&sellerWaiting?`<button class="btn primary" onclick="marketSellerAcceptReq('${r.id}')">Accept</button><button class="btn danger" onclick="marketSellerDeclineReq('${r.id}')">Decline</button>`:''}${isAdmin&&paymentWaiting?`<button class="btn primary" onclick="marketAdminApproveConnection('${r.id}')">Approve Payment / Connect</button>`:''}${isBuyer&&r.status==='Connection Approved'?`<button class="btn ghost" onclick="alert('Seller: ${r.sellerName}\nPhone: ${r.sellerPhone||'Not provided'}\nEmail: ${r.sellerEmail}')">Seller Contact</button>`:''}${isSeller&&r.status==='Connection Approved'?`<button class="btn ghost" onclick="alert('Buyer: ${r.buyerName}\nPhone: ${r.buyerPhone||'Not provided'}\nEmail: ${r.buyerEmail}')">Buyer Contact</button>`:''}</div></div>`;
};

marketSellerAcceptReq=async function(id){
  let r=marketFindRequestV7859(id);if(!r||!currentUser||r.sellerEmail!==currentUser.email)return alert('Seller only.');
  if(!['Waiting Seller Review','Admin Approved - Waiting Seller'].includes(r.status))return alert('This request is not ready for seller acceptance yet.');
  let item=marketFindItemV7859(r.itemId);if(item&&!marketItemStillAvailableV7859(item))return alert('This item is no longer available.');
  r.status='Payment Pending Admin Approval';let res=await updateMarketRequestDb(r,r.status);if(res.error)return alert('Could not accept Marketplace request: '+res.error.message);
  addNote('admin.habeshaconnect@gmail.com','Marketplace seller accepted buyer request. Manual payment/admin approval needed: '+r.itemTitle);
  addNote(r.buyerEmail,'Seller accepted your marketplace request. Payment/admin approval is pending before contact is shared.');
  if(typeof sendAdminEmailNotice==='function')sendAdminEmailNotice('Marketplace payment approval needed','Seller accepted a buyer request. During beta, admin manually approves payment before contact sharing.',{Seller:r.sellerName,Buyer:r.buyerName,Item:r.itemTitle,Status:r.status},'marketplace');
  await marketRefreshAfterAction();
};
marketSellerDeclineReq=async function(id){
  let r=marketFindRequestV7859(id);if(!r||!currentUser||r.sellerEmail!==currentUser.email)return alert('Seller only.');
  if(!['Waiting Seller Review','Admin Approved - Waiting Seller'].includes(r.status))return alert('This request is not ready for seller decline.');
  r.status='Seller Declined';let res=await updateMarketRequestDb(r,r.status);if(res.error)return alert('Could not decline Marketplace request: '+res.error.message);
  addNote(r.buyerEmail,'Seller declined your marketplace request: '+r.itemTitle);await marketRefreshAfterAction();
};
marketAdminApproveConnection=async function(id){
  if(!currentUser||currentUser.role!=='admin')return alert('Admin only.');
  let r=marketFindRequestV7859(id);if(!r)return;
  if(!['Seller Accepted - Waiting Admin','Payment Pending Admin Approval'].includes(r.status))return alert('This request is not waiting for admin payment/connection approval.');
  r.status='Connection Approved';let res=await updateMarketRequestDb(r,r.status);if(res.error)return alert('Could not approve Marketplace connection: '+res.error.message);
  addNote(r.buyerEmail,'Marketplace payment/connection approved. Seller contact is now available for '+r.itemTitle);addNote(r.sellerEmail,'Marketplace payment/connection approved. Buyer contact is now available for '+r.itemTitle);await marketRefreshAfterAction();
};
marketAdminCards=function(){let pendListings=(data.market||[]).filter(m=>m.status==='Pending Admin Approval');let payment=(data.marketRequests||[]).filter(r=>['Payment Pending Admin Approval','Seller Accepted - Waiting Admin'].includes(r.status));let sold=(data.market||[]).filter(m=>m.status==='Sold Waiting Admin Verification');return `<div class="card"><h3>⏳ Pending Listings</h3>${pendListings.map(marketCard).join('')||'<p class="muted">No pending listings.</p>'}</div><div class="card"><h3>💳 Manual Payment Approvals</h3>${payment.map(marketRequestCard).join('')||'<p class="muted">No payments waiting.</p>'}</div><div class="card"><h3>✅ Sold Verification</h3>${sold.map(marketCard).join('')||'<p class="muted">No sold items waiting.</p>'}</div>`;};

/* HOME SERVICES: Admin approves provider posts only. Customer requests go directly to provider. */
submitHomeServiceRequest=async function(id){
 if(!requireLogin())return;let svc=(data.homeServicePosts||[]).find(x=>x.id===id);if(!svc)return alert('Service not found.');
 if(svc.providerEmail===currentUser.email)return alert('You cannot request your own service.');
 if(svc.status!=='Approved')return alert('This service is not available for customer requests.');
 let city=askRequired('Your city/location:', currentUser.city||''); if(city===null)return;
 let phone=askRequired('Your phone number:', currentUser.phone||'', phoneOk, 'Phone number must be numbers only.'); if(phone===null)return;
 let preferredDate=prompt('Preferred date:', addDaysIso(1)); if(preferredDate===null)return;
 let time=prompt('Preferred time:', ''); if(time===null)return;
 let details=prompt('Describe what you need:', ''); if(details===null)return;
 let req={id:'HSR'+Date.now().toString().slice(-6),serviceId:svc.dbId||svc.id,serviceTitle:svc.title,providerName:svc.providerName,providerEmail:svc.providerEmail,providerPhone:svc.providerPhone||'',customerName:currentUser.name,customerEmail:currentUser.email,customerPhone:phone,city,preferredDate,preferredTime:time,details,status:'Pending Provider Review',createdAt:new Date().toLocaleString()};
 let res=await insertHomeServiceRequestDb(req);
 if(res.error)return alert('Home service request was not saved to Supabase. Please run the Home Services SQL, then try again. '+res.error.message);
 if(res.data){req.id=res.data.id;req.dbId=res.data.id;}
 data.homeServiceRequests.unshift(req);
 addNote(svc.providerEmail,'New home service request from '+currentUser.name+' for '+svc.title+'.');
 sendEmailNotice({to:svc.providerEmail,name:svc.providerName,subject:'New home service request',summary:'A customer requested your home service. Please accept or decline.',buttonText:'Open Home Services',page:'home_services',details:{Customer:currentUser.name,Phone:phone,Service:svc.title,City:city,PreferredDate:preferredDate,PreferredTime:time,Details:details}});
 addNote(currentUser.email,'Home service request sent to provider: '+svc.title+'.');
 persistOnly();alert('Request sent directly to the service provider.');homeServices();
};

/* TRUCKING: Driver applications go directly to truck owner after approved job post. Owner acceptance completes hiring. */
applyTruckJob=async function(id){
 if(!requireLogin())return;if(currentUser.role!=='driver')return alert('Only truck drivers can apply for truck driving jobs.');let j=(data.truckJobs||[]).find(x=>x.id===id);if(!j)return alert('Job not found.');if(j.status!=='Open')return alert('This job is waiting for admin approval or is closed.');if((data.truckApplications||[]).some(a=>a.jobId===id&&a.driverEmail===currentUser.email&&!['Declined','Closed'].includes(a.status)))return alert('You already applied for this job.');let p=(data.truckDriverProfiles||[]).find(x=>x.driverEmail===currentUser.email)||{};if(!p.license||!p.experience){alert('Please complete your Driver Job Profile before applying.');return;}let app={id:'TA'+Date.now().toString().slice(-6),jobId:j.id,jobDbId:j.dbId||'',jobTitle:j.title,ownerName:j.ownerName,ownerEmail:j.ownerEmail,driverName:p.name||currentUser.name,driverEmail:currentUser.email,driverPhone:p.phone||currentUser.phone||'',city:p.city||'',license:p.license||'',experience:p.experience||'',looking:p.looking||'',notes:p.notes||'',status:'Pending Owner Review',createdAt:new Date().toLocaleString()};let res=await syncTruckApplicationToSupabase(app,j);if(res.error)return alert('Application was not sent. Please run the trucking Supabase migration, then try again. '+res.error.message);data.truckApplications.unshift(app);addNote(j.ownerEmail,'New truck driver application: '+(p.name||currentUser.name)+' applied for '+j.title+'.');if(j.ownerEmail){sendEmailNotice({to:j.ownerEmail,name:j.ownerName,subject:'New Truck Driver Application',summary:'A truck driver applied for your approved job. Please accept or decline.',buttonText:'Open Truck Owner Dashboard',page:'truck',details:{Driver:p.name||currentUser.name,DriverEmail:currentUser.email,Job:j.title,Route:j.route||'',License:p.license||'',Experience:p.experience||''}});}addNote(currentUser.email,'Application submitted for '+j.title+'. Waiting for truck owner review.');save();alert('Applied. The truck owner can now review your application.');truck();
};
approveTruckApp=async function(id){let a=(data.truckApplications||[]).find(x=>x.id===id);if(!a)return alert('Application not found.');if(currentUser.role!=='admin'&&a.ownerEmail!==currentUser.email)return alert('Only the truck owner can approve this application.');if(!['Pending Owner Review','Pending Final Admin Approval'].includes(a.status))return alert('This application is not waiting for owner approval.');let j=(data.truckJobs||[]).find(x=>x.id===a.jobId||x.dbId===a.jobDbId);let oldA={...a}, oldJ=j?{...j}:null;a.status='Hired';a.hiredAt=new Date().toLocaleString();if(j){j.status='Filled';j.hiredDriverName=a.driverName;j.hiredDriverEmail=a.driverEmail;j.hiredAt=new Date().toLocaleString();}(data.truckApplications||[]).filter(x=>x.jobId===a.jobId&&x.id!==a.id&&!['Declined','Hired'].includes(x.status)).forEach(x=>x.status='Closed');let r=await updateTruckApplicationDb(a,{status:'Hired',hired_at:new Date().toISOString()});if(r.error){Object.assign(a,oldA);if(j&&oldJ)Object.assign(j,oldJ);return alert('Could not hire driver in Supabase: '+r.error.message);}if(j)fireAndForget(updateTruckJobDb(j,{status:'Filled',hired_driver_name:a.driverName,hired_driver_email:a.driverEmail,hired_at:new Date().toISOString()}),'truck job filled sync');addNote(a.driverEmail,'Truck owner hired you for '+a.jobTitle+'.');sendEmailNotice({to:a.driverEmail,name:a.driverName,subject:'Truck owner hired you',summary:'The truck owner accepted your application.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Job:a.jobTitle,Owner:a.ownerName,Status:'Hired'}});persistOnly();if(currentUser.role==='admin')adminSuccess();else truck();};

/* TRAILER RENTAL: Request goes directly to trailer owner. Owner acceptance waits for manual/admin payment approval. */
requestTrailerRental=async function(id){if(!requireLogin())return;if(currentUser.role!=='driver'&&currentUser.role!=='truck_owner')return alert('Only truck drivers or truck owners can request trailer rentals.');let item=(data.trailerRentals||[]).find(x=>x.id===id);if(!item)return alert('Trailer rental not found.');if(item.ownerEmail===currentUser.email)return alert('You cannot request your own trailer.');if(item.status!=='Available')return alert('This trailer is not available.');let old={...item};item.status='Pending Owner Review';item.renterName=currentUser.name||'';item.renterEmail=currentUser.email;item.renterPhone=currentUser.phone||'';let res=await updateTrailerRentalDb(item,{status:'Pending Owner Review',renter_name:item.renterName,renter_email:item.renterEmail,renter_phone:item.renterPhone});if(res.error){Object.assign(item,old);return alert('Could not request trailer rental: '+res.error.message);}addNote(item.ownerEmail,'New trailer rental request from '+item.renterName+'. Please accept or decline.');sendEmailNotice({to:item.ownerEmail,name:item.ownerName,subject:'New trailer rental request',summary:'A truck owner/driver requested your trailer. Please accept or decline.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Requester:item.renterName,RequesterEmail:item.renterEmail,Trailer:item.trailerType,Location:item.location,Price:item.price}});addNote(currentUser.email,'Trailer rental request submitted to the owner: '+item.trailerType+'.');save();alert('Trailer request sent directly to trailer owner.');truck();};
approveTrailerRental=async function(id){if(!requireLogin())return;let item=(data.trailerRentals||[]).find(x=>x.id===id);if(!item)return alert('Trailer rental not found.');if(currentUser.role!=='admin'&&item.ownerEmail!==currentUser.email)return alert('Only the trailer owner can accept this request.');if(currentUser.role!=='admin'&&item.status!=='Pending Owner Review')return alert('This trailer request is not waiting for owner approval.');let old={...item};item.status='Payment Pending Admin Approval';item.ownerAcceptedAt=new Date().toLocaleString();let res=await updateTrailerRentalDb(item,{status:'Payment Pending Admin Approval'});if(res.error){Object.assign(item,old);return alert('Could not accept trailer rental: '+res.error.message);}sendAdminEmailNotice('Trailer rental payment approval needed','The trailer owner accepted a rental request. During beta, admin manually approves payment before completion.',{Owner:item.ownerName,OwnerEmail:item.ownerEmail,Requester:item.renterName,RequesterEmail:item.renterEmail,Trailer:item.trailerType,Location:item.location,Price:item.price},'admin');sendEmailNotice({to:item.renterEmail,name:item.renterName,subject:'Trailer owner accepted your request',summary:'The trailer owner accepted your request. Manual payment/admin approval is pending.',buttonText:'Open Trucking Dashboard',page:'truck',details:{Trailer:item.trailerType,Owner:item.ownerName,Status:'Payment Pending Admin Approval'}});save();alert('Request accepted. Admin can manually approve payment next.');truck();};

/* TAXI/LIMO: Owner listing/admin approval remains. Driver request goes to owner; owner accept completes hiring. */
ownerAssignTaxiDriver=async function(driverEmail){
 if(!requireLogin())return;if(currentUser.role!=='taxi_limo_owner'&&currentUser.role!=='admin')return alert('Taxi/Limo owner only.');let d=(data.taxiDriverApps||[]).find(x=>x.email===driverEmail&&x.status==='Approved');if(!d)return alert('Driver is not approved or not found.');let ownerVehicles=(data.taxiLimoVehicles||[]).filter(v=>v.ownerEmail===currentUser.email&&v.status==='Approved');if(!ownerVehicles.length)return alert('Please add and get admin approval for your Taxi/Limo vehicle first.');let vehicle=ownerVehicles[0];d.ownerEmail=currentUser.email;d.assignedVehicleId=vehicle.id;d.assignedVehicle=vehicle.vehicleLabel||vehicle.vehicle||'';d.availabilityStatus='Hired';let res=await updateTaxiDriverDb(d,{owner_email:currentUser.email,assigned_vehicle_id:vehicle.dbId||vehicle.id,assigned_vehicle_label:d.assignedVehicle,availability_status:'Hired'});if(res.error)return alert('Could not hire driver: '+res.error.message);addNote(d.email,'Taxi/Limo owner hired you.');sendEmailNotice({to:d.email,name:d.name,subject:'Taxi/Limo owner hired you',summary:'A Taxi/Limo owner accepted your driver availability.',buttonText:'Open Taxi/Limo',page:'taxi',details:{Owner:currentUser.name,Vehicle:d.assignedVehicle,Status:'Hired'}});persistOnly();alert('Driver hired.');taxi();
};

render();(async()=>{if(!(await handlePasswordRecovery())){show('home');await initAuth();}})();




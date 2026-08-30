// =========================================================
//                   FILE: js/admin.js
//       (ប្រព័ន្ធ Logic, Auto-Login & CRUD របស់ Admin)
// =========================================================

const BIN_ID = "6a917cb3da38895dfe1c169c";
const API_KEY = "$2a$10$3jKyJxhLrAn/3gCKlwjvSOtBFGKwfnUDm6/J9E1BeuJVel/z2hTDy";

const defaultFunctions = [
    { id: 1, title: "Account Manage", icon: "fa-solid fa-user-shield", items: ["Auto switch Profiles", "Check Live / Die UID", "Auto solve Captcha & 2FA"] },
    { id: 2, title: "Page & Post", icon: "fa-solid fa-share-from-square", items: ["Auto post Reels & Videos", "Auto comment & interaction", "Schedule Post"] },
    { id: 3, title: "LDPlayer Control", icon: "fa-solid fa-mobile-screen", items: ["Open/Close Multi-LDPlayer", "Auto arrange LD windows", "Auto GPS sync"] }
];

const defaultContacts = [
    { id: 1, title: "Telegram Support", desc: "ឆាតផ្ទាល់ជាមួយក្រុមការងារ Support", icon: "fa-brands fa-telegram", btnText: "ឆាតលើ Telegram", link: "https://t.me/mach_theara" },
    { id: 2, title: "YouTube Channel", desc: "ទស្សនាវីដេអូបង្រៀន និងរបៀបប្រើប្រាស់", icon: "fa-brands fa-youtube", btnText: "ចូលមើល YouTube", link: "https://www.youtube.com/@kdebtools" }
];

const defaultDownloads = [
    { id: 1, name: "Main Kdeb Nexus Setup", category: "MainFile", subCategory: "", size: "45 MB", link: "https://example.com/setup.exe", date: "Aug-17-2026", notes: ["Full Setup for Kdeb Nexus"] },
    { id: 2, name: "Patch Update v1.0.8", category: "Patch", subCategory: "Kdeb Nexus", size: "6.71 MB", link: "https://example.com/patch1.zip", date: "Aug-18-2026", notes: ["Fix Login", "Fix Auto Share"] },
    { id: 3, name: "LDPlayer 9 Clean Optimized", category: "LDPlayer", subCategory: "LDPlayer 9", size: "620 MB", link: "https://example.com/ld9.exe", date: "Aug-17-2026", notes: [] }
];

const defaultPosts = [
    { id: 1, title: "របៀបតម្លើង Kdeb Tools ជាមួយ LDPlayer 9", youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", youtubeId: "dQw4w9WgXcQ", icon: "fa-solid fa-download", date: "28/08/2026" }
];

let functionsList = [];
let contacts = [];
let downloads = [];
let posts = [];
let currentAdminDlFilter = 'all';

function getAutoFormattedDate() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    return `${months[now.getMonth()]}-${String(now.getDate()).padStart(2, '0')}-${now.getFullYear()}`;
}

// Fixed Migration: រក្សាទុកប្រភេទ APK, Patch, MainFile, LDPlayer ឱ្យនៅដដែលមិនកែប្រែផ្ដេសផ្ដាស
function migrateOldDownloads(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(item => {
        if (item.category === 'Driver') item.category = 'MainFile'; 
        else if (item.category === 'Tool') item.category = 'Patch'; 
        if (!item.date) item.date = getAutoFormattedDate();
        if (!item.notes) item.notes = [];
        if (!item.subCategory) item.subCategory = '';
        return item;
    });
}

function autoFillBtnText(val) {
    const btnInput = document.getElementById('cBtnText');
    if (!btnInput) return;
    if (val.includes('telegram')) btnInput.value = 'ឆាតលើ Telegram';
    else if (val.includes('youtube')) btnInput.value = 'ចូលមើល YouTube';
    else if (val.includes('facebook')) btnInput.value = 'ផ្ញើសារលើ Facebook';
    else if (val.includes('tiktok')) btnInput.value = 'ទស្សនាលើ TikTok';
    else if (val.includes('phone')) btnInput.value = 'ខលទាក់ទងផ្ទាល់';
    else if (val.includes('envelope')) btnInput.value = 'ផ្ញើ Email';
}

function toggleSubCategoryField() {
    const category = document.getElementById('dCategory')?.value;
    const subContainer = document.getElementById('subCategoryContainer');
    if (!subContainer) return;

    if (category === 'Patch' || category === 'LDPlayer') {
        subContainer.classList.remove('hidden');
    } else {
        subContainer.classList.add('hidden');
        const subInput = document.getElementById('dSubCategory');
        if (subInput) subInput.value = '';
    }
}

function onCategoryChange() {
    toggleSubCategoryField();
    const cat = document.getElementById('dCategory')?.value;
    if (cat) {
        setAdminDlFilter(cat);
    }
}

function setAdminDlFilter(category) {
    currentAdminDlFilter = category;
    
    const cats = ['all', 'MainFile', 'Patch', 'APK', 'LDPlayer'];
    cats.forEach(c => {
        const btn = document.getElementById(`btn-admin-dl-${c}`);
        if (btn) {
            if (c === currentAdminDlFilter) {
                btn.className = "px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold transition flex items-center gap-1 shadow-sm shadow-emerald-600/30";
            } else {
                btn.className = "px-2.5 py-1 rounded-lg bg-dark-bg text-gray-400 hover:text-white border border-dark-border transition flex items-center gap-1";
            }
        }
    });

    renderDownloadsList();
}

// ================= 1. AUTHENTICATION =================

function checkAuthOnLoad() {
    if (localStorage.getItem('kdeb_admin_logged_in') === 'true') {
        showDashboard();
    } else {
        showLoginScreen();
    }
}

function showDashboard() {
    document.getElementById('loginScreen')?.classList.add('hidden');
    document.getElementById('dashboardScreen')?.classList.remove('hidden');
    loadAdminData();
}

function showLoginScreen() {
    document.getElementById('dashboardScreen')?.classList.add('hidden');
    document.getElementById('loginScreen')?.classList.remove('hidden');
}

function handleLogin() {
    const userInput = document.getElementById('usernameInput')?.value.trim();
    const passInput = document.getElementById('passInput')?.value;
    if (userInput === 'kdebtools' && passInput === 'kdebtools.admin.kh') {
        localStorage.setItem('kdeb_admin_logged_in', 'true');
        showDashboard();
    } else {
        alert('Username ឬ Password មិនត្រឹមត្រូវទេ!');
    }
}

function logout() {
    if (!confirm('តើអ្នកពិតជាចង់ចាកចេញមែនទេ?')) return;
    localStorage.removeItem('kdeb_admin_logged_in');
    showLoginScreen();
}

// ================= 2. DATA MANAGEMENT =================

async function loadAdminData() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest?nocache=${Date.now()}`, {
            method: 'GET',
            headers: { 'X-Master-Key': API_KEY }
        });
        if (response.ok) {
            const result = await response.json();
            const record = result.record || {};
            functionsList = record.functions || defaultFunctions;
            contacts = record.contacts || defaultContacts;
            downloads = migrateOldDownloads(record.downloads || defaultDownloads);
            posts = record.posts || defaultPosts;
            renderAllTabs();
        } else {
            loadDefaults();
        }
    } catch (err) {
        loadDefaults();
    }
}

function loadDefaults() {
    functionsList = defaultFunctions;
    contacts = defaultContacts;
    downloads = defaultDownloads;
    posts = defaultPosts;
    renderAllTabs();
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById('content-' + tabName)?.classList.remove('hidden');
    document.getElementById('tab-' + tabName)?.classList.add('active');
}

function autoFillFileInfo(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        document.getElementById('dName').value = file.name;
        document.getElementById('dSize').value = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    }
}

async function syncAll() {
    const dataToSave = {
        functions: functionsList,
        contacts: contacts,
        downloads: downloads,
        posts: posts
    };

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': API_KEY
            },
            body: JSON.stringify(dataToSave)
        });
        if (response.ok) {
            renderAllTabs();
            return true;
        } else {
            alert('⚠️ រក្សាទុកទៅ Cloud បរាជ័យ!');
            return false;
        }
    } catch (err) {
        alert('⚠️ មិនអាចភ្ជាប់ទៅកាន់ Cloud បានទេ!');
        return false;
    }
}

function getYoutubeId(url) {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com')) {
            if (urlObj.pathname.includes('/shorts/')) return urlObj.pathname.split('/shorts/')[1].split(/[?#&]/)[0];
            const v = urlObj.searchParams.get('v');
            if (v && v.length === 11) return v;
        } else if (urlObj.hostname.includes('youtu.be')) {
            const v = urlObj.pathname.substring(1).split(/[?#&]/)[0];
            if (v && v.length === 11) return v;
        }
    } catch (e) {}
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// ================= 3. CRUD FUNCTIONS =================

async function saveFunctionGroup(e) {
    e.preventDefault();
    const editId = document.getElementById('fnEditId').value;
    const itemsArray = document.getElementById('fnItems').value.split('\n').map(i => i.trim().replace(/^•\s*/, '')).filter(i => i.length > 0);

    if (editId) {
        const idx = functionsList.findIndex(f => f.id == editId);
        if (idx !== -1) {
            functionsList[idx].title = document.getElementById('fnTitle').value;
            functionsList[idx].icon = document.getElementById('fnIcon').value;
            functionsList[idx].items = itemsArray;
        }
    } else {
        functionsList.push({
            id: Date.now(),
            title: document.getElementById('fnTitle').value,
            icon: document.getElementById('fnIcon').value,
            items: itemsArray
        });
    }
    const success = await syncAll();
    if (success) {
        alert(editId ? 'កែសម្រួលជោគជ័យ!' : 'បន្ថែមជោគជ័យ!');
        resetFunctionForm();
    }
}

function editFunction(id) {
    const item = functionsList.find(f => f.id == id);
    if (!item) return;
    document.getElementById('fnEditId').value = item.id;
    document.getElementById('fnTitle').value = item.title;
    document.getElementById('fnIcon').value = item.icon;
    document.getElementById('fnItems').value = (item.items || []).join('\n');
    document.getElementById('fnFormTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> កែសម្រួលប្រអប់ Function';
    document.getElementById('fnSubmitBtn').innerText = '💾 រក្សាទុកការកែប្រែ';
    document.getElementById('fnCancelBtn').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetFunctionForm() {
    document.getElementById('fnForm').reset();
    document.getElementById('fnEditId').value = '';
    document.getElementById('fnFormTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> បន្ថែមប្រអប់ Function';
    document.getElementById('fnSubmitBtn').innerText = '+ បង្កើតប្រអប់មុខងារ';
    document.getElementById('fnCancelBtn').classList.add('hidden');
}

// Contact Support CRUD
async function saveContact(e) {
    e.preventDefault();
    const editId = document.getElementById('cEditId').value;
    const title = document.getElementById('cTitle').value.trim();
    const desc = document.getElementById('cDesc').value.trim();
    const icon = document.getElementById('cIcon').value;
    const btnText = document.getElementById('cBtnText').value.trim();
    const link = document.getElementById('cLink').value.trim();

    if (editId) {
        const idx = contacts.findIndex(c => c.id == editId);
        if (idx !== -1) {
            contacts[idx] = { id: Number(editId), title, desc, icon, btnText, link };
        }
    } else {
        contacts.push({ id: Date.now(), title, desc, icon, btnText, link });
    }

    const success = await syncAll();
    if (success) {
        alert(editId ? 'កែសម្រួលជោគជ័យ!' : 'រក្សាទុកជោគជ័យ!');
        resetContactForm();
    }
}

function editContact(id) {
    const item = contacts.find(c => c.id == id);
    if (!item) return;
    document.getElementById('cEditId').value = item.id;
    document.getElementById('cTitle').value = item.title;
    document.getElementById('cDesc').value = item.desc;
    document.getElementById('cIcon').value = item.icon;
    document.getElementById('cBtnText').value = item.btnText;
    document.getElementById('cLink').value = item.link;

    document.getElementById('contactFormTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> កែសម្រួល Contact Support';
    document.getElementById('contactSubmitBtn').innerText = '💾 រក្សាទុកការកែប្រែ';
    document.getElementById('contactCancelBtn').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetContactForm() {
    document.getElementById('contactForm').reset();
    document.getElementById('cEditId').value = '';
    document.getElementById('contactFormTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> បន្ថែម Contact Channel';
    document.getElementById('contactSubmitBtn').innerText = '+ រក្សាទុក Contact';
    document.getElementById('contactCancelBtn').classList.add('hidden');
}

// Download Files CRUD (Async/Await ត្រឹមត្រូវ)
async function saveDownload(e) {
    e.preventDefault();
    const editId = document.getElementById('dlEditId').value;
    const fileUrl = document.getElementById('dLink').value.trim();
    const category = document.getElementById('dCategory').value;
    
    const subCategory = (category === 'Patch' || category === 'LDPlayer') 
        ? (document.getElementById('dSubCategory')?.value.trim() || '') 
        : '';
        
    const rawNotes = document.getElementById('dNotes')?.value || '';
    const notesArray = rawNotes.split('\n').map(n => n.trim().replace(/^[-•▪*]\s*/, '')).filter(n => n.length > 0);

    if (!fileUrl) {
        alert('សូមបញ្ចូល Link Download ឯកសារ!');
        return;
    }

    if (editId) {
        const idx = downloads.findIndex(d => d.id == editId);
        if (idx !== -1) {
            downloads[idx].name = document.getElementById('dName').value;
            downloads[idx].category = category;
            downloads[idx].subCategory = subCategory;
            downloads[idx].size = document.getElementById('dSize').value || 'Direct File';
            downloads[idx].link = fileUrl;
            downloads[idx].notes = notesArray;
            if (!downloads[idx].date) downloads[idx].date = getAutoFormattedDate();
        }
    } else {
        downloads.unshift({
            id: Date.now(),
            name: document.getElementById('dName').value,
            category: category,
            subCategory: subCategory,
            size: document.getElementById('dSize').value || 'Direct File',
            link: fileUrl,
            date: getAutoFormattedDate(),
            notes: notesArray
        });
    }
    
    currentAdminDlFilter = category;

    const success = await syncAll();
    if (success) {
        alert(editId ? 'កែសម្រួលជោគជ័យ!' : 'រក្សាទុកជោគជ័យ!');
        resetDownloadForm();
    }
}

function editDownload(id) {
    const item = downloads.find(d => d.id == id);
    if (!item) return;
    document.getElementById('dlEditId').value = item.id;
    document.getElementById('dName').value = item.name;
    document.getElementById('dCategory').value = item.category;
    document.getElementById('dSize').value = item.size || '';
    document.getElementById('dLink').value = item.link || '';
    
    toggleSubCategoryField();
    if (document.getElementById('dSubCategory')) {
        document.getElementById('dSubCategory').value = item.subCategory || '';
    }

    if (document.getElementById('dNotes')) {
        document.getElementById('dNotes').value = (item.notes || []).join('\n');
    }
    document.getElementById('dlFormTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> កែសម្រួល File Download';
    document.getElementById('dlSubmitBtn').innerText = '💾 រក្សាទុកការកែប្រែ';
    document.getElementById('dlCancelBtn').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetDownloadForm() {
    document.getElementById('dlForm').reset();
    document.getElementById('dlEditId').value = '';
    if (document.getElementById('dSubCategory')) document.getElementById('dSubCategory').value = '';
    if (document.getElementById('dNotes')) document.getElementById('dNotes').value = '';
    toggleSubCategoryField();
    document.getElementById('dlFormTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> Upload / បន្ថែម File';
    document.getElementById('dlSubmitBtn').innerText = '+ រក្សាទុក File';
    document.getElementById('dlCancelBtn').classList.add('hidden');
}

async function savePost(e) {
    e.preventDefault();
    const editId = document.getElementById('postEditId').value;
    const youtubeLink = document.getElementById('pYoutubeLink').value.trim();
    const youtubeId = getYoutubeId(youtubeLink);
    if (!youtubeId) {
        alert('សូមបញ្ចូល Link វីដេអូ YouTube ឱ្យបានត្រឹមត្រូវ!');
        return;
    }

    if (editId) {
        const idx = posts.findIndex(p => p.id == editId);
        if (idx !== -1) {
            posts[idx].title = document.getElementById('pTitle').value;
            posts[idx].youtubeLink = youtubeLink;
            posts[idx].youtubeId = youtubeId;
            posts[idx].icon = document.getElementById('pIcon').value;
        }
    } else {
        posts.unshift({
            id: Date.now(),
            title: document.getElementById('pTitle').value,
            youtubeLink: youtubeLink,
            youtubeId: youtubeId,
            icon: document.getElementById('pIcon').value,
            date: new Date().toLocaleDateString('en-GB')
        });
    }
    const success = await syncAll();
    if (success) {
        alert(editId ? 'កែសម្រួលជោគជ័យ!' : 'បង្ហោះជោគជ័យ!');
        resetPostForm();
    }
}

function editPost(id) {
    const item = posts.find(p => p.id == id);
    if (!item) return;
    document.getElementById('postEditId').value = item.id;
    document.getElementById('pTitle').value = item.title;
    document.getElementById('pYoutubeLink').value = item.youtubeLink || '';
    document.getElementById('pIcon').value = item.icon || 'fa-solid fa-graduation-cap';
    document.getElementById('postFormTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> កែសម្រួល Tutorial';
    document.getElementById('postSubmitBtn').innerText = '💾 រក្សាទុកការកែប្រែ';
    document.getElementById('postCancelBtn').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetPostForm() {
    document.getElementById('postForm').reset();
    document.getElementById('postEditId').value = '';
    document.getElementById('postFormTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> បង្ហោះ Tutorial';
    document.getElementById('postSubmitBtn').innerText = '+ បង្ហោះ Tutorial';
    document.getElementById('postCancelBtn').classList.add('hidden');
}

async function removeItem(type, id) {
    if (!confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?')) return;
    if (type === 'function') functionsList = functionsList.filter(f => f.id != id);
    if (type === 'contact') contacts = contacts.filter(c => c.id != id);
    if (type === 'download') downloads = downloads.filter(d => d.id != id);
    if (type === 'post') posts = posts.filter(p => p.id != id);
    await syncAll();
}

// ================= 4. RENDER UI =================

function renderDownloadsList() {
    const cntAll = downloads.length;
    const cntMain = downloads.filter(d => d.category === 'MainFile').length;
    const cntPatch = downloads.filter(d => d.category === 'Patch').length;
    const cntApk = downloads.filter(d => d.category === 'APK').length;
    const cntLd = downloads.filter(d => d.category === 'LDPlayer').length;

    if (document.getElementById('cnt-admin-all')) document.getElementById('cnt-admin-all').innerText = cntAll;
    if (document.getElementById('cnt-admin-MainFile')) document.getElementById('cnt-admin-MainFile').innerText = cntMain;
    if (document.getElementById('cnt-admin-Patch')) document.getElementById('cnt-admin-Patch').innerText = cntPatch;
    if (document.getElementById('cnt-admin-APK')) document.getElementById('cnt-admin-APK').innerText = cntApk;
    if (document.getElementById('cnt-admin-LDPlayer')) document.getElementById('cnt-admin-LDPlayer').innerText = cntLd;

    const filtered = (currentAdminDlFilter === 'all') 
        ? downloads 
        : downloads.filter(d => d.category === currentAdminDlFilter);

    const listDl = document.getElementById('list-downloads');
    if (!listDl) return;

    if (filtered.length === 0) {
        listDl.innerHTML = `<div class="text-gray-500 text-center py-10">គ្មានឯកសារនៅក្នុងប្រភេទនេះទេ</div>`;
        return;
    }

    listDl.innerHTML = filtered.map(d => {
        const notesList = (d.notes && d.notes.length > 0) 
            ? `<ul class="mt-2 space-y-0.5 text-[11px] text-gray-400">${d.notes.map(n => `<li>▪ ${n}</li>`).join('')}</ul>` 
            : '';
        const subBadge = d.subCategory ? `<span class="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-bold">🏷️ ${d.subCategory}</span>` : '';
        return `
            <div class="p-3.5 bg-dark-bg border border-dark-border rounded-xl hover:border-emerald-500/30 transition">
                <div class="flex justify-between items-start gap-2">
                    <div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <h4 class="font-bold text-white text-sm">${d.name}</h4>
                            <span class="text-[10px] text-gray-400 bg-dark-card px-2 py-0.5 rounded border border-dark-border">${d.date || ''}</span>
                            ${subBadge}
                        </div>
                        <div class="mt-1 flex items-center gap-2">
                            <span class="text-[10px] bg-brand-500/10 text-brand-300 px-1.5 py-0.5 rounded">${d.category}</span>
                            <span class="text-[11px] text-gray-500">${d.size || ''}</span>
                        </div>
                        ${notesList}
                    </div>
                    <div class="flex gap-2 flex-shrink-0">
                        <button onclick="editDownload(${d.id})" class="text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="removeItem('download', ${d.id})" class="text-red-400 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderAllTabs() {
    document.getElementById('count-functions').innerText = functionsList.length;
    document.getElementById('count-contacts').innerText = contacts.length;
    document.getElementById('count-downloads').innerText = downloads.length;
    document.getElementById('count-tutorials').innerText = posts.length;

    // 1. Functions
    const listFn = document.getElementById('list-functions');
    if (listFn) {
        listFn.innerHTML = functionsList.map(f => `
            <div class="bg-dark-bg p-4 rounded-xl border border-dark-border flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-bold text-yellow-400"><i class="${f.icon || 'fa-solid fa-cube'} mr-1"></i> ${f.title}</span>
                        <div class="flex gap-1.5">
                            <button onclick="editFunction(${f.id})" class="text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20"><i class="fa-solid fa-pen"></i> កែប្រែ</button>
                            <button onclick="removeItem('function', ${f.id})" class="text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/20"><i class="fa-solid fa-trash"></i> លុប</button>
                        </div>
                    </div>
                    <ul class="space-y-1 text-gray-400 text-[11px]">${(f.items || []).map(i => `<li>• ${i}</li>`).join('')}</ul>
                </div>
            </div>
        `).join('') || '<p class="text-gray-500 text-xs">គ្មានទិន្នន័យ</p>';
    }

    // 2. Contacts
    const listCt = document.getElementById('list-contacts');
    if (listCt) {
        listCt.innerHTML = contacts.map(c => `
            <div class="bg-dark-bg p-4 rounded-xl border border-dark-border flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-lg">
                        <i class="${c.icon || 'fa-solid fa-headset'}"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-white text-sm">${c.title}</h4>
                        <p class="text-[11px] text-gray-400">${c.desc || ''}</p>
                    </div>
                </div>
                <div class="flex gap-1.5">
                    <button onclick="editContact(${c.id})" class="text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="removeItem('contact', ${c.id})" class="text-red-400 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `).join('') || '<p class="text-gray-500 text-xs">គ្មានទិន្នន័យ</p>';
    }

    // 3. Downloads
    renderDownloadsList();

    // 4. Tutorials
    const listTt = document.getElementById('list-tutorials');
    if (listTt) {
        listTt.innerHTML = posts.map(p => `
            <div class="bg-dark-bg border border-dark-border rounded-xl overflow-hidden flex flex-col justify-between">
                <div class="relative aspect-video bg-black flex items-center justify-center">
                    <img src="https://img.youtube.com/vi/${p.youtubeId}/hqdefault.jpg" class="w-full h-full object-cover opacity-80">
                    <div class="absolute w-10 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white text-xs">
                        <i class="fa-solid fa-play"></i>
                    </div>
                </div>
                <div class="p-3">
                    <span class="text-[10px] text-cyan-400 font-bold"><i class="${p.icon || 'fa-solid fa-graduation-cap'} mr-1"></i> ${p.date || ''}</span>
                    <h4 class="font-bold text-white text-xs mt-1 mb-2 line-clamp-1">${p.title}</h4>
                    <div class="flex gap-2 mt-2">
                        <button onclick="editPost(${p.id})" class="w-1/2 text-blue-400 bg-blue-500/10 py-1 rounded border border-blue-500/20"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="removeItem('post', ${p.id})" class="w-1/2 text-red-400 bg-red-500/10 py-1 rounded border border-red-500/20"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `).join('') || '<p class="text-gray-500 text-xs">គ្មានទិន្នន័យ</p>';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    checkAuthOnLoad();
    toggleSubCategoryField();
});
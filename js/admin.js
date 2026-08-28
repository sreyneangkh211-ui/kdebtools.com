// =========================================================
//                   FILE: js/admin.js
//       (ប្រព័ន្ធ Logic, Auto-Login & CRUD របស់ Admin)
// =========================================================

const BIN_ID = "6a917cb3da38895dfe1c169c";
const API_KEY = "$2a$10$3jKyJxhLrAn/3gCKlwjvSOtBFGKwfnUDm6/J9E1BeuJVel/z2hTDy";

const defaultFunctions = [
    { id: 1, title: "Account Manage", icon: "fa-solid fa-user-shield", items: ["Auto switch Profiles", "Check Live / Die UID", "Auto solve Captcha & 2FA", "Interactions Feed & Reels"] },
    { id: 2, title: "Page & Post", icon: "fa-solid fa-share-from-square", items: ["Auto post Reels & Videos", "Auto comment & interaction", "Schedule Post (Time/Date)", "Auto Story with link"] },
    { id: 3, title: "LDPlayer Control", icon: "fa-solid fa-mobile-screen", items: ["Open/Close Multi-LDPlayer", "Auto arrange LD windows", "Auto GPS & Timezone sync", "Backup & restore instances"] },
    { id: 4, title: "System & Support", icon: "fa-solid fa-gears", items: ["ដំណើរការលើ Windows 10/11", "Auto shutdown ពេលចប់ការងារ", "Support Proxy HTTP/SOCKS5", "Support ផ្ទាល់ពី Kdeb Tools"] }
];

const defaultFeaturedTools = [
    { id: 1, name: "Kdeb Tools Automation", features: ["គ្រប់គ្រង Account & Page ដោយស្វ័យប្រវត្តិ", "ដំណើរការជាមួយ LDPlayer ច្រើនផ្ទាំងយ៉ាងរលូន", "Auto Post, Reels, និង Schedule មាតិកា"], system: "Win 10/11 64-bit | RAM 8GB+", link: "#" },
    { id: 2, name: "Kdeb Tools Downloader", features: ["ទាញយកវីដេអូរឿងភាគ និង Media គ្មាន Watermark", "គាំទ្រវេបសាយ និង Platform ជាច្រើន", "ទាញយកបានលឿនក្នុងកម្រិត Full HD"], system: "Win 10/11 | RAM 4GB+", link: "#" }
];

const defaultDownloads = [
    { id: 1, name: "LDPlayer 9 Clean Optimized", category: "LDPlayer", size: "620 MB", link: "https://example.com/ld9.exe", date: "Aug-17-2026", notes: [] },
    { id: 2, name: "Bob Prime Main Setup v2.6", category: "MainFile", size: "45 MB", link: "https://example.com/setup.exe", date: "Aug-17-2026", notes: [] },
    { id: 3, name: "Patch Update: V1.6.17", category: "Patch", size: "12 MB", link: "https://example.com/patch.exe", date: "Aug-17-2026", notes: ["Fixed follow/unfollow pages/profiles", "Fixed add/follow friends", "Fixed known issues"] }
];

const defaultPosts = [
    { id: 1, title: "របៀបតម្លើង Kdeb Tools ជាមួយ LDPlayer 9", youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", youtubeId: "dQw4w9WgXcQ", icon: "fa-solid fa-download", date: "28/08/2026" }
];

let functionsList = [];
let tools = [];
let downloads = [];
let posts = [];

// Helper: បង្កើត Auto Date ទម្រង់ "Aug-17-2026"
function getAutoFormattedDate() {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const m = months[now.getMonth()];
    const d = String(now.getDate()).padStart(2, '0');
    const y = now.getFullYear();
    return `${m}-${d}-${y}`;
}

// ប្រព័ន្ធ Auto-Migration
function migrateOldDownloads(dataArray) {
    if (!Array.isArray(dataArray)) return dataArray;
    return dataArray.map(item => {
        if (item.category === 'Driver' || item.category === 'APK') {
            item.category = 'MainFile'; 
        } else if (item.category === 'Tool') {
            item.category = 'Patch'; 
        }
        if (!item.date) item.date = getAutoFormattedDate();
        if (!item.notes) item.notes = [];
        return item;
    });
}

// ================= 1. AUTHENTICATION =================

function checkAuthOnLoad() {
    const isLoggedIn = localStorage.getItem('kdeb_admin_logged_in');
    if (isLoggedIn === 'true') {
        showDashboard();
    } else {
        showLoginScreen();
    }
}

function showDashboard() {
    const loginScr = document.getElementById('loginScreen');
    const dashScr = document.getElementById('dashboardScreen');
    if (loginScr) loginScr.classList.add('hidden');
    if (dashScr) dashScr.classList.remove('hidden');

    loadAdminData();
}

function showLoginScreen() {
    const loginScr = document.getElementById('loginScreen');
    const dashScr = document.getElementById('dashboardScreen');
    if (dashScr) dashScr.classList.add('hidden');
    if (loginScr) loginScr.classList.remove('hidden');
}

function handleLogin() {
    const userInput = document.getElementById('usernameInput');
    const passInput = document.getElementById('passInput');
    if (!userInput || !passInput) return;

    const username = userInput.value.trim();
    const password = passInput.value;

    if (username === 'kdebtools' && password === 'kdebtools.admin.kh') {
        localStorage.setItem('kdeb_admin_logged_in', 'true');
        showDashboard();
    } else {
        alert('Username ឬ Password មិនត្រឹមត្រូវទេ! សូមពិនិត្យម្តងទៀត។');
    }
}

function logout() {
    if (!confirm('តើអ្នកពិតជាចង់ចាកចេញមែនទេ?')) return;
    localStorage.removeItem('kdeb_admin_logged_in');
    showLoginScreen();
    if (document.getElementById('usernameInput')) document.getElementById('usernameInput').value = '';
    if (document.getElementById('passInput')) document.getElementById('passInput').value = '';
}

// ================= 2. DATA MANAGEMENT =================

async function loadAdminData() {
    const listFn = document.getElementById('list-functions');
    if (listFn) listFn.innerHTML = '<p class="text-cyan-400 text-xs animate-pulse">⏳ កំពុងទាញយកទិន្នន័យពី Cloud...</p>';

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': API_KEY
            }
        });
        if (response.ok) {
            const result = await response.json();
            const record = result.record;
            functionsList = record.functions || defaultFunctions;
            tools = record.tools || defaultFeaturedTools;
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
    tools = defaultFeaturedTools;
    downloads = defaultDownloads;
    posts = defaultPosts;
    renderAllTabs();
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const content = document.getElementById('content-' + tabName);
    const tab = document.getElementById('tab-' + tabName);
    if (content) content.classList.remove('hidden');
    if (tab) tab.classList.add('active');
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
        tools: tools,
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
            alert('⚠️ រក្សាទុកទៅ Cloud បរាជ័យ! សូមពិនិត្យមើល API Key ឬ Bin ID។');
            return false;
        }
    } catch (err) {
        alert('⚠️ មិនអាចភ្ជាប់ទៅកាន់ Cloud បានទេ! សូមពិនិត្យមើលអ៊ីនធឺណិតរបស់អ្នក។');
        return false;
    }
}

function getYoutubeId(url) {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com')) {
            if (urlObj.pathname.includes('/shorts/')) {
                return urlObj.pathname.split('/shorts/')[1].split(/[?#&]/)[0];
            }
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

function saveFunctionGroup(e) {
    e.preventDefault();
    const editId = document.getElementById('fnEditId').value;
    const rawText = document.getElementById('fnItems').value;
    const itemsArray = rawText.split('\n').map(i => i.trim().replace(/^•\s*/, '')).filter(i => i.length > 0);

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
    if (syncAll()) {
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

function saveTool(e) {
    e.preventDefault();
    const editId = document.getElementById('toolEditId').value;
    const features = document.getElementById('tFeatures').value.split(',').map(f => f.trim()).filter(f => f);

    if (editId) {
        const idx = tools.findIndex(t => t.id == editId);
        if (idx !== -1) {
            tools[idx].name = document.getElementById('tName').value;
            tools[idx].features = features;
            tools[idx].system = document.getElementById('tSystem').value;
            tools[idx].link = document.getElementById('tLink').value;
        }
    } else {
        tools.unshift({
            id: Date.now(),
            name: document.getElementById('tName').value,
            features: features,
            system: document.getElementById('tSystem').value,
            link: document.getElementById('tLink').value
        });
    }
    if (syncAll()) {
        alert(editId ? 'កែសម្រួលជោគជ័យ!' : 'រក្សាទុកជោគជ័យ!');
        resetToolForm();
    }
}

function editTool(id) {
    const item = tools.find(t => t.id == id);
    if (!item) return;
    document.getElementById('toolEditId').value = item.id;
    document.getElementById('tName').value = item.name;
    document.getElementById('tFeatures').value = Array.isArray(item.features) ? item.features.join(', ') : item.features;
    document.getElementById('tSystem').value = item.system;
    document.getElementById('tLink').value = item.link;
    document.getElementById('toolFormTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> កែសម្រួល Featured Tool';
    document.getElementById('toolSubmitBtn').innerText = '💾 រក្សាទុកការកែប្រែ';
    document.getElementById('toolCancelBtn').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetToolForm() {
    document.getElementById('toolForm').reset();
    document.getElementById('toolEditId').value = '';
    document.getElementById('toolFormTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> បន្ថែម Featured Tool';
    document.getElementById('toolSubmitBtn').innerText = '+ រក្សាទុក Tool';
    document.getElementById('toolCancelBtn').classList.add('hidden');
}

// មុខងារ SAVE DOWNLOAD (គាំទ្រ Notes និង Auto Date)
function saveDownload(e) {
    e.preventDefault();
    const editId = document.getElementById('dlEditId').value;
    const fileUrl = document.getElementById('dLink').value.trim();
    const rawNotes = document.getElementById('dNotes') ? document.getElementById('dNotes').value : '';
    const notesArray = rawNotes.split('\n').map(n => n.trim().replace(/^[-•▪*]\s*/, '')).filter(n => n.length > 0);

    if (!fileUrl) {
        alert('សូមបញ្ចូល Link Download ឯកសារ!');
        return;
    }

    if (editId) {
        const idx = downloads.findIndex(d => d.id == editId);
        if (idx !== -1) {
            downloads[idx].name = document.getElementById('dName').value;
            downloads[idx].category = document.getElementById('dCategory').value;
            downloads[idx].size = document.getElementById('dSize').value || 'Direct File';
            downloads[idx].link = fileUrl;
            downloads[idx].notes = notesArray;
            // អាចរក្សាកាលបរិច្ឆេទចាស់ ឬអាប់ដេតថ្មី
            if (!downloads[idx].date) downloads[idx].date = getAutoFormattedDate();
        }
    } else {
        downloads.unshift({
            id: Date.now(),
            name: document.getElementById('dName').value,
            category: document.getElementById('dCategory').value,
            size: document.getElementById('dSize').value || 'Direct File',
            link: fileUrl,
            date: getAutoFormattedDate(), // កាលបរិច្ឆេទ Release ស្វ័យប្រវត្តិ
            notes: notesArray
        });
    }
    if (syncAll()) {
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
    if (document.getElementById('dNotes')) document.getElementById('dNotes').value = '';
    document.getElementById('dlFormTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> Upload / បន្ថែម File';
    document.getElementById('dlSubmitBtn').innerText = '+ រក្សាទុក File';
    document.getElementById('dlCancelBtn').classList.add('hidden');
}

function savePost(e) {
    e.preventDefault();
    const editId = document.getElementById('postEditId').value;
    const youtubeLink = document.getElementById('pYoutubeLink').value.trim();
    
    const iconEl = document.getElementById('pIcon');
    const selectedIcon = iconEl ? iconEl.value : 'fa-solid fa-graduation-cap';
    
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
            posts[idx].icon = selectedIcon;
        }
    } else {
        posts.unshift({
            id: Date.now(),
            title: document.getElementById('pTitle').value,
            youtubeLink: youtubeLink,
            youtubeId: youtubeId,
            icon: selectedIcon,
            date: new Date().toLocaleDateString('en-GB')
        });
    }
    if (syncAll()) {
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
    
    const iconEl = document.getElementById('pIcon');
    if (iconEl) iconEl.value = item.icon || 'fa-solid fa-graduation-cap';

    document.getElementById('postFormTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> កែសម្រួល Tutorial';
    document.getElementById('postSubmitBtn').innerText = '💾 រក្សាទុកការកែប្រែ';
    document.getElementById('postCancelBtn').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetPostForm() {
    document.getElementById('postForm').reset();
    document.getElementById('postEditId').value = '';
    
    const iconEl = document.getElementById('pIcon');
    if (iconEl) iconEl.value = 'fa-solid fa-graduation-cap';

    document.getElementById('postFormTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> បង្ហោះ Tutorial';
    document.getElementById('postSubmitBtn').innerText = '+ បង្ហោះ Tutorial';
    document.getElementById('postCancelBtn').classList.add('hidden');
}

function removeItem(type, id) {
    if (!confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?')) return;
    if (type === 'function') functionsList = functionsList.filter(f => f.id != id);
    if (type === 'tool') tools = tools.filter(t => t.id != id);
    if (type === 'download') downloads = downloads.filter(d => d.id != id);
    if (type === 'post') posts = posts.filter(p => p.id != id);
    syncAll();
}

// ================= 4. RENDER UI =================

function renderAllTabs() {
    const countFn = document.getElementById('count-functions');
    const countTl = document.getElementById('count-tools');
    const countDl = document.getElementById('count-downloads');
    const countTt = document.getElementById('count-tutorials');

    if (countFn) countFn.innerText = functionsList.length;
    if (countTl) countTl.innerText = tools.length;
    if (countDl) countDl.innerText = downloads.length;
    if (countTt) countTt.innerText = posts.length;

    const listFn = document.getElementById('list-functions');
    if (listFn) {
        listFn.innerHTML = functionsList.map(f => `
            <div class="bg-dark-bg p-4 rounded-xl border border-dark-border flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-bold text-yellow-400"><i class="${f.icon || 'fa-solid fa-cube'} mr-1"></i> ${f.title}</span>
                        <div class="flex gap-1.5">
                            <button onclick="editFunction(${f.id})" class="text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20"><i class="fa-solid fa-pen"></i> កែប្រែ</button>
                            <button onclick="removeItem('function', ${f.id})" class="text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/20"><i class="fa-solid fa-trash"></i> លុប</button>
                        </div>
                    </div>
                    <ul class="space-y-1 text-gray-400 text-[11px]">${(f.items || []).map(i => `<li>• ${i}</li>`).join('')}</ul>
                </div>
            </div>
        `).join('') || '<p class="text-gray-500 text-xs">គ្មានទិន្នន័យ</p>';
    }

    const listTl = document.getElementById('list-tools');
    if (listTl) {
        listTl.innerHTML = tools.map(t => `
            <div class="flex justify-between items-center p-3.5 bg-dark-bg border border-dark-border rounded-xl">
                <div>
                    <h4 class="font-bold text-white text-sm">${t.name}</h4>
                    <p class="text-[11px] text-gray-400">${t.system || ''}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="editTool(${t.id})" class="text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20"><i class="fa-solid fa-pen"></i> កែប្រែ</button>
                    <button onclick="removeItem('tool', ${t.id})" class="text-red-400 hover:text-red-300 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20"><i class="fa-solid fa-trash"></i> លុប</button>
                </div>
            </div>
        `).join('') || '<p class="text-gray-500 text-xs">គ្មានទិន្នន័យ</p>';
    }

    const listDl = document.getElementById('list-downloads');
    if (listDl) {
        listDl.innerHTML = downloads.map(d => {
            let catLabel = d.category;
            if (d.category === 'LDPlayer') catLabel = 'LDPlayer / Emulator';
            else if (d.category === 'MainFile') catLabel = 'Main Files';
            else if (d.category === 'Patch') catLabel = 'Patch Update';
            else if (d.category === 'APK') catLabel = 'App APK';

            const notesList = (d.notes && d.notes.length > 0) 
                ? `<ul class="mt-2 space-y-0.5 text-[11px] text-gray-400">${d.notes.map(n => `<li>▪ ${n}</li>`).join('')}</ul>` 
                : '';

            return `
                <div class="p-3.5 bg-dark-bg border border-dark-border rounded-xl">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="flex items-center gap-2">
                                <h4 class="font-bold text-white text-sm">${d.name}</h4>
                                <span class="text-[10px] text-gray-400 bg-dark-card px-2 py-0.5 rounded border border-dark-border">${d.date || ''}</span>
                            </div>
                            <div class="mt-1 flex items-center gap-2">
                                <span class="text-[10px] bg-brand-500/10 text-brand-300 px-1.5 py-0.5 rounded">${catLabel}</span>
                                <span class="text-[11px] text-gray-500">${d.size || ''}</span>
                            </div>
                            ${notesList}
                        </div>
                        <div class="flex gap-2">
                            <button onclick="editDownload(${d.id})" class="text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20"><i class="fa-solid fa-pen"></i> កែប្រែ</button>
                            <button onclick="removeItem('download', ${d.id})" class="text-red-400 hover:text-red-300 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20"><i class="fa-solid fa-trash"></i> លុប</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('') || '<p class="text-gray-500 text-xs">គ្មានទិន្នន័យ</p>';
    }

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
                        <button onclick="editPost(${p.id})" class="w-1/2 text-blue-400 bg-blue-500/10 py-1 rounded border border-blue-500/20 text-center"><i class="fa-solid fa-pen"></i> កែប្រែ</button>
                        <button onclick="removeItem('post', ${p.id})" class="w-1/2 text-red-400 bg-red-500/10 py-1 rounded border border-red-500/20 text-center"><i class="fa-solid fa-trash"></i> លុប</button>
                    </div>
                </div>
            </div>
        `).join('') || '<p class="text-gray-500 text-xs">គ្មានទិន្នន័យ</p>';
    }
}

window.addEventListener('DOMContentLoaded', checkAuthOnLoad);
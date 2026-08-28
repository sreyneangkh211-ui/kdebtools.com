// =========================================================
//                   FILE: admin.js
//       (ប្រព័ន្ធ Logic, CRUD & LocalStorage របស់ Admin)
// =========================================================

const defaultFunctions = [
    { id: 1, title: "Account Manage", icon: "fa-solid fa-user-shield", items: ["Auto switch Profiles", "Check Live / Die UID", "Auto solve Captcha & 2FA", "Interactions Feed & Reels"] },
    { id: 2, title: "Page & Post", icon: "fa-solid fa-share-from-square", items: ["Auto post Reels & Videos", "Auto comment & interaction", "Schedule Post (Time/Date)", "Auto Story with link"] },
    { id: 3, title: "LDPlayer Control", icon: "fa-solid fa-mobile-screen", items: ["Open/Close Multi-LDPlayer", "Auto arrange LD windows", "Auto GPS & Timezone sync", "Backup & restore instances"] },
    { id: 4, title: "System & Support", icon: "fa-solid fa-gears", items: ["ដំណើរការលើ Windows 10/11", "Auto shutdown ពេលចប់ការងារ", "Support Proxy HTTP/SOCKS5", "Support ផ្ទាល់ពី Kdeb Tools"] }
];

const defaultDownloads = [
    { id: 1, name: "LDPlayer 9 Clean Optimized", category: "LDPlayer", size: "620 MB", link: "https://example.com/ld9.exe" },
    { id: 2, name: "Nvidia GPU Driver Auto Setup", category: "Driver", size: "680 MB", link: "https://example.com/driver.exe" }
];

const defaultPosts = [
    { id: 1, title: "របៀបតម្លើង Kdeb Tools ជាមួយ LDPlayer 9", content: "ការណែនាំលម្អិតមួយជំហានម្តងៗដើម្បីរៀបចំ Emulator កុំឲ្យគាំង...", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop", date: "28/08/2026" }
];

let functionsList = [];
let tools = [];
let downloads = [];
let posts = [];

function loadAdminData() {
    functionsList = JSON.parse(localStorage.getItem('kdeb_functions')) || defaultFunctions;
    tools = JSON.parse(localStorage.getItem('kdeb_pro_tools')) || [];
    downloads = JSON.parse(localStorage.getItem('kdeb_pro_downloads')) || defaultDownloads;
    posts = JSON.parse(localStorage.getItem('kdeb_pro_posts')) || defaultPosts;
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    const content = document.getElementById('content-' + tabName);
    const tab = document.getElementById('tab-' + tabName);
    if (content) content.classList.remove('hidden');
    if (tab) tab.classList.add('active');
}

function handleLogin() {
    const input = document.getElementById('passInput');
    if (!input) return;
    if (input.value === 'admin123') {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboardScreen').classList.remove('hidden');
        loadAdminData();
        renderAllTabs();
    } else {
        alert('Password មិនត្រឹមត្រូវទេ! (admin123)');
    }
}

function logout() {
    document.getElementById('dashboardScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('passInput').value = '';
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function autoFillFileInfo(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        document.getElementById('dName').value = file.name;
        document.getElementById('dSize').value = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    }
}

function syncAll() {
    try {
        localStorage.setItem('kdeb_functions', JSON.stringify(functionsList));
        localStorage.setItem('kdeb_pro_tools', JSON.stringify(tools));
        localStorage.setItem('kdeb_pro_downloads', JSON.stringify(downloads));
        localStorage.setItem('kdeb_pro_posts', JSON.stringify(posts));
        renderAllTabs();
    } catch (err) {
        alert('Storage ពេញ! សូមកុំ Upload រូបភាព ឬ File ធំពេក។');
    }
}

// 1. FUNCTIONS CRUD
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
        alert('កែសម្រួលជោគជ័យ!');
    } else {
        functionsList.push({
            id: Date.now(),
            title: document.getElementById('fnTitle').value,
            icon: document.getElementById('fnIcon').value,
            items: itemsArray
        });
        alert('បន្ថែមជោគជ័យ!');
    }
    resetFunctionForm();
    syncAll();
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

// 2. TOOLS CRUD
function saveTool(e) {
    e.preventDefault();
    const editId = document.getElementById('toolEditId').value;
    const features = document.getElementById('tFeatures').value.split(',');

    if (editId) {
        const idx = tools.findIndex(t => t.id == editId);
        if (idx !== -1) {
            tools[idx].name = document.getElementById('tName').value;
            tools[idx].features = features;
            tools[idx].system = document.getElementById('tSystem').value;
            tools[idx].link = document.getElementById('tLink').value;
        }
        alert('កែសម្រួលជោគជ័យ!');
    } else {
        tools.unshift({
            id: Date.now(),
            name: document.getElementById('tName').value,
            version: "PRO v2.0",
            features: features,
            system: document.getElementById('tSystem').value,
            link: document.getElementById('tLink').value
        });
        alert('រក្សាទុកជោគជ័យ!');
    }
    resetToolForm();
    syncAll();
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

// 3. DOWNLOADS CRUD
async function saveDownload(e) {
    e.preventDefault();
    const editId = document.getElementById('dlEditId').value;
    const fileInput = document.getElementById('dFileInput');
    let fileUrl = document.getElementById('dLink').value;

    if (fileInput.files && fileInput.files[0]) {
        fileUrl = await readFileAsDataURL(fileInput.files[0]);
    }

    if (editId) {
        const idx = downloads.findIndex(d => d.id == editId);
        if (idx !== -1) {
            downloads[idx].name = document.getElementById('dName').value;
            downloads[idx].category = document.getElementById('dCategory').value;
            downloads[idx].size = document.getElementById('dSize').value || 'Direct File';
            if (fileUrl) downloads[idx].link = fileUrl;
        }
        alert('កែសម្រួលជោគជ័យ!');
    } else {
        downloads.unshift({
            id: Date.now(),
            name: document.getElementById('dName').value,
            category: document.getElementById('dCategory').value,
            size: document.getElementById('dSize').value || 'Direct File',
            link: fileUrl || '#'
        });
        alert('រក្សាទុកជោគជ័យ!');
    }
    resetDownloadForm();
    syncAll();
}

function editDownload(id) {
    const item = downloads.find(d => d.id == id);
    if (!item) return;
    document.getElementById('dlEditId').value = item.id;
    document.getElementById('dName').value = item.name;
    document.getElementById('dCategory').value = item.category;
    document.getElementById('dSize').value = item.size || '';
    document.getElementById('dLink').value = item.link && item.link.startsWith('data:') ? '' : (item.link || '');
    document.getElementById('dlFormTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> កែសម្រួល File Download';
    document.getElementById('dlSubmitBtn').innerText = '💾 រក្សាទុកការកែប្រែ';
    document.getElementById('dlCancelBtn').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetDownloadForm() {
    document.getElementById('dlForm').reset();
    document.getElementById('dlEditId').value = '';
    document.getElementById('dlFormTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> Upload / បន្ថែម File';
    document.getElementById('dlSubmitBtn').innerText = '+ រក្សាទុក File';
    document.getElementById('dlCancelBtn').classList.add('hidden');
}

// 4. TUTORIALS CRUD
async function savePost(e) {
    e.preventDefault();
    const editId = document.getElementById('postEditId').value;
    const imgFileInput = document.getElementById('pImageFile');
    let imgUrl = document.getElementById('pImageLink').value || document.getElementById('postExistingImage').value;

    if (imgFileInput.files && imgFileInput.files[0]) {
        imgUrl = await readFileAsDataURL(imgFileInput.files[0]);
    } else if (!imgUrl) {
        imgUrl = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop";
    }

    if (editId) {
        const idx = posts.findIndex(p => p.id == editId);
        if (idx !== -1) {
            posts[idx].title = document.getElementById('pTitle').value;
            posts[idx].image = imgUrl;
            posts[idx].content = document.getElementById('pContent').value;
        }
        alert('កែសម្រួលជោគជ័យ!');
    } else {
        posts.unshift({
            id: Date.now(),
            title: document.getElementById('pTitle').value,
            image: imgUrl,
            content: document.getElementById('pContent').value,
            date: new Date().toLocaleDateString('en-GB')
        });
        alert('បង្ហោះជោគជ័យ!');
    }
    resetPostForm();
    syncAll();
}

function editPost(id) {
    const item = posts.find(p => p.id == id);
    if (!item) return;
    document.getElementById('postEditId').value = item.id;
    document.getElementById('pTitle').value = item.title;
    document.getElementById('pContent').value = item.content;
    document.getElementById('postExistingImage').value = item.image;
    document.getElementById('pImageLink').value = item.image && item.image.startsWith('data:') ? '' : (item.image || '');
    document.getElementById('postFormTitle').innerHTML = '<i class="fa-solid fa-pen-to-square"></i> កែសម្រួល Tutorial';
    document.getElementById('postSubmitBtn').innerText = '💾 រក្សាទុកការកែប្រែ';
    document.getElementById('postCancelBtn').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetPostForm() {
    document.getElementById('postForm').reset();
    document.getElementById('postEditId').value = '';
    document.getElementById('postExistingImage').value = '';
    document.getElementById('postFormTitle').innerHTML = '<i class="fa-solid fa-plus-circle"></i> បង្ហោះ Tutorial';
    document.getElementById('postSubmitBtn').innerText = '+ បង្ហោះ Tutorial';
    document.getElementById('postCancelBtn').classList.add('hidden');
}

// DELETE HANDLER
function removeItem(type, id) {
    if (!confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យនេះមែនទេ?')) return;
    if (type === 'function') functionsList = functionsList.filter(f => f.id != id);
    if (type === 'tool') tools = tools.filter(t => t.id != id);
    if (type === 'download') downloads = downloads.filter(d => d.id != id);
    if (type === 'post') posts = posts.filter(p => p.id != id);
    syncAll();
}

// RENDER ALL ADMIN TABS
function renderAllTabs() {
    document.getElementById('count-functions').innerText = functionsList.length;
    document.getElementById('count-tools').innerText = tools.length;
    document.getElementById('count-downloads').innerText = downloads.length;
    document.getElementById('count-tutorials').innerText = posts.length;

    // 1. Functions List
    document.getElementById('list-functions').innerHTML = functionsList.map(f => `
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

    // 2. Tools List
    document.getElementById('list-tools').innerHTML = tools.map(t => `
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

    // 3. Downloads List
    document.getElementById('list-downloads').innerHTML = downloads.map(d => `
        <div class="flex justify-between items-center p-3.5 bg-dark-bg border border-dark-border rounded-xl">
            <div>
                <h4 class="font-bold text-white text-sm">${d.name}</h4>
                <span class="text-[10px] bg-brand-500/10 text-brand-300 px-1.5 py-0.5 rounded">${d.category}</span>
                <span class="text-[11px] text-gray-500 ml-1">${d.size || ''}</span>
            </div>
            <div class="flex gap-2">
                <button onclick="editDownload(${d.id})" class="text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20"><i class="fa-solid fa-pen"></i> កែប្រែ</button>
                <button onclick="removeItem('download', ${d.id})" class="text-red-400 hover:text-red-300 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20"><i class="fa-solid fa-trash"></i> លុប</button>
            </div>
        </div>
    `).join('') || '<p class="text-gray-500 text-xs">គ្មានទិន្នន័យ</p>';

    // 4. Tutorials List
    document.getElementById('list-tutorials').innerHTML = posts.map(p => `
        <div class="bg-dark-bg border border-dark-border rounded-xl overflow-hidden flex flex-col justify-between">
            <img src="${p.image}" class="w-full h-32 object-cover" onerror="this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'">
            <div class="p-3">
                <span class="text-[10px] text-cyan-400 font-bold">${p.date || ''}</span>
                <h4 class="font-bold text-white text-xs mt-1 mb-2 line-clamp-1">${p.title}</h4>
                <div class="flex gap-2 mt-2">
                    <button onclick="editPost(${p.id})" class="w-1/2 text-blue-400 bg-blue-500/10 py-1 rounded border border-blue-500/20 text-center"><i class="fa-solid fa-pen"></i> កែប្រែ</button>
                    <button onclick="removeItem('post', ${p.id})" class="w-1/2 text-red-400 bg-red-500/10 py-1 rounded border border-red-500/20 text-center"><i class="fa-solid fa-trash"></i> លុប</button>
                </div>
            </div>
        </div>
    `).join('') || '<p class="text-gray-500 text-xs">គ្មានទិន្នន័យ</p>';
}
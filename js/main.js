// =========================================================
//                   FILE: js/main.js
//       (ប្រព័ន្ធ Router ប្តូរទំព័រ Clean URL & Render ទិន្នន័យ)
// =========================================================

// ROUTER: ប្តូរទំព័រ (Clean URL គ្មានសញ្ញា #)
function navigateTo(pageId, pushToHistory = true) {
    const validPages = ['home', 'automation', 'downloader', 'downloads', 'tutorials', 'utilities', 'contact'];
    const activePage = validPages.includes(pageId) ? pageId : 'home';

    // 1. បិទ/បើក View
    document.querySelectorAll('.page-view').forEach(view => view.classList.add('hidden'));
    const targetView = document.getElementById('view-' + activePage) || document.getElementById('view-home');
    if (targetView) targetView.classList.remove('hidden');

    // 2. ដាក់ពណ៌ Active លើ Menu
    document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('tab-active'));
    const activeBtn = document.getElementById('nav-' + activePage);
    if (activeBtn) activeBtn.classList.add('tab-active');

    // 3. អូសទៅលើបង្អស់
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 4. កែសម្រួល URL កុំឱ្យមានសញ្ញា #
    if (pushToHistory) {
        if (activePage === 'home') {
            // ទំព័រដើម បង្ហាញតែ https://kdebtools.com/ ស្អាត (គ្មាន #)
            history.pushState({ page: 'home' }, '', window.location.pathname);
        } else {
            // ទំព័រផ្សេងៗ បង្ហាញតាម Parameter ស្អាត (គ្មាន #)
            history.pushState({ page: activePage }, '', '?view=' + activePage);
        }
    }
}

// គាំទ្រការចុច Back / Forward លើ Browser
window.addEventListener('popstate', (e) => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || (e.state && e.state.page) || 'home';
    navigateTo(view, false);
});

// ទិន្នន័យ Default
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
    { id: 1, name: "LDPlayer 9 Clean Optimized", category: "LDPlayer", size: "620 MB", link: "https://example.com/ld9.exe" },
    { id: 2, name: "Nvidia GPU Driver Auto Setup", category: "Driver", size: "680 MB", link: "https://example.com/driver.exe" }
];

const defaultPosts = [
    { id: 1, title: "របៀបតម្លើង Kdeb Tools ជាមួយ LDPlayer 9", content: "ការណែនាំលម្អិតមួយជំហានម្តងៗដើម្បីរៀបចំ Emulator កុំឲ្យគាំង...", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop", date: "28/08/2026" }
];

// RENDER DATA ចេញពី LOCALSTORAGE មកបង្ហាញលើ WEB
function renderPublicData() {
    // 1. Render Important Functions
    const functionsList = JSON.parse(localStorage.getItem('kdeb_functions')) || defaultFunctions;
    const fnContainer = document.getElementById('importantFunctionsGrid');
    if (fnContainer) {
        fnContainer.innerHTML = functionsList.map(fn => `
            <div class="bg-dark-bg p-4 rounded-xl border border-dark-border hover:border-brand-500/40 transition">
                <h4 class="font-bold text-brand-400 mb-3 flex items-center gap-2">
                    <i class="${fn.icon || 'fa-solid fa-cube'}"></i> ${fn.title}
                </h4>
                <ul class="space-y-2 text-gray-300">
                    ${(fn.items || []).map(item => `<li>• ${item}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }

    // 2. Render Featured Tools (Home)
    const tools = JSON.parse(localStorage.getItem('kdeb_pro_tools')) || defaultFeaturedTools;
    const toolsContainer = document.getElementById('homeFeaturedToolsGrid');
    if (toolsContainer) {
        toolsContainer.innerHTML = tools.map((t, idx) => `
            <div class="bg-dark-card border border-dark-border hover:border-brand-500/40 rounded-2xl p-6 glow transition flex flex-col justify-between">
                <div>
                    <div class="bg-dark-bg border border-dark-border rounded-xl p-4 mb-5 flex items-center justify-center min-h-[180px]">
                        <i class="fa-solid fa-cube text-5xl text-brand-400 mb-2"></i>
                    </div>
                    <h3 class="text-xl font-bold text-white mb-2">${t.name}</h3>
                    <ul class="text-xs text-gray-400 space-y-1.5 mb-6">
                        ${(Array.isArray(t.features) ? t.features : (t.features || '').split(',')).map(f => `<li><i class="fa-solid fa-check text-brand-400 mr-1.5"></i> ${f.trim()}</li>`).join('')}
                    </ul>
                </div>
                <button onclick="navigateTo('${idx === 0 ? 'automation' : 'downloader'}')" class="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-xl text-xs transition">View Detail</button>
            </div>
        `).join('');
    }

    // 3. Render Downloads
    const downloads = JSON.parse(localStorage.getItem('kdeb_pro_downloads')) || defaultDownloads;
    const dlContainer = document.getElementById('customDownloadsList');
    if (dlContainer) {
        dlContainer.innerHTML = downloads.map(d => `
            <div class="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center justify-between">
                <div>
                    <h4 class="text-sm font-semibold text-white">${d.name}</h4>
                    <span class="text-[10px] bg-brand-500/10 text-brand-300 px-1.5 py-0.5 rounded border border-brand-500/20">${d.category}</span>
                    <span class="text-[11px] text-gray-500 ml-1">${d.size || ''}</span>
                </div>
                <a href="${d.link}" target="_blank" download class="bg-brand-600 hover:bg-brand-500 text-white p-2.5 rounded-lg text-xs transition flex items-center gap-1">
                    <i class="fa-solid fa-download"></i> ទាញយក
                </a>
            </div>
        `).join('');
    }

    // 4. Render Tutorials
    const posts = JSON.parse(localStorage.getItem('kdeb_pro_posts')) || defaultPosts;
    const postContainer = document.getElementById('customPostsList');
    if (postContainer) {
        postContainer.innerHTML = posts.map(p => `
            <div class="bg-dark-card border border-dark-border rounded-2xl overflow-hidden flex flex-col">
                <img src="${p.image}" class="w-full h-44 object-cover" onerror="this.src='https://images.unsplash.com/photo-1518770660439-4636190af475?w=600'">
                <div class="p-5">
                    <span class="text-[10px] text-brand-400 font-bold">${p.date || ''}</span>
                    <h3 class="text-sm font-bold text-white mt-1 mb-2 line-clamp-2">${p.title}</h3>
                    <p class="text-gray-400 text-xs line-clamp-3">${p.content}</p>
                </div>
            </div>
        `).join('');
    }
}

// EVENT LISTENERS
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || 'home';
    navigateTo(view, false);
    renderPublicData();
});

window.addEventListener('storage', renderPublicData);

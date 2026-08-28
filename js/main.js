// =========================================================
//                   FILE: js/main.js
//       (ប្រព័ន្ធ Router ប្តូរទំព័រ Clean URL & Render ទិន្នន័យ)
// =========================================================

// ROUTER: ប្តូរទំព័រ (Clean URL គ្មានសញ្ញា # និងប្រើ Button Style)
function navigateTo(pageId, pushToHistory = true) {
    const validPages = ['home', 'automation', 'downloads', 'tutorials', 'contact'];
    const activePage = validPages.includes(pageId) ? pageId : 'home';

    // 1. បិទ/បើក View
    document.querySelectorAll('.page-view').forEach(view => view.classList.add('hidden'));
    const targetView = document.getElementById('view-' + activePage) || document.getElementById('view-home');
    if (targetView) targetView.classList.remove('hidden');

    // 2. ដាក់ Style Active លើ Button
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('nav-active'));
    const activeBtn = document.getElementById('nav-' + activePage);
    if (activeBtn) activeBtn.classList.add('nav-active');

    // 3. អូសទៅលើបង្អស់
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 4. កែសម្រួល URL កុំឱ្យមានសញ្ញា #
    if (pushToHistory) {
        if (activePage === 'home') {
            history.pushState({ page: 'home' }, '', window.location.pathname);
        } else {
            history.pushState({ page: activePage }, '', '?view=' + activePage);
        }
    }
}

// គាំទ្រការចុច Back / Forward លើ Browser
window.addEventListener('popstate', (e) => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || (e.state && e.state.page) || 'home';
    const cat = params.get('cat');
    navigateTo(view, false);
    if (view === 'downloads' && cat) {
        filterDownloads(cat);
    } else {
        renderPublicData();
    }
});

// ទិន្នន័យ Default
const defaultFunctions = [
    { id: 1, title: "Account Manage", icon: "fa-solid fa-user-shield", items: ["Auto switch Profiles", "Check Live / Die UID", "Auto solve Captcha & 2FA", "Interactions Feed & Reels"] },
    { id: 2, title: "Page & Post", icon: "fa-solid fa-share-from-square", items: ["Auto post Reels & Videos", "Auto comment & interaction", "Schedule Post (Time/Date)", "Auto Story with link"] },
    { id: 3, title: "LDPlayer Control", icon: "fa-solid fa-mobile-screen", items: ["Open/Close Multi-LDPlayer", "Auto arrange LD windows", "Auto GPS & Timezone sync", "Backup & restore instances"] },
    { id: 4, title: "System & Support", icon: "fa-solid fa-gears", items: ["ដំណើរការលើ Windows 10/11", "Auto shutdown ពេលចប់ការងារ", "Support Proxy HTTP/SOCKS5", "Support ផ្ទាល់ពី Kdeb Tools"] }
];

const defaultFeaturedTools = [
    { id: 1, name: "Kdeb Tools Automation", features: ["គ្រប់គ្រង Account & Page ដោយស្វ័យប្រវត្តិ", "ដំណើរការជាមួយ LDPlayer ច្រើនផ្ទាំងយ៉ាងរលូន", "Auto Post, Reels, និង Schedule មាតិកា"], system: "Win 10/11 64-bit | RAM 8GB+", link: "#" }
];

const defaultDownloads = [
    { id: 1, name: "LDPlayer 9 Clean Optimized", category: "LDPlayer", size: "620 MB", link: "https://example.com/ld9.exe" },
    { id: 2, name: "Bob Prime Main Setup v2.6", category: "MainFile", size: "45 MB", link: "https://example.com/setup.exe" },
    { id: 3, name: "Bob Prime Patch Update v2.6.1", category: "Patch", size: "12 MB", link: "https://example.com/patch.exe" }
];

const defaultPosts = [
    { id: 1, title: "របៀបតម្លើង Kdeb Tools ជាមួយ LDPlayer 9", youtubeLink: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", youtubeId: "dQw4w9WgXcQ", icon: "fa-solid fa-download", date: "28/08/2026" }
];

// មុខងារ Dynamic Play Video YouTube (Lazy Embedding)
window.playYoutubeVideo = function(containerId, youtubeId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <iframe 
                class="absolute inset-0 w-full h-full rounded-2xl" 
                src="https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0" 
                title="YouTube video player" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowfullscreen>
            </iframe>`;
    }
};

// ប្រព័ន្ធស្វ័យប្រវត្តិបម្លែងទិន្នន័យប្រភេទចាស់ ទៅប្រភេទថ្មីដើម្បីកុំឱ្យគាំងបង្ហាញទទេ (Auto-Migration)
function migrateOldDownloads(dataArray) {
    if (!Array.isArray(dataArray)) return dataArray;
    return dataArray.map(item => {
        if (item.category === 'Driver' || item.category === 'APK') {
            item.category = 'MainFile'; 
        } else if (item.category === 'Tool') {
            item.category = 'Patch'; 
        }
        return item;
    });
}

// ប្រព័ន្ធគ្រប់គ្រងប៊ូតុងត្រងប្រភេទឯកសារទាញយក (Download Filtering Logic)
let currentDlFilter = 'all';
window.filterDownloads = function(category) {
    currentDlFilter = category;
    
    // កំណត់ស្ទីលប៊ូតុងសកម្មភាព (Active/Inactive CSS)
    const categories = ['all', 'LDPlayer', 'MainFile', 'Patch'];
    categories.forEach(cat => {
        const btn = document.getElementById(`btn-dl-${cat}`);
        if (btn) {
            if (cat === category) {
                btn.className = "px-4 py-1.5 rounded-full bg-brand-600 text-white border border-brand-500 transition";
            } else {
                btn.className = "px-4 py-1.5 rounded-full bg-dark-card text-gray-400 hover:text-white border border-dark-border transition";
            }
        }
    });
    
    renderPublicData();
};

// RENDER DATA
function renderPublicData() {
    // 1. Render Functions
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
        toolsContainer.innerHTML = tools.map((t) => `
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
                <button onclick="navigateTo('automation')" class="btn-hover-zoom w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-xl text-xs">View Detail</button>
            </div>
        `).join('');
    }

    // 3. Render Downloads (គាំទ្រការត្រង Filter តាមប្រភេទ និងការប្រើប្រាស់ Icon)
    const rawDownloads = JSON.parse(localStorage.getItem('kdeb_pro_downloads')) || defaultDownloads;
    const downloads = migrateOldDownloads(rawDownloads); // ដំណើរការ Migration នៅពេល render
    
    const dlContainer = document.getElementById('customDownloadsList');
    if (dlContainer) {
        const filtered = currentDlFilter === 'all' 
            ? downloads 
            : downloads.filter(d => d.category === currentDlFilter);

        dlContainer.innerHTML = filtered.map(d => {
            let catLabel = d.category;
            let icon = 'fa-solid fa-file-arrow-down';
            
            if (d.category === 'LDPlayer') {
                catLabel = 'LDPlayer / Emulator';
                icon = 'fa-solid fa-mobile-screen-button';
            } else if (d.category === 'MainFile') {
                catLabel = 'Main Files';
                icon = 'fa-solid fa-file-arrow-down';
            } else if (d.category === 'Patch') {
                catLabel = 'Patch Update';
                icon = 'fa-solid fa-wand-magic-sparkles';
            }

            return `
                <div class="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center justify-between hover:border-brand-500/30 transition">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                            <i class="${icon} text-lg"></i>
                        </div>
                        <div>
                            <h4 class="text-sm font-semibold text-white">${d.name}</h4>
                            <span class="text-[10px] bg-brand-500/10 text-brand-300 px-1.5 py-0.5 rounded border border-brand-500/20">${catLabel}</span>
                            <span class="text-[11px] text-gray-500 ml-1">${d.size || ''}</span>
                        </div>
                    </div>
                    <a href="${d.link}" target="_blank" download class="btn-hover-zoom bg-brand-600 hover:bg-brand-500 text-white p-2.5 rounded-lg text-xs flex items-center gap-1">
                        <i class="fa-solid fa-download"></i> ទាញយក
                    </a>
                </div>
            `;
        }).join('') || '<p class="text-gray-500 text-center text-xs col-span-2 py-8">គ្មានឯកសារនៅក្នុងប្រភេទនេះទេ</p>';
    }

    // 4. Render Tutorials (ទម្រង់ Interactive Youtube Card ដូចក្នុងវីដេអូ)
    const posts = JSON.parse(localStorage.getItem('kdeb_pro_posts')) || defaultPosts;
    const postContainer = document.getElementById('customPostsList');
    if (postContainer) {
        postContainer.innerHTML = posts.map(p => {
            const containerId = `yt-player-${p.id}`;
            const thumbnail = `https://img.youtube.com/vi/${p.youtubeId}/hqdefault.jpg`;
            
            let categoryName = "Tutorial";
            if (p.icon === "fa-solid fa-download") categoryName = "Installation";
            else if (p.icon === "fa-solid fa-key") categoryName = "License";
            else if (p.icon === "fa-solid fa-graduation-cap") categoryName = "Usage Guide";
            else if (p.icon === "fa-solid fa-gears") categoryName = "Settings";

            return `
                <div class="bg-dark-card border border-dark-border rounded-2xl overflow-hidden flex flex-col hover:border-brand-500/40 transition">
                    <div class="p-5 pb-3">
                        <div class="flex items-center gap-1.5 text-[10px] text-brand-400 font-bold tracking-wider uppercase">
                            <i class="${p.icon || 'fa-solid fa-graduation-cap'}"></i>
                            <span>${categoryName}</span>
                            <span class="text-gray-600">•</span>
                            <span class="text-gray-500 font-normal">${p.date || ''}</span>
                        </div>
                        <h3 class="text-sm sm:text-base font-bold text-white mt-1.5 mb-2 line-clamp-2">${p.title}</h3>
                    </div>
                    
                    <!-- Embedded Video Area -->
                    <div class="px-5 pb-5">
                        <div id="${containerId}" class="relative aspect-video w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center group cursor-pointer" onclick="playYoutubeVideo('${containerId}', '${p.youtubeId}')">
                            <img src="${thumbnail}" class="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition" alt="${p.title}">
                            <!-- Youtube Play Icon Overlay -->
                            <div class="z-10 w-14 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:bg-red-500 transition-all duration-200">
                                <i class="fa-solid fa-play text-lg ml-0.5"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Watch on YouTube Button -->
                    <div class="p-4 flex justify-between items-center bg-dark-subcard/30 border-t border-dark-border/40 mt-auto">
                        <span class="text-[11px] text-gray-500 font-mono">ID: ${p.youtubeId}</span>
                        <a href="https://www.youtube.com/watch?v=${p.youtubeId}" target="_blank" class="btn-hover-zoom bg-brand-600/10 hover:bg-brand-600 border border-brand-500/20 hover:border-brand-500 text-brand-300 hover:text-white px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 font-semibold transition">
                            <i class="fa-brands fa-youtube text-red-500"></i> Watch on YouTube
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// ដំណើរការដំបូង
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || 'home';
    const cat = params.get('cat');
    
    navigateTo(view, false);
    
    if (view === 'downloads' && cat) {
        filterDownloads(cat);
    } else {
        renderPublicData();
    }
});

window.addEventListener('storage', renderPublicData);
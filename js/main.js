// =========================================================
//                   FILE: js/main.js
//       (ប្រព័ន្ធ Router ប្តូរទំព័រ Clean URL & Dynamic Title)
// =========================================================

const BIN_ID = "6a917cb3da38895dfe1c169c";
const API_KEY = "$2a$10$3jKyJxhLrAn/3gCKlwjvSOtBFGKwfnUDm6/J9E1BeuJVel/z2hTDy";

// កំណត់ Browser Tab Title សម្រាប់ទំព័រនីមួយៗ
const pageTitles = {
    home: "Kdeb Tools - Automation & Software Platform",
    automation: "Kdeb Tools - Kdeb Automation",
    downloads: "Kdeb Tools - Downloads Center",
    tutorials: "Kdeb Tools - Tutorials & News",
    contact: "Kdeb Tools - Contact Support"
};

// មុខងារទាញយក Path ស្អាត (លុប index.html ចេញពី URL)
function getCleanBasePath() {
    let path = window.location.pathname;
    if (path.endsWith('/index.html')) {
        path = path.substring(0, path.length - 11);
    }
    return path === '' ? '/' : path;
}

// ROUTER: ប្តូរទំព័រ (Clean URL គ្មាន index.html និងប្តូរ Title លើ Tab ភ្លាមៗ)
function navigateTo(pageId, pushToHistory = true) {
    const validPages = ['home', 'automation', 'downloads', 'tutorials', 'contact'];
    const activePage = validPages.includes(pageId) ? pageId : 'home';

    const syncStyle = document.getElementById('sync-route-style');
    if (syncStyle) syncStyle.remove();

    // 1. ប្តូរ View
    document.querySelectorAll('.page-view').forEach(view => {
        view.classList.remove('active');
    });
    const targetView = document.getElementById('view-' + activePage) || document.getElementById('view-home');
    if (targetView) targetView.classList.add('active');

    // 2. ដាក់ Style Active លើ Nav Button
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('nav-active'));
    const activeBtn = document.getElementById('nav-' + activePage);
    if (activeBtn) activeBtn.classList.add('nav-active');

    // 3. ប្តូរឈ្មោះ Title លើ Browser Tab
    document.title = pageTitles[activePage] || pageTitles.home;

    // 4. Scroll ទៅលើ
    if (pushToHistory) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 5. កែសម្រួល URL កុំឱ្យមានជាប់ពាក្យ index.html
    if (pushToHistory) {
        const basePath = getCleanBasePath();
        const prefix = basePath === '/' ? '' : basePath;
        if (activePage === 'home') {
            history.pushState({ page: 'home' }, '', basePath);
        } else {
            history.pushState({ page: activePage }, '', prefix + '?view=' + activePage);
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
        filterDownloads(cat, false);
    } else {
        renderPublicData();
    }
});

// Global Data State
let globalDownloadsData = [];
let currentDlFilter = 'MainFile';

// Dynamic Play Video YouTube
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

// បម្លែងប្រភេទចាស់
function migrateOldDownloads(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(item => {
        if (item.category === 'Driver') {
            item.category = 'MainFile'; 
        } else if (item.category === 'Tool') {
            item.category = 'Patch'; 
        }
        return item;
    });
}

// ប្រព័ន្ធគ្រប់គ្រងប៊ូតុងត្រងប្រភេទឯកសារ
window.filterDownloads = function(category, pushToHistory = true) {
    currentDlFilter = category;
    
    const categories = ['MainFile', 'Patch', 'APK', 'LDPlayer'];
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

    if (pushToHistory) {
        const basePath = getCleanBasePath();
        const prefix = basePath === '/' ? '' : basePath;
        history.pushState({ page: 'downloads', cat: category }, '', prefix + `?view=downloads&cat=${category}`);
    }
    
    renderDownloadsGrid();
};

// បើក Downloads តាម Category ពី Navbar
window.openDownloadsCat = function(category, event) {
    if (event) event.preventDefault();
    navigateTo('downloads', false);
    filterDownloads(category, true);
};

// Render Downloads Grid
function renderDownloadsGrid() {
    const dlContainer = document.getElementById('customDownloadsList');
    if (!dlContainer) return;

    const filtered = globalDownloadsData.filter(d => d.category === currentDlFilter);

    if (filtered.length === 0) {
        dlContainer.innerHTML = `
            <div class="text-gray-500 text-center text-xs col-span-1 md:col-span-2 py-12 flex flex-col items-center justify-center gap-2">
                <i class="fa-regular fa-folder-open text-2xl text-gray-600"></i>
                <span>គ្មានឯកសារនៅក្នុងប្រភេទនេះនៅឡើយទេ</span>
            </div>
        `;
        return;
    }

    dlContainer.innerHTML = filtered.map(d => {
        let catLabel = d.category;
        let icon = 'fa-solid fa-file-arrow-down';
        
        if (d.category === 'LDPlayer') {
            catLabel = 'Download LDPlayer';
            icon = 'fa-solid fa-mobile-screen-button text-brand-400';
        } else if (d.category === 'MainFile') {
            catLabel = 'Main Files';
            icon = 'fa-solid fa-file-arrow-down text-emerald-400';
        } else if (d.category === 'Patch') {
            catLabel = 'Patch Update';
            icon = 'fa-solid fa-wand-magic-sparkles text-cyan-400';
        } else if (d.category === 'APK') {
            catLabel = 'App APK';
            icon = 'fa-brands fa-android text-purple-400';
        }

        return `
            <div class="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center justify-between hover:border-brand-500/30 transition">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                        <i class="${icon} text-lg"></i>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-white">${d.name}</h4>
                        <span class="text-[10px] bg-brand-500/10 text-brand-300 px-1.5 py-0.5 rounded border border-brand-500/20">${catLabel}</span>
                        <span class="text-[11px] text-gray-500 ml-1">${d.size || ''}</span>
                    </div>
                </div>
                <a href="${d.link}" target="_blank" download class="btn-hover-zoom bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 rounded-lg text-xs flex items-center gap-1.5 font-semibold">
                    <i class="fa-solid fa-download"></i> ទាញយក
                </a>
            </div>
        `;
    }).join('');
}

// RENDER ALL DATA ពី JSONBin
async function renderPublicData() {
    let functionsList = [];
    let tools = [];
    let posts = [];

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            method: 'GET',
            headers: { 'X-Master-Key': API_KEY }
        });
        
        if (response.ok) {
            const result = await response.json();
            const record = result.record || {};
            
            functionsList = Array.isArray(record.functions) ? record.functions : [];
            tools = Array.isArray(record.tools) ? record.tools : [];
            globalDownloadsData = Array.isArray(record.downloads) ? migrateOldDownloads(record.downloads) : [];
            posts = Array.isArray(record.posts) ? record.posts : [];
        }
    } catch (err) {
        console.error("Fetch Data Error:", err);
    }

    renderDownloadsGrid();

    // Functions
    const fnContainer = document.getElementById('importantFunctionsGrid');
    if (fnContainer) {
        if (functionsList.length === 0) {
            fnContainer.innerHTML = '<div class="text-gray-500 text-center text-xs col-span-1 md:col-span-4 py-8">មិនទាន់មានទិន្នន័យ Functions នៅឡើយទេ</div>';
        } else {
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
    }

    // Featured Tools
    const toolsContainer = document.getElementById('homeFeaturedToolsGrid');
    if (toolsContainer) {
        if (tools.length === 0) {
            toolsContainer.innerHTML = '<div class="text-gray-500 text-center text-xs col-span-1 md:col-span-2 py-8">មិនទាន់មានកម្មវិធីនៅឡើយទេ</div>';
        } else {
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
    }

    // Tutorials
    const postContainer = document.getElementById('customPostsList');
    if (postContainer) {
        if (posts.length === 0) {
            postContainer.innerHTML = '<div class="text-gray-500 text-center text-xs col-span-1 md:col-span-3 py-8">មិនទាន់មានវីដេអូ Tutorials នៅឡើយទេ</div>';
        } else {
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
                        
                        <div class="px-5 pb-5">
                            <div id="${containerId}" class="relative aspect-video w-full bg-black rounded-2xl overflow-hidden flex items-center justify-center group cursor-pointer" onclick="playYoutubeVideo('${containerId}', '${p.youtubeId}')">
                                <img src="${thumbnail}" class="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition" alt="${p.title}">
                                <div class="z-10 w-14 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:bg-red-500 transition-all duration-200">
                                    <i class="fa-solid fa-play text-lg ml-0.5"></i>
                                </div>
                            </div>
                        </div>
                        
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
}

// ដំណើរការ routing ពេលបើកទំព័រ
function initApp() {
    // លុប /index.html ចេញពី URL bar ភ្លាមៗ
    if (window.location.pathname.endsWith('/index.html')) {
        const cleanPath = window.location.pathname.replace(/\/index\.html$/, '') || '/';
        const newUrl = cleanPath + window.location.search;
        history.replaceState(null, '', newUrl);
    }

    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || 'home';
    const cat = params.get('cat');
    
    navigateTo(view, false);
    
    if (view === 'downloads') {
        filterDownloads(cat || 'MainFile', false);
    } else {
        currentDlFilter = cat || 'MainFile';
    }
    
    renderPublicData();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
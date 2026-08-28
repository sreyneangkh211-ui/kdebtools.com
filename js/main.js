// =========================================================
//                   FILE: js/main.js
//       (ប្រព័ន្ធ Router, SEO Title & Direct Download Support)
// =========================================================

const BIN_ID = "6a917cb3da38895dfe1c169c";
const API_KEY = "$2a$10$3jKyJxhLrAn/3gCKlwjvSOtBFGKwfnUDm6/J9E1BeuJVel/z2hTDy";

const pageTitles = {
    home: "Kdeb Tools - Home Feed",
    automation: "Kdeb Tools - Kdeb Automation",
    downloads: "Kdeb Tools - Downloads Center",
    tutorials: "Kdeb Tools - Tutorials & News",
    contact: "Kdeb Tools - Contact Support"
};

function getCleanBasePath() {
    let path = window.location.pathname;
    if (path.endsWith('/index.html')) {
        path = path.substring(0, path.length - 11);
    }
    return path === '' ? '/' : path;
}

function navigateTo(pageId, pushToHistory = true) {
    const validPages = ['home', 'automation', 'downloads', 'tutorials', 'contact'];
    const activePage = validPages.includes(pageId) ? pageId : 'home';

    const syncStyle = document.getElementById('sync-route-style');
    if (syncStyle) syncStyle.remove();

    document.querySelectorAll('.page-view').forEach(view => {
        view.classList.remove('active');
    });
    const targetView = document.getElementById('view-' + activePage) || document.getElementById('view-home');
    if (targetView) targetView.classList.add('active');

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('nav-active'));
    const activeBtn = document.getElementById('nav-' + activePage);
    if (activeBtn) activeBtn.classList.add('nav-active');

    document.title = pageTitles[activePage] || pageTitles.home;

    if (pushToHistory) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

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

window.addEventListener('popstate', (e) => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view') || (e.state && e.state.page) || 'home';
    const cat = params.get('cat');
    navigateTo(view, false);
    if (view === 'downloads') {
        filterDownloads(cat || 'MainFile', false);
    } else {
        renderPublicData();
    }
});

let globalDownloadsData = [];
let currentDlFilter = 'MainFile';

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

window.filterDownloads = function(category, pushToHistory = true) {
    currentDlFilter = category || 'MainFile';
    
    const categories = ['MainFile', 'Patch', 'APK', 'LDPlayer'];
    categories.forEach(cat => {
        const btn = document.getElementById(`btn-dl-${cat}`);
        if (btn) {
            if (cat === currentDlFilter) {
                btn.className = "px-4 py-1.5 rounded-full bg-brand-600 text-white border border-brand-500 transition";
            } else {
                btn.className = "px-4 py-1.5 rounded-full bg-dark-card text-gray-400 hover:text-white border border-dark-border transition";
            }
        }
    });

    if (pushToHistory) {
        const basePath = getCleanBasePath();
        const prefix = basePath === '/' ? '' : basePath;
        history.pushState({ page: 'downloads', cat: currentDlFilter }, '', prefix + `?view=downloads&cat=${currentDlFilter}`);
    }
    
    renderDownloadsGrid();
};

window.openDownloadsCat = function(category, event) {
    if (event) event.preventDefault();
    navigateTo('downloads', false);
    filterDownloads(category, true);
};

// Render Downloads Grid ជាមួយ Release Notes និង Auto Date
function renderDownloadsGrid() {
    const dlContainer = document.getElementById('customDownloadsList');
    if (!dlContainer) return;

    const filtered = globalDownloadsData.filter(d => d.category === currentDlFilter);

    let ldHeaderHtml = '';
    if (currentDlFilter === 'LDPlayer') {
        ldHeaderHtml = `
            <div class="col-span-1 md:col-span-2 bg-dark-card border border-dark-border rounded-2xl p-5 mb-2">
                <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h3 class="text-base font-bold text-white flex items-center gap-2">
                            <i class="fa-solid fa-mobile-screen-button text-brand-400"></i> LDPlayer MNQ (Chinese Version)
                        </h3>
                        <p class="text-xs text-gray-400 mt-1">កម្មវិធី Android Emulator ជំនាន់ចិន កម្រិតស្រាល រលូន និងស៊ី RAM តិចបំផុត។</p>
                    </div>
                    <a href="https://www.ldmnq.com/other/version-history-and-release-notes.html" target="_blank" class="btn-hover-zoom inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs bg-brand-500/10 text-brand-300 border border-brand-500/20 hover:bg-brand-600 hover:text-white transition whitespace-nowrap">
                        <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i> គេហទំព័រដើម: ldmnq.com
                    </a>
                </div>
            </div>
        `;
    }

    if (filtered.length === 0) {
        dlContainer.innerHTML = ldHeaderHtml + `
            <div class="text-gray-500 text-center text-xs col-span-1 md:col-span-2 py-12 flex flex-col items-center justify-center gap-2">
                <i class="fa-regular fa-folder-open text-2xl text-gray-600"></i>
                <span>គ្មានឯកសារនៅក្នុងប្រភេទនេះនៅឡើយទេ</span>
            </div>
        `;
        return;
    }

    const cardsHtml = filtered.map(d => {
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

        const hasNotes = Array.isArray(d.notes) && d.notes.length > 0;
        const notesListHtml = hasNotes ? `
            <div class="mt-3 pt-3 border-t border-dark-border/60">
                <ul class="space-y-1 text-xs text-gray-300">
                    ${d.notes.map(note => `<li class="flex items-start gap-1.5"><span class="text-gray-400">▪</span> <span>${note}</span></li>`).join('')}
                </ul>
            </div>
        ` : '';

        const dateTag = d.date ? `<span class="text-[11px] font-medium text-gray-400 ml-1.5">${d.date}</span>` : '';

        return `
            <div class="bg-dark-card border border-dark-border rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-brand-500/40 transition">
                <div>
                    <div class="flex items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                                <i class="${icon} text-lg"></i>
                            </div>
                            <div>
                                <h4 class="text-sm font-bold text-white flex items-center flex-wrap gap-1">
                                    <span>${d.name}</span>
                                    ${dateTag}
                                </h4>
                                <div class="flex items-center gap-2 mt-0.5">
                                    <span class="text-[10px] bg-brand-500/10 text-brand-300 px-1.5 py-0.5 rounded border border-brand-500/20">${catLabel}</span>
                                    <span class="text-[11px] text-gray-500">${d.size || ''}</span>
                                </div>
                            </div>
                        </div>
                        <a href="${d.link}" target="_blank" download class="btn-hover-zoom bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 font-bold shadow-md shadow-brand-600/20 whitespace-nowrap flex-shrink-0">
                            <i class="fa-solid fa-download"></i> ទាញយក
                        </a>
                    </div>
                    ${notesListHtml}
                </div>
            </div>
        `;
    }).join('');

    dlContainer.innerHTML = ldHeaderHtml + cardsHtml;
}

// RENDER ALL DATA
async function renderPublicData() {
    let functionsList = [];
    let tools = [];
    let posts = [];

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest?nocache=${Date.now()}`, {
            method: 'GET',
            headers: { 
                'X-Master-Key': API_KEY,
                'Cache-Control': 'no-cache'
            }
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

    // 1. Functions
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

    // 2. Featured Tools
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

    // 3. Tutorials
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

function initApp() {
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
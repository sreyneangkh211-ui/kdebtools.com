// =========================================================
//                   FILE: js/main.js
//       (ប្រព័ន្ធ Router, Sub-Category Filter & SEO Title)
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
let currentSubFilter = 'all';

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

// Fixed Migration: មិនកាត់ APK ទៅ MainFile ទៀតឡើយ
function migrateOldDownloads(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(item => {
        if (item.category === 'Driver') item.category = 'MainFile'; 
        else if (item.category === 'Tool') item.category = 'Patch'; 
        if (!item.subCategory) item.subCategory = '';
        return item;
    });
}

function getFunctionBoxTheme(icon, index) {
    const palette = [
        { text: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20', bullet: 'text-cyan-400' },
        { text: 'text-yellow-400', badge: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20', bullet: 'text-yellow-400' },
        { text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', bullet: 'text-emerald-400' },
        { text: 'text-purple-400', badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20', bullet: 'text-purple-400' },
        { text: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20', bullet: 'text-rose-400' },
        { text: 'text-orange-400', badge: 'bg-orange-500/10 text-orange-300 border-orange-500/20', bullet: 'text-orange-400' }
    ];

    if (icon) {
        if (icon.includes('mobile') || icon.includes('phone')) return palette[0];
        if (icon.includes('shield') || icon.includes('user')) return palette[1];
        if (icon.includes('share') || icon.includes('paper-plane')) return palette[2];
        if (icon.includes('robot') || icon.includes('wand')) return palette[3];
        if (icon.includes('video') || icon.includes('play')) return palette[4];
        if (icon.includes('gear') || icon.includes('wrench')) return palette[5];
    }
    return palette[index % palette.length];
}

function getContactTheme(icon) {
    if (icon.includes('telegram')) return { iconColor: 'text-[#229ED9]', iconBg: 'bg-[#229ED9]/10 border-[#229ED9]/20', btnBg: 'bg-[#229ED9] hover:bg-[#1f8ec4] text-white' };
    if (icon.includes('youtube')) return { iconColor: 'text-[#FF0000]', iconBg: 'bg-red-500/10 border-red-500/20', btnBg: 'bg-red-600 hover:bg-red-500 text-white' };
    if (icon.includes('facebook')) return { iconColor: 'text-[#1877F2]', iconBg: 'bg-blue-600/10 border-blue-600/20', btnBg: 'bg-[#1877F2] hover:bg-blue-600 text-white' };
    if (icon.includes('tiktok')) return { iconColor: 'text-pink-400', iconBg: 'bg-pink-500/10 border-pink-500/20', btnBg: 'bg-gradient-to-r from-pink-600 to-cyan-600 text-white' };
    if (icon.includes('phone')) return { iconColor: 'text-emerald-400', iconBg: 'bg-emerald-500/10 border-emerald-500/20', btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white' };
    if (icon.includes('envelope')) return { iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10 border-amber-500/20', btnBg: 'bg-amber-600 hover:bg-amber-500 text-white' };
    return { iconColor: 'text-brand-400', iconBg: 'bg-brand-500/10 border-brand-500/20', btnBg: 'bg-brand-600 hover:bg-brand-500 text-white' };
}

// ----------------- Filter System -----------------

window.filterDownloads = function(category, pushToHistory = true) {
    currentDlFilter = category || 'MainFile';
    currentSubFilter = 'all';
    
    const categories = [
        { id: 'MainFile', icon: 'fa-solid fa-file-arrow-down text-emerald-400', label: 'Main Files' },
        { id: 'Patch', icon: 'fa-solid fa-wand-magic-sparkles text-cyan-400', label: 'Patch Update' },
        { id: 'APK', icon: 'fa-brands fa-android text-purple-400', label: 'App APK' },
        { id: 'LDPlayer', icon: 'fa-solid fa-mobile-screen-button text-brand-400', label: 'Download LDPlayer' }
    ];

    categories.forEach(item => {
        const btn = document.getElementById(`btn-dl-${item.id}`);
        if (btn) {
            if (item.id === currentDlFilter) {
                btn.className = "px-4 py-2 rounded-xl bg-brand-600 text-white border border-brand-500 shadow-md shadow-brand-600/20 font-bold transition flex items-center gap-1.5";
            } else {
                btn.className = "px-4 py-2 rounded-xl bg-dark-card text-gray-400 hover:text-white border border-dark-border transition flex items-center gap-1.5";
            }
        }
    });

    if (pushToHistory) {
        const basePath = getCleanBasePath();
        const prefix = basePath === '/' ? '' : basePath;
        history.pushState({ page: 'downloads', cat: currentDlFilter }, '', prefix + `?view=downloads&cat=${currentDlFilter}`);
    }
    
    renderSubFilterButtons();
    renderDownloadsGrid();
};

window.filterSubCategory = function(subCat) {
    currentSubFilter = subCat;
    renderSubFilterButtons();
    renderDownloadsGrid();
};

window.openDownloadsCat = function(category, event) {
    if (event) event.preventDefault();
    navigateTo('downloads', false);
    filterDownloads(category, true);
};

function renderSubFilterButtons() {
    const subContainer = document.getElementById('downloadSubFilters');
    if (!subContainer) return;

    const activeItems = globalDownloadsData.filter(d => d.category === currentDlFilter);
    const subList = Array.from(new Set(activeItems.map(d => (d.subCategory || '').trim()).filter(Boolean)));

    if (subList.length === 0) {
        subContainer.classList.add('hidden');
        subContainer.innerHTML = '';
        return;
    }

    subContainer.classList.remove('hidden');

    const allActive = currentSubFilter === 'all' 
        ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-600/30' 
        : 'bg-dark-card/80 text-gray-400 hover:text-white border-dark-border';

    let html = `
        <button onclick="filterSubCategory('all')" class="px-3 py-1.5 rounded-lg border text-xs transition flex items-center gap-1 ${allActive}">
            <i class="fa-solid fa-cubes text-[11px]"></i> ទាំងអស់ (${activeItems.length})
        </button>
    `;

    subList.forEach(sub => {
        const count = activeItems.filter(d => (d.subCategory || '').trim() === sub).length;
        const isActive = currentSubFilter === sub;
        const btnClass = isActive 
            ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-600/30 font-semibold' 
            : 'bg-dark-card/80 text-gray-400 hover:text-white border-dark-border hover:border-purple-500/40';

        html += `
            <button onclick="filterSubCategory('${sub}')" class="px-3 py-1.5 rounded-lg border text-xs transition flex items-center gap-1.5 ${btnClass}">
                <i class="fa-solid fa-tag text-[10px] ${isActive ? 'text-white' : 'text-purple-400'}"></i>
                <span>${sub}</span>
                <span class="text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-dark-bg text-gray-400'}">${count}</span>
            </button>
        `;
    });

    subContainer.innerHTML = html;
}

function renderDownloadsGrid() {
    const dlContainer = document.getElementById('customDownloadsList');
    if (!dlContainer) return;

    let filtered = globalDownloadsData.filter(d => d.category === currentDlFilter);

    if (currentSubFilter !== 'all') {
        filtered = filtered.filter(d => (d.subCategory || '').trim() === currentSubFilter);
    }

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
                <span>គ្មានឯកសារនៅក្នុងជម្រើសនេះនៅឡើយទេ</span>
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
        const subCategoryBadge = d.subCategory ? `<span class="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-medium">🏷️ ${d.subCategory}</span>` : '';

        return `
            <div class="bg-dark-card border border-dark-border rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-brand-500/40 transition shadow-lg">
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
                                <div class="flex items-center gap-2 mt-1 flex-wrap">
                                    <span class="text-[10px] bg-brand-500/10 text-brand-300 px-1.5 py-0.5 rounded border border-brand-500/20">${catLabel}</span>
                                    ${subCategoryBadge}
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

// ----------------- Load & Render All Data -----------------

async function renderPublicData() {
    let functionsList = [];
    let contactsList = [];
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
            contactsList = Array.isArray(record.contacts) ? record.contacts : [];
            globalDownloadsData = Array.isArray(record.downloads) ? migrateOldDownloads(record.downloads) : [];
            posts = Array.isArray(record.posts) ? record.posts : [];
        }
    } catch (err) {
        console.error("Fetch Data Error:", err);
    }

    renderSubFilterButtons();
    renderDownloadsGrid();

    // 1. IMPORTANT FUNCTIONS
    const fnContainer = document.getElementById('importantFunctionsGrid');
    if (fnContainer) {
        if (functionsList.length === 0) {
            fnContainer.innerHTML = '<div class="text-gray-500 text-center text-xs col-span-full py-8">មិនទាន់មានទិន្នន័យ Functions នៅឡើយទេ</div>';
        } else {
            fnContainer.innerHTML = functionsList.map((fn, idx) => {
                const items = fn.items || [];
                const theme = getFunctionBoxTheme(fn.icon, idx);

                return `
                    <div class="bg-dark-bg p-5 rounded-2xl border border-dark-border hover:border-brand-500/40 transition-all duration-200 shadow-xl flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between border-b border-dark-border/60 pb-3.5 mb-3.5 gap-2">
                                <h4 class="text-sm sm:text-base font-bold ${theme.text} flex items-center gap-2 truncate">
                                    <i class="${fn.icon || 'fa-solid fa-cube'} flex-shrink-0"></i>
                                    <span class="truncate">${fn.title}</span>
                                </h4>
                                <span class="text-[10px] px-2.5 py-0.5 rounded-lg border whitespace-nowrap flex-shrink-0 font-semibold ${theme.badge}">
                                    ${items.length} មុខងារ
                                </span>
                            </div>
                            <ul class="space-y-1.5 text-gray-300">
                                ${items.map(item => `
                                    <li class="flex items-start gap-2 text-xs leading-relaxed group">
                                        <span class="${theme.bullet} font-bold mt-0.5 flex-shrink-0">•</span>
                                        <span class="text-gray-300 group-hover:text-white transition">${item}</span>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // 2. CONTACT SUPPORT
    const contactContainer = document.getElementById('customContactsList');
    if (contactContainer) {
        if (contactsList.length === 0) {
            contactContainer.innerHTML = '<div class="text-gray-500 text-center text-xs col-span-full py-8">មិនទាន់មានព័ត៌មាន Contact Support នៅឡើយទេ</div>';
        } else {
            contactContainer.innerHTML = contactsList.map(c => {
                const theme = getContactTheme(c.icon || '');
                return `
                    <div class="bg-dark-card border border-dark-border hover:border-brand-500/40 p-6 rounded-2xl flex flex-col items-center justify-between transition shadow-xl">
                        <div class="w-14 h-14 rounded-2xl ${theme.iconBg} border flex items-center justify-center mb-4">
                            <i class="${c.icon || 'fa-solid fa-headset'} text-3xl ${theme.iconColor}"></i>
                        </div>
                        <h4 class="font-bold text-white text-base">${c.title}</h4>
                        <p class="text-xs text-gray-400 mt-1 mb-6 text-center">${c.desc || ''}</p>
                        <a href="${c.link}" target="_blank" class="btn-hover-zoom w-full ${theme.btnBg} font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg">
                            <i class="${c.icon || 'fa-solid fa-arrow-up-right-from-square'} text-xs"></i> ${c.btnText || 'ទំនាក់ទំនង'}
                        </a>
                    </div>
                `;
            }).join('');
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
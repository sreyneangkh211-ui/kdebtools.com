// =========================================================
//                   FILE: uid-check.js
//       (ប្រព័ន្ធដំណើរការឆែកស្ថានភាព Facebook UID Live/Die)
// =========================================================

let isCheckingUid = false;
let stopUidCheck = false;
let liveUidList = [];
let dieUidList = [];

// បើក / បិទ Modal
function openUidModal() {
    document.getElementById('modal-uid').classList.remove('hidden');
}

function closeUidModal() {
    document.getElementById('modal-uid').classList.add('hidden');
    stopUidChecking();
}

// មុខងារត្រួតពិនិត្យ UID ដោយប្រើ Avatar Graph Probe
function checkSingleFacebookUID(uid) {
    return new Promise((resolve) => {
        const cleanUid = uid.trim().replace(/[^0-9]/g, '');
        if (!cleanUid) {
            return resolve({ uid, status: 'INVALID', avatar: '' });
        }

        const img = new Image();
        const timeout = setTimeout(() => {
            img.src = '';
            resolve({ uid: cleanUid, status: 'DIE', avatar: '' });
        }, 6000);

        img.onload = function () {
            clearTimeout(timeout);
            // ប្រសិនបើរូបភាពទំហំធំជាង 1x1 (មិនមែន blank pixel) គឺ LIVE
            if (img.naturalWidth > 1 && img.naturalHeight > 1) {
                resolve({ 
                    uid: cleanUid, 
                    status: 'LIVE', 
                    avatar: `https://graph.facebook.com/${cleanUid}/picture?type=square` 
                });
            } else {
                resolve({ uid: cleanUid, status: 'DIE', avatar: '' });
            }
        };

        img.onerror = function () {
            clearTimeout(timeout);
            resolve({ uid: cleanUid, status: 'DIE', avatar: '' });
        };

        // Graph avatar endpoint
        img.src = `https://graph.facebook.com/${cleanUid}/picture?type=square&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    });
}

// ដំណើរការឆែក UID ទាំងអស់ (Batch Check)
async function startBatchUidCheck() {
    const rawText = document.getElementById('uidBatchInput').value.trim();
    if (!rawText) {
        alert('សូមបញ្ចូលបញ្ជី UID ជាមុនសិន!');
        return;
    }

    const uids = rawText.split('\n').map(u => u.trim()).filter(u => u.length > 0);
    if (uids.length === 0) return;

    // Reset States
    isCheckingUid = true;
    stopUidCheck = false;
    liveUidList = [];
    dieUidList = [];

    document.getElementById('btnStartUidCheck').classList.add('hidden');
    document.getElementById('btnStopUidCheck').classList.remove('hidden');
    document.getElementById('uidResultContainer').classList.remove('hidden');
    
    const tbody = document.getElementById('uidTableBody');
    tbody.innerHTML = '';

    let total = uids.length;
    let liveCount = 0;
    let dieCount = 0;

    document.getElementById('uidStatTotal').innerText = total;
    document.getElementById('uidStatLive').innerText = '0';
    document.getElementById('uidStatDie').innerText = '0';

    for (let i = 0; i < uids.length; i++) {
        if (stopUidCheck) break;

        const currentUid = uids[i];
        const res = await checkSingleFacebookUID(currentUid);

        if (res.status === 'LIVE') {
            liveCount++;
            liveUidList.push(res.uid);
            document.getElementById('uidStatLive').innerText = liveCount;
        } else {
            dieCount++;
            dieUidList.push(res.uid);
            document.getElementById('uidStatDie').innerText = dieCount;
        }

        // Render ចូល Table
        const tr = document.createElement('tr');
        tr.className = "border-b border-dark-border/50 hover:bg-dark-bg/50";
        tr.innerHTML = `
            <td class="p-2.5 text-gray-500 font-mono">${i + 1}</td>
            <td class="p-2.5 flex items-center gap-2">
                <img src="${res.avatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}" class="w-6 h-6 rounded-full border border-dark-border object-cover" onerror="this.src='https://cdn-icons-png.flaticon.com/512/149/149071.png'">
                <a href="https://facebook.com/${res.uid}" target="_blank" class="font-mono text-xs text-brand-400 hover:underline">${res.uid}</a>
            </td>
            <td class="p-2.5">
                <span class="px-2 py-0.5 rounded text-[11px] font-bold ${res.status === 'LIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}">
                    ${res.status}
                </span>
            </td>
            <td class="p-2.5 text-right">
                <button onclick="navigator.clipboard.writeText('${res.uid}'); alert('បានចម្លង: ${res.uid}');" class="text-[11px] bg-dark-bg border border-dark-border hover:border-brand-500 px-2 py-1 rounded text-gray-300">
                    <i class="fa-regular fa-copy"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    }

    isCheckingUid = false;
    document.getElementById('btnStartUidCheck').classList.remove('hidden');
    document.getElementById('btnStopUidCheck').classList.add('hidden');
}

// បញ្ឈប់ការឆែក
function stopUidChecking() {
    stopUidCheck = true;
    isCheckingUid = false;
    document.getElementById('btnStartUidCheck').classList.remove('hidden');
    document.getElementById('btnStopUidCheck').classList.add('hidden');
}

// ចម្លងតែ UID ដែល LIVE ទាំងអស់
function copyAllLiveUIDs() {
    if (liveUidList.length === 0) {
        alert('មិនទាន់មាន UID ណាដែល LIVE នៅឡើយទេ!');
        return;
    }
    navigator.clipboard.writeText(liveUidList.join('\n')).then(() => {
        alert(`បានចម្លង UID LIVE ចំនួន ${liveUidList.length} ជោគជ័យ!`);
    });
}

// សម្អាតទិន្នន័យចោល
function clearUidData() {
    document.getElementById('uidBatchInput').value = '';
    document.getElementById('uidTableBody').innerHTML = '';
    document.getElementById('uidStatTotal').innerText = '0';
    document.getElementById('uidStatLive').innerText = '0';
    document.getElementById('uidStatDie').innerText = '0';
    document.getElementById('uidResultContainer').classList.add('hidden');
    liveUidList = [];
    dieUidList = [];
}
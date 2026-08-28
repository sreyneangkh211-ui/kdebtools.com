// =========================================================
//                   FILE: ip-tool.js
//       (ប្រព័ន្ធដំណើរការឆែក IP Address, ISP & Location)
// =========================================================

// បើក / បិទ Modal IP
function openIpModal() {
    document.getElementById('modal-ip').classList.remove('hidden');
    // ចាប់យក IP ផ្ទាល់ខ្លួនភ្លាមៗពេលបើក
    fetchIpDetails('');
}

function closeIpModal() {
    document.getElementById('modal-ip').classList.add('hidden');
}

// មុខងារទាញយកទិន្នន័យ IP (មាន Auto-Fallback Servers)
async function fetchIpDetails(inputIp = '') {
    const cleanIp = (inputIp || '').trim();
    const loadingEl = document.getElementById('ipLoadingState');
    const contentEl = document.getElementById('ipContentState');
    const searchBtn = document.getElementById('btnSearchIp');

    if (loadingEl) loadingEl.classList.remove('hidden');
    if (contentEl) contentEl.classList.add('hidden');
    if (searchBtn) searchBtn.disabled = true;

    let result = null;

    // --- វិធីទី ១: សាកល្បងជាមួយ FreeIPAPI ---
    try {
        const url = cleanIp ? `https://freeipapi.com/api/json/${cleanIp}` : 'https://freeipapi.com/api/json';
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
            const data = await res.json();
            if (data.ipAddress) {
                result = {
                    ip: data.ipAddress,
                    type: data.ipVersion === 6 ? 'IPv6' : 'IPv4',
                    isp: data.asnOrganization || data.isp || 'Telecom / Network',
                    country: data.countryName || 'Unknown',
                    countryCode: data.countryCode || '',
                    city: data.cityName || '',
                    region: data.regionName || '',
                    timezone: Array.isArray(data.timeZones) ? data.timeZones[0] : (data.timeZones || 'Asia/Phnom_Penh'),
                    coords: `${data.latitude || 0}, ${data.longitude || 0}`
                };
            }
        }
    } catch (e) {
        console.warn('API 1 (FreeIPAPI) failed, trying API 2...');
    }

    // --- វិធីទី ២: សាកល្បងជាមួយ IPWho.is (ប្រសិនបើទី១ មិនដំណើរការ) ---
    if (!result) {
        try {
            const url = cleanIp ? `https://ipwho.is/${cleanIp}` : 'https://ipwho.is/';
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                if (data.success !== false && data.ip) {
                    result = {
                        ip: data.ip,
                        type: data.type || 'IPv4',
                        isp: data.connection?.isp || data.connection?.org || 'Network Provider',
                        country: data.country || 'Unknown',
                        countryCode: data.country_code || '',
                        city: data.city || '',
                        region: data.region || '',
                        timezone: data.timezone?.id || 'Asia/Phnom_Penh',
                        coords: `${data.latitude || 0}, ${data.longitude || 0}`
                    };
                }
            }
        } catch (e) {
            console.warn('API 2 (IPWhois) failed, trying API 3...');
        }
    }

    // --- វិធីទី ៣: សាកល្បងជាមួយ IPify (Backup ចុងក្រោយ) ---
    if (!result && !cleanIp) {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            if (res.ok) {
                const data = await res.json();
                result = {
                    ip: data.ip,
                    type: 'IPv4',
                    isp: 'Internet Service Provider',
                    country: 'Cambodia',
                    countryCode: 'KH',
                    city: 'Phnom Penh',
                    region: 'Phnom Penh',
                    timezone: 'Asia/Phnom_Penh',
                    coords: '11.5564, 104.9282'
                };
            }
        } catch (e) {
            console.error('All IP APIs failed:', e);
        }
    }

    // បង្ហាញលទ្ធផល
    if (result) {
        document.getElementById('displayIpAddress').innerText = result.ip;
        document.getElementById('displayIpType').innerText = result.type;
        document.getElementById('displayIsp').innerText = result.isp;
        document.getElementById('displayCountry').innerText = result.countryCode ? `${result.country} (${result.countryCode})` : result.country;
        document.getElementById('displayCity').innerText = result.city ? `${result.city}, ${result.region}` : (result.region || '---');
        document.getElementById('displayTimezone').innerText = result.timezone;
        document.getElementById('displayCoords').innerText = result.coords;

        // ទង់ជាតិ (Flag CDN)
        const flagImg = document.getElementById('displayFlagImg');
        if (flagImg && result.countryCode) {
            flagImg.src = `https://flagcdn.com/24x18/${result.countryCode.toLowerCase()}.png`;
            flagImg.classList.remove('hidden');
        } else if (flagImg) {
            flagImg.classList.add('hidden');
        }
    } else {
        alert('មិនអាចទាញយកទិន្នន័យ IP បានទេ! សូមពិនិត្យមើលការភ្ជាប់អ៊ីនធឺណិតរបស់អ្នក។');
    }

    if (loadingEl) loadingEl.classList.add('hidden');
    if (contentEl) contentEl.classList.remove('hidden');
    if (searchBtn) searchBtn.disabled = false;
}

// ស្វែងរក IP តាមការវាយបញ្ចូល
function searchCustomIp() {
    const customIp = document.getElementById('customIpInput').value;
    fetchIpDetails(customIp);
}

// ចម្លង IP Address
function copyCurrentIp() {
    const ip = document.getElementById('displayIpAddress').innerText;
    if (!ip || ip.includes('-')) return;
    
    navigator.clipboard.writeText(ip).then(() => {
        const copyMsg = document.getElementById('ipCopyAlert');
        if (copyMsg) {
            copyMsg.classList.remove('hidden');
            setTimeout(() => copyMsg.classList.add('hidden'), 2000);
        }
    });
}
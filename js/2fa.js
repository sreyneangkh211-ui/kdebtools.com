// =========================================================
//                   FILE: 2fa.js
//       (ប្រព័ន្ធដំណើរការមុខងារ 2FA Live & Batch Generator)
// =========================================================

let current2FASecret = '';
let twoFaInterval = null;

// បើក/បិទ Modal 2FA
function open2FAModal() {
    document.getElementById('modal-2fa').classList.remove('hidden');
}

function close2FAModal() {
    document.getElementById('modal-2fa').classList.add('hidden');
    if (twoFaInterval) clearInterval(twoFaInterval);
}

// សម្អាត Key (លុបចន្លោះប្រហោង ដកឃ្លា ឬសញ្ញាផ្សេងៗ)
function cleanSecretKey(key) {
    return (key || '').replace(/[\s\-_]/g, '').toUpperCase();
}

// គណនាបង្កើតកូដ TOTP 6 ខ្ទង់
function getTOTPCode(secretKey) {
    try {
        const cleaned = cleanSecretKey(secretKey);
        if (!cleaned || typeof OTPAuth === 'undefined') return null;
        const totp = new OTPAuth.TOTP({
            issuer: "KdebTools",
            label: "User",
            algorithm: "SHA1",
            digits: 6,
            period: 30,
            secret: OTPAuth.Secret.fromBase32(cleaned)
        });
        return totp.generate();
    } catch (err) {
        return null;
    }
}

// បង្កើតកូដ 2FA សម្រាប់ Single Key
function generate2FACode() {
    const rawKey = document.getElementById('twoFaInput').value.trim();
    if (!rawKey) {
        alert('សូមបញ្ចូល 2FA Secret Key ជាមុនសិន!');
        return;
    }
    const testCode = getTOTPCode(rawKey);
    if (!testCode) {
        alert('Secret Key មិនត្រឹមត្រូវទេ!');
        return;
    }
    current2FASecret = rawKey;
    document.getElementById('twoFaResultBox').classList.remove('hidden');
    update2FALive();

    if (twoFaInterval) clearInterval(twoFaInterval);
    twoFaInterval = setInterval(update2FALive, 1000);
}

// Update កូដ និង Timer Countdown រៀងរាល់វិនាទី
function update2FALive() {
    if (!current2FASecret) return;
    const code = getTOTPCode(current2FASecret);
    const seconds = 30 - Math.floor((Date.now() / 1000) % 30);

    if (code) {
        document.getElementById('twoFaCodeDisplay').innerText = code.slice(0, 3) + ' ' + code.slice(3);
        document.getElementById('twoFaTimerText').innerText = `${seconds}s`;
        document.getElementById('twoFaProgressBar').style.width = `${(seconds / 30) * 100}%`;
    }
}

// ចម្លងកូដ 2FA
function copy2FACode() {
    const codeRaw = document.getElementById('twoFaCodeDisplay').innerText.replace(/\s/g, '');
    if (!codeRaw || codeRaw.includes('-')) return;

    navigator.clipboard.writeText(codeRaw).then(() => {
        const alertMsg = document.getElementById('copyAlertMsg');
        alertMsg.classList.remove('hidden');
        setTimeout(() => alertMsg.classList.add('hidden'), 2500);
    });
}

// បង្កើតកូដ 2FA ច្រើនក្នុងពេលតែមួយ (Batch 2FA)
function generateBatch2FA() {
    const rawLines = document.getElementById('batchInput').value.split('\n');
    const tbody = document.getElementById('batchTableBody');
    tbody.innerHTML = '';
    let count = 0;

    rawLines.forEach(line => {
        const clean = line.trim();
        if (!clean) return;
        count++;
        const code = getTOTPCode(clean);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="p-2 text-gray-500">${count}</td>
            <td class="p-2 font-mono text-gray-300 truncate max-w-[120px]">${clean}</td>
            <td class="p-2 font-mono font-bold text-yellow-400 text-sm">${code ? code : '<span class="text-red-400 text-xs">Invalid</span>'}</td>
            <td class="p-2 text-right">
                ${code ? `<button onclick="navigator.clipboard.writeText('${code}'); alert('បាន Copy: ${code}');" class="bg-dark-bg hover:bg-yellow-500 hover:text-black border border-dark-border px-2 py-0.5 rounded text-xs">Copy</button>` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });

    if (count > 0) document.getElementById('batchResultContainer').classList.remove('hidden');
}
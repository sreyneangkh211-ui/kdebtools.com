// =========================================================
//                   FILE: js/name-generator.js
//       (ប្រព័ន្ធដំណើរការបង្កើតឈ្មោះសិប្បនិម្មិតដោយស្វ័យប្រវត្ត - Algorithmic)
// =========================================================

function openNameModal() {
    document.getElementById('modal-name').classList.remove('hidden');
}

function closeNameModal() {
    document.getElementById('modal-name').classList.add('hidden');
    document.getElementById('nameLanguage').value = 'khmer';
    document.getElementById('nameGender').value = 'mixed';
    document.getElementById('nameCount').value = '10';
    document.getElementById('nameResultBox').classList.add('hidden');
    document.getElementById('nameDisplay').innerHTML = '';
}

// គ្រាប់ពូជព្យាង្គ (Syllables) សម្រាប់បង្កើតឈ្មោះតាមក្បួនដោះស្រាយ (Procedural Generation)
const syllableEngine = {
    khmer: {
        surnames: ["សុខ", "ចាន់", "សេង", "គង់", "មាស", "កែវ", "ហេង", "ជា", "ស៊ិន", "ម៉ៅ", "អ៊ុង", "ឡុង", "ផល", "យិន", "សំ", "លី", "វ៉ាន់", "ធី", "តាំង", "កឹម", "អ៊ុក", "នួន", "អ៊ុយ", "ឡាយ", "ស៊ន"],
        maleRoots: ["សុ", "វិ", "ដា", "ពិ", "និ", "ចំ", "ឧត", "សម្", "ភារ", "មករ", "វិច្", "បញ្", "វឌ្", "ណារ", "មុន", "សិ", "កុ", "ចិត", "សុភ", "បូរ"],
        maleSuffixes: ["ជាតិ", "រិទ្ធ", "បុល", "រ៉ា", "សិដ្ឋ", "ភ័ក្ត្រ", "រន្ត", "រើន", "ដម", "បត្តិ", "រម្យ", "ករា", "ឆិកា", "ញ្ញា", "ធន", "រ៉ុង", "មុនី", "លា", "សិទ្ធិ", "សល", "រោធ", "ត្រា"],
        femaleRoots: ["ស្រី", "សុ", "បុប", "ធា", "ទេ", "ម៉ា", "ណា", "វត", "ពិ", "ចិន", "លី", "ធី", "រត", "ចាន់", "ដា", "សុភ", "លី"],
        femaleSuffixes: ["អូន", "ភា", "ផា", "រី", "វី", "លី", "រី", "តី", "តា", "សី", "ពេជ្រ", "្តា", "ដា", "តា", "ណា", "នី", "ថា", "ណា"]
    },
    english: {
        consonants: ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "r", "s", "t", "v", "w", "z", "ch", "sh"],
        vowels: ["a", "e", "i", "o", "u", "y"],
        endings: ["son", "ton", "ward", "wood", "ley", "man", "ford", "well", "berg", "field", "stone", "ly", "dy", "is", "us", "er"]
    },
    korean: {
        surnames: ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "유", "안", "송", "전", "황", "홍"],
        firstSyllables: ["민", "서", "도", "예", "주", "하", "지", "현", "우", "건", "재", "윤", "채", "다", "수", "승", "태", "진", "영", "시", "혜", "유", "정"],
        secondSyllables: ["준", "윤", "원", "호", "우", "진", "훈", "현", "연", "서", "아", "은", "유", "채", "빈", "태", "수", "민", "혁", "석", "희", "우", "경"]
    },
    chinese: {
        surnames: ["王", "李", "张", "刘", "陈", "杨", "黄", "赵", "吴", "周", "徐", "孙", "马", "朱", "胡", "林", "何", "郭", "高", "罗"],
        maleHanzi: ["伟", "强", "磊", "洋", "勇", "杰", "军", "超", "明", "刚", "博", "毅", "飞", "鹏", "泽", "宇", "睿", "轩", "凯", "建", "国", "平"],
        femaleHanzi: ["芳", "秀", "英", "华", "兰", "梅", "丽", "红", "玲", "艳", "静", "婷", "丹", "娜", "雯", "雅", "欣", "悦", "梦", "琪", "莉", "晴"]
    },
    japanese: {
        surnames: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Matsumoto"],
        consonants: ["k", "s", "t", "n", "h", "m", "r", "y", "w", "g", "z", "d", "b", "p"],
        vowels: ["a", "i", "u", "e", "o"],
        maleEndings: ["to", "ta", "ki", "ro", "ma", "ku", "shi", "ya"],
        femaleEndings: ["ri", "na", "ka", "ko", "ra", "ui", "oi", "ki", "yo"]
    }
};

// ជំនួយការបង្កើតព្យាង្គភាសាអង់គ្លេស និងជប៉ុនបែបសិប្បនិម្មិត
function generateProceduralWord(length, engineKey) {
    const data = syllableEngine[engineKey];
    let word = "";
    let useConsonant = Math.random() > 0.5;

    for (let i = 0; i < length; i++) {
        if (useConsonant) {
            word += data.consonants[Math.floor(Math.random() * data.consonants.length)];
        } else {
            word += data.vowels[Math.floor(Math.random() * data.vowels.length)];
        }
        useConsonant = !useConsonant; // ឆ្លាស់គ្នារវាងស្រៈ និងព្យញ្ជនៈ
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function generateNames() {
    const lang = document.getElementById('nameLanguage').value;
    const gender = document.getElementById('nameGender').value;
    const countInput = parseInt(document.getElementById('nameCount').value) || 10;

    if (countInput < 1 || countInput > 100) {
        alert('សូមបញ្ចូលចំនួនចន្លោះពី ១ ដល់ ១០០!');
        return;
    }

    let generatedList = [];

    for (let i = 0; i < countInput; i++) {
        let fullName = "";
        let currentGender = gender === 'mixed' ? (Math.random() > 0.5 ? 'male' : 'female') : gender;

        if (lang === 'khmer') {
            const data = syllableEngine.khmer;
            const surname = data.surnames[Math.floor(Math.random() * data.surnames.length)];
            
            let firstname = "";
            if (currentGender === 'male') {
                const root = data.maleRoots[Math.floor(Math.random() * data.maleRoots.length)];
                const suffix = data.maleSuffixes[Math.floor(Math.random() * data.maleSuffixes.length)];
                firstname = root + suffix;
            } else {
                const root = data.femaleRoots[Math.floor(Math.random() * data.femaleRoots.length)];
                const suffix = data.femaleSuffixes[Math.floor(Math.random() * data.femaleSuffixes.length)];
                firstname = root + suffix;
            }
            fullName = `${surname}${firstname}`;

        } else if (lang === 'english') {
            const data = syllableEngine.english;
            // បង្កើតឈ្មោះ និងនាមត្រកូលដោយប្រើក្បួនផ្គុំព្យាង្គឆ្លាស់គ្នា
            const firstname = generateProceduralWord(Math.floor(Math.random() * 3) + 4, 'english');
            
            // បង្កើតនាមត្រកូលដែលមានកន្ទុយសព្ទពេញនិយម
            const surnameBase = generateProceduralWord(Math.floor(Math.random() * 2) + 3, 'english');
            const ending = data.endings[Math.floor(Math.random() * data.endings.length)];
            const surname = surnameBase + ending;

            fullName = `${firstname} ${surname}`;

        } else if (lang === 'korean') {
            const data = syllableEngine.korean;
            const surname = data.surnames[Math.floor(Math.random() * data.surnames.length)];
            const s1 = data.firstSyllables[Math.floor(Math.random() * data.firstSyllables.length)];
            const s2 = data.secondSyllables[Math.floor(Math.random() * data.secondSyllables.length)];
            
            fullName = `${surname}${s1}${s2}`;

        } else if (lang === 'chinese') {
            const data = syllableEngine.chinese;
            const surname = data.surnames[Math.floor(Math.random() * data.surnames.length)];
            
            const pools = currentGender === 'male' ? data.maleHanzi : data.femaleHanzi;
            const count = Math.random() > 0.2 ? 2 : 1; // ឈ្មោះមាន ១ ឬ ២ អក្សរ
            let firstname = "";
            for (let c = 0; c < count; c++) {
                firstname += pools[Math.floor(Math.random() * pools.length)];
            }

            fullName = `${surname}${firstname}`;

        } else if (lang === 'japanese') {
            const data = syllableEngine.japanese;
            const surname = data.surnames[Math.floor(Math.random() * data.surnames.length)];
            
            // បង្កើតឈ្មោះជប៉ុនដែលមានកន្ទុយសព្ទស្របតាមភេទនីមួយៗ
            const base = generateProceduralWord(Math.floor(Math.random() * 2) + 2, 'japanese').toLowerCase();
            const endings = currentGender === 'male' ? data.maleEndings : data.femaleEndings;
            const ending = endings[Math.floor(Math.random() * endings.length)];
            const firstname = base.charAt(0).toUpperCase() + base.slice(1) + ending;

            fullName = `${surname} ${firstname}`;
        }

        generatedList.push(fullName);
    }

    // បង្ហាញលទ្ធផលនៅលើ UI រួមជាមួយប៊ូតុង Copy ដាច់ដោយឡែកពីក្រោយឈ្មោះនីមួយៗ
    const displayContainer = document.getElementById('nameDisplay');
    displayContainer.innerHTML = generatedList.map((name, index) => {
        return `
            <div class="flex items-center justify-between py-2 border-b border-dark-border/40 last:border-b-0 hover:bg-dark-hover/20 px-2 rounded transition">
                <div class="flex items-center gap-2">
                    <span class="text-rose-400 font-bold font-mono text-xs">${index + 1}.</span>
                    <span class="text-white select-all text-xs font-semibold">${name}</span>
                </div>
                <button onclick="copySingleName('${name}', this)" class="btn-hover-zoom text-[11px] text-gray-400 hover:text-rose-400 p-1.5 transition duration-150 flex items-center justify-center bg-dark-bg border border-dark-border/60 hover:border-rose-400/40 rounded-lg">
                    <i class="fa-regular fa-copy"></i>
                </button>
            </div>
        `;
    }).join('');

    document.getElementById('nameResultBox').classList.remove('hidden');
}

// មុខងារ Copy ឈ្មោះដាច់ដោយឡែកមួយៗ
function copySingleName(name, btn) {
    navigator.clipboard.writeText(name).then(() => {
        const icon = btn.querySelector('i');
        icon.className = 'fa-solid fa-check text-emerald-400';
        btn.classList.add('border-emerald-500/40');
        setTimeout(() => {
            icon.className = 'fa-regular fa-copy';
            btn.classList.remove('border-emerald-500/40');
        }, 1500);
    });
}

// មុខងារ Copy ឈ្មោះទាំងអស់ព្រមគ្នា (Copy All)
function copyGeneratedNames() {
    const displayContainer = document.getElementById('nameDisplay');
    const items = displayContainer.querySelectorAll('.flex.items-center.justify-between');
    if (items.length === 0) return;

    let namesOnly = [];
    items.forEach(item => {
        const nameSpan = item.querySelector('.select-all');
        if (nameSpan) {
            namesOnly.push(nameSpan.textContent.trim());
        }
    });

    const joinedNames = namesOnly.join('\n');

    navigator.clipboard.writeText(joinedNames).then(() => {
        const alertEl = document.getElementById('nameCopyAlert');
        alertEl.classList.remove('hidden');
        setTimeout(() => {
            alertEl.classList.add('hidden');
        }, 2500);
    });
}
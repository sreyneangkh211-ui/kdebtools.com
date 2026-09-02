// =========================================================
//                   FILE: js/hashtag-generator.js
//       (ប្រព័ន្ធដំណើរការបង្កើត Hashtag បែប Algorithmic & Semantic Expansion)
// =========================================================

function openHashtagModal() {
    document.getElementById('modal-hashtag').classList.remove('hidden');
}

function closeHashtagModal() {
    document.getElementById('modal-hashtag').classList.add('hidden');
    document.getElementById('hashtagKeyword').value = '';
    document.getElementById('hashtagCount').value = '15';
    document.getElementById('hashtagResultBox').classList.add('hidden');
    document.getElementById('hashtagDisplay').textContent = '';
}

// ម៉ាស៊ីនពង្រីកន័យគំនិត (Semantic Expansion Engine)
// ជួយឱ្យក្បួនដោះស្រាយ "យល់ដឹង" ពីប្រភេទ Content និងបង្កើតពាក្យពាក់ព័ន្ធដោយស្វ័យប្រវត្ត
const semanticNiches = [
    {
        keys: ["fit", "gym", "workout", "run", "sport", "health", "diet", "body", "muscle", "train", "football", "soccer"],
        related: ["fitness", "gymlife", "workoutmotivation", "healthylifestyle", "training", "active", "strong", "nopainnogain", "nutrition", "bodybuilding", "wellness", "footballskills", "soccerplayer"]
    },
    {
        keys: ["tech", "code", "dev", "program", "soft", "web", "ai", "app", "cyber", "data", "robot", "window", "ios", "android"],
        related: ["technology", "coding", "developer", "programming", "artificialintelligence", "innovation", "cybersecurity", "webdevelopment", "javascript", "python", "computer", "futuretech"]
    },
    {
        keys: ["food", "cook", "eat", "bake", "chef", "yummy", "taste", "recipe", "delicious", "coffee", "cake"],
        related: ["foodie", "instafood", "foodphotography", "delicious", "cooking", "recipe", "chefmode", "foodstagram", "homemade", "dinner", "yummyfood"]
    },
    {
        keys: ["game", "play", "pubg", "ml", "stream", "xbox", "ps5", "nintendo", "garena", "twitch", "mobilelegends"],
        related: ["gamer", "gamingcommunity", "videogames", "twitchstreamer", "ps5", "gameplay", "pcgaming", "onlinegaming", "gaminglife", "gamers", "esports"]
    },
    {
        keys: ["style", "wear", "dress", "fashion", "look", "make", "beauty", "cosmetic", "glam", "clothes"],
        related: ["ootd", "fashionblogger", "outfitoftheday", "streetwear", "beauty", "makeup", "fashionista", "instafashion", "trendy", "shopping", "chic"]
    },
    {
        keys: ["biz", "work", "money", "rich", "sell", "market", "trade", "finance", "stock", "earn", "business", "crypto"],
        related: ["entrepreneur", "marketing", "success", "startup", "finance", "wealth", "branding", "leadership", "hustle", "smallbusiness", "digitalmarketing"]
    },
    {
        keys: ["travel", "trip", "beach", "world", "place", "nature", "mount", "hotel", "explore", "tour", "island"],
        related: ["wanderlust", "adventure", "travelgram", "beautifuldestinations", "vacation", "explore", "travelblogger", "instatravel", "trip", "naturelovers"]
    },
    {
        keys: ["viral", "trend", "popular", "famous", "hot", "cool", "epic", "best", "top", "video"],
        related: ["trending", "foryou", "fyp", "viralvideo", "explorepage", "explore", "reels", "tiktok", "shorts", "trendingnow", "reelsinstagram", "viralpost", "foryoupage"]
    }
];

// បន្សំកន្ទុយសព្ទ និងក្បាលសព្ទល្បីៗសម្រាប់បង្កើត Hashtag ឱ្យឆាប់ផ្ទុះ (Viral Boosters)
const viralPrefixes = ["best", "top", "my", "the", "easy", "go", "live", "love", "pure", "real", "instadaily", "picoftheday"];
const viralSuffixes = [
    "trends", "video", "foryou", "fyp", "viral", "post", "community", "life", 
    "style", "daily", "photography", "content", "creator", "world", "vibe", 
    "tok", "reel", "official", "goals", "network", "experience", "hub", "zone", "squad"
];

// គ្រាប់ពូជ Hashtag លំដាប់សកលសម្រាប់រុញ Content ឱ្យធ្លុះ Algorithm (Global Algorithm Breakers)
const globalViralTags = ["fyp", "foryou", "viral", "trending", "explore", "reels", "shorts", "foryoupage", "trendingnow", "aesthetic"];

function generateHashtags() {
    const keywordInput = document.getElementById('hashtagKeyword').value.trim().toLowerCase();
    const countInput = parseInt(document.getElementById('hashtagCount').value) || 15;
    
    if (!keywordInput) {
        alert('សូមបញ្ចូលពាក្យគន្លឹះ (Keyword) ជាមុនសិន!');
        return;
    }

    // សម្អាតពាក្យគន្លឹះ (លុបសញ្ញាផ្សេងៗ និងចន្លោះ)
    const cleanWord = keywordInput.replace(/[^a-zA-Z0-9]/g, '');
    if (!cleanWord) {
        alert('សូមបញ្ចូលពាក្យគន្លឹះដែលមានតួអក្សរ ឬលេខត្រឹមត្រូវ!');
        return;
    }

    let rawTags = [];

    // ១. ដាក់បញ្ចូលពាក្យគន្លឹះចម្បងផ្ទាល់ខ្លួន
    rawTags.push(cleanWord);

    // ២. ប្រព័ន្ធវិភាគ Semantic៖ ស្វែងរកក្រុមពាក្យពាក់ព័ន្ធដោយស្វ័យប្រវត្តិតាមការទាយដឹងពី Keyword
    let foundNiche = false;
    for (let niche of semanticNiches) {
        // បើពាក្យគន្លឹះមានផ្ទុក ឬស្រដៀងនឹងសោរន័យណាមួយ
        const match = niche.keys.some(k => cleanWord.includes(k) || k.includes(cleanWord));
        if (match) {
            rawTags = rawTags.concat(niche.related);
            foundNiche = true;
        }
    }

    // ៣. បង្កើតបន្សំល្បីៗ (Viral Combinations) ដោយស្វ័យប្រវត្តិចេញពី Keyword ផ្ទាល់
    let safetyCounter = 0;
    while (rawTags.length < countInput + 20 && safetyCounter < 200) {
        safetyCounter++;
        const randomSuffix = viralSuffixes[Math.floor(Math.random() * viralSuffixes.length)];
        const randomPrefix = Math.random() > 0.7 ? viralPrefixes[Math.floor(Math.random() * viralPrefixes.length)] : "";
        
        let candidate = randomPrefix + cleanWord + randomSuffix;
        if (candidate && !rawTags.includes(candidate)) {
            rawTags.push(candidate);
        }
    }

    // ៤. លាយបញ្ចូលបន្ថែមនូវ Global Viral Hashtags ដើម្បីរុញឱ្យឆាប់ផ្ទុះ (Algorithm Breakers)
    globalViralTags.forEach(tag => {
        if (!rawTags.includes(tag)) {
            rawTags.push(tag);
        }
    });

    // ៥. សម្អាតធាតុស្ទួន ច្របល់ (Shuffle) និងកាត់តម្រឹមយកតាមចំនួនដែលចង់បាន
    rawTags = [...new Set(rawTags)];
    rawTags = rawTags.sort(() => 0.5 - Math.random()).slice(0, countInput);

    // ៦. ផ្គុំជាទម្រង់ Hashtag (#tag1 #tag2 ...)
    const formattedResult = rawTags.map(tag => `#${tag}`).join(' ');

    // ៧. បង្ហាញលទ្ធផលនៅលើ UI
    document.getElementById('hashtagDisplay').textContent = formattedResult;
    document.getElementById('hashtagResultBox').classList.remove('hidden');
}

function copyGeneratedHashtags() {
    const hashtagsText = document.getElementById('hashtagDisplay').textContent;
    if (!hashtagsText) return;

    navigator.clipboard.writeText(hashtagsText).then(() => {
        const alertEl = document.getElementById('hashtagCopyAlert');
        alertEl.classList.remove('hidden');
        setTimeout(() => {
            alertEl.classList.add('hidden');
        }, 2500);
    });
}
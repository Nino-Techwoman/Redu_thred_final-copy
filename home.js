// home page javascript

// theme sync when page loads
let raw = localStorage.getItem('threads_theme');
let savedTheme = 'auto';
if (raw) {
    savedTheme = JSON.parse(raw);
}
if (savedTheme == 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
} else if (savedTheme == 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
} else {
    if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// global variables
let currentUser = null;
let feedPosts = [];
let postRateLimiter = createRateLimiter(10, 60000); // 10 posts per minute

// load from storage
function loadFromStorage(key) {
    let data = localStorage.getItem(key);
    if (data != null) {
        return JSON.parse(data);
    }
    return null;
}

// compress image using canvas
function compressImage(dataUrl, callback) {
    let maxW = 800;
    let maxH = 800;
    let quality = 0.7;
    let tempImg = new Image();
    tempImg.onload = function() {
        let w = tempImg.width;
        let h = tempImg.height;
        if (w > maxW || h > maxH) {
            let ratio = Math.min(maxW / w, maxH / h);
            w = Math.round(w * ratio);
            h = Math.round(h * ratio);
        }
        let canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        let ctx = canvas.getContext('2d');
        ctx.drawImage(tempImg, 0, 0, w, h);
        let compressed = canvas.toDataURL('image/jpeg', quality);
        callback(compressed);
    };
    tempImg.onerror = function() {
        callback(dataUrl);
    };
    tempImg.src = dataUrl;
}

// save to storage
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// get random avatar
function getRandomAvatar() {
    return 'images/avatar' + (Math.floor(Math.random() * 5) + 1) + '.jpg';
}

// get sample posts
function getSamplePosts() {
    let posts = [
        { id: 1, username: "keny.vee", name: "Kenny V", avatar: "images/avatar2.jpg", verified: true, text: "", quote: { username: "keny.vee", avatar: "images/avatar2.jpg", text: "A bad manager can turn you into a great entrepreneur.", highlight: "great entrepreneur", dark: false }, time: "23h", likes: 469, replies: 10, reposts: 45, shares: 50, liked: false },
        { id: 2, username: "bobbydelrio", name: "Bobby Del Rio", avatar: "images/avatar2.jpg", verified: false, text: "Green for envy.", quote: { username: "bobbydelrio", avatar: "images/avatar2.jpg", text: "Social media is viciously competitive now.", highlight: "viciously competitive", dark: false }, time: "6h", likes: 62, replies: 0, reposts: 2, shares: 38, liked: false },
        { id: 3, username: "a.g.e.co", name: "AGE Co", avatar: "images/avatar3.jpg", verified: false, text: "Artist to artist what's your thoughts ?", quote: { username: "druwmelo", avatar: "images/avatar4.jpg", text: "Being an artist is a long game nobody respects.", highlight: "artist is a long game", dark: false }, time: "1h", likes: 0, replies: 0, reposts: 0, shares: 0, liked: false },
        { id: 4, username: "sarah.designs", name: "Sarah Mitchell", avatar: "images/avatar5.jpg", verified: true, text: "Just launched my new portfolio website! What do you think? Link in bio.", quote: null, time: "2h", likes: 234, replies: 45, reposts: 12, shares: 89, liked: false },
        { id: 5, username: "tech.guru", name: "Alex Chen", avatar: "images/avatar1.jpg", verified: true, text: "AI is not going to replace you. A person using AI will.", quote: null, time: "4h", likes: 1289, replies: 156, reposts: 342, shares: 567, liked: false },
        { id: 6, username: "maya.wellness", name: "Maya Johnson", avatar: "images/avatar2.jpg", verified: false, text: "Morning routine update: meditation, journaling, and a long walk. Life changing.", quote: null, time: "5h", likes: 89, replies: 12, reposts: 5, shares: 23, liked: false },
        { id: 7, username: "foodie.adventures", name: "Marco Rossi", avatar: "images/avatar3.jpg", verified: false, text: "", quote: { username: "chef.antonio", avatar: "images/avatar4.jpg", text: "The secret to great pasta is patience and quality ingredients.", highlight: "patience and quality", dark: false }, time: "8h", likes: 156, replies: 23, reposts: 8, shares: 45, liked: false },
        { id: 8, username: "fitness.mike", name: "Mike Thompson", avatar: "images/avatar5.jpg", verified: true, text: "Consistency beats intensity. Show up every day, even when you don't feel like it.", quote: null, time: "10h", likes: 567, replies: 89, reposts: 123, shares: 234, liked: false },
        { id: 9, username: "travel.emma", name: "Emma Watson", avatar: "images/avatar1.jpg", verified: false, text: "Just booked a one-way ticket to Bali. Sometimes you just need to go.", quote: null, time: "12h", likes: 892, replies: 134, reposts: 67, shares: 189, liked: false },
        { id: 10, username: "dev.jason", name: "Jason Park", avatar: "images/avatar2.jpg", verified: true, text: "Hot take: Most coding tutorials are too long. Get to the point.", quote: null, time: "15h", likes: 2341, replies: 456, reposts: 234, shares: 678, liked: false },
        { id: 11, username: "music.vibes", name: "Luna Ray", avatar: "images/avatar3.jpg", verified: false, text: "New song dropping Friday. This one is different.", quote: null, time: "18h", likes: 445, replies: 67, reposts: 34, shares: 123, liked: false },
        { id: 12, username: "startup.life", name: "Ryan Cooper", avatar: "images/avatar4.jpg", verified: true, text: "", quote: { username: "investor.daily", avatar: "images/avatar5.jpg", text: "The best time to start was yesterday. The second best time is now.", highlight: "second best time is now", dark: false }, time: "20h", likes: 789, replies: 45, reposts: 156, shares: 234, liked: false }
    ];
    return posts;
}

// random users for generating new posts
let randomUsers = [
    { username: "lily.writes", name: "Lily Chen", avatar: "images/avatar1.jpg", verified: false },
    { username: "jake.photo", name: "Jake Morrison", avatar: "images/avatar2.jpg", verified: true },
    { username: "nina.codes", name: "Nina Patel", avatar: "images/avatar3.jpg", verified: false },
    { username: "omar.design", name: "Omar Hassan", avatar: "images/avatar4.jpg", verified: true },
    { username: "chloe.fit", name: "Chloe Adams", avatar: "images/avatar5.jpg", verified: false },
    { username: "marcus.dev", name: "Marcus Lee", avatar: "images/avatar1.jpg", verified: true },
    { username: "sofia.art", name: "Sofia Rivera", avatar: "images/avatar2.jpg", verified: false },
    { username: "daniel.music", name: "Daniel Kim", avatar: "images/avatar3.jpg", verified: false },
    { username: "emma.travel", name: "Emma Brooks", avatar: "images/avatar4.jpg", verified: true },
    { username: "leo.startup", name: "Leo Zhang", avatar: "images/avatar5.jpg", verified: false }
];

let nextId = 3000;

let randomTexts = [
    "Just had the best coffee of my life. No cap.",
    "Why does nobody talk about how hard it is to stay consistent?",
    "New project dropping soon. Stay tuned.",
    "Hot take: sleep is more important than hustle.",
    "Sometimes you gotta log off and go outside.",
    "The algorithm is wild today lol",
    "Working on something big. Can't share yet but trust me.",
    "Unpopular opinion: remote work is overrated.",
    "Finally finished that book I've been reading for 3 months.",
    "Grateful for the small wins today.",
    "Anyone else feel like time is moving faster this year?",
    "Don't let anyone rush your process.",
    "Morning walks changed my life. Not even kidding.",
    "Just deleted all my social media apps. Wait...",
    "The sunset tonight was unreal.",
    "Stop scrolling and go drink some water.",
    "I think I finally understand what balance means.",
    "Learning to say no is a superpower.",
    "Just shipped a feature I've been working on for weeks.",
    "Friendly reminder: you don't owe anyone an explanation.",
    "This week hit different. In a good way.",
    "Less talking, more doing. That's the vibe for 2025.",
    "Found the best playlist for late night coding sessions.",
    "Your network is your net worth. Real talk.",
    "Started journaling and wow, the clarity is insane."
];

// generate random posts
function getRandomPosts() {
    let posts = [];
    let count = 6 + Math.floor(Math.random() * 5); // 6 to 10 posts
    let usedTexts = [];

    for (let i = 0; i < count; i++) {
        let user = randomUsers[Math.floor(Math.random() * randomUsers.length)];
        // pick a text we havent used yet
        let textIndex = Math.floor(Math.random() * randomTexts.length);
        while (usedTexts.indexOf(textIndex) != -1 && usedTexts.length < randomTexts.length) {
            textIndex = Math.floor(Math.random() * randomTexts.length);
        }
        usedTexts.push(textIndex);

        let hours = Math.floor(Math.random() * 23) + 1;
        let timeStr = hours + 'h';

        posts.push({
            id: nextId++,
            username: user.username,
            name: user.name,
            avatar: user.avatar,
            verified: user.verified,
            text: randomTexts[textIndex],
            quote: null,
            time: timeStr,
            likes: Math.floor(Math.random() * 500),
            replies: Math.floor(Math.random() * 50),
            reposts: Math.floor(Math.random() * 30),
            shares: Math.floor(Math.random() * 100),
            liked: false
        });
    }
    return posts;
}

// get following feed posts
function getFollowingPosts() {
    let posts = [
        {
            id: 2001, username: "ruska_star6", name: "Ruska Star", avatar: "images/avatar1.jpg", verified: false,
            text: "Sometimes you just need to take a step back and appreciate how far you've come. The journey is never easy but it's always worth it.\n\nLet's keep pushing forward together.\nEvery single day matters.",
            hasTranslate: true, quote: null, time: "3h", likes: 142, replies: 18, reposts: 7, shares: 23, liked: false
        },
        {
            id: 2002, username: "luissousacunha", name: "Luis Sousa Cunha", avatar: "images/avatar2.jpg", verified: false,
            text: "Georgia is going through draconian times.",
            quote: null, time: "16h", likes: 89, replies: 34, reposts: 12, shares: 45, liked: false
        },
        {
            id: 2003, username: "karchavadato", name: "Karchava Dato", avatar: "images/avatar3.jpg", verified: false,
            text: "My top 12 favorite guitarists of all time. The list keeps changing every year but these legends always stay.\n\nDrop yours in the comments!",
            quote: null, time: "1d", likes: 312, replies: 87, reposts: 24, shares: 56, liked: false
        },
        {
            id: 2004, username: "appleboxkit", name: "AppleBox Kit", avatar: "images/avatar4.jpg", verified: false,
            text: "Iced coffee over sunset yesterday's photowalk, today's memory. The light was perfect.\n@streetphotog @citylights\n\n#StreetPhotography #BlackAndWhite #StillStories #VisualStorytelling",
            images: [
                "images/post1.jpg",
                "images/post2.jpg",
                "images/post3.jpg"
            ],
            quote: null, time: "21/01/2026", likes: 456, replies: 23, reposts: 34, shares: 78, liked: false
        },
        {
            id: 2005, username: "travel.adventures", name: "Travel Adventures", avatar: "images/avatar5.jpg", verified: true,
            text: "The mountains don't care about your deadlines. Take a break.\n\n#NaturePhotography #Mountains #Hiking #EverydayAdventure",
            images: [
                "images/post4.jpg",
                "images/post1.jpg"
            ],
            quote: null, time: "5h", likes: 1023, replies: 67, reposts: 145, shares: 234, liked: false
        },
        {
            id: 2006, username: "daily.wisdom", name: "Daily Wisdom", avatar: "images/avatar1.jpg", verified: true,
            text: "The hardest part about growing up is realizing that not everyone has the same heart as you.",
            hasTranslate: true, quote: null, time: "8h", likes: 2341, replies: 123, reposts: 456, shares: 789, liked: false
        },
        {
            id: 2007, username: "coffeecraft", name: "Coffee Craft", avatar: "images/avatar2.jpg", verified: false,
            text: "Morning ritual complete. There's something about the first sip that makes everything feel possible.\n\n#CoffeeLover #MorningVibes #LatteArt",
            images: [
                "images/post2.jpg"
            ],
            quote: null, time: "2h", likes: 178, replies: 12, reposts: 5, shares: 34, liked: false
        },
        {
            id: 2008, username: "dev.thoughts", name: "Dev Thoughts", avatar: "images/avatar3.jpg", verified: true,
            text: "Unpopular opinion: writing documentation is just as important as writing code. Your future self will thank you.",
            quote: null, time: "12h", likes: 567, replies: 89, reposts: 123, shares: 234, liked: false
        },
        {
            id: 2009, username: "artbylex", name: "Lex Art", avatar: "images/avatar4.jpg", verified: false,
            text: "New piece finished. Took me 3 weeks but I'm really happy with how it turned out.\n\n#DigitalArt #CreativeProcess #ArtistsOfThreads",
            images: [
                "images/post3.jpg"
            ],
            quote: null, time: "1d", likes: 892, replies: 156, reposts: 67, shares: 189, liked: false
        },
        {
            id: 2010, username: "fitness.daily", name: "Fitness Daily", avatar: "images/avatar5.jpg", verified: false,
            text: "Day 90 of consistent training. The results speak for themselves. No shortcuts, just discipline.\n\nWho's with me?",
            quote: null, time: "4h", likes: 345, replies: 45, reposts: 23, shares: 67, liked: false
        }
    ];

    // add user posts from localStorage at the top
    let userPosts = loadFromStorage('threads_user_posts');
    if (userPosts != null) {
        for (let i = userPosts.length - 1; i >= 0; i--) {
            posts.unshift(userPosts[i]);
        }
    }

    return posts;
}

// render feed
function renderFeed() {
    console.log("rendering feed");
    let feed = document.getElementById('feed');
    if (feed == null) {
        return;
    }
    feed.innerHTML = '';
    for (let i = 0; i < feedPosts.length; i++) {
        let post = feedPosts[i];
        let postEl = createPostElement(post);
        feed.appendChild(postEl);
    }
}

// create post element
function createPostElement(post) {
    let div = document.createElement('div');
    div.className = 'post';
    div.dataset.id = post.id;

    // build quote html (sanitized)
    let quoteHtml = '';
    if (post.quote != null) {
        let safeQuoteText = sanitize(post.quote.text);
        let highlightedText = safeQuoteText;
        if (post.quote.highlight) {
            let safeHighlight = sanitize(post.quote.highlight);
            highlightedText = safeQuoteText.replace(safeHighlight, '<span class="highlight">' + safeHighlight + '</span>');
        }
        let darkClass = '';
        if (post.quote.dark == true) {
            darkClass = ' dark';
        }
        let safeQuoteUsername = sanitize(post.quote.username);
        quoteHtml = '<div class="quoted-post' + darkClass + '">';
        quoteHtml = quoteHtml + '<div class="quoted-header">';
        quoteHtml = quoteHtml + '<img src="' + encodeURI(post.quote.avatar) + '" alt="' + safeQuoteUsername + '" class="quoted-avatar">';
        quoteHtml = quoteHtml + '<span class="quoted-username">' + safeQuoteUsername + '</span>';
        quoteHtml = quoteHtml + '</div>';
        quoteHtml = quoteHtml + '<p class="quoted-text">' + highlightedText + '</p>';
        quoteHtml = quoteHtml + '</div>';
    }

    // build image html
    let imageHtml = '';
    if (post.images != null && post.images.length > 0) {
        // multiple images gallery
        if (post.images.length == 1) {
            imageHtml = '<img src="' + post.images[0] + '" alt="Post image" class="post-image">';
        } else {
            imageHtml = '<div class="post-image-gallery">';
            for (let img = 0; img < post.images.length; img++) {
                imageHtml = imageHtml + '<img src="' + post.images[img] + '" alt="Post image" class="post-gallery-img">';
            }
            imageHtml = imageHtml + '</div>';
        }
    } else if (post.image != null) {
        if (post.image.indexOf('data:image') == 0 || post.image.match(/\.(jpg|jpeg|png|gif|webp)($|\?)/i)) {
            imageHtml = '<img src="' + post.image + '" alt="Post image" class="post-image">';
        }
    }

    // build verified icon
    let verifiedHtml = '';
    if (post.verified == true) {
        verifiedHtml = '<img src="icons/verified.svg" alt="Verified" class="post-verified">';
    }

    // build text html (sanitized)
    let textHtml = '';
    if (post.text) {
        let safeText = sanitize(post.text);
        // turn hashtags into styled spans
        safeText = safeText.replace(/#(\w+)/g, '<span class="post-hashtag">#$1</span>');
        // turn @mentions into styled spans
        safeText = safeText.replace(/@(\w+)/g, '<span class="post-mention">@$1</span>');
        // keep line breaks
        safeText = safeText.replace(/\n/g, '<br>');
        textHtml = '<p class="post-text">' + safeText + '</p>';
        if (post.hasTranslate) {
            textHtml = textHtml + '<button class="post-translate-btn">Translate</button>';
        }
    }

    // build likes count
    let likesHtml = '';
    if (post.likes > 0) {
        likesHtml = '<span>' + post.likes + '</span>';
    }

    // build replies count
    let repliesHtml = '';
    if (post.replies > 0) {
        repliesHtml = '<span>' + post.replies + '</span>';
    }

    // build reposts count
    let repostsHtml = '';
    if (post.reposts > 0) {
        repostsHtml = '<span>' + post.reposts + '</span>';
    }

    // build shares count
    let sharesHtml = '';
    if (post.shares > 0) {
        sharesHtml = '<span>' + post.shares + '</span>';
    }

    // build liked class
    let likedClass = '';
    if (post.liked == true) {
        likedClass = ' liked';
    }

    // build the full html (sanitized user content)
    let safeUsername = sanitize(post.username);
    let safeAvatar = encodeURI(post.avatar);
    let html = '';
    html = html + '<div class="post-avatar-container">';
    html = html + '<img src="' + safeAvatar + '" alt="' + safeUsername + '" class="post-avatar">';
    html = html + '<div class="post-line"></div>';
    html = html + '</div>';
    html = html + '<div class="post-content">';
    html = html + '<div class="post-header">';
    html = html + '<span class="post-username">' + safeUsername + '</span>';
    html = html + verifiedHtml;
    html = html + '<span class="post-time">' + post.time + '</span>';
    html = html + '<div class="post-header-icons">';
    html = html + '<div class="post-menu-container">';
    html = html + '<button class="post-icon-btn post-menu-btn">';
    html = html + '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>';
    html = html + '</button>';
    html = html + '<div class="post-menu-dropdown">';
    html = html + '<div class="post-menu-main">';
    html = html + '<div class="post-menu-group">';
    html = html + '<button class="post-menu-item post-menu-add-to-feed"><span>Add to feed</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>';
    html = html + '</div>';
    html = html + '<div class="post-menu-group">';
    html = html + '<button class="post-menu-item"><span>Save</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>';
    html = html + '<button class="post-menu-item"><span>Not interested</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg></button>';
    html = html + '</div>';
    html = html + '<div class="post-menu-group">';
    html = html + '<button class="post-menu-item"><span>Mute</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></button>';
    html = html + '<button class="post-menu-item"><span>Restrict</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></button>';
    html = html + '<button class="post-menu-item danger"><span>Block</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg></button>';
    html = html + '<button class="post-menu-item danger"><span>Report</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></button>';
    html = html + '</div>';
    html = html + '<div class="post-menu-group">';
    html = html + '<button class="post-menu-item"><span>Copy link</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>';
    html = html + '</div>';
    html = html + '</div>';
    html = html + '<div class="post-menu-sub" style="display:none;">';
    html = html + '<div class="post-menu-sub-header">';
    html = html + '<button class="post-menu-back-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg></button>';
    html = html + '<span>Add to feed</span>';
    html = html + '</div>';
    html = html + '<div class="post-menu-group">';
    html = html + '<button class="post-menu-item"><span>Create new feed</span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></button>';
    html = html + '</div>';
    html = html + '</div>';
    html = html + '</div>';
    html = html + '</div>';
    html = html + '</div>';
    html = html + '</div>';
    html = html + textHtml;
    html = html + quoteHtml;
    html = html + imageHtml;
    html = html + '<div class="post-actions">';
    html = html + '<button class="action-btn like-btn' + likedClass + '" data-id="' + post.id + '">';
    html = html + '<svg class="heart-icon" viewBox="0 0 24 24" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    html = html + likesHtml;
    html = html + '</button>';
    html = html + '<button class="action-btn comment-btn" data-id="' + post.id + '">';
    html = html + '<svg aria-label="Comment" role="img" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><title>Comment</title><path d="M16.5 10C16.5 13.5899 13.5899 16.5 10 16.5C9.11599 16.5 8.27304 16.3235 7.50008 16.0023L3.5 17L4.49769 13.0001C4.17655 12.2271 4 11.3841 4 10.5C3.5 6.91015 6.41015 3.5 10 3.5C13.5899 3.5 16.5 6.41015 16.5 10Z" stroke-linejoin="round"/></svg>';
    html = html + repliesHtml;
    html = html + '</button>';
    html = html + '<div class="repost-container">';
    html = html + '<button class="action-btn repost-btn" data-id="' + post.id + '">';
    html = html + '<svg aria-label="Repost" role="img" viewBox="0 0 18 18" width="20" height="20" fill="currentColor"><title>Repost</title><path d="M6.41256 1.23531C6.6349 0.971277 7.02918 0.937481 7.29321 1.15982L9.96509 3.40982C10.1022 3.52528 10.1831 3.69404 10.1873 3.87324C10.1915 4.05243 10.1186 4.2248 9.98706 4.34656L7.31518 6.81971C7.06186 7.05419 6.66643 7.03892 6.43196 6.7856C6.19748 6.53228 6.21275 6.13685 6.46607 5.90237L7.9672 4.51289H5.20312C3.68434 4.51289 2.45312 5.74411 2.45312 7.26289V9.51289V11.7629C2.45312 13.2817 3.68434 14.5129 5.20312 14.5129C5.5483 14.5129 5.82812 14.7927 5.82812 15.1379C5.82812 15.4831 5.5483 15.7629 5.20312 15.7629C2.99399 15.7629 1.20312 13.972 1.20312 11.7629V9.51289V7.26289C1.20312 5.05375 2.99399 3.26289 5.20312 3.26289H7.85002L6.48804 2.11596C6.22401 1.89362 6.19021 1.49934 6.41256 1.23531Z"></path><path d="M11.5874 17.7904C11.3651 18.0545 10.9708 18.0883 10.7068 17.8659L8.03491 15.6159C7.89781 15.5005 7.81687 15.3317 7.81267 15.1525C7.80847 14.9733 7.8814 14.801 8.01294 14.6792L10.6848 12.206C10.9381 11.9716 11.3336 11.9868 11.568 12.2402C11.8025 12.4935 11.7872 12.8889 11.5339 13.1234L10.0328 14.5129H12.7969C14.3157 14.5129 15.5469 13.2816 15.5469 11.7629V9.51286V7.26286C15.5469 5.74408 14.3157 4.51286 12.7969 4.51286C12.4517 4.51286 12.1719 4.23304 12.1719 3.88786C12.1719 3.54269 12.4517 3.26286 12.7969 3.26286C15.006 3.26286 16.7969 5.05373 16.7969 7.26286V9.51286V11.7629C16.7969 13.972 15.006 15.7629 12.7969 15.7629H10.15L11.512 16.9098C11.776 17.1321 11.8098 17.5264 11.5874 17.7904Z"></path></svg>';
    html = html + repostsHtml;
    html = html + '</button>';
    html = html + '<div class="repost-dropdown">';
    html = html + '<button class="repost-dropdown-item" data-action="repost" data-id="' + post.id + '">';
    html = html + '<span>Repost</span>';
    html = html + '<svg aria-label="Repost" role="img" viewBox="0 0 18 18" width="20" height="20" fill="currentColor"><title>Repost</title><path d="M6.41256 1.23531C6.6349 0.971277 7.02918 0.937481 7.29321 1.15982L9.96509 3.40982C10.1022 3.52528 10.1831 3.69404 10.1873 3.87324C10.1915 4.05243 10.1186 4.2248 9.98706 4.34656L7.31518 6.81971C7.06186 7.05419 6.66643 7.03892 6.43196 6.7856C6.19748 6.53228 6.21275 6.13685 6.46607 5.90237L7.9672 4.51289H5.20312C3.68434 4.51289 2.45312 5.74411 2.45312 7.26289V9.51289V11.7629C2.45312 13.2817 3.68434 14.5129 5.20312 14.5129C5.5483 14.5129 5.82812 14.7927 5.82812 15.1379C5.82812 15.4831 5.5483 15.7629 5.20312 15.7629C2.99399 15.7629 1.20312 13.972 1.20312 11.7629V9.51289V7.26289C1.20312 5.05375 2.99399 3.26289 5.20312 3.26289H7.85002L6.48804 2.11596C6.22401 1.89362 6.19021 1.49934 6.41256 1.23531Z"></path><path d="M11.5874 17.7904C11.3651 18.0545 10.9708 18.0883 10.7068 17.8659L8.03491 15.6159C7.89781 15.5005 7.81687 15.3317 7.81267 15.1525C7.80847 14.9733 7.8814 14.801 8.01294 14.6792L10.6848 12.206C10.9381 11.9716 11.3336 11.9868 11.568 12.2402C11.8025 12.4935 11.7872 12.8889 11.5339 13.1234L10.0328 14.5129H12.7969C14.3157 14.5129 15.5469 13.2816 15.5469 11.7629V9.51286V7.26286C15.5469 5.74408 14.3157 4.51286 12.7969 4.51286C12.4517 4.51286 12.1719 4.23304 12.1719 3.88786C12.1719 3.54269 12.4517 3.26286 12.7969 3.26286C15.006 3.26286 16.7969 5.05373 16.7969 7.26286V9.51286V11.7629C16.7969 13.972 15.006 15.7629 12.7969 15.7629H10.15L11.512 16.9098C11.776 17.1321 11.8098 17.5264 11.5874 17.7904Z"></path></svg>';
    html = html + '</button>';
    html = html + '<button class="repost-dropdown-item" data-action="quote" data-id="' + post.id + '">';
    html = html + '<span>Quote</span>';
    html = html + '<svg aria-label="Quote" role="img" viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><title>Quote</title><path d="M7.68694 19.611C6.70477 20.3965 5.25 19.6973 5.25 18.4396V16.3507L5 16.3507C2.37665 16.3507 0.25 14.224 0.25 11.6007V9.35066V6.10066C0.25 3.47731 2.37665 1.35066 5 1.35066H5.5H14.2188H14.9688C17.5921 1.35066 19.7188 3.47731 19.7188 6.10066V9.35066V11.6007C19.7188 14.224 17.5921 16.3507 14.9688 16.3507H14.2188L11.763 16.3507L7.68694 19.611ZM6.75 18.4396L10.8261 15.1793C11.0921 14.9666 11.4225 14.8507 11.763 14.8507L14.2187 14.8507H14.9688C16.7637 14.8507 18.2188 13.3956 18.2188 11.6007V9.35066V6.10066C18.2188 4.30574 16.7637 2.85066 14.9688 2.85066H14.2188H5.5H5C3.20507 2.85066 1.75 4.30574 1.75 6.10066V9.35066V11.6007C1.75 13.3956 3.20508 14.8507 5 14.8507H5.25C6.07843 14.8507 6.75 15.5222 6.75 16.3507V18.4396Z"></path><path d="M7.67735 6.5C6.62472 6.5 5.82617 7.20469 5.82617 8.20517C5.82617 9.16216 6.45231 9.90164 7.44142 9.90164C7.80439 9.90164 8.16737 9.84074 8.4033 9.57105H8.46682C8.14922 10.2583 7.48679 10.702 6.9151 10.8412C6.58842 10.9282 6.4886 11.0674 6.4886 11.2675C6.4886 11.485 6.67009 11.6503 6.92418 11.6503C7.81347 11.6503 9.58298 10.6411 9.58298 8.51837C9.58298 7.37869 8.81165 6.5 7.67735 6.5Z"></path><path d="M12.396 6.5C11.3434 6.5 10.5449 7.20469 10.5449 8.20517C10.5449 9.16216 11.171 9.90164 12.1692 9.90164C12.5231 9.90164 12.8861 9.84074 13.122 9.57105H13.1855C12.8679 10.2583 12.2055 10.702 11.6338 10.8412C11.3071 10.9282 11.2073 11.0674 11.2073 11.2675C11.2073 11.485 11.3888 11.6503 11.6429 11.6503C12.5322 11.6503 14.3017 10.6411 14.3017 8.51837C14.3017 7.37869 13.5303 6.5 12.396 6.5Z"></path></svg>';
    html = html + '</button>';
    html = html + '</div>';
    html = html + '</div>';
    html = html + '<button class="action-btn share-btn" data-id="' + post.id + '">';
    html = html + '<svg aria-label="Share" role="img" viewBox="0 0 18 18" width="20" height="20" fill="none" stroke="currentColor"><title>Share</title><path d="M15.6097 4.09082L6.65039 9.11104" stroke-linejoin="round" stroke-width="1.25"></path><path d="M7.79128 14.439C8.00463 15.3275 8.11131 15.7718 8.33426 15.932C8.52764 16.071 8.77617 16.1081 9.00173 16.0318C9.26179 15.9438 9.49373 15.5501 9.95761 14.7628L15.5444 5.2809C15.8883 4.69727 16.0603 4.40546 16.0365 4.16566C16.0159 3.95653 15.9071 3.76612 15.7374 3.64215C15.5428 3.5 15.2041 3.5 14.5267 3.5H3.71404C2.81451 3.5 2.36474 3.5 2.15744 3.67754C1.97758 3.83158 1.88253 4.06254 1.90186 4.29856C1.92415 4.57059 2.24363 4.88716 2.88259 5.52032L6.11593 8.7243C6.26394 8.87097 6.33795 8.94431 6.39784 9.02755C6.451 9.10144 6.4958 9.18101 6.53142 9.26479C6.57153 9.35916 6.59586 9.46047 6.64451 9.66309L7.79128 14.439Z" stroke-linejoin="round" stroke-width="1.25"></path></svg>';
    html = html + sharesHtml;
    html = html + '</button>';
    html = html + '</div>';
    html = html + '</div>';

    div.innerHTML = html;

    // add like button click
    let likeBtn = div.querySelector('.like-btn');
    if (likeBtn != null) {
        likeBtn.onclick = function() {
            toggleLike(post.id);
        };
    }

    // add comment button click
    let commentBtn = div.querySelector('.comment-btn');
    if (commentBtn != null) {
        commentBtn.onclick = function() {
            openReplyModal(post);
        };
    }

    // add share button click
    let shareBtn = div.querySelector('.share-btn');
    if (shareBtn != null) {
        shareBtn.onclick = function() {
            openShareModal(post);
        };
    }

    // add markup button click
    let markupBtn = div.querySelector('.post-markup-btn');
    if (markupBtn != null) {
        markupBtn.onclick = function() {
            showMarkupToast(post.username);
        };
    }

    // add repost button click (toggle dropdown)
    let repostBtn = div.querySelector('.repost-btn');
    let repostDropdown = div.querySelector('.repost-dropdown');
    if (repostBtn != null && repostDropdown != null) {
        repostBtn.onclick = function(e) {
            e.stopPropagation();
            let isOpen = repostDropdown.classList.contains('active');
            // close all repost dropdowns
            let allRepost = document.querySelectorAll('.repost-dropdown.active');
            for (let i = 0; i < allRepost.length; i++) {
                allRepost[i].classList.remove('active');
            }
            if (isOpen == false) {
                // update dropdown to show Remove or Repost
                let repostItem = repostDropdown.querySelector('[data-action="repost"]');
                if (repostItem != null) {
                    if (post.reposted) {
                        repostItem.classList.add('remove');
                        repostItem.querySelector('span').textContent = 'Remove';
                    } else {
                        repostItem.classList.remove('remove');
                        repostItem.querySelector('span').textContent = 'Repost';
                    }
                }
                repostDropdown.classList.add('active');
            }
        };

        // repost action
        let repostAction = repostDropdown.querySelector('[data-action="repost"]');
        if (repostAction != null) {
            repostAction.onclick = function(e) {
                e.stopPropagation();
                toggleRepost(post.id);
                repostDropdown.classList.remove('active');
            };
        }

        // quote action
        let quoteAction = repostDropdown.querySelector('[data-action="quote"]');
        if (quoteAction != null) {
            quoteAction.onclick = function(e) {
                e.stopPropagation();
                repostDropdown.classList.remove('active');
                openShareModal(post);
            };
        }
    }

    // add menu button click
    let postMenuBtn = div.querySelector('.post-menu-btn');
    let postMenuDropdown = div.querySelector('.post-menu-dropdown');
    if (postMenuBtn != null && postMenuDropdown != null) {
        postMenuBtn.onclick = function(e) {
            e.stopPropagation();
            let isOpen = postMenuDropdown.classList.contains('active');
            // close all dropdowns
            let allDropdowns = document.querySelectorAll('.post-menu-dropdown.active');
            for (let i = 0; i < allDropdowns.length; i++) {
                allDropdowns[i].classList.remove('active');
            }
            if (isOpen == false) {
                postMenuDropdown.classList.add('active');
                if (window.innerWidth <= 700) {
                    let overlay = document.getElementById('postMenuOverlay');
                    if (overlay != null) {
                        overlay.classList.add('active');
                    }
                }
            }
        };
    }

    // add to feed sub-menu
    let addToFeedBtn = div.querySelector('.post-menu-add-to-feed');
    let menuMain = div.querySelector('.post-menu-main');
    let menuSub = div.querySelector('.post-menu-sub');
    let backBtn = div.querySelector('.post-menu-back-btn');
    if (addToFeedBtn != null && menuMain != null && menuSub != null) {
        addToFeedBtn.onclick = function(e) {
            e.stopPropagation();
            menuMain.style.display = 'none';
            menuSub.style.display = 'flex';
        };
    }
    if (backBtn != null && menuMain != null && menuSub != null) {
        backBtn.onclick = function(e) {
            e.stopPropagation();
            menuSub.style.display = 'none';
            menuMain.style.display = 'flex';
        };
    }

    // create new feed button
    let createNewFeedBtn = div.querySelector('.post-menu-sub .post-menu-item');
    if (createNewFeedBtn != null) {
        createNewFeedBtn.onclick = function(e) {
            e.stopPropagation();
            closeAllPostMenus();
            openCreateFeedPanel(post);
        };
    }

    return div;
}

// get relative time string
function getRelativeTime(timestamp) {
    let now = Date.now();
    let diff = now - timestamp;
    let seconds = Math.floor(diff / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);
    if (days > 0) return days + 'd ago';
    if (hours > 0) return hours + 'h ago';
    if (minutes > 0) return minutes + 'm ago';
    return 'just now';
}

// build embedded original post card html
function buildEmbedCardHtml(orig) {
    let safeUsername = sanitize(orig.username);
    let safeAvatar = encodeURI(orig.avatar);

    // build text
    let textHtml = '';
    if (orig.text) {
        let safeText = sanitize(orig.text);
        safeText = safeText.replace(/#(\w+)/g, '<span class="post-hashtag">#$1</span>');
        safeText = safeText.replace(/@(\w+)/g, '<span class="post-mention">@$1</span>');
        safeText = safeText.replace(/\n/g, '<br>');
        textHtml = '<p class="embed-card-text">' + safeText + '</p>';
    }

    // build nested quote
    let quoteHtml = '';
    if (orig.quote != null) {
        let safeQuoteText = sanitize(orig.quote.text);
        let highlightedText = safeQuoteText;
        if (orig.quote.highlight) {
            let safeHighlight = sanitize(orig.quote.highlight);
            highlightedText = safeQuoteText.replace(safeHighlight, '<span class="highlight">' + safeHighlight + '</span>');
        }
        let safeQuoteUsername = sanitize(orig.quote.username);
        quoteHtml = '<div class="quoted-post">';
        quoteHtml += '<div class="quoted-header">';
        quoteHtml += '<img src="' + encodeURI(orig.quote.avatar) + '" alt="" class="quoted-avatar">';
        quoteHtml += '<span class="quoted-username">' + safeQuoteUsername + '</span>';
        quoteHtml += '</div>';
        quoteHtml += '<p class="quoted-text">' + highlightedText + '</p>';
        quoteHtml += '</div>';
        // quote citation
        quoteHtml += '<p class="embed-card-citation">';
        quoteHtml += '<svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M7.68 6.5C6.62 6.5 5.83 7.2 5.83 8.2c0 .96.63 1.7 1.62 1.7.36 0 .72-.06.96-.33h.06c-.32.69-.98 1.13-1.55 1.27-.33.09-.43.23-.43.43 0 .22.18.38.44.38.89 0 2.66-1.01 2.66-3.13C9.58 7.38 8.81 6.5 7.68 6.5ZM12.4 6.5c-1.05 0-1.85.7-1.85 1.7 0 .96.63 1.7 1.62 1.7.36 0 .72-.06.96-.33h.06c-.32.69-.98 1.13-1.55 1.27-.33.09-.43.23-.43.43 0 .22.18.38.44.38.89 0 2.66-1.01 2.66-3.13 0-1.14-.77-2.02-1.91-2.02Z"></path></svg>';
        quoteHtml += ' ' + safeQuoteUsername + ': ' + safeQuoteText;
        quoteHtml += '</p>';
    }

    // build image
    let imageHtml = '';
    if (orig.images != null && orig.images.length > 0) {
        if (orig.images.length == 1) {
            imageHtml = '<img src="' + orig.images[0] + '" alt="" class="embed-card-image">';
        } else {
            imageHtml = '<div class="embed-card-gallery">';
            for (let img = 0; img < orig.images.length; img++) {
                imageHtml += '<img src="' + orig.images[img] + '" alt="" class="embed-card-gallery-img">';
            }
            imageHtml += '</div>';
        }
    } else if (orig.image != null) {
        imageHtml = '<img src="' + orig.image + '" alt="" class="embed-card-image">';
    }

    // build counts
    let likesHtml = orig.likes > 0 ? '<span>' + orig.likes + '</span>' : '';
    let repliesHtml = orig.replies > 0 ? '<span>' + orig.replies + '</span>' : '';
    let repostsHtml = orig.reposts > 0 ? '<span>' + orig.reposts + '</span>' : '';
    let sharesHtml = orig.shares > 0 ? '<span>' + orig.shares + '</span>' : '';

    let html = '<div class="embed-card">';
    html += '<div class="embed-card-header">';
    html += '<img src="' + safeAvatar + '" alt="" class="embed-card-avatar">';
    html += '<span class="embed-card-username">' + safeUsername + '</span>';
    html += '<span class="embed-card-time">' + orig.time + '</span>';
    html += '<svg class="embed-card-quote-icon" viewBox="0 0 20 20" width="18" height="18" fill="currentColor"><path d="M7.68 6.5C6.62 6.5 5.83 7.2 5.83 8.2c0 .96.63 1.7 1.62 1.7.36 0 .72-.06.96-.33h.06c-.32.69-.98 1.13-1.55 1.27-.33.09-.43.23-.43.43 0 .22.18.38.44.38.89 0 2.66-1.01 2.66-3.13C9.58 7.38 8.81 6.5 7.68 6.5ZM12.4 6.5c-1.05 0-1.85.7-1.85 1.7 0 .96.63 1.7 1.62 1.7.36 0 .72-.06.96-.33h.06c-.32.69-.98 1.13-1.55 1.27-.33.09-.43.23-.43.43 0 .22.18.38.44.38.89 0 2.66-1.01 2.66-3.13 0-1.14-.77-2.02-1.91-2.02Z"></path></svg>';
    html += '</div>';
    html += textHtml;
    html += quoteHtml;
    html += imageHtml;
    html += '<div class="embed-card-actions">';
    html += '<span class="embed-card-action"><svg class="heart-icon" viewBox="0 0 24 24" width="16" height="16"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' + likesHtml + '</span>';
    html += '<span class="embed-card-action"><svg viewBox="0 0 18 18" width="16" height="16" fill="currentColor"><path d="M6.41256 1.23531C6.6349 0.971277 7.02918 0.937481 7.29321 1.15982L9.96509 3.40982C10.1022 3.52528 10.1831 3.69404 10.1873 3.87324C10.1915 4.05243 10.1186 4.2248 9.98706 4.34656L7.31518 6.81971C7.06186 7.05419 6.66643 7.03892 6.43196 6.7856C6.19748 6.53228 6.21275 6.13685 6.46607 5.90237L7.9672 4.51289H5.20312C3.68434 4.51289 2.45312 5.74411 2.45312 7.26289V9.51289V11.7629C2.45312 13.2817 3.68434 14.5129 5.20312 14.5129C5.5483 14.5129 5.82812 14.7927 5.82812 15.1379C5.82812 15.4831 5.5483 15.7629 5.20312 15.7629C2.99399 15.7629 1.20312 13.972 1.20312 11.7629V9.51289V7.26289C1.20312 5.05375 2.99399 3.26289 5.20312 3.26289H7.85002L6.48804 2.11596C6.22401 1.89362 6.19021 1.49934 6.41256 1.23531Z"></path><path d="M11.5874 17.7904C11.3651 18.0545 10.9708 18.0883 10.7068 17.8659L8.03491 15.6159C7.89781 15.5005 7.81687 15.3317 7.81267 15.1525C7.80847 14.9733 7.8814 14.801 8.01294 14.6792L10.6848 12.206C10.9381 11.9716 11.3336 11.9868 11.568 12.2402C11.8025 12.4935 11.7872 12.8889 11.5339 13.1234L10.0328 14.5129H12.7969C14.3157 14.5129 15.5469 13.2816 15.5469 11.7629V9.51286V7.26286C15.5469 5.74408 14.3157 4.51286 12.7969 4.51286C12.4517 4.51286 12.1719 4.23304 12.1719 3.88786C12.1719 3.54269 12.4517 3.26286 12.7969 3.26286C15.006 3.26286 16.7969 5.05373 16.7969 7.26286V9.51286V11.7629C16.7969 13.972 15.006 15.7629 12.7969 15.7629H10.15L11.512 16.9098C11.776 17.1321 11.8098 17.5264 11.5874 17.7904Z"></path></svg>' + repliesHtml + '</span>';
    html += '<span class="embed-card-action"><svg viewBox="0 0 18 18" width="16" height="16" fill="currentColor"><path d="M6.41256 1.23531C6.6349 0.971277 7.02918 0.937481 7.29321 1.15982L9.96509 3.40982C10.1022 3.52528 10.1831 3.69404 10.1873 3.87324C10.1915 4.05243 10.1186 4.2248 9.98706 4.34656L7.31518 6.81971C7.06186 7.05419 6.66643 7.03892 6.43196 6.7856C6.19748 6.53228 6.21275 6.13685 6.46607 5.90237L7.9672 4.51289H5.20312C3.68434 4.51289 2.45312 5.74411 2.45312 7.26289V9.51289V11.7629C2.45312 13.2817 3.68434 14.5129 5.20312 14.5129C5.5483 14.5129 5.82812 14.7927 5.82812 15.1379C5.82812 15.4831 5.5483 15.7629 5.20312 15.7629C2.99399 15.7629 1.20312 13.972 1.20312 11.7629V9.51289V7.26289C1.20312 5.05375 2.99399 3.26289 5.20312 3.26289H7.85002L6.48804 2.11596C6.22401 1.89362 6.19021 1.49934 6.41256 1.23531Z"></path><path d="M11.5874 17.7904C11.3651 18.0545 10.9708 18.0883 10.7068 17.8659L8.03491 15.6159C7.89781 15.5005 7.81687 15.3317 7.81267 15.1525C7.80847 14.9733 7.8814 14.801 8.01294 14.6792L10.6848 12.206C10.9381 11.9716 11.3336 11.9868 11.568 12.2402C11.8025 12.4935 11.7872 12.8889 11.5339 13.1234L10.0328 14.5129H12.7969C14.3157 14.5129 15.5469 13.2816 15.5469 11.7629V9.51286V7.26286C15.5469 5.74408 14.3157 4.51286 12.7969 4.51286C12.4517 4.51286 12.1719 4.23304 12.1719 3.88786C12.1719 3.54269 12.4517 3.26286 12.7969 3.26286C15.006 3.26286 16.7969 5.05373 16.7969 7.26286V9.51286V11.7629C16.7969 13.972 15.006 15.7629 12.7969 15.7629H10.15L11.512 16.9098C11.776 17.1321 11.8098 17.5264 11.5874 17.7904Z"></path></svg>' + repostsHtml + '</span>';
    html += '<span class="embed-card-action"><svg viewBox="0 0 18 18" width="16" height="16" fill="none" stroke="currentColor"><path d="M15.6097 4.09082L6.65039 9.11104" stroke-linejoin="round" stroke-width="1.25"></path><path d="M7.79128 14.439C8.00463 15.3275 8.11131 15.7718 8.33426 15.932C8.52764 16.071 8.77617 16.1081 9.00173 16.0318C9.26179 15.9438 9.49373 15.5501 9.95761 14.7628L15.5444 5.2809C15.8883 4.69727 16.0603 4.40546 16.0365 4.16566C16.0159 3.95653 15.9071 3.76612 15.7374 3.64215C15.5428 3.5 15.2041 3.5 14.5267 3.5H3.71404C2.81451 3.5 2.36474 3.5 2.15744 3.67754C1.97758 3.83158 1.88253 4.06254 1.90186 4.29856C1.92415 4.57059 2.24363 4.88716 2.88259 5.52032L6.11593 8.7243C6.26394 8.87097 6.33795 8.94431 6.39784 9.02755C6.451 9.10144 6.4958 9.18101 6.53142 9.26479C6.57153 9.35916 6.59586 9.46047 6.64451 9.66309L7.79128 14.439Z" stroke-linejoin="round" stroke-width="1.25"></path></svg>' + sharesHtml + '</span>';
    html += '</div>';
    html += '</div>';
    return html;
}

// create repost/reply element for following feed
function createActivityElement(entry) {
    let wrapper = document.createElement('div');
    wrapper.className = 'repost-wrapper';

    // build the user's own post wrapper with the embedded original post card
    let userAvatar = currentUser != null ? encodeURI(currentUser.avatar) : 'images/avatar1.jpg';
    let userName = sanitize(entry.repostedBy || entry.repliedBy || 'you');
    let timeAgo = getRelativeTime(entry.repostedAt || entry.repliedAt);

    // user text (for quote reposts or replies)
    let userTextHtml = '';
    if (entry.userText && entry.userText.trim() != '') {
        let safeText = sanitize(entry.userText);
        safeText = safeText.replace(/#(\w+)/g, '<span class="post-hashtag">#$1</span>');
        safeText = safeText.replace(/@(\w+)/g, '<span class="post-mention">@$1</span>');
        safeText = safeText.replace(/\n/g, '<br>');
        userTextHtml = '<p class="post-text">' + safeText + '</p>';
    }

    // build embedded card from original post
    let embedHtml = buildEmbedCardHtml(entry.originalPost);

    let postDiv = document.createElement('div');
    postDiv.className = 'post';

    let html = '';
    html += '<div class="post-avatar-container">';
    html += '<img src="' + userAvatar + '" alt="' + userName + '" class="post-avatar">';
    html += '<div class="post-line"></div>';
    html += '</div>';
    html += '<div class="post-content">';
    html += '<div class="post-header">';
    html += '<span class="post-username">' + userName + '</span>';
    html += '<span class="post-time">' + timeAgo + '</span>';
    html += '<div class="post-header-icons">';
    html += '<div class="post-menu-container">';
    html += '<button class="post-icon-btn post-menu-btn">';
    html += '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="1.5"/><circle cx="6" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></svg>';
    html += '</button>';
    html += '<div class="post-menu-dropdown">';
    html += '<div class="post-menu-main">';
    html += '<div class="post-menu-group">';
    html += '<button class="post-menu-item post-menu-add-to-feed"><span>Add to feed</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>';
    html += '</div>';
    html += '<div class="post-menu-group">';
    html += '<button class="post-menu-item"><span>Save</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg></button>';
    html += '<button class="post-menu-item"><span>Not interested</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg></button>';
    html += '</div>';
    html += '<div class="post-menu-group">';
    html += '<button class="post-menu-item"><span>Mute</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></button>';
    html += '<button class="post-menu-item"><span>Restrict</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></button>';
    html += '<button class="post-menu-item danger"><span>Block</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg></button>';
    html += '<button class="post-menu-item danger"><span>Report</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></button>';
    html += '</div>';
    html += '<div class="post-menu-group">';
    html += '<button class="post-menu-item"><span>Copy link</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>';
    html += '</div>';
    html += '</div>';
    html += '<div class="post-menu-sub" style="display:none;">';
    html += '<div class="post-menu-sub-header">';
    html += '<button class="post-menu-back-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg></button>';
    html += '<span>Add to feed</span>';
    html += '</div>';
    html += '<div class="post-menu-group">';
    html += '<button class="post-menu-item"><span>Create new feed</span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></button>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
    let origPost = entry.originalPost;
    let origPostId = origPost.id;

    html += userTextHtml;
    html += embedHtml;
    html += '<div class="post-actions">';
    html += '<button class="action-btn like-btn" data-id="' + origPostId + '">';
    html += '<svg class="heart-icon" viewBox="0 0 24 24" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    html += '</button>';
    html += '<button class="action-btn comment-btn" data-id="' + origPostId + '">';
    html += '<svg aria-label="Comment" role="img" viewBox="0 0 18 18" width="20" height="20" fill="currentColor"><title>Comment</title><path d="M6.41256 1.23531C6.6349 0.971277 7.02918 0.937481 7.29321 1.15982L9.96509 3.40982C10.1022 3.52528 10.1831 3.69404 10.1873 3.87324C10.1915 4.05243 10.1186 4.2248 9.98706 4.34656L7.31518 6.81971C7.06186 7.05419 6.66643 7.03892 6.43196 6.7856C6.19748 6.53228 6.21275 6.13685 6.46607 5.90237L7.9672 4.51289H5.20312C3.68434 4.51289 2.45312 5.74411 2.45312 7.26289V9.51289V11.7629C2.45312 13.2817 3.68434 14.5129 5.20312 14.5129C5.5483 14.5129 5.82812 14.7927 5.82812 15.1379C5.82812 15.4831 5.5483 15.7629 5.20312 15.7629C2.99399 15.7629 1.20312 13.972 1.20312 11.7629V9.51289V7.26289C1.20312 5.05375 2.99399 3.26289 5.20312 3.26289H7.85002L6.48804 2.11596C6.22401 1.89362 6.19021 1.49934 6.41256 1.23531Z"></path><path d="M11.5874 17.7904C11.3651 18.0545 10.9708 18.0883 10.7068 17.8659L8.03491 15.6159C7.89781 15.5005 7.81687 15.3317 7.81267 15.1525C7.80847 14.9733 7.8814 14.801 8.01294 14.6792L10.6848 12.206C10.9381 11.9716 11.3336 11.9868 11.568 12.2402C11.8025 12.4935 11.7872 12.8889 11.5339 13.1234L10.0328 14.5129H12.7969C14.3157 14.5129 15.5469 13.2816 15.5469 11.7629V9.51286V7.26286C15.5469 5.74408 14.3157 4.51286 12.7969 4.51286C12.4517 4.51286 12.1719 4.23304 12.1719 3.88786C12.1719 3.54269 12.4517 3.26286 12.7969 3.26286C15.006 3.26286 16.7969 5.05373 16.7969 7.26286V9.51286V11.7629C16.7969 13.972 15.006 15.7629 12.7969 15.7629H10.15L11.512 16.9098C11.776 17.1321 11.8098 17.5264 11.5874 17.7904Z"></path></svg>';
    html += '</button>';
    html += '<div class="repost-container">';
    html += '<button class="action-btn repost-btn" data-id="' + origPostId + '">';
    html += '<svg aria-label="Repost" role="img" viewBox="0 0 18 18" width="20" height="20" fill="currentColor"><title>Repost</title><path d="M6.41256 1.23531C6.6349 0.971277 7.02918 0.937481 7.29321 1.15982L9.96509 3.40982C10.1022 3.52528 10.1831 3.69404 10.1873 3.87324C10.1915 4.05243 10.1186 4.2248 9.98706 4.34656L7.31518 6.81971C7.06186 7.05419 6.66643 7.03892 6.43196 6.7856C6.19748 6.53228 6.21275 6.13685 6.46607 5.90237L7.9672 4.51289H5.20312C3.68434 4.51289 2.45312 5.74411 2.45312 7.26289V9.51289V11.7629C2.45312 13.2817 3.68434 14.5129 5.20312 14.5129C5.5483 14.5129 5.82812 14.7927 5.82812 15.1379C5.82812 15.4831 5.5483 15.7629 5.20312 15.7629C2.99399 15.7629 1.20312 13.972 1.20312 11.7629V9.51289V7.26289C1.20312 5.05375 2.99399 3.26289 5.20312 3.26289H7.85002L6.48804 2.11596C6.22401 1.89362 6.19021 1.49934 6.41256 1.23531Z"></path><path d="M11.5874 17.7904C11.3651 18.0545 10.9708 18.0883 10.7068 17.8659L8.03491 15.6159C7.89781 15.5005 7.81687 15.3317 7.81267 15.1525C7.80847 14.9733 7.8814 14.801 8.01294 14.6792L10.6848 12.206C10.9381 11.9716 11.3336 11.9868 11.568 12.2402C11.8025 12.4935 11.7872 12.8889 11.5339 13.1234L10.0328 14.5129H12.7969C14.3157 14.5129 15.5469 13.2816 15.5469 11.7629V9.51286V7.26286C15.5469 5.74408 14.3157 4.51286 12.7969 4.51286C12.4517 4.51286 12.1719 4.23304 12.1719 3.88786C12.1719 3.54269 12.4517 3.26286 12.7969 3.26286C15.006 3.26286 16.7969 5.05373 16.7969 7.26286V9.51286V11.7629C16.7969 13.972 15.006 15.7629 12.7969 15.7629H10.15L11.512 16.9098C11.776 17.1321 11.8098 17.5264 11.5874 17.7904Z"></path></svg>';
    html += '</button>';
    html += '<div class="repost-dropdown">';
    html += '<button class="repost-dropdown-item" data-action="repost" data-id="' + origPostId + '">';
    html += '<span>Repost</span>';
    html += '<svg aria-label="Repost" role="img" viewBox="0 0 18 18" width="20" height="20" fill="currentColor"><title>Repost</title><path d="M6.41256 1.23531C6.6349 0.971277 7.02918 0.937481 7.29321 1.15982L9.96509 3.40982C10.1022 3.52528 10.1831 3.69404 10.1873 3.87324C10.1915 4.05243 10.1186 4.2248 9.98706 4.34656L7.31518 6.81971C7.06186 7.05419 6.66643 7.03892 6.43196 6.7856C6.19748 6.53228 6.21275 6.13685 6.46607 5.90237L7.9672 4.51289H5.20312C3.68434 4.51289 2.45312 5.74411 2.45312 7.26289V9.51289V11.7629C2.45312 13.2817 3.68434 14.5129 5.20312 14.5129C5.5483 14.5129 5.82812 14.7927 5.82812 15.1379C5.82812 15.4831 5.5483 15.7629 5.20312 15.7629C2.99399 15.7629 1.20312 13.972 1.20312 11.7629V9.51289V7.26289C1.20312 5.05375 2.99399 3.26289 5.20312 3.26289H7.85002L6.48804 2.11596C6.22401 1.89362 6.19021 1.49934 6.41256 1.23531Z"></path><path d="M11.5874 17.7904C11.3651 18.0545 10.9708 18.0883 10.7068 17.8659L8.03491 15.6159C7.89781 15.5005 7.81687 15.3317 7.81267 15.1525C7.80847 14.9733 7.8814 14.801 8.01294 14.6792L10.6848 12.206C10.9381 11.9716 11.3336 11.9868 11.568 12.2402C11.8025 12.4935 11.7872 12.8889 11.5339 13.1234L10.0328 14.5129H12.7969C14.3157 14.5129 15.5469 13.2816 15.5469 11.7629V9.51286V7.26286C15.5469 5.74408 14.3157 4.51286 12.7969 4.51286C12.4517 4.51286 12.1719 4.23304 12.1719 3.88786C12.1719 3.54269 12.4517 3.26286 12.7969 3.26286C15.006 3.26286 16.7969 5.05373 16.7969 7.26286V9.51286V11.7629C16.7969 13.972 15.006 15.7629 12.7969 15.7629H10.15L11.512 16.9098C11.776 17.1321 11.8098 17.5264 11.5874 17.7904Z"></path></svg>';
    html += '</button>';
    html += '<button class="repost-dropdown-item" data-action="quote" data-id="' + origPostId + '">';
    html += '<span>Quote</span>';
    html += '<svg aria-label="Quote" role="img" viewBox="0 0 20 20" width="20" height="20" fill="currentColor"><title>Quote</title><path d="M7.68694 19.611C6.70477 20.3965 5.25 19.6973 5.25 18.4396V16.3507L5 16.3507C2.37665 16.3507 0.25 14.224 0.25 11.6007V9.35066V6.10066C0.25 3.47731 2.37665 1.35066 5 1.35066H5.5H14.2188H14.9688C17.5921 1.35066 19.7188 3.47731 19.7188 6.10066V9.35066V11.6007C19.7188 14.224 17.5921 16.3507 14.9688 16.3507H14.2188L11.763 16.3507L7.68694 19.611ZM6.75 18.4396L10.8261 15.1793C11.0921 14.9666 11.4225 14.8507 11.763 14.8507L14.2187 14.8507H14.9688C16.7637 14.8507 18.2188 13.3956 18.2188 11.6007V9.35066V6.10066C18.2188 4.30574 16.7637 2.85066 14.9688 2.85066H14.2188H5.5H5C3.20507 2.85066 1.75 4.30574 1.75 6.10066V9.35066V11.6007C1.75 13.3956 3.20508 14.8507 5 14.8507H5.25C6.07843 14.8507 6.75 15.5222 6.75 16.3507V18.4396Z"></path><path d="M7.67735 6.5C6.62472 6.5 5.82617 7.20469 5.82617 8.20517C5.82617 9.16216 6.45231 9.90164 7.44142 9.90164C7.80439 9.90164 8.16737 9.84074 8.4033 9.57105H8.46682C8.14922 10.2583 7.48679 10.702 6.9151 10.8412C6.58842 10.9282 6.4886 11.0674 6.4886 11.2675C6.4886 11.485 6.67009 11.6503 6.92418 11.6503C7.81347 11.6503 9.58298 10.6411 9.58298 8.51837C9.58298 7.37869 8.81165 6.5 7.67735 6.5Z"></path><path d="M12.396 6.5C11.3434 6.5 10.5449 7.20469 10.5449 8.20517C10.5449 9.16216 11.171 9.90164 12.1692 9.90164C12.5231 9.90164 12.8861 9.84074 13.122 9.57105H13.1855C12.8679 10.2583 12.2055 10.702 11.6338 10.8412C11.3071 10.9282 11.2073 11.0674 11.2073 11.2675C11.2073 11.485 11.3888 11.6503 11.6429 11.6503C12.5322 11.6503 14.3017 10.6411 14.3017 8.51837C14.3017 7.37869 13.5303 6.5 12.396 6.5Z"></path></svg>';
    html += '</button>';
    html += '</div>';
    html += '</div>';
    html += '<button class="action-btn share-btn" data-id="' + origPostId + '">';
    html += '<svg aria-label="Share" role="img" viewBox="0 0 18 18" width="20" height="20" fill="none" stroke="currentColor"><title>Share</title><path d="M15.6097 4.09082L6.65039 9.11104" stroke-linejoin="round" stroke-width="1.25"></path><path d="M7.79128 14.439C8.00463 15.3275 8.11131 15.7718 8.33426 15.932C8.52764 16.071 8.77617 16.1081 9.00173 16.0318C9.26179 15.9438 9.49373 15.5501 9.95761 14.7628L15.5444 5.2809C15.8883 4.69727 16.0603 4.40546 16.0365 4.16566C16.0159 3.95653 15.9071 3.76612 15.7374 3.64215C15.5428 3.5 15.2041 3.5 14.5267 3.5H3.71404C2.81451 3.5 2.36474 3.5 2.15744 3.67754C1.97758 3.83158 1.88253 4.06254 1.90186 4.29856C1.92415 4.57059 2.24363 4.88716 2.88259 5.52032L6.11593 8.7243C6.26394 8.87097 6.33795 8.94431 6.39784 9.02755C6.451 9.10144 6.4958 9.18101 6.53142 9.26479C6.57153 9.35916 6.59586 9.46047 6.64451 9.66309L7.79128 14.439Z" stroke-linejoin="round" stroke-width="1.25"></path></svg>';
    html += '</button>';
    html += '</div>';
    html += '</div>';

    postDiv.innerHTML = html;
    wrapper.appendChild(postDiv);

    // add like button click - direct toggle since post may not be in feedPosts
    let likeBtn = postDiv.querySelector('.like-btn');
    if (likeBtn != null) {
        likeBtn.onclick = function() {
            // try feedPosts first
            let found = false;
            for (let i = 0; i < feedPosts.length; i++) {
                if (feedPosts[i].id == origPostId) {
                    found = true;
                    break;
                }
            }
            if (found) {
                toggleLike(origPostId);
            } else {
                // toggle directly on button
                if (likeBtn.classList.contains('liked')) {
                    likeBtn.classList.remove('liked');
                    origPost.liked = false;
                    origPost.likes = origPost.likes - 1;
                } else {
                    likeBtn.classList.add('liked');
                    origPost.liked = true;
                    origPost.likes = origPost.likes + 1;
                }
                // update count
                let span = likeBtn.querySelector('span');
                if (origPost.likes > 0) {
                    if (span == null) {
                        span = document.createElement('span');
                        likeBtn.appendChild(span);
                    }
                    span.textContent = origPost.likes;
                } else {
                    if (span != null) span.remove();
                }
            }
        };
    }

    // add comment button click - opens reply modal for the original post
    let commentBtn = postDiv.querySelector('.comment-btn');
    if (commentBtn != null) {
        commentBtn.onclick = function() {
            openReplyModal(origPost);
        };
    }

    // add share button click
    let shareBtn = postDiv.querySelector('.share-btn');
    if (shareBtn != null) {
        shareBtn.onclick = function() {
            openShareModal(origPost);
        };
    }

    // add menu button click for following feed
    let fPostMenuBtn = postDiv.querySelector('.post-menu-btn');
    let fPostMenuDropdown = postDiv.querySelector('.post-menu-dropdown');
    if (fPostMenuBtn != null && fPostMenuDropdown != null) {
        fPostMenuBtn.onclick = function(e) {
            e.stopPropagation();
            let isOpen = fPostMenuDropdown.classList.contains('active');
            let allDropdowns = document.querySelectorAll('.post-menu-dropdown.active');
            for (let i = 0; i < allDropdowns.length; i++) {
                allDropdowns[i].classList.remove('active');
            }
            if (isOpen == false) {
                fPostMenuDropdown.classList.add('active');
                if (window.innerWidth <= 700) {
                    let overlay = document.getElementById('postMenuOverlay');
                    if (overlay != null) {
                        overlay.classList.add('active');
                    }
                }
            }
        };
    }
    let fAddToFeedBtn = postDiv.querySelector('.post-menu-add-to-feed');
    let fMenuMain = postDiv.querySelector('.post-menu-main');
    let fMenuSub = postDiv.querySelector('.post-menu-sub');
    let fBackBtn = postDiv.querySelector('.post-menu-back-btn');
    if (fAddToFeedBtn != null && fMenuMain != null && fMenuSub != null) {
        fAddToFeedBtn.onclick = function(e) {
            e.stopPropagation();
            fMenuMain.style.display = 'none';
            fMenuSub.style.display = 'flex';
        };
    }
    if (fBackBtn != null && fMenuMain != null && fMenuSub != null) {
        fBackBtn.onclick = function(e) {
            e.stopPropagation();
            fMenuSub.style.display = 'none';
            fMenuMain.style.display = 'flex';
        };
    }

    // add repost button click (toggle dropdown)
    let repostBtn = postDiv.querySelector('.repost-btn');
    let repostDropdown = postDiv.querySelector('.repost-dropdown');
    if (repostBtn != null && repostDropdown != null) {
        repostBtn.onclick = function(e) {
            e.stopPropagation();
            let isOpen = repostDropdown.classList.contains('active');
            let allRepost = document.querySelectorAll('.repost-dropdown.active');
            for (let i = 0; i < allRepost.length; i++) {
                allRepost[i].classList.remove('active');
            }
            if (isOpen == false) {
                let repostItem = repostDropdown.querySelector('[data-action="repost"]');
                if (repostItem != null) {
                    if (origPost.reposted) {
                        repostItem.classList.add('remove');
                        repostItem.querySelector('span').textContent = 'Remove';
                    } else {
                        repostItem.classList.remove('remove');
                        repostItem.querySelector('span').textContent = 'Repost';
                    }
                }
                repostDropdown.classList.add('active');
            }
        };

        let repostAction = repostDropdown.querySelector('[data-action="repost"]');
        if (repostAction != null) {
            repostAction.onclick = function(e) {
                e.stopPropagation();
                toggleRepost(origPostId);
                repostDropdown.classList.remove('active');
            };
        }

        let quoteAction = repostDropdown.querySelector('[data-action="quote"]');
        if (quoteAction != null) {
            quoteAction.onclick = function(e) {
                e.stopPropagation();
                repostDropdown.classList.remove('active');
                openShareModal(origPost);
            };
        }
    }

    // add footer label
    let footer = document.createElement('div');
    footer.className = 'repost-footer';
    let footerIcon = '';
    let footerLabel = '';
    if (entry.type == 'reply') {
        footerIcon = '<svg viewBox="0 0 18 18" width="16" height="16" fill="currentColor"><path d="M6.41256 1.23531C6.6349 0.971277 7.02918 0.937481 7.29321 1.15982L9.96509 3.40982C10.1022 3.52528 10.1831 3.69404 10.1873 3.87324C10.1915 4.05243 10.1186 4.2248 9.98706 4.34656L7.31518 6.81971C7.06186 7.05419 6.66643 7.03892 6.43196 6.7856C6.19748 6.53228 6.21275 6.13685 6.46607 5.90237L7.9672 4.51289H5.20312C3.68434 4.51289 2.45312 5.74411 2.45312 7.26289V9.51289V11.7629C2.45312 13.2817 3.68434 14.5129 5.20312 14.5129C5.5483 14.5129 5.82812 14.7927 5.82812 15.1379C5.82812 15.4831 5.5483 15.7629 5.20312 15.7629C2.99399 15.7629 1.20312 13.972 1.20312 11.7629V9.51289V7.26289C1.20312 5.05375 2.99399 3.26289 5.20312 3.26289H7.85002L6.48804 2.11596C6.22401 1.89362 6.19021 1.49934 6.41256 1.23531Z"></path><path d="M11.5874 17.7904C11.3651 18.0545 10.9708 18.0883 10.7068 17.8659L8.03491 15.6159C7.89781 15.5005 7.81687 15.3317 7.81267 15.1525C7.80847 14.9733 7.8814 14.801 8.01294 14.6792L10.6848 12.206C10.9381 11.9716 11.3336 11.9868 11.568 12.2402C11.8025 12.4935 11.7872 12.8889 11.5339 13.1234L10.0328 14.5129H12.7969C14.3157 14.5129 15.5469 13.2816 15.5469 11.7629V9.51286V7.26286C15.5469 5.74408 14.3157 4.51286 12.7969 4.51286C12.4517 4.51286 12.1719 4.23304 12.1719 3.88786C12.1719 3.54269 12.4517 3.26286 12.7969 3.26286C15.006 3.26286 16.7969 5.05373 16.7969 7.26286V9.51286V11.7629C16.7969 13.972 15.006 15.7629 12.7969 15.7629H10.15L11.512 16.9098C11.776 17.1321 11.8098 17.5264 11.5874 17.7904Z"></path></svg>';
        footerLabel = userName + ' replied ' + timeAgo;
    } else {
        footerIcon = '<svg viewBox="0 0 18 18" width="16" height="16" fill="currentColor"><path d="M6.41256 1.23531C6.6349 0.971277 7.02918 0.937481 7.29321 1.15982L9.96509 3.40982C10.1022 3.52528 10.1831 3.69404 10.1873 3.87324C10.1915 4.05243 10.1186 4.2248 9.98706 4.34656L7.31518 6.81971C7.06186 7.05419 6.66643 7.03892 6.43196 6.7856C6.19748 6.53228 6.21275 6.13685 6.46607 5.90237L7.9672 4.51289H5.20312C3.68434 4.51289 2.45312 5.74411 2.45312 7.26289V9.51289V11.7629C2.45312 13.2817 3.68434 14.5129 5.20312 14.5129C5.5483 14.5129 5.82812 14.7927 5.82812 15.1379C5.82812 15.4831 5.5483 15.7629 5.20312 15.7629C2.99399 15.7629 1.20312 13.972 1.20312 11.7629V9.51289V7.26289C1.20312 5.05375 2.99399 3.26289 5.20312 3.26289H7.85002L6.48804 2.11596C6.22401 1.89362 6.19021 1.49934 6.41256 1.23531Z"></path><path d="M11.5874 17.7904C11.3651 18.0545 10.9708 18.0883 10.7068 17.8659L8.03491 15.6159C7.89781 15.5005 7.81687 15.3317 7.81267 15.1525C7.80847 14.9733 7.8814 14.801 8.01294 14.6792L10.6848 12.206C10.9381 11.9716 11.3336 11.9868 11.568 12.2402C11.8025 12.4935 11.7872 12.8889 11.5339 13.1234L10.0328 14.5129H12.7969C14.3157 14.5129 15.5469 13.2816 15.5469 11.7629V9.51286V7.26286C15.5469 5.74408 14.3157 4.51286 12.7969 4.51286C12.4517 4.51286 12.1719 4.23304 12.1719 3.88786C12.1719 3.54269 12.4517 3.26286 12.7969 3.26286C15.006 3.26286 16.7969 5.05373 16.7969 7.26286V9.51286V11.7629C16.7969 13.972 15.006 15.7629 12.7969 15.7629H10.15L11.512 16.9098C11.776 17.1321 11.8098 17.5264 11.5874 17.7904Z"></path></svg>';
        footerLabel = userName + ' reposted ' + timeAgo;
    }
    footer.innerHTML = footerIcon + '<span>' + footerLabel + '</span>';
    wrapper.appendChild(footer);

    return wrapper;
}

// repost SVG icons
let repostIconDefault = '<svg aria-label="Repost" role="img" viewBox="0 0 18 18" width="20" height="20" fill="currentColor"><title>Repost</title><path d="M6.41256 1.23531C6.6349 0.971277 7.02918 0.937481 7.29321 1.15982L9.96509 3.40982C10.1022 3.52528 10.1831 3.69404 10.1873 3.87324C10.1915 4.05243 10.1186 4.2248 9.98706 4.34656L7.31518 6.81971C7.06186 7.05419 6.66643 7.03892 6.43196 6.7856C6.19748 6.53228 6.21275 6.13685 6.46607 5.90237L7.9672 4.51289H5.20312C3.68434 4.51289 2.45312 5.74411 2.45312 7.26289V9.51289V11.7629C2.45312 13.2817 3.68434 14.5129 5.20312 14.5129C5.5483 14.5129 5.82812 14.7927 5.82812 15.1379C5.82812 15.4831 5.5483 15.7629 5.20312 15.7629C2.99399 15.7629 1.20312 13.972 1.20312 11.7629V9.51289V7.26289C1.20312 5.05375 2.99399 3.26289 5.20312 3.26289H7.85002L6.48804 2.11596C6.22401 1.89362 6.19021 1.49934 6.41256 1.23531Z"></path><path d="M11.5874 17.7904C11.3651 18.0545 10.9708 18.0883 10.7068 17.8659L8.03491 15.6159C7.89781 15.5005 7.81687 15.3317 7.81267 15.1525C7.80847 14.9733 7.8814 14.801 8.01294 14.6792L10.6848 12.206C10.9381 11.9716 11.3336 11.9868 11.568 12.2402C11.8025 12.4935 11.7872 12.8889 11.5339 13.1234L10.0328 14.5129H12.7969C14.3157 14.5129 15.5469 13.2816 15.5469 11.7629V9.51286V7.26286C15.5469 5.74408 14.3157 4.51286 12.7969 4.51286C12.4517 4.51286 12.1719 4.23304 12.1719 3.88786C12.1719 3.54269 12.4517 3.26286 12.7969 3.26286C15.006 3.26286 16.7969 5.05373 16.7969 7.26286V9.51286V11.7629C16.7969 13.972 15.006 15.7629 12.7969 15.7629H10.15L11.512 16.9098C11.776 17.1321 11.8098 17.5264 11.5874 17.7904Z"></path></svg>';
let repostIconChecked = '<svg aria-label="Repost" role="img" viewBox="0 0 18 18" width="20" height="20" fill="currentColor"><title>Repost</title><path d="M6.413.735a.625.625 0 0 1 .88-.075l2.672 2.25a.625.625 0 0 1-.402 1.103h-4.36a2.75 2.75 0 0 0-2.75 2.75v4.5a2.75 2.75 0 0 0 2.75 2.75.625.625 0 1 1 0 1.25 4 4 0 0 1-4-4v-4.5a4 4 0 0 1 4-4H7.85L6.488 1.616a.625.625 0 0 1-.075-.88ZM11.587 17.29a.625.625 0 0 1-.88.076l-2.672-2.25a.625.625 0 0 1 .402-1.103h4.36a2.75 2.75 0 0 0 2.75-2.75v-4.5a2.75 2.75 0 0 0-2.75-2.75.625.625 0 1 1 0-1.25 4 4 0 0 1 4 4v4.5a4 4 0 0 1-4 4H10.15l1.362 1.147a.625.625 0 0 1 .075.88Z"></path><path d="m11.733 7.2-3.6 3.6L6.27 8.937" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.25"></path></svg>';

// toggle repost
function toggleRepost(postId) {
    let post = null;
    for (let i = 0; i < feedPosts.length; i++) {
        if (feedPosts[i].id == postId) {
            post = feedPosts[i];
            if (feedPosts[i].reposted == true) {
                feedPosts[i].reposted = false;
                feedPosts[i].reposts = feedPosts[i].reposts - 1;
            } else {
                feedPosts[i].reposted = true;
                feedPosts[i].reposts = feedPosts[i].reposts + 1;
            }
            break;
        }
    }

    let btn = document.querySelector('.repost-btn[data-id="' + postId + '"]');
    if (btn != null && post != null) {
        // swap icon
        let svgEl = btn.querySelector('svg');
        if (svgEl != null) svgEl.remove();
        let spanEl = btn.querySelector('span');
        if (post.reposted) {
            btn.classList.add('reposted');
            btn.insertAdjacentHTML('afterbegin', repostIconChecked);
        } else {
            btn.classList.remove('reposted');
            btn.insertAdjacentHTML('afterbegin', repostIconDefault);
        }
        // update count
        if (post.reposts > 0) {
            if (spanEl == null) {
                spanEl = document.createElement('span');
                btn.appendChild(spanEl);
            }
            spanEl.textContent = post.reposts;
        } else {
            if (spanEl != null) spanEl.remove();
        }
    }

    // save/remove repost to localStorage
    if (post != null) {
        let savedReposts = loadFromStorage('threads_user_reposts');
        if (savedReposts == null) savedReposts = [];
        if (post.reposted) {
            // add repost
            let already = false;
            for (let r = 0; r < savedReposts.length; r++) {
                if (savedReposts[r].originalPost.id == post.id) { already = true; break; }
            }
            if (!already) {
                let repostEntry = {
                    id: 'repost_' + post.id + '_' + Date.now(),
                    repostedBy: currentUser != null ? currentUser.username : 'you',
                    repostedAt: Date.now(),
                    originalPost: {
                        id: post.id,
                        username: post.username,
                        name: post.name || post.username,
                        avatar: post.avatar,
                        verified: post.verified || false,
                        text: post.text || '',
                        image: post.image || null,
                        images: post.images || null,
                        quote: post.quote || null,
                        time: post.time,
                        likes: post.likes,
                        replies: post.replies,
                        reposts: post.reposts,
                        shares: post.shares,
                        liked: post.liked || false,
                        hasTranslate: post.hasTranslate || false
                    }
                };
                savedReposts.unshift(repostEntry);
                saveToStorage('threads_user_reposts', savedReposts);
            }
        } else {
            // remove repost
            let filtered = [];
            for (let r = 0; r < savedReposts.length; r++) {
                if (savedReposts[r].originalPost.id != post.id) {
                    filtered.push(savedReposts[r]);
                }
            }
            saveToStorage('threads_user_reposts', filtered);
        }
    }
}

// toggle like
function toggleLike(postId) {
    console.log("toggling like for: " + postId);
    let post = null;
    for (let i = 0; i < feedPosts.length; i++) {
        if (feedPosts[i].id == postId) {
            post = feedPosts[i];
            if (feedPosts[i].liked == true) {
                feedPosts[i].liked = false;
                feedPosts[i].likes = feedPosts[i].likes - 1;
            } else {
                feedPosts[i].liked = true;
                feedPosts[i].likes = feedPosts[i].likes + 1;
            }
            break;
        }
    }

    // update the button directly without re-rendering
    let btn = document.querySelector('.like-btn[data-id="' + postId + '"]');
    if (btn != null && post != null) {
        if (post.liked) {
            btn.classList.add('liked');
        } else {
            btn.classList.remove('liked');
        }
        // update count
        let span = btn.querySelector('span');
        if (post.likes > 0) {
            if (span == null) {
                span = document.createElement('span');
                btn.appendChild(span);
            }
            span.textContent = post.likes;
        } else {
            if (span != null) {
                span.remove();
            }
        }
    }

    saveToStorage('threads_posts', feedPosts);
}

// pending post waiting for view click
let pendingNewPost = null;

// create post
function createPost(text, images, quote) {
    if (currentUser == null) {
        return;
    }
    // allow post if there is text or images or quote
    let hasText = text != null && text.trim() != '';
    let hasImages = images != null && images.length > 0;
    let hasQuote = quote != null;
    if (!hasText && !hasImages && !hasQuote) {
        return;
    }
    // check rate limit
    let rateCheck = postRateLimiter.check();
    if (!rateCheck.allowed) {
        alert(rateCheck.message);
        return;
    }
    // trim text if too long
    if (text != null) {
        text = text.substring(0, 2200);
    }

    let newPost = {
        id: nextId++,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar,
        verified: false,
        text: (text || '').trim(),
        images: images || [],
        quote: quote || null,
        time: "now",
        likes: 0,
        replies: 0,
        reposts: 0,
        shares: 0,
        liked: false
    };

    // save to user posts
    let userPosts = loadFromStorage('threads_user_posts');
    if (userPosts == null) {
        userPosts = [];
    }
    userPosts.unshift(newPost);
    saveToStorage('threads_user_posts', userPosts);

    // store pending post
    pendingNewPost = newPost;

    // add to feed and re-render so the post appears immediately
    feedPosts.unshift(newPost);
    renderFeed();
}

// show pending post
function showPendingPost() {
    let pendingPost = loadFromStorage('threads_pending_post');
    if (pendingPost != null) {
        feedPosts.unshift(pendingPost);
        localStorage.removeItem('threads_pending_post');
        renderFeed();
        window.scrollTo(0, 0);
    }
    hidePostToast();
}

// show post toast
let postToastTimer = null;
function showPostToast(state) {
    let toast = document.getElementById('postToast');
    let posting = document.getElementById('toastPosting');
    let posted = document.getElementById('toastPosted');
    if (toast == null) {
        return;
    }
    // clear any existing timer
    if (postToastTimer != null) {
        clearTimeout(postToastTimer);
        postToastTimer = null;
    }
    if (state == 'posting') {
        posting.style.display = 'flex';
        posted.style.display = 'none';
    } else {
        posting.style.display = 'none';
        posted.style.display = 'flex';
        // auto-hide after 4 seconds
        postToastTimer = setTimeout(function() {
            hidePostToast();
            postToastTimer = null;
        }, 4000);
    }
    toast.classList.add('active');
}

// hide post toast
function hidePostToast() {
    let toast = document.getElementById('postToast');
    if (toast != null) {
        toast.classList.remove('active');
    }
}

// show markup toast
function showMarkupToast(username) {
    let toast = document.getElementById('markupToast');
    let toastText = document.getElementById('markupToastText');
    if (toast != null && toastText != null) {
        toastText.textContent = 'Markup by ' + username + '.';
        toast.classList.add('active');
        setTimeout(function() {
            toast.classList.remove('active');
        }, 3000);
    }
}

// open modal
function openModal() {
    let modal = document.getElementById('modalOverlay');
    if (modal != null) {
        modal.classList.add('active');
        let avatar = document.getElementById('createPostAvatar');
        let username = document.getElementById('createPostUsername');
        let addThreadAvatar = document.getElementById('addThreadAvatar');
        if (avatar != null && currentUser != null) {
            avatar.src = currentUser.avatar;
        }
        if (username != null && currentUser != null) {
            username.textContent = currentUser.username;
        }
        if (addThreadAvatar != null && currentUser != null) {
            addThreadAvatar.src = currentUser.avatar;
        }
        // ensure post button matches textarea content
        let textarea = document.getElementById('createPostText');
        let postBtn = document.getElementById('createPostSubmit');
        if (textarea != null && postBtn != null) {
            if (textarea.value.trim() != '') {
                postBtn.disabled = false;
                postBtn.removeAttribute('disabled');
            } else {
                postBtn.disabled = true;
                postBtn.setAttribute('disabled', '');
            }
        }
        if (textarea != null) {
            setTimeout(function() { textarea.focus(); }, 50);
        }
    }
}

// open share modal (new thread with quoted post)
let shareTargetPost = null;

function openShareModal(post) {
    shareTargetPost = post;

    // populate quote preview
    let preview = document.getElementById('shareQuotePreview');
    let quoteAvatar = document.getElementById('shareQuoteAvatar');
    let quoteUsername = document.getElementById('shareQuoteUsername');
    let quoteTime = document.getElementById('shareQuoteTime');
    let quoteText = document.getElementById('shareQuoteText');
    let quoteImage = document.getElementById('shareQuoteImage');
    let quoteImg = document.getElementById('shareQuoteImg');
    let quoteNested = document.getElementById('shareQuoteNested');

    if (quoteAvatar != null) quoteAvatar.src = post.avatar;
    if (quoteUsername != null) quoteUsername.textContent = post.username;
    if (quoteTime != null) quoteTime.textContent = post.time;

    if (quoteText != null) {
        let safeText = sanitize(post.text || '');
        safeText = safeText.replace(/#(\w+)/g, '<span class="post-hashtag">#$1</span>');
        safeText = safeText.replace(/@(\w+)/g, '<span class="post-mention">@$1</span>');
        safeText = safeText.replace(/\n/g, '<br>');
        quoteText.innerHTML = safeText;
    }

    // show nested quote if original post has one
    if (quoteNested != null) {
        if (post.quote != null) {
            let nestedAvatar = document.getElementById('shareQuoteNestedAvatar');
            let nestedUsername = document.getElementById('shareQuoteNestedUsername');
            let nestedText = document.getElementById('shareQuoteNestedText');
            if (nestedAvatar != null) nestedAvatar.src = post.quote.avatar;
            if (nestedUsername != null) nestedUsername.textContent = post.quote.username;
            if (nestedText != null) {
                let safeNested = sanitize(post.quote.text || '');
                if (post.quote.highlight) {
                    let safeHighlight = sanitize(post.quote.highlight);
                    safeNested = safeNested.replace(safeHighlight, '<span class="highlight">' + safeHighlight + '</span>');
                }
                nestedText.innerHTML = safeNested;
            }
            quoteNested.style.display = 'block';
        } else {
            quoteNested.style.display = 'none';
        }
    }

    // show image if exists
    if (quoteImage != null && quoteImg != null) {
        if (post.image != null) {
            quoteImg.src = post.image;
            quoteImage.style.display = 'block';
        } else if (post.images != null && post.images.length > 0) {
            quoteImg.src = post.images[0];
            quoteImage.style.display = 'block';
        } else {
            quoteImage.style.display = 'none';
        }
    }

    if (preview != null) preview.style.display = 'block';

    // change textarea placeholder
    let textarea = document.getElementById('createPostText');
    if (textarea != null) {
        textarea.placeholder = 'Share your thoughts...';
        textarea.value = '';
    }

    // enable post button since we have a quote
    let postBtn = document.getElementById('createPostSubmit');
    if (postBtn != null) {
        postBtn.disabled = false;
        postBtn.removeAttribute('disabled');
    }

    openModal();
}

// check if create post modal has unsaved content
function modalHasContent() {
    let textarea = document.getElementById('createPostText');
    let preview = document.getElementById('createPostImagePreview');
    let hasText = textarea != null && textarea.value.trim() != '';
    let hasImages = preview != null && preview.querySelectorAll('.create-post-image-item').length > 0;
    return hasText || hasImages;
}

// show save to drafts confirmation dialog
function showDraftsConfirm() {
    let overlay = document.getElementById('draftsConfirmOverlay');
    if (overlay != null) {
        overlay.classList.add('active');
    }
}

// hide save to drafts confirmation dialog
function hideDraftsConfirm() {
    let overlay = document.getElementById('draftsConfirmOverlay');
    if (overlay != null) {
        overlay.classList.remove('active');
    }
}

// save current post as draft to localStorage
function saveDraft() {
    let textarea = document.getElementById('createPostText');
    let preview = document.getElementById('createPostImagePreview');
    let text = textarea != null ? textarea.value.trim() : '';
    let images = [];
    if (preview != null) {
        let imgElements = preview.querySelectorAll('.create-post-image-item img');
        for (let i = 0; i < imgElements.length; i++) {
            if (imgElements[i].src && imgElements[i].src != '') {
                images.push(imgElements[i].src);
            }
        }
    }
    if (text == '' && images.length == 0) return;

    let drafts = [];
    try {
        let stored = localStorage.getItem('threads_drafts');
        if (stored != null) {
            drafts = JSON.parse(stored);
        }
    } catch(e) {}

    drafts.unshift({
        text: text,
        images: images,
        savedAt: Date.now()
    });

    localStorage.setItem('threads_drafts', JSON.stringify(drafts));
}

// clear the create post form
function clearCreatePostForm() {
    let textarea = document.getElementById('createPostText');
    let imagePreview = document.getElementById('createPostImagePreview');
    let fileInput = document.getElementById('createPostImage');
    let postBtn = document.getElementById('createPostSubmit');
    let addThreadText = document.querySelector('.add-thread-text');
    let addThreadAvatar = document.getElementById('addThreadAvatar');
    if (textarea != null) textarea.value = '';
    if (imagePreview != null) {
        imagePreview.innerHTML = '';
        imagePreview.style.display = 'none';
    }
    if (fileInput != null) fileInput.value = '';
    if (postBtn != null) {
        postBtn.disabled = true;
        postBtn.setAttribute('disabled', '');
    }
    if (addThreadText != null) addThreadText.classList.remove('active');
    if (addThreadAvatar != null) addThreadAvatar.classList.remove('active');
}

// close modal
function closeModal() {
    let modal = document.getElementById('modalOverlay');
    if (modal != null) {
        modal.classList.remove('active');
        modal.classList.remove('from-fab');
    }
    // show fab again
    let fab = document.getElementById('fab');
    if (fab != null) { fab.style.display = ''; }
    // reset drafts view back to create post
    let draftsView = document.getElementById('draftsView');
    let createPostForm = document.getElementById('createPostForm');
    if (draftsView != null) { draftsView.style.display = 'none'; }
    if (createPostForm != null) { createPostForm.style.display = ''; }
    // hide share quote preview and reset placeholder
    let sharePreview = document.getElementById('shareQuotePreview');
    if (sharePreview != null) sharePreview.style.display = 'none';
    shareTargetPost = null;
    let textarea = document.getElementById('createPostText');
    if (textarea != null) textarea.placeholder = "What's new?";
    // reset post button to disabled
    let postBtn = document.getElementById('createPostSubmit');
    if (postBtn != null) postBtn.disabled = true;
}

// reply modal - current post being replied to
let replyTargetPost = null;

// open reply modal
function openReplyModal(post) {
    replyTargetPost = post;
    let overlay = document.getElementById('replyModalOverlay');
    if (overlay == null) return;

    // set original post info
    let origAvatar = document.getElementById('replyOriginalAvatar');
    let origUsername = document.getElementById('replyOriginalUsername');
    let origTime = document.getElementById('replyOriginalTime');
    let origText = document.getElementById('replyOriginalText');
    let origImage = document.getElementById('replyOriginalImage');
    let origImg = document.getElementById('replyOriginalImg');

    if (origAvatar != null) origAvatar.src = post.avatar;
    if (origUsername != null) origUsername.textContent = post.username;
    if (origTime != null) origTime.textContent = post.time;
    if (origText != null) {
        let safeText = sanitize(post.text || '');
        safeText = safeText.replace(/#(\w+)/g, '<span class="post-hashtag">#$1</span>');
        safeText = safeText.replace(/@(\w+)/g, '<span class="post-mention">@$1</span>');
        safeText = safeText.replace(/\n/g, '<br>');
        origText.innerHTML = safeText;
    }

    // show image if exists
    if (origImage != null && origImg != null) {
        if (post.image != null) {
            origImg.src = post.image;
            origImage.style.display = 'block';
        } else if (post.images != null && post.images.length > 0) {
            origImg.src = post.images[0];
            origImage.style.display = 'block';
        } else {
            origImage.style.display = 'none';
        }
    }

    // set current user info
    let replyAvatar = document.getElementById('replyUserAvatar');
    let replyUsername = document.getElementById('replyUsername');
    let replyThreadAvatar = document.getElementById('replyAddThreadAvatar');
    let replyTextarea = document.getElementById('replyTextarea');

    if (replyAvatar != null && currentUser != null) replyAvatar.src = currentUser.avatar;
    if (replyUsername != null && currentUser != null) replyUsername.textContent = currentUser.username;
    if (replyThreadAvatar != null && currentUser != null) replyThreadAvatar.src = currentUser.avatar;
    if (replyTextarea != null) {
        replyTextarea.placeholder = 'Reply to ' + post.username + '...';
        replyTextarea.value = '';
        replyTextarea.style.height = 'auto';
    }

    // reset image preview
    let preview = document.getElementById('replyImagePreview');
    if (preview != null) preview.style.display = 'none';

    overlay.classList.add('active');

    if (replyTextarea != null) {
        setTimeout(function() { replyTextarea.focus(); }, 100);
    }
}

// close reply modal
function closeReplyModal() {
    let overlay = document.getElementById('replyModalOverlay');
    if (overlay != null) {
        overlay.classList.remove('active');
    }
    replyTargetPost = null;
    let textarea = document.getElementById('replyTextarea');
    if (textarea != null) textarea.value = '';
    let preview = document.getElementById('replyImagePreview');
    if (preview != null) preview.style.display = 'none';
}

// submit reply
function submitReply() {
    if (currentUser == null || replyTargetPost == null) return;
    let textarea = document.getElementById('replyTextarea');
    if (textarea == null) return;
    let text = textarea.value.trim();

    // collect reply image if attached
    let replyImage = null;
    let previewImg = document.getElementById('replyPreviewImg');
    let previewContainer = document.getElementById('replyImagePreview');
    if (previewContainer != null && previewContainer.style.display != 'none' && previewImg != null && previewImg.src && previewImg.src != '') {
        replyImage = previewImg.src;
    }

    // require text or image
    if (text == '' && replyImage == null) return;

    // check rate limit
    let rateCheck = postRateLimiter.check();
    if (!rateCheck.allowed) {
        alert(rateCheck.message);
        return;
    }

    text = text.substring(0, 2200);

    // increment reply count on the target post
    for (let i = 0; i < feedPosts.length; i++) {
        if (feedPosts[i].id == replyTargetPost.id) {
            feedPosts[i].replies = feedPosts[i].replies + 1;
            break;
        }
    }

    // update the reply count in the UI
    let btn = document.querySelector('.comment-btn[data-id="' + replyTargetPost.id + '"]');
    if (btn != null) {
        let span = btn.querySelector('span');
        let post = null;
        for (let i = 0; i < feedPosts.length; i++) {
            if (feedPosts[i].id == replyTargetPost.id) {
                post = feedPosts[i];
                break;
            }
        }
        if (post != null) {
            if (span == null) {
                span = document.createElement('span');
                btn.appendChild(span);
            }
            span.textContent = post.replies;
        }
    }

    // save reply to localStorage for following feed
    let savedReplies = loadFromStorage('threads_user_replies');
    if (savedReplies == null) savedReplies = [];
    let replyEntry = {
        id: 'reply_' + replyTargetPost.id + '_' + Date.now(),
        type: 'reply',
        repliedBy: currentUser != null ? currentUser.username : 'you',
        repliedAt: Date.now(),
        userText: text,
        replyImage: replyImage,
        originalPost: {
            id: replyTargetPost.id,
            username: replyTargetPost.username,
            name: replyTargetPost.name || replyTargetPost.username,
            avatar: replyTargetPost.avatar,
            verified: replyTargetPost.verified || false,
            text: replyTargetPost.text || '',
            image: replyTargetPost.image || null,
            images: replyTargetPost.images || null,
            quote: replyTargetPost.quote || null,
            time: replyTargetPost.time,
            likes: replyTargetPost.likes,
            replies: replyTargetPost.replies,
            reposts: replyTargetPost.reposts,
            shares: replyTargetPost.shares,
            hasTranslate: replyTargetPost.hasTranslate || false
        }
    };
    savedReplies.unshift(replyEntry);
    saveToStorage('threads_user_replies', savedReplies);

    closeReplyModal();
    showPostToast('posting');
    setTimeout(function() {
        showPostToast('posted');
    }, 1500);
}

// get search suggestions
function getSearchSuggestions() {
    return [
        { id: 101, username: 'womenqu0tes', name: 'Women Quotes', followers: '120K followers', avatar: 'images/avatar1.jpg', verified: false },
        { id: 102, username: 'druwmelo', name: 'Andrew Melo', followers: '15.2K followers', avatar: 'images/avatar2.jpg', verified: true },
        { id: 103, username: 'techvibes', name: 'Tech Vibes', followers: '89.4K followers', avatar: 'images/avatar3.jpg', verified: true },
        { id: 104, username: 'fitnessgroup', name: 'Fitness Group', followers: '234K followers', avatar: 'images/avatar4.jpg', verified: false },
        { id: 105, username: 'artdaily', name: 'Art Daily', followers: '567K followers', avatar: 'images/avatar5.jpg', verified: true },
        { id: 106, username: 'coffeedelife', name: 'Coffee De Life', followers: '45.8K followers', avatar: 'images/avatar1.jpg', verified: false },
        { id: 107, username: 'travelnow', name: 'Travel Now', followers: '892K followers', avatar: 'images/avatar2.jpg', verified: true },
        { id: 108, username: 'musicvibes', name: 'Music Vibes', followers: '156K followers', avatar: 'images/avatar3.jpg', verified: false }
    ];
}

// render search suggestions
function renderSearchSuggestions() {
    let container = document.getElementById('searchSuggestionsList');
    if (container == null) {
        return;
    }
    container.innerHTML = '';
    let suggestions = getSearchSuggestions();

    for (let i = 0; i < suggestions.length; i++) {
        let user = suggestions[i];
        let userEl = document.createElement('div');
        userEl.className = 'search-suggestion-item';

        // build verified html
        let verifiedHtml = '';
        if (user.verified == true) {
            verifiedHtml = '<svg class="verified-badge" width="12" height="12" viewBox="0 0 24 24" fill="#0095F6"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
        }

        let html = '';
        html = html + '<img src="' + user.avatar + '" alt="' + user.username + '" class="search-suggestion-avatar">';
        html = html + '<div class="search-suggestion-info">';
        html = html + '<div class="search-suggestion-username">';
        html = html + '<span>' + user.username + '</span>';
        html = html + verifiedHtml;
        html = html + '</div>';
        html = html + '<span class="search-suggestion-name">' + user.name + '</span>';
        html = html + '<span class="search-suggestion-followers">' + user.followers + '</span>';
        html = html + '</div>';
        html = html + '<button class="search-suggestion-follow-btn">Follow</button>';

        userEl.innerHTML = html;

        // add follow button click
        let followBtn = userEl.querySelector('.search-suggestion-follow-btn');
        followBtn.onclick = function(e) {
            e.stopPropagation();
            if (this.classList.contains('following')) {
                this.classList.remove('following');
                this.textContent = 'Follow';
                // remove from saved follows
                let saved = JSON.parse(localStorage.getItem('threads_follows') || '[]');
                saved = saved.filter(function(f) { return f.id !== user.id; });
                localStorage.setItem('threads_follows', JSON.stringify(saved));
            } else {
                this.classList.add('following');
                this.textContent = 'Following';
                // save follow to localStorage for activity page
                let saved = JSON.parse(localStorage.getItem('threads_follows') || '[]');
                let exists = false;
                for (let j = 0; j < saved.length; j++) {
                    if (saved[j].id === user.id) { exists = true; break; }
                }
                if (!exists) {
                    saved.push({
                        id: user.id,
                        username: user.username,
                        avatar: user.avatar,
                        time: 'now'
                    });
                    localStorage.setItem('threads_follows', JSON.stringify(saved));
                }
            }
        };

        container.appendChild(userEl);
    }
}

// create suggested section html
function createSuggestedSection() {
    let html = '<div class="suggested-section" id="suggestedSection">';
    html = html + '<h3 class="suggested-title">Suggested for you</h3>';
    html = html + '<div class="suggested-users-wrapper">';
    html = html + '<div class="suggested-users" id="suggestedUsers"></div>';
    html = html + '</div>';
    html = html + '</div>';
    return html;
}

// create ghost empty state
function createGhostEmptyState() {
    let html = '<div class="ghost-empty-state" id="ghostEmptyState">';
    html = html + '<div class="ghost-icon">';
    html = html + '<svg width="80" height="80" viewBox="0 0 20 19" fill="currentColor">';
    html = html + '<path d="M4.60249 16.4045C4.86284 16.0252 5.38193 15.9287 5.76134 16.1888C6.1495 16.4552 6.56424 16.6861 6.99995 16.8765C7.4757 17.0843 7.97782 17.2443 8.49897 17.3501C8.94984 17.4417 9.24062 17.8823 9.1492 18.3332C9.0575 18.784 8.61788 19.0757 8.16694 18.9842C7.52911 18.8547 6.9149 18.6584 6.33263 18.404C5.79943 18.171 5.29237 17.8888 4.81814 17.5633C4.43901 17.3028 4.34214 16.7838 4.60249 16.4045Z"></path>';
    html = html + '<path d="M14.2379 16.1888C14.6172 15.9285 15.1362 16.0253 15.3968 16.4045C15.6572 16.7839 15.5606 17.3029 15.1811 17.5633C14.7068 17.8888 14.1999 18.171 13.6666 18.404C13.0843 18.6584 12.4702 18.8547 11.8323 18.9842C11.3814 19.0756 10.9408 18.784 10.8492 18.3332C10.7579 17.8824 11.0496 17.4418 11.5003 17.3501C12.0215 17.2443 12.5235 17.0843 12.9993 16.8765C13.4351 16.686 13.8497 16.4553 14.2379 16.1888Z"></path>';
    html = html + '<path d="M1.6671 10.8503C2.11797 10.7587 2.55758 11.0506 2.64936 11.5013C2.75515 12.0225 2.91515 12.5246 3.12299 13.0003C3.31653 13.4433 3.55247 13.8647 3.82449 14.2585C4.08586 14.6371 3.99064 15.1558 3.61209 15.4173C3.23352 15.6786 2.71482 15.5841 2.45323 15.2057C2.12096 14.7248 1.83313 14.2096 1.5963 13.6676C1.34194 13.0854 1.14555 12.4711 1.01606 11.8333C0.924746 11.3825 1.21638 10.942 1.6671 10.8503Z"></path>';
    html = html + '<path d="M9.99962 0.833984C15.0621 0.833995 19.1661 4.93817 19.1663 10.0007C19.1663 10.6273 19.1035 11.2407 18.9832 11.8333C18.8537 12.4712 18.6574 13.0853 18.4029 13.6676C18.1661 14.2098 17.8784 14.7247 17.546 15.2057C17.2844 15.5842 16.7657 15.6787 16.3872 15.4173C16.0089 15.1557 15.9135 14.637 16.1748 14.2585C16.4469 13.8646 16.6827 13.4434 16.8762 13.0003C17.0841 12.5245 17.2441 12.0226 17.3499 11.5013C17.4481 11.0172 17.4996 10.5153 17.4996 10.0007C17.4995 5.85864 14.1417 2.50066 9.99962 2.50065C8.8214 2.50071 7.70832 2.77171 6.71837 3.25423L6.5963 3.30225C6.4708 3.34043 6.33684 3.34834 6.20649 3.32503L2.70307 2.69922L3.33865 6.17334C3.3709 6.34936 3.34609 6.53119 3.26704 6.69173C2.93406 7.3678 2.69972 8.10131 2.58344 8.87354C2.51495 9.32865 2.09048 9.64271 1.63536 9.57422C1.18062 9.50551 0.867211 9.08097 0.935494 8.62614C1.06319 7.77778 1.30818 6.96719 1.65164 6.21159L0.846789 1.81706C0.797783 1.54853 0.882883 1.27241 1.07547 1.07894C1.26812 0.885461 1.54399 0.799138 1.81277 0.847005L6.24148 1.63883C7.38929 1.12218 8.66189 0.834039 9.99962 0.833984Z"></path>';
    html = html + '<path d="M13.1572 10.974C13.4826 10.6486 14.0101 10.6485 14.3356 10.974C14.6608 11.2994 14.6609 11.8269 14.3356 12.1523C13.7273 12.7606 12.87 13.0214 12.0797 13.0215C11.2894 13.0215 10.4321 12.7606 9.82384 12.1523C9.4984 11.8269 9.4984 11.2994 9.82384 10.974C10.1493 10.6486 10.6768 10.6485 11.0022 10.974C11.2273 11.1989 11.6202 11.3548 12.0797 11.3548C12.5392 11.3548 12.9322 11.1989 13.1572 10.974Z"></path>';
    html = html + '<path d="M14.7913 7.81966C15.3664 7.82039 15.8318 8.28705 15.8313 8.86214C15.8306 9.43723 15.364 9.90285 14.7888 9.90218C14.2137 9.9016 13.7482 9.43482 13.7488 8.8597C13.7494 8.28458 14.2162 7.8191 14.7913 7.81966Z"></path>';
    html = html + '<path d="M9.37543 7.81315C9.95079 7.81371 10.4169 8.28038 10.4163 8.85563C10.4157 9.43071 9.94895 9.89624 9.37381 9.89567C8.79875 9.89509 8.33245 9.42827 8.33295 8.85319C8.33372 8.27828 8.80075 7.81275 9.37543 7.81315Z"></path>';
    html = html + '</svg>';
    html = html + '</div>';
    html = html + '<h2 class="ghost-title">No ghost posts yet</h2>';
    html = html + '<p class="ghost-description">Ghost posts are archived after 24 hours. Replies go to messages, and only you can see who liked and replied.</p>';
    html = html + '</div>';
    return html;
}

// init suggested cards
function initSuggestedCards() {
    let container = document.getElementById('suggestedUsers');
    if (container == null) {
        return;
    }

    let users = [
        { name: 'Sergo Chivadze', username: 'sergo_chivadze', avatar: 'images/avatar1.jpg', verified: false },
        { name: 'Dr. Giorgi', username: 'dr.samkharadze', avatar: 'images/avatar2.jpg', verified: false },
        { name: 'nickc_arter', username: 'nickc_arter7389', avatar: 'images/avatar3.jpg', verified: false },
        { name: 'lauraclery', username: 'lauraclery', avatar: 'images/avatar4.jpg', verified: true },
        { name: 'techguru', username: 'techguru', avatar: 'images/avatar5.jpg', verified: false }
    ];

    for (let i = 0; i < users.length; i++) {
        let user = users[i];
        let verifiedBadge = '';
        if (user.verified == true) {
            verifiedBadge = '<svg class="verified-badge" width="14" height="14" viewBox="0 0 24 24" fill="#0095F6"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
        }

        let card = document.createElement('div');
        card.className = 'suggested-user-card';
        let html = '';
        html = html + '<button class="suggested-close-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
        html = html + '<img src="' + user.avatar + '" class="suggested-avatar">';
        html = html + '<div class="suggested-name">' + user.name + verifiedBadge + '</div>';
        html = html + '<div class="suggested-username">' + user.username + '</div>';
        html = html + '<button class="suggested-follow-btn">Follow</button>';
        card.innerHTML = html;

        // add close button click
        card.querySelector('.suggested-close-btn').onclick = function(e) {
            e.stopPropagation();
            card.remove();
        };

        container.appendChild(card);
    }
}

// clean up big images from old posts so storage doesnt get full
function cleanupOldPosts() {
    let raw = localStorage.getItem('threads_user_posts');
    if (raw == null) return;
    let posts = JSON.parse(raw);
    let changed = false;
    for (let i = 0; i < posts.length; i++) {
        if (posts[i].images && posts[i].images.length > 0) {
            let cleaned = [];
            for (let j = 0; j < posts[i].images.length; j++) {
                if (posts[i].images[j] && posts[i].images[j].length > 200000) {
                    changed = true;
                } else if (posts[i].images[j] && posts[i].images[j] != '') {
                    cleaned.push(posts[i].images[j]);
                }
            }
            posts[i].images = cleaned;
        }
        if (posts[i].image && posts[i].image.length > 200000) {
            posts[i].image = '';
            changed = true;
        }
    }
    if (changed) {
        localStorage.setItem('threads_user_posts', JSON.stringify(posts));
    }
}

function openCreateFeedPanel(post) {
    let overlay = document.getElementById('createFeedOverlay');
    let profiles = document.getElementById('createFeedProfiles');
    let nameInput = document.getElementById('createFeedName');
    let descInput = document.getElementById('createFeedDesc');
    let countEl = document.getElementById('createFeedProfileCount');
    if (overlay == null) return;

    // reset
    if (nameInput != null) nameInput.value = '';
    if (descInput != null) descInput.value = '';
    if (countEl != null) countEl.textContent = '1 profile';

    // add post author as profile
    if (profiles != null && post != null) {
        let safeUsername = post.username || '';
        let safeAvatar = post.avatar || '';
        profiles.innerHTML = '<div class="create-feed-profile-row">' +
            '<img src="' + encodeURI(safeAvatar) + '" class="create-feed-profile-avatar" alt="">' +
            '<div class="create-feed-profile-info">' +
            '<p class="create-feed-profile-name">' + safeUsername + '</p>' +
            '<p class="create-feed-profile-handle">' + safeUsername + '</p>' +
            '</div>' +
            '<button class="create-feed-remove-btn">Remove</button>' +
            '</div>';
    }

    // remove button handler
    let removeBtn = profiles.querySelector('.create-feed-remove-btn');
    if (removeBtn != null) {
        removeBtn.onclick = function() {
            profiles.innerHTML = '';
            if (countEl != null) countEl.style.display = 'none';
        };
    }

    overlay.classList.add('active');
}

function closeCreateFeedPanel() {
    let overlay = document.getElementById('createFeedOverlay');
    if (overlay != null) {
        overlay.classList.remove('active');
    }
}

function closeAllPostMenus() {
    let allDropdowns = document.querySelectorAll('.post-menu-dropdown.active');
    for (let i = 0; i < allDropdowns.length; i++) {
        allDropdowns[i].classList.remove('active');
        // reset sub-menus
        let main = allDropdowns[i].querySelector('.post-menu-main');
        let sub = allDropdowns[i].querySelector('.post-menu-sub');
        if (main != null) main.style.display = '';
        if (sub != null) sub.style.display = 'none';
    }
    let overlay = document.getElementById('postMenuOverlay');
    if (overlay != null) {
        overlay.classList.remove('active');
    }
}

function init() {
    console.log("init starting");

    // create post menu overlay for mobile
    if (document.getElementById('postMenuOverlay') == null) {
        let overlay = document.createElement('div');
        overlay.className = 'post-menu-overlay';
        overlay.id = 'postMenuOverlay';
        overlay.onclick = function() {
            closeAllPostMenus();
        };
        document.body.appendChild(overlay);
    }

    // create feed panel events
    let createFeedOverlay = document.getElementById('createFeedOverlay');
    let createFeedDoneBtn = document.getElementById('createFeedDoneBtn');
    if (createFeedOverlay != null) {
        createFeedOverlay.onclick = function(e) {
            if (e.target === createFeedOverlay) {
                closeCreateFeedPanel();
            }
        };
    }
    if (createFeedDoneBtn != null) {
        createFeedDoneBtn.onclick = function() {
            closeCreateFeedPanel();
        };
    }

    // create feed - add topics/profiles search view
    let createFeedAddBtn = document.getElementById('createFeedAddBtn');
    let createFeedSearchView = document.getElementById('createFeedSearchView');
    let createFeedSearchCancel = document.getElementById('createFeedSearchCancel');
    let createFeedSearchBackBtn = document.getElementById('createFeedSearchBackBtn');

    // elements to hide when search view is shown
    let createFeedMainElements = document.querySelectorAll('.create-feed-section, .create-feed-divider, .create-feed-add-btn, .create-feed-profiles, #createFeedDoneBtn');

    if (createFeedAddBtn != null && createFeedSearchView != null) {
        createFeedAddBtn.onclick = function() {
            for (let i = 0; i < createFeedMainElements.length; i++) {
                createFeedMainElements[i].style.display = 'none';
            }
            createFeedSearchView.style.display = 'flex';
        };
    }

    function hideSearchView() {
        if (createFeedSearchView != null) {
            createFeedSearchView.style.display = 'none';
        }
        for (let i = 0; i < createFeedMainElements.length; i++) {
            createFeedMainElements[i].style.display = '';
        }
        // reset chips, calendar, filter dropdown
        let cfChips = document.getElementById('createFeedSearchChips');
        if (cfChips != null) cfChips.innerHTML = '';
        let cfCal = document.getElementById('createFeedCalendarPicker');
        if (cfCal != null) cfCal.classList.remove('active');
        let cfDrop = document.getElementById('createFeedFilterDropdown');
        if (cfDrop != null) cfDrop.classList.remove('active');
        let cfInput = document.getElementById('createFeedSearchInput');
        if (cfInput != null) cfInput.value = '';
    }

    if (createFeedSearchCancel != null) {
        createFeedSearchCancel.onclick = function() {
            hideSearchView();
        };
    }
    if (createFeedSearchBackBtn != null) {
        createFeedSearchBackBtn.onclick = function() {
            hideSearchView();
        };
    }

    // create feed - filter dropdown + chips + calendar
    let createFeedFilterBtn = document.getElementById('createFeedFilterBtn');
    let createFeedFilterDropdown = document.getElementById('createFeedFilterDropdown');
    let cfSearchChips = document.getElementById('createFeedSearchChips');
    let cfCalendarPicker = document.getElementById('createFeedCalendarPicker');
    let cfCalendarGrid = document.getElementById('cfCalendarGrid');
    let cfCalendarMonthYear = document.getElementById('cfCalendarMonthYear');
    let cfCalendarPrev = document.getElementById('cfCalendarPrev');
    let cfCalendarNext = document.getElementById('cfCalendarNext');
    let cfCalendarMonth = new Date().getMonth();
    let cfCalendarYear = new Date().getFullYear();
    let cfCalendarFilterType = null;

    function cfFormatDate(date) {
        return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
    }

    function cfAddChip(type, value) {
        if (cfSearchChips == null) return;
        let existing = cfSearchChips.querySelector('[data-type="' + type + '"]');
        if (existing != null) existing.remove();

        let chip = document.createElement('div');
        chip.className = 'search-chip';
        chip.dataset.type = type;

        let label = 'From';
        if (type == 'after') label = 'After';
        else if (type == 'before') label = 'Before';

        if (type == 'profile') {
            chip.innerHTML = '<span class="search-chip-label">' + label + '</span>' +
                '<input class="search-chip-input" type="text" placeholder="Profile" value="">' +
                '<button class="search-chip-remove"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
        } else {
            chip.innerHTML = '<span class="search-chip-label">' + label + '</span>' +
                '<span class="search-chip-value">' + sanitize(value) + '</span>' +
                '<button class="search-chip-remove"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
        }

        chip.querySelector('.search-chip-remove').onclick = function(e) {
            e.stopPropagation();
            chip.remove();
            if (cfCalendarPicker != null) cfCalendarPicker.classList.remove('active');
        };

        if (type == 'after' || type == 'before') {
            chip.onclick = function(e) {
                if (e.target.closest('.search-chip-remove')) return;
                e.stopPropagation();
                cfShowCalendar(type);
            };
        }

        if (type == 'profile') {
            chip.onclick = function(e) {
                if (e.target.closest('.search-chip-remove')) return;
                e.stopPropagation();
                let inp = chip.querySelector('.search-chip-input');
                if (inp != null) inp.focus();
            };
        }

        cfSearchChips.appendChild(chip);
    }

    function cfRenderCalendar() {
        if (cfCalendarGrid == null || cfCalendarMonthYear == null) return;
        cfCalendarMonthYear.textContent = fullMonths[cfCalendarMonth] + ' ' + cfCalendarYear;
        cfCalendarGrid.innerHTML = '';

        let firstDay = new Date(cfCalendarYear, cfCalendarMonth, 1).getDay();
        let daysInMonth = new Date(cfCalendarYear, cfCalendarMonth + 1, 0).getDate();
        let today = new Date();

        for (let i = 0; i < firstDay; i++) {
            let empty = document.createElement('div');
            empty.className = 'calendar-day empty';
            cfCalendarGrid.appendChild(empty);
        }

        for (let d = 1; d <= daysInMonth; d++) {
            let btn = document.createElement('button');
            btn.className = 'calendar-day';
            btn.textContent = d;
            if (d == today.getDate() && cfCalendarMonth == today.getMonth() && cfCalendarYear == today.getFullYear()) {
                btn.classList.add('today');
            }
            btn.dataset.day = d;
            btn.onclick = function() {
                let picked = new Date(cfCalendarYear, cfCalendarMonth, parseInt(this.dataset.day));
                cfAddChip(cfCalendarFilterType, cfFormatDate(picked));
                cfCalendarPicker.classList.remove('active');
            };
            cfCalendarGrid.appendChild(btn);
        }
    }

    function cfShowCalendar(type) {
        if (cfCalendarPicker == null) return;
        if (cfCalendarPicker.classList.contains('active') && cfCalendarFilterType == type) {
            cfCalendarPicker.classList.remove('active');
            return;
        }
        cfCalendarFilterType = type;
        cfCalendarMonth = new Date().getMonth();
        cfCalendarYear = new Date().getFullYear();
        cfRenderCalendar();
        cfCalendarPicker.classList.add('active');
    }

    if (cfCalendarPrev != null) {
        cfCalendarPrev.onclick = function(e) {
            e.stopPropagation();
            cfCalendarMonth--;
            if (cfCalendarMonth < 0) { cfCalendarMonth = 11; cfCalendarYear--; }
            cfRenderCalendar();
        };
    }
    if (cfCalendarNext != null) {
        cfCalendarNext.onclick = function(e) {
            e.stopPropagation();
            cfCalendarMonth++;
            if (cfCalendarMonth > 11) { cfCalendarMonth = 0; cfCalendarYear++; }
            cfRenderCalendar();
        };
    }

    if (createFeedFilterBtn != null && createFeedFilterDropdown != null) {
        createFeedFilterBtn.onclick = function(e) {
            e.stopPropagation();
            createFeedFilterDropdown.classList.toggle('active');
            if (cfCalendarPicker != null) cfCalendarPicker.classList.remove('active');
        };

        let cfFilterItems = createFeedFilterDropdown.querySelectorAll('.search-filter-item');
        if (cfFilterItems[0] != null) {
            cfFilterItems[0].onclick = function(e) {
                e.stopPropagation();
                createFeedFilterDropdown.classList.remove('active');
                cfAddChip('after', cfFormatDate(new Date()));
            };
        }
        if (cfFilterItems[1] != null) {
            cfFilterItems[1].onclick = function(e) {
                e.stopPropagation();
                createFeedFilterDropdown.classList.remove('active');
                cfAddChip('before', cfFormatDate(new Date()));
            };
        }
        if (cfFilterItems[2] != null) {
            cfFilterItems[2].onclick = function(e) {
                e.stopPropagation();
                createFeedFilterDropdown.classList.remove('active');
                cfAddChip('profile', 'Profile');
                let cfInput = document.getElementById('createFeedSearchInput');
                if (cfInput != null) cfInput.focus();
            };
        }

        document.addEventListener('click', function(e) {
            if (createFeedFilterDropdown.contains(e.target) == false && createFeedFilterBtn.contains(e.target) == false) {
                createFeedFilterDropdown.classList.remove('active');
            }
            if (cfCalendarPicker != null && cfCalendarPicker.contains(e.target) == false && createFeedFilterDropdown.contains(e.target) == false && createFeedFilterBtn.contains(e.target) == false && (cfSearchChips == null || cfSearchChips.contains(e.target) == false)) {
                cfCalendarPicker.classList.remove('active');
            }
        });
    }

    // clean up old oversized images from storage
    cleanupOldPosts();

    // check if logged in
    let isLoggedIn = localStorage.getItem('threads_is_logged_in');
    if (isLoggedIn != 'true') {
        console.log("not logged in");
        window.location.href = 'login.html';
        return;
    }

    currentUser = loadFromStorage('threads_user');

    // set user avatar in composer
    let composerAvatar = document.getElementById('composerAvatar');
    if (composerAvatar != null && currentUser != null) {
        composerAvatar.src = currentUser.avatar;
    }

    // show loading spinner
    let updateBar = document.getElementById('feedUpdateBar');
    if (updateBar != null) {
        updateBar.classList.add('active');
    }

    // load posts - only other users posts, not my own
    let samplePosts = getSamplePosts();
    feedPosts = [];
    for (let i = 0; i < samplePosts.length; i++) {
        feedPosts.push(samplePosts[i]);
    }

    setTimeout(function() {
        try { renderFeed(); } catch(e) { console.log("renderFeed error:", e); }
        if (updateBar != null) {
            updateBar.classList.remove('active');
        }
    }, 1200);

    // close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        // close post menu dropdowns
        if (e.target.closest('.post-menu-container') == null) {
            closeAllPostMenus();
        }
        // close repost dropdowns
        if (e.target.closest('.repost-container') == null) {
            let allRepost = document.querySelectorAll('.repost-dropdown.active');
            for (let i = 0; i < allRepost.length; i++) {
                allRepost[i].classList.remove('active');
            }
        }
        // close thread post more dropdowns
        if (e.target.closest('.thread-post-more-container') == null) {
            let allTpDropdowns = document.querySelectorAll('.thread-post-more-dropdown.active');
            for (let i = 0; i < allTpDropdowns.length; i++) {
                allTpDropdowns[i].classList.remove('active');
            }
        }
    });

    // composer click
    let composer = document.getElementById('composer');
    if (composer != null) {
        composer.onclick = function() {
            let modal = document.getElementById('modalOverlay');
            if (modal != null) {
                modal.classList.remove('from-fab');
            }
            openModal();
        };
    }

    // fab click
    let fab = document.getElementById('fab');
    if (fab != null) {
        fab.onclick = function() {
            let modal = document.getElementById('modalOverlay');
            if (modal != null) {
                modal.classList.add('from-fab');
            }
            fab.style.display = 'none';
            openModal();
        };
    }

    // modal close (Cancel button)
    let createPostClose = document.getElementById('createPostClose');
    if (createPostClose != null) {
        createPostClose.onclick = function() {
            if (modalHasContent()) {
                showDraftsConfirm();
            } else {
                clearCreatePostForm();
                closeModal();
            }
        };
    }

    // modal overlay click
    let modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay != null) {
        modalOverlay.onclick = function(e) {
            if (e.target == modalOverlay) {
                if (modalHasContent()) {
                    showDraftsConfirm();
                } else {
                    closeModal();
                }
            }
        };
    }

    // drafts confirm dialog buttons
    let draftsConfirmSave = document.getElementById('draftsConfirmSave');
    let draftsConfirmDontSave = document.getElementById('draftsConfirmDontSave');
    let draftsConfirmCancel = document.getElementById('draftsConfirmCancel');

    if (draftsConfirmSave != null) {
        draftsConfirmSave.onclick = function() {
            // show loading spinner
            draftsConfirmSave.innerHTML = '<svg class="drafts-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>';
            draftsConfirmSave.disabled = true;
            draftsConfirmSave.style.pointerEvents = 'none';
            // save after brief delay to show animation
            setTimeout(function() {
                saveDraft();
                hideDraftsConfirm();
                clearCreatePostForm();
                closeModal();
                // reset button
                draftsConfirmSave.innerHTML = 'Save';
                draftsConfirmSave.disabled = false;
                draftsConfirmSave.style.pointerEvents = '';
                // show "Draft saved" toast
                let draftToast = document.getElementById('draftSavedToast');
                if (draftToast != null) {
                    draftToast.classList.add('active');
                    setTimeout(function() {
                        draftToast.classList.remove('active');
                    }, 2500);
                }
            }, 800);
        };
    }

    if (draftsConfirmDontSave != null) {
        draftsConfirmDontSave.onclick = function() {
            hideDraftsConfirm();
            clearCreatePostForm();
            closeModal();
        };
    }

    if (draftsConfirmCancel != null) {
        draftsConfirmCancel.onclick = function() {
            hideDraftsConfirm();
        };
    }

    // modal submit
    let createPostSubmit = document.getElementById('createPostSubmit');
    if (createPostSubmit != null) {
        createPostSubmit.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("Post button clicked");
            try {
                let textarea = document.getElementById('createPostText');
                let preview = document.getElementById('createPostImagePreview');
                if (textarea == null) { console.log("textarea not found"); return; }
                let text = textarea.value.trim();

                // collect all preview images
                let images = [];
                if (preview != null) {
                    let imgElements = preview.querySelectorAll('.create-post-image-item img');
                    for (let i = 0; i < imgElements.length; i++) {
                        if (imgElements[i].src && imgElements[i].src != '') {
                            images.push(imgElements[i].src);
                        }
                    }
                }

                let hasText = text != '';
                let hasImages = images.length > 0;
                console.log("hasText:", hasText, "hasImages:", hasImages);

                // if sharing a post, allow empty text
                if (shareTargetPost != null) {
                    // increment share count
                    for (let i = 0; i < feedPosts.length; i++) {
                        if (feedPosts[i].id == shareTargetPost.id) {
                            feedPosts[i].shares = feedPosts[i].shares + 1;
                            let shareBtn = document.querySelector('.share-btn[data-id="' + shareTargetPost.id + '"]');
                            if (shareBtn != null) {
                                let span = shareBtn.querySelector('span');
                                if (span == null) {
                                    span = document.createElement('span');
                                    shareBtn.appendChild(span);
                                }
                                span.textContent = feedPosts[i].shares;
                            }
                            break;
                        }
                    }
                    let quoteData = {
                        username: shareTargetPost.username,
                        avatar: shareTargetPost.avatar,
                        text: shareTargetPost.text || '',
                        verified: shareTargetPost.verified || false
                    };
                    closeModal();
                    clearCreatePostForm();
                    showPostToast('posting');
                    setTimeout(function() {
                        try { createPost(text || '', images, quoteData); } catch(e) { console.log(e); }
                        showPostToast('posted');
                    }, 1200);
                } else if (hasText || hasImages) {
                    closeModal();
                    clearCreatePostForm();
                    showPostToast('posting');
                    setTimeout(function() {
                        try { createPost(text, images); } catch(e) { console.log(e); }
                        showPostToast('posted');
                    }, 1200);
                } else {
                    console.log("No text or images to post");
                }
            } catch(err) {
                console.log("Post submit error:", err);
            }
        });
        console.log("Post submit handler attached");
    } else {
        console.log("createPostSubmit button not found");
    }

    // image upload (multiple)
    let createPostImage = document.getElementById('createPostImage');
    if (createPostImage != null) {
        createPostImage.onchange = function(e) {
            let files = e.target.files;
            if (files == null || files.length == 0) return;
            let preview = document.getElementById('createPostImagePreview');
            if (preview == null) return;
            preview.style.display = 'flex';
            for (let f = 0; f < files.length; f++) {
                (function(file) {
                    let reader = new FileReader();
                    reader.onload = function(ev) {
                        compressImage(ev.target.result, function(compressedSrc) {
                            let item = document.createElement('div');
                            item.className = 'create-post-image-item';
                            let img = document.createElement('img');
                            img.src = compressedSrc;
                            img.alt = 'preview';
                            item.appendChild(img);
                            let removeBtn = document.createElement('button');
                            removeBtn.className = 'remove-image-btn';
                            removeBtn.innerHTML = '&times;';
                            removeBtn.onclick = function() {
                                item.remove();
                                // hide preview container if no images left
                                if (preview.children.length == 0) {
                                    preview.style.display = 'none';
                                    // disable Post button if no text either
                                    let textarea = document.getElementById('createPostText');
                                    let postBtn = document.getElementById('createPostSubmit');
                                    if (postBtn != null && textarea != null && textarea.value.trim() == '') {
                                        postBtn.disabled = true;
                                    }
                                }
                            };
                            item.appendChild(removeBtn);
                            preview.appendChild(item);
                        });
                    };
                    reader.readAsDataURL(file);
                })(files[f]);
            }
            // enable Post button
            let postBtn = document.getElementById('createPostSubmit');
            if (postBtn != null) {
                postBtn.disabled = false;
                postBtn.removeAttribute('disabled');
            }
            // reset file input so same files can be added again
            createPostImage.value = '';
        };
    }

    // reply modal close
    let replyPostClose = document.getElementById('replyPostClose');
    if (replyPostClose != null) {
        replyPostClose.onclick = function() {
            closeReplyModal();
        };
    }

    // reply modal overlay click
    let replyModalOverlay = document.getElementById('replyModalOverlay');
    if (replyModalOverlay != null) {
        replyModalOverlay.onclick = function(e) {
            if (e.target == replyModalOverlay) {
                closeReplyModal();
            }
        };
    }

    // reply submit
    let replySubmitBtn = document.getElementById('replySubmitBtn');
    if (replySubmitBtn != null) {
        replySubmitBtn.onclick = function() {
            submitReply();
        };
    }

    // reply image upload
    let replyImageInput = document.getElementById('replyImageInput');
    if (replyImageInput != null) {
        replyImageInput.onchange = function(e) {
            let file = e.target.files[0];
            if (file != null) {
                let reader = new FileReader();
                reader.onload = function(ev) {
                    compressImage(ev.target.result, function(compressedSrc) {
                        document.getElementById('replyPreviewImg').src = compressedSrc;
                        document.getElementById('replyImagePreview').style.display = 'block';
                    });
                };
                reader.readAsDataURL(file);
            }
        };
    }

    // reply remove image
    let replyRemoveImageBtn = document.getElementById('replyRemoveImageBtn');
    if (replyRemoveImageBtn != null) {
        replyRemoveImageBtn.onclick = function() {
            document.getElementById('replyImagePreview').style.display = 'none';
            document.getElementById('replyPreviewImg').src = '';
            document.getElementById('replyImageInput').value = '';
        };
    }

    // reply textarea auto-resize
    let replyTextarea = document.getElementById('replyTextarea');
    if (replyTextarea != null) {
        replyTextarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }

    // view button - show thread view
    let toastViewBtn = document.getElementById('toastViewBtn');
    let threadOverlay = document.getElementById('threadOverlay');
    let threadBackBtn = document.getElementById('threadBackBtn');
    let threadContent = document.getElementById('threadContent');
    let sideActionContainer = document.querySelector('.side-action-container');

    if (toastViewBtn != null) {
        toastViewBtn.onclick = function() {
            if (threadOverlay != null && threadContent != null) {
                // load all user posts
                let userPosts = loadFromStorage('threads_user_posts');
                if (userPosts == null) userPosts = [];

                // also add the pending post if not yet saved
                if (pendingNewPost != null) {
                    let found = false;
                    for (let i = 0; i < userPosts.length; i++) {
                        if (userPosts[i].id == pendingNewPost.id) { found = true; break; }
                    }
                    if (!found) userPosts.unshift(pendingNewPost);
                }

                let allHtml = '';
                for (let p = 0; p < userPosts.length; p++) {
                    let post = userPosts[p];
                    let safeUsername = sanitize(post.username);
                    let safeText = sanitize(post.text || '');
                    safeText = safeText.replace(/#(\w+)/g, '<span class="post-hashtag">#$1</span>');
                    safeText = safeText.replace(/@(\w+)/g, '<span class="post-mention">@$1</span>');
                    safeText = safeText.replace(/\n/g, '<br>');

                    let imageHtml = '';
                    if (post.images != null && post.images.length > 0) {
                        for (let im = 0; im < post.images.length; im++) {
                            imageHtml = imageHtml + '<img src="' + post.images[im] + '" alt="Post image" class="thread-post-image">';
                        }
                    } else if (post.image != null) {
                        if (post.image.indexOf('data:image') == 0 || post.image.match(/\.(jpg|jpeg|png|gif|webp)($|\?)/i)) {
                            imageHtml = '<img src="' + post.image + '" alt="Post image" class="thread-post-image">';
                        }
                    }

                    allHtml += '<div class="thread-post" data-id="' + post.id + '">';
                    allHtml += '<div class="thread-post-header">';
                    allHtml += '<img src="' + encodeURI(post.avatar) + '" class="thread-post-avatar" alt="">';
                    allHtml += '<span class="thread-post-username">' + safeUsername + '</span>';
                    allHtml += '<span class="thread-post-time">' + post.time + '</span>';
                    allHtml += '<div class="thread-post-more-container">';
                    allHtml += '<button class="thread-post-more"><img src="icons/more.svg" width="20" height="20" alt=""></button>';
                    allHtml += '<div class="thread-post-more-dropdown">';
                    allHtml += '<button class="thread-post-menu-item"><span>Insights</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/></svg></button>';
                    allHtml += '<button class="thread-post-menu-item"><span>Edit</span><span class="thread-post-menu-time">' + (post.time || '') + '</span></button>';
                    allHtml += '<div class="thread-post-menu-divider"></div>';
                    allHtml += '<button class="thread-post-menu-item"><span>Save</span><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M3.40039 17.7891V3.94995C3.40039 2.43117 4.6316 1.19995 6.15039 1.19995H13.8448C15.3636 1.19995 16.5948 2.43117 16.5948 3.94995V17.6516C16.5948 18.592 15.4579 19.063 14.7929 18.398L10.6201 14.2252C10.4198 14.0249 10.097 14.0184 9.88889 14.2106L5.17191 18.5647C4.49575 19.1888 3.40039 18.7093 3.40039 17.7891Z"/></svg></button>';
                    allHtml += '<button class="thread-post-menu-item"><span>Pin to profile</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L12 22"/><path d="M5 9L12 2L19 9"/><circle cx="12" cy="18" r="3"/></svg></button>';
                    allHtml += '<button class="thread-post-menu-item"><span>Hide like and share count</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/><line x1="1" y1="1" x2="23" y2="23"/></svg></button>';
                    allHtml += '<button class="thread-post-menu-item"><span>Reply options</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>';
                    allHtml += '<div class="thread-post-menu-divider"></div>';
                    allHtml += '<button class="thread-post-menu-item danger"><span>Delete</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>';
                    allHtml += '<div class="thread-post-menu-divider"></div>';
                    allHtml += '<button class="thread-post-menu-item"><span>Copy link</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></button>';
                    allHtml += '</div>';
                    allHtml += '</div>';
                    allHtml += '</div>';
                    if (safeText.trim() != '') {
                        allHtml += '<p class="thread-post-text">' + safeText + '</p>';
                    }
                    allHtml += imageHtml;
                    allHtml += '<div class="thread-post-actions">';
                    allHtml += '<button class="action-btn"><svg class="heart-icon" viewBox="0 0 24 24" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>';
                    allHtml += '<button class="action-btn"><svg aria-label="Comment" role="img" viewBox="0 0 18 18" width="20" height="20" fill="currentColor"><path d="M6.41256 1.23531C6.6349 0.971277 7.02918 0.937481 7.29321 1.15982L9.96509 3.40982C10.1022 3.52528 10.1831 3.69404 10.1873 3.87324C10.1915 4.05243 10.1186 4.2248 9.98706 4.34656L7.31518 6.81971C7.06186 7.05419 6.66643 7.03892 6.43196 6.7856C6.19748 6.53228 6.21275 6.13685 6.46607 5.90237L7.9672 4.51289H5.20312C3.68434 4.51289 2.45312 5.74411 2.45312 7.26289V9.51289V11.7629C2.45312 13.2817 3.68434 14.5129 5.20312 14.5129C5.5483 14.5129 5.82812 14.7927 5.82812 15.1379C5.82812 15.4831 5.5483 15.7629 5.20312 15.7629C2.99399 15.7629 1.20312 13.972 1.20312 11.7629V9.51289V7.26289C1.20312 5.05375 2.99399 3.26289 5.20312 3.26289H7.85002L6.48804 2.11596C6.22401 1.89362 6.19021 1.49934 6.41256 1.23531Z"></path><path d="M11.5874 17.7904C11.3651 18.0545 10.9708 18.0883 10.7068 17.8659L8.03491 15.6159C7.89781 15.5005 7.81687 15.3317 7.81267 15.1525C7.80847 14.9733 7.8814 14.801 8.01294 14.6792L10.6848 12.206C10.9381 11.9716 11.3336 11.9868 11.568 12.2402C11.8025 12.4935 11.7872 12.8889 11.5339 13.1234L10.0328 14.5129H12.7969C14.3157 14.5129 15.5469 13.2816 15.5469 11.7629V9.51286V7.26286C15.5469 5.74408 14.3157 4.51286 12.7969 4.51286C12.4517 4.51286 12.1719 4.23304 12.1719 3.88786C12.1719 3.54269 12.4517 3.26286 12.7969 3.26286C15.006 3.26286 16.7969 5.05373 16.7969 7.26286V9.51286V11.7629C16.7969 13.972 15.006 15.7629 12.7969 15.7629H10.15L11.512 16.9098C11.776 17.1321 11.8098 17.5264 11.5874 17.7904Z"></path></svg></button>';
                    allHtml += '<button class="action-btn"><svg aria-label="Repost" role="img" viewBox="0 0 18 18" width="20" height="20" fill="currentColor"><path d="M6.41256 1.23531C6.6349 0.971277 7.02918 0.937481 7.29321 1.15982L9.96509 3.40982C10.1022 3.52528 10.1831 3.69404 10.1873 3.87324C10.1915 4.05243 10.1186 4.2248 9.98706 4.34656L7.31518 6.81971C7.06186 7.05419 6.66643 7.03892 6.43196 6.7856C6.19748 6.53228 6.21275 6.13685 6.46607 5.90237L7.9672 4.51289H5.20312C3.68434 4.51289 2.45312 5.74411 2.45312 7.26289V9.51289V11.7629C2.45312 13.2817 3.68434 14.5129 5.20312 14.5129C5.5483 14.5129 5.82812 14.7927 5.82812 15.1379C5.82812 15.4831 5.5483 15.7629 5.20312 15.7629C2.99399 15.7629 1.20312 13.972 1.20312 11.7629V9.51289V7.26289C1.20312 5.05375 2.99399 3.26289 5.20312 3.26289H7.85002L6.48804 2.11596C6.22401 1.89362 6.19021 1.49934 6.41256 1.23531Z"></path><path d="M11.5874 17.7904C11.3651 18.0545 10.9708 18.0883 10.7068 17.8659L8.03491 15.6159C7.89781 15.5005 7.81687 15.3317 7.81267 15.1525C7.80847 14.9733 7.8814 14.801 8.01294 14.6792L10.6848 12.206C10.9381 11.9716 11.3336 11.9868 11.568 12.2402C11.8025 12.4935 11.7872 12.8889 11.5339 13.1234L10.0328 14.5129H12.7969C14.3157 14.5129 15.5469 13.2816 15.5469 11.7629V9.51286V7.26286C15.5469 5.74408 14.3157 4.51286 12.7969 4.51286C12.4517 4.51286 12.1719 4.23304 12.1719 3.88786C12.1719 3.54269 12.4517 3.26286 12.7969 3.26286C15.006 3.26286 16.7969 5.05373 16.7969 7.26286V9.51286V11.7629C16.7969 13.972 15.006 15.7629 12.7969 15.7629H10.15L11.512 16.9098C11.776 17.1321 11.8098 17.5264 11.5874 17.7904Z"></path></svg></button>';
                    allHtml += '<button class="action-btn"><svg aria-label="Share" role="img" viewBox="0 0 18 18" width="20" height="20" fill="none" stroke="currentColor"><path d="M15.6097 4.09082L6.65039 9.11104" stroke-linejoin="round" stroke-width="1.25"></path><path d="M7.79128 14.439C8.00463 15.3275 8.11131 15.7718 8.33426 15.932C8.52764 16.071 8.77617 16.1081 9.00173 16.0318C9.26179 15.9438 9.49373 15.5501 9.95761 14.7628L15.5444 5.2809C15.8883 4.69727 16.0603 4.40546 16.0365 4.16566C16.0159 3.95653 15.9071 3.76612 15.7374 3.64215C15.5428 3.5 15.2041 3.5 14.5267 3.5H3.71404C2.81451 3.5 2.36474 3.5 2.15744 3.67754C1.97758 3.83158 1.88253 4.06254 1.90186 4.29856C1.92415 4.57059 2.24363 4.88716 2.88259 5.52032L6.11593 8.7243C6.26394 8.87097 6.33795 8.94431 6.39784 9.02755C6.451 9.10144 6.4958 9.18101 6.53142 9.26479C6.57153 9.35916 6.59586 9.46047 6.64451 9.66309L7.79128 14.439Z" stroke-linejoin="round" stroke-width="1.25"></path></svg></button>';
                    allHtml += '</div>';
                    allHtml += '</div>';
                }

                if (allHtml == '') {
                    allHtml = '<p style="text-align:center;color:#999;padding:40px 20px;">No posts yet.</p>';
                }

                threadContent.innerHTML = allHtml;
                // attach thread post more dropdown handlers
                let threadPostMoreBtns = threadContent.querySelectorAll('.thread-post-more');
                for (let tp = 0; tp < threadPostMoreBtns.length; tp++) {
                    (function(btn) {
                        btn.onclick = function(e) {
                            e.stopPropagation();
                            let dropdown = btn.parentElement.querySelector('.thread-post-more-dropdown');
                            if (dropdown == null) return;
                            let isOpen = dropdown.classList.contains('active');
                            // close all other thread post dropdowns
                            let allTpDropdowns = document.querySelectorAll('.thread-post-more-dropdown.active');
                            for (let d = 0; d < allTpDropdowns.length; d++) {
                                allTpDropdowns[d].classList.remove('active');
                            }
                            if (!isOpen) {
                                dropdown.classList.add('active');
                            }
                        };
                    })(threadPostMoreBtns[tp]);
                }
                // attach delete button handlers
                let threadDeleteBtns = threadContent.querySelectorAll('.thread-post-menu-item.danger');
                for (let db = 0; db < threadDeleteBtns.length; db++) {
                    (function(delBtn) {
                        delBtn.onclick = function(e) {
                            e.stopPropagation();
                            // close the dropdown
                            let dropdown = delBtn.closest('.thread-post-more-dropdown');
                            if (dropdown) dropdown.classList.remove('active');
                            // show delete confirmation modal
                            let deleteOverlay = document.getElementById('deletePostOverlay');
                            if (deleteOverlay) {
                                deleteOverlay.classList.add('active');
                                deleteOverlay._postElement = delBtn.closest('.thread-post');
                            }
                        };
                    })(threadDeleteBtns[db]);
                }
                threadOverlay.classList.add('active');
                // hide side action button
                if (sideActionContainer != null) {
                    sideActionContainer.style.display = 'none';
                }
            }
            hidePostToast();
        };
    }

    // thread back button
    if (threadBackBtn != null && threadOverlay != null) {
        threadBackBtn.onclick = function() {
            threadOverlay.classList.remove('active');
            // show side action button again
            if (sideActionContainer != null) {
                sideActionContainer.style.display = '';
            }
            // clear pending post - dont add to feed, only saved to user posts
            pendingNewPost = null;
        };
    }

    // thread more button dropdown
    let threadMoreBtn = document.getElementById('threadMoreBtn');
    let threadMoreDropdown = document.getElementById('threadMoreDropdown');
    if (threadMoreBtn != null && threadMoreDropdown != null) {
        threadMoreBtn.onclick = function(e) {
            e.stopPropagation();
            if (threadMoreDropdown.classList.contains('active')) {
                threadMoreDropdown.classList.remove('active');
            } else {
                threadMoreDropdown.classList.add('active');
            }
        };
        document.addEventListener('click', function(e) {
            if (!threadMoreDropdown.contains(e.target) && !threadMoreBtn.contains(e.target)) {
                threadMoreDropdown.classList.remove('active');
            }
        });
    }

    // textarea input - enable/disable post button
    let createPostText = document.getElementById('createPostText');
    let postBtn = document.getElementById('createPostSubmit');
    let addThreadText = document.querySelector('.add-thread-text');
    let addThreadAvatar = document.getElementById('addThreadAvatar');

    if (createPostText != null && postBtn != null) {
        console.log("Attaching textarea input handler");
        createPostText.addEventListener('input', function() {
            if (this.value.trim() != '') {
                postBtn.disabled = false;
                postBtn.removeAttribute('disabled');
                if (addThreadText != null) {
                    addThreadText.classList.add('active');
                }
                if (addThreadAvatar != null) {
                    addThreadAvatar.classList.add('active');
                }
            } else {
                postBtn.disabled = true;
                postBtn.setAttribute('disabled', '');
                if (addThreadText != null) {
                    addThreadText.classList.remove('active');
                }
                if (addThreadAvatar != null) {
                    addThreadAvatar.classList.remove('active');
                }
            }
        });
        // also listen for keyup as backup for input event
        createPostText.addEventListener('keyup', function() {
            if (this.value.trim() != '') {
                postBtn.disabled = false;
                postBtn.removeAttribute('disabled');
            } else {
                postBtn.disabled = true;
                postBtn.setAttribute('disabled', '');
            }
        });
    } else {
        console.log("createPostText or postBtn not found:", createPostText, postBtn);
    }

    // feed tabs
    let feedTabs = document.querySelectorAll('.feed-tab');
    let feed = document.getElementById('feed');

    for (let i = 0; i < feedTabs.length; i++) {
        feedTabs[i].onclick = function() {
            // remove active from all
            for (let j = 0; j < feedTabs.length; j++) {
                feedTabs[j].classList.remove('active');
            }
            this.classList.add('active');

            let feedType = this.dataset.feed;
            let existingSuggested = document.getElementById('suggestedSection');
            let existingGhostEmpty = document.getElementById('ghostEmptyState');
            let composerEl = document.getElementById('composer');
            let sideActionEl = document.querySelector('.side-action-container');

            if (feedType == 'following') {
                if (feed != null) { feed.style.display = 'flex'; }
                if (composerEl != null) { composerEl.style.display = 'flex'; }
                if (sideActionEl != null) { sideActionEl.style.display = ''; }
                if (existingGhostEmpty != null) { existingGhostEmpty.remove(); }
                if (existingSuggested != null) { existingSuggested.remove(); }
                // load following posts
                feedPosts = getFollowingPosts();
                renderFeed();

                // add reposted and replied posts at top of feed
                let savedReposts = loadFromStorage('threads_user_reposts');
                if (savedReposts == null) savedReposts = [];
                let savedReplies = loadFromStorage('threads_user_replies');
                if (savedReplies == null) savedReplies = [];

                // merge and sort by time (newest first)
                let allActivity = [];
                for (let r = 0; r < savedReposts.length; r++) {
                    savedReposts[r].type = 'repost';
                    savedReposts[r].sortTime = savedReposts[r].repostedAt;
                    allActivity.push(savedReposts[r]);
                }
                for (let r = 0; r < savedReplies.length; r++) {
                    savedReplies[r].type = 'reply';
                    savedReplies[r].sortTime = savedReplies[r].repliedAt;
                    allActivity.push(savedReplies[r]);
                }
                allActivity.sort(function(a, b) { return b.sortTime - a.sortTime; });

                if (allActivity.length > 0 && feed != null) {
                    for (let r = allActivity.length - 1; r >= 0; r--) {
                        let actEl = createActivityElement(allActivity[r]);
                        feed.insertBefore(actEl, feed.firstChild);
                    }
                }

                // add suggested section after 2nd post
                let postEls = feed.querySelectorAll('.post');
                if (postEls.length >= 2) {
                    let suggestedHTML = createSuggestedSection();
                    // add html after this element
                    postEls[1].insertAdjacentHTML('afterend', suggestedHTML);
                    initSuggestedCards();
                }
            } else if (feedType == 'ghost') {
                if (feed != null) { feed.style.display = 'none'; }
                if (composerEl != null) { composerEl.style.display = 'none'; }
                if (sideActionEl != null) { sideActionEl.style.display = 'none'; }
                if (existingSuggested != null) { existingSuggested.remove(); }
                if (existingGhostEmpty == null) {
                    let feedContainer = document.querySelector('.feed-container');
                    if (feedContainer != null) {
                        // add html at the end of the container
                        feedContainer.insertAdjacentHTML('beforeend', createGhostEmptyState());
                    }
                }
            } else {
                // for you tab - load sample posts
                if (feed != null) { feed.style.display = 'flex'; }
                if (composerEl != null) { composerEl.style.display = 'flex'; }
                if (sideActionEl != null) { sideActionEl.style.display = ''; }
                if (existingSuggested != null) { existingSuggested.remove(); }
                if (existingGhostEmpty != null) { existingGhostEmpty.remove(); }
                feedPosts = getSamplePosts();
                renderFeed();
            }
        };
    }

    // feed more dropdown
    let feedMoreBtn = document.getElementById('feedMoreBtn');
    let feedMoreDropdown = document.getElementById('feedMoreDropdown');
    if (feedMoreBtn != null && feedMoreDropdown != null) {
        feedMoreBtn.onclick = function(e) {
            e.stopPropagation();
            // build dropdown based on active tab
            let activeTab = document.querySelector('.feed-tab.active');
            let activeFeed = 'foryou';
            if (activeTab) {
                activeFeed = activeTab.dataset.feed;
            }
            let addColumnHtml = '';
            addColumnHtml = addColumnHtml + '<button class="feed-more-item">';
            addColumnHtml = addColumnHtml + '<span>Add as column</span>';
            addColumnHtml = addColumnHtml + '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">';
            addColumnHtml = addColumnHtml + '<path d="M3 2C2.58579 2 2.25 2.33579 2.25 2.75V4.25H0.75C0.335786 4.25 0 4.58579 0 5C0 5.41421 0.335786 5.75 0.75 5.75H2.25V7.25C2.25 7.66421 2.58579 8 3 8C3.41421 8 3.75 7.66421 3.75 7.25V5.75H5.25C5.66421 5.75 6 5.41421 6 5C6 4.58579 5.66421 4.25 5.25 4.25H3.75V2.75C3.75 2.33579 3.41421 2 3 2Z"></path>';
            addColumnHtml = addColumnHtml + '<path clip-rule="evenodd" d="M7.25 3.75H16C17.5188 3.75 18.75 4.98122 18.75 6.5V14.5C18.75 16.0188 17.5188 17.25 16 17.25H5C3.48122 17.25 2.25 16.0188 2.25 14.5V9.5H3.75V14.5C3.75 15.1904 4.30964 15.75 5 15.75H7.25V3.75ZM8.75 15.75V5.25H12.25V15.75H8.75ZM13.75 15.75H16C16.6904 15.75 17.25 15.1904 17.25 14.5V6.5C17.25 5.80964 16.6904 5.25 16 5.25H13.75V15.75Z" fill-rule="evenodd"></path>';
            addColumnHtml = addColumnHtml + '</svg>';
            addColumnHtml = addColumnHtml + '</button>';

            let createFeedHtml = '';
            createFeedHtml = createFeedHtml + '<button class="feed-more-item">';
            createFeedHtml = createFeedHtml + '<span>Create new feed</span>';
            createFeedHtml = createFeedHtml + '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5">';
            createFeedHtml = createFeedHtml + '<circle cx="10" cy="10" r="7.5"/>';
            createFeedHtml = createFeedHtml + '<line x1="10" y1="6.5" x2="10" y2="13.5"/>';
            createFeedHtml = createFeedHtml + '<line x1="6.5" y1="10" x2="13.5" y2="10"/>';
            createFeedHtml = createFeedHtml + '</svg>';
            createFeedHtml = createFeedHtml + '</button>';

            let html = '';
            if (activeFeed == 'foryou') {
                html = createFeedHtml;
            } else if (activeFeed == 'ghost') {
                html = addColumnHtml;
            } else {
                // following tab
                html = addColumnHtml + '<div class="feed-more-divider"></div>' + createFeedHtml;
            }
            feedMoreDropdown.innerHTML = html;
            if (feedMoreDropdown.classList.contains('active')) {
                feedMoreDropdown.classList.remove('active');
            } else {
                feedMoreDropdown.classList.add('active');
            }
        };
        document.addEventListener('click', function(e) {
            if (feedMoreDropdown.contains(e.target) == false && feedMoreBtn.contains(e.target) == false) {
                feedMoreDropdown.classList.remove('active');
            }
        });
    }

    // side action button (add a column)
    let sideActionBtn = document.getElementById('sideActionBtn');
    let sideActionDropdown = document.getElementById('sideActionDropdown');
    let sideActionMainMenu = document.getElementById('sideActionMainMenu');
    let sideActionFeedsMenu = document.getElementById('sideActionFeedsMenu');
    let feedsMenuBtn = document.getElementById('feedsMenuBtn');
    let feedsBackBtn = document.getElementById('feedsBackBtn');

    if (sideActionBtn != null && sideActionDropdown != null) {
        sideActionBtn.onclick = function(e) {
            e.stopPropagation();
            // reset to main menu
            if (sideActionMainMenu != null) { sideActionMainMenu.style.display = 'block'; }
            if (sideActionFeedsMenu != null) { sideActionFeedsMenu.classList.remove('active'); }
            if (sideActionDropdown.classList.contains('active')) {
                sideActionDropdown.classList.remove('active');
            } else {
                sideActionDropdown.classList.add('active');
            }
        };

        // feeds submenu
        if (feedsMenuBtn != null) {
            feedsMenuBtn.onclick = function(e) {
                e.stopPropagation();
                if (sideActionMainMenu != null) { sideActionMainMenu.style.display = 'none'; }
                if (sideActionFeedsMenu != null) { sideActionFeedsMenu.classList.add('active'); }
            };
        }

        // feeds back button
        if (feedsBackBtn != null) {
            feedsBackBtn.onclick = function(e) {
                e.stopPropagation();
                if (sideActionFeedsMenu != null) { sideActionFeedsMenu.classList.remove('active'); }
                if (sideActionMainMenu != null) { sideActionMainMenu.style.display = 'block'; }
            };
        }

        // close when clicking outside
        document.addEventListener('click', function(e) {
            if (sideActionDropdown.contains(e.target) == false && sideActionBtn.contains(e.target) == false) {
                sideActionDropdown.classList.remove('active');
            }
        });
    }

    // search modal
    let searchModalOverlay = document.getElementById('searchModalOverlay');
    if (searchModalOverlay != null) {
        searchModalOverlay.onclick = function(e) {
            if (e.target == searchModalOverlay) {
                searchModalOverlay.classList.remove('active');
                // restore home as active nav
                let allNavBtns = document.querySelectorAll('.nav-btn[data-tab]');
                for (let j = 0; j < allNavBtns.length; j++) {
                    allNavBtns[j].classList.remove('active');
                }
                let homeBtn = document.querySelector('.nav-btn[data-tab="home"]');
                if (homeBtn != null) homeBtn.classList.add('active');
            }
        };
    }

    // search filter dropdown
    let searchFilterBtn = document.getElementById('searchFilterBtn');
    let searchFilterDropdown = document.getElementById('searchFilterDropdown');
    let searchChips = document.getElementById('searchChips');

    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let fullMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    // format a date like "2 Feb 2026"
    function formatDate(date) {
        return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
    }

    // add a search chip
    function addSearchChip(type, value) {
        if (searchChips == null) return;
        // dont add duplicate type
        let existing = searchChips.querySelector('[data-type="' + type + '"]');
        if (existing != null) existing.remove();

        let chip = document.createElement('div');
        chip.className = 'search-chip';
        chip.dataset.type = type;

        let label = 'From';
        if (type == 'after') {
            label = 'After';
        } else if (type == 'before') {
            label = 'Before';
        }

        if (type == 'profile') {
            chip.innerHTML = '<span class="search-chip-label">' + label + '</span>' +
                '<input class="search-chip-input" type="text" placeholder="Profile" value="">' +
                '<button class="search-chip-remove"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
        } else {
            chip.innerHTML = '<span class="search-chip-label">' + label + '</span>' +
                '<span class="search-chip-value">' + sanitize(value) + '</span>' +
                '<button class="search-chip-remove"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
        }

        chip.querySelector('.search-chip-remove').onclick = function(e) {
            e.stopPropagation();
            chip.remove();
            if (calendarPicker != null) calendarPicker.classList.remove('active');
        };

        // click chip to open calendar (only for after/before)
        if (type == 'after' || type == 'before') {
            chip.onclick = function(e) {
                if (e.target.closest('.search-chip-remove')) return;
                e.stopPropagation();
                showCalendar(type);
            };
        }

        // click profile chip to focus input inside it
        if (type == 'profile') {
            chip.onclick = function(e) {
                if (e.target.closest('.search-chip-remove')) return;
                e.stopPropagation();
                let inp = chip.querySelector('.search-chip-input');
                if (inp != null) inp.focus();
            };
        }

        searchChips.appendChild(chip);
    }

    // calendar picker
    let calendarPicker = document.getElementById('searchCalendarPicker');
    let calendarGrid = document.getElementById('calendarGrid');
    let calendarMonthYear = document.getElementById('calendarMonthYear');
    let calendarPrev = document.getElementById('calendarPrev');
    let calendarNext = document.getElementById('calendarNext');
    let calendarCurrentMonth = new Date().getMonth();
    let calendarCurrentYear = new Date().getFullYear();
    let calendarFilterType = null;

    function renderCalendar() {
        if (calendarGrid == null || calendarMonthYear == null) return;
        calendarMonthYear.textContent = fullMonths[calendarCurrentMonth] + ' ' + calendarCurrentYear;
        calendarGrid.innerHTML = '';

        let firstDay = new Date(calendarCurrentYear, calendarCurrentMonth, 1).getDay();
        let daysInMonth = new Date(calendarCurrentYear, calendarCurrentMonth + 1, 0).getDate();
        let today = new Date();

        // empty cells before 1st
        for (let i = 0; i < firstDay; i++) {
            let empty = document.createElement('div');
            empty.className = 'calendar-day empty';
            calendarGrid.appendChild(empty);
        }

        // day buttons
        for (let d = 1; d <= daysInMonth; d++) {
            let btn = document.createElement('button');
            btn.className = 'calendar-day';
            btn.textContent = d;
            if (d == today.getDate() && calendarCurrentMonth == today.getMonth() && calendarCurrentYear == today.getFullYear()) {
                btn.classList.add('today');
            }
            btn.dataset.day = d;
            btn.onclick = function() {
                let picked = new Date(calendarCurrentYear, calendarCurrentMonth, parseInt(this.dataset.day));
                addSearchChip(calendarFilterType, formatDate(picked));
                calendarPicker.classList.remove('active');
            };
            calendarGrid.appendChild(btn);
        }
    }

    if (calendarPrev != null) {
        calendarPrev.onclick = function(e) {
            e.stopPropagation();
            calendarCurrentMonth--;
            if (calendarCurrentMonth < 0) { calendarCurrentMonth = 11; calendarCurrentYear--; }
            renderCalendar();
        };
    }
    if (calendarNext != null) {
        calendarNext.onclick = function(e) {
            e.stopPropagation();
            calendarCurrentMonth++;
            if (calendarCurrentMonth > 11) { calendarCurrentMonth = 0; calendarCurrentYear++; }
            renderCalendar();
        };
    }

    function showCalendar(type) {
        // toggle off if same type already open
        if (calendarPicker.classList.contains('active') && calendarFilterType == type) {
            calendarPicker.classList.remove('active');
            return;
        }
        calendarFilterType = type;
        calendarCurrentMonth = new Date().getMonth();
        calendarCurrentYear = new Date().getFullYear();
        renderCalendar();
        calendarPicker.classList.add('active');
    }

    if (searchFilterBtn != null && searchFilterDropdown != null) {
        searchFilterBtn.onclick = function(e) {
            e.stopPropagation();
            if (searchFilterDropdown.classList.contains('active')) {
                searchFilterDropdown.classList.remove('active');
            } else {
                searchFilterDropdown.classList.add('active');
            }
            if (calendarPicker != null) calendarPicker.classList.remove('active');
        };

        // filter item clicks
        let filterItems = searchFilterDropdown.querySelectorAll('.search-filter-item');
        // after date - adds chip with todays date
        if (filterItems[0] != null) {
            filterItems[0].onclick = function(e) {
                e.stopPropagation();
                searchFilterDropdown.classList.remove('active');
                addSearchChip('after', formatDate(new Date()));
            };
        }
        // before date - adds chip with todays date
        if (filterItems[1] != null) {
            filterItems[1].onclick = function(e) {
                e.stopPropagation();
                searchFilterDropdown.classList.remove('active');
                addSearchChip('before', formatDate(new Date()));
            };
        }
        // from profile - adds chip inside search input wrapper like others
        if (filterItems[2] != null) {
            filterItems[2].onclick = function(e) {
                e.stopPropagation();
                searchFilterDropdown.classList.remove('active');
                addSearchChip('profile', 'Profile');
                let searchInput = document.getElementById('searchInput');
                if (searchInput != null) searchInput.focus();
            };
        }

        document.addEventListener('click', function(e) {
            if (searchFilterDropdown.contains(e.target) == false && searchFilterBtn.contains(e.target) == false) {
                searchFilterDropdown.classList.remove('active');
            }
            if (calendarPicker != null && calendarPicker.contains(e.target) == false && searchFilterDropdown.contains(e.target) == false && searchFilterBtn.contains(e.target) == false && (searchChips == null || searchChips.contains(e.target) == false)) {
                calendarPicker.classList.remove('active');
            }
        });
    }

    // logo click - go to index.html
    let logoLink = document.querySelector('.logo-link');
    if (logoLink != null) {
        logoLink.onclick = function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
        };
    }

    // nav buttons
    let navBtns = document.querySelectorAll('.nav-btn[data-tab]');
    for (let i = 0; i < navBtns.length; i++) {
        navBtns[i].addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            let tab = this.getAttribute('data-tab');
            // update active state
            if (tab == 'home' || tab == 'search') {
                for (let j = 0; j < navBtns.length; j++) {
                    navBtns[j].classList.remove('active');
                }
                this.classList.add('active');
            }
            if (tab == 'profile') {
                window.location.href = 'profile.html';
            }
            if (tab == 'activity') {
                window.location.href = 'activity.html';
            }
            if (tab == 'search') {
                if (searchModalOverlay != null) {
                    renderSearchSuggestions();
                    searchModalOverlay.classList.add('active');
                }
            }
            if (tab == 'create') {
                // close calendar and filter dropdown
                if (calendarPicker != null) calendarPicker.classList.remove('active');
                if (searchFilterDropdown != null) searchFilterDropdown.classList.remove('active');
                // keep search modal open underneath
                openModal();
            }
            if (tab == 'home') {
                // close search modal if open
                if (searchModalOverlay != null) {
                    searchModalOverlay.classList.remove('active');
                }
                window.scrollTo(0, 0);
                // show update bar
                let updateBar = document.getElementById('feedUpdateBar');
                if (updateBar != null) {
                    updateBar.classList.add('active');
                    // load new random posts
                    setTimeout(function() {
                        let newPosts = getRandomPosts();
                        feedPosts = newPosts;
                        renderFeed();
                        updateBar.classList.remove('active');
                    }, 1200);
                }
            }
        });
    }

    // more menu dropdown (create post header)
    let moreMenuBtn = document.getElementById('moreMenuBtn');
    let moreMenuDropdown = document.getElementById('moreMenuDropdown');
    if (moreMenuBtn != null && moreMenuDropdown != null) {
        moreMenuBtn.onclick = function(e) {
            e.stopPropagation();
            if (moreMenuDropdown.classList.contains('active')) {
                moreMenuDropdown.classList.remove('active');
            } else {
                moreMenuDropdown.classList.add('active');
            }
        };
        document.addEventListener('click', function(e) {
            if (moreMenuDropdown.contains(e.target) == false && moreMenuBtn.contains(e.target) == false) {
                moreMenuDropdown.classList.remove('active');
            }
        });
    }

    // reply more menu dropdown
    let replyMoreMenuBtn = document.getElementById('replyMoreMenuBtn');
    let replyMoreMenuDropdown = document.getElementById('replyMoreMenuDropdown');
    if (replyMoreMenuBtn != null && replyMoreMenuDropdown != null) {
        replyMoreMenuBtn.onclick = function(e) {
            e.stopPropagation();
            if (replyMoreMenuDropdown.classList.contains('active')) {
                replyMoreMenuDropdown.classList.remove('active');
            } else {
                replyMoreMenuDropdown.classList.add('active');
            }
        };
        document.addEventListener('click', function(e) {
            if (replyMoreMenuDropdown.contains(e.target) == false && replyMoreMenuBtn.contains(e.target) == false) {
                replyMoreMenuDropdown.classList.remove('active');
            }
        });
    }

    // drafts view toggle
    let draftsBtn = document.getElementById('draftsBtn');
    let draftsView = document.getElementById('draftsView');
    let draftsBackBtn = document.getElementById('draftsBackBtn');
    let createPostForm = document.getElementById('createPostForm');
    if (draftsBtn != null && draftsView != null && createPostForm != null) {
        draftsBtn.onclick = function(e) {
            e.stopPropagation();
            createPostForm.style.display = 'none';
            draftsView.style.display = 'flex';
        };
        if (draftsBackBtn != null) {
            draftsBackBtn.onclick = function(e) {
                e.stopPropagation();
                draftsView.style.display = 'none';
                createPostForm.style.display = '';
            };
        }
    }

    // menu dropdown
    let menuBtn = document.getElementById('menuBtn');
    let menuDropdown = document.getElementById('menuDropdown');
    let logoutBtn = document.getElementById('logoutBtn');

    if (menuBtn != null && menuDropdown != null) {
        menuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (menuDropdown.classList.contains('active')) {
                menuDropdown.classList.remove('active');
            } else {
                menuDropdown.classList.add('active');
            }
        });

        document.addEventListener('click', function(e) {
            if (menuDropdown.contains(e.target) == false && menuBtn.contains(e.target) == false) {
                menuDropdown.classList.remove('active');
                // also reset submenus when closing
                let menuMain = document.getElementById('menuMain');
                let menuAppearanceSubmenu = document.getElementById('menuAppearanceSubmenu');
                let menuFeedsSubmenu = document.getElementById('menuFeedsSubmenu');
                if (menuMain != null) menuMain.style.display = '';
                if (menuAppearanceSubmenu != null) menuAppearanceSubmenu.classList.remove('active');
                if (menuFeedsSubmenu != null) menuFeedsSubmenu.classList.remove('active');
            }
        });

        // appearance button - show submenu
        let appearanceBtn = document.getElementById('appearanceBtn');
        let menuMain = document.getElementById('menuMain');
        let menuAppearanceSubmenu = document.getElementById('menuAppearanceSubmenu');
        let appearanceBackBtn = document.getElementById('appearanceBackBtn');

        if (appearanceBtn != null && menuMain != null && menuAppearanceSubmenu != null) {
            appearanceBtn.onclick = function(e) {
                e.stopPropagation();
                menuMain.style.display = 'none';
                menuAppearanceSubmenu.classList.add('active');
            };
        }

        if (appearanceBackBtn != null && menuMain != null && menuAppearanceSubmenu != null) {
            appearanceBackBtn.onclick = function(e) {
                e.stopPropagation();
                menuAppearanceSubmenu.classList.remove('active');
                menuMain.style.display = '';
            };
        }

        // feeds button - show feeds submenu
        let menuFeedsBtn = document.getElementById('menuFeedsBtn');
        let menuFeedsSubmenu = document.getElementById('menuFeedsSubmenu');
        let menuFeedsBackBtn = document.getElementById('menuFeedsBackBtn');

        if (menuFeedsBtn != null && menuMain != null && menuFeedsSubmenu != null) {
            menuFeedsBtn.onclick = function(e) {
                e.stopPropagation();
                menuMain.style.display = 'none';
                menuFeedsSubmenu.classList.add('active');
            };
        }

        if (menuFeedsBackBtn != null && menuMain != null && menuFeedsSubmenu != null) {
            menuFeedsBackBtn.onclick = function(e) {
                e.stopPropagation();
                menuFeedsSubmenu.classList.remove('active');
                menuMain.style.display = '';
            };
        }

        // appearance options
        let appearanceOptions = document.querySelectorAll('.appearance-option');
        for (let i = 0; i < appearanceOptions.length; i++) {
            appearanceOptions[i].onclick = function(e) {
                e.stopPropagation();
                let theme = this.getAttribute('data-theme');
                for (let j = 0; j < appearanceOptions.length; j++) {
                    appearanceOptions[j].classList.remove('active');
                }
                this.classList.add('active');
                if (theme == 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                    localStorage.setItem('threads_theme', JSON.stringify('light'));
                } else if (theme == 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    localStorage.setItem('threads_theme', JSON.stringify('dark'));
                } else {
                    localStorage.setItem('threads_theme', JSON.stringify('auto'));
                    if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        document.documentElement.setAttribute('data-theme', 'light');
                    } else {
                        document.documentElement.setAttribute('data-theme', 'dark');
                    }
                }
            };
        }

        // logout
        if (logoutBtn != null) {
            logoutBtn.onclick = function() {
                console.log("logging out");
                localStorage.removeItem('threads_is_logged_in');
                localStorage.removeItem('threads_user');
                window.location.href = 'login.html';
            };
        }
    }

    // Mobile menu dropdown
    let mobileMenuBtn = document.getElementById('mobileMenuBtn');
    let mobileMenuDropdown = document.getElementById('mobileMenuDropdown');
    let mobileMenuMain = document.getElementById('mobileMenuMain');
    let mobileAppearanceSubmenu = document.getElementById('mobileAppearanceSubmenu');
    let mobileFeedsSubmenu = document.getElementById('mobileFeedsSubmenu');

    if (mobileMenuBtn != null && mobileMenuDropdown != null) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Reset to main menu when opening
            if (mobileMenuMain != null) mobileMenuMain.style.display = '';
            if (mobileAppearanceSubmenu != null) mobileAppearanceSubmenu.classList.remove('active');
            if (mobileFeedsSubmenu != null) mobileFeedsSubmenu.classList.remove('active');
            mobileMenuDropdown.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (mobileMenuDropdown.contains(e.target) == false && mobileMenuBtn.contains(e.target) == false) {
                mobileMenuDropdown.classList.remove('active');
                if (mobileMenuMain != null) mobileMenuMain.style.display = '';
                if (mobileAppearanceSubmenu != null) mobileAppearanceSubmenu.classList.remove('active');
                if (mobileFeedsSubmenu != null) mobileFeedsSubmenu.classList.remove('active');
            }
        });

        // Appearance submenu
        let mobileAppearanceBtn = document.getElementById('mobileAppearanceBtn');
        let mobileAppearanceBackBtn = document.getElementById('mobileAppearanceBackBtn');

        if (mobileAppearanceBtn != null) {
            mobileAppearanceBtn.onclick = function(e) {
                e.stopPropagation();
                mobileMenuMain.style.display = 'none';
                mobileAppearanceSubmenu.classList.add('active');
            };
        }

        if (mobileAppearanceBackBtn != null) {
            mobileAppearanceBackBtn.onclick = function(e) {
                e.stopPropagation();
                mobileAppearanceSubmenu.classList.remove('active');
                mobileMenuMain.style.display = '';
            };
        }

        // Appearance theme options
        let mobileAppearanceOptions = mobileMenuDropdown.querySelectorAll('.appearance-option');
        for (let i = 0; i < mobileAppearanceOptions.length; i++) {
            mobileAppearanceOptions[i].onclick = function(e) {
                e.stopPropagation();
                let theme = this.getAttribute('data-theme');
                for (let j = 0; j < mobileAppearanceOptions.length; j++) {
                    mobileAppearanceOptions[j].classList.remove('active');
                }
                this.classList.add('active');
                if (theme == 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                    localStorage.setItem('threads_theme', JSON.stringify('light'));
                } else if (theme == 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    localStorage.setItem('threads_theme', JSON.stringify('dark'));
                } else {
                    localStorage.setItem('threads_theme', JSON.stringify('auto'));
                    if (!window.matchMedia('(prefers-color-scheme: dark)').matches) {
                        document.documentElement.setAttribute('data-theme', 'light');
                    } else {
                        document.documentElement.setAttribute('data-theme', 'dark');
                    }
                }
            };
        }

        // Feeds submenu
        let mobileFeedsBtn = document.getElementById('mobileFeedsBtn');
        let mobileFeedsBackBtn = document.getElementById('mobileFeedsBackBtn');

        if (mobileFeedsBtn != null) {
            mobileFeedsBtn.onclick = function(e) {
                e.stopPropagation();
                mobileMenuMain.style.display = 'none';
                mobileFeedsSubmenu.classList.add('active');
            };
        }

        if (mobileFeedsBackBtn != null) {
            mobileFeedsBackBtn.onclick = function(e) {
                e.stopPropagation();
                mobileFeedsSubmenu.classList.remove('active');
                mobileMenuMain.style.display = '';
            };
        }

        // Feeds list items
        let mobileFeedItems = mobileFeedsSubmenu != null ? mobileFeedsSubmenu.querySelectorAll('.menu-item[data-feed]') : [];
        for (let i = 0; i < mobileFeedItems.length; i++) {
            mobileFeedItems[i].onclick = function(e) {
                e.stopPropagation();
                let feedType = this.getAttribute('data-feed');
                let feedTab = document.querySelector('.feed-tab[data-feed="' + feedType + '"]');
                if (feedTab) feedTab.click();
                mobileMenuDropdown.classList.remove('active');
                mobileMenuMain.style.display = '';
                mobileFeedsSubmenu.classList.remove('active');
            };
        }

        // Logout
        let mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        if (mobileLogoutBtn != null) {
            mobileLogoutBtn.onclick = function() {
                localStorage.removeItem('threads_is_logged_in');
                localStorage.removeItem('threads_user');
                window.location.href = 'login.html';
            };
        }
    }

    console.log("init done");
}

document.addEventListener('DOMContentLoaded', function() {
    init();
    initSessionTimeout();

    // header logo -> index.html
    let headerLogoLink = document.querySelector('.header-logo-link');
    if (headerLogoLink != null) {
        headerLogoLink.onclick = function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
        };
    }

    // Delete post confirmation modal
    let deletePostOverlay = document.getElementById('deletePostOverlay');
    let deletePostCancel = document.getElementById('deletePostCancel');
    let deletePostConfirm = document.getElementById('deletePostConfirm');

    if (deletePostOverlay) {
        deletePostCancel.onclick = function() {
            deletePostOverlay.classList.remove('active');
            deletePostOverlay._postElement = null;
        };

        deletePostConfirm.onclick = function() {
            let postEl = deletePostOverlay._postElement;
            let deletedPostId = null;
            if (postEl) {
                deletedPostId = postEl.getAttribute('data-id');
                postEl.remove();
            }
            // remove from localStorage
            if (deletedPostId) {
                let userPosts = loadFromStorage('threads_user_posts');
                if (userPosts != null) {
                    userPosts = userPosts.filter(function(p) { return p.id != deletedPostId; });
                    saveToStorage('threads_user_posts', userPosts);
                }
                // also remove from main feed
                let feedPost = document.querySelector('.post[data-id="' + deletedPostId + '"]');
                if (feedPost) feedPost.remove();
            }
            deletePostOverlay.classList.remove('active');
            deletePostOverlay._postElement = null;
            // close thread overlay and return to feed
            let threadOverlay = document.getElementById('threadOverlay');
            if (threadOverlay) {
                threadOverlay.classList.remove('active');
            }
            // show side action button again
            let sideActionContainer = document.querySelector('.side-action-container');
            if (sideActionContainer) {
                sideActionContainer.style.display = '';
            }
            // clear pending post if it matches
            if (pendingNewPost != null && deletedPostId != null && pendingNewPost.id == deletedPostId) {
                pendingNewPost = null;
            }
            // show "Deleted" toast
            let deletedToast = document.getElementById('deletedToast');
            if (deletedToast) {
                deletedToast.classList.add('active');
                setTimeout(function() {
                    deletedToast.classList.remove('active');
                }, 3000);
            }
        };

        deletePostOverlay.onclick = function(e) {
            if (e.target === deletePostOverlay) {
                deletePostOverlay.classList.remove('active');
                deletePostOverlay._postElement = null;
            }
        };
    }

    // check if coming from another page with #create hash
    if (window.location.hash == '#create') {
        openModal();
        // clean up the url
        history.replaceState(null, '', window.location.pathname);
    }
});

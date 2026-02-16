// activity page javascript

// this saves the theme when page loads
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

// sample activity data
function getSampleActivity() {
    let activities = [
        {
            id: 1,
            type: 'suggestion',
            username: 'gkurtskhalia',
            avatar: 'images/avatar1.jpg',
            time: '1d',
            isFollowing: false
        },
        {
            id: 3,
            type: 'suggested_thread',
            username: 'mikachu2323',
            avatar: 'images/avatar3.jpg',
            time: '3d',
            postText: '\u10E4\u10DD\u10E2\u10DD \u10E7\u10E3\u10E0\u10D0\u10D3\u10E6\u10D4\u10D1\u10D8\u10E1\u10D0\u10D7\u10D5\u10D8\u10E1 \uD83D\uDE01',
            likes: 3
        },
        {
            id: 4,
            type: 'suggestion',
            username: 'gio.patashuri.37',
            avatar: 'images/avatar4.jpg',
            time: '4d',
            isFollowing: false
        },
        {
            id: 5,
            type: 'followed',
            username: 'copurashvili',
            avatar: 'images/avatar2.jpg',
            time: '11w',
            isFollowing: false
        },
        {
            id: 6,
            type: 'suggested_thread',
            username: 'mamukalasareishvili',
            avatar: 'images/avatar5.jpg',
            time: '24w',
            postText: '@noahaoahoaa \u10DB\u10DD\u10D2\u10D4\u10E1\u10D0\u10DA\u10DB\u10D4\u10D1\u10DD \u10DA\u10D0\u10DB\u10D0\u10D6\u10DD',
            likes: 4,
            comments: 5
        },
        {
            id: 7,
            type: 'suggestion',
            username: 'vazha.v1',
            avatar: 'images/avatar2.jpg',
            time: '26w',
            isFollowing: false
        }
    ];
    // load follows from localStorage
    let savedFollows = JSON.parse(localStorage.getItem('threads_follows') || '[]');
    for (let i = 0; i < savedFollows.length; i++) {
        let f = savedFollows[i];
        activities.unshift({
            id: 1000 + f.id,
            type: 'follow_only',
            username: f.username,
            avatar: f.avatar,
            time: f.time,
            isFollowing: true
        });
    }

    return activities;
}

// render activity list
function renderActivityList(filter) {
    console.log('rendering activity list, filter: ' + filter);
    let list = document.getElementById('activityList');
    if (list == null) {
        console.log('list not found');
        return;
    }

    let activities = getSampleActivity();
    list.innerHTML = '';

    // filter activities based on selected tab
    let filtered = [];
    if (!filter || filter == 'all') {
        filtered = activities;
    } else {
        for (let i = 0; i < activities.length; i++) {
            let a = activities[i];
            if (filter == 'follows' && a.type == 'follow_only') {
                filtered.push(a);
            }
            if (filter == 'replies' && a.type == 'reply') {
                filtered.push(a);
            }
            if (filter == 'mentions' && a.type == 'mention') {
                filtered.push(a);
            }
            if (filter == 'quotes' && a.type == 'quote') {
                filtered.push(a);
            }
            if (filter == 'reposts' && a.type == 'repost') {
                filtered.push(a);
            }
        }
    }

    if (filtered.length == 0) {
        let empty = document.createElement('div');
        empty.className = 'activity-empty';
        empty.textContent = 'No activity yet.';
        list.appendChild(empty);
    } else {
        for (let i = 0; i < filtered.length; i++) {
            let item = createActivityItem(filtered[i]);
            list.appendChild(item);
        }
    }
    console.log('done rendering');
}

// create activity item element
function createActivityItem(activity) {
    let div = document.createElement('div');
    div.className = 'activity-item';
    div.dataset.id = activity.id;

    // figure out the type text
    let typeText = '';
    let actionHtml = '';

    if (activity.type == 'followed') {
        typeText = 'Followed you';
        actionHtml = '<button class="follow-btn" data-id="' + activity.id + '">Follow back</button>';
    }
    if (activity.type == 'suggestion') {
        typeText = 'Follow suggestion';
        actionHtml = '<button class="follow-btn" data-id="' + activity.id + '">Follow</button>';
    }
    if (activity.type == 'follow_only') {
        typeText = 'You followed';
        actionHtml = '<button class="follow-btn following" data-id="' + activity.id + '">Following</button>';
    }
    if (activity.type == 'suggested_thread') {
        typeText = 'Suggested thread';
    }
    if (activity.type == 'views') {
        typeText = '';
    }

    // build post preview html
    let postPreviewHtml = '';
    if (activity.type == 'suggested_thread') {
        if (activity.postText) {
            postPreviewHtml = postPreviewHtml + '<div class="activity-post-preview">' + activity.postText + '</div>';
            postPreviewHtml = postPreviewHtml + '<div class="activity-post-actions">';
            postPreviewHtml = postPreviewHtml + '<button class="activity-action-btn">';
            postPreviewHtml = postPreviewHtml + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">';
            postPreviewHtml = postPreviewHtml + '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>';
            postPreviewHtml = postPreviewHtml + '</svg>';
            if (activity.likes) {
                postPreviewHtml = postPreviewHtml + activity.likes;
            }
            postPreviewHtml = postPreviewHtml + '</button>';
            postPreviewHtml = postPreviewHtml + '<button class="activity-action-btn">';
            postPreviewHtml = postPreviewHtml + '<svg aria-label="Reply" role="img" viewBox="0 0 18 18" fill="none" stroke="currentColor" width="20" height="20">';
            postPreviewHtml = postPreviewHtml + '<path d="M15.376 13.2177L16.2861 16.7955L12.7106 15.8848C12.6781 15.8848 12.6131 15.8848 12.5806 15.8848C11.3779 16.5678 9.94767 16.8931 8.41995 16.7955C4.94194 16.5353 2.08152 13.7381 1.72397 10.2578C1.2689 5.63919 5.13697 1.76863 9.75264 2.22399C13.2307 2.58177 16.0261 5.41151 16.2861 8.92429C16.4161 10.453 16.0586 11.8841 15.376 13.0876C15.376 13.1526 15.376 13.1852 15.376 13.2177Z" stroke-linejoin="round" stroke-width="1.25"/>';
            postPreviewHtml = postPreviewHtml + '</svg>';
            if (activity.comments) {
                postPreviewHtml = postPreviewHtml + activity.comments;
            }
            postPreviewHtml = postPreviewHtml + '</button>';
            postPreviewHtml = postPreviewHtml + '<button class="activity-action-btn">';
            postPreviewHtml = postPreviewHtml + '<svg aria-label="Repost" role="img" viewBox="0 0 18 18" fill="currentColor" width="20" height="20">';
            postPreviewHtml = postPreviewHtml + '<path d="M6.41256 1.23531C6.6349 0.971277 7.02918 0.937481 7.29321 1.15982L9.96509 3.40982C10.1022 3.52528 10.1831 3.69404 10.1873 3.87324C10.1915 4.05243 10.1186 4.2248 9.98706 4.34656L7.31518 6.81971C7.06186 7.05419 6.66643 7.03892 6.43196 6.7856C6.19748 6.53228 6.21275 6.13685 6.46607 5.90237L7.9672 4.51289H5.20312C3.68434 4.51289 2.45312 5.74411 2.45312 7.26289V9.51289V11.7629C2.45312 13.2817 3.68434 14.5129 5.20312 14.5129C5.5483 14.5129 5.82812 14.7927 5.82812 15.1379C5.82812 15.4831 5.5483 15.7629 5.20312 15.7629C2.99399 15.7629 1.20312 13.972 1.20312 11.7629V9.51289V7.26289C1.20312 5.05375 2.99399 3.26289 5.20312 3.26289H7.85002L6.48804 2.11596C6.22401 1.89362 6.19021 1.49934 6.41256 1.23531Z"/>';
            postPreviewHtml = postPreviewHtml + '<path d="M11.5874 17.7904C11.3651 18.0545 10.9708 18.0883 10.7068 17.8659L8.03491 15.6159C7.89781 15.5005 7.81687 15.3317 7.81267 15.1525C7.80847 14.9733 7.8814 14.801 8.01294 14.6792L10.6848 12.206C10.9381 11.9716 11.3336 11.9868 11.568 12.2402C11.8025 12.4935 11.7872 12.8889 11.5339 13.1234L10.0328 14.5129H12.7969C14.3157 14.5129 15.5469 13.2816 15.5469 11.7629V9.51286V7.26286C15.5469 5.74408 14.3157 4.51286 12.7969 4.51286C12.4517 4.51286 12.1719 4.23304 12.1719 3.88786C12.1719 3.54269 12.4517 3.26286 12.7969 3.26286C15.006 3.26286 16.7969 5.05373 16.7969 7.26286V9.51286V11.7629C16.7969 13.972 15.006 15.7629 12.7969 15.7629H10.15L11.512 16.9098C11.776 17.1321 11.8098 17.5264 11.5874 17.7904Z"/>';
            postPreviewHtml = postPreviewHtml + '</svg>';
            postPreviewHtml = postPreviewHtml + '</button>';
            postPreviewHtml = postPreviewHtml + '<button class="activity-action-btn">';
            postPreviewHtml = postPreviewHtml + '<svg aria-label="Share" role="img" viewBox="0 0 18 18" fill="none" stroke="currentColor" width="20" height="20">';
            postPreviewHtml = postPreviewHtml + '<path d="M15.6097 4.09082L6.65039 9.11104" stroke-linejoin="round" stroke-width="1.25"/>';
            postPreviewHtml = postPreviewHtml + '<path d="M7.79128 14.439C8.00463 15.3275 8.11131 15.7718 8.33426 15.932C8.52764 16.071 8.77617 16.1081 9.00173 16.0318C9.26179 15.9438 9.49373 15.5501 9.95761 14.7628L15.5444 5.2809C15.8883 4.69727 16.0603 4.40546 16.0365 4.16566C16.0159 3.95653 15.9071 3.76612 15.7374 3.64215C15.5428 3.5 15.2041 3.5 14.5267 3.5H3.71404C2.81451 3.5 2.36474 3.5 2.15744 3.67754C1.97758 3.83158 1.88253 4.06254 1.90186 4.29856C1.92415 4.57059 2.24363 4.88716 2.88259 5.52032L6.11593 8.7243C6.26394 8.87097 6.33795 8.94431 6.39784 9.02755C6.451 9.10144 6.4958 9.18101 6.53142 9.26479C6.57153 9.35916 6.59586 9.46047 6.64451 9.66309L7.79128 14.439Z" stroke-linejoin="round" stroke-width="1.25"/>';
            postPreviewHtml = postPreviewHtml + '</svg>';
            postPreviewHtml = postPreviewHtml + '</button>';
            postPreviewHtml = postPreviewHtml + '</div>';
        }
    }

    // build the main html
    let html = '';

    if (activity.type == 'views') {
        // Threads logo icon for views notifications
        html = html + '<div class="activity-avatar-wrapper">';
        html = html + '<div class="activity-threads-icon">';
        html = html + '<svg width="24" height="24" viewBox="0 0 192 192" fill="currentColor">';
        html = html + '<path d="M141.537 88.988C140.71 88.592 139.87 88.21 139.019 87.845C137.537 60.538 122.616 44.905 97.562 44.745C97.448 44.744 97.336 44.744 97.222 44.745C82.236 44.745 69.773 51.141 62.103 62.669L75.202 70.832C80.852 62.302 89.656 58.088 97.222 58.088C97.3 58.088 97.379 58.088 97.458 58.088C105.699 58.138 111.869 60.686 115.832 65.663C118.776 69.399 120.789 74.476 121.834 80.821C114.737 79.539 107.037 79.026 98.785 79.285C74.577 80.032 58.804 93.827 59.802 113.172C60.31 122.965 65.248 131.497 73.7 136.869C80.852 141.388 89.862 143.555 99.226 143.111C111.333 142.536 120.862 138.03 127.529 129.744C132.584 123.475 135.882 115.518 137.515 105.596C143.552 109.146 148.022 113.768 150.601 119.57C154.838 128.943 155.078 143.857 145.084 153.822C136.274 162.606 125.674 166.666 107.759 166.817C87.905 166.652 73.067 160.618 63.363 148.81C54.241 137.698 49.517 121.697 49.329 101.279C49.517 80.86 54.241 64.859 63.363 53.748C73.067 41.94 87.905 35.906 107.759 35.741C127.737 35.907 142.861 41.988 152.853 53.857C157.76 59.686 161.495 66.865 164.02 75.237L176.53 71.808C173.515 61.768 169.03 53.101 163.071 45.937C150.789 31.168 133.174 23.395 107.84 23.2C107.72 23.199 107.601 23.199 107.481 23.2C82.248 23.396 65.023 31.216 53.043 46.156C42.182 59.745 36.539 78.163 36.33 101.218L36.327 101.279L36.33 101.34C36.539 124.395 42.182 142.813 53.043 156.401C65.023 171.342 82.248 179.163 107.481 179.358C107.601 179.358 107.72 179.358 107.84 179.358C129.07 179.178 142.854 173.664 154.168 162.387C169.014 147.597 168.558 128.232 162.947 115.561C158.921 106.424 151.52 99.015 141.537 88.988ZM99.724 130.179C89.796 130.654 72.743 126.269 72.099 113.71C71.635 104.763 78.802 93.033 99.563 92.3C101.91 92.223 104.21 92.185 106.462 92.185C112.441 92.185 118.063 92.731 123.268 93.789C121.378 121.779 108.653 129.751 99.724 130.179Z"/>';
        html = html + '</svg>';
        html = html + '</div>';
        html = html + '</div>';
        html = html + '<div class="activity-content">';
        html = html + '<div class="activity-header-row">';
        html = html + '<span class="activity-username">Your reply got over ' + activity.viewCount + ' views.</span>';
        html = html + '<span class="activity-time">' + activity.time + '</span>';
        html = html + '</div>';
        if (activity.postText) {
            html = html + '<div class="activity-type">' + activity.postText + '</div>';
        }
        html = html + '</div>';
    } else {
        html = html + '<div class="activity-avatar-wrapper">';
        html = html + '<img src="' + activity.avatar + '" alt="' + activity.username + '" class="activity-avatar">';
        html = html + '<div class="activity-badge">';
        html = html + '<svg viewBox="0 0 24 24" fill="currentColor">';
        html = html + '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>';
        html = html + '</svg>';
        html = html + '</div>';
        html = html + '</div>';
        html = html + '<div class="activity-content">';
        html = html + '<div class="activity-header-row">';
        html = html + '<span class="activity-username">' + activity.username + '</span>';
        html = html + '<span class="activity-time">' + activity.time + '</span>';
        html = html + '</div>';
        html = html + '<div class="activity-type">' + typeText + '</div>';
        html = html + postPreviewHtml;
        html = html + '</div>';
        if (actionHtml != '') {
            html = html + '<div class="activity-action">' + actionHtml + '</div>';
        }
    }

    div.innerHTML = html;

    // add follow button click handler
    let followBtn = div.querySelector('.follow-btn');
    if (followBtn != null) {
        followBtn.onclick = function() {
            console.log('follow button clicked');
            if (this.classList.contains('following')) {
                this.classList.remove('following');
                if (activity.type == 'followed') {
                    this.textContent = 'Follow back';
                } else {
                    this.textContent = 'Follow';
                }
                // remove from saved follows
                let saved = JSON.parse(localStorage.getItem('threads_follows') || '[]');
                saved = saved.filter(function(f) { return f.username !== activity.username; });
                localStorage.setItem('threads_follows', JSON.stringify(saved));
            } else {
                this.classList.add('following');
                this.textContent = 'Following';
                // save follow to localStorage
                let saved = JSON.parse(localStorage.getItem('threads_follows') || '[]');
                let exists = false;
                for (let j = 0; j < saved.length; j++) {
                    if (saved[j].username === activity.username) { exists = true; break; }
                }
                if (!exists) {
                    saved.push({
                        id: activity.id,
                        username: activity.username,
                        avatar: activity.avatar,
                        time: 'now'
                    });
                    localStorage.setItem('threads_follows', JSON.stringify(saved));
                }
            }
        };
    }

    return div;
}

// get search suggestions
function getSearchSuggestions() {
    let suggestions = [
        {
            id: 101,
            username: 'womenqu0tes',
            name: 'Women Quotes 💗',
            bio: '👉 Letting Me Go Will Be the Only Thing You Will Regret Your Whole Life...! 🖤\n💗 Love | Dating | Relationship Quotes',
            followers: '120K followers',
            avatar: 'images/avatar1.jpg',
            verified: false
        },
        {
            id: 102,
            username: 'ashlaysoto',
            name: 'Ashley soto',
            bio: 'Texas girl ❤️ Mom of 3\ntiktok: ash_lay\nBusiness: ashleysotobusiness@yahoo.com SNAP: ash_layN',
            followers: '39.4K followers',
            avatar: 'images/avatar2.jpg',
            verified: true
        },
        {
            id: 103,
            username: 'dr.samkharadze',
            name: 'Dr. Giorgi Samkharadze',
            bio: 'სამედიცინო-სარეაბილიტაციო ბლოგი',
            followers: '15.2K followers',
            avatar: 'images/avatar3.jpg',
            verified: false
        },
        {
            id: 104,
            username: 'techguru_mike',
            name: 'Mike Johnson',
            bio: '💻 Tech enthusiast | Software Developer\n🚀 Building the future one line at a time\n📱 iOS & Android tips',
            followers: '85.3K followers',
            avatar: 'images/avatar4.jpg',
            verified: true
        },
        {
            id: 105,
            username: 'foodie_adventures',
            name: 'Sarah Chen',
            bio: '🍕 Food blogger | Recipe creator\n📍 NYC based\n✨ Making everyday meals extraordinary',
            followers: '256K followers',
            avatar: 'images/avatar5.jpg',
            verified: true
        },
        {
            id: 106,
            username: 'fitness_maria',
            name: 'Maria Rodriguez',
            bio: '💪 Certified Personal Trainer\n🏋️ Transform your body & mind\n📩 DM for coaching',
            followers: '67.8K followers',
            avatar: 'images/avatar1.jpg',
            verified: false
        },
        {
            id: 107,
            username: 'travel.with.alex',
            name: 'Alex Thompson',
            bio: '✈️ 50+ countries explored\n📸 Travel photographer\n🌍 Adventure awaits everywhere',
            followers: '198K followers',
            avatar: 'images/avatar2.jpg',
            verified: true
        },
        {
            id: 108,
            username: 'artbyemma',
            name: 'Emma Wilson',
            bio: '🎨 Digital artist & illustrator\n🖼️ Commissions open\n💫 Turning imagination into art',
            followers: '43.2K followers',
            avatar: 'images/avatar3.jpg',
            verified: false
        },
        {
            id: 109,
            username: 'startup_daily',
            name: 'Startup Daily',
            bio: '📈 Startup news & insights\n💡 Entrepreneur tips\n🎯 Building successful businesses',
            followers: '312K followers',
            avatar: 'images/avatar4.jpg',
            verified: true
        },
        {
            id: 110,
            username: 'music_vibes_official',
            name: 'Music Vibes',
            bio: '🎵 Daily music recommendations\n🎧 All genres | All moods\n🔥 New releases every day',
            followers: '89.5K followers',
            avatar: 'images/avatar5.jpg',
            verified: false
        },
        {
            id: 111,
            username: 'naturelover_james',
            name: 'James Nature',
            bio: '🌲 Wildlife photographer\n🦁 Safari guide\n📷 Capturing nature\'s beauty',
            followers: '156K followers',
            avatar: 'images/avatar1.jpg',
            verified: true
        },
        {
            id: 112,
            username: 'yoga_with_lisa',
            name: 'Lisa Yoga',
            bio: '🧘‍♀️ Certified yoga instructor\n🌸 Mind, body & soul\n✨ Daily practice tips',
            followers: '92.1K followers',
            avatar: 'images/avatar2.jpg',
            verified: false
        },
        {
            id: 113,
            username: 'coffeeaddicts',
            name: 'Coffee Addicts',
            bio: '☕ Coffee lovers community\n🫘 Bean reviews & brewing tips\n📍 Best cafes worldwide',
            followers: '215K followers',
            avatar: 'images/avatar3.jpg',
            verified: true
        },
        {
            id: 114,
            username: 'bookworm_reads',
            name: 'Bookworm Reads',
            bio: '📚 Book reviews & recommendations\n🔖 All genres welcome\n💬 Join our reading club',
            followers: '78.4K followers',
            avatar: 'images/avatar4.jpg',
            verified: false
        },
        {
            id: 115,
            username: 'gaming_pro_max',
            name: 'Gaming Pro',
            bio: '🎮 Pro gamer & streamer\n🏆 Tournament champion\n📺 Twitch: gaming_pro_max',
            followers: '445K followers',
            avatar: 'images/avatar5.jpg',
            verified: true
        }
    ];
    return suggestions;
}

// render search suggestions
function renderSearchSuggestions() {
    let searchSuggestionsList = document.getElementById('searchSuggestionsList');
    if (searchSuggestionsList == null) {
        return;
    }

    let suggestions = getSearchSuggestions();
    searchSuggestionsList.innerHTML = '';

    for (let i = 0; i < suggestions.length; i++) {
        let suggestion = suggestions[i];
        let item = document.createElement('div');
        item.className = 'search-suggestion-item';

        // build verified icon html
        let verifiedIcon = '';
        if (suggestion.verified == true) {
            verifiedIcon = '<svg class="search-suggestion-verified" viewBox="0 0 24 24" fill="currentColor">';
            verifiedIcon = verifiedIcon + '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>';
            verifiedIcon = verifiedIcon + '</svg>';
        }

        // replace newlines in bio
        let bioText = suggestion.bio;
        // replace new lines with html line breaks
        bioText = bioText.replace(/\n/g, '<br>');

        // build the html
        let html = '';
        html = html + '<img src="' + suggestion.avatar + '" alt="' + suggestion.username + '" class="search-suggestion-avatar">';
        html = html + '<div class="search-suggestion-info">';
        html = html + '<div class="search-suggestion-header">';
        html = html + '<span class="search-suggestion-username">' + suggestion.username + '</span>';
        html = html + verifiedIcon;
        html = html + '</div>';
        html = html + '<div class="search-suggestion-name">' + suggestion.name + '</div>';
        html = html + '<div class="search-suggestion-bio">' + bioText + '</div>';
        html = html + '<div class="search-suggestion-followers">' + suggestion.followers + '</div>';
        html = html + '</div>';
        html = html + '<div class="search-suggestion-action">';
        html = html + '<button class="search-suggestion-follow-btn" data-id="' + suggestion.id + '">Follow</button>';
        html = html + '</div>';

        item.innerHTML = html;

        // add click handler to follow button
        let followBtn = item.querySelector('.search-suggestion-follow-btn');
        followBtn.onclick = function() {
            console.log('search follow clicked');
            if (this.classList.contains('following')) {
                this.classList.remove('following');
                this.textContent = 'Follow';
            } else {
                this.classList.add('following');
                this.textContent = 'Following';
            }
        };

        searchSuggestionsList.appendChild(item);
    }
}

// initialize the page
function init() {
    console.log('init started');

    // check if logged in
    let isLoggedIn = localStorage.getItem('threads_is_logged_in');
    if (isLoggedIn != 'true') {
        console.log('not logged in, redirecting');
        window.location.href = 'login.html';
        return;
    }

    renderActivityList();

    // get elements
    let activityDropdownBtn = document.getElementById('activityDropdownBtn');
    let activityDropdown = document.getElementById('activityDropdown');
    let activityMoreBtn = document.getElementById('activityMoreBtn');
    let activityMoreDropdown = document.getElementById('activityMoreDropdown');
    let modalOverlay = document.getElementById('modalOverlay');
    let createPostClose = document.getElementById('createPostClose');
    let createPostAvatar = document.getElementById('createPostAvatar');
    let createPostAvatarSmall = document.getElementById('createPostAvatarSmall');
    let createPostUsername = document.getElementById('createPostUsername');
    let createPostText = document.getElementById('createPostText');
    let postBtn = document.getElementById('postBtn');
    let fab = document.getElementById('fab');
    let searchModalOverlay = document.getElementById('searchModalOverlay');
    let moreMenuBtn = document.getElementById('moreMenuBtn');
    let moreMenuDropdown = document.getElementById('moreMenuDropdown');
    let draftsBtn = document.getElementById('draftsBtn');
    let draftsView = document.getElementById('draftsView');
    let draftsBackBtn = document.getElementById('draftsBackBtn');
    let createPostForm = document.getElementById('createPostForm');

    // load user info for modal
    let currentUserData = localStorage.getItem('threads_user');
    let currentUser = {};
    if (currentUserData != null) {
        currentUser = JSON.parse(currentUserData);
    }
    if (createPostAvatar != null) {
        if (currentUser.avatar) {
            createPostAvatar.src = currentUser.avatar;
        } else {
            createPostAvatar.src = 'images/avatar1.jpg';
        }
    }
    if (createPostAvatarSmall != null) {
        if (currentUser.avatar) {
            createPostAvatarSmall.src = currentUser.avatar;
        } else {
            createPostAvatarSmall.src = 'images/avatar1.jpg';
        }
    }
    if (createPostUsername != null) {
        if (currentUser.username) {
            createPostUsername.textContent = currentUser.username;
        } else {
            createPostUsername.textContent = 'user';
        }
    }

    // activity dropdown button
    if (activityDropdownBtn != null && activityDropdown != null) {
        activityDropdownBtn.onclick = function(e) {
            // stop click from closing menu
            e.stopPropagation();
            if (activityDropdown.classList.contains('active')) {
                activityDropdown.classList.remove('active');
            } else {
                activityDropdown.classList.add('active');
            }
        };

        // close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (activityDropdown.contains(e.target) == false && e.target != activityDropdownBtn) {
                activityDropdown.classList.remove('active');
            }
        });

        // filter selection
        let filterItems = document.querySelectorAll('.activity-dropdown-item');
        for (let i = 0; i < filterItems.length; i++) {
            filterItems[i].onclick = function(e) {
                e.stopPropagation();
                let allItems = document.querySelectorAll('.activity-dropdown-item');
                for (let j = 0; j < allItems.length; j++) {
                    allItems[j].classList.remove('active');
                }
                this.classList.add('active');
                activityDropdown.classList.remove('active');
                // re-render with filter
                let filter = this.getAttribute('data-filter');
                renderActivityList(filter);
                // sync mobile tabs
                let mobileTabs = document.querySelectorAll('.activity-tab-btn');
                for (let j = 0; j < mobileTabs.length; j++) {
                    mobileTabs[j].classList.remove('active');
                    if (mobileTabs[j].getAttribute('data-filter') == filter) {
                        mobileTabs[j].classList.add('active');
                    }
                }
            };
        }
    }

    // mobile filter tabs
    let tabBtns = document.querySelectorAll('.activity-tab-btn');
    for (let t = 0; t < tabBtns.length; t++) {
        tabBtns[t].onclick = function(e) {
            e.stopPropagation();
            for (let j = 0; j < tabBtns.length; j++) {
                tabBtns[j].classList.remove('active');
            }
            this.classList.add('active');
            let filter = this.getAttribute('data-filter');
            // re-render activity list with filter
            renderActivityList(filter);
            // also sync with desktop dropdown
            let dropItems = document.querySelectorAll('.activity-dropdown-item');
            for (let j = 0; j < dropItems.length; j++) {
                dropItems[j].classList.remove('active');
                if (dropItems[j].getAttribute('data-filter') == filter) {
                    dropItems[j].classList.add('active');
                }
            }
        };
    }

    // activity more dropdown
    if (activityMoreBtn != null && activityMoreDropdown != null) {
        activityMoreBtn.onclick = function(e) {
            // stop click from closing menu
            e.stopPropagation();
            if (activityMoreDropdown.classList.contains('active')) {
                activityMoreDropdown.classList.remove('active');
            } else {
                activityMoreDropdown.classList.add('active');
            }
            // close the filter dropdown if open
            if (activityDropdown != null) {
                activityDropdown.classList.remove('active');
            }
        };

        // close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (activityMoreDropdown.contains(e.target) == false && e.target != activityMoreBtn) {
                activityMoreDropdown.classList.remove('active');
            }
        });
    }

    // close search modal when clicking overlay
    if (searchModalOverlay != null) {
        searchModalOverlay.onclick = function(e) {
            if (e.target == searchModalOverlay) {
                searchModalOverlay.classList.remove('active');
            }
        };
    }

    // more menu dropdown
    if (moreMenuBtn != null && moreMenuDropdown != null) {
        moreMenuBtn.onclick = function(e) {
            // stop click from closing menu
            e.stopPropagation();
            if (moreMenuDropdown.classList.contains('active')) {
                moreMenuDropdown.classList.remove('active');
            } else {
                moreMenuDropdown.classList.add('active');
            }
        };

        document.addEventListener('click', function(e) {
            if (moreMenuDropdown.contains(e.target) == false && e.target != moreMenuBtn) {
                moreMenuDropdown.classList.remove('active');
            }
        });
    }

    // drafts view toggle (inside same modal)
    if (draftsBtn != null && draftsView != null && createPostForm != null) {
        draftsBtn.onclick = function(e) {
            // stop click from bubbling up
            e.stopPropagation();
            createPostForm.style.display = 'none';
            draftsView.style.display = 'flex';
        };
        if (draftsBackBtn != null) {
            draftsBackBtn.onclick = function(e) {
                // stop click from bubbling up
                e.stopPropagation();
                draftsView.style.display = 'none';
                createPostForm.style.display = '';
            };
        }
    }

    // open modal from FAB
    if (fab != null) {
        fab.onclick = function() {
            if (modalOverlay != null) {
                modalOverlay.classList.add('from-fab');
                modalOverlay.classList.add('active');
            }
            fab.style.display = 'none';
        };
    }

    function closeModal() {
        if (modalOverlay != null) {
            modalOverlay.classList.remove('active');
            modalOverlay.classList.remove('from-fab');
        }
        if (fab != null) fab.style.display = '';
        // clear form
        if (createPostText != null) createPostText.value = '';
        if (postBtn != null) {
            postBtn.disabled = true;
            postBtn.setAttribute('disabled', '');
        }
        let preview = document.getElementById('createPostImagePreview');
        if (preview != null) {
            preview.innerHTML = '';
            preview.style.display = 'none';
        }
        let fileInput = document.getElementById('createPostImage');
        if (fileInput != null) fileInput.value = '';
    }

    // close modal
    if (createPostClose != null) {
        createPostClose.onclick = closeModal;
    }

    // close modal when clicking overlay
    if (modalOverlay != null) {
        modalOverlay.onclick = function(e) {
            if (e.target == modalOverlay) {
                closeModal();
            }
        };
    }

    // check if post button should be enabled
    let addThreadText = document.querySelector('.add-thread-text');
    let addThreadAvatar = document.querySelector('.create-post-avatar-small');

    function checkPostBtn() {
        if (postBtn == null) return;
        let hasText = createPostText != null && createPostText.value.trim() != '';
        let preview = document.getElementById('createPostImagePreview');
        let hasImages = preview != null && preview.querySelectorAll('.create-post-image-item').length > 0;
        if (hasText || hasImages) {
            postBtn.disabled = false;
            postBtn.removeAttribute('disabled');
        } else {
            postBtn.disabled = true;
            postBtn.setAttribute('disabled', '');
        }
    }

    if (createPostText != null) {
        createPostText.addEventListener('input', function() {
            checkPostBtn();
            if (addThreadText != null) {
                if (this.value.trim() != '') {
                    addThreadText.classList.add('active');
                } else {
                    addThreadText.classList.remove('active');
                }
            }
        });
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

    // image upload
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
                                if (preview.children.length == 0) {
                                    preview.style.display = 'none';
                                }
                                checkPostBtn();
                            };
                            item.appendChild(removeBtn);
                            preview.appendChild(item);
                            checkPostBtn();
                        });
                    };
                    reader.readAsDataURL(file);
                })(files[f]);
            }
            createPostImage.value = '';
        };
    }

    // toast functions
    let postToastTimer = null;
    function showPostToast(state) {
        let toast = document.getElementById('postToast');
        let posting = document.getElementById('toastPosting');
        let posted = document.getElementById('toastPosted');
        if (toast == null) return;
        if (postToastTimer != null) {
            clearTimeout(postToastTimer);
            postToastTimer = null;
        }
        if (state == 'posting') {
            if (posting != null) posting.style.display = 'flex';
            if (posted != null) posted.style.display = 'none';
        } else {
            if (posting != null) posting.style.display = 'none';
            if (posted != null) posted.style.display = 'flex';
            postToastTimer = setTimeout(function() {
                toast.classList.remove('active');
                postToastTimer = null;
            }, 4000);
        }
        toast.classList.add('active');
    }

    // post button click handler
    if (postBtn != null) {
        postBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (currentUser == null || !currentUser.username) return;

            let text = '';
            if (createPostText != null) text = createPostText.value.trim();

            // collect images
            let images = [];
            let preview = document.getElementById('createPostImagePreview');
            if (preview != null) {
                let imgElements = preview.querySelectorAll('.create-post-image-item img');
                for (let i = 0; i < imgElements.length; i++) {
                    if (imgElements[i].src && imgElements[i].src != '') {
                        images.push(imgElements[i].src);
                    }
                }
            }

            if (text == '' && images.length == 0) return;

            closeModal();
            showPostToast('posting');

            setTimeout(function() {
                try {
                    let posts = [];
                    let raw = localStorage.getItem('threads_user_posts');
                    if (raw != null) {
                        posts = JSON.parse(raw);
                        if (!Array.isArray(posts)) posts = [];
                    }

                    let newPost = {
                        username: currentUser.username,
                        avatar: currentUser.avatar || '',
                        text: text,
                        time: 'now',
                        likes: 0,
                        comments: 0
                    };
                    if (images.length > 0) {
                        newPost.images = images;
                    }

                    posts.unshift(newPost);
                    localStorage.setItem('threads_user_posts', JSON.stringify(posts));
                } catch(e) {
                    console.log('Post save error:', e);
                }
                showPostToast('posted');
            }, 1200);
        });
    }

    // navigation
    let navBtns = document.querySelectorAll('.nav-btn[data-tab]');
    for (let i = 0; i < navBtns.length; i++) {
        navBtns[i].addEventListener('click', function(e) {
            e.preventDefault();
            // stop click from bubbling up
            e.stopPropagation();
            let tab = this.getAttribute('data-tab');
            console.log('nav clicked: ' + tab);
            if (tab == 'home') {
                window.location.href = 'home.html';
            }
            if (tab == 'profile') {
                window.location.href = 'profile.html';
            }
            if (tab == 'create') {
                if (modalOverlay != null) {
                    modalOverlay.classList.add('active');
                }
            }
            if (tab == 'search') {
                if (searchModalOverlay != null) {
                    renderSearchSuggestions();
                    searchModalOverlay.classList.add('active');
                }
            }
            if (tab == 'activity') {
                window.scrollTo(0, 0);
            }
        });
    }

    // Desktop sidebar menu dropdown
    let menuBtn = document.getElementById('menuBtn');
    let menuDropdown = document.getElementById('menuDropdown');
    let menuMain = document.getElementById('menuMain');
    let menuAppearanceSubmenu = document.getElementById('menuAppearanceSubmenu');
    let menuFeedsSubmenu = document.getElementById('menuFeedsSubmenu');
    let logoutBtn = document.getElementById('logoutBtn');

    if (menuBtn != null && menuDropdown != null) {
        menuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (menuMain) menuMain.style.display = 'block';
            if (menuAppearanceSubmenu) menuAppearanceSubmenu.classList.remove('active');
            if (menuFeedsSubmenu) menuFeedsSubmenu.classList.remove('active');
            if (menuDropdown.classList.contains('active')) {
                menuDropdown.classList.remove('active');
            } else {
                menuDropdown.classList.add('active');
            }
        });

        document.addEventListener('click', function(e) {
            if (!menuDropdown.contains(e.target) && !menuBtn.contains(e.target)) {
                menuDropdown.classList.remove('active');
                if (menuMain) menuMain.style.display = 'block';
                if (menuAppearanceSubmenu) menuAppearanceSubmenu.classList.remove('active');
                if (menuFeedsSubmenu) menuFeedsSubmenu.classList.remove('active');
            }
        });

        // Appearance submenu
        let appearanceBtn = document.getElementById('appearanceBtn');
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
                menuMain.style.display = 'block';
            };
        }

        // Feeds submenu
        let menuFeedsBtn = document.getElementById('menuFeedsBtn');
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
                menuMain.style.display = 'block';
            };
        }

        // Appearance theme options
        let appearanceOptions = menuDropdown.querySelectorAll('.appearance-option');
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

        // Logout
        if (logoutBtn != null) {
            logoutBtn.onclick = function() {
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

    console.log('init done');
}

// wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    init();

    // header logo -> index.html
    let headerLogoLink = document.querySelector('.header-logo-link');
    if (headerLogoLink != null) {
        headerLogoLink.onclick = function(e) {
            e.preventDefault();
            window.location.href = 'index.html';
        };
    }

    // heart button toggle on activity items
    document.addEventListener('click', function(e) {
        let btn = e.target.closest('.activity-action-btn');
        if (btn == null) return;
        let svg = btn.querySelector('svg path');
        if (svg == null) return;
        let path = svg.getAttribute('d');
        if (path.indexOf('20.84') == -1) return; // only heart buttons
        if (btn.classList.contains('liked')) {
            btn.classList.remove('liked');
            let count = parseInt(btn.textContent);
            if (!isNaN(count) && count > 0) btn.lastChild.textContent = count - 1;
        } else {
            btn.classList.add('liked');
            let count = parseInt(btn.textContent);
            if (!isNaN(count)) btn.lastChild.textContent = count + 1;
        }
    });

    // comment button -> open reply modal
    document.addEventListener('click', function(e) {
        let btn = e.target.closest('.activity-action-btn');
        if (btn == null) return;
        let svg = btn.querySelector('svg path');
        if (svg == null) return;
        let path = svg.getAttribute('d');
        // comment icon path starts with "M15.376"
        if (path.indexOf('M15.376') == -1) return;

        // find the parent activity item
        let activityItem = btn.closest('.activity-item');
        if (activityItem == null) return;

        // get post data from the activity item
        let avatar = activityItem.querySelector('.activity-avatar');
        let username = activityItem.querySelector('.activity-username');
        let text = activityItem.querySelector('.activity-text');
        let image = activityItem.querySelector('.activity-post-image');

        // build original post content
        let originalPost = document.getElementById('replyOriginalPost');
        if (originalPost == null) return;

        let html = '';
        if (avatar != null) {
            html += '<img src="' + avatar.src + '" class="reply-original-avatar">';
        }
        html += '<div class="reply-original-content">';
        if (username != null) {
            html += '<span class="reply-original-username">' + username.textContent + '</span>';
        }
        if (text != null) {
            html += '<p class="reply-original-text">' + text.textContent + '</p>';
        }
        if (image != null) {
            html += '<img src="' + image.src + '" class="reply-original-image">';
        }
        html += '</div>';
        originalPost.innerHTML = html;

        // set user info
        let user = null;
        try { user = JSON.parse(localStorage.getItem('threads_user')); } catch(e) {}
        if (user != null) {
            let replyAvatar = document.getElementById('replyUserAvatar');
            let replyUsername = document.getElementById('replyUsername');
            let replyAddAvatar = document.getElementById('replyAddThreadAvatar');
            if (replyAvatar != null) replyAvatar.src = user.avatar;
            if (replyUsername != null) replyUsername.textContent = user.username;
            if (replyAddAvatar != null) replyAddAvatar.src = user.avatar;
        }

        // set placeholder
        let textarea = document.getElementById('replyTextarea');
        if (textarea != null && username != null) {
            textarea.placeholder = 'Reply to ' + username.textContent + '...';
            textarea.value = '';
        }

        // open modal
        let overlay = document.getElementById('replyModalOverlay');
        if (overlay != null) {
            overlay.classList.add('active');
            if (textarea != null) setTimeout(function() { textarea.focus(); }, 100);
        }
    });

    // close reply modal
    let replyClose = document.getElementById('replyPostClose');
    if (replyClose != null) {
        replyClose.onclick = function() {
            let overlay = document.getElementById('replyModalOverlay');
            if (overlay != null) overlay.classList.remove('active');
        };
    }

    // close reply modal on overlay click
    let replyOverlay = document.getElementById('replyModalOverlay');
    if (replyOverlay != null) {
        replyOverlay.onclick = function(e) {
            if (e.target == replyOverlay) {
                replyOverlay.classList.remove('active');
            }
        };
    }

    // reply post button enable/disable
    let replyTextarea = document.getElementById('replyTextarea');
    let replyPostBtn = document.getElementById('replyPostBtn');
    if (replyTextarea != null && replyPostBtn != null) {
        replyTextarea.oninput = function() {
            if (replyTextarea.value.trim() != '') {
                replyPostBtn.disabled = false;
            } else {
                replyPostBtn.disabled = true;
            }
        };
        replyPostBtn.onclick = function() {
            let overlay = document.getElementById('replyModalOverlay');
            if (overlay != null) overlay.classList.remove('active');
            replyTextarea.value = '';
            replyPostBtn.disabled = true;
        };
    }

    // repost button -> open repost bottom sheet
    document.addEventListener('click', function(e) {
        let btn = e.target.closest('.activity-action-btn');
        if (btn == null) return;
        let svg = btn.querySelector('svg');
        if (svg == null) return;
        let label = svg.getAttribute('aria-label');
        if (label != 'Repost') return;

        let overlay = document.getElementById('repostSheetOverlay');
        if (overlay != null) {
            overlay.classList.add('active');
        }
    });

    // close repost sheet on overlay click
    let repostOverlay = document.getElementById('repostSheetOverlay');
    if (repostOverlay != null) {
        repostOverlay.onclick = function(e) {
            if (e.target == repostOverlay) {
                repostOverlay.classList.remove('active');
            }
        };
    }

    // repost sheet item clicks
    let repostBtn = document.getElementById('repostBtn');
    if (repostBtn != null) {
        repostBtn.onclick = function() {
            let overlay = document.getElementById('repostSheetOverlay');
            if (overlay != null) overlay.classList.remove('active');
        };
    }
    let quoteBtn = document.getElementById('quoteBtn');
    if (quoteBtn != null) {
        quoteBtn.onclick = function() {
            let overlay = document.getElementById('repostSheetOverlay');
            if (overlay != null) overlay.classList.remove('active');
        };
    }
});

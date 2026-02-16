// threads clone app

// users data
let users = [
    { id: 1, username: "zuck", name: "Mark Zuckerberg", avatar: "images/avatar1.jpg", verified: true },
    { id: 2, username: "instagram", name: "Instagram", avatar: "images/avatar2.jpg", verified: true },
    { id: 3, username: "johndoe", name: "John Doe", avatar: "images/avatar3.jpg", verified: false },
    { id: 4, username: "janedoe", name: "Jane Doe", avatar: "images/avatar4.jpg", verified: false },
    { id: 5, username: "techguy", name: "Tech Guy", avatar: "images/avatar5.jpg", verified: true },
    { id: 6, username: "designer", name: "Sarah Design", avatar: "images/avatar1.jpg", verified: false },
    { id: 7, username: "coder", name: "Code Master", avatar: "images/avatar2.jpg", verified: true },
    { id: 8, username: "creative", name: "Creative Mind", avatar: "images/avatar3.jpg", verified: false }
];

// posts data
let posts = [
    { id: 1, userId: 1, text: "Welcome to Threads! Let's build something amazing together.", image: "images/post1.jpg", time: "2h", replies: 234, likes: 1542 },
    { id: 2, userId: 2, text: "Threads is now live! Share your thoughts with the world.", image: null, time: "4h", replies: 89, likes: 892 },
    { id: 3, userId: 3, text: "Just discovered this app and I'm loving it so far!", image: "images/post2.jpg", time: "5h", replies: 12, likes: 45 },
    { id: 4, userId: 5, text: "Working on some exciting new features. Stay tuned!", image: null, time: "6h", replies: 67, likes: 234 },
    { id: 5, userId: 6, text: "Design inspiration for today. What do you think?", image: "images/post3.jpg", time: "8h", replies: 23, likes: 178 },
    { id: 6, userId: 7, text: "Coding late into the night. Coffee is my best friend.", image: null, time: "10h", replies: 34, likes: 89 },
    { id: 7, userId: 4, text: "Beautiful sunset today! Had to share this moment.", image: "images/post4.jpg", time: "12h", replies: 56, likes: 345 },
    { id: 8, userId: 8, text: "Creativity flows when you least expect it.", image: null, time: "1d", replies: 18, likes: 67 },
    { id: 9, userId: 1, text: "Building the future, one thread at a time.", image: "images/post1.jpg", time: "1d", replies: 456, likes: 2341 },
    { id: 10, userId: 5, text: "Tech tip of the day: Always backup your code!", image: null, time: "2d", replies: 89, likes: 567 }
];

// captions for new posts
let captions = [
    "Just had an amazing day!",
    "Working on something new...",
    "Love this community!",
    "What a beautiful moment.",
    "Can't stop thinking about this.",
    "New project coming soon!",
    "Grateful for today.",
    "Making progress every day."
];

let times = ["2m", "5m", "15m", "30m", "1h", "2h", "4h", "8h", "12h", "1d", "2d"];

let nextId = 100;

// app state
let feedPosts = [];
let likedPosts = [];
let currentUser = null;
let isLoggedIn = false;
let currentTab = "home";
let isLoading = false;

// show toast notification
function showToast(message) {
    let toast = document.getElementById("toast");
    let toastMessage = document.getElementById("toastMessage");
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add("active");
        setTimeout(function() {
            toast.classList.remove("active");
        }, 3000);
    }
}

// get elements
let feed = document.getElementById("feed");
let modal = document.getElementById("modalOverlay");
let loginFormBox = document.getElementById("loginForm");
let signupFormBox = document.getElementById("signupForm");
let actionPromptBox = document.getElementById("actionPrompt");
let commentPromptBox = document.getElementById("commentPrompt");
let repostPromptBox = document.getElementById("repostPrompt");
let sharePromptBox = document.getElementById("sharePrompt");
let postPromptBox = document.getElementById("postPrompt");
let loginBox = document.getElementById("loginBox");
let userBox = document.getElementById("userBox");
let logoutBtn = document.getElementById("logoutBtn");
let createPostFormBox = document.getElementById("createPostForm");

// save to storage
function saveToStorage(key, data) {
    console.log("saving to storage: " + key);
    localStorage.setItem(key, JSON.stringify(data));
}

// load from storage
function loadFromStorage(key) {
    let data = localStorage.getItem(key);
    if (data != null) {
        return JSON.parse(data);
    }
    return null;
}

// get random number
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// get random avatar
function getRandomAvatar() {
    return 'images/avatar' + (Math.floor(Math.random() * 5) + 1) + '.jpg';
}

// get random image
function getRandomImage() {
    return 'images/post' + (Math.floor(Math.random() * 4) + 1) + '.jpg';
}

// find user by id
function findUserById(id) {
    for (let i = 0; i < users.length; i++) {
        if (users[i].id == id) {
            return users[i];
        }
    }
    return null;
}

// check if post is liked
function isPostLiked(postId) {
    for (let i = 0; i < likedPosts.length; i++) {
        if (likedPosts[i] == postId) {
            return true;
        }
    }
    return false;
}

// add to liked
function addToLiked(postId) {
    if (isPostLiked(postId) == false) {
        likedPosts.push(postId);
    }
}

// remove from liked
function removeFromLiked(postId) {
    let newList = [];
    for (let i = 0; i < likedPosts.length; i++) {
        if (likedPosts[i] != postId) {
            newList.push(likedPosts[i]);
        }
    }
    likedPosts = newList;
}

// apply theme
function applyTheme() {
    let savedTheme = loadFromStorage("threads_theme");
    if (savedTheme == null) {
        savedTheme = "auto";
    }
    let theme = savedTheme;
    if (savedTheme == "auto") {
        if (window.matchMedia("(prefers-color-scheme: light)").matches) {
            theme = "light";
        } else {
            theme = "dark";
        }
    }
    if (theme == "light") {
        document.documentElement.setAttribute("data-theme", "light");
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
    }
}
applyTheme();

window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function() {
    let savedTheme = loadFromStorage("threads_theme");
    if (savedTheme == "auto" || savedTheme == null) {
        applyTheme();
    }
});

// get registered users
function getRegisteredUsers() {
    let users = loadFromStorage("threads_users_db");
    if (users == null) {
        return {};
    }
    return users;
}

// save registered users
function saveRegisteredUsers(users) {
    saveToStorage("threads_users_db", users);
}

// find user by username
function findUserByUsername(username) {
    let users = getRegisteredUsers();
    let lowerUsername = username.toLowerCase();
    return users[lowerUsername];
}

// register new user
function registerNewUser(name, username, password) {
    let users = getRegisteredUsers();
    let lowerUsername = username.toLowerCase();
    if (users[lowerUsername]) {
        return { success: false, message: "Username already exists" };
    }
    let newUser = {
        id: nextId++,
        name: name,
        username: username,
        password: password,
        avatar: getRandomAvatar()
    };
    users[lowerUsername] = newUser;
    saveRegisteredUsers(users);
    return { success: true, user: newUser };
}

// check login
function checkLoginCredentials(username, password) {
    let user = findUserByUsername(username);
    if (user == null) {
        return { success: false, message: "User not found" };
    }
    if (user.password != password) {
        return { success: false, message: "Wrong password" };
    }
    return { success: true, user: user };
}

// create random post
function createRandomPost() {
    let randomIndex = getRandomNumber(0, users.length - 1);
    let user = users[randomIndex];
    let captionIndex = getRandomNumber(0, captions.length - 1);
    let text = captions[captionIndex];
    let timeIndex = getRandomNumber(0, times.length - 1);
    let time = times[timeIndex];
    let image = null;
    if (Math.random() > 0.3) {
        image = getRandomImage();
    }
    let post = {
        id: nextId++,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
        verified: user.verified,
        text: text,
        image: image,
        time: time,
        likes: getRandomNumber(0, 500),
        replies: getRandomNumber(0, 50),
        reposts: getRandomNumber(0, 30),
        shares: getRandomNumber(0, 20),
        liked: false,
        replyAvatars: [getRandomAvatar(), getRandomAvatar(), getRandomAvatar()]
    };
    return post;
}

// create initial posts
function createInitialPosts() {
    console.log("creating initial posts");
    for (let i = 0; i < posts.length; i++) {
        let post = posts[i];
        let user = findUserById(post.userId);
        if (user != null) {
            let newPost = {
                id: post.id,
                username: user.username,
                name: user.name,
                avatar: user.avatar,
                verified: user.verified,
                text: post.text,
                image: post.image,
                time: post.time,
                likes: post.likes,
                replies: post.replies,
                reposts: getRandomNumber(0, 30),
                shares: getRandomNumber(0, 20),
                liked: false,
                replyAvatars: [getRandomAvatar(), getRandomAvatar(), getRandomAvatar()]
            };
            feedPosts.push(newPost);
        }
    }
}

// create post html (sanitized)
function createPostHTML(post) {
    let avatarsHTML = "";
    for (let i = 0; i < post.replyAvatars.length; i++) {
        avatarsHTML = avatarsHTML + '<img src="' + encodeURI(post.replyAvatars[i]) + '" alt="reply">';
    }
    let verifiedHTML = "";
    if (post.verified == true) {
        verifiedHTML = '<img src="icons/verified.svg" class="verified" width="14" height="14">';
    }
    let imageHTML = "";
    if (post.image != null) {
        if (post.image.indexOf('https://') == 0 || post.image.indexOf('data:image') == 0 || post.image.indexOf('images/') == 0) {
            imageHTML = '<img src="' + encodeURI(post.image) + '" class="post-image" loading="lazy">';
        }
    }
    let likeClass = "action-btn like-btn";
    let likeCount = post.likes;
    if (post.liked == true) {
        likeClass = "action-btn like-btn liked";
        likeCount = post.likes + 1;
    }
    let safeUsername = sanitize(post.username);
    let safeText = sanitize(post.text);
    let html = "";
    html = html + '<article class="post" data-id="' + post.id + '">';
    html = html + '<div class="post-left">';
    html = html + '<img src="' + encodeURI(post.avatar) + '" alt="' + safeUsername + '" class="avatar">';
    html = html + '<div class="post-line"></div>';
    html = html + '<div class="post-replies-avatars">' + avatarsHTML + '</div>';
    html = html + '</div>';
    html = html + '<div class="post-content">';
    html = html + '<div class="post-header">';
    html = html + '<div class="post-user">';
    html = html + '<span class="username">' + safeUsername + '</span>';
    html = html + verifiedHTML;
    html = html + '<span class="post-time">' + sanitize(post.time) + '</span>';
    html = html + '</div>';
    html = html + '<div class="post-menu-wrapper">';
    html = html + '<button class="post-menu" title="More">';
    html = html + '<img src="icons/more.svg" width="20" height="20">';
    html = html + '</button>';
    html = html + '<div class="post-menu-dropdown">';
    html = html + '<button class="post-menu-item copy-link-btn">';
    html = html + '<span>Copy link</span>';
    html = html + '<img src="icons/link.svg" width="20" height="20">';
    html = html + '</button>';
    html = html + '</div>';
    html = html + '</div>';
    html = html + '</div>';
    html = html + '<p class="post-text">' + safeText + '</p>';
    html = html + imageHTML;
    html = html + '<div class="post-actions">';
    html = html + '<button class="' + likeClass + '" data-id="' + post.id + '">';
    html = html + '<svg class="heart-icon" viewBox="0 0 24 24" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
    html = html + '<span class="action-count likes-count">' + likeCount + '</span>';
    html = html + '</button>';
    html = html + '<button class="action-btn comment-btn">';
    html = html + '<img src="icons/comment.svg" width="20" height="20">';
    html = html + '<span class="action-count">' + post.replies + '</span>';
    html = html + '</button>';
    html = html + '<button class="action-btn repost-btn">';
    html = html + '<img src="icons/repost.svg" width="20" height="20">';
    html = html + '<span class="action-count">' + post.reposts + '</span>';
    html = html + '</button>';
    html = html + '<button class="action-btn share-btn">';
    html = html + '<img src="icons/share.svg" width="20" height="20">';
    html = html + '<span class="action-count">' + post.shares + '</span>';
    html = html + '</button>';
    html = html + '</div>';
    html = html + '</div>';
    html = html + '</article>';
    return html;
}

// render feed
function renderFeed() {
    console.log("rendering feed");
    let feedElement = document.getElementById("feed");
    if (feedElement == null) {
        return;
    }
    let html = "";
    for (let i = 0; i < feedPosts.length; i++) {
        html = html + createPostHTML(feedPosts[i]);
    }
    feedElement.innerHTML = html;
    addPostButtonListeners();
}

// add post button listeners
function addPostButtonListeners() {
    // like buttons
    let likeButtons = document.querySelectorAll(".like-btn");
    for (let i = 0; i < likeButtons.length; i++) {
        likeButtons[i].onclick = handleLikeClick;
    }
    // comment buttons
    let commentButtons = document.querySelectorAll(".comment-btn");
    for (let i = 0; i < commentButtons.length; i++) {
        commentButtons[i].onclick = function() {
            if (isLoggedIn == false) {
                openModal("comment");
                return;
            }
            alert("Comments coming soon!");
        };
    }
    // repost buttons
    let repostButtons = document.querySelectorAll(".repost-btn");
    for (let i = 0; i < repostButtons.length; i++) {
        repostButtons[i].onclick = function() {
            if (isLoggedIn == false) {
                openModal("repost");
                return;
            }
            alert("Repost coming soon!");
        };
    }
    // share buttons
    let shareButtons = document.querySelectorAll(".share-btn");
    for (let i = 0; i < shareButtons.length; i++) {
        shareButtons[i].onclick = function() {
            if (isLoggedIn == false) {
                openModal("share");
                return;
            }
            alert("Share coming soon!");
        };
    }
    // post menu overlay (for mobile bottom sheet)
    let postMenuOverlay = document.createElement("div");
    postMenuOverlay.className = "post-menu-overlay";
    document.body.appendChild(postMenuOverlay);

    function closeAllPostMenus() {
        let allDropdowns = document.querySelectorAll(".post-menu-dropdown");
        for (let j = 0; j < allDropdowns.length; j++) {
            allDropdowns[j].classList.remove("active");
        }
        postMenuOverlay.classList.remove("active");
    }

    postMenuOverlay.onclick = function() {
        closeAllPostMenus();
    };

    // menu buttons
    let menuButtons = document.querySelectorAll(".post-menu");
    for (let i = 0; i < menuButtons.length; i++) {
        menuButtons[i].onclick = function(event) {
            event.stopPropagation();
            let dropdown = this.nextElementSibling;
            let isOpen = dropdown.classList.contains("active");
            closeAllPostMenus();
            if (isOpen == false) {
                dropdown.classList.add("active");
                if (window.innerWidth <= 700) {
                    postMenuOverlay.classList.add("active");
                }
            }
        };
    }
    // copy link buttons
    let copyLinkButtons = document.querySelectorAll(".copy-link-btn");
    for (let i = 0; i < copyLinkButtons.length; i++) {
        copyLinkButtons[i].onclick = function(event) {
            event.stopPropagation();
            let link = window.location.href;
            navigator.clipboard.writeText(link);
            closeAllPostMenus();
            showToast("Copied");
        };
    }
}

// handle like click
function handleLikeClick(event) {
    console.log("like clicked");
    if (isLoggedIn == false) {
        openModal("action");
        return;
    }
    let button = event.currentTarget;
    let postId = parseFloat(button.dataset.id);
    let post = null;
    for (let i = 0; i < feedPosts.length; i++) {
        if (feedPosts[i].id == postId) {
            post = feedPosts[i];
            break;
        }
    }
    if (post == null) {
        return;
    }
    if (post.liked == true) {
        post.liked = false;
        removeFromLiked(postId);
        button.classList.remove("liked");
    } else {
        post.liked = true;
        addToLiked(postId);
        button.classList.add("liked");
    }
    let countElement = button.querySelector(".likes-count");
    if (post.liked == true) {
        countElement.textContent = post.likes + 1;
    } else {
        countElement.textContent = post.likes;
    }
    saveToStorage("threads_posts", feedPosts);
    saveToStorage("threads_liked", likedPosts);
}

// open modal
function openModal(type) {
    console.log("opening modal: " + type);
    if (modal == null) {
        return;
    }
    modal.classList.add("active");
    // hide all forms
    if (actionPromptBox != null) { actionPromptBox.style.display = "none"; }
    if (commentPromptBox != null) { commentPromptBox.style.display = "none"; }
    if (repostPromptBox != null) { repostPromptBox.style.display = "none"; }
    if (sharePromptBox != null) { sharePromptBox.style.display = "none"; }
    if (postPromptBox != null) { postPromptBox.style.display = "none"; }
    if (loginFormBox != null) { loginFormBox.style.display = "none"; }
    if (signupFormBox != null) { signupFormBox.style.display = "none"; }
    if (createPostFormBox != null) { createPostFormBox.style.display = "none"; }
    // show the right form
    if (type == "action") {
        if (actionPromptBox != null) { actionPromptBox.style.display = "block"; }
    }
    if (type == "comment") {
        if (commentPromptBox != null) { commentPromptBox.style.display = "block"; }
    }
    if (type == "repost") {
        if (repostPromptBox != null) { repostPromptBox.style.display = "block"; }
    }
    if (type == "share") {
        if (sharePromptBox != null) { sharePromptBox.style.display = "block"; }
    }
    if (type == "post") {
        if (postPromptBox != null) { postPromptBox.style.display = "block"; }
    }
    if (type == "login") {
        if (loginFormBox != null) { loginFormBox.style.display = "block"; }
    }
    if (type == "signup") {
        if (signupFormBox != null) { signupFormBox.style.display = "block"; }
    }
    if (type == "createPost") {
        if (createPostFormBox != null) {
            createPostFormBox.style.display = "block";
            if (currentUser != null) {
                document.getElementById("createPostAvatar").src = currentUser.avatar;
                document.getElementById("createPostUsername").textContent = currentUser.username;
            }
            setTimeout(function() {
                document.getElementById("createPostText").focus();
            }, 100);
        }
    }
}

// close modal
function closeModal() {
    if (modal == null) {
        return;
    }
    modal.classList.remove("active");
    let inputs = document.querySelectorAll(".form-input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = "";
    }
    let errors = document.querySelectorAll(".form-error");
    for (let i = 0; i < errors.length; i++) {
        errors[i].remove();
    }
}

// show form error
function showFormError(form, message) {
    let oldErrors = document.querySelectorAll(".form-error");
    for (let i = 0; i < oldErrors.length; i++) {
        oldErrors[i].remove();
    }
    let errorElement = document.createElement("p");
    errorElement.className = "form-error";
    errorElement.textContent = message;
    form.appendChild(errorElement);
}

// handle login
function handleLogin() {
    console.log("handling login");
    let usernameInput = document.getElementById("loginUsername");
    let passwordInput = document.getElementById("loginPassword");
    let username = sanitize(usernameInput.value.trim());
    let password = passwordInput.value;
    if (username == "" || password == "") {
        showFormError(loginFormBox, "Please fill in all fields");
        return;
    }
    let result = checkLoginCredentials(username, password);
    if (result.success == true) {
        currentUser = result.user;
        isLoggedIn = true;
        saveToStorage("threads_user", currentUser);
        saveToStorage("threads_logged_in", true);
        closeModal();
        updateAuthUI();
        renderFeed();
    } else {
        showFormError(loginFormBox, result.message);
    }
}

// handle signup
function handleSignup() {
    console.log("handling signup");
    let nameInput = document.getElementById("signupName");
    let usernameInput = document.getElementById("signupUsername");
    let passwordInput = document.getElementById("signupPassword");
    let name = sanitize(nameInput.value.trim());
    let username = sanitize(usernameInput.value.trim());
    let password = passwordInput.value;
    if (name == "" || username == "" || password == "") {
        showFormError(signupFormBox, "Please fill in all fields");
        return;
    }
    if (username.length < 3) {
        showFormError(signupFormBox, "Username must be at least 3 characters");
        return;
    }
    if (password.length < 4) {
        showFormError(signupFormBox, "Password must be at least 4 characters");
        return;
    }
    let result = registerNewUser(name, username, password);
    if (result.success == true) {
        currentUser = result.user;
        isLoggedIn = true;
        saveToStorage("threads_user", currentUser);
        saveToStorage("threads_logged_in", true);
        closeModal();
        updateAuthUI();
        renderFeed();
    } else {
        showFormError(signupFormBox, result.message);
    }
}

// handle logout
function handleLogout() {
    console.log("logging out");
    currentUser = null;
    isLoggedIn = false;
    saveToStorage("threads_user", null);
    saveToStorage("threads_logged_in", false);
    updateAuthUI();
    renderFeed();
}

// handle create post
function handleCreatePost() {
    let textInput = document.getElementById("createPostText");
    let text = textInput.value.trim();
    if (text == "") {
        return;
    }
    // max length
    text = text.substring(0, 2200);
    let image = null;
    let previewImg = document.getElementById("createPostPreviewImg");
    let previewBox = document.getElementById("createPostImagePreview");
    if (previewImg != null && previewImg.src && previewBox.style.display != "none") {
        image = previewImg.src;
    }
    let newPost = {
        id: nextId++,
        username: currentUser.username,
        name: currentUser.name,
        avatar: currentUser.avatar,
        verified: false,
        text: text,
        image: image,
        time: "now",
        likes: 0,
        replies: 0,
        reposts: 0,
        shares: 0,
        liked: false,
        replyAvatars: [getRandomAvatar(), getRandomAvatar(), getRandomAvatar()]
    };
    feedPosts.unshift(newPost);
    saveToStorage("threads_posts", feedPosts);
    renderFeed();
    closeModal();
    textInput.value = "";
    document.getElementById("createPostImagePreview").style.display = "none";
    document.getElementById("createPostPreviewImg").src = "";
    document.getElementById("createPostImage").value = "";
}

// update auth ui
function updateAuthUI() {
    let tabletLoginBtn = document.getElementById("tabletLoginBtn");
    let mobileLoginBtn = document.getElementById("mobileLoginBtn");
    let headerTitle = document.getElementById("headerTitle");
    let feedSelector = document.getElementById("feedSelector");
    let composer = document.getElementById("composer");
    let composerAvatar = document.getElementById("composerAvatar");
    let authOnlyItems = document.querySelectorAll('.auth-only');
    if (isLoggedIn == true && currentUser != null) {
        if (loginBox != null) { loginBox.style.display = "none"; }
        if (tabletLoginBtn != null) { tabletLoginBtn.style.display = "none"; }
        if (mobileLoginBtn != null) { mobileLoginBtn.style.display = "none"; }
        if (userBox != null) {
            userBox.style.display = "block";
            document.getElementById("userBoxAvatar").src = currentUser.avatar;
            document.getElementById("userBoxName").textContent = currentUser.name;
            document.getElementById("userBoxUsername").textContent = "@" + currentUser.username;
        }
        if (headerTitle != null) { headerTitle.style.display = "none"; }
        if (feedSelector != null) { feedSelector.style.display = "flex"; }
        if (composer != null) { composer.style.display = "flex"; }
        if (composerAvatar != null) { composerAvatar.src = currentUser.avatar; }
        let fab = document.getElementById("fab");
        if (fab != null) { fab.style.display = "flex"; }
        for (let i = 0; i < authOnlyItems.length; i++) {
            authOnlyItems[i].style.display = "";
        }
    } else {
        if (loginBox != null) { loginBox.style.display = "block"; }
        if (tabletLoginBtn != null) { tabletLoginBtn.style.display = ""; }
        if (mobileLoginBtn != null) { mobileLoginBtn.style.display = ""; }
        if (userBox != null) { userBox.style.display = "none"; }
        if (headerTitle != null) { headerTitle.style.display = "block"; }
        if (feedSelector != null) { feedSelector.style.display = "none"; }
        if (composer != null) { composer.style.display = "none"; }
        let fab = document.getElementById("fab");
        if (fab != null) { fab.style.display = "none"; }
        for (let i = 0; i < authOnlyItems.length; i++) {
            authOnlyItems[i].style.display = "none";
        }
    }
}

// load more posts
function loadMorePosts() {
    if (isLoading == true) {
        return;
    }
    isLoading = true;
    console.log("loading more posts");
    setTimeout(function() {
        for (let i = 0; i < 4; i++) {
            feedPosts.push(createRandomPost());
        }
        saveToStorage("threads_posts", feedPosts);
        renderFeed();
        isLoading = false;
    }, 500);
}

// init login page
function initLoginPage() {
    let form = document.getElementById("loginPageForm");
    if (form == null) {
        return;
    }
    form.onsubmit = function(event) {
        event.preventDefault();
        let usernameInput = document.getElementById("loginUsername");
        let passwordInput = document.getElementById("loginPassword");
        let username = usernameInput.value.trim();
        let password = passwordInput.value;
        if (username == "" || password == "") {
            alert("Please fill in all fields");
            return;
        }
        let result = checkLoginCredentials(username, password);
        if (result.success == true) {
            saveToStorage("threads_user", result.user);
            saveToStorage("threads_logged_in", true);
            window.location.href = "index.html";
        } else {
            if (result.message == "User not found") {
                let registerResult = registerNewUser(username, username, password);
                if (registerResult.success == true) {
                    saveToStorage("threads_user", registerResult.user);
                    saveToStorage("threads_logged_in", true);
                    window.location.href = "index.html";
                } else {
                    alert(registerResult.message);
                }
            } else {
                alert(result.message);
            }
        }
    };
    let instagramBtn = document.getElementById("continueInstagram");
    if (instagramBtn != null) {
        instagramBtn.onclick = function() {
            window.location.href = "index.html";
        };
    }
}

// show view
function showView(tab, showLoader) {
    let feedView = document.getElementById("feed");
    let searchView = document.getElementById("searchView");
    let headerTitle = document.querySelector(".header h1");
    if (feedView != null) { feedView.style.display = "none"; }
    if (searchView != null) { searchView.style.display = "none"; }
    let existingLoader = document.querySelector(".feed-loader");
    if (existingLoader != null) { existingLoader.remove(); }
    if (tab == "home") {
        if (headerTitle != null) { headerTitle.style.visibility = "visible"; }
        if (showLoader == true && feedView != null) {
            let loader = document.createElement("div");
            loader.className = "feed-loader";
            loader.innerHTML = '<div class="spinner"></div>';
            feedView.parentNode.insertBefore(loader, feedView);
            setTimeout(function() {
                loader.remove();
                if (feedView != null) { feedView.style.display = "flex"; }
            }, 800);
        } else {
            if (feedView != null) { feedView.style.display = "flex"; }
        }
    }
    if (tab == "search") {
        if (searchView != null) { searchView.style.display = "block"; }
        if (headerTitle != null) { headerTitle.style.visibility = "hidden"; }
    }
}

// setup event listeners
function setupEventListeners() {
    if (modal != null) {
        modal.onclick = function(event) {
            if (event.target == modal) {
                closeModal();
            }
        };
    }
    let modalCloseBtn = document.getElementById("modalCloseBtn");
    if (modalCloseBtn != null) {
        modalCloseBtn.onclick = function(event) {
            event.stopPropagation();
            closeModal();
        };
    }
    let showLoginBtn = document.getElementById("showLoginBtn");
    if (showLoginBtn != null) {
        showLoginBtn.onclick = function() {
            window.location.href = 'continue.html';
        };
    }
    let showUsernameLoginBtn = document.getElementById("showUsernameLoginBtn");
    if (showUsernameLoginBtn != null) {
        showUsernameLoginBtn.onclick = function(e) {
            e.preventDefault();
            window.location.href = 'login.html';
        };
    }
    let switchToSignup = document.getElementById("switchToSignup");
    let switchToLogin = document.getElementById("switchToLogin");
    if (switchToSignup != null) {
        switchToSignup.onclick = function(event) {
            event.preventDefault();
            openModal("signup");
        };
    }
    if (switchToLogin != null) {
        switchToLogin.onclick = function(event) {
            event.preventDefault();
            openModal("login");
        };
    }
    let loginSubmitBtn = document.getElementById("loginSubmit");
    let signupSubmitBtn = document.getElementById("signupSubmit");
    if (loginSubmitBtn != null) { loginSubmitBtn.onclick = handleLogin; }
    if (signupSubmitBtn != null) { signupSubmitBtn.onclick = handleSignup; }
    if (logoutBtn != null) { logoutBtn.onclick = handleLogout; }
    let instagramBtn = document.getElementById("continueInstagram");
    if (instagramBtn != null) {
        instagramBtn.onclick = function() { window.location.href = "continue.html"; };
    }
    let instagramBtnComment = document.getElementById("continueInstagramComment");
    if (instagramBtnComment != null) {
        instagramBtnComment.onclick = function() { window.location.href = "continue.html"; };
    }
    let instagramBtnRepost = document.getElementById("continueInstagramRepost");
    if (instagramBtnRepost != null) {
        instagramBtnRepost.onclick = function() { window.location.href = "continue.html"; };
    }
    let instagramBtnShare = document.getElementById("continueInstagramShare");
    if (instagramBtnShare != null) {
        instagramBtnShare.onclick = function() { window.location.href = "continue.html"; };
    }
    let instagramBtnPost = document.getElementById("continueInstagramPost");
    if (instagramBtnPost != null) {
        instagramBtnPost.onclick = function() { window.location.href = "continue.html"; };
    }
    let actionToSignup = document.getElementById("actionToSignup");
    if (actionToSignup != null) {
        actionToSignup.onclick = function(event) {
            event.preventDefault();
            openModal("signup");
        };
    }
    let tabletLoginBtn = document.getElementById("tabletLoginBtn");
    if (tabletLoginBtn != null) {
        tabletLoginBtn.onclick = function() { window.location.href = 'login.html'; };
    }
    let searchCancelBtn = document.getElementById("searchCancelBtn");
    if (searchCancelBtn != null) {
        searchCancelBtn.onclick = function() {
            let navButtons = document.querySelectorAll(".nav-btn");
            for (let j = 0; j < navButtons.length; j++) {
                navButtons[j].classList.remove("active");
            }
            let homeBtn = document.querySelector('.nav-btn[data-tab="home"]');
            if (homeBtn != null) { homeBtn.classList.add("active"); }
            currentTab = "home";
            saveToStorage("threads_tab", "home");
            showView("home", false);
        };
    }
    let formInputs = document.querySelectorAll(".form-input");
    for (let i = 0; i < formInputs.length; i++) {
        formInputs[i].onkeypress = function(event) {
            if (event.key == "Enter") {
                if (loginFormBox != null && loginFormBox.style.display == "block") {
                    handleLogin();
                }
                if (signupFormBox != null && signupFormBox.style.display == "block") {
                    handleSignup();
                }
            }
        };
    }
    let navButtons = document.querySelectorAll(".nav-btn");
    for (let i = 0; i < navButtons.length; i++) {
        navButtons[i].onclick = function(event) {
            let button = event.currentTarget;
            let tab = button.dataset.tab;
            if (tab == "home" || tab == "search") {
                for (let j = 0; j < navButtons.length; j++) {
                    navButtons[j].classList.remove("active");
                }
                button.classList.add("active");
                currentTab = tab;
                saveToStorage("threads_tab", tab);
                if (tab == "home") {
                    showView(tab, true);
                } else {
                    showView(tab, false);
                }
                return;
            }
            if (tab == "create") {
                if (isLoggedIn == true) {
                    openModal("createPost");
                } else {
                    openModal("post");
                }
                return;
            }
            if ((tab == "activity" || tab == "profile") && isLoggedIn == false) {
                openModal("share");
                return;
            }
        };
    }
    let logoLink = document.querySelector(".logo-link");
    if (logoLink != null) {
        logoLink.onclick = function(e) {
            e.preventDefault();
            for (let j = 0; j < navButtons.length; j++) {
                navButtons[j].classList.remove("active");
            }
            let homeBtn = document.querySelector('.nav-btn[data-tab="home"]');
            if (homeBtn != null) { homeBtn.classList.add("active"); }
            currentTab = "home";
            saveToStorage("threads_tab", "home");
            showView("home", true);
            window.scrollTo(0, 0);
        };
    }
    let pinBtn = document.getElementById("pinBtn");
    if (pinBtn != null) {
        pinBtn.onclick = function() {
            if (isLoggedIn == false) { openModal("share"); }
        };
    }
    window.onscroll = function() {
        saveToStorage("threads_scroll", window.scrollY);
        let scrollPosition = window.innerHeight + window.scrollY;
        let pageHeight = document.body.offsetHeight;
        if (scrollPosition >= pageHeight - 500) {
            loadMorePosts();
        }
        // mobile-top-bar background on scroll
        let topBar = document.querySelector('.mobile-top-bar');
        if (topBar != null) {
            if (window.scrollY > 10) {
                topBar.classList.add('scrolled');
            } else {
                topBar.classList.remove('scrolled');
            }
        }
    };
    let menuBtn = document.getElementById("menuBtn");
    let dropdownMenu = document.getElementById("menuDropdown");
    if (menuBtn != null && dropdownMenu != null) {
        menuBtn.onclick = function(event) {
            event.stopPropagation();
            if (dropdownMenu.classList.contains("active")) {
                dropdownMenu.classList.remove("active");
            } else {
                // Always show main menu when opening
                let menuMain = document.getElementById("menuMain");
                let menuAppearance = document.getElementById("menuAppearanceSubmenu");
                let menuFeeds = document.getElementById("menuFeedsSubmenu");
                if (menuMain) menuMain.style.display = "block";
                if (menuAppearance) menuAppearance.classList.remove("active");
                if (menuFeeds) menuFeeds.classList.remove("active");
                dropdownMenu.classList.add("active");
            }
        };
        dropdownMenu.onclick = function(event) {
            event.stopPropagation();
        };
        document.onclick = function(event) {
            if (dropdownMenu.contains(event.target) == false && event.target != menuBtn) {
                dropdownMenu.classList.remove("active");
            }
            let postMenuDropdowns = document.querySelectorAll(".post-menu-dropdown");
            let anyOpen = false;
            for (let i = 0; i < postMenuDropdowns.length; i++) {
                let dropdown = postMenuDropdowns[i];
                let wrapper = dropdown.closest(".post-menu-wrapper");
                if (wrapper != null && wrapper.contains(event.target) == false) {
                    dropdown.classList.remove("active");
                } else if (dropdown.classList.contains("active")) {
                    anyOpen = true;
                }
            }
            if (!anyOpen) {
                postMenuOverlay.classList.remove("active");
            }
        };
        let appearanceBtn = document.getElementById("appearanceBtn");
        let menuMain = document.getElementById("menuMain");
        let menuAppearance = document.getElementById("menuAppearanceSubmenu");
        let menuFeedsSubmenu = document.getElementById("menuFeedsSubmenu");
        if (appearanceBtn != null && menuMain != null && menuAppearance != null) {
            appearanceBtn.onclick = function() {
                menuMain.style.display = "none";
                menuAppearance.classList.add("active");
            };
        }
        let backBtn = document.getElementById("appearanceBackBtn");
        if (backBtn != null && menuMain != null && menuAppearance != null) {
            backBtn.onclick = function() {
                menuAppearance.classList.remove("active");
                menuMain.style.display = "block";
            };
        }
        let menuFeedsBtn = document.getElementById("menuFeedsBtn");
        if (menuFeedsBtn != null && menuMain != null && menuFeedsSubmenu != null) {
            menuFeedsBtn.onclick = function() {
                menuMain.style.display = "none";
                menuFeedsSubmenu.classList.add("active");
            };
        }
        let menuFeedsBackBtn = document.getElementById("menuFeedsBackBtn");
        if (menuFeedsBackBtn != null && menuMain != null && menuFeedsSubmenu != null) {
            menuFeedsBackBtn.onclick = function() {
                menuFeedsSubmenu.classList.remove("active");
                menuMain.style.display = "block";
            };
        }
        let themeButtons = dropdownMenu.querySelectorAll(".appearance-option");
        for (let i = 0; i < themeButtons.length; i++) {
            themeButtons[i].onclick = function(event) {
                let button = event.currentTarget;
                let theme = button.dataset.theme;
                for (let j = 0; j < themeButtons.length; j++) {
                    themeButtons[j].classList.remove("active");
                }
                button.classList.add("active");
                if (theme == "light") {
                    document.documentElement.setAttribute("data-theme", "light");
                    saveToStorage("threads_theme", "light");
                } else if (theme == "dark") {
                    document.documentElement.setAttribute("data-theme", "dark");
                    saveToStorage("threads_theme", "dark");
                } else {
                    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
                        document.documentElement.setAttribute("data-theme", "light");
                    } else {
                        document.documentElement.setAttribute("data-theme", "dark");
                    }
                    saveToStorage("threads_theme", "auto");
                }
            };
        }
        let reportBtn = document.getElementById("reportBtn");
        let reportModalOverlay = document.getElementById("reportModalOverlay");
        let reportModalClose = document.getElementById("reportModalClose");
        let reportSubmitBtn = document.getElementById("reportSubmitBtn");
        let reportTextarea = document.getElementById("reportTextarea");

        if (reportBtn != null && reportModalOverlay != null) {
            reportBtn.onclick = function() {
                dropdownMenu.classList.remove("active");
                reportModalOverlay.classList.add("active");
            };
        }
        if (reportModalClose != null && reportModalOverlay != null) {
            reportModalClose.onclick = function() {
                reportModalOverlay.classList.remove("active");
                if (reportTextarea) reportTextarea.value = "";
                if (reportSubmitBtn) reportSubmitBtn.classList.remove("active");
                clearReportAttachments();
            };
        }
        if (reportSubmitBtn != null && reportModalOverlay != null) {
            reportSubmitBtn.onclick = function() {
                if (reportTextarea && reportTextarea.value.trim()) {
                    // Show loading spinner
                    reportSubmitBtn.classList.add("loading");

                    // Save to localStorage
                    saveReport(reportTextarea.value.trim(), reportAttachments);

                    // Simulate delay then close and show toast
                    setTimeout(function() {
                        reportSubmitBtn.classList.remove("loading");
                        reportModalOverlay.classList.remove("active");
                        reportTextarea.value = "";
                        reportSubmitBtn.classList.remove("active");
                        clearReportAttachments();

                        // Show toast
                        showToast("Thank you for reporting this problem.");
                    }, 1500);
                }
            };
        }

        function showToast(message) {
            let toast = document.getElementById("toast");
            let toastMessage = document.getElementById("toastMessage");
            if (toast && toastMessage) {
                toastMessage.textContent = message;
                toast.classList.add("active");
                setTimeout(function() {
                    toast.classList.remove("active");
                }, 3000);
            }
        }

        function saveReport(text, attachments) {
            let reports = JSON.parse(localStorage.getItem("threads_reports") || "[]");
            let report = {
                id: Date.now(),
                text: text,
                attachments: [],
                date: new Date().toISOString()
            };

            // read attachments and save report
            if (attachments.length > 0) {
                let base64Images = [];
                let loaded = 0;
                for (let i = 0; i < attachments.length; i++) {
                    let reader = new FileReader();
                    reader.onload = function(e) {
                        base64Images.push(e.target.result);
                        loaded++;
                        // when all files are loaded, save the report
                        if (loaded == attachments.length) {
                            report.attachments = base64Images;
                            reports.push(report);
                            localStorage.setItem("threads_reports", JSON.stringify(reports));
                        }
                    };
                    reader.readAsDataURL(attachments[i]);
                }
            } else {
                reports.push(report);
                localStorage.setItem("threads_reports", JSON.stringify(reports));
            }
        }
        if (reportTextarea != null && reportSubmitBtn != null) {
            reportTextarea.oninput = function() {
                if (reportTextarea.value.trim()) {
                    reportSubmitBtn.classList.add("active");
                } else {
                    reportSubmitBtn.classList.remove("active");
                }
            };
        }
        if (reportModalOverlay != null) {
            reportModalOverlay.onclick = function(e) {
                if (e.target === reportModalOverlay) {
                    reportModalOverlay.classList.remove("active");
                    if (reportTextarea) reportTextarea.value = "";
                    if (reportSubmitBtn) reportSubmitBtn.classList.remove("active");
                    clearReportAttachments();
                }
            };
        }

        // Attach button functionality
        let reportAttachBtn = document.getElementById("reportAttachBtn");
        let reportFileInput = document.getElementById("reportFileInput");
        let reportAttachments = [];

        if (reportAttachBtn && reportFileInput) {
            reportAttachBtn.onclick = function() {
                reportFileInput.click();
            };

            reportFileInput.onchange = function(e) {
                let files = e.target.files;
                for (let i = 0; i < files.length; i++) {
                    let file = files[i];
                    if (file.type.startsWith("image/")) {
                        reportAttachments.push(file);
                        showAttachmentPreview(file);
                    }
                }
                reportFileInput.value = "";
            };
        }

        function showAttachmentPreview(file) {
            let footer = document.querySelector(".report-modal-footer");
            let container = document.querySelector(".report-attachments");
            if (!container) {
                container = document.createElement("div");
                container.className = "report-attachments";
                footer.parentNode.insertBefore(container, footer);
            }

            let reader = new FileReader();
            reader.onload = function(e) {
                let preview = document.createElement("div");
                preview.className = "report-attachment-preview";
                preview.innerHTML = '<img src="' + e.target.result + '"><button class="report-attachment-remove">×</button>';
                preview.querySelector(".report-attachment-remove").onclick = function() {
                    let index = reportAttachments.indexOf(file);
                    if (index > -1) reportAttachments.splice(index, 1);
                    preview.remove();
                    if (reportAttachments.length === 0) {
                        let cont = document.querySelector(".report-attachments");
                        if (cont) cont.remove();
                    }
                };
                container.appendChild(preview);
            };
            reader.readAsDataURL(file);
        }

        function clearReportAttachments() {
            reportAttachments = [];
            let container = document.querySelector(".report-attachments");
            if (container) container.remove();
        }
    }

    // Mobile top bar menu
    let mobileMenuBtn = document.getElementById('mobileMenuBtn');
    let mobileMenuDropdown = document.getElementById('mobileMenuDropdown');
    if (mobileMenuBtn != null && mobileMenuDropdown != null) {
        mobileMenuBtn.onclick = function(e) {
            e.stopPropagation();
            if (mobileMenuDropdown.classList.contains('active')) {
                mobileMenuDropdown.classList.remove('active');
            } else {
                // show main menu
                let main = document.getElementById('mobileMenuMain');
                let appSub = document.getElementById('mobileAppearanceSubmenu');
                let feedsSub = document.getElementById('mobileFeedsSubmenu');
                if (main) main.style.display = 'block';
                if (appSub) appSub.classList.remove('active');
                if (feedsSub) feedsSub.classList.remove('active');
                mobileMenuDropdown.classList.add('active');
            }
        };
        mobileMenuDropdown.onclick = function(e) {
            e.stopPropagation();
        };
        document.addEventListener('click', function(e) {
            if (mobileMenuDropdown.contains(e.target) == false && e.target != mobileMenuBtn) {
                mobileMenuDropdown.classList.remove('active');
            }
        });

        // Appearance submenu
        let mobileAppearanceBtn = document.getElementById('mobileAppearanceBtn');
        let mobileAppearanceSubmenu = document.getElementById('mobileAppearanceSubmenu');
        let mobileMenuMain = document.getElementById('mobileMenuMain');
        if (mobileAppearanceBtn != null && mobileAppearanceSubmenu != null && mobileMenuMain != null) {
            mobileAppearanceBtn.onclick = function() {
                mobileMenuMain.style.display = 'none';
                mobileAppearanceSubmenu.classList.add('active');
            };
        }
        let mobileAppearanceBackBtn = document.getElementById('mobileAppearanceBackBtn');
        if (mobileAppearanceBackBtn != null) {
            mobileAppearanceBackBtn.onclick = function() {
                mobileAppearanceSubmenu.classList.remove('active');
                mobileMenuMain.style.display = 'block';
            };
        }

        // Feeds submenu
        let mobileFeedsBtn = document.getElementById('mobileFeedsBtn');
        let mobileFeedsSubmenu = document.getElementById('mobileFeedsSubmenu');
        if (mobileFeedsBtn != null && mobileFeedsSubmenu != null && mobileMenuMain != null) {
            mobileFeedsBtn.onclick = function() {
                mobileMenuMain.style.display = 'none';
                mobileFeedsSubmenu.classList.add('active');
            };
        }
        let mobileFeedsBackBtn = document.getElementById('mobileFeedsBackBtn');
        if (mobileFeedsBackBtn != null) {
            mobileFeedsBackBtn.onclick = function() {
                mobileFeedsSubmenu.classList.remove('active');
                mobileMenuMain.style.display = 'block';
            };
        }

        // Theme switching
        let mobileThemeBtns = mobileMenuDropdown.querySelectorAll('.appearance-option');
        for (let i = 0; i < mobileThemeBtns.length; i++) {
            mobileThemeBtns[i].onclick = function(e) {
                let theme = this.getAttribute('data-theme');
                for (let j = 0; j < mobileThemeBtns.length; j++) {
                    mobileThemeBtns[j].classList.remove('active');
                }
                this.classList.add('active');
                if (theme == 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                    saveToStorage('threads_theme', 'light');
                } else if (theme == 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    saveToStorage('threads_theme', 'dark');
                } else {
                    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
                        document.documentElement.setAttribute('data-theme', 'light');
                    } else {
                        document.documentElement.setAttribute('data-theme', 'dark');
                    }
                    saveToStorage('threads_theme', 'auto');
                }
            };
        }

        // Logout
        let mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        if (mobileLogoutBtn != null) {
            mobileLogoutBtn.onclick = function() {
                localStorage.removeItem('threads_user');
                localStorage.removeItem('threads_logged_in');
                window.location.reload();
            };
        }
    }

    // Filter functionality - moved outside menuBtn block
    let filterBtn = document.getElementById("filterBtn");
    let filterDropdown = document.getElementById("filterDropdown");
    let filterTags = document.getElementById("filterTags");
    if (filterBtn != null && filterDropdown != null) {
        filterBtn.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Close calendar when opening dropdown
            let calPicker = document.getElementById("calendarPicker");
            if (calPicker) calPicker.classList.remove("active");

            if (filterDropdown.classList.contains("active")) {
                filterDropdown.classList.remove("active");
            } else {
                filterDropdown.classList.add("active");
            }
        });
        document.addEventListener("click", function(e) {
            if (filterDropdown.contains(e.target) == false && filterBtn.contains(e.target) == false) {
                filterDropdown.classList.remove("active");
            }
        });

        // Calendar and filter tags
        let calendarPicker = document.getElementById("calendarPicker");
        let calendarGrid = document.getElementById("calendarGrid");
        let calendarMonthYear = document.getElementById("calendarMonthYear");
        let calendarPrev = document.getElementById("calendarPrev");
        let calendarNext = document.getElementById("calendarNext");
        let calMonth = new Date().getMonth();
        let calYear = new Date().getFullYear();
        let calFilterType = null;
        let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        function buildCalendar() {
            if (!calendarGrid || !calendarMonthYear) return;
            calendarMonthYear.textContent = monthNames[calMonth] + " " + calYear;
            calendarGrid.innerHTML = "";
            let firstDay = new Date(calYear, calMonth, 1).getDay();
            let daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
            let today = new Date();
            for (let i = 0; i < firstDay; i++) {
                let empty = document.createElement("div");
                empty.className = "calendar-day empty";
                calendarGrid.appendChild(empty);
            }
            for (let d = 1; d <= daysInMonth; d++) {
                let dayBtn = document.createElement("button");
                dayBtn.className = "calendar-day";
                dayBtn.textContent = d;
                dayBtn.dataset.day = d;
                if (d == today.getDate() && calMonth == today.getMonth() && calYear == today.getFullYear()) {
                    dayBtn.classList.add("today");
                }
                dayBtn.onclick = function() {
                    let picked = new Date(calYear, calMonth, parseInt(this.dataset.day));
                    let formatted = picked.getDate() + " " + monthNames[picked.getMonth()].substring(0, 3) + " " + picked.getFullYear();
                    updateDateTag(calFilterType, formatted);
                    if (calendarPicker) calendarPicker.classList.remove("active");
                };
                calendarGrid.appendChild(dayBtn);
            }
        }

        function openCalendar(type, clickedTag) {
            if (!calendarPicker) return;

            // Close dropdown when opening calendar
            filterDropdown.classList.remove("active");

            calFilterType = type;
            calMonth = new Date().getMonth();
            calYear = new Date().getFullYear();
            buildCalendar();

            // Position calendar near the clicked tag
            if (clickedTag) {
                let tagRect = clickedTag.getBoundingClientRect();
                let containerRect = document.querySelector('.search-container').getBoundingClientRect();
                let leftPos = tagRect.left - containerRect.left;
                calendarPicker.style.left = leftPos + 'px';
            }

            calendarPicker.classList.add("active");
        }

        // Create date tag with today's date
        function createDateTagEmpty(type) {
            if (!type || !filterTags) return;
            if (filterTags.querySelector('[data-filter="' + type + '"]')) return;
            let label = type == "after" ? "After" : "Before";
            let today = new Date();
            let todayFormatted = today.getDate() + " " + monthNames[today.getMonth()].substring(0, 3) + " " + today.getFullYear();
            let tag = document.createElement("div");
            tag.className = "filter-tag";
            tag.setAttribute("data-filter", type);
            tag.innerHTML = '<span class="filter-tag-label">' + label + '</span><span class="filter-tag-value">' + todayFormatted + '</span><button class="filter-tag-close"></button>';
            tag.querySelector(".filter-tag-close").onclick = function(ev) {
                ev.stopPropagation();
                tag.remove();
            };
            tag.onclick = function(ev) {
                if (ev.target.classList.contains("filter-tag-close")) return;
                let filterType = tag.getAttribute("data-filter");
                openCalendar(filterType, tag);
            };
            filterTags.appendChild(tag);
        }

        // Update existing date tag with date
        function updateDateTag(type, dateStr) {
            if (!type || !filterTags) return;
            let existing = filterTags.querySelector('[data-filter="' + type + '"]');
            if (existing) {
                existing.querySelector(".filter-tag-value").textContent = dateStr;
            }
        }

        // Create profile tag with input
        function createProfileTag() {
            if (!filterTags) return;
            // Close calendar when profile tag is used
            if (calendarPicker) calendarPicker.classList.remove("active");
            if (filterTags.querySelector('[data-filter="profile"]')) {
                // Focus existing input
                let existingInput = filterTags.querySelector('[data-filter="profile"] .filter-tag-input');
                if (existingInput) existingInput.focus();
                return;
            }
            let tag = document.createElement("div");
            tag.className = "filter-tag";
            tag.setAttribute("data-filter", "profile");
            tag.innerHTML = '<span class="filter-tag-label">From</span><input type="text" class="filter-tag-input" placeholder="Profile"><button class="filter-tag-close"></button>';
            tag.querySelector(".filter-tag-close").onclick = function(ev) {
                ev.stopPropagation();
                tag.remove();
            };
            tag.onclick = function(ev) {
                if (ev.target.classList.contains("filter-tag-close")) return;
                // Close calendar when clicking profile tag
                if (calendarPicker) calendarPicker.classList.remove("active");
                tag.querySelector(".filter-tag-input").focus();
            };
            filterTags.appendChild(tag);
            // Focus the input immediately
            tag.querySelector(".filter-tag-input").focus();
        }

        if (calendarPrev) {
            calendarPrev.onclick = function(e) {
                e.stopPropagation();
                calMonth--;
                if (calMonth < 0) { calMonth = 11; calYear--; }
                buildCalendar();
            };
        }
        if (calendarNext) {
            calendarNext.onclick = function(e) {
                e.stopPropagation();
                calMonth++;
                if (calMonth > 11) { calMonth = 0; calYear++; }
                buildCalendar();
            };
        }

        // Filter items click
        let filterItems = filterDropdown.querySelectorAll(".filter-item");
        for (let i = 0; i < filterItems.length; i++) {
            filterItems[i].onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                let fType = this.getAttribute("data-filter");
                let fLabel = this.querySelector("span").textContent.replace("...", "");
                filterDropdown.classList.remove("active");
                if (fType == "after" || fType == "before") {
                    createDateTagEmpty(fType);
                    return;
                }
                if (fType == "profile") {
                    createProfileTag();
                    return;
                }
                if (filterTags.querySelector('[data-filter="' + fType + '"]')) return;
                let tag = document.createElement("div");
                tag.className = "filter-tag";
                tag.setAttribute("data-filter", fType);
                tag.innerHTML = '<span class="filter-tag-label">' + fLabel + '</span><button class="filter-tag-close"></button>';
                tag.querySelector(".filter-tag-close").onclick = function(ev) {
                    ev.stopPropagation();
                    tag.remove();
                };
                filterTags.appendChild(tag);
            };
        }

        // Close calendar on outside click
        document.addEventListener("click", function(e) {
            if (calendarPicker && !calendarPicker.contains(e.target) && !filterDropdown.contains(e.target) && !filterTags.contains(e.target)) {
                calendarPicker.classList.remove("active");
            }
        });
    }

    let createPostClose = document.getElementById("createPostClose");
    let createPostSubmit = document.getElementById("createPostSubmit");
    let createPostImage = document.getElementById("createPostImage");
    let removeImageBtn = document.getElementById("removeImageBtn");
    if (createPostClose != null) {
        createPostClose.onclick = function() {
            closeModal();
            document.getElementById("createPostText").value = "";
            document.getElementById("createPostImagePreview").style.display = "none";
            document.getElementById("createPostPreviewImg").src = "";
            document.getElementById("createPostImage").value = "";
        };
    }
    if (createPostSubmit != null) { createPostSubmit.onclick = handleCreatePost; }
    if (createPostImage != null) {
        createPostImage.onchange = function(event) {
            let file = event.target.files[0];
            if (file != null) {
                let reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById("createPostPreviewImg").src = e.target.result;
                    document.getElementById("createPostImagePreview").style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        };
    }
    if (removeImageBtn != null) {
        removeImageBtn.onclick = function() {
            document.getElementById("createPostImagePreview").style.display = "none";
            document.getElementById("createPostPreviewImg").src = "";
            document.getElementById("createPostImage").value = "";
        };
    }
    let composerPostBtn = document.getElementById("composerPostBtn");
    let composerInput = document.getElementById("composerInput");
    if (composerPostBtn != null && composerInput != null) {
        composerPostBtn.onclick = function() {
            let text = composerInput.value.trim();
            if (text == "" || isLoggedIn == false || currentUser == null) {
                return;
            }
            // max length
            text = text.substring(0, 2200);
            let newPost = {
                id: nextId++,
                username: currentUser.username,
                name: currentUser.name,
                avatar: currentUser.avatar,
                verified: false,
                text: text,
                image: null,
                time: "now",
                likes: 0,
                replies: 0,
                reposts: 0,
                shares: 0,
                liked: false,
                replyAvatars: [getRandomAvatar(), getRandomAvatar(), getRandomAvatar()]
            };
            feedPosts.unshift(newPost);
            saveToStorage("threads_posts", feedPosts);
            renderFeed();
            composerInput.value = "";
        };
    }
    let fab = document.getElementById("fab");
    if (fab != null) {
        fab.onclick = function() {
            if (isLoggedIn == true && currentUser != null) {
                openModal("createPost");
            }
        };
    }
    let savedTheme = loadFromStorage("threads_theme");
    if (savedTheme == null) { savedTheme = "auto"; }
    let themeButtons = document.querySelectorAll(".theme-btn");
    for (let i = 0; i < themeButtons.length; i++) {
        themeButtons[i].classList.remove("active");
        if (themeButtons[i].dataset.theme == savedTheme) {
            themeButtons[i].classList.add("active");
        }
    }
}

// main init
function init() {
    console.log("init starting");
    if (document.body.classList.contains("login-page")) {
        initLoginPage();
        return;
    }
    if (feed == null) {
        return;
    }
    let filterTags = document.getElementById("filterTags");
    if (filterTags != null) { filterTags.innerHTML = ""; }
    feedPosts = [];
    createInitialPosts();
    let savedLiked = loadFromStorage("threads_liked");
    if (savedLiked != null) {
        likedPosts = savedLiked;
        for (let i = 0; i < feedPosts.length; i++) {
            feedPosts[i].liked = isPostLiked(feedPosts[i].id);
        }
    }
    isLoggedIn = loadFromStorage("threads_logged_in");
    if (isLoggedIn == null) { isLoggedIn = false; }
    currentUser = loadFromStorage("threads_user");
    currentTab = loadFromStorage("threads_tab");
    if (currentTab == null) { currentTab = "home"; }
    renderFeed();
    setupEventListeners();
    updateAuthUI();
    let navButtons = document.querySelectorAll(".nav-btn");
    for (let i = 0; i < navButtons.length; i++) {
        navButtons[i].classList.remove("active");
        if (navButtons[i].dataset.tab == currentTab) {
            navButtons[i].classList.add("active");
        }
    }
    showView(currentTab);
    let savedScroll = loadFromStorage("threads_scroll");
    if (savedScroll != null) {
        setTimeout(function() { window.scrollTo(0, savedScroll); }, 100);
    }
    console.log("init done");
}

// debug functions
function clearAllData() {
    localStorage.removeItem("threads_posts");
    localStorage.removeItem("threads_theme");
    localStorage.removeItem("threads_user");
    localStorage.removeItem("threads_liked");
    localStorage.removeItem("threads_users_db");
    localStorage.removeItem("threads_logged_in");
    localStorage.removeItem("threads_tab");
    localStorage.removeItem("threads_scroll");
    location.reload();
}

function showAllData() {
    console.log("=== Saved Data ===");
    console.log("Posts:", loadFromStorage("threads_posts"));
    console.log("Theme:", loadFromStorage("threads_theme"));
    console.log("User:", loadFromStorage("threads_user"));
    console.log("Liked:", loadFromStorage("threads_liked"));
    console.log("Users DB:", loadFromStorage("threads_users_db"));
    console.log("Logged In:", loadFromStorage("threads_logged_in"));
    console.log("Tab:", loadFromStorage("threads_tab"));
    console.log("Scroll:", loadFromStorage("threads_scroll"));
}

init();

window.addEventListener("pageshow", function() {
    let filterTags = document.getElementById("filterTags");
    if (filterTags != null) { filterTags.innerHTML = ""; }
});

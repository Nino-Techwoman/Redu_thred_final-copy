// security.js - helper functions for input validation etc

// sanitize string to prevent xss
function sanitize(str) {
    // make sure str is actually a string
    if (str == null || str == undefined || typeof str == 'number') {
        return '';
    }
    let div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML.trim();
}

// check if email is valid
function validateEmail(email) {
    if (email == null || email == '') {
        return 'Email is required.';
    }
    let pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (pattern.test(email) == false) {
        return 'Please enter a valid email address.';
    }
    return '';
}

// check username - only letters numbers dots underscores
function validateUsername(username) {
    if (username == null || username == '') {
        return 'Username is required.';
    }
    if (username.length < 1) {
        return 'Username is required.';
    }
    if (username.length > 30) {
        return 'Username must be 30 characters or fewer.';
    }
    let pattern = /^[a-zA-Z0-9._]+$/;
    if (pattern.test(username) == false) {
        return 'Username can only contain letters, numbers, dots, and underscores.';
    }
    return '';
}

// create a rate limiter to stop too many attempts
// maxAttempts = how many tries allowed, windowMs = how long to lock out
function createRateLimiter(maxAttempts, windowMs) {
    let attempts = 0;
    let lockoutUntil = 0;

    // check if user tried too many times
    function check() {
        let now = Date.now();
        // check if we are still locked out
        if (now < lockoutUntil) {
            let secs = Math.ceil((lockoutUntil - now) / 1000);
            return { allowed: false, message: 'Too many attempts. Try again in ' + secs + 's.' };
        }
        // add one to attempts
        attempts = attempts + 1;
        // check if too many tries
        if (attempts >= maxAttempts) {
            lockoutUntil = now + windowMs;
            attempts = 0;
            return { allowed: false, message: 'Too many attempts. Try again in ' + Math.ceil(windowMs / 1000) + 's.' };
        }
        return { allowed: true, message: '' };
    }

    // reset back to zero
    function reset() {
        attempts = 0;
        lockoutUntil = 0;
    }

    return { check: check, reset: reset };
}

// session timeout - auto logout after 30 min of no activity
let SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min
let _sessionTimeoutId = null;

function initSessionTimeout() {
    let isLoggedIn = localStorage.getItem('threads_is_logged_in') == 'true';
    if (isLoggedIn == false) {
        return;
    }

    function updateActivity() {
        localStorage.setItem('threads_last_activity', Date.now().toString());
    }

    function checkSession() {
        let lastActivity = parseInt(localStorage.getItem('threads_last_activity'));
        if (lastActivity == null || lastActivity == false) {
            updateActivity();
            return;
        }
        let elapsed = Date.now() - lastActivity;
        if (elapsed > SESSION_TIMEOUT_MS) {
            // expired so log out
            localStorage.removeItem('threads_is_logged_in');
            localStorage.removeItem('threads_user');
            localStorage.removeItem('threads_last_activity');
            window.location.href = 'login.html';
        }
    }

    // check right away
    checkSession();

    // listen for user activity
    let events = ['click', 'keydown', 'mousemove', 'scroll', 'touchstart'];
    for (let i = 0; i < events.length; i++) {
        document.addEventListener(events[i], updateActivity);
    }

    updateActivity();

    // check every 60 seconds
    if (_sessionTimeoutId != null) {
        clearInterval(_sessionTimeoutId);
    }
    _sessionTimeoutId = setInterval(checkSession, 60000);
}

// js/logout.js

document.addEventListener('DOMContentLoaded', () => {
    // Remove the token from localStorage
    localStorage.removeItem('token');

    // Optionally, remove other user data from localStorage
    localStorage.removeItem('user');

    // Redirect to the login page
    window.location.href = 'login.html';
});

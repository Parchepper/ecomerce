// js/app.js

const API_BASE_URL = 'http://localhost:5000/api';
document.addEventListener('DOMContentLoaded', () => {

function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function clearToken() {
    localStorage.removeItem('token');
}

function handleError(error) {
    console.error('API Error:', error);
    showError('An error occurred. Please try again.');
}


// Change background gradient on mouse move
document.addEventListener('mousemove', function(e) {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    const splashContainer = document.querySelector('.splash-container');
    splashContainer.style.background = `linear-gradient(to right, rgba(30,60,114,${1 - x}), rgba(42,82,152,${1 - y}))`;
});
// js/app.js

document.addEventListener('DOMContentLoaded', function() {
    const formContent = document.querySelector('.form-content');
    formContent.classList.add('animate__animated', 'animate__fadeInDown');

    // js/app.js or within a script tag in your HTML

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the default link behavior
            logoutUser();
        });
    }
});

function logoutUser() {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // If you store user info

    // Redirect to the login page
    window.location.href = 'login.html';
}

});

// js/app.js


    // Existing code...

    updateNavbar();

    
});

function updateNavbar() {
    const token = localStorage.getItem('token');
    const navbarMenu = document.getElementById('navbar-menu');
    navbarMenu.innerHTML = ''; // Clear existing links

    if (token) {
        // User is logged in
        navbarMenu.innerHTML = `
            <a href="products.html">Products</a>
            <a href="cart.html">Cart</a>
            <a href="profile.html" class="profile-link">Profile</a>
            <a href="logout.html" id="logout-btn">Logout</a>
        `;
        const profileLink = document.querySelector('.profile-link');
        profileLink.addEventListener('mouseover', preloadProfileData);
    } else {
        // User is not logged in
        navbarMenu.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html">Register</a>
        `;
    }
}

// Add event listeners for pre-loading product data on hover



function preloadProfileData(event) {
   
    // if ([profileId]) {
    //     // Data is already cached
    //     return;
    // }
    const token = localStorage.getItem("token")
   

    // Fetch product data and cache it
    fetch(`${API_BASE_URL}/customer/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        }
    )
        .then(response => response.json())
        .then(profileData => {
            sessionStorage.setItem("cached_user", JSON.stringify(profileData));
        })
        .catch(error => {
            console.error('Error pre-loading profile data:', error);
        });
}

// main.js

function showNotification(message, type = 'success') {
    Toastify({
      text: message,
      duration: 5000,
      close: true,
      gravity: 'top', // 'top' or 'bottom'
      position: 'center', // 'left', 'center' or 'right'
      backgroundColor: type === 'success' ? '#28a745' : '#dc3545',
      stopOnFocus: true, // Prevents dismissing of toast on hover
    }).showToast();
  }

  function showError(message, type = 'error') {
    Toastify({
      text: message,
      duration: 5000,
      close: true,
      gravity: 'top', // 'top' or 'bottom'
      position: 'center', // 'left', 'center' or 'right'
      backgroundColor: type === 'success' ? '#28a745' : '#dc3545',
      stopOnFocus: true, // Prevents dismissing of toast on hover
    }).showToast();
  }
  
  
  




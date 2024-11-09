// js/auth.js


function setToken(token) {
    localStorage.setItem('token', token);
}

function handleError(error) {
    console.error('An error occurred:', error);
    alert('An error occurred. Please try again later.');
}

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');

    if (registerForm) {
        registerForm.addEventListener('submit', registerUser);
    }

    if (loginForm) {
        loginForm.addEventListener('submit', loginUser);
    }
});

async function registerUser(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const userData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const data = await response.json();
            setToken(data.token);
            window.location.href = 'products.html';
        } else {
            const errorData = await response.json();
            showError(errorData.message || 'Registration failed.');
        }
    } catch (error) {
        handleError(error);
    }
}

async function loginUser(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const credentials = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        if (response.ok) {
            const data = await response.json();
            setToken(data.token);
            window.location.href = 'products.html';
        } else {
            const errorData = await response.json();
            showError(errorData.message || 'Login failed.');
        }
    } catch (error) {
        handleError(error);
    }
}

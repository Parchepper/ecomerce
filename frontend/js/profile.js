// js/profile.js

window.onload = () => {
    // Ensure the user is authenticated

    
    if (!isLoggedIn()) {
        alert('You need to log in to view your profile.');
        window.location.href = 'login.html';
        return;
    }
    console.log("hello")

    loadProfile();

    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', updateProfile);
};

function isLoggedIn() {
    return !!localStorage.getItem('token');
}

async function loadProfile() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/customer/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        populateProfileForm(await response.json());


        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function populateProfileForm(customer) {
    console.log("CUSTOMER:", customer);
    document.getElementById('first_name').innerHTML = customer.first_name || '';
    document.getElementById('last_name').innerHTML = customer.last_name || '';
    document.getElementById('email').innerHTML = customer.email || '';
    document.getElementById('phone_number').innerHTML = customer.phone_number || '';
    document.getElementById('billing_address').innerHTML = customer.billing_address || '';
    // Populate additional fields as needed
}

async function updateProfile(event) {
    event.preventDefault();

    const token = localStorage.getItem('token');

    const formData = new FormData(event.target);
    const profileData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_BASE_URL}/customer/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });

        if (response.ok) {
            const updatedCustomer = await response.json();
            alert('Profile updated successfully.');
            populateProfileForm(updatedCustomer);
            document.getElementById("profile-form").style.display = 'none';
            document.getElementById("edit-button").style.display = 'block';
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Failed to update profile.');
        }
    } 
    catch (error) {
        console.error('Error updating profile:', error);
    }
}

// Function to handle edit button click
function handleEditButtonClick() {
    document.getElementById("profile-form").style.display = 'block';
    document.getElementById("edit-button").style.display = 'none';


}




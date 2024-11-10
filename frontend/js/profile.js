// js/profile.js

window.onload = () => {
    // Ensure the user is authenticated

    
    if (!isLoggedIn()) {
        alert('You need to log in to view your profile.');
        window.location.href = 'login.html';
        return;
    }
    

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
        loadOrderHistory();

        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function populateProfileForm(customer) {
    console.log("CUSTOMER:", customer);
    document.getElementById('first_name').innerHTML = customer.first_name || '';
    document.getElementById('email').innerHTML = customer.email || '';
    document.getElementById('phone_number').innerHTML = customer.phone_number || '';
    document.getElementById('billing_address').innerHTML = customer.billing_address || '';
    // Populate additional fields as needed
}

async function loadOrderHistory(){
    // Fetch order history from the server
    fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
    })
      .then(response => response.json())
      .then(orders => {
        console.log("======================================");
        console.log(orders);
        const orderHistoryBody = document.querySelector('#order-history-table tbody');
        orderHistoryBody.innerHTML = '';
        
        orders.forEach(order => {
          const row = document.createElement('tr');
  
          const orderIdCell = document.createElement('td');
          orderIdCell.textContent = order.order_id;
  
          const dateCell = document.createElement('td');
          const orderDate = new Date(order.order_date);
          dateCell.textContent = orderDate.toLocaleDateString();
  
          const totalCell = document.createElement('td');
          totalCell.textContent = '$' + parseFloat(order.total_amount).toFixed(2);
  
          const statusCell = document.createElement('td');
          statusCell.textContent = order.order_status;
  
          const detailsCell = document.createElement('td');
          const detailsButton = document.createElement('button');
          detailsButton.textContent = 'View';
          detailsButton.addEventListener('click', () => {
            viewOrderDetails(order.order_id);
          });
          detailsCell.appendChild(detailsButton);
  
          row.appendChild(orderIdCell);
          row.appendChild(dateCell);
          row.appendChild(totalCell);
          row.appendChild(statusCell);
          row.appendChild(detailsCell);
  
          orderHistoryBody.appendChild(row);
        });
      })
      .catch(error => {
        console.error('Error loading order history:', error);
      });
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
            showNotification('Profile updated successfully.');
            populateProfileForm(updatedCustomer);
            document.getElementById("profile-form").style.display = 'none';
            document.getElementById("edit-button").style.display = 'block';
        } else {
            const errorData = await response.json();
            showError(errorData.message || 'Failed to update profile.');
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

document.addEventListener('DOMContentLoaded', () => {
    // Handle sidebar navigation clicks
    const menuItems = document.querySelectorAll('.sidebar ul li');
    const profileSections = document.querySelectorAll('.profile-section');
  
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        // Remove 'active' class from all menu items
        menuItems.forEach(i => i.classList.remove('active'));
        // Add 'active' class to clicked menu item
        item.classList.add('active');
  
        // Hide all profile sections
        profileSections.forEach(section => section.classList.remove('active'));
        // Show the selected section
        const sectionId = item.getAttribute('data-section');
        document.getElementById(sectionId).classList.add('active');
      });
    });

  
    // Event listeners for buttons
    document.getElementById('edit-profile-button').addEventListener('click', editProfile);
    document.getElementById('change-password-button').addEventListener('click', changePassword);
    document.getElementById('logout-button').addEventListener('click', logout);
  
    // Load order history
    
  });
  
    
  function editProfile() {
    // Redirect to edit profile page or open a modal
    window.location.href = '/edit-profile.html';
  }
  
  function changePassword() {
    // Redirect to change password page or open a modal
    window.location.href = '/change-password.html';
  }
  
  function logout() {
    // Clear tokens and redirect to login page
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  }

  
  function viewOrderDetails(orderId) {
    // Redirect to order details page
    window.location.href = '/order-details.html?order_id=' + orderId;
  }
  




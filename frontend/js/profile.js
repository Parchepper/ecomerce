// js/profile.js

document.addEventListener('DOMContentLoaded', () => {
    // Ensure the user is authenticated

    
    if (!isLoggedIn()) {
        alert('You need to log in to view your profile.');
        window.location.href = 'login.html';
        return;
    }
    

    loadProfile();

    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', updateProfile);
});

function isLoggedIn() {
    return !!localStorage.getItem('token');
}

async function loadProfile() {
    try {

    cached_user = window.sessionStorage.getItem("cached_user");
    parsed_user = JSON.parse(cached_user)

       if (parsed_user){
            populateProfileForm(parsed_user);
            console.log("Used the Cache, good job!");
       }
        else{
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/customer/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            data = await response.json();
            populateProfileForm(data);
            console.log("Used the Fetch, loser!");
        }
        
        
        loadOrderHistory();

        
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

async function loadOrderHistory(){
try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    console.log("===============================")

    orders = await response.json();
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
      
   

    } catch (error) {
        console.error('Error loading profile:', error);
    }

};
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
            document.getElementById("edit-profile-button").style.display = 'block';

        } else {
            const errorData = await response.json();
            message = errorData.message;
            errorMessages = [];
            errors = errorData.errors;
            if (errors && typeof errors === 'object') {
                for (let field in errors) {
                  if (errors.hasOwnProperty(field)) {
                    const fieldErrors = errors[field];
                    if (Array.isArray(fieldErrors)) {
                      fieldErrors.forEach(errorMsg => {
                        errorMessages.push(`${formatFieldName(field)}: ${errorMsg}`);
                      });
                    } else if (typeof fieldErrors === 'string') {
                      // If it's a string, add it directly
                      errorMessages.push(`${formatFieldName(field)}: ${fieldErrors}`);
                    }
                  }
                }
              }
            showError(errorMessages || 'Failed to update profile.');
        }
    } 
    catch (error) {
        console.error('Error updating profile:', error);
    }
      
  

}

function formatFieldName(fieldName) {
    // Replace underscores with spaces and capitalize
    fieldName = fieldName.replace(/_/g, ' ');
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  }
// Function to handle edit button click
function handleEditButtonClick() {
    document.getElementById("profile-form").style.display = 'block';
    document.getElementById("edit-profile-button").style.display = 'none';


}

// Function to handle cancel button click
function handleEditCancelButtonClick() {
    document.getElementById("profile-form").style.display = 'none';
    document.getElementById("edit-profile-button").style.display = 'block';


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
    document.getElementById('edit-profile-button').addEventListener('click', handleEditButtonClick);
    document.getElementById('cancel-edit-button').addEventListener('click', handleEditCancelButtonClick);
    document.getElementById('logout-button').addEventListener('click', logout);
    document.getElementById('change-password-button').addEventListener('click', changePassword);
    
  
    // Load order history
    
  });
    
  function logout() {
    // Clear tokens and redirect to login page
    console.log("hello")
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  }
  
//   function loadOrderHistory() {
//     // Fetch order history from the server
//     fetch(`${API_BASE_URL}/orders`, {
//       method: 'GET',
//       headers: {
//         'Authorization': 'Bearer ' + localStorage.getItem('token'),
//       },
//     })
//       .then(response => response.json())
//       .then(orders => {
//         console.log("======================================");
//         console.log(orders);
//         const orderHistoryBody = document.querySelector('#order-history-table tbody');
//         orderHistoryBody.innerHTML = '';
        
//         orders.forEach(order => {
//           const row = document.createElement('tr');
  
//           const orderIdCell = document.createElement('td');
//           orderIdCell.textContent = order.order_id;
  
//           const dateCell = document.createElement('td');
//           const orderDate = new Date(order.order_date);
//           dateCell.textContent = orderDate.toLocaleDateString();
  
//           const totalCell = document.createElement('td');
//           totalCell.textContent = '$' + parseFloat(order.total_amount).toFixed(2);
  
//           const statusCell = document.createElement('td');
//           statusCell.textContent = order.order_status;
  
//           const detailsCell = document.createElement('td');
//           const detailsButton = document.createElement('button');
//           detailsButton.textContent = 'View';
//           detailsButton.addEventListener('click', () => {
//             viewOrderDetails(order.order_id);
//           });
//           detailsCell.appendChild(detailsButton);
  
//           row.appendChild(orderIdCell);
//           row.appendChild(dateCell);
//           row.appendChild(totalCell);
//           row.appendChild(statusCell);
//           row.appendChild(detailsCell);
  
//           orderHistoryBody.appendChild(row);
//         });
//       })
//       .catch(error => {
//         console.error('Error loading order history:', error);
//       });
//   }
  
function viewOrderDetails(orderId) {
    // Confirm with the user before proceeding
    if (confirm('Do you want to reorder this past order? The items will be added to your cart.')) {
      reloadOrderIntoCart(orderId);
    }
  }

async function reloadOrderIntoCart(orderId) {
    const token = localStorage.getItem('token');
  
    try {
      // Fetch the order details from the server
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch order details.');
      }
  
      const orderData = await response.json();
  
      // For each order item, add it back to the cart
      const addItemPromises = orderData.order_items.map(item => {
        return addToCart(item.product.product_id, item.quantity);
      });
  
      // Wait for all items to be added to the cart
      await Promise.all(addItemPromises);
  
             
      // Redirect the user to the cart page to review the items
      window.location.href = '/cart.html?reorder=success';

      
      
  
    } catch (error) {
      console.error('Error reloading order into cart:', error);
      showNotification('An error occurred while adding items to the cart.', 'error');
    }
  }
  
async function addToCart(productId, quantity) {
    const token = localStorage.getItem('token');
  
    // Prepare the payload
    const payload = {
      product_id: productId,
      quantity: quantity
    };
  
    // Send the request to add the item to the cart
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  
    if (!response.ok) {
      throw new Error(`Failed to add product ${productId} to cart.`);
    }
  
    // Optionally, handle the response
    const data = await response.json();
    return data;
  }  
  
  



// Add event listeners for pre-loading product data on hover
// const profileLinks = document.querySelectorAll('.profile-link');
// profileLinks.forEach(link => {
//     link.addEventListener('mouseover', preloadProileData);
// });

// const productCache = {};

// function preloadProfileData(event) {
//     const profileLink = event.currentTarget;
//     const urlParams = new URLSearchParams(profileLink.search);
//     const profileId = urlParams.get('profile_id');

//     if (productCache[profileId]) {
//         // Data is already cached
//         return;
//     }

   

//     // Fetch product data and cache it
//     fetch(`${API_BASE_URL}/customer/profile`)
//         .then(response => response.json())
//         .then(profileData => {
//             profileCache[profileId] = profileData;
//         })
//         .catch(error => {
//             console.error('Error pre-loading profile data:', error);
//         });
// }


// js/cart.js


document.addEventListener('DOMContentLoaded', () => {
    if (!isLoggedIn()) {
        alert('You need to log in to view your cart.');
        window.location.href = 'login.html';
        return;
    }

    loadCart();

    // Event delegation for cart item actions
    document.getElementById('cart-container').addEventListener('click', handleCartActions);
});

function isLoggedIn() {
    return !!localStorage.getItem('token');
}

async function loadCart() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const cartItems = await response.json();
            displayCartItems(cartItems);
            updateCartSummary(cartItems);
        } else {
            throw new Error('Failed to load cart.');
        }
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function displayCartItems(cartItems) {
    const cartContainer = document.getElementById('cart-container');
    cartContainer.innerHTML = '';

    if (cartItems.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    cartItems.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');

        cartItemDiv.innerHTML = `
            <img src="${item.product.image_url || 'images/placeholder.png'}" alt="${item.product.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h3>${item.product.name}</h3>
                <p class="price">$${item.product.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button class="btn-quantity decrease" data-product-id="${item.product_id}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="btn-quantity increase" data-product-id="${item.product_id}">+</button>
                </div>
                <button class="btn-remove" data-product-id="${item.product_id}">Remove</button>
            </div>
        `;

        cartContainer.appendChild(cartItemDiv);
    });
}

function updateCartSummary(cartItems) {
    const cartSummary = document.getElementById('cart-summary');
    const totalPrice = cartItems.reduce((total, item) => {
        return total + item.product.price * item.quantity;
    }, 0);

    cartSummary.innerHTML = `
        <h2>Order Summary</h2>
        <p>Total Price: $${totalPrice.toFixed(2)}</p>
    `;
}

function handleCartActions(event) {
    const target = event.target;
    const productId = target.getAttribute('data-product-id');

    if (target.classList.contains('btn-quantity')) {
        const action = target.classList.contains('increase') ? 'increase' : 'decrease';
        updateCartItemQuantity(productId, action);
    } else if (target.classList.contains('btn-remove')) {
        removeCartItem(productId);
    }
}

async function updateCartItemQuantity(productId, action) {
    const token = localStorage.getItem('token');
    const quantityElement = document.querySelector(`.quantity-controls [data-product-id="${productId}"]`).parentElement.querySelector('.quantity');
    let currentQuantity = parseInt(quantityElement.textContent);

    if (action === 'increase') {
        currentQuantity += 1;
    } else if (action === 'decrease' && currentQuantity > 1) {
        currentQuantity -= 1;
    } else {
        // If quantity is 1 and user tries to decrease, remove the item
        removeCartItem(productId);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: currentQuantity
            })
        });

        if (response.ok) {
            loadCart(); // Reload cart to reflect changes
        } else {
            throw new Error('Failed to update cart item.');
        }
    } catch (error) {
        console.error('Error updating cart item:', error);
    }
}

async function removeCartItem(productId) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: productId
            })
        });

        if (response.ok) {
            loadCart(); // Reload cart to reflect changes
        } else {
            throw new Error('Failed to remove cart item.');
        }
    } catch (error) {
        console.error('Error removing cart item:', error);
    }
}

document.getElementById('proceed-to-checkout').addEventListener('click', proceedToCheckout);
const token = localStorage.getItem("token")
const apiUrl = (`${API_BASE_URL}/orders`);

function proceedToCheckout() {
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            // Include authentication headers if required
        },
    })
    .then(response =>  response.json())
    .then(orderData => {
        // Redirect to checkout page or display order summary
        displayOrderSummary(orderData);
    })
    .catch(error => {
        console.error('Error during checkout:', error);
        alert('An error occurred during checkout.');
    });
}

function displayOrderSummary(orderData) {
    console.log("TESTING", orderData);
    // Redirect to the checkout page with the order ID in the URL parameters
    window.location.href = '/checkout.html?order_id=' + orderData.order_id;
}

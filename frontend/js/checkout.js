// checkout.js

document.addEventListener('DOMContentLoaded', () => {
    // Get the order_id from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    console.log(orderId)
    if (!orderId) {
        alert('No order ID found. Please return to the cart and proceed to checkout again.');
        window.location.href = '/cart.html'; // Redirect to cart page
        return;
    }

    // Fetch the order details
    fetchOrderDetails(orderId);
});

function fetchOrderDetails(orderId) {
    fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }
        return response.json();
    })
    .then(orderData => {
        // Render the order details on the page
        renderOrderDetails(orderData);
    })
    .catch(error => {
        console.error('Error fetching order details:', error);
        showError('An error occurred while fetching the order details.', error);
    });
}

function renderOrderDetails(order) {
    // Get the container elements
    const orderItemsContainer = document.getElementById('order-items');
    const subtotalElement = document.getElementById('subtotal');
    const salesTaxElement = document.getElementById('sales-tax');
    const shippingCostElement = document.getElementById('shipping-cost');
    const totalAmountElement = document.getElementById('total-amount');

    // Clear any existing content
    orderItemsContainer.innerHTML = '';

    // Render each order item
    order.order_items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('order-item');

        const itemName = document.createElement('div');
        itemName.textContent = item.product.name;
        itemName.classList.add('item-name');

        const itemQuantity = document.createElement('div');
        itemQuantity.textContent = `Quantity: ${item.quantity}`;
        itemQuantity.classList.add('item-quantity');

        const itemPrice = document.createElement('div');
        itemPrice.textContent = `Unit Price: $${parseFloat(item.unit_price).toFixed(2)}`;
        itemPrice.classList.add('item-price');

        const itemTotal = document.createElement('div');
        itemTotal.textContent = `Total: $${parseFloat(item.total_price).toFixed(2)}`;
        itemTotal.classList.add('item-total');

        itemElement.appendChild(itemName);
        itemElement.appendChild(itemQuantity);
        itemElement.appendChild(itemPrice);
        itemElement.appendChild(itemTotal);

        orderItemsContainer.appendChild(itemElement);
    });

    // Display subtotal, sales tax, shipping cost, and total amount
    subtotalElement.textContent = `$${parseFloat(order.total_amount - order.sales_tax - order.shipping_cost).toFixed(2)}`;
    salesTaxElement.textContent = `$${parseFloat(order.sales_tax).toFixed(2)}`;
    shippingCostElement.textContent = `$${parseFloat(order.shipping_cost).toFixed(2)}`;
    totalAmountElement.textContent = `$${parseFloat(order.total_amount).toFixed(2)}`;
}

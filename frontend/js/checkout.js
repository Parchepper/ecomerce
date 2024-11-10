

document.addEventListener('DOMContentLoaded', () => {
    // Get the order_id from the URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');

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
        alert('An error occurred while fetching the order details.');
    });
}

function renderOrderDetails(order) {
    // Get the table body element
    const orderItemsBody = document.getElementById('order-items-body');
    orderItemsBody.innerHTML = ''; // Clear any existing content

    // Render each order item as a table row
    order.order_items.forEach(item => {
        const row = document.createElement('tr');

        // Product Name
        const productCell = document.createElement('td');
        productCell.textContent = item.product.name;

        // Price
        const priceCell = document.createElement('td');
        priceCell.textContent = '$' + parseFloat(item.unit_price).toFixed(2);

        // Quantity
        const quantityCell = document.createElement('td');
        quantityCell.textContent = item.quantity;

        // Total
        const totalCell = document.createElement('td');
        const totalPrice = parseFloat(item.unit_price) * item.quantity;
        totalCell.textContent = '$' + totalPrice.toFixed(2);

        // Append cells to the row
        row.appendChild(productCell);
        row.appendChild(priceCell);
        row.appendChild(quantityCell);
        row.appendChild(totalCell);

        // Append row to the table body
        orderItemsBody.appendChild(row);
    });

    // Update totals
    const subtotalElement = document.getElementById('subtotal');
    const salesTaxElement = document.getElementById('sales-tax');
    const shippingCostElement = document.getElementById('shipping-cost');
    const totalAmountElement = document.getElementById('total-amount');

    const subtotal = parseFloat(order.total_amount) - parseFloat(order.sales_tax) - parseFloat(order.shipping_cost);
    subtotalElement.textContent = '$' + subtotal.toFixed(2);
    salesTaxElement.textContent = '$' + parseFloat(order.sales_tax).toFixed(2);
    shippingCostElement.textContent = '$' + parseFloat(order.shipping_cost).toFixed(2);
    totalAmountElement.textContent = '$' + parseFloat(order.total_amount).toFixed(2);
}

document.getElementById('place-order-button').addEventListener('click', placeOrder);

function placeOrder() {
    // Implement the logic to process the order
    // For now, you can display a message or redirect to a confirmation page
    showError('Implement purchases!');
    // Redirect to an order confirmation page if available
    // window.location.href = '/order-confirmation.html?order_id=' + orderId;
}


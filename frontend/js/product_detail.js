// js/product_detail.js



document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product_id');

    if (!productId) {
        // Handle missing product_id
        alert('Product not found.');
        window.location.href = 'products.html';
        return;
    }
    cached_product = window.sessionStorage.getItem(productId)
    parsed_product = JSON.parse(cached_product);
    // Check if the product data is cached
    if (cached_product) {
        console.log("Trying to use the Cache...");
        console.log(parsed_product);
        displayProductDetails(parsed_product);
        console.log("Used the Cache, good job!");
    } else {
        // Fetch product data from the API
        fetch(`${API_BASE_URL}/products/${productId}`)
            .then(response => response.json())
            .then(productData => {
                displayProductDetails(productData);
                console.log("Used the Fetch, loser!");
            })
            .catch(error => {
                console.error('Error loading product details:', error);
                alert('Failed to load product details.');
            });
    }
});

function displayProductDetails(product) {
    const productDetailsContainer = document.getElementById('product-details');
    productDetailsContainer.innerHTML = `
        <div class="product-detail-card">
            <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" class="product-detail-image">
            <div class="product-detail-info">
                <h1>${product.name}</h1>
                <p class="price">$${product.price.toFixed(2)}</p>
                <p>${product.description}</p>
                <button class="add-to-cart-button" data-product-id="${product.product_id}">Add to Cart</button>
            </div>
        </div>
    `;

    // Add event listener for "Add to Cart" button
    
    document.querySelectorAll('.add-to-cart-button').forEach(button => {
        button.addEventListener('click', addToCart);
    });
    

}

async function addToCart(event) {
    const productId = event.target.getAttribute('data-product-id');
    const apiUrl = (`${API_BASE_URL}/cart`);
    const token = localStorage.getItem("token")

    const data = {
        product_id: productId,
        quantity: 1
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,

            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Product added to cart:', result);
        showNotification('Product added to cart!');
    } catch (error) {
        console.error('Error adding product to cart:', error);
        showError('An error occurred while adding the product to the cart.');
    }
}


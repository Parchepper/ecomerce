// js/products.js



document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    setupEventListeners();
    loadProducts();
});

function setupEventListeners() {
    document.getElementById('search-input').addEventListener('input', debounce(() => {
        console.log('Search input changed');
        loadProducts();
    }, 500));

    document.getElementById('category-filter').addEventListener('change', () => {
        console.log('Category changed');
        loadProducts();
    });

    document.getElementById('filter-btn').addEventListener('click', () => {
        console.log('Filter button clicked');
        loadProducts();
    });
}

async function loadProducts() {
    try {
        const searchQuery = document.getElementById('search-input').value;
        const categoryId = document.getElementById('category-filter').value;
        const minPrice = document.getElementById('min-price').value;
        const maxPrice = document.getElementById('max-price').value;

        const params = new URLSearchParams();

        if (searchQuery) {
            params.append('search', searchQuery);
        }
        if (categoryId) {
            params.append('category_id', categoryId);
        }
        if (minPrice) {
            params.append('min_price', minPrice);
        }
        if (maxPrice) {
            params.append('max_price', maxPrice);
        }

        const url = `${API_BASE_URL}/products?${params.toString()}`;

        console.log('Fetching products from URL:', url);

        const response = await fetch(url);
        if (response.ok) {
            const products = await response.json();
            console.log('Products received:', products);
            displayProducts(products);
        } else {
            console.error('Failed to load products.');
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}


async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        if (response.ok) {
            const categories = await response.json();
            populateCategoryFilter(categories);
        } else {
            console.error('Failed to load categories.');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function populateCategoryFilter(categories) {
    const categoryFilter = document.getElementById('category-filter');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.category_id;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
    });
}



function debounce(func, delay) {
    let debounceTimer;
    return function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func(), delay);
    };
}

function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        productCard.innerHTML = `
            <a href="product_detail.html?product_id=${product.product_id}" class="product-link">
                <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <p class="price">$${product.price}</p>
                </div>
            </a>
            <button class="add-to-cart-button" data-product-id="${product.product_id}">Add to Cart</button>
        `;

        productsGrid.appendChild(productCard);
    });

    // Add event listeners for "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', addToCart);
    });

    // Add event listeners for pre-loading product data on hover
    const productLinks = document.querySelectorAll('.product-link');
    productLinks.forEach(link => {
        link.addEventListener('mouseover', preloadProductData);
    });
}


const productCache = {};

function preloadProductData(event) {
    const productLink = event.currentTarget;
    const urlParams = new URLSearchParams(productLink.search);
    const productId = urlParams.get('product_id');

    if (productCache[productId]) {
        // Data is already cached
        return;
    }

    // Fetch product data and cache it
    fetch(`${API_BASE_URL}/products/${productId}`)
        .then(response => response.json())
        .then(productData => {
            sessionStorage.setItem(`${productId}`, JSON.stringify(productData));
        })
        .catch(error => {
            console.error('Error pre-loading product data:', error);
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

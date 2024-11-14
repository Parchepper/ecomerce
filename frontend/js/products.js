// js/products.js



document.addEventListener('DOMContentLoaded', () => {
    loadSuppliers();
    loadCategories();
    setupEventListeners();
    Products();
});

function setupEventListeners() {
    document.getElementById('search-input').addEventListener('input', debounce(() => {
        console.log('Search input changed');
        displayProducts();
    }, 500));

    document.getElementById('category-filter').addEventListener('change', () => {
        console.log('Category changed');
        displayProducts();
    });

    document.getElementById('supplier-filter').addEventListener('change', () => {
        console.log('Supplier changed');
        displayProducts();
    });

    document.getElementById('filter-btn').addEventListener('click', () => {
        console.log('Filter button clicked');
        displayProducts();
    });
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

async function loadSuppliers() {
    try {
        const response = await fetch(`${API_BASE_URL}/suppliers`);
        if (response.ok) {
            const suppliers = await response.json();
            populateSupplierFilter(suppliers);
        } else {
            console.error('Failed to load suppliers.');
        }
    } catch (error) {
        console.error('Error loading suppliers:', error);
    }
}

function populateSupplierFilter(suppliers) {
    const supplierFilter = document.getElementById('supplier-filter');
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.supplier_id;
        option.textContent = supplier.name;
        supplierFilter.appendChild(option);
    });
}



function debounce(func, delay) {
    let debounceTimer;
    return function() {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func(), delay);
    };
}

let currentPage = 1;
const limit = 8;

async function displayProducts(page = 1) {
    const searchQuery = document.getElementById('search-input').value;
    const categoryId = document.getElementById('category-filter').value;
    const supplierId = document.getElementById('supplier-filter').value;
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;

    const params = new URLSearchParams();

    if (searchQuery) {
        params.append('search', searchQuery);
    }
    if (categoryId) {
        params.append('category_id', categoryId);
    }
    if (supplierId) {
        params.append('supplier_id', supplierId);
    }
    if (minPrice) {
        params.append('min_price', minPrice);
    }
    if (maxPrice) {
        params.append('max_price', maxPrice);
    }
    params.append('page', page)

    params.append('limit', limit)
                                ;
    const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
    const data = await response.json();

    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';
    

    data.products.forEach(product => {
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

    document.getElementById('current-page').innerText = data.page;
    document.getElementById('prev-page').disabled = data.page === 1;
    document.getElementById('next-page').disabled = data.page === data.pages;

    currentPage = data.page;


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

function changePage(direction) {
    if (direction === 'next') {
        displayProducts(currentPage + 1);
    } else if (direction === 'prev') {
        displayProducts(currentPage - 1);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    displayProducts(currentPage);
});


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

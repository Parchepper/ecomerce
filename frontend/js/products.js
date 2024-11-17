// js/products.js

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
const limit = 8 ;

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
        productCard.draggable=true;
        productCard.setAttribute("data-id", product.product_id);
        productCard.innerHTML = `
            <a href="product_detail.html?product_id=${product.product_id}" class="product-link" >
                <img  src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" class="product-image"></a>
                <div  class="product-info">
                    <h3>${product.name}</h3>
                    <h3>${product.supplier == "" ? "" : product.supplier }</h3>
                    <h2>${product.upc== null ? "" : product.upc}</h2>
                    <!--<p>${product.description}</p>-->
                    <p class="price">$${product.price}</p>
                </div>
            
            <button class="add-to-cart-button" data-product-id="${product.product_id}">Add to Cart</button>
        `;
          // Add drag events to product cards

        productCard.addEventListener('dragstart', (event) => {
            console.log("Card:", productCard);
            event.dataTransfer.setData('text/plain', productCard.getAttribute("data-id"));
            event.dataTransfer.setData('text/html', productCard.outerHTML);
            });
     
  

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
    loadSuppliers();
    loadCategories();
    setupEventListeners();
    displayProducts(currentPage);
    
    
    document.querySelectorAll('.product-card img, .product-card a').forEach(element => {
        element.addEventListener('dragstart', (event) => {
          event.preventDefault(); // Prevent dragging nested elements
        });
      });

    document.getElementById('open-slide-out').addEventListener('click', () => {
        const slideOutSection = document.getElementById('slide-out-section');
        slideOutSection.style.right = '0'; // Slide in
      });
      
      document.getElementById('close-slide-out').addEventListener('click', () => {
        const slideOutSection = document.getElementById('slide-out-section');
        slideOutSection.style.right = '-300px'; // Slide out
      });
    
    const slideOutSection = document.getElementById('slide-out-section');

    const productList = document.createElement('ul');
    productList.id = 'product-list';
    slideOutSection.querySelector('.slide-out-content').appendChild(productList);
    const grandTotal = document.createElement('div');
    grandTotal.id = 'grand-total';
    slideOutSection.querySelector('.slide-out-content').appendChild(grandTotal);

          
    // Call loadCart on page load
    loadCart();   
  
    
    // Add drop events to the slide-out section
    slideOutSection.addEventListener('dragover', (event) => {
    // TODO: awesome pre-drop functionality
      event.preventDefault(); // Allow drop
    });
    
    slideOutSection.addEventListener('drop', (event) => {
    event.preventDefault();

    // Get the product details

    let productId = event.dataTransfer.getData('text/plain');
    const productHTML = event.dataTransfer.getData('text/html');
    
    // Check if the product is already added
    if (document.querySelector(`#product-list li[data-id="${productId}"]`)) {
    showError('Product already added!');
    return;
    }
    
        // Parse the product HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = productHTML;
    const productCard = tempDiv.firstElementChild;

    // Remove unwanted elements
    const imgElement = productCard.querySelector('img');
    if (imgElement) imgElement.remove();

    const addToCartButton = productCard.querySelector('.add-to-cart-button');
    if (addToCartButton) addToCartButton.remove();

    // Extract necessary information
    const productName = productCard.querySelector('h3') ? productCard.querySelector('h3').textContent : 'Product';
    const productPriceElement = productCard.querySelector('.price');
    const productPrice = productPriceElement ? productPriceElement.textContent : 'Price not available';

    // Create the list item
    const listItem = document.createElement('li');
    const itemTotalPrice = productPrice; // Initialize total price for the item
    listItem.classList.add("product-list-item");
    listItem.dataset.id = productId;
    listItem.innerHTML = `

        <h4>${productName}</h4>
        <p>${productPrice}</p>
        <p>Total: <span id="item-total" class="item-total">${itemTotalPrice}</span></p>
    
    `;

      // Create quantity selector
    const quantityContainer = document.createElement('div');
    quantityContainer.classList.add('quantity-container');
    quantityContainer.innerHTML = `
        <label for="quantity-${productId}">Quantity:</label>
        <input type="number" id="quantity-${productId}" class="quantity-input" value="1" min="1">
    `;

     // Add event listener to update price dynamically
    const quantityInput = quantityContainer.querySelector('.quantity-input');
    quantityInput.addEventListener('input', () => {
        const quantity = parseInt(quantityInput.value) || 1; // Default to 1 if invalid input
        const updatedTotalPrice = quantity * parseFloat(productPrice.slice(1));
        listItem.querySelector('.item-total').textContent = `$${updatedTotalPrice.toFixed(2)}`;
        updateGrandTotal();
    });
    quantityInput.addEventListener('change', () => {
        updateGrandTotal(); // Updates the grand total
        saveCart();
      });

    const removeButton = document.createElement('button');
    removeButton.textContent = 'D';
    removeButton.classList.add('remove-btn'); // Optional: Add a class for styling
    removeButton.addEventListener('click', () => {
    listItem.remove();
    updateGrandTotal();

    });


    listItem.appendChild(quantityContainer);
    listItem.appendChild(removeButton);
    productList.appendChild(listItem);
    updateGrandTotal();

    });
    
    

});


// Save cart data to localStorage
function saveCart() {
    // Ensure productList is defined

    const productList = document.getElementsByClassName('product-list-item');
    const productArray = Array.from(productList);
    console.log("Data:", productArray)
        if (!productList) {
            console.error('Error: product-list element not found.');
            return;
    }

  
    const cartData = productArray.map(item => {
        console.log("Item to save to Cart", item)
        const quantity = item.querySelector('.quantity-input').value;
        console.log("Item Qty: ", quantity)
        return {
            'html': item.outerHTML,
            'quantity': quantity
        };
    });

    console.log('Cart Data:', cartData);

    // Save the cart data (e.g., localStorage or API call)
    localStorage.setItem('cart', JSON.stringify(cartData));
    
}

// Load cart data from localStorage

function loadCart() {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const productList = document.querySelector('ul');
    console.log("Product List: ",productList)
    if (!productList) {
        console.error("Error: `product-list` element not found.");
        return;
    }

    const parser = new DOMParser();
    savedCart.forEach(element => {
        // Parse the HTML for the saved cart item
        const parsedDocument = parser.parseFromString(element['html'], "text/html");
        quantity = element['quantity']
        const parsedElement = parsedDocument.querySelector("li");

        if (parsedElement) {
            console.log("Parsed Element:", parsedElement);

            // Append the parsed element to the product list
            productList.appendChild(parsedElement);

            // Ensure event listeners are reattached
            const quantityInput = parsedElement.querySelector('.quantity-input');
            const removeButton = parsedElement.querySelector('.remove-btn');

            if (quantityInput) {
                quantityInput.value = quantity;
                quantityInput.addEventListener('change', () => {
                    updateGrandTotal(); // Updates the grand total
                    saveCart();
                  });
                quantityInput.addEventListener('input', () => {
                    const quantity = parseInt(quantityInput.value) || 1;
                    const priceElement = parsedElement.querySelector('p');
                    const itemTotalElement = parsedElement.querySelector('.item-total');

                    const price = parseFloat(priceElement.textContent.replace('$', '').trim());
                    const updatedTotal = price * quantity;
                    
                    if (itemTotalElement) {
                        itemTotalElement.textContent = `$${updatedTotal.toFixed(2)}`;
                        updateGrandTotal();
                    }
                });
            }

            if (removeButton) {
                removeButton.addEventListener('click', () => {
                    parsedElement.remove();
                    updateGrandTotal();
                });
            }
        } else {
            console.error("Error: Failed to parse `<li>` element from saved cart item.");
        }
    });

    updateGrandTotal();
}
// function loadCart() {
//     const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
//     const productList = document.getElementById('product-list');

//     parser = new DOMParser();
//     savedCart.forEach(element => {

//         parsed_element = parser.parseFromString(element['html'], "text/html").querySelector("li");
//         console.log("Parsed Element:", parsed_element)
//         productList.appendChild(parsed_element);
//     });
   
// }



function updateGrandTotal() {
  const grandTotalElement = document.getElementById('grand-total');
  const productList = document.getElementsByClassName('product-list-item');
  const productArray = Array.from(productList);
  console.log("Data:", grandTotalElement , productArray)
  // Fetch all `.item-total` elements
  itemTotals = 0.00;
  productArray.forEach(element => {
    // Find the `.item-total` element inside each `product-list-item`
    const itemTotalElement = element.querySelector('.item-total');

    if (itemTotalElement) {
        // Extract the text content (e.g., "$10.00") and parse the numeric value
        const itemTotal = parseFloat(itemTotalElement.textContent.replace('$', '').trim());
        console.log("Item Total:", itemTotal);
        itemTotals = itemTotals + itemTotal
    } else {
        console.warn("No `.item-total` found in:", element);
    }
    
});


  // Update the grand total
  grandTotalElement.textContent = `Grand Total: $${itemTotals.toFixed(2)}`;
  saveCart();
  
    
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

// Event listeners for slide-cart



  
   

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

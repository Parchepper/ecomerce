// js/products.js

function setupEventListeners() {
    document.getElementById('search-input').addEventListener('input', debounce(() => {
        console.log('Search input changed');
        displayProducts();
        updateSupplierFiltersForSearch();
    }, 750));

    // document.getElementById('category-filter').addEventListener('change', () => {
    //     console.log('Category changed');
    //     displayProducts();
    // });

    // document.getElementById('supplier-filter').addEventListener('change', () => {
    //     console.log('Supplier changed');
    //     displayProducts();
    // });

    document.getElementById('filter-btn').addEventListener('click', () => {
        console.log('Filter button clicked');
        displayProducts();
    });
    const page_num_input = document.getElementById('page_num');
    page_num_input.addEventListener('change', (e) => {
        displayProducts(page=page_num_input.value);
    });
}
function setupCheckboxListeners() {
    const categoryFiltersContainer = document.getElementById('category-filters');
    const supplierFiltersContainer = document.getElementById('supplier-filters');

    categoryFiltersContainer.addEventListener('change', () => {
        console.log('Category checkboxes changed');
        displayProducts();
    });

    supplierFiltersContainer.addEventListener('change', () => {
        console.log('Supplier checkboxes changed');
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

// function populateCategoryFilter(categories) {
//     const categoryFilter = document.getElementById('category-filter');
//     categories.forEach(category => {
//         const option = document.createElement('option');
//         option.value = category.category_id;
//         option.textContent = category.name;
//         categoryFilter.appendChild(option);
//     });
// }

function populateCategoryFilter(categories) {
    const categoryFiltersContainer = document.getElementById('category-filters');
    categoryFiltersContainer.innerHTML = '<h3>Categories</h3> <br>'; // Clear any existing content

    categories.forEach(category => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = category.category_id;
        checkbox.classList.add('category-checkbox');
        // You could add a data attribute for convenience if needed
        // checkbox.setAttribute('data-category-id', category.category_id);

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${category.name}`));
        categoryFiltersContainer.appendChild(label);
        categoryFiltersContainer.appendChild(document.createElement('br'));
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

// function populateSupplierFilter(suppliers) {
//     const supplierFilter = document.getElementById('supplier-filter');
//     suppliers.forEach(supplier => {
//         const option = document.createElement('option');
//         option.value = supplier.supplier_id;
//         option.textContent = supplier.name;
//         supplierFilter.appendChild(option);
//     });
// }

function populateSupplierFilter(suppliers) {
    const supplierFiltersContainer = document.getElementById('supplier-filters');
    supplierFiltersContainer.innerHTML = '<h3>Suppliers</h3> <br>' ; // Clear any existing content

    suppliers.forEach(supplier => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = supplier.supplier_id;
        checkbox.classList.add('supplier-checkbox');

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${supplier.name}`));
        supplierFiltersContainer.appendChild(label);
        supplierFiltersContainer.appendChild(document.createElement('br'));
    });
}
//implement this later
// function updateSupplierFilters(products) {
    
// }

async function updateSupplierFiltersForSearch() {
    const searchQuery = document.getElementById('search-input').value;
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;

    // Collect checked categories
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox:checked');
    const categoryIds = Array.from(categoryCheckboxes).map(checkbox => checkbox.value);

    const params = new URLSearchParams();

    if (searchQuery) {
        params.append('search', searchQuery);
    }
    categoryIds.forEach(catId => {
        params.append('category_id', catId);
    });
    if (minPrice) {
        params.append('min_price', minPrice);
    }
    if (maxPrice) {
        params.append('max_price', maxPrice);
    }

    // Fetch all relevant suppliers from the API
    const response = await fetch(`${API_BASE_URL}/suppliers?${params.toString()}`);
    const suppliers = await response.json();

    // Update supplier filters dynamically
    const supplierFiltersContainer = document.getElementById('supplier-filters');
    supplierFiltersContainer.innerHTML = ''; // Clear existing suppliers
    console.log("Supplise:r", suppliers)
    suppliers.forEach(supplier => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = supplier.supplier_id;
        checkbox.classList.add('supplier-checkbox');

       

        // Attach event listener to the checkbox
        checkbox.addEventListener('change', () => {
            displayProducts();
        });

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${supplier.name}`));
        supplierFiltersContainer.appendChild(label);
        supplierFiltersContainer.appendChild(document.createElement('br'));
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
const limit = 25 ;

async function displayProducts(page = 1) {
    const searchQuery = document.getElementById('search-input').value;
    const minPrice = document.getElementById('min-price').value;
    const maxPrice = document.getElementById('max-price').value;

    // Collect checked categories
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox:checked');
    const categoryIds = Array.from(categoryCheckboxes).map(checkbox => checkbox.value);

    // Collect checked suppliers
    const supplierCheckboxes = document.querySelectorAll('.supplier-checkbox:checked');
    const supplierIds = Array.from(supplierCheckboxes).map(checkbox => checkbox.value);

    const params = new URLSearchParams();

    if (searchQuery) {
        params.append('search', searchQuery);
    }
    // If multiple categories are selected, you can either append each category_id
    // or send them as a comma-separated string depending on how your API expects them.
    // Example: append multiple params
    if (categoryIds)
        categoryIds.forEach(catId => {
        params.append('category_id[]', catId);
    });
    if (supplierIds) {
        console.log("Suppler Ids: ",supplierIds)
        // Same for suppliers
        supplierIds.forEach(supId => {
            params.append('supplier_id[]', supId);
    });}

    if (minPrice) {
        params.append('min_price', minPrice);
    }
    if (maxPrice) {
        params.append('max_price', maxPrice);
    }

    params.append('page', page);
    params.append('limit', limit);
    console.log(params.toString());
    const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
    const data = await response.json();

    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';
    

    data.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        productCard.draggable = true;
        productCard.setAttribute("data-id", product.product_id);
        productCard.innerHTML = `
            <a href="product_detail.html?product_id=${product.product_id}" class="product-link">
                <img src="${product.image_url || 'images/placeholder.png'}" alt="${product.name}" class="product-image">
            </a>
            <div class="product-info">
                <h3>${product.name}</h3>
                <h3>${product.supplier || ''}</h3>
                <h2>${product.upc || ''}</h2>
                <!--<p>${product.description}</p>-->
                <p class="price">$${product.price}</p>
            </div>
            <button class="add-to-cart-button" data-product-id="${product.product_id}">Add to Cart</button>
        `;
    
        // Prevent dragging of nested elements like images and links
        
    
        let lastMouseX = 0;
        let lastMouseY = 0;
        let dragImage = null; // Reference to the cloned drag image
    
        productCard.addEventListener('dragstart', (event) => {
            console.log("Card:", productCard);
            event.dataTransfer.setData('text/plain', productCard.getAttribute("data-id"));
            event.dataTransfer.setData('text/html', productCard.outerHTML);
    
            // Clone the product card for the drag image
            dragImage = productCard.cloneNode(true);
            const img = dragImage.querySelector("img");
            console.log("Cloned Image:", img);
    
            // Add the 'dragging-image' class to the cloned image
            img.classList.add("dragging-image");
    
            // Style the cloned drag image
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px'; // Position off-screen
            dragImage.style.left = '-1000px';
            dragImage.style.pointerEvents = 'none'; // Prevent interaction
            dragImage.style.width = '150px'; // Set desired width
            dragImage.style.height = 'auto'; // Maintain aspect ratio
    
            // Append the drag image to the body
            document.body.appendChild(dragImage);
    
            // Set the custom drag image (centered)
            event.dataTransfer.setDragImage(dragImage, img.width / 2, img.height / 2);
    
            // Add dragging class to the actual card for visual feedback
            productCard.classList.add('dragging');
    
            // Initialize last mouse positions
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
        });
    
        window.addEventListener('mousemove', (event) => {
            if (!dragImage) return; // Only proceed if dragImage exists
    
            const deltaX = event.clientX - lastMouseX;
            const deltaY = event.clientY - lastMouseY;
    
            // Remove all lean classes before adding the new one
            dragImage.classList.remove('lean-left', 'lean-right', 'lean-up', 'lean-down');
    
            // Determine leaning direction based on movement thresholds
            if (deltaX > 5) dragImage.classList.add('lean-right');
            else if (deltaX < -5) dragImage.classList.add('lean-left');
            if (deltaY > 5) dragImage.classList.add('lean-down');
            else if (deltaY < -5) dragImage.classList.add('lean-up');
    
            // Update last mouse position
            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
        });
    
        productCard.addEventListener('dragend', () => {
            productCard.classList.remove('dragging');
    
            // Remove the drag image from the DOM
            if (dragImage) {
                dragImage.parentNode.removeChild(dragImage);
                dragImage = null;
            }
    
            // Optionally, reset transformations on the original card
            productCard.classList.add('reset');
            setTimeout(() => productCard.classList.remove('reset'), 200); // Allow time for reset animation
        });
    
        productsGrid.appendChild(productCard);
    });
    
    

    document.getElementById('current-page').placeholder = data.page;
    document.getElementById('total-pages').innerText = data.pages;
    document.getElementById('prev-page').disabled = data.page === 1;
    document.getElementById('next-page').disabled = data.page === data.pages;

    currentPage = data.page;

    // Update suppliers list dynamically
   // updateSupplierFilters(data.products);


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
    setupCheckboxListeners();
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

      // Create the product list
      const productList = document.createElement('ul');
      productList.id = 'product-list';
      slideOutSection.querySelector('.slide-out-content').appendChild(productList);
      
      // Create the grand total container
      const grandTotal = document.createElement('div');
      grandTotal.id = 'grand-total';
      grandTotal.textContent = "Grand Total: $0.00";
      slideOutSection.appendChild(grandTotal);
      
      // Create the footer and append it
      const slideFooter = document.createElement('div');
      slideFooter.id = "slide-footer";
      slideFooter.innerHTML = `
          <button id="checkout-button">Proceed to Checkout</button>
          <button id="clear-cart-button">Clear Cart</button>
      `;
      slideOutSection.appendChild(slideFooter); // Append it as a direct child of the slide-out section
      

          
    // Call loadCart on page load
    loadCart();   
    
    // Event listener for clear Cart button and checkout button
    document.getElementById('clear-cart-button').addEventListener('click', clearCart);
    
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
    removeButton.textContent = 'Remove';
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

function clearCart() {
    // Get the product list container
    const productList = document.getElementById('product-list');

    if (productList) {
        // Remove all child elements
        while (productList.firstChild) {
            productList.removeChild(productList.firstChild);
        }
    } else {
        console.error('Error: product-list element not found.');
        return;
    }

    // Clear the localStorage data for the cart
    localStorage.removeItem('cart');

    // Reset the grand total
    updateGrandTotal();
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

const productsContainer = document.querySelector(".products-container");
const searchInput = document.querySelector("input[type=text]");
const categoryButtons = document.querySelectorAll(".category-container button");
const minPriceInput = document.querySelector('input[placeholder="Min price"]');
const maxPriceInput = document.querySelector('input[placeholder="Max price"]');
const sortSelect = document.querySelector("select");
const detailsContainer = document.querySelector(".details-container");

const cartContainer = document.querySelector(".cart-container");
const cartLink = document.querySelector("#cart-link");
const checkoutButton = document.querySelector("#checkout-btn");

const checkoutForm = document.querySelector("#checkout form");
const orderSummaryItems = document.querySelector("#order-summary-items");
const orderSummaryTotal = document.querySelector("#order-summary-total");

const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const phoneInput = document.querySelector("#phone");
const addressInput = document.querySelector("#address");

const nameError = document.querySelector("#name-error");
const emailError = document.querySelector("#email-error");
const phoneError = document.querySelector("#phone-error");
const addressError = document.querySelector("#address-error");

const orderSuccess = document.querySelector("#order-success");
const continueShoppingButton = document.querySelector("#continue-shopping");

const contactForm = document.querySelector("#contact-form");
const contactSuccess = document.querySelector("#contact-success");

const shopNowButton = document.querySelector("#shop-now-btn");

let products = [];
let cart = [];

let currentCategory = "all";
let currentMinPrice = "";
let currentMaxPrice = "";
let currentSort = "";

// Shop Now
shopNowButton.addEventListener("click", () => {
    document.querySelector("#products").scrollIntoView({
        behavior: "smooth"
    });
});

// Sorting
sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value;
    applyFilters();
});

// Price Filter
const priceButton = document.querySelector("#apply-price");

priceButton.addEventListener("click", () => {
    currentMinPrice = minPriceInput.value;
    currentMaxPrice = maxPriceInput.value;

    applyFilters();
});

// Category Filter
categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentCategory = button.dataset.category;

        applyFilters();
    });
});

// Load Products
async function loadProducts() {
    try {
        productsContainer.innerHTML = "Loading products...";

        const results = await Promise.all([
            fetchCategory("https://dummyjson.com/products/category/smartphones"),
            fetchCategory("https://dummyjson.com/products/category/laptops"),
            fetchCategory("https://dummyjson.com/products/category/mobile-accessories"),
            fetchCategory("https://dummyjson.com/products/category/tablets")
        ]);

        products = results.flat();

        displayProducts(products);
    } catch {
        productsContainer.innerHTML =
            "Unable to load products. Please try again.";
    }
}

// Fetch Category
async function fetchCategory(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Failed to fetch products");
    }

    const data = await response.json();

    return data.products;
}

// Search
searchInput.addEventListener("input", () => {
    applyFilters();
});

// Apply Filters
function applyFilters() {
    let filteredProducts = [...products];

    const searchTerm = searchInput.value.toLowerCase();

    if (searchTerm) {
        filteredProducts = filteredProducts.filter((product) => {
            return product.title.toLowerCase().includes(searchTerm);
        });
    }

    if (currentCategory !== "all") {
        filteredProducts = filteredProducts.filter((product) => {
            return product.category === currentCategory;
        });
    }

    if (currentMinPrice !== "") {
        filteredProducts = filteredProducts.filter((product) => {
            return product.price >= Number(currentMinPrice);
        });
    }

    if (currentMaxPrice !== "") {
        filteredProducts = filteredProducts.filter((product) => {
            return product.price <= Number(currentMaxPrice);
        });
    }

    if (currentSort === "Price: Low to High") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (currentSort === "Price: High to Low") {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (currentSort === "Name: A to Z") {
        filteredProducts.sort((a, b) => {
            return a.title.localeCompare(b.title);
        });
    }

    displayProducts(filteredProducts);
}

// Display Products
function displayProducts(productList) {
    productsContainer.innerHTML = "";

    if (productList.length === 0) {
        productsContainer.innerHTML = "No products found.";
        return;
    }

    productList.forEach((product) => {
        const card = document.createElement("div");
        card.classList.add("product-card");

        const image = document.createElement("img");
        image.src = product.thumbnail;
        image.alt = product.title;

        const category = document.createElement("p");
        category.classList.add("product-category");
        category.textContent = product.category;

        const title = document.createElement("h3");
        title.textContent = product.title;

        const price = document.createElement("p");
        price.classList.add("product-price");
        price.textContent = `$${product.price}`;

        const rating = document.createElement("p");
        rating.classList.add("product-rating");
        rating.textContent = `⭐ ${product.rating}`;

        const actions = document.createElement("div");
        actions.classList.add("product-actions");

        const addButton = document.createElement("button");
        addButton.textContent = "Add to Cart";

        const viewButton = document.createElement("button");
        viewButton.textContent = "View Details";

        actions.appendChild(addButton);
        actions.appendChild(viewButton);

        card.appendChild(image);
        card.appendChild(category);
        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(rating);
        card.appendChild(actions);

        productsContainer.appendChild(card);

        // Add to Cart
        addButton.addEventListener("click", () => {
            const existingProduct = cart.find((item) => {
                return item.id === product.id;
            });

            if (existingProduct) {
                existingProduct.quantity++;
            } else {
                cart.push({
                    ...product,
                    quantity: 1
                });
            }

            saveCart();
            displayCart();
        });

        // View Details
        viewButton.addEventListener("click", () => {
            detailsContainer.innerHTML = `
                <img src="${product.thumbnail}" alt="${product.title}">
                <div>
                    <h3>${product.title}</h3>
                    <p>${product.description}</p>
                    <p>Category: ${product.category}</p>
                    <p>Rating: ⭐ ${product.rating}</p>
                    <p>Stock: ${product.stock}</p>
                    <p>Price: $${product.price}</p>
                </div>
            `;

            detailsContainer.scrollIntoView({
                behavior: "smooth"
            });
        });
    });
}

// Update Cart Count
function updateCartCount() {
    const cartCount = cart.reduce((total, product) => {
        return total + product.quantity;
    }, 0);

    cartLink.textContent = `Cart (${cartCount})`;
}

// Update Cart Subtotal
function updateCartSubtotal() {
    const subtotal = cart.reduce((total, product) => {
        return total + product.price * product.quantity;
    }, 0);

    const subtotalText = document.querySelector(".cart-subtotal");

    if (subtotalText) {
        subtotalText.textContent = `Subtotal: $${subtotal.toFixed(2)}`;
    }
}

// Display Cart
function displayCart() {
    cartContainer.innerHTML = "";

    updateCartCount();
    displayOrderSummary();

    if (cart.length === 0) {
        cartContainer.innerHTML =
            "<p>Your cart is empty. Add some products to continue shopping.</p>";

        const shoppingButton = document.createElement("button");
        shoppingButton.textContent = "Continue Shopping";

        shoppingButton.addEventListener("click", () => {
            document.querySelector("#products").scrollIntoView({
                behavior: "smooth"
            });
        });

        cartContainer.appendChild(shoppingButton);

        return;
    }

    cart.forEach((product) => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.dataset.id = product.id;

        const image = document.createElement("img");
        image.src = product.thumbnail;
        image.alt = product.title;

        const title = document.createElement("h3");
        title.textContent = product.title;

        const price = document.createElement("p");
        price.textContent = `$${product.price}`;

        const quantityBox = document.createElement("div");
        quantityBox.classList.add("quantity-box");

        const minusButton = document.createElement("button");
        minusButton.textContent = "-";

        const quantity = document.createElement("span");
        quantity.classList.add("cart-quantity");
        quantity.textContent = product.quantity;

        const plusButton = document.createElement("button");
        plusButton.textContent = "+";

        quantityBox.appendChild(minusButton);
        quantityBox.appendChild(quantity);
        quantityBox.appendChild(plusButton);

        const total = document.createElement("p");
        total.classList.add("cart-item-total");
        total.textContent =
            `Total: $${(product.price * product.quantity).toFixed(2)}`;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";

        cartItem.appendChild(image);
        cartItem.appendChild(title);
        cartItem.appendChild(price);
        cartItem.appendChild(quantityBox);
        cartItem.appendChild(total);
        cartItem.appendChild(removeButton);

        cartContainer.appendChild(cartItem);

        // Decrease Quantity
        minusButton.addEventListener("click", () => {
            if (product.quantity > 1) {
                product.quantity--;

                quantity.textContent = product.quantity;
                total.textContent =
                    `Total: $${(product.price * product.quantity).toFixed(2)}`;

                saveCart();
                updateCartCount();
                updateCartSubtotal();
                displayOrderSummary();
            } else {
                cart = cart.filter((item) => {
                    return item.id !== product.id;
                });

                saveCart();
                displayCart();
            }
        });

        // Increase Quantity
        plusButton.addEventListener("click", () => {
            product.quantity++;

            quantity.textContent = product.quantity;
            total.textContent =
                `Total: $${(product.price * product.quantity).toFixed(2)}`;

            saveCart();
            updateCartCount();
            updateCartSubtotal();
            displayOrderSummary();
        });

        // Remove Product
        removeButton.addEventListener("click", () => {
            cart = cart.filter((item) => {
                return item.id !== product.id;
            });

            saveCart();
            displayCart();
        });
    });

    // Subtotal
    const subtotal = cart.reduce((total, product) => {
        return total + product.price * product.quantity;
    }, 0);

    const subtotalText = document.createElement("h3");
    subtotalText.classList.add("cart-subtotal");
    subtotalText.textContent = `Subtotal: $${subtotal.toFixed(2)}`;

    cartContainer.appendChild(subtotalText);

    // Clear Cart
    const clearCartButton = document.createElement("button");
    clearCartButton.textContent = "Clear Cart";

    clearCartButton.addEventListener("click", () => {
        cart = [];

        saveCart();
        displayCart();
    });

    cartContainer.appendChild(clearCartButton);
}

// Checkout Button
checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    document.querySelector("#checkout").scrollIntoView({
        behavior: "smooth"
    });
});

// Validate Checkout Form
function validateCheckoutForm() {
    nameError.textContent = "";
    emailError.textContent = "";
    phoneError.textContent = "";
    addressError.textContent = "";

    if (nameInput.value.trim() === "") {
        nameError.textContent = "Please enter your full name.";
        return false;
    }

    if (nameInput.value.trim().length < 3) {
        nameError.textContent = "Please enter a valid name.";
        return false;
    }

    if (emailInput.value.trim() === "") {
        emailError.textContent = "Please enter your email address.";
        return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailInput.value.trim())) {
        emailError.textContent = "Please enter a valid email address.";
        return false;
    }

    if (phoneInput.value.trim() === "") {
        phoneError.textContent = "Please enter your phone number.";
        return false;
    }

    if (phoneInput.value.trim().length < 10) {
        phoneError.textContent = "Please enter a valid phone number.";
        return false;
    }

    if (addressInput.value.trim() === "") {
        addressError.textContent = "Please enter your address.";
        return false;
    }

    if (addressInput.value.trim().length < 10) {
        addressError.textContent =
            "Please enter a more complete address.";
        return false;
    }

    return true;
}

// Checkout Submit
checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    if (!validateCheckoutForm()) {
        return;
    }

    orderSuccess.hidden = false;

    cart = [];

    saveCart();
    displayCart();
    checkoutForm.reset();

    orderSuccess.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});

// Contact Form
contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    contactSuccess.textContent =
        "Thank you! Your message has been sent successfully.";

    contactSuccess.hidden = false;

    contactForm.reset();
});

// Continue Shopping
continueShoppingButton.addEventListener("click", () => {
    orderSuccess.hidden = true;

    document.querySelector("#products").scrollIntoView({
        behavior: "smooth"
    });
});

// Display Order Summary
function displayOrderSummary() {
    orderSummaryItems.innerHTML = "";
    orderSummaryTotal.textContent = "";

    cart.forEach((product) => {
        const item = document.createElement("div");

        const title = document.createElement("h4");
        title.textContent = product.title;

        const quantity = document.createElement("p");
        quantity.textContent = `Quantity: ${product.quantity}`;

        const total = document.createElement("p");
        total.textContent =
            `Total: $${(product.price * product.quantity).toFixed(2)}`;

        item.appendChild(title);
        item.appendChild(quantity);
        item.appendChild(total);

        orderSummaryItems.appendChild(item);
    });

    const subtotal = cart.reduce((total, product) => {
        return total + product.price * product.quantity;
    }, 0);

    orderSummaryTotal.textContent = `Total: $${subtotal.toFixed(2)}`;
}

// Save Cart
function saveCart() {
    localStorage.setItem("novatechCart", JSON.stringify(cart));
}

// Load Cart
function loadCart() {
    const savedCart = localStorage.getItem("novatechCart");

    if (savedCart) {
        cart = JSON.parse(savedCart);
    } else {
        cart = [];
    }
}

// Initial State
orderSuccess.hidden = true;

loadCart();
displayCart();
loadProducts();
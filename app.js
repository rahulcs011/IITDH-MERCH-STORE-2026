const SIZE_SETS = { TEE_SIZES, HOODIE_SIZES };
let cart = [];
let discount = 0;
let appliedCoupon = "";

const cfg = STORE_CONFIG;
const products = cfg.products.map(p => ({
  ...p,
  sizes: typeof p.sizes === "string" ? (SIZE_SETS[p.sizes] || ["Free Size"]) : p.sizes,
  allowsCustomName: p.type === "shirt" || p.type === "hoodie"
}));

const mainView = document.getElementById("main-view");
const productList = document.getElementById("product-list");
const cartItemsList = document.getElementById("cart-items");
const cartTotalSpan = document.getElementById("cart-total");
const checkoutButton = document.getElementById("checkout-button");
const checkoutSection = document.getElementById("checkout-section");
const checkoutCartItemsList = document.getElementById("checkout-cart-items");
const checkoutSubtotalSpan = document.getElementById("checkout-subtotal");
const checkoutDiscountSpan = document.getElementById("checkout-discount");
const checkoutCartTotalSpan = document.getElementById("checkout-cart-total");
const placeOrderButton = document.getElementById("place-order-button");
const backToCartButton = document.getElementById("back-to-cart-button");
const checkoutForm = document.getElementById("checkout-form");
const couponCodeInput = document.getElementById("coupon-code");
const applyCouponButton = document.getElementById("apply-coupon-button");
const messageBox = document.getElementById("message-box");
const messageText = document.getElementById("message-text");
const closeMessageButton = document.getElementById("close-message");
const previewModal = document.getElementById("preview-modal");
const previewImageSlider = document.getElementById("preview-image-slider");
const previewDotsContainer = document.getElementById("preview-dots-container");
const prevImageButton = document.getElementById("prev-image");
const nextImageButton = document.getElementById("next-image");
const closePreviewModalButton = document.getElementById("close-preview-modal");
const previewTitle = document.getElementById("preview-title");
const cartIcon = document.getElementById("cart-icon");
const cartItemCount = document.getElementById("cart-item-count");
const toastNotification = document.getElementById("toast-notification");
const toastMessage = document.getElementById("toast-message");
const customNameModal = document.getElementById("custom-name-modal");
const modalCustomNameInput = document.getElementById("modal-custom-name");
const customNameHint = document.getElementById("custom-name-hint");
const saveCustomNameButton = document.getElementById("save-custom-name");
const cancelCustomNameButton = document.getElementById("cancel-custom-name");
const sizeChartModal = document.getElementById("size-chart-modal");
const closeSizeChartModalBtn = document.getElementById("close-size-chart-modal");
const processingOverlay = document.getElementById("processing-overlay");
const catalogueBtn = document.getElementById("catalogue-btn");
const sizeChartBtn = document.getElementById("size-chart-btn");

let currentProductIndex = 0;
let currentImageIndex = 0;
let activeCustomNameProductCard = null;
let activeModalImages = [];

const saveCart = () => localStorage.setItem("merchStoreCart", JSON.stringify(cart));
const loadCart = () => {
  try {
    const savedCart = JSON.parse(localStorage.getItem("merchStoreCart"));
    cart = Array.isArray(savedCart) ? savedCart.filter(item => {
      if (!item || !Number.isInteger(Number(item.id))) return false;
      const product = products.find(p => p.id === Number(item.id));
      return product &&
        product.sizes.includes(item.size) &&
        product.colors.includes(item.color) &&
        (!item.design || (product.designs && product.designs[item.design])) &&
        (!item.customName || (typeof item.customName === "string" && item.customName.length <= 20));
    }).map(item => ({
      ...item,
      id: Number(item.id),
      design: item.design || "",
      customName: !item.customName || item.customName === "N/A" ? null : item.customName
    })) : [];
  } catch (e) {
    cart = [];
  }
};

const saveCheckoutForm = () => {
  const data = {};
  ["name", "email", "roll_no", "phone", "batch_year"].forEach(id => {
    data[id] = document.getElementById(id).value;
  });
  localStorage.setItem("merchStoreCheckoutForm", JSON.stringify(data));
};
const loadCheckoutForm = () => {
  try {
    const data = JSON.parse(localStorage.getItem("merchStoreCheckoutForm"));
    if (data) Object.keys(data).forEach(id => {
      const el = document.getElementById(id);
      if (el && data[id]) el.value = data[id];
    });
  } catch (e) {}
};

const showMessage = (message, isCritical = true) => {
  if (isCritical) {
    messageText.textContent = message;
    messageBox.classList.remove("hidden"); messageBox.classList.add("flex");
  } else {
    toastMessage.textContent = message;
    toastNotification.classList.add("show");
    setTimeout(() => toastNotification.classList.remove("show"), 3000);
  }
};
const hideMessage = () => { messageBox.classList.add("hidden"); messageBox.classList.remove("flex"); };
closeMessageButton.addEventListener("click", hideMessage);

const getItemPrice = (item) => {
  const product = products.find(p => p.id === item.id);
  if (!product) return 0;
  let price = product.price;
  if (item.size === "XXL") price += cfg.xxlFee;
  if (item.customName) price += cfg.customNameFee;
  return price;
};

const getCartSubtotal = () => cart.reduce((sum, item) => sum + getItemPrice(item), 0);
const getCartTotal = () => Math.max(0, getCartSubtotal() - discount);
const getProductOptionName = (product, option) =>
  (product.optionNames && product.optionNames[option]) || option;
const getProductImages = (product, color, design) =>
  (design && product.designs && product.designs[design] && product.designs[design][color]) ||
  product.images[color] ||
  [];

const updateProductCardState = (card) => {
  const productId = parseInt(card.dataset.productId);
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const selectedColorEl = card.querySelector(".color-option.selected");
  const selectedSizeEl = card.querySelector(".size-option.selected");
  const selectedColor = selectedColorEl ? selectedColorEl.parentElement.dataset.color : product.colors[0];
  const selectedSize = selectedSizeEl ? selectedSizeEl.dataset.size : product.sizes[0];
  const selectedDesign = card.querySelector(".design-select")?.value || "";

  const customNameToggle = card.querySelector(".custom-name-toggle");
  const customNameValueEl = card.querySelector(".custom-name-value");
  const customNameValue = customNameValueEl ? customNameValueEl.value : "";
  const wantsCustomName = customNameToggle ? customNameToggle.checked : false;

  const productImage = card.querySelector(".product-image");
  const selectedImages = getProductImages(product, selectedColor, selectedDesign);
  if (selectedImages.length > 0) {
    productImage.src = selectedImages[0];
    productImage.dataset.imageIndex = 0;
  }

  const addToCartBtn = card.querySelector(".add-to-cart-btn");
  const itemInCart = cart.find(item =>
    item.id === productId &&
    item.size === selectedSize &&
    item.color === selectedColor &&
    (item.design || "") === selectedDesign &&
    (wantsCustomName ? item.customName === customNameValue : !item.customName)
  );

  if (itemInCart) {
    addToCartBtn.textContent = "Added";
    addToCartBtn.disabled = true;
    addToCartBtn.classList.remove("bg-indigo-600", "hover:bg-indigo-700");
    addToCartBtn.classList.add("bg-green-500", "cursor-not-allowed");
  } else {
    addToCartBtn.textContent = "Add to Cart";
    addToCartBtn.disabled = false;
    addToCartBtn.classList.add("bg-indigo-600", "hover:bg-indigo-700");
    addToCartBtn.classList.remove("bg-green-500", "cursor-not-allowed");
  }
};

const renderProducts = () => {
  productList.innerHTML = products.map((product, index) => {
    const firstColor = product.colors[0];
    const firstDesign = product.designs ? Object.keys(product.designs)[0] : "";
    const firstImages = getProductImages(product, firstColor, firstDesign);
    const firstImage = firstImages.length > 0
      ? firstImages[0]
      : "https://placehold.co/400x400/ccc/ffffff?text=Image+Not+Found";
    const loadingAttr = index === 0 ? 'fetchpriority="high"' : 'loading="lazy"';
    const xxlNote = product.sizes.includes("XXL") ? `<span class="text-xs text-gray-500">(+Rs. ${cfg.xxlFee} for XXL)</span>` : "";
    return `
    <div class="product-card bg-white rounded-xl p-4 flex flex-col justify-between group" data-product-id="${product.id}">
      <div class="relative product-image-container">
        <img src="${firstImage}" alt="${product.name}" class="rounded-lg mb-4 w-full h-72 object-contain bg-gray-200 cursor-pointer product-image" data-image-index="0" ${loadingAttr} onerror="this.onerror=null;this.src='https://placehold.co/400x400/ccc/ffffff?text=Image+Not+Found';">
        <button class="card-prev-btn absolute left-2 top-1/2 -translate-y-1/2 p-1 text-2xl text-white bg-black bg-opacity-30 rounded-full hover:bg-opacity-50 z-10 block transition-opacity">&lt;</button>
        <button class="card-next-btn absolute right-2 top-1/2 -translate-y-1/2 p-1 text-2xl text-white bg-black bg-opacity-30 rounded-full hover:bg-opacity-50 z-10 block transition-opacity">&gt;</button>
      </div>
      <div>
        <h3 class="text-xl font-semibold text-gray-900 mb-1">${product.name}</h3>
        <p class="text-lg font-medium text-indigo-600">Rs. ${product.price} ${xxlNote}</p>
        <div class="mt-4 space-y-3">
          ${product.designs ? `<div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5" for="design-${product.id}">${product.optionLabel || "Design"}:</label>
            <select id="design-${product.id}" class="design-select mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
              ${Object.keys(product.designs).map((design, i) => `<option value="${design}" ${i === 0 ? "selected" : ""}>${design}</option>`).join("")}
            </select>
          </div>` : ""}
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">Size:</label>
            <div class="size-selector">
              ${product.sizes.map((size, i) => `<div class="size-option ${i === 0 ? "selected" : ""}" data-size="${size}">${size}</div>`).join("")}
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">${product.designs ? "Color" : (product.optionLabel || "Color")}:</label>
            <div class="color-selector">
              ${product.colors.map((color, i) => `
                <div class="color-option-wrapper" data-color="${color}">
                  <div class="color-option ${i === 0 ? "selected" : ""}" style="background-color: ${(cfg.colorMap && cfg.colorMap[color]) || color};"></div>
                  <span class="text-xs text-gray-600">${getProductOptionName(product, color)}</span>
                </div>`).join("")}
            </div>
          </div>
          ${product.allowsCustomName ? `<div class="flex items-center space-x-2 pt-1"><input type="checkbox" id="custom_name_toggle-${product.id}" class="custom-name-toggle rounded text-indigo-600 focus:ring-indigo-500"><label for="custom_name_toggle-${product.id}" class="text-sm font-medium text-gray-700">Add custom name (+Rs. ${cfg.customNameFee})</label><input type="hidden" class="custom-name-value"></div>` : ""}
        </div>
      </div>
      <button class="add-to-cart-btn mt-4 bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-full hover:bg-indigo-700 transition duration-300">Add to Cart</button>
    </div>`;
  }).join("");
  addEventListenersToCards();
};

function addEventListenersToCards() {
  document.querySelectorAll(".product-card").forEach(card => {
    const productImage = card.querySelector(".product-image");
    const productId = parseInt(card.dataset.productId);
    const product = products.find(p => p.id === productId);

    const updateCardImage = (newIndex) => {
      const selectedColor = card.querySelector(".color-option.selected").parentElement.dataset.color;
      const selectedDesign = card.querySelector(".design-select")?.value || "";
      const imagesForColor = getProductImages(product, selectedColor, selectedDesign);
      if (!imagesForColor || imagesForColor.length <= 1) return;
      const clampedIndex = (newIndex + imagesForColor.length) % imagesForColor.length;
      productImage.src = imagesForColor[clampedIndex];
      productImage.dataset.imageIndex = clampedIndex;
    };

    card.querySelector(".card-next-btn").addEventListener("click", e => {
      e.stopPropagation();
      updateCardImage(parseInt(productImage.dataset.imageIndex || 0) + 1);
    });
    card.querySelector(".card-prev-btn").addEventListener("click", e => {
      e.stopPropagation();
      updateCardImage(parseInt(productImage.dataset.imageIndex || 0) - 1);
    });

    const designSelect = card.querySelector(".design-select");
    if (designSelect) designSelect.addEventListener("change", () => updateProductCardState(card));

    productImage.addEventListener("click", e => handleImagePreview(e, card));

    card.querySelectorAll(".size-option").forEach(option => {
      option.addEventListener("click", () => {
        card.querySelectorAll(".size-option").forEach(opt => opt.classList.remove("selected"));
        option.classList.add("selected");
        updateProductCardState(card);
      });
    });

    card.querySelectorAll(".color-option-wrapper").forEach(wrapper => {
      wrapper.addEventListener("click", () => {
        card.querySelectorAll(".color-option").forEach(opt => opt.classList.remove("selected"));
        wrapper.querySelector(".color-option").classList.add("selected");
        updateProductCardState(card);
      });
    });

    const customNameToggle = card.querySelector(".custom-name-toggle");
    if (customNameToggle) {
      customNameToggle.addEventListener("change", e => {
        if (e.target.checked) {
          activeCustomNameProductCard = card;
          modalCustomNameInput.value = "";
          showModal(customNameModal, "customName");
        } else {
          card.querySelector(".custom-name-value").value = "";
          updateProductCardState(card);
        }
      });
    }

    card.querySelector(".add-to-cart-btn").addEventListener("click", e => handleAddToCart(e, card));
  });
}

const renderCart = () => {
  cartItemsList.innerHTML = "";
  checkoutCartItemsList.innerHTML = "";
  if (cart.length === 0) {
    cartItemsList.innerHTML = '<p class="text-center text-gray-500">Your cart is empty.</p>';
  } else {
    cart.forEach((item, index) => {
      const product = products.find(p => p.id === item.id);
      if (!product) return;
      const itemPrice = getItemPrice(item);
      const optionDetails = [
        `${product.designs ? "Color" : (product.optionLabel || "Color")}: ${getProductOptionName(product, item.color)}`,
        item.design ? `${product.optionLabel || "Design"}: ${item.design}` : ""
      ].filter(Boolean).join(" - ");
      let itemDetails = `${product.name} - ${optionDetails} (${item.size})`;
      if (item.customName) itemDetails += ` + Custom Name: "${item.customName}"`;
      const cartItem = document.createElement("div");
      cartItem.className = "flex justify-between items-center bg-gray-50 p-4 rounded-lg";
      const itemContent = document.createElement("div");
      const itemName = document.createElement("p");
      itemName.className = "font-medium text-lg";
      itemName.textContent = itemDetails;
      const itemCost = document.createElement("p");
      itemCost.className = "text-sm text-gray-500";
      itemCost.textContent = `Rs. ${itemPrice}`;
      itemContent.append(itemName, itemCost);
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "remove-from-cart-btn text-red-500 hover:text-red-700 font-bold text-lg";
      removeButton.dataset.index = index;
      removeButton.textContent = "Remove";
      cartItem.append(itemContent, removeButton);
      cartItemsList.appendChild(cartItem);
      const checkoutItem = document.createElement("div");
      checkoutItem.className = "flex justify-between text-lg text-gray-700";
      const checkoutItemName = document.createElement("span");
      checkoutItemName.textContent = itemDetails;
      const checkoutItemPrice = document.createElement("span");
      checkoutItemPrice.textContent = `Rs. ${itemPrice}`;
      checkoutItem.append(checkoutItemName, checkoutItemPrice);
      checkoutCartItemsList.appendChild(checkoutItem);
    });
  }
  cartTotalSpan.textContent = `Rs. ${getCartTotal().toFixed(2)}`;
  checkoutSubtotalSpan.textContent = `Rs. ${getCartSubtotal().toFixed(2)}`;
  checkoutDiscountSpan.textContent = `- Rs. ${discount.toFixed(2)}`;
  checkoutCartTotalSpan.textContent = `Rs. ${getCartTotal().toFixed(2)}`;
  cartItemCount.textContent = cart.length;
};

const handleAddToCart = (e, parentCard) => {
  const productId = parseInt(parentCard.dataset.productId);
  const product = products.find(p => p.id === productId);
  const size = parentCard.querySelector(".size-option.selected").dataset.size;
  const color = parentCard.querySelector(".color-option.selected").parentElement.dataset.color;
  const design = parentCard.querySelector(".design-select")?.value || "";
  const customNameToggle = parentCard.querySelector(".custom-name-toggle");
  const customNameValueEl = parentCard.querySelector(".custom-name-value");
  const customNameValue = customNameValueEl ? customNameValueEl.value : "";

  let customName = null;
  if (customNameToggle && customNameToggle.checked) {
    if (!customNameValue.trim()) {
      showMessage("Please enter a name for the custom print.");
      return;
    }
    customName = customNameValue.trim();
  }

  cart.push({ id: productId, size, color, design, customName });
  discount = 0;
  appliedCoupon = "";
  couponCodeInput.value = "";
  renderCart();
  updateProductCardState(parentCard);
  showMessage("Item added to your cart!", false);
  saveCart();
};

const handleRemoveFromCart = e => {
  cart.splice(parseInt(e.target.dataset.index), 1);
  discount = 0;
  appliedCoupon = "";
  couponCodeInput.value = "";
  saveCart();
  renderCart();
  document.querySelectorAll(".product-card").forEach(card => updateProductCardState(card));
};

const handleImagePreview = (e, card) => {
  currentProductIndex = products.findIndex(p => p.id === parseInt(card.dataset.productId));
  const product = products[currentProductIndex];
  const selectedColor = card.querySelector(".color-option.selected").parentElement.dataset.color;
  const selectedDesign = card.querySelector(".design-select")?.value || "";
  activeModalImages = getProductImages(product, selectedColor, selectedDesign) || Object.values(product.images)[0];

  previewImageSlider.innerHTML = activeModalImages.map(src => `<img src="${src}" class="slider-image">`).join("");
  currentImageIndex = 0;
  updateModalImage();

  previewDotsContainer.innerHTML = activeModalImages.map((_, i) => `<div class="dot ${i === 0 ? "active" : ""}" data-index="${i}"></div>`).join("");
  document.querySelectorAll(".dot").forEach(dot => dot.addEventListener("click", ev => {
    currentImageIndex = parseInt(ev.target.dataset.index);
    updateModalImage();
  }));

  showModal(previewModal, "preview");
};

const updateModalImage = () => {
  const product = products[currentProductIndex];
  previewImageSlider.style.transform = `translateX(-${currentImageIndex * 100}%)`;
  previewTitle.textContent = product.name;
  document.querySelectorAll(".dot").forEach(dot => dot.classList.remove("active"));
  const activeDot = document.querySelector(`.dot[data-index="${currentImageIndex}"]`);
  if (activeDot) activeDot.classList.add("active");
};

const showPrevImage = () => {
  currentImageIndex = (currentImageIndex - 1 + activeModalImages.length) % activeModalImages.length;
  updateModalImage();
};
const showNextImage = () => {
  currentImageIndex = (currentImageIndex + 1) % activeModalImages.length;
  updateModalImage();
};

const generateOrderId = () => {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}${suffix}`;
};

const handlePlaceOrder = async event => {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const rollNo = document.getElementById("roll_no").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const batchYear = document.getElementById("batch_year").value;
  const screenshotFile = document.getElementById("payment-screenshot").files[0];

  let missingFields = [];
  if (!name) missingFields.push("Full Name");
  if (!email) missingFields.push("Email Address");
  if (!rollNo) missingFields.push("Roll No.");
  if (!phone) missingFields.push("WhatsApp No.");
  if (!batchYear) missingFields.push("Batch Year");
  if (!screenshotFile) missingFields.push("Payment Screenshot");

  if (missingFields.length > 0) {
    showMessage(`Please fill in the following fields: ${missingFields.join(", ")}.`);
    return;
  }
  if (name.length > 120 || rollNo.length > 40 || batchYear.length > 40) {
    showMessage("Please check your name, roll number, and batch/program lengths.");
    return;
  }
  if (cart.length > 30) {
    showMessage("An order can contain no more than 30 items. Please remove some items from your cart.");
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    showMessage("Please enter a valid 10-digit WhatsApp number.");
    return;
  }
  if (!/^[^\s@]+@iitdh\.ac\.in$/i.test(email)) {
    showMessage("Please use a valid @iitdh.ac.in email address.");
    return;
  }
  if (!/^image\/(png|jpe?g|webp|gif)$/i.test(screenshotFile.type) || screenshotFile.size > 5 * 1024 * 1024) {
    showMessage("Please upload a PNG, JPG, WEBP, or GIF payment screenshot no larger than 5 MB.");
    return;
  }
  if (!cfg.scriptURL || cfg.scriptURL === "PASTE_YOUR_APPS_SCRIPT_URL_HERE") {
    showMessage("Order submission is not configured yet. The store owner needs to add the Google Apps Script URL in config.js.");
    return;
  }

  placeOrderButton.disabled = true;
  processingOverlay.classList.remove("hidden");
  processingOverlay.classList.add("flex");

  try {
    const screenshotData = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(screenshotFile);
    });

    const payload = {
      orderId: generateOrderId(),
      name, email, rollNo, phone, batchYear,
      couponCode: appliedCoupon,
      items: cart.map(item => {
        const product = products.find(p => p.id === item.id);
        return {
          name: product.name,
          price: getItemPrice(item),
          size: item.size,
          color: getProductOptionName(product, item.color),
          design: item.design || "",
          customName: item.customName || "N/A"
        };
      }),
      subtotal: getCartSubtotal(),
      discount: discount,
      total: getCartTotal(),
      screenshotData: screenshotData,
      screenshotType: screenshotFile.type
    };

    await Promise.race([
      fetch(cfg.scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 30000))
    ]);
    processingOverlay.classList.add("hidden");
    processingOverlay.classList.remove("flex");
    showMessage(
      `Thank you! Your order request has been submitted. Order ID: ${payload.orderId}. Please check your email for the order details.`
    );
    placeOrderButton.disabled = false;
  } catch (error) {
    processingOverlay.classList.add("hidden");
    processingOverlay.classList.remove("flex");
    showMessage(`Order submission could not be confirmed. Please check your email before retrying, or contact us on WhatsApp: ${cfg.whatsapp.replace(/^91/, "")}.`);
    placeOrderButton.disabled = false;
  }
};

const setView = view => {
  mainView.classList.toggle("hidden", view !== "main");
  checkoutSection.classList.toggle("hidden", view !== "checkout");
  if (view === "checkout") window.scrollTo({ top: 0, behavior: "smooth" });
};

const showModal = (modalElement, historyState) => {
  modalElement.classList.remove("hidden");
  modalElement.classList.add("flex");
  history.pushState({ modal: historyState }, "");
};
const hideModal = modalElement => {
  modalElement.classList.add("hidden");
  modalElement.classList.remove("flex");
};

window.onpopstate = () => {
  hideModal(previewModal);
  hideModal(sizeChartModal);
  hideModal(customNameModal);
  if (history.state && history.state.view === "checkout") {
    setView("checkout");
  } else {
    setView("main");
  }
};

const applyCoupon = () => {
  const code = couponCodeInput.value.trim().toUpperCase();
  const cartSize = cart.length;
  const subtotal = getCartSubtotal();

  if (cartSize === 0) {
    showMessage("Your cart is empty. Please add items to apply a coupon.");
    discount = 0;
    renderCart();
    return;
  }

  const coupon = (cfg.coupons || []).find(c => c.code.toUpperCase() === code);

  if (!coupon) {
    discount = 0;
    appliedCoupon = "";
    showMessage("Invalid coupon code.");
    renderCart();
    return;
  }
  if (cartSize < coupon.minItems) {
    discount = 0;
    appliedCoupon = "";
    showMessage(`Coupon '${code}' needs at least ${coupon.minItems} item(s) in your cart.`);
    renderCart();
    return;
  }

  let discountValue;
  if (coupon.type === "percent") {
    discountValue = Math.floor(subtotal * coupon.value / 100);
  } else {
    discountValue = coupon.value;
    // Special rule: lower discount applies when ALL items are of coupon.itemsType (e.g. only t-shirts)
    if (coupon.itemsType) {
      const allItemsAreOfType = cart.every(item => {
        const product = products.find(p => p.id === item.id);
        return product && product.type === coupon.itemsType;
      });
      if (allItemsAreOfType && typeof coupon.itemsTypeDiscount === "number") {
        discountValue = coupon.itemsTypeDiscount;
      }
    }
  }
  discount = Math.min(discountValue, subtotal);
  appliedCoupon = code;
  showMessage(`Coupon '${code}' applied! You get Rs. ${discount.toFixed(2)} off.`, false);
  renderCart();
};

const buildSizeChart = () => {
  const teeRows = [
    ["Size", "Chest (in)", "Length (in)", "Shoulder (in)"],
    ["XS", "36", "26", "16"],
    ["S", "38", "28", "17"],
    ["M", "40", "29", "18"],
    ["L", "42", "30", "19"],
    ["XL", "44", "31", "20"],
    ["XXL", "46", "32", "21"]
  ];
  const hoodieRows = [
    ["Size", "Chest (in)", "Length (in)", "Shoulder (in)"],
    ["S", "40", "26", "22"],
    ["M", "42", "27", "23"],
    ["L", "44", "28", "24"],
    ["XL", "46", "29", "25"],
    ["XXL", "48", "30", "26"]
  ];
  const makeTable = (title, rows) => `
    <div class="mb-4">
      <h4 class="text-base font-semibold text-gray-900 mb-1">${title}</h4>
      <table class="w-full text-left border-collapse border border-gray-300 text-gray-800">
        ${rows.map((row, i) => `
          <tr class="${i === 0 ? "bg-indigo-600 text-white" : i % 2 === 0 ? "bg-gray-100" : ""}">
            ${row.map(cell => `<td class="border border-gray-300 px-2 py-1 text-sm ${i === 0 ? "font-semibold" : ""}">${cell}</td>`).join("")}
          </tr>`).join("")}
      </table>
    </div>`;
  document.getElementById("size-chart-content").innerHTML = makeTable("T-Shirts", teeRows) + makeTable("Hoodies", hoodieRows);
};

const applyStoreConfig = () => {
  document.title = cfg.storeName;
  document.getElementById("store-name").textContent = cfg.storeName;
  document.getElementById("store-tagline").textContent = cfg.tagline;

  if (cfg.announcement) {
    const annHtml = `<span class="text-lg font-semibold mx-4">${cfg.announcement}</span>`.repeat(4);
    document.getElementById("marquee-1").innerHTML = annHtml;
    document.getElementById("marquee-2").innerHTML = annHtml;
  } else {
    document.getElementById("announcement-bar").style.display = "none";
  }

  const qrImg = document.getElementById("upi-qr");
  if (cfg.qrImage && cfg.qrImage.trim() !== "") {
    qrImg.src = cfg.qrImage;
    qrImg.onerror = () => {
      qrImg.onerror = null;
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent("upi://pay?pa=" + cfg.upiId + "&cu=INR")}`;
    };
  } else {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent("upi://pay?pa=" + cfg.upiId + "&cu=INR")}`;
  }
  document.getElementById("upi-id-text").textContent = "UPI ID: " + cfg.upiId;

  const waEl = document.getElementById("footer-whatsapp");
  waEl.href = `https://wa.me/${cfg.whatsapp}`;
  waEl.textContent = cfg.whatsapp.replace(/^91/, "");
};

// --- Visitor tracking: logs each visit to the Google Sheet ---
const trackVisit = () => {
  try {
    let visitorId = localStorage.getItem("merchVisitorId");
    const isNew = !visitorId;
    if (isNew) {
      visitorId = "V" + Date.now() + Math.random().toString(36).slice(2, 8);
      localStorage.setItem("merchVisitorId", visitorId);
    }
    let visitCount = parseInt(localStorage.getItem("merchVisitCount") || "0") + 1;
    localStorage.setItem("merchVisitCount", visitCount);

    const payload = {
      type: "visit",
      visitorId: visitorId,
      page: window.location.pathname + window.location.hash,
      referrer: document.referrer || "Direct",
      userAgent: navigator.userAgent,
      screen: window.screen.width + "x" + window.screen.height,
      language: navigator.language,
      visitNumber: visitCount,
      isNew: isNew
    };

    navigator.sendBeacon
      ? navigator.sendBeacon(cfg.scriptURL, JSON.stringify(payload))
      : fetch(cfg.scriptURL, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) });
  } catch (e) {}
};

document.addEventListener("DOMContentLoaded", () => {
  applyStoreConfig();
  trackVisit();
  loadCart();
  loadCheckoutForm();
  buildSizeChart();
  history.replaceState({ view: "main" }, "", "#");
  renderProducts();
  renderCart();
  document.querySelectorAll(".product-card").forEach(card => updateProductCardState(card));
  checkoutForm.addEventListener("input", saveCheckoutForm);
  prevImageButton.addEventListener("click", showPrevImage);
  nextImageButton.addEventListener("click", showNextImage);
  closePreviewModalButton.addEventListener("click", () => {
    hideModal(previewModal);
    if (history.state && history.state.modal) history.back();
  });
  catalogueBtn.addEventListener("click", () => {
    setView("main");
    document.getElementById("product-section").scrollIntoView({ behavior: "smooth" });
  });
  sizeChartBtn.addEventListener("click", () => showModal(sizeChartModal, "sizeChart"));
  closeSizeChartModalBtn.addEventListener("click", () => {
    hideModal(sizeChartModal);
    if (history.state && history.state.modal) history.back();
  });
  saveCustomNameButton.addEventListener("click", () => {
    const name = modalCustomNameInput.value.trim();
    if (!name) {
      showMessage("Please enter a name for the custom print.");
      return;
    }
    if (activeCustomNameProductCard) {
      activeCustomNameProductCard.querySelector(".custom-name-value").value = name;
      hideModal(customNameModal);
      if (history.state && history.state.modal) history.back();
      const card = activeCustomNameProductCard;
      activeCustomNameProductCard = null;
      handleAddToCart(null, card);
    } else {
      hideModal(customNameModal);
      if (history.state && history.state.modal) history.back();
    }
  });
  modalCustomNameInput.addEventListener("keydown", e => {
    if (e.key === "Enter") saveCustomNameButton.click();
  });
  cancelCustomNameButton.addEventListener("click", cancelCustomNameModal);
  customNameHint.textContent = `Enter the name you want printed on your item. (+Rs. ${cfg.customNameFee})`;
});

cartItemsList.addEventListener("click", e => {
  if (e.target.classList.contains("remove-from-cart-btn")) handleRemoveFromCart(e);
});

checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) {
    showMessage("Your cart is empty. Please add items before checking out.");
    return;
  }
  setView("checkout");
  history.pushState({ view: "checkout" }, "", "#checkout");
});

placeOrderButton.addEventListener("click", handlePlaceOrder);
backToCartButton.addEventListener("click", () => history.back());
applyCouponButton.addEventListener("click", applyCoupon);

cartIcon.addEventListener("click", () => {
  if (cart.length === 0) {
    showMessage("Your cart is empty.");
    return;
  }
  if (!checkoutSection.classList.contains("hidden")) setView("main");
  requestAnimationFrame(() => {
    document.getElementById("cart-section").scrollIntoView({ behavior: "smooth" });
  });
});

const cancelCustomNameModal = () => {
  if (activeCustomNameProductCard) {
    const toggle = activeCustomNameProductCard.querySelector(".custom-name-toggle");
    if (toggle) toggle.checked = false;
    const valueEl = activeCustomNameProductCard.querySelector(".custom-name-value");
    if (valueEl) valueEl.value = "";
    updateProductCardState(activeCustomNameProductCard);
  }
  hideModal(customNameModal);
  if (history.state && history.state.modal) history.back();
};

const setupModalClosing = (modal, closeButton) => {
  modal.addEventListener("click", e => {
    if (e.target === modal) {
      hideModal(modal);
      if (history.state && history.state.modal) history.back();
    }
  });
  if (closeButton) closeButton.addEventListener("click", () => {
    hideModal(modal);
    if (history.state && history.state.modal) history.back();
  });
};
setupModalClosing(previewModal, null);
setupModalClosing(sizeChartModal, null);
customNameModal.addEventListener("click", e => {
  if (e.target === customNameModal) cancelCustomNameModal();
});

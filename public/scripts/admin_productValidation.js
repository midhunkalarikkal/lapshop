////// Validate product name \\\\\\
function validateProductName() {
  const productNameInput = document.getElementById("productName");
  const productName = productNameInput.value.trim();
  const productNameError = document.getElementById("productNameError");

  const productNamePattern = /^[a-zA-Z0-9\s]+$/;

  if (productName === "") {
    productNameError.textContent = "";
    productNameInput.classList.remove("is-invalid");
    return false;
  }

  if (productName.length < 5 || productName.length > 20) {
    productNameInput.classList.add("is-invalid");
    productNameError.textContent =
      "Name must be between 5 and 20 characters long.";
    return false;
  }

  if (!productNamePattern.test(productName)) {
    productNameInput.classList.add("is-invalid");
    productNameError.textContent =
      "Name must contain only alphabets, digits, and spaces.";
    return false;
  } else {
    productNameInput.classList.remove("is-invalid");
    productNameError.textContent = "";
    return true;
  }
}

////// Validate product description \\\\\\
function validateDesc() {
  const productDescInput = document.getElementById("productDescription");
  const productDesc = productDescInput.value.trim();
  const productDescError = document.getElementById("productDescError");

  if (productDesc === "") {
    productDescInput.classList.remove("is-invalid");
    productDescError.textContent = "";
    return false;
  }
  if (productDesc.length < 20 || productDesc.length > 200) {
    productDescInput.classList.add("is-invalid");
    productDescError.textContent =
      "Description must between 20 and 200 characters long";
    return false;
  } else {
    productDescInput.classList.remove("is-invalid");
    productDescError.textContent = "";
    return true;
  }
}

////// Validate product color \\\\\\
function validateColor() {
  const productColorInput = document.getElementById("productColour");
  const productColor = productColorInput.value.trim();
  const productColorError = document.getElementById("productColorError");

  const productColorPattern = /^[a-zA-Z\s]{3,15}$/;

  if (productColor === "") {
    productColorInput.classList.remove("is-invalid");
    productColorError.textContent = "";
    return false;
  }
  if (productColor.length < 3 || productColor.length > 15) {
    productColorInput.classList.add("is-invalid");
    productColorError.textContent =
      "Name must between 3 and 15 characters long";
    return false;
  }
  if (!productColorPattern.test(productColor)) {
    productColorInput.classList.add("is-invalid");
    productColorError.textContent = "Name must contain only alphabets.";
    return false;
  } else {
    productColorInput.classList.remove("is-invalid");
    productColorError.textContent = "";
    return true;
  }
}

////// Validate product stock \\\\\\
function validateStock() {
  const productStockInput = document.getElementById("productStock");
  const productStock = productStockInput.value.trim();
  const productStockError = document.getElementById("productStockError");

  if (productStock === "") {
    productStockInput.classList.remove("is-invalid");
    productStockError.textContent = "";
    return false;
  }
  if (productStock < 1 || productStock > 10000) {
    productStockInput.classList.add("is-invalid");
    productStockError.textContent = "Stock must between 1 and 10000.";
    return false;
  } else {
    productStockInput.classList.remove("is-invalid");
    productStockError.textContent = "";
    return true;
  }
}

////// Validate product real price \\\\\\
function validateRealPrice() {
  const productRealPriceInput = document.getElementById("productRealPrice");
  const productRealPrice = productRealPriceInput.value.trim();
  const productRealPriceError = document.getElementById(
    "productRealPriceError"
  );

  if (productRealPrice === "") {
    productRealPriceInput.classList.remove("is-invalid");
    productRealPriceError.textContent = "";
    return false;
  }
  if (productRealPrice < 500 || productRealPrice > 200000) {
    productRealPriceInput.classList.add("is-invalid");
    productRealPriceError.textContent =
      "Real price must between 500 and 200000.";
    return false;
  } else {
    productRealPriceInput.classList.remove("is-invalid");
    productRealPriceError.textContent = "";
    return true;
  }
}

////// Validate product offer price \\\\\\
function validateOfferPrice() {
  const productOfferPriceInput = document.getElementById("productOfferPrice");
  const productOfferPrice = productOfferPriceInput.value.trim();
  const productOfferPriceError = document.getElementById(
    "productOfferPriceError"
  );

  if (productOfferPrice === "") {
    productOfferPriceInput.classList.remove("is-invalid");
    productOfferPriceError.textContent = "";
    return false;
  }
  if (productOfferPrice < 400 || productOfferPrice > 200000) {
    productOfferPriceInput.classList.add("is-invalid");
    productOfferPriceError.textContent =
      "Offer price must between 400 and 200000.";
    return false;
  } else {
    productOfferPriceInput.classList.remove("is-invalid");
    productOfferPriceError.textContent = "";
    return true;
  }
}

////// Validate product discount percentage \\\\\\
function validateDiscount() {
  const productDiscountInput = document.getElementById(
    "productDiscountPercentage"
  );
  const productDiscount = productDiscountInput.value.trim();
  const productDiscountError = document.getElementById("productDiscountError");

  if (productDiscount === "") {
    productDiscountInput.classList.remove("is-invalid");
    productDiscountError.textContent = "";
    return false;
  }
  if (productDiscount < 1 || productDiscount >= 100) {
    productDiscountInput.classList.add("is-invalid");
    productDiscountError.textContent =
      "Discount percentage must between 1 and 99.";
    return false;
  } else {
    productDiscountInput.classList.remove("is-invalid");
    productDiscountError.textContent = "";
    return true;
  }
}

// Validate product screen size
function validateScreenSize() {
  const screenSizeSelect = document.getElementById("productScreenSize");
  const screenSizeValue = screenSizeSelect.value;
  const screenSizeError = document.getElementById("productScreenSizeError");

  if (screenSizeValue === "") {
    screenSizeSelect.classList.add("is-invalid");
    screenSizeError.textContent = "Please select a valid screen size.";
    return false;
  } else {
    screenSizeSelect.classList.remove("is-invalid");
    screenSizeError.textContent = "";
    return true;
  }
}

// Validate product hard disc size
function validateHardDiscSize() {
  const hardDiscSizeSelect = document.getElementById("productHardDiscSize");
  const hardDiscSizeValue = hardDiscSizeSelect.value;
  const hardDiscSizeError = document.getElementById("productHardDiscSizeError");

  if (hardDiscSizeValue === "") {
    hardDiscSizeSelect.classList.add("is-invalid");
    hardDiscSizeError.textContent = "Please select a valid hard disc size.";
    return false;
  } else {
    hardDiscSizeSelect.classList.remove("is-invalid");
    hardDiscSizeError.textContent = "";
    return true;
  }
}

// Validate product CPU model
function validateCpuModel() {
  const cpuModelSelect = document.getElementById("productCpuModel");
  const cpuModelValue = cpuModelSelect.value;
  const cpuModelError = document.getElementById("productCpuModelError");

  if (cpuModelValue === "") {
    cpuModelSelect.classList.add("is-invalid");
    cpuModelError.textContent = "Please select a valid CPU model.";
    return false;
  } else {
    cpuModelSelect.classList.remove("is-invalid");
    cpuModelError.textContent = "";
    return true;
  }
}

// Validate CPU Speed
function validateCpuSpeed() {
  const cpuSpeedSelect = document.getElementById("productCpuSpeed");
  const cpuSpeedValue = cpuSpeedSelect.value;
  const cpuSpeedError = document.getElementById("productCpuSpeedError");

  if (cpuSpeedValue === "") {
    cpuSpeedSelect.classList.add("is-invalid");
    cpuSpeedError.textContent = "Please select a valid CPU speed.";
    return false;
  } else {
    cpuSpeedSelect.classList.remove("is-invalid");
    cpuSpeedError.textContent = "";
    return true;
  }
}

// Validate product RAM size
function validateRamSize() {
  const ramSizeSelect = document.getElementById("productRamSize");
  const ramSizeValue = ramSizeSelect.value;
  const ramSizeError = document.getElementById("productRamSizeError");

  if (ramSizeValue === "") {
    ramSizeSelect.classList.add("is-invalid");
    ramSizeError.textContent = "Please select a valid RAM size.";
    return false;
  } else {
    ramSizeSelect.classList.remove("is-invalid");
    ramSizeError.textContent = "";
    return true;
  }
}

// Validate product operating system
function validateOperatingSystem() {
  const osSelect = document.getElementById("productOperatingSystem");
  const osValue = osSelect.value;
  const osError = document.getElementById("productOperatingSystemError");

  if (osValue === "") {
    osSelect.classList.add("is-invalid");
    osError.textContent = "Please select a valid operating system.";
    return false;
  } else {
    osSelect.classList.remove("is-invalid");
    osError.textContent = "";
    return true;
  }
}

// Validate product graphics card
function validateGraphicsCard() {
  const graphicsCardInput = document.getElementById("productGraphicsCard");
  const graphicsCard = graphicsCardInput.value.trim();
  const graphicsCardError = document.getElementById("productGraphicsCardError");
  const regex = /^.{4,50}$/;

  if (graphicsCard === "") {
    graphicsCardInput.classList.remove("is-invalid");
    graphicsCardError.textContent = "";
    return false;
  }
  if (!regex.test(graphicsCard)) {
    graphicsCardInput.classList.add("is-invalid");
    graphicsCardError.textContent =
      "Graphics card must be between 4 and 30 characters and can include letters, numbers, spaces, and special characters.";
    return false;
  } else {
    graphicsCardInput.classList.remove("is-invalid");
    graphicsCardError.textContent = "";
    return true;
  }
}

// Validate product about fields dynamically
function validateProductAbout(inputId) {
  const aboutInput = document.getElementById(inputId);
  const aboutValue = aboutInput.value.trim();
  const aboutError = document.getElementById(`${inputId}Error`);
  const regex = /^[\s\S]{20,250}$/;

  if (aboutValue === "") {
    aboutInput.classList.remove("is-invalid");
    aboutError.textContent = "";
    return false;
  }
  if (!regex.test(aboutValue)) {
    aboutInput.classList.add("is-invalid");
    aboutError.textContent =
      "Product about must be between 20 and 250 characters.";
    return false;
  } else {
    aboutInput.classList.remove("is-invalid");
    aboutError.textContent = "";
    return true;
  }
}

// Validate Product Battery
function validateProductBattery() {
  const batterySelect = document.getElementById("productBattery");
  const batteryValue = batterySelect.value;
  const batteryError = document.getElementById("productBatteryError");

  if (batteryValue === "") {
    batterySelect.classList.add("is-invalid");
    batteryError.textContent = "Please select a valid battery type.";
    return false;
  } else {
    batterySelect.classList.remove("is-invalid");
    batteryError.textContent = "";
    return true;
  }
}

// Validate Product Battery Energy
function validateProductBatteryEnergy() {
  const batteryEnergySelect = document.getElementById("productBatteryEnergy");
  const batteryEnergyValue = batteryEnergySelect.value;
  const batteryEnergyError = document.getElementById(
    "productBatteryEnergyError"
  );

  if (batteryEnergyValue === "") {
    batteryEnergySelect.classList.add("is-invalid");
    batteryEnergyError.textContent = "Please select a valid battery energy.";
    return false;
  } else {
    batteryEnergySelect.classList.remove("is-invalid");
    batteryEnergyError.textContent = "";
    return true;
  }
}

// Validate Product Voltage
function validateProductVoltage() {
  const voltageSelect = document.getElementById("productVoltage");
  const voltageValue = voltageSelect.value;
  const voltageError = document.getElementById("productVoltageError");

  if (voltageValue === "") {
    voltageSelect.classList.add("is-invalid");
    voltageError.textContent = "Please select a valid voltage.";
    return false;
  } else {
    voltageSelect.classList.remove("is-invalid");
    voltageError.textContent = "";
    return true;
  }
}

// Validate Product Weight
function validateProductWeight() {
  const weightSelect = document.getElementById("productWeight");
  const weightValue = weightSelect.value;
  const weightError = document.getElementById("productWeightError");

  if (weightValue === "") {
    weightSelect.classList.add("is-invalid");
    weightError.textContent = "Please select a valid weight.";
    return false;
  } else {
    weightSelect.classList.remove("is-invalid");
    weightError.textContent = "";
    return true;
  }
}


function validateProducthdType() {
  const producthdTypeInput = document.getElementById('producthdType');
  const producthdType = producthdTypeInput.value.trim();
  const producthdTypeError = document.getElementById('producthdTypeError');

  if (producthdType === "") {
      producthdTypeInput.classList.add('is-invalid');
      producthdTypeError.textContent = 'Please select a hard drive type.';
      return false;
  } else {
      producthdTypeInput.classList.remove('is-invalid');
      producthdTypeError.textContent = '';
      return true;
  }
}

function validateProductWattage() {
  const productWattageInput = document.getElementById('productWattage');
  const productWattage = productWattageInput.value.trim();
  const productWattageError = document.getElementById('productWattageError');

  const regex = /^[A-Za-z0-9\s-]+$/;

  if (productWattage === "") {
      productWattageInput.classList.add('is-invalid');
      productWattageError.textContent = 'Wattage is required.';
      return false;
  }
  if (!regex.test(productWattage)) {
      productWattageInput.classList.add('is-invalid');
      productWattageError.textContent = 'Wattage can only include numbers, spaces, hyphens, and alphabets.';
      return false;
  }
  if (productWattage < 1 || productWattage > 5000) {
      productWattageInput.classList.add('is-invalid');
      productWattageError.textContent = 'Wattage must be between 1 and 5000.';
      return false;
  } else {
      productWattageInput.classList.remove('is-invalid');
      productWattageError.textContent = '';
      return true;
  }
}

////// Validation function for name input \\\\\\
function validateName() {
    const nameInput = document.getElementById('name');
    const name = nameInput.value.trim();
    const nameError = document.getElementById('nameError');

    const namePattern = /^[a-zA-Z][a-zA-Z\s]*[a-zA-Z]$/;

    if (name === "") {
        nameInput.classList.remove('is-invalid');
        nameError.textContent = '';
        return false;
    }
    if (!namePattern.test(name)) {
        nameInput.classList.add('is-invalid');
        nameError.textContent = 'Name must contain only alphabets and spaces.';
        return false;
    } else if (name.length < 5 || name.length > 25) {
        nameInput.classList.add('is-invalid');
        nameError.textContent = 'Name must be between 5 and 25 characters long';
        return false;
    } else {
        nameInput.classList.remove('is-invalid');
        nameError.textContent = '';
        return true;
    }
}

////// Validation function for phone input \\\\\\
function validatePhone() {
    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value.trim();
    const phoneError = document.getElementById('phoneError');

    const phonePattern = /^\d{10}$/;

    if (phone === "") {
        phoneInput.classList.remove('is-invalid');
        phoneError.textContent = '';
        return false;
    }
    if (!phonePattern.test(phone)) {
        phoneInput.classList.add('is-invalid');
        phoneError.textContent = 'Phone number must contain only 10 digits';
        return false;
    } else {
        phoneInput.classList.remove('is-invalid');
        phoneError.textContent = '';
        return true;
    }
}

////// Validation function for addressLine input \\\\\\
function validateAddressLine() {
    const addressLineInput = document.getElementById('addressLine');
    const addressLine = addressLineInput.value
    const addressLineError = document.getElementById('addressLineError');

    if (addressLine === "") {
        addressLineInput.classList.remove('is-invalid');
        addressLineError.textContent = '';
        return false;
    }
    if (addressLine.length < 5) {
        addressLineInput.classList.add('is-invalid');
        addressLineError.textContent = 'Address line must be at least 5 characters';
        return false;
    } else if (addressLine.length > 40) {
        addressLineInput.classList.add('is-invalid');
        addressLineError.textContent = 'Address line must be less than 40 characters';
        return false;
    } else {
        addressLineInput.classList.remove('is-invalid');
        addressLineError.textContent = '';
        return true;
    }
}

////// Validation function for pincode input \\\\\\
function validatePincode() {
    const pincodeInput = document.getElementById('pincode');
    const pincode = pincodeInput.value;
    const pincodeError = document.getElementById('pincodeError');
    const pincodePattern = /^[1-9]\d{5}$/;

    if (pincode === "") {
        pincodeInput.classList.remove('is-invalid');
        pincodeError.textContent = '';
        return false;
    }
    if (!pincodePattern.test(pincode)) {
        pincodeInput.classList.add('is-invalid');
        pincodeError.textContent = 'Pin code must be six digits long, starting with a digit between 1 and 9.';
        return false;
    } else {
        pincodeInput.classList.remove('is-invalid');
        pincodeError.textContent = '';
        return true;
    }
}

////// Validation function for city input \\\\\\
function validateCity() {
    const cityInput = document.getElementById('city');
    const city = cityInput.value.trim();
    const cityError = document.getElementById('cityError');

    const cityPattern = /^[a-zA-Z\s]+$/;

    if (city === "") {
        cityInput.classList.remove('is-invalid');
        cityError.textContent = '';
        return false;
    }
    if (!cityPattern.test(city)) {
        cityInput.classList.add('is-invalid');
        cityError.textContent = 'City must contain only alphabets and spaces';
        return false;
    } else if (city.length < 3 || city.length > 25) {
        cityInput.classList.add('is-invalid');
        cityError.textContent = 'Name must be between 3 and 25 characters long';
        return false;
    } else {
        cityInput.classList.remove('is-invalid');
        cityError.textContent = '';
        return true;
    }
}

////// Validation function for district input \\\\\\
function validateDistrict() {
    const districtInput = document.getElementById('district');
    const district = districtInput.value.trim();
    const districtError = document.getElementById('districtError');

    const districtPattern = /^[a-zA-Z\s]+$/;
    if (district === "") {
        districtInput.classList.remove('is-invalid');
        districtError.textContent = '';
        return false;
    }
    if (!districtPattern.test(district)) {
        districtInput.classList.add('is-invalid');
        districtError.textContent = 'District must contain only alphabets and spaces';
        return false;
    } else if (district.length < 4 || district.length > 15) {
        nameInput.classList.add('is-invalid');
        nameError.textContent = 'Name must be between 4 and 15 characters long';
        return false;
    } else {
        districtInput.classList.remove('is-invalid');
        districtError.textContent = '';
        return true;
    }
}

////// Validation function for state input \\\\\\
function validateState() {
    const stateInput = document.getElementById('state');
    const state = stateInput.value.trim();
    const stateError = document.getElementById('stateError');

    const statePattern = /^[a-zA-Z\s]+$/;

    if (state === "") {
        stateInput.classList.remove('is-invalid');
        stateError.textContent = '';
        return false;
    }
    if (state.length < 3 || state.length > 15) {
        stateInput.classList.add('is-invalid');
        stateError.textContent = 'State must be between 3 and 15 characters long';
        return false;
    } else if (!statePattern.test(state)) {
        stateInput.classList.add('is-invalid');
        stateError.textContent = 'State must contain only alphabets and spaces';
        return false;
    } else {
        stateInput.classList.remove('is-invalid');
        stateError.textContent = '';
        return true;
    }
}



////// To submit the form \\\\\\
function validateForm() {
    const isValidName = validateName();
    const isValidAddressLine = validateAddressLine();
    const isValidPhone = validatePhone();
    const isValidCity = validateCity();
    const isValidDistrict = validateDistrict();
    const isValidState = validateState();
    const isValidPincode = validatePincode();

    return isValidName && isValidAddressLine && isValidPhone && isValidCity && isValidDistrict && isValidState && isValidPincode;
}

const saveButtons = document.getElementById('addAddress');

saveButtons.addEventListener('click', async function (event) {
        event.preventDefault();

        if (validateForm()) {
            const formData = {
                name: document.getElementById('name').value,
                addressLine: document.getElementById('addressLine').value,
                phone: document.getElementById('phone').value,
                city: document.getElementById('city').value,
                district: document.getElementById('district').value,
                state: document.getElementById('state').value,
                pincode: document.getElementById('pincode').value,
                country: document.getElementById('country').value
            };

            Swal.fire({
                title: "Adding new address.",
                text: "Please wait",
                background: "#333",
                color: "#ffffff",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const response = await fetch(`/saveNewAddress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const contentType = response.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
                Swal.close();
            } else {
                window.location.href = `/login`;
            }

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success.',
                    text: data.message || 'New address added successfully..',
                    background: "#333",
                    color: "#ffffff",
                    showConfirmButton: true
                }).then(() => {
                    window.location.href = '/checkout';
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: data.message || 'Something went wrong.',
                    timer: 3000,
                    background: "#333",
                    color: "#ffffff",
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Fix the errors in the form.',
                timer: 3000,
                background: "#333",
                color: "#ffffff",
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    });

////// Cancel button goBack function \\\\\\
function goBack() {
    window.location.href = "/checkout"
}
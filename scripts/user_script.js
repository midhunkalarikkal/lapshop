////////// User registration page alert box handling start//////////
var alertElement = document.getElementById('myAlert');
function hideAlert() {
    alertElement.style.transition = "opacity 1s";
    alertElement.style.opacity = "0";
    setTimeout(function () {
        alertElement.style.display = "none";
    }, 1000);
}
setTimeout(hideAlert, 3000);

////////// User registration page password mismatching indicator start//////////
function checkPasswordMatch() {
    var password = document.getElementById("pass").value;
    var confirmPassword = document.getElementById("confirmpass").value;
    var confirmPassInput = document.getElementById("confirmpass");

    if (confirmPassword !== password) {
        confirmPassInput.style.borderBottomColor = "red";
        return false;
    } else {
        confirmPassInput.style.borderBottomColor = "";
        return true;
    }
}

////////// User registration page and login page email validation checking indicator start//////////
function validateEmail() {
    var emailInput = document.getElementById("email");
    var email = emailInput.value;
    var emailRegex = /^[^\s@]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
        emailInput.classList.add("invalid-email");
        return false;
    } else {
        emailInput.classList.remove("invalid-email");
        return true;
    }
}

////////// User registration page mobile number validation indicator start//////////
document.getElementById("phone").addEventListener("blur", validatePhoneNumber);
function validatePhoneNumber() {
    var phoneInput = document.getElementById("phone");
    var phoneNumber = phoneInput.value;
    var phoneRegex = /^\d{10}$/;

    if (!phoneRegex.test(phoneNumber)) {
        phoneInput.style.borderColor = "red";
        return false;
    } else {
        phoneInput.style.borderColor = "";
        return true;
    }
}

////////// User registration page form submit after validation start//////////
document.getElementById("registrationForm").addEventListener("submit", function (event) {
    var errorMessage = "";

    // Validate email
    if (!validateEmail()) {
        errorMessage = "Email format is invalid";
    }

    // Validate password match
    else if (!checkPasswordMatch()) {
        errorMessage = "Passwords do not match";
    }

    // Validate phone number
    else if (!validatePhoneNumber()) {
        errorMessage = "Invalid mobile number";
    }

    if (errorMessage) {
        event.preventDefault();
        window.location.href = "/submitError?message=" + encodeURIComponent(errorMessage);
    } else {
        this.submit();
    }
});



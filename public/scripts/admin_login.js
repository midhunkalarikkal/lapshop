////// To validate the email \\\\\\
function validateEmail() {
    var emailInput = document.getElementById("email");
    var email = emailInput.value;
    var emailError = document.getElementById("emailError")

    var emailRegex = /^[^\s@]+@gmail\.com$/;
    
    if (!email) {
        emailInput.classList.remove("invalid-email");
        emailError.innerText = "";
        emailInput.classList.remove('mb-3');
        return false;
    }
    if (!emailRegex.test(email)) {
        emailInput.classList.add("invalid-email");
        emailError.innerText = "Invalid email"
        emailInput.classList.add('mb-3');
        return false;
    }else {
        emailInput.classList.remove("invalid-email");
        emailError.innerText = ""
        emailInput.classList.remove('mb-3');
        return true;
    }
}

////// Alert script \\\\\\
var alertElement = document.getElementById('myAlert');
if (alertElement) {
    function hideAlert(){
        alertElement.style.transition = "opacity 1s";
        alertElement.style.opacity = "0";
        setTimeout(function () {
            alertElement.style.display = "none";
        }, 1000);
    }
    setTimeout(hideAlert, 3000);
}
    
////// For showing the password \\\\\\
function showpassword() {
    var checkbox = document.getElementById("showPasswordCheckbox");
    var passwordInput = document.getElementById("password");
    
    if (checkbox.checked) {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
}
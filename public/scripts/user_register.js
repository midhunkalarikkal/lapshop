////// For the referal input \\\\\\
function showRefIn(e) {
  e.preventDefault();
  document.getElementById("referal-input").classList.remove("d-none");
}

////// To validate the email \\\\\\
function validateEmail() {
  var emailInput = document.getElementById("email");
  var email = emailInput.value;
  var emailRegex = /^[^\s@]+@gmail\.com$/;
  if (!email) {
    emailInput.classList.remove("invalid-input");
    document.getElementById("emailError").innerText = "";
    document.getElementById("email-input").classList.remove("mb-3");
    return false;
  }
  if (!emailRegex.test(email)) {
    emailInput.classList.add("invalid-input");
    document.getElementById("emailError").innerText = "Invalid email";
    document.getElementById("email-input").classList.add("mb-3");
    return false;
  } else {
    emailInput.classList.remove("invalid-input");
    document.getElementById("emailError").innerText = "";
    document.getElementById("email-input").classList.remove("mb-3");
    return true;
  }
}

////// To validate the phone \\\\\\
function validatePhone() {
  var phoneInput = document.getElementById("phone");
  var phone = phoneInput.value;
  var phoneRegex = /^[1-9][0-9]{9}$/;
  if (!phone) {
    phoneInput.classList.remove("invalid-input");
    document.getElementById("phoneError").innerText = "";
    document.getElementById("phone-input").classList.remove("mb-3");
    return false;
  }
  if (!phoneRegex.test(phone)) {
    phoneInput.classList.add("invalid-input");
    document.getElementById("phoneError").innerText = "Invalid Phone number";
    document.getElementById("phone-input").classList.add("mb-3");
    return false;
  } else {
    phoneInput.classList.remove("invalid-input");
    document.getElementById("phoneError").innerText = "";
    document.getElementById("phone-input").classList.remove("mb-3");
    return true;
  }
}

////// To validate fullname \\\\\\
function validateFullName() {
  var fullnameInput = document.getElementById("fullname");
  var fullname = fullnameInput.value;
  var fullnameRegex = /^[A-Za-z ]{5,40}$/;
  if (!fullname) {
    fullnameInput.classList.remove("invalid-input");
    document.getElementById("fullnameError").innerText = "";
    document.getElementById("fullname-input").classList.remove("mb-3");
    return false;
  }
  if (!fullnameRegex.test(fullname)) {
    fullnameInput.classList.add("invalid-input");
    document.getElementById("fullnameError").innerText =
      "Must be 5 to 40 characters long.";
    document.getElementById("fullname-input").classList.add("mb-3");
    return false;
  } else {
    fullnameInput.classList.remove("invalid-input");
    document.getElementById("fullnameError").innerText = "";
    document.getElementById("fullname-input").classList.remove("mb-3");
    return true;
  }
}

////// To validate the password \\\\\\
function validatePassword() {
  const passwordInput = document.getElementById("password");
  const password = passwordInput.value;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  if (!password) {
    passwordError.innerText = "";
    passwordInput.classList.remove("invalid-input");
    document.getElementById("password-input").classList.remove("mb-3");
    document.getElementById("passwordConditions").style.display = "none";
    return false;
  }
  if (!passwordRegex.test(password)) {
    passwordError.innerText = "Password is not meeting the conditions";
    passwordInput.classList.add("invalid-input");
    document.getElementById("password-input").classList.add("mb-3");
    document.getElementById("passwordConditions").style.display = "block";
    return false;
  } else {
    passwordError.innerText = "";
    passwordInput.classList.remove("invalid-input");
    document.getElementById("password-input").classList.remove("mb-3");
    document.getElementById("passwordConditions").style.display = "none";
    return true;
  }
}

////// To validate the confirm password \\\\\\
function validateConfirmPassword() {
  const confirmPasswordInput = document.getElementById("confirmpassword");
  const confirmPassword = confirmPasswordInput.value;
  const Password = document.getElementById("password").value;
  if (confirmPassword !== Password) {
    confirmPasswordInput.classList.add("invalid-input");
    document.getElementById("confirmPasswordError").innerText =
      "Password is not matching";
    document.getElementById("confirmPassword-input").classList.add("mb-3");
    return false;
  } else {
    confirmPasswordInput.classList.remove("invalid-input");
    document.getElementById("confirmPasswordError").innerText = "";
    document.getElementById("confirmPassword-input").classList.remove("mb-3");
    return true;
  }
}

////// For the submit button \\\\\\
function registerbtn() {
  if (
    validateEmail() &&
    validatePhone() &&
    validateFullName() &&
    validatePassword() &&
    validateConfirmPassword()
  ) {
    return true;
  } else {
    Swal.fire({
      title: "Registration error",
      text: "Check all the fields are entered correctly.",
      icon: "info",
      timer: 2000,
      background: "#333",
      color: "#ffffff",
      timerProgressBar: true,
      showConfirmButton: false,
    });
    return false;
  }
}

////// Alert script \\\\\\
var alertElement = document.getElementById("myAlert");
if (alertElement) {
  function hideAlert() {
    alertElement.style.transition = "opacity 1s";
    alertElement.style.opacity = "0";
    setTimeout(function () {
      alertElement.style.display = "none";
    }, 1000);
  }
  setTimeout(hideAlert, 3000);
}

////// For showing the password
function showpassword() {
  var checkbox = document.getElementById("showPasswordCheckbox");
  var passwordInput = document.getElementById("password");
  var confirmPasswordInput = document.getElementById("confirmpassword");

  if (checkbox.checked) {
    passwordInput.type = "text";
    confirmPasswordInput.type = "text";
  } else {
    passwordInput.type = "password";
    confirmPasswordInput.type = "password";
  }
}

const registerForm = document.getElementById("registrationForm");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    fullname: document.getElementById("fullname").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    password: document.getElementById("password").value,
    referalCode: document.getElementById("referal-input").value,
  };

  try {
    Swal.fire({
      title: "Loading",
      background: "#333",
      color: "#ffffff",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    Swal.close();

    if (data.success) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Redirecting to verification",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#333",
        color: "#ffffff",
        willClose: () => {
          window.location.href = data.redirectUrl || "/";
        },
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Registration Failed.",
        text: data.message || "Invalid credentials. Please try again.",
        timer: 2000, 
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#333",
        color: "#ffffff",
      });
    }
  } catch (error) {
    Swal.close();
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An unexpected error occurred. Please try again later.",
      timer: 2000, 
      timerProgressBar: true,
      showConfirmButton: false,
      background: "#333",
      color: "#ffffff",
    });
  }
});

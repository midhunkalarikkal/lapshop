////// To validate the email \\\\\\
function validateEmail() {
    var emailInput = document.getElementById("email");
    var email = emailInput.value;
    var emailRegex = /^[^\s@]+@gmail\.com$/;
    if (!email) {
        emailInput.classList.remove("invalid-email");
        document.getElementById('emailError').innerText = ""
        document.getElementById('email-input').classList.remove("mb-3")
        return false;
    }
    if (!emailRegex.test(email)) {
        emailInput.classList.add("invalid-email");
        document.getElementById('emailError').innerText = "Invalid email"
        document.getElementById('email-input').classList.add("mb-3")
        return false;
    } else {
        emailInput.classList.remove("invalid-email");
        document.getElementById('emailError').innerText = ""
        document.getElementById('email-input').classList.remove("mb-3")
        return true;
    }
}

////// To send the otp to email \\\\\\
document.getElementById('submit').addEventListener('click', async function (event) {
    event.preventDefault();

    let email = document.getElementById('email').value;
    if (email == "") {
        Swal.fire({
            icon: 'error',
            title: 'empty email',
            text: 'Please enter an email.',
            background: "#333",
            color: "#ffffff",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
        return;
    }

    if (!validateEmail()) {
        Swal.fire({
            icon: 'error',
            title: 'Incorrect email',
            text: 'Please enter a valid email.',
            background: "#333",
            color: "#ffffff",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
        return;
    }

    const formData = {
        email: email
    };

    try {
        Swal.fire({
            title: "Sending OTP.",
            text: "Please wait",
            background: "#333",
            color: "#ffffff",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        const response = await fetch('/fpassPostEmail', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json()
        Swal.close();

        if (data.success) {
            Swal.fire({
                icon: "success",
                title: 'OTP Sent',
                text: data.message || 'An OTP has been sent to your email.',
                background: "#333",
                color: "#ffffff",
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
            });

            document.getElementById("submit").style.display = "none";
            document.getElementById("fpOtpVerify").style.display = "block";
            document.getElementById("otp-input").classList.remove("d-none")
            document.getElementById("otp-input").classList.add("d-block")

            let timeLeft = 180;
            const timerElement = document.getElementById('timer');
            timerElement.style.display = "block"
            const timerInterval = setInterval(() => {
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                timerElement.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                timeLeft--;
                if (timeLeft < 30) {
                    timerElement.style.color = "red"
                }

                if (timeLeft < 0) {
                    clearInterval(timerInterval);
                    document.getElementById("submit").innerText = "Resend OTP";
                    document.getElementById("submit").style.display = "block";
                    document.getElementById("fpOtpVerify").style.display = "none";
                    document.getElementById("otp-input").classList.add("d-none")
                    document.getElementById("otp-input").classList.remove("d-block")
                    timerElement.innerText = "00:00";
                    timerElement.style.display = "none"
                    timerElement.style.color = "white"
                }
            }, 1000);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'Otp sending failed.',
                background: "#333",
                color: "#ffffff",
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    } catch (error) {
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "Internal server error.",
            background: "#333",
            color: "#ffffff",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
        });
    }
});

////// To verify the otp \\\\\\
document.getElementById('fpOtpVerify').addEventListener('click', async function (event) {
    event.preventDefault();

    const otp = document.getElementById('otp').value;
    if (otp == "") {
        Swal.fire({
            icon: 'info',
            title: 'Empty field',
            text: 'Please enter the otp.',
            background: "#333",
            color: "#ffffff",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
        return;
    }
    const formData = { otp };

    try {
        Swal.fire({
            title: "Verifying OTP.",
            text: "Please wait",
            background: "#333",
            color: "#ffffff",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
        
        const response = await fetch('/fpassPostOtp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        Swal.close();

        if (data.success) {
            Swal.fire({
                icon: "success",
                title: 'OTP verified',
                text: data.message || 'Otp verified successfully.',
                background: "#333",
                color: "#ffffff",
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false,
            });
            document.getElementById('form-box-one').style.display = "none"
            document.getElementById('form-box-two').style.display = "block"
        } else if(data.invalidOtp){
            Swal.fire({
                icon: 'warning',
                title: 'Invalid otp',
                text: data.message || "Please enter the correct otp..",
                background: "#333",
                color: "#ffffff",
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || "Otp matching error.",
                background: "#333",
                color: "#ffffff",
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    } catch (error) {
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "Internal server error.",
            background: "#333",
            color: "#ffffff",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
        });
    }
});

////// To check the new passwords are valid \\\\\\
const passwordInput = document.getElementById('newPass');
passwordInput.addEventListener('input', function (event) {
    const password = event.target.value;

    const conditions = {
        length: password.length >= 8,
        capitalLetter: /[A-Z]/.test(password),
        smallLetter: /[a-z]/.test(password),
        digit: /\d/.test(password),
        specialCharacter: /[!@#$%^&*]/.test(password)
    };

    let message = 'Password must contain';
    if (!conditions.length) {
        message += ' at least 8 characters, ';
    }
    if (!conditions.capitalLetter) {
        message += 'at least one capital letter, ';
    }
    if (!conditions.smallLetter) {
        message += 'at least one small letter, ';
    }
    if (!conditions.digit) {
        message += 'at least one digit, ';
    }
    if (!conditions.specialCharacter) {
        message += 'at least one special character (!@#$%^&*), ';
    }
    if (conditions.length && conditions.capitalLetter && conditions.smallLetter && conditions.digit && conditions.specialCharacter) {
        message = ""
    }
    message = message.trim();
    if (message) {
        passwordError.innerText = message;
        passwordError.style.display = 'block';
        passwordInput.style.borderBottomColor = "red";
    } else {
        passwordError.style.display = 'none';
        passwordInput.style.borderBottomColor = "";
    }
});

////// To check the confirm password is equal to the new password \\\\\\
const confirmPasswordInput = document.getElementById('confirmPass');
confirmPasswordInput.addEventListener('input', function (event) {
    const confirmPassword = event.target.value;
    const newpPassword = document.getElementById('newPass').value
    if (confirmPassword !== newpPassword) {
        confirmPasswordInput.style.borderBottomColor = "red"
        document.getElementById('submitPassword').disabled = true;
        document.getElementById('confirmPasswordError').innerText = "Password is not matching"
    } else {
        confirmPasswordInput.style.borderBottomColor = ""
        document.getElementById('submitPassword').disabled = false;
        document.getElementById('confirmPasswordError').innerText = ""
    }
})


////// To submit the passwords from second form \\\\\\
document.getElementById('submitPassword').addEventListener('click', async function (event) {
    event.preventDefault();

    const newPassword = document.getElementById('newPass').value;
    const confirmPassword = document.getElementById('confirmPass').value;

    if (newPassword == "") {
        Swal.fire({
            icon: 'info',
            title: 'Empty field',
            text: 'Please enter a valid password.',
            background: "#333",
            color: "#ffffff",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
        return;
    }

    if (confirmPassword == "") {
        Swal.fire({
            icon: 'error',
            title: 'Empty field',
            text: 'Password confirming field is empty.',
            background: "#333",
            color: "#ffffff",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
        return;
    }


    if (newPassword !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Password Mismatch',
            text: 'The passwords are not matching.',
            background: "#333",
            color: "#ffffff",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
        return;
    }

    const formData = { newPassword: newPassword };

    try {
        Swal.fire({
            title: "Updating password.",
            text: "Please wait",
            background: "#333",
            color: "#ffffff",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        const response = await fetch('/fpassPostPassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        Swal.close();

        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'User password',
                text: data.message || 'Pasword is reseted successfully.',
                timer: 2000,
                background: "#333",
                color: "#ffffff",
                timerProgressBar: true,
                showConfirmButton: false,
            }).then(() => {
                window.location.replace('/login');
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: data.message || 'Something went wrong',
                background: "#333",
                color: "#ffffff",
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    } catch (error) {
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "Internal server error.",
            background: "#333",
            color: "#ffffff",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
        });
    }
});

////// Function to show password
function showpassword() {
    var checkbox = document.getElementById("showPasswordCheckbox");
    var passwordInput = document.getElementById("newPass");
    var confirmPasswordInput = document.getElementById("confirmPass");

    if (checkbox.checked) {
        passwordInput.type = "text";
        confirmPasswordInput.type = "text";
    } else {
        passwordInput.type = "password";
        confirmPasswordInput.type = "password";
    }
}
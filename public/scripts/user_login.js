////// To validate the email \\\\\\
function validateEmail() {
    var emailInput = document.getElementById("email");
    var email = emailInput.value;
    var emailRegex = /^[^\s@]+@gmail\.com$/;
    if (!email) {
        emailInput.classList.remove("invalid-email");
        document.getElementById('emailError').innerText = "";
        document.getElementById('email-input').classList.remove('mb-3');
        return false;
    }
    if (!emailRegex.test(email)) {
        emailInput.classList.add("invalid-email");
        document.getElementById('emailError').innerText = "Invalid email"
        document.getElementById('email-input').classList.add('mb-3');
        return false;
    }else {
        emailInput.classList.remove("invalid-email");
        document.getElementById('emailError').innerText = ""
            document.getElementById('email-input').classList.remove('mb-3');
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

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        Swal.fire({
            title: 'Authenticating...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const response = await fetch('/login', {
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
                title: 'Login Successful',
                text: 'Welcome back!',
                timer: 2000, 
                timerProgressBar: true, 
                showConfirmButton: false, 
                background: '#333', 
                color: '#fff', 
                willClose: () => {
                    window.location.href = data.redirectUrl || '/';
                }
            })
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: data.message || 'Invalid credentials. Please try again.'
            });
        }
    } catch (error) {
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred. Please try again later.'
        });
    }
});
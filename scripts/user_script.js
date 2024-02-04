//////////User registration page alert box handling start//////////

// Function to hide the alert slowly
var alertElement = document.getElementById('myAlert');
function hideAlert() {
    alertElement.style.transition = "opacity 1s"; // Apply transition effect to opacity
    alertElement.style.opacity = "0"; // Set opacity to 0 to fade out slowly
    setTimeout(function () {
        alertElement.style.display = "none"; // Hide the alert after the transition completes
    }, 1000); // Wait for 1 second (same as transition duration)
}

// Call the hideAlert function after 3 seconds
setTimeout(hideAlert, 3000);

//////////User registration page alert box handling end//////////

//////////User registration page password mismatching indicator start//////////

function checkPasswordMatch() {
    var password = document.getElementById("pass").value;
    var confirmPassword = document.getElementById("confirmpass").value;
    var confirmPassInput = document.getElementById("confirmpass");

    if (password !== confirmPassword) {
        confirmPassInput.style.borderBottomColor = "red";
    } else {
        confirmPassInput.style.borderBottomColor = "";  // Reset border color to default
    }
}

//////////User registration page password mismatching indicator end//////////
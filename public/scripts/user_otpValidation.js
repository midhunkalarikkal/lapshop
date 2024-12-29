////// Attach input event listener to each input field \\\\\\
const otpInputs = document.querySelectorAll(".input");
otpInputs.forEach((input, index) => {
  input.addEventListener("input", (event) => {
    if (event.target.value.length === 1 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
  });

  ////// Prevent pasting into input fields \\\\\\
  input.addEventListener("paste", (event) => {
    event.preventDefault();
    const clipboardData = event.clipboardData || window.clipboardData;
    const pastedText = clipboardData.getData("text");
    const pastedChars = pastedText.split("");
    pastedChars.forEach((char, i) => {
      if (
        index + i < otpInputs.length &&
        otpInputs[index + i].value.length === 0
      ) {
        otpInputs[index + i].value = char;
        if (index + i < otpInputs.length - 1) {
          otpInputs[index + i + 1].focus();
        }
      }
    });
  });

  ////// Arrow key navigation \\\\\\
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (index > 0) {
        otpInputs[index - 1].focus();
        otpInputs[index - 1].setSelectionRange(
          otpInputs[index - 1].value.length,
          otpInputs[index - 1].value.length
        );
      }
    } else if (event.key.length === 1 && otpInputs[index].value.length > 0) {
      event.preventDefault();
    }
  });
});

////// For the alert \\\\\\
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

document.addEventListener("DOMContentLoaded", function () {
  var submitButton = document.getElementById("submit");
  if (submitButton) {
    submitButton.classList.add("d-none");
  }
});

////// Funtion to display the timer \\\\\\
let timerRunning = false;

function startTimer() {
  const sendOtp = document.getElementById("sendOtp"); // Corrected from 'resendOtp' to 'sendOtp'
  const otpViewSpan = document.getElementById("otpTimeView");
  const submitButton = document.getElementById("submit");

  if (sendOtp) {
    sendOtp.classList.add("d-none");
  }
  if (submitButton) {
    submitButton.classList.remove("d-none");
  }

  otpViewSpan.innerHTML = "Timer: 00:30";
  let secondsLeft = 180;

  const countdown = setInterval(() => {
    secondsLeft--;
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    if (secondsLeft <= 0) {
      clearInterval(countdown);
      if (sendOtp) {
        sendOtp.classList.remove("d-none");
        sendOtp.innerHTML = "Resend OTP";
      }
      otpViewSpan.innerHTML = "";
      timerRunning = false;
      if (submitButton) {
        submitButton.classList.add("d-none");
      }
    } else {
      otpViewSpan.innerHTML =
        "Timer: " + formattedMinutes + ":" + formattedSeconds;
    }
  }, 1000);
}

// Sending otp
async function sendotp() {
  const verifyOtpBtn = document.getElementById("submit");
  verifyOtpBtn.disabled = false;

  if (!timerRunning) {
    startTimer();
  }

  try {
    Swal.fire({
      title: "Sending OTP",
      background: "#333",
      color: "#ffffff",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await fetch("/sendotp", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("Content-Type");
    const rawData = await response.text();
    Swal.close();

    let data;
    if (contentType && contentType.includes("application/json")) {
      data = JSON.parse(rawData);
    } else {
      throw new Error("Unexpected content type");
    }

    if (data.success) {
      Swal.fire({
        icon: "success",
        title: "OTP Sent",
        text: data.message || "Your OTP has been resent successfully!",
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false,
        background: "#333",
        color: "#ffffff",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data.message || "Failed to resend OTP",
        timer: 3000,
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
      text: "An error occurred while resending OTP",
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      background: "#333",
      color: "#ffffff",
    });
  }
}

// Verifying otp
document.getElementById("submit").addEventListener("click", async function (e) {
  e.preventDefault();

  const otpInputs = document.querySelectorAll(".otp-input");
  let otp = "";
  otpInputs.forEach((input) => (otp += input.value));

  try {
    Swal.fire({
      title: "Verifying OTP",
      background: "#333",
      color: "#ffffff",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await fetch("/otpverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp: otp }),
    });

    const data = await response.json();
    Swal.close();

    if (data.success) {
      Swal.fire({
        icon: "success",
        title: "Success",
        text: data.message,
        timer: 2000,
        background: "#333",
        color: "#ffffff",
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "/login";
      });
    } else if (data.invalidOtp) {
      Swal.fire({
        title: "Invalid otp",
        text: data.message || "Please enter the correct otp.",
        icon: "info",
        timer: 2000,
        background: "#333",
        color: "#ffffff",
        timerProgressBar: true,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        title: "Info",
        text: data.message || "Something went wrong.",
        icon: "info",
        timer: 2000,
        background: "#333",
        color: "#ffffff",
        timerProgressBar: true,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "/register";
      });
    }
  } catch (error) {
    Swal.close();
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "An error occurred while verifying OTP",
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      background: "#333",
      color: "#ffffff",
    });
  }
});

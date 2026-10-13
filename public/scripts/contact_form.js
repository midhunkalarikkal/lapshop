
function setFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);

    input.classList.toggle("is-invalid", Boolean(message));
    error.textContent = message;

    return !message;
}

function validateName() {
    const name = document.getElementById("name").value.trim();
    const pattern = /^[a-zA-Z]+(?:\s+[a-zA-Z]+)*$/;

    if (!name) {
        return setFieldError("name", "nameError", "Name is required.");
    }

    if (!pattern.test(name)) {
        return setFieldError("name", "nameError", "Name must contain only letters and spaces.");
    }

    if (name.length < 5 || name.length > 25) {
        return setFieldError("name", "nameError", "Name must be between 5 and 25 characters.");
    }

    return setFieldError("name", "nameError", "");
}

function validateEmail() {
    const email = document.getElementById("email").value.trim();
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
        return setFieldError("email", "emailError", "Email address is required.");
    }

    if (!pattern.test(email)) {
        return setFieldError("email", "emailError", "Please enter a valid email address.");
    }

    return setFieldError("email", "emailError", "");
}

function validatePhone() {
    const phone = document.getElementById("phone").value.trim();

    if (!phone) {
        return setFieldError("phone", "phoneError", "Phone number is required.");
    }

    if (!/^\d{10}$/.test(phone)) {
        return setFieldError("phone", "phoneError", "Phone number must contain exactly 10 digits.");
    }

    return setFieldError("phone", "phoneError", "");
}

function validateMessage() {
    const message = document.getElementById("message").value.trim();
    const counter = document.getElementById("messageCounter");

    counter.textContent = `${document.getElementById("message").value.length} / 400`;

    if (!message) {
        return setFieldError("message", "messageError", "Message is required.");
    }

    if (message.length < 10 || message.length > 400) {
        return setFieldError("message", "messageError", "Message must be between 10 and 400 characters.");
    }

    return setFieldError("message", "messageError", "");
}

function goBack() {
    window.location.href = "/shop";
}

document.getElementById("submit-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const validations = [
        validateName(),
        validateEmail(),
        validatePhone(),
        validateMessage()
    ];

    if (!validations.every(Boolean)) {
        return;
    }

    const submitButton = document.getElementById("submitButton");

    const formData = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        message: document.getElementById("message").value.trim()
    };

    submitButton.disabled = true;

    try {
        Swal.fire({
            title: "Sending your message",
            text: "Please wait a moment...",
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading()
        });

        const response = await fetch("/contactForm", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        Swal.close();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Unable to send your message.");
        }

        await Swal.fire({
            icon: "success",
            title: "Message sent!",
            text: "Thank you for contacting LapShop. We'll get back to you soon.",
            confirmButtonText: "Done",
            confirmButtonColor: "#198754"
        });

        document.getElementById("submit-form").reset();
        document.getElementById("messageCounter").textContent = "0 / 400";

    } catch (error) {
        Swal.close();

        await Swal.fire({
            icon: "error",
            title: "Something went wrong",
            text: error.message || "Please try again later.",
            confirmButtonText: "Try again",
            confirmButtonColor: "#198754"
        });

    } finally {
        submitButton.disabled = false;
    }
});

 ////// To delete the profile image \\\\\\
 async function deletePI(button){
    const confirmation = await swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover your profile image!',
        icon: 'warning',
        showCancelButton: true,
        background: "#333",
        color: "#ffffff",
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    });

    if (confirmation.isConfirmed) {
        try {
            Swal.fire({
                title: "Deleting image",
                background: "#333",
                color: "#ffffff",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const response = await fetch('/deleteUserProfileImage', {
                method: 'DELETE'
            });

            const contentType = response.headers.get('content-type');
            let data;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
                Swal.close();
            } else {
                window.location.href = '/login'
                return;
            }

            if (data.success) {
                swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Profile image deleted successfully!',
                    showConfirmButton: true,
                    background: "#333",
                    color: "#ffffff",
                    confirmButtonText: "Ok"
                }).then((result)=>{
                    if(result.isConfirmed){
                        location.reload()
                    }
                })
            } else {
                swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message || 'Failed to delete profile image!',
                    showConfirmButton: true,
                    background: "#333",
                    color: "#ffffff",
                    confirmButtonText: "Ok"
                });
            }
        } catch (error) {
            Swal.close();
            swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Internal server error, Please try again later.',
                timer: 3000,
                background: "#333",
                color: "#ffffff",
                timerProgressBar: true,
                showConfirmButton: false,
            });
        }
    }
}

////// To copy the referal code \\\\\\
function copyReferal() {
    const referralCodeElement = document.getElementById('referralCode');
    const btn = document.getElementById('referalCopyBtn')
    let referralCode = referralCodeElement.textContent;
    referralCode = referralCode.trim()
    navigator.clipboard.writeText(referralCode)
    .then(() => {
        btn.innerHTML = "COPIED";
        setTimeout(function () {
            btn.innerHTML = "COPY REFERRAL";
        }, 3000);
    })
    .catch((error) => {
        Swal.fire({
            icon: 'info',
            title: 'Copy Failed',
            text: 'Failed to copy the code. Please try again.',
            timer: 3000,
            background: "#333",
            color: "#ffffff",
            timerProgressBar: true,
            showConfirmButton: false
            
        });
    });
}

////// Function to handle image preview \\\\\\
function previewImage() {
    const preview = document.getElementById('preview');
    const file = document.getElementById('image').files[0];
    const reader = new FileReader();

    reader.onloadend = function () {
        preview.src = reader.result;
    };

    if (file) {
        reader.readAsDataURL(file);
    } else {
        preview.src = "/static/images/icons/No profile image.jpg";
    }
}

 ////// Validation function for name input \\\\\\
 function validateName() {
        const nameInput = document.getElementById('userName');
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
            phoneError.textContent = 'Phone number must contain only 10 digits.';
            return false;
        } else {
            phoneInput.classList.remove('is-invalid');
            phoneError.textContent = '';
            return true;
        }
    }

    ////// Validation function for phone input \\\\\\
    function validateEmail() {
    const emailInput = document.getElementById("email");
    const email = emailInput.value;
    const emailError = document.getElementById('emailError');

    var emailRegex = /^[^\s@]+@gmail\.com$/;

    if (email === "") {
        emailInput.classList.remove('is-invalid');
        emailError.textContent = '';
        return false;
    }
    if (!emailRegex.test(email)) {
        emailInput.classList.add('is-invalid');
        emailError.textContent = 'Phone check the email.';
        return false;
    } else {
        emailInput.classList.remove('is-invalid');
        emailError.textContent = '';
        return true;
    }
}


////// To update the user information \\\\\\
document.getElementById('saveUserInfo').addEventListener('click', async function () {
    const formData = {
        userName: document.getElementById('userName').value,
        phone: document.getElementById('phone').value,
        userId: document.getElementById('userId').value
    };
    
    if(!formData.userName || !formData.phone){
        swal.fire({
            icon: "info",
            title: "Empty field",
            text: "Please fill the fields.",
            background: "#333",
            color: "#ffffff",
            showConfirmButton: true,
            confirmButtonText: "Ok"
        })
        return false
    }      

    if(!validateName() || !validatePhone()){
        swal.fire({
            icon: "warning",
            title: "Invalid info",
            text: "Please check the fields.",
            background: "#333",
            color: "#ffffff",
            showConfirmButton: true,
            confirmButtonText: "Ok"
        })
        return false
    }            

    try {
        Swal.fire({
            title: "Updating your info.",
            text: "Please wait",
            background: "#333",
            color: "#ffffff",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        const response = await fetch('/updateUserInfo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            Swal.close();

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: data.message || 'User updated successfully',
                    showConfirmButton: true,
                    background: "#333",
                    color: "#ffffff",
                    confirmButtonText: "Ok"
                }).then((result) => {
                    if (result.isConfirmed) {
                        $('#informationModal').modal('hide');
                        location.reload();
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: data.message || 'Failed to update user information',
                    timer: 3000,
                    background: "#333",
                    color: "#ffffff",
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            }
        } else {
            window.location.href = `/login`;
            return;
        }
    } catch (error) {
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Internal server error',
            timer: 3000,
            background: "#333",
            color: "#ffffff",
            timerProgressBar: true,
            showConfirmButton: false
        });
    }
});

////// Function to handle image upload \\\\\\
document.getElementById('saveUserImage').addEventListener('click', async function () {
    const userProfileImageInput = document.getElementById("image").files[0];
    const userId = document.getElementById('userIdFromImage').value;

    if (!userProfileImageInput) {
        Swal.fire({
            icon: 'info',
            title: 'Profile image',
            text: 'Please select an image',
            background: "#333",
            color: "#ffffff",
            showConfirmButton: true,
            confirmButtonText: "Ok"       
        });
        return;
    }

    const formData = new FormData();
    formData.append('profileImg', userProfileImageInput);
    formData.append('userId', userId);

    try {
        Swal.fire({
            title: "Uploading image.",
            text: "Please wait",
            background: "#333",
            color: "#ffffff",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        const response = await fetch('/uploadProfileImage', {
            method: 'POST',
            body: formData
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            Swal.close();
            if (data.success) {
                $('#profileImageModal').modal('hide');
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: data.message || 'Profile image uploaded successfully',
                    background: "#333",
                    color: "#ffffff",
                    showConfirmButton: true,
                    confirmButtonText: "Ok"
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.reload();
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: data.message || 'Failed to upload profile image',
                    timer: 3000,
                    background: "#333",
                    color: "#ffffff",
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            }
        } else {
            window.location.href = `/login`;
            return;
        }
    } catch (error) {
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Internal server error',
            background: "#333",
            color: "#ffffff",
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false
        });
    }
});


////// To delete a specific address \\\\\\
document.querySelectorAll('.delete-address-btn').forEach(button => {
    button.addEventListener('click', async function () {
        const addressId = this.dataset.adid;

        const confirmResult = await Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: 'You are about to delete this address.',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it',
            background: "#333",
            color: "#ffffff",
        });

        if (confirmResult.isConfirmed) {
            try {
                Swal.fire({
                    title: "Deleting address.",
                    text: "Please wait",
                    background: "#333",
                    color: "#ffffff",
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    },
                });
                const response = await fetch(`/deleteAddress/${addressId}`, {
                    method: 'DELETE'
                });
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    Swal.close();
                    if(data.success){
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: data.message || 'Address deleted successfully.',
                            showConfirmButton: true,
                            background: "#333",
                            color: "#ffffff",
                            confirmButtonText: 'OK'
                        }).then((result)=>{
                            if(result.isConfirmed){
                                location.reload();
                            }
                        })
                    }else{
                        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: data.message || 'Address deletion failed.',
                            timer: 3000,
                            background: "#333",
                            color: "#ffffff",
                            timerProgressBar: true,
                            showConfirmButton: false
                        })
                    }
                }else{
                    window.location.href = '/login'
                    return;
                }
            } catch (error) {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: error.message || 'Failed to delete address',
                    timer: 3000,
                    background: "#333",
                    color: "#ffffff",
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            }
        }
    });
});

////// To add a new address \\\\\\
document.getElementById('add-address').addEventListener('click', function () {
    const userId = this.dataset.userid;
    window.location.href = `/addAddress/${userId}`; 
});    


////// To edit a specific address \\\\\\
document.querySelectorAll('.edit-address-btn').forEach(button => {
    button.addEventListener('click', function () {
    const addressId = this.dataset.adid;
    window.location.href = `/editAddress/${addressId}`; 
    });
});

////// To send otp to email for changing password \\\\
document.getElementById('sendOtp').addEventListener('click', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const userId = document.getElementById('userId').value;
    const userEmail = document.getElementById('userEmail').value;

    if(!email){
        Swal.fire({
            icon: 'info',
            title: 'Empty field',
            text: 'Please enter your email..',
            showConfirmButton: true,
            background: "#333",
            color: "#ffffff",
            confirmButtonText: "Ok"
        });
        return;
    }

    if(!validateEmail()){
        Swal.fire({
            icon: 'warning',
            title: 'Incorrect eamil!',
            text: 'Please check the email..',
            showConfirmButton: true,
            background: "#333",
            color: "#ffffff",
            confirmButtonText: "Ok"
        });
        return;
    }

    if(email !== userEmail){
        Swal.fire({
            icon: 'info',
            title: 'Eamil!',
            text: 'Entered email is not registered.',
            showConfirmButton: true,
            background: "#333",
            color: "#ffffff",
            confirmButtonText: "Ok"
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
        
        const response = await fetch('/sendOtpForPass', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            Swal.close();
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'OTP Sent!',
                    text: data.message || 'OTP sent successfully.',
                    timer: 3000,
                    background: "#333",
                    color: "#ffffff",
                    timerProgressBar: true,
                    showConfirmButton: false
                });

                document.getElementById("submitOtp").disabled = false;
                document.getElementById("sendOtp").disabled = true;
                document.getElementById("otp-input").classList.remove("d-none")
                document.getElementById("otp-input").classList.add("d-block")

                let timeLeft = 180;
                const timerElement = document.getElementById('timer');
                const timerInterval = setInterval(() => {
                    const minutes = Math.floor(timeLeft / 60);
                    const seconds = timeLeft % 60;
                    timerElement.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    timeLeft--;
                    if (timeLeft < 30) {
                        timerElement.style.color = "red";
                    }

                    if (timeLeft < 0) {
                        clearInterval(timerInterval);
                        document.getElementById("sendOtp").disabled = false;
                        document.getElementById("submitOtp").disabled = true;
                        document.getElementById("sendOtp").innerText = "Resend OTP";
                        document.getElementById("otp-input").classList.remove("d-block")
                        document.getElementById("otp-input").classList.add("d-none")
                        timerElement.innerText = "00:00";
                        timerElement.style.color = "black";
                    }
                }, 1000);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: data.message || 'Failed to send OTP',
                    timer: 3000,
                    background: "#333",
                    color: "#ffffff",
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            }
        }else{
            window.location.href = `/login`;
            return;
        }
    } catch (error) {
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Internal server error.',
            timer: 3000,
            background: "#333",
            color: "#ffffff",
            timerProgressBar: true,
            showConfirmButton: false
        });
    }
});

////// For submiting otp \\\\\\
document.getElementById('submitOtp').addEventListener('click', async function () {
    const formData = {
        otp: document.getElementById('passotp').value,
    };

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
        const response = await fetch('/submitOtp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            Swal.close();
            if (data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Otp verified",
                    text: data.message || "Opt verified successfully.",
                    timer: 3000,
                    background: "#333",
                    color: "#ffffff",
                    timerProgressBar: true,
                    showConfirmButton: false
                }).then(()=>{
                    $('#verifyModal').modal('hide');
                    $('#passModal').modal('show');
                })
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Invalid OTP",
                    text: data.message || "Entered OTP is incorrect",
                    timer: 3000,
                    background: "#333",
                    color: "#ffffff",
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            }
        } else {
            window.location.href = `/login`;
            return;
        }
    } catch (error) {
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Network error. Please try again.',
            timer: 3000,
            background: "#333",
            color: "#ffffff",
            timerProgressBar: true,
            showConfirmButton: false
        });
    }
});

////// For submiting the new password \\\\\\
document.getElementById('submitPass').addEventListener('click', async function (event) {
    event.preventDefault();

    const newPass = document.getElementById('newPass').value;
    const confirmPass = document.getElementById('confirmPass').value;
    const userId = document.getElementById('userId').value;

    if (newPass !== confirmPass) {
        Swal.fire({
            icon: 'info',
            title: 'Password!',
            text: 'Password is not matching.',
            showConfirmButton: true,
            background: "#333",
            color: "#ffffff",
            confirmButtonText: "Ok"
        });
        return;
    }

    const formData = {
        newPass: newPass,
        userId: userId
    };

    try {
        Swal.fire({
            title: "Updating.",
            text: "Please wait",
            background: "#333",
            color: "#ffffff",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });
        const response = await fetch('/updatePassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            Swal.close();
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Password',
                    text: data.message || 'Password changed successfully.',
                    showConfirmButton: true,
                    background: "#333",
                    color: "#ffffff",
                    confirmButtonText: "Ok"
                }).then((result) => {
                    if (result.isConfirmed) {
                        $('#passModal').modal('hide');
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed!',
                    text: data.message || 'Password update failed, please try again.',
                    timer: 3000,
                    background: "#333",
                    color: "#ffffff",
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            }
        } else {
            window.location.href = `/login`;
            return;
        }
    } catch (error) {
        Swal.close();
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Internal server error.',
            timer: 3000,
            background: "#333",
            color: "#ffffff",
            timerProgressBar: true,
            showConfirmButton: false
        });
    }
});
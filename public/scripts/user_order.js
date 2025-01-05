////// To got orderDetail page \\\\\\
function goToOrderDetail(button) {
    const orderId = button.getAttribute('data-orderId');
    window.location.href = `/orderDetail/${orderId}`;
}

////// To got order tracking page \\\\\\
function goToTrackOrder(button) {
    const orderId = button.getAttribute('data-orderId');
    window.location.href = `/trackOrder/${orderId}`;
}

////// To cancel a order \\\\\\
function cancelOrder(button){
    const orderId = button.getAttribute("data-orderId")

    Swal.fire({
        title: 'Are you sure want to cancel this order?',
        text: 'This cancel cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        background: "#333",
        color: "#ffffff",
        confirmButtonText: 'Yes, cancel it!',
        cancelButtonText: 'No, keep it'
    }).then((result) => {
        if (result.isConfirmed) {

            Swal.fire({
                title: "Cancelling order.",
                text: "Please wait",
                background: "#333",
                color: "#ffffff",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            fetch('/cancelOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId })
            })
            .then(response => {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json(); 
                } else {
                    window.location.href = `/login`;
                }
            })
            .then(data => {
                Swal.close();
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: data.message,
                        showConfirmButton: true,
                        background: "#333",
                        color: "#ffffff",
                        confirmButtonText: 'OK'
                    }).then(()=>{
                        location.reload()
                    })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: data.message,
                        timer: 3000,
                        background: "#333",
                        color: "#ffffff",
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                }
            })
            .catch(error => {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'An error occurred. Please try again later.',
                    timer: 3000,
                    background: "#333",
                    color: "#ffffff",
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            });
        }
    });
}

////// To complete payment if the payment is failed \\\\\\
function repayment(button){
    const orderId = button.getAttribute("data-orderId")
    window.location.href = `/rePayment/${orderId}`
}

////// To got orderDetail page \\\\\\
function goToOrderDetail(button) {
    const orderId = button.getAttribute('data-orderId');
    window.location.href = `/orderDetail/${orderId}`;
}

////// To return an order \\\\\\
function returnOrder(button){
    const orderId = button.getAttribute("data-orderId")

    Swal.fire({
        title: 'Are you sure want to return this order?',
        text: 'This cancel cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        background: "#333",
        color: "#ffffff",
        confirmButtonText: 'Yes, cancel it!',
        cancelButtonText: 'No, keep it'
    }).then((result) => {
        if (result.isConfirmed) {

            Swal.fire({
                title: "Returning order.",
                text: "Please wait",
                background: "#333",
                color: "#ffffff",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });
            
            fetch('/returnOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ orderId })
            })
            .then(response => {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json(); 
                } else {
                    window.location.href = `/login`;
                }
            })
            .then(data => {
                Swal.close();
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: data.message,
                        showConfirmButton: true,
                        background: "#333",
                        color: "#ffffff",
                        confirmButtonText: 'OK'
                    }).then(()=>{
                        location.reload()
                    })
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: data.message,
                        timer: 3000,
                        background: "#333",
                        color: "#ffffff",
                        timerProgressBar: true,
                        showConfirmButton: false
                    });
                }
            })
            .catch(error => {
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: 'An error occurred. Please try again later.',
                    timer: 3000,
                    background: "#333",
                    color: "#ffffff",
                    timerProgressBar: true,
                    showConfirmButton: false
                });
            });
        }
    });
}

////// Script for the data table \\\\\\
$(document).ready(function(){
    $("table").DataTable({
        ordering : false
    })
})

////// Function to go to shop \\\\\\
function goToShop(){
    window.location.href ='/shop'
}
document.getElementById('goToPayment').addEventListener("click", function () {

    let paymentMethod = document.getElementById("paymentMethod").value;
    let userAddressId = document.getElementById("userAddressId").value;
    let subTotal = document.getElementById('subTotal').innerText;
    let orderId = document.getElementById("orderId").value

    if (subTotal == 0) {
        Swal.fire({
            icon: 'info',
            title: "Empty cart",
            text: "Your cart is empty!",
            timer: 2000,
            background: "#333",
            color: "#ffffff",
            timerProgressBar: true,
            showConfirmButton: false
        });
        return false;
    }

    const data = {
        paymentMethod: paymentMethod,
        totalAmount: subTotal,
        orderId: orderId
    };

    Swal.fire({
        title: "Loading payment.",
        text: "Please wait",
        background: "#333",
        color: "#ffffff",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    fetch('/rePaymentOrderConfirmation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
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
            var options = {
                key: "" + data.key_id + "",
                amount: "" + data.amount + "",
                currency: "INR",
                name: "LapShop",
                description: "Your laptop",
                image: `/static/images/Bg/desktop/Lapshoplogo.png`,
                order_id: "" + data.order_id + "",
                handler: function (response) {
                    let redirectUrl = `/rePaymentPlaceOrder?amount=${data.amount}&orderId=${data.orderId}&paymentStatus=true`;
                    window.location.href = redirectUrl;
                },
                prefill: {
                    name: "" + data.name + "",
                    email: "" + data.email + "",
                    contact : "" + data.phone + ""
                },
                notes: {
                    address: "Razorpay Corporate Office",
                },
                theme: {
                    color: "#50c878",
                },
            };
            var rzp1 = new Razorpay(options);
            rzp1.on("payment.failed", function (response) {    
                let redirectUrl = `/rePaymentPlaceOrder?amount=${data.amount}&orderId=${data.orderId}&paymentStatus=false`;
                window.location.href = redirectUrl;
            });
            rzp1.open();
        } else {
            Swal.fire({
                icon: 'error',
                title: "Internal server error",
                text: data.message,
                background: "#333",
                color: "#ffffff",
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    })
})
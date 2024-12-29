let cancelCouponInput = document.getElementById("cancelCouponId") || ""
        
        ////// To appy coupon \\\\\\
        function submitCoupon(){
            const userCouponCode = document.getElementById("userCouponCode").value

            Swal.fire({
                title: "Applying coupon.",
                text: "Please wait",
                background: "#333",
                color: "#ffffff",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            fetch('/applyCoupon',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({userCouponCode})
            })
            .then(response => {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json(); 
                } else {
                    window.location.href = `/login`;
                }
            }).then(data => {
                Swal.close();
                if(data.success){
                    Swal.fire({
                        title: "Success",
                        text: data.message,
                        background: "#333",
                        color: "#ffffff",
                        icon: "success",
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    })
                    .then(()=>{
                        location.reload()
                    })
                }else if(!data.success){
                    Swal.fire({
                        title: "Info",
                        text: data.message,
                        background: "#333",
                        color: "#ffffff",
                        icon: "info",
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    })
                }
            })
        }

        ////// To cancel coupon \\\\\\
        function cancelCoupon(){

            Swal.fire({
                title: "Cancelling coupon.",
                text: "Please wait",
                background: "#333",
                color: "#ffffff",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            fetch('/cancelCoupon',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .then(response => {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json(); 
                } else {
                    window.location.href = `/login`;
                }
            }).then(data => {
                Swal.close();
                if(data.success){
                    Swal.fire({
                        title: "Success",
                        text: data.message,
                        background: "#333",
                        color: "#ffffff",
                        icon: "success",
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    })
                    .then(()=>{
                        location.reload()
                    })
                }else if(!data.success){
                    Swal.fire({
                        title: "Info",
                        text: data.message,
                        background: "#333",
                        color: "#ffffff",
                        icon: "info",
                        timer: 2000,
                        timerProgressBar: true,
                        showConfirmButton: false
                    })
                }
            })
        }
    
    
        
    function confirmOrder() {
        const selectedPaymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
        if(!selectedPaymentMethod){
            Swal.fire({
                icon: 'info',
                title: "NO PAYMENT METHOD",
                text: "Please select your payment method.",
                background: "#333",
                color: "#ffffff",
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return false;
        }

        let paymentMethod = selectedPaymentMethod.id;
        const userAddressId = document.getElementById("userAddress").value;
        const subTotal = document.getElementById('subTotal').innerText;
        const coupon = cancelCouponInput.value ? cancelCouponInput.value : ""

        if (subTotal == 0) {
            Swal.fire({
                icon: 'info',
                title: "Empty cart",
                text: "Your cart is empty!",
                background: "#333",
                color: "#ffffff",
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return false;
        }

        if (paymentMethod === "razorpay" && subTotal >= 40000) {
            Swal.fire({
                icon: 'info',
                title: "Online paymnent!",
                text: "Online payments are currently limitted to 39999. We appologize for any inconvenience and appreciate your understanding.",
                background: "#333",
                color: "#ffffff",
                showConfirmButton: true,
                confirmButtonText: "Ok"
            });
            return false;
        }

        if (paymentMethod === "cod" && subTotal > 1000) {
            Swal.fire({
                icon: 'info',
                title: "NOT APPLICABLE",
                text: "Orders above 1000 rs are not applicable for cash on delivery.",
                background: "#333",
                color: "#ffffff",
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return false;
        }

        const data = {
            paymentMethod: paymentMethod,
            totalAmount: subTotal
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

        fetch('/orderConfirmation', {
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
                if (paymentMethod === "razorpay") {
                    var options = {
                        key: "" + data.key_id + "",
                        amount: "" + data.amount + "",
                        currency: "INR",
                        name: "LapShop",
                        description: "Your laptop",
                        image: `/static/images/Bg/desktop/Lapshoplogo.png`,
                        order_id: "" + data.order_id + "", 
                        handler: function (response) {
                            let redirectUrl = `/placeOrder?amount=${subTotal}&paymentMethod=${paymentMethod}&addressId=${userAddressId}&paymentStatus=true&coupon=${coupon}`;
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
                        let redirectUrl = `/placeOrder?amount=${subTotal}&paymentMethod=${paymentMethod}&addressId=${userAddressId}&paymentStatus=false&coupon=${coupon}`;
                        window.location.href = redirectUrl;        
                    });
                    rzp1.open();
                } else if (paymentMethod === "cod") {
                    let redirectUrl = `/placeOrder?amount=${subTotal}&paymentMethod=${paymentMethod}&addressId=${userAddressId}&paymentStatus=false&coupon=${coupon}`;
                    window.location.href = redirectUrl;
                } else if (paymentMethod === "wallet"){
                    const walletBalance = data.walletBalance
                    if(data.paymentAmount <= walletBalance){
                        Swal.fire({
                            html: `
                                <div class="text-center">
                                    <img src="/static/images/Bg/desktop/wallet.gif" alt="Payment" class="w-25 img-thumbnail">
                                    <h5 class="mt-3">Paying using your wallet</h5>
                                    <h5 class="mt-3">Your wallet balance : ${data.walletBalance}</h5>
                                </div>
                            `,
                            showCancelButton: true,
                            confirmButtonText: 'Place order',
                            background: "#333",
                            color: "#ffffff",
                            confirmButton: true
                        }).then((result) => {
                            if (result.isConfirmed) {
                                let redirectUrl = `/placeOrder?amount=${subTotal}&paymentMethod=${paymentMethod}&addressId=${userAddressId}&paymentStatus=true&coupon=${coupon}&walletUsed=true`;
                                window.location.href = redirectUrl;
                            }
                        });
                    }else{
                        if(data.walletBalance === 0){
                            swal.fire({
                                icon: "info",
                                title : "Wallet balance is 0.",
                                background: "#333",
                                color: "#ffffff",
                                timerProgressBar : 3000
                            })
                            return false;
                        }
                        swal.fire({
                            title: "Not enough wallet balance.",
                            text: "Are you sure want to place this order with wallet with Online payment ?",
                            background: "#333",
                            color: "#ffffff",
                            showCancelButton: true,
                            confirmButtonText: "Yes",
                            confirmButton: true,
                        }).then((result) => {
                            if (result.isConfirmed) {
                                Swal.fire({
                                    html: `
                                        <div class="text-center">
                                            <img src="/static/images/Bg/desktop/wallet.gif" alt="Payment" class="w-25 img-thumbnail">
                                            <h5 class="mt-3">Paying using your wallet</h5>
                                            <h6 class="mt-3">Your wallet balance : ${walletBalance}</h6>
                                        </div>
                                    `,
                                    showCancelButton: true,
                                    confirmButtonText: 'pay with wallet',
                                    background: "#333",
                                    color: "#ffffff",
                                    confirmButton: true
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        paymentMethod = "wallet with razorpay"

                                        const wwrdata = {
                                            paymentAmount : subTotal,
                                            walletBalance : walletBalance
                                        }

                                        fetch('/orderConfirmWithWalletAndRazorpay', {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            body: JSON.stringify(wwrdata)
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
                                            if(data.success){
                                                var options = {
                                                    key: "" + data.key_id + "",
                                                    amount: "" + data.amount + "",
                                                    currency: "INR",
                                                    name: "LapShop",
                                                    description: "Your laptop",
                                                    image: `/static/images/Bg/desktop/Lapshoplogo.png`,
                                                    order_id: "" + data.order_id + "", 
                                                    handler: function (response) {
                                                        let redirectUrl = `/placeOrder?amount=${data.amount}&paymentMethod=${paymentMethod}&addressId=${userAddressId}&paymentStatus=true&coupon=${coupon}&walletBalance=${walletBalance}&walletUsed=true`;
                                                        window.location.href = redirectUrl;
                                                    },
                                                    prefill: {
                                                        name: "" + data.name + "", 
                                                        email: "" + data.email + "",
                                                        contact: "" + data.phone + "" 
                                                        },
                                                        notes: {
                                                            address: "Razorpay Corporate Office",
                                                        },
                                                        theme: {
                                                            color: "#50c878",
                                                        },
                                                };
                                                var rzp1 = new Razorpay(options);
                                                rzp1.open();
                                            } else {
                                                swal.fire({
                                                    icon: "error",
                                                    title: "Payment gateway error.",
                                                    text: "Please try again.",
                                                    background: "#333",
                                                    color: "#ffffff",
                                                    timerProgressBar: 3000
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                }
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
    }
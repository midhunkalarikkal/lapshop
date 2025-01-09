// To add a new address
document.getElementById('add-address').addEventListener('click', function () {
    window.location.href = `/addAddressFromCheckout`;
});

// To go to edit address page
document.querySelectorAll('.edit-address-btn').forEach(button => {
    button.addEventListener('click', function () {
    const addressId = this.dataset.adid;
    window.location.href = `/editAddressFromCheckout/${addressId}`; 
    });
});

// To go to payment
function goToPayment(){
    const selectedAddress = document.querySelector('input[name="selectedAddress"]:checked')
    if (!selectedAddress) {
        
        Swal.fire({
            icon: 'info',
            title: 'Address not selected',
            text: 'Please select an address',
            timer: 2000,
            background: "#333",
            color: "#ffffff",
            timerProgressBar: true,
            showConfirmButton: false
        });
        return;
    }
    const selectedAddressId = selectedAddress.value;
    const url = `/payment/${selectedAddressId}`;
    window.location.href = url;
}
    
    
// Go to shop
function goToShop() {
    window.location.href = '/shop'
}

// Go To Cart
function goToCart() {
    window.location.href = '/cart'
}

// To delete an address
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
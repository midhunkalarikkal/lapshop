////// Repayment \\\\\\
function repayment(button){
    const orderId = button.getAttribute("data-orderId")
    window.location.href = `/rePayment/${orderId}`
}

////// Function to download the order invoice \\\\\\
async function downloadInvoice(orderId) {
    try {
        const response = await fetch(`/downloadInvoice/${orderId}`);
        if (response.status === 202) {
            Swal.fire({
                title: 'Generating Invoice',
                text: 'Your invoice is being generated, please wait...',
                icon: 'info',
                background: "#333",
                color: "#ffffff",
                timer: 3000,
                showConfirmButton: false,
            });

            setTimeout(() => {
                downloadInvoice(orderId); 
            }, 5000); 
        } else if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${orderId}.pdf`; 
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } else {
            throw new Error('Failed to download the invoice');
        }
    } catch (error) {
        Swal.close();
        Swal.fire({
            title: 'Error',
            text: 'There was a problem downloading the invoice. Please try again later.',
            icon: 'error',
            background: "#333",
            color: "#ffffff",
            confirmButtonText: 'OK'
        });
    }
}
////// To go to shop page \\\\\\
document.querySelectorAll('#shop-btn').forEach(function (button) {
    button.addEventListener("click", function () {
        window.location.href = "/shop";
    });
});

////// Get all coupon buttons and coupon codes \\\\\\
var cpnBtns = document.querySelectorAll(".couponcode");
cpnBtns.forEach(function(btn) {
    btn.addEventListener("click", function() {
        var codeInput = btn.previousElementSibling;
        var code = codeInput.value;
          
        navigator.clipboard.writeText(code)
            .then(function() {
                btn.textContent = "COPIED";
                  
                setTimeout(function() {
                    btn.textContent = "COPY";
                }, 3000);
            })
            .catch(function(error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Code copying failed.",
                background: "#333",
                color: "#ffffff",
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        });
    });
});
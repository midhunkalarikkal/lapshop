const Wallet = require('../models/walletModel')

let userDetails;
// To get the wallet page
const getUserWallet = async(req,res)=>{
    try{
        console.log("get user wallet api start")
        userDetails = req.session.userNC
        const userId = req.session.user._id
        const wallet = await Wallet.find({user : userId})
        console.log("wallet :",wallet)
        console.log("userDetails :",userDetails)
        let totalAmount = 0;
        let totalCreditedAmount = 0;
        let creditCount = 0
        let totalDebitedAmount = 0;
        let debitCount = 0

        wallet.forEach(transaction => {
            totalAmount += transaction.amount; 
    
            if (transaction.type === 'credit') {
                totalCreditedAmount += transaction.amount; 
                creditCount++;
            } else {
                totalDebitedAmount += transaction.amount; 
                debitCount++;
            }
        });

        console.log("Total Amount:", totalAmount);
        console.log("Total Credited Amount:", totalCreditedAmount);
        console.log("Total Debited Amount:", totalDebitedAmount);
        return res.render('user/wallet',{userDetails, wallet, totalAmount, totalCreditedAmount, totalDebitedAmount, creditCount, debitCount})
    }catch(error){
        console.log(error.message)
        return res.status(500).json({ message : "Internal server error" })
    }
}

module.exports = {
    getUserWallet
}
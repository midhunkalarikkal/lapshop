const Wallet = require('../models/walletModel')

// To get the wallet page
const getUserWallet = async(req,res)=>{
    try{
        let userDetails = req.session.userNC
        const userId = req.session.user._id
        const wallet = await Wallet.find({user : userId}).sort({updatedAt : -1})
        let totalCreditedAmount = 0;
        let creditCount = 0
        let totalDebitedAmount = 0;
        let debitCount = 0
        
        wallet.forEach(transaction => {
            
            if (transaction.type === 'credit') {
                totalCreditedAmount += transaction.amount; 
                creditCount++;
            } else {
                totalDebitedAmount += transaction.amount; 
                debitCount++;
            }
        });
        let totalAmount = totalCreditedAmount - totalDebitedAmount;

        return res.render('user/wallet',{userDetails, wallet, totalAmount, totalCreditedAmount, totalDebitedAmount, creditCount, debitCount})
    }catch(error){
        console.log(error.message)
        return res.redirect('/errorPage')
    }
}

module.exports = {
    getUserWallet
}
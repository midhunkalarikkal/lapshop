const express = require('express');
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

const addReview = async (req,res) => {
    try{
        console.log("adding new review");
        const { rating, reviewText } = req.body;
        const { productId } = req.params;
        const userId = req.session.user._id;

        // Validate product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Save the review
        const newReview = new Review({
            productId,
            userId,
            rating,
            reviewText
        });

        const review = await newReview.save();
        console.log("review : ",review)
        res.status(201).json({ success: true, message: 'Review added successfully' });
    }catch(error){
        console.log("error : ",error);
        return redirect('/errorPage');
    }
}

const likeOrDislikeReview = async (req,res) => {
    try{
        const { reviewId } = req.params;
        const { action } = req.body;

        const review = await Review.findById(reviewId);
        if (!review) {
        return res.status(404).json({ success : false, message: 'Review not found' });
        }

        if (action === 'like') {
            review.likes += 1;
        } else if (action === 'dislike') {
            review.dislikes += 1;
        } else {
            return res.status(400).json({ success : false, message: 'Invalid action. Use "like" or "dislike".' });
        }

        await review.save();
        res.status(200).json({ success : true, message: 'Review updated successfully' });
    }catch(error){
        return redirect('/errorPage')
    }
}

module.exports = {
    addReview,
    likeOrDislikeReview
}

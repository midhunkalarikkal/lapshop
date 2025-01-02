const express = require("express");
const Review = require("../models/reviewModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");

const addReview = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const { productId } = req.params;
    const userId = req.session.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const newReview = new Review({
      productId,
      userId,
      rating,
      reviewText,
      likes: 0,
      dislikes: 0,
      likedBy: [],
      dislikedBy: [],
    });

    await newReview.save();
    res.status(201).json({ success: true, message: "Review added successfully" });
  } catch (error) {
    return redirect("/errorPage");
  }
};

const likeOrDislikeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { action } = req.body;
    const userId = req.session.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    const hasLiked = review.likedBy.includes(userId);
    const hasDisliked = review.dislikedBy.includes(userId);

    if (action === "like") {
      if (hasLiked) {
        return res
          .status(400)
          .json({
            success: false,
            message: "You have already liked this review.",
          });
      }

      if (hasDisliked) {
        review.dislikes -= 1;
        review.dislikedBy = review.dislikedBy.filter(
          (id) => id.toString() !== userId.toString()
        );
      }

      review.likes += 1;
      review.likedBy.push(userId);
    } else if (action === "dislike") {
      if (hasDisliked) {
        return res
          .status(400)
          .json({
            success: false,
            message: "You have already disliked this review.",
          });
      }

      if (hasLiked) {
        review.likes -= 1;
        review.likedBy = review.likedBy.filter(
          (id) => id.toString() !== userId.toString()
        );
      }

      review.dislikes += 1;
      review.dislikedBy.push(userId);
    } else {
      return res
        .status(400)
        .json({
          success: false,
          message: 'Invalid action. Use "like" or "dislike".',
        });
    }

    await review.save();

    return res
      .status(200)
      .json({ success: true, message: `Review ${action} successfully` });
  } catch (error) {
    return redirect("/errorPage");
  }
};

module.exports = {
  addReview,
  likeOrDislikeReview,
};

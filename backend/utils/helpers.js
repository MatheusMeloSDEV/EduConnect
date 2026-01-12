const { USERS, UPVOTES, REVIEW_LIKES } = require('../models/db');

const populateUser = (userId) => {
    const user = USERS.find(u => u._id === userId);
    if (!user) return { _id: userId, fullName: "Unknown", avatar: "" };
    const { password, ...publicData } = user;
    return publicData;
};

const populateArticle = (article, currentUserId = null) => {
    const writer = populateUser(article.writer);
    const userUpvoted = currentUserId ? !!UPVOTES.find(u => u.user === currentUserId && u.article === article._id) : false;
    return { ...article, writer, userUpvoted };
};

const populateReview = (review, currentUserId = null) => {
    const reviewer = populateUser(review.reviewer);
    const userLiked = currentUserId ? !!REVIEW_LIKES.find(l => l.user === currentUserId && l.review === review._id) : false;
    return { ...review, reviewer, userLiked };
};

module.exports = {
    populateUser,
    populateArticle,
    populateReview
};
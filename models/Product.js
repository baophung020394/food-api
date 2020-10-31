const mongoose = require('mongoose');

const ProductSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    deal_price: {
        type: String,
        required: true
    },
    short_des: {
        type: String
    },
    des: {
        type: String
    },
    image: {
        type: String
    },
    images: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = Product = mongoose.model('product', ProductSchema);
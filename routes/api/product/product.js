const express = require('express');
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const auth = require('../../../middlewares/auth');

const Product = require('../../../models/Product');
const User = require('../../../models/User');


// @route   Post api/users
// @desc    Create User
// @access  Public

router.post('/', [
    auth,
    [
        check('name', 'Name is required')
            .not()
            .isEmpty(),
        check('price', 'Price is required')
            .not()
            .isEmpty(),
        check('deal_price', 'Deal price is required')
            .not()
            .isEmpty(),
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }



    try {
        const user = await User.findById(req.user.id).select('-passowrd');

        const newProduct = new Product({
            name: req.body.name,
            price: req.body.price,
            deal_price: req.body.deal_price,
            images: req.body.images,
            user: req.user.id
        });

        const product = await newProduct.save();

        res.json(product);

    } catch (error) {
        if (error) {
            console.error(error.message);
            return res.status(500).json({
                msg: "Can not create product"
            })
        }
    }
})

// @route   Update api/users
// @desc    Create User
// @access  Public
router.put('/update/:product_id', [
    auth,
    [
        check('name', 'Name is required')
            .not()
            .isEmpty(),
        check('price', 'Price is required')
            .not()
            .isEmpty(),
        check('deal_price', 'Deal price is required')
            .not()
            .isEmpty(),
    ]
], async(req,res) => {
    const id = req.params.id;
    const updates = req.body;
    const productupdate = await Product.findByIdAndUpdate(id, updates );
    
    res.json({
        msg: "Product removed"
    })
})

router.delete('/delete/:product_id', async (req, res) => {
    console.log(req.params.product_id)
    try {
        await Product.findByIdAndRemove({_id: req.params.product_id});
        
        res.json({
            msg: "Deleted product"
        });
    } catch (err) {
        if(err) {
            console.error(err.message);
            return res.status(500).json({
                msg: "Loi cmnr"
            })
        }
    }
})
module.exports = router;
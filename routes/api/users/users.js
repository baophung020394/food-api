const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require("express-validator/check");
const auth = require('../../../middlewares/auth');

const User = require('../../../models/User');

// @route   Post api/users
// @desc    Create User
// @access  Public

router.post('/',
    [
        check('name', 'Name is required')
            .not()
            .isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more characters'
        ).isLength({ min: 6 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const { name, email, password, fullname, address, role, wallet } = req.body;
        try {
            let user = await User.findOne({ email });

            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] })
            }

            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            });

            user = new User({
                name,
                email,
                fullname,
                address,
                avatar,
                password,
                role,
                wallet
            });

            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token })
                }
            );

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error')
        }
    }
);


// @route   GET api/users
// @desc    Get all users
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find();
    
        return res.json(users);
        
    } catch (err) {
        if(err) {
            console.error(err.message);
            return res.status(400).json({
                msg: "Không có users nào!"
            })
        }
    }

});
module.exports = router;

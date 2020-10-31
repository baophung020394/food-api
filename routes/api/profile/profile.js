const express = require('express');
const router = express.Router();
const auth = require('../../../middlewares/auth');
const { check, validationResult } = require('express-validator/check')
const Profile = require('../../../models/Profile');
const User = require('../../../models/User');

// @route   GET api/profile
// @desc    Get profile me
// @access  Public

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(401).json({
                msg: 'There is no profile for this user'
            })
        }
    } catch (err) {
        console.log.error(err.message);
        res.status(500).send('Server Error')
    }
})

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Public

router.post('/',
    [
        auth,
        [
            check('status', 'Status is required')
                .not()
                .isEmpty(),
            check('skills', 'Skills is required')
                .not()
                .isEmpty()

        ]
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            status,
            skills,
            exp,
            youtube,
            facebook,
            linkedin,
            instagram
        } = req.body;

        // build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (status) profileFields.status = status;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        // Build social object

        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({ user: req.user.id });
            if (profile) {
                // Update
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id },
                    { $set: profileFields },
                    { new: true }
                );

                return res.json(profile);
            }

            // Create
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);

        } catch (err) {
            console.error(err.message);
            res.status(500).send(`Server Error ${err.message}`);
        }

    }
);

// @route   GET api/profile
// @desc    Get user profile
// @access  Public
router.get('/',
    async (req, res) => {
        try {
            const profiles = await Profile.find().populate('user', ['name', 'avatar']);
            res.json(profiles);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error ")
        }
    }
);

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get('/user/:user_id',
    async (req, res) => {
        try {
            const profile = await Profile.findOne({
                user: req.params.user_id
            }).populate('user', ['name', 'avatar']);

            if (!profile) {
                return res.status(400).status.json({
                    msg: 'Profile not found'
                });
            }
            res.json(profile);
        } catch (err) {
            console.error(err.message);
            if (err.kind == 'ObjectId') {
                return res.status(400).json({
                    msg: 'Profile not found'
                })
            }
            res.status(500).send("Server Error ")
        }
    }
);

// @route   DELETE api/profile
// @desc    Delete profile, user & posts
// @access  Private
router.delete('/',
    auth,
    async (req, res) => {
        try {
            // Remove profile
            await Profile.findOneAndRemove({ user: req.user.id });

            // Remove user
            await User.findOneAndRemove({ _id: req.user.id });
            res.json({
                msg: 'User deleted'
            })
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error ")
        }
    }
);

// @route   PUT api/profile
// @desc    Create or update user profile
// @access  Public 
router.put('/exp',
    [
        auth,
        check('title', 'Title is required')
            .not()
            .isEmpty(),
        check('company', 'Company is required')
            .not()
            .isEmpty(),
        check('from', 'From is required')
            .not()
            .isEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // console.log(errors.isEmpty());
            // console.log(!errors.isEmpty());
            return res.status(400).json({
                errors: errors.array()
            })
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({
                user: req.user.id
            });

            profile.exp.unshift(newExp);

            await profile.save();

            res.json(profile);
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error ")
        }
    }
);

// @route   DELETE api/profile/exp/:exp_id
// @desc    Delete exp from profile
// @access  Private
router.delete('/exp/:exp_id',
    auth,
    async (req, res) => {
        try {
            const profile = await Profile.findOne({
                user: req.user.id
            });

            // Get remove Index
            const removeIndex = profile.exp
                .map(item => item.id)
                .indexOf(req.params.exp_id);

            profile.exp.splice(removeIndex, 1);

            await profile.save();

            res.json(profile);
            
        } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error ")
        }
    }
);

module.exports = router;

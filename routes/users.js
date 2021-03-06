 const express = require('express')
 const secured = require('../middleware/secured')
 const router  = express.Router()

 // get a user profile
 router.get('/', secured(), (req, res, next) => {
 	const { _raw, _json, ...userProfile } = req.user
 	res.render('user/profile.njk', {
 		userProfile: JSON.stringify(userProfile, null, 2),
 		title: 'Profile'
 	})
 })

 module.exports = router
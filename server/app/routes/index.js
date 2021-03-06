'use strict';
var router = require('express').Router();
var db = require('../../db');
var User = db.model('user');

module.exports = router;

//ADD A USER RIGHT AWAY
router.use('/', function(req,res, next){
  if(!req.session.userId && !req.user){
        User.create()
       .then(function(user){
        //   req.logIn(user, function(err){
        //     if(err) return (err)
        //     //res.status(200).send({
        //       //user: user.sanitize()
        //     //})          
        // })
        req.session.userId = user.dataValues.id
          next();  
       });
       
  }else{
    next();
  }
  
});

router.use('/members', require('./members'));
router.use('/collections', require('./collections'));
router.use('/orders', require('./orders'));
router.use('/products', require('./products'));
router.use('/users', require('./users'));
router.use('/reviews', require('./reviews'));

// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});

var express = require("express"),
    router = express.Router(),
    passport = require("passport"),
    User = require("../models/user"),
    middleware = require("../middleware");


router.get("/", function(req,res){
   res.render("landing", {page: "landing"}); 
});


router.get("/register", function(req, res){
   res.render("register", {page: "register"});
});

router.post("/register", function(req, res){
   User.register(new User({username: req.body.username, email: req.body.email}), req.body.password, function(err, user){
      if (err){
         console.log(err);
         return res.render("register", {error: err.message, page: "register"});
      }
      passport.authenticate("local")(req, res, function(){
         req.flash("success", "Welcome to YelpCamp " + req.user.username + " !");
         res.redirect("/campgrounds");
      });
   });
});


router.get("/login", function(req, res){
   res.render("login", {page: "login"});
});

router.post("/login", passport.authenticate("local",
   {
      successRedirect: "/campgrounds",
      faliureRedirect: "/login"
   }), function(req, res){});

router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Successfully logged out");
   res.redirect("/campgrounds");
});

router.get("/users/:id", middleware.isLoggedIn, middleware.checkCurrentUser, function(req, res){
   User.findById(req.params.id, function(err, user){
      if(err || !user){
         console.log(err);
         req.flash("error", "User not found");
         res.redirect("/campgrounds");
      } else{
         res.render("users/show", {user:user});
      }
   });
});

module.exports = router;
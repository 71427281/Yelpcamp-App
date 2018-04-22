var express = require("express"),
    router = express.Router(),
    Campground = require("../models/campground"),
    middleware = require("../middleware"),
    NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);

router.get("/", function(req,res){
   var noMatch;
   if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all campgrounds from DB
      Campground.find({name: regex}, function(err, allCampgrounds){
      if(err){
         console.log(err);
         req.flash("error", "Something went wrong");
         return res.redirect("/campgrounds");
      } else {
         if(allCampgrounds.length < 1) {
            noMatch = "No campground match that query, please try again";
         }
         res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
         }
      });
   } else{
      Campground.find({}, function(err, allCampgrounds){
         if (err) console.log(err);
         else {
            res.render("campgrounds/index", {page:"campgrounds", campgrounds: allCampgrounds, noMatch: noMatch});
         }
      });
    }
});

router.post("/", middleware.isLoggedIn, function(req, res){
   geocoder.geocode(req.body.location, function (err, data) {
      if (err || !data.length) {
         req.flash('error', 'Invalid address');
         return res.redirect('back');
      }
      req.body.campground.lat = data[0].latitude;
      req.body.campground.lng = data[0].longitude;
      req.body.campground.location = data[0].formattedAddress;
      
      Campground.create(req.body.campground, function(err, campground){
         if (err) console.log(err);
         else{
            campground.author.id = req.user._id;
            campground.author.username = req.user.username;
            campground.save();
            console.log("AN USER CREATED A NEW CAMPGROUND");
            console.log(campground);
            req.flash("success", "Created a new campground!");
            res.redirect("/campgrounds");
         }
      });
   });
});

router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new");
});

router.get("/:id", function(req,res){
   Campground.findById(req.params.id).populate("comments").exec(function(err, campground){
      if (err || !campground) {
         console.log(err);
         req.flash("error", "Campground not found");
         res.redirect("/campgrounds");
      }
      else res.render("campgrounds/show", {campground: campground});
   });
});

router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
   // Middleware has found the campground and checked the ownership
   res.render("campgrounds/edit", {campground: req.campground});
});

router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
   geocoder.geocode(req.body.location, function (err, data) {
      if (err || !data.length) {
         req.flash('error', 'Invalid address');
         return res.redirect('back');
      }
      req.body.campground.lat = data[0].latitude;
      req.body.campground.lng = data[0].longitude;
      req.body.campground.location = data[0].formattedAddress;
      Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
         if(err){
            req.flash("error", err.message);
            res.redirect("back");
         } else {
            req.flash("success","Campground Updated!");
            res.redirect("/campgrounds/" + campground._id);
         }
      });
   });
});

router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
      if (err) console.log(err);
      else {
         req.flash("success", "Successfully deleted");
         res.redirect("/campgrounds");
      }
   });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;
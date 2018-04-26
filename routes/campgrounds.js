var express = require("express"),
    router = express.Router(),
    Campground = require("../models/campground"),
    middleware = require("../middleware"),
    NodeGeocoder = require('node-geocoder');

var request = require("request"); //?
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'yirunzhou', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


//GEOCODER
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

router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res){
   geocoder.geocode(req.body.location, function (err, data) {
      if (err || ! data.length) {
         console.log(err);
         console.log(data);
         req.flash('error', 'Invalid address');
         return res.redirect('back');
      }
      req.body.campground.lat = data[0].latitude;
      req.body.campground.lng = data[0].longitude;
      req.body.campground.location = data[0].formattedAddress;
      
      
     cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
        if(err){
           console.log(err);
           req.flash("error", err.message);
           return res.redirect("back");
        }
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        req.body.campground.imageId = result.public_id;
        // add author to campground
        req.body.campground.author = {
          id: req.user._id,
          username: req.user.username
        }
        Campground.create(req.body.campground, function(err, campground){
         if (err) 
         {  
            console.log(err);
            req.flash('error', err.message);
            return res.redirect('back');
         }
         campground.author.id = req.user._id;
         campground.author.username = req.user.username;
         campground.save();
         console.log("AN USER CREATED A NEW CAMPGROUND");
         console.log(campground);
         req.flash("success", "Created a new campground!");
         res.redirect("/campgrounds");
         });
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

router.put("/:id", middleware.checkCampgroundOwnership, upload.single("image"), function(req, res){
   /*geocoder.geocode(req.body.location, function (err, data) {
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
   });*/
   
   Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            
            campground.name = req.body.campground.name;
            campground.price = req.body.campground.price;
            campground.description = req.body.campground.description;
            
            if (req.file) {
              try {
                  await cloudinary.v2.uploader.destroy(campground.imageId);
                  var result = await cloudinary.v2.uploader.upload(req.file.path);
                  campground.imageId = result.public_id;
                  campground.image = result.secure_url;
              } catch(err) {
                  req.flash("error", err.message);
                  return res.redirect("back");
              }
            }
            
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
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
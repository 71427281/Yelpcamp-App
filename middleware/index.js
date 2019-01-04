var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};


middlewareObj.checkCampgroundOwnership = function(req, res, next){
   if (req.isAuthenticated()){
      Campground.findById(req.params.id, function(err, campground){
         if(err || !campground) {
            console.log(err);
            req.flash("error", "Campground not found");
            res.redirect("/campgrounds");
         }
         else {
            if(req.user && (req.user._id.equals(campground.author.id) || req.user.isAdmin)){
               req.campground = campground;
               next();
            } else{
               req.flash("error", "No permission to do it");
               res.redirect("back");
            }
         }
      });
   } else {
      req.flash("error", "Please login first");
      res.redirect("/login");
   }
}


middlewareObj.checkCommentOwnership = function(req, res, next){
   if (req.isAuthenticated()){
      Comment.findById(req.params.comment_id, function(err, comment){
         if(err || !comment) 
         {
            console.log(err);
            req.flash("error", "Comment not found");
            res.redirect("/campgrounds");
         }
         else {
            if(req.user && (req.user._id.equals(comment.author.id) || req.user.isAdmin)){
               req.comment = comment;
               next();
            } else{
               req.flash("error", "No permission to do it");
               res.redirect("back");
            }
         }
      });
   } else {
      req.flash("error", "Please login first");
      res.redirect("/login");
   }
}


middlewareObj.isLoggedIn = function(req, res, next){
   if(req.isAuthenticated()){
      return next();
   }
   req.flash("error", "Please login first");
   res.redirect("/login");
}

middlewareObj.checkCurrentUser = function(req, res, next){
   if(req.user._id.equals(req.params.id) || req.user.isAdmin){
      return next();
   }
   req.flash("error", "You do not have the permission.");
   res.redirect("/campgrounds");
}


module.exports = middlewareObj;
var express = require("express"),
    router = express.Router({mergeParams: true}),
    Campground = require("../models/campground"),
    Comment = require("../models/comment"),
    middleware = require("../middleware");
    
router.get("/new", middleware.isLoggedIn, function(req, res){
   Campground.findById(req.params.id, function(err, campground){
      if(err || !campground) 
      {
         console.log(err);
         req.flash("error", "Campground not found");
         res.redirect("/campgrounds");
      }
      else res.render("comments/new", {campground:campground});
   });
});

router.post("/", middleware.isLoggedIn, function(req,res){
   Campground.findById(req.params.id, function(err, campground){
      if(err || !campground) {
         console.log(err);
         req.flash("error", "Campground not found");
         res.redirect("/campgrounds");
      }
      else {
         Comment.create(req.body.comment, function(err, comment){
            if (err) console.log(err);
            else{
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               comment.save();
               campground.comments.push(comment);
               campground.save();
               req.flash("success", "Created a new comment!");
               res.redirect("/campgrounds/" + campground._id);
            }
         });
      }
   });
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Campground.findById(req.params.id, function(err, campground){
      if (err || !campground) {
         console.log(err);
         req.flash("error", "Campground not found");
         res.redirect("/campgrounds");
      }
      else{
         Comment.findById(req.params.comment_id, function(err, comment){
            if (err || !comment) {
               console.log(err);
               req.flash("error", "Comment not found");
               res.redirect("/campgrounds");
            }
            else {
               res.render("comments/edit", {campground:campground, comment:comment});
            }
         });
      }
   });
});

router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment){
      if (err || !comment) {
         console.log(err);
         req.flash("error", "Comment not found");
         res.redirect("/campgrounds");
      }
      else{
         req.flash("success", "Comment updated!");
         res.redirect("/campgrounds/"+ req.params.id);
      }
   });
});

router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
      if (err) console.log(err);
      else{
         req.flash("success", "Successfully deleted");
         res.redirect("/campgrounds/"+ req.params.id);
      }
   });
});


module.exports = router;
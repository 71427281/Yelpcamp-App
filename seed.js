var mongoose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var data= [
    {
        name: "Cloud's Rest",
        image:"https://pixabay.com/get/e836b40629f7043ed1584d05fb1d4e97e07ee3d21cac104497f3c570a0edb4bc_340.jpg",
        description:"In statistics, the Pearson correlation coefficient (PCC, pronounced /ˈpɪərsən/), also referred to as Pearson's r, the Pearson product-moment correlation coefficient (PPMCC) or the bivariate correlation,[1] is a measure of the linear correlation between two variables X and Y. It has a value between +1 and −1, where 1 is total positive linear correlation, 0 is no linear correlation, and −1 is total negative linear correlation. It is widely used in the sciences. It was developed by Karl Pearson from a related idea introduced by Francis Galton in the 1880s."
        
    },
    {
        name: "Sweatwater",
        image:"https://pixabay.com/get/eb30b00d21f7033ed1584d05fb1d4e97e07ee3d21cac104497f3c570a0edb4bc_340.jpg",
        description:"In statistics, the Pearson correlation coefficient (PCC, pronounced /ˈpɪərsən/), also referred to as Pearson's r, the Pearson product-moment correlation coefficient (PPMCC) or the bivariate correlation,[1] is a measure of the linear correlation between two variables X and Y. It has a value between +1 and −1, where 1 is total positive linear correlation, 0 is no linear correlation, and −1 is total negative linear correlation. It is widely used in the sciences. It was developed by Karl Pearson from a related idea introduced by Francis Galton in the 1880s."
    },
    {
        name: "Salmon Creek",
        image:"https://farm7.staticflickr.com/6188/6106475454_cf4dab4d64.jpg",
        description:"In statistics, the Pearson correlation coefficient (PCC, pronounced /ˈpɪərsən/), also referred to as Pearson's r, the Pearson product-moment correlation coefficient (PPMCC) or the bivariate correlation,[1] is a measure of the linear correlation between two variables X and Y. It has a value between +1 and −1, where 1 is total positive linear correlation, 0 is no linear correlation, and −1 is total negative linear correlation. It is widely used in the sciences. It was developed by Karl Pearson from a related idea introduced by Francis Galton in the 1880s."
    },
    
];
function seedDB(){
    Campground.remove({}, function(err){
        if (err) console.log(err);
        else {
           /* console.log("REMOVED ALL CAMPGROUNDS");
            data.forEach(function(data){
                Campground.create(data, function(err, campground){
                    if (err) console.log(err);
                    else{
                        console.log("Created a campground");
                        Comment.create({
                            text:"This is a comment",
                            author:"Jonney"
                        }, function(err, comment){
                            if (err) console.log(err);
                            else {
                                campground.comments.push(comment);
                                campground.save(function(err, campground){
                                    if(err) console.log(err);
                                    else{
                                        console.log("saved a comment for a campground");
                                    }
                                });
                            }
                        });
                    }
                });
            });*/
        }
    });
};

module.exports = seedDB;
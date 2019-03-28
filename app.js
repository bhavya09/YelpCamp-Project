var express = require("express"),
 app = express(),
 bodyParser = require("body-parser"),
mongoose = require("mongoose"),
passport = require("passport"),
 LocalStrategy = require("passport-local"),
 User = require("./models/user")

mongoose.connect("mongodb://localhost/yelp_camp_v3");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


 
//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret : "Once Again",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var campgroundSchema = new mongoose.Schema({
    name: String,
    image: String,
    description: String
});

var Campground = mongoose.model("Campground", campgroundSchema);


//   Campground.create(
//       {
//           name: "Granite Hill", 
//           image: "https://www.adventurenation.com/blog/wp-content/uploads/2016/02/India-Camping-1024x530.jpg",
//           description: "This is a huge granite hill. No water. Beautiful granite!"
//       },function(err,campground){
//          if(err)
//          {
//              console.log(err);
//          }else{
//               console.log("NEWLY CREATED CAMPGROUND: ");
//               console.log(campground);
//          }
//       });


app.get("/", function(req, res){
    res.render("landing");
});

app.get("/campgrounds", function(req, res){
    // Get All Campgrounds from DB
    Campground.find({},function(err, allCampgrounds){
          if(err)
         {
             console.log(err);
         }
         else
         {
         res.render("index",{campgrounds: allCampgrounds});    
         }
    });
// res.render("campgrounds",{campgrounds:campgrounds});
}); 

app.post("/campgrounds", function(req, res){
      var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var newCampground = {name: name, image: image,description: desc}
   //create a new campground and save to DB
   Campground.create(newCampground, function(err, newlyCreated){
       if(err){
          console.log(err);  
       }else{
          //redirect back to campgrounds page
     res.redirect("/campgrounds");  
       }
   });
  
});

app.get("/campgrounds/new", function(req, res){
    res.render("new.ejs");
});

// SHOW - shows more info about one campground 
app.get("/campgrounds/:id", function(req, res){
    //find the campground with provided ID
  Campground.findById(req.params.id, function(err, foundCampground){
     if(err){
         console.log(err);
     }else{
       //render show template with that campground
    res.render("show",{campground: foundCampground});    
     }
  });
})

// show register form
app.get("/register", function(req,res){
   res.render("register"); 
});

//handle signUp logic
app.post("/register", function(req,res){
    var newUser = new User({username: req.body.username});
    User.register(newUser,req.body.password, function(err, user){
      if(err){
         console.log(err);
         return res.render("register");
     } 
     passport.authenticate("local")(req, res, function(){
        res.redirect("/campgrounds"); 
     });  
    });
});





app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The YelpCamp Server has Started");
});

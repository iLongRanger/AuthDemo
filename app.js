const   express                 =   require("express"),
        mongoose                =   require("mongoose"),
        passport                =   require("passport"),
        bodyParser              =   require("body-parser"),
        LocalStrategy           =   require("passport-local"),
        passportLocalMongoose   =   require("passport-local-mongoose"),
        app                     =   express();
//models        
const   User                    =   require("./models/user");


//database
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb+srv://dbiLongRanger:Converse5!@cluster0-6vapc.mongodb.net/AuthDemo?retryWrites=true&w=majority', { useNewUrlParser: true });


//template
app.set("view engine", "ejs");

//use body parse
app.use(bodyParser.urlencoded({extended: true}));

// to use express sessions
app.use(require("express-session")({
    secret : "My dirty Secret",
    resave : false,
    saveUninitialized : false
}));

// to use passport
app.use(passport.initialize());
app.use(passport.session());
// reading session and taking data from it (encoding and decoding session)
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//==============
//Route
//==============
app.get("/", (req,res)=>{
   res.render("home");
});

app.get("/secret",isLoggedIn, (req,res)=>{ //isLoggedin is a fucntion declared below which serve as a middleware
   res.render("secret");
});


//AUTH ROUTES

//show sign up form
app.get("/register", (req,res)=>{
   res.render("register") 
});
//handling user sign up 
app.post("/register", (req, res)=>{
   let username = req.body.username;
   let password = req.body.password;
   User.register(new  User({username : username}), password, (err, user)=>{//password is not save on db
        if(err){
            console.log(err);
            return res.render("register");
        }else{
            passport.authenticate("local")(req, res, ()=>{//will store username on database and hash and salt data
                res.redirect("secret");
            });
        }
   });
});

// Login Routes
//login form
app.get("/login", (req,res)=>{
   res.render("login");

});
//handles user login 
app.post("/login",passport.authenticate("local", { //middleware 
    successRedirect: "/secret",
    failureRedirect: "/login"
    }),(req, res)=>{
});

//logout
app.get("/logout", (req, res)=>{
   req.logout();
   res.redirect("/");
});

//middleware to check if user is login 

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};

//server listener 
app.listen(process.env.PORT, process.env.IP, ()=>{
   console.log("App started"); 
});
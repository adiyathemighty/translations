const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const errorHandler = require("./handlers/error");
const config = require("./config");
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const hbs = require("hbs");
const mongoose = require("mongoose");
const path = require("path");
const flash = require("connect-flash");
const authRouter = require("./routes/auth");
const indexRouter = require("./routes/index");
const LocalStrategy = require("passport-local").Strategy;
const Translator = require("./models/Translator");
const WO = require("./models/WO");
const bcrypt = require("bcrypt");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const { upload } = require("./handlers/cloudinary");
const cookieParser = require("cookie-parser");

//MONGO SETUP
//connect to MongoDB
mongoose.connect(
  "mongodb://localhost/translations",
  { useNewUrlParser: true }
);

//serves all files from translations-client/public folder through "/"
app.use(express.static(path.join(__dirname, "../translations-client/public")));

//Save sessions so that there is no need
//to constantly log in when server is restarted
app.use(
  session({
    secret: "translations",
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());

//VIEW ENGINE SETUP
app.set("views", path.join(__dirname, "../translations-client/views"));
app.set("view engine", "hbs");

//PASSPORT SETUP
// require("./handlers/auth");
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

passport.use(
  "local-login",
  new LocalStrategy((username, password, next) => {
    //TODO ADD AUTH WITH EMAIL

    User.findOne({ username }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(null, false, { message: "Incorrect username" });
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return next(null, false, { message: "Incorrect password" });
      }

      return next(null, user);
    });
  })
);

passport.use(
  "local-signup",
  new LocalStrategy(
    { passReqToCallback: true },
    (req, username, password, next) => {
      // To avoid race conditions
      const { email, role, idNumber } = req.body;
      console.log(role);
      process.nextTick(() => {
        const hashPass = bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
        //if there is a role in the req.body this request comes from the translator sign up
        if (role === "translator") {
          Translator.findOne(
            {
              username
            },
            (err, user) => {
              if (err) {
                return next(err);
              }
              if (user) {
                return next(null, false);
              } else {
                // Destructure the body
                console.log("i am in translator", req.body);
                // const { username, email, password, role } = req.body;
                // const hashPass = bcrypt.hashSync(
                //   password,
                //   bcrypt.genSaltSync(8),
                //   null
                // );

                new Translator({
                  username,
                  email,
                  password: hashPass,
                  role
                })
                  .save()
                  .then(result => {
                    console.log(result);
                  });
              }
            }
          );
        } else if (role === "wo") {
          console.log("i am in wo");
          WO.findOne(
            {
              username
            },
            (err, user) => {
              if (err) {
                return next(err);
              }
              if (user) {
                return next(null, false);
              } else {
                // Destructure the body
                console.log("req body:", req.body);

                new WO({
                  username,
                  email,
                  password: hashPass,
                  idNumber
                })
                  .save()
                  .then(result => {
                    console.log(result);
                  });
              }
            }
          );
        }
      });
    }
  )
);

app.use(passport.initialize());
app.use(passport.session());

//ALL ROUTES

app.use("/", indexRouter);
app.use("/", authRouter);

//ERRORS SETUP
app.use((req, res, next) => {
  let err = new Error("Not found");
  err.status = 404;
  next(err);
});
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`server starting on port ${config.PORT}`);
});

module.exports = app;

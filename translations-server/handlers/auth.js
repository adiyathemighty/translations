// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const User = require("../models/user");
// const bcrypt = require("bcrypt");
// const fileUpload = require("express-fileupload");
// const fs = require("fs");
// const { upload } = require("./cloudinary");
// const bodyParser = require("body-parser");

// passport.serializeUser((user, cb) => {
//   cb(null, user.id);
// });

// passport.deserializeUser((id, cb) => {
//   User.findById(id, (err, user) => {
//     if (err) {
//       return cb(err);
//     }
//     cb(null, user);
//   });
// });

// passport.use(
//   "local-login",
//   new LocalStrategy((username, password, next) => {
//     //TODO ADD AUTH WITH EMAIL

//     User.findOne({ username }, (err, user) => {
//       if (err) {
//         return next(err);
//       }
//       if (!user) {
//         return next(null, false, { message: "Incorrect username" });
//       }
//       if (!bcrypt.compareSync(password, user.password)) {
//         return next(null, false, { message: "Incorrect password" });
//       }

//       return next(null, user);
//     });
//   })
// );

// passport.use(
//   "local-signup",
//   new LocalStrategy(
//     { passReqToCallback: true },
//     (req, username, password, next) => {
//       // To avoid race conditions
//       process.nextTick(() => {
//         console.log("handlers auth file");

//         User.findOne(
//           {
//             username: username
//           },
//           (err, user) => {
//             if (err) {
//               return next(err);
//             }

//             if (user) {
//               return next(null, false);
//             } else {
//               // Destructure the body
//               const { pic } = req.files;
//               console.log(req.body, req.files);
//               const { username, email, password, role } = req.body;
//               const hashPass = bcrypt.hashSync(
//                 password,
//                 bcrypt.genSaltSync(8),
//                 null
//               );
//               pic.mv(
//                 `../translations-client/public/images/${pic.name}`,
//                 err => {
//                   if (err) return res.status(500).send(err);

//                   upload(
//                     `../translations-client/public/images/${pic.name}`
//                   ).then(result => {
//                     const newUser = new User({
//                       username,
//                       email,
//                       password: hashPass,
//                       pic: result.secure_url,
//                       role
//                     });

//                     newUser
//                       .save(err => {
//                         if (err) {
//                           next(null, false, { message: newUser.errors });
//                         }
//                         return next(null, newUser);
//                       })
//                       .then(result => {
//                         fs.unlinkSync(
//                           `../translations-client/public/images/${pic.name}`
//                         );
//                       });
//                   });
//                 }
//               );
//             }
//           }
//         );
//       });
//     }
//   )
// );
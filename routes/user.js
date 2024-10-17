const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/userController.js");

router
  .route("/signup")
  .get(userController.renderSingUp)
  .post(wrapAsync(userController.signUpPage));

router
  .route("/login")
  .get(userController.renderLogIn)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.logInPage
  );

router.get("/logout", userController.logOut);

module.exports = router;

const User = require("../models/user");

module.exports.renderSingUp = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signUpPage = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return res.redirect("/signup");
      }
      req.flash("success", "Welcome to Wanderlust!");
      return res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    return res.redirect("/signup");
  }
};

module.exports.renderLogIn = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.logInPage = async (req, res) => {
  req.flash("success", "Welcome back to Wanderlust");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  return res.redirect(redirectUrl);
};

module.exports.logOut = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "successfully logged out");
    return res.redirect("/listings");
  });
};

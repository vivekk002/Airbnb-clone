const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  let allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderCreateListingPage = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.show = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "requested listing does not exist");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.create = async (req, res, next) => {
  let responce = await geocodingClient
    .forwardGeocode({
      query: `${req.body.newListing.location} ${req.body.newListing.country}`,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.newListing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = responce.body.features[0].geometry;
  let savedListings = await newListing.save();
  console.log(savedListings);
  req.flash("success", "new listing created successfully!");
  res.redirect("/listings");
};

module.exports.edit = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you are requesting for does not exist");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.update = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.newListing });
  if (typeof req.file != "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "listing updated successfully!");
  res.redirect(`/listings/${id}`);
};

module.exports.delete = async (req, res) => {
  let { id } = req.params;
  let deleted = await Listing.findByIdAndDelete(id);
  console.log(deleted);
  req.flash("success", "Listing is delete successfully!");
  res.redirect("/listings");
};

const router = require("express").Router();
const {
  addsong,
  addartist,
  ratesong,
  gettop10songs,
  gettop10artists,
  getartists,
  getuser,
} = require("../controllers/usersController");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images");
  },
  filename(req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${uuidv4()}.${ext}`);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = file.mimetype.split("/")[1];
    if (ext !== "png" && ext !== "jpg" && ext !== "jpeg") {
      return callback(
        new Error("Not an image! Please upload an image."),
        false
      );
    } else {
      callback(null, true);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});
router.route("/api/addartist").post(addartist);
router.route("/api/ratesong").post(ratesong);
router.route("/api/gettop10songs").get(gettop10songs);
router.route("/api/gettop10artists").get(gettop10artists);
router.route("/api/getartists").get(getartists);
router.post("/api/addsong", upload.single("file"), addsong);
router.get("/api/getuser", getuser);
module.exports = router;

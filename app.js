const express = require("express");
const cors = require("cors");
const passport = require("passport");
require("dotenv/config");
const routes = require("./routes/index");
const app = express();
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(express.json());
require("./dbSetup")();
require("./passportConfig")(passport);
app.use("/images/", express.static("uploads/images"));
app.use(routes);
app.use(function (error, request, response, next) {
  try {
    console.log(error.message);
    const errorObj = {
      message: error.message ? error.message : "Oops! something went wrong",
      code: "ERROR",
    };
    let status = 500;
    if (error instanceof Error) {
      status = error.statusCode || status;
      errorObj.message = error.message;
    }
    return response.status(status).json(errorObj);
  } catch (e) {
    return response.status(500).json({
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});
app.listen(process.env.PORT || 5000, () =>
  console.log(
    process.env.PORT
      ? `running on ${process.env.PORT || 5000}`
      : "running on 5000"
  )
);

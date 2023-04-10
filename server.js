const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const cors = require("cors");

const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

//Load env vars
dotenv.config({ path: "./config/config.env" });

//connect to database
connectDB();

//Route files
const hospitals = require("./routes/hospitals");
const auth = require("./routes/auth");
const appointments = require("./routes/appointments");

const app = express();

app.use(cors());

//Body parser
app.use(express.json());

//Cookie parser
app.use(cookieParser());

//Sanitize data
app.use(mongoSanitize());

//Set security headers
app.use(helmet());

//Prevent XSS attacks
app.use(xss());

//Rate Limiting
const limiter = rateLimit({
  windowsMs: 10 * 60 * 1000, //10 mins
  max: 100,
});
app.use(limiter);

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Library API",
      version: "1.0.0",
      description: "A simple Express VacQ API",
    },
    servers: [{ url: "http://localhost:5000/api/v1" }],
  },
  apis: ["./routes/*.js"],
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use("/api/v1/hospitals", hospitals);
app.use("/api/v1/auth", auth);
app.use("/api/v1/appointments", appointments);

// app.get('/',(req,res) => {
//     res.status(200).json({success:"true", data:{id:1}});
// })

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    "Server running in ",
    process.env.NODE_ENV,
    " mode on port ",
    PORT
  )
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.massage}`);
  //Close server & exit process
  server.close(() => process.exit(1));
});

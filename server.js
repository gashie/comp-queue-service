const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const dotenv = require("dotenv");
const errorHandler = require("./middleware/error");
const { logger, morganMiddleware } = require("./logs/winston");
const routes = require("./routes/setup");
const cookieParser = require('cookie-parser');
const { logAction } = require("./logs/custom");
const gracefulShutdown = require("./utils/gracefulShutdown");

//load env vars
dotenv.config({ path: "./config/config.env" });
//initialise express
const app = express();

//body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


//Set Security Headers
app.use(helmet({ crossOriginResourcePolicy: false }));
//Set Security Headers

//Prevent XSS Attack
app.use(xss())

if (process.env.NODE_ENV === "development") {
    app.use(morganMiddleware);

}
app.use(cookieParser())
app.use(function (req, res, next) {
    res.removeHeader("x-powered-by");
    res.removeHeader("set-cookie");
    res.removeHeader("Date");
    res.removeHeader("Connection");

    next();
});
app.use(function (req, res, next) {
    /* Clickjacking prevention */
    res.header('Content-Security-Policy', "frame-ancestors directive")
    next()
})



//Mount routes
app.use("/api/v1/service/", routes);

app.use(errorHandler);

//errror middleware
app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});


app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        status: 0,
        message: error.message,
    });
    logger.error(error.message);
});
//create port
const PORT = process.env.PORT || 9000;
//listen to portnpm
const server = app.listen(PORT, () => {
    console.log(
        `COMP QUEUE-SERVICE: Running in ${process.env.NODE_ENV} mode and listening on port http://:${PORT}`
    );
    logger.debug(`COMP QUEUE-SERVICE: Running in ${process.env.NODE_ENV} mode and listening on port http://:${PORT}`);
    logAction('api_start', { message: 'API server started', PORT }).catch(console.error);

});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    logger.error(err.message);
    // Close server & exit process
    // server.close(() => process.exit(1));
});
// Listen for shutdown signals and invoke the graceful shutdown function
process.on('SIGINT', () => gracefulShutdown(server));
process.on('SIGTERM', () => gracefulShutdown(server));
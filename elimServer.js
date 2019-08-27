const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const app = express();
const port = process.env.PORT || 5000;
const multer = require('multer');
const passport = require('passport');
const flash = require('connect-flash');


require('./config/passport')(passport);
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({
 extended: true
}));

app.set('view engine', 'ejs');

app.use(session({
 secret: 'justasecret',
 resave:true,
 saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// routes.js contains the login code
require('./app/routes.js')(app, passport);
// query.js contains the database query code
require('./app/query.js')(app);


app.listen(port);
console.log("Port: " + port);


























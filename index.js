const express = require('express');
const fs = require('fs');
const https = require('https');
const path = require('path');
const morgan = require('morgan');
const redis = require('redis');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require("body-parser");
const flash = require('connect-flash');
const passport = require('passport');
const RedisStore = require('connect-redis')(session);
const port = 3443;
const client = redis.createClient();
const app = express();

//Setting up session with Redis
app.use(session({
    store: new RedisStore({
        host: 'localhost', port: 6379, client: client, ttl: 260
    }),
    secret: 'bankingLedger', //should be changed accordingly
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
//bodyparser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(morgan('dev'));
app.use(cookieParser());

client.on('connect', function () {
    console.log('redis is connected');
});

//http port
app.listen(port, function (err) {
    if (err)
        return console.log('Error Occurred');

});
require('./config/inquirer');
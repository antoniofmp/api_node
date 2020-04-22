'use strict'

// Load node server modules
var express = require('express');
var bodyParser = require('body-parser');

// Express (http)
var app = express();

// Load files route
var article_routes = require('./routes/article');

// Middlewares 
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// Route api
app.use('/api', article_routes);

module.exports = app;
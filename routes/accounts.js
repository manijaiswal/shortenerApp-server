var express   = require('express');
var mongoose  = require('mongoose');
var jwt       = require('jsonwebtoken');
const shortid = require('shortid');

var log4jsLogger = require('../loggers/log4js_module');
var helper       = require('../utility/helpers');
var constants    = require('../utility/constants');
var configs      = require('../utility/configs');
var AuthModule   = require('../utility/auth/auth_token');


require('../models/profiles');



var Account      = mongoose.model('Profile');


var router       = express.Router();
var sendError    = helper.sendError;
var sendSuccess  = helper.sendSuccess;
var logger       = log4jsLogger.getLogger('Account');








module.exports = router;
var express = require('express');
var mongoose = require('mongoose');
const shortid = require('shortid');
const validUrl = require("valid-url");

var log4jsLogger = require('../loggers/log4js_module');
var helper = require('../utility/helpers');
var constants = require('../utility/constants');
var errorCodes = require('../utility/errors');
var configs = require('../utility/configs');

require('../models/profiles');
require('../models/urls');

var Profile = mongoose.model('Profile');
var Url     = mongoose.model('Url');

var router = express.Router();
var sendError = helper.sendError;
var sendSuccess = helper.sendSuccess;
var logger = log4jsLogger.getLogger('Urls');


/*=============routes for create sort urls==============*/

router.post('/cr_shrt_url',(req,res)=>{
    req.checkBody('baseUrl', errorCodes.invalid_parameters[1]).notEmpty();
    req.checkBody('originalUrl', errorCodes.invalid_parameters[1]).notEmpty();

    if (req.validationErrors()) {
        logger.error({ "r": "cr_acc", "method": "post", "msg": errorCodes.invalid_parameters[1], "p": req.body });
        return sendError(res, req.validationErrors(), 'invalid_parameters', constants.BAD_REQUEST);
    }

    var baseUrl = req.body.baseUrl;
    var originalUrl = req.body.originalUrl;

    if(!validUrl.isUri(baseUrl)){
        logger.error({ "r": "cr_url", "method": "post", "msg": "Account already exists" });
        return sendError(res, "Base Url Invalid", "base_url_invalid", constants.BAD_REQUEST);
    }

    if(!validUrl.isUri(originalUrl)){
        logger.error({ "r": "cr_url", "method": "post", "msg": "Account already exists" });
        return sendError(res, "original_url_invalid", "original_url_invalid", constants.BAD_REQUEST);
    }

    const urlCode = shortid.generate();

    Url.findOne({code:urlCode},function(err,urlFind){
        if (err) {
            logger.error({ "r": "cr_url", "method": 'post', "msg": err });
            return sendError(res, err, "server_error", constants.SERVER_ERROR);
        }
        if(urlFind){
            return sendSuccess(res,urlFind);
        }else{
            var tempUrl = baseUrl+'/'+urlCode;
            var saveObj = {originalUrl:originalUrl,code:urlCode,shortUrl:tempUrl};
            var newUrl = new Url(saveObj);
            newUrl.save(function(err,savedUrl){
                if (err) {
                    logger.error({ "r": "cr_url", "method": 'post', "msg": err });
                    return sendError(res, err, "server_error", constants.SERVER_ERROR);
                }
                return sendSuccess(res,savedUrl);
            })
        }
    })
});



module.exports = router;


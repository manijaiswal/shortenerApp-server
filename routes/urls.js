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
require('../models/urlsDetails');

var Profile = mongoose.model('Profile');
var Url     = mongoose.model('Url');
var UrlDetails = mongoose.model('UrlDetails');

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


/*=============== routes for fetch data ==================*/

router.get('/fetch_data',(req,res)=>{
    req.checkQuery('code', errorCodes.invalid_parameters[1]).notEmpty();

    if (req.validationErrors()) {
        logger.error({ "r": "cr_acc", "method": "post", "msg": errorCodes.invalid_parameters[1], "p": req.body });
        return sendError(res, req.validationErrors(), 'invalid_parameters', constants.BAD_REQUEST);
    }

    var code = req.query.code;
    var finalData = {};
    Url.aggregate([{
        $match:{code:code}},
        {$lookup:
        {
           from: "urldetails",
           localField: "code",
           foreignField: "code",
           as: "tableData"
       }
    }]).exec(function(err,data){
        if (err) {
            logger.error({ "r": "cr_url", "method": 'post', "msg": err });
            return sendError(res, err, "server_error", constants.SERVER_ERROR);
        }
        if(data.length>0){
            finalData['table'] = data[0];
        }
        countNumberByDate(code,function(err,countNum){
            if (err) {
                logger.error({ "r": "cr_url", "method": 'post', "msg": err });
                return sendError(res, err, "server_error", constants.SERVER_ERROR);
            }
            finalData['countByDate'] = countNum;
            groupByBrowser(code,'os',function(err,datas){
                if (err) {
                    logger.error({ "r": "cr_url", "method": 'post', "msg": err });
                    return sendError(res, err, "server_error", constants.SERVER_ERROR);
                }
                finalData['oper_sys'] = datas;
                groupByBrowser(code,'country',function(err,datas){
                    if (err) {
                        logger.error({ "r": "cr_url", "method": 'post', "msg": err });
                        return sendError(res, err, "server_error", constants.SERVER_ERROR);
                    }
                    finalData['country'] = datas;
                    groupByBrowser(code,'browser',function(err,datas){
                        if (err) {
                            logger.error({ "r": "cr_url", "method": 'post', "msg": err });
                            return sendError(res, err, "server_error", constants.SERVER_ERROR);
                        }
                        finalData['browser'] = datas;
                        return sendSuccess(res,finalData);
                    })    
                })    
            })
        })
        // return sendSuccess(res,data);  
    })
})



function countNumberByDate(code,cb){
    UrlDetails.aggregate([
        {$match:{code:code}},
        {
            $group:{
                _id:{
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                    // day: { $dayOfMonth: '$createdAt' },
                    // month: { $month: '$createdAt' },
                    // year: { $year: '$createdAt' }
                },
                num:{
                    $sum:'$times'
                }
            }
        },{
            $sort:{ '_id.year': -1, '_id.month': -1, '_id.day': -1 }
        }
    ]).exec(function(err,data){
        if(err){
            return cb(err,null);
        }
        return cb(null,data);
    })
}

function groupByBrowser(code,query,cb){
    UrlDetails.aggregate([
        {$match:{code:code}},
        { 
        $group: { 
            _id: null, 
            total: { 
                $sum: "$times" 
            } 
        } 
    }]).exec(function(err,num){
        if(err){
            return cb(err,null);
        }
        var total = 1;
        if(num.length>0){
            total = num[0].total
        }
        UrlDetails.aggregate([
            {$match:{code:code}},
            {
                $group:{
                    _id:{data:'$'+query},
                    count:{$sum:'$times'} 
                },
    
            },{
                $project:{
                    count:1,
                    percetage:{"$multiply": [ { "$divide": [ "$count", total] }, 100 ] }
                }
            }
        ]).exec(function(err,data){
            if(err){
                return cb(err,null);
            }
            return cb(null,data);
        })
    })


}



module.exports = router;


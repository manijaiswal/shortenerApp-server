var express = require('express');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
// const shortid = require('shortid');

var log4jsLogger = require('../loggers/log4js_module');
var helper = require('../utility/helpers');
var constants = require('../utility/constants');
var errorCodes = require('../utility/errors');
var configs = require('../utility/configs');
var AuthModule = require('../utility/auth/auth_token');
var phoneNumberValidator = require('../utility/phoneNumber/phone_no_validator')


require('../models/profiles');



var Profile = mongoose.model('Profile');

var router = express.Router();
var sendError = helper.sendError;
var sendSuccess = helper.sendSuccess;
var logger = log4jsLogger.getLogger('Account');

/*=======================api for create a account ====================*/

router.post('/cr_acc', (req, res) => {
  req.checkBody('ccode', errorCodes.invalid_parameters[1]).notEmpty();
  req.checkBody('mobile_no', errorCodes.invalid_parameters[1]).notEmpty();
  req.checkBody('email', errorCodes.invalid_parameters[1]).optional().isValidEmail();
  req.checkBody('role', errorCodes.invalid_parameters[1]).notEmpty();
  req.checkBody('password', errorCodes.invalid_parameters[1]).notEmpty();

  if (req.validationErrors()) {
    logger.error({ "r": "cr_acc", "method": "post", "msg": errorCodes.invalid_parameters[1], "p": req.body });
    return sendError(res, req.validationErrors(), 'invalid_parameters', constants.BAD_REQUEST);
  }

  var ccode = req.body.ccode;
  var mobile_no = req.body.mobile_no;
  var email = req.body.email;
  var role = req.body.role;
  var password = req.body.password;

  var phoneValidationStatus = phoneNumberValidator(mobile_no, ccode);

  if (!phoneValidationStatus) {
    logger.error({ "r": "cr_acc", "method": "post", "msg": "phone Number invalid" });
    return sendError(res, "phone Number is not valid", "phone_no_invalid", constants.BAD_REQUEST);
  }

  if (password.length < 6) {
    logger.error({ "r": "cr_acc", "method": "post", "msg": "password length should be greater than 6" });
    return sendError(res, "password length should be greater than 6", "password_length", constants.BAD_REQUEST);
  }

  Profile.findOne({ mobile_no, email }, function (err, profile_data) {
    if (err) {
      logger.error({ "r": "cr_acc", "method": 'post', "msg": err });
      return sendError(res, err, "server_error", constants.SERVER_ERROR);
    }

    if (profile_data) {
      logger.error({ "r": "cr_acc", "method": "post", "msg": "Account already exists" });
      return sendError(res, "Account already exists", "account_already_exists", constants.BAD_REQUEST);
    }
    if (!profile_data) {
      var saveObj = { ccode, mobile_no, email, role, password, };
      var account = new Profile(saveObj);
      account.save(function (err, account_save) {
        if (err) {
          logger.error({ "r": "cr_acc", "method": 'post', "msg": err });
          return sendError(res, err, "server_error", constants.SERVER_ERROR);
        }
        return sendSuccess(res, account_save);
      })
    }
  })
});


/*=====================api for login ==================*/

router.post('/login', (req, res) => {
  req.checkBody('email', errorCodes.invalid_parameters[1]).notEmpty();
  req.checkBody('role', errorCodes.invalid_parameters[1]).notEmpty();
  req.checkBody('password', errorCodes.invalid_parameters[1]).notEmpty();

  if (req.validationErrors()) {
    logger.error({ "r": "login", "method": "post", "msg": errorCodes.invalid_parameters[1], "p": req.body });
    return sendError(res, req.validationErrors(), 'invalid_parameters', constants.BAD_REQUEST);
  }

  var email = req.body.email.trim();
  var role = req.body.role;
  var password = req.body.password.trim();
  Profile.find({ email, role }, function (err, profile_data) {
    if (err) {
      logger.error({ "r": "login", "method": 'post', "msg": err });
      return sendError(res, err, "server_error", constants.SERVER_ERROR);
    }

    if (profile_data.length == 0) {
      logger.error({ "r": "login", "method": "post", "msg": "Account doesnot exists" });
      return sendError(res, "Account doesnot exists", "account_not_exists", constants.BAD_REQUEST);
    }

    if (profile_data.length > 0) {
      var data = {};
      var profile = profile_data[0];
      var aid = profile_data[0]['_id'];

      profile.comparePassword(password, function (err, success_data) {
        if (err) {
          console.log("err", err);
          logger.error({ "r": "login", "method": 'post', "msg": err });
          return sendError(res, err, "server_error", constants.SERVER_ERROR);
        }

        if (success_data) {
          var token = AuthModule.getAT({ id: aid });
          data['token'] = token;
          data['profile_data'] = profile;

          return sendSuccess(res, data);
        }
        else {
          logger.error({ "r": "login", "method": 'post', "msg": "Password not match with this number" });
          return sendError(res, "Password not match with this number", "password_not_match", constants.BAD_REQUEST);
        }
      })

    }
  })

});




module.exports = router;
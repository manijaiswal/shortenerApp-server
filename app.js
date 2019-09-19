var express                =   require('express');
var path                   =   require('path');
var cookieParser           =   require('cookie-parser');
var logger                 =   require('morgan');
var expressValidator       =   require('express-validator');
// var expressip            =   require('express-ip');
var geoip                  = require('geoip-lite');
var ua                     =require('ua-parser')

var mongoose       = require('mongoose');
require('./models/urls');
require('./models/urlsDetails');
var accountsRouter = require('./routes/accounts');
var urlRouter      = require('./routes/urls');


var Url            = mongoose.model('Url');
var UrlDetails     = mongoose.model('UrlDetails');

require('./db/connect');

var app = express();
app.set('view',path.join(__dirname,'views'));
app.set('view engine','hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(expressValidator({
    customValidators:{
        isValidEmail:function(value){
            if(!value) return false;
            var val = value.trim();
            var email_reg_exp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return email_reg_exp.test(val);
        },
        isValidMongoId:function(value){
            if(!value) return false;
            var regex = /^[0-9a-f]{24}$/;
            return regex.test(value);
        }
    }
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
  
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,content-encoding');
  
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
  
    // Pass to next layer of middleware
    next();
});

// app.use(expressip().getIpInfoMiddleware);

app.get('/:code',(req,res)=>{
    var ip;
    if (req.headers['x-forwarded-for']) {
        ip = req.headers['x-forwarded-for'].split(",")[0];
    } else if (req.connection && req.connection.remoteAddress) {
        ip = req.connection.remoteAddress;
    } else {
    ip = req.ip;
    }
    var geo = geoip.lookup(req.ip);
    var userAgent = req.headers['user-agent'];
    var code = req.params.code;
    if(code[code.length-1]=='+'){
        console.log('ye wala he')
        return res.redirect('https://shrtnrapp.herokuapp.com/dashboard?code='+code);
    }
    Url.findOne({code:code},function(err,urlFind){
        if(err){
            console.log(err);
            return res.send("Something went wrong");
        }
        if(urlFind){
            var urlId = urlFind._id;
            Url.updateOne({_id:urlId},{$inc:{views:1}},function(err,urlUpdated){
                if(err){
                    return res.send("something went wrong");
                }
                var r       = ua.parse(userAgent);
                var browser = r.ua.family;
                var device  = r.device.family;
                var os      = r.os.family;
                var country = geo ? geo.country : 'IN';
                UrlDetails.findOne({ip:ip,code,browser,device,os,time:new Date()},function(err,urlDtl){
                    if(err){
                        return res.send("something went wrong");
                    }
                    if(urlDtl){
                        var dtl_id = urlDtl._id;
                        UrlDetails.updateOne({_id:dtl_id},{$inc:{times:1}},function(err,updated){
                            if(err){
                                return res.send("something went wrong");
                            }
                            return res.redirect(urlFind.originalUrl);
                        })
                    }else{
                        // var browser = ua.parseUA(userAgent).toString();
                        // var device  = ua.parseDevice(userAgent).toString();
                        // var os      = ua.parseOS(userAgent).toString()
                        var saveObj = {code,browser,ip,device,os,country,times:1}
                        var UrlDtl  = new UrlDetails(saveObj);
                        UrlDtl.save(function(err,saved){
                            if(err){
                                return res.send("something went wrong");
                            }
                            return res.redirect(urlFind.originalUrl);
                        })
                    }
                })
            })
        
        }else{
            return res.send("opps the url is not valid");
        }
    })
})


app.use('/accounts', accountsRouter);
app.use('/urls',urlRouter);

module.exports = app;

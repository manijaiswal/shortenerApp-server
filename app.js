var express                =   require('express');
var path                   =   require('path');
var cookieParser           =   require('cookie-parser');
var logger                 =   require('morgan');
var expressValidator       =   require('express-validator');

var mongoose       = require('mongoose');
require('./models/urls');
var accountsRouter = require('./routes/accounts');
var urlRouter      = require('./routes/urls');

var Url     = mongoose.model('Url');

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

app.get('/:code',(req,res)=>{
    console.log(req.params.code);
    var code = req.params.code;
    Url.findOne({code:code},function(err,urlFind){
        if(err){
            console.log(err);
            return;
        }
        if(urlFind){
            return res.redirect(urlFind.originalUrl);
        }else{
            return res.send("opps the url is not valid");
        }
    })
})


app.use('/accounts', accountsRouter);
app.use('/urls',urlRouter);

module.exports = app;

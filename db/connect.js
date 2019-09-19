const mongoose     =     require('mongoose');
const configs       = require('../utility/configs');

const log4jsLogger      =   require('../loggers/log4js_module');

var logger              =   log4jsLogger.getLogger('DataBase');

//mongodb://manish:Nitp123@ds135577.mlab.com:35577/shortnerapp
//'mongodb://localhost:27017/'+configs.DB_NAME
mongoose.connect('mongodb://manish:Nitp123@ds135577.mlab.com:35577/shortnerapp',{useNewUrlParser:true,useUnifiedTopology: true},(err)=>{
    if(err){
        console.error(err);
        return;
    }
    console.log("data base connected successfully");
});
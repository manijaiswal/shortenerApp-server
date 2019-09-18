const mongoose     =     require('mongoose');
const configs       = require('../utility/configs');

const log4jsLogger      =   require('../loggers/log4js_module');

var logger              =   log4jsLogger.getLogger('DataBase');
mongoose.connect('mongodb://localhost:27017/'+configs.DB_NAME,{useNewUrlParser:true,useUnifiedTopology: true},(err)=>{
    if(err){
        console.error(err);
        return;
    }
    console.log("data base connected successfully");
});
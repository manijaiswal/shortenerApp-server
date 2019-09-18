const mongoose     =     require('mongoose');
const configs       = require('../utility/configs');


mongoose.connect('mongodb://localhost:27017/'+configs.DB_NAME,{useNewUrlParser:true},(err)=>{
    if(err){
        console.error(err);
        return;
    }
    console.log("data base connected successfully");
});
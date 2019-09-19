var mongoose   =  require('mongoose');
var Schema     =  mongoose.Schema;
 
var UrlDetailsSchema  = new Schema({
    code:{type:String},
    browser:{type:String},
    ip:{type:String},
    device:{type:String},
    country:{type:String},
    os:{type:String},
    times:{type:Number,default:0}
},
{
    timestamps : true
});

mongoose.model('UrlDetails',UrlDetailsSchema);
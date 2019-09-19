var mongoose   =  require('mongoose');
var Schema     =  mongoose.Schema;
 
var UrlSchema  = new Schema({
    originalUrl:{type:String},
    code:{type:String},
    views:{type:Number,default:0},
    shortUrl:{type:String}
},
{
    timestamps : true
});

mongoose.model('Url',UrlSchema);
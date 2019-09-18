var mongoose   =  require('mongoose');
var bcrypt      =  require('bcrypt');
var SALT_WORK_FACTOR = 10;

var Schema     =  mongoose.Schema;
 
var AccountSchema  = new Schema({
    mobile_no:{type:Number,required:true},
    name   : {type:String,required:false},
    email  : {type:String,required:false},
    role   : {type:Number,required:true},
    cat     :{type:Date,default:new Date()},
    password:{type:String},
    
},
{
    timestamps : true
}
);

AccountSchema.pre("save",function(next){
    var user = this;
    console.log(this);
    if(!user.cat){
        user.cat = new Date
    }
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        console.log(user.password);
        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
    
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
   
});

AccountSchema.methods.comparePassword = function(candidatePassword, cb) {
    var user = this;
    bcrypt.compare(candidatePassword, user.password, function(err, isMatch) {
        if (err) return cb(err,null);
        cb(null, isMatch);
    });
};

AccountSchema.statics = {
    ROLE:{
        ADMIN:1,
        USER :  2,
    }
}

mongoose.model('Profile',AccountSchema);
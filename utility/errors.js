var errors ={
    "invalid_parameters"   :    [100,'Invalid Parameters'],
    "server_error"         :    [200,'Server Error'],
    "phone_no_invalid"     :    [300,'Mobile Number is not valid'],
    "password_length"      :    [400,"password must be greater than 6"],
    "account_already_exists":    [500,"account already exists"],
    "invalid_tokn"          :    [600,"Access without token is not authorised"],
    "account_not_exists"    :    [700,"Account doesnot exists"],
    "password_not_match"    :    [800,"Password not match with this number"],
    "only_admin_rights"     :    [900,"Only admin can do CRUD operations"],
    "base_url_invalid"      :    [1000,"Base url Invalid"],
    "original_url_invalid"  :    [1100,"Original Url is not valid"]
}


module.exports = errors;
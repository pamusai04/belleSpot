const validator = require('validator');

const validateUserInput = (data)=>{
    const mandatoryField = ['firstName', 'gender', 'emailId','password'];

    const isAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k));
    if(!isAllowed){
        throw new Error("Some Field Missing");
    }

    if(!validator.isEmail(data.emailId)){
        throw new Error("Invalid Email");
    }

    if(!validator.isStrongPassword(data.password)){
        throw new Error("week Password");
    }
    
}
module.exports = validateUserInput;



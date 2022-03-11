const  mongoose =require('mongoose');
const Temperature = require('./temperature');


const CountrySchema  = new mongoose.Schema({
    nume: {
        type: String,
        required:true,
        unique:true,
    },
    lat:{
        type: Number,
        required:true,
    },
    lon:{
        type:Number,
        required:true,
    }
})
const Country = mongoose.model('Country', CountrySchema);

module.exports = Country;

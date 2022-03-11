const  mongoose = require('mongoose');

const CitySchema  = new mongoose.Schema({
    idTara:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country',
        required: true,
    },
    nume: {
        type: String,
        required:true,
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
CitySchema.index({idTara:1, nume: 1}, {unique:true});
const City = mongoose.model('City', CitySchema);

module.exports = City;
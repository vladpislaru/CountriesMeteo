const  mongoose = require('mongoose');

const TemperatureSchema  = new mongoose.Schema({
    valoare:{
        type:Number,
        required:true,
    },
    timestamp:{
        type: Date,
        default: Date.now,
    },
    idOras:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'City',
        required:true,
    }
})
TemperatureSchema.index({timestamp:1 , idOras:1}, {unique:true});
const Temperature = mongoose.model('Temperature', TemperatureSchema);

module.exports = Temperature;

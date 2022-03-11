const express = require('express'),
    bodyParser = require('body-parser'),
    mongoDB = require('mongoose'),
    Country = require('./models/country'),
    City = require("./models/city"),
    Temperature = require("./models/temperature"),  
    url = require('url');
const ObjectId = require('mongodb').ObjectID;


const api = express();
api.use(bodyParser.urlencoded({extended: false}))

const port = process.env.PORT || 3000; //aici portul este 3000 pentru ca portul din countaineer este 3000 si pe acesta l-am mapat la protul 81 al masinii gazda
//Conneting to BD
mongoDB.connect('mongodb://mongo:27017/docker-node-mongo',{useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err))

//Auxiliar fucntions
const datesToString = function(temps){
    var toSendTemp=[]
    t = {}
    var i = 0;
    for(const temp of temps){
        t.id = temp._id.toString();
        t.valoare = temp.valoare;
        year = temp.timestamp.getFullYear();
        month = temp.timestamp.getMonth()+1;
        day = temp.timestamp.getDate();
        t.timestamp = year + "-" + month + "-" + day;
        toSendTemp[i] = t;
        i=i+1;
    }
    return toSendTemp;
}

const toSendCities = function(cities){
    var toSendCity = []
    c = {}
    i = 0;
    for(const city of cities){
        c.id = city._id.toString();
        c.idTara = city.idTara.toString();
        c.nume = city.nume;
        c.lat = city.lat;
        c.lon = city.lon;
        toSendCity[i] = c;
        i = i + 1;
    }

    return toSendCity;
}

const toSendCountries = function(countries){
    var toSendCountry = []
    c = {}
    i = 0;
    for(const country of countries){
        c.id = country._id.toString();
        c.nume = country.nume;
        c.lat = country.lat;
        c.lon = country.lon;
        toSendCountry[i] = c;
        i = i + 1;
    }

    return toSendCountry;

}

//Countries
api.post('/api/countries', (req,res) => {
    console.log("/api/countries");

    //check extra body attributes
    const requiredBodyAttributes = [ 'nume', 'lat', 'lon', ]
    for (prop in req.body){
        if(requiredBodyAttributes.indexOf(prop) == -1){
            return res.status(400).json()
        }
    }

    //check for required body attributes
    if(req.body.nume == undefined || req.body.lat== undefined || req.body.lon== undefined){
        return res.status(400).json()
    }

    Country.create({
        nume : req.body.nume,
        lat: req.body.lat,
        lon: req.body.lon
    }, function(err, country){
        if(err){
            return res.status(409).json();
        }
        console.log(country._id);
        return res.status(201).json({Id: country._id.toString()});
    });
});

api.get('/api/countries/', (req,res) => {
    
    Country.find({},function(err, countries){
        if(err){
            //handleError(err);
            return res.status(400).json();
        }else{
            
            var sendCountries = toSendCountries(countries);
            console.log(sendCountries)
            return res.status(200).json(sendCountries);
        }

    } )
});

api.put('/api/countries/:id', (req,res) => {

    const requiredBodyAttributes = [ 'id','nume', 'lat', 'lon', ]
    for (prop in req.body){
        if(requiredBodyAttributes.indexOf(prop) == -1){
            return res.status(400).json()
        }
    }

    if(req.body.id == undefined || req.params.id != req.body.id || !ObjectId.isValid(req.params.id)){
        return res.status(400).json()
    }

    bodyReq = req.body
    const {id, ...country} = {...bodyReq};

    //id = req.params.id;

    console.log(id)

    Country.findOneAndUpdate({_id: ObjectId(id)}, country)
        .then(result => {
            console.log(result._id.toString());
            return res.status(200).json();
        })
        .catch(err => {
            console.log(err)
            return res.status(404).json();
        })


    //console.log(req.params.id);
});

api.delete('/api/countries/:id', (req,res) => {
    id = req.params.id;

    if(!ObjectId.isValid(id)){
        return res.status(404).json();
    }

    City.find({idTara: ObjectId(id)}, async function(err, result) {
        // result.forEach(city => {
        //     console.log(result)
        //     Temperature.deleteMany({idOras: ObjectId(city._id.toString())})
        // })
        //console.log(result)
        for(const city of result ){
            console.log(city)
            await Temperature.deleteMany({idOras: city._id})
        }
        City.deleteMany({idTara: ObjectId(id)})
        .then(res1 => {
            console.log("a intrat aici inainte?")
            Country.findOneAndDelete({_id: ObjectId(id)})
            .then(toDeleteCountry => {
                console.log(toDeleteCountry);
                if(toDeleteCountry == null) return res.status(404).json();
                return res.status(200).json();
            })
            .catch(err => {
                return res.status(400).json();
            })
        })
        .catch(err => {
            return res.status(400).json();
        })
             
    })
    
});

//Cities

api.post('/api/cities', (req,res) => {

    const requiredBodyAttributes = [ 'idTara','nume', 'lat', 'lon', ]
    for (prop in req.body){
        if(requiredBodyAttributes.indexOf(prop) == -1){
            return res.status(400).json()
        }
    }

    if(req.body.idTara== undefined || req.body.nume == undefined || req.body.lat== undefined || req.body.lon== undefined){
        return res.status(400).json()
    }
    Country.find({ _id: ObjectId(req.body.idTara)}, function(err, result){
        if(err){
            return res.status(404).json();
        }
        console.log(result.length);
        if(result.length == 0 || result.length == undefined){
            
            return res.status(404).json();
        }
        City.create({
            idTara: req.body.idTara,
            nume: req.body.nume,
            lat: req.body.lat,
            lon: req.body.lon
        }, function(err, city){
           if(err) {
               return res.status(409).json();
           }
           return res.status(201).json({id: city._id.toString()})
        });
    })
    console.log("dupa aici")
    
});

api.get('/api/cities', (req,res) => {
    City.find({}, function(err, cities){
        if(err){
            return res.status(400).json()
        }
        var sendCities = toSendCities(cities);
        console.log(sendCities)
        return res.status(200).json(sendCities)
    })
});

api.get('/api/cities/country/:id_Tara', (req,res) => {
    //console.log(req.params.id_Tara);
    id  = req.params.id_Tara
    console.log("Tara este : "+ id)
    if(!ObjectId.isValid(id)){
        return res.status(200).json([]);
    }

    City.find({id_tara: ObjectId(id)}, function(err, cities){
        if(err){
            console.log(err)
            return res.status(400).json()
        }
        var sendCities = toSendCities(cities);
        console.log(sendCities)
        return res.status(200).json(sendCities)
    })
})

api.get('/api/cities/country/',(req,res)=> {
    return res.status(200).json([]);
})

api.put('/api/cities/:id', async (req,res) => {
    // if(req.body.idTara == undefined || req.body.id == undefined || req.body.nume == undefined || req.body.lat== undefined || req.body.lon== undefined){
    //     return res.status(400).json()
    // }
    
    if(req.params.id != req.body.id ){
        return res.status(400).json()
    }

    const requiredBodyAttributes = [ 'id','idTara','nume', 'lat', 'lon', ]
    for (prop in req.body){
        if(requiredBodyAttributes.indexOf(prop) == -1){
            return res.status(400).json()
        }
    }

    bodyReq = req.body
    const {id, ...city} = {...bodyReq};

    if(city.idTara != undefined){
        if(!ObjectId.isValid(req.body.idTara)) return res.status(404).json();
        city.idTara = ObjectId(city.idTara)
        if( !ObjectId.isValid(id) ){
            return res.status(404).json();
        }else{
            await Country.find({ _id: ObjectId(req.body.idTara)}, function(err, result){
                if(err){
                    return res.status(404).json();
                }
                //console.log(result.length);
                if(result.length == 0 || result.length == undefined){           
                    return res.status(404).json();
                }
            })
        }
    }

    await City.findOneAndUpdate({_id: ObjectId(id)}, city)
        .then(result => {
            return res.status(200).json();
        })
        .catch(err => {
            return res.status(409).json();
        })

});

api.delete('/api/cities/:id', (req,res) => {
    id =  req.params.id;

    if( !ObjectId.isValid(id) ){
        return res.status(404).json();
    }

    Temperature.deleteMany({idOras: ObjectId(id)})
        .then(result => {
            City.findOneAndDelete({_id: ObjectId(id)})
                .then(result => {
                    //console.log(result);
                    if(result == null) return res.status(404).json();
                    return res.status(200).json();
                    
                })
                .catch(err => {
                    return res.status(404).json();
                })
        })
        .catch(err => {
            return res.status(404).json();
        })
});

//Temperatures
//format timestamp 2020-12-12 -> YYYY-MM-DD

api.post('/api/temperatures', (req,res) => {
    if(req.body.id_oras == undefined || req.body.valoare == undefined ){
        return res.status(400).json()
    }
    const requiredBodyAttributes = [ 'id_oras','valoare' ]
    for (prop in req.body){
        if(requiredBodyAttributes.indexOf(prop) == -1){
            return res.status(400).json()
        }
    }
    if(!ObjectId.isValid(req.body.id_oras)){
        return res.status(404).json();
    }
    City.find({ _id: ObjectId(req.body.id_oras)}, function(err, result){
        if(err){
            return res.status(404).json();
        }
        //console.log(result.length);
        if(result.length == 0 || result.length == undefined){
            
            return res.status(404).json();
        }
    })

    Temperature.create({
        idOras: req.body.id_oras,
        valoare: req.body.valoare
    }).then(result => {
        return res.status(201).json(result._id.toString())
    }).catch(err => {
        //console.log(err);
        return res.status(409).json();
    })

});

api.get('/api/temperatures', async (req,res) => {
    lat = req.query.lat ? req.query.lat : null ;
    lon = req.query.lon ? req.query.lon : null;
    from = req.query.from ? new Date(req.query.from) : new Date("100-1-1");
    until = req.query.until ? new Date(req.query.until) : new Date("9999-12-31");
    if(!isNaN(new Date(req.query.from).getTime())){
        from = new Date("100-1-1")
    }
    if(!isNaN(new Date(req.query.until).getTime())){
        until = new Date("9999-12-31")
    }
    //console.log("from este :  " + from.toString())
    filter = {}//filtru pentru selectarea tarilot se va completa dinamic : daca exista sau nu lat si lon
    //console.log(lat)

    if(lat != null){
        filter.lat = lat;
    }
    if(lon != null){
        filter.lon = lon;
    }

    var cities=[];
    var temperatures = [];
    console.log(filter)
    await City.find(filter).then(result => {
        cities = result;
        //console.log(result);
    })
    console.log(cities);
    for(const city of cities ){
        await Temperature.find({    
                timestamp: {
                    $gte: from,
                    $lte: until
                },
                idOras: city._id
        }).then(result1 => {
            console.log(result1);
            temperatures = temperatures.concat(result1)
        })
    }
    var toSendTemp = datesToString(temperatures);
    console.log(temperatures);
    return res.status(200).json(toSendTemp);
    //await City.find().$where(`${lati} == -1`).or().$where(`lat ===  ${lati}`).exec()
});

api.get('/api/temperatures/cities/:id_oras', async (req,res) => {
    from = req.query.from ? new Date(req.query.from) : new Date("100-1-1");
    until = req.query.until ? new Date(req.query.until) : new Date("9999-12-31");
    if(!isNaN(new Date(req.query.from).getTime())){
        from = new Date("100-1-1")
    }
    if(!isNaN(new Date(req.query.until).getTime())){
        until = new Date("9999-12-31")
    }
    id = req.params.id_oras;

    const temperatures = [];
    await Temperature.find({
        timestamp: {
            $gte: from,
            $lte: until
        },
        idOras: ObjectId(id)
    }).then(result =>  {
        temperatures = temperatures.concat(result);
    })

    var toSendTemp = datesToString(temperatures);
    console.log(temperatures);

});

api.get('/api/temperatures/cities/', async (req,res) => {
    return res.status(200).json([]);//am introdus si aceste route pt ca in teste am vazut ca exista aceste posibilitati .... 
});

api.get('/api/temperatures/countries/:id_tara', async (req,res) => {
    id = req.params.id_tara;
    from = req.query.from ? new Date(req.query.from) : new Date("100-1-1");
    until = req.query.until ? new Date(req.query.until) : new Date("9999-12-31");

    if(!isNaN(new Date(req.query.from).getTime())){
        from = new Date("100-1-1")
    }
    if(!isNaN(new Date(req.query.until).getTime())){
        until = new Date("9999-12-31")
    }

    var cities=[];
    var temperatures = [];
    await City.find({idTara: ObjectId(id)}).then(result => {
        cities = result;
    })
    console.log(cities);
    for(const city of cities ){
        await Temperature.find({    
                timestamp: {
                    $gte: from,
                    $lte: until
                },
                idOras: city._id
        }).then(result1 => {
            temperatures = temperatures.concat(result1)
        })
    }
    var toSendTemp = datesToString(temperatures);
    console.log(temperatures);
    return res.status(200).json(toSendTemp);
});
api.get('/api/temperatures/countries/', async (req,res) => {
    return res.status(200).json([]);
});
api.put('/api/temperatures/:id', (req,res) => {
    if(req.params.id != req.body.id ){
        return res.status(400).json()
    }

    const requiredBodyAttributes = [ 'id','idOras','valoare' ]
    for (prop in req.body){
        if(requiredBodyAttributes.indexOf(prop) == -1){
            return res.status(400).json()
        }
    }

    bodyReq = req.body
    const {id, ...temp} = {...bodyReq};//copiaza atribtul id din bodyReq in id iar restul param in temp

    if(!ObjectId.isValid(id) ){
        return res.status(404).json();
    }

    if(temp.idOras != undefined){
        if(!ObjectId.isValid(temp.idOras)) return res.status(404).json();
        temp.idOras = ObjectId(temp.idOras)
        City.find({ _id: temp.idOras}, function(err, result){
            if(err){
                return res.status(404).json();
            }
            //console.log(result.length);
            if(result.length == 0 || result.length == undefined){
                
                return res.status(404).json();
            }else{
                Temperature.findOneAndUpdate({_id: ObjectId(id)},temp)
                    .then(result => {
                        return res.status(200).json()
                    })
                    .catch(err => {
                        return res.status(404).json()
                    })
            }
        })
    }else{
        Temperature.findOneAndUpdate({_id: ObjectId(id)},temp)
            .then(result => {
                return res.status(200).json()
            })
            .catch(err => {
                return res.status(404).json()
            })
    }

    

    
});

api.delete('/api/temperatures/:id', (req,res) => {
    id  = req.params.id

    if(!ObjectId.isValid(id)){
        return res.status(404).json();
    }

    Temperature.findOneAndDelete({_id: ObjectId(id)})
        .then(result => {
            console.log(result);
            if(result == null) return res.status(404).json();
            return res.status(200).json();
            
        })
        .catch(err => {
            return res.status(404).json();
        })

});

api.listen(port, ()=> console.log(`Server started on port ${port}`));
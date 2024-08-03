const express = require("express");
const bodyParser = require("body-parser");
const {MongoClient} = require("mongodb");
const PgMem = require("pg-mem");

const db = PgMem.newDb();

    const render = require("./render.js");
// Measurements database setup and access

let database = null;
const collectionName = "measurements";

async function startDatabase() {
    const uri = "mongodb://localhost:27017/?maxPoolSize=20&w=majority";	
    const connection = await MongoClient.connect(uri, {useNewUrlParser: true});
    database = connection.db();
}

async function getDatabase() {
    if (!database) await startDatabase();
    return database;
}

async function insertMeasurement(message) {
    const {insertedId} = await database.collection(collectionName).insertOne(message);
    return insertedId;
}

async function getMeasurements() {
    return await database.collection(collectionName).find({}).toArray();	
}

// API Server

const app = express();

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static('spa/static'));

const PORT = 8080;

app.post('/measurement', function (req, res) {
    // Generar el timestamp en formato ISO 8601 para almacenar en la BD
    const timestamp = new Date().toISOString();

-   console.log("device id: " + req.body.id + " key: " + req.body.key + " BMP280 temperature:" + 
    req.body.bt + " BMP280 pressure: " + req.body.bp + 
    " DHT11 temperature: " + req.body.dt + " DHT11 humidity: " + req.body.dh +
    " Timestamp: " + timestamp);	

    const {insertedId} = insertMeasurement({id:req.body.id, key:req.body.key, 
        temp_bmp280:req.body.bt, pressure_bmp280:req.body.bp, 
        temp_dht11:req.body.dt, humidity_dht11:req.body.dh, 
        timestamp:timestamp});
	res.send("received measurement into " +  insertedId);
});

app.post('/virtual/measurement', function (req, res) {
    // Generar el timestamp en formato ISO 8601 para almacenar en la BD
    const virtualTimestamp = new Date().toISOString();

-   console.log("device id: " + req.body.id + " key: " + req.body.key + " Temperature:" + 
    req.body.t + " humidity: " + req.body.h + "pressure: " + req.body.p + " Timestamp: " + virtualTimestamp);	
    
    const {insertedId} = insertMeasurement({id:req.body.id, key:req.body.key, 
        temp:req.body.t, humidity:req.body.h, pressure:req.body.p,          
        timestamp:virtualTimestamp});
	res.send("received measurement into " +  insertedId);
});

app.post('/device', function (req, res) {
	console.log("device id    : " + req.body.id + " name        : " + req.body.n + " key         : " + req.body.k );

    db.public.none("INSERT INTO devices VALUES ('"+req.body.id+ "', '"+req.body.n+"', '"+req.body.k+"')");
	res.send("received new device");
});


app.get('/web/device', function (req, res) {
	var devices = db.public.many("SELECT * FROM devices").map( function(device) {
		console.log(device);
		return '<tr><td><a href=/web/device/'+ device.device_id +'>' + device.device_id + "</a>" +
			       "</td><td>"+ device.name+"</td><td>"+ device.key+"</td></tr>";
	   }
	);
	res.send("<html>"+
		     "<head><title>Sensores</title></head>" +
		     "<body>" +
		        "<table border=\"1\">" +
		           "<tr><th>id</th><th>name</th><th>key</th></tr>" +
		           devices +
		        "</table>" +
		     "</body>" +
		"</html>");
});

app.get('/web/device/:id', function (req,res) {
    var template = "<html>"+
                     "<head><title>Sensor {{name}}</title></head>" +
                     "<body>" +
		        "<h1>{{ name }}</h1>"+
		        "id  : {{ id }}<br/>" +
		        "Key : {{ key }}" +
                     "</body>" +
                "</html>";


    var device = db.public.many("SELECT * FROM devices WHERE device_id = '"+req.params.id+"'");
    console.log(device);
    res.send(render(template,{id:device[0].device_id, key: device[0].key, name:device[0].name}));
});	


app.get('/term/device/:id', function (req, res) {
    var red = "\33[31m";
    var green = "\33[32m";
    var blue = "\33[33m";
    var reset = "\33[0m";
    var template = "Device name " + red   + "   {{name}}" + reset + "\n" +
		   "       id   " + green + "       {{ id }} " + reset +"\n" +
	           "       key  " + blue  + "  {{ key }}" + reset +"\n";
    var device = db.public.many("SELECT * FROM devices WHERE device_id = '"+req.params.id+"'");
    console.log(device);
    res.send(render(template,{id:device[0].device_id, key: device[0].key, name:device[0].name}));
});

app.get('/measurement', async (req,res) => {
    res.send(await getMeasurements());
});

app.get('/device', function(req,res) {
    res.send( db.public.many("SELECT * FROM devices") );
});

startDatabase().then(async() => {

    const addAdminEndpoint = require("./admin.js");
    addAdminEndpoint(app, render);

    //await insertMeasurement({id:'00', t:'18', h:'78'});

    //await insertMeasurement({id:'00', key:'AAA' , t:'18', h:'78'});

    await insertMeasurement({id:'00', key: '123456', sensor1: 'BMP280', bt:'18', bp:'1009', 
        sensor2:'DHT11', dt:'18', dh:'54', timestamp:'2000-01-01T00:00:00.000Z'});
    await insertMeasurement({id:'00', key: '123456', sensor1: 'BMP280', bt:'19', bp:'1009', 
        sensor2:'DHT11', dt:'19', dh:'55', timestamp:'2000-01-01T00:00:15.000Z'});
    await insertMeasurement({id:'00', key: '123456', sensor1: 'BMP280', bt:'18', bp:'1008', 
        sensor2:'DHT11', dt:'18', dh:'55', timestamp:'2000-01-01T00:00:30.000Z'});
    await insertMeasurement({id:'01', key: '234567', sensor1: 'BMP280', bt:'17', bp:'1007', 
        sensor2:'DHT11', dt:'17', dh:'60', timestamp:'2000-01-01T00:00:00.000Z'});
    console.log("mongo measurement database Up");

    db.public.none("CREATE TABLE devices (device_id VARCHAR, name VARCHAR, key VARCHAR, sensor1 VARCHAR, bt VARCHAR, bp VARCHAR, sensor2 VARCHAR, dt VARCHAR, dh VARCHAR)");
    db.public.none("INSERT INTO devices VALUES ('00', 'Fake Device 00', '123456', 'BMP280', '18', '1009', 'DHT11', '18', '54')");
    db.public.none("INSERT INTO devices VALUES ('01', 'Fake Device 01', '234567', 'BMP280', '19', '1008', 'DHT11', '19', '56')");
    db.public.none("CREATE TABLE users (user_id VARCHAR, name VARCHAR, key VARCHAR)");
    db.public.none("INSERT INTO users VALUES ('1','Ana','admin123')");
    db.public.none("INSERT INTO users VALUES ('2','Beto','user123')");

    console.log("sql device database up");

    app.listen(PORT, () => {
        console.log(`Listening at ${PORT}`);
    });
});

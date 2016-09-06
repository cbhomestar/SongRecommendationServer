var http = require('http');
var path = require('path');
var express = require('express');
var router = express();
var server = http.createServer(router);

var mongoose = require('mongoose');
var mongoosedb = mongoose.createConnection(process.env.IP, "blahblah");
mongoosedb.on('error', console.error.bind(console, 'connection error:')); 

mongoosedb.once("on", function() {
  console.log("on");
});
var producerSchema = new mongoose.Schema({
    artist: String, 
    songTitle: String,
    songTitleLowerCase: String,
    producer: String
  });
var ProducerSong = mongoosedb.model('Song', producerSchema);
var musicData = require('./data/musicdata.json');

var db = null;


router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.get('/', function(req, res) {
  console.log(req);
  res.send('hello world');
});

router.get('/songs', function(req, res) {
  console.log(req.query.songTitle);
  
  var text = String(req.query.songTitle || '');
  
  ProducerSong.findOne({"songTitleLowerCase" : text.toLowerCase()}, function(err, songMatch) {
        
    if (err) {
      return console.error(err);
    }
          
    if (! songMatch) {
      var data = [{
        name: "n/a",
        text: "no results"
      }];
      //broadcast('message', data);
      res.send(data);
      return;
    }
          
    console.log(songMatch.songTitle);
          
    var producer = songMatch.producer;
          
    ProducerSong.find({"producer": producer}, function(err, producerMatch) {
      
      if (err) {
        return console.error(err);
      }
            
      console.log(producerMatch);
            
      if (! producerMatch) {
        var data = [{
          name: "n/a",
          text: "no results"
        }];
        //broadcast('message', data);
        res.send(data);
        return;
      }
            
      var data = [];
            
      for (var i in producerMatch)
      {
        data.push({
          name: producerMatch[i].artist,
          text: producerMatch[i].songTitle
        });
      }
      
      res.send(data);
    });
  });
  
  //res.send('hello world');
});

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
  ProducerSong.remove({}, function(err) {
    console.log('collection removed');
  });
  
  console.log(JSON.stringify((musicData)));
  
  for (var i in musicData)
  {
    var song = new ProducerSong({
      artist: musicData[i].Artist, 
      songTitle: musicData[i].Song,
      songTitleLowerCase: musicData[i].Song.toLowerCase(),
      producer: musicData[i].Producer
    });

    song.save(function(err, miss) {
      if (err) return console.error(err);
    });
  }
});
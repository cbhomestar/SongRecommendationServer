//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
var MongoClient = require('mongodb').MongoClient;


var mongoose = require('mongoose');
var mongoosedb = mongoose.createConnection(process.env.IP, "blahblah");
mongoosedb.on('error', console.error.bind(console, 'connection error:')); 

mongoosedb.once("on", function() {
  console.log("on");

});
var commentSchema = new mongoose.Schema({
    name: String, 
    comment: String
  });
var Comments = mongoosedb.model('Com', commentSchema);

var db = null;
// var musicData = require('./data/musicdata.json');


//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(path.resolve(__dirname, 'client')));
var messages = [];
var sockets = [];

io.on('connection', function (socket) {
    messages.forEach(function (data) {
      socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });
    
    socket.on('show', function() {
      Comments.find({}, function(err, match) {
          
          if (err) return console.error(err);
          
          console.log(match);
          
          if (! match)
          {
              var data = {
              name: "n/a",
              text: "no results"
            }
            socket.emit('show', data);
            return;
          }
          
          var data = [];
          
          for (var i in match)
          {
            data.push({
            name:match[i].name,
            text: match[i].comment
          });
          }
          
          socket.emit('show', data);
        });
      
    });

    socket.on('message', function (msg) {
      
      
      var text = String(msg.text || '');

      if (!text)
        return;
        
        
      var comment = new Comments({
        name: msg.name,
        comment: msg.text
      });
      
      comment.save(function(err, miss) {
        if (err) return console.error(err);
      });
      
      var KC = "Kelly Clarkson";
      var song = "wah wah";
      // var blahblah = db.collection("testData").find( { Artist: KC }).each(function(err, doc) {
      //   console.log(doc);
      //   if (doc !== null)
      //   {
      //   // doc = JSON.stringify(doc);
      //   // doc = JSON.parse(doc);
      //     song = doc.Song;
      //     console.log(song);
      //   }
      // });
      
      // var miss = new Song({
      //     artist: 'Kelly Clarko', 
      //     songTitle: 'Miss Independent'
      //   });

      // miss.save(function(err, miss) {
      //   if (err) return console.error(err);
      //   console.log(miss);
      // });
      
      // ProducerSong.findOne({"songTitleUpperCase" : text.toUpperCase()}, function(err, songMatch) {
        
      //   if (err) return console.error(err);
        
      //   if (! songMatch)
      //   {
      //       var data = {
      //       name: "n/a",
      //       text: "no results" }
          
      //     broadcast('message', data);
      //     return;
      //   }
        
      //   console.log(songMatch.songTitle);
        
      //   var producer = songMatch.producer;
        
      //   ProducerSong.find({"producer": producer}, function(err, producerMatch) {
          
      //     if (err) return console.error(err);
          
      //     console.log(producerMatch);
          
      //     if (! producerMatch)
      //     {
      //         var data = {
      //         name: "n/a",
      //         text: "no results"
      //       }
      //       broadcast('message', data);
      //       return;
      //     }
          
      //     var data = [];
          
      //     for (var i in producerMatch)
      //     {
      //       data.push({
      //       name: producerMatch[i].artist,
      //       text: producerMatch[i].songTitle
      //     });
      //     }
          
      //     // var artist = producerMatch.artist;
      //     // song = producerMatch.songTitle;
          
      //     // var data = {
      //     //   name: artist,
      //     //   text: song
      //     // }
          
      //     socket.emit('message', data);
          //broadcast('message', data);
        // });
      // });
      
      // var blahblahArray = db.collection("testData").find( { Artist: KC }).toArray(function(err, doc) {
      //   console.log("error");
      //   console.log(err);
      // });
      // console.log(blahblahArray);

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: song
        };
        
        //var collec = db.collection("testData");
        
        //var conn = mongo.db('process.env.IP');
       // conn.collection("thishere").insert({x : 3});
       
       
       

       // broadcast('message', data);
       // messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
  
  Comments.remove({}, function(err) { 
   console.log('collection removed') 
    });
  
  // console.log(JSON.stringify((musicData)));
  
  // for (var i in musicData)
  // {
  //   //console.log(musicData[i].Song);
    
  //   var song = new ProducerSong({
  //         artist: musicData[i].Artist, 
  //         songTitle: musicData[i].Song,
  //         songTitleUpperCase: musicData[i].Song.toUpperCase(),
  //         producer: musicData[i].Producer
  //       });

  //     song.save(function(err, miss) {
  //       if (err) return console.error(err);
  //     });
    
  // }
  
  
  
  
  // MongoClient.connect("mongodb://0.0.0.0", function(err, dbAdmin) 
  //       {
  //         db = dbAdmin;
  //         console.log(musicData);
  //         var collec = dbAdmin.collection("testData");
  //         collec.insert(musicData, function(err, inserted) {
  //           console.log(err);
  //           console.log(inserted);
  //         });

  //         // db.collection("replicaset_mongo_client_collection").update({a:1}, {b:1}, {upsert:true}, function(err, result) 
  //         // {
        
  //         //   db.close();

  //         // });
          
  //       } );
});

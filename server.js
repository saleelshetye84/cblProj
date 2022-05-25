var express = require('express');
var app = express();
const fs = require('fs');
const events = require('events');
const readline = require('readline');
const { once } = require('node:events');

//Read the argument for the directory
var arguments = process.argv ;
var testFolder = arguments[2] + "/varLogDir/";
console.log(testFolder) ;

//Some code to list the files in the directory
app.get('/files', function(req, res) {
   console.log("Got a GET request for /files");
   let fileList = [];
   fs.readdirSync(testFolder).forEach(file => {
     fileList.push(testFolder + file);
   });
  res.send(fileList);
});

//Query to retrieve lastNElements in reverse time order
//e.g http://localhost:3000/files/splunkd.log?events=1
//Note here the filter for containing test is applied before reversing
//and sorting the events to be returned.

app.get('/files/:file_name', function(req, res) {
  const events = req.query.events;
  const contains = req.query.contains;
  const nReadlines = require('n-readlines');

  //check for user entering invalid file(or file not present on disk for any reasons)
  const path = testFolder + req.params.file_name

  fs.access(path, function (error) {
  if (error) {
    console.error(error);
    res.status(404).send(path + " not found.");
  } else {
    //console.log("exists:", path);
  }
});

//async processing
let fileLogLines1 = [];
(async function processLineByLine() {
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream(path),
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      if ( line !== null && line !== ''){
        if (req.query.contains !== '' && req.query.contains !== undefined){
          if (line.toString('ascii').includes(req.query.contains)){
            fileLogLines1.push(line.toString('ascii'));
          }
        }
        else{
          fileLogLines1.push(line.toString('ascii'));
        }
      }
    });

    await once(rl, 'close');
    console.log('Reading file line by line with readline done.');
    
    // reverse the order
    fileLogLines1.reverse();

    //check for events parameter
    if (req.query.events !== '' && req.query.events !== undefined){
        const lastNElements = fileLogLines1.slice(0, events);
        res.status(200).send(lastNElements);
    }
    else{
        res.status(200).send(fileLogLines1);
    }
  } catch (err) {
    console.error(err);
  }
})();
});

//handle any bad routes
app.get('*', function(req, res){
res.send('Invalid URL, Please correct and retry.');
});

var server = app.listen(3000, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})

var express = require('express');
var app = express();
const fs = require('fs');
const lineReader = require('line-reader');



//Some code to list the files in the directory
app.get('/files', function(req, res) {
   const testFolder = '/Users/sshetye/cblProj/varLogDir/';
   console.log("Got a GET request for /files");
   let fileList = [];
   fs.readdirSync(testFolder).forEach(file => {
     fileList.push(testFolder + file);
     //console.log(typeof file);
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
  const path = '/Users/sshetye/cblProj/varLogDir/' + req.params.file_name

  fs.access(path, function (error) {
  if (error) {
    //console.log("DOES NOT exist:", path);
    console.error(error);
    //res.status(404).send(path + " not found.");
  } else {
    console.log("exists:", path);
  }
});

  const logFileLines = new nReadlines('/Users/sshetye/cblProj/varLogDir/' + req.params.file_name);
  let fileLogLines = [];
  let line;

  while (line = logFileLines.next()) {
      if (req.query.contains !== '' && req.query.contains !== undefined){
        if (line.toString('ascii').includes(req.query.contains)){
          fileLogLines.push(line.toString('ascii'));
        }
      }
      else{
        fileLogLines.push(line.toString('ascii'));
        //console.log(line.toString('ascii'));
      }
  }
  fileLogLines.reverse();

  //check for events parameter
  if (req.query.events !== '' && req.query.events !== undefined){
      const lastNElements = fileLogLines.slice(0, events);
      res.status(200).send(lastNElements);
  }
  else{
      //res.send(fileLogLines);
      //res.status(200);
      res.status(200).send(fileLogLines);
  }
});

app.get('*', function(req, res){
res.send('Invalid URL, Please correct and retry.');
});

var server = app.listen(3000, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})

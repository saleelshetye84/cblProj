var express = require('express');
var app = express();
const fs = require('fs');

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
    //res.status(404).send(path + " not found.");
  } else {
    //console.log("exists:", path);
  }
});

 //Now proceed to reading each line of the file, apply filter and reverse order
 let fileLogLines1 = [];
 const allFileContents = fs.readFileSync(path, 'utf-8');
      allFileContents.split(/\r?\n/).forEach(line =>  {
      if ( line !== null && line !== ''){
        if (req.query.contains !== '' && req.query.contains !== undefined){
          if (line.toString('ascii').includes(req.query.contains)){
            fileLogLines1.push(line.toString('ascii'));
          }
        }
        else{
          fileLogLines1.push(line.toString('ascii'));
        }
        //  console.log('Line from file:' + line);
      }
    });
  //console.log('Lines from file:' + fileLogLines1);

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
});

app.get('*', function(req, res){
res.send('Invalid URL, Please correct and retry.');
});

var server = app.listen(3000, function () {
   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})

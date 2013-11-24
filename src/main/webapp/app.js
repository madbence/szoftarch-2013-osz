var http = require('http');
var fs = require('fs');

http.createServer(function(req, res) {
  if(req.url === '/tasks') {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    return res.end(JSON.stringify([{
      id: 1,
      title: 'Házi feladat',
      description: 'A feladatokat párban kell elkészíteni. Házi feladat, dokumentáció feltöltés: 12. hét vége - december 1.  vasárnap',
      group: 'Szoftverarchitektúrák 2013/14/1',
      deadline: new Date(Date.now()+1000*60*60),
      appDeadline: new Date(Date.now()+1000*60*60*2)
    },{
      id: 2,
      title: 'Másik feladat',
      description: 'Másik leírás',
      group: 'csoport2',
      deadline: new Date(Date.now()+1000*60*60),
      appDeadline: new Date(Date.now()+1000*60*60*2)
    }]));
  }
  if(req.url.match(/^\/tasks\/\d+$/)) {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    return res.end(JSON.stringify([{
      id: 1,
      title: 'Házi feladat kiadó és beszedő rendszer',
      maxApp: 2,
      currentApp: 1
    },{
      id: 2,
      title: 'Házi feladat kiadó és beszedő rendszer',
      maxApp: 2,
      currentApp: 2
    },{
      id: 3,
      title: 'Házi feladat kiadó és beszedő rendszer',
      maxApp: 2,
      currentApp: 0
    },{
      id: 4,
      title: 'Házi feladat kiadó és beszedő rendszer',
      maxApp: 2,
      currentApp: 1
    },{
      id: 5,
      title: 'Házi feladat kiadó és beszedő rendszer',
      maxApp: 2,
      currentApp: 1,
      applied: true,
    },{
      id: 6,
      title: 'Házi feladat kiadó és beszedő rendszer',
      maxApp: 2,
      currentApp: 1
    }]));
  }
  if(req.url.match(/^\/concrete-tasks\/\d+$/)) {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    });
    return res.end(JSON.stringify({
      id: 1,
      title: 'Házi feladat kiadó és beszedő rendszer',
      description: 'A feladat egy olyan keretrendszer kialakítása, melynek segítségével oktatók tudnak könnyen házi feladatokat kiírni hallgatóknak és a hallgatók a megoldásokat fel tudják tölteni. Az oktatók tudjanak a felhasználókból csoportokat kialakítani, a csoportok számára tudjanak feladatokat kiírni. A konkrét feladatokat az oktató hozzárendelheti a hallgatókhoz, vagy engedélyezhető, hogy a hallgatók maguktól válasszanak. A feladatoknak van határideje, maximális létszáma (ahány hallgató egyszerre dolgozhat rajta), stb. A hallgatók tudjanak megoldásokat feltölteni, amiket az oktató szintén a felületen keresztül tud pontozni. Cél, hogy minél több funkciót nyújtson a rendszer.',
      group: 'Szoftverarchitektúrák 2013/14/1',
      deadline: new Date(Date.now()+1000*60*60),
      appDeadline: new Date(Date.now()+1000*60*60*2),
      maxApp: 2,
      currentApp: 1
    }));
  }
  if(req.url === '/') {
    req.url = '/index.html';
  }
  fs.readFile('.' + req.url, 'utf-8', function(err, data) {
    if(err) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      return res.end('Error: ' + err.toString() + '\n' + err.stack);
    }
    res.writeHead(200, {
      'Content-Type': req.url.match('html') ? 'text/html' : req.url.match('js') ? 'application/javascript' : req.url.match('css') ? 'text/css' : 'text/plain'
    });
    res.end(data);
  });
}).listen(8080);

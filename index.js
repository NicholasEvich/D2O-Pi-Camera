process.on('uncaughtException', function(err) {
  console.log('Caught exception: ' + err);
  console.log(err.stack);
});

const express = require('express');
const raspividStream = require('raspivid-stream');
const exec = require('child_process').exec;

const app = express();
const wss = require('express-ws')(app);



app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

app.get('/Core.jpg', (req, res) => res.sendFile(__dirname + '/Core.jpg'));

app.use(express.static("Core.jpg"));

app.ws('/video-stream', (ws, req) => {
    const videoStream = raspividStream({timeout: 0, width:960, height:540 ,preview:'1,1,1,1',roi:'0.5,0.5,0.5,0.5'});

    console.log('Client connected');

    ws.send(JSON.stringify({
      action: 'init',
      width: '960',
      height: '540'
    }));

    videoStream.on('data', (data) => {
        ws.send(data, { binary: true }, (error) => { if (error) console.error(error); });
    });

    ws.on('close', () => {
        console.log('Client left');
        videoStream.removeAllListeners('data');
    });
});

app.use(function (err, req, res, next) {
  console.error(err);
  next(err);
})

app.listen(3000, () => {
	 console.log('Server started on 3000');
	 exec('chromium-browser http://localhost:3000');
	 setTimeout(() => exec('killall chromium-browser'), 30000);
});



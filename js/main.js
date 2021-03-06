import { io } from 'socket.io-client';

import {john} from "./characters";

const HEIGHT = window.innerHeight;
const WIDTH = window.innerWidth;
let BACKCOLOR = 'pink'; //'rgb(100, 200, 200)'
let listening = false;
let deltaX = WIDTH/2;
let deltaY = HEIGHT/2;
let size = 100
const speed = WIDTH/60
window.addEventListener("keydown", keysPressed, false);
window.addEventListener("keyup", keysReleased, false);

let keys = [];

function keysPressed(e) {
  // store an entry for every key pressed
  keys[e.keyCode] = true;

  // left
  if (keys[37]) {
    deltaX -= speed;
  }

  // right
  if (keys[39]) {
    deltaX += speed;
  }

  // down
  if (keys[38] && !e.shiftKey) {
    deltaY -= speed;
  }

  // up
  if (keys[40] && !e.shiftKey) {
    deltaY += speed;
  }

  // down
  if (keys[38] && e.shiftKey) {
    size -= speed;
  }

  // up
  if (keys[40] && e.shiftKey) {
    size += speed;
  }

  if (keys[37] || keys[38] || keys[39] || keys[40])
  e.preventDefault();
}

function keysReleased(e) {
  // mark keys that were released
  keys[e.keyCode] = false;
}

// utilities
const normalize = (val, max, min) =>  { return (val - min) / (max - min); }
const average = (dataArray = []) => {
  const avg =  dataArray.reduce((total, value) => total + value)/dataArray.length
  return  normalize(avg,255,0)
}


// start everything
function startAudioVisual() {

  const canvas = document.querySelector('#canvas-1');
  canvas.height = HEIGHT;
  canvas.width = WIDTH;

  const soundAllowed = function(stream) {
    let store = {}

    // load connected characters
    const socket = io();
    socket.on("currentPlayers", (players) => {
      store.players = {...players};
      console.log('connected', store.players)
    });

    socket.on("newPlayer", (playerInfo) => {
      store.players[playerInfo.playerId] = playerInfo;
      console.log('new user joined: ' + playerInfo.playerId)
    });

    socket.on("kill", (playerId) => {
      delete store.players[playerId]
      console.log(playerId + ' left')
    });

    socket.on('playerMoved',  (playerInfo) => {
      store.players[playerInfo.playerId] = playerInfo
    });

    window.persistAudioStream = stream;
    const audioContent = new AudioContext();
    const audioStream = audioContent.createMediaStreamSource(stream);
    const analyser = audioContent.createAnalyser();
    audioStream.connect(analyser);
    analyser.fftSize = 512;

    const unitArray = new Uint8Array(analyser.frequencyBinCount).filter((freq, index) => index < 200);
    const lowBassFreq = unitArray.filter((freq, index) => index < unitArray.length/5)
    const bassFreq = unitArray.filter((freq, index) => index < unitArray.length/4)
    const tenorFreq = unitArray.filter((freq, index) => index < unitArray.length/3)
    const altoFreq = unitArray.filter((freq, index) => index < unitArray.length/2)
    const sopranoFreq = unitArray.filter((freq, index) => index < unitArray.length)

    const canvasCtx = canvas.getContext("2d");
    const pattern = BACKCOLOR;

    const draw = function(state) {

      if (!listening) {
        console.log('STOP listening')
        return
      }


      analyser.getByteFrequencyData(lowBassFreq);
      analyser.getByteFrequencyData(bassFreq);
      analyser.getByteFrequencyData(tenorFreq);
      analyser.getByteFrequencyData(altoFreq);
      analyser.getByteFrequencyData(sopranoFreq);

      store = {
        ...store,
        volumes: [average(lowBassFreq),average(bassFreq),average(tenorFreq),average(altoFreq),average(sopranoFreq)],
        size: size > 0 ? size : 10,
      }


      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
      // canvasCtx.fillStyle = pattern;
      // canvasCtx.fillRect(0,0, WIDTH, HEIGHT);
      canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
      // oscillator({ctx: canvasCtx, canvas, dataArray})

      if (!!store.players && Object.keys(store.players).length >= 1) {
        Object.keys(store.players).forEach((id) => {
          if (store.players[id].playerId === socket.id) {
            john({x: deltaX, y: deltaY, ctx: canvasCtx, volumes: store.volumes, size: store.size, pattern})

            socket.emit("playerMovement", {
              x: deltaX,
              y: deltaY,
              volumes: store.volumes,
              size: store.size,
            });
          } else {
            john({x: store.players[id].x, y: store.players[id].y, ctx: canvasCtx, volumes: store.players[id].volumes || [0,0,0,0,0], size: store.players[id].size, pattern: 'yellow'})
          }
        });
      }




        requestAnimationFrame(draw);


    }

    draw(store)
  };


  const soundNotAllowed = function(error) {
    console.log(error);
  };

  /*window.navigator = window.navigator || {};
	/*navigator.getUserMedia =  navigator.getUserMedia       ||
														navigator.webkitGetUserMedia ||
														navigator.mozGetUserMedia    ||
														null;*/
  navigator.getUserMedia({ audio: true }, soundAllowed, soundNotAllowed);

}


const handleMicrophone = (button) => {
  if (button.classList.contains("controller__button-start")) {
    listening = true;
    button.style.color = "red";
    button.classList.remove("controller__button-start");
    button.classList.add("controller__button-pause");
    button.innerHTML = "Listening  <i class='fa fa-volume-up'></i>";
    button.classList.toggle("blink", listening);
    startAudioVisual();
    // startAudioVisual(main, controlBoard, settings);
  } else {
    listening = false;
    button.style.color = "#ccc";
    button.classList.remove("controller__button-pause");
    button.classList.add("controller__button-start");
    button.innerHTML = "Start  <i class='fa fa-play'></i>";
    button.classList.toggle("blink", listening);
  }
};



// Start
window.onload = () => {
  const startButton = document.getElementsByClassName(
    "controller__button-start"
  )[0];
  // Grab buttons and assign functions onClick
  startButton.addEventListener("click", () => {
    handleMicrophone(startButton);
  });

  const selectBackground = document.getElementById(
    "backgrounds"
  );
  // Grab buttons and assign functions onClick
  selectBackground.addEventListener('change', () => {

    canvas.style = selectBackground.value === 'green' ? 'background: green' : `background-image: url("${selectBackground.value}")`;
  });

  const canvas = document.getElementById('canvas-1')
  const backgroundImage = document.getElementById('background')
  backgroundImage.addEventListener('change', () => {
  // get the value and set the background of the canvas somehow, css or js, as you wish darling.
    canvas.style = `background-image: url("${backgroundImage.value}")`;
  })
};

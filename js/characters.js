
const mouth = ({ctx, volume, size, x, y}) => {
  ctx.fillStyle = 'black'

  if (volume <= 0.4) {
  ctx.beginPath();
  ctx.fillStyle = 'black';
  ctx.ellipse(x, y, size - size*volume , size * volume, 0, 0, 2 * Math.PI);
  ctx.closePath();
  } else {
    ctx.beginPath();
    ctx.arc(x,y, volume * size, 0, 2 * Math.PI)
    ctx.closePath();
  }

  ctx.fill();
}

const cheek = ({ctx, volume, width, x, y, color}) => {
  ctx.beginPath();
  ctx.fillStyle = color;
  ctx.fillRect(x,y, width, volume)
  ctx.fill();
  ctx.closePath();
}

const eye = ({ctx, crownVolume, pupilVolume, x, y, size, pattern}) => {
  if (crownVolume <= 0.2) {
    crownVolume = 0.2
  }
  ctx.beginPath();
  ctx.arc(x, y, crownVolume * size/2, 0, 2 * Math.PI)
  // ctx.stroke();
  ctx.fillStyle = 'white'
  ctx.fill();
  ctx.closePath();

  if (pupilVolume <= 0.2) {
    pupilVolume = 0.2
  }
  ctx.beginPath();
  ctx.arc(x, y, pupilVolume * size/6, 0, 2 * Math.PI)
  ctx.fillStyle = 'black'
  ctx.fill();
  ctx.closePath();
  cheek({ctx: ctx, volume: -(crownVolume * size)/2, width: size, x: x-size/2, y: y + size/2, color: pattern})
  cheek({ctx: ctx, volume: (crownVolume * size)/2, width:  size, x: x-size/2, y: y - size/2, color: pattern})

}

const hair = ({ctx, dataArray, size, x, y}) => {
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x, y);

  const  bufferLength = dataArray.length;
  const sliceWidth = size / bufferLength;
  let wavex = x;

  for(let i = 0; i < bufferLength; i++) {
    let v = dataArray[i] * size;
    let wavey =  y - v;

    // ctx.bezierCurveTo(wavex, wavey - v/2, wavex + sliceWidth/2, wavey + v/2, wavex, wavey )
    // ctx.lineTo(wavex, wavey);
    ctx.quadraticCurveTo(wavex, y - v/2,  wavex, wavey);
    wavex += sliceWidth;
  }

  ctx.lineTo(x + size, y);
  // ctx.quadraticCurveTo(x + size/2, y + dataArray[bufferLength -1] * size/2,  x, y + dataArray[bufferLength -1] * size/bufferLength );
  ctx.lineTo(x, y);

  ctx.closePath();
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.fillStyle = 'black';
  ctx.fill()

}


export const john =({x, y, ctx, volumes, size, pattern}) => {
  volumes.forEach((volume, i) => {
    volumes[i] = volume >= 0 ? volume : 0
  })
  //body
  cheek({ctx: ctx, volume: size + volumes[0] * size/2, width: size/2, x: x - size/4 , y: y, color: 'purple'})

  //arms
  ctx.fillStyle = 'brown';
  ctx.fillRect(x - size/3 , y + size/4, size/10, size * volumes[0] + size/2)
  ctx.fillRect(x+ size/4, y + size/4, size/10, size * volumes[0] + size/2)
  ctx.fill


  //background and face
  hair({ctx, dataArray:volumes, size, x: x - size/2, y: y - size/2})
  cheek({ctx: ctx, volume: size/2 + volumes[0] * size/2, width: size, x: x - size/2 , y: y - size/2, color: pattern})
  eye({ctx: ctx, crownVolume: volumes[0], pupilVolume: volumes[1], size: size/2, x: x - size/4, y: y-size/4, pattern})
  eye({ctx: ctx, crownVolume: volumes[3], pupilVolume: volumes[4], size: size/2, x: x + size/4, y: y - size/4, pattern})
  mouth({ctx, size: size/4, volume: volumes[1], y: y, x: x})

  // shoes
  ctx.fillStyle = 'black';
  ctx.fillRect(x + size/100  , y + size + volumes[0] * size/2, size * volumes[0] + size/4, size/10 )
  ctx.fillRect(x - size/100, y + size + volumes[0] * size/2, -(size * volumes[0] + size/4), size/10)
  ctx.fill
}

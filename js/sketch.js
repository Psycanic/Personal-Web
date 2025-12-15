
const PALETTE = [
  [29, 67, 80],
  
  [70,64,67],

  [164, 57, 49],
    [70,64,67], //back to the middle color to get a smoother transition
];
//weighs of gradient segments, controls time spent in each segment -> more surface area of that color
const WEIGHTS = [3.0, 0.6, 2.0, 0.6];
let EDGES = [];

let rez1; // noise resolution
let colorBandScale;

let zoff = 0; // z offset for 3D noise

//optimization
let img; //small image to render
const RENDER_W = 220;  
const RENDER_H = 220;

//sound
let song;

//mouse tracking
let lastMousePos = null;
let mouseSpeed = 0;


function preload() {
  song = loadSound('/audio/ambience.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  img = createImage(RENDER_W, RENDER_H);
  buildStops();   
  setParams();

  userStartAudio();
  song.loop();


}

function buildStops() {
  const sum = WEIGHTS.reduce((a, b) => a + b, 0);
  EDGES = [0];
  let acc = 0;
  for (let w of WEIGHTS) {
    acc += w / sum;//proportion
    EDGES.push(acc);
  }
  EDGES[EDGES.length - 1] = 1;//prevent 0.999999 bug
}

function smoothstep(t) { return t * t * (3 - 2 * t); }

function weightedGradient(t01) {
  const N = PALETTE.length;
  let t = t01 % 1;        
  if (t < 0){ t += 1; }

  // GPTtime:"this is where i do not know how to find the right color on the weighted band"
  let s = 0;
  while (s < EDGES.length - 2 && t > EDGES[s + 1]) s++;

  let a = EDGES[s];
  let b = EDGES[s + 1];
  let localT = (b === a) ? 0 : (t - a) / (b - a);
  localT = smoothstep(localT);

  let i0 = s % N;
  let i1 = (i0 + 1) % N;   

  let c0 = PALETTE[i0];
  let c1 = PALETTE[i1];

  return [
    lerp(c0[0], c1[0], localT),
    lerp(c0[1], c1[1], localT),
    lerp(c0[2], c1[2], localT),
  ];
}


function mapping(x) { 
  return x - Math.floor(x);
}

function setParams() {
  rez1 = 0.0007;
  colorBandScale   = 20;
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function calcMouseSpeed(){
    var currentMousePos = createVector(mouseX, mouseY);
    if (currentMousePos !== null && lastMousePos !== null){
      mouseSpeed = p5.Vector.sub(currentMousePos, lastMousePos).mag();
    }else{
      mouseSpeed = 0;
    }
    lastMousePos = currentMousePos;
}
  
function mouseSound(){
    calcMouseSpeed();
    let pitch = map(mouseSpeed, 0, 50, 0, 1);
    song.rate(pitch); 

}



function draw() {

  zoff += 0.002; 

  img.loadPixels();

//scaling mouse position to small render img
  let mx = map(mouseX, 0, width, 0, RENDER_W);
  let my = map(mouseY, 0, height, 0, RENDER_H);

  const MOUSE_RADIUS = 55;    //effect range
  const MOUSE_POWER  = 0.5;  //effect force


  for (let x = 0; x < RENDER_W; x++) {
    for (let y = 0; y < RENDER_H; y++) {
        
      //gpttime: "how the hell do I make the color moves around the mouse"
      let d = dist(x, y, mx, my);
        let m = constrain(1 - d / MOUSE_RADIUS, 0, 1);
        m = smoothstep(m); 


      // GPTtime: My render size is lagging so much is there a way to optimize? Tell me the steps of thinking.
      let sx = map(x, 0, RENDER_W, 0, width);
      let sy = map(y, 0, RENDER_H, 0, height);

      //3d perlin noise
      let n1 = noise(sx * rez1, sy * rez1, zoff);

      
      let col = map(n1, 0, 1, 0, 360);
      let band = mapping(col / colorBandScale);
      let band2 = (band + m * MOUSE_POWER) % 1; 


      //interpolate color between tow color bands
      const [r, g, b] = weightedGradient(band2);



      //set pixels
      let idx = 4 * (x + y * RENDER_W);
      img.pixels[idx + 0] = r;
      img.pixels[idx + 1] = g;
      img.pixels[idx + 2] = b;
      img.pixels[idx + 3] = 255;

      
    }
  }

  img.updatePixels();

  // resize
  image(img, 0, 0, width, height);

  mouseSound();

}


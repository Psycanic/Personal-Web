
const PALETTE = [
  [29, 67, 80],
  
  [70,64,67],

  [164, 57, 49],
    [70,64,67],
];

// 4 段过渡：0->1, 1->2, 2->3, 3->4
// 数字越大：这一段占的“时间/面积”越多（出现更久）
const WEIGHTS = [3.0, 0.6, 2.0, 0.6];
// 段分别是：0->1, 1->2, 2->3, 3->4, 4->0（最后一段就是接回去）


let STOPS = []; // 累积分段边界 0~1



let rez1, sF;

let simplePattern = false;

let zoff = 0;          // 时间轴
let img;               // 小分辨率画布
const RENDER_W = 220;  // 越小越快，越大越清晰
const RENDER_H = 220;

let song;

function preload() {
  song = loadSound('/audio/ambience.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  img = createImage(RENDER_W, RENDER_H);

  buildStops();     // <—— 加这一句
  
  randomizeParams();


}

function buildStops() {
  const sum = WEIGHTS.reduce((a, b) => a + b, 0);
  STOPS = [0];
  let acc = 0;
  for (let w of WEIGHTS) {
    acc += w / sum;
    STOPS.push(acc);
  }
  STOPS[STOPS.length - 1] = 1; // 防浮点误差
}

function smoothstep(t) { return t * t * (3 - 2 * t); }

function weightedGradient(t01) {
  const N = PALETTE.length;
  let t = t01 % 1;          // 确保在 [0,1)
  if (t < 0) t += 1;

  // 找到 t 落在哪段
  let s = 0;
  while (s < STOPS.length - 2 && t > STOPS[s + 1]) s++;

  let a = STOPS[s];
  let b = STOPS[s + 1];
  let localT = (b === a) ? 0 : (t - a) / (b - a);
  localT = smoothstep(localT);

  let i0 = s % N;
  let i1 = (i0 + 1) % N;    // ✅ 关键：最后一个会接回 0

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

function randomizeParams() {//这改成常量了！！！记得改function名字
  rez1 = 0.0007;
  //   rez2 = 0.00035;
  sF   = 20;
}


function smoothstep(t) { return t * t * (3 - 2 * t); }

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  

  zoff += 0.002; // 动起来的速度（0.005~0.03 都可以试试）

  img.loadPixels();

//鼠标影响颜色
  let mx = map(mouseX, 0, width, 0, RENDER_W);
  let my = map(mouseY, 0, height, 0, RENDER_H);

  const MOUSE_RADIUS = 55;    // 鼠标影响范围（越大影响越广）
  const MOUSE_POWER  = 0.5;  // 效果强度（后面会用）


  for (let x = 0; x < RENDER_W; x++) {
    for (let y = 0; y < RENDER_H; y++) {
        let d = dist(x, y, mx, my);
        let m = constrain(1 - d / MOUSE_RADIUS, 0, 1);
        m = smoothstep(m); // 让影响更柔


      // 把小图坐标映射到“原本的空间尺度”
      let sx = map(x, 0, RENDER_W, 0, width);
      let sy = map(y, 0, RENDER_H, 0, height);

      // 3D noise：第三个参数就是时间 zoff
      //   let n1 = noise(sx * rez1, sy * rez1, zoff);


      let n1 = noise(sx * rez1, sy * rez1, zoff);

      //鼠标影响
      let col = map(n1, 0, 1, 0, 360);


      let band = mapping(col / sF);
      let band2 = (band + m * MOUSE_POWER) % 1; // 鼠标附近沿着渐变环偏移


      // 渐变：在相邻两色之间插值
      //   const [r, g, b] = weightedGradient(band);
      const [r, g, b] = weightedGradient(band2);



      // 写进像素数组
      let idx = 4 * (x + y * RENDER_W);
      img.pixels[idx + 0] = r;
      img.pixels[idx + 1] = g;
      img.pixels[idx + 2] = b;
      img.pixels[idx + 3] = 255;

      
    }
  }

  img.updatePixels();

  // 放大显示
  image(img, 0, 0, width, height);

  


}


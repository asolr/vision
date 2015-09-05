var videoc = Object;
var audioc = Object;

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL || window.msURL || window.mozURL;

// Setup the Video Stream works with Firefox and Chrome ONLY
function Stream() {
  var constraints = {video: true, audio: true};
  navigator.getUserMedia(constraints, (function(stream)
  {
    PlayVideo(stream);
  }),
  (function(err) {
    console.log("The following error occured: " + err.name);
  }));
}

// play the <video>
function PlayVideo(stream) {
  video = document.querySelector('video');
  video.src = window.URL.createObjectURL(stream);
  video.onloadedmetadata = function(e) {
    video.play();
  }
  CanvasVideo(video);
}

// write a video image to the <canvas>
function CanvasVideo(video) {
  var delay = 0; // ms
  videoc = new Canvas(document.getElementById("videocanvas"));
  var timer = setInterval(function()
  {
    // video is a canvas context
    videoc.drawImage(video, 0, 0, video.width, video.height);
    var image = videoc.getImageData(0,0,video.width,video.height);
    image = DSP(image);
    videoc.putImageData(image,0,0);
    //CanvasOverlay();
  }, delay);
}

function CanvasOverlay () {
  videoc.circle([Math.random()*640,Math.random()*480], 30);
  videoc.square([Math.random()*640,Math.random()*480], 30);
}

function DSP(image) {
  //image = DSP.brightness(image, 100);
  //image = DSP.threshold(image, 100);
  image = DSP.sobel(image);
  //image = DSP.laplace(image);
  //image = DSP.sharpen(image);
  return image;
}

// Loop through the image, turning them grayscale
// The human eye is bad at seeing red and blue, so we de-emphasize them.
//    var v = 0.2126*r + 0.7152*g + 0.0722*b;
//    d[i] = d[i+1] = d[i+2] = v
DSP.grayscale = function(image)
{
  var d = image.data;
  for(var i = 0; i < d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    var brightness = (3*r+4*g+b)>>>3;
    d[i] = brightness;
    d[i+1] = brightness;
    d[i+2] = brightness;
  }
  image.data = d;
  return image;
}

DSP.threshold = function(image, threshold)
{
  var d = image.data;
  for (var i=0; i<d.length; i+=4) {
    var r = d[i];
    var g = d[i+1];
    var b = d[i+2];
    var v = (0.2126*r + 0.7152*g + 0.0722*b >= threshold) ? 255 : 0;
    d[i] = d[i+1] = d[i+2] = v
  }
  return image;
};

DSP.brightness = function(image, adjustment) {
  var d = image.data;
  for (var i=0; i<d.length; i+=4) {
    d[i] += adjustment;
    d[i+1] += adjustment;
    d[i+2] += adjustment;
  }
  return image;
};

// TODO: http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
DSP.convolute = function(image, weights, opaque)
{
  var side = Math.round(Math.sqrt(weights.length));
  var halfSide = Math.floor(side/2);

  var src = image.data;
  var sw = image.width;
  var sh = image.height;

  var w = sw;
  var h = sh;
  var output = {
    width: w, height: h, data: new Float32Array(w*h*4)
  };
  var dst = output.data;

  var alphaFac = opaque ? 1 : 0;

  for (var y=0; y<h; y++) {
    for (var x=0; x<w; x++) {
      var sy = y;
      var sx = x;
      var dstOff = (y*w+x)*4;
      var r=0, g=0, b=0, a=0;
      for (var cy=0; cy<side; cy++) {
        for (var cx=0; cx<side; cx++) {
          var scy = Math.min(sh-1, Math.max(0, sy + cy - halfSide));
          var scx = Math.min(sw-1, Math.max(0, sx + cx - halfSide));
          var srcOff = (scy*sw+scx)*4;
          var wt = weights[cy*side+cx];
          r += src[srcOff] * wt;
          g += src[srcOff+1] * wt;
          b += src[srcOff+2] * wt;
          a += src[srcOff+3] * wt;
        }
      }
      dst[dstOff] = r;
      dst[dstOff+1] = g;
      dst[dstOff+2] = b;
      dst[dstOff+3] = a + alphaFac*(255-a);
    }
  }
  return output;
};

DSP.sharpen = function(image)
{
  DSP.convolute(image,[ 0, -1,  0, -1,  5, -1, 0, -1,  0]);
}

DSP.laplace = function(image)
{
  DSP.convolute(image,[0,1,0,1,-4,1,0,1,0]);
}

// TODO: http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
DSP.sobel = function(image)
{
  image = DSP.grayscale(image);
  var vertical = DSP.convolute(image, [-1,-2,-1, 0, 0, 0, 1, 2, 1]);
  var horizontal = DSP.convolute(image, [-1,0,1,-2,0,2,-1,0,1]);
  var id = videoc.context.createImageData(vertical.width, vertical.height);
  for (var i=0; i<id.data.length; i+=4) {
    var v = Math.abs(vertical.data[i]);
    id.data[i] = v;
    var h = Math.abs(horizontal.data[i]);
    id.data[i+1] = h
    id.data[i+2] = (v+h)/4;
    id.data[i+3] = 255;
  }
  return id;
}

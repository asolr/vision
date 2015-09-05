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
    CanvasOverlay();
  }, delay);
}

function CanvasOverlay () {
  videoc.circle([Math.random()*640,Math.random()*480], 30);
  videoc.square([Math.random()*640,Math.random()*480], 30);
}

function DSP(image) {
  return DSP.threshold(image, 100);
}

// Loop through the pixels, turning them grayscale
// The human eye is bad at seeing red and blue, so we de-emphasize them.
//    var v = 0.2126*r + 0.7152*g + 0.0722*b;
//    d[i] = d[i+1] = d[i+2] = v
DSP.grayscale = function(image)
{
  var d = image.data;
  for(var i = 0; i < data.length; i+=4) {
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

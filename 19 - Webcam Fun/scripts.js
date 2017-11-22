const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');


function getVideo() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false }) //returns a promise
    .then(localMediaStream => {
      video.src = window.URL.createObjectURL(localMediaStream);
      video.play()
    })
    .catch(err => {
      console.error("Accept the webcam pls.", err);
    });
}


function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    // take the pixels out
    let pixels= ctx.getImageData(0, 0, width, height);
    // alter them
    // pixels = redEffect(pixels);
    // pixels = rgbSplit(pixels);
    // ctx.globalAlpha = 0.1;

    pixels = greenScreen(pixels);
    // put the pixels back
    ctx.putImageData(pixels, 0, 0);
  }, 40);
}

function takePhoto() {
  // play the sound
  snap.currentTime = 0;
  snap.play();

  // take the data out of the canvas
  const data = canvas.toDataURL('image/jpeg');
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'handsome');
  link.innerHTML = `<image src="${data}" alt="Handsome man" />`;
  strip.insertBefore(link, strip.firstChild);

}

function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out
      pixels.data[i + 3] = 0; // transparency
    }
  }

  return pixels;
}

function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i + 0];// red
    pixels.data[i + 100] = pixels.data[i + 1]; // green
    pixels.data[i - 150] = pixels.data[i + 2]; // blue
    // pixels.data[i + 3] = pixels.data[i] + 100; // alpha
  }
  return pixels;
}

function redEffect(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i] = pixels.data[i] + 100;// red
    pixels.data[i + 1] = pixels.data[i] - 100; // green
    pixels.data[i + 2] = pixels.data[i] + 100; // blue
    // pixels.data[i + 3] = pixels.data[i] + 100; // alpha
  }
  return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);

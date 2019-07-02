import KAMPOS from 'kampos/src/index';
import transparentVideo from './transparent-video';

const {Kampos} = KAMPOS;
const target = document.querySelector('#target');
const media = document.querySelector('#video');
const body = document.body;
const fx = [transparentVideo()];
const kampos = new Kampos({target, effects: fx});

const MAX_WIDTH = 854;
let fxEnabled = true;

const fxToggle = document.querySelector('#fx-toggle');
const backgroundInput = document.querySelector('#background-color');
const videoInput = document.querySelector('#video-src');
const videoGo = document.querySelector('#video-go');

function play () {
    const width = Math.min(MAX_WIDTH, media.videoWidth);
    const height = media.videoHeight / 2 / media.videoWidth * width;

    kampos.setSource({media, width, height});

    kampos.play();

    (fxEnabled ? target : media).classList.remove('hide');
}

function changeSrc (src) {
    kampos.stop();

    (fxEnabled ? target : media).classList.add('hide');

    media.src = src;

    media.addEventListener('playing', play, {once: true});
}

media.addEventListener('playing', play, {once: true});

fxToggle.addEventListener('change', e => {
    fxEnabled = e.target.checked;

    media.classList.toggle('hide', fxEnabled);
    target.classList.toggle('hide', !fxEnabled);
});

backgroundInput.addEventListener('change', e => {
    document.body.style.backgroundColor = e.target.value;
});

videoGo.addEventListener('click', () => {
    changeSrc(videoInput.value);
});

function drop (e) {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    const url = URL.createObjectURL(file);
    changeSrc(url);

    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 0);
}


body.addEventListener('dragenter', e => e.preventDefault(), false);
body.addEventListener('dragover', e => e.preventDefault(), false);
body.addEventListener('drop', drop, false);

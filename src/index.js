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
const videoSection = document.querySelector('#video-sec');
const urlInput = document.querySelector('#video-src');
const fileInput = document.querySelector('#file-src');
const videoGo = document.querySelector('#video-go');
const playButton = document.querySelector('#play-button');

function draw () {
    const width = Math.min(MAX_WIDTH, media.videoWidth);
    const height = media.videoHeight / 2 / media.videoWidth * width;

    kampos.setSource({media, width, height});

    kampos.draw();
}

function play () {
    media.play();

    const width = Math.min(MAX_WIDTH, media.videoWidth);
    const height = media.videoHeight / 2 / media.videoWidth * width;

    kampos.setSource({media, width, height});

    kampos.play();

    videoSection.classList.add('pausable');
    videoSection.addEventListener('click', videoPause, {once: true});

    (fxEnabled ? target : media).classList.remove('hide');
}

function togglePlay (show) {
    playButton.classList.toggle('hide', !show);
}

function canPlay () {
    togglePlay(true);
    draw();
}

function videoPause () {
    if (!media.paused) {
        videoSection.classList.remove('pausable');
        media.pause();
        kampos.stop();
        togglePlay(true);
    }
}

function changeSrc (src, ext, cb) {
    kampos.stop();

    (fxEnabled ? target : media).classList.add('hide');

    media.firstElementChild.setAttribute('src', src);

    let type = 'video/';

    switch (ext) {
        case 'mov':
            type += 'quicktime';
            break;
        case 'mp4':
        default:
            type += ext;
    }

    media.firstElementChild.setAttribute('type', type);

    media.load();

    media.addEventListener('canplay', canPlay, {once: true});

    if (cb) {
        media.addEventListener('canplaythrough', cb, {once: true});
    }
}

media.addEventListener('canplay', canPlay, {once: true});

playButton.addEventListener('click', (e) => {
    e.stopPropagation();
    play();
    togglePlay(false);
});

fxToggle.addEventListener('change', e => {
    fxEnabled = e.target.checked;

    media.classList.toggle('hide', fxEnabled);
    target.classList.toggle('hide', !fxEnabled);
});

backgroundInput.addEventListener('change', e => {
    document.body.style.backgroundColor = e.target.value;
});

fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);

    changeSrc(url, file.name.split('.').reverse()[0], () => {
        URL.revokeObjectURL(url);
    });
});

videoGo.addEventListener('click', () => {
    changeSrc(urlInput.value, urlInput.value.split('.').reverse()[0]);
});

function drop (e) {
    e.preventDefault();

    const file = e.dataTransfer.files[0];
    const url = URL.createObjectURL(file);

    changeSrc(url, file.name.split('.').reverse()[0], () => {
        URL.revokeObjectURL(url);
    });
}

body.addEventListener('dragenter', e => e.preventDefault(), false);
body.addEventListener('dragover', e => e.preventDefault(), false);
body.addEventListener('drop', drop, false);

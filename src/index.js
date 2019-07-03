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
const urlInput = document.querySelector('#video-src');
const fileInput = document.querySelector('#file-src');
const videoGo = document.querySelector('#video-go');

function play () {
    media.play();

    const width = Math.min(MAX_WIDTH, media.videoWidth);
    const height = media.videoHeight / 2 / media.videoWidth * width;

    kampos.setSource({media, width, height});

    kampos.play();

    (fxEnabled ? target : media).classList.remove('hide');
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

    media.addEventListener('canplay', play, {once: true});

    if (cb) {
        media.addEventListener('canplaythrough', cb, {once: true});
    }
}

media.addEventListener('canplay', play, {once: true});

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

    changeSrc(url, file.name.split('.')[1], () => {
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

    changeSrc(url, file.name.split('.')[1], () => {
        URL.revokeObjectURL(url);
    });
}


body.addEventListener('dragenter', e => e.preventDefault(), false);
body.addEventListener('dragover', e => e.preventDefault(), false);
body.addEventListener('drop', drop, false);

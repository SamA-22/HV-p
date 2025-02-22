module(HVP)
import mergeImages from 'merge-images';

console.log('running');
let images = Array.from(document.querySelectorAll("img"));
for(var i = 0; i < images.length; i++) {
    mergeImages([
        {src: '{images[i].src}' },
        {src: 'hasbulla.jpeg' }
    ]).then(b64 => document.images[i].src = b64);
}
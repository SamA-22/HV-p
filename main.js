const myImageUrl = chrome.runtime.getURL('hasbulla.png');
const images = document.querySelectorAll('img');
images.forEach(img => {
  img.src = myImageUrl;
  console.log(img.src)
});
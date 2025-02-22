const myImageUrl = chrome.runtime.getURL('hasbulla.png');

function updateImages() {
    const images = document.querySelectorAll('img');
    const observer = new IntersectionObserver((entires) =>
        {
            entires.forEach(entry => {
                if (entry.isIntersecting){
                    const image = entry.target;
                    image.src = myImageUrl;
                    observer.unobserve(image);
                }
            });
        });
    document.querySelectorAll('img').forEach(image => {
        observer.observe(image)
    });
        
}


updateImages();

const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length) {
      updateImages();
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });
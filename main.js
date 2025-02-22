const myImageUrl = chrome.runtime.getURL('hasbulla.png');

function updateImages() {
  // Create an IntersectionObserver to replace images as soon as they come into view.
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target;
        image.src = myImageUrl;
        imageObserver.unobserve(image);
      }
    });
  });
  
  // Observe each <img> element on the page.
  document.querySelectorAll('img').forEach(image => {
    imageObserver.observe(image);
  });
}

// Ensure updateImages runs once the DOM is ready.
if (document.body) {
  updateImages();
} else {
  document.addEventListener('DOMContentLoaded', updateImages);
}

// Set up a MutationObserver to detect new images added to the DOM.
const mutationObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        updateImages();
      }
    });
  });
});

// Wait until the DOM is ready before observing document.body.
if (document.body) {
  mutationObserver.observe(document.body, { childList: true, subtree: true });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  });
}
const myImageUrl = chrome.runtime.getURL('hasbulla.png');

import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

let model = null;

// Initialize the model
async function initializeModel() {
    try {
        console.log('Starting to load model...');
        model = await mobilenet.load();
        console.log('✅ Model loaded successfully');
    } catch (error) {
        console.error('❌ Error loading model:', error);
    }
}

// Initialize the model when the script loads
console.log('Script starting...');
initializeModel().catch(err => console.error('Initial model load failed:', err));

const dogLabels = new Set([
    'dog', 'puppy', 'hound', 'terrier', 'retriever', 'shepherd',
    'poodle', 'husky', 'beagle', 'bulldog', 'collie'
]);

async function createSecureImage(originalImage) {
    return new Promise((resolve, reject) => {
        // Create a new image element
        const secureImage = new Image();
        secureImage.crossOrigin = "anonymous";
        
        secureImage.onload = () => {
            // Create a canvas to draw the image
            const canvas = document.createElement('canvas');
            canvas.width = secureImage.width;
            canvas.height = secureImage.height;
            
            // Draw the image on the canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(secureImage, 0, 0);
            
            resolve(canvas);
        };
        
        secureImage.onerror = () => {
            // If loading with CORS fails, try without it
            console.log('CORS failed, trying direct load');
            resolve(originalImage);
        };
        
        // Try to load the image with CORS
        try {
            // Add a cache-busting parameter to bypass cached non-CORS versions
            const corsUrl = new URL(originalImage.src);
            corsUrl.searchParams.set('cors', Date.now());
            secureImage.src = corsUrl.href;
        } catch (e) {
            // If URL parsing fails, try direct src
            secureImage.src = originalImage.src;
        }
    });
}

async function isDogImage(imageElement) {
    try {
        // Make sure the model is loaded
        if (!model) {
            console.log('Model not loaded yet');
            return false;
        }

        // Make sure the image is loaded and valid
        if (!imageElement.complete || !imageElement.naturalWidth) {
            await new Promise(resolve => {
                imageElement.onload = resolve;
                imageElement.onerror = () => resolve(false);
            });
        }

        // Skip broken or tiny images
        if (!imageElement.naturalWidth || imageElement.naturalWidth < 24) {
            return false;
        }

        // Create a secure version of the image
        const secureImage = await createSecureImage(imageElement);
        
        // Get predictions
        const predictions = await model.classify(secureImage);
        console.log('Predictions for image:', predictions);
        
        // Check if any of the top predictions contain dog-related labels
        const isDog = predictions.some(prediction => 
            Array.from(dogLabels).some(dogLabel => 
                prediction.className.toLowerCase().includes(dogLabel)
            )
        );

        console.log('Is this a dog?', isDog);
        return isDog;

    } catch (error) {
        console.error('Error detecting dog image:', error);
        return false;
    }
}

async function processImage(image) {
    if (!image.dataset.processed) {
        image.dataset.processed = 'true';
        const originalSrc = image.src;

        try {
            const isDog = await isDogImage(image);
            if (isDog) {
                console.log('Dog detected - replacing image');
                image.src = myImageUrl;
                image.srcset = '';
            }
        } catch (error) {
            console.error('Error processing image:', error);
            image.src = originalSrc;
        }
    }
}

function updateImages() {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const image = entry.target;
                processImage(image);
                imageObserver.unobserve(image);
            }
        });
    });
    
    document.querySelectorAll('img').forEach(image => {
        if (!image.dataset.processed) {
            imageObserver.observe(image);
        }
    });
}

// Initialize observers when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateImages();
        const mutationObserver = new MutationObserver(() => updateImages());
        mutationObserver.observe(document.body, { childList: true, subtree: true });
    });
} else {
    updateImages();
    const mutationObserver = new MutationObserver(() => updateImages());
    mutationObserver.observe(document.body, { childList: true, subtree: true });
}
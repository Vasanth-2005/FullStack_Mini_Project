document.addEventListener('DOMContentLoaded', () => {
    // Advanced aesthetic AI medical backgrounds dynamically generated previously
    // The exact exact filenames might vary by timestamp, but they all start with bgX_
    // Since we copied them over to public/images/, we can dynamically fetch their exact names via an API, 
    // OR we can just rely on the fact that we can rename them properly in the copy script!
    // We will rename them to bg1.png, bg2.png ... bg10.png during copy.
    
    const IMAGES_COUNT = 10;
    const bgImages = [];
    for(let i=1; i<=IMAGES_COUNT; i++) {
        bgImages.push(`images/bg${i}.png`);
    }

    // Create the global persistent background container
    const sliderContainer = document.createElement('div');
    sliderContainer.id = 'global-bg-slider';
    sliderContainer.style.position = 'fixed';
    sliderContainer.style.top = '0';
    sliderContainer.style.left = '0';
    sliderContainer.style.width = '100vw';
    sliderContainer.style.height = '100vh';
    sliderContainer.style.zIndex = '-9999';
    sliderContainer.style.pointerEvents = 'none'; // Prevent interaction
    sliderContainer.style.backgroundSize = 'cover';
    sliderContainer.style.backgroundPosition = 'center';
    sliderContainer.style.transition = 'background-image 3s ease-in-out, opacity 3s ease-in-out';
    // Overlay a dark filter so it fits the "dark mode hospital" premium theme cleanly
    sliderContainer.style.boxShadow = 'inset 0 0 0 2000px rgba(15, 23, 42, 0.85)';
    sliderContainer.style.backgroundColor = '#0f172a';

    document.body.prepend(sliderContainer);
    
    // Crucial: Make the native solid body background invisible so the majestic AI Art slider can be seen underneath!
    document.body.style.backgroundColor = 'transparent';
    document.body.style.backgroundImage = 'none';

    // Preload
    let currentIndex = 0;
    function changeBackground() {
        sliderContainer.style.opacity = '70%'; // dim slightly during transition heartbeat
        
        setTimeout(() => {
            sliderContainer.style.backgroundImage = `url('${bgImages[currentIndex]}')`;
            sliderContainer.style.opacity = '100%';
            currentIndex = (currentIndex + 1) % IMAGES_COUNT;
        }, 1000); // Wait 1s mid-transition 
    }

    // Initial load
    changeBackground();

    // Change exactly every 15 seconds
    setInterval(changeBackground, 15000);
});

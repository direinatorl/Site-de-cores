    // Screens
    const preLanding = document.getElementById('pre-landing');
    const landingPage = document.getElementById('landing-page');
    const mainApp = document.getElementById('main-app');

    // Intro Controls
    const btnStart = document.getElementById('btn-start');
    const landingFileInput = document.getElementById('landing-file-input');
    const landingDropZone = document.getElementById('landing-drop-zone');

    // App Controls
    const btnHome = document.getElementById('btn-home');
    const btnCopyAll = document.getElementById('btn-copy-all');
    const btnNewPalette = document.getElementById('btn-new-palette');
    const btnChangeImage = document.getElementById('btn-change-image');

    const paletteContainer = document.getElementById('palette-container');
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const imagePreview = document.getElementById('image-preview');
    const extractedColorsContainer = document.getElementById('extracted-colors');
    const canvas = document.getElementById('color-canvas');
    const ctx = canvas.getContext('2d');

    let currentPalette = [];
    let isAppActive = false;

    // --- Screen Transitions ---

    function showMainApp() {
        landingPage.classList.add('hidden');
        mainApp.classList.remove('hidden');
        setTimeout(() => {
            mainApp.classList.add('visible');
            isAppActive = true;
            if (currentPalette.length === 0) createPalette();
        }, 50);
    }

    function showLanding() {
        mainApp.classList.remove('visible');
        setTimeout(() => {
            mainApp.classList.add('hidden');
            landingPage.classList.remove('hidden');
            isAppActive = false;
        }, 800);
    }

    // --- Core Functionality ---

    function generateRandomHex() {
        const chars = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += chars[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function createPalette() {
        paletteContainer.innerHTML = '';
        currentPalette = [];

        for (let i = 0; i < 5; i++) {
            const color = generateRandomHex();
            currentPalette.push(color);

            const card = document.createElement('div');
            card.className = 'color-card animate-in';
            card.style.backgroundColor = color;
            card.style.animationDelay = `${i * 0.1}s`;
            
            const brightness = getBrightness(color);
            const textColor = brightness > 128 ? '#000' : '#fff';

            card.innerHTML = `
                <div class="copy-notice" style="color: ${textColor}">Copiado!</div>
                <div class="hex" style="color: ${textColor}">${color}</div>
            `;

            card.onclick = () => copyToClipboard(color, card);
            paletteContainer.appendChild(card);
        }
    }

    function getBrightness(hex) {
        const rgb = hexToRgb(hex);
        if (!rgb) return 0;
        return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    }

    function copyToClipboard(text, element) {
        navigator.clipboard.writeText(text).then(() => {
            if (element) {
                element.classList.add('copied');
                setTimeout(() => element.classList.remove('copied'), 1500);
            }
        });
    }

    function copyAllPalette() {
        const text = currentPalette.join(', ');
        copyToClipboard(text);
        alert('Toda a paleta foi copiada para a área de transferência!');
    }

    // --- Event Listeners ---

    window.onkeydown = (e) => {
        if (isAppActive && e.code === 'Space') {
            e.preventDefault();
            createPalette();
        }
    };

    function hideIntro() {
        preLanding.classList.add('fade-out');
        setTimeout(() => {
            preLanding.style.display = 'none';
        }, 1000);
    }

    btnStart.onclick = () => {
        hideIntro();
        landingPage.classList.remove('hidden');
    };

    btnExamples.onclick = showMainApp;
    btnHome.onclick = showLanding;
    btnCopyAll.onclick = copyAllPalette;
    btnNewPalette.onclick = createPalette;

    // Landing Upload
    landingDropZone.onclick = () => landingFileInput.click();
    landingFileInput.onchange = (e) => {
        handleImage(e.target.files[0]);
        showMainApp();
    };

    landingDropZone.ondragover = (e) => {
        e.preventDefault();
        landingDropZone.style.borderColor = "#6366f1";
    };

    landingDropZone.ondragleave = () => {
        landingDropZone.style.borderColor = "";
    };

    landingDropZone.ondrop = (e) => {
        e.preventDefault();
        handleImage(e.dataTransfer.files[0]);
        showMainApp();
    };

    // App Image Change
    btnChangeImage.onclick = () => fileInput.click();
    fileInput.onchange = (e) => handleImage(e.target.files[0]);

    function handleImage(file) {
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            
            const img = new Image();
            img.onload = () => extractColors(img);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function extractColors(img) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colors = [];
        
        for (let i = 0; i < 8; i++) {
            const x = Math.floor(Math.random() * canvas.width);
            const y = Math.floor(Math.random() * canvas.height);
            const offset = (y * canvas.width + x) * 4;
            
            const r = imageData[offset];
            const g = imageData[offset + 1];
            const b = imageData[offset + 2];
            colors.push(rgbToHex(r, g, b));
        }

        renderExtractedColors(colors);
    }

    function renderExtractedColors(colors) {
        extractedColorsContainer.innerHTML = '';
        colors.forEach(color => {
            const div = document.createElement('div');
            div.className = 'extracted-color';
            div.style.backgroundColor = color;
            div.title = `Clique para copiar: ${color}`;
            div.onclick = () => {
                copyToClipboard(color);
                alert(`Cor ${color} copiada!`);
            };
            extractedColorsContainer.appendChild(div);
        });
    }

    // Initial extraction
    if (imagePreview.complete) {
        extractColors(imagePreview);
    } else {
        imagePreview.onload = () => extractColors(imagePreview);
    }
});

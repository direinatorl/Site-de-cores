document.addEventListener('DOMContentLoaded', () => {
    // Stages
    const stage1 = document.getElementById('stage-1');
    const stage2 = document.getElementById('stage-2');
    const stage3 = document.getElementById('stage-3');

    // Controls Stage 1
    const btnStart = document.getElementById('btn-start');

    // Controls Stage 2
    const btnNewPalette = document.getElementById('btn-new-palette');
    const btnCopyAll = document.getElementById('btn-copy-all');
    const btnNextToImage = document.getElementById('btn-next-to-image');

    // Controls Stage 3
    const btnBackToGen = document.getElementById('btn-back-to-gen');
    const btnChangeImage = document.getElementById('btn-change-image');
    const fileInput = document.getElementById('file-input');
    const imagePreview = document.getElementById('image-preview');
    const extractedColorsContainer = document.getElementById('extracted-colors');

    // Shared
    const paletteContainer = document.getElementById('palette-container');
    const canvas = document.getElementById('color-canvas');
    const ctx = canvas.getContext('2d');

    let currentPalette = [];
    let currentStage = 1;

    // --- Navigation Logic ---

    function goToStage(stageNum) {
        // Hide all stages
        [stage1, stage2, stage3].forEach(s => {
            s.classList.add('hidden');
            s.classList.remove('active');
        });

        // Show target stage
        const target = document.getElementById(`stage-${stageNum}`);
        target.classList.remove('hidden');
        setTimeout(() => target.classList.add('active'), 50);

        currentStage = stageNum;

        // Initialize stage specific logic
        if (stageNum === 2 && currentPalette.length === 0) {
            createPalette();
        }
        if (stageNum === 3) {
            extractColors(imagePreview);
        }
    }

    function hideIntro() {
        stage1.classList.add('fade-out');
        setTimeout(() => {
            goToStage(2);
            // Extra layer of protection: ensure Stage 1 is dead to the user
            stage1.style.pointerEvents = 'none';
        }, 1000);
    }

    // --- Stage 1: Intro / Auto Timer ---

    function startAutoTimer() {
        stage1.classList.add('active');
        const autoTimer = setTimeout(() => {
            if (currentStage === 1) {
                hideIntro();
            }
        }, 10000);

        btnStart.addEventListener('click', () => {
            clearTimeout(autoTimer);
            hideIntro();
        });
    }

    // --- Stage 2: Palette Generator ---

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

    // --- Stage 3: Image Logic ---

    function handleImage(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            const img = new Image();
            img.onload = () => extractColors(img);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function extractColors(img) {
        if (!img.complete) return;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colors = [];
        for (let i = 0; i < 8; i++) {
            const x = Math.floor(Math.random() * canvas.width);
            const y = Math.floor(Math.random() * canvas.height);
            const offset = (y * canvas.width + x) * 4;
            colors.push(rgbToHex(imageData[offset], imageData[offset+1], imageData[offset+2]));
        }
        renderExtractedColors(colors);
    }

    function renderExtractedColors(colors) {
        extractedColorsContainer.innerHTML = '';
        colors.forEach(color => {
            const div = document.createElement('div');
            div.className = 'extracted-color';
            div.style.backgroundColor = color;
            div.onclick = () => {
                copyToClipboard(color);
                alert(`Cor ${color} copiada!`);
            };
            extractedColorsContainer.appendChild(div);
        });
    }

    // --- Event Listeners ---

    window.onkeydown = (e) => {
        if (currentStage === 2 && e.code === 'Space') {
            e.preventDefault();
            createPalette();
        }
    };

    btnNewPalette.onclick = createPalette;
    btnCopyAll.onclick = () => {
        copyToClipboard(currentPalette.join(', '));
        alert('Paleta copiada!');
    }

    btnNextToImage.onclick = () => goToStage(3);
    btnBackToGen.onclick = () => goToStage(2);
    btnChangeImage.onclick = () => fileInput.click();
    fileInput.onchange = (e) => handleImage(e.target.files[0]);

    // Init
    startAutoTimer();
});

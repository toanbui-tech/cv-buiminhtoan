// Color Extractor for CV Theme
class ColorExtractor {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.colors = [];
    }

    // Extract dominant colors from image
    async extractColors(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                this.ctx.drawImage(img, 0, 0);
                
                const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
                const colors = this.getDominantColors(imageData);
                resolve(colors);
            };
            
            img.onerror = reject;
            img.src = imagePath;
        });
    }

    // Get dominant colors from image data
    getDominantColors(imageData) {
        const data = imageData.data;
        const colorCounts = {};
        const step = 10; // Sample every 10th pixel for performance

        // Sample pixels
        for (let i = 0; i < data.length; i += 4 * step) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // Skip transparent pixels
            if (a < 128) continue;

            // Skip very dark or very light colors
            const brightness = (r + g + b) / 3;
            if (brightness < 30 || brightness > 225) continue;

            const color = this.rgbToHex(r, g, b);
            colorCounts[color] = (colorCounts[color] || 0) + 1;
        }

        // Sort colors by frequency and get top colors
        const sortedColors = Object.entries(colorCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([color]) => color);

        return sortedColors;
    }

    // Convert RGB to hex
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // Generate color variations
    generateColorVariations(baseColor) {
        const variations = [];
        const rgb = this.hexToRgb(baseColor);
        
        // Create lighter and darker variations
        variations.push(this.lightenColor(rgb, 0.3)); // Light
        variations.push(baseColor); // Base
        variations.push(this.darkenColor(rgb, 0.3)); // Dark
        
        return variations;
    }

    // Convert hex to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Lighten color
    lightenColor(rgb, factor) {
        return `rgb(${Math.round(rgb.r + (255 - rgb.r) * factor)}, ${Math.round(rgb.g + (255 - rgb.g) * factor)}, ${Math.round(rgb.b + (255 - rgb.b) * factor)})`;
    }

    // Darken color
    darkenColor(rgb, factor) {
        return `rgb(${Math.round(rgb.r * (1 - factor))}, ${Math.round(rgb.g * (1 - factor))}, ${Math.round(rgb.b * (1 - factor))})`;
    }

    // Apply colors to CSS variables
    applyColorsToCSS(colors) {
        const root = document.documentElement;
        
        // Use the first 3 dominant colors
        const primaryColor = colors[0];
        const secondaryColor = colors[1] || colors[0];
        const accentColor = colors[2] || colors[1] || colors[0];

        // Update CSS variables
        root.style.setProperty('--primary-color', primaryColor);
        root.style.setProperty('--secondary-color', secondaryColor);
        root.style.setProperty('--accent-color', accentColor);

        // Update floating elements with extracted colors
        this.updateFloatingElements(colors);
    }

    // Update floating elements with extracted colors
    updateFloatingElements(colors) {
        const elements = document.querySelectorAll('.floating-element');
        
        elements.forEach((element, index) => {
            const colorIndex = index % colors.length;
            const baseColor = colors[colorIndex];
            const rgb = this.hexToRgb(baseColor);
            
            // Create gradient with variations
            const lightColor = this.lightenColor(rgb, 0.2);
            const darkColor = this.darkenColor(rgb, 0.2);
            
            element.style.background = `linear-gradient(135deg, ${lightColor}, ${darkColor})`;
            element.style.boxShadow = `0 4px 15px ${baseColor}40`; // 40 for opacity
        });
    }
}

// Initialize color extraction when page loads
document.addEventListener('DOMContentLoaded', async () => {
    const extractor = new ColorExtractor();
    
    try {
        // Extract colors from the uploaded image
        const colors = await extractor.extractColors('images/phu_yen.jpg');
        console.log('Extracted colors:', colors);
        
        // Apply colors to the CV
        extractor.applyColorsToCSS(colors);
        
        // Show extracted colors in console for debugging
        console.log('Applied colors to CV theme');
        
    } catch (error) {
        console.log('Could not extract colors from image, using default colors');
        console.error('Color extraction error:', error);
        
        // Fallback to default colors if extraction fails
        const root = document.documentElement;
        root.style.setProperty('--primary-color', '#6366f1');
        root.style.setProperty('--secondary-color', '#f59e0b');
        root.style.setProperty('--accent-color', '#10b981');
    }
});

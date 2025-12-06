/**
 * Performs Error Level Analysis (ELA) on an image file.
 * 
 * Theory:
 * 1. Load the original image.
 * 2. Re-save it as a JPEG with a specific quality (e.g., 95%).
 * 3. Calculate the absolute difference between the original pixels and the re-saved pixels.
 * 4. Amplify this difference (scale it up).
 * 5. Returns a Data URL of the resulting "heatmap" image.
 * 
 * Areas with high contrast in the ELA result often indicate recent edits,
 * as they have not yet stabilized to the image's overall compression level.
 */

export async function generateELA(file, quality = 0.95, amplification = 20) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                const width = img.width;
                const height = img.height;

                canvas.width = width;
                canvas.height = height;

                // 1. Draw Original
                ctx.drawImage(img, 0, 0, width, height);

                // Get original pixel data
                const originalData = ctx.getImageData(0, 0, width, height);

                // 2. Re-compress: Export as JPEG with lower quality
                const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

                const compressedImg = new Image();
                compressedImg.onload = () => {
                    // Clear canvas and draw compressed version to read its pixels
                    ctx.clearRect(0, 0, width, height);
                    ctx.drawImage(compressedImg, 0, 0, width, height);

                    const compressedData = ctx.getImageData(0, 0, width, height);
                    const elaData = ctx.createImageData(width, height);

                    // 3. Compare & Amplify
                    for (let i = 0; i < originalData.data.length; i += 4) {
                        // R, G, B channels
                        for (let j = 0; j < 3; j++) {
                            const diff = Math.abs(originalData.data[i + j] - compressedData.data[i + j]);
                            elaData.data[i + j] = diff * amplification; // Scale up the difference
                        }
                        // Alpha channel (keep fully opaque)
                        elaData.data[i + 3] = 255;
                    }

                    // 4. Output the result
                    ctx.putImageData(elaData, 0, 0);
                    resolve(canvas.toDataURL("image/png"));
                };

                compressedImg.src = compressedDataUrl;
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

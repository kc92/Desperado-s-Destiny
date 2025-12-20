/**
 * Image Processing Utilities
 * Background removal and image manipulation for art assets
 */

export interface RemovalOptions {
  mode: 'greenscreen' | 'darkbg' | 'lightbg' | 'color';
  tolerance?: number; // 0-255, how much color variation to allow
  targetColor?: { r: number; g: number; b: number }; // For color mode
  feather?: number; // Edge feathering pixels
}

/**
 * Remove background from an image using canvas
 * Returns a base64 PNG with transparency
 */
export async function removeBackground(
  imageData: string,
  options: RemovalOptions = { mode: 'darkbg', tolerance: 50 }
): Promise<string> {
  console.log('[removeBackground] Starting with mode:', options.mode, 'tolerance:', options.tolerance);
  console.log('[removeBackground] Image data starts with:', imageData?.substring(0, 50));

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      console.log('[removeBackground] Image loaded:', img.width, 'x', img.height);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageDataObj.data;

      const tolerance = options.tolerance ?? 50;
      let pixelsRemoved = 0;

      // Process pixels
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        let shouldRemove = false;

        switch (options.mode) {
          case 'greenscreen':
            // Remove green colors - more robust detection
            // Check if green is the dominant channel and is bright enough
            const greenDominance = g - Math.max(r, b);
            const greenRatio = g / (r + g + b + 1); // +1 to avoid division by zero

            // Multiple detection methods:
            // 1. Pure bright green (#00FF00)
            const isPureGreen = g > 180 && r < 100 + tolerance && b < 100 + tolerance;
            // 2. Green is significantly dominant and reasonably bright
            const isGreenDominant = greenDominance > (50 - tolerance/2) && g > 100;
            // 3. High green ratio (green is more than 50% of color)
            const isHighGreenRatio = greenRatio > 0.45 && g > 120;
            // 4. Lime/neon green variations
            const isLimeGreen = g > 200 && r < 200 && b < 150 && g > r && g > b;

            shouldRemove = isPureGreen || isGreenDominant || isHighGreenRatio || isLimeGreen;
            break;

          case 'darkbg':
            // Remove dark pixels (black/very dark backgrounds)
            const brightness = (r + g + b) / 3;
            shouldRemove = brightness < tolerance;
            break;

          case 'lightbg':
            // Remove light pixels (white/very light backgrounds)
            const lightness = (r + g + b) / 3;
            shouldRemove = lightness > 255 - tolerance;
            break;

          case 'color':
            // Remove specific color
            if (options.targetColor) {
              const { r: tr, g: tg, b: tb } = options.targetColor;
              const colorDiff = Math.sqrt(
                Math.pow(r - tr, 2) + Math.pow(g - tg, 2) + Math.pow(b - tb, 2)
              );
              shouldRemove = colorDiff < tolerance * 2;
            }
            break;
        }

        if (shouldRemove) {
          data[i + 3] = 0; // Set alpha to 0 (transparent)
          pixelsRemoved++;
        }
      }
      console.log('[removeBackground] Pixels removed:', pixelsRemoved, 'of', data.length / 4);

      // Apply feathering if requested
      if (options.feather && options.feather > 0) {
        applyEdgeFeathering(imageDataObj, options.feather);
      }

      // Put processed data back
      ctx.putImageData(imageDataObj, 0, 0);

      // Return as base64 PNG
      const result = canvas.toDataURL('image/png');
      console.log('[removeBackground] Result length:', result.length);
      resolve(result);
    };

    img.onerror = (e) => {
      console.error('[removeBackground] Image load error:', e);
      reject(new Error('Failed to load image'));
    };
    img.src = imageData;
  });
}

/**
 * Apply edge feathering to smooth transparency edges
 */
function applyEdgeFeathering(imageData: ImageData, radius: number): void {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  // Create a copy for reading
  const original = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = original[idx + 3];

      // Only process edge pixels (partially transparent or near transparent pixels)
      if (alpha > 0 && alpha < 255) {
        // Already semi-transparent, leave it
        continue;
      }

      if (alpha === 0) {
        // Check if near an opaque pixel
        let nearOpaque = false;
        for (let dy = -radius; dy <= radius && !nearOpaque; dy++) {
          for (let dx = -radius; dx <= radius && !nearOpaque; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = (ny * width + nx) * 4;
              if (original[nidx + 3] === 255) {
                nearOpaque = true;
              }
            }
          }
        }
        // This pixel stays transparent
      } else {
        // Opaque pixel - check if near transparent
        let minDist = radius + 1;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = (ny * width + nx) * 4;
              if (original[nidx + 3] === 0) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                minDist = Math.min(minDist, dist);
              }
            }
          }
        }

        if (minDist <= radius) {
          // Near an edge - apply feathering
          const featherAlpha = Math.round((minDist / radius) * 255);
          data[idx + 3] = featherAlpha;
        }
      }
    }
  }
}

/**
 * Auto-detect the best background removal mode based on image corners
 */
export async function detectBackgroundType(
  imageData: string
): Promise<'greenscreen' | 'darkbg' | 'lightbg' | 'unknown'> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve('unknown');
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Sample corners and edges for better detection
      const samplePoints = [
        { x: 5, y: 5 },
        { x: img.width - 5, y: 5 },
        { x: 5, y: img.height - 5 },
        { x: img.width - 5, y: img.height - 5 },
        { x: Math.floor(img.width / 2), y: 5 },
        { x: Math.floor(img.width / 2), y: img.height - 5 },
        { x: 5, y: Math.floor(img.height / 2) },
        { x: img.width - 5, y: Math.floor(img.height / 2) },
      ];

      let totalBrightness = 0;
      let greenCount = 0;

      for (const point of samplePoints) {
        const pixel = ctx.getImageData(point.x, point.y, 1, 1).data;
        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        totalBrightness += (r + g + b) / 3;

        // Check for green screen - more robust detection
        const greenDominance = g - Math.max(r, b);
        const greenRatio = g / (r + g + b + 1);

        // Multiple green detection methods
        const isPureGreen = g > 180 && r < 150 && b < 150;
        const isGreenDominant = greenDominance > 30 && g > 100;
        const isHighGreenRatio = greenRatio > 0.45 && g > 120;

        if (isPureGreen || isGreenDominant || isHighGreenRatio) {
          greenCount++;
        }
      }

      const avgBrightness = totalBrightness / samplePoints.length;
      console.log('[detectBackgroundType] Green count:', greenCount, 'Avg brightness:', avgBrightness);

      if (greenCount >= 4) {
        resolve('greenscreen');
      } else if (avgBrightness < 50) {
        resolve('darkbg');
      } else if (avgBrightness > 200) {
        resolve('lightbg');
      } else {
        resolve('unknown');
      }
    };

    img.onerror = () => resolve('unknown');
    img.src = imageData;
  });
}

/**
 * Crop image to content bounds (remove transparent padding)
 */
export async function cropToContent(
  imageData: string,
  padding: number = 0
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageDataObj.data;

      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = 0;
      let maxY = 0;

      // Find bounds of non-transparent content
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          if (data[idx + 3] > 0) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      // Add padding
      minX = Math.max(0, minX - padding);
      minY = Math.max(0, minY - padding);
      maxX = Math.min(canvas.width - 1, maxX + padding);
      maxY = Math.min(canvas.height - 1, maxY + padding);

      const cropWidth = maxX - minX + 1;
      const cropHeight = maxY - minY + 1;

      // Create cropped canvas
      const croppedCanvas = document.createElement('canvas');
      const croppedCtx = croppedCanvas.getContext('2d');

      if (!croppedCtx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      croppedCanvas.width = cropWidth;
      croppedCanvas.height = cropHeight;

      croppedCtx.drawImage(
        canvas,
        minX, minY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );

      resolve(croppedCanvas.toDataURL('image/png'));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
}

/**
 * Resize image while maintaining aspect ratio
 */
export async function resizeImage(
  imageData: string,
  maxWidth: number,
  maxHeight: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = width;
      canvas.height = height;

      // Use better quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
}

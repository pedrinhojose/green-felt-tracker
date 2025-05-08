
/**
 * Utility functions for image handling and optimization
 */

/**
 * Compresses and resizes an image to reduce file size
 * @param imageDataUrl - The base64 image data URL to optimize
 * @param maxWidth - Maximum width of the image (default: 500px)
 * @param quality - JPEG quality from 0 to 1 (default: 0.7)
 * @returns A promise that resolves to the optimized image data URL
 */
export const optimizeImage = (
  imageDataUrl: string,
  maxWidth = 500,
  quality = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!imageDataUrl) {
      reject(new Error("No image data provided"));
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      // Create a canvas element to draw and resize the image
      const canvas = document.createElement("canvas");
      
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = Math.round(height * ratio);
      }
      
      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      
      // Draw image on canvas with new dimensions
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG format with specified quality
      const optimizedDataUrl = canvas.toDataURL("image/jpeg", quality);
      
      // Log compression results
      const originalSize = Math.round(imageDataUrl.length / 1024);
      const optimizedSize = Math.round(optimizedDataUrl.length / 1024);
      console.log(`Image optimized: ${originalSize}KB → ${optimizedSize}KB (${Math.round((optimizedSize / originalSize) * 100)}%)`);
      
      resolve(optimizedDataUrl);
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageDataUrl;
  });
};

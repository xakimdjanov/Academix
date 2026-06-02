/**
 * Client-side helper to compress and convert any selected image file into a modern, lightweight WebP image.
 * Uses HTMLCanvasElement for hardware-accelerated, native browser-based conversion with no npm dependencies.
 * 
 * @param {File} file - The original File object selected by the user.
 * @param {number} quality - Target compression quality from 0.0 to 1.0 (default is 0.8).
 * @returns {Promise<File>} A promise that resolves with the optimized .webp File.
 */
export const convertToWebP = (file, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      return resolve(file); // Return non-image files as is (e.g. PDFs)
    }

    if (file.type === "image/webp") {
      return resolve(file); // Already WebP
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          
          // Downscale huge images to a maximum dimension of 2048px to save bandwidth and S3 storage
          const MAX_WIDTH = 2048;
          const MAX_HEIGHT = 2048;
          let width = img.naturalWidth;
          let height = img.naturalHeight;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            } else {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return reject(new Error("Canvas conversion to WebP blob failed"));
              }
              const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
              const webpFile = new File([blob], `${nameWithoutExt}.webp`, {
                type: "image/webp",
                lastModified: Date.now(),
              });
              resolve(webpFile);
            },
            "image/webp",
            quality
          );
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = event.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

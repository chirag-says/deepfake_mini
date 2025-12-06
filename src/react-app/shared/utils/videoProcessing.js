/**
 * Extracts evenly distributed frames from a video file.
 * @param {File} videoFile - The video file to process.
 * @param {number} frameCount - Number of frames to extract (default: 5).
 * @returns {Promise<string[]>} - Array of base64 image strings (without prefix).
 */
export async function extractVideoFrames(videoFile, frameCount = 5) {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const frames = [];

        // Create URL for the video file
        const videoUrl = URL.createObjectURL(videoFile);
        video.src = videoUrl;
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = "anonymous";

        // Clean up function
        const cleanup = () => {
            URL.revokeObjectURL(videoUrl);
            video.remove();
            canvas.remove();
        };

        video.onloadedmetadata = async () => {
            video.currentTime = 0;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const duration = video.duration;
            const interval = duration / (frameCount + 1); // +1 to avoid exact start/end which might be black

            try {
                for (let i = 1; i <= frameCount; i++) {
                    const time = interval * i;
                    await seekToTime(video, time);

                    // Draw frame to canvas
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // Get base64 data
                    const base64 = canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
                    frames.push(base64);
                }
                resolve(frames);
            } catch (error) {
                reject(error);
            } finally {
                cleanup();
            }
        };

        video.onerror = (e) => {
            cleanup();
            reject(new Error("Error loading video file"));
        };
    });
}

function seekToTime(video, time) {
    return new Promise((resolve) => {
        const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            resolve();
        };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = time;
    });
}

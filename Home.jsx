captureImage = () => {
    console.log(this.videoRef.current);
    if (this.videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = this.videoRef.current.videoWidth;
        canvas.height = this.videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(this.videoRef.current, 0, 0);
        return canvas.toDataURL('image/jpeg');
    } else {
        throw new Error("Video reference not available");
    }
} 
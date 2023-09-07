import React, { useState } from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000', // Replace with your backend URL if needed
});


function ImageCapture() {
    const [imageData, setImageData] = useState(null);
    const [message, setMessage] = useState('');

    const captureImage = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const video = document.createElement('video');
            video.srcObject = stream;
            await video.play();

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const dataUrl = canvas.toDataURL('image/png');

            // Send captured image data to the backend
            const response = await api.post('/process_image', { imageData: dataUrl });
            setImageData(response.data.modifiedImageData);
            setMessage(response.data.message);
            console.log(response.data.message);

            stream.getTracks().forEach((track) => track.stop());
        } catch (error) {
            console.error('Error capturing image:', error);
        }
    };

    return (
        <div>
            <button onClick={captureImage}>Capture Image</button>
            {message && <p>{message}</p>}
            {imageData && (
                <div>
                    <img src={imageData} alt="Modified" />
                </div>
            )}
        </div>
    );
}

export default ImageCapture;

import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';

function App() {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [detectedObjects, setDetectedObjects] = useState([]);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);

    // Send the captured image to the Flask backend
    try {
      const formData = new FormData();
      formData.append('image', dataURItoBlob(imageSrc), 'image.jpg');

      const response = await axios.post('http://localhost:5000/detect_objects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const detectedObjs = response.data.objects || [];
      setDetectedObjects(detectedObjs);

      // Display the detected image from the backend
      const detectedImageResponse = await axios.get('http://localhost:5000/get_detected_image', {
        responseType: 'arraybuffer',
      });

      const detectedImageBlob = new Blob([detectedImageResponse.data], {
        type: 'image/jpeg',
      });

      const detectedImageUrl = URL.createObjectURL(detectedImageBlob);
      setImage(detectedImageUrl);
    } catch (error) {
      console.error('Error sending image:', error);
    }
  }, []);

  // Convert data URI to Blob
  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  };

  return (
    <div className="App">
      <h1>Object Detection</h1>
      <div>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={640}
          height={480}
        />
        <button onClick={capture}>Capture</button>
      </div>
      {image && (
        <div>
          <h2>Captured Image with Detected Objects:</h2>
          <img src={image} alt="Captured with Objects" />
          <ul>
            {detectedObjects.map((obj, index) => (
              <li key={index}>
                Object {index + 1}: {obj.object_label}
                <br />
                Bounding Box: ({obj.x1}, {obj.y1}) - ({obj.x2}, {obj.y2})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;

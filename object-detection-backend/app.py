from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

model = YOLO('yolov8n.pt')

def detect_obj(img):
    results = model(img)
    return results[0].plot()

@app.route('/process_image', methods=['POST'])
def process_image():
    try:
        # Receive image data from the front end
        dataUrl = request.json['imageData']
        _, encoded_image = dataUrl.split(",", 1)
        decoded_image = base64.b64decode(encoded_image)
        nparr = np.frombuffer(decoded_image, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        image = detect_obj(image)

        # Encode the modified image as base64
        _, encoded_modified_image = cv2.imencode('.png', image)
        modified_image_data_url = "data:image/png;base64," + base64.b64encode(encoded_modified_image).decode()

        return jsonify({'message': 'Image Received', 'modifiedImageData': modified_image_data_url})
    except Exception as e:
        return jsonify({'message': 'Error processing image: ' + str(e)})

if __name__ == '__main__':
    app.run(debug=True)

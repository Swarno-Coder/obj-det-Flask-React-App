import os
import cv2
import torch
import numpy as np
from flask import Flask, request, jsonify, send_file
from torchvision.models.detection import fasterrcnn_resnet50_fpn

app = Flask(__name__)

# Load a pre-trained Faster R-CNN model
model = fasterrcnn_resnet50_fpn(pretrained=True)
model.eval()

# Function for object detection
def detect_objects(image):
    # Convert the image to a tensor
    image = torch.from_numpy(image).permute(2, 0, 1).float() / 255.0
    images = [image]

    # Perform object detection
    with torch.no_grad():
        predictions = model(images)

    # Process the predictions
    boxes = predictions[0]['boxes'].cpu().numpy()
    labels = predictions[0]['labels'].cpu().numpy()

    return boxes, labels

# API endpoint for object detection
@app.route('/detect_objects', methods=['POST'])
def detect_objects_route():
    try:
        # Get the uploaded image data from the request
        image_data = request.files['image'].read()

        # Decode the image data
        image = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)

        # Perform object detection
        boxes, labels = detect_objects(image)

        # Prepare the response
        detected_objects = []
        for box, label in zip(boxes, labels):
            x1, y1, x2, y2 = box
            detected_objects.append({
                'x1': int(x1),
                'y1': int(y1),
                'x2': int(x2),
                'y2': int(y2),
                'object_label': int(label)
            })

        return jsonify({'objects': detected_objects})

    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Serve the detected image with bounding boxes
@app.route('/get_detected_image', methods=['GET'])
def get_detected_image():
    image_path = 'detected_image.jpg'
    return send_file(image_path, mimetype='image/jpeg')

if __name__ == '__main__':
    app.run(debug=True)

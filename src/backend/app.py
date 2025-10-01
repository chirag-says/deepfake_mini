from flask import Flask, request, jsonify
from flask_cors import CORS
from deepfake_detection import predict_deepfake
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/detect-deepfake', methods=['POST'])
def detect_deepfake():
    """
    API endpoint for deepfake detection.
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image_file = request.files['image']
    image_data = image_file.read()

    result = predict_deepfake(image_data)

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
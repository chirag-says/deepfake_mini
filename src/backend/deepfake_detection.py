import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
import io
from flask_cors import CORS

# Load the trained model
model = load_model('models/deepfake_detector_model.h5')  # Replace with your model file

def predict_deepfake(image_data):
    """
    Predicts whether an image is a deepfake.

    Args:
        image_data: The image data as bytes.

    Returns:
        A dictionary containing the prediction result.
    """
    try:
        # Load the image using PIL
        img = Image.open(io.BytesIO(image_data)).resize((224, 224))  # Resize to model input size
        img_array = np.array(img) / 255.0  # Normalize pixel values
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension

        # Make the prediction
        prediction = model.predict(img_array)[0][0]

        # Convert the prediction to a boolean
        is_deepfake = prediction > 0.5

        return {"is_deepfake": bool(is_deepfake), "confidence": float(prediction)}

    except Exception as e:
        return {"error": str(e)}
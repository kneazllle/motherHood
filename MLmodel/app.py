from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the saved scaler and model
with open('scale.pkl', 'rb') as scaler_file:
    scaler = pickle.load(scaler_file)

with open('randomforestmodel.pkl', 'rb') as model_file:
    random_forest_model = pickle.load(model_file)

@app.route('/predict', methods=['POST'])
def predict():
    print('================')
    data = request.json
    print("Received data for prediction:", data)
    
    required_fields = ['Age', 'SystolicBP', 'DiastolicBP', 'BS', 'BodyTemp', 'HeartRate']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    try:
        features = [
            float(data['Age']),
            float(data['SystolicBP']),
            float(data['DiastolicBP']),
            float(data['BS']),
            float(data['BodyTemp']),
            float(data['HeartRate'])
        ]
    except ValueError:
        return jsonify({'error': 'Invalid input type, all inputs must be numbers'}), 400

    scaled_features = scaler.transform(np.array(features).reshape(1, -1))
    prediction = random_forest_model.predict(scaled_features)

    risk_level_mapping = {0: 'low risk', 1: 'mid risk', 2: 'high risk'}
    risk_level = risk_level_mapping[prediction[0]]
    print('==============================')
    print(risk_level)
    return jsonify({'risk_level': risk_level})

if __name__ == '__main__':
    app.run(debug=True)
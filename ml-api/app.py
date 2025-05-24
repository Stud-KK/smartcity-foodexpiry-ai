# ml-api/app.py

from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)

# Load the model
model_path = os.path.join('model', 'expiry_predictor.pkl')
model = joblib.load(model_path)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    # Expecting: product_name, storage_condition, item_condition_on_purchase
    input_df = pd.DataFrame([{
        'product_name': data['product_name'],
        'storage_condition': data['storage_condition'],
        'item_condition_on_purchase': data['item_condition_on_purchase']
    }])

    prediction = model.predict(input_df)[0]
    return jsonify({'predicted_expiry_days': int(prediction)})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

import requests

edge_cases = [
    # Frozen item in hot place
    {"product_name": "Ice Cream", "storage_condition": "Room Temperature", "item_condition_on_purchase": "Fresh"},

    # Dry item in freezer
    {"product_name": "Rice", "storage_condition": "Freezer", "item_condition_on_purchase": "Sealed & Intact"},

    # Fresh meat at room temperature
    {"product_name": "Chicken", "storage_condition": "Room Temperature", "item_condition_on_purchase": "Fresh"},

    # Rotten fruit in freezer
    {"product_name": "Strawberry", "storage_condition": "Freezer", "item_condition_on_purchase": "Rotten"},

    # Damaged dairy product
    {"product_name": "Cheese", "storage_condition": "Fridge", "item_condition_on_purchase": "Leaky Pack"},

    # Beverage stored incorrectly
    {"product_name": "Buttermilk", "storage_condition": "Room Temperature", "item_condition_on_purchase": "Near Expiry"},

    # Highly perishable item, great condition but stored wrong
    {"product_name": "Fish", "storage_condition": "Room Temperature", "item_condition_on_purchase": "Fresh"},

    # Solid food in leaky packaging
    {"product_name": "Salt", "storage_condition": "Fridge", "item_condition_on_purchase": "Leaky Pack"},
]

for case in edge_cases:
    res = requests.post("http://127.0.0.1:5000/predict", json=case)
    print(f"Input: {case} → Predicted Expiry Days: {res.json()['predicted_expiry_days']}")

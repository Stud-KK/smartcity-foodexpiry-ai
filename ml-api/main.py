from mimesis import Person, Datetime, Text
from mimesis.locales import Locale
import random
import pandas as pd

random.seed(42)  # Ensures reproducibility

# Initialize mimesis generators
person = Person(Locale.EN)
datetime = Datetime()
text = Text()

# Storage and condition categories
storage_conditions = ['Fridge', 'Room Temperature', 'Freezer']
item_conditions = [
    'Fresh', 'Slightly Bruised', 'Damaged Pack', 'Spoiled', 'Near Expiry',
    'Sealed & Intact', 'Minor Defect', 'Overripe', 'Leaky Pack', 'Discolored'
]

# Product categories
very_perishable = {
    'Milk', 'Bread', 'Lassi', 'Chaas (Buttermilk)', 'Paneer', 'Curd', 'Dahi (Yogurt)', 'Freshly baked Buns',
    'Coriander Leaves', 'Mint Leaves', 'Spinach', 'Palak (Spinach)', 'Methi (Fenugreek Leaves)', 
    'Sarson (Mustard Greens)', 'Bathua (Chenopodium)', 'Karela (Bitter Gourd)', 'Lauki (Bottle Gourd)', 
    'Tinda (Apple Gourd)', 'Parwal (Pointed Gourd)', 'Tori (Ridge Gourd)', 'Kaddu (Pumpkin)', 
    'Arbi (Colocasia)', 'Suran (Yam)'
}

perishable = {
    'Tomato', 'Onion', 'Potato', 'Banana', 'Grapes', 'Mango', 'Watermelon', 'Orange', 'Apple', 
    'Pomegranate', 'Cabbage', 'Cauliflower', 'Carrot', 'Beetroot', 'Cucumber', 'Green Chilli', 
    'Brinjal (Eggplant)', "Lady's Finger (Okra)", 'Rabri', 'Kheer', 'Malai (Cream)', 'Mishti Doi (Sweet Yogurt)'
}

semi_perishable = {
    'Atta (Wheat Flour)', 'Maida (Refined Flour)', 'Besan (Gram Flour)', 'Suji (Semolina)', 
    'Rava (Semolina)', 'Poha (Flattened Rice)', 'Pav (Indian Bread Roll)', 'Ghee (Clarified Butter)', 
    'Khoya (Mawa)', 'Coconut', 'Dates (Khajur)', 'Aam Panna', 'Kokum Juice', 'Thandai'
}

fruit_keywords = ['Apple', 'Banana', 'Grapes', 'Mango', 'Pomegranate', 'Orange', 'Watermelon', 'Muskmelon',
                  'Papaya', 'Guava', 'Chikoo', 'Sitaphal', 'Sweet Lime', 'Kinnow', 'Pear', 'Plum', 'Peach',
                  'Apricot', 'Cherry', 'Strawberry', 'Blueberry', 'Raspberry', 'Kiwi', 'Pineapple', 
                  'Custard Apple', 'Jackfruit', 'Litchi', 'Mulberry', 'Jamun', 'Amla']

products = list(set(list(very_perishable | perishable | semi_perishable) + fruit_keywords))
non_perishable = set(products) - very_perishable - perishable - semi_perishable

# Category checker
def is_fruit(product_name):
    return any(keyword.lower() in product_name.lower() for keyword in fruit_keywords)

# Base expiry days
expiry_base = {
    'very_perishable': 5,
    'perishable': 15,
    'semi_perishable': 60,
    'non_perishable': 120
}

condition_multiplier = {
    'Fresh': 1.0,
    'Sealed & Intact': 0.95,
    'Slightly Bruised': 0.75,
    'Minor Defect': 0.7,
    'Damaged Pack': 0.6,
    'Near Expiry': 0.4,
    'Overripe': 0.3,
    'Leaky Pack': 0.2,
    'Discolored': 0.15,
    'Spoiled': 0.05
}

storage_multiplier = {
    'Freezer': 1.3,
    'Fridge': 1.0,
    'Room Temperature': 0.6
}

# Core generator
def generate_sample():
    product = random.choice(products)
    storage = random.choice(storage_conditions)
    condition = random.choice(item_conditions)

    if is_fruit(product) or product in very_perishable:
        base_days = expiry_base['very_perishable']
    elif product in perishable:
        base_days = expiry_base['perishable']
    elif product in semi_perishable:
        base_days = expiry_base['semi_perishable']
    else:
        base_days = expiry_base['non_perishable']

    adjusted_days = base_days * condition_multiplier[condition] * storage_multiplier[storage]
    expiry_in_days = max(1, int(adjusted_days))

    return {
        'product_name': product.strip().lower(),
        'storage_condition': storage.strip().lower(),
        'item_condition_on_purchase': condition.strip().lower(),
        'predicted_expiry_days': expiry_in_days
    }


# Inject edge cases occasionally
def generate_edge_case():
    edge_products = [
        {'product_name': 'Ice Cream', 'storage_condition': 'Room Temperature', 'item_condition_on_purchase': 'Fresh'},
        {'product_name': 'Chicken', 'storage_condition': 'Room Temperature', 'item_condition_on_purchase': 'Fresh'},
        {'product_name': 'Rice', 'storage_condition': 'Freezer', 'item_condition_on_purchase': 'Sealed & Intact'},
        {'product_name': 'Salt', 'storage_condition': 'Fridge', 'item_condition_on_purchase': 'Leaky Pack'},
        {'product_name': 'Fish', 'storage_condition': 'Room Temperature', 'item_condition_on_purchase': 'Fresh'}
    ]

    case = random.choice(edge_products)

    # Assign an intentionally mismatched expiry
    base_days = 2  # default for edge
    adjusted_days = base_days * condition_multiplier.get(case['item_condition_on_purchase'], 0.5) * storage_multiplier.get(case['storage_condition'], 1.0)
    case['product_name'] = case['product_name'].strip().lower()
    case['storage_condition'] = case['storage_condition'].strip().lower()
    case['item_condition_on_purchase'] = case['item_condition_on_purchase'].strip().lower()
    case['predicted_expiry_days'] = max(1, int(adjusted_days))
    return case


# Generate samples
samples = []
for i in range(500):
    if i % 20 == 0:  # Inject 5% edge cases
        samples.append(generate_edge_case())
    else:
        samples.append(generate_sample())

# Save to CSV
df = pd.DataFrame(samples)
df.to_csv("synthetic_expiry_data_500.csv", index=False)

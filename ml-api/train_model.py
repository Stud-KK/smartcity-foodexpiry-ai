# ml-api/train_model.py

import pandas as pd
import joblib
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import mean_absolute_error
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from xgboost import XGBRegressor
import numpy as np

# Load data
df = pd.read_csv("synthetic_expiry_data_realistic.csv")

# Features and target
X = df[['product_name', 'storage_condition', 'item_condition_on_purchase']]
y = df['predicted_expiry_days']

# Handle missing values
X = X.fillna("missing")
y = y.fillna(y.median())

# Preprocessing
categorical_features = ['product_name', 'storage_condition', 'item_condition_on_purchase']
categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
    ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
])

preprocessor = ColumnTransformer(
    transformers=[('cat', categorical_transformer, categorical_features)]
)

# Define XGBoost regressor
xgb = XGBRegressor(objective='reg:squarederror', random_state=42)

# Pipeline
pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', xgb)
])

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Hyperparameter grid
param_dist = {
    'regressor__n_estimators': [100, 200, 300],
    'regressor__max_depth': [3, 5, 7, 10],
    'regressor__learning_rate': [0.01, 0.05, 0.1, 0.2],
    'regressor__subsample': [0.6, 0.8, 1.0],
    'regressor__colsample_bytree': [0.6, 0.8, 1.0]
}

# Randomized search
random_search = RandomizedSearchCV(
    pipeline, param_distributions=param_dist, n_iter=30,
    scoring='neg_mean_absolute_error', cv=5, random_state=42, n_jobs=-1
)

# Fit model
random_search.fit(X_train, y_train)

# Evaluate
best_model = random_search.best_estimator_
y_pred = best_model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
print("MAE (XGBoost):", mae)

# Save the model
joblib.dump(best_model, 'model/expiry_predictor.pkl')

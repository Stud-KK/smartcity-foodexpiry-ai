# smartcity-foodexpiry-ai

# 🌆SmartCity Food Expiry AI 

**Revolutionizing food sustainability in smart cities with AI-powered expiry prediction, inventory alerts, and smart suggestions.**

---

##  Why This Matters

💡 **One-third of all food produced globally is wasted** — a problem we address using AI.  
Our system empowers individuals, restaurants, and smart homes to manage food efficiently, reduce waste, and save money — all from a single app.

---

## What We Built

An AI-powered, full-stack platform that:

✅ **Predicts expiry** of unpackaged or unlabeled foods using machine learning  
✅ **Voice scan integration** for hands-free item addition via speech-to-text
📲 **Sends SMS alerts** before items go bad (Twilio Integration)  
🍽️ **Recommends recipes** based on expiring ingredients  
📊 **Generates inventory reports** and eco-friendly suggestions

🛒 **Generates smart grocery lists** based on your current inventory and consumption patterns  

---
##  How It Works

1. **Add items** manually, via barcode, or **voice scan** (speech-to-text)  
2. **AI predicts expiry** (for fruits, veggies, non-labeled items)  
3. **Receive alerts** via SMS before items expire  
4. **Get recipe ideas** or suggestions to compost/donate  
5. **If an item has expired, receive eco-friendly suggestions** such as using it as compost or fertilizer  
6. **Track inventory health** with insightful reports  
7. **Automatically generate grocery lists** to replenish essentials without overbuying
8. **Voice scan integration:**  
Hands-free addition of items via speech-to-text, reducing manual input errors and speeding up inventory management.


## Tech Stack

| Layer       | Tools & Tech                                                                 |
|-------------|------------------------------------------------------------------------------|
| Frontend    | React.js, Vite, Tailwind CSS                                                 |
| Backend     | Node.js, Express.js, MongoDB                                                 |
| ML API      | Python, Flask, XGBoost                                                       |
| Integrations| Twilio (SMS), Edamam API (Nutrition & Recipe Suggestions)                    |

---



## 📸 App working flow
![image](https://github.com/user-attachments/assets/74ff6b09-b8df-4a6f-822b-474915894e74)



## Project Structure

```

smartcity-foodexpiry-ai/
├── frontend/       # React app (UI, Edamam integration)
├── backend/        # Node.js API, MongoDB, Twilio
├── ml-api/         # Python ML service for expiry prediction
└── README.md       # You're here!

````

---

## ⚙️ Quick Start

```bash
# Clone the repo
git clone https://github.com/Stud-KK/smartcity-foodexpiry-ai.git

# Setup frontend
cd frontend
npm install && npm run dev

# Setup backend
cd ../backend
npm install && npm start

# Setup ML API
cd ../ml-api
pip install -r requirements.txt
python app.py
````

---

## 🏆 Achievements

* ✔️ Predicts expiry with \~3 days MAE using custom-trained XGBoost model
* ✔️ Smart dashboard with voice, barcode, and SMS support
* ✔️ Optimized for smart homes, restaurants, and eco-conscious users

---

## 🧑‍💻 Team & Credits


1.Komal Kalshetti
2.Sanjana Mutkiri
3.Aishwarya Kalshetti

---



## 🌱 Join the Mission

Help us build smarter, greener cities. Reduce food waste. Empower every home with AI.

> **"A smarter city starts with smarter kitchens."**







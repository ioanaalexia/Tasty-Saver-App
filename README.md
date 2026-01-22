# Tasty-Saver-App

**Tasty Saver** is a smart mobile application designed to help users reduce food waste by efficiently managing their household food inventory. The application combines modern **Machine Learning**, **Computer Vision**, and external API integrations to deliver personalized recommendations and an intuitive user experience.
Users can identify available ingredients using image recognition, receive recipe suggestions tailored to their preferences, and plan meals efficiently—ultimately minimizing food waste.

## Key Features 
### Ingredient Recognition from Images
- Uses a **YOLOv8**-based Computer Vision model to detect ingredients from photos

### Recipe Recommendation System
- **K-Nearest Neighbors (KNN)** algorithm for personalized recipe recommendations.
- Integration with external recipe APIs for variety and enriched recipe data

### Meal Planning
- Plan daily or weekly meals using the detected and available ingredients

### Automatic Shopping List Generation
- Automatically generates shopping lists based on planned meals and missing ingredients

### Favorite Recipes
- Save and manage preferred recipes for quick access

### OpenAI Integration
- Enhances personalization and delivers intelligent suggestions of meals for a better user experience.

## Tech Stack
### Frontend
- Built with **React Native** using **Expo** for cross-platform compatibility (Android & iOS)

- **Expo Router** handles navigation between screens

- Image Picker is used to capture or select images for ingredient detection

- Local state management is used for handling UI state and user interactions

- Communicates with backend services via **REST APIs**

### Backend Microservices
The backend consists of two independent **Flask**-based microservices:

#### 1.Ingredient Recognition Microservice
- Receives images from the mobile app
- Runs a YOLOv8 computer vision model for ingredient detection
- Returns a list of detected ingredients with confidence scores

#### 2. Recipe Recommendation Microservice
- Implements a **KNN** - based recommendation system using **scikit-learn**
- Uses a CountVectorizer to transform ingredient lists into feature vectors
- Filters recipes based on:
  - User favorites
  - Dietary preferences (standard / vegetarian / vegan)
  - Cuisine type (strict or flexible matching)
- Returns complete recipe objects.

### AI Content Generation
- **OpenAI API** is used to dynamically generate new recipes based on ingredients detected in images
- Enhances personalization and creativity beyond predefined recipe datasets

### Data & External Services:
- **Spoonacular API** provides external recipe data and nutritional information
- **Firebase** is used for data storage (favorites, user preferences, statistics)

### Application Purpose
- By combining computer vision, machine learning, and generative AI within a modular microservice architecture, this application empowers users to make smarter food choices, reduce unnecessary waste, and improve daily cooking and shopping habits.

### Application Demo
- Watch the demo video: [Click here](https://www.youtube.com/watch?v=QA85Q12DnoI)

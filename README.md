🎓 AI-Powered Student Analytics and Success Platform

An intelligent, data-driven platform designed to analyze student performance, identify learning patterns, and help educators make informed decisions to improve student success using Artificial Intelligence and Machine Learning.

🚀 Project Overview

The AI-Powered Student Analytics and Success Platform aims to transform educational data into meaningful insights. By analyzing student records, academic scores, and other relevant performance indicators, the platform can help identify students who may need additional support and provide insights into their academic progress.

The platform combines a modern React.js frontend with a Django backend and data analysis and machine learning libraries to deliver an efficient and scalable solution for educational analytics.

🎯 Problem Statement

Educational institutions often struggle to identify students who are falling behind because academic data is scattered across spreadsheets and traditional reporting systems. This makes it difficult to detect performance trends early and provide timely support.

Our solution uses data analytics and machine learning to help institutions understand student performance, identify potential academic risks, and support data-informed educational decisions.

💡 Key Objectives

- Analyze student academic data efficiently.
- Process and analyze student records uploaded through CSV files.
- Identify patterns and trends in academic performance.
- Use machine learning to support student performance analysis and risk prediction.
- Present useful insights through an intuitive dashboard.
- Help educators identify students who may benefit from additional academic support.

🛠️ Technology Stack

Frontend

- React.js — Builds the interactive and responsive user interface.
- JavaScript — Handles frontend logic and interactions.
- CSS — Provides styling and layout.

Backend

- Python — Core backend programming language.
- Django — Handles backend logic, data processing workflows, and application services.
- Django REST Framework (DRF) — Provides RESTful APIs for communication between the frontend and backend.
- django-cors-headers — Configures Cross-Origin Resource Sharing (CORS) so the React frontend can communicate with the Django API when running on different origins.

Data Analysis and Machine Learning

- Pandas — Loads, cleans, and analyzes student data, including CSV files.
- NumPy — Supports numerical computations and array-based operations.
- Scikit-learn — Provides machine learning algorithms and tools for model training, evaluation, and prediction.

Testing

- pytest-django — Supports automated testing of Django applications, including API endpoints and backend functionality.

🏗️ System Architecture

        Student / Educator
                |
                v
        React.js Frontend
                |
         HTTP / REST API
                |
                v
       Django REST Framework
                |
                v
          Django Backend
                |
       +--------+--------+
       |        |        |
       v        v        v
    Pandas    NumPy   Scikit-learn
       |        |        |
       +--------+--------+
                |
                v
     Student Analytics and
       ML-Based Insights
                |
                v
       API Response (JSON)
                |
                v
        React Dashboard

⚙️ Core Features

The following features describe the intended functionality of the platform and can be updated to reflect the features implemented in the current version.

- Student Data Analysis: Process student academic records and generate useful statistics.
- CSV Data Upload: Import student datasets for analysis using Pandas.
- Performance Insights: Analyze marks, attendance, and other available academic indicators.
- AI-Powered Analytics: Apply machine learning techniques to identify patterns and estimate academic risk when supported by suitable data.
- Student Risk Identification: Help identify students who may require additional academic support.
- Interactive Dashboard: Display student statistics and analytical results through the React interface.
- REST API Integration: Exchange data between the frontend and backend using Django REST Framework.
- Automated Testing: Test backend functionality regularly using pytest-django.

📁 Project Structure

The following is a suggested structure. Adjust it to match your actual repository.

student-success-platform/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/
│   ├── analytics/
│   └── tests/
│
├── .gitignore
└── README.md

💻 Installation and Setup

Prerequisites

Make sure the following tools are installed:

- Python 3.10 or a compatible version supported by your dependencies
- Node.js and npm
- Git
- pip

1. Clone the Repository

git clone <YOUR_REPOSITORY_URL>
cd student-success-platform

Replace "<YOUR_REPOSITORY_URL>" with your Git repository URL and adjust the directory name if necessary.

2. Set Up the Backend

Navigate to the backend directory:

cd backend

Create a virtual environment:

python3 -m venv venv

Activate it on Fedora/Linux:

source venv/bin/activate

Install the dependencies:

pip install -r requirements.txt

If "requirements.txt" does not yet contain the required packages, install the core libraries with:

pip install django djangorestframework django-cors-headers pandas numpy scikit-learn pytest-django

Apply database migrations:

python manage.py migrate

Start the Django development server:

python manage.py runserver

The backend will usually be available at:

"http://127.0.0.1:8000/"

3. Set Up the Frontend

Open another terminal and navigate to the frontend directory:

cd frontend

Install the frontend dependencies:

npm install

Start the React development server:

npm run dev

The frontend URL depends on your development tool and configuration. For a typical Vite project, it is:

"http://localhost:5173/"

Keep both development servers running while testing the application.

🔗 Frontend and Backend Integration

The frontend communicates with the Django backend through REST APIs.

- React.js sends HTTP requests to backend endpoints.
- Django REST Framework processes requests and returns JSON responses.
- Pandas and NumPy process relevant student datasets.
- Scikit-learn can be used to generate predictions when a trained model is available.
- CORS settings allow requests from the configured frontend origin.

For example, a frontend request can look like:

const response = await fetch(
  "http://127.0.0.1:8000/api/students/"
);

if (!response.ok) {
  throw new Error("Failed to fetch student data");
}

const students = await response.json();
console.log(students);

Note: The "/api/students/" endpoint is an example. Replace it with the actual API endpoint defined in your Django project.

🧪 Running Tests

To run Django tests using pytest-django, navigate to the backend directory and activate your virtual environment.

Run:

pytest

To run a particular test file:

pytest tests/

The tests can help verify API behavior, data-processing functions, and other backend functionality as the project evolves.

📊 Expected Outcomes

- Faster analysis of student academic records.
- Clearer visibility into performance trends.
- Earlier identification of students who may need support.
- Data-driven insights for educators and institutions.
- A foundation for future predictive analytics and personalized learning support.

🔮 Future Enhancements

- Student performance prediction using trained machine learning models.
- Attendance and academic-risk trend analysis.
- Personalized learning recommendations.
- Interactive charts and advanced analytics dashboards.
- Role-based access for students, teachers, and administrators.
- Secure authentication and authorization.
- Integration with institutional student information systems.
- Model evaluation, monitoring, and periodic retraining.

🔐 Data Privacy and Responsible AI

Student records can contain sensitive information. The platform should use appropriate access controls, secure data handling, and privacy-preserving practices.

Machine learning predictions should be treated as decision-support signals, not definitive judgments about a student's abilities or future. Predictions should be evaluated for accuracy, fairness, and potential bias before being used in real educational settings.

👥 Team

Project Name: AI-Powered Student Analytics and Success Platform

Developed for: Hackathon

Team Name: DEBUG THUGS

Team Members:

- MADHAV KAURA
- YASHKARAN SINGH
- JOBANPREET SINGH
- SAHILPREEET SINGH
- ABHIJEET SINGH

📜 License

This project is developed for educational and hackathon purposes. Add a suitable open-source license if you intend to distribute the project publicly.

---

Building smarter educational insights through data and AI. 🎓🤖`
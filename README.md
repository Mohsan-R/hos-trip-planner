# 🚛 HOS Trip Planner — FMCSA Commercial Truck Route & ELD Log Manager

An enterprise-grade full-stack commercial vehicle route planning application that automates federal **FMCSA Hours-of-Service (HOS)** compliance, generates interactive 24-hour daily Electronic Logging Device (ELD) log sheets, and provides specialized Heavy Goods Vehicle (HGV) navigation.

---

## 🌟 Key Features

### ⏱️ Automated FMCSA Compliance Engine
- **11-Hour Driving Limit:** Real-time tracking and alert generation before exceeding driving limits.
- **14-Hour On-Duty Window:** Enforces daily duty window expiration and rest breaks.
- **70-Hour / 8-Day Cycle Limit:** Multi-day cumulative fatigue tracking and cycle resets.
- **Mandatory 30-Minute Break:** Automatically schedules rest stops after 8 cumulative hours of driving.
- **Sleeper Berth Provisions:** Supports split sleeper berth calculations and off-duty logging.

### 📋 Interactive Daily ELD Log Sheets & PDF Export
- **24-Hour Grid Visualization:** SVG-based official driver log grids rendered in 15-minute increments.
- **Duty Status Tracking:** Accurate timeline mapping across *Off-Duty*, *Sleeper Berth*, *Driving*, and *On-Duty Not Driving* statuses.
- **Automated 24h Audits:** Instant validation of daily duty hours and driving totals.
- **1-Click PDF Export:** High-resolution, multi-page official ELD log PDF download powered by stylesheet-sanitized canvas rendering (`html2pdf.js`).

### 🗺️ HGV Truck Routing & Interactive Mapping
- **Commercial Truck Routing:** Powered by **OpenRouteService API** for commercial vehicle profiles (height, weight, and hazmat restrictions).
- **Dynamic Leaflet Map:** Visualizes polyline route geometry with custom pickup, dropoff, and rest stop markers.
- **Interactive Timeline:** Step-by-step route events with precise odometer and duration metrics.

### 🔐 Full-Stack JWT Authentication
- **Secure Sessions:** Token-based authentication using Django REST Framework SimpleJWT.
- **Driver Profiles:** Personalized trip dashboard, trip history preservation, and instant reload of past log sheets.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS v4 (Modern HSL/OKLCH Design System, Glassmorphism, Dark Mode)
- **Mapping:** Leaflet & React-Leaflet
- **Export & Utilities:** `html2pdf.js`, `react-hot-toast`, Google Material Icons

### **Backend**
- **Framework:** Python 3.14 + Django 6.0
- **API Engine:** Django REST Framework (DRF)
- **Authentication:** `djangorestframework-simplejwt`
- **Database:** SQLite (Default, fully pre-configured) / PostgreSQL-ready
- **Geocoding & Routing:** OpenRouteService Python Client

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/hos-trip-planner.git
cd hos-trip-planner
```

### 2. Backend Setup
```bash
cd backend
# Create and activate virtual environment
python -m venv venv
# On Windows:
..\venv\Scripts\activate
# On macOS/Linux:
source ../venv/bin/activate

# Install dependencies (if needed) or run with existing venv
python -m pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Start the Django development server
python manage.py runserver
```
> The backend API will be available at `http://localhost:8000/api/`.

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
> Open your browser and navigate to `http://localhost:5173`.

---

## ☁️ Deployment Guide

### **Deploying the Frontend to Vercel (1-Click Ready)**
The frontend is pre-configured with `vercel.json` for seamless Single Page Application (SPA) client-side routing.

1. Push this repository to your GitHub account.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project** → Import your GitHub repository.
3. In the project setup section:
   - **Root Directory:** Edit and select `frontend`.
   - **Framework Preset:** Vercel will auto-detect **Vite**.
4. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `https://your-deployed-backend-url.com` (Leave blank or set to `http://localhost:8000` for local testing).
5. Click **Deploy**. Your HOS Trip Planner SPA will be live in seconds!

### **Deploying the Backend (Render / Railway / Fly.io)**
1. Connect your GitHub repository to your preferred cloud platform (e.g., [Render](https://render.com) or [Railway](https://railway.app)).
2. Set the **Root Directory** to `backend`.
3. Set the build command:
   ```bash
   pip install -r requirements.txt && python manage.py migrate
   ```
4. Set the start command:
   ```bash
   gunicorn config.wsgi:application --log-file -
   ```
5. In your cloud environment variables, configure `CORS_ALLOWED_ORIGINS` to include your live Vercel domain (e.g., `https://your-app.vercel.app`).

---

## 📝 License
This project is licensed under the MIT License. Built for enterprise commercial vehicle safety and FMCSA regulatory compliance.

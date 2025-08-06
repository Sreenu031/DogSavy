# 🐾 DogSavy

**DogSavy** is a compassionate platform built to **help rescue injured street dogs** by connecting kind-hearted individuals with nearby NGOs.

---

## 🚀 Project Overview

The primary aim of this project is to **save injured street dogs**. People who witness an injured dog can:

- Capture and submit a photo with a description.
- Automatically send the report to nearby NGOs (within 10 km).
- NGOs can accept and rescue the dog.
- Users and NGOs can **track the rescue status**.
- Users get a **rescue history** and details of the NGO that helped.
- Enables **transparency and follow-up care** by NGOs and users.

---

## 🧠 Key Features

- ✅ User & NGO registration/login
- ✅ Role-based dashboards
- ✅ Injured dog reporting with image, location, and description
- ✅ NGO matching based on 10 km radius
- ✅ NGO rescue acceptance and status update
- ✅ User tracking and history of rescues
- ✅ NGO detail view for each rescue

---

## 🔁 Application Flow

### 👥 1. Registration/Login

- **Users** and **NGOs** register through dedicated forms.
- NGO registration includes **location (latitude & longitude)** which is auto-filled using browser geolocation.

---

### 🐶 2. Reporting an Injured Dog

- Users log in and:
  - Upload a photo of the dog.
  - Add a short description.
  - Submit the report.

---

### 📍 3. NGO Matching & Notification

- The system automatically finds **NGOs within 10 km radius** of the reported location.
- NGOs receive the rescue request in their dashboard.

---

### 🚑 4. Rescue Action by NGO

- NGO accepts the rescue request.
- Directions to the dog’s location are shown.
- After the rescue, the NGO **updates the status to "Rescued"**.

---

### 📊 5. Status & History

- Users can see the **status of their reported dogs**:
  - Pending
  - Accepted
  - Rescued
- Rescue history includes **which NGO rescued** the dog and **when**, so users can follow up if needed.

---

---

## ⚙️ Project Setup and Run Instructions

### ✅ Prerequisites

- Node.js installed
- MongoDB (local or Atlas cloud)

---

### 📦 Backend Setup

1. Navigate to backend folder:

```bash
cd Backend/
npm install
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
node server.js

Frontend setup 
cd Frontend/
```
Technologies Used

Frontend: HTML, CSS, JavaScript

Backend: Node.js, Express.js, MongoDB

Authentication: JWT (JSON Web Token)


Image Uploading: Multer

API Testing: Postman


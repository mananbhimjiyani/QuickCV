# HR Tech Web Application

This project is an AI-powered HR Tech web application that simplifies the recruitment process. It allows HR professionals to upload CVs and Job Descriptions (JDs), automatically extract structured candidate data, and analyze compatibility between CVs and JDs using generative AI. The app uses FastAPI for the backend and React (with Vite and Tailwind) for the frontend.

---

## 🧠 Features

- Upload **CVs** and extract structured candidate data using **Gemini API**.
- Upload **Job Descriptions (JDs)** and analyze compatibility with uploaded CVs.
- Generates:
  - ATS Score (% match)
  - Summary (experience and education match)
  - Skill Analysis (matched, missing, bonus)
  - Suggestions for improvement
- All documents are processed using **base64-encoded PDF uploads** sent to the LLM.
- **Excel logs** are updated and stored in **Cloudflare R2** for tracking JD and CV metadata.

---


## 🌐 Hosting:

1. **Frontend on Vercel**:  
   `https://quickcvfrontend-git-main-kev0-4s-projects.vercel.app/`

2. **Backend on Kubernetes (AWS EKS ELB)**:  
   `http://acb726f98354a4a128cbc12edd471f6b-836054913.us-east-1.elb.amazonaws.com`

---

## ⚙️ Backend Setup

1. Navigate to the `/backend` directory.
2. Install dependencies:  
   `pip install -r requirements.txt`
3. Create a `.env` file with the following format:

    ```env
    R2_ACCESS_KEY_ID=<key>
    R2_SECRET_ACCESS_KEY=<key>
    R2_ENDPOINT_URL=<endpoint url for bucket>
    R2_BUCKET_NAME=<bucket name to store pdfs>
    GOOGLE_API_KEY=<gemini api key>
    ```

4. Start the development server:  
   `uvicorn main:app`

### 📡 API Routes

#### 🧠 AI-Powered Endpoints

- `POST /api/get_details`  
  → Extract candidate details from a CV PDF

- `POST /api/compare_cv_jd`  
  → Upload a CV and JD PDF and get a detailed compatibility analysis including:
  - ATS Score
  - Skill Match (matched, missing, bonus)
  - Summary & Improvement Suggestions

- `POST /api/upload_cv`  
  → Upload CV only to extract and log data

#### 🔗 Local URLs:
- `http://127.0.0.1:8000/api/get_details`
- `http://127.0.0.1:8000/api/upload_cv`
- `http://127.0.0.1:8000/api/compare_cv_jd`
- `http://127.0.0.1:8000/docs`

#### ☁️ Hosted URLs:
- `http://acb726f98354a4a128cbc12edd471f6b-836054913.us-east-1.elb.amazonaws.com/api/get_details`
- `http://acb726f98354a4a128cbc12edd471f6b-836054913.us-east-1.elb.amazonaws.com/api/upload_cv`
- `http://acb726f98354a4a128cbc12edd471f6b-836054913.us-east-1.elb.amazonaws.com/api/compare_cv_jd`
- `http://acb726f98354a4a128cbc12edd471f6b-836054913.us-east-1.elb.amazonaws.com/docs`

> **Tech Stack:** FastAPI + Uvicorn

---

## 💻 Frontend Setup

1. Navigate to the `/HRwebapp` directory.
2. Install dependencies:  
   `npm install`
3. Update backend URLs in the following files:  
   - `App.jsx`  
   - `UploadButton.jsx`  
   - `details.jsx`  
   - `jdPage.jsx` *(for JD-CV compatibility analysis)*
4. Run the development server:  
   `npm run dev`

> **Frontend Stack:** Vite + React + Tailwind CSS

---

## 📦 Database & Storage

- **Cloudflare R2** stores uploaded PDF CVs and JDs.
- **Excel (.xlsx)** files in R2 log metadata and extracted details for both CVs and JDs.


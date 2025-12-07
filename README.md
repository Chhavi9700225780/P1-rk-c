# 🌿 **Gita Treasure** — A Full-Stack MERN Application with AI, DevOps Automation & Multi-Environment Deployment

A modern, immersive, and performance-optimized **Bhagavad Gita Web Experience**, built over months of learning, experimentation, debugging, and engineering refinement.

**Gita Treasure** is not just a web app — it is a complete system combining:

* **Full-Stack MERN Development**
* **Deep Performance Optimization**
* **AI-powered Conversational GitaGPT**
* **Automated CI/CD**
* **AWS EC2 Production Deployment**
* **Vercel Frontend Deployment with Proxying**
* **Cloud Monitoring, Docker Containers**

This project represents my journey from beginner to real-world full-stack engineer.
It has been rebuilt, optimized, debugged, and engineered multiple times — and now runs fast, secure, and reliably in production.

---
## 🎥 Demo Video & Live Demo 

[![Watch the Demo Video](https://img.youtube.com/vi/g28VDtVD_XI/0.jpg)](https://www.youtube.com/watch?v=g28VDtVD_XI)

[Live Demo](https://p1-rk-c-onry.vercel.app)


---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS, Framer Motion, Context API |
| **Backend** | Node.js, Express.js, JWT Authentication |
| **Database** | MongoDB (Atlas) |
| **AI/LLM** | Groq API, Flask (Python) |
| **DevOps** | Docker, Docker Compose, GitHub Actions, AWS EC2 |

---

---

# 📌 **Table of Contents**

* [✨ Features](#-features)
* [🧠 GitaGPT (My Own AI Model)](#-gitagpt-your-own-ai-model)
* [⚡ Performance Optimization Journey](#-performance-optimization-journey)
* [🌐 Multi-Environment Deployment](#-multi-environment-deployment)
* [🚀 AWS CI/CD Pipeline (Docker + GitHub Actions)](#-aws-cicd-pipeline-docker--github-actions)
* [🛠️ Tech Stack](#️-tech-stack)
* [☁️ AWS Infrastructure](#️-aws-infrastructure)
* [📊 CloudWatch Monitoring](#-cloudwatch-monitoring)
* [🌟 Future Roadmap](#-future-roadmap)
* [📘 Deployment War Story (Must Read)](#-deployment-war-story-must-read)

---

# ✨ **Features**

A beautifully designed, database-driven, multilingual, AI-assisted spiritual application.

### 📜 **Verse of the Day**

* Shows a new inspirational Gita verse every day.
* Uses caching to improve speed and reduce API calls.

### 📚 **Chapter & Verse Explorer**

* Explore all **18 chapters** with summaries.
* View every verse in:
  ✔ English translation
  ✔ Hindi translation
  ✔ Multiple authentic commentaries
* Verse audio with correct Sanskrit pronunciation.

### 🪔 **Japa Counter**

* Digital chanting counter with saved progress.
* Works across sessions using secure authentication.

### 👤 **User Dashboard**

* Sign up & Login
* Track completed chapters
* Save favorite verses
* Profile system using JWT cookies

### 🧠 **AI-Powered GitaGPT — Built by Me**

My own chatbot built with:

* **Groq LLaMA model**
* **Flask backend**
* **React frontend**
* **Iframe integration**
* Streaming responses
* Krishna-themed conversational personality

### 🎨 **Customizable UI**

* Light/Dark theme
* Hindi/English toggle
* Fully responsive on all screen sizes

---

# 🧠 **GitaGPT — My Own AI Build**

Originally, I used an external iframe, but later i :

✔ Built my own **Flask backend**
✔ Integrated **Groq (LLM)**
✔ Added streaming response support
✔ Designed a custom React UI
✔ Iframed my own chatbot into the app

This transitioned GitaGPT from a dependency into a **native subsystem of my architecture.**

---

# ⚡ **Performance Optimization Journey**

My application went through **major engineering improvements**.

Below is the entire transformation.

---

## 1️⃣ **Backend: From 20-second API delays → 0.01s response time**

### **Problem**

Every verse fetch triggered a RapidAPI external call → 15–20 seconds delay.

### **Solution**

❇️ Implemented **In-Memory Caching with 24-hour expiry**

* First call: 2–3 seconds (API fetch + cache store)
* Subsequent calls: **0.01 seconds**
* Auto-expires every 24 hours to avoid stale data

### **Result**

| Metric            | Before         | After              |
| ----------------- | -------------- | ------------------ |
| Chapter Load Time | 20s            | 0.01s              |
| API Calls         | Extremely high | Cached & optimized |
| User Experience   | Frustrating    | Instant & smooth   |

---

## 2️⃣ **Frontend: Fixing Scroll Lag, Re-Renders & Animation Jank**

### Issues

* Navbar re-rendering hundreds of times per scroll
* Framer Motion variants recreated every render
* API calls repeated unnecessarily
* Navigation caused UI flicker

### Fixes

✔ Throttled scroll using `requestAnimationFrame`
✔ Memoized Navbar, Footer & heavy components
✔ Moved animation definitions outside components
✔ Added Context caching for chapters & verses

### Result

✨ Smooth 60 FPS scrolling
✨ No unnecessary network calls
✨ Clean render cycle

---

## 3️⃣ **Audio System: 404 Errors & Memory Leaks**

### Issues

* Audio loaded from `localhost:3000` instead of backend
* Multiple `new Audio()` instances created → memory leak
* No cleanup on unmount

### Fixes

✔ Correct audio URL: `http://localhost:5000/verse_recitation/...`
✔ Audio initialization inside `useEffect`
✔ Cleanup to stop audio on page change

---

## 4️⃣ **Code Structure Clean-up**

### Problems

* Duplicate states copied from context
* Missing dependencies in `useEffect`
* Resize listener causing lag

### Fixes

✔ Removed unnecessary local state
✔ Added proper dependencies
✔ Throttled resize handlers

---

## 5️⃣ **Mobile Layout Fixes**

The GitaGPT container used `top: 80px` which broke on small screens.

✔ Added mobile media queries
✔ Fixed spacing & responsiveness

---

# 🌐 **Multi-Environment Deployment**

My project runs in **two environments**:

---

# 1️⃣ **Vercel — Real-Time Deployment**

### Why Vercel?

* Fast global CDN
* Instant rebuilds
* Needed because Render backend slept and broke authentication

### Challenge: **Cookies + CORS + Third-Party Cookie Blocking**

Modern browsers block cross-site cookies by default.

So you implemented:

✔ Secure cookies
✔ `sameSite: "none"`
✔ Dynamic CORS allowlist
✔ **Vercel Rewrites**

### Vercel Rewrite Fix (The Magic)

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-domain.com/:path*"
    }
  ]
}
```

Now the browser thinks backend = same domain → cookies work.

---

# 2️⃣ **AWS EC2 — Production Deployment (Docker + GitHub Actions)**

My **primary production environment** uses:

* Docker Compose
* Docker Hub container registry
* GitHub Actions CI/CD
* Secure SSH deployment
* CloudWatch monitoring
* Zero downtime restarts

---

# 🚀 **AWS CI/CD Pipeline (Automated)**

My pipeline performs:

1. Build frontend & backend
2. Create Docker images
3. Push to Docker Hub
4. SSH into EC2
5. Generate `.env` from GitHub Secrets
6. Pull new images
7. Use Docker Compose to restart app with **0 downtime**

This pipeline makes deployment as simple as:

```bash
git push origin main
```
---

### ✅ Successful Pipeline Execution


<img width="1892" height="958" alt="image" src="https://github.com/user-attachments/assets/dacb7a66-18aa-4688-8a94-c633e6860463" />

---


## ☁️ AWS Cloud Infrastructure

The application is hosted on an **AWS EC2 instance**.
The infrastructure includes a properly configured **Security Group** to manage traffic for HTTP, the backend API, and secure SSH access.


<img width="1145" height="1088" alt="diagram-export-18-10-2025-14_06_20" src="https://github.com/user-attachments/assets/5be9a23a-51da-4d8b-a3c8-9db8830e683c" />

---

<img width="1917" height="892" alt="image" src="https://github.com/user-attachments/assets/2e0797d6-006f-4076-bc29-b4a2e7bcec22" />

---

<img width="1887" height="773" alt="image" src="https://github.com/user-attachments/assets/5bb440b4-f15e-4737-b4ab-f151f640b75b" />

---

# 📊 CloudWatch Monitoring

I track:

* CPU utilization
* Disk usage
  
---

<img width="743" height="381" alt="image" src="https://github.com/user-attachments/assets/305a0509-e136-410d-bdbd-0a2654a38a69" />

<img width="1915" height="858" alt="image" src="https://github.com/user-attachments/assets/60a413f1-e3a1-420e-b6ce-9684b0daf4d2" />

<img width="1918" height="847" alt="image" src="https://github.com/user-attachments/assets/e572a9a8-aec0-4210-939a-c6a3d0ae9c21" />

---


## 🌟 Future Goals & Enhancements

This project has a solid foundation, and the following enhancements are planned for the future:

### 🌐 Production Domain & HTTPS

* Acquire a custom domain (e.g., from GoDaddy or Namecheap).
* Implement a **reverse proxy** with **Nginx** to manage traffic.
* Secure the site with a **free SSL certificate** from Let's Encrypt using **Certbot** to enable HTTPS.

### 🧪 Automated Testing

* Integrate a testing framework like **Jest** or **Cypress** into the CI/CD pipeline.
* Automatically run tests on every push to ensure code quality and prevent regressions.

### 🏗️ Infrastructure as Code (IaC)

* Define and manage the AWS infrastructure (**EC2**, Security Groups) using **Terraform**.
* Allow for reproducible and version-controlled environments.

### Full migration to Vite & Convert In Memory caching to Redis

---

# 📘 **Deployment War Story (Must Read)**

This section shows your problem-solving skills — perfect for recruiters and engineers.

### **Phase 1 — The Silent Cookie Failure**

Even though OTP verification returned 200 OK, profile fetch returned 401.

**Root cause:** Browser refused to send cookies due to:

* `secure: false`
* `sameSite: "lax"`

**Fix:**

```js
secure: true,
sameSite: "none"
```

---

### **Phase 2 — CORS Blocking**

Vercel creates new preview URLs → my backend didn't trust them.

Fix: dynamic CORS allowlist + updating allowed origins.

---

### **Phase 3 — Browser Blocking Third-Party Cookies**

Even with correct CORS and secure cookies, Chrome & Safari still blocked session cookies.

**Final Solution:** **Vercel Rewrites**

Frontend → `/api/...` → Vercel → backend
Browser thinks it's same-origin → cookies allowed.

---

### **Outcome**

I discovered that:

> “It works on localhost” is not equal to “It works on the internet.”

I learned real-world production debugging — authentication, cookies, HTTPS, CORS, proxying, browser restrictions.


---

# 🎉 **Conclusion**

Gita Treasure is now:

✨ Fast
✨ Secure
✨ Scalable
✨ AI-powered
✨ Production-ready
✨ Professionally engineered


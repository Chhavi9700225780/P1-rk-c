
---

# 🌿 Gita Treasure - A Full-Stack MERN Application with Automated CI/CD

A modern, responsive web application built on the **MERN stack** that brings the sacred verses of the **Bhagavad Gita** to users.
This project features a **complete, end-to-end DevOps workflow**, with automated builds, testing, and deployments to **AWS EC2** using a CI/CD pipeline.

---

## ✨ Key Features

This application is packed with features designed for a rich, interactive, and personalized spiritual experience.

### 📜 Verse of the Day

* Presents a new, inspiring random verse to the user every day.

### 📚 Comprehensive Gita Exploration

* Browse all **18 chapters** with summaries.
* Read every verse with **multiple commentaries and translations**.
* Listen to **professionally recorded audio** of each Sanskrit verse for correct pronunciation.

### 🪔 Japa Counter

* An integrated digital counter to track mantra chants (**Japa**), eliminating the need for a physical mala or counter.
* Users can **save their progress** and track their total Japa count over time.

### 👤 Personalized Progress Tracking

* Secure user authentication (**Login/Sign Up**).
* Mark chapters or verses as **Complete** or **Incomplete**.
* Add verses to a personal **Favorites** list for easy access.

### 🧠 Gita GPT

* An **AI-powered chatbot** (integrated with a GPT model) that allows users to ask questions and receive answers based on the teachings of the Bhagavad Gita — creating an experience of *“talking to Krishna”*.

### ⚙️ Customizable User Experience

* 🌐 **Bilingual Support:** Seamlessly switch between **English and Hindi** content.
* 🌗 **Dark/Light Theme:** Choose a preferred theme for comfortable reading.
* 📱 **Responsive Design:** Fully functional and beautiful on devices of all sizes, from mobile phones to desktops.

---

## 🎥 Demo Video

[![Watch the Demo Video](https://img.youtube.com/vi/g28VDtVD_XI/0.jpg)](https://www.youtube.com/watch?v=g28VDtVD_XI)



## 🛠️ Tech Stack & Architecture

This project is built with a **modern MERN stack architecture**, containerized with **Docker**, and deployed on **AWS**.

| Category     | Technology                                       |
| ------------ | ------------------------------------------------ |
| **Frontend** | React.js, Tailwind CSS                           |
| **Backend**  | Node.js, Express.js                              |
| **Database** | MongoDB                                          |
| **DevOps**   | Docker, GitHub Actions, AWS EC2, SSH, Docker Hub |

---

## 🚀 DevOps & CI/CD Pipeline

This project is more than just an application; it's a demonstration of a **complete, automated deployment workflow**.

### 🧭 Workflow Overview

1. **Code Push:** A `git push` to the `main` branch on GitHub automatically triggers the CI/CD pipeline.
2. **Build:** GitHub Actions builds the **React frontend** and **Node.js backend** into separate, optimized Docker images.
3. **Push:** The newly built images are pushed to **Docker Hub**.
4. **Deploy:**

   * The pipeline securely connects to the AWS EC2 server via SSH.
   * Creates a `.env` file from GitHub Secrets.
   * Pulls the new images.
   * Restarts the application using **Docker Compose** with **zero downtime**.

### ✅ Successful Pipeline Execution

<img width="1145" height="1088" alt="diagram-export-18-10-2025-14_06_20" src="https://github.com/user-attachments/assets/5be9a23a-51da-4d8b-a3c8-9db8830e683c" />

---
<img width="1892" height="958" alt="image" src="https://github.com/user-attachments/assets/dacb7a66-18aa-4688-8a94-c633e6860463" />


---

## ☁️ Cloud Infrastructure

The application is hosted on an **AWS EC2 instance**.
The infrastructure includes a properly configured **Security Group** to manage traffic for HTTP, the backend API, and secure SSH access.

<img width="1917" height="892" alt="image" src="https://github.com/user-attachments/assets/2e0797d6-006f-4076-bc29-b4a2e7bcec22" />

---

<img width="1887" height="773" alt="image" src="https://github.com/user-attachments/assets/5bb440b4-f15e-4737-b4ab-f151f640b75b" />


---

## Monitoring Using AWS Cloudwatch

<img width="743" height="381" alt="image" src="https://github.com/user-attachments/assets/305a0509-e136-410d-bdbd-0a2654a38a69" />

<img width="1915" height="858" alt="image" src="https://github.com/user-attachments/assets/60a413f1-e3a1-420e-b6ce-9684b0daf4d2" />

<img width="1918" height="847" alt="image" src="https://github.com/user-attachments/assets/e572a9a8-aec0-4210-939a-c6a3d0ae9c21" />

---

## 🔧 How to Run Locally

Follow these steps to run the project on your local machine:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Create a `.env` File

In the root directory, add the following credentials:

```
MONGO_URI=...
RAPID_API_KEY=...
SMTP_MAIL=...
PASSWORD=...
JWT_SECRET=...
```

### 3. Build & Run with Docker Compose

```bash
docker compose up --build
```

### 4. Access the Application

Open your browser and navigate to 👉 [http://localhost:3000](http://localhost:3000)

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

---

✅ **Project Type:** Full-Stack MERN + DevOps Automation
☁️ **Hosting:** AWS EC2
🧰 **Deployment:** Docker + GitHub Actions + Docker Hub

---


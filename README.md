# Granite Star Rating System

> A modern web application for evaluating granite mines using the Indian Bureau of Mines (IBM) Star Rating Framework.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue?logo=docker)
![Terraform](https://img.shields.io/badge/Terraform-IaC-623CE4?logo=terraform)
![AWS](https://img.shields.io/badge/AWS-EC2-orange?logo=amazonaws)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-success?logo=githubactions)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Project Overview

The Granite Star Rating System is a full-stack engineering project developed to digitize the granite mine assessment process based on the Indian Bureau of Mines (IBM) Star Rating Framework.

The application enables users to:

- Perform structured mine assessments
- Calculate star ratings automatically
- Generate professional reports
- Deploy using Docker and AWS
- Automate builds using GitHub Actions
- Manage infrastructure using Terraform

The project demonstrates modern software engineering, cloud deployment, DevOps, and infrastructure automation practices.

---

## Features

- IBM Star Rating Assessment
- Automatic Score Calculation
- Professional Dashboard
- Report Generation
- Docker Containerization
- AWS EC2 Deployment
- Terraform Infrastructure
- GitHub Actions CI/CD
- Responsive User Interface
- Production Build Support

---

# Technology Stack

## Frontend

- React 19
- Vite
- JavaScript (ES6+)
- HTML5
- CSS3

## State Management

- React Hooks
- Local Storage

## Charts & Visualization

- Recharts

## Report Generation

- jsPDF
- html2pdf.js
- DOCX
- CSV Export

## DevOps

- Docker
- Docker Hub
- GitHub Actions
- Terraform

## Cloud

- AWS EC2

## Version Control

- Git
- GitHub

## Development Tools

- Visual Studio Code
- npm

---

# System Architecture

```text
                  User
                    │
                    ▼
           React + Vite Frontend
                    │
                    ▼
         Assessment & Report Engine
                    │
                    ▼
              Local Storage
                    │
                    ▼
          Docker Container
                    │
                    ▼
              AWS EC2 Instance
                    │
                    ▼
         GitHub Actions CI/CD
                    │
                    ▼
              Docker Hub Image
```
---

# Project Structure

```text
STAR_RATING/

├── src/
├── public/
├── infra/
├── tests/
├── docs/
├── monitoring/
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```
---

# Engineering Highlights

- Responsive React Application
- IBM Star Rating Assessment Workflow
- Automated Report Generation
- Dockerized Deployment
- Infrastructure as Code using Terraform
- AWS EC2 Cloud Deployment
- Automated CI/CD with GitHub Actions
- Professional Git Workflow
- Production Build Configuration
---

# Installation

## Clone the Repository

```bash
git clone https://github.com/sanjaykumaravel-max/STAR_RATING.git
cd STAR_RATING
```

## Install Dependencies

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

## Build for Production

```bash
npm run build
```

## Preview Production Build

```bash
npm run preview
```
---

# Docker Deployment

## Build Docker Image

```bash
docker build -t star-rating-app .
```

## Run Docker Container

```bash
docker run -d \
  --name star-rating \
  -p 80:80 \
  star-rating-app
```

The application will be available at:

```
http://localhost
```
---

# AWS Deployment

The application is deployed using:

- AWS EC2
- Docker
- Terraform
- GitHub Actions

Deployment workflow:

1. Terraform provisions AWS infrastructure.
2. GitHub Actions builds the application.
3. Docker image is published to Docker Hub.
4. GitHub Actions connects to EC2 via SSH.
5. The latest Docker image is pulled and deployed automatically.

---

# Infrastructure as Code

Terraform manages the cloud infrastructure.

Infrastructure includes:

- EC2 Instance
- Security Groups
- SSH Key Configuration
- Networking Configuration

Terraform configuration files are located in:

```
infra/
```
---

# Continuous Integration & Deployment

GitHub Actions automates the deployment process.

Pipeline:

```text
Developer
     │
     ▼
Git Push
     │
     ▼
GitHub Actions
     │
     ▼
Install Dependencies
     │
     ▼
Build React Application
     │
     ▼
Docker Build
     │
     ▼
Push Docker Image
     │
     ▼
Deploy to AWS EC2
     │
     ▼
Verify Deployment
```

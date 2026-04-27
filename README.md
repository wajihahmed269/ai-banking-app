# 💳 WajihBank — AI-Powered Banking App

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=java)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.0-brightgreen?style=flat-square&logo=springboot)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=flat-square&logo=mysql)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)
![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?style=flat-square&logo=amazonaws)

A full-stack banking web application with an integrated AI assistant that analyzes your balance and transaction history in real time.

## Features
- Deposit and withdraw funds with live balance updates
- Full transaction history with filters by type and date range
- AI Banking Assistant powered by Ollama TinyLlama with real account context
- Secure BCrypt password hashing
- Fully containerized with Docker Compose
- Deployed live on AWS EC2

## Tech Stack
- Backend: Spring Boot 3.5.0, Spring Data JPA, Spring Security
- Frontend: Thymeleaf, Bootstrap 5
- Database: MySQL 8.0
- AI: Ollama + TinyLlama (1B parameters)
- DevOps: Docker, Docker Compose, AWS EC2

## Run with Docker
1. Clone the repo
2. Run: ./mvnw clean package -DskipTests
3. Run: docker compose up --build -d
4. Open: http://localhost:8080

## How This Was Built
This project was planned and architected using ChatGPT — breaking down the phases, deciding the tech stack, and mapping out the roadmap.

The entire execution was done with Claude AI — writing every line of code, debugging errors, setting up Docker, deploying to AWS, and integrating Ollama, all through a live SSH session on EC2.

A real-world example of using AI tools effectively: one for planning, one for building.

## Live Demo
http://13.63.237.170:8080
## DevSecOps Pipeline Active

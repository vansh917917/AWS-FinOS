# FinOS AWS Architecture and Presentation Defense Guide

This guide explains the complete architecture of the FinOS project deployed across two Amazon Web Services (AWS) virtual servers, followed by an exhaustive list of presentation questions and clear answers.

---

# Part 1: Project and AWS Architecture Explanation

## 1. Project Overview

FinOS is a self-contained personal finance and cashflow management platform. It allows users to track expenses, import bank statements (CSV/PDF), categorize transactions, monitor budgets, and analyze spending patterns.

The application is built using a decoupled two-tier architecture:
- **Frontend Layer**: Next.js 15 (React 19, Tailwind CSS) providing a responsive user interface with real-time analytics charts and statement upload workflows.
- **Backend Layer**: FastAPI (Python 3) providing high-performance REST APIs, statement parsing logic, and transaction categorization.
- **Database Layer**: Local SQLite database (`finos.db`) running with Write-Ahead Logging (WAL) mode for fast, concurrent reads and writes with zero external cloud dependencies.

---

## 2. Two-Server AWS Architecture

Instead of deploying both tiers on a single server, the system is separated onto two independent Amazon EC2 virtual servers to mimic enterprise microservice isolation:

```
[ User Browser ]
       |
       | HTTP (Port 3000 / 80)
       v
+-----------------------------------+
|  AWS EC2 Server 1: Frontend       |
|  - OS: Ubuntu 24.04 LTS           |
|  - Runtime: Node.js 22 + PM2      |
|  - App: Next.js Client & SSR      |
+-----------------------------------+
       |
       | REST API Calls (Port 8000)
       | (Via Public IP or VPC Private IP)
       v
+-----------------------------------+
|  AWS EC2 Server 2: Backend        |
|  - OS: Ubuntu 24.04 LTS           |
|  - Runtime: Python 3.12 + Systemd |
|  - App: FastAPI + Uvicorn         |
|  - Data: Embedded SQLite (WAL)    |
+-----------------------------------+
```

### Server 1: Frontend Virtual Server
- **Role**: Serves the user interface, renders client components, and manages user auth cookies.
- **Process Manager**: PM2 keeps the Next.js process active in the background, automatically restarting it if it crashes or if the instance reboots.
- **Environment Configuration**: Set `NEXT_PUBLIC_API_URL="http://<SERVER_2_PUBLIC_OR_PRIVATE_IP>:8000"` so client-side API requests reach the backend server.

### Server 2: Backend Virtual Server
- **Role**: Runs the FastAPI application, executes data queries, handles CSV/PDF statement processing, and writes to `finos.db`.
- **Process Manager**: Linux `systemd` service (`finos-backend.service`) keeps Uvicorn running continuously on port 8000.
- **Environment Configuration**: Set `CORS_ORIGINS=["http://<SERVER_1_IP>:3000", "http://localhost:3000"]` and `APP_PASSWORD="admin"`.

---

## 3. AWS Core Services and Concepts Used

### 1. Amazon EC2 (Elastic Compute Cloud)
- **What it is**: Resizable compute capacity (virtual machines) running in AWS data centers.
- **Instance Type Used**: `t2.micro` (or `t3.micro` depending on AWS region).
  - 1 vCPU, 1 GB RAM.
  - Eligible for the AWS Free Tier.
- **Operating System (AMI)**: Ubuntu Server 24.04 LTS (Amazon Machine Image), chosen for stability, broad package support, and zero licensing fees.

### 2. VPC (Virtual Private Cloud) and Subnets
- **What it is**: A logically isolated virtual network dedicated to your AWS account.
- **Default VPC**: Both EC2 instances are launched inside the same default AWS VPC and availability zone.
- **IP Addressing**:
  - **Public IPv4**: Reachable from the internet. Used by your browser to view the frontend, and optionally used for external API access.
  - **Private IPv4**: Internal IP address (e.g., `172.31.x.x`). Used for fast, private communication between Server 1 and Server 2 within the same VPC without traffic leaving AWS.

### 3. Security Groups (Virtual Firewalls)
Security Groups act as stateful firewalls at the instance level, controlling inbound and outbound network traffic.

- **Frontend Security Group (`finos-frontend-sg`)**:
  - Inbound: SSH (Port 22) from your IP only (for remote management).
  - Inbound: HTTP (Port 80) and Custom TCP (Port 3000) from `0.0.0.0/0` (public web access).
  - Outbound: All traffic allowed (to download apt packages and reach the backend).

- **Backend Security Group (`finos-backend-sg`)**:
  - Inbound: SSH (Port 22) from your IP only.
  - Inbound: Custom TCP (Port 8000) restricted to the Frontend Security Group ID (`sg-xxxxxx`) or Frontend Private IP (best security practice). For evaluation testing, opening to `0.0.0.0/0` allows direct access to Swagger API docs.
  - Outbound: All traffic allowed (to download Python dependencies).

### 4. Key Pairs (.pem files)
- **What it is**: Asymmetric public/private key cryptography used for secure terminal access over SSH.
- AWS injects the public key into `~/.ssh/authorized_keys` on the instance at boot. You hold the private `.pem` key on your local machine to authenticate without passwords.

### 5. Automated Deployment Scripts
To avoid manual errors during server setup, the project includes two dedicated shell scripts:
- `backend/deploy_backend.sh`: Installs Python, creates a virtual environment, installs pip packages, provisions the systemd daemon, and boots the API service.
- `frontend/deploy_frontend.sh`: Installs Node.js 22 and PM2, compiles the Next.js production build, and registers the PM2 background process.

---

## 4. AWS Free Tier Compliance Strategy

To ensure zero cost:
- **Free Tier Allowance**: 750 combined hours of `t2.micro` or `t3.micro` Linux instances per month for the first 12 months.
- **Two Instances Calculation**: Running two instances simultaneously consumes 2 hours of credit for every clock hour.
- **Cost Prevention Protocol**:
  1. Only keep both instances in the `Running` state during development, testing, and presentation.
  2. In the AWS Console, select both instances and click **Instance State -> Stop Instance** when not in use. Stopped instances incur zero compute charges.
  3. Keep attached EBS storage volumes at 8 GB to 10 GB each (Free Tier includes up to 30 GB of total EBS storage).
  4. Do not allocate Elastic IPs unless attached to a running instance, as unattached Elastic IPs incur a small hourly fee.

---

# Part 2: Potential Questions and Evaluator Defense Guide

Below are the most common questions an evaluator, teacher, or technical interviewer may ask, categorized by topic with direct answers.

---

### Category A: Architecture and Design Decisions

#### Q1: Why did you deploy on two separate virtual servers instead of putting everything on one?
**Answer**:
"We separated the frontend and backend onto two distinct virtual servers to follow the single responsibility principle and simulate production grade microservice architecture:
1. **Resource Isolation**: A heavy background task on the backend (like parsing large PDF statements) will never consume CPU or memory needed by the Next.js frontend to serve client requests.
2. **Independent Scaling**: If traffic increases, we can horizontally scale the frontend server behind a load balancer without needing to duplicate the database or backend logic.
3. **Independent Deployments**: Frontend code changes can be deployed and restarted using PM2 without restarting or interrupting active backend API connections."

#### Q2: Why did you choose SQLite instead of a managed database like Amazon RDS or PostgreSQL?
**Answer**:
"We chose local SQLite configured with Write-Ahead Logging (WAL) for three specific reasons:
1. **Zero External Dependency & Zero Latency**: The database file resides on the same SSD volume as the backend process, giving near zero latency queries without external network hops.
2. **Strict Cost Control**: Amazon RDS is either limited or costly after the free trial. SQLite runs locally inside the free EC2 instance with zero additional infrastructure bills.
3. **Simplicity and Portability**: The entire state of FinOS is preserved in a single file (`finos.db`), making backups, transfers, and system audits instant."

#### Q3: What is the purpose of PM2 and Systemd? What happens if you close your laptop?
**Answer**:
"If you launch an application directly in an SSH terminal session (like typing `python run.py`), the process is tied to your terminal shell. Closing your laptop or terminating SSH terminates the application.
- On the **Frontend server**, we use **PM2** (Process Manager 2), which runs Next.js in background daemon mode and monitors memory usage.
- On the **Backend server**, we use Linux **Systemd** (`finos-backend.service`), which starts Uvicorn at server boot and restarts it automatically if an unhandled exception crashes the process.
Because of PM2 and Systemd, the application continues running 24/7 regardless of local terminal status."

---

### Category B: AWS Networking and Security

#### Q4: What is a Security Group and what rules did you configure?
**Answer**:
"A Security Group is a stateful virtual firewall that inspects and filters network packets before they reach our EC2 instance:
- For the **Frontend Server**, we opened port 22 for SSH access and port 3000/80 for web visitors.
- For the **Backend Server**, we opened port 22 for SSH management, and port 8000 for API requests. In a strict production environment, port 8000 is restricted exclusively to the Frontend Server's Security Group ID so that the public internet cannot access the database or raw API directly."

#### Q5: What is the difference between an EC2 Public IP and Private IP? Which one does the frontend use to talk to the backend?
**Answer**:
"Every EC2 instance in a standard VPC receives two IP addresses:
- **Public IP**: An externally routable IP assigned from Amazon's public address pool. It allows users over the internet to access our web pages.
- **Private IP**: An internal IP address (e.g., `172.31.24.50`) valid only within our Amazon VPC.
For server to server communication inside AWS, using the Private IP is superior because the traffic never leaves Amazon's private network backbone, offering lower latency, higher security, and zero internet data transfer egress costs.
However, because Next.js has client components that make API calls directly from the user's browser, the frontend configuration points to the Backend's Public IP so the client browser can resolve the API."

#### Q6: How do you securely authenticate into your EC2 instances? What happens if you lose your private key?
**Answer**:
"We authenticate using SSH public-key cryptography via a `.pem` key pair. The private key stays on our local computer with restricted file permissions (`chmod 400`), while AWS places the public key into the server's `~/.ssh/authorized_keys` file.
If the private key is lost, standard password logins are disabled by default. Recovery requires either creating an AMI image of the instance volume and launching a replacement instance with a new key pair, or using AWS Systems Manager (SSM) Session Manager to gain shell access."

#### Q7: What is CORS and why is it configured on your backend?
**Answer**:
"CORS stands for Cross-Origin Resource Sharing. Because our frontend runs on Server 1 (e.g., port 3000) and our backend runs on Server 2 (port 8000), they reside on different network origins. Web browsers enforce the Same-Origin Policy by default and block requests from one origin to another.
In FastAPI, we configured the `CORSMiddleware` to explicitly permit HTTP requests, headers, and credentials originating from our Frontend server's URL."

---

### Category C: Operations, Maintenance, and Scaling

#### Q8: How did you ensure this project stays 100% free under the AWS Free Tier?
**Answer**:
"We enforced five cost controls:
1. Sized both instances to `t2.micro` (eligible under the 750 hours/month free tier).
2. Sized each EBS storage root volume to 10 GB, well within the 30 GB free tier storage limit.
3. Used free, open source software: Ubuntu Linux, Python FastAPI, Next.js, and SQLite, avoiding paid software licenses and managed database fees.
4. Stopped the instances when not demonstrating or developing to preserve our monthly free hour balance.
5. Set up AWS Billing Alerts and CloudWatch budget notifications at $0.01 threshold to alert us immediately if any non-free resource is accidentally created."

#### Q9: What happens when the EC2 instance is stopped and restarted? Does the IP address change?
**Answer**:
"Yes. On standard EC2 instances without an Elastic IP, stopping and starting the instance releases the dynamic public IPv4 address back to the AWS pool and assigns a new one upon boot.
When this happens, we simply update the backend IP in the frontend `.env.production` file and trigger `pm2 restart finos-frontend`.
To make the IP permanent in a production environment, we would allocate a free AWS Elastic IP or assign a custom domain name using Amazon Route 53."

#### Q10: How would you scale this application if it had to handle 50,000 active users?
**Answer**:
"To scale FinOS for high traffic:
1. **Frontend**: Place multiple Next.js EC2 instances inside an AWS Auto Scaling Group behind an Application Load Balancer (ALB). Cache static assets and pages globally using Amazon CloudFront (CDN).
2. **Backend**: Run multiple FastAPI worker instances across different Availability Zones, load-balanced by the ALB.
3. **Database**: Migrate from single file SQLite to Amazon Aurora PostgreSQL Serverless or Amazon RDS Multi-AZ for horizontal read replicas and automated backups.
4. **Statement Storage**: Offload uploaded CSV and PDF files directly to an Amazon S3 bucket instead of the local filesystem."

#### Q11: What is the difference between an AMI, an Instance, and an EBS Volume?
**Answer**:
- **AMI (Amazon Machine Image)**: The read-only template or blueprint containing the operating system, initial packages, and configuration (e.g., Ubuntu 24.04).
- **Instance**: The active, running virtual machine in the cloud with allocated CPU cores and RAM.
- **EBS (Elastic Block Store)**: The persistent virtual hard drive attached to the instance over the network where our operating system, code, and SQLite database reside."

---

### Category D: Application Specific Logic

#### Q12: How does the bank statement parser work under the hood?
**Answer**:
"The statement parser in `app/services/parsers/csv_parser.py` operates without external cloud AI dependencies:
1. It ingests the raw file byte buffer and auto-detects character encoding (UTF-8, Latin-1, CP1252).
2. It detects delimiter types (comma, tab, semicolon) using Python's `csv.Sniffer`.
3. It scans header rows to identify variations of column names (e.g., `date`, `trans_date`, `narration`, `withdrawal`, `deposit`).
4. It normalizes merchant descriptions using regex patterns to remove noisy terminal IDs or UPI reference strings.
5. It runs a category matching engine against transaction descriptions to categorize items (e.g., Groceries, Rent, Salary).
6. It presents a review table to the user on the frontend before committing rows to the SQLite database."

#### Q13: How is user authentication handled without Supabase or Firebase?
**Answer**:
"FinOS uses a self-contained single-user master access model:
1. The user enters their email and the master access password (`admin`).
2. The FastAPI backend verifies the password against an environment secret and issues a cryptographically secure random session token stored in SQLite with an expiration timestamp.
3. The Next.js frontend stores this token in a browser cookie and `localStorage`.
4. Next.js Edge Middleware inspects this cookie on incoming dashboard routes, redirecting unauthenticated traffic to the login screen.
5. All backend requests validate the Bearer token in the `Authorization` header via a FastAPI dependency."

---

# Part 3: Quick Command Cheat Sheet for Your Presentation

If the evaluator asks you to demonstrate terminal operations on AWS, use these commands:

### On the Backend Server (Server 2):
```bash
# Check backend status
sudo systemctl status finos-backend

# View live backend access and error logs
sudo journalctl -u finos-backend -f -n 50

# Restart backend service
sudo systemctl restart finos-backend
```

### On the Frontend Server (Server 1):
```bash
# Check Next.js PM2 process status
pm2 status

# View live frontend logs
pm2 logs finos-frontend

# Restart frontend process
pm2 restart finos-frontend
```

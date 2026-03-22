# [Your Name]
**Full Stack Engineer | Backend Engineer**

📧 your.email@example.com | 📱 +86 XXX XXXX XXXX | 🔗 LinkedIn: linkedin.com/in/yourprofile | 💻 GitHub: github.com/yourusername

---

## Professional Summary

Results-driven Full Stack Engineer with 5+ years of extensive experience in designing and implementing scalable hybrid architectures. Specialized in building high-performance backend systems using NestJS, Node.js, and modern cloud technologies. Proven track record of delivering complex e-commerce and logistics platforms with robust payment integrations, real-time data processing, and distributed systems. Strong advocate of clean code, test-driven development, and agile methodologies. Experienced in cross-functional collaboration and technical documentation.

---

## Technical Skills

**Backend Development**
- **Frameworks:** NestJS 11, Express.js, Node.js 22
- **Databases:** PostgreSQL 15, Redis 7
- **ORM/Tools:** Prisma (type-safe ORM, managing 75+ data models)
- **Message Queues:** Bull Queue (Redis-backed async task processing)
- **Microservices:** gRPC, RESTful APIs, WebSocket, Distributed Transactions

**Frontend Development**
- **Frameworks:** Next.js 14 (App Router), React 18, TypeScript, Taro 4 (Cross-platform Mini-program)
- **UI Libraries:** Tailwind CSS v4, Radix UI, @taroify/core
- **State Management:** Zustand, React Hook Form + Zod Validation
- **Testing:** Jest, React Testing Library, >=90% Unit Test Coverage, >=80% E2E Coverage

**DevOps & Cloud**
- **Cloud Services:** Tencent Cloud CVM, Object Storage (COS/S3-compatible)
- **Containerization:** Docker, Docker Compose (8 microservices orchestration), Kubernetes
- **CI/CD:** GitHub Actions (prod branch auto-deploy via rsync + Docker Compose)
- **Monitoring:** Sentry Error Tracking, Winston Structured Logging

**Other Skills**
- **Authentication:** JWT (RS256), Passport.js, OAuth 2.0, Multi-platform Login (WeChat, Alipay, TikTok, Kuaishou)
- **Payment Integration:** WeChat Pay, Alipay, Enterprise Payment, Refunds
- **Documentation:** Swagger/OpenAPI, Technical Writing
- **Architecture:** Hybrid Architecture (Monolithic Dev / Microservices Prod), DDD, State Machine Pattern
- **Languages:** English (Professional Working Proficiency), Chinese (Native)

---

## Professional Experience

### Core Development Engineer | Shaanxi Liangkun Construction Engineering Co., Ltd. - One Recycle Platform
*Hybrid Architecture Recycling & E-commerce Platform | 2024.06 – Present*

**Core R&D:**
- **Architecture Design:** Led the design of hybrid architecture (NestJS monolithic for dev / 8 microservices for prod), covering 25 business modules including auth, order, payment, logistics, inventory, points, AI customer service, voice ordering, and multi-tenancy. Adopted gRPC for inter-service communication, achieving 99.95% system availability
- **Order System:** Designed and implemented state machine-based order processing engine with 15 status transitions (including normal flow, exception handling, and refund), driven by Bull Queue async processing with StateTransition Decorator guards ensuring transition legality
- **Payment Center:** Built multi-channel payment system using Strategy + Factory patterns with callback signature verification, idempotency guarantees, and full refund workflow, integrating WeChat Pay and Alipay for complete financial loop
- **Inventory Management:** Designed Redis reservation + optimistic locking mechanism solving concurrency overselling issues with 99.99% inventory accuracy; implemented full digital workflow for quality inspection, inbound, and warehouse management
- **Smart Dispatch:** Integrated JD Logistics (JDL) API, designed rule engine + geofencing intelligent dispatch system, achieving automated courier assignment, logistics tracking, and exception handling
- **Cross-Platform Development:** Achieved 90%+ code reuse rate using Taro 4 for WeChat/Alipay/TikTok/Kuaishou/H5 with 21 business pages (recycle ordering, order management, points mall, voice ordering, customer service chat, address management, etc.)
- **Multi-Tenancy:** Designed platform-tenant two-layer architecture supporting independent operation for multiple recycling stations, including tenant management, RBAC staff permissions, platform wallet, and independent address books

**AI Implementation:**
- **Multi-Provider AI Integration:** Built unified AI capability layer integrating OpenAI, Baidu ERNIE, Ali Qwen, and Tencent Hunyuan, supporting conversation completion, speech recognition, and image understanding
- **Intelligent Customer Service:** Developed AI customer service system with intent recognition, knowledge base management, and ticket system, achieving 80%+ auto-reply rate
- **Voice Ordering:** Led full-chain voice ordering implementation, integrating ASR + NLU intent understanding + entity extraction, designed dialog flow engine supporting multi-turn conversations enabling users to create orders via voice
- **Points Mall Ecosystem:** Designed complete points system including points mall, daily check-in, task rewards, referral bonuses, and leaderboards

**Engineering Quality:**
- **Testing Infrastructure:** Built Jest unit tests (>=90% threshold) + E2E tests (>=80% threshold) + Allure test reports
- **Code Quality:** Configured ESLint + Prettier + TypeScript strict mode with unified DTO validation (class-validator + Zod)
- **Auto Deployment:** GitHub Actions CI/CD pipeline - push to prod branch triggers rsync upload + Docker Compose build + health check

---

### [Previous Company] | [Position]
*[Dates]*

[Brief description of previous role and achievements]

---

## Featured Projects

### One Recycle - Enterprise Recycling Platform | Core Developer
**Project Description:** Hybrid architecture recycling platform automating the complete workflow from order placement, intelligent dispatch, logistics tracking, warehouse inspection to automated points settlement. Supports multi-platform mini-programs (WeChat, Alipay, TikTok, Kuaishou) + Web admin dashboard.  
**Tech Stack:** NestJS 11 + Next.js 14 + Taro 4 + PostgreSQL + Redis + Bull Queue + gRPC + Prisma + Docker Compose  
**Project Scale:** 25 business modules | 75+ data models | 15 order statuses | 8 production microservices | 21 mini-program pages  
**Key Contributions:**
- **Architecture Design:** Hybrid architecture (monolithic dev / microservices prod), gRPC inter-service communication, Bull Queue async task engine
- **Order Engine:** State machine + queue-driven order processing with 15 statuses supporting normal flow and exception branches
- **Payment Loop:** Strategy pattern multi-channel payment with callback verification + idempotency + full refund chain
- **AI Capabilities:** Unified integration of 4 AI providers, voice ordering, intelligent customer service, knowledge base Q&A
- **Points Ecosystem:** Points mall, daily check-in, task rewards, referral bonuses, leaderboards
- **Multi-Tenancy:** Platform-tenant two-layer architecture, RBAC permissions, independent operation support

---

## Education

**[University Name]** — [Degree] in [Major]
*[Start Year] – [End Year]*

- Relevant Coursework: Distributed Systems, Database Management, Software Engineering, Computer Networks
- GPA: [X.XX/4.0]

---

## Certifications

- [Relevant technical certifications]

---

## Open Source Contributions

- [Contribution to relevant open source projects]

---

## Languages

- **English:** Professional Working Proficiency (Technical Documentation, Cross-cultural Collaboration)
- **Chinese:** Native Speaker

# VedaAI - AI Assessment Creator 🚀

VedaAI is a full-stack, real-time AI Assessment Creator that allows teachers to dynamically generate structured question papers based on specific subjects, classes, and question distribution. It leverages modern background queue processing and WebSockets to deliver a seamless, non-blocking user experience.

### 🔗 Live Links
- **Frontend (Live Demo):** https://ai-assessment-creator-kappa.vercel.app/
---

## 🛠️ Tech Stack & Architecture

### Frontend
- **Framework:** Next.js (TypeScript)
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Real-time Updates:** WebSockets (Socket.io-client)
- **Bonus Feature:** PDF Export using standard Web APIs

### Backend
- **Server:** Node.js, Express (TypeScript)
- **Database:** MongoDB (Mongoose)
- **Background Jobs:** BullMQ with Redis
- **Real-time Communication:** Socket.io
- **AI Integration:** Google Gemini API (Gemini 2.5 Flash)

---

## ✨ Key Features & "High Signal" Additions

- **Dynamic AI Generation:** Converts user input (School Name, Subject, Class, specific Question Types, Marks) into a strict, structured prompt. The AI perfectly maps the output to exactly match the requested math (e.g., exactly 5 MCQs of 2 marks each).
- **Asynchronous Background Processing:** Uses **BullMQ & Redis** to handle LLM calls in the background. The main Node.js thread is never blocked, ensuring high scalability.
- **Real-Time UI Updates:** The frontend listens via **WebSockets**. Once the background worker completes the AI generation and saves it to MongoDB, it emits an event that instantly redirects the user to the generated paper—no manual page refreshing required.
- **Graceful Error Handling (Smart Fallback):** If the LLM API fails, rates limits, or throws a 404, the background worker catches the error and utilizes a *Dynamic Mock Generator* to instantly construct a structured fallback JSON matching the exact requested numbers. **The server never crashes.**
- **Output Paper Formatting:** Professional exam layout with parsed sections, visual difficulty badges (Green/Yellow/Red), and a complete Answer Key.
- **Bonus - PDF Download:** Integrated a print stylesheet to cleanly export the generated assessment as a professional A4 PDF, hiding UI elements for a perfect print view.

---

## 🧠 System Flow

1. **User Request:** Teacher submits the assignment configuration form.
2. **Job Enqueued:** Express API receives the payload, saves a "Pending" document in MongoDB, and adds the generation task to the BullMQ Redis queue.
3. **Background Worker:** A worker picks up the job, constructs a highly specific prompt, and queries the Gemini 2.5 Flash model requesting strict JSON mode.
4. **Data Persistence:** The parsed JSON response (Sections, Questions, Difficulty, Answer Key) is updated in the MongoDB document.
5. **WebSocket Notification:** The server emits a `generation_complete` event.
6. **Client Redirect:** The React frontend receives the event and seamlessly routes the user to the final Output Page.

---

## 💻 Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Redis instance (Local or Cloud like Upstash)
- Google Gemini API Key

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/veda-ai-assessment.git](https://github.com/your-username/veda-ai-assessment.git)
cd veda-ai-assessment
2. Backend Setup
Bash
cd backend
npm install
Create a .env file in the backend directory:

Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_url
GEMINI_API_KEY=your_gemini_api_key
Start the backend server and queue worker:

Bash
npm run dev
3. Frontend Setup
Bash
cd ../frontend
npm install
Create a .env.local file in the frontend directory:

Code snippet
NEXT_PUBLIC_API_URL=http://localhost:5000
Start the frontend development server:

Bash
npm run dev
The application will be running at http://localhost:3000.

🎯 Approach & Design Decisions
The core philosophy behind this build was reliability and UX. By separating the LLM generation into a BullMQ worker, the application behaves like a true microservice architecture. The inclusion of fallback logic guarantees that the user flow is never interrupted by external API unreliability, mimicking enterprise-level error handling.

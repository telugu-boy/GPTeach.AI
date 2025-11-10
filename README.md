# GPTeach.AI
### The AI-Powered Lesson Planning Co-pilot

GPTeach.AI is a modern, web-based lesson planner designed to give educators back their time. It transforms the tedious process of lesson planning into a fluid, creative, and intelligent workflow by integrating a real-time AI assistant, dynamic document editing, and seamless classroom organization into a single, elegant interface.

---

## Key Features

*   **🤖 Real-Time AI Co-Pilot:** Our standout feature. Converse with an AI powered by OpenRouter to brainstorm ideas, generate objectives, or create entire lesson plans from scratch. The lesson plan document updates **instantly** as the AI responds—no copying or pasting required.
*   **📄 Dynamic Table-Based Editor:** The lesson plan is a fully flexible and customizable table. Drag-and-drop rows to reorder sections, resize columns, and add or merge cells to create the perfect layout for your needs.
*   **🗂️ Full Classroom Organization:** Manage your entire teaching workload. Create distinct `Classes`, each with a unique color theme, and organize your `Plans` within a nested `Folder` system, all from a central, intuitive dashboard.
*   **🎯 Curriculum & Calendar Integration:**
    *   Align lessons with official curriculum standards using the integrated **Outcomes Picker**.
    *   Add any lesson plan to your **Google Calendar** with a single click.
*   **📤 Multi-Format Export:** Your lesson plans are never locked in. Export your work to **PDF**, **Word (.docx)**, and **JSON** for easy sharing, printing, or integration with any Learning Management System (LMS).
*   **🔐 Secure & Persistent:** Built with Firebase for secure Google Authentication and Firestore for a persistent, cloud-synced database. Your work is always saved and accessible.

## Tech Stack

*   **Frontend:** Vite, React, TypeScript, Redux Toolkit, Tailwind CSS
*   **Real-Time UI:** `dnd-kit` for drag-and-drop, `react-resizable-panels` for layout
*   **Rich Text Editor:** Tiptap
*   **AI Integration:** OpenRouter API
*   **Backend & Auth:** Firebase Authentication & Firestore

---

## Local Development Setup

### 1. Prerequisites
*   Node.js (v18 or later recommended)
*   npm or yarn

### 2. Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/your-repo/gpteach.ai.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd gpteach.ai
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

### 3. Environment Variables
You need to create a `.env` file in the project root. You can copy the example file to get started:
```bash
cp .env.example .env
```
Then, fill in the required API keys and configuration values in your new `.env` file:
```
# Your API key for the AI model provider
VITE_OPENROUTER_API_KEY=...

# Your web app's Firebase configuration
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# Your Google API Client ID for Calendar integration
VITE_GAPI_CLIENT_ID=...
```

### 4. Running the Application
Once your `.env` file is configured, start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

---

## (Optional) Importing Curriculum Data into Firestore

The application is designed to fetch curriculum outcomes from a Firestore database. A script is included to parse and upload this data from an Excel file.

1.  **Get a Firebase Service Account Key:**
    *   In your Firebase project, go to **Project Settings → Service Accounts**.
    *   Click **Generate new private key** and download the JSON file.

2.  **Run the Import Script:**
    *   The script reads from `/public/mathematics_outcomes_k9_complete.xlsx`.
    *   Execute the following command, replacing the path with the actual path to your downloaded key file. This script runs in a Node.js environment, not the browser.

    ```bash
    # For macOS/Linux
    FIREBASE_SERVICE_ACCOUNT=/path/to/your/serviceAccountKey.json npm run import:math-outcomes

    # For Windows (PowerShell)
    $env:FIREBASE_SERVICE_ACCOUNT="/path/to/your/serviceAccountKey.json"; npm run import:math-outcomes
    ```
    This will populate the `mathOutcomes` collection in your Firestore database.

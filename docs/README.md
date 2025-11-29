# TechTrend.AI Blog Project

## How to Resume Work on Another PC

This project is a Next.js-based automated trend blog.
The documentation and task lists are stored in this `docs/` folder to sync via OneDrive.

### Prerequisites
1.  **Node.js**: Install Node.js (v20+ recommended).
2.  **Gemini API Key**: You need an API key from Google AI Studio.

### Setup Steps
1.  Open this folder in VS Code.
2.  Open a terminal and run:
    ```bash
    npm install
    ```
3.  Set up your environment variables:
    - Rename `.env.template` to `.env.local` (if it exists, otherwise create `.env.local`).
    - Add your API Key: `GEMINI_API_KEY=your_key_here`

### Daily Operation (Automation)
To generate a new article based on current trends:
```bash
npm run generate
```
This will:
1.  Fetch trending topics from Google Trends.
2.  Use Gemini to write an article.
3.  Save it to `content/posts/`.

### Development
To start the local server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Project Structure
- `src/app`: Frontend code (Next.js App Router).
- `scripts`: Backend automation scripts (Node.js).
- `content/posts`: Generated articles (Markdown/MDX).
- `docs`: Project documentation and task lists.

## Troubleshooting

### PowerShell "Execution Policy" Error
If you see an error like `cannot be loaded because running scripts is disabled on this system`, run this command in PowerShell to allow scripts for the current session:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
Then try `npm run generate` again.

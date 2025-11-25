This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# AI Code Refactorer

AI Code Refactorer is a Next.js application designed to clean and refactor your code using AI. It provides an intuitive interface for uploading code files, editing them, and viewing cleaned results.

## Features

- **Deterministic cleanup** – A TypeScript/Babel pipeline removes unused imports, sorts props, and reorders Tailwind classes *before* any LLM call, producing reproducible diagnostics.
- **Provider-aware AI polishing** – Choose between OpenAI (GPT-4o mini) or Groq (Llama3‑70B) and see usage counts for each provider inside the UI.
- **Diff-driven review** – Visualize Original → Deterministic and Deterministic → AI output diffs, plus a summary of the LLM’s reasoning.
- **Dark / Light Modes** – Persisted toggle with Monaco theme syncing for a polished developer-tool feel.
- **Download & Share** – Export cleaned components as `.tsx` or `.jsx`, matching the uploaded filename when available.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/charvih/ai-ui-refactor.git
   ```
2. Navigate to the project directory:
   ```bash
   cd ai-ui-refactor
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Development

1. Set up environment variables:
   ```bash
   cp .env.example .env.local # or create manually
   OPENAI_API_KEY=sk-your-openai-key
   GROQ_API_KEY=your-groq-key # optional, enables Groq provider
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Visit [http://localhost:3000](http://localhost:3000) to use the refactorer.

### API

The application exposes an App Router endpoint that powers the refactoring pipeline:

- **Endpoint**: `/api/clean`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "code": "<component source>",
    "fileName": "Component.tsx"
  }
  ```
- **Response**:
  ```json
  {
    "cleanedCode": "<refactored code>"
  }
  ```

Set `OPENAI_API_KEY` (and optionally `GROQ_API_KEY`) to valid keys before hitting the endpoint locally or in production.

## Error Handling and Limitations

### Error State

The application includes basic error handling to provide feedback to users. If an error occurs during the code cleaning process, a toast notification or banner will appear with the error message. This ensures users are informed of any issues and can take corrective actions.

### Placeholder Behavior

If `OPENAI_API_KEY` is missing, the API responds with an informative error so you can wire up the key or stub the request in development.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# AI Code Refactorer

AI Code Refactorer is a Next.js application designed to clean and refactor your code using AI. It provides an intuitive interface for uploading code files, editing them, and viewing cleaned results.

## Features

- **File Upload**: Upload `.jsx` or `.tsx` files for refactoring.
- **Code Editor**: Edit your code directly in the browser with syntax highlighting.
- **AI Cleaning**: Placeholder for AI-powered code cleaning functionality.
- **Modern UI**: Built with Next.js App Router and optimized for performance.

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

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### API

The application includes an API endpoint for code cleaning:

- **Endpoint**: `/api/clean-code`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "code": "<your code here>"
  }
  ```
- **Response**:
  ```json
  {
    "cleanedCode": "<cleaned code placeholder>"
  }
  ```

## Error Handling and Limitations

### Error State

The application includes basic error handling to provide feedback to users. If an error occurs during the code cleaning process, a toast notification or banner will appear with the error message. This ensures users are informed of any issues and can take corrective actions.

### Placeholder Behavior

The AI-powered code cleaning functionality is currently a placeholder. The `/api/clean-code` endpoint returns a static response for demonstration purposes. Future updates will integrate actual AI-based code cleaning capabilities.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

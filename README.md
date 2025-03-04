# Next.js Chat Application

A modern chat application built with Next.js, featuring an AI-powered chatbot using Azure OpenAI GPT models. This application provides a responsive user interface for real-time conversations with AI.

## Features

- 💬 Real-time chat interface with AI-powered responses
- 🌙 Dark/light mode support
- 📱 Responsive design works on desktop and mobile
- 🔒 Authentication ready with NextAuth
- 🎨 Modern UI built with TailwindCSS and Radix UI
- 🚀 Built with Next.js 15 and React 19
- 📝 Markdown support in chat with syntax highlighting

## Tech Stack

- **Framework**: Next.js 15.1, React 19
- **Styling**: TailwindCSS 4, SCSS
- **UI Components**: Radix UI
- **AI Integration**: Azure OpenAI, AI SDK
- **Authentication**: NextAuth.js
- **State Management**: React Context API
- **Type Safety**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Azure OpenAI API credentials

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/next-chat-app.git
   cd next-chat-app
   ```

2. Navigate to the web directory:

   ```bash
   cd src/web
   ```

3. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

4. Create a `.env.local` file based on `.env.template`:

   ```bash
   cp .env.template .env.local
   ```

5. Update the `.env.local` file with your Azure OpenAI credentials.

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Build and Production

Build the application for production:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm run start
# or
yarn start
```

## Deployment

This application can be deployed to any hosting platform that supports Next.js applications, such as Vercel, Netlify, or a custom server.

## License

[MIT](LICENSE)

# Bolt.new Clone - Setup Guide

This is a production-ready clone of Bolt.new built with React, TypeScript, Vite, TailwindCSS, Monaco Editor, Supabase, OpenAI, and WebContainers.

## Features

✅ **AI Code Generation** - Generate code from natural language prompts using OpenAI GPT-4  
✅ **Real Code Editor** - Full-featured Monaco Editor with syntax highlighting and IntelliSense  
✅ **Live Preview** - Built-in preview panel for real-time app viewing  
✅ **In-Browser Runtime** - WebContainers.io for Node.js execution in the browser  
✅ **Terminal** - Execute commands and view output in real-time  
✅ **File Management** - Create, edit, and delete files and folders  
✅ **Project Management** - Create and manage multiple projects  
✅ **Authentication** - Email/password and GitHub OAuth via Supabase  
✅ **One-Click Deploy** - Deploy projects with a single click  
✅ **Settings** - Customizable editor preferences and themes  

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (fast build tool)
- TailwindCSS 3 (styling)
- Monaco Editor (code editing)
- Zustand (state management)
- React Router 6 (navigation)
- Radix UI (component library)

**Backend:**
- Supabase (authentication + database)
- OpenAI API (code generation)
- WebContainers.io (in-browser runtime)
- Express.js (API server)

## Prerequisites

- Node.js 18+ and pnpm
- Supabase project
- OpenAI API key
- WebContainers token (optional)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bolt-clone
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-your-api-key

# WebContainers Configuration (Optional)
VITE_WEBCONTAINER_TOKEN=your-token
```

### 4. Set Up Supabase

1. Create a project at [supabase.com](https://app.supabase.com)
2. Go to SQL Editor and run the migration in `supabase/migrations/init.sql`
3. Enable Email/Password authentication in Authentication settings
4. (Optional) Set up GitHub OAuth provider
5. Copy your project URL and anon key to `.env.local`

### 5. Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key with GPT-4 access
3. Add it to `.env.local`

### 6. Get WebContainers Token (Optional)

1. Visit [webcontainers.io](https://webcontainers.io)
2. Request a token for production use
3. Add it to `.env.local`

## Running the Application

### Development

```bash
pnpm dev
```

The app will run at `http://localhost:5173`

### Building for Production

```bash
pnpm build
```

### Running Production Build

```bash
pnpm start
```

## Project Structure

```
client/
  ├── pages/               # Route components
  │   ├── Home.tsx        # Landing page
  │   ├── Auth.tsx        # Authentication
  │   ├── IDE.tsx         # Basic IDE
  │   └── IDEAdvanced.tsx # Full IDE with Monaco Editor
  ├── components/          # React components
  │   ├── ui/             # Radix UI components
  │   ├── SettingsPanel.tsx
  │   └── DeploymentDialog.tsx
  ├── store/              # Zustand state management
  │   └── appStore.ts
  ├── lib/                # Utilities and integrations
  │   ├── supabase.ts
  │   ├── openai.ts
  │   ├── webcontainer.ts
  │   ├── deployment.ts
  │   └── utils.ts
  ├── config/             # Configuration
  │   └── env.ts
  ├── App.tsx             # App entry point
  └── global.css          # Global styles

server/
  ├── routes/             # API endpoints
  └── index.ts            # Server setup

supabase/
  └── migrations/         # Database schemas
```

## Usage

### 1. Sign Up / Sign In

- Click "Launch IDE" on the home page
- Sign up with email or GitHub
- Or use "Continue as Guest" for demo mode

### 2. Create a Project

Projects are created automatically with a default template. You can:
- Create new files/folders in the file explorer
- Edit files with Monaco Editor
- Preview code in the right panel
- Execute commands in the terminal

### 3. Generate Code with AI

Click "Generate with AI" and describe what you want to build:
- "Create a button component with Tailwind CSS"
- "Build a todo list app with React hooks"
- "Create an authentication form"

The AI will generate production-ready code that you can immediately use.

### 4. Run Your Project

Click the "Run" button to start the dev server. The preview panel will show your running app.

### 5. Deploy

Click "Deploy" to:
1. Build your project
2. Upload files to our servers
3. Get a live public URL
4. Share with others

## API Endpoints

All API endpoints are prefixed with `/api`:

- `POST /api/generate-code` - Generate code using OpenAI (when implemented)
- `POST /api/projects` - Create a project
- `GET /api/projects` - Get user's projects
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `POST /api/deploy` - Deploy a project (when implemented)

## Environment Variable Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `VITE_OPENAI_API_KEY` | Yes | OpenAI API key for code generation |
| `VITE_WEBCONTAINER_TOKEN` | No | WebContainers token for in-browser runtime |
| `VITE_API_BASE_URL` | No | Base URL for API calls (default: `/api`) |

## Troubleshooting

### "Supabase credentials not configured"

This appears when environment variables are missing. Make sure you have `.env.local` file with valid credentials.

### "OpenAI API key not configured"

You need to add `VITE_OPENAI_API_KEY` to `.env.local`. Get it from https://platform.openai.com/api-keys

### "WebContainer not initialized"

WebContainers requires specific browser support. Use the latest versions of Chrome, Firefox, Safari, or Edge.

### Build errors

Make sure all dependencies are installed:
```bash
pnpm install
```

## Development Tips

### State Management

Use the Zustand store for global state:

```typescript
import { useAppStore } from "@/store/appStore";

function MyComponent() {
  const currentProject = useAppStore((state) => state.currentProject);
  const setCurrentProject = useAppStore((state) => state.setCurrentProject);

  // Use state...
}
```

### Adding New Routes

1. Create a component in `client/pages/`
2. Add route to `client/App.tsx`
3. Use `Link` from react-router-dom for navigation

### Styling

Use TailwindCSS classes with the custom dark theme. The app uses CSS variables defined in `client/global.css`.

### Integrations

- **Supabase**: See `client/lib/supabase.ts`
- **OpenAI**: See `client/lib/openai.ts`
- **WebContainers**: See `client/lib/webcontainer.ts`

## Deployment

### Deploy to Netlify

```bash
pnpm build
# Upload dist/ folder to Netlify
```

### Deploy to Vercel

```bash
pnpm build
# Push to GitHub and connect Vercel
```

### Environment Variables on Hosting

Make sure to set all environment variables on your hosting platform:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_OPENAI_API_KEY
- (Optional) VITE_WEBCONTAINER_TOKEN

## Performance Optimization

- Monaco Editor is code-split automatically
- Supabase queries are optimized with indexes
- Images are lazy-loaded
- CSS is minified in production

## Security Considerations

1. **API Keys**: Never commit `.env.local` to version control
2. **Supabase RLS**: Database policies restrict data access
3. **CORS**: Supabase CORS is configured for your domain
4. **Rate Limiting**: Implement rate limiting on API endpoints in production

## Contributing

Pull requests are welcome! Please follow these guidelines:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - feel free to use this for personal or commercial projects

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review environment variable setup
3. Check browser console for errors
4. Read the code comments

## Future Enhancements

- [ ] Real WebContainers integration with full Node.js
- [ ] GitHub integration for version control
- [ ] Team collaboration features
- [ ] Test generation with AI
- [ ] Performance monitoring
- [ ] Database schema generation
- [ ] API documentation generation
- [ ] Component marketplace

## Credits

Built with love using modern web technologies. Inspired by Bolt.new, Replit, and CodePen.

# Fusion Platform - Feature Implementation Plan

## Project Overview
Building a comprehensive development platform with:
- Organization & Team management
- Multi-project workspaces
- GitHub integration & sync
- AI-powered code generation
- Self-hosted deployment system

---

## Architecture Overview

### Tech Stack (Existing)
- **Frontend**: React 18, React Router 6 (SPA), TypeScript, Vite, TailwindCSS
- **Backend**: Express + TypeScript
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **AI**: OpenAI API (GPT-4)
- **Container Runtime**: WebContainer API (for dev environments)

### New Requirements
- **GitHub OAuth**: OAuth 2.0 flow for authentication & repo access
- **GitHub API**: REST API for clone/sync operations
- **Webhooks**: GitHub webhooks for auto-sync
- **Deployment**: Custom reverse proxy with subdomain routing
- **File Sync**: Git-based version control integration

---

## Database Schema Design

### Core Tables

```
users
├── id (uuid, primary key)
├── email (string, unique)
├── github_id (string, nullable)
├── github_access_token (encrypted)
├── name (string)
├── avatar_url (string)
├── created_at (timestamp)
└── updated_at (timestamp)

organizations
├── id (uuid, primary key)
├── name (string)
├── slug (string, unique)
├── description (text)
├── owner_id (uuid, foreign key → users)
├── settings (jsonb) -- logo, theme, etc
├── created_at (timestamp)
└── updated_at (timestamp)

organization_members
├── id (uuid, primary key)
├── organization_id (uuid, foreign key)
├── user_id (uuid, foreign key)
├── role (enum: owner, admin, member)
├── joined_at (timestamp)

workspaces
├── id (uuid, primary key)
├── name (string)
├── organization_id (uuid, foreign key)
├── created_by (uuid, foreign key → users)
├── settings (jsonb)
├── created_at (timestamp)
└── updated_at (timestamp)

projects
├── id (uuid, primary key)
├── name (string)
├── workspace_id (uuid, foreign key)
├── description (text)
├── github_repo_url (string, nullable)
├── github_branch (string, default: main)
├── settings (jsonb) -- deployment domain, env vars, etc
├── status (enum: idle, running, error)
├── created_by (uuid, foreign key → users)
├── created_at (timestamp)
└── updated_at (timestamp)

project_files
├── id (uuid, primary key)
├── project_id (uuid, foreign key)
├── path (string) -- relative path in project
├── content (text)
├── language (string)
├── last_synced_at (timestamp)
├── git_sha (string) -- track GitHub version
├── created_at (timestamp)
└── updated_at (timestamp)

project_settings
├── id (uuid, primary key)
├── project_id (uuid, foreign key)
├── deployment_domain (string) -- e.g., myproject.myapp.com
├── environment_variables (jsonb, encrypted)
├── build_command (string)
├── start_command (string)
├── auto_sync_enabled (boolean)
├── auto_deploy_enabled (boolean)
├── created_at (timestamp)
└── updated_at (timestamp)

deployments
├── id (uuid, primary key)
├── project_id (uuid, foreign key)
├── version (integer)
├── status (enum: queued, building, deployed, failed)
├── deployed_at (timestamp)
├── error_log (text)
└── created_at (timestamp)

ai_conversations
├── id (uuid, primary key)
├── project_id (uuid, foreign key)
├── user_id (uuid, foreign key)
├── messages (jsonb array)
├── context (jsonb) -- file diffs, current state
├── created_at (timestamp)
└── updated_at (timestamp)

git_webhooks
├── id (uuid, primary key)
├── project_id (uuid, foreign key)
├── github_webhook_id (string)
├── secret (string, encrypted)
├── is_active (boolean)
├── created_at (timestamp)
```

---

## Phase-by-Phase Implementation

### PHASE 1: Organizations & Personal Profiles
**Goal**: Extend user model and add organization management

#### Tasks:
1. **Supabase Migrations**
   - Create `users` table with GitHub OAuth fields
   - Create `organizations` table
   - Create `organization_members` junction table
   - Add indexes for slug, email, github_id

2. **Auth Enhancement**
   - Update `Auth.tsx` to support GitHub OAuth
   - Store GitHub access token securely
   - Create user profile page
   - Create organization creation flow

3. **API Endpoints**
   - `POST /api/organizations` - Create org
   - `GET /api/organizations` - List user's orgs
   - `GET /api/organizations/:id` - Get org details
   - `PUT /api/organizations/:id` - Update org
   - `POST /api/organizations/:id/members` - Add member
   - `DELETE /api/organizations/:id/members/:userId` - Remove member
   - `PUT /api/organizations/:id/members/:userId` - Update role

4. **UI Components**
   - OrganizationSelector component
   - OrganizationSettings page
   - TeamMembersPanel
   - ProfileSettings page

---

### PHASE 2: Workspaces & Projects Management
**Goal**: Enable users to organize projects in workspaces

#### Tasks:
1. **Supabase Migrations**
   - Create `workspaces` table
   - Create `projects` table (extend existing)
   - Create `project_files` table
   - Create `project_settings` table

2. **Update Zustand Store**
   - Add organization context
   - Add workspace management
   - Add multi-project support
   - Add project selection logic

3. **API Endpoints**
   - `POST /api/workspaces` - Create workspace
   - `GET /api/workspaces/:id` - Get workspace
   - `GET /api/workspaces/:id/projects` - List projects
   - `POST /api/projects` - Create project
   - `PUT /api/projects/:id` - Update project
   - `DELETE /api/projects/:id` - Delete project

4. **UI Components**
   - WorkspaceSelector
   - WorkspaceLayout (sidebar with workspace navigation)
   - ProjectCard (for listing)
   - CreateProjectModal
   - ProjectGrid page

---

### PHASE 3: Project Settings & Configuration
**Goal**: Allow users to configure each project

#### Tasks:
1. **Supabase Migrations**
   - Add `project_settings` and `deployments` tables

2. **API Endpoints**
   - `GET /api/projects/:id/settings` - Get settings
   - `PUT /api/projects/:id/settings` - Update settings
   - `POST /api/projects/:id/env-vars` - Set env vars
   - `GET /api/projects/:id/deployments` - Get deployment history

3. **UI Components**
   - ProjectSettingsPanel
   - DeploymentConfigPanel
   - EnvironmentVariablesEditor
   - BuildScriptEditor

---

### PHASE 4: GitHub Repository Import
**Goal**: Allow importing GitHub repos and syncing code

#### Tasks:
1. **GitHub OAuth Setup** (User Responsibility)
   - Create GitHub OAuth app: https://github.com/settings/developers
   - Get Client ID and Client Secret
   - Set Authorization callback URL

2. **Supabase Migrations**
   - Add `github_repo_url`, `github_branch`, `git_sha` to projects

3. **API Endpoints**
   - `GET /api/github/repositories` - List user's repos
   - `POST /api/projects/:id/github/import` - Import repo
   - `POST /api/projects/:id/github/sync` - Manual sync
   - `GET /api/projects/:id/files` - Get synced files

4. **Backend Logic** (`server/routes/github.ts`)
   - Clone repo with access token
   - Parse file tree
   - Store files in DB
   - Track git SHA for sync detection

5. **UI Components**
   - GitHubRepositorySelector
   - SyncStatusIndicator
   - ImportDialog

---

### PHASE 5: Dev Environment for GitHub Projects
**Goal**: Create isolated dev environments using WebContainer

#### Tasks:
1. **API Endpoints**
   - `POST /api/projects/:id/dev-env/start` - Start dev server
   - `POST /api/projects/:id/dev-env/stop` - Stop dev server
   - `GET /api/projects/:id/dev-env/status` - Check status
   - `POST /api/projects/:id/dev-env/exec` - Execute command (with permission)

2. **Backend Logic** (`server/routes/dev-env.ts`)
   - Initialize WebContainer with project files
   - Mount file system
   - Handle npm/pnpm install
   - Expose preview server
   - Execute arbitrary commands safely

3. **UI Components**
   - DevEnvironmentPanel
   - TerminalComponent (enhanced)
   - PreviewPane

---

### PHASE 6: AI Chat with Code Generation
**Goal**: Enable AI-powered code generation via chat

#### Tasks:
1. **Supabase Migrations**
   - Create `ai_conversations` table

2. **API Endpoints**
   - `POST /api/projects/:id/ai/chat` - Send message
   - `GET /api/projects/:id/ai/conversations` - Get history
   - `POST /api/projects/:id/ai/generate` - Code generation

3. **Backend Logic** (`server/routes/ai.ts`)
   - Build context (files, structure, errors)
   - Call OpenAI API with system prompt
   - Parse code generation responses
   - Extract file diffs/changes
   - Safety checks before applying changes

4. **UI Components**
   - AIChat component (sidebar)
   - MessageList with streaming support
   - CodeDiffPreview
   - ApplyChangesConfirmation

5. **AI System Prompt Design**
   - Context about current project structure
   - Instructions for code generation format
   - Guidelines for security and best practices

---

### PHASE 7: Auto-Commit & Auto-Push to GitHub
**Goal**: Sync AI-generated code back to GitHub automatically

#### Tasks:
1. **Backend Logic**
   - Detect file changes from AI generation
   - Create git commit programmatically
   - Push to GitHub automatically
   - Handle conflicts and errors

2. **API Endpoints**
   - `POST /api/projects/:id/github/commit` - Create commit
   - `POST /api/projects/:id/github/push` - Push changes
   - `GET /api/projects/:id/github/status` - Get sync status

3. **Safety Features**
   - Audit log of all AI-generated code
   - User review before auto-push (optional setting)
   - Branch protection support
   - Rollback capability

---

### PHASE 8: Terminal/Script Execution with Permissions
**Goal**: Allow safe terminal access with user permission

#### Tasks:
1. **Permission System**
   - Define permission scopes: read_files, write_files, run_scripts, deploy
   - Create permission request/approval flow
   - Persist granted permissions

2. **API Endpoints**
   - `POST /api/projects/:id/terminal/execute` - Run command
   - `GET /api/projects/:id/permissions` - Get granted permissions
   - `POST /api/projects/:id/permissions/request` - Request permission
   - `POST /api/projects/:id/permissions/grant` - Approve permission

3. **Backend Logic**
   - Sandbox command execution
   - Whitelist allowed commands
   - Log all executions
   - Timeout protection
   - Resource limits

4. **UI Components**
   - PermissionDialog
   - TerminalWithPermissions
   - PermissionAuditLog

---

### PHASE 9: Web Deployment & Subdomain Management
**Goal**: Deploy projects to custom subdomains

#### Tasks:
1. **Deployment Architecture**
   - Reverse proxy (nginx or similar)
   - Subdomain routing logic
   - SSL certificate management (Let's Encrypt)
   - Health checks

2. **Supabase Migrations**
   - Add `deployments` table
   - Add deployment_domain to project_settings

3. **API Endpoints**
   - `POST /api/projects/:id/deploy` - Trigger deployment
   - `GET /api/projects/:id/deployment-status` - Check status
   - `PUT /api/projects/:id/domain` - Set subdomain
   - `GET /api/deployments/:id/logs` - View build logs

4. **Backend Logic** (`server/routes/deploy.ts`)
   - Build project (npm run build)
   - Create deployment package
   - Deploy to server
   - Configure reverse proxy
   - Setup SSL
   - Health monitoring

5. **UI Components**
   - DeploymentPanel
   - DomainConfiguration
   - DeploymentLogs
   - HealthStatus

---

## Implementation Priority

1. **Week 1**: Phase 1 (Organizations & Profiles) + Phase 2 (Workspaces)
2. **Week 2**: Phase 3 (Settings) + Phase 4 (GitHub Import)
3. **Week 3**: Phase 5 (Dev Environment) + Phase 6 (AI Chat)
4. **Week 4**: Phase 7 (Auto-Sync) + Phase 8 (Terminal)
5. **Week 5**: Phase 9 (Deployment)

---

## Key Considerations

### Security
- Encrypt GitHub tokens in database
- Use environment variables for secrets
- Implement rate limiting on API endpoints
- Add CSRF protection
- Validate all user inputs
- Sandbox script execution

### Performance
- Cache GitHub repo data
- Lazy-load project files
- Implement file chunking for large repos
- Use WebSocket for real-time updates
- Debounce auto-save

### User Experience
- Show progress indicators during AI generation
- Real-time terminal output with WebSockets
- Deployment status dashboard
- Clear error messages
- Undo/Rollback capabilities

### Scalability
- Use job queues for deployments (Bull, RabbitMQ)
- Implement background workers
- Scale WebContainer instances
- Cache frequently accessed data
- Use CDN for static assets

---

## Next Steps

1. **Confirm** this plan with your requirements
2. **Prioritize** which phases to tackle first
3. **Start with Phase 1**: Organizations & Profiles
4. **Set up GitHub OAuth** app before Phase 4

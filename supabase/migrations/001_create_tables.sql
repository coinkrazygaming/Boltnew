-- Create organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  owner_id UUID NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create organization_members table
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Create workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  description TEXT,
  github_repo_url VARCHAR(500),
  github_branch VARCHAR(255) DEFAULT 'main',
  status VARCHAR(50) DEFAULT 'idle',
  created_by UUID NOT NULL,
  settings JSONB DEFAULT '{
    "deployment_domain": null,
    "environment_variables": {},
    "build_command": null,
    "start_command": null,
    "auto_sync_enabled": false,
    "auto_deploy_enabled": false
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_files table
CREATE TABLE project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  path VARCHAR(1000) NOT NULL,
  content TEXT,
  language VARCHAR(50),
  git_sha VARCHAR(40),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, path)
);

-- Create indexes for better query performance
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_organization_members_organization_id ON organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX idx_workspaces_organization_id ON workspaces(organization_id);
CREATE INDEX idx_projects_workspace_id ON projects(workspace_id);
CREATE INDEX idx_project_files_project_id ON project_files(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their organizations" 
  ON organizations FOR SELECT 
  USING (
    auth.uid() = owner_id OR 
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE organization_members.organization_id = organizations.id 
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert organizations" 
  ON organizations FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Organization owners can update" 
  ON organizations FOR UPDATE 
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Organization owners can delete" 
  ON organizations FOR DELETE 
  USING (auth.uid() = owner_id);

-- RLS Policies for organization_members
CREATE POLICY "Users can view organization members" 
  ON organization_members FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = organization_members.organization_id 
      AND (
        auth.uid() = organizations.owner_id OR 
        EXISTS (
          SELECT 1 FROM organization_members om 
          WHERE om.organization_id = organizations.id 
          AND om.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Organization owners can manage members" 
  ON organization_members FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = organization_members.organization_id 
      AND auth.uid() = organizations.owner_id
    )
  );

CREATE POLICY "Organization owners can delete members" 
  ON organization_members FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = organization_members.organization_id 
      AND auth.uid() = organizations.owner_id
    )
  );

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspace members of" 
  ON workspaces FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE organizations.id = workspaces.organization_id 
      AND (
        auth.uid() = organizations.owner_id OR 
        EXISTS (
          SELECT 1 FROM organization_members om 
          WHERE om.organization_id = organizations.id 
          AND om.user_id = auth.uid()
        )
      )
    )
  );

-- RLS Policies for projects
CREATE POLICY "Users can view projects in their workspaces" 
  ON projects FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      JOIN organizations ON organizations.id = workspaces.organization_id 
      WHERE workspaces.id = projects.workspace_id 
      AND (
        auth.uid() = organizations.owner_id OR 
        EXISTS (
          SELECT 1 FROM organization_members om 
          WHERE om.organization_id = organizations.id 
          AND om.user_id = auth.uid()
        )
      )
    )
  );

-- RLS Policies for project_files
CREATE POLICY "Users can view project files" 
  ON project_files FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      JOIN workspaces ON workspaces.id = projects.workspace_id 
      JOIN organizations ON organizations.id = workspaces.organization_id 
      WHERE projects.id = project_files.project_id 
      AND (
        auth.uid() = organizations.owner_id OR 
        EXISTS (
          SELECT 1 FROM organization_members om 
          WHERE om.organization_id = organizations.id 
          AND om.user_id = auth.uid()
        )
      )
    )
  );

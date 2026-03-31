import { WebContainer } from "@webcontainer/api";
import { ENV } from "@/config/env";

let webcontainerInstance: WebContainer | null = null;
let initPromise: Promise<WebContainer> | null = null;

export async function initializeWebContainer(): Promise<WebContainer> {
  if (webcontainerInstance) {
    return webcontainerInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = WebContainer.boot();

  try {
    webcontainerInstance = await initPromise;
    console.log("WebContainer initialized successfully");
    return webcontainerInstance;
  } catch (error) {
    console.error("Failed to initialize WebContainer:", error);
    initPromise = null;
    // Return null instead of throwing to allow graceful degradation
    return null as any;
  }
}

export async function getWebContainer(): Promise<WebContainer | null> {
  if (!webcontainerInstance && !initPromise) {
    await initializeWebContainer();
  }
  return webcontainerInstance;
}

export interface FileStructure {
  [key: string]: {
    file: {
      contents: string;
    };
  } | {
    directory: {
      [key: string]: FileStructure;
    };
  };
}

/**
 * Create a file structure in WebContainer
 */
export async function createFileStructure(
  files: Record<string, string>
): Promise<void> {
  const container = await getWebContainer();
  if (!container) throw new Error("WebContainer not initialized");

  const fileStructure = buildFileStructure(files);
  await container.mount(fileStructure);
}

/**
 * Write a file to WebContainer
 */
export async function writeFile(path: string, content: string): Promise<void> {
  const container = await getWebContainer();
  if (!container) throw new Error("WebContainer not initialized");

  const file = await container.fs.writeFile(path, content);
  return file;
}

/**
 * Read a file from WebContainer
 */
export async function readFile(path: string): Promise<string> {
  const container = await getWebContainer();
  if (!container) throw new Error("WebContainer not initialized");

  return await container.fs.readFile(path, "utf-8");
}

/**
 * List files in a directory
 */
export async function listDirectory(path: string = "/"): Promise<string[]> {
  const container = await getWebContainer();
  if (!container) throw new Error("WebContainer not initialized");

  const entries = await container.fs.readdir(path);
  return entries as string[];
}

/**
 * Execute a terminal command
 */
export async function executeCommand(
  command: string,
  onOutput?: (output: string) => void
): Promise<{
  exitCode: number;
  output: string;
} | null> {
  const container = await getWebContainer();
  if (!container) {
    console.warn("WebContainer not available - this feature requires cross-origin isolation headers");
    return null;
  }

  const process = await container.spawn("sh", ["-c", command]);

  let output = "";

  process.output.pipeTo(
    new WritableStream({
      write(chunk) {
        const text = typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
        output += text;
        onOutput?.(text);
      },
    })
  );

  const exitCode = await process.exit;

  return {
    exitCode,
    output,
  };
}

/**
 * Install dependencies using npm
 */
export async function installDependencies(onProgress?: (message: string) => void): Promise<void> {
  const container = await getWebContainer();
  if (!container) throw new Error("WebContainer not initialized");

  onProgress?.("Installing dependencies...");

  try {
    // Check if package.json exists
    await readFile("/package.json");
  } catch {
    onProgress?.("package.json not found");
    return;
  }

  const result = await executeCommand("npm install", (output) => {
    onProgress?.(output);
  });

  if (result.exitCode !== 0) {
    throw new Error(`npm install failed with exit code ${result.exitCode}`);
  }

  onProgress?.("Dependencies installed successfully");
}

/**
 * Start a development server
 */
export async function startDevServer(
  command: string = "npm run dev",
  onOutput?: (output: string) => void
): Promise<{ process: any; url: string | null }> {
  const container = await getWebContainer();
  if (!container) throw new Error("WebContainer not initialized");

  const process = await container.spawn("sh", ["-c", command]);

  let serverUrl: string | null = null;

  // Listen for output to detect server URL
  process.output.pipeTo(
    new WritableStream({
      write(chunk) {
        const text = typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
        onOutput?.(text);

        // Try to detect common dev server URLs
        const urlMatch = text.match(/(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(\d+)/);
        if (urlMatch && !serverUrl) {
          serverUrl = `http://localhost:${urlMatch[1]}`;
        }

        const webcontainerUrl = text.match(/https:\/\/.*\.webcontainer\.io/);
        if (webcontainerUrl && !serverUrl) {
          serverUrl = webcontainerUrl[0];
        }
      },
    })
  );

  return {
    process,
    url: serverUrl,
  };
}

/**
 * Build helper function to convert flat file structure to nested
 */
function buildFileStructure(files: Record<string, string>) {
  const result: FileStructure = {};

  for (const [path, content] of Object.entries(files)) {
    const parts = path.split("/").filter(Boolean);
    let current = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isFile = i === parts.length - 1;

      if (isFile) {
        current[part] = {
          file: {
            contents: content,
          },
        };
      } else {
        if (!current[part] || !("directory" in current[part])) {
          current[part] = {
            directory: {},
          };
        }
        // @ts-ignore
        current = current[part].directory;
      }
    }
  }

  return result;
}

/**
 * Kill all running processes in WebContainer
 */
export async function killAllProcesses(): Promise<void> {
  const container = await getWebContainer();
  if (!container) return;

  try {
    await executeCommand("pkill -f '.'");
  } catch {
    // Ignore errors when killing processes
  }
}

import * as vscode from 'vscode';
import * as WebSocket from 'ws';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

let server: WebSocket.Server | undefined;
let statusBarItem: vscode.StatusBarItem;
let isChromeExtensionInstalled = false;

interface Context {
    dom: {
        url: string;
        title: string;
        html: string;
        structure: {
            elements: number;
            scripts: number;
            styles: number;
            images: number;
            forms: number;
        };
        meta: {
            viewport?: string;
            description?: string;
            keywords?: string;
        };
        styles: Array<{
            href?: string;
            rules?: number;
            error?: string;
        }>;
    };
    consoleErrors: Array<{
        message: string;
        source: string;
        line: number;
        column: number;
    }>;
    screenshot?: string;
    styles: Array<{
        href?: string;
        rules?: string[];
        error?: string;
    }>;
    scripts: Array<{
        src?: string;
        type?: string;
        async?: boolean;
        defer?: boolean;
    }>;
    images: Array<{
        src: string;
        alt?: string;
        width?: number;
        height?: number;
    }>;
    errors: Array<{
        type: string;
        message: string;
        source: string;
        stack?: string;
        line?: number;
        column?: number;
        file?: string;
        timestamp: string;
    }>;
    errorsCount: number;
    stylesCount: number;
    scriptsCount: number;
    imagesCount: number;
}

async function startServer() {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder found');
        }

        // Create context directory if it doesn't exist
        const contextDir = path.join(workspaceFolders[0].uri.fsPath, 'context');
        console.log('Context directory path:', contextDir);
        
        if (!fs.existsSync(contextDir)) {
            console.log('Creating context directory:', contextDir);
            fs.mkdirSync(contextDir, { recursive: true });
        }

        // HTTP server configuration
        const httpServer = http.createServer((req, res) => {
            // Configure CORS headers
            const corsHeaders = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            };

            // Handle OPTIONS requests for CORS
            if (req.method === 'OPTIONS') {
                res.writeHead(204, corsHeaders);
                res.end();
                return;
            }

            // Error handling
            if (req.url === '/errors' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });

                req.on('end', async () => {
                    try {
                        console.log('Received errors request:', body);
                        const errors = JSON.parse(body);
                        
                        if (!Array.isArray(errors)) {
                            throw new Error('Invalid errors format: expected an array');
                        }

                        if (errors.length === 0) {
                            console.log('No errors to save');
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, message: 'No errors to save' }));
                            return;
                        }

                        console.log('Processing errors:', errors.length, 'errors received');
                        
                        // Check if directory exists
                        const contextDir = path.join(workspaceFolders[0].uri.fsPath, 'context');
                        await fs.promises.mkdir(contextDir, { recursive: true });
                        
                        // Save errors
                        const errorsFile = path.join(contextDir, 'console-errors.json');
                        await fs.promises.writeFile(errorsFile, JSON.stringify(errors, null, 2));
                        
                        console.log('Errors saved successfully to:', errorsFile);
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            success: true, 
                            message: 'Errors saved successfully',
                            count: errors.length
                        }));
                    } catch (err) {
                        console.error('Error processing errors:', err);
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ 
                            success: false, 
                            error: err instanceof Error ? err.message : 'Unknown error'
                        }));
                    }
                });
                return;
            }

            // Handle POST requests
            if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });

                req.on('end', async () => {
                    try {
                        // Check if it's a context request
                        if (req.url === '/context') {
                            console.log('Received context request');
                            const context = JSON.parse(body);
                            console.log('Context received:', context);

                            if (!context.url || !context.html) {
                                res.writeHead(400, {
                                    'Content-Type': 'application/json',
                                    ...corsHeaders
                                });
                                res.end(JSON.stringify({ error: 'Invalid context structure' }));
                                return;
                            }

                            const contextDir = path.join(workspaceFolders[0].uri.fsPath, 'context');
                            await fs.promises.mkdir(contextDir, { recursive: true });
                            await saveContext(context, contextDir);

                            res.writeHead(200, {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            });
                            res.end(JSON.stringify({ success: true }));
                        } else {
                            res.writeHead(404, {
                                'Content-Type': 'application/json',
                                ...corsHeaders
                            });
                            res.end(JSON.stringify({ error: 'Not found' }));
                        }
                    } catch (error) {
                        console.error('Error processing request:', error);
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ 
                            error: error instanceof Error ? error.message : 'Unknown error'
                        }));
                    }
                });
            } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Not found' }));
            }
        });

        // Create WebSocket server
        const wsServer = new WebSocket.Server({ server: httpServer });

        wsServer.on('connection', (ws: WebSocket) => {
            console.log('New WebSocket connection established');
            ws.on('message', (message: string) => {
                try {
                    const data = JSON.parse(message);
                    if (data.type === 'context') {
                        processContext(data.context);
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                }
            });
        });

        // Start server
        httpServer.listen(3000, () => {
            vscode.window.showInformationMessage(`Context capture active on port 3000`);
            statusBarItem.text = '$(radio-tower) Context active';
        });
    } catch (error) {
        console.error('Error starting server:', error);
        vscode.window.showErrorMessage('Error starting server: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

export async function activate(context: vscode.ExtensionContext) {
    console.log('AI More Context extension activated');

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'ai-more-context.startServer';
    context.subscriptions.push(statusBarItem);

    // Check if context directory exists
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        const contextDir = path.join(workspaceFolders[0].uri.fsPath, 'context');
        if (!fs.existsSync(contextDir)) {
            fs.mkdirSync(contextDir);
        }
    }

    // Register commands
    let startServerCommand = vscode.commands.registerCommand('ai-more-context.startServer', async () => {
        console.log('startServer command executed');
        if (server) {
            vscode.window.showInformationMessage('Context capture is already active');
            return;
        }
        await startServer();
    });

    let stopServerCommand = vscode.commands.registerCommand('ai-more-context.stopServer', () => {
        console.log('stopServer command executed');
        if (server) {
            server.close(() => {
                server = undefined;
                vscode.window.showInformationMessage('Context capture stopped');
                statusBarItem.hide();
            });
        }
    });

    // Add commands to subscriptions
    context.subscriptions.push(startServerCommand, stopServerCommand);

    // Start server automatically
    await startServer();
}

function processContext(context: Context) {
    try {
    console.log('Processing context...');
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
            throw new Error('No workspace folder found');
    }

        const contextDir = path.join(workspaceFolders[0].uri.fsPath, 'context');
    console.log('Context directory:', contextDir);
    
        // Create directory if it doesn't exist
        if (!fs.existsSync(contextDir)) {
            console.log('Creating context directory');
            fs.mkdirSync(contextDir, { recursive: true });
    }

    // Save context as Markdown
    const contextFile = path.join(contextDir, 'current-context.md');
    console.log('Saving context Markdown:', contextFile);
    fs.writeFileSync(contextFile, formatContextForAI(context));

    // Save raw HTML
    const htmlFile = path.join(contextDir, 'page.html');
    console.log('Saving HTML:', htmlFile);
    fs.writeFileSync(htmlFile, context.dom.html);

    // Save console errors
        const errors = context.errors || context.consoleErrors || [];
        if (errors.length > 0) {
    const errorsFile = path.join(contextDir, 'console-errors.json');
    console.log('Saving console errors:', errorsFile);
            console.log('Number of errors:', errors.length);
            console.log('Errors:', JSON.stringify(errors, null, 2));
            fs.writeFileSync(errorsFile, JSON.stringify(errors, null, 2));
        } else {
            console.log('No errors to save');
        }

    // Add context to AI chat if possible
    addContextToAIChat(context);
    } catch (error) {
        console.error('Error processing context:', error);
        vscode.window.showErrorMessage('Error processing context: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

function addContextToAIChat(context: Context) {
    // Note: This function is a placeholder for future integration with AI
    // Exact implementation will depend on the API of the Cursor/VSCode AI
    const contextText = formatContextForAI(context);
    
    // For now, just show a notification
    vscode.window.showInformationMessage('Context updated and ready for AI');
}

function formatContextForAI(context: Context): string {
    return `# Web Development Context

## Page Information
- URL: ${context.dom.url}
- Title: ${context.dom.title}

## DOM Structure
- Total elements: ${context.dom.html.split('<').length - 1}
- Scripts: ${context.scriptsCount}
- Styles: ${context.stylesCount}
- Images: ${context.imagesCount}

## Metadata
${context.dom.meta?.viewport ? `- Viewport: ${context.dom.meta.viewport}` : ''}
${context.dom.meta?.description ? `- Description: ${context.dom.meta.description}` : ''}
${context.dom.meta?.keywords ? `- Keywords: ${context.dom.meta.keywords}` : ''}

## Styles
${context.styles?.map(style => 
    `- ${style.href || 'Inline Style'}${style.rules ? ` (${style.rules.length} rules)` : ''}${style.error ? ` - ${style.error}` : ''}`
).join('\n') || 'No styles'}

## Console Errors
${context.errors?.length > 0 
    ? context.errors.map(err => `- [${err.type}] ${err.message} (${err.source})`).join('\n')
    : 'No errors'}

## Available Files
- Raw HTML: \`context/page.html\`
- Console errors: \`context/console-errors.json\`
`;
}

// Function to generate Markdown
function generateMarkdown(context: any): string {
    const lines: string[] = [];
    
    lines.push('# Page Context');
    lines.push('');
    lines.push(`## URL: ${context.url}`);
    lines.push(`## Title: ${context.title}`);
    lines.push(`## Timestamp: ${context.timestamp || new Date().toISOString()}`);
    lines.push('');

    if (context.errors && context.errors.length > 0) {
        lines.push('## Errors');
        lines.push('');
        lines.push(`Total errors: ${context.errors.length}`);
        lines.push('');

        // Group errors by type
        const errorsByType = context.errors.reduce((acc: { [key: string]: any[] }, error: any) => {
            if (!acc[error.type]) {
                acc[error.type] = [];
            }
            acc[error.type].push(error);
            return acc;
        }, {});

        // Display errors by type
        for (const [type, errors] of Object.entries(errorsByType) as [string, any[]][]) {
            lines.push(`### ${type.charAt(0).toUpperCase() + type.slice(1)} Errors (${errors.length})`);
            lines.push('');
            for (const error of errors) {
                lines.push(`#### Error at ${new Date(error.timestamp).toLocaleString()}`);
                lines.push(`- Message: ${error.message}`);
                if (error.source) lines.push(`- Source: ${error.source}`);
                if (error.line) lines.push(`- Line: ${error.line}`);
                if (error.column) lines.push(`- Column: ${error.column}`);
                if (error.stack) lines.push(`- Stack: ${error.stack}`);
                if (error.details) {
                    lines.push('- Details:');
                    for (const [key, value] of Object.entries(error.details)) {
                        if (value !== null && value !== undefined) {
                            lines.push(`  - ${key}: ${value}`);
                        }
                    }
                }
                lines.push('');
            }
        }
    }

    if (context.styles && context.styles.length > 0) {
        lines.push('## Styles');
        lines.push('');
        context.styles.forEach((style: string) => {
            lines.push(`- ${style}`);
        });
        lines.push('');
    }

    if (context.scripts && context.scripts.length > 0) {
        lines.push('## Scripts');
        lines.push('');
        context.scripts.forEach((script: string) => {
            lines.push(`- ${script}`);
        });
        lines.push('');
    }

    if (context.images && context.images.length > 0) {
        lines.push('## Images');
        lines.push('');
        context.images.forEach((image: string) => {
            lines.push(`- ${image}`);
        });
        lines.push('');
    }

    return lines.join('\n');
}

// Function to save errors
async function saveErrors(errors: any[], contextDir: string): Promise<void> {
    try {
        if (!errors || errors.length === 0) {
            console.log('No errors to save');
            return;
        }

        const errorsPath = path.join(contextDir, 'console-errors.json');
        const errorsData = {
            timestamp: new Date().toISOString(),
            errors: errors.map(error => ({
                ...error,
                timestamp: error.timestamp || new Date().toISOString()
            }))
        };
        await fs.promises.writeFile(errorsPath, JSON.stringify(errorsData, null, 2), 'utf8');
        console.log('Errors saved to:', errorsPath);
    } catch (error) {
        console.error('Error saving errors:', error);
        throw error;
    }
}

// Function to save context
async function saveContext(context: any, contextDir: string): Promise<void> {
    try {
        // Create directory if it doesn't exist
        await fs.promises.mkdir(contextDir, { recursive: true });

        // Save HTML
        const htmlPath = path.join(contextDir, 'page.html');
        await fs.promises.writeFile(htmlPath, context.html, 'utf8');
        console.log('HTML saved to:', htmlPath);

        // Save context as Markdown
        const markdownPath = path.join(contextDir, 'current-context.md');
        const markdown = generateMarkdown(context);
        await fs.promises.writeFile(markdownPath, markdown, 'utf8');
        console.log('Markdown saved to:', markdownPath);

        // Save errors if present
        if (context.errors && context.errors.length > 0) {
            await saveErrors(context.errors, contextDir);
        } else {
            console.log('No errors to save in context');
        }
    } catch (error) {
        console.error('Error saving context:', error);
        throw error;
    }
}

export function deactivate() {
    if (server) {
        server.close();
    }
} 
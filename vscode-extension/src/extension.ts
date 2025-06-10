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

        // Créer le dossier context s'il n'existe pas
        const contextDir = path.join(workspaceFolders[0].uri.fsPath, 'context');
        console.log('Context directory path:', contextDir);
        
        if (!fs.existsSync(contextDir)) {
            console.log('Creating context directory:', contextDir);
            fs.mkdirSync(contextDir, { recursive: true });
        }

        // Configuration du serveur HTTP
        const httpServer = http.createServer((req, res) => {
            // Configurer les en-têtes CORS
            const corsHeaders = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            };

            // Gérer les requêtes OPTIONS pour le CORS
            if (req.method === 'OPTIONS') {
                res.writeHead(204, corsHeaders);
                res.end();
                return;
            }

            // Gestion des erreurs
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
                        
                        // Vérifier que le dossier existe
                        const contextDir = path.join(workspaceFolders[0].uri.fsPath, 'context');
                        await fs.promises.mkdir(contextDir, { recursive: true });
                        
                        // Sauvegarder les erreurs
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

            // Gestion des requêtes POST
            if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });

                req.on('end', async () => {
                    try {
                        // Vérifier si c'est une requête de contexte
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

        // Création du serveur WebSocket
        const wsServer = new WebSocket.Server({ server: httpServer });

        wsServer.on('connection', (ws: WebSocket) => {
            console.log('Nouvelle connexion WebSocket établie');
            ws.on('message', (message: string) => {
                try {
                    const data = JSON.parse(message);
                    if (data.type === 'context') {
                        processContext(data.context);
                    }
                } catch (error) {
                    console.error('Erreur lors du traitement du message WebSocket:', error);
                }
            });
        });

        // Démarrer le serveur
        httpServer.listen(3000, () => {
            vscode.window.showInformationMessage(`Capture de contexte active sur le port 3000`);
            statusBarItem.text = '$(radio-tower) Contexte actif';
        });
    } catch (error) {
        console.error('Erreur lors de la démarrage du serveur:', error);
        vscode.window.showErrorMessage('Erreur lors de la démarrage du serveur: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

export async function activate(context: vscode.ExtensionContext) {
    console.log('Extension AI More Context activée');

    // Création de l'élément de la barre d'état
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'ai-more-context.startServer';
    context.subscriptions.push(statusBarItem);

    // Vérifier si le dossier de contexte existe
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        const contextDir = path.join(workspaceFolders[0].uri.fsPath, 'context');
        if (!fs.existsSync(contextDir)) {
            fs.mkdirSync(contextDir);
        }
    }

    // Enregistrer les commandes
    let startServerCommand = vscode.commands.registerCommand('ai-more-context.startServer', async () => {
        console.log('Commande startServer exécutée');
        if (server) {
            vscode.window.showInformationMessage('La capture de contexte est déjà active');
            return;
        }
        await startServer();
    });

    let stopServerCommand = vscode.commands.registerCommand('ai-more-context.stopServer', () => {
        console.log('Commande stopServer exécutée');
        if (server) {
            server.close(() => {
                server = undefined;
                vscode.window.showInformationMessage('Capture de contexte arrêtée');
                statusBarItem.hide();
            });
        }
    });

    // Ajouter les commandes aux subscriptions
    context.subscriptions.push(startServerCommand, stopServerCommand);

    // Démarrer automatiquement le serveur
    await startServer();
}

function processContext(context: Context) {
    try {
    console.log('Traitement du contexte...');
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
            throw new Error('No workspace folder found');
    }

        const contextDir = path.join(workspaceFolders[0].uri.fsPath, 'context');
    console.log('Dossier de contexte:', contextDir);
    
        // Créer le dossier s'il n'existe pas
        if (!fs.existsSync(contextDir)) {
            console.log('Création du dossier de contexte');
            fs.mkdirSync(contextDir, { recursive: true });
    }

    // Sauvegarder le contexte au format Markdown
    const contextFile = path.join(contextDir, 'current-context.md');
    console.log('Sauvegarde du contexte Markdown:', contextFile);
    fs.writeFileSync(contextFile, formatContextForAI(context));

    // Sauvegarder le HTML brut
    const htmlFile = path.join(contextDir, 'page.html');
    console.log('Sauvegarde du HTML:', htmlFile);
    fs.writeFileSync(htmlFile, context.dom.html);

    // Sauvegarder les erreurs console
        const errors = context.errors || context.consoleErrors || [];
        if (errors.length > 0) {
    const errorsFile = path.join(contextDir, 'console-errors.json');
    console.log('Sauvegarde des erreurs console:', errorsFile);
            console.log('Nombre d\'erreurs:', errors.length);
            console.log('Erreurs:', JSON.stringify(errors, null, 2));
            fs.writeFileSync(errorsFile, JSON.stringify(errors, null, 2));
        } else {
            console.log('Aucune erreur à sauvegarder');
        }

    // Ajouter le contexte au chat de l'IA si possible
    addContextToAIChat(context);
    } catch (error) {
        console.error('Erreur lors du traitement du contexte:', error);
        vscode.window.showErrorMessage('Erreur lors du traitement du contexte: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
}

function addContextToAIChat(context: Context) {
    // Note: Cette fonction est un placeholder pour l'intégration future avec l'IA
    // L'implémentation exacte dépendra de l'API de l'IA de Cursor/VSCode
    const contextText = formatContextForAI(context);
    
    // Pour l'instant, on affiche juste une notification
    vscode.window.showInformationMessage('Contexte mis à jour et prêt pour l\'IA');
}

function formatContextForAI(context: Context): string {
    return `# Contexte de Développement Web

## Informations de la Page
- URL: ${context.dom.url}
- Titre: ${context.dom.title}

## Structure du DOM
- Nombre total d'éléments: ${context.dom.html.split('<').length - 1}
- Scripts: ${context.scriptsCount}
- Styles: ${context.stylesCount}
- Images: ${context.imagesCount}

## Métadonnées
${context.dom.meta?.viewport ? `- Viewport: ${context.dom.meta.viewport}` : ''}
${context.dom.meta?.description ? `- Description: ${context.dom.meta.description}` : ''}
${context.dom.meta?.keywords ? `- Mots-clés: ${context.dom.meta.keywords}` : ''}

## Feuilles de Style
${context.styles?.map(style => 
    `- ${style.href || 'Style inline'}${style.rules ? ` (${style.rules.length} règles)` : ''}${style.error ? ` - ${style.error}` : ''}`
).join('\n') || 'Aucune feuille de style'}

## Erreurs Console
${context.errors?.length > 0 
    ? context.errors.map(err => `- [${err.type}] ${err.message} (${err.source})`).join('\n')
    : 'Aucune erreur'}

## Fichiers Disponibles
- HTML brut: \`context/page.html\`
- Erreurs console: \`context/console-errors.json\`
`;
}

// Fonction pour générer le Markdown
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

        // Grouper les erreurs par type
        const errorsByType = context.errors.reduce((acc: { [key: string]: any[] }, error: any) => {
            if (!acc[error.type]) {
                acc[error.type] = [];
            }
            acc[error.type].push(error);
            return acc;
        }, {});

        // Afficher les erreurs par type
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

// Fonction pour sauvegarder les erreurs
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

// Fonction pour sauvegarder le contexte
async function saveContext(context: any, contextDir: string): Promise<void> {
    try {
        // Créer le répertoire s'il n'existe pas
        await fs.promises.mkdir(contextDir, { recursive: true });

        // Sauvegarder le HTML
        const htmlPath = path.join(contextDir, 'page.html');
        await fs.promises.writeFile(htmlPath, context.html, 'utf8');
        console.log('HTML saved to:', htmlPath);

        // Sauvegarder le contexte en Markdown
        const markdownPath = path.join(contextDir, 'current-context.md');
        const markdown = generateMarkdown(context);
        await fs.promises.writeFile(markdownPath, markdown, 'utf8');
        console.log('Markdown saved to:', markdownPath);

        // Sauvegarder les erreurs si présentes
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
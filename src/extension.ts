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
}

async function startServer() {
    const config = vscode.workspace.getConfiguration('vscode-context-enhancer');
    const port = config.get<number>('port', 3000);

    // Création du serveur HTTP
    const httpServer = http.createServer();
    
    // Création du serveur WebSocket
    server = new WebSocket.Server({ server: httpServer });

    server.on('connection', (ws: WebSocket) => {
        isChromeExtensionInstalled = true;
        vscode.window.showInformationMessage('Extension Chrome connectée');
        console.log('Nouvelle connexion WebSocket établie');

        ws.on('message', (data: WebSocket.Data) => {
            try {
                console.log('Données reçues du WebSocket');
                const context = JSON.parse(data.toString());
                console.log('Contexte parsé:', {
                    url: context.dom?.url,
                    title: context.dom?.title,
                    errorsCount: context.consoleErrors?.length
                });
                processContext(context);
            } catch (error) {
                console.error('Erreur lors du traitement du contexte:', error);
                vscode.window.showErrorMessage('Erreur lors du traitement du contexte: ' + error);
            }
        });

        ws.on('close', () => {
            isChromeExtensionInstalled = false;
            vscode.window.showInformationMessage('Extension Chrome déconnectée');
            console.log('Connexion WebSocket fermée');
        });
    });

    httpServer.listen(port, () => {
        vscode.window.showInformationMessage(`Capture de contexte active sur le port ${port}`);
        statusBarItem.text = '$(radio-tower) Contexte actif';
        statusBarItem.show();

        if (!isChromeExtensionInstalled) {
            vscode.window.showWarningMessage(
                'Extension Chrome non détectée. Veuillez installer l\'extension Chrome "VSCode Context Enhancer" pour activer la capture de contexte.',
                'Voir l\'extension'
            ).then(selection => {
                if (selection === 'Voir l\'extension') {
                    vscode.env.openExternal(vscode.Uri.parse('https://chrome.google.com/webstore/detail/vscode-context-enhancer/...'));
                }
            });
        }
    });
}

export async function activate(context: vscode.ExtensionContext) {
    // Création de l'élément de la barre d'état
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'vscode-context-enhancer.startServer';
    context.subscriptions.push(statusBarItem);

    // Vérifier si le dossier de contexte existe
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (workspaceFolders) {
        const contextDir = path.join(workspaceFolders[0].uri.fsPath, 'vscode-context');
        if (!fs.existsSync(contextDir)) {
            fs.mkdirSync(contextDir);
        }
    }

    // Démarrer automatiquement le serveur
    await startServer();

    // Commande pour démarrer le serveur
    let startServerCommand = vscode.commands.registerCommand('vscode-context-enhancer.startServer', async () => {
        if (server) {
            vscode.window.showInformationMessage('La capture de contexte est déjà active');
            return;
        }
        await startServer();
    });

    // Commande pour arrêter le serveur
    let stopServerCommand = vscode.commands.registerCommand('vscode-context-enhancer.stopServer', () => {
        if (server) {
            server.close(() => {
                server = undefined;
                vscode.window.showInformationMessage('Capture de contexte arrêtée');
                statusBarItem.hide();
            });
        }
    });

    context.subscriptions.push(startServerCommand, stopServerCommand);
}

function processContext(context: Context) {
    console.log('Traitement du contexte...');
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        console.error('Aucun dossier de projet ouvert');
        vscode.window.showErrorMessage('Aucun dossier de projet ouvert');
        return;
    }

    const contextDir = path.join(workspaceFolders[0].uri.fsPath, 'vscode-context');
    console.log('Dossier de contexte:', contextDir);
    
    // Nettoyer le dossier de contexte
    if (fs.existsSync(contextDir)) {
        console.log('Nettoyage du dossier de contexte existant');
        const files = fs.readdirSync(contextDir);
        for (const file of files) {
            fs.unlinkSync(path.join(contextDir, file));
        }
    } else {
        console.log('Création du dossier de contexte');
        fs.mkdirSync(contextDir);
    }

    // Sauvegarder le contexte au format Markdown
    const contextFile = path.join(contextDir, 'current-context.md');
    console.log('Sauvegarde du contexte Markdown:', contextFile);
    fs.writeFileSync(contextFile, formatContextForAI(context));

    // Sauvegarder la capture d'écran si elle existe
    if (context.screenshot) {
        const screenshotPath = path.join(contextDir, 'screenshot.png');
        console.log('Sauvegarde de la capture d\'écran:', screenshotPath);
        const screenshotData = context.screenshot.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(screenshotPath, Buffer.from(screenshotData, 'base64'));
    }

    // Sauvegarder le HTML brut
    const htmlFile = path.join(contextDir, 'page.html');
    console.log('Sauvegarde du HTML:', htmlFile);
    fs.writeFileSync(htmlFile, context.dom.html);

    // Sauvegarder les erreurs console
    const errorsFile = path.join(contextDir, 'console-errors.json');
    console.log('Sauvegarde des erreurs console:', errorsFile);
    console.log('Nombre d\'erreurs:', context.consoleErrors.length);
    fs.writeFileSync(errorsFile, JSON.stringify(context.consoleErrors, null, 2));

    // Ajouter le contexte au chat de l'IA si possible
    addContextToAIChat(context);
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
- Nombre total d'éléments: ${context.dom.structure.elements}
- Scripts: ${context.dom.structure.scripts}
- Styles: ${context.dom.structure.styles}
- Images: ${context.dom.structure.images}
- Formulaires: ${context.dom.structure.forms}

## Métadonnées
${context.dom.meta.viewport ? `- Viewport: ${context.dom.meta.viewport}` : ''}
${context.dom.meta.description ? `- Description: ${context.dom.meta.description}` : ''}
${context.dom.meta.keywords ? `- Mots-clés: ${context.dom.meta.keywords}` : ''}

## Feuilles de Style
${context.dom.styles.map(style => 
    `- ${style.href || 'Style inline'}${style.rules ? ` (${style.rules} règles)` : ''}${style.error ? ` - ${style.error}` : ''}`
).join('\n')}

## Erreurs Console
${context.consoleErrors.length > 0 
    ? context.consoleErrors.map(err => `- ${err.message}`).join('\n')
    : 'Aucune erreur'}

## Fichiers Disponibles
- Capture d'écran: \`vscode-context/screenshot.png\`
- HTML brut: \`vscode-context/page.html\`
- Erreurs console: \`vscode-context/console-errors.json\`
`;
}

export function deactivate() {
    if (server) {
        server.close();
    }
} 
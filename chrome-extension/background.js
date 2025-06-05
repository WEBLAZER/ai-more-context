// Configuration du WebSocket
const WS_SERVER = 'ws://localhost:3000';
let ws = null;

// Fonction pour se connecter au serveur WebSocket
function connectToServer() {
    if (ws) {
        ws.close();
    }

    ws = new WebSocket(WS_SERVER);

    ws.onopen = () => {
        console.log('Connecté au serveur VSCode');
    };

    ws.onclose = () => {
        console.log('Déconnecté du serveur VSCode');
        // Tentative de reconnexion après 5 secondes
        setTimeout(connectToServer, 5000);
    };

    ws.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
    };
}

// Tentative de connexion initiale
connectToServer();

// Fonction pour capturer l'écran
async function captureScreenshot(tabId) {
    try {
        const screenshot = await chrome.tabs.captureVisibleTab(null, {
            format: 'png'
        });
        console.log('Capture d\'écran réussie');
        return screenshot;
    } catch (error) {
        console.error('Erreur lors de la capture d\'écran:', error);
        return null;
    }
}

// Fonction pour sauvegarder le contexte
async function saveContext(context) {
    try {
        // Sauvegarde dans le stockage local de l'extension
        await chrome.storage.local.set({
            lastContext: context
        });
        
        // Envoi du contexte au serveur VSCode si connecté
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(context));
            console.log('Contexte envoyé au serveur VSCode');
        } else {
            console.log('Serveur VSCode non connecté');
        }
        
        // Log détaillé du contexte capturé
        console.log('=== DÉTAILS DU CONTEXTE CAPTURÉ ===');
        console.log('URL:', context.dom.url);
        console.log('Titre:', context.dom.title);
        console.log('Taille du HTML:', context.dom.html.length, 'caractères');
        console.log('Nombre d\'erreurs console:', context.consoleErrors.length);
        if (context.consoleErrors.length > 0) {
            console.log('Erreurs console:', context.consoleErrors);
        }
        console.log('Capture d\'écran:', context.screenshot ? 'Présente' : 'Absente');
        console.log('================================');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du contexte:', error);
    }
}

// Écoute des messages du popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureContext") {
        console.log('Début de la capture du contexte');
        chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
            const activeTab = tabs[0];
            console.log('Onglet actif trouvé:', activeTab.url);
            
            // Capture du contexte via le content script
            chrome.tabs.sendMessage(activeTab.id, {action: "captureContext"}, async (response) => {
                if (response) {
                    console.log('Réponse du content script reçue');
                    // Capture de l'écran
                    const screenshot = await captureScreenshot(activeTab.id);
                    
                    // Création du contexte complet
                    const fullContext = {
                        ...response,
                        screenshot: screenshot
                    };
                    
                    // Sauvegarde du contexte
                    await saveContext(fullContext);
                    
                    sendResponse({success: true});
                } else {
                    console.error('Pas de réponse du content script');
                    sendResponse({success: false, error: 'Pas de réponse du content script'});
                }
            });
        });
        return true;
    }

    if (request.action === 'captureVisibleTab') {
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, dataUrl => {
            sendResponse({ dataUrl });
        });
        return true; // Indique que la réponse sera asynchrone
    }
}); 
// Initialisation immédiate de la capture des erreurs
(function() {
    // Configuration du WebSocket
    const WS_URL = 'ws://localhost:3000';
    let ws = null;

    // Capture des erreurs console
    window.consoleErrors = [];

    // Fonction pour formater une erreur
    function formatError(error, type = 'error', source = null) {
        const stack = error.stack || '';
        const stackLines = stack.split('\n');
        const callerLine = stackLines[1] || '';
        const lineMatch = callerLine.match(/:(\d+):(\d+)/);
        
        // Extraction des informations de l'erreur
        let message = error.message || String(error);
        let line = 0;
        let column = 0;
        let url = source || window.location.href;

        // Si c'est une erreur réseau
        if (type === 'network') {
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                message = `Failed to load resource: ${source}`;
            }
        }

        // Si c'est une erreur de référence non définie
        if (message.includes('is not defined')) {
            const match = message.match(/^(\w+) is not defined/);
            if (match) {
                message = `ReferenceError: ${match[1]} is not defined`;
            }
        }

        // Extraction de la ligne et de la colonne
        if (lineMatch) {
            line = parseInt(lineMatch[1]);
            column = parseInt(lineMatch[2]);
        }

        // Ajout d'informations supplémentaires pour les erreurs réseau
        if (type === 'network') {
            const resourceType = source?.match(/\.(jpg|jpeg|png|gif|css|js)$/i)?.[1]?.toUpperCase() || 'RESOURCE';
            message = `Failed to load ${resourceType}: ${source}`;
        }

        return {
            message,
            source: type,
            line,
            column,
            stack,
            url,
            timestamp: new Date().toISOString()
        };
    }

    // Surcharge des méthodes console
    const originalConsole = {
        error: console.error,
        warn: console.warn,
        log: console.log
    };

    console.error = function() {
        const error = arguments[0] instanceof Error ? arguments[0] : new Error(Array.from(arguments).join(' '));
        window.consoleErrors.push(formatError(error, 'error'));
        originalConsole.error.apply(console, arguments);
    };

    console.warn = function() {
        const error = arguments[0] instanceof Error ? arguments[0] : new Error(Array.from(arguments).join(' '));
        window.consoleErrors.push(formatError(error, 'warning'));
        originalConsole.warn.apply(console, arguments);
    };

    // Capture des erreurs non gérées
    window.addEventListener('error', function(event) {
        const error = event.error || new Error(event.message);
        error.stack = event.error?.stack || '';
        window.consoleErrors.push(formatError(error, 'uncaught', event.filename));
    }, true);

    window.addEventListener('unhandledrejection', function(event) {
        window.consoleErrors.push(formatError(event.reason, 'promise'));
    });

    // Capture des erreurs de chargement de ressources avec PerformanceObserver
    const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.initiatorType === 'img' || entry.initiatorType === 'script' || entry.initiatorType === 'link') {
                if (entry.duration === 0 || entry.transferSize === 0) {
                    const error = new Error(`Failed to load ${entry.initiatorType}: ${entry.name}`);
                    error.stack = new Error().stack;
                    window.consoleErrors.push(formatError(error, 'network', entry.name));
                }
            }
        }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

    // Capture des erreurs de chargement de ressources avec les événements
    document.addEventListener('error', function(event) {
        if (event.target instanceof HTMLImageElement) {
            const error = new Error(`Failed to load image: ${event.target.src}`);
            error.stack = new Error().stack;
            window.consoleErrors.push(formatError(error, 'network', event.target.src));
        } else if (event.target instanceof HTMLScriptElement) {
            const error = new Error(`Failed to load script: ${event.target.src}`);
            error.stack = new Error().stack;
            window.consoleErrors.push(formatError(error, 'network', event.target.src));
        } else if (event.target instanceof HTMLLinkElement) {
            const error = new Error(`Failed to load stylesheet: ${event.target.href}`);
            error.stack = new Error().stack;
            window.consoleErrors.push(formatError(error, 'network', event.target.href));
        }
    }, true);

    // Observation des changements dans le DOM pour capturer les erreurs plus tôt
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node instanceof HTMLElement) {
                    if (node.tagName === 'IMG') {
                        node.addEventListener('error', function(event) {
                            const error = new Error(`Failed to load image: ${node.src}`);
                            error.stack = new Error().stack;
                            window.consoleErrors.push(formatError(error, 'network', node.src));
                        });
                    } else if (node.tagName === 'SCRIPT') {
                        node.addEventListener('error', function(event) {
                            const error = new Error(`Failed to load script: ${node.src}`);
                            error.stack = new Error().stack;
                            window.consoleErrors.push(formatError(error, 'network', node.src));
                        });
                    } else if (node.tagName === 'LINK' && node.rel === 'stylesheet') {
                        node.addEventListener('error', function(event) {
                            const error = new Error(`Failed to load stylesheet: ${node.href}`);
                            error.stack = new Error().stack;
                            window.consoleErrors.push(formatError(error, 'network', node.href));
                        });
                    }
                }
            }
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // Fonction pour capturer le contexte
    async function captureContext() {
        console.log('Capture du contexte...');
        
        // Capture d'écran
        const screenshot = await new Promise(resolve => {
            chrome.runtime.sendMessage({ action: 'captureVisibleTab' }, response => {
                resolve(response.dataUrl);
            });
        });

        // Analyse du DOM
        const dom = {
            url: window.location.href,
            title: document.title,
            html: document.documentElement.outerHTML,
            structure: {
                elements: document.getElementsByTagName('*').length,
                scripts: document.getElementsByTagName('script').length,
                styles: document.getElementsByTagName('style').length,
                images: document.getElementsByTagName('img').length,
                forms: document.getElementsByTagName('form').length
            },
            meta: {
                viewport: document.querySelector('meta[name="viewport"]')?.content,
                description: document.querySelector('meta[name="description"]')?.content,
                keywords: document.querySelector('meta[name="keywords"]')?.content
            },
            styles: Array.from(document.styleSheets).map(sheet => {
                try {
                    return {
                        href: sheet.href,
                        rules: sheet.cssRules?.length,
                        error: null
                    };
                } catch (e) {
                    return {
                        href: sheet.href,
                        error: e.message
                    };
                }
            })
        };

        // Erreurs console
        const consoleErrors = window.consoleErrors || [];
        console.log('Erreurs capturées:', consoleErrors);

        // Envoi du contexte
        const context = {
            dom,
            consoleErrors,
            screenshot
        };

        if (ws && ws.readyState === WebSocket.OPEN) {
            console.log('Envoi du contexte au serveur VSCode...');
            ws.send(JSON.stringify(context));
        } else {
            console.error('WebSocket non connecté');
        }
    }

    // Connexion WebSocket
    function connectWebSocket() {
        console.log('Tentative de connexion au serveur VSCode...');
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log('Connecté au serveur VSCode');
            // Capture initiale
            captureContext();
            // Mettre à jour le statut
            chrome.runtime.sendMessage({action: 'updateStatus', connected: true});
        };

        ws.onclose = () => {
            console.log('Déconnecté du serveur VSCode');
            // Mettre à jour le statut
            chrome.runtime.sendMessage({action: 'updateStatus', connected: false});
            // Tentative de reconnexion après 5 secondes
            setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
            console.error('Erreur WebSocket:', error);
            // Mettre à jour le statut
            chrome.runtime.sendMessage({action: 'updateStatus', connected: false});
        };
    }

    // Écouter les messages du popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getStatus') {
            sendResponse({connected: ws && ws.readyState === WebSocket.OPEN});
        }
    });

    // Capture du contexte à chaque chargement de page
    document.addEventListener('DOMContentLoaded', () => {
        console.log('Page chargée, connexion au serveur VSCode...');
        connectWebSocket();
    });

    // Capture du contexte à chaque rechargement de page
    window.addEventListener('beforeunload', () => {
        if (ws) {
            ws.close();
        }
    });
})(); 
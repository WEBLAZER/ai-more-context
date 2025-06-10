// Initialize error capture
console.log('Initializing error capture...');

// Error storage
window.consoleErrors = [];

// Error capture function
function captureError(error, type, source) {
    const errorObj = {
        message: error.message,
        stack: error.stack,
        type: type,
        source: source,
        timestamp: new Date().toISOString()
    };
    window.consoleErrors.push(errorObj);
    console.log('Capturing error:', errorObj);
    console.log('Error captured, total:', window.consoleErrors.length);
}

// Capture JavaScript errors
window.addEventListener('error', function(event) {
    if (event.error) {
        let type = 'javascript';
        if (event.error instanceof SyntaxError) {
            type = 'syntax';
        } else if (event.error instanceof TypeError) {
            type = 'type';
        } else if (event.error instanceof ReferenceError) {
            type = 'reference';
        }
        captureError(event.error, type, event.filename);
    } else if (event.message) {
        const error = new Error(event.message);
        error.stack = event.error ? event.error.stack : new Error().stack;
        captureError(error, 'javascript', event.filename);
    }
});

// Capture performance violations
if (window.PerformanceObserver) {
    const performanceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
            if (entry.entryType === 'resource' && entry.duration > 5000) {
                captureError(new Error(`Resource ${entry.name} took too long to load (${entry.duration}ms)`), 'performance', entry.name);
            }
        });
    });
    performanceObserver.observe({ 
        entryTypes: ['resource', 'paint', 'largest-contentful-paint', 'longtask'] 
    });
}

// Capture console violations
const originalConsoleWarn = console.warn;
console.warn = function(...args) {
    const message = args.join(' ');
    if (message.includes('[Violation]')) {
        const error = new Error(message);
        error.stack = new Error().stack;
        captureError(error, 'performance', 'console');
    }
    originalConsoleWarn.apply(console, args);
};

// Capture console errors
const originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log
};

console.error = function(...args) {
    originalConsole.error.apply(console, args);
    const message = args.join(' ');
    captureError(new Error(message), 'console', window.location.href);
};

// Capture global errors
window.addEventListener('error', function(event) {
    console.log('Global error caught:', event);
    captureError(event.error || new Error(event.message), 'global', event.filename);
}, true);

// Capture resource errors
window.addEventListener('load', function() {
    console.log('Page loaded, checking for resource errors...');
    
    // Check images
    document.querySelectorAll('img').forEach(img => {
        if (!img.complete || img.naturalHeight === 0) {
            captureError(new Error(`Failed to load image: ${img.src}`), 'resource', img.src);
        }
    });
    
    // Check scripts
    document.querySelectorAll('script').forEach(script => {
        if (script.src && !script.complete) {
            captureError(new Error(`Failed to load script: ${script.src}`), 'resource', script.src);
        }
    });
    
    // Check styles
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        // Check if stylesheet was loaded
        if (link.href && !link.sheet) {
            captureError(new Error(`Failed to load stylesheet: ${link.href}`), 'resource', link.href);
        }
        
        // Add event listener for loading errors
        link.addEventListener('error', function(event) {
            captureError(new Error(`Failed to load stylesheet: ${link.href}`), 'resource', link.href);
        });
    });

    // Check inline styles
    document.querySelectorAll('style').forEach(style => {
        try {
            // Check if style is valid
            const sheet = style.sheet;
            if (sheet) {
                try {
                    // Try to access rules to check validity
                    Array.from(sheet.cssRules);
                } catch (e) {
                    captureError(new Error(`Invalid CSS in style tag: ${e.message}`), 'style', 'inline');
                }
            }
        } catch (e) {
            captureError(new Error(`Error processing style tag: ${e.message}`), 'style', 'inline');
        }
    });

    // Check existing stylesheets
    Array.from(document.styleSheets).forEach(sheet => {
        try {
            // Check if stylesheet is accessible
            if (sheet.href) {
                try {
                    // Try to access rules
                    Array.from(sheet.cssRules);
                } catch (e) {
                    if (e.name === 'SecurityError') {
                        captureError(new Error(`Cannot access stylesheet rules (CORS): ${sheet.href}`), 'style', sheet.href);
                    } else {
                        captureError(new Error(`Error accessing stylesheet: ${e.message}`), 'style', sheet.href);
                    }
                }
            }
        } catch (e) {
            captureError(new Error(`Error processing stylesheet: ${e.message}`), 'style', sheet.href || 'unknown');
        }
    });

    // Check media
    document.querySelectorAll('video, audio').forEach(media => {
        if (media.error) {
            captureError(new Error(`Media error: ${media.error.message}`), 'media', media.src);
        }
    });
});

// Capture context
window.addEventListener('load', async function() {
    try {
        console.log('Capturing context...');
        const context = await captureContext();
        
        if (context) {
            // Add errors to context
            context.errors = window.consoleErrors;
            context.errorsCount = window.consoleErrors.length;
            
            console.log('Sending context with errors:', context.errorsCount);
            await sendContextToVSCode(context);
        }
    } catch (error) {
        console.error('Error capturing context:', error);
    }
});

// Capture style errors in real-time
const styleObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node instanceof HTMLLinkElement && node.rel === 'stylesheet') {
                node.addEventListener('error', function(event) {
                    captureError(new Error(`Failed to load stylesheet: ${node.href}`), 'resource', node.href);
                });
            } else if (node instanceof HTMLStyleElement) {
                try {
                    const sheet = node.sheet;
                    if (sheet) {
                        try {
                            Array.from(sheet.cssRules);
                        } catch (e) {
                            captureError(new Error(`Invalid CSS in style tag: ${e.message}`), 'style', 'inline');
                        }
                    }
                } catch (e) {
                    captureError(new Error(`Error processing style tag: ${e.message}`), 'style', 'inline');
                }
            }
        });
    });
});

styleObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
});

// Function to capture context
async function captureContext() {
    console.log('Capturing context...');
    const context = {
        url: window.location.href,
        title: document.title,
        html: document.documentElement.outerHTML,
        styles: Array.from(document.styleSheets).map(sheet => sheet.href).filter(Boolean),
        scripts: Array.from(document.scripts).map(script => script.src).filter(Boolean),
        images: Array.from(document.images).map(img => img.src),
        errors: window.consoleErrors || [],
        errorsCount: (window.consoleErrors || []).length,
        timestamp: new Date().toISOString()
    };
    console.log('Context captured:', context);
    return context;
}

// Function to send context to VSCode server
async function sendContextToVSCode(context) {
    try {
        console.log('Sending context to VSCode server:', context);
        const response = await fetch('http://localhost:3000/context', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(context)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error ${response.status}: ${errorData.error || 'Unknown error'}`);
        }

        const result = await response.json();
        console.log('Context sent successfully:', result);
        return result;
    } catch (error) {
        console.error('Error sending context:', error);
        throw error;
    }
}

// Capture unhandled promises
window.addEventListener('unhandledrejection', function(event) {
    const error = event.reason instanceof Error ? event.reason : new Error(event.reason);
    error.stack = event.reason instanceof Error ? event.reason.stack : new Error().stack;
    captureError(error, 'promise', error.stack);
});

// Capture timeout errors
const originalSetTimeout = window.setTimeout;
window.setTimeout = function(callback, delay, ...args) {
    const wrappedCallback = function() {
        try {
            return callback.apply(this, args);
        } catch (error) {
            error.stack = error.stack || new Error().stack;
            captureError(error, 'timeout', 'setTimeout');
            throw error;
        }
    };
    return originalSetTimeout.call(this, wrappedCallback, delay);
};

// Capture interval errors
const originalSetInterval = window.setInterval;
window.setInterval = function(callback, delay, ...args) {
    const wrappedCallback = function() {
        try {
            return callback.apply(this, args);
        } catch (error) {
            error.stack = error.stack || new Error().stack;
            captureError(error, 'interval', 'setInterval');
            throw error;
        }
    };
    return originalSetInterval.call(this, wrappedCallback, delay);
};

// Capture network errors
const originalFetch = window.fetch;
window.fetch = function(input, init) {
    const startTime = performance.now();
    return originalFetch.apply(this, arguments)
        .then(response => {
            const duration = performance.now() - startTime;
            if (duration > 5000) {
                const error = new Error(`Fetch request to ${typeof input === 'string' ? input : input.url} took too long (${duration}ms)`);
                error.stack = new Error().stack;
                captureError(error, 'performance', typeof input === 'string' ? input : input.url);
            }
            return response;
        })
        .catch(error => {
            error.stack = error.stack || new Error().stack;
            captureError(error, 'network', typeof input === 'string' ? input : input.url);
            throw error;
        });
};

// Capture localStorage errors
try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
} catch (e) {
    captureError(new Error('localStorage is not available: ' + e.message), 'storage', 'localStorage');
}

// Capture sessionStorage errors
try {
    sessionStorage.setItem('test', 'test');
    sessionStorage.removeItem('test');
} catch (e) {
    captureError(new Error('sessionStorage is not available: ' + e.message), 'storage', 'sessionStorage');
}

// Capture WebSocket errors
const originalWebSocket = window.WebSocket;
window.WebSocket = function(url, protocols) {
    const ws = new originalWebSocket(url, protocols);
    ws.addEventListener('error', function(event) {
        captureError(new Error(`WebSocket error: ${event.message || 'Unknown error'}`), 'websocket', url);
    });
    return ws;
};

// Capture XMLHttpRequest errors
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url) {
    this.addEventListener('error', function(event) {
        captureError(new Error(`XHR error: ${event.message || 'Unknown error'}`), 'network', url);
    });
    return originalXHROpen.apply(this, arguments);
};

// Capture IndexedDB errors
if (window.indexedDB) {
    const request = indexedDB.open('test');
    request.onerror = function(event) {
        captureError(new Error('IndexedDB error: ' + event.target.error.message), 'storage', 'indexedDB');
    };
    request.onsuccess = function(event) {
        event.target.result.close();
        indexedDB.deleteDatabase('test');
    };
}

// Capture Service Worker errors
if ('serviceWorker' in navigator) {
    try {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            registrations.forEach(registration => {
                registration.addEventListener('error', event => {
                    captureError(new Error(`Service Worker error: ${event.message || 'Unknown error'}`), 'serviceWorker', registration.scope);
                });
            });
        }).catch(error => {
            captureError(new Error(`Service Worker registration error: ${error.message}`), 'serviceWorker', 'registration');
        });
    } catch (error) {
        captureError(new Error(`Service Worker error: ${error.message}`), 'serviceWorker', 'initialization');
    }
}

// Capture Web Workers errors
if (window.Worker) {
    const originalWorker = window.Worker;
    window.Worker = function(scriptURL) {
        const worker = new originalWorker(scriptURL);
        worker.addEventListener('error', function(event) {
            captureError(new Error(`Web Worker error: ${event.message || 'Unknown error'}`), 'worker', scriptURL);
        });
        return worker;
    };
}

// Capture WebGL errors
if (window.WebGLRenderingContext) {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
        const error = gl.getError();
        if (error !== gl.NO_ERROR) {
            captureError(new Error(`WebGL error: ${error}`), 'webgl', 'initialization');
        }
    }
}

// Capture media errors
const mediaObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if (node instanceof HTMLMediaElement) {
                node.addEventListener('error', function(event) {
                    const error = event.target.error;
                    let message = 'Media error';
                    if (error) {
                        switch (error.code) {
                            case MediaError.MEDIA_ERR_ABORTED:
                                message = 'Media playback aborted';
                                break;
                            case MediaError.MEDIA_ERR_NETWORK:
                                message = 'Network error while loading media';
                                break;
                            case MediaError.MEDIA_ERR_DECODE:
                                message = 'Media decoding error';
                                break;
                            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
                                message = 'Media format not supported';
                                break;
                        }
                    }
                    captureError(new Error(`${message}: ${node.src}`), 'media', node.src);
                });
            }
        });
    });
});

mediaObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
});

// Function to initialize error capture
function initializeErrorCapture() {
    console.log('Initializing error capture...');
    window.consoleErrors = [];

    // Capture console errors
    window.addEventListener('error', (event) => {
        console.log('Error captured:', event);
        const error = {
            type: 'error',
            message: event.message,
            source: event.filename,
            line: event.lineno,
            column: event.colno,
            stack: event.error?.stack || '',
            timestamp: new Date().toISOString(),
            details: {
                isResourceError: event.target instanceof HTMLElement,
                resourceType: event.target instanceof HTMLElement ? event.target.tagName.toLowerCase() : null,
                resourceUrl: event.target instanceof HTMLElement ? (event.target.src || event.target.href) : null
            }
        };
        window.consoleErrors.push(error);
        console.log('Error added to consoleErrors:', error);
    });

    // Capture resource errors
    window.addEventListener('error', (event) => {
        if (event.target instanceof HTMLImageElement || 
            event.target instanceof HTMLScriptElement || 
            event.target instanceof HTMLLinkElement ||
            event.target instanceof HTMLVideoElement ||
            event.target instanceof HTMLAudioElement) {
            console.log('Resource error captured:', event);
            const resourceType = event.target.tagName.toLowerCase();
            const resourceUrl = event.target.src || event.target.href;
            const error = {
                type: 'resource',
                message: `Failed to load ${resourceType}: ${resourceUrl}`,
                source: resourceUrl,
                timestamp: new Date().toISOString(),
                details: {
                    resourceType,
                    resourceUrl,
                    errorType: event.target instanceof HTMLImageElement ? 'image' :
                              event.target instanceof HTMLScriptElement ? 'script' :
                              event.target instanceof HTMLLinkElement ? 'stylesheet' :
                              event.target instanceof HTMLVideoElement ? 'video' :
                              event.target instanceof HTMLAudioElement ? 'audio' : 'unknown'
                }
            };
            window.consoleErrors.push(error);
            console.log('Resource error added to consoleErrors:', error);
        }
    }, true);

    // Capture console.log errors
    const originalConsoleError = console.error;
    console.error = function(...args) {
        console.log('Console error captured:', args);
        const error = {
            type: 'console',
            message: args.map(arg => String(arg)).join(' '),
            timestamp: new Date().toISOString(),
            details: {
                arguments: args.map(arg => String(arg))
            }
        };
        window.consoleErrors.push(error);
        console.log('Console error added to consoleErrors:', error);
        originalConsoleError.apply(console, args);
    };

    // Capture Service Worker errors
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('error', (event) => {
            console.log('Service Worker error captured:', event);
            const error = {
                type: 'serviceWorker',
                message: event.message || 'Service Worker error',
                timestamp: new Date().toISOString(),
                details: {
                    errorType: event.type,
                    scope: event.target?.scope || 'unknown'
                }
            };
            window.consoleErrors.push(error);
            console.log('Service Worker error added to consoleErrors:', error);
        });
    }

    console.log('Error capture initialized');
}

// Initialize error capture
initializeErrorCapture();

// Capture and send context
async function captureAndSendContext() {
    try {
        const context = await captureContext();
        await sendContextToVSCode(context);
    } catch (error) {
        console.error('Error in captureAndSendContext:', error);
    }
}

// Capture and send context on page load
document.addEventListener('DOMContentLoaded', captureAndSendContext);

// Capture and send context every 5 seconds
setInterval(captureAndSendContext, 5000);
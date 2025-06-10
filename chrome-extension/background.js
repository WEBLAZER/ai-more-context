// WebSocket configuration
const WS_SERVER = 'ws://localhost:3000';
let ws = null;

// Function to connect to WebSocket server
function connectToServer() {
    console.log('Attempting to connect to VSCode server from background...');
    if (ws) {
        console.log('Closing existing WebSocket connection...');
        ws.close();
    }

    ws = new WebSocket(WS_SERVER);

    ws.onopen = () => {
        console.log('Background: Connected to VSCode server');
        // Update connection status
        chrome.runtime.sendMessage({action: 'updateStatus', connected: true});
    };

    ws.onclose = (event) => {
        console.log('Background: Disconnected from VSCode server', event.code, event.reason);
        // Update connection status
        chrome.runtime.sendMessage({action: 'updateStatus', connected: false});
        // Attempt to reconnect after 5 seconds
        setTimeout(connectToServer, 5000);
    };

    ws.onerror = (error) => {
        console.error('Background: WebSocket error:', error);
        // Update connection status
        chrome.runtime.sendMessage({action: 'updateStatus', connected: false});
    };
}

// Initial connection attempt
connectToServer();

// Function to capture screen
async function captureScreenshot(tabId) {
    try {
        console.log('Starting screenshot capture...');
        
        // Get active window
        const window = await chrome.windows.getCurrent();
        console.log('Active window retrieved:', window.id);
        
        // Capture screen with specified window
        const screenshot = await chrome.tabs.captureVisibleTab(window.id, {
            format: 'png',
            quality: 100
        });
        
        if (!screenshot) {
            console.error('Screenshot returned null');
            return null;
        }
        
        console.log('Screenshot successful, size:', screenshot.length);
        return screenshot;
    } catch (error) {
        console.error('Error while capturing screenshot:', error);
        if (error.message.includes('permission')) {
            console.error('Missing permission for screenshot');
        } else if (error.message.includes('tab')) {
            console.error('Tab not found or inaccessible');
        }
        return null;
    }
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in background:', request);

    if (request.action === 'captureVisibleTab') {
        (async () => {
            try {
                console.log('Starting screenshot capture...');
                
                // Check if tab is still valid
                const tab = await chrome.tabs.get(sender.tab.id).catch(() => null);
                if (!tab) {
                    console.error('Tab not found');
                    sendResponse({ success: false, error: 'Tab not found' });
                    return;
                }

                // Check permissions
                const permissions = await chrome.permissions.getAll();
                console.log('Current permissions:', permissions);

                // Screenshot capture
                const screenshot = await new Promise((resolve, reject) => {
                    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
                        if (chrome.runtime.lastError) {
                            console.error('Error while capturing screenshot:', chrome.runtime.lastError);
                            reject(chrome.runtime.lastError);
                            return;
                        }
                        if (!dataUrl) {
                            console.error('No data captured');
                            reject(new Error('No data captured'));
                            return;
                        }
                        console.log('Screenshot successful');
                        resolve(dataUrl);
                    });
                });

                if (screenshot) {
                    console.log('Converting screenshot to base64...');
                    const base64Data = screenshot.split(',')[1];
                    const context = {
                        dom: {
                            url: request.url,
                            title: request.title,
                            html: request.html
                        },
                        consoleErrors: [],
                        screenshot: base64Data
                    };

                    try {
                        await saveContext(context);
                        console.log('Context saved successfully');
                        sendResponse({ success: true, dataUrl: screenshot });
                    } catch (error) {
                        console.error('Error while saving context:', error);
                        sendResponse({ success: false, error: error.message });
                    }
                } else {
                    console.error('Error while capturing screenshot');
                    sendResponse({ success: false, error: 'Error while capturing screenshot' });
                }
            } catch (error) {
                console.error('Error while capturing screenshot:', error);
                sendResponse({ success: false, error: error.message });
            }
        })();
        return true; // Indicates async response
    }
});

// Function to save context
async function saveContext(context) {
    try {
        console.log('Saving context...');
        const response = await fetch('http://localhost:3000/context', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(context)
        });

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const result = await response.json();
        console.log('Context saved successfully:', result);
        return result;
    } catch (error) {
        console.error('Error while saving context:', error);
        throw error;
    }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureContext") {
        console.log('Background: Starting context capture');
        chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
            if (!tabs || tabs.length === 0) {
                console.error('Background: No active tab found');
                sendResponse({success: false, error: 'No active tab found'});
                return;
            }

            const activeTab = tabs[0];
            console.log('Background: Active tab found:', activeTab.url);
            
            try {
                // Capture context via content script
                chrome.tabs.sendMessage(activeTab.id, {action: "captureContext"}, async (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Background: Error while sending message to content script:', chrome.runtime.lastError);
                        sendResponse({success: false, error: chrome.runtime.lastError.message});
                        return;
                    }

                    if (response) {
                        console.log('Background: Response received from content script');
                        // Capture screenshot
                        const screenshot = await captureScreenshot(activeTab.id);
                        
                        // Create complete context
                        const fullContext = {
                            ...response,
                            screenshot: screenshot
                        };
                        
                        // Save context
                        await saveContext(fullContext);
                        
                        sendResponse({success: true});
                    } else {
                        console.error('Background: No response from content script');
                        sendResponse({success: false, error: 'No response from content script'});
                    }
                });
            } catch (error) {
                console.error('Background: Error while capturing context:', error);
                sendResponse({success: false, error: error.message});
            }
        });
        return true;
    }
}); 
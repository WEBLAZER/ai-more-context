// Listen for DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get status element
    const statusElement = document.getElementById('status');
    
    // Check connection status
    chrome.runtime.sendMessage({action: 'getStatus'}, (response) => {
        if (response && response.connected) {
            statusElement.textContent = 'Connected to VSCode';
        } else {
            statusElement.textContent = 'Disconnected from VSCode';
        }
    });
    
    // Listen for status updates
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'updateStatus') {
            if (request.connected) {
                statusElement.textContent = 'Connected to VSCode';
            } else {
                statusElement.textContent = 'Disconnected from VSCode';
            }
        }
    });
    
    // Add click event listener to capture button
    document.getElementById('capture').addEventListener('click', () => {
        // Send message to background script to capture context
        chrome.runtime.sendMessage({action: 'captureContext'}, (response) => {
            if (response && response.success) {
                console.log('Context captured successfully');
            } else {
                console.error('Error while capturing context:', response ? response.error : 'Unknown error');
            }
        });
    });
}); 
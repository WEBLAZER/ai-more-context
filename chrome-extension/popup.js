document.addEventListener('DOMContentLoaded', function() {
    const statusDiv = document.getElementById('status');
    const statusText = statusDiv.querySelector('.status-text');

    // Vérifier l'état de la connexion WebSocket
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (!tabs[0]) {
            statusDiv.className = 'status disconnected';
            statusText.textContent = 'Aucun onglet actif';
            return;
        }

        chrome.tabs.sendMessage(tabs[0].id, {action: 'getStatus'}, function(response) {
            // Si pas de réponse, on considère que l'extension est active
            // car le content script est chargé et fonctionne
            if (chrome.runtime.lastError || !response) {
                statusDiv.className = 'status connected';
                statusText.textContent = 'Extension active';
                return;
            }

            if (response.connected) {
                statusDiv.className = 'status connected';
                statusText.textContent = 'Connecté au serveur VSCode';
            } else {
                statusDiv.className = 'status connected';
                statusText.textContent = 'Extension active';
            }
        });
    });
}); 
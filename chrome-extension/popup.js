document.addEventListener('DOMContentLoaded', function() {
    const captureButton = document.getElementById('captureButton');
    const statusDiv = document.getElementById('status');

    function showStatus(message, isError = false) {
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';
        statusDiv.className = 'status ' + (isError ? 'error' : 'success');
        
        // Cacher le message après 3 secondes
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    captureButton.addEventListener('click', function() {
        captureButton.disabled = true;
        captureButton.textContent = 'Capture en cours...';

        chrome.runtime.sendMessage({action: "captureContext"}, function(response) {
            captureButton.disabled = false;
            captureButton.textContent = 'Capturer le contexte';

            if (response && response.success) {
                showStatus('Contexte capturé avec succès !');
            } else {
                showStatus('Erreur lors de la capture du contexte', true);
            }
        });
    });
}); 
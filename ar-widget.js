(function() {
    const script = document.currentScript;
    const clientId = script.getAttribute('data-client-id');
    const productSku = script.getAttribute('data-product-sku');
    const placeholder = document.getElementById('ar-placeholder');

    if (!placeholder) return; 

    // WAŻNE: Używamy ścieżki do JSON-a na GitHub Pages
    const apiEndpoint = 'https://tomaszsikora22578-png.github.io/ar-widget-demo/model-data.json'; 

    fetch(apiEndpoint)
        .then(response => {
            if (!response.ok) throw new Error('Błąd ładowania danych modelu 3D.');
            return response.json();
        })
        .then(data => {
            // Wstrzyknięcie Model-Viewer (automatycznie obsługuje AR na iOS/Android)
            const modelViewerHtml = `
                <model-viewer 
                    src="${data.glb}"
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    ios-src="${data.usdz}"
                    alt="${data.alt_text}"
                    shadow-intensity="1"
                    camera-controls
                    style="width: 100%; height: 100%;"
                >
                    <button slot="ar-button" style="background-color: #f57c00; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">
                        ZOBACZ W SWOIM WNĘTRZU (AR) 🏠
                    </button>
                </model-viewer>
            `;
            placeholder.innerHTML = modelViewerHtml;

            // Ładowanie Model-Viewer (dla poprawnego renderowania 3D)
            const modelViewerScript = document.createElement('script');
            modelViewerScript.type = 'module';
            modelViewerScript.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
            document.head.appendChild(modelViewerScript);

            // PRZYKŁAD ANALITYKI: Śledzenie, ile razy kliknięto AR
            document.querySelector('#ar-placeholder button').addEventListener('click', () => {
                // TUTAJ docelowo będzie wysyłany POST do Twojego API C#
                console.log(`[ANALYTICS] AR Clicked! Client: ${clientId}, Product: ${productSku}`);
            });
        })
        .catch(error => {
            placeholder.innerHTML = `<p style="color: red; text-align: center;">Nie udało się załadować wizualizacji AR. ${error.message}</p>`;
            console.error(error);
        });
})();

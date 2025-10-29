// ar-widget.js (WERSJA POPRAWIONA I KOMPLETNA)
(function() {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;

    // Definicja Endpointów i Tokenu
    const apiEndpoint = 'https://localhost:7149/api/product/models'; 
    const analyticsEndpoint = 'https://localhost:7149/api/analytics/track'; // 💡 Dodany Endpoint
    const clientId = 'TEST_TOKEN_XYZ'; 
    productsContainer.innerHTML = '<p>Ładowanie modeli AR...</p>';

    // 1. Funkcja do Wysłania Analityki (POST)
    function trackAnalytics(productId, clientToken) {
        const data = {
            ClientToken: clientToken, 
            ProductId: productId 
        };

        fetch(analyticsEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Client-Token': clientToken 
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok || response.status === 204) {
                console.log(`[ANALYTICS] Success: AR Click logged for ${productId}.`);
            } else {
                console.error(`[ANALYTICS] [C# API Error] Status: ${response.status}`);
            }
        })
        .catch(error => console.error('[ANALYTICS] Fetch Error:', error));
    }


    // 2. Ładowanie skryptu Model-Viewer
    const modelViewerScript = document.createElement('script');
    modelViewerScript.type = 'module';
    modelViewerScript.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    document.head.appendChild(modelViewerScript);

    // 3. Główne Zapytanie i Renderowanie (GET)
    fetch(apiEndpoint, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'X-Client-Token': clientId 
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(`Błąd API: Status ${response.status}. Treść: ${data.error || 'Nieznany błąd.'}`);
            });
        }
        return response.json();
    })
    .then(products => {
        if (!Array.isArray(products)) {
             throw new Error("API nie zwróciło tablicy produktów.");
        }
        
        // Usunięcie komunikatu 'Ładowanie...'
        productsContainer.innerHTML = '';
        
        // 4. LOGIKA RENDEROWANIA (Uzupelniony KOD!)
        products.forEach(product => { 
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <h2>${product.name}</h2>
                
                <model-viewer
                    src="${product.glb}"
                    ios-src="${product.usdz}"
                    alt="${product.alt_text}"
                    shadow-intensity="1"
                    camera-controls
                    touch-action="pan-y"
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    ar-scale="auto"
                >
                    <button slot="ar-button" class="ar-button">
                        Zobacz w AR
                    </button>
                </model-viewer>
            `;
            
            // 5. OBSŁUGA KLIKNIĘCIA I WYSYŁANIE ANALITYKI
            const arButton = card.querySelector('.ar-button');
            if (arButton) {
                arButton.addEventListener('click', () => {
                    // 💡 Wywołanie funkcji POST do API C#
                    trackAnalytics(product.productId, clientId);
                });
            }
            
            productsContainer.appendChild(card);
        });
    })
    .catch(error => {
        productsContainer.innerHTML = `<p style="color: red; font-weight: bold;">[Błąd Krytyczny] Nie można załadować wtyczki: ${error.message}</p>`;
        console.error("Krytyczny Błąd Fetch:", error);
    });
})();

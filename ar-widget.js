// ar-widget.js (NOWA WERSJA)
(function() {
    const productsContainer = document.getElementById('products-container');
    if (!productsContainer) return;

    // WAŻNE: Wskazujemy na nowy plik z listą modeli
    const apiEndpoint = 'https://localhost:7149/api/product/models'; 
    const clientId = 'TEST_TOKEN_XYZ'; // Klient jest jeden dla całego demo

    // 1. Ładowanie skryptu Model-Viewer (na początku, dla wszystkich kart)
    const modelViewerScript = document.createElement('script');
    modelViewerScript.type = 'module';
    modelViewerScript.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    document.head.appendChild(modelViewerScript);

 fetch(apiEndpoint, {
        method: 'GET', // Metoda jest GET
        headers: { 
            'Content-Type': 'application/json',
            // 💡 KLUCZOWY FRAGMENT: Dodajemy nagłówek X-Client-Token
            'X-Client-Token': clientId 
        }
    }).then(response => {
        // 🚨 Dodajemy weryfikację statusu HTTP
        if (!response.ok) {
            // Jeśli status to np. 401, 404 lub inny błąd, rzucamy wyjątek
            throw new Error(`API returned status ${response.status}. Check client token and subscription status.`);
        }
        return response.json();
    })
    .then(products => {
        // 🚨 Dodajemy weryfikację, czy to na pewno tablica
        if (!Array.isArray(products)) {
            // Jeśli to nie jest tablica, też rzucamy wyjątek
             throw new Error("API response is not a valid array of products.");
        }
        
        // Jeśli wszystko OK, kontynuujemy z pętlą
        products.forEach(product => { 
            // ... reszta Twojego kodu w pętli ...
        });
    })
    .catch(error => {
        // Użyj productsContainer, aby wyświetlić błąd użytkownikowi
        productsContainer.innerHTML = `<p style="color: red; font-weight: bold;">Błąd ładowania produktów AR: ${error.message}</p>`;
        console.error("Critical Fetch Error:", error);
    });
})();

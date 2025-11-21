// ... (Deklaracje API_URL, DEMO_TOKEN i ANALYTICS_URL - bez zmian)
const API_URL = 'https://ar-widget-api-849496305543.europe-central2.run.app/api/product/models';
const DEMO_TOKEN = 'TEST_TOKEN_XYZ';
const ANALYTICS_URL = 'https://ar-widget-api-849496305543.europe-central2.run.app/api/analytics/track';

//Funkcja analityczna, używająca navigator.sendBeacon()
function trackArClick(productId) {
    if (!productId) return;
    
    // 1. Dodajemy Token jako Query String do adresu URL analityki.
    // Jest to konieczne, ponieważ sendBeacon() nie obsługuje nagłówków.
    const urlWithToken = `${ANALYTICS_URL}?token=${DEMO_TOKEN}`;

    // 2. Przygotowanie Payloadu JSON
    const payload = { ProductId: parseInt(productId, 10) };
    
    // Tworzenie Blob (binarny obiekt danych) z poprawnym typem (Content-Type)
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });

    // 3. Wysłanie danych w tle
    // Przeglądarka gwarantuje, że to żądanie zostanie wysłane, nawet jeśli użytkownik opuści stronę (przechodząc do AR).
    const success = navigator.sendBeacon(urlWithToken, blob);

    if (success) {
        console.log(`✅ Beacon AR_CLICK dla ProductId ${productId} wysłany przez sendBeacon.`);
    } else {
        console.error('BŁĄD: Przeglądarka odrzuciła sendBeacon. Dane mogły być zbyt duże.');
    }
}

function renderModelViewer(modelData) {
    const viewer = document.createElement('model-viewer');
    
    // 1. Konfiguracja Model Viewer (standardowa)
    viewer.setAttribute('src', modelData.signedUrlGlb); 
    viewer.setAttribute('ios-src', modelData.signedUrlUsdz); 
    
    viewer.setAttribute('ar', ''); 
    viewer.setAttribute('ar-modes', 'quick-look scene-viewer webxr'); 
    viewer.setAttribute('ar-scale', 'auto'); 
    
    // Ustawienie ProductId jako atrybutu DOM w celu wyłapania w listenerze eventu
    viewer.setAttribute('data-product-id', modelData.ProductId); 

    // 2. Ustawienia UX
    viewer.setAttribute('alt', `Model 3D produktu: ${modelData.name}`);
    viewer.setAttribute('shadow-intensity', '1.5'); 
    viewer.setAttribute('camera-controls', ''); 
    viewer.setAttribute('auto-rotate', ''); 
    viewer.setAttribute('loading', 'eager'); 
    viewer.setAttribute('exposure', '0.9'); // Lekkie przyciemnienie, aby usunąć prześwietlenie
viewer.setAttribute('environment-image', 'neutral');
    
    // --- KROK 3: UNIWERSALNY PRZYCISK AR (Czysty HTML) ---
    // Używamy prostego buttona bez listenerów, aby nie zakłócać AR Quick Look
    const arButton = document.createElement('button');
    arButton.textContent = 'ZOBACZ W AR';
    arButton.setAttribute('slot', 'ar-button'); 
    
    // Udoskonalony przycisk (wizualizacja bez zmian)
    arButton.className = 'w-full mt-4 px-6 py-3 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg shadow-indigo-500/50 hover:bg-indigo-700 transition duration-150 transform hover:scale-[1.03]';

    // --- KROK 4: KOMUNIKAT O BRAKU WSPARCIA AR ---
    const arUnsupportedMessage = document.createElement('div');
    arUnsupportedMessage.setAttribute('slot', 'unsupported');
    arUnsupportedMessage.className = 'text-center p-6 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl absolute inset-0 flex flex-col items-center justify-center';
    arUnsupportedMessage.innerHTML = '⚠️ <span class="font-extrabold text-xl block mb-2">Brak wsparcia AR.</span> <span class="text-sm">Funkcja AR wymaga telefonu/tabletu z systemem iOS (Safari) lub Android (Chrome).</span>';
    
    // Montowanie elementów
    viewer.appendChild(arButton);
    viewer.appendChild(arUnsupportedMessage); 

    // 3. Montowanie do Kontenera
    const modelWrapper = document.createElement('div');
    // Udoskonalona Karta (bez zmian)
    modelWrapper.className = 'flex flex-col items-center bg-white p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-indigo-300/60 transition duration-300 transform hover:-translate-y-1';
    
    const title = document.createElement('h3');
    // Udoskonalony Tytuł (bez zmian)
    title.className = 'text-2xl font-extrabold text-gray-900 mb-4 border-b border-indigo-100 pb-2 w-full text-center tracking-tight';
    title.textContent = modelData.name;

    modelWrapper.appendChild(title);
    modelWrapper.appendChild(viewer);

    return modelWrapper;
}

// ------------------------------------------------------------------
// DODAJ TEN GLOBALNY LISTENER NA KONIEC PLIKU ar-widget.js
// ------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // Używamy delegowania eventów na całym kontenerze, aby wyłapać event z model-viewer
    const viewerContainer = document.getElementById('model-viewer-container');
    
    if (viewerContainer) {
        viewerContainer.addEventListener('ar-button-activated', (event) => {
            // Wyciągamy ID produktu bezpośrednio z atrybutu data-product-id
            const modelViewerElement = event.target;
            const productId = modelViewerElement.getAttribute('data-product-id');
            
            if (productId) {
                // Teraz bezpiecznie uruchamiamy analitykę PO AKTYWACJI PRZYCISKU
                trackArClick(parseInt(productId, 10));
            }
        });
    }
});
// Funkcja fetchWidgets (bez zmian, ale usunięta sekcja JSON)
async function fetchWidgets() {
    const statusDiv = document.getElementById('api-status');
    const viewerContainer = document.getElementById('model-viewer-container');

    statusDiv.textContent = 'Ładowanie danych z Cloud Run...';
    statusDiv.className = 'mt-8 p-4 rounded-xl font-medium text-blue-500 bg-blue-50 text-center';
    viewerContainer.innerHTML = ''; 

    try {
        const headers = new Headers();
        headers.append('X-Client-Token', DEMO_TOKEN);

        const response = await fetch(API_URL, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
             const errorText = await response.text();
             statusDiv.textContent = `BŁĄD: ${response.status} (${response.statusText})`;
             statusDiv.className = 'mt-8 p-4 rounded-xl font-medium text-red-700 bg-red-100 text-center';
             console.error('Błąd API:', errorText);
             return;
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
            data.forEach(model => {
                const modelElement = renderModelViewer(model);
                viewerContainer.appendChild(modelElement);
            });

            statusDiv.textContent = `✅ SUKCES! Otrzymano i załadowano ${data.length} model(i) 3D. Przewiń w dół, aby zobaczyć!`;
            statusDiv.className = 'mt-8 p-4 rounded-xl font-medium text-green-700 bg-green-100 text-center';
        } else {
            statusDiv.textContent = 'SUKCES, ale API zwróciło pustą listę modeli.';
            statusDiv.className = 'mt-8 p-4 rounded-xl font-medium text-orange-700 bg-orange-100 text-center';
        }

    } catch (e) {
        statusDiv.textContent = `BŁĄD SIECI/CORS: ${e.message}`;
        statusDiv.className = 'mt-8 p-4 rounded-xl font-medium text-red-700 bg-red-100 text-center';
        console.error('Szczegóły błędu sieci:', e);
    }
}

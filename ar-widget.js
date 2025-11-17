// Cloud Run API endpoint
const API_URL = 'https://ar-widget-api-849496305543.europe-central2.run.app/api/product/models';
// Twój klient-test token
const DEMO_TOKEN = 'TEST_TOKEN_XYZ';

// KROK 2: NOWA FUNKCJA DO RENDEROWANIA MODELU 3D
function renderModelViewer(modelData) {
    const viewer = document.createElement('model-viewer');

    // 1. Ustawienie źródła modelu GLB (Android, PC)
    viewer.setAttribute('src', modelData.signedUrlGlb); 
    
    // 2. Ustawienie źródła modelu USDZ (iOS - kluczowe dla AR Quick Look)
    viewer.setAttribute('ios-src', modelData.signedUrlUsdz); 

    // 3. Włączenie funkcjonalności AR
    viewer.setAttribute('ar', ''); // Włącz AR
    viewer.setAttribute('ar-modes', 'webxr scene-viewer quick-look'); // Obsługa różnych platform
    viewer.setAttribute('ar-scale', 'auto'); // Automatyczne dopasowanie skali

    // 4. Ustawienia UX/Prezentacji
    viewer.setAttribute('alt', `Model 3D produktu: ${modelData.name}`);
    viewer.setAttribute('shadow-intensity', '1');
    viewer.setAttribute('camera-controls', ''); // Umożliwia obracanie i skalowanie
    viewer.setAttribute('auto-rotate', ''); // Automatyczne obracanie (opcjonalne)
    viewer.setAttribute('loading', 'eager'); // Szybkie ładowanie

    // Dodanie przycisku AR (używamy domyślnego przycisku Model Viewer)
    viewer.setAttribute('id', `model-${modelData.name.replace(/\s/g, '-')}`);

    // Dodanie nagłówka dla modelu
    const modelWrapper = document.createElement('div');
    modelWrapper.className = 'flex flex-col items-center bg-gray-50 p-4 rounded-xl shadow-lg';
    
    const title = document.createElement('h3');
    title.className = 'text-xl font-bold text-gray-800 mb-4';
    title.textContent = modelData.name;
    
    modelWrapper.appendChild(title);
    modelWrapper.appendChild(viewer);

    return modelWrapper;
}

// Funkcja pobierająca dane i renderująca modele 3D
async function fetchWidgets() {
    const statusDiv = document.getElementById('api-status');
    const resultDiv = document.getElementById('api-result');
    const viewerContainer = document.getElementById('model-viewer-container');

    statusDiv.textContent = 'Ładowanie danych z Cloud Run...';
    statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-blue-500 bg-blue-50';
    resultDiv.innerHTML = '';
    viewerContainer.innerHTML = ''; // Wyczyść stare modele

    try {
        const headers = new Headers();
        headers.append('X-Client-Token', DEMO_TOKEN);

        const response = await fetch(API_URL, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            // ... (logika błędu)
            const errorText = await response.text();
            statusDiv.textContent = `BŁĄD: ${response.status} (${response.statusText})`;
            statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-red-700 bg-red-100';
            resultDiv.innerHTML = `<h3 class="font-semibold text-red-700 mb-2">Treść błędu:</h3>
                                   <pre class="bg-red-50 p-4 rounded-lg text-sm whitespace-pre-wrap">${errorText}</pre>`;
            return;
        }

        const data = await response.json();
        
        // KRYTYCZNY KROK: RENDEROWANIE MODELI 3D
        if (data && data.length > 0) {
            data.forEach(model => {
                const modelElement = renderModelViewer(model);
                viewerContainer.appendChild(modelElement);
            });

            // Status sukcesu z renderowaniem
            statusDiv.textContent = `✅ SUKCES! Otrzymano i załadowano ${data.length} model(i) 3D.`;
            statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-green-700 bg-green-100';

            // Wyświetlenie JSON pod podglądem 3D (dla celów debugowania)
            resultDiv.innerHTML = `<h3 class="text-lg font-semibold mb-2">Odebrane dane JSON:</h3>
                                   <pre class="bg-gray-100 p-4 rounded-lg text-sm whitespace-pre-wrap">${JSON.stringify(data, null, 2)}</pre>`;
        } else {
            statusDiv.textContent = 'SUKCES, ale API zwróciło pustą listę modeli.';
            statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-orange-700 bg-orange-100';
            resultDiv.innerHTML = `<h3 class="text-lg font-semibold mb-2">Odebrane dane JSON:</h3>
                                   <pre class="bg-gray-100 p-4 rounded-lg text-sm whitespace-pre-wrap">${JSON.stringify(data, null, 2)}</pre>`;
        }

    } catch (e) {
        statusDiv.textContent = `BŁĄD SIECI/CORS: ${e.message}`;
        statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-red-700 bg-red-100';
        resultDiv.innerHTML = `<p class="text-red-600 mt-2">Sprawdź konsolę przeglądarki.</p>`;
        console.error('Szczegóły błędu:', e);
    }
}

// Listener do przycisku (przeniesiony do index.html, ale zostawiamy pusty, aby uniknąć konfliktu)
// document.addEventListener('DOMContentLoaded', () => { ... });

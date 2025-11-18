// Cloud Run API endpoint
const API_URL = 'https://ar-widget-api-849496305543.europe-central2.run.app/api/product/models';
// Twój klient-test token
const DEMO_TOKEN = 'TEST_TOKEN_XYZ';

// NOWY ENDPOINT ANALITYKI
const ANALYTICS_URL = 'https://ar-widget-api-849496305543.europe-central2.run.app/api/analytics/track';

// Funkcja analityczna (dodana dla kompletności)
async function trackArClick(productId) {
    if (!productId) return;
    
    try {
        const payload = {
            ProductId: productId
        };
        
        const headers = new Headers();
        headers.append('X-Client-Token', DEMO_TOKEN);
        headers.append('Content-Type', 'application/json');

        const response = await fetch(ANALYTICS_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (response.status === 204) {
            console.log(`✅ Zdarzenie AR_CLICK dla ProductId ${productId} zarejestrowane.`);
        } else {
            console.error(`BŁĄD rejestracji AR: ${response.status}`, await response.text());
        }
    } catch (error) {
        console.error('Błąd sieci podczas śledzenia AR:', error);
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
    
    // 2. Ustawienia UX
    viewer.setAttribute('alt', `Model 3D produktu: ${modelData.name}`);
    viewer.setAttribute('shadow-intensity', '1');
    viewer.setAttribute('camera-controls', ''); 
    viewer.setAttribute('auto-rotate', ''); 
    viewer.setAttribute('loading', 'eager'); 
    
    // --- KROK 3: UNIWERSALNY PRZYCISK AR ---
    const arButton = document.createElement('button');
    arButton.textContent = 'ZOBACZ W AR';
    arButton.setAttribute('slot', 'ar-button'); 
    
    // Nowe klasy przycisku: ujednolicone i bardziej profesjonalne
    arButton.className = 'w-full mt-4 px-6 py-3 bg-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-indigo-700 transition duration-150 transform hover:scale-[1.02]';

    // DODANIE LISTENER'A DLA ANALITYKI
    arButton.addEventListener('click', () => {
        trackArClick(modelData.ProductId); 
    });


    // --- KROK 4: KOMUNIKAT O BRAKU WSPARCIA AR (SLOT 'unsupported') ---
    const arUnsupportedMessage = document.createElement('div');
    arUnsupportedMessage.setAttribute('slot', 'unsupported');
    arUnsupportedMessage.className = 'text-center p-4 bg-red-100 text-red-800 rounded-xl absolute inset-0 flex flex-col items-center justify-center';
    
    // Treść komunikatu
    arUnsupportedMessage.innerHTML = '⚠️ <span class="font-bold block mb-1">Brak wsparcia AR.</span> Spróbuj użyć Safari na iOS lub Chrome na Androidzie.';
    
    // Montowanie elementów
    viewer.appendChild(arButton);
    viewer.appendChild(arUnsupportedMessage); 

    // 3. Montowanie do Kontenera
    const modelWrapper = document.createElement('div');
    // NOWE KLASY DLA KARTY: Białe tło, mocny cień, dynamiczny hover
    modelWrapper.className = 'flex flex-col items-center bg-white p-6 rounded-3xl shadow-2xl hover:shadow-indigo-400/50 transition duration-300 transform hover:-translate-y-1';
    
    const title = document.createElement('h3');
    title.className = 'text-2xl font-bold text-gray-800 mb-4';
    title.textContent = modelData.name;

    modelWrapper.appendChild(title);
    modelWrapper.appendChild(viewer);

    return modelWrapper;
}

// Funkcja fetchWidgets (bez zmian)
async function fetchWidgets() {
    // ... (pozostała część funkcji fetchWidgets bez zmian)
    const statusDiv = document.getElementById('api-status');
    const resultDiv = document.getElementById('api-result');
    const viewerContainer = document.getElementById('model-viewer-container');

    statusDiv.textContent = 'Ładowanie danych z Cloud Run...';
    statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-blue-500 bg-blue-50';
    resultDiv.innerHTML = '';
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
             statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-red-700 bg-red-100';
             resultDiv.innerHTML = `<h3 class="font-semibold text-red-700 mb-2">Treść błędu:</h3>
                                    <pre class="bg-red-50 p-4 rounded-lg text-sm whitespace-pre-wrap">${errorText}</pre>`;
             return;
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
            data.forEach(model => {
                // Wprowadzamy ProductId do danych modelu (jeśli go tam nie ma, co jest kluczowe dla analityki!)
                // Zakładam, że ProductId jest w obiekcie 'model'. Jeśli nie, musisz je skądś wziąć.
                const modelElement = renderModelViewer(model);
                viewerContainer.appendChild(modelElement);
            });
/*
            statusDiv.textContent = `✅ SUKCES! Otrzymano i załadowano ${data.length} model(i) 3D.`;
            statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-green-700 bg-green-100';

            resultDiv.innerHTML = `<h3 class="text-lg font-semibold mb-2">Odebrane dane JSON:</h3>
                                   <pre class="bg-gray-100 p-4 rounded-lg text-sm whitespace-pre-wrap">${JSON.stringify(data, null, 2)}</pre>`;
        } else {
            statusDiv.textContent = 'SUKCES, ale API zwróciło pustą listę modeli.';
            statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-orange-700 bg-orange-100';
            resultDiv.innerHTML = `<h3 class="text-lg font-semibold mb-2">Odebrane dane JSON:</h3>
                                   <pre class="bg-gray-100 p-4 rounded-lg text-sm whitespace-pre-wrap">${JSON.stringify(data, null, 2)}</pre>`;
        }
*/
    } catch (e) {
        statusDiv.textContent = `BŁĄD SIECI/CORS: ${e.message}`;
        statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-red-700 bg-red-100';
        resultDiv.innerHTML = `<p class="text-red-600 mt-2">Sprawdź konsolę przeglądarki.</p>`;
        console.error('Szczegóły błędu:', e);
    }
}

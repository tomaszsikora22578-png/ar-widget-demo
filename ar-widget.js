// Cloud Run API endpoint
const API_URL = 'https://ar-widget-api-849496305543.europe-central2.run.app/api/product/models';;
        
// TEST TOKEN (You need to replace this with a valid token if TEST_TOKEN_XYZ fails)
const DEMO_TOKEN = 'TEST_TOKEN_XYZ'; 

// Function to initialize the frontend and fetch data
function initializeFrontend() {
    const fetchButton = document.getElementById('fetch-button');
    if (fetchButton) {
        fetchButton.addEventListener('click', fetchWidgets);
        // Initial fetch on load
        fetchWidgets(); 
    }
}

// Core function to fetch data from the Cloud Run API
async function fetchWidgets() {
    const resultDiv = document.getElementById('api-result');
    const statusDiv = document.getElementById('api-status');

    if (!statusDiv || !resultDiv) {
        console.error('Brak elementów DOM do wyświetlenia statusu/wyników.');
        return;
    }

    statusDiv.textContent = 'Ładowanie danych z Cloud Run API...';
    statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-blue-500 bg-blue-50';
    resultDiv.innerHTML = '';

    try {
        const headers = new Headers();
        // ***** OSTATECZNA POPRAWKA: UŻYWAMY STANDARDOWEGO NAGŁÓWKA AUTORYZACYJNEGO *****
        // Backend C# oczekuje Authorization: Bearer <token>
        headers.append('X-Client-Token', DEMO_TOKEN);

        const response = await fetch(API_URL, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            // Error handling (401 Unauthorized, 404 Not Found, etc.)
            statusDiv.textContent = `BŁĄD: Otrzymano status ${response.status} (${response.statusText}). Wysłany token (${DEMO_TOKEN}) nie został zaakceptowany.`;
            statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-red-700 bg-red-100';
            
            const errorText = await response.text();
            resultDiv.innerHTML = `<h3 class="font-semibold text-red-700 mb-2">Treść Błędu:</h3><pre class="bg-red-50 p-4 rounded-lg text-sm whitespace-pre-wrap">${errorText}</pre>`;
            return;
        }

        const data = await response.json();
        
        // Success
        statusDiv.textContent = 'SUKCES! Dane JSON otrzymane z Cloud Run (Autoryzacja przyjęta).';
        statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-green-700 bg-green-100';

        // Displaying formatted JSON data
        resultDiv.innerHTML = `
            <h3 class="text-lg font-semibold mb-2">Odebrane dane:</h3>
            <pre class="bg-gray-100 p-4 rounded-lg text-sm whitespace-pre-wrap">${JSON.stringify(data, null, 2)}</pre>
        `;

    } catch (error) {
        // Network/CORS error
        statusDiv.textContent = `BŁĄD SIECI/CORS: Wystąpił problem z połączeniem z serwerem. Sprawdź konsole przeglądarki.`;
        statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-red-700 bg-red-100';
        resultDiv.innerHTML = `<p class="text-red-600 mt-2">Szczegóły błędu: ${error.message}</p>`;
    }
}

// Run the initialization when the document is ready
document.addEventListener('DOMContentLoaded', initializeFrontend);

// Upewnij się, że plik index.html odwołuje się do tego pliku JS:
// <script src="ar-widget.js"></script>

// Cloud Run API endpoint
const API_URL = 'https://ar-widget-api-849496305543.europe-central2.run.app/api/product/models';

// TEST TOKEN (Zastąp poprawnym tokenem, jeśli TEST_TOKEN_XYZ nie działa)
const DEMO_TOKEN = 'TEST_TOKEN_XYZ';

// Inicjalizacja frontendu
function initializeFrontend() {
    const fetchButton = document.getElementById('fetch-button');
    if (fetchButton) {
        fetchButton.addEventListener('click', fetchWidgets);
        fetchWidgets(); // początkowe pobranie danych
    }
}

// Funkcja do pobrania danych z API
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
        // Wysyłamy token w obu formach: Authorization + X-Client-Token
        headers.append('X-Client-Token', DEMO_TOKEN);

        const response = await fetch(API_URL, {
            method: 'GET',
            headers: headers,
        });

        if (!response.ok) {
            // Obsługa błędów HTTP
            const errorText = await response.text();
            statusDiv.textContent = `BŁĄD: Otrzymano status ${response.status} (${response.statusText}).`;
            statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-red-700 bg-red-100';
            resultDiv.innerHTML = `<h3 class="font-semibold text-red-700 mb-2">Treść Błędu:</h3><pre class="bg-red-50 p-4 rounded-lg text-sm whitespace-pre-wrap">${errorText}</pre>`;
            return;
        }

        const data = await response.json();

        // Sukces
        statusDiv.textContent = 'SUKCES! Dane JSON otrzymane z Cloud Run (Autoryzacja przyjęta).';
        statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-green-700 bg-green-100';
        resultDiv.innerHTML = `
            <h3 class="text-lg font-semibold mb-2">Odebrane dane:</h3>
            <pre class="bg-gray-100 p-4 rounded-lg text-sm whitespace-pre-wrap">${JSON.stringify(data, null, 2)}</pre>
        `;

    } catch (error) {
        // Błąd sieci/CORS
        statusDiv.textContent = 'BŁĄD SIECI/CORS: Wystąpił problem z połączeniem z serwerem. Sprawdź konsolę przeglądarki.';
        statusDiv.className = 'mt-6 p-4 rounded-lg font-medium text-red-700 bg-red-100';
        resultDiv.innerHTML = `<p class="text-red-600 mt-2">Szczegóły błędu: ${error.message}</p>`;
    }
}

// Uruchomienie po załadowaniu dokumentu
document.addEventListener('DOMContentLoaded', initializeFrontend);

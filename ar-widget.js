// Cloud Run API endpoint
const API_URL = 'https://ar-widget-api-849496305543.europe-central2.run.app/api/product/models';
// Twój klient-test token (tylko tutaj, nie w HTML)
const DEMO_TOKEN = 'TEST_TOKEN_XYZ';

// Funkcja pobierająca dane
async function fetchWidgets() {
    const statusDiv = document.getElementById('api-status');
    const resultDiv = document.getElementById('api-result');

    statusDiv.textContent = 'Ładowanie danych z Cloud Run...';
    statusDiv.className = 'mt-4 p-3 rounded bg-blue-50 text-blue-700 font-medium';
    resultDiv.innerHTML = '';

    try {
        const headers = new Headers();
        // Middleware C# wymaga: X-Client-Token
        headers.append('X-Client-Token', DEMO_TOKEN);

        const response = await fetch(API_URL, {
            method: 'GET',
            headers
        });

        if (!response.ok) {
            statusDiv.textContent = `BŁĄD: ${response.status} (${response.statusText})`;
            statusDiv.className = 'mt-4 p-3 rounded bg-red-100 text-red-700 font-medium';
            const errorText = await response.text();
            resultDiv.innerHTML = `<pre>${errorText}</pre>`;
            return;
        }

        const data = await response.json();
        statusDiv.textContent = 'SUKCES! Dane odebrane.';
        statusDiv.className = 'mt-4 p-3 rounded bg-green-100 text-green-700 font-medium';
        resultDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;

    } catch (e) {
        statusDiv.textContent = 'Błąd sieci/CORS';
        statusDiv.className = 'mt-4 p-3 rounded bg-red-100 text-red-700 font-medium';
        resultDiv.innerHTML = `<pre>${e.message}</pre>`;
    }
}

// Listener do przycisku
document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('fetch-button');
    if (button) button.addEventListener('click', fetchWidgets);
});

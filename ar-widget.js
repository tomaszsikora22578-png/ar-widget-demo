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
    })
        .then(products => {
            products.forEach(product => {
                // 2. TWORZENIE KARTY PRODUKTU
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <style>
                        .product-card {
                            border: 1px solid #eee;
                            padding: 15px;
                            margin-bottom: 20px;
                            display: inline-block; /* Aby były obok siebie */
                            width: 300px;
                            margin-right: 20px;
                        }
                        .model-viewer-container {
                            height: 300px; /* Określona wysokość dla 3D */
                            width: 100%;
                            margin-bottom: 10px;
                        }
                    </style>
                    <h2>${product.name}</h2>
                    <p>${product.description}</p>
                    <div id="ar-placeholder-${product.productId}" class="model-viewer-container">
                        </div>
                `;
                productsContainer.appendChild(productCard);

                // 3. WSTRZYKNIĘCIE MODEL-VIEWER DO NOWEJ KARTY
                const placeholder = document.getElementById(`ar-placeholder-${product.productId}`);
                if (placeholder) {
                    placeholder.innerHTML = `
                        <model-viewer 
                            src="${product.glb}"
                            ar
                            ar-modes="webxr scene-viewer quick-look"
                            ios-src="${product.usdz}"
                            alt="${product.alt_text}"
                            shadow-intensity="1" 
                            camera-controls
                            style="width: 100%; height: 100%;"
                        >
                            <button slot="ar-button" style="/* ... styl przycisku ... */">
                                ZOBACZ ${product.name} W AR 🏠
                            </button>
                        </model-viewer>
                    `;
                }

                // 4. ANIMALITYKA (po stworzeniu przycisku)
                const arButton = productCard.querySelector('button[slot="ar-button"]');
                if (arButton) {
                     arButton.addEventListener('click', () => {
                        console.log(`[ANALYTICS] AR Clicked! Product: ${product.productId}`);
                        // Tutaj docelowo wywołujesz POST do Twojego API C#
                    });
                }
            });
        })
        .catch(error => {
            productsContainer.innerHTML = `<p style="color: red;">Błąd: ${error.message}</p>`;
            console.error(error);
        });
})();

import { loadCategories, matchCategory } from './category_matcher.js';
import { calculateEcoImpact } from './eco_impact.js';

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
});

// DOM Elements
const scanButton = document.getElementById('scanButton');
const video = document.getElementById('video');
const result = document.getElementById('result');
const loading = document.getElementById('loading');
const productInfo = document.getElementById('productInfo');
const comparisonContainer = document.getElementById('comparisonContainer');

let scannedBarcodes = [];
let scannedProducts = [];
let stream;

// Attach Event Listener
scanButton.addEventListener('click', () => {
    if (scannedBarcodes.length < 2) {
        openCamera();
    } else {
        resetScanner(); // Reset after scanning two products
    }
});

// Initialize Quagga for scanning
async function openCamera() {
    try {
        loading.hidden = false;
        result.textContent = 'Initializing camera...';

        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.hidden = false;

        Quagga.init({
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: video,
                constraints: {
                    facingMode: "environment",
                },
            },
            decoder: {
                readers: ["ean_reader", "code_128_reader", "upc_reader"],
            },
        }, (err) => {
            if (err) {
                console.error('Error initializing Quagga:', err);
                result.textContent = 'Failed to initialize barcode scanner.';
                loading.hidden = true;
                return;
            }

            Quagga.start();
            result.textContent = 'Scanning...';

            Quagga.onDetected((data) => {
                const barcode = data.codeResult.code;

                if (scannedBarcodes.includes(barcode)) {
                    result.textContent = `Barcode ${barcode} already scanned. Scan a different product.`;
                    return;
                }

                scannedBarcodes.push(barcode);
                result.textContent = `Scanned barcode: ${barcode}`;

                fetchProductInfo(barcode);

                if (scannedBarcodes.length === 2) {
                    Quagga.stop();
                    closeCamera();
                }
            });

            loading.hidden = true;
        });

    } catch (err) {
        console.error('Error accessing the camera:', err);
        result.textContent = 'Please allow camera access to scan barcodes.';
        loading.hidden = true;
    }
}

// Close Camera
function closeCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
    video.hidden = true;
}

// Fetch Product Info
async function fetchProductInfo(barcode) {
    try {
        loading.hidden = false;
        result.textContent = 'Fetching product info...';

        const response = await fetch('https://andreas168168-github-io-9.onrender.com/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ barcode }),
        });

        const data = await response.json();

        if (response.ok) {
            if (!data.product_info) {
                result.textContent = 'No product info found.';
                return;
            }

            scannedProducts.push({
                barcode: barcode,
                name: data.product_info.name || 'No name available',
                genericName: data.product_info.generic_name || 'No generic name available',
                quantity: data.product_info.quantity || 'No quantity available',
                packaging: data.product_info.packaging || 'No packaging info',
                categories: data.product_info.categories || 'No categories available',
                labels: data.product_info.labels || 'No labels available',
                origins: data.product_info.origins || 'No origin information',
                manufacturingPlace: data.product_info.manufacturing_place || 'No manufacturing place info',
                ecoScore: data.product_info.ecoscore_grade || 'No eco-score available',
                image: data.product_info.image || '',
            });

            if (scannedProducts.length === 2) {
                displayComparison();
            }
        } else {
            result.textContent = `Error: ${data.error}`;
        }
    } catch (err) {
        console.error('Error fetching product info:', err);
        result.textContent = 'Failed to fetch product info.';
    } finally {
        loading.hidden = true;
    }
}

// Display Comparison of Two Products
function displayComparison() {
    productInfo.style.display = 'block';
    comparisonContainer.innerHTML = '';

    scannedProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        // Calculate the eco-impact score
        const ecoImpactScore = calculateEcoImpact(product);

        productCard.innerHTML = `
            <p><strong>Product Code:</strong> ${product.barcode}</p>
            <p><strong>Name:</strong> ${product.name}</p>
            <p><strong>Generic Name:</strong> ${product.genericName}</p>
            <p><strong>Quantity:</strong> ${product.quantity}</p>
            <p><strong>Packaging:</strong> ${product.packaging}</p>
            <p><strong>Categories:</strong> ${product.categories}</p>
            <p><strong>Labels:</strong> ${product.labels}</p>
            <p><strong>Origins:</strong> ${product.origins}</p>
            <p><strong>Manufacturing Place:</strong> ${product.manufacturingPlace}</p>
            <p><strong>Eco-Score Grade:</strong> ${product.ecoScore}</p>
            <p><strong>Eco-Impact Score:</strong> ${ecoImpactScore.toFixed(2)}</p>
            <img src="${product.image}" alt="Product Image">
        `;

        comparisonContainer.appendChild(productCard);
    });

    result.textContent = 'Comparison displayed below.';
}

// Reset the Scanner
function resetScanner() {
    scannedBarcodes = [];
    scannedProducts = [];
    comparisonContainer.innerHTML = '';
    productInfo.style.display = 'none';
    result.textContent = 'Scan a new product.';
}

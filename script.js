// ============================================================================
// ⚙️ CONFIGURACIÓN RÁPIDA (Edita aquí desde GitHub si necesitas cambiar algo)
// ============================================================================
const CONFIG = {
    // 1. Títulos de la página
    TAB_TITLE: 'Buscador Levapan',
    HEADER_TITLE: 'Búsqueda PDVs Levapan',

    // 2. Textos del campo de búsqueda
    PLACEHOLDER_LOADING: 'Cargando PDVs...',
    PLACEHOLDER_READY: 'Ingresa SAP, NIT, nombre, ciudad o dirección del PDV',

    // 3. Endpoint de Railway (tu rama Proxy desplegada)
    DATA_URL: 'https://pdvlevapan-production.up.railway.app/api/levapan/pdv',

    // Endpoint directo (referencia):
    // DIRECT_URL: 'https://botai.smartdataautomation.com/api_backend_ai/dinamic-db/report/119/pdv_tickets_levapan',

    // 4. Columnas por las que buscará el buscador
    SEARCH_KEYS: [
        'SAP',
        'NIT',
        'Nombre',
        'Razon Social',
        'Direccion',
        'Población',
        'Distrito',
        'Regional',
        'SGI'
    ],
};
// ============================================================================

let debounceTimer;
let fuse = null;
let allData = [];

// Aplicar títulos configurados al cargar
document.title = CONFIG.TAB_TITLE;
const titleEl = document.getElementById('searchTitle');
if (titleEl) titleEl.textContent = CONFIG.HEADER_TITLE;
const inputEl = document.getElementById('searchInput');
if (inputEl) inputEl.placeholder = CONFIG.PLACEHOLDER_LOADING;

async function loadData() {
    try {
        if (!allData.length) {
            const response = await fetch(CONFIG.DATA_URL);
            const json = await response.json();
            allData = json.result || [];
            initializeFuse();

            const searchInput = document.getElementById('searchInput');
            searchInput.disabled = false;
            searchInput.placeholder = CONFIG.PLACEHOLDER_READY;
        }
    } catch (error) {
        console.error("Error al cargar datos:", error);
        document.getElementById('searchInput').placeholder = 'No disponible';
        document.getElementById('results').innerHTML = `
            <p style="color:red;"> No se pudo cargar la información.
            Es posible que los permisos de CORS o el servidor estén bloqueando la conexión.</p>`;
    }
}

function initializeFuse() {
    const options = {
        keys: CONFIG.SEARCH_KEYS,
        threshold: 0.3,
    };
    fuse = new Fuse(allData, options);
}

function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const searchInput = document.getElementById('searchInput').value.toLowerCase();
        if (searchInput.trim()) {
            performSearch(searchInput);
        } else {
            document.getElementById('results').innerHTML = '';
        }
    }, 300);
}

function performSearch(query) {
    if (!fuse) return;
    const results = fuse.search(query).map(result => result.item);
    renderResults(results);
}

function renderResults(results) {
    let output = `<h2>Resultados (${results.length} encontrados):</h2>`;

    if (results.length > 0) {
        results.forEach(result => {
            const nombre = result.Nombre || result.PDV || 'Sin nombre';
            const poblacion = result['Población'] || result.CIUDAD || '';
            const regional = result.Regional || '';
            const distrito = result.Distrito || '';

            output += `
                <div class="result-item pdv" role="region" aria-label="${nombre}">
                    <h3>
                        <i class="material-icons icon-tipo">store</i>
                        ${nombre}
                    </h3>
                    <div class="tags">
                        ${poblacion ? `<span class="tag ciudad">${poblacion}</span>` : ''}
                        ${distrito ? `<span class="tag">${distrito}</span>` : ''}
                        ${regional ? `<span class="tag">${regional}</span>` : ''}
                    </div>
                    <ul>
                        <li><strong>SAP:</strong> ${result.SAP ?? 'N/A'}
                            <i class="material-icons copy-icon" role="button" tabindex="0" aria-label="Copiar SAP" onclick="copyToClipboard('${result.SAP}', 'SAP')">content_copy</i>
                        </li>
                        <li><strong>NIT:</strong> ${result.NIT ?? 'N/A'}
                            <i class="material-icons copy-icon" role="button" tabindex="0" aria-label="Copiar NIT" onclick="copyToClipboard('${result.NIT}', 'NIT')">content_copy</i>
                        </li>
                        <li><strong>Razón Social:</strong> ${result['Razon Social'] || 'N/A'}</li>
                        <li><strong>Dirección:</strong> ${result.Direccion || result.DIRECCION || 'N/A'}</li>
                        <li><strong>Población:</strong> ${poblacion || 'N/A'}</li>
                        <li><strong>Canal:</strong> ${result['Canal de distribución'] || 'N/A'}</li>
                        <li><strong>Grupo / Subgrupo:</strong> ${result['Grupo de clientes'] || 'N/A'} - ${result.Subgrupo || 'N/A'}</li>
                        <li><strong>SGI / GPV:</strong> ${result.SGI ?? 'N/A'} / ${result.GPV || 'N/A'}</li>
                        <li><strong>KAM / Jefe de Ventas:</strong> ${result['Kam/Jefe De Ventas'] || 'N/A'}</li>
                        <li><strong>Coordinador:</strong> ${result.COORDINADOR || 'N/A'}</li>
                    </ul>
                </div>
            `;
        });
    } else {
        output += '<p>No se encontraron resultados.</p>';
    }

    document.getElementById('results').innerHTML = output;
}

function copyToClipboard(text, label = 'SAP') {
    navigator.clipboard.writeText(text)
        .then(() => {
            alert(`${label} copiado al portapapeles`);
        })
        .catch(err => {
            alert(`Error al copiar el ${label}`);
            console.error('Error:', err);
        });
}

function toggleDarkMode() {
    const isDark = document.getElementById('darkModeToggle').checked;
    document.body.classList.toggle('dark-mode', isDark);
    document.getElementById('darkModeLabel').textContent = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}

window.onload = () => {
    const darkModeSetting = localStorage.getItem('darkMode');
    const isDark = darkModeSetting === 'enabled';
    document.body.classList.toggle('dark-mode', isDark);
    document.getElementById('darkModeToggle').checked = isDark;
    document.getElementById('darkModeLabel').textContent = isDark ? '☀️ Modo claro' : '🌙 Modo oscuro';
};

loadData();

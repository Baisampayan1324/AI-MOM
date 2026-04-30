(function () {
    function normalizeUrl(value) {
        return String(value || '').trim().replace(/\/+$/, '');
    }

    function getConfiguredBackendBaseUrl() {
        const deploymentConfig = window.AI_MOM_RUNTIME_CONFIG || window.AI_MOM_DEPLOYMENT_CONFIG || {};
        const explicitConfig = window.AI_MOM_RUNTIME_CONFIG && window.AI_MOM_RUNTIME_CONFIG.backendBaseUrl;
        const storedConfig = window.localStorage ? window.localStorage.getItem('AI_MOM_BACKEND_BASE_URL') : '';
        const override = window.__AI_MOM_BACKEND_BASE_URL__ || deploymentConfig.backendBaseUrl || explicitConfig || storedConfig;

        if (override) {
            return normalizeUrl(override);
        }

        // Check if running on localhost or via file:// protocol (local development)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || !window.location.hostname) {
            return 'http://localhost:8000';
        }

        return normalizeUrl('https://YOUR-RENDER-SERVICE.onrender.com');
    }

    const backendBaseUrl = getConfiguredBackendBaseUrl();
    const apiBaseUrl = backendBaseUrl ? `${backendBaseUrl}/api` : '';
    const wsBaseUrl = backendBaseUrl ? backendBaseUrl.replace(/^http/, 'ws') : '';

    function joinUrl(baseUrl, path) {
        if (!baseUrl) {
            return '';
        }

        const normalizedPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
        return `${baseUrl}${normalizedPath}`;
    }

    window.AI_MOM_RUNTIME = {
        backendBaseUrl: backendBaseUrl,
        apiBaseUrl: apiBaseUrl,
        wsBaseUrl: wsBaseUrl,
        buildApiUrl: function (path) {
            return joinUrl(apiBaseUrl, path);
        },
        buildWsUrl: function (path) {
            return joinUrl(wsBaseUrl, path);
        }
    };
})();
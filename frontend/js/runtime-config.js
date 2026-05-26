(function () {
    function normalizeUrl(value) {
        return String(value || '').trim().replace(/\/+$/, '');
    }

    function isPlaceholderBackendUrl(value) {
        const normalized = normalizeUrl(value);
        return !normalized || /YOUR-RENDER-SERVICE\.onrender\.com/i.test(normalized);
    }

    function getConfiguredBackendBaseUrl() {
        const deploymentConfig = window.AI_MOM_RUNTIME_CONFIG || window.AI_MOM_DEPLOYMENT_CONFIG || {};
        const explicitConfig = window.AI_MOM_RUNTIME_CONFIG && window.AI_MOM_RUNTIME_CONFIG.backendBaseUrl;
        const storedConfig = window.localStorage ? window.localStorage.getItem('AI_MOM_BACKEND_BASE_URL') : '';
        const configuredCandidates = [
            window.__AI_MOM_BACKEND_BASE_URL__,
            deploymentConfig.backendBaseUrl,
            explicitConfig,
            storedConfig,
        ];

        for (const candidate of configuredCandidates) {
            if (!isPlaceholderBackendUrl(candidate)) {
                return normalizeUrl(candidate);
            }
        }

        // Check if running on localhost or via file:// protocol (local development)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || !window.location.hostname) {
            return 'http://localhost:8000';
        }

        return 'http://localhost:8000';
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
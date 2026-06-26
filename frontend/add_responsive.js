const fs = require('fs');
const path = require('path');

const filesToUpdate = ['index.html', 'file.html', 'real.html'];
const cssAppends = {
    'index.html': `
        /* Responsive Overrides Mobile/Tablet */
        @media (max-width: 1024px) {
            .realtime-grid-new, .minutes-grid, .features-grid, .stats-grid { grid-template-columns: 1fr !important; }
            .earth-stars { width: 500px; height: 500px; }
            .hero::after { width: 400px; height: 400px; }
            .main-content { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
            nav { flex-direction: column; padding: 1rem; gap: 1rem; }
            .nav-right { width: 100%; justify-content: center; gap: 1rem; flex-wrap: wrap; }
            .nav-links { gap: 1rem; flex-wrap: wrap; justify-content: center; }
            .hero { padding: 0 1rem; }
            .hero h1 { font-size: 2.5rem; }
            .earth-stars { width: 400px; height: 400px; }
            .hero::after { width: 300px; height: 300px; }
            .feature-tag { font-size: 0.75rem; padding: 0.4rem 0.8rem; }
            .minutes-grid, .realtime-grid-new { grid-template-columns: 1fr; gap: 2rem; }
            .minutes-visual img { width: 100%; }
        }
        @media (max-width: 480px) {
            nav { padding: 1rem 0.5rem; }
            .nav-links { width: 100%; justify-content: center; }
            .nav-right { flex-direction: column; align-items: center; }
            .hero h1 { font-size: 2rem; }
            .earth-stars { display: none; }
            .hero::after { width: 250px; height: 250px; }
            .feature-tag { display: none; }
            .stat-number { font-size: 2rem; }
            .cta-section h2 { font-size: 1.8rem; }
        }
`,
    'file.html': `
        /* Responsive Overrides Mobile/Tablet */
        @media (max-width: 1024px) {
            .main-content { grid-template-columns: 1fr; }
            .how-to-sidebar { padding: 0; }
            .security-badges { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
            nav { flex-direction: column; padding: 1rem; gap: 1rem; }
            .nav-right { width: 100%; justify-content: center; gap: 1rem; flex-wrap: wrap; }
            .nav-links { gap: 1rem; flex-wrap: wrap; justify-content: center; }
            .container { padding: 1.5rem 1rem; }
            .header h1 { font-size: 2rem; }
            .security-badges { grid-template-columns: 1fr; }
            .orb-1, .orb-2 { display: none; } /* Save space/battery on mobile */
            .result-grid, .dashboard-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
            .upload-area { padding: 2rem 1rem; }
            .upload-icon { font-size: 3rem; }
            .file-details { flex-direction: column; text-align: center; }
        }
`,
    'real.html': `
        /* Responsive Overrides Mobile/Tablet */
        @media (max-width: 1024px) {
            .main-content { grid-template-columns: 1fr; }
            .how-to-sidebar { padding: 0; }
            .main-layout { grid-template-columns: 1fr; }
            .controls-panel { width: 100%; }
        }
        @media (max-width: 768px) {
            nav { flex-direction: column; padding: 1rem; gap: 1rem; }
            .nav-right { width: 100%; justify-content: center; gap: 1rem; flex-wrap: wrap; }
            .nav-links { gap: 1rem; flex-wrap: wrap; justify-content: center; }
            .container { padding: 1.5rem 1rem; }
            .header h1 { font-size: 2rem; }
            .visual-area { height: 300px; }
            .central-orb { width: 150px; height: 150px; }
            .settings-grid { grid-template-columns: 1fr; }
            .dashboard-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
            .visual-area { height: 250px; }
            .central-orb { width: 120px; height: 120px; }
            .btn-start, .btn-stop { padding: 0.8rem; font-size: 0.9rem; }
        }
`
};

filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Find the last occurrence of </style>
        const styleTagIndex = content.lastIndexOf('</style>');
        if (styleTagIndex !== -1) {
            const newContent = content.slice(0, styleTagIndex) + cssAppends[file] + content.slice(styleTagIndex);
            fs.writeFileSync(filePath, newContent);
            console.log('Successfully updated ' + file);
        } else {
            console.log('Could not find </style> in ' + file);
        }
    } else {
        console.log('File not found: ' + file);
    }
});

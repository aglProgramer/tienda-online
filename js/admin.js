document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    renderAdminInfo();
    setupLogout();
});

function checkAdminAccess() {
    const user = JSON.parse(localStorage.getItem('nexus-user'));

    // For demonstration, let's assume any user with "admin" in their name or a specific role is admin
    // In a real app, this would be a server-side check
    if (!user || user.role !== 'admin' && !user.nombres.toLowerCase().includes('admin') && !user.nombres.toLowerCase().includes('carlos')) {
        console.warn("Acceso denegado: Nodo no autorizado.");
        window.location.href = 'index.html';
    }
}

function renderAdminInfo() {
    const user = JSON.parse(localStorage.getItem('nexus-user'));
    const adminName = document.getElementById('admin-name');
    if (adminName && user) {
        adminName.innerText = user.nombres;
    }

    // Simulate some dynamic data
    const revenue = document.getElementById('stat-revenue');
    if (revenue) {
        const base = 152430;
        const randomHex = Math.floor(Math.random() * 500).toString(16).toUpperCase();
        revenue.innerText = `$${base.toLocaleString()}.${randomHex}`;
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('nexus-user');
            window.location.href = 'index.html';
        });
    }
}

import { api } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Check session security
    const user = JSON.parse(localStorage.getItem('nexus-user'));
    if (!user || (!user.role === 'admin' && !user.nombres.toLowerCase().includes('admin') && !user.nombres.toLowerCase().includes('carlos'))) {
        window.location.href = 'index.html';
        return;
    }

    const statRevenue = document.getElementById('stat-revenue');
    const statTotalOrders = document.getElementById('stat-total-orders');
    const topProductsTbody = document.getElementById('top-products-tbody');
    const categoryStats = document.getElementById('category-stats');

    try {
        const products = await api.getProducts();

        // Simulating data since we don't have a full 'orders' table accessible via api.js yet
        // In a real scenario, we would call api.getOrders()
        const totalProducts = products.length;
        const totalRevenue = products.reduce((acc, p) => acc + (p.precio * (Math.floor(Math.random() * 20) + 5)), 0);
        const totalOrders = Math.floor(totalProducts * 3.5);

        const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

        // Update Stats
        statRevenue.innerText = currencyFormatter.format(totalRevenue);
        statTotalOrders.innerText = totalOrders;

        // Render Top Products (Simulated top 3)
        const sortedProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, 3);
        topProductsTbody.innerHTML = sortedProducts.map(product => `
            <tr class="group hover:bg-white/5 transition-all">
                <td class="py-5">
                    <div class="flex items-center gap-4">
                        <div class="size-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <span class="material-symbols-outlined text-primary">laptop_mac</span>
                        </div>
                        <span class="text-xs font-bold text-white uppercase">${product.nombre}</span>
                    </div>
                </td>
                <td class="py-5 text-[10px] font-mono">${Math.floor(Math.random() * 100) + 50}</td>
                <td class="py-5 text-[10px] font-black font-mono text-emerald-400">${currencyFormatter.format(product.precio * 20)}</td>
                <td class="py-5 text-right">
                    <span class="text-[9px] font-black px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 uppercase tracking-widest border border-emerald-500/20">TRENDING</span>
                </td>
            </tr>
        `).join('');

        // Render Category Stats
        const categories = [...new Set(products.map(p => p.categoria || 'GENERAL'))];
        categoryStats.innerHTML = categories.map((cat, i) => {
            const percentage = i === 0 ? 45 : i === 1 ? 30 : 25;
            const color = i === 0 ? 'amber' : i === 1 ? 'cyan' : 'primary';
            return `
                <div>
                    <div class="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                        <span class="text-slate-400">${cat}</span>
                        <span class="text-${color}-400">${percentage}%</span>
                    </div>
                    <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-${color}-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]" style="width: ${percentage}%;"></div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error("Error generating reports:", error);
    }
});

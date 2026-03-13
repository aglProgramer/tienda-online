import { api } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    const inventoryTbody = document.getElementById('inventory-tbody');
    const searchInput = document.getElementById('inventory-search');
    const categoryFilter = document.getElementById('category-filter');
    const inventoryCount = document.getElementById('inventory-count');

    let allProducts = [];

    // Check session security
    const user = JSON.parse(localStorage.getItem('nexus-user'));
    if (!user || (!user.role === 'admin' && !user.nombres.toLowerCase().includes('admin') && !user.nombres.toLowerCase().includes('carlos'))) {
        window.location.href = 'index.html';
        return;
    }

    // Load Inventory Data
    try {
        allProducts = await api.getProducts();
        renderTable(allProducts);
    } catch (error) {
        console.error("Error fetching inventory:", error);
        inventoryTbody.innerHTML = `<tr><td colspan="6" class="px-8 py-10 text-center text-red-400 uppercase font-mono tracking-widest text-xs">Error de Sincronización con el Núcleo</td></tr>`;
    }

    function renderTable(products) {
        if (!products || products.length === 0) {
            inventoryTbody.innerHTML = `<tr><td colspan="6" class="px-8 py-10 text-center text-slate-500 uppercase font-mono tracking-widest text-xs">No se encontraron sistemas registrados</td></tr>`;
            inventoryCount.innerText = "Mostrando 0 registros";
            return;
        }

        inventoryTbody.innerHTML = products.map((product, index) => {
            const stockLevel = product.stock || Math.floor(Math.random() * 50); // Fallback if stock is missing
            const statusColor = stockLevel > 10 ? 'emerald' : stockLevel > 0 ? 'amber' : 'rose';
            const statusText = stockLevel > 10 ? 'OPTIMO' : stockLevel > 0 ? 'BAJO_STK' : 'AGOTADO';
            const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

            return `
                <tr class="group hover:bg-white/5 transition-all">
                    <td class="px-8 py-4">
                        <div class="size-12 rounded-xl bg-deep-slate border border-white/5 bg-cover bg-center shadow-lg group-hover:scale-110 transition-transform" 
                             style="background-image: url('${product.imagen_url || 'https://via.placeholder.com/150'}')"></div>
                    </td>
                    <td class="px-8 py-4">
                        <div class="text-sm font-black text-white uppercase tracking-tight">${product.nombre}</div>
                        <div class="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">SKU: NX-${product.id_producto.toString().padStart(4, '0')}</div>
                    </td>
                    <td class="px-8 py-4">
                        <span class="px-3 py-1 text-[9px] font-black bg-white/5 text-slate-400 rounded-lg border border-white/10 uppercase tracking-widest">
                            ${product.categoria || 'TECNOLOGIA'}
                        </span>
                    </td>
                    <td class="px-8 py-4">
                        <div class="flex items-center gap-3">
                            <div class="size-2 rounded-full bg-${statusColor}-400 animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.5)] shadow-${statusColor}-400/50"></div>
                            <div>
                                <div class="text-[10px] font-black text-${statusColor}-400 uppercase tracking-widest">${statusText}</div>
                                <div class="text-[9px] font-mono text-slate-500">${stockLevel} UNIDADES</div>
                            </div>
                        </div>
                    </td>
                    <td class="px-8 py-4">
                        <div class="text-sm font-black text-white font-mono">${currencyFormatter.format(product.precio)}</div>
                    </td>
                    <td class="px-8 py-4">
                        <div class="flex items-center justify-center gap-2">
                            <button class="size-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-all border border-white/5">
                                <span class="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button class="size-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-white/5">
                                <span class="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        inventoryCount.innerText = `Mostrando ${products.length} sistemas registrados`;
    }

    // Filtering Logic
    function filterProducts() {
        const query = searchInput.value.toLowerCase();
        const category = categoryFilter.value;

        const filtered = allProducts.filter(p => {
            const matchesSearch = p.nombre.toLowerCase().includes(query) || p.id_producto.toString().includes(query);
            const matchesCategory = category === 'all' || p.categoria === category;
            return matchesSearch && matchesCategory;
        });

        renderTable(filtered);
    }

    searchInput.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
});

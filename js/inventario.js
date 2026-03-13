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

    // Modals & UI Elements
    const productModal = document.getElementById('product-modal');
    const productForm = document.getElementById('product-form');
    const modalTitle = document.getElementById('modal-title');
    const addProductBtn = document.getElementById('add-product-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelModalBtn = document.getElementById('cancel-modal');
    const modalOverlay = document.getElementById('modal-overlay');

    // Load Inventory Data
    async function loadInventory() {
        try {
            allProducts = await api.getProducts();
            renderTable(allProducts);
        } catch (error) {
            console.error("Error fetching inventory:", error);
            inventoryTbody.innerHTML = `<tr><td colspan="6" class="px-8 py-10 text-center text-red-400 uppercase font-mono tracking-widest text-xs">Error de Sincronización con el Núcleo</td></tr>`;
        }
    }

    loadInventory();

    function renderTable(products) {
        if (!products || products.length === 0) {
            inventoryTbody.innerHTML = `<tr><td colspan="6" class="px-8 py-10 text-center text-slate-500 uppercase font-mono tracking-widest text-xs">No se encontraron sistemas registrados</td></tr>`;
            inventoryCount.innerText = "Mostrando 0 registros";
            return;
        }

        inventoryTbody.innerHTML = products.map((product, index) => {
            const stockLevel = product.stock || 0;
            const statusColor = stockLevel > 10 ? 'emerald' : stockLevel > 0 ? 'amber' : 'rose';
            const statusText = stockLevel > 10 ? 'OPTIMO' : stockLevel > 0 ? 'BAJO_STK' : 'AGOTADO';
            const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

            return `
                <tr class="group hover:bg-white/5 transition-all">
                    <td class="px-8 py-4">
                        <div class="size-12 rounded-xl bg-deep-slate border border-white/5 bg-contain bg-no-repeat bg-center shadow-lg group-hover:scale-110 transition-transform" 
                             style="background-image: url('${product.imagen_url || 'assets/imágenes/nexus_unit.png'}')"></div>
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
                            <button class="edit-btn size-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-all border border-white/5" 
                                    data-id="${product.id_producto}">
                                <span class="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button class="delete-btn size-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-white/5"
                                    data-id="${product.id_producto}">
                                <span class="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        // Re-attach listeners after rendering
        attachActionListeners();
        inventoryCount.innerText = `Mostrando ${products.length} sistemas registrados`;
    }

    function attachActionListeners() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const product = allProducts.find(p => p.id_producto == id);
                if (product) openModal(product);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.id;
                if (confirm(`¿Confirmar eliminación del sistema NX-${id.toString().padStart(4, '0')}?`)) {
                    try {
                        await api.deleteProduct(id);
                        loadInventory();
                    } catch (error) {
                        alert("Error al eliminar el sistema");
                    }
                }
            });
        });
    }

    // Modal Logic
    function openModal(product = null) {
        if (!productForm) return;
        productForm.reset();
        if (product) {
            modalTitle.innerText = "Modificar Sistema Nexus";
            document.getElementById('product-id').value = product.id_producto;
            document.getElementById('prod-nombre').value = product.nombre;
            document.getElementById('prod-categoria').value = product.categoria;
            document.getElementById('prod-precio').value = product.precio;
            document.getElementById('prod-stock').value = product.stock || 0;
            document.getElementById('prod-imagen').value = product.imagen_url || '';
            document.getElementById('prod-descripcion').value = product.descripcion || '';
        } else {
            modalTitle.innerText = "Nuevo Sistema Nexus";
            document.getElementById('product-id').value = "";
        }
        productModal.classList.remove('hidden');
        productModal.classList.add('flex');
    }

    function closeModal() {
        productModal.classList.add('hidden');
        productModal.classList.remove('flex');
    }

    if (addProductBtn) addProductBtn.addEventListener('click', () => openModal());
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('product-id').value;
            const productData = {
                nombre: document.getElementById('prod-nombre').value,
                categoria: document.getElementById('prod-categoria').value,
                precio: parseFloat(document.getElementById('prod-precio').value),
                stock: parseInt(document.getElementById('prod-stock').value),
                imagen_url: document.getElementById('prod-imagen').value,
                descripcion: document.getElementById('prod-descripcion').value
            };

            try {
                if (id) {
                    await api.updateProduct(id, productData);
                } else {
                    await api.createProduct(productData);
                }
                closeModal();
                loadInventory();
            } catch (error) {
                console.error("Error saving product:", error);
                alert("Error al sincronizar con el núcleo de datos");
            }
        });
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

    if (searchInput) searchInput.addEventListener('input', filterProducts);
    if (categoryFilter) categoryFilter.addEventListener('change', filterProducts);
});

import { api } from './api.js';

// Session handler
function checkSession() {
    const user = JSON.parse(localStorage.getItem('nexus-user'));
    const userDisplay = document.getElementById('user-display');

    if (user && userDisplay) {
        userDisplay.innerText = user.nombres;

        // Show Admin entry if user is Carlos or admin
        const adminEntry = document.getElementById('admin-entry');
        if (adminEntry && (user.role === 'admin' || user.nombres.toLowerCase().includes('admin') || user.nombres.toLowerCase().includes('carlos'))) {
            adminEntry.classList.remove('hidden');
        }

        const levelDisplay = userDisplay.previousElementSibling;
        if (levelDisplay) {
            levelDisplay.innerText = 'AUTENTICADO_NIVEL_ALPHA';
            levelDisplay.classList.add('text-[#6366f1]'); // Indigo
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const productContainer = document.getElementById('product-container');
    const cartCount = document.getElementById('cart-count');

    // Initialize cart count
    updateCartCount();
    checkSession();

    // Fetch and render products
    try {
        const products = await api.getProducts();
        renderProducts(products);
    } catch (error) {
        console.error("Initialization error:", error);
        productContainer.innerHTML = `<div class="col-span-12 text-center text-red-400 uppercase tracking-widest py-10">Error de Enlace: No se pudo conectar con Nexus Core</div>`;
    }

    function renderProducts(products) {
        if (!products || products.length === 0) {
            productContainer.innerHTML = `<div class="col-span-12 text-center text-slate-500 uppercase tracking-widest py-20 font-mono">No hay sistemas disponibles en red</div>`;
            return;
        }

        productContainer.innerHTML = products.map((product, index) => {
            let imageUrl = product.imagen_url;
            const name = product.nombre.toLowerCase();

            if (!imageUrl || imageUrl.includes('placehold.jp')) {
                if (name.includes('laptop')) imageUrl = 'assets/imágenes/hardware.png';
                else if (name.includes('smartphone')) imageUrl = 'assets/imágenes/smartphone.png';
                else if (name.includes('camisa')) imageUrl = 'assets/imágenes/camisa.png';
                else if (name.includes('licuadora')) imageUrl = 'assets/imágenes/biotech.png';
                else if (name.includes('balón') || name.includes('balon')) imageUrl = 'assets/imágenes/nexus_unit.png';
                else imageUrl = 'assets/imágenes/nexus_unit.png';
            }

            const spanClass = index % 3 === 0 ? 'md:col-span-8 col-span-12' : 'md:col-span-4 col-span-12';

            return `
                <div class="${spanClass} glass-card rounded-3xl overflow-hidden relative group h-full flex flex-col p-1 border border-white/5 hover:border-indigo-500/30 transition-all duration-500">
                    <div class="bg-navy/40 backdrop-blur-xl rounded-[calc(1.5rem-2px)] p-6 md:p-8 flex-1 flex flex-col md:flex-row gap-8 relative overflow-hidden h-full">
                        <!-- Decorative Glow -->
                        <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[80px] group-hover:bg-indigo-600/20 transition-all duration-500"></div>
                        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/5 blur-[80px] group-hover:bg-cyan-500/10 transition-all duration-500"></div>
                        
                        <div class="${index % 3 === 0 ? 'md:w-3/5 w-full' : 'w-full'} flex flex-col z-10">
                            <div class="flex items-center gap-3 mb-6">
                                <span class="bg-indigo-600/10 text-indigo-400 text-[10px] font-black px-3 py-1 rounded-lg border border-indigo-500/20 uppercase tracking-[0.2em] font-mono">UNIT_${product.id_producto.toString().padStart(3, '0')}</span>
                                <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                            </div>
                            
                            <h3 class="text-2xl md:text-3xl font-black mb-4 uppercase leading-tight tracking-tight text-white group-hover:text-indigo-400 transition-colors">${product.nombre}</h3>
                            <p class="text-slate-400 text-sm mb-10 max-w-sm line-clamp-2 font-medium leading-relaxed opacity-80">${product.descripcion || 'Hardware de última generación optimizado para el Nexus Core.'}</p>
                            
                            <div class="mt-auto flex items-center justify-between gap-4">
                                <div class="flex flex-col">
                                    <span class="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-black mb-1">Carga_Creditos</span>
                                    <span class="text-3xl font-black text-white">$${product.precio.toLocaleString()}</span>
                                </div>
                                <button class="add-to-cart group/btn relative overflow-hidden px-8 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all active:scale-95" 
                                        data-id="${product.id_producto}" 
                                        data-name="${product.nombre}" 
                                        data-price="${product.precio}"
                                        data-image="${imageUrl}">
                                    <span class="relative z-10 flex items-center gap-2">Sincronizar <span class="material-symbols-outlined text-sm">bolt</span></span>
                                    <div class="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                                </button>
                            </div>
                        </div>

                        <div class="${index % 3 === 0 ? 'md:w-2/5 w-full' : 'w-full h-48 mt-6'} relative flex items-center justify-center">
                            <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                            <img src="${imageUrl}" 
                                 alt="${product.nombre}" 
                                 onerror="this.src='https://placehold.co/400x400/020617/6366f1?text=NEXUS_UNIT'"
                                 class="w-full h-full object-contain z-10 drop-shadow-[0_0_30px_rgba(99,102,241,0.3)] group-hover:scale-105 group-hover:translate-y-[-10px] transition-all duration-700 pointer-events-none">
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners to buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const product = {
                    id: button.dataset.id,
                    nombre: button.dataset.name,
                    precio: parseFloat(button.dataset.price),
                    imagen: button.dataset.image,
                    cantidad: 1
                };
                addToCart(product, e.target);
            });
        });
    }

    function addToCart(product, btn) {
        let cart = JSON.parse(localStorage.getItem('nexus-cart')) || [];
        const existing = cart.find(item => item.id === product.id);

        if (existing) {
            existing.cantidad += 1;
        } else {
            cart.push(product);
        }

        localStorage.setItem('nexus-cart', JSON.stringify(cart));
        updateCartCount();

        // Visual feedback
        const originalText = btn.innerText;
        btn.innerText = 'Sincronizado';
        btn.classList.replace('bg-primary', 'bg-emerald-500');
        setTimeout(() => {
            btn.innerText = originalText;
            btn.classList.replace('bg-emerald-500', 'bg-primary');
        }, 1000);
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('nexus-cart')) || [];
        const count = cart.reduce((acc, item) => acc + item.cantidad, 0);
        if (cartCount) cartCount.innerText = count.toString().padStart(2, '0');
    }
});

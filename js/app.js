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
            levelDisplay.classList.add('text-primary');
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
        productContainer.innerHTML = `<div class="col-span-12 text-center text-red-400 uppercase tracking-widest">Error al cargar la base de datos</div>`;
    }

    function renderProducts(products) {
        if (!products || products.length === 0) {
            productContainer.innerHTML = `<div class="col-span-12 text-center text-slate-500 uppercase tracking-widest py-20 font-mono">No hay sistemas disponibles en red</div>`;
            return;
        }

        productContainer.innerHTML = products.map((product, index) => {
            // Determine image based on product name or type
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
                <div class="${spanClass} glass-card rounded-3xl overflow-hidden relative group h-full flex flex-col p-1">
                    <div class="bg-navy/40 backdrop-blur-xl rounded-[calc(1.5rem-2px)] p-6 md:p-8 flex-1 flex flex-col md:flex-row gap-8 relative overflow-hidden">
                        <!-- Decorative Glow -->
                        <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 blur-[80px] group-hover:bg-primary/20 transition-all duration-500"></div>
                        
                        <div class="${index % 3 === 0 ? 'md:w-3/5 w-full' : 'w-full'} flex flex-col z-10">
                            <div class="flex items-center gap-3 mb-6">
                                <span class="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-lg border border-primary/20 uppercase tracking-[0.2em]">NEXUS_UNIT_${product.id_producto}</span>
                                <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                            </div>
                            
                            <h3 class="text-2xl md:text-4xl font-display font-bold mb-4 uppercase leading-tight tracking-tight text-white group-hover:text-primary transition-colors">${product.nombre}</h3>
                            <p class="text-slate-400 text-sm mb-10 max-w-sm line-clamp-2 font-light leading-relaxed">${product.descripcion || 'Hardware de última generación optimizado para el Nexus Core.'}</p>
                            
                            <div class="mt-auto flex items-center justify-between gap-4">
                                <div class="flex flex-col">
                                    <span class="text-[9px] uppercase tracking-widest text-slate-500 font-bold mb-1">Costo_Sincronización</span>
                                    <span class="text-3xl font-black text-white">$${product.precio}</span>
                                </div>
                                <button class="add-to-cart group/btn relative overflow-hidden px-8 py-4 bg-primary text-navy text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all active:scale-95" 
                                        data-id="${product.id_producto}" 
                                        data-name="${product.nombre}" 
                                        data-price="${product.precio}"
                                        data-image="${imageUrl}">
                                    <span class="relative z-10">Adquirir</span>
                                    <div class="absolute inset-0 bg-white translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                                </button>
                            </div>
                        </div>

                        <div class="${index % 3 === 0 ? 'md:w-2/5 w-full' : 'w-full h-48 mt-6'} relative flex items-center justify-center">
                            <div class="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
                            <img src="${imageUrl}" 
                                 alt="${product.nombre}" 
                                 onerror="this.src='https://placehold.jp/38bdf8/020617/400x400.png?text=DATA_MISSING'"
                                 class="w-full h-full object-contain z-10 drop-shadow-[0_0_20px_rgba(56,189,248,0.2)] group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 pointer-events-none">
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

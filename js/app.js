import { api } from './api-v2.js';

// Session handler
function checkSession() {
    const user = JSON.parse(localStorage.getItem('nexus-user'));
    const userDisplay = document.getElementById('user-display');

    if (user && userDisplay) {
        userDisplay.innerText = user.nombres;
        // Optionally change icon or level
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
            // Determine grid span for asymmetry
            const spanClass = index % 3 === 0 ? 'md:col-span-8 col-span-12' : 'md:col-span-4 col-span-12';
            const imageUrl = product.imagen_url || 'https://placehold.jp/38bdf8/020617/400x400.png?text=NEXUS_UNIT';

            return `
                <div class="${spanClass} glass-card rounded-3xl overflow-hidden relative p-8 group h-full flex flex-col">
                    <div class="flex-1 flex flex-col md:flex-row gap-6">
                        <div class="${index % 3 === 0 ? 'md:w-3/5 w-full' : 'w-full'} flex flex-col justify-center">
                            <span class="bg-primary/20 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest w-fit mb-6">NEXUS_MOD_${product.id_tipo_producto || 'GEN'}</span>
                            <h3 class="text-3xl font-display font-bold mb-4 uppercase leading-tight">${product.nombre}</h3>
                            <p class="text-slate-400 text-sm mb-8 max-w-sm line-clamp-2">${product.descripcion || 'Hardware de última generación optimizado para el Nexus Core.'}</p>
                            <div class="mt-auto flex items-center justify-between">
                                <span class="text-3xl font-black text-white">$${product.precio}</span>
                                <button class="add-to-cart px-6 py-3 bg-primary text-navy text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-all" 
                                        data-id="${product.id_producto}" 
                                        data-name="${product.nombre}" 
                                        data-price="${product.precio}"
                                        data-image="${imageUrl}">
                                    Adquirir
                                </button>
                            </div>
                        </div>
                        ${index % 3 === 0 ? `
                        <div class="md:w-2/5 w-full relative flex items-center justify-center min-h-[200px]">
                            <img src="${imageUrl}" 
                                 alt="${product.nombre}" 
                                 onerror="this.src='https://placehold.jp/38bdf8/020617/400x400.png?text=IMAGE_NOT_FOUND'"
                                 class="w-full h-auto max-h-[250px] object-contain z-10 group-hover:scale-105 transition-transform">
                            <div class="absolute inset-0 bg-primary/10 blur-[60px] rounded-full"></div>
                        </div>` : `
                        <div class="w-full h-32 relative mt-4">
                            <img src="${imageUrl}" 
                                 alt="${product.nombre}"
                                 onerror="this.src='https://placehold.jp/38bdf8/020617/400x400.png?text=IMAGE_NOT_FOUND'"
                                 class="w-full h-full object-contain">
                        </div>
                        `}
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

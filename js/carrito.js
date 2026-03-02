import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const taxEl = document.getElementById('cart-tax');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Status Modal Elements
    const statusOverlay = document.getElementById('checkout-status');
    const statusIcon = document.getElementById('status-icon');
    const statusTitle = document.getElementById('status-title');
    const statusMsg = document.getElementById('status-msg');
    const statusClose = document.getElementById('status-close');

    // Pre-fill user data if logged in
    const user = JSON.parse(localStorage.getItem('nexus-user'));
    if (user) {
        document.getElementById('client-name').value = user.nombres || '';
        document.getElementById('client-email').value = user.email || '';
    }

    renderCart();

    function renderCart() {
        const cart = JSON.parse(localStorage.getItem('nexus-cart')) || [];

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="glass p-12 rounded-3xl text-center">
                    <span class="material-symbols-outlined text-6xl text-slate-700 mb-6 font-mono">database_off</span>
                    <p class="text-slate-500 uppercase tracking-[0.3em] font-mono">CONEXIÓN PERDIDA: Carrito Vacío</p>
                    <a href="index.html" class="inline-block mt-8 px-6 py-3 border border-primary text-primary text-xs font-bold uppercase rounded-xl hover:bg-primary hover:text-navy transition-all font-mono">Volver al Catálogo</a>
                </div>
            `;
            updateTotals(0);
            return;
        }

        let subtotal = 0;
        cartItemsContainer.innerHTML = cart.map(item => {
            const itemTotal = item.precio * item.cantidad;
            subtotal += itemTotal;
            return `
                <div class="glass group relative overflow-hidden rounded-3xl p-6 transition-all duration-500 hover:translate-x-1 border border-white/5">
                    <div class="flex flex-col sm:flex-row items-center gap-6">
                        <div class="relative size-24 shrink-0">
                            <img src="${item.imagen}" alt="${item.nombre}" class="relative z-10 w-full h-full object-contain rounded-2xl">
                            <div class="absolute inset-0 bg-primary/10 blur-xl"></div>
                        </div>
                        <div class="flex-1 w-full">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <p class="text-[9px] font-bold text-primary uppercase tracking-widest mb-1 font-mono">PROTOCOLO_UNIT: ${item.id}</p>
                                    <h3 class="text-xl font-bold text-white uppercase">${item.nombre}</h3>
                                </div>
                                <p class="text-xl font-black text-white">$${itemTotal.toFixed(2)}</p>
                            </div>
                            <div class="flex flex-wrap items-center gap-6 mt-4">
                                <div class="flex items-center bg-white/5 rounded-xl p-1 border border-white/10">
                                    <button class="qty-btn size-8 flex items-center justify-center hover:text-primary transition-colors" data-id="${item.id}" data-action="dec">
                                        <span class="material-symbols-outlined text-sm">remove</span>
                                    </button>
                                    <span class="px-3 text-xs font-bold w-12 text-center font-mono">${item.cantidad.toString().padStart(2, '0')}</span>
                                    <button class="qty-btn size-8 flex items-center justify-center hover:text-primary transition-colors" data-id="${item.id}" data-action="inc">
                                        <span class="material-symbols-outlined text-sm">add</span>
                                    </button>
                                </div>
                                <button class="remove-btn flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest font-mono" data-id="${item.id}">
                                    <span class="material-symbols-outlined text-base">delete</span> ELIMINAR_NODO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        updateTotals(subtotal);
        addListeners();
    }

    function updateTotals(subtotal) {
        const tax = subtotal * 0.15;
        const total = subtotal + tax;

        subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
        taxEl.innerText = `$${tax.toFixed(2)}`;
        totalEl.innerText = `$${total.toFixed(2)}`;
    }

    function addListeners() {
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const action = btn.dataset.action;
                let cart = JSON.parse(localStorage.getItem('nexus-cart'));
                const item = cart.find(i => i.id === id);

                if (action === 'inc') item.cantidad++;
                else if (action === 'dec' && item.cantidad > 1) item.cantidad--;

                localStorage.setItem('nexus-cart', JSON.stringify(cart));
                renderCart();
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                let cart = JSON.parse(localStorage.getItem('nexus-cart'));
                cart = cart.filter(i => i.id !== id);
                localStorage.setItem('nexus-cart', JSON.stringify(cart));
                renderCart();
            });
        });
    }

    checkoutBtn.addEventListener('click', async () => {
        const name = document.getElementById('client-name').value;
        const lastName = document.getElementById('client-last').value;
        const email = document.getElementById('client-email').value;
        const phone = document.getElementById('client-phone').value;
        const address = document.getElementById('client-address').value;
        const cart = JSON.parse(localStorage.getItem('nexus-cart')) || [];

        if (!name || !lastName || !email || !phone || !address) {
            alert("Sincronización fallida: Por favor ingresa los datos del operador.");
            return;
        }

        if (cart.length === 0) {
            alert("Error: El búfer del carrito está vacío.");
            return;
        }

        // Processing...
        statusOverlay.classList.remove('hidden');
        statusIcon.innerHTML = `<span class="material-symbols-outlined text-primary text-4xl animate-spin">sync</span>`;
        statusTitle.innerText = "Procesando Protocolo";
        statusMsg.innerText = "Sincronizando con los nodos de la red Nexus...";

        try {
            // 1. Create client
            const client = await api.createClient({
                nombres: name,
                apellidos: lastName,
                email: email,
                telefono: phone,
                direccion: address,
                documento: 'PENDING' // Should ideally comes from login session or input
            });

            // 2. Create sale
            const total = cart.reduce((acc, item) => acc + (item.precio * item.cantidad), 0) * 1.15;
            const sale = await api.createSale({
                id_cliente: client.id_cliente,
                total: parseFloat(total.toFixed(2)),
                fecha: new Date().toISOString()
            });

            // 3. Create details
            const details = cart.map(item => ({
                id_venta: sale.id_venta,
                id_producto: item.id,
                cantidad: item.cantidad,
                precio_unitario: item.precio
            }));
            await api.createSaleDetail(details);

            // Success!
            statusIcon.innerHTML = `<span class="material-symbols-outlined text-emerald-400 text-5xl">verified</span>`;
            statusTitle.innerText = "Transacción Autorizada";
            statusMsg.innerText = "Sincronización completada. El hardware ha sido reservado.";
            localStorage.removeItem('nexus-cart');

        } catch (error) {
            statusIcon.innerHTML = `<span class="material-symbols-outlined text-red-500 text-5xl">warning</span>`;
            statusTitle.innerText = "Error de Sistema";
            statusMsg.innerText = "Fallo crítico en los protocolos de conexión con Supabase.";
            console.error(error);
        } finally {
            statusClose.classList.remove('hidden');
        }
    });

    statusClose.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
});

statusClose.addEventListener('click', () => {
    window.location.href = 'index.html';
});

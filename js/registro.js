import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    const statusDiv = document.getElementById('reg-status');
    const statusText = document.getElementById('reg-status-text');
    const submitBtn = document.getElementById('reg-submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userData = {
            nombre: document.getElementById('reg-name').value,
            apellidos: document.getElementById('reg-lastname').value,
            email: document.getElementById('reg-email').value,
            telefono: document.getElementById('reg-phone').value,
            direccion: document.getElementById('reg-address').value
        };

        // UI state: Processing
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'PROCESANDO... <span class="material-symbols-outlined animate-spin text-xl">sync</span>';
        statusDiv.classList.remove('hidden');
        statusText.innerText = 'Sincronizando con Nexus Core...';
        statusText.classList.remove('text-red-500');
        statusText.classList.add('text-[#00f2ff]');

        try {
            await api.createClient(userData);

            // Success
            statusText.innerText = 'IDENTIDAD REGISTRADA EXITOSAMENTE';
            statusText.classList.remove('text-[#00f2ff]');
            statusText.classList.add('text-green-500');
            submitBtn.innerHTML = 'REGISTRADO <span class="material-symbols-outlined text-xl">check_circle</span>';

            // Optional: Redirect after success
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            statusText.innerText = 'ERROR EN PROTOCOLO: NO SE PUDO REGISTRAR';
            statusText.classList.remove('text-[#00f2ff]');
            statusText.classList.add('text-red-500');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'REINTENTAR REGISTRO <span class="material-symbols-outlined text-xl">refresh</span>';
        }
    });
});

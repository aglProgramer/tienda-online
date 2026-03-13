import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registration-form');
    const statusDiv = document.getElementById('reg-status');
    const statusText = document.getElementById('reg-status-text');
    const submitBtn = document.getElementById('reg-submit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const userData = {
            nombres: document.getElementById('reg-name').value.trim(),
            apellidos: document.getElementById('reg-lastname').value.trim(),
            email: document.getElementById('reg-email').value.trim(),
            documento: document.getElementById('reg-document').value.trim(),
            telefono: document.getElementById('reg-phone').value.trim(),
            direccion: document.getElementById('reg-address').value.trim()
        };

        // Basic validation
        if (!userData.email.includes('@')) {
            statusDiv.classList.remove('hidden');
            statusText.innerText = 'ERROR: EMAIL INVÁLIDO';
            statusText.classList.add('text-rose-500');
            return;
        }

        if (userData.telefono.length < 7) {
            statusDiv.classList.remove('hidden');
            statusText.innerText = 'ERROR: TELÉFONO DEMASIADO CORTO';
            statusText.classList.add('text-rose-500');
            return;
        }

        // UI state: Processing
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'PROCESANDO... <span class="material-symbols-outlined animate-spin text-xl">sync</span>';
        statusDiv.classList.remove('hidden');
        statusText.innerText = 'Sincronizando con Nexus Core...';
        statusText.classList.remove('text-rose-500');
        statusText.classList.add('text-indigo-400');

        try {
            await api.createClient(userData);

            // Success
            statusText.innerText = 'IDENTIDAD REGISTRADA EXITOSAMENTE';
            statusText.classList.remove('text-indigo-400');
            statusText.classList.add('text-emerald-400');
            submitBtn.innerHTML = 'REGISTRADO <span class="material-symbols-outlined text-xl">check_circle</span>';

            // Optional: Redirect after success
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            statusText.innerText = 'ERROR EN PROTOCOLO: NO SE PUDO REGISTRAR';
            statusText.classList.remove('text-indigo-400');
            statusText.classList.add('text-rose-500');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'REINTENTAR REGISTRO <span class="material-symbols-outlined text-xl">refresh</span>';
        }
    });
});

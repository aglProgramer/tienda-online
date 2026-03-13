import { api } from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginStatus = document.getElementById('login-status');
    const loginBtn = document.getElementById('login-btn');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('login-email').value;
        const documentId = document.getElementById('login-document').value;

        // UI state
        loginBtn.disabled = true;
        loginBtn.innerText = 'VERIFYING IDENT...';
        loginStatus.classList.remove('hidden', 'text-red-500', 'text-indigo-400');
        loginStatus.classList.add('text-indigo-400');
        loginStatus.innerText = 'CONNECTING TO NEXUS...';

        try {
            const client = await api.checkClient(email, documentId);

            if (client) {
                // Success
                loginStatus.innerText = 'ACCESS GRANTED';
                loginStatus.classList.replace('text-indigo-400', 'text-emerald-400');

                // Save session
                localStorage.setItem('nexus-user', JSON.stringify({
                    id: client.id_cliente,
                    nombres: client.nombres,
                    email: client.email
                }));

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                // Fail
                throw new Error('IDENTIDAD NO RECONOCIDA');
            }

        } catch (error) {
            console.error('Login error:', error);
            loginStatus.innerText = error.message || 'ERROR EN PROTOCOLO';
            loginStatus.classList.add('text-rose-500');
            loginBtn.disabled = false;
            loginBtn.innerText = 'REINITIALIZE SESSION';
        }
    });
});

const SUPABASE_URL = "https://zkqqgvvohlckdzflqntv.supabase.co/rest/v1";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcXFndnZvaGxja2R6ZmxxbnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDAwODgsImV4cCI6MjA4Nzc3NjA4OH0.Dr3lz5lfQzcvbZJXr6H1jlZ_8kWXIYpcVfevubvgSgA";

const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`
};

export const api = {
    async getProducts() {
        console.log("Accediendo a tabla: producto...");
        try {
            const response = await fetch(`${SUPABASE_URL}/producto?select=*`, {
                method: "GET",
                headers: headers
            });
            if (!response.ok) throw new Error("Error fetching products");
            return await response.json();
        } catch (error) {
            console.error("Error al obtener productos:", error);
            return [];
        }
    },

    async createClient(clientData) {
        console.log("Creating in table: cliente");
        try {
            const response = await fetch(`${SUPABASE_URL}/cliente`, {
                method: "POST",
                headers: {
                    ...headers,
                    "Prefer": "return=representation"
                },
                body: JSON.stringify({
                    nombres: clientData.nombres,
                    apellidos: clientData.apellidos,
                    email: clientData.email,
                    documento: clientData.documento,
                    telefono: clientData.telefono,
                    direccion: clientData.direccion
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to create client");
            }
            const result = await response.json();
            return result[0];
        } catch (error) {
            console.error("Error creating client:", error);
            throw error;
        }
    },

    async createSale(saleData) {
        try {
            const response = await fetch(`${SUPABASE_URL}/venta`, {
                method: "POST",
                headers: {
                    ...headers,
                    "Prefer": "return=representation"
                },
                body: JSON.stringify(saleData)
            });
            if (!response.ok) throw new Error("Failed to create sale");
            const result = await response.json();
            return result[0];
        } catch (error) {
            console.error("Error creating sale:", error);
            throw error;
        }
    },

    async createSaleDetail(details) {
        try {
            const response = await fetch(`${SUPABASE_URL}/detalle_venta`, {
                method: "POST",
                headers: {
                    ...headers,
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify(details)
            });
            if (!response.ok) throw new Error("Failed to create sale detail");
            return true;
        } catch (error) {
            console.error("Error creating sale detail:", error);
            throw error;
        }
    },

    async checkClient(email, document) {
        try {
            const response = await fetch(`${SUPABASE_URL}/cliente?email=eq.${email}&documento=eq.${document}&select=*`, {
                method: "GET",
                headers: headers
            });
            if (!response.ok) throw new Error("Verification failed");
            const result = await response.json();
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error("Error verifying client:", error);
            throw error;
        }
    }
};

// Alias para evitar errores si se llama con 'e' al final
api.checkCliente = api.checkClient;

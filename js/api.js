const SUPABASE_URL = "https://zkqqgvvohlckdzflqntv.supabase.co/rest/v1";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcXFndnZvaGxja2R6ZmxxbnR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDAwODgsImV4cCI6MjA4Nzc3NjA4OH0.Dr3lz5lfQzcvbZJXr6H1jlZ_8kWXIYpcVfevubvgSgA";

const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`
};

export const api = {
    async getProducts() {
        try {
            const response = await fetch(`${SUPABASE_URL}/producto?select=*`, {
                method: "GET",
                headers: headers
            });
            if (!response.ok) throw new Error("Failed to fetch products");
            return await response.json();
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    },

    async createClient(clientData) {
        try {
            const response = await fetch(`${SUPABASE_URL}/cliente`, {
                method: "POST",
                headers: {
                    ...headers,
                    "Prefer": "return=representation"
                },
                body: JSON.stringify({
                    nombre: clientData.nombre,
                    apellidos: clientData.apellidos,
                    email: clientData.email,
                    telefono: clientData.telefono,
                    direccion: clientData.direccion
                })
            });
            if (!response.ok) throw new Error("Failed to create client");
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
    }
};

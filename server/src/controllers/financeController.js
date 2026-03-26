import { pool } from '../config/db.js';

export const getSummary = async (req, res) => {
    try {
        // 1. Sumar Ventas (Solo pedidos completados)
        const [salesRows] = await pool.query("SELECT SUM(total_amount) as total FROM orders WHERE status = 'completado'");
        const income = salesRows[0].total || 0;

        // 2. Sumar Gastos
        const [expensesRows] = await pool.query("SELECT SUM(amount) as total FROM expenses");
        const outcome = expensesRows[0].total || 0;

        // 3. Últimos 5 gastos para mostrar en lista
        const [lastExpenses] = await pool.query("SELECT * FROM expenses ORDER BY date DESC LIMIT 5");

        res.json({
            income: parseFloat(income),
            outcome: parseFloat(outcome),
            net: income - outcome,
            recentExpenses: lastExpenses
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addExpense = async (req, res) => {
    const { description, amount } = req.body;
    try {
        await pool.query('INSERT INTO expenses (description, amount) VALUES (?, ?)', [description, amount]);
        res.json({ message: 'Gasto registrado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAuditReport = async (req, res) => {
    const { startDate, endDate } = req.query;
    
    try {
        // --- 1. PREPARAR FILTROS ---
        let filterExp = "";
        let filterOrd = "";
        const paramsExp = [];
        const paramsOrd = [];

        // Si hay fechas, las agregamos a los arrays de parámetros POR SEPARADO
        if (startDate && endDate) {
            filterExp = "AND e.date BETWEEN ? AND ?";
            paramsExp.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);

            filterOrd = "AND o.created_at BETWEEN ? AND ?";
            paramsOrd.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
        }

        // --- 2. CONSULTA DE GASTOS (COMPRAS) ---
        const expensesQuery = `
            SELECT 
                e.id, e.date, e.description, e.amount, e.type, 
                COALESCE(u.name, 'Desconocido') as responsable_name,
                COALESCE(r.name, '-') as role_name
            FROM expenses e
            LEFT JOIN users u ON e.user_id = u.id
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE 1=1 ${filterExp}
            ORDER BY e.date DESC
        `;
        const [expenses] = await pool.query(expensesQuery, paramsExp);

        // --- 3. CONSULTA DE VENTAS (MUESTRA CLIENTE Y VENDEDOR) ---
        // Aquí hacemos doble JOIN a la tabla users: una para el cliente, otra para el empleado
        const salesQuery = `
    SELECT 
        o.id, 
        o.created_at, 
        o.total_amount, 
        o.status,
        -- Datos del Cliente
        u_client.name as client_name,
        u_client.email as client_email,
        -- Datos del Vendedor / Procesador
        u_emp.name as employee_name,
        r_emp.name as employee_role
    FROM orders o
    JOIN users u_client ON o.client_id = u_client.id
    -- Left join porque puede que nadie lo haya procesado aún (Pedido Web Pendiente)
    LEFT JOIN users u_emp ON o.processed_by = u_emp.id
    LEFT JOIN roles r_emp ON u_emp.role_id = r_emp.id
    WHERE 1=1 ${filterOrd} -- Quitamos el filtro de 'completado' para ver todo el historial
    ORDER BY o.created_at DESC
`;
        const [sales] = await pool.query(salesQuery, paramsOrd);

        res.json({ expenses, sales });

    } catch (error) {
        console.error("Error en Auditoría:", error); // Ver error en consola servidor
        res.status(500).json({ message: "Error generando reporte: " + error.message });
    }
};
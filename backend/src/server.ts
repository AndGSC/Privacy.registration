// Punto de entrada del backend. Por ahora carga la configuración validada.
// En lecciones siguientes iniciará el servidor Express con sus rutas y middlewares.

import { env } from "./config/env";
import {pool} from "./config/db";

async function main(): Promise<void>{ //función asincrónica con un await para esperar a las operaciones que tardan. Toda función async devuelve una promesa: un objeto que representa un resultado que llegará más adelante.
    const result = await pool.query("SELECT current_database() AS db");
    const dbname = result.rows[0]?.db;
    console.log(`Conectado a ${dbname}. API configurada en el puerto ${env.port}`);
    await pool.end();
}


//Función anónina o lambda que se ejecuta solo si el main falla.
main().catch((err) => {
    console.error("Database connection failed: ", err.code);
    process.exit(1);
});
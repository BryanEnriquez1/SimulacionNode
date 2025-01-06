const express = require('express');
const app = express();
app.use(express.json());

// Datos
let corredores = [];

// Servir archivos estáticos
app.use(express.static('public'));

// Método ALL
app.all('/Corredores', (req, res) => {

    if (req.method === 'GET') {
        res.json(corredores);
    } else if (req.method === 'POST') {

        const { nombre, apellido } = req.body;

        if (!nombre || !apellido) {
            return res.status(400).json({ error: "Ingrese correctamente los datos" });
        }

        const newCorredor = {
            id: corredores.length > 0 ? corredores[corredores.length - 1].id + 1 : 1,
            nombre,
            apellido,
            posicion: 0
        };

        corredores.push(newCorredor);
        res.status(201).json(newCorredor);

    } else if (req.method === 'PUT') {

        const { idcorredor, nombre, apellido } = req.body;
        const idc = parseInt(idcorredor);

        if (!idc) {
            return res.status(400).json({ error: "Debe proporcionar un id de corredor" });
        }

        const corredor = corredores.find((c) => c.id === idc);

        if (!corredor) {
            return res.status(404).json({ error: "Corredor no existente" });
        }

        if (nombre) corredor.nombre = nombre;
        if (apellido) corredor.apellido = apellido;

        res.json(corredores);

    } else if (req.method === 'DELETE') {

        const idc = parseInt(req.query.idcorredor);

        if (!idc) {
            return res.status(400).json({ error: "Debe proporcionar un id de corredor" });
        }

        const index = corredores.findIndex((c) => c.id === idc);

        if (index === -1) {
            return res.status(404).json({ error: "Corredor no encontrado" });
        }

        corredores.splice(index, 1);
        res.status(204).send();

    } else if (req.method === 'PATCH') {
        
        const distancia = parseInt(req.query.distancia);
        if (!distancia || distancia <= 0) {
            return res.status(400).json({ error: "Debe proporcionar una distancia válida para la carrera" });
        }

        let ganador = null;
        let minuto = 0;
        let historial = [];

        while (!ganador) {
            minuto++;
            corredores.forEach(corredor => {

                const velocidad = Math.floor(Math.random() * (250 - 130 + 1)) + 130;

                corredor.posicion += velocidad / 1000;

                if (corredor.posicion >= distancia && !ganador) {
                    ganador = corredor;
                }
            });

            // Guardar posición actual de corredores
            historial.push({
                minuto,
                posiciones: corredores.map(c => ({
                    id: c.id,
                    nombre: c.nombre,
                    apellido: c.apellido,
                    posicion: c.posicion.toFixed(2)
                }))
            });

            if (historial.length > 60) {
                historial.shift();
            }
        }

        const posicionesFinales = corredores.map(c => ({
            id: c.id,
            nombre: c.nombre,
            apellido: c.apellido,
            posicion: c.posicion.toFixed(2)
        }));

        res.json({
            historial,
            posicionesFinales,
            ganador: {
                id: ganador.id,
                nombre: ganador.nombre,
                apellido: ganador.apellido,
                posicion: ganador.posicion.toFixed(2)
            }
        });

        corredores.forEach(corredor => {
            corredor.posicion = 0;
        });

    } else {
        res.status(405).json({
            message: `Método ${req.method} no está implementado para esta ruta.`,
        });
    }
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Framework ejecutándose con éxito');
});

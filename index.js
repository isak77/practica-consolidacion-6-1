// Importar archivos
const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');

// Middleware para manejar JSON en las peticiones
app.use(express.json());

// Obtener los cómics
const getComics = () => {
    const data = fs.readFileSync('comics.json', 'utf-8');
    return JSON.parse(data);
};

// Guardar cómics
const saveComics = (comics) => {
    fs.writeFileSync('comics.json', JSON.stringify(comics, null, 2), 'utf-8');
};

// Crear un nuevo cómic
app.post('/comics', (req, res) => {
    const comics = getComics();
    const newComic = {
        id: comics.length + 1,  // Generar un ID simple basado en la longitud del array
        titulo: req.body.titulo, // Título del cómic
        autor: req.body.autor,   // Autor del cómic
        fechaPublicacion: req.body.fechaPublicacion, // Fecha de publicación
        estado: 'disponible',    // Estado por defecto
        mensajes: [],            // Inicialmente sin mensajes
        fechaActualizacion: new Date().toISOString()
    };

    comics.push(newComic);
    saveComics(comics);
    res.status(201).json(newComic);
});

// Obtener todos los cómics
app.get('/comics', (req, res) => {
    const comics = getComics();
    res.json(comics);
});

// Obtener un cómic por ID
app.get('/comics/:id', (req, res) => {
    const comics = getComics();
    const comic = comics.find(c => c.id === parseInt(req.params.id));

    if (!comic) {
        return res.status(404).json({ message: 'Cómic no encontrado' });
    }

    res.json(comic);
});

// Actualizar el estado del cómic (disponible/no disponible)
app.patch('/comics/:id', (req, res) => {
    const comics = getComics();
    const comic = comics.find(c => c.id === parseInt(req.params.id));

    if (!comic) {
        return res.status(404).json({ message: 'Cómic no encontrado' });
    }

    comic.estado = comic.estado === 'disponible' ? 'no disponible' : 'disponible';
    comic.fechaActualizacion = new Date().toISOString();
    saveComics(comics);

    res.json(comic);
});

// Agregar un mensaje a un cómic
app.post('/comics/:id/mensajes', (req, res) => {
    const comics = getComics();
    const comic = comics.find(c => c.id === parseInt(req.params.id));

    // Verificar si el cómic existe
    if (!comic) {
        return res.status(404).json({ message: 'Cómic no encontrado' });
    }

    // Verificar si el cuerpo de la solicitud contiene el campo 'mensaje'
    if (!req.body || !req.body.mensaje) {
        return res.status(400).json({ message: 'El campo "mensaje" es requerido' });
    }

    const nuevoMensaje = {
        mensaje: req.body.mensaje,
        fecha: new Date().toISOString()
    };

    comic.mensajes.push(nuevoMensaje);
    comic.fechaActualizacion = new Date().toISOString();
    saveComics(comics);

    res.status(201).json(nuevoMensaje);
});

// Eliminar un cómic
app.delete('/comics/:id', (req, res) => {
    const comics = getComics();
    const comicIndex = comics.findIndex(c => c.id === parseInt(req.params.id));

    // Verificar si el cómic existe
    if (comicIndex === -1) {
        return res.status(404).json({ message: 'Cómic no encontrado' });
    }

    // Eliminar el cómic del array
    comics.splice(comicIndex, 1);
    saveComics(comics);  // Guardar los cambios en el archivo JSON

    res.status(204).send();  // Respuesta sin contenido
});

// Escuchar al servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
const express = require('express');

let { verificaToken } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');


/**
 * MOSTRAR TODAS LAS CATEGORIAS
 */
app.get('/categorias', verificaToken, (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Categoria.find({}, 'descripcion usuario')
        .skip(desde)
        .limit(limite)
        .sort('descripcion') // PARA ORDENAR
        .populate('usuario', 'nombre email') // PARA REALIZAR LA RELACION
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments({}, (err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });
            });
        });
});


/**
 * MOSTRAR UNA CATEGORIA POR ID
 */
app.get('/categoria/:id', verificaToken, (req, res) => {
    // Categoria.findById();
    let id = req.params.id;

    Categoria.findById(id, (err, categoria) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria
        });
    });
});


/**
 * CREAR NUEVA CATEGORIA
 */
app.post('/categoria', verificaToken, (req, res) => {
    // regresa la nueva categoria
    // req.usuario._id

    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


/**
 * ACTUALIZAR CATEGORIA
 */
app.put('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    let categoria = {
        descripcion: body.descripcion,
        usuario: req.usuario._id
    };

    Categoria.findByIdAndUpdate(id, categoria, { new: true }, (err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


/**
 * ACTUALIZAR CATEGORIA
 */
app.delete('/categoria/:id', verificaToken, (req, res) => {
    // solo un administrador puede borrar categorias

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBorrado
        });
    });
});


module.exports = app;
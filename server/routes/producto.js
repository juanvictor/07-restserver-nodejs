const express = require('express');

const { verificaToken } = require('../middlewares/autenticacion');

let app = express();
let Producto = require('../models/producto');


/**
 * Obtener productos
 */

app.get('/productos', (req, res) => {
    // traer todos los productos
    // populate: usuario categoria
    // paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({ disponible: true }, 'nombre precioUni descripcion categoria usuario')
        .skip(desde)
        .limit(limite)
        .sort('nombre') // PARA ORDENAR
        .populate('categoria', 'descripcion') // PARA REALIZAR LA RELACION
        .populate('usuario', 'nombre email') // PARA REALIZAR LA RELACION
        .exec((err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments({ disponible: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    productoDB,
                    cuantos: conteo
                });
            });
        });
});


/**
 * Obtener producto por ID
 */
app.get('/producto/:id', verificaToken, (req, res) => {
    // populate: usuario categoria
    let id = req.params.id;

    Producto.findById(id)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'ID no existe'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });
});


/**
 * Buscar productos
 */
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i'); // EXPRESION REGULAR PARA QUE NO SEA SENCIBLE A MAYUSCULAS Y MINUSCULAS

    Producto.find({ nombre: regex })
        .populate('categoria', 'nombre')
        .exec((err, productosDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos: productosDB
            });
        });
});


/**
 * Crear un producto
 */
app.post('/productos', verificaToken, (req, res) => {
    // grabar productos
    // grabar una categoria del listado

    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

/**
 * Actualiza producto
 */
app.put('/productos/:id', verificaToken, (req, res) => {
    // grabar productos
    // grabar una categoria del listado
    let id = req.params.id;
    let body = req.body;

    let producto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    };

    Producto.findByIdAndUpdate(id, producto, { new: true }, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});


/**
 * Borrar producto
 */
app.delete('/productos/:id', verificaToken, (req, res) => {
    // grabar productos
    // grabar una categoria del listado

    let id = req.params.id;

    let cambiaDisponible = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambiaDisponible, { new: true }, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

module.exports = app;
const express = require('express');
const bcrypt = require('bcrypt');

const Usuario = require('../models/usuario');

const app = express();

app.get('/usuario', function(req, res) {
    res.json('get Usuario');
});


app.post('/usuario', function(req, res) {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

    // if (body.nombre === undefined) {
    //     res.status(400).json({
    //         ok: false,
    //         mensaje: 'El nombre es necesario'
    //     });
    // } else {
    //     res.json({
    //         persona: body
    //     });
    // }
});


app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;
    let body = req.body;

    // METODO 1
    // Usuario.findById( id, (err, usuarioDB) => {});

    // METODO 2
    Usuario.findByIdAndUpdate(id, body, { new: true }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

    // res.json({
    //     id
    // });
});


app.delete('/usuario', function(req, res) {
    res.json('delete Usuario');
});

module.exports = app;
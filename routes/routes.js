const express = require('express');

const router = express.Router();
const { getProducts, getHATEOAS, getProduct, productsXfiltro } = require('../consultas/consultas');
const mostrarConsulta = require('../middleware/middleware');

router.get('/', mostrarConsulta, (req, res) => {
    res.send('Hello World! desde ROUTER');
})

router.get("/products", mostrarConsulta, async (req, res) => {
  try {
    const consultas = req.query;
    page = +req.query.page || 1;
    const productos = await getProducts(consultas);
    const HATEOAS = getHATEOAS(productos, page);
    res.json(HATEOAS);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/products/product/:id", mostrarConsulta, async (req, res) => {
  try {
    const id = req.params.id;
    const producto = await getProduct(id);
    res.json(producto);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/products/filtros", mostrarConsulta, async (req, res) => {
  try {
    const consultas = req.query;
    const productos = await productsXfiltro(consultas);
    res.json(productos);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router
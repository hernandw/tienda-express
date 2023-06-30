const pool = require("../db/conexion");
const format = require("pg-format");
//obtener todos los productos
const getProducts = async ({limits = 10, page = 1, order_by = "id_asc"}) => {
    const [campo, direccion] = order_by.split("_");
    const offset = limits * (page - 1);
    const { rows: productos } = await pool.query(
      format(
        "SELECT * FROM products order by %s %s LIMIT %s OFFSET %s",
        campo,
        direccion,
        limits,
        offset
      )
    );
  return productos;
};

const getHATEOAS = (productos) => {
  const results = productos.map((producto) => ({
    id: producto.id,
    name: producto.name,
    price: producto.price,
    image: producto.image,
    category: producto.category,
    stock: producto.stock,
    url: `/products/product/${producto.id}`,
  }));
    
    const totalProducts = 20;
    const totalProductxPage = results.length
    const paginacion = `${page} de ${Math.ceil(
      totalProducts / totalProductxPage
    )}`;

    const HATEOAS = {
        totalProducts,
        totalProductxPage,
        page,
        paginacion,
        results
    }

    return HATEOAS;
};

//obtener un producto
const getProduct = async (id) => {
  const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [
    id,
  ]);
  return rows[0];
};


//Obtener productos por filtro
const productsXfiltro = async (querystring) => {
  let filtros = [];
  let values = [];

  //agregamos el filtro para validar los campos
  const agregarFiltro = (campo, comparador, valor) => {
    values.push(valor);
    const { length } = filtros;
    filtros.push(`${campo} ${comparador} $${length + 1}`);
  };

  //desestructuramos el querystring
  const { category, price_max, price_min, stock_max, stock_min, name } =
    querystring;

  //verificamos que los campos existan
  if (category) agregarFiltro("category", "ilike", `%${category}%`);
  if (price_max) agregarFiltro("price", "<=", price_max);
  if (price_min) agregarFiltro("price", ">=", price_min);
  if (stock_max) agregarFiltro("stock", "<=", stock_max);
  if (stock_min) agregarFiltro("stock", ">=", stock_min);
  if (name) agregarFiltro("name", "ilike", `%${name}%`);

  let consulta = "SELECT * FROM products";
  if (filtros.length > 0) {
    consulta += " WHERE " + filtros.join(" AND ");
  }
  const { rows: productos } = await pool.query(consulta, values);
  return productos;
};



module.exports = {
  getProducts,
  getHATEOAS,
  getProduct,
  productsXfiltro,
};
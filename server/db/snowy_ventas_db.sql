-- =============================
-- BASE DE DATOS
-- =============================
USE defaultdb;

-- =============================
-- TABLA: roles
-- =============================
CREATE TABLE roles (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(20) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY name (name)
) ENGINE=InnoDB;

-- =============================
-- TABLA: users
-- =============================
CREATE TABLE users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  KEY role_id (role_id),
  CONSTRAINT users_ibfk_1 FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- =============================
-- TABLA: products
-- =============================
CREATE TABLE products (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  buy_price DECIMAL(10,2) DEFAULT 0.00,
  price DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  description TEXT,
  stock DECIMAL(10,2) DEFAULT 0.00,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- =============================
-- TABLA: orders
-- =============================
CREATE TABLE orders (
  id INT NOT NULL AUTO_INCREMENT,
  client_id INT NOT NULL,
  processed_by INT,
  status ENUM('pendiente','cotizacion','preparando','completado','cancelado') DEFAULT 'pendiente',
  total_amount DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY client_id (client_id),
  KEY processed_by (processed_by),
  CONSTRAINT orders_ibfk_1 FOREIGN KEY (client_id) REFERENCES users(id),
  CONSTRAINT orders_ibfk_2 FOREIGN KEY (processed_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- =============================
-- TABLA: order_items
-- =============================
CREATE TABLE order_items (
  id INT NOT NULL AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  price_at_moment DECIMAL(10,2) NOT NULL,
  cost_at_moment DECIMAL(10,2) DEFAULT 0.00,
  PRIMARY KEY (id),
  KEY order_id (order_id),
  KEY product_id (product_id),
  CONSTRAINT order_items_ibfk_1 FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT order_items_ibfk_2 FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB;

-- =============================
-- TABLA: expenses
-- =============================
CREATE TABLE expenses (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT,
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type ENUM('compra_mercaderia','gasto_operativo') DEFAULT 'gasto_operativo',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT expenses_ibfk_1 FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- =============================
-- DATOS BÁSICOS
-- =============================

-- Roles
INSERT INTO roles (id, name) VALUES
(1, 'admin'),
(2, 'empleado'),
(3, 'cliente');

-- Usuarios
INSERT INTO users (id, name, email, password, role_id) VALUES
(1, 'Admin Snowy', 'admin@snowy.com', '$2b$10$3PKYxZfE8BjI/zNIbM64HucTkwmrpp.qujbd0vUWpFSyRER92TVvK', 1),
(2, 'Vendedor Luis', 'vendedor@snowy.com', '$2b$10$aZMLbpYQI6bLkubI1Ehr.O1nT6B6OkNKLFw3LmDDNycOIlx/OVdN2', 2),
(3, 'Don Gamer', 'cliente@snowy.com', '$2b$10$neEGDUfpn9aT4rYMwvPIpucDVpxcTvIddHkKwYScP9GCXxeVGU.Mm', 3);

-- Productos (ejemplo)
INSERT INTO products (id, name, buy_price, price, unit, stock) VALUES
(1, 'Silla Gamer', 800, 1400, 'unid', 10),
(2, 'Monitor 27', 1200, 1900, 'unid', 5),
(3, 'Audifonos', 200, 450, 'unid', 20);

-- Ordenes (ejemplo)
INSERT INTO orders (id, client_id, processed_by, status, total_amount) VALUES
(1, 3, 2, 'completado', 1400),
(2, 3, 2, 'completado', 900),
(3, 3, NULL, 'pendiente', 450);

-- Detalle de ordenes
INSERT INTO order_items (order_id, product_id, quantity, price_at_moment, cost_at_moment) VALUES
(1, 1, 1, 1400, 800),
(2, 3, 2, 450, 200),
(3, 3, 1, 450, 200);

-- Gastos
INSERT INTO expenses (user_id, description, amount, type) VALUES
(1, 'Compra inicial', 3000, 'compra_mercaderia'),
(2, 'Publicidad', 100, 'gasto_operativo'),
(NULL, 'Otros', 50, 'gasto_operativo');
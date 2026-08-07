-- ============================================================
-- Base de Datos: MercadoLibre
-- PostgreSQL
-- ============================================================

-- Crear la base de datos
CREATE DATABASE mercadolibre;

-- Conectarse a la base de datos
-- \c mercadolibre

-- ============================================================
-- Tabla: Usuario
-- ============================================================
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reputacion DECIMAL(3,2) NOT NULL DEFAULT 0.00
);

-- ============================================================
-- Tabla: Categoria
-- ============================================================
CREATE TABLE categoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    padre_id INT,
    CONSTRAINT fk_categoria_padre
        FOREIGN KEY (padre_id)
        REFERENCES categoria(id)
        ON DELETE SET NULL
);

-- ============================================================
-- Tabla: Publicacion
-- ============================================================
CREATE TABLE publicacion (
    id SERIAL PRIMARY KEY,
    vendedor_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    precio NUMERIC(10,2) NOT NULL,
    stock INT NOT NULL CHECK (stock >= 0),
    categoria_id INT NOT NULL,
    estado VARCHAR(20) NOT NULL,

    CONSTRAINT fk_publicacion_usuario
        FOREIGN KEY (vendedor_id)
        REFERENCES usuario(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_publicacion_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categoria(id),

    CONSTRAINT ck_publicacion_estado
        CHECK (estado IN ('Activa', 'Pausada', 'Finalizada'))
);

-- ============================================================
-- Tabla: Pregunta
-- ============================================================
CREATE TABLE pregunta (
    id SERIAL PRIMARY KEY,
    publicacion_id INT NOT NULL,
    autor_id INT NOT NULL,
    texto VARCHAR(500) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_pregunta_publicacion
        FOREIGN KEY (publicacion_id)
        REFERENCES publicacion(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pregunta_usuario
        FOREIGN KEY (autor_id)
        REFERENCES usuario(id)
);

-- ============================================================
-- Tabla: Respuesta
-- ============================================================
CREATE TABLE respuesta (
    id SERIAL PRIMARY KEY,
    pregunta_id INT NOT NULL UNIQUE,
    texto VARCHAR(500) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_respuesta_pregunta
        FOREIGN KEY (pregunta_id)
        REFERENCES pregunta(id)
        ON DELETE CASCADE
);

-- ============================================================
-- Tabla: Compra
-- ============================================================
CREATE TABLE compra (
    id SERIAL PRIMARY KEY,
    publicacion_id INT NOT NULL,
    comprador_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(10,2) NOT NULL CHECK (total >= 0),
    estado VARCHAR(20) NOT NULL,

    CONSTRAINT fk_compra_publicacion
        FOREIGN KEY (publicacion_id)
        REFERENCES publicacion(id),

    CONSTRAINT fk_compra_usuario
        FOREIGN KEY (comprador_id)
        REFERENCES usuario(id),

    CONSTRAINT ck_compra_estado
        CHECK (estado IN ('Pendiente', 'Pagada', 'Enviada', 'Cancelada', 'Finalizada'))
);

-- ============================================================
-- Tabla: Calificacion
-- ============================================================
CREATE TABLE calificacion (
    id SERIAL PRIMARY KEY,
    compra_id INT NOT NULL,
    autor_id INT NOT NULL,
    receptor_id INT NOT NULL,
    puntaje INT NOT NULL,
    comentario VARCHAR(500),

    CONSTRAINT fk_calificacion_compra
        FOREIGN KEY (compra_id)
        REFERENCES compra(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_calificacion_autor
        FOREIGN KEY (autor_id)
        REFERENCES usuario(id),

    CONSTRAINT fk_calificacion_receptor
        FOREIGN KEY (receptor_id)
        REFERENCES usuario(id),

    CONSTRAINT ck_calificacion_puntaje
        CHECK (puntaje BETWEEN 1 AND 5)
);

-- ============================================================
-- Índices
-- ============================================================

CREATE INDEX idx_publicacion_categoria
ON publicacion(categoria_id);

CREATE INDEX idx_publicacion_vendedor
ON publicacion(vendedor_id);

CREATE INDEX idx_compra_comprador
ON compra(comprador_id);

CREATE INDEX idx_pregunta_publicacion
ON pregunta(publicacion_id);

CREATE INDEX idx_calificacion_receptor
ON calificacion(receptor_id);
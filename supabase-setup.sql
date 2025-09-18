-- Script SQL para crear las tablas en Supabase
-- Ejecuta esto en el SQL Editor de tu panel de Supabase

-- Tabla de materiales/artículos
CREATE TABLE materiales (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(10) UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de presupuestos
CREATE TABLE presupuestos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL DEFAULT 'Presupuesto 2025',
  año INTEGER NOT NULL DEFAULT 2025,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de artículos en presupuesto
CREATE TABLE presupuesto_articulos (
  id SERIAL PRIMARY KEY,
  presupuesto_id INTEGER REFERENCES presupuestos(id) ON DELETE CASCADE,
  material_id INTEGER REFERENCES materiales(id) ON DELETE CASCADE,
  cantidad_marzo INTEGER DEFAULT 0,
  cantidad_agosto INTEGER DEFAULT 0,
  precio_presupuesto DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para valores de partidas por mes
CREATE TABLE partida_valores (
  id SERIAL PRIMARY KEY,
  presupuesto_id INTEGER REFERENCES presupuestos(id) ON DELETE CASCADE,
  codigo_partida VARCHAR(10) NOT NULL,
  mes VARCHAR(3) NOT NULL, -- 'ene', 'feb', 'mar', etc.
  valor DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(presupuesto_id, codigo_partida, mes)
);

-- Insertar los materiales iniciales
INSERT INTO materiales (codigo, nombre, precio) VALUES
('8682', 'ARCHIVADOR DE PALANCA T/1.2 OFICIO', 3.54),
('8900', 'ARCHIVADOR PALANCA T/OFICIO', 5.29),
('6240', 'FOLDER DE PLASTICO C/DOBLE TAPA T/OFICIO', 3.69),
('6481', 'FOLDER MANILA T/ A4', 0.17),
('9125', 'VINIFILES', 1.39),
('5927', 'CUADERNO DE CARGO X 100 HOJAS', 3.21),
('5491', 'PLUMON N° 48 (RESALTADOR) AMARILLO', 2.47),
('5588', 'PLUMON INDELEBLE NEGRO OHP-CD 421F', 2.81),
('5810', 'PLUMON N° 23 INDELEBLE NEGRO', 2.41),
('6962', 'GRAPAS 26/6 X 5000', 1.86),
('5646', 'LAPICERO TINTA AZUL', 0.43),
('6100', 'LAPICERO TINTA NEGRA', 0.43),
('6320', 'LAPICERO TINTA ROJA', 0.43),
('8223', 'TIJERA 7" INCOLMA', 27.88),
('6437', 'SACAGRAPAS', 1.55),
('7865', 'CHINCHE C/CABEZA DE COLORES C/A x 100', 2.62),
('8365', 'CLIPS PLASTIFICADOS CHICOS', 1.22);

-- Crear un presupuesto inicial
INSERT INTO presupuestos (nombre, año) VALUES ('Presupuesto Biblioteca Virtual 2025', 2025);

-- Habilitar Row Level Security (opcional, para seguridad)
ALTER TABLE materiales ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presupuesto_articulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE partida_valores ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acceso público (puedes ajustar según necesites)
CREATE POLICY "Allow public access" ON materiales FOR ALL USING (true);
CREATE POLICY "Allow public access" ON presupuestos FOR ALL USING (true);
CREATE POLICY "Allow public access" ON presupuesto_articulos FOR ALL USING (true);
CREATE POLICY "Allow public access" ON partida_valores FOR ALL USING (true);
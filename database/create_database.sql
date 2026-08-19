-- ============================================================================
-- PULSELINK BEACON — Script de Criacao do Banco de Dados (PostgreSQL)
-- ============================================================================
-- Versao: 1.0.0
-- Data: Junho 2026
-- Descricao: Cria o banco de dados, tabelas, constraints, indices e dados
--            iniciais para o sistema PulseLink Beacon.
-- ============================================================================

-- ── Criacao do banco (executar como superusuario) ────────────────────────────
-- CREATE DATABASE pulselinkdb
--     WITH OWNER = postgres
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'pt_BR.UTF-8'
--     LC_CTYPE = 'pt_BR.UTF-8'
--     TEMPLATE = template0;

-- Conectar ao banco:
-- \c pulselinkdb

-- ============================================================================
-- TABELAS
-- ============================================================================

-- ── 1. Tabela de Usuarios ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL       PRIMARY KEY,
    username        VARCHAR(50)     NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    full_name       VARCHAR(100)    NOT NULL,
    email           VARCHAR(150),
    role            VARCHAR(20)     NOT NULL DEFAULT 'OPERATOR',
    active          BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'OPERATOR'))
);

-- ── 2. Tabela de Dispositivos (Beacons) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
    id                  BIGSERIAL       PRIMARY KEY,
    name                VARCHAR(255)    NOT NULL,
    serial_number       VARCHAR(100)    NOT NULL UNIQUE,
    status              VARCHAR(20)     NOT NULL DEFAULT 'OFFLINE',
    battery_level       INTEGER         DEFAULT 100,
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    last_seen           TIMESTAMP,
    satellite_connected BOOLEAN         DEFAULT FALSE,
    active              BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_devices_status CHECK (status IN ('ONLINE', 'OFFLINE', 'EMERGENCY', 'LOW_BATTERY')),
    CONSTRAINT chk_devices_battery CHECK (battery_level >= 0 AND battery_level <= 100)
);

-- ── 3. Tabela de Leituras de Sensores ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensor_readings (
    id                  BIGSERIAL       PRIMARY KEY,
    device_id           BIGINT          NOT NULL,
    smoke_detected      BOOLEAN         DEFAULT FALSE,
    impact_detected     BOOLEAN         DEFAULT FALSE,
    temperature_celsius DOUBLE PRECISION,
    battery_level       INTEGER,
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    satellite_connected BOOLEAN         DEFAULT FALSE,
    signal_strength     INTEGER,
    timestamp           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sensor_device FOREIGN KEY (device_id)
        REFERENCES devices (id)
        ON DELETE CASCADE
);

-- ── 4. Tabela de Alertas ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
    id              BIGSERIAL       PRIMARY KEY,
    device_id       BIGINT          NOT NULL,
    type            VARCHAR(30)     NOT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    risk_level      VARCHAR(20)     NOT NULL,
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    description     TEXT,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    resolved_at     TIMESTAMP,

    CONSTRAINT fk_alert_device FOREIGN KEY (device_id)
        REFERENCES devices (id)
        ON DELETE CASCADE,
    CONSTRAINT chk_alerts_type CHECK (type IN ('FIRE', 'IMPACT', 'SOS_BUTTON', 'HIGH_TEMPERATURE', 'LOW_BATTERY', 'MANUAL')),
    CONSTRAINT chk_alerts_status CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED')),
    CONSTRAINT chk_alerts_risk CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
);


-- ============================================================================
-- INDICES (para otimizar consultas frequentes)
-- ============================================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users (active);

-- Devices
CREATE INDEX IF NOT EXISTS idx_devices_serial ON devices (serial_number);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices (status);
CREATE INDEX IF NOT EXISTS idx_devices_active ON devices (active);

-- Sensor Readings
CREATE INDEX IF NOT EXISTS idx_readings_device ON sensor_readings (device_id);
CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON sensor_readings (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_readings_device_timestamp ON sensor_readings (device_id, timestamp DESC);

-- Alerts
CREATE INDEX IF NOT EXISTS idx_alerts_device ON alerts (device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts (status);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_device_status ON alerts (device_id, status);


-- ============================================================================
-- DADOS INICIAIS
-- ============================================================================

-- ── Usuarios ─────────────────────────────────────────────────────────────────
-- Senhas hasheadas com BCrypt (geradas pelo Spring Security)
-- admin    -> admin123
-- operador -> oper123
INSERT INTO users (username, password, full_name, email, role, active, created_at) VALUES
    ('admin',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Administrador PulseLink', 'admin@pulselink.com',    'ADMIN',    TRUE, CURRENT_TIMESTAMP),
    ('operador', '$2a$10$dXJ3SW6G7P50lGmMQgel7u0tt3Ig/J3v7YHnC3dGJh3OVvAK9Jz.K', 'Operador de Campo',       'operador@pulselink.com', 'OPERATOR', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO NOTHING;

-- ── Dispositivos (Beacons) ───────────────────────────────────────────────────
INSERT INTO devices (name, serial_number, status, battery_level, latitude, longitude, last_seen, satellite_connected, active, created_at) VALUES
    ('Beacon Alpha - Serra do Mar',      'PLB-001-ALPHA', 'ONLINE',  87, -23.9955, -46.3051, CURRENT_TIMESTAMP,                    TRUE,  TRUE, CURRENT_TIMESTAMP),
    ('Beacon Beta - Pantanal Norte',     'PLB-002-BETA',  'ONLINE',  62, -17.7250, -57.5900, CURRENT_TIMESTAMP,                    TRUE,  TRUE, CURRENT_TIMESTAMP),
    ('Beacon Gamma - Amazonia Ocidental','PLB-003-GAMMA', 'OFFLINE', 15,  -3.1190, -60.0217, CURRENT_TIMESTAMP - INTERVAL '3 hours', FALSE, TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (serial_number) DO NOTHING;


-- ============================================================================
-- VERIFICACAO (executar para validar)
-- ============================================================================
-- SELECT 'users'           AS tabela, COUNT(*) AS registros FROM users
-- UNION ALL
-- SELECT 'devices'         AS tabela, COUNT(*) AS registros FROM devices
-- UNION ALL
-- SELECT 'sensor_readings' AS tabela, COUNT(*) AS registros FROM sensor_readings
-- UNION ALL
-- SELECT 'alerts'          AS tabela, COUNT(*) AS registros FROM alerts;

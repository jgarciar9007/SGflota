-- ============================================================
-- SGFlota - Script de Actualización de Base de Datos de Producción
-- Versión: Añade tablas VehicleDocument, VehicleInsurance e IvaRecord
-- Fecha: 2026-03-30
--
-- SEGURO: Usa CREATE TABLE IF NOT EXISTS
-- No elimina ni modifica tablas existentes
-- No altera datos existentes
-- Compatible con PostgreSQL
--
-- Cómo ejecutar en producción:
--   psql $DATABASE_URL -f scripts/update-production-db.sql
-- ============================================================

BEGIN;

-- ============================================================
-- Tabla: VehicleDocument
-- Gestiona documentos oficiales de vehículos con fecha de vencimiento
-- ============================================================
CREATE TABLE IF NOT EXISTS "VehicleDocument" (
    "id"            TEXT            NOT NULL,
    "vehicleId"     TEXT            NOT NULL,
    "categoryId"    TEXT,
    "documentType"  TEXT            NOT NULL,
    "description"   TEXT            NOT NULL,
    "amount"        INTEGER         NOT NULL,
    "issueDate"     TIMESTAMP(3)    NOT NULL,
    "expiryDate"    TIMESTAMP(3)    NOT NULL,
    "status"        TEXT            NOT NULL,
    "paymentStatus" TEXT            NOT NULL DEFAULT 'Pagado',
    "notes"         TEXT,
    "createdAt"     TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleDocument_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "VehicleDocument_vehicleId_fkey"
        FOREIGN KEY ("vehicleId")
        REFERENCES "Vehicle"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VehicleDocument_categoryId_fkey"
        FOREIGN KEY ("categoryId")
        REFERENCES "ExpenseCategory"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================================
-- Tabla: VehicleInsurance
-- Gestiona pólizas de seguro de vehículos con fecha de vencimiento
-- ============================================================
CREATE TABLE IF NOT EXISTS "VehicleInsurance" (
    "id"            TEXT            NOT NULL,
    "vehicleId"     TEXT            NOT NULL,
    "categoryId"    TEXT,
    "insurer"       TEXT            NOT NULL,
    "policyNumber"  TEXT            NOT NULL,
    "coverageType"  TEXT            NOT NULL,
    "amount"        INTEGER         NOT NULL,
    "startDate"     TIMESTAMP(3)    NOT NULL,
    "expiryDate"    TIMESTAMP(3)    NOT NULL,
    "status"        TEXT            NOT NULL,
    "paymentStatus" TEXT            NOT NULL DEFAULT 'Pagado',
    "notes"         TEXT,
    "createdAt"     TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleInsurance_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "VehicleInsurance_vehicleId_fkey"
        FOREIGN KEY ("vehicleId")
        REFERENCES "Vehicle"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VehicleInsurance_categoryId_fkey"
        FOREIGN KEY ("categoryId")
        REFERENCES "ExpenseCategory"("id")
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- ============================================================
-- Índices para claves foráneas (mejora rendimiento en consultas)
-- ============================================================
CREATE INDEX IF NOT EXISTS "VehicleDocument_vehicleId_idx"
    ON "VehicleDocument"("vehicleId");

CREATE INDEX IF NOT EXISTS "VehicleDocument_categoryId_idx"
    ON "VehicleDocument"("categoryId");

CREATE INDEX IF NOT EXISTS "VehicleInsurance_vehicleId_idx"
    ON "VehicleInsurance"("vehicleId");

CREATE INDEX IF NOT EXISTS "VehicleInsurance_categoryId_idx"
    ON "VehicleInsurance"("categoryId");

-- ============================================================
-- Tabla: IvaRecord
-- Registra el IVA (15%) generado automáticamente al pagar facturas de alquiler
-- ============================================================
CREATE TABLE IF NOT EXISTS "IvaRecord" (
    "id"            TEXT            NOT NULL,
    "invoiceId"     TEXT            NOT NULL,
    "amount"        INTEGER         NOT NULL,
    "baseAmount"    INTEGER         NOT NULL,
    "paymentDate"   TIMESTAMP(3)    NOT NULL,
    "period"        TEXT            NOT NULL,
    "status"        TEXT            NOT NULL DEFAULT 'Pendiente',
    "createdAt"     TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IvaRecord_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "IvaRecord_invoiceId_fkey"
        FOREIGN KEY ("invoiceId")
        REFERENCES "Invoice"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "IvaRecord_invoiceId_idx"
    ON "IvaRecord"("invoiceId");

CREATE INDEX IF NOT EXISTS "IvaRecord_period_idx"
    ON "IvaRecord"("period");

COMMIT;

-- ============================================================
-- Verificación (ejecutar después del script para confirmar)
-- ============================================================
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN ('VehicleDocument', 'VehicleInsurance', 'IvaRecord');

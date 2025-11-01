-- Initialize database schema for Land Registry DApp

-- Parcels table with enhanced property details
CREATE TABLE IF NOT EXISTS parcels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parcel_id TEXT UNIQUE NOT NULL,
    geojson TEXT NOT NULL,
    owner TEXT NOT NULL,
    area REAL,
    location TEXT,
    value NUMERIC,
    is_verified BOOLEAN DEFAULT FALSE,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata_uri TEXT,
    doc_hash BLOB,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disputed', 'pending'))
);

-- Ownership history with enhanced transaction details
CREATE TABLE IF NOT EXISTS ownership_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parcel_id TEXT NOT NULL,
    previous_owner TEXT NOT NULL,
    new_owner TEXT NOT NULL,
    price NUMERIC,
    document_uri TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    transaction_hash TEXT,
    FOREIGN KEY (parcel_id) REFERENCES parcels(parcel_id)
);

-- Property valuations history
CREATE TABLE IF NOT EXISTS property_valuations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parcel_id TEXT NOT NULL,
    value NUMERIC NOT NULL,
    valuation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    valuation_type TEXT CHECK (valuation_type IN ('market', 'tax', 'bank')),
    appraiser TEXT,
    FOREIGN KEY (parcel_id) REFERENCES parcels(parcel_id)
);

-- Property documents
CREATE TABLE IF NOT EXISTS property_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parcel_id TEXT NOT NULL,
    document_type TEXT NOT NULL,
    document_uri TEXT NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified BOOLEAN DEFAULT FALSE,
    verified_by TEXT,
    FOREIGN KEY (parcel_id) REFERENCES parcels(parcel_id)
);

-- Property disputes
CREATE TABLE IF NOT EXISTS property_disputes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parcel_id TEXT NOT NULL,
    disputed_by TEXT NOT NULL,
    dispute_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    dispute_type TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'rejected')),
    resolution_date DATETIME,
    resolved_by TEXT,
    FOREIGN KEY (parcel_id) REFERENCES parcels(parcel_id)
);

-- Checkpoints for blockchain sync
CREATE TABLE IF NOT EXISTS checkpoints (
    id TEXT PRIMARY KEY,
    block INTEGER NOT NULL
);

-- Indices for better query performance
CREATE INDEX IF NOT EXISTS idx_parcels_owner ON parcels(owner);
CREATE INDEX IF NOT EXISTS idx_parcels_status ON parcels(status);
CREATE INDEX IF NOT EXISTS idx_ownership_history_parcel ON ownership_history(parcel_id);
CREATE INDEX IF NOT EXISTS idx_property_valuations_parcel ON property_valuations(parcel_id);
CREATE INDEX IF NOT EXISTS idx_property_documents_parcel ON property_documents(parcel_id);
CREATE INDEX IF NOT EXISTS idx_property_disputes_parcel ON property_disputes(parcel_id);
CREATE INDEX IF NOT EXISTS idx_property_disputes_status ON property_disputes(status);
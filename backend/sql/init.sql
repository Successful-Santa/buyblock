-- init.sql
CREATE TABLE IF NOT EXISTS parcels (
  id serial PRIMARY KEY,
  parcel_id bigint UNIQUE NOT NULL,
  geojson jsonb,
  doc_hash bytea,
  owner text,
  registered_at timestamptz
);

CREATE TABLE IF NOT EXISTS ownership_history (
  id serial PRIMARY KEY,
  parcel_id bigint NOT NULL,
  previous_owner text,
  new_owner text,
  changed_at timestamptz
);

CREATE TABLE IF NOT EXISTS checkpoints (
  id text PRIMARY KEY,
  block_number bigint NOT NULL
);

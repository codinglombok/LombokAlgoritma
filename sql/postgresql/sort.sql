-- LombokAlgoritma — PostgreSQL Sort
-- Apache-2.0 — @codinglombok
CREATE SCHEMA IF NOT EXISTS lombokalgoritma;
CREATE OR REPLACE FUNCTION lombokalgoritma.sort_int_asc(arr integer[])
RETURNS integer[] LANGUAGE SQL IMMUTABLE STRICT AS $$
    SELECT ARRAY(SELECT unnest(arr) ORDER BY 1) $$;
CREATE OR REPLACE FUNCTION lombokalgoritma.sort_int_desc(arr integer[])
RETURNS integer[] LANGUAGE SQL IMMUTABLE STRICT AS $$
    SELECT ARRAY(SELECT unnest(arr) ORDER BY 1 DESC) $$;
CREATE OR REPLACE FUNCTION lombokalgoritma.sort_text(arr text[])
RETURNS text[] LANGUAGE SQL IMMUTABLE STRICT AS $$
    SELECT ARRAY(SELECT unnest(arr) ORDER BY 1) $$;

-- LombokAlgoritma — PostgreSQL Vector/ML
-- Apache-2.0 — @codinglombok
-- DIPAKAI: LombokRAGFrameworks (vector similarity search)
CREATE OR REPLACE FUNCTION lombokalgoritma.dot_product(a double precision[], b double precision[])
RETURNS double precision LANGUAGE sql IMMUTABLE STRICT AS $$
  SELECT SUM(x*y) FROM unnest(a,b) AS t(x,y) $$;
CREATE OR REPLACE FUNCTION lombokalgoritma.l2_norm(v double precision[])
RETURNS double precision LANGUAGE sql IMMUTABLE STRICT AS $$
  SELECT sqrt(SUM(x*x)) FROM unnest(v) AS t(x) $$;
CREATE OR REPLACE FUNCTION lombokalgoritma.cosine_similarity(a double precision[], b double precision[])
RETURNS double precision LANGUAGE plpgsql IMMUTABLE STRICT AS $$
DECLARE na double precision:=lombokalgoritma.l2_norm(a); nb double precision:=lombokalgoritma.l2_norm(b);
BEGIN IF na=0 OR nb=0 THEN RETURN 0; END IF;
  RETURN lombokalgoritma.dot_product(a,b)/(na*nb); END; $$;
CREATE OR REPLACE FUNCTION lombokalgoritma.l2_distance(a double precision[], b double precision[])
RETURNS double precision LANGUAGE sql IMMUTABLE STRICT AS $$
  SELECT sqrt(SUM((x-y)^2)) FROM unnest(a,b) AS t(x,y) $$;
CREATE OR REPLACE FUNCTION lombokalgoritma.normalize(v double precision[])
RETURNS double precision[] LANGUAGE plpgsql IMMUTABLE STRICT AS $$
DECLARE n double precision:=lombokalgoritma.l2_norm(v);
BEGIN IF n=0 THEN RETURN array_fill(0::double precision,ARRAY[array_length(v,1)]); END IF;
  RETURN ARRAY(SELECT x/n FROM unnest(v) AS t(x)); END; $$;

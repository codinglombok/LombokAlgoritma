-- LombokAlgoritma — PostgreSQL String
-- Apache-2.0 — @codinglombok
CREATE OR REPLACE FUNCTION lombokalgoritma.levenshtein_la(a text, b text)
RETURNS integer LANGUAGE plpgsql IMMUTABLE STRICT AS $$
DECLARE la integer:=length(a); lb integer:=length(b); prev integer[]; curr integer[];
  i integer; j integer; cost integer;
BEGIN
  IF a=b THEN RETURN 0; END IF;
  IF la=0 THEN RETURN lb; END IF; IF lb=0 THEN RETURN la; END IF;
  prev:=ARRAY(SELECT generate_series(0,la));
  FOR j IN 1..lb LOOP curr:=ARRAY[j];
    FOR i IN 1..la LOOP cost:=CASE WHEN substr(a,i,1)=substr(b,j,1) THEN 0 ELSE 1 END;
      curr:=array_append(curr,LEAST(curr[i]+1,prev[i+1]+1,prev[i]+cost));
    END LOOP; prev:=curr;
  END LOOP; RETURN prev[la+1]; END; $$;

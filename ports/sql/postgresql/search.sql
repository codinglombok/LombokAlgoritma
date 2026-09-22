-- LombokAlgoritma — PostgreSQL Search
-- Apache-2.0 — @codinglombok
CREATE OR REPLACE FUNCTION lombokalgoritma.binary_search(arr integer[], target integer)
RETURNS integer LANGUAGE plpgsql IMMUTABLE STRICT AS $$
DECLARE lo integer:=1; hi integer:=array_length(arr,1); mid integer;
BEGIN
  WHILE lo<=hi LOOP mid:=(lo+hi)/2;
    IF arr[mid]=target THEN RETURN mid-1;
    ELSIF arr[mid]<target THEN lo:=mid+1; ELSE hi:=mid-1; END IF;
  END LOOP; RETURN -1; END; $$;
CREATE OR REPLACE FUNCTION lombokalgoritma.lower_bound(arr integer[], target integer)
RETURNS integer LANGUAGE plpgsql IMMUTABLE STRICT AS $$
DECLARE lo integer:=1; hi integer:=array_length(arr,1)+1; mid integer;
BEGIN WHILE lo<hi LOOP mid:=(lo+hi)/2;
  IF arr[mid]<target THEN lo:=mid+1; ELSE hi:=mid; END IF;
END LOOP; RETURN lo-1; END; $$;

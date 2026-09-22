-- LombokAlgoritma — PostgreSQL Math
-- Apache-2.0 — @codinglombok
CREATE OR REPLACE FUNCTION lombokalgoritma.gcd(a bigint, b bigint)
RETURNS bigint LANGUAGE plpgsql IMMUTABLE STRICT AS $$
BEGIN WHILE b!=0 LOOP SELECT b,a%b INTO a,b; END LOOP; RETURN abs(a); END; $$;
CREATE OR REPLACE FUNCTION lombokalgoritma.lcm(a bigint, b bigint)
RETURNS bigint LANGUAGE sql IMMUTABLE STRICT AS $$
    SELECT CASE WHEN a=0 OR b=0 THEN 0 ELSE abs(a/lombokalgoritma.gcd(a,b)*b) END $$;
CREATE OR REPLACE FUNCTION lombokalgoritma.mod_pow(base bigint, exp bigint, m bigint)
RETURNS bigint LANGUAGE plpgsql IMMUTABLE STRICT AS $$
DECLARE result bigint:=1;
BEGIN base:=base%m; WHILE exp>0 LOOP
  IF (exp&1)=1 THEN result:=result*base%m; END IF;
  exp:=exp>>1; base:=base*base%m;
END LOOP; RETURN result; END; $$;
CREATE OR REPLACE FUNCTION lombokalgoritma.factorial(n integer)
RETURNS bigint LANGUAGE sql IMMUTABLE STRICT AS $$
  WITH RECURSIVE f(i,val) AS (SELECT 1,1::bigint UNION ALL SELECT i+1,val*(i+1) FROM f WHERE i<n)
  SELECT COALESCE(MAX(val),1) FROM f $$;
CREATE OR REPLACE FUNCTION lombokalgoritma.fibonacci(n integer)
RETURNS bigint LANGUAGE sql IMMUTABLE STRICT AS $$
  WITH RECURSIVE fib(i,a,b) AS (SELECT 0,0::bigint,1::bigint UNION ALL SELECT i+1,b,a+b FROM fib WHERE i<n)
  SELECT a FROM fib WHERE i=n $$;

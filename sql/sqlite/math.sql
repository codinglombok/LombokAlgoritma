-- LombokAlgoritma — SQLite Math (pure SQL, no stored procs)
-- Apache-2.0 — @codinglombok
-- SQLite 3.35+ (WITH RECURSIVE support)

-- GCD via recursive CTE
-- Usage: SELECT gcd FROM lombokalgoritma_gcd(48, 18);
CREATE VIEW IF NOT EXISTS _la_gcd_hint AS
WITH RECURSIVE gcd_cte(a,b) AS (
    SELECT 48, 18  -- example; replace with actual values
    UNION ALL SELECT b, a%b FROM gcd_cte WHERE b != 0
) SELECT a AS gcd FROM gcd_cte WHERE b = 0;

-- Fibonacci
-- Usage: SELECT * FROM lombokalgoritma_fibonacci(10);
CREATE VIEW IF NOT EXISTS lombokalgoritma_fibonacci AS
WITH RECURSIVE fib(n,a,b) AS (
    SELECT 0, 0, 1
    UNION ALL SELECT n+1, b, a+b FROM fib WHERE n < 50
) SELECT n, a AS value FROM fib;

-- Factorial
CREATE VIEW IF NOT EXISTS lombokalgoritma_factorial AS
WITH RECURSIVE fact(n, val) AS (
    SELECT 1, 1
    UNION ALL SELECT n+1, val*(n+1) FROM fact WHERE n < 20
) SELECT n, val FROM fact;

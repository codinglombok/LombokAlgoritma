-- LombokAlgoritma — MySQL Sort (stored procedures)
-- Apache-2.0 — @codinglombok
-- MySQL 8.0+ (no native array sort; use JSON arrays)
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS lombokalgoritma_sort_json(IN arr JSON, OUT result JSON)
BEGIN
  -- MySQL 8.0+ JSON_TABLE approach: sort via temp table
  DROP TEMPORARY TABLE IF EXISTS _la_sort_tmp;
  CREATE TEMPORARY TABLE _la_sort_tmp (val DOUBLE);
  -- Insert values from JSON array
  INSERT INTO _la_sort_tmp
    SELECT * FROM JSON_TABLE(arr, '$[*]' COLUMNS(val DOUBLE PATH '$')) AS jt;
  SET result = (SELECT JSON_ARRAYAGG(val ORDER BY val) FROM _la_sort_tmp);
  DROP TEMPORARY TABLE IF EXISTS _la_sort_tmp;
END//
DELIMITER ;

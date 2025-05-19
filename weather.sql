
-- Weather App

CREATE TABLE IF NOT EXISTS search_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(100),
  time DATETIME
);

SELECT * FROM search_history;
DROP TABLE search_history;


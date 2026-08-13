-- Polymarket ingestion schema (MySQL 8)
-- All DATETIME values are stored as UTC.

CREATE TABLE events (
  id            VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title         VARCHAR(512) NOT NULL,
  slug          VARCHAR(255) NOT NULL,
  neg_risk      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    DATETIME(6) NULL,
  updated_at    DATETIME(6) NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_events_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE markets (
  id            VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  event_id      VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  question          VARCHAR(1024) NOT NULL,
  group_item_title  VARCHAR(512) NULL,
  condition_id      CHAR(66) CHARACTER SET ascii COLLATE ascii_bin NULL,
  slug              VARCHAR(255) NOT NULL,
  start_date        DATETIME(6) NULL,
  end_date          DATETIME(6) NULL,
  neg_risk          BOOLEAN NOT NULL DEFAULT FALSE,
  active            BOOLEAN NOT NULL DEFAULT FALSE,
  closed            BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        DATETIME(6) NULL,
  updated_at        DATETIME(6) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_markets_condition_id (condition_id),
  KEY idx_markets_slug (slug),
  KEY idx_markets_event_id (event_id),

  CONSTRAINT fk_markets_event
    FOREIGN KEY (event_id) REFERENCES events (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE price_snapshots (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  market_id     VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  yes_price     DECIMAL(6,4) NULL,
  no_price      DECIMAL(6,4) NULL,
  last_trade_price DECIMAL(6,4) NULL,
  best_bid      DECIMAL(6,4) NULL,
  best_ask      DECIMAL(6,4) NULL,
  spread        DECIMAL(6,4) NULL,
  volume        DECIMAL(20,6) NULL,
  liquidity     DECIMAL(20,6) NULL,
  captured_at   DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_snapshots_market_time (market_id, captured_at),
  KEY idx_snapshots_captured_at (captured_at),
  CONSTRAINT fk_snapshots_market
    FOREIGN KEY (market_id) REFERENCES markets (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE ingestion_runs (
  id              BIGINT       NOT NULL AUTO_INCREMENT,
  started_at      DATETIME     NOT NULL,
  finished_at     DATETIME     NULL,
  markets_fetched INT          NOT NULL DEFAULT 0,
  markets_written INT          NOT NULL DEFAULT 0,
  error_count     INT          NOT NULL DEFAULT 0,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
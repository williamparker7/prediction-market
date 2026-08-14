-- Polymarket ingestion schema (MySQL 8)
-- All DATETIME values represent UTC; DATETIME itself stores no timezone.

CREATE TABLE events (
  id        VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  title     VARCHAR(512) NOT NULL,
  slug      VARCHAR(255) NOT NULL,
  neg_risk  BOOLEAN NOT NULL DEFAULT FALSE,

  PRIMARY KEY (id),
  KEY idx_events_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE markets (
  id                  VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  event_id            VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  condition_id        CHAR(66) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  question_id         CHAR(66) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  primary_token_id    VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  secondary_token_id  VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  primary_outcome     VARCHAR(255) NOT NULL,
  secondary_outcome   VARCHAR(255) NOT NULL,
  question            VARCHAR(1024) NOT NULL,
  group_item_title    VARCHAR(512) NULL,
  slug                VARCHAR(255) NOT NULL,
  description         TEXT NULL,
  resolution_source   TEXT NULL,
  source_created_at   DATETIME(6) NULL,
  start_date          DATETIME(6) NULL,
  end_date            DATETIME(6) NULL,
  closed_at           DATETIME(6) NULL,
  neg_risk            BOOLEAN NOT NULL DEFAULT FALSE,
  enable_order_book   BOOLEAN NOT NULL DEFAULT FALSE,
  active              BOOLEAN NOT NULL DEFAULT FALSE,
  closed              BOOLEAN NOT NULL DEFAULT FALSE,
  primary_payout      DECIMAL(2,1) NULL,
  resolved_at         DATETIME(6) NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_markets_condition_id (condition_id),
  UNIQUE KEY uq_markets_question_id (question_id),
  UNIQUE KEY uq_markets_primary_token_id (primary_token_id),
  UNIQUE KEY uq_markets_secondary_token_id (secondary_token_id),
  KEY idx_markets_slug (slug),
  KEY idx_markets_event_id (event_id),

  CONSTRAINT chk_markets_primary_payout
    CHECK (primary_payout IS NULL OR primary_payout IN (0.0, 0.5, 1.0)),
  CONSTRAINT fk_markets_event
    FOREIGN KEY (event_id) REFERENCES events (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE ingestion_runs (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  status             ENUM('running', 'succeeded', 'failed') NOT NULL,
  requested_limit    INT UNSIGNED NOT NULL,
  started_at         DATETIME(6) NOT NULL,
  finished_at        DATETIME(6) NULL,
  markets_fetched    INT UNSIGNED NOT NULL DEFAULT 0,
  snapshots_written  INT UNSIGNED NOT NULL DEFAULT 0,
  error_message      TEXT NULL,

  PRIMARY KEY (id),
  CONSTRAINT chk_ingestion_runs_requested_limit CHECK (requested_limit > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE historical_prices (
  market_id      VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  observed_at    DATETIME(6) NOT NULL,
  primary_price  DECIMAL(7,6) NOT NULL,

  PRIMARY KEY (market_id, observed_at),
  CONSTRAINT chk_historical_prices_primary_price
    CHECK (primary_price >= 0 AND primary_price <= 1),
  CONSTRAINT fk_historical_prices_market
    FOREIGN KEY (market_id) REFERENCES markets (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE historical_price_imports (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  market_id           VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  token_id            VARCHAR(80) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `interval`          VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  fidelity_minutes    INT UNSIGNED NOT NULL,
  requested_start_at  DATETIME(6) NULL,
  requested_end_at    DATETIME(6) NULL,
  started_at          DATETIME(6) NOT NULL,
  completed_at        DATETIME(6) NULL,
  status              ENUM('running', 'succeeded', 'failed') NOT NULL,
  points_returned     INT UNSIGNED NULL,
  points_inserted     INT UNSIGNED NULL,
  error_message       TEXT NULL,

  PRIMARY KEY (id),
  KEY idx_historical_price_imports_market_started (market_id, started_at),
  CONSTRAINT chk_historical_price_imports_fidelity
    CHECK (fidelity_minutes > 0),
  CONSTRAINT chk_historical_price_imports_counts
    CHECK (
      points_returned IS NULL
      OR points_inserted IS NULL
      OR points_inserted <= points_returned
    ),
  CONSTRAINT fk_historical_price_imports_market
    FOREIGN KEY (market_id) REFERENCES markets (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE price_snapshots (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  run_id            BIGINT UNSIGNED NOT NULL,
  market_id         VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  primary_price     DECIMAL(6,4) NULL,
  secondary_price   DECIMAL(6,4) NULL,
  last_trade_price  DECIMAL(6,4) NULL,
  best_bid          DECIMAL(6,4) NULL,
  best_ask          DECIMAL(6,4) NULL,
  spread            DECIMAL(6,4) NULL,
  volume            DECIMAL(20,6) NULL,
  volume_24h        DECIMAL(20,6) NULL,
  liquidity         DECIMAL(20,6) NULL,
  captured_at       DATETIME(6) NOT NULL,

  PRIMARY KEY (id),
  UNIQUE KEY uq_snapshots_run_market (run_id, market_id),
  KEY idx_snapshots_market_time (market_id, captured_at),
  KEY idx_snapshots_captured_at (captured_at),
  CONSTRAINT fk_snapshots_run
    FOREIGN KEY (run_id) REFERENCES ingestion_runs (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_snapshots_market
    FOREIGN KEY (market_id) REFERENCES markets (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

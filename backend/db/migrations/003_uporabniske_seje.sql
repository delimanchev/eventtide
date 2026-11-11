CREATE TABLE uporabniska_seja (
    sid varchar PRIMARY KEY,
    sess json NOT NULL,
    expire timestamp(6) NOT NULL
);

CREATE INDEX uporabniska_seja_expire_idx
    ON uporabniska_seja (expire);
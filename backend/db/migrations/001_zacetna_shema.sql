CREATE TABLE uporabnik (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ime text NOT NULL,
    email text NOT NULL,
    geslo_hash text NOT NULL,
    vloga text NOT NULL DEFAULT 'udeleženec'
        CHECK (vloga IN ('udeleženec', 'organizator', 'administrator')),
    aktiven boolean NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX uporabnik_email_uk
    ON uporabnik (lower(btrim(email)));

CREATE TABLE kategorija (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    naziv text NOT NULL UNIQUE
);

CREATE TABLE dogodek (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organizator_id integer NOT NULL REFERENCES uporabnik (id),
    kategorija_id integer NOT NULL REFERENCES kategorija (id),
    naslov text NOT NULL,
    opis text NOT NULL,
    lokacija text NOT NULL,
    zacetek timestamptz NOT NULL,
    konec timestamptz NOT NULL CHECK (konec > zacetek),
    rok_prijave timestamptz NOT NULL CHECK (rok_prijave <= zacetek),
    kapaciteta integer NOT NULL CHECK (kapaciteta > 0),
    status text NOT NULL DEFAULT 'osnutek'
        CHECK (status IN ('osnutek', 'objavljen', 'odpovedan', 'umaknjen')),
    razlog_odpovedi text,
    vidnost text NOT NULL DEFAULT 'javen'
        CHECK (vidnost IN ('javen', 'zaseben')),
    koda_povabila text UNIQUE,
    CHECK (
        (vidnost = 'javen' AND koda_povabila IS NULL)
        OR (vidnost = 'zaseben' AND koda_povabila IS NOT NULL
            AND btrim(koda_povabila) <> '')
    )
);

CREATE TABLE prijava (
    id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    uporabnik_id integer NOT NULL REFERENCES uporabnik (id),
    dogodek_id integer NOT NULL REFERENCES dogodek (id),
    cas_prijave timestamptz NOT NULL DEFAULT now(),
    status text NOT NULL CHECK (status IN ('potrjena', 'cakalna', 'odpovedana')),
    prisotnost text NOT NULL DEFAULT 'neevidentirana'
        CHECK (prisotnost IN ('neevidentirana', 'prisoten', 'odsoten')),
    UNIQUE (uporabnik_id, dogodek_id),
    CHECK (status = 'potrjena' OR prisotnost = 'neevidentirana')
);

CREATE INDEX prijava_dogodek_status_idx
    ON prijava (dogodek_id, status, cas_prijave, id);
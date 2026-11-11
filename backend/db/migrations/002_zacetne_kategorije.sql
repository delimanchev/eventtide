INSERT INTO kategorija (naziv)
VALUES
    ('Izobraževanje'),
    ('Šport'),
    ('Umetnost')
ON CONFLICT (naziv) DO NOTHING;
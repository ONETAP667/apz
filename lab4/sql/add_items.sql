INSERT INTO "Items"
(
    "OwnerID",
    "Price",
    "Type",
    "Weapon",
    "Special",
    "SkinID",
    "Nametag",
    "Archive"
)
VALUES
    (1, 100, 1, 5,    NULL, 10, 'AK Skin',       FALSE),
    (1, 250, 1, 8,    NULL, 22, 'AWP Skin',      FALSE),
    (1, 50,  2, NULL, 3,    0,  'Special Item',  FALSE),
    (1, 0,   2, NULL, NULL, 0,  NULL,            FALSE);
SELECT * FROM  "Items"

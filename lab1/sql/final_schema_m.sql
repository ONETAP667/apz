-- normalized_schema.sql
-- Остаточна схема БД маркетплейсу CS2 у 3НФ.

-- Порядок: спочатку DROP-и дочірніх таблиць, потім батьківських, потім CREATE.

DROP TABLE IF EXISTS "Transactions" CASCADE;
DROP TABLE IF EXISTS "ItemPreviews" CASCADE;
DROP TABLE IF EXISTS "Items" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;
DROP TABLE IF EXISTS "WeaponIDToWeapon" CASCADE;
DROP TABLE IF EXISTS "ItemTypes" CASCADE;
DROP TABLE IF EXISTS "SpecialToCategory" CASCADE;

-- 1. Lookup-таблиці

CREATE TABLE IF NOT EXISTS "WeaponIDToWeapon"
(
    "WeaponID"  SERIAL PRIMARY KEY,
    "Weapon"    varchar(256) NOT NULL
);

CREATE TABLE IF NOT EXISTS "ItemTypes"
(
    "TypeID"     SERIAL PRIMARY KEY,
    "Description" varchar(256)
);

CREATE TABLE IF NOT EXISTS "SpecialToCategory"
(
    "SpecialID"  SERIAL PRIMARY KEY,
    "Category"   varchar(256) NOT NULL
);

CREATE TABLE IF NOT EXISTS "RestrictionType"
(
    "ID"  SERIAL PRIMARY KEY,
    "RestDescription"  varchar(256) NOT NULL
);


-- 2. Користувачі

CREATE TABLE IF NOT EXISTS "Users"
(
    "ID"            SERIAL PRIMARY KEY,
    "Username"          varchar(256) NOT NULL,
    "Balance"           integer NOT NULL DEFAULT 0,
    "DateJoined"        timestamptz NOT NULL DEFAULT now(),
    "RestrictionType" integer REFERENCES "RestrictionType"("ID") DEFAULT 0,
    "RestrictedUntil"   timestamptz,
    "RestrictionReason" varchar(256),
    "Archive" BOOLEAN  DEFAULT FALSE,
    "Version" integer NOT NULL DEFAULT 0,
    "email"         varchar(256) UNIQUE NOT NULL,
    "password_hash" varchar(256) NOT NULL,
);

-- 3. Предмети маркетплейсу

CREATE TABLE IF NOT EXISTS "Items"
(
    "ID"       SERIAL PRIMARY KEY,
    "OwnerID"      integer NOT NULL REFERENCES "Users" ("ID"),
    "Price"        integer NOT NULL DEFAULT 0 CHECK ("Price" >= 0),
    "Type"         integer REFERENCES "ItemTypes" ("TypeID"),
    "Weapon"       integer DEFAULT NULL REFERENCES "WeaponIDToWeapon"("WeaponID"),
    "Special"      integer DEFAULT NULL REFERENCES "SpecialToCategory"("SpecialID"),
    "SkinID"       integer NOT NULL DEFAULT 0,
    "Nametag"      varchar(256),
    "DateCreated"  timestamptz NOT NULL DEFAULT now(),
    "Archive" BOOLEAN  DEFAULT FALSE

    --  Контроль целостности: если предмет = оружие -> обязательны свойства оружия
    --   Если это не оружие — WeaponID должен быть NULL
    CONSTRAINT items_weapon_type_check CHECK (
        ("Type" = 1 AND "Weapon" IS NOT NULL) OR
        ("Type" <> 1 AND "Weapon" IS NULL)
    )

);

-- 4. Прев’ю предметів (винесені з Items та StickersOnWeapon)

CREATE TABLE IF NOT EXISTS "ItemPreviews"
(
    "ItemID"  integer PRIMARY KEY REFERENCES "Items" ("ID") ON DELETE CASCADE,
    "Preview" bytea 
);

-- 5. Транзакції

CREATE TABLE IF NOT EXISTS "Transactions"
(
    "TransactionID" SERIAL PRIMARY KEY,
    "SellerID"      integer REFERENCES "Users" ("ID"),
    "BuyerID"       integer REFERENCES "Users" ("ID"),
    "ItemID"        integer REFERENCES "Items" ("ID"),
    "Price"         integer NOT NULL,
    "Date"          timestamptz NOT NULL DEFAULT now(),
    "Canceled"      BOOLEAN DEFAULT false,
    "Archive"       BOOLEAN DEFAULT FALSE
);


CREATE INDEX IF NOT EXISTS idx_items_owner ON "Items"("OwnerID");
CREATE INDEX IF NOT EXISTS idx_items_type  ON "Items"("Type");
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON "Transactions"("BuyerID");
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON "Transactions"("SellerID");
-- ==============================
-- ФУНКЦИЯ ДЛЯ ОБРАБОТКИ ТРАНЗАКЦИЙ
-- ==============================

CREATE OR REPLACE FUNCTION process_item_transaction()
RETURNS trigger AS $$
DECLARE
    buyer_balance integer;
    item_owner    integer;
BEGIN
    -- Проверяем владельца предмета
    SELECT "OwnerID" INTO item_owner
    FROM "Items" WHERE "ID" = NEW."ItemID";

    IF item_owner IS NULL THEN
        RAISE EXCEPTION 'Предмет % не существует', NEW."ItemID";
    END IF;

    IF item_owner <> NEW."SellerID" THEN
        RAISE EXCEPTION 'Пользователь % не владеет предметом %',
                        NEW."SellerID", NEW."ItemID";
    END IF;

    -- Проверка баланса покупателя
    SELECT "Balance" INTO buyer_balance
    FROM "Users" WHERE "ID" = NEW."BuyerID";

    IF buyer_balance < NEW."Price" THEN
        RAISE EXCEPTION 'Недостаточно средств у покупателя % (% < %)',
                        NEW."BuyerID", buyer_balance, NEW."Price";
    END IF;

    -- Списание/начисление
    UPDATE "Users"
        SET "Balance" = "Balance" - NEW."Price"
        WHERE "ID" = NEW."BuyerID";

    UPDATE "Users"
        SET "Balance" = "Balance" + NEW."Price"
        WHERE "ID" = NEW."SellerID";

    -- Передача предмета
    UPDATE "Items"
        SET "OwnerID" = NEW."BuyerID"
        WHERE "ID" = NEW."ItemID";

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================
-- ТРИГГЕР НА TRANSACTIONS
-- ==============================

CREATE TRIGGER trg_process_transaction
AFTER INSERT ON "Transactions"
FOR EACH ROW
EXECUTE FUNCTION process_item_transaction();

CREATE OR REPLACE FUNCTION process_transaction_cancel()
RETURNS trigger AS $$
DECLARE
    current_owner int;
BEGIN
    -- Выполняем только при смене Canceled с false на true
    IF NEW."Canceled" = TRUE AND OLD."Canceled" = FALSE THEN

        -- Проверка, что предмет сейчас у покупателя
        SELECT "OwnerID" INTO current_owner FROM "Items" WHERE "ID" = NEW."ItemID";

        IF current_owner <> NEW."BuyerID" THEN
            RAISE EXCEPTION 'Отмена невозможна — предмет уже не у покупателя';
        END IF;

        -- Вернуть владельца обратно продавцу
        UPDATE "Items"
        SET "OwnerID" = NEW."SellerID"
        WHERE "ID" = NEW."ItemID";

        -- Вернуть деньги
        UPDATE "Users" SET "Balance" = "Balance" - NEW."Price" WHERE "ID" = NEW."SellerID";
        UPDATE "Users" SET "Balance" = "Balance" + NEW."Price" WHERE "ID" = NEW."BuyerID";

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cancel_transaction
AFTER UPDATE ON "Transactions"
FOR EACH ROW
EXECUTE FUNCTION process_transaction_cancel();

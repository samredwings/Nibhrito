-- Convert the legacy string columns without dropping their existing values.
CREATE TYPE "MemoryType" AS ENUM ('FACT', 'EPISODE', 'RELATIONSHIP', 'WORLD');
CREATE TYPE "MemoryScope" AS ENUM ('GLOBAL', 'SESSION', 'CHARACTER');

-- Every pre-existing value must be a member of the new contract enum.
-- Invalid legacy values intentionally fail the migration rather than being discarded.
ALTER TABLE "Memory"
  ALTER COLUMN "type" TYPE "MemoryType"
  USING ("type"::"MemoryType");

ALTER TABLE "Memory"
  ALTER COLUMN "scope" DROP DEFAULT;

ALTER TABLE "Memory"
  ALTER COLUMN "scope" TYPE "MemoryScope"
  USING ("scope"::"MemoryScope");

ALTER TABLE "Memory"
  ALTER COLUMN "scope" SET DEFAULT 'GLOBAL'::"MemoryScope";

-- The previous scalar was not used by the API. Preserve a non-empty legacy
-- value as one array item; an empty value becomes an empty array.
ALTER TABLE "SceneState"
  ALTER COLUMN "presentIds" TYPE TEXT[]
  USING (
    CASE
      WHEN btrim("presentIds") = '' THEN ARRAY[]::TEXT[]
      ELSE ARRAY["presentIds"]::TEXT[]
    END
  );

ALTER TABLE "SceneState"
  ALTER COLUMN "presentIds" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "SceneState"
  ALTER COLUMN "presentIds" SET NOT NULL;

-- Generator 2.4.0 (spec P0-2): the LLC's state of formation, separate from
-- the mailing-address state. Additive and nullable: existing rows keep NULL.
ALTER TABLE "Filing" ADD COLUMN "llcFormationState" TEXT;

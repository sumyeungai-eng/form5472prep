-- Protect Message rows from accidental DELETE.
--
-- Why: Messages are the customer↔admin support thread for a filing — losing
-- them is a real data-integrity event. Production code already never deletes
-- messages, but ad-hoc scripts or future code changes could. A BEFORE DELETE
-- trigger gives us a hard floor: a row delete cannot succeed unless the
-- caller explicitly opted in via a session-local config flag for that
-- transaction. The flag must be set inside the same transaction (SET LOCAL)
-- so it can't leak across requests.
--
-- Allowed callers today: the `DELETE /api/filings/[id]` handler, which only
-- deletes DRAFT filings and needs cascade to clean up Message rows that the
-- customer happened to post on their own draft.
--
-- To delete messages manually from psql or a script, wrap the operation:
--   BEGIN;
--   SET LOCAL form5472.allow_message_delete = 'true';
--   DELETE FROM "Message" WHERE ...;
--   COMMIT;

CREATE OR REPLACE FUNCTION prevent_message_delete()
RETURNS trigger AS $$
BEGIN
  IF current_setting('form5472.allow_message_delete', true) = 'true' THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'DELETE on "Message" is blocked. Set form5472.allow_message_delete=true inside a transaction to allow.'
    USING ERRCODE = 'check_violation';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS block_message_delete ON "Message";

CREATE TRIGGER block_message_delete
  BEFORE DELETE ON "Message"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_message_delete();

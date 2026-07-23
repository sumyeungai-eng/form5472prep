-- Second (1-month) abandoned-draft reminder tracking.
ALTER TABLE "Filing" ADD COLUMN     "abandonedReminderSent2At" TIMESTAMP(3);

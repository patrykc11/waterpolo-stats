/*
  Warnings:

  - You are about to drop the column `excl_committed_location` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `excl_drawn_location` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_assist` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_bad_pass_2m` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_bad_pass_no_turnover` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_bad_pass_turnover` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_block_hand` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_excl_committed` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_excl_drawn` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_goal_5m` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_goal_counter` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_goal_from_center` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_goal_from_play` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_goal_putback` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_interception` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_no_block` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_no_return` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_penalty_committed` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_penalty_drawn` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_press_win` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_shot_clock_violation` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_shot_miss_reset30` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_shot_miss_turnover` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_shot_out` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_shot_saved_gk` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_steal` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_turnover` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `is_turnover_1v1` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `penalty_committed_location` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `penalty_drawn_location` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `phase` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `shot_zone` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "excl_committed_location",
DROP COLUMN "excl_drawn_location",
DROP COLUMN "is_assist",
DROP COLUMN "is_bad_pass_2m",
DROP COLUMN "is_bad_pass_no_turnover",
DROP COLUMN "is_bad_pass_turnover",
DROP COLUMN "is_block_hand",
DROP COLUMN "is_excl_committed",
DROP COLUMN "is_excl_drawn",
DROP COLUMN "is_goal_5m",
DROP COLUMN "is_goal_counter",
DROP COLUMN "is_goal_from_center",
DROP COLUMN "is_goal_from_play",
DROP COLUMN "is_goal_putback",
DROP COLUMN "is_interception",
DROP COLUMN "is_no_block",
DROP COLUMN "is_no_return",
DROP COLUMN "is_penalty_committed",
DROP COLUMN "is_penalty_drawn",
DROP COLUMN "is_press_win",
DROP COLUMN "is_shot_clock_violation",
DROP COLUMN "is_shot_miss_reset30",
DROP COLUMN "is_shot_miss_turnover",
DROP COLUMN "is_shot_out",
DROP COLUMN "is_shot_saved_gk",
DROP COLUMN "is_steal",
DROP COLUMN "is_turnover",
DROP COLUMN "is_turnover_1v1",
DROP COLUMN "location",
DROP COLUMN "penalty_committed_location",
DROP COLUMN "penalty_drawn_location",
DROP COLUMN "phase",
DROP COLUMN "shot_zone",
ADD COLUMN     "is_assist_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_assist_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_bad_pass_no_turnover_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_bad_pass_no_turnover_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_bad_pass_turnover_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_bad_pass_turnover_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_block_hand_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_block_hand_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_excl_committed_center_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_excl_committed_center_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_excl_committed_field_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_excl_committed_field_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_excl_drawn_center_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_excl_drawn_field_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_goal_5m_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_goal_5m_penalty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_goal_from_center_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_goal_from_center_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_goal_from_play_counter" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_goal_from_play_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_no_block_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_no_block_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_no_return_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_no_return_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_penalty_committed_center_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_penalty_committed_center_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_penalty_committed_field_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_penalty_committed_field_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_penalty_drawn_center_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_penalty_drawn_field_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_shot_clock_violation_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_shot_clock_violation_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_shot_miss_reset30_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_shot_miss_reset30_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_shot_miss_turnover_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_shot_miss_turnover_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_shot_saved_gk_def_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_shot_saved_gk_def_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_shot_saved_gk_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_shot_saved_gk_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_steal_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_steal_positional" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_turnover_1v1_man_up" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "is_turnover_1v1_positional" INTEGER NOT NULL DEFAULT 0;

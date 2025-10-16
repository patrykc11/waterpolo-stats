-- CreateTable
CREATE TABLE "settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "activeMatch" TEXT NOT NULL DEFAULT '',
    "quarter" INTEGER NOT NULL DEFAULT 1,
    "editorPIN" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "team" TEXT NOT NULL DEFAULT 'my',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "date" TEXT NOT NULL DEFAULT '',
    "opponent" TEXT NOT NULL DEFAULT '',
    "place" TEXT NOT NULL DEFAULT '',
    "q1_my" INTEGER NOT NULL DEFAULT 0,
    "q1_opp" INTEGER NOT NULL DEFAULT 0,
    "q2_my" INTEGER NOT NULL DEFAULT 0,
    "q2_opp" INTEGER NOT NULL DEFAULT 0,
    "q3_my" INTEGER NOT NULL DEFAULT 0,
    "q3_opp" INTEGER NOT NULL DEFAULT 0,
    "q4_my" INTEGER NOT NULL DEFAULT 0,
    "q4_opp" INTEGER NOT NULL DEFAULT 0,
    "final_my" INTEGER NOT NULL DEFAULT 0,
    "final_opp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_roster" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "team" TEXT NOT NULL DEFAULT 'my',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_roster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "match_id" TEXT NOT NULL,
    "quarter" INTEGER NOT NULL DEFAULT 1,
    "team" TEXT NOT NULL DEFAULT 'my',
    "player_id" TEXT NOT NULL,
    "player_name" TEXT NOT NULL,
    "event_type" TEXT NOT NULL DEFAULT '',
    "subtype" TEXT NOT NULL DEFAULT '',
    "value" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "phase" TEXT NOT NULL DEFAULT 'positional',
    "location" TEXT NOT NULL DEFAULT '',
    "shot_zone" TEXT NOT NULL DEFAULT '',
    "is_goal_from_play" INTEGER NOT NULL DEFAULT 0,
    "is_goal_from_center" INTEGER NOT NULL DEFAULT 0,
    "is_goal_putback" INTEGER NOT NULL DEFAULT 0,
    "is_goal_5m" INTEGER NOT NULL DEFAULT 0,
    "is_assist" INTEGER NOT NULL DEFAULT 0,
    "is_excl_drawn" INTEGER NOT NULL DEFAULT 0,
    "excl_drawn_location" TEXT NOT NULL DEFAULT '',
    "is_excl_committed" INTEGER NOT NULL DEFAULT 0,
    "excl_committed_location" TEXT NOT NULL DEFAULT '',
    "is_penalty_drawn" INTEGER NOT NULL DEFAULT 0,
    "penalty_drawn_location" TEXT NOT NULL DEFAULT '',
    "is_penalty_committed" INTEGER NOT NULL DEFAULT 0,
    "penalty_committed_location" TEXT NOT NULL DEFAULT '',
    "is_turnover" INTEGER NOT NULL DEFAULT 0,
    "is_turnover_1v1" INTEGER NOT NULL DEFAULT 0,
    "is_shot_saved_gk" INTEGER NOT NULL DEFAULT 0,
    "is_shot_miss_turnover" INTEGER NOT NULL DEFAULT 0,
    "is_shot_miss_reset30" INTEGER NOT NULL DEFAULT 0,
    "is_bad_pass_turnover" INTEGER NOT NULL DEFAULT 0,
    "is_bad_pass_no_turnover" INTEGER NOT NULL DEFAULT 0,
    "is_shot_clock_violation" INTEGER NOT NULL DEFAULT 0,
    "is_steal" INTEGER NOT NULL DEFAULT 0,
    "is_block_hand" INTEGER NOT NULL DEFAULT 0,
    "is_no_block" INTEGER NOT NULL DEFAULT 0,
    "is_no_return" INTEGER NOT NULL DEFAULT 0,
    "is_goal_counter" INTEGER NOT NULL DEFAULT 0,
    "is_shot_out" INTEGER NOT NULL DEFAULT 0,
    "is_bad_pass_2m" INTEGER NOT NULL DEFAULT 0,
    "is_press_win" INTEGER NOT NULL DEFAULT 0,
    "is_interception" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "players_player_id_key" ON "players"("player_id");

-- CreateIndex
CREATE UNIQUE INDEX "matches_match_id_key" ON "matches"("match_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_roster_match_id_player_id_key" ON "match_roster"("match_id", "player_id");

-- CreateIndex
CREATE INDEX "events_match_id_quarter_idx" ON "events"("match_id", "quarter");

-- AddForeignKey
ALTER TABLE "match_roster" ADD CONSTRAINT "match_roster_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("match_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_roster" ADD CONSTRAINT "match_roster_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("player_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("match_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("player_id") ON DELETE CASCADE ON UPDATE CASCADE;

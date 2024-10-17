import { Schema, model } from "mongoose";
import { ITournament } from "../../types/interfaces/Tournament";

const tournamentPlayerSchema = new Schema({
  name: { type: String, required: true },
  avatar: { type: String, required: true },
  elo: { type: Number, required: true, default: 1000 }, // Setting a default value for elo
  ranks: { type: [Number], default: [] }, // Default to an empty array
  eliminated: { type: Boolean, default: false }, // Default to false
});

const tournamentBracketSchema = new Schema({
  name: { type: String, required: true },
  playersId: { type: [String], required: true },
  finished: { type: Boolean, default: false }, // Default to false
});

const tournamentSchema = new Schema<ITournament>({
  name: { type: String, required: true },
  startDate: { type: String, required: true }, // Ensure date is a string format (consider using Date type)
  players: {
    type: Map,
    of: tournamentPlayerSchema,
  },
  brackets: {
    type: Map,
    of: tournamentBracketSchema,
  },
  finished: { type: Boolean, default: false }, // Default to false
});

// Create the Tournament model
export const Tournament = model<ITournament>("Tournament", tournamentSchema);

export default Tournament;

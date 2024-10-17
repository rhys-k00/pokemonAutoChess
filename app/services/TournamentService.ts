import { Tournament } from '../models/mongo-models/tournament';
import { ITournament } from '../../types/interfaces/Tournament';

class TournamentService {
  // Get a tournament by ID
  async getTournamentById(tournamentId: string): Promise<ITournament | null> {
    try {
      const tournament = await Tournament.findById(tournamentId);
      return tournament; // Returns the found tournament or null if not found
    } catch (error) {
      console.error(`Error retrieving tournament with ID ${tournamentId}:`, error);
      throw error; // Rethrow or handle the error as needed
    }
  }

  // Save a tournament to the database
  async saveTournament(tournamentData: ITournament): Promise<ITournament> {
    try {
      const tournament = new Tournament(tournamentData);
      const savedTournament = await tournament.save(); // Save the tournament to MongoDB
      return savedTournament; // Returns the saved tournament
    } catch (error) {
      console.error(`Error saving tournament:`, error);
      throw error; // Rethrow or handle the error as needed
    }
  }
}

export default new TournamentService(); // Export an instance of the service

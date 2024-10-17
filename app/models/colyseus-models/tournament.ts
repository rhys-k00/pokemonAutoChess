import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema"
import {
  ITournament,
  ITournamentBracket,
  ITournamentPlayer,
} from "../../types/interfaces/Tournament"
import { resetArraySchema } from "../../utils/schemas"

// Utility function to convert ArraySchema to a regular array
function arraySchemaToArray(arrSchema: ArraySchema<number>): number[] {
  return [...arrSchema];
}

// Utility function to convert a regular array to ArraySchema
function arrayToSchemaArray(arr: number[]): ArraySchema<number> {
  const arraySchema = new ArraySchema<number>();
  arr.forEach(value => arraySchema.push(value));
  return arraySchema;
}

export class TournamentPlayerSchema
  extends Schema
  implements ITournamentPlayer
{
  @type("string") name: string
  @type("string") avatar: string
  @type("number") elo: number
  @type(["number"]) ranks = new ArraySchema<number>()
  @type("boolean") eliminated: boolean

  constructor(
    name: string,
    avatar: string,
    elo: number,
    ranks: number[] | ArraySchema<number> = [],
    eliminated: boolean = false,
  ) {
    super()
    this.name = name
    this.avatar = avatar
    this.elo = elo
    resetArraySchema(this.ranks, ranks)
    this.eliminated = eliminated
  }

  // Convert player data to a plain object for MongoDB saving
  toPlainObject() {
    return {
      name: this.name,
      avatar: this.avatar,
      elo: this.elo,
      ranks: arraySchemaToArray(this.ranks),  // Convert ranks for MongoDB
      eliminated: this.eliminated
    };
  }

  // Load player data from plain object (MongoDB) into ArraySchema for Colyseus
  static fromPlainObject(data: any) {
    return new TournamentPlayerSchema(
      data.name,
      data.avatar,
      data.elo,
      arrayToSchemaArray(data.ranks),  // Convert ranks back to ArraySchema
      data.eliminated
    );
  }
}

export class TournamentBracketSchema
  extends Schema
  implements ITournamentBracket
{
  @type("string") name: string
  @type(["string"]) playersId = new ArraySchema<string>()
  @type("boolean") finished: boolean

  constructor(
    name: string,
    playersId: string[] | ArraySchema<string>,
    finished: boolean = false,
  ) {
    super()
    this.name = name
    this.finished = finished
    resetArraySchema(this.playersId, playersId)
  }
}

export class TournamentSchema extends Schema implements ITournament {
  @type("string") id: string
  @type("string") name: string
  @type("string") startDate: string
  @type({ map: TournamentPlayerSchema }) players =
    new MapSchema<TournamentPlayerSchema>()
  @type({ map: TournamentBracketSchema }) brackets =
    new MapSchema<TournamentBracketSchema>()
  @type("boolean") finished: boolean

  constructor(
    id: string,
    name: string,
    startDate: string,
    players: Map<string, ITournamentPlayer>,
    brackets: Map<string, ITournamentBracket>,
    finished: boolean = false,
  ) {
    super()
    this.id = id
    this.name = name
    this.startDate = startDate
    this.finished = finished

    if (players && players.size) {
      players.forEach((p, key) => {
        this.players.set(
          key,
          new TournamentPlayerSchema(
            p.name,
            p.avatar,
            p.elo,
            p.ranks,
            p.eliminated,
          ),
        )
      })
    }

    if (brackets && brackets.size) {
      brackets.forEach((b, bracketId) => {
        this.brackets.set(
          bracketId,
          new TournamentBracketSchema(b.name, b.playersId, b.finished),
        )
      })
    }
  }

  // Convert tournament data to a plain object for MongoDB saving
  toPlainObject() {
    return {
      id: this.id,
      name: this.name,
      startDate: this.startDate,
      finished: this.finished,
      players: Array.from(this.players.entries()).reduce((acc, [id, player]) => {
        acc[id] = player.toPlainObject();
        return acc;
      }, {}),
      brackets: convertSchemaToRawObject(this.brackets) // Ensure this works with MongoDB
    };
  }

  // Load tournament data from MongoDB
  static fromPlainObject(data: any) {
    const players = new Map<string, TournamentPlayerSchema>();
    Object.keys(data.players).forEach((key) => {
      players.set(key, TournamentPlayerSchema.fromPlainObject(data.players[key]));
    });

    const brackets = convertRawObjectToSchema(data.brackets);

    return new TournamentSchema(
      data.id,
      data.name,
      data.startDate,
      players,
      brackets,
      data.finished
    );
  }
}

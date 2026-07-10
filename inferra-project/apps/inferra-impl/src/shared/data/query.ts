import { Inject, Injectable } from "@nestjs/common";
import { DATABASE, type Database } from "../../database/database.module";
@Injectable()
export class QueryService {
  constructor(@Inject(DATABASE) readonly db: Database) {}
}

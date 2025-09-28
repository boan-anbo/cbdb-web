import { eq, like, and, gte, lte, sql, desc } from 'drizzle-orm';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { BIOG_MAIN } from '../../drizzle/schema';
import { Person, PersonRow } from '../models/Person';

export class PersonRepository {
  constructor(private db: LibSQLDatabase<any>) {}

  // Find person by ID
  async findById(id: number): Promise<Person | null> {
    const row = await this.db
      .select()
      .from(BIOG_MAIN)
      .where(eq(BIOG_MAIN.c_personid, id))
      .get();

    return row ? new Person(row) : null;
  }

  // Find persons by Chinese name (partial match)
  async findByChineseName(name: string): Promise<Person[]> {
    const rows = await this.db
      .select()
      .from(BIOG_MAIN)
      .where(like(BIOG_MAIN.c_name_chn, `%${name}%`))
      .limit(100);

    return rows.map(row => new Person(row));
  }

  // Find persons by dynasty code
  async findByDynastyCode(dynastyCode: number, limit = 100): Promise<Person[]> {
    const rows = await this.db
      .select()
      .from(BIOG_MAIN)
      .where(eq(BIOG_MAIN.c_dy, dynastyCode))
      .limit(limit);

    return rows.map(row => new Person(row));
  }

  // Find persons by birth year range
  async findByBirthYearRange(startYear: number, endYear: number): Promise<Person[]> {
    const rows = await this.db
      .select()
      .from(BIOG_MAIN)
      .where(
        and(
          gte(BIOG_MAIN.c_birthyear, startYear),
          lte(BIOG_MAIN.c_birthyear, endYear)
        )
      )
      .limit(100);

    return rows.map(row => new Person(row));
  }

  // Get total count
  async count(): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(BIOG_MAIN)
      .get();

    return result?.count ?? 0;
  }

  // Get dynasty statistics
  async getDynastyStatistics(): Promise<Array<{ dynastyCode: number | null; count: number }>> {
    const results = await this.db
      .select({
        dynastyCode: BIOG_MAIN.c_dy,
        count: sql<number>`COUNT(*)`,
      })
      .from(BIOG_MAIN)
      .groupBy(BIOG_MAIN.c_dy)
      .orderBy(desc(sql`COUNT(*)`));

    return results.map(r => ({
      dynastyCode: r.dynastyCode,
      count: r.count,
    }));
  }

  // Complex query: Find persons with longest lifespan in a dynasty
  async findLongestLivedInDynastyCode(dynastyCode: number, limit = 10): Promise<Person[]> {
    const rows = await this.db
      .select()
      .from(BIOG_MAIN)
      .where(
        and(
          eq(BIOG_MAIN.c_dy, dynastyCode),
          sql`${BIOG_MAIN.c_birthyear} IS NOT NULL`,
          sql`${BIOG_MAIN.c_deathyear} IS NOT NULL`,
          sql`${BIOG_MAIN.c_deathyear} > ${BIOG_MAIN.c_birthyear}`
        )
      )
      .orderBy(desc(sql`${BIOG_MAIN.c_deathyear} - ${BIOG_MAIN.c_birthyear}`))
      .limit(limit);

    return rows.map(row => new Person(row));
  }
}
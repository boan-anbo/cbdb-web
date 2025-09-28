import { InferSelectModel } from 'drizzle-orm';
import { BIOG_MAIN } from '../../drizzle/schema';

// Type extracted from the Drizzle schema
export type PersonRow = InferSelectModel<typeof BIOG_MAIN>;

// Domain model with cleaner API
export class Person {
  id: number;
  chineseName: string | null;
  englishName: string | null;
  surname: string | null;
  mingzi: string | null;
  birthYear: number | null;
  deathYear: number | null;
  dynastyCode: number | null;

  constructor(row: PersonRow) {
    this.id = row.c_personid;
    this.chineseName = row.c_name_chn;
    this.englishName = row.c_name;
    this.surname = row.c_surname_chn;
    this.mingzi = row.c_mingzi_chn;
    this.birthYear = row.c_birthyear;
    this.deathYear = row.c_deathyear;
    this.dynastyCode = row.c_dy;
  }

  get displayName(): string {
    return this.chineseName || this.englishName || this.surname || `Person ${this.id}`;
  }

  get dynasty(): string {
    // Map dynasty codes to names (simplified mapping)
    const dynastyMap: Record<number, string> = {
      1: '漢',
      2: '唐',
      3: '宋',
      4: '元',
      5: '明',
      6: '清',
      // Add more mappings as needed
    };
    return this.dynastyCode ? (dynastyMap[this.dynastyCode] || `Dynasty ${this.dynastyCode}`) : 'Unknown';
  }

  get lifespan(): string {
    if (this.birthYear && this.deathYear) {
      return `${this.birthYear}-${this.deathYear}`;
    } else if (this.birthYear) {
      return `b. ${this.birthYear}`;
    } else if (this.deathYear) {
      return `d. ${this.deathYear}`;
    }
    return 'dates unknown';
  }

  get age(): number | null {
    if (this.birthYear && this.deathYear) {
      return this.deathYear - this.birthYear;
    }
    return null;
  }

  toJSON() {
    return {
      id: this.id,
      displayName: this.displayName,
      chineseName: this.chineseName,
      englishName: this.englishName,
      dynasty: this.dynasty,
      lifespan: this.lifespan,
      age: this.age,
    };
  }
}
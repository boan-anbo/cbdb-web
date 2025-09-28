/**
 * NianHao Model - Reign periods in Chinese history
 * Maps directly to the NIAN_HAO table
 */
export class NianHao {
  id: number | null = null;
  dynastyCode: number | null = null;
  dynastyChn: string | null = null;
  nianhaoChn: string | null = null;
  nianhaoPinyin: string | null = null;
  firstYear: number | null = null;
  lastYear: number | null = null;

  constructor(partial?: Partial<NianHao>) {
    Object.assign(this, partial);
  }
}
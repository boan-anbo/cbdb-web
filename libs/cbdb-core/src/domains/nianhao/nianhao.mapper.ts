import { NIAN_HAO } from '../../schemas/schema';
import { NianHao } from './models/nianhao.model';
import { toNumberOrNull, toStringOrNull } from '../../utils/type-conversions';

type NianHaoRecord = typeof NIAN_HAO.$inferSelect;

/**
 * NianHao mapper - converts database records to model instances
 */
export class NianHaoMapper {
  /**
   * Convert database record to NianHao model
   */
  fromDb(record: NianHaoRecord): NianHao {
    return new NianHao({
      id: toNumberOrNull(record.c_nianhao_id),
      dynastyCode: toNumberOrNull(record.c_dy),
      dynastyChn: toStringOrNull(record.c_dynasty_chn),
      nianhaoChn: toStringOrNull(record.c_nianhao_chn),
      nianhaoPinyin: toStringOrNull(record.c_nianhao_pin),
      firstYear: toNumberOrNull(record.c_firstyear),
      lastYear: toNumberOrNull(record.c_lastyear),
    });
  }

  /**
   * Convert multiple database records to NianHao models
   */
  fromDbArray(records: NianHaoRecord[]): NianHao[] {
    return records.map(record => this.fromDb(record));
  }
}
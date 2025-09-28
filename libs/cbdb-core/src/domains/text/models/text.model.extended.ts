/**
 * Extended Text models with nested relations
 * These models include related data from joined tables
 * All arrays are required (use [] for empty, never undefined)
 */

import { Text } from './text.model';

/**
 * Text information from TEXT_CODES table
 */
export class TextInfo {
  constructor(
    public id: number,
    public title: string | null,
    public titleChn: string | null,
    public textType: string | null,
    public textYear: number | null,
    public suffixVersion: string | null,
    public titleTranslated: string | null
  ) {}
}

/**
 * Role information from TEXT_ROLE_CODES table
 */
export class TextRoleInfo {
  constructor(
    public id: number,
    public roleDesc: string | null,
    public roleDescChn: string | null
  ) {}
}

/**
 * Text with text information
 * Includes data from TEXT_CODES join
 */
export class TextWithTextInfo extends Text {
  public textInfo: TextInfo = new TextInfo(0, null, null, null, null, null, null);
}

/**
 * Text with role information
 * Includes data from TEXT_ROLE_CODES join
 */
export class TextWithRoleInfo extends Text {
  public roleInfo: TextRoleInfo = new TextRoleInfo(0, null, null);
}

/**
 * Text with all relations loaded
 * Includes both TEXT_CODES and TEXT_ROLE_CODES data
 */
export class TextWithFullRelations extends Text {
  public textInfo: TextInfo = new TextInfo(0, null, null, null, null, null, null);
  public roleInfo: TextRoleInfo = new TextRoleInfo(0, null, null);
}
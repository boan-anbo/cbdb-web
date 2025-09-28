/**
 * Domain model for Kinship Codes (KINSHIP_CODES table)
 * Provides mappings between kinship codes and their descriptions
 */
export class KinshipCode {
  constructor(
    /**
     * c_kincode
     * Unique kinship code identifier
     * Examples: 0=U (Unknown), 75=F (Father), 111=M (Mother)
     */
    public code: number,
    /**
     * c_kinrel
     * English kinship relationship abbreviation
     * Examples: U (Unknown), F (Father), M (Mother), S (Son), D (Daughter)
     */
    public kinRel: string | null,
    /**
     * c_kinrel_chn
     * Chinese kinship relationship description
     * Examples: 未詳 (Unknown), 父 (Father), 母 (Mother), 子 (Son), 女 (Daughter)
     */
    public kinRelChn: string | null,
    /**
     * c_kinrel_simplified
     * Simplified Chinese kinship relationship description
     */
    public kinRelSimplified: string | null,
    /**
     * c_kin_pair1
     * First part of kinship pair code (for compound relationships)
     */
    public kinPair1: number | null,
    /**
     * c_kin_pair2
     * Second part of kinship pair code (for compound relationships)
     */
    public kinPair2: number | null,
    /**
     * c_kin_pair_notes
     * Notes about the kinship pair relationship
     */
    public kinPairNotes: string | null,
  ) {}

  /**
   * Get a formatted display string for the kinship code
   * Format: "Code - Chinese (English)"
   * Example: "U - 未詳 (Unknown)"
   */
  getDisplayString(): string {
    const parts: string[] = [];

    if (this.kinRel) {
      parts.push(this.kinRel);
    }

    if (this.kinRelChn) {
      parts.push(this.kinRelChn);
    }

    if (this.kinRel && this.kinRelChn) {
      return `${this.kinRel} - ${this.kinRelChn}`;
    } else if (this.kinRel || this.kinRelChn) {
      return parts[0];
    }

    return `Code ${this.code}`;
  }

  /**
   * Get a full formatted display string with English translation
   * Format: "Code - Chinese (English full)"
   * Example: "F - 父 (Father)"
   */
  getFullDisplayString(): string {
    const englishFull = this.getEnglishDescription();

    if (this.kinRel && this.kinRelChn && englishFull) {
      return `${this.kinRel} - ${this.kinRelChn} (${englishFull})`;
    }

    return this.getDisplayString();
  }

  /**
   * Get the full English description based on the abbreviation
   */
  private getEnglishDescription(): string | null {
    // Common kinship abbreviation mappings
    const abbrevMap: Record<string, string> = {
      'U': 'Unknown',
      'F': 'Father',
      'M': 'Mother',
      'S': 'Son',
      'D': 'Daughter',
      'B': 'Brother',
      'Z': 'Sister',
      'H': 'Husband',
      'W': 'Wife',
      'FF': 'Paternal Grandfather',
      'FM': 'Paternal Grandmother',
      'MF': 'Maternal Grandfather',
      'MM': 'Maternal Grandmother',
      'FB': 'Father\'s Brother',
      'FZ': 'Father\'s Sister',
      'MB': 'Mother\'s Brother',
      'MZ': 'Mother\'s Sister',
      'BS': 'Brother\'s Son',
      'BD': 'Brother\'s Daughter',
      'ZS': 'Sister\'s Son',
      'ZD': 'Sister\'s Daughter',
      'SS': 'Son\'s Son',
      'SD': 'Son\'s Daughter',
      'DS': 'Daughter\'s Son',
      'DD': 'Daughter\'s Daughter',
    };

    if (this.kinRel && abbrevMap[this.kinRel]) {
      return abbrevMap[this.kinRel];
    }

    return null;
  }
}
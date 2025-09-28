/**
 * AssociationTableModel - Raw ASSOC_DATA table representation
 *
 * TableModel Level (Level 1 of 4-level hierarchy)
 * - NO joins whatsoever
 * - Direct mapping of database fields
 * - Maximum flexibility for custom queries
 *
 * From SCHEMA_ANNOTATED.md:
 * Purpose: 記錄人物之間的社會關係，是CBDB中最重要的社會網絡數據。包括文學交往、政治關係、學術交流等
 * Records social associations between individuals. Most important social network data in CBDB.
 *
 * Row Count: 598,000
 * Most common types:
 * - 437 = 贈詩、文 sent poems/writings (11,838 records)
 * - 429 = 致書Y sent letter to Y (9,760 records)
 * - 43 = 墓誌銘由Y所作 epitaph by Y (8,673 records)
 * - 9 = 友 friend (6,702 records)
 */
export class AssociationTableModel {
  constructor(
    /**
     * c_personid
     * 人物唯一標識符，作為所有表格的主鍵
     * Unique person identifier used as primary key across all tables
     */
    public personId: number,

    /**
     * c_assoc_id
     * 社會關係編號 (ID of associated person)
     * Association relationship ID
     */
    public assocId: number,

    /**
     * c_assoc_code
     * 社會關係類型代碼 (requires join with ASSOC_CODES for description)
     * Social association type code
     */
    public assocCode: number,

    /**
     * c_assoc_personid
     * 關聯人物編號 (same as assocId in most cases)
     * Associated person ID
     */
    public assocPersonId: number | null,

    /**
     * c_kin_code
     * 親屬關係類型代碼 (requires join with KINSHIP_CODES for description)
     * Kinship relationship type code
     */
    public kinCode: number | null,

    /**
     * c_kin_id
     * 親屬關係編號
     * Kinship relationship ID
     */
    public kinId: number | null,

    /**
     * c_assoc_kin_code
     * 關聯親屬代碼 (requires join with KINSHIP_CODES for description)
     * Associated kinship code
     */
    public assocKinCode: number | null,

    /**
     * c_assoc_kin_id
     * 關聯親屬編號
     * Associated kinship ID
     */
    public assocKinId: number | null,

    /**
     * c_tertiary_personid
     * 第三方人物編號
     * Tertiary person ID
     */
    public tertiaryPersonId: number | null,

    /**
     * c_tertiary_type_notes
     * 第三方類型備註
     * Tertiary type notes
     */
    public tertiaryTypeNotes: string | null,

    /**
     * c_assoc_count
     * 關聯計數
     * Association count
     */
    public assocCount: number | null,

    /**
     * c_sequence
     * 同類型多項的排序
     * Order of multiple items of same type
     */
    public sequence: number | null,

    /**
     * c_assoc_first_year
     * 關聯起始年
     * Association start year
     */
    public firstYear: number | null,

    /**
     * c_assoc_last_year
     * 關聯結束年
     * Association end year
     */
    public lastYear: number | null,

    /**
     * c_source
     * 來源文獻編號 (requires join with TEXT_CODES for title)
     * Source text ID
     */
    public source: string | null,

    /**
     * c_pages
     * 頁碼引用
     * Page references
     */
    public pages: string | null,

    /**
     * c_notes
     * 備註
     * Notes
     */
    public notes: string | null,

    // First year details (reign period dating)
    public firstYearNhCode: number | null,  // 關聯起始年年號代碼
    public firstYearNhYear: number | null,  // 關聯起始年年號年份
    public firstYearRange: number | null,   // 關聯起始年範圍標記
    public firstYearIntercalary: string,    // 關聯起始年閏月標記
    public firstYearMonth: number | null,   // 關聯起始月份
    public firstYearDay: number | null,     // 關聯起始日期
    public firstYearDayGz: string | null,   // 關聯起始日干支

    // Last year details (reign period dating)
    public lastYearNhCode: number | null,   // 關聯結束年年號代碼
    public lastYearNhYear: number | null,   // 關聯結束年年號年份
    public lastYearRange: number | null,    // 關聯結束年範圍標記
    public lastYearIntercalary: string,     // 關聯結束年閏月標記
    public lastYearMonth: number | null,    // 關聯結束月份
    public lastYearDay: number | null,      // 關聯結束日期
    public lastYearDayGz: string | null,    // 關聯結束日干支

    /**
     * c_text_title
     * 相關文本標題
     * Related text title
     */
    public textTitle: string | null,

    /**
     * c_addr_id
     * 地址編號 (requires join with ADDR_CODES for location name)
     * Address ID
     */
    public addrId: number | null,

    /**
     * c_litgenre_code
     * 文學體裁代碼
     * Literary genre code
     */
    public litGenreCode: number | null,

    /**
     * c_occasion_code
     * 場合代碼
     * Occasion code
     */
    public occasionCode: number | null,

    /**
     * c_topic_code
     * 主題代碼
     * Topic code
     */
    public topicCode: number | null,

    /**
     * c_inst_code
     * 機構代碼
     * Institution code
     */
    public instCode: number | null,

    /**
     * c_inst_name_code
     * 機構名稱代碼
     * Institution name code
     */
    public instNameCode: number | null,

    /**
     * c_assoc_claimer_id
     * 關係指證人編號
     * Association claimer ID
     */
    public assocClaimerId: number | null,

    // Audit fields
    public createdBy: string | null,
    public createdDate: string | null,
    public modifiedBy: string | null,
    public modifiedDate: string | null
  ) {}
}
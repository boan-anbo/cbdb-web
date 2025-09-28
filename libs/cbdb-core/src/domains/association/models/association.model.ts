/**
 * AssociationModel - ASSOC_DATA with trivial joins (DEFAULT)
 *
 * Model Level (Level 2 of 4-level hierarchy)
 * - Includes trivial joins with code tables for human-readable descriptions
 * - This is what developers expect by default when fetching associations
 * - Follows Harvard's belongsToMany pattern
 *
 * Trivial joins included:
 * - ASSOC_CODES for association type descriptions
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
export class AssociationModel {
  constructor(
    /**
     * c_personid
     * 人物唯一標識符，作為所有表格的主鍵
     * Unique person identifier used as primary key across all tables
     */
    public personId: number,

    /**
     * c_assoc_id
     * 社會關係編號
     * Association relationship ID
     */
    public assocId: number,

    /**
     * c_assoc_code
     * 社會關係類型。最常見：437=贈詩、文(11,838筆)、429=致書Y(9,760筆)、43=墓誌銘由Y所作(8,673筆)、9=友(6,702筆)
     * Social association type. Most common: 437=sent poems/writings(11,838), 429=sent letter to Y(9,760),
     * 43=epitaph by Y(8,673), 9=friend(6,702)
     */
    public assocCode: number,

    /**
     * c_assoc_personid
     * 關聯人物編號
     * Associated person ID
     */
    public assocPersonId: number | null,

    /**
     * c_kin_code
     * 親屬關係類型代碼（如長子、姪女之夫等）
     * Kinship relationship type code (like eldest son, niece's husband, etc.)
     */
    public kinCode: number,

    /**
     * c_kin_id
     * 親屬關係編號
     * Kinship relationship ID
     */
    public kinId: number,

    /**
     * c_assoc_kin_code
     * 關聯親屬代碼
     * Associated kinship code
     */
    public assocKinCode: number,

    /**
     * c_assoc_kin_id
     * 關聯親屬編號
     * Associated kinship ID
     */
    public assocKinId: number,

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
    public firstYear: number,

    /**
     * c_assoc_last_year
     * 關聯結束年
     * Association end year
     */
    public lastYear: number | null,

    /**
     * c_source
     * 來源文獻編號
     * Source text ID
     */
    public source: number | null,

    /**
     * c_pages
     * 頁碼引用
     * Page citation
     */
    public pages: string | null,

    /**
     * c_notes
     * 備註
     * Additional notes
     */
    public notes: string | null,

    /**
     * c_assoc_fy_nh_code
     * 關聯起始年年號代碼
     * Association start year reign period code
     */
    public firstYearNhCode: number | null,

    /**
     * c_assoc_fy_nh_year
     * 關聯起始年年號年份
     * Association start year in reign period
     */
    public firstYearNhYear: number | null,

    /**
     * c_assoc_fy_range
     * 關聯起始年範圍標記
     * Association start year range indicator
     */
    public firstYearRange: number | null,

    /**
     * c_assoc_fy_intercalary
     * 關聯起始年閏月標記
     * Association start year intercalary flag
     */
    public firstYearIntercalary: string,

    /**
     * c_assoc_fy_month
     * 關聯起始月份
     * Association start month
     */
    public firstYearMonth: number | null,

    /**
     * c_assoc_fy_day
     * 關聯起始日期
     * Association start day
     */
    public firstYearDay: number | null,

    /**
     * c_assoc_fy_day_gz
     * 關聯起始日干支
     * Association start day in Ganzhi
     */
    public firstYearDayGz: string | null,

    /**
     * c_assoc_ly_nh_code
     * 關聯結束年年號代碼
     * Association end year reign period code
     */
    public lastYearNhCode: number | null,

    /**
     * c_assoc_ly_nh_year
     * 關聯結束年年號年份
     * Association end year in reign period
     */
    public lastYearNhYear: number | null,

    /**
     * c_assoc_ly_range
     * 關聯結束年範圍標記
     * Association end year range indicator
     */
    public lastYearRange: number | null,

    /**
     * c_assoc_ly_intercalary
     * 關聯結束年閏月標記
     * Association end year intercalary flag
     */
    public lastYearIntercalary: string,

    /**
     * c_assoc_ly_month
     * 關聯結束月份
     * Association end month
     */
    public lastYearMonth: number | null,

    /**
     * c_assoc_ly_day
     * 關聯結束日期
     * Association end day
     */
    public lastYearDay: number | null,

    /**
     * c_assoc_ly_day_gz
     * 關聯結束日干支
     * Association end day in Ganzhi
     */
    public lastYearDayGz: string | null,

    /**
     * c_text_title
     * 相關文本標題
     * Related text title
     */
    public textTitle: string | null,

    /**
     * c_addr_id
     * 地址編號
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
     * Association claimer/witness ID
     */
    public assocClaimerId: number | null,

    /**
     * c_created_by
     * 創建者
     * Record creator
     */
    public createdBy: string | null,

    /**
     * c_created_date
     * 創建日期
     * Record creation date
     */
    public createdDate: string | null,

    /**
     * c_modified_by
     * 修改者
     * Record modifier
     */
    public modifiedBy: string | null,

    /**
     * c_modified_date
     * 修改日期
     * Record modification date
     */
    public modifiedDate: string | null,

    // ==== TRIVIAL JOINS (Model Level) ====

    /**
     * Association type description from ASSOC_CODES join
     * 社會關係類型描述（英文）
     * e.g., "sent poems/writings", "sent letter to Y", "friend"
     */
    public assocTypeDescription?: string | null,

    /**
     * Association type description in Chinese from ASSOC_CODES join
     * 社會關係類型描述（中文）
     * e.g., "贈詩、文", "致書Y", "友"
     */
    public assocTypeDescriptionChn?: string | null,

    /**
     * Associated person name from BIOG_MAIN join
     * 關聯人物姓名（英文）
     */
    public assocPersonName?: string | null,

    /**
     * Associated person name in Chinese from BIOG_MAIN join
     * 關聯人物姓名（中文）
     */
    public assocPersonNameChn?: string | null,
  ) {}
}
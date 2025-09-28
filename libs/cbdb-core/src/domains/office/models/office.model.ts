/**
 * Domain model for Office Appointments (POSTED_TO_OFFICE_DATA table)
 * Based on SCHEMA_ANNOTATED.md documentation
 * ALL database fields are mapped to ensure completeness
 * Pure data model without utility methods
 */
export class Office {
  constructor(
    // Core identifiers
    /**
     * c_personid
     * 人物唯一標識符，作為所有表格的主鍵
     * Unique person identifier used as primary key across all tables
     */
    public personId: number | null,
    /**
     * c_office_id
     * Office編號
     * Office ID. References OFFICE_CODES for position details
     */
    public officeId: number,
    /**
     * c_posting_id
     * Posting編號
     * Posting ID. Links to POSTED_TO_ADDR_DATA for location-based postings
     */
    public postingId: number,
    /**
     * c_posting_id_old
     * 舊Posting編號
     * Old Posting ID (likely for data migration)
     */
    public postingIdOld: number | null,
    // Sequencing
    /**
     * c_sequence
     * 同類型多項的排序
     * Order of multiple items of same type
     */
    public sequence: number | null,
    // Term of service
    /**
     * c_firstyear
     * 起始年份
     * Start year of appointment. Examples: Han Qi served as Finance Commissioner 1035-1036
     */
    public firstYear: number | null,
    /**
     * c_lastyear
     * 結束年份
     * End year of appointment
     */
    public lastYear: number | null,
    // First year details (reign period dating)
    /**
     * c_fy_nh_code
     * 起始年年號代碼
     * First year reign period code
     */
    public firstYearNhCode: number | null,
    /**
     * c_fy_nh_year
     * 起始年在年號中的第幾年
     * First year within the reign period
     */
    public firstYearNhYear: number | null,
    /**
     * c_fy_range
     * 起始年不確定範圍
     * First year uncertainty range
     */
    public firstYearRange: number | null,
    /**
     * c_fy_intercalary
     * 起始年閏月標記
     * First year intercalary month flag
     */
    public firstYearIntercalary: string,
    /**
     * c_fy_month
     * 起始月份
     * First year month
     */
    public firstYearMonth: number | null,
    /**
     * c_fy_day
     * 起始日期
     * First year day
     */
    public firstYearDay: number | null,
    /**
     * c_fy_day_gz
     * 起始日干支
     * First year day in Ganzhi system
     */
    public firstYearDayGz: number | null,
    // Last year details (reign period dating)
    /**
     * c_ly_nh_code
     * 結束年年號代碼
     * Last year reign period code
     */
    public lastYearNhCode: number | null,
    /**
     * c_ly_nh_year
     * 結束年在年號中的第幾年
     * Last year within the reign period
     */
    public lastYearNhYear: number | null,
    /**
     * c_ly_range
     * 結束年不確定範圍
     * Last year uncertainty range
     */
    public lastYearRange: number | null,
    /**
     * c_ly_intercalary
     * 結束年閏月標記
     * Last year intercalary month flag
     */
    public lastYearIntercalary: string,
    /**
     * c_ly_month
     * 結束月份
     * Last year month
     */
    public lastYearMonth: number | null,
    /**
     * c_ly_day
     * 結束日期
     * Last year day
     */
    public lastYearDay: number | null,
    /**
     * c_ly_day_gz
     * 結束日干支
     * Last year day in Ganzhi system
     */
    public lastYearDayGz: number | null,
    // Appointment details
    /**
     * c_appt_code
     * 任命類型代碼（正授、署理、權、兼等）
     * Appointment type code. Examples: 正授(regular), 署理(acting), 權(temporary), 兼(concurrent)
     */
    public appointmentCode: number | null,
    /**
     * c_assume_office_code
     * 就任代碼
     * Assume office code
     */
    public assumeOfficeCode: number | null,
    // Institution information
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
    // Source documentation
    /**
     * c_source
     * 來源文獻編號，參照TEXT_CODES表
     * Source text ID referencing TEXT_CODES table
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
    // Additional office fields
    /**
     * c_office_id_backup
     * Office備份編號
     * Office ID backup field
     */
    public officeIdBackup: number | null,
    /**
     * c_office_category_id
     * Office類別編號
     * Office category ID
     */
    public officeCategoryId: number | null,
    // Dynasty context
    /**
     * c_dy
     * 朝代編號
     * Dynasty ID
     */
    public dynastyCode: number | null,
    // Audit trail
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
  ) {}
}
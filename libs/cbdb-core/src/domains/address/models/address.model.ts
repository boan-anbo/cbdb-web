/**
 * Domain model for Geographic Addresses (BIOG_ADDR_DATA table)
 * Based on SCHEMA_ANNOTATED.md documentation
 * Maps ONLY fields from BIOG_ADDR_DATA table
 * Pure data model without utility methods or flattened relations
 */
export class Address {
  constructor(
    // Core identifiers
    /**
     * c_personid
     * 人物唯一標識符，作為所有表格的主鍵
     * Unique person identifier used as primary key across all tables
     */
    public personId: number,
    /**
     * c_addr_id
     * 地址編號
     * Address ID. References ADDRESSES table for location details
     */
    public addressId: number,
    /**
     * c_addr_type
     * 地址關係類型（籍貫、出生地、任官地等）
     * Address relationship type. Examples: 1=籍貫(ancestral home, 398,921 records), 16=戶籍地(household registration, 20,587), 10=死所(death place, 3,733), 9=葬地(burial site, 3,268)
     */
    public addressType: number,
    // Sequencing
    /**
     * c_sequence
     * 同類型多項的排序
     * Order of multiple items of same type. For persons with multiple addresses of same type
     */
    public sequence: number,
    // Time period
    /**
     * c_firstyear
     * 起始年份
     * Start year of association with this address
     */
    public firstYear: number | null,
    /**
     * c_lastyear
     * 結束年份
     * End year of association with this address
     */
    public lastYear: number | null,
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
    // Special fields
    /**
     * c_natal
     * 出生地標記
     * Natal/birthplace field marker
     */
    public natal: number | null,
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
    // Data management
    /**
     * c_delete
     * 刪除標記
     * Delete flag (likely for soft deletion)
     */
    public deleteFlag: number | null
  ) {}
}
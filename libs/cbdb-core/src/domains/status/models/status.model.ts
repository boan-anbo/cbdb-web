/**
 * Domain model for Social/Professional Status (STATUS_DATA table)
 * Based on SCHEMA_ANNOTATED.md documentation
 * ALL database fields are mapped to ensure completeness
 * Pure data model without utility methods
 *
 * TODO: [Architecture] Create StatusTableModel for raw STATUS_DATA representation
 * - Create status.model.table.ts with StatusTableModel class
 * - Should contain ONLY database fields (all c_* columns)
 * - No joins, no derived fields, no code table lookups
 * - See PersonTableModel and AssociationTableModel for examples
 * - Critical for TableModel/Model separation - prevents confusion
 *
 * TODO: [Architecture] Update StatusModel to include trivial joins
 * - This model should include statusCodeInfo from STATUS_CODES join
 * - Add statusCodeInfo: { code: number, statusName: string, statusNameChn: string }
 * - Repository already fetches STATUS_CODES, just needs to be included in Model
 * - This is what Model level is for - TableModel + trivial joins
 */
export class Status {
  constructor(
    // Core identifiers
    /**
     * c_personid
     * 人物唯一標識符，作為所有表格的主鍵
     * Unique person identifier used as primary key across all tables
     */
    public personId: number,
    /**
     * c_status_code
     * 身份地位代碼
     * Status code. References STATUS_CODES. Most common: 為官者：文(civil officials, 16,990), 詩人(poets, 4,372), 畫家(painters, 3,382), 僧人(monks, 1,993), 貞婦(virtuous women, 1,794), 孝子(filial sons, 1,788)
     */
    public statusCode: number,
    // Sequencing
    /**
     * c_sequence
     * 同類型多項的排序
     * Order of multiple items of same type. Allows tracking multiple concurrent statuses per person
     */
    public sequence: number,
    // Time period
    /**
     * c_firstyear
     * 起始年份
     * Start year of this status
     */
    public firstYear: number | null,
    /**
     * c_lastyear
     * 結束年份
     * End year of this status
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
    // Additional information
    /**
     * c_supplement
     * 補充資料
     * Supplementary information
     */
    public supplement: string | null,
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
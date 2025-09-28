/**
 * Domain model for Bureaucratic Entry Methods (ENTRY_DATA table)
 * Based on SCHEMA_ANNOTATED.md documentation
 * ALL database fields are mapped to ensure completeness
 * Pure data model without utility methods
 *
 * TODO: [Architecture] Create EntryTableModel for raw ENTRY_DATA representation
 * - Create entry.model.table.ts with EntryTableModel class
 * - Should contain ONLY database fields (all c_* columns)
 * - No joins, no derived fields, no code table lookups
 * - See PersonTableModel and AssociationTableModel for examples
 * - Critical for TableModel/Model separation - prevents confusion
 *
 * TODO: [Architecture] Update EntryModel to include trivial joins
 * - This model should include entryCodeInfo from ENTRY_CODES join
 * - Add entryCodeInfo: { code: number, entryType: string, entryTypeChn: string }
 * - Repository already fetches ENTRY_CODES, just needs to be included in Model
 * - This is what Model level is for - TableModel + trivial joins
 */
export class Entry {
  constructor(
    // Core identifiers
    /**
     * c_personid
     * 人物唯一標識符，作為所有表格的主鍵
     * Unique person identifier used as primary key across all tables
     */
    public personId: number,
    /**
     * c_entry_code
     * Entry代碼
     * Entry code. References ENTRY_CODES. Common values: 進士(36, 92,525 records), 舉人(39, 55,875), 監生(110, 27,868)
     */
    public entryCode: number,
    // Sequencing
    /**
     * c_sequence
     * 同類型多項的排序
     * Order of multiple items of same type
     */
    public sequence: number,
    // Examination details
    /**
     * c_exam_rank
     * 考試名次
     * Exam rank. Example: Han Qi passed jinshi exam in 1027
     */
    public examRank: string | null,
    /**
     * c_exam_field
     * 考試科目
     * Exam field/subject
     */
    public examField: string | null,
    /**
     * c_attempt_count
     * 嘗試次數
     * Number of attempts before success
     */
    public attemptCount: number | null,
    // Kinship connections (hereditary privilege)
    /**
     * c_kin_code
     * 親屬關係類型代碼（如長子、姪女之夫等）
     * Kinship relationship type code (like eldest son, niece's husband, etc.)
     */
    public kinCode: number,
    /**
     * c_kin_id
     * 親屬關係編號
     * Kinship relationship ID. Person who enabled entry through kinship
     */
    public kinId: number,
    // Social connections (recommendations, patronage)
    /**
     * c_assoc_code
     * 社會關係類型（推薦、恩主、彈劾等）
     * Social association type (recommendation, patronage, impeachment, etc.)
     */
    public assocCode: number,
    /**
     * c_assoc_id
     * 社會關係編號
     * Association relationship ID. Person who enabled entry through association
     */
    public assocId: number,
    // Time information
    /**
     * c_year
     * 入仕年份
     * Year of entry into service. Peak years: 1226 (750 jinshi), 1256 (684)
     */
    public year: number,
    /**
     * c_age
     * 入仕年齡
     * Age at entry into service
     */
    public age: number | null,
    /**
     * c_nianhao_id
     * 年號編號
     * Reign period (nianhao) ID
     */
    public nianhaoId: number | null,
    /**
     * c_entry_nh_year
     * Entry年號年份
     * Entry year within reign period
     */
    public entryNhYear: number | null,
    /**
     * c_entry_range
     * Entry年份範圍
     * Entry year uncertainty range
     */
    public entryRange: number | null,
    // Institution information
    /**
     * c_inst_code
     * 機構代碼
     * Institution code
     */
    public instCode: number,
    /**
     * c_inst_name_code
     * 機構名稱代碼
     * Institution name code
     */
    public instNameCode: number,
    // Location
    /**
     * c_entry_addr_id
     * Entry地址編號
     * Entry location address ID. References ADDRESSES for exam location
     */
    public entryAddrId: number | null,
    // Family status
    /**
     * c_parental_status
     * 父母狀態
     * Parental status (orphan status, both parents alive, etc.)
     */
    public parentalStatus: number | null,
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
    /**
     * c_posting_notes
     * Posting備註
     * Posting-related notes
     */
    public postingNotes: string | null,
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
/**
 * Domain model for Text/Literary relationships (BIOG_TEXT_DATA table)
 * Maps ONLY fields from BIOG_TEXT_DATA table
 * Pure data model without utility methods or flattened relations
 *
 * From SCHEMA_ANNOTATED.md:
 * Purpose: Links persons to texts with specific roles. Most common roles: 撰著者/author (18,842),
 * 編纂者/compiler (2,000). Tracks authorship, editing, translation, and commentary relationships.
 * Essential for understanding literary production and intellectual networks.
 *
 * Row Count: 49,297
 * Related to TEXT_CODES (7,569 texts) and TEXT_ROLE_CODES (12 role types)
 *
 * TODO: [Architecture] Create TextTableModel for raw BIOG_TEXT_DATA representation
 * - Create text.model.table.ts with TextTableModel class
 * - Should contain ONLY database fields (all c_* columns)
 * - No joins, no derived fields, no code table lookups
 * - See PersonTableModel and AssociationTableModel for examples
 * - Critical for TableModel/Model separation - prevents confusion
 *
 * TODO: [Architecture] Update TextModel to include trivial joins
 * - This model should include textCodeInfo from TEXT_CODES join
 * - This model should include roleCodeInfo from TEXT_ROLE_CODES join
 * - Add textCodeInfo: { id: number, title: string, textType: string }
 * - Add roleCodeInfo: { id: number, roleName: string, roleNameChn: string }
 * - Repository already fetches both joins, just needs to be included in Model
 * - This is what Model level is for - TableModel + trivial joins
 */
export class Text {
  constructor(
    /**
     * c_personid
     * 人物唯一標識符，作為所有表格的主鍵
     * Unique person identifier used as primary key across all tables
     */
    public personId: number,

    /**
     * c_textid
     * Textid欄位
     * Text ID, references TEXT_CODES table
     */
    public textId: number,

    /**
     * c_role_id
     * Role編號
     * Role ID, references TEXT_ROLE_CODES table
     */
    public roleId: number,

    /**
     * c_year
     * C年份
     * Year of involvement with the text
     */
    public year: number | null,

    /**
     * c_nh_code
     * Nh代碼
     * Reign period code
     */
    public nhCode: number | null,

    /**
     * c_nh_year
     * Nh年份
     * Year within the reign period
     */
    public nhYear: number | null,

    /**
     * c_range_code
     * Range代碼
     * Range code for date uncertainty
     */
    public rangeCode: number | null,

    /**
     * c_source
     * 來源文獻編號
     * Source text ID referencing TEXT_CODES table
     */
    public source: number | null,

    /**
     * c_pages
     * 頁碼引用
     * Page citations
     */
    public pages: string | null,

    /**
     * c_notes
     * 備註
     * Additional notes about the text relationship
     */
    public notes: string | null,

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
/**
 * Domain model for Kinship relationships (KIN_DATA table)
 * Based on SCHEMA_ANNOTATED.md documentation
 * Maps ONLY fields from KIN_DATA table
 * Pure data model without utility methods or flattened relations
 *
 * TODO: [Architecture] Create KinshipTableModel for raw KIN_DATA representation
 * - Create kinship.model.table.ts with KinshipTableModel class
 * - Should contain ONLY database fields (all c_* columns)
 * - No joins, no derived fields, no code table lookups
 * - See PersonTableModel and AssociationTableModel for examples
 * - Critical for TableModel/Model separation - prevents confusion
 *
 * TODO: [Architecture] Update KinshipModel to include trivial joins
 * - This model should include kinshipCodeInfo from KINSHIP_CODES join
 * - Add kinshipCodeInfo: { code: number, kinshipType: string, kinshipTypeChn: string }
 * - Repository already fetches KINSHIP_CODES, just needs to be included in Model
 * - This is what Model level is for - TableModel + trivial joins
 */
export class Kinship {
  constructor(
    // Core relationship identifiers
    /**
     * c_personid
     * 人物唯一標識符，作為所有表格的主鍵
     * Unique person identifier. Examples: 630=韓琦 (Han Qi), 19620=朱熹 (Zhu Xi)
     */
    public personId: number,
    /**
     * c_kin_id
     * 親屬人物的ID
     * Kinship person ID. Example: Han Qi(630)'s relatives include his son Han Zhongyan(631)
     */
    public kinPersonId: number,
    /**
     * c_kin_code
     * 親屬關係類型代碼
     * Kinship relationship type code. Examples: 121=eldest son(長子), 130=daughter(女兒), 134=grandson(孫子), 346=niece's husband(姪女之夫), 57=father(父親), 58=mother(母親)
     */
    public kinshipCode: number,
    // Source documentation
    /**
     * c_source
     * 來源文獻編號，參照TEXT_CODES表。常見來源如《宋史》、家譜等
     * Source text ID referencing TEXT_CODES table. Common sources include Song Shi (宋史), family genealogies
     */
    public source: number | null,
    /**
     * c_pages
     * 頁碼引用
     * Page citation
     */
    public pages: string | null,
    // Notes
    /**
     * c_notes
     * 備註
     * Additional notes
     */
    public notes: string | null,
    /**
     * c_autogen_notes
     * Autogen備註
     * Autogen notes
     */
    public autogenNotes: string | null,
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
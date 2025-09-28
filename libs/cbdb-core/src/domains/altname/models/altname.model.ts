/**
 * Domain model for Alternative Names (ALTNAME_DATA table)
 *
 * From SCHEMA_ANNOTATED.md:
 * Row Count: 244,000
 * Purpose: 存儲人物別名信息，包括字、諡號、室名、別號等各種替代名稱
 * Stores alternative names including courtesy names, posthumous titles, studio names, and other aliases
 *
 * Common types:
 * - 2=字(courtesy name)
 * - 5=諡號(posthumous title)
 * - 6=室名、別號(studio name)
 * - 7=行第(birth order)
 * - 9=小名/小字(childhood name)
 */
export class AltName {
  constructor(
    /**
     * c_personid
     * 人物唯一標識符，作為所有表格的主鍵
     * Unique person identifier used as primary key across all tables
     */
    public personId: number,

    /**
     * c_alt_name
     * 英文/羅馬化別名。例如："Zhongyan" (字), "Wenzhong" (諡號)
     * English/romanized alternative name. Examples: "Zhongyan" (courtesy name), "Wenzhong" (posthumous title)
     */
    public altName: string | null,

    /**
     * c_alt_name_chn
     * 中文別名。例如：韓琦的字"稚圭"，諡號"忠獻"，室名、別號"安陽"等
     * Chinese alternative name. Examples: Han Qi's courtesy name "稚圭", posthumous title "忠獻", studio name "安陽"
     */
    public altNameChn: string,

    /**
     * c_alt_name_type_code
     * 別名類型代碼。例如：2=字，5=諡號，6=室名、別號，7=行第，9=小名/小字
     * Alternative name type code. Examples: 2=courtesy name(字), 5=posthumous title(諡號)
     */
    public altNameTypeCode: number,

    /**
     * c_name_type_desc
     * English description of the alternative name type from ALTNAME_CODES
     * Examples: "Courtesy name", "Studio name, Style name", "Posthumous Name"
     */
    public altNameTypeDesc: string | null,

    /**
     * c_name_type_desc_chn
     * Chinese description of the alternative name type from ALTNAME_CODES
     * Examples: "字", "室名、別號", "諡號"
     */
    public altNameTypeDescChn: string | null,

    /**
     * c_sequence
     * 同類型多項的排序
     * Order of multiple items of same type
     */
    public sequence: number | null,

    /**
     * c_source
     * Source reference ID for the alternative name
     */
    public source: number | null,

    /**
     * c_pages
     * Page reference in the source document
     */
    public pages: string | null,

    /**
     * c_notes
     * Additional notes about this alternative name
     */
    public notes: string | null,
  ) {}
}
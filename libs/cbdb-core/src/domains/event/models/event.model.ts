/**
 * Domain model for Events (EVENTS_DATA table)
 * Based on SCHEMA_ANNOTATED.md documentation
 * Maps ONLY fields from EVENTS_DATA table
 * Pure data model without utility methods or flattened relations
 */
export class Event {
  constructor(
    /**
     * c_personid
     * 人物唯一標識符，作為所有表格的主鍵
     * Unique person identifier used as primary key across all tables
     */
    public personId: number,
    /**
     * c_event_record_id
     * Event Record編號
     * Event Record ID
     */
    public eventId: number,
    /**
     * c_event_code
     * 事件代碼
     * Event code
     */
    public eventCode: number,
    /**
     * c_year
     * C年份
     * Event year
     */
    public year: number | null,
    /**
     * c_month
     * C月份
     * Event month
     */
    public month: number | null,
    /**
     * c_day
     * C日期
     * Event day
     */
    public day: number | null,
    /**
     * c_addr_id
     * 地點編號
     * Place ID references ADDRESSES
     */
    public placeId: number | null,
    /**
     * c_role
     * 角色/備註
     * Role or notes field (appears to store notes/role description)
     */
    public notes: string | null,
    /**
     * c_sequence
     * 同類型多項的排序
     * Order of multiple items of same type
     */
    public sequence: number | null,
  ) {}
}
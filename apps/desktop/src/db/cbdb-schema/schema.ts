import { sqliteTable, AnySQLiteColumn, index, integer, numeric, real } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const ADDR_BELONGS_DATA = sqliteTable("ADDR_BELONGS_DATA", {
	c_addr_id: integer().notNull(),
	c_belongs_to: integer().notNull(),
	c_firstyear: integer().notNull(),
	c_lastyear: integer().notNull(),
	c_source: integer(),
	c_pages: numeric(),
	c_secondary_source_author: numeric(),
	c_notes: numeric(),
},
(table) => [
	index("ADDR_BELONGS_DATA_ZZZ_ADDR_BELONGSc_addr_id").on(table.c_addr_id),
	index("ADDR_BELONGS_DATA_Belongs").on(table.c_belongs_to, table.c_addr_id),
	index("ADDR_BELONGS_DATA_PrimaryKey").on(table.c_addr_id, table.c_belongs_to, table.c_firstyear, table.c_lastyear),
]);

export const ADDR_CODES = sqliteTable("ADDR_CODES", {
	c_addr_id: integer(),
	c_name: numeric(),
	c_name_chn: numeric(),
	c_firstyear: integer(),
	c_lastyear: integer(),
	c_admin_type: numeric(),
	x_coord: real(),
	y_coord: real(),
	CHGIS_PT_ID: integer(),
	c_notes: numeric(),
	c_alt_names: numeric(),
},
(table) => [
	index("ADDR_CODES_CHGIS_PT_ID").on(table.CHGIS_PT_ID),
	index("ADDR_CODES_PrimaryKey").on(table.c_addr_id),
]);

export const ADDR_PLACE_DATA = sqliteTable("ADDR_PLACE_DATA", {
	c_addr_id: integer(),
	c_place_id: integer(),
	c_firstyear: integer(),
	c_lastyear: integer(),
},
(table) => [
	index("ADDR_PLACE_DATA_c_place_id").on(table.c_place_id),
	index("ADDR_PLACE_DATA_c_addr_id").on(table.c_addr_id),
]);

export const ADDR_XY = sqliteTable("ADDR_XY", {
	c_addr_id: integer(),
	x_coord: real(),
	y_coord: real(),
	c_source_reference: numeric(),
	c_source_id: integer(),
	c_notes: numeric(),
},
(table) => [
	index("ADDR_XY_CHGIS_PT_ID").on(table.c_source_reference),
	index("ADDR_XY_c_source_id").on(table.c_source_id),
	index("ADDR_XY_PrimaryKey").on(table.c_addr_id),
]);

export const ADDRESSES = sqliteTable("ADDRESSES", {
	c_addr_id: integer(),
	c_addr_cbd: numeric(),
	c_name: numeric(),
	c_name_chn: numeric(),
	c_admin_type: numeric(),
	c_firstyear: integer(),
	c_lastyear: integer(),
	x_coord: real(),
	y_coord: real(),
	belongs1_ID: integer(),
	belongs1_Name: numeric(),
	belongs2_ID: integer(),
	belongs2_Name: numeric(),
	belongs3_ID: integer(),
	belongs3_Name: numeric(),
	belongs4_ID: integer(),
	belongs4_Name: numeric(),
	belongs5_ID: integer(),
	belongs5_Name: numeric(),
},
(table) => [
	index("ADDRESSES_c_addr_id").on(table.c_addr_id),
	index("ADDRESSES_belongs5_ID").on(table.belongs5_ID),
	index("ADDRESSES_belongs4_ID").on(table.belongs4_ID),
	index("ADDRESSES_belongs3_ID").on(table.belongs3_ID),
	index("ADDRESSES_belongs2_ID").on(table.belongs2_ID),
	index("ADDRESSES_belongs1_ID").on(table.belongs1_ID),
]);

export const ALTNAME_CODES = sqliteTable("ALTNAME_CODES", {
	c_name_type_code: integer(),
	c_name_type_desc: numeric(),
	c_name_type_desc_chn: numeric(),
},
(table) => [
	index("ALTNAME_CODES_PrimaryKey").on(table.c_name_type_code),
]);

export const ALTNAME_DATA = sqliteTable("ALTNAME_DATA", {
	c_personid: integer().notNull(),
	c_alt_name: numeric(),
	c_alt_name_chn: numeric().notNull(),
	c_alt_name_type_code: integer().notNull(),
	c_sequence: integer(),
	c_source: integer(),
	c_pages: numeric(),
	c_notes: numeric(),
	c_created_by: numeric(),
	c_created_date: numeric(),
	c_modified_by: numeric(),
	c_modified_date: numeric(),
},
(table) => [
	index("ALTNAME_DATA_c_personid").on(table.c_personid),
	index("ALTNAME_DATA_c_alt_name_type_code").on(table.c_alt_name_type_code),
	index("ALTNAME_DATA_Primary Key").on(table.c_personid, table.c_alt_name_chn, table.c_alt_name_type_code),
]);

export const APPOINTMENT_CODE_TYPE_REL = sqliteTable("APPOINTMENT_CODE_TYPE_REL", {
	c_appt_code: integer().notNull(),
	c_appt_type_code: numeric().notNull(),
},
(table) => [
	index("APPOINTMENT_CODE_TYPE_REL_c_appt_type_code").on(table.c_appt_type_code),
	index("APPOINTMENT_CODE_TYPE_REL_c_appt_code").on(table.c_appt_code),
	index("APPOINTMENT_CODE_TYPE_REL_PrimaryKey").on(table.c_appt_code, table.c_appt_type_code),
]);

export const APPOINTMENT_CODES = sqliteTable("APPOINTMENT_CODES", {
	c_appt_code: integer().notNull(),
	c_appt_desc_chn: numeric(),
	c_appt_desc: numeric(),
	c_appt_desc_chn_alt: numeric(),
	c_appt_desc_alt: numeric(),
	check: integer(),
	c_notes: numeric(),
},
(table) => [
	index("APPOINTMENT_CODES_c_appointment_code").on(table.c_appt_code),
	index("APPOINTMENT_CODES_PrimaryKey").on(table.c_appt_code),
]);

export const APPOINTMENT_TYPES = sqliteTable("APPOINTMENT_TYPES", {
	c_appt_type_code: numeric().notNull(),
	c_appt_type_desc_chn: numeric(),
	c_appt_type_desc: numeric(),
	c_notes: numeric(),
},
(table) => [
	index("APPOINTMENT_TYPES_c_appointment_code").on(table.c_appt_type_code),
	index("APPOINTMENT_TYPES_PrimaryKey").on(table.c_appt_type_code),
]);

export const ASSOC_CODE_TYPE_REL = sqliteTable("ASSOC_CODE_TYPE_REL", {
	c_assoc_code: integer().notNull(),
	c_assoc_type_code: numeric().notNull(),
},
(table) => [
	index("ASSOC_CODE_TYPE_REL_type_id").on(table.c_assoc_type_code),
	index("ASSOC_CODE_TYPE_REL_PrimaryKey").on(table.c_assoc_code, table.c_assoc_type_code),
	index("ASSOC_CODE_TYPE_REL_code_id").on(table.c_assoc_code),
]);

export const ASSOC_CODES = sqliteTable("ASSOC_CODES", {
	c_assoc_code: integer(),
	c_assoc_pair: integer(),
	c_assoc_pair2: integer(),
	c_assoc_desc: numeric(),
	c_assoc_desc_chn: numeric(),
	c_assoc_role_type: numeric(),
	c_sortorder: integer(),
	c_example: numeric(),
},
(table) => [
	index("ASSOC_CODES_c_assoc_code").on(table.c_assoc_code),
	index("ASSOC_CODES_ASSOC_CODESc_assoc_pair2").on(table.c_assoc_pair2),
	index("ASSOC_CODES_ASSOC_CODESc_assoc_pair").on(table.c_assoc_pair),
	index("ASSOC_CODES_PrimaryKey").on(table.c_assoc_code),
]);

export const ASSOC_DATA = sqliteTable("ASSOC_DATA", {
	c_assoc_code: integer().notNull(),
	c_personid: integer().notNull(),
	c_kin_code: integer().notNull(),
	c_kin_id: integer().notNull(),
	c_assoc_id: integer().notNull(),
	c_assoc_kin_code: integer().notNull(),
	c_assoc_kin_id: integer().notNull(),
	c_tertiary_personid: integer(),
	c_tertiary_type_notes: numeric(),
	c_assoc_count: integer(),
	c_sequence: integer(),
	c_assoc_first_year: integer().notNull(),
	c_assoc_last_year: integer(),
	c_source: integer(),
	c_pages: numeric(),
	c_notes: numeric(),
	c_assoc_fy_nh_code: integer(),
	c_assoc_fy_nh_year: integer(),
	c_assoc_fy_range: integer(),
	c_assoc_fy_intercalary: numeric().notNull(),
	c_assoc_fy_month: integer(),
	c_assoc_fy_day: integer(),
	c_assoc_fy_day_gz: integer(),
	c_assoc_ly_nh_code: integer(),
	c_assoc_ly_nh_year: integer(),
	c_assoc_ly_range: integer(),
	c_assoc_ly_intercalary: numeric().notNull(),
	c_assoc_ly_month: integer(),
	c_assoc_ly_day: integer(),
	c_assoc_ly_day_gz: integer(),
	c_addr_id: integer(),
	c_litgenre_code: integer(),
	c_occasion_code: integer(),
	c_topic_code: integer(),
	c_inst_code: integer(),
	c_inst_name_code: integer(),
	c_text_title: numeric().notNull(),
	c_assoc_claimer_id: integer(),
	c_created_by: numeric(),
	c_created_date: numeric(),
	c_modified_by: numeric(),
	c_modified_date: numeric(),
},
(table) => [
	index("ASSOC_DATA_c_personid").on(table.c_personid),
	index("ASSOC_DATA_c_kin_id").on(table.c_kin_id),
	index("ASSOC_DATA_c_kin_code").on(table.c_kin_code),
	index("ASSOC_DATA_c_inst_name_code").on(table.c_inst_name_code),
	index("ASSOC_DATA_c_inst_code").on(table.c_inst_code, table.c_inst_name_code),
	index("ASSOC_DATA_c_assoc_ly_nh_code").on(table.c_assoc_ly_nh_code),
	index("ASSOC_DATA_c_assoc_kin_code").on(table.c_assoc_kin_code),
	index("ASSOC_DATA_c_assoc_id").on(table.c_assoc_id),
	index("ASSOC_DATA_c_assoc_code").on(table.c_assoc_code),
	index("ASSOC_DATA_c_addr_id").on(table.c_addr_id),
	index("ASSOC_DATA_assoc_kin_id").on(table.c_assoc_kin_id),
	index("ASSOC_DATA_Primary Key").on(table.c_assoc_code, table.c_personid, table.c_assoc_id, table.c_kin_code, table.c_kin_id, table.c_assoc_kin_code, table.c_assoc_kin_id, table.c_text_title, table.c_assoc_first_year),
]);

export const ASSOC_TYPES = sqliteTable("ASSOC_TYPES", {
	c_assoc_type_code: numeric().notNull(),
	c_assoc_type_desc: numeric(),
	c_assoc_type_desc_chn: numeric(),
	c_assoc_type_parent_id: numeric(),
	c_assoc_type_level: integer(),
	c_assoc_type_sortorder: integer(),
	c_assoc_type_short_desc: numeric(),
},
(table) => [
	index("ASSOC_TYPES_type_parent_id").on(table.c_assoc_type_parent_id),
	index("ASSOC_TYPES_type_id").on(table.c_assoc_type_code),
	index("ASSOC_TYPES_PrimaryKey").on(table.c_assoc_type_code),
]);

export const ASSUME_OFFICE_CODES = sqliteTable("ASSUME_OFFICE_CODES", {
	c_assume_office_code: integer(),
	c_assume_office_desc_chn: numeric(),
	c_assume_office_desc: numeric(),
},
(table) => [
	index("ASSUME_OFFICE_CODES_c_appointment_code").on(table.c_assume_office_code),
	index("ASSUME_OFFICE_CODES_PrimaryKey").on(table.c_assume_office_code),
]);

export const BIOG_ADDR_CODES = sqliteTable("BIOG_ADDR_CODES", {
	c_addr_type: integer().notNull(),
	c_addr_desc: numeric(),
	c_addr_desc_chn: numeric(),
	c_addr_note: numeric(),
	c_index_addr_rank: integer(),
	c_index_addr_default_rank: integer(),
},
(table) => [
	index("BIOG_ADDR_CODES_PrimaryKey").on(table.c_addr_type),
]);

export const BIOG_ADDR_DATA = sqliteTable("BIOG_ADDR_DATA", {
	c_personid: integer().notNull(),
	c_addr_id: integer().notNull(),
	c_addr_type: integer().notNull(),
	c_sequence: integer().notNull(),
	c_firstyear: integer(),
	c_lastyear: integer(),
	c_source: integer(),
	c_pages: numeric(),
	c_notes: numeric(),
	c_fy_nh_code: integer(),
	c_ly_nh_code: integer(),
	c_fy_nh_year: integer(),
	c_ly_nh_year: integer(),
	c_fy_range: integer(),
	c_ly_range: integer(),
	c_natal: integer(),
	c_fy_intercalary: numeric().notNull(),
	c_ly_intercalary: numeric().notNull(),
	c_fy_month: integer(),
	c_ly_month: integer(),
	c_fy_day: integer(),
	c_ly_day: integer(),
	c_fy_day_gz: integer(),
	c_ly_day_gz: integer(),
	c_created_by: numeric(),
	c_created_date: numeric(),
	c_modified_by: numeric(),
	c_modified_date: numeric(),
	c_delete: integer(),
},
(table) => [
	index("BIOG_ADDR_DATA_c_personid").on(table.c_personid),
	index("BIOG_ADDR_DATA_c_addr_id").on(table.c_addr_id),
	index("BIOG_ADDR_DATA_BIOG_ADDR_DATAc_addr_type").on(table.c_addr_type),
	index("BIOG_ADDR_DATA_addr_type").on(table.c_personid, table.c_addr_type),
	index("BIOG_ADDR_DATA_PrimaryKey").on(table.c_personid, table.c_addr_id, table.c_addr_type, table.c_sequence),
]);

export const BIOG_INST_CODES = sqliteTable("BIOG_INST_CODES", {
	c_bi_role_code: integer(),
	c_bi_role_desc: numeric(),
	c_bi_role_chn: numeric(),
	c_notes: numeric(),
},
(table) => [
	index("BIOG_INST_CODES_c_bi_role_code").on(table.c_bi_role_code),
	index("BIOG_INST_CODES_PrimaryKey").on(table.c_bi_role_code),
]);

export const BIOG_INST_DATA = sqliteTable("BIOG_INST_DATA", {
	c_personid: integer().notNull(),
	c_inst_name_code: integer().notNull(),
	c_inst_code: integer().notNull(),
	c_bi_role_code: integer().notNull(),
	c_bi_begin_year: integer(),
	c_bi_by_nh_code: integer(),
	c_bi_by_nh_year: integer(),
	c_bi_by_range: integer(),
	c_bi_end_year: integer(),
	c_bi_ey_nh_code: integer(),
	c_bi_ey_nh_year: integer(),
	c_bi_ey_range: integer(),
	c_source: integer(),
	c_pages: numeric(),
	c_notes: numeric(),
	c_created_by: numeric(),
	c_created_date: numeric(),
	c_modified_by: numeric(),
	c_modified_date: numeric(),
	tts_sysno: integer(),
},
(table) => [
	index("BIOG_INST_DATA_c_personid").on(table.c_personid),
	index("BIOG_INST_DATA_c_inst_name_code").on(table.c_inst_name_code),
	index("BIOG_INST_DATA_c_inst_code").on(table.c_inst_name_code, table.c_inst_code),
	index("BIOG_INST_DATA_c_biog_inst_code").on(table.c_bi_role_code),
	index("BIOG_INST_DATA_c_bi_ey_nh_code").on(table.c_bi_ey_nh_code),
	index("BIOG_INST_DATA_c_bi_by_nh_code").on(table.c_bi_by_nh_code),
	index("BIOG_INST_DATA_PrimaryKey").on(table.c_personid, table.c_inst_name_code, table.c_inst_code, table.c_bi_role_code),
]);

export const BIOG_MAIN = sqliteTable("BIOG_MAIN", {
	c_personid: integer().notNull(),
	c_name: numeric(),
	c_name_chn: numeric(),
	c_index_year: integer(),
	c_index_year_type_code: numeric(),
	c_index_year_source_id: integer(),
	c_female: numeric().notNull(),
	c_index_addr_id: integer(),
	c_index_addr_type_code: integer(),
	c_ethnicity_code: integer(),
	c_household_status_code: integer(),
	c_tribe: numeric(),
	c_birthyear: integer(),
	c_by_nh_code: integer(),
	c_by_nh_year: integer(),
	c_by_range: integer(),
	c_deathyear: integer(),
	c_dy_nh_code: integer(),
	c_dy_nh_year: integer(),
	c_dy_range: integer(),
	c_death_age: integer(),
	c_death_age_range: integer(),
	c_fl_earliest_year: integer(),
	c_fl_ey_nh_code: integer(),
	c_fl_ey_nh_year: integer(),
	c_fl_ey_notes: numeric(),
	c_fl_latest_year: integer(),
	c_fl_ly_nh_code: integer(),
	c_fl_ly_nh_year: integer(),
	c_fl_ly_notes: numeric(),
	c_surname: numeric(),
	c_surname_chn: numeric(),
	c_mingzi: numeric(),
	c_mingzi_chn: numeric(),
	c_dy: integer(),
	c_choronym_code: integer(),
	c_notes: numeric(),
	c_by_intercalary: numeric().notNull(),
	c_dy_intercalary: numeric().notNull(),
	c_by_month: integer(),
	c_dy_month: integer(),
	c_by_day: integer(),
	c_dy_day: integer(),
	c_by_day_gz: integer(),
	c_dy_day_gz: integer(),
	c_surname_proper: numeric(),
	c_mingzi_proper: numeric(),
	c_name_proper: numeric(),
	c_surname_rm: numeric(),
	c_mingzi_rm: numeric(),
	c_name_rm: numeric(),
	c_created_by: numeric(),
	c_created_date: numeric(),
	c_modified_by: numeric(),
	c_modified_date: numeric(),
	c_self_bio: numeric().notNull(),
},
(table) => [
	index("BIOG_MAIN_c_personid").on(table.c_personid),
	index("BIOG_MAIN_c_name_chn").on(table.c_name_chn),
	index("BIOG_MAIN_c_name").on(table.c_name),
	index("BIOG_MAIN_c_index_addr_type_code").on(table.c_index_addr_type_code),
	index("BIOG_MAIN_c_index_addr_id").on(table.c_index_addr_id),
	index("BIOG_MAIN_PrimaryKey").on(table.c_personid),
]);

export const BIOG_SOURCE_DATA = sqliteTable("BIOG_SOURCE_DATA", {
	c_personid: integer().notNull(),
	c_textid: integer().notNull(),
	c_pages: numeric().notNull(),
	c_notes: numeric(),
	c_main_source: numeric().notNull(),
	c_self_bio: numeric().notNull(),
},
(table) => [
	index("BIOG_SOURCE_DATA_DB_PERSON_ID").on(table.c_pages),
	index("BIOG_SOURCE_DATA_DB_ID").on(table.c_textid),
	index("BIOG_SOURCE_DATA_c_personid").on(table.c_personid),
	index("BIOG_SOURCE_DATA_Primary key").on(table.c_personid, table.c_textid, table.c_pages),
]);

export const BIOG_TEXT_DATA = sqliteTable("BIOG_TEXT_DATA", {
	c_textid: integer().notNull(),
	c_personid: integer().notNull(),
	c_role_id: integer().notNull(),
	c_year: integer(),
	c_nh_code: integer(),
	c_nh_year: integer(),
	c_range_code: integer(),
	c_source: integer(),
	c_pages: numeric(),
	c_notes: numeric(),
	c_created_by: numeric(),
	c_created_date: numeric(),
	c_modified_by: numeric(),
	c_modified_date: numeric(),
},
(table) => [
	index("BIOG_TEXT_DATA_c_textid").on(table.c_textid),
	index("BIOG_TEXT_DATA_c_role_id").on(table.c_role_id),
	index("BIOG_TEXT_DATA_c_range_code").on(table.c_range_code),
	index("BIOG_TEXT_DATA_c_personid").on(table.c_personid),
	index("BIOG_TEXT_DATA_c_nh_code").on(table.c_nh_code),
	index("BIOG_TEXT_DATA_BIOG_TEXT_DATA_YEAR_RANGE_CODE").on(table.c_range_code),
	index("BIOG_TEXT_DATA_BIOG_TEXT_DATA_TEXT_ROLE_CODE").on(table.c_role_id),
	index("BIOG_TEXT_DATA_BIOG_TEXT_DATA_TEXT_ID").on(table.c_textid),
	index("BIOG_TEXT_DATA_BIOG_TEXT_DATA_SOURCE_TEXT_ID").on(table.c_source),
	index("BIOG_TEXT_DATA_BIOG_TEXT_DATA_PERSON_ID").on(table.c_personid),
	index("BIOG_TEXT_DATA_BIOG_TEXT_DATA_NIAN_HAO").on(table.c_nh_code),
	index("BIOG_TEXT_DATA_PrimaryKey").on(table.c_textid, table.c_personid, table.c_role_id),
]);

export const CHORONYM_CODES = sqliteTable("CHORONYM_CODES", {
	c_choronym_code: integer(),
	c_choronym_desc: numeric(),
	c_choronym_chn: numeric(),
},
(table) => [
	index("CHORONYM_CODES_PrimaryKey").on(table.c_choronym_code),
]);

export const CopyOfCopyTables = sqliteTable("Copy Of CopyTables", {
	TableName: numeric().notNull(),
	NotProcessed: numeric().notNull(),
},
(table) => [
	index("Copy Of CopyTables_PrimaryKey").on(table.TableName),
]);

export const CopyMissingTables = sqliteTable("CopyMissingTables", {
	ID: integer().notNull(),
	TableName: numeric(),
},
(table) => [
	index("CopyMissingTables_PrimaryKey").on(table.ID),
]);

export const CopyTables = sqliteTable("CopyTables", {
	TableName: numeric().notNull(),
	NotProcessed: numeric().notNull(),
},
(table) => [
	index("CopyTables_PrimaryKey").on(table.TableName),
]);

export const CopyTablesDefault = sqliteTable("CopyTablesDefault", {
	ID: integer().notNull(),
	TableName: numeric(),
},
(table) => [
	index("CopyTablesDefault_PrimaryKey").on(table.ID),
]);

export const COUNTRY_CODES = sqliteTable("COUNTRY_CODES", {
	c_country_code: integer(),
	c_country_desc: numeric(),
	c_country_desc_chn: numeric(),
},
(table) => [
	index("COUNTRY_CODES_c_country_code").on(table.c_country_code),
	index("COUNTRY_CODES_PrimaryKey").on(table.c_country_code),
]);

export const DATABASE_LINK_CODES = sqliteTable("DATABASE_LINK_CODES", {
	c_db_id: integer(),
	c_db_URL: numeric(),
	c_db_name: numeric(),
	c_db_name_trans_chn: numeric(),
	c_db_name_trans_eng: numeric(),
	c_db_institution: numeric(),
	c_db_institution_trans_chn: numeric(),
	c_db_institution_trans_eng: numeric(),
	c_db_date_of_origin: numeric(),
	"c_db_contact person": numeric(),
	c_DB_URL_FIRST_STRING: numeric(),
	c_DB_URL_SECOND_STRING: numeric(),
	c_notes: numeric(),
},
(table) => [
	index("DATABASE_LINK_CODES_c_db_id").on(table.c_db_id),
	index("DATABASE_LINK_CODES_PrimaryKey").on(table.c_db_id),
]);

export const DATABASE_LINK_DATA = sqliteTable("DATABASE_LINK_DATA", {
	c_person_id: integer(),
	c_db_id: integer(),
	c_db_sys_id: numeric(),
},
(table) => [
	index("DATABASE_LINK_DATA_DB_PERSON_ID").on(table.c_db_sys_id),
	index("DATABASE_LINK_DATA_DB_ID").on(table.c_db_id),
	index("DATABASE_LINK_DATA_c_personid").on(table.c_person_id),
	index("DATABASE_LINK_DATA_Primary key").on(table.c_person_id, table.c_db_id, table.c_db_sys_id),
]);

export const DYNASTIES = sqliteTable("DYNASTIES", {
	c_dy: integer(),
	c_dynasty: numeric(),
	c_dynasty_chn: numeric(),
	c_start: integer(),
	c_end: integer(),
	c_sort: integer(),
},
(table) => [
	index("DYNASTIES_PrimaryKey").on(table.c_dy),
]);

export const ENTRY_CODE_TYPE_REL = sqliteTable("ENTRY_CODE_TYPE_REL", {
	c_entry_code: integer(),
	c_entry_type: numeric(),
},
(table) => [
	index("ENTRY_CODE_TYPE_REL_type_id").on(table.c_entry_type),
	index("ENTRY_CODE_TYPE_REL_code_id").on(table.c_entry_code),
	index("ENTRY_CODE_TYPE_REL_PrimaryKey").on(table.c_entry_code, table.c_entry_type),
]);

export const ENTRY_CODES = sqliteTable("ENTRY_CODES", {
	c_entry_code: integer(),
	c_entry_desc: numeric(),
	c_entry_desc_chn: numeric(),
},
(table) => [
	index("ENTRY_CODES_ENTRY_CODESc_entry_code").on(table.c_entry_code),
	index("ENTRY_CODES_PrimaryKey").on(table.c_entry_code),
]);

export const ENTRY_DATA = sqliteTable("ENTRY_DATA", {
	c_personid: integer().notNull(),
	c_entry_code: integer().notNull(),
	c_sequence: integer().notNull(),
	c_exam_rank: numeric(),
	c_kin_code: integer().notNull(),
	c_kin_id: integer().notNull(),
	c_assoc_code: integer().notNull(),
	c_assoc_id: integer().notNull(),
	c_year: integer().notNull(),
	c_age: integer(),
	c_nianhao_id: integer(),
	c_entry_nh_year: integer(),
	c_entry_range: integer(),
	c_inst_code: integer().notNull(),
	c_inst_name_code: integer().notNull(),
	c_exam_field: numeric(),
	c_entry_addr_id: integer(),
	c_parental_status: integer(),
	c_attempt_count: integer(),
	c_source: integer(),
	c_pages: numeric(),
	c_notes: numeric(),
	c_posting_notes: numeric(),
	c_created_by: numeric(),
	c_created_date: numeric(),
	c_modified_by: numeric(),
	c_modified_date: numeric(),
},
(table) => [
	index("ENTRY_DATA_c_social_inst_code").on(table.c_inst_code),
	index("ENTRY_DATA_c_social_ins_name_code").on(table.c_inst_name_code),
	index("ENTRY_DATA_c_personid").on(table.c_personid),
	index("ENTRY_DATA_c_nianhao_id").on(table.c_nianhao_id),
	index("ENTRY_DATA_c_kin_id").on(table.c_kin_id),
	index("ENTRY_DATA_c_kin_code").on(table.c_kin_code),
	index("ENTRY_DATA_c_entry_code").on(table.c_entry_code),
	index("ENTRY_DATA_c_assoc_id").on(table.c_assoc_id),
	index("ENTRY_DATA_c_assoc_code").on(table.c_assoc_code),
	index("ENTRY_DATA_c_addr_id").on(table.c_entry_addr_id),
	index("ENTRY_DATA_entry_data").on(table.c_personid, table.c_entry_code, table.c_sequence, table.c_kin_code, table.c_kin_id, table.c_assoc_code, table.c_assoc_id, table.c_year, table.c_inst_code, table.c_inst_name_code),
]);

export const ENTRY_TYPES = sqliteTable("ENTRY_TYPES", {
	c_entry_type: numeric(),
	c_entry_type_desc: numeric(),
	c_entry_type_desc_chn: numeric(),
	c_entry_type_parent_id: numeric(),
	c_entry_type_level: real(),
	c_entry_type_sortorder: real(),
},
(table) => [
	index("ENTRY_TYPES_type_parent_id").on(table.c_entry_type_parent_id),
	index("ENTRY_TYPES_type_id").on(table.c_entry_type),
	index("ENTRY_TYPES_PrimaryKey").on(table.c_entry_type),
]);

export const ETHNICITY_TRIBE_CODES = sqliteTable("ETHNICITY_TRIBE_CODES", {
	c_ethnicity_code: integer(),
	c_group_code: integer(),
	c_subgroup_code: integer(),
	c_altname_code: integer(),
	c_name_chn: numeric(),
	c_name: numeric(),
	c_ethno_legal_cat: numeric(),
	c_romanized: numeric(),
	c_surname: numeric(),
	c_notes: numeric(),
	JiuTangShu: numeric(),
	XinTangShu: numeric(),
	JiuWudaiShi: numeric(),
	XinWudaiShi: numeric(),
	SongShi: numeric(),
	LiaoShi: numeric(),
	JinShi: numeric(),
	YuanShi: numeric(),
	MingShi: numeric(),
	QingShiGao: numeric(),
	c_sortorder: integer(),
},
(table) => [
	index("ETHNICITY_TRIBE_CODES_c_ethnicity_code").on(table.c_ethnicity_code),
	index("ETHNICITY_TRIBE_CODES_ethnicity_tree").on(table.c_group_code, table.c_subgroup_code, table.c_altname_code),
]);

export const EVENT_CODES = sqliteTable("EVENT_CODES", {
	c_event_code: integer().notNull(),
	c_event_name_chn: numeric(),
	c_event_name: numeric(),
	c_fy_yr: integer(),
	c_ly_yr: integer(),
	c_fy_nh_code: integer(),
	c_ly_nh_code: integer(),
	c_fy_nh_yr: integer(),
	c_ly_nh_yr: integer(),
	c_fy_intercalary: numeric().notNull(),
	c_fy_month: integer(),
	c_ly_intercalary: numeric().notNull(),
	c_ly_month: integer(),
	c_fy_range: integer(),
	c_ly_range: integer(),
	c_addr_id: integer(),
	c_dy: integer(),
	c_source: integer(),
	c_pages: numeric(),
	c_event_notes: numeric(),
},
(table) => [
	index("EVENT_CODES_EVENT_CODESc_dy").on(table.c_dy),
	index("EVENT_CODES_c_fy_nh_code").on(table.c_fy_nh_code),
	index("EVENT_CODES_c_event_code").on(table.c_event_code),
	index("EVENT_CODES_c_end_yr_nh_code").on(table.c_ly_nh_code),
	index("EVENT_CODES_c_addr_id").on(table.c_addr_id),
	index("EVENT_CODES_PrimaryKey").on(table.c_event_code),
]);

export const EVENTS_ADDR = sqliteTable("EVENTS_ADDR", {
	c_event_record_id: integer(),
	c_personid: integer(),
	c_addr_id: integer(),
	c_year: integer(),
	c_nh_code: integer(),
	c_nh_year: integer(),
	c_yr_range: integer(),
	c_intercalary: numeric().notNull(),
	c_month: integer(),
	c_day: integer(),
	c_day_ganzhi: integer(),
},
(table) => [
	index("EVENTS_ADDR_c_personid").on(table.c_personid),
	index("EVENTS_ADDR_c_nh_code").on(table.c_nh_code),
	index("EVENTS_ADDR_c_event_record_id").on(table.c_event_record_id),
	index("EVENTS_ADDR_c_addr_id").on(table.c_addr_id),
	index("EVENTS_ADDR_PrimaryKey").on(table.c_event_record_id, table.c_personid, table.c_addr_id),
]);

export const EVENTS_DATA = sqliteTable("EVENTS_DATA", {
	c_personid: integer(),
	c_sequence: integer(),
	c_event_record_id: integer(),
	c_event_code: integer(),
	c_role: numeric(),
	c_year: integer(),
	c_nh_code: integer(),
	c_nh_year: integer(),
	c_yr_range: integer(),
	c_intercalary: numeric().notNull(),
	c_month: integer(),
	c_day: integer(),
	c_day_ganzhi: integer(),
	c_addr_id: integer(),
	c_source: integer(),
	c_pages: numeric(),
	c_event: numeric(),
	c_notes: numeric(),
	c_created_by: numeric(),
	c_created_date: numeric(),
	c_modified_by: numeric(),
	c_modified_date: numeric(),
},
(table) => [
	index("EVENTS_DATA_c_person_id").on(table.c_personid),
	index("EVENTS_DATA_c_nh_code").on(table.c_nh_code),
	index("EVENTS_DATA_c_event_record_id").on(table.c_event_record_id),
	index("EVENTS_DATA_c_event_code").on(table.c_event_code),
	index("EVENTS_DATA_c_addr_id").on(table.c_addr_id),
]);

export const EXTANT_CODES = sqliteTable("EXTANT_CODES", {
	c_extant_code: integer(),
	c_extant_desc: numeric(),
	c_extant_desc_chn: numeric(),
	c_extant_code_hd: numeric(),
},
(table) => [
	index("EXTANT_CODES_c_extant_hd_code").on(table.c_extant_code_hd),
	index("EXTANT_CODES_c_extant_code").on(table.c_extant_code),
	index("EXTANT_CODES_PrimaryKey").on(table.c_extant_code),
]);

export const ForeignKeys = sqliteTable("ForeignKeys", {
	AccessTblNm: numeric(),
	AccessFldNm: numeric(),
	ForeignKey: numeric(),
	ForeignKeyBaseField: numeric(),
	FKString: numeric(),
	FKName: numeric(),
	skip: integer(),
	IndexOnField: numeric(),
	DataFormat: numeric(),
	NULL_allowed: numeric().notNull(),
},
(table) => [
	index("ForeignKeys_ForeignKey").on(table.ForeignKey),
	index("ForeignKeys_PrimaryKey").on(table.AccessTblNm, table.AccessFldNm),
]);

export const FormLabels = sqliteTable("FormLabels", {
	c_form: numeric(),
	c_label_id: integer(),
	c_english: numeric(),
	c_jianti: numeric(),
	c_fanti: numeric(),
},
(table) => [
	index("FormLabels_c_label_id").on(table.c_label_id),
	index("FormLabels_label").on(table.c_form, table.c_label_id),
]);

export const GANZHI_CODES = sqliteTable("GANZHI_CODES", {
	c_ganzhi_code: integer(),
	c_ganzhi_chn: numeric(),
	c_ganzhi_py: numeric(),
},
(table) => [
	index("GANZHI_CODES_c_ganzhi_code").on(table.c_ganzhi_code),
	index("GANZHI_CODES_PrimaryKey").on(table.c_ganzhi_code),
]);

export const HOUSEHOLD_STATUS_CODES = sqliteTable("HOUSEHOLD_STATUS_CODES", {
	c_household_status_code: integer(),
	c_household_status_desc: numeric(),
	c_household_status_desc_chn: numeric(),
},
(table) => [
	index("HOUSEHOLD_STATUS_CODES_c_household_status_code").on(table.c_household_status_code),
]);

export const INDEXYEAR_TYPE_CODES = sqliteTable("INDEXYEAR_TYPE_CODES", {
	c_index_year_type_code: numeric().notNull(),
	c_index_year_type_desc: numeric(),
	c_index_year_type_hz: numeric(),
	c_notes: numeric(),
},
(table) => [
	index("INDEXYEAR_TYPE_CODES_c_index_year_type_code").on(table.c_index_year_type_code),
	index("INDEXYEAR_TYPE_CODES_PrimaryKey").on(table.c_index_year_type_code),
]);

export const KIN_DATA = sqliteTable("KIN_DATA", {
	c_personid: integer().notNull(),
	c_kin_id: integer().notNull(),
	c_kin_code: integer().notNull(),
	c_source: integer(),
	c_pages: numeric(),
	c_notes: numeric(),
	c_autogen_notes: numeric(),
	c_created_by: numeric(),
	c_created_date: numeric(),
	c_modified_by: numeric(),
	c_modified_date: numeric(),
},
(table) => [
	index("KIN_DATA_KIN_DATA_SOURCE_TEXT_CODES").on(table.c_source),
	index("KIN_DATA_KIN_DATA_PERSON_ID").on(table.c_personid),
	index("KIN_DATA_KIN_DATA_KIN_ID").on(table.c_kin_id),
	index("KIN_DATA_KIN_DATA_KIN_CODES").on(table.c_kin_code),
	index("KIN_DATA_c_personid").on(table.c_personid),
	index("KIN_DATA_c_kin_id").on(table.c_kin_id),
	index("KIN_DATA_c_kin_code").on(table.c_kin_code),
	index("KIN_DATA_PrimaryKey").on(table.c_personid, table.c_kin_id, table.c_kin_code),
]);

export const KIN_Mourning = sqliteTable("KIN_Mourning", {
	c_kinrel: numeric(),
	c_kinrel_alt: numeric(),
	c_kinrel_chn: numeric(),
	c_mourning: numeric(),
	c_mourning_chn: numeric(),
	c_kindist: numeric(),
	c_kintype: numeric(),
	c_kintype_desc: numeric(),
	c_kintype_desc_chn: numeric(),
	c_notes: numeric(),
},
(table) => [
	index("KIN_Mourning_PrimaryKey").on(table.c_kinrel),
]);

export const KIN_MOURNING_STEPS = sqliteTable("KIN_MOURNING_STEPS", {
	c_kinrel: numeric(),
	c_upstep: integer(),
	c_dwnstep: integer(),
	c_marstep: integer(),
	c_colstep: integer(),
});

export const KINSHIP_CODES = sqliteTable("KINSHIP_CODES", {
	c_kincode: integer(),
	c_kin_pair1: integer(),
	c_kin_pair2: integer(),
	c_kin_pair_notes: numeric(),
	c_kinrel_chn: numeric(),
	c_kinrel: numeric(),
	c_kinrel_alt: numeric(),
	c_pick_sorting: integer(),
	c_upstep: integer(),
	c_dwnstep: integer(),
	c_marstep: integer(),
	c_colstep: integer(),
	c_kinrel_simplified: numeric(),
},
(table) => [
	index("KINSHIP_CODES_KINSHIP_CODESc_kin_pair2").on(table.c_kin_pair2),
	index("KINSHIP_CODES_KINSHIP_CODESc_kin_pair1").on(table.c_kin_pair1),
	index("KINSHIP_CODES_KINSHIP_CODES_KIN_PAIR2").on(table.c_kin_pair2),
	index("KINSHIP_CODES_KINSHIP_CODES_KIN_PAIR1").on(table.c_kin_pair1),
	index("KINSHIP_CODES_PrimaryKey").on(table.c_kincode),
]);

export const LITERARYGENRE_CODES = sqliteTable("LITERARYGENRE_CODES", {
	c_lit_genre_code: integer(),
	c_lit_genre_desc: numeric(),
	c_lit_genre_desc_chn: numeric(),
	c_sortorder: integer(),
},
(table) => [
	index("LITERARYGENRE_CODES_c_lit_genre_code").on(table.c_lit_genre_code),
	index("LITERARYGENRE_CODES_PrimaryKey").on(table.c_lit_genre_code),
]);

export const MEASURE_CODES = sqliteTable("MEASURE_CODES", {
	c_measure_code: integer(),
	c_measure_desc: numeric(),
	c_measure_desc_chn: numeric(),
},
(table) => [
	index("MEASURE_CODES_c_measure_id").on(table.c_measure_code),
	index("MEASURE_CODES_PrimaryKey").on(table.c_measure_code),
]);

export const NIAN_HAO = sqliteTable("NIAN_HAO", {
	c_nianhao_id: integer(),
	c_dy: integer(),
	c_dynasty_chn: numeric(),
	c_nianhao_chn: numeric(),
	c_nianhao_pin: numeric(),
	c_firstyear: integer(),
	c_lastyear: integer(),
},
(table) => [
	index("NIAN_HAO_NIAN_HAOc_dy").on(table.c_dy),
	index("NIAN_HAO_dynasty").on(table.c_dy),
	index("NIAN_HAO_PrimaryKey").on(table.c_nianhao_id),
]);

export const OCCASION_CODES = sqliteTable("OCCASION_CODES", {
	c_occasion_code: integer(),
	c_occasion_desc: numeric(),
	c_occasion_desc_chn: numeric(),
	c_sortorder: integer(),
},
(table) => [
	index("OCCASION_CODES_c_occasion_code").on(table.c_occasion_code),
	index("OCCASION_CODES_PrimaryKey").on(table.c_occasion_code),
]);

export const OFFICE_CATEGORIES = sqliteTable("OFFICE_CATEGORIES", {
	c_office_category_id: integer(),
	c_category_desc: numeric(),
	c_category_desc_chn: numeric(),
	c_notes: numeric(),
},
(table) => [
	index("OFFICE_CATEGORIES_PrimaryKey").on(table.c_office_category_id),
]);

export const OFFICE_CODE_TYPE_REL = sqliteTable("OFFICE_CODE_TYPE_REL", {
	c_office_id: integer().notNull(),
	c_office_tree_id: numeric().notNull(),
},
(table) => [
	index("OFFICE_CODE_TYPE_REL_OFFICE_CODE_TYPE_REL_OFFICE_TYPE_TREE").on(table.c_office_tree_id),
	index("OFFICE_CODE_TYPE_REL_OFFICE_CODE_TYPE_REL_OFFICE_ID").on(table.c_office_id),
	index("OFFICE_CODE_TYPE_REL_code_id").on(table.c_office_id),
	index("OFFICE_CODE_TYPE_REL_c_office_tree_id").on(table.c_office_tree_id),
	index("OFFICE_CODE_TYPE_REL_PrimaryKey").on(table.c_office_id, table.c_office_tree_id),
]);

export const OFFICE_CODES = sqliteTable("OFFICE_CODES", {
	c_office_id: integer().notNull(),
	c_dy: integer(),
	c_office_pinyin: numeric(),
	c_office_chn: numeric(),
	c_office_pinyin_alt: numeric(),
	c_office_chn_alt: numeric(),
	c_office_trans: numeric(),
	c_office_trans_alt: numeric(),
	c_source: integer(),
	c_pages: numeric(),
	c_notes: numeric(),
	c_category_1: numeric(),
	c_category_2: numeric(),
	c_category_3: numeric(),
	c_category_4: numeric(),
	c_office_id_old: integer(),
},
(table) => [
	index("OFFICE_CODES_OFFICE_CODESc_dy").on(table.c_dy),
	index("OFFICE_CODES_OFFICE_CODES_SOURCE_TEXT_CODES").on(table.c_source),
	index("OFFICE_CODES_OFFICE_CODES_dynasty").on(table.c_dy),
	index("OFFICE_CODES_PrimaryKey").on(table.c_office_id),
]);

export const OFFICE_CODES_CONVERSION = sqliteTable("OFFICE_CODES_CONVERSION", {
	c_office_id_backup: integer(),
	c_office_chn_backup: numeric(),
	c_office_id: integer(),
	c_office_chn: numeric(),
},
(table) => [
	index("OFFICE_CODES_CONVERSION_c_office_id").on(table.c_office_id),
]);

export const OFFICE_TYPE_TREE = sqliteTable("OFFICE_TYPE_TREE", {
	c_office_type_node_id: numeric().notNull(),
	c_office_type_desc: numeric(),
	c_office_type_desc_chn: numeric(),
	c_parent_id: numeric(),
},
(table) => [
	index("OFFICE_TYPE_TREE_OFFICE_TYPE_TREE_PARENT").on(table.c_parent_id),
	index("OFFICE_TYPE_TREE_c_tree_id").on(table.c_parent_id),
	index("OFFICE_TYPE_TREE_c_node_id").on(table.c_office_type_node_id),
	index("OFFICE_TYPE_TREE_PrimaryKey").on(table.c_office_type_node_id),
]);

export const OFFICE_TYPE_TREE_backup = sqliteTable("OFFICE_TYPE_TREE_backup", {
	c_office_type_node_id: numeric(),
	c_tts_node_id: numeric(),
	c_office_type_desc: numeric(),
	c_office_type_desc_chn: numeric(),
	c_parent_id: numeric(),
},
(table) => [
	index("OFFICE_TYPE_TREE_backup_c_tree_id").on(table.c_parent_id),
	index("OFFICE_TYPE_TREE_backup_c_office_tts_id").on(table.c_tts_node_id),
	index("OFFICE_TYPE_TREE_backup_c_node_id").on(table.c_office_type_node_id),
	index("OFFICE_TYPE_TREE_backup_PrimaryKey").on(table.c_office_type_node_id),
]);

export const PARENTAL_STATUS_CODES = sqliteTable("PARENTAL_STATUS_CODES", {
	c_parental_status_code: integer(),
	c_parental_status_desc: numeric(),
	c_parental_status_desc_chn: numeric(),
},
(table) => [
	index("PARENTAL_STATUS_CODES_c_parental_status_code").on(table.c_parental_status_code),
	index("PARENTAL_STATUS_CODES_PrimaryKey").on(table.c_parental_status_code),
]);

export const PLACE_CODES = sqliteTable("PLACE_CODES", {
	c_place_id: real(),
	c_place_1990: numeric(),
	c_name: numeric(),
	c_name_chn: numeric(),
	x_coord: real(),
	y_coord: real(),
},
(table) => [
	index("PLACE_CODES_PrimaryKey").on(table.c_place_id),
]);

export const POSSESSION_ACT_CODES = sqliteTable("POSSESSION_ACT_CODES", {
	c_possession_act_code: integer(),
	c_possession_act_desc: numeric(),
	c_possession_act_desc_chn: numeric(),
},
(table) => [
	index("POSSESSION_ACT_CODES_c_possession_type_code").on(table.c_possession_act_code),
	index("POSSESSION_ACT_CODES_PrimaryKey").on(table.c_possession_act_code),
]);

export const POSSESSION_ADDR = sqliteTable("POSSESSION_ADDR", {
	c_possession_record_id: integer(),
	c_personid: integer(),
	c_addr_id: integer(),
},
(table) => [
	index("POSSESSION_ADDR_POSSESSION_ADDR_possession_id").on(table.c_possession_record_id),
	index("POSSESSION_ADDR_POSSESSION_ADDR_PERSON_ID").on(table.c_personid),
	index("POSSESSION_ADDR_POSSESSION_ADDR_ADDR_ID").on(table.c_addr_id),
	index("POSSESSION_ADDR_c_possession_record_id").on(table.c_possession_record_id),
	index("POSSESSION_ADDR_c_personid").on(table.c_personid),
	index("POSSESSION_ADDR_c_addr_id").on(table.c_addr_id),
	index("POSSESSION_ADDR_PrimaryKey").on(table.c_possession_record_id, table.c_personid, table.c_addr_id),
]);

export const POSSESSION_DATA = sqliteTable("POSSESSION_DATA", {
	c_personid: integer(),
	c_possession_record_id: integer().notNull(),
	c_sequence: integer(),
	c_possession_act_code: integer(),
	c_possession_desc: numeric(),
	c_possession_desc_chn: numeric(),
	c_quantity: numeric(),
	c_measure_code: integer(),
	c_possession_yr: integer(),
	c_possession_nh_code: integer(),
	c_possession_nh_yr: integer(),
	c_possession_yr_range: integer(),
	c_addr_id: integer(),
	c_source: integer(),
	c_pages: numeric(),
	c_notes: numeric(),
	c_created_by: numeric(),
	c_created_date: numeric(),
	c_modified_by: numeric(),
	c_modified_date: numeric(),
},
(table) => [
	index("POSSESSION_DATA_POSSESSION_DATAc_possession_act_code").on(table.c_possession_act_code),
	index("POSSESSION_DATA_POSSESSION_DATAc_measure_code").on(table.c_measure_code),
	index("POSSESSION_DATA_POSSESSION_DATA_year_range_code").on(table.c_possession_yr_range),
	index("POSSESSION_DATA_POSSESSION_DATA_SOURCE_TEXT_CODE").on(table.c_source),
	index("POSSESSION_DATA_POSSESSION_DATA_possession_act_code").on(table.c_possession_act_code),
	index("POSSESSION_DATA_POSSESSION_DATA_PERSON_ID").on(table.c_personid),
	index("POSSESSION_DATA_POSSESSION_DATA_nian_hao").on(table.c_possession_nh_code),
	index("POSSESSION_DATA_POSSESSION_DATA_MEASURE_CODE").on(table.c_measure_code),
	index("POSSESSION_DATA_POSSESSION_DATA_ADDR_ID").on(table.c_addr_id),
	index("POSSESSION_DATA_c_possession_nh_code").on(table.c_possession_nh_code),
	index("POSSESSION_DATA_c_personid").on(table.c_personid),
	index("POSSESSION_DATA_c_addr_id").on(table.c_addr_id),
	index("POSSESSION_DATA_PrimaryKey").on(table.c_possession_record_id),
]);

export const POSTED_TO_ADDR_DATA = sqliteTable("POSTED_TO_ADDR_DATA", {
	c_posting_id: integer().notNull(),
	c_personid: integer(),
	c_office_id: integer().notNull(),
	c_addr_id: integer().notNull(),
	c_posting_id_old: integer(),
},
(table) => [
	index("POSTED_TO_ADDR_DATA_POSTING_ADDR_DATAc_posting_id").on(table.c_posting_id),
	index("POSTED_TO_ADDR_DATA_POSTED_TO_ADDR_DATAc_addr_id").on(table.c_addr_id),
	index("POSTED_TO_ADDR_DATA_POSTED_TO_ADDR_DATA_POSTING_ID").on(table.c_posting_id),
	index("POSTED_TO_ADDR_DATA_POSTED_TO_ADDR_DATA_PERSON_ID").on(table.c_personid),
	index("POSTED_TO_ADDR_DATA_POSTED_TO_ADDR_DATA_OFFICE_ID").on(table.c_office_id),
	index("POSTED_TO_ADDR_DATA_POSTED_TO_ADDR_DATA_ADDR_ID").on(table.c_addr_id),
	index("POSTED_TO_ADDR_DATA_PrimaryKey").on(table.c_posting_id, table.c_addr_id, table.c_office_id),
]);

export const POSTED_TO_OFFICE_DATA = sqliteTable("POSTED_TO_OFFICE_DATA", {
	c_personid: integer(),
	c_office_id: integer().notNull(),
	c_posting_id: integer().notNull(),
	c_posting_id_old: integer(),
	c_sequence: integer(),
	c_firstyear: integer(),
	c_fy_nh_code: integer(),
	c_fy_nh_year: integer(),
	c_fy_range: integer(),
	c_lastyear: integer(),
	c_ly_nh_code: integer(),
	c_ly_nh_year: integer(),
	c_ly_range: integer(),
	c_appt_code: integer(),
	c_assume_office_code: integer(),
	c_inst_code: integer(),
	c_inst_name_code: integer(),
	c_source: integer(),
	c_pages: numeric(),
	c_notes: numeric(),
	c_office_id_backup: integer(),
	c_office_category_id: integer(),
	c_fy_intercalary: numeric().notNull(),
	c_fy_month: integer(),
	c_ly_intercalary: numeric().notNull(),
	c_ly_month: integer(),
	c_fy_day: integer(),
	c_ly_day: integer(),
	c_fy_day_gz: integer(),
	c_ly_day_gz: integer(),
	c_dy: integer(),
	c_created_by: numeric(),
	c_created_date: numeric(),
	c_modified_by: numeric(),
	c_modified_date: numeric(),
},
(table) => [
	index("POSTED_TO_OFFICE_DATA_POSTING_OFFICE_DATAc_posting_id").on(table.c_posting_id),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATAc_dy").on(table.c_dy),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_year_range_ly").on(table.c_ly_range),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_year_range_fy").on(table.c_fy_range),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_SOURCE_TEXT_CODE").on(table.c_source),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_SOCIAL_INSTITUTION_NAME_CODE").on(table.c_inst_name_code),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_SOCIAL_INSTITUTION_CODE").on(table.c_inst_name_code, table.c_inst_code),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_POSTING_ID").on(table.c_posting_id),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_PERSON_ID").on(table.c_personid),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_OFFICE_ID").on(table.c_office_id),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_OFFICE_CATEGORY").on(table.c_office_category_id),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_nian_hao_ly").on(table.c_ly_nh_code),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_nian_hao_fy").on(table.c_fy_nh_code),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_GANZHI_LY_DAY").on(table.c_ly_day_gz),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_GANZHI_FY_DAY").on(table.c_fy_day_gz),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_dynasty").on(table.c_dy),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_assume_office_code").on(table.c_assume_office_code),
	index("POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_appointment_code").on(table.c_appt_code),
	index("POSTED_TO_OFFICE_DATA_POST_DATAc_appt_type_code").on(table.c_appt_code),
	index("POSTED_TO_OFFICE_DATA_c_personid").on(table.c_personid),
	index("POSTED_TO_OFFICE_DATA_c_office_id").on(table.c_office_id),
	index("POSTED_TO_OFFICE_DATA_c_office_category_id").on(table.c_office_category_id),
	index("POSTED_TO_OFFICE_DATA_c_ly_nh_code").on(table.c_ly_nh_code),
	index("POSTED_TO_OFFICE_DATA_c_inst_name_code").on(table.c_inst_name_code),
	index("POSTED_TO_OFFICE_DATA_c_inst_code").on(table.c_inst_code),
	index("POSTED_TO_OFFICE_DATA_c_fy_nh_code").on(table.c_fy_nh_code),
	index("POSTED_TO_OFFICE_DATA_c_assume_office_code").on(table.c_assume_office_code),
	index("POSTED_TO_OFFICE_DATA_PrimaryKey").on(table.c_office_id, table.c_posting_id),
]);

export const POSTING_DATA = sqliteTable("POSTING_DATA", {
	c_personid: integer(),
	c_posting_id: integer().notNull(),
	c_posting_id_old: integer(),
},
(table) => [
	index("POSTING_DATA_POSTING_DATA_PERSON_ID").on(table.c_personid),
	index("POSTING_DATA_c_personid").on(table.c_personid),
	index("POSTING_DATA_PrimaryKey").on(table.c_posting_id),
]);

export const SCHOLARLYTOPIC_CODES = sqliteTable("SCHOLARLYTOPIC_CODES", {
	c_topic_code: integer(),
	c_topic_desc: numeric(),
	c_topic_desc_chn: numeric(),
	c_topic_type_code: integer(),
	c_topic_type_desc: numeric(),
	c_topic_type_desc_chn: numeric(),
	c_sortorder: integer(),
},
(table) => [
	index("SCHOLARLYTOPIC_CODES_c_topic_type_code").on(table.c_topic_type_code),
	index("SCHOLARLYTOPIC_CODES_c_topic_code").on(table.c_topic_code),
	index("SCHOLARLYTOPIC_CODES_PrimaryKey").on(table.c_topic_code),
]);

export const SOCIAL_INSTITUTION_ADDR = sqliteTable("SOCIAL_INSTITUTION_ADDR", {
	c_inst_name_code: integer().notNull(),
	c_inst_code: integer().notNull(),
	c_inst_addr_type_code: integer().notNull(),
	c_inst_addr_begin_year: integer(),
	c_inst_addr_end_year: integer(),
	c_inst_addr_id: integer().notNull(),
	inst_xcoord: real().notNull(),
	inst_ycoord: real().notNull(),
	c_source: integer(),
	c_pages: numeric(),
	c_notes: numeric(),
},
(table) => [
	index("SOCIAL_INSTITUTION_ADDR_SOCIAL_INSTITUTION_ADDR_TYPE").on(table.c_inst_addr_type_code),
	index("SOCIAL_INSTITUTION_ADDR_SOCIAL_INSTITUTION_ADDR_TEXT_CODES").on(table.c_source),
	index("SOCIAL_INSTITUTION_ADDR_SOCIAL_INSTITUTION_ADDR_SOCIAL_INSTITUTION_CODE").on(table.c_inst_name_code, table.c_inst_code),
	index("SOCIAL_INSTITUTION_ADDR_SOCIAL_INSTITUTION_ADDR_ADDR_ID").on(table.c_inst_addr_id),
	index("SOCIAL_INSTITUTION_ADDR_c_new_code").on(table.c_inst_code),
	index("SOCIAL_INSTITUTION_ADDR_c_inst_name_code").on(table.c_inst_name_code),
	index("SOCIAL_INSTITUTION_ADDR_c_inst_addr_type_id").on(table.c_inst_addr_type_code),
	index("SOCIAL_INSTITUTION_ADDR_c_inst_addr_id").on(table.c_inst_addr_id),
	index("SOCIAL_INSTITUTION_ADDR_PrimaryKey").on(table.c_inst_name_code, table.c_inst_code, table.c_inst_addr_type_code, table.inst_xcoord, table.inst_ycoord, table.c_inst_addr_id),
]);

export const SOCIAL_INSTITUTION_ADDR_TYPES = sqliteTable("SOCIAL_INSTITUTION_ADDR_TYPES", {
	c_inst_addr_type_code: integer(),
	c_inst_addr_type_desc: numeric(),
	c_inst_addr_type_chn: numeric(),
	c_notes: numeric(),
},
(table) => [
	index("SOCIAL_INSTITUTION_ADDR_TYPES_c_inst_addr_type_id").on(table.c_inst_addr_type_code),
	index("SOCIAL_INSTITUTION_ADDR_TYPES_PrimaryKey").on(table.c_inst_addr_type_code),
]);

export const SOCIAL_INSTITUTION_ALTNAME_CODES = sqliteTable("SOCIAL_INSTITUTION_ALTNAME_CODES", {
	c_inst_altname_type: integer(),
	c_inst_altname_desc: numeric(),
	c_inst_altname_chn: numeric(),
	c_notes: numeric(),
},
(table) => [
	index("SOCIAL_INSTITUTION_ALTNAME_CODES_PrimaryKey").on(table.c_inst_altname_type),
]);

export const SOCIAL_INSTITUTION_ALTNAME_DATA = sqliteTable("SOCIAL_INSTITUTION_ALTNAME_DATA", {
	c_inst_name_code: integer(),
	c_inst_code: integer(),
	c_inst_altname_type: integer(),
	c_inst_altname_hz: numeric(),
	c_inst_altname_py: numeric(),
	c_source: integer(),
	c_pages: numeric(),
	c_notes: numeric(),
},
(table) => [
	index("SOCIAL_INSTITUTION_ALTNAME_DATA_c_inst_name_code").on(table.c_inst_name_code),
	index("SOCIAL_INSTITUTION_ALTNAME_DATA_c_inst_code").on(table.c_inst_code),
	index("SOCIAL_INSTITUTION_ALTNAME_DATA_c_inst_altname_type_id").on(table.c_inst_altname_type),
	index("SOCIAL_INSTITUTION_ALTNAME_DATA_PrimaryKey").on(table.c_inst_name_code, table.c_inst_code, table.c_inst_altname_type, table.c_inst_altname_hz),
]);

export const SOCIAL_INSTITUTION_CODES = sqliteTable("SOCIAL_INSTITUTION_CODES", {
	c_inst_name_code: integer().notNull(),
	c_inst_code: integer().notNull(),
	c_inst_type_code: integer(),
	c_inst_begin_year: integer(),
	c_by_nianhao_code: integer(),
	c_by_nianhao_year: integer(),
	c_by_year_range: integer(),
	c_inst_begin_dy: integer(),
	c_inst_floruit_dy: integer(),
	c_inst_first_known_year: integer(),
	c_inst_end_year: integer(),
	c_ey_nianhao_code: integer(),
	c_ey_nianhao_year: integer(),
	c_ey_year_range: integer(),
	c_inst_end_dy: integer(),
	c_inst_last_known_year: integer(),
	c_source: integer(),
	c_pages: numeric(),
	c_notes: numeric(),
},
(table) => [
	index("SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_YEAR_RANGE_CODE_EY").on(table.c_ey_year_range),
	index("SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_YEAR_RANGE_CODE_BY").on(table.c_by_year_range),
	index("SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_SOURCE_TEXT_ID").on(table.c_source),
	index("SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_TYPE_CODE").on(table.c_inst_type_code),
	index("SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_NAME_CODE").on(table.c_inst_name_code),
	index("SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_NIAN_HAO_EY").on(table.c_ey_nianhao_code),
	index("SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_NIAN_HAO_BY").on(table.c_by_nianhao_code),
	index("SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_DYNASTY_END").on(table.c_inst_floruit_dy),
	index("SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_DYNASTY_BEGIN").on(table.c_inst_begin_dy),
	index("SOCIAL_INSTITUTION_CODES_c_nianhao_code").on(table.c_by_nianhao_code),
	index("SOCIAL_INSTITUTION_CODES_c_new_code").on(table.c_inst_code),
	index("SOCIAL_INSTITUTION_CODES_c_institution_type_code").on(table.c_inst_type_code),
	index("SOCIAL_INSTITUTION_CODES_c_inst_name_code").on(table.c_inst_name_code),
	index("SOCIAL_INSTITUTION_CODES_c_ey_nianhao_code").on(table.c_ey_nianhao_code),
	index("SOCIAL_INSTITUTION_CODES_PrimaryKey").on(table.c_inst_name_code, table.c_inst_code),
]);

export const SOCIAL_INSTITUTION_CODES_CONVERSION = sqliteTable("SOCIAL_INSTITUTION_CODES_CONVERSION", {
	c_inst_name_code: integer(),
	c_inst_code: integer(),
	c_inst_code_new: integer(),
	c_new_new_code: integer(),
},
(table) => [
	index("SOCIAL_INSTITUTION_CODES_CONVERSION_c_new_new_code").on(table.c_new_new_code),
	index("SOCIAL_INSTITUTION_CODES_CONVERSION_c_institution_code").on(table.c_inst_code),
	index("SOCIAL_INSTITUTION_CODES_CONVERSION_c_inst_name_code").on(table.c_inst_name_code),
	index("SOCIAL_INSTITUTION_CODES_CONVERSION_PrimaryKey").on(table.c_inst_name_code, table.c_inst_code),
]);

export const SOCIAL_INSTITUTION_NAME_CODES = sqliteTable("SOCIAL_INSTITUTION_NAME_CODES", {
	c_inst_name_code: integer(),
	c_inst_name_hz: numeric(),
	c_inst_name_py: numeric(),
},
(table) => [
	index("SOCIAL_INSTITUTION_NAME_CODES_c_inst_name_code").on(table.c_inst_name_code),
	index("SOCIAL_INSTITUTION_NAME_CODES_PrimaryKey").on(table.c_inst_name_code),
]);

export const SOCIAL_INSTITUTION_TYPES = sqliteTable("SOCIAL_INSTITUTION_TYPES", {
	c_inst_type_code: integer(),
	c_inst_type_py: numeric(),
	c_inst_type_hz: numeric(),
},
(table) => [
	index("SOCIAL_INSTITUTION_TYPES_c_institution_type_code").on(table.c_inst_type_code),
	index("SOCIAL_INSTITUTION_TYPES_PrimaryKey").on(table.c_inst_type_code),
]);

export const STATUS_CODE_TYPE_REL = sqliteTable("STATUS_CODE_TYPE_REL", {
	c_status_code: integer(),
	c_status_type_code: numeric(),
},
(table) => [
	index("STATUS_CODE_TYPE_REL_STATUS_CODE_TYPE_REL_STATUS_TYPE").on(table.c_status_type_code),
	index("STATUS_CODE_TYPE_REL_STATUS_CODE_TYPE_REL_STATUS_CODE").on(table.c_status_code),
	index("STATUS_CODE_TYPE_REL_c_status_type_code").on(table.c_status_type_code),
	index("STATUS_CODE_TYPE_REL_c_status_code").on(table.c_status_code),
	index("STATUS_CODE_TYPE_REL_PrimaryKey").on(table.c_status_code, table.c_status_type_code),
]);

export const STATUS_CODES = sqliteTable("STATUS_CODES", {
	c_status_code: integer(),
	c_status_desc: numeric(),
	c_status_desc_chn: numeric(),
},
(table) => [
	index("STATUS_CODES_PrimaryKey").on(table.c_status_code),
]);

export const STATUS_DATA = sqliteTable("STATUS_DATA", {
	c_personid: integer().notNull(),
	c_sequence: integer().notNull(),
	c_status_code: integer().notNull(),
	c_firstyear: integer(),
	c_fy_nh_code: integer(),
	c_fy_nh_year: integer(),
	c_fy_range: integer(),
	c_lastyear: integer(),
	c_ly_nh_code: integer(),
	c_ly_nh_year: integer(),
	c_ly_range: integer(),
	c_supplement: numeric(),
	c_source: integer(),
	c_pages: numeric(),
	c_notes: numeric(),
	c_created_by: numeric(),
	c_created_date: numeric(),
	c_modified_by: numeric(),
	c_modified_date: numeric(),
},
(table) => [
	index("STATUS_DATA_STATUS_DATA_year_range_code_ly").on(table.c_ly_range),
	index("STATUS_DATA_STATUS_DATA_year_range_code_fy").on(table.c_fy_range),
	index("STATUS_DATA_STATUS_DATA_STATUS_CODES").on(table.c_status_code),
	index("STATUS_DATA_STATUS_DATA_SOURCE_TEXT_ID").on(table.c_source),
	index("STATUS_DATA_STATUS_DATA_PERSON_ID").on(table.c_personid),
	index("STATUS_DATA_STATUS_DATA_nian_hao_ly").on(table.c_ly_nh_code),
	index("STATUS_DATA_STATUS_DATA_nian_hao_fy").on(table.c_fy_nh_code),
	index("STATUS_DATA_c_status_code").on(table.c_status_code),
	index("STATUS_DATA_c_personid").on(table.c_personid),
	index("STATUS_DATA_c_ly_nh_code").on(table.c_ly_nh_code),
	index("STATUS_DATA_c_fy_nh_code").on(table.c_fy_nh_code),
	index("STATUS_DATA_PrimaryKey").on(table.c_personid, table.c_sequence, table.c_status_code),
]);

export const STATUS_TYPES = sqliteTable("STATUS_TYPES", {
	c_status_type_code: numeric().notNull(),
	c_status_type_desc: numeric(),
	c_status_type_chn: numeric(),
	c_status_type_parent_code: numeric(),
},
(table) => [
	index("STATUS_TYPES_c_status_type_parent_code").on(table.c_status_type_parent_code),
	index("STATUS_TYPES_c_status_type_code").on(table.c_status_type_code),
	index("STATUS_TYPES_PrimaryKey").on(table.c_status_type_code),
]);

export const TablesFields = sqliteTable("TablesFields", {
	RowNum: integer(),
	DumpTblNm: numeric(),
	DumpFldNm: numeric(),
	AccessTblNm: numeric(),
	AccessFldNm: numeric(),
	IndexOnField: numeric(),
	DataFormat: numeric(),
	NULL_allowed: numeric().notNull(),
	ForeignKey: numeric(),
	ForeignKeyBaseField: numeric(),
},
(table) => [
	index("TablesFields_RowNum").on(table.RowNum),
	index("TablesFields_ForeignKey").on(table.ForeignKey),
	index("TablesFields_PrimaryKey").on(table.AccessTblNm, table.AccessFldNm),
]);

export const TablesFieldsChanges = sqliteTable("TablesFieldsChanges", {
	TableName: numeric(),
	FieldName: numeric(),
	Change: numeric(),
	ChangeDate: numeric(),
	ChangeNotes: numeric(),
},
(table) => [
	index("TablesFieldsChanges_Change").on(table.TableName, table.FieldName, table.Change),
]);

export const TEXT_BIBLCAT_CODE_TYPE_REL = sqliteTable("TEXT_BIBLCAT_CODE_TYPE_REL", {
	c_text_cat_code: integer(),
	c_text_cat_type_id: numeric(),
},
(table) => [
	index("TEXT_BIBLCAT_CODE_TYPE_REL_type_id").on(table.c_text_cat_type_id),
	index("TEXT_BIBLCAT_CODE_TYPE_REL_TEXT_BIBLCAT_CODE_TYPE_REL_TEXT_CAT_TYPE").on(table.c_text_cat_type_id),
	index("TEXT_BIBLCAT_CODE_TYPE_REL_TEXT_BIBLCAT_CODE_TYPE_REL_TEXT_CAT_CODE").on(table.c_text_cat_code),
	index("TEXT_BIBLCAT_CODE_TYPE_REL_code_id").on(table.c_text_cat_code),
	index("TEXT_BIBLCAT_CODE_TYPE_REL_PrimaryKey").on(table.c_text_cat_code, table.c_text_cat_type_id),
]);

export const TEXT_BIBLCAT_CODES = sqliteTable("TEXT_BIBLCAT_CODES", {
	c_text_cat_code: integer().notNull(),
	c_text_cat_desc: numeric(),
	c_text_cat_desc_chn: numeric(),
	c_text_cat_pinyin: numeric(),
	c_text_cat_parent_id: numeric(),
	c_text_cat_level: numeric(),
	c_text_cat_sortorder: integer(),
},
(table) => [
	index("TEXT_BIBLCAT_CODES_c_text_cat_parent_id").on(table.c_text_cat_parent_id),
	index("TEXT_BIBLCAT_CODES_c_genre_code").on(table.c_text_cat_code),
	index("TEXT_BIBLCAT_CODES_PrimaryKey").on(table.c_text_cat_code),
]);

export const TEXT_BIBLCAT_TYPES = sqliteTable("TEXT_BIBLCAT_TYPES", {
	c_text_cat_type_id: numeric(),
	c_text_cat_type_desc: numeric(),
	c_text_cat_type_desc_chn: numeric(),
	c_text_cat_type_parent_id: numeric(),
	c_text_cat_type_level: integer(),
	c_text_cat_type_sortorder: integer(),
},
(table) => [
	index("TEXT_BIBLCAT_TYPES_type_parent_id").on(table.c_text_cat_type_parent_id),
	index("TEXT_BIBLCAT_TYPES_type_id").on(table.c_text_cat_type_id),
	index("TEXT_BIBLCAT_TYPES_PrimaryKey").on(table.c_text_cat_type_id),
]);

export const TEXT_CODES = sqliteTable("TEXT_CODES", {
	c_textid: integer().notNull(),
	c_title_chn: numeric(),
	c_suffix_version: numeric(),
	c_title: numeric(),
	c_title_trans: numeric(),
	c_text_type_id: numeric(),
	c_text_year: integer(),
	c_text_nh_code: integer(),
	c_text_nh_year: integer(),
	c_text_range_code: integer(),
	c_period: numeric(),
	c_bibl_cat_code: integer(),
	c_extant: integer(),
	c_text_country: integer(),
	c_text_dy: integer(),
	c_pub_country: integer(),
	c_pub_dy: integer(),
	c_pub_year: numeric(),
	c_pub_nh_code: integer(),
	c_pub_nh_year: integer(),
	c_pub_range_code: integer(),
	c_pub_loc: numeric(),
	c_publisher: numeric(),
	c_pub_notes: numeric(),
	c_source: integer(),
	c_pages: numeric(),
	c_url_api: numeric(),
	c_url_api_coda: numeric(),
	c_url_homepage: numeric(),
	c_notes: numeric(),
	c_number: numeric(),
	c_counter: numeric(),
	c_title_alt_chn: numeric(),
	c_created_by: numeric(),
	c_created_date: numeric(),
	c_modified_by: numeric(),
	c_modified_date: numeric(),
},
(table) => [
	index("TEXT_CODES_TEXT_CODESc_source").on(table.c_source),
	index("TEXT_CODES_TEXT_CODES_YEAR_RANGE_CODE_TEXT").on(table.c_text_range_code),
	index("TEXT_CODES_TEXT_CODES_YEAR_RANGE_CODE_PUB").on(table.c_pub_range_code),
	index("TEXT_CODES_TEXT_CODES_TEXT_BIBLCAT_CODE").on(table.c_bibl_cat_code),
	index("TEXT_CODES_TEXT_CODES_SOURCE_TEXT_ID").on(table.c_source),
	index("TEXT_CODES_TEXT_CODES_NIAN_HAO_TEXT").on(table.c_text_nh_code),
	index("TEXT_CODES_TEXT_CODES_NIAN_HAO_PUB").on(table.c_pub_nh_code),
	index("TEXT_CODES_TEXT_CODES_EXTANT_CODE").on(table.c_extant),
	index("TEXT_CODES_TEXT_CODES_DYNASTY_TEXT").on(table.c_text_dy),
	index("TEXT_CODES_TEXT_CODES_DYNASTY_PUB").on(table.c_pub_dy),
	index("TEXT_CODES_TEXT_CODES_COUNTRY_CODE_TEXT").on(table.c_text_country),
	index("TEXT_CODES_TEXT_CODES_COUNTRY_CODE_PUB").on(table.c_pub_country),
	index("TEXT_CODES_c_textid").on(table.c_textid),
	index("TEXT_CODES_c_text_type_code").on(table.c_text_type_id),
	index("TEXT_CODES_c_text_range_code").on(table.c_text_range_code),
	index("TEXT_CODES_c_text_nh_code").on(table.c_text_nh_code),
	index("TEXT_CODES_c_genre_code").on(table.c_bibl_cat_code),
	index("TEXT_CODES_PrimaryKey").on(table.c_textid),
]);

export const TEXT_INSTANCE_DATA = sqliteTable("TEXT_INSTANCE_DATA", {
	c_textid: integer().notNull(),
	c_text_edition_id: integer().notNull(),
	c_text_instance_id: integer().notNull(),
	c_instance_title_chn: numeric(),
	c_instance_title: numeric(),
	c_instance_title_trans: numeric(),
	c_part_of_instance: integer(),
	c_part_of_instance_notes: numeric(),
	c_pub_country: integer(),
	c_pub_dy: integer(),
	c_pub_year: numeric(),
	c_pub_nh_code: integer(),
	c_pub_nh_year: integer(),
	c_pub_range_code: integer(),
	c_pub_loc: numeric(),
	c_publisher: numeric(),
	c_print: numeric(),
	c_pub_notes: numeric(),
	c_source: integer(),
	c_pages: numeric(),
	c_extant: integer(),
	c_url_api: numeric(),
	c_url_homepage: numeric(),
	c_notes: numeric(),
	c_number: numeric(),
	c_counter: numeric(),
	c_title_alt_chn: numeric(),
	c_created_by: numeric(),
	c_created_date: numeric(),
	c_modified_by: numeric(),
	c_modified_date: numeric(),
},
(table) => [
	index("TEXT_INSTANCE_DATA_TEXT_INSTANCE_TEXT_ID").on(table.c_textid),
	index("TEXT_INSTANCE_DATA_TEXT_INSTANCE_SOURCE_ID").on(table.c_source),
	index("TEXT_INSTANCE_DATA_TEXT_INSTANCE_PUB_RANGE").on(table.c_pub_range_code),
	index("TEXT_INSTANCE_DATA_TEXT_INSTANCE_PUB_NIANHAO").on(table.c_pub_nh_code),
	index("TEXT_INSTANCE_DATA_TEXT_INSTANCE_PUB_DYNASTY").on(table.c_pub_dy),
	index("TEXT_INSTANCE_DATA_TEXT_INSTANCE_COUNTRY").on(table.c_pub_country),
	index("TEXT_INSTANCE_DATA_c_textid").on(table.c_textid),
	index("TEXT_INSTANCE_DATA_c_text_instance_id").on(table.c_text_instance_id),
	index("TEXT_INSTANCE_DATA_c_text_edition_id").on(table.c_text_edition_id),
	index("TEXT_INSTANCE_DATA_c_pub_range_code").on(table.c_pub_range_code),
	index("TEXT_INSTANCE_DATA_c_pub_nh_code").on(table.c_pub_nh_code),
	index("TEXT_INSTANCE_DATA_PrimaryKey").on(table.c_textid, table.c_text_edition_id, table.c_text_instance_id),
]);

export const TEXT_ROLE_CODES = sqliteTable("TEXT_ROLE_CODES", {
	c_role_id: integer(),
	c_role_desc: numeric(),
	c_role_desc_chn: numeric(),
},
(table) => [
	index("TEXT_ROLE_CODES_c_role_id").on(table.c_role_id),
	index("TEXT_ROLE_CODES_PrimaryKey").on(table.c_role_id),
]);

export const TEXT_TYPE = sqliteTable("TEXT_TYPE", {
	c_text_type_code: numeric(),
	c_text_type_desc: numeric(),
	c_text_type_desc_chn: numeric(),
	c_text_type_parent_id: numeric(),
	c_text_type_level: integer(),
	c_text_type_sortorder: integer(),
},
(table) => [
	index("TEXT_TYPE_c_text_type_parent_id").on(table.c_text_type_parent_id),
	index("TEXT_TYPE_c_text_type_code").on(table.c_text_type_code),
]);

export const TMP_INDEX_YEAR = sqliteTable("TMP_INDEX_YEAR", {
	c_personid: integer().notNull(),
	c_index_year: integer(),
	c_index_year_source_id: integer(),
},
(table) => [
	index("TMP_INDEX_YEAR_c_personid").on(table.c_personid),
	index("TMP_INDEX_YEAR_c_index_year_source_id").on(table.c_index_year_source_id),
	index("TMP_INDEX_YEAR_PrimaryKey").on(table.c_personid),
]);

export const YEAR_RANGE_CODES = sqliteTable("YEAR_RANGE_CODES", {
	c_range_code: integer(),
	c_range: numeric(),
	c_range_chn: numeric(),
	c_approx: numeric(),
	c_approx_chn: numeric(),
},
(table) => [
	index("YEAR_RANGE_CODES_c_range_code").on(table.c_range_code),
	index("YEAR_RANGE_CODES_PrimaryKey").on(table.c_range_code),
]);


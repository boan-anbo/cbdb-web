-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `ADDR_BELONGS_DATA` (
	`c_addr_id` integer NOT NULL,
	`c_belongs_to` integer NOT NULL,
	`c_firstyear` integer NOT NULL,
	`c_lastyear` integer NOT NULL,
	`c_source` integer,
	`c_pages` numeric,
	`c_secondary_source_author` numeric,
	`c_notes` numeric
);
--> statement-breakpoint
CREATE INDEX `ADDR_BELONGS_DATA_ZZZ_ADDR_BELONGSc_addr_id` ON `ADDR_BELONGS_DATA` (`c_addr_id`);--> statement-breakpoint
CREATE INDEX `ADDR_BELONGS_DATA_Belongs` ON `ADDR_BELONGS_DATA` (`c_belongs_to`,`c_addr_id`);--> statement-breakpoint
CREATE INDEX `ADDR_BELONGS_DATA_PrimaryKey` ON `ADDR_BELONGS_DATA` (`c_addr_id`,`c_belongs_to`,`c_firstyear`,`c_lastyear`);--> statement-breakpoint
CREATE TABLE `ADDR_CODES` (
	`c_addr_id` integer,
	`c_name` numeric,
	`c_name_chn` numeric,
	`c_firstyear` integer,
	`c_lastyear` integer,
	`c_admin_type` numeric,
	`x_coord` real,
	`y_coord` real,
	`CHGIS_PT_ID` integer,
	`c_notes` numeric,
	`c_alt_names` numeric
);
--> statement-breakpoint
CREATE INDEX `ADDR_CODES_CHGIS_PT_ID` ON `ADDR_CODES` (`CHGIS_PT_ID`);--> statement-breakpoint
CREATE INDEX `ADDR_CODES_PrimaryKey` ON `ADDR_CODES` (`c_addr_id`);--> statement-breakpoint
CREATE TABLE `ADDR_PLACE_DATA` (
	`c_addr_id` integer,
	`c_place_id` integer,
	`c_firstyear` integer,
	`c_lastyear` integer
);
--> statement-breakpoint
CREATE INDEX `ADDR_PLACE_DATA_c_place_id` ON `ADDR_PLACE_DATA` (`c_place_id`);--> statement-breakpoint
CREATE INDEX `ADDR_PLACE_DATA_c_addr_id` ON `ADDR_PLACE_DATA` (`c_addr_id`);--> statement-breakpoint
CREATE TABLE `ADDR_XY` (
	`c_addr_id` integer,
	`x_coord` real,
	`y_coord` real,
	`c_source_reference` numeric,
	`c_source_id` integer,
	`c_notes` numeric
);
--> statement-breakpoint
CREATE INDEX `ADDR_XY_CHGIS_PT_ID` ON `ADDR_XY` (`c_source_reference`);--> statement-breakpoint
CREATE INDEX `ADDR_XY_c_source_id` ON `ADDR_XY` (`c_source_id`);--> statement-breakpoint
CREATE INDEX `ADDR_XY_PrimaryKey` ON `ADDR_XY` (`c_addr_id`);--> statement-breakpoint
CREATE TABLE `ADDRESSES` (
	`c_addr_id` integer,
	`c_addr_cbd` numeric,
	`c_name` numeric,
	`c_name_chn` numeric,
	`c_admin_type` numeric,
	`c_firstyear` integer,
	`c_lastyear` integer,
	`x_coord` real,
	`y_coord` real,
	`belongs1_ID` integer,
	`belongs1_Name` numeric,
	`belongs2_ID` integer,
	`belongs2_Name` numeric,
	`belongs3_ID` integer,
	`belongs3_Name` numeric,
	`belongs4_ID` integer,
	`belongs4_Name` numeric,
	`belongs5_ID` integer,
	`belongs5_Name` numeric
);
--> statement-breakpoint
CREATE INDEX `ADDRESSES_c_addr_id` ON `ADDRESSES` (`c_addr_id`);--> statement-breakpoint
CREATE INDEX `ADDRESSES_belongs5_ID` ON `ADDRESSES` (`belongs5_ID`);--> statement-breakpoint
CREATE INDEX `ADDRESSES_belongs4_ID` ON `ADDRESSES` (`belongs4_ID`);--> statement-breakpoint
CREATE INDEX `ADDRESSES_belongs3_ID` ON `ADDRESSES` (`belongs3_ID`);--> statement-breakpoint
CREATE INDEX `ADDRESSES_belongs2_ID` ON `ADDRESSES` (`belongs2_ID`);--> statement-breakpoint
CREATE INDEX `ADDRESSES_belongs1_ID` ON `ADDRESSES` (`belongs1_ID`);--> statement-breakpoint
CREATE TABLE `ALTNAME_CODES` (
	`c_name_type_code` integer,
	`c_name_type_desc` numeric,
	`c_name_type_desc_chn` numeric
);
--> statement-breakpoint
CREATE INDEX `ALTNAME_CODES_PrimaryKey` ON `ALTNAME_CODES` (`c_name_type_code`);--> statement-breakpoint
CREATE TABLE `ALTNAME_DATA` (
	`c_personid` integer NOT NULL,
	`c_alt_name` numeric,
	`c_alt_name_chn` numeric NOT NULL,
	`c_alt_name_type_code` integer NOT NULL,
	`c_sequence` integer,
	`c_source` integer,
	`c_pages` numeric,
	`c_notes` numeric,
	`c_created_by` numeric,
	`c_created_date` numeric,
	`c_modified_by` numeric,
	`c_modified_date` numeric
);
--> statement-breakpoint
CREATE INDEX `ALTNAME_DATA_c_personid` ON `ALTNAME_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `ALTNAME_DATA_c_alt_name_type_code` ON `ALTNAME_DATA` (`c_alt_name_type_code`);--> statement-breakpoint
CREATE INDEX `ALTNAME_DATA_Primary Key` ON `ALTNAME_DATA` (`c_personid`,`c_alt_name_chn`,`c_alt_name_type_code`);--> statement-breakpoint
CREATE TABLE `APPOINTMENT_CODE_TYPE_REL` (
	`c_appt_code` integer NOT NULL,
	`c_appt_type_code` numeric NOT NULL
);
--> statement-breakpoint
CREATE INDEX `APPOINTMENT_CODE_TYPE_REL_c_appt_type_code` ON `APPOINTMENT_CODE_TYPE_REL` (`c_appt_type_code`);--> statement-breakpoint
CREATE INDEX `APPOINTMENT_CODE_TYPE_REL_c_appt_code` ON `APPOINTMENT_CODE_TYPE_REL` (`c_appt_code`);--> statement-breakpoint
CREATE INDEX `APPOINTMENT_CODE_TYPE_REL_PrimaryKey` ON `APPOINTMENT_CODE_TYPE_REL` (`c_appt_code`,`c_appt_type_code`);--> statement-breakpoint
CREATE TABLE `APPOINTMENT_CODES` (
	`c_appt_code` integer NOT NULL,
	`c_appt_desc_chn` numeric,
	`c_appt_desc` numeric,
	`c_appt_desc_chn_alt` numeric,
	`c_appt_desc_alt` numeric,
	`check` integer,
	`c_notes` numeric
);
--> statement-breakpoint
CREATE INDEX `APPOINTMENT_CODES_c_appointment_code` ON `APPOINTMENT_CODES` (`c_appt_code`);--> statement-breakpoint
CREATE INDEX `APPOINTMENT_CODES_PrimaryKey` ON `APPOINTMENT_CODES` (`c_appt_code`);--> statement-breakpoint
CREATE TABLE `APPOINTMENT_TYPES` (
	`c_appt_type_code` numeric NOT NULL,
	`c_appt_type_desc_chn` numeric,
	`c_appt_type_desc` numeric,
	`c_notes` numeric
);
--> statement-breakpoint
CREATE INDEX `APPOINTMENT_TYPES_c_appointment_code` ON `APPOINTMENT_TYPES` (`c_appt_type_code`);--> statement-breakpoint
CREATE INDEX `APPOINTMENT_TYPES_PrimaryKey` ON `APPOINTMENT_TYPES` (`c_appt_type_code`);--> statement-breakpoint
CREATE TABLE `ASSOC_CODE_TYPE_REL` (
	`c_assoc_code` integer NOT NULL,
	`c_assoc_type_code` numeric NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ASSOC_CODE_TYPE_REL_type_id` ON `ASSOC_CODE_TYPE_REL` (`c_assoc_type_code`);--> statement-breakpoint
CREATE INDEX `ASSOC_CODE_TYPE_REL_PrimaryKey` ON `ASSOC_CODE_TYPE_REL` (`c_assoc_code`,`c_assoc_type_code`);--> statement-breakpoint
CREATE INDEX `ASSOC_CODE_TYPE_REL_code_id` ON `ASSOC_CODE_TYPE_REL` (`c_assoc_code`);--> statement-breakpoint
CREATE TABLE `ASSOC_CODES` (
	`c_assoc_code` integer,
	`c_assoc_pair` integer,
	`c_assoc_pair2` integer,
	`c_assoc_desc` numeric,
	`c_assoc_desc_chn` numeric,
	`c_assoc_role_type` numeric,
	`c_sortorder` integer,
	`c_example` numeric
);
--> statement-breakpoint
CREATE INDEX `ASSOC_CODES_c_assoc_code` ON `ASSOC_CODES` (`c_assoc_code`);--> statement-breakpoint
CREATE INDEX `ASSOC_CODES_ASSOC_CODESc_assoc_pair2` ON `ASSOC_CODES` (`c_assoc_pair2`);--> statement-breakpoint
CREATE INDEX `ASSOC_CODES_ASSOC_CODESc_assoc_pair` ON `ASSOC_CODES` (`c_assoc_pair`);--> statement-breakpoint
CREATE INDEX `ASSOC_CODES_PrimaryKey` ON `ASSOC_CODES` (`c_assoc_code`);--> statement-breakpoint
CREATE TABLE `ASSOC_DATA` (
	`c_assoc_code` integer NOT NULL,
	`c_personid` integer NOT NULL,
	`c_kin_code` integer NOT NULL,
	`c_kin_id` integer NOT NULL,
	`c_assoc_id` integer NOT NULL,
	`c_assoc_kin_code` integer NOT NULL,
	`c_assoc_kin_id` integer NOT NULL,
	`c_tertiary_personid` integer,
	`c_tertiary_type_notes` numeric,
	`c_assoc_count` integer,
	`c_sequence` integer,
	`c_assoc_first_year` integer NOT NULL,
	`c_assoc_last_year` integer,
	`c_source` integer,
	`c_pages` numeric,
	`c_notes` numeric,
	`c_assoc_fy_nh_code` integer,
	`c_assoc_fy_nh_year` integer,
	`c_assoc_fy_range` integer,
	`c_assoc_fy_intercalary` numeric NOT NULL,
	`c_assoc_fy_month` integer,
	`c_assoc_fy_day` integer,
	`c_assoc_fy_day_gz` integer,
	`c_assoc_ly_nh_code` integer,
	`c_assoc_ly_nh_year` integer,
	`c_assoc_ly_range` integer,
	`c_assoc_ly_intercalary` numeric NOT NULL,
	`c_assoc_ly_month` integer,
	`c_assoc_ly_day` integer,
	`c_assoc_ly_day_gz` integer,
	`c_addr_id` integer,
	`c_litgenre_code` integer,
	`c_occasion_code` integer,
	`c_topic_code` integer,
	`c_inst_code` integer,
	`c_inst_name_code` integer,
	`c_text_title` numeric NOT NULL,
	`c_assoc_claimer_id` integer,
	`c_created_by` numeric,
	`c_created_date` numeric,
	`c_modified_by` numeric,
	`c_modified_date` numeric
);
--> statement-breakpoint
CREATE INDEX `ASSOC_DATA_c_personid` ON `ASSOC_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `ASSOC_DATA_c_kin_id` ON `ASSOC_DATA` (`c_kin_id`);--> statement-breakpoint
CREATE INDEX `ASSOC_DATA_c_kin_code` ON `ASSOC_DATA` (`c_kin_code`);--> statement-breakpoint
CREATE INDEX `ASSOC_DATA_c_inst_name_code` ON `ASSOC_DATA` (`c_inst_name_code`);--> statement-breakpoint
CREATE INDEX `ASSOC_DATA_c_inst_code` ON `ASSOC_DATA` (`c_inst_code`,`c_inst_name_code`);--> statement-breakpoint
CREATE INDEX `ASSOC_DATA_c_assoc_ly_nh_code` ON `ASSOC_DATA` (`c_assoc_ly_nh_code`);--> statement-breakpoint
CREATE INDEX `ASSOC_DATA_c_assoc_kin_code` ON `ASSOC_DATA` (`c_assoc_kin_code`);--> statement-breakpoint
CREATE INDEX `ASSOC_DATA_c_assoc_id` ON `ASSOC_DATA` (`c_assoc_id`);--> statement-breakpoint
CREATE INDEX `ASSOC_DATA_c_assoc_code` ON `ASSOC_DATA` (`c_assoc_code`);--> statement-breakpoint
CREATE INDEX `ASSOC_DATA_c_addr_id` ON `ASSOC_DATA` (`c_addr_id`);--> statement-breakpoint
CREATE INDEX `ASSOC_DATA_assoc_kin_id` ON `ASSOC_DATA` (`c_assoc_kin_id`);--> statement-breakpoint
CREATE INDEX `ASSOC_DATA_Primary Key` ON `ASSOC_DATA` (`c_assoc_code`,`c_personid`,`c_assoc_id`,`c_kin_code`,`c_kin_id`,`c_assoc_kin_code`,`c_assoc_kin_id`,`c_text_title`,`c_assoc_first_year`);--> statement-breakpoint
CREATE TABLE `ASSOC_TYPES` (
	`c_assoc_type_code` numeric NOT NULL,
	`c_assoc_type_desc` numeric,
	`c_assoc_type_desc_chn` numeric,
	`c_assoc_type_parent_id` numeric,
	`c_assoc_type_level` integer,
	`c_assoc_type_sortorder` integer,
	`c_assoc_type_short_desc` numeric
);
--> statement-breakpoint
CREATE INDEX `ASSOC_TYPES_type_parent_id` ON `ASSOC_TYPES` (`c_assoc_type_parent_id`);--> statement-breakpoint
CREATE INDEX `ASSOC_TYPES_type_id` ON `ASSOC_TYPES` (`c_assoc_type_code`);--> statement-breakpoint
CREATE INDEX `ASSOC_TYPES_PrimaryKey` ON `ASSOC_TYPES` (`c_assoc_type_code`);--> statement-breakpoint
CREATE TABLE `ASSUME_OFFICE_CODES` (
	`c_assume_office_code` integer,
	`c_assume_office_desc_chn` numeric,
	`c_assume_office_desc` numeric
);
--> statement-breakpoint
CREATE INDEX `ASSUME_OFFICE_CODES_c_appointment_code` ON `ASSUME_OFFICE_CODES` (`c_assume_office_code`);--> statement-breakpoint
CREATE INDEX `ASSUME_OFFICE_CODES_PrimaryKey` ON `ASSUME_OFFICE_CODES` (`c_assume_office_code`);--> statement-breakpoint
CREATE TABLE `BIOG_ADDR_CODES` (
	`c_addr_type` integer NOT NULL,
	`c_addr_desc` numeric,
	`c_addr_desc_chn` numeric,
	`c_addr_note` numeric,
	`c_index_addr_rank` integer,
	`c_index_addr_default_rank` integer
);
--> statement-breakpoint
CREATE INDEX `BIOG_ADDR_CODES_PrimaryKey` ON `BIOG_ADDR_CODES` (`c_addr_type`);--> statement-breakpoint
CREATE TABLE `BIOG_ADDR_DATA` (
	`c_personid` integer NOT NULL,
	`c_addr_id` integer NOT NULL,
	`c_addr_type` integer NOT NULL,
	`c_sequence` integer NOT NULL,
	`c_firstyear` integer,
	`c_lastyear` integer,
	`c_source` integer,
	`c_pages` numeric,
	`c_notes` numeric,
	`c_fy_nh_code` integer,
	`c_ly_nh_code` integer,
	`c_fy_nh_year` integer,
	`c_ly_nh_year` integer,
	`c_fy_range` integer,
	`c_ly_range` integer,
	`c_natal` integer,
	`c_fy_intercalary` numeric NOT NULL,
	`c_ly_intercalary` numeric NOT NULL,
	`c_fy_month` integer,
	`c_ly_month` integer,
	`c_fy_day` integer,
	`c_ly_day` integer,
	`c_fy_day_gz` integer,
	`c_ly_day_gz` integer,
	`c_created_by` numeric,
	`c_created_date` numeric,
	`c_modified_by` numeric,
	`c_modified_date` numeric,
	`c_delete` integer
);
--> statement-breakpoint
CREATE INDEX `BIOG_ADDR_DATA_c_personid` ON `BIOG_ADDR_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `BIOG_ADDR_DATA_c_addr_id` ON `BIOG_ADDR_DATA` (`c_addr_id`);--> statement-breakpoint
CREATE INDEX `BIOG_ADDR_DATA_BIOG_ADDR_DATAc_addr_type` ON `BIOG_ADDR_DATA` (`c_addr_type`);--> statement-breakpoint
CREATE INDEX `BIOG_ADDR_DATA_addr_type` ON `BIOG_ADDR_DATA` (`c_personid`,`c_addr_type`);--> statement-breakpoint
CREATE INDEX `BIOG_ADDR_DATA_PrimaryKey` ON `BIOG_ADDR_DATA` (`c_personid`,`c_addr_id`,`c_addr_type`,`c_sequence`);--> statement-breakpoint
CREATE TABLE `BIOG_INST_CODES` (
	`c_bi_role_code` integer,
	`c_bi_role_desc` numeric,
	`c_bi_role_chn` numeric,
	`c_notes` numeric
);
--> statement-breakpoint
CREATE INDEX `BIOG_INST_CODES_c_bi_role_code` ON `BIOG_INST_CODES` (`c_bi_role_code`);--> statement-breakpoint
CREATE INDEX `BIOG_INST_CODES_PrimaryKey` ON `BIOG_INST_CODES` (`c_bi_role_code`);--> statement-breakpoint
CREATE TABLE `BIOG_INST_DATA` (
	`c_personid` integer NOT NULL,
	`c_inst_name_code` integer NOT NULL,
	`c_inst_code` integer NOT NULL,
	`c_bi_role_code` integer NOT NULL,
	`c_bi_begin_year` integer,
	`c_bi_by_nh_code` integer,
	`c_bi_by_nh_year` integer,
	`c_bi_by_range` integer,
	`c_bi_end_year` integer,
	`c_bi_ey_nh_code` integer,
	`c_bi_ey_nh_year` integer,
	`c_bi_ey_range` integer,
	`c_source` integer,
	`c_pages` numeric,
	`c_notes` numeric,
	`c_created_by` numeric,
	`c_created_date` numeric,
	`c_modified_by` numeric,
	`c_modified_date` numeric,
	`tts_sysno` integer
);
--> statement-breakpoint
CREATE INDEX `BIOG_INST_DATA_c_personid` ON `BIOG_INST_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `BIOG_INST_DATA_c_inst_name_code` ON `BIOG_INST_DATA` (`c_inst_name_code`);--> statement-breakpoint
CREATE INDEX `BIOG_INST_DATA_c_inst_code` ON `BIOG_INST_DATA` (`c_inst_name_code`,`c_inst_code`);--> statement-breakpoint
CREATE INDEX `BIOG_INST_DATA_c_biog_inst_code` ON `BIOG_INST_DATA` (`c_bi_role_code`);--> statement-breakpoint
CREATE INDEX `BIOG_INST_DATA_c_bi_ey_nh_code` ON `BIOG_INST_DATA` (`c_bi_ey_nh_code`);--> statement-breakpoint
CREATE INDEX `BIOG_INST_DATA_c_bi_by_nh_code` ON `BIOG_INST_DATA` (`c_bi_by_nh_code`);--> statement-breakpoint
CREATE INDEX `BIOG_INST_DATA_PrimaryKey` ON `BIOG_INST_DATA` (`c_personid`,`c_inst_name_code`,`c_inst_code`,`c_bi_role_code`);--> statement-breakpoint
CREATE TABLE `BIOG_MAIN` (
	`c_personid` integer NOT NULL,
	`c_name` numeric,
	`c_name_chn` numeric,
	`c_index_year` integer,
	`c_index_year_type_code` numeric,
	`c_index_year_source_id` integer,
	`c_female` numeric NOT NULL,
	`c_index_addr_id` integer,
	`c_index_addr_type_code` integer,
	`c_ethnicity_code` integer,
	`c_household_status_code` integer,
	`c_tribe` numeric,
	`c_birthyear` integer,
	`c_by_nh_code` integer,
	`c_by_nh_year` integer,
	`c_by_range` integer,
	`c_deathyear` integer,
	`c_dy_nh_code` integer,
	`c_dy_nh_year` integer,
	`c_dy_range` integer,
	`c_death_age` integer,
	`c_death_age_range` integer,
	`c_fl_earliest_year` integer,
	`c_fl_ey_nh_code` integer,
	`c_fl_ey_nh_year` integer,
	`c_fl_ey_notes` numeric,
	`c_fl_latest_year` integer,
	`c_fl_ly_nh_code` integer,
	`c_fl_ly_nh_year` integer,
	`c_fl_ly_notes` numeric,
	`c_surname` numeric,
	`c_surname_chn` numeric,
	`c_mingzi` numeric,
	`c_mingzi_chn` numeric,
	`c_dy` integer,
	`c_choronym_code` integer,
	`c_notes` numeric,
	`c_by_intercalary` numeric NOT NULL,
	`c_dy_intercalary` numeric NOT NULL,
	`c_by_month` integer,
	`c_dy_month` integer,
	`c_by_day` integer,
	`c_dy_day` integer,
	`c_by_day_gz` integer,
	`c_dy_day_gz` integer,
	`c_surname_proper` numeric,
	`c_mingzi_proper` numeric,
	`c_name_proper` numeric,
	`c_surname_rm` numeric,
	`c_mingzi_rm` numeric,
	`c_name_rm` numeric,
	`c_created_by` numeric,
	`c_created_date` numeric,
	`c_modified_by` numeric,
	`c_modified_date` numeric,
	`c_self_bio` numeric NOT NULL
);
--> statement-breakpoint
CREATE INDEX `BIOG_MAIN_c_personid` ON `BIOG_MAIN` (`c_personid`);--> statement-breakpoint
CREATE INDEX `BIOG_MAIN_c_name_chn` ON `BIOG_MAIN` (`c_name_chn`);--> statement-breakpoint
CREATE INDEX `BIOG_MAIN_c_name` ON `BIOG_MAIN` (`c_name`);--> statement-breakpoint
CREATE INDEX `BIOG_MAIN_c_index_addr_type_code` ON `BIOG_MAIN` (`c_index_addr_type_code`);--> statement-breakpoint
CREATE INDEX `BIOG_MAIN_c_index_addr_id` ON `BIOG_MAIN` (`c_index_addr_id`);--> statement-breakpoint
CREATE INDEX `BIOG_MAIN_PrimaryKey` ON `BIOG_MAIN` (`c_personid`);--> statement-breakpoint
CREATE TABLE `BIOG_SOURCE_DATA` (
	`c_personid` integer NOT NULL,
	`c_textid` integer NOT NULL,
	`c_pages` numeric NOT NULL,
	`c_notes` numeric,
	`c_main_source` numeric NOT NULL,
	`c_self_bio` numeric NOT NULL
);
--> statement-breakpoint
CREATE INDEX `BIOG_SOURCE_DATA_DB_PERSON_ID` ON `BIOG_SOURCE_DATA` (`c_pages`);--> statement-breakpoint
CREATE INDEX `BIOG_SOURCE_DATA_DB_ID` ON `BIOG_SOURCE_DATA` (`c_textid`);--> statement-breakpoint
CREATE INDEX `BIOG_SOURCE_DATA_c_personid` ON `BIOG_SOURCE_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `BIOG_SOURCE_DATA_Primary key` ON `BIOG_SOURCE_DATA` (`c_personid`,`c_textid`,`c_pages`);--> statement-breakpoint
CREATE TABLE `BIOG_TEXT_DATA` (
	`c_textid` integer NOT NULL,
	`c_personid` integer NOT NULL,
	`c_role_id` integer NOT NULL,
	`c_year` integer,
	`c_nh_code` integer,
	`c_nh_year` integer,
	`c_range_code` integer,
	`c_source` integer,
	`c_pages` numeric,
	`c_notes` numeric,
	`c_created_by` numeric,
	`c_created_date` numeric,
	`c_modified_by` numeric,
	`c_modified_date` numeric
);
--> statement-breakpoint
CREATE INDEX `BIOG_TEXT_DATA_c_textid` ON `BIOG_TEXT_DATA` (`c_textid`);--> statement-breakpoint
CREATE INDEX `BIOG_TEXT_DATA_c_role_id` ON `BIOG_TEXT_DATA` (`c_role_id`);--> statement-breakpoint
CREATE INDEX `BIOG_TEXT_DATA_c_range_code` ON `BIOG_TEXT_DATA` (`c_range_code`);--> statement-breakpoint
CREATE INDEX `BIOG_TEXT_DATA_c_personid` ON `BIOG_TEXT_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `BIOG_TEXT_DATA_c_nh_code` ON `BIOG_TEXT_DATA` (`c_nh_code`);--> statement-breakpoint
CREATE INDEX `BIOG_TEXT_DATA_BIOG_TEXT_DATA_YEAR_RANGE_CODE` ON `BIOG_TEXT_DATA` (`c_range_code`);--> statement-breakpoint
CREATE INDEX `BIOG_TEXT_DATA_BIOG_TEXT_DATA_TEXT_ROLE_CODE` ON `BIOG_TEXT_DATA` (`c_role_id`);--> statement-breakpoint
CREATE INDEX `BIOG_TEXT_DATA_BIOG_TEXT_DATA_TEXT_ID` ON `BIOG_TEXT_DATA` (`c_textid`);--> statement-breakpoint
CREATE INDEX `BIOG_TEXT_DATA_BIOG_TEXT_DATA_SOURCE_TEXT_ID` ON `BIOG_TEXT_DATA` (`c_source`);--> statement-breakpoint
CREATE INDEX `BIOG_TEXT_DATA_BIOG_TEXT_DATA_PERSON_ID` ON `BIOG_TEXT_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `BIOG_TEXT_DATA_BIOG_TEXT_DATA_NIAN_HAO` ON `BIOG_TEXT_DATA` (`c_nh_code`);--> statement-breakpoint
CREATE INDEX `BIOG_TEXT_DATA_PrimaryKey` ON `BIOG_TEXT_DATA` (`c_textid`,`c_personid`,`c_role_id`);--> statement-breakpoint
CREATE TABLE `CHORONYM_CODES` (
	`c_choronym_code` integer,
	`c_choronym_desc` numeric,
	`c_choronym_chn` numeric
);
--> statement-breakpoint
CREATE INDEX `CHORONYM_CODES_PrimaryKey` ON `CHORONYM_CODES` (`c_choronym_code`);--> statement-breakpoint
CREATE TABLE `Copy Of CopyTables` (
	`TableName` numeric NOT NULL,
	`NotProcessed` numeric NOT NULL
);
--> statement-breakpoint
CREATE INDEX `Copy Of CopyTables_PrimaryKey` ON `Copy Of CopyTables` (`TableName`);--> statement-breakpoint
CREATE TABLE `CopyMissingTables` (
	`ID` integer NOT NULL,
	`TableName` numeric
);
--> statement-breakpoint
CREATE INDEX `CopyMissingTables_PrimaryKey` ON `CopyMissingTables` (`ID`);--> statement-breakpoint
CREATE TABLE `CopyTables` (
	`TableName` numeric NOT NULL,
	`NotProcessed` numeric NOT NULL
);
--> statement-breakpoint
CREATE INDEX `CopyTables_PrimaryKey` ON `CopyTables` (`TableName`);--> statement-breakpoint
CREATE TABLE `CopyTablesDefault` (
	`ID` integer NOT NULL,
	`TableName` numeric
);
--> statement-breakpoint
CREATE INDEX `CopyTablesDefault_PrimaryKey` ON `CopyTablesDefault` (`ID`);--> statement-breakpoint
CREATE TABLE `COUNTRY_CODES` (
	`c_country_code` integer,
	`c_country_desc` numeric,
	`c_country_desc_chn` numeric
);
--> statement-breakpoint
CREATE INDEX `COUNTRY_CODES_c_country_code` ON `COUNTRY_CODES` (`c_country_code`);--> statement-breakpoint
CREATE INDEX `COUNTRY_CODES_PrimaryKey` ON `COUNTRY_CODES` (`c_country_code`);--> statement-breakpoint
CREATE TABLE `DATABASE_LINK_CODES` (
	`c_db_id` integer,
	`c_db_URL` numeric,
	`c_db_name` numeric,
	`c_db_name_trans_chn` numeric,
	`c_db_name_trans_eng` numeric,
	`c_db_institution` numeric,
	`c_db_institution_trans_chn` numeric,
	`c_db_institution_trans_eng` numeric,
	`c_db_date_of_origin` numeric,
	`c_db_contact person` numeric,
	`c_DB_URL_FIRST_STRING` numeric,
	`c_DB_URL_SECOND_STRING` numeric,
	`c_notes` numeric
);
--> statement-breakpoint
CREATE INDEX `DATABASE_LINK_CODES_c_db_id` ON `DATABASE_LINK_CODES` (`c_db_id`);--> statement-breakpoint
CREATE INDEX `DATABASE_LINK_CODES_PrimaryKey` ON `DATABASE_LINK_CODES` (`c_db_id`);--> statement-breakpoint
CREATE TABLE `DATABASE_LINK_DATA` (
	`c_person_id` integer,
	`c_db_id` integer,
	`c_db_sys_id` numeric
);
--> statement-breakpoint
CREATE INDEX `DATABASE_LINK_DATA_DB_PERSON_ID` ON `DATABASE_LINK_DATA` (`c_db_sys_id`);--> statement-breakpoint
CREATE INDEX `DATABASE_LINK_DATA_DB_ID` ON `DATABASE_LINK_DATA` (`c_db_id`);--> statement-breakpoint
CREATE INDEX `DATABASE_LINK_DATA_c_personid` ON `DATABASE_LINK_DATA` (`c_person_id`);--> statement-breakpoint
CREATE INDEX `DATABASE_LINK_DATA_Primary key` ON `DATABASE_LINK_DATA` (`c_person_id`,`c_db_id`,`c_db_sys_id`);--> statement-breakpoint
CREATE TABLE `DYNASTIES` (
	`c_dy` integer,
	`c_dynasty` numeric,
	`c_dynasty_chn` numeric,
	`c_start` integer,
	`c_end` integer,
	`c_sort` integer
);
--> statement-breakpoint
CREATE INDEX `DYNASTIES_PrimaryKey` ON `DYNASTIES` (`c_dy`);--> statement-breakpoint
CREATE TABLE `ENTRY_CODE_TYPE_REL` (
	`c_entry_code` integer,
	`c_entry_type` numeric
);
--> statement-breakpoint
CREATE INDEX `ENTRY_CODE_TYPE_REL_type_id` ON `ENTRY_CODE_TYPE_REL` (`c_entry_type`);--> statement-breakpoint
CREATE INDEX `ENTRY_CODE_TYPE_REL_code_id` ON `ENTRY_CODE_TYPE_REL` (`c_entry_code`);--> statement-breakpoint
CREATE INDEX `ENTRY_CODE_TYPE_REL_PrimaryKey` ON `ENTRY_CODE_TYPE_REL` (`c_entry_code`,`c_entry_type`);--> statement-breakpoint
CREATE TABLE `ENTRY_CODES` (
	`c_entry_code` integer,
	`c_entry_desc` numeric,
	`c_entry_desc_chn` numeric
);
--> statement-breakpoint
CREATE INDEX `ENTRY_CODES_ENTRY_CODESc_entry_code` ON `ENTRY_CODES` (`c_entry_code`);--> statement-breakpoint
CREATE INDEX `ENTRY_CODES_PrimaryKey` ON `ENTRY_CODES` (`c_entry_code`);--> statement-breakpoint
CREATE TABLE `ENTRY_DATA` (
	`c_personid` integer NOT NULL,
	`c_entry_code` integer NOT NULL,
	`c_sequence` integer NOT NULL,
	`c_exam_rank` numeric,
	`c_kin_code` integer NOT NULL,
	`c_kin_id` integer NOT NULL,
	`c_assoc_code` integer NOT NULL,
	`c_assoc_id` integer NOT NULL,
	`c_year` integer NOT NULL,
	`c_age` integer,
	`c_nianhao_id` integer,
	`c_entry_nh_year` integer,
	`c_entry_range` integer,
	`c_inst_code` integer NOT NULL,
	`c_inst_name_code` integer NOT NULL,
	`c_exam_field` numeric,
	`c_entry_addr_id` integer,
	`c_parental_status` integer,
	`c_attempt_count` integer,
	`c_source` integer,
	`c_pages` numeric,
	`c_notes` numeric,
	`c_posting_notes` numeric,
	`c_created_by` numeric,
	`c_created_date` numeric,
	`c_modified_by` numeric,
	`c_modified_date` numeric
);
--> statement-breakpoint
CREATE INDEX `ENTRY_DATA_c_social_inst_code` ON `ENTRY_DATA` (`c_inst_code`);--> statement-breakpoint
CREATE INDEX `ENTRY_DATA_c_social_ins_name_code` ON `ENTRY_DATA` (`c_inst_name_code`);--> statement-breakpoint
CREATE INDEX `ENTRY_DATA_c_personid` ON `ENTRY_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `ENTRY_DATA_c_nianhao_id` ON `ENTRY_DATA` (`c_nianhao_id`);--> statement-breakpoint
CREATE INDEX `ENTRY_DATA_c_kin_id` ON `ENTRY_DATA` (`c_kin_id`);--> statement-breakpoint
CREATE INDEX `ENTRY_DATA_c_kin_code` ON `ENTRY_DATA` (`c_kin_code`);--> statement-breakpoint
CREATE INDEX `ENTRY_DATA_c_entry_code` ON `ENTRY_DATA` (`c_entry_code`);--> statement-breakpoint
CREATE INDEX `ENTRY_DATA_c_assoc_id` ON `ENTRY_DATA` (`c_assoc_id`);--> statement-breakpoint
CREATE INDEX `ENTRY_DATA_c_assoc_code` ON `ENTRY_DATA` (`c_assoc_code`);--> statement-breakpoint
CREATE INDEX `ENTRY_DATA_c_addr_id` ON `ENTRY_DATA` (`c_entry_addr_id`);--> statement-breakpoint
CREATE INDEX `ENTRY_DATA_entry_data` ON `ENTRY_DATA` (`c_personid`,`c_entry_code`,`c_sequence`,`c_kin_code`,`c_kin_id`,`c_assoc_code`,`c_assoc_id`,`c_year`,`c_inst_code`,`c_inst_name_code`);--> statement-breakpoint
CREATE TABLE `ENTRY_TYPES` (
	`c_entry_type` numeric,
	`c_entry_type_desc` numeric,
	`c_entry_type_desc_chn` numeric,
	`c_entry_type_parent_id` numeric,
	`c_entry_type_level` real,
	`c_entry_type_sortorder` real
);
--> statement-breakpoint
CREATE INDEX `ENTRY_TYPES_type_parent_id` ON `ENTRY_TYPES` (`c_entry_type_parent_id`);--> statement-breakpoint
CREATE INDEX `ENTRY_TYPES_type_id` ON `ENTRY_TYPES` (`c_entry_type`);--> statement-breakpoint
CREATE INDEX `ENTRY_TYPES_PrimaryKey` ON `ENTRY_TYPES` (`c_entry_type`);--> statement-breakpoint
CREATE TABLE `ETHNICITY_TRIBE_CODES` (
	`c_ethnicity_code` integer,
	`c_group_code` integer,
	`c_subgroup_code` integer,
	`c_altname_code` integer,
	`c_name_chn` numeric,
	`c_name` numeric,
	`c_ethno_legal_cat` numeric,
	`c_romanized` numeric,
	`c_surname` numeric,
	`c_notes` numeric,
	`JiuTangShu` numeric,
	`XinTangShu` numeric,
	`JiuWudaiShi` numeric,
	`XinWudaiShi` numeric,
	`SongShi` numeric,
	`LiaoShi` numeric,
	`JinShi` numeric,
	`YuanShi` numeric,
	`MingShi` numeric,
	`QingShiGao` numeric,
	`c_sortorder` integer
);
--> statement-breakpoint
CREATE INDEX `ETHNICITY_TRIBE_CODES_c_ethnicity_code` ON `ETHNICITY_TRIBE_CODES` (`c_ethnicity_code`);--> statement-breakpoint
CREATE INDEX `ETHNICITY_TRIBE_CODES_ethnicity_tree` ON `ETHNICITY_TRIBE_CODES` (`c_group_code`,`c_subgroup_code`,`c_altname_code`);--> statement-breakpoint
CREATE TABLE `EVENT_CODES` (
	`c_event_code` integer NOT NULL,
	`c_event_name_chn` numeric,
	`c_event_name` numeric,
	`c_fy_yr` integer,
	`c_ly_yr` integer,
	`c_fy_nh_code` integer,
	`c_ly_nh_code` integer,
	`c_fy_nh_yr` integer,
	`c_ly_nh_yr` integer,
	`c_fy_intercalary` numeric NOT NULL,
	`c_fy_month` integer,
	`c_ly_intercalary` numeric NOT NULL,
	`c_ly_month` integer,
	`c_fy_range` integer,
	`c_ly_range` integer,
	`c_addr_id` integer,
	`c_dy` integer,
	`c_source` integer,
	`c_pages` numeric,
	`c_event_notes` numeric
);
--> statement-breakpoint
CREATE INDEX `EVENT_CODES_EVENT_CODESc_dy` ON `EVENT_CODES` (`c_dy`);--> statement-breakpoint
CREATE INDEX `EVENT_CODES_c_fy_nh_code` ON `EVENT_CODES` (`c_fy_nh_code`);--> statement-breakpoint
CREATE INDEX `EVENT_CODES_c_event_code` ON `EVENT_CODES` (`c_event_code`);--> statement-breakpoint
CREATE INDEX `EVENT_CODES_c_end_yr_nh_code` ON `EVENT_CODES` (`c_ly_nh_code`);--> statement-breakpoint
CREATE INDEX `EVENT_CODES_c_addr_id` ON `EVENT_CODES` (`c_addr_id`);--> statement-breakpoint
CREATE INDEX `EVENT_CODES_PrimaryKey` ON `EVENT_CODES` (`c_event_code`);--> statement-breakpoint
CREATE TABLE `EVENTS_ADDR` (
	`c_event_record_id` integer,
	`c_personid` integer,
	`c_addr_id` integer,
	`c_year` integer,
	`c_nh_code` integer,
	`c_nh_year` integer,
	`c_yr_range` integer,
	`c_intercalary` numeric NOT NULL,
	`c_month` integer,
	`c_day` integer,
	`c_day_ganzhi` integer
);
--> statement-breakpoint
CREATE INDEX `EVENTS_ADDR_c_personid` ON `EVENTS_ADDR` (`c_personid`);--> statement-breakpoint
CREATE INDEX `EVENTS_ADDR_c_nh_code` ON `EVENTS_ADDR` (`c_nh_code`);--> statement-breakpoint
CREATE INDEX `EVENTS_ADDR_c_event_record_id` ON `EVENTS_ADDR` (`c_event_record_id`);--> statement-breakpoint
CREATE INDEX `EVENTS_ADDR_c_addr_id` ON `EVENTS_ADDR` (`c_addr_id`);--> statement-breakpoint
CREATE INDEX `EVENTS_ADDR_PrimaryKey` ON `EVENTS_ADDR` (`c_event_record_id`,`c_personid`,`c_addr_id`);--> statement-breakpoint
CREATE TABLE `EVENTS_DATA` (
	`c_personid` integer,
	`c_sequence` integer,
	`c_event_record_id` integer,
	`c_event_code` integer,
	`c_role` numeric,
	`c_year` integer,
	`c_nh_code` integer,
	`c_nh_year` integer,
	`c_yr_range` integer,
	`c_intercalary` numeric NOT NULL,
	`c_month` integer,
	`c_day` integer,
	`c_day_ganzhi` integer,
	`c_addr_id` integer,
	`c_source` integer,
	`c_pages` numeric,
	`c_event` numeric,
	`c_notes` numeric,
	`c_created_by` numeric,
	`c_created_date` numeric,
	`c_modified_by` numeric,
	`c_modified_date` numeric
);
--> statement-breakpoint
CREATE INDEX `EVENTS_DATA_c_person_id` ON `EVENTS_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `EVENTS_DATA_c_nh_code` ON `EVENTS_DATA` (`c_nh_code`);--> statement-breakpoint
CREATE INDEX `EVENTS_DATA_c_event_record_id` ON `EVENTS_DATA` (`c_event_record_id`);--> statement-breakpoint
CREATE INDEX `EVENTS_DATA_c_event_code` ON `EVENTS_DATA` (`c_event_code`);--> statement-breakpoint
CREATE INDEX `EVENTS_DATA_c_addr_id` ON `EVENTS_DATA` (`c_addr_id`);--> statement-breakpoint
CREATE TABLE `EXTANT_CODES` (
	`c_extant_code` integer,
	`c_extant_desc` numeric,
	`c_extant_desc_chn` numeric,
	`c_extant_code_hd` numeric
);
--> statement-breakpoint
CREATE INDEX `EXTANT_CODES_c_extant_hd_code` ON `EXTANT_CODES` (`c_extant_code_hd`);--> statement-breakpoint
CREATE INDEX `EXTANT_CODES_c_extant_code` ON `EXTANT_CODES` (`c_extant_code`);--> statement-breakpoint
CREATE INDEX `EXTANT_CODES_PrimaryKey` ON `EXTANT_CODES` (`c_extant_code`);--> statement-breakpoint
CREATE TABLE `ForeignKeys` (
	`AccessTblNm` numeric,
	`AccessFldNm` numeric,
	`ForeignKey` numeric,
	`ForeignKeyBaseField` numeric,
	`FKString` numeric,
	`FKName` numeric,
	`skip` integer,
	`IndexOnField` numeric,
	`DataFormat` numeric,
	`NULL_allowed` numeric NOT NULL
);
--> statement-breakpoint
CREATE INDEX `ForeignKeys_ForeignKey` ON `ForeignKeys` (`ForeignKey`);--> statement-breakpoint
CREATE INDEX `ForeignKeys_PrimaryKey` ON `ForeignKeys` (`AccessTblNm`,`AccessFldNm`);--> statement-breakpoint
CREATE TABLE `FormLabels` (
	`c_form` numeric,
	`c_label_id` integer,
	`c_english` numeric,
	`c_jianti` numeric,
	`c_fanti` numeric
);
--> statement-breakpoint
CREATE INDEX `FormLabels_c_label_id` ON `FormLabels` (`c_label_id`);--> statement-breakpoint
CREATE INDEX `FormLabels_label` ON `FormLabels` (`c_form`,`c_label_id`);--> statement-breakpoint
CREATE TABLE `GANZHI_CODES` (
	`c_ganzhi_code` integer,
	`c_ganzhi_chn` numeric,
	`c_ganzhi_py` numeric
);
--> statement-breakpoint
CREATE INDEX `GANZHI_CODES_c_ganzhi_code` ON `GANZHI_CODES` (`c_ganzhi_code`);--> statement-breakpoint
CREATE INDEX `GANZHI_CODES_PrimaryKey` ON `GANZHI_CODES` (`c_ganzhi_code`);--> statement-breakpoint
CREATE TABLE `HOUSEHOLD_STATUS_CODES` (
	`c_household_status_code` integer,
	`c_household_status_desc` numeric,
	`c_household_status_desc_chn` numeric
);
--> statement-breakpoint
CREATE INDEX `HOUSEHOLD_STATUS_CODES_c_household_status_code` ON `HOUSEHOLD_STATUS_CODES` (`c_household_status_code`);--> statement-breakpoint
CREATE TABLE `INDEXYEAR_TYPE_CODES` (
	`c_index_year_type_code` numeric NOT NULL,
	`c_index_year_type_desc` numeric,
	`c_index_year_type_hz` numeric,
	`c_notes` numeric
);
--> statement-breakpoint
CREATE INDEX `INDEXYEAR_TYPE_CODES_c_index_year_type_code` ON `INDEXYEAR_TYPE_CODES` (`c_index_year_type_code`);--> statement-breakpoint
CREATE INDEX `INDEXYEAR_TYPE_CODES_PrimaryKey` ON `INDEXYEAR_TYPE_CODES` (`c_index_year_type_code`);--> statement-breakpoint
CREATE TABLE `KIN_DATA` (
	`c_personid` integer NOT NULL,
	`c_kin_id` integer NOT NULL,
	`c_kin_code` integer NOT NULL,
	`c_source` integer,
	`c_pages` numeric,
	`c_notes` numeric,
	`c_autogen_notes` numeric,
	`c_created_by` numeric,
	`c_created_date` numeric,
	`c_modified_by` numeric,
	`c_modified_date` numeric
);
--> statement-breakpoint
CREATE INDEX `KIN_DATA_KIN_DATA_SOURCE_TEXT_CODES` ON `KIN_DATA` (`c_source`);--> statement-breakpoint
CREATE INDEX `KIN_DATA_KIN_DATA_PERSON_ID` ON `KIN_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `KIN_DATA_KIN_DATA_KIN_ID` ON `KIN_DATA` (`c_kin_id`);--> statement-breakpoint
CREATE INDEX `KIN_DATA_KIN_DATA_KIN_CODES` ON `KIN_DATA` (`c_kin_code`);--> statement-breakpoint
CREATE INDEX `KIN_DATA_c_personid` ON `KIN_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `KIN_DATA_c_kin_id` ON `KIN_DATA` (`c_kin_id`);--> statement-breakpoint
CREATE INDEX `KIN_DATA_c_kin_code` ON `KIN_DATA` (`c_kin_code`);--> statement-breakpoint
CREATE INDEX `KIN_DATA_PrimaryKey` ON `KIN_DATA` (`c_personid`,`c_kin_id`,`c_kin_code`);--> statement-breakpoint
CREATE TABLE `KIN_Mourning` (
	`c_kinrel` numeric,
	`c_kinrel_alt` numeric,
	`c_kinrel_chn` numeric,
	`c_mourning` numeric,
	`c_mourning_chn` numeric,
	`c_kindist` numeric,
	`c_kintype` numeric,
	`c_kintype_desc` numeric,
	`c_kintype_desc_chn` numeric,
	`c_notes` numeric
);
--> statement-breakpoint
CREATE INDEX `KIN_Mourning_PrimaryKey` ON `KIN_Mourning` (`c_kinrel`);--> statement-breakpoint
CREATE TABLE `KIN_MOURNING_STEPS` (
	`c_kinrel` numeric,
	`c_upstep` integer,
	`c_dwnstep` integer,
	`c_marstep` integer,
	`c_colstep` integer
);
--> statement-breakpoint
CREATE TABLE `KINSHIP_CODES` (
	`c_kincode` integer,
	`c_kin_pair1` integer,
	`c_kin_pair2` integer,
	`c_kin_pair_notes` numeric,
	`c_kinrel_chn` numeric,
	`c_kinrel` numeric,
	`c_kinrel_alt` numeric,
	`c_pick_sorting` integer,
	`c_upstep` integer,
	`c_dwnstep` integer,
	`c_marstep` integer,
	`c_colstep` integer,
	`c_kinrel_simplified` numeric
);
--> statement-breakpoint
CREATE INDEX `KINSHIP_CODES_KINSHIP_CODESc_kin_pair2` ON `KINSHIP_CODES` (`c_kin_pair2`);--> statement-breakpoint
CREATE INDEX `KINSHIP_CODES_KINSHIP_CODESc_kin_pair1` ON `KINSHIP_CODES` (`c_kin_pair1`);--> statement-breakpoint
CREATE INDEX `KINSHIP_CODES_KINSHIP_CODES_KIN_PAIR2` ON `KINSHIP_CODES` (`c_kin_pair2`);--> statement-breakpoint
CREATE INDEX `KINSHIP_CODES_KINSHIP_CODES_KIN_PAIR1` ON `KINSHIP_CODES` (`c_kin_pair1`);--> statement-breakpoint
CREATE INDEX `KINSHIP_CODES_PrimaryKey` ON `KINSHIP_CODES` (`c_kincode`);--> statement-breakpoint
CREATE TABLE `LITERARYGENRE_CODES` (
	`c_lit_genre_code` integer,
	`c_lit_genre_desc` numeric,
	`c_lit_genre_desc_chn` numeric,
	`c_sortorder` integer
);
--> statement-breakpoint
CREATE INDEX `LITERARYGENRE_CODES_c_lit_genre_code` ON `LITERARYGENRE_CODES` (`c_lit_genre_code`);--> statement-breakpoint
CREATE INDEX `LITERARYGENRE_CODES_PrimaryKey` ON `LITERARYGENRE_CODES` (`c_lit_genre_code`);--> statement-breakpoint
CREATE TABLE `MEASURE_CODES` (
	`c_measure_code` integer,
	`c_measure_desc` numeric,
	`c_measure_desc_chn` numeric
);
--> statement-breakpoint
CREATE INDEX `MEASURE_CODES_c_measure_id` ON `MEASURE_CODES` (`c_measure_code`);--> statement-breakpoint
CREATE INDEX `MEASURE_CODES_PrimaryKey` ON `MEASURE_CODES` (`c_measure_code`);--> statement-breakpoint
CREATE TABLE `NIAN_HAO` (
	`c_nianhao_id` integer,
	`c_dy` integer,
	`c_dynasty_chn` numeric,
	`c_nianhao_chn` numeric,
	`c_nianhao_pin` numeric,
	`c_firstyear` integer,
	`c_lastyear` integer
);
--> statement-breakpoint
CREATE INDEX `NIAN_HAO_NIAN_HAOc_dy` ON `NIAN_HAO` (`c_dy`);--> statement-breakpoint
CREATE INDEX `NIAN_HAO_dynasty` ON `NIAN_HAO` (`c_dy`);--> statement-breakpoint
CREATE INDEX `NIAN_HAO_PrimaryKey` ON `NIAN_HAO` (`c_nianhao_id`);--> statement-breakpoint
CREATE TABLE `OCCASION_CODES` (
	`c_occasion_code` integer,
	`c_occasion_desc` numeric,
	`c_occasion_desc_chn` numeric,
	`c_sortorder` integer
);
--> statement-breakpoint
CREATE INDEX `OCCASION_CODES_c_occasion_code` ON `OCCASION_CODES` (`c_occasion_code`);--> statement-breakpoint
CREATE INDEX `OCCASION_CODES_PrimaryKey` ON `OCCASION_CODES` (`c_occasion_code`);--> statement-breakpoint
CREATE TABLE `OFFICE_CATEGORIES` (
	`c_office_category_id` integer,
	`c_category_desc` numeric,
	`c_category_desc_chn` numeric,
	`c_notes` numeric
);
--> statement-breakpoint
CREATE INDEX `OFFICE_CATEGORIES_PrimaryKey` ON `OFFICE_CATEGORIES` (`c_office_category_id`);--> statement-breakpoint
CREATE TABLE `OFFICE_CODE_TYPE_REL` (
	`c_office_id` integer NOT NULL,
	`c_office_tree_id` numeric NOT NULL
);
--> statement-breakpoint
CREATE INDEX `OFFICE_CODE_TYPE_REL_OFFICE_CODE_TYPE_REL_OFFICE_TYPE_TREE` ON `OFFICE_CODE_TYPE_REL` (`c_office_tree_id`);--> statement-breakpoint
CREATE INDEX `OFFICE_CODE_TYPE_REL_OFFICE_CODE_TYPE_REL_OFFICE_ID` ON `OFFICE_CODE_TYPE_REL` (`c_office_id`);--> statement-breakpoint
CREATE INDEX `OFFICE_CODE_TYPE_REL_code_id` ON `OFFICE_CODE_TYPE_REL` (`c_office_id`);--> statement-breakpoint
CREATE INDEX `OFFICE_CODE_TYPE_REL_c_office_tree_id` ON `OFFICE_CODE_TYPE_REL` (`c_office_tree_id`);--> statement-breakpoint
CREATE INDEX `OFFICE_CODE_TYPE_REL_PrimaryKey` ON `OFFICE_CODE_TYPE_REL` (`c_office_id`,`c_office_tree_id`);--> statement-breakpoint
CREATE TABLE `OFFICE_CODES` (
	`c_office_id` integer NOT NULL,
	`c_dy` integer,
	`c_office_pinyin` numeric,
	`c_office_chn` numeric,
	`c_office_pinyin_alt` numeric,
	`c_office_chn_alt` numeric,
	`c_office_trans` numeric,
	`c_office_trans_alt` numeric,
	`c_source` integer,
	`c_pages` numeric,
	`c_notes` numeric,
	`c_category_1` numeric,
	`c_category_2` numeric,
	`c_category_3` numeric,
	`c_category_4` numeric,
	`c_office_id_old` integer
);
--> statement-breakpoint
CREATE INDEX `OFFICE_CODES_OFFICE_CODESc_dy` ON `OFFICE_CODES` (`c_dy`);--> statement-breakpoint
CREATE INDEX `OFFICE_CODES_OFFICE_CODES_SOURCE_TEXT_CODES` ON `OFFICE_CODES` (`c_source`);--> statement-breakpoint
CREATE INDEX `OFFICE_CODES_OFFICE_CODES_dynasty` ON `OFFICE_CODES` (`c_dy`);--> statement-breakpoint
CREATE INDEX `OFFICE_CODES_PrimaryKey` ON `OFFICE_CODES` (`c_office_id`);--> statement-breakpoint
CREATE TABLE `OFFICE_CODES_CONVERSION` (
	`c_office_id_backup` integer,
	`c_office_chn_backup` numeric,
	`c_office_id` integer,
	`c_office_chn` numeric
);
--> statement-breakpoint
CREATE INDEX `OFFICE_CODES_CONVERSION_c_office_id` ON `OFFICE_CODES_CONVERSION` (`c_office_id`);--> statement-breakpoint
CREATE TABLE `OFFICE_TYPE_TREE` (
	`c_office_type_node_id` numeric NOT NULL,
	`c_office_type_desc` numeric,
	`c_office_type_desc_chn` numeric,
	`c_parent_id` numeric
);
--> statement-breakpoint
CREATE INDEX `OFFICE_TYPE_TREE_OFFICE_TYPE_TREE_PARENT` ON `OFFICE_TYPE_TREE` (`c_parent_id`);--> statement-breakpoint
CREATE INDEX `OFFICE_TYPE_TREE_c_tree_id` ON `OFFICE_TYPE_TREE` (`c_parent_id`);--> statement-breakpoint
CREATE INDEX `OFFICE_TYPE_TREE_c_node_id` ON `OFFICE_TYPE_TREE` (`c_office_type_node_id`);--> statement-breakpoint
CREATE INDEX `OFFICE_TYPE_TREE_PrimaryKey` ON `OFFICE_TYPE_TREE` (`c_office_type_node_id`);--> statement-breakpoint
CREATE TABLE `OFFICE_TYPE_TREE_backup` (
	`c_office_type_node_id` numeric,
	`c_tts_node_id` numeric,
	`c_office_type_desc` numeric,
	`c_office_type_desc_chn` numeric,
	`c_parent_id` numeric
);
--> statement-breakpoint
CREATE INDEX `OFFICE_TYPE_TREE_backup_c_tree_id` ON `OFFICE_TYPE_TREE_backup` (`c_parent_id`);--> statement-breakpoint
CREATE INDEX `OFFICE_TYPE_TREE_backup_c_office_tts_id` ON `OFFICE_TYPE_TREE_backup` (`c_tts_node_id`);--> statement-breakpoint
CREATE INDEX `OFFICE_TYPE_TREE_backup_c_node_id` ON `OFFICE_TYPE_TREE_backup` (`c_office_type_node_id`);--> statement-breakpoint
CREATE INDEX `OFFICE_TYPE_TREE_backup_PrimaryKey` ON `OFFICE_TYPE_TREE_backup` (`c_office_type_node_id`);--> statement-breakpoint
CREATE TABLE `PARENTAL_STATUS_CODES` (
	`c_parental_status_code` integer,
	`c_parental_status_desc` numeric,
	`c_parental_status_desc_chn` numeric
);
--> statement-breakpoint
CREATE INDEX `PARENTAL_STATUS_CODES_c_parental_status_code` ON `PARENTAL_STATUS_CODES` (`c_parental_status_code`);--> statement-breakpoint
CREATE INDEX `PARENTAL_STATUS_CODES_PrimaryKey` ON `PARENTAL_STATUS_CODES` (`c_parental_status_code`);--> statement-breakpoint
CREATE TABLE `PLACE_CODES` (
	`c_place_id` real,
	`c_place_1990` numeric,
	`c_name` numeric,
	`c_name_chn` numeric,
	`x_coord` real,
	`y_coord` real
);
--> statement-breakpoint
CREATE INDEX `PLACE_CODES_PrimaryKey` ON `PLACE_CODES` (`c_place_id`);--> statement-breakpoint
CREATE TABLE `POSSESSION_ACT_CODES` (
	`c_possession_act_code` integer,
	`c_possession_act_desc` numeric,
	`c_possession_act_desc_chn` numeric
);
--> statement-breakpoint
CREATE INDEX `POSSESSION_ACT_CODES_c_possession_type_code` ON `POSSESSION_ACT_CODES` (`c_possession_act_code`);--> statement-breakpoint
CREATE INDEX `POSSESSION_ACT_CODES_PrimaryKey` ON `POSSESSION_ACT_CODES` (`c_possession_act_code`);--> statement-breakpoint
CREATE TABLE `POSSESSION_ADDR` (
	`c_possession_record_id` integer,
	`c_personid` integer,
	`c_addr_id` integer
);
--> statement-breakpoint
CREATE INDEX `POSSESSION_ADDR_POSSESSION_ADDR_possession_id` ON `POSSESSION_ADDR` (`c_possession_record_id`);--> statement-breakpoint
CREATE INDEX `POSSESSION_ADDR_POSSESSION_ADDR_PERSON_ID` ON `POSSESSION_ADDR` (`c_personid`);--> statement-breakpoint
CREATE INDEX `POSSESSION_ADDR_POSSESSION_ADDR_ADDR_ID` ON `POSSESSION_ADDR` (`c_addr_id`);--> statement-breakpoint
CREATE INDEX `POSSESSION_ADDR_c_possession_record_id` ON `POSSESSION_ADDR` (`c_possession_record_id`);--> statement-breakpoint
CREATE INDEX `POSSESSION_ADDR_c_personid` ON `POSSESSION_ADDR` (`c_personid`);--> statement-breakpoint
CREATE INDEX `POSSESSION_ADDR_c_addr_id` ON `POSSESSION_ADDR` (`c_addr_id`);--> statement-breakpoint
CREATE INDEX `POSSESSION_ADDR_PrimaryKey` ON `POSSESSION_ADDR` (`c_possession_record_id`,`c_personid`,`c_addr_id`);--> statement-breakpoint
CREATE TABLE `POSSESSION_DATA` (
	`c_personid` integer,
	`c_possession_record_id` integer NOT NULL,
	`c_sequence` integer,
	`c_possession_act_code` integer,
	`c_possession_desc` numeric,
	`c_possession_desc_chn` numeric,
	`c_quantity` numeric,
	`c_measure_code` integer,
	`c_possession_yr` integer,
	`c_possession_nh_code` integer,
	`c_possession_nh_yr` integer,
	`c_possession_yr_range` integer,
	`c_addr_id` integer,
	`c_source` integer,
	`c_pages` numeric,
	`c_notes` numeric,
	`c_created_by` numeric,
	`c_created_date` numeric,
	`c_modified_by` numeric,
	`c_modified_date` numeric
);
--> statement-breakpoint
CREATE INDEX `POSSESSION_DATA_POSSESSION_DATAc_possession_act_code` ON `POSSESSION_DATA` (`c_possession_act_code`);--> statement-breakpoint
CREATE INDEX `POSSESSION_DATA_POSSESSION_DATAc_measure_code` ON `POSSESSION_DATA` (`c_measure_code`);--> statement-breakpoint
CREATE INDEX `POSSESSION_DATA_POSSESSION_DATA_year_range_code` ON `POSSESSION_DATA` (`c_possession_yr_range`);--> statement-breakpoint
CREATE INDEX `POSSESSION_DATA_POSSESSION_DATA_SOURCE_TEXT_CODE` ON `POSSESSION_DATA` (`c_source`);--> statement-breakpoint
CREATE INDEX `POSSESSION_DATA_POSSESSION_DATA_possession_act_code` ON `POSSESSION_DATA` (`c_possession_act_code`);--> statement-breakpoint
CREATE INDEX `POSSESSION_DATA_POSSESSION_DATA_PERSON_ID` ON `POSSESSION_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `POSSESSION_DATA_POSSESSION_DATA_nian_hao` ON `POSSESSION_DATA` (`c_possession_nh_code`);--> statement-breakpoint
CREATE INDEX `POSSESSION_DATA_POSSESSION_DATA_MEASURE_CODE` ON `POSSESSION_DATA` (`c_measure_code`);--> statement-breakpoint
CREATE INDEX `POSSESSION_DATA_POSSESSION_DATA_ADDR_ID` ON `POSSESSION_DATA` (`c_addr_id`);--> statement-breakpoint
CREATE INDEX `POSSESSION_DATA_c_possession_nh_code` ON `POSSESSION_DATA` (`c_possession_nh_code`);--> statement-breakpoint
CREATE INDEX `POSSESSION_DATA_c_personid` ON `POSSESSION_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `POSSESSION_DATA_c_addr_id` ON `POSSESSION_DATA` (`c_addr_id`);--> statement-breakpoint
CREATE INDEX `POSSESSION_DATA_PrimaryKey` ON `POSSESSION_DATA` (`c_possession_record_id`);--> statement-breakpoint
CREATE TABLE `POSTED_TO_ADDR_DATA` (
	`c_posting_id` integer NOT NULL,
	`c_personid` integer,
	`c_office_id` integer NOT NULL,
	`c_addr_id` integer NOT NULL,
	`c_posting_id_old` integer
);
--> statement-breakpoint
CREATE INDEX `POSTED_TO_ADDR_DATA_POSTING_ADDR_DATAc_posting_id` ON `POSTED_TO_ADDR_DATA` (`c_posting_id`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_ADDR_DATA_POSTED_TO_ADDR_DATAc_addr_id` ON `POSTED_TO_ADDR_DATA` (`c_addr_id`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_ADDR_DATA_POSTED_TO_ADDR_DATA_POSTING_ID` ON `POSTED_TO_ADDR_DATA` (`c_posting_id`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_ADDR_DATA_POSTED_TO_ADDR_DATA_PERSON_ID` ON `POSTED_TO_ADDR_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_ADDR_DATA_POSTED_TO_ADDR_DATA_OFFICE_ID` ON `POSTED_TO_ADDR_DATA` (`c_office_id`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_ADDR_DATA_POSTED_TO_ADDR_DATA_ADDR_ID` ON `POSTED_TO_ADDR_DATA` (`c_addr_id`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_ADDR_DATA_PrimaryKey` ON `POSTED_TO_ADDR_DATA` (`c_posting_id`,`c_addr_id`,`c_office_id`);--> statement-breakpoint
CREATE TABLE `POSTED_TO_OFFICE_DATA` (
	`c_personid` integer,
	`c_office_id` integer NOT NULL,
	`c_posting_id` integer NOT NULL,
	`c_posting_id_old` integer,
	`c_sequence` integer,
	`c_firstyear` integer,
	`c_fy_nh_code` integer,
	`c_fy_nh_year` integer,
	`c_fy_range` integer,
	`c_lastyear` integer,
	`c_ly_nh_code` integer,
	`c_ly_nh_year` integer,
	`c_ly_range` integer,
	`c_appt_code` integer,
	`c_assume_office_code` integer,
	`c_inst_code` integer,
	`c_inst_name_code` integer,
	`c_source` integer,
	`c_pages` numeric,
	`c_notes` numeric,
	`c_office_id_backup` integer,
	`c_office_category_id` integer,
	`c_fy_intercalary` numeric NOT NULL,
	`c_fy_month` integer,
	`c_ly_intercalary` numeric NOT NULL,
	`c_ly_month` integer,
	`c_fy_day` integer,
	`c_ly_day` integer,
	`c_fy_day_gz` integer,
	`c_ly_day_gz` integer,
	`c_dy` integer,
	`c_created_by` numeric,
	`c_created_date` numeric,
	`c_modified_by` numeric,
	`c_modified_date` numeric
);
--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTING_OFFICE_DATAc_posting_id` ON `POSTED_TO_OFFICE_DATA` (`c_posting_id`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATAc_dy` ON `POSTED_TO_OFFICE_DATA` (`c_dy`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_year_range_ly` ON `POSTED_TO_OFFICE_DATA` (`c_ly_range`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_year_range_fy` ON `POSTED_TO_OFFICE_DATA` (`c_fy_range`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_SOURCE_TEXT_CODE` ON `POSTED_TO_OFFICE_DATA` (`c_source`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_SOCIAL_INSTITUTION_NAME_CODE` ON `POSTED_TO_OFFICE_DATA` (`c_inst_name_code`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_SOCIAL_INSTITUTION_CODE` ON `POSTED_TO_OFFICE_DATA` (`c_inst_name_code`,`c_inst_code`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_POSTING_ID` ON `POSTED_TO_OFFICE_DATA` (`c_posting_id`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_PERSON_ID` ON `POSTED_TO_OFFICE_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_OFFICE_ID` ON `POSTED_TO_OFFICE_DATA` (`c_office_id`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_OFFICE_CATEGORY` ON `POSTED_TO_OFFICE_DATA` (`c_office_category_id`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_nian_hao_ly` ON `POSTED_TO_OFFICE_DATA` (`c_ly_nh_code`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_nian_hao_fy` ON `POSTED_TO_OFFICE_DATA` (`c_fy_nh_code`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_GANZHI_LY_DAY` ON `POSTED_TO_OFFICE_DATA` (`c_ly_day_gz`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_GANZHI_FY_DAY` ON `POSTED_TO_OFFICE_DATA` (`c_fy_day_gz`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_dynasty` ON `POSTED_TO_OFFICE_DATA` (`c_dy`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_assume_office_code` ON `POSTED_TO_OFFICE_DATA` (`c_assume_office_code`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POSTED_TO_OFFICE_DATA_appointment_code` ON `POSTED_TO_OFFICE_DATA` (`c_appt_code`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_POST_DATAc_appt_type_code` ON `POSTED_TO_OFFICE_DATA` (`c_appt_code`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_c_personid` ON `POSTED_TO_OFFICE_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_c_office_id` ON `POSTED_TO_OFFICE_DATA` (`c_office_id`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_c_office_category_id` ON `POSTED_TO_OFFICE_DATA` (`c_office_category_id`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_c_ly_nh_code` ON `POSTED_TO_OFFICE_DATA` (`c_ly_nh_code`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_c_inst_name_code` ON `POSTED_TO_OFFICE_DATA` (`c_inst_name_code`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_c_inst_code` ON `POSTED_TO_OFFICE_DATA` (`c_inst_code`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_c_fy_nh_code` ON `POSTED_TO_OFFICE_DATA` (`c_fy_nh_code`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_c_assume_office_code` ON `POSTED_TO_OFFICE_DATA` (`c_assume_office_code`);--> statement-breakpoint
CREATE INDEX `POSTED_TO_OFFICE_DATA_PrimaryKey` ON `POSTED_TO_OFFICE_DATA` (`c_office_id`,`c_posting_id`);--> statement-breakpoint
CREATE TABLE `POSTING_DATA` (
	`c_personid` integer,
	`c_posting_id` integer NOT NULL,
	`c_posting_id_old` integer
);
--> statement-breakpoint
CREATE INDEX `POSTING_DATA_POSTING_DATA_PERSON_ID` ON `POSTING_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `POSTING_DATA_c_personid` ON `POSTING_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `POSTING_DATA_PrimaryKey` ON `POSTING_DATA` (`c_posting_id`);--> statement-breakpoint
CREATE TABLE `SCHOLARLYTOPIC_CODES` (
	`c_topic_code` integer,
	`c_topic_desc` numeric,
	`c_topic_desc_chn` numeric,
	`c_topic_type_code` integer,
	`c_topic_type_desc` numeric,
	`c_topic_type_desc_chn` numeric,
	`c_sortorder` integer
);
--> statement-breakpoint
CREATE INDEX `SCHOLARLYTOPIC_CODES_c_topic_type_code` ON `SCHOLARLYTOPIC_CODES` (`c_topic_type_code`);--> statement-breakpoint
CREATE INDEX `SCHOLARLYTOPIC_CODES_c_topic_code` ON `SCHOLARLYTOPIC_CODES` (`c_topic_code`);--> statement-breakpoint
CREATE INDEX `SCHOLARLYTOPIC_CODES_PrimaryKey` ON `SCHOLARLYTOPIC_CODES` (`c_topic_code`);--> statement-breakpoint
CREATE TABLE `SOCIAL_INSTITUTION_ADDR` (
	`c_inst_name_code` integer NOT NULL,
	`c_inst_code` integer NOT NULL,
	`c_inst_addr_type_code` integer NOT NULL,
	`c_inst_addr_begin_year` integer,
	`c_inst_addr_end_year` integer,
	`c_inst_addr_id` integer NOT NULL,
	`inst_xcoord` real NOT NULL,
	`inst_ycoord` real NOT NULL,
	`c_source` integer,
	`c_pages` numeric,
	`c_notes` numeric
);
--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ADDR_SOCIAL_INSTITUTION_ADDR_TYPE` ON `SOCIAL_INSTITUTION_ADDR` (`c_inst_addr_type_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ADDR_SOCIAL_INSTITUTION_ADDR_TEXT_CODES` ON `SOCIAL_INSTITUTION_ADDR` (`c_source`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ADDR_SOCIAL_INSTITUTION_ADDR_SOCIAL_INSTITUTION_CODE` ON `SOCIAL_INSTITUTION_ADDR` (`c_inst_name_code`,`c_inst_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ADDR_SOCIAL_INSTITUTION_ADDR_ADDR_ID` ON `SOCIAL_INSTITUTION_ADDR` (`c_inst_addr_id`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ADDR_c_new_code` ON `SOCIAL_INSTITUTION_ADDR` (`c_inst_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ADDR_c_inst_name_code` ON `SOCIAL_INSTITUTION_ADDR` (`c_inst_name_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ADDR_c_inst_addr_type_id` ON `SOCIAL_INSTITUTION_ADDR` (`c_inst_addr_type_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ADDR_c_inst_addr_id` ON `SOCIAL_INSTITUTION_ADDR` (`c_inst_addr_id`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ADDR_PrimaryKey` ON `SOCIAL_INSTITUTION_ADDR` (`c_inst_name_code`,`c_inst_code`,`c_inst_addr_type_code`,`inst_xcoord`,`inst_ycoord`,`c_inst_addr_id`);--> statement-breakpoint
CREATE TABLE `SOCIAL_INSTITUTION_ADDR_TYPES` (
	`c_inst_addr_type_code` integer,
	`c_inst_addr_type_desc` numeric,
	`c_inst_addr_type_chn` numeric,
	`c_notes` numeric
);
--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ADDR_TYPES_c_inst_addr_type_id` ON `SOCIAL_INSTITUTION_ADDR_TYPES` (`c_inst_addr_type_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ADDR_TYPES_PrimaryKey` ON `SOCIAL_INSTITUTION_ADDR_TYPES` (`c_inst_addr_type_code`);--> statement-breakpoint
CREATE TABLE `SOCIAL_INSTITUTION_ALTNAME_CODES` (
	`c_inst_altname_type` integer,
	`c_inst_altname_desc` numeric,
	`c_inst_altname_chn` numeric,
	`c_notes` numeric
);
--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ALTNAME_CODES_PrimaryKey` ON `SOCIAL_INSTITUTION_ALTNAME_CODES` (`c_inst_altname_type`);--> statement-breakpoint
CREATE TABLE `SOCIAL_INSTITUTION_ALTNAME_DATA` (
	`c_inst_name_code` integer,
	`c_inst_code` integer,
	`c_inst_altname_type` integer,
	`c_inst_altname_hz` numeric,
	`c_inst_altname_py` numeric,
	`c_source` integer,
	`c_pages` numeric,
	`c_notes` numeric
);
--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ALTNAME_DATA_c_inst_name_code` ON `SOCIAL_INSTITUTION_ALTNAME_DATA` (`c_inst_name_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ALTNAME_DATA_c_inst_code` ON `SOCIAL_INSTITUTION_ALTNAME_DATA` (`c_inst_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ALTNAME_DATA_c_inst_altname_type_id` ON `SOCIAL_INSTITUTION_ALTNAME_DATA` (`c_inst_altname_type`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_ALTNAME_DATA_PrimaryKey` ON `SOCIAL_INSTITUTION_ALTNAME_DATA` (`c_inst_name_code`,`c_inst_code`,`c_inst_altname_type`,`c_inst_altname_hz`);--> statement-breakpoint
CREATE TABLE `SOCIAL_INSTITUTION_CODES` (
	`c_inst_name_code` integer NOT NULL,
	`c_inst_code` integer NOT NULL,
	`c_inst_type_code` integer,
	`c_inst_begin_year` integer,
	`c_by_nianhao_code` integer,
	`c_by_nianhao_year` integer,
	`c_by_year_range` integer,
	`c_inst_begin_dy` integer,
	`c_inst_floruit_dy` integer,
	`c_inst_first_known_year` integer,
	`c_inst_end_year` integer,
	`c_ey_nianhao_code` integer,
	`c_ey_nianhao_year` integer,
	`c_ey_year_range` integer,
	`c_inst_end_dy` integer,
	`c_inst_last_known_year` integer,
	`c_source` integer,
	`c_pages` numeric,
	`c_notes` numeric
);
--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_YEAR_RANGE_CODE_EY` ON `SOCIAL_INSTITUTION_CODES` (`c_ey_year_range`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_YEAR_RANGE_CODE_BY` ON `SOCIAL_INSTITUTION_CODES` (`c_by_year_range`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_SOURCE_TEXT_ID` ON `SOCIAL_INSTITUTION_CODES` (`c_source`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_TYPE_CODE` ON `SOCIAL_INSTITUTION_CODES` (`c_inst_type_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_NAME_CODE` ON `SOCIAL_INSTITUTION_CODES` (`c_inst_name_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_NIAN_HAO_EY` ON `SOCIAL_INSTITUTION_CODES` (`c_ey_nianhao_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_NIAN_HAO_BY` ON `SOCIAL_INSTITUTION_CODES` (`c_by_nianhao_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_DYNASTY_END` ON `SOCIAL_INSTITUTION_CODES` (`c_inst_floruit_dy`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_SOCIAL_INSTITUTION_CODES_DYNASTY_BEGIN` ON `SOCIAL_INSTITUTION_CODES` (`c_inst_begin_dy`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_c_nianhao_code` ON `SOCIAL_INSTITUTION_CODES` (`c_by_nianhao_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_c_new_code` ON `SOCIAL_INSTITUTION_CODES` (`c_inst_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_c_institution_type_code` ON `SOCIAL_INSTITUTION_CODES` (`c_inst_type_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_c_inst_name_code` ON `SOCIAL_INSTITUTION_CODES` (`c_inst_name_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_c_ey_nianhao_code` ON `SOCIAL_INSTITUTION_CODES` (`c_ey_nianhao_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_PrimaryKey` ON `SOCIAL_INSTITUTION_CODES` (`c_inst_name_code`,`c_inst_code`);--> statement-breakpoint
CREATE TABLE `SOCIAL_INSTITUTION_CODES_CONVERSION` (
	`c_inst_name_code` integer,
	`c_inst_code` integer,
	`c_inst_code_new` integer,
	`c_new_new_code` integer
);
--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_CONVERSION_c_new_new_code` ON `SOCIAL_INSTITUTION_CODES_CONVERSION` (`c_new_new_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_CONVERSION_c_institution_code` ON `SOCIAL_INSTITUTION_CODES_CONVERSION` (`c_inst_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_CONVERSION_c_inst_name_code` ON `SOCIAL_INSTITUTION_CODES_CONVERSION` (`c_inst_name_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_CODES_CONVERSION_PrimaryKey` ON `SOCIAL_INSTITUTION_CODES_CONVERSION` (`c_inst_name_code`,`c_inst_code`);--> statement-breakpoint
CREATE TABLE `SOCIAL_INSTITUTION_NAME_CODES` (
	`c_inst_name_code` integer,
	`c_inst_name_hz` numeric,
	`c_inst_name_py` numeric
);
--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_NAME_CODES_c_inst_name_code` ON `SOCIAL_INSTITUTION_NAME_CODES` (`c_inst_name_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_NAME_CODES_PrimaryKey` ON `SOCIAL_INSTITUTION_NAME_CODES` (`c_inst_name_code`);--> statement-breakpoint
CREATE TABLE `SOCIAL_INSTITUTION_TYPES` (
	`c_inst_type_code` integer,
	`c_inst_type_py` numeric,
	`c_inst_type_hz` numeric
);
--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_TYPES_c_institution_type_code` ON `SOCIAL_INSTITUTION_TYPES` (`c_inst_type_code`);--> statement-breakpoint
CREATE INDEX `SOCIAL_INSTITUTION_TYPES_PrimaryKey` ON `SOCIAL_INSTITUTION_TYPES` (`c_inst_type_code`);--> statement-breakpoint
CREATE TABLE `STATUS_CODE_TYPE_REL` (
	`c_status_code` integer,
	`c_status_type_code` numeric
);
--> statement-breakpoint
CREATE INDEX `STATUS_CODE_TYPE_REL_STATUS_CODE_TYPE_REL_STATUS_TYPE` ON `STATUS_CODE_TYPE_REL` (`c_status_type_code`);--> statement-breakpoint
CREATE INDEX `STATUS_CODE_TYPE_REL_STATUS_CODE_TYPE_REL_STATUS_CODE` ON `STATUS_CODE_TYPE_REL` (`c_status_code`);--> statement-breakpoint
CREATE INDEX `STATUS_CODE_TYPE_REL_c_status_type_code` ON `STATUS_CODE_TYPE_REL` (`c_status_type_code`);--> statement-breakpoint
CREATE INDEX `STATUS_CODE_TYPE_REL_c_status_code` ON `STATUS_CODE_TYPE_REL` (`c_status_code`);--> statement-breakpoint
CREATE INDEX `STATUS_CODE_TYPE_REL_PrimaryKey` ON `STATUS_CODE_TYPE_REL` (`c_status_code`,`c_status_type_code`);--> statement-breakpoint
CREATE TABLE `STATUS_CODES` (
	`c_status_code` integer,
	`c_status_desc` numeric,
	`c_status_desc_chn` numeric
);
--> statement-breakpoint
CREATE INDEX `STATUS_CODES_PrimaryKey` ON `STATUS_CODES` (`c_status_code`);--> statement-breakpoint
CREATE TABLE `STATUS_DATA` (
	`c_personid` integer NOT NULL,
	`c_sequence` integer NOT NULL,
	`c_status_code` integer NOT NULL,
	`c_firstyear` integer,
	`c_fy_nh_code` integer,
	`c_fy_nh_year` integer,
	`c_fy_range` integer,
	`c_lastyear` integer,
	`c_ly_nh_code` integer,
	`c_ly_nh_year` integer,
	`c_ly_range` integer,
	`c_supplement` numeric,
	`c_source` integer,
	`c_pages` numeric,
	`c_notes` numeric,
	`c_created_by` numeric,
	`c_created_date` numeric,
	`c_modified_by` numeric,
	`c_modified_date` numeric
);
--> statement-breakpoint
CREATE INDEX `STATUS_DATA_STATUS_DATA_year_range_code_ly` ON `STATUS_DATA` (`c_ly_range`);--> statement-breakpoint
CREATE INDEX `STATUS_DATA_STATUS_DATA_year_range_code_fy` ON `STATUS_DATA` (`c_fy_range`);--> statement-breakpoint
CREATE INDEX `STATUS_DATA_STATUS_DATA_STATUS_CODES` ON `STATUS_DATA` (`c_status_code`);--> statement-breakpoint
CREATE INDEX `STATUS_DATA_STATUS_DATA_SOURCE_TEXT_ID` ON `STATUS_DATA` (`c_source`);--> statement-breakpoint
CREATE INDEX `STATUS_DATA_STATUS_DATA_PERSON_ID` ON `STATUS_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `STATUS_DATA_STATUS_DATA_nian_hao_ly` ON `STATUS_DATA` (`c_ly_nh_code`);--> statement-breakpoint
CREATE INDEX `STATUS_DATA_STATUS_DATA_nian_hao_fy` ON `STATUS_DATA` (`c_fy_nh_code`);--> statement-breakpoint
CREATE INDEX `STATUS_DATA_c_status_code` ON `STATUS_DATA` (`c_status_code`);--> statement-breakpoint
CREATE INDEX `STATUS_DATA_c_personid` ON `STATUS_DATA` (`c_personid`);--> statement-breakpoint
CREATE INDEX `STATUS_DATA_c_ly_nh_code` ON `STATUS_DATA` (`c_ly_nh_code`);--> statement-breakpoint
CREATE INDEX `STATUS_DATA_c_fy_nh_code` ON `STATUS_DATA` (`c_fy_nh_code`);--> statement-breakpoint
CREATE INDEX `STATUS_DATA_PrimaryKey` ON `STATUS_DATA` (`c_personid`,`c_sequence`,`c_status_code`);--> statement-breakpoint
CREATE TABLE `STATUS_TYPES` (
	`c_status_type_code` numeric NOT NULL,
	`c_status_type_desc` numeric,
	`c_status_type_chn` numeric,
	`c_status_type_parent_code` numeric
);
--> statement-breakpoint
CREATE INDEX `STATUS_TYPES_c_status_type_parent_code` ON `STATUS_TYPES` (`c_status_type_parent_code`);--> statement-breakpoint
CREATE INDEX `STATUS_TYPES_c_status_type_code` ON `STATUS_TYPES` (`c_status_type_code`);--> statement-breakpoint
CREATE INDEX `STATUS_TYPES_PrimaryKey` ON `STATUS_TYPES` (`c_status_type_code`);--> statement-breakpoint
CREATE TABLE `TablesFields` (
	`RowNum` integer,
	`DumpTblNm` numeric,
	`DumpFldNm` numeric,
	`AccessTblNm` numeric,
	`AccessFldNm` numeric,
	`IndexOnField` numeric,
	`DataFormat` numeric,
	`NULL_allowed` numeric NOT NULL,
	`ForeignKey` numeric,
	`ForeignKeyBaseField` numeric
);
--> statement-breakpoint
CREATE INDEX `TablesFields_RowNum` ON `TablesFields` (`RowNum`);--> statement-breakpoint
CREATE INDEX `TablesFields_ForeignKey` ON `TablesFields` (`ForeignKey`);--> statement-breakpoint
CREATE INDEX `TablesFields_PrimaryKey` ON `TablesFields` (`AccessTblNm`,`AccessFldNm`);--> statement-breakpoint
CREATE TABLE `TablesFieldsChanges` (
	`TableName` numeric,
	`FieldName` numeric,
	`Change` numeric,
	`ChangeDate` numeric,
	`ChangeNotes` numeric
);
--> statement-breakpoint
CREATE INDEX `TablesFieldsChanges_Change` ON `TablesFieldsChanges` (`TableName`,`FieldName`,`Change`);--> statement-breakpoint
CREATE TABLE `TEXT_BIBLCAT_CODE_TYPE_REL` (
	`c_text_cat_code` integer,
	`c_text_cat_type_id` numeric
);
--> statement-breakpoint
CREATE INDEX `TEXT_BIBLCAT_CODE_TYPE_REL_type_id` ON `TEXT_BIBLCAT_CODE_TYPE_REL` (`c_text_cat_type_id`);--> statement-breakpoint
CREATE INDEX `TEXT_BIBLCAT_CODE_TYPE_REL_TEXT_BIBLCAT_CODE_TYPE_REL_TEXT_CAT_TYPE` ON `TEXT_BIBLCAT_CODE_TYPE_REL` (`c_text_cat_type_id`);--> statement-breakpoint
CREATE INDEX `TEXT_BIBLCAT_CODE_TYPE_REL_TEXT_BIBLCAT_CODE_TYPE_REL_TEXT_CAT_CODE` ON `TEXT_BIBLCAT_CODE_TYPE_REL` (`c_text_cat_code`);--> statement-breakpoint
CREATE INDEX `TEXT_BIBLCAT_CODE_TYPE_REL_code_id` ON `TEXT_BIBLCAT_CODE_TYPE_REL` (`c_text_cat_code`);--> statement-breakpoint
CREATE INDEX `TEXT_BIBLCAT_CODE_TYPE_REL_PrimaryKey` ON `TEXT_BIBLCAT_CODE_TYPE_REL` (`c_text_cat_code`,`c_text_cat_type_id`);--> statement-breakpoint
CREATE TABLE `TEXT_BIBLCAT_CODES` (
	`c_text_cat_code` integer NOT NULL,
	`c_text_cat_desc` numeric,
	`c_text_cat_desc_chn` numeric,
	`c_text_cat_pinyin` numeric,
	`c_text_cat_parent_id` numeric,
	`c_text_cat_level` numeric,
	`c_text_cat_sortorder` integer
);
--> statement-breakpoint
CREATE INDEX `TEXT_BIBLCAT_CODES_c_text_cat_parent_id` ON `TEXT_BIBLCAT_CODES` (`c_text_cat_parent_id`);--> statement-breakpoint
CREATE INDEX `TEXT_BIBLCAT_CODES_c_genre_code` ON `TEXT_BIBLCAT_CODES` (`c_text_cat_code`);--> statement-breakpoint
CREATE INDEX `TEXT_BIBLCAT_CODES_PrimaryKey` ON `TEXT_BIBLCAT_CODES` (`c_text_cat_code`);--> statement-breakpoint
CREATE TABLE `TEXT_BIBLCAT_TYPES` (
	`c_text_cat_type_id` numeric,
	`c_text_cat_type_desc` numeric,
	`c_text_cat_type_desc_chn` numeric,
	`c_text_cat_type_parent_id` numeric,
	`c_text_cat_type_level` integer,
	`c_text_cat_type_sortorder` integer
);
--> statement-breakpoint
CREATE INDEX `TEXT_BIBLCAT_TYPES_type_parent_id` ON `TEXT_BIBLCAT_TYPES` (`c_text_cat_type_parent_id`);--> statement-breakpoint
CREATE INDEX `TEXT_BIBLCAT_TYPES_type_id` ON `TEXT_BIBLCAT_TYPES` (`c_text_cat_type_id`);--> statement-breakpoint
CREATE INDEX `TEXT_BIBLCAT_TYPES_PrimaryKey` ON `TEXT_BIBLCAT_TYPES` (`c_text_cat_type_id`);--> statement-breakpoint
CREATE TABLE `TEXT_CODES` (
	`c_textid` integer NOT NULL,
	`c_title_chn` numeric,
	`c_suffix_version` numeric,
	`c_title` numeric,
	`c_title_trans` numeric,
	`c_text_type_id` numeric,
	`c_text_year` integer,
	`c_text_nh_code` integer,
	`c_text_nh_year` integer,
	`c_text_range_code` integer,
	`c_period` numeric,
	`c_bibl_cat_code` integer,
	`c_extant` integer,
	`c_text_country` integer,
	`c_text_dy` integer,
	`c_pub_country` integer,
	`c_pub_dy` integer,
	`c_pub_year` numeric,
	`c_pub_nh_code` integer,
	`c_pub_nh_year` integer,
	`c_pub_range_code` integer,
	`c_pub_loc` numeric,
	`c_publisher` numeric,
	`c_pub_notes` numeric,
	`c_source` integer,
	`c_pages` numeric,
	`c_url_api` numeric,
	`c_url_api_coda` numeric,
	`c_url_homepage` numeric,
	`c_notes` numeric,
	`c_number` numeric,
	`c_counter` numeric,
	`c_title_alt_chn` numeric,
	`c_created_by` numeric,
	`c_created_date` numeric,
	`c_modified_by` numeric,
	`c_modified_date` numeric
);
--> statement-breakpoint
CREATE INDEX `TEXT_CODES_TEXT_CODESc_source` ON `TEXT_CODES` (`c_source`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_TEXT_CODES_YEAR_RANGE_CODE_TEXT` ON `TEXT_CODES` (`c_text_range_code`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_TEXT_CODES_YEAR_RANGE_CODE_PUB` ON `TEXT_CODES` (`c_pub_range_code`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_TEXT_CODES_TEXT_BIBLCAT_CODE` ON `TEXT_CODES` (`c_bibl_cat_code`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_TEXT_CODES_SOURCE_TEXT_ID` ON `TEXT_CODES` (`c_source`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_TEXT_CODES_NIAN_HAO_TEXT` ON `TEXT_CODES` (`c_text_nh_code`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_TEXT_CODES_NIAN_HAO_PUB` ON `TEXT_CODES` (`c_pub_nh_code`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_TEXT_CODES_EXTANT_CODE` ON `TEXT_CODES` (`c_extant`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_TEXT_CODES_DYNASTY_TEXT` ON `TEXT_CODES` (`c_text_dy`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_TEXT_CODES_DYNASTY_PUB` ON `TEXT_CODES` (`c_pub_dy`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_TEXT_CODES_COUNTRY_CODE_TEXT` ON `TEXT_CODES` (`c_text_country`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_TEXT_CODES_COUNTRY_CODE_PUB` ON `TEXT_CODES` (`c_pub_country`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_c_textid` ON `TEXT_CODES` (`c_textid`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_c_text_type_code` ON `TEXT_CODES` (`c_text_type_id`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_c_text_range_code` ON `TEXT_CODES` (`c_text_range_code`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_c_text_nh_code` ON `TEXT_CODES` (`c_text_nh_code`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_c_genre_code` ON `TEXT_CODES` (`c_bibl_cat_code`);--> statement-breakpoint
CREATE INDEX `TEXT_CODES_PrimaryKey` ON `TEXT_CODES` (`c_textid`);--> statement-breakpoint
CREATE TABLE `TEXT_INSTANCE_DATA` (
	`c_textid` integer NOT NULL,
	`c_text_edition_id` integer NOT NULL,
	`c_text_instance_id` integer NOT NULL,
	`c_instance_title_chn` numeric,
	`c_instance_title` numeric,
	`c_instance_title_trans` numeric,
	`c_part_of_instance` integer,
	`c_part_of_instance_notes` numeric,
	`c_pub_country` integer,
	`c_pub_dy` integer,
	`c_pub_year` numeric,
	`c_pub_nh_code` integer,
	`c_pub_nh_year` integer,
	`c_pub_range_code` integer,
	`c_pub_loc` numeric,
	`c_publisher` numeric,
	`c_print` numeric,
	`c_pub_notes` numeric,
	`c_source` integer,
	`c_pages` numeric,
	`c_extant` integer,
	`c_url_api` numeric,
	`c_url_homepage` numeric,
	`c_notes` numeric,
	`c_number` numeric,
	`c_counter` numeric,
	`c_title_alt_chn` numeric,
	`c_created_by` numeric,
	`c_created_date` numeric,
	`c_modified_by` numeric,
	`c_modified_date` numeric
);
--> statement-breakpoint
CREATE INDEX `TEXT_INSTANCE_DATA_TEXT_INSTANCE_TEXT_ID` ON `TEXT_INSTANCE_DATA` (`c_textid`);--> statement-breakpoint
CREATE INDEX `TEXT_INSTANCE_DATA_TEXT_INSTANCE_SOURCE_ID` ON `TEXT_INSTANCE_DATA` (`c_source`);--> statement-breakpoint
CREATE INDEX `TEXT_INSTANCE_DATA_TEXT_INSTANCE_PUB_RANGE` ON `TEXT_INSTANCE_DATA` (`c_pub_range_code`);--> statement-breakpoint
CREATE INDEX `TEXT_INSTANCE_DATA_TEXT_INSTANCE_PUB_NIANHAO` ON `TEXT_INSTANCE_DATA` (`c_pub_nh_code`);--> statement-breakpoint
CREATE INDEX `TEXT_INSTANCE_DATA_TEXT_INSTANCE_PUB_DYNASTY` ON `TEXT_INSTANCE_DATA` (`c_pub_dy`);--> statement-breakpoint
CREATE INDEX `TEXT_INSTANCE_DATA_TEXT_INSTANCE_COUNTRY` ON `TEXT_INSTANCE_DATA` (`c_pub_country`);--> statement-breakpoint
CREATE INDEX `TEXT_INSTANCE_DATA_c_textid` ON `TEXT_INSTANCE_DATA` (`c_textid`);--> statement-breakpoint
CREATE INDEX `TEXT_INSTANCE_DATA_c_text_instance_id` ON `TEXT_INSTANCE_DATA` (`c_text_instance_id`);--> statement-breakpoint
CREATE INDEX `TEXT_INSTANCE_DATA_c_text_edition_id` ON `TEXT_INSTANCE_DATA` (`c_text_edition_id`);--> statement-breakpoint
CREATE INDEX `TEXT_INSTANCE_DATA_c_pub_range_code` ON `TEXT_INSTANCE_DATA` (`c_pub_range_code`);--> statement-breakpoint
CREATE INDEX `TEXT_INSTANCE_DATA_c_pub_nh_code` ON `TEXT_INSTANCE_DATA` (`c_pub_nh_code`);--> statement-breakpoint
CREATE INDEX `TEXT_INSTANCE_DATA_PrimaryKey` ON `TEXT_INSTANCE_DATA` (`c_textid`,`c_text_edition_id`,`c_text_instance_id`);--> statement-breakpoint
CREATE TABLE `TEXT_ROLE_CODES` (
	`c_role_id` integer,
	`c_role_desc` numeric,
	`c_role_desc_chn` numeric
);
--> statement-breakpoint
CREATE INDEX `TEXT_ROLE_CODES_c_role_id` ON `TEXT_ROLE_CODES` (`c_role_id`);--> statement-breakpoint
CREATE INDEX `TEXT_ROLE_CODES_PrimaryKey` ON `TEXT_ROLE_CODES` (`c_role_id`);--> statement-breakpoint
CREATE TABLE `TEXT_TYPE` (
	`c_text_type_code` numeric,
	`c_text_type_desc` numeric,
	`c_text_type_desc_chn` numeric,
	`c_text_type_parent_id` numeric,
	`c_text_type_level` integer,
	`c_text_type_sortorder` integer
);
--> statement-breakpoint
CREATE INDEX `TEXT_TYPE_c_text_type_parent_id` ON `TEXT_TYPE` (`c_text_type_parent_id`);--> statement-breakpoint
CREATE INDEX `TEXT_TYPE_c_text_type_code` ON `TEXT_TYPE` (`c_text_type_code`);--> statement-breakpoint
CREATE TABLE `TMP_INDEX_YEAR` (
	`c_personid` integer NOT NULL,
	`c_index_year` integer,
	`c_index_year_source_id` integer
);
--> statement-breakpoint
CREATE INDEX `TMP_INDEX_YEAR_c_personid` ON `TMP_INDEX_YEAR` (`c_personid`);--> statement-breakpoint
CREATE INDEX `TMP_INDEX_YEAR_c_index_year_source_id` ON `TMP_INDEX_YEAR` (`c_index_year_source_id`);--> statement-breakpoint
CREATE INDEX `TMP_INDEX_YEAR_PrimaryKey` ON `TMP_INDEX_YEAR` (`c_personid`);--> statement-breakpoint
CREATE TABLE `YEAR_RANGE_CODES` (
	`c_range_code` integer,
	`c_range` numeric,
	`c_range_chn` numeric,
	`c_approx` numeric,
	`c_approx_chn` numeric
);
--> statement-breakpoint
CREATE INDEX `YEAR_RANGE_CODES_c_range_code` ON `YEAR_RANGE_CODES` (`c_range_code`);--> statement-breakpoint
CREATE INDEX `YEAR_RANGE_CODES_PrimaryKey` ON `YEAR_RANGE_CODES` (`c_range_code`);
*/
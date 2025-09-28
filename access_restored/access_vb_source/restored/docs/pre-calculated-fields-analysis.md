# Pre-calculated Fields in CBDB - Analysis

## Key Discovery
The SQLite database contains pre-calculated fields directly in the BIOG_MAIN table, not in separate views. The Access "ZZZ_*" tables mentioned in the VB code appear to be Access-specific denormalized views that don't exist in SQLite.

## 1. Index Year Calculation

### User Guide Documentation (Pages 444-472)
The index year is calculated using complex rules based on:
- **Rule 1**: Birth year (if known)
- **Rule 2**: Death year - age at death (if known)
- **Rule 3**: Death year - 63 (men) or -55 (women) if only death year known
- **Rules 4-7**: Based on examination degrees (Jinshi -30, Juren -27, Xiucai -21)
- **Rules 8-19**: Based on kinship relationships (father +30, oldest child -30/-27, brothers ±2, etc.)

### Database Evidence
```sql
-- From actual database query:
-- Person 1762 (likely Wang Anshi 王安石):
c_personid: 1762
c_index_year: 1021
c_index_year_type_code: 01  -- "Based on Birth Year"
c_birthyear: 1021
c_deathyear: 1086
c_death_age: 66

-- Person 1588:
c_personid: 1588
c_index_year: NULL
c_index_year_type_code: NULL
c_birthyear: 0
c_deathyear: 0
c_death_age: 0
```

### Index Year Type Codes Table (INDEXYEAR_TYPE_CODES)
Contains 30 different calculation methods:
- **01**: Based on Birth Year (據生年)
- **02**: Based on Death Year - Death Age + 1 (據卒年 - 享年 + 1)
- **03**: Based on Husband's Birth Year + 3 (據其夫生年 + 3)
- **05**: Based on jinshi year -30 (據進士登科年 - 30)
- **11**: Based on Father's Birth Year + 30 (據其父親生年 + 30)
- **13**: Based on Oldest Child's Birth Year - 30 (father) (據長子生年 - 30)
- **29**: Based on Death Year - 63 (male) (據卒年 - 63)
- **30**: Based on Death Year - 55 (female) (據卒年 - 55)

## 2. Death Age Calculation

### Field: c_death_age
Pre-calculated in the database using Chinese age reckoning (birth year = age 1)

### Formula (from evidence):
```sql
-- Wang Anshi example:
Birth: 1021
Death: 1086
Age: 66 (which is 1086 - 1021 + 1)
```

## 3. Missing ZZZ_* Views in SQLite

### What Access Has:
- `ZZZ_BIOG_MAIN` - Denormalized view with descriptions
- `ZZZ_NAMES` - Consolidated names view
- `ZZZ_ALTNAMES` - Alternative names with descriptions

### What SQLite Has:
- Raw tables only (BIOG_MAIN, ALTNAME_DATA, etc.)
- No pre-built views
- All joins must be done at query time

## 4. Implications for Migration

### Need to Create Views or Queries for:

1. **Person Display View** (equivalent to ZZZ_BIOG_MAIN):
```sql
CREATE VIEW person_display AS
SELECT
    bm.*,
    iy.c_index_year_type_desc,
    iy.c_index_year_type_hz,
    d.c_dynasty_desc,
    d.c_dynasty_chn
FROM BIOG_MAIN bm
LEFT JOIN INDEXYEAR_TYPE_CODES iy ON bm.c_index_year_type_code = iy.c_index_year_type_code
LEFT JOIN DYNASTY_CODES d ON bm.c_dynasty = d.c_dynasty_code;
```

2. **Consolidated Names View** (equivalent to ZZZ_NAMES):
```sql
CREATE VIEW all_names AS
-- Main names from BIOG_MAIN
SELECT
    c_personid,
    c_name,
    c_name_chn,
    'main' as name_type
FROM BIOG_MAIN
WHERE c_name IS NOT NULL OR c_name_chn IS NOT NULL

UNION ALL

-- Alternative names from ALTNAME_DATA
SELECT
    c_personid,
    c_alt_name_rm as c_name,
    c_alt_name_chn as c_name_chn,
    'alt' as name_type
FROM ALTNAME_DATA;
```

3. **Nian Hao Display Helper**:
```sql
-- For converting Nian Hao codes to display values
SELECT
    bm.c_personid,
    bm.c_birthyear,
    bm.c_by_nh_code,
    bm.c_by_nh_year,
    nh.c_nianhao_chn as birth_nh_name,
    -- Calculate absolute year if needed
    CASE
        WHEN bm.c_by_nh_code IS NOT NULL AND bm.c_by_nh_year IS NOT NULL
        THEN nh.c_firstyear + bm.c_by_nh_year - 1
        ELSE bm.c_birthyear
    END as calculated_birth_year
FROM BIOG_MAIN bm
LEFT JOIN NIAN_HAO nh ON bm.c_by_nh_code = nh.c_nianhao_id;
```

## 5. Key Findings Summary

1. **Index Year**: Pre-calculated with 30 different calculation methods tracked via c_index_year_type_code
2. **Death Age**: Pre-calculated using Chinese age (add 1 year)
3. **ZZZ Views**: Don't exist in SQLite - need to create equivalents
4. **Nian Hao**: Stored as codes, need joins to display Chinese names
5. **Year Calculations**: Can be done at query time when needed using NIAN_HAO table

## 6. Corrected SQL Queries for Birth/Death Display

### Complete Birth/Death Information Query
```sql
SELECT
    bm.c_personid,
    bm.c_name,
    bm.c_name_chn,

    -- Birth Information
    bm.c_birthyear,
    bm.c_by_nh_code,
    bm.c_by_nh_year,
    nh_birth.c_nianhao_chn as birth_nianhao,
    bm.c_by_month,
    bm.c_by_day,
    bm.c_by_intercalary,

    -- Death Information
    bm.c_deathyear,
    bm.c_dy_nh_code,
    bm.c_dy_nh_year,
    nh_death.c_nianhao_chn as death_nianhao,
    bm.c_dy_month,
    bm.c_dy_day,
    bm.c_dy_intercalary,

    -- Age and Index Year
    bm.c_death_age,
    bm.c_index_year,
    iy.c_index_year_type_desc,
    iy.c_index_year_type_hz

FROM BIOG_MAIN bm
LEFT JOIN NIAN_HAO nh_birth ON bm.c_by_nh_code = nh_birth.c_nianhao_id
LEFT JOIN NIAN_HAO nh_death ON bm.c_dy_nh_code = nh_death.c_nianhao_id
LEFT JOIN INDEXYEAR_TYPE_CODES iy ON bm.c_index_year_type_code = iy.c_index_year_type_code
WHERE bm.c_personid = ?;
```

### Search Query (Replacing ZZZ_BIOG_MAIN)
```sql
-- For person search results display
SELECT
    bm.c_personid,
    bm.c_name,
    bm.c_name_chn,
    bm.c_index_year,
    iy.c_index_year_type_desc,
    iy.c_index_year_type_hz,
    bm.c_dynasty,
    d.c_dynasty_chn,
    bm.c_female
FROM BIOG_MAIN bm
LEFT JOIN INDEXYEAR_TYPE_CODES iy ON bm.c_index_year_type_code = iy.c_index_year_type_code
LEFT JOIN DYNASTY_CODES d ON bm.c_dynasty = d.c_dynasty_code
WHERE bm.c_personid IN (
    -- Results from name search
    SELECT c_personid FROM [name_search_results]
);
```
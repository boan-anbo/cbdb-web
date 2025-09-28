# Birth and Death Year Queries - Deep Dive

## Overview
The Person Browser's biographical tab handles complex birth and death year data including:
- Absolute years (e.g., 1071)
- Reign period years (年號 Nian Hao)
- Year ranges and approximations
- Intercalary months (閏月)
- Floruit (active) years when birth/death unknown

## Database Fields

### BIOG_MAIN Birth/Death Fields
```sql
-- Birth Year Fields
c_birthyear         INTEGER      -- Actual birth year (e.g., 1071)
c_by_nh_code        INTEGER      -- Birth year Nian Hao (reign period) ID
c_by_nh_year        INTEGER      -- Year within the reign period
c_by_range          INTEGER      -- Range/approximation code
c_by_month          INTEGER      -- Birth month (1-12)
c_by_day            INTEGER      -- Birth day (1-31)
c_by_intercalary    NUMERIC(1)   -- Is intercalary month (0/1)
c_by_day_gz         INTEGER      -- Day in Ganzhi cycle

-- Death Year Fields
c_deathyear         INTEGER      -- Actual death year
c_dy_nh_code        INTEGER      -- Death year Nian Hao ID
c_dy_nh_year        INTEGER      -- Year within the reign period
c_dy_range          INTEGER      -- Range/approximation code
c_dy_month          INTEGER      -- Death month
c_dy_day            INTEGER      -- Death day
c_dy_intercalary    NUMERIC(1)   -- Is intercalary month (0/1)
c_dy_day_gz         INTEGER      -- Day in Ganzhi cycle

-- Age Calculation
c_death_age         INTEGER      -- Age at death (calculated)

-- Floruit Years (when birth/death unknown)
c_fl_earliest_year  INTEGER      -- Earliest active year
c_fl_ey_nh_code     INTEGER      -- Earliest year Nian Hao ID
c_fl_ey_nh_year     INTEGER      -- Year within reign period
c_fl_ey_notes       NUMERIC      -- Notes about earliest year

c_fl_latest_year    INTEGER      -- Latest active year
c_fl_ly_nh_code     INTEGER      -- Latest year Nian Hao ID
c_fl_ly_nh_year     INTEGER      -- Year within reign period
c_fl_ly_notes       NUMERIC      -- Notes about latest year
```

## Query Patterns

### 1. Loading Person Biographical Data
**Original Access Pattern**: Form recordset bound to BIOG_MAIN table directly
**VB Evidence**: Form_BIOG_MAIN_2_Subform.cls - No explicit RecordSource query found, form bound directly to table
```sql
-- Main person data loaded via form binding to BIOG_MAIN
-- Access loads all fields automatically when form bound to table
SELECT * FROM BIOG_MAIN
WHERE c_personid = ?;

-- For search results, uses ZZZ_BIOG_MAIN (denormalized view)
SELECT
    c_personid, c_name, c_name_chn,
    c_index_year, c_index_year_type_desc, c_index_year_type_hz,
    c_dynasty, c_dynasty_chn, c_female
FROM ZZZ_BIOG_MAIN
WHERE c_personid = ?;
```

### 2. Nian Hao (Reign Period) Lookup
**VB Code Pattern** (verified from Form_BIOG_MAIN_2_Subform.cls lines 4-19):
```vb
Private Sub c_by_nh_code_AfterUpdate()
    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    If IsNull(c_by_nh_code.Value) Then
         TxtBYNH.Value = ""
    Else
         rst.Open "nian_hao", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_nianhao_id = " & c_by_nh_code.Value
         TxtBYNH.Value = rst.Fields("c_nianhao_chn")
         rst.Close
    End If
End Sub
```

**SQL Translation**:
```sql
-- Lookup reign period for birth year
SELECT
    c_nianhao_id,
    c_nianhao_chn,      -- Chinese name (e.g., "開元")
    c_nianhao,          -- Romanized name
    c_firstyear,        -- First year of reign (absolute)
    c_lastyear,         -- Last year of reign (absolute)
    c_dynasty           -- Dynasty code
FROM NIAN_HAO
WHERE c_nianhao_id = ?;

-- Example: User enters birth as "開元 3年"
-- c_by_nh_code = 123 (開元 ID)
-- c_by_nh_year = 3
-- Actual year = c_firstyear + c_by_nh_year - 1
```

### 3. Year Calculation from Nian Hao
**NOTE**: No year calculation logic found in VB code - Access displays Nian Hao name only
**The absolute year calculation appears to be done elsewhere or not at all in the form**
```sql
-- Theoretical calculation (not found in actual VB code)
-- For birth year
SELECT
    nh.c_firstyear + bm.c_by_nh_year - 1 AS calculated_birth_year
FROM BIOG_MAIN bm
LEFT JOIN NIAN_HAO nh ON bm.c_by_nh_code = nh.c_nianhao_id
WHERE bm.c_personid = ?;

-- For death year
SELECT
    nh.c_firstyear + bm.c_dy_nh_year - 1 AS calculated_death_year
FROM BIOG_MAIN bm
LEFT JOIN NIAN_HAO nh ON bm.c_dy_nh_code = nh.c_nianhao_id
WHERE bm.c_personid = ?;
```

### 4. Nian Hao Picker Dialog Search
**VB Code Verified** (Form_frmPickNIAN_HAO.cls lines 32-53):
```vb
Private Sub CmdFind_Click()
    Dim StrSearch As String
    Me.TxtSearch.SetFocus
    StrSearch = Me.TxtSearch.Value
    If StrSearch <> "" Then
       Dim rsNH As DAO.Recordset
       Set rsNH = frmNIAN_HAO.Form.Recordset
       Dim StrSearchStr As String
       StrSearchStr = "c_nianhao_chn = " + Chr(34) + StrSearch + Chr(34)
       rsNH.FindFirst StrSearchStr  ' Searches for exact match
    End If
End Sub
```

**SQL Translation**:
```sql
-- Search for reign period by Chinese name
SELECT
    c_nianhao_id,
    c_nianhao_chn,
    c_nianhao,
    c_firstyear,
    c_lastyear,
    c_dynasty
FROM NIAN_HAO
WHERE c_nianhao_chn = ?
ORDER BY c_firstyear;

-- Or partial match search
SELECT * FROM NIAN_HAO
WHERE c_nianhao_chn LIKE ? || '%'
ORDER BY c_firstyear;
```

### 5. Dynasty-Filtered Nian Hao List
```sql
-- Get all reign periods for a dynasty
SELECT
    c_nianhao_id,
    c_nianhao_chn,
    c_nianhao,
    c_firstyear,
    c_lastyear
FROM NIAN_HAO
WHERE c_dynasty = ?
ORDER BY c_firstyear;
```

### 6. Age Calculation
**VB Evidence**: c_death_age field exists in table but no calculation logic found in form code
**Age appears to be pre-calculated in the database, not computed in the form**
```sql
-- c_death_age is stored in BIOG_MAIN table
-- No evidence of calculation in form, likely computed during data entry/import
SELECT c_death_age FROM BIOG_MAIN WHERE c_personid = ?;

-- Theoretical calculation (if needed):
-- Chinese age: deathyear - birthyear + 1
```

### 7. Floruit Years Query
```sql
-- When birth/death unknown, use floruit (active) years
SELECT
    c_fl_earliest_year,
    c_fl_latest_year,
    nh1.c_nianhao_chn AS earliest_nh,
    nh2.c_nianhao_chn AS latest_nh
FROM BIOG_MAIN bm
LEFT JOIN NIAN_HAO nh1 ON bm.c_fl_ey_nh_code = nh1.c_nianhao_id
LEFT JOIN NIAN_HAO nh2 ON bm.c_fl_ly_nh_code = nh2.c_nianhao_id
WHERE bm.c_personid = ?;
```

### 8. Index Year Calculation
**VB Evidence**: c_index_year stored in BIOG_MAIN and ZZZ_BIOG_MAIN views
**No calculation logic found in form code - appears pre-calculated**
```sql
-- Index year is stored, not calculated in forms
SELECT
    c_index_year,
    c_index_year_type_desc,  -- Description of how it was determined
    c_index_year_type_hz     -- Chinese description
FROM ZZZ_BIOG_MAIN
WHERE c_personid = ?;

-- The calculation logic (if needed for migration) would be:
-- Priority not verified from VB code, theoretical based on CBDB documentation
```

### 9. Intercalary Month Handling
```sql
-- Special handling for intercalary months
-- Example: 閏三月 (intercalary 3rd month)
SELECT
    c_personid,
    c_by_month,
    c_by_intercalary,
    CASE
        WHEN c_by_intercalary = 1
        THEN '閏' || c_by_month || '月'
        ELSE c_by_month || '月'
    END AS birth_month_display
FROM BIOG_MAIN
WHERE c_personid = ?;
```

### 10. Duplicate Name Check
**VB Code Verified** (lines 122-165, 238-282):
```vb
' From c_mingzi_chn_AfterUpdate and c_surname_chn_BeforeUpdate
rst.Open "BIOG_MAIN", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
Do
    If rst.EOF = True Then Exit Do

    strSUR_Find = rst!c_surname_chn.Value
    strNM_Find = rst!c_mingzi_chn.Value

    If StrComp(strSUR_Find, strSUR) = 0 And StrComp(strNM_Find, strNM) = 0 Then
        If rst!c_personid = intPerson Then
            'Exclude current record
            rst.MoveNext
        Else
            Counter = Counter + 1
            rst.MoveNext
        End If
    Else
        rst.MoveNext
    End If
Loop

If Counter > 0 Then
    MsgBox "Found " & Counter & " records with identical names"
End If
```

**SQL Translation**:
```sql
-- VB code actually loops through ALL records (inefficient!)
-- Modern SQL equivalent:
SELECT
    COUNT(*) as duplicate_count
FROM BIOG_MAIN
WHERE c_surname_chn = ?
    AND c_mingzi_chn = ?
    AND c_personid != ?;  -- Exclude current record
```

### 11. Year Range Codes
```sql
-- Year range/approximation codes (c_by_range, c_dy_range)
-- These link to YEAR_RANGE_CODES table
SELECT
    bm.c_birthyear,
    bm.c_by_range,
    yr.c_range_desc,      -- e.g., "circa", "before", "after"
    yr.c_range_desc_chn   -- e.g., "約", "前", "後"
FROM BIOG_MAIN bm
LEFT JOIN YEAR_RANGE_CODES yr ON bm.c_by_range = yr.c_range_code
WHERE bm.c_personid = ?;
```

## Complex Query Examples

### Complete Birth Information Display
```sql
-- Combines absolute year, reign period, range, and intercalary
SELECT
    bm.c_personid,
    bm.c_birthyear,
    nh.c_nianhao_chn,
    bm.c_by_nh_year,
    yr.c_range_desc_chn,
    bm.c_by_month,
    bm.c_by_day,
    bm.c_by_intercalary,
    -- Construct display string
    CASE
        WHEN bm.c_birthyear IS NOT NULL THEN
            COALESCE(yr.c_range_desc_chn, '') ||
            CAST(bm.c_birthyear AS TEXT) || '年'
        WHEN nh.c_nianhao_chn IS NOT NULL THEN
            COALESCE(yr.c_range_desc_chn, '') ||
            nh.c_nianhao_chn || CAST(bm.c_by_nh_year AS TEXT) || '年'
        ELSE ''
    END ||
    CASE
        WHEN bm.c_by_month IS NOT NULL THEN
            CASE WHEN bm.c_by_intercalary = 1 THEN '閏' ELSE '' END ||
            CAST(bm.c_by_month AS TEXT) || '月'
        ELSE ''
    END ||
    CASE
        WHEN bm.c_by_day IS NOT NULL THEN
            CAST(bm.c_by_day AS TEXT) || '日'
        ELSE ''
    END AS full_birth_display
FROM BIOG_MAIN bm
LEFT JOIN NIAN_HAO nh ON bm.c_by_nh_code = nh.c_nianhao_id
LEFT JOIN YEAR_RANGE_CODES yr ON bm.c_by_range = yr.c_range_code
WHERE bm.c_personid = ?;
```

### Person Timeline Query
```sql
-- Get all dated events for a person's timeline
SELECT
    'Birth' as event_type,
    c_birthyear as year,
    c_by_month as month,
    c_by_day as day
FROM BIOG_MAIN
WHERE c_personid = ? AND c_birthyear IS NOT NULL

UNION ALL

SELECT
    'Death' as event_type,
    c_deathyear as year,
    c_dy_month as month,
    c_dy_day as day
FROM BIOG_MAIN
WHERE c_personid = ? AND c_deathyear IS NOT NULL

UNION ALL

SELECT
    'Earliest Activity' as event_type,
    c_fl_earliest_year as year,
    NULL as month,
    NULL as day
FROM BIOG_MAIN
WHERE c_personid = ? AND c_fl_earliest_year IS NOT NULL

UNION ALL

SELECT
    'Latest Activity' as event_type,
    c_fl_latest_year as year,
    NULL as month,
    NULL as day
FROM BIOG_MAIN
WHERE c_personid = ? AND c_fl_latest_year IS NOT NULL

ORDER BY year, month, day;
```

## Performance Optimizations

### Indexes Needed
```sql
-- Critical indexes for birth/death queries
CREATE INDEX idx_biog_main_personid ON BIOG_MAIN(c_personid);
CREATE INDEX idx_biog_main_by_nh ON BIOG_MAIN(c_by_nh_code);
CREATE INDEX idx_biog_main_dy_nh ON BIOG_MAIN(c_dy_nh_code);
CREATE INDEX idx_nian_hao_id ON NIAN_HAO(c_nianhao_id);
CREATE INDEX idx_nian_hao_dynasty ON NIAN_HAO(c_dynasty);
CREATE INDEX idx_nian_hao_years ON NIAN_HAO(c_firstyear, c_lastyear);
```

### Caching Strategy
```typescript
// Cache frequently accessed Nian Hao data
interface NianHaoCache {
  [id: number]: {
    id: number;
    name_chn: string;
    name: string;
    firstYear: number;
    lastYear: number;
    dynasty: number;
  }
}

// Cache year range codes
interface YearRangeCache {
  [code: number]: {
    desc: string;
    desc_chn: string;
  }
}
```

## Migration Notes

### Critical Business Logic (Verified from VB)
1. **NULL Handling**: All Nian Hao lookups check IsNull() first
2. **Nian Hao Display**: Only shows name, no year calculation in forms
3. **Age Display**: c_death_age is pre-stored, not calculated
4. **Intercalary Months**: c_by_intercalary/c_dy_intercalary flags stored
5. **Index Year**: Pre-calculated and stored with type description
6. **Duplicate Check**: Loops through entire table (inefficient!)
7. **Auto ID Generation**: Uses DMax("c_personid", "BIOG_MAIN") + 1

### Data Integrity Rules
1. Birth year should be less than death year
2. Nian Hao year should be within reign period range
3. Month values 1-12 only
4. Day values 1-31 only (no calendar validation in original)
5. Intercalary flag only 0 or 1

### UI Behaviors to Preserve
1. Auto-lookup Nian Hao name when code changes
2. Duplicate name warning on entry
3. Modal Nian Hao picker dialog
4. Automatic person ID generation on new record
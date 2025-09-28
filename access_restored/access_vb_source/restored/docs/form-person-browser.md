# Person Browser Form

## Overview
The Person Browser is the primary interface for searching and viewing detailed information about individuals in the CBDB database. It combines search functionality with comprehensive data display across multiple categories.

## User Guide References
- Pages 36-38: Browser overview and search functions
- Page 37: Name search functionality including Chinese and Pinyin

## Visual Structure

### Layout Components
1. **Top Section - Search Controls**
   - Search by Name (Chinese/Pinyin input boxes)
   - Search by Surname + Office button
   - Language toggle (English/繁體/简体)

2. **Middle Section - Results List**
   - Person list showing name, ID, dynasty, index year
   - Record navigation (1 of 4 display with nav arrows)

3. **Main Section - Detail Tabs**
   - Biographical data
   - Addresses
   - Alt Names
   - Writings
   - Postings
   - Entry
   - Events
   - Status
   - Kinship
   - Associations
   - Possessions
   - Sources
   - Institutions

## Source Files

### Primary Forms
- `person_biographical/Form_frmSelectPerson.cls` - Main search logic
- `person_biographical/Form_BIOG_MAIN_2_Subform.cls` - Biographical details subform
- `person_biographical/Form_ALTNAME_DATA_2_Subform.cls` - Alternative names subform
- `person_biographical/Form_BIOG_ADDR_DATA_2_Subform.cls` - Addresses subform

### Supporting Files
- `picker_dialogs/Form_frmPickNIAN_HAO.cls` - Reign period picker
- `temp_scratch/Z_NAME_SEARCH.cls` - Temporary search table handler

## Core Logic

### Name Search Algorithm
```vb
' From Form_frmSelectPerson.cls lines 94-136
Private Sub CmdFind_Click()
    ' Search priority:
    ' 1. Chinese characters (if provided)
    ' 2. Pinyin (if no Chinese)

    ' Special prefixes:
    ' ! = Exact match from start
    ' Uppercase first = Search both start AND contains
    ' Lowercase = Search contains only

    ' Search progression:
    ' 1. Check c_name and c_name_chn in ZZZ_BIOG_MAIN
    ' 2. Check c_name_proper and c_name_rm in ZZZ_BIOG_MAIN
    ' 3. Check all names in ZZZ_ALTNAMES
```

### Search Implementation Details
```vb
' Build search WHERE clause based on input type
If Left(tStrName, 1) = "!" Then
    ' Exact match from beginning
    tStrName = Mid(TxtName.Value, 2)
    tStr = " Left(c_name," + Str(Len(tStrName)) + ") = " + tQt + Trim(tStrName) + tQt
ElseIf UCase(Left(tStrName, 1)) = Left(tStrName, 1) Then
    ' Uppercase - search both beginning and contains
    tStr = " Left(c_name," + Str(Len(tStrName)) + ") = " + tQt + Trim(tStrName) + tQt + _
           " OR c_name LIKE " + tQt + "%" + " " + Trim(tStrName) + "%" + tQt
Else
    ' Lowercase - search contains
    tStr = " c_name LIKE " + tQt + "%" + Trim(tStrName) + "%" + tQt
End If
```

### Search by Surname + Office
Opens a separate dialog allowing:
- Surname input (Chinese or Pinyin)
- Office title selection
- Year range filtering
- Dynasty filtering

## Data Flow

### Search Process
```
1. User enters search criteria
   ↓
2. Clear temporary tables (Z_NAME_SEARCH, ZZ_SCRATCH_PEOPLE)
   ↓
3. Search ZZZ_NAMES view with built WHERE clause
   → INSERT matching IDs into Z_NAME_SEARCH
   ↓
4. JOIN Z_NAME_SEARCH with ZZZ_BIOG_MAIN
   → INSERT full person records into ZZ_SCRATCH_PEOPLE
   ↓
5. Bind form recordset to ZZ_SCRATCH_PEOPLE
   ↓
6. Display results in browser
```

### Tab Data Loading
Each tab loads data on-demand when selected:
```
Tab Click → Query specific table → Populate subform → Display data
```

## Tables Used

### Primary Tables
- `ZZZ_BIOG_MAIN` - Denormalized view of BIOG_MAIN with descriptions
- `ZZZ_NAMES` - Consolidated view of all names (main + alternatives)
- `ZZZ_ALTNAMES` - Alternative names with type descriptions

### Temporary Tables
- `Z_NAME_SEARCH` - Stores person IDs from name search
- `ZZ_SCRATCH_PEOPLE` - Stores full person records for display
- `Z_SCRATCH_DUMMY_PL` - Empty recordset for form reset

### Related Data Tables
- `BIOG_ADDR_DATA` - Person addresses
- `ALTNAME_DATA` - Alternative names
- `POSTING_DATA` - Official positions
- `ENTRY_DATA` - Entry methods
- `STATUS_DATA` - Social/economic status
- `KINSHIP_DATA` - Family relationships
- `ASSOC_DATA` - Social associations

### Reference Tables
- `NIAN_HAO` - Reign periods
- `DYNASTY_CODES` - Dynasty information
- `ADDR_CODES` - Address codes
- `OFFICE_CODES` - Office titles

## Key Features

### Multi-language Support
```vb
' Global variable controls display
Public gDisplayLanguage As String
' Values: "ENG", "CHN", "CHN_SIMP"

' Switches between:
' - c_name (Pinyin) / c_name_chn (Traditional) / c_name_chn_simp (Simplified)
' - English descriptions / Chinese descriptions
```

### Person ID Navigation
- Can open browser with specific person ID via OpenArgs
- Direct navigation to person from other forms

### External Database Links
Built-in hyperlinks to:
- Kyoto University Tang Database (唐代人物知識ベース)
- McGill Ming-Qing Women Writers (明清婦女著作數據庫)
- Academia Sinica Name Authority (明清人名權威檔案)

## Validation Rules

### Search Input
- Chinese name takes precedence over Pinyin
- Empty search not allowed
- Special character handling for wildcards

### Person Records
- Person ID must exist in BIOG_MAIN
- Female field: 0 (male) or 1 (female)
- Index year calculated if missing

### Date Fields
- Birth year must precede death year
- Intercalary months require special flags
- Reign periods must match dynasty

## Performance Considerations

### Original Access Implementation
- Uses temporary tables to stage results
- Client-side joins for complex queries
- Synchronous search operations
- Full table scan for name searches

### Optimization Opportunities
- Index on name fields (c_name, c_name_chn)
- Full-text search for contains queries
- Cached reference data
- Pagination for large result sets

## Migration Notes

### Must Preserve
1. **Search logic hierarchy** - The exact order and logic of search patterns
2. **Special prefix handling** - !, uppercase, lowercase behaviors
3. **Chinese priority** - Always search Chinese before Pinyin
4. **Temporary table pattern** - Stage results before display
5. **All data tabs** - Every category of information must be accessible

### Can Modernize
1. **Real-time search** - Search as user types vs click button
2. **Unified search box** - Auto-detect Chinese vs Pinyin
3. **Infinite scroll** - Replace pagination with scrolling
4. **Tab lazy loading** - Load tab data only when accessed
5. **Responsive layout** - Adapt to screen size

### Implementation Priorities
1. **Phase 1**: Basic search and main biographical display
2. **Phase 2**: All data tabs functional
3. **Phase 3**: Search by Surname + Office
4. **Phase 4**: External database links

### Technical Considerations

#### Frontend (Vue 3)
```typescript
// Component structure
PersonBrowser.vue
├── PersonSearch.vue
├── PersonList.vue
├── PersonDetail.vue
│   ├── BiographicalTab.vue
│   ├── AddressesTab.vue
│   ├── AltNamesTab.vue
│   └── ... other tabs
```

#### Backend (NestJS)
```typescript
// Service structure
PersonService
├── searchByName(query: SearchRequest)
├── searchBySurnameOffice(query: SurnameOfficeRequest)
├── getPersonDetail(id: number)
├── getPersonAddresses(id: number)
└── ... other data methods
```

#### State Management (Pinia)
```typescript
// Store structure
usePersonStore
├── searchResults: Person[]
├── selectedPerson: Person | null
├── searchCriteria: SearchCriteria
├── displayLanguage: 'ENG' | 'CHN' | 'CHN_SIMP'
```

### Testing Checklist
- [ ] Search returns same results as Access for test queries
- [ ] All special prefixes work correctly
- [ ] Chinese search prioritized over Pinyin
- [ ] All tabs display correct data
- [ ] Navigation between records works
- [ ] Language switching updates all labels
- [ ] External database links functional
- [ ] Performance acceptable for large result sets
- [ ] Validation rules enforced
- [ ] Keyboard navigation supported
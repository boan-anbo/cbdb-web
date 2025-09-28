# CBDB Access Forms Documentation

This directory contains detailed documentation for each Access form in the CBDB database. Each form has its own documentation file that includes all associated VB source files, logic analysis, and migration notes.

## Documentation Structure

Each form documentation file follows this structure:
1. **Overview** - Purpose and context of the form
2. **User Guide References** - Links to relevant pages in the CBDB User Guide
3. **Visual Structure** - Layout and UI elements description
4. **Source Files** - List of all VB files associated with the form
5. **Core Logic** - Detailed analysis of the form's functionality
6. **Data Flow** - How data moves through the form
7. **Tables Used** - Database tables accessed by the form
8. **Migration Notes** - Specific considerations for the modern implementation

## Forms by Category

### Core Person Management
- [`form-person-browser.md`](form-person-browser.md) - Main person search and detail browser
- [`form-person-search.md`](form-person-search.md) - Advanced person search dialog
- [`form-navigation-pane.md`](form-navigation-pane.md) - Central navigation hub

### Biographical Data Entry
- [`form-biog-main.md`](form-biog-main.md) - Main biographical data entry
- [`form-altname-data.md`](form-altname-data.md) - Alternative names management
- [`form-biog-addr-data.md`](form-biog-addr-data.md) - Address information

### Relationships
- [`form-kinship.md`](form-kinship.md) - Family relationships
- [`form-associations.md`](form-associations.md) - Social and professional associations

### Career and Status
- [`form-offices-postings.md`](form-offices-postings.md) - Official positions and appointments
- [`form-entry-methods.md`](form-entry-methods.md) - Methods of entering government service
- [`form-status.md`](form-status.md) - Social and economic status

### Other Data
- [`form-texts.md`](form-texts.md) - Literary works and writings
- [`form-events.md`](form-events.md) - Life events
- [`form-possessions.md`](form-possessions.md) - Property and possessions
- [`form-institutions.md`](form-institutions.md) - Institutional affiliations

### Picker Dialogs
- [`form-picker-nianhao.md`](form-picker-nianhao.md) - Reign period selector
- [`form-picker-address.md`](form-picker-address.md) - Address code selector
- [`form-picker-office.md`](form-picker-office.md) - Office code selector
- [`form-picker-status.md`](form-picker-status.md) - Status code selector

### Analysis Tools
- [`form-lookup-kinship.md`](form-lookup-kinship.md) - Kinship network analysis
- [`form-lookup-networks.md`](form-lookup-networks.md) - Social network analysis
- [`form-lookup-entry.md`](form-lookup-entry.md) - Entry method analysis

## Key Technical Patterns

### Common VB Patterns Found Across Forms

#### 1. Search Strategy
Most search forms follow this pattern:
```vb
' Progressive search from specific to broad
1. Exact match (with ! prefix)
2. Starts with (uppercase first letter)
3. Contains (default)
```

#### 2. Temporary Table Usage
```vb
' Prefix conventions:
Z_*         ' Temporary working tables
ZZ_*        ' User session scratch tables
ZZZ_*       ' Cached/denormalized views
```

#### 3. Multi-language Support
```vb
' Global variable controls display
gDisplayLanguage = "ENG" | "CHN" | "CHN_SIMP"
```

#### 4. Modal Dialog Pattern
```vb
DoCmd.OpenForm "formName", , , , , acDialog, OpenArgs
' Parent form waits for dialog to close
If CurrentProject.AllForms("formName").IsLoaded Then
    ' Retrieve selected values
End If
```

## Database Table Categories

### Core Biographical Tables
- `BIOG_MAIN` - Main person records
- `BIOG_ADDR_DATA` - Person addresses
- `ALTNAME_DATA` - Alternative names

### Relationship Tables
- `KINSHIP_DATA` - Family relationships
- `ASSOC_DATA` - Social associations

### Career Tables
- `POSTING_DATA` - Official appointments
- `ENTRY_DATA` - Entry into service
- `STATUS_DATA` - Social/economic status

### Code/Reference Tables
- `*_CODES` tables - Normalized reference data
- `NIAN_HAO` - Reign periods
- `DYNASTY_CODES` - Dynasty information

### Temporary/Working Tables
- `Z_NAME_SEARCH` - Name search results
- `ZZ_SCRATCH_PEOPLE` - Session person data
- `ZZZ_*` - Cached/denormalized views

## Migration Strategy

### Phase 1: Core Forms (Current)
1. Person Browser - Primary interface for viewing person data
2. Navigation Pane - Central hub for accessing all features
3. Person Search - Name and office-based searching

### Phase 2: Data Entry Forms
1. Biographical main form
2. Alternative names
3. Addresses
4. Basic relationships

### Phase 3: Complex Relationships
1. Kinship networks
2. Social associations
3. Office postings
4. Entry methods

### Phase 4: Analysis Tools
1. Network analysis
2. Geographic analysis
3. Temporal analysis
4. Statistical reports

## Form Interaction Patterns

### Standard CRUD Flow
```
List/Browse → Select/Search → Detail View → Edit → Save
```

### Picker Pattern
```
Main Form → Open Picker → Select from Tree/List → Return Value → Update Main Form
```

### Search Pattern
```
Enter Criteria → Build Query → Populate Temp Table → Display Results → Select → Navigate to Detail
```

## Validation Rules Summary

### Global Rules
1. All person IDs must exist in BIOG_MAIN
2. All code references must exist in respective _CODES tables
3. Date ranges must be historically valid
4. Intercalary months require special handling

### Field-Specific Rules
- `c_female`: 0 or 1 only
- Years: 4-digit integers, BC years negative
- Names: UTF-8 Chinese or ASCII romanization
- Codes: Integer references to _CODES tables

## Performance Considerations

### Original Access Patterns
- Heavy use of client-side joins
- Temporary tables for complex queries
- Synchronous operations only
- Limited to single-user or small concurrent users

### Modern Migration Approach
- Server-side query optimization
- Caching strategies for reference data
- Asynchronous operations
- Multi-user concurrency support
- Pagination for large result sets

## Testing Requirements

For each form migration:
1. **Functional Testing**: All features work as in Access
2. **Data Integrity**: Same query returns same results
3. **Performance**: Response time under 2 seconds for standard operations
4. **Validation**: All rules enforced
5. **Multi-language**: All three languages display correctly
6. **Cross-browser**: Works in Chrome, Firefox, Safari, Edge
7. **Responsive**: Adapts to different screen sizes

## Notes for Developers

### Priority Preservation
These Access behaviors MUST be preserved exactly:
1. Search logic and result ordering
2. Validation rules and constraints
3. Calculation formulas
4. Data relationships and integrity

### Allowed Improvements
These can be modernized while preserving functionality:
1. UI/UX design (while maintaining all fields)
2. Real-time search vs button clicks
3. Inline editing vs modal dialogs
4. Pagination vs scrolling
5. Keyboard shortcuts
6. Export formats

### Do Not Implement
These Access limitations should NOT be replicated:
1. Single-user locking
2. Synchronous-only operations
3. Fixed window sizes
4. Modal-only dialogs
5. Client-side joins for large datasets
# Navigation Pane Form

## Overview
The Navigation Pane serves as the central control hub for the CBDB Access interface. It provides access to all major functions including the browser, analysis tools, system maintenance, and user documentation.

## User Guide References
- Pages 33-35: Navigation Pane overview and functions
- Page 34: Relinking data tables functionality
- Page 35: Index address ranking configuration

## Visual Structure

### Main Sections
1. **Query Tools Section**
   - Browser (person search and details)
   - Eight analysis forms

2. **System Functions**
   - Error Reporting
   - User's Guide access
   - Relink Data Tables
   - Change Index Address Ranking

3. **Quick Access Buttons**
   - Arranged in a grid layout
   - Visual icons for each function

## Source Files

### Primary Form
- `navigation_ui/Form_NavigationPane.cls` - Main navigation form

### Related Utilities
- `utility/Form_RelinkTables.cls` - Data table relinking
- `utility/Form_IndexAddressRanking.cls` - Configure address priorities
- `utility/Form_ErrorReport.cls` - Error reporting interface

## Core Functions

### 1. Browser Launch
Opens the main Person Browser form for searching and viewing person records.

### 2. Analysis Tools
Provides access to eight specialized analysis forms:
- **Query by Methods of Entry** - Analyze entry into government service
- **Query by Kinship** - Explore family relationships
- **Query by Association** - Examine social networks
- **Query by Posting** - Study official appointments
- **Query by Status** - Analyze social/economic status
- **Query by Address** - Geographic distribution analysis
- **Query Mode Analysis** - Statistical analysis modes
- **Choropleth Mapping** - Geographic visualization

### 3. Error Reporting
```vb
' Opens Google Form for error submission
Private Sub CmdReportError_Click()
    ' Navigate to error reporting form
    ' Collects: Error type, Description, User info
    OpenURL("https://forms.google.com/cbdb-error-report")
End Sub
```

### 4. User's Guide
```vb
Private Sub CmdUsersGuide_Click()
    ' Opens PDF version of User's Guide
    OpenFile("CBDB_Users_Guide.pdf")
End Sub
```

### 5. Relink Data Tables

#### Purpose
Since CBDB data is split across multiple Access files due to size limitations:
- User interface file (CBDB_Interface.accdb)
- Data file 1 (CBDB_DATA1_YYYYMMDD.accdb)
- Data file 2 (CBDB_DATA2_YYYYMMDD.accdb)
- Data file 3 (CBDB_DATA3_YYYYMMDD.accdb)

#### Relinking Process
```vb
Private Sub RelinkTables(DateStamp As String)
    ' 1. Build new file names with date stamp
    File1 = "CBDB_DATA1_" & DateStamp & ".accdb"
    File2 = "CBDB_DATA2_" & DateStamp & ".accdb"
    File3 = "CBDB_DATA3_" & DateStamp & ".accdb"

    ' 2. Update table links
    For Each tbl In CurrentDb.TableDefs
        If tbl.Connect <> "" Then
            ' Update connection string to new file
            tbl.Connect = ";DATABASE=" & NewDataFile
            tbl.RefreshLink
        End If
    Next
End Sub
```

### 6. Change Index Address Ranking

#### Purpose
Allows users to customize how "index place" is determined for each person based on different types of address relationships.

#### Default Ranking Order
1. Basic Affiliation (基本籍貫)
2. Household Address (戶籍地)
3. Actual Residence (實際居住地)
4. Place of Birth
5. Place of Death
6. Burial Place

#### Configuration Process
```vb
Private Sub UpdateIndexAddresses()
    ' 1. Read user's ranking preferences
    ' 2. Recalculate index addresses for all persons
    ' 3. Update c_index_addr_id in BIOG_MAIN
    ' 4. Propagate to all dependent tables
End Sub
```

## Data Flow

### Navigation Pattern
```
Navigation Pane
├→ Browser → Person Search/Details
├→ Analysis Tool → Specific Query Form → Results
├→ Utility Function → Configuration/Maintenance
└→ Documentation → External PDF/Web
```

### Table Linking Flow
```
1. User downloads new data files (YYYYMMDD stamp)
   ↓
2. Opens Relink Tables dialog
   ↓
3. Enters new date stamp
   ↓
4. System updates all table connections
   ↓
5. Verifies successful linking
```

## Tables Used

### System Tables
- `MSysObjects` - Access system table for database objects
- `MSysRelationships` - Relationship definitions

### Configuration Tables
- `Z_CONFIG_ADDR_RANKING` - Stores address type priorities
- `Z_CONFIG_USER_PREFS` - User preferences

### All CBDB Tables
The Navigation Pane provides access to all tables through various forms:
- Biographical tables (BIOG_*)
- Relationship tables (*_DATA)
- Reference tables (*_CODES)

## Key Features

### Auto-linking on Startup
```vb
Private Sub Form_Open()
    ' Automatically link data tables if in same folder
    If CheckDataFilesExist() Then
        AutoLinkTables()
    Else
        MsgBox "Data files not found. Use Relink Tables."
    End If
End Sub
```

### Session Management
- Maintains user preferences across sessions
- Remembers last used language setting
- Preserves custom address rankings

### Error Handling
- Comprehensive error reporting system
- Captures error context and user actions
- Direct submission to development team

## Validation Rules

### Data File Validation
- Files must have matching date stamps
- All three data files must be present
- Tables must link successfully

### Address Ranking Rules
- At least one address type must be enabled
- Order must be unique (no duplicates)
- Changes apply globally to all records

## Performance Considerations

### Original Access Implementation
- Table linking can be slow for large databases
- Index recalculation is resource-intensive
- Single-threaded operations

### Optimization Opportunities
- Background table linking
- Incremental index updates
- Cached configuration settings

## Migration Notes

### Must Preserve
1. **All navigation paths** - Every form must be accessible
2. **Table linking concept** - Support for updating data independently
3. **Address ranking logic** - Exact algorithm for index place
4. **Error reporting flow** - User-friendly problem submission

### Can Modernize
1. **Visual design** - Modern navigation UI (sidebar, ribbons, etc.)
2. **Dynamic loading** - Load forms on-demand
3. **Web-based help** - Replace PDF with online documentation
4. **Real-time linking** - Auto-detect new data files
5. **Cloud error reporting** - Direct API submission

### Implementation Priorities
1. **Phase 1**: Basic navigation to Browser and core forms
2. **Phase 2**: Analysis tool access
3. **Phase 3**: Configuration utilities
4. **Phase 4**: Advanced features

### Technical Considerations

#### Frontend (Vue 3)
```typescript
// Component structure
NavigationPane.vue
├── NavigationMenu.vue
│   ├── MenuSection.vue
│   └── MenuItem.vue
├── QuickAccessGrid.vue
└── SystemStatus.vue
```

#### Backend (NestJS)
```typescript
// Service structure
NavigationService
├── getAvailableForms(): FormInfo[]
├── checkDataConnection(): ConnectionStatus
├── updateAddressRanking(ranking: AddressRanking[])
└── submitErrorReport(error: ErrorReport)
```

#### State Management (Pinia)
```typescript
// Store structure
useNavigationStore
├── activeForm: string | null
├── dataConnectionStatus: ConnectionStatus
├── userPreferences: UserPreferences
├── addressRanking: AddressRanking[]
```

### Modern Architecture Approach

#### Data Management
Instead of relinking Access files:
```typescript
// Modern approach with SQLite
class DataVersionService {
  // Check for new data versions
  async checkForUpdates(): DataVersion

  // Download and apply updates
  async updateDatabase(version: string)

  // Maintain version history
  async getVersionHistory(): DataVersion[]
}
```

#### Navigation Pattern
Modern single-page application approach:
```typescript
// Vue Router configuration
const routes = [
  { path: '/', component: NavigationPane },
  { path: '/browser', component: PersonBrowser },
  { path: '/analysis/entry', component: EntryAnalysis },
  // ... other routes
]
```

### Testing Checklist
- [ ] All forms accessible from navigation
- [ ] Table linking works with test data files
- [ ] Address ranking updates correctly
- [ ] Error reporting submits successfully
- [ ] User guide opens properly
- [ ] Language preference persists
- [ ] Auto-linking works on startup
- [ ] All analysis tools launch
- [ ] Keyboard shortcuts functional
- [ ] Responsive to different screen sizes
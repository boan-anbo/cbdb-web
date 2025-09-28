# CBDB Access VB Source Code Archive

## Historical Context

This archive contains the complete Visual Basic source code from the Microsoft Access version of the China Biographical Database (CBDB), preserved for historical reference and migration purposes. This source code was extracted during the process of reimplementing the CBDB Access application using modern web technologies.

For the history of the CBDB and its Access application, please see the

- Michael A. Fuller (2025): [History of Design of CBDB](https://projects.iq.harvard.edu/sites/projects.iq.harvard.edu/files/cbdb/files/history_of_design_of_cbdb.pdf) repository.
- [History of CBDB](https://projects.iq.harvard.edu/cbdb/history-of-cbdb) repository.
- Peter K. Bol (2025): [The History of the China Biographical Database](https://projects.iq.harvard.edu/sites/projects.iq.harvard.edu/files/cbdb/files/the_history_of_the_china_biographical_database.pdf) repository.

## Contents

### 1. `cbdb_access_source.pdf`

The original PDF printout of all Visual Basic module files from the CBDB Access application (2025 latest version). This was generated directly from Microsoft Access's built-in code print functionality.

### 2. `cbdb_access_source.txt`

The PDF converted to plain text format (73,990 lines) for processing. Contains all module files with some PDF artifacts (page headers, line numbers).

### 3. `restored/`

The fully restored and organized Visual Basic modules (99 total), extracted from the text file and cleaned of PDF artifacts. Organized by domains:

- **Person & Biographical** - Core person data management
- **Kinship** - Family relationship tracking
- **Addresses** - Location and place management
- **Associations** - Group and organizational connections
- **Offices & Postings** - Official positions and appointments
- **Status** - Person status and role tracking
- **Texts** - Document and text management
- **Events** - Historical event tracking
- **And more...** (see `restored/README.md` for full structure)

### Module Statistics

- **Total Modules**: 99
- **Forms**: 92 (.cls files)
- **Code Modules**: 5 (.bas files)
- **Table Classes**: 2 (.cls files)
- **Total Lines**: ~73,990 lines of VB code

Extracted and prepared by Bo An on 2025-09-19.

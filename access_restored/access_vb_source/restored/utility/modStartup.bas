Option Compare Database
Option Explicit

'Demonstrate how to safely check if a userform is included in a VBA project and create it for the project's use
Public Function CheckUF() As Boolean
    Dim bolRes As Boolean

    'Determine if the userform is included and if not create it.
    On Error Resume Next
    Application.WizHook.Key = 51488399
    With Application.WizHook.DbcVbProject
        bolRes = Len(.VBComponents("ufTreeView").Name)
        If Err.Number Then
             Err.Clear
             bolRes = False
             If vbYes = MsgBox("Userform ufTreeView does not exist in this VBA Project. Create it?" & vbNewLine &
vbNewLine & "Without ufTreeView, the treeview functionality will not be available.", vbYesNo, "Missing UserForm")
 Then
                 With .VBComponents.Add(3) 'vbext_ct_MSForm
                     .Name = "ufTreeView"
                 End With
                 DoCmd.RunCommand acCmdCompileAndSaveAllModules
             End If
             bolRes = Len(.VBComponents("ufTreeView").Name)
             If Err.Number Then
                 bolRes = False
             End If
        End If
    End With
    CheckUF = bolRes
    On Error GoTo 0

End Function

Public Function StartUp() As Boolean
    If CheckUF Then
        DoCmd.OpenForm "frmDemo"
    End If
End Function
Module1 - 1

Option Explicit
Option Compare Text

' Import this code into a new general code module in an empty workbook with a single worksheet and save as .xlsm
'
' Ensure the following object libraries ae linked (Tools > References... option in VBE)
' Microsoft Office 16.0 Object Library
' Microsoft Forms 2.0 Object Library
' Microsoft Visual Basic for Applications Extensibility 5.3
' Microsoft Access 16.0 Object Library
' Microsoft Word 16.0 Object Library
'
' You can create a couple of buttons on the worksheet entitled "Export" and "Dedupe" pointing to macros
' ExportModuleCode() and RemoveDuplicates()
'
' Note that any open Access database or Word documents will be closed after their VBA has been exported
' Any open Excel documents will remain open after their VBA has been exported
'

Private Declare PtrSafe Sub Sleep Lib "kernel32" (ByVal dwMilliseconds As Long)
Private Declare PtrSafe Function Beep Lib "kernel32" (ByVal dwFreq As Long, ByVal dwDuration As Long) As Long

Public Const strSubfolder As String = "CodeStore"
Public strFileName As Variant
Public strFolderPath As String
Public VBProj As VBIDE.VBProject

Dim ws As Worksheet
Dim wkbk As Workbook
Dim iLastRow As Long
Dim iFiles As Integer
Dim iModules As Integer
Dim iTopRow As Long

Dim oWord As Word.Application
Dim oAccess As Access.Application
Dim oVBE As VBE
Dim oMod As VBComponent
Dim oProj As VBProject
Dim obj As VBComponent
Dim oFSO As Object

'=================================================================================+
' Main program code                                                               |
'=================================================================================+

Public Sub ExportModuleCode()

  Dim sFileArray As Variant
  Dim iPtr As Integer
  Dim dtStart As Date
  Dim iLineCount As Long
  Dim iFileFound As String
  Dim iDeleted As Long
  Dim dtTimeLimit As Date
  Dim sFileType As String
  Dim bWasOpen As Boolean

  Set ws = ThisWorkbook.Sheets(1) ' change this if you add extra worksheets

  ChDrive Left(ThisWorkbook.Path, 2)
  ChDir Mid(ThisWorkbook.Path & "\", 3)

  sFileArray = Application.GetOpenFilename( _
       FileFilter:="All Macro-enabled Access/Excel/Word (*.mdb;*.accdb;*.xls;*.xlsm;*.doc;*.docm), *.mdb;*.accdb;
*.xls;*.xlsm;*.doc;*.docm", _
       MultiSelect:=True)
  If Not IsArray(sFileArray) Then Exit Sub

  dtStart = Now()
  iModules = 0
  iFiles = 0
  Application.Cursor = xlWait

  ' set up some column headings
  With ws.Range("A1:E1")
    .Value = Array(vbCr & "Workbook File Name", "Module Name", "Export File Name", "Number" & vbCrLf & "Of Lines"
, "Date/Time")
    .Columns("A").ColumnWidth = 60
    .Columns("B").ColumnWidth = 30
Module1 - 2

    .Columns("C").ColumnWidth = 80
    .Columns("D").ColumnWidth = 12
    .Columns("E").ColumnWidth = 24
    .Font.Bold = True
    .Interior.Pattern = xlSolid
    .Interior.PatternColorIndex = xlAutomatic
    .Interior.ThemeColor = xlThemeColorAccent1
    .Interior.ThemeColor = xlThemeColorAccent1
    .Interior.TintAndShade = 0.799981688894314
    .Borders(xlDiagonalDown).LineStyle = xlNone
    .Borders(xlDiagonalUp).LineStyle = xlNone
    .Borders(xlEdgeLeft).LineStyle = xlContinuous
    .Borders(xlEdgeTop).LineStyle = xlContinuous
    .Borders(xlEdgeBottom).LineStyle = xlContinuous
    .Borders(xlEdgeRight).LineStyle = xlContinuous
    .Borders(xlInsideVertical).LineStyle = xlContinuous
    .Borders(xlInsideHorizontal).LineStyle = xlContinuous
  End With
  ' columns F:G not used here but they're used and cleared in RemoveDuplicates()

  With ActiveWindow
    .SplitColumn = 0
    .SplitRow = 1
    .FreezePanes = True
  End With

  iLastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
  ActiveWindow.ScrollRow = 1
  ActiveWindow.ScrollRow = IIf(iLastRow <= 12, 1, iLastRow - 12) ' sets the number of lines kept in view during p
rocessing

  For Each strFileName In sFileArray
    DoEvents
    ' check file type up front - this simplifies any If...Then...ElseIf...EndIf or Select...Case coding
    If strFileName = ThisWorkbook.FullName Then
      sFileType = "This Excel"
    ElseIf Right(strFileName, 4) = ".xls" Or Right(strFileName, 5) = ".xlsm" Then
      sFileType = "Other Excel"
    ElseIf Right(strFileName, 4) = ".doc" Or Right(strFileName, 5) = ".docm" Then
      sFileType = "Word"
    ElseIf Right(strFileName, 4) = ".mdb" Or Right(strFileName, 6) = ".accdb" Then
      sFileType = "Access"
    End If
    '=================================================================================+
    ' Process this Excel workbook                                                     |
    '=================================================================================+
    If sFileType = "This Excel" Then
      iPtr = InStrRev(strFileName, "\")
      strFolderPath = Left(strFileName, iPtr)
      strFileName = Mid(strFileName, iPtr + 1)
      Set oFSO = CreateObject("Scripting.FileSystemObject")
      If Not oFSO.FolderExists(strFolderPath & strSubfolder) Then
        oFSO.CreateFolder (strFolderPath & strSubfolder)
      End If
      ' delete old export files
      iDeleted = 0
      iFileFound = Dir(strFolderPath & strSubfolder & "\" & strFileName & "_*.bas")
      Do Until iFileFound = ""
        iFileFound = Dir()
        iDeleted = iDeleted + 1
      Loop
      If iDeleted > 0 Then Kill strFolderPath & strSubfolder & "\" & strFileName & "_*.bas"
      Application.ScreenUpdating = True
      Application.EnableEvents = False
      Set wkbk = ThisWorkbook
      Application.EnableEvents = True
      Set VBProj = Application.Workbooks(strFileName).VBProject
      ' export each module type in turn: worksheet/workbook modules, type 100
      iTopRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
      For Each obj In VBProj.VBComponents
        If obj.Type = 100 Then
           Call ExtractCode1(obj.Name)
        End If
        DoEvents
      Next obj
      If iLastRow > iTopRow Then Call SortLastSection
      ' export general code modules, type 1
      iTopRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
      For Each obj In wkbk.VBProject.VBComponents
        If obj.Type = 1 Then
Module1 - 3

           Call ExtractCode1(obj.Name)
        End If
        DoEvents
      Next obj
      If iLastRow > iTopRow Then Call SortLastSection
      If iLastRow > iTopRow Then Call SortLastSection
      ' export userform modules, type 3
      iTopRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
      For Each obj In wkbk.VBProject.VBComponents
        If obj.Type = 3 Then
           Call ExtractCode1(obj.Name)
        End If
        DoEvents
      Next obj
      If iLastRow > iTopRow Then Call SortLastSection
      ' export class modules type 2
      iTopRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
      For Each obj In wkbk.VBProject.VBComponents
        If obj.Type = 2 Then
           Call ExtractCode1(obj.Name)
        End If
        DoEvents
      Next obj
      If iLastRow > iTopRow Then Call SortLastSection
      iFiles = iFiles + 1
    End If
    '=================================================================================+
    ' Process an external Excel workbook                                              |
    '=================================================================================+
    If sFileType = "Other Excel" Then
      iPtr = InStrRev(strFileName, "\")
      strFolderPath = Left(strFileName, iPtr)
      strFileName = Mid(strFileName, iPtr + 1)
      Set oFSO = CreateObject("Scripting.FileSystemObject")
      If Not oFSO.FolderExists(strFolderPath & strSubfolder) Then
        oFSO.CreateFolder (strFolderPath & strSubfolder)
      End If
      ' delete old export files
      iDeleted = 0
      iFileFound = Dir(strFolderPath & strSubfolder & "\" & strFileName & "_*.bas")
      Do Until iFileFound = ""
        iFileFound = Dir()
        iDeleted = iDeleted + 1
      Loop
      If iDeleted > 0 Then Kill strFolderPath & strSubfolder & "\" & strFileName & "_*.bas"
      ' check whether it's open already
      If IsWorkBookOpen(strFileName) Then
        bWasOpen = True
        Set wkbk = Workbooks(strFileName)
      Else
        bWasOpen = False
        Application.EnableEvents = False
        Set wkbk = Workbooks.Open(strFolderPath & "\" & strFileName)
        Application.EnableEvents = True
      End If
      Windows(strFileName).Visible = False
      Set VBProj = Application.Workbooks(strFileName).VBProject
      ' export each module type in turn: worksheet/workbook modules, type 100
      iTopRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
      For Each obj In VBProj.VBComponents
        If obj.Type = 100 Then
           Call ExtractCode1(obj.Name): Debug.Print obj.Name, obj.Type
        End If
        DoEvents
      Next obj
      If iLastRow > iTopRow Then Call SortLastSection
      ' export general code modules, type 1
      iTopRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
      For Each obj In wkbk.VBProject.VBComponents
        If obj.Type = 1 Then
           Call ExtractCode1(obj.Name): Debug.Print obj.Name, obj.Type
        End If
        DoEvents
      Next obj
      If iLastRow > iTopRow Then Call SortLastSection
      ' export userform modules, type 3
      iTopRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
      For Each obj In wkbk.VBProject.VBComponents
        If obj.Type = 3 Then
           Call ExtractCode1(obj.Name): Debug.Print obj.Name, obj.Type
Module1 - 4

        End If
        DoEvents
      Next obj
      If iLastRow > iTopRow Then Call SortLastSection
      ' export class modules type 2
      iTopRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
      For Each obj In wkbk.VBProject.VBComponents
        If obj.Type = 2 Then
           Call ExtractCode1(obj.Name): Debug.Print obj.Name, obj.Type
        End If
        DoEvents
      Next obj
      If iLastRow > iTopRow Then Call SortLastSection
      Windows(strFileName).Visible = True
      If bWasOpen Then
        ' workbook was already open - leave it open
      Else
        ' workbook wasn't already open - close it
        Application.EnableEvents = False
        wkbk.Close SaveChanges:=False
        Application.EnableEvents = True
      End If
      Application.ScreenUpdating = True
      iFiles = iFiles + 1
    End If
    '=================================================================================+
    ' Process Word document                                                           |
    '=================================================================================+
    If sFileType = "Word" Then
      iPtr = InStrRev(strFileName, "\")
      strFolderPath = Left(strFileName, iPtr)
      strFileName = Mid(strFileName, iPtr + 1)
      Set oFSO = CreateObject("Scripting.FileSystemObject")
      If Not oFSO.FolderExists(strFolderPath & strSubfolder) Then
        oFSO.CreateFolder (strFolderPath & strSubfolder)
      End If
      ' delete old export files
      iDeleted = 0
      iFileFound = Dir(strFolderPath & strSubfolder & "\" & strFileName & "_*.bas")
      Do Until iFileFound = ""
        iFileFound = Dir()
        iDeleted = iDeleted + 1
      Loop
      If iDeleted > 0 Then Kill strFolderPath & strSubfolder & "\" & strFileName & "_*.bas"
      Set oWord = CreateObject("Word.Application")
      oWord.Documents.Open (strFolderPath & strFileName)
      Windows(strFileName).Visible = False
      Application.ScreenUpdating = False
      oWord.Visible = False
      Set oVBE = oWord.VBE
      ' export each module type in turn: document modules, type 100
      iTopRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
      For Each oProj In oVBE.VBProjects
        For Each oMod In oProj.VBComponents
           If oMod.Type = 100 Then
             Call ExtractCode2
           End If
           DoEvents
        Next oMod
      Next oProj
      If iLastRow > iTopRow Then Call SortLastSection
      ' export general code modules, type 1
      iTopRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
      For Each oProj In oVBE.VBProjects
        For Each oMod In oProj.VBComponents
           If oMod.Type = 1 Then
             Call ExtractCode2
           End If
           DoEvents
        Next oMod
      Next oProj
      If iLastRow > iTopRow Then Call SortLastSection
      ' export userform modules, type 3
      iTopRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
      For Each oProj In oVBE.VBProjects
        For Each oMod In oProj.VBComponents
           If oMod.Type = 3 Then
             Call ExtractCode2
           End If
           DoEvents
Module1 - 5

        Next oMod
      Next oProj
      If iLastRow > iTopRow Then Call SortLastSection
      ' export class modules type 2
      iTopRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
      For Each oProj In oVBE.VBProjects
        For Each oMod In oProj.VBComponents
           If oMod.Type = 2 Then
             Call ExtractCode2
           End If
           DoEvents
        Next oMod
      Next oProj
      If iLastRow > iTopRow Then Call SortLastSection
      Application.EnableEvents = False
      oWord.Documents.Open (strFolderPath & strFileName)
      Application.EnableEvents = True
      Windows(strFileName).Visible = True
      iFiles = iFiles + 1
      oWord.Quit
      Application.ScreenUpdating = True
      Set oVBE = Nothing
      Set oWord = Nothing
    End If
    '=================================================================================+
    ' Process an Access database                                                      |
    '=================================================================================+
    If sFileType = "Access" Then
      iPtr = InStrRev(strFileName, "\")
      strFolderPath = Left(strFileName, iPtr)
      strFileName = Mid(strFileName, iPtr + 1)
      Set oFSO = CreateObject("Scripting.FileSystemObject")
      If Not oFSO.FolderExists(strFolderPath & strSubfolder) Then
        oFSO.CreateFolder (strFolderPath & strSubfolder)
      End If
      ' delete old export files
      iDeleted = 0
      iFileFound = Dir(strFolderPath & strSubfolder & "\" & strFileName & "_*.bas")
      Do Until iFileFound = ""
        iFileFound = Dir()
        iDeleted = iDeleted + 1
      Loop
      If iDeleted > 0 Then Kill strFolderPath & strSubfolder & "\" & strFileName & "_*.bas"
      Application.ScreenUpdating = False
      Set oAccess = CreateObject("Access.Application")
      Call oAccess.OpenCurrentDatabase(strFolderPath & strFileName)
      Set oVBE = oAccess.VBE
      ' export each module type in turn: database modules, type 100
      iTopRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
      For Each oProj In oVBE.VBProjects
        For Each oMod In oProj.VBComponents
           If oMod.Type = 100 Then
             Call ExtractCode2
           End If
           DoEvents
        Next oMod
      Next oProj
      If iLastRow > iTopRow Then Call SortLastSection
      ' export general code modules, type 1
      iTopRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
      For Each oProj In oVBE.VBProjects
        For Each oMod In oProj.VBComponents
           If oMod.Type = 1 Then
             Call ExtractCode2
           End If
           DoEvents
        Next oMod
      Next oProj
      If iLastRow > iTopRow Then Call SortLastSection
      ' export class modules type 2
      iTopRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
      For Each oProj In oVBE.VBProjects
        For Each oMod In oProj.VBComponents
           If oMod.Type = 2 Then
             Call ExtractCode2
           End If
           DoEvents
        Next oMod
      Next oProj
      If iLastRow > iTopRow Then Call SortLastSection
Module1 - 6

      iFiles = iFiles + 1
      oAccess.Quit
      Application.ScreenUpdating = True
      Set oVBE = Nothing
      Set oAccess = Nothing
    End If
    ActiveWindow.ScrollRow = IIf(iLastRow <= 12, 1, iLastRow - 12)
  Next strFileName

  Application.Cursor = xlDefault
  Beep 1024, 30
  Beep 768, 20
  iLastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
  iLineCount = Application.Sum(Range("D2").Resize(iLastRow, 1))

  MsgBox vbCrLf & "Done: " _
     & Format(iFiles, "#,##0") & " file" & IIf(iFiles = 1, "", "s") & " read, " _
     & Format(iModules, "#,##0") & " module" & IIf(iModules = 1, "", "s") & " written." & Space(10) & vbCrLf & vb
CrLf _
     & Format(iLineCount, "#,##0") & " lines of code in library." & vbCrLf & vbCrLf _
     & "Run time: " & Format(Now() - dtStart, "hh:nn:ss"), vbOKOnly + vbInformation, "Export Module Code v4"

End Sub

'=================================================================================+
' Export VBA code from Excel/Word                                                 |
'=================================================================================+

Private Sub ExtractCode1(ByVal argModuleName As String)

  Dim strExportFile As String
  Dim intFH As Integer
  Dim intLines As Long
  Dim strVBAcode As String

  strExportFile = strFolderPath & strSubfolder & "\" & strFileName & "_" & argModuleName & ".bas"
  intLines = VBProj.VBComponents(argModuleName).CodeModule.CountOfLines
  If intLines > 0 Then
    strVBAcode = VBProj.VBComponents(argModuleName).CodeModule.Lines(1, intLines)
  End If
  ' write a file even if the module was empty as this proves it exists
  Close
  intFH = FreeFile()
  Open strExportFile For Output As intFH
  Print #intFH, "Attribute VB_Name = """ & argModuleName & """"
  Print #intFH, strVBAcode
  Close intFH
  iModules = iModules + 1
  iLastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
  Application.ScreenUpdating = True
  With ws
    .Cells(iLastRow, 1) = strFolderPath & strFileName
    .Cells(iLastRow, 2) = argModuleName & Replace(" (" & RealName(argModuleName) & ")", " ()", "")
    .Cells(iLastRow, 3) = strFolderPath & strSubfolder & "\" & strFileName & "_" & argModuleName & ".bas"
    .Cells(iLastRow, 4) = intLines
    .Cells(iLastRow, 5) = Now()
  End With
  Application.Wait Now() + TimeValue("00:00:01")
  Application.ScreenUpdating = False

End Sub

'=================================================================================+
' Export VBA code from Access                                                     |
'=================================================================================+

Private Sub ExtractCode2()

  Dim strExportFile As String
  Dim intFH As Integer
  Dim intLines As Long
  Dim strVBAcode As String
  Dim strCleanName As String

  Application.ScreenUpdating = True
  strCleanName = Replace(oMod.Name, "/", "")
  strExportFile = strFolderPath & strSubfolder & "\" & strFileName & "_" & strCleanName & ".bas"
  intLines = oMod.CodeModule.CountOfLines
  If intLines > 0 Then
    strVBAcode = oMod.CodeModule.Lines(1, intLines)
Module1 - 7

  End If
  ' write a file even if the module was empty as this proves it exists
  Close
  intFH = FreeFile()
  Open strExportFile For Output As intFH
  Print #intFH, "Attribute VB_Name = """ & oMod.Name & """"
  Print #intFH, strVBAcode
  Close intFH
  iModules = iModules + 1
  iLastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row + 1
  With ws
    .Cells(iLastRow, 1) = strFolderPath & strFileName
    .Cells(iLastRow, 2) = oMod.Name
    .Cells(iLastRow, 3) = strFolderPath & strSubfolder & "\" & strFileName & "_" & oMod.Name & ".bas"
    .Cells(iLastRow, 4) = intLines
    .Cells(iLastRow, 5) = Now()
  End With
  Sleep 100
  Application.ScreenUpdating = True

End Sub

'=================================================================================+
' For each module type within a project, sort the names into alphabetical order |
'=================================================================================+

Private Sub SortLastSection()

  ' for some reason ThisWorkbook modules are exported twice from Word, so delete the earlier one
  If ws.Cells(iTopRow, "C") = ws.Cells(iLastRow, "C") Then
    ws.Rows(iTopRow).EntireRow.Delete
  Else
    With ws.Sort
       .SortFields.Clear
       .SortFields.Add Key:=Range("B" & CStr(iTopRow) & ":B" & CStr(iLastRow)), SortOn:=xlSortOnValues, _
            Order:=xlAscending, DataOption:=xlSortNormal
       .SetRange Range("A" & CStr(iTopRow) & ":E" & CStr(iLastRow))
       .Header = xlNo
       .MatchCase = False
       .Orientation = xlTopToBottom
       .SortMethod = xlPinYin
       .Apply
    End With
  End If

End Sub

Private Function IsWorkBookOpen(ByVal wbName As String) As Boolean

  Dim oWB As Excel.Workbook

  IsWorkBookOpen = False
  For Each oWB In Application.Workbooks
    If oWB.Name = wbName Then
      IsWorkBookOpen = True
      Exit For
    End If
  Next oWB
  Set oWB = Nothing

End Function

Private Function RealName(ByVal rName As String) As String

  Dim wks As Worksheet

  For Each wks In wkbk.Sheets
    If obj.Type = 100 Then
      If LCase(rName) = LCase(wks.codename) Then RealName = wks.Name
    End If
  Next wks

End Function

Public Sub RemoveDuplicates()

  Dim ws As Worksheet
  Dim iLastRow As Long
  Dim iRow As Long
  Dim iDuplicates As Long
Module1 - 8

  Dim iDeleted As Long
  Dim iInterval As Long
  Dim iProgressBarWidth As Long
  Dim iLineCount As Long
  Dim dtStart As Date

  Set ws = ThisWorkbook.Sheets(1) ' change this if you add extra worksheets   dtStart = Now()
  Application.ScreenUpdating = False
  iLastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row

  ' preserve the original row numbers
  Application.Calculation = xlCalculationManual
  ws.Range("G2") = "=ROW()"
  ws.Range("G2").AutoFill Destination:=ws.Range("G2:G" & CStr(iLastRow))
  Application.Calculation = xlCalculationAutomatic
  Application.CalculateFull
  ws.Range("G2:G" & CStr(iLastRow)).Copy
  ws.Range("G2:G" & CStr(iLastRow)).PasteSpecial Paste:=xlPasteValues, Operation:=xlNone, SkipBlanks:=False, Tran
spose:=False

  With ws.Sort ' sort by date exported to put the latest version of each file below any older versions
     With .SortFields
       .Clear
       .Add2 Key:=Range("E1:E" & CStr(iLastRow)), SortOn:=xlSortOnValues, Order:=xlAscending, DataOption:=xlSortNo
rmal
       .Add2 Key:=Range("C1:C" & CStr(iLastRow)), SortOn:=xlSortOnValues, Order:=xlAscending, DataOption:=xlSortNo
rmal
     End With
     .SetRange Range("A1:G" & CStr(iLastRow))
     .Header = xlYes
     .MatchCase = False
     .Orientation = xlTopToBottom
     .SortMethod = xlPinYin
     .Apply
  End With

  Application.Calculation = xlCalculationManual
  ws.Range("F2") = "=COUNTIF(C$2:C$" & CStr(iLastRow) & ",C2)-COUNTIF(C$2:C2,C2)"
  ws.Range("F2").AutoFill Destination:=ws.Range("F2:F" & CStr(iLastRow))
  Application.Calculation = xlCalculationAutomatic
  Application.CalculateFull
  ws.Range("F2:F" & CStr(iLastRow)).Copy
  ws.Range("F2:F" & CStr(iLastRow)).PasteSpecial Paste:=xlPasteValues, Operation:=xlNone, SkipBlanks:=False, Tran
spose:=False

  With ws.Sort ' sort by duplicate indicator where 0 = latest version of file, anything else is an older version
     With .SortFields
       .Clear
       .Add2 Key:=Range("F1:F" & CStr(iLastRow)), SortOn:=xlSortOnValues, Order:=xlAscending, DataOption:=xlSortNo
rmal
     End With
     .SetRange Range("A1:G" & CStr(iLastRow))
     .Header = xlYes
     .MatchCase = False
     .Orientation = xlTopToBottom
     .SortMethod = xlPinYin
     .Apply
  End With

  iDuplicates = Application.WorksheetFunction.CountIf(Range("F2:F" & CStr(iLastRow)), ">0")
  For iRow = iLastRow To 2 Step -1
    DoEvents
    If ws.Cells(iRow, "F") = 0 Then ' no more duplicates
      Exit For
    Else                            ' delete this duplicate
      ws.Rows(iRow).ClearContents
      iDeleted = iDeleted + 1
    End If
  Next iRow

  iLastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
  With ws.Sort ' finally return the deduplicated entries back to their original positions in the worksheet
     With .SortFields
       .Clear
       .Add2 Key:=Range("G1:G" & CStr(iLastRow)), SortOn:=xlSortOnValues, Order:=xlAscending, DataOption:=xlSortNo
rmal
     End With
     .SetRange Range("A1:G" & CStr(iLastRow))
     .Header = xlYes
     .MatchCase = False
Module1 - 9

       .Orientation = xlTopToBottom
       .SortMethod = xlPinYin
       .Apply
     End With

     Application.ScreenUpdating = True
     ws.Columns("F:G").ClearContents
     iLastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
     iLineCount = Application.Sum(Range("D2").Resize(iLastRow - 1, 1))
     ActiveWindow.ScrollRow = IIf(iLastRow <= 12, 1, iLastRow - 12)

     MsgBox vbCrLf & "Worksheet '" & ws.Name & "': " _
           & IIf(iDeleted = 0, "no", Format(iDeleted, "#,##0")) & " duplicate record" & IIf(iDeleted = 1, " ", "s ")
 _
        & IIf(iDeleted = 0, "found", "removed") & "." & Space(10) & vbCrLf & vbCrLf _
        & Space(4) & Format(iLastRow - 1, "#,##0") & " code modules currently in library." & Space(30) & vbCrLf &
 vbCrLf _
        & Space(4) & Format(iLineCount, "#,##0") & " lines of code in library." & vbCrLf & vbCrLf _
        & "Run time: " & Format(Now() - dtStart, "hh:nn:ss") & ".", _
        vbOKOnly + vbInformation, "Export Module Code v4"

End Sub

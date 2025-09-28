Option Compare Database
Option Explicit
Public gPersonIDsaveSourceStr As String

Private Sub CmdInput_Click()
On Error GoTo Err_CmdInput_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "CBDB_Editor"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdInput_Click:
    Exit Sub

Err_CmdInput_Click:
    MsgBox Err.Description
    Resume Exit_CmdInput_Click

End Sub
Private Sub CmdEnterTxt_Click()
On Error GoTo Err_CmdEnterTxt_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "TEXTS EnterForm"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdEnterTxt_Click:
    Exit Sub

Err_CmdEnterTxt_Click:
    MsgBox Err.Description
    Resume Exit_CmdEnterTxt_Click

End Sub
Private Sub CmdEnterEvents_Click()
On Error GoTo Err_CmdEnterEvents_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "EVENT_CODES EnterForm"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdEnterEvents_Click:
    Exit Sub

Err_CmdEnterEvents_Click:
    MsgBox Err.Description
    Resume Exit_CmdEnterEvents_Click

End Sub

Private Sub CmdBrowse_Click()
On Error GoTo Err_CmdBrowse_Click
    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "CBDB_Browser_2"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdBrowse_Click:
    Exit Sub

Err_CmdBrowse_Click:
    MsgBox Err.Description
    Resume Exit_CmdBrowse_Click

End Sub

Private Sub CmdEnterPpl_Click()
On Error GoTo Err_CmdEnterPpl_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "CBDB_Editor"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdEnterPpl_Click:
    Exit Sub

Err_CmdEnterPpl_Click:
    MsgBox Err.Description
    Resume Exit_CmdEnterPpl_Click

End Sub


Private Sub CmdIndexAddr_Click()
    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "FrmIndexAddr"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

End Sub

Private Sub CmdLinkTables_Click()
On Error GoTo Err_CmdLinkTables

    Dim tRstLinkInit As DAO.Recordset
    Dim tStrPath As String, tStrPathBase As String, tStrDataBaseVersion As String, tdf As TableDef, _
        tRstLinkedTable As DAO.Recordset, tCurrentDB As Database, tStrUserType As String, tStrDataFile As String,
 tNameLen As Integer

    ' get the current dataset

    Set tRstLinkInit = CurrentDb.OpenRecordset("LinkListInit", dbOpenDynaset)

    tRstLinkInit.MoveFirst
    tStrDataBaseVersion = tRstLinkInit!c_dataset

    '     Open the form to get the Data file number

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "frmGetDataVersion"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, tStrDataBaseVersion

    If CurrentProject.AllForms("frmGetDataVersion").IsLoaded Then
        Forms!frmGetDataVersion.Form!c_data_version.SetFocus
        tStrDataBaseVersion = Trim(Forms!frmGetDataVersion.Form!c_data_version.Value)

        DoCmd.Close acForm, stDocName
    End If

    If Len(tStrDataBaseVersion) = 8 Then
        'MsgBox "Beginning"
        tStrPath = CurrentProject.FullName

           'MsgBox tStrPath

           If InStr(UCase(tStrPath), "ADMIN") > 0 Then
                tStrUserType = "ADMIN"
                tNameLen = 13
           Else
                tStrUserType = "User"
                tNameLen = 12
           End If

           tStrPathBase = Left(tStrPath, Len(tStrPath) - tNameLen) + "_" + Trim(tStrDataBaseVersion) + "_DATA"

           'MsgBox tStrPathBase

           Set tRstLinkedTable = CurrentDb.OpenRecordset("LinkedTables", dbOpenDynaset)
           'MsgBox "Table opened"

           ' define the database
           Set tCurrentDB = CurrentDb

           With tRstLinkedTable
               .MoveFirst
               Do While Not .EOF
                   'MsgBox "Linking " + !c_table_name + " to " + tStrPathBase + Trim(!c_data_file) + ".mdb"
                   tStrDataFile = Trim(!c_data_file)
                      '
                      ' test if this is an ADMIN (data file = 5 or 6) or User table (data file = 1, 2, or 3)
                      '
                      If InStr("12345", tStrDataFile) > 0 Then
                          Set tdf = tCurrentDB.TableDefs(Trim(!c_table_name))
                          tdf.Connect = "MS Access;DATABASE=" + tStrPathBase + tStrDataFile + ".mdb"
                          tdf.RefreshLink
                      ElseIf tStrDataFile = "6" And tStrUserType = "ADMIN" Then
                          Set tdf = tCurrentDB.TableDefs(Trim(!c_table_name))
                          tdf.Connect = "MS Access;DATABASE=" + tStrPathBase + "1" + ".mdb"
                          tdf.RefreshLink
                      ElseIf tStrDataFile = "7" And tStrUserType = "ADMIN" Then
                          Set tdf = tCurrentDB.TableDefs(Trim(!c_table_name))
                          tdf.Connect = "MS Access;DATABASE=" + tStrPathBase + "2" + ".mdb"
                          tdf.RefreshLink
                      End If
                      'MsgBox "TDF connection set"
                      .MoveNext
               Loop
           End With

           tRstLinkedTable.Close
           Set tRstLinkedTable = Nothing
           Set tCurrentDB = Nothing

           ' reset the link initialization data

           tRstLinkInit.Edit
           tRstLinkInit!c_path = CurrentProject.FullName
           tRstLinkInit!c_dataset = tStrDataBaseVersion
           tRstLinkInit.Update

           Set tdf = Nothing
    Else
        MsgBox "The dataset ID " + tStrDataBaseVersion + " does not have the correct format (YYYYMMDD)."
    End If

    tRstLinkInit.Close
    Set tRstLinkInit = Nothing

Exit_CmdLinkTables:
    Exit Sub

Err_CmdLinkTables:
    MsgBox Err.Description
    Resume Exit_CmdLinkTables

End Sub

Private Sub CmdQueryGroup_Click()
On Error GoTo Err_CmdQueryGroup_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "LookAtGroupData"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdQueryGroup_Click:
    Exit Sub

Err_CmdQueryGroup_Click:
    MsgBox Err.Description
    Resume Exit_CmdQueryGroup_Click

End Sub

Private Sub CmdQueryStatus_Click()
On Error GoTo Err_CmdQueryStatus_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "LookAtStatus"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdQueryStatus_Click:
    Exit Sub

Err_CmdQueryStatus_Click:
    MsgBox Err.Description
    Resume Exit_CmdQueryStatus_Click

End Sub

Private Sub CmdQueryTexts_Click()
On Error GoTo Err_CmdQueryTexts_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "LookAtTexts"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdQueryTexts_Click:
    Exit Sub

Err_CmdQueryTexts_Click:
    MsgBox Err.Description
    Resume Exit_CmdQueryTexts_Click
End Sub


Private Sub Form_Open(Cancel As Integer)
On Error GoTo Err_SetLinkTables

    Dim tRstLinkInit As DAO.Recordset
    Dim tStrPath As String, tStrPathBase As String, tStrDataBaseVersion As String, tdf As New DAO.TableDef, _
        tRstLinkedTable As DAO.Recordset, tContinue As Boolean, tCurrentDB As Database, tStrUserType As String, t
StrDataFile As String, _
        tNameLen As Integer

    Set tRstLinkInit = CurrentDb.OpenRecordset("LinkListInit", dbOpenDynaset)

    tRstLinkInit.MoveFirst

    ' get the current path: if it matches the stored string, there is nothing to do

    If IsNull(tRstLinkInit!c_path) Then
         tContinue = True
    Else
         tStrPath = tRstLinkInit!c_path
         If tStrPath = CurrentProject.FullName Then
             tRstLinkInit.Close
             Set tRstLinkInit = Nothing
             Exit Sub
         End If
    End If

    ' get the current dataset, which should be set at download

    Set tCurrentDB = CurrentDb

    tStrDataBaseVersion = tRstLinkInit!c_dataset

    If IsNull(tStrDataBaseVersion) Or IsNull(tRstLinkInit!c_path) Then
         Call CmdLinkTables_Click
    Else
         If Len(tStrDataBaseVersion) = 8 Then
             tStrPath = CurrentProject.FullName

            Set tRstLinkedTable = CurrentDb.OpenRecordset("LinkedTables", dbOpenDynaset)
            'MsgBox "Table opened"

            If InStr(UCase(tStrPath), "ADMIN") > 0 Then
                 tStrUserType = "ADMIN"
                 tNameLen = 13
            Else
                 tStrUserType = "User"
                 tNameLen = 12
            End If
            'MsgBox "User type = " + tStrUserType

            tStrPathBase = Left(tStrPath, Len(tStrPath) - tNameLen) + "_" + Trim(tStrDataBaseVersion) + "_DATA"

            'MsgBox tStrPathBase

            ' define the database
            Set tCurrentDB = CurrentDb
            'MsgBox "Database defined"

                 With tRstLinkedTable
                     .MoveFirst
                     Do While Not .EOF
                          'MsgBox "Linking " + !c_table_name + " to " + tStrPathBase + Trim(!c_data_file) + ".mdb"
                          tStrDataFile = Trim(!c_data_file)
                          'MsgBox !c_table_name
                          '
                          ' test if this is an ADMIN (data file = 5 or 6) or User table (data file = 1, 2, or 3)
                          '
                          If InStr("123", tStrDataFile) > 0 Then
                              Set tdf = tCurrentDB.TableDefs(Trim(!c_table_name))
                              tdf.Connect = "MS Access;DATABASE=" + tStrPathBase + tStrDataFile + ".mdb"
                              tdf.RefreshLink
                          ElseIf tStrDataFile = "5" And tStrUserType = "ADMIN" Then
                              Set tdf = tCurrentDB.TableDefs(Trim(!c_table_name))
                              tdf.Connect = "MS Access;DATABASE=" + tStrPathBase + "1" + ".mdb"
                              tdf.RefreshLink
                          ElseIf tStrDataFile = "6" And tStrUserType = "ADMIN" Then
                              Set tdf = tCurrentDB.TableDefs(Trim(!c_table_name))
                              tdf.Connect = "MS Access;DATABASE=" + tStrPathBase + "2" + ".mdb"
                              tdf.RefreshLink
                          End If
                          'MsgBox "TDF connection set"
                          .MoveNext
                     Loop
                 End With
                 tRstLinkedTable.Close
                 Set tRstLinkedTable = Nothing

                 ' reset the link path

                 tRstLinkInit.Edit
                 tRstLinkInit!c_path = CurrentProject.FullName
                 tRstLinkInit.Update

                 Set tdf = Nothing
          Else
            Call CmdLinkTables_Click
        End If
    End If

    tRstLinkInit.Close
    Set tRstLinkInit = Nothing
    Set tCurrentDB = Nothing

    ' define the one global variable

    gPersonIDsaveSourceStr = ""

Exit_SetLinkTables:
    Exit Sub

Err_SetLinkTables:
    MsgBox Err.Description
    Resume Exit_SetLinkTables

End Sub

Private Sub CmdLookAtOffice_Click()
On Error GoTo Err_CmdLookAtOffice_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "LookAtOffice"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdLookAtOffice_Click:
    Exit Sub

Err_CmdLookAtOffice_Click:
    MsgBox Err.Description
    Resume Exit_CmdLookAtOffice_Click


End Sub

Private Sub CmdPlace_Click()
On Error GoTo Err_CmdPlace_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "LookAtPlace"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdPlace_Click:
    Exit Sub

Err_CmdPlace_Click:
    MsgBox Err.Description
    Resume Exit_CmdPlace_Click

End Sub

Private Sub CmdQueryAssoc_Click()
On Error GoTo Err_CmdQueryAssoc_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "LookAtAssociations"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdQueryAssoc_Click:
    Exit Sub

Err_CmdQueryAssoc_Click:
    MsgBox Err.Description
    Resume Exit_CmdQueryAssoc_Click


End Sub

Private Sub CmdQueryEntry_Click()
On Error GoTo Err_CmdQueryEntry_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "LookAtEntry"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdQueryEntry_Click:
    Exit Sub

Err_CmdQueryEntry_Click:
    MsgBox Err.Description
    Resume Exit_CmdQueryEntry_Click

End Sub
Private Sub CmdQueryKinship_Click()
On Error GoTo Err_CmdQueryKinship_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "LookAtKinship"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdQueryKinship_Click:
    Exit Sub

Err_CmdQueryKinship_Click:
    MsgBox Err.Description
    Resume Exit_CmdQueryKinship_Click

End Sub
Private Sub CmdQueryNetwork_Click()
On Error GoTo Err_CmdQueryNetwork_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "LookAtNetworks"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdQueryNetwork_Click:
    Exit Sub

Err_CmdQueryNetwork_Click:
    MsgBox Err.Description
    Resume Exit_CmdQueryNetwork_Click

End Sub
Private Sub CmdClose_Click()
On Error GoTo Err_CmdClose_Click


    DoCmd.Close

Exit_CmdClose_Click:
    Exit Sub

Err_CmdClose_Click:
    MsgBox Err.Description
    Resume Exit_CmdClose_Click

End Sub
Private Sub CmdEnterPplAlt_Click()
On Error GoTo Err_CmdEnterPplAlt_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "CBDB_Browser"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdEnterPplAlt_Click:
    Exit Sub

Err_CmdEnterPplAlt_Click:
    MsgBox Err.Description
    Resume Exit_CmdEnterPplAlt_Click

End Sub

Private Sub CmdQueryPairAssoc_Click()
On Error GoTo Err_CmdQueryPairAssoc_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "LookAtAssociationPairs"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdQueryPairAssoc_Click:
    Exit Sub

Err_CmdQueryPairAssoc_Click:
    MsgBox Err.Description
    Resume Exit_CmdQueryPairAssoc_Click


End Sub

Private Sub CmdUsersGuideEng_Click()
On Error GoTo Err_CmdUsersGuideEng_Click

    Dim tStrPDF As String

    tStrPDF = Application.CurrentProject.Path + "\HelpFiles\CBDB Users Guide.pdf"

    'MsgBox tStrPDF

    Application.FollowHyperlink tStrPDF, , True


Exit_CmdUsersGuideEng_Click:
    Exit Sub

Err_CmdUsersGuideEng_Click:
    MsgBox Err.Description
    Resume Exit_CmdUsersGuideEng_Click

End Sub
Private Sub LinkTables()
On Error GoTo Err_LinkTables
    Dim tPath As String, tPathBase As String, tDataBaseVersion As String, tdf As New DAO.TableDef, _
        tRstLinkedTable As DAO.Recordset

    '     Open the form to get the Data file number

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "frmGetDataVersion"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog

    If CurrentProject.AllForms("frmGetDataVersion").IsLoaded Then
        Forms!frmGetDataVersion.Form!c_data_version.SetFocus
        tDataBaseVersion = Forms!frmGetDataVersion.Form!c_data_version.Text

        DoCmd.Close acForm, stDocName
    End If

    tPath = CurrentProject.FullName
    tPathBase = "MS Access;DATABASE=" + Left(tPath, Len(tPath) - 13) + "_" + Trim(tDataBaseVersion) + "_DATA"

    Set tRstLinkedTable = CurrentDb.OpenRecordset("LinkedTables", dbOpenDynaset)

    With tRstLinkedTable
        .MoveFirst
        Do While Not .EOF
             If Trim(!c_base_file) = "6" Then
                  .MoveNext
             Else
                  Set tdf = CurrentDb.TableDefs(!c_table_name)
                  tdf.Connect = tPathBase + Trim(!c_base_file) + ".mdb"
                  tdf.RefreshLink
                  .MoveNext
             End If
        Loop
    End With

    tRstLinkedTable.Close
    Set tRstLinkedTable = Nothing
    Set tdf = Nothing

Exit_LinkTables:
    Exit Sub

Err_LinkTables:
    MsgBox Err.Description
    Resume Exit_LinkTables

End Sub

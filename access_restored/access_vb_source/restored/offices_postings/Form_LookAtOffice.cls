Option Compare Database
Public gRstPeople As DAO.Recordset, gDisplayLanguage As String, gLabelsOK As Boolean, _
        gImportPlacesPeople As Boolean, gImportPlacesOffice As Boolean, gUseOfficeADDRID As Boolean, gUsePeopleAD
DRID As Boolean, gUseOfficeID As Boolean
Public gFromDynasty As Integer, gToDynasty As Integer, gUseIndexYears As Boolean, gUseDynasties As Boolean, _
        gFromDynastyBegin As Integer, gFromDynastyEnd As Integer, gToDynastyBegin As Integer, gToDynastyEnd As Integer


Private Sub CmdAllDynasties_Click()
    gFromDynasty = -2
    gToDynasty = -2
    TxtFromDynasty.Value = ""
    TxtFromDynastyPY.Value = "All"
    TxtToDynasty.Value = ""
    TxtToDynastyPY.Value = "All"

End Sub

Private Sub CmdFromDynasty_Click()
    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strFromDynasty As String

    If gFromDynasty < 0 Then
         strFromDynasty = ""
    Else
         strFromDynasty = Str(gFromDynasty)
    End If

    stDocName = "frmPickDynasty"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strFromDynasty

    If CurrentProject.AllForms("frmPickDynasty").IsLoaded Then

          Forms!frmpickdynasty!frmDYNASTIES.Form!Dy_Code.SetFocus
          gFromDynasty = Forms!frmpickdynasty!frmDYNASTIES.Form!Dy_Code.Value

          Forms!frmpickdynasty!frmDYNASTIES.Form!c_start.SetFocus
          gFromDynastyBegin = Forms!frmpickdynasty!frmDYNASTIES.Form!c_start.Value

        Forms!frmpickdynasty!frmDYNASTIES.Form!c_end.SetFocus
        gFromDynastyEnd = Forms!frmpickdynasty!frmDYNASTIES.Form!c_end.Value
        '
        ' check to see if we have a problem and reject selection
        '
        If gToDynasty > -1 Then
            If gFromDynastyBegin > gToDynastyEnd Then
                MsgBox "Warning: There is a problem with chronology: the 'From' Dynasty begins after the 'To' D
ynasty ends!", vbExclamation
                gFromDynasty = -1
                TxtFromDynasty.Value = ""
                TxtFromDynastyPY.Value = ""
            End If
        End If
        '
        ' value is OK
        '
        If gFromDynasty > -1 Then
            Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty.SetFocus
            TxtFromDynastyPY.Value = Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty.Value

              Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty_chn.SetFocus
              TxtFromDynasty.Value = Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty_chn.Value
          End If

        DoCmd.Close acForm, stDocName
        '
        ' reset ToDynasty if necessary (-2 = all dynasties)
        '
        If gToDynasty = -2 Then
            gToDynasty = -1
            TxtToDynasty.Value = ""
            TxtToDynastyPY.Value = ""
        End If
        '
    End If

End Sub
Private Sub CmdGISPeople_Click()
On Error GoTo Err_CmdGISPeople_Click
    '
    ' If it is a KML file, call the routine and exit
    '
    If ChkPeopleKML.Value Then
         Call writePersonKML
         Exit Sub
    End If
    '
    ' This program will dump the results to a .gis file
    '
    If ZZ_SCRATCH_P_OFFICE.Form.Recordset.RecordCount = 0 Then
         MsgBox "There are no records to save."
         GoTo Exit_CmdGISPeople_Click
    End If
    '
    If FrameGISPeople.Value = 1 Then
         tCodeStr = "GB18030"
    Else
         tCodeStr = "UTF8"
    End If
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant, tC As String
    Dim tRstGIS As DAO.Recordset
    Dim tStr As String
    Dim gStream As ADODB.Stream

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

    dlgSaveAs.InitialFileName = "office_people_gis_" + tCodeStr + ".tab"
    If dlgSaveAs.Show = -1 Then
        '
        tFileName = ""
        For Each tFN In dlgSaveAs.SelectedItems
             tFileName = tFN
             If Not tFileName = "" Then
                 Exit For
             End If
        Next
        If tFileName = "" Then
             MsgBox "Bad file Name."
             GoTo Exit_CmdGISPeople_Click
        Else
             ' make sure the file name has a txt extension
             If Len(tFileName) < 5 Then
                 tFileName = tFileName + ".tab"
             ElseIf Not (LCase(Right(tFileName, 4)) = ".tab") Then
                 tFileName = tFileName + ".tab"
             End If
        End If
        '
        ' write the file
        '
        'SELECT ZZ_SCRATCH_P_OFFICE.c_name AS Name, ZZ_SCRATCH_P_OFFICE.c_name_chn AS NameChn,
        'ZZ_SCRATCH_P_OFFICE.c_sex AS Sex, ZZ_SCRATCH_P_OFFICE.c_index_year AS IndexYear,
        'ZZ_SCRATCH_P_OFFICE.c_addr_id AS AddrID, ZZ_SCRATCH_P_OFFICE.c_addr_name AS AddrName,
        'ZZ_SCRATCH_P_OFFICE.c_addr_chn AS AddrChn, Str(ZZ_SCRATCH_P_OFFICE.x_coord) AS X,
        'Str(ZZ_SCRATCH_P_OFFICE.y_coord) AS Y, ZZ_SCRATCH_P_OFFICE.xy_count AS XYcount
        '
        ' process the table
        '
        'DoCmd.TransferText acExportDelim, , "OFFICE_PEOPLE_GIS_QUERY", tFileName, True

        ' we have a file name: now open the stream for writing
        '
        Set gStream = New ADODB.Stream
        gStream.Mode = adModeReadWrite
        gStream.Type = adTypeText

        tC = Chr(9) ' the tab
        '
        If FrameGISOffice.Value = 1 Then
             gStream.Charset = "GB18030"
        Else
             gStream.Charset = "utf-8"
        End If
        '
        gStream.Open
        '
        ' process the table
        '
        Set tRstGIS = CurrentDb.OpenRecordset("ZZ_SCRATCH_P_OFFICE", dbOpenDynaset)
        '
        ' write the header
        '
        tStr = "Name" + tC + "NameChn" + tC + "IndexYear" + tC + "Sex" + tC + "AddrName" + tC + "AddrChn" + tC +
_
                 "X" + tC + "Y" + tC + "xy_count"
        gStream.WriteText tStr, adWriteLine
        '
        With tRstGIS
            .MoveFirst
            Do While Not .EOF
                 tStr = ""
                 '
                 If IsNull(!c_name) Then
                      tStr = "[Name Missing]"
                 Else
                      tStr = !c_name
                 End If
                 '
                 If IsNull(!c_name_chn) Then
                      tStr = tStr + tC + "[Name Missing]"
                 Else
                      tStr = tStr + tC + !c_name_chn
                 End If
                 '
                 If IsNull(!c_index_year) Then
                      tStr = tStr + tC + "[ ]"
                 Else
                      tStr = tStr + tC + Str(!c_index_year)
                 End If
                 '
                 If IsNull(!c_sex) Then
                      tStr = tStr + tC + "[ ]"
                 Else
                      tStr = tStr + tC + !c_sex
                 End If
                 '
                 If IsNull(!c_addr_name) Then
                      tStr = tStr + tC + "[Addr Name Missing]"
                 Else
                      tStr = tStr + tC + !c_addr_name
                 End If
                 '
                 If IsNull(!c_addr_chn) Then
                      tStr = tStr + tC + "[Addr Chn Missing]"
                 Else
                      tStr = tStr + tC + !c_addr_chn
                 End If
                 '
                 '
                 If IsNull(!x_coord) Then
                      tStr = tStr + tC + "[ ]"
                 Else
                      tStr = tStr + tC + CStr(!x_coord)
                 End If
                 '
                 If IsNull(!y_coord) Then
                      tStr = tStr + tC + "[ ]"
                 Else
                      tStr = tStr + tC + CStr(!y_coord)
                 End If
                 '
                 If IsNull(!xy_count) Then
                      tStr = tStr + tC + "[ ]"
                 Else
                      tStr = tStr + tC + Str(!xy_count)
                 End If
                 '
                 If Not (tStr = "") Then
                      gStream.WriteText tStr, adWriteLine
                 End If
                 .MoveNext
            Loop
           End With
           ' now make sure all the data is copied to tStream
           gStream.Flush
           ' and write the stream to the file
           gStream.SaveToFile tFileName, adSaveCreateOverWrite
           '
           gStream.Close
    Else
        'The user pressed Cancel.
    End If

    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing


Exit_CmdGISPeople_Click:
    Exit Sub

Err_CmdGISPeople_Click:
    MsgBox Err.Description
    Resume Exit_CmdGISPeople_Click

End Sub

Private Sub CmdHelp_Click()
    Dim tStrPDF As String

    tStrPDF = Application.CurrentProject.Path + "\HelpFiles\HelpFile_LookAtOffices.pdf"

    'MsgBox tStrPDF

    Application.FollowHyperlink tStrPDF, , True

End Sub
Private Sub CmdAllOffices_Click()
On Error GoTo Err_CmdAllOffices_Click

           TxtOfficeID.Value = -1

           TxtOfficeChn.Value = ""
           TxtOfficeDesc.Value = ""
           TxtTypeDesc.Value = ""
           TxtTypeChn.Value = ""
           gUseOfficeID = False
           CmdPickOffice.SetFocus
           CmdAllOffices.Enabled = False

           If Not gUseOfficeADDRID And Not gUsePeopleADDRID Then
               CmdQuery.Enabled = False
           End If

Exit_CmdAllOffices_Click:
    Exit Sub

Err_CmdAllOffices_Click:
    MsgBox Err.Description
    Resume Exit_CmdAllOffices_Click

End Sub
Private Sub CmdAllPlacesOffices_Click()
On Error GoTo Err_CmdAllPlacesOffices_Click

           TxtOfficeAddrID.Value = -1

           TxtPlaceOfficeChn.Value = ""
           TxtPlaceOfficePY.Value = ""
           gUseOfficeADDRID = False
           If gUsePeopleADDRID = False Then
               ChkUseXY.Enabled = False
           End If
           ChkSubUnitsOffice.Enabled = False
           CmdPlaceOffice.SetFocus
           CmdAllPlacesOffices.Enabled = False

           If IsNull(TxtOfficeID.Value) Then
               CmdQuery.Enabled = False
           End If

Exit_CmdAllPlacesOffices_Click:
    Exit Sub

Err_CmdAllPlacesOffices_Click:
    MsgBox Err.Description
    Resume Exit_CmdAllPlacesOffices_Click

End Sub
Private Sub CmdAllPlacesPeople_Click()
On Error GoTo Err_CmdAllPlacesPeople_Click

          TxtPersonAddrID.Value = -1

          TxtPlacePeopleChn.Value = ""
          TxtPlacePeoplePY.Value = ""
          gUsePeopleADDRID = False
          If gUseOfficeADDRID = False Then
              ChkUseXY.Enabled = False
          End If
          CmdPlacePeople.SetFocus
          CmdAllPlacesPeople.Enabled = False

          If IsNull(TxtOfficeID.Value) Then
              CmdQuery.Enabled = False
          End If

Exit_CmdAllPlacesPeople_Click:
    Exit Sub

Err_CmdAllPlacesPeople_Click:
    MsgBox Err.Description
    Resume Exit_CmdAllPlacesPeople_Click

End Sub

Private Sub CmdImportOffices_Click()
On Error GoTo Err_CmdImportOffices_Click

    Dim stDocName As String, tRstOffices As DAO.Recordset
    Dim stLinkCriteria As String, tRstImportOffices As DAO.Recordset
    Dim tString As String, tOfficeID As Long, ti As Integer, tStrID As String, tQuit As Boolean
    Dim tLen As Integer, cmdSQL As ADODB.Command

    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tFileSystem, tList

    ' first see if we already have a list

    tQuit = False
    '
    If Not tQuit Then
        ' open the list

          Set dlgSaveAs = Application.FileDialog(msoFileDialogOpen)

          'Use a With...End With block to reference the FileDialog object.
          With dlgSaveAs
              .InitialFileName = ""
              If .Show = -1 Then
                   '
                   tFileName = ""
                   For Each tFN In .SelectedItems
                        tFileName = tFN
                        If Not tFileName = "" Then
                            Exit For
                        End If
                   Next
                   If tFileName = "" Then
                        MsgBox "Bad file Name."
                        GoTo Exit_CmdImportOffices_Click
                   End If
              End If
          End With
          '
          ' Clear the address table now that we are ready to go
          '
          Set cmdSQL = New ADODB.Command
          cmdSQL.ActiveConnection = CurrentProject.Connection
          cmdSQL.CommandType = adCmdText
          '
          cmdSQL.CommandText = "Delete * from ZZ_OFFICE_CODE"
          cmdSQL.Execute tRecDeleted
          '
          cmdSQL.CommandText = "Delete * from InputErrorList"
          cmdSQL.Execute tRecDeleted

          cmdSQL.CommandText = "Delete * from TempImportList"
          cmdSQL.Execute tRecDeleted

          DoCmd.TransferText acImportDelim, "OfficeListImport Specification", "TempImportList", tFileName, 0
          '    TransferType=acImportDelim
          '    SpecificationName = "TempImportList" (apparently it is saved in the database itself)
          '    TableName = "TempImportList" (probably requires that I drop the table first, but I can test)
          '    HasFieldNames = False (0)
          '
          ' copy the bad IDs
          '
          tStrSQL = "INSERT INTO InputErrorList ( c_ID ) SELECT TempImportList.ImportID " + _
              "FROM OFFICE_CODES RIGHT JOIN TempImportList ON OFFICE_CODES.c_office_id = TempImportList.ImportID "
+ _
              "WHERE (((OFFICE_CODES.c_office_id) Is Null))"

          cmdSQL.CommandText = tStrSQL
          cmdSQL.Execute tRecDeleted

          If tRecDeleted > 0 Then
              MsgBox "Some ID were not successfully imported: please look at InputErrorList."
          End If
          '
          ' copy the good IDs
          '
          tStrSQL = "INSERT INTO ZZ_OFFICE_CODE ( c_office_id ) SELECT DISTINCT TempImportList.ImportID " + _
              "FROM OFFICE_CODES INNER JOIN TempImportList ON OFFICE_CODES.c_office_id = TempImportList.ImportID"

          cmdSQL.CommandText = tStrSQL
          cmdSQL.Execute tRecDeleted

          Me.TxtTypeDesc.Value = ""
          Me.TxtTypeChn.Value = ""
          If tRecDeleted > 0 Then
               Me.TxtOfficeDesc.Value = "[Imported List]"
               Me.TxtOfficeChn.Value = "[Imported List]"
               Me.CmdAllOffices.Enabled = True
               Me.CmdQuery.Enabled = True
               Me.CmdSaveOffices.Enabled = True
          Else
               Me.TxtOfficeDesc.Value = ""
               Me.TxtOfficeChn.Value = ""
               Me.CmdAllOffices.Enabled = False
               Me.CmdQuery.Enabled = False
               Me.CmdSaveOffices.Enabled = False
          End If

          Set cmdSQL = Nothing
      End If

Exit_CmdImportOffices_Click:
    Exit Sub

Err_CmdImportOffices_Click:
    MsgBox Err.Description
    Resume Exit_CmdImportOffices_Click

End Sub

Private Sub CmdImportPlaceOffice_Click()
    On Error GoTo Err_CmdImportPlaceOffice_Click

      Dim stDocName As String, tRstAddresses As DAO.Recordset
      Dim stLinkCriteria As String, tRstImportPlaces As DAO.Recordset
      Dim tString As String, tAddrID As Long, ti As Integer, tStrID As String, tQuit As Boolean
      Dim tLen As Integer, cmdSQL As ADODB.Command

      Dim dlgSaveAs As FileDialog
      Dim tFileNum As Integer
      Dim tFileName As String, tFN As Variant
      Dim tFileSystem, tList

      ' first see if we already have a list
    tQuit = False
    '
    If Not tQuit Then
        ' open the list

        Set dlgSaveAs = Application.FileDialog(msoFileDialogOpen)

        'Use a With...End With block to reference the FileDialog object.
        With dlgSaveAs
            .InitialFileName = ""
            If .Show = -1 Then
                 '
                 tFileName = ""
                 For Each tFN In .SelectedItems
                      tFileName = tFN
                      If Not tFileName = "" Then
                          Exit For
                      End If
                 Next
                 If tFileName = "" Then
                      MsgBox "Bad file Name."
                      GoTo Exit_CmdImportPlaceOffice_Click
                 End If
            End If
        End With
        '
        ' Clear the address table now that we are ready to go
        '
        Set cmdSQL = New ADODB.Command
        cmdSQL.ActiveConnection = CurrentProject.Connection
        cmdSQL.CommandType = adCmdText
        '
        cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_ADDR_OFFICE"
        cmdSQL.Execute tRecDeleted
        '
        cmdSQL.CommandText = "Delete * from InputErrorList"
        cmdSQL.Execute tRecDeleted

        cmdSQL.CommandText = "Delete * from TempImportList"
        cmdSQL.Execute tRecDeleted

        DoCmd.TransferText acImportDelim, "ImportPlaceList_Space", "TempImportList", tFileName, 0
        '    TransferType=acImportDelim
        '    SpecificationName = "TempImportList" (apparently it is saved in the database itself)
        '    TableName = "TempImportList" (probably requires that I drop the table first, but I can test)
        '    HasFieldNames = False (0)
        '
        ' copy the bad IDs
        '
        tStrSQL = "INSERT INTO InputErrorList ( c_ID ) SELECT TempImportList.ImportID " + _
            "FROM ADDR_CODES RIGHT JOIN TempImportList ON ADDR_CODES.c_addr_id = TempImportList.ImportID " + _
            "WHERE (((ADDR_CODES.c_addr_id) Is Null))"

        cmdSQL.CommandText = tStrSQL
        cmdSQL.Execute tRecDeleted

        If tRecDeleted > 0 Then
            MsgBox "Some ID were not successfully imported: please look at InputErrorList."
        End If
        '
        ' copy the good IDs
        '
        tStrSQL = "INSERT INTO ZZ_SCRATCH_ADDR_OFFICE ( c_addr_id ) SELECT DISTINCT TempImportList.ImportID " + _
            "FROM ADDR_CODES INNER JOIN TempImportList ON ADDR_CODES.c_addr_id = TempImportList.ImportID"

        cmdSQL.CommandText = tStrSQL
        cmdSQL.Execute tRecDeleted

        If tRecDeleted > 0 Then
            Me.TxtPlaceOfficeChn.Value = "[Imported List]"
            Me.TxtPlaceOfficePY.Value = "[Imported List]"
            gUseOfficeADDRID = True
            ChkUseXY.Enabled = True
            ChkSubUnitsOffice.Enabled = True
        End If

        Set cmdSQL = Nothing
    End If

Exit_CmdImportPlaceOffice_Click:
    Exit Sub

Err_CmdImportPlaceOffice_Click:
    MsgBox Err.Description
    Resume Exit_CmdImportPlaceOffice_Click

End Sub
Private Sub CmdImportPlacePeople_Click()
    On Error GoTo Err_CmdImportPlacePeople_Click

    Dim stDocName As String, tRstAddresses As DAO.Recordset
    Dim stLinkCriteria As String, tRstImportPlaces As DAO.Recordset
    Dim tString As String, tAddrID As Long, ti As Integer, tStrID As String, tQuit As Boolean
    Dim tLen As Integer, cmdSQL As ADODB.Command

    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant

    ' first see if we already have a list

    tQuit = False
    '
    If Not tQuit Then
        ' open the list

        Set dlgSaveAs = Application.FileDialog(msoFileDialogOpen)

        'Use a With...End With block to reference the FileDialog object.
        With dlgSaveAs
            .InitialFileName = ""
            If .Show = -1 Then
                 '
                 tFileName = ""
                 For Each tFN In .SelectedItems
                      tFileName = tFN
                      If Not tFileName = "" Then
                          Exit For
                      End If
                 Next
                 If tFileName = "" Then
                      MsgBox "Bad file Name."
                      GoTo Exit_CmdImportPlacePeople_Click
                 End If
            End If
        End With
        '
        ' Clear the address table now that we are ready to go
        '
        Set cmdSQL = New ADODB.Command
        cmdSQL.ActiveConnection = CurrentProject.Connection
        cmdSQL.CommandType = adCmdText
        '
        cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_ADDR_PEOPLE"
        cmdSQL.Execute tRecDeleted
        '
        cmdSQL.CommandText = "Delete * from InputErrorList"
        cmdSQL.Execute tRecDeleted

        cmdSQL.CommandText = "Delete * from TempImportList"
        cmdSQL.Execute tRecDeleted

        DoCmd.TransferText acImportDelim, "ImportPlaceList_Space", "TempImportList", tFileName, 0
        '    TransferType=acImportDelim
        '    SpecificationName = "TempImportList" (apparently it is saved in the database itself)
        '    TableName = "TempImportList" (probably requires that I drop the table first, but I can test)
        '    HasFieldNames = False (0)
        '
        ' copy the bad IDs
        '
        tStrSQL = "INSERT INTO InputErrorList ( c_ID ) SELECT TempImportList.ImportID " + _
            "FROM ADDR_CODES RIGHT JOIN TempImportList ON ADDR_CODES.c_addr_id = TempImportList.ImportID " + _
            "WHERE (((ADDR_CODES.c_addr_id) Is Null))"

        cmdSQL.CommandText = tStrSQL
        cmdSQL.Execute tRecDeleted

        If tRecDeleted > 0 Then
            MsgBox "Some ID were not successfully imported:   please look at InputErrorList."
        End If
          '
          ' copy the good IDs
          '
          tStrSQL = "INSERT INTO ZZ_SCRATCH_ADDR_PEOPLE ( c_addr_id ) SELECT DISTINCT TempImportList.ImportID " + _
              "FROM ADDR_CODES INNER JOIN TempImportList ON ADDR_CODES.c_addr_id = TempImportList.ImportID"

          cmdSQL.CommandText = tStrSQL
          cmdSQL.Execute tRecDeleted

          If tRecDeleted > 0 Then
              Me.TxtPlacePeopleChn.Value = "[Imported List]"
              Me.TxtPlacePeoplePY.Value = "[Imported List]"
              gUsePeopleADDRID = True
              ChkUseXY.Enabled = True
              ChkSubUnitsPeople.Enabled = True
          End If

        Set cmdSQL = Nothing
    End If

Exit_CmdImportPlacePeople_Click:
    Exit Sub

Err_CmdImportPlacePeople_Click:
    MsgBox Err.Description
    Resume Exit_CmdImportPlacePeople_Click

End Sub

Private Sub CmdNeo4j_Click()
On Error GoTo Err_CmdNeo4j_Click
    '
    ' This program will dump the results of the search to five CSV files
    '
    ' for the moment I'll just describe the format of the CSV file
    ' Note: Neo4j seems to treat all fields as strings, so there is no need to explicitly mark strings
    '
    ' 1. People.CSV
    '      nameID = c_person_id
    '      nameHZ = c_name_chn
    '      namePY = c_name
    '      indexyear = c_index_year
    '      personDynasty = c_dynasty
    '      sex = c_female > (F,M)
    '
    ' 2. Places.CSV
    '      placeID = c_addr_id
    '      placeHZ = c_addr_chn
    '      placePY = c_addr_name
    '      placeX = x_coord
    '      placeY = y_coord
    '
    ' 3. PeoplePlaces.CSV
    '      nameID
    '      placeID
    '      personPlaceRelation
    '
    ' 4. PeoplePlaceCodes
    '
    ' 5. PeopleOffice.CSV
    '      nameID = str(c_person_id)
    '      officeID = str(c_node_id)
    '      officePlaceID
    '      kinID
    '      kinRelID
    '      AssocPersonID
    '      AssocRelID
    '      SocialInstID
    '      SocialInstNameID
    '      EntryYear
    '      EntryDynasty
    '
    ' 6. OfficeCodes.CSV
    '      officeID = str(c_office_id)
    '      officeDesc = c_office_desc
    '
    ' 7. Institution codes
    '
    ' first see if there are any records to process
    '
      If Me.ZZ_SCRATCH_OFFICE.Form.Recordset.RecordCount = 0 Then
          MsgBox "There are no records to save."
          GoTo Exit_CmdNeo4j_Click
      End If
      '
      ' warn the user that a lot of files will be created
      '
      MsgBox "Neo4j requires that from 6 to 7 files be created."
      '
      ' allocate the file variables
      '
      Dim dlgSaveAs As FileDialog
      Dim tFileNum As Integer, tFileName As String, tFN As Variant
      '
      ' next get the People file
      '
      Dim tRstPeople As DAO.Recordset, tRstOfficeCodes As DAO.Recordset, tRstPlace As DAO.Recordset
      Dim tRstPostings As DAO.Recordset, tRstPeoplePlace As DAO.Recordset, tStr As String, tC As String, ti As Inte
ger
      Dim tQueryStr As String
      Dim gStream As ADODB.Stream, tCodeStr As String
      '
      ' the optional recordset
      '
      Dim tRstInstitutions As DAO.Recordset
      '
      'Dim tFileSystem, tGDF

      ' set up the stream to write to

      Set gStream = New ADODB.Stream
      '
      ' for the moment, set the character set to UTF-8

      gStream.Charset = "utf-8"
      tCodeStr = "UTF8"
      'If CodeFrame.Value = 1 Then
      '     gStream.Charset = "utf-8"
      '     tCodeStr = "UTF8"
      'ElseIf CodeFrame.Value = 2 Then
      '     gStream.Charset = "big5"
      '     tCodeStr = "BIG5"
      'ElseIf CodeFrame.Value = 3 Then
      '     gStream.Charset = "gb2312"
      '     tCodeStr = "GB2312"
      'Else
      '     gStream.Charset = "ascii"
      '     tCodeStr = "ascii"
      'End If
      '
      tC = Chr(44) ' the comma
      '
      ' prepare the temp tables for the people, place, peoplePlace and office data

    Dim cmdSQL As ADODB.Command
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    ' start with people
    '
    ' clear ZZ_SCRATCH_PEOPLE and copy the records
    '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, c_dynasty, c_dyna
sty_chn, c_female, c_addr_id, " + _
                    "c_addr_name, c_addr_chn, c_addr_type, c_addr_desc, c_addr_desc_chn, x_coord, y_coord ) " + _
                "SELECT DISTINCT ZZ_SCRATCH_OFFICE.c_personid, ZZZ_BIOG_MAIN.c_name, ZZZ_BIOG_MAIN.c_name_chn, ZZ
Z_BIOG_MAIN.c_index_year, " + _
                    "ZZZ_BIOG_MAIN.c_dynasty, ZZZ_BIOG_MAIN.c_dynasty_chn, ZZZ_BIOG_MAIN.c_female, ZZZ_BIOG_MAIN.
c_index_addr_id, " + _
                    "ZZZ_BIOG_MAIN.c_index_addr_name, ZZZ_BIOG_MAIN.c_index_addr_chn, ZZZ_BIOG_MAIN.c_index_addr_
type_code, ZZZ_BIOG_MAIN.c_index_addr_type_desc, " + _
                    "ZZZ_BIOG_MAIN.c_index_addr_type_chn, ZZZ_BIOG_MAIN.x_coord, ZZZ_BIOG_MAIN.y_coord " + _
                "FROM ZZ_SCRATCH_OFFICE INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_OFFICE.c_personid = ZZZ_BIOG_MAIN.
c_personid"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    Set tRstPostings = CurrentDb.OpenRecordset("ZZ_SCRATCH_OFFICE", dbOpenDynaset)
    Set tRstPeople = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)

    ' Open the People file

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

    dlgSaveAs.InitialFileName = "People_" + tCodeStr + ".csv"
    If dlgSaveAs.Show = -1 Then
        '
        tFileName = ""
        For Each tFN In dlgSaveAs.SelectedItems
             tFileName = tFN
             If Not tFileName = "" Then
                 Exit For
             End If
        Next
        If tFileName = "" Then
             MsgBox "Bad file Name."
             GoTo Exit_CmdNeo4j_Click
        Else
             ' make sure the file name has a txt extension
             If Len(tFileName) < 5 Then
                 tFileName = tFileName + ".csv"
             ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                 tFileName = tFileName + ".csv"
             End If
        End If
        '
        ' now process the file (second true removed to make ASCII)
        '
        ' we have a file name: now open the stream for writing

        gStream.Mode = adModeReadWrite
        gStream.Type = adTypeText
        gStream.Open

        tRstPeople.MoveLast
        '
        ' process the four tables
        '
        ' first the nodes: define the record structure
        '
        ' if the file is strictly ASCII, the label is the pinyin, but if there are characters, then we add a pin
yin field
        If tCodeStr = "ascii" Then
             tStr = "nameID" + tC + "namePY" + tC + "indexyear" + tC + "dynasty" + tC + "sex"
        Else
             tStr = "nameID" + tC + "nameHZ" + tC + "namePY" + tC + "indexyear" + tC + "dynasty" + tC + "sex"
        End If
        gStream.WriteText tStr, adWriteLine
        '
        With tRstPeople
             .MoveFirst
             Do While Not .EOF
                 ' the ID of the person
                 tStr = Trim(Str(!c_person_id)) + tC
                 '
                 ' name
                 '
                 If tCodeStr = "ascii" Then
                      If IsNull(!c_name) Then
                           tStr = tStr + tC
                      Else
                           tStr = tStr + !c_name + tC
                      End If
                 Else
                      If IsNull(!c_name_chn) Then
                           tStr = tStr + "Missing" + tC
                      Else
                           tStr = tStr + !c_name_chn + tC
                      End If

                    If IsNull(!c_name) Then
                         tStr = tStr + "Missing" + tC
                    Else
                         tStr = tStr + !c_name + tC
                    End If
                   End If
                   '
                   ' indexyear = c_index_year INT
                   '
                   If IsNull(!c_index_year) Then
                        tStr = tStr + "-2000" + tC
                   Else
                        tStr = tStr + Trim(Str(!c_index_year)) + tC
                   End If

                   ' dynasty information
                   '
                   If IsNull(!c_dynasty) Then
                        tStr = tStr + "unknown" + tC
                   Else
                        If tCodeStr = "ascii" Then
                             tStr = tStr + !c_dynasty + tC
                        Else
                             tStr = tStr + !c_dynasty_chn + tC
                        End If
                   End If
                   '
                   '    sex = c_female > (F,M)
                   tStr = tStr + IIf(!c_female, "F", "M")
                   '
                   gStream.WriteText tStr, adWriteLine
                   '
                   .MoveNext
               Loop
           End With
           ' now make sure all the data is copied to tStream
           gStream.Flush
           ' and write the stream to the file
           gStream.SaveToFile tFileName, adSaveCreateOverWrite
           '
           gStream.Close
    Else
        'The user pressed Cancel.
        GoTo Exit_CmdNeo4j_Click
    End If
    '
    ' now the PeopleOffice file
    '
    dlgSaveAs.InitialFileName = "PeopleOffice_" + tCodeStr + ".csv"
    If dlgSaveAs.Show = -1 Then
        '
        tFileName = ""
        For Each tFN In dlgSaveAs.SelectedItems
             tFileName = tFN
             If Not tFileName = "" Then
                 Exit For
             End If
        Next
        If tFileName = "" Then
             MsgBox "Bad file Name."
             GoTo Exit_CmdNeo4j_Click
        Else
             ' make sure the file name has a txt extension
             If Len(tFileName) < 5 Then
                 tFileName = tFileName + ".csv"
             ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                 tFileName = tFileName + ".csv"
             End If
        End If
        '
        gStream.Mode = adModeReadWrite
        gStream.Type = adTypeText
        gStream.Open

        tStr = "NameID" + tC + "OfficeCode" + tC + "OfficeAddrID" + tC + "SocialInstID" + tC + "PostingFirstYear"
 + tC + _
                    "PostingLastYear" + tC + "PostingDynasty"
        gStream.WriteText tStr, adWriteLine
        '
        With tRstPostings
            .MoveFirst
            Do While Not .EOF
                ' the ID of the person
                tStr = Trim(Str(!c_personid)) + tC
                '
                   ' office code
                   '
                   If IsNull(!c_office_id) Then
                        tStr = tStr + "0" + tC
                   Else
                        tStr = tStr + Trim(Str(!c_office_id)) + tC
                   End If
                   '
                   ' office addr id
                   '
                   If IsNull(!c_office_addr_id) Then
                        tStr = tStr + "0" + tC
                   Else
                        tStr = tStr + Trim(Str(!c_office_addr_id)) + tC
                   End If
                   '
                   ' social inst ID
                   '
                   If IsNull(!c_inst_code) Then
                        tStr = tStr + "0" + tC
                   Else
                        tStr = tStr + Right("000000" + Trim(Str(!c_inst_code)), 6) + Right("000000" + Trim(Str(!c_ins
t_name_code)), 6) + tC
                   End If
                   '
                   ' posting first year
                   '
                   If IsNull(!c_firstyear) Then
                        tStr = tStr + "0" + tC
                   Else
                        tStr = tStr + Trim(Str(!c_firstyear)) + tC
                   End If
                   '
                   ' posting last year
                   '
                   If IsNull(!c_lastyear) Then
                        tStr = tStr + "0" + tC
                   Else
                        tStr = tStr + Trim(Str(!c_lastyear)) + tC
                   End If
                   '
                   ' posting dynasty
                   '
                   If IsNull(!c_dy) Then
                        tStr = tStr + "0"
                   Else
                        tStr = tStr + Trim(Str(!c_dy))
                   End If
                   '
                   gStream.WriteText tStr, adWriteLine
                   '
                   .MoveNext
              Loop
         End With
         ' now make sure all the data is copied to tStream
         gStream.Flush
         ' and write the stream to the file
         gStream.SaveToFile tFileName, adSaveCreateOverWrite
         '
         gStream.Close
    Else
         'The user pressed Cancel.
         GoTo Exit_CmdNeo4j_Click
    End If
    '
    ' now places
    '
    ' get a file name
    '
    dlgSaveAs.InitialFileName = "Places_" + tCodeStr + ".csv"
    If dlgSaveAs.Show = -1 Then
         '
         tFileName = ""
         For Each tFN In dlgSaveAs.SelectedItems
              tFileName = tFN
              If Not tFileName = "" Then
                   Exit For
              End If
         Next
         If tFileName = "" Then
               MsgBox "Bad file Name."
               GoTo Exit_CmdNeo4j_Click
        Else
            ' make sure the file name has a txt extension
            If Len(tFileName) < 5 Then
                tFileName = tFileName + ".csv"
            ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                tFileName = tFileName + ".csv"
            End If
        End If
        '
        gStream.Open
        '
        ' now process the file
        '
        ' there are three sources of places: the list of people, the posting locations, and the list of institut
ions
        '   since ZZ_SCRATCH_P_TEXT has the required fields, just reuse it before copying to ZZ_ADDRESSES
        '

        cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_P_TEXT"
        cmdSQL.Execute tRecDeleted
        '
        ' get the people IDs
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_addr_id, c_addr_name, c_addr_chn, x_coord, y_coord ) " + _
                    "SELECT DISTINCT ZZ_SCRATCH_PEOPLE.c_addr_id, ZZ_SCRATCH_PEOPLE.c_addr_name, ZZ_SCRATCH_PEOPL
E.c_addr_chn, " + _
                        "ZZ_SCRATCH_PEOPLE.x_coord, ZZ_SCRATCH_PEOPLE.y_coord " + _
                    "FROM ZZ_SCRATCH_PEOPLE"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_addr_id, c_addr_name, c_addr_chn, x_coord, y_coord ) " + _
                    "SELECT DISTINCT ZZ_SCRATCH_OFFICE.c_office_addr_id, ZZ_SCRATCH_OFFICE.c_office_addr_name, ZZ
_SCRATCH_OFFICE.c_office_addr_chn, " + _
                        "ZZ_SCRATCH_OFFICE.office_x_coord, ZZ_SCRATCH_OFFICE.office_y_coord " + _
                    "FROM ZZ_SCRATCH_OFFICE " + _
                    "WHERE (((ZZ_SCRATCH_OFFICE.c_office_addr_id)>0))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_addr_id, c_addr_name, c_addr_chn, x_coord, y_coord ) " + _
                    "SELECT DISTINCT SOCIAL_INSTITUTION_ADDR.c_inst_addr_id, ADDR_CODES.c_name, ADDR_CODES.c_name
_chn, ADDR_CODES.x_coord, ADDR_CODES.y_coord " + _
                    "FROM ADDR_CODES INNER JOIN (ZZ_SCRATCH_OFFICE INNER JOIN SOCIAL_INSTITUTION_ADDR " + _
                        "ON (ZZ_SCRATCH_OFFICE.c_inst_name_code = SOCIAL_INSTITUTION_ADDR.c_inst_name_code) " + _
                        "AND (ZZ_SCRATCH_OFFICE.c_inst_code = SOCIAL_INSTITUTION_ADDR.c_inst_code)) " + _
                        "ON (ADDR_CODES.c_addr_id = SOCIAL_INSTITUTION_ADDR.c_inst_addr_id) AND (ADDR_CODES.c_add
r_id = SOCIAL_INSTITUTION_ADDR.c_inst_addr_id) " + _
                    "WHERE (((ZZ_SCRATCH_OFFICE.c_inst_code)>0))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' now copy the results
        cmdSQL.CommandText = "Delete * from ZZ_ADDRESSES"
        cmdSQL.Execute tRecDeleted
        '
        tQueryStr = "INSERT INTO ZZ_ADDRESSES ( c_addr_id, c_name, c_name_chn, x_coord, y_coord ) " + _
                    "SELECT DISTINCT ZZ_SCRATCH_P_TEXT.c_addr_id, ZZ_SCRATCH_P_TEXT.c_addr_name, ZZ_SCRATCH_P_TEX
T.c_addr_chn, " + _
                        "ZZ_SCRATCH_P_TEXT.x_coord, ZZ_SCRATCH_P_TEXT.y_coord " + _
                    "FROM ZZ_SCRATCH_P_TEXT WHERE (((ZZ_SCRATCH_P_TEXT.c_addr_id)>0))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted

        Set tRstPlace = CurrentDb.OpenRecordset("ZZ_ADDRESSES", dbOpenDynaset)
        '
        If tCodeStr = "ascii" Then
             tStr = "placeID" + tC + "placePY" + tC + "placeX" + tC + "placeY"
        Else
             tStr = "placeID" + tC + "placePY" + tC + "placeHZ" + tC + "placeX" + tC + "placeY"
        End If
        gStream.WriteText tStr, adWriteLine
        With tRstPlace
             .MoveFirst
               Do While Not .EOF
                   ' the ID of the place
                   If Not IsNull(!c_addr_id) Then
                       tStr = Trim(Str(!c_addr_id)) + tC
                       '
                       '   address name

                       If IsNull(!c_name) Then
                            tStr = tStr + "unknown" + tC
                       Else
                            tStr = tStr + !c_name + tC
                       End If
                       '
                       If Not (tCodeStr = "ascii") Then
                            If IsNull(!c_name_chn) Then
                                 tStr = tStr + "unknown" + tC
                            Else
                                 tStr = tStr + !c_name_chn + tC
                            End If
                       End If

                       '    latitude = !y_coord
                       If IsNull(!y_coord) Then
                            tStr = tStr + "0.0" + tC
                       Else
                            tStr = tStr + Str(!y_coord) + tC
                       End If

                       '    longitude = !x_coord
                       If IsNull(!x_coord) Then
                            tStr = tStr + "0.0"
                       Else
                            tStr = tStr + Str(!x_coord)
                       End If
                       '
                       gStream.WriteText tStr, adWriteLine
                   End If
                   .MoveNext
               Loop
           End With
           '
           ' now make sure all the data is copied to tStream
           gStream.Flush
           ' and write the stream to the file
           gStream.SaveToFile tFileName, adSaveCreateOverWrite
           '
           gStream.Close
    Else
        'The user pressed Cancel.
        GoTo Exit_CmdNeo4j_Click
    End If
    '
    ' now peoplePlaces: use ZZ_SCRATCH_PEOPLE
    '
    dlgSaveAs.InitialFileName = "PeoplePlaces_" + tCodeStr + ".csv"
    If dlgSaveAs.Show = -1 Then
        '
        tFileName = ""
        For Each tFN In dlgSaveAs.SelectedItems
             tFileName = tFN
             If Not tFileName = "" Then
                 Exit For
             End If
        Next
        If tFileName = "" Then
             MsgBox "Bad file Name."
             GoTo Exit_CmdNeo4j_Click
        Else
             ' make sure the file name has a txt extension
             If Len(tFileName) < 5 Then
                 tFileName = tFileName + ".csv"
             ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                 tFileName = tFileName + ".csv"
             End If
        End If
        '
        gStream.Open
             '
        tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_PEOPLE.c_person_id, ZZ_SCRATCH_PEOPLE.c_addr_id, ZZ_SCRATCH_PEOPL
E.c_addr_type " + _
                       "FROM ZZ_SCRATCH_PEOPLE WHERE (((ZZ_SCRATCH_PEOPLE.c_addr_id) > 0))"

           Set tRstPeoplePlace = CurrentDb.OpenRecordset(tQueryStr)

           tStr = "nameID" + tC + "placeID" + tC + "personPlaceCode"

           gStream.WriteText tStr, adWriteLine

           With tRstPeoplePlace
               .MoveFirst
               Do While Not .EOF
                    If Not IsNull(!c_addr_id) Then
                        '
                        tStr = Trim(Str(!c_person_id)) + tC
                            '
                        tStr = tStr + Trim(Str(!c_addr_id)) + tC
                        '
                        tStr = tStr + Trim(Str(!c_addr_type))
                        '
                        gStream.WriteText tStr, adWriteLine
                    End If
                    .MoveNext
               Loop
           End With
           '
           ' now make sure all the data is copied to tStream
           gStream.Flush
           ' and write the stream to the file
           gStream.SaveToFile tFileName, adSaveCreateOverWrite
           '
           gStream.Close
    Else
        'The user pressed Cancel.
        GoTo Exit_CmdNeo4j_Click
    End If
    '
    ' now peoplePlaceCode: use ZZ_SCRATCH_PEOPLE
    '
    dlgSaveAs.InitialFileName = "PeoplePlacesCodes_" + tCodeStr + ".csv"
    If dlgSaveAs.Show = -1 Then
        '
        tFileName = ""
        For Each tFN In dlgSaveAs.SelectedItems
             tFileName = tFN
             If Not tFileName = "" Then
                 Exit For
             End If
        Next
        If tFileName = "" Then
             MsgBox "Bad file Name."
             GoTo Exit_CmdNeo4j_Click
        Else
             ' make sure the file name has a txt extension
             If Len(tFileName) < 5 Then
                 tFileName = tFileName + ".csv"
             ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                 tFileName = tFileName + ".csv"
             End If
        End If
        '
        gStream.Open
             '
        tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_PEOPLE.c_addr_type, ZZ_SCRATCH_PEOPLE.c_addr_desc, ZZ_SCRATCH_PEO
PLE.c_addr_desc_chn " + _
                     "FROM ZZ_SCRATCH_PEOPLE WHERE (((ZZ_SCRATCH_PEOPLE.c_addr_type) > 0))"

           Set tRstPeoplePlace = CurrentDb.OpenRecordset(tQueryStr)

           If tCodeStr = "ascii" Then
                tStr = "personPlaceCode" + tC + "personPlaceTrans"
           Else
                tStr = "personPlaceCode" + tC + "personPlaceTrans" + tC + "personPlaceHZ"
           End If

           gStream.WriteText tStr, adWriteLine

           With tRstPeoplePlace
               .MoveFirst
               Do While Not .EOF
                   If Not IsNull(!c_addr_type) Then
                       '
                       tStr = Trim(Str(!c_addr_type)) + tC
                       '
                       tStr = tStr + !c_addr_desc
                       '
                       If Not (tCodeStr = "ascii") Then
                           tStr = tStr + tC + !c_addr_desc_chn
                       End If
                       gStream.WriteText tStr, adWriteLine
                   End If
                   .MoveNext
               Loop
           End With
           '
           ' now make sure all the data is copied to tStream
           gStream.Flush
           ' and write the stream to the file
           gStream.SaveToFile tFileName, adSaveCreateOverWrite
           '
           gStream.Close
    Else
        'The user pressed Cancel.
        GoTo Exit_CmdNeo4j_Click
    End If
    '
    ' finally, get office codes and institution codes, if there are any
    '
    ' now the EntryCode file
    '
    dlgSaveAs.InitialFileName = "OfficeCode_" + tCodeStr + ".csv"
    If dlgSaveAs.Show = -1 Then
        '
        tFileName = ""
        For Each tFN In dlgSaveAs.SelectedItems
             tFileName = tFN
             If Not tFileName = "" Then
                 Exit For
             End If
        Next
        If tFileName = "" Then
             MsgBox "Bad file Name."
             GoTo Exit_CmdNeo4j_Click
        Else
             ' make sure the file name has a txt extension
             If Len(tFileName) < 5 Then
                 tFileName = tFileName + ".csv"
             ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                 tFileName = tFileName + ".csv"
             End If
        End If
        '
        gStream.Mode = adModeReadWrite
        gStream.Type = adTypeText
        gStream.Open

        If tCodeStr = "ascii" Then
             tStr = "OfficeCode" + tC + "OfficeTrans" + tC + "OfficePinyin"
        Else
             tStr = "OfficeCode" + tC + "OfficeTrans" + tC + "OfficePinyin" + tC + "OfficeHZ"
        End If
        gStream.WriteText tStr, adWriteLine
        '
        ' get the codes
        '
        tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_OFFICE.c_office_id, ZZ_SCRATCH_OFFICE.c_office_trans, ZZ_SCRATCH_
OFFICE.c_office_pinyin, ZZ_SCRATCH_OFFICE.c_office_chn " + _
                      "FROM ZZ_SCRATCH_OFFICE"
        Set tRstOfficeCode = CurrentDb.OpenRecordset(tQueryStr)
        With tRstOfficeCode
             .MoveFirst
             Do While Not .EOF
                 '
                 tStr = Trim(Str(!c_office_id)) + tC
                 '
                 ' office trans
                 '
                 If IsNull(!c_office_trans) Then
                      tStr = tStr + "Missing" + tC
                 Else
                      tStr = tStr + Trim(!c_office_trans) + tC
                   End If
                   '
                   ' office pinyin
                   '
                   If IsNull(!c_office_pinyin) Then
                        tStr = tStr + "Missing"
                   Else
                        tStr = tStr + Trim(!c_office_pinyin)
                   End If
                   '
                   ' office HZ
                   '
                   If Not (tCodeStr = "ascii") Then
                        tStr = tStr + tC + Trim(!c_office_chn)
                   End If
                   '
                   gStream.WriteText tStr, adWriteLine
                   '
                   .MoveNext
               Loop
           End With
           ' now make sure all the data is copied to tStream
           gStream.Flush
           ' and write the stream to the file
           gStream.SaveToFile tFileName, adSaveCreateOverWrite
           '
           gStream.Close
    Else
        'The user pressed Cancel.
        GoTo Exit_CmdNeo4j_Click
    End If
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_P_TEXT"
    cmdSQL.Execute tRecDeleted
    '
    ' the final selection is for social institutions
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_P_TEXT"
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) " + _
                "SELECT DISTINCT ZZ_SCRATCH_OFFICE.c_personid " + _
                "FROM ZZ_SCRATCH_OFFICE " + _
                "WHERE (((ZZ_SCRATCH_OFFICE.c_inst_code)>0))"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "SELECT ZZ_SCRATCH_OFFICE.c_inst_code, ZZ_SCRATCH_OFFICE.c_inst_name_code, ZZ_SCRATCH_OFFICE.c_in
st_name_hz, ZZ_SCRATCH_OFFICE.c_inst_name_py " + _
                "FROM ZZ_SCRATCH_OFFICE WHERE (((ZZ_SCRATCH_OFFICE.c_inst_code)>0))"

    If tRecDeleted > 0 Then
        dlgSaveAs.InitialFileName = "InstitutionCodes_" + tCodeStr + ".csv"
        If dlgSaveAs.Show = -1 Then
            '
            tFileName = ""
            For Each tFN In dlgSaveAs.SelectedItems
                 tFileName = tFN
                 If Not tFileName = "" Then
                     Exit For
                 End If
            Next
            If tFileName = "" Then
                 MsgBox "Bad file Name."
                 GoTo Exit_CmdNeo4j_Click
            Else
                 ' make sure the file name has a txt extension
                 If Len(tFileName) < 5 Then
                     tFileName = tFileName + ".csv"
                 ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                     tFileName = tFileName + ".csv"
                 End If
            End If
            '
            gStream.Open
            '
            Set tRstInstitutions = CurrentDb.OpenRecordset(tQueryStr)
            '
            If tCodeStr = "ascii" Then
                      tStr = "InstitutionCode" + tC + "InstitutionNamePY"
               Else
                   tStr = "InstitutionCode" + tC + "InstitutionNamePY" + tC + "InstitutionNameHZ"
               End If
               gStream.WriteText tStr, adWriteLine
               'tGDF.WriteLine (tStr)

             With tRstAssocCodes
                 .MoveFirst
                 Do While Not .EOF
                      If Not IsNull(!c_inst_code) Then
                          tStr = Right("000000" + Trim(Str(!c_inst_code)), 6) + Right("000000" + Trim(Str(!c_inst_n
ame_code)), 6) + tC
                          '
                          If IsNull(!c_inst_name_py) Then
                               tStr = tStr + "NameMissing"
                          Else
                               tStr = tStr + Trim(!c_inst_name_py)
                          End If
                          '
                          If Not (tCodeStr = "ascii") Then
                               If IsNull(!c_inst_name_hz) Then
                                    tStr = tStr + tC + "NameMissing"
                               Else
                                    tStr = tStr + tC + !c_inst_name_hz
                               End If
                          End If
                          gStream.WriteText tStr, adWriteLine
                      End If
                      .MoveNext
                 Loop
             End With
             '
             ' now make sure all the data is copied to tStream
             gStream.Flush
             ' and write the stream to the file
             gStream.SaveToFile tFileName, adSaveCreateOverWrite
             '
             gStream.Close
        Else
             'The user pressed Cancel.
        End If
    End If

    cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_P_TEXT"
    cmdSQL.Execute tRecDeleted
    '
    MsgBox "Finished saving to Neo4j"
    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdNeo4j_Click:
    Exit Sub

Err_CmdNeo4j_Click:
    MsgBox Err.Description
    Resume Exit_CmdNeo4j_Click

End Sub

Private Sub CmdPlaceOffice_Click()
On Error GoTo Err_CmdPlaceOffice_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strADDR As String

    TxtOfficeAddrID.Visible = True
    TxtOfficeAddrID.SetFocus
    strADDR = TxtOfficeAddrID.Text

    stDocName = "frmPickAddresses_multi"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strADDR

    If CurrentProject.AllForms("frmPickAddresses_multi").IsLoaded Then

          '   if the user selected a group of addresses, ZZ_ADDRESSES will have records

          Dim tAddrID As Long, tRstAddr As DAO.Recordset
          Dim strADDR_CHN As String, strADDR_PY As String
        Dim cmdSQL As ADODB.Command

        Set cmdSQL = New ADODB.Command
        cmdSQL.ActiveConnection = CurrentProject.Connection
        cmdSQL.CommandType = adCmdText

        gUseOfficeADDRID = True
        CmdAllPlacesOffices.Enabled = True
        ChkUseXY.Enabled = True
        ChkSubUnitsOffice.Enabled = True

        'MsgBox "Checking zz_addresses"
        ' tRstAddresses.MoveFirst
        Forms!frmPickAddresses_multi.Form!TxtAddrFilter.Visible = True
        Forms!frmPickAddresses_multi.Form!TxtAddrFilter.SetFocus
        If Forms!frmPickAddresses_multi.Form!TxtAddrFilter.Value Then
            '
            TxtOfficeAddrID.Value = 0
            strADDR_PY = Forms!frmPickAddresses_multi.Form!TxtFilterPY
            strADDR_CHN = Forms!frmPickAddresses_multi.Form!TxtFilterChn

               If strADDR_CHN = "" Then
                    TxtPlaceOfficeChn.Value = "[[Filter]]"
                    TxtPlaceOfficePY.Value = "[[" + strADDR_PY + "]]"
               Else
                    TxtPlaceOfficeChn.Value = "[[" + strADDR_CHN + "]]"
                    TxtPlaceOfficePY.Value = "[[Filter]]"
               End If
        Else
            Forms!frmPickAddresses_multi.Form!TxtSelectCount.Visible = True
            Forms!frmPickAddresses_multi.Form!TxtSelectCount.SetFocus
            If Forms!frmPickAddresses_multi.Form!TxtSelectCount.Value > 1 Then
                 TxtPlaceOfficeChn.Value = "[[" + ChrW(22810) + ChrW(36984) + "]]"
                 TxtPlaceOfficePY.Value = "[[Multi-Select]]"
                 TxtOfficeAddrID.Value = 0
            Else
                 ' only one record in ZZ_ADDRESSES: get its field values
                 '
                 Set tRstAddr = CurrentDb.OpenRecordset("ZZ_ADDRESSES", dbOpenDynaset)
                 tRstAddr.MoveFirst
                 'MsgBox "Checking zz_addresses: no records"
                 TxtOfficeAddrID.Value = tRstAddr!c_addr_id
                 TxtPlaceOfficeChn.Value = tRstAddr!c_name_chn
                 TxtPlaceOfficePY.Value = tRstAddr!c_name
                 tRstAddr.Close
                 Set tRstAddr = Nothing
           End If

        End If
        '
        ' now copy the records
        '
        cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_ADDR_OFFICE"
        cmdSQL.Execute tRecDeleted

        cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_ADDR_OFFICE ( c_addr_id ) SELECT DISTINCT " + _
            "ZZ_ADDRESSES.c_addr_id FROM ZZ_ADDRESSES"
        cmdSQL.Execute tRecDeleted
        DoCmd.Close acForm, "frmPickAddresses_multi"

        CmdQuery.Enabled = True
    End If
    CmdPlaceOffice.SetFocus
    TxtOfficeAddrID.Visible = False

Exit_CmdPlaceOffice_Click:
    Exit Sub

Err_CmdPlaceOffice_Click:
    MsgBox Err.Description
    Resume Exit_CmdPlaceOffice_Click

End Sub
Private Sub CmdPlacePeople_Click()
On Error GoTo Err_CmdPlacePeople_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strADDR As String
    TxtPersonAddrID.Visible = True
    TxtPersonAddrID.SetFocus
    strADDR = TxtPersonAddrID.Text

    stDocName = "frmPickAddresses_multi"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strADDR

    If CurrentProject.AllForms("frmPickAddresses_multi").IsLoaded Then

        '   if the user selected a group of addresses, ZZ_ADDRESSES will have records

        Dim tAddrID As Long, tRstAddr As DAO.Recordset
        Dim strADDR_CHN As String, strADDR_PY As String
        Dim cmdSQL As ADODB.Command

        Set cmdSQL = New ADODB.Command
        cmdSQL.ActiveConnection = CurrentProject.Connection
        cmdSQL.CommandType = adCmdText

        gUsePeopleADDRID = True
        CmdAllPlacesPeople.Enabled = True
        ChkUseXY.Enabled = True

        'MsgBox "Checking zz_addresses"
        ' tRstAddresses.MoveFirst
        Forms!frmPickAddresses_multi.Form!TxtAddrFilter.Visible = True
        Forms!frmPickAddresses_multi.Form!TxtAddrFilter.SetFocus
        If Forms!frmPickAddresses_multi.Form!TxtAddrFilter.Value Then
            '
            TxtPersonAddrID.Value = 0
            strADDR_PY = Forms!frmPickAddresses_multi.Form!TxtFilterPY
            strADDR_CHN = Forms!frmPickAddresses_multi.Form!TxtFilterChn

               If strADDR_CHN = "" Then
                    TxtPlacePeopleChn.Value = "[[Filter]]"
                    TxtPlacePeoplePY.Value = "[[" + strADDR_PY + "]]"
               Else
                    TxtPlacePeopleChn.Value = "[[" + strADDR_CHN + "]]"
                    TxtPlacePeoplePY.Value = "[[Filter]]"
               End If
        Else
            Forms!frmPickAddresses_multi.Form!TxtSelectCount.Visible = True
            Forms!frmPickAddresses_multi.Form!TxtSelectCount.SetFocus
            If Forms!frmPickAddresses_multi.Form!TxtSelectCount.Value > 1 Then
                 TxtPlacePeopleChn.Value = "[[" + ChrW(22810) + ChrW(36984) + "]]"
                 TxtPlacePeoplePY.Value = "[[Multi-Select]]"
                 TxtPersonAddrID.Value = 0
            Else
                 ' only one record in ZZ_ADDRESSES: get its field values
                 '
                 Set tRstAddr = CurrentDb.OpenRecordset("ZZ_ADDRESSES", dbOpenDynaset)
                 tRstAddr.MoveFirst
                 'MsgBox "Checking zz_addresses: no records"
                 TxtPersonAddrID.Value = tRstAddr!c_addr_id
                 TxtPlacePeopleChn.Value = tRstAddr!c_name_chn
                 TxtPlacePeoplePY.Value = tRstAddr!c_name
                 tRstAddr.Close
                 Set tRstAddr = Nothing
           End If
        End If
        '
        ' now copy the records
        '
        cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_ADDR_PEOPLE"
        cmdSQL.Execute tRecDeleted

        cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_ADDR_PEOPLE ( c_addr_id ) SELECT DISTINCT " + _
            "ZZ_ADDRESSES.c_addr_id FROM ZZ_ADDRESSES"
        cmdSQL.Execute tRecDeleted
        DoCmd.Close acForm, "frmPickAddresses_multi"

        CmdQuery.Enabled = True
    End If
    CmdPlacePeople.SetFocus
    TxtPersonAddrID.Visible = False

Exit_CmdPlacePeople_Click:
    Exit Sub

Err_CmdPlacePeople_Click:
    MsgBox Err.Description
    Resume Exit_CmdPlacePeople_Click

End Sub
Private Sub CmdPickOffice_Click()
    On Error GoTo Err_CmdPickOffice_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strOffice As String

    TxtOfficeID.Visible = True
    TxtOfficeID.SetFocus
    strOffice = TxtOfficeID.Text

    stDocName = "frmPickOfficeTree_multi_2"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strOffice

    If CurrentProject.AllForms("frmPickOfficeTree_multi_2").IsLoaded Then
        Dim tOfficeID As Long
        Dim strOffice_DESC As String, strOffice_DESC_chn As String, tStrDynasty As String, tStrDynastyChn As Stri
ng, _
            strOfficeType_DESC As String, strOfficeType_DESC_chn As String

        Forms!frmPickOfficeTree_multi_2.Form!TxtOfficeCode.Visible = True
        Forms!frmPickOfficeTree_multi_2.Form!TxtOfficeCode.SetFocus
        tOfficeID = Forms!frmPickOfficeTree_multi_2.Form!TxtOfficeCode.Value
        ' MsgBox "Office code: " + Str(Forms!frmPickOfficeTree_multi_2.Form!TxtOfficeCode.Value)
        Forms!frmPickOfficeTree_multi_2.Form!TxtSearch.SetFocus
        Forms!frmPickOfficeTree_multi_2.Form!TxtOfficeCode.Visible = False
        TxtOfficeID.Value = tOfficeID

        'MsgBox "Office code: " + Str(tOfficeID)

        '   We need to get the office name first to get the dynasty, if needed

        Forms!frmPickOfficeTree_multi_2.Form!TxtOfficeDesc.Visible = True
        Forms!frmPickOfficeTree_multi_2.Form!TxtOfficeDesc.SetFocus

        If IsNull(Forms!frmPickOfficeTree_multi_2.Form!TxtOfficeDesc.Value) Then
             strOffice_DESC = ""
        Else
             strOffice_DESC = Forms!frmPickOfficeTree_multi_2.Form!TxtOfficeDesc.Value
        End If

        Forms!frmPickOfficeTree_multi_2.Form!subTreeView.SetFocus
        Forms!frmPickOfficeTree_multi_2.Form!TxtOfficeDesc.Visible = False

        TxtOfficeDesc.Value = strOffice_DESC
        tStrDynasty = strOffice_DESC

        Forms!frmPickOfficeTree_multi_2.Form!TxtOfficeDescChn.Visible = True
        Forms!frmPickOfficeTree_multi_2.Form!TxtOfficeDescChn.SetFocus
        If IsNull(Forms!frmPickOfficeTree_multi_2.Form!TxtOfficeDescChn.Value) Then
             strOffice_DESC_chn = ""
        Else
             strOffice_DESC_chn = Forms!frmPickOfficeTree_multi_2.Form!TxtOfficeDescChn.Value
        End If
        Forms!frmPickOfficeTree_multi_2.Form!subTreeView.SetFocus
        Forms!frmPickOfficeTree_multi_2.Form!TxtOfficeDescChn.Visible = False
        TxtOfficeChn.Value = strOffice_DESC_chn

        ' now we get the type descriptions, which is the dynasty for Office ID > 0

        Forms!frmPickOfficeTree_multi_2.Form!TxtTypeDesc.Visible = True
        Forms!frmPickOfficeTree_multi_2.Form!TxtTypeDesc.SetFocus
        If IsNull(Forms!frmPickOfficeTree_multi_2.Form!TxtTypeDesc.Value) Then
             strOfficeType_DESC = ""
        Else
             strOfficeType_DESC = Forms!frmPickOfficeTree_multi_2.Form!TxtTypeDesc.Value
        End If
        Forms!frmPickOfficeTree_multi_2.Form!TxtSearch.SetFocus
        Forms!frmPickOfficeTree_multi_2.Form!TxtTypeDesc.Visible = False
        TxtTypeDesc.Value = strOfficeType_DESC

        Forms!frmPickOfficeTree_multi_2.Form!TxtTypeDescChn.Visible = True
        Forms!frmPickOfficeTree_multi_2.Form!TxtTypeDescChn.SetFocus
        If IsNull(Forms!frmPickOfficeTree_multi_2.Form!TxtTypeDescChn.Value) Then
             strOfficeType_DESC_chn = ""
        Else
               strOfficeType_DESC_chn = Forms!frmPickOfficeTree_multi_2.Form!TxtTypeDescChn.Value
           End If
           Forms!frmPickOfficeTree_multi_2.Form!subTreeView.SetFocus
           Forms!frmPickOfficeTree_multi_2.Form!TxtTypeDescChn.Visible = False
           TxtTypeChn.Value = strOfficeType_DESC_chn


           'MsgBox "Office ID = " + Str(tOfficeID)

        If TxtOfficeID.Value < 0 Then
            '
            ' Note: the query will use a join of ZZ_SCRATCH_OFFICE_CODES, the table used by frmPickOfficeTree t
o store office code values
            '           unless the type description is "N/A", which means that no ALL office codes are to be used
            '
            tStrDynasty = strOffice_DESC
            tStrDynastyChn = strOffice_DESC_chn
            If TxtOfficeID.Value = -1 Then
                 If tStrDynasty = "" Then
                      TxtOfficeDesc.Value = "[[All]]"
                      TxtOfficeChn.Value = "[[All]]"
                 Else
                      TxtOfficeDesc.Value = "[[" + tStrDynasty + "]]"
                      TxtOfficeChn.Value = "[[" + tStrDynastyChn + "]]"
                 End If
            Else
                 TxtOfficeDesc.Value = "[[Multi-Select]]"
                 TxtOfficeChn.Value = "[[" + ChrW(22810) + ChrW(36984) + "]]"
            End If

                  If TxtTypeDesc.Value = "" Then
                       If TxtTypeChn = "" Then
                            TxtTypeDesc.Value = "[All]"
                            TxtTypeChn.Value = ""
                       End If
                       If TxtOfficeID.Value = -1 Then
                            gUseOfficeID = False
                       Else
                            gUseOfficeID = True
                       End If
                  Else
                       gUseOfficeID = True
                  End If
                  CmdAllOffices.Enabled = True
           Else
                  tStrDynasty = strOfficeType_DESC
                  tStrDynastyChn = strOfficeType_DESC_chn

               TxtTypeDesc.Value = tStrDynasty
               TxtTypeChn.Value = tStrDynastyChn
               CmdAllOffices.Enabled = True
               gUseOfficeID = True
           End If

           DoCmd.Close acForm, stDocName
           '
           CmdQuery.Enabled = True
           CmdSaveOffices.Enabled = True
    Else
        If IsNull(TxtOfficeID.Value) Then
            CmdQuery.Enabled = False
            CmdAllOffices.Enabled = False
            CmdSaveOffices.Enabled = False
            gUseOfficeID = False
        End If
    End If

    CmdPickOffice.SetFocus
    TxtOfficeID.Visible = False

Exit_CmdPickOffice_Click:
    Exit Sub

Err_CmdPickOffice_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickOffice_Click

End Sub
Private Sub CmdQuery_Click()
    On Error GoTo Err_CmdQuery_Click

    Dim tRstOffice As DAO.Recordset, tRstDummy As DAO.Recordset
    Dim tStrQuery As String, tQueryInsertStr As String
    Dim tQuerySelectStr As String, tRecCount As Long, tUseYears As Boolean, tStrAndYears As String, tStrWhereYear
s As String
    Dim cmdSQL As ADODB.Command

    Set cmdSQL = New ADODB.Command
    '
    ' clear the tables
    '
    Set tRstOffice = ZZ_SCRATCH_OFFICE.Form.Recordset
    Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SO", dbOpenDynaset)
    Set ZZ_SCRATCH_OFFICE.Form.Recordset = tRstDummy
    tRstOffice.Close
    '
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
        '
    cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_OFFICE"
    cmdSQL.Execute tRecDeleted
    '
    ' now the people table
    '
    Set gRstPeople = ZZ_SCRATCH_P_OFFICE.Form.Recordset
    Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SOP", dbOpenDynaset)
    Set ZZ_SCRATCH_P_OFFICE.Form.Recordset = tRstDummy
    gRstPeople.Close
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_P_OFFICE"
    cmdSQL.Execute tRecDeleted
    '
    ' get the index year information
    '
    If gUseIndexYears Then
        If IsNull(Me.TxtFromYear.Value) And IsNull(TxtToYear.Value) Then
             gUseIndexYears = False
        ElseIf IsNull(Me.TxtFromYear.Value) Then
             tStrAndYears = " AND ((ZPAD.c_index_year)<= " + Str(TxtToYear.Value) + "))"
             tStrWhereYears = " Where ((ZPAD.c_index_year)<= " + Str(TxtToYear.Value) + ")"
        ElseIf IsNull(Me.TxtToYear.Value) Then
             tStrAndYears = " AND ((ZPAD.c_index_year)>= " + Str(TxtFromYear.Value) + "))"
             tStrWhereYears = " Where ((ZPAD.c_index_year)>= " + Str(TxtFromYear.Value) + ")"
        Else
             tStrAndYears = " AND ((ZPAD.c_index_year)<= " + Str(TxtToYear.Value) + ") AND ((ZPAD.c_index_year)>=
" + Str(TxtFromYear.Value) + "))"
             tStrWhereYears = " Where ((ZPAD.c_index_year)<= " + Str(TxtToYear.Value) + ") AND ((ZPAD.c_index_year
)>= " + Str(TxtFromYear.Value) + ")"
        End If
    ElseIf gUseDynasties Then
        If gFromDynasty = -2 Then
             tStrAndYears = " AND ((ZPAD.c_person_dy) > 0 )) "
             tStrWhereYears = " Where ((ZPAD.c_person_dy) > 0 ) "
        ElseIf gFromDynasty = -1 And gToDynasty > 0 Then
             tStrAndYears = " AND ((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ")) "
             tStrWhereYears = " WHERE ((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
        ElseIf gFromDynasty > 0 And gToDynasty = -1 Then
             tStrAndYears = " AND ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ")) "
             tStrWhereYears = " WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") "
        ElseIf gFromDynasty = gToDynasty And gFromDynasty > 0 Then
             tStrAndYears = " AND ((ZPAD.c_person_dy) = " + Str(gToDynasty) + " )) "
             tStrWhereYears = " Where ((ZPAD.c_person_dy) = " + Str(gToDynasty) + " ) "
        ElseIf gFromDynasty > 0 And gToDynasty > 0 Then
             tStrAndYears = " AND ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") AND " + _
                 "((DYNASTIES.c_start)<=" + Str(gToDynastyEnd) + ")) "
             tStrWhereYears = " WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") AND " + _
                 "((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
        Else
             tStrAndYears = " AND ((ZPAD.c_person_dy) > 0 )) "
             tStrWhereYears = " Where ((ZPAD.c_person_dy) > 0 ) "
        End If
    ElseIf gUseOfficeYears Then
        If IsNull(Me.TxtOfficeFrom.Value) And IsNull(TxtOfficeTo.Value) Then
             gUseOfficeYears = False
        ElseIf IsNull(Me.TxtOfficeFrom.Value) Then
             tStrAndYears = " AND ((ZPAD.c_lastyear)<= " + Str(TxtOfficeTo.Value) + "))"
             tStrWhereYears = " Where ((ZPAD.c_lastyear)<= " + Str(TxtOfficeTo.Value) + ")"
        ElseIf IsNull(Me.TxtOfficeTo.Value) Then
                tStrAndYears = " AND ((ZPAD.c_firstyear)>= " + Str(TxtOfficeFrom.Value) + "))"
                tStrWhereYears = " Where ((ZPAD.c_firstyear)>= " + Str(TxtOfficeFrom.Value) + ")"
         Else
            tStrAndYears = " AND ((ZPAD.c_lastyear)<= " + Str(TxtOfficeTo.Value) + ") AND ((ZPAD.c_firstyear)>= "
 + Str(TxtOfficeFrom.Value) + "))"
            tStrWhereYears = " Where ((ZPAD.c_lastyear)<= " + Str(TxtOfficeTo.Value) + ") AND ((ZPAD.c_firstyear)
>= " + Str(TxtOfficeFrom.Value) + ")"
        End If

     End If

     'MsgBox "About to process address"
     If gUseOfficeADDRID Then
         '
         ' ZZ_SCRATCH_ADDR_OFFICE has at least one record
         '
         cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_ADDR_LIST"
         cmdSQL.Execute tRecDeleted

         If ChkSubUnitsOffice.Value Then
              cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_ADDR_LIST ( c_addr_id ) " + _
                  "SELECT DISTINCT ZZZ_BELONGS_TO.c_addr_id " + _
                  "FROM ZZ_SCRATCH_ADDR_OFFICE INNER JOIN ZZZ_BELONGS_TO ON " + _
                  "ZZ_SCRATCH_ADDR_OFFICE.c_addr_id = ZZZ_BELONGS_TO.c_belongs_to"
         Else
              cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_ADDR_LIST ( c_addr_id ) SELECT DISTINCT c_addr_id " + _
                  "FROM ZZ_SCRATCH_ADDR_OFFICE"
         End If
         cmdSQL.Execute tRecDeleted

         '
         ' see if we need to use the historical XY search
         '
         If ChkUseXY.Value Then
             '
             ' the strategy here is to dump the IDs to ZZ_ADDRESSES then copy to ZZ_SCRATCH_ADDR_LIST
             ' (I borrow ZZ_ADDRESSES from the Pick Addresses form in order to keep the initial selection
             '   of addresses for the query intact.)
             '
             ' zap the list
             '
             tQueryStr = "DELETE * FROM ZZ_ADDRESSES"
             cmdSQL.CommandText = tQueryStr
             cmdSQL.Execute tRecDeleted
             '
             ' run the query
             '
             tQueryStr = "INSERT INTO ZZ_ADDRESSES ( c_addr_id )SELECT DISTINCT ADDR_CODES.c_addr_id " + _
                 "FROM ADDR_CODES, ZZ_SCRATCH_ADDR_LIST INNER JOIN ADDR_CODES AS ADDR_CODES_1 ON " + _
                 "ZZ_SCRATCH_ADDR_LIST.c_addr_id = ADDR_CODES_1.c_addr_id " + _
                 "WHERE (((ADDR_CODES.x_coord)>=([ADDR_CODES_1].[x_coord]-0.03) And " + _
                 "(ADDR_CODES.x_coord)<=([ADDR_CODES_1].[x_coord]+0.03)) AND " + _
                 "((ADDR_CODES.y_coord)>=([ADDR_CODES_1].[y_coord]-0.03) And " + _
                 "(ADDR_CODES.y_coord)<=([ADDR_CODES_1].[y_coord]+0.03)))"

                cmdSQL.CommandText = tQueryStr
                cmdSQL.Execute tRecDeleted
                '
                ' now get the address IDs from the initial list that have no xy coordinates
                '
                tQueryStr = "INSERT INTO ZZ_ADDRESSES ( c_addr_id ) SELECT ZZ_SCRATCH_ADDR_LIST.c_addr_id " + _
                    "FROM ZZ_SCRATCH_ADDR_LIST INNER JOIN ADDR_CODES ON " + _
                    "ZZ_SCRATCH_ADDR_LIST.c_addr_id = ADDR_CODES.c_addr_id " + _
                    "WHERE (((ADDR_CODES.x_coord) Is Null)) OR (((ADDR_CODES.y_coord) Is Null))"
                cmdSQL.CommandText = tQueryStr
                cmdSQL.Execute tRecDeleted
                '
                ' zap ZZ_SCRATCH_ADDR
                '
                tQueryStr = "DELETE * FROM ZZ_SCRATCH_ADDR_LIST"
                cmdSQL.CommandText = tQueryStr
                cmdSQL.Execute tRecDeleted
                '
                ' copy the list
                '
                tQueryStr = "INSERT INTO ZZ_SCRATCH_ADDR_LIST ( c_addr_id )SELECT DISTINCT ZZ_ADDRESSES.c_addr_id " +
 _
                    "FROM ZZ_ADDRESSES"
                cmdSQL.CommandText = tQueryStr
                cmdSQL.Execute tRecDeleted
               '
               ' zap the temporary list
               '
               tQueryStr = "DELETE * FROM ZZ_ADDRESSES"
               cmdSQL.CommandText = tQueryStr
               cmdSQL.Execute tRecDeleted
               '
           End If
       End If
       'MsgBox "Finished processing address"
       '
       If gUsePeopleADDRID Then
           '
           ' ZZ_SCRATCH_ADDR_OFFICE has at least one record
           '
           cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_ADDR_LIST_PEOPLE"
           cmdSQL.Execute tRecDeleted

            If ChkSubUnitsPeople.Value Then
                 cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_ADDR_LIST_PEOPLE ( c_addr_id ) " + _
                     "SELECT DISTINCT ZZZ_BELONGS_TO.c_addr_id " + _
                     "FROM ZZ_SCRATCH_ADDR_PEOPLE INNER JOIN ZZZ_BELONGS_TO ON " + _
                     "ZZ_SCRATCH_ADDR_PEOPLE.c_addr_id = ZZZ_BELONGS_TO.c_belongs_to"
            Else
                 cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_ADDR_LIST_PEOPLE ( c_addr_id ) SELECT DISTINCT c_addr_id
    " + _
                    "FROM ZZ_SCRATCH_ADDR_PEOPLE"
            End If
            cmdSQL.Execute tRecDeleted

            '
            ' see if we need to use the historical XY search
            '
            If ChkUseXY.Value Then
                '
                ' the strategy here is to dump the IDs to ZZ_ADDRESSES then copy to ZZ_SCRATCH_ADDR_LIST
                ' (I borrow ZZ_ADDRESSES from the Pick Addresses form in order to keep the initial selection
                '   of addresses for the query intact.)
                '
                ' zap the list
                '
                tQueryStr = "DELETE * FROM ZZ_ADDRESSES"
                cmdSQL.CommandText = tQueryStr
                cmdSQL.Execute tRecDeleted
                '
                ' run the query
                '
                tQueryStr = "INSERT INTO ZZ_ADDRESSES ( c_addr_id )SELECT DISTINCT ADDR_CODES.c_addr_id " + _
                    "FROM ADDR_CODES, ZZ_SCRATCH_ADDR_LIST_PEOPLE INNER JOIN ADDR_CODES AS ADDR_CODES_1 ON " + _
                    "ZZ_SCRATCH_ADDR_LIST_PEOPLE.c_addr_id = ADDR_CODES_1.c_addr_id " + _
                    "WHERE (((ADDR_CODES.x_coord)>=([ADDR_CODES_1].[x_coord]-0.03) And " + _
                    "(ADDR_CODES.x_coord)<=([ADDR_CODES_1].[x_coord]+0.03)) AND " + _
                    "((ADDR_CODES.y_coord)>=([ADDR_CODES_1].[y_coord]-0.03) And " + _
                    "(ADDR_CODES.y_coord)<=([ADDR_CODES_1].[y_coord]+0.03)))"

                cmdSQL.CommandText = tQueryStr
                cmdSQL.Execute tRecDeleted
                '
                ' now get the address IDs from the initial list that have no xy coordinates
                '
                tQueryStr = "INSERT INTO ZZ_ADDRESSES ( c_addr_id ) SELECT ZZ_SCRATCH_ADDR_LIST_PEOPLE.c_addr_id " +
_
                    "FROM ZZ_SCRATCH_ADDR_LIST_PEOPLE INNER JOIN ADDR_CODES ON " + _
                    "ZZ_SCRATCH_ADDR_LIST_PEOPLE.c_addr_id = ADDR_CODES.c_addr_id " + _
                    "WHERE (((ADDR_CODES.x_coord) Is Null)) OR (((ADDR_CODES.y_coord) Is Null))"
                cmdSQL.CommandText = tQueryStr
                cmdSQL.Execute tRecDeleted
                '
                ' zap ZZ_SCRATCH_ADDR
                '
                tQueryStr = "DELETE * FROM ZZ_SCRATCH_ADDR_LIST_PEOPLE"
                cmdSQL.CommandText = tQueryStr
                cmdSQL.Execute tRecDeleted
                '
                ' copy the list
                '
                tQueryStr = "INSERT INTO ZZ_SCRATCH_ADDR_LIST_PEOPLE ( c_addr_id )SELECT DISTINCT ZZ_ADDRESSES.c_addr
_id " + _
                    "FROM ZZ_ADDRESSES"
                cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            ' zap the temporary list
            '
            tQueryStr = "DELETE * FROM ZZ_ADDRESSES"
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
        End If
    End If
    'MsgBox "Finished processing address"
    '
    ' Define the query
    '
    tQueryInsertStr = "INSERT INTO ZZ_SCRATCH_OFFICE ( c_person_name, c_person_name_chn, " + _
        "c_index_year, c_female , c_sex, c_person_dy, c_person_dynasty, c_person_dy_chn, c_personid, c_posting_id
, " + _
        "c_office_id, c_office_pinyin, c_office_chn, c_office_trans, c_sequence, c_firstyear, " + _
        "c_fy_nh_code, c_fy_nh_chn, c_fy_nh_py, c_fy_nh_year, c_fy_range, c_fy_range_desc, " + _
        "c_fy_range_chn, c_lastyear, c_ly_nh_code, c_ly_nh_chn, c_ly_nh_py, c_ly_nh_year, " + _
        "c_ly_range, c_ly_range_desc, c_ly_range_chn, c_appt_code, c_appt_desc_chn, " + _
        "c_appt_desc, c_assume_office_code, c_assume_office_desc_chn, " + _
        "c_assume_office_desc, c_inst_code, c_inst_name_code, c_inst_name_hz, c_inst_name_py, " + _
        "c_source, c_title_chn, c_title, c_pages, c_notes, c_fy_intercalary, c_fy_month, " + _
        "c_ly_intercalary, c_ly_month, c_fy_day, c_ly_day, c_fy_day_gz, c_fy_day_gz_chn, " + _
        "c_fy_day_gz_py, c_ly_day_gz, c_ly_day_gz_chn, c_ly_day_gz_py, c_dy, c_dynasty, " + _
        "c_dynasty_chn, c_office_category_id, c_category_desc, c_category_desc_chn, " + _
        "c_addr_id, c_addr_name, c_addr_chn, x_coord, y_coord, c_admin_type, c_office_addr_id, " + _
        "c_office_addr_name, c_office_addr_chn, office_x_coord, office_y_coord, c_addr_type, " + _
        "c_addr_desc, c_addr_desc_chn ) "
    tQuerySelectStr = "SELECT ZPAD.c_person_name, ZPAD.c_person_name_chn, ZPAD.c_index_year, " + _
        "ZPAD.c_female , iif(ZPAD.c_female,'F','M'),ZPAD.c_person_dy, ZPAD.c_person_dynasty, ZPAD.c_person_dy_chn
, ZPAD.c_personid, " + _
        "ZPAD.c_posting_id, ZPAD.c_office_id, ZPAD.c_office_pinyin, ZPAD.c_office_chn, " + _
        "ZPAD.c_office_trans, ZPAD.c_sequence, ZPAD.c_firstyear, ZPAD.c_fy_nh_code, " + _
        "ZPAD.c_fy_nh_chn, ZPAD.c_fy_nh_py, ZPAD.c_fy_nh_year, ZPAD.c_fy_range, " + _
        "ZPAD.c_fy_range_desc, ZPAD.c_fy_range_chn, ZPAD.c_lastyear, ZPAD.c_ly_nh_code, " + _
        "ZPAD.c_ly_nh_chn, ZPAD.c_ly_nh_py, ZPAD.c_ly_nh_year, ZPAD.c_ly_range, " + _
        "ZPAD.c_ly_range_desc, ZPAD.c_ly_range_chn, ZPAD.c_appt_code, " + _
        "ZPAD.c_appt_desc_chn, ZPAD.c_appt_desc, ZPAD.c_assume_office_code, " + _
        "ZPAD.c_assume_office_desc_chn, ZPAD.c_assume_office_desc, ZPAD.c_inst_code, " + _
        "ZPAD.c_inst_name_code, ZPAD.c_inst_name_hz, ZPAD.c_inst_name_py, ZPAD.c_source, " + _
        "ZPAD.c_title_chn, ZPAD.c_title, ZPAD.c_pages, ZPAD.c_notes, ZPAD.c_fy_intercalary, " + _
        "ZPAD.c_fy_month, ZPAD.c_ly_intercalary, ZPAD.c_ly_month, ZPAD.c_fy_day, ZPAD.c_ly_day, " + _
        "ZPAD.c_fy_day_gz, ZPAD.c_fy_day_gz_chn, ZPAD.c_fy_day_gz_py, ZPAD.c_ly_day_gz, " + _
        "ZPAD.c_ly_day_gz_chn , ZPAD.c_ly_day_gz_py, ZPAD.c_dy, ZPAD.c_dynasty, " + _
        "ZPAD.c_dynasty_chn, ZPAD.c_office_category_id, ZPAD.c_category_desc, " + _
        "ZPAD.c_category_desc_chn, ZPAD.c_addr_id, ZPAD.c_addr_name, ZPAD.c_addr_chn, " + _
        "ZPAD.x_coord, ZPAD.y_coord, ZPAD.c_admin_type, ZPAD.c_office_addr_id, " + _
        "ZPAD.c_office_addr_name, ZPAD.c_office_addr_chn, ZPAD.office_x_coord, " + _
        "ZPAD.office_y_coord, ZPAD.c_addr_type, ZPAD.c_addr_desc, ZPAD.c_addr_desc_chn "

    ' to handle addresses, there are 4 possibilities, but because one can run the query with addresses BUT NOT o
ffice selected,
    ' all of this is doubled yet again
    '
    ' There also are two versions of each FROM statement, with/without DYNASTIES

    If Not gUsePeopleADDRID And Not gUseOfficeADDRID Then
        If TxtTypeDesc.Value = "N/A" Then
            If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                 tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                     "FROM DYNASTIES INNER JOIN ZZZ_POSTED_TO_ADDR_DATA AS ZPAD ON DYNASTIES.c_dy = ZPAD.c_person_
dy WHERE (" + _
                     "((ZPAD.c_office_id)= " + Str(TxtOfficeID.Value) + ")"
            Else
                 tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                     "FROM ZZZ_POSTED_TO_ADDR_DATA AS ZPAD WHERE (" + _
                     "((ZPAD.c_office_id)= " + Str(TxtOfficeID.Value) + ")"
                 'MsgBox "Simple query: " + Str(TxtOfficeID.Value)
            End If

               If gUseIndexYears Or gUseDynasties Or gUseOfficeYears Then
                    tStrQuery = tStrQuery + tStrAndYears
               Else
                    tStrQuery = tStrQuery + ")"
               End If
        Else
               If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                   tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                        "FROM (DYNASTIES INNER JOIN ZZZ_POSTED_TO_ADDR_DATA AS ZPAD ON DYNASTIES.c_dy = ZPAD.c_person
_dy) " + _
                            "INNER JOIN ZZ_OFFICE_CODE ON ZPAD.c_office_id = ZZ_OFFICE_CODE.c_office_id"
             Else
                 tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                     "FROM ZZZ_POSTED_TO_ADDR_DATA AS ZPAD INNER JOIN ZZ_OFFICE_CODE ON " + _
                     "ZPAD.c_office_id = ZZ_OFFICE_CODE.c_office_id"
             End If

             If gUseIndexYears Or gUseDynasties Or gUseOfficeYears Then
                 tStrQuery = tStrQuery + tStrWhereYears
             End If
         End If
    ElseIf Not gUsePeopleADDRID And gUseOfficeADDRID Then
         If gUseOfficeID Then
             If TxtTypeDesc.Value = "N/A" Then
                 If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                      tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                          "FROM ZZ_SCRATCH_ADDR_LIST INNER JOIN (DYNASTIES INNER JOIN ZZZ_POSTED_TO_ADDR_DATA AS ZP
AD " + _
                              "ON DYNASTIES.c_dy = ZPAD.c_person_dy) ON ZZ_SCRATCH_ADDR_LIST.c_addr_id = ZPAD.c_off
ice_addr_id " + _
                          "WHERE (((ZPAD.c_office_id)= " + Str(TxtOfficeID.Value) + ")"
                 Else
                      tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                          "FROM ZZZ_POSTED_TO_ADDR_DATA AS ZPAD INNER JOIN ZZ_SCRATCH_ADDR_LIST ON ZPAD.c_office_ad
dr_id = ZZ_SCRATCH_ADDR_LIST.c_addr_id " + _
                          "WHERE (((ZPAD.c_office_id)= " + Str(TxtOfficeID.Value) + ")"
                 End If

                    If gUseIndexYears Or gUseDynasties Or gUseOfficeYears Then
                         tStrQuery = tStrQuery + tStrAndYears
                    Else
                         tStrQuery = tStrQuery + ")"
                    End If
             Else
                If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                     tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                         "FROM ZZ_SCRATCH_ADDR_LIST INNER JOIN ((DYNASTIES INNER JOIN ZZZ_POSTED_TO_ADDR_DATA AS Z
PAD ON DYNASTIES.c_dy = ZPAD.c_person_dy) " + _
                             "INNER JOIN ZZ_OFFICE_CODE ON ZPAD.c_office_id = ZZ_OFFICE_CODE.c_office_id) " + _
                             "ON ZZ_SCRATCH_ADDR_LIST.c_addr_id = ZPAD.c_office_addr_id"
                Else
                     tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                         "FROM (ZZZ_POSTED_TO_ADDR_DATA AS ZPAD INNER JOIN ZZ_SCRATCH_ADDR_LIST ON ZPAD.c_office_a
ddr_id = ZZ_SCRATCH_ADDR_LIST.c_addr_id) " + _
                         "INNER JOIN ZZ_OFFICE_CODE ON ZPAD.c_office_id = ZZ_OFFICE_CODE.c_office_id"
                End If

                 If gUseIndexYears Or gUseDynasties Or gUseOfficeYears Then
                     tStrQuery = tStrQuery + tStrWhereYears
                 End If
             End If
        Else             ' If we are NOT using Office IDs, then it does not matter whether TxtTypeDesc is "N/A" or
 not
             If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                 tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                     "FROM ZZ_SCRATCH_ADDR_LIST INNER JOIN (DYNASTIES INNER JOIN ZZZ_POSTED_TO_ADDR_DATA AS ZPAD "
 + _
                                "ON DYNASTIES.c_dy = ZPAD.c_person_dy) ON ZZ_SCRATCH_ADDR_LIST.c_addr_id = ZPAD.c_off
ice_addr_id "
            Else
                tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                    "FROM ZZZ_POSTED_TO_ADDR_DATA AS ZPAD INNER JOIN ZZ_SCRATCH_ADDR_LIST ON ZPAD.c_office_addr_i
d = ZZ_SCRATCH_ADDR_LIST.c_addr_id "
            End If

            If gUseIndexYears Or gUseDynasties Or gUseOfficeYears Then
                tStrQuery = tStrQuery + tStrWhereYears
            'Else
            '     tStrQuery = tStrQuery + ")"
            End If
        End If
    ElseIf gUsePeopleADDRID And Not gUseOfficeADDRID Then
        If gUseOfficeID Then
            If TxtTypeDesc.Value = "N/A" Then
                If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                     tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                         "FROM ZZ_SCRATCH_ADDR_LIST_PEOPLE INNER JOIN (DYNASTIES INNER JOIN ZZZ_POSTED_TO_ADDR_DAT
A AS ZPAD " + _
                                  "ON DYNASTIES.c_dy = ZPAD.c_person_dy) ON ZZ_SCRATCH_ADDR_LIST_PEOPLE.c_addr_id = ZPA
D.c_addr_id " + _
                              "WHERE (((ZPAD.c_office_id)= " + Str(TxtOfficeID.Value) + ")"
                      Else
                    tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                        "FROM ZZZ_POSTED_TO_ADDR_DATA AS ZPAD INNER JOIN ZZ_SCRATCH_ADDR_LIST_PEOPLE ON ZPAD.c_ad
dr_id = ZZ_SCRATCH_ADDR_LIST_PEOPLE.c_addr_id " + _
                        "WHERE (((ZPAD.c_office_id)= " + Str(TxtOfficeID.Value) + ")"
                End If

                      If gUseIndexYears Or gUseDynasties Or gUseOfficeYears Then
                           tStrQuery = tStrQuery + tStrAndYears
                      Else
                           tStrQuery = tStrQuery + ")"
                      End If
               Else
                If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                     tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                         "FROM ZZ_SCRATCH_ADDR_LIST_PEOPLE INNER JOIN ((DYNASTIES INNER JOIN ZZZ_POSTED_TO_ADDR_DA
TA AS ZPAD ON DYNASTIES.c_dy = ZPAD.c_person_dy) " + _
                             "INNER JOIN ZZ_OFFICE_CODE ON ZPAD.c_office_id = ZZ_OFFICE_CODE.c_office_id) " + _
                             "ON ZZ_SCRATCH_ADDR_LIST_PEOPLE.c_addr_id = ZPAD.c_addr_id"
                Else
                     tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                         "FROM (ZZZ_POSTED_TO_ADDR_DATA AS ZPAD INNER JOIN ZZ_SCRATCH_ADDR_LIST_PEOPLE ON ZPAD.c_a
ddr_id = ZZ_SCRATCH_ADDR_LIST_PEOPLE.c_addr_id) " + _
                         "INNER JOIN ZZ_OFFICE_CODE ON ZPAD.c_office_id = ZZ_OFFICE_CODE.c_office_id"
                End If

                   If gUseIndexYears Or gUseDynasties Or gUseOfficeYears Then
                       tStrQuery = tStrQuery + tStrWhereYears
                   End If
               End If
        Else
               If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                   tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                       "FROM ZZ_SCRATCH_ADDR_LIST_PEOPLE INNER JOIN (DYNASTIES INNER JOIN ZZZ_POSTED_TO_ADDR_DATA AS
 ZPAD " + _
                                  "ON DYNASTIES.c_dy = ZPAD.c_person_dy) ON ZZ_SCRATCH_ADDR_LIST_PEOPLE.c_addr_id = ZPA
D.c_addr_id "
            Else
                tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                    "FROM ZZZ_POSTED_TO_ADDR_DATA AS ZPAD INNER JOIN ZZ_SCRATCH_ADDR_LIST_PEOPLE ON ZPAD.c_addr_i
d = ZZ_SCRATCH_ADDR_LIST_PEOPLE.c_addr_id "
            End If

               If gUseIndexYears Or gUseDynasties Or gUseOfficeYears Then
                   tStrQuery = tStrQuery + tStrWhereYears
               'Else
               '     tStrQuery = tStrQuery + ")"
               End If

             'MsgBox Right(tStrQuery, 250)
         End If
    Else                      ' Using both People and Office Addresses
         If gUseOfficeID Then
             If TxtTypeDesc.Value = "N/A" Then
                 If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                      tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                          "FROM (ZZ_SCRATCH_ADDR_LIST INNER JOIN (DYNASTIES INNER JOIN ZZZ_POSTED_TO_ADDR_DATA AS Z
PAD " + _
                              "ON DYNASTIES.c_dy = ZPAD.c_person_dy) ON ZZ_SCRATCH_ADDR_LIST.c_addr_id = ZPAD.c_off
ice_addr_id) " + _
                              "INNER JOIN ZZ_SCRATCH_ADDR_LIST_PEOPLE ON ZPAD.c_addr_id = ZZ_SCRATCH_ADDR_LIST_PEOP
LE.c_addr_id " + _
                          "WHERE (((ZPAD.c_office_id) = " + Str(TxtOfficeID.Value) + ")"
                 Else
                      tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                          "FROM (ZZZ_POSTED_TO_ADDR_DATA AS ZPAD INNER JOIN ZZ_SCRATCH_ADDR_LIST ON ZPAD.c_office_a
ddr_id = ZZ_SCRATCH_ADDR_LIST.c_addr_id) " + _
                          "INNER JOIN ZZ_SCRATCH_ADDR_LIST_PEOPLE ON ZPAD.c_addr_id = ZZ_SCRATCH_ADDR_LIST_PEOPLE.c
_addr_id " + _
                          "WHERE (((ZPAD.c_office_id) = " + Str(TxtOfficeID.Value) + ")"
                 End If

                      If gUseIndexYears Or gUseDynasties Or gUseOfficeYears Then
                           tStrQuery = tStrQuery + tStrAndYears
                      Else
                           tStrQuery = tStrQuery + ")"
                      End If
               Else
                      If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                          tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                              "FROM ((ZZ_SCRATCH_ADDR_LIST INNER JOIN (DYNASTIES INNER JOIN ZZZ_POSTED_TO_ADDR_DATA AS
ZPAD ON " + _
                              "DYNASTIES.c_dy = ZPAD.c_person_dy) ON ZZ_SCRATCH_ADDR_LIST.c_addr_id = ZPAD.c_office_add
r_id) " + _
                              "INNER JOIN ZZ_SCRATCH_ADDR_LIST_PEOPLE ON ZPAD.c_addr_id = ZZ_SCRATCH_ADDR_LIST_PEOPLE.c
_addr_id) " + _
                              "INNER JOIN ZZ_OFFICE_CODE ON ZPAD.c_office_id = ZZ_OFFICE_CODE.c_office_id"
                      Else
                    tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                        "FROM ((ZZZ_POSTED_TO_ADDR_DATA AS ZPAD INNER JOIN ZZ_SCRATCH_ADDR_LIST ON ZPAD.c_office_
addr_id = ZZ_SCRATCH_ADDR_LIST.c_addr_id) " + _
                        "INNER JOIN ZZ_OFFICE_CODE ON ZPAD.c_office_id = ZZ_OFFICE_CODE.c_office_id) INNER JOIN Z
Z_SCRATCH_ADDR_LIST_PEOPLE ON " + _
                        "ZPAD.c_addr_id = ZZ_SCRATCH_ADDR_LIST_PEOPLE.c_addr_id"
                End If

                   If gUseIndexYears Or gUseDynasties Or gUseOfficeYears Then
                       tStrQuery = tStrQuery + tStrWhereYears
                   End If
               End If
        Else
            If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                 tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                     "FROM (ZZ_SCRATCH_ADDR_LIST INNER JOIN (DYNASTIES INNER JOIN ZZZ_POSTED_TO_ADDR_DATA AS ZPAD
ON DYNASTIES.c_dy = ZPAD.c_person_dy) " + _
                     "ON ZZ_SCRATCH_ADDR_LIST.c_addr_id = ZPAD.c_office_addr_id) INNER JOIN ZZ_SCRATCH_ADDR_LIST_P
EOPLE " + _
                     "ON ZPAD.c_addr_id = ZZ_SCRATCH_ADDR_LIST_PEOPLE.c_addr_id"
            Else
                 tStrQuery = tQueryInsertStr + tQuerySelectStr + _
                     "FROM (ZZZ_POSTED_TO_ADDR_DATA AS ZPAD INNER JOIN ZZ_SCRATCH_ADDR_LIST ON ZPAD.c_office_addr_
id = ZZ_SCRATCH_ADDR_LIST.c_addr_id) " + _
                     "INNER JOIN ZZ_SCRATCH_ADDR_LIST_PEOPLE ON ZPAD.c_addr_id = ZZ_SCRATCH_ADDR_LIST_PEOPLE.c_add
r_id"
            End If

            If gUseIndexYears Or gUseDynasties Or gUseOfficeYears Then
                tStrQuery = tStrQuery + tStrWhereYears
            End If
        End If
    End If

    cmdSQL.CommandText = tStrQuery
    cmdSQL.Execute tRecCount
    '
    ' Next, a simple query to add the index year description data
    '
    cmdSQL.CommandText = "UPDATE ZZZ_BIOG_MAIN INNER JOIN ZZ_SCRATCH_OFFICE ON ZZZ_BIOG_MAIN.c_personid = ZZ_SCRA
TCH_OFFICE.c_personid " + _
        "SET ZZ_SCRATCH_OFFICE.c_index_year_type_code = [ZZZ_BIOG_MAIN].[c_index_year_type_code], " + _
            "ZZ_SCRATCH_OFFICE.c_index_year_type_desc = [ZZZ_BIOG_MAIN].[c_index_year_type_desc], " + _
            "ZZ_SCRATCH_OFFICE.c_index_year_type_hz = [ZZZ_BIOG_MAIN].[c_index_year_type_hz]"
    cmdSQL.Execute tRecDeleted
    '
    ' Now the People
    '
    tStrQuery = "INSERT INTO ZZ_SCRATCH_P_OFFICE ( c_personid, c_name, c_name_chn, c_index_year, " + _
        "c_index_year_type_code, c_index_year_type_desc, c_index_year_type_hz, " + _
        "c_female, c_sex, c_dy, c_dynasty, c_dynasty_chn, c_addr_id, c_addr_name, c_addr_chn, c_addr_type, " + _
        "c_addr_desc, c_addr_desc_chn, x_coord, y_coord ) " + _
        "SELECT DISTINCT ZZ_SCRATCH_OFFICE.c_personid, ZZ_SCRATCH_OFFICE.c_person_name AS c_name, " + _
        "ZZ_SCRATCH_OFFICE.c_person_name_chn AS c_name_chn, ZZ_SCRATCH_OFFICE.c_index_year, " + _
        "ZZ_SCRATCH_OFFICE.c_index_year_type_code, ZZ_SCRATCH_OFFICE.c_index_year_type_desc, ZZ_SCRATCH_OFFICE.c_
index_year_type_hz, " + _
        "ZZ_SCRATCH_OFFICE.c_female, ZZ_SCRATCH_OFFICE.c_sex, ZZ_SCRATCH_OFFICE.c_person_dy AS c_dy, ZZ_SCRATCH_O
FFICE.c_person_dynasty AS c_dynasty, " + _
        "ZZ_SCRATCH_OFFICE.c_person_dy_chn AS c_dynasty_chn, ZZ_SCRATCH_OFFICE.c_addr_id, " + _
        "ZZ_SCRATCH_OFFICE.c_addr_name, ZZ_SCRATCH_OFFICE.c_addr_chn, ZZ_SCRATCH_OFFICE.c_addr_type, " + _
        "ZZ_SCRATCH_OFFICE.c_addr_desc, ZZ_SCRATCH_OFFICE.c_addr_desc_chn, ZZ_SCRATCH_OFFICE.x_coord, " + _
        "ZZ_SCRATCH_OFFICE.y_coord " + _
        "FROM ZZ_SCRATCH_OFFICE"
    '
    cmdSQL.CommandText = tStrQuery
    cmdSQL.Execute tRecDeleted
    '
    ' the final step is to calculate the xy_count for people and for offices
    '
    If tRecCount = 0 Then
         CmdGIS.Enabled = False
         CmdGISPeople.Enabled = False
         CmdStoreID.Enabled = False
         CmdNeo4j.Enabled = False
    Else
         CmdStoreID.Enabled = True
         CmdNeo4j.Enabled = True
         '
         ' first the people xy
         '
         ' use three SQL calls
         '
         cmdSQL.CommandText = "DELETE * FROM tmpXY"
         cmdSQL.Execute tRecDeleted
         '
         tStrQuery = "INSERT INTO tmpXY ( x_coord, y_coord, CountOfx_coord, CountOfy_coord ) " + _
             "SELECT ZZ_SCRATCH_P_OFFICE.x_coord, ZZ_SCRATCH_P_OFFICE.y_coord, Count(ZZ_SCRATCH_P_OFFICE.x_coord)
" + _
             "AS CountOfx_coord, Count(ZZ_SCRATCH_P_OFFICE.y_coord) AS CountOfy_coord " + _
             "FROM ZZ_SCRATCH_P_OFFICE " + _
             "GROUP BY ZZ_SCRATCH_P_OFFICE.x_coord, ZZ_SCRATCH_P_OFFICE.y_coord;"

        '
        cmdSQL.CommandText = tStrQuery
        cmdSQL.Execute tRecDeleted
        '
        tStrQuery = "UPDATE tmpXY INNER JOIN ZZ_SCRATCH_P_OFFICE ON (tmpXY.y_coord = " + _
            "ZZ_SCRATCH_P_OFFICE.y_coord) AND (tmpXY.x_coord = ZZ_SCRATCH_P_OFFICE.x_coord) SET " + _
            "ZZ_SCRATCH_P_OFFICE.xy_count = [tmpXY].[CountOfx_coord];"

        cmdSQL.CommandText = tStrQuery
        cmdSQL.Execute tRecDeleted
        '
        ' then the offices
        '
        cmdSQL.CommandText = "DELETE * FROM tmpXY"
        cmdSQL.Execute tRecDeleted
        '
        tStrQuery = "INSERT INTO tmpXY ( x_coord, y_coord, CountOfx_coord, CountOfy_coord ) " + _
             "SELECT ZZ_SCRATCH_OFFICE.office_x_coord, ZZ_SCRATCH_OFFICE.office_y_coord, " + _
             "Count(ZZ_SCRATCH_OFFICE.office_x_coord) AS CountOfx_coord, " + _
             "Count(ZZ_SCRATCH_OFFICE.office_y_coord) AS CountOfy_coord " + _
             "FROM ZZ_SCRATCH_OFFICE " + _
             "GROUP BY ZZ_SCRATCH_OFFICE.office_x_coord, ZZ_SCRATCH_OFFICE.office_y_coord"
        '
        cmdSQL.CommandText = tStrQuery
        cmdSQL.Execute tRecDeleted
        '
        If tRecDeleted > 0 Then
             CmdGISPeople.Enabled = True
        Else
             CmdGISPeople.Enabled = False
        End If
        '
        tStrQuery = "UPDATE tmpXY INNER JOIN ZZ_SCRATCH_OFFICE ON (tmpXY.y_coord = " + _
             "ZZ_SCRATCH_OFFICE.office_y_coord) AND (tmpXY.x_coord = ZZ_SCRATCH_OFFICE.office_x_coord) " + _
             "SET ZZ_SCRATCH_OFFICE.office_xy_count = [tmpXY].[CountOfx_coord];"

        cmdSQL.CommandText = tStrQuery
        cmdSQL.Execute tRecDeleted
        '
        If tRecDeleted > 0 Then
             CmdGIS.Enabled = True
        Else
             CmdGIS.Enabled = False
        End If

    End If

    Set tRstOffice = CurrentDb.OpenRecordset("ZZ_SCRATCH_OFFICE", dbOpenDynaset)
    Set ZZ_SCRATCH_OFFICE.Form.Recordset = tRstOffice
    '
    Set gRstPeople = CurrentDb.OpenRecordset("ZZ_SCRATCH_P_OFFICE", dbOpenDynaset)
    Set ZZ_SCRATCH_P_OFFICE.Form.Recordset = gRstPeople

Exit_CmdQuery_Click:
    '
    ' close everything
    '
    Set tRstDummy = Nothing
    Set cmdSQL = Nothing

    Exit Sub

Err_CmdQuery_Click:
    MsgBox Err.Description
    Resume Exit_CmdQuery_Click

End Sub
Private Sub calculate_xy_count()
    Dim tX As Double, tY As Double, tXY As Integer
    Dim tBM As Variant, tWrite As Integer
    '
    ' the strategy is to first throw a bookmark at the first new value
    ' then count the number, then go back to the bookmark and update each record
    '
    With gRstPeople
        .Index = "xy"
        .MoveFirst

        tX = -1#
        tY = -1#
        tXY = 0
        tWrite = 0
        tBM = .Bookmark

        Do While Not .EOF
             If tX <> !x_coord Or tY <> !y_coord Then
                 If tWrite = 1 Then
                      ' go back to the first record with the value
                      .Bookmark = tBM
                      Do While tX = !x_coord And tY = !y_coord
                           .Edit
                           !xy_count = tXY
                           .Update
                           .MoveNext
                      Loop
                 Else
                      tWrite = 1
                 End If
                 ' reset
                 tXY = 0
                 tBM = .Bookmark
                 tX = !x_coord
                 tY = !y_coord
             End If
             ' increment the count and move to the next
             tXY = tXY + 1
             .MoveNext
        Loop
        '
        ' the last xy value still needs to be written
        '
        .Bookmark = tBM
        Do While Not .EOF
             .Edit
             !xy_count = tXY
             .Update
             .MoveNext
        Loop
        .Index = "index_year"
    End With
End Sub
Private Sub calculate_office_xy_count()
    Dim tX As Double, tY As Double, tXY As Integer
    Dim tBM As Variant, tWrite As Integer, tRstOffice As DAO.Recordset
    '
    ' the strategy is to first throw a bookmark at the first new value
    ' then count the number, then go back to the bookmark and update each record
    '
    '
    ' in order to do this, I need to open the table as a table
    '
    Set tRstOffice = CurrentDb.OpenRecordset("ZZ_SCRATCH_OFFICE", dbOpenTable)
    '
    With tRstOffice
        .Index = "xy"
        .MoveFirst
        tX = -1#
        tY = -1#
        tXY = 0
        tWrite = 0
        tBM = .Bookmark

         Do While Not .EOF
              If tX <> !office_x_coord Or tY <> !office_y_coord Then
                  If tWrite = 1 Then
                       ' go back to the first record with the value
                       .Bookmark = tBM
                       Do While tX = !office_x_coord And tY = !office_y_coord
                            .Edit
                            !office_xy_count = tXY
                            .Update
                            .MoveNext
                       Loop
                  Else
                       tWrite = 1
                  End If
                  ' reset
                  tXY = 0
                  tBM = .Bookmark
                  tX = !office_x_coord
                  tY = !office_y_coord
              End If
              ' increment the count and move to the next
              tXY = tXY + 1
              .MoveNext
         Loop
         '
         ' the last xy value still needs to be written
         '
         .Bookmark = tBM
         Do While Not .EOF
              .Edit
              !office_xy_count = tXY
              .Update
              .MoveNext
         Loop
         .Index = "IndexYear"
    End With
End Sub
Private Sub CmdGIS_Click()
On Error GoTo Err_CmdGIS_Click
    Dim gStream As ADODB.Stream, tCodeStr As String
    '
    ' If it is a KML file, call the routine and exit
    '
    If ChkOfficeKML.Value Then
         Call writeOfficeKML
         Exit Sub
    End If
    '
    ' the optional recordset
    '
    Dim tRstGIS As DAO.Recordset
    '
    If FrameGISOffice.Value = 1 Then
         tCodeStr = "GB18030"
    Else
         tCodeStr = "UTF8"
    End If
    '
    tC = Chr(9) ' the tab
    '
    ' This program will dump the results to a .gis file
    '
    If ZZ_SCRATCH_OFFICE.Form.Recordset.RecordCount = 0 Then
         MsgBox "There are no records to save."
         GoTo Exit_CmdGIS_Click
    End If
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant, tFemale As String
    Dim tRstNode As DAO.Recordset
    Dim tStr As String, tTab As String, ti As Integer
    Dim tFileSystem, tGDF

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

    dlgSaveAs.InitialFileName = "office_gis_" + tCodeStr + ".tab"
    If dlgSaveAs.Show = -1 Then
        '
        tFileName = ""
        For Each tFN In dlgSaveAs.SelectedItems
             tFileName = tFN
             If Not tFileName = "" Then
                 Exit For
             End If
        Next
        If tFileName = "" Then
             MsgBox "Bad file Name."
             GoTo Exit_CmdGIS_Click
        Else
             ' make sure the file name has a txt extension
             If Len(tFileName) < 5 Then
                 tFileName = tFileName + ".tab"
             ElseIf Not (LCase(Right(tFileName, 4)) = ".tab") Then
                 tFileName = tFileName + ".tab"
             End If
        End If

        ' we have a file name: now open the stream for writing
        '
        'MsgBox "creating stream"

        Set gStream = New ADODB.Stream
        gStream.Mode = adModeReadWrite
        gStream.Type = adTypeText

        If FrameGISOffice.Value = 1 Then
             gStream.Charset = "GB18030"
        Else
             gStream.Charset = "utf-8"
        End If
        '
        gStream.Open
        '
        ' write the file
        '
        'SELECT ZZ_SCRATCH_OFFICE.c_name AS Name, ZZ_SCRATCH_OFFICE.c_name_chn AS NameChn,
        'ZZ_SCRATCH_OFFICE.c_index_year AS IndexYear, ZZ_SCRATCH_OFFICE.c_sex AS Sex,
        'ZZ_SCRATCH_OFFICE.c_addr_name AS AddrName, ZZ_SCRATCH_OFFICE.c_addr_chn AS AddrChn,
        'Str(ZZ_SCRATCH_OFFICE.x_coord) AS PersonX, Str(ZZ_SCRATCH_OFFICE.y_coord) AS PersonY,
        'ZZ_SCRATCH_OFFICE.c_office_trans AS Office, ZZ_SCRATCH_OFFICE.c_office_chn AS OfficeChn,
        'ZZ_SCRATCH_OFFICE.c_firstyear AS FirstYear, ZZ_SCRATCH_OFFICE.c_lastyear AS LastYear,
        'ZZ_SCRATCH_OFFICE.c_dy_desc AS Dynasty,
        'ZZ_SCRATCH_OFFICE.c_office_addr_name AS OfficeAddr,
        'ZZ_SCRATCH_OFFICE.c_office_addr_chn AS OfficeAddrChn,
        'Str(ZZ_SCRATCH_OFFICE.office_x_coord) AS X, Str(ZZ_SCRATCH_OFFICE.office_y_coord) AS Y,
        'ZZ_SCRATCH_OFFICE.office_xy_count AS XY_count
        '
        ' process the table
        '
        'DoCmd.TransferText acExportDelim, , "OFFICE_GIS_QUERY", tFileName, True
        Set tRstGIS = CurrentDb.OpenRecordset("ZZ_SCRATCH_OFFICE", dbOpenDynaset)
        '
        ' write the header
        '
        tStr = "Name" + tC + "NameChn" + tC + "IndexYear" + tC + "Sex" + tC + _
                 "AddrName" + tC + "AddrChn" + tC + "PersonX" + tC + "PersonY" + tC + _
                 "Office" + tC + "OfficeChn" + tC + "FirstYear" + tC + "LastYear" + tC + _
                 "Dynasty" + tC + "OfficeAddr" + tC + "OfficeAddrChn" + tC + "X" + tC + "Y" + tC + "xy_count"
        gStream.WriteText tStr, adWriteLine
        '
        'MsgBox "Beginning to process query"

        With tRstGIS
            .MoveFirst
            Do While Not .EOF
                tStr = ""
                '
                If !office_x_coord > 0 Then
                     'MsgBox "Name"

                    If IsNull(!c_person_name) Then
                           tStr = "[Name Missing]"
                    Else
                        tStr = !c_person_name
                    End If
                    '
                    'MsgBox "NameChn"

                    If IsNull(!c_person_name_chn) Then
                         tStr = tStr + tC + "[Name Missing]"
                    Else
                         tStr = tStr + tC + !c_person_name_chn
                    End If
                    '
                    '
                    'MsgBox "IndexYear"

                    If IsNull(!c_index_year) Then
                         tStr = tStr + tC + "[ ]"
                    Else
                         tStr = tStr + tC + Str(!c_index_year)
                    End If
                    '
                    '
                    'MsgBox "Sex"

                    If IsNull(!c_sex) Then
                         tStr = tStr + tC + "[ ]"
                    Else
                         tStr = tStr + tC + !c_sex
                    End If
                    '
                    '
                    'MsgBox "AddrName"

                    If IsNull(!c_addr_name) Then
                         tStr = tStr + tC + "[Addr Name Missing]"
                    Else
                         tStr = tStr + tC + !c_addr_name
                    End If
                    '
                    'MsgBox "AddrChn"

                    If IsNull(!c_addr_chn) Then
                         tStr = tStr + tC + "[Addr Chn Missing]"
                    Else
                         tStr = tStr + tC + !c_addr_chn
                    End If
                    '
                    'MsgBox "PersonX"

                    If IsNull(!x_coord) Then
                         tStr = tStr + tC + "[ ]"
                    Else
                         tStr = tStr + tC + CStr(!x_coord)
                    End If
                    '
                    'MsgBox "PersonY"

                    If IsNull(!y_coord) Then
                         tStr = tStr + tC + "[ ]"
                    Else
                         tStr = tStr + tC + CStr(!y_coord)
                    End If
                    '
                    'MsgBox "Office"

                    If IsNull(!c_office_trans) Then
                         tStr = tStr + tC + "[Office Missing]"
                    Else
                         tStr = tStr + tC + !c_office_trans
                    End If
                    '
                    'MsgBox "OfficeChn"

                    If IsNull(!c_office_chn) Then
                         tStr = tStr + tC + "[Office Chn Missing]"
                    Else
                         tStr = tStr + tC + !c_office_chn
                    End If
                    '
                       'MsgBox "FirstYear"

                       If IsNull(!c_firstyear) Then
                            tStr = tStr + tC + "[ ]"
                       Else
                            tStr = tStr + tC + Str(!c_firstyear)
                       End If
                       '
                       'MsgBox "LastYear"

                       If IsNull(!c_lastyear) Then
                            tStr = tStr + tC + "[ ]"
                       Else
                            tStr = tStr + tC + Str(!c_lastyear)
                       End If
                       '
                       'MsgBox "Dynasty"

                       If IsNull(!c_dynasty_chn) Then
                            tStr = tStr + tC + "[ ]"
                       Else
                            tStr = tStr + tC + !c_dynasty_chn
                       End If
                       '
                       'MsgBox "OfficeAddr"

                       If IsNull(!c_office_addr_name) Then
                            tStr = tStr + tC + "[Office Addr Missing]"
                       Else
                            tStr = tStr + tC + !c_office_addr_name
                       End If
                       '
                       'MsgBox "OfficeAddrChn"

                       If IsNull(!c_office_addr_chn) Then
                            tStr = tStr + tC + "[Office Addr Chn Missing]"
                       Else
                            tStr = tStr + tC + !c_office_addr_chn
                       End If
                       '
                       'MsgBox "X"

                       If IsNull(!office_x_coord) Then
                            tStr = tStr + tC + "[ ]"
                       Else
                            tStr = tStr + tC + CStr(!office_x_coord)
                       End If
                       '
                       'MsgBox "Y"

                       If IsNull(!office_y_coord) Then
                            tStr = tStr + tC + "[ ]"
                       Else
                            tStr = tStr + tC + CStr(!office_y_coord)
                       End If
                       '
                       'MsgBox "xy_count"

                       If IsNull(!office_xy_count) Then
                            tStr = tStr + tC + "[ ]"
                       Else
                            tStr = tStr + tC + Str(!office_xy_count)
                       End If
                       '
                       If Not (tStr = "") Then
                            gStream.WriteText tStr, adWriteLine
                       End If
                   End If
                   .MoveNext
               Loop
           End With
           ' now make sure all the data is copied to tStream
           gStream.Flush
           ' and write the stream to the file
           gStream.SaveToFile tFileName, adSaveCreateOverWrite
           '
           gStream.Close
    Else
        'The user pressed Cancel.
    End If

    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdGIS_Click:
    Exit Sub

Err_CmdGIS_Click:
    MsgBox Err.Description
    Resume Exit_CmdGIS_Click

End Sub


Private Sub CmdSaveOffices_Click()
On Error GoTo Err_CmdSaveOffices_Click
    '
    ' This program will store the current list of office IDs to a .txt file
    '
    Dim tStream As ADODB.Stream, tStreamNoBOM As ADODB.Stream
    Set tStream = New ADODB.Stream

    tStream.Charset = "utf-8"
    tStream.Mode = adModeReadWrite
    tStream.Type = adTypeText
    tStream.Open
    '
    Set tStreamNoBOM = New ADODB.Stream
    tStreamNoBOM.Type = adTypeBinary
    tStreamNoBOM.Open
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant, tFemale As String
    Dim tRstIDs As DAO.Recordset
    Dim tStr As String, tTab As String, ti As Integer
    Dim tFileSystem, tGDF

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

    dlgSaveAs.InitialFileName = "office_id_list.txt"
    If dlgSaveAs.Show = -1 Then
        '
        tFileName = ""
        For Each tFN In dlgSaveAs.SelectedItems
             tFileName = tFN
             If Not tFileName = "" Then
                 Exit For
             End If
        Next
        If tFileName = "" Then
             MsgBox "Bad file Name."
             GoTo Exit_CmdSaveOffices_Click
        Else
             ' make sure the file name has a txt extension
             If Len(tFileName) < 5 Then
                 tFileName = tFileName + ".txt"
             ElseIf Not (LCase(Right(tFileName, 4)) = ".txt") Then
                 tFileName = tFileName + ".txt"
             End If
        End If
        '
        ' write the file
        '
        ' process the table
        '
        tStr = "SELECT ZZ_OFFICE_CODE.c_office_id, OFFICE_CODES.c_office_chn, OFFICE_CODES.c_office_trans " + _
             "FROM ZZ_OFFICE_CODE INNER JOIN OFFICE_CODES ON ZZ_OFFICE_CODE.c_office_id = OFFICE_CODES.c_office_id
"
          Set tRstIDs = CurrentDb.OpenRecordset(tStr, dbOpenDynaset)
          '
          tTab = Chr(9)
          With tRstIDs

              .MoveFirst
              ' MsgBox "writing file"
              Do While Not .EOF
                  tStr = Str(!c_office_id) + tTab
                   If IsNull(!c_office_trans) Then
                        tStr = tStr + "" + tTab
                   Else
                        tStr = tStr + !c_office_trans + tTab
                   End If
                   tStr = tStr + !c_office_chn
                   '
                   tStream.WriteText tStr, adWriteLine
                   .MoveNext
               Loop
           End With
           ' now make sure all the data is copied to tStream
           tStream.Flush
           tStream.Position = 3
           tStream.CopyTo tStreamNoBOM
           ' and write the stream to the file
           tStreamNoBOM.SaveToFile tFileName, adSaveCreateOverWrite
           '
    Else
        'The user pressed Cancel.
    End If

    Set tRstIDs = Nothing

    tStream.Close
    Set tStream = Nothing
    tStreamNoBOM.Close
    Set tStreamNoBOM = Nothing
    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdSaveOffices_Click:
    Exit Sub

Err_CmdSaveOffices_Click:
    MsgBox Err.Description
    Resume Exit_CmdSaveOffices_Click

End Sub

Private Sub CmdStoreID_Click()
    Dim cmdSQL As ADODB.Command, tRecCount As Variant

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
        '
    If DCount("*", "ZZ_STORE_PERSON_ID") > 0 Then
        ' Display message.
        If MsgBox("Do you wish to replace the current stored values?", vbYesNo + vbQuestion + vbDefaultButton2) =
 vbNo Then
             Exit Sub
        Else
             cmdSQL.CommandText = "Delete * from ZZ_STORE_PERSON_ID"
             cmdSQL.Execute tRecCount
        End If
    End If

    tStrQuery = "INSERT INTO ZZ_STORE_PERSON_ID ( c_personid ) SELECT DISTINCT ZZ_SCRATCH_P_OFFICE.c_personid FRO
M ZZ_SCRATCH_P_OFFICE"

    cmdSQL.CommandText = tStrQuery
    cmdSQL.Execute tRecCount
    MsgBox "Person IDs successfully stored. Click on 'Recall Person IDs' to reuse these IDs in other forms."
    '
    ' update storage source
    cmdSQL.CommandText = "UPDATE PersonIDSource SET SourceForm ='Office' WHERE PersonIDSource.LineNum =1"
    cmdSQL.Execute tRecCount

End Sub

Private Sub CmdToDynasty_Click()
    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strToDynasty As String

    If gToDynasty = -1 Then
         strToDynasty = ""
    Else
         strToDynasty = Str(gToDynasty)
    End If

    stDocName = "frmPickDynasty"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strFromDynasty

    If CurrentProject.AllForms("frmPickDynasty").IsLoaded Then

          Forms!frmpickdynasty!frmDYNASTIES.Form!Dy_Code.SetFocus
          gToDynasty = Forms!frmpickdynasty!frmDYNASTIES.Form!Dy_Code.Value

          Forms!frmpickdynasty!frmDYNASTIES.Form!c_start.SetFocus
          gToDynastyBegin = Forms!frmpickdynasty!frmDYNASTIES.Form!c_start.Value

        Forms!frmpickdynasty!frmDYNASTIES.Form!c_end.SetFocus
        gToDynastyEnd = Forms!frmpickdynasty!frmDYNASTIES.Form!c_end.Value
        '
        ' check to see if we have a problem and reject selection if needed
        '
        If gFromDynasty > -1 Then
            If gFromDynastyBegin > gToDynastyEnd Then
                MsgBox "Warning: There is a problem with chronology: the 'From' Dynasty begins after the 'To' D
ynasty ends!", vbExclamation
                gToDynasty = -1
                TxtToDynasty.Value = ""
                TxtToDynastyPY.Value = ""
            End If
        End If
        '
        ' value is OK
        '
        If gToDynasty > -1 Then
            Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty.SetFocus
            TxtToDynastyPY.Value = Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty.Value

              Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty_chn.SetFocus
              TxtToDynasty.Value = Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty_chn.Value
          End If

        DoCmd.Close acForm, stDocName
        '
        ' reset FromDynasty if necessary (-2 = all dynasties)
        '
        If gFromDynasty = -2 Then
            gFromDynasty = -1
            TxtFromDynasty.Value = ""
            TxtFromDynastyPY.Value = ""
        End If
        '
    End If


End Sub

Private Sub Form_Open(Cancel As Integer)
    Dim cmdSQL As ADODB.Command, tRecDeleted As Variant
    Dim tRstOfficeCode As DAO.Recordset, tRstDummy As DAO.Recordset

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    ' clear the list of offices
    '
    cmdSQL.CommandText = "Delete * from ZZ_OFFICE_CODE"
    cmdSQL.Execute tRecDeleted
    '
    ' to clear the tables, briefly close and then delete records
    '
    Set tRstOfficeCode = ZZ_SCRATCH_OFFICE.Form.Recordset
    Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SO", dbOpenDynaset)
    Set ZZ_SCRATCH_OFFICE.Form.Recordset = tRstDummy
    tRstOfficeCode.Close
    '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_OFFICE"
    cmdSQL.Execute tRecDeleted
    '
    ' now reopen
    '
    Set tRstOfficeCode = CurrentDb.OpenRecordset("ZZ_SCRATCH_OFFICE", dbOpenDynaset)
    Set ZZ_SCRATCH_OFFICE.Form.Recordset = tRstOfficeCode
    '
    Set tRstOfficeCode = ZZ_SCRATCH_P_OFFICE.Form.Recordset
    Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SOP", dbOpenDynaset)
    Set ZZ_SCRATCH_P_OFFICE.Form.Recordset = tRstDummy
    tRstOfficeCode.Close
    '
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
        '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_P_OFFICE"
    cmdSQL.Execute tRecDeleted
    '
    ' now reopen
    '
    Set tRstOfficeCode = CurrentDb.OpenRecordset("ZZ_SCRATCH_P_Office", dbOpenDynaset)
    Set ZZ_SCRATCH_P_OFFICE.Form.Recordset = tRstOfficeCode

    'ChkIndexYears.Value = True
    '
    ' initialize state variables
    gUsePeopleADDRID = False
    gUseOfficeADDRID = False
    gUseOfficeID = False
    gUseIndexYears = False
    gUseOfficeYears = False
    gUseDynasties = False
    gFromDynasty = -1
    gToDynasty = -1

    ' first determine the language
    Dim gLCID As MsoAppLanguageID

    gLCID = Application.LanguageSettings.LanguageID(msoLanguageIDUI)
    If gLCID = 2052 Or gLCID = 3076 Then      ' 2052 = PRC, 3076 = Hong Kong
         gDisplayLanguage = "S"
    ElseIf gLCID = 4100 Or gLCID = 1028 Then ' 4100 = Singapore, 1028 = Taiwan
         gDisplayLanguage = "T"
         Call changeDisplayLanguage
    Else
         gDisplayLanguage = "E"
         Call changeDisplayLanguage
    End If

End Sub

Private Sub CmdGUESS_Click()
On Error GoTo Err_CmdGUESS_Click
    '
    ' This program will dump the results of the search to a .gdf file
    '
    ' for the moment I'll just describe the format of the .gdf file
    '
    ' nodedef> name, color, label, labelvisible, style, pinyin VARCHAR(50), nodedist INT
    '      name = str(c_person_id)
    '      color = red (1), orange (2), yellow (3), green (4), blue (5)
    '      label = c_name_chn
    '      style = 4 (text inside a rectangle)
    '      pinyin = c_name
    '      nodedist = c_node_dist INT
    '      indexyear = c_index_year INT
    '      sex = c_female > (F,M)
    '
    ' edgedef> node1, node2, color, label, labelvisible, edge_desc VARCHAR(50)
    '      node1 = str(c_person_id) for node1
    '      node2 = str(c_node_id) for node2
    '      color = red (1), orange (2), yellow (3), green (4), blue (5)
    '      label = c_link_chn
    '      edge_desc = c_link_desc
    '
    ' the central question is whether to do distance optimizations
    '
    ' first see if there are any records to process
    '
    If ZZ_SCRATCH_OFFICE.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdGUESS_Click
    End If
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tRstNode As DAO.Recordset
    Dim tRstEdge As DAO.Recordset
    Dim tStr As String, tC As String, ti As Integer
    Dim tColor(50) As String, tMetricSum As Integer
    Dim tFileSystem, tGDF

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)


    'Use a With...End With block to reference the FileDialog object.
    With dlgSaveAs
        .InitialFileName = "default.gdf"
        If .Show = -1 Then
            '
            tFileName = ""
            For Each tFN In .SelectedItems
                 tFileName = tFN
                 If Not tFileName = "" Then
                     Exit For
                 End If
            Next
            If tFileName = "" Then
                 MsgBox "Bad file Name."
                 GoTo Exit_CmdGUESS_Click
            End If
            '
            ' now process the file (second true removed to make ASCII)
            '
            Set tFileSystem = CreateObject("Scripting.FileSystemObject")
            Set tGDF = tFileSystem.CreateTextFile(tFileName, True, True)

            ' define the colors for the nodes
            '
            tColor(1) = "white"
            tColor(2) = "blue"
            tColor(3) = "green"
            tColor(4) = "yellow"
            tColor(5) = "orange"
            For ti = 6 To 50
                 tColor(ti) = "red"
            Next
            '
            ' process the two tables
            '
            Set tRstEdge = ZZ_SCRATCH_OFFICE.Form.Recordset
            Set tRstNode = ZZ_SCRATCH_P_OFFICE.Form.Recordset
            tC = Chr(44) ' the comma
            '
            ' first the nodes: define the record structure
            tStr = "nodedef> name" + tC + "color" + tC + "label" + tC + "labelvisible"
            tStr = tStr + tC + "style" + tC + "pinyin VARCHAR(50)"
            tStr = tStr + tC + "indexyear INT" + tC + "sex VARCHAR(1)"
            tGDF.WriteLine (tStr)
            '
            With tRstNode
                 .MoveFirst
                 Do While Not .EOF
                     tStr = Trim(Str(!c_person_id)) + tC
                     ' name = the ID of the person
                     '
                     tStr = tStr + tColor(1) + tC
                     '
                     If IsNull(!c_name_chn) Then
                          tStr = tStr + tC
                     Else
                          tStr = tStr + !c_name_chn + tC
                     End If
                     ' label
                     tStr = tStr + "true" + tC + "4" + tC
                     ' labelvisible = true, style = 4 (text inside a rectangle)
                     If IsNull(!c_name) Then
                          tStr = tStr + tC
                     Else
                          tStr = tStr + !c_name + tC
                     End If
                     ' pinyin = c_name
                     '
                         If IsNull(!c_index_year) Then
                              tStr = tStr + "-2000" + tC
                         Else
                              tStr = tStr + Trim(Str(!c_index_year)) + tC
                         End If
                         ' indexyear = c_index_year INT
                         If Not IsNull(!c_sex) Then
                              tStr = tStr + !c_sex
                         End If
                         tGDF.WriteLine (tStr)
                         .MoveNext
                     Loop
                 End With
                 '
                 ' now the edges: define the record structure
                 tStr = "edgedef> node1" + tC + "node2" + tC + "color" + tC + "label"
                 tGDF.WriteLine (tStr)

                 With tRstEdge
                     .MoveFirst
                     Do While Not .EOF
                          tStr = Trim(Str(!c_person_id)) + tC
                          '    node1 = str(c_person_id) for node1
                          tStr = tStr + Trim(Str(!c_office_id)) + tC
                          '    node2 = str(c_node_id) for node2
                          '
                          tStr = tStr + tColor(1) + tC
                          ' color = white (1), blue (2), green (3), yellow (4), orange (5)
                          '
                          If IsNull(!c_office_desc) Then
                               tStr = tStr + tC
                          Else
                               tStr = tStr + !c_office_desc
                          End If
                          '    label = the Officeiation
                          '
                          tGDF.WriteLine (tStr)
                          .MoveNext
                     Loop
                 End With
                 '
                 tGDF.Close
                 '
                 Set tRstNode = Nothing
                 Set tRstEdge = Nothing
                 Set tGDF = Nothing
                 Set tFileSystem = Nothing
          Else
             'The user pressed Cancel.
        End If
    End With

    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdGUESS_Click:
    Exit Sub

Err_CmdGUESS_Click:
    MsgBox Err.Description
    Resume Exit_CmdGUESS_Click

End Sub


Private Sub CmdFanti_Click()
On Error GoTo Err_CmdFanti_Click

    If gDisplayLanguage = "T" Then
         gDisplayLanguage = "E"
    Else
         gDisplayLanguage = "T"
    End If

    Call changeDisplayLanguage

Exit_CmdFanti_Click:
    Exit Sub

Err_CmdFanti_Click:
    MsgBox Err.Description
    Resume Exit_CmdFanti_Click

End Sub
Private Sub CmdJianti_Click()
On Error GoTo Err_CmdJianti_Click

    If gDisplayLanguage = "S" Then
         gDisplayLanguage = "E"
    Else
         gDisplayLanguage = "S"
    End If

    Call changeDisplayLanguage

Exit_CmdJianti_Click:
    Exit Sub

Err_CmdJianti_Click:
    MsgBox Err.Description
    Resume Exit_CmdJianti_Click

End Sub

Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 40) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 40 And Not .EOF
             If !c_form = "LAO" Then
                 gLabelsOK = True
                 If ti <> !c_label_id Then
                     MsgBox "Uh oh: mismatched label table"
                     gLabelsOK = False
                     Exit Do
                 End If
                 tLabelLanguage(1, ti) = !c_english
                 tLabelLanguage(2, ti) = !c_fanti
                 tLabelLanguage(3, ti) = !c_jianti
                 ti = ti + 1
             End If
             .MoveNext
        Loop
    End With
    ' tRstLabelList.Close
    Set tRstLabelList = Nothing

    If gLabelsOK Then
        If gDisplayLanguage = "E" Then
             tLang = 1
        ElseIf gDisplayLanguage = "T" Then
             tLang = 2
        Else
             tLang = 3
        End If
        '
        ' now comes the basic routine
        '
        Me.LblFrom.Caption = tLabelLanguage(tLang, 1)
        Me.LblTo.Caption = tLabelLanguage(tLang, 2)
        Me.LblType.Caption = tLabelLanguage(tLang, 3)
        Me.CmdPickOffice.Caption = tLabelLanguage(tLang, 4)
        Me.CmdQuery.Caption = tLabelLanguage(tLang, 5)
        Me.CmdGIS.Caption = tLabelLanguage(tLang, 6)
        Me.CmdGISPeople.Caption = tLabelLanguage(tLang, 7)
        Me.CmdFanti.Caption = tLabelLanguage(tLang, 8)
        Me.CmdJianti.Caption = tLabelLanguage(tLang, 9)
        Me.PageOffice.Caption = tLabelLanguage(tLang, 10)
        Me.PagePeople.Caption = tLabelLanguage(tLang, 11)
        'Me.LblIndexYears.Caption = tLabelLanguage(tLang, 12)
        Me.LblDisplay.Caption = tLabelLanguage(tLang, 13)
        Me.CmdHelp.Caption = tLabelLanguage(tLang, 14)
        Me.CmdAllOffices.Caption = tLabelLanguage(tLang, 15)
        Me.CmdAllPlacesOffices.Caption = tLabelLanguage(tLang, 16)
        Me.CmdAllPlacesPeople.Caption = tLabelLanguage(tLang, 17)
        Me.CmdImportPlaceOffice.Caption = tLabelLanguage(tLang, 18)
        Me.CmdImportPlacePeople.Caption = tLabelLanguage(tLang, 19)
        Me.CmdPlaceOffice.Caption = tLabelLanguage(tLang, 20)
        Me.CmdPlacePeople.Caption = tLabelLanguage(tLang, 21)
        Me.LblChkUseXY.Caption = tLabelLanguage(tLang, 22)
        Me.LblPlaceOffice.Caption = tLabelLanguage(tLang, 23)
        Me.LblPlacePeople.Caption = tLabelLanguage(tLang, 24)
        Me.CmdStoreID.Caption = tLabelLanguage(tLang, 25)
        Me.LblSubUnitsOffice.Caption = tLabelLanguage(tLang, 26)
        Me.LblSubUnitsPeople.Caption = tLabelLanguage(tLang, 27)
        Me.LblDynasties.Caption = tLabelLanguage(tLang, 28)
        Me.CmdFromDynasty.Caption = tLabelLanguage(tLang, 29)
        Me.CmdToDynasty.Caption = tLabelLanguage(tLang, 30)
        Me.CmdAllDynasties.Caption = tLabelLanguage(tLang, 31)
        Me.LblIndexYears.Caption = tLabelLanguage(tLang, 32)
        Me.LblOptNoDates.Caption = tLabelLanguage(tLang, 33)
        Me.LblOptIndexYears.Caption = tLabelLanguage(tLang, 34)
        Me.LblOptDynasties.Caption = tLabelLanguage(tLang, 35)
        Me.CmdNeo4j.Caption = tLabelLanguage(tLang, 36)
        Me.CmdImportOffices.Caption = tLabelLanguage(tLang, 37)
        Me.CmdSaveOffices.Caption = tLabelLanguage(tLang, 38)
        Me.LblOptOffice.Caption = tLabelLanguage(tLang, 39)
    End If

End Sub

Private Sub writeOfficeKML()

    Dim tStrKML As String
    '
    ' This program will dump the results to a .kml file
    '
    If ZZ_SCRATCH_OFFICE.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_writeOfficeKML
    End If
    '
    Dim tStream As ADODB.Stream
    Set tStream = New ADODB.Stream

    If FrameGISOffice.Value = 1 Then
         tStream.Charset = "gb18030"
         tCodeStr = "GB18030"
    Else
         tStream.Charset = "utf-8"
         tCodeStr = "UTF8"
    End If
    tStream.Mode = adModeReadWrite
    tStream.Type = adTypeText
    tStream.Open
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant, tFemale As String
    Dim tRstNode As DAO.Recordset
    Dim tStr As String, tTab As String, ti As Integer
    Dim tFileSystem, tGDF

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

    dlgSaveAs.InitialFileName = "office_gis_" + tCodeStr + ".kml"
    If dlgSaveAs.Show = -1 Then
        '
        tFileName = ""
        For Each tFN In dlgSaveAs.SelectedItems
             tFileName = tFN
             If Not tFileName = "" Then
                 Exit For
             End If
        Next
        If tFileName = "" Then
             MsgBox "Bad file Name."
             GoTo Exit_writeOfficeKML
        Else
            ' make sure the file name has a txt extension
            If Len(tFileName) < 5 Then
                tFileName = tFileName + ".kml"
            ElseIf Not (LCase(Right(tFileName, 4)) = ".kml") Then
                tFileName = tFileName + ".kml"
            End If
        End If
        '
        ' write the file
        '
        'SELECT ZZ_SCRATCH_OFFICE.c_name AS Name, ZZ_SCRATCH_OFFICE.c_name_chn AS NameChn,
        'ZZ_SCRATCH_OFFICE.c_index_year AS IndexYear, ZZ_SCRATCH_OFFICE.c_sex AS Sex,
        'ZZ_SCRATCH_OFFICE.c_addr_name AS AddrName, ZZ_SCRATCH_OFFICE.c_addr_chn AS AddrChn,
        'Str(ZZ_SCRATCH_OFFICE.x_coord) AS PersonX, Str(ZZ_SCRATCH_OFFICE.y_coord) AS PersonY,
        'ZZ_SCRATCH_OFFICE.c_office_trans AS Office, ZZ_SCRATCH_OFFICE.c_office_chn AS OfficeChn,
        'ZZ_SCRATCH_OFFICE.c_firstyear AS FirstYear, ZZ_SCRATCH_OFFICE.c_lastyear AS LastYear,
        'ZZ_SCRATCH_OFFICE.c_dy_desc AS Dynasty,
        'ZZ_SCRATCH_OFFICE.c_office_addr_name AS OfficeAddr,
        'ZZ_SCRATCH_OFFICE.c_office_addr_chn AS OfficeAddrChn,
        'Str(ZZ_SCRATCH_OFFICE.office_x_coord) AS X, Str(ZZ_SCRATCH_OFFICE.office_y_coord) AS Y,
        'ZZ_SCRATCH_OFFICE.office_xy_count AS XY_count

        '      tStr = "PostingID" (c_posting_id) + "Office" (c_name) + "OfficeChn" (c_name_chn) + _
                  "FirstYear" (c_firstyear) + "LastYear" + (c_lastyear) _
                  "Dynasty" (c_dy) + "OfficeAddr" (c_office_addr_name) + "OfficeAddrHZ" (c_office_addr_chn) + _
                  "X" (office_x_coord) + "Y" (office_y_coord) + "xy_count" (office_xy_count)
        '
        ' process the table
        '
        Set tRstNode = ZZ_SCRATCH_OFFICE.Form.Recordset
        tC = Chr(9) ' the tab
        tDQ = Chr(34) ' the double quotation mark
        '
        ' write the header
        '
        tStream.WriteText "<kml xmlns=" + tDQ + "http://www.opengis.net/kml/2.2" + tDQ + ">", adWriteLine
        tStream.WriteText "<Document>", adWriteLine
        tStream.WriteText tC + "<name>ExtendedData+SchemaData</name>", adWriteLine
        tStream.WriteText tC + "<open>1</open>", adWriteLine '"
        tStream.WriteText tC + "<!-- Create a balloon template referring to the user-defined type -->", adWriteLi
ne
         tStream.WriteText tC + "<Style id=" + tDQ + "office-balloon-template" + tDQ + ">", adWriteLine
         tStream.WriteText tC + tC + "<BalloonStyle>", adWriteLine
         tStream.WriteText tC + tC + tC + "<text>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "<![CDATA[", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "ID: $[OfficePosting/PostingID] <br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "Person Chn: $[OfficePosting/PersonNameHZ] <br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "Begin Year: $[OfficePosting/BeginYear] <br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "End Year: $[OfficePosting/EndYear] <br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "Office Desc: $[OfficePosting/OfficeName] <br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "Office Chn: $[OfficePosting/OfficeNameHZ] <br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "Office Dynasty: $[OfficePosting/OfficeDyn] <br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "Address: $[OfficePosting/AddrName] $[OfficePosting/AddrNameHZ] <br
/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "XY Count: $[OfficePosting/XYCount] <br/><br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "]]>", adWriteLine
         tStream.WriteText tC + tC + tC + "</text>", adWriteLine
         tStream.WriteText tC + tC + "</BalloonStyle>", adWriteLine
         tStream.WriteText tC + "</Style>", adWriteLine
         tStream.WriteText tC + "<!-- Declare the type " + tDQ + "OfficePosting" + tDQ + " with 6 fields -->", adW
riteLine
         tStream.WriteText tC + "<Schema name=" + tDQ + "OfficePosting" + tDQ + " id=" + tDQ + "OfficePostingId" +
 tDQ + ">", adWriteLine
         tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "PersonNameHZ"
 + tDQ + ">", adWriteLine
         tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Person Chn]]></displayName>", adWriteLine
         tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
         tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "AddrName" + t
DQ + ">", adWriteLine
         tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Address]]></displayName>", adWriteLine
         tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
         tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "AddrNameHZ" +
 tDQ + ">", adWriteLine
         tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Address Chn]]></displayName>", adWriteLine
         tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
         tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "uint" + tDQ + " name=" + tDQ + "PostingID" + tD
Q + ">", adWriteLine
         tStream.WriteText tC + tC + tC + "<displayName><![CDATA[ID]]></displayName>", adWriteLine
         tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "int" + tDQ + " name=" + tDQ + "FirstYear" + tDQ
 + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Begin Year]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "int" + tDQ + " name=" + tDQ + "LastYear" + tDQ
+ ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[End Year]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "OfficeName" +
 tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Office Name]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "OfficeNameHZ"
 + tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Office Chn]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "int" + tDQ + " name=" + tDQ + "OfficeDyn" + tDQ
 + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Office Dyn]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "int" + tDQ + " name=" + tDQ + "XYCount" + tDQ +
 ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[XY Count]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + "</Schema>", adWriteLine

        With tRstNode
            '
            .MoveFirst
            Do While Not .EOF
                ' must guard against NULLs, even where there should not be any
                '
                ' write the point header
                '
                tStream.WriteText tC + "<Placemark>", adWriteLine

                If IsNull(!c_person_name) Then
                     tStr = "[Bad Data] " + Str(!c_posting_id)
                Else
                     tStr = !c_person_name + " " + Str(!c_posting_id)
                End If
                tStream.WriteText tC + tC + "<name>" + tStr + "</name>", adWriteLine

                tStream.WriteText tC + tC + "<styleUrl>#office-balloon-template</styleUrl>", adWriteLine
                '
                ' First Year as time stamp
                '
                If IsNull(!c_firstyear) Then
                     tStr = "0"
                Else
                     tStr = Str(!c_firstyear)
                End If
                tStream.WriteText tC + tC + "<TimeStamp>" + tStr + "</TimeStamp>", adWriteLine
                '
                tStream.WriteText tC + tC + "<ExtendedData>", adWriteLine
                tStream.WriteText tC + tC + tC + "<SchemaData schemaUrl=" + tDQ + "#OfficePostingID" + tDQ + ">",
 adWriteLine
                '
                ' posting ID
                '
                tStr = Str(!c_posting_id)
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "PostingID" + tDQ + ">" + tStr
+ "</SimpleData>", adWriteLine
                '
                ' Person Name Chn
                '
                If IsNull(!c_person_name_chn) Then
                     tStr = tStr + "[Bad Data]"
                Else
                     If Trim(!c_person_name_chn) = "" Then
                          tStr = "[?]"
                     Else
                          tStr = !c_person_name_chn
                     End If
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "PersonNameHZ" + tDQ + ">" + tS
tr + "</SimpleData>", adWriteLine
                '
                ' Office Name
                '
                If IsNull(!c_office_trans) Then
                     tStr = tStr + "[Bad Data]"
                Else
                     If Trim(!c_office_trans) = "" Then
                          tStr = "[?]"
                     Else
                          tStr = !c_office_trans
                     End If
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "OfficeName" + tDQ + ">" + tStr
 + "</SimpleData>", adWriteLine
                '
                ' Office Chinese Name
                '
                If IsNull(!c_office_chn) Then
                     tStr = tStr + "[Bad Data]"
                Else
                     If Trim(!c_office_chn) = "" Then
                          tStr = "[?]"
                     Else
                          tStr = !c_office_chn
                     End If
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "OfficeNameHZ" + tDQ + ">" + tS
tr + "</SimpleData>", adWriteLine
                '
                ' First Year
                '
                If IsNull(!c_firstyear) Then
                     tStr = "0"
                Else
                     tStr = Str(!c_firstyear)
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "FirstYear" + tDQ + ">" + tStr
+ "</SimpleData>", adWriteLine
                '
                ' Last Year
                '
                If IsNull(!c_lastyear) Then
                     tStr = "0"
                Else
                     tStr = Str(!c_lastyear)
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "LastYear" + tDQ + ">" + tStr +
 "</SimpleData>", adWriteLine
                '
                ' Office Dynasty
                '
                If IsNull(!c_dy) Then
                     tStr = "0"
                Else
                     tStr = Str(!c_dy)
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "OfficeDyn" + tDQ + ">" + tStr
+ "</SimpleData>", adWriteLine
                '
                ' Address Name
                '
                If IsNull(!c_office_addr_name) Then
                     tStr = "[?]"
                ElseIf Trim(!c_office_addr_name) = "" Then
                     tStr = "[?]"
                Else
                     tStr = !c_office_addr_name
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "AddrName" + tDQ + ">" + tStr +
 "</SimpleData>", adWriteLine
                '
                ' Address Name Chinese
                '
                If IsNull(!c_office_addr_chn) Then
                     tStr = "[?]"
                ElseIf Trim(!c_office_addr_chn) = "" Then
                     tStr = "[?]"
                Else
                     tStr = !c_office_addr_chn
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "AddrNameHZ" + tDQ + ">" + tStr
 + "</SimpleData>", adWriteLine
                '
                ' XY Count
                '
                If IsNull(!office_xy_count) Then
                     tStr = "0"
                Else
                     tStr = Str(!office_xy_count)
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "XYCount" + tDQ + ">" + tStr +
"</SimpleData>", adWriteLine
                '
                tStream.WriteText tC + tC + tC + "</SchemaData>", adWriteLine
                tStream.WriteText tC + tC + "</ExtendedData>", adWriteLine
                tStream.WriteText tC + tC + "<Point>", adWriteLine
                '
                ' coordinates
                If IsNull(!office_x_coord) Then
                     tStr = "0"
                Else
                     tStr = Str(!office_x_coord)
                End If

                   If IsNull(!office_y_coord) Then
                        tStr = tStr + ",0"
                   Else
                        tStr = tStr + "," + Str(!office_y_coord)
                   End If
                   tStream.WriteText tC + tC + tC + "<coordinates>" + tStr + "</coordinates>", adWriteLine
                   '
                   ' footer
                   '
                   tStream.WriteText tC + tC + "</Point>", adWriteLine
                   tStream.WriteText tC + "</Placemark>", adWriteLine
                   .MoveNext
               Loop
           End With
           '
           ' footer
           '
           tStream.WriteText "</Document>", adWriteLine
           tStream.WriteText "</kml>", adWriteLine
    Else
        'The user pressed Cancel.
    End If

    ' now make sure all the data is copied to tStream
    tStream.Flush
    ' and write the stream to the file
    tStream.SaveToFile tFileName, adSaveCreateOverWrite
    '
    Set tRstNode = Nothing

    tStream.Close
    Set tStream = Nothing
    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_writeOfficeKML:
    Exit Sub

Err_writeOfficeKML:
    MsgBox Err.Description
    Resume Exit_writeOfficeKML


End Sub

Private Sub writePersonKML()

    Dim tStrKML As String
    '
    ' This program will dump the results to a .kml file
    '
    If ZZ_SCRATCH_P_OFFICE.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_writePersonKML
    End If
    '
    Dim tStream As ADODB.Stream
    Set tStream = New ADODB.Stream
     If FrameGISOffice.Value = 1 Then
          tStream.Charset = "gb18030"
          tCodeStr = "GB18030"
     Else
          tStream.Charset = "utf-8"
          tCodeStr = "UTF8"
     End If
     tStream.Mode = adModeReadWrite
     tStream.Type = adTypeText
     tStream.Open
     '
     ' next get a file
     '
     Dim dlgSaveAs As FileDialog
     Dim tFileNum As Integer
     Dim tFileName As String, tFN As Variant, tFemale As String
     Dim tRstNode As DAO.Recordset
     Dim tStr As String, tTab As String, ti As Integer
     Dim tFileSystem, tGDF

     Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

     dlgSaveAs.InitialFileName = "office_people_gis_" + tCodeStr + ".kml"
     If dlgSaveAs.Show = -1 Then
         '
         tFileName = ""
         For Each tFN In dlgSaveAs.SelectedItems
              tFileName = tFN
              If Not tFileName = "" Then
                  Exit For
              End If
         Next
         If tFileName = "" Then
              MsgBox "Bad file Name."
              GoTo Exit_writePersonKML
         Else
              ' make sure the file name has a txt extension
              If Len(tFileName) < 5 Then
                  tFileName = tFileName + ".kml"
              ElseIf Not (LCase(Right(tFileName, 4)) = ".kml") Then
                  tFileName = tFileName + ".kml"
              End If
         End If
         '
         ' write the file
         '
         'SELECT ZZ_SCRATCH_OFFICE.c_name AS Name, ZZ_SCRATCH_OFFICE.c_name_chn AS NameChn,
         'ZZ_SCRATCH_OFFICE.c_index_year AS IndexYear, ZZ_SCRATCH_OFFICE.c_sex AS Sex,
         'ZZ_SCRATCH_OFFICE.c_addr_name AS AddrName, ZZ_SCRATCH_OFFICE.c_addr_chn AS AddrChn,
         'Str(ZZ_SCRATCH_OFFICE.x_coord) AS PersonX, Str(ZZ_SCRATCH_OFFICE.y_coord) AS PersonY,
         'ZZ_SCRATCH_OFFICE.c_office_trans AS Office, ZZ_SCRATCH_OFFICE.c_office_chn AS OfficeChn,
         'ZZ_SCRATCH_OFFICE.c_firstyear AS FirstYear, ZZ_SCRATCH_OFFICE.c_lastyear AS LastYear,
         'ZZ_SCRATCH_OFFICE.c_dy_desc AS Dynasty,
         'ZZ_SCRATCH_OFFICE.c_office_addr_name AS OfficeAddr,
         'ZZ_SCRATCH_OFFICE.c_office_addr_chn AS OfficeAddrChn,
         'Str(ZZ_SCRATCH_OFFICE.office_x_coord) AS X, Str(ZZ_SCRATCH_OFFICE.office_y_coord) AS Y,
         'ZZ_SCRATCH_OFFICE.office_xy_count AS XY_count

         '    tStr = "PostingID" (c_posting_id) + "Office" (c_name) + "OfficeChn" (c_name_chn) + _
                 "FirstYear" (c_firstyear) + "LastYear" + (c_lastyear) _
                 "Dynasty" (c_dy) + "OfficeAddr" (c_office_addr_name) + "OfficeAddrHZ" (c_office_addr_chn) + _
                 "X" (office_x_coord) + "Y" (office_y_coord) + "xy_count" (office_xy_count)
         '
         ' process the table
         '
         Set tRstNode = ZZ_SCRATCH_P_OFFICE.Form.Recordset
         tC = Chr(9) ' the tab
         tDQ = Chr(34) ' the double quotation mark
         '
         ' write the header
         '
         tStream.WriteText "<kml xmlns=" + tDQ + "http://www.opengis.net/kml/2.2" + tDQ + ">", adWriteLine
         tStream.WriteText "<Document>", adWriteLine
         tStream.WriteText tC + "<name>ExtendedData+SchemaData</name>", adWriteLine
         tStream.WriteText tC + "<open>1</open>", adWriteLine '"
         tStream.WriteText tC + "<!-- Create a balloon template referring to the user-defined type -->", adWriteLi
ne
         tStream.WriteText tC + "<Style id=" + tDQ + "office-balloon-template" + tDQ + ">", adWriteLine
         tStream.WriteText tC + tC + "<BalloonStyle>", adWriteLine
         tStream.WriteText tC + tC + tC + "<text>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "<![CDATA[", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "ID: $[OfficePosting/PersonID] <br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "Name Chn: $[OfficePosting/NameHZ] <br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "Index Year: $[OfficePosting/IndexYear] <br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "Dynasty: $[OfficePosting/Dyn] <br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "Address: $[OfficePosting/AddrName] $[OfficePosting/AddrNameHZ] <br
/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "XY Count: $[OfficePosting/XYCount] <br/><br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "]]>", adWriteLine
         tStream.WriteText tC + tC + tC + "</text>", adWriteLine
         tStream.WriteText tC + tC + "</BalloonStyle>", adWriteLine
         tStream.WriteText tC + "</Style>", adWriteLine
         tStream.WriteText tC + "<!-- Declare the type " + tDQ + "OfficePosting" + tDQ + " with 6 fields -->", adW
riteLine
         tStream.WriteText tC + "<Schema name=" + tDQ + "OfficePosting" + tDQ + " id=" + tDQ + "OfficePersonID" +
tDQ + ">", adWriteLine
         tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "uint" + tDQ + " name=" + tDQ + "PersonID" + tDQ
 + ">", adWriteLine
         tStream.WriteText tC + tC + tC + "<displayName><![CDATA[ID]]></displayName>", adWriteLine
         tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
         tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "NameHZ" + tDQ
 + ">", adWriteLine
         tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Person Chn]]></displayName>", adWriteLine
         tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
         tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "AddrName" + t
DQ + ">", adWriteLine
         tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Address]]></displayName>", adWriteLine
         tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
         tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "AddrNameHZ" +
 tDQ + ">", adWriteLine
         tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Address Chn]]></displayName>", adWriteLine
         tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
         tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "IndexYear" +
tDQ + ">", adWriteLine
         tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Index Year]]></displayName>", adWriteLine
         tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
         tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "int" + tDQ + " name=" + tDQ + "Dyn" + tDQ + ">"
, adWriteLine
         tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Dyn]]></displayName>", adWriteLine
         tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
         tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "int" + tDQ + " name=" + tDQ + "XYCount" + tDQ +
 ">", adWriteLine
         tStream.WriteText tC + tC + tC + "<displayName><![CDATA[XY Count]]></displayName>", adWriteLine
         tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
         tStream.WriteText tC + "</Schema>", adWriteLine

        With tRstNode
            '
            .MoveFirst
            Do While Not .EOF
                ' must guard against NULLs, even where there should not be any
                '
                ' write the point header
                '
                tStream.WriteText tC + "<Placemark>", adWriteLine

                If IsNull(!c_name) Then
                     tStr = "[Bad Data] " + Str(!c_personid)
                Else
                     tStr = !c_name + " " + Str(!c_personid)
                End If
                tStream.WriteText tC + tC + "<name>" + tStr + "</name>", adWriteLine

                tStream.WriteText tC + tC + "<styleUrl>#office-balloon-template</styleUrl>", adWriteLine
                '
                ' First Year as time stamp
                '
                If IsNull(!c_index_year) Then
                     tStr = "N/A"
                Else
                     tStr = Str(!c_index_year)
                End If
                tStream.WriteText tC + tC + "<TimeStamp>" + tStr + "</TimeStamp>", adWriteLine
                '
                tStream.WriteText tC + tC + "<ExtendedData>", adWriteLine
                tStream.WriteText tC + tC + tC + "<SchemaData schemaUrl=" + tDQ + "#OfficePersonID" + tDQ + ">",
adWriteLine
                '
                '   person ID
                '
                tStr = Str(!c_personid)
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "PersonID" + tDQ + ">" + tStr +
 "</SimpleData>", adWriteLine
                '
                ' Person Name Chn
                '
                If IsNull(!c_name_chn) Then
                     tStr = tStr + "[Bad Data]"
                Else
                     If Trim(!c_name_chn) = "" Then
                          tStr = "[?]"
                     Else
                          tStr = !c_name_chn
                     End If
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "NameHZ" + tDQ + ">" + tStr + "
</SimpleData>", adWriteLine
                '
                ' Index Year
                '
                If IsNull(!c_index_year) Then
                     tStr = "N/A"
                Else
                     tStr = Str(!c_index_year)
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "IndexYear" + tDQ + ">" + tStr
+ "</SimpleData>", adWriteLine
                '
                ' Dynasty
                '
                If IsNull(!c_dy) Then
                     tStr = "0"
                Else
                     tStr = Str(!c_dy)
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "Dyn" + tDQ + ">" + tStr + "</S
impleData>", adWriteLine
                '
                ' Address Name
                '
                If IsNull(!c_addr_name) Then
                     tStr = "[?]"
                ElseIf Trim(!c_addr_name) = "" Then
                     tStr = "[?]"
                Else
                     tStr = !c_addr_name
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "AddrName" + tDQ + ">" + tStr +
 "</SimpleData>", adWriteLine
                '
                ' Address Name Chinese
                '
                If IsNull(!c_addr_chn) Then
                     tStr = "[?]"
                ElseIf Trim(!c_addr_chn) = "" Then
                     tStr = "[?]"
                Else
                     tStr = !c_addr_chn
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "AddrNameHZ" + tDQ + ">" + tStr
 + "</SimpleData>", adWriteLine
                '
                ' XY Count
                '
                If IsNull(!xy_count) Then
                     tStr = "0"
                Else
                     tStr = Str(!xy_count)
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "XYCount" + tDQ + ">" + tStr +
"</SimpleData>", adWriteLine
                '
                tStream.WriteText tC + tC + tC + "</SchemaData>", adWriteLine
                tStream.WriteText tC + tC + "</ExtendedData>", adWriteLine
                tStream.WriteText tC + tC + "<Point>", adWriteLine
                '
                ' coordinates
                If IsNull(!x_coord) Then
                     tStr = "0"
                Else
                       tStr = Str(!x_coord)
                   End If

                   If IsNull(!y_coord) Then
                        tStr = tStr + ",0"
                   Else
                        tStr = tStr + "," + Str(!y_coord)
                   End If
                   tStream.WriteText tC + tC + tC + "<coordinates>" + tStr + "</coordinates>", adWriteLine
                   '
                   ' footer
                   '
                   tStream.WriteText tC + tC + "</Point>", adWriteLine
                   tStream.WriteText tC + "</Placemark>", adWriteLine
                   .MoveNext
               Loop
           End With
           '
           ' footer
           '
           tStream.WriteText "</Document>", adWriteLine
           tStream.WriteText "</kml>", adWriteLine
    Else
        'The user pressed Cancel.
    End If

    ' now make sure all the data is copied to tStream
    tStream.Flush
    ' and write the stream to the file
    tStream.SaveToFile tFileName, adSaveCreateOverWrite
    '
    Set tRstNode = Nothing

    tStream.Close
    Set tStream = Nothing
    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_writePersonKML:
    Exit Sub

Err_writePersonKML:
    MsgBox Err.Description
    Resume Exit_writePersonKML


End Sub

Private Sub FrameFilterYears_Click()
    '
    ' the simplest approach is to turn it all off and then turn on the appropriate objects

    ' disable all
    Me.CmdFromDynasty.Enabled = False
    Me.CmdToDynasty.Enabled = False
    Me.CmdAllDynasties.Enabled = False
    Me.TxtFromDynasty.Enabled = False
    Me.TxtFromDynastyPY.Enabled = False
    Me.TxtToDynasty.Enabled = False
    Me.TxtToDynastyPY.Enabled = False
    Me.TxtFromDynasty.Locked = False
    Me.TxtFromDynastyPY.Locked = False
    Me.TxtToDynasty.Locked = False
    Me.TxtToDynastyPY.Locked = False

    Me.TxtFromYear.Enabled = False
    Me.TxtToYear.Enabled = False
    Me.TxtOfficeFrom.Enabled = False
    Me.TxtOfficeTo.Enabled = False

    gUseIndexYears = False
    gUseOfficeYears = False
    gUseDynasties = False

    If FrameFilterYears.Value = 2 Then

           ' enable index years
           Me.TxtFromYear.Enabled = True
           Me.TxtToYear.Enabled = True
           gUseIndexYears = True

    ElseIf FrameFilterYears.Value = 3 Then

          ' enable dynasties
          Me.CmdFromDynasty.Enabled = True
          Me.CmdToDynasty.Enabled = True
          Me.CmdAllDynasties.Enabled = True
          Me.TxtFromDynasty.Enabled = True
          Me.TxtFromDynastyPY.Enabled = True
          Me.TxtToDynasty.Enabled = True
          Me.TxtToDynastyPY.Enabled = True
          Me.TxtFromDynasty.Locked = True
          Me.TxtFromDynastyPY.Locked = True
          Me.TxtToDynasty.Locked = True
          Me.TxtToDynastyPY.Locked = True
          gUseDynasties = True

    ElseIf FrameFilterYears.Value = 4 Then

          ' enable office years
          Me.TxtOfficeFrom.Enabled = True
          Me.TxtOfficeTo.Enabled = True
          gUseOfficeYears = True

    End If

End Sub

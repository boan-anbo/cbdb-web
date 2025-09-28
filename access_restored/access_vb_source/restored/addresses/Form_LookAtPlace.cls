Option Compare Database
Public gRstPeople As DAO.Recordset, gDisplayLanguage As String, gLabelsOK As Boolean
Public gImportPlaces As Boolean, gUseADDRID As Boolean, gFilterBAC As Boolean
Public gFromDynasty As Integer, gToDynasty As Integer, gUseIndexYears As Boolean, gUseDynasties As Boolean, _
        gFromDynastyBegin As Integer, gFromDynastyEnd As Integer, gToDynastyBegin As Integer, gToDynastyEnd As Integer

Private Sub ChkAssocPerson_Click()
    Call QueryOK
End Sub

Private Sub ChkAssocPlace_Click()
    Call QueryOK
End Sub

Private Sub ChkEntry_Click()
    Call QueryOK
End Sub

Private Sub ChkIndexYears_Click()
    Me.TxtFromYear.Enabled = ChkIndexYears.Value
    Me.TxtToYear.Enabled = ChkIndexYears.Value
End Sub

Private Sub ChkIndividual_Click()
    Call QueryOK
    If ChkIndividual.Value Then
         CmdPickBAC.Enabled = True
    Else
         CmdPickBAC.Enabled = False
    End If
End Sub

Private Sub ChkInstitution_Click()
    Call QueryOK
End Sub

Private Sub ChkKin_Click()
    Call QueryOK
End Sub

Private Sub ChkOffice_Click()
    Call QueryOK
End Sub

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

Private Sub CmdImportPlaces_Click()
    On Error GoTo Err_CmdImportPlaces_Click

    Dim stDocName As String, tRstAddresses As DAO.Recordset
    Dim stLinkCriteria As String, tRstImportPlaces As DAO.Recordset
    Dim tString As String, tAddrID As Long, ti As Integer, tStrID As String
    Dim tLen As Integer, cmdSQL As ADODB.Command, tQuit As Boolean

    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tFileSystem, tList

    '
    tQuit = False
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
                        GoTo Exit_CmdImportPlaces_Click
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
          cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_ADDR"
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
          tStrSQL = "INSERT INTO ZZ_SCRATCH_ADDR ( c_addr_id ) SELECT DISTINCT TempImportList.ImportID " + _
              "FROM ADDR_CODES INNER JOIN TempImportList ON ADDR_CODES.c_addr_id = TempImportList.ImportID"

          cmdSQL.CommandText = tStrSQL
          cmdSQL.Execute tRecDeleted

          If tRecDeleted > 0 Then
              Me.TxtPlace.Value = "[Imported List]"
              Me.TxtPlaceChn.Value = "[Imported List]"
              Me.CmdQuery.Enabled = True
              gUseADDRID = True
              ChkXYRef.Enabled = True
              ChkSubUnits.Enabled = True
          End If

        Set cmdSQL = Nothing
        Set tFileSystem = Nothing
    End If

Exit_CmdImportPlaces_Click:
    Exit Sub

Err_CmdImportPlaces_Click:
    MsgBox Err.Description
    Resume Exit_CmdImportPlaces_Click

End Sub

Private Sub CmdNeo4j_Click()
On Error GoTo Err_CmdNeo4j_Click
    '
    ' This program will dump the results of the search to five CSV files
    '
    ' warn the user that a lot of files will be created
    '
    'MsgBox "Neo4j requires that from 6 to 9 files be created."
    '
    ' allocate the file variables
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer, tFileName As String, tFN As Variant
    '
    ' next get the People file
    '
    Dim tRstPeople As DAO.Recordset, tRstPlace As DAO.Recordset
    Dim tRstPeoplePlace As DAO.Recordset, tStr As String, tC As String
    Dim tQueryStr As String, tPersonID As Long, tRecDeleted As Long
    Dim gStream As ADODB.Stream, tCodeStr As String
    '
    ' set up the stream to write to
    '
    Set gStream = New ADODB.Stream
    '
    If CodeFrame.Value = 1 Then
         gStream.Charset = "utf-8"
         tCodeStr = "UTF8"
    ElseIf CodeFrame.Value = 2 Then
         gStream.Charset = "big5"
         tCodeStr = "BIG5"
    ElseIf CodeFrame.Value = 3 Then
         gStream.Charset = "gb2312"
         tCodeStr = "GB2312"
    Else
         gStream.Charset = "ascii"
         tCodeStr = "ascii"
    End If
    '
    tC = Chr(44) ' the comma
    '
    ' prepare the temp tables for the people, place, peoplePlace and entry data

    Dim cmdSQL As ADODB.Command
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    Set tRstPeopleStatus = CurrentDb.OpenRecordset("ZZ_SCRATCH_STATUS", dbOpenDynaset)

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
        '
        ' get the list of people: there are two sources for people -- c_person_id and c_assoc_id
        '
        cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_P_TEXT"
        cmdSQL.Execute tRecDeleted
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id, c_name, c_name_chn, c_index_year ) " + _
                     "SELECT DISTINCT ZZ_PLACE.c_personid, ZZ_PLACE.c_name, ZZ_PLACE.c_name_chn, ZZ_PLACE.c_index_
year " + _
                     "FROM ZZ_PLACE"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id, c_name, c_name_chn, c_index_year ) " + _
                     "SELECT DISTINCT ZZ_PLACE.c_assoc_id, ZZ_PLACE.c_assoc_name, ZZ_PLACE.c_assoc_chn, ZZ_PLACE.c
_assoc_index_year " + _
                     "FROM ZZ_PLACE " + _
                    "WHERE (ZZ_PLACE.c_assoc_id > 0)"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_P_TEXT.c_person_id, ZZ_SCRATCH_P_TEXT.c_name, ZZ_SCRATCH_P_TEXT.c
_name_chn, " + _
                        "ZZ_SCRATCH_P_TEXT.c_index_year, ZZZ_BIOG_MAIN.c_dynasty, ZZZ_BIOG_MAIN.c_dynasty_chn, ZZ
Z_BIOG_MAIN.c_female " + _
                    "FROM ZZ_SCRATCH_P_TEXT INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_P_TEXT.c_person_id = ZZZ_BIOG_
MAIN.c_personid"

        Set tRstPeople = CurrentDb.OpenRecordset(tQueryStr, dbOpenDynaset)
        tRstPeople.MoveLast
        '
        ' process the four tables
        '
        ' first the nodes: define the record structure
        '
        ' if the file is strictly ASCII, the label is the pinyin, but if there are characters, then we add a pin
yin field
        If tCodeStr = "ascii" Then
             tStr = "NameID" + tC + "NamePY" + tC + "IndexYear" + tC + "Dynasty" + tC + "Sex"
        Else
             tStr = "NameID" + tC + "NameHZ" + tC + "NamePY" + tC + "IndexYear" + tC + "Dynasty" + tC + "Sex"
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
                If IsNull(!c_female) Then
                     tStr = tStr + "Missing"
                Else
                     tStr = tStr + IIf(!c_female, "F", "M")
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
    ' now the PeopleIndexAddr file
    '
    dlgSaveAs.InitialFileName = "PeopleIndexAddr_" + tCodeStr + ".csv"
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
        tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_P_TEXT.c_person_id, ZZZ_BIOG_MAIN.c_index_addr_id, " + _
                          "ZZZ_BIOG_MAIN.c_index_addr_type_code " + _
                     "FROM ZZ_SCRATCH_P_TEXT INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_P_TEXT.c_person_id = ZZZ_BIOG_
MAIN.c_personid " + _
                     "WHERE (ZZZ_BIOG_MAIN.c_index_addr_type_code > 0)"

           Set tRstPeoplePlace = CurrentDb.OpenRecordset(tQueryStr)

           tStr = "NameID" + tC + "PlaceID" + tC + "PersonPlaceCode"

           gStream.WriteText tStr, adWriteLine

           With tRstPeoplePlace
               .MoveFirst
               Do While Not .EOF
                    If Not IsNull(!c_index_addr_id) Then
                        '
                        tStr = Trim(Str(!c_person_id)) + tC
                            '
                        tStr = tStr + Trim(Str(!c_index_addr_id)) + tC
                        '
                        tStr = tStr + Trim(Str(!c_index_addr_type_code))
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
        ' There are two sources of places: people's index addresses and the c_addr_id in ZZ_PLACE
        '
        cmdSQL.CommandText = "DELETE * FROM ZZ_ADDRESSES"
        cmdSQL.Execute tRecDeleted
        '
        'MsgBox "About to collect first addresses"
        '
        tQueryStr = "INSERT INTO ZZ_ADDRESSES ( c_addr_id, c_name, c_name_chn, x_coord, y_coord ) " + _
                     "SELECT DISTINCT ZZZ_BIOG_MAIN.c_index_addr_id, ZZZ_BIOG_MAIN.c_index_addr_name, ZZZ_BIOG_MAI
N.c_index_addr_chn, " + _
                          "ZZZ_BIOG_MAIN.x_coord, ZZZ_BIOG_MAIN.y_coord " + _
                     "FROM ZZ_SCRATCH_P_TEXT INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_P_TEXT.c_person_id = ZZZ_BIOG_
MAIN.c_personid " + _
                     "WHERE (((ZZZ_BIOG_MAIN.c_index_addr_id)>0))"

        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        'MsgBox "About to collect second addresses"
        '
        tQueryStr = "INSERT INTO ZZ_ADDRESSES ( c_addr_id, c_name, c_name_chn, x_coord, y_coord ) " + _
                     "SELECT DISTINCT ZZ_PLACE.c_addr_id, ZZ_PLACE.c_addr_name, ZZ_PLACE.c_addr_chn, ZZ_PLACE.x_co
ord, ZZ_PLACE.y_coord " + _
                     "FROM ZZ_PLACE " + _
                     "WHERE (((ZZ_PLACE.c_addr_id)>0))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' now process the file
        '
        tQueryStr = "SELECT DISTINCT ZZ_ADDRESSES.c_addr_id, ZZ_ADDRESSES.c_name, ZZ_ADDRESSES.c_name_chn, ZZ_ADD
RESSES.x_coord, " + _
                         "ZZ_ADDRESSES.y_coord " + _
                     "FROM ZZ_ADDRESSES"
        '
        'MsgBox "Opening addresses"
        '
        Set tRstPlace = CurrentDb.OpenRecordset(tQueryStr)
        '
        If tCodeStr = "ascii" Then
             tStr = "PlaceID" + tC + "PlacePY" + tC + "PlaceX" + tC + "PlaceY"
        Else
             tStr = "PlaceID" + tC + "PlacePY" + tC + "PlaceHZ" + tC + "PlaceX" + tC + "PlaceY"
        End If
        gStream.WriteText tStr, adWriteLine

        'MsgBox "Writing addresses"
           '
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

                       If IsNull(!x_coord) Then
                            tStr = tStr + "0.0" + tC
                       Else
                            tStr = tStr + Str(!x_coord) + tC
                       End If

                       If IsNull(!y_coord) Then
                            tStr = tStr + "0.0"
                       Else
                            tStr = tStr + Str(!y_coord)
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
    ' now peoplePlaces
    '
    dlgSaveAs.InitialFileName = "PeoplePlaceRelations_" + tCodeStr + ".csv"
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
        tQueryStr = "SELECT DISTINCT ZZ_PLACE.c_personid, ZZ_PLACE.c_addr_id, ZZ_PLACE.c_assoc_id, ZZ_PLACE.c_fir
styear, " + _
                           "ZZ_PLACE.c_lastyear, ZZ_PLACE.c_rel_type, ZZ_PLACE.c_rel_code, ZZ_PLACE.c_rel_desc, ZZ_P
LACE.c_rel_chn " + _
                       "FROM ZZ_PLACE"

        Set tRstPeoplePlace = CurrentDb.OpenRecordset(tQueryStr)

        If tCodeStr = "ascii" Then
             tStr = "PersonID" + tC + "PlaceID" + tC + "AssocID" + tC + "PersoPlaceRelFirstYear" + tC + "PersonPla
ceRelLastYear" + tC + _
                 "PersonPlaceRelType" + tC + "PersonPlaceRelCode" + tC + "PersonPlaceRelDesc"
        Else
             tStr = "PersonID" + tC + "PlaceID" + tC + "AssocID" + tC + "PersoPlaceRelFirstYear" + tC + "PersonPla
ceRelLastYear" + tC + _
                 "PersonPlaceRelType" + tC + "PersonPlaceRelCode" + tC + "PersonPlaceRelDesc" + tC + "PersonPlaceR
elHZ"
        End If

        gStream.WriteText tStr, adWriteLine

        With tRstPeoplePlace
            .MoveFirst
            Do While Not .EOF
                 If Not IsNull(!c_personid) Then
                     '
                     tStr = Trim(Str(!c_personid)) + tC
                     '
                     tStr = tStr + Trim(Str(!c_addr_id)) + tC
                     '
                     If IsNull(!c_assoc_id) Then
                          tStr = tStr + "0" + tC
                     Else
                          tStr = tStr + Trim(Str(!c_assoc_id)) + tC
                     End If
                     '
                     If IsNull(!c_firstyear) Then
                          tStr = tStr + "0" + tC
                     Else
                          tStr = tStr + Trim(Str(!c_firstyear)) + tC
                     End If
                     '
                     If IsNull(!c_lastyear) Then
                          tStr = tStr + "0" + tC
                     Else
                          tStr = tStr + Trim(Str(!c_lastyear)) + tC
                     End If
                     '
                     If IsNull(!c_rel_type) Then
                          tStr = tStr + "Missing" + tC
                     Else
                          tStr = tStr + Trim(!c_rel_type) + tC
                     End If
                     '
                     If IsNull(!c_rel_code) Then
                          tStr = tStr + "0" + tC
                     Else
                          tStr = tStr + Trim(Str(!c_rel_code)) + tC
                     End If
                     '
                     If IsNull(!c_rel_desc) Then
                          tStr = tStr + "Missing"
                     Else
                          tStr = tStr + Trim(!c_rel_desc)
                     End If
                     '
                     If Not (tCodeStr = "ascii") Then
                          If IsNull(!c_rel_chn) Then
                               tStr = tStr + tC + "Missing"
                          Else
                               tStr = tStr + tC + Trim(!c_rel_chn)
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
        GoTo Exit_CmdNeo4j_Click
    End If
    '
    ' now peoplePlaces
    '
    dlgSaveAs.InitialFileName = "PeoplePlaceRelationCodes_" + tCodeStr + ".csv"
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
        tQueryStr = "SELECT DISTINCT ZZ_PLACE.c_rel_code,ZZ_PLACE.c_rel_type, ZZ_PLACE.c_rel_desc, ZZ_PLACE.c_re
l_chn " + _
                     "FROM ZZ_PLACE WHERE (ZZ_PLACE.c_rel_code > 0)"

           Set tRstPeoplePlace = CurrentDb.OpenRecordset(tQueryStr)

           If tCodeStr = "ascii" Then
                tStr = "PersonPlaceRelCode" + tC + "PersonPlaceRelType" + tC + "PersonPlaceRelDesc"
           Else
                tStr = "PersonPlaceRelCode" + tC + "PersonPlaceRelType" + tC + "PersonPlaceRelDesc" + tC + "PersonPla
ceRelHZ"
           End If

           gStream.WriteText tStr, adWriteLine

           With tRstPeoplePlace
               .MoveFirst
               Do While Not .EOF
                    If Not IsNull(!c_rel_code) Then
                        '
                        tStr = Trim(Str(!c_rel_code)) + tC
                        '
                        If IsNull(!c_rel_type) Then
                             tStr = tStr + "Missing" + tC
                        Else
                             tStr = tStr + Trim(!c_rel_type) + tC
                        End If
                        '
                        If IsNull(!c_rel_desc) Then
                             tStr = tStr + "Missing"
                        Else
                             tStr = tStr + Trim(!c_rel_desc)
                        End If
                        '
                        If Not (tCodeStr = "ascii") Then
                             If IsNull(!c_rel_chn) Then
                                  tStr = tStr + tC + "Missing"
                             Else
                                  tStr = tStr + tC + Trim(!c_rel_chn)
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
        GoTo Exit_CmdNeo4j_Click
    End If
    '
    ' finally, get status codes
    '
    dlgSaveAs.InitialFileName = "IndexAddrCode_" + tCodeStr + ".csv"
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
                tStr = "IndexAddrTypeCode" + tC + "IndexAddrTypeDesc"
           Else
                tStr = "IndexAddrTypeCode" + tC + "IndexAddrTypeDesc" + tC + "IndexAddrTypeDescHZ"
           End If
           gStream.WriteText tStr, adWriteLine
           '
           ' get the codes
           '
           tQueryStr = "SELECT DISTINCT ZZZ_BIOG_MAIN.c_index_addr_type_code, ZZZ_BIOG_MAIN.c_index_addr_type_desc,
" + _
                        "ZZZ_BIOG_MAIN.c_index_addr_type_chn " + _
                    "FROM ZZ_SCRATCH_P_TEXT INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_P_TEXT.c_person_id = ZZZ_BIOG_
MAIN.c_personid " + _
                    "WHERE (ZZZ_BIOG_MAIN.c_index_addr_type_code > 0)"

           Set tRstPeoplePlace = CurrentDb.OpenRecordset(tQueryStr)
           With tRstPeoplePlace
               .MoveFirst
               Do While Not .EOF
                   '
                   tStr = Trim(Str(!c_index_addr_type_code)) + tC
                   '
                   ' entry desc
                   '
                   If IsNull(!c_index_addr_type_desc) Then
                        tStr = tStr + "Missing"
                   Else
                        tStr = tStr + Trim(!c_index_addr_type_desc)
                   End If
                   '
                   ' kin ID
                   '
                   If Not (tCodeStr = "ascii") Then
                        If IsNull(!c_index_addr_type_chn) Then
                             tStr = tStr + tC + "Missing"
                        Else
                             tStr = tStr + tC + Trim(!c_index_addr_type_chn)
                        End If
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
    'Set the object variable to Nothing.
    MsgBox "Finished saving to Neo4j"
    Set dlgSaveAs = Nothing

Exit_CmdNeo4j_Click:
    Exit Sub

Err_CmdNeo4j_Click:
    MsgBox Err.Description
    Resume Exit_CmdNeo4j_Click

End Sub

Private Sub CmdPickBAC_Click()
On Error GoTo Err_CmdPickBAC_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strBAC As String

    stDocName = "frmPickBAC_multi"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog

    If CurrentProject.AllForms("frmPickBAC_multi").IsLoaded Then

           '   if the user selected a group of biographical address codes, ZZ_BIOG_ADDR_CODES will have records

           Forms!frmPickBAC_multi.Form!TxtSelectAll.Visible = True
           Forms!frmPickBAC_multi.Form!TxtSelectAll.SetFocus
           If Forms!frmPickBAC_multi.Form!TxtSelectAll.Value Then
                '
                ' All codes have been selected. This means there is no need to filter by biographical address code
                '
                gFilterBAC = False
           Else
                gFilterBAC = True
           End If
           '
           DoCmd.Close acForm, "frmPickBAC_multi"
    Else
        gFilterBAC = False
    End If
    CmdPickBAC.SetFocus

Exit_CmdPickBAC_Click:
    Exit Sub

Err_CmdPickBAC_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickBAC_Click

End Sub

Private Sub CmdSelectPlace_Click()
On Error GoTo Err_CmdSelectPlace_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strADDR As String

    TxtAddrID.Visible = True
    TxtAddrID.SetFocus
    strADDR = TxtAddrID.Text

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

        gUseADDRID = True
        ChkXYRef.Enabled = True
        ChkSubUnits.Enabled = True

        'MsgBox "Checking zz_addresses"
        ' tRstAddresses.MoveFirst
        Forms!frmPickAddresses_multi.Form!TxtAddrFilter.Visible = True
        Forms!frmPickAddresses_multi.Form!TxtAddrFilter.SetFocus
        If Forms!frmPickAddresses_multi.Form!TxtAddrFilter.Value Then
            '
            TxtAddrID.Value = 0
            strADDR_PY = Forms!frmPickAddresses_multi.Form!TxtFilterPY
            strADDR_CHN = Forms!frmPickAddresses_multi.Form!TxtFilterChn

               If strADDR_CHN = "" Then
                    TxtPlaceChn.Value = "[[Filter]]"
                    TxtPlace.Value = "[[" + strADDR_PY + "]]"
               Else
                    TxtPlaceChn.Value = "[[" + strADDR_CHN + "]]"
                    TxtPlace.Value = "[[Filter]]"
               End If
               gImportPlaces = True
        Else
             Forms!frmPickAddresses_multi.Form!TxtSelectCount.Visible = True
             Forms!frmPickAddresses_multi.Form!TxtSelectCount.SetFocus
             If Forms!frmPickAddresses_multi.Form!TxtSelectCount.Value > 1 Then
                  TxtPlaceChn.Value = "[[" + ChrW(22810) + ChrW(36984) + "]]"
                  TxtPlace.Value = "[[Multi-Select]]"
                  TxtAddrID.Value = 0
             Else
                  ' only one record in ZZ_ADDRESSES: get its field values
                  '
                  Set tRstAddr = CurrentDb.OpenRecordset("ZZ_ADDRESSES", dbOpenDynaset)
                  tRstAddr.MoveFirst
                  'MsgBox "Checking zz_addresses: no records"
                  TxtAddrID.Value = tRstAddr!c_addr_id
                  TxtPlaceChn.Value = tRstAddr!c_name_chn
                  TxtPlace.Value = tRstAddr!c_name
                  tRstAddr.Close
                  Set tRstAddr = Nothing
            End If
             gImportPlaces = False

        End If
        '
        ' now copy the records
        '
        cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_ADDR"
        cmdSQL.Execute tRecDeleted

        cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_ADDR ( c_addr_id ) SELECT DISTINCT " + _
            "ZZ_ADDRESSES.c_addr_id FROM ZZ_ADDRESSES"
        cmdSQL.Execute tRecDeleted

        DoCmd.Close acForm, "frmPickAddresses_multi"

        Call QueryOK

    End If
    CmdSelectPlace.SetFocus
    TxtAddrID.Visible = False

Exit_CmdSelectPlace_Click:
      Exit Sub

Err_CmdSelectPlace_Click:
    MsgBox Err.Description
    Resume Exit_CmdSelectPlace_Click

End Sub

Private Sub CmdQuery_Click()
    On Error GoTo Err_CmdQuery_Click

      Dim tRstPlace As DAO.Recordset, tRstDummy As DAO.Recordset, tUseFirstYear As Boolean, tUseLastYear As Boolean
, _
        tFirstYearStr As String, tLastYearStr As String, tSNA_count As Long
    Dim cmdSQL As ADODB.Command, tRecDeleted As Long, tQueryStr As String, tQueryInsertStr As String, tQueryWhere
Str As String, tQueryFromStr As String

      tSNA_count = 0

      Set cmdSQL = New ADODB.Command
      cmdSQL.ActiveConnection = CurrentProject.Connection
      cmdSQL.CommandType = adCmdText
      '
      ' to clear the table, briefly close and then delete records
      '
      Set tRstPlace = frmZZZ_PLACE.Form.Recordset
      Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_PL", dbOpenDynaset)
      Set frmZZZ_PLACE.Form.Recordset = tRstDummy
      tRstPlace.Close
      '
      cmdSQL.CommandText = "Delete * from ZZ_PLACE"
      cmdSQL.Execute tRecDeleted
      '
      ' now reopen
      '
      Set tRstPlace = CurrentDb.OpenRecordset("ZZ_PLACE", dbOpenDynaset)
      Set frmZZZ_PLACE.Form.Recordset = tRstPlace
      '
      ' ZZ_SCRATCH_PLACE_AGG
      '
      Set tRstPlace = ZZ_SCRATCH_PLACE_AGG.Form.Recordset
      Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_PLACE_AGG", dbOpenDynaset)
      Set ZZ_SCRATCH_PLACE_AGG.Form.Recordset = tRstDummy
      tRstPlace.Close
      '
      cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PLACE_AGG"
      cmdSQL.Execute tRecDeleted
      '
      ' now reopen
      '
      Set tRstPlace = CurrentDb.OpenRecordset("ZZ_SCRATCH_PLACE_AGG", dbOpenDynaset)
      Set ZZ_SCRATCH_PLACE_AGG.Form.Recordset = tRstPlace
      '
      ' ZZ_SCRATCH_PLACE_PEOPLE
      '
      Set tRstPlace = ZZ_SCRATCH_PLACE_PEOPLE.Form.Recordset
      Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_PLACE_PEOPLE", dbOpenDynaset)
      Set ZZ_SCRATCH_PLACE_PEOPLE.Form.Recordset = tRstDummy
      tRstPlace.Close
      '
      cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PLACE_PEOPLE"
      cmdSQL.Execute tRecDeleted
      '
      ' now reopen
      '
      Set tRstPlace = CurrentDb.OpenRecordset("ZZ_SCRATCH_PLACE_PEOPLE", dbOpenDynaset)
      Set ZZ_SCRATCH_PLACE_PEOPLE.Form.Recordset = tRstPlace
      '
      ' start with BIOG_ADDR
      '
      ' define the rel_type
      ' DoCmd.RunSQL "ALTER TABLE ZZ_PLACE ALTER COLUMN c_rel_type SET DEFAULT 'BIOGRAPHY'"
      '
      ' get the index year strings
      '
      tUseFirstYear = False
      tUseLastYear = False
      tFirstYearStr = ""
      tLastYearStr = ""
    If gUseIndexYears Then
         If Not IsNull(TxtFromYear.Value) Then
             tFirstYearStr = Str(TxtFromYear.Value)
             tUseFirstYear = True
             'MsgBox "First year = " + tFirstYearStr
         End If
         If Not IsNull(TxtToYear.Value) Then
             tLastYearStr = Str(TxtToYear.Value)
             tUseLastYear = True
             'MsgBox "Last year = " + tLastYearStr
         End If
    End If
    '
    ' preserve the initial list
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_ADDR_LIST"
    cmdSQL.Execute tRecDeleted
    '
    cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_ADDR_LIST ( c_addr_id ) SELECT DISTINCT c_addr_id FROM ZZ_SCRATC
H_ADDR"
    cmdSQL.Execute tRecDeleted
    '
    '
    ' get the subordinate units, if selected
    '
    tQueryStr = "DELETE * FROM ZZ_ADDRESSES"
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    If ChkSubUnits.Value Then
         tQueryStr = "INSERT INTO ZZ_ADDRESSES ( c_addr_id ) " + _
             "SELECT DISTINCT ZZZ_BELONGS_TO.c_addr_id " + _
             "FROM ZZ_SCRATCH_ADDR INNER JOIN ZZZ_BELONGS_TO ON " + _
             "ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_BELONGS_TO.c_belongs_to"
    Else
         tQueryStr = "INSERT INTO ZZ_ADDRESSES ( c_addr_id ) SELECT DISTINCT c_addr_id FROM ZZ_SCRATCH_ADDR"
    End If

     cmdSQL.CommandText = tQueryStr
     cmdSQL.Execute tRecCount
     '
     ' zap ZZ_SCRATCH_ADDR
     '
     tQueryStr = "DELETE * FROM ZZ_SCRATCH_ADDR"
     cmdSQL.CommandText = tQueryStr
     cmdSQL.Execute tRecDeleted
     '
     ' copy the list
     '
     tQueryStr = "INSERT INTO ZZ_SCRATCH_ADDR ( c_addr_id )SELECT DISTINCT ZZ_ADDRESSES.c_addr_id FROM ZZ_ADDRESSE
S"
     cmdSQL.CommandText = tQueryStr
     cmdSQL.Execute tRecDeleted
     '
     ' clean up by zapping the temporary list
     '
     tQueryStr = "DELETE * FROM ZZ_ADDRESSES"
     cmdSQL.CommandText = tQueryStr
     cmdSQL.Execute tRecDeleted
     '
     ' need to deal with XY ref

     If ChkXYRef.Value Then
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
                     "FROM ADDR_CODES, ZZ_SCRATCH_ADDR INNER JOIN ADDR_CODES AS ADDR_CODES_1 ON " + _
                     "ZZ_SCRATCH_ADDR.c_addr_id = ADDR_CODES_1.c_addr_id " + _
                     "WHERE (((ADDR_CODES.x_coord)>=([ADDR_CODES_1].[x_coord]-0.03) And " + _
                    "(ADDR_CODES.x_coord)<=([ADDR_CODES_1].[x_coord]+0.03)) AND " + _
                    "((ADDR_CODES.y_coord)>=([ADDR_CODES_1].[y_coord]-0.03) And " + _
                    "(ADDR_CODES.y_coord)<=([ADDR_CODES_1].[y_coord]+0.03)))"

        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' now get the address IDs from the initial list that have no xy coordinates
        '
        tQueryStr = "INSERT INTO ZZ_ADDRESSES ( c_addr_id ) SELECT ZZ_SCRATCH_ADDR.c_addr_id " + _
            "FROM ZZ_SCRATCH_ADDR INNER JOIN ADDR_CODES ON " + _
            "ZZ_SCRATCH_ADDR.c_addr_id = ADDR_CODES.c_addr_id " + _
            "WHERE (((ADDR_CODES.x_coord) Is Null)) OR (((ADDR_CODES.y_coord) Is Null))"
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' zap ZZ_SCRATCH_ADDR
        '
        tQueryStr = "DELETE * FROM ZZ_SCRATCH_ADDR"
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' copy the list
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_ADDR ( c_addr_id )SELECT DISTINCT ZZ_ADDRESSES.c_addr_id " + _
            "FROM ZZ_ADDRESSES"
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' clean up by zapping the temporary list
        '
        tQueryStr = "DELETE * FROM ZZ_ADDRESSES"
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
    End If

    ' For the individual

    If Me.ChkIndividual.Value Then
        tQueryInsertStr = "INSERT INTO ZZ_PLACE ( c_personid, c_name, c_name_chn, c_index_year, c_female, c_dy, c
_dynasty, c_dynasty_chn, " + _
             "c_addr_id, c_addr_name, c_addr_chn, x_coord, y_coord, " + _
             "c_rel_code, c_rel_desc, c_rel_chn, c_firstyear, c_lastyear, c_assoc_name, c_assoc_chn, c_assoc_id, c
_rel_type, c_source ) " + _
             "SELECT ZZZ_BIOG_ADDR_DATA.c_personid, ZZZ_BIOG_MAIN.c_name, ZZZ_BIOG_MAIN.c_name_chn, ZZZ_BIOG_MAIN.
c_index_year, ZZZ_BIOG_MAIN.c_female, " + _
             "ZZZ_BIOG_MAIN.c_dy, ZZZ_BIOG_MAIN.c_dynasty, ZZZ_BIOG_MAIN.c_dynasty_chn, " + _
             "ZZZ_BIOG_ADDR_DATA.c_addr_id, ZZZ_BIOG_ADDR_DATA.c_addr_name, ZZZ_BIOG_ADDR_DATA.c_addr_chn, ZZZ_BIO
G_ADDR_DATA.x_coord, ZZZ_BIOG_ADDR_DATA.y_coord, " + _
             "ZZZ_BIOG_ADDR_DATA.c_addr_type, ZZZ_BIOG_ADDR_DATA.c_addr_desc, ZZZ_BIOG_ADDR_DATA.c_addr_desc_chn,
ZZZ_BIOG_ADDR_DATA.c_firstyear, " + _
             "ZZZ_BIOG_ADDR_DATA.c_lastyear, '[N/A]' AS c_assoc_name, '[N/A]' AS c_assoc_chn, 0 AS c_assoc_id, 'Bi
ography' as c_rel_type, " + _
             "ZZZ_BIOG_ADDR_DATA.c_source "
        If gFilterBAC Then
             tQueryFromStr = "FROM ((ZZZ_BIOG_ADDR_DATA INNER JOIN ZZ_SCRATCH_ADDR ON ZZZ_BIOG_ADDR_DATA.c_addr_id
 = ZZ_SCRATCH_ADDR.c_addr_id) " + _
                 "INNER JOIN ZZZ_BIOG_MAIN ON ZZZ_BIOG_ADDR_DATA.c_personid = ZZZ_BIOG_MAIN.c_personid) INNER JOIN
 ZZ_BIOG_ADDR_CODES ON " + _
                 "ZZZ_BIOG_ADDR_DATA.c_addr_type = ZZ_BIOG_ADDR_CODES.c_addr_type "
        Else
             tQueryFromStr = "FROM (ZZZ_BIOG_ADDR_DATA INNER JOIN ZZ_SCRATCH_ADDR ON ZZZ_BIOG_ADDR_DATA.c_addr_id
= ZZ_SCRATCH_ADDR.c_addr_id) " + _
                 "INNER JOIN ZZZ_BIOG_MAIN ON ZZZ_BIOG_ADDR_DATA.c_personid = ZZZ_BIOG_MAIN.c_personid "
        End If

        tQueryWhereStr = ""

        If tUseFirstYear Or tUseLastYear Then
            If tUseFirstYear And tUseLastYear Then
                tQueryWhereStr = "WHERE (((ZZZ_BIOG_MAIN.c_index_year)>= " + tFirstYearStr + " And (ZZZ_BIOG_MAIN
.c_index_year)<= " + tLastYearStr + "))"
            ElseIf tUseFirstYear Then
                tQueryWhereStr = "WHERE (((ZZZ_BIOG_MAIN.c_index_year)>= " + tFirstYearStr + "))"
            ElseIf tUseLastYear Then
                tQueryWhereStr = "WHERE (((ZZZ_BIOG_MAIN.c_index_year)<= " + tLastYearStr + "))"
            End If
        ElseIf gUseDynasties Then
            '
            ' five possibilities (all, just from, just to, both from and to, and a cluelessly unset parameter)
            '
            If gFromDynasty > -2 And gFromDynasty <> gToDynasty Then
                If gFilterBAC Then
                     tQueryFromStr = "FROM ZZ_BIOG_ADDR_CODES INNER JOIN (DYNASTIES INNER JOIN ((ZZZ_BIOG_ADDR_DAT
A INNER JOIN ZZ_SCRATCH_ADDR " + _
                         "ON ZZZ_BIOG_ADDR_DATA.c_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) INNER JOIN ZZZ_BIOG_MAIN "
+ _
                         "ON ZZZ_BIOG_ADDR_DATA.c_personid = ZZZ_BIOG_MAIN.c_personid) ON DYNASTIES.c_dy = ZZZ_BIO
G_MAIN.c_dy) " + _
                         "ON ZZ_BIOG_ADDR_CODES.c_addr_type = ZZZ_BIOG_ADDR_DATA.c_addr_type "
                Else
                     tQueryFromStr = "FROM DYNASTIES INNER JOIN ((ZZZ_BIOG_ADDR_DATA INNER JOIN ZZ_SCRATCH_ADDR "
+ _
                         "ON ZZZ_BIOG_ADDR_DATA.c_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) INNER JOIN ZZZ_BIOG_MAIN "
+ _
                         "ON ZZZ_BIOG_ADDR_DATA.c_personid = ZZZ_BIOG_MAIN.c_personid) " + _
                         "ON DYNASTIES.c_dy = ZZZ_BIOG_MAIN.c_dy "
                End If
            End If

             If gFromDynasty = -2 Then
                  tQueryWhereStr = "Where ((ZZZ_BIOG_MAIN.c_dy) > 0 ) "
             ElseIf gFromDynasty = -1 And gToDynasty > 0 Then
                  tQueryWhereStr = "WHERE ((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
                  'tQueryFromStr = "FROM DYNASTIES INNER JOIN ((ZZZ_BIOG_ADDR_DATA INNER JOIN ZZ_SCRATCH_ADDR " + _
                      "ON ZZZ_BIOG_ADDR_DATA.c_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) INNER JOIN ZZZ_BIOG_MAIN " + _
                      "ON ZZZ_BIOG_ADDR_DATA.c_personid = ZZZ_BIOG_MAIN.c_personid) " + _
                      "ON DYNASTIES.c_dy = ZZZ_BIOG_MAIN.c_dy "
             ElseIf gFromDynasty > 0 And gToDynasty = -1 Then
                  tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") "
                  'tQueryFromStr = "FROM DYNASTIES INNER JOIN ((ZZZ_BIOG_ADDR_DATA INNER JOIN ZZ_SCRATCH_ADDR " + _
                      "ON ZZZ_BIOG_ADDR_DATA.c_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) INNER JOIN ZZZ_BIOG_MAIN " + _
                      "ON ZZZ_BIOG_ADDR_DATA.c_personid = ZZZ_BIOG_MAIN.c_personid) " + _
                      "ON DYNASTIES.c_dy = ZZZ_BIOG_MAIN.c_dy "
             ElseIf gFromDynasty = gToDynasty And gFromDynasty > 0 Then
                  tQueryWhereStr = "WHERE ((ZZZ_BIOG_MAIN.c_dy) = " + Str(gFromDynasty) + " ) "
             ElseIf gFromDynasty > 0 And gToDynasty > 0 Then
                  tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") AND " + _
                      "((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
                  'tQueryFromStr = "FROM DYNASTIES INNER JOIN ((ZZZ_BIOG_ADDR_DATA INNER JOIN ZZ_SCRATCH_ADDR " + _
                      "ON ZZZ_BIOG_ADDR_DATA.c_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) INNER JOIN ZZZ_BIOG_MAIN " + _
                      "ON ZZZ_BIOG_ADDR_DATA.c_personid = ZZZ_BIOG_MAIN.c_personid) " + _
                      "ON DYNASTIES.c_dy = ZZZ_BIOG_MAIN.c_dy "
             Else
                  tQueryWhereStr = ""
             End If

         End If

        cmdSQL.CommandText = tQueryInsertStr + tQueryFromStr + tQueryWhereStr
        cmdSQL.Execute tRecDeleted
    End If

    '   for office postings

    If Me.ChkOffice.Value Then
        tQueryInsertStr = "INSERT INTO ZZ_PLACE ( c_personid, c_name, c_name_chn, c_index_year, c_female, c_dy, c
_dynasty, c_dynasty_chn, " + _
                 "c_addr_id, c_addr_name, c_addr_chn, x_coord, y_coord, c_rel_type, c_rel_code, c_rel_desc, c_rel_
chn, c_firstyear, c_lastyear, c_source ) " + _
                 "SELECT ZZZ_POSTED_TO_ADDR_DATA.c_personid, ZZZ_POSTED_TO_ADDR_DATA.c_person_name, ZZZ_POSTED_TO_
ADDR_DATA.c_person_name_chn, " + _
                 "ZZZ_POSTED_TO_ADDR_DATA.c_index_year, ZZZ_POSTED_TO_ADDR_DATA.c_female, ZZZ_POSTED_TO_ADDR_DATA.
c_person_dy, ZZZ_POSTED_TO_ADDR_DATA.c_person_dynasty, " + _
                 "ZZZ_POSTED_TO_ADDR_DATA.c_person_dy_chn, ZZZ_POSTED_TO_ADDR_DATA.c_office_addr_id, ZZZ_POSTED_TO
_ADDR_DATA.c_office_addr_name, " + _
                 "ZZZ_POSTED_TO_ADDR_DATA.c_office_addr_chn, ZZZ_POSTED_TO_ADDR_DATA.office_x_coord, " + _
                 "ZZZ_POSTED_TO_ADDR_DATA.office_y_coord, 'Office Place' AS c_rel_type, ZZZ_POSTED_TO_ADDR_DATA.c_
office_id, " + _
                 "ZZZ_POSTED_TO_ADDR_DATA.c_office_trans, ZZZ_POSTED_TO_ADDR_DATA.c_office_chn, ZZZ_POSTED_TO_ADDR
_DATA.c_firstyear, " + _
                 "ZZZ_POSTED_TO_ADDR_DATA.c_lastyear, ZZZ_POSTED_TO_ADDR_DATA.c_source "
        tQueryFromStr = "FROM ZZ_SCRATCH_ADDR INNER JOIN ZZZ_POSTED_TO_ADDR_DATA ON ZZ_SCRATCH_ADDR.c_addr_id = Z
ZZ_POSTED_TO_ADDR_DATA.c_office_addr_id "

         tQueryWhereStr = ""

         If tUseFirstYear Or tUseLastYear Then
             If tUseFirstYear And tUseLastYear Then
                  tQueryWhereStr = "WHERE (((ZZZ_POSTED_TO_ADDR_DATA.c_index_year)>= " + tFirstYearStr + _
                          " And (ZZZ_POSTED_TO_ADDR_DATA.c_index_year)<= " + tLastYearStr + "))"
              ElseIf tUseFirstYear Then
                  tQueryWhereStr = "WHERE (((ZZZ_POSTED_TO_ADDR_DATA.c_index_year)>= " + tFirstYearStr + "))"
              ElseIf tUseLastYear Then
                  tQueryWhereStr = "WHERE (((ZZZ_POSTED_TO_ADDR_DATA.c_index_year)<= " + tLastYearStr + "))"
              End If
          ElseIf gUseDynasties Then
                  '
              ' five possibilities (all, just from, just to, both from and to, and a cluelessly unset parameter)
              '
              If gFromDynasty = -2 Then
                  tQueryWhereStr = "Where ((ZZZ_POSTED_TO_ADDR_DATA.c_person_dy) > 0 ) "
              ElseIf gFromDynasty = -1 And gToDynasty > 0 Then
                  tQueryWhereStr = "WHERE ((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
                  tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZ_SCRATCH_ADDR INNER JOIN ZZZ_POSTED_TO_ADDR_DATA "
+ _
                      "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_POSTED_TO_ADDR_DATA.c_office_addr_id) " + _
                      "ON DYNASTIES.c_dy = ZZZ_POSTED_TO_ADDR_DATA.c_person_dy "
              ElseIf gFromDynasty > 0 And gToDynasty = -1 Then
                  tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") "
                  tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZ_SCRATCH_ADDR INNER JOIN ZZZ_POSTED_TO_ADDR_DATA "
+ _
                      "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_POSTED_TO_ADDR_DATA.c_office_addr_id) " + _
                      "ON DYNASTIES.c_dy = ZZZ_POSTED_TO_ADDR_DATA.c_person_dy "
              ElseIf gFromDynasty = gToDynasty And gFromDynasty > 0 Then
                  tQueryWhereStr = "WHERE ((ZZZ_POSTED_TO_ADDR_DATA.c_person_dy) = " + Str(gFromDynasty) + ") "
              ElseIf gFromDynasty > 0 And gToDynasty > 0 Then
                  tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") AND " + _
                      "((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
                  tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZ_SCRATCH_ADDR INNER JOIN ZZZ_POSTED_TO_ADDR_DATA "
+ _
                      "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_POSTED_TO_ADDR_DATA.c_office_addr_id) " + _
                      "ON DYNASTIES.c_dy = ZZZ_POSTED_TO_ADDR_DATA.c_person_dy "
              Else
                  tQueryWhereStr = ""
              End If
          End If

          cmdSQL.CommandText = tQueryInsertStr + tQueryFromStr + tQueryWhereStr
          cmdSQL.Execute tRecDeleted
      End If

      ' For entry

    If Me.ChkEntry.Value Then
        tQueryInsertStr = "INSERT INTO ZZ_PLACE ( c_personid, c_name, c_name_chn, c_index_year, c_female, c_dy, c
_dynasty, c_dynasty_chn, " + _
                "c_addr_id, c_addr_name, c_addr_chn, x_coord, y_coord, c_firstyear, " + _
                "c_rel_type, c_rel_code, c_rel_desc, c_rel_chn, c_source ) " + _
            "SELECT ZZZ_ENTRY_DATA.c_personid, ZZZ_ENTRY_DATA.c_name, ZZZ_ENTRY_DATA.c_name_chn, ZZZ_ENTRY_DATA.c
_index_year, ZZZ_ENTRY_DATA.c_female, ZZZ_ENTRY_DATA.c_dy, " + _
                "ZZZ_ENTRY_DATA.c_dynasty, ZZZ_ENTRY_DATA.c_dynasty_chn, ZZZ_ENTRY_DATA.c_entry_addr_id, ZZZ_ENTR
Y_DATA.c_entry_addr_name, " + _
                "ZZZ_ENTRY_DATA.c_entry_addr_chn, ZZZ_ENTRY_DATA.c_entry_xcoord, ZZZ_ENTRY_DATA.c_entry_ycoord, Z
ZZ_ENTRY_DATA.c_year, " + _
                "'Entry' AS c_rel_type, ZZZ_ENTRY_DATA.c_entry_code, ZZZ_ENTRY_DATA.c_entry_desc, ZZZ_ENTRY_DATA.
c_entry_desc_chn, ZZZ_ENTRY_DATA.c_source "
        tQueryFromStr = "FROM ZZ_SCRATCH_ADDR INNER JOIN ZZZ_ENTRY_DATA ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_ENTRY_
DATA.c_entry_addr_id "

          tQueryWhereStr = ""

          If tUseFirstYear Or tUseLastYear Then
              If tUseFirstYear And tUseLastYear Then
                  tQueryWhereStr = tQueryWhereStr + "WHERE (((ZZZ_ENTRY_DATA.c_index_year)>= " + tFirstYearStr + _
                          " And (ZZZ_ENTRY_DATA.c_index_year)<= " + tLastYearStr + "))"
              ElseIf tUseFirstYear Then
                  tQueryWhereStr = tQueryWhereStr + "WHERE (((ZZZ_ENTRY_DATA.c_index_year)>= " + tFirstYearStr + ")
)"
              ElseIf tUseLastYear Then
                  tQueryWhereStr = tQueryWhereStr + "WHERE (((ZZZ_ENTRY_DATA.c_index_year)<= " + tLastYearStr + "))
"
              End If
          ElseIf gUseDynasties Then
                  '
              ' five possibilities (all, just from, just to, both from and to, and a cluelessly unset parameter)
              '
              If gFromDynasty = -2 Then
                  tQueryWhereStr = "Where ((ZZZ_ENTRY_DATA.c_dy) > 0 ) "
               ElseIf gFromDynasty = -1 And gToDynasty > 0 Then
                    tQueryWhereStr = "WHERE ((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
                    tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZ_SCRATCH_ADDR INNER JOIN ZZZ_ENTRY_DATA " + _
                        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_ENTRY_DATA.c_entry_addr_id) " + _
                        "ON DYNASTIES.c_dy = ZZZ_ENTRY_DATA.c_dy "
               ElseIf gFromDynasty > 0 And gToDynasty = -1 Then
                    tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") "
                    tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZ_SCRATCH_ADDR INNER JOIN ZZZ_ENTRY_DATA " + _
                        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_ENTRY_DATA.c_entry_addr_id) " + _
                        "ON DYNASTIES.c_dy = ZZZ_ENTRY_DATA.c_dy "
               ElseIf gFromDynasty = gToDynasty And gFromDynasty > 0 Then
                    tQueryWhereStr = "WHERE ((ZZZ_ENTRY_DATA.c_dy) = " + Str(gFromDynasty) + ") "
               ElseIf gFromDynasty > 0 And gToDynasty > 0 Then
                    tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") AND " + _
                        "((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
                    tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZ_SCRATCH_ADDR INNER JOIN ZZZ_ENTRY_DATA " + _
                        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_ENTRY_DATA.c_entry_addr_id) " + _
                        "ON DYNASTIES.c_dy = ZZZ_ENTRY_DATA.c_dy "
               Else
                    tQueryWhereStr = ""
               End If
           End If

           cmdSQL.CommandText = tQueryInsertStr + tQueryFromStr + tQueryWhereStr
           cmdSQL.Execute tRecDeleted
       End If

       ' For kinship

    If Me.ChkKin.Value Then
        tQueryInsertStr = "INSERT INTO ZZ_PLACE ( c_personid, c_name, c_name_chn, c_index_year, c_female, c_dy, c
_dynasty, c_dynasty_chn, " + _
                "c_addr_id, c_addr_name, c_addr_chn, c_assoc_id, c_assoc_name, " + _
                "c_assoc_chn, c_rel_type, c_rel_code, c_rel_desc, c_rel_chn, x_coord, y_coord, c_assoc_index_year
, assoc_x_coord, assoc_y_coord, c_source ) " + _
            "SELECT ZZZ_KIN_BIOG_ADDR.c_personid, ZZZ_KIN_BIOG_ADDR.c_person_name, ZZZ_KIN_BIOG_ADDR.c_person_nam
e_chn, ZZZ_KIN_BIOG_ADDR.c_index_year, " + _
                "ZZZ_KIN_BIOG_ADDR.c_female, ZZZ_KIN_BIOG_ADDR.c_dy, ZZZ_KIN_BIOG_ADDR.c_dynasty, ZZZ_KIN_BIOG_AD
DR.c_dynasty_chn, " + _
                "ZZZ_KIN_BIOG_ADDR.c_node_addr_id, ZZZ_KIN_BIOG_ADDR.c_node_addr_name, ZZZ_KIN_BIOG_ADDR.c_node_a
ddr_chn, ZZZ_KIN_BIOG_ADDR.c_node_id, " + _
                "ZZZ_KIN_BIOG_ADDR.c_node_name, ZZZ_KIN_BIOG_ADDR.c_node_chn, 'Kinship' AS c_rel_type, ZZZ_KIN_BI
OG_ADDR.c_link_code, ZZZ_KIN_BIOG_ADDR.c_link_desc, " + _
                "ZZZ_KIN_BIOG_ADDR.c_link_chn, ZZZ_KIN_BIOG_ADDR.person_x_coord, ZZZ_KIN_BIOG_ADDR.person_y_coord
, ZZZ_KIN_BIOG_ADDR.c_node_index_year, " + _
                "ZZZ_KIN_BIOG_ADDR.node_xcoord, ZZZ_KIN_BIOG_ADDR.node_ycoord, ZZZ_KIN_BIOG_ADDR.c_source "
        tQueryFromStr = "FROM ZZZ_KIN_BIOG_ADDR INNER JOIN ZZ_SCRATCH_ADDR ON ZZZ_KIN_BIOG_ADDR.c_node_addr_id =
ZZ_SCRATCH_ADDR.c_addr_id "

           tQueryWhereStr = ""

           If tUseFirstYear Or tUseLastYear Then
               If tUseFirstYear And tUseLastYear Then
                   tQueryWhereStr = tQueryWhereStr + "WHERE (((ZZZ_KIN_BIOG_ADDR.c_index_year)>= " + tFirstYearStr +
 _
                           " And (ZZZ_KIN_BIOG_ADDR.c_index_year)<= " + tLastYearStr + "))"
               ElseIf tUseFirstYear Then
                   tQueryWhereStr = tQueryWhereStr + "WHERE (((ZZZ_KIN_BIOG_ADDR.c_index_year)>= " + tFirstYearStr +
 "))"
               ElseIf tUseLastYear Then
                   tQueryWhereStr = tQueryWhereStr + "WHERE (((ZZZ_KIN_BIOG_ADDR.c_index_year)<= " + tLastYearStr +
"))"
               End If
           ElseIf gUseDynasties Then
                   '
               ' five possibilities (all, just from, just to, both from and to, and a cluelessly unset parameter)
               '
               If gFromDynasty = -2 Then
                   tQueryWhereStr = "Where ((ZZZ_KIN_BIOG_ADDR.c_dy) > 0 ) "
               ElseIf gFromDynasty = -1 And gToDynasty > 0 Then
                   tQueryWhereStr = "WHERE ((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
                   tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZZ_KIN_BIOG_ADDR INNER JOIN ZZ_SCRATCH_ADDR " + _
                       "ON ZZZ_KIN_BIOG_ADDR.c_node_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) " + _
                       "ON DYNASTIES.c_dy = ZZZ_KIN_BIOG_ADDR.c_dy "
               ElseIf gFromDynasty > 0 And gToDynasty = -1 Then
                   tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") "
                   tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZZ_KIN_BIOG_ADDR INNER JOIN ZZ_SCRATCH_ADDR " + _
                       "ON ZZZ_KIN_BIOG_ADDR.c_node_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) " + _
                       "ON DYNASTIES.c_dy = ZZZ_KIN_BIOG_ADDR.c_dy "
               ElseIf gFromDynasty = gToDynasty And gFromDynasty > 0 Then
                   tQueryWhereStr = "WHERE ((ZZZ_KIN_BIOG_ADDR.c_dy) = " + Str(gFromDynasty) + ") "
              ElseIf gFromDynasty > 0 And gToDynasty > 0 Then
                   tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") AND " + _
                       "((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
                   tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZZ_KIN_BIOG_ADDR INNER JOIN ZZ_SCRATCH_ADDR " + _
                       "ON ZZZ_KIN_BIOG_ADDR.c_node_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) " + _
                       "ON DYNASTIES.c_dy = ZZZ_KIN_BIOG_ADDR.c_dy "
              Else
                   tQueryWhereStr = ""
              End If
          End If

          cmdSQL.CommandText = tQueryInsertStr + tQueryFromStr + tQueryWhereStr
          cmdSQL.Execute tRecDeleted

          tSNA_count = tRecDeleted

      End If

      ' For the institutions

    If Me.ChkInstitution.Value Then
         tQueryInsertStr = "INSERT INTO ZZ_PLACE ( c_personid, c_name, c_name_chn, c_index_year, c_female, c_dy, c
_dynasty, c_dynasty_chn, " + _
                 "c_addr_id, c_addr_name, c_assoc_chn, c_assoc_name, " + _
                 "c_addr_chn, c_assoc_id, c_firstyear, c_lastyear, c_rel_type, c_rel_code, c_rel_desc, c_rel_chn,
x_coord, y_coord, c_source ) " + _
             "SELECT ZZZ_BIOG_INST_DATA.c_personid, ZZZ_BIOG_INST_DATA.c_name, ZZZ_BIOG_INST_DATA.c_name_chn, ZZZ_
BIOG_INST_DATA.c_index_year, " + _
                 "ZZZ_BIOG_INST_DATA.c_female, ZZZ_BIOG_INST_DATA.c_dy, ZZZ_BIOG_INST_DATA.c_dynasty, ZZZ_BIOG_INS
T_DATA.c_dynasty_chn, " + _
                 "ZZ_SCRATCH_ADDR.c_addr_id, ZZZ_BIOG_INST_DATA.c_inst_addr_pinyin, ZZZ_BIOG_INST_DATA.c_inst_name
_hz, ZZZ_BIOG_INST_DATA.c_inst_name_py, " + _
                 "ZZZ_BIOG_INST_DATA.c_inst_addr_chn, 0 AS c_assoc_id, ZZZ_BIOG_INST_DATA.c_bi_begin_year, ZZZ_BIO
G_INST_DATA.c_bi_end_year, " + _
                 "'Institution' AS c_rel_type, ZZZ_BIOG_INST_DATA.c_bi_role_code, ZZZ_BIOG_INST_DATA.c_bi_role_des
c, " + _
                 "ZZZ_BIOG_INST_DATA.c_bi_role_chn, ZZZ_BIOG_INST_DATA.inst_xcoord, ZZZ_BIOG_INST_DATA.inst_ycoord
, ZZZ_BIOG_INST_DATA.c_source "
         tQueryFromStr = "FROM ZZZ_BIOG_INST_DATA INNER JOIN ZZ_SCRATCH_ADDR ON ZZZ_BIOG_INST_DATA.c_inst_addr_id
= ZZ_SCRATCH_ADDR.c_addr_id "

          tQueryWhereStr = ""

          If tUseFirstYear Or tUseLastYear Then
              If tUseFirstYear And tUseLastYear Then
                  tQueryWhereStr = tQueryWhereStr + "WHERE (((ZZZ_BIOG_INST_DATA.c_index_year)>= " + tFirstYearStr
+ _
                           " And (ZZZ_BIOG_INST_DATA.c_index_year)<= " + tLastYearStr + "))"
               ElseIf tUseFirstYear Then
                   tQueryWhereStr = tQueryWhereStr + "WHERE (((ZZZ_BIOG_INST_DATA.c_index_year)>= " + tFirstYearStr
+ "))"
               ElseIf tUseLastYear Then
                   tQueryWhereStr = tQueryWhereStr + "WHERE (((ZZZ_BIOG_INST_DATA.c_index_year)<= " + tLastYearStr +
 "))"
              End If
          ElseIf gUseDynasties Then
                  '
              ' five possibilities (all, just from, just to, both from and to, and a cluelessly unset parameter)
              '
              If gFromDynasty = -2 Then
                  tQueryWhereStr = "Where ((ZZZ_BIOG_INST_DATA.c_dy) > 0 ) "
              ElseIf gFromDynasty = -1 And gToDynasty > 0 Then
                  tQueryWhereStr = "WHERE ((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
                  tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZZ_BIOG_INST_DATA INNER JOIN ZZ_SCRATCH_ADDR " + _
                      "ON ZZZ_BIOG_INST_DATA.c_inst_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) " + _
                      "ON DYNASTIES.c_dy = ZZZ_BIOG_INST_DATA.c_dy "
              ElseIf gFromDynasty > 0 And gToDynasty = -1 Then
                  tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") "
                  tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZZ_BIOG_INST_DATA INNER JOIN ZZ_SCRATCH_ADDR " + _
                      "ON ZZZ_BIOG_INST_DATA.c_inst_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) " + _
                      "ON DYNASTIES.c_dy = ZZZ_BIOG_INST_DATA.c_dy "
              ElseIf gFromDynasty = gToDynasty And gFromDynasty > 0 Then
                  tQueryWhereStr = "WHERE ((ZZZ_BIOG_INST_DATA.c_dy) = " + Str(gFromDynasty) + ") "
              ElseIf gFromDynasty > 0 And gToDynasty > 0 Then
                  tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") AND " + _
                      "((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
                  tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZZ_BIOG_INST_DATA INNER JOIN ZZ_SCRATCH_ADDR " + _
                      "ON ZZZ_BIOG_INST_DATA.c_inst_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) " + _
                      "ON DYNASTIES.c_dy = ZZZ_BIOG_INST_DATA.c_dy "
               Else
                   tQueryWhereStr = ""
               End If
           End If

        cmdSQL.CommandText = tQueryInsertStr + tQueryFromStr + tQueryWhereStr
        cmdSQL.Execute tRecDeleted
    End If

    ' For associates

    If Me.ChkAssocPerson.Value Then
        tQueryInsertStr = "INSERT INTO ZZ_PLACE ( c_personid, c_name, c_name_chn, c_index_year, c_female, c_dy, c
_dynasty, c_dynasty_chn, " + _
                "c_addr_id, c_addr_name, c_addr_chn, c_assoc_id, c_assoc_name, " + _
                "c_assoc_chn, c_rel_type, c_rel_code, c_rel_desc, c_rel_chn, x_coord, y_coord, c_assoc_index_year
, assoc_x_coord, assoc_y_coord, c_source ) " + _
            "SELECT ZZZ_NONKIN_BIOG_ADDR.c_personid, ZZZ_NONKIN_BIOG_ADDR.c_person_name, ZZZ_NONKIN_BIOG_ADDR.c_p
erson_name_chn, ZZZ_NONKIN_BIOG_ADDR.c_index_year, " + _
                "ZZZ_NONKIN_BIOG_ADDR.c_female, ZZZ_NONKIN_BIOG_ADDR.c_dy, ZZZ_NONKIN_BIOG_ADDR.c_dynasty, ZZZ_NO
NKIN_BIOG_ADDR.c_dynasty_chn, " + _
                "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id, ZZZ_NONKIN_BIOG_ADDR.c_node_addr_name, ZZZ_NONKIN_BIOG_ADDR
.c_node_addr_chn, ZZZ_NONKIN_BIOG_ADDR.c_node_id, " + _
                "ZZZ_NONKIN_BIOG_ADDR.c_node_name, ZZZ_NONKIN_BIOG_ADDR.c_node_chn, 'Associate Place' AS c_rel_ty
pe, ZZZ_NONKIN_BIOG_ADDR.c_link_code, " + _
                "ZZZ_NONKIN_BIOG_ADDR.c_link_desc, ZZZ_NONKIN_BIOG_ADDR.c_link_chn, ZZZ_NONKIN_BIOG_ADDR.person_x
_coord, ZZZ_NONKIN_BIOG_ADDR.person_y_coord, " + _
                "ZZZ_NONKIN_BIOG_ADDR.c_node_index_year, ZZZ_NONKIN_BIOG_ADDR.node_xcoord, ZZZ_NONKIN_BIOG_ADDR.n
ode_ycoord, ZZZ_NONKIN_BIOG_ADDR.c_source "
        tQueryFromStr = "FROM ZZZ_NONKIN_BIOG_ADDR INNER JOIN ZZ_SCRATCH_ADDR ON ZZZ_NONKIN_BIOG_ADDR.c_node_addr
_id = ZZ_SCRATCH_ADDR.c_addr_id "

           tQueryWhereStr = ""

           If tUseFirstYear Or tUseLastYear Then
               If tUseFirstYear And tUseLastYear Then
                   tQueryWhereStr = tQueryWhereStr + "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_index_year)>= " + tFirstYearSt
r + _
                           " And (ZZZ_NONKIN_BIOG_ADDR.c_index_year)<= " + tLastYearStr + "))"
               ElseIf tUseFirstYear Then
                   tQueryWhereStr = tQueryWhereStr + "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_index_year)>= " + tFirstYearSt
r + "))"
               ElseIf tUseLastYear Then
                   tQueryWhereStr = tQueryWhereStr + "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_index_year)<= " + tLastYearStr
 + "))"
               End If
           ElseIf gUseDynasties Then
                    '
               ' five possibilities (all, just from, just to, both from and to, and a cluelessly unset parameter)
               '
               If gFromDynasty = -2 Then
                    tQueryWhereStr = "Where ((ZZZ_NONKIN_BIOG_ADDR.c_dy) > 0 ) "
               ElseIf gFromDynasty = -1 And gToDynasty > 0 Then
                    tQueryWhereStr = "WHERE ((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
                    tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZZ_NONKIN_BIOG_ADDR INNER JOIN ZZ_SCRATCH_ADDR " + _
                        "ON ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) " + _
                        "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy "
               ElseIf gFromDynasty > 0 And gToDynasty = -1 Then
                    tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") "
                    tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZZ_NONKIN_BIOG_ADDR INNER JOIN ZZ_SCRATCH_ADDR " + _
                        "ON ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) " + _
                        "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy "
               ElseIf gFromDynasty = gToDynasty And gFromDynasty > 0 Then
                    tQueryWhereStr = "WHERE ((ZZZ_NONKIN_BIOG_ADDR.c_dy) = " + Str(gFromDynasty) + ") "
               ElseIf gFromDynasty > 0 And gToDynasty > 0 Then
                    tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") AND " + _
                        "((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
                    tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZZ_NONKIN_BIOG_ADDR INNER JOIN ZZ_SCRATCH_ADDR " + _
                        "ON ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) " + _
                        "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy "
               Else
                    tQueryWhereStr = ""
               End If
           End If

           cmdSQL.CommandText = tQueryInsertStr + tQueryFromStr + tQueryWhereStr
           cmdSQL.Execute tRecDeleted

           tSNA_count = tSNA_count + tRecDeleted
    End If

    ' For the association

    If Me.ChkAssocPlace.Value Then
        tQueryInsertStr = "INSERT INTO ZZ_PLACE ( c_personid, c_name, c_name_chn, c_index_year, c_female, c_dy, c
_dynasty, c_dynasty_chn, " + _
                "c_addr_id, c_addr_name, c_addr_chn, c_rel_addr_id, c_rel_addr_name, c_rel_addr_chn, c_assoc_id,
c_assoc_name, " + _
                "c_assoc_chn, c_rel_type, c_rel_code, c_rel_desc, c_rel_chn, x_coord, y_coord, c_source, c_firsty
ear, c_lastyear ) " + _
            "SELECT ZZZ_NONKIN_BIOG_ADDR.c_personid, ZZZ_NONKIN_BIOG_ADDR.c_person_name, ZZZ_NONKIN_BIOG_ADDR.c_p
erson_name_chn, ZZZ_NONKIN_BIOG_ADDR.c_index_year, " + _
                "ZZZ_NONKIN_BIOG_ADDR.c_female, ZZZ_NONKIN_BIOG_ADDR.c_dy, ZZZ_NONKIN_BIOG_ADDR.c_dynasty, ZZZ_NO
NKIN_BIOG_ADDR.c_dynasty_chn, " + _
                "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id, ZZZ_NONKIN_BIOG_ADDR.c_node_addr_name, ZZZ_NONKIN_BIOG_ADDR
.c_node_addr_chn, " + _
                "ZZZ_NONKIN_BIOG_ADDR.c_assoc_addr_id, ZZZ_NONKIN_BIOG_ADDR.c_assoc_addr_name, " + _
                "ZZZ_NONKIN_BIOG_ADDR.c_assoc_addr_chn, ZZZ_NONKIN_BIOG_ADDR.c_node_id, ZZZ_NONKIN_BIOG_ADDR.c_no
de_name, " + _
                "ZZZ_NONKIN_BIOG_ADDR.c_node_chn, 'Place of Association' AS c_rel_type, ZZZ_NONKIN_BIOG_ADDR.c_li
nk_code, ZZZ_NONKIN_BIOG_ADDR.c_link_desc, " + _
                "ZZZ_NONKIN_BIOG_ADDR.c_link_chn, ADDR_CODES.x_coord, ADDR_CODES.y_coord, ZZZ_NONKIN_BIOG_ADDR.c_
source, " + _
                "ZZZ_NONKIN_BIOG_ADDR.c_assoc_first_year, ZZZ_NONKIN_BIOG_ADDR.c_assoc_last_year "
        tQueryFromStr = "FROM ADDR_CODES INNER JOIN (ZZ_SCRATCH_ADDR INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
            "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_assoc_addr_id) ON ADDR_CODES.c_addr_id = ZZ_SC
RATCH_ADDR.c_addr_id "

        tQueryWhereStr = ""

        If tUseFirstYear Or tUseLastYear Then
            If tUseFirstYear And tUseLastYear Then
                 tQueryWhereStr = tQueryWhereStr + "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_assoc_last_year)>= " + tFirstY
earStr + _
                         " And (ZZZ_NONKIN_BIOG_ADDR.c_assoc_first_year)<= " + tLastYearStr + "))"
            ElseIf tUseFirstYear Then
                 tQueryWhereStr = tQueryWhereStr + "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_assoc_last_year)>= " + tFirstY
earStr + _
                     " OR (ZZZ_NONKIN_BIOG_ADDR.c_assoc_first_year)>= " + tFirstYearStr + "))"
            ElseIf tUseLastYear Then
                 tQueryWhereStr = tQueryWhereStr + "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_index_year)<= " + tLastYearStr
 + _
                     " OR (ZZZ_NONKIN_BIOG_ADDR.c_assoc_last_year)<= " + tLastYearStr + "))"
            End If
        ElseIf gUseDynasties Then
                 '
            ' five possibilities (all, just from, just to, both from and to, and a cluelessly unset parameter)
            '
            If gFromDynasty = -2 Then
                 tQueryWhereStr = "Where ((ZZZ_NONKIN_BIOG_ADDR.c_dy) > 0 ) "
            ElseIf gFromDynasty = -1 And gToDynasty > 0 Then
                 tQueryWhereStr = "WHERE ((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
                 tQueryFromStr = "FROM DYNASTIES INNER JOIN (ADDR_CODES INNER JOIN (ZZ_SCRATCH_ADDR INNER JOIN ZZZ
_NONKIN_BIOG_ADDR " + _
                     "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_assoc_addr_id) " + _
                     "ON ADDR_CODES.c_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) " + _
                     "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy "
            ElseIf gFromDynasty > 0 And gToDynasty = -1 Then
                 tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") "
                 tQueryFromStr = "FROM DYNASTIES INNER JOIN (ADDR_CODES INNER JOIN (ZZ_SCRATCH_ADDR INNER JOIN ZZZ
_NONKIN_BIOG_ADDR " + _
                     "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_assoc_addr_id) " + _
                     "ON ADDR_CODES.c_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) " + _
                     "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy "
            ElseIf gFromDynasty = gToDynasty And gFromDynasty > 0 Then
                 tQueryWhereStr = "WHERE ((ZZZ_NONKIN_BIOG_ADDR.c_dy) = " + Str(gFromDynasty) + ") "
            ElseIf gFromDynasty > 0 And gToDynasty > 0 Then
                 tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") AND " + _
                     "((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
                 tQueryFromStr = "FROM DYNASTIES INNER JOIN (ADDR_CODES INNER JOIN (ZZ_SCRATCH_ADDR INNER JOIN ZZZ
_NONKIN_BIOG_ADDR " + _
                     "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_assoc_addr_id) " + _
                     "ON ADDR_CODES.c_addr_id = ZZ_SCRATCH_ADDR.c_addr_id) " + _
                     "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy "
            Else
                 tQueryWhereStr = ""
            End If
        End If
              cmdSQL.CommandText = tQueryInsertStr + tQueryFromStr + tQueryWhereStr
              cmdSQL.Execute tRecDeleted

              tSNA_count = tSNA_count + tRecDeleted

       End If
       '
       ' get the index year descriptive data for people
       '
       cmdSQL.CommandText = "UPDATE ZZZ_BIOG_MAIN AS ZZZ_BIOG_MAIN_1 INNER JOIN (ZZZ_BIOG_MAIN INNER JOIN ZZ_PLACE "
 + _
              "ON ZZZ_BIOG_MAIN.c_personid = ZZ_PLACE.c_personid) ON ZZZ_BIOG_MAIN_1.c_personid = ZZ_PLACE.c_assoc_id "
 + _
        "SET ZZ_PLACE.c_index_year_type_code = [ZZZ_BIOG_MAIN].[c_index_year_type_code], " + _
            "ZZ_PLACE.c_index_year_type_desc = [ZZZ_BIOG_MAIN].[c_index_year_type_desc], " + _
            "ZZ_PLACE.c_index_year_type_hz = [ZZZ_BIOG_MAIN].[c_index_year_type_hz], " + _
            "ZZ_PLACE.c_assoc_index_year_type_code = [ZZZ_BIOG_MAIN_1].[c_index_year_type_code], " + _
            "ZZ_PLACE.c_assoc_index_year_type_desc = [ZZZ_BIOG_MAIN_1].[c_index_year_type_desc], " + _
            "ZZ_PLACE.c_assoc_index_year_type_hz = [ZZZ_BIOG_MAIN_1].[c_index_year_type_hz]"
    cmdSQL.Execute tRecDeleted
    '
    ' finally, get the source titles
    '
    cmdSQL.CommandText = "UPDATE ZZ_PLACE INNER JOIN TEXT_CODES ON ZZ_PLACE.c_source = TEXT_CODES.c_textid " + _
        "SET ZZ_PLACE.c_source_text = [TEXT_CODES].[c_title], " + _
            "ZZ_PLACE.c_source_text_chn = [TEXT_CODES].[c_title_chn]"
    cmdSQL.Execute tRecDeleted
    '
    ' now reopen
    '
    Set tRstPlace = CurrentDb.OpenRecordset("ZZ_PLACE", dbOpenDynaset)
    Set frmZZZ_PLACE.Form.Recordset = tRstPlace
    '
    ' the final step is to calculate the xy_count
    '
    If tRstPlace.RecordCount > 0 Then
        '
        ' get the aggregated records
        '
        Call getAggregatedRecords
        '
        ' get the people
        '
        Call getPeopleRecords
        '
        ' calculate_xy_count
        '
        cmdSQL.CommandText = "Delete * from tmpXY"
        cmdSQL.Execute tRecDeleted
        '
        cmdSQL.CommandText = "INSERT INTO tmpXY ( x_coord, y_coord, CountOfx_coord, CountOfy_coord ) " + _
            "SELECT ZZ_PLACE.x_coord, ZZ_PLACE.y_coord, Count(ZZ_PLACE.x_coord) AS CountOfx_coord, Count(ZZ_PLACE
.y_coord) AS CountOfy_coord " + _
            "FROM ZZ_PLACE " + _
            "GROUP BY ZZ_PLACE.x_coord, ZZ_PLACE.y_coord"
        '
        cmdSQL.Execute tRecCount
        '
        cmdSQL.CommandText = "UPDATE tmpXY INNER JOIN ZZ_PLACE ON (tmpXY.y_coord = ZZ_PLACE.y_coord) AND (tmpXY.x
_coord = ZZ_PLACE.x_coord) " + _
            "SET ZZ_PLACE.xy_count = [tmpXY].[CountOfx_coord]"

              cmdSQL.Execute tRecCount

              CmdStoreID.Enabled = True
              CmdNeo4j.Enabled = True
       Else
           CmdStoreID.Enabled = False
           CmdNeo4j.Enabled = False
       End If

       If tSNA_count > 0 Then
            CmdGephi.Enabled = True
            CmdPajek.Enabled = True
            CmdUCINet.Enabled = True
       Else
            CmdGephi.Enabled = False
            CmdPajek.Enabled = False
            CmdUCINet.Enabled = False
       End If
    '
    ' restore the initial list
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_ADDR"
    cmdSQL.Execute tRecDeleted
    '
    cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_ADDR ( c_addr_id ) SELECT DISTINCT c_addr_id FROM ZZ_SCRATCH_ADD
R_LIST"
    cmdSQL.Execute tRecDeleted

Exit_CmdQuery_Click:
    '
    ' close everything
    '
    Set tRstPlace = Nothing
    Set tRstDummy = Nothing
    Set cmdSQL = Nothing
    Exit Sub

Err_CmdQuery_Click:
    MsgBox Err.Description
    Resume Exit_CmdQuery_Click

End Sub
Private Sub calculate_xy_count()
    Dim tX As Double, tY As Double, tXY As Integer
    Dim tBM As Variant, tWrite As Integer, tRstPlace As DAO.Recordset
    '
    ' the strategy is to first throw a bookmark at the first new value
    ' then count the number, then go back to the bookmark and update each record
    '
    ' in order to do this, I need to open the table as a table
    '
    Set tRstPlace = CurrentDb.OpenRecordset("ZZ_PLACE", dbOpenTable)
    With tRstPlace
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
        .Index = "name"
    End With
    tRstPlace.Close
    Set tRstPlace = Nothing

End Sub
Private Sub CmdGIS_Click()
On Error GoTo Err_CmdGIS_Click
    '
    ' This program will dump the results to a .gis file
    '
    If frmZZZ_PLACE.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdGIS_Click
    End If
    '
    Dim tStream As ADODB.Stream
    Set tStream = New ADODB.Stream

    If GISFrame.Value = 1 Then
         tStream.Charset = "utf-8"
         tCodeStr = "UTF8"
    Else
         tStream.Charset = "gb18030"
         tCodeStr = "GB18030"
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
    Dim tStr As String, tC As String, ti As Integer

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

    dlgSaveAs.InitialFileName = "network_gis_" + tCodeStr + ".txt"
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
        End If
        '
        ' write the file
        '
        'Name,NameChn,Female,IndexYear,AddrName,AddrChn,X,Y,xy_count,NodeDist
        '
        ' process the table
        '
        Set tRstNode = frmZZZ_PLACE.Form.Recordset
        tC = Chr(44) ' the comma
        '
        With tRstNode
             '
             ' write the header
             '
             tStr = "Name" + tC + "NameChn" + tC + "IndexYear" + tC
             tStr = tStr + "AddrName" + tC + "AddrChn" + tC + "X" + tC + "Y" + tC
             tStr = tStr + "xy_count"
             tStream.WriteText tStr, adWriteLine
             .MoveFirst
             Do While Not .EOF
                 ' must guard against NULLs
                 '
                 If Trim(!c_name) = "" Then
                      tStr = "[?]" + tC
                 Else
                      tStr = !c_name + tC
                 End If
                      If Trim(!c_name_chn) = "" Then
                           tStr = tStr + "[?]" + tC
                      Else
                           tStr = tStr + !c_name_chn + tC
                      End If

                      If IsNull(!c_index_year) Then
                           tStr = tStr + "-2000" + tC
                      Else
                           tStr = tStr + Str(!c_index_year) + tC
                      End If

                      ' here guard against blanks as well

                      If IsNull(!c_addr_name) Then
                           tStr = tStr + "[?]" + tC
                      ElseIf Trim(!c_addr_name) = "" Then
                           tStr = tStr + "[?]" + tC
                      Else
                           tStr = tStr + !c_addr_name + tC
                      End If

                      If IsNull(!c_addr_chn) Then
                           tStr = tStr + "[?]" + tC
                      ElseIf Trim(!c_addr_chn) = "" Then
                           tStr = tStr + "[?]" + tC
                      Else
                           tStr = tStr + !c_addr_chn + tC
                      End If

                      If IsNull(!x_coord) Then
                           tStr = tStr + "0" + tC
                      Else
                           tStr = tStr + Str(!x_coord) + tC
                      End If

                      If IsNull(!y_coord) Then
                           tStr = tStr + "0" + tC
                      Else
                           tStr = tStr + Str(!y_coord) + tC
                      End If

                      If IsNull(!xy_count) Then
                           tStr = tStr + "0"
                      Else
                           tStr = tStr + Str(!xy_count)
                      End If


                      tStream.WriteText tStr, adWriteLine
                      .MoveNext
               Loop
           End With
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

Exit_CmdGIS_Click:
    Exit Sub

Err_CmdGIS_Click:
    MsgBox Err.Description
    Resume Exit_CmdGIS_Click

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

Private Sub CmdUCINet_Click()
On Error GoTo Err_CmdUCINet_Click
    '
    ' This program will dump the results of the search to a .vna file
    '
    ' for the moment I'll just describe the format of the .vna file
    '
    ' *node data
    ' ID index_year sex x_coord y_coord nodedist
    '      ID = str(c_person_id)
    '      indexyear = c_index_year INT
    '      nodedist = c_node_dist INT
    '      sex = c_female > (F,M)
    ' *node properties
    ' ID color shape size shortlabel active
    '      color = red (1), orange (2), yellow (3), green (4), blue (5)
    '      shortlabel = c_name
    '      shape = 2
    '      active = TRUE
    '
    ' *tie data
    ' from to edgetype nodedist
    '       from = str(c_person_id)
    '       to = str(c_node_id)
    '       edgetype= c_link_type (K,N)
    '
    ' *tie properties
    ' from to color size active
    '       from = str(c_person_id)
    '       to = str(c_node_id)
    '       color = red (255), orange (26367), yellow (65535), green (32768), blue (16711680)
    '       size = 1-5 (the weight)
    '
    ' the central question is whether to do distance optimizations
    '
    ' first see if there are any records to process
    '
    If frmZZZ_PLACE.Form.Recordset.RecordCount = 0 Then
         MsgBox "There are no records to save."
         GoTo Exit_CmdUCINet_Click
    End If
    '
    ' to write to a UTF-8 file, use the ADO stream object
    Dim tStream As ADODB.Stream
    Set tStream = New ADODB.Stream
    If CodeFrame.Value = 1 Then
         tStream.Charset = "utf-8"
         tCodeStr = "UTF8.net"
    ElseIf CodeFrame.Value = 2 Then
         tStream.Charset = "big5"
         tCodeStr = "BIG5.net"
    Else
         tStream.Charset = "gb18030"
         tCodeStr = "GB18030.net"
    End If
    tStream.Mode = adModeReadWrite
    tStream.Type = adTypeText
    tStream.Open
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tRstNode As DAO.Recordset, tRstAssocType As DAO.Recordset
    Dim tRstEdge As DAO.Recordset
    Dim tStr As String, tC As String, ti As Integer, tSearchStr As String
    Dim tColor(20) As String, tQuote As String
    Dim tFileSystem, tVNA

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

    'Use a With...End With block to reference the FileDialog object.
    With dlgSaveAs
        .InitialFileName = "network.vna"
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
                 GoTo Exit_CmdUCINet_Click
            Else
                 ' make sure the file name has a vna extension
                 If Len(tFileName) < 5 Then
                     tFileName = tFileName + ".vna"
                 ElseIf Not (LCase(Right(tFileName, 4)) = ".vna") Then
                     tFileName = tFileName + ".vna"
                 End If
            End If
            '
            ' now process the file (second true removed to make ASCII)
            '
            'Set tFileSystem = CreateObject("Scripting.FileSystemObject")
            'Set tVNA = tFileSystem.CreateTextFile(tFileName, True)

            ' now prepare the node list by getting all the person ID and the assoc IDs
            '
            ' the strategy is to dump both into ZZ_SOCIAL_NETWORK and then copy to ZZ_SCRATCH_PEOPLE
            '
            Dim cmdSQL As ADODB.Command
            Set cmdSQL = New ADODB.Command
            cmdSQL.ActiveConnection = CurrentProject.Connection
            cmdSQL.CommandType = adCmdText
            '
            cmdSQL.CommandText = "Delete * from ZZ_SOCIAL_NETWORK"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
            cmdSQL.Execute tRecDeleted

            tStr = "INSERT INTO ZZ_SOCIAL_NETWORK ( c_person_id, c_name, c_name_chn, c_index_year ) " + _
                "SELECT DISTINCT ZZ_PLACE.c_personid, ZZ_PLACE.c_name, ZZ_PLACE.c_name_chn, ZZ_PLACE.c_index_year
 " + _
                "FROM ZZ_PLACE WHERE (((ZZ_PLACE.c_rel_type)='Kinship')) OR (((ZZ_PLACE.c_rel_type)='Associate Pl
ace'))"

            cmdSQL.CommandText = tStr
            cmdSQL.Execute tRecDeleted
            '
            If tRecDeleted = 0 Then
                MsgBox "There are no networks associated with this place."
                Exit Sub
            End If

            tStr = "INSERT INTO ZZ_SOCIAL_NETWORK ( c_person_id, c_name, c_name_chn, c_index_year ) " + _
                "SELECT DISTINCT ZZ_PLACE.c_assoc_id, ZZ_PLACE.c_assoc_name, ZZ_PLACE.c_assoc_chn, ZZ_PLACE.c_ass
oc_index_year " + _
                "FROM ZZ_PLACE WHERE (((ZZ_PLACE.c_rel_type)='Kinship')) OR (((ZZ_PLACE.c_rel_type)='Associate Pl
ace'))"

            cmdSQL.CommandText = tStr
            cmdSQL.Execute tRecDeleted
            '
            ' now copy to create the nodes table
            '
            tStr = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year ) " + _
                "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_person_id, ZZ_SOCIAL_NETWORK.c_name, ZZ_SOCIAL_NETWORK.c_nam
e_chn, ZZ_SOCIAL_NETWORK.c_index_year " + _
                "FROM ZZ_SOCIAL_NETWORK"

            cmdSQL.CommandText = tStr
            cmdSQL.Execute tRecDeleted
            '
            ' to get the edges, just copy the relevant records into ZZ_SOCIAL_NETWORK
            '
            cmdSQL.CommandText = "Delete * from ZZ_SOCIAL_NETWORK"
            cmdSQL.Execute tRecDeleted
            '
            tStr = "INSERT INTO ZZ_SOCIAL_NETWORK ( c_person_id, c_node_id, c_link_code, c_link_desc, c_link_chn
) " + _
                "SELECT DISTINCT ZZ_PLACE.c_personid, ZZ_PLACE.c_assoc_id, ZZ_PLACE.c_rel_code, ZZ_PLACE.c_rel_de
sc, ZZ_PLACE.c_rel_chn " + _
                "FROM ZZ_PLACE WHERE (((ZZ_PLACE.c_rel_type)='Kinship')) OR (((ZZ_PLACE.c_rel_type)='Associate Pl
ace'))"

            cmdSQL.CommandText = tStr
            cmdSQL.Execute tRecDeleted
            '
            'MsgBox "Created tables"
            '
            ' process the two tables
            '
            Set tRstEdge = CurrentDb.OpenRecordset("ZZ_SOCIAL_NETWORK", dbOpenDynaset)
            Set tRstNode = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
            tQuote = Chr(34) ' the quotation mark
            '
            ' first the nodes: define the node data structure
            tStr = "*node data"
            tStream.WriteText tStr, adWriteLine
            tStr = "ID index_year x_coord y_coord"
            tStream.WriteText tStr, adWriteLine
            '
            With tRstNode
                .MoveFirst
                Do While Not .EOF
                     ' name = the ID of the person
                     tStr = Trim(Str(!c_person_id)) + " "
                     '
                     ' indexyear = c_index_year INT
                     If IsNull(!c_index_year) Then
                          tStr = tStr + "0 "
                     Else
                          tStr = tStr + Trim(Str(!c_index_year)) + " "
                     End If
                     '
                     '    x_coord
                     If IsNull(!x_coord) Then
                          tStr = tStr + "0 "
                     Else
                          tStr = tStr + Trim(Str(!x_coord)) + " "
                     End If
                     '
                     '    y_coord
                     If IsNull(!y_coord) Then
                          tStr = tStr + "0 "
                     Else
                          tStr = tStr + Trim(Str(!y_coord)) + " "
                     End If
                     '
                     tStream.WriteText tStr, adWriteLine
                     .MoveNext
                Loop
            End With
            '
            ' now the node properties
            '
            ' Note: ACTIVE removed as a property (MAF 2018/07/22)
            '
            tStr = "*node properties"
            tStream.WriteText tStr, adWriteLine
            tStr = "ID shape size shortlabel"
            tStream.WriteText tStr, adWriteLine
            '
            With tRstNode
                .MoveFirst
                Do While Not .EOF
                     ' ID = the ID of the person
                     tStr = Trim(Str(!c_person_id)) + " "
                     '
                     ' shape = 2? / size = 1?
                     tStr = tStr + "2 1 "
                     '
                     ' shortlabel (+ Active = TRUE removed)
                     If IsNull(!c_name) Then
                          tStr = tStr + "[Missing]"
                     Else
                          tStr = tStr + tQuote + !c_name + tQuote
                     End If
                     tStream.WriteText tStr, adWriteLine
                     .MoveNext
                Loop
            End With
            '
            'MsgBox "wrote nodes"
            ' now the edges: define the record structure
            '
            tStr = "*tie data"
            tStream.WriteText tStr, adWriteLine
            tStr = "from to " + tQuote + "EdgeWeight" + tQuote + " " + tQuote + "edgedesc" + tQuote
            tStream.WriteText tStr, adWriteLine
            '
            ' For the moment, I am not combining parallel edges
            '
            With tRstEdge
                .MoveFirst
                Do While Not .EOF
                     '
                     '    From = str(c_person_id) for node1
                     tStr = Trim(Str(!c_person_id)) + " "
                     '
                     '    to = str(c_assoc_id) for node2
                     tStr = tStr + Trim(Str(!c_node_id)) + " 1 "
                     '
                     '    edgedesc
                         '
                         tStr = tStr + tQuote + Trim(!c_link_desc) + tQuote
                         '
                         tStream.WriteText tStr, adWriteLine
                         .MoveNext
                     Loop
                 End With
                 '
                 'MsgBox "wrote edges"
                 '
                 ' now the edges properties
                 '
                 'tVNA.WriteLine ("*tie properties")
                 'tVNA.WriteLine ("from to color size active")

                 'With tRstEdge
                     '.MoveFirst
                     'Do While Not .EOF
                         '
                         '   from = str(c_person_id) for node1
                         'tStr = Trim(Str(!c_person_id)) + " "
                         '
                         '   to = str(c_node_id) for node2
                         'tStr = tStr + Trim(Str(!c_node_id)) + " 1 "
                         '
                         '   color = black (1), blue (2), green (3), yellow (4), orange (5)
                         'tStr = tStr + tColor(!c_edge_dist)
                         '
                         '   size = 1? active = TRUE
                         'tStr = tStr + "1 TRUE"
                         '
                         'tVNA.WriteLine (tStr)
                         '.MoveNext
                     'Loop
                 'End With
                 '
                 'tVNA.Close
                 '
                 ' now make sure all the data is copied to tStream
                 tStream.Flush
                 ' and write the stream to the file
                 tStream.SaveToFile tFileName, adSaveCreateOverWrite
                 '
                 Set tRstNode = Nothing
                 Set tRstEdge = Nothing
                 Set tStream = Nothing
                 'Set tVNA = Nothing
                 'Set tFileSystem = Nothing
          Else
             'The user pressed Cancel.
        End If
    End With

    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdUCINet_Click:
    Exit Sub

Err_CmdUCINet_Click:
    MsgBox Err.Description
    Resume Exit_CmdUCINet_Click

End Sub

Private Sub Form_Open(Cancel As Integer)
    Dim cmdSQL As ADODB.Command, tRecDeleted As Variant
    Dim tRstPlaceCode As DAO.Recordset, tRstDummy As DAO.Recordset

    Set cmdSQL = New ADODB.Command
    '
    ' to clear the tables, briefly close and then delete records
    '
    Set tRstPlaceCode = frmZZZ_PLACE.Form.Recordset
    Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_PL", dbOpenDynaset)
    Set frmZZZ_PLACE.Form.Recordset = tRstDummy
    tRstPlaceCode.Close
    '
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
        '
    cmdSQL.CommandText = "Delete from ZZ_PLACE where c_personid > -1"
    cmdSQL.Execute tRecDeleted
    '
    ' now reopen
    '
    Set tRstPlaceCode = CurrentDb.OpenRecordset("ZZ_PLACE", dbOpenDynaset)
    Set frmZZZ_PLACE.Form.Recordset = tRstPlaceCode
    '
    ' ZZ_SCRATCH_PLACE_AGG
    '
    Set tRstPlaceCode = ZZ_SCRATCH_PLACE_AGG.Form.Recordset
    Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_PLACE_AGG", dbOpenDynaset)
    Set ZZ_SCRATCH_PLACE_AGG.Form.Recordset = tRstDummy
    tRstPlaceCode.Close
    '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PLACE_AGG"
    cmdSQL.Execute tRecDeleted
    '
    ' now reopen
    '
    Set tRstPlaceCode = CurrentDb.OpenRecordset("ZZ_SCRATCH_PLACE_AGG", dbOpenDynaset)
    Set ZZ_SCRATCH_PLACE_AGG.Form.Recordset = tRstPlaceCode
    '
    ' ZZ_SCRATCH_PLACE_PEOPLE
    '
    Set tRstPlaceCode = ZZ_SCRATCH_PLACE_PEOPLE.Form.Recordset
    Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_PLACE_PEOPLE", dbOpenDynaset)
    Set ZZ_SCRATCH_PLACE_PEOPLE.Form.Recordset = tRstDummy
    tRstPlaceCode.Close
    '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PLACE_PEOPLE"
    cmdSQL.Execute tRecDeleted
    '
    ' now reopen
    '
    Set tRstPlaceCode = CurrentDb.OpenRecordset("ZZ_SCRATCH_PLACE_PEOPLE", dbOpenDynaset)
    Set ZZ_SCRATCH_PLACE_PEOPLE.Form.Recordset = tRstPlaceCode
    '
    gUseADDRID = False
    gImportPlaces = False
    gFromDynasty = -1
    gToDynasty = -1
    gUseIndexYears = False
    gUseDynasties = False
End Sub

Private Sub CmdPajek_Click()
On Error GoTo Err_CmdPajek_Click
    '
    ' This program will dump the results of the search to a .net file
    '
    ' for the moment I'll just describe the format of the .gdf file
    '
    ' *Vertices NUM
    ' ID label "box" ic [color] bc [color]
    '      ID = str(c_person_id)
    '      label = c_name_chn
    '      color = red (1), orange (2), yellow (3), green (4), blue (5)
    '
    ' *Edges
    ' node1 node2 1 l "label"
    '      node1 = str(c_person_id) for node1
    '      node2 = str(c_node_id) for node2
    '      color = red (1), orange (2), yellow (3), green (4), blue (5)
    '      label = c_link_desc
    '
    '
    ' first see if there are any records to process
    '
    If frmZZZ_PLACE.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdPajek_Click
    End If
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tRstNode As DAO.Recordset, tRstNodeList As DAO.Recordset
    Dim tRstEdge As DAO.Recordset, tRstAssocType As DAO.Recordset
    Dim tRstAssocCodeType As DAO.Recordset, tRstEdgeList As DAO.Recordset
    Dim tStr As String, tC As String, ti As Integer, tQuote As String, tFindStr As String
    Dim tColor(20) As String, tStrNode1 As String, tStrNode2 As String, tCodeStr As String

    ' to write to a UTF-8 file, use the ADO stream object
    Dim tStream As ADODB.Stream
    Set tStream = New ADODB.Stream
    If CodeFrame.Value = 1 Then
         tStream.Charset = "utf-8"
         tCodeStr = "UTF8.net"
    ElseIf CodeFrame.Value = 2 Then
         tStream.Charset = "big5"
         tCodeStr = "BIG5.net"
    ElseIf CodeFrame.Value = 3 Then
         tStream.Charset = "gb18030"
         tCodeStr = "GB18030.net"
    Else
         tStream.Charset = "ascii"
         tCodeStr = "ASCII.net"
    End If
    tStream.Mode = adModeReadWrite
    tStream.Type = adTypeText
    tStream.Open


    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)


    'Use a With...End With block to reference the FileDialog object.
    With dlgSaveAs
        .InitialFileName = "network_" + tCodeStr
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
                 GoTo Exit_CmdPajek_Click
            Else
                 ' make sure the file name has a net extension
                 If Len(tFileName) < 5 Then
                     tFileName = tFileName + ".net"
                 ElseIf Not (LCase(Right(tFileName, 4)) = ".net") Then
                     tFileName = tFileName + ".net"
                 End If
            End If
            '
            ' zap and open the scratch file
            '
            Dim cmdSQL As ADODB.Command
            Set cmdSQL = New ADODB.Command
            cmdSQL.ActiveConnection = CurrentProject.Connection
            cmdSQL.CommandType = adCmdText
            '
            cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PAJEK"
            cmdSQL.Execute tRecDeleted
            '
            ' fill the node list
            '
            ' first get the people
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK ( c_ID, c_lbl, c_distance, c_v_num, c_delete ) " + _
                 "SELECT DISTINCT ZZ_PLACE.c_personid, ZZ_PLACE.c_name_chn, " + _
                 "1 AS c_distance, str(ZZ_PLACE.c_personid) AS c_v_num, TRUE as c_delete FROM ZZ_PLACE"

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            ' next get any node ID not among the people
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK ( c_ID, c_lbl, c_distance, c_v_num, c_delete ) " + _
                "SELECT DISTINCT ZZ_PLACE.c_assoc_id, ZZ_PLACE.c_assoc_chn, 1 AS c_distance, Str([ZZ_PLACE].[c_as
soc_id]) AS c_v_num, True AS c_delete " + _
                "FROM ZZ_PLACE LEFT JOIN ZZ_SCRATCH_PAJEK ON ZZ_PLACE.c_assoc_id = ZZ_SCRATCH_PAJEK.c_ID " + _
                "WHERE (((ZZ_SCRATCH_PAJEK.c_ID) Is Null))"

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            Set tRstNodeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK", dbOpenTable)
            tRstNodeList.Index = "c_ID"
            '
            ' there probably is an SQL way to do this, but...
            '
            ti = 1
            With tRstNodeList
                .MoveFirst
                Do While Not .EOF
                     .Edit
                     !c_v_num = Trim(Str(ti))
                     .Update
                     ti = ti + 1
                     .MoveNext
                Loop
            End With
            tRstNodeList.Close
            '
            cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PAJEK_EDGE"
            cmdSQL.Execute tRecDeleted
            '
            ' fill the edge list
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK_EDGE ( c_node_1, c_node_2, c_edge_dist, c_edge_count ) " +
_
                "SELECT DISTINCT Val([ZZ_SCRATCH_PAJEK.c_v_num]) AS c_node_1, Val([ZZ_SCRATCH_PAJEK_1.c_v_num]) A
S c_node_2, " + _
                "1 AS c_edge_distance, Count(ZZ_SCRATCH_PAJEK_1.c_v_num) AS CountOfc_v_num " + _
                "FROM ZZ_SCRATCH_PAJEK AS ZZ_SCRATCH_PAJEK_1 INNER JOIN (ZZ_SCRATCH_PAJEK INNER JOIN ZZ_PLACE " +
 _
                "ON ZZ_SCRATCH_PAJEK.c_ID = ZZ_PLACE.c_personid) " + _
                "ON ZZ_SCRATCH_PAJEK_1.c_ID = ZZ_PLACE.c_assoc_id " + _
                "GROUP BY Val([ZZ_SCRATCH_PAJEK.c_v_num]), Val([ZZ_SCRATCH_PAJEK_1.c_v_num]), 1"


            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            ' *******************************If we are allowing parallel edges, this section is no longer releva
nt
            '
            ' now fill in the edge description. This requires three steps
            '
            'cmdSQL.CommandText = "DROP TABLE tmp_scratch_pajek"
            'cmdSQL.Execute tRecDeleted
            '
            tQueryStr = "SELECT ZZ_SCRATCH_PAJEK.c_ID, Val(ZZ_SCRATCH_PAJEK.c_v_num) AS c_v_num INTO " + _
                "TMP_SCRATCH_PAJEK FROM ZZ_SCRATCH_PAJEK"

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            tQueryStr = "UPDATE ((ZZ_PLACE INNER JOIN TMP_SCRATCH_PAJEK ON " + _
                    "ZZ_PLACE.c_personid = TMP_SCRATCH_PAJEK.c_ID)" + _
                    " INNER JOIN ZZ_SCRATCH_PAJEK_EDGE ON " + _
                    "TMP_SCRATCH_PAJEK.c_v_num = ZZ_SCRATCH_PAJEK_EDGE.c_node_1) " + _
                    "INNER JOIN TMP_SCRATCH_PAJEK AS TMP_SCRATCH_PAJEK_1 ON (TMP_SCRATCH_PAJEK_1.c_v_num = " + _
                    "ZZ_SCRATCH_PAJEK_EDGE.c_node_2) AND (ZZ_PLACE.c_assoc_id = TMP_SCRATCH_PAJEK_1.c_ID) " + _
                    "SET ZZ_SCRATCH_PAJEK_EDGE.c_edge_desc = [ZZ_PLACE].[c_rel_type]+':'+[ZZ_PLACE].[c_rel_desc]
" + _
                    "WHERE (((ZZ_SCRATCH_PAJEK_EDGE.c_edge_count)=1))"

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted

            cmdSQL.CommandText = "DROP TABLE tmp_scratch_pajek"
            cmdSQL.Execute tRecDeleted
            '
            tQueryStr = "UPDATE ZZ_SCRATCH_PAJEK_EDGE SET ZZ_SCRATCH_PAJEK_EDGE.c_edge_desc = " + _
                "'Parallel Edges merged' WHERE (((ZZ_SCRATCH_PAJEK_EDGE.c_edge_count)>1))"

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            'MsgBox "Tables successfully built"
            '
            Set tRstNodeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK", dbOpenDynaset)
            Set tRstEdgeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK_EDGE", dbOpenDynaset)
            '
            'MsgBox "Tables opened"
            ' set the Quote delimiter
            '
            tQuote = Chr(34)
            '
            ' define the colors for the nodes
            '
            tColor(1) = "Black"
            tColor(2) = "Blue"
            tColor(3) = "Green"
            tColor(4) = "Yellow"
            tColor(5) = "Orange"
            For ti = 6 To 20
                 tColor(ti) = "Red"
            Next
            '
            tC = Chr(44) ' the comma
            '
            ' first the nodes: define the record structure
            '
            tRstNodeList.MoveLast
            tStr = "*Vertices " + Trim(Str(tRstNodeList.RecordCount))
            tStream.WriteText tStr, adWriteLine
            '
            'MsgBox "header written"
            '
            With tRstNodeList
                 .MoveFirst

                Do While Not .EOF
                     tStream.WriteText !c_v_num + " "
                     '
                     If IsNull(!c_lbl) Then
                          tStream.WriteText Chr(34)
                          tStream.WriteText "Error-" + Trim(Str(!c_ID))
                          tStream.WriteText Chr(34)
                          tStream.WriteText " box "
                     Else
                          If !c_lbl = "" Then
                               tStream.WriteText Chr(34)
                               tStream.WriteText "Error-" + Trim(Str(!c_ID))
                               tStream.WriteText Chr(34)
                               tStream.WriteText " box "
                          Else
                               tStream.WriteText Chr(34)
                               tStream.WriteText !c_lbl
                               tStream.WriteText ":" + Trim(Str(!c_ID))
                               tStream.WriteText Chr(34)
                               tStream.WriteText " box "
                          End If
                     End If
                     ' label
                     tStr = " ic " + tColor(!c_distance + 1)
                     tStr = tStr + " bc " + tColor(!c_distance + 1)
                     ' color = white (1), blue (2), green (3), yellow (4), orange (5)
                     tStream.WriteText tStr, adWriteLine
                     '
                     .MoveNext
                Loop
            End With
            '
            'MsgBox "Nodes written to stream"
            '
            ' now the edges: define the record structure
            '
            tStream.WriteText "*Edges", adWriteLine

            If tRstEdgeList.RecordCount > 0 Then
                With tRstEdgeList
                .MoveFirst
                Do While Not .EOF
                    tStr = Trim(Str(!c_node_1)) + " " + Trim(Str(!c_node_2))
                    '
                    ' now get the weight
                    '
                       If !c_edge_count < 6 Then
                            tStr = tStr + " " + Trim(Str(!c_edge_count)) + " "
                       Else
                            tStr = tStr + " 5 "
                       End If
                       '
                       ' now get the label
                       '
                       tStr = tStr + "l " + tQuote
                       If !c_edge_count = 1 Then
                            tStr = tStr + !c_edge_desc + tQuote + " "
                       Else
                            tStr = tStr + Trim(Str(!c_edge_count)) + " links" + tQuote + " "
                            '
                       End If

                       tStr = tStr + "c " + tColor(!c_edge_dist + 1)
                       '   color = white (1), blue (2), green (3), yellow (4), orange (5)
                       '
                       tStream.WriteText tStr, adWriteLine
                       '
                       .MoveNext
                   Loop
                   End With
               End If
               '
               'MsgBox "Edges written to stream"
               '
               ' now make sure all the data is copied to tStream
               tStream.Flush
               ' and write the stream to the file
               '
               'MsgBox "Writing to file"
               '
               tStream.SaveToFile tFileName, adSaveCreateOverWrite
               '
               tRstNodeList.Close

               tStream.Close
               Set tStream = Nothing
               '
               'Set tGDF = Nothing
               'Set tFileSystem = Nothing
               Set tRstNodeList = Nothing
               Set tRstEdgeList = Nothing
        Else
             'The user pressed Cancel.
        End If
    End With

    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdPajek_Click:
    Exit Sub

Err_CmdPajek_Click:
    MsgBox Err.Description
    Resume Exit_CmdPajek_Click

End Sub
Private Sub CmdGephi_Click()
    '
    ' This program will dump the results of the search to a .gdf file
    '
    ' for the moment I'll just describe the format of the .gdf file
    '
    ' nodedef> name, color, label, labelvisible, style, pinyin VARCHAR(50), nodedist INT
    '      name = str(c_person_id)
    '      label = c_name_chn
    '      style = 4 (text inside a rectangle)
    '      pinyin = c_name
    '      indexyear = c_index_year INT
    '
    ' edgedef> node1, node2, color, label, labelvisible, edge_desc VARCHAR(50)
    '      node1 = str(c_person_id) for node1
    '      node2 = str(c_assoc_id) for node2
    '      label = c_rel_chn
    '      edge_desc = c_rel_desc
    '
    ' the central question is whether to do distance optimizations
    '
    ' first see if there are any records to process
    '
    If frmZZZ_PLACE.Form.Recordset.RecordCount = 0 Then
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
    Dim tStr As String, tC As String, ti As Integer, tQuote As String
    Dim tMetricSum As Integer

    ' to write to a UTF-8 file, use the ADO stream object
    Dim tStream As ADODB.Stream
    Set tStream = New ADODB.Stream
    If GephiFrame.Value = 1 Then
         tStream.Charset = "utf-8"
         tCodeStr = "UTF8.net"
    Else
         tStream.Charset = "gb18030"
         tCodeStr = "GB18030.net"
    End If
    tStream.Mode = adModeReadWrite
    tStream.Type = adTypeText
    tStream.Open

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
            Dim cmdSQL As ADODB.Command
            Set cmdSQL = New ADODB.Command
            cmdSQL.ActiveConnection = CurrentProject.Connection
            cmdSQL.CommandType = adCmdText
            '
            ' now prepare the node list by getting all the person ID and assoc IDs
            '
            ' the strategy is to dump both into ZZ_SOCIAL_NETWORK and then copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = "Delete * from ZZ_SOCIAL_NETWORK"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
            cmdSQL.Execute tRecDeleted

            tStr = "INSERT INTO ZZ_SOCIAL_NETWORK ( c_person_id, c_name, c_name_chn, c_index_year, c_addr_name, c
_addr_chn, x_coord, y_coord ) " + _
                "SELECT DISTINCT ZZ_PLACE.c_personid, ZZ_PLACE.c_name, ZZ_PLACE.c_name_chn, ZZ_PLACE.c_index_year
, " + _
                "ZZ_PLACE.c_addr_name, ZZ_PLACE.c_addr_chn, ZZ_PLACE.x_coord, ZZ_PLACE.y_coord " + _
                "FROM ZZ_PLACE WHERE (((ZZ_PLACE.c_rel_type)='Kinship')) OR (((ZZ_PLACE.c_rel_type)='Associate Pl
ace'))"

            cmdSQL.CommandText = tStr
            cmdSQL.Execute tRecDeleted

            tStr = "INSERT INTO ZZ_SOCIAL_NETWORK ( c_person_id, c_name, c_name_chn, c_index_year, c_addr_name, c
_addr_chn, x_coord, y_coord ) " + _
                "SELECT DISTINCT ZZ_PLACE.c_assoc_id, ZZ_PLACE.c_assoc_name, ZZ_PLACE.c_assoc_chn, ZZ_PLACE.c_ass
oc_index_year, " + _
                "ZZ_PLACE.c_assoc_addr_name, ZZ_PLACE.c_assoc_addr_chn, ZZ_PLACE.assoc_x_coord, ZZ_PLACE.assoc_y_
coord " + _
                "FROM ZZ_PLACE WHERE (((ZZ_PLACE.c_rel_type)='Kinship')) OR (((ZZ_PLACE.c_rel_type)='Associate Pl
ace'))"

            cmdSQL.CommandText = tStr
            cmdSQL.Execute tRecDeleted
            '
            ' now copy to create the nodes table
            '
            tStr = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, c_addr_name, c
_addr_chn, x_coord, y_coord ) " + _
                "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_person_id, ZZ_SOCIAL_NETWORK.c_name, ZZ_SOCIAL_NETWORK.c_nam
e_chn, ZZ_SOCIAL_NETWORK.c_index_year, " + _
                "ZZ_SOCIAL_NETWORK.c_addr_name, ZZ_SOCIAL_NETWORK.c_addr_chn, ZZ_SOCIAL_NETWORK.x_coord, ZZ_SOCIA
L_NETWORK.y_coord " + _
                "FROM ZZ_SOCIAL_NETWORK"

            cmdSQL.CommandText = tStr
            cmdSQL.Execute tRecDeleted
            '
            If tRecDeleted = 0 Then
                MsgBox "There are no networks associated with this place."
                Exit Sub
            End If
            '
            ' to get the edges, just copy the relevant records into ZZ_SOCIAL_NETWORK
            '
            cmdSQL.CommandText = "Delete * from ZZ_SOCIAL_NETWORK"
            cmdSQL.Execute tRecDeleted
            '
            tStr = "INSERT INTO ZZ_SOCIAL_NETWORK ( c_person_id, c_node_id, c_link_code, c_link_desc, c_link_chn
) " + _
                "SELECT DISTINCT ZZ_PLACE.c_personid, ZZ_PLACE.c_assoc_id, ZZ_PLACE.c_rel_code, ZZ_PLACE.c_rel_de
sc, ZZ_PLACE.c_rel_chn " + _
                "FROM ZZ_PLACE WHERE (((ZZ_PLACE.c_rel_type)='Kinship')) OR (((ZZ_PLACE.c_rel_type)='Associate Pl
ace'))"

            cmdSQL.CommandText = tStr
            cmdSQL.Execute tRecDeleted
            '
            ' process the two tables
            '
            Set tRstEdge = CurrentDb.OpenRecordset("ZZ_SOCIAL_NETWORK", dbOpenDynaset)
            Set tRstNode = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
            tC = Chr(44) ' the comma
            tQuote = Chr(34) 'the Quote delimiter
            '
            ' first the nodes: define the record structure
            tStr = "nodedef> name VARCHAR" + tC + "label VARCHAR" + tC + "labelvisible BOOLEAN" + tC + "style INT
" + tC + "pinyin VARCHAR(50)" + _
                tC + "indexyear INT" + tC + "addr_name VARCHAR" + tC + "addr_chn VARCHAR" + tC + "latitude DOUBLE
" + tC + "longitude DOUBLE"
            tStream.WriteText tStr, adWriteLine
            '
            With tRstNode
                .MoveFirst
                Do While Not .EOF
                    ' name = the ID of the person
                    tStr = Trim(Str(!c_person_id)) + tC
                    '
                    ' label
                    If IsNull(!c_name_chn) Then
                         tStr = tStr + tC
                    Else
                         tStr = tStr + !c_name_chn + tC
                    End If

                    ' labelvisible = true, style = 4 (text inside a rectangle)
                    tStr = tStr + "true" + tC + "4" + tC

                    ' pinyin = c_name
                    If IsNull(!c_name) Then
                         tStr = tStr + tC
                    Else
                         tStr = tStr + !c_name + tC
                    End If
                    '
                        ' indexyear = c_index_year INT
                      If IsNull(!c_index_year) Then
                            tStr = tStr + "-2000" + tC
                       Else
                            tStr = tStr + Trim(Str(!c_index_year)) + tC
                       End If

                       ' addr_name
                       If IsNull(!c_addr_name) Then
                            tStr = tStr + tC
                       Else
                            tStr = tStr + !c_addr_name + tC
                       End If

                       ' addr_chn
                       If IsNull(!c_addr_chn) Then
                            tStr = tStr + tC
                       Else
                            tStr = tStr + !c_addr_chn + tC
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
                       tStream.WriteText tStr, adWriteLine
                       .MoveNext
                   Loop
               End With
               '
               ' now the edges: define the record structure
               tStr = "edgedef> node1" + tC + "node2" + tC + "label"
               tStream.WriteText tStr, adWriteLine

               With tRstEdge
                   .MoveFirst
                   Do While Not .EOF
                        tStr = Trim(Str(!c_person_id)) + tC
                        '    node1 = str(c_person_id) for node1
                        tStr = tStr + Trim(Str(!c_node_id)) + tC
                        '    node2 = str(c_node_id) for node2
                        '
                        If IsNull(!c_link_desc) Then
                             tStr = tStr + tC
                        Else
                             tStr = tStr + tQuote + !c_link_desc + tQuote
                        End If
                        '    label = the association
                        '
                        tStream.WriteText tStr, adWriteLine
                        .MoveNext
                   Loop
               End With
               '
               ' now make sure all the data is copied to tStream
               tStream.Flush
               ' and write the stream to the file
               tStream.SaveToFile tFileName, adSaveCreateOverWrite
               '
               Set tRstNode = Nothing
               Set tRstEdge = Nothing
               Set tStream = Nothing

               cmdSQL.CommandText = "Delete * from ZZ_SOCIAL_NETWORK"
               cmdSQL.Execute tRecDeleted
               '
               cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
               cmdSQL.Execute tRecDeleted

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
    Dim tLabelLanguage(3, 35) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

          Do While ti < 35 And Not .EOF
              If !c_form = "LAP" Then
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
        Me.CmdSelectPlace.Caption = tLabelLanguage(tLang, 3)
        Me.CmdImportPlaces.Caption = tLabelLanguage(tLang, 4)
        Me.CmdQuery.Caption = tLabelLanguage(tLang, 5)
        Me.CmdGephi.Caption = tLabelLanguage(tLang, 6)
        Me.CmdPajek.Caption = tLabelLanguage(tLang, 7)
        Me.CmdFanti.Caption = tLabelLanguage(tLang, 8)
        Me.CmdJianti.Caption = tLabelLanguage(tLang, 9)
        Me.LblChkXYRef.Caption = tLabelLanguage(tLang, 10)
        'Me.LblChkIndexYears.Caption = tLabelLanguage(tLang, 11)
        Me.LblChkIndividual.Caption = tLabelLanguage(tLang, 12)
        Me.LblChkInstitution.Caption = tLabelLanguage(tLang, 13)
        Me.LblChkEntry.Caption = tLabelLanguage(tLang, 14)
        Me.LblChkKin.Caption = tLabelLanguage(tLang, 15)
        Me.LblChkAssocPerson.Caption = tLabelLanguage(tLang, 16)
        Me.LblChkAssocPlace.Caption = tLabelLanguage(tLang, 17)
        Me.LblChkOffice.Caption = tLabelLanguage(tLang, 18)
        Me.CmdStoreID.Caption = tLabelLanguage(tLang, 19)
        Me.CmdUCINet.Caption = tLabelLanguage(tLang, 20)
        Me.LblDynasties.Caption = tLabelLanguage(tLang, 21)
        Me.CmdFromDynasty.Caption = tLabelLanguage(tLang, 22)
        Me.CmdToDynasty.Caption = tLabelLanguage(tLang, 23)
        Me.CmdAllDynasties.Caption = tLabelLanguage(tLang, 24)
        Me.LblIndexYears.Caption = tLabelLanguage(tLang, 25)
        Me.LblOptNoDates.Caption = tLabelLanguage(tLang, 26)
        Me.LblOptIndexYears.Caption = tLabelLanguage(tLang, 27)
        Me.LblOptDynasties.Caption = tLabelLanguage(tLang, 28)
        Me.LblChkSubUnits.Caption = tLabelLanguage(tLang, 29)
        Me.CmdNeo4j.Caption = tLabelLanguage(tLang, 30)
        Me.PlacePage.Caption = tLabelLanguage(tLang, 31)
        Me.PagePeoplePlaceAgg.Caption = tLabelLanguage(tLang, 32)
        Me.PagePeople.Caption = tLabelLanguage(tLang, 33)
        Me.CmdPickBAC.Caption = tLabelLanguage(tLang, 34)
    End If

End Sub

Private Sub QueryOK()
    If Not gUseADDRID Then
         CmdQuery.Enabled = False
         Exit Sub
    ElseIf Me.ChkAssocPerson.Value Then
         CmdQuery.Enabled = True
    ElseIf Me.ChkAssocPlace.Value Then
         CmdQuery.Enabled = True
    ElseIf Me.ChkEntry.Value Then
         CmdQuery.Enabled = True
    ElseIf Me.ChkIndividual.Value Then
         CmdQuery.Enabled = True
    ElseIf Me.ChkInstitution.Value Then
         CmdQuery.Enabled = True
    ElseIf Me.ChkKin.Value Then
         CmdQuery.Enabled = True
    ElseIf Me.ChkOffice.Value Then
         CmdQuery.Enabled = True
    Else
         CmdQuery.Enabled = False
    End If
End Sub
Private Sub CmdStoreID_Click()
    Dim cmdSQL As ADODB.Command, tRecCount As Variant

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

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

    tStrQuery = "INSERT INTO ZZ_STORE_PERSON_ID ( c_personid ) SELECT DISTINCT ZZ_PLACE.c_personid FROM ZZ_PLACE"

    cmdSQL.CommandText = tStrQuery
    cmdSQL.Execute tRecCount
    MsgBox "Person IDs successfully stored. Click on 'Recall Person IDs' to reuse these IDs in other forms."
    '
    ' update storage source
    cmdSQL.CommandText = "UPDATE PersonIDSource SET SourceForm ='Place' WHERE PersonIDSource.LineNum =1"
    cmdSQL.Execute tRecCount

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

    gUseIndexYears = False
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

    End If

End Sub
Private Sub CmdPajek_Click_Old()
On Error GoTo Err_CmdPajek_Click_Old
    '
    ' This program will dump the results of the search to a .net file
    '
    ' for the moment I'll just describe the format of the .gdf file
    '
    ' *Vertices NUM
    ' ID label "box" ic [color] bc [color]
    '      ID = str(c_person_id)
    '      label = c_name_chn
    '      color = red (1), orange (2), yellow (3), green (4), blue (5)
    '
    ' *Edges
    ' node1 node2 1 l "label"
    '      node1 = str(c_person_id) for node1
    '      node2 = str(c_node_id) for node2
    '      color = red (1), orange (2), yellow (3), green (4), blue (5)
    '      label = c_link_desc
    '
    '
    ' first see if there are any records to process
    '
    If frmZZZ_PLACE.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdPajek_Click_Old
    End If
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tRstNode As DAO.Recordset, tRstNodeList As DAO.Recordset
    Dim tRstEdge As DAO.Recordset, tRstAssocType As DAO.Recordset
    Dim tRstAssocCodeType As DAO.Recordset, tRstEdgeList As DAO.Recordset
    Dim tStr As String, tC As String, ti As Integer, tQuote As String, tFindStr As String
    Dim tColor(20) As String, tStrNode1 As String, tStrNode2 As String, tCodeStr As String

    ' to write to a UTF-8 file, use the ADO stream object
    Dim tStream As ADODB.Stream
    Set tStream = New ADODB.Stream
    If CodeFrame.Value = 1 Then
         tStream.Charset = "utf-8"
         tCodeStr = "UTF8.net"
    ElseIf CodeFrame.Value = 2 Then
         tStream.Charset = "big5"
         tCodeStr = "BIG5.net"
    Else
         tStream.Charset = "gb18030"
         tCodeStr = "GB18030.net"
    End If
    tStream.Mode = adModeReadWrite
    tStream.Type = adTypeText
    tStream.Open


    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)


    'Use a With...End With block to reference the FileDialog object.
    With dlgSaveAs
        .InitialFileName = "network_" + tCodeStr
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
                 GoTo Exit_CmdPajek_Click_Old
            End If
            '
            ' zap and open the scratch file
            '
            Dim cmdSQL As ADODB.Command
            Set cmdSQL = New ADODB.Command
            cmdSQL.ActiveConnection = CurrentProject.Connection
            cmdSQL.CommandType = adCmdText
            '
            cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PAJEK"
            cmdSQL.Execute tRecDeleted
            '
            Set tRstNodeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK", dbOpenTable)
            tRstNodeList.Index = "c_ID"
            '
            cmdSQL.CommandText = "Delete from ZZ_SCRATCH_PAJEK_EDGE where c_node_1 > -100"
            cmdSQL.Execute tRecDeleted
            '
            Set tRstEdgeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK_EDGE", dbOpenDynaset)
            '
            ' now prepare the node list by getting all the person ID and the assoc IDs
            '
            ' the strategy is to dump both into ZZ_SOCIAL_NETWORK and then copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = "Delete * from ZZ_SOCIAL_NETWORK"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
            cmdSQL.Execute tRecDeleted

            tStr = "INSERT INTO ZZ_SOCIAL_NETWORK ( c_person_id, c_name, c_name_chn, c_index_year ) " + _
                "SELECT DISTINCT ZZ_PLACE.c_personid, ZZ_PLACE.c_name, ZZ_PLACE.c_name_chn, ZZ_PLACE.c_index_year
 " + _
                "FROM ZZ_PLACE WHERE (((ZZ_PLACE.c_rel_type)='Kinship')) OR (((ZZ_PLACE.c_rel_type)='Associate Pl
ace'))"

            cmdSQL.CommandText = tStr
            cmdSQL.Execute tRecDeleted
            '
            If tRecDeleted = 0 Then
                MsgBox "There are no networks associated with this place."
                Exit Sub
            End If

            tStr = "INSERT INTO ZZ_SOCIAL_NETWORK ( c_person_id, c_name, c_name_chn, c_index_year ) " + _
                "SELECT DISTINCT ZZ_PLACE.c_assoc_id, ZZ_PLACE.c_assoc_name, ZZ_PLACE.c_assoc_chn, ZZ_PLACE.c_ass
oc_index_year " + _
                "FROM ZZ_PLACE WHERE (((ZZ_PLACE.c_rel_type)='Kinship')) OR (((ZZ_PLACE.c_rel_type)='Associate Pl
ace'))"

            cmdSQL.CommandText = tStr
            cmdSQL.Execute tRecDeleted
            '
            ' now copy to create the nodes table
            '
            tStr = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year ) " + _
                "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_person_id, ZZ_SOCIAL_NETWORK.c_name, ZZ_SOCIAL_NETWORK.c_nam
e_chn, ZZ_SOCIAL_NETWORK.c_index_year " + _
                "FROM ZZ_SOCIAL_NETWORK"

            cmdSQL.CommandText = tStr
            cmdSQL.Execute tRecDeleted
            '
            ' to get the edges, just copy the relevant records into ZZ_SOCIAL_NETWORK
            '
            cmdSQL.CommandText = "Delete * from ZZ_SOCIAL_NETWORK"
            cmdSQL.Execute tRecDeleted
            '
            tStr = "INSERT INTO ZZ_SOCIAL_NETWORK ( c_person_id, c_node_id, c_link_code, c_link_desc, c_link_chn
) " + _
                "SELECT DISTINCT ZZ_PLACE.c_personid, ZZ_PLACE.c_assoc_id, ZZ_PLACE.c_rel_code, ZZ_PLACE.c_rel_de
sc, ZZ_PLACE.c_rel_chn " + _
                "FROM ZZ_PLACE WHERE (((ZZ_PLACE.c_rel_type)='Kinship')) OR (((ZZ_PLACE.c_rel_type)='Associate Pl
ace'))"

            cmdSQL.CommandText = tStr
            cmdSQL.Execute tRecDeleted
            '
            '
            ' set the Quote delimiter
            '
            tQuote = Chr(34)
            '
            ' define the colors for the nodes
            '
            tColor(1) = "White"
            tColor(2) = "Blue"
            tColor(3) = "Green"
            tColor(4) = "Yellow"
            tColor(5) = "Orange"
            For ti = 6 To 20
                 tColor(ti) = "Red"
            Next
            '
            ' process the two tables
            '
            Set tRstEdge = CurrentDb.OpenRecordset("ZZ_SOCIAL_NETWORK", dbOpenDynaset)
            Set tRstNode = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
            tC = Chr(44) ' the comma
            '
            ' first the nodes: define the record structure
            '
            tStr = "*Vertices " + Trim(Str(tRstNode.RecordCount))
            tStream.WriteText tStr, adWriteLine
            '
            ti = 1
            With tRstNode
                 .MoveFirst
                 Do While Not .EOF
                      tStream.WriteText Trim(Str(ti)) + " "
                      '
                      If IsNull(!c_name_chn) Then
                           If !c_name = "" Or Left(!c_name, 12) = "**BAD DATA**" Then
                                tStream.WriteText Chr(34)
                                tStream.WriteText "Error-" + Trim(Str(!c_person_id))
                                tStream.WriteText Chr(34)
                                tStream.WriteText " box ", adWriteLine
                           Else
                                tStream.WriteText Chr(34)
                                tStream.WriteText !c_name
                                tStream.WriteText Chr(34)
                                tStream.WriteText " box ", adWriteLine
                           End If
                      Else
                           If !c_name_chn = "" Then
                                If !c_name = "" Or Left(!c_name, 12) = "**BAD DATA**" Then
                                     tStream.WriteText Chr(34)
                                     tStream.WriteText "Error-" + Trim(Str(!c_person_id))
                                     tStream.WriteText Chr(34)
                                     tStream.WriteText " box ", adWriteLine
                                Else
                                     tStream.WriteText Chr(34)
                                     tStream.WriteText !c_name
                                     tStream.WriteText Chr(34)
                                     tStream.WriteText " box ", adWriteLine
                                End If
                           Else
                                tStream.WriteText Chr(34)
                                tStream.WriteText !c_name_chn
                                tStream.WriteText Chr(34)
                                tStream.WriteText " box ", adWriteLine
                           End If
                      End If
                      '
                      ' add the node to the list
                      '
                      tRstNodeList.AddNew
                      tRstNodeList!c_v_num = Str(ti)
                      tRstNodeList!c_ID = !c_person_id
                      tRstNodeList.Update
                      '
                      .MoveNext
                      ti = ti + 1
                 Loop
            End With
            '
            ' now the edges: define the record structure
            '
            tStream.WriteText "*Edges", adWriteLine

            With tRstEdge
                .MoveFirst
                Do While Not .EOF
                    ' the problem with the Network Workbench is that it cannot accept
                    ' parallel edges, so I first accumulate all edges (adding up duplicates)
                    ' and then write the scratch table to the file
                    '
                    ' find the vertex number of the first node
                       tRstNodeList.Seek "=", Str(!c_person_id)
                       If Not tRstNodeList.NoMatch Then
                           '
                           tStrNode1 = tRstNodeList!c_v_num
                           '
                           ' find the vertex number of the second node
                           '
                           tRstNodeList.Seek "=", Str(!c_node_id)
                           If Not tRstNodeList.NoMatch Then
                               '
                               ' see if an edge already exists
                               '
                               tStrNode2 = tRstNodeList!c_v_num
                               tStr = "c_node_1 = " + tStrNode1 + " and c_node_2 = " + tStrNode2
                               tRstEdgeList.FindFirst tStr
                               If tRstEdgeList.NoMatch Then
                                    ' look for the other way around
                                    tStr = "c_node_2 = " + tStrNode1 + " and c_node_1 = " + tStrNode2
                                    tRstEdgeList.FindFirst tStr
                                    If tRstEdgeList.NoMatch Then
                                         ' add the edge
                                         '
                                         tRstEdgeList.AddNew
                                         tRstEdgeList!c_node_1 = Val(tStrNode1)
                                         tRstEdgeList!c_node_2 = Val(tStrNode2)
                                         tRstEdgeList!c_edge_count = 1
                                         tRstEdgeList!c_edge_desc = !c_link_desc
                                         '
                                         ' process the label now
                                         '
                                         tRstEdgeList.Update
                                    Else
                                         ' update the count
                                         ti = tRstEdgeList!c_edge_count + 1
                                         '
                                         tRstEdgeList.Edit
                                         '
                                         tRstEdgeList!c_edge_count = ti
                                         tRstEdgeList.Update
                                    End If
                               Else
                                    ' update the count
                                    ti = tRstEdgeList!c_edge_count + 1
                                    '
                                    tRstEdgeList.Edit
                                    '
                                    tRstEdgeList!c_edge_count = ti
                                    tRstEdgeList.Update
                               End If
                           End If
                       End If
                       .MoveNext
                Loop
            End With

            If tRstEdgeList.RecordCount > 0 Then
                With tRstEdgeList
                .MoveFirst
                Do While Not .EOF
                    tStr = Trim(Str(!c_node_1)) + " " + Trim(Str(!c_node_2))
                    '
                    ' now get the weight
                    '
                    If !c_edge_count < 6 Then
                         tStr = tStr + " " + Trim(Str(!c_edge_count)) + " "
                    Else
                         tStr = tStr + " 5 "
                    End If
                    '
                    ' now get the label
                    '
                    tStr = tStr + "l " + tQuote
                    If !c_edge_count = 1 Then
                         tStr = tStr + !c_edge_desc + tQuote + " "
                    Else
                         tStr = tStr + Trim(Str(!c_edge_count)) + " links" + tQuote + " "
                         '
                    End If

                       tStream.WriteText tStr, adWriteLine
                         '
                         .MoveNext
                     Loop
                     End With
                 End If
                 '
                 ' now make sure all the data is copied to tStream
                 tStream.Flush
                 ' and write the stream to the file
                 tStream.SaveToFile tFileName, adSaveCreateOverWrite
                 '
                 tRstNodeList.Close

                 tStream.Close
                 Set tStream = Nothing
                 '
                 Set tRstNode = Nothing
                 Set tRstEdge = Nothing
                 Set tGDF = Nothing
                 Set tFileSystem = Nothing
                 Set tRstNodeList = Nothing
                 Set tRstEdgeList = Nothing

                 cmdSQL.CommandText = "Delete * from ZZ_SOCIAL_NETWORK"
                 cmdSQL.Execute tRecDeleted
                 '
                 cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
                 cmdSQL.Execute tRecDeleted

          Else
             'The user pressed Cancel.
        End If
    End With

    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdPajek_Click_Old:
    Exit Sub

Err_CmdPajek_Click_Old:
    MsgBox Err.Description
    Resume Exit_CmdPajek_Click_Old

End Sub

Private Sub getAggregatedRecords()
    Dim cmdSQL As ADODB.Command, tRst As DAO.Recordset, tRecCount As Long

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    ' first, the aggregation
    '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
    cmdSQL.Execute tRecCount
    '
    cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, c_female
, c_dy, c_dynasty_chn, c_addr_id, c_addr_name, c_addr_chn, " + _
            "x_coord, y_coord, xy_count ) " + _
        "SELECT ZZ_PLACE.c_personid, ZZ_PLACE.c_name, ZZ_PLACE.c_name_chn, ZZ_PLACE.c_index_year, ZZ_PLACE.c_fema
le, ZZ_PLACE.c_dy, ZZ_PLACE.c_dynasty_chn, ZZ_PLACE.c_addr_id, " + _
               "ZZ_PLACE.c_addr_name, ZZ_PLACE.c_addr_chn, ZZ_PLACE.x_coord, ZZ_PLACE.y_coord, Count(ZZ_PLACE.c_p
ersonid) AS CountOfc_personid " + _
        "FROM ZZ_PLACE " + _
        "GROUP BY ZZ_PLACE.c_personid, ZZ_PLACE.c_name, ZZ_PLACE.c_name_chn, ZZ_PLACE.c_index_year, ZZ_PLACE.c_fe
male, ZZ_PLACE.c_dy, ZZ_PLACE.c_dynasty_chn, " + _
               "ZZ_PLACE.c_addr_id, ZZ_PLACE.c_addr_name, ZZ_PLACE.c_addr_chn, ZZ_PLACE.x_coord, ZZ_PLACE.y_coord
"
    cmdSQL.Execute tRecCount
    '
    ' now get the records where a person and an address appear just once
    '
    cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_PLACE_AGG ( c_personid, c_name, c_name_chn, c_index_year, c_fema
le, c_dy, c_dynasty, c_dynasty_chn, place_addr_id, " + _
                "place_addr_hz, place_addr_py, place_x_coord, place_y_coord, c_rel_desc, c_rel_type, c_rel_code,
c_rel_chn ) " + _
            "SELECT DISTINCT ZZ_PLACE.c_personid, ZZ_PLACE.c_name, ZZ_PLACE.c_name_chn, ZZ_PLACE.c_index_year, ZZ
_PLACE.c_female, ZZ_PLACE.c_dy, ZZ_PLACE.c_dynasty, " + _
                "ZZ_PLACE.c_dynasty_chn, ZZ_PLACE.c_addr_id, ZZ_PLACE.c_addr_chn, ZZ_PLACE.c_addr_name, ZZ_PLACE.
x_coord, ZZ_PLACE.y_coord, ZZ_PLACE.c_rel_desc, " + _
                "ZZ_PLACE.c_rel_type, ZZ_PLACE.c_rel_code, ZZ_PLACE.c_rel_chn " + _
            "FROM ZZ_PLACE INNER JOIN ZZ_SCRATCH_PEOPLE ON (ZZ_PLACE.c_addr_id = ZZ_SCRATCH_PEOPLE.c_addr_id) AND
 (ZZ_PLACE.c_personid = ZZ_SCRATCH_PEOPLE.c_person_id) " + _
            "WHERE (((ZZ_SCRATCH_PEOPLE.xy_count)=1))"
    cmdSQL.Execute tRecCount
    '
    ' now get the rest
    '
    cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_PLACE_AGG ( c_personid, c_name, c_name_chn, c_index_year, c_fema
le, c_dy, c_dynasty, c_dynasty_chn, place_addr_id, " + _
                "place_addr_hz, place_addr_py, place_x_coord, place_y_coord, c_rel_desc, c_rel_type, c_rel_code,
c_rel_chn ) " + _
            "SELECT DISTINCT ZZ_SCRATCH_PEOPLE.c_person_id, ZZ_SCRATCH_PEOPLE.c_name, ZZ_SCRATCH_PEOPLE.c_name_ch
n, ZZ_SCRATCH_PEOPLE.c_index_year, ZZ_SCRATCH_PEOPLE.c_female, " + _
                "ZZ_SCRATCH_PEOPLE.c_dy, ZZ_SCRATCH_PEOPLE.c_dynasty, ZZ_SCRATCH_PEOPLE.c_dynasty_chn, ZZ_SCRATCH
_PEOPLE.c_addr_id, ZZ_SCRATCH_PEOPLE.c_addr_chn, " + _
                "ZZ_SCRATCH_PEOPLE.c_addr_name, ZZ_SCRATCH_PEOPLE.x_coord, ZZ_SCRATCH_PEOPLE.y_coord, 'Multiple R
elations' AS rel_desc, 'Multiple' AS rel_type, 0 AS rel_code, " + _
                "'" + ChrW(22810) + ChrW(31278) + ChrW(38365) + ChrW(20418) + "' AS c_rel_chn " + _
            "FROM ZZ_SCRATCH_PEOPLE " + _
            "WHERE (((ZZ_SCRATCH_PEOPLE.xy_count)>1))"
    cmdSQL.Execute tRecCount
    '
    ' get the xy count
    '
    If tRecCount > 0 Then
            '
        cmdSQL.CommandText = "Delete * from tmpXY"
        cmdSQL.Execute tRecDeleted
        '
        cmdSQL.CommandText = "INSERT INTO tmpXY ( x_coord, y_coord, CountOfx_coord, CountOfy_coord ) " + _
            "SELECT ZZ_SCRATCH_PLACE_AGG.place_x_coord, ZZ_SCRATCH_PLACE_AGG.place_y_coord, Count(ZZ_SCRATCH_PLAC
E_AGG.place_x_coord) AS CountOfx_coord, " + _
                "Count(ZZ_SCRATCH_PLACE_AGG.place_y_coord) AS CountOfy_coord " + _
            "FROM ZZ_SCRATCH_PLACE_AGG " + _
            "GROUP BY ZZ_SCRATCH_PLACE_AGG.place_x_coord, ZZ_SCRATCH_PLACE_AGG.place_y_coord"
        '
        cmdSQL.Execute tRecCount
        '
        cmdSQL.CommandText = "UPDATE tmpXY INNER JOIN ZZ_SCRATCH_PLACE_AGG ON (tmpXY.y_coord = ZZ_SCRATCH_PLACE_A
GG.place_y_coord) " + _
                "AND (tmpXY.x_coord = ZZ_SCRATCH_PLACE_AGG.place_x_coord) " + _
            "SET ZZ_SCRATCH_PLACE_AGG.xy_count = [tmpXY].[CountOfx_coord]"

        cmdSQL.Execute tRecCount
    End If
    '
    ' now fill in the addition index address data
    '
    cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_PLACE_AGG INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_PLACE_AGG.c_personid
 = ZZZ_BIOG_MAIN.c_personid " + _
        "SET ZZ_SCRATCH_PLACE_AGG.c_index_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], " + _
            "ZZ_SCRATCH_PLACE_AGG.c_index_addr_py = [ZZZ_BIOG_MAIN].[c_index_addr_name], " + _
            "ZZ_SCRATCH_PLACE_AGG.c_index_addr_hz = [ZZZ_BIOG_MAIN].[c_index_addr_chn], " + _
            "ZZ_SCRATCH_PLACE_AGG.index_addr_x_coord = [ZZZ_BIOG_MAIN].[x_coord], " + _
            "ZZ_SCRATCH_PLACE_AGG.index_addr_y_coord = [ZZZ_BIOG_MAIN].[y_coord]"
    cmdSQL.Execute tRecCount

    Set tRst = CurrentDb.OpenRecordset("ZZ_SCRATCH_PLACE_AGG", dbOpenDynaset)
    Set ZZ_SCRATCH_PLACE_AGG.Form.Recordset = tRst

End Sub
Private Sub getPeopleRecords()
    Dim cmdSQL As ADODB.Command, tRst As DAO.Recordset, tRecCount As Long

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    ' distinct people
    '
    cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_PLACE_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, c_
female, c_dy, c_dynasty, c_dynasty_chn, " + _
            "c_index_addr_id, c_index_addr_py, c_index_addr_hz, x_coord, y_coord ) " + _
        "SELECT DISTINCT ZZ_SCRATCH_PLACE_AGG.c_personid, ZZ_SCRATCH_PLACE_AGG.c_name, ZZ_SCRATCH_PLACE_AGG.c_nam
e_chn, ZZ_SCRATCH_PLACE_AGG.c_index_year, " + _
            "ZZ_SCRATCH_PLACE_AGG.c_female, ZZ_SCRATCH_PLACE_AGG.c_dy, ZZ_SCRATCH_PLACE_AGG.c_dynasty, ZZ_SCRATCH
_PLACE_AGG.c_dynasty_chn, ZZ_SCRATCH_PLACE_AGG.c_index_addr_id, " + _
            "ZZ_SCRATCH_PLACE_AGG.c_index_addr_py, ZZ_SCRATCH_PLACE_AGG.c_index_addr_hz, ZZ_SCRATCH_PLACE_AGG.ind
ex_addr_x_coord, ZZ_SCRATCH_PLACE_AGG.index_addr_y_coord " + _
        "FROM ZZ_SCRATCH_PLACE_AGG"
    cmdSQL.Execute tRecCount

    If tRecCount > 0 Then
            '
        cmdSQL.CommandText = "Delete * from tmpXY"
        cmdSQL.Execute tRecDeleted
        '
        cmdSQL.CommandText = "INSERT INTO tmpXY ( x_coord, y_coord, CountOfx_coord, CountOfy_coord ) " + _
            "SELECT ZZ_SCRATCH_PLACE_PEOPLE.x_coord, ZZ_SCRATCH_PLACE_PEOPLE.y_coord, Count(ZZ_SCRATCH_PLACE_PEOP
LE.x_coord) AS CountOfx_coord, " + _
                "Count(ZZ_SCRATCH_PLACE_PEOPLE.y_coord) AS CountOfy_coord " + _
            "FROM ZZ_SCRATCH_PLACE_PEOPLE " + _
            "GROUP BY ZZ_SCRATCH_PLACE_PEOPLE.x_coord, ZZ_SCRATCH_PLACE_PEOPLE.y_coord"
        '
        cmdSQL.Execute tRecCount
        '
        cmdSQL.CommandText = "UPDATE tmpXY INNER JOIN ZZ_SCRATCH_PLACE_PEOPLE ON (tmpXY.y_coord = ZZ_SCRATCH_PLAC
E_PEOPLE.y_coord) AND (tmpXY.x_coord = ZZ_SCRATCH_PLACE_PEOPLE.x_coord) " + _
            "SET ZZ_SCRATCH_PLACE_PEOPLE.xy_count = [tmpXY].[CountOfx_coord]"

        cmdSQL.Execute tRecCount
    End If

    Set tRst = CurrentDb.OpenRecordset("ZZ_SCRATCH_PLACE_PEOPLE", dbOpenDynaset)
    Set ZZ_SCRATCH_PLACE_PEOPLE.Form.Recordset = tRst

End Sub

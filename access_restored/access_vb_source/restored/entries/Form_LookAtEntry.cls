
Private Sub CmdNeo4j_Click()
On Error GoTo Err_CmdNeo4j_Click
    '
    ' This program will dump the results of the search to five CSV files
    '
    ' for the moment I'll just describe the format of the CSV file
    ' Note: Neo4j seems to treat all fields as strings, so there is no need to explicitly mark strings
    '
    ' 1. People.CSV
    '       nameID = c_person_id
    '       nameHZ = c_name_chn
    '       namePY = c_name
    '       indexyear = c_index_year
    '       personDynasty = c_dynasty
    '       sex = c_female > (F,M)
    '
    ' 2. Places.CSV
    '       placeID = c_addr_id
    '       placeHZ = c_addr_chn
    '       placePY = c_addr_name
    '       placeX = x_coord
    '       placeY = y_coord
    '
    ' 3. PeoplePlaces.CSV
    '       nameID
    '       placeID
    '       personPlaceRelation
    '
    ' 4. PeopleEntry.CSV
    '       nameID = str(c_person_id)
    '       entryID = str(c_node_id)
    '       entryPlaceID
    '       kinID
    '       kinRelID
    '       AssocPersonID
    '       AssocRelID
    '       SocialInstID
    '       SocialInstNameID
    '       EntryYear
    '       EntryDynasty
    '
    ' 5. PeoplePlaceCodes
    '
    ' 6. EntryCodes.CSV
    '       entryID = str(c_entry_id)
    '       entryDesc = c_entry_desc
    '
    ' 7. KinCodes.CSV
    '       kinCode
    '       kinDesc
    '
    ' 8. AssocCodes.CSV
    '
    ' 9. Institution codes
    '
    ' first see if there are any records to process
    '
    If Entry_Address_Query.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdNeo4j_Click
    End If
    '
    ' warn the user that a lot of files will be created
    '
    MsgBox "Neo4j requires that from 6 to 9 files be created."
    '
    ' allocate the file variables
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer, tFileName As String, tFN As Variant
    '
    ' next get the People file
    '
    Dim tRstPeople As DAO.Recordset, tRstEntry As DAO.Recordset, tRstEntryCodes As DAO.Recordset, tRstPlace As DA
O.Recordset
    Dim tRstPeopleEntry As DAO.Recordset, tRstPeoplePlace As DAO.Recordset, tStr As String, tC As String, ti As I
nteger, tUseList As Boolean
    Dim tQueryStr As String, tPersonID As Long
    Dim gStream As ADODB.Stream, tCodeStr As String
    '
    ' the optional recordsets
    '
    Dim tRstKinCodes As DAO.Recordset, tRstAssocCodes As DAO.Recordset, tRstInstitutions As DAO.Recordset
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
    ' prepare the temp tables for the people, place, peoplePlace and entry data

    Dim cmdSQL As ADODB.Command
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    ' start with people: there will be three sources for people.
    '   the people who entered
    '   the kin who might have had a role in entry
    '   the associates who might have played a role
    ' the strategy is to just dump all such IDs to a scratch table and append (distinct) to a table for export
    ' ZZ_SCRATCH_P_TEXT is a convenient table for collecting IDs (no primary key)

    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_P_TEXT"
    cmdSQL.Execute tRecDeleted
    '
    ' get the people IDs
    '
    tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) SELECT DISTINCT ZZ_SCRATCH_ENTRY.c_personid FROM Z
Z_SCRATCH_ENTRY"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) SELECT DISTINCT ZZ_SCRATCH_ENTRY.c_kin_id FROM ZZ_
SCRATCH_ENTRY " + _
                 "WHERE (((ZZ_SCRATCH_ENTRY.c_kin_id)>0))"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) SELECT DISTINCT ZZ_SCRATCH_ENTRY.c_assoc_id FROM Z
Z_SCRATCH_ENTRY " + _
                 "WHERE (((ZZ_SCRATCH_ENTRY.c_assoc_id)>0));"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    ' now clear ZZ_SCRATCH_PEOPLE and copy the records
    '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, c_dynasty, c_dyna
sty_chn, c_female, c_addr_id, " + _
                     "c_addr_name, c_addr_chn, c_addr_type, c_addr_desc, c_addr_desc_chn, x_coord, y_coord ) " + _
                 "SELECT DISTINCT ZZ_SCRATCH_P_TEXT.c_person_id, ZZZ_BIOG_MAIN.c_name, ZZZ_BIOG_MAIN.c_name_chn, Z
ZZ_BIOG_MAIN.c_index_year, " + _
                    "ZZZ_BIOG_MAIN.c_dynasty, ZZZ_BIOG_MAIN.c_dynasty_chn, ZZZ_BIOG_MAIN.c_female, ZZZ_BIOG_MAIN.
c_index_addr_id, " + _
                    "ZZZ_BIOG_MAIN.c_index_addr_name, ZZZ_BIOG_MAIN.c_index_addr_chn, ZZZ_BIOG_MAIN.c_index_addr_
type_code, ZZZ_BIOG_MAIN.c_index_addr_type_desc, " + _
                    "ZZZ_BIOG_MAIN.c_index_addr_type_chn, ZZZ_BIOG_MAIN.x_coord, ZZZ_BIOG_MAIN.y_coord " + _
                "FROM ZZ_SCRATCH_P_TEXT INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_P_TEXT.c_person_id = ZZZ_BIOG_MAIN
.c_personid"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    Set tRstPeopleEntry = CurrentDb.OpenRecordset("ZZ_SCRATCH_ENTRY", dbOpenDynaset)
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
    ' now the PeopleEntry file
    '
    dlgSaveAs.InitialFileName = "PeopleEntry_" + tCodeStr + ".csv"
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

           tStr = "NameID" + tC + "EntryCode" + tC + "EntryPlaceID" + tC + "KinID" + tC + "KinRelCode" + tC + _
                   "AssocPersonID" + tC + "AssocRelCode" + tC + "SocialInstID" + tC + "EntryYear" + tC + "EntryDynas
ty"
        gStream.WriteText tStr, adWriteLine
        '
        With tRstPeopleEntry
            .MoveFirst
            Do While Not .EOF
                ' the ID of the person
                tStr = Trim(Str(!c_personid)) + tC
                '
                ' entry code
                '
                If IsNull(!c_entry_code) Then
                     tStr = tStr + "0" + tC
                Else
                     tStr = tStr + Trim(Str(!c_entry_code)) + tC
                End If
                '
                ' entry addr id
                '
                If IsNull(!c_entry_addr_id) Then
                     tStr = tStr + "0" + tC
                Else
                     tStr = tStr + Trim(Str(!c_entry_addr_id)) + tC
                End If
                '
                ' kin ID
                '
                If IsNull(!c_kin_id) Then
                     tStr = tStr + "0" + tC
                Else
                     tStr = tStr + Trim(Str(!c_kin_id)) + tC
                End If
                '
                ' kin rel ID
                '
                If IsNull(!c_kin_code) Then
                     tStr = tStr + "0" + tC
                Else
                     tStr = tStr + Trim(Str(!c_kin_code)) + tC
                End If
                '
                ' assoc ID
                '
                If IsNull(!c_assoc_id) Then
                     tStr = tStr + "0" + tC
                Else
                     tStr = tStr + Trim(Str(!c_assoc_id)) + tC
                End If
                '
                ' assoc desc
                '
                If IsNull(!c_assoc_code) Then
                     tStr = tStr + "N/A" + tC
                Else
                     tStr = tStr + Trim(Str(!c_assoc_code)) + tC
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
                ' entry year
                '
                If IsNull(!c_year) Then
                     tStr = tStr + "0" + tC
                Else
                     tStr = tStr + Trim(Str(!c_year)) + tC
                End If
                '
                ' dynasty
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
         ' there are three sources of places: the list of people, the entry locations, and the list of institutio
ns
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
                    "SELECT DISTINCT ZZ_SCRATCH_ENTRY.c_entry_addr_id, ZZ_SCRATCH_ENTRY.c_entry_addr_name, ZZ_SCR
ATCH_ENTRY.c_entry_addr_chn, " + _
                        "ZZ_SCRATCH_ENTRY.c_entry_xcoord, ZZ_SCRATCH_ENTRY.c_entry_ycoord " + _
                    "FROM ZZ_SCRATCH_ENTRY " + _
                    "WHERE (((ZZ_SCRATCH_ENTRY.c_entry_addr_id)>0))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_addr_id, c_addr_name, c_addr_chn, x_coord, y_coord ) " + _
                    "SELECT DISTINCT SOCIAL_INSTITUTION_ADDR.c_inst_addr_id, ADDR_CODES.c_name, ADDR_CODES.c_name
_chn, ADDR_CODES.x_coord, ADDR_CODES.y_coord " + _
                    "FROM ADDR_CODES INNER JOIN (ZZ_SCRATCH_ENTRY INNER JOIN SOCIAL_INSTITUTION_ADDR " + _
                        "ON (ZZ_SCRATCH_ENTRY.c_inst_name_code = SOCIAL_INSTITUTION_ADDR.c_inst_name_code) " + _
                        "AND (ZZ_SCRATCH_ENTRY.c_inst_code = SOCIAL_INSTITUTION_ADDR.c_inst_code)) " + _
                        "ON (ADDR_CODES.c_addr_id = SOCIAL_INSTITUTION_ADDR.c_inst_addr_id) AND (ADDR_CODES.c_add
r_id = SOCIAL_INSTITUTION_ADDR.c_inst_addr_id) " + _
                    "WHERE (((ZZ_SCRATCH_ENTRY.c_inst_code)>0))"
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
    ' finally, get entry codes, kinship codes, association codes, and institution codes, if there are any
    '
    ' now the EntryCode file
    '
    dlgSaveAs.InitialFileName = "EntryCode_" + tCodeStr + ".csv"
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
              tStr = "EntryCode" + tC + "EntryDesc"
         Else
              tStr = "EntryCode" + tC + "EntryDesc" + tC + "EntryDescHZ"
         End If
         gStream.WriteText tStr, adWriteLine
         '
         ' get the codes
         '
         tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_ENTRY.c_entry_code, ZZ_SCRATCH_ENTRY.c_entry_desc, ZZ_SCRATCH_ENT
RY.c_entry_chn FROM ZZ_SCRATCH_ENTRY"
         Set tRstEntryCode = CurrentDb.OpenRecordset(tQueryStr)
         With tRstEntryCode
              .MoveFirst
              Do While Not .EOF
                   '
                   tStr = Trim(Str(!c_entry_code)) + tC
                   '
                   ' entry desc
                   '
                   If IsNull(!c_entry_desc) Then
                        tStr = tStr + "Missing"
                   Else
                        tStr = tStr + Trim(!c_entry_desc)
                   End If
                   '
                   ' kin ID
                   '
                   If Not (tCodeStr = "ascii") Then
                        tStr = tStr + tC + Trim(!c_entry_chn)
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
    tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) " + _
                   "SELECT DISTINCT ZZ_SCRATCH_ENTRY.c_personid " + _
                   "FROM ZZ_SCRATCH_ENTRY " + _
                   "WHERE (((ZZ_SCRATCH_ENTRY.c_kin_code)>0))"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_ENTRY.c_kin_code, ZZ_SCRATCH_ENTRY.c_kin_desc FROM ZZ_SCRATCH_ENTRY W
HERE (((ZZ_SCRATCH_ENTRY.c_kin_code)>0))"
    '
    If tRecDeleted > 0 Then
         dlgSaveAs.InitialFileName = "KinshipCodes_" + tCodeStr + ".csv"
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
               Set tRstKinCodes = CurrentDb.OpenRecordset(tQueryStr)
               '
               tStr = "KinCode" + tC + "KinDesc"
               gStream.WriteText tStr, adWriteLine
               'tGDF.WriteLine (tStr)

               With tRstKinCodes
                   .MoveFirst
                   Do While Not .EOF
                        If Not IsNull(!c_kin_code) Then
                            tStr = Trim(Str(!c_kin_code)) + tC
                            '
                            tStr = tStr + Trim(!c_kin_desc)
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
               'tGDF.Close
               '
        Else
            'The user pressed Cancel.
        End If
    End If
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_P_TEXT"
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) " + _
                "SELECT DISTINCT ZZ_SCRATCH_ENTRY.c_personid " + _
                "FROM ZZ_SCRATCH_ENTRY " + _
                "WHERE (((ZZ_SCRATCH_ENTRY.c_assoc_code)>0))"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_ENTRY.c_assoc_code, ZZ_SCRATCH_ENTRY.c_assoc_desc, ZZ_SCRATCH_ENTRY.c
_assoc_desc_chn " + _
                "FROM ZZ_SCRATCH_ENTRY WHERE (((ZZ_SCRATCH_ENTRY.c_assoc_code)>0))"

    If tRecDeleted > 0 Then
        dlgSaveAs.InitialFileName = "AssocCodes_" + tCodeStr + ".csv"
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
               Set tRstAssocCodes = CurrentDb.OpenRecordset(tQueryStr)
               '
               If tCodeStr = "ascii" Then
                    tStr = "AssocCode" + tC + "AssocDesc"
               Else
                    tStr = "AssocCode" + tC + "AssocDesc" + tC + "AssocDescHZ"
               End If
               gStream.WriteText tStr, adWriteLine
               'tGDF.WriteLine (tStr)

               With tRstAssocCodes
                   .MoveFirst
                   Do While Not .EOF
                        If Not IsNull(!c_assoc_code) Then
                            tStr = Trim(Str(!c_assoc_code)) + tC
                            '
                            tStr = tStr + Trim(!c_assoc_desc)
                            '
                            If Not (tCodeStr = "ascii") Then
                                tStr = tStr + tC + !c_assoc_desc_chn
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
    '
    ' the final selection is for social institutions
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_P_TEXT"
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) " + _
                "SELECT DISTINCT ZZ_SCRATCH_ENTRY.c_personid " + _
                "FROM ZZ_SCRATCH_ENTRY " + _
                "WHERE (((ZZ_SCRATCH_ENTRY.c_inst_code)>0))"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_ENTRY.c_inst_code, ZZ_SCRATCH_ENTRY.c_inst_name_code, ZZ_SCRATCH_ENTR
Y.c_inst_name_hz, " + _
                    "ZZ_SCRATCH_ENTRY.c_inst_name_py " + _
                "FROM ZZ_SCRATCH_ENTRY WHERE (((ZZ_SCRATCH_ENTRY.c_inst_code)>0))"

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

    MsgBox "Finished saving to Neo4j"

    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdNeo4j_Click:
    Exit Sub

Err_CmdNeo4j_Click:
    MsgBox Err.Description
    Resume Exit_CmdNeo4j_Click

End Sub

Private Sub CmdQuery_Click()
    On Error GoTo Err_CmdQuery_Click

    Dim rst As DAO.Recordset
    Dim EntryQuery As DAO.QueryDef, AddressQuery As DAO.QueryDef
    Dim tRstDummy As DAO.Recordset, tRstAddress As DAO.Recordset
    Dim prm As DAO.Parameter, tRstBiogMain As DAO.Recordset
    Dim tRstKinCodes As DAO.Recordset, tRstADDRID As DAO.Recordset
    Dim tRstAddrList As DAO.Recordset, tQstr As String, tQt As String
    Dim cmdSQL As ADODB.Command, tStrYears As String, tStrFromYear As String, tStrToYear As String, tStrFromAddr
As String, tStrFrom As String

    tQt = Chr(34)

    Set cmdSQL = New ADODB.Command
    '
    ' to clear the table, briefly close and then delete records
    '
    Set gRstPeople = Entry_Address_Query.Form.Recordset
    Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_EC", dbOpenDynaset)
    Set Entry_Address_Query.Form.Recordset = tRstDummy
    gRstPeople.Close
    '
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
        '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_ENTRY"
    cmdSQL.Execute tRecDeleted
    '
    ' now see if address IDs will be used. If so, zap the scratch file and repopulate
    ' by looking for address that belong to the address

    'MsgBox "About to process address"
    If gUseADDRID Then
        '
        ' ZZ_SCRATCH_ADDR has at least one record
        '
        cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_ADDR_LIST"
        cmdSQL.Execute tRecDeleted

         '
         If ChkSubUnits.Value Then
              tQueryStr = "INSERT INTO ZZ_SCRATCH_ADDR_LIST ( c_addr_id ) " + _
                  "SELECT DISTINCT ZZZ_BELONGS_TO.c_addr_id " + _
                  "FROM ZZ_SCRATCH_ADDR INNER JOIN ZZZ_BELONGS_TO ON " + _
                  "ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_BELONGS_TO.c_belongs_to"
         Else
              tQueryStr = "INSERT INTO ZZ_SCRATCH_ADDR_LIST ( c_addr_id ) SELECT DISTINCT c_addr_id FROM ZZ_SCRATCH
_ADDR"
         End If

         cmdSQL.CommandText = tQueryStr
         cmdSQL.Execute tRecDeleted

         '
         ' see if we need to use the historical XY search
         '
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

     tStrFromYear = Str(TxtFromYear.Value)
     tStrToYear = Str(TxtToYear.Value)

     gUseEntryYears = False
     gUseIndexYears = False
     gUseDynasties = False
     If FrameYears.Value = 1 Then     ' Entry Years
         If Not (tStrFromYear = "") And tStrToYear = "" Then
              tStrYears = "(ZZZ_ENTRY_DATA.c_year >=" + Str(TxtFromYear.Value) + ")"
         ElseIf tStrFromYear = "" And Not (tStrToYear = "") Then
              tStrYears = "(ZZZ_ENTRY_DATA.c_year <=" + Str(TxtToYear.Value) + ")"
         ElseIf Not (tStrFromYear = "") And Not (tStrToYear = "") Then
              tStrYears = "(ZZZ_ENTRY_DATA.c_year >=" + Str(TxtFromYear.Value) + _
                  " And ZZZ_ENTRY_DATA.c_year <=" + Str(TxtToYear.Value) + ")"
         Else
              tStrYears = ""
         End If
         If Not (tStrYears = "") Then
              gUseEntryYears = True
         End If
     ElseIf FrameYears.Value = 2 Then     ' Index Years
         If Not (tStrFromYear = "") And tStrToYear = "" Then
              tStrYears = "(ZZZ_ENTRY_DATA.c_index_year >=" + Str(TxtFromYear.Value) + ")"
         ElseIf tStrFromYear = "" And Not (tStrToYear = "") Then
              tStrYears = "(ZZZ_ENTRY_DATA.c_index_year <=" + Str(TxtToYear.Value) + ")"
         ElseIf Not (tStrFromYear = "") And Not (tStrToYear = "") Then
              tStrYears = "(ZZZ_ENTRY_DATA.c_index_year >=" + Str(TxtFromYear.Value) + _
                  " And ZZZ_ENTRY_DATA.c_index_year <=" + Str(TxtToYear.Value) + ")"
         Else
              tStrYears = ""
         End If
         If Not (tStrYears = "") Then
              gUseIndexYears = True
         End If
     ElseIf FrameYears.Value = 3 Then     ' Dynasties
         If gFromDynasty = -2 Then
              tStrYears = "((ZZZ_ENTRY_DATA.c_dy) > 0 ) "
         ElseIf gFromDynasty = -1 And gToDynasty > 0 Then
              tStrYears = "((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
         ElseIf gFromDynasty > 0 And gToDynasty = -1 Then
              tStrYears = "((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") "
         ElseIf gFromDynasty = gToDynasty And gFromDynasty > 0 Then
              tStrYears = "((DYNASTIES.c_dy)=" + Str(gFromDynasty) + ") "
         ElseIf gFromDynasty > 0 And gToDynasty > 0 Then
              tStrYears = "((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") AND " + _
                  "((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
         Else
              ' no constraint have been set, so just ignore

             tStrYears = ""
         End If
         If Not (tStrYears = "") Then
               gUseDynasties = True
           End If
    Else
        tStrYears = ""
    End If

    tQstr = "INSERT INTO ZZ_SCRATCH_entry ( c_personid, c_name, c_name_chn, c_index_year, c_index_year_type_code,
 c_index_year_type_desc, " + _
        "c_index_year_type_hz, c_dy, c_dynasty_chn, c_dynasty, c_entry_code, c_entry_desc, c_entry_chn, c_year, c
_exam_rank, c_addr_id, c_addr_desc_chn, " + _
        "c_addr_name, c_addr_chn, c_kin_id, c_kin_code, c_kin_desc, c_kin_name, c_kin_chn, c_assoc_code, c_assoc_
desc, c_assoc_desc_chn, c_assoc_name, " + _
        "c_assoc_name_chn, c_parental_status_desc, c_parental_status_desc_chn, x_coord, y_coord, " + _
        "c_entry_addr_id, c_entry_addr_name, c_entry_addr_chn, c_entry_xcoord, c_entry_ycoord, c_source, c_source
_text_chn, c_source_text ) " + _
        "SELECT ZZZ_ENTRY_DATA.c_personid, ZZZ_ENTRY_DATA.c_name, ZZZ_ENTRY_DATA.c_name_chn, ZZZ_ENTRY_DATA.c_ind
ex_year, " + _
        "ZZZ_ENTRY_DATA.c_index_year_type_code, ZZZ_ENTRY_DATA.c_index_year_type_desc, ZZZ_ENTRY_DATA.c_index_yea
r_type_hz, " + _
        "ZZZ_ENTRY_DATA.c_dy, ZZZ_ENTRY_DATA.c_dynasty_chn, ZZZ_ENTRY_DATA.c_dynasty, " + _
        "ZZZ_ENTRY_DATA.c_entry_code, ZZZ_ENTRY_DATA.c_entry_desc, ZZZ_ENTRY_DATA.c_entry_desc_chn, ZZZ_ENTRY_DAT
A.c_year, ZZZ_ENTRY_DATA.c_exam_rank, " + _
        "ZZZ_ENTRY_DATA.c_addr_id, ZZZ_ENTRY_DATA.c_addr_desc_chn, ZZZ_ENTRY_DATA.c_addr_name, ZZZ_ENTRY_DATA.c_a
ddr_chn, " + _
        "ZZZ_ENTRY_DATA.c_kin_id, ZZZ_ENTRY_DATA.c_kin_code, " + _
        "ZZZ_ENTRY_DATA.c_kinrel AS c_kin_desc, ZZZ_ENTRY_DATA.c_kin_name, ZZZ_ENTRY_DATA.c_kin_name_chn, ZZZ_ENT
RY_DATA.c_assoc_code, ZZZ_ENTRY_DATA.c_assoc_desc, " + _
        "ZZZ_ENTRY_DATA.c_assoc_desc_chn, ZZZ_ENTRY_DATA.c_assoc_name, ZZZ_ENTRY_DATA.c_assoc_name_chn, ZZZ_ENTRY
_DATA.c_parental_status_desc, " + _
        "ZZZ_ENTRY_DATA.c_parental_status_desc_chn, ZZZ_ENTRY_DATA.x_coord, ZZZ_ENTRY_DATA.y_coord, ZZZ_ENTRY_DAT
A.c_entry_addr_id, " + _
        "ZZZ_ENTRY_DATA.c_entry_addr_name, ZZZ_ENTRY_DATA.c_entry_addr_chn, ZZZ_ENTRY_DATA.c_entry_xcoord, ZZZ_EN
TRY_DATA.c_entry_ycoord, " + _
        "ZZZ_ENTRY_DATA.c_source, ZZZ_ENTRY_DATA.c_title_chn, ZZZ_ENTRY_DATA.c_title "

    ' the FROM statement gets complicated because of the nesting of the inner joins for address, entry code, and
dynasty
    ' This code, for the sake of clarity, simply sets out all the options

    If gUseADDRID Then
        '
        ' use person address = 1, use entry address = 2
        '
        If FrameAddress.Value = 1 Then
             tStrFromAddr = " ZZZ_ENTRY_DATA.c_addr_id "
        Else
             tStrFromAddr = " ZZZ_ENTRY_DATA.c_entry_addr_id "
        End If

           If TxtEntryDesc.Value = "[All]" And TxtTypeCode.Value = "" Then ' No entry codes

                  If gUseDynasties Then

                         ' join both address and dynasty but no entry code

                         tStrFrom = " FROM DYNASTIES INNER JOIN (ZZZ_ENTRY_DATA INNER JOIN ZZ_SCRATCH_ADDR_LIST " + _
                             "ON " + tStrFromAddr + " = ZZ_SCRATCH_ADDR_LIST.c_addr_id) " + _
                             "ON DYNASTIES.c_dy = ZZZ_ENTRY_DATA.c_dy "
                  Else

                         ' join just address

                tStrFrom = " FROM ZZZ_ENTRY_DATA INNER JOIN ZZ_SCRATCH_ADDR_LIST ON " + tStrFromAddr + " = ZZ_SCR
ATCH_ADDR_LIST.c_addr_id "
            End If

                  '
           Else          ' entry code(s) are specified as well as address
                  '
                ' the table ZZ_SCRATCH_ENTRY_CODE contains either one selected code or all the codes for a partic
ular selected TYPE

                  If gUseDynasties Then        '   this joins all three: address, entry, dynasty

                tStrFrom = " FROM DYNASTIES INNER JOIN (ZZ_SCRATCH_ENTRY_CODE INNER JOIN (ZZZ_ENTRY_DATA INNER JO
IN ZZ_SCRATCH_ADDR_LIST " + _
                    "ON " + tStrFromAddr + " = ZZ_SCRATCH_ADDR_LIST.c_addr_id) ON ZZ_SCRATCH_ENTRY_CODE.c_entry_c
ode = ZZZ_ENTRY_DATA.c_entry_code) " + _
                    "ON DYNASTIES.c_dy = ZZZ_ENTRY_DATA.c_dy "
               Else    ' this joins just address and entry

                tStrFrom = "FROM ZZ_SCRATCH_ENTRY_CODE INNER JOIN " + _
                    "(ZZZ_ENTRY_DATA INNER JOIN ZZ_SCRATCH_ADDR_LIST ON " + tStrFromAddr + " = ZZ_SCRATCH_ADDR_LI
ST.c_addr_id) " + _
                    "ON ZZ_SCRATCH_ENTRY_CODE.c_entry_code = ZZZ_ENTRY_DATA.c_entry_code"
            End If

         End If
         '
    Else     ' No addresses

        If TxtEntryDesc.Value = "[All]" And TxtTypeCode.Value = "" Then ' This is unconstrained and a bad idea un
less there is a dynasty constrain

               ' all entry codes are OK: selection is just by place
               If gUseDynasties Then
                    tStrFrom = " FROM DYNASTIES INNER JOIN ZZZ_ENTRY_DATA ON DYNASTIES.c_dy = ZZZ_ENTRY_DATA.c_dy "
               Else
                    tStrFrom = " FROM ZZZ_ENTRY_DATA "
               End If
        Else
               '
               If gUseDynasties Then   ' join dynasty and entry codes

                tStrFrom = " FROM DYNASTIES INNER JOIN (ZZ_SCRATCH_ENTRY_CODE INNER JOIN ZZZ_ENTRY_DATA " + _
                    "ON ZZ_SCRATCH_ENTRY_CODE.c_entry_code = ZZZ_ENTRY_DATA.c_entry_code) ON DYNASTIES.c_dy = ZZZ
_ENTRY_DATA.c_dy "

               Else ' join just entry codes

                tStrFrom = " FROM ZZ_SCRATCH_ENTRY_CODE INNER JOIN ZZZ_ENTRY_DATA ON ZZ_SCRATCH_ENTRY_CODE.c_entr
y_code = ZZZ_ENTRY_DATA.c_entry_code "
            End If
        End If
        '
        ' FROM DYNASTIES INNER JOIN (ZZ_SCRATCH_ENTRY_CODE INNER JOIN ZZZ_ENTRY_DATA ON ZZ_SCRATCH_ENTRY_CODE.c_e
ntry_code = ZZZ_ENTRY_DATA.c_entry_code) ON DYNASTIES.c_dy = ZZZ_ENTRY_DATA.c_dy;
    End If
    '
    tQstr = tQstr + tStrFrom

    ' add the years constraint, if needed

    If gUseEntryYears Or gUseIndexYears Or gUseDynasties Then
        '
        ' one last paranoid check
        If Not (tStrYears = "") Then
            tQstr = tQstr + " WHERE (" + tStrYears + ")"
        End If
    End If
    '
    ' MsgBox tQstr
    '
    ' run the query
    '
    cmdSQL.CommandText = tQstr
    cmdSQL.Execute tRecDeleted
    '
    ' now reopen
    '
    Set gRstPeople = CurrentDb.OpenRecordset("ZZ_SCRATCH_ENTRY", dbOpenDynaset)
    Set Entry_Address_Query.Form.Recordset = gRstPeople

    ' the final step is to calculate the xy_count
    '
    If gRstPeople.RecordCount > 0 Then
        '
        ' use three SQL calls
        '
        cmdSQL.CommandText = "Delete * from tmpXY"
        cmdSQL.Execute tRecDeleted
        '
        tQstr = "INSERT INTO tmpXY ( x_coord, y_coord, CountOfx_coord, CountOfy_coord ) " + _
            "SELECT ZZ_SCRATCH_ENTRY.x_coord, ZZ_SCRATCH_ENTRY.y_coord, Count(ZZ_SCRATCH_ENTRY.x_coord) " + _
            "AS CountOfx_coord, Count(ZZ_SCRATCH_ENTRY.y_coord) AS CountOfy_coord " + _
            "FROM ZZ_SCRATCH_ENTRY " + _
            "GROUP BY ZZ_SCRATCH_ENTRY.x_coord, ZZ_SCRATCH_ENTRY.y_coord;"

        '
           cmdSQL.CommandText = tQstr
           cmdSQL.Execute tRecDeleted
           '
           tQstr = "UPDATE tmpXY INNER JOIN ZZ_SCRATCH_ENTRY ON (tmpXY.y_coord = " + _
               "ZZ_SCRATCH_ENTRY.y_coord) AND (tmpXY.x_coord = ZZ_SCRATCH_ENTRY.x_coord) SET " + _
               "ZZ_SCRATCH_ENTRY.xy_count = [tmpXY].[CountOfx_coord];"

           cmdSQL.CommandText = tQstr
           cmdSQL.Execute tRecDeleted
           '
           'calculate_xy_count
           '
           Set gRstPeople = CurrentDb.OpenRecordset("ZZ_SCRATCH_ENTRY", dbOpenDynaset)
           CmdGIS.Enabled = True
           CmdStoreID.Enabled = True
           CmdNeo4j.Enabled = True
    Else
        CmdGIS.Enabled = False
        CmdStoreID.Enabled = False
        CmdNeo4j.Enabled = False
    End If

Exit_CmdQuery_Click:
    '
    ' close everything
    '
    Set rst = Nothing
    Set tRstKinCodes = Nothing
    Set tRstAddr = Nothing
    Set tRstBiogMain = Nothing
    Set EntryQuery = Nothing
    Set AddressQuery = Nothing
    Set tRstDummy = Nothing
    Set cmdSQL = Nothing
    Exit Sub

Err_CmdQuery_Click:
    MsgBox Err.Description
    Resume Exit_CmdQuery_Click

End Sub
Private Sub calculate_xy_count()
    Dim tX As Double, tY As Double, tXY As Integer, tBM As Variant, tWrite As Integer
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
        '
        ' now repeat the process with the entry xy
        '
        .Index = "entry_xy"
        .MoveFirst

        tX = -1#
        tY = -1#
        tXY = 0
        tWrite = 0
        tBM = .Bookmark

        Do While Not .EOF
             If tX <> !c_entry_xcoord Or tY <> !c_entry_ycoord Then
                 If tWrite = 1 Then
                      ' go back to the first record with the value
                      .Bookmark = tBM
                      Do While tX = !c_entry_xcoord And tY = !c_entry_ycoord
                           .Edit
                           !c_entry_xy_count = tXY
                           .Update
                           .MoveNext
                      Loop
                 Else
                      tWrite = 1
                 End If
                 ' reset
                 tXY = 0
                 tBM = .Bookmark
                 tX = !c_entry_xcoord
                 tY = !c_entry_ycoord
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
             !c_entry_xy_count = tXY
             .Update
             .MoveNext
        Loop
        .Index = "IndexYear"
    End With
End Sub
Private Sub CmdPickEntry_Click()
On Error GoTo Err_CmdPickEntry_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strENTRY As String

    Dim cmdSQL As ADODB.Command, tStrID As String
    Dim varItm As Variant, tCount As Integer

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    TxtEntryCode.Visible = True
    TxtEntryCode.SetFocus
    strENTRY = TxtEntryCode.Text

    stDocName = "frmPickEntry_multi"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strENTRY

    If CurrentProject.AllForms("frmPickEntry_multi").IsLoaded Then
        Dim intENTRY As Integer
        Dim strENTRY_DESC As String

        'MsgBox "Getting Entry Code value"
        Forms!frmPickEntry_multi.Form!TxtEntryCode.Visible = True
        Forms!frmPickEntry_multi.Form!TxtEntryCode.SetFocus
        intENTRY = Forms!frmPickEntry_multi.Form!TxtEntryCode.Value

        Forms!frmPickEntry_multi.Form!subTreeView.SetFocus
        Forms!frmPickEntry_multi.Form!TxtEntryCode.Visible = False
        TxtEntryCode.Value = intENTRY

        ' zap the temporary table

        cmdSQL.CommandText = "Delete * from zz_scratch_entry_code"
        cmdSQL.Execute tdeleted

        'MsgBox "Processing values"
        If TxtEntryCode.Value < 0 Then
            If TxtEntryCode.Value = -1 Then
                 TxtEntryDesc.Value = "[[All]]"
                 TxtEntryChn.Value = "[[All]]"
            Else
                 TxtEntryDesc.Value = "[[Multi-Select]]"
                 TxtEntryChn.Value = "[[" + ChrW(22810) + ChrW(36984) + "]]"
            End If

               'MsgBox "Getting TxtTypeID"
               Forms!frmPickEntry_multi.Form!TxtTypeID.Visible = True
               Forms!frmPickEntry_multi.Form!TxtTypeID.SetFocus
               strENTRY_DESC = Forms!frmPickEntry_multi.Form!TxtTypeID.Value
               Forms!frmPickEntry_multi.Form!subTreeView.SetFocus
               Forms!frmPickEntry_multi.Form!TxtTypeID.Visible = False
               TxtTypeCode.Value = strENTRY_DESC

            If TxtTypeCode.Value = "" Then
                 TxtTypeDesc.Value = "[ALL]"
                 '
                 ' multi-select from the root
                 '
                 If TxtEntryCode.Value = -2 Then
                     cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_ENTRY_CODE ( c_entry_code ) SELECT DISTINCT c_en
try_code FROM ZZ_ENTRY_CODE"
                     cmdSQL.Execute tdeleted
                 End If
            Else
                 'MsgBox "Getting TxtTypeDesc"
                 Forms!frmPickEntry_multi.Form!TxtTypeDesc.Visible = True
                 Forms!frmPickEntry_multi.Form!TxtTypeDesc.SetFocus
                 strENTRY_DESC = Forms!frmPickEntry_multi.Form!TxtTypeDesc.Value
                 Forms!frmPickEntry_multi.Form!subTreeView.SetFocus
                 Forms!frmPickEntry_multi.Form!TxtTypeDesc.Visible = False
                 TxtTypeDesc.Value = strENTRY_DESC

                   'MsgBox "Getting TxtTypeChn"
                   Forms!frmPickEntry_multi.Form!TxtTypeChn.Visible = True
                   Forms!frmPickEntry_multi.Form!TxtTypeChn.SetFocus
                   strENTRY_DESC = Forms!frmPickEntry_multi.Form!TxtTypeChn.Value
                   Forms!frmPickEntry_multi.Form!subTreeView.SetFocus
                   Forms!frmPickEntry_multi.Form!TxtTypeChn.Visible = False
                   TxtTypeChn.Value = strENTRY_DESC

                cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_ENTRY_CODE ( c_entry_code ) SELECT DISTINCT c_entry_
code FROM ZZ_ENTRY_CODE"
                cmdSQL.Execute tdeleted

               End If
        Else
            ' extract the entry code
            '
            cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_ENTRY_CODE ( c_entry_code ) SELECT " + Str(intENTRY) + "
 as c_entry_code"
            cmdSQL.Execute tdeleted

               Forms!frmPickEntry_multi.Form!TxtEntryDesc.Visible = True
               Forms!frmPickEntry_multi.Form!TxtEntryDesc.SetFocus
               strENTRY_DESC = Forms!frmPickEntry_multi.Form!TxtEntryDesc.Value
               Forms!frmPickEntry_multi.Form!subTreeView.SetFocus
              Forms!frmPickEntry_multi.Form!TxtEntryDesc.Visible = False
              TxtEntryDesc.Value = strENTRY_DESC

              'MsgBox "Getting TxtEntryDescChn"
              Forms!frmPickEntry_multi.Form!TxtEntryChn.Visible = True
              Forms!frmPickEntry_multi.Form!TxtEntryChn.SetFocus
              strENTRY_DESC = Forms!frmPickEntry_multi.Form!TxtEntryChn.Value
              Forms!frmPickEntry_multi.Form!subTreeView.SetFocus
              Forms!frmPickEntry_multi.Form!TxtEntryChn.Visible = False
              TxtEntryChn.Value = strENTRY_DESC

              'MsgBox "Getting TxtTypeDesc"
              Forms!frmPickEntry_multi.Form!TxtTypeDesc.Visible = True
              Forms!frmPickEntry_multi.Form!TxtTypeDesc.SetFocus
              strENTRY_DESC = Forms!frmPickEntry_multi.Form!TxtTypeDesc.Value
              Forms!frmPickEntry_multi.Form!subTreeView.SetFocus
              Forms!frmPickEntry_multi.Form!TxtTypeDesc.Visible = False
              TxtTypeDesc.Value = strENTRY_DESC

              'MsgBox "Getting TxtTypeChn"
              Forms!frmPickEntry_multi.Form!TxtTypeChn.Visible = True
              Forms!frmPickEntry_multi.Form!TxtTypeChn.SetFocus
              strENTRY_DESC = Forms!frmPickEntry_multi.Form!TxtTypeChn.Value
              Forms!frmPickEntry_multi.Form!subTreeView.SetFocus
              Forms!frmPickEntry_multi.Form!TxtTypeChn.Visible = False
              TxtTypeChn.Value = strENTRY_DESC
              TxtTypeCode.Value = ""
          End If

          ' now enable the search

          CmdQuery.Enabled = True
          CmdSaveEntryCodes.Enabled = True

        DoCmd.Close acForm, stDocName
    End If

    CmdPickEntry.SetFocus
    TxtEntryCode.Visible = False

Exit_CmdPickEntry_Click:
    Exit Sub

Err_CmdPickEntry_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickEntry_Click

End Sub


Private Sub CmdSaveEntryCodes_Click()
On Error GoTo Err_CmdSaveEntryCodes_Click
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

    dlgSaveAs.InitialFileName = "entry_id_list.txt"
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
                GoTo Exit_CmdSaveEntryCodes_Click
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
           tStr = "SELECT ZZ_SCRATCH_ENTRY_CODE.c_entry_code, ENTRY_CODES.c_entry_desc, ENTRY_CODES.c_entry_desc_chn
 " + _
            "FROM ZZ_SCRATCH_ENTRY_CODE INNER JOIN ENTRY_CODES ON ZZ_SCRATCH_ENTRY_CODE.c_entry_code = ENTRY_CODE
S.c_entry_code"

           Set tRstIDs = CurrentDb.OpenRecordset(tStr, dbOpenDynaset)
           '
           tTab = Chr(9)

           With tRstIDs

               .MoveFirst
               ' MsgBox "writing file"
               Do While Not .EOF
                    '
                    tStr = Str(!c_entry_code) + tTab + !c_entry_desc + tTab + !c_entry_desc_chn
                    tStream.WriteText tStr, adWriteLine
                    .MoveNext
               Loop
           End With
           ' now make sure all the data is copied to tStream
           tStream.Flush
           ' and write the stream to the file
           tStream.Position = 3
           MsgBox "Copying to stream"
           tStream.CopyTo tStreamNoBOM
           MsgBox "Writing to file"
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

Exit_CmdSaveEntryCodes_Click:
    Exit Sub

Err_CmdSaveEntryCodes_Click:
    MsgBox Err.Description
    Resume Exit_CmdSaveEntryCodes_Click

End Sub

Private Sub CmdStoreID_Click()
    Dim cmdSQL As ADODB.Command, tStrQuery As String

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

    tStrQuery = "INSERT INTO ZZ_STORE_PERSON_ID ( c_personid ) SELECT DISTINCT ZZ_SCRATCH_ENTRY.c_personid FROM Z
Z_SCRATCH_ENTRY"

    cmdSQL.CommandText = tStrQuery
    cmdSQL.Execute tRecCount
    MsgBox "Person IDs successfully stored. Click on 'Recall Person IDs' to reuse these IDs in other forms."
    '
    ' update storage source
    cmdSQL.CommandText = "UPDATE PersonIDSource SET SourceForm ='Entry' WHERE PersonIDSource.LineNum =1"
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
    Dim cmdSQL As ADODB.Command
    Dim tRstEntryCode As DAO.Recordset, tRstDummy As DAO.Recordset

    Set cmdSQL = New ADODB.Command
    '
    ' to clear the table, briefly close and then delete records
    '
    Set tRstEntryCode = Entry_Address_Query.Form.Recordset
    Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_EC", dbOpenDynaset)
    Set Entry_Address_Query.Form.Recordset = tRstDummy
    tRstEntryCode.Close
    '
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
        '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_ENTRY"
    cmdSQL.Execute tRecDeleted
    '
    ' now reopen
    '
    Set tRstEntryCode = CurrentDb.OpenRecordset("ZZ_SCRATCH_ENTRY", dbOpenDynaset)
    Set Entry_Address_Query.Form.Recordset = tRstEntryCode

    ' first determine the language
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

    gFromDynasty = -1
    gToDynasty = -1
    gUseIndexYears = False
    gUseDynasties = False
End Sub
Private Sub CmdExit_Click()
On Error GoTo Err_CmdExit_Click


    DoCmd.Close

Exit_CmdExit_Click:
    Exit Sub

Err_CmdExit_Click:
    MsgBox Err.Description
    Resume Exit_CmdExit_Click

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
    Dim tLabelLanguage(3, 34) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 34 And Not .EOF
             If !c_form = "LAE" Then
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
        Me.CmdPickEntry.Caption = tLabelLanguage(tLang, 4)
        Me.CmdQuery.Caption = tLabelLanguage(tLang, 5)
        Me.CmdGIS.Caption = tLabelLanguage(tLang, 6)
        Me.CmdFanti.Caption = tLabelLanguage(tLang, 8)
        Me.CmdJianti.Caption = tLabelLanguage(tLang, 9)
        Me.CmdExit.Caption = tLabelLanguage(tLang, 10)
        Me.CmdSelectPlace.Caption = tLabelLanguage(tLang, 11)
        Me.CmdImportPlaces.Caption = tLabelLanguage(tLang, 12)
        Me.CmdAllPlaces.Caption = tLabelLanguage(tLang, 13)
        Me.LblIndexYears.Caption = tLabelLanguage(tLang, 14)
        ' Me.LblUseYears.Caption = tLabelLanguage(tLang, 15)
        Me.LblDisplay.Caption = tLabelLanguage(tLang, 16)
        Me.LblExamYears.Caption = tLabelLanguage(tLang, 17)
        Me.LblUsePersonAddr.Caption = tLabelLanguage(tLang, 18)
        Me.LblUseEntryAddr.Caption = tLabelLanguage(tLang, 19)
        Me.CmdStoreID.Caption = tLabelLanguage(tLang, 20)
        Me.CmdHelp.Caption = tLabelLanguage(tLang, 21)
        Me.Label37.Caption = tLabelLanguage(tLang, 22)
        Me.LblChkSubUnits.Caption = tLabelLanguage(tLang, 23)
        Me.LblDynasties.Caption = tLabelLanguage(tLang, 24)
        Me.CmdFromDynasty.Caption = tLabelLanguage(tLang, 25)
        Me.CmdToDynasty.Caption = tLabelLanguage(tLang, 26)
        Me.CmdAllDynasties.Caption = tLabelLanguage(tLang, 27)
        Me.LblYears.Caption = tLabelLanguage(tLang, 28)
        Me.LblOptNoDates.Caption = tLabelLanguage(tLang, 29)
        Me.LblOptDynasties.Caption = tLabelLanguage(tLang, 30)
        Me.CmdNeo4j.Caption = tLabelLanguage(tLang, 31)
        Me.CmdImportEntryCodes.Caption = tLabelLanguage(tLang, 32)
        Me.CmdSaveEntryCodes.Caption = tLabelLanguage(tLang, 33)
    End If

End Sub
Private Sub CmdAllPlaces_Click()
On Error GoTo Err_CmdAllPlaces_Click

         TxtAddrID.Value = -1

         TxtPlaceChn.Value = ""
         TxtPlace.Value = ""
         gUseADDRID = False
         ChkXYRef.Enabled = False
         ChkSubUnits.Enabled = False

Exit_CmdAllPlaces_Click:
    Exit Sub

Err_CmdAllPlaces_Click:
    MsgBox Err.Description
    Resume Exit_CmdAllPlaces_Click

End Sub
Private Sub CmdImportPlaces_Click()
    On Error GoTo Err_CmdImportPlaces_Click

    Dim stDocName As String, tRstAddresses As DAO.Recordset
    Dim stLinkCriteria As String, tRstImportPlaces As DAO.Recordset
    Dim tString As String, tAddrID As Long, ti As Integer, tStrID As String
    Dim tLen As Integer, cmdSQL As ADODB.Command

    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tFileSystem, tList

    '   open the list

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
             '
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
    '    SpecificationName = "ImportPlaceList_Space" (apparently it is saved in the database itself)
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
        gUseADDRID = True
        ChkXYRef.Enabled = True
        ChkSubUnits.Enabled = True
    End If

    Set cmdSQL = Nothing
    Set tFileSystem = Nothing

Exit_CmdImportPlaces_Click:
    Exit Sub

Err_CmdImportPlaces_Click:
    MsgBox Err.Description
    Resume Exit_CmdImportPlaces_Click

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
        Dim cmdSQL As ADODB.Command

        Set cmdSQL = New ADODB.Command
          cmdSQL.ActiveConnection = CurrentProject.Connection
          cmdSQL.CommandType = adCmdText

          gUseADDRID = True
          CmdAllPlaces.Enabled = True
          ChkXYRef.Enabled = True
          ChkSubUnits.Enabled = True

          'MsgBox "Checking zz_addresses"

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

    End If
    CmdSelectPlace.SetFocus
    TxtAddrID.Visible = False

Exit_CmdSelectPlace_Click:
    Exit Sub

Err_CmdSelectPlace_Click:
    MsgBox Err.Description
    Resume Exit_CmdSelectPlace_Click

End Sub

Private Sub writeKML()
'<kml xmlns="http://www.opengis.net/kml/2.2">
'<Document>
'   <name>ExtendedData+SchemaData</name>
'   <open>1</open>
'   <!-- Create a balloon template referring to the user-defined type -->
'   <Style id="assoc-balloon-template">
'       <BalloonStyle>
'           <text>
'              <![CDATA[
'               $[AssocPerson/PersonNameHZ] <br/>
'               ID: $[AssocPerson/PersonID] <br/>
'               Index Year: $[AssocPerson/IndexYear] <br/>
'               Address: $[AssocPerson/AddrName] $[AssocPerson/AddrNameHZ] <br/>
'               XY Count: $[AssocPerson/XYCount] <br/><br/>
'                ]]>
'            </text>
'       </BalloonStyle>
'   </Style>
'   <!-- Declare the type "AssocPerson" with 6 fields -->
'   <Schema name="AssocPerson" id="AssocPersonId">
'       <SimpleField type="string" name="PersonNameHZ">
'            <displayName><![CDATA[<b>Person</b>]]></displayName>
'       </SimpleField>
'       <SimpleField type="string" name="AddrName">
'            <displayName><![CDATA[<b>Person</b>]]></displayName>
'       </SimpleField>
'       <SimpleField type="string" name="AddrNameHZ">
'            <displayName><![CDATA[<b>Person</b>]]></displayName>
'       </SimpleField>
'       <SimpleField type="uint" name="PersonID">
'            <displayName><![CDATA[ID]]></displayName>
'       </SimpleField>
'       <SimpleField type="int" name="IndexYear">
'            <displayName><![CDATA[Index Year]]></displayName>
'       </SimpleField>
'       <SimpleField type="int" name="XYCount">
'            <displayName><![CDATA[XY Count]]></displayName>
'       </SimpleField>
'   </Schema>
'   <!-- Instantiate some Placemarks extended with AssocPerson fields -->
'   <Placemark>
'       <name>Easy trail</name>
'       <styleUrl>#assoc-balloon-template</styleUrl>
'       <ExtendedData>
'            <SchemaData schemaUrl="#AssocPersonId">
'                <SimpleData name="PersonID">3.14159</SimpleData>
'                <SimpleData name="PersonNameHZ">Pi in the sky</SimpleData>
'                <SimpleData name="IndexYear">10</SimpleData>
'                <SimpleData name="AddrName">Pi in the sky</SimpleData>
'                <SimpleData name="AddrNameHZ">Pi in the sky</SimpleData>
'                <SimpleData name="XYCount">10</SimpleData>
'            </SchemaData>
'       </ExtendedData>
'       <Point>
'            <coordinates>-122.000,37.002</coordinates>
'       </Point>
'   </Placemark>
'   <Placemark>
'       <name>Difficult trail</name>
'       <styleUrl>#assoc-balloon-template</styleUrl>
'       <ExtendedData>
'            <SchemaData schemaUrl="#AssocPersonId">
'                <SimpleData name="TrailHeadName">Mount Everest</SimpleData>
'                <SimpleData name="TrailLength">347.45</SimpleData>
'                <SimpleData name="ElevationGain">10000</SimpleData>
'            </SchemaData>
'       </ExtendedData>
'       <Point>
'            <coordinates>-121.998,37.0078</coordinates>
'       </Point>
'   </Placemark>
'</Document>
'</kml>

    Dim tStrKML As String
    '
    ' This program will dump the results to a .gis file
    '
    If Entry_Address_Query.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_writeKML
    End If
    '
    Dim tStream As ADODB.Stream
    Set tStream = New ADODB.Stream

    If GISFrame.Value = 1 Then
        tStream.Charset = "utf-8"
        tCodeStr = "UTF8"
     Else
         tStream.Charset = "gb2312"
         tCodeStr = "GB2312"
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
     Dim tStr As String, tC As String, tDQ As String, ti As Integer
     Dim tFileSystem, tGDF

     Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

     dlgSaveAs.InitialFileName = "entry_gis_" + tCodeStr + ".kml"
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
              GoTo Exit_writeKML
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
         'Name,NameChn,Female,IndexYear,AddrName,AddrChn,X,Y,xy_count,NodeDist
         'Name,NameChn,IndexYear,EntryDesc,EntryChn,EntryYear,
         'AddrName,AddrChn,X,Y,xy_count
         '
         ' process the table
         '
         Set tRstNode = Entry_Address_Query.Form.Recordset
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
        tStream.WriteText tC + "<Style id=" + tDQ + "entry-balloon-template" + tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + "<BalloonStyle>", adWriteLine
        tStream.WriteText tC + tC + tC + "<text>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "<![CDATA[", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "$[EntryPerson/PersonNameHZ] <br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "ID: $[EntryPerson/PersonID] <br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "Index Year: $[EntryPerson/IndexYear] <br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "Entry Year: $[EntryPerson/EntryYear] <br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "Entry Desc: $[EntryPerson/EntryDesc] <br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "Entry Chn: $[EntryPerson/EntryDescHZ] <br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "Entry Rank: $[EntryPerson/EntryRank] <br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "Address: $[EntryPerson/AddrName] $[EntryPerson/AddrNameHZ] <br/>",
 adWriteLine
        tStream.WriteText tC + tC + tC + tC + "XY Count: $[EntryPerson/XYCount] <br/><br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "]]>", adWriteLine
        tStream.WriteText tC + tC + tC + "</text>", adWriteLine
        tStream.WriteText tC + tC + "</BalloonStyle>", adWriteLine
        tStream.WriteText tC + "</Style>", adWriteLine
        tStream.WriteText tC + "<!-- Declare the type " + tDQ + "EntryPerson" + tDQ + " with 10 fields -->", adWr
iteLine
        tStream.WriteText tC + "<Schema name=" + tDQ + "EntryPerson" + tDQ + " id=" + tDQ + "EntryPersonId" + tDQ
 + ">", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "PersonNameHZ"
 + tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[<b>Person</b>]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "AddrName" + t
DQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[<b>Person</b>]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "AddrNameHZ" +
 tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[<b>Person</b>]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "uint" + tDQ + " name=" + tDQ + "PersonID" + tDQ
 + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[ID]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "IndexYear" +
tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Index Year]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "int" + tDQ + " name=" + tDQ + "EntryYear" + tDQ
 + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Entry Year]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "EntryDesc" +
tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Entry Desc]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "EntryDescHZ"
+ tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Entry Chn]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "int" + tDQ + " name=" + tDQ + "EntryRank" + tDQ
 + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Entry Rank]]></displayName>", adWriteLine
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
                       tStr = "[Bad Data]"
                  Else
                       tStr = !c_name
                  End If
                  tStream.WriteText tC + tC + "<name>" + tStr + "</name>", adWriteLine

                  tStream.WriteText tC + tC + "<styleUrl>#entry-balloon-template</styleUrl>", adWriteLine
                  '
                  ' Index Year as time stamp
                  '
                  If IsNull(!c_index_year) Then
                       tStr = "N/A"
                  Else
                       tStr = Str(!c_index_year)
                  End If
                  tStream.WriteText tC + tC + "<TimeStamp>" + tStr + "</TimeStamp>", adWriteLine
                  '
                  tStream.WriteText tC + tC + "<ExtendedData>", adWriteLine
                  tStream.WriteText tC + tC + tC + "<SchemaData schemaUrl=" + tDQ + "#EntryPersonId" + tDQ + ">", a
dWriteLine
                  '
                  ' person ID
                  '
                  tStr = Str(!c_personid)
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "PersonID" + tDQ + ">" + tStr +
 "</SimpleData>", adWriteLine
                '
                ' Chinese Name
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
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "PersonNameHZ" + tDQ + ">" + tS
tr + "</SimpleData>", adWriteLine
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
                ' Entry Year
                '
                If IsNull(!c_year) Then
                     tStr = "-2000"
                Else
                     tStr = Str(!c_year)
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "EntryYear" + tDQ + ">" + tStr
+ "</SimpleData>", adWriteLine
                '
                ' Entry Desc
                '
                If IsNull(!c_entry_desc) Then
                     tStr = "[Missing Data]"
                Else
                     tStr = !c_entry_desc
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "EntryDesc" + tDQ + ">" + tStr
+ "</SimpleData>", adWriteLine
                '
                ' Entry Chn
                '
                If IsNull(!c_entry_chn) Then
                     tStr = "[Missing Data]"
                Else
                     tStr = !c_entry_chn
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "EntryDescHZ" + tDQ + ">" + tSt
r + "</SimpleData>", adWriteLine
                '
                ' Entry Rank
                '
                If IsNull(!c_exam_rank) Then
                     tStr = "0"
                Else
                     tStr = !c_exam_rank
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "EntryRank" + tDQ + ">" + tStr
+ "</SimpleData>", adWriteLine
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

Exit_writeKML:
    Exit Sub

Err_writeKML:
    MsgBox Err.Description
    Resume Exit_writeKML


End Sub

Private Sub FrameYears_Click()

    ' Turn off usage
    gUseEntryYears = False
    gUseIndexYears = False
    gUseDynasties = False

    ' Turn off Dynasty text boxes

    Me.TxtFromDynasty.Enabled = False
    Me.TxtFromDynastyPY.Enabled = False
    Me.TxtToDynasty.Enabled = False
    Me.TxtToDynastyPY.Enabled = False
    Me.TxtFromDynasty.Locked = False
    Me.TxtFromDynastyPY.Locked = falsee
    Me.TxtToDynasty.Locked = False
    Me.TxtToDynastyPY.Locked = False

    If FrameYears.Value = 1 Or FrameYears.Value = 2 Then
        ' entry years or index years
        Me.CmdFromDynasty.Enabled = False
        Me.CmdToDynasty.Enabled = False
        Me.CmdAllDynasties.Enabled = False

        Me.TxtFromYear.Enabled = True
        Me.TxtToYear.Enabled = True
        If FrameYears.Value = 1 Then
             gUseEntryYears = True
        Else
             gUseIndexYears = True
        End If
    ElseIf FrameYears.Value = 3 Then
        ' enable dynasties
        Me.CmdFromDynasty.Enabled = True
        Me.CmdToDynasty.Enabled = True
        Me.CmdAllDynasties.Enabled = True
        Me.TxtFromDynasty.Locked = True
        Me.TxtFromDynastyPY.Locked = True
        Me.TxtToDynasty.Locked = True
        Me.TxtToDynastyPY.Locked = True
        ' diaable index years
        Me.TxtFromYear.Enabled = False
        Me.TxtToYear.Enabled = False

           gUseDynasties = True
    Else
        ' disable all
        Me.CmdFromDynasty.Enabled = False
        Me.CmdToDynasty.Enabled = False
        Me.CmdAllDynasties.Enabled = False
        '
        Me.TxtFromYear.Enabled = False
        Me.TxtToYear.Enabled = False
    End If

End Sub

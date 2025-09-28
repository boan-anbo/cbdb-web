Option Compare Database
Public gRstPeople As DAO.Recordset, gDisplayLanguage As String, gLabelsOK As Boolean
Public gImportPlaces As Boolean, gUseADDRID As Boolean, gRstEdge As DAO.Recordset
Public gRst As DAO.Recordset
Public gFromDynasty As Integer, gToDynasty As Integer, gUseIndexYears As Boolean, gToYear As String, gFromYear As
 String, gUseDynasties As Boolean, _
        gFromDynastyBegin As Integer, gFromDynastyEnd As Integer, gToDynastyBegin As Integer, gToDynastyEnd As Integer


Private Sub ChkIndexYears_Click()

    Me.TxtFromYear.Enabled = ChkIndexYears.Value
    Me.TxtToYear.Enabled = ChkIndexYears.Value

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

Private Sub CmdGephi_Click()
    On Error GoTo Err_CmdGephi_Click
    '
    ' This program will dump the results of the search to a .gdf file
    '
    ' for the moment I'll just describe the format of the .gdf file
    '
    ' nodedef> name, label, labelvisible, style, pinyin VARCHAR(50), nodedist INT
    '      name = str(c_person_id)
    '      label = c_name_chn
    '      style = 4 (text inside a rectangle)
    '      pinyin = c_name
    '      nodedist = c_node_dist INT
    '      indexyear = c_index_year INT
    '      sex = c_female > (F,M)
    '
    ' edgedef> node1, node2, label, labelvisible, edge_desc VARCHAR(50)
    '      node1 = str(c_person_id) for node1
    '      node2 = str(c_node_id) for node2
    '      label = c_link_chn
    '      edge_desc = c_link_desc
    '      edgetype= c_link_type (K,N)
    '
    ' the central question is whether to do distance optimizations
    '
    ' first see if there are any records to process
    '
    If ZZ_SOCIAL_NETWORK.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdGephi_Click
    End If
    '
    If ZZ_SCRATCH_PEOPLE.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdGephi_Click
    End If
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tRstNode As DAO.Recordset
    Dim tRstEdge As DAO.Recordset
    Dim tStr As String, tC As String, ti As Integer, tCodeStr As String
    'Dim tFileSystem, tGDF

    ' set up the stream for writing
    Dim tStream As ADODB.Stream
    Set tStream = New ADODB.Stream
    If CodeFrame.Value = 1 Then
         tStream.Charset = "utf-8"
         tCodeStr = "UTF8"
    ElseIf CodeFrame.Value = 2 Then
         tStream.Charset = "big5"
         tCodeStr = "BIG5"
    ElseIf CodeFrame.Value = 3 Then
         tStream.Charset = "gb18030"
         tCodeStr = "GB18030"
    Else
         tStream.Charset = "ascii"
         tCodeStr = "ASCII"
    End If

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

    'Use a With...End With block to reference the FileDialog object.
    With dlgSaveAs
        .InitialFileName = "assoc_links_" + tCodeStr + ".gdf"
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
                 GoTo Exit_CmdGephi_Click
            Else
                 ' make sure the file name has a gdf extension
                 If Len(tFileName) < 5 Then
                     tFileName = tFileName + ".gdf"
                 ElseIf Not (LCase(Right(tFileName, 4)) = ".gdf") Then
                     tFileName = tFileName + ".gdf"
                 End If
            End If
            '
            ' now process the file (second true removed to make ASCII)
            '
            'Set tFileSystem = CreateObject("Scripting.FileSystemObject")
            'Set tGDF = tFileSystem.CreateTextFile(tFileName, True, True)

            ' process the two tables
            '
            Set tRstEdge = CurrentDb.OpenRecordset("ZZ_SOCIAL_NETWORK", dbOpenDynaset)
            Set tRstNode = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
            tC = Chr(44) ' the comma
            tQuote = Chr(34) 'the Quote delimiter
            '
            ' ready to go: now open the stream
            tStream.Mode = adModeReadWrite
            tStream.Type = adTypeText
            tStream.Open
            '
            ' first the nodes: define the record structure
            '    if ASCII, no characters, no pinyin
            '
            If tCodeStr = "ASCII" Then
                 tStr = "nodedef> name VARCHAR" + tC + "label VARCHAR" + tC + "labelvisible BOOLEAN" + _
                     tC + "style INT" + tC + "indexyear INT" + tC + "sex VARCHAR(1)" + _
                     tC + "addr_name VARCHAR" + tC + "latitude DOUBLE" + tC + "longitude DOUBLE"
            Else
                 tStr = "nodedef> name VARCHAR" + tC + "label VARCHAR" + tC + "labelvisible BOOLEAN" + _
                     tC + "style INT" + tC + "pinyin VARCHAR(50)" + tC + "indexyear INT" + tC + "sex VARCHAR(1)" +
 _
                    tC + "addr_chn VARCHAR" + tC + "addr_name VARCHAR" + tC + "latitude DOUBLE" + tC + "longitude
 DOUBLE"
            End If
            tStream.WriteText tStr, adWriteLine
            'tGDF.WriteLine (tStr)
            '
            With tRstNode
                .MoveFirst
                Do While Not .EOF
                    ' name = the ID of the person
                    tStr = Trim(Str(!c_person_id)) + tC

                    ' label
                    If tCodeStr = "ASCII" Then
                         If IsNull(!c_name) Then
                              tStr = tStr + tC
                         Else
                              tStr = tStr + !c_name + tC
                         End If
                    Else
                         If IsNull(!c_name_chn) Then
                              tStr = tStr + tC
                         Else
                              tStr = tStr + !c_name_chn + tC
                         End If
                    End If

                    ' labelvisible = true, style = 4 (text inside a rectangle)
                    tStr = tStr + "true" + tC + "4" + tC

                    If Not (tCodeStr = "ASCII") Then
                        ' pinyin = c_name
                        tStr = tStr + !c_name + tC
                    End If

                      ' indexyear = c_index_year INT
                      If IsNull(!c_index_year) Then
                           tStr = tStr + "-2000" + tC
                      Else
                           tStr = tStr + Trim(Str(!c_index_year)) + tC
                      End If

                      '   sex = F,M
                      tStr = tStr + IIf(!c_female, "F", "M") + tC

                      If tCodeStr = "ASCII" Then
                           If IsNull(!c_addr_name) Then
                                tStr = tStr + tC
                           Else
                                tStr = tStr + !c_addr_name + tC
                           End If
                      Else
                           If IsNull(!c_addr_chn) Then
                                tStr = tStr + tC
                           Else
                                tStr = tStr + !c_addr_chn + tC
                           End If
                           '
                           If IsNull(!c_addr_name) Then
                                tStr = tStr + tC
                           Else
                                tStr = tStr + !c_addr_name + tC
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
                      tStream.WriteText tStr, adWriteLine
                      'tGDF.WriteLine (tStr)
                      .MoveNext
                  Loop
              End With
              '
              ' now the edges: define the record structure
              tStr = "edgedef> node1 VARCHAR" + tC + "node2 VARCHAR" + tC + "label VARCHAR" + tC + "edge_desc VARCH
AR(50)" + _
                      tC + "link_count INT"
              tStream.WriteText tStr, adWriteLine
              'tGDF.WriteLine (tStr)

              With tRstEdge
                  .MoveFirst
                  Do While Not .EOF
                      '   node1 = str(c_person_id) for node1
                      tStr = Trim(Str(!c_person_id)) + tC

                      '   node2 = str(c_node_id) for node2
                      tStr = tStr + Trim(Str(!c_node_id)) + tC

                      '    label = c_link_chn
                      If IsNull(!c_link_chn) Then
                           tStr = tStr + tC
                      Else
                           tStr = tStr + tQuote + !c_link_chn + tQuote + tC
                      End If

                      '    edge_desc = c_link_desc
                      If IsNull(!c_link_desc) Then
                           tStr = tStr + tC
                      Else
                           tStr = tStr + tQuote + Trim(Left(!c_link_desc + Space(50), 50)) + tQuote + tC
                      End If

                      '   link_count = c_link_count
                         tStr = tStr + Str(!c_link_count)

                         tStream.WriteText tStr, adWriteLine
                         'tGDF.WriteLine (tStr)
                         .MoveNext
                     Loop
                 End With
                 '
                 ' now make sure all the data is copied to tStream
                 tStream.Flush
                 ' and write the stream to the file
                 tStream.SaveToFile tFileName, adSaveCreateOverWrite
                 '
                 tStream.Close
                 Set tStream = Nothing
                 'tGDF.Close
                 '
                 Set tRstNode = Nothing
                 Set tRstEdge = Nothing
                 'Set tGDF = Nothing
                 'Set tFileSystem = Nothing
          Else
             'The user pressed Cancel.
        End If
    End With

    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdGephi_Click:
    Exit Sub

Err_CmdGephi_Click:
    MsgBox Err.Description
    Resume Exit_CmdGephi_Click


End Sub

Private Sub CmdNeo4j_Click()
On Error GoTo Err_CmdNeo4j_Click
    '
    ' This routine will be close to that for LookAtAssociations and, if used, that for LookAtKinship
    ' The additional wrinkle is that, while the first step is to split associatin from kinship relations, we sti
ll need to gather all
    '    the people from both.
    '
    ' first see if there are any records to process
    '
    If Me.ZZ_SOCIAL_NETWORK.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdNeo4j_Click
    End If
    '
    ' allocate the file variables
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer, tFileName As String, tFN As Variant
    '
    ' next get the People file
    '
    Dim tRstPeople As DAO.Recordset, tRstAssoc As DAO.Recordset, tRstPlace As DAO.Recordset, tRstPeoplePlace As D
AO.Recordset
    Dim tStr As String, tC As String, tQueryStr As String, tRstAssocCode As DAO.Recordset, tRstKin As DAO.Records
et
    Dim gStream As ADODB.Stream, tCodeStr As String, tTempLong As Long
    '

    ' set up the stream to write to

    Set gStream = New ADODB.Stream
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
               'Set tFileSystem = CreateObject("Scripting.FileSystemObject")
               'Set tGDF = tFileSystem.CreateTextFile(tFileName, True, True)
               '
               ' we have a file name: now open the stream for writing

               gStream.Mode = adModeReadWrite
               gStream.Type = adTypeText
               gStream.Open

               '
               '   prepare the temp tables for the people, place, peoplePlace and assoc codes

               Dim cmdSQL As ADODB.Command
               Set cmdSQL = New ADODB.Command
               cmdSQL.ActiveConnection = CurrentProject.Connection
               cmdSQL.CommandType = adCmdText
               '
               ' Get the people from 5 sources: c_person_id, c_node_id, c_kin_id, c_assoc_kin_id, and c_assoc_claim
er_id

               cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_P_TEXT"
               cmdSQL.Execute tRecDeleted
               '
               ' copy the data for people (1)
               '
               tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_person
_id " + _
                           "FROM ZZ_SOCIAL_NETWORK WHERE (((ZZ_SOCIAL_NETWORK.c_person_id)>0))"
               '
               cmdSQL.CommandText = tQueryStr
               cmdSQL.Execute tRecDeleted
               '
               ' copy the data for people (2)
               '
               tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_node_i
d " + _
                           "FROM ZZ_SOCIAL_NETWORK WHERE (((ZZ_SOCIAL_NETWORK.c_node_id)>0))"
               '
               cmdSQL.CommandText = tQueryStr
               cmdSQL.Execute tRecDeleted
               '
               ' copy the data for people (3)
               '
               tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_kin_id
 " + _
                           "FROM ZZ_SOCIAL_NETWORK WHERE (((ZZ_SOCIAL_NETWORK.c_kin_id)>0))"
               '
               cmdSQL.CommandText = tQueryStr
               cmdSQL.Execute tRecDeleted
               '
               ' copy the data for people (4)
               '
               tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_assoc_
kin_id " + _
                          "FROM ZZ_SOCIAL_NETWORK WHERE (((ZZ_SOCIAL_NETWORK.c_assoc_kin_id)>0))"
            '
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy the data for people (5)
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_assoc_
claimer_id " + _
                          "FROM ZZ_SOCIAL_NETWORK WHERE (((ZZ_SOCIAL_NETWORK.c_assoc_claimer_id)>0))"
            '
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_P_TEXT.c_person_id, ZZZ_BIOG_MAIN.c_name, ZZZ_BIOG_MAIN.c_nam
e_chn, ZZZ_BIOG_MAIN.c_index_year, " + _
                               "ZZZ_BIOG_MAIN.c_dynasty, ZZZ_BIOG_MAIN.c_dynasty_chn, ZZZ_BIOG_MAIN.c_index_addr_id,
 ZZZ_BIOG_MAIN.c_index_addr_name, " + _
                               "ZZZ_BIOG_MAIN.c_index_addr_chn, ZZZ_BIOG_MAIN.c_index_addr_type_code, ZZZ_BIOG_MAIN.
c_index_addr_type_desc, " + _
                               "ZZZ_BIOG_MAIN.c_index_addr_type_chn, ZZZ_BIOG_MAIN.c_female, ZZZ_BIOG_MAIN.x_coord,
ZZZ_BIOG_MAIN.y_coord " + _
                          "FROM ZZ_SCRATCH_P_TEXT INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_P_TEXT.c_person_id = ZZZ_B
IOG_MAIN.c_personid"
            '
            Set tRstPeople = CurrentDb.OpenRecordset(tQueryStr, dbOpenDynaset)
            '
            ' process the four tables
            '
            tC = Chr(44) ' the comma
            '
            ' first the nodes: define the record structure
            '
            ' if the file is strictly ASCII, the label is the pinyin, but if there are characters, then we add a
 pinyin field
            If tCodeStr = "ascii" Then
                 tStr = "nameID" + tC + "namePY" + tC + "indexyear" + tC + "dynasty" + tC + "sex"
            Else
                 tStr = "nameID" + tC + "nameHZ" + tC + "namePY" + tC + "indexyear" + tC + "dynasty" + tC + "sex"
            End If
            gStream.WriteText tStr, adWriteLine
            'tGDF.WriteLine (tStr)
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
        ' now places: since the association "event" is not linked to a place, the only addresses are the index
addresses
        '                of the people involved, recorded in ZZ_SCRATCH_PEOPLE
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
            tQueryStr = "SELECT DISTINCT ZZZ_BIOG_MAIN.c_index_addr_id, ZZZ_BIOG_MAIN.c_index_addr_name, " + _
                              "ZZZ_BIOG_MAIN.c_index_addr_chn, ZZZ_BIOG_MAIN.x_coord, ZZZ_BIOG_MAIN.y_coord " + _
                         "FROM ZZ_SCRATCH_P_TEXT INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_P_TEXT.c_person_id = ZZZ_B
IOG_MAIN.c_personid " + _
                         "WHERE (ZZZ_BIOG_MAIN.c_index_addr_id > 0)"

               Set tRstPlace = CurrentDb.OpenRecordset(tQueryStr)
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
                       If Not IsNull(!c_index_addr_id) Then
                           tStr = Trim(Str(!c_index_addr_id)) + tC
                           '
                           '   address name

                           If IsNull(!c_index_addr_name) Then
                                tStr = tStr + "unknown" + tC
                           Else
                                tStr = tStr + !c_index_addr_name + tC
                           End If
                           '
                           If Not (tCodeStr = "ascii") Then
                                If IsNull(!c_index_addr_chn) Then
                                     tStr = tStr + "unknown" + tC
                                Else
                                     tStr = tStr + !c_index_addr_chn + tC
                                End If
                           End If

                           '    longitude = !x_coord
                           If IsNull(!x_coord) Then
                                tStr = tStr + "0.0" + tC
                           Else
                                tStr = tStr + Str(!x_coord) + tC
                           End If

                           '    latitude = !y_coord
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
            tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_P_TEXT.c_person_id, ZZZ_BIOG_MAIN.c_index_addr_id, ZZZ_BIOG_M
AIN.c_index_addr_type_code, " + _
                            "ZZZ_BIOG_MAIN.c_index_addr_type_desc, ZZZ_BIOG_MAIN.c_index_addr_type_chn " + _
                        "FROM ZZ_SCRATCH_P_TEXT INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_P_TEXT.c_person_id = ZZZ_B
IOG_MAIN.c_personid " + _
                        "WHERE (ZZZ_BIOG_MAIN.c_index_addr_id > 0)"

               Set tRstPeoplePlace = CurrentDb.OpenRecordset(tQueryStr)

               If (tCodeStr = "ascii") Then
                    tStr = "nameID" + tC + "placeID" + tC + "personPlaceCode" + tC + "personPlaceTrans"
               Else
                    tStr = "nameID" + tC + "placeID" + tC + "personPlaceCode" + tC + "personPlaceTrans" + tC + "perso
nPlaceHZ"
               End If

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
                            tStr = tStr + Trim(Str(!c_index_addr_type_code)) + tC
                            '
                            tStr = tStr + Trim(!c_index_addr_type_desc)
                            '
                            If Not (tCodeStr = "ascii") Then
                                tStr = tStr + tC + Trim(!c_index_addr_type_chn)
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
        ' now the association records
        '
        dlgSaveAs.InitialFileName = "PeopleAssociations_" + tCodeStr + ".csv"
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
            ' now the associations: define the record structure
             ' Because of the complexity of the primary key, this gets a bit complicated
             '
             Set tRstAssoc = CurrentDb.OpenRecordset("ZZ_SOCIAL_NETWORK", dbOpenDynaset)
             '
             tStr = "Person1_ID" + tC + "Person2_ID" + tC + "Association_Code" + tC + "Kin_ID" + tC + "Kin_Code" +
    tC + _
                     "AssocKin_ID" + tC + "AssocKin_Code" + tC + "LiteraryGenreCode" + tC + "OccasionCode" + tC +
_
                     "TopicCode" + tC + "InstitutionCode" + tC + "TextTitle" + tC + "AssociationClaimer_ID"
             gStream.WriteText tStr, adWriteLine
             'tGDF.WriteLine (tStr)

             With tRstAssoc
                 .MoveFirst
                 Do While Not .EOF
                     If !c_link_type = "N" And (Not IsNull(!c_link_code)) Then
                         tStr = Trim(Str(!c_person_id)) + tC
                         '   node1 = str(c_person_id) for node1
                         tStr = tStr + Trim(Str(!c_node_id)) + tC
                         '   node2 = str(c_node_id) for node2
                         tStr = tStr + Trim(Str(!c_link_code)) + tC

                         '    kin ID
                         If IsNull(!c_kin_id) Then
                              tStr = tStr + "0" + tC
                         Else
                              tStr = tStr + Str(!c_kin_id) + tC
                         End If

                         '    kin code
                         If IsNull(!c_kin_code) Then
                              tStr = tStr + "0" + tC
                         Else
                              tStr = tStr + Str(!c_kin_code) + tC
                         End If

                         '    assoc kin ID
                         If IsNull(!c_assoc_kin_id) Then
                              tStr = tStr + "0" + tC
                         Else
                              tStr = tStr + Str(!c_assoc_kin_id) + tC
                         End If

                         '    assoc kin code
                         If IsNull(!c_assoc_kin_code) Then
                              tStr = tStr + "0" + tC
                         Else
                              tStr = tStr + Str(!c_assoc_kin_code) + tC
                         End If

                         '    literary genre code
                         If IsNull(!c_litgenre_code) Then
                              tStr = tStr + "0" + tC
                         Else
                              tStr = tStr + Str(!c_litgenre_code) + tC
                         End If

                         '    occasion code
                         If IsNull(!c_occasion_code) Then
                              tStr = tStr + "0" + tC
                         Else
                              tStr = tStr + Str(!c_occasion_code) + tC
                         End If

                         '    topic code
                         If IsNull(!c_topic_code) Then
                              tStr = tStr + "0" + tC
                         Else
                              tStr = tStr + Str(!c_topic_code) + tC
                         End If

                         '    institution code
                         If IsNull(!c_inst_code) Then
                              tStr = tStr + "0" + tC
                         Else
                              tStr = tStr + Str(!c_inst_code) + tC
                         End If

                         '   text title
                         If IsNull(!c_text_title) Then
                                  tStr = tStr + "N/A" + tC
                           Else
                               tStr = tStr + !c_text_title + tC
                           End If

                           '    association claimer ID
                           If IsNull(!c_assoc_claimer_id) Then
                                tStr = tStr + "0" + tC
                           Else
                                tStr = tStr + Str(!c_assoc_claimer_id)
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
        '
        ' now the kinship relations: first, will there be any?
        '
        If ChkKinship.Value Then
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP"
            cmdSQL.Execute tRecDeleted
            '
            tQueryStr = "INSERT INTO ZZ_KIN_LIST_TMP ( c_kin_code, c_kinrel, c_kinrel_total ) " + _
                         "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_link_code, ZZ_SOCIAL_NETWORK.c_link_desc, ZZ_SOCIAL_
NETWORK.c_link_chn " + _
                         "FROM ZZ_SOCIAL_NETWORK " + _
                         "WHERE (((ZZ_SOCIAL_NETWORK.c_link_type)='K') AND ((ZZ_SOCIAL_NETWORK.c_link_code)>0))"
            '
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted

               If tRecDeleted > 0 Then
                   dlgSaveAs.InitialFileName = "KinshipRelations_" + tCodeStr + ".csv"
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
                       tStr = "PersonID" + tC + "KinID" + tC + "KinCode"

                       gStream.WriteText tStr, adWriteLine
                       '
                       ' still using ZZ_SOCIAL_NETWORK
                       '
                       With tRstAssoc
                           .MoveFirst
                           Do While Not .EOF
                               If !c_link_type = "K" And (Not IsNull(!c_link_code)) Then
                                   '
                                   tStr = Trim(Str(!c_person_id)) + tC
                                   '
                                   tStr = Trim(Str(!c_node_id)) + tC
                                   '
                                   tStr = Trim(Str(!c_link_code))
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
            End If
        End If
        '
        ' now the association codes
        '
        dlgSaveAs.InitialFileName = "AssociationCodes_" + tCodeStr + ".csv"
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
            tQueryStr = "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_link_code, ZZ_SOCIAL_NETWORK.c_link_desc, ZZ_SOCIAL_
NETWORK.c_link_chn " + _
                         "FROM ZZ_SOCIAL_NETWORK " + _
                         "WHERE ((ZZ_SOCIAL_NETWORK.c_link_type = 'N') and (ZZ_SOCIAL_NETWORK.c_link_code > 0))"

            Set tRstAssocCode = CurrentDb.OpenRecordset(tQueryStr, dbOpenDynaset)
            '
            If tCodeStr = "ascii" Then
                 tStr = "AssociationCode" + tC + "AssociationTrans"
            Else
                 tStr = "AssociationCode" + tC + "AssociationTrans" + tC + "AssociationHZ"
            End If

            gStream.WriteText tStr, adWriteLine

            With tRstAssocCode
                .MoveFirst
                Do While Not .EOF
                    If Not IsNull(!c_link_code) Then
                        '
                        tStr = Trim(Str(!c_link_code)) + tC
                        '
                        tStr = tStr + Trim(!c_link_desc)
                        '
                        If Not (tCodeStr = "ascii") Then
                            tStr = tStr + tC + Trim(!c_link_chn)
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
        ' there are codes that MAY require additional tables: c_kin_code, c_litgenrte_code, c_occasion_code, c_t
opic_code, c_inst_code
        '
        ' test for kin codes
        '
        ' tRecDeleted is the number of kinship codes inserted into ZZ_KIN_LIST_TEMP for the earlier test
        '
        tTempLong = tRecDeleted
        tQueryStr = "INSERT INTO ZZ_KIN_LIST_TMP ( c_kin_code, c_kinrel, c_kinrel_total ) " + _
                    "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_kin_code, ZZ_SOCIAL_NETWORK.c_kin_desc, ZZ_SOCIAL_NETWOR
K.c_kin_desc_chn " + _
                    "FROM ZZ_SOCIAL_NETWORK " + _
                    "WHERE (((ZZ_SOCIAL_NETWORK.c_kin_code)>0))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted

        tTempLong = tTempLong + tRecDeleted
        tQueryStr = "INSERT INTO ZZ_KIN_LIST_TMP ( c_kin_code, c_kinrel, c_kinrel_total ) " + _
                    "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_assoc_kin_code, ZZ_SOCIAL_NETWORK.c_assoc_kin_desc, ZZ_S
OCIAL_NETWORK.c_assoc_kin_desc_chn " + _
                    "FROM ZZ_SOCIAL_NETWORK " + _
                    "WHERE (((ZZ_SOCIAL_NETWORK.c_assoc_kin_code)>0))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted

        tTempLong = tTempLong + tRecDeleted
        '
        ' debug
        '
        MsgBox "Kinship code records = " + Trim(Str(tTempLong))
        '
        If tTempLong > 0 Then
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
                tQueryStr = "SELECT DISTINCT ZZ_KIN_LIST_TMP.c_kin_code, ZZ_KIN_LIST_TMP.c_kinrel, ZZ_KIN_LIST_TM
P.c_kinrel_total " + _
                             "FROM ZZ_KIN_LIST_TMP"

                   Set tRstAssocCode = CurrentDb.OpenRecordset(tQueryStr)

                   If tCodeStr = "ascii" Then
                       tStr = "KinshipCode" + tC + "KinshipTrans"
                   Else
                       tStr = "KinshipCode" + tC + "KinshipTrans" + tC + "KinshipHZ"
                   End If

                   gStream.WriteText tStr, adWriteLine

                   With tRstAssocCode
                       .MoveFirst
                       Do While Not .EOF
                            If Not IsNull(!c_kin_code) Then
                                '
                                tStr = Trim(Str(!c_kin_code)) + tC
                                '
                                tStr = tStr + Trim(!c_kinrel)
                                '
                                If Not (tCodeStr = "ascii") Then
                                    tStr = tStr + tC + Trim(!c_kinrel_total)
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
        End If
        '
        ' test for literary genre codes
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) " + _
                     "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_person_id " + _
                     "FROM ZZ_SOCIAL_NETWORK " + _
                     "WHERE (((ZZ_SOCIAL_NETWORK.c_litgenre_code)>0))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' debug
        '
        MsgBox "Literary genre code records = " + Trim(Str(tRecDeleted))
        '
        If tRecDeleted > 0 Then
            dlgSaveAs.InitialFileName = "LiteraryGenreCodes_" + tCodeStr + ".csv"
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
                tQueryStr = "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_litgenre_code, ZZ_SOCIAL_NETWORK.c_litgenre_desc
, ZZ_SOCIAL_NETWORK.c_litgenre_desc_chn " + _
                             "FROM ZZ_SOCIAL_NETWORK " + _
                             "WHERE (((ZZ_SOCIAL_NETWORK.c_litgenre_code)>0))"
                   Set tRstAssocCode = CurrentDb.OpenRecordset(tQueryStr)

                   If tCodeStr = "ascii" Then
                        tStr = "LitGenreCode" + tC + "LitGenreTrans"
                   Else
                        tStr = "LitGenreCode" + tC + "LitGenreTrans" + tC + "LitGenreHZ"
                   End If

                   gStream.WriteText tStr, adWriteLine

                   With tRstAssocCode
                       .MoveFirst
                       Do While Not .EOF
                            If Not IsNull(!c_litgenre_code) Then
                                '
                                tStr = Trim(Str(!c_litgenre_code)) + tC
                                '
                                tStr = tStr + Trim(!c_litgenre_desc)
                                '
                                If Not (tCodeStr = "ascii") Then
                                    tStr = tStr + tC + Trim(!c_litgenre_desc_chn)
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
        End If
        '
        ' test for institution codes
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) " + _
                     "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_person_id " + _
                     "FROM ZZ_SOCIAL_NETWORK " + _
                     "WHERE (((ZZ_SOCIAL_NETWORK.c_inst_code)>0))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' debug
        '
        MsgBox "Institution code records = " + Trim(Str(tRecDeleted))
        '
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
                tQueryStr = "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_inst_code, ZZ_SOCIAL_NETWORK.c_inst_name_py, ZZ_
SOCIAL_NETWORK.c_inst_name_hz " + _
                            "FROM ZZ_SOCIAL_NETWORK " + _
                            "WHERE (((ZZ_SOCIAL_NETWORK.c_inst_code)>0))"

                   Set tRstAssocCode = CurrentDb.OpenRecordset(tQueryStr)

                   If tCodeStr = "ascii" Then
                        tStr = "InstitutionCode" + tC + "InstitutionNamePY"
                   Else
                        tStr = "InstitutionCode" + tC + "InstitutionNamePY" + tC + "InstitutionNameHZ"
                   End If

                   gStream.WriteText tStr, adWriteLine

                   With tRstAssocCode
                       .MoveFirst
                       Do While Not .EOF
                            If Not IsNull(!c_inst_code) Then
                                '
                                tStr = Trim(Str(!c_inst_code)) + tC
                                '
                                tStr = tStr + Trim(!c_inst_name_py)
                                '
                                If Not (tCodeStr = "ascii") Then
                                    tStr = tStr + tC + Trim(!c_inst_name_hz)
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
        End If
        '
        ' test for occasion codes
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) " + _
                     "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_person_id " + _
                     "FROM ZZ_SOCIAL_NETWORK " + _
                     "WHERE (((ZZ_SOCIAL_NETWORK.c_occasion_code)>0))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' debug
        '
        MsgBox "Occasion code records = " + Trim(Str(tRecDeleted))
        '
        If tRecDeleted > 0 Then
            dlgSaveAs.InitialFileName = "OccasionCodes_" + tCodeStr + ".csv"
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
                tQueryStr = "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_occasion_code, ZZ_SOCIAL_NETWORK.c_occasion_desc
, ZZ_SOCIAL_NETWORK.c_occasion_desc_chn " + _
                             "FROM ZZ_SOCIAL_NETWORK " + _
                             "WHERE (((ZZ_SOCIAL_NETWORK.c_occasion_code)>0))"

                   Set tRstAssocCode = CurrentDb.OpenRecordset(tQueryStr)

                   If tCodeStr = "ascii" Then
                        tStr = "OccasionCode" + tC + "OccasionTrans"
                   Else
                        tStr = "OccasionCode" + tC + "OccasionTrans" + tC + "OccasionHZ"
                   End If

                   gStream.WriteText tStr, adWriteLine

                   With tRstAssocCode
                       .MoveFirst
                       Do While Not .EOF
                            If Not IsNull(!c_occasion_code) Then
                                '
                                tStr = Trim(Str(!c_occasion_code)) + tC
                                '
                                tStr = tStr + Trim(!c_occasion_desc)
                                '
                                If Not (tCodeStr = "ascii") Then
                                    tStr = tStr + tC + Trim(!c_occasion_desc_chn)
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
        End If
        '
        ' test for topic codes
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) " + _
                     "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_person_id " + _
                     "FROM ZZ_SOCIAL_NETWORK " + _
                     "WHERE (((ZZ_SOCIAL_NETWORK.c_topic_code)>0))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' debug
        '
        MsgBox "Topic code records = " + Trim(Str(tRecDeleted))
        '
        If tRecDeleted > 0 Then
            dlgSaveAs.InitialFileName = "TopicCodes_" + tCodeStr + ".csv"
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
                ' because ZZZ_NONKIN_BIOG_ADDR does not have the topic descriptions (must fix), I need to use a j
oin to TOPIC_CODES
                '
                tQueryStr = "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_topic_code, SCHOLARLYTOPIC_CODES.c_topic_desc, S
CHOLARLYTOPIC_CODES.c_topic_desc_chn " + _
                             "FROM ZZ_SOCIAL_NETWORK INNER JOIN SCHOLARLYTOPIC_CODES ON ZZ_SOCIAL_NETWORK.c_topic_
code = SCHOLARLYTOPIC_CODES.c_topic_code " + _
                             "WHERE (((ZZ_SOCIAL_NETWORK.c_topic_code)>0))"

                   Set tRstAssocCode = CurrentDb.OpenRecordset(tQueryStr)

                   If tCodeStr = "ascii" Then
                        tStr = "TopicCode" + tC + "TopicTrans"
                   Else
                        tStr = "TopicCode" + tC + "TopicTrans" + tC + "TopicHZ"
                   End If

                   gStream.WriteText tStr, adWriteLine

                   With tRstAssocCode
                       .MoveFirst
                       Do While Not .EOF
                            If Not IsNull(!c_topic_code) Then
                                '
                                tStr = Trim(Str(!c_topic_code)) + tC
                                '
                                tStr = tStr + Trim(!c_topic_desc)
                                '
                                If Not (tCodeStr = "ascii") Then
                                    tStr = tStr + tC + Trim(!c_topic_desc_chn)
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
        End If
    MsgBox "Finished saving to Neo4j"

    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdNeo4j_Click:
    Exit Sub

Err_CmdNeo4j_Click:
    MsgBox Err.Description
    Resume Exit_CmdNeo4j_Click
End Sub

Private Sub CmdPickPerson1_Click()
On Error GoTo Err_CmdPickPerson1_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strPERSON_ID As String

    TxtID1.Visible = True
    TxtID1.SetFocus
    strPERSON_ID = TxtID1.Text
        stDocName = "frmSelectPerson"
        DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strPERSON_ID

        If CurrentProject.AllForms("frmSelectPerson").IsLoaded Then
           Dim lngPERSON_ID As Long
           Dim strPERSON_NM As String
           Dim strPERSON_NM_CHN As String

           Forms!frmSelectPerson!frmPersonSearch.Form!c_personid.SetFocus
           lngPERSON_ID = Forms!frmSelectPerson!frmPersonSearch.Form!c_personid.Value
           TxtID1.Value = lngPERSON_ID

           Forms!frmSelectPerson!frmPersonSearch.Form!c_name_chn.SetFocus
           strPERSON_NM_CHN = Forms!frmSelectPerson!frmPersonSearch.Form!c_name_chn.Value
           TxtPerson1Chn.Value = strPERSON_NM_CHN

           Forms!frmSelectPerson!frmPersonSearch.Form!c_name.SetFocus
           strPERSON_NM = Forms!frmSelectPerson!frmPersonSearch.Form!c_name.Value
        TxtPerson1.Value = strPERSON_NM

        DoCmd.Close acForm, stDocName
        '
        ' now enable the Run button
        '
        If TxtID2.Value > 0 Then
            CmdQuery.Enabled = True
        End If
    End If

    CmdPickPerson1.SetFocus
    TxtID1.Visible = False

Exit_CmdPickPerson1_Click:
    Exit Sub

Err_CmdPickPerson1_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickPerson1_Click

End Sub
Private Sub CmdPickPerson2_Click()
On Error GoTo Err_CmdPickPerson2_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strPERSON_ID As String

        TxtID2.Visible = True
        TxtID2.SetFocus
        strPERSON_ID = TxtID2.Text


        stDocName = "frmSelectPerson"
        DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strPERSON_ID

        If CurrentProject.AllForms("frmSelectPerson").IsLoaded Then
           Dim lngPERSON_ID As Long
           Dim strPERSON_NM As String
           Dim strPERSON_NM_CHN As String

           Forms!frmSelectPerson!frmPersonSearch.Form!c_personid.SetFocus
           lngPERSON_ID = Forms!frmSelectPerson!frmPersonSearch.Form!c_personid.Value
           TxtID2.Value = lngPERSON_ID

           Forms!frmSelectPerson!frmPersonSearch.Form!c_name_chn.SetFocus
           strPERSON_NM_CHN = Forms!frmSelectPerson!frmPersonSearch.Form!c_name_chn.Value
           TxtPerson2Chn.Value = strPERSON_NM_CHN

           Forms!frmSelectPerson!frmPersonSearch.Form!c_name.SetFocus
           strPERSON_NM = Forms!frmSelectPerson!frmPersonSearch.Form!c_name.Value
            TxtPerson2.Value = strPERSON_NM

            DoCmd.Close acForm, stDocName
            '
            ' now enable the Run button
            '
            If TxtID1.Value > 0 Then
                CmdQuery.Enabled = True
            End If
        End If

    CmdPickPerson2.SetFocus
    TxtID2.Visible = False

Exit_CmdPickPerson2_Click:
    Exit Sub

Err_CmdPickPerson2_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickPerson2_Click

End Sub

Private Sub CmdQuery_Click()
    On Error GoTo Err_CmdQuery_Click

    Dim tRstDummy As DAO.Recordset, tContinue As Integer, tQueryStr As String, tQueryFromStr As String
    Dim tQueryWhereStr As String, tQueryAppendStr As String, tQueryIntoStr As String
    Dim tQuerySelectStr As String, tQuery1stStr As String, tQuery2ndStr As String
    Dim tQuery1stWhereStr As String, tQuery2ndWhereStr As String
    Dim tID1Str As String, tID2Str As String, tFromStr As String, tToStr As String
    Dim cmdSQL As ADODB.Command, tRecDeleted As Long, tCurADDRBookmark As Variant

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    ' to clear the table, close and then delete records
    '
    Set ZZ_SOCIAL_NETWORK.Form.Recordset = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SN", dbOpenDynaset)
    '
    cmdSQL.CommandText = "Delete * from ZZ_SOCIAL_NETWORK"
    cmdSQL.Execute tRecDeleted
    '
    ' now the people table
    '
    Set ZZ_SCRATCH_PEOPLE.Form.Recordset = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SP", dbOpenDynaset)
    '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
    cmdSQL.Execute tRecDeleted
    '
    ' get the index year constraints
    '
    If gUseIndexYears Then
        '
        TxtFromYear.SetFocus
        If TxtFromYear.Value = "" Then
             gFromStr = ""
        Else
             gFromStr = Str(TxtFromYear.Value)
        End If

          TxtToYear.SetFocus
          If TxtToYear.Value = "" Then
               gToStr = ""
          Else
               gToStr = Str(TxtToYear.Value)
          End If

        CmdQuery.SetFocus
        '
        ' four possibilities
        '
        If gFromStr = "" And gToStr = "" Then
             tQueryWhereStr = ""
        ElseIf gFromStr = "" Then
             tQueryWhereStr = "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_index_year)<=" + gToStr + ") "
        ElseIf gToStr = "" Then
             tQueryWhereStr = "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_index_year)>=" + gFromStr + ") "
        Else
             tQueryWhereStr = "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_index_year)<=" + gToStr + ") AND " + _
                 "((ZZZ_NONKIN_BIOG_ADDR.c_index_year)>=" + gFromStr + ") "
        End If
    ElseIf tUseDynasties Then
        '
        ' five possibilities (all, just from, just to, both from and to, and a cluelessly unset parameter)
        '
        If gFromDynasty = -2 Then
             tQueryWhereStr = "Where (((ZZZ_NONKIN_BIOG_ADDR.c_dy) > 0 ) "
        ElseIf gFromDynasty = -1 And gToDynasty > 0 Then
               tQueryWhereStr = "WHERE (((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
          ElseIf gFromDynasty > 0 And gToDynasty = -1 Then
               tQueryWhereStr = "WHERE (((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") "
          ElseIf gFromDynasty = gToDynasty And gFromDynasty > 0 Then
               tQueryWhereStr = "WHERE (((DYNASTIES.c_dy) = " + Str(gFromDynasty) + ") "
          ElseIf gFromDynasty > 0 And gToDynasty > 0 Then
               tQueryWhereStr = "WHERE (((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") AND " + _
                   "((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") "
          Else
               tQueryWhereStr = ""
          End If
      End If

      ' define the query for appending to ZZ_SCRATCH_PEOPLE without duplication
      '
      tQueryAppendStr = "INSERT INTO ZZ_SCRATCH_PEOPLE SELECT ZZ_SCRATCH_PAIR_PEOPLE.* " + _
           "FROM ZZ_SCRATCH_PAIR_PEOPLE LEFT JOIN ZZ_SCRATCH_PEOPLE ON " + _
           "ZZ_SCRATCH_PAIR_PEOPLE.c_person_id = ZZ_SCRATCH_PEOPLE.c_person_id " + _
           "WHERE (((ZZ_SCRATCH_PEOPLE.c_person_id) Is Null))"
      '
      ' first add the target people (if CmdClearList is enabled, ImportList was successful)
      '
      If CmdClearList.Enabled Then
           ' MsgBox "Using list"
           tQueryStr = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, " + _
               "c_female, c_addr_id, c_addr_type, c_addr_desc, c_addr_desc_chn, c_addr_name, c_addr_chn, " + _
               "x_coord, y_coord, c_node_dist ) " + _
               "SELECT ZZZ_BIOG_MAIN.c_personid, ZZZ_BIOG_MAIN.c_name, " + _
               "ZZZ_BIOG_MAIN.c_name_chn, ZZZ_BIOG_MAIN.c_index_year, " + _
               "ZZZ_BIOG_MAIN.c_female, ZZZ_BIOG_MAIN.c_index_addr_id, ZZZ_BIOG_MAIN.c_index_addr_type_code, " + _
               "ZZZ_BIOG_MAIN.c_index_addr_type_desc, ZZZ_BIOG_MAIN.c_index_addr_type_chn, " + _
               "ZZZ_BIOG_MAIN.c_index_addr_name, ZZZ_BIOG_MAIN.c_index_addr_chn, ZZZ_BIOG_MAIN.x_coord, " + _
               "ZZZ_BIOG_MAIN.y_coord, 0 AS c_node_dist " + _
               "FROM ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ZZZ_BIOG_MAIN ON " + _
               "ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZZZ_BIOG_MAIN.c_personid"
      Else
           '
           ' get the ID strings for the two people
           '
           Me.TxtID1.Visible = True
           Me.TxtID1.SetFocus
           tID1Str = Trim(Str(TxtID1.Value))
           Me.TxtID2.Visible = True
           Me.TxtID2.SetFocus
           tID2Str = Trim(Str(TxtID2.Value))
           Me.CmdQuery.SetFocus
           Me.TxtID1.Visible = False
           Me.TxtID2.Visible = False

          ' MsgBox "Using people pairs"
          tQueryStr = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, " + _
              "c_female, c_addr_id, c_addr_type, c_addr_desc, c_addr_desc_chn, c_addr_name, c_addr_chn, x_coord, "
+ _
               "y_coord, c_node_dist ) " + _
               "SELECT ZZZ_BIOG_MAIN.c_personid, ZZZ_BIOG_MAIN.c_name, " + _
               "ZZZ_BIOG_MAIN.c_name_chn, ZZZ_BIOG_MAIN.c_index_year, ZZZ_BIOG_MAIN.c_female, " + _
               "ZZZ_BIOG_MAIN.c_index_addr_id, ZZZ_BIOG_MAIN.c_index_addr_type_code, ZZZ_BIOG_MAIN.c_index_addr_type
_desc, " + _
               "ZZZ_BIOG_MAIN.c_index_addr_type_chn, ZZZ_BIOG_MAIN.c_index_addr_name, ZZZ_BIOG_MAIN.c_index_addr_chn
, " + _
               "ZZZ_BIOG_MAIN.x_coord, ZZZ_BIOG_MAIN.y_coord, 0 AS c_node_dist " + _
               "FROM ZZZ_BIOG_MAIN " + _
               "WHERE (((ZZZ_BIOG_MAIN.c_personid)=" + tID1Str + _
               " Or (ZZZ_BIOG_MAIN.c_personid)=" + tID2Str + "))"
      End If
      '
      cmdSQL.CommandText = tQueryStr
      cmdSQL.Execute tRecDeleted
      '
      ' get the first-order linking people
      '
      Call Link1stOrder("NONKIN", "NONKIN")
      '
      ' if kinship ties are to be included, get first-order kinship connections
      ' The situation is a bit more complicated than it might appear, since a kin of X may be an associate of Y
      ' or an associate of X may be a kin of Y or a kin of X may be a kin of Y:
      '      x a=kin(x)   y=kin(a)    00
      '      x a=kin(x)   y=assoc(a) 01
      '      x a=assoc(x) y=kin(a)    10
      '
    If ChkKinship.Value Then
        '
        ' kin-kin
        Call Link1stOrder("KIN", "KIN")
        '
        ' kin-assoc
        Call Link1stOrder("KIN", "NONKIN")

        ' assoc-kin
        Call Link1stOrder("NONKIN", "KIN")
    End If
    '
    ' now get the second order linking people (first the first person in the pair, then the second)
    ' Add these to the temp file and copy only the non-duplicates
    '
    If Me.Chk2Nodes.Value Then
        MsgBox "Warning: the two-node routine takes a while. Don't Panic. Click to start."

        Call Link2ndOrder("NONKIN", "NONKIN", "NONKIN")
        '
        ' if kinship ties are to be included, get second-order kinship connections.
        ' here, there are seven(!) possibilities that must considered:
        '      x a=kin(x) b=kin(a) y=kin(b)        000
        '      x a=kin(x) b=kin(a) y=assoc(b)      001
        '      x a=kin(x) b=assoc(a) y=kin(b)      010
        '      x a=kin(x) b=assoc(a) y=assoc(b) 011
        '      x a=assoc(x) b=kin(a) y=kin(b)      100
        '      x a=assoc(x) b=kin(a) y=assoc(b) 101
        '      x a=assoc(x) b=assoc(a) y=kin(b) 110
        ' Therefore we need to run seven queries by swapping out the tables we use
        '
        If ChkKinship.Value Then
            '
            ' kin-kin-kin
            Call Link2ndOrder("KIN", "KIN", "KIN")
            '
            ' kin-kin-assoc
            Call Link2ndOrder("KIN", "KIN", "NONKIN")
            '
            ' kin-assoc-kin
            Call Link2ndOrder("KIN", "NONKIN", "KIN")
            '
            ' kin-assoc-assoc
            Call Link2ndOrder("KIN", "NONKIN", "NONKIN")
            '
            ' assoc-kin-kin
            Call Link2ndOrder("NONKIN", "KIN", "KIN")
            '
            ' assoc-kin-assoc
            Call Link2ndOrder("NONKIN", "KIN", "NONKIN")
            '
            ' assoc-assoc-kin
            Call Link2ndOrder("NONKIN", "NONKIN", "KIN")
        End If

    End If
    '
    ' remove duplicates
    '
    tQueryStr = "UPDATE ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1 INNER JOIN ZZ_SCRATCH_PEOPLE ON " + _
        "ZZ_SCRATCH_PEOPLE_1.c_person_id = ZZ_SCRATCH_PEOPLE.c_person_id " + _
        "SET ZZ_SCRATCH_PEOPLE.c_delete = True " + _
        "WHERE (((ZZ_SCRATCH_PEOPLE.c_node_dist)>[ZZ_SCRATCH_PEOPLE_1].[c_node_dist]))"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PEOPLE WHERE c_delete = True"
    cmdSQL.Execute tRecDeleted
    '
    ' now use the people table to get the edges:
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_SOCIAL_NETWORK"
    cmdSQL.Execute tRecDeleted
    '
    ' first non-kin
    '
    tQueryIntoStr = "INSERT INTO ZZ_SOCIAL_NETWORK ( c_person_id, c_name, c_name_chn, c_index_year, " + _
        "c_female, c_node_id, c_node_name, c_node_chn, c_node_index_year, c_node_female, c_link_type, " + _
        "c_link_code, c_link_desc, c_link_chn, c_link_count, c_addr_id, c_addr_name, c_addr_chn, " + _
         "c_addr_type, c_addr_desc, c_addr_desc_chn, x_coord, y_coord, c_node_addr_id, c_node_addr_name, " + _
         "c_node_addr_chn, c_node_addr_type, c_node_addr_desc, c_node_addr_desc_chn, node_xcoord, node_ycoord, " +
 _
        "c_edge_dist, type_id, c_kin_desc, c_kin_desc_chn, c_kin_name, c_kin_chn, c_kin_id, c_kin_code, " + _
        "c_assoc_kin_desc, c_assoc_kin_desc_chn, c_assoc_kin_name, c_assoc_kin_chn, c_assoc_kin_id, " + _
        "c_assoc_kin_code, c_litgenre_code, c_litgenre_desc, c_litgenre_desc_chn, c_topic_code, " + _
        "c_topic_desc, c_topic_desc_chn, c_occasion_code, c_occasion_desc, c_occasion_desc_chn, " + _
        "c_inst_code, c_inst_name_hz, c_text_title, c_assoc_claimer_id, c_assoc_claimer_name, " + _
        "c_assoc_claimer_name_chn, c_distance, c_source, c_link_first_year, c_link_last_year, " + _
        "c_link_addr_id, c_link_addr_name, c_link_addr_chn ) "
    tQuerySelectStr = "SELECT ASSOC_REL.c_personid, ASSOC_REL.c_person_name, ASSOC_REL.c_person_name_chn, " + _
        "ASSOC_REL.c_index_year, ASSOC_REL.c_female, ASSOC_REL.c_node_id, ASSOC_REL.c_node_name, " + _
        "ASSOC_REL.c_node_chn, ASSOC_REL.c_node_index_year, ASSOC_REL.c_node_female, 'N' AS c_link_type, " + _
        "ASSOC_REL.c_link_code, ASSOC_REL.c_link_desc, ASSOC_REL.c_link_chn, ASSOC_REL.c_link_count, " + _
        "ASSOC_REL.c_person_addr_id, ASSOC_REL.c_person_addr_name, ASSOC_REL.c_person_addr_chn, ASSOC_REL.c_perso
n_addr_type, " + _
        "ASSOC_REL.c_person_addr_desc, ASSOC_REL.c_person_addr_desc_chn, ASSOC_REL.person_x_coord, ASSOC_REL.pers
on_y_coord, " + _
        "ASSOC_REL.c_node_addr_id, ASSOC_REL.c_node_addr_name, ASSOC_REL.c_node_addr_chn, " + _
        "ASSOC_REL.c_node_addr_type, ASSOC_REL.c_node_addr_desc, ASSOC_REL.c_node_addr_desc_chn, " + _
        "ASSOC_REL.node_xcoord, ASSOC_REL.node_ycoord, ZZ_SCRATCH_PEOPLE.c_node_dist, 'N' AS type_id, ASSOC_REL.c
_kinrel, " + _
        "ASSOC_REL.c_kinrel_chn, ASSOC_REL.c_kin_name, ASSOC_REL.c_kin_chn, ASSOC_REL.c_kin_id, " + _
        "ASSOC_REL.c_kin_code, ASSOC_REL.c_assoc_kinrel, ASSOC_REL.c_assoc_kinrel_chn, " + _
        "ASSOC_REL.c_assoc_kin_name, ASSOC_REL.c_assoc_kin_chn, ASSOC_REL.c_assoc_kin_id, " + _
        "ASSOC_REL.c_assoc_kin_code, ASSOC_REL.c_litgenre_code, ASSOC_REL.c_lit_genre_desc, " + _
        "ASSOC_REL.c_lit_genre_desc_chn, ASSOC_REL.c_topic_code, ASSOC_REL.c_topic_desc, " + _
        "ASSOC_REL.c_topic_desc_chn, ASSOC_REL.c_occasion_code, ASSOC_REL.c_occasion_desc, " + _
        "ASSOC_REL.c_occasion_desc_chn, ASSOC_REL.c_inst_code, ASSOC_REL.c_inst_name_hz, " + _
        "ASSOC_REL.c_text_title, ASSOC_REL.c_assoc_claimer_id, " + _
        "ASSOC_REL.c_assoc_claimer_name , ASSOC_REL.c_assoc_claimer_chn, ASSOC_REL.c_distance, ASSOC_REL.c_source
, " + _
        "ASSOC_REL.c_assoc_first_year, ASSOC_REL.c_assoc_last_year, ASSOC_REL.c_assoc_addr_id, ASSOC_REL.c_assoc_
addr_name, ASSOC_REL.c_assoc_addr_chn "
    tQueryFromStr = "FROM ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1 INNER JOIN (ZZ_SCRATCH_PEOPLE INNER " + _
        "JOIN ZZZ_NONKIN_BIOG_ADDR AS ASSOC_REL ON ZZ_SCRATCH_PEOPLE.c_person_id = " + _
        "ASSOC_REL.c_personid) ON ZZ_SCRATCH_PEOPLE_1.c_person_id = ASSOC_REL.c_node_id "

     'If CmdClearList.Enabled Then
         '
         ' allow the people from the list to serve as nodes, then delete them
         '
         'cmdSQL.CommandText = tQueryIntoStr + tQuerySelectStr + tQueryFromStr
         'cmdSQL.Execute tRecDeleted
         '
         ' now mark the nodes
         '
         'cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ZZ_SOCIAL_NETWORK " + _
             "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZZ_SOCIAL_NETWORK.c_node_id " + _
             "SET ZZ_SOCIAL_NETWORK.c_delete = 1"
         'cmdSQL.Execute tRecDeleted
         '
         ' and delete
         '
         'cmdSQL.CommandText = "Delete from ZZ_SOCIAL_NETWORK where c_delete = 1"
         'cmdSQL.Execute tRecCount
     'Else
         'tQueryWhereStr = "WHERE (((ASSOC_REL.c_node_id)<> " + tID1Str + _
             " And (ASSOC_REL.c_node_id)<>" + tID2Str + "))"

         'cmdSQL.CommandText = tQueryIntoStr + tQuerySelectStr + tQueryFromStr + tQueryWhereStr
         'cmdSQL.Execute tRecDeleted
     'End If
         cmdSQL.CommandText = tQueryIntoStr + tQuerySelectStr + tQueryFromStr
         cmdSQL.Execute tRecDeleted

     If ChkKinship.Value Then
         '
         ' get from the kinship table
         '
         tQueryIntoStr = "INSERT INTO ZZ_SOCIAL_NETWORK ( c_person_id, c_name, c_name_chn, c_index_year, " + _
             "c_female, c_node_id, c_node_name, c_node_chn, c_node_index_year, c_node_female, c_link_type, " + _
             "c_link_code, c_link_desc, c_link_chn, c_link_count, c_addr_id, c_addr_name, c_addr_chn, " + _
             "c_addr_type, c_addr_desc, c_addr_desc_chn, x_coord, y_coord, c_node_addr_id, c_node_addr_name, " + _
             "c_node_addr_chn, c_node_addr_type, c_node_addr_desc, c_node_addr_desc_chn, node_xcoord, " + _
             "node_ycoord, c_edge_dist, type_id, c_distance, c_source ) "
         tQuerySelectStr = "SELECT ZZ_SCRATCH_PEOPLE.c_person_id, KIN_REL.c_person_name, " + _
             "KIN_REL.c_person_name_chn, KIN_REL.c_index_year, KIN_REL.c_female, KIN_REL.c_node_id, " + _
             "KIN_REL.c_node_name, KIN_REL.c_node_chn, KIN_REL.c_node_index_year, KIN_REL.c_node_female, " + _
             "'K' AS c_link_type, KIN_REL.c_link_code, KIN_REL.c_link_desc, KIN_REL.c_link_chn, " + _
            "1 AS c_link_count, KIN_REL.c_person_addr_id, KIN_REL.c_person_addr_name, KIN_REL.c_person_addr_chn,
" + _
            "KIN_REL.c_person_addr_type, KIN_REL.c_person_addr_desc, KIN_REL.c_person_addr_desc_chn, KIN_REL.pers
on_x_coord, " + _
            "KIN_REL.person_y_coord, KIN_REL.c_node_addr_id, KIN_REL.c_node_addr_name, KIN_REL.c_node_addr_chn, "
 + _
            "KIN_REL.c_node_addr_type, KIN_REL.c_node_addr_desc, KIN_REL.c_node_addr_desc_chn, " + _
            "KIN_REL.node_xcoord, KIN_REL.node_ycoord, ZZ_SCRATCH_PEOPLE.c_node_dist, 'K' AS type_id, " + _
            "KIN_REL.c_distance, KIN_REL.c_source "
        tQueryFromStr = "FROM ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1 INNER JOIN (ZZ_SCRATCH_PEOPLE " + _
            "INNER JOIN ZZZ_KIN_BIOG_ADDR AS KIN_REL ON ZZ_SCRATCH_PEOPLE.c_person_id = " + _
            "KIN_REL.c_personid) ON ZZ_SCRATCH_PEOPLE_1.c_person_id = KIN_REL.c_node_id "

        'If CmdClearList.Enabled Then
            '
            ' allow the people from the list to serve as nodes, then delete them
            '
            'cmdSQL.CommandText = tQueryIntoStr + tQuerySelectStr + tQueryFromStr
            'cmdSQL.Execute tRecDeleted
            '
            ' now mark the nodes
            '
            'cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ZZ_SOCIAL_NETWORK " + _
                "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZZ_SOCIAL_NETWORK.c_node_id " + _
                "SET ZZ_SOCIAL_NETWORK.c_delete = 1"
            'cmdSQL.Execute tRecDeleted
            '
            ' and delete
            '
            'cmdSQL.CommandText = "Delete from ZZ_SOCIAL_NETWORK where c_delete = 1"
            'cmdSQL.Execute tRecCount
        'Else
            'tQueryWhereStr = "WHERE (((KIN_REL.c_node_id)<>" + tID1Str + _
                " And (KIN_REL.c_node_id)<>" + tID2Str + "))"

            'cmdSQL.CommandText = tQueryIntoStr + tQuerySelectStr + tQueryFromStr + tQueryWhereStr
            'cmdSQL.Execute tRecDeleted
        'End If
        cmdSQL.CommandText = tQueryIntoStr + tQuerySelectStr + tQueryFromStr
        cmdSQL.Execute tRecDeleted
    End If
    '
    ' now mark all the duplicates that are inverses of other records for deletion
    '
    tQueryStr = "UPDATE ASSOC_CODES INNER JOIN (ZZ_SOCIAL_NETWORK AS ZZ_SOCIAL_NETWORK_1 INNER JOIN " + _
        "ZZ_SOCIAL_NETWORK ON (ZZ_SOCIAL_NETWORK_1.c_node_id = ZZ_SOCIAL_NETWORK.c_person_id) AND " + _
        "(ZZ_SOCIAL_NETWORK_1.c_person_id = ZZ_SOCIAL_NETWORK.c_node_id)) ON (ASSOC_CODES.c_assoc_pair = " + _
        "ZZ_SOCIAL_NETWORK_1.c_link_code) AND (ASSOC_CODES.c_assoc_code = ZZ_SOCIAL_NETWORK.c_link_code) " + _
        "SET ZZ_SOCIAL_NETWORK.c_delete = 1 " + _
        "WHERE (((ZZ_SOCIAL_NETWORK.c_link_type)='N') AND " + _
        "((ZZ_SOCIAL_NETWORK.c_edge_dist)>[ZZ_SOCIAL_NETWORK_1].[c_edge_dist])) OR " + _
        "(((ZZ_SOCIAL_NETWORK.c_link_type)='N') AND " + _
        "((ZZ_SOCIAL_NETWORK.c_edge_dist)=[ZZ_SOCIAL_NETWORK_1].[c_edge_dist]) AND " + _
        "((ZZ_SOCIAL_NETWORK.c_person_id)>[ZZ_SOCIAL_NETWORK_1].[c_person_id]))"
    '
    'MsgBox "About to mark inverses..."
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecCount
    '
    If Me.ChkKinship.Value Then
        tQueryStr = "UPDATE KINSHIP_CODES INNER JOIN (ZZ_SOCIAL_NETWORK AS ZZ_SOCIAL_NETWORK_1 INNER JOIN " + _
            "ZZ_SOCIAL_NETWORK ON (ZZ_SOCIAL_NETWORK_1.c_node_id = ZZ_SOCIAL_NETWORK.c_person_id) AND " + _
            "(ZZ_SOCIAL_NETWORK_1.c_person_id = ZZ_SOCIAL_NETWORK.c_node_id)) ON KINSHIP_CODES.c_kincode = " + _
            "ZZ_SOCIAL_NETWORK.c_link_code SET ZZ_SOCIAL_NETWORK.c_delete = 1 " + _
            "WHERE (((ZZ_SOCIAL_NETWORK.c_link_type)='K') AND " + _
            "((ZZ_SOCIAL_NETWORK.c_edge_dist)>[ZZ_SOCIAL_NETWORK_1].[c_edge_dist]) AND " + _
            "((ZZ_SOCIAL_NETWORK_1.c_link_code)=[KINSHIP_CODES].[c_kin_pair1])) OR (((ZZ_SOCIAL_NETWORK.c_link_ty
pe)='K') " + _
            "AND ((ZZ_SOCIAL_NETWORK.c_edge_dist)=[ZZ_SOCIAL_NETWORK_1].[c_edge_dist]) AND " + _
            "((ZZ_SOCIAL_NETWORK.c_person_id)>[ZZ_SOCIAL_NETWORK_1].[c_person_id]) AND " + _
            "((ZZ_SOCIAL_NETWORK_1.c_link_code)=[KINSHIP_CODES].[c_kin_pair1])) OR (((ZZ_SOCIAL_NETWORK.c_link_ty
pe)='K') " + _
            "AND ((ZZ_SOCIAL_NETWORK.c_edge_dist)>[ZZ_SOCIAL_NETWORK_1].[c_edge_dist]) " + _
            "AND ((ZZ_SOCIAL_NETWORK_1.c_link_code)=[KINSHIP_CODES].[c_kin_pair2])) OR (((ZZ_SOCIAL_NETWORK.c_lin
k_type)='K') " + _
            "AND ((ZZ_SOCIAL_NETWORK.c_edge_dist)=[ZZ_SOCIAL_NETWORK_1].[c_edge_dist]) AND " + _
            "((ZZ_SOCIAL_NETWORK.c_person_id)>[ZZ_SOCIAL_NETWORK_1].[c_person_id]) AND " + _
            "((ZZ_SOCIAL_NETWORK_1.c_link_code)=[KINSHIP_CODES].[c_kin_pair2]))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecCount
    End If
    '
    ' now delete
    '
    'MsgBox "About to delete inverses..."
    cmdSQL.CommandText = "Delete from ZZ_SOCIAL_NETWORK where c_delete = 1"
    cmdSQL.Execute tRecCount
    '
    ' this approach still produces situations where people are associated with themselves. Those records must b
e removed
    '
    tQueryStr = "UPDATE ZZ_SOCIAL_NETWORK SET ZZ_SOCIAL_NETWORK.c_delete = 1 " + _
        "WHERE (((ZZ_SOCIAL_NETWORK.c_person_id)=[ZZ_SOCIAL_NETWORK].[c_node_id]))"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    cmdSQL.CommandText = "Delete from ZZ_SOCIAL_NETWORK where c_delete = 1"
    cmdSQL.Execute tRecCount
    '
    ' now that everything else is settled, I add the dynasty and new index year descriptive information
    '
    cmdSQL.CommandText = "UPDATE ZZZ_BIOG_MAIN AS ZZZ_BIOG_MAIN_1 INNER JOIN (ZZZ_BIOG_MAIN INNER JOIN ZZ_SOCIAL_
NETWORK " + _
        "ON ZZZ_BIOG_MAIN.c_personid = ZZ_SOCIAL_NETWORK.c_person_id) ON ZZZ_BIOG_MAIN_1.c_personid = ZZ_SOCIAL_N
ETWORK.c_node_id " + _
        "SET ZZ_SOCIAL_NETWORK.c_index_year_type_code = [ZZZ_BIOG_MAIN].[c_index_year_type_code], " + _
            "ZZ_SOCIAL_NETWORK.c_index_year_type_desc = [ZZZ_BIOG_MAIN].[c_index_year_type_desc], " + _
            "ZZ_SOCIAL_NETWORK.c_index_year_type_hz = [ZZZ_BIOG_MAIN].[c_index_year_type_hz], " + _
            "ZZ_SOCIAL_NETWORK.c_node_index_year_type_code = [ZZZ_BIOG_MAIN_1].[c_index_year_type_code], " + _
            "ZZ_SOCIAL_NETWORK.c_node_index_year_type_desc = [ZZZ_BIOG_MAIN_1].[c_index_year_type_desc], " + _
            "ZZ_SOCIAL_NETWORK.c_node_index_year_type_hz = [ZZZ_BIOG_MAIN_1].[c_index_year_type_hz], " + _
            "ZZ_SOCIAL_NETWORK.c_dy = [ZZZ_BIOG_MAIN].[c_dy], " + _
            "ZZ_SOCIAL_NETWORK.c_dynasty = [ZZZ_BIOG_MAIN].[c_dynasty], " + _
            "ZZ_SOCIAL_NETWORK.c_dynasty_chn = [ZZZ_BIOG_MAIN].[c_dynasty_chn], " + _
            "ZZ_SOCIAL_NETWORK.c_node_dy = [ZZZ_BIOG_MAIN_1].[c_dy], " + _
            "ZZ_SOCIAL_NETWORK.c_node_dynasty = [ZZZ_BIOG_MAIN_1].[c_dynasty], " + _
            "ZZ_SOCIAL_NETWORK.c_node_dynasty_chn = [ZZZ_BIOG_MAIN_1].[c_dynasty_chn]"
    cmdSQL.Execute tRecDeleted
    '
    ' finally, add the source text information to ZZ_SOCIAL_NETWORK
    '
    cmdSQL.CommandText = "UPDATE ZZ_SOCIAL_NETWORK INNER JOIN TEXT_CODES ON ZZ_SOCIAL_NETWORK.c_source = TEXT_COD
ES.c_textid " + _
        "SET ZZ_SOCIAL_NETWORK.c_source_text = [TEXT_CODES].[c_title], " + _
            "ZZ_SOCIAL_NETWORK.c_source_txt_chn = [TEXT_CODES].[c_title_chn]"
    cmdSQL.Execute tRecDeleted
    '
    cmdSQL.CommandText = "UPDATE ZZZ_BIOG_MAIN INNER JOIN ZZ_SCRATCH_PEOPLE ON ZZZ_BIOG_MAIN.c_personid = ZZ_SCRA
TCH_PEOPLE.c_person_id " + _
        "SET ZZ_SCRATCH_PEOPLE.c_index_year_type_code = [ZZZ_BIOG_MAIN].[c_index_year_type_code], " + _
            "ZZ_SCRATCH_PEOPLE.c_index_year_type_desc = [ZZZ_BIOG_MAIN].[c_index_year_type_desc], " + _
            "ZZ_SCRATCH_PEOPLE.c_index_year_type_hz = [ZZZ_BIOG_MAIN].[c_index_year_type_hz], " + _
            "ZZ_SCRATCH_PEOPLE.c_dy = [ZZZ_BIOG_MAIN].[c_dy], " + _
            "ZZ_SCRATCH_PEOPLE.c_dynasty = [ZZZ_BIOG_MAIN].[c_dynasty], " + _
            "ZZ_SCRATCH_PEOPLE.c_dynasty_chn = [ZZZ_BIOG_MAIN].[c_dynasty_chn]"
    cmdSQL.Execute tRecDeleted
    '
    '
    ' the final step is to calculate the xy_count
    '
    ' get the XY count
    '
    'MsgBox "About to count XYs..."
    '
    cmdSQL.CommandText = "Delete * from tmpXY"
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "INSERT INTO tmpXY ( x_coord, y_coord, CountOfx_coord, CountOfy_coord ) " + _
        "SELECT ZZ_SCRATCH_PEOPLE.x_coord, ZZ_SCRATCH_PEOPLE.y_coord, Count(ZZ_SCRATCH_PEOPLE.x_coord) " + _
        "AS CountOfx_coord, Count(ZZ_SCRATCH_PEOPLE.y_coord) AS CountOfy_coord " + _
        "FROM ZZ_SCRATCH_PEOPLE " + _
        "GROUP BY ZZ_SCRATCH_PEOPLE.x_coord, ZZ_SCRATCH_PEOPLE.y_coord;"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "UPDATE tmpXY INNER JOIN ZZ_SCRATCH_PEOPLE ON (tmpXY.y_coord = " + _
        "ZZ_SCRATCH_PEOPLE.y_coord) AND (tmpXY.x_coord = ZZ_SCRATCH_PEOPLE.x_coord) SET " + _
        "ZZ_SCRATCH_PEOPLE.xy_count = [tmpXY].[CountOfx_coord];"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted

    Set gRstPeople = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
    gRstPeople.MoveLast

    If gRstPeople.RecordCount > 0 Then
         CmdGIS.Enabled = True
         CmdPajek.Enabled = True
         CmdGephi.Enabled = True
         CmdUCINet.Enabled = True
         CmdNeo4j.Enabled = True
         ChkIncludeID.Enabled = True
         CmdStoreID.Enabled = True
    Else
         CmdGIS.Enabled = False
         CmdPajek.Enabled = False
         CmdGephi.Enabled = False
         CmdUCINet.Enabled = False
         CmdNeo4j.Enabled = False
         ChkIncludeID.Enabled = False
         CmdStoreID.Enabled = False
    End If

Exit_CmdQuery_Click:

    ' restore the form tables
    Set ZZ_SOCIAL_NETWORK.Form.Recordset = CurrentDb.OpenRecordset("ZZ_SOCIAL_NETWORK", dbOpenDynaset)
    Set ZZ_SCRATCH_PEOPLE.Form.Recordset = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
    '
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
Private Sub CmdGIS_Click()
On Error GoTo Err_CmdGIS_Click
    '
    ' If it is a KML file, call the routine and exit
    '
    If ChkKML.Value Then
        Call writeKML
        Exit Sub
    End If
    '
    ' This program will dump the results to a .gis file
    '
    If ZZ_SCRATCH_PEOPLE.Form.Recordset.RecordCount = 0 Then
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
    Dim tFileSystem, tGDF

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
        'Name,NameChn,Female,IndexYear,AddrName,AddrChn,X,Y,xy_count,NodeDist
        '
        ' process the table
        '
        Set tRstNode = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
        tC = Chr(44) ' the comma
        '
        With tRstNode
            '
            ' write the header
            '
            tStr = "Name" + tC + "NameChn" + tC + "Female" + tC + "IndexYear" + tC
            tStr = tStr + "AddrName" + tC + "AddrChn" + tC + "X" + tC + "Y" + tC
            tStr = tStr + "xy_count"
            tStream.WriteText tStr, adWriteLine
            .MoveFirst
            Do While Not .EOF
                ' must guard against NULLs
                '
                If IsNull(!c_name) Then
                     tStr = "[?]" + tC
                Else
                     If Trim(!c_name) = "" Then
                          tStr = "[?]" + tC
                     Else
                          tStr = !c_name + tC
                     End If
                End If

                If IsNull(!c_name_chn) Then
                     tStr = tStr + "[?]" + tC
                Else
                     If Trim(!c_name_chn) = "" Then
                          tStr = tStr + "[?]" + tC
                     Else
                          tStr = tStr + !c_name_chn + tC
                     End If
                End If

                If !c_female Then
                     tStr = tStr + "F" + tC
                Else
                     tStr = tStr + "M" + tC
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
           ' now make sure all the data is copied to tStream
           tStream.Flush
           ' and write the stream to the file
           tStream.SaveToFile tFileName, adSaveCreateOverWrite
           '
    Else
        'The user pressed Cancel.
    End If

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

Private Sub Form_Open(Cancel As Integer)
    Dim cmdSQL As ADODB.Command, tRecDeleted As Variant
    Dim tRstAssocCode As DAO.Recordset, tRstDummy As DAO.Recordset

    Set cmdSQL = New ADODB.Command
    '
    ' to clear the tables, briefly close and then delete records
    '
    '
    ' Clear the Edge output table
    '
    Set gRstEdge = ZZ_SOCIAL_NETWORK.Form.Recordset
    '
    If gRstEdge.RecordCount > 0 Then
        Set ZZ_SOCIAL_NETWORK.Form.Recordset = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SN", dbOpenDynaset)
        gRstEdge.Close

        Set cmdDel = New ADODB.Command
        cmdDel.ActiveConnection = CurrentProject.Connection
        cmdDel.CommandType = adCmdText
        '
        cmdDel.CommandText = "Delete * from ZZ_SOCIAL_NETWORK"
        cmdDel.Execute tRecDeleted
        Set cmdDel = Nothing
        '
        Set gRstEdge = CurrentDb.OpenRecordset("ZZ_SOCIAL_NETWORK", dbOpenDynaset)
        Set ZZ_SOCIAL_NETWORK.Form.Recordset = gRstEdge
    End If
    '
    ' Clear the Node output table
    '
    Set tRstDummy = ZZ_SCRATCH_PEOPLE.Form.Recordset
    '
    If tRstDummy.RecordCount > 0 Then
        Set ZZ_SCRATCH_PEOPLE.Form.Recordset = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SP", dbOpenDynaset)
        tRstDummy.Close

        Set cmdDel = New ADODB.Command
        cmdDel.ActiveConnection = CurrentProject.Connection
        cmdDel.CommandType = adCmdText
        '
        cmdDel.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
        cmdDel.Execute tRecDeleted
        Set cmdDel = Nothing
        '
        Set ZZ_SCRATCH_PEOPLE.Form.Recordset = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
    End If
    Set tRstDummy = Nothing

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

    Me.TxtFromYear.Enabled = False
    Me.TxtToYear.Enabled = False
    'Me.ChkIndexYears.Value = False
    Me.ChkIncludeID.Value = False

    If DCount("*", "ZZ_STORE_PERSON_ID") > 0 Then
         Me.CmdRecallID.Enabled = True
    Else
         Me.CmdRecallID.Enabled = False
    End If

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
    If ZZ_SOCIAL_NETWORK.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdPajek_Click
    End If
    '
    If ZZ_SCRATCH_PEOPLE.Form.Recordset.RecordCount = 0 Then
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
             If CodeFrame.Value = 4 Then
                  tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK ( c_ID, c_lbl, c_distance, c_v_num, c_delete ) " + _
                      "SELECT DISTINCT ZZ_SCRATCH_PEOPLE.c_person_id, ZZ_SCRATCH_PEOPLE.c_name, " + _
                      "ZZ_SCRATCH_PEOPLE.c_node_dist, val(c_person_id) AS c_v_num, TRUE as c_delete FROM ZZ_SCRATCH
_PEOPLE"
             Else
                  tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK ( c_ID, c_lbl, c_distance, c_v_num, c_delete ) " + _
                      "SELECT DISTINCT ZZ_SCRATCH_PEOPLE.c_person_id, ZZ_SCRATCH_PEOPLE.c_name_chn, " + _
                      "ZZ_SCRATCH_PEOPLE.c_node_dist, val(c_person_id) AS c_v_num, TRUE as c_delete FROM ZZ_SCRATCH
_PEOPLE"
             End If

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            ' fill in any missing names
            '
            tQueryStr = "UPDATE ZZ_SCRATCH_PEOPLE INNER JOIN ZZ_SCRATCH_PAJEK ON " + _
                "ZZ_SCRATCH_PEOPLE.c_person_id = ZZ_SCRATCH_PAJEK.c_ID SET ZZ_SCRATCH_PAJEK.c_lbl = " + _
                "[ZZ_SCRATCH_PEOPLE].[c_name] WHERE (((ZZ_SCRATCH_PAJEK.c_lbl) Is Null))"
            '
            ' if needed, find the 0-degree nodes, using the edge list to mark the node list
            '
            If ChkDegree.Value Then
                '
                cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_PAJEK INNER JOIN ZZ_SOCIAL_NETWORK " + _
                    "ON ZZ_SCRATCH_PAJEK.c_id = ZZ_SOCIAL_NETWORK.c_person_id " + _
                    "SET ZZ_SCRATCH_PAJEK.c_delete = False"
                cmdSQL.Execute tRecDeleted
                '
                cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_PAJEK INNER JOIN ZZ_SOCIAL_NETWORK " + _
                    "ON ZZ_SCRATCH_PAJEK.c_id = ZZ_SOCIAL_NETWORK.c_node_id " + _
                    "SET ZZ_SCRATCH_PAJEK.c_delete = False"
                cmdSQL.Execute tRecDeleted
                '
                ' remove records where c_delete = TRUE
                '
                'MsgBox "Got through update"
                '
                cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PAJEK WHERE ((ZZ_SCRATCH_PAJEK.c_delete) = TRUE )"
                cmdSQL.Execute tRecDeleted
              End If

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
              tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK_EDGE ( c_node_1, c_node_2, c_edge_count, c_edge_dist ) " +
_
                   "SELECT Val([ZZ_SCRATCH_PAJEK].[c_v_num]) AS c_node_1, " + _
                   "Val([ZZ_SCRATCH_PAJEK_1].[c_v_num]) AS c_node_2, " + _
                   "Sum(ZZ_SOCIAL_NETWORK.c_link_count) AS SumOfc_link_count, " + _
                   "Min(ZZ_SOCIAL_NETWORK.c_edge_dist) AS MinOfc_edge_dist " + _
                   "FROM ZZ_SCRATCH_PAJEK AS ZZ_SCRATCH_PAJEK_1 INNER JOIN " + _
                   "(ZZ_SOCIAL_NETWORK INNER JOIN ZZ_SCRATCH_PAJEK ON ZZ_SOCIAL_NETWORK.c_person_id = " + _
                   "ZZ_SCRATCH_PAJEK.c_ID) ON ZZ_SCRATCH_PAJEK_1.c_ID = ZZ_SOCIAL_NETWORK.c_node_id " + _
                   "GROUP BY Val([ZZ_SCRATCH_PAJEK].[c_v_num]), Val([ZZ_SCRATCH_PAJEK_1].[c_v_num])"

              '   NOTE:   the commented-out code is for when we do not allow parallel edges and have to aggregate the
    results
            '
            'tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK_EDGE ( c_node_1, c_node_2, c_edge_desc, c_edge_count, c_ed
ge_dist ) " + _
                "SELECT Val([ZZ_SCRATCH_PAJEK].[c_v_num]) AS c_node_1, " + _
                "Val([ZZ_SCRATCH_PAJEK_1].[c_v_num]) AS c_node_2, " + _
                "ZZ_SOCIAL_NETWORK.c_link_desc, " + _
                "ZZ_SOCIAL_NETWORK.c_link_count, " + _
                "ZZ_SOCIAL_NETWORK.c_edge_dist " + _
                "FROM ZZ_SCRATCH_PAJEK AS ZZ_SCRATCH_PAJEK_1 INNER JOIN " + _
                "(ZZ_SOCIAL_NETWORK INNER JOIN ZZ_SCRATCH_PAJEK ON ZZ_SOCIAL_NETWORK.c_person_id = " + _
                "ZZ_SCRATCH_PAJEK.c_ID) ON ZZ_SCRATCH_PAJEK_1.c_ID = ZZ_SOCIAL_NETWORK.c_node_id "

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
              tQueryStr = "UPDATE ((ZZ_SOCIAL_NETWORK INNER JOIN TMP_SCRATCH_PAJEK ON " + _
                      "ZZ_SOCIAL_NETWORK.c_person_id = TMP_SCRATCH_PAJEK.c_ID)" + _
                      " INNER JOIN ZZ_SCRATCH_PAJEK_EDGE ON " + _
                      "TMP_SCRATCH_PAJEK.c_v_num = ZZ_SCRATCH_PAJEK_EDGE.c_node_1) " + _
                      "INNER JOIN TMP_SCRATCH_PAJEK AS TMP_SCRATCH_PAJEK_1 ON (TMP_SCRATCH_PAJEK_1.c_v_num = " + _
                      "ZZ_SCRATCH_PAJEK_EDGE.c_node_2) AND (ZZ_SOCIAL_NETWORK.c_node_id = TMP_SCRATCH_PAJEK_1.c_ID)
    " + _
                    "SET ZZ_SCRATCH_PAJEK_EDGE.c_edge_desc = [ZZ_SOCIAL_NETWORK].[type_id]+':'+[ZZ_SOCIAL_NETWORK
].[c_link_desc] " + _
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
            Set tRstNodeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK", dbOpenDynaset)
            Set tRstEdgeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK_EDGE", dbOpenDynaset)
            '
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
            ti = 1

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
                               If ChkIncludeID.Value Then
                                   tStream.WriteText ":" + Trim(Str(!c_ID))
                               End If
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
                 ' now make sure all the data is copied to tStream
                 tStream.Flush
                 ' and write the stream to the file
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
    Dim tLabelLanguage(3, 36) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 36 And Not .EOF
             If !c_form = "LAAP" Then
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
        ' Me.Lbl1Node.Caption = tLabelLanguage(tLang, 3)
        Me.Lbl2Node.Caption = tLabelLanguage(tLang, 4)
        ' Me.LblNodeNode.Caption = tLabelLanguage(tLang, 5)
        Me.LblKin.Caption = tLabelLanguage(tLang, 6)
        Me.CmdPickPerson1.Caption = tLabelLanguage(tLang, 7)
        Me.CmdPickPerson2.Caption = tLabelLanguage(tLang, 8)
        Me.CmdQuery.Caption = tLabelLanguage(tLang, 9)
        Me.CmdGIS.Caption = tLabelLanguage(tLang, 10)
        Me.CmdPajek.Caption = tLabelLanguage(tLang, 11)
        Me.CmdFanti.Caption = tLabelLanguage(tLang, 12)
        Me.CmdJianti.Caption = tLabelLanguage(tLang, 13)
        Me.PageAssoc.Caption = tLabelLanguage(tLang, 14)
        Me.PagePeople.Caption = tLabelLanguage(tLang, 15)
        Me.LblIncludeID.Caption = tLabelLanguage(tLang, 16)
        'Me.LblIndexYears.Caption = tLabelLanguage(tLang, 17)
        Me.LblDisplayLanguage.Caption = tLabelLanguage(tLang, 18)
        Me.CmdImportList.Caption = tLabelLanguage(tLang, 19)
        Me.CmdClearList.Caption = tLabelLanguage(tLang, 20)
        Me.CmdStoreID.Caption = tLabelLanguage(tLang, 21)
        Me.CmdRecallID.Caption = tLabelLanguage(tLang, 22)
        Me.LblChkDegree.Caption = tLabelLanguage(tLang, 23)
        Me.CmdUCINet.Caption = tLabelLanguage(tLang, 24)
        Me.CmdHelp.Caption = tLabelLanguage(tLang, 25)
        Me.CmdGephi.Caption = tLabelLanguage(tLang, 26)
        Me.LblDynasties.Caption = tLabelLanguage(tLang, 27)
        Me.CmdFromDynasty.Caption = tLabelLanguage(tLang, 28)
        Me.CmdToDynasty.Caption = tLabelLanguage(tLang, 29)
        Me.CmdAllDynasties.Caption = tLabelLanguage(tLang, 30)
        Me.LblIndexYears.Caption = tLabelLanguage(tLang, 31)
        Me.LblOptNoDates.Caption = tLabelLanguage(tLang, 32)
        Me.LblOptIndexYears.Caption = tLabelLanguage(tLang, 33)
        Me.LblOptDynasties.Caption = tLabelLanguage(tLang, 34)
        Me.CmdNeo4j.Caption = tLabelLanguage(tLang, 35)
    End If

End Sub

Private Sub process_records(tType As String)

    Dim tTestStr As String, tContinue As Integer

    With gRst

          'MsgBox "processing edges"

          .MoveFirst
          Do While Not .EOF
              '
              ' see if we have the record
              '
              tContinue = 1
              '
              If gRstEdge.RecordCount > 0 Then

                  tTestStr = "c_person_id = " + Trim(Str(!c_personid))
                  tTestStr = tTestStr + " AND c_node_id = " + Trim(Str(!c_node_id))
                  tTestStr = tTestStr + " AND c_link_code = " + Trim(Str(!c_link_code))
                  If tType = "N" Then
                      If Not IsNull(!c_kin_code) Then
                          If !c_kin_code > 0 Then
                              tTestStr = tTestStr + " AND c_kin_code = " + Trim(Str(!c_kin_code))
                              tTestStr = tTestStr + " AND c_kin_id = " + Trim(Str(!c_kin_id))
                          End If
                      End If
                      If Not IsNull(!c_assoc_kin_code) Then
                          If !c_assoc_kin_code > 0 Then
                              tTestStr = tTestStr + " AND c_assoc_kin_code = " + Trim(Str(!c_assoc_kin_code))
                              tTestStr = tTestStr + " AND c_assoc_kin_id = " + Trim(Str(!c_assoc_kin_id))
                          End If
                      End If
                  End If
                  'MsgBox "about to look for string1: " + tTestStr

                  gRstEdge.FindFirst tTestStr
                  If Not gRstEdge.NoMatch Then
                      tContinue = 0
                  End If

                  tTestStr = "c_person_id = " + Trim(Str(!c_node_id))
                  tTestStr = tTestStr + " AND c_node_id = " + Trim(Str(!c_personid))
                  tTestStr = tTestStr + " AND c_link_code = " + Trim(Str(!c_link_pair))
                  If tType = "N" Then
                      If Not IsNull(!c_assoc_kin_code) Then
                          If !c_assoc_kin_code > 0 Then
                              tTestStr = tTestStr + " AND c_kin_code = " + Trim(Str(!c_assoc_kin_code))
                              tTestStr = tTestStr + " AND c_kin_id = " + Trim(Str(!c_assoc_kin_id))
                          End If
                      End If
                      If Not IsNull(!c_kin_code) Then
                          If !c_kin_code > 0 Then
                              tTestStr = tTestStr + " AND c_assoc_kin_code = " + Trim(Str(!c_kin_code))
                            tTestStr = tTestStr + " AND c_assoc_kin_id = " + Trim(Str(!c_kin_id))
                        End If
                    End If
                End If
                'MsgBox "about to look for string2: " + tTestStr

                gRstEdge.FindFirst tTestStr
                If Not gRstEdge.NoMatch Then
                    tContinue = 0
                End If
                'MsgBox "Strings OK"
            End If

            If tContinue = 1 Then
                '
                ' add the record and fill in basic info
                '
                'MsgBox "Adding edge 1"
                gRstEdge.AddNew
                gRstEdge!c_person_id = !c_personid
                gRstEdge!c_name = !c_person_name
                gRstEdge!c_name_chn = !c_person_name_chn
                gRstEdge!c_index_year = !c_index_year
                gRstEdge!c_female = !c_female
                gRstEdge!c_link_type = tType
                If !c_personid = TxtID1.Value Or !c_personid = TxtID2.Value Then
                     gRstEdge!c_edge_dist = 0
                Else
                     gRstEdge!c_edge_dist = 1
                End If
                '
                'MsgBox "Adding edge 2"
                gRstEdge!c_link_code = !c_link_code
                gRstEdge!c_link_desc = !c_link_desc
                gRstEdge!c_link_chn = !c_link_chn
                '
                ' now check for kinship data
                '
                'MsgBox "Adding edge 3"
                gRstEdge!c_kin_desc = ""
                gRstEdge!c_kin_desc_chn = ""
                gRstEdge!c_kin_name = ""
                gRstEdge!c_kin_chn = ""
                gRstEdge!c_assoc_kin_desc = ""
                gRstEdge!c_assoc_kin_desc_chn = ""
                gRstEdge!c_assoc_kin_name = ""
                gRstEdge!c_assoc_kin_chn = ""

                If tType = "N" Then
                    'MsgBox "Adding edge 4"
                    If IsNull(!c_kin_id) Then
                         gRstEdge!c_kin_id = 0
                    Else
                         gRstEdge!c_kin_id = !c_kin_id
                    End If

                    If IsNull(!c_kin_code) Then
                         gRstEdge!c_kin_code = 0
                    Else
                         gRstEdge!c_kin_code = !c_kin_code
                         If !c_kin_code > 0 Then
                             gRstEdge!c_kin_desc = !c_kinrel
                             gRstEdge!c_kin_desc_chn = !c_kinrel
                             If !c_kin_id > 0 Then
                                 gRstEdge!c_kin_name = !c_kin_name
                                 gRstEdge!c_kin_chn = !c_kin_chn
                             End If
                         End If
                    End If


                    'MsgBox "Adding edge 5"
                    If IsNull(!c_assoc_kin_code) Then
                         gRstEdge!c_assoc_kin_code = 0
                    Else
                         If !c_assoc_kin_code > 0 Then
                             gRstEdge!c_assoc_kin_id = !c_assoc_kin_id
                             gRstEdge!c_assoc_kin_code = !c_assoc_kin_code
                             gRstEdge!c_assoc_kin_desc = !c_assoc_kinrel
                             gRstEdge!c_assoc_kin_desc_chn = !c_assoc_kinrel
                             If !c_assoc_kin_id > 0 Then
                                 gRstEdge!c_assoc_kin_name = !c_assoc_kin_name
                                 gRstEdge!c_assoc_kin_chn = !c_assoc_kin_chn
                             End If
                         End If
                     End If
                End If
                '
                ' now the address data
                '
                'MsgBox "Adding edge 6"
                If IsNull(!c_addr_id) Then
                     gRstEdge!c_addr_id = 0
                     gRstEdge!c_addr_name = "[Unknown]"
                     gRstEdge!c_addr_chn = "[Unknown]"
                     gRstEdge!c_addr_type = 0
                     gRstEdge!c_addr_desc = "[Unknown]"
                     gRstEdge!c_addr_desc_chn = "[Unknown]"
                     gRstEdge!x_coord = 0#
                     gRstEdge!y_coord = 0#
                Else
                     gRstEdge!c_addr_id = !c_addr_id
                     gRstEdge!c_addr_name = !c_addr_name
                     gRstEdge!c_addr_chn = !c_addr_chn
                     gRstEdge!c_addr_type = !c_addr_type
                     gRstEdge!c_addr_desc = !c_addr_desc
                     gRstEdge!c_addr_desc_chn = !c_addr_desc_chn
                     gRstEdge!x_coord = !x_coord
                     gRstEdge!y_coord = !y_coord
                End If
                '
                ' now repeat the process for the associated person
                '
                ' fill in basic info for the associate
                '
                'MsgBox "Adding edge 7"
                gRstEdge!c_node_id = !c_node_id
                '
                gRstEdge!c_node_name = !c_node_name
                gRstEdge!c_node_chn = !c_node_chn
                gRstEdge!c_node_index_year = !c_node_index_year
                gRstEdge!c_node_female = !c_node_female
                '
                ' now the address data
                '
                'MsgBox "Adding edge 8"
                If IsNull(!c_node_addr_id) Then
                     gRstEdge!c_node_addr_id = 0
                     gRstEdge!c_node_addr_name = "[Unknown]"
                     gRstEdge!c_node_addr_chn = "[Unknown]"
                     gRstEdge!c_node_addr_type = 0
                     gRstEdge!c_node_addr_desc = "[Unknown]"
                     gRstEdge!c_node_addr_desc_chn = "[Unknown]"
                     gRstEdge!node_xcoord = 0#
                     gRstEdge!node_ycoord = 0#
                Else
                     gRstEdge!c_node_addr_id = !c_node_addr_id
                     gRstEdge!c_node_addr_name = !c_node_addr_name
                     gRstEdge!c_node_addr_chn = !c_node_addr_chn
                     gRstEdge!c_node_addr_type = !c_node_addr_type
                     gRstEdge!c_node_addr_desc = !c_node_addr_desc
                     gRstEdge!c_node_addr_desc_chn = !c_node_addr_desc_chn
                     gRstEdge!node_xcoord = !node_xcoord
                     gRstEdge!node_ycoord = !node_ycoord
                End If
                '
                ' finally, get the supplemental data if there is any
                '
                'MsgBox "About to add extra data 9"
                If tType = "N" Then
                     If Not IsNull(!c_litgenre_code) Then
                         gRstEdge!c_litgenre_desc = !c_lit_genre_desc
                         gRstEdge!c_litgenre_desc_chn = !c_lit_genre_desc_chn
                     End If
                     '
                     If Not IsNull(!c_occasion_code) Then
                         gRstEdge!c_occasion_desc = !c_occasion_desc
                         gRstEdge!c_occasion_desc_chn = !c_occasion_desc_chn
                     End If
                     '
                       If Not IsNull(!c_topic_code) Then
                           gRstEdge!c_topic_desc = !c_topic_desc
                           gRstEdge!c_topic_desc_chn = !c_topic_desc_chn
                       End If
                       '
                       If Not IsNull(!c_inst_code) Then
                           gRstEdge!c_inst_name_py = !c_inst_name_py
                           gRstEdge!c_inst_name_hz = !c_inst_name_hz
                       End If
                       '
                       If Not IsNull(!c_text_title) Then
                           gRstEdge!c_text_title = !c_text_title
                       End If
                       '
                       If Not IsNull(!c_assoc_claimer_id) Then
                           gRstEdge!c_assoc_claimer_name = !c_assoc_claimer_name
                           gRstEdge!c_assoc_claimer_name_chn = !c_assoc_claimer_chn
                       End If
                   End If
                   '
                   gRstEdge.Update
               End If
               .MoveNext
        Loop
    End With

End Sub

Private Sub process_people()
    Dim tRstNonkinBiogAddr As DAO.Recordset

    With gRstEdge
        .MoveFirst
        Do While Not .EOF
            ' do we have c_personid?
            gRstPeople.FindFirst "c_person_id = " + Trim(Str(!c_person_id))
            If gRstPeople.NoMatch Then
                gRstPeople.AddNew
                gRstPeople!c_person_id = !c_person_id
                gRstPeople!c_name = !c_name
                gRstPeople!c_name_chn = !c_name_chn
                gRstPeople!c_index_year = !c_index_year
                gRstPeople!c_female = !c_female
                gRstPeople!c_addr_id = !c_addr_id
                gRstPeople!c_addr_name = !c_addr_name
                gRstPeople!c_addr_chn = !c_addr_chn
                gRstPeople!c_addr_type = !c_addr_type
                gRstPeople!c_addr_desc = !c_addr_desc
                gRstPeople!c_addr_desc_chn = !c_addr_desc_chn
                gRstPeople!x_coord = !x_coord
                gRstPeople!y_coord = !y_coord
                If !c_person_id = TxtID1.Value Or !c_person_id = TxtID2.Value Then
                     gRstPeople!c_node_dist = 0
                Else
                     gRstPeople!c_node_dist = 1
                End If
                gRstPeople.Update
            End If
            '
            ' now look at the associate
            gRstPeople.FindFirst "c_person_id = " + Trim(Str(!c_node_id))
            If gRstPeople.NoMatch Then
                gRstPeople.AddNew
                gRstPeople!c_person_id = !c_node_id
                gRstPeople!c_name = !c_node_name
                gRstPeople!c_name_chn = !c_node_chn
                gRstPeople!c_index_year = !c_node_index_year
                gRstPeople!c_female = !c_node_female
                gRstPeople!c_addr_id = !c_node_addr_id
                gRstPeople!c_addr_name = !c_node_addr_name
                gRstPeople!c_addr_chn = !c_node_addr_chn
                gRstPeople!c_addr_type = !c_node_addr_type
                gRstPeople!c_addr_desc = !c_node_addr_desc
                gRstPeople!c_addr_desc_chn = !c_node_addr_desc_chn
                gRstPeople!x_coord = !node_xcoord
                gRstPeople!y_coord = !node_ycoord
                If !c_node_id = TxtID1.Value Or !c_node_id = TxtID2.Value Then
                     gRstPeople!c_node_dist = 0
                Else
                     gRstPeople!c_node_dist = 1
                End If
                gRstPeople.Update
            End If

             .MoveNext
        Loop
    End With
    '
    ' it turns out that the base person can be left out, so double-check, and if needed, add.
    '
    Set tRstNonkinBiogAddr = CurrentDb.OpenRecordset("ZZZ_NONKIN_BIOG_ADDR", dbOpenTable)
    tRstNonkinBiogAddr.Index = "person_id"

    gRstPeople.FindFirst "c_person_id = " + Trim(Str(TxtID1.Value))
    If gRstPeople.NoMatch Then
        '
        ' get the data from the base table
        '
        tRstNonkinBiogAddr.Seek "=", TxtID1.Value
        If Not tRstNonkinBiogAddr.NoMatch Then
            gRstPeople.AddNew
            gRstPeople!c_person_id = tRstNonkinBiogAddr!c_personid
            gRstPeople!c_name = tRstNonkinBiogAddr!c_person_name
            gRstPeople!c_name_chn = tRstNonkinBiogAddr!c_person_name_chn
            gRstPeople!c_index_year = tRstNonkinBiogAddr!c_index_year
            gRstPeople!c_female = tRstNonkinBiogAddr!c_female
            gRstPeople!c_addr_id = tRstNonkinBiogAddr!c_addr_id
            gRstPeople!c_addr_name = tRstNonkinBiogAddr!c_addr_name
            gRstPeople!c_addr_chn = tRstNonkinBiogAddr!c_addr_chn
            gRstPeople!c_addr_type = tRstNonkinBiogAddr!c_addr_type
            gRstPeople!c_addr_desc = tRstNonkinBiogAddr!c_addr_desc
            gRstPeople!c_addr_desc_chn = tRstNonkinBiogAddr!c_addr_desc_chn
            gRstPeople!x_coord = tRstNonkinBiogAddr!x_coord
            gRstPeople!y_coord = tRstNonkinBiogAddr!y_coord
            gRstPeople!c_node_dist = 0
            gRstPeople.Update
        End If
    End If

    gRstPeople.FindFirst "c_person_id = " + Trim(Str(TxtID2.Value))
    If gRstPeople.NoMatch Then
        '
        ' get the data from the base table
        '
        tRstNonkinBiogAddr.Seek "=", TxtID2.Value
        If Not tRstNonkinBiogAddr.NoMatch Then
            gRstPeople.AddNew
            gRstPeople!c_person_id = tRstNonkinBiogAddr!c_personid
            gRstPeople!c_name = tRstNonkinBiogAddr!c_person_name
            gRstPeople!c_name_chn = tRstNonkinBiogAddr!c_person_name_chn
            gRstPeople!c_index_year = tRstNonkinBiogAddr!c_index_year
            gRstPeople!c_female = tRstNonkinBiogAddr!c_female
            gRstPeople!c_addr_id = tRstNonkinBiogAddr!c_addr_id
            gRstPeople!c_addr_name = tRstNonkinBiogAddr!c_addr_name
            gRstPeople!c_addr_chn = tRstNonkinBiogAddr!c_addr_chn
            gRstPeople!c_addr_type = tRstNonkinBiogAddr!c_addr_type
            gRstPeople!c_addr_desc = tRstNonkinBiogAddr!c_addr_desc
            gRstPeople!c_addr_desc_chn = tRstNonkinBiogAddr!c_addr_desc_chn
            gRstPeople!x_coord = tRstNonkinBiogAddr!x_coord
            gRstPeople!y_coord = tRstNonkinBiogAddr!y_coord
            gRstPeople!c_node_dist = 0
            gRstPeople.Update
        End If
    End If

    tRstNonkinBiogAddr.Close
    Set tRstNonkinBiogAddr = Nothing

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
    '      from = str(c_person_id)
    '      to = str(c_node_id)
    '      edgetype= c_link_type (K,N)
    '
    ' *tie properties
    ' from to color size active
    '      from = str(c_person_id)
    '      to = str(c_node_id)
    '      color = red (255), orange (26367), yellow (65535), green (32768), blue (16711680)
    '      size = 1-5 (the weight)
    '
    ' the central question is whether to do distance optimizations
    '
    ' first see if there are any records to process
    '
    If ZZ_SOCIAL_NETWORK.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdUCINet_Click
    End If
    '
    If ZZ_SCRATCH_PEOPLE.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdUCINet_Click
    End If
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

    ' open the assoc type look-up table
    Set tRstAssocType = CurrentDb.OpenRecordset("ASSOC_CODE_TYPE_REL", dbOpenDynaset)

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
            Set tFileSystem = CreateObject("Scripting.FileSystemObject")
            Set tVNA = tFileSystem.CreateTextFile(tFileName, True)

            ' define the colors for the nodes
            '
            tColor(1) = "0 "             ' black
            tColor(2) = "16711680 " ' blue
            tColor(3) = "32768 "         ' green
            tColor(4) = "65535 "         ' yellow
            tColor(5) = "26367 "         ' orange
            For ti = 6 To 20
                 tColor(ti) = "255 " ' red
            Next
            '
            ' process the two tables
            '
            Set tRstEdge = CurrentDb.OpenRecordset("ZZ_SOCIAL_NETWORK", dbOpenDynaset)
            Set tRstNode = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
            tQuote = Chr(34) ' the quotation mark
            '
            ' first the nodes: define the node data structure
            tVNA.WriteLine ("*node data")
            tVNA.WriteLine ("ID index_year sex x_coord y_coord nodedist")
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
                      '    sex = c_female > (F,M)
                      If !c_female = -1 Then
                           tStr = tStr + tQuote + "F" + tQuote + " "
                      Else
                           tStr = tStr + tQuote + "M" + tQuote + " "
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
                      '    node distance
                      tStr = tStr + Trim(Str(!c_node_dist))
                      '
                      tVNA.WriteLine (tStr)
                      .MoveNext
                 Loop
            End With
            '
            ' now the node properties
            '
            ' Note: ACTIVE removed as a property (MAF 2018/07/22)
            '
            tVNA.WriteLine ("*node properties")
            tVNA.WriteLine ("ID color shape size shortlabel")
            '
            With tRstNode
                 .MoveFirst
                 Do While Not .EOF
                      ' ID = the ID of the person
                      tStr = Trim(Str(!c_person_id)) + " "
                      '
                      ' color = black (1), blue (2), green (3), yellow (4), orange (5)
                      tStr = tStr + tColor(!c_node_dist + 1)
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
                    tVNA.WriteLine (tStr)
                    .MoveNext
                Loop
            End With
            '
            ' now the edges: define the record structure
            '
            tStr = "from to " + tQuote + "EdgeWeight" + tQuote + " " + tQuote + "edgetype"
            tStr = tStr + tQuote + " " + tQuote + "edgelist" + tQuote
            tVNA.WriteLine ("*tie data")
            tVNA.WriteLine (tStr)
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
                     '    to = str(c_node_id) for node2
                     tStr = tStr + Trim(Str(!c_node_id)) + " 1 "
                     '
                     '    edgetype
                     If !c_link_type = "K" Then
                          If IsNull(!c_link_desc) Then
                               tStr = tStr + "K "
                          Else
                               tStr = tStr + tQuote + "K_" + !c_link_desc + tQuote + " "
                          End If
                     Else
                          tSearchStr = "c_assoc_code = " + Trim(Str(!c_link_code))
                          tRstAssocType.FindFirst tSearchStr
                          If tRstAssocType.NoMatch Then
                               tStr = tStr + "N_00 "
                          Else
                               tStr = tStr + "N_" + Trim(tRstAssocType!c_assoc_type_code) + " "
                          End If
                     End If
                     '
                     '    edgedist
                     tStr = tStr + Trim(Str(!c_edge_dist))
                     '
                     tVNA.WriteLine (tStr)
                     .MoveNext
                Loop
            End With
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
                 tVNA.Close
                 '
                 Set tRstNode = Nothing
                 Set tRstEdge = Nothing
                 Set tVNA = Nothing
                 Set tFileSystem = Nothing
                 Set tRstAssocType = Nothing
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

Private Sub GetEdges()
    Dim tQueryStr As String, tQueryFromStr As String
    Dim tQueryWhereStr As String, tQueryAppendStr As String
    Dim cmdSQL As ADODB.Command, tRecDeleted As Long

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    ' define the query for appending to ZZ_SCRATCH_PEOPLE without duplication
    '
    tQueryAppendStr = "INSERT INTO ZZ_SCRATCH_PEOPLE SELECT ZZ_SCRATCH_IMPORT_PEOPLE.* " + _
        "FROM ZZ_SCRATCH_IMPORT_PEOPLE LEFT JOIN ZZ_SCRATCH_PEOPLE ON " + _
        "ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZZ_SCRATCH_PEOPLE.c_person_id " + _
        "WHERE (((ZZ_SCRATCH_PEOPLE.c_person_id) Is Null))"
        '
    ' get the first-order linking people
    '
    tQueryStr = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, c_female, " + _
        "c_addr_id, c_addr_name, c_addr_chn, c_addr_type, c_addr_desc, c_addr_desc_chn, x_coord, y_coord, " + _
        "c_node_dist ) " + _
        "SELECT DISTINCT ZZZ_NONKIN_BIOG_ADDR.c_node_id, ZZZ_NONKIN_BIOG_ADDR.c_node_name, " + _
        "ZZZ_NONKIN_BIOG_ADDR.c_node_chn, ZZZ_NONKIN_BIOG_ADDR.c_node_index_year, " + _
        "ZZZ_NONKIN_BIOG_ADDR.c_node_female, ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id, " + _
        "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_name, ZZZ_NONKIN_BIOG_ADDR.c_node_addr_chn, " + _
        "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_type, ZZZ_NONKIN_BIOG_ADDR.c_node_addr_desc, " + _
        "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_desc_chn, ZZZ_NONKIN_BIOG_ADDR.node_xcoord, " + _
        "ZZZ_NONKIN_BIOG_ADDR.node_ycoord, 1 AS c_node_dist " + _
        "FROM ZZZ_NONKIN_BIOG_ADDR INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZZZ_NONKIN_BIOG_ADDR_1 ON " + _
        "ZZZ_NONKIN_BIOG_ADDR.c_node_id = ZZZ_NONKIN_BIOG_ADDR_1.c_node_id " + _
        "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_personid)=" + tID1Str + ") AND " + _
        "((ZZZ_NONKIN_BIOG_ADDR_1.c_personid)=" + TxtID2.Text + "))"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    ' if kinship ties are to be included, get first-order kinship connections
    ' The situation is a bit more complicated than it might appear, since a kin of X may be an associate of Y
    ' or an associate of X may be a kin of Y or a kin of X may be a kin of Y:
    '      x a=kin(x)   y=kin(a)    00
    '      x a=kin(x)   y=assoc(a) 01
    '      x a=assoc(x) y=kin(a)    10
    '
    If ChkKinship.Value Then
        '
        ' two strings remain fixed
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, " + _
            "c_female, c_addr_id, c_addr_name, c_addr_chn, c_addr_type, c_addr_desc, c_addr_desc_chn, " + _
            "x_coord, y_coord, c_node_dist ) " + _
            "SELECT DISTINCT ZABA_1.c_node_id, ZABA_1.c_node_name, " + _
            "ZABA_1.c_node_chn, ZABA_1.c_node_index_year, " + _
            "ZABA_1.c_node_female, ZABA_1.c_node_addr_id, " + _
            "ZABA_1.c_node_addr_name, ZABA_1.c_node_addr_chn, " + _
            "ZABA_1.c_node_addr_type, ZABA_1.c_node_addr_desc, " + _
            "ZABA_1.c_node_addr_desc_chn, ZABA_1.node_xcoord, " + _
            "ZABA_1.node_ycoord, 1 AS c_node_dist "
        tQueryWhereStr = "WHERE (((ZABA_1.c_personid)=" + TxtID2.Text + ") AND " + _
            "((ZABA.c_personid)=" + tID1Str + "))"

        '   one changes

        ' kin-kin
        tQueryFromStr = "FROM ZZZ_KIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
            "AS ZABA_1 ON ZABA.c_node_id = ZABA_1.c_node_id "

        cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_IMPORT_PEOPLE"
        cmdSQL.Execute tRecDeleted
        '
        cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
        cmdSQL.Execute tRecDeleted
        '
        ' copy to ZZ_SCRATCH_PEOPLE
        '
        cmdSQL.CommandText = tQueryAppendStr
        cmdSQL.Execute tRecDeleted
        '
        ' kin-assoc
        tQueryFromStr = "FROM ZZZ_KIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
            "AS ZABA_1 ON ZABA.c_node_id = ZABA_1.c_node_id "

        cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_IMPORT_PEOPLE"
        cmdSQL.Execute tRecDeleted
        '
        cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
        cmdSQL.Execute tRecDeleted
        '
        ' copy to ZZ_SCRATCH_PEOPLE
        '
        cmdSQL.CommandText = tQueryAppendStr
        cmdSQL.Execute tRecDeleted

        ' assoc-kin
        tQueryFromStr = "FROM ZZZ_NONKIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
            "AS ZABA_1 ON ZABA.c_node_id = ZABA_1.c_node_id "

        cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_IMPORT_PEOPLE"
        cmdSQL.Execute tRecDeleted
        '
        cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
        cmdSQL.Execute tRecDeleted
        '
        ' copy to ZZ_SCRATCH_PEOPLE
        '
        cmdSQL.CommandText = tQueryAppendStr
        cmdSQL.Execute tRecDeleted
    End If
    '
    ' now get the second order linking people (first the first person in the pair, then the second)
    ' Add these to the temp file and copy only the non-duplicates
    '
    If Me.Chk2Nodes.Value Then
        cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_IMPORT_PEOPLE"
        cmdSQL.Execute tRecDeleted
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_IMPORT_PEOPLE ( c_person_id, c_name, c_name_chn, " + _
            "c_index_year, c_female, c_addr_id, c_addr_name, c_addr_chn, c_addr_type, c_addr_desc, " + _
            "c_addr_desc_chn, x_coord, y_coord, c_node_dist ) " + _
            "SELECT DISTINCT ZZZ_NONKIN_BIOG_ADDR.c_node_id, ZZZ_NONKIN_BIOG_ADDR.c_node_name, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_chn, ZZZ_NONKIN_BIOG_ADDR.c_node_index_year, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_female, ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_name, ZZZ_NONKIN_BIOG_ADDR.c_node_addr_chn, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_type, ZZZ_NONKIN_BIOG_ADDR.c_node_addr_desc, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_desc_chn, ZZZ_NONKIN_BIOG_ADDR.node_xcoord, " + _
            "ZZZ_NONKIN_BIOG_ADDR.node_ycoord, 2 AS c_node_dist " + _
            "FROM (ZZZ_NONKIN_BIOG_ADDR INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZZZ_NONKIN_BIOG_ADDR_1 " + _
            "ON ZZZ_NONKIN_BIOG_ADDR.c_node_id = ZZZ_NONKIN_BIOG_ADDR_1.c_node_id) " + _
            "INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZZZ_NONKIN_BIOG_ADDR_2 ON " + _
            "ZZZ_NONKIN_BIOG_ADDR_1.c_personid = ZZZ_NONKIN_BIOG_ADDR_2.c_node_id " + _
            "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_personid)=" + tID1Str + ") AND " + _
            "((ZZZ_NONKIN_BIOG_ADDR_2.c_personid)=" + TxtID2.Text + "))"
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' copy to ZZ_SCRATCH_PEOPLE
        '
        cmdSQL.CommandText = tQueryAppendStr
        cmdSQL.Execute tRecDeleted
        '
        ' now get the second person in the pair
        '
        cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_IMPORT_PEOPLE"
        cmdSQL.Execute tRecDeleted
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, " + _
            "c_female, c_addr_id, c_addr_name, c_addr_chn, c_addr_type, c_addr_desc, c_addr_desc_chn, " + _
            "x_coord, y_coord, c_node_dist ) " + _
            "SELECT DISTINCT ZZZ_NONKIN_BIOG_ADDR_1.c_personid, ZZZ_NONKIN_BIOG_ADDR_1.c_person_name, " + _
            "ZZZ_NONKIN_BIOG_ADDR_1.c_person_name_chn, ZZZ_NONKIN_BIOG_ADDR_1.c_index_year, " + _
            "ZZZ_NONKIN_BIOG_ADDR_1.c_female, ZZZ_NONKIN_BIOG_ADDR_1.c_addr_id, " + _
            "ZZZ_NONKIN_BIOG_ADDR_1.c_addr_name, ZZZ_NONKIN_BIOG_ADDR_1.c_addr_chn, " + _
            "ZZZ_NONKIN_BIOG_ADDR_1.c_addr_type, ZZZ_NONKIN_BIOG_ADDR_1.c_addr_desc, " + _
            "ZZZ_NONKIN_BIOG_ADDR_1.c_addr_desc_chn, ZZZ_NONKIN_BIOG_ADDR_1.x_coord, " + _
            "ZZZ_NONKIN_BIOG_ADDR_1.y_coord, 2 AS c_node_dist " + _
            "FROM (ZZZ_NONKIN_BIOG_ADDR INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZZZ_NONKIN_BIOG_ADDR_1 " + _
            "ON ZZZ_NONKIN_BIOG_ADDR.c_node_id = ZZZ_NONKIN_BIOG_ADDR_1.c_node_id) " + _
            "INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZZZ_NONKIN_BIOG_ADDR_2 ON " + _
            "ZZZ_NONKIN_BIOG_ADDR_1.c_personid = ZZZ_NONKIN_BIOG_ADDR_2.c_node_id " + _
            "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_personid)=" + tID1Str + ") AND " + _
            "((ZZZ_NONKIN_BIOG_ADDR_2.c_personid)=" + TxtID2.Text + "))"

        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' copy to ZZ_SCRATCH_PEOPLE
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_PEOPLE SELECT ZZ_SCRATCH_IMPORT_PEOPLE.* " + _
            "FROM ZZ_SCRATCH_IMPORT_PEOPLE LEFT JOIN ZZ_SCRATCH_PEOPLE ON " + _
            "ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZZ_SCRATCH_PEOPLE.c_person_id " + _
            "WHERE (((ZZ_SCRATCH_PEOPLE.c_person_id) Is Null))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' if kinship ties are to be included, get second-order kinship connections.
        ' here, there are seven(!) possibilities that must considered:
        '      x a=kin(x) b=kin(a) y=kin(b)       000
        '      x a=kin(x) b=kin(a) y=assoc(b)     001
        '      x a=kin(x) b=assoc(a) y=kin(b)     010
        '      x a=kin(x) b=assoc(a) y=assoc(b) 011
        '      x a=assoc(x) b=kin(a) y=kin(b)     100
        '      x a=assoc(x) b=kin(a) y=assoc(b) 101
        '      x a=assoc(x) b=assoc(a) y=kin(b) 110
        ' Therefore we need to run seven queries by swapping out the tables we use
        '
        If ChkKinship.Value Then
            '
            ' these two parts of the query stay the same
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_IMPORT_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, "
+ _
                "c_female, c_addr_id, c_addr_name, c_addr_chn, c_addr_type, c_addr_desc, c_addr_desc_chn, " + _
                "x_coord, y_coord, c_node_dist ) " + _
                "SELECT DISTINCT ZABA_1.c_personid, ZABA_1.c_person_name, " + _
                "ZABA_1.c_person_name_chn, ZABA_1.c_index_year, " + _
                "ZABA_1.c_female, ZABA_1.c_addr_id, " + _
                "ZABA_1.c_addr_name, ZABA_1.c_addr_chn, " + _
                "ZABA_1.c_addr_type, ZABA_1.c_addr_desc, " + _
                "ZABA_1.c_addr_desc_chn, ZABA_1.x_coord, " + _
                "ZABA_1.y_coord, 1 AS c_node_dist "
            tQueryWhereStr = "WHERE (((ZABA.c_personid)=" + tID1Str + ") AND " + _
                "((ZABA_2.c_personid)=" + TxtID2.Text + "))"

            '   what changes are the tables to be considered

            ' kin-kin-kin
            tQueryFromStr = "FROM (ZZZ_KIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
                "AS ZABA_1 ON ZABA.c_node_id = " + _
                "ZABA_1.c_node_id) INNER JOIN ZZZ_KIN_BIOG_ADDR AS ZABA_2 " + _
                "ON ZABA_1.c_personid = ZABA_2.c_node_id "
            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_IMPORT_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            ' kin-kin-assoc
            tQueryFromStr = "FROM (ZZZ_KIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
                "AS ZABA_1 ON ZABA.c_node_id = " + _
                "ZABA_1.c_node_id) INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZABA_2 " + _
                "ON ZABA_1.c_personid = ZABA_2.c_node_id "

            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_IMPORT_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            ' kin-assoc-kin
            tQueryFromStr = "FROM (ZZZ_KIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
                "AS ZABA_1 ON ZABA.c_node_id = " + _
                "ZABA_1.c_node_id) INNER JOIN ZZZ_KIN_BIOG_ADDR AS ZABA_2 " + _
                "ON ZABA_1.c_personid = ZABA_2.c_node_id "

            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_IMPORT_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            ' kin-assoc-assoc
            tQueryFromStr = "FROM (ZZZ_KIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
                "AS ZABA_1 ON ZABA.c_node_id = " + _
                "ZABA_1.c_node_id) INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZABA_2 " + _
                "ON ZABA_1.c_personid = ZABA_2.c_node_id "

            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_IMPORT_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            ' assoc-kin-kin
            tQueryFromStr = "FROM (ZZZ_NONKIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
                "AS ZABA_1 ON ZABA.c_node_id = " + _
                "ZABA_1.c_node_id) INNER JOIN ZZZ_KIN_BIOG_ADDR AS ZABA_2 " + _
                "ON ZABA_1.c_personid = ZABA_2.c_node_id "

            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_IMPORT_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            ' assoc-kin-assoc
             tQueryFromStr = "FROM (ZZZ_NONKIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
                 "AS ZABA_1 ON ZABA.c_node_id = " + _
                 "ZABA_1.c_node_id) INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZABA_2 " + _
                 "ON ZABA_1.c_personid = ZABA_2.c_node_id "

             cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_IMPORT_PEOPLE"
             cmdSQL.Execute tRecDeleted
             '
             cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
             cmdSQL.Execute tRecDeleted
             '
             ' copy to ZZ_SCRATCH_PEOPLE
             '
             cmdSQL.CommandText = tQueryAppendStr
             cmdSQL.Execute tRecDeleted
             '
         End If

    End If

End Sub
Private Sub CmdImportList_Click()
On Error GoTo Err_CmdImport_Click
    Dim stDocName As String, stLinkCriteria As String
    Dim tRstPeople As DAO.Recordset, tRstImportPeople As DAO.Recordset
    Dim tString As String, tAddrID As Long, ti As Integer, tStrID As String, tLen As Integer

    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tFileSystem, tList

    '
    '   open the list

    Set dlgSaveAs = Application.FileDialog(msoFileDialogOpen)

    'Use a With...End With block to reference the FileDialog object.

    tFileName = ""

    With dlgSaveAs
        .InitialFileName = ""
        If .Show = -1 Then
             '
             For Each tFN In .SelectedItems
                  tFileName = tFN
                  If Not tFileName = "" Then
                      Exit For
                  End If
             Next
             If tFileName = "" Then
                  MsgBox "Bad file Name."
                  GoTo Exit_CmdImport_Click
             End If
        End If
    End With
    '
    ' Clear the people table now that we are ready to go
    '
    If Not (tFileName = "") Then
        Set cmdSQL = New ADODB.Command
        cmdSQL.ActiveConnection = CurrentProject.Connection
        cmdSQL.CommandType = adCmdText
        '
        cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_IMPORT_PEOPLE"
        cmdSQL.Execute tRecDeleted
        '
        cmdSQL.CommandText = "Delete * from InputErrorList"
        cmdSQL.Execute tRecDeleted

         cmdSQL.CommandText = "Delete * from TempImportList"
         cmdSQL.Execute tRecDeleted

         DoCmd.TransferText acImportDelim, "ImportPeopleList_Space", "TempImportList", tFileName, 0
         '    TransferType=acImportDelim
         '    SpecificationName = "TempImportList" (apparently it is saved in the database itself)
         '    TableName = "TempImportList" (probably requires that I drop the table first, but I can test)
         '    HasFieldNames = False (0)
         '
           ' copy the bad IDs
           '
           tStrSQL = "INSERT INTO InputErrorList ( c_ID ) SELECT TempImportList.ImportID " + _
               "FROM BIOG_MAIN RIGHT JOIN TempImportList ON BIOG_MAIN.c_personid = TempImportList.ImportID " + _
               "WHERE (((BIOG_MAIN.c_personid) Is Null))"

           cmdSQL.CommandText = tStrSQL
           cmdSQL.Execute tRecDeleted

           If tRecDeleted > 0 Then
               MsgBox "Some ID were not successfully imported: please look at InputErrorList."
           End If
           '
           ' copy the good IDs
           '
           tStrSQL = "INSERT INTO ZZ_SCRATCH_IMPORT_PEOPLE ( c_person_id ) SELECT DISTINCT TempImportList.ImportID "
 + _
                  "FROM BIOG_MAIN INNER JOIN TempImportList ON BIOG_MAIN.c_personid = TempImportList.ImportID"

           cmdSQL.CommandText = tStrSQL
           cmdSQL.Execute tRecDeleted

           If tRecDeleted = 0 Then
               TxtPerson1.Value = "[Error]"
               TxtPerson1Chn.Value = "[Error]"
               TxtPerson2.Value = "[Error]"
               TxtPerson2Chn.Value = "[Error]"

                  CmdQuery.Enabled = False
           Else
                  TxtPerson1.Value = "[Imported List]"
                  TxtPerson1Chn.Value = "[Imported List]"
                  TxtPerson2.Value = "[Imported List]"
                  TxtPerson2Chn.Value = "[Imported List]"

               CmdQuery.Enabled = True
               CmdImportList.Enabled = False
               CmdClearList.Enabled = True
               CmdPickPerson1.Enabled = False
               CmdPickPerson2.Enabled = False
           End If

           Set cmdSQL = Nothing
           Set tFileSystem = Nothing
       End If

Exit_CmdImport_Click:
    Exit Sub

Err_CmdImport_Click:
    MsgBox Err.Description
    Resume Exit_CmdImport_Click

End Sub
Sub CmdClearList_Click()
    TxtPerson1.Value = ""
    TxtPerson1Chn.Value = ""
    TxtPerson2.Value = ""
    TxtPerson2Chn.Value = ""

    CmdClearList.Enabled = False
    CmdImportList.Enabled = True
    CmdPickPerson1.Enabled = True
    CmdPickPerson2.Enabled = True
    CmdQuery.Enabled = False
End Sub

Sub CmdQueryOld()
    Dim tRstDummy As DAO.Recordset, tContinue As Integer, tQueryStr As String, tQueryFromStr As String
    Dim tQueryWhereStr As String, tQueryAppendStr As String, tQueryIntoStr As String
    Dim tQuerySelectStr As String, tQuery1stStr As String, tQuery2ndStr As String
    Dim tQuery1stWhereStr As String, tQuery2ndWhereStr As String
    Dim tID1Str As String, tID2Str As String, tFromStr As String, tToStr As String
    Dim cmdSQL As ADODB.Command, tRecDeleted As Long, tCurADDRBookmark As Variant

       Set cmdSQL = New ADODB.Command
       cmdSQL.ActiveConnection = CurrentProject.Connection
       cmdSQL.CommandType = adCmdText
       '
       ' to clear the table, close and then delete records
      '
      Set ZZ_SOCIAL_NETWORK.Form.Recordset = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SN", dbOpenDynaset)
      '
      cmdSQL.CommandText = "Delete * from ZZ_SOCIAL_NETWORK"
      cmdSQL.Execute tRecDeleted
      '
      ' now the people table
      '
      Set ZZ_SCRATCH_PEOPLE.Form.Recordset = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SP", dbOpenDynaset)
      '
      cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
      cmdSQL.Execute tRecDeleted
      '
      ' get the index year constraints
      '
      If ChkIndexYears.Value Then
          TxtFromYear.SetFocus
          tFromStr = Trim(Str(TxtFromYear.Value))
          TxtToYear.SetFocus
          tToStr = Trim(Str(TxtToYear.Value))
      End If

      ' define the query for appending to ZZ_SCRATCH_PEOPLE without duplication
      '
      tQueryAppendStr = "INSERT INTO ZZ_SCRATCH_PEOPLE SELECT ZZ_SCRATCH_PAIR_PEOPLE.* " + _
           "FROM ZZ_SCRATCH_PAIR_PEOPLE LEFT JOIN ZZ_SCRATCH_PEOPLE ON " + _
           "ZZ_SCRATCH_PAIR_PEOPLE.c_person_id = ZZ_SCRATCH_PEOPLE.c_person_id " + _
           "WHERE (((ZZ_SCRATCH_PEOPLE.c_person_id) Is Null))"
      '
      ' first add the target people (if CmdClearList is enabled, ImportList was successful)
      '
      If CmdClearList.Enabled Then
           ' MsgBox "Using list"
           tQueryStr = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, " + _
               "c_female, c_addr_id, c_addr_type, c_addr_desc, c_addr_desc_chn, c_addr_name, c_addr_chn, " + _
               "x_coord, y_coord, c_node_dist ) " + _
               "SELECT ZZZ_BIOG_MAIN.c_personid, ZZZ_BIOG_MAIN.c_name, " + _
               "ZZZ_BIOG_MAIN.c_name_chn, ZZZ_BIOG_MAIN.c_index_year, " + _
               "ZZZ_BIOG_MAIN.c_female, ZZZ_BIOG_MAIN.c_index_addr_id, ZZZ_BIOG_MAIN.c_index_addr_type_code, " + _
               "ZZZ_BIOG_MAIN.c_index_addr_type_desc, ZZZ_BIOG_MAIN.c_index_addr_type_chn, " + _
               "ZZZ_BIOG_MAIN.c_index_addr_name, ZZZ_BIOG_MAIN.c_index_addr_chn, ZZZ_BIOG_MAIN.x_coord, " + _
               "ZZZ_BIOG_MAIN.y_coord, 0 AS c_node_dist " + _
               "FROM ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ZZZ_BIOG_MAIN ON " + _
               "ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZZZ_BIOG_MAIN.c_personid"
      Else
           '
           ' get the ID strings for the two people
           '
           Me.TxtID1.Visible = True
           Me.TxtID1.SetFocus
           tID1Str = Trim(Str(TxtID1.Value))
           Me.TxtID2.Visible = True
           Me.TxtID2.SetFocus
           tID2Str = Trim(Str(TxtID2.Value))
           Me.CmdQuery.SetFocus
           Me.TxtID1.Visible = False
           Me.TxtID2.Visible = False

          ' MsgBox "Using people pairs"
          tQueryStr = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, " + _
              "c_female, c_addr_id, c_addr_type, c_addr_desc, c_addr_desc_chn, c_addr_name, c_addr_chn, x_coord, "
+ _
               "y_coord, c_node_dist ) " + _
               "SELECT ZZZ_BIOG_MAIN.c_personid, ZZZ_BIOG_MAIN.c_name, " + _
               "ZZZ_BIOG_MAIN.c_name_chn, ZZZ_BIOG_MAIN.c_index_year, ZZZ_BIOG_MAIN.c_female, " + _
               "ZZZ_BIOG_MAIN.c_index_addr_id, ZZZ_BIOG_MAIN.c_index_addr_type_code, ZZZ_BIOG_MAIN.c_index_addr_type
_desc, " + _
               "ZZZ_BIOG_MAIN.c_index_addr_type_chn, ZZZ_BIOG_MAIN.c_index_addr_name, ZZZ_BIOG_MAIN.c_index_addr_chn
, " + _
               "ZZZ_BIOG_MAIN.x_coord, ZZZ_BIOG_MAIN.y_coord, 0 AS c_node_dist " + _
               "FROM ZZZ_BIOG_MAIN " + _
               "WHERE (((ZZZ_BIOG_MAIN.c_personid)=" + tID1Str + _
               " Or (ZZZ_BIOG_MAIN.c_personid)=" + tID2Str + "))"
      End If
      '
      cmdSQL.CommandText = tQueryStr
      cmdSQL.Execute tRecDeleted
      '
      ' get the first-order linking people
      '
    tQueryStr = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, c_female, " + _
        "c_addr_id, c_addr_name, c_addr_chn, c_addr_type, c_addr_desc, c_addr_desc_chn, x_coord, y_coord, " + _
        "c_node_dist ) " + _
        "SELECT DISTINCT ZZZ_NONKIN_BIOG_ADDR.c_node_id, ZZZ_NONKIN_BIOG_ADDR.c_node_name, " + _
        "ZZZ_NONKIN_BIOG_ADDR.c_node_chn, ZZZ_NONKIN_BIOG_ADDR.c_node_index_year, " + _
        "ZZZ_NONKIN_BIOG_ADDR.c_node_female, ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id, " + _
        "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_name, ZZZ_NONKIN_BIOG_ADDR.c_node_addr_chn, " + _
        "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_type, ZZZ_NONKIN_BIOG_ADDR.c_node_addr_desc, " + _
        "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_desc_chn, ZZZ_NONKIN_BIOG_ADDR.node_xcoord, " + _
        "ZZZ_NONKIN_BIOG_ADDR.node_ycoord, 1 AS c_node_dist "

    If CmdClearList.Enabled Then
         If ChkIndexYears.Value Then
              tQueryWhereStr = "FROM ZZ_SCRATCH_IMPORT_PEOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 " + _
                  "INNER JOIN (ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN (ZZZ_NONKIN_BIOG_ADDR " + _
                  "INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZZZ_NONKIN_BIOG_ADDR_1 ON " + _
                  "ZZZ_NONKIN_BIOG_ADDR.c_node_id = ZZZ_NONKIN_BIOG_ADDR_1.c_node_id) ON " + _
                  "ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) ON " + _
                  "ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZZZ_NONKIN_BIOG_ADDR_1.c_personid " + _
                  "WHERE (((ZZZ_NONKIN_BIOG_ADDR_1.c_node_index_year) >=" + tFromStr + _
                  " And (ZZZ_NONKIN_BIOG_ADDR_1.c_node_index_year) <=" + tToStr + ") " + _
                  "And ((ZZZ_NONKIN_BIOG_ADDR_1.c_personid) > [ZZZ_NONKIN_BIOG_ADDR].[c_personid]))"
         Else
              tQueryWhereStr = "FROM ZZ_SCRATCH_IMPORT_PEOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 " + _
                  "INNER JOIN (ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN (ZZZ_NONKIN_BIOG_ADDR " + _
                  "INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZZZ_NONKIN_BIOG_ADDR_1 ON " + _
                  "ZZZ_NONKIN_BIOG_ADDR.c_node_id = ZZZ_NONKIN_BIOG_ADDR_1.c_node_id) ON " + _
                  "ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) ON " + _
                  "ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZZZ_NONKIN_BIOG_ADDR_1.c_personid " + _
                  "WHERE (((ZZZ_NONKIN_BIOG_ADDR_1.c_personid) > [ZZZ_NONKIN_BIOG_ADDR].[c_personid]))"
         End If
    Else
         If ChkIndexYears.Value Then
              tQueryWhereStr = "FROM ZZZ_NONKIN_BIOG_ADDR INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS " + _
                  "ZZZ_NONKIN_BIOG_ADDR_1 ON ZZZ_NONKIN_BIOG_ADDR.c_node_id = ZZZ_NONKIN_BIOG_ADDR_1.c_node_id " +
_
                   "WHERE (((ZZZ_NONKIN_BIOG_ADDR_1.c_node_index_year)>=" + tFromStr + _
                   " And (ZZZ_NONKIN_BIOG_ADDR_1.c_node_index_year)<=" + tToStr + _
                   ") AND ((ZZZ_NONKIN_BIOG_ADDR_1.c_personid)=" + tID2Str + _
                   ") AND ((ZZZ_NONKIN_BIOG_ADDR.c_personid)=" + tID1Str + "))"
        Else
               tQueryWhereStr = "FROM ZZZ_NONKIN_BIOG_ADDR INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS " + _
                   "ZZZ_NONKIN_BIOG_ADDR_1 ON ZZZ_NONKIN_BIOG_ADDR.c_node_id = ZZZ_NONKIN_BIOG_ADDR_1.c_node_id " +
_
                   "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_personid)=" + tID1Str + ") AND " + _
                   "((ZZZ_NONKIN_BIOG_ADDR_1.c_personid)=" + tID2Str + "))"
        End If
    End If
    '
    cmdSQL.CommandText = tQueryStr + tQueryWhereStr
    cmdSQL.Execute tRecDeleted
    '
    ' if kinship ties are to be included, get first-order kinship connections
    ' The situation is a bit more complicated than it might appear, since a kin of X may be an associate of Y
    ' or an associate of X may be a kin of Y or a kin of X may be a kin of Y:
    '      x a=kin(x)   y=kin(a)    00
    '      x a=kin(x)   y=assoc(a) 01
    '      x a=assoc(x) y=kin(a)    10
    '
    If ChkKinship.Value Then
        '
        ' two strings remain fixed
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_PAIR_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, " + _
            "c_female, c_addr_id, c_addr_name, c_addr_chn, c_addr_type, c_addr_desc, c_addr_desc_chn, " + _
            "x_coord, y_coord, c_node_dist ) " + _
            "SELECT DISTINCT ZABA_1.c_node_id, ZABA_1.c_node_name, " + _
            "ZABA_1.c_node_chn, ZABA_1.c_node_index_year, " + _
            "ZABA_1.c_node_female, ZABA_1.c_node_addr_id, " + _
            "ZABA_1.c_node_addr_name, ZABA_1.c_node_addr_chn, " + _
            "ZABA_1.c_node_addr_type, ZABA_1.c_node_addr_desc, " + _
            "ZABA_1.c_node_addr_desc_chn, ZABA_1.node_xcoord, " + _
            "ZABA_1.node_ycoord, 1 AS c_node_dist "

        If CmdClearList.Enabled Then
            If ChkIndexYears.Value Then
                 tQueryWhereStr = "WHERE (((ZABA_1.c_node_index_year)>=" + tFromStr + _
                     " And (ZABA_1.c_node_index_year)<" + tToStr + ") " + _
                     "AND ((ZABA_1.c_personid)>[ZABA].[c_personid]))"
            Else
                   tQueryWhereStr = "WHERE (((ZABA_1.c_personid)>" + _
                       "[ZABA].[c_personid]))"
               End If
        Else
            If ChkIndexYears.Value Then
                 tQueryWhereStr = "WHERE (((ZABA_1.c_node_index_year)>=" + tFromStr + _
                     " And (ZABA_1.c_node_index_year)<=" + tToStr + _
                     ") AND ((ZABA_1.c_personid)=" + tID2Str + _
                     ") AND ((ZABA.c_personid)=" + tID1Str + "))"
            Else
                 tQueryWhereStr = "WHERE (((ZABA_1.c_personid)=" + tID2Str + ") AND " + _
                     "((ZABA.c_personid)=" + tID1Str + "))"
            End If
        End If

        '   one changes

        ' kin-kin
        If CmdClearList.Enabled Then
             tQueryFromStr = "FROM ZZ_SCRATCH_IMPORT_PEOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 " + _
                 "INNER JOIN (ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN (ZZZ_KIN_BIOG_ADDR AS " + _
                 "ZABA INNER JOIN ZZZ_KIN_BIOG_ADDR AS ZABA_1 " + _
                 "ON ZABA.c_node_id = ZABA_1.c_node_id) " + _
                 "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c_personid) " + _
                 "ON ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZABA_1.c_personid "
        Else
             tQueryFromStr = "FROM ZZZ_KIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
                 "AS ZABA_1 ON ZABA.c_node_id = ZABA_1.c_node_id "
        End If

        cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
        cmdSQL.Execute tRecDeleted
        '
        cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
        cmdSQL.Execute tRecDeleted
        '
        ' copy to ZZ_SCRATCH_PEOPLE
        '
        cmdSQL.CommandText = tQueryAppendStr
        cmdSQL.Execute tRecDeleted
        '
        ' kin-assoc
        If CmdClearList.Enabled Then
             tQueryFromStr = "FROM ZZ_SCRATCH_IMPORT_PEOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 " + _
                 "INNER JOIN (ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN (ZZZ_KIN_BIOG_ADDR AS " + _
                 "ZABA INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZABA_1 " + _
                 "ON ZABA.c_node_id = ZABA_1.c_node_id) " + _
                 "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c_personid) " + _
                 "ON ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZABA_1.c_personid "
        Else
             tQueryFromStr = "FROM ZZZ_KIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
                 "AS ZABA_1 ON ZABA.c_node_id = ZABA_1.c_node_id "
        End If

        cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
        cmdSQL.Execute tRecDeleted
        '
        cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
        cmdSQL.Execute tRecDeleted
        '
        ' copy to ZZ_SCRATCH_PEOPLE
        '
        cmdSQL.CommandText = tQueryAppendStr
        cmdSQL.Execute tRecDeleted

        ' assoc-kin
        If CmdClearList.Enabled Then
             tQueryFromStr = "FROM ZZ_SCRATCH_IMPORT_PEOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 " + _
                 "INNER JOIN (ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN (ZZZ_NONKIN_BIOG_ADDR AS " + _
                 "ZABA INNER JOIN ZZZ_KIN_BIOG_ADDR AS ZABA_1 " + _
                 "ON ZABA.c_node_id = ZABA_1.c_node_id) " + _
                 "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c_personid) " + _
                 "ON ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZABA_1.c_personid "
        Else
             tQueryFromStr = "FROM ZZZ_NONKIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
                 "AS ZABA_1 ON ZABA.c_node_id = ZABA_1.c_node_id "
        End If

        cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
        cmdSQL.Execute tRecDeleted
         '
         cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
         cmdSQL.Execute tRecDeleted
         '
         ' copy to ZZ_SCRATCH_PEOPLE
         '
         cmdSQL.CommandText = tQueryAppendStr
         cmdSQL.Execute tRecDeleted
     End If
     '
     ' now get the second order linking people (first the first person in the pair, then the second)
     ' Add these to the temp file and copy only the non-duplicates
     '
     If Me.Chk2Nodes.Value Then
         MsgBox "Warning: the two-node routine takes a while. Don't Panic. Click to start."
         cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
         cmdSQL.Execute tRecDeleted
         '
         tQueryStr = "INSERT INTO ZZ_SCRATCH_PAIR_PEOPLE ( c_person_id, c_name, c_name_chn, " + _
             "c_index_year, c_female, c_addr_id, c_addr_name, c_addr_chn, c_addr_type, c_addr_desc, " + _
             "c_addr_desc_chn, x_coord, y_coord, c_node_dist ) " + _
             "SELECT DISTINCT ZZZ_NONKIN_BIOG_ADDR.c_node_id, ZZZ_NONKIN_BIOG_ADDR.c_node_name, " + _
             "ZZZ_NONKIN_BIOG_ADDR.c_node_chn, ZZZ_NONKIN_BIOG_ADDR.c_node_index_year, " + _
             "ZZZ_NONKIN_BIOG_ADDR.c_node_female, ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id, " + _
             "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_name, ZZZ_NONKIN_BIOG_ADDR.c_node_addr_chn, " + _
             "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_type, ZZZ_NONKIN_BIOG_ADDR.c_node_addr_desc, " + _
             "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_desc_chn, ZZZ_NONKIN_BIOG_ADDR.node_xcoord, " + _
             "ZZZ_NONKIN_BIOG_ADDR.node_ycoord, 2 AS c_node_dist "

         If CmdClearList.Enabled Then
             tQueryFromStr = "FROM ZZ_SCRATCH_IMPORT_PEOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 INNER JOIN " + _
                 "(ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ((ZZZ_NONKIN_BIOG_ADDR INNER JOIN " + _
                 "ZZZ_NONKIN_BIOG_ADDR AS ZZZ_NONKIN_BIOG_ADDR_1 ON " + _
                 "ZZZ_NONKIN_BIOG_ADDR.c_node_id = ZZZ_NONKIN_BIOG_ADDR_1.c_node_id) INNER JOIN " + _
                 "ZZZ_NONKIN_BIOG_ADDR AS ZZZ_NONKIN_BIOG_ADDR_2 ON " + _
                 "ZZZ_NONKIN_BIOG_ADDR_1.c_personid = ZZZ_NONKIN_BIOG_ADDR_2.c_node_id) " + _
                 "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
                 "ON ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZZZ_NONKIN_BIOG_ADDR_2.c_personid "

                If ChkIndexYears.Value Then
                     tQueryWhereStr = "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_node_id)>0 And " + _
                         "(ZZZ_NONKIN_BIOG_ADDR.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE_1].[c_person_id]) AND " + _
                         "((ZZZ_NONKIN_BIOG_ADDR_1.c_personid)>0 And " + _
                         "(ZZZ_NONKIN_BIOG_ADDR_1.c_personid)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id] AND " + _
                         "(ZZZ_NONKIN_BIOG_ADDR_2.c_personid)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]) AND " + _
                         "((ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)>0 And " + _
                         "(ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]) AND " + _
                         "((ZZZ_NONKIN_BIOG_ADDR.c_node_index_year)>=" + tFromStr + " And " + _
                         "(ZZZ_NONKIN_BIOG_ADDR.c_node_index_year)<=" + tToStr + "))"
                Else
                     tQueryWhereStr = "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_node_id)>0 And " + _
                         "(ZZZ_NONKIN_BIOG_ADDR.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE_1].[c_person_id]) AND " + _
                         "((ZZZ_NONKIN_BIOG_ADDR_1.c_personid)>0 And " + _
                         "(ZZZ_NONKIN_BIOG_ADDR_1.c_personid)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id] AND " + _
                         "((ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)>0 And " + _
                         "(ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]) AND " + _
                         "(ZZZ_NONKIN_BIOG_ADDR_2.c_personid)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]))"
                End If
         Else
                tQueryFromStr = "FROM (ZZZ_NONKIN_BIOG_ADDR INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS " + _
                    "ZZZ_NONKIN_BIOG_ADDR_1 ON ZZZ_NONKIN_BIOG_ADDR.c_node_id = ZZZ_NONKIN_BIOG_ADDR_1.c_node_id) " +
 _
                    "INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZZZ_NONKIN_BIOG_ADDR_2 ON " + _
                    "ZZZ_NONKIN_BIOG_ADDR_1.c_personid = ZZZ_NONKIN_BIOG_ADDR_2.c_node_id "

                If ChkIndexYears.Value Then
                     tQueryWhereStr = "WHERE (((ZZZ_NONKIN_BIOG_ADDR_1.c_personid)>0 And " + _
                         "(ZZZ_NONKIN_BIOG_ADDR_1.c_personid)<>" + tID1Str + ") AND " + _
                         "((ZZZ_NONKIN_BIOG_ADDR.c_node_index_year)>=" + tFromStr + " And " + _
                         "(ZZZ_NONKIN_BIOG_ADDR.c_node_index_year)<=" + tToStr + ") AND " + _
                         "((ZZZ_NONKIN_BIOG_ADDR.c_personid)=" + tID1Str + ") AND " + _
                         "((ZZZ_NONKIN_BIOG_ADDR_2.c_personid)=" + tID2Str + ") AND " + _
                         "((ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)>0 And " + _
                         "(ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]) AND " + _
                         "((ZZZ_NONKIN_BIOG_ADDR.c_node_id)>0 And " + _
                         "(ZZZ_NONKIN_BIOG_ADDR.c_node_id)<>" + tID2Str + "))"
                Else
                     tQueryWhereStr = "WHERE (((ZZZ_NONKIN_BIOG_ADDR_1.c_personid)>0 And " + _
                         "(ZZZ_NONKIN_BIOG_ADDR_1.c_personid)<>" + tID1Str + ") AND " + _
                         "((ZZZ_NONKIN_BIOG_ADDR.c_personid)=" + tID1Str + ") AND " + _
                     "((ZZZ_NONKIN_BIOG_ADDR_2.c_personid)=" + tID2Str + ") AND " + _
                     "((ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)>0 And " + _
                     "(ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]) AND " + _
                     "((ZZZ_NONKIN_BIOG_ADDR.c_node_id)>0 And (ZZZ_NONKIN_BIOG_ADDR.c_node_id)<>" + tID2Str + "))"
            End If
        End If

        cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
        cmdSQL.Execute tRecDeleted
        '
        ' copy to ZZ_SCRATCH_PEOPLE
        '
        cmdSQL.CommandText = tQueryAppendStr
        cmdSQL.Execute tRecDeleted
        '
        ' now get the second person in the pair
        '
        cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
        cmdSQL.Execute tRecDeleted
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_PAIR_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, " + _
            "c_female, c_addr_id, c_addr_name, c_addr_chn, c_addr_type, c_addr_desc, c_addr_desc_chn, " + _
            "x_coord, y_coord, c_node_dist ) " + _
            "SELECT DISTINCT ZZZ_NONKIN_BIOG_ADDR_1.c_personid, ZZZ_NONKIN_BIOG_ADDR_1.c_person_name, " + _
            "ZZZ_NONKIN_BIOG_ADDR_1.c_person_name_chn, ZZZ_NONKIN_BIOG_ADDR_1.c_index_year, " + _
            "ZZZ_NONKIN_BIOG_ADDR_1.c_female, ZZZ_NONKIN_BIOG_ADDR_1.c_addr_id, " + _
            "ZZZ_NONKIN_BIOG_ADDR_1.c_addr_name, ZZZ_NONKIN_BIOG_ADDR_1.c_addr_chn, " + _
            "ZZZ_NONKIN_BIOG_ADDR_1.c_addr_type, ZZZ_NONKIN_BIOG_ADDR_1.c_addr_desc, " + _
            "ZZZ_NONKIN_BIOG_ADDR_1.c_addr_desc_chn, ZZZ_NONKIN_BIOG_ADDR_1.x_coord, " + _
            "ZZZ_NONKIN_BIOG_ADDR_1.y_coord, 2 AS c_node_dist "

        If CmdClearList.Enabled Then
             If ChkIndexYears.Value Then
                  tQueryWhereStr = "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_node_id)>0 And " + _
                      "(ZZZ_NONKIN_BIOG_ADDR.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE_1].[c_person_id]) AND " + _
                      "((ZZZ_NONKIN_BIOG_ADDR_1.c_personid)>0 And " + _
                      "(ZZZ_NONKIN_BIOG_ADDR_1.c_personid)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id] AND " + _
                      "(ZZZ_NONKIN_BIOG_ADDR_2.c_personid)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]) AND " + _
                      "((ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)>0 And " + _
                      "(ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]) AND " + _
                      "((ZZZ_NONKIN_BIOG_ADDR_1.c_index_year)>=" + tFromStr + " And " + _
                      "(ZZZ_NONKIN_BIOG_ADDR_1.c_index_year)<=" + tToStr + "))"
             Else
                  tQueryWhereStr = "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_node_id)>0 And " + _
                      "(ZZZ_NONKIN_BIOG_ADDR.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE_1].[c_person_id]) AND " + _
                      "((ZZZ_NONKIN_BIOG_ADDR_1.c_personid)>0 And " + _
                      "((ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)>0 And " + _
                      "(ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]) AND " + _
                      "(ZZZ_NONKIN_BIOG_ADDR_1.c_personid)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id] AND " + _
                      "(ZZZ_NONKIN_BIOG_ADDR_2.c_personid)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]))"
             End If
        Else
             If ChkIndexYears.Value Then
                  tQueryWhereStr = "WHERE (((ZZZ_NONKIN_BIOG_ADDR_1.c_personid)>0 And " + _
                      "(ZZZ_NONKIN_BIOG_ADDR_1.c_personid)<>" + tID1Str + ") AND " + _
                      "((ZZZ_NONKIN_BIOG_ADDR_1.c_index_year)>=" + tFromStr + " And " + _
                      "(ZZZ_NONKIN_BIOG_ADDR_1.c_index_year)<=" + tToStr + ") AND " + _
                      "((ZZZ_NONKIN_BIOG_ADDR.c_personid)=" + tID1Str + ") AND " + _
                      "((ZZZ_NONKIN_BIOG_ADDR_2.c_personid)=" + tID2Str + ") AND " + _
                      "((ZZZ_NONKIN_BIOG_ADDR.c_node_id)>0 And " + _
                      "(ZZZ_NONKIN_BIOG_ADDR.c_node_id)<>" + tID2Str + "))"
             Else
                  tQueryWhereStr = "WHERE (((ZZZ_NONKIN_BIOG_ADDR_1.c_personid)>0 And " + _
                      "(ZZZ_NONKIN_BIOG_ADDR_1.c_personid)<>" + tID1Str + ") AND " + _
                      "((ZZZ_NONKIN_BIOG_ADDR.c_personid)=" + tID1Str + ") AND " + _
                      "((ZZZ_NONKIN_BIOG_ADDR_2.c_personid)=" + tID2Str + ") AND " + _
                      "((ZZZ_NONKIN_BIOG_ADDR.c_node_id)>0 And (ZZZ_NONKIN_BIOG_ADDR.c_node_id)<>" + tID2Str + "))"
             End If
        End If
        cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
        cmdSQL.Execute tRecDeleted
        '
        ' copy to ZZ_SCRATCH_PEOPLE
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_PEOPLE SELECT ZZ_SCRATCH_PAIR_PEOPLE.* " + _
             "FROM ZZ_SCRATCH_PAIR_PEOPLE LEFT JOIN ZZ_SCRATCH_PEOPLE ON " + _
             "ZZ_SCRATCH_PAIR_PEOPLE.c_person_id = ZZ_SCRATCH_PEOPLE.c_person_id " + _
             "WHERE (((ZZ_SCRATCH_PEOPLE.c_person_id) Is Null))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' if kinship ties are to be included, get second-order kinship connections.
        ' here, there are seven(!) possibilities that must considered:
        '      x a=kin(x) b=kin(a) y=kin(b)       000
        '      x a=kin(x) b=kin(a) y=assoc(b)     001
        '      x a=kin(x) b=assoc(a) y=kin(b)     010
        '      x a=kin(x) b=assoc(a) y=assoc(b) 011
        '      x a=assoc(x) b=kin(a) y=kin(b)     100
        '      x a=assoc(x) b=kin(a) y=assoc(b) 101
        '      x a=assoc(x) b=assoc(a) y=kin(b) 110
        ' Therefore we need to run seven queries by swapping out the tables we use
        '
        If ChkKinship.Value Then
            '
            ' these two parts of the query stay the same
            '
            tQuery1stStr = "INSERT INTO ZZ_SCRATCH_PAIR_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, "
 + _
                "c_female, c_addr_id, c_addr_name, c_addr_chn, c_addr_type, c_addr_desc, c_addr_desc_chn, " + _
                "x_coord, y_coord, c_node_dist ) " + _
                "SELECT DISTINCT ZABA_1.c_personid, ZABA_1.c_person_name, " + _
                "ZABA_1.c_person_name_chn, ZABA_1.c_index_year, " + _
                "ZABA_1.c_female, ZABA_1.c_addr_id, " + _
                "ZABA_1.c_addr_name, ZABA_1.c_addr_chn, " + _
                "ZABA_1.c_addr_type, ZABA_1.c_addr_desc, " + _
                "ZABA_1.c_addr_desc_chn, ZABA_1.x_coord, " + _
                "ZABA_1.y_coord, 1 AS c_node_dist "

            tQuery2ndStr = "INSERT INTO ZZ_SCRATCH_PAIR_PEOPLE ( c_person_id, c_name, c_name_chn, " + _
                "c_index_year, c_female, c_addr_id, c_addr_name, c_addr_chn, c_addr_type, c_addr_desc, " + _
                "c_addr_desc_chn, x_coord, y_coord, c_node_dist ) " + _
                "SELECT DISTINCT ZABA.c_node_id, ZABA.c_node_name, " + _
                "ZABA.c_node_chn, ZABA.c_node_index_year, " + _
                "ZABA.c_node_female, ZABA.c_node_addr_id, " + _
                "ZABA.c_node_addr_name, ZABA.c_node_addr_chn, " + _
                "ZABA.c_node_addr_type, ZABA.c_node_addr_desc, " + _
                "ZABA.c_node_addr_desc_chn, ZABA.node_xcoord, " + _
                "ZABA.node_ycoord, 2 AS c_node_dist "

            If CmdClearList.Enabled Then
                 If ChkIndexYears.Value Then
                      tQuery1stWhereStr = "WHERE (((ZABA.c_node_id)>0 And " + _
                          "(ZABA.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE_1].[c_person_id]) AND " + _
                          "((ZABA_1.c_personid)>0 And " + _
                          "(ZABA_1.c_personid)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]) AND " + _
                          "((ZABA_1.c_index_year)>=" + tFromStr + " And " + _
                          "(ZABA_1.c_index_year)<=" + tToStr + "))"
                      tQuery2ndWhereStr = "WHERE (((ZABA.c_node_id)>0 And " + _
                          "(ZABA.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE_1].[c_person_id]) AND " + _
                          "((ZABA_1.c_personid)>0 And " + _
                          "(ZABA_1.c_personid)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]) AND " + _
                          "((ZABA.c_node_index_year)>=" + tFromStr + " And " + _
                          "(ZABA.c_node_index_year)<=" + tToStr + "))"
                 Else
                      tQuery1stWhereStr = "WHERE (((ZABA.c_node_id)>0 And " + _
                          "(ZABA.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE_1].[c_person_id]) AND " + _
                          "((ZABA_1.c_personid)>0 And " + _
                          "(ZABA_1.c_personid)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]))"
                      tQuery2ndWhereStr = tQuery1stWhereStr
                 End If
            Else
                 If ChkIndexYears.Value Then
                      tQuery1stWhereStr = "WHERE (((ZABA_1.c_personid)>0 And " + _
                          "(ZABA_1.c_personid)<>" + tID1Str + ") AND " + _
                          "((ZABA_1.c_index_year)>=" + tFromStr + " And " + _
                          "(ZABA_1.c_index_year)<=" + tToStr + ") AND " + _
                          "((ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)>0 And " + _
                          "(ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]) AND " + _
                          "((ZABA.c_personid)=" + tID1Str + ") AND " + _
                          "((ZABA_2.c_personid)=" + tID2Str + ") AND " + _
                          "((ZABA.c_node_id)>0 And " + _
                          "(ZABA.c_node_id)<>" + tID2Str + "))"
                      tQuery2ndWhereStr = "WHERE (((ZABA_1.c_personid)>0 And " + _
                          "(ZABA_1.c_personid)<>" + tID1Str + ") AND " + _
                          "((ZABA.c_node_index_year)>=" + tFromStr + " And " + _
                          "(ZABA.c_node_index_year)<=" + tToStr + ") AND " + _
                          "((ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)>0 And " + _
                          "(ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]) AND " + _
                          "((ZABA.c_personid)=" + tID1Str + ") AND " + _
                         "((ZABA_2.c_personid)=" + tID2Str + ") AND " + _
                         "((ZABA.c_node_id)>0 And " + _
                         "(ZABA.c_node_id)<>" + tID2Str + "))"
                 Else
                    tQuery1stWhereStr = "WHERE (((ZABA_1.c_personid)>0 And " + _
                        "(ZABA_1.c_personid)<>" + tID1Str + ") AND " + _
                        "((ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)>0 And " + _
                        "(ZZZ_NONKIN_BIOG_ADDR_2.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id]) AND " + _
                        "((ZABA.c_personid)=" + tID1Str + ") AND " + _
                        "((ZABA_2.c_personid)=" + tID2Str + ") AND " + _
                        "((ZABA.c_node_id)>0 And " + _
                        "(ZABA.c_node_id)<>" + tID2Str + "))"
                    tQuery2ndWhereStr = tQuery1stWhereStr
                End If
            End If

            'tQueryWhereStr = "WHERE (((ZABA.c_personid)=" + tID1Str + ") AND " + _
            '    "((ZABA_2.c_personid)=" + tID2Str + "))"

            '   what changes are the tables to be considered

            ' kin-kin-kin
            If CmdClearList.Enabled Then
                 tQueryFromStr = "FROM ZZ_SCRATCH_IMPORT_PEOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 INNER JOIN " + _
                     "(ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ((ZZZ_KIN_BIOG_ADDR AS ZABA " + _
                     "INNER JOIN ZZZ_KIN_BIOG_ADDR AS ZABA_1 ON " + _
                     "ZABA.c_node_id = ZABA_1.c_node_id) INNER JOIN " + _
                     "ZZZ_KIN_BIOG_ADDR AS ZABA_2 ON " + _
                     "ZABA_1.c_personid = ZABA_2.c_node_id) " + _
                     "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c_personid) " + _
                     "ON ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZABA_2.c_personid "
            Else
                 tQueryFromStr = "FROM (ZZZ_KIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
                     "AS ZABA_1 ON ZABA.c_node_id = " + _
                     "ZABA_1.c_node_id) INNER JOIN ZZZ_KIN_BIOG_ADDR AS ZABA_2 " + _
                     "ON ZABA_1.c_personid = ZABA_2.c_node_id "
            End If

            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQuery1stStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            ' get second person
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQuery2ndStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            ' kin-kin-assoc
            If CmdClearList.Enabled Then
                 tQueryFromStr = "FROM ZZ_SCRATCH_IMPORT_PEOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 INNER JOIN " + _
                     "(ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ((ZZZ_KIN_BIOG_ADDR AS ZABA " + _
                     "INNER JOIN ZZZ_KIN_BIOG_ADDR AS ZABA_1 ON " + _
                     "ZABA.c_node_id = ZABA_1.c_node_id) INNER JOIN " + _
                     "ZZZ_NONKIN_BIOG_ADDR AS ZABA_2 ON " + _
                     "ZABA_1.c_personid = ZABA_2.c_node_id) " + _
                     "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c_personid) " + _
                     "ON ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZABA_2.c_personid "
            Else
                 tQueryFromStr = "FROM (ZZZ_KIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
                     "AS ZABA_1 ON ZABA.c_node_id = " + _
                     "ZABA_1.c_node_id) INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZABA_2 " + _
                     "ON ZABA_1.c_personid = ZABA_2.c_node_id "
            End If

            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQuery1stStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            ' get second person
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQuery2ndStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            '
            ' kin-assoc-kin
            If CmdClearList.Enabled Then
                 tQueryFromStr = "FROM ZZ_SCRATCH_IMPORT_PEOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 INNER JOIN " + _
                     "(ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ((ZZZ_KIN_BIOG_ADDR AS ZABA " + _
                     "INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZABA_1 ON " + _
                     "ZABA.c_node_id = ZABA_1.c_node_id) INNER JOIN " + _
                     "ZZZ_KIN_BIOG_ADDR AS ZABA_2 ON " + _
                     "ZABA_1.c_personid = ZABA_2.c_node_id) " + _
                     "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c_personid) " + _
                     "ON ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZABA_2.c_personid "
            Else
                 tQueryFromStr = "FROM (ZZZ_KIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
                     "AS ZABA_1 ON ZABA.c_node_id = " + _
                     "ZABA_1.c_node_id) INNER JOIN ZZZ_KIN_BIOG_ADDR AS ZABA_2 " + _
                     "ON ZABA_1.c_personid = ZABA_2.c_node_id "
            End If

            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQuery1stStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            ' get second person
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQuery2ndStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            '
            ' kin-assoc-assoc
            If CmdClearList.Enabled Then
                 tQueryFromStr = "FROM ZZ_SCRATCH_IMPORT_PEOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 INNER JOIN " + _
                     "(ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ((ZZZ_KIN_BIOG_ADDR AS ZABA " + _
                     "INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZABA_1 ON " + _
                     "ZABA.c_node_id = ZABA_1.c_node_id) INNER JOIN " + _
                     "ZZZ_NONKIN_BIOG_ADDR AS ZABA_2 ON " + _
                     "ZABA_1.c_personid = ZABA_2.c_node_id) " + _
                     "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c_personid) " + _
                     "ON ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZABA_2.c_personid "
            Else
                 tQueryFromStr = "FROM (ZZZ_KIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
                     "AS ZABA_1 ON ZABA.c_node_id = " + _
                     "ZABA_1.c_node_id) INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZABA_2 " + _
                     "ON ZABA_1.c_personid = ZABA_2.c_node_id "
            End If

            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQuery1stStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            ' get second person
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQuery2ndStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            '
            ' assoc-kin-kin
            If CmdClearList.Enabled Then
                 tQueryFromStr = "FROM ZZ_SCRATCH_IMPORT_PEOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 INNER JOIN " + _
                     "(ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ((ZZZ_NONKIN_BIOG_ADDR AS ZABA " + _
                     "INNER JOIN ZZZ_KIN_BIOG_ADDR AS ZABA_1 ON " + _
                     "ZABA.c_node_id = ZABA_1.c_node_id) INNER JOIN " + _
                     "ZZZ_KIN_BIOG_ADDR AS ZABA_2 ON " + _
                     "ZABA_1.c_personid = ZABA_2.c_node_id) " + _
                     "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c_personid) " + _
                     "ON ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZABA_2.c_personid "
            Else
                 tQueryFromStr = "FROM (ZZZ_NONKIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
                     "AS ZABA_1 ON ZABA.c_node_id = " + _
                     "ZABA_1.c_node_id) INNER JOIN ZZZ_KIN_BIOG_ADDR AS ZABA_2 " + _
                     "ON ZABA_1.c_personid = ZABA_2.c_node_id "
            End If

            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQuery1stStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            ' get second person
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQuery2ndStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            '
            ' assoc-kin-assoc
            If CmdClearList.Enabled Then
                tQueryFromStr = "FROM ZZ_SCRATCH_IMPORT_PEOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 INNER JOIN " + _
                    "(ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ((ZZZ_NONKIN_BIOG_ADDR AS ZABA " + _
                    "INNER JOIN ZZZ_KIN_BIOG_ADDR AS ZABA_1 ON " + _
                    "ZABA.c_node_id = ZABA_1.c_node_id) INNER JOIN " + _
                    "ZZZ_NONKIN_BIOG_ADDR AS ZABA_2 ON " + _
                    "ZABA_1.c_personid = ZABA_2.c_node_id) " + _
                    "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c_personid) " + _
                    "ON ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZABA_2.c_personid "
            Else
                tQueryFromStr = "FROM (ZZZ_NONKIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
                    "AS ZABA_1 ON ZABA.c_node_id = " + _
                    "ZABA_1.c_node_id) INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZABA_2 " + _
                    "ON ZABA_1.c_personid = ZABA_2.c_node_id "
            End If

            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQuery1stStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            ' get second person
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQuery2ndStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            '
            '
            ' assoc-assoc-kin
            If CmdClearList.Enabled Then
                 tQueryFromStr = "FROM ZZ_SCRATCH_IMPORT_PEOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 INNER JOIN " + _
                     "(ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ((ZZZ_NONKIN_BIOG_ADDR AS ZABA " + _
                     "INNER JOIN ZZZ_NONKIN_BIOG_ADDR AS ZABA_1 ON " + _
                     "ZABA.c_node_id = ZABA_1.c_node_id) INNER JOIN " + _
                     "ZZZ_KIN_BIOG_ADDR AS ZABA_2 ON " + _
                     "ZABA_1.c_personid = ZABA_2.c_node_id) " + _
                     "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c_personid) " + _
                     "ON ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZABA_2.c_personid "
            Else
                 tQueryFromStr = "FROM (ZZZ_NONKIN_BIOG_ADDR AS ZABA INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
                     "AS ZABA_1 ON ZABA.c_node_id = " + _
                     "ZABA_1.c_node_id) INNER JOIN ZZZ_KIN_BIOG_ADDR AS ZABA_2 " + _
                     "ON ZABA_1.c_personid = ZABA_2.c_node_id "
            End If

            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQuery1stStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
            ' get second person
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = tQuery2ndStr + tQueryFromStr + tQueryWhereStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy to ZZ_SCRATCH_PEOPLE
            '
            cmdSQL.CommandText = tQueryAppendStr
            cmdSQL.Execute tRecDeleted
            '
        End If

    End If
    '
    ' remove duplicates
    '
    tQueryStr = "UPDATE ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1 INNER JOIN ZZ_SCRATCH_PEOPLE ON " + _
        "ZZ_SCRATCH_PEOPLE_1.c_person_id = ZZ_SCRATCH_PEOPLE.c_person_id " + _
        "SET ZZ_SCRATCH_PEOPLE.c_delete = True " + _
        "WHERE (((ZZ_SCRATCH_PEOPLE.c_node_dist)>[ZZ_SCRATCH_PEOPLE_1].[c_node_dist]))"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PEOPLE WHERE c_delete = True"
    cmdSQL.Execute tRecDeleted
    '
    ' now use the people table to get the edges:
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_SOCIAL_NETWORK"
    cmdSQL.Execute tRecDeleted
    '
    ' first non-kin
    '
    tQueryIntoStr = "INSERT INTO ZZ_SOCIAL_NETWORK ( c_person_id, c_name, c_name_chn, c_index_year, " + _
        "c_female, c_node_id, c_node_name, c_node_chn, c_node_index_year, c_node_female, c_link_type, " + _
        "c_link_code, c_link_desc, c_link_chn, c_link_count, c_addr_id, c_addr_name, c_addr_chn, " + _
        "c_addr_type, c_addr_desc, c_addr_desc_chn, x_coord, y_coord, c_node_addr_id, c_node_addr_name, " + _
        "c_node_addr_chn, c_node_addr_type, c_node_addr_desc, c_node_addr_desc_chn, node_xcoord, " + _
        "c_edge_dist, type_id, c_kin_desc, c_kin_desc_chn, c_kin_name, c_kin_chn, c_kin_id, c_kin_code, " + _
        "c_assoc_kin_desc, c_assoc_kin_desc_chn, c_assoc_kin_name, c_assoc_kin_chn, c_assoc_kin_id, " + _
        "c_assoc_kin_code, c_litgenre_code, c_litgenre_desc, c_litgenre_desc_chn, c_topic_code, " + _
        "c_topic_desc, c_topic_desc_chn, c_occasion_code, c_occasion_desc, c_occasion_desc_chn, " + _
        "c_inst_code, c_inst_name_hz, c_text_title, c_assoc_claimer_id, c_assoc_claimer_name, " + _
        "c_assoc_claimer_name_chn, c_distance ) "
    tQuerySelectStr = "SELECT ASSOC_REL.c_personid, ASSOC_REL.c_person_name, ASSOC_REL.c_person_name_chn, " + _
        "ASSOC_REL.c_index_year, ASSOC_REL.c_female, ASSOC_REL.c_node_id, ASSOC_REL.c_node_name, " + _
        "ASSOC_REL.c_node_chn, ASSOC_REL.c_node_index_year, ASSOC_REL.c_node_female, 'N' AS c_link_type, " + _
        "ASSOC_REL.c_link_code, ASSOC_REL.c_link_desc, ASSOC_REL.c_link_chn, ASSOC_REL.c_link_count, " + _
        "ASSOC_REL.c_addr_id, ASSOC_REL.c_addr_name, ASSOC_REL.c_addr_chn, ASSOC_REL.c_addr_type, " + _
        "ASSOC_REL.c_addr_desc, ASSOC_REL.c_addr_desc_chn, ASSOC_REL.x_coord, ASSOC_REL.y_coord, " + _
        "ASSOC_REL.c_node_addr_id, ASSOC_REL.c_node_addr_name, ASSOC_REL.c_node_addr_chn, " + _
        "ASSOC_REL.c_node_addr_type, ASSOC_REL.c_node_addr_desc, ASSOC_REL.c_node_addr_desc_chn, " + _
        "ASSOC_REL.node_xcoord, ZZ_SCRATCH_PEOPLE.c_node_dist, 'N' AS type_id, ASSOC_REL.c_kinrel, " + _
        "ASSOC_REL.c_kinrel_chn, ASSOC_REL.c_kin_name, ASSOC_REL.c_kin_chn, ASSOC_REL.c_kin_id, " + _
        "ASSOC_REL.c_kin_code, ASSOC_REL.c_assoc_kinrel, ASSOC_REL.c_assoc_kinrel_chn, " + _
        "ASSOC_REL.c_assoc_kin_name, ASSOC_REL.c_assoc_kin_chn, ASSOC_REL.c_assoc_kin_id, " + _
        "ASSOC_REL.c_assoc_kin_code, ASSOC_REL.c_litgenre_code, ASSOC_REL.c_lit_genre_desc, " + _
        "ASSOC_REL.c_lit_genre_desc_chn, ASSOC_REL.c_topic_code, ASSOC_REL.c_topic_desc, " + _
        "ASSOC_REL.c_topic_desc_chn, ASSOC_REL.c_occasion_code, ASSOC_REL.c_occasion_desc, " + _
        "ASSOC_REL.c_occasion_desc_chn, ASSOC_REL.c_inst_code, ASSOC_REL.c_inst_name_hz, " + _
        "ASSOC_REL.c_text_title, ASSOC_REL.c_assoc_claimer_id, " + _
        "ASSOC_REL.c_assoc_claimer_name , ASSOC_REL.c_assoc_claimer_chn, ASSOC_REL.c_distance "
    tQueryFromStr = "FROM ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1 INNER JOIN (ZZ_SCRATCH_PEOPLE INNER " + _
        "JOIN ZZZ_NONKIN_BIOG_ADDR AS ASSOC_REL ON ZZ_SCRATCH_PEOPLE.c_person_id = " + _
        "ASSOC_REL.c_personid) ON ZZ_SCRATCH_PEOPLE_1.c_person_id = ASSOC_REL.c_node_id "

    'If CmdClearList.Enabled Then
        '
        ' allow the people from the list to serve as nodes, then delete them
        '
        'cmdSQL.CommandText = tQueryIntoStr + tQuerySelectStr + tQueryFromStr
        'cmdSQL.Execute tRecDeleted
        '
        ' now mark the nodes
        '
        'cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ZZ_SOCIAL_NETWORK " + _
            "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZZ_SOCIAL_NETWORK.c_node_id " + _
            "SET ZZ_SOCIAL_NETWORK.c_delete = 1"
        'cmdSQL.Execute tRecDeleted
        '
        ' and delete
        '
        'cmdSQL.CommandText = "Delete from ZZ_SOCIAL_NETWORK where c_delete = 1"
        'cmdSQL.Execute tRecCount
    'Else
        'tQueryWhereStr = "WHERE (((ASSOC_REL.c_node_id)<> " + tID1Str + _
            " And (ASSOC_REL.c_node_id)<>" + tID2Str + "))"

        'cmdSQL.CommandText = tQueryIntoStr + tQuerySelectStr + tQueryFromStr + tQueryWhereStr
        'cmdSQL.Execute tRecDeleted
    'End If
        cmdSQL.CommandText = tQueryIntoStr + tQuerySelectStr + tQueryFromStr
        cmdSQL.Execute tRecDeleted

    If ChkKinship.Value Then
        '
        ' get from the kinship table
        '
        tQueryIntoStr = "INSERT INTO ZZ_SOCIAL_NETWORK ( c_person_id, c_name, c_name_chn, c_index_year, " + _
            "c_female, c_node_id, c_node_name, c_node_chn, c_node_index_year, c_node_female, c_link_type, " + _
            "c_link_code, c_link_desc, c_link_chn, c_link_count, c_addr_id, c_addr_name, c_addr_chn, " + _
            "c_addr_type, c_addr_desc, c_addr_desc_chn, x_coord, y_coord, c_node_addr_id, c_node_addr_name, " + _
            "c_node_addr_chn, c_node_addr_type, c_node_addr_desc, c_node_addr_desc_chn, node_xcoord, " + _
            "node_ycoord, c_edge_dist, type_id, c_distance ) "
        tQuerySelectStr = "SELECT ZZ_SCRATCH_PEOPLE.c_person_id, KIN_REL.c_person_name, " + _
            "KIN_REL.c_person_name_chn, KIN_REL.c_index_year, KIN_REL.c_female, KIN_REL.c_node_id, " + _
            "KIN_REL.c_node_name, KIN_REL.c_node_chn, KIN_REL.c_node_index_year, KIN_REL.c_node_female, " + _
            "'K' AS c_link_type, KIN_REL.c_link_code, KIN_REL.c_link_desc, KIN_REL.c_link_chn, " + _
            "1 AS c_link_count, KIN_REL.c_addr_id, KIN_REL.c_addr_name, KIN_REL.c_addr_chn, " + _
            "KIN_REL.c_addr_type, KIN_REL.c_addr_desc, KIN_REL.c_addr_desc_chn, KIN_REL.x_coord, " + _
            "KIN_REL.y_coord, KIN_REL.c_node_addr_id, KIN_REL.c_node_addr_name, KIN_REL.c_node_addr_chn, " + _
            "KIN_REL.c_node_addr_type, KIN_REL.c_node_addr_desc, KIN_REL.c_node_addr_desc_chn, " + _
            "KIN_REL.node_xcoord, KIN_REL.node_ycoord, ZZ_SCRATCH_PEOPLE.c_node_dist, 'K' AS type_id, " + _
            "KIN_REL.c_distance "
        tQueryFromStr = "FROM ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1 INNER JOIN (ZZ_SCRATCH_PEOPLE " + _
            "INNER JOIN ZZZ_KIN_BIOG_ADDR AS KIN_REL ON ZZ_SCRATCH_PEOPLE.c_person_id = " + _
            "KIN_REL.c_personid) ON ZZ_SCRATCH_PEOPLE_1.c_person_id = KIN_REL.c_node_id "

        'If CmdClearList.Enabled Then
            '
            ' allow the people from the list to serve as nodes, then delete them
            '
            'cmdSQL.CommandText = tQueryIntoStr + tQuerySelectStr + tQueryFromStr
            'cmdSQL.Execute tRecDeleted
            '
            ' now mark the nodes
            '
            'cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ZZ_SOCIAL_NETWORK " + _
                "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZZ_SOCIAL_NETWORK.c_node_id " + _
                "SET ZZ_SOCIAL_NETWORK.c_delete = 1"
            'cmdSQL.Execute tRecDeleted
            '
            ' and delete
            '
            'cmdSQL.CommandText = "Delete from ZZ_SOCIAL_NETWORK where c_delete = 1"
            'cmdSQL.Execute tRecCount
        'Else
            'tQueryWhereStr = "WHERE (((KIN_REL.c_node_id)<>" + tID1Str + _
                " And (KIN_REL.c_node_id)<>" + tID2Str + "))"

            'cmdSQL.CommandText = tQueryIntoStr + tQuerySelectStr + tQueryFromStr + tQueryWhereStr
            'cmdSQL.Execute tRecDeleted
        'End If
        cmdSQL.CommandText = tQueryIntoStr + tQuerySelectStr + tQueryFromStr
        cmdSQL.Execute tRecDeleted
    End If
    '
    ' now mark all the duplicates that are inverses of other records for deletion
    '
    tQueryStr = "UPDATE ASSOC_CODES INNER JOIN (ZZ_SOCIAL_NETWORK AS ZZ_SOCIAL_NETWORK_1 INNER JOIN " + _
        "ZZ_SOCIAL_NETWORK ON (ZZ_SOCIAL_NETWORK_1.c_node_id = ZZ_SOCIAL_NETWORK.c_person_id) AND " + _
        "(ZZ_SOCIAL_NETWORK_1.c_person_id = ZZ_SOCIAL_NETWORK.c_node_id)) ON (ASSOC_CODES.c_assoc_pair = " + _
        "ZZ_SOCIAL_NETWORK_1.c_link_code) AND (ASSOC_CODES.c_assoc_code = ZZ_SOCIAL_NETWORK.c_link_code) " + _
        "SET ZZ_SOCIAL_NETWORK.c_delete = 1 " + _
        "WHERE (((ZZ_SOCIAL_NETWORK.c_link_type)='N') AND " + _
        "((ZZ_SOCIAL_NETWORK.c_edge_dist)>[ZZ_SOCIAL_NETWORK_1].[c_edge_dist])) OR " + _
        "(((ZZ_SOCIAL_NETWORK.c_link_type)='N') AND " + _
        "((ZZ_SOCIAL_NETWORK.c_edge_dist)=[ZZ_SOCIAL_NETWORK_1].[c_edge_dist]) AND " + _
        "((ZZ_SOCIAL_NETWORK.c_person_id)>[ZZ_SOCIAL_NETWORK_1].[c_person_id]))"
    '
    'MsgBox "About to mark inverses..."
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecCount
    '
    If Me.ChkKinship.Value Then
        tQueryStr = "UPDATE KINSHIP_CODES INNER JOIN (ZZ_SOCIAL_NETWORK AS ZZ_SOCIAL_NETWORK_1 INNER JOIN " + _
            "ZZ_SOCIAL_NETWORK ON (ZZ_SOCIAL_NETWORK_1.c_node_id = ZZ_SOCIAL_NETWORK.c_person_id) AND " + _
            "(ZZ_SOCIAL_NETWORK_1.c_person_id = ZZ_SOCIAL_NETWORK.c_node_id)) ON KINSHIP_CODES.c_kincode = " + _
            "ZZ_SOCIAL_NETWORK.c_link_code SET ZZ_SOCIAL_NETWORK.c_delete = 1 " + _
            "WHERE (((ZZ_SOCIAL_NETWORK.c_link_type)='K') AND " + _
            "((ZZ_SOCIAL_NETWORK.c_edge_dist)>[ZZ_SOCIAL_NETWORK_1].[c_edge_dist]) AND " + _
            "((ZZ_SOCIAL_NETWORK_1.c_link_code)=[KINSHIP_CODES].[c_kin_pair1])) OR (((ZZ_SOCIAL_NETWORK.c_link_ty
pe)='K') " + _
            "AND ((ZZ_SOCIAL_NETWORK.c_edge_dist)=[ZZ_SOCIAL_NETWORK_1].[c_edge_dist]) AND " + _
            "((ZZ_SOCIAL_NETWORK.c_person_id)>[ZZ_SOCIAL_NETWORK_1].[c_person_id]) AND " + _
            "((ZZ_SOCIAL_NETWORK_1.c_link_code)=[KINSHIP_CODES].[c_kin_pair1])) OR (((ZZ_SOCIAL_NETWORK.c_link_ty
pe)='K') " + _
            "AND ((ZZ_SOCIAL_NETWORK.c_edge_dist)>[ZZ_SOCIAL_NETWORK_1].[c_edge_dist]) " + _
            "AND ((ZZ_SOCIAL_NETWORK_1.c_link_code)=[KINSHIP_CODES].[c_kin_pair2])) OR (((ZZ_SOCIAL_NETWORK.c_lin
k_type)='K') " + _
            "AND ((ZZ_SOCIAL_NETWORK.c_edge_dist)=[ZZ_SOCIAL_NETWORK_1].[c_edge_dist]) AND " + _
            "((ZZ_SOCIAL_NETWORK.c_person_id)>[ZZ_SOCIAL_NETWORK_1].[c_person_id]) AND " + _
            "((ZZ_SOCIAL_NETWORK_1.c_link_code)=[KINSHIP_CODES].[c_kin_pair2]))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecCount
    End If
    '
    ' now delete
    '
    'MsgBox "About to delete inverses..."
    cmdSQL.CommandText = "Delete from ZZ_SOCIAL_NETWORK where c_delete = 1"
    cmdSQL.Execute tRecCount
    '
    '
    ' the final step is to calculate the xy_count
    '
    ' get the XY count
    '
    'MsgBox "About to count XYs..."
    '
    cmdSQL.CommandText = "Delete * from tmpXY"
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "INSERT INTO tmpXY ( x_coord, y_coord, CountOfx_coord, CountOfy_coord ) " + _
        "SELECT ZZ_SCRATCH_PEOPLE.x_coord, ZZ_SCRATCH_PEOPLE.y_coord, Count(ZZ_SCRATCH_PEOPLE.x_coord) " + _
        "AS CountOfx_coord, Count(ZZ_SCRATCH_PEOPLE.y_coord) AS CountOfy_coord " + _
        "FROM ZZ_SCRATCH_PEOPLE " + _
        "GROUP BY ZZ_SCRATCH_PEOPLE.x_coord, ZZ_SCRATCH_PEOPLE.y_coord;"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "UPDATE tmpXY INNER JOIN ZZ_SCRATCH_PEOPLE ON (tmpXY.y_coord = " + _
        "ZZ_SCRATCH_PEOPLE.y_coord) AND (tmpXY.x_coord = ZZ_SCRATCH_PEOPLE.x_coord) SET " + _
        "ZZ_SCRATCH_PEOPLE.xy_count = [tmpXY].[CountOfx_coord];"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted

    Set gRstPeople = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
    gRstPeople.MoveLast

    If gRstPeople.RecordCount > 0 Then
         CmdGIS.Enabled = True
         CmdPajek.Enabled = True
         CmdUCINet.Enabled = True
         ChkIncludeID.Enabled = True
    Else
         CmdGIS.Enabled = False
         CmdPajek.Enabled = False
         CmdUCINet.Enabled = False
         ChkIncludeID.Enabled = False
    End If

Exit_CmdQuery_Click:

    ' restore the form tables
    Set ZZ_SOCIAL_NETWORK.Form.Recordset = CurrentDb.OpenRecordset("ZZ_SOCIAL_NETWORK", dbOpenDynaset)
    Set ZZ_SCRATCH_PEOPLE.Form.Recordset = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
    '
    Set cmdSQL = Nothing
    Exit Sub

Err_CmdQuery_Click:
    MsgBox Err.Description
    Resume Exit_CmdQuery_Click

End Sub
Private Sub Link1stOrder(tTable1Str As String, tTable2Str As String)
    Dim tQueryStr As String, tQueryWhereStr As String, tQueryFromStr As String
    Dim tFromStr As String, tToStr As String, tID1Str As String, tID2Str As String
    Dim cmdSQL As ADODB.Command, tRecDeleted As Long

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    ' get the index year constraints: these should be on the NODE rather than the first person
    '
    If gUseIndexYears Then
         '
         ' four possibilities
         '
         If gFromStr = "" And gToStr = "" Then
              tQueryWhereStr = "WHERE "
         ElseIf gFromStr = "" Then
              tQueryWhereStr = "WHERE ((ZABA.c_node_index_year)<=" + gToStr + ") AND "
         ElseIf gToStr = "" Then
              tQueryWhereStr = "WHERE ((ZABA.c_node_index_year)>=" + gFromStr + ") AND "
         Else
              tQueryWhereStr = "WHERE ((ZABA.c_node_index_year)<=" + gToStr + ") AND ((ZABA.c_node_index_year)>=" +
 gFromStr + ") AND "
         End If
    ElseIf gUseDynasties Then
         '
         ' five possibilities (all, just from, just to, both from and to, and a cluelessly unset parameter)
         ' The constraint looks at
         '
         If gFromDynasty = -2 Then
              tQueryWhereStr = "Where ((ZZZ_NONKIN_BIOG_ADDR.c_dy) > 0 ) AND "
         ElseIf gFromDynasty = -1 And gToDynasty > 0 Then
              tQueryWhereStr = "WHERE ((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") AND "
         ElseIf gFromDynasty > 0 And gToDynasty = -1 Then
              tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") AND "
         ElseIf gFromDynasty = gToDynasty And gFromDynasty > 0 Then
              tQueryWhereStr = "WHERE ((DYNASTIES.c_dy) = " + Str(gFromDynasty) + ") AND "
         ElseIf gFromDynasty > 0 And gToDynasty > 0 Then
              tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") AND " + _
                  "((DYNASTIES.c_start)<=" + Str(gToDynastyEnd) + ") AND "
         Else
              tQueryWhereStr = ""
         End If
    Else
         tQueryWhereStr = "WHERE "
    End If

      ' first add the target people (if CmdClearList is enabled, ImportList was successful)
      '
      If Not CmdClearList.Enabled Then
          '
          ' get the ID strings for the two people
          '
          Me.TxtID1.Visible = True
          Me.TxtID1.SetFocus
          tID1Str = Trim(Str(TxtID1.Value))
          Me.TxtID2.Visible = True
          Me.TxtID2.SetFocus
          tID2Str = Trim(Str(TxtID2.Value))
          Me.CmdQuery.SetFocus
          Me.TxtID1.Visible = False
          Me.TxtID2.Visible = False
      End If

      ' ZABA points to either ZZZ_KIN_BIOG_ADDR or ZZZ_NONKIN_BIOG_ADDR depending on the search type (kin or non-ki
n)

      tQueryStr = "INSERT INTO ZZ_SCRATCH_PAIR_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, " + _
          "c_female, c_addr_id, c_addr_name, c_addr_chn, c_addr_type, c_addr_desc, c_addr_desc_chn, " + _
          "x_coord, y_coord, c_node_dist ) " + _
          "SELECT DISTINCT ZABA_1.c_node_id, ZABA_1.c_node_name, " + _
          "ZABA_1.c_node_chn, ZABA_1.c_node_index_year, " + _
          "ZABA_1.c_node_female, ZABA_1.c_node_addr_id, " + _
          "ZABA_1.c_node_addr_name, ZABA_1.c_node_addr_chn, " + _
          "ZABA_1.c_node_addr_type, ZABA_1.c_node_addr_desc, " + _
          "ZABA_1.c_node_addr_desc_chn, ZABA_1.node_xcoord, " + _
          "ZABA_1.node_ycoord, 1 AS c_node_dist "


      If CmdClearList.Enabled Then
          tQueryWhereStr = tQueryWhereStr + "((ZABA_1.c_personid)>[ZABA].[c_personid]) AND (ZABA_1.c_node_id <> 999
9)"
      Else
        tQueryWhereStr = tQueryWhereStr + "((ZABA_1.c_personid)=" + tID2Str + " AND (ZABA.c_personid)=" + tID1Str
 + ") AND " + _
                   "(ZABA_1.c_node_id <> 9999)"
      End If

      '   one changes:   get the tables from the passed strings (either "KIN" or "NONKIN")

      If CmdClearList.Enabled Then
          If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
              tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZ_SCRATCH_IMPORT_PEOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 "
+ _
                  "INNER JOIN (ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN (ZZZ_" + tTable1Str + "_BIOG_ADDR AS ZABA " + _
                  "INNER JOIN ZZZ_" + tTable2Str + "_BIOG_ADDR AS ZABA_1 " + _
                  "ON ZABA.c_node_id = ZABA_1.c_node_id) " + _
                  "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c_personid) " + _
                  "ON ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZABA_1.c_personid) " + _
                  "ON DYNASTIES.c_dy = ZABA.c_node_dy "
              'tQueryFromStr = "FROM DYNASTIES INNER JOIN (DYNASTIES AS DYNASTIES_1 INNER JOIN (ZZ_SCRATCH_IMPORT_P
EOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 " + _
                  "INNER JOIN (ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN (ZZZ_" + tTable1Str + "_BIOG_ADDR AS ZABA " + _
                  "INNER JOIN ZZZ_" + tTable2Str + "_BIOG_ADDR AS ZABA_1 " + _
                  "ON ZABA.c_node_id = ZABA_1.c_node_id) " + _
                  "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c_personid) " + _
                  "ON ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZABA_1.c_personid) " + _
                  "ON DYNASTIES_1.c_dy = ZABA_1.c_dy) ON DYNASTIES.c_dy = ZABA.c_dy "
         Else
              tQueryFromStr = "FROM ZZ_SCRATCH_IMPORT_PEOPLE AS ZZ_SCRATCH_IMPORT_PEOPLE_1 " + _
                  "INNER JOIN (ZZ_SCRATCH_IMPORT_PEOPLE " + _
                  "INNER JOIN (ZZZ_" + tTable1Str + "_BIOG_ADDR AS ZABA " + _
                  "INNER JOIN ZZZ_" + tTable2Str + "_BIOG_ADDR AS ZABA_1 " + _
                  "ON ZABA.c_node_id = ZABA_1.c_node_id) " + _
                  "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c_personid) " + _
                  "ON ZZ_SCRATCH_IMPORT_PEOPLE_1.c_person_id = ZABA_1.c_personid "
         End If
    Else
         If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
              tQueryFromStr = "FROM DYNASTIES INNER JOIN (ZZZ_" + tTable1Str + "_BIOG_ADDR AS ZABA INNER JOIN ZZZ_"
 + tTable2Str + "_BIOG_ADDR AS ZABA_1 " + _
                  "ON ZABA.c_node_id = ZABA_1.c_node_id) " + _
                  "ON DYNASTIES.c_dy = ZABA.c_node_dy "
         Else
              tQueryFromStr = "FROM ZZZ_" + tTable1Str + "_BIOG_ADDR AS ZABA " + _
                  "INNER JOIN ZZZ_" + tTable2Str + "_BIOG_ADDR AS ZABA_1 " + _
                  "ON ZABA.c_node_id = ZABA_1.c_node_id "
         End If
    End If

      cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
      cmdSQL.Execute tRecDeleted
      '
      cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
      cmdSQL.Execute tRecDeleted
      '
      ' define the query for appending to ZZ_SCRATCH_PEOPLE without duplication
      '
      cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_PEOPLE SELECT ZZ_SCRATCH_PAIR_PEOPLE.* " + _
          "FROM ZZ_SCRATCH_PAIR_PEOPLE LEFT JOIN ZZ_SCRATCH_PEOPLE ON " + _
          "ZZ_SCRATCH_PAIR_PEOPLE.c_person_id = ZZ_SCRATCH_PEOPLE.c_person_id " + _
          "WHERE (((ZZ_SCRATCH_PEOPLE.c_person_id) Is Null))"
      '
      cmdSQL.Execute tRecDeleted

End Sub
Private Sub Link2ndOrder(tTable1Str As String, tTable2Str As String, tTable3Str As String)
    Dim tQueryStr As String, tQueryWhereStr As String, tQueryNodeWhereStr As String, tQueryFromStr As String, tQu
eryNodeFromStr As String
    Dim tFromStr As String, tToStr As String, tID1Str As String, tID2Str As String
    Dim cmdSQL As ADODB.Command, tRecDeleted As Long

      Set cmdSQL = New ADODB.Command
      cmdSQL.ActiveConnection = CurrentProject.Connection
      cmdSQL.CommandType = adCmdText

      'MsgBox "In Link2ndOrder"
      '
      ' get the index year constraints
      '
      If gUseIndexYears Then
          '
          ' four possibilities
          '
          If gFromStr = "" And gToStr = "" Then
              tQueryWhereStr = "WHERE "
              tQueryNodeWhereStr = "WHERE "
         ElseIf gFromStr = "" Then
              tQueryWhereStr = "WHERE ((ZABA.c_node_index_year)<=" + gToStr + ") " + _
                  "And (ZABA_1.c_node_index_year)<=" + gToStr + ") AND "
              tQueryNodeWhereStr = "WHERE ((ASSOC_2.c_node_index_year)<=" + gToStr + ") AND " + _
                  "((ASSOC_2.c_index_year)<=" + gToStr + ") AND "
         ElseIf gToStr = "" Then
              tQueryWhereStr = "WHERE ((ZABA.c_node_index_year)>=" + gFromStr + " " + _
                  "AND (ZABA_1.c_node_index_year)>=" + gFromStr + ") AND "
              tQueryNodeWhereStr = "WHERE ((ASSOC_2.c_node_index_year)>=" + gFromStr + ") And " + _
                  "((ASSOC_2.c_index_year)>=" + gFromStr + ") AND "
         Else
              tQueryWhereStr = "WHERE ((ZABA.c_node_index_year)>=" + gFromStr + " " + _
                  "And (ZABA.c_node_index_year)<=" + gToStr + ") " + _
                  "AND ((ZABA_1.c_node_index_year)>=" + gFromStr + " " + _
                  "And (ZABA_1.c_node_index_year)<=" + gToStr + ") AND "
              tQueryNodeWhereStr = "WHERE ((ASSOC_2.c_node_index_year)>=" + gFromStr + " And " + _
                  "(ASSOC_2.c_node_index_year)<=" + gToStr + ") AND " + _
                  "((ASSOC_2.c_index_year)>=" + gFromStr + " And " + _
                  "(ASSOC_2.c_index_year)<=" + gToStr + ") AND "
         End If

      ElseIf gUseDynasties Then
          '
          ' five possibilities (all, just from, just to, both from and to, and a cluelessly unset parameter)
          '
          ' for tQueryNodeWhere, DYNASTIES is linked to ASSOC_2.c_dy while DYNASTIES_1 is linked to ASSOC_2.c_node
_dy
         '
         If gFromDynasty = -2 Then
              tQueryWhereStr = "Where ((ZABA.c_node_dy) > 0 AND (ZABA_1.c_node_dy) > 0) AND "
              tQueryNodeWhereStr = "WHERE ((ASSOC_2.c_dy) > 0 AND (ASSOC_2.c_node_dy) > 0) AND "
         ElseIf gFromDynasty = -1 And gToDynasty > 0 Then
              tQueryWhereStr = "WHERE ((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + " AND (DYNASTIES_1.c_start)<" +
 Str(gToDynastyEnd) + ") AND "
              tQueryNodeWhereStr = "WHERE ((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + " AND (DYNASTIES_1.c_start)
<" + Str(gToDynastyEnd) + ") AND "
         ElseIf gFromDynasty > 0 And gToDynasty = -1 Then
              tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + " AND (DYNASTIES_1.c_end)>" +
 Str(gFromDynastyBegin) + ") AND "
              tQueryNodeWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + " AND (DYNASTIES_1.c_end)
>" + Str(gFromDynastyBegin) + ") AND "
         ElseIf gFromDynasty = gToDynasty And gFromDynasty > 0 Then
              tQueryWhereStr = "WHERE ((DYNASTIES.c_dy) = " + Str(gFromDynasty) + " AND (DYNASTIES_1.c_dy) = " + St
r(gFromDynasty) + ") AND "
              tQueryNodeWhereStr = "WHERE ((DYNASTIES.c_dy) = " + Str(gFromDynasty) + " AND (DYNASTIES_1.c_dy) = "
+ Str(gFromDynasty) + ") AND "
         ElseIf gFromDynasty > 0 And gToDynasty > 0 Then
              tQueryWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + " AND (DYNASTIES_1.c_end)>" +
 Str(gFromDynastyBegin) + ") AND " + _
                  "((DYNASTIES.c_start)<=" + Str(gToDynastyEnd) + " AND (DYNASTIES_1.c_start)<=" + Str(gToDynastyEn
d) + ") AND "
              tQueryNodeWhereStr = "WHERE ((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + " AND (DYNASTIES_1.c_end)
>" + Str(gFromDynastyBegin) + " AND " + _
                  "(DYNASTIES.c_start)<=" + Str(gToDynastyEnd) + " AND (DYNASTIES_1.c_start)<=" + Str(gToDynastyEnd
) + ") AND "
         Else
              tQueryWhereStr = "WHERE "
              tQueryNodeWhereStr = "WHERE "
         End If
    Else
         tQueryWhereStr = "WHERE "
         tQueryNodeWhereStr = "WHERE "
    End If

      If Not CmdClearList.Enabled Then
          '
          ' get the ID strings for the two people
          '
          Me.TxtID1.Visible = True
          Me.TxtID1.SetFocus
          tID1Str = Trim(Str(TxtID1.Value))
          Me.TxtID2.Visible = True
          Me.TxtID2.SetFocus
          tID2Str = Trim(Str(TxtID2.Value))
          Me.CmdQuery.SetFocus
          Me.TxtID1.Visible = False
          Me.TxtID2.Visible = False
      End If

    'MsgBox "Set parameters"

    '   the new logic is to get a list of all the connections of connections and then see which of
    '   those are linked to others in the IMPORT table

    '   The FROM statements change if DYNASTIES has to be linked in, so we
    '
    If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
        tQueryFromStr = "FROM DYNASTIES AS DYNASTIES_1 INNER JOIN (DYNASTIES INNER JOIN ((ZZ_SCRATCH_IMPORT_PEOPL
E " + _
            "INNER JOIN ZZZ_" + tTable1Str + "_BIOG_ADDR AS ZABA ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c
_personid) " + _
            "INNER JOIN ZZZ_" + tTable2Str + "_BIOG_ADDR AS ZABA_1 " + _
            "ON ZABA.c_node_id = ZABA_1.c_personid) " + _
            "ON DYNASTIES.c_dy = ZABA.c_dy) " + _
            "ON DYNASTIES_1.c_dy = ZABA_1.c_dy "

         tQueryNodeFromStr = "FROM DYNASTIES AS DYNASTIES_1 INNER JOIN (DYNASTIES " + _
             "INNER JOIN ((ZZZ_" + tTable1Str + "_BIOG_ADDR AS ASSOC_1 INNER JOIN ZZZ_" + tTable2Str + "_BIOG_ADDR
 AS ASSOC_2 " + _
             "ON ASSOC_1.c_node_id = ASSOC_2.c_personid) " + _
             "INNER JOIN ZZZ_" + tTable3Str + "_BIOG_ADDR AS ASSOC_3 " + _
             "ON ASSOC_2.c_node_id = ASSOC_3.c_node_id) " + _
             "ON DYNASTIES.c_dy = ASSOC_2.c_dy) " + _
             "ON DYNASTIES_1.c_dy = ASSOC_2.c_node_dy "
    Else
         tQueryFromStr = "FROM (ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ZZZ_" + tTable1Str + "_BIOG_ADDR AS ZABA " + _
             "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c_personid) " + _
             "INNER JOIN ZZZ_" + tTable2Str + "_BIOG_ADDR AS ZABA_1 ON " + _
             "ZABA.c_node_id = ZABA_1.c_personid "

        tQueryNodeFromStr = "FROM (ZZZ_" + tTable1Str + "_BIOG_ADDR AS ASSOC_1 INNER JOIN " + _
            "ZZZ_" + tTable2Str + "_BIOG_ADDR AS ASSOC_2 ON ASSOC_1.c_node_id = ASSOC_2.c_personid) " + _
            "INNER JOIN ZZZ_" + tTable3Str + "_BIOG_ADDR AS ASSOC_3 " + _
            "ON ASSOC_2.c_node_id = ASSOC_3.c_node_id "
    End If

    If CmdClearList.Enabled Then
        cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_NETWORK"
        cmdSQL.Execute tRecDeleted

         tQueryStr = "INSERT INTO zz_scratch_pair_network ( c_pid_1, c_pid_2, c_link_1, c_pid_3, c_link_2 ) " + _
             "SELECT DISTINCT ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id AS c_pid_1, " + _
             "ZABA.c_node_id AS c_pid_2, ZABA.c_link_code AS c_link_1, " + _
             "ZABA_1.c_node_id AS c_pid_3, ZABA_1.c_link_code AS c_link_2 "

         tQueryFromStr = "FROM (ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ZZZ_" + tTable1Str + "_BIOG_ADDR AS ZABA " + _
             "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZABA.c_personid) " + _
             "INNER JOIN ZZZ_" + tTable2Str + "_BIOG_ADDR AS ZABA_1 ON " + _
             "ZABA.c_node_id = ZABA_1.c_personid "

         tQueryWhereStr = tQueryWhereStr + "(((ZABA.c_node_id)<>9999) AND " + _
             "((ZABA_1.c_node_id)<>9999 And " + _
             "(ZABA_1.c_node_id)<>[ZZ_SCRATCH_IMPORT_PEOPLE].[c_person_id])) "

         'MsgBox "tQueryFromStr = " + tQueryFromStr
         'MsgBox "tQueryWhereStr = " + tQueryWhereStr

         cmdSQL.CommandText = tQueryStr + tQueryFromStr + tQueryWhereStr
         cmdSQL.Execute tRecDeleted

         '   Delete all those where c_pid_2 appears in ZZ_SCRATCH_IMPORT_PEOPLE

         cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN zz_scratch_pair_network ON " + _
             "ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = zz_scratch_pair_network.c_pid_2 " + _
             "SET zz_scratch_pair_network.c_delete = 1"
         cmdSQL.Execute tRecDeleted

         cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_NETWORK WHERE c_delete = 1"
         cmdSQL.Execute tRecDeleted

         '   then see how many of those work

        tQueryStr = "INSERT INTO ZZ_SCRATCH_PAIR_PEOPLE ( c_person_id, c_name_chn, c_name, c_index_year, c_dy, c_
dynasty, c_dynasty_chn, " + _
            "c_female, c_addr_id, c_addr_name, c_addr_chn, x_coord, y_coord, c_addr_type, c_addr_desc, " + _
            "c_addr_desc_chn, c_node_dist ) " + _
            "SELECT DISTINCT ZABA.c_personid, ZABA.c_person_name_chn, " + _
            "ZABA.c_person_name, ZABA.c_index_year, " + _
               "ZABA.c_dy, ZABA.c_dynasty, ZABA.c_dynasty_chn, " + _
               "ZABA.c_female, ZABA.c_addr_id, " + _
               "ZABA.c_addr_name, ZABA.c_addr_chn, " + _
               "ZABA.x_coord, ZABA.y_coord, " + _
               "ZABA.c_addr_type, ZABA.c_addr_desc, " + _
               "ZABA.c_addr_desc_chn, 2 AS c_node_dist " + _
               "FROM (zz_scratch_pair_network INNER JOIN ZZZ_" + tTable3Str + "_BIOG_ADDR AS ZABA " + _
               "ON zz_scratch_pair_network.c_pid_3 = ZABA.c_personid) " + _
               "INNER JOIN ZZ_SCRATCH_IMPORT_PEOPLE ON " + _
               "ZABA.c_node_id = ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id " + _
               "WHERE (((ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id)<>[zz_scratch_pair_network].[c_pid_1]))"

        cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
        cmdSQL.Execute tRecDeleted
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' define the query for appending to ZZ_SCRATCH_PEOPLE without duplication
        '
        cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_PEOPLE SELECT ZZ_SCRATCH_PAIR_PEOPLE.* " + _
            "FROM ZZ_SCRATCH_PAIR_PEOPLE LEFT JOIN ZZ_SCRATCH_PEOPLE ON " + _
            "ZZ_SCRATCH_PAIR_PEOPLE.c_person_id = ZZ_SCRATCH_PEOPLE.c_person_id " + _
            "WHERE (((ZZ_SCRATCH_PEOPLE.c_person_id) Is Null))"
        '
        cmdSQL.Execute tRecDeleted
        '
        ' now get the second person
        '
        tQueryStr = "INSERT INTO ZZ_SCRATCH_PAIR_PEOPLE ( c_person_id, c_name_chn, c_name, c_index_year, c_dy, c_
dynasty, c_dynasty_chn, " + _
            "c_female, c_addr_id, c_addr_name, c_addr_chn, x_coord, y_coord, c_addr_type, c_addr_desc, " + _
            "c_addr_desc_chn, c_node_dist ) " + _
            "SELECT DISTINCT ZZZ_BIOG_MAIN.c_personid, ZZZ_BIOG_MAIN.c_name_chn, " + _
            "ZZZ_BIOG_MAIN.c_name, ZZZ_BIOG_MAIN.c_index_year, ZZZ_BIOG_MAIN.c_dy, ZZZ_BIOG_MAIN.c_dynasty, ZZZ_B
IOG_MAIN.c_dynasty_chn, " + _
            "ZZZ_BIOG_MAIN.c_female, ZZZ_BIOG_MAIN.c_index_addr_id, ZZZ_BIOG_MAIN.c_index_addr_name, ZZZ_BIOG_MAI
N.c_index_addr_chn, " + _
            "ZZZ_BIOG_MAIN.x_coord, ZZZ_BIOG_MAIN.y_coord, ZZZ_BIOG_MAIN.c_index_addr_type_code, " + _
            "ZZZ_BIOG_MAIN.c_index_addr_type_desc, ZZZ_BIOG_MAIN.c_index_addr_type_chn, 2 AS c_node_dist " + _
            "FROM ZZZ_BIOG_MAIN INNER JOIN ((zz_scratch_pair_network INNER JOIN " + _
            "ZZZ_" + tTable3Str + "_BIOG_ADDR AS ZABA " + _
            "ON zz_scratch_pair_network.c_pid_3 = ZABA.c_personid) " + _
            "INNER JOIN ZZ_SCRATCH_IMPORT_PEOPLE ON " + _
            "ZABA.c_node_id = ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id) ON " + _
            "ZZZ_BIOG_MAIN.c_personid = zz_scratch_pair_network.c_pid_2 " + _
            "WHERE (((ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id)<>[zz_scratch_pair_network].[c_pid_1]))"

           cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
           cmdSQL.Execute tRecDeleted
           '
           cmdSQL.CommandText = tQueryStr
           cmdSQL.Execute tRecDeleted
           '
           ' define the query for appending to ZZ_SCRATCH_PEOPLE without duplication
           '
           cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_PEOPLE SELECT ZZ_SCRATCH_PAIR_PEOPLE.* " + _
               "FROM ZZ_SCRATCH_PAIR_PEOPLE LEFT JOIN ZZ_SCRATCH_PEOPLE ON " + _
               "ZZ_SCRATCH_PAIR_PEOPLE.c_person_id = ZZ_SCRATCH_PEOPLE.c_person_id " + _
               "WHERE (((ZZ_SCRATCH_PEOPLE.c_person_id) Is Null))"
           '
           cmdSQL.Execute tRecDeleted
    Else
        tQuery1stStr = "INSERT INTO ZZ_SCRATCH_PAIR_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, " + _
            "c_dy, c_dynasty, c_dynasty_chn, " + _
            "c_female, c_addr_id, c_addr_name, c_addr_chn, x_coord, y_coord, c_addr_type, " + _
            "c_addr_desc, c_addr_desc_chn, c_node_dist ) " + _
            "SELECT DISTINCT ASSOC_2.c_personid, ASSOC_2.c_person_name, ASSOC_2.c_person_name_chn, ASSOC_2.c_inde
x_year, " + _
            "ASSOC_2.c_dy, ASSOC_2.c_dynasty, ASSOC_2.c_dynasty_chn, " + _
            "ASSOC_2.c_female, ASSOC_2.c_addr_id, ASSOC_2.c_addr_name, " + _
            "ASSOC_2.c_addr_chn, ASSOC_2.x_coord, ASSOC_2.y_coord, ASSOC_2.c_addr_type, " + _
            "ASSOC_2.c_addr_desc, ASSOC_2.c_addr_desc_chn, 2 AS c_node_dist "

           tQuery2ndStr = "INSERT INTO ZZ_SCRATCH_PAIR_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, " + _
               "c_dy, c_dynasty, c_dynasty_chn, " + _
               "c_female, c_addr_id, c_addr_name, c_addr_chn, x_coord, y_coord, c_addr_type, " + _
               "c_addr_desc, c_addr_desc_chn, c_node_dist) " + _
               "SELECT DISTINCT ASSOC_2.c_node_id, ASSOC_2.c_node_name, ASSOC_2.c_node_chn, ASSOC_2.c_node_index_yea
r, " + _
              "ASSOC_2.c_node_dy, ASSOC_2.c_node_dynasty, ASSOC_2.c_node_dynasty_chn, " + _
              "ASSOC_2.c_node_female, ASSOC_2.c_node_addr_id, " + _
              "ASSOC_2.c_node_addr_name, ASSOC_2.c_node_addr_chn, ASSOC_2.node_xcoord, ASSOC_2.node_ycoord, " + _
              "ASSOC_2.c_node_addr_type, ASSOC_2.c_node_addr_desc, ASSOC_2.c_node_addr_desc_chn, " + _
              "2 AS c_node_dist "

          'tQueryNodeFromStr = "FROM (ZZZ_" + tTable1Str + "_BIOG_ADDR AS ASSOC_1 INNER JOIN " + _
              "ZZZ_" + tTable2Str + "_BIOG_ADDR AS ASSOC_2 ON ASSOC_1.c_node_id = ASSOC_2.c_personid) " + _
              "INNER JOIN ZZZ_" + tTable3Str + "_BIOG_ADDR AS ASSOC_3 " + _
              "ON ASSOC_2.c_node_id = ASSOC_3.c_node_id "

          tQueryNodeWhereStr = tQueryNodeWhereStr + "(((ASSOC_1.c_personid)=" + tID1Str + ") AND " + _
              "((ASSOC_2.c_personid)<>" + tID2Str + " And ASSOC_2.c_personid <> 9999 AND " + _
              "(ASSOC_2.c_personid)<>" + tID1Str + ") AND " + _
              "((ASSOC_2.c_node_id)<>" + tID2Str + " And ASSOC_2.c_node_id <> 9999 AND " + _
              "(ASSOC_2.c_node_id)<>" + tID1Str + ") AND " + _
              "((ASSOC_3.c_personid)=" + tID2Str + "))"

          'MsgBox "tQuery1stStr = " + tQuery1stStr
          'MsgBox "tQuery2ndStr = " + tQuery2ndStr
          'MsgBox "tQueryNodeFromStr = " + tQueryNodeFromStr
          'MsgBox "tQueryNodeWhereStr = " + tQueryNodeWhereStr

          ' get the first person

          cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
          cmdSQL.Execute tRecDeleted

          'MsgBox "Getting first person"
          '
          cmdSQL.CommandText = tQuery1stStr + tQueryNodeFromStr + tQueryNodeWhereStr
          cmdSQL.Execute tRecDeleted
          '
          ' define the query for appending to ZZ_SCRATCH_PEOPLE without duplication

          'MsgBox "Adding first person"
          '
          cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_PEOPLE SELECT ZZ_SCRATCH_PAIR_PEOPLE.* " + _
              "FROM ZZ_SCRATCH_PAIR_PEOPLE LEFT JOIN ZZ_SCRATCH_PEOPLE ON " + _
              "ZZ_SCRATCH_PAIR_PEOPLE.c_person_id = ZZ_SCRATCH_PEOPLE.c_person_id " + _
              "WHERE (((ZZ_SCRATCH_PEOPLE.c_person_id) Is Null))"
          '
          cmdSQL.Execute tRecDeleted

          ' get the second person

          'MsgBox "Getting second person"

          cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_PAIR_PEOPLE"
          cmdSQL.Execute tRecDeleted
          '
          cmdSQL.CommandText = tQuery2ndStr + tQueryNodeFromStr + tQueryNodeWhereStr
          cmdSQL.Execute tRecDeleted
          '
          ' define the query for appending to ZZ_SCRATCH_PEOPLE without duplication

        'MsgBox "Adding second person"
        '
        cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_PEOPLE SELECT ZZ_SCRATCH_PAIR_PEOPLE.* " + _
            "FROM ZZ_SCRATCH_PAIR_PEOPLE LEFT JOIN ZZ_SCRATCH_PEOPLE ON " + _
            "ZZ_SCRATCH_PAIR_PEOPLE.c_person_id = ZZ_SCRATCH_PEOPLE.c_person_id " + _
            "WHERE (((ZZ_SCRATCH_PEOPLE.c_person_id) Is Null))"
        '
        cmdSQL.Execute tRecDeleted
    End If
End Sub
Private Sub CmdHelp_Click()
    Dim tStrPDF As String

    tStrPDF = Application.CurrentProject.Path + "\HelpFiles\HelpFile_LookAtAssociationPairs.pdf"

    'MsgBox tStrPDF

    Application.FollowHyperlink tStrPDF, , True

End Sub

Private Sub writeKML()
    '
    ' This program will dump the results to a .gis file
     '
     If ZZ_SCRATCH_PEOPLE.Form.Recordset.RecordCount = 0 Then
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
     Dim tFileSystem, tGDF

     Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

     dlgSaveAs.InitialFileName = "network_gis_" + tCodeStr + ".kml"
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
                  tFileName = tFileName + ".txt"
              End If
         End If
         '
         ' write the file
         '
         'Name,NameChn,Female,IndexYear,AddrName,AddrChn,X,Y,xy_count,NodeDist
         '
         ' process the table
         '
         Set tRstNode = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
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
         tStream.WriteText tC + "<Style id=" + tDQ + "assoc-balloon-template" + tDQ + ">", adWriteLine
         tStream.WriteText tC + tC + "<BalloonStyle>", adWriteLine
         tStream.WriteText tC + tC + tC + "<text>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "<![CDATA[", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "ID: $[AssocGIS/PersonID] <br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "Name Chn: $[AssocGIS/NameHZ] <br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "Index Year: $[AssocGIS/IndexYear] <br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "Sex: $[AssocGIS/Sex] <br/>", adWriteLine
         tStream.WriteText tC + tC + tC + tC + "Address: $[AssocGIS/AddrName] $[AssocGIS/AddrHZ] <br/>", adWriteLi
ne
          tStream.WriteText tC + tC + tC + tC + "XY Count: $[AssocGIS/XYCount] <br/><br/>", adWriteLine
          tStream.WriteText tC + tC + tC + tC + "]]>", adWriteLine
          tStream.WriteText tC + tC + tC + "</text>", adWriteLine
          tStream.WriteText tC + tC + "</BalloonStyle>", adWriteLine
          tStream.WriteText tC + "</Style>", adWriteLine
          tStream.WriteText tC + "<!-- Declare the type " + tDQ + "AssocGIS" + tDQ + " with 8 fields -->", adWriteL
ine
        tStream.WriteText tC + "<Schema name=" + tDQ + "AssocGIS" + tDQ + " id=" + tDQ + "AssocGISId" + tDQ + ">"
, adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "uint" + tDQ + " name=" + tDQ + "PersonID" + tDQ
 + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Person ID]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "NameHZ" + tDQ
 + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Name Chn]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "Sex" + tDQ +
">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Sex]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "AddrName" + t
DQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Address]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "AddrHZ" + tDQ
 + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Address Chn]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "IndexYear" +
tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Index Year]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "int" + tDQ + " name=" + tDQ + "NodeDist" + tDQ
+ ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Node Distance]]></displayName>", adWriteLine
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
                       tStr = "[Bad Data] "
                  Else
                       tStr = !c_name
                  End If
                  tStream.WriteText tC + tC + "<name>" + tStr + "</name>", adWriteLine

                  tStream.WriteText tC + tC + "<styleUrl>#assoc-balloon-template</styleUrl>", adWriteLine
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
                  tStream.WriteText tC + tC + tC + "<SchemaData schemaUrl=" + tDQ + "#AssocGISId" + tDQ + ">", adWr
iteLine
                  '
                  ' person ID
                  '
                  tStr = Str(!c_person_id)
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
                ' Node Distance
                '
                If IsNull(!c_node_dist) Then
                     tStr = "0"
                Else
                     tStr = Str(!c_node_dist)
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "NodeDist" + tDQ + ">" + tStr +
 "</SimpleData>", adWriteLine
                '
                ' Sex
                '
                If !c_female Then
                     tStr = "F"
                Else
                     tStr = "M"
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "Sex" + tDQ + ">" + tStr + "</S
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
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "AddrHZ" + tDQ + ">" + tStr + "
</SimpleData>", adWriteLine
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

       tStrQuery = "INSERT INTO ZZ_STORE_PERSON_ID ( c_personid ) SELECT DISTINCT ZZ_SCRATCH_PEOPLE.c_person_id " +
_
              "FROM ZZ_SCRATCH_PEOPLE WHERE ZZ_SCRATCH_PEOPLE.c_person_id > 0"

       cmdSQL.CommandText = tStrQuery
       cmdSQL.Execute tRecCount
       MsgBox "Person IDs successfully stored.     Click on 'Recall Person IDs' to reuse these IDs in other forms."
       '
    ' update storage source
    cmdSQL.CommandText = "UPDATE PersonIDSource SET SourceForm ='AssocPairs' WHERE PersonIDSource.LineNum =1"
    cmdSQL.Execute tRecCount

End Sub
Private Sub CmdRecallID_Click()
On Error GoTo Err_CmdRecallID_Click
    Dim tStrSQL As String, tRst As DAO.Recordset

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    ' first things first, we need two people for the routine to work, so test if there are at least two stored ID
s

    If DCount("*", "ZZ_STORE_PERSON_ID") = 1 Then
        Set tRst = CurrentDb.OpenRecordset("SELECT ZZ_STORE_PERSON_ID.c_personid FROM ZZ_STORE_PERSON_ID")
        tRst.MoveFirst
        tID = tRst!c_personid
        Me.TxtID1 = tID

        Set tRst = CurrentDb.OpenRecordset("SELECT BIOG_MAIN.c_name, BIOG_MAIN.c_name_chn FROM BIOG_MAIN WHERE ((
(BIOG_MAIN.c_personid)=" + Str(tID) + "))")
        tRst.MoveFirst

        Me.TxtPerson1.Value = tRst!c_name
        Me.TxtPerson1Chn.Value = tRst!c_name_chn
        tRst.Close
        Set tRst = Nothing
        Exit Sub
    End If


    If DCount("*", "ZZ_SCRATCH_IMPORT_PEOPLE") > 0 Then
         ' Display message.
         If MsgBox("Do you wish to replace the current import list?", vbYesNo + vbQuestion + vbDefaultButton2) = v
bNo Then
              Exit Sub
         Else
              cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_IMPORT_PEOPLE"
              cmdSQL.Execute tRecCount
         End If
    End If
    '
    ' Clear the error table now that we are ready to go
    '
    cmdSQL.CommandText = "Delete * from InputErrorList"
    cmdSQL.Execute tRecDeleted
    '
    ' copy the IDs
    '
    tStrSQL = "INSERT INTO ZZ_SCRATCH_IMPORT_PEOPLE ( c_person_id ) SELECT DISTINCT c_personid FROM ZZ_STORE_PERS
ON_ID"

    cmdSQL.CommandText = tStrSQL
    cmdSQL.Execute tRecDeleted

    If tRecDeleted = 0 Then
        TxtPerson1.Value = "[Error]"
        TxtPerson1Chn.Value = "[Error]"
        TxtPerson2.Value = "[Error]"
        TxtPerson2Chn.Value = "[Error]"

           CmdQuery.Enabled = False
    Else
           TxtPerson1.Value = "[Recalled List]"
           TxtPerson1Chn.Value = "[Recalled List]"
           TxtPerson2.Value = "[Recalled List]"
           TxtPerson2Chn.Value = "[Recalled List]"

        CmdQuery.Enabled = True
        CmdImportList.Enabled = False
        CmdClearList.Enabled = True
        CmdPickPerson1.Enabled = False
        CmdPickPerson2.Enabled = False
    End If

    Set cmdSQL = Nothing
    Set tFileSystem = Nothing

Exit_CmdRecallID_Click:
    Exit Sub

Err_CmdRecallID_Click:
    MsgBox Err.Description
    Resume Exit_CmdRecallID_Click

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

    'MsgBox "gUseIndexYears = " + IIf(gUseIndexYears, "True", "False")

End Sub

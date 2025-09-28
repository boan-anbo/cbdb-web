Option Compare Database
' g stands for global
'
' half of these probably are now irrelevant since I reworked the code
'
Public gRstPersonID As DAO.Recordset, gCurPersonBookmark As Variant
Public gCurPersonID As Long, gCurPersonName As String, gCurPersonNameChn As String
Public gRstPeopleLookUp As DAO.Recordset, gRst As DAO.Recordset, gRstKinList As DAO.Recordset
Public gRstMourning As DAO.Recordset, gRstSimplify As DAO.Recordset
Public gRstRelConv As DAO.Recordset, gRstAddresses As DAO.Recordset, gRstBiogADDR As DAO.Recordset
Public gRstBiogAddrType As DAO.Recordset
Public gMaxUp As Integer, gMaxDown As Integer, gMaxCol As Integer
Public gMaxMarr As Integer, gJustAffine As Boolean, gMourningCircle As Boolean
Public gSaveName As String, gSaveNameChn As String, gSavePersonID As Long, gDisplayLanguage As String
Public gLCID As Integer
Public gRstNodeList As DAO.Recordset, gRstEdge As DAO.Recordset, gRstEdgeLookUp As DAO.Recordset
Public gGdf, gPriorSex As String, gPriorID As Long
Public gStream As ADODB.Stream, gRstImportPeople As DAO.Recordset
Public gCurRecallSource As String

Private Sub ChkMourning_Click()
    TxtUp.Enabled = Not TxtUp.Enabled
    TxtDown.Enabled = Not TxtDown.Enabled
    TxtCol.Enabled = Not TxtCol.Enabled
    TxtMarr.Enabled = Not TxtMarr.Enabled
End Sub

Private Sub ChkSImplify_Click()
    If Me.ChkSImplify.Value Then
        DoCmd.OpenForm "frmKinReductionWarning", , , , , acDialog
    End If
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
Private Sub CmdGIS_Click()
On Error GoTo Err_CmdGIS_Click
    Dim cmdSQL As ADODB.Command, tRecDeleted As Long
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
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
    If frmZZ_SCRATCH_KIN.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdGIS_Click
    End If
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tRstPeople As DAO.Recordset, tUseList As Boolean
    Dim tStr As String, tQueryStr As String, tC As String, ti As Integer
    Dim tFileSystem, tGDF

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

    dlgSaveAs.InitialFileName = "kin_gis.tab"
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

        ' now process the file

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

        tC = Chr(9) ' the tab

        '
        ' put the list of people into ZZ_SCRATCH_PLACE_PEOPLE
        '
        ' and calculate the xy_count
        '
        ' use four SQL calls
        '
        cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PLACE_PEOPLE"
        cmdSQL.Execute tRecDeleted
        '
        ' get PersonID
        '
        ' see if we include the ego-list
        '
        ' double-check to eliminate listed people, if necessary
        If ChkEgo.Value Then
             tQueryStr = "INSERT INTO ZZ_SCRATCH_PLACE_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, c_i
ndex_addr_id, c_index_addr_py, c_index_addr_hz, x_coord, y_coord ) " + _
                                 "SELECT DISTINCT ZZ_SCRATCH_KIN.c_person_id, ZZ_SCRATCH_KIN.c_name, ZZ_SCRATCH_KI
N.c_name_chn, ZZ_SCRATCH_KIN.c_index_year, " + _
                                 "ZZ_SCRATCH_KIN.c_addr_id, ZZ_SCRATCH_KIN.c_addr_name, ZZ_SCRATCH_KIN.c_addr_chn,
 ZZ_SCRATCH_KIN.x_coord, ZZ_SCRATCH_KIN.y_coord " + _
                                 "FROM ZZ_SCRATCH_IMPORT_PEOPLE RIGHT JOIN ZZ_SCRATCH_KIN ON ZZ_SCRATCH_IMPORT_PEO
PLE.c_person_id = ZZ_SCRATCH_KIN.c_person_id " + _
                                 "WHERE (((ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id) Is Null))"
        Else
             tQueryStr = "INSERT INTO ZZ_SCRATCH_PLACE_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, c_i
ndex_addr_id, c_index_addr_py, c_index_addr_hz, x_coord, y_coord ) " + _
                                 "SELECT DISTINCT ZZ_SCRATCH_KIN.c_person_id, ZZ_SCRATCH_KIN.c_name, ZZ_SCRATCH_KI
N.c_name_chn, ZZ_SCRATCH_KIN.c_index_year, " + _
                                 "ZZ_SCRATCH_KIN.c_addr_id, ZZ_SCRATCH_KIN.c_addr_name, ZZ_SCRATCH_KIN.c_addr_chn,
 ZZ_SCRATCH_KIN.x_coord, ZZ_SCRATCH_KIN.y_coord " + _
                                 "FROM ZZ_SCRATCH_KIN"
        End If

        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        ' add KinID
        '
        ' double-check to eliminate listed people, if necessary
        If ChkEgo.Value Then
             tQueryStr = "INSERT INTO ZZ_SCRATCH_PLACE_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, c_i
ndex_addr_id, c_index_addr_py, c_index_addr_hz, x_coord, y_coord ) " + _
                             "SELECT DISTINCT ZZ_SCRATCH_KIN.c_kin_id, ZZ_SCRATCH_KIN.c_kin_name, ZZ_SCRATCH_KIN.c
_kin_chn, ZZ_SCRATCH_KIN.c_kin_index_year, " + _
                             "ZZ_SCRATCH_KIN.c_kin_addr_id, ZZ_SCRATCH_KIN.c_kin_addr_name, ZZ_SCRATCH_KIN.c_kin_a
ddr_chn, ZZ_SCRATCH_KIN.kin_x_coord, " + _
                             "ZZ_SCRATCH_KIN.kin_y_coord " + _
                             "FROM ZZ_SCRATCH_IMPORT_PEOPLE RIGHT JOIN (ZZ_SCRATCH_KIN LEFT JOIN ZZ_SCRATCH_PLACE_
PEOPLE ON " + _
                             "ZZ_SCRATCH_KIN.c_kin_id = ZZ_SCRATCH_PLACE_PEOPLE.c_person_id) ON ZZ_SCRATCH_IMPORT_
PEOPLE.c_person_id = ZZ_SCRATCH_KIN.c_kin_id " + _
                             "WHERE (((ZZ_SCRATCH_PLACE_PEOPLE.c_person_id) Is Null) AND ((ZZ_SCRATCH_IMPORT_PEOPL
E.c_person_id) Is Null))"
        Else
             tQueryStr = "INSERT INTO ZZ_SCRATCH_PLACE_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, c_i
ndex_addr_id, c_index_addr_py, c_index_addr_hz, x_coord, y_coord ) " + _
                                 "SELECT DISTINCT ZZ_SCRATCH_KIN.c_kin_id, ZZ_SCRATCH_KIN.c_kin_name, ZZ_SCRATCH_
KIN.c_kin_chn, ZZ_SCRATCH_KIN.c_kin_index_year, " + _
                                 "ZZ_SCRATCH_KIN.c_kin_addr_id, ZZ_SCRATCH_KIN.c_kin_addr_name, ZZ_SCRATCH_KIN.c_k
in_addr_chn, " + _
                                 "ZZ_SCRATCH_KIN.kin_x_coord, ZZ_SCRATCH_KIN.kin_y_coord " + _
                                 "FROM ZZ_SCRATCH_KIN LEFT JOIN ZZ_SCRATCH_PLACE_PEOPLE ON ZZ_SCRATCH_KIN.c_kin_id
 = ZZ_SCRATCH_PLACE_PEOPLE.c_person_id " + _
                                 " WHERE (((ZZ_SCRATCH_PLACE_PEOPLE.c_person_id) Is Null))"
        End If

        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '

        cmdSQL.CommandText = "Delete * from tmpXY"
        cmdSQL.Execute tRecDeleted
        '
        tQueryStr = "INSERT INTO tmpXY ( x_coord, y_coord, CountOfx_coord, CountOfy_coord ) " + _
                        "SELECT ZZ_SCRATCH_PLACE_PEOPLE.x_coord, ZZ_SCRATCH_PLACE_PEOPLE.y_coord, Count(ZZ_SCRATC
H_PLACE_PEOPLE.x_coord) AS CountOfx_coord, " + _
                        "Count(ZZ_SCRATCH_PLACE_PEOPLE.y_coord) AS CountOfy_coord " + _
                        "FROM ZZ_SCRATCH_PLACE_PEOPLE " + _
                        "GROUP BY ZZ_SCRATCH_PLACE_PEOPLE.x_coord, ZZ_SCRATCH_PLACE_PEOPLE.y_coord"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
        '
        tQueryStr = "UPDATE tmpXY INNER JOIN ZZ_SCRATCH_PLACE_PEOPLE ON (tmpXY.y_coord = " + _
            "ZZ_SCRATCH_PLACE_PEOPLE.y_coord) AND (tmpXY.x_coord = ZZ_SCRATCH_PLACE_PEOPLE.x_coord) " + _
            "SET ZZ_SCRATCH_PLACE_PEOPLE.xy_count = [tmpXY].[CountOfx_coord];"

        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted

        Set tRstPeople = CurrentDb.OpenRecordset("ZZ_SCRATCH_PLACE_PEOPLE", dbOpenDynaset)
        '
        'If Left(TxtName.Value, 1) = "[" Then
        '     tStr = "SELECT KIN_QUERY.*, ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id " + _
        '         "FROM (SELECT DISTINCT ZZ_SCRATCH_KIN.c_kin_id, ZZ_SCRATCH_KIN.c_kin_name, ZZ_SCRATCH_KIN.c_kin_
chn, " + _
        '            "ZZ_SCRATCH_KIN.kin_x_coord, ZZ_SCRATCH_KIN.kin_y_coord, ZZ_SCRATCH_KIN.c_kin_addr_name, " +
_
        '             "ZZ_SCRATCH_KIN.c_kin_addr_chn, ZZ_SCRATCH_KIN.c_kin_addr_desc_chn, ZZ_SCRATCH_KIN.c_kin_ind
ex_year, " + _
        '             "ZZ_SCRATCH_KIN.c_kin_female, ZZ_SCRATCH_KIN.xy_count " + _
        '             "FROM ZZ_SCRATCH_KIN) AS KIN_QUERY " + _
        '         "LEFT JOIN ZZ_SCRATCH_IMPORT_PEOPLE " + _
        '         "ON KIN_QUERY.c_kin_id = ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id"
        '     Set tRstNode = CurrentDb.OpenRecordset(tStr, dbOpenDynaset)
        '     tUseList = True
        'Else
        '     Set tRstNode = frmZZ_SCRATCH_KIN.Form.Recordset
        '     tUseList = False
        'End If

        With tRstPeople
            '
            ' write the header
            '
            tStr = "Name" + tC + "NameChn" + tC + "IndexYear" + tC + "Sex" + tC + _
                "AddrName" + tC + "AddrChn" + tC + "X" + tC + "Y" + tC + "XY_count"
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

                   If IsNull(!c_index_year) Then
                        tStr = tStr + "-2000" + tC
                   Else
                        tStr = tStr + Str(!c_index_year) + tC
                   End If

                   If !c_female Then
                        tStr = tStr + "F" + tC
                   Else
                        tStr = tStr + "M" + tC
                   End If

                   If IsNull(!c_index_addr_py) Then
                        tStr = tStr + "[?]" + tC
                   ElseIf Trim(!c_index_addr_py) = "" Then
                        tStr = tStr + "[?]" + tC
                   Else
                        tStr = tStr + !c_index_addr_py + tC
                   End If

                   If IsNull(!c_index_addr_hz) Then
                        tStr = tStr + "[?]" + tC
                   ElseIf Trim(!c_index_addr_hz) = "" Then
                        tStr = tStr + "[?]" + tC
                   Else
                        tStr = tStr + !c_index_addr_hz + tC
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
        Set tRstPeople = Nothing

           tStream.Close
           Set tStream = Nothing
           '
           cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PLACE_PEOPLE"
           cmdSQL.Execute tRecDeleted
           '
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
    If frmZZ_SCRATCH_KIN.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdGUESS_Click
    End If
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer, tFileName As String, tFN As Variant
    Dim tRstNode As DAO.Recordset, tRstEdge As DAO.Recordset
    Dim tStr As String, tC As String, ti As Integer, tUseList As Boolean
    Dim tColor(50) As String, tMetricSum As Integer, tQueryStr As String, tPersonID As Long
    Dim gStream As ADODB.Stream, tCodeStr As String
    'Dim tFileSystem, tGDF

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

     'Use a With...End With block to reference the FileDialog object.
     With dlgSaveAs
         .InitialFileName = "kin_" + tCodeStr + ".gdf"
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
             Else
                  ' make sure the file name has a txt extension
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
             '
             ' we have a file name: now open the stream for writing

               gStream.Mode = adModeReadWrite
               gStream.Type = adTypeText
               gStream.Open

               ' define the colors for the edges
               '
               tColor(1) = "black"
               tColor(2) = "blue"
               tColor(3) = "green"
               tColor(4) = "yellow"
               tColor(5) = "orange"
               For ti = 6 To 20
                    tColor(ti) = "red"
               Next

               'MsgBox "Preparing temp tables 1"
               '
               ' prepare the temp table for the edge data

               Dim cmdSQL As ADODB.Command
               Set cmdSQL = New ADODB.Command
               cmdSQL.ActiveConnection = CurrentProject.Connection
               cmdSQL.CommandType = adCmdText

               cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_KINNET_EDGE"
               cmdSQL.Execute tRecDeleted
               '
               ' copy the data for determining edges
               '
               tQueryStr = "INSERT INTO ZZ_SCRATCH_KINNET_EDGE SELECT ZZ_SCRATCH_KINNET.* FROM ZZ_SCRATCH_KINNET " +
 _
                           "WHERE (((ZZ_SCRATCH_KINNET.c_kin_rel)<>'ego'))"
               '
               cmdSQL.CommandText = tQueryStr
               cmdSQL.Execute tRecDeleted
               '
               ' now delete the unneeded edges
               '
               tQueryStr = "UPDATE (ZZ_SCRATCH_KINNET_EDGE INNER JOIN ZZ_SCRATCH_KINNET_EDGE AS " + _
                   "ZZ_SCRATCH_KINNET_EDGE_1 ON ZZ_SCRATCH_KINNET_EDGE.c_person_id = ZZ_SCRATCH_KINNET_EDGE_1.c_pers
on_id) " + _
                   "INNER JOIN ZZ_SCRATCH_KINNET_EDGE AS ZZ_SCRATCH_KINNET_EDGE_2 ON " + _
                   "(ZZ_SCRATCH_KINNET_EDGE_1.c_kin_id = ZZ_SCRATCH_KINNET_EDGE_2.c_person_id) AND " + _
                "(ZZ_SCRATCH_KINNET_EDGE.c_kin_id = ZZ_SCRATCH_KINNET_EDGE_2.c_kin_id) " + _
                "SET ZZ_SCRATCH_KINNET_EDGE.c_delete = 1 " + _
                "WHERE (((ZZ_SCRATCH_KINNET_EDGE.c_upstep)=[ZZ_SCRATCH_KINNET_EDGE_1].[c_upstep]+ " + _
                "[ZZ_SCRATCH_KINNET_EDGE_2].[c_upstep]) AND ((ZZ_SCRATCH_KINNET_EDGE.c_dwnstep)=" + _
                "[ZZ_SCRATCH_KINNET_EDGE_1].[c_dwnstep]+[ZZ_SCRATCH_KINNET_EDGE_2].[c_dwnstep]) AND " + _
                "((ZZ_SCRATCH_KINNET_EDGE.c_marstep)=[ZZ_SCRATCH_KINNET_EDGE_1].[c_marstep]+" + _
                "[ZZ_SCRATCH_KINNET_EDGE_2].[c_marstep]) AND ((ZZ_SCRATCH_KINNET_EDGE.c_colstep)=" + _
                "[ZZ_SCRATCH_KINNET_EDGE_1].[c_colstep]+[ZZ_SCRATCH_KINNET_EDGE_2].[c_colstep])AND " + _
                "((ZZ_SCRATCH_KINNET_EDGE.c_person_id)<>[ZZ_SCRATCH_KINNET_EDGE_1].[c_kin_id]))"
            '
            'MsgBox "About to prune"
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_KINNET_EDGE WHERE c_delete = 1"
            cmdSQL.Execute tRecDeleted
            'MsgBox "Pruning complete"
            '
            ' now collect the node information
            '
            'MsgBox "Preparing temp tables 2"
            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_GEPHI_NODE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_GEPHI_NODE_DISTINCT"
            cmdSQL.Execute tRecDeleted
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_GEPHI_NODE ( c_person_id, c_name, c_name_chn, c_index_year, c_fem
ale, c_addr_id, c_addr_name, c_addr_chn, " + _
                "x_coord, y_coord, c_dy, c_dynasty, c_dynasty_chn) " + _
                "SELECT ZZ_SCRATCH_KINNET_EDGE.c_person_id, ZZ_SCRATCH_KINNET_EDGE.c_name, ZZ_SCRATCH_KINNET_EDGE
.c_name_chn, " + _
                "ZZ_SCRATCH_KINNET_EDGE.c_index_year, ZZ_SCRATCH_KINNET_EDGE.c_female, ZZ_SCRATCH_KINNET_EDGE.c_a
ddr_id, ZZ_SCRATCH_KINNET_EDGE.c_addr_name, " + _
                "ZZ_SCRATCH_KINNET_EDGE.c_addr_chn, ZZ_SCRATCH_KINNET_EDGE.x_coord, ZZ_SCRATCH_KINNET_EDGE.y_coor
d, " + _
                "ZZ_SCRATCH_KINNET_EDGE.c_dy, ZZ_SCRATCH_KINNET_EDGE.c_dynasty, ZZ_SCRATCH_KINNET_EDGE.c_dynasty_
chn " + _
                "FROM ZZ_SCRATCH_KINNET_EDGE"
            '
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_GEPHI_NODE ( c_person_id, c_name, c_name_chn, c_index_year, c_fem
ale, c_addr_id, c_addr_name, c_addr_chn, " + _
                "x_coord, y_coord, c_dy, c_dynasty, c_dynasty_chn) " + _
                "SELECT ZZ_SCRATCH_KINNET_EDGE.c_kin_id, ZZ_SCRATCH_KINNET_EDGE.c_kin_name, ZZ_SCRATCH_KINNET_EDG
E.c_kin_chn, " + _
                "ZZ_SCRATCH_KINNET_EDGE.c_kin_index_year, ZZ_SCRATCH_KINNET_EDGE.c_kin_female, ZZ_SCRATCH_KINNET_
EDGE.c_kin_addr_id, ZZ_SCRATCH_KINNET_EDGE.c_kin_addr_name, " + _
                "ZZ_SCRATCH_KINNET_EDGE.c_kin_addr_chn, ZZ_SCRATCH_KINNET_EDGE.kin_x_coord, ZZ_SCRATCH_KINNET_EDG
E.kin_y_coord, " + _
                "ZZ_SCRATCH_KINNET_EDGE.c_kin_dy, ZZ_SCRATCH_KINNET_EDGE.c_kin_dynasty, ZZ_SCRATCH_KINNET_EDGE.c_
kin_dynasty_chn " + _
                "FROM ZZ_SCRATCH_KINNET_EDGE"

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            ' append the results
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_GEPHI_NODE_DISTINCT ( c_person_id, c_name, c_name_chn, c_index_ye
ar, c_female, c_imported, c_addr_id, c_addr_name, c_addr_chn, " + _
                "x_coord, y_coord, c_dy, c_dynasty, c_dynasty_chn) " + _
                "SELECT DISTINCT ZZ_SCRATCH_GEPHI_NODE.c_person_id, ZZ_SCRATCH_GEPHI_NODE.c_name, ZZ_SCRATCH_GEPH
I_NODE.c_name_chn, " + _
                "ZZ_SCRATCH_GEPHI_NODE.c_index_year, ZZ_SCRATCH_GEPHI_NODE.c_female, FALSE AS c_imported, " + _
                "ZZ_SCRATCH_GEPHI_NODE.c_addr_id, ZZ_SCRATCH_GEPHI_NODE.c_addr_name, ZZ_SCRATCH_GEPHI_NODE.c_addr
_chn, ZZ_SCRATCH_GEPHI_NODE.x_coord, " + _
                "ZZ_SCRATCH_GEPHI_NODE.y_coord, ZZ_SCRATCH_GEPHI_NODE.c_dy, ZZ_SCRATCH_GEPHI_NODE.c_dynasty, ZZ_S
CRATCH_GEPHI_NODE.c_dynasty_chn " + _
                "FROM ZZ_SCRATCH_GEPHI_NODE"

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            ' if the original IDs come from a list, mark the list people
            '
            tQueryStr = "UPDATE ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ZZ_SCRATCH_GEPHI_NODE_DISTINCT " + _
                "ON ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZZ_SCRATCH_GEPHI_NODE_DISTINCT.c_person_id " + _
                "SET ZZ_SCRATCH_GEPHI_NODE_DISTINCT.c_imported = True"

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            Set tRstEdge = CurrentDb.OpenRecordset("ZZ_SCRATCH_KINNET_EDGE", dbOpenDynaset)
            Set tRstNode = CurrentDb.OpenRecordset("ZZ_SCRATCH_GEPHI_NODE_DISTINCT", dbOpenDynaset)
            tRstNode.MoveLast
            '
            ' process the two tables
            '
            tC = Chr(44) ' the comma
            '
            ' first the nodes: define the record structure
            '
            ' if the file is strictly ASCII, the label is the pinyin, but if there are characters, then we add a
 pinyin field
            If tCodeStr = "ascii" Then
                 tStr = "nodedef> name VARCHAR" + tC + "color VARCHAR" + tC + "label VARCHAR" + tC + "labelvisible
 BOOLEAN" + _
                     tC + "style INT" + tC + "indexyear INT" + tC + "sex VARCHAR(1)" + tC + "addr_name VARCHAR" +
tC + _
                     "latitude DOUBLE" + tC + "longitude DOUBLE" + tC + "DynastyCode INT" + tC + "dynasty VARCHAR"
            Else
                 tStr = "nodedef> name VARCHAR" + tC + "color VARCHAR" + tC + "label VARCHAR" + tC + "labelvisible
 BOOLEAN" + _
                     tC + "style INT" + tC + "pinyin VARCHAR(50)" + tC + "indexyear INT" + tC + "sex VARCHAR(1)" +
 tC + "addr_name VARCHAR" + tC + "addr_chn VARCHAR" + tC + _
                     "latitude DOUBLE" + tC + "longitude DOUBLE" + tC + "DynastyCode INT" + tC + "dynasty VARCHAR"
 + tC + "dynasty_chn VARCHAR"
            End If
            gStream.WriteText tStr, adWriteLine
            'tGDF.WriteLine (tStr)
            '
            'MsgBox "processing tables"
            With tRstNode
                 .MoveFirst
                 Do While Not .EOF
                     ' name = the ID of the person
                     tStr = Trim(Str(!c_person_id)) + tC
                     '
                     ' color
                     If !c_imported Then
                          tStr = tStr + "Red" + tC
                     Else
                          tStr = tStr + "Blue" + tC
                     End If
                     '
                     ' label
                     If tCodeStr = "ascii" Then
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

                    ' pinyin = c_name (if using characters)
                    If Not (tCodeStr = "ascii") Then
                         tStr = tStr + !c_name + tC
                    End If
                    '
                    ' indexyear = c_index_year INT
                    If IsNull(!c_index_year) Then
                         tStr = tStr + "-2000" + tC
                    Else
                         tStr = tStr + Trim(Str(!c_index_year)) + tC
                    End If

                    '   sex = c_female > (F,M)
                    tStr = tStr + IIf(!c_female, "F", "M") + tC

                    '    address name
                    If tCodeStr = "ascii" Then
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
                         tStr = tStr + "0.0" + tC
                    Else
                         tStr = tStr + Str(!x_coord) + tC
                    End If
                    '
                    ' dynasty information
                    '
                    If tCodeStr = "ascii" Then
                         If IsNull(!c_dynasty) Then
                              tStr = tStr + "0" + tC
                         Else
                              tStr = tStr + Str(!c_dy) + tC + !c_dynasty
                         End If
                    Else
                         If Not IsNull(!c_dynasty) Then
                              tStr = tStr + Str(!c_dy) + tC + !c_dynasty + tC + !c_dynasty_chn
                         End If
                    End If
                    gStream.WriteText tStr, adWriteLine
                    'tGDF.WriteLine (tStr)
                    .MoveNext
                Loop
            End With
            '
            ' now the edges: define the record structure
            tStr = "edgedef> node1" + tC + "node2" + tC + "color" + tC + "label"
            gStream.WriteText tStr, adWriteLine
            'tGDF.WriteLine (tStr)

            With tRstEdge
                .MoveFirst
                Do While Not .EOF
                    tStr = Trim(Str(!c_person_id)) + tC
                    '   node1 = str(c_person_id) for node1
                    tStr = tStr + Trim(Str(!c_kin_id)) + tC
                    '   node2 = str(c_node_id) for node2
                    '
                    ' add all the metrics together
                    tMetricSum = !c_marstep + !c_upstep + !c_dwnstep + !c_colstep
                    tStr = tStr + tColor(tMetricSum + 1) + tC
                    ' color = white (1), blue (2), green (3), yellow (4), orange (5)

                    If IsNull(!c_kin_rel) Then
                         tStr = tStr + tC
                    Else
                         tStr = tStr + !c_kin_rel + tC
                    End If
                    '    label = c_kin_rel
                    '
                    gStream.WriteText tStr, adWriteLine
                         'tGDF.WriteLine (tStr)
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
                 Set gStream = Nothing
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

Exit_CmdGUESS_Click:
    Exit Sub

Err_CmdGUESS_Click:
    MsgBox Err.Description
    Resume Exit_CmdGUESS_Click

End Sub

Private Sub CmdImport_Click()
On Error GoTo Err_CmdImport_Click
    Dim cmdSQL As ADODB.Command
    Dim tStrQuestion As String, tQuit As Boolean

    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tFileSystem, tList

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    tQuit = False
    '
    If Not tQuit Then
        '
        ' open the list

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
               tStrSQL = "INSERT INTO ZZ_SCRATCH_IMPORT_PEOPLE ( c_person_id ) SELECT DISTINCT TempImportList.Import
ID " + _
                   "FROM BIOG_MAIN INNER JOIN TempImportList ON BIOG_MAIN.c_personid = TempImportList.ImportID"

               cmdSQL.CommandText = tStrSQL
               cmdSQL.Execute tRecDeleted

               If tRecDeleted = 0 Then
                    TxtName.Value = "[Error]"
                    TxtNameChn.Value = "[Error]"
                    CmdRun.Enabled = False
               Else
                    TxtName.Value = "[Imported List]"
                    TxtNameChn.Value = "[Imported List]"
                    CmdRun.Enabled = True
               End If
               gCurRecallSource = ""
               Set cmdSQL = Nothing
               Set tFileSystem = Nothing
           End If

    End If

Exit_CmdImport_Click:
    Exit Sub

Err_CmdImport_Click:
    MsgBox Err.Description
    Resume Exit_CmdImport_Click

End Sub

Private Sub CmdNeo4j_Click()
    Call saveNeo4jFiles
End Sub

Private Sub CmdRun_Click()
On Error GoTo Err_CmdRun_Click

    Dim tTrue As Integer, tFalse As Integer, tLoopCount As Long, tErrorStr As String
    Dim tContinue As Integer, tAddrID As Long, tExitDo As Boolean, tRecCount As Long, tRecDelete As Long
    Dim tRstDummy As DAO.Recordset, tAppendQuery As QueryDef
    Dim tSeekStr As String, tLoopMax As Long, tLoopInfoStr As String, tKinQueryStr As String, tQueryStr As String
    Dim tNodeDistQueryStr As String, tPruneTmpQueryDupesStr As String, tPruneTmpQuery As String
    Dim tPruneInversesQueryStr1 As String, tPruneTmpInversesQueryStr1 As String, tPruneInversesQueryStr2 As Strin
g, tAppendQueryStr As String, tPruneTmpInversesQueryStr2 As String
    Dim tKinFirstQueryStr As String, tPruneTmpQueryDupesStr2 As String, tPruneTmpQuery2 As String
    tTrue = -1
    tFalse = 0

    tLoopMax = TxtMaxLoop.Value
    gMaxUp = TxtUp.Value
    gMaxDown = TxtDown.Value
    gMaxCol = TxtCol.Value
    gMaxMarr = TxtMarr.Value
    gMourningCircle = ChkMourning.Value

    ' If this is a mourning circle search, set the max constraints

    If gMourningCircle Then
        gMaxUp = 4
        gMaxDown = 4
        gMaxCol = 1
        gMaxMarr = 2
    End If
    '
    Dim KinQuery As DAO.QueryDef
    Dim prm As DAO.Parameter
    Dim cmdSQL As ADODB.Command, tRecDeleted As Long, strSQL As String
    '
    ' Clear the tables
    '
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    ' clear the working files
    '
    cmdSQL.CommandText = "Delete * from ZZ_KIN_LIST"
    cmdSQL.Execute tRecCount
    '
    cmdSQL.CommandText = "Delete * from ZZ_KIN_LIST_TMP"
    cmdSQL.Execute tRecCount
    '
    ' close ZZ_SCRATCH_KIN
    '
    Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_KIN", dbOpenDynaset)
    '
    Set gRstPersonID = frmZZ_SCRATCH_KIN.Form.Recordset
    Set frmZZ_SCRATCH_KIN.Form.Recordset = tRstDummy
    gRstPersonID.Close
    '
    ' now zap the ego-relative form person file
    '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_KIN"
    cmdSQL.Execute tRecCount
    '
    ' repeat for ZZ_SCRATCH_KINNET, the kinship form file
    '
    Set gRstKinList = frmZZ_SCRATCH_KINNET.Form.Recordset
    Set frmZZ_SCRATCH_KINNET.Form.Recordset = tRstDummy
    gRstKinList.Close

    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_KINNET"
    cmdSQL.Execute tRecDeleted

    Set tRstDummy = Nothing
    '
    ' initialize the public recordsets to be used by the process_record routine
    '
    ' ZZ_KIN_CONV needs to be opened as a table in order to use the indices
    '
    'Set gRstRelConv = CurrentDb.OpenRecordset("ZZ_KINREL_CONV", dbOpenTable)
    '
    ' Set the index
    'gRstRelConv.Index = "REL_CONV"

    '
    ' this copies the people on the import list (which is just the selected person if one does not use a list)
    '
    tQueryStr = "INSERT INTO ZZ_KIN_LIST ( c_personid, c_kin_id, c_kinrel, c_kinrel_total, c_kinrel_total_raw, c_
kinrel_total_simplified, " + _
        "c_kin_code, c_up_total, c_down_total, c_mar_total, c_col_total, c_distance, c_up, c_down, c_mar, c_col,
" + _
        "c_prior_female, c_kin_female, c_kin_sex, c_female, c_sex, c_personid_root ) " + _
        "SELECT ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id, ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id AS c_kin_id, " + _
            "'ego' AS c_kin_rel, 'ego' AS c_kin_rel_total, 'ego' AS c_kin_rel_total_raw, 'ego' AS c_kin_rel_total
_simplified, -3 AS c_kin_code, " + _
            "0 AS c_up_total, 0 AS c_down_total, 0 AS c_mar_total, 0 AS c_col_total, 0 AS c_distance, " + _
            "0 AS c_up, 0 AS c_down, 0 AS c_mar, 0 AS c_col, ZZZ_BIOG_MAIN.c_female AS c_prior_female, ZZZ_BIOG_M
AIN.c_female AS c_kin_female, " + _
            "iif(ZZZ_BIOG_MAIN.c_female,'F','M'), ZZZ_BIOG_MAIN.c_female, iif(ZZZ_BIOG_MAIN.c_female,'F','M'), ZZ
_SCRATCH_IMPORT_PEOPLE.c_person_id AS c_personid_root " + _
        "FROM ZZZ_BIOG_MAIN INNER JOIN ZZ_SCRATCH_IMPORT_PEOPLE ON ZZZ_BIOG_MAIN.c_personid = ZZ_SCRATCH_IMPORT_P
EOPLE.c_person_id"

    ' the initial list of "ego" roots is now intialized in ZZ_KIN_LIST, and the personID is stored as c_personid_
root: use this to create ZZ_KIN_LIST_TMP
    ' in the first query, one begins to build out with a first layer of kinship relations
    ' as the first layer, we put the kin_rel as both the kin_rel and the kin_rel_total

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecCount

    ' the new logic is to not test the metrics until after the reduction routine is run

     tKinFirstQueryStr = "INSERT INTO ZZ_KIN_LIST_TMP ( c_personid, c_kin_id, c_kinrel, c_kinrel_total, " + _
         "c_kinrel_total_raw, c_kinrel_total_simplified, c_kin_code, c_up_total, c_down_total, c_mar_total, c_col_
total, c_distance, " + _
         "c_up, c_down, c_mar, c_col, c_personid_root, c_prior_female, c_kin_female, c_kin_sex, c_female, c_sex, c
_notes, " + _
         "c_source, c_source_text_chn, c_source_text ) " + _
         "SELECT DISTINCT ZZZ_KIN_BIOG_ADDR.c_personid, ZZZ_KIN_BIOG_ADDR.c_node_id, ZZZ_KIN_BIOG_ADDR.c_link_desc
, " + _
             "KINSHIP_CODES.c_kinrel_simplified AS c_kinrel_total, ZZZ_KIN_BIOG_ADDR.c_link_desc AS c_kinrel_total
_raw, " + _
             "KINSHIP_CODES.c_kinrel_simplified AS c_kinrel_total_simplified, " + _
             "ZZZ_KIN_BIOG_ADDR.c_link_code, ZZZ_KIN_BIOG_ADDR.c_upstep AS c_up_total, ZZZ_KIN_BIOG_ADDR.c_dwnstep
 AS c_down_total, " + _
             "ZZZ_KIN_BIOG_ADDR.c_marstep AS c_mar_total, ZZZ_KIN_BIOG_ADDR.c_colstep AS c_col_total, 0 AS c_dista
nce, " + _
             "ZZZ_KIN_BIOG_ADDR.c_upstep, ZZZ_KIN_BIOG_ADDR.c_dwnstep, ZZZ_KIN_BIOG_ADDR.c_marstep, ZZZ_KIN_BIOG_A
DDR.c_colstep, " + _
             "ZZ_KIN_LIST.c_personid_root, ZZ_KIN_LIST.c_female AS c_prior_female, ZZZ_KIN_BIOG_ADDR.c_node_female
, iif(ZZZ_KIN_BIOG_ADDR.c_node_female,'F','M'), " + _
             "ZZZ_KIN_BIOG_ADDR.c_female, iif(ZZZ_KIN_BIOG_ADDR.c_female,'F','M'), " + _
             "'Notes: ' + ZZZ_KIN_BIOG_ADDR.c_person_name_chn + ' > ' + ZZZ_KIN_BIOG_ADDR.c_node_chn + ' (' + ZZZ_
KIN_BIOG_ADDR.c_link_desc + ') ' AS c_notes, " + _
             "ZZZ_KIN_BIOG_ADDR.c_source, ZZZ_KIN_BIOG_ADDR.c_title_chn, ZZZ_KIN_BIOG_ADDR.c_title " + _
         "FROM (ZZZ_KIN_BIOG_ADDR INNER JOIN ZZ_KIN_LIST ON ZZZ_KIN_BIOG_ADDR.c_personid = ZZ_KIN_LIST.c_kin_id) "
 + _
             "INNER JOIN KINSHIP_CODES ON ZZZ_KIN_BIOG_ADDR.c_link_code = KINSHIP_CODES.c_kincode"

    ' each subsequent layer adds the new kin_rel to the kin_rel_total and the total cumulative steps are summed

      tKinQueryStr = "INSERT INTO ZZ_KIN_LIST_TMP ( c_personid, c_kin_id, c_kinrel, c_kinrel_total_simplified, c_ki
nrel_total, " + _
          "c_kinrel_total_raw, c_kin_code, c_up_total, c_down_total, c_mar_total, c_col_total, c_distance, " + _
          "c_up, c_down, c_mar, c_col, c_personid_root, c_prior_female, c_kin_female, c_kin_sex, c_female, c_sex, c
_notes, " + _
          "c_source, c_source_text_chn, c_source_text) " + _
          "SELECT DISTINCT ZZZ_KIN_BIOG_ADDR.c_personid, ZZZ_KIN_BIOG_ADDR.c_node_id, ZZZ_KIN_BIOG_ADDR.c_link_desc
, " + _
              "[ZZ_KIN_LIST].[c_kinrel_total_simplified]+[KINSHIP_CODES].[c_kinrel_simplified] AS c_kinrel_total_si
mplified, " + _
              "[ZZ_KIN_LIST].[c_kinrel_total]+[KINSHIP_CODES].[c_kinrel_simplified] AS c_kinrel_total, " + _
              "ZZ_KIN_LIST.c_kinrel_total_raw+ZZZ_KIN_BIOG_ADDR.c_link_desc AS c_kinrel_total_raw, " + _
              "ZZZ_KIN_BIOG_ADDR.c_link_code, ZZZ_KIN_BIOG_ADDR.c_upstep+ZZ_KIN_LIST.c_up_total AS c_up_total, " +
_
              "ZZZ_KIN_BIOG_ADDR.c_dwnstep+ZZ_KIN_LIST.c_down_total AS c_down_total, " + _
              "ZZZ_KIN_BIOG_ADDR.c_marstep+ZZ_KIN_LIST.c_mar_total AS c_mar_total, " + _
              "ZZZ_KIN_BIOG_ADDR.c_colstep+ZZ_KIN_LIST.c_col_total AS c_col_total, " + _
              "ZZ_KIN_LIST.c_distance, ZZZ_KIN_BIOG_ADDR.c_upstep, ZZZ_KIN_BIOG_ADDR.c_dwnstep, ZZZ_KIN_BIOG_ADDR.c
_marstep, ZZZ_KIN_BIOG_ADDR.c_colstep, " + _
              "ZZ_KIN_LIST.c_personid_root, ZZ_KIN_LIST.c_female AS c_prior_female, ZZZ_KIN_BIOG_ADDR.c_node_female
, iif(ZZZ_KIN_BIOG_ADDR.c_node_female,'F','M'), " + _
              "ZZZ_KIN_BIOG_ADDR.c_female, iif(ZZZ_KIN_BIOG_ADDR.c_female,'F','M'), " + _
              "ZZ_KIN_LIST.c_notes + ' > ' + ZZZ_KIN_BIOG_ADDR.c_node_chn + ' (' + ZZZ_KIN_BIOG_ADDR.c_link_desc +
') ', " + _
              "ZZZ_KIN_BIOG_ADDR.c_source, ZZZ_KIN_BIOG_ADDR.c_title_chn, ZZZ_KIN_BIOG_ADDR.c_title " + _
          "FROM (ZZZ_KIN_BIOG_ADDR INNER JOIN ZZ_KIN_LIST ON ZZZ_KIN_BIOG_ADDR.c_personid = ZZ_KIN_LIST.c_kin_id) "
  + _
              "INNER JOIN KINSHIP_CODES ON ZZZ_KIN_BIOG_ADDR.c_link_code = KINSHIP_CODES.c_kincode " + _
          "WHERE ((ZZ_KIN_LIST.c_distance)="

    '   the various queries for cleaning up the results (need editing)
    '   ZZ_KIN_LIST is our collection of current results
       '   ZZ_KIN_LIST_TMP is the new material coming from the most recent query loop which looks for kin of the c_ki
n_id

    ' if the new kin (in c_kin_id) does not already show up as a relative of someone else already in the databas
e, this is one more step distant
    tNodeDistQueryStr = "UPDATE ZZ_KIN_LIST_TMP LEFT JOIN ZZ_KIN_LIST ON ZZ_KIN_LIST_TMP.c_kin_id = ZZ_KIN_LIST.c
_kin_id " + _
        "SET ZZ_KIN_LIST_TMP.c_distance = [ZZ_KIN_LIST_TMP].[c_distance]+1 " + _
        "WHERE (((ZZ_KIN_LIST.c_personid) Is Null))"
    '
    ' for insurance, explicitly delete duplicate results
    '
    tPruneTmpQuery = "UPDATE ZZ_KIN_LIST INNER JOIN ZZ_KIN_LIST_TMP ON " + _
        "(ZZ_KIN_LIST.c_kin_id = ZZ_KIN_LIST_TMP.c_kin_id) AND " + _
        "(ZZ_KIN_LIST.c_personid = ZZ_KIN_LIST_TMP.c_personid) " + _
        "SET ZZ_KIN_LIST_TMP.c_delete = 1;"

       ' delete inverse results
       tPruneTmpQuery2 = "UPDATE ZZ_KIN_LIST INNER JOIN ZZ_KIN_LIST_TMP ON " + _
           "(ZZ_KIN_LIST.c_personid = ZZ_KIN_LIST_TMP.c_kin_id) AND " + _
           "(ZZ_KIN_LIST.c_kin_id = ZZ_KIN_LIST_TMP.c_personid) " + _
           "SET ZZ_KIN_LIST_TMP.c_delete = 1;"

    tPruneTmpQueryDupesStr = "UPDATE ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 INNER JOIN " + _
        "ZZ_KIN_LIST_TMP ON (ZZ_KIN_LIST_TMP_1.c_personid = ZZ_KIN_LIST_TMP.c_personid) " + _
        "AND (ZZ_KIN_LIST_TMP_1.c_kin_id = ZZ_KIN_LIST_TMP.c_kin_id) " + _
        "AND (ZZ_KIN_LIST_TMP_1.c_kin_code = ZZ_KIN_LIST_TMP.c_kin_code) " + _
        "SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
        "WHERE (([ZZ_KIN_LIST_TMP].[c_up_total]*1000+[ZZ_KIN_LIST_TMP].[c_down_total]*100+[ZZ_KIN_LIST_TMP].[c_co
l_total]*10+[ZZ_KIN_LIST_TMP].[c_mar_total]>" + _
        "[ZZ_KIN_LIST_TMP_1].[c_up_total]*1000+[ZZ_KIN_LIST_TMP_1].[c_down_total]*100+[ZZ_KIN_LIST_TMP_1].[c_col_
total]*10+[ZZ_KIN_LIST_TMP_1].[c_mar_total]))"

       ' if the data is good I should not need to do this
       tPruneTmpQueryDupesStr2 = "UPDATE ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 INNER JOIN " + _
           "ZZ_KIN_LIST_TMP ON (ZZ_KIN_LIST_TMP_1.c_personid = ZZ_KIN_LIST_TMP.c_personid) " + _
           "AND (ZZ_KIN_LIST_TMP_1.c_kin_id = ZZ_KIN_LIST_TMP.c_kin_id) " + _
           "AND (ZZ_KIN_LIST_TMP_1.c_kin_code = ZZ_KIN_LIST_TMP.c_kin_code) " + _
           "SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
           "WHERE (((StrComp([ZZ_KIN_LIST_TMP].[c_kinrel_total_raw], [ZZ_KIN_LIST_TMP_1].[c_kinrel_total_raw])) > 0)
)"

    tPruneInversesQueryStr1 = "UPDATE ZZ_KIN_LIST INNER JOIN (KINSHIP_CODES INNER JOIN ZZ_KIN_LIST_TMP ON KINSHIP
_CODES.c_kincode = ZZ_KIN_LIST_TMP.c_kin_code) ON " + _
        "(ZZ_KIN_LIST.c_kin_id = ZZ_KIN_LIST_TMP.c_personid) AND (ZZ_KIN_LIST.c_personid = ZZ_KIN_LIST_TMP.c_kin_
id) SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
        "WHERE (((ZZ_KIN_LIST.c_kin_code)=[KINSHIP_CODES].[c_kin_pair1])) OR (((ZZ_KIN_LIST.c_kin_code)=[KINSHIP_
CODES].[c_kin_pair2]))"

    tPruneInversesQueryStr2 = "UPDATE (ZZ_KIN_LIST INNER JOIN ZZ_KIN_LIST_TMP ON (ZZ_KIN_LIST.c_personid = ZZ_KIN
_LIST_TMP.c_kin_id) AND " + _
        "(ZZ_KIN_LIST.c_kin_id = ZZ_KIN_LIST_TMP.c_personid)) INNER JOIN KINSHIP_CODES ON ZZ_KIN_LIST.c_kin_code
= KINSHIP_CODES.c_kincode SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
        "WHERE (((ZZ_KIN_LIST_TMP.c_kin_code)=[KINSHIP_CODES].[c_kin_pair1] Or (ZZ_KIN_LIST_TMP.c_kin_code)=[KINS
HIP_CODES].[c_kin_pair2]))"


       tPruneTmpInversesQueryStr1 = "UPDATE KINSHIP_CODES INNER JOIN (ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 " + _
           "INNER JOIN ZZ_KIN_LIST_TMP ON (ZZ_KIN_LIST_TMP_1.c_personid = ZZ_KIN_LIST_TMP.c_kin_id) AND " + _
           "(ZZ_KIN_LIST_TMP_1.c_kin_id = ZZ_KIN_LIST_TMP.c_personid)) ON " + _
           "KINSHIP_CODES.c_kincode = ZZ_KIN_LIST_TMP.c_kin_code SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
           "WHERE (((ZZ_KIN_LIST_TMP.c_distance)>[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
           "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair1])) OR " + _
           "(((ZZ_KIN_LIST_TMP.c_distance)=[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
           "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair1]) AND " + _
           "((ZZ_KIN_LIST_TMP.c_personid)>[ZZ_KIN_LIST_TMP_1].[c_personid])) OR " + _
           "(((ZZ_KIN_LIST_TMP.c_distance)>[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
           "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair2])) OR " + _
           "(((ZZ_KIN_LIST_TMP.c_distance)=[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
           "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair2]) AND " + _
           "((ZZ_KIN_LIST_TMP.c_personid)>[ZZ_KIN_LIST_TMP_1].[c_personid]))"

       tPruneTmpInversesQueryStr2 = "UPDATE KINSHIP_CODES INNER JOIN (ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 " + _
           "INNER JOIN ZZ_KIN_LIST_TMP ON (ZZ_KIN_LIST_TMP_1.c_personid = ZZ_KIN_LIST_TMP.c_kin_id) AND " + _
           "(ZZ_KIN_LIST_TMP_1.c_kin_id = ZZ_KIN_LIST_TMP.c_personid)) ON " + _
           "KINSHIP_CODES.c_kincode = ZZ_KIN_LIST_TMP.c_kin_code SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
           "WHERE (((ZZ_KIN_LIST_TMP.c_distance)<[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
           "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair1])) OR " + _
           "(((ZZ_KIN_LIST_TMP.c_distance)=[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
           "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair1]) AND " + _
         "((ZZ_KIN_LIST_TMP.c_personid)<[ZZ_KIN_LIST_TMP_1].[c_personid])) OR " + _
         "(((ZZ_KIN_LIST_TMP.c_distance)<[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
         "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair2])) OR " + _
         "(((ZZ_KIN_LIST_TMP.c_distance)=[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
         "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair2]) AND " + _
         "((ZZ_KIN_LIST_TMP.c_personid)<[ZZ_KIN_LIST_TMP_1].[c_personid]))"

     tAppendQueryStr = "INSERT INTO ZZ_KIN_LIST ( c_personid, c_kin_id, c_kin_code, c_personid_root, c_kinrel, " +
 _
        "c_kinrel_total, c_kinrel_total_raw, c_kinrel_total_simplified, c_up, c_down, c_col, c_mar, c_up_total, c
_down_total, c_col_total, " + _
        "c_mar_total, c_distance, c_female, c_sex, c_kin_female, c_kin_sex, c_prior_female, c_notes, c_source, c_
source_text_chn, c_source_text ) " + _
        "SELECT DISTINCT ZZ_KIN_LIST_TMP.c_personid, ZZ_KIN_LIST_TMP.c_kin_id, ZZ_KIN_LIST_TMP.c_kin_code, " + _
            "ZZ_KIN_LIST_TMP.c_personid_root, ZZ_KIN_LIST_TMP.c_kinrel, ZZ_KIN_LIST_TMP.c_kinrel_total, " + _
            "ZZ_KIN_LIST_TMP.c_kinrel_total_raw, ZZ_KIN_LIST_TMP.c_kinrel_total_simplified, " + _
            "ZZ_KIN_LIST_TMP.c_up, ZZ_KIN_LIST_TMP.c_down, ZZ_KIN_LIST_TMP.c_col, ZZ_KIN_LIST_TMP.c_mar, " + _
            "ZZ_KIN_LIST_TMP.c_up_total, ZZ_KIN_LIST_TMP.c_down_total, ZZ_KIN_LIST_TMP.c_col_total, " + _
            "ZZ_KIN_LIST_TMP.c_mar_total, ZZ_KIN_LIST_TMP.c_distance, ZZ_KIN_LIST_TMP.c_female, ZZ_KIN_LIST_TMP.c
_sex, " + _
            "ZZ_KIN_LIST_TMP.c_kin_female, ZZ_KIN_LIST_TMP.c_kin_sex, ZZ_KIN_LIST_TMP.c_prior_female, ZZ_KIN_LIST
_TMP.c_notes, " + _
            "ZZ_KIN_LIST_TMP.c_source, ZZ_KIN_LIST_TMP.c_source_text_chn, ZZ_KIN_LIST_TMP.c_source_text " + _
        "FROM ZZ_KIN_LIST_TMP"

     tLoopCount = 1
     tExitDo = False
     tLoopMax = TxtMaxLoop.Value

     Do While tLoopCount <= tLoopMax And tRecCount > 0
         If tLoopCount = 1 Then
              ' MsgBox "Running first query"
              cmdSQL.CommandText = tKinFirstQueryStr
         Else
              ' MsgBox "Running query"
              cmdSQL.CommandText = tKinQueryStr + Str(tLoopCount - 1) + ")"
         End If
         cmdSQL.Execute tRecCount

         If tRecCount > 0 Then
             '
             ' process the results for addition
             '
             ' update the distance
             '
             'MsgBox "Fixing node distance"
             cmdSQL.CommandText = tNodeDistQueryStr
             cmdSQL.Execute tRecDelete
             '
             ' then mark the duplicates and delete them
             '
             'MsgBox "Fixing dupes 1"
             cmdSQL.CommandText = tPruneTmpQuery
             cmdSQL.Execute tRecDelete
             cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
             cmdSQL.Execute tRecDelete
             '
             'MsgBox "Fixing dupes 2"
             cmdSQL.CommandText = tPruneTmpQuery2
             cmdSQL.Execute tRecDelete
             cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
             cmdSQL.Execute tRecDelete
             '
             'MsgBox "Fixing dupes 3"
             cmdSQL.CommandText = tPruneTmpQueryDupesStr
             cmdSQL.Execute tRecDelete
             cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
             cmdSQL.Execute tRecDelete
             '
             'MsgBox "Fixing dupes 4"
             cmdSQL.CommandText = tPruneTmpQueryDupesStr2
             cmdSQL.Execute tRecDelete
             cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
             cmdSQL.Execute tRecDelete
             '
             'MsgBox "Fixing inverses"
             cmdSQL.CommandText = tPruneTmpInversesQueryStr1
             cmdSQL.Execute tRecDelete
             cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
             cmdSQL.Execute tRecDelete
            '
            cmdSQL.CommandText = tPruneInversesQueryStr1
            cmdSQL.Execute tRecDelete
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
            cmdSQL.Execute tRecDelete
            '
            cmdSQL.CommandText = tPruneInversesQueryStr2
            cmdSQL.Execute tRecDelete
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
            cmdSQL.Execute tRecDelete
            '
            ' now simplify the kinship string, add to the total and reduce if possible
            '
            'cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP " + _
                "SET ZZ_KIN_LIST_TMP.c_kinrel_total = 'ego', " + _
                    "ZZ_KIN_LIST_TMP.c_up_total = 0, " + _
                    "ZZ_KIN_LIST_TMP.c_down_total = 0, " + _
                    "ZZ_KIN_LIST_TMP.c_col_total = 0, " + _
                    "ZZ_KIN_LIST_TMP.c_mar_total = 0, " + _
                    "ZZ_KIN_LIST_TMP.c_kinrel_total_raw = 'ego' " + _
                "WHERE (([ZZ_KIN_LIST_TMP].[c_kin_id]=[ZZ_KIN_LIST_TMP].[c_personid_root]))"
            'cmdSQL.Execute tRecDelete

            '
            '   Reduce kinship strings
            '
            '   first just get the string length

            cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP SET ZZ_KIN_LIST_TMP.c_kinrel_len = Len([ZZ_KIN_LIST_TMP]
.[c_kinrel_total])"
            cmdSQL.Execute tRecDelete
            '
            ' then deal with len = 2
            '
            cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP " + _
                "SET ZZ_KIN_LIST_TMP.c_kinrel_root_text = Left([ZZ_KIN_LIST_TMP].[c_kinrel_total],[ZZ_KIN_LIST_TM
P].[c_kinrel_len]-2), " + _
                    "ZZ_KIN_LIST_TMP.c_kinrel_test_text = Right([ZZ_KIN_LIST_TMP].[c_kinrel_total],2), " + _
                    "ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplified = Left([ZZ_KIN_LIST_TMP].[c_kinrel_total_simpl
ified],[ZZ_KIN_LIST_TMP].[c_kinrel_len]-2)" + _
                "WHERE (((ZZ_KIN_LIST_TMP.c_kinrel_len)=2))"
            cmdSQL.Execute tRecDelete
            '
            '   replace where relevant

            cmdSQL.CommandText = "UPDATE ZZZ_KINREL_REDUCTION RIGHT JOIN ZZ_KIN_LIST_TMP " + _
                "ON ZZZ_KINREL_REDUCTION.c_kinrel_target = ZZ_KIN_LIST_TMP.c_kinrel_test_text " + _
                "SET ZZ_KIN_LIST_TMP.c_kinrel_total = [ZZ_KIN_LIST_TMP].[c_kinrel_root_text]+[ZZZ_KINREL_REDUCTIO
N].[c_kinrel_replacement], " + _
                    "ZZ_KIN_LIST_TMP.c_kinrel_total_simplified = ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplified +
" + _
                                 "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kinr
el_replacement] + ')', " + _
                    "ZZ_KIN_LIST_TMP.c_notes = [ZZ_KIN_LIST_TMP].[c_notes] + " + _
                             "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kinrel_r
eplacement] + ') ', " + _
                    "ZZ_KIN_LIST_TMP.c_up_total = [ZZ_KIN_LIST_TMP].[c_up_total]+[ZZZ_KINREL_REDUCTION].[c_up_cha
nge], " + _
                    "ZZ_KIN_LIST_TMP.c_down_total = [ZZ_KIN_LIST_TMP].[c_down_total]+[ZZZ_KINREL_REDUCTION].[c_do
wn_change], " + _
                    "ZZ_KIN_LIST_TMP.c_col_total = [ZZ_KIN_LIST_TMP].[c_col_total]+[ZZZ_KINREL_REDUCTION].[c_col_
change], " + _
                    "ZZ_KIN_LIST_TMP.c_mar_total = [ZZ_KIN_LIST_TMP].[c_mar_total]+[ZZZ_KINREL_REDUCTION].[c_mar_
change] " + _
                "WHERE (((ZZZ_KINREL_REDUCTION.c_kinrel_target) Is Not Null AND ZZZ_KINREL_REDUCTION.c_required )
)"
            cmdSQL.Execute tRecDelete

            '   then deal with len > 2
            '
            '    copy the target string and string root

            cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP " + _
                "SET ZZ_KIN_LIST_TMP.c_kinrel_root_text = Left([ZZ_KIN_LIST_TMP].[c_kinrel_total],[ZZ_KIN_LIST_TM
P].[c_kinrel_len]-2), " + _
                    "ZZ_KIN_LIST_TMP.c_kinrel_test_text = Right([ZZ_KIN_LIST_TMP].[c_kinrel_total],2), " + _
                    "ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplified = Left([ZZ_KIN_LIST_TMP].[c_kinrel_total_simpl
ified],[ZZ_KIN_LIST_TMP].[c_kinrel_len]-2)" + _
                "WHERE (((ZZ_KIN_LIST_TMP.c_kinrel_len)>2))"
            cmdSQL.Execute tRecDelete
            '
            '    replace where relevant

            cmdSQL.CommandText = "UPDATE ZZZ_KINREL_REDUCTION RIGHT JOIN ZZ_KIN_LIST_TMP " + _
                "ON ZZZ_KINREL_REDUCTION.c_kinrel_target = ZZ_KIN_LIST_TMP.c_kinrel_test_text " + _
                "SET ZZ_KIN_LIST_TMP.c_kinrel_total = [ZZ_KIN_LIST_TMP].[c_kinrel_root_text]+[ZZZ_KINREL_REDUCTIO
N].[c_kinrel_replacement], " + _
                    "ZZ_KIN_LIST_TMP.c_kinrel_total_simplified = ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplified +
" + _
                             "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kinrel_
replacement] + ')', " + _
                    "ZZ_KIN_LIST_TMP.c_notes = [ZZ_KIN_LIST_TMP].[c_notes] + " + _
                            "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kinrel_r
eplacement] + ') ', " + _
                    "ZZ_KIN_LIST_TMP.c_up_total = [ZZ_KIN_LIST_TMP].[c_up_total]+[ZZZ_KINREL_REDUCTION].[c_up_cha
nge], " + _
                    "ZZ_KIN_LIST_TMP.c_down_total = [ZZ_KIN_LIST_TMP].[c_down_total]+[ZZZ_KINREL_REDUCTION].[c_do
wn_change], " + _
                    "ZZ_KIN_LIST_TMP.c_col_total = [ZZ_KIN_LIST_TMP].[c_col_total]+[ZZZ_KINREL_REDUCTION].[c_col_
change], " + _
                    "ZZ_KIN_LIST_TMP.c_mar_total = [ZZ_KIN_LIST_TMP].[c_mar_total]+[ZZZ_KINREL_REDUCTION].[c_mar_
change] " + _
                "WHERE (((ZZZ_KINREL_REDUCTION.c_kinrel_target) Is Not Null AND ZZZ_KINREL_REDUCTION.c_required )
)"
            cmdSQL.Execute tRecDelete
            '
            ' the next set of procedures to simplify the code seems to need to be carried out in 6 parts (B, M,
and F; 3 and 2)
            '
            If ChkSImplify.Value Then

                 '   first, prep the ZZ_KIN_LIST_TMP file for codes of length three, with ZZZ_KINREL_REDUCTION.c_re
quired = FALSE

                ' then get the B as simpler
                cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP " + _
                    "SET ZZ_KIN_LIST_TMP.c_kinrel_root_text = Left([ZZ_KIN_LIST_TMP].[c_kinrel_total],[ZZ_KIN_LIS
T_TMP].[c_kinrel_len]-3), " + _
                        "ZZ_KIN_LIST_TMP.c_kinrel_test_text = Right([ZZ_KIN_LIST_TMP].[c_kinrel_total],3), " + _
                        "ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplified = Left([ZZ_KIN_LIST_TMP].[c_kinrel_total_s
implified],[ZZ_KIN_LIST_TMP].[c_kinrel_len]-3) " + _
                    "WHERE (((ZZ_KIN_LIST_TMP.c_kinrel_len)>2))"
                cmdSQL.Execute tRecDelete
                '
                '   replace where relevant

                cmdSQL.CommandText = "UPDATE ZZZ_KINREL_REDUCTION RIGHT JOIN ZZ_KIN_LIST_TMP " + _
                    "ON ZZZ_KINREL_REDUCTION.c_kinrel_target = ZZ_KIN_LIST_TMP.c_kinrel_test_text " + _
                    "SET ZZ_KIN_LIST_TMP.c_kinrel_total = [ZZ_KIN_LIST_TMP].[c_kinrel_root_text]+[ZZZ_KINREL_REDU
CTION].[c_kinrel_replacement], " + _
                        "ZZ_KIN_LIST_TMP.c_kinrel_total_simplified = ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplifie
d + " + _
                                 "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kin
rel_replacement] + ')', " + _
                        "ZZ_KIN_LIST_TMP.c_notes = [ZZ_KIN_LIST_TMP].[c_notes] + " + _
                                 "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kin
rel_replacement] + ') ', " + _
                        "ZZ_KIN_LIST_TMP.c_up_total = [ZZ_KIN_LIST_TMP].[c_up_total]+[ZZZ_KINREL_REDUCTION].[c_up
_change], " + _
                        "ZZ_KIN_LIST_TMP.c_down_total = [ZZ_KIN_LIST_TMP].[c_down_total]+[ZZZ_KINREL_REDUCTION].[
c_down_change], " + _
                        "ZZ_KIN_LIST_TMP.c_col_total = [ZZ_KIN_LIST_TMP].[c_col_total]+[ZZZ_KINREL_REDUCTION].[c_
col_change], " + _
                        "ZZ_KIN_LIST_TMP.c_mar_total = [ZZ_KIN_LIST_TMP].[c_mar_total]+[ZZZ_KINREL_REDUCTION].[c_
mar_change] " + _
                    "WHERE (((ZZZ_KINREL_REDUCTION.c_kinrel_target) Is Not Null AND Not ZZZ_KINREL_REDUCTION.c_re
quired AND (ZZZ_KINREL_REDUCTION.c_sex = 'B')))"
                cmdSQL.Execute tRecDelete

                 '   then M

                cmdSQL.CommandText = "UPDATE ZZZ_KINREL_REDUCTION RIGHT JOIN ZZ_KIN_LIST_TMP " + _
                    "ON ZZZ_KINREL_REDUCTION.c_kinrel_target = ZZ_KIN_LIST_TMP.c_kinrel_test_text " + _
                    "SET ZZ_KIN_LIST_TMP.c_kinrel_total = [ZZ_KIN_LIST_TMP].[c_kinrel_root_text]+[ZZZ_KINREL_REDU
CTION].[c_kinrel_replacement], " + _
                        "ZZ_KIN_LIST_TMP.c_kinrel_total_simplified = ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplifie
d + " + _
                                 "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kin
rel_replacement] + ')', " + _
                        "ZZ_KIN_LIST_TMP.c_notes = [ZZ_KIN_LIST_TMP].[c_notes] + " + _
                                  "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kin
rel_replacement] + ')', " + _
                         "ZZ_KIN_LIST_TMP.c_up_total = [ZZ_KIN_LIST_TMP].[c_up_total]+[ZZZ_KINREL_REDUCTION].[c_up
_change], " + _
                         "ZZ_KIN_LIST_TMP.c_down_total = [ZZ_KIN_LIST_TMP].[c_down_total]+[ZZZ_KINREL_REDUCTION].[
c_down_change], " + _
                         "ZZ_KIN_LIST_TMP.c_col_total = [ZZ_KIN_LIST_TMP].[c_col_total]+[ZZZ_KINREL_REDUCTION].[c_
col_change], " + _
                         "ZZ_KIN_LIST_TMP.c_mar_total = [ZZ_KIN_LIST_TMP].[c_mar_total]+[ZZZ_KINREL_REDUCTION].[c_
mar_change] " + _
                     "WHERE (((ZZZ_KINREL_REDUCTION.c_kinrel_target) Is Not Null AND Not ZZZ_KINREL_REDUCTION.c_re
quired AND " + _
                           "(ZZZ_KINREL_REDUCTION.c_sex = 'M' AND NOT ZZZ_KINREL_REDUCTION.c_check_ego AND NOT ZZ_
KIN_LIST_TMP.c_prior_female)))"
                 cmdSQL.Execute tRecDelete

                '   then F

                 'cmdSQL.CommandText = "UPDATE ZZZ_KINREL_REDUCTION RIGHT JOIN ZZ_KIN_LIST_TMP " + _
                     "ON ZZZ_KINREL_REDUCTION.c_kinrel_target = ZZ_KIN_LIST_TMP.c_kinrel_test_text " + _
                     "SET ZZ_KIN_LIST_TMP.c_kinrel_total = [ZZ_KIN_LIST_TMP].[c_kinrel_root_text]+[ZZZ_KINREL_REDU
CTION].[c_kinrel_replacement], " + _
                         "ZZ_KIN_LIST_TMP.c_kinrel_total_simplified = ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplifie
d + " + _
                                  "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kin
rel_replacement] + ')', " + _
                         "ZZ_KIN_LIST_TMP.c_notes = [ZZ_KIN_LIST_TMP].[c_notes] + " + _
                                  "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kin
rel_replacement] + ')', " + _
                         "ZZ_KIN_LIST_TMP.c_up_total = [ZZ_KIN_LIST_TMP].[c_up_total]+[ZZZ_KINREL_REDUCTION].[c_up
_change], " + _
                         "ZZ_KIN_LIST_TMP.c_down_total = [ZZ_KIN_LIST_TMP].[c_down_total]+[ZZZ_KINREL_REDUCTION].[
c_down_change], " + _
                         "ZZ_KIN_LIST_TMP.c_col_total = [ZZ_KIN_LIST_TMP].[c_col_total]+[ZZZ_KINREL_REDUCTION].[c_
col_change], " + _
                         "ZZ_KIN_LIST_TMP.c_mar_total = [ZZ_KIN_LIST_TMP].[c_mar_total]+[ZZZ_KINREL_REDUCTION].[c_
mar_change] " + _
                     "WHERE (((ZZZ_KINREL_REDUCTION.c_kinrel_target) Is Not Null AND Not ZZZ_KINREL_REDUCTION.c_re
quired AND " + _
                           "(ZZZ_KINREL_REDUCTION.c_sex = 'F' AND NOT ZZZ_KINREL_REDUCTION.c_check_ego AND ZZ_KIN
_LIST_TMP.c_prior_female)))"
                 'cmdSQL.Execute tRecDelete

                ' next, prep the ZZ_KIN_LIST_TMP file for codes of lenght 2:   at least the code here is the same
 except for string lengths

                '   then get the B as simpler

                cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP " + _
                    "SET ZZ_KIN_LIST_TMP.c_kinrel_root_text = Left([ZZ_KIN_LIST_TMP].[c_kinrel_total],[ZZ_KIN_LIS
T_TMP].[c_kinrel_len]-2), " + _
                        "ZZ_KIN_LIST_TMP.c_kinrel_test_text = Right([ZZ_KIN_LIST_TMP].[c_kinrel_total],2), " + _
                        "ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplified = Left([ZZ_KIN_LIST_TMP].[c_kinrel_total_s
implified],[ZZ_KIN_LIST_TMP].[c_kinrel_len]-2)" + _
                    "WHERE (((ZZ_KIN_LIST_TMP.c_kinrel_len)>1))"
                cmdSQL.Execute tRecDelete
                '
                '   replace where relevant

                cmdSQL.CommandText = "UPDATE ZZZ_KINREL_REDUCTION RIGHT JOIN ZZ_KIN_LIST_TMP " + _
                    "ON ZZZ_KINREL_REDUCTION.c_kinrel_target = ZZ_KIN_LIST_TMP.c_kinrel_test_text " + _
                    "SET ZZ_KIN_LIST_TMP.c_kinrel_total = [ZZ_KIN_LIST_TMP].[c_kinrel_root_text]+[ZZZ_KINREL_REDU
CTION].[c_kinrel_replacement], " + _
                        "ZZ_KIN_LIST_TMP.c_kinrel_total_simplified = ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplifie
d + " + _
                                 "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kin
rel_replacement] + ')', " + _
                        "ZZ_KIN_LIST_TMP.c_notes = [ZZ_KIN_LIST_TMP].[c_notes] + " + _
                                 "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kin
rel_replacement] + ')', " + _
                        "ZZ_KIN_LIST_TMP.c_up_total = [ZZ_KIN_LIST_TMP].[c_up_total]+[ZZZ_KINREL_REDUCTION].[c_up
_change], " + _
                        "ZZ_KIN_LIST_TMP.c_down_total = [ZZ_KIN_LIST_TMP].[c_down_total]+[ZZZ_KINREL_REDUCTION].[
c_down_change], " + _
                        "ZZ_KIN_LIST_TMP.c_col_total = [ZZ_KIN_LIST_TMP].[c_col_total]+[ZZZ_KINREL_REDUCTION].[c_
col_change], " + _
                        "ZZ_KIN_LIST_TMP.c_mar_total = [ZZ_KIN_LIST_TMP].[c_mar_total]+[ZZZ_KINREL_REDUCTION].[c_
mar_change] " + _
                    "WHERE (((ZZZ_KINREL_REDUCTION.c_kinrel_target) Is Not Null AND Not ZZZ_KINREL_REDUCTION.c_re
quired AND (ZZZ_KINREL_REDUCTION.c_sex = 'B')))"
                cmdSQL.Execute tRecDelete

                '   then M

                 cmdSQL.CommandText = "UPDATE ZZZ_KINREL_REDUCTION RIGHT JOIN ZZ_KIN_LIST_TMP " + _
                     "ON ZZZ_KINREL_REDUCTION.c_kinrel_target = ZZ_KIN_LIST_TMP.c_kinrel_test_text " + _
                     "SET ZZ_KIN_LIST_TMP.c_kinrel_total = [ZZ_KIN_LIST_TMP].[c_kinrel_root_text]+[ZZZ_KINREL_REDU
CTION].[c_kinrel_replacement], " + _
                         "ZZ_KIN_LIST_TMP.c_kinrel_total_simplified = ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplifie
d + " + _
                                  "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kin
rel_replacement] + ')', " + _
                         "ZZ_KIN_LIST_TMP.c_notes = [ZZ_KIN_LIST_TMP].[c_notes] + " + _
                                  "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kin
rel_replacement] + ')', " + _
                         "ZZ_KIN_LIST_TMP.c_up_total = [ZZ_KIN_LIST_TMP].[c_up_total]+[ZZZ_KINREL_REDUCTION].[c_up
_change], " + _
                         "ZZ_KIN_LIST_TMP.c_down_total = [ZZ_KIN_LIST_TMP].[c_down_total]+[ZZZ_KINREL_REDUCTION].[
c_down_change], " + _
                         "ZZ_KIN_LIST_TMP.c_col_total = [ZZ_KIN_LIST_TMP].[c_col_total]+[ZZZ_KINREL_REDUCTION].[c_
col_change], " + _
                         "ZZ_KIN_LIST_TMP.c_mar_total = [ZZ_KIN_LIST_TMP].[c_mar_total]+[ZZZ_KINREL_REDUCTION].[c_
mar_change] " + _
                     "WHERE (((ZZZ_KINREL_REDUCTION.c_kinrel_target) Is Not Null AND Not ZZZ_KINREL_REDUCTION.c_re
quired AND " + _
                           "(ZZZ_KINREL_REDUCTION.c_sex = 'M' AND NOT ZZZ_KINREL_REDUCTION.c_check_ego AND NOT ZZ_
KIN_LIST_TMP.c_prior_female)))"
                 cmdSQL.Execute tRecDelete

                '   then F

                 cmdSQL.CommandText = "UPDATE ZZZ_KINREL_REDUCTION RIGHT JOIN ZZ_KIN_LIST_TMP " + _
                     "ON ZZZ_KINREL_REDUCTION.c_kinrel_target = ZZ_KIN_LIST_TMP.c_kinrel_test_text " + _
                     "SET ZZ_KIN_LIST_TMP.c_kinrel_total = [ZZ_KIN_LIST_TMP].[c_kinrel_root_text]+[ZZZ_KINREL_REDU
CTION].[c_kinrel_replacement], " + _
                         "ZZ_KIN_LIST_TMP.c_kinrel_total_simplified = ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplifie
d + " + _
                                  "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kin
rel_replacement] + ')', " + _
                         "ZZ_KIN_LIST_TMP.c_notes = [ZZ_KIN_LIST_TMP].[c_notes] + " + _
                                  "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kin
rel_replacement] + ')', " + _
                         "ZZ_KIN_LIST_TMP.c_up_total = [ZZ_KIN_LIST_TMP].[c_up_total]+[ZZZ_KINREL_REDUCTION].[c_up
_change], " + _
                         "ZZ_KIN_LIST_TMP.c_down_total = [ZZ_KIN_LIST_TMP].[c_down_total]+[ZZZ_KINREL_REDUCTION].[
c_down_change], " + _
                         "ZZ_KIN_LIST_TMP.c_col_total = [ZZ_KIN_LIST_TMP].[c_col_total]+[ZZZ_KINREL_REDUCTION].[c_
col_change], " + _
                         "ZZ_KIN_LIST_TMP.c_mar_total = [ZZ_KIN_LIST_TMP].[c_mar_total]+[ZZZ_KINREL_REDUCTION].[c_
mar_change] " + _
                     "WHERE (((ZZZ_KINREL_REDUCTION.c_kinrel_target) Is Not Null AND Not ZZZ_KINREL_REDUCTION.c_re
quired AND " + _
                           "(ZZZ_KINREL_REDUCTION.c_sex = 'F' AND NOT ZZZ_KINREL_REDUCTION.c_check_ego AND ZZ_KIN_
LIST_TMP.c_prior_female)))"
                 cmdSQL.Execute tRecDelete

                '   final, prep the ZZ_KIN_LIST_TMP file for codes of length two, with ZZZ_KINREL_REDUCTION.c_ego_
check = TRUE

                '
                cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP " + _
                    "SET ZZ_KIN_LIST_TMP.c_kinrel_root_text = '', " + _
                        "ZZ_KIN_LIST_TMP.c_kinrel_test_text = [ZZ_KIN_LIST_TMP].[c_kinrel_total_simplified], " +
_
                        "ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplified = '' " + _
                    "WHERE ((len([ZZ_KIN_LIST_TMP].[c_kinrel_total_simplified])=2))"
                cmdSQL.Execute tRecDelete
                '
                ' then F

                 cmdSQL.CommandText = "UPDATE ZZZ_KINREL_REDUCTION RIGHT JOIN ZZ_KIN_LIST_TMP ON ZZZ_KINREL_REDUCT
ION.c_kinrel_target = ZZ_KIN_LIST_TMP.c_kinrel_test_text " + _
                     "SET ZZ_KIN_LIST_TMP.c_kinrel_total = [ZZ_KIN_LIST_TMP].[c_kinrel_root_text]+[ZZZ_KINREL_REDU
CTION].[c_kinrel_replacement], " + _
                         "ZZ_KIN_LIST_TMP.c_kinrel_total_simplified = ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplifie
d+'('+ZZZ_KINREL_REDUCTION.c_kinrel_target+'>'" + _
                             "+[ZZZ_KINREL_REDUCTION].[c_kinrel_replacement]+')', " + _
                         "ZZ_KIN_LIST_TMP.c_notes = [ZZ_KIN_LIST_TMP].[c_notes]+'('+ZZZ_KINREL_REDUCTION.c_kinrel_
target+'>'+" + _
                             "[ZZZ_KINREL_REDUCTION].[c_kinrel_replacement]+')', " + _
                          "ZZ_KIN_LIST_TMP.c_up_total = [ZZ_KIN_LIST_TMP].[c_up_total]+[ZZZ_KINREL_REDUCTION].[c_up
_change], " + _
                          "ZZ_KIN_LIST_TMP.c_down_total = [ZZ_KIN_LIST_TMP].[c_down_total]+[ZZZ_KINREL_REDUCTION].[
c_down_change], " + _
                          "ZZ_KIN_LIST_TMP.c_col_total = [ZZ_KIN_LIST_TMP].[c_col_total]+[ZZZ_KINREL_REDUCTION].[c_
col_change], " + _
                          "ZZ_KIN_LIST_TMP.c_mar_total = [ZZ_KIN_LIST_TMP].[c_mar_total]+[ZZZ_KINREL_REDUCTION].[c_
mar_change] " + _
                    "WHERE (((ZZZ_KINREL_REDUCTION.c_kinrel_target) Is Not Null) AND ((ZZZ_KINREL_REDUCTION.c_req
uired)=False) AND " + _
                        "((ZZZ_KINREL_REDUCTION.c_sex)='F') AND ((ZZ_KIN_LIST_TMP.c_kin_female)=True) AND ((ZZZ_K
INREL_REDUCTION.c_check_ego)=True) AND " + _
                        "((ZZ_KIN_LIST_TMP.c_personid)<>[ZZ_KIN_LIST_TMP].[c_kin_id]))"
                cmdSQL.Execute tRecDelete

                 cmdSQL.CommandText = "UPDATE ZZZ_KINREL_REDUCTION RIGHT JOIN ZZ_KIN_LIST_TMP ON ZZZ_KINREL_REDUCT
ION.c_kinrel_target = ZZ_KIN_LIST_TMP.c_kinrel_test_text " + _
                     "SET ZZ_KIN_LIST_TMP.c_kinrel_total = [ZZ_KIN_LIST_TMP].[c_kinrel_root_text]+[ZZZ_KINREL_REDU
CTION].[c_kinrel_replacement], " + _
                         "ZZ_KIN_LIST_TMP.c_kinrel_total_simplified = ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplifie
d+'('+ZZZ_KINREL_REDUCTION.c_kinrel_target+'>'" + _
                             "+[ZZZ_KINREL_REDUCTION].[c_kinrel_replacement]+')', " + _
                         "ZZ_KIN_LIST_TMP.c_notes = [ZZ_KIN_LIST_TMP].[c_notes]+'('+ZZZ_KINREL_REDUCTION.c_kinrel_
target+'>'+" + _
                             "[ZZZ_KINREL_REDUCTION].[c_kinrel_replacement]+')', " + _
                         "ZZ_KIN_LIST_TMP.c_up_total = [ZZ_KIN_LIST_TMP].[c_up_total]+[ZZZ_KINREL_REDUCTION].[c_up
_change], " + _
                         "ZZ_KIN_LIST_TMP.c_down_total = [ZZ_KIN_LIST_TMP].[c_down_total]+[ZZZ_KINREL_REDUCTION].[
c_down_change], " + _
                         "ZZ_KIN_LIST_TMP.c_col_total = [ZZ_KIN_LIST_TMP].[c_col_total]+[ZZZ_KINREL_REDUCTION].[c_
col_change], " + _
                         "ZZ_KIN_LIST_TMP.c_mar_total = [ZZ_KIN_LIST_TMP].[c_mar_total]+[ZZZ_KINREL_REDUCTION].[c_
mar_change] " + _
                     "WHERE (((ZZZ_KINREL_REDUCTION.c_kinrel_target) Is Not Null) AND ((ZZZ_KINREL_REDUCTION.c_req
uired)=False) AND " + _
                         "((ZZZ_KINREL_REDUCTION.c_sex)='M') AND ((ZZ_KIN_LIST_TMP.c_kin_female)=False) AND ((ZZZ_
KINREL_REDUCTION.c_check_ego)=True) AND " + _
                         "((ZZ_KIN_LIST_TMP.c_personid)<>[ZZ_KIN_LIST_TMP].[c_kin_id]))"
                 cmdSQL.Execute tRecDelete

            End If
            '
            ' now mark the records with bad metrics
            '
            cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
                "WHERE (((ZZ_KIN_LIST_TMP.c_up_total)>" + Str(gMaxUp) + ")) OR " + _
                      "(((ZZ_KIN_LIST_TMP.c_down_total)>" + Str(gMaxDown) + ")) OR " + _
                      "(((ZZ_KIN_LIST_TMP.c_col_total)>" + Str(gMaxCol) + ")) OR " + _
                      "(((ZZ_KIN_LIST_TMP.c_mar_total)>" + Str(gMaxMarr) + "))"
            cmdSQL.Execute tRecDelete
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
            cmdSQL.Execute tRecDelete
            '
            ' if the mourning filter needs to be applied, do so now
            '
            If ChkMourning.Value Then
                'MsgBox "Filtering mourning circle"
                cmdSQL.CommandText = "UPDATE KIN_Mourning RIGHT JOIN ZZ_KIN_LIST_TMP " + _
                    "ON KIN_Mourning.c_kinrel = ZZ_KIN_LIST_TMP.c_kinrel_total " + _
                    "SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
                    "WHERE (((KIN_Mourning.c_kinrel) Is Null))"
                cmdSQL.Execute tRecDelete
                '
                cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
                cmdSQL.Execute tRecDelete
                '
            End If
            '
            ' one final test: the only difference between ZZ_KIN_LIST_TEMP records is in PRIOR_FEMALE
            '
            cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 INNER JOIN ZZ_KIN_LIST_TMP " + _
                "ON (ZZ_KIN_LIST_TMP_1.c_kin_id = ZZ_KIN_LIST_TMP.c_kin_id) AND " + _
                "(ZZ_KIN_LIST_TMP_1.c_personid = ZZ_KIN_LIST_TMP.c_personid) AND " + _
                "(ZZ_KIN_LIST_TMP_1.c_kin_code = ZZ_KIN_LIST_TMP.c_kin_code) " + _
                "SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
                "WHERE (((ZZ_KIN_LIST_TMP.c_prior_female)=True) AND ((ZZ_KIN_LIST_TMP_1.c_prior_female)=False))"
            cmdSQL.Execute tRecDelete
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
            cmdSQL.Execute tRecDelete
               '
               '   it turns out that getting rid of inverse records is tougher than I would like, so we try one last
time
               '
               cmdSQL.CommandText = tPruneTmpInversesQueryStr2
               cmdSQL.Execute tRecDelete
               '
               cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
               cmdSQL.Execute tRecDelete
               '
               ' one last pair of clean-up routines is necessary. One can arrive at the same results through differ
ent paths
            '
            ' first, take the shorter path
            '
            cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP INNER JOIN ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 ON " + _
                "(ZZ_KIN_LIST_TMP.c_personid_root = ZZ_KIN_LIST_TMP_1.c_personid_root) " + _
                "AND (ZZ_KIN_LIST_TMP.c_kin_id = ZZ_KIN_LIST_TMP_1.c_kin_id) AND (ZZ_KIN_LIST_TMP.c_personid = ZZ
_KIN_LIST_TMP_1.c_personid) " + _
                "AND (ZZ_KIN_LIST_TMP.c_kinrel = ZZ_KIN_LIST_TMP_1.c_kinrel) " + _
                "SET ZZ_KIN_LIST_TMP_1.c_delete = 1 " + _
                "WHERE (((Len([ZZ_KIN_LIST_TMP].[c_notes]))<Len([ZZ_KIN_LIST_TMP_1].[c_notes])))"
            cmdSQL.Execute tRecDelete
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
            cmdSQL.Execute tRecDelete
            '
            'MsgBox "Last step"
            '
            ' then take the string with the smaller value
            '
            cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP INNER JOIN ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 ON " + _
                "(ZZ_KIN_LIST_TMP.c_personid_root = ZZ_KIN_LIST_TMP_1.c_personid_root) " + _
                "AND (ZZ_KIN_LIST_TMP.c_kin_id = ZZ_KIN_LIST_TMP_1.c_kin_id) AND (ZZ_KIN_LIST_TMP.c_personid = ZZ
_KIN_LIST_TMP_1.c_personid) " + _
                "AND (ZZ_KIN_LIST_TMP.c_kinrel = ZZ_KIN_LIST_TMP_1.c_kinrel) " + _
                "SET ZZ_KIN_LIST_TMP_1.c_delete = 1 " + _
                "WHERE ('X'+[ZZ_KIN_LIST_TMP].[c_notes] > 'X'+[ZZ_KIN_LIST_TMP_1].[c_notes])"
            cmdSQL.Execute tRecDelete
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
            cmdSQL.Execute tRecDelete
            '
            ' now append the results: if no records are added, this should stop the looping
            '
            ' MsgBox "Copying to ZZ_KIN_LIST"
            cmdSQL.CommandText = tAppendQueryStr
            cmdSQL.Execute tRecCount
            '
            ' and clear ZZ_KIN_LIST_TMP
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP"
            cmdSQL.Execute tRecDelete
            '
        End If

           tLoopCount = tLoopCount + 1

           If tLoopCount > tLoopMax Then
               MsgBox "Loop limit hit."
               tExitDo = True
               Exit Do
           End If
       Loop
       '
       ' clean up the results
       '
       'MsgBox "Fixing ZZ_KIN_LIST inverses"
       cmdSQL.CommandText = tAppendQueryStr
       cmdSQL.Execute tRecDelete
       '
       ' copy to the kinship table
       '
       'MsgBox "Copying to ZZ_SCRATCH_KINNET (not ego relative)"
       'Set tAppendQuery = CurrentDb.QueryDefs("ZZ_KIN_LIST_APPEND kin Query")
       'tAppendQuery.Execute
       '
       ' split the long command into a mix + update person + update kin
       '
       'tQueryStr = "INSERT INTO ZZ_SCRATCH_KINNET ( c_person_id, c_name, c_name_chn, c_female, c_sex, c_index_year,
  c_kin_id, " + _
         "c_kin_name, c_kin_chn, c_kin_index_year, c_kin_female, c_kin_sex, c_kin_code, c_kin_rel, c_up, c_down, c
_collateral, " + _
         "c_marriage, c_addr_id, c_addr_name, c_addr_chn, x_coord, y_coord, c_addr_type, c_addr_desc, c_addr_desc_
chn, " + _
         "c_kin_addr_id, c_kin_addr_name, c_kin_addr_chn, kin_x_coord, kin_y_coord, c_notes, c_kin_addr_type, " +
_
         "c_kin_addr_desc, c_kin_addr_desc_chn, c_upstep, c_dwnstep, c_marstep, c_colstep, c_distance, " + _
         "c_source, c_source_text_chn, c_source_text ) "
     'tQueryStr = tQueryStr + _
         "SELECT DISTINCT ZZ_KIN_LIST.c_personid, ZZZ_KIN_BIOG_ADDR.c_person_name, " + _
         "ZZZ_KIN_BIOG_ADDR.c_person_name_chn , ZZZ_KIN_BIOG_ADDR.c_female, iif(ZZZ_KIN_BIOG_ADDR.c_female,'F','M'
), ZZZ_KIN_BIOG_ADDR.c_index_year, ZZZ_KIN_BIOG_ADDR.c_node_id, " + _
         "ZZZ_KIN_BIOG_ADDR.c_node_name , ZZZ_KIN_BIOG_ADDR.c_node_chn, ZZZ_KIN_BIOG_ADDR.c_node_index_year, " + _
         "ZZZ_KIN_BIOG_ADDR.c_node_female, iif(ZZZ_KIN_BIOG_ADDR.c_node_female,'F','M'), ZZZ_KIN_BIOG_ADDR.c_link_
code, ZZZ_KIN_BIOG_ADDR.c_link_desc, " + _
         "ZZ_KIN_LIST.c_up_total, ZZ_KIN_LIST.c_down_total, ZZ_KIN_LIST.c_col_total, ZZ_KIN_LIST.c_mar_total, " +
_
         "ZZZ_KIN_BIOG_ADDR.c_addr_id, ZZZ_KIN_BIOG_ADDR.c_addr_name, ZZZ_KIN_BIOG_ADDR.c_addr_chn, " + _
         "ZZZ_KIN_BIOG_ADDR.x_coord, ZZZ_KIN_BIOG_ADDR.y_coord, ZZZ_KIN_BIOG_ADDR.c_addr_type, " + _
         "ZZZ_KIN_BIOG_ADDR.c_addr_desc, ZZZ_KIN_BIOG_ADDR.c_addr_desc_chn, ZZZ_KIN_BIOG_ADDR.c_node_addr_id, " +
_
         "ZZZ_KIN_BIOG_ADDR.c_node_addr_name, ZZZ_KIN_BIOG_ADDR.c_node_addr_chn, ZZZ_KIN_BIOG_ADDR.node_xcoord, "
+ _
         "ZZZ_KIN_BIOG_ADDR.node_ycoord, ZZZ_KIN_BIOG_ADDR.c_notes, ZZZ_KIN_BIOG_ADDR.c_node_addr_type, " + _
         "ZZZ_KIN_BIOG_ADDR.c_node_addr_desc, ZZZ_KIN_BIOG_ADDR.c_node_addr_desc_chn, ZZZ_KIN_BIOG_ADDR.c_upstep,
" + _
         "ZZZ_KIN_BIOG_ADDR.c_dwnstep, ZZZ_KIN_BIOG_ADDR.c_marstep, ZZZ_KIN_BIOG_ADDR.c_colstep, " + _
         "ZZZ_KIN_BIOG_ADDR.c_distance, ZZ_KIN_LIST.c_source, ZZ_KIN_LIST.c_source_text_chn, ZZ_KIN_LIST.c_source_
text " + _
         "FROM ZZZ_KIN_BIOG_ADDR INNER JOIN ZZ_KIN_LIST ON (ZZZ_KIN_BIOG_ADDR.c_personid = ZZ_KIN_LIST.c_personid)
  " + _
         "AND (ZZZ_KIN_BIOG_ADDR.c_link_code = ZZ_KIN_LIST.c_kin_code) AND " + _
         "(ZZZ_KIN_BIOG_ADDR.c_node_id = ZZ_KIN_LIST.c_kin_id)"

    ' insert

    tQueryStr = "INSERT INTO ZZ_SCRATCH_KINNET ( c_person_id, c_kin_id, c_kin_code, c_kin_rel, c_source, c_source
_text_chn, c_source_text) " + _
                "SELECT DISTINCT ZZ_KIN_LIST.c_personid, ZZ_KIN_LIST.c_kin_id, ZZ_KIN_LIST.c_kin_code, ZZ_KIN_LIS
T.c_kinrel, ZZ_KIN_LIST.c_source, " + _
                    "ZZ_KIN_LIST.c_source_text_chn, ZZ_KIN_LIST.c_source_text " + _
                "FROM ZZ_KIN_LIST WHERE (((ZZ_KIN_LIST.c_personid)<>[ZZ_KIN_LIST].[c_kin_id]))"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDelete
    '
    ' update the person
    '
    tQueryStr = "UPDATE ZZ_SCRATCH_KINNET INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_KINNET.c_person_id = ZZZ_BIOG_MA
IN.c_personid " + _
                "SET ZZ_SCRATCH_KINNET.c_name = [ZZZ_BIOG_MAIN].[c_name], ZZ_SCRATCH_KINNET.c_name_chn = [ZZZ_BIO
G_MAIN].[c_name_chn], " + _
                    "ZZ_SCRATCH_KINNET.c_female = [ZZZ_BIOG_MAIN].[c_female], ZZ_SCRATCH_KINNET.c_sex = IIf([ZZZ_
BIOG_MAIN].[c_female],'F','M'), " + _
                    "ZZ_SCRATCH_KINNET.c_index_year = [ZZZ_BIOG_MAIN].[c_index_year], " + _
                    "ZZ_SCRATCH_KINNET.c_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], " + _
                    "ZZ_SCRATCH_KINNET.c_addr_name = [ZZZ_BIOG_MAIN].[c_index_addr_name], " + _
                    "ZZ_SCRATCH_KINNET.c_addr_chn = [ZZZ_BIOG_MAIN].[c_index_addr_chn], " + _
                    "ZZ_SCRATCH_KINNET.x_coord = [ZZZ_BIOG_MAIN].[x_coord], ZZ_SCRATCH_KINNET.y_coord = [ZZZ_BIOG
_MAIN].[y_coord], " + _
                    "ZZ_SCRATCH_KINNET.c_addr_type = [ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
                    "ZZ_SCRATCH_KINNET.c_addr_desc = [ZZZ_BIOG_MAIN].[c_index_addr_type_desc], " + _
                    "ZZ_SCRATCH_KINNET.c_addr_desc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn]"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDelete
    '
    ' update the kin
    '
    tQueryStr = "UPDATE ZZ_SCRATCH_KINNET INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_KINNET.c_kin_id = ZZZ_BIOG_MAIN.
c_personid " + _
                 "SET ZZ_SCRATCH_KINNET.c_kin_name = [ZZZ_BIOG_MAIN].[c_name], ZZ_SCRATCH_KINNET.c_kin_chn = [ZZZ_
BIOG_MAIN].[c_name_chn], " + _
                     "ZZ_SCRATCH_KINNET.c_kin_female = [ZZZ_BIOG_MAIN].[c_female], ZZ_SCRATCH_KINNET.c_kin_sex = I
If([ZZZ_BIOG_MAIN].[c_female],'F','M'), " + _
                     "ZZ_SCRATCH_KINNET.c_kin_index_year = [ZZZ_BIOG_MAIN].[c_index_year], " + _
                     "ZZ_SCRATCH_KINNET.c_kin_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], " + _
                     "ZZ_SCRATCH_KINNET.c_kin_addr_name = [ZZZ_BIOG_MAIN].[c_index_addr_name], " + _
                     "ZZ_SCRATCH_KINNET.c_kin_addr_chn = [ZZZ_BIOG_MAIN].[c_index_addr_chn], " + _
                     "ZZ_SCRATCH_KINNET.kin_x_coord = [ZZZ_BIOG_MAIN].[x_coord], ZZ_SCRATCH_KINNET.kin_y_coord = [
ZZZ_BIOG_MAIN].[y_coord], " + _
                     "ZZ_SCRATCH_KINNET.c_kin_addr_type = [ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
                     "ZZ_SCRATCH_KINNET.c_kin_addr_desc = [ZZZ_BIOG_MAIN].[c_index_addr_type_desc], " + _
                     "ZZ_SCRATCH_KINNET.c_kin_addr_desc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn]"
     cmdSQL.CommandText = tQueryStr
     cmdSQL.Execute tRecDelete
     '
     ' update the relation
     '
     tQueryStr = "UPDATE ZZ_SCRATCH_KINNET INNER JOIN ZZZ_KIN_BIOG_ADDR ON (ZZ_SCRATCH_KINNET.c_kin_code = ZZZ_KIN
_BIOG_ADDR.c_link_code) AND " + _
                     "(ZZ_SCRATCH_KINNET.c_kin_id = ZZZ_KIN_BIOG_ADDR.c_node_id) AND (ZZ_SCRATCH_KINNET.c_person_i
d = ZZZ_KIN_BIOG_ADDR.c_personid) " + _
                 "SET ZZ_SCRATCH_KINNET.c_notes = ZZZ_KIN_BIOG_ADDR.c_notes, " + _
                     "ZZ_SCRATCH_KINNET.c_upstep = ZZZ_KIN_BIOG_ADDR.c_upstep, ZZ_SCRATCH_KINNET.c_dwnstep = ZZZ_K
IN_BIOG_ADDR.c_dwnstep, " + _
                     "ZZ_SCRATCH_KINNET.c_marstep = ZZZ_KIN_BIOG_ADDR.c_marstep, ZZ_SCRATCH_KINNET.c_colstep = ZZZ
_KIN_BIOG_ADDR.c_colstep, " + _
                     "ZZ_SCRATCH_KINNET.c_distance = ZZZ_KIN_BIOG_ADDR.c_distance "
     cmdSQL.CommandText = tQueryStr
     cmdSQL.Execute tRecDelete
     '
     '
     ' the final step is to add the index year descriptive information
     '
     cmdSQL.CommandText = "UPDATE (ZZ_SCRATCH_KINNET INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_KINNET.c_person_id = Z
ZZ_BIOG_MAIN.c_personid) " + _
         "INNER JOIN ZZZ_BIOG_MAIN AS ZZZ_BIOG_MAIN_1 ON ZZ_SCRATCH_KINNET.c_kin_id = ZZZ_BIOG_MAIN_1.c_personid "
 + _
         "SET ZZ_SCRATCH_KINNET.c_index_year_type_code = [ZZZ_BIOG_MAIN].[c_index_year_type_code], " + _
             "ZZ_SCRATCH_KINNET.c_index_year_type_desc = [ZZZ_BIOG_MAIN].[c_index_year_type_desc], " + _
             "ZZ_SCRATCH_KINNET.c_index_year_type_hz = [ZZZ_BIOG_MAIN].[c_index_year_type_hz], " + _
             "ZZ_SCRATCH_KINNET.c_kin_index_year_type_code = [ZZZ_BIOG_MAIN_1].[c_index_year_type_code], " + _
             "ZZ_SCRATCH_KINNET.c_kin_index_year_type_desc = [ZZZ_BIOG_MAIN_1].[c_index_year_type_desc], " + _
             "ZZ_SCRATCH_KINNET.c_kin_index_year_type_hz = [ZZZ_BIOG_MAIN_1].[c_index_year_type_hz]"
     cmdSQL.Execute tRecDelete
     '
     ' copy to the ego-relative kinship table
     '
     ' Before copying we need to clean up the data
     '
     ' There is a bug in the algorithm that creates the occasional null value in c_kinrel_total. To debug, for t
he moment plug the hole
     '
     'MsgBox "Patching NULL bug"
     cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST SET ZZ_KIN_LIST.c_kinrel_total_simplified = '[Program Error]' WHERE
(((ZZ_KIN_LIST.c_kinrel_total_simplified) Is Null))"
     cmdSQL.Execute tRecDelete
     '
     'MsgBox "Inserting ego-relative"
     tQueryStr = "INSERT INTO ZZ_KIN_LIST_TMP ( c_personid, c_kin_id, c_kinrel, c_kinrel_total, c_kinrel_total_sim
plified, " + _
         "c_up, c_down, c_col, c_mar, c_notes, c_kin_code ) " + _
         "SELECT DISTINCT ZZ_KIN_LIST.c_personid_root, ZZ_KIN_LIST.c_kin_id, ZZ_KIN_LIST.c_kinrel_total_raw, ZZ_KI
N_LIST.c_kinrel_total, " + _
             "ZZ_KIN_LIST.c_kinrel_total_simplified, ZZ_KIN_LIST.c_up_total, ZZ_KIN_LIST.c_down_total, ZZ_KIN_LIST
.c_col_total, ZZ_KIN_LIST.c_mar_total, " + _
             "ZZ_KIN_LIST.c_notes, 0 AS c_kin_code " + _
         "FROM ZZ_KIN_LIST"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDelete

    '   first just get the string length

    cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP SET ZZ_KIN_LIST_TMP.c_kinrel_len = Len([ZZ_KIN_LIST_TMP].[c_kinr
el_total_simplified])"
    cmdSQL.Execute tRecDelete

    '   delete the longer strings (this may solve most of the problems)

    cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP INNER JOIN ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 ON ZZ_KIN_LIST_T
MP.c_kin_id = ZZ_KIN_LIST_TMP_1.c_kin_id " + _
        "SET ZZ_KIN_LIST_TMP_1.c_delete = 1 " + _
        "WHERE (([ZZ_KIN_LIST_TMP_1].[c_kinrel_len]>[ZZ_KIN_LIST_TMP].[c_kinrel_len]))"
    cmdSQL.Execute tRecDelete

    cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
    cmdSQL.Execute tRecDelete
    '
    ' the next version uses the string-compare function because sometimes the strings are of the same length
    '
    cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 INNER JOIN " + _
        "ZZ_KIN_LIST_TMP ON (ZZ_KIN_LIST_TMP_1.c_kin_id = ZZ_KIN_LIST_TMP.c_kin_id) " + _
        "SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
        "WHERE (((StrComp([ZZ_KIN_LIST_TMP].[c_kinrel_total_simplified], [ZZ_KIN_LIST_TMP_1].[c_kinrel_total_simp
lified])) > 0))"
    cmdSQL.Execute tRecDelete

    cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
    cmdSQL.Execute tRecDelete
    '
    ' the last version uses the total kinship path: take the shortest value
    '
    cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 INNER JOIN " + _
        "ZZ_KIN_LIST_TMP ON (ZZ_KIN_LIST_TMP_1.c_kin_id = ZZ_KIN_LIST_TMP.c_kin_id) " + _
        "SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
        "WHERE (([ZZ_KIN_LIST_TMP].[c_down] + [ZZ_KIN_LIST_TMP].[c_col] + [ZZ_KIN_LIST_TMP].[c_mar] + [ZZ_KIN_LIS
T_TMP].[c_up]>" + _
                "[ZZ_KIN_LIST_TMP_1].[c_down]+[ZZ_KIN_LIST_TMP_1].[c_col]+[ZZ_KIN_LIST_TMP_1].[c_mar]+[ZZ_KIN_LIS
T_TMP_1].[c_up]))"
    cmdSQL.Execute tRecDelete

    cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
    cmdSQL.Execute tRecDelete
    '
    ' one last clean-up: remove results that are the same but takes a longer path to get there
    '
    cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP INNER JOIN ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 " + _
        "ON (ZZ_KIN_LIST_TMP.c_kinrel = ZZ_KIN_LIST_TMP_1.c_kinrel) AND (ZZ_KIN_LIST_TMP.c_personid = ZZ_KIN_LIST
_TMP_1.c_personid) AND " + _
           "(ZZ_KIN_LIST_TMP.c_kin_id = ZZ_KIN_LIST_TMP_1.c_kin_id) " + _
        "SET ZZ_KIN_LIST_TMP_1.c_delete = 1 " + _
        "WHERE ((Len([ZZ_KIN_LIST_TMP].[c_notes])<Len([ZZ_KIN_LIST_TMP_1].[c_notes])))"
    cmdSQL.Execute tRecDelete
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
    cmdSQL.Execute tRecDelete
    '
    'MsgBox "Last step"
    cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP INNER JOIN ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 " + _
        "ON (ZZ_KIN_LIST_TMP.c_kinrel = ZZ_KIN_LIST_TMP_1.c_kinrel) AND (ZZ_KIN_LIST_TMP.c_personid = ZZ_KIN_LIST
_TMP_1.c_personid) AND " + _
           "(ZZ_KIN_LIST_TMP.c_kin_id = ZZ_KIN_LIST_TMP_1.c_kin_id) " + _
        "SET ZZ_KIN_LIST_TMP_1.c_delete = 1 " + _
        "WHERE ('X'+[ZZ_KIN_LIST_TMP].[c_notes] > 'X'+[ZZ_KIN_LIST_TMP_1].[c_notes])"
    cmdSQL.Execute tRecDelete
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
    cmdSQL.Execute tRecDelete
    '
    '
    tQueryStr = "INSERT INTO ZZ_SCRATCH_KIN ( c_person_id, c_kin_id, c_kin_rel, c_kin_rel_total, c_kin_rel_0, c_u
p, c_down, c_collateral, c_marriage, c_notes ) " + _
        "SELECT DISTINCT ZZ_KIN_LIST_TMP.c_personid, ZZ_KIN_LIST_TMP.c_kin_id, ZZ_KIN_LIST_TMP.c_kinrel, ZZ_KIN_L
IST_TMP.c_kinrel_total, " + _
            "ZZ_KIN_LIST_TMP.c_kinrel_total_simplified, ZZ_KIN_LIST_TMP.c_up, ZZ_KIN_LIST_TMP.c_down, ZZ_KIN_LIST
_TMP.c_col, ZZ_KIN_LIST_TMP.c_mar, ZZ_KIN_LIST_TMP.c_notes " + _
        "FROM ZZ_KIN_LIST_TMP"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDelete

    tQueryStr = "UPDATE (ZZZ_BIOG_MAIN INNER JOIN ZZ_SCRATCH_KIN ON ZZZ_BIOG_MAIN.c_personid = ZZ_SCRATCH_KIN.c_p
erson_id) " + _
        "INNER JOIN ZZZ_BIOG_MAIN AS ZZZ_BIOG_MAIN_1 ON ZZ_SCRATCH_KIN.c_kin_id = ZZZ_BIOG_MAIN_1.c_personid " +
_
        "SET ZZ_SCRATCH_KIN.c_name = [ZZZ_BIOG_MAIN].[c_name], ZZ_SCRATCH_KIN.c_name_chn = [ZZZ_BIOG_MAIN].[c_nam
e_chn], " + _
        "ZZ_SCRATCH_KIN.c_index_year = [ZZZ_BIOG_MAIN].[c_index_year], ZZ_SCRATCH_KIN.c_female = [ZZZ_BIOG_MAIN].
[c_female], " + _
        "ZZ_SCRATCH_KIN.c_sex = iif([ZZZ_BIOG_MAIN].[c_female],'F','M'), " + _
        "ZZ_SCRATCH_KIN.c_kin_name = [ZZZ_BIOG_MAIN_1].[c_name], ZZ_SCRATCH_KIN.c_kin_chn = [ZZZ_BIOG_MAIN_1].[c_
name_chn], " + _
        "ZZ_SCRATCH_KIN.c_kin_index_year = [ZZZ_BIOG_MAIN_1].[c_index_year], ZZ_SCRATCH_KIN.c_kin_female = [ZZZ_B
IOG_MAIN_1].[c_female], " + _
        "ZZ_SCRATCH_KIN.c_kin_sex = iif([ZZZ_BIOG_MAIN_1].[c_female],'F','M'), ZZ_SCRATCH_KIN.c_kin_code = 0, ZZ_
SCRATCH_KIN.c_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], " + _
        "ZZ_SCRATCH_KIN.c_addr_name = [ZZZ_BIOG_MAIN].[c_index_addr_name], ZZ_SCRATCH_KIN.c_addr_chn = [ZZZ_BIOG_
MAIN].[c_index_addr_chn], " + _
        "ZZ_SCRATCH_KIN.c_addr_type = [ZZZ_BIOG_MAIN].[c_index_addr_type_code], ZZ_SCRATCH_KIN.c_addr_desc = [ZZZ
_BIOG_MAIN].[c_index_addr_type_desc], " + _
        "ZZ_SCRATCH_KIN.c_addr_desc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn], " + _
        "ZZ_SCRATCH_KIN.x_coord = [ZZZ_BIOG_MAIN].[x_coord], ZZ_SCRATCH_KIN.y_coord = [ZZZ_BIOG_MAIN].[y_coord],
" + _
        "ZZ_SCRATCH_KIN.c_kin_addr_id = [ZZZ_BIOG_MAIN_1].[c_index_addr_id], ZZ_SCRATCH_KIN.c_kin_addr_name = [ZZ
Z_BIOG_MAIN_1].[c_index_addr_name], " + _
        "ZZ_SCRATCH_KIN.c_kin_addr_chn = [ZZZ_BIOG_MAIN_1].[c_index_addr_chn], ZZ_SCRATCH_KIN.c_kin_addr_type = [
ZZZ_BIOG_MAIN_1].[c_index_addr_type_code], " + _
        "ZZ_SCRATCH_KIN.c_kin_addr_desc = [ZZZ_BIOG_MAIN_1].[c_index_addr_type_desc], ZZ_SCRATCH_KIN.c_kin_addr_d
esc_chn = [ZZZ_BIOG_MAIN_1].[c_index_addr_type_chn], " + _
        "ZZ_SCRATCH_KIN.kin_x_coord = [ZZZ_BIOG_MAIN_1].[x_coord], ZZ_SCRATCH_KIN.kin_y_coord = [ZZZ_BIOG_MAIN_1]
.[y_coord];"

      cmdSQL.CommandText = tQueryStr
      cmdSQL.Execute tRecDelete
          '
      ' get the index year descriptive data
      '
      cmdSQL.CommandText = "UPDATE (ZZ_SCRATCH_KIN INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_KIN.c_person_id = ZZZ_BIO
G_MAIN.c_personid) " + _
          "INNER JOIN ZZZ_BIOG_MAIN AS ZZZ_BIOG_MAIN_1 ON ZZ_SCRATCH_KIN.c_kin_id = ZZZ_BIOG_MAIN_1.c_personid " +
_
          "SET ZZ_SCRATCH_KIN.c_index_year_type_code = [ZZZ_BIOG_MAIN].[c_index_year_type_code], " + _
              "ZZ_SCRATCH_KIN.c_index_year_type_desc = [ZZZ_BIOG_MAIN].[c_index_year_type_desc], " + _
              "ZZ_SCRATCH_KIN.c_index_year_type_hz = [ZZZ_BIOG_MAIN].[c_index_year_type_hz], " + _
              "ZZ_SCRATCH_KIN.c_kin_index_year_type_code = [ZZZ_BIOG_MAIN_1].[c_index_year_type_code], " + _
              "ZZ_SCRATCH_KIN.c_kin_index_year_type_desc = [ZZZ_BIOG_MAIN_1].[c_index_year_type_desc], " + _
              "ZZ_SCRATCH_KIN.c_kin_index_year_type_hz = [ZZZ_BIOG_MAIN_1].[c_index_year_type_hz]"
      cmdSQL.Execute tRecDelete
      '
      ' update the dynasty information
      '
      cmdSQL.CommandText = "UPDATE (ZZZ_BIOG_MAIN INNER JOIN ZZ_SCRATCH_KINNET ON ZZZ_BIOG_MAIN.c_personid = ZZ_SCR
ATCH_KINNET.c_person_id) " + _
          "INNER JOIN ZZZ_BIOG_MAIN AS ZZZ_BIOG_MAIN_1 ON ZZ_SCRATCH_KINNET.c_kin_id = ZZZ_BIOG_MAIN_1.c_personid "
  + _
          "SET ZZ_SCRATCH_KINNET.c_dy = [ZZZ_BIOG_MAIN].[c_dy], " + _
              "ZZ_SCRATCH_KINNET.c_dynasty = [ZZZ_BIOG_MAIN].[c_dynasty], " + _
              "ZZ_SCRATCH_KINNET.c_dynasty_chn = [ZZZ_BIOG_MAIN].[c_dynasty_chn], " + _
              "ZZ_SCRATCH_KINNET.c_kin_dy = [ZZZ_BIOG_MAIN_1].[c_dy], " + _
              "ZZ_SCRATCH_KINNET.c_kin_dynasty = [ZZZ_BIOG_MAIN_1].[c_dynasty], " + _
              "ZZ_SCRATCH_KINNET.c_kin_dynasty_chn = [ZZZ_BIOG_MAIN_1].[c_dynasty_chn]"
      cmdSQL.Execute tRecDelete

    cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_KIN INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_KIN.c_kin_id = ZZZ_BIOG_MA
IN.c_personid " + _
         "SET ZZ_SCRATCH_KIN.c_kin_dy = [ZZZ_BIOG_MAIN].[c_dy], " + _
             "ZZ_SCRATCH_KIN.c_kin_dynasty = [ZZZ_BIOG_MAIN].[c_dynasty], " + _
             "ZZ_SCRATCH_KIN.c_kin_dynasty_chn = [ZZZ_BIOG_MAIN].[c_dynasty_chn]"
    cmdSQL.Execute tRecDelete

    '   The ego-relative table needs to be cleaned up.   The simplest approach is to take the shortest string
    '
    '

    ' calculate the xy_count
    '
    ' use four SQL calls
    '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
    cmdSQL.Execute tRecDeleted
    '
    ' get PersonID
    cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id ) " + _
         "SELECT DISTINCT ZZ_SCRATCH_KIN.c_person_id " + _
         "FROM ZZ_SCRATCH_KIN INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_KIN.c_person_id = ZZZ_BIOG_MAIN.c_personid"
    cmdSQL.Execute tRecDeleted
    '
    ' add KinID
    cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id ) " + _
         "SELECT DISTINCT ZZ_SCRATCH_KIN.c_kin_id " + _
         "FROM ZZ_SCRATCH_KIN LEFT JOIN ZZ_SCRATCH_PEOPLE ON ZZ_SCRATCH_KIN.c_kin_id = ZZ_SCRATCH_PEOPLE.c_person_
id " + _
         "WHERE (((ZZ_SCRATCH_PEOPLE.c_person_id) Is Null))"
    cmdSQL.Execute tRecDeleted
    '
    ' get additional information from ZZZ_BIOG_MAIN
    '
    cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_PEOPLE INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZ
Z_BIOG_MAIN.c_personid " + _
        "SET ZZ_SCRATCH_PEOPLE.c_name = [ZZZ_BIOG_MAIN].[c_name], ZZ_SCRATCH_PEOPLE.c_name_chn = [ZZZ_BIOG_MAIN].
[c_name_chn], " + _
            "ZZ_SCRATCH_PEOPLE.c_female = [ZZZ_BIOG_MAIN].[c_female], ZZ_SCRATCH_PEOPLE.c_index_year = [ZZZ_BIOG_
MAIN].[c_index_year], " + _
            "ZZ_SCRATCH_PEOPLE.c_index_year_type_code = [ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
            "ZZ_SCRATCH_PEOPLE.c_index_year_type_desc = [ZZZ_BIOG_MAIN].[c_index_year_type_desc], " + _
            "ZZ_SCRATCH_PEOPLE.c_index_year_type_hz = [ZZZ_BIOG_MAIN].[c_index_year_type_hz], ZZ_SCRATCH_PEOPLE.c
_dy = [ZZZ_BIOG_MAIN].[c_dy], " + _
            "ZZ_SCRATCH_PEOPLE.c_dynasty = [ZZZ_BIOG_MAIN].[c_dynasty], ZZ_SCRATCH_PEOPLE.c_dynasty_chn = [ZZZ_BI
OG_MAIN].[c_dynasty_chn], " + _
            "ZZ_SCRATCH_PEOPLE.c_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], ZZ_SCRATCH_PEOPLE.c_addr_name = [ZZ
Z_BIOG_MAIN].[c_index_addr_name], " + _
            "ZZ_SCRATCH_PEOPLE.c_addr_chn = [ZZZ_BIOG_MAIN].[c_index_addr_chn], ZZ_SCRATCH_PEOPLE.c_addr_type = [
ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
            "ZZ_SCRATCH_PEOPLE.c_addr_desc = [ZZZ_BIOG_MAIN].[c_index_addr_type_desc], ZZ_SCRATCH_PEOPLE.c_addr_d
esc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn], " + _
            "ZZ_SCRATCH_PEOPLE.x_coord = [ZZZ_BIOG_MAIN].[x_coord], ZZ_SCRATCH_PEOPLE.y_coord = [ZZZ_BIOG_MAIN].[
y_coord]"
    cmdSQL.Execute tRecDeleted
    '
    cmdSQL.CommandText = "Delete * from tmpXY"
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "INSERT INTO tmpXY ( x_coord, y_coord, CountOfx_coord, CountOfy_coord ) " + _
                    "SELECT ZZ_SCRATCH_PEOPLE.x_coord, ZZ_SCRATCH_PEOPLE.y_coord, Count(ZZ_SCRATCH_PEOPLE.x_coord
) AS CountOfx_coord, " + _
                    "Count(ZZ_SCRATCH_PEOPLE.y_coord) AS CountOfy_coord " + _
                    "FROM ZZ_SCRATCH_PEOPLE " + _
                    "GROUP BY ZZ_SCRATCH_PEOPLE.x_coord, ZZ_SCRATCH_PEOPLE.y_coord"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "UPDATE tmpXY INNER JOIN ZZ_SCRATCH_KIN ON (tmpXY.y_coord = " + _
        "ZZ_SCRATCH_KIN.kin_y_coord) AND (tmpXY.x_coord = ZZ_SCRATCH_KIN.kin_x_coord) " + _
        "SET ZZ_SCRATCH_KIN.xy_count = [tmpXY].[CountOfx_coord];"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    ' record the XYCount in ZZ_SCRATCH_PEOPLE
    '
    cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_PEOPLE INNER JOIN tmpXY ON (ZZ_SCRATCH_PEOPLE.y_coord = tmpXY.y_coord
) " + _
            "AND (ZZ_SCRATCH_PEOPLE.x_coord = tmpXY.x_coord) " + _
        "SET ZZ_SCRATCH_PEOPLE.xy_count = [tmpXY].[CountOfx_coord]"
    cmdSQL.Execute tRecDeleted
    '
    cmdSQL.CommandText = "Delete * from tmpXY"
    cmdSQL.Execute tRecDeleted
    '
    ' calculate the distances for the ego-network
    '
    'DoCmd.RunSQL "ALTER TABLE ZZ_SCRATCH_KIN ADD COLUMN c_t_dist DOUBLE"

    tSQLstr = "UPDATE ZZ_SCRATCH_KIN SET ZZ_SCRATCH_KIN.c_t_dist = " + _
        "Sqr((Sin(3.1415926536*(y_coord-kin_y_coord)/360))^2+Cos(3.1415926536*y_coord/180)*" + _
        "Cos(3.1415926536*kin_y_coord/180)*(Sin(3.1415926536*(x_coord-kin_x_coord)/360))^2) " + _
        "WHERE (((ZZ_SCRATCH_KIN.x_coord)>0) AND ((ZZ_SCRATCH_KIN.y_coord)>0) AND " + _
        "((ZZ_SCRATCH_KIN.kin_x_coord)>0) AND ((ZZ_SCRATCH_KIN.kin_y_coord)>0));"

    cmdSQL.CommandText = tSQLstr
    cmdSQL.Execute tRecDeleted

    tSQLstr = "UPDATE ZZ_SCRATCH_KIN SET ZZ_SCRATCH_KIN.c_distance = " + _
        "25484*Atn(c_t_dist/(1+Sqr(1-c_t_dist*c_t_dist))) " + _
        "WHERE (((ZZ_SCRATCH_KIN.x_coord)>0) AND ((ZZ_SCRATCH_KIN.y_coord)>0) AND " + _
        "((ZZ_SCRATCH_KIN.kin_x_coord)>0) AND ((ZZ_SCRATCH_KIN.kin_y_coord)>0))"

    cmdSQL.CommandText = tSQLstr
    cmdSQL.Execute tRecDeleted

    'DoCmd.RunSQL "ALTER TABLE ZZ_SCRATCH_KIN DROP COLUMN c_t_dist"

    '
    'GoTo Exit_CmdRun_Click

Exit_CmdRun_Click:
    '
    ' reattach the tables
    '
    Set gRstPersonID = CurrentDb.OpenRecordset("ZZ_SCRATCH_KIN", dbOpenDynaset)
    Set frmZZ_SCRATCH_KIN.Form.Recordset = gRstPersonID
    Set frmZZ_SCRATCH_KINNET.Form.Recordset = CurrentDb.OpenRecordset("ZZ_SCRATCH_KINNET", dbOpenDynaset)
    Set frmZZ_SCRATCH_PEOPLE.Form.Recordset = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)

    If gRstPersonID.RecordCount > 0 Then
        'cmdSQL.CommandText = tQueryStr
        'cmdSQL.Execute tRecDeleted

           Me.CmdGIS.Enabled = True
           Me.CmdGUESS.Enabled = True
           CmdStoreID.Enabled = True
           CmdUCINet.Enabled = True
           CmdUTF8Pajek.Enabled = True
           ChkIncludeID.Enabled = True
           CmdNeo4j.Enabled = True
    Else
        Me.CmdGIS.Enabled = False
        Me.CmdGUESS.Enabled = False
        CmdStoreID.Enabled = False
        CmdUCINet.Enabled = False
        CmdUTF8Pajek.Enabled = False
        ChkIncludeID.Enabled = False
        CmdNeo4j.Enabled = False
    End If
    '
    ' close the tables
    '
    Set gRstPersonID = Nothing
    '
    frmZZ_SCRATCH_KIN.Form.OrderBy = "c_up,c_down,c_collateral,c_marriage"
    frmZZ_SCRATCH_KIN.Form.OrderByOn = True

    Exit Sub

Err_CmdRun_Click:
    MsgBox Err.Description + tErrorStr
    Resume Exit_CmdRun_Click

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
    If frmZZ_SCRATCH_KIN.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdPajek_Click
    End If
    '
    If frmZZ_SCRATCH_KINNET.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdPajek_Click
    End If
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer, tMetricSum As Integer
     Dim tFileName As String, tFN As Variant
     Dim tRstNode As DAO.Recordset, tRstEdgeLookup As DAO.Recordset
     ' Dim tRstNodeList As DAO.Recordset
     ' Dim tRstEdge As DAO.Recordset
     Dim tStr As String, tC As String, ti As Integer, tHitMax As Integer
     Dim tColor(20) As String
     Dim tFileSystem
     ' Dim tGDF
     Dim tHitID(500) As Long, tHitCount As Integer, tFound As Boolean
     Dim tUpStr As String, tDwnStr As String, tMarStr As String, tColStr As String
     Dim tj As Integer, tSearchStr(9, 4, 2) As String, tUseList As Boolean
     Dim tUpVal(9) As Integer, tDwnVal(9) As Integer, tMarVal(9) As Integer, tColVal(9) As Integer

     Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

     tHitMax = 500

     'Use a With...End With block to reference the FileDialog object.
     With dlgSaveAs
         .InitialFileName = "kin.net"
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
             cmdSQL.CommandText = "Delete from ZZ_SCRATCH_PAJEK where c_ID > -1"
             cmdSQL.Execute tRecDeleted
             '
             Set gRstNodeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK", dbOpenTable)
             gRstNodeList.Index = "c_ID"
             '
             ' now process the file (second true removed to make ASCII)
             '
             Set tFileSystem = CreateObject("Scripting.FileSystemObject")
             Set gGdf = tFileSystem.CreateTextFile(tFileName, True)

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
             ' determine whether nodes come from a query (import list) or from the table
             '
             If Left(TxtName.Value, 1) = "[" Then
                  tStr = "SELECT [ZZ_SCRATCH_KIN DISTINCT Query].*, ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id "
                  tStr = tStr + "FROM [ZZ_SCRATCH_KIN DISTINCT Query] LEFT JOIN ZZ_SCRATCH_IMPORT_PEOPLE"
                  tStr = tStr + " ON [ZZ_SCRATCH_KIN DISTINCT Query].c_kin_id = ZZ_SCRATCH_IMPORT_PEOPLE.c_person_i
d"
                 Set tRstNode = CurrentDb.OpenRecordset(tStr, dbOpenDynaset)
                 '
                 ' to get an accurate record count
                   '
                   tRstNode.MoveLast
                   tUseList = True
            Else
                Set tRstNode = frmZZ_SCRATCH_KIN.Form.Recordset
                tUseList = False
            End If
            '
            ' process the two tables
            '
            Set gRstEdge = frmZZ_SCRATCH_KINNET.Form.Recordset
            Set tRstEdgeLookup = gRstEdge.Clone

            tC = Chr(44) ' the comma
            '
            ' first the nodes: define the record structure
            tStr = "*Vertices " + Trim(Str(tRstNode.RecordCount))
            gGdf.WriteLine (tStr)
            '
            ti = 1
            With tRstNode
                .MoveFirst
                Do While Not .EOF
                     gGdf.Write (Trim(Str(ti)) + " ")
                     ' name = the ID of the person
                     If IsNull(!c_kin_name) Then
                          gGdf.Write (" box ")
                     Else
                          gGdf.Write (Chr(34))
                          gGdf.Write (!c_kin_name)
                          gGdf.Write (Chr(34))
                          gGdf.Write (" box ")
                     End If
                     ' label
                     If tUseList Then
                          '
                          ' only people on the initial import list have a non-null c_person_id
                          '
                          If IsNull(!c_person_id) Then
                               tMetricSum = 2
                          Else
                               tMetricSum = 1
                          End If
                     Else
                          tMetricSum = !c_marriage + !c_up + !c_down + !c_collateral
                          If tMetricSum = 0 Then
                               tMetricSum = 1
                          End If
                          If tMetricSum > 20 Then
                               tMetricSum = 20
                          End If
                     End If
                     tStr = " ic " + tColor(tMetricSum)
                     tStr = tStr + " bc " + tColor(tMetricSum)
                     ' color = white (1), blue (2), green (3), yellow (4), orange (5)
                     gGdf.WriteLine (tStr)
                     '
                     ' add the node to the list
                     '
                     gRstNodeList.AddNew
                     gRstNodeList!c_v_num = Str(ti)
                     gRstNodeList!c_ID = !c_kin_id
                     gRstNodeList.Update
                     '
                     .MoveNext
                     ti = ti + 1
                Loop
            End With
            '
            ' now the edges: define the record structure
            tStr = "*Edges"
            gGdf.WriteLine (tStr)

            With gRstEdge
                '
                ' first process all the immediate relations
                '
                .MoveFirst
                Do While Not .EOF
                    If !c_up = 1 And !c_down = 0 And !c_marriage = 0 And !c_collateral = 0 Then
                        Call write_edge
                    ElseIf !c_up = 0 And !c_down = 1 And !c_marriage = 0 And !c_collateral = 0 Then
                        Call write_edge
                    ElseIf !c_up = 0 And !c_down = 0 And !c_marriage = 1 And !c_collateral = 0 Then
                        Call write_edge
                    ElseIf !c_up = 0 And !c_down = 0 And !c_marriage = 0 And !c_collateral = 1 Then
                        Call write_edge
                    End If
                    .MoveNext
                Loop
                '
                ' next look for all second degree connections
                '
                ' the logic here is that there are four separate searched needed to confirm that there are no
                ' intermediate nodes between two nodes with a distance of 2, since the relevant nodes can
                ' appear at either end of the edge. There are nine possible configuration for a sum of 2
                '
                tUpVal(1) = 2
                tDwnVal(1) = 0
                tMarVal(1) = 0
                tColVal(1) = 0
                '
                tUpVal(2) = 0
                tDwnVal(2) = 2
                tMarVal(2) = 0
                tColVal(2) = 0
                '
                tUpVal(3) = 0
                tDwnVal(3) = 0
                tMarVal(3) = 2
                tColVal(3) = 0
                '
                tUpVal(4) = 0
                tDwnVal(4) = 0
                tMarVal(4) = 0
                tColVal(4) = 2
                '
                tUpVal(5) = 1
                tDwnVal(5) = 0
                tMarVal(5) = 1
                tColVal(5) = 0
                '
                tUpVal(6) = 1
                tDwnVal(6) = 0
                tMarVal(6) = 0
                tColVal(6) = 1
                '
                tUpVal(7) = 0
                tDwnVal(7) = 0
                tMarVal(7) = 1
                tColVal(7) = 1
                '
                tUpVal(8) = 0
                tDwnVal(8) = 1
                tMarVal(8) = 1
                tColVal(8) = 0
                '
                tUpVal(9) = 0
                tDwnVal(9) = 1
                tMarVal(9) = 0
                tColVal(9) = 1
                '
                ' the basic search conditions:
                '
                tUpStr = "c_up = 1 AND c_down = 0 AND c_marriage = 0 And c_collateral = 0"
                tDwnStr = "c_up = 0 AND c_down = 1 AND c_marriage = 0 And c_collateral = 0"
                tMarStr = "c_up = 0 AND c_down = 0 AND c_marriage = 1 And c_collateral = 0"
                tColStr = "c_up = 0 AND c_down = 0 AND c_marriage = 0 And c_collateral = 1"

                .MoveFirst
                Do While Not .EOF
                    '
                    ' the four search strings for each iteration
                    '
                    tSearchStr(1, 1, 1) = tUpStr & " AND c_person_id = " & Str(gRstEdge!c_person_id)
                    tSearchStr(1, 2, 1) = tDwnStr & " AND c_kin_id = " & Str(gRstEdge!c_person_id)
                    ' the second two strings need to be appended at processing time
                    tSearchStr(1, 3, 1) = tUpStr & " AND c_kin_id = " & Str(gRstEdge!c_kin_id)
                    tSearchStr(1, 4, 1) = tDwnStr & " AND c_person_id = " & Str(gRstEdge!c_kin_id)
                    '
                    tSearchStr(2, 1, 1) = tDwnStr & " AND c_person_id = " & Str(gRstEdge!c_person_id)
                    tSearchStr(2, 2, 1) = tUpStr & " AND c_kin_id = " & Str(gRstEdge!c_person_id)
                    ' the second two strings need to be appended at processing time
                    tSearchStr(2, 3, 1) = tDwnStr & " AND c_kin_id = " & Str(gRstEdge!c_kin_id)
                    tSearchStr(2, 4, 1) = tUpStr & " AND c_person_id = " & Str(gRstEdge!c_kin_id)
                    '
                    tSearchStr(3, 1, 1) = tMarStr & " AND c_person_id = " & Str(gRstEdge!c_person_id)
                    tSearchStr(3, 2, 1) = tMarStr & " AND c_kin_id = " & Str(gRstEdge!c_person_id)
                    ' the second two strings need to be appended at processing time
                    tSearchStr(3, 3, 1) = tMarStr & " AND c_kin_id = " & Str(gRstEdge!c_kin_id)
                    tSearchStr(3, 4, 1) = tMarStr & " AND c_person_id = " & Str(gRstEdge!c_kin_id)
                    '
                    tSearchStr(4, 1, 1) = tColStr & " AND c_person_id = " & Str(gRstEdge!c_person_id)
                    tSearchStr(4, 2, 1) = tColStr & " AND c_kin_id = " & Str(gRstEdge!c_person_id)
                    ' the second two strings need to be appended at processing time
                    tSearchStr(4, 3, 1) = tColStr & " AND c_kin_id = " & Str(gRstEdge!c_kin_id)
                    tSearchStr(4, 4, 1) = tColStr & " AND c_person_id = " & Str(gRstEdge!c_kin_id)
                    '
                    tSearchStr(5, 1, 1) = tUpStr & " AND c_person_id = " & Str(gRstEdge!c_person_id)
                    tSearchStr(5, 2, 1) = tDwnStr & " AND c_kin_id = " & Str(gRstEdge!c_person_id)
                    ' the second two strings need to be appended at processing time
                    tSearchStr(5, 3, 1) = tMarStr & " AND c_kin_id = " & Str(gRstEdge!c_kin_id)
                    tSearchStr(5, 4, 1) = tMarStr & " AND c_person_id = " & Str(gRstEdge!c_kin_id)
                    '
                    tSearchStr(5, 1, 2) = tMarStr & " AND c_person_id = " & Str(gRstEdge!c_person_id)
                    tSearchStr(5, 2, 2) = tMarStr & " AND c_kin_id = " & Str(gRstEdge!c_person_id)
                    ' the second two strings need to be appended at processing time
                    tSearchStr(5, 3, 2) = tUpStr & " AND c_kin_id = " & Str(gRstEdge!c_kin_id)
                    tSearchStr(5, 4, 2) = tDwnStr & " AND c_person_id = " & Str(gRstEdge!c_kin_id)
                    '
                    tSearchStr(6, 1, 1) = tUpStr & " AND c_person_id = " & Str(gRstEdge!c_person_id)
                    tSearchStr(6, 2, 1) = tDwnStr & " AND c_kin_id = " & Str(gRstEdge!c_person_id)
                    ' the second two strings need to be appended at processing time
                    tSearchStr(6, 3, 1) = tColStr & " AND c_kin_id = " & Str(gRstEdge!c_kin_id)
                    tSearchStr(6, 4, 1) = tColStr & " AND c_person_id = " & Str(gRstEdge!c_kin_id)
                    '
                    tSearchStr(6, 1, 2) = tColStr & " AND c_person_id = " & Str(gRstEdge!c_person_id)
                    tSearchStr(6, 2, 2) = tColStr & " AND c_kin_id = " & Str(gRstEdge!c_person_id)
                    ' the second two strings need to be appended at processing time
                    tSearchStr(6, 3, 2) = tUpStr & " AND c_kin_id = " & Str(gRstEdge!c_kin_id)
                    tSearchStr(6, 4, 2) = tDwnStr & " AND c_person_id = " & Str(gRstEdge!c_kin_id)
                    '
                    tSearchStr(7, 1, 1) = tMarStr & "AND c_person_id = " & Str(gRstEdge!c_person_id)
                    tSearchStr(7, 2, 1) = tMarStr & "AND c_kin_id = " & Str(gRstEdge!c_person_id)
                    ' the second two strings need to be appended at processing time
                    tSearchStr(7, 3, 1) = tColStr & "AND c_kin_id = " & Str(gRstEdge!c_kin_id)
                    tSearchStr(7, 4, 1) = tColStr & "AND c_person_id = " & Str(gRstEdge!c_kin_id)
                    '
                    tSearchStr(7, 1, 2) = tColStr & "AND c_person_id = " & Str(gRstEdge!c_person_id)
                    tSearchStr(7, 2, 2) = tColStr & "AND c_kin_id = " & Str(gRstEdge!c_person_id)
                    ' the second two strings need to be appended at processing time
                    tSearchStr(7, 3, 2) = tMarStr & "AND c_kin_id = " & Str(gRstEdge!c_kin_id)
                    tSearchStr(7, 4, 2) = tMarStr & "AND c_person_id = " & Str(gRstEdge!c_kin_id)
                    '
                    tSearchStr(8, 1, 1) = tDwnStr & "AND c_person_id = " & Str(gRstEdge!c_person_id)
                    tSearchStr(8, 2, 1) = tUpStr & "AND c_kin_id = " & Str(gRstEdge!c_person_id)
                    ' the second two strings need to be appended at processing time
                    tSearchStr(8, 3, 1) = tMarStr & " AND c_kin_id = " & Str(gRstEdge!c_kin_id)
                    tSearchStr(8, 4, 1) = tMarStr & " AND c_person_id = " & Str(gRstEdge!c_kin_id)
                    '
                    tSearchStr(8, 1, 2) = tMarStr & " AND c_person_id = " & Str(gRstEdge!c_person_id)
                    tSearchStr(8, 2, 2) = tMarStr & " AND c_kin_id = " & Str(gRstEdge!c_person_id)
                    ' the second two strings need to be appended at processing time
                    tSearchStr(8, 3, 2) = tDwnStr & " AND c_kin_id = " & Str(gRstEdge!c_kin_id)
                    tSearchStr(8, 4, 2) = tUpStr & " AND c_person_id = " & Str(gRstEdge!c_kin_id)
                    '
                    tSearchStr(9, 1, 1) = tDwnStr & " AND c_person_id = " & Str(gRstEdge!c_person_id)
                    tSearchStr(9, 2, 1) = tUpStr & " AND c_kin_id = " & Str(gRstEdge!c_person_id)
                    ' the second two strings need to be appended at processing time
                    tSearchStr(9, 3, 1) = tColStr & " AND c_kin_id = " & Str(gRstEdge!c_kin_id)
                    tSearchStr(9, 4, 1) = tColStr & " AND c_person_id = " & Str(gRstEdge!c_kin_id)
                    '
                    tSearchStr(9, 1, 2) = tColStr & " AND c_person_id = " & Str(gRstEdge!c_person_id)
                    tSearchStr(9, 2, 2) = tColStr & " AND c_kin_id = " & Str(gRstEdge!c_person_id)
                    ' the second two strings need to be appended at processing time
                    tSearchStr(9, 3, 2) = tDwnStr & " AND c_kin_id = " & Str(gRstEdge!c_kin_id)
                    tSearchStr(9, 4, 2) = tUpStr & " AND c_person_id = " & Str(gRstEdge!c_kin_id)

                    For tj = 1 To 9
                        If !c_up = tUpVal(tj) And !c_down = tDwnVal(tj) And !c_marriage = tMarVal(tj) And !c_coll
ateral = tColVal(tj) Then
                            tFound = False
                            '
                            tRstEdgeLookup.FindFirst tSearchStr(tj, 1, 1)
                            If tRstEdgeLookup.NoMatch Then
                                '
                                ' look in the other direction
                                '
                                tRstEdgeLookup.FindFirst tSearchStr(tj, 2, 1)
                                If Not tRstEdgeLookup.NoMatch Then
                                    '
                                    tHitCount = 1
                                    tHitID(1) = tRstEdgeLookup!c_person_id
                                    '
                                    ' get the rest
                                    '
                                    Do While Not tRstEdgeLookup.NoMatch
                                         tRstEdgeLookup.FindNext tSearchStr(tj, 2, 1)
                                         If Not tRstEdgeLookup.NoMatch Then
                                             tHitCount = tHitCount + 1
                                             If tHitCount > tHitMax Then
                                                 MsgBox "At " + Str(tRstEdgeLookup!c_person_id) + " HitCount = " _
                                                     + Str(tHitCount)
                                             End If
                                             tHitID(tHitCount) = tRstEdgeLookup!c_person_id
                                         End If
                                    Loop
                                    '
                                    '
                                    ' now see if the person is in fact the same link
                                    '
                                    ti = 1
                                    Do While ti <= tHitCount And Not tFound
                                         tStr = "c_person_id = " & Str(tHitID(ti)) & " and " & tSearchStr(tj, 3, 1
)
                                              tRstEdgeLookup.FindFirst tStr
                                              If tRstEdgeLookup.NoMatch Then
                                                  '
                                                  ' look for the other edge
                                                  '
                                                  tStr = "c_kin_id = " & Str(tHitID(ti)) & " and " & tSearchStr(tj, 4,
1)
                                                     '
                                                     tRstEdgeLookup.FindFirst tStr
                                                     If Not tRstEdgeLookup.NoMatch Then
                                                         tFound = True
                                                     End If
                                              Else
                                                  tFound = True
                                              End If
                                              ti = ti + 1
                                       Loop
                                   End If
                            Else
                                   '
                                   tHitCount = 1
                                   tHitID(1) = tRstEdgeLookup!c_kin_id
                                   '
                                   ' get the rest
                                   '
                                   Do While Not tRstEdgeLookup.NoMatch
                                        tRstEdgeLookup.FindNext tSearchStr(tj, 1, 1)
                                        If Not tRstEdgeLookup.NoMatch Then
                                            tHitCount = tHitCount + 1
                                            If tHitCount > tHitMax Then
                                                MsgBox "(2) At " + Str(tRstEdgeLookup!c_person_id) + " HitCount = " _
                                                    + Str(tHitCount)
                                            End If
                                            tHitID(tHitCount) = tRstEdgeLookup!c_kin_id
                                        End If
                                   Loop
                                   '
                                   ' now see if the person is in fact the same link
                                   '
                                   ti = 1
                                   Do While ti <= tHitCount And Not tFound
                                        tStr = "c_person_id = " & Str(tHitID(ti)) & " and " & tSearchStr(tj, 3, 1)
                                        '
                                        tRstEdgeLookup.FindFirst tStr
                                        If tRstEdgeLookup.NoMatch Then
                                            ' look for the other edge
                                            '
                                            tStr = "c_kin_id = " & Str(tHitID(ti)) & " and " & tSearchStr(tj, 4, 1)
                                            '
                                            tRstEdgeLookup.FindFirst tStr
                                            If Not tRstEdgeLookup.NoMatch Then
                                                ' one could tentatively write an edge between the found node and the
                                                ' current kin node, but I need to wait for instruction
                                                '
                                                tFound = True
                                            End If
                                     Else
                                         tFound = True
                                     End If
                                     ti = ti + 1
                              Loop
                          End If
                          If tj > 4 And Not tFound Then
                              tRstEdgeLookup.FindFirst tSearchStr(tj, 1, 2)
                              If tRstEdgeLookup.NoMatch Then
                                   '
                                   ' look in the other direction
                                   '
                                   tRstEdgeLookup.FindFirst tSearchStr(tj, 2, 2)
                                   If Not tRstEdgeLookup.NoMatch Then
                                       '
                                       tHitCount = 1
                                       tHitID(1) = tRstEdgeLookup!c_person_id
                                       '
                                       ' get the rest
                                       '
                                       Do While Not tRstEdgeLookup.NoMatch
                                           tRstEdgeLookup.FindNext tSearchStr(tj, 2, 2)
                                           If Not tRstEdgeLookup.NoMatch Then
                                               tHitCount = tHitCount + 1
                                               If tHitCount > tHitMax Then
                                                   MsgBox "(3) At " + Str(tRstEdgeLookup!c_person_id) + " HitCou
nt = " _
                                                            + Str(tHitCount)
                                                    End If
                                                    tHitID(tHitCount) = tRstEdgeLookup!c_person_id
                                                End If
                                            Loop
                                            '
                                            ' now see if the person is in fact the same link
                                            '
                                            ti = 1
                                            Do While ti <= tHitCount And Not tFound
                                                 tStr = "c_person_id = " & Str(tHitID(ti)) & " and " & tSearchStr(tj,
3, 2)
                                                '
                                                tRstEdgeLookup.FindFirst tStr
                                                If tRstEdgeLookup.NoMatch Then
                                                    ' look for the other edge
                                                    '
                                                    tStr = "c_kin_id = " & Str(tHitID(ti)) & " and " & tSearchStr(tj,
 4, 2)
                                                       '
                                                       tRstEdgeLookup.FindFirst tStr
                                                       If Not tRstEdgeLookup.NoMatch Then
                                                           ' one could tentatively write an edge between the found node
 and the
                                                           ' current kin node, but I need to wait for instruction
                                                           '
                                                           tFound = True
                                                       End If
                                                Else
                                                    tFound = True
                                                End If
                                                ti = ti + 1
                                         Loop
                                     End If
                              Else
                                     '
                                     tHitCount = 1
                                     tHitID(1) = tRstEdgeLookup!c_kin_id
                                     '
                                     ' get the rest
                                     '
                                     Do While Not tRstEdgeLookup.NoMatch
                                                 tRstEdgeLookup.FindNext tSearchStr(tj, 1, 2)
                                                 If Not tRstEdgeLookup.NoMatch Then
                                                     tHitCount = tHitCount + 1
                                                     If tHitCount > tHitMax Then
                                                         MsgBox "(4) At " + Str(tRstEdgeLookup!c_person_id) + " HitCount =
    " _
                                                             + Str(tHitCount)
                                                     End If
                                                     tHitID(tHitCount) = tRstEdgeLookup!c_kin_id
                                                 End If
                                             Loop
                                             '
                                             ' now see if the person is in fact the same link
                                             '
                                             ti = 1
                                             Do While ti <= tHitCount And Not tFound
                                                  tStr = "c_person_id = " & Str(tHitID(ti)) & " and " & tSearchStr(tj, 3, 2
)
                                                 '
                                                 tRstEdgeLookup.FindFirst tStr
                                                 If tRstEdgeLookup.NoMatch Then
                                                     ' look for the other edge
                                                     '
                                                     tStr = "c_kin_id = " & Str(tHitID(ti)) & " and " & tSearchStr(tj, 4,
2)
                                                         '
                                                         tRstEdgeLookup.FindFirst tStr
                                                         If Not tRstEdgeLookup.NoMatch Then
                                                             '
                                                             tFound = True
                                                         End If
                                                 Else
                                                     tFound = True
                                                 End If
                                                 ti = ti + 1
                                              Loop
                                          End If
                                     End If
                                     '
                                     If tFound Then
                                          .Edit
                                          !c_processed = True
                                          .Update
                                     Else
                                          Call write_edge
                                     End If
                                 End If
                             Next
                             '
                             '    this is where I stopped:     must deal with multiple hits
                             '
                             .MoveNext
                         Loop
                         '
                         ' next get all the rest (although I could do the 3rd degree, but that would require a more elega
nt
                         ' algorithm
                         '
                         .MoveFirst
                         Do While Not .EOF
                              If Not !c_processed Then
                                  Call write_edge
                              End If
                              .MoveNext
                         Loop
                     End With
                     '
                     gGdf.Close
                     gRstNodeList.Close
                     '
                     'Set tRstNode = Nothing
                     'Set gRstEdge = Nothing
                     Set gGdf = Nothing
                     Set tFileSystem = Nothing
                     'Set gRstNodeList = Nothing
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
Private Sub write_edge()
    Dim tStr As String, tMetricSum As Integer, tColor(20) As String
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
    ' find the vertex number of the first node
    '
    gRstNodeList.Seek "=", Str(gRstEdge!c_person_id)
    If Not gRstNodeList.NoMatch Then
         '
         tStr = gRstNodeList!c_v_num + " "
         '
         ' find the vertex number of the second node
         '
         gRstNodeList.Seek "=", Str(gRstEdge!c_kin_id)
         If Not gRstNodeList.NoMatch Then
             tStr = tStr + gRstNodeList!c_v_num + " 1 l "
             '
             gGdf.Write (tStr)
             gGdf.Write (Chr(34))
             gGdf.Write (gRstEdge!c_kin_rel)
             gGdf.Write (Chr(34))
             '
             tMetricSum = gRstEdge!c_marriage + gRstEdge!c_up + gRstEdge!c_down + gRstEdge!c_collateral
             If tMetricSum = 0 Then
                 tMetricSum = 1
             End If
             If tMetricSum > 20 Then
                 tMetricSum = 20
             End If
             gGdf.WriteLine (" c " + tColor(tMetricSum))
             '   color = white (1), blue (2), green (3), yellow (4), orange (5)
             '
             ' update the fact that the record has been processed
             '
             gRstEdge.Edit
             gRstEdge!c_processed = True
             gRstEdge.Update
         End If
    End If
End Sub
Private Sub write_edge_utf8()
    Dim tStr As String, tMetricSum As Integer, tColor(20) As String
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
    ' find the vertex number of the first node
    '
    gRstNodeList.Seek "=", Str(gRstEdge!c_person_id)
    If Not gRstNodeList.NoMatch Then
        '
        tStr = gRstNodeList!c_v_num + " "
        '
        ' find the vertex number of the second node
        '
        gRstNodeList.Seek "=", Str(gRstEdge!c_kin_id)
        If Not gRstNodeList.NoMatch Then
            tStr = tStr + gRstNodeList!c_v_num + " 1 l "
            '
            gStream.WriteText tStr
            gStream.WriteText Chr(34)
            gStream.WriteText gRstEdge!c_kin_rel
            gStream.WriteText Chr(34)
            '
            tMetricSum = gRstEdge!c_marriage + gRstEdge!c_up + gRstEdge!c_down + gRstEdge!c_collateral
            If tMetricSum = 0 Then
                tMetricSum = 1
            End If
            If tMetricSum > 20 Then
                tMetricSum = 20
            End If
            gStream.WriteText " c " + tColor(tMetricSum), adWriteLine
            '   color = white (1), blue (2), green (3), yellow (4), orange (5)
            '
            ' update the fact that the record has been processed
            '
            gRstEdge.Edit
            gRstEdge!c_processed = True
            gRstEdge.Update
        End If
    End If
End Sub

Private Sub calculate_xy_count()
    Dim tX As Double, tY As Double, tXY As Integer, tBM As Variant, tWrite As Integer
    Dim tID As Long
    '
    ' the strategy is to first throw a bookmark at the first new value
    ' then count the number, then go back to the bookmark and update each record
    '
    ' in order to allow the use of the index, gRstPersonID must be reopened as a table
    '
    Set gRstPersonID = CurrentDb.OpenRecordset("ZZ_SCRATCH_KIN", dbOpenTable)
    With gRstPersonID
        .Index = "xy"
        .MoveFirst

        tX = -1#
        tY = -1#
        tXY = 0
        tWrite = 0
        tBM = .Bookmark

        Do While Not .EOF
            If tX <> !kin_x_coord Or tY <> !kin_y_coord Then
                If tWrite = 1 Then
                     ' go back to the first record with the value
                     .Bookmark = tBM
                     Do While tX = !kin_x_coord And tY = !kin_y_coord
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
                tX = !kin_x_coord
                tY = !kin_y_coord
                tID = -2
            End If
            ' increment the count and move to the next
            If tID <> !c_kin_id Then
                tXY = tXY + 1
                tID = !c_kin_id
            End If
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
        .Index = "IndexYear"
    End With
End Sub
Private Sub process_records()
    '
    ' This is the program that does the heavy lifting:
    '     1. check to see if the results are in the table
    '     2. if not, fill in the missing fields and copy the record
    '     3. add the new node to the search array
    '     4. if array is max'ed out, copy the current to [1], etc.
    '     5. get next person on the array
    '
    Dim tLenTotal As Integer, tSex As String, tFemale As Boolean, tPriorFemale As Boolean
    Dim tStr As String, tStrTest As String, ti As Integer, tLen As Integer
    Dim tContinue As Integer, tStrRel As String, tLoopCount As Integer, tStrStart As String
    Dim tStrRelTotalFinal As String, tStrRelTotal As String, tPriorKin As String, tStrAppend As String

    ' we need to get the contextual sex for judgments about collapsing
    ' MsgBox "In process_records"

    ' open the list

    Set gRst = CurrentDb.OpenRecordset("ZZ_KIN_LIST_TMP", dbOpenDynaset)

    With gRst
        If Not .EOF Then
            .MoveFirst
            Do While Not .EOF
                '
                ' we need to strip all numbers and other symbols from
                ' the test string, except for the generational markers
                '
                tLenTotal = Len(!c_kinrel_total)

                tStrRelTotal = ""
                If !c_kinrel_total = "ego" Then
                     tStrRel = !c_kinrel
                Else
                     tStrRel = !c_kinrel_total_raw
                End If

                'MsgBox "tStrRel = " + tStrRel + ", tStrRelTotal = " + tStrRelTotal + _
                '    ", and tStrRelTotalFinal = " + tStrRelTotalFinal

                '
                ' here the idea is to append a cleaned up version of the kinrel string to the tail-end
                ' of the initial total kinrel string. This will then be tested for reduction
                '
                ' MsgBox "Beginning to strip extra characters"

                tLen = Len(tStrRel)
                ti = 1
                tLoopCount = 1
                Do While ti <= tLen And tLoopCount < 50
                    tLoopCount = tLoopCount + 1
                    tStrTest = Mid(tStrRel, ti, 1)
                    '
                    ' the Select Case statement seems to be case-INsenstive, so I weed out the lower case
                    ' values first
                    '
                    If InStr(1, "fmbzsdhwcapkg", tStrTest, vbBinaryCompare) = 0 Then
                        Select Case tStrTest
                            Case "F", "M", "B", "Z"
                                tStrRelTotal = tStrRelTotal + tStrTest
                            Case "S", "D", "H", "W", "C", "A"
                                tStrRelTotal = tStrRelTotal + tStrTest
                            Case "P"
                                If Mid(tStrRel, ti, 3) = "P+1" Or Mid(tStrRel, ti, 3) = "P-1" Then
                                     tStrRelTotal = tStrRelTotal + Mid(tStrRel, ti, 3)
                                       ti = ti + 2
                                Else
                                     tStrRelTotal = tStrRelTotal + tStrTest
                                End If
                            Case "K"
                                If Mid(tStrRel, ti + 1, 1) = "+" Or Mid(tStrRel, ti + 1, 1) = "-" Then
                                     If Mid(tStrRel, ti + 2, 1) = "n" Or IsNumeric(Mid(tStrRel, ti + 2, 1)) Then
                                          tStrRelTotal = tStrRelTotal + Mid(tStrRel, ti, 3)
                                          ti = ti + 2
                                     Else
                                          tStrRelTotal = tStrRelTotal + Mid(tStrRel, ti, 2)
                                          ti = ti + 1
                                     End If
                                Else
                                     tStrRelTotal = tStrRelTotal + tStrTest
                                End If
                            Case "G"
                                If Mid(tStrRel, ti + 1, 1) = "+" Or Mid(tStrRel, ti + 1, 1) = "-" Then
                                     If Mid(tStrRel, ti + 2, 1) = "n" Or IsNumeric(Mid(tStrRel, ti + 2, 1)) Then
                                          If IsNumeric(Mid(tStrRel, ti + 3, 1)) Then
                                               tStrRelTotal = tStrRelTotal + Mid(tStrRel, ti, 4)
                                               ti = ti + 3
                                          Else
                                               tStrRelTotal = tStrRelTotal + Mid(tStrRel, ti, 3)
                                               ti = ti + 2
                                          End If
                                     End If
                                End If
                            Case Else
                                ti = ti
                        End Select
                    End If
                    ti = ti + 1
                Loop
                '
                tStrRelTotalFinal = tStrRelTotal
                     'MsgBox "tStrRel = " + tStrRel + ", tStrRelTotal = " + tStrRelTotal + _
                     '    ", and tStrRelTotalFinal = " + tStrRelTotalFinal
                '
                ' update the total kinrel string
                '
                .Edit
                !c_kinrel_total = tStrRelTotalFinal
                .Update
                .MoveNext
             Loop
        End If
    End With
    gRst.Close
End Sub
Private Sub CmdSelectPerson_Click()
On Error GoTo Err_CmdSelectPerson_Click

    Dim stDocName As String, tRstPeople As DAO.Recordset
    Dim stLinkCriteria As String, cmdSQL As ADODB.Command
    Dim strPERSON_ID As String, tStrQuery As String, tQuit As Boolean

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    '
    tQuit = False
    If Not tQuit Then
        TxtPersonID.Visible = True
        TxtPersonID.SetFocus
        strPERSON_ID = TxtPersonID.Text


        stDocName = "frmSelectPerson"
        DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strPERSON_ID

        If CurrentProject.AllForms("frmSelectPerson").IsLoaded Then
           Dim lngPERSON_ID As Long
           Dim strPERSON_NM As String
           Dim strPERSON_NM_CHN As String

           Forms!frmSelectPerson!frmPersonSearch.Form!c_personid.SetFocus
           lngPERSON_ID = Forms!frmSelectPerson!frmPersonSearch.Form!c_personid.Value
           TxtPersonID.Value = lngPERSON_ID

           Forms!frmSelectPerson!frmPersonSearch.Form!c_name_chn.SetFocus
           strPERSON_NM_CHN = Forms!frmSelectPerson!frmPersonSearch.Form!c_name_chn.Value
           TxtNameChn.Value = strPERSON_NM_CHN

           Forms!frmSelectPerson!frmPersonSearch.Form!c_name.SetFocus
           strPERSON_NM = Forms!frmSelectPerson!frmPersonSearch.Form!c_name.Value
           TxtName.Value = strPERSON_NM

           DoCmd.Close acForm, stDocName
           '
           ' now load the one ID into the ImportPeople table
           '
             '
             ' Clear the people table now that we are ready to go
             '
             cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_IMPORT_PEOPLE"
             cmdSQL.Execute tRecDeleted

            '
            ' add the name
            '
            tStrQuery = "INSERT INTO ZZ_SCRATCH_IMPORT_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, c_
female, c_addr_id, c_addr_name, c_addr_chn, " + _
                "c_addr_type, c_addr_desc, c_addr_desc_chn, x_coord, y_coord ) " + _
                "SELECT ZZZ_BIOG_MAIN.c_personid, ZZZ_BIOG_MAIN.c_name, ZZZ_BIOG_MAIN.c_name_chn, ZZZ_BIOG_MAIN.c
_index_year, " + _
                "ZZZ_BIOG_MAIN.c_female, ZZZ_BIOG_MAIN.c_index_addr_id, ZZZ_BIOG_MAIN.c_index_addr_name, ZZZ_BIOG
_MAIN.c_index_addr_chn, " + _
                "ZZZ_BIOG_MAIN.c_index_addr_type_code, ZZZ_BIOG_MAIN.c_index_addr_type_desc, ZZZ_BIOG_MAIN.c_inde
x_addr_type_chn, ZZZ_BIOG_MAIN.x_coord, " + _
                "ZZZ_BIOG_MAIN.y_coord " + _
                "FROM ZZZ_BIOG_MAIN WHERE (((ZZZ_BIOG_MAIN.c_personid)=" + Str(lngPERSON_ID) + "))"

            cmdSQL.CommandText = tStrQuery
            cmdSQL.Execute tRecDeleted

            If tRecDeleted = 0 Then
                 MsgBox "The ID " + Trim(Str(lngPERSON_ID)) + " is not valid"
                 CmdRun.Enabled = False
            Else
                 '
                 ' now enable the Run button
                 '
                 CmdRun.Enabled = True
            End If

            Set cmdSQL = Nothing

        End If
    End If

    gCurRecallSource = ""

    CmdSelectPerson.SetFocus
    TxtPersonID.Visible = False

Exit_CmdSelectPerson_Click:
    Exit Sub

Err_CmdSelectPerson_Click:
    MsgBox Err.Description
    Resume Exit_CmdSelectPerson_Click

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
    '   ID color shape size shortlabel active
    '       color = red (1), orange (2), yellow (3), green (4), blue (5)
    '       shortlabel = c_name
    '       shape = 2
    '       active = TRUE
    '
    '   *tie data
    '   from to edgetype nodedist
    '       from = str(c_person_id)
    '       to = str(c_node_id)
    '       edgetype= c_link_type (K,N)
    '
    '   *tie properties
    '   from to color size active
    '       from = str(c_person_id)
    '       to = str(c_node_id)
    '       color = red (255), orange (26367), yellow (65535), green (32768), blue (16711680)
    '       size = 1-5 (the weight)
    '
    '   the central question is whether to do distance optimizations
    '
    '   first see if there are any records to process
    '

    If frmZZ_SCRATCH_KINNET.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdUCINet_Click
    End If
    '
    If frmZZ_SCRATCH_KIN.Form.Recordset.RecordCount = 0 Then
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

    'Use a With...End With block to reference the FileDialog object.
    With dlgSaveAs
        .InitialFileName = "kin_network.vna"
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
             tColor(1) = "0 "         ' black
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
            Set tRstEdge = CurrentDb.OpenRecordset("ZZ_SCRATCH_KINNET", dbOpenDynaset)
            Set tRstNode = CurrentDb.OpenRecordset("ZZ_SCRATCH_KIN", dbOpenDynaset)
            tQuote = Chr(34) ' the quotation mark
            '
            ' first the nodes: define the node data structure
            tVNA.WriteLine ("*node data")
            tVNA.WriteLine ("ID index_year dy_code dynasty sex x_coord y_coord kindist")
            '
            With tRstNode
                 .MoveFirst
                 Do While Not .EOF
                      ' name = the ID of the person
                      If IsNull(!c_kin_id) Then
                           tStr = "[?] "
                      Else
                           tStr = Trim(Str(!c_kin_id)) + " "
                      End If
                      '
                      ' indexyear = c_index_year INT
                      If IsNull(!c_kin_index_year) Then
                           tStr = tStr + "0 "
                      Else
                           tStr = tStr + Trim(Str(!c_kin_index_year)) + " "
                      End If
                      '
                      ' dy = c_kin_dy INT
                      If IsNull(!c_kin_dynasty) Then
                           tStr = tStr + "0 "
                      Else
                           tStr = tStr + Trim(Str(!c_kin_dy)) + " "
                      End If
                      '
                      ' dynasty = c_kin_dynasty
                      If IsNull(!c_kin_dynasty) Then
                           tStr = tStr + tQuote + "Unknown" + tQuote + " "
                      Else
                           tStr = tStr + tQuote + Trim(!c_kin_dynasty) + tQuote + " "
                      End If
                      '
                      '    sex = c_female > (F,M)
                      If !c_kin_female = -1 Then
                           tStr = tStr + tQuote + "F" + tQuote + " "
                      Else
                           tStr = tStr + tQuote + "M" + tQuote + " "
                      End If
                      '
                      '    x_coord
                      If IsNull(!kin_x_coord) Then
                           tStr = tStr + "0 "
                      Else
                           tStr = tStr + Trim(Str(!kin_x_coord)) + " "
                      End If
                      '
                      '    y_coord
                      If IsNull(!kin_y_coord) Then
                           tStr = tStr + "0 "
                      Else
                           tStr = tStr + Trim(Str(!kin_y_coord)) + " "
                      End If
                      '
                      '    node distance
                      tStr = tStr + Trim(Str(!c_up + !c_down + !c_collateral + !c_marriage))
                      '
                      tVNA.WriteLine (tStr)
                      .MoveNext
                 Loop
            End With
            '
            ' now the node properties
            '
            ' note: the ACTIVE parameter has been removed (MAF 2018/07/22)
            '
            tVNA.WriteLine ("*node properties")
            tVNA.WriteLine ("ID color shape size shortlabel")
            '
            With tRstNode
                .MoveFirst
                Do While Not .EOF
                     ' ID = the ID of the person
                     If IsNull(!c_kin_id) Then
                          tStr = "[?] "
                     Else
                          tStr = Trim(Str(!c_kin_id)) + " "
                     End If
                     '
                     ' color = black (1), blue (2), green (3), yellow (4), orange (5)
                     tStr = tStr + tColor(!c_up + !c_down + !c_collateral + !c_marriage + 1)
                     '
                     ' shape = 2? / size = 1?
                     tStr = tStr + "2 1 "
                     '
                     ' shortlabel (+Active = "TRUE" removed)
                     If IsNull(!c_kin_name) Then
                          tStr = tStr + "[Missing]"
                     Else
                          tStr = tStr + tQuote + !c_kin_name + tQuote
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
                     tStr = tStr + Trim(Str(!c_kin_id)) + " 1 "
                     '
                     '
                     If IsNull(!c_kin_rel) Then
                          tStr = tStr + "[?] "
                     Else
                          tStr = tStr + tQuote + !c_kin_rel + tQuote + " "
                     End If
                     '
                     '    edgedist
                     tStr = tStr + Trim(Str(!c_upstep + !c_dwnstep + !c_marstep + !c_colstep))
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

Private Sub CmdUTF8Pajek_Click()
On Error GoTo Err_CmdUTF8Pajek_Click

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
    If frmZZ_SCRATCH_KIN.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdUTF8Pajek_Click
    End If
    '
    If frmZZ_SCRATCH_KINNET.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdUTF8Pajek_Click
    End If
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer, tFileName As String, tFN As Variant, tMetricSum As Integer
    Dim tRstNodeList As DAO.Recordset
    ' Dim tRstNodeList As DAO.Recordset
    ' Dim tRstEdge As DAO.Recordset
    Dim tStr As String, tC As String, ti As Integer, tQueryStr As String
    Dim tColor(20) As String
    Dim tFileSystem
    ' Dim tGDF

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)


    '   to write to a UTF-8 file, use the ADO stream object

    Set gStream = New ADODB.Stream
    If CodeFrame.Value = 1 Then
         gStream.Charset = "utf-8"
         tCodeStr = "UTF8.net"
    ElseIf CodeFrame.Value = 2 Then
         gStream.Charset = "big5"
         tCodeStr = "BIG5.net"
    ElseIf CodeFrame.Value = 3 Then
         gStream.Charset = "gb2312"
         tCodeStr = "GB2312.net"
    Else
         gStream.Charset = "ascii"
         tCodeStr = "ascii.net"
    End If
    gStream.Mode = adModeReadWrite
    gStream.Type = adTypeText
    gStream.Open


    'Use a With...End With block to reference the FileDialog object.
    With dlgSaveAs
        .InitialFileName = "kin_" + tCodeStr
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
                 GoTo Exit_CmdUTF8Pajek_Click
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
            Set gRstNodeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK", dbOpenTable)
            gRstNodeList.Index = "c_ID"
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
            ' prepare the temp table for the edge data

             cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_KINNET_EDGE"
             cmdSQL.Execute tRecDeleted
             '
             ' copy the data
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_KINNET_EDGE SELECT ZZ_SCRATCH_KINNET.* FROM ZZ_SCRATCH_KINNET"
            '
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            ' now delete the unneeded edges (i.e. if we have e->F and F->FF, we don't need e->FF)
            '
            tQueryStr = "UPDATE (ZZ_SCRATCH_KINNET_EDGE INNER JOIN ZZ_SCRATCH_KINNET_EDGE AS " + _
                "ZZ_SCRATCH_KINNET_EDGE_1 ON ZZ_SCRATCH_KINNET_EDGE.c_person_id = " + _
                "ZZ_SCRATCH_KINNET_EDGE_1.c_person_id) INNER JOIN ZZ_SCRATCH_KINNET_EDGE AS " + _
                "ZZ_SCRATCH_KINNET_EDGE_2 ON (ZZ_SCRATCH_KINNET_EDGE_1.c_kin_id = " + _
                "ZZ_SCRATCH_KINNET_EDGE_2.c_person_id) AND (ZZ_SCRATCH_KINNET_EDGE.c_kin_id = " + _
                "ZZ_SCRATCH_KINNET_EDGE_2.c_kin_id) SET ZZ_SCRATCH_KINNET_EDGE.c_delete = 1 " + _
                "WHERE (((ZZ_SCRATCH_KINNET_EDGE.c_upstep)=[ZZ_SCRATCH_KINNET_EDGE_1].[c_upstep]+ " + _
                "[ZZ_SCRATCH_KINNET_EDGE_2].[c_upstep]) AND ((ZZ_SCRATCH_KINNET_EDGE.c_dwnstep)=" + _
                "[ZZ_SCRATCH_KINNET_EDGE_1].[c_dwnstep]+[ZZ_SCRATCH_KINNET_EDGE_2].[c_dwnstep]) AND " + _
                "((ZZ_SCRATCH_KINNET_EDGE.c_marstep)=[ZZ_SCRATCH_KINNET_EDGE_1].[c_marstep]+" + _
                "[ZZ_SCRATCH_KINNET_EDGE_2].[c_marstep]) AND ((ZZ_SCRATCH_KINNET_EDGE.c_colstep)=" + _
                "[ZZ_SCRATCH_KINNET_EDGE_1].[c_colstep]+[ZZ_SCRATCH_KINNET_EDGE_2].[c_colstep]))"
            '
            'MsgBox "About to prune"
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_KINNET_EDGE WHERE c_delete = 1"
            cmdSQL.Execute tRecDeleted
            'MsgBox "Pruning complete"
            '
            ' now set the count to 1 ;

            cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_KINNET_EDGE SET ZZ_SCRATCH_KINNET_EDGE.c_kin_rel_count = 1"
            cmdSQL.Execute tRecDeleted
            '
            ' now get the nodes
            '
            cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PAJEK"
            cmdSQL.Execute tRecDeleted
            '
            ' fill the node list (Imported lists processed differently from single-person)
            '
            If Left(TxtName.Value, 1) = "[" Then
                If CodeFrame.Value = 4 Then
                    tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK ( c_ID, c_lbl, c_distance, c_v_num, c_delete ) " +
_
                              "SELECT DISTINCT ZZ_SCRATCH_KIN.c_kin_id, ZZ_SCRATCH_KIN.c_kin_name, " + _
                              "1 as c_distance, " + _
                              "str(ZZ_SCRATCH_KIN.c_kin_id) AS c_v_num, TRUE as c_delete FROM ZZ_SCRATCH_KIN"
                   Else
                          tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK ( c_ID, c_lbl, c_distance, c_v_num, c_delete ) " +
_
                              "SELECT DISTINCT ZZ_SCRATCH_KIN.c_kin_id, ZZ_SCRATCH_KIN.c_kin_chn, " + _
                              "1 as c_distance, " + _
                              "str(ZZ_SCRATCH_KIN.c_kin_id) AS c_v_num, TRUE as c_delete FROM ZZ_SCRATCH_KIN"
                   End If
            Else
                   If CodeFrame.Value = 4 Then
                       tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK ( c_ID, c_lbl, c_distance, c_v_num, c_delete ) " +
_
                              "SELECT DISTINCT ZZ_SCRATCH_KIN.c_kin_id, ZZ_SCRATCH_KIN.c_kin_name, " + _
                              "(ZZ_SCRATCH_KIN.c_up + ZZ_SCRATCH_KIN.c_down + " + _
                              "ZZ_SCRATCH_KIN.c_marriage + ZZ_SCRATCH_KIN.c_collateral) as c_distance, " + _
                              "str(ZZ_SCRATCH_KIN.c_kin_id) AS c_v_num, TRUE as c_delete FROM ZZ_SCRATCH_KIN"
                   Else
                          tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK ( c_ID, c_lbl, c_distance, c_v_num, c_delete ) " +
_
                              "SELECT DISTINCT ZZ_SCRATCH_KIN.c_kin_id, ZZ_SCRATCH_KIN.c_kin_chn, " + _
                              "(ZZ_SCRATCH_KIN.c_up + ZZ_SCRATCH_KIN.c_down + " + _
                              "ZZ_SCRATCH_KIN.c_marriage + ZZ_SCRATCH_KIN.c_collateral) as c_distance, " + _
                              "str(ZZ_SCRATCH_KIN.c_kin_id) AS c_v_num, TRUE as c_delete FROM ZZ_SCRATCH_KIN"
                End If
            End If

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            ' now reset the original people on the list to distance = 0
            '
            If Left(TxtName.Value, 1) = "[" Then
                tQueryStr = "UPDATE ZZ_SCRATCH_IMPORT_PEOPLE INNER JOIN ZZ_SCRATCH_PAJEK ON " + _
                     "ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id = ZZ_SCRATCH_PAJEK.c_ID SET ZZ_SCRATCH_PAJEK.c_distance
    = 0"
                cmdSQL.CommandText = tQueryStr
                cmdSQL.Execute tRecDeleted
            End If
            '
            ' if needed, find the 0-degree nodes, using the edge list to mark the node list
            '
            If ChkDegree.Value Then
                '
                cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_PAJEK INNER JOIN ZZ_SCRATCH_KINNET ON ZZ_SCRATCH_PAJEK.c_
id = ZZ_SCRATCH_KINNET.c_person_id " + _
                    "SET ZZ_SCRATCH_PAJEK.c_delete = False"
                cmdSQL.Execute tRecDeleted
                '
                cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_PAJEK INNER JOIN ZZ_SCRATCH_KINNET ON ZZ_SCRATCH_PAJEK.c_
id = ZZ_SCRATCH_KINNET.c_kin_id " + _
                    "SET ZZ_SCRATCH_PAJEK.c_delete = False"
                cmdSQL.Execute tRecDeleted
                '
                ' remove records where c_degree is NULL
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
             ' fill in the edge list
             '
             cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PAJEK_EDGE"
             cmdSQL.Execute tRecDeleted
             '
             ' this commented-out approach allows parallel edges.: NOTE: c_edge_desc MUST BE ADDED to the PRIMA
RY KEY
             '
             'tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK_EDGE ( c_node_1, c_node_2, c_edge_desc, c_edge_dist ) " +
_
                 "SELECT Val(ZZ_SCRATCH_PAJEK.c_v_num) AS c_node_1, Val(ZZ_SCRATCH_PAJEK_1.c_v_num) " + _
                 "AS c_node_2, ZZ_SCRATCH_KINNET_EDGE.c_kin_rel, (ZZ_SCRATCH_KINNET_EDGE.c_upstep + " + _
                 "ZZ_SCRATCH_KINNET_EDGE.c_dwnstep + ZZ_SCRATCH_KINNET_EDGE.c_marstep + " + _
                 "ZZ_SCRATCH_KINNET_EDGE.c_colstep) AS c_edge_dist " + _
                 "FROM (ZZ_SCRATCH_PAJEK INNER JOIN ZZ_SCRATCH_KINNET_EDGE ON ZZ_SCRATCH_PAJEK.c_ID = " + _
                 "ZZ_SCRATCH_KINNET_EDGE.c_person_id) INNER JOIN ZZ_SCRATCH_PAJEK AS ZZ_SCRATCH_PAJEK_1 " + _
                 "ON ZZ_SCRATCH_KINNET_EDGE.c_kin_id = ZZ_SCRATCH_PAJEK_1.c_ID"

             ' because it is possible to have parallel edges (more than one significant kinship relation between t
wo people)
             ' we need to do as we have done in other forms

                         '
             ' fill the edge list
             '
             tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK_EDGE ( c_node_1, c_node_2, c_edge_count, c_edge_dist ) " +
_
                 "SELECT Val([ZZ_SCRATCH_PAJEK].[c_v_num]) AS c_node_1, " + _
                 "Val([ZZ_SCRATCH_PAJEK_1].[c_v_num]) AS c_node_2, " + _
                 "Sum(ZZ_SCRATCH_KINNET_EDGE.c_kin_rel_count) AS SumOfc_kin_rel_count, " + _
                 "Min((ZZ_SCRATCH_KINNET_EDGE.c_upstep + " + _
                 "ZZ_SCRATCH_KINNET_EDGE.c_dwnstep + ZZ_SCRATCH_KINNET_EDGE.c_marstep + " + _
                 "ZZ_SCRATCH_KINNET_EDGE.c_colstep)) AS MinOfc_edge_dist " + _
                 "FROM ZZ_SCRATCH_PAJEK AS ZZ_SCRATCH_PAJEK_1 INNER JOIN " + _
                 "(ZZ_SCRATCH_KINNET_EDGE INNER JOIN ZZ_SCRATCH_PAJEK ON ZZ_SCRATCH_KINNET_EDGE.c_person_id = " +
_
                 "ZZ_SCRATCH_PAJEK.c_ID) ON ZZ_SCRATCH_PAJEK_1.c_ID = ZZ_SCRATCH_KINNET_EDGE.c_kin_id " + _
                 "GROUP BY Val([ZZ_SCRATCH_PAJEK].[c_v_num]), Val([ZZ_SCRATCH_PAJEK_1].[c_v_num])"


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
             tQueryStr = "UPDATE ((ZZ_SCRATCH_KINNET_EDGE INNER JOIN TMP_SCRATCH_PAJEK ON " + _
                     "ZZ_SCRATCH_KINNET_EDGE.c_person_id = TMP_SCRATCH_PAJEK.c_ID)" + _
                     " INNER JOIN ZZ_SCRATCH_PAJEK_EDGE ON " + _
                     "TMP_SCRATCH_PAJEK.c_v_num = ZZ_SCRATCH_PAJEK_EDGE.c_node_1) " + _
                     "INNER JOIN TMP_SCRATCH_PAJEK AS TMP_SCRATCH_PAJEK_1 ON (TMP_SCRATCH_PAJEK_1.c_v_num = " + _
                     "ZZ_SCRATCH_PAJEK_EDGE.c_node_2) AND (ZZ_SCRATCH_KINNET_EDGE.c_kin_id = TMP_SCRATCH_PAJEK_1.c
_ID) " + _
                     "SET ZZ_SCRATCH_PAJEK_EDGE.c_edge_desc = [ZZ_SCRATCH_KINNET_EDGE].[c_kin_rel] " + _
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

             Set gRstEdge = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK_EDGE", dbOpenDynaset)
             Set tRstNodeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK", dbOpenDynaset)
             tRstNodeList.MoveLast

             tC = Chr(44) ' the comma
             '
             ' first the nodes: define the record structure
             '
             With tRstNodeList
                 .MoveFirst
                 '
                 tStr = "*Vertices " + Trim(Str(tRstNodeList.RecordCount))
                 gStream.WriteText tStr, adWriteLine
                 '
                 Do While Not .EOF
                     gStream.WriteText !c_v_num + " " + Chr(34)
                     ' name = the ID of the person
                     '
                     If ChkIncludeID.Value Then
                          gStream.WriteText !c_lbl + ":" + Trim(Str(!c_ID)) + Chr(34)
                     Else
                          gStream.WriteText !c_lbl + Chr(34)
                     End If
                     '
                     gStream.WriteText " box "
                     ' label
                     If !c_distance > 19 Then
                          tStr = " ic " + tColor(20) + " bc " + tColor(20)
                     Else
                          tStr = " ic " + tColor(!c_distance + 1) + " bc " + tColor(!c_distance + 1)
                     End If
                     ' color = white (1), blue (2), green (3), yellow (4), orange (5)
                     gStream.WriteText tStr, adWriteLine
                         '
                         .MoveNext
                     Loop
                 End With
                 '
                 ' now the arcs: define the record structure as directional
                 tStr = "*Arcs"
                 gStream.WriteText tStr, adWriteLine

                 With gRstEdge
                     '
                     .MoveFirst
                     Do While Not .EOF
                          '
                          gStream.WriteText Trim(Str(!c_node_1)) + " " + Trim(Str(!c_node_2)) + " 1 l "
                          gStream.WriteText Chr(34)
                          gStream.WriteText !c_edge_desc
                          gStream.WriteText Chr(34)
                          '
                          If !c_edge_dist > 19 Then
                               gStream.WriteText " c " + tColor(20), adWriteLine
                          ElseIf !c_edge_dist = 0 Then
                               gStream.WriteText " c " + tColor(1), adWriteLine
                          Else
                               gStream.WriteText " c " + tColor(!c_edge_dist), adWriteLine
                          End If
                          .MoveNext
                     Loop
                 End With
                 '
                 gRstNodeList.Close
                 '
                 ' now make sure all the data is copied to tStream
                 gStream.Flush
                 ' and write the stream to the file
                 gStream.SaveToFile tFileName, adSaveCreateOverWrite
                 '
                 gStream.Close
                 Set gStream = Nothing
                 '
                 'Set tRstNode = Nothing
                 'Set gRstEdge = Nothing
                 'Set gRstNodeList = Nothing

          Else
             'The user pressed Cancel.
        End If
    End With

    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdUTF8Pajek_Click:
    Exit Sub

Err_CmdUTF8Pajek_Click:
    MsgBox Err.Description
    Resume Exit_CmdUTF8Pajek_Click

End Sub


Private Sub Form_Open(Cancel As Integer)
    Dim tRstDummy As DAO.Recordset
    Dim cmdDel As ADODB.Command, tRecDeleted As Long
    '
    ' Clear the input and output tables
    '
    Set cmdDel = New ADODB.Command
    cmdDel.ActiveConnection = CurrentProject.Connection
    cmdDel.CommandType = adCmdText
    cmdDel.CommandText = "Delete * from ZZ_SCRATCH_IMPORT_PEOPLE"
    cmdDel.Execute tRecDeleted
    '
    Set gRstPersonID = Forms!LookAtKinship!frmZZ_SCRATCH_KIN.Form.Recordset
    Set gRstKinList = Forms!LookAtKinship!frmZZ_SCRATCH_KINNET.Form.Recordset
    '
    If (gRstPersonID.RecordCount + gRstKinList.RecordCount) > 0 Then
        '
        cmdDel.CommandText = "Delete * from ZZ_SCRATCH_KIN"
        cmdDel.Execute tRecDeleted
        cmdDel.CommandText = "Delete * from ZZ_SCRATCH_KINNET"
        cmdDel.Execute tRecDeleted
        Set cmdDel = Nothing
        '
        Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_KIN", dbOpenDynaset)
        Set Forms!LookAtKinship!frmZZ_SCRATCH_KIN.Form.Recordset = tRstDummy
        gRstPersonID.Close
        Set gRstPersonID = CurrentDb.OpenRecordset("ZZ_SCRATCH_KIN", dbOpenDynaset)
        Set Forms!LookAtKinship!frmZZ_SCRATCH_KIN.Form.Recordset = gRstPersonID
        '
        Set Forms!LookAtKinship!frmZZ_SCRATCH_KINNET.Form.Recordset = tRstDummy
        gRstKinList.Close
        Set gRstKinList = CurrentDb.OpenRecordset("ZZ_SCRATCH_KINNET", dbOpenDynaset)
        Set Forms!LookAtKinship!frmZZ_SCRATCH_KINNET.Form.Recordset = gRstKinList
        '
        Set tRstDummy = Nothing
    End If
    '
    ChkMourning.Value = False
    ChkIncludeID.Value = False

    gCurRecallSource = ""
    '
    'open a comforting message window
    '
    ' first determine the language
    gLCID = Application.LanguageSettings.LanguageID(msoLanguageIDUI)
    If gLCID = 2052 Or gLCID = 4100 Then      ' 2052 = PRC, 4100 = Singapore
         gDisplayLanguage = "S"
    ElseIf gLCID = 3076 Or gLCID = 1028 Then ' 3076 = Hong Kong, 1028 = Taiwan
         gDisplayLanguage = "T"
         Call changeDisplayLanguage
    Else
         gDisplayLanguage = "E"
         Call changeDisplayLanguage
    End If

    If DCount("*", "ZZ_STORE_PERSON_ID") > 0 Then
        CmdRecallID.Enabled = True
    End If
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
             If !c_form = "LAK" Then
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
        Me.CmdSelectPerson.Caption = tLabelLanguage(tLang, 1)
        Me.CmdImport.Caption = tLabelLanguage(tLang, 2)
        Me.LblMourning.Caption = tLabelLanguage(tLang, 3)
        Me.LblMaxAncestor.Caption = tLabelLanguage(tLang, 4)
        Me.LblMaxDescend.Caption = tLabelLanguage(tLang, 5)
        Me.LblMaxCol.Caption = tLabelLanguage(tLang, 6)
        Me.LblMaxMar.Caption = tLabelLanguage(tLang, 7)
        Me.LblMaxLoop.Caption = tLabelLanguage(tLang, 8)
        Me.CmdRun.Caption = tLabelLanguage(tLang, 9)
        Me.CmdClose.Caption = tLabelLanguage(tLang, 10)
        Me.CmdUCINet.Caption = tLabelLanguage(tLang, 11)

          Me.CmdUTF8Pajek.Caption = tLabelLanguage(tLang, 12)
          Me.LblIncludeID.Caption = tLabelLanguage(tLang, 13)
          Me.LblPajek_Pinyin.Caption = tLabelLanguage(tLang, 14)
          Me.LblPajek_GB.Caption = tLabelLanguage(tLang, 15)
          Me.LblPajek_Big5.Caption = tLabelLanguage(tLang, 16)
          Me.CmdGUESS.Caption = tLabelLanguage(tLang, 17)
          Me.CmdGIS.Caption = tLabelLanguage(tLang, 18)
          Me.LblGIS_GB.Caption = tLabelLanguage(tLang, 19)
          Me.CmdFanti.Caption = tLabelLanguage(tLang, 20)
          Me.CmdJianti.Caption = tLabelLanguage(tLang, 21)
          Me.PageKinshipNet.Caption = tLabelLanguage(tLang, 22)
          Me.PageEgoRel.Caption = tLabelLanguage(tLang, 23)
          Me.LblSaveClipboard.Caption = tLabelLanguage(tLang, 24)
          Me.LblDisplay.Caption = tLabelLanguage(tLang, 25)
          Me.CmdHelp.Caption = tLabelLanguage(tLang, 26)
          Me.CmdStoreID.Caption = tLabelLanguage(tLang, 27)
          Me.CmdRecallID.Caption = tLabelLanguage(tLang, 28)
          Me.LblChkDegree.Caption = tLabelLanguage(tLang, 29)
          Me.CmdNeo4j.Caption = tLabelLanguage(tLang, 30)
          Me.PagePeople.Caption = tLabelLanguage(tLang, 31)
          Me.LblChkSimplify.Caption = tLabelLanguage(tLang, 32)
          Me.LblChkEgo.Caption = tLabelLanguage(tLang, 33)
    End If

End Sub

Private Sub CmdHelp_Click()
On Error GoTo Err_CmdHelp_Click
    Dim tStrPDF As String

    tStrPDF = Application.CurrentProject.Path + "\HelpFiles\HelpFile_LookAtKinship.pdf"

    'MsgBox tStrPDF

    Application.FollowHyperlink tStrPDF, , True


Exit_CmdHelp_Click:
    Exit Sub

Err_CmdHelp_Click:
    MsgBox Err.Description
    Resume Exit_CmdHelp_Click

End Sub

Private Sub writeKML()

    Dim tStrKML As String
    '
    ' This program will dump the results to a .kml file
    '
    If frmZZ_SCRATCH_KIN.Form.Recordset.RecordCount = 0 Then
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
    Dim tStr As String, tTab As String, ti As Integer
    Dim tFileSystem, tGDF

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

    dlgSaveAs.InitialFileName = "kin_gis_" + tCodeStr + ".kml"
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
        '        tStr = "Name" + "NameChn" + "IndexYear" + "Sex" + _
                 "Relation" + "AddrName" + tC + "AddrChn" + _
                 "X" + "Y" + "XY_count"
        '
        ' process the table
        '
        If Left(TxtName.Value, 1) = "[" Then
             tStr = "SELECT KIN_QUERY.*, ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id " + _
                 "FROM (SELECT DISTINCT ZZ_SCRATCH_KIN.c_kin_id, ZZ_SCRATCH_KIN.c_kin_name, ZZ_SCRATCH_KIN.c_kin_c
hn, " + _
                     "ZZ_SCRATCH_KIN.kin_x_coord, ZZ_SCRATCH_KIN.kin_y_coord, ZZ_SCRATCH_KIN.c_kin_addr_name, " +
_
                     "ZZ_SCRATCH_KIN.c_kin_addr_chn, ZZ_SCRATCH_KIN.c_kin_addr_desc_chn, ZZ_SCRATCH_KIN.c_kin_inde
x_year, " + _
                     "ZZ_SCRATCH_KIN.c_kin_female, ZZ_SCRATCH_KIN.xy_count " + _
                     "FROM ZZ_SCRATCH_KIN) AS KIN_QUERY " + _
                 "LEFT JOIN ZZ_SCRATCH_IMPORT_PEOPLE " + _
                 "ON KIN_QUERY.c_kin_id = ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id"
             Set tRstNode = CurrentDb.OpenRecordset(tStr, dbOpenDynaset)
        Else
             Set tRstNode = frmZZ_SCRATCH_KIN.Form.Recordset
        End If

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
        tStream.WriteText tC + "<Style id=" + tDQ + "kin-balloon-template" + tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + "<BalloonStyle>", adWriteLine
        tStream.WriteText tC + tC + tC + "<text>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "<![CDATA[", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "ID: $[KinGIS/KinID] <br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "Name Chn: $[KinGIS/KinNameHZ] <br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "Index Year: $[KinGIS/IndexYear] <br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "Address: $[KinGIS/KinAddrName] $[KinGIS/KinAddrHZ] <br/>", adWrite
Line
        tStream.WriteText tC + tC + tC + tC + "XY Count: $[KinGIS/XYCount] <br/><br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "]]>", adWriteLine
        tStream.WriteText tC + tC + tC + "</text>", adWriteLine
        tStream.WriteText tC + tC + "</BalloonStyle>", adWriteLine
        tStream.WriteText tC + "</Style>", adWriteLine
        tStream.WriteText tC + "<!-- Declare the type " + tDQ + "KinGIS" + tDQ + " with 6 fields -->", adWriteLin
e
        tStream.WriteText tC + "<Schema name=" + tDQ + "KinGIS" + tDQ + " id=" + tDQ + "KinGISId" + tDQ + ">", ad
WriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "uint" + tDQ + " name=" + tDQ + "KinID" + tDQ +
">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Kin ID]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "KinNameHZ" +
tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Kin Chn]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "KinAddrName"
+ tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Address]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "KinAddrHZ" +
tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Kin Address Chn]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "IndexYear" +
tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Kin Index Year]]></displayName>", adWriteLine
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

                If IsNull(!c_kin_name) Then
                     tStr = "[Bad Data] "
                Else
                     tStr = !c_kin_name
                End If
                tStream.WriteText tC + tC + "<name>" + tStr + "</name>", adWriteLine

                tStream.WriteText tC + tC + "<styleUrl>#kin-balloon-template</styleUrl>", adWriteLine
                '
                ' First Year as time stamp
                '
                If IsNull(!c_kin_index_year) Then
                     tStr = "N/A"
                Else
                     tStr = Str(!c_kin_index_year)
                End If
                tStream.WriteText tC + tC + "<TimeStamp>" + tStr + "</TimeStamp>", adWriteLine
                '
                tStream.WriteText tC + tC + "<ExtendedData>", adWriteLine
                tStream.WriteText tC + tC + tC + "<SchemaData schemaUrl=" + tDQ + "#KinGISId" + tDQ + ">", adWrit
eLine
                '
                ' person ID
                '
                tStr = Str(!c_kin_id)
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "KinID" + tDQ + ">" + tStr + "<
/SimpleData>", adWriteLine
                '
                ' Person Name Chn
                '
                If IsNull(!c_kin_chn) Then
                     tStr = tStr + "[Bad Data]"
                Else
                     If Trim(!c_kin_chn) = "" Then
                          tStr = "[?]"
                     Else
                          tStr = !c_kin_chn
                     End If
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "KinNameHZ" + tDQ + ">" + tStr
+ "</SimpleData>", adWriteLine
                '
                ' Index Year
                '
                If IsNull(!c_kin_index_year) Then
                     tStr = "N/A"
                Else
                     tStr = Str(!c_kin_index_year)
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "IndexYear" + tDQ + ">" + tStr
+ "</SimpleData>", adWriteLine
                '
                ' Address Name
                '
                If IsNull(!c_kin_addr_name) Then
                     tStr = "[?]"
                ElseIf Trim(!c_kin_addr_name) = "" Then
                     tStr = "[?]"
                Else
                     tStr = !c_kin_addr_name
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "KinAddrName" + tDQ + ">" + tSt
r + "</SimpleData>", adWriteLine
                '
                ' Address Name Chinese
                '
                If IsNull(!c_kin_addr_chn) Then
                     tStr = "[?]"
                ElseIf Trim(!c_kin_addr_chn) = "" Then
                     tStr = "[?]"
                Else
                     tStr = !c_kin_addr_chn
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "KinAddrHZ" + tDQ + ">" + tStr
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
                If IsNull(!kin_x_coord) Then
                     tStr = "0"
                Else
                     tStr = Str(!kin_x_coord)
                End If

                   If IsNull(!kin_y_coord) Then
                        tStr = tStr + ",0"
                   Else
                        tStr = tStr + "," + Str(!kin_y_coord)
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

    tStrQuery = "INSERT INTO ZZ_STORE_PERSON_ID ( c_personid ) SELECT DISTINCT ZZ_SCRATCH_PEOPLE.c_person_id FROM
 ZZ_SCRATCH_PEOPLE"

      cmdSQL.CommandText = tStrQuery
      cmdSQL.Execute tRecCount
      MsgBox "Person IDs successfully stored. Click on 'Recall Person IDs' to reuse these IDs in other forms."
      '
      ' update storage source
      cmdSQL.CommandText = "UPDATE PersonIDSource SET SourceForm ='Kinship' WHERE PersonIDSource.LineNum =1"
      cmdSQL.Execute tRecCount

End Sub
Private Sub CmdRecallID_Click()
On Error GoTo Err_CmdRecallID_Click
    Dim tStrSQL As String, tRecCount As Long, tStrQuestion As String, tRst As DAO.Recordset, tID As Long

      Set cmdSQL = New ADODB.Command
      cmdSQL.ActiveConnection = CurrentProject.Connection
      cmdSQL.CommandType = adCmdText

      tRecCount = DCount("*", "ZZ_SCRATCH_IMPORT_PEOPLE")

    If tRecCount > 0 Then
        If tRecCount = 1 Then
             tStrQuestion = "Do you wish to replace the current person?"
        Else
             tStrQuestion = "Do you wish to replace the current list of IDs?"
        End If
        ' Display message.
        If MsgBox(tStrQuestion, vbYesNo + vbQuestion + vbDefaultButton2) = vbNo Then
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
          TxtName.Value = "[Error]"
          TxtNameChn.Value = "[Error]"
' ;
             CmdRun.Enabled = False
      Else
             If tRecDeleted = 1 Then
                 Set tRst = CurrentDb.OpenRecordset("SELECT ZZ_STORE_PERSON_ID.c_personid FROM ZZ_STORE_PERSON_ID")
                 tRst.MoveFirst
                 tID = tRst!c_personid

            Set tRst = CurrentDb.OpenRecordset("SELECT BIOG_MAIN.c_name, BIOG_MAIN.c_name_chn FROM BIOG_MAIN WHER
E (((BIOG_MAIN.c_personid)=" + Str(tID) + "))")
            tRst.MoveFirst

                 TxtName.Value = tRst!c_name
                 TxtNameChn.Value = tRst!c_name_chn
                 tRst.Close
                 Set tRst = Nothing
         Else
                TxtName.Value = "[Recalled List]"
                TxtNameChn.Value = "[" + ChrW(&H53EC) + ChrW(&H56DE) + ChrW(&H7684) + ChrW(&H4EBA) + ChrW(&H540D) + "
]"
         End If

        Set tRst = CurrentDb.OpenRecordset("SELECT PersonIDSource.SourceForm FROM PersonIDSource WHERE (((PersonI
DSource.LineNum)=1))")
        tRst.MoveFirst
        gCurRecallSource = tRst!SourceForm
        tRst.Close
        Set tRst = Nothing

         CmdRun.Enabled = True
     End If


     Set cmdSQL = Nothing

Exit_CmdRecallID_Click:
    Exit Sub

Err_CmdRecallID_Click:
    MsgBox Err.Description
    Resume Exit_CmdRecallID_Click

End Sub
Private Sub CmdInfo_Click()
On Error GoTo Err_CmdInfo_Click


     If Me.Dirty Then Me.Dirty = False
     DoCmd.Close

Exit_CmdInfo_Click:
    Exit Sub

Err_CmdInfo_Click:
    MsgBox Err.Description
    Resume Exit_CmdInfo_Click

End Sub
Private Sub saveNeo4jFiles()
On Error GoTo Err_CmdNeo4j_Click
    '
    ' This program will dump the results of the search to four CSV files
    '
    ' for the moment I'll just describe the format of the CSV file
    ' Note: Neo4j seems to treat all fields as strings, so there is no need to explicitly mark strings
    '
    ' People.CSV
    ' nameID, NameHZ, NamePY, indexyear, sex
    '      nameID = c_person_id
    '      nameHZ = c_name_chn
    '      namePY = c_name
    '      indexyear = c_index_year
    '      personDynasty = c_dynasty
    '      sex = c_female > (F,M)
    '
    ' Places.CSV
    '      placeID = c_addr_id
    '      placeHZ = c_addr_chn
    '      placePY = c_addr_name
    '      placeX = x_coord
    '      placeY = y_coord
    '
    ' PeoplePlaces.CSV
    '      nameID
    '      placeID
    '      personPlaceRelation
    '
    ' PeopleKinship.CSV
    ' node1_ID, node2_ID, kinshipRelation
    '      node1 = str(c_person_id) for node1
    '      node2 = str(c_node_id) for node2
    '      kinshipRelation = c_link_desc
    '
    ' first see if there are any records to process
    '
    If frmZZ_SCRATCH_KIN.Form.Recordset.RecordCount = 0 Then
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
    Dim tRstNode As DAO.Recordset, tRstEdge As DAO.Recordset, tRstPlace As DAO.Recordset, tRstPeoplePlace As DAO.
Recordset
    Dim tStr As String, tC As String, ti As Integer, tUseList As Boolean
    Dim tColor(50) As String, tMetricSum As Integer, tQueryStr As String, tPersonID As Long
    Dim gStream As ADODB.Stream, tCodeStr As String
    '
    ' the optional recordsets
    '
    Dim tRstOffice As DAO.Recordset, tRstPostings As DAO.Recordset
    '
    'Dim tFileSystem, tGDF

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
            '   prepare the temp tables for the people, place, peoplePlace and kinship data

               Dim cmdSQL As ADODB.Command
               Set cmdSQL = New ADODB.Command
               cmdSQL.ActiveConnection = CurrentProject.Connection
               cmdSQL.CommandType = adCmdText

               cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_KINNET_EDGE"
               cmdSQL.Execute tRecDeleted
               '
               ' copy the data for determining edges
               '
               tQueryStr = "INSERT INTO ZZ_SCRATCH_KINNET_EDGE SELECT ZZ_SCRATCH_KINNET.* FROM ZZ_SCRATCH_KINNET"
               '
               cmdSQL.CommandText = tQueryStr
               cmdSQL.Execute tRecDeleted
               '
               ' now delete the unneeded edges
               '
               tQueryStr = "UPDATE (ZZ_SCRATCH_KINNET_EDGE INNER JOIN ZZ_SCRATCH_KINNET_EDGE AS " + _
                   "ZZ_SCRATCH_KINNET_EDGE_1 ON ZZ_SCRATCH_KINNET_EDGE.c_person_id = ZZ_SCRATCH_KINNET_EDGE_1.c_pers
on_id) " + _
                   "INNER JOIN ZZ_SCRATCH_KINNET_EDGE AS ZZ_SCRATCH_KINNET_EDGE_2 ON " + _
                   "(ZZ_SCRATCH_KINNET_EDGE_1.c_kin_id = ZZ_SCRATCH_KINNET_EDGE_2.c_person_id) AND " + _
                   "(ZZ_SCRATCH_KINNET_EDGE.c_kin_id = ZZ_SCRATCH_KINNET_EDGE_2.c_kin_id) " + _
                   "SET ZZ_SCRATCH_KINNET_EDGE.c_delete = 1 " + _
                   "WHERE (((ZZ_SCRATCH_KINNET_EDGE.c_upstep)=[ZZ_SCRATCH_KINNET_EDGE_1].[c_upstep]+ " + _
                   "[ZZ_SCRATCH_KINNET_EDGE_2].[c_upstep]) AND ((ZZ_SCRATCH_KINNET_EDGE.c_dwnstep)=" + _
                   "[ZZ_SCRATCH_KINNET_EDGE_1].[c_dwnstep]+[ZZ_SCRATCH_KINNET_EDGE_2].[c_dwnstep]) AND " + _
                   "((ZZ_SCRATCH_KINNET_EDGE.c_marstep)=[ZZ_SCRATCH_KINNET_EDGE_1].[c_marstep]+" + _
                   "[ZZ_SCRATCH_KINNET_EDGE_2].[c_marstep]) AND ((ZZ_SCRATCH_KINNET_EDGE.c_colstep)=" + _
                   "[ZZ_SCRATCH_KINNET_EDGE_1].[c_colstep]+[ZZ_SCRATCH_KINNET_EDGE_2].[c_colstep]))"
            '
            'MsgBox "About to prune"
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_KINNET_EDGE WHERE c_delete = 1"
            cmdSQL.Execute tRecDeleted
            'MsgBox "Pruning complete"
            '
            ' now collect the node information
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_GEPHI_NODE"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_GEPHI_NODE_DISTINCT"
            cmdSQL.Execute tRecDeleted
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_GEPHI_NODE ( c_person_id, c_name, c_name_chn, c_index_year, c_fem
ale, c_addr_id, c_addr_name, c_addr_chn, " + _
                "x_coord, y_coord, c_dy, c_dynasty, c_dynasty_chn) " + _
                "SELECT ZZ_SCRATCH_KINNET_EDGE.c_person_id, ZZ_SCRATCH_KINNET_EDGE.c_name, ZZ_SCRATCH_KINNET_EDGE
.c_name_chn, " + _
                "ZZ_SCRATCH_KINNET_EDGE.c_index_year, ZZ_SCRATCH_KINNET_EDGE.c_female, ZZ_SCRATCH_KINNET_EDGE.c_a
ddr_id, ZZ_SCRATCH_KINNET_EDGE.c_addr_name, " + _
                "ZZ_SCRATCH_KINNET_EDGE.c_addr_chn, ZZ_SCRATCH_KINNET_EDGE.x_coord, ZZ_SCRATCH_KINNET_EDGE.y_coor
d, " + _
                "ZZ_SCRATCH_KINNET_EDGE.c_dy, ZZ_SCRATCH_KINNET_EDGE.c_dynasty, ZZ_SCRATCH_KINNET_EDGE.c_dynasty_
chn " + _
                "FROM ZZ_SCRATCH_KINNET_EDGE"
            '
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_GEPHI_NODE ( c_person_id, c_name, c_name_chn, c_index_year, c_fem
ale, c_addr_id, c_addr_name, c_addr_chn, " + _
                "x_coord, y_coord, c_dy, c_dynasty, c_dynasty_chn) " + _
                "SELECT ZZ_SCRATCH_KINNET_EDGE.c_kin_id, ZZ_SCRATCH_KINNET_EDGE.c_kin_name, ZZ_SCRATCH_KINNET_EDG
E.c_kin_chn, " + _
                "ZZ_SCRATCH_KINNET_EDGE.c_kin_index_year, ZZ_SCRATCH_KINNET_EDGE.c_kin_female, ZZ_SCRATCH_KINNET_
EDGE.c_kin_addr_id, ZZ_SCRATCH_KINNET_EDGE.c_kin_addr_name, " + _
                "ZZ_SCRATCH_KINNET_EDGE.c_kin_addr_chn, ZZ_SCRATCH_KINNET_EDGE.kin_x_coord, ZZ_SCRATCH_KINNET_EDG
E.kin_y_coord, " + _
                "ZZ_SCRATCH_KINNET_EDGE.c_kin_dy, ZZ_SCRATCH_KINNET_EDGE.c_kin_dynasty, ZZ_SCRATCH_KINNET_EDGE.c_
kin_dynasty_chn " + _
                "FROM ZZ_SCRATCH_KINNET_EDGE"

               cmdSQL.CommandText = tQueryStr
               cmdSQL.Execute tRecDeleted
               '
            ' append the results
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_GEPHI_NODE_DISTINCT ( c_person_id, c_name, c_name_chn, c_index_ye
ar, c_female, c_imported, c_addr_id, c_addr_name, c_addr_chn, " + _
                "x_coord, y_coord, c_dy, c_dynasty, c_dynasty_chn) " + _
                "SELECT DISTINCT ZZ_SCRATCH_GEPHI_NODE.c_person_id, ZZ_SCRATCH_GEPHI_NODE.c_name, ZZ_SCRATCH_GEPH
I_NODE.c_name_chn, " + _
                "ZZ_SCRATCH_GEPHI_NODE.c_index_year, ZZ_SCRATCH_GEPHI_NODE.c_female, FALSE AS c_imported, " + _
                "ZZ_SCRATCH_GEPHI_NODE.c_addr_id, ZZ_SCRATCH_GEPHI_NODE.c_addr_name, ZZ_SCRATCH_GEPHI_NODE.c_addr
_chn, ZZ_SCRATCH_GEPHI_NODE.x_coord, " + _
                "ZZ_SCRATCH_GEPHI_NODE.y_coord, ZZ_SCRATCH_GEPHI_NODE.c_dy, ZZ_SCRATCH_GEPHI_NODE.c_dynasty, ZZ_S
CRATCH_GEPHI_NODE.c_dynasty_chn " + _
                "FROM ZZ_SCRATCH_GEPHI_NODE"

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            Set tRstEdge = CurrentDb.OpenRecordset("ZZ_SCRATCH_KINNET_EDGE", dbOpenDynaset)
            Set tRstNode = CurrentDb.OpenRecordset("ZZ_SCRATCH_GEPHI_NODE_DISTINCT", dbOpenDynaset)
            tRstNode.MoveLast
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
            With tRstNode
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
                          '   sex = c_female > (F,M)
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
           ' data from source of PersonIDs
           '
           tQueryStr = ""
           If Not (gCurRecallSource = "") Then
               '
               ' clear the scratch table

                  cmdSQL.CommandText = "DELETE * FROM zz_addresses"
                  cmdSQL.Execute tRecDeleted
                  '
                  Select Case gCurRecallSource
                      Case "Office"
                          '
                          If MsgBox("Do you wish to include office data?", vbYesNo + vbQuestion + vbDefaultButton2) = v
bYes Then
                              '
                              ' get all the addresses for the postings for the node personIDs
                              '
                              cmdSQL.CommandText = "INSERT INTO ZZ_ADDRESSES ( c_addr_id, c_name, c_name_chn, x_coord,
y_coord ) " + _
                                     "SELECT DISTINCT ZZZ_POSTED_TO_ADDR_DATA.c_office_addr_id, ZZZ_POSTED_TO_ADDR_DATA.c_
office_addr_name, " + _
                                         "ZZZ_POSTED_TO_ADDR_DATA.c_office_addr_chn, " + _
                                         "ZZZ_POSTED_TO_ADDR_DATA.office_x_coord, ZZZ_POSTED_TO_ADDR_DATA.office_y_coord "
 + _
                                     "FROM ZZ_SCRATCH_GEPHI_NODE_DISTINCT INNER JOIN ZZZ_POSTED_TO_ADDR_DATA ON " + _
                                         "ZZ_SCRATCH_GEPHI_NODE_DISTINCT.c_person_id = ZZZ_POSTED_TO_ADDR_DATA.c_personid
" + _
                                  "WHERE (((ZZZ_POSTED_TO_ADDR_DATA.c_office_addr_id) Is Not Null))"
                              cmdSQL.Execute tRecCount

                              ' get all the address for the people
                              '
                              cmdSQL.CommandText = "INSERT INTO ZZ_ADDRESSES ( c_addr_id, c_name, c_name_chn, x_coord,
y_coord ) " + _
                                     "SELECT DISTINCT ZZ_SCRATCH_GEPHI_NODE_DISTINCT.c_addr_id, ZZ_SCRATCH_GEPHI_NODE_DIST
INCT.c_addr_name, " + _
                                         "ZZ_SCRATCH_GEPHI_NODE_DISTINCT.c_addr_chn, ZZ_SCRATCH_GEPHI_NODE_DISTINCT.x_coor
d, " + _
                                      "ZZ_SCRATCH_GEPHI_NODE_DISTINCT.y_coord " + _
                                  "FROM ZZ_SCRATCH_GEPHI_NODE_DISTINCT"
                              cmdSQL.Execute tRecCount
                              '

                              ' now get all the postings
                              '
                              cmdSQL.CommandText = "DELETE * FROM ZZ_SCRATCH_OFFICE"
                              cmdSQL.Execute tRecCount

                              cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_OFFICE ( c_personid, c_posting_id, c_office_
id, c_firstyear, " + _
                                         "c_lastyear, c_office_chn, c_office_trans, c_office_pinyin, c_office_addr_id ) "
+ _
                            "SELECT DISTINCT ZZZ_POSTED_TO_ADDR_DATA.c_personid, ZZZ_POSTED_TO_ADDR_DATA.c_postin
g_id, ZZZ_POSTED_TO_ADDR_DATA.c_office_id, " + _
                                "ZZZ_POSTED_TO_ADDR_DATA.c_firstyear, ZZZ_POSTED_TO_ADDR_DATA.c_lastyear, ZZZ_POS
TED_TO_ADDR_DATA.c_office_chn, " + _
                                 "ZZZ_POSTED_TO_ADDR_DATA.c_office_trans, ZZZ_POSTED_TO_ADDR_DATA.c_office_pinyin,
 ZZZ_POSTED_TO_ADDR_DATA.c_office_addr_id " + _
                            "FROM ZZ_SCRATCH_GEPHI_NODE_DISTINCT INNER JOIN ZZZ_POSTED_TO_ADDR_DATA " + _
                                 "ON ZZ_SCRATCH_GEPHI_NODE_DISTINCT.c_person_id = ZZZ_POSTED_TO_ADDR_DATA.c_person
id;"
                        cmdSQL.Execute tRecCount
                        '
                        ' process the postings
                        '
                        ' get a file name
                        dlgSaveAs.InitialFileName = "Postings_" + tCodeStr + ".csv"
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
                            tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_OFFICE.c_personid, ZZ_SCRATCH_OFFICE.c_postin
g_id, ZZ_SCRATCH_OFFICE.c_office_id, " + _
                                 "ZZ_SCRATCH_OFFICE.c_firstyear, ZZ_SCRATCH_OFFICE.c_lastyear, ZZ_SCRATCH_OFFICE.c
_office_addr_id FROM ZZ_SCRATCH_OFFICE"
                            Set tRstPostings = CurrentDb.OpenRecordset(tQueryStr)

                            tStr = "PersonID" + tC + "PostingID" + tC + "OfficeID" + tC + "PostingFirstYear" + tC
 + "PostingLastYear" + tC + "PostingAddrID"
                            gStream.WriteText tStr, adWriteLine

                            With tRstPostings
                                .MoveFirst
                                Do While Not .EOF
                                     ' the ID of the person
                                     tStr = Trim(Str(!c_personid)) + tC
                                     tStr = tStr + Trim(Str(!c_posting_id)) + tC
                                     tStr = tStr + Trim(Str(!c_office_id)) + tC
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
                                     If IsNull(!c_office_addr_id) Then
                                          tStr = tStr + "0"
                                     Else
                                          tStr = tStr + Trim(Str(!c_office_addr_id))
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
                          End If
                          '
                          ' now process the offices from the postings
                          '
                          ' get a file name
                          dlgSaveAs.InitialFileName = "Offices_" + tCodeStr + ".csv"
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
                              ' get the offices
                              '
                              tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_OFFICE.c_office_id, ZZ_SCRATCH_OFFICE.c_offic
e_chn, " + _
                                  "ZZ_SCRATCH_OFFICE.c_office_pinyin, ZZ_SCRATCH_OFFICE.c_office_trans FROM ZZ_SCRA
TCH_OFFICE"
                              Set tRstOffice = CurrentDb.OpenRecordset(tQueryStr)

                              If tCodeStr = "ascii" Then
                                   tStr = "OfficeID" + tC + "OfficePY" + tC + "OfficeTrans"
                              Else
                                   tStr = "OfficeID" + tC + "OfficePY" + tC + "OfficeHZ" + tC + "OfficeTrans"
                              End If
                              gStream.WriteText tStr, adWriteLine

                              With tRstOffice
                                  .MoveFirst
                                  Do While Not .EOF
                                      ' the ID of the person
                                      tStr = Trim(Str(!c_office_id)) + tC
                                      '
                                      ' name
                                      '
                                      If IsNull(!c_office_pinyin) Then
                                           tStr = tStr + "Missing" + tC
                                      Else
                                           tStr = tStr + !c_office_pinyin + tC
                                      End If

                                      If Not (tCodeStr = "ascii") Then
                                          If IsNull(!c_office_chn) Then
                                               tStr = tStr + "Missing" + tC
                                          Else
                                               tStr = tStr + !c_office_chn + tC
                                          End If
                                      End If

                                      If IsNull(!c_office_trans) Then
                                           tStr = tStr + "Missing"
                                      Else
                                           tStr = tStr + !c_office_trans
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
                          End If
                          '
                          ' finally, redefine the Places query
                          tQueryStr = "SELECT DISTINCT ZZ_ADDRESSES.c_addr_id, ZZ_ADDRESSES.c_name AS c_addr_name,
" + _
                              "ZZ_ADDRESSES.c_name_chn AS c_addr_chn, ZZ_ADDRESSES.x_coord, ZZ_ADDRESSES.y_coord FR
OM ZZ_ADDRESSES"
                            '
                            ' clean up
                            Set tRstPostings = Nothing
                            Set tRstOffice = Nothing
                        End If
                            '
                    Case Else
               End Select
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
               ' One may need to add place IDs for postings, entry, social institutions, or texts, depending on lis
t source
            '
            ' default query string
            '
            If tQueryStr = "" Then
                tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_GEPHI_NODE_DISTINCT.c_addr_id, ZZ_SCRATCH_GEPHI_NODE_DIST
INCT.c_addr_name, " + _
                    "ZZ_SCRATCH_GEPHI_NODE_DISTINCT.c_addr_chn, ZZ_SCRATCH_GEPHI_NODE_DISTINCT.x_coord, ZZ_SCRATC
H_GEPHI_NODE_DISTINCT.y_coord " + _
                    "FROM ZZ_SCRATCH_GEPHI_NODE_DISTINCT"
            End If

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
                       If Not IsNull(!c_addr_id) Then
                           tStr = Trim(Str(!c_addr_id)) + tC
                           '
                           '   address name

                           If IsNull(!c_addr_name) Then
                                tStr = tStr + "unknown" + tC
                           Else
                                tStr = tStr + !c_addr_name + tC
                           End If
                           '
                           If Not (tCodeStr = "ascii") Then
                                If IsNull(!c_addr_chn) Then
                                     tStr = tStr + "unknown" + tC
                                Else
                                     tStr = tStr + !c_addr_chn + tC
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
            tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_GEPHI_NODE_DISTINCT.c_person_id, ZZZ_BIOG_MAIN.c_index_addr_i
d, ZZZ_BIOG_MAIN.c_index_addr_type_desc, " + _
                 "ZZZ_BIOG_MAIN.c_index_addr_type_chn " + _
                 "FROM ZZ_SCRATCH_GEPHI_NODE_DISTINCT INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_GEPHI_NODE_DISTINCT.c
_person_id = ZZZ_BIOG_MAIN.c_personid"

               Set tRstPeoplePlace = CurrentDb.OpenRecordset(tQueryStr)

               tStr = "nameID" + tC + "placeID" + tC + "personPlaceTrans" + tC + "personPlaceHZ"

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
                            tStr = tStr + !c_index_addr_type_desc + tC + !c_index_addr_type_chn
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
        dlgSaveAs.InitialFileName = "Kinship_" + tCodeStr + ".csv"
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
            '
            ' now the edges: define the record structure
            tStr = "node1" + tC + "node2" + tC + "kinshipRelation"
            gStream.WriteText tStr, adWriteLine
            'tGDF.WriteLine (tStr)

               With tRstEdge
                   .MoveFirst
                   Do While Not .EOF
                        If Not IsNull(!c_kin_rel) Then
                            tStr = Trim(Str(!c_person_id)) + tC
                            '   node1 = str(c_person_id) for node1
                            tStr = tStr + Trim(Str(!c_kin_id)) + tC
                            '   node2 = str(c_node_id) for node2
                            tStr = tStr + !c_kin_rel
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
                 Set gStream = Nothing
                 'tGDF.Close
                 '
                 Set tRstNode = Nothing
                 Set tRstEdge = Nothing
                 'Set tGDF = Nothing
                 'Set tFileSystem = Nothing
          Else
            'The user pressed Cancel.
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

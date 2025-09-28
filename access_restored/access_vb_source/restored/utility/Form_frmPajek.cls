Option Compare Database

Private Sub CmdRun_Click()
On Error GoTo Err_CmdRun_Click
    '
    ' This program will dump a file to a .net file
    '
    ' The form allows the user to define as many as 20 attributes
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
    If IsNull(Me.TxtTableName.Value) Then
        MsgBox "Please provide a table to save."
        GoTo Exit_CmdRun_Click
    End If

       If IsNull(Me.TxtN1_ID.Value) Then
           MsgBox "Please provide a field for the first node ID."
           GoTo Exit_CmdRun_Click
       End If

       If IsNull(Me.TxtN1_Lbl.Value) Then
           MsgBox "Please provide a field for the first node label."
           GoTo Exit_CmdRun_Click
       End If

       If IsNull(Me.TxtN2_ID.Value) Then
           MsgBox "Please provide a field for the second node ID."
           GoTo Exit_CmdRun_Click
       End If

       If IsNull(Me.TxtN2_Lbl.Value) Then
           MsgBox "Please provide a field for the second node label."
           GoTo Exit_CmdRun_Click
       End If

       Dim dlgSaveAs As FileDialog, tFileNum As Integer, tFileName As String, tFN As Variant
       Dim tRstNodeList As DAO.Recordset, tRstEdgeList As DAO.Recordset, tRstSource As DAO.Recordset

       Dim tStr As String, tC As String, ti As Integer, tQuote As String, tFindStr As String
       Dim tColor(20) As String, tStrNode1 As String, tStrNode2 As String, tCodeStr As String
       Dim tN1_ID As String, tN1_Label As String, tN1_LblColor As String, tN1_Shape As String, tN1_BorderColor As St
ring
       Dim tN1_InnerColor As String, tN2_ID As String, tN2_Label As String, tN2_LblColor As String, tN2_Shape As Str
ing
       Dim tN2_BorderColor As String, tN2_InnerColor As String, tEdge_Label As String, tEdge_LblColor As String
       Dim tEdge_Weight As String, tEdge_Color As String, tAdd As Boolean
       '
       ' first see if there are any records to process
       '
       Set tRstSource = CurrentDb.OpenRecordset(TxtTableName.Value, dbOpenDynaset)
       If tRstSource.RecordCount = 0 Then
           MsgBox "There are no records to save."
           GoTo Exit_CmdRun_Click
       End If
       '
       ' next get a file
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
        tStream.Charset = "gb2312"
        tCodeStr = "GB2312.net"
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
                 GoTo Exit_CmdRun_Click
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
            '
            ' set the Quote delimiter
            '
            tQuote = Chr(34)
            tC = Chr(44) ' the comma
            '
            ' now get all the field names
            '
            tN1_ID = Me.TxtN1_ID.Value
            tN1_Label = Me.TxtN1_Lbl.Value

            If IsNull(Me.TxtN1_LblColor.Value) Then
                 tN1_LblColor = ""
            Else
                 tN1_LblColor = Me.TxtN1_LblColor.Value
            End If

            If IsNull(Me.TxtN1_InnerColor.Value) Then
                 tN1_InnerColor = ""
            Else
                 tN1_InnerColor = Me.TxtN1_InnerColor.Value
            End If

            If IsNull(Me.TxtN1_BorderColor.Value) Then
                 tN1_BorderColor = ""
            Else
                 tN1_BorderColor = Me.TxtN1_BorderColor.Value
            End If

            If IsNull(Me.TxtN1_Shape.Value) Then
                 tN1_Shape = ""
            Else
                 tN1_Shape = Me.TxtN1_Shape.Value
            End If

            tN2_ID = Me.TxtN2_ID.Value
            tN2_Label = Me.TxtN2_Lbl.Value
            If IsNull(Me.TxtN2_LblColor.Value) Then
                 tN2_LblColor = ""
            Else
                 tN2_LblColor = Me.TxtN2_LblColor.Value
            End If

            If IsNull(Me.TxtN2_InnerColor.Value) Then
                 tN2_InnerColor = ""
            Else
                 tN2_InnerColor = Me.TxtN2_InnerColor.Value
            End If

            If IsNull(Me.TxtN2_BorderColor.Value) Then
                 tN2_BorderColor = ""
            Else
                 tN2_BorderColor = Me.TxtN2_BorderColor.Value
            End If

            If IsNull(Me.TxtN2_Shape.Value) Then
                 tN2_Shape = ""
            Else
                 tN2_Shape = Me.TxtN2_Shape.Value
            End If

            If IsNull(Me.TxtEdge_Color.Value) Then
                 tEdge_Color = ""
            Else
                 tEdge_Color = Me.TxtEdge_Color.Value
            End If

            If IsNull(Me.TxtEdge_Lbl.Value) Then
                 tEdge_Label = ""
            Else
                 tEdge_Label = Me.TxtEdge_Lbl.Value
            End If

            If IsNull(Me.TxtEdge_LblColor.Value) Then
                 tEdge_LblColor = ""
            Else
                 tEdge_LblColor = Me.TxtEdge_LblColor.Value
            End If

            If IsNull(Me.TxtEdge_Weight) Then
                 tEdge_Weight = ""
            Else
                 tEdge_Weight = Me.TxtEdge_Weight
            End If
            '
            ' process the table for nodes
            '
            ti = 1
            With tRstSource
                 .MoveFirst
                 Do While Not .EOF
                     '
                     ' check to see if we have the first node
                     '
                     If tRstNodeList.RecordCount = 0 Then
                          tAdd = True
                     Else
                          tRstNodeList.Seek "=", Str(.Fields(tN1_ID))
                          tAdd = tRstNodeList.NoMatch
                     End If

                    If tAdd Then
                        '
                        ' add the node to the list
                        '
                        tRstNodeList.AddNew
                        tRstNodeList!c_v_sort = ti
                        tRstNodeList!c_v_num = Str(ti)
                        tRstNodeList!c_ID = .Fields(tN1_ID)
                        tRstNodeList!c_lbl = .Fields(tN1_Label)
                        If Not (tN1_LblColor = "") Then
                            tRstNodeList!c_lc = .Fields(tN1_LblColor)
                        End If
                        If Not (tN1_InnerColor = "") Then
                            tRstNodeList!c_ic = .Fields(tN1_InnerColor)
                        End If
                        If Not (tN1_BorderColor = "") Then
                             tRstNodeList!c_bc = .Fields(tN1_BorderColor)
                         End If
                         If Not (tN1_Shape = "") Then
                             tRstNodeList!c_shape = .Fields(tN1_Shape)
                         End If
                         tRstNodeList.Update
                         ti = ti + 1
                    End If
                         '
                    '
                    ' check to see if we have the second node
                    '
                    If tRstNodeList.RecordCount = 0 Then
                         tAdd = True
                    Else
                         tRstNodeList.Seek "=", Str(.Fields(tN2_ID))
                         tAdd = tRstNodeList.NoMatch
                    End If

                    If tAdd Then
                        '
                        ' add the node to the list
                        '
                        tRstNodeList.AddNew
                        tRstNodeList!c_v_sort = ti
                        tRstNodeList!c_v_num = Str(ti)
                        tRstNodeList!c_ID = .Fields(tN2_ID)
                        tRstNodeList!c_lbl = .Fields(tN2_Label)
                        If Not (tN2_LblColor = "") Then
                            tRstNodeList!c_lc = .Fields(tN2_LblColor)
                        End If
                        If Not (tN2_InnerColor = "") Then
                            tRstNodeList!c_ic = .Fields(tN2_InnerColor)
                        End If
                        If Not (tN2_BorderColor = "") Then
                            tRstNodeList!c_bc = .Fields(tN2_BorderColor)
                        End If
                        If Not (tN2_Shape = "") Then
                            tRstNodeList!c_shape = .Fields(tN2_Shape)
                        End If
                        tRstNodeList.Update
                        ti = ti + 1
                    End If
                    '
                    .MoveNext
                Loop
            End With
            '
            ' now write the nodes to file
            '
            tStr = "*Vertices " + Trim(Str(tRstNodeList.RecordCount))
            tStream.WriteText tStr, adWriteLine
            '
            With tRstNodeList
                .Index = "c_v_sort"
                .MoveFirst
                Do While Not .EOF
                     tStr = !c_v_num + " "
                     '
                     ' label (required)
                     '
                     tStr = tStr + Chr(34) + Trim(!c_lbl) + Chr(34)
                     '
                     ' shape (required)
                     '
                     If IsNull(!c_shape) Then
                          tStr = tStr + " box "
                     Else
                          tStr = tStr + " " + !c_shape
                     End If
                     '
                     ' other parameters
                     '
                     If Not IsNull(!c_lc) Then
                          tStr = " lc " + !c_lc
                     End If
                     '
                     If Not IsNull(!c_ic) Then
                          tStr = tStr + " ic " + !c_ic
                     End If
                          '
                          If Not IsNull(!c_bc) Then
                              tStr = tStr + " bc " + !c_bc
                          End If
                          '
                          tStream.WriteText tStr, adWriteLine
                          .MoveNext
                   Loop
                   .Index = "c_ID"
               End With
               '
               ' now the edges: define the record structure
               '
               tStream.WriteText "*Edges", adWriteLine

               With tRstSource
                   .MoveFirst
                   Do While Not .EOF
                       '
                       ' find the vertex number of the first node
                       '
                       tRstNodeList.Seek "=", Str(.Fields(tN1_ID))
                       If Not tRstNodeList.NoMatch Then
                           '
                           tStrNode1 = tRstNodeList!c_v_num
                           '
                           ' find the vertex number of the second node
                           '
                           tRstNodeList.Seek "=", Str(.Fields(tN2_ID))
                           If Not tRstNodeList.NoMatch Then
                               '
                               ' see if an edge already exists
                               '
                               tStrNode2 = tRstNodeList!c_v_num

                                  tStr = tStrNode1 + " " + tStrNode2 + " 1"
                                  '
                                  ' now get the weight
                                  '
                                  If Not (tEdge_Weight = "") Then
                                      tStr = tStr + " w " + Trim(Str(.Fields(tEdge_Weight)))
                                  End If
                                  '
                                  If Not (tEdge_Color = "") Then
                                      tStr = tStr + " c " + .Fields(tEdge_Color)
                                  End If
                                  '
                                  ' now get the label
                                  '
                                  If Not (tEdge_Label = "") Then
                                      tStr = tStr + " l " + tQuote + .Fields(tEdge_Label) + tQuote
                                  End If

                                  If Not (tEdge_LblColor = "") Then
                                      tStr = tStr + " lc " + tQuote + .Fields(tEdge_LblColor) + tQuote
                                  End If
                                  '
                                  tStream.WriteText tStr, adWriteLine
                              End If
                          End If
                          .MoveNext
                   Loop
               End With

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
               Set tRstSource = Nothing
               Set tGDF = Nothing
               Set tFileSystem = Nothing
               Set tRstNodeList = Nothing
        Else
             'The user pressed Cancel.
        End If
    End With

    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing


Exit_CmdRun_Click:
    Exit Sub

Err_CmdRun_Click:
    MsgBox Err.Description
    Resume Exit_CmdRun_Click

End Sub
Private Sub CmdHelp_Click()
On Error GoTo Err_CmdHelp_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "frmPajekHelp"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdHelp_Click:
    Exit Sub

Err_CmdHelp_Click:
    MsgBox Err.Description
    Resume Exit_CmdHelp_Click

End Sub

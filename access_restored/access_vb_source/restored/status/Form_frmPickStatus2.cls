Option Compare Database
Public gRstStatusCode As DAO.Recordset, gNode As clsNode, gStrSearch As String, gStrSearchAlt As String
Public gUseAlt As Boolean, gDisplayLanguage As String
'##########Treeview Code##########
'Add this to your form's declaration section
Public WithEvents mcTree As clsTreeview
Private mbExit As Boolean    ' to exit a SpinButton event
'/##########Treeview Code##########

Private Sub CmdCancel_Click()
On Error GoTo Err_CmdCancel_Click

    Clear_SelectAll
    DoCmd.Close

Exit_CmdCancel_Click:
    Exit Sub

Err_CmdCancel_Click:
    MsgBox Err.Description
    Resume Exit_CmdCancel_Click

End Sub

Private Sub CmdSelect_Click()
    Clear_SelectAll
    CmdSelectAll.SetFocus
    CmdSelect.Enabled = False
    Forms!frmPickStatus2.Visible = False
End Sub

Private Sub CmdSelectAll_Click()
    If CmdSelectAll.Caption = "Select All" Then
         CmdSelectAll.Caption = "De-select All"
         frmSTATUS_CODES.Form.DatasheetForeColor = RGB(255, 255, 255)
         frmSTATUS_CODES.Form.DatasheetBackColor = RGB(0, 0, 255)
         CmdSelect.Enabled = True
         TxtStatusID.Value = -1
         TxtStatusDesc.Value = ""
         TxtStatusDescChn.Value = ""
    Else
         CmdSelectAll.SetFocus
         Clear_SelectAll
    End If
End Sub
Private Sub Clear_SelectAll()
    CmdSelectAll.Caption = "Select All"
    '
    ' reset the form colors
    '
    frmSTATUS_CODES.Form.DatasheetForeColor = RGB(0, 0, 0)
    frmSTATUS_CODES.Form.DatasheetBackColor = RGB(255, 255, 255)
End Sub
Private Sub Form_Open(Cancel As Integer)
    Dim cRoot As clsNode, strKey As String, strCaption As String
    Dim cNode1 As clsNode, cNode2 As clsNode
    Dim tRst As DAO.Recordset
    '
    ' initialize the text fields
    '
    Me.TxtTypeDesc.Value = ""
    Me.TxtTypeDescChn.Value = ""
    Me.TxtTypeID.Value = "000"
    '
    ' initialize the Status Codes dataset
    '
    Set gRstStatusCode = CurrentDb.OpenRecordset("STATUS_CODES", dbOpenDynaset)
    Set frmSTATUS_CODES.Form.Recordset = gRstStatusCode
    '
    'frmSTATUS_CODES.Form.OrderBy = "c_sortorder"
    'frmSTATUS_CODES.Form.OrderByOn = True

    If Not IsNull(Me.OpenArgs) Then
        Dim strStatus As String
        strStatus = Me.OpenArgs
        Dim rsStatus As DAO.Recordset
        Set rsStatus = frmSTATUS_CODES.Form.Recordset
        rsStatus.FindFirst "c_status_code = " & strStatus
    End If
    '
       ' build treeview
       '
       Set tRst = CurrentDb.OpenRecordset("STATUS_TYPES", dbOpenDynaset)

       ' set the language
       Dim tmli As MsoLanguageID
       '
       tmli = Application.LanguageSettings.LanguageID(msoLanguageIDUI)
       '
       If tmli = msoLanguageIDSimplifiedChinese Then
            gDisplayLanguage = "S"
       ElseIf tmli = msoLanguageIDTraditionalChinese Then
            gDisplayLanguage = "T"
       Else
            gDisplayLanguage = "E"
       End If
       '
       '
       'MsgBox "About to build tree"
       tRst.MoveFirst
       Set mcTree = Me.subTreeView.Form.pTreeview
       With mcTree
            .NodesClear
            .AppName = AppName ' Title for message boxes:
            ' use the appropriate caption
            If gDisplayLanguage = "T" Then
                 strCaption = ChrW(31038) + ChrW(26371) + ChrW(38364) + ChrW(20418) + ChrW(20998) + ChrW(39006)
            ElseIf gdisplaylangauge = "S" Then
                 strCaption = ChrW(31038) + ChrW(20250) + ChrW(20851) + ChrW(31995) + ChrW(20998) + ChrW(31612)
            Else
                 strCaption = "Categories of Social Status"
            End If

           Set cRoot = .AddRoot("Root", strCaption, "FolderClosed", "FolderOpen")
           ' Add a Root node with main and expanded icons and make it bold
           cRoot.Bold = True
           ' Loop through the records
           Do While Not tRst.EOF
                ' Add node
                strKey = tRst!c_status_type_code
                If gDisplayLanguage = "E" Then
                     strCaption = tRst!c_status_type_desc
                Else
                     strCaption = tRst!c_status_type_chn
                End If
                If Len(tRst!c_status_type_code) = 2 Then
                     Set cNode1 = cRoot.AddChild(sKey:=strKey, vCaption:=strCaption)
                     cNode1.Expanded = False
                Else
                     Set cNode2 = cNode1.AddChild(sKey:=strKey, vCaption:=strCaption)
                     cNode2.Expanded = False
                End If
                tRst.MoveNext
           Loop
           ' Create the node controls and display the tree
           .Refresh
       End With
   '
    Set tRst = Nothing
End Sub
Private Sub CmdFind_Click()
On Error GoTo Err_CmdFind_Click

       'Dim StrSearch As String
       'Me.TxtSearch.SetFocus
       'StrSearch = Me.TxtSearch.Value
       'If StrSearch <> "" Then
          'Dim rsStatusCodes As DAO.Recordset
          'Set rsStatusCodes = frmSTATUS_CODES.Form.Recordset
          'Dim StrSearchStr As String
          'StrSearchStr = "c_status_desc_chn = " + Chr(34) + StrSearch + Chr(34)
          'rsStatusCodes.FindFirst StrSearchStr
       'End If

       Call NodeSearch

Exit_CmdFind_Click:
    Exit Sub

Err_CmdFind_Click:
    MsgBox Err.Description
    Resume Exit_CmdFind_Click

End Sub

Private Sub mcTree_Click(cNode As clsNode)
    Dim tRst As DAO.Recordset, tRstStatus As DAO.Recordset, tStrSQL As String
    Dim tStatusCodeQuery As DAO.QueryDef, prm As DAO.Parameter
    Dim tRstStatusCode As DAO.Recordset, tRstDummy As DAO.Recordset

    Set cmdSQL = New ADODB.Command

    TxtStatusID.Value = -1
    TxtStatusDesc.Value = ""
    TxtStatusDescChn.Value = ""
    CmdSelect.Enabled = False

    ' reset the form colors
    '
    Clear_SelectAll
    '
    If cNode.Key = "Root" Then
         TxtTypeID.Value = ""
         TxtTypeDesc.Value = ""
         TxtTypeDescChn.Value = ""
         CmdSelectAll.Enabled = False
         '
         ' reset the entry code choices
         '
         Set gRstStatusCode = CurrentDb.OpenRecordset("STATUS_CODES", dbOpenDynaset)
         '
         Set frmSTATUS_CODES.Form.Recordset = gRstStatusCode
         frmSTATUS_CODES.Form.Refresh
    Else
         Set tRst = CurrentDb.OpenRecordset("STATUS_TYPES", dbOpenDynaset)
         '
         tRst.MoveFirst
         tRst.FindFirst "c_status_type_code = " + Chr(34) + cNode.Key + Chr(34)
         TxtTypeID.Value = cNode.Key
         TxtTypeDesc.Value = tRst!c_status_type_desc
         TxtTypeDescChn.Value = tRst!c_status_type_chn
         tRst.Close
         Set tRst = Nothing
         '
         CmdSelectAll.Enabled = True
         '
         ' we need to distinguish between type / subtype
         '
         tStrSQL = "INSERT INTO ZZ_STATUS_CODE ( c_status_code, c_status_desc, c_status_desc_chn ) " + _
             "SELECT STATUS_CODE_TYPE_REL.c_status_code AS c_status_code, STATUS_CODES.c_status_desc, " + _
             "STATUS_CODES.c_status_desc_chn " + _
             "FROM STATUS_CODES INNER JOIN STATUS_CODE_TYPE_REL ON " + _
             "STATUS_CODES.c_status_code = STATUS_CODE_TYPE_REL.c_status_code "

          If Len(cNode.Key) = 2 Then
               tStrSQL = tStrSQL + "WHERE (((Left(([STATUS_CODE_TYPE_REL].[c_status_type_code]),2))='" + _
                   TxtTypeID.Value + "'))"
          Else
               tStrSQL = tStrSQL + "WHERE (((STATUS_CODE_TYPE_REL.c_status_type_code)='" + _
                   TxtTypeID.Value + "'))"
          End If

          Set tRstStatusCode = frmSTATUS_CODES.Form.Recordset
          Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SC", dbOpenDynaset)
          Set frmSTATUS_CODES.Form.Recordset = tRstDummy

          tRstStatusCode.Close
          '
          cmdSQL.ActiveConnection = CurrentProject.Connection
          cmdSQL.CommandType = adCmdText
          '
          cmdSQL.CommandText = "Delete * from ZZ_STATUS_CODE"
          cmdSQL.Execute tRecDeleted
          '
          cmdSQL.CommandText = tStrSQL
          cmdSQL.Execute tRecDeleted
          '
          ' to get rid of superfluous deleted records, briefly close the table
          '
          Set tRstStatusCode = CurrentDb.OpenRecordset("ZZ_STATUS_CODE", dbOpenDynaset)
        '
        Set frmSTATUS_CODES.Form.Recordset = tRstStatusCode
        Set tRstDummy = Nothing
        '
    End If

End Sub

Private Sub TxtSearch_Change()
    If TxtSearch.Text = "" Or IsNull(TxtSearch.Text) Then
         If TxtSearchChn.Value = "" Or IsNull(TxtSearchChn.Value) Then
             CmdFind.Enabled = False
         End If
    Else
         TxtSearchChn.Value = ""
         CmdFind.Enabled = True
    End If
    CmdFindNext.Enabled = False
End Sub

Private Sub TxtSearchChn_Change()
    If TxtSearchChn.Text = "" Or IsNull(TxtSearchChn.Text) Then
         If TxtSearch.Value = "" Or IsNull(TxtSearch.Value) Then
             Me.CmdFind.Enabled = False
         End If
    Else
         TxtSearch.Value = ""
         CmdFind.Enabled = True
    End If
    CmdFindNext.Enabled = False
End Sub
Private Sub CmdFindNext_Click()
    Dim tRstStatusCodes As DAO.Recordset, tRstStatusTypes As DAO.Recordset, cNode As clsNode
    Dim tStrSQL As String, tRstDummy As DAO.Recordset, cmdSQL As ADODB.Command

    TxtStatusID.Value = -1
    TxtStatusDesc.Value = ""
    TxtStatusDescChn.Value = ""

    If IsNull(gRstStatusCode) Then
         MsgBox "Error in search: table closed."
    Else
         If gStrSearch = "" Then
              MsgBox "Error in search: string empty."
         Else

            'MsgBox "Looking for entry"

            If gRstStatusCode.EOF Then
                 CmdFindNext.Enabled = False
            Else
                 ' gRstStatusCode.MoveNext

                If gUseAlt Then
                     gRstStatusCode.FindNext gStrSearchAlt
                Else
                     gRstStatusCode.FindNext gStrSearch

                    If gRstStatusCode.NoMatch Then
                        gRstStatusCode.FindFirst gStrSearchAlt
                        gUseAlt = True
                    End If
                End If

                If gRstStatusCode.NoMatch Then
                     If gUseAlt Then
                         gUseAlt = False
                     End If
                     CmdFindNext.Enabled = False
                Else
                     '
                     ' next find the entry_type
                     '
                     'MsgBox "Looking for entry type"

                    Set tRstStatusTypes = CurrentDb.OpenRecordset("STATUS_CODE_TYPE_REL", dbOpenDynaset)

                    tRstStatusTypes.FindNext "c_status_code = " + Str(gRstStatusCode!c_status_code)

                    If Not tRstStatusTypes.NoMatch Then
                          '
                          ' set the values
                          '
                          TxtStatusID.Value = gRstStatusCode!c_status_code
                          If Not IsNull(gRstStatusCode!c_status_desc) Then
                              TxtStatusDesc.Value = gRstStatusCode!c_status_desc
                          End If
                          If Not IsNull(gRstStatusCode!c_status_desc_chn) Then
                              TxtStatusDescChn.Value = gRstStatusCode!c_status_desc_chn
                          End If
                          '
                          ' define the string
                          '
                          tStr = tRstStatusTypes!c_status_type_code
                          '
                          ' search the tree

                          Set cNode = mcTree.Nodes(tStr)
                          '
                          'MsgBox "found node"
                          '
                          If Not IsNull(cNode) Then
                              If cNode.Key = gNode.Key Then
                                   Set tRstStatusCodes = frmSTATUS_CODES.Form.Recordset
                                   tRstStatusCodes.FindNext "c_status_code = " + Str(gRstStatusCode!c_status_code)
                                   frmSTATUS_CODES.Form.Refresh
                              Else
                                   Set mcTree.ActiveNode = cNode
                                   'cNode.Selected = True
                                   '
                                   ' then one makes it visible
                                   '
                                   'tNode.EnsureVisible
                                   '
                                   Set gNode = cNode
                                   '
                                   ' Finally populate the options and select the record.
                                   '
                                   CmdSelectAll.Enabled = True
                                   '
                                   tStrSQL = "INSERT INTO ZZ_STATUS_CODE ( c_status_code, c_status_desc, c_status_de
sc_chn ) " + _
                                      "SELECT STATUS_CODE_TYPE_REL.c_status_code AS c_status_code, STATUS_CODES.c_s
tatus_desc, " + _
                                      "STATUS_CODES.c_status_desc_chn " + _
                                      "FROM STATUS_CODES INNER JOIN STATUS_CODE_TYPE_REL ON " + _
                                      "STATUS_CODES.c_status_code = STATUS_CODE_TYPE_REL.c_status_code " + _
                                      "WHERE (((STATUS_CODE_TYPE_REL.c_status_type_code)='" + tStr + "'))"

                                  Set tRstStatusCodes = frmSTATUS_CODES.Form.Recordset
                                  Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_AC", dbOpenDynaset)
                                  Set frmSTATUS_CODES.Form.Recordset = tRstDummy

                                  tRstStatusCodes.Close
                                  '
                                  Set cmdSQL = New ADODB.Command
                                  cmdSQL.ActiveConnection = CurrentProject.Connection
                                  cmdSQL.CommandType = adCmdText
                                  '
                                  cmdSQL.CommandText = "Delete * from ZZ_STATUS_CODE"
                                  cmdSQL.Execute tRecDeleted
                                  '
                                  cmdSQL.CommandText = tStrSQL
                                  cmdSQL.Execute tRecDeleted
                                  '
                                  Set tRstStatusCodes = CurrentDb.OpenRecordset("ZZ_STATUS_CODE", dbOpenDynaset)
                                  '
                                  Set frmSTATUS_CODES.Form.Recordset = tRstStatusCodes
                                  tRstStatusCodes.FindNext "c_status_code = " + Str(gRstStatusCode!c_status_code)
                                  frmSTATUS_CODES.Form.Refresh
                                  '
                                  Set tRstDummy = Nothing
                                  '
                                  ' set the type values
                                  '
                                  Set tRstStatusTypes = CurrentDb.OpenRecordset("STATUS_TYPES", dbOpenDynaset)
                                  '
                                  tRstStatusTypes.MoveFirst
                                  tRstStatusTypes.FindFirst "c_status_type_code = " + Chr(34) + cNode.Key + Chr(34)
                                  TxtTypeID.Value = cNode.Key
                                TxtTypeDesc.Value = tRstStatusTypes!c_status_type_desc
                                TxtTypeDescChn.Value = tRstStatusTypes!c_status_type_chn
                                tRstStatusTypes.Close
                                Set tRstStatusTypes = Nothing
                            End If
                        End If
                    End If
                End If
            End If
        End If
    End If
End Sub


Private Sub NodeSearch()

    Dim cNode As clsNode, tStr As String, tRstStatusCodes As DAO.Recordset, tRstStatusTypes As DAO.Recordset
    Dim tRstDummy As DAO.Recordset, tStrSQL As String, tStrSearchChn As String, tStrSearchEng As String
    Dim tStrLen As String, cmdSQL As ADODB.Command

    Set cmdSQL = New ADODB.Command

    TxtStatusID.Value = -1
    TxtStatusDesc.Value = ""
    TxtStatusDescChn.Value = ""

    '   all specific statusiation codes will have a type of the form 0101
    '   hence the ValuePath for the relevant node will be "K000/K01/K0101"
    '   The command to locate the relevant node is:
    '   tNode = TreeViewType.FindNode(tStrValuePath)
    '   TreeViewType.SelectedNode = tNode

    ' search for the search string in STATUS_CODES
    TxtSearchChn.SetFocus
    tStrSearchChn = Me.TxtSearchChn.Text
    TxtSearch.SetFocus
    tStrSearchEng = Me.TxtSearch.Text
    CmdFind.SetFocus

    gStrSearch = ""
    gUseAlt = False

    If tStrSearchChn <> "" Then
        tStrLen = Str(LenB(tStrSearchChn))
       gStrSearch = "LeftB(c_status_desc_chn," + tStrLen + ") = '" + tStrSearchChn + "'"
       gStrSearchAlt = "InStrB(1,c_status_desc_chn,'" + tStrSearchChn + "') > 0"
    ElseIf tStrSearchEng <> "" Then
        tStrLen = Str(Len(tStrSearchEng))
       gStrSearch = "Left(c_status_desc," + tStrLen + ") = '" + tStrSearchEng + "'"
       gStrSearchAlt = "InStr(1,c_status_desc,'" + tStrSearchEng + "') > 0"
    End If

    If Not (gStrSearch = "") Then

         'MsgBox "Looking for status"

         Set gRstStatusCode = CurrentDb.OpenRecordset("STATUS_CODES", dbOpenDynaset)

         gRstStatusCode.FindFirst gStrSearch

         If gRstStatusCode.NoMatch Then
             gRstStatusCode.FindFirst gStrSearchAlt
             gUseAlt = True
         End If

         If gRstStatusCode.NoMatch Then
              gUseAlt = False
              CmdFindNext.Enabled = False
         Else
              '
              CmdFindNext.Enabled = True
              '
              ' next find the status_type
              '

             'MsgBox "Looking for status type"

             Set tRstStatusTypes = CurrentDb.OpenRecordset("STATUS_CODE_TYPE_REL", dbOpenDynaset)

             tRstStatusTypes.FindNext "c_status_code = " + Str(gRstStatusCode!c_status_code)

            If Not tRstStatusTypes.NoMatch Then
                '
                ' set the values
                '
                TxtStatusID.Value = gRstStatusCode!c_status_code
                If Not IsNull(gRstStatusCode!c_status_desc) Then
                    TxtStatusDesc.Value = gRstStatusCode!c_status_desc
                End If
                If Not IsNull(gRstStatusCode!c_status_desc_chn) Then
                    TxtStatusDescChn.Value = gRstStatusCode!c_status_desc_chn
                End If
                '
                ' define the string
                '
                tStr = tRstStatusTypes!c_status_type_code
                '
                ' search the tree

                Set cNode = mcTree.Nodes(tStr)
                '
                'MsgBox "found node"
                '
                If Not IsNull(cNode) Then
                    '
                    Set mcTree.ActiveNode = cNode
                    'cNode.Selected = True
                    '
                    ' then one makes it visible
                    '
                    'tNode.EnsureVisible
                    '
                    Set gNode = cNode
                    '
                    ' Finally populate the options and select the record.
                    '
                    CmdSelectAll.Enabled = True
                    '
                    tStrSQL = "INSERT INTO ZZ_STATUS_CODE ( c_status_code, c_status_desc, c_status_desc_chn ) " +
 _
                          "SELECT STATUS_CODE_TYPE_REL.c_status_code AS c_status_code, STATUS_CODES.c_status_desc,
" + _
                          "STATUS_CODES.c_status_desc_chn " + _
                          "FROM STATUS_CODES INNER JOIN STATUS_CODE_TYPE_REL ON " + _
                          "STATUS_CODES.c_status_code = STATUS_CODE_TYPE_REL.c_status_code " + _
                          "WHERE (((STATUS_CODE_TYPE_REL.c_status_type_code)='" + tStr + "'))"

                    Set tRstStatusCodes = frmSTATUS_CODES.Form.Recordset
                    Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SC", dbOpenDynaset)
                    Set frmSTATUS_CODES.Form.Recordset = tRstDummy

                    tRstStatusCodes.Close
                    '
                    cmdSQL.ActiveConnection = CurrentProject.Connection
                    cmdSQL.CommandType = adCmdText
                    '
                    cmdSQL.CommandText = "Delete * from ZZ_STATUS_CODE"
                    cmdSQL.Execute tRecDeleted
                    '
                    cmdSQL.CommandText = tStrSQL
                    cmdSQL.Execute tRecDeleted
                    '
                    Set tRstStatusCodes = CurrentDb.OpenRecordset("ZZ_STATUS_CODE", dbOpenDynaset)
                    '
                    Set frmSTATUS_CODES.Form.Recordset = tRstStatusCodes
                    tRstStatusCodes.FindNext "c_status_code = " + Str(gRstStatusCode!c_status_code)
                    frmSTATUS_CODES.Form.Refresh
                    '
                    Set tRstDummy = Nothing
                    '
                    ' set the type values
                    '
                    Set tRstStatusTypes = CurrentDb.OpenRecordset("STATUS_TYPES", dbOpenDynaset)
                    '
                    tRstStatusTypes.MoveFirst
                    tRstStatusTypes.FindFirst "c_status_type_code = " + Chr(34) + cNode.Key + Chr(34)
                    TxtTypeID.Value = cNode.Key
                    TxtTypeDesc.Value = tRstStatusTypes!c_status_type_desc
                    TxtTypeDescChn.Value = tRstStatusTypes!c_status_type_chn
                    tRstStatusTypes.Close
                    Set tRstStatusTypes = Nothing
                End If
            End If
        End If
    End If

End Sub

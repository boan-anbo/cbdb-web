Option Compare Database
Public gRstOfficeCode As DAO.Recordset, gNode As clsNode, gStrSearch As String, gStrSearchAlt As String
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

Private Sub CmdFindNext_Click()
    Dim tRstAssocCodes As DAO.Recordset, tRstAssocTypes As DAO.Recordset, cNode As clsNode
    Dim tStrSQL As String, tRstDummy As DAO.Recordset, cmdSQL As ADODB.Command

    TxtOfficeCode.Value = -1
    TxtOfficeDesc.Value = ""
    TxtOfficeDescChn.Value = ""
    '
    ' clear the scratch table
    '
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    If IsNull(gRstOfficeCode) Then
         MsgBox "Error in search: table closed."
    Else
         If gStrSearch = "" Then
              MsgBox "Error in search: string empty."
         Else

            'MsgBox "Looking for entry"

            If gRstOfficeCode.EOF Then
                 CmdFindNext.Enabled = False
            Else

                If gUseAlt Then
                     gRstOfficeCode.FindNext gStrSearchAlt
                Else
                     gRstOfficeCode.FindNext gStrSearch

                    If gRstOfficeCode.NoMatch Then
                        gRstOfficeCode.FindFirst gStrSearchAlt
                        gUseAlt = True
                    End If
                End If

                If gRstOfficeCode.NoMatch Then
                     If gUseAlt Then
                         gUseAlt = False
                     End If
                     CmdFindNext.Enabled = False
                Else
                     '
                     ' next find the entry_type
                     '
                     'MsgBox "Looking for entry type"

                      Set tRstOfficeTreeIDs = CurrentDb.OpenRecordset("OFFICE_CODE_TYPE_REL", dbOpenDynaset)

                      tRstOfficeTreeIDs.FindNext "c_office_id = " + Str(gRstOfficeCode!c_office_id)

                      If Not tRstOfficeTreeIDs.NoMatch Then
                          '
                        ' set the code values
                        TxtOfficeCode.Value = gRstOfficeCode!c_office_id
                        If Not IsNull(gRstOfficeCode!c_office_trans) Then
                            TxtOfficeDesc.Value = gRstOfficeCode!c_office_trans
                        End If
                        If Not IsNull(gRstOfficeCode!c_office_chn) Then
                            TxtOfficeDescChn.Value = gRstOfficeCode!c_office_chn
                        End If
                        '
                        ' define the string
                        '
                        'MsgBox "Looking for node"
                        '
                        tStr = Trim(tRstOfficeTreeIDs!c_office_tree_id)
                        '
                        ' search the tree

                        Set cNode = mcTree.Nodes(tStr)
                        '
                        If Not IsNull(cNode) Then
                            If cNode.Key = gNode.Key Then
                                 Set tRstOfficeCode = frmZZZ_OFFICE_CODE.Form.Recordset
                                 tRstOfficeCode.FindFirst "c_office_id = " + Str(gRstOfficeCode!c_office_id)
                                 frmZZZ_OFFICE_CODE.Form.Refresh
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
                                 tStrSQL = "INSERT INTO ZZ_OFFICE_CODE ( c_office_id, c_office_trans, c_office_chn
    ) " + _
                                    "SELECT OFFICE_CODES.c_office_id, OFFICE_CODES.c_office_trans, OFFICE_CODES.c
_office_chn " + _
                                    "FROM OFFICE_CODES INNER JOIN OFFICE_CODE_TYPE_REL ON " + _
                                    "OFFICE_CODES.c_office_id = OFFICE_CODE_TYPE_REL.c_office_id " + _
                                    "WHERE (c_office_tree_id = '" + tStr + "')"

                                Set tRstOfficeCode = frmZZZ_OFFICE_CODE.Form.Recordset
                                Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_OC", dbOpenDynaset)
                                Set frmZZZ_OFFICE_CODE.Form.Recordset = tRstDummy
                                tRstOfficeCode.Close
                                '
                                cmdSQL.CommandText = "Delete * from ZZ_OFFICE_CODE"
                                cmdSQL.Execute tRecDeleted

                                'MsgBox tStrSQL

                                cmdSQL.CommandText = tStrSQL
                                cmdSQL.Execute tRecDeleted
                                '
                                Set tRstOfficeCode = CurrentDb.OpenRecordset("ZZ_OFFICE_CODE", dbOpenDynaset)
                                '
                                Set frmZZZ_OFFICE_CODE.Form.Recordset = tRstOfficeCode
                                tRstOfficeCode.FindFirst "c_office_id = " + Str(gRstOfficeCode!c_office_id)
                                frmZZZ_OFFICE_CODE.Form.Refresh
                                '
                                Set tRstDummy = Nothing
                                '
                                ' briefly set the focus on the tree to get the highlighted node
                                '
                                subTreeView.SetFocus
                                frmZZZ_OFFICE_CODE.SetFocus
                                '
                                ' set the tree values
                                '
                                Set tRstOfficeTreeIDs = CurrentDb.OpenRecordset("OFFICE_TYPE_TREE", dbOpenDynaset
)
                                '
                                tRstOfficeTreeIDs.MoveFirst
                                tRstOfficeTreeIDs.FindFirst "c_office_type_node_id = " + Chr(34) + cNode.Key + Ch
r(34)

                                'TxtTypeID.Value = Node.Tag
                                TxtTypeDesc.Value = tRstOfficeTreeIDs!c_office_type_desc
                                TxtTypeDescChn.Value = tRstOfficeTreeIDs!c_office_type_desc_chn
                                tRstOfficeTreeIDs.Close
                                Set tRstOfficeTreeIDs = Nothing
                            End If
                        End If
                    End If
                End If
            End If
        End If
    End If
End Sub

Private Sub CmdSelect_Click()
    Clear_SelectAll
    CmdSelectAll.SetFocus
    CmdSelect.Enabled = False
    If TxtOfficeCode.Value > -1 Then
        TxtOfficeCode.Value = frmZZZ_OFFICE_CODE.Form.Recordset!c_office_id
    End If
    ' MsgBox "Office Code: " + Str(TxtOfficeCode.Value)
    Forms!frmPickOfficeTree.Visible = False
End Sub

Private Sub CmdSelectAll_Click()
    If CmdSelectAll.Caption = "Select All" Then
         CmdSelectAll.Caption = "De-select All"
         frmZZZ_OFFICE_CODE.Form.DatasheetForeColor = RGB(255, 255, 255)
         frmZZZ_OFFICE_CODE.Form.DatasheetBackColor = RGB(0, 0, 255)
         CmdSelect.Enabled = True
         TxtOfficeCode.Value = -1
         TxtOfficeDesc.Value = ""
         TxtOfficeDescChn.Value = ""
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
    frmZZZ_OFFICE_CODE.Form.DatasheetForeColor = RGB(0, 0, 0)
    frmZZZ_OFFICE_CODE.Form.DatasheetBackColor = RGB(255, 255, 255)
    CmdSelect.Enabled = False
End Sub


Private Sub Form_Open(Cancel As Integer)
    Dim cRoot As clsNode, cNode1 As clsNode, cNode2 As clsNode, cNode3 As clsNode
    Dim cNode4 As clsNode, cNode5 As clsNode, cNode6 As clsNode, cNode7 As clsNode
    Dim strKey As String, strCaption As String
    Dim tRst As DAO.Recordset

    Set cmdSQL = New ADODB.Command
    '
    ' initialize the Assoc Codes dataset
    '
    Set gRstOfficeCode = CurrentDb.OpenRecordset("OFFICE_CODES", dbOpenDynaset)
    Set frmZZZ_OFFICE_CODE.Form.Recordset = gRstOfficeCode
    '
    'frmZZZ_OFFICE_CODE.Form.OrderBy = "c_sortorder"
    'frmZZZ_OFFICE_CODE.Form.OrderByOn = True

    If Not IsNull(Me.OpenArgs) Then
        Dim strOffice As String
        strOffice = Me.OpenArgs
        Dim rsOffice As DAO.Recordset
        Set rsOffice = frmZZZ_OFFICE_CODE.Form.Recordset
        rsOffice.FindFirst "c_office_id = " & strOffice
    End If

    ' set the language
    Dim tmli As MsoLanguageID
    '
    tmli = Application.LanguageSettings.LanguageID(msoLanguageIDUI)
    ' gLabelsOK = True
    If tmli = msoLanguageIDSimplifiedChinese Then
         gDisplayLanguage = "S"
    ElseIf tmli = msoLanguageIDTraditionalChinese Then
         gDisplayLanguage = "T"
    Else
         gDisplayLanguage = "E"
    End If
    '
    ' build treeview
    '
    Set tRst = CurrentDb.OpenRecordset("OFFICE_TYPE_TREE", dbOpenDynaset)

    tRst.MoveFirst
        Set mcTree = Me.subTreeView.Form.pTreeview
    With mcTree
        .NodesClear
        .AppName = AppName ' Title for message boxes:
        ' Add a Root node with main and expanded icons and make it bold

        ' use the appropriate caption
        If gDisplayLanguage = "T" Then
             strCaption = ChrW(23448) + ChrW(32887) + ChrW(20998) + ChrW(39006)
        ElseIf gdisplaylangauge = "S" Then
             strCaption = ChrW(23448) + ChrW(32844) + ChrW(20998) + ChrW(31612)
        Else
             strCaption = "Administrative Category"
        End If

        Set cRoot = .AddRoot("Root", strCaption, "FolderClosed", "FolderOpen")
        cRoot.Bold = True
        ' Loop through the records
        Do While Not tRst.EOF
             ' Add node
             strKey = tRst!c_office_type_node_id
             If gDisplayLanguage = "E" Then
                  strCaption = tRst!c_office_type_desc + " " + tRst!c_office_type_desc_chn
             Else
                  strCaption = tRst!c_office_type_desc_chn
             End If
             '
             ' Note that since the root record has an ID of "0", its length is 1 and is automatically skipped
             '
             Select Case Len(strKey)
                  Case 2
                      Set cNode1 = cRoot.AddChild(sKey:=strKey, vCaption:=strCaption)
                      cNode1.Expanded = False
                  Case 4
                      Set cNode2 = cNode1.AddChild(sKey:=strKey, vCaption:=strCaption)
                      cNode2.Expanded = False
                  Case 6
                      Set cNode3 = cNode2.AddChild(sKey:=strKey, vCaption:=strCaption)
                      cNode3.Expanded = False
                  Case 8
                      Set cNode4 = cNode3.AddChild(sKey:=strKey, vCaption:=strCaption)
                      cNode4.Expanded = False
                  Case 10
                      Set cNode5 = cNode4.AddChild(sKey:=strKey, vCaption:=strCaption)
                      cNode5.Expanded = False
                  Case 12
                      Set cNode6 = cNode5.AddChild(sKey:=strKey, vCaption:=strCaption)
                      cNode6.Expanded = False
                  Case 14
                      Set cNode7 = cNode6.AddChild(sKey:=strKey, vCaption:=strCaption)
                      cNode7.Expanded = False
                  End Select
             tRst.MoveNext
        Loop
        ' Create the node controls and display the tree
        .Refresh
    End With
    '
    TxtOfficeCode.Value = -1
    TxtOfficeTypeType.Value = -1
    TxtOfficeL1.Value = -1
    TxtOfficeL2.Value = -1
    TxtOfficeL3.Value = -1
    TxtOfficeL4.Value = -1
    TxtOfficeL5.Value = -1
    TxtTypeDesc.Value = ""
    TxtTypeDescChn.Value = ""
    TxtOfficeDesc.Value = ""
    TxtOfficeDescChn.Value = ""

    ' clear the first pass of the file

    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    cmdSQL.CommandText = "Delete * from ZZ_OFFICE_CODE"
    cmdSQL.Execute tRecDeleted

    Set cmdSQL = Nothing
    Set tRst = Nothing
End Sub
Private Sub CmdFind_Click()
On Error GoTo Err_CmdFind_Click

    'Dim StrSearch As String
    'Me.TxtSearch.SetFocus
    'StrSearch = Me.TxtSearch.Value
    'If StrSearch <> "" Then
       'Dim rsOfficeCodes As DAO.Recordset
       'Set rsOfficeCodes = frmZZZ_OFFICE_CODE.Form.Recordset
       'Dim StrSearchStr As String
       'StrSearchStr = "c_office_chn = " + Chr(34) + StrSearch + Chr(34)
       'rsOfficeCodes.FindFirst StrSearchStr
    'End If
    Call NodeSearch

Exit_CmdFind_Click:
    Exit Sub

Err_CmdFind_Click:
    MsgBox Err.Description
    Resume Exit_CmdFind_Click

End Sub

Private Sub mcTree_Click(cNode As clsNode)
    Dim tRst As DAO.Recordset, tRstOffice As DAO.Recordset
    Dim tOfficeCodeQuery As DAO.QueryDef, prm As DAO.Parameter
    Dim tRstOfficeCode As DAO.Recordset, tRstDummy As DAO.Recordset, tLen As Integer
    Dim tStrQuery As String

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '

    Me.TxtOfficeCode.Value = -1
    Me.TxtOfficeDesc.Value = ""
    Me.TxtOfficeDescChn.Value = ""

    CmdSelect.Enabled = False

    ' reset the form colors
    '
    Clear_SelectAll
    '
    If cNode.Key = "Root" Then
         CmdSelectAll.Enabled = False
         '
         ' reset the entry code choices
         '
         Set gRstOfficeCode = CurrentDb.OpenRecordset("OFFICE_CODES", dbOpenDynaset)
         '
         Set frmZZZ_OFFICE_CODE.Form.Recordset = gRstOfficeCode
         frmZZZ_OFFICE_CODE.Form.Refresh
    Else
         Set tRst = CurrentDb.OpenRecordset("OFFICE_TYPE_TREE", dbOpenDynaset)
         '
         tRst.MoveFirst
         tRst.FindFirst "c_office_type_node_id = " + Chr(34) + cNode.Key + Chr(34)

          'TxtTypeID.Value = Node.Tag
          TxtTypeDesc.Value = tRst!c_office_type_desc
          TxtTypeDescChn.Value = tRst!c_office_type_desc_chn
          tRst.Close
          Set tRst = Nothing
          '
         CmdSelectAll.Enabled = True
         '
         '
         ' Clear the table
         '
         Set tRstOfficeCode = frmZZZ_OFFICE_CODE.Form.Recordset
         Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_OC", dbOpenDynaset)
         Set frmZZZ_OFFICE_CODE.Form.Recordset = tRstDummy
         tRstOfficeCode.Close
         '
         cmdSQL.CommandText = "Delete * from ZZ_OFFICE_CODE"
         cmdSQL.Execute tRecDeleted
         '
         tLen = Len(cNode.Key)
         tStrQuery = "INSERT INTO ZZ_OFFICE_CODE ( c_office_id, c_office_trans, c_office_chn ) " + _
             "SELECT DISTINCT OFFICE_CODES.c_office_id, OFFICE_CODES.c_office_trans, OFFICE_CODES.c_office_chn " +
 _
             "FROM OFFICE_CODES INNER JOIN OFFICE_CODE_TYPE_REL ON " + _
             "OFFICE_CODES.c_office_id = OFFICE_CODE_TYPE_REL.c_office_id " + _
             "WHERE (((Left([c_office_tree_id]," + Str(tLen) + "))='" + cNode.Key + "'))"
        '
        ' now repopulate
        '
        cmdSQL.CommandText = tStrQuery
        cmdSQL.Execute tRecDeleted
        '
        Set tRstOfficeCode = CurrentDb.OpenRecordset("ZZ_OFFICE_CODE", dbOpenDynaset)
        '
        Set frmZZZ_OFFICE_CODE.Form.Recordset = tRstOfficeCode
        Set tRstDummy = Nothing
        '
    End If
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
Private Sub TxtSearch_Change()
    If TxtSearch.Text = "" Or IsNull(TxtSearch.Text) Then
         If TxtSearchChn.Value = "" Or IsNull(TxtSearchChn.Value) Then
             Me.CmdFind.Enabled = False
         End If
    Else
         TxtSearchChn.Value = ""
         CmdFind.Enabled = True
    End If
    CmdFindNext.Enabled = False
End Sub


Private Sub NodeSearch()

     Dim cNode As clsNode, tStr As String, tRstOfficeCode As DAO.Recordset, tRstOfficeTreeIDs As DAO.Recordset
     Dim tRstDummy As DAO.Recordset, tStrSQL As String, tStrSearchChn As String, tStrSearchEng As String
     Dim tStrSearch As String, tStrLen As String, cmdSQL As ADODB.Command, tStrSearchAlt As String

     ' all specific association codes will have a type of the form 0101
     ' hence the ValuePath for the relevant node will be "K000/K01/K0101"
     ' The command to locate the relevant node is:
     ' cNode = mcTreee.Node(tStrValuePath)
     ' mcTree.activeNode = cNode
     '
     TxtOfficeCode.Value = -1
     TxtOfficeDesc.Value = ""
     TxtOfficeDescChn.Value = ""
     '
     ' search for the search string in ASSOC_CODES
     TxtSearchChn.SetFocus
     tStrSearchChn = Trim(Me.TxtSearchChn.Text)
     TxtSearch.SetFocus
     tStrSearchEng = Trim(Me.TxtSearch.Text)
     tStrSearch = ""
    CmdFind.SetFocus
    '
    ' clear the scratch table
    '
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    cmdSQL.CommandText = "Delete * from ZZ_OFFICE_CODE"
    cmdSQL.Execute tRecDeleted
    '
    ' because the user may have a hard time picking the exact term, I'll treat it as
    ' (1) the beginning of the actual term
    ' (2) part of the term
    '
    If tStrSearchChn <> "" Then
        tStrLen = Str(LenB(tStrSearchChn))
        gStrSearch = "LeftB(c_office_chn," + tStrLen + ") = '" + tStrSearchChn + "'"
        gStrSearchAlt = "InStrB(1,c_office_chn,'" + tStrSearchChn + "') > 0"
        'tStrSearch = "c_entry_desc_chn = '" + tStrSearchChn + "'"
    ElseIf tStrSearchEng <> "" Then
        tStrLen = Str(Len(tStrSearchEng))
        gStrSearch = "Left(c_office_trans," + tStrLen + ") = '" + tStrSearchEng + "'"
        gStrSearchAlt = "InStr(1,c_office_trans,'" + tStrSearchEng + "') > 0"
        'tStrSearch = "c_entry_desc = '" + tStrSearchEng + "'"
    End If

    gUseAlt = False
    If Not (gStrSearch = "") Then

        'MsgBox "Looking for entry"

        Set gRstOfficeCode = CurrentDb.OpenRecordset("OFFICE_CODES", dbOpenDynaset)

        gRstOfficeCode.FindFirst gStrSearch

        If gRstOfficeCode.NoMatch Then
            gRstOfficeCode.FindFirst gStrSearchAlt
            gUseAlt = True
        End If

        If gRstOfficeCode.NoMatch Then
             gUseAlt = False
             CmdFindNext.Enabled = False
        Else
             CmdFindNext.Enabled = True
             '
             ' next find the entry_type
             '
             'MsgBox "Looking for entry type"

            Set tRstOfficeTreeIDs = CurrentDb.OpenRecordset("OFFICE_CODE_TYPE_REL", dbOpenDynaset)

            tRstOfficeTreeIDs.FindNext "c_office_id = " + Str(gRstOfficeCode!c_office_id)

            If Not tRstOfficeTreeIDs.NoMatch Then
                '
                ' set the code values
                TxtOfficeCode.Value = gRstOfficeCode!c_office_id
                If Not IsNull(gRstOfficeCode!c_office_trans) Then
                    TxtOfficeDesc.Value = gRstOfficeCode!c_office_trans
                End If
                If Not IsNull(gRstOfficeCode!c_office_chn) Then
                    TxtOfficeDescChn.Value = gRstOfficeCode!c_office_chn
                End If
                '
                ' define the string
                '
                'MsgBox "Looking for node"
                '
                tStr = Trim(tRstOfficeTreeIDs!c_office_tree_id)
                '
                ' search the tree
                Set cNode = mcTree.Nodes(tStr)
                '
                If Not IsNull(cNode) Then
                    '
                    'MsgBox "found node"
                    '
                    Set mcTree.ActiveNode = cNode
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
                    tStrSQL = "INSERT INTO ZZ_OFFICE_CODE ( c_office_id, c_office_trans, c_office_chn ) " + _
                        "SELECT OFFICE_CODES.c_office_id, OFFICE_CODES.c_office_trans, OFFICE_CODES.c_office_chn
" + _
                        "FROM OFFICE_CODES INNER JOIN OFFICE_CODE_TYPE_REL ON " + _
                        "OFFICE_CODES.c_office_id = OFFICE_CODE_TYPE_REL.c_office_id " + _
                        "WHERE (c_office_tree_id = '" + tStr + "')"

                    Set tRstOfficeCode = frmZZZ_OFFICE_CODE.Form.Recordset
                    Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_OC", dbOpenDynaset)
                    Set frmZZZ_OFFICE_CODE.Form.Recordset = tRstDummy
                    tRstOfficeCode.Close
                    '
                    cmdSQL.CommandText = "Delete * from ZZ_OFFICE_CODE"
                    cmdSQL.Execute tRecDeleted

                    'MsgBox tStrSQL

                    cmdSQL.CommandText = tStrSQL
                    cmdSQL.Execute tRecDeleted
                    '
                    Set tRstOfficeCode = CurrentDb.OpenRecordset("ZZ_OFFICE_CODE", dbOpenDynaset)
                    '
                    Set frmZZZ_OFFICE_CODE.Form.Recordset = tRstOfficeCode
                    tRstOfficeCode.FindFirst "c_office_id = " + Str(gRstOfficeCode!c_office_id)
                    frmZZZ_OFFICE_CODE.Form.Refresh
                    '
                    Set tRstDummy = Nothing
                    '
                    ' briefly set the focus on the tree to get the highlighted node
                    '
                    subTreeView.SetFocus
                    frmZZZ_OFFICE_CODE.SetFocus
                    '
                    ' set the tree values
                    '
                    Set tRstOfficeTreeIDs = CurrentDb.OpenRecordset("OFFICE_TYPE_TREE", dbOpenDynaset)
                    '
                    tRstOfficeTreeIDs.MoveFirst
                    tRstOfficeTreeIDs.FindFirst "c_office_type_node_id = " + Chr(34) + cNode.Key + Chr(34)

                    'TxtTypeID.Value = Node.Tag
                    TxtTypeDesc.Value = tRstOfficeTreeIDs!c_office_type_desc
                    TxtTypeDescChn.Value = tRstOfficeTreeIDs!c_office_type_desc_chn
                    tRstOfficeTreeIDs.Close
                    Set tRstOfficeTreeIDs = Nothing
                End If
            End If
        End If
    End If

End Sub

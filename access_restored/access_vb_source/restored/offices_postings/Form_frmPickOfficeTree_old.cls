                            End If
                        End If
                    End If
                End If
            End If
        End If
    End If
End Sub

Private Sub CmdSelect_Click()
    CmdSelectAll.Caption = "Select All"
    '
    ' reset the form colors
    '
    frmZZZ_OFFICE_CODE.Form.DatasheetForeColor = RGB(0, 0, 0)
    frmZZZ_OFFICE_CODE.Form.DatasheetBackColor = RGB(255, 255, 255)
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
    Dim tNode As Node, tStrNode As String, tStrParent As String
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
    '
    ' build treeview
    '
    Set tRst = CurrentDb.OpenRecordset("OFFICE_TYPE_TREE", dbOpenDynaset)
    TreeViewTypes.Nodes.Clear
    Set tNode = TreeViewTypes.Nodes.Add(, , "K000", "Dynastic Office Hierarchies")
    tNode.Expanded = True
    tNode.Tag = "000"

    '
    '   the general syntax for adding nodes is:
    '        TreeViewTypes.Nodes.Add("K...", tvwChild, parent node, "Text")
    '
    tRst.MoveFirst
    Do While Not tRst.EOF
         If Not IsNull(tRst!c_parent_id) Then
             If tRst!c_parent_id = "0" Then
                  tStrParent = "K000"
             Else
                  tStrParent = "K" + Trim(tRst!c_parent_id)
             End If
             tStrNode = "K" + Trim(tRst!c_office_type_node_id)
             Set tNode = TreeViewTypes.Nodes.Add(tStrParent, tvwChild, tStrNode, tRst!c_office_type_desc)
             '
             ' Since I have eliminated the secondary tree elements, the following code is no longer valid
             ' I simply assign the node ID to the tag
             '
             ' snip the headers for the secondary tree elements for the tags
             '
             'If Val(Mid(tRst!c_office_type_node_id, 1, 2)) > 4 Then
             '     tNode.Tag = Mid(tRst!c_office_type_node_id, 3)
             'Else
             '     tNode.Tag = tRst!c_office_type_node_id
             'End If
             tNode.Tag = tRst!c_office_type_node_id
         End If
         tRst.MoveNext
    Loop
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

Private Sub TreeViewTypes_NodeClick(ByVal Node As Object)
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
     If Node.Tag = "000" Then
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
          tRst.FindFirst "c_office_type_node_id = " + Chr(34) + Node.Tag + Chr(34)

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
         tLen = Len(Node.Tag)
         tStrQuery = "INSERT INTO ZZ_OFFICE_CODE ( c_office_id, c_office_trans, c_office_chn ) " + _
             "SELECT DISTINCT OFFICE_CODES.c_office_id, OFFICE_CODES.c_office_trans, OFFICE_CODES.c_office_chn " +
 _
             "FROM OFFICE_CODES INNER JOIN OFFICE_CODE_TYPE_REL ON " + _
             "OFFICE_CODES.c_office_id = OFFICE_CODE_TYPE_REL.c_office_id " + _
             "WHERE (((Left([c_office_tree_id]," + Str(tLen) + "))='" + Node.Tag + "'))"
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

    Dim tNode As Node, tStr As String, tRstOfficeCode As DAO.Recordset, tRstOfficeTreeIDs As DAO.Recordset
    Dim tRstDummy As DAO.Recordset, tStrSQL As String, tStrSearchChn As String, tStrSearchEng As String
    Dim tStrSearch As String, tStrLen As String, cmdSQL As ADODB.Command, tStrSearchAlt As String

    ' all specific association codes will have a type of the form 0101
    ' hence the ValuePath for the relevant node will be "K000/K01/K0101"
    ' The command to locate the relevant node is:
    ' tNode = TreeViewType.FindNode(tStrValuePath)
    ' TreeViewType.SelectedNode = tNode
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

                   Set tNode = TreeViewTypes.Nodes("K" + tStr)
                   '
                   If Not IsNull(tNode) Then
                       '
                       'MsgBox "found node"
                       '
                       tNode.Selected = True
                       '
                       ' then one makes it visible
                       '
                       tNode.EnsureVisible
                       '
                       Set gNode = tNode
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
                       TreeViewTypes.SetFocus
                    frmZZZ_OFFICE_CODE.SetFocus
                    '
                    ' set the tree values
                    '
                    Set tRstOfficeTreeIDs = CurrentDb.OpenRecordset("OFFICE_TYPE_TREE", dbOpenDynaset)
                    '
                    tRstOfficeTreeIDs.MoveFirst
                    tRstOfficeTreeIDs.FindFirst "c_office_type_node_id = " + Chr(34) + tNode.Tag + Chr(34)

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

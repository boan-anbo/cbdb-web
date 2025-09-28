                        If tNode = gNode Then
                             Set tRstEntryCodes = frmZZZ_ENTRY_CODE.Form.Recordset
                             tRstEntryCodes.FindNext "c_entry_code = " + Str(gRstEntryCode!c_entry_code)
                             frmZZZ_ENTRY_CODE.Form.Refresh
                        Else
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
                             tStrSQL = "INSERT INTO ZZ_ENTRY_CODE (c_ENTRY_code, c_ENTRY_desc, c_ENTRY_desc_chn) "
 + _
                                 "SELECT ENTRY_CODE_TYPE_REL.c_ENTRY_code AS c_ENTRY_code, " + _
                                 "ENTRY_CODES.c_ENTRY_desc, ENTRY_CODES.c_ENTRY_desc_chn " + _
                                 "FROM ENTRY_CODES INNER JOIN ENTRY_CODE_TYPE_REL ON ENTRY_CODES.c_ENTRY_code = "
+ _
                                 "ENTRY_CODE_TYPE_REL.c_ENTRY_code " + _
                                 "WHERE (((ENTRY_CODE_TYPE_REL.c_entry_type)='" + tStr + "'))"

                             Set tRstEntryCodes = frmZZZ_ENTRY_CODE.Form.Recordset
                             Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_EC", dbOpenDynaset)
                             Set frmZZZ_ENTRY_CODE.Form.Recordset = tRstDummy
                             tRstEntryCodes.Close
                             '
                             Set cmdSQL = New ADODB.Command
                             cmdSQL.ActiveConnection = CurrentProject.Connection
                             cmdSQL.CommandType = adCmdText

                             cmdSQL.CommandText = "Delete * from ZZ_ENTRY_CODE"
                             cmdSQL.Execute tRecDeleted

                             'MsgBox tStrSQL

                            cmdSQL.CommandText = tStrSQL
                            cmdSQL.Execute tRecDeleted
                            '
                            Set tRstEntryCodes = CurrentDb.OpenRecordset("ZZ_ENTRY_CODE", dbOpenDynaset)
                            '
                            tRstEntryCodes.MoveFirst
                            Set frmZZZ_ENTRY_CODE.Form.Recordset = tRstEntryCodes
                            tRstEntryCodes.FindNext "c_entry_code = " + Str(gRstEntryCode!c_entry_code)
                            frmZZZ_ENTRY_CODE.Form.Refresh
                            '
                            Set tRstDummy = Nothing
                            '
                            ' set the type values
                            '
                            Set tRstEntryTypes = CurrentDb.OpenRecordset("ENTRY_TYPES", dbOpenDynaset)
                            '
                            tRstEntryTypes.MoveFirst
                            tRstEntryTypes.FindFirst "c_entry_type = " + Chr(34) + tNode.Tag + Chr(34)
                            TxtTypeID.Value = tNode.Tag
                            TxtTypeDesc.Value = tRstEntryTypes!c_entry_type_desc
                            TxtTypeChn.Value = tRstEntryTypes!c_entry_type_desc_chn
                            tRstEntryTypes.Close
                            Set tRstEntryTypes = Nothing
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
    Forms!frmPickEntry2.Visible = False
End Sub

Private Sub CmdSelectAll_Click()
    If CmdSelectAll.Caption = "Select All" Then
         CmdSelectAll.Caption = "De-select All"
         frmZZZ_ENTRY_CODE.Form.DatasheetForeColor = RGB(255, 255, 255)
         frmZZZ_ENTRY_CODE.Form.DatasheetBackColor = RGB(0, 0, 255)
         CmdSelect.Enabled = True
         Me.TxtEntryCode.Value = -1
         Me.TxtEntryDesc.Value = ""
         Me.TxtEntryChn.Value = ""
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
    frmZZZ_ENTRY_CODE.Form.DatasheetForeColor = RGB(0, 0, 0)
    frmZZZ_ENTRY_CODE.Form.DatasheetBackColor = RGB(255, 255, 255)
End Sub
Private Sub Form_Open(Cancel As Integer)
    Dim tNode As Node, tStrNode As String, tStrParent As String, tStrEntry As String
    Dim tRst As DAO.Recordset, tRstEntry As DAO.Recordset
    '
    ' initialize the Entry Codes dataset
    '
    Set gRstEntryCode = CurrentDb.OpenRecordset("ENTRY_CODES", dbOpenDynaset)
    Set frmZZZ_ENTRY_CODE.Form.Recordset = gRstEntryCode
    '
    Set tRstEntry = frmZZZ_ENTRY_CODE.Form.Recordset
    '
    If Not IsNull(Me.OpenArgs) Then
         tStrEntry = Me.OpenArgs
         tRstEntry.FindFirst "c_entry_code = " & tStrEntry
    End If
    '
    ' build treeview
    '
    Set tRst = CurrentDb.OpenRecordset("ENTRY_TYPES", dbOpenDynaset)
    TreeViewTypes.Nodes.Clear
    Set tNode = TreeViewTypes.Nodes.Add(, , "K000", "All Entry Types")
    tNode.Expanded = True
    tNode.Tag = "000"
    '
    ' the general syntax for adding nodes is:
    '         TreeViewTypes.Nodes.Add("K...", tvwChild, parent node, "Text")
    '
    tRst.MoveFirst
    Do While Not tRst.EOF
         If tRst!c_entry_type_parent_id = "0" Then
              tStrParent = "K000"
         Else
              tStrParent = "K" + Trim(tRst!c_entry_type_parent_id)
         End If
         tStrNode = "K" + Trim(tRst!c_entry_type)
         Set tNode = TreeViewTypes.Nodes.Add(tStrParent, tvwChild, tStrNode, tRst!c_entry_type_desc)
         tNode.Tag = tRst!c_entry_type
         tRst.MoveNext
    Loop
    '
    Set tRst = Nothing

    frmZZZ_ENTRY_CODE.Form.DatasheetForeColor = RGB(0, 0, 0)
    frmZZZ_ENTRY_CODE.Form.DatasheetBackColor = RGB(255, 255, 255)
    tRstEntry.MoveFirst
End Sub
Private Sub CmdFind_Click()
On Error GoTo Err_CmdFind_Click

    Call NodeSearch

Exit_CmdFind_Click:
    Exit Sub

Err_CmdFind_Click:
    MsgBox Err.Description
    Resume Exit_CmdFind_Click

End Sub


Private Sub TreeViewTypes_NodeClick(ByVal Node As Object)
    Dim tRst As DAO.Recordset, tRstEntry As DAO.Recordset
    Dim tRstEntryCode As DAO.Recordset, tRstDummy As DAO.Recordset
    Dim tStrSQL As String

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    Me.TxtEntryCode.Value = -1
    Me.TxtEntryDesc.Value = ""
    Me.TxtEntryChn.Value = ""
    CmdSelect.Enabled = False

    ' reset the form colors
    '
    Clear_SelectAll
    '
    If Node.Tag = "000" Then
         TxtTypeID.Value = ""
         TxtTypeDesc.Value = ""
         TxtTypeChn.Value = ""
         CmdSelectAll.Enabled = False
         '
         ' reset the entry code choices
         '
         Set tRstEntryCode = CurrentDb.OpenRecordset("ENTRY_CODES", dbOpenDynaset)
         '
         Set frmZZZ_ENTRY_CODE.Form.Recordset = tRstEntryCode
         frmZZZ_ENTRY_CODE.Form.Refresh
    Else
         Set tRst = CurrentDb.OpenRecordset("ENTRY_TYPES", dbOpenDynaset)
         '
         tRst.MoveFirst
         tRst.FindFirst "c_entry_type = " + Chr(34) + Node.Tag + Chr(34)
         TxtTypeID.Value = Node.Tag
         TxtTypeDesc.Value = tRst!c_entry_type_desc
         TxtTypeChn.Value = tRst!c_entry_type_desc_chn
         tRst.Close
         Set tRst = Nothing
         '
         CmdSelectAll.Enabled = True
         '
         ' we need to distinguish between type / subtype
         '
         tStrSQL = "INSERT INTO ZZ_ENTRY_CODE (c_ENTRY_code, c_ENTRY_desc, c_ENTRY_desc_chn) " + _
             "SELECT ENTRY_CODE_TYPE_REL.c_ENTRY_code AS c_ENTRY_code, " + _
             "ENTRY_CODES.c_ENTRY_desc, ENTRY_CODES.c_ENTRY_desc_chn " + _
             "FROM ENTRY_CODES INNER JOIN ENTRY_CODE_TYPE_REL ON ENTRY_CODES.c_ENTRY_code = " + _
             "ENTRY_CODE_TYPE_REL.c_ENTRY_code "

          If Len(Node.Tag) = 2 Then
               tStrSQL = tStrSQL + "WHERE (((Left((ENTRY_CODE_TYPE_REL.c_ENTRY_type),2))= '" + _
                   TxtTypeID.Value + "'))"
          Else
               tStrSQL = tStrSQL + "WHERE (ENTRY_CODE_TYPE_REL.c_ENTRY_type = '" + _
                   TxtTypeID.Value + "')"
          End If

          '
          Set tRstEntryCode = frmZZZ_ENTRY_CODE.Form.Recordset
          Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_EC", dbOpenDynaset)
          Set frmZZZ_ENTRY_CODE.Form.Recordset = tRstDummy
          tRstEntryCode.Close
          '
          cmdSQL.CommandText = "Delete * from ZZ_ENTRY_CODE"
          cmdSQL.Execute tRecDeleted

          cmdSQL.CommandText = tStrSQL
          cmdSQL.Execute tRecDeleted
          '
          Set tRstEntryCode = CurrentDb.OpenRecordset("ZZ_ENTRY_CODE", dbOpenDynaset)
          '
          Set frmZZZ_ENTRY_CODE.Form.Recordset = tRstEntryCode
          Set tRstDummy = Nothing
          '
    End If
End Sub

Private Sub TxtSearch_Change()
    If TxtSearch.Text = "" Then
         If TxtSearchChn.Value = "" Then
             CmdFind.Enabled = False
         End If
    Else
         TxtSearchChn.Value = ""
         CmdFind.Enabled = True
    End If
    CmdFindNext.Enabled = False
End Sub

Private Sub TxtSearchChn_Change()
    If TxtSearchChn.Text = "" Then
         If TxtSearch.Value = "" Then
             Me.CmdFind.Enabled = False
         End If
    Else
         TxtSearch.Value = ""
         CmdFind.Enabled = True
    End If
    CmdFindNext.Enabled = False
End Sub


Private Sub NodeSearch()

    Dim tNode As Node, tStr As String, tRstEntryCodes As DAO.Recordset, tRstEntryTypes As DAO.Recordset
    Dim tRstDummy As DAO.Recordset, tStrSQL As String, tStrSearchChn As String, tStrSearchEng As String
    Dim tStrLen As String, cmdSQL As ADODB.Command

    ' all specific association codes will have a type of the form 0101
    ' hence the ValuePath for the relevant node will be "K000/K01/K0101"
    ' The command to locate the relevant node is:
    ' tNode = TreeViewType.FindNode(tStrValuePath)
    ' TreeViewType.SelectedNode = tNode
    '
    TxtEntryDesc.Value = ""
    TxtEntryChn.Value = ""
    '
    ' search for the search string in ASSOC_CODES
    TxtSearchChn.SetFocus
    tStrSearchChn = Trim(Me.TxtSearchChn.Text)
    TxtSearch.SetFocus
    tStrSearchEng = Trim(Me.TxtSearch.Text)
    CmdFind.SetFocus
    '
    ' because the user may have a hard time picking the exact term, I'll treat it as
    ' (1) the beginning of the actual term
    ' (2) part of the term
    '
    gUseAlt = False
    gStrSearch = ""
    If tStrSearchChn <> "" Then
        tStrLen = Str(LenB(tStrSearchChn))
        gStrSearch = "LeftB(c_entry_desc_chn," + tStrLen + ") = '" + tStrSearchChn + "'"
        gStrSearchAlt = "InStrB(1,c_entry_desc_chn,'" + tStrSearchChn + "') > 0"
        'tStrSearch = "c_entry_desc_chn = '" + tStrSearchChn + "'"
    ElseIf tStrSearchEng <> "" Then
        tStrLen = Str(Len(tStrSearchEng))
        gStrSearch = "Left(c_entry_desc," + tStrLen + ") = '" + tStrSearchEng + "'"
        gStrSearchAlt = "InStr(1,c_entry_desc,'" + tStrSearchEng + "') > 0"
        'tStrSearch = "c_entry_desc = '" + tStrSearchEng + "'"
    End If

    If Not (gStrSearch = "") Then

        'MsgBox "Looking for entry"

        Set gRstEntryCode = CurrentDb.OpenRecordset("ENTRY_CODES", dbOpenDynaset)

        gRstEntryCode.FindFirst gStrSearch

        If gRstEntryCode.NoMatch Then
            gRstEntryCode.FindFirst gStrSearchAlt
            gUseAlt = True
        End If

        If gRstEntryCode.NoMatch Then
             If gUseAlt Then
                 gUseAlt = False
             End If
             CmdFindNext.Enabled = False
        Else
             CmdFindNext.Enabled = True
             '
             ' next find the entry_type
             '
             'MsgBox "Looking for entry type"

            Set tRstEntryTypes = CurrentDb.OpenRecordset("ENTRY_CODE_TYPE_REL", dbOpenDynaset)

            tRstEntryTypes.FindNext "c_entry_code = " + Str(gRstEntryCode!c_entry_code)

            If Not tRstEntryTypes.NoMatch Then
                '
                ' set the code values
                '
                TxtEntryCode.Value = gRstEntryCode!c_entry_code
                If Not IsNull(gRstEntryCode!c_entry_desc) Then
                    TxtEntryDesc.Value = gRstEntryCode!c_entry_desc
                End If
                If Not IsNull(gRstEntryCode!c_entry_desc_chn) Then
                    TxtEntryChn.Value = gRstEntryCode!c_entry_desc_chn
                End If
                '
                ' define the string
                '
                'MsgBox "Looking for node"
                '
                tStr = Trim(tRstEntryTypes!c_entry_type)
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
                    tStrSQL = "INSERT INTO ZZ_ENTRY_CODE (c_ENTRY_code, c_ENTRY_desc, c_ENTRY_desc_chn) " + _
                        "SELECT ENTRY_CODE_TYPE_REL.c_ENTRY_code AS c_ENTRY_code, " + _
                        "ENTRY_CODES.c_ENTRY_desc, ENTRY_CODES.c_ENTRY_desc_chn " + _
                        "FROM ENTRY_CODES INNER JOIN ENTRY_CODE_TYPE_REL ON ENTRY_CODES.c_ENTRY_code = " + _
                        "ENTRY_CODE_TYPE_REL.c_ENTRY_code " + _
                        "WHERE (((ENTRY_CODE_TYPE_REL.c_entry_type)='" + tStr + "'))"

                    Set tRstEntryCodes = frmZZZ_ENTRY_CODE.Form.Recordset
                    Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_EC", dbOpenDynaset)
                    Set frmZZZ_ENTRY_CODE.Form.Recordset = tRstDummy
                    tRstEntryCodes.Close
                    '
                    Set cmdSQL = New ADODB.Command
                    cmdSQL.ActiveConnection = CurrentProject.Connection
                    cmdSQL.CommandType = adCmdText

                    cmdSQL.CommandText = "Delete * from ZZ_ENTRY_CODE"
                    cmdSQL.Execute tRecDeleted

                    'MsgBox tStrSQL

                    cmdSQL.CommandText = tStrSQL
                    cmdSQL.Execute tRecDeleted
                    '
                    Set tRstEntryCodes = CurrentDb.OpenRecordset("ZZ_ENTRY_CODE", dbOpenDynaset)
                    '
                    tRstEntryCodes.MoveFirst
                    Set frmZZZ_ENTRY_CODE.Form.Recordset = tRstEntryCodes
                    tRstEntryCodes.FindNext "c_entry_code = " + Str(gRstEntryCode!c_entry_code)
                    frmZZZ_ENTRY_CODE.Form.Refresh
                    '
                    Set tRstDummy = Nothing
                    '
                    ' set the type values
                    '
                    Set tRstEntryTypes = CurrentDb.OpenRecordset("ENTRY_TYPES", dbOpenDynaset)
                    '
                    tRstEntryTypes.MoveFirst
                    tRstEntryTypes.FindFirst "c_entry_type = " + Chr(34) + tNode.Tag + Chr(34)
                    TxtTypeID.Value = tNode.Tag
                    TxtTypeDesc.Value = tRstEntryTypes!c_entry_type_desc
                    TxtTypeChn.Value = tRstEntryTypes!c_entry_type_desc_chn
                    tRstEntryTypes.Close
                    Set tRstEntryTypes = Nothing
                End If
            End If
        End If
    End If

End Sub
Form_frmPickETHNICITY - 1

Option Compare Database

Private Sub CmdCancel_Click()
On Error GoTo Err_CmdCancel_Click


    DoCmd.Close

Exit_CmdCancel_Click:
    Exit Sub

Err_CmdCancel_Click:
    MsgBox Err.Description
    Resume Exit_CmdCancel_Click

End Sub

Private Sub CmdSelect_Click()
    Forms!frmPickETHNICITY.Visible = False
End Sub

Private Sub Form_Open(Cancel As Integer)

  If Not IsNull(Me.OpenArgs) Then
     Dim strETHN As String
     strETHN = Me.OpenArgs
     Dim rsEthn As DAO.Recordset
     Set rsEthn = frmETHNICITY.Form.Recordset
     rsEthn.FindFirst "c_ethnicity_code = " & strETHN
  End If
End Sub
Private Sub CmdFind_Click()
On Error GoTo Err_CmdFind_Click

    Dim StrSearch As String
    Me.TxtSearch.SetFocus
    StrSearch = Me.TxtSearch.Value
    If StrSearch <> "" Then
       Dim rsEthn As DAO.Recordset
       Set rsEthn = frmETHNICITY.Form.Recordset
       Dim StrSearchStr As String
       StrSearchStr = "c_name_chn = " + Chr(34) + StrSearch + Chr(34)
       rsEthn.FindFirst StrSearchStr
    End If

Exit_CmdFind_Click:
    Exit Sub

Err_CmdFind_Click:
    MsgBox Err.Description
    Resume Exit_CmdFind_Click

End Sub

Private Sub TxtSearch_Change()
    If Me.TxtSearch.Text = "" Then
         Me.CmdFind.Enabled = False
    Else
         Me.CmdFind.Enabled = True
    End If
End Sub

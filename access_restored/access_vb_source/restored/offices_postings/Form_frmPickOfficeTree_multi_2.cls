
Option Compare Database
Public gRstOfficeCode As DAO.Recordset, gNode As clsNode, gStrSearch As String, gStrSearchAlt As String
Public gUseAlt As Boolean, gDisplayLanguage As String, gSelectCount As Integer, gStrDynasty As String, gStrDynast
yChn As String
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
    Dim cmdSQL As ADODB.Command, connSQL As ADODB.Connection, ti As Integer, tMultiDynasty As Boolean, tStrDynast
y As String, tStrDynastyChn As String
    CmdSelectAll.SetFocus
    CmdSelect.Enabled = False

    gSelectCount = 0

    For Each varItm In ListOffice.ItemsSelected
        gSelectCount = gSelectCount + 1
    Next varItm

    If gSelectCount = 1 Then
         ' this means that there is only on selected item
         For Each varItm In ListOffice.ItemsSelected
             Me.TxtTypeDesc.Value = ListOffice.Column(1, varItm)
             Me.TxtTypeDescChn.Value = ListOffice.Column(2, varItm)
             Me.TxtOfficeDesc.Value = ListOffice.Column(3, varItm)
             Me.TxtOfficeDescChn.Value = ListOffice.Column(4, varItm)
             Me.TxtOfficeCode.Value = ListOffice.Column(0, varItm)
         Next varItm
    ElseIf gSelectCount = ListOffice.ListCount - 1 Then
         Me.TxtOfficeDesc.Value = "All"
         Me.TxtOfficeDescChn.Value = "All"
         Me.TxtOfficeCode.Value = -1
    Else
         Me.TxtOfficeDesc.Value = "Multi-select"
         Me.TxtOfficeDescChn.Value = "Multi-select"
         Me.TxtOfficeCode.Value = -2
         'MsgBox "Multi-select"
    End If

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    cmdSQL.CommandText = "DELETE * FROM ZZ_OFFICE_CODE"
    cmdSQL.Execute tRecCount

    tMultiDynasty = False

    Set tRst = CurrentDb.OpenRecordset("ZZ_OFFICE_CODE", dbOpenDynaset)
    For Each varItm In ListOffice.ItemsSelected
        tRst.AddNew
        tRst!c_office_id = ListOffice.Column(0, varItm)
        tRst!c_office_trans = ListOffice.Column(3, varItm)
        tRst!c_office_chn = ListOffice.Column(4, varItm)
        tRst!c_dynasty = ListOffice.Column(1, varItm)
        tRst!c_dynasty_chn = ListOffice.Column(2, varItm)
        tRst.Update
    Next varItm
    tRst.Close
    '
    ' get the dynasty code
    '
    cmdSQL.CommandText = "UPDATE OFFICE_CODES INNER JOIN ZZ_OFFICE_CODE ON OFFICE_CODES.c_office_id = ZZ_OFFICE_C
ODE.c_office_id " + _
        "SET ZZ_OFFICE_CODE.c_dy = [OFFICE_CODES].[c_dy];"

    cmdSQL.Execute tRecCount

    ListOffice.Requery
    'For ti = 0 To ListOffice.ListCount
    '    ListOffice.Selected(ti) = False
    'Next ti
    gSelectCount = 0

    ' MsgBox "Office Code: " + Str(TxtOfficeCode.Value)
    Forms!frmPickOfficeTree_multi_2.Visible = False
End Sub

Private Sub CmdSelectAll_Click()
    Dim ti As Long
    If CmdSelectAll.Caption = "Select All" Then
        CmdSelectAll.Caption = "De-select All"
        For ti = 0 To ListOffice.ListCount
            ListOffice.Selected(ti) = True
        Next ti
        CmdSelect.Enabled = True

           TxtOfficeCode.Value = -1
           TxtOfficeDesc.Value = gStrDynasty
           TxtOfficeDescChn.Value = gStrDynastyChn
    Else
        TxtOfficeDesc.Value = ""
        TxtOfficeDescChn.Value = ""
        CmdSelectAll.SetFocus
        Clear_SelectAll
    End If
End Sub
Private Sub Clear_SelectAll()
    CmdSelectAll.Caption = "Select All"
    '
    ' reset the form colors
    '
    For ti = 0 To ListOffice.ListCount
        ListOffice.Selected(ti) = False
    Next ti
    CmdSelect.Enabled = False
End Sub


Private Sub Form_Open(Cancel As Integer)
    Dim cRoot As clsNode, cNode1 As clsNode, cNode2 As clsNode, cNode3 As clsNode
    Dim cNode4 As clsNode, cNode5 As clsNode, cNode6 As clsNode, cNode7 As clsNode
    Dim strKey As String, strCaption As String
    Dim tRst As DAO.Recordset, cmdSQL As ADODB.Command, connSQL As ADODB.Connection

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    ' initialize the Office Codes dataset
    '
    Set gRstOfficeCode = CurrentDb.OpenRecordset("OFFICE_CODES", dbOpenDynaset)
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_OFFICE_CODE_TMP"
    cmdSQL.Execute tRecCount

    cmdSQL.CommandText = "INSERT INTO ZZ_OFFICE_CODE_TMP ( c_office_id, c_office_trans, c_office_chn, c_dy, c_dyn
asty, c_dynasty_chn ) " + _
                         "SELECT OFFICE_CODES.c_office_id, OFFICE_CODES.c_office_trans, OFFICE_CODES.c_office_chn
, DYNASTIES.c_dy, " + _
                             "DYNASTIES.c_dynasty, DYNASTIES.c_dynasty_chn " + _
                         "FROM OFFICE_CODES INNER JOIN DYNASTIES ON OFFICE_CODES.c_dy = DYNASTIES.c_dy"
    cmdSQL.Execute tRecCount

    ListOffice.Requery
    'For ti = 0 To ListOffice.ListCount
    '    ListOffice.Selected(ti) = False
    'Next ti
    'frmZZZ_OFFICE_CODE.Form.OrderBy = "c_sortorder"
    'frmZZZ_OFFICE_CODE.Form.OrderByOn = True

    If Not IsNull(Me.OpenArgs) Then
        Dim strOffice As String
        strOffice = Me.OpenArgs
        Dim rsOffice As DAO.Recordset
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
    gSelectCount = 0
    gStrDynasty = ""
    gStrDynastyChn = ""
    '
    ' adjust language of labels
    '
    Dim tLabelLanguage(3, 5) As String, tLang As Integer, tRstLabelList As DAO.Recordset, tLabelsOK As Boolean

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    tLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 5 And Not .EOF
             If !c_form = "POT" Then
                 tLabelsOK = True
                 If ti <> !c_label_id Then
                     MsgBox "Uh oh: mismatched label table"
                     tLabelsOK = False
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

    If tLabelsOK Then
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
        Me.CmdCancel.Caption = tLabelLanguage(tLang, 1)
        Me.CmdSelect.Caption = tLabelLanguage(tLang, 2)
        Me.CmdSelectAll.Caption = tLabelLanguage(tLang, 3)
        Me.LblChkAltNames.Caption = tLabelLanguage(tLang, 4)
    End If

    CmdSelect.Enabled = False
    Set cmdSQL = Nothing
    Set tRst = Nothing
    Set connSQL = Nothing
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

Private Sub ListOffice_Click()
    Dim ti As Long, tUnclicked As Boolean
    Dim varItm As Variant

    gSelectCount = 0

    For Each varItm In ListOffice.ItemsSelected
        gSelectCount = gSelectCount + 1
    Next varItm
    'MsgBox ListOffice.Column(1, ti + 1) + ": Select Count = " + Str(gSelectCount)

    If gSelectCount = 0 Then
         Me.TxtOfficeDesc.Value = ""
         Me.TxtOfficeDescChn.Value = ""
         Me.TxtOfficeCode.Value = 0
         Me.CmdSelect.Enabled = False
    Else
         Me.CmdSelect.Enabled = True
    End If

End Sub

Private Sub mcTree_Click(cNode As clsNode)
    Dim tRst As DAO.Recordset, tRstOffice As DAO.Recordset
    Dim tOfficeCodeQuery As DAO.QueryDef, prm As DAO.Parameter
    Dim tRstOfficeCode As DAO.Recordset, tRstDummy As DAO.Recordset, tLen As Integer
    Dim tStrQuery As String, cmdSQL As ADODB.Command, connSQL As ADODB.Connection

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
        cmdSQL.CommandText = "DELETE * FROM ZZ_OFFICE_CODE_TMP"
        cmdSQL.Execute tRecCount

        cmdSQL.CommandText = "INSERT INTO ZZ_OFFICE_CODE_TMP ( c_office_id, c_office_trans, c_office_chn, c_dy, c
_dynasty, c_dynasty_chn ) " + _
                             "SELECT OFFICE_CODES.c_office_id, OFFICE_CODES.c_office_trans, OFFICE_CODES.c_office
_chn, DYNASTIES.c_dy, " + _
                                 "DYNASTIES.c_dynasty, DYNASTIES.c_dynasty_chn " + _
                             "FROM OFFICE_CODES INNER JOIN DYNASTIES ON OFFICE_CODES.c_dy = DYNASTIES.c_dy"
        cmdSQL.Execute tRecCount
        gStrDynasty = ""
        gStrDynastyChn = ""

    Else
           Set tRst = CurrentDb.OpenRecordset("OFFICE_TYPE_TREE", dbOpenDynaset)
           '
           tRst.MoveFirst
           tRst.FindFirst "c_office_type_node_id = " + Chr(34) + cNode.Key + Chr(34)

           'TxtTypeID.Value = Node.Tag
           TxtTypeDesc.Value = tRst!c_office_type_desc
           TxtTypeDescChn.Value = tRst!c_office_type_desc_chn
           tRst.Close
           '
        ' since the keys all refer to a dynasty in the left(cNode.Key,2), we can find the dynasty
        '
        Set tRst = CurrentDb.OpenRecordset("SELECT c_dynasty, c_dynasty_chn FROM DYNASTIES WHERE DYNASTIES.c_dy =
 " + Left(cNode.Key, 2))
        tRst.MoveFirst
        gStrDynasty = tRst!c_dynasty
        gStrDynastyChn = tRst!c_dynasty_chn
        tRst.Close
        Set tRst = Nothing
        '
        CmdSelectAll.Enabled = True
        '
        cmdSQL.CommandText = "Delete * from ZZ_OFFICE_CODE_TMP"
        cmdSQL.Execute tRecDeleted
        '
        tLen = Len(cNode.Key)
        tStrQuery = "INSERT INTO ZZ_OFFICE_CODE_TMP ( c_office_id, c_office_trans, c_office_chn, c_dy, c_dynasty,
 c_dynasty_chn ) " + _
                    "SELECT DISTINCT OFFICE_CODES.c_office_id, OFFICE_CODES.c_office_trans, OFFICE_CODES.c_office
_chn, DYNASTIES.c_dy, " + _
                         "DYNASTIES.c_dynasty, DYNASTIES.c_dynasty_chn " + _
                    "FROM (OFFICE_CODES INNER JOIN DYNASTIES ON OFFICE_CODES.c_dy = DYNASTIES.c_dy) INNER JOIN OF
FICE_CODE_TYPE_REL ON " + _
                         "OFFICE_CODES.c_office_id = OFFICE_CODE_TYPE_REL.c_office_id " + _
                    "WHERE (((Left([c_office_tree_id]," + Str(tLen) + "))='" + cNode.Key + "'))"
        '
        ' now repopulate
        '
        cmdSQL.CommandText = tStrQuery
        cmdSQL.Execute tRecDeleted
        '
    End If

    ListOffice.Requery
    'For ti = 0 To ListOffice.ListCount
    '    ListOffice.Selected(ti) = False
    'Next ti
    gSelectCount = 0
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
End Sub


Private Sub NodeSearch()

    'Dim cNode As clsNode, tStr As String, tRstOfficeCode As DAO.Recordset, tRstOfficeTreeIDs As DAO.Recordset
    'Dim tStrSQL As String, tRstDummy As DAO.Recordset, tStrSearch As String, tStrLen As String
    Dim tStrSearchChn As String, tStrSearchEng As String, tRecNum As Long, tRecNumAlt As Long, tStr As String
    Dim cmdSQL As ADODB.Command, tStrSearchAlt As String, connSQL As ADODB.Connection

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
    CmdFind.SetFocus
    '
    'tStrSearch = ""
    '
    ' clear the scratch table
    '
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    ' Instead of a search, this is now a filter
    '
    tStr = "Quit"
    If IsNull(tStrSearchChn) Then
         If Not IsNull(tStrSearchEng) Then
              If Not (tStrSearchEng = "") Then
                  tStr = " OFFICE_CODES.c_office_trans LIKE '%" + Trim(tStrSearchEng) + "%'"
              End If
         End If
    Else
         If tStrSearchChn = "" Then
              If Not IsNull(tStrSearchEng) Then
                  If Not (tStrSearchEng = "") Then
                      tStr = " OFFICE_CODES.c_office_trans LIKE '%" + Trim(tStrSearchEng) + "%'"
                  End If
              End If
         Else
              tStr = " OFFICE_CODES.c_office_chn LIKE '%" + Trim(tStrSearchChn) + "%'"
         End If
    End If

    tRecNum = 0
    If (tStr = "Quit") Then
         connSQL.Close
         Exit Sub
    Else
         cmdSQL.CommandText = "Delete * from Z_SCRATCH_DUMMY_OC"
         cmdSQL.Execute tRecNum
         '
         cmdSQL.CommandText = "INSERT INTO Z_SCRATCH_DUMMY_OC ( c_office_id, c_office_trans, c_office_chn, c_dy, c
_dynasty, c_dynasty_chn ) " + _
                               "SELECT OFFICE_CODES.c_office_id, OFFICE_CODES.c_office_trans, OFFICE_CODES.c_office
_chn, DYNASTIES.c_dy, " + _
                                  "DYNASTIES.c_dynasty, DYNASTIES.c_dynasty_chn " + _
                               "FROM OFFICE_CODES INNER JOIN DYNASTIES ON OFFICE_CODES.c_dy = DYNASTIES.c_dy " + _
                               "WHERE " + tStr
         cmdSQL.Execute tRecNum
         '
         If Me.ChkAltNames.Value Then
             If tStrSearchChn = "" Then
                  If Not IsNull(tStrSearchEng) Then
                      If Not (tStrSearchEng = "") Then
                          tStr = " OFFICE_CODES.c_office_trans_alt LIKE '%" + Trim(tStrSearchEng) + "%'"
                      End If
                  End If
             Else
                  tStr = " OFFICE_CODES.c_office_chn_alt LIKE '%" + Trim(tStrSearchChn) + "%'"
             End If
             cmdSQL.CommandText = "INSERT INTO Z_SCRATCH_DUMMY_OC ( c_office_id, c_office_trans, c_office_chn, c_d
y, c_dynasty, c_dynasty_chn ) " + _
                                   "SELECT OFFICE_CODES.c_office_id, OFFICE_CODES.c_office_trans, OFFICE_CODES.c_of
fice_chn, DYNASTIES.c_dy, " + _
                                      "DYNASTIES.c_dynasty, DYNASTIES.c_dynasty_chn " + _
                                   "FROM OFFICE_CODES INNER JOIN DYNASTIES ON OFFICE_CODES.c_dy = DYNASTIES.c_dy "
+ _
                                   "WHERE " + tStr
             cmdSQL.Execute tRecNumAlt

            tRecNum = tRecNum + tRecNumAlt
        End If

        If tRecNum = 0 Then
             connSQL.Close
             Exit Sub
        Else
             cmdSQL.CommandText = "Delete * from ZZ_OFFICE_CODE_TMP"
            cmdSQL.Execute tRecDeleted
            '
            cmdSQL.CommandText = "INSERT INTO ZZ_OFFICE_CODE_TMP ( c_office_id, c_office_trans, c_office_chn, c_d
y, c_dynasty, c_dynasty_chn ) " + _
                                 "SELECT DISTINCT Z_SCRATCH_DUMMY_OC.c_office_id, Z_SCRATCH_DUMMY_OC.c_office_tra
ns, Z_SCRATCH_DUMMY_OC.c_office_chn, " + _
                                    "Z_SCRATCH_DUMMY_OC.c_dy, Z_SCRATCH_DUMMY_OC.c_dynasty, Z_SCRATCH_DUMMY_OC.c_
dynasty_chn " + _
                                 "FROM Z_SCRATCH_DUMMY_OC " + _
                                 "ORDER BY Z_SCRATCH_DUMMY_OC.c_dynasty"
            cmdSQL.Execute tRecNum

            ListOffice.Requery
            'For i = 0 To ListOffice.ListCount
            '    ListOffice.Selected(i) = False
            'Next i
            gSelectCount = 0

              'Set cNode = mcTree.Nodes(tstr)
              '
              ' the idea here is that this will be a mix and match, so set the tree to the top
              '
              'cNode.Key = "Root"
         End If
    End If
    '
    ' Put the filter string into the type field
    If IsNull(tStrSearchChn) Then
         If Not IsNull(tStrSearchEng) Then
              If Not (tStrSearchEng = "") Then
                  TxtTypeDescChn.Value = ""
                  TxtTypeDesc.Value = "[Filter] " + tStrSearchEng
              End If
         End If
    Else
         If tStrSearchChn = "" Then
              If Not IsNull(tStrSearchEng) Then
                  If Not (tStrSearchEng = "") Then
                      TxtTypeDescChn.Value = ""
                      TxtTypeDesc.Value = "[Filter] " + tStrSearchEng
                  End If
              End If
         Else
              TxtTypeDesc.Value = ""
              TxtTypeDescChn.Value = "[Filter] " + tStrSearchChn
         End If
    End If

    If gSelectCount = 0 Then
         CmdSelect.Enabled = False
    Else
         CmdSelect.Enabled = True
    End If
End Sub
Form_frmPickOfficeTree_old - 1

Option Compare Database
Public gRstOfficeCode As DAO.Recordset, gNode As Node, gStrSearch As String, gStrSearchAlt As String
Public gUseAlt As Boolean


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
    Dim tRstAssocCodes As DAO.Recordset, tRstAssocTypes As DAO.Recordset, tNode As Node
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
Form_frmPickOfficeTree_old - 2

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
                            If tNode = gNode Then
                                 Set tRstOfficeCode = frmZZZ_OFFICE_CODE.Form.Recordset
                                 tRstOfficeCode.FindFirst "c_office_id = " + Str(gRstOfficeCode!c_office_id)
                                 frmZZZ_OFFICE_CODE.Form.Refresh
                            Else
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
                                 TreeViewTypes.SetFocus
                                 frmZZZ_OFFICE_CODE.SetFocus
                                 '
                                 ' set the tree values
                                 '
                                 Set tRstOfficeTreeIDs = CurrentDb.OpenRecordset("OFFICE_TYPE_TREE", dbOpenDynaset
)
                                 '
                                 tRstOfficeTreeIDs.MoveFirst
                                 tRstOfficeTreeIDs.FindFirst "c_office_type_node_id = " + Chr(34) + tNode.Tag + Ch
r(34)

                                 'TxtTypeID.Value = Node.Tag
                                 TxtTypeDesc.Value = tRstOfficeTreeIDs!c_office_type_desc
                                 TxtTypeDescChn.Value = tRstOfficeTreeIDs!c_office_type_desc_chn
                                 tRstOfficeTreeIDs.Close
                                 Set tRstOfficeTreeIDs = Nothing

Option Compare Database
Public gRstTextCatCode As DAO.Recordset, gNode As clsNode, gStrSearch As String, gStrSearchAlt As String
Public gUseAlt As Boolean, gDisplayLanguage As String, gSelectCount As Integer
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
    Dim cmdSQL As ADODB.Command, tRst As DAO.Recordset, varItm As Variant, ti As Integer

    CmdSelectAll.SetFocus
    CmdSelect.Enabled = False

    gSelectCount = 0

    For Each varItm In ListTextCat.ItemsSelected
        gSelectCount = gSelectCount + 1
    Next varItm

    If gSelectCount = 0 Then
         Me.TxtTextCatDesc.Value = ""
         Me.TxtTextCatDescChn.Value = ""
         Me.TxtTextCatID.Value = 0
         Me.CmdSelect.Enabled = False
    Else
         If gSelectCount = 1 Then
              ' this means that there is only on selected item
              For Each varItm In ListTextCat.ItemsSelected
                  Me.TxtTextCatDesc.Value = ListTextCat.Column(1, varItm)
                  Me.TxtTextCatDescChn.Value = ListTextCat.Column(2, varItm)
                  Me.TxtTextCatID.Value = ListTextCat.Column(0, varItm)
                  'MsgBox ListTextCat.Column(1, varItm)
              Next varItm
         ElseIf gSelectCount = ListTextCat.ListCount - 1 Then
              Me.TxtTextCatDesc.Value = "All"
              Me.TxtTextCatDescChn.Value = "All"
              Me.TxtTextCatID.Value = -1
         Else
              Me.TxtTextCatDesc.Value = "Multi-select"
              Me.TxtTextCatDescChn.Value = "Multi-select"
              Me.TxtTextCatID.Value = -2
              'MsgBox "Multi-select"
         End If
         Me.CmdSelect.Enabled = True

          Set cmdSQL = New ADODB.Command
          cmdSQL.ActiveConnection = CurrentProject.Connection
          cmdSQL.CommandType = adCmdText

          cmdSQL.CommandText = "DELETE * FROM ZZ_TEXT_BIBLCAT_CODES"
          cmdSQL.Execute tRecCount

          '   first copy the records over to the table

          Set tRst = CurrentDb.OpenRecordset("ZZ_TEXT_BIBLCAT_CODES", dbOpenDynaset)
          For Each varItm In ListTextCat.ItemsSelected
              tRst.AddNew
              tRst!c_text_cat_code = ListTextCat.Column(0, varItm)
              tRst!c_text_cat_desc = ListTextCat.Column(1, varItm)
              tRst!c_text_cat_desc_chn = ListTextCat.Column(2, varItm)
              tRst.Update
          Next varItm
          tRst.Close

           ListTextCat.Requery
           'For ti = 0 To ListTextCat.ListCount
           '    ListTextCat.Selected(ti) = False
           'Next ti
           gSelectCount = 0

    End If
    Forms!frmPickTextCat_multi.Visible = False
End Sub

Private Sub CmdSelectAll_Click()
    If CmdSelectAll.Caption = "Select All" Then
        CmdSelectAll.Caption = "De-select All"

           For ti = 0 To ListTextCat.ListCount
               ListTextCat.Selected(ti) = True
           Next ti

           CmdSelect.Enabled = True
           TxtTextCatID.Value = -1
           TxtTextCatDesc.Value = ""
           TxtTextCatDescChn.Value = ""
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
    For ti = 0 To ListTextCat.ListCount
        ListTextCat.Selected(ti) = False
    Next ti

    gSelectCount = 0
    CmdSelect.Enabled = False
End Sub
Private Sub Form_Open(Cancel As Integer)
    Dim cRoot As clsNode, strKey As String, strCaption As String
    Dim cNode1 As clsNode, cNode2 As clsNode, cNode3 As clsNode
    Dim tRst As DAO.Recordset, cmdSQL As ADODB.Command
    '
    ' initialize the text fields
    '
    Me.TxtTypeDesc.Value = ""
    Me.TxtTypeDescChn.Value = ""
    Me.TxtTypeID.Value = "000"
    gSelectCount = 0
    '
    ' initialize the TextCat Codes dataset
    '
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    Set gRstTextCatCode = CurrentDb.OpenRecordset("TEXT_BIBLCAT_CODES", dbOpenDynaset)

    cmdSQL.CommandText = "DELETE * FROM ZZ_TEXT_BIBLCAT_CODES_TMP"
    cmdSQL.Execute tRecCount

    cmdSQL.CommandText = "INSERT INTO ZZ_TEXT_BIBLCAT_CODES_TMP ( c_text_cat_code, c_text_cat_desc, c_text_cat_de
sc_chn ) " + _
                         "SELECT TEXT_BIBLCAT_CODES.c_text_cat_code, TEXT_BIBLCAT_CODES.c_text_cat_desc, TEXT_BIB
LCAT_CODES.c_text_cat_desc_chn " + _
                         "FROM TEXT_BIBLCAT_CODES"
    cmdSQL.Execute tRecCount

    ListTextCat.Requery
    'For ti = 0 To ListTextCat.ListCount
    '    ListTextCat.Selected(ti) = False
    'Next ti
    '
    'frmTEXT_BIBLCAT_CODES.Form.OrderBy = "c_sortorder"
    'frmTEXT_BIBLCAT_CODES.Form.OrderByOn = True

    If Not IsNull(Me.OpenArgs) Then
        Dim strTextCat As String
           strTextCat = Me.OpenArgs
       End If
       '
       ' build treeview
       '
       Set tRst = CurrentDb.OpenRecordset("TEXT_BIBLCAT_TYPES", dbOpenDynaset)

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
                 strCaption = "Categories of Text"
            End If

           Set cRoot = .AddRoot("Root", strCaption, "FolderClosed", "FolderOpen")
           ' Add a Root node with main and expanded icons and make it bold
           cRoot.Bold = True
           ' Loop through the records
           Do While Not tRst.EOF
                ' Add node
                strKey = tRst!c_text_cat_type_id
                If gDisplayLanguage = "E" Then
                     strCaption = tRst!c_text_cat_type_desc
                Else
                     strCaption = tRst!c_text_cat_type_desc_chn
                End If
                Select Case Len(strKey)
                     Case 2
                         Set cNode1 = cRoot.AddChild(sKey:=strKey, vCaption:=strCaption)
                         cNode1.Expanded = False
                     Case 5
                         Set cNode2 = cNode1.AddChild(sKey:=strKey, vCaption:=strCaption)
                         cNode2.Expanded = False
                     Case 7
                         Set cNode3 = cNode2.AddChild(sKey:=strKey, vCaption:=strCaption)
                         cNode3.Expanded = False
                End Select
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

       Call NodeSearch

Exit_CmdFind_Click:
    Exit Sub

Err_CmdFind_Click:
    MsgBox Err.Description
    Resume Exit_CmdFind_Click

End Sub

Private Sub ListTextCat_Click()
    Dim ti As Long, tUnclicked As Boolean
    Dim varItm As Variant

    gSelectCount = 0

    For Each varItm In ListTextCat.ItemsSelected
        gSelectCount = gSelectCount + 1
    Next varItm

    If gSelectCount = 0 Then
         Me.CmdSelect.Enabled = False
    Else
         Me.CmdSelect.Enabled = True
    End If
    'MsgBox ListTextCat.Column(1, ti + 1) + ": Select Count = " + Str(gSelectCount)

    If gSelectCount = 0 Then
         Me.TxtTextCatDesc.Value = ""
         Me.TxtTextCatDescChn.Value = ""
         Me.TxtTextCatID.Value = 0
         Me.CmdSelect.Enabled = False
    Else
         If gSelectCount = 1 Then
              If tUnclicked Then
                   ' this means that there is only on selected item, but it is NOT this item
                   ' we therefore need to locate the selected item and put its values into the text boxes
                   ' I may not even use these boxes anymore, but just in case...
                   For Each varItm In ListTextCat.ItemsSelected
                       Me.TxtTextCatDesc.Value = ListTextCat.Column(1, varItm)
                       Me.TxtTextCatDescChn.Value = ListTextCat.Column(2, varItm)
                       Me.TxtTextCatID.Value = ListTextCat.Column(0, varItm)
                       'MsgBox ListTextCat.Column(1, varItm)
                   Next varItm
              Else
                   Me.TxtTextCatDesc.Value = ListTextCat.Column(1, ti + 1)
                   Me.TxtTextCatDescChn.Value = ListTextCat.Column(2, ti + 1)
                   Me.TxtTextCatID.Value = ListTextCat.Column(0, ti + 1)
                   'MsgBox ListTextCat.Column(1, ti + 1)
              End If
         Else
              Me.TxtTextCatDesc.Value = "Multi-select"
              Me.TxtTextCatDescChn.Value = "Multi-select"
              Me.TxtTextCatID.Value = -2
              'MsgBox "Multi-select"
         End If
         Me.CmdSelect.Enabled = True
    End If


End Sub

Private Sub mcTree_Click(cNode As clsNode)
    Dim tRst As DAO.Recordset, tRstTextCat As DAO.Recordset, tStrSQL As String
    Dim tTextCatCodeQuery As DAO.QueryDef, prm As DAO.Parameter
    Dim tRstTextCatCode As DAO.Recordset, tRstDummy As DAO.Recordset, cmdSQL As ADODB.Command

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
        '

    TxtTextCatID.Value = -1
    TxtTextCatDesc.Value = ""
    TxtTextCatDescChn.Value = ""
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
        ' reset the text category code choices
        '
        Set gRstTextCatCode = CurrentDb.OpenRecordset("TEXT_BIBLCAT_CODES", dbOpenDynaset)
        '
        cmdSQL.CommandText = "Delete * from ZZ_TEXT_BIBLCAT_CODES_TMP"
        cmdSQL.Execute tRecDeleted
        '
        cmdSQL.CommandText = "INSERT INTO ZZ_TEXT_BIBLCAT_CODES_TMP ( c_text_cat_code, c_text_cat_desc, c_text_ca
t_desc_chn ) " + _
                             "SELECT TEXT_BIBLCAT_CODES.c_text_cat_code, TEXT_BIBLCAT_CODES.c_text_cat_desc, TEXT
_BIBLCAT_CODES.c_text_cat_desc_chn " + _
                             "FROM TEXT_BIBLCAT_CODES"
        cmdSQL.Execute tRecCount

    Else
           Set tRst = CurrentDb.OpenRecordset("TEXT_BIBLCAT_TYPES", dbOpenDynaset)
           '
           tRst.MoveFirst
           tRst.FindFirst "c_text_cat_type_id = " + Chr(34) + cNode.Key + Chr(34)
           TxtTypeID.Value = cNode.Key
           TxtTypeDesc.Value = tRst!c_text_cat_type_desc
           TxtTypeDescChn.Value = tRst!c_text_cat_type_desc_chn
           tRst.Close
           Set tRst = Nothing
           '
           CmdSelectAll.Enabled = True
           '
           ' we need to distinguish between type / subtype
           '
           tStrSQL = "INSERT INTO ZZ_TEXT_BIBLCAT_CODES_TMP ( c_text_cat_code, c_text_cat_desc, c_text_cat_desc_chn
) " + _
            "SELECT TEXT_BIBLCAT_CODES.c_text_cat_code, TEXT_BIBLCAT_CODES.c_text_cat_desc, TEXT_BIBLCAT_CODES.c_
text_cat_desc_chn " + _
            "FROM TEXT_BIBLCAT_CODES INNER JOIN TEXT_BIBLCAT_CODE_TYPE_REL ON " + _
            "(TEXT_BIBLCAT_CODES.c_text_cat_code = TEXT_BIBLCAT_CODE_TYPE_REL.c_text_cat_code) "


           Select Case Len(cNode.Key)
               Case 2
                   tStrSQL = tStrSQL + "WHERE (((Left(([TEXT_BIBLCAT_CODE_TYPE_REL].[c_text_cat_type_id]),2))='" + _
                       TxtTypeID.Value + "'))"
               Case 5
                   tStrSQL = tStrSQL + "WHERE (((Left(([TEXT_BIBLCAT_CODE_TYPE_REL].[c_text_cat_type_id]),5))='" + _
                       TxtTypeID.Value + "'))"
               Case 7
                   tStrSQL = tStrSQL + "WHERE (((Left(([TEXT_BIBLCAT_CODE_TYPE_REL].[c_text_cat_type_id]),7))='" + _
                       TxtTypeID.Value + "'))"
           End Select

        cmdSQL.CommandText = "Delete * from ZZ_TEXT_BIBLCAT_CODES_TMP"
        cmdSQL.Execute tRecDeleted
        '
        cmdSQL.CommandText = tStrSQL
        cmdSQL.Execute tRecDeleted
        '
    End If

    ListTextCat.Requery
    For ti = 0 To ListTextCat.ListCount
        ListTextCat.Selected(ti) = False
    Next ti
    gSelectCount = 0

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
    Dim tRstTextCatCodes As DAO.Recordset, tRstTextCatTypes As DAO.Recordset, cNode As clsNode
    Dim tStrSQL As String, tRstDummy As DAO.Recordset, cmdSQL As ADODB.Command

    TxtTextCatID.Value = -1
    TxtTextCatDesc.Value = ""
    TxtTextCatDescChn.Value = ""

    If IsNull(gRstTextCatCode) Then
         MsgBox "Error in search: table closed."
    Else
         If gStrSearch = "" Then
              MsgBox "Error in search: string empty."
         Else

            'MsgBox "Looking for entry"

            If gRstTextCatCode.EOF Then
                 CmdFindNext.Enabled = False
            Else
                 ' gRstTextCatCode.MoveNext

                If gUseAlt Then
                     gRstTextCatCode.FindNext gStrSearchAlt
                Else
                     gRstTextCatCode.FindNext gStrSearch

                    If gRstTextCatCode.NoMatch Then
                        gRstTextCatCode.FindFirst gStrSearchAlt
                        gUseAlt = True
                    End If
                End If

                If gRstTextCatCode.NoMatch Then
                     If gUseAlt Then
                         gUseAlt = False
                     End If
                     CmdFindNext.Enabled = False
                Else
                     '
                     ' next find the text type
                     '
                     'MsgBox "Looking for text type"

                    Set tRstTextCatTypes = CurrentDb.OpenRecordset("TEXT_BIBLCAT_CODE_TYPE_REL", dbOpenDynaset)

                    tRstTextCatTypes.FindNext "c_text_cat_code = " + Str(gRstTextCatCode!c_text_cat_code)

                    If Not tRstTextCatTypes.NoMatch Then
                        '
                        ' set the values
                        '
                        TxtTextCatID.Value = gRstTextCatCode!c_text_cat_code
                        If Not IsNull(gRstTextCatCode!c_text_cat_desc) Then
                            TxtTextCatDesc.Value = gRstTextCatCode!c_text_cat_desc
                        End If
                        If Not IsNull(gRstTextCatCode!c_text_cat_desc_chn) Then
                            TxtTextCatDescChn.Value = gRstTextCatCode!c_text_cat_desc_chn
                        End If
                        '
                        ' define the string
                        '
                        tStr = tRstTextCatTypes!c_text_cat_type_id
                        '
                        ' search the tree

                        Set cNode = mcTree.Nodes(tStr)
                        '
                        'MsgBox "found node"
                        '
                        If Not IsNull(cNode) Then
                            If cNode.Key = gNode.Key Then
                                gSelectCount = 0
                                For i = 0 To ListTextCat.ListCount - 1
                                       If gRstTextCatCode!c_text_cat_code = ListTextCat.Column(0, i) Then
                                           ListTextCat.ListIndex = i
                                           ListTextCat.Selected(i) = True
                                           gSelectCount = gSelectCount + 1
                                       End If
                                   Next i
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
                                   tStrSQL = "INSERT INTO ZZ_TEXT_BIBLCAT_CODES_TMP ( c_text_cat_code, c_text_cat_de
sc, c_text_cat_desc_chn ) " + _
                                    "SELECT TEXT_BIBLCAT_CODES.c_text_cat_code, TEXT_BIBLCAT_CODES.c_text_cat_des
c, TEXT_BIBLCAT_CODES.c_text_cat_desc_chn " + _
                                    "FROM TEXT_BIBLCAT_CODES INNER JOIN TEXT_BIBLCAT_CODE_TYPE_REL ON " + _
                                    "(TEXT_BIBLCAT_CODES.c_text_cat_code = TEXT_BIBLCAT_CODE_TYPE_REL.c_text_cat_
code) " + _
                                    "WHERE (((TEXT_BIBLCAT_CODE_TYPE_REL.c_text_cat_type_id)='" + tStr + "'))"
                                '
                                Set cmdSQL = New ADODB.Command
                                cmdSQL.ActiveConnection = CurrentProject.Connection
                                cmdSQL.CommandType = adCmdText
                                '
                                cmdSQL.CommandText = "Delete * from ZZ_TEXT_BIBLCAT_CODES_TMP"
                                cmdSQL.Execute tRecDeleted
                                '
                                cmdSQL.CommandText = tStrSQL
                                cmdSQL.Execute tRecDeleted
                                '
                                ListTextCat.Requery
                                For ti = 0 To ListTextCat.ListCount
                                    ListTextCat.Selected(ti) = False
                                Next ti
                                gSelectCount = 0
                                '
                                ' set the type values
                                '
                                Set tRstTextCatTypes = CurrentDb.OpenRecordset("TEXT_BIBLCAT_TYPES", dbOpenDynase
t)
                                '
                                tRstTextCatTypes.MoveFirst
                                tRstTextCatTypes.FindFirst "c_text_cat_type_id = " + Chr(34) + cNode.Key + Chr(34
)
                                TxtTypeID.Value = cNode.Key
                                TxtTypeDesc.Value = tRstTextCatTypes!c_text_cat_type_desc
                                TxtTypeDescChn.Value = tRstTextCatTypes!c_text_cat_type_desc_chn
                                tRstTextCatTypes.Close
                                Set tRstTextCatTypes = Nothing
                            End If
                        End If
                    End If
                End If
            End If
        End If
    End If
End Sub


Private Sub NodeSearch()

    Dim cNode As clsNode, tStr As String, tRstTextCatCodes As DAO.Recordset, tRstTextCatTypes As DAO.Recordset
    Dim tRstDummy As DAO.Recordset, tStrSQL As String, tStrSearchChn As String, tStrSearchEng As String
    Dim tStrLen As String, cmdSQL As ADODB.Command

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    TxtTextCatID.Value = -1
    TxtTextCatDesc.Value = ""
    TxtTextCatDescChn.Value = ""

    '   all specific TextCatiation codes will have a type of the form 0101
    '   hence the ValuePath for the relevant node will be "K000/K01/K0101"
    '   The command to locate the relevant node is:
    '   tNode = TreeViewType.FindNode(tStrValuePath)
    '   TreeViewType.SelectedNode = tNode

    ' search for the search string in TEXT_BIBLCAT_CODES
    TxtSearchChn.SetFocus
    tStrSearchChn = Me.TxtSearchChn.Text
    TxtSearch.SetFocus
    tStrSearchEng = Me.TxtSearch.Text
    CmdFind.SetFocus

    gStrSearch = ""
    gUseAlt = False

    If tStrSearchChn <> "" Then
        tStrLen = Str(LenB(tStrSearchChn))
       gStrSearch = "LeftB(c_text_cat_desc_chn," + tStrLen + ") = '" + tStrSearchChn + "'"
       gStrSearchAlt = "InStrB(1,c_text_cat_desc_chn,'" + tStrSearchChn + "') > 0"
    ElseIf tStrSearchEng <> "" Then
        tStrLen = Str(Len(tStrSearchEng))
       gStrSearch = "Left(c_text_cat_desc," + tStrLen + ") = '" + tStrSearchEng + "'"
       gStrSearchAlt = "InStr(1,c_text_cat_desc,'" + tStrSearchEng + "') > 0"
    End If

    If Not (gStrSearch = "") Then

         'MsgBox "Looking for TextCat"

         Set gRstTextCatCode = CurrentDb.OpenRecordset("TEXT_BIBLCAT_CODES", dbOpenDynaset)

         gRstTextCatCode.FindFirst gStrSearch

         If gRstTextCatCode.NoMatch Then
             gRstTextCatCode.FindFirst gStrSearchAlt
             gUseAlt = True
         End If

         If gRstTextCatCode.NoMatch Then
              gUseAlt = False
              CmdFindNext.Enabled = False
         Else
              '
              CmdFindNext.Enabled = True
              '
              ' next find the TextCat_type
              '

             'MsgBox "Looking for TextCat type"

             Set tRstTextCatTypes = CurrentDb.OpenRecordset("TEXT_BIBLCAT_CODE_TYPE_REL", dbOpenDynaset)

             tRstTextCatTypes.FindNext "c_text_cat_code = " + Str(gRstTextCatCode!c_text_cat_code)

             If Not tRstTextCatTypes.NoMatch Then
                 '
                 ' set the values
                 '
                 TxtTextCatID.Value = gRstTextCatCode!c_text_cat_code
                 If Not IsNull(gRstTextCatCode!c_text_cat_desc) Then
                     TxtTextCatDesc.Value = gRstTextCatCode!c_text_cat_desc
                 End If
                 If Not IsNull(gRstTextCatCode!c_text_cat_desc_chn) Then
                     TxtTextCatDescChn.Value = gRstTextCatCode!c_text_cat_desc_chn
                 End If
                 '
                 ' define the string
                 '
                 tStr = tRstTextCatTypes!c_text_cat_type_id
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
                      cmdSQL.CommandText = "Delete * from ZZ_TEXT_BIBLCAT_CODES_TMP"
                      cmdSQL.Execute tRecDeleted
                      '
                      tStrSQL = "INSERT INTO ZZ_TEXT_BIBLCAT_CODES_TMP ( c_text_cat_code, c_text_cat_desc, c_text_c
at_desc_chn ) " + _
                        "SELECT TEXT_BIBLCAT_CODES.c_text_cat_code, TEXT_BIBLCAT_CODES.c_text_cat_desc, TEXT_BIBL
CAT_CODES.c_text_cat_desc_chn " + _
                        "FROM TEXT_BIBLCAT_CODES INNER JOIN TEXT_BIBLCAT_CODE_TYPE_REL ON " + _
                        "(TEXT_BIBLCAT_CODES.c_text_cat_code = TEXT_BIBLCAT_CODE_TYPE_REL.c_text_cat_code) " + _
                        "WHERE (((TEXT_BIBLCAT_CODE_TYPE_REL.c_text_cat_type_id)='" + tStr + "'))"

                    cmdSQL.CommandText = tStrSQL
                    cmdSQL.Execute tRecDeleted
                    '
                    ListTextCat.Requery
                    For i = 0 To ListTextCat.ListCount
                        ListTextCat.Selected(i) = False
                    Next i
                    gSelectCount = 0
                    '
                    For i = 0 To ListTextCat.ListCount - 1
                        If gRstTextCatCode!c_text_cat_code = ListTextCat.Column(0, i) Then
                            ListTextCat.ListIndex = i
                            ListTextCat.Selected(i) = True
                            gSelectCount = gSelectCount + 1
                        End If
                    Next i
                    '
                    ' set the type values
                    '
                    Set tRstTextCatTypes = CurrentDb.OpenRecordset("TEXT_BIBLCAT_TYPES", dbOpenDynaset)
                    '
                    tRstTextCatTypes.MoveFirst
                    tRstTextCatTypes.FindFirst "c_text_cat_type_id = " + Chr(34) + cNode.Key + Chr(34)
                    TxtTypeID.Value = cNode.Key
                    TxtTypeDesc.Value = tRstTextCatTypes!c_text_cat_type_desc
                    TxtTypeDescChn.Value = tRstTextCatTypes!c_text_cat_type_desc_chn
                    tRstTextCatTypes.Close
                    Set tRstTextCatTypes = Nothing
                End If
            End If
        End If
    End If

End Sub

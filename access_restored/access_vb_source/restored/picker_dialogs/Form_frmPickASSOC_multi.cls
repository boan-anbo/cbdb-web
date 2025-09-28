Option Compare Database
Public gRstAssocCode As DAO.Recordset, gNode As clsNode, gStrSearch As String, gStrSearchAlt As String
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
    Dim cmdSQL As ADODB.Command, tRecCount As Long, tRst As DAO.Recordset, varItm As Variant, ti As Integer

    '
    CmdSelectAll.SetFocus
    CmdSelect.Enabled = False
    '
    ' if SelectAll is the selection status, then all records in ZZ_ASSOC_CODE_TMP are used
    ' otherwise, we clear the table and copy the selected rows
    '
    ' get the count
    '
    gSelectCount = 0
    For Each varItm In ListAssoc.ItemsSelected
         gSelectCount = gSelectCount + 1
    Next varItm
    '
    'MsgBox "gSelectCount = " + Str(gSelectCount) + " ListCount = " + Str(ListAssoc.ListCount)
    '
    ' put the description in the boxes
    '
    If gSelectCount = 0 Then
         Me.TxtAssocDesc.Value = ""
         Me.TxtAssocDescChn.Value = ""
         Me.TxtAssocID.Value = 0
         Me.CmdSelect.Enabled = False
    Else
         Set cmdSQL = New ADODB.Command
         cmdSQL.ActiveConnection = CurrentProject.Connection
         cmdSQL.CommandType = adCmdText

          If gSelectCount = 1 Then
               '
               ' there is just one item in the collection
               '
               For Each varItm In ListAssoc.ItemsSelected
                   Me.TxtAssocDesc.Value = ListAssoc.Column(1, varItm)
                   Me.TxtAssocDescChn.Value = ListAssoc.Column(2, varItm)
                   Me.TxtAssocID.Value = ListAssoc.Column(0, varItm)
               Next varItm
          ElseIf gSelectCount = ListAssoc.ListCount - 1 Then
               '
               ' when a category is selected in the tree, all codes are put into ZZ_ASSOC_CODE_TMP
               ' when "Select All", all the records are selected and therefore are copied over
               '
               Me.TxtAssocDesc.Value = "All"
               Me.TxtAssocDescChn.Value = "All"
               Me.TxtAssocID.Value = -1
          Else
               Me.TxtAssocDesc.Value = "Multi-select"
               Me.TxtAssocDescChn.Value = "Multi-select"
               Me.TxtAssocID.Value = -2
          End If
          '
          ' now process the records
          '
           cmdSQL.CommandText = "DELETE * FROM ZZ_ASSOC_CODE"
           cmdSQL.Execute tRecCount

           '   copy the records over to the table

           Set tRst = CurrentDb.OpenRecordset("ZZ_ASSOC_CODE", dbOpenDynaset)
           For Each varItm In ListAssoc.ItemsSelected
               tRst.AddNew
               tRst!c_assoc_code = ListAssoc.Column(0, varItm)
               tRst!c_assoc_desc = ListAssoc.Column(1, varItm)
               tRst!c_assoc_desc_chn = ListAssoc.Column(2, varItm)
               tRst.Update
           Next varItm
           tRst.Close


           ListAssoc.Requery
           'For ti = 0 To ListAssoc.ListCount
           '    ListAssoc.Selected(ti) = False
           'Next ti
           gSelectCount = 0

    End If
    Forms!frmPickAssoc_multi.Visible = False
End Sub

Private Sub CmdSelectAll_Click()
    If CmdSelectAll.Caption = "Select All" Then
        CmdSelectAll.Caption = "De-select All"

           For ti = 0 To ListAssoc.ListCount
               ListAssoc.Selected(ti) = True
           Next ti

           CmdSelect.Enabled = True
           TxtAssocID.Value = -1
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
    For ti = 0 To ListAssoc.ListCount
        ListAssoc.Selected(ti) = False
    Next ti

    gSelectCount = 0
    CmdSelect.Enabled = False
End Sub
Private Sub Form_Open(Cancel As Integer)
    Dim cRoot As clsNode, strKey As String, strCaption As String
    Dim cNode1 As clsNode, cNode2 As clsNode
    Dim tRst As DAO.Recordset, cmdSQL As ADODB.Command, tRecCount As Long
    '
    ' initialize the text fields
    '
    Me.TxtTypeDesc.Value = ""
    Me.TxtTypeDescChn.Value = ""
    Me.TxtTypeID.Value = "000"
    gSelectCount = 0
    '
    ' initialize the listbox
    '
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    cmdSQL.CommandText = "DELETE * FROM ZZ_ASSOC_CODE_TMP"
    cmdSQL.Execute tRecCount

    cmdSQL.CommandText = "INSERT INTO ZZ_ASSOC_CODE_TMP ( c_assoc_code, c_assoc_desc, c_assoc_desc_chn ) " + _
                         "SELECT ASSOC_CODES.c_assoc_code, ASSOC_CODES.c_assoc_desc, ASSOC_CODES.c_assoc_desc_chn
 " + _
                         "FROM ASSOC_CODES"
    cmdSQL.Execute tRecCount
       ListAssoc.Requery

       If Not IsNull(Me.OpenArgs) Then
           Dim strAssoc As String
           strAssoc = Me.OpenArgs
       End If
       '
       ' build treeview
       '
       Set tRst = CurrentDb.OpenRecordset("ASSOC_TYPES", dbOpenDynaset)

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
                 strCaption = "Categories of Social Relations"
            End If

           Set cRoot = .AddRoot("Root", strCaption, "FolderClosed", "FolderOpen")
           ' Add a Root node with main and expanded icons and make it bold
           cRoot.Bold = True
           ' Loop through the records
           Do While Not tRst.EOF
                ' Add node
                strKey = tRst!c_assoc_type_code
                If gDisplayLanguage = "E" Then
                     strCaption = tRst!c_assoc_type_desc
                Else
                     strCaption = tRst!c_assoc_type_desc_chn
                End If
                If Len(tRst!c_assoc_type_code) = 2 Then
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
          'Dim rsAssocCodes As DAO.Recordset
          'Set rsAssocCodes = frmASSOC_CODES.Form.Recordset
          'Dim StrSearchStr As String
          'StrSearchStr = "c_assoc_desc_chn = " + Chr(34) + StrSearch + Chr(34)
          'rsAssocCodes.FindFirst StrSearchStr
       'End If

    Call NodeSearch

Exit_CmdFind_Click:
    Exit Sub

Err_CmdFind_Click:
    MsgBox Err.Description
    Resume Exit_CmdFind_Click

End Sub

Private Sub ListAssoc_Click()
    Dim ti As Long, tUnclicked As Boolean
    Dim varItm As Variant

    gSelectCount = 0

    For Each varItm In ListAssoc.ItemsSelected
        gSelectCount = gSelectCount + 1
    Next varItm

    If gSelectCount = 0 Then
         'Me.TxtAssocDesc.Value = ""
         'Me.TxtAssocDescChn.Value = ""
         'Me.TxtAssocID.Value = 0
         Me.CmdSelect.Enabled = False
    Else
         'If gSelectCount = 1 Then
         '     If tUnclicked Then
         '          ' this means that there is only on selected item, but it is NOT this item
         '          ' we therefore need to locate the selected item and put its values into the text boxes
         '          ' I may not even use these boxes anymore, but just in case...
         '          For Each varItm In ListAssoc.ItemsSelected
         '              Me.TxtAssocDesc.Value = ListAssoc.Column(1, varItm)
         '              Me.TxtAssocDescChn.Value = ListAssoc.Column(2, varItm)
         '              Me.TxtAssocID.Value = ListAssoc.Column(0, varItm)
         '              'MsgBox ListAssoc.Column(1, varItm)
         '          Next varItm
         '     Else
         '          Me.TxtAssocDesc.Value = ListAssoc.Column(1, ti + 1)
         '          Me.TxtAssocDescChn.Value = ListAssoc.Column(2, ti + 1)
         '          Me.TxtAssocID.Value = ListAssoc.Column(0, ti + 1)
         '          'MsgBox ListAssoc.Column(1, ti + 1)
         '     End If
         'Else
         '     Me.TxtAssocDesc.Value = "Multi-select"
         '     Me.TxtAssocDescChn.Value = "Multi-select"
         '     Me.TxtAssocID.Value = -2
         '     'MsgBox "Multi-select"
         'End If
         Me.CmdSelect.Enabled = True
    End If
End Sub

Private Sub mcTree_Click(cNode As clsNode)
    Dim tRst As DAO.Recordset, tRstAssoc As DAO.Recordset, tStrSQL As String, ti As Integer
    Dim tAssocCodeQuery As DAO.QueryDef, prm As DAO.Parameter
    Dim tRstAssocCode As DAO.Recordset, tRstDummy As DAO.Recordset, cmdSQL As ADODB.Command

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    TxtAssocID.Value = -1
    TxtAssocDesc.Value = ""
    TxtAssocDescChn.Value = ""
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
             cmdSQL.CommandText = "DELETE * FROM ZZ_ASSOC_CODE_TMP"
             cmdSQL.Execute tRecCount

             cmdSQL.CommandText = "INSERT INTO ZZ_ASSOC_CODE_TMP ( c_assoc_code, c_assoc_desc, c_assoc_desc_chn ) " +
_
                                  "SELECT ASSOC_CODES.c_assoc_code, ASSOC_CODES.c_assoc_desc, ASSOC_CODES.c_assoc_desc
_chn " + _
                                  "FROM ASSOC_CODES"
             cmdSQL.Execute tRecCount

             ListAssoc.Requery
             For ti = 0 To ListAssoc.ListCount
                 ListAssoc.Selected(ti) = False
             Next ti
             gSelectCount = 0
      Else
             Set tRst = CurrentDb.OpenRecordset("ASSOC_TYPES", dbOpenDynaset)
             '
             tRst.MoveFirst
             tRst.FindFirst "c_assoc_type_code = " + Chr(34) + cNode.Key + Chr(34)
             TxtTypeID.Value = cNode.Key
             TxtTypeDesc.Value = tRst!c_assoc_type_desc
             TxtTypeDescChn.Value = tRst!c_assoc_type_desc_chn
             tRst.Close
             Set tRst = Nothing
             '
             CmdSelectAll.Enabled = True
             '
             ' we need to distinguish between type / subtype
             '
             tStrSQL = "INSERT INTO ZZ_ASSOC_CODE_TMP ( c_assoc_code, c_assoc_desc, c_assoc_desc_chn, c_sortorder ) "
+ _
                 "SELECT ASSOC_CODE_TYPE_REL.c_assoc_code AS c_assoc_code, ASSOC_CODES.c_assoc_desc, " + _
                 "ASSOC_CODES.c_assoc_desc_chn, ASSOC_CODES.c_sortorder " + _
                 "FROM ASSOC_CODES INNER JOIN ASSOC_CODE_TYPE_REL ON " + _
                 "ASSOC_CODES.c_assoc_code = ASSOC_CODE_TYPE_REL.c_assoc_code "

             If Len(cNode.Key) = 2 Then
                  tStrSQL = tStrSQL + "WHERE (((Left(([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]),2))='" + _
                      TxtTypeID.Value + "'))"
             Else
                  tStrSQL = tStrSQL + "WHERE (((ASSOC_CODE_TYPE_REL.c_assoc_type_code)='" + _
                      TxtTypeID.Value + "'))"
             End If

          cmdSQL.CommandText = "Delete * from ZZ_ASSOC_CODE_TMP"
          cmdSQL.Execute tRecDeleted
          '
          'MsgBox "tStrSQL = " + tStrSQL
          cmdSQL.CommandText = tStrSQL
          cmdSQL.Execute tRecDeleted
          '
          ListAssoc.Requery
          For ti = 0 To ListAssoc.ListCount
              ListAssoc.Selected(ti) = False
          Next ti
          gSelectCount = 0
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
    Dim tRstAssocCodes As DAO.Recordset, tRstAssocTypes As DAO.Recordset, cNode As clsNode
    Dim tStrSQL As String, tRstDummy As DAO.Recordset, cmdSQL As ADODB.Command, ti As Integer

    TxtAssocID.Value = -1
    TxtAssocDesc.Value = ""
    TxtAssocDescChn.Value = ""

    If IsNull(gRstAssocCode) Then
         MsgBox "Error in search: table closed."
    Else
         If gStrSearch = "" Then
              MsgBox "Error in search: string empty."
         Else

            'MsgBox "Looking for entry"

            If gRstAssocCode.EOF Then
                 CmdFindNext.Enabled = False
            Else
                 ' gRstAssocCode.MoveNext

                If gUseAlt Then
                     gRstAssocCode.FindNext gStrSearchAlt
                Else
                     gRstAssocCode.FindNext gStrSearch

                    If gRstAssocCode.NoMatch Then
                        gRstAssocCode.FindFirst gStrSearchAlt
                        gUseAlt = True
                    End If
                End If

                If gRstAssocCode.NoMatch Then
                     If gUseAlt Then
                         gUseAlt = False
                     End If
                     CmdFindNext.Enabled = False
                Else
                     '
                     ' next find the entry_type
                     '
                     'MsgBox "Looking for entry type"

                    Set tRstAssocTypes = CurrentDb.OpenRecordset("ASSOC_CODE_TYPE_REL", dbOpenDynaset)

                    tRstAssocTypes.FindNext "c_assoc_code = " + Str(gRstAssocCode!c_assoc_code)

                    If Not tRstAssocTypes.NoMatch Then
                        '
                        ' set the values
                        '
                        TxtAssocID.Value = gRstAssocCode!c_assoc_code
                        If Not IsNull(gRstAssocCode!c_assoc_desc) Then
                            TxtAssocDesc.Value = gRstAssocCode!c_assoc_desc
                        End If
                        If Not IsNull(gRstAssocCode!c_assoc_desc_chn) Then
                            TxtAssocDescChn.Value = gRstAssocCode!c_assoc_desc_chn
                        End If
                        '
                        ' define the string
                        '
                        tStr = tRstAssocTypes!c_assoc_type_code
                        '
                        ' search the tree

                        Set cNode = mcTree.Nodes(tStr)
                        '
                        'MsgBox "found node"
                        '
                        If Not IsNull(cNode) Then
                            If cNode.Key = gNode.Key Then
                                'Set tRstAssocCodes = frmZZZ_ASSOC_CODE.Form.Recordset
                                'tRstAssocCodes.FindNext "c_assoc_code = " + Str(gRstAssocCode!c_assoc_code)
                                     'frmZZZ_ASSOC_CODE.Form.Refresh

                                     gSelectCount = 0
                                     For i = 0 To ListAssoc.ListCount - 1
                                         If gRstAssocCode!c_assoc_code = ListAssoc.Column(0, i) Then
                                             ListAssoc.ListIndex = i
                                             ListAssoc.Selected(i) = True
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
                                     tStrSQL = "INSERT INTO ZZ_ASSOC_CODE_TMP ( c_assoc_code, c_assoc_desc, c_assoc_de
sc_chn, c_sortorder ) " + _
                                         "SELECT ASSOC_CODE_TYPE_REL.c_assoc_code AS c_assoc_code, ASSOC_CODES.c_assoc
_desc, " + _
                                         "ASSOC_CODES.c_assoc_desc_chn, ASSOC_CODES.c_sortorder " + _
                                         "FROM ASSOC_CODES INNER JOIN ASSOC_CODE_TYPE_REL ON " + _
                                         "ASSOC_CODES.c_assoc_code = ASSOC_CODE_TYPE_REL.c_assoc_code " + _
                                         "WHERE (((ASSOC_CODE_TYPE_REL.c_assoc_type_code)='" + tStr + "'))"

                                     '
                                     Set cmdSQL = New ADODB.Command
                                     cmdSQL.ActiveConnection = CurrentProject.Connection
                                     cmdSQL.CommandType = adCmdText
                                     '
                                     cmdSQL.CommandText = "Delete * from ZZ_ASSOC_CODE_TMP"
                                     cmdSQL.Execute tRecDeleted
                                     '
                                     cmdSQL.CommandText = tStrSQL
                                     cmdSQL.Execute tRecDeleted
                                     '
                                     ListAssoc.Requery
                                     For ti = 0 To ListAssoc.ListCount
                                         ListAssoc.Selected(ti) = False
                                     Next ti
                                     gSelectCount = 0

                                'Set tRstAssocCodes = CurrentDb.OpenRecordset("ZZ_ASSOC_CODE_TMP", dbOpenDynaset)
                                '
                                For i = 0 To ListAssoc.ListCount - 1
                                    If gRstAssocCode!c_assoc_code = ListAssoc.Column(0, i) Then
                                        ListAssoc.ListIndex = i
                                        ListAssoc.Selected(i) = True
                                        gSelectCount = gSelectCount + 1
                                    End If
                                Next i
                                'Set frmZZZ_ASSOC_CODE.Form.Recordset = tRstAssocCodes
                                'tRstAssocCodes.FindNext "c_assoc_code = " + Str(gRstAssocCode!c_assoc_code)
                                'frmZZZ_ASSOC_CODE.Form.Refresh
                                '
                                '
                                '
                                ' set the type values
                                '
                                Set tRstAssocTypes = CurrentDb.OpenRecordset("ASSOC_TYPES", dbOpenDynaset)
                                '
                                tRstAssocTypes.MoveFirst
                                tRstAssocTypes.FindFirst "c_assoc_type_code = " + Chr(34) + cNode.Key + Chr(34)
                                TxtTypeID.Value = cNode.Key
                                TxtTypeDesc.Value = tRstAssocTypes!c_assoc_type_desc
                                TxtTypeDescChn.Value = tRstAssocTypes!c_assoc_type_desc_chn
                                tRstAssocTypes.Close
                                Set tRstAssocTypes = Nothing
                            End If
                        End If
                    End If
                End If
            End If
        End If
    End If

    If gSelectCount = 0 Then
         CmdSelect.Enabled = False
    Else
         CmdSelect.Enabled = True
    End If
End Sub


Private Sub NodeSearch()

    Dim cNode As clsNode, tStr As String, tRstAssocCodes As DAO.Recordset, tRstAssocTypes As DAO.Recordset
    Dim tRstDummy As DAO.Recordset, tStrSQL As String, tStrSearchChn As String, tStrSearchEng As String
    Dim tStrLen As String, cmdSQL As ADODB.Command

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    TxtAssocID.Value = -1
    TxtAssocDesc.Value = ""
    TxtAssocDescChn.Value = ""

    '   all specific association codes will have a type of the form 0101
    '   hence the ValuePath for the relevant node will be "K000/K01/K0101"
    '   The command to locate the relevant node is:
    '   tNode = TreeViewType.FindNode(tStrValuePath)
    '   TreeViewType.SelectedNode = tNode

    ' search for the search string in ASSOC_CODES
    TxtSearchChn.SetFocus
    tStrSearchChn = Me.TxtSearchChn.Text
    TxtSearch.SetFocus
    tStrSearchEng = Me.TxtSearch.Text
    CmdFind.SetFocus

    gStrSearch = ""
    gUseAlt = False

    If tStrSearchChn <> "" Then
        tStrLen = Str(LenB(tStrSearchChn))
       gStrSearch = "LeftB(c_assoc_desc_chn," + tStrLen + ") = '" + tStrSearchChn + "'"
       gStrSearchAlt = "InStrB(1,c_assoc_desc_chn,'" + tStrSearchChn + "') > 0"
    ElseIf tStrSearchEng <> "" Then
        tStrLen = Str(Len(tStrSearchEng))
       gStrSearch = "Left(c_assoc_desc," + tStrLen + ") = '" + tStrSearchEng + "'"
       gStrSearchAlt = "InStr(1,c_assoc_desc,'" + tStrSearchEng + "') > 0"
    End If

    If Not (gStrSearch = "") Then

         'MsgBox "Looking for assoc"

         Set gRstAssocCode = CurrentDb.OpenRecordset("ASSOC_CODES", dbOpenDynaset)

         gRstAssocCode.FindFirst gStrSearch

         If gRstAssocCode.NoMatch Then
             gRstAssocCode.FindFirst gStrSearchAlt
             gUseAlt = True
         End If

         If gRstAssocCode.NoMatch Then
              gUseAlt = False
              CmdFindNext.Enabled = False
         Else
              '
              CmdFindNext.Enabled = True
              '
              ' next find the assoc_type
              '

             'MsgBox "Looking for assoc type"

             Set tRstAssocTypes = CurrentDb.OpenRecordset("ASSOC_CODE_TYPE_REL", dbOpenDynaset)

             tRstAssocTypes.FindNext "c_assoc_code = " + Str(gRstAssocCode!c_assoc_code)

            If Not tRstAssocTypes.NoMatch Then
                '
                ' set the values
                '
                TxtAssocID.Value = gRstAssocCode!c_assoc_code
                If Not IsNull(gRstAssocCode!c_assoc_desc) Then
                    TxtAssocDesc.Value = gRstAssocCode!c_assoc_desc
                End If
                If Not IsNull(gRstAssocCode!c_assoc_desc_chn) Then
                    TxtAssocDescChn.Value = gRstAssocCode!c_assoc_desc_chn
                End If
                '
                ' define the string
                '
                tStr = tRstAssocTypes!c_assoc_type_code
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
                      tStrSQL = "INSERT INTO ZZ_ASSOC_CODE_TMP ( c_assoc_code, c_assoc_desc, c_assoc_desc_chn, c_so
rtorder ) " + _
                          "SELECT ASSOC_CODE_TYPE_REL.c_assoc_code AS c_assoc_code, ASSOC_CODES.c_assoc_desc, " + _
                          "ASSOC_CODES.c_assoc_desc_chn, ASSOC_CODES.c_sortorder " + _
                          "FROM ASSOC_CODES INNER JOIN ASSOC_CODE_TYPE_REL ON " + _
                          "ASSOC_CODES.c_assoc_code = ASSOC_CODE_TYPE_REL.c_assoc_code " + _
                          "WHERE (((ASSOC_CODE_TYPE_REL.c_assoc_type_code)='" + tStr + "'))"

                      '
                      cmdSQL.CommandText = "Delete * from ZZ_ASSOC_CODE_TMP"
                      cmdSQL.Execute tRecDeleted
                      '
                      cmdSQL.CommandText = tStrSQL
                      cmdSQL.Execute tRecDeleted
                      '
                      'Set tRstAssocCodes = CurrentDb.OpenRecordset("ZZ_ASSOC_CODE_TMP", dbOpenDynaset)
                      '
                      'Set frmZZZ_ASSOC_CODE.Form.Recordset = tRstAssocCodes
                      'tRstAssocCodes.FindNext "c_assoc_code = " + Str(gRstAssocCode!c_assoc_code)
                      'frmZZZ_ASSOC_CODE.Form.Refresh
                      '
                      'Set tRstDummy = Nothing
                      '
                      ListAssoc.Requery
                      For i = 0 To ListAssoc.ListCount
                          ListAssoc.Selected(i) = False
                      Next i
                      gSelectCount = 0
                      '
                      For i = 0 To ListAssoc.ListCount - 1
                          If gRstAssocCode!c_assoc_code = ListAssoc.Column(0, i) Then
                              ListAssoc.ListIndex = i
                              ListAssoc.Selected(i) = True
                              gSelectCount = gSelectCount + 1
                              CmdSelect.Enabled = True
                          End If
                      Next i
                      ' set the type values
                      '
                      Set tRstAssocTypes = CurrentDb.OpenRecordset("ASSOC_TYPES", dbOpenDynaset)
                      '
                      tRstAssocTypes.MoveFirst
                    tRstAssocTypes.FindFirst "c_assoc_type_code = " + Chr(34) + cNode.Key + Chr(34)
                    TxtTypeID.Value = cNode.Key
                    TxtTypeDesc.Value = tRstAssocTypes!c_assoc_type_desc
                    TxtTypeDescChn.Value = tRstAssocTypes!c_assoc_type_desc_chn
                    tRstAssocTypes.Close
                    Set tRstAssocTypes = Nothing
                End If
            End If
        End If
    End If

    If gSelectCount = 0 Then
        CmdSelect.Enabled = False
    End If

End Sub

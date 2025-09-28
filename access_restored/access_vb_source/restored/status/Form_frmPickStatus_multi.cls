Option Compare Database
Public gRstStatusCode As DAO.Recordset, gNode As clsNode, gStrSearch As String, gStrSearchAlt As String
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

    gSelectCount = 0

    For Each varItm In ListStatus.ItemsSelected
        gSelectCount = gSelectCount + 1
    Next varItm

    If gSelectCount = 0 Then
         Me.TxtStatusDesc.Value = ""
         Me.TxtStatusDescChn.Value = ""
         Me.TxtStatusID.Value = 0
         Me.CmdSelect.Enabled = False
    Else
         If gSelectCount = 1 Then
              ' this means that there is only on selected item
              For Each varItm In ListStatus.ItemsSelected
                  Me.TxtStatusDesc.Value = ListStatus.Column(1, varItm)
                  Me.TxtStatusDescChn.Value = ListStatus.Column(2, varItm)
                  Me.TxtStatusID.Value = ListStatus.Column(0, varItm)
                  'MsgBox ListStatus.Column(1, varItm)
              Next varItm
         ElseIf gSelectCount = ListStatus.ListCount - 1 Then
              Me.TxtStatusDesc.Value = "All"
              Me.TxtStatusDescChn.Value = "All"
              Me.TxtStatusID.Value = -1
         Else
              Me.TxtStatusDesc.Value = "Multi-select"
              Me.TxtStatusDescChn.Value = "Multi-select"
              Me.TxtStatusID.Value = -2
              'MsgBox "Multi-select"
         End If

          Set cmdSQL = New ADODB.Command
          cmdSQL.ActiveConnection = CurrentProject.Connection
          cmdSQL.CommandType = adCmdText

          '   copy the records over to ZZ_STATUS_CODE

          cmdSQL.CommandText = "DELETE * FROM ZZ_STATUS_CODE"
          cmdSQL.Execute tRecCount

          Set tRst = CurrentDb.OpenRecordset("ZZ_STATUS_CODE", dbOpenDynaset)
          For Each varItm In ListStatus.ItemsSelected
              tRst.AddNew
              tRst!c_status_code = ListStatus.Column(0, varItm)
              tRst!c_status_desc = ListStatus.Column(1, varItm)
              tRst!c_status_desc_chn = ListStatus.Column(2, varItm)
              tRst.Update
          Next varItm
          tRst.Close

          ListStatus.Requery
          'For ti = 0 To ListStatus.ListCount
          '    ListStatus.Selected(ti) = False
           'Next ti
           gSelectCount = 0

    End If
    Forms!frmPickStatus_multi.Visible = False
End Sub

Private Sub CmdSelectAll_Click()
    Dim ti As Long

    If CmdSelectAll.Caption = "Select All" Then
        CmdSelectAll.Caption = "De-select All"

           For ti = 0 To ListStatus.ListCount
               ListStatus.Selected(ti) = True
           Next ti

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
    Dim ti As Long

    CmdSelectAll.Caption = "Select All"
    '
    ' reset the form colors
    '
    For ti = 0 To ListStatus.ListCount
        ListStatus.Selected(ti) = False
    Next ti

    gSelectCount = 0
    CmdSelect.Enabled = False
End Sub
Private Sub Form_Open(Cancel As Integer)
    Dim cRoot As clsNode, strKey As String, strCaption As String
    Dim cNode1 As clsNode, cNode2 As clsNode
    Dim tRst As DAO.Recordset, cmdSQL As ADODB.Command
    '
    ' initialize the text fields
    '
    Me.TxtTypeDesc.Value = ""
    Me.TxtTypeDescChn.Value = ""
    Me.TxtTypeID.Value = "000"
    gSelectCount = 0
    '
    ' initialize the Status Codes dataset
    '
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    Set gRstStatusCode = CurrentDb.OpenRecordset("STATUS_CODES", dbOpenDynaset)

    cmdSQL.CommandText = "DELETE * FROM ZZ_STATUS_CODE_TMP"
    cmdSQL.Execute tRecCount

    cmdSQL.CommandText = "INSERT INTO ZZ_STATUS_CODE_TMP ( c_status_code, c_status_desc, c_status_desc_chn ) " +
_
                              "SELECT STATUS_CODES.c_status_code, STATUS_CODES.c_status_desc, STATUS_CODES.c_status_de
sc_chn " + _
                         "FROM STATUS_CODES"
    cmdSQL.Execute tRecCount

    ListStatus.Requery
    For ti = 0 To ListStatus.ListCount
        ListStatus.Selected(ti) = False
    Next ti
    '
    'frmSTATUS_CODES.Form.OrderBy = "c_sortorder"
    'frmSTATUS_CODES.Form.OrderByOn = True

    If Not IsNull(Me.OpenArgs) Then
        Dim strStatus As String
           strStatus = Me.OpenArgs
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

       Call NodeSearch

Exit_CmdFind_Click:
    Exit Sub

Err_CmdFind_Click:
    MsgBox Err.Description
    Resume Exit_CmdFind_Click

End Sub

Private Sub ListStatus_Click()
    Dim ti As Long, tUnclicked As Boolean
    Dim varItm As Variant

    gSelectCount = 0

    For Each varItm In ListStatus.ItemsSelected
        gSelectCount = gSelectCount + 1
    Next varItm

    If gSelectCount = 0 Then
         Me.CmdSelect.Enabled = False
    Else
         Me.CmdSelect.Enabled = True
    End If
    'MsgBox ListStatus.Column(1, ti + 1) + ": Select Count = " + Str(gSelectCount)

End Sub

Private Sub mcTree_Click(cNode As clsNode)
    Dim tRst As DAO.Recordset, tRstStatus As DAO.Recordset, tStrSQL As String
    Dim tStatusCodeQuery As DAO.QueryDef, prm As DAO.Parameter
    Dim tRstStatusCode As DAO.Recordset, tRstDummy As DAO.Recordset, cmdSQL As ADODB.Command

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
        '

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
        cmdSQL.CommandText = "Delete * from ZZ_STATUS_CODE_TMP"
        cmdSQL.Execute tRecDeleted
        '
        Set gRstStatusCode = CurrentDb.OpenRecordset("STATUS_CODES", dbOpenDynaset)
        '
        cmdSQL.CommandText = "INSERT INTO ZZ_STATUS_CODE_TMP ( c_status_code, c_status_desc, c_status_desc_chn )
" + _
                             "SELECT STATUS_CODES.c_status_code, STATUS_CODES.c_status_desc, STATUS_CODES.c_statu
s_desc_chn " + _
                             "FROM STATUS_CODES"
        cmdSQL.Execute tRecCount

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
           tStrSQL = "INSERT INTO ZZ_STATUS_CODE_TMP ( c_status_code, c_status_desc, c_status_desc_chn ) " + _
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

        cmdSQL.CommandText = "Delete * from ZZ_STATUS_CODE_TMP"
        cmdSQL.Execute tRecDeleted
        '
        cmdSQL.CommandText = tStrSQL
        cmdSQL.Execute tRecDeleted
        '
    End If

    ListStatus.Requery
    For ti = 0 To ListStatus.ListCount
        ListStatus.Selected(ti) = False
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
                               If cNode.Key <> gNode.Key Then
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
                                   tStrSQL = "INSERT INTO ZZ_STATUS_CODE_TMP ( c_status_code, c_status_desc, c_statu
s_desc_chn ) " + _
                                       "SELECT STATUS_CODE_TYPE_REL.c_status_code AS c_status_code, STATUS_CODES.c_s
tatus_desc, " + _
                                       "STATUS_CODES.c_status_desc_chn " + _
                                       "FROM STATUS_CODES INNER JOIN STATUS_CODE_TYPE_REL ON " + _
                                       "STATUS_CODES.c_status_code = STATUS_CODE_TYPE_REL.c_status_code " + _
                                       "WHERE (((STATUS_CODE_TYPE_REL.c_status_type_code)='" + tStr + "'))"
                                   '
                                   Set cmdSQL = New ADODB.Command
                                   cmdSQL.ActiveConnection = CurrentProject.Connection
                                   cmdSQL.CommandType = adCmdText
                                   '
                                   cmdSQL.CommandText = "Delete * from ZZ_STATUS_CODE_TMP"
                                   cmdSQL.Execute tRecDeleted
                                   '
                                   cmdSQL.CommandText = tStrSQL
                                   cmdSQL.Execute tRecDeleted
                                   '
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

                            ListStatus.Requery
                            For ti = 0 To ListStatus.ListCount
                                ListStatus.Selected(ti) = False
                            Next ti
                            gSelectCount = 0
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
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
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
                    cmdSQL.CommandText = "Delete * from ZZ_STATUS_CODE_TMP"
                    cmdSQL.Execute tRecDeleted
                    '
                    tStrSQL = "INSERT INTO ZZ_STATUS_CODE_TMP ( c_status_code, c_status_desc, c_status_desc_chn )
 " + _
                        "SELECT STATUS_CODE_TYPE_REL.c_status_code AS c_status_code, STATUS_CODES.c_status_desc,
" + _
                        "STATUS_CODES.c_status_desc_chn " + _
                        "FROM STATUS_CODES INNER JOIN STATUS_CODE_TYPE_REL ON " + _
                        "STATUS_CODES.c_status_code = STATUS_CODE_TYPE_REL.c_status_code " + _
                        "WHERE (((STATUS_CODE_TYPE_REL.c_status_type_code)='" + tStr + "'))"

                    cmdSQL.CommandText = tStrSQL
                    cmdSQL.Execute tRecDeleted
                    '
                    ListStatus.Requery
                    For i = 0 To ListStatus.ListCount
                        ListStatus.Selected(i) = False
                    Next i
                    gSelectCount = 0
                    '
                    For i = 0 To ListStatus.ListCount - 1
                        If gRstStatusCode!c_status_code = ListStatus.Column(0, i) Then
                            ListStatus.ListIndex = i
                            ListStatus.Selected(i) = True
                            gSelectCount = gSelectCount + 1
                        End If
                    Next i
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

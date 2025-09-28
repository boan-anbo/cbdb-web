Option Compare Database
Public gDisplayLanguage As String, gLabelsOK As Boolean, gFirstTime As Integer

Private Sub c_by_nh_code_AfterUpdate()
    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    If IsNull(c_by_nh_code.Value) Then
         TxtBYNH.Value = ""
    Else
         rst.Open "nian_hao", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_nianhao_id = " & c_by_nh_code.Value

        TxtBYNH.Value = rst.Fields("c_nianhao_chn")
        rst.Close
    End If

End Sub

Private Sub c_dy_nh_code_AfterUpdate()
    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    If IsNull(c_dy_nh_code.Value) Then
         TxtDYNH.Value = ""
    Else
         rst.Open "nian_hao", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_nianhao_id = " & c_dy_nh_code.Value

        TxtDYNH.Value = rst.Fields("c_nianhao_chn")
        rst.Close
    End If

End Sub

Private Sub c_fl_ey_nh_code_AfterUpdate()
    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    If IsNull(c_fl_ey_nh_code.Value) Then
         TxtFlEyNH.Value = ""
    Else
         rst.Open "nian_hao", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_nianhao_id = " & c_fl_ey_nh_code.Value

        TxtFlEyNH.Value = rst.Fields("c_nianhao_chn")
        rst.Close
    End If

End Sub

Private Sub c_fl_ey_notes_Click()
    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strNH As String

          c_fy_nh_code.Visible = True
          c_fy_nh_code.SetFocus
          strNH = c_fy_nh_code.Text

    stDocName = "frmPickNIAN_HAO"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strNH

             If CurrentProject.AllForms("frmPickNIAN_HAO").IsLoaded Then
             Dim intNH As Integer
             Dim strNH_CHN As String

             Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.SetFocus
             intNH = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.Value
             c_fy_nh_code.Value = intNH

             Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.SetFocus
             strNH_CHN = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.Value
             TxtFYNH.Value = strNH_CHN

             DoCmd.Close acForm, stDocName
          End If

          CmdPickFYNH.SetFocus
          c_fy_nh_code.Visible = False

Exit_CmdPickFYNH_Click:
    Exit Sub

Err_CmdPickFYNH_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickFYNH_Click

End Sub

Private Sub c_fl_ly_nh_code_AfterUpdate()
    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    If IsNull(c_fl_ly_nh_code.Value) Then
         TxtFlLyNH.Value = ""
    Else
         rst.Open "nian_hao", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_nianhao_id = " & c_fl_ly_nh_code.Value

        TxtFlLyNH.Value = rst.Fields("c_nianhao_chn")
        rst.Close
    End If

End Sub


Private Sub c_mingzi_chn_AfterUpdate()
    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset
    Dim strSUR As String
    Dim strNM As String
    Dim strSUR_Find As String
    Dim strNM_Find As String
    Dim Counter As Long
    Dim intPerson As Long

If Not IsNull(c_mingzi_chn.Value) And Not IsNull(c_surname_chn.Value) Then
    Counter = 0

    strSUR = c_surname_chn.Value
    strNM = c_mingzi_chn.Value
    intPerson = c_personid.Value

    rst.Open "BIOG_MAIN", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
    Do
       If rst.EOF = True Then
       Exit Do
       End If

      If IsNull(rst!c_surname_chn.Value) Then
      Else
      strSUR_Find = rst!c_surname_chn.Value
      End If

      If IsNull(rst!c_mingzi_chn.Value) Then
      Else
      strNM_Find = rst!c_mingzi_chn.Value
      End If

      If StrComp(strSUR_Find, strSUR) = 0 And StrComp(strNM_Find, strNM) = 0 Then
         If rst!c_personid = intPerson Then
         'This is to exclude the current record from being counted.
          rst.MoveNext
         Else
          Counter = Counter + 1
          rst.MoveNext
         End If
      Else
          rst.MoveNext
      End If
    Loop

    If Counter > 0 Then
    TxtNameChn.SetFocus
    MsgBox "”µ“þŽì°l¬F" & Counter & "—lÐÕÃûÍêÈ«ÏàÍ¬µÄ¼oä›¡£Õˆ´_ÕJ   éwÏÂÕýÔÚÝ”ÈëµÄÐÅÏ¢Åc”µ“þŽì¬FÓÐ”µ“þ›]ÓÐÖØÑ}¡£
éwÏÂ¿ÉÒÔÊ¹ÓÃÓÒÉÏ·½µÄ²éÔƒ°´âo¡¢ÒÔ¬FÓÐÓ›ä›ÐÕÃû ‘ËÑË÷™Ú£¬²éÔƒ¬FÓÐ”µ“þ."
    End If

End If
End Sub

Private Sub c_mingzi_chn_GotFocus()
If IsNull(c_surname.Value) Or c_surname = "" Then
MsgBox "ÕˆÏÈÝ”Èë Xing !"
c_surname.SetFocus
Else
     If IsNull(c_mingzi.Value) Or c_mingzi = "" Then
     MsgBox "ÕˆÏÈÝ”Èë Ming!"
     c_mingzi.SetFocus
     Else
          If IsNull(c_surname_chn.Value) Or c_surname_chn = "" Then
          MsgBox "ÕˆÏÈÝ”Èë ÐÕ!"
          c_surname_chn.SetFocus
          End If
     End If
End If
End Sub


Private Sub c_mingzi_GotFocus()
If IsNull(c_surname.Value) Or c_surname = "" Then
MsgBox "ÕˆÏÈÝ”Èë Xing !"
c_surname.SetFocus
End If
End Sub

Private Sub c_personid_current()
    '
    ' if there is a person ID, enable the store-ID command
    '
    MsgBox c_personid.Text
    If IsNull(Me.c_personid.Value) Then
       Me.CmdStoreID.Enabled = False
    Else
       Me.CmdStoreID.Enabled = True
    End If

End Sub

Private Sub c_surname_AfterUpdate()

    Dim intLastID As Long
    Dim intID As Long

If IsNull(c_surname.Value) Or c_surname = "" Then
Else
     If IsNull(c_personid.Value) Then
         intLastID = DMax("c_personid", "BIOG_MAIN")
         TxtLastID.Value = intLastID

          TxtLastID.Visible = True
          TxtLastID.SetFocus
          intID = TxtLastID.Value
          c_personid.Value = intID + 1

        c_mingzi.SetFocus
        TxtLastID.Visible = False
    End If
End If

End Sub

Private Sub c_surname_chn_BeforeUpdate(Cancel As Integer)
    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset
    Dim strSUR As String
    Dim strNM As String
    Dim strSUR_Find As String
    Dim strNM_Find As String
    Dim Counter As Long
    Dim intPerson As Long

If Not IsNull(c_mingzi_chn.Value) And Not IsNull(c_surname_chn.Value) Then
    Counter = 0

    strSUR = c_surname_chn.Value
    strNM = c_mingzi_chn.Value
    intPerson = c_personid.Value

    rst.Open "BIOG_MAIN", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
    Do
       If rst.EOF = True Then
       Exit Do
       End If

         If IsNull(rst!c_surname_chn.Value) Then
         Else
         strSUR_Find = rst!c_surname_chn.Value
         End If

         If IsNull(rst!c_mingzi_chn.Value) Then
         Else
         strNM_Find = rst!c_mingzi_chn.Value
         End If

      If StrComp(strSUR_Find, strSUR) = 0 And StrComp(strNM_Find, strNM) = 0 Then
         If rst!c_personid = intPerson Then
         'This is to exclude the current record from being counted.
          rst.MoveNext
         Else
          Counter = Counter + 1
          rst.MoveNext
         End If
      Else
          rst.MoveNext
      End If
    Loop

    If Counter > 0 Then
    TxtNameChn.SetFocus
    MsgBox "”µ“þŽì°l¬F" & Counter & "—lÐÕÃûÍêÈ«ÏàÍ¬µÄ¼oä›¡£Õˆ´_ÕJ éwÏÂÕýÔÚÝ”ÈëµÄÐÅÏ¢Åc”µ“þŽì¬FÓÐ”µ“þ›]ÓÐÖØÑ}¡£
éwÏÂ¿ÉÒÔÊ¹ÓÃÓÒÉÏ·½µÄ²éÔƒ°´âo¡¢ÒÔ¬FÓÐÓ›ä›ÐÕÃû ‘ËÑË÷™Ú£¬²éÔƒ¬FÓÐ”µ“þ."
    End If

End If

End Sub


Private Sub CmdExplainInput_Click()
On Error GoTo Err_CmdExplainInput_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "FrmExplainInput"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdExplainInput_Click:
    Exit Sub

Err_CmdExplainInput_Click:
    MsgBox Err.Description
    Resume Exit_CmdExplainInput_Click

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

    cmdSQL.CommandText = "INSERT INTO ZZ_STORE_PERSON_ID ( c_personid ) SELECT " + Str(Me.c_personid.Value) + " A
S c_personid"
    cmdSQL.Execute tRecCount
    MsgBox "Person ID successfully stored. Click on 'Recall Person IDs' to reuse this ID in other forms."
    '
    ' update storage source
    cmdSQL.CommandText = "UPDATE PersonIDSource SET SourceForm ='Browser' WHERE PersonIDSource.LineNum =1"
    cmdSQL.Execute tRecCount

End Sub

Private Sub Form_AfterDelConfirm(STATUS As Integer)
Dim rst As ADODB.Recordset
Set rst = New ADODB.Recordset

If STATUS = acDeleteOK Then
     rst.Open "Del_log", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
     rst.Find "c_flag = " & 1
     rst!c_flag = 0
     rst.Update
     rst.Close
Else
     rst.Open "Del_log", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
     rst.Find "c_flag = " & 1
     rst.Delete
     rst.Update
     rst.Close
End If

End Sub

Private Sub Form_BeforeUpdate(Cancel As Integer)
    Dim tTest As Integer
    Dim tStr1 As String, tStr2 As String, tMing As String, tMingChn As String

    tTest = 0
    tMing = ""
    tMingChn = ""
    '
    ' test to see that surnames are non-NULL
    '
    If Not IsNull(c_surname.Value) And Not IsNull(c_surname_chn.Value) Then
        '
        ' then look for any changes
        '
        If StrComp(c_surname.OldValue, c_surname.Value, 0) = 0 Then
        Else
             tTest = 1
        End If
        '
        If StrComp(c_surname_chn.OldValue, c_surname_chn.Value, 0) = 0 Then
        Else
             tTest = 1
        End If
        '
        ' personal names are allowed to be NULL, so we need to check if a name has
        ' been deleted as well as if one has been added
        '
        If Not IsNull(c_mingzi.Value) And Not IsNull(c_mingzi_chn.Value) Then
             tMingChn = Trim(c_mingzi_chn.Value)
             tMing = Trim(c_mingzi.Value)
             '
             If IsNull(c_mingzi.OldValue) Then
                  tTest = 1
             Else
                  If StrComp(c_mingzi.OldValue, c_mingzi.Value, 0) = 0 Then
                  Else
                       tTest = 1
                  End If
             End If
             '
             If IsNull(c_mingzi_chn.OldValue) Then
                  tTest = 1
             Else
                  If StrComp(c_mingzi_chn.OldValue, c_mingzi_chn.Value, 0) = 0 Then
                  Else
                       tTest = 1
                   End If
               End If
        Else
            If IsNull(c_mingzi.Value) And IsNull(c_mingzi_chn.Value) Then
                If Not (IsNull(c_mingzi.OldValue) And IsNull(c_mingzi_chn.OldValue)) Then
                    tTest = 1
                End If
            End If
        End If

        If tTest = 1 Then
            tStr1 = Trim(c_surname_chn.Value) + tMingChn
            tStr2 = Trim(c_surname.Value) + " " + tMing
            '
            c_name_chn.Value = tStr1
            c_name.Value = tStr2
        End If
    End If
End Sub

Private Sub Form_Current()

    ' make sure the other subform is pointing to the right record

    'If c_personid.Value <> Forms!CBDB_Browser!frmPeopleLookup.Form!c_personid.Value Then
    '    Set tRstLookup = Forms!CBDB_Browser!frmPeopleLookup.Form.Recordset
    '    tRstLookup.FindFirst "c_personid = " + Trim(Str(c_personid.Value))
    '    Set tRstLookup = Nothing
    'End If

    If IsNull(Me.c_personid.Value) Then
       Me.CmdStoreID.Enabled = False
    Else
       Me.CmdStoreID.Enabled = True
    End If

End Sub
Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 59) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 59 And Not .EOF
             If !c_form = "BIO" Then
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
             Me.TabCtl14.FontSize = 8
        ElseIf gDisplayLanguage = "T" Then
             tLang = 2
             Me.TabCtl14.FontSize = 10
        Else
             tLang = 3
             Me.TabCtl14.FontSize = 10
        End If
        '
        ' now comes the basic routine
        '
        Me.LblFemale.Caption = tLabelLanguage(tLang, 1)
        Me.LblIndexYear.Caption = tLabelLanguage(tLang, 2)
        ' Me.LblTribe.Caption = tLabelLanguage(tLang, 3)
        ' Me.LblFullNameChn.Caption = tLabelLanguage(tLang, 4)
        ' Me.LblFullname.Caption = tLabelLanguage(tLang, 5)
        ' Me.LblPages.Caption = tLabelLanguage(tLang, 6)
        Me.LblNotes.Caption = tLabelLanguage(tLang, 7)
        Me.LblBirthyear.Caption = tLabelLanguage(tLang, 8)
        Me.LblBYNianhaoDate.Caption = tLabelLanguage(tLang, 9)
        Me.LblBYIntercalary.Caption = tLabelLanguage(tLang, 10)
        Me.LblBYGZ.Caption = tLabelLanguage(tLang, 11)
        Me.LblBYRange.Caption = tLabelLanguage(tLang, 12)
        Me.LblDeathyear.Caption = tLabelLanguage(tLang, 13)
        Me.LblDYNianhaoDate.Caption = tLabelLanguage(tLang, 14)
        Me.LblDYIntercalary.Caption = tLabelLanguage(tLang, 15)
        Me.LblDYGZ.Caption = tLabelLanguage(tLang, 16)
        Me.LblDYRange.Caption = tLabelLanguage(tLang, 17)
        Me.LblDeathAge.Caption = tLabelLanguage(tLang, 18)
        Me.LblDeathAgeRange.Caption = tLabelLanguage(tLang, 19)
        Me.LblFloruitFirstYear.Caption = tLabelLanguage(tLang, 20)
        Me.LblFloruitFirstNHYear.Caption = tLabelLanguage(tLang, 21)
        Me.LblFloruitFirstYearNotes.Caption = tLabelLanguage(tLang, 22)
        Me.LblFloruitLastYear.Caption = tLabelLanguage(tLang, 23)
        Me.LblFloruitLastNHYear.Caption = tLabelLanguage(tLang, 24)
        Me.LblFloruitLastYearNotes.Caption = tLabelLanguage(tLang, 25)
        ' Me.LblOpenEvents.Caption = tLabelLanguage(tLang, 26)

        Me.LblDynasty.Caption = tLabelLanguage(tLang, 27)
        ' Me.CmdFind.Caption = tLabelLanguage(tLang, 28)
        Me.LblChoronym.Caption = tLabelLanguage(tLang, 29)
        Me.LblEthnicity.Caption = tLabelLanguage(tLang, 30)
        ' Me.LblSource.Caption = tLabelLanguage(tLang, 31)
        Me.LblBYNH.Caption = tLabelLanguage(tLang, 32)
        Me.LblDYNH.Caption = tLabelLanguage(tLang, 33)
        Me.LblFLEY.Caption = tLabelLanguage(tLang, 34)
        Me.LblFLLY.Caption = tLabelLanguage(tLang, 35)
        ' Me.CmdDelete.Caption = tLabelLanguage(tLang, 36)
        ' Me.CmdAddNew.Caption = tLabelLanguage(tLang, 37)
        ' Me.CmdJianti.Caption = tLabelLanguage(tLang, 38)
        ' Me.CmdFanti.Caption = tLabelLanguage(tLang, 39)
        ' Me.CmdExplain.Caption = tLabelLanguage(tLang, 40)
        ' Me.CmdOpenTEXTS_EnterForm.Caption = tLabelLanguage(tLang, 41)
        ' Me.CmdOpenEvents.Caption = tLabelLanguage(tLang, 42)

        Me.PageBirthDeathYears.Caption = tLabelLanguage(tLang, 43)
        Me.PageAddresses.Caption = tLabelLanguage(tLang, 44)
        Me.PageAltNames.Caption = tLabelLanguage(tLang, 45)
        Me.PageWritings.Caption = tLabelLanguage(tLang, 46)
        Me.PageEntry.Caption = tLabelLanguage(tLang, 47)
        Me.PageEvents.Caption = tLabelLanguage(tLang, 48)
        Me.PageKinship.Caption = tLabelLanguage(tLang, 49)
        Me.PageAssociations.Caption = tLabelLanguage(tLang, 50)
        Me.PagePossessions.Caption = tLabelLanguage(tLang, 51)
        Me.PageStatus.Caption = tLabelLanguage(tLang, 52)
        Me.PagePosting.Caption = tLabelLanguage(tLang, 53)
        Me.PageBiogInst.Caption = tLabelLanguage(tLang, 54)
        Me.PageSource.Caption = tLabelLanguage(tLang, 55)
        Me.Label284.Caption = tLabelLanguage(tLang, 56)
        Me.CmdStoreID.Caption = tLabelLanguage(tLang, 57)
        Me.LblPersonID.Caption = tLabelLanguage(tLang, 58)


        'MsgBox "Finished BIOG_MAIN_2 labels"
        ' now for the subforms

        'MsgBox "Beginning ASSOC_DATA_2 labels"

        Me.ASSOC_DATA_2_Subform.Form.gDisplayLanguage = gDisplayLanguage
        Me.ASSOC_DATA_2_Subform.Form.changeDisplayLanguage

        'MsgBox "Beginning TEXT_DATA_2 labels"

        Me.TEXT_DATA_2_Subform.Form.gDisplayLanguage = gDisplayLanguage
        Me.TEXT_DATA_2_Subform.Form.changeDisplayLanguage

        'MsgBox "Beginning ADDR_DATA_2 labels"

          Me.BIOG_ADDR_DATA_2_Subform.Form.gDisplayLanguage = gDisplayLanguage
          Me.BIOG_ADDR_DATA_2_Subform.Form.changeDisplayLanguage

          'MsgBox "Beginning ENTRY_DATA_2 labels"

          Me.ENTRY_DATA_2_Subform.Form.gDisplayLanguage = gDisplayLanguage
          Me.ENTRY_DATA_2_Subform.Form.changeDisplayLanguage

          'MsgBox "Beginning EVENTS_DATA_2 labels"

          Me.EVENTS_DATA_2_Subform.Form.gDisplayLanguage = gDisplayLanguage
          Me.EVENTS_DATA_2_Subform.Form.changeDisplayLanguage

          'MsgBox "Beginning ALT_NAME_2 labels"

          Me.ALTNAME_DATA_2_Subform.Form.gDisplayLanguage = gDisplayLanguage
          Me.ALTNAME_DATA_2_Subform.Form.changeDisplayLanguage

          'MsgBox "Beginning KIN_DATA_2 labels"

          Me.KIN_DATA_2_Subform.Form.gDisplayLanguage = gDisplayLanguage
          Me.KIN_DATA_2_Subform.Form.changeDisplayLanguage

          'MsgBox "Beginning POSSSESSION_DATA_2 labels"

          Me.POSSESSION_DATA_2_Subform.Form.gDisplayLanguage = gDisplayLanguage
          Me.POSSESSION_DATA_2_Subform.Form.changeDisplayLanguage

          'MsgBox "Beginning STATUS_DATA_2 labels"

          Me.STATUS_DATA_2_Subform.Form.gDisplayLanguage = gDisplayLanguage
          Me.STATUS_DATA_2_Subform.Form.changeDisplayLanguage

          'MsgBox "Beginning POSTING_DATA_2 labels"

          Me.POSTING_DATA_2_Subform.Form.gDisplayLanguage = gDisplayLanguage
          Me.POSTING_DATA_2_Subform.Form.changeDisplayLanguage

          'MsgBox "Beginning frmBIOG_SOURCE_DATA labels"

          Me.frmBIOG_SOURCE_DATA.Form.gDisplayLanguage = gDisplayLanguage
          Me.frmBIOG_SOURCE_DATA.Form.changeDisplayLanguage

          'MsgBox "Beginning frmBIOG_INST_DATA labels"

        Me.frmBIOG_INST_CODES.Form.gDisplayLanguage = gDisplayLanguage
        Me.frmBIOG_INST_CODES.Form.changeDisplayLanguage
        'MsgBox "Finished all subforms"
    End If

End Sub

Option Compare Database

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
    Dim Counter As Integer
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
    Dim Counter As Integer
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


Private Sub c_surname_chn_GotFocus()
If IsNull(c_surname.Value) Or c_surname = "" Then
MsgBox "ÕˆÏÈÝ”Èë Xing !"
c_surname.SetFocus
Else
     If IsNull(c_mingzi.Value) Or c_mingzi = "" Then
     MsgBox "ÕˆÏÈÝ”Èë Ming!"
     c_mingzi.SetFocus
     End If
End If
End Sub

Private Sub CmbBYRG_AfterUpdate()
    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    If IsNull(CmbBYRG.Value) Then
         TxtBYRG.Value = ""
    Else
         rst.Open "year_range_codes", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_range_code = " & CmbBYRG.Value

        TxtBYRG.Value = rst.Fields("c_range_chn")
        rst.Close
    End If

End Sub

Private Sub CmbDYRG_AfterUpdate()
    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    If IsNull(CmbDYRG.Value) Then
         TxtDYRG.Value = ""
    Else
         rst.Open "year_range_codes", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_range_code = " & CmbDYRG.Value

        TxtDYRG.Value = rst.Fields("c_range_chn")
        rst.Close
    End If
End Sub

Private Sub CmdPickBYNH_Click()
On Error GoTo Err_CmdPickBYNH_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strNH As String

    c_by_nh_code.Visible = True
    c_by_nh_code.SetFocus
    strNH = c_by_nh_code.Text

    stDocName = "frmPickNIAN_HAO"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strNH

    If CurrentProject.AllForms("frmPickNIAN_HAO").IsLoaded Then
        Dim intNH As Integer
        Dim strNH_CHN As String

          Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.SetFocus
          intNH = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.Value
          c_by_nh_code.Value = intNH

          Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.SetFocus
          strNH_CHN = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.Value
          TxtBYNH.Value = strNH_CHN

        DoCmd.Close acForm, stDocName
    End If

    CmdPickBYNH.SetFocus
    c_by_nh_code.Visible = False

Exit_CmdPickBYNH_Click:
    Exit Sub

Err_CmdPickBYNH_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickBYNH_Click


End Sub

Private Sub CmdPickChoronym_Click()
On Error GoTo Err_CmdPickChoronym_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim stChoro As String
    Dim intChoro As Integer
    Dim strChoro As String
    Dim strChoro_CHN As String
    Dim rsChoro As DAO.Recordset

    Forms!BIOG_MAIN!c_choronym_code.Visible = True
    Forms!BIOG_MAIN!c_choronym_code.SetFocus
    stChoro = Forms!BIOG_MAIN!c_choronym_code.Text

    stDocName = "frmPickChoronym"
    DoCmd.OpenForm stDocName, acNormal, , stLinkCriteria, , acDialog, stChoro
    If CurrentProject.AllForms(stDocName).IsLoaded Then
        Forms!frmPickChoronym!frmChoronyms.Form!ChoroCode.SetFocus
        intChoro = Forms!frmPickChoronym!frmChoronyms.Form!ChoroCode.Value
        Forms!BIOG_MAIN!c_choronym_code.Value = intChoro

        Forms!frmPickChoronym!frmChoronyms.Form!c_choronym_desc.SetFocus
        strChoro = Forms!frmPickChoronym!frmChoronyms.Form!c_choronym_desc.Value
        Forms!BIOG_MAIN!TxtChoroDesc.Value = strChoro

        Forms!frmPickChoronym!frmChoronyms.Form!c_choronym_chn.SetFocus
        strChoro_CHN = Forms!frmPickChoronym!frmChoronyms.Form!c_choronym_chn.Value
        Forms!BIOG_MAIN!TxtChoroDescCHN.Value = strChoro_CHN

        DoCmd.Close acForm, stDocName
    End If
    CmdPickChoronym.SetFocus
    Forms!BIOG_MAIN!c_choronym_code.Visible = False


Exit_CmdPickChoronym_Click:
    Exit Sub

Err_CmdPickChoronym_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickChoronym_Click

End Sub
Private Sub CmdPickDynasty_Click()
On Error GoTo Err_CmdPickDynasty_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strDy As String

    c_dy.Visible = True
    c_dy.SetFocus
    strDy = c_dy.Text

    stDocName = "frmPickDynasty"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strDy

    If CurrentProject.AllForms("frmPickDynasty").IsLoaded Then
        Dim intDy As Integer
        Dim strDy_Desc As String
        Dim strDy_CHN As String

        Forms!frmpickdynasty!frmDYNASTIES.Form!Dy_Code.SetFocus
        intDy = Forms!frmpickdynasty!frmDYNASTIES.Form!Dy_Code.Value
        c_dy.Value = intDy

        Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty.SetFocus
        strDy_Desc = Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty.Value
        TxtDynasty.Value = strDy_Desc

        Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty_chn.SetFocus
        strDy_CHN = Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty_chn.Value
        TxtDynastyCHN.Value = strDy_CHN

        DoCmd.Close acForm, stDocName
    End If

    CmdPickDynasty.SetFocus
    c_dy.Visible = False

Exit_CmdPickDynasty_Click:
    Exit Sub

Err_CmdPickDynasty_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickDynasty_Click

End Sub
Private Sub CmdPickNIAN_HAO_Click()
On Error GoTo Err_CmdPickNIAN_HAO_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strNH As String

    c_by_nh_code.Visible = True
    c_by_nh_code.SetFocus
    strNH = c_by_nh_code.Text

    stDocName = "frmPickNIAN_HAO"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strNH

    If CurrentProject.AllForms("frmPickNIAN_HAO").IsLoaded Then
        Dim intNH As Integer
        Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.SetFocus
        intDy = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.Value
        c_dy.Value = intNH
        DoCmd.Close acForm, stDocName
    End If

    CmdPickBYNH.SetFocus
    c_by_nh_code.Visible = False

Exit_CmdPickNIAN_HAO_Click:
    Exit Sub

Err_CmdPickNIAN_HAO_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickNIAN_HAO_Click

End Sub

Private Sub CmdPickDYNH_Click()
On Error GoTo Err_CmdPickDYNH_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strNH As String

    c_dy_nh_code.Visible = True
    c_dy_nh_code.SetFocus
    strNH = c_dy_nh_code.Text

    stDocName = "frmPickNIAN_HAO"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strNH

    If CurrentProject.AllForms("frmPickNIAN_HAO").IsLoaded Then
        Dim intNH As Integer
        Dim strNH_CHN As String

          Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.SetFocus
          intNH = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.Value
          c_dy_nh_code.Value = intNH

          Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.SetFocus
          strNH_CHN = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.Value
          TxtDYNH.Value = strNH_CHN

        DoCmd.Close acForm, stDocName
    End If

    CmdPickDYNH.SetFocus
    c_dy_nh_code.Visible = False

Exit_CmdPickDYNH_Click:
    Exit Sub

Err_CmdPickDYNH_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickDYNH_Click
End Sub

Private Sub CmdPickFlEyNH_Click()
On Error GoTo Err_CmdPickFlEyNH_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

           Dim strNH As String

           c_fl_ey_nh_code.Visible = True
           c_fl_ey_nh_code.SetFocus
           strNH = c_fl_ey_nh_code.Text

    stDocName = "frmPickNIAN_HAO"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strNH

     If CurrentProject.AllForms("frmPickNIAN_HAO").IsLoaded Then
               Dim intNH As Integer
               Dim strNH_CHN As String

                   Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.SetFocus
                   intNH = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.Value
                   c_fl_ey_nh_code.Value = intNH

                   Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.SetFocus
                   strNH_CHN = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.Value
                   TxtFlEyNH.Value = strNH_CHN

                   DoCmd.Close acForm, stDocName
          End If

CmdPickFlEyNH.SetFocus
c_fl_ey_nh_code.Visible = False

Exit_CmdPickFlEyNH_Click:
    Exit Sub

Err_CmdPickFlEyNH_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickFlEyNH_Click

End Sub

Private Sub CmdPickFlLyNH_Click()
On Error GoTo Err_CmdPickFlLyNH_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

           Dim strNH As String

           c_fl_ly_nh_code.Visible = True
           c_fl_ly_nh_code.SetFocus
           strNH = c_fl_ly_nh_code.Text

    stDocName = "frmPickNIAN_HAO"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strNH

     If CurrentProject.AllForms("frmPickNIAN_HAO").IsLoaded Then
               Dim intNH As Integer
               Dim strNH_CHN As String

                   Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.SetFocus
                   intNH = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.Value
                   c_fl_ly_nh_code.Value = intNH

                   Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.SetFocus
                   strNH_CHN = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.Value
                   TxtFlLyNH.Value = strNH_CHN

                   DoCmd.Close acForm, stDocName
          End If

CmdPickFlLyNH.SetFocus
c_fl_ly_nh_code.Visible = False

Exit_CmdPickFlLyNH_Click:
    Exit Sub
Err_CmdPickFlLyNH_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickFlLyNH_Click
End Sub

Private Sub CmdPickSource_Click()
On Error GoTo Err_CmdPickSource_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strSC As String

          c_source.Visible = True
          c_source.SetFocus
          strSC = c_source.Text

    stDocName = "frmPickTEXTS"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strSC

          If CurrentProject.AllForms("frmPickTEXTS").IsLoaded Then
             Dim intSC As Integer
             Dim strSC_CHN As String

             Forms!frmPickTEXTS!frmTEXTS.Form!c_textid.SetFocus
             intSC = Forms!frmPickTEXTS!frmTEXTS.Form!c_textid.Value
             c_source.Value = intSC

             Forms!frmPickTEXTS!frmTEXTS.Form!c_title.SetFocus
             strSC_CHN = Forms!frmPickTEXTS!frmTEXTS.Form!c_title_chn.Value
             TxtTitle_CHN.Value = strSC_CHN

             DoCmd.Close acForm, stDocName
          End If

CmdPickSource.SetFocus
c_source.Visible = False


Exit_CmdPickSource_Click:
    Exit Sub

Err_CmdPickSource_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickSource_Click

End Sub


Private Sub DeathAgeApprox_AfterUpdate()
    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    If IsNull(DeathAgeApprox.Value) Then
         TxtApprox.Value = ""
    Else
         rst.Open "year_range_codes", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_range_code = " & DeathAgeApprox.Value

        TxtApprox.Value = rst.Fields("c_approx_chn")
        rst.Close
    End If
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


    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    If IsNull(c_choronym_code.Value) Then
        TxtChoroDesc.Value = ""
        TxtChoroDescCHN.Value = ""
    Else
           rst.Open "CHORONYM_CODES", CurrentProject.Connection, adOpenDynamic, _
           adLockOptimistic
           rst.Find "c_choronym_code = " & c_choronym_code.Value

        TxtChoroDesc.Value = rst.Fields("c_choronym_desc")
        TxtChoroDescCHN.Value = rst.Fields("c_choronym_chn")
        rst.Close
    End If

    If IsNull(c_dy.Value) Then
         TxtDynasty.Value = ""
         TxtDynastyCHN.Value = ""
    Else
         rst.Open "DYNASTIES", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_dy = " & c_dy.Value

        TxtDynasty.Value = rst.Fields("c_dynasty")
        TxtDynastyCHN.Value = rst.Fields("c_dynasty_chn")
        rst.Close
    End If


    If IsNull(c_by_nh_code.Value) Then
         TxtBYNH.Value = ""
    Else
         rst.Open "nian_hao", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_nianhao_id = " & c_by_nh_code.Value

        TxtBYNH.Value = rst.Fields("c_nianhao_chn")
        rst.Close
    End If


    If IsNull(c_dy_nh_code.Value) Then
         TxtDYNH.Value = ""
    Else
         rst.Open "nian_hao", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_nianhao_id = " & c_dy_nh_code.Value

        TxtDYNH.Value = rst.Fields("c_nianhao_chn")
        rst.Close
    End If


    If IsNull(c_fl_ey_nh_code.Value) Then
         TxtFlEyNH.Value = ""
    Else
         rst.Open "nian_hao", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_nianhao_id = " & c_fl_ey_nh_code.Value

        TxtFlEyNH.Value = rst.Fields("c_nianhao_chn")
        rst.Close
    End If


    If IsNull(c_fl_ly_nh_code.Value) Then
         TxtFlLyNH.Value = ""
    Else
         rst.Open "nian_hao", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_nianhao_id = " & c_fl_ly_nh_code.Value

        TxtFlLyNH.Value = rst.Fields("c_nianhao_chn")
        rst.Close
    End If


    If IsNull(CmbBYRG.Value) Then
         TxtBYRG.Value = ""
    Else
         rst.Open "year_range_codes", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_range_code = " & CmbBYRG.Value

           TxtBYRG.Value = rst.Fields("c_range_chn")
        rst.Close
    End If

    If IsNull(CmbDYRG.Value) Then
         TxtDYRG.Value = ""
    Else
         rst.Open "year_range_codes", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_range_code = " & CmbDYRG.Value

        TxtDYRG.Value = rst.Fields("c_range_chn")
        rst.Close
    End If


    If IsNull(DeathAgeApprox.Value) Then
         TxtApprox.Value = ""
    Else
         rst.Open "year_range_codes", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_range_code = " & DeathAgeApprox.Value

        TxtApprox.Value = rst.Fields("c_approx_chn")
        rst.Close
    End If


    If IsNull(c_source.Value) Then
         TxtTitle_CHN.Value = ""
    Else
         rst.Open "TEXT_CODES", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_textid = " & c_source.Value

        TxtTitle_CHN.Value = rst.Fields("c_title_chn")
        rst.Close
    End If

    If IsNull(c_ethnicity_code.Value) Then
         TxtEthnicity.Value = ""
    Else
         rst.Open "Ethnicity_codes", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_ethnicity_code = " & c_ethnicity_code.Value

        TxtEthnicity.Value = rst.Fields("c_ethnicity_desc_chn")
        rst.Close
    End If

End Sub
Private Sub CmdPickEthnicity_Click()
On Error GoTo Err_CmdPickEthnicity_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strETHN As String

        c_ethnicity_code.Visible = True
        c_ethnicity_code.SetFocus
        strETHN = c_ethnicity_code.Text

    stDocName = "frmPickETHNICITY"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strETHN

         If CurrentProject.AllForms("frmPickETHNICITY").IsLoaded Then
           Dim intETHN As Integer
           Dim strETHN_CHN As String

           Forms!frmPickETHNICITY!frmETHNICITY.Form!c_ethnicity_code.SetFocus
           intETHN = Forms!frmPickETHNICITY!frmETHNICITY.Form!c_ethnicity_code.Value
           c_ethnicity_code.Value = intETHN

           Forms!frmPickETHNICITY!frmETHNICITY.Form!c_ethnicity_desc_chn.SetFocus
           strETHN_CHN = Forms!frmPickETHNICITY!frmETHNICITY.Form!c_ethnicity_desc_chn.Value
           TxtEthnicity.Value = strETHN_CHN

           DoCmd.Close acForm, stDocName
        End If

        CmdPickEthnicity.SetFocus
          c_ethnicity_code.Visible = False

Exit_CmdPickEthnicity_Click:
    Exit Sub

Err_CmdPickEthnicity_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickEthnicity_Click

End Sub

Private Sub Form_Open(Cancel As Integer)
    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    If IsNull(c_ethnicity_code.Value) Then
         TxtEthnicity.Value = ""
    Else
         rst.Open "Ethnicity_codes", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_ethnicity_code = " & c_ethnicity_code.Value

        TxtEthnicity.Value = rst.Fields("c_ethnicity_desc_chn")
        rst.Close
    End If

End Sub
Private Sub CmdDelete_Click()
On Error GoTo Err_CmdDelete_Click

Dim rst As ADODB.Recordset
Set rst = New ADODB.Recordset

Dim blnRecordAdded As Boolean

If Not IsNull(c_surname_chn) Then
    rst.Open "Del_Log", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
    rst.AddNew
    rst!c_personid = c_personid
    rst!c_subform = "BIOG_MAIN"
    rst!c_flag = 1

    rst!c_surname_chn = c_surname_chn
    rst!c_surname = c_surname
    rst!c_mingzi_chn = c_mingzi_chn
    rst!c_mingzi = c_mingzi_chn
    rst!c_female = c_female
    rst!c_birthyear = c_birthyear
    rst!c_deathyear = c_deathyear
    rst!c_by_nh_code = c_by_nh_code
    rst!c_by_nh_year = c_by_nh_year
    rst!c_by_range = c_by_range
    rst!c_dy_nh_code = c_dy_nh_code
    rst!c_dy_nh_year = c_dy_nh_year
    rst!c_dy_range = c_dy_range
    rst!c_fl_earliest_year = c_fl_earliest_year
    rst!c_fl_latest_year = c_fl_latest_year
    rst!c_fl_ey_nh_code = c_fl_ey_nh_code
    rst!c_fl_ly_nh_code = c_fl_ly_nh_code
    rst!c_fl_ey_nh_year = c_fl_ey_nh_year
    rst!c_fl_ly_nh_year = c_fl_ly_nh_year
    rst!c_fl_ey_notes = c_fl_ey_notes
    rst!c_fl_ly_notes = c_fl_ly_notes
    rst!c_choronym_code = c_choronym_code
    rst!c_dy = c_dy
    rst!c_index_year = c_index_year
    rst!c_death_age = c_death_age
    rst!c_ethnicity_code = c_ethnicity_code
    rst!c_tribe = c_tribe
    rst!c_surname_code = c_surname_code
    rst!c_jia = c_jia
    rst!c_zu = c_zu

    rst!c_source = c_source
    rst!c_pages = c_pages
    rst!c_notes = c_notes
    rst.Update
    blnRecordAdded = True
    rst.Close
End If

    DoCmd.DoMenuItem acFormBar, acEditMenu, 8, , acMenuVer70
    DoCmd.DoMenuItem acFormBar, acEditMenu, 6, , acMenuVer70

Exit_CmdDelete_Click:
    Exit Sub

Err_CmdDelete_Click:
    MsgBox Err.Description
    Resume Exit_CmdDelete_Click

End Sub
Private Sub CmdOpenTEXTS_EnterForm_Click()
On Error GoTo Err_CmdOpenTEXTS_EnterForm_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "TEXTS EnterForm"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdOpenTEXTS_EnterForm_Click:
    Exit Sub

Err_CmdOpenTEXTS_EnterForm_Click:
    MsgBox Err.Description
    Resume Exit_CmdOpenTEXTS_EnterForm_Click

End Sub
Private Sub CmdFind_Click()
On Error GoTo Err_CmdFind_Click


    Screen.PreviousControl.SetFocus
    DoCmd.DoMenuItem acFormBar, acEditMenu, 10, , acMenuVer70

Exit_CmdFind_Click:
    Exit Sub

Err_CmdFind_Click:
    MsgBox Err.Description
    Resume Exit_CmdFind_Click

End Sub
Private Sub CmdAddNew_Click()
On Error GoTo Err_CmdAddNew_Click


    DoCmd.GoToRecord , , acNewRec

c_surname.SetFocus

Exit_CmdAddNew_Click:
    Exit Sub

Err_CmdAddNew_Click:
    MsgBox Err.Description
    Resume Exit_CmdAddNew_Click

End Sub

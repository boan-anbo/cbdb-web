Option Compare Database
Public gDisplayLanguage As String, gLabelsOK As Boolean


Private Sub CmdPickFYNH_Click()
On Error GoTo Err_CmdPickFYNH_Click

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

          CmdPickLYNH.SetFocus
          c_fy_nh_code.Visible = False


Exit_CmdPickFYNH_Click:
    Exit Sub

Err_CmdPickFYNH_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickFYNH_Click

End Sub

Private Sub CmdPickLYNH_Click()
On Error GoTo Err_CmdPickLYNH_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strNH As String

          c_ly_nh_code.Visible = True
          c_ly_nh_code.SetFocus
          strNH = c_ly_nh_code.Text


    stDocName = "frmPickNIAN_HAO"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strNH

             If CurrentProject.AllForms("frmPickNIAN_HAO").IsLoaded Then
             Dim intNH As Integer
             Dim strNH_CHN As String

             Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.SetFocus
             intNH = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.Value
             c_ly_nh_code.Value = intNH

             Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.SetFocus
             strNH_CHN = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.Value
             TxtLYNH.Value = strNH_CHN

             DoCmd.Close acForm, stDocName
          End If

          CmdPickLYNH.SetFocus
          c_ly_nh_code.Visible = False


Exit_CmdPickLYNH_Click:
    Exit Sub

Err_CmdPickLYNH_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickLYNH_Click

End Sub
Private Sub CmdPickSocDtn_Click()
On Error GoTo Err_CmdPickSocDtn_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strSD As String

          c_status_code.Visible = True
          c_status_code.SetFocus
          strSD = c_status_code.Text


    stDocName = "frmPickSTATUS_CODES"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strSD


             If CurrentProject.AllForms("frmPickSTATUS_CODES").IsLoaded Then
             Dim intSD As Long
             Dim strSD_CHN As String

             Forms!frmPickSTATUS_CODES!frmSTATUS_CODES.Form!c_status_code.SetFocus
             intSD = Forms!frmPickSTATUS_CODES!frmSTATUS_CODES.Form!c_status_code.Value
             c_status_code.Value = intSD

             Forms!frmPickSTATUS_CODES!frmSTATUS_CODES.Form!c_status_desc_chn.SetFocus
             strSD_CHN = Forms!frmPickSTATUS_CODES!frmSTATUS_CODES.Form!c_status_desc_chn.Value
             c_status_desc_chn.Value = strSD_CHN

             DoCmd.Close acForm, stDocName
          End If

CmdPickSocDtn.SetFocus
c_status_code.Visible = False

Exit_CmdPickSocDtn_Click:
    Exit Sub

Err_CmdPickSocDtn_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickSocDtn_Click

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
             Dim intSC As Long
             Dim strSC_CHN As String, strSC_Eng

             Forms!frmPickTEXTS!frmTEXTS.Form!c_textid.SetFocus
             intSC = Forms!frmPickTEXTS!frmTEXTS.Form!c_textid.Value
             c_source.Value = intSC

             Forms!frmPickTEXTS!frmTEXTS.Form!c_title.SetFocus
             strSC_CHN = Forms!frmPickTEXTS!frmTEXTS.Form!c_title_chn.Value
             strSC_Eng = Forms!frmPickTEXTS!frmTEXTS.Form!c_title.Value
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

Private Sub Form_Current()
    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    If IsNull(c_fy_nh_code.Value) Then
         TxtFYNH.Value = ""
    Else
         rst.Open "nian_hao", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_nianhao_id = " & c_fy_nh_code.Value

        TxtFYNH.Value = rst.Fields("c_nianhao_chn")
        rst.Close
    End If

    If IsNull(c_ly_nh_code.Value) Then
         TxtLYNH.Value = ""
    Else
         rst.Open "nian_hao", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_nianhao_id = " & c_ly_nh_code.Value

        TxtLYNH.Value = rst.Fields("c_nianhao_chn")
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

End Sub
Private Sub CmdDelete_Click()
On Error GoTo Err_CmdDelete_Click

Dim rst As ADODB.Recordset
Set rst = New ADODB.Recordset

Dim blnRecordAdded As Boolean

If Not IsNull(c_personid) Then
    rst.Open "Del_Log", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
    rst.AddNew
    rst!c_personid = c_personid
    rst!c_subform = "STATUS"
    rst!c_flag = 1
    rst!c_status_code = c_status_code
    rst!c_sequence = c_sequence
    rst!c_firstyear = c_firstyear
    rst!c_lastyear = c_lastyear
    rst!c_fy_nh_code = c_fy_nh_code
    rst!c_ly_nh_code = c_ly_nh_code
    rst!c_fy_nh_yr = c_fy_nh_year
    rst!c_ly_nh_yr = c_ly_nh_year
    rst!c_fy_range = c_ly_range
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
Private Sub CmdAddNew_Click()
On Error GoTo Err_CmdAddNew_Click


    DoCmd.GoToRecord , , acNewRec

Exit_CmdAddNew_Click:
    Exit Sub

Err_CmdAddNew_Click:
    MsgBox Err.Description
    Resume Exit_CmdAddNew_Click

End Sub

Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 16) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

          Do While ti < 16 And Not .EOF
              If !c_form = "SF_STATUS" Then
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
        ElseIf gDisplayLanguage = "T" Then
             tLang = 2
        Else
             tLang = 3
        End If
        '
        ' now comes the basic routine
        '
        Me.LblSequence.Caption = tLabelLanguage(tLang, 1)
        Me.LblFirstyear.Caption = tLabelLanguage(tLang, 2)
        Me.LblFYNH.Caption = tLabelLanguage(tLang, 3)
        Me.LblFYRange.Caption = tLabelLanguage(tLang, 4)
        Me.LblLastyear.Caption = tLabelLanguage(tLang, 5)
        Me.LblLYNH.Caption = tLabelLanguage(tLang, 6)
        Me.LblLYRange.Caption = tLabelLanguage(tLang, 7)
        Me.LblPages.Caption = tLabelLanguage(tLang, 8)
        Me.LblNotes.Caption = tLabelLanguage(tLang, 9)
        Me.CmdPickSocDtn.Caption = tLabelLanguage(tLang, 10)
        Me.CmdPickFYNH.Caption = tLabelLanguage(tLang, 11)
        Me.CmdPickLYNH.Caption = tLabelLanguage(tLang, 12)
        Me.CmdPickSource.Caption = tLabelLanguage(tLang, 13)
        Me.CmdDelete.Caption = tLabelLanguage(tLang, 14)
        Me.CmdAddNew.Caption = tLabelLanguage(tLang, 15)
    End If

End Sub

Public Sub noEdits()

    Me.AllowAdditions = False
    Me.AllowDeletions = False
    Me.AllowEdits = False

End Sub

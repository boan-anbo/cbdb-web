Option Compare Database

Private Sub c_event_name_chn_AfterUpdate()

Dim intLastID As Long
Dim intID As Long

If IsNull(c_event_name_chn.Value) Or c_title_chn = "" Then
Else
     If IsNull(c_event_code.Value) Then
         intLastID = DMax("c_event_code", "TEXT_CODES")
         TxtLastID.Value = intLastID

          TxtLastID.Visible = True
          TxtLastID.SetFocus
          intID = TxtLastID.Value
          c_event_code.Value = intID + 1

        c_event_code.SetFocus
        TxtLastID.Visible = False
    End If
End If

     Dim rst As ADODB.Recordset
     Set rst = New ADODB.Recordset
     Dim strEVENT As String

     Dim strEVENT_Find As String
     Dim Counter As Long
     Dim intEVENT As Long

     Counter = 0

     strEVENT = c_event_name_chn.Value
     intEVENT = c_event_code.Value

     rst.Open "EVENT_CODES", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
     Do
        If rst.EOF = True Then
        Exit Do
        End If

       If IsNull(rst!c_event_name_chn.Value) Then
       Else
       strEVENT_Find = rst!c_event_name_chn.Value
       End If

       If StrComp(strEVENT_Find, strEVENT) = 0 Then
          If rst!c_event_code = intEVENT Then
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
     MsgBox "”µ“þŽì°l¬F" & Counter & "—lÊÂ¼þÃû·QÍêÈ«ÏàÍ¬µÄ¼oä›¡£Õˆ´_ÕJ éwÏÂÕýÔÚÝ”ÈëµÄÐÅÏ¢Åc”µ“þŽì¬FÓÐ”µ“þ›]ÓÐÖØÑ}
¡£   éwÏÂ¿ÉÒÔÊ¹ÓÃÓÒÉÏ·½µÄ²éÔƒ°´âo¡¢ÒÔÖÐÎÄÊÂ¼þÃû·QžéËÑË÷™Ú£¬²éÔƒ¬FÓÐ”µ“þ."
     End If


End Sub

Private Sub CmdDelete_Click()
On Error GoTo Err_CmdDelete_Click

Dim rst As ADODB.Recordset
Set rst = New ADODB.Recordset

Dim blnRecordAdded As Boolean

If Not IsNull(c_event_code) Then
'This If condition is to make sure that the record one is attempting to delete is not an empty record. Thus, the
field used in the condition must be a required field for the record.
    rst.Open "Del_Log", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
    rst.AddNew
    rst!c_event_code = c_event_code
    rst!c_subform = "EVENT_CODES EnterForm"
    rst!c_flag = 1
    rst!c_event_name_chn = c_event_name_chn
    rst!c_event_name = c_event_name
    rst!c_firstyear = c_fy_yr
    rst!c_fy_nh_code = c_fy_nh_code
    rst!c_fy_nh_yr = c_fy_nh_yr
    rst!c_fy_range = c_fy_range
    rst!c_lastyear = c_ly_yr
    rst!c_ly_nh_code = c_ly_nh_code
    rst!c_ly_range = c_ly_range
    rst!c_dy = c_dy
    rst!c_addr_id = c_addr_id
    rst!c_source = c_source
    rst!c_pages = c_pages
    rst!c_notes = c_event_notes

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

Private Sub CmdPickAddr_Click()
On Error GoTo Err_CmdPickAddr_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strNH As String

          c_addr_id.Visible = True
          c_addr_id.SetFocus
          strNH = c_addr_id.Text

    stDocName = "frmPickADDRESSES"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strNH

             If CurrentProject.AllForms("frmPickADDRESSES").IsLoaded Then
             Dim intNH As Integer
             Dim strNH_CHN As String

             Forms!frmPickADDRESSES!frmADDRESSES.Form!c_addr_id.SetFocus
             intNH = Forms!frmPickADDRESSES!frmADDRESSES.Form!c_addr_id.Value
             c_addr_id.Value = intNH

             Forms!frmPickADDRESSES!frmADDRESSES.Form!c_name_chn.SetFocus
             strNH_CHN = Forms!frmPickADDRESSES!frmADDRESSES.Form!c_name_chn.Value
             TxtADDR.Value = strNH_CHN

             DoCmd.Close acForm, stDocName
          End If

          CmdPickAddr.SetFocus
          c_addr_id.Visible = False

Exit_CmdPickAddr_Click:
    Exit Sub

Err_CmdPickAddr_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickAddr_Click
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

          CmdPickFYNH.SetFocus
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
Private Sub CmdAddNew_Click()
On Error GoTo Err_CmdAddNew_Click


    DoCmd.GoToRecord , , acNewRec

Exit_CmdAddNew_Click:
    Exit Sub

Err_CmdAddNew_Click:
    MsgBox Err.Description
    Resume Exit_CmdAddNew_Click

End Sub
Private Sub CmdOpenBIOG_MAIN_Click()
On Error GoTo Err_CmdOpenBIOG_MAIN_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "BIOG_MAIN"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdOpenBIOG_MAIN_Click:
    Exit Sub

Err_CmdOpenBIOG_MAIN_Click:
    MsgBox Err.Description
    Resume Exit_CmdOpenBIOG_MAIN_Click

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

    If IsNull(c_addr_id.Value) Then
        TxtADDR.Value = ""
    Else
           rst.Open "ADDRESSES", CurrentProject.Connection, adOpenDynamic, _
           adLockOptimistic
           rst.Find "c_addr_id = " & c_addr_id.Value

        TxtADDR.Value = rst.Fields("c_name_chn")
        rst.Close
    End If

    If IsNull(c_dy.Value) Then
         TxtDynastyCHN.Value = ""
    Else
         rst.Open "Dynasties", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_dy = " & c_dy.Value

        TxtDynastyCHN.Value = rst.Fields("c_dynasty_chn")
        rst.Close
    End If


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
Private Sub CmdOpenTEXTS_Click()
On Error GoTo Err_CmdOpenTEXTS_Click

    Dim stDocName As String
    Dim stLinkCriteria As String

    stDocName = "TEXTS EnterForm"
    DoCmd.OpenForm stDocName, , , stLinkCriteria

Exit_CmdOpenTEXTS_Click:
    Exit Sub

Err_CmdOpenTEXTS_Click:
    MsgBox Err.Description
    Resume Exit_CmdOpenTEXTS_Click

End Sub

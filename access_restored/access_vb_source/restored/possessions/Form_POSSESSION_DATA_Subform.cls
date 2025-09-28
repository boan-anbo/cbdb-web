Option Compare Database
Public gDisplayLanguage As String, gLabelsOK As Boolean

Private Sub c_possession_desc_chn_AfterUpdate()
    Dim intLastRecID As Long
    Dim intRecID As Long

    If IsNull(c_possession_record_id.Value) And Not IsNull(c_possession_desc_chn.Value) Then
        intLastRecID = DMax("c_possession_record_id", "POSSESSION_DATA")
        LastRecordID.Value = intLastRecID

        LastRecordID.Visible = True
        LastRecordID.SetFocus
        intRecID = LastRecordID.Value
        c_possession_record_id.Value = intRecID + 1

        c_possession_record_id.SetFocus
        LastRecordID.Visible = False
    End If
End Sub

Private Sub CmdPickAddr_Click()
On Error GoTo Err_CmdPickAddr_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strADDR As String

        c_addr_id.Visible = True
        c_addr_id.SetFocus
        strADDR = c_addr_id.Text

    stDocName = "frmPickADDRESSES"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strADDR

    If CurrentProject.AllForms("frmPickADDRESSES").IsLoaded Then
           Dim intAddr As Long
           Dim strADDR_CHN As String
           Dim strADDR_PY As String

           Forms!frmPickADDRESSES!frmADDRESSES.Form!c_addr_id.SetFocus
           intAddr = Forms!frmPickADDRESSES!frmADDRESSES.Form!c_addr_id.Value
           c_addr_id.Value = intAddr

           Forms!frmPickADDRESSES!frmADDRESSES.Form!c_name_chn.SetFocus
           strADDR_CHN = Forms!frmPickADDRESSES!frmADDRESSES.Form!c_name_chn.Value
           TxtAddrCHN.Value = strADDR_CHN

           Forms!frmPickADDRESSES!frmADDRESSES.Form!c_name.SetFocus
           strADDR_PY = Forms!frmPickADDRESSES!frmADDRESSES.Form!c_name.Value
           TxtAddrPY.Value = strADDR_PY

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

Private Sub CmdPickNH_Click()
On Error GoTo Err_CmdPickNH_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strNH As String

        c_possession_nh_code.Visible = True
        c_possession_nh_code.SetFocus
        strNH = c_possession_nh_code.Text

    stDocName = "frmPickNIAN_HAO"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strNH

             If CurrentProject.AllForms("frmPickNIAN_HAO").IsLoaded Then
             Dim intNH As Integer
             Dim strNH_CHN As String

             Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.SetFocus
             intNH = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.Value
             c_possession_nh_code.Value = intNH

             Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.SetFocus
             strNH_CHN = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.Value
             TxtNH.Value = strNH_CHN

             DoCmd.Close acForm, stDocName
          End If

          CmdPickNH.SetFocus
          c_possession_nh_code.Visible = False

Exit_CmdPickNH_Click:
    Exit Sub

Err_CmdPickNH_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickNH_Click

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

       If IsNull(c_possession_nh_code.Value) Then
            TxtNH.Value = ""
       Else
            rst.Open "nian_hao", CurrentProject.Connection, adOpenDynamic, _
            adLockOptimistic
            rst.Find "c_nianhao_id = " & c_possession_nh_code.Value

           TxtNH.Value = rst.Fields("c_nianhao_chn")
           rst.Close
       End If

       If IsNull(c_addr_id.Value) Then
            TxtAddrCHN.Value = ""
       Else
            rst.Open "ADDRESSES", CurrentProject.Connection, adOpenDynamic, _
            adLockOptimistic
            rst.Find "c_addr_id = " & c_addr_id.Value

           TxtAddrCHN.Value = rst.Fields("c_name_chn")
           rst.Close
       End If

       If IsNull(c_addr_id.Value) Then
            TxtAddrPY.Value = ""
       Else
            rst.Open "ADDRESSES", CurrentProject.Connection, adOpenDynamic, _
            adLockOptimistic
            rst.Find "c_addr_id = " & c_addr_id.Value

           TxtAddrPY.Value = rst.Fields("c_name")
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
Private Sub CmdAddNew_Click()
On Error GoTo Err_CmdAddNew_Click

       DoCmd.GoToRecord , , acNewRec

Exit_CmdAddNew_Click:
    Exit Sub

Err_CmdAddNew_Click:
    MsgBox Err.Description
    Resume Exit_CmdAddNew_Click

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
    rst!c_subform = "POSSESSIONS"
    rst!c_flag = 1
    rst!c_possession_act_code = c_possession_act_code
    rst!c_possession_desc_chn = c_possession_desc_chn
    rst!c_possession_desc = c_possession_desc
    rst!c_sequence = c_sequence
    rst!c_year = c_possession_yr
    rst!c_nh_code = c_possession_nh_code
    rst!c_nh_yr = c_possession_nh_yr
    rst!c_range = c_possession_yr_range
    rst!c_quantity = c_quantity
    rst!c_measure_code = c_measure_code
    rst!c_addr_id = c_addr_id
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

Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 18) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 18 And Not .EOF
             If !c_form = "SF_POS" Then
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
        Me.LblRecordID.Caption = tLabelLanguage(tLang, 2)
        Me.LblAct.Caption = tLabelLanguage(tLang, 3)
        Me.LblDescChn.Caption = tLabelLanguage(tLang, 4)
        Me.LblDesc.Caption = tLabelLanguage(tLang, 5)
        Me.LblQuantity.Caption = tLabelLanguage(tLang, 6)
        Me.LblUnit.Caption = tLabelLanguage(tLang, 7)
        Me.LblYear.Caption = tLabelLanguage(tLang, 8)
        Me.LblNHYear.Caption = tLabelLanguage(tLang, 9)
        Me.LblRange.Caption = tLabelLanguage(tLang, 10)
        Me.LblPages.Caption = tLabelLanguage(tLang, 11)
        Me.LblNotes.Caption = tLabelLanguage(tLang, 12)
        Me.CmdPickNH.Caption = tLabelLanguage(tLang, 13)
        Me.CmdPickAddr.Caption = tLabelLanguage(tLang, 14)
        Me.CmdPickSource.Caption = tLabelLanguage(tLang, 15)
        Me.CmdDelete.Caption = tLabelLanguage(tLang, 16)
        Me.CmdAddNew.Caption = tLabelLanguage(tLang, 17)
    End If

End Sub

Public Sub noEdits()

    Me.AllowAdditions = False
    Me.AllowDeletions = False
    Me.AllowEdits = False

End Sub

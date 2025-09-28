Option Compare Database
Public gDisplayLanguage As String, gLabelsOK As Boolean

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
         TxtAddrCHN.Value = ""
         TxtAddrPY.Value = ""
    Else
         rst.Open "ADDR_CODES", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
        rst.Find "c_addr_id = " & c_addr_id.Value

        TxtAddrCHN.Value = rst.Fields("c_name_chn")
        TxtAddrPY.Value = rst.Fields("c_name")
        rst.Close
    End If

End Sub
Private Sub CmdDelete_Click()
On Error GoTo Err_CmdDelete_Click

Dim rst As ADODB.Recordset
Set rst = New ADODB.Recordset

Dim blnRecordAdded As Boolean

If Not IsNull(c_addr_id) Then
'This If condition is to make sure that the record one is attempting to delete is not an empty record. Thus, the
field used in the condition must be a required field for the record.
    rst.Open "Del_Log", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
    rst.AddNew
    rst!c_personid = c_personid
    rst!c_subform = "POST_ADDR"
    rst!c_flag = 1
    rst!c_addr_id = c_addr_id
    rst!c_posting_id = c_posting_id
    rst!c_firstyear = c_firstyear
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
    Dim tLabelLanguage(3, 4) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 4 And Not .EOF
            If !c_form = "SF_PADDR" Then
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
        Me.CmdPickAddr.Caption = tLabelLanguage(tLang, 1)
        Me.CmdAddNew.Caption = tLabelLanguage(tLang, 2)
        Me.CmdDelete.Caption = tLabelLanguage(tLang, 3)
    End If

End Sub

Public Sub noEdits()

    Me.AllowAdditions = False
    Me.AllowDeletions = False
    Me.AllowEdits = False

End Sub

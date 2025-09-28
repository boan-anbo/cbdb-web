Option Compare Database

Private Sub CmdCancel_Click()
On Error GoTo Err_CmdCancel_Click


    DoCmd.Close

Exit_CmdCancel_Click:
    Exit Sub

Err_CmdCancel_Click:
    MsgBox Err.Description
    Resume Exit_CmdCancel_Click

End Sub

Private Sub CmdSelect_Click()
    Forms!frmPickPosting.Visible = False
End Sub

Private Sub Form_Open(Cancel As Integer)
   frmPosting.Form.OrderBy = "c_posting_id DESC"
   frmPosting.Form.OrderByOn = True

    If Not IsNull(Me.OpenArgs) Then
        Dim strPosting As String
        strPosting = Me.OpenArgs
        Dim rst As DAO.Recordset
        Set rst = frmPosting.Form.Recordset
        rst.FindFirst "c_posting_id = " & strPosting
    End If

End Sub
Private Sub CmdFind_Click()
On Error GoTo Err_CmdFind_Click

    Dim StrSearch As String
    Me.TxtSearch.SetFocus
    StrSearch = Me.TxtSearch.Value
    If StrSearch <> "" Then
       Dim rsPerson As DAO.Recordset
       Set rsPerson = frmPosting.Form.Recordset
       Dim StrSearchStr As String
       StrSearchStr = "c_name_chn = " + Chr(34) + StrSearch + Chr(34)
       rsPerson.FindFirst StrSearchStr
    End If

Exit_CmdFind_Click:
    Exit Sub

Err_CmdFind_Click:
    MsgBox Err.Description
    Resume Exit_CmdFind_Click

End Sub

Private Sub TxtSearch_Change()
    If Me.TxtSearch.Text = "" Then
         Me.CmdFind.Enabled = False
    Else
         Me.CmdFind.Enabled = True
    End If
End Sub

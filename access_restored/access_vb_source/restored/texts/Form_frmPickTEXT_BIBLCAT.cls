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
    Forms!frmPickTEXT_CAT.Visible = False
End Sub

Private Sub Form_Open(Cancel As Integer)
    If Not IsNull(Me.OpenArgs) Then
        Dim strTextCat As String
        strTextCat = Me.OpenArgs
        Dim rsTextCat As DAO.Recordset
        Set rsTextCat = frmTEXT_BIBLCAT.Form.Recordset
        rsTextCat.FindFirst "c_text_cat_code = " & strTextCat
    End If
End Sub

Private Sub TxtSearch_Change()
    If Me.TxtSearch.Text = "" Then
         Me.CmdFind.Enabled = False
    Else
         Me.CmdFind.Enabled = True
    End If
End Sub
Private Sub CmdFind_Click()
On Error GoTo Err_CmdFind_Click

    Dim StrSearch As String
    Me.TxtSearch.SetFocus
    StrSearch = Me.TxtSearch.Value
    If StrSearch <> "" Then
       Dim rsTextCat As DAO.Recordset
       Set rsTextCat = frmTEXT_CAT.Form.Recordset
       Dim StrSearchStr As String
       StrSearchStr = "c_text_cat_desc_chn = " + Chr(34) + StrSearch + Chr(34)
       rsTextCat.FindFirst StrSearchStr
    End If

Exit_CmdFind_Click:
    Exit Sub

Err_CmdFind_Click:
    MsgBox Err.Description
    Resume Exit_CmdFind_Click

End Sub

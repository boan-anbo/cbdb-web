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
On Error GoTo Err_CmdSelect_Click

    Dim tval As Integer

    Forms("frmPickChoronym").Visible = False


Exit_CmdSelect_Click:
    Exit Sub

Err_CmdSelect_Click:
    MsgBox Err.Description
    Resume Exit_CmdSelect_Click

End Sub

Private Sub Form_Open(Cancel As Integer)

   frmChoronyms.Form.OrderBy = "c_choronym_desc"
   frmChoronyms.Form.OrderByOn = True

   If Not IsNull(Me.OpenArgs) Then
        Dim strChoro As String
        strChoro = Me.OpenArgs
        Dim rsChoro As DAO.Recordset
        Set rsChoro = frmChoronyms.Form.Recordset
        rsChoro.FindFirst "c_choronym_code = " & strChoro
    End If
End Sub
Private Sub CmdFind_Click()
On Error GoTo Err_CmdFind_Click

    Dim StrSearch As String
    Me.TxtSearch.SetFocus
    StrSearch = Me.TxtSearch.Value
    If StrSearch <> "" Then
       Dim rsChoro As DAO.Recordset
       Set rsChoro = frmChoronyms.Form.Recordset
       Dim StrSearchStr As String
       StrSearchStr = "c_choronym_chn = " + Chr(34) + StrSearch + Chr(34)
       rsChoro.FindFirst StrSearchStr
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

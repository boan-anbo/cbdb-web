Option Compare Database

Private Sub CmdYes_Click()
On Error GoTo Err_CmdYes_Click


    c_list.Value = False
    Me.Visible = False

Exit_CmdYes_Click:
    Exit Sub

Err_CmdYes_Click:
    MsgBox Err.Description
    Resume Exit_CmdYes_Click

End Sub
Private Sub CmdCancel_Click()
On Error GoTo Err_CmdCancel_Click


    c_list.Value = True
    Me.Visible = False

Exit_CmdCancel_Click:
    Exit Sub

Err_CmdCancel_Click:
    MsgBox Err.Description
    Resume Exit_CmdCancel_Click

End Sub

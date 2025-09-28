Option Compare Database

Private Sub CmdOK_Click()
On Error GoTo Err_CmdOK_Click


    If Me.Dirty Then Me.Dirty = False
    DoCmd.Close

Exit_CmdOK_Click:
    Exit Sub

Err_CmdOK_Click:
    MsgBox Err.Description
    Resume Exit_CmdOK_Click

End Sub
Private Sub CmdCancel_Click()
On Error GoTo Err_CmdCancel_Click


    If Me.Dirty Then Me.Dirty = False
    DoCmd.Close

Exit_CmdCancel_Click:
    Exit Sub

Err_CmdCancel_Click:
    MsgBox Err.Description
    Resume Exit_CmdCancel_Click

End Sub

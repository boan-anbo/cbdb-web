Option Compare Database

Private Sub CmdClose_Click()
On Error GoTo Err_CmdClose_Click


    If Me.Dirty Then Me.Dirty = False
    DoCmd.Close

Exit_CmdClose_Click:
    Exit Sub

Err_CmdClose_Click:
    MsgBox Err.Description
    Resume Exit_CmdClose_Click

End Sub

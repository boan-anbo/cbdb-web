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


    Forms("frmChoronyms").Visible = False

Exit_CmdSelect_Click:
    Exit Sub

Err_CmdSelect_Click:
    MsgBox Err.Description
    Resume Exit_CmdSelect_Click

End Sub

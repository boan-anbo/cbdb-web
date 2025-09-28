Option Compare Database

Private Sub Command0_Click()
On Error GoTo Err_Command0_Click


    DoCmd.Close

Exit_Command0_Click:
    Exit Sub

Err_Command0_Click:
    MsgBox Err.Description
    Resume Exit_Command0_Click

End Sub

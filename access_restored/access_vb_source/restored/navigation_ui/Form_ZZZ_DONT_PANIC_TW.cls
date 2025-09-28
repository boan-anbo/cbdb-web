Option Compare Database

Private Sub CommandClose_Click()
On Error GoTo Err_CommandClose_Click


    DoCmd.Close

Exit_CommandClose_Click:
    Exit Sub

Err_CommandClose_Click:
    MsgBox Err.Description
    Resume Exit_CommandClose_Click

End Sub

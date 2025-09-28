Option Compare Database

Private Sub CmdOK_Click()
On Error GoTo Err_CmdOK_Click

    'Dim stDocName As String
    'Dim stLinkCriteria As String

    'stDocName = "POST_ADDR Subform"
    'DoCmd.OpenForm stDocName, , , stLinkCriteria

    Me.c_data_version.SetFocus
    If Len(Me.c_data_version.Text) = 0 Then
         MsgBox "Please provide a date, eg. 20180412"
    Else
         Me.Form.Visible = False
    End If

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
Private Sub CmdHelp_Click()
On Error GoTo Err_CmdHelp_Click


    MsgBox "The Data Version is the date that is part of the names of the three data files."

Exit_CmdHelp_Click:
    Exit Sub

Err_CmdHelp_Click:
    MsgBox Err.Description
    Resume Exit_CmdHelp_Click

End Sub
Private Sub Form_Open(Cancel As Integer)

    If Not IsNull(Me.OpenArgs) Then
        Dim strDataset As String
        strDataset = Me.OpenArgs
        Me.c_data_version.SetFocus
        Me.c_data_version.Value = strDataset
    End If
End Sub

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
    Forms!frmPickEVENT.Visible = False
End Sub

Private Sub Form_Open(Cancel As Integer)
       If Not IsNull(Me.OpenArgs) Then
            Dim strEVENT As String
            strEVENT = Me.OpenArgs
            Dim rsEvent As DAO.Recordset
            Set rsEvent = frmNIAN_HAO.Form.Recordset
            rsEvent.FindFirst "c_event_code = " & strEVENT
        End If

End Sub

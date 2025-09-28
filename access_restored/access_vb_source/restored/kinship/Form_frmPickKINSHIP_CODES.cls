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
    Forms!frmPickKINSHIP_CODES.Visible = False
End Sub

Private Sub Form_Open(Cancel As Integer)

          If Not IsNull(Me.OpenArgs) Then
              Dim strKIN As String
              strKIN = Me.OpenArgs
              Dim rsKin As DAO.Recordset
              Set rsKin = frmKINSHIP_CODES.Form.Recordset
              rsKin.FindFirst "c_kincode = " & strKIN
          End If
End Sub
Private Sub CmdFind_Click()
On Error GoTo Err_CmdFind_Click

    Dim StrSearch As String
    Me.TxtSearch.SetFocus
    StrSearch = Me.TxtSearch.Value
    If StrSearch <> "" Then
       Dim rsKinCodes As DAO.Recordset
       Set rsKinCodes = frmKINSHIP_CODES.Form.Recordset
       Dim StrSearchStr As String
       StrSearchStr = "c_kinrel_chn = " + Chr(34) + StrSearch + Chr(34)
       rsKinCodes.FindFirst StrSearchStr
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

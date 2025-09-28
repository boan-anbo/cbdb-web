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
    Forms!frmPickASSOC_CODES.Visible = False
End Sub

Private Sub Form_Open(Cancel As Integer)

   frmASSOC_CODES.Form.OrderBy = "c_sortorder"
   frmASSOC_CODES.Form.OrderByOn = True

              If Not IsNull(Me.OpenArgs) Then
              Dim strAssoc As String
              strAssoc = Me.OpenArgs
              Dim rsAssoc As DAO.Recordset
              Set rsAssoc = frmASSOC_CODES.Form.Recordset
              rsAssoc.FindFirst "c_assoc_code = " & strAssoc
          End If
End Sub
Private Sub CmdFind_Click()
On Error GoTo Err_CmdFind_Click

    Dim StrSearch As String
    Me.TxtSearch.SetFocus
    StrSearch = Me.TxtSearch.Value
    If StrSearch <> "" Then
       Dim rsAssocCodes As DAO.Recordset
       Set rsAssocCodes = frmASSOC_CODES.Form.Recordset
       Dim StrSearchStr As String
       StrSearchStr = "c_assoc_desc_chn = " + Chr(34) + StrSearch + Chr(34)
       rsAssocCodes.FindFirst StrSearchStr
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

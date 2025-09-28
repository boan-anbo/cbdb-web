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
    Forms!frmPickInst.Visible = False
End Sub

Private Sub Form_Open(Cancel As Integer)

   frmINST_CODES.Form.OrderBy = "c_inst_name_py"
   frmINST_CODES.Form.OrderByOn = True

              If Not IsNull(Me.OpenArgs) Then
              Dim strINST As String
              strINST = Me.OpenArgs
              Dim rsInst As DAO.Recordset
              Set rsInst = frmINST_CODES.Form.Recordset
              rsInst.FindFirst "c_inst_code = " & strINST
          End If

End Sub

Private Sub TxtSearch_Change()
    If Me.TxtSearch.Text = "" Then
         Me.CmdFind.Enabled = False
    Else
         Me.CmdFind.Enabled = True
    End If
End Sub
Private Sub CmdFind_Click()
On Error GoTo Err_CmdFind_Click

    Dim StrSearch As String
    Me.TxtSearch.SetFocus
    StrSearch = Me.TxtSearch.Value
    If StrSearch <> "" Then
       Dim rsInst As DAO.Recordset
       Set rsInst = frmINST_CODES.Form.Recordset
       Dim StrSearchStr As String
       StrSearchStr = "c_inst_name_hz = " + Chr(34) + StrSearch + Chr(34)
       rsInst.FindFirst StrSearchStr
    End If

Exit_CmdFind_Click:
    Exit Sub

Err_CmdFind_Click:
    MsgBox Err.Description
    Resume Exit_CmdFind_Click

End Sub

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


    Forms!frmpickdynasty.Visible = False

Exit_CmdSelect_Click:
    Exit Sub

Err_CmdSelect_Click:
    MsgBox Err.Description
    Resume Exit_CmdSelect_Click

End Sub

Private Sub Form_Open(Cancel As Integer)

   frmDYNASTIES.Form.OrderBy = "c_start"
   frmDYNASTIES.Form.OrderByOn = True

    If Not IsNull(Me.OpenArgs) Then
        Dim strDy As String
        strDy = Me.OpenArgs
        Dim rsDy As DAO.Recordset
        Set rsDy = frmDYNASTIES.Form.Recordset
        rsDy.FindFirst "c_dy = " & strDy
    End If

End Sub
Private Sub CmdFind_Click()
On Error GoTo Err_CmdFind_Click


    Dim StrSearch As String
    Me.TxtSearch.SetFocus
    StrSearch = Me.TxtSearch.Value
    If StrSearch <> "" Then
       Dim rsDy As DAO.Recordset
       Set rsDy = frmDYNASTIES.Form.Recordset
       Dim StrSearchStr As String
       StrSearchStr = "c_dynasty_chn = " + Chr(34) + StrSearch + Chr(34)
       rsDy.FindFirst StrSearchStr
       If rsDy.NoMatch Then
            StrSearchStr = "c_dynasty = " + Chr(34) + StrSearch + Chr(34)
            rsDy.FindFirst StrSearchStr
       End If
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

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
    Forms!frmPickScholarlyTopic.Visible = False
End Sub

Private Sub Form_Open(Cancel As Integer)

   frmScholarlyTopic.Form.OrderBy = "c_sortorder"
   frmScholarlyTopic.Form.OrderByOn = True

              If Not IsNull(Me.OpenArgs) Then
              Dim strTOPIC As String
              strTOPIC = Me.OpenArgs
              Dim rsTopic As DAO.Recordset
              Set rsTopic = frmScholarlyTopic.Form.Recordset
              rsTopic.FindFirst "c_topic_code = " & strTOPIC
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
       Dim rsTopic As DAO.Recordset
       Set rsTopic = frmScholarlyTopic.Form.Recordset
       Dim StrSearchStr As String
       StrSearchStr = "c_topic_desc_chn = " + Chr(34) + StrSearch + Chr(34)
       rsTopic.FindFirst StrSearchStr
    End If


Exit_CmdFind_Click:
    Exit Sub

Err_CmdFind_Click:
    MsgBox Err.Description
    Resume Exit_CmdFind_Click

End Sub

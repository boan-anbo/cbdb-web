Option Compare Database

Private Sub CmdClose_Click()
On Error GoTo Err_CmdClose_Click


    DoCmd.Close

Exit_CmdClose_Click:
    Exit Sub

Err_CmdClose_Click:
    MsgBox Err.Description
    Resume Exit_CmdClose_Click

End Sub
Private Sub CmdSelect_Click()
On Error GoTo Err_CmdSelect_Click

   Forms("frmPickPeople").Visible = False

Exit_CmdSelect_Click:
    Exit Sub

Err_CmdSelect_Click:
    MsgBox Err.Description
    Resume Exit_CmdSelect_Click

End Sub

Private Sub Form_Open(Cancel As Integer)
   frmPerson.Form.OrderBy = "c_name"
   frmPerson.Form.OrderByOn = True

    If Not IsNull(Me.OpenArgs) Then
        Dim strID As String
        strID = Me.OpenArgs
        Dim rst As DAO.Recordset
        Set rst = frmPerson.Form.Recordset
        rst.FindFirst "c_personid = " & strID
    End If

End Sub
Private Sub CmdFind_Click()
On Error GoTo Err_CmdFind_Click

    Dim StrSearchChn As String, StrSearchPY As String
    Dim StrSearchStr As String
    Dim rsPpl As DAO.Recordset

    Set rsPpl = frmPerson.Form.Recordset
    ' Me.TxtSearch.SetFocus
    StrSearchChn = Me.TxtSearch.Value
    StrSearchPY = Me.TxtSearchName.Value
    If StrSearchChn <> "" Then
       StrSearchStr = "c_name_chn = " + Chr(34) + StrSearchChn + Chr(34)
       rsPpl.FindFirst StrSearchStr
    ElseIf StrSearchPY <> "" Then
       StrSearchStr = "c_name = " + Chr(34) + StrSearchPY + Chr(34)
       rsPpl.FindFirst StrSearchStr
    End If
    frmPerson.Form.Refresh

Exit_CmdFind_Click:
    Exit Sub

Err_CmdFind_Click:
    MsgBox Err.Description
    Resume Exit_CmdFind_Click

End Sub

Private Sub TxtSearch_Change()
    If TxtSearch.Text = "" Then
         If TxtSearchName.Value = "" Then
             CmdFind.Enabled = False
         End If
    Else
         TxtSearchName.Value = ""
         CmdFind.Enabled = True
    End If
End Sub

Private Sub TxtSearchName_Change()
    If Me.TxtSearchName.Text = "" Then
         If TxtSearch.Value = "" Then
             Me.CmdFind.Enabled = False
         End If
    Else
         TxtSearch.Value = ""
         CmdFind.Enabled = True
    End If

End Sub

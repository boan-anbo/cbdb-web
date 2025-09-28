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

Private Sub CmdFilter_Click()
    Dim tStrFilterPY As String, tStrFilterChn As String, tStrFilter As String, tStrLen As String

    tStrFilter = ""

    'Me.TxtFilterChn.SetFocus
    If TxtFilterChn.Value <> "" Then
         tStrFilterChn = Trim(TxtFilterChn.Value)
         tStrLen = Str(LenB(tStrFilterChn))
         tStrFilter = "LeftB(c_name_chn," + tStrLen + ") = '" + tStrFilterChn + "'"
    Else
         'TxtFilterPY.SetFocus
         If TxtFilterPY.Value <> "" Then
             tStrFilterPY = Trim(TxtFilterPY.Value)
             tStrLen = Str(Len(tStrFilterPY))
             tStrFilter = "Left(c_name," + tStrLen + ") = '" + tStrFilterPY + "'"
         End If
    End If

    If tStrFilter <> "" Then
        Set cmdSQL = New ADODB.Command
        cmdSQL.ActiveConnection = CurrentProject.Connection
        cmdSQL.CommandType = adCmdText

           cmdSQL.CommandText = "Delete * from ZZ_ADDRESSES"
           cmdSQL.Execute tRecDeleted

           'MsgBox tStrSQL

           cmdSQL.CommandText = "INSERT INTO ZZ_ADDRESSES SELECT ZZZ_ADDR_BELONGS.* FROM ZZZ_ADDR_BELONGS " + _
               "WHERE ((" + tStrFilter + "))"
           cmdSQL.Execute tRecDeleted

          Dim rsAddr As DAO.Recordset
          Set rsAddr = CurrentDb.OpenRecordset("ZZ_ADDRESSES", dbOpenDynaset)
          Set frmADDRESSES.Form.Recordset = rsAddr

    End If

    CmdFilterClear.Enabled = True
    CmdSelectAllFiltered.Enabled = True

End Sub
Private Sub CmdFilterClear_Click()
    Dim rsAddr As DAO.Recordset
    Set rsAddr = CurrentDb.OpenRecordset("ZZZ_ADDR_BELONGS", dbOpenDynaset)
    Set frmADDRESSES.Form.Recordset = rsAddr

    CmdFilterClear.Enabled = False
    CmdSelectAllFiltered.Enabled = False

End Sub

Private Sub CmdSelect_Click()
    TxtAddrFilter.Value = False
    frmADDRESSES.SetFocus
    Forms!frmPickADDRESSES.Visible = False
End Sub

Private Sub CmdSelectAllFiltered_Click()
    '
    ' simply close the form: the receiving form will do the look-up
    '
    TxtAddrFilter.Value = True
    Forms!frmPickADDRESSES.Visible = False

End Sub

Private Sub Form_Open(Cancel As Integer)
    Dim cmdSQL As ADODB.Command
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    cmdSQL.CommandText = "Delete * from ZZ_ADDRESSES"
    cmdSQL.Execute tRecDeleted

   frmADDRESSES.Form.OrderBy = "c_name,c_name_chn,c_firstyear"
   frmADDRESSES.Form.OrderByOn = True

    If Not IsNull(Me.OpenArgs) Then
        Dim strADDR As String, rsAddr As DAO.Recordset
        strADDR = Me.OpenArgs

        Set rsAddr = frmADDRESSES.Form.Recordset
        rsAddr.FindFirst "c_addr_id = " & strADDR
    End If
    CmdSelectAllFiltered.Enabled = False
End Sub
Private Sub CmdFind_Click()
On Error GoTo Err_CmdFind_Click

    Dim tStrSearch As String, tStrSearchStr As String

    tStrSearchStr = ""

    Me.TxtSearchChn.SetFocus
    If TxtSearchChn.Text <> "" Then
         tStrSearch = Trim(TxtSearchChn.Text)
         tStrSearchStr = "c_name_chn = '" + tStrSearch + "'"
    Else
         TxtSearchPY.SetFocus
         If TxtSearchPY.Text <> "" Then
             tStrSearch = Trim(TxtSearchPY.Text)
             tStrSearchStr = "c_name = '" + tStrSearch + "'"
         End If
    End If

    If tStrSearchStr <> "" Then
       Dim rsAddr As DAO.Recordset
       Set rsAddr = frmADDRESSES.Form.Recordset

       rsAddr.FindFirst tStrSearchStr
    End If

Exit_CmdFind_Click:
    Exit Sub

Err_CmdFind_Click:
    MsgBox Err.Description
    Resume Exit_CmdFind_Click

End Sub

Private Sub TxtFilterPY_Change()
    If Me.TxtFilterPY.Text = "" Or IsNull(Me.TxtFilterPY.Text) Then
         If Me.TxtFilterChn.Value = "" Or IsNull(Me.TxtFilterChn.Value) Then
             Me.CmdFilter.Enabled = False
         End If
    Else
         Me.TxtFilterChn.Value = ""
         Me.CmdFilter.Enabled = True
    End If
End Sub

Private Sub TxtfilterChn_Change()

    If Me.TxtFilterChn.Text = "" Or IsNull(Me.TxtFilterChn.Text) Then
         If Me.TxtFilterPY.Value = "" Or IsNull(Me.TxtFilterPY.Value) Then
             Me.CmdFilter.Enabled = False
         End If
    Else
         Me.TxtFilterPY.Value = ""
        Me.CmdFilter.Enabled = True
    End If
End Sub

Private Sub TxtSearchPY_Change()

    If Me.TxtSearchPY.Text = "" Or IsNull(Me.TxtSearchPY.Text) Then
         If Me.TxtSearchChn.Value = "" Or IsNull(Me.TxtSearchChn.Value) Then
             Me.CmdFind.Enabled = False
         End If
    Else
         Me.TxtSearchChn.Value = ""
         Me.CmdFind.Enabled = True
    End If
End Sub
Private Sub TxtSearchChn_Change()

    If Me.TxtSearchChn.Text = "" Or IsNull(Me.TxtSearchChn.Text) Then
         If Me.TxtSearchPY.Value = "" Or IsNull(Me.TxtSearchPY.Value) Then
             Me.CmdFind.Enabled = False
         End If
    Else
         Me.TxtSearchPY.Value = ""
         Me.CmdFind.Enabled = True
    End If
End Sub

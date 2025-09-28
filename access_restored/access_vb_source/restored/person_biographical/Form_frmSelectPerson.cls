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

   Forms("frmSelectPerson").Visible = False

Exit_CmdSelect_Click:
    Exit Sub

Err_CmdSelect_Click:
    MsgBox Err.Description
    Resume Exit_CmdSelect_Click

End Sub

Private Sub Form_Open(Cancel As Integer)

    If Not IsNull(Me.OpenArgs) Then
        Dim strID As String
        strID = Me.OpenArgs
        Dim cmdSQL As ADODB.Command, tRecNum As Long

           Set cmdSQL = New ADODB.Command
           cmdSQL.ActiveConnection = CurrentProject.Connection
           cmdSQL.CommandType = adCmdText
           '
           cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
           cmdSQL.Execute tRecNum

         cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, c_in
dex_year_type_desc, " + _
                 "c_index_year_type_hz, c_dynasty, c_dynasty_chn, c_female ) " + _
             "SELECT ZZZ_BIOG_MAIN.c_personid, ZZZ_BIOG_MAIN.c_name, ZZZ_BIOG_MAIN.c_name_chn, ZZZ_BIOG_MAIN.c_ind
ex_year, " + _
                 "ZZZ_BIOG_MAIN.c_index_year_type_desc, ZZZ_BIOG_MAIN.c_index_year_type_hz, ZZZ_BIOG_MAIN.c_dynast
y, " + _
                 "ZZZ_BIOG_MAIN.c_dynasty_chn, ZZZ_BIOG_MAIN.c_female " + _
             "FROM ZZZ_BIOG_MAIN " + _
             "WHERE (((ZZZ_BIOG_MAIN.c_personid)=" + Trim(strID) + "))"
         cmdSQL.Execute tRecNum

        If tRecNum > 0 Then
            Set frmPersonSearch.Form.Recordset = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
        End If
    End If

End Sub
Private Sub CmdFind_Click()
On Error GoTo Err_CmdFind_Click

    Dim tRstSearch As DAO.Recordset, tStr As String, tQt As String, tQuery As QueryDef, tStrName As String
    Dim cmdSQL As ADODB.Command, tRecNum As Long

    ' the logic of search is to use the characters first, then the pinyin
    ' the search first looks at ZZZ_BIOG_MAIN's c_name and c_name_chn
    ' it then looks at c_name_proper and c_name_rm in ZZZ_BIOG_MAIN
    ' then it looks at ZZZ_ALTNAMES

    tQt = Chr(34)

    '     first make sure that the browser recordset is a dummy

    Set tRstSearch = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_PL", dbOpenDynaset)
    Set Me.frmPersonSearch.Form.Recordset = tRstSearch
    '   Now zap Z_NAME_SEARCH

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
    cmdSQL.Execute tRecNum

    cmdSQL.CommandText = "Delete * from Z_NAME_SEARCH"
    cmdSQL.Execute tRecNum

    ' now populate Z_NAME_SEARCH SELECT from ZZZ_NAMES

    If IsNull(TxtNameChn.Value) Then
         If IsNull(TxtName.Value) Then
              tStr = "Quit"
         Else
              If Me.TxtName.Value = "" Then
                   tStr = "Quit"
              Else
                   tStrName = TxtName.Value
                   If Left(tStrName, 1) = "!" Then
                        tStrName = Mid(TxtName.Value, 2)
                        tStr = " Left(c_name," + Str(Len(tStrName)) + ") = " + tQt + Trim(tStrName) + tQt
                   ElseIf UCase(Left(tStrName, 1)) = Left(tStrName, 1) Then
                        tStr = " Left(c_name," + Str(Len(tStrName)) + ") = " + tQt + Trim(tStrName) + tQt + _
                             " OR c_name LIKE " + tQt + "%" + " " + Trim(tStrName) + "%" + tQt
                   Else
                        tStr = " c_name LIKE " + tQt + "%" + Trim(tStrName) + "%" + tQt
                   End If
              End If
         End If
    Else
         If Me.TxtNameChn.Value = "" Then
              If IsNull(TxtName.Value) Then
                   tStr = "Quit"
              Else
                   If Me.TxtName.Value = "" Then
                        tStr = "Quit"
                   Else
                        tStrName = TxtName.Value
                        If Left(tStrName, 1) = "!" Then
                             tStrName = Mid(TxtName.Value, 2)
                             tStr = " Left(c_name," + Str(Len(tStrName)) + ") = " + tQt + Trim(tStrName) + tQt
                        ElseIf UCase(Left(tStrName, 1)) = Left(tStrName, 1) Then
                             tStr = " Left(c_name," + Str(Len(tStrName)) + ") = " + tQt + Trim(tStrName) + tQt + _
                                 " OR c_name LIKE " + tQt + "%" + " " + Trim(tStrName) + "%" + tQt
                        Else
                             tStr = " c_name LIKE " + tQt + "%" + Trim(tStrName) + "%" + tQt
                        End If
                   End If
              End If
         Else
              tStr = " c_name_chn LIKE " + tQt + "%" + Trim(TxtNameChn.Value) + "%" + tQt
         End If
    End If

    tRecNum = 0
    If Not (tStr = "Quit") Then
        tStr = "INSERT INTO Z_NAME_SEARCH SELECT c_personid, c_name, c_name_chn " + _
            "FROM ZZZ_NAMES WHERE" + tStr

        cmdSQL.CommandText = tStr
        cmdSQL.Execute tRecNum
    End If

    If tRecNum > 0 Then
         tStr = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_name, c_name_chn, c_index_year, c_index_year_type_
desc, " + _
                 "c_index_year_type_hz, c_dynasty, c_dynasty_chn, c_female ) " + _
             "SELECT ZZZ_BIOG_MAIN.c_personid, ZZZ_BIOG_MAIN.c_name, ZZZ_BIOG_MAIN.c_name_chn, ZZZ_BIOG_MAIN.c_ind
ex_year, " + _
                 "ZZZ_BIOG_MAIN.c_index_year_type_desc, ZZZ_BIOG_MAIN.c_index_year_type_hz, ZZZ_BIOG_MAIN.c_dynast
y, " + _
                 "ZZZ_BIOG_MAIN.c_dynasty_chn, ZZZ_BIOG_MAIN.c_female " + _
             "FROM Z_NAME_SEARCH INNER JOIN ZZZ_BIOG_MAIN ON Z_NAME_SEARCH.c_personid = ZZZ_BIOG_MAIN.c_personid"

         cmdSQL.CommandText = tStr
         cmdSQL.Execute tRecNum

        Set tRstSearch = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
    End If
    ' tRstSearch.Index = "c_name"
    Set Me.frmPersonSearch.Form.Recordset = tRstSearch

Exit_CmdFind_Click:
    Exit Sub

Err_CmdFind_Click:
    MsgBox Err.Description
    Resume Exit_CmdFind_Click

End Sub

Private Sub TxtNameChn_Change()
    If TxtNameChn.Text = "" Then
         If TxtName.Value = "" Then
             CmdFind.Enabled = False
         End If
    Else
         TxtName.Value = ""
         CmdFind.Enabled = True
    End If
End Sub

Private Sub TxtName_Change()
    If Me.TxtName.Text = "" Then
         If TxtNameChn.Value = "" Then
             Me.CmdFind.Enabled = False
         End If
    Else
         TxtNameChn.Value = ""
         CmdFind.Enabled = True
    End If

End Sub
Form_frmSTATUS_CODES - 1

Option Compare Database

Private Sub c_status_code_Click()
    Dim tRst As DAO.Recordset

    Set tRst = Me.Recordset
    Forms!frmPickStatus2.Form!TxtStatusID.Value = tRst!c_status_code
    Forms!frmPickStatus2.Form!TxtStatusDesc.Value = tRst!c_status_desc
    Forms!frmPickStatus2.Form!TxtStatusDescChn.Value = tRst!c_status_desc_chn
    Forms!frmPickStatus2.Form!TxtTypeID.Value = "000"
    Forms!frmPickStatus2.Form!TxtTypeDescChn.Value = ""
    Forms!frmPickStatus2.Form!TxtTypeDesc.Value = ""
    Me.DatasheetBackColor = RGB(255, 255, 255)
    Me.DatasheetForeColor = RGB(0, 0, 0)
    Forms!frmPickStatus2.Form!CmdSelectAll.Caption = "Select All"
    Forms!frmPickStatus2.Form!CmdSelectAll.Enabled = True
    Forms!frmPickStatus2.Form!CmdSelect.Enabled = True
    Set tRst = Nothing

End Sub

Private Sub c_status_desc_chn_Click()
    Dim tRst As DAO.Recordset

    Set tRst = Me.Recordset
    Forms!frmPickStatus2.Form!TxtStatusID.Value = tRst!c_status_code
    Forms!frmPickStatus2.Form!TxtStatusDesc.Value = tRst!c_status_desc
    Forms!frmPickStatus2.Form!TxtStatusDescChn.Value = tRst!c_status_desc_chn
    Forms!frmPickStatus2.Form!TxtTypeID.Value = "000"
    Forms!frmPickStatus2.Form!TxtTypeDescChn.Value = ""
    Forms!frmPickStatus2.Form!TxtTypeDesc.Value = ""
    Me.DatasheetBackColor = RGB(255, 255, 255)
    Me.DatasheetForeColor = RGB(0, 0, 0)
    Forms!frmPickStatus2.Form!CmdSelectAll.Caption = "Select All"
    Forms!frmPickStatus2.Form!CmdSelectAll.Enabled = True
    Forms!frmPickStatus2.Form!CmdSelect.Enabled = True
    Set tRst = Nothing

End Sub

Private Sub c_status_desc_Click()
    Dim tRst As DAO.Recordset

    Set tRst = Me.Recordset
    Forms!frmPickStatus2.Form!TxtStatusID.Value = tRst!c_status_code
    Forms!frmPickStatus2.Form!TxtStatusDesc.Value = tRst!c_status_desc
    Forms!frmPickStatus2.Form!TxtStatusDescChn.Value = tRst!c_status_desc_chn
    Forms!frmPickStatus2.Form!TxtTypeID.Value = "000"
    Forms!frmPickStatus2.Form!TxtTypeDesc.Value = ""
    Forms!frmPickStatus2.Form!TxtTypeDescChn.Value = ""
    Me.DatasheetBackColor = RGB(255, 255, 255)
    Me.DatasheetForeColor = RGB(0, 0, 0)
    Forms!frmPickStatus2.Form!CmdSelectAll.Caption = "Select All"
    Forms!frmPickStatus2.Form!CmdSelectAll.Enabled = True
    Forms!frmPickStatus2.Form!CmdSelect.Enabled = True
    Set tRst = Nothing

End Sub

Option Compare Database
Public gSelectCount As Integer

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

          cmdSQL.CommandText = "Delete * from ZZ_ADDRESSES_TMP"
          cmdSQL.Execute tRecDeleted

          'MsgBox tStrSQL

         cmdSQL.CommandText = "INSERT INTO ZZ_ADDRESSES_TMP ( c_addr_id, c_name, c_name_chn, c_admin_type, c_first
year, c_lastyear, x_coord, y_coord, " + _
             "belongs_to_ID, belongs_to_py, belongs_to_chn ) " + _
             "SELECT ZZZ_ADDR_BELONGS.c_addr_id, ZZZ_ADDR_BELONGS.c_name, ZZZ_ADDR_BELONGS.c_name_chn, ZZZ_ADDR_BE
LONGS.c_admin_type, " + _
                     "ZZZ_ADDR_BELONGS.c_firstyear, ZZZ_ADDR_BELONGS.c_lastyear, ZZZ_ADDR_BELONGS.x_coord, ZZZ_ADD
R_BELONGS.y_coord, " + _
                 "   ZZZ_ADDR_BELONGS.belongs_to_ID, ZZZ_ADDR_BELONGS.belongs_to_py, ZZZ_ADDR_BELONGS.belongs_to_c
hn " + _
             "FROM ZZZ_ADDR_BELONGS " + _
             "WHERE ((" + tStrFilter + "))"
         cmdSQL.Execute tRecDeleted

          ListAddr.Requery
          'For ti = 0 To ListAddr.ListCount
          '    ListAddr.Selected(ti) = False
          'Next ti
          gSelectCount = 0

    End If

    CmdFilterClear.Enabled = True
    CmdSelectAllFiltered.Enabled = True

End Sub
Private Sub CmdFilterClear_Click()
    Dim cmdSQL As ADODB.Command, tRecDeleted As Long, ti As Long

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    cmdSQL.CommandText = "Delete * from ZZ_ADDRESSES_TMP"
    cmdSQL.Execute tRecDeleted

    cmdSQL.CommandText = "INSERT INTO ZZ_ADDRESSES_TMP ( c_addr_id, c_name, c_name_chn, c_admin_type, c_firstyear
, c_lastyear, x_coord, y_coord, " + _
        "belongs_to_ID, belongs_to_py, belongs_to_chn ) " + _
        "SELECT ZZZ_ADDR_BELONGS.c_addr_id, ZZZ_ADDR_BELONGS.c_name, ZZZ_ADDR_BELONGS.c_name_chn, ZZZ_ADDR_BELONG
S.c_admin_type, " + _
                "ZZZ_ADDR_BELONGS.c_firstyear, ZZZ_ADDR_BELONGS.c_lastyear, ZZZ_ADDR_BELONGS.x_coord, ZZZ_ADDR_BE
LONGS.y_coord, " + _
                "ZZZ_ADDR_BELONGS.belongs_to_ID, ZZZ_ADDR_BELONGS.belongs_to_py, ZZZ_ADDR_BELONGS.belongs_to_chn
" + _
        "FROM ZZZ_ADDR_BELONGS"
    cmdSQL.Execute tRecDeleted

    ListAddr.Requery
    gSelectCount = 0

    CmdFilterClear.Enabled = False
    CmdSelectAllFiltered.Enabled = False

End Sub

Private Sub CmdSelect_Click()
    Dim cmdSQL As ADODB.Command, tRst As DAO.Recordset, varItm As Variant, ti As Long

    CmdSelect.Enabled = False

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    cmdSQL.CommandText = "DELETE * FROM ZZ_ADDRESSES"
    cmdSQL.Execute tRecCount

    TxtSelectCount.Value = gSelectCount

    '     first copy the records over to a scratch table

    Set tRst = CurrentDb.OpenRecordset("ZZ_ADDRESSES", dbOpenDynaset)
    For Each varItm In ListAddr.ItemsSelected
        tRst.AddNew
        tRst!c_addr_id = ListAddr.Column(9, varItm)
        tRst!c_name = ListAddr.Column(0, varItm)
        tRst!c_name_chn = ListAddr.Column(1, varItm)
        tRst!c_admin_type = ListAddr.Column(2, varItm)
        tRst!c_firstyear = ListAddr.Column(3, varItm)
        tRst!c_lastyear = ListAddr.Column(4, varItm)
        If Not (ListAddr.Column(5, varItm) = "") Then
            tRst!x_coord = ListAddr.Column(5, varItm)
            tRst!y_coord = ListAddr.Column(6, varItm)
        End If
        tRst!belongs_to_py = ListAddr.Column(7, varItm)
        tRst!belongs_to_chn = ListAddr.Column(8, varItm)
        tRst.Update
    Next varItm
    tRst.Close

    ListAddr.Requery
    gSelectCount = 0

    TxtAddrFilter.Value = False
    Forms!frmPickAddresses_multi.Visible = False
End Sub

Private Sub CmdSelectAllFiltered_Click()
    Dim cmdSQL As ADODB.Command, tRecDeleted As Long, ti As Long
    '
    ' copy ZZ_ADDRESSES_TMP into ZZ_ADDRESSES
    '
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    cmdSQL.CommandText = "Delete * from ZZ_ADDRESSES"
    cmdSQL.Execute tRecDeleted

    cmdSQL.CommandText = "INSERT INTO ZZ_ADDRESSES ( c_addr_id, c_name, c_name_chn, c_admin_type, c_firstyear, c_
lastyear, " + _
        "x_coord, y_coord, belongs_to_ID, belongs_to_py, belongs_to_chn ) " + _
        "SELECT ZZ_ADDRESSES_TMP.c_addr_id, ZZ_ADDRESSES_TMP.c_name, ZZ_ADDRESSES_TMP.c_name_chn, ZZ_ADDRESSES_TM
P.c_admin_type, " + _
            "ZZ_ADDRESSES_TMP.c_firstyear, ZZ_ADDRESSES_TMP.c_lastyear, ZZ_ADDRESSES_TMP.x_coord, ZZ_ADDRESSES_TM
P.y_coord, " + _
            "ZZ_ADDRESSES_TMP.belongs_to_ID, ZZ_ADDRESSES_TMP.belongs_to_py, ZZ_ADDRESSES_TMP.belongs_to_chn " +
_
        "FROM ZZ_ADDRESSES_TMP"
    cmdSQL.Execute tRecDeleted

    TxtAddrFilter.Value = True
    Forms!frmPickAddresses_multi.Visible = False

End Sub

Private Sub Form_Open(Cancel As Integer)
    Dim cmdSQL As ADODB.Command, tRecDeleted As Long, ti As Long

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    cmdSQL.CommandText = "Delete * from ZZ_ADDRESSES_TMP"
    cmdSQL.Execute tRecDeleted

    cmdSQL.CommandText = "INSERT INTO ZZ_ADDRESSES_TMP ( c_addr_id, c_name, c_name_chn, c_admin_type, c_firstyear
, c_lastyear, x_coord, y_coord, " + _
        "belongs_to_ID, belongs_to_py, belongs_to_chn ) " + _
        "SELECT ZZZ_ADDR_BELONGS.c_addr_id, ZZZ_ADDR_BELONGS.c_name, ZZZ_ADDR_BELONGS.c_name_chn, ZZZ_ADDR_BELONG
S.c_admin_type, " + _
                "ZZZ_ADDR_BELONGS.c_firstyear, ZZZ_ADDR_BELONGS.c_lastyear, ZZZ_ADDR_BELONGS.x_coord, ZZZ_ADDR_BE
LONGS.y_coord, " + _
                "ZZZ_ADDR_BELONGS.belongs_to_ID, ZZZ_ADDR_BELONGS.belongs_to_py, ZZZ_ADDR_BELONGS.belongs_to_chn
" + _
        "FROM ZZZ_ADDR_BELONGS"
    cmdSQL.Execute tRecDeleted

    ListAddr.Requery
    'For ti = 0 To ListAddr.ListCount
    '    ListAddr.Selected(ti) = False
    'Next ti

    gSelectCount = 0

    If Not IsNull(Me.OpenArgs) Then
        Dim strADDR As String, rsAddr As DAO.Recordset
        strADDR = Me.OpenArgs

    End If
    CmdSelectAllFiltered.Enabled = False
End Sub


Private Sub ListAddr_Click()
    Dim ti As Long, tUnclicked As Boolean
    Dim varItm As Variant

    gSelectCount = 0
    For Each varItm In ListAddr.ItemsSelected
        gSelectCount = gSelectCount + 1
    Next varItm
    'MsgBox ListAddr.Column(1, ti + 1) + ": Select Count = " + Str(gSelectCount)

    If gSelectCount = 0 Then
         Me.CmdSelect.Enabled = False
    Else
         Me.CmdSelect.Enabled = True
    End If

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

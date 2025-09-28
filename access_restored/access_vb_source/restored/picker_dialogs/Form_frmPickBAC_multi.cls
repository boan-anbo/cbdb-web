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


Private Sub CmdSelect_Click()
    Dim cmdSQL As ADODB.Command, tRst As DAO.Recordset, varItm As Variant, ti As Integer

    CmdSelect.Enabled = False

    'MsgBox "gSelectCount = " + Str(gSelectCount) + " and ListCount = " + Str(ListBAC.ListCount)

    gSelectCount = 0

    For Each varItm In ListBAC.ItemsSelected
        gSelectCount = gSelectCount + 1
    Next varItm

    If gSelectCount = ListBAC.ListCount Then
         TxtSelectAll.Value = True
    Else
         TxtSelectAll.Value = False
    End If

    If gSelectCount > 0 And gSelectCount < ListBAC.ListCount Then

          Set cmdSQL = New ADODB.Command
          cmdSQL.ActiveConnection = CurrentProject.Connection
          cmdSQL.CommandType = adCmdText

          cmdSQL.CommandText = "DELETE * FROM ZZ_BIOG_ADDR_CODES"
          cmdSQL.Execute tRecCount

          TxtSelectCount.Value = gSelectCount

          '   first copy the records over to a scratch table

          'MsgBox "copying codes"

          Set tRst = CurrentDb.OpenRecordset("ZZ_BIOG_ADDR_CODES", dbOpenDynaset)
          For Each varItm In ListBAC.ItemsSelected
              tRst.AddNew
              tRst!c_addr_type = ListBAC.Column(2, varItm)
              tRst!c_addr_desc = ListBAC.Column(0, varItm)
              tRst!c_addr_desc_chn = ListBAC.Column(1, varItm)
              tRst.Update
          Next varItm
          tRst.Close

    End If

    ListBAC.Requery
    'For ti = 0 To ListBAC.ListCount
    '    ListBAC.Selected(ti) = False
    'Next ti
    gSelectCount = 0


    Forms!frmPickBAC_multi.Visible = False
End Sub

Private Sub CmdSelectAll_Click()
    '
    If CmdSelectAll.Caption = "Select All" Then
        CmdSelectAll.Caption = "De-select All"
           For ti = 0 To ListBAC.ListCount
               ListBAC.Selected(ti) = True
           Next ti

           gSelectCount = ListBAC.ListCount
           CmdSelect.Enabled = True
           TxtSelectAll.Value = True
    Else
        TxtSelectAll.Value = False
        CmdSelectAll.SetFocus
        Clear_SelectAll
    End If
End Sub
Private Sub Clear_SelectAll()
    CmdSelectAll.Caption = "Select All"
    '
    ' reset the form colors
    '
    For ti = 0 To ListBAC.ListCount
        ListBAC.Selected(ti) = False
    Next ti

    gSelectCount = 0
    CmdSelect.Enabled = False
End Sub

Private Sub Form_Open(Cancel As Integer)
    'Dim cmdSQL As ADODB.Command, tRecDeleted As Long, ti As Long

    'Set cmdSQL = New ADODB.Command
    'cmdSQL.ActiveConnection = CurrentProject.Connection
    'cmdSQL.CommandType = adCmdText

    'cmdSQL.CommandText = "Delete * from ZZ_BIOG_ADDR_CODES_TMP"
    'cmdSQL.Execute tRecDeleted

    'cmdSQL.CommandText = "INSERT INTO ZZ_BIOG_ADDR_CODES_TMP ( c_addr_type, c_addr_desc, c_addr_desc_chn ) " + _
        "SELECT BIOG_ADDR_CODES.c_addr_type, BIOG_ADDR_CODES.c_addr_desc, BIOG_ADDR_CODES.c_addr_desc_chn " + _
        "FROM BIOG_ADDR_CODES"
    'cmdSQL.Execute tRecDeleted

    ListBAC.Requery
    'For ti = 0 To ListBAC.ListCount
    '    ListBAC.Selected(ti) = False
    'Next ti

    TxtSelectAll.Value = False
    gSelectCount = 0

End Sub

Private Sub ListBAC_Click()
    Dim ti As Long, tUnclicked As Boolean
    Dim varItm As Variant

    'MsgBox "gSelectCount = " + Str(gSelectCount)

    ' this routine will just brute-force the count

    gSelectCount = 0
    For Each varItm In ListBAC.ItemsSelected
        gSelectCount = gSelectCount + 1
    Next varItm

    'MsgBox "gSelectCount = " + Str(gSelectCount)

    If gSelectCount = 0 Then
         Me.CmdSelect.Enabled = False
    Else
         Me.CmdSelect.Enabled = True
    End If

    If gSelectCount = ListBAC.ListCount Then
         TxtSelectAll.Value = True
    Else
         TxtSelectAll.Value = False
    End If

End Sub

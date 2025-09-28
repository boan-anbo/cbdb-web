
Option Compare Database


Private Sub c_desc_chn_Click()
    Dim tRst As DAO.Recordset

    Set tRst = Me.Recordset
    Forms!frmPickEntry.Form!TxtEntryCode.Value = tRst!c_entry_code
    Forms!frmPickEntry.Form!TxtEntryDesc.Value = tRst!c_entry_desc
    Forms!frmPickEntry.Form!TxtEntryChn.Value = tRst!c_entry_desc_chn
    Forms!frmPickEntry.Form!TxtTypeID.Value = ""
    Forms!frmPickEntry.Form!TxtTypeDesc.Value = ""
    Forms!frmPickEntry.Form!TxtTypeChn.Value = ""
    Me.DatasheetBackColor = RGB(255, 255, 255)
    Me.DatasheetForeColor = RGB(0, 0, 0)
    Forms!frmPickEntry.Form!CmdSelectAll.Caption = "Select All"
    Forms!frmPickEntry.Form!CmdSelectAll.Enabled = True
    Forms!frmPickEntry.Form!CmdSelect.Enabled = True
    Set tRst = Nothing
End Sub

Private Sub c_desc_Click()
    Dim tRst As DAO.Recordset

    Set tRst = Me.Recordset
    Forms!frmPickEntry.Form!TxtEntryCode.Value = tRst!c_entry_code
    Forms!frmPickEntry.Form!TxtEntryDesc.Value = tRst!c_entry_desc
    Forms!frmPickEntry.Form!TxtEntryChn.Value = tRst!c_entry_desc_chn
    Forms!frmPickEntry.Form!TxtTypeID.Value = ""
    Forms!frmPickEntry.Form!TxtTypeDesc.Value = ""
    Forms!frmPickEntry.Form!TxtTypeChn.Value = ""
    Me.DatasheetBackColor = RGB(255, 255, 255)
    Me.DatasheetForeColor = RGB(0, 0, 0)
    Forms!frmPickEntry.Form!CmdSelectAll.Caption = "Select All"
    Forms!frmPickEntry.Form!CmdSelectAll.Enabled = True
    Forms!frmPickEntry.Form!CmdSelect.Enabled = True
    Set tRst = Nothing
End Sub

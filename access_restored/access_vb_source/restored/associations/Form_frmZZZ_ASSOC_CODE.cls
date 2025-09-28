Option Compare Database

Private Sub c_assoc_desc_chn_Click()
    Dim tRst As DAO.Recordset

    Set tRst = Me.Recordset
    Forms!frmPickAssoc2.Form!TxtAssocID.Value = tRst!c_assoc_code
    Forms!frmPickAssoc2.Form!TxtAssocDesc.Value = tRst!c_assoc_desc
    Forms!frmPickAssoc2.Form!TxtAssocDescChn.Value = tRst!c_assoc_desc_chn
    Forms!frmPickAssoc2.Form!TxtTypeID.Value = "000"
    Forms!frmPickAssoc2.Form!TxtTypeDescChn.Value = ""
    Forms!frmPickAssoc2.Form!TxtTypeDesc.Value = ""
    Me.DatasheetBackColor = RGB(255, 255, 255)
    Me.DatasheetForeColor = RGB(0, 0, 0)
    Forms!frmPickAssoc2.Form!CmdSelectAll.Caption = "Select All"
    Forms!frmPickAssoc2.Form!CmdSelectAll.Enabled = True
    Forms!frmPickAssoc2.Form!CmdSelect.Enabled = True
    Set tRst = Nothing

End Sub

Private Sub c_assoc_desc_Click()
    Dim tRst As DAO.Recordset

    Set tRst = Me.Recordset
    Forms!frmPickAssoc2.Form!TxtAssocID.Value = tRst!c_assoc_code
    Forms!frmPickAssoc2.Form!TxtAssocDesc.Value = tRst!c_assoc_desc
    Forms!frmPickAssoc2.Form!TxtAssocDescChn.Value = tRst!c_assoc_desc_chn
    Forms!frmPickAssoc2.Form!TxtTypeID.Value = "000"
    Forms!frmPickAssoc2.Form!TxtTypeDesc.Value = ""
    Forms!frmPickAssoc2.Form!TxtTypeDescChn.Value = ""
    Me.DatasheetBackColor = RGB(255, 255, 255)
    Me.DatasheetForeColor = RGB(0, 0, 0)
    Forms!frmPickAssoc2.Form!CmdSelectAll.Caption = "Select All"
    Forms!frmPickAssoc2.Form!CmdSelectAll.Enabled = True
    Forms!frmPickAssoc2.Form!CmdSelect.Enabled = True
    Set tRst = Nothing

End Sub
Form_frmZZZ_ENTRY_CODE - 1

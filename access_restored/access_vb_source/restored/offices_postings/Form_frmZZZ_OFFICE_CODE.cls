Option Compare Database

Private Sub c_office_desc_chn_Click()
    Dim tRst As DAO.Recordset

    Set tRst = Me.Recordset
    Forms!frmPickOfficeTree.Form!TxtOfficeCode.Value = tRst!c_office_id
    Forms!frmPickOfficeTree.Form!TxtOfficeDesc.Value = tRst!c_office_trans
    Forms!frmPickOfficeTree.Form!TxtOfficeDescChn.Value = tRst!c_office_chn
    Forms!frmPickOfficeTree.Form!TxtTypeDescChn.Value = ""
    Forms!frmPickOfficeTree.Form!TxtTypeDesc.Value = ""
    Me.DatasheetBackColor = RGB(255, 255, 255)
    Me.DatasheetForeColor = RGB(0, 0, 0)
    Forms!frmPickOfficeTree.Form!CmdSelectAll.Caption = "Select All"
    Forms!frmPickOfficeTree.Form!CmdSelectAll.Enabled = True
    Forms!frmPickOfficeTree.Form!CmdSelect.Enabled = True
    Set tRst = Nothing

End Sub

Private Sub c_office_desc_Click()
    Dim tRst As DAO.Recordset

    Set tRst = Me.Recordset
    Forms!frmPickOfficeTree.Form!TxtOfficeCode.Value = tRst!c_office_id
    Forms!frmPickOfficeTree.Form!TxtOfficeDesc.Value = tRst!c_office_trans
    Forms!frmPickOfficeTree.Form!TxtOfficeDescChn.Value = tRst!c_office_chn
    Forms!frmPickOfficeTree.Form!TxtTypeDescChn.Value = ""
    Forms!frmPickOfficeTree.Form!TxtTypeDesc.Value = ""
    Me.DatasheetBackColor = RGB(255, 255, 255)
    Me.DatasheetForeColor = RGB(0, 0, 0)
    Forms!frmPickOfficeTree.Form!CmdSelectAll.Caption = "Select All"
    Forms!frmPickOfficeTree.Form!CmdSelectAll.Enabled = True
    Forms!frmPickOfficeTree.Form!CmdSelect.Enabled = True
    Set tRst = Nothing

End Sub

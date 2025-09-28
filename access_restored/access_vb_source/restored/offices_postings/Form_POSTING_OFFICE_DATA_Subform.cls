Option Compare Database
Public gDisplayLanguage As String, gLabelsOK As Boolean

Private Sub Form_Current()

    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    If IsNull(c_fy_nh_code.Value) Then
         TxtFYNH.Value = ""
    Else
         rst.Open "nian_hao", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_nianhao_id = " & c_fy_nh_code.Value

        TxtFYNH.Value = rst.Fields("c_nianhao_chn")
        rst.Close
    End If

    If IsNull(c_ly_nh_code.Value) Then
         TxtLYNH.Value = ""
    Else
         rst.Open "nian_hao", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_nianhao_id = " & c_ly_nh_code.Value

        TxtLYNH.Value = rst.Fields("c_nianhao_chn")
        rst.Close
    End If

    If IsNull(c_source.Value) Then
         TxtTitle_CHN.Value = ""
    Else
         rst.Open "TEXT_CODES", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_textid = " & c_source.Value

        TxtTitle_CHN.Value = rst.Fields("c_title_chn")
        rst.Close
    End If

    If IsNull(CmbApptType.Value) Then
         TxtApptType.Value = ""
    Else
         rst.Open "APPOINTMENT_CODES", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_appt_code = " & CmbApptType.Value

        TxtApptType.Value = rst.Fields("c_appt_desc_chn")
        rst.Close
    End If

    If IsNull(c_office_category_id.Value) Then
         Me.TxtCatDesc.Value = ""
         Me.TxtCatDescChn.Value = ""
    Else
         rst.Open "OFFICE_CATEGORIES", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_office_category_id = " & c_office_category_id.Value

        TxtCatDescChn.Value = rst.Fields("c_category_desc_chn")
        TxtCatDesc.Value = rst.Fields("c_category_desc")
        rst.Close
    End If

End Sub


Private Sub CmdDelete_Click()
On Error GoTo Err_CmdDelete_Click


    DoCmd.RunCommand acCmdSelectRecord
    DoCmd.RunCommand acCmdDeleteRecord

Exit_CmdDelete_Click:
    Exit Sub

Err_CmdDelete_Click:
    MsgBox Err.Description
    Resume Exit_CmdDelete_Click

End Sub
Private Sub CmdAddNew_Click()
On Error GoTo Err_CmdAddNew_Click


    DoCmd.GoToRecord , , acNewRec

Exit_CmdAddNew_Click:
    Exit Sub

Err_CmdAddNew_Click:
    MsgBox Err.Description
    Resume Exit_CmdAddNew_Click

End Sub

Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 23) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 23 And Not .EOF
             If !c_form = "SF_POFF" Then
                 gLabelsOK = True
                 If ti <> !c_label_id Then
                     MsgBox "Uh oh: mismatched label table"
                     gLabelsOK = False
                     Exit Do
                 End If
                 tLabelLanguage(1, ti) = !c_english
                 tLabelLanguage(2, ti) = !c_fanti
                 tLabelLanguage(3, ti) = !c_jianti
                 ti = ti + 1
             End If
             .MoveNext
        Loop
    End With
    ' tRstLabelList.Close
    Set tRstLabelList = Nothing

    If gLabelsOK Then
        If gDisplayLanguage = "E" Then
             tLang = 1
        ElseIf gDisplayLanguage = "T" Then
             tLang = 2
        Else
             tLang = 3
        End If
        '
        ' now comes the basic routine
        '
        Me.LblSequence.Caption = tLabelLanguage(tLang, 1)
        Me.LblOfficeCat.Caption = tLabelLanguage(tLang, 2)
        Me.LblPostCat.Caption = tLabelLanguage(tLang, 3)
        Me.LblFirstyear.Caption = tLabelLanguage(tLang, 4)
        Me.LblFYRange.Caption = tLabelLanguage(tLang, 5)
        Me.LblAssume.Caption = tLabelLanguage(tLang, 6)
        Me.LblFYNHYear.Caption = tLabelLanguage(tLang, 7)
        Me.LblFYIintercalary.Caption = tLabelLanguage(tLang, 8)
        Me.LblFYGZ.Caption = tLabelLanguage(tLang, 9)
        Me.LblLastyear.Caption = tLabelLanguage(tLang, 10)
        Me.LblLYRange.Caption = tLabelLanguage(tLang, 11)
        Me.LblLYNHyear.Caption = tLabelLanguage(tLang, 12)
        Me.LblLYIntercalary.Caption = tLabelLanguage(tLang, 13)
        Me.LblLYGZ.Caption = tLabelLanguage(tLang, 14)
        Me.LblPages.Caption = tLabelLanguage(tLang, 15)
        Me.LblNotes.Caption = tLabelLanguage(tLang, 16)
        Me.CmdPickOffice.Caption = tLabelLanguage(tLang, 17)
        Me.CmdPickFY_NH.Caption = tLabelLanguage(tLang, 18)
        Me.CmdPickLY_NH.Caption = tLabelLanguage(tLang, 19)
        Me.CmdPickSource.Caption = tLabelLanguage(tLang, 20)
        Me.CmdAddNew.Caption = tLabelLanguage(tLang, 21)
        Me.CmdDelete.Caption = tLabelLanguage(tLang, 22)
    End If

End Sub

Public Sub noEdits()

    Me.AllowAdditions = False
    Me.AllowDeletions = False
    Me.AllowEdits = False

End Sub

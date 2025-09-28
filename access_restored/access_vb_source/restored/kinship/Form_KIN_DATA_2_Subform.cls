Option Compare Database
Public gDisplayLanguage As String, gLabelsOK As Boolean

Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 12) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 12 And Not .EOF
             If !c_form = "SF_KIN" Then
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
        Me.LblPages.Caption = tLabelLanguage(tLang, 1)
        Me.LblNotes.Caption = tLabelLanguage(tLang, 2)
        Me.LblKinRel.Caption = tLabelLanguage(tLang, 3)
        Me.LblKinName.Caption = tLabelLanguage(tLang, 4)
        Me.LblSource.Caption = tLabelLanguage(tLang, 5)
        ' Me.CmdAddNew.Caption = tLabelLanguage(tLang, 6)
        ' Me.CmdDelete.Caption = tLabelLanguage(tLang, 7)
        Me.Lbl_c_up.Caption = tLabelLanguage(tLang, 8)
        Me.Lbl_c_down.Caption = tLabelLanguage(tLang, 9)
        Me.Lbl_c_collateral.Caption = tLabelLanguage(tLang, 10)
        Me.Lbl_c_marriage.Caption = tLabelLanguage(tLang, 11)
    End If

End Sub

Public Sub noEdits()

    Me.AllowAdditions = False
    Me.AllowDeletions = False
    Me.AllowEdits = False

End Sub

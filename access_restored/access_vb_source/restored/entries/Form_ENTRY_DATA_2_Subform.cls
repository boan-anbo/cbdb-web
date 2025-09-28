Option Compare Database
Public gLabelsOK As Boolean, gDisplayLanguage As String

Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 21) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 21 And Not .EOF
             If !c_form = "SEN" Then
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
        Me.LblEntry.Caption = tLabelLanguage(tLang, 1)
        Me.LblNianHao.Caption = tLabelLanguage(tLang, 2)
        Me.LblPosting.Caption = tLabelLanguage(tLang, 3)
        Me.LblKinRel.Caption = tLabelLanguage(tLang, 4)
        Me.LblKinName.Caption = tLabelLanguage(tLang, 5)
        Me.LblAssocDesc.Caption = tLabelLanguage(tLang, 6)
        Me.LblAssocName.Caption = tLabelLanguage(tLang, 7)
        Me.Lbl_source.Caption = tLabelLanguage(tLang, 8)

        Me.LBL_c_sequence.Caption = tLabelLanguage(tLang, 11)
        Me.LBL_c_year.Caption = tLabelLanguage(tLang, 12)
        Me.LBL_nianhao_year.Caption = tLabelLanguage(tLang, 13)
        Me.LBL_time_range.Caption = tLabelLanguage(tLang, 14)
        Me.LBL_explain.Caption = tLabelLanguage(tLang, 15)
        Me.LBL_c_pages.Caption = tLabelLanguage(tLang, 16)
        Me.LBL_c_notes.Caption = tLabelLanguage(tLang, 17)
        Me.LBL_c_exam_rank.Caption = tLabelLanguage(tLang, 18)
        Me.LBL_entry_age.Caption = tLabelLanguage(tLang, 19)
        Me.LblEntryPlace.Caption = tLabelLanguage(tLang, 20)
    End If

End Sub

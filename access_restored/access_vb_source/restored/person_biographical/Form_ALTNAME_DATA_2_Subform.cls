Option Compare Database
Public gLabelsOK As Boolean, gDisplayLanguage As String
Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 10) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 10 And Not .EOF
             If !c_form = "SAN" Then
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
        ' Me.CmdDelete.Caption = tLabelLanguage(tLang, 1)
        ' Me.CmdAddNew.Caption = tLabelLanguage(tLang, 2)
        Me.LblSource.Caption = tLabelLanguage(tLang, 3)
        Me.LBL_alt_name.Caption = tLabelLanguage(tLang, 4)
        Me.LBL_alt_name_chn.Caption = tLabelLanguage(tLang, 5)
        Me.LblNameType.Caption = tLabelLanguage(tLang, 6)
        Me.LBL_c_pages.Caption = tLabelLanguage(tLang, 7)
        Me.LBL_c_notes.Caption = tLabelLanguage(tLang, 8)
        Me.LBL_c_sequence.Caption = tLabelLanguage(tLang, 9)

    End If

End Sub

Option Compare Database
Option Explicit
Public gDisplayLanguage As String, gLabelsOK As Boolean

Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 8) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 8 And Not .EOF
             If !c_form = "SF_BID" Then
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
        Me.c_place_name_Label.Caption = tLabelLanguage(tLang, 1)
        Me.c_place_type_Label.Caption = tLabelLanguage(tLang, 2)
        Me.c_pages_Label.Caption = tLabelLanguage(tLang, 3)
        Me.c_bi_begin_year_Label.Caption = tLabelLanguage(tLang, 4)
        Me.c_bi_end_year_Label.Caption = tLabelLanguage(tLang, 5)
        Me.c_source_Label.Caption = tLabelLanguage(tLang, 6)
        Me.c_notes_Label.Caption = tLabelLanguage(tLang, 7)
    End If

End Sub

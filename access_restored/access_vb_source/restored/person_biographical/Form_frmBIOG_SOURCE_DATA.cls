Option Compare Database
Option Explicit
Public gDisplayLanguage As String, gLabelsOK As Boolean

Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 6) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 6 And Not .EOF
             If !c_form = "SF_BSD" Then
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
        Me.LblNotes.Caption = tLabelLanguage(tLang, 1)
        Me.LblPages.Caption = tLabelLanguage(tLang, 2)
        Me.LblHyperlink.Caption = tLabelLanguage(tLang, 3)
        Me.LblSelfBiography.Caption = tLabelLanguage(tLang, 4)
        Me.LblMainSource.Caption = tLabelLanguage(tLang, 5)
    End If

End Sub

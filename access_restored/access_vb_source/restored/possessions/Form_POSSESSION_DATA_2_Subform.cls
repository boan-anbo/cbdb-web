Option Compare Database
Public gDisplayLanguage As String, gLabelsOK As Boolean


Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 18) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 18 And Not .EOF
             If !c_form = "SF_POS" Then
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
        Me.LblRecordID.Caption = tLabelLanguage(tLang, 2)
        Me.LblAct.Caption = tLabelLanguage(tLang, 3)
        Me.LblDescChn.Caption = tLabelLanguage(tLang, 4)
        Me.LblDesc.Caption = tLabelLanguage(tLang, 5)
        Me.LblQuantity.Caption = tLabelLanguage(tLang, 6)
        Me.LblUnit.Caption = tLabelLanguage(tLang, 7)
        Me.LblYear.Caption = tLabelLanguage(tLang, 8)
        Me.LblNHYear.Caption = tLabelLanguage(tLang, 9)
        Me.LblRange.Caption = tLabelLanguage(tLang, 10)
        Me.LblPages.Caption = tLabelLanguage(tLang, 11)
        Me.LblNotes.Caption = tLabelLanguage(tLang, 12)
        Me.LblNH.Caption = tLabelLanguage(tLang, 13)
        Me.LblAddr.Caption = tLabelLanguage(tLang, 14)
        Me.LblSource.Caption = tLabelLanguage(tLang, 15)
        ' Me.CmdDelete.Caption = tLabelLanguage(tLang, 16)
        ' Me.CmdAddNew.Caption = tLabelLanguage(tLang, 17)
    End If

End Sub

Public Sub noEdits()

    Me.AllowAdditions = False
    Me.AllowDeletions = False
    Me.AllowEdits = False

End Sub

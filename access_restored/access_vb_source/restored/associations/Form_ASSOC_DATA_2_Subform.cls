Option Compare Database
Public gDisplayLanguage As String, gLabelsOK As Boolean


Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 28) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 28 And Not .EOF
             If !c_form = "SF_ASD" Then
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
        Me.LblYear.Caption = tLabelLanguage(tLang, 2)
        Me.LblRange.Caption = tLabelLanguage(tLang, 3)
        Me.LblNHYear.Caption = tLabelLanguage(tLang, 4)
        Me.LblIntercalary.Caption = tLabelLanguage(tLang, 5)
        Me.LblGZ.Caption = tLabelLanguage(tLang, 6)
        Me.LblSupplement.Caption = tLabelLanguage(tLang, 7)
        Me.LblOccasion.Caption = tLabelLanguage(tLang, 8)
        Me.LblTitle.Caption = tLabelLanguage(tLang, 9)
        Me.LblGenre.Caption = tLabelLanguage(tLang, 10)
        Me.LblPages.Caption = tLabelLanguage(tLang, 11)
        Me.LblNotes.Caption = tLabelLanguage(tLang, 12)
        Me.LblAssocName.Caption = tLabelLanguage(tLang, 13)
        Me.LblAssocDesc.Caption = tLabelLanguage(tLang, 14)
        Me.LblKinRel.Caption = tLabelLanguage(tLang, 15)
        Me.LblKinName.Caption = tLabelLanguage(tLang, 16)
        Me.LblAssocKinRel.Caption = tLabelLanguage(tLang, 17)
        Me.LblAssocKinChn.Caption = tLabelLanguage(tLang, 18)
        Me.LblAssocAddr.Caption = tLabelLanguage(tLang, 19)
        Me.LblAssocNH.Caption = tLabelLanguage(tLang, 20)
        Me.LblTopicChn.Caption = tLabelLanguage(tLang, 21)
        Me.LblSocInst.Caption = tLabelLanguage(tLang, 22)
        Me.LblSource.Caption = tLabelLanguage(tLang, 23)
        'Me.CmdDelete.Caption = tLabelLanguage(tLang, 24)
        'Me.CmdAddNew.Caption = tLabelLanguage(tLang, 25)
        Me.LblClaimerChn.Caption = tLabelLanguage(tLang, 26)
        Me.LblCount.Caption = tLabelLanguage(tLang, 27)
    End If

End Sub
Public Sub noEdits()

    Me.AllowAdditions = False
    Me.AllowDeletions = False
    Me.AllowEdits = False

End Sub

Option Compare Database
Private Sub Command7_Click()
On Error GoTo Err_Command7_Click

    If Me.Dirty Then Me.Dirty = False
    DoCmd.Close

Exit_Command7_Click:
    Exit Sub

Err_Command7_Click:
    MsgBox Err.Description
    Resume Exit_Command7_Click

End Sub

Private Sub Form_Open(Cancel As Integer)
    Dim tLabelLanguage(3, 3) As String, tLang As Integer
    Dim tRstLabelList As DAO.Recordset, ti As Integer

    gLCID = Application.LanguageSettings.LanguageID(msoLanguageIDUI)
    If gLCID = 2052 Or gLCID = 3076 Then      ' 2052 = PRC, 3076 = Hong Kong
         gDisplayLanguage = "S"
    ElseIf gLCID = 4100 Or gLCID = 1028 Then ' 4100 = Singapore, 1028 = Taiwan
         gDisplayLanguage = "T"
    Else
         gDisplayLanguage = "E"
    End If

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 3 And Not .EOF
             If !c_form = "KRW" Then
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
        Me.Label1.Caption = tLabelLanguage(tLang, 1)
        Me.Label2.Caption = tLabelLanguage(tLang, 2)
    End If

End Sub

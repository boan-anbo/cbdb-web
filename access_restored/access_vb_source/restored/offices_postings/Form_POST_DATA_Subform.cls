Option Compare Database
Public gDisplayLanguage As String, gLabelsOK As Boolean

Private Sub c_office_id_AfterUpdate()
    Dim intLastPostID As Long
    Dim intPostID As Long

    If IsNull(c_posting_id.Value) And Not IsNull(c_office_id) Then
        intLastPostID = DMax("c_posting_id", "POST_DATA")
        TxtLastPostID.Value = intLastPostID

        TxtLastPostID.Visible = True
        TxtLastPostID.SetFocus
        intPostID = TxtLastPostID.Value
        c_posting_id.Value = intPostID + 1

        c_posting_id.SetFocus
        TxtLastPostID.Visible = False
    End If
End Sub

Private Sub CmbApptType_AfterUpdate()
    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    If IsNull(CmbApptType.Value) Then
         TxtApptType.Value = ""
    Else
         rst.Open "APPOINTMENT_CODES", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_appt_code = " & CmbApptType.Value

        TxtApptType.Value = rst.Fields("c_appt_desc_chn")
        rst.Close
    End If
End Sub

Private Sub CmdPickOffice_Click()
On Error GoTo Err_CmdPickOffice_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
        Dim strOffice As String

        c_office_id.Visible = True
        c_office_id.SetFocus
        strOffice = c_office_id.Text

    stDocName = "frmPickOfficeTree"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strOffice

           If CurrentProject.AllForms("frmPickOfficeTree").IsLoaded Then
           Dim intOF As Long
           Dim strOF_CHN As String

           Forms!frmPickOfficeTree!frmOFFICE_CODES.Form!c_office_id.SetFocus
           intOffice = Forms!frmPickOfficeTree!frmOFFICE_CODES.Form!c_office_id.Value
           c_office_id.Value = intOffice

           Forms!frmPickOfficeTree!frmOFFICE_CODES.Form!c_office_chn.SetFocus
           strOFFICE_CHN = Forms!frmPickOfficeTree!frmOFFICE_CODES.Form!c_office_chn.Value
           c_office_chn.Value = strOFFICE_CHN

           DoCmd.Close acForm, stDocName
        End If

        CmdPickOffice.SetFocus
        c_office_id.Visible = False

    Dim intLastPostID As Long
    Dim intPostID As Long

    If IsNull(c_posting_id.Value) And Not IsNull(c_office_id) Then
        intLastPostID = DMax("c_posting_id", "POST_DATA")
        TxtLastPostID.Value = intLastPostID

        TxtLastPostID.Visible = True
        TxtLastPostID.SetFocus
        intPostID = TxtLastPostID.Value
        c_posting_id.Value = intPostID + 1

        c_posting_id.SetFocus
        TxtLastPostID.Visible = False
    End If

Exit_CmdPickOffice_Click:
    Exit Sub

Err_CmdPickOffice_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickOffice_Click

End Sub
Private Sub CmdPickFY_NH_Click()
On Error GoTo Err_CmdPickFY_NH_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strNH As String

        c_fy_nh_code.Visible = True
        c_fy_nh_code.SetFocus
        strNH = c_fy_nh_code.Text


    stDocName = "frmPickNIAN_HAO"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strNH

        If CurrentProject.AllForms("frmPickNIAN_HAO").IsLoaded Then
           Dim intNH As Integer
           Dim strNH_CHN As String

           Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.SetFocus
           intNH = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.Value
           c_fy_nh_code.Value = intNH

           Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.SetFocus
           strNH_CHN = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.Value
           TxtFYNH.Value = strNH_CHN

           DoCmd.Close acForm, stDocName
        End If

        CmdPickFY_NH.SetFocus
        c_fy_nh_code.Visible = False

Exit_CmdPickFY_NH_Click:
    Exit Sub

Err_CmdPickFY_NH_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickFY_NH_Click

End Sub
Private Sub CmdPickLY_NH_Click()
On Error GoTo Err_CmdPickLY_NH_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strNH As String

        c_ly_nh_code.Visible = True
        c_ly_nh_code.SetFocus
        strNH = c_ly_nh_code.Text

    stDocName = "frmPickNIAN_HAO"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strNH

        If CurrentProject.AllForms("frmPickNIAN_HAO").IsLoaded Then
           Dim intNH As Integer
           Dim strNH_CHN As String

           Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.SetFocus
           intNH = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_id.Value
           c_ly_nh_code.Value = intNH

           Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.SetFocus
           strNH_CHN = Forms!frmPickNIAN_HAO!frmNIAN_HAO.Form!c_nianhao_chn.Value
           TxtLYNH.Value = strNH_CHN
             DoCmd.Close acForm, stDocName
          End If

          CmdPickLY_NH.SetFocus
          c_ly_nh_code.Visible = False

Exit_CmdPickLY_NH_Click:
    Exit Sub

Err_CmdPickLY_NH_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickLY_NH_Click

End Sub


Private Sub CmdPickSource_Click()
On Error GoTo Err_CmdPickSource_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strSC As String

          c_source.Visible = True
          c_source.SetFocus
          strSC = c_source.Text

    stDocName = "frmPickTEXTS"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strSC

          If CurrentProject.AllForms("frmPickTEXTS").IsLoaded Then
             Dim intSC As Long
             Dim strSC_CHN As String

             Forms!frmPickTEXTS!frmTEXTS.Form!c_textid.SetFocus
             intSC = Forms!frmPickTEXTS!frmTEXTS.Form!c_textid.Value
             c_source.Value = intSC

             Forms!frmPickTEXTS!frmTEXTS.Form!c_title.SetFocus
             strSC_CHN = Forms!frmPickTEXTS!frmTEXTS.Form!c_title_chn.Value
             TxtTitle_CHN.Value = strSC_CHN

             DoCmd.Close acForm, stDocName
          End If

CmdPickSource.SetFocus
c_source.Visible = False


Exit_CmdPickSource_Click:
    Exit Sub

Err_CmdPickSource_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickSource_Click

End Sub

Private Sub Form_AfterDelConfirm(STATUS As Integer)

Dim rst As ADODB.Recordset
Set rst = New ADODB.Recordset

Dim intPost As Long
Dim intPerson As Long
Dim intAddr As Long
Dim blnRecordAdded As Boolean

'Dim intLoopEnd As Integer
'intLoopEnd = 0

If STATUS = acDeleteOK Then
    rst.Open "Del_log", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
    rst.Find "c_flag = " & 1
    intPost = rst.Fields("c_posting_id")
    rst!c_flag = 0
    rst.Update
    rst.Close

    'Delete corresponding records in POST_ADDR table, using c_posting_id; and create Del_log entries for these co
rresponding records
    Do

               rst.Open "POST_ADDR", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
               rst.Find "c_posting_id = " & intPost
               If rst.EOF Then
                   rst.Close
                   Exit Do
               End If
               intPerson = rst.Fields("c_personid")
               intAddr = rst.Fields("c_addr_id")
               rst.Delete
               rst.Update
               rst.Close

               rst.Open "Del_log", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
               rst.AddNew
               rst!c_personid = intPerson
               rst!c_subform = "POST_ADDR"
               rst!c_posting_id = intPost
               rst!c_addr_id = intAddr
               rst.Update
               blnRecordAdded = True
               rst.Close
       Loop

Else
    rst.Open "Del_log", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
    rst.Find "c_flag = " & 1
    rst.Delete
    rst.Update
    rst.Close
End If

End Sub

Private Sub CmdDelete_Click()
On Error GoTo Err_CmdDelete_Click

Dim rst As ADODB.Recordset
Set rst = New ADODB.Recordset

Dim blnRecordAdded As Boolean

If Not IsNull(c_personid) Then
    rst.Open "Del_Log", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
    rst.AddNew
    rst!c_personid = c_personid
    rst!c_subform = "POSTINGS"
    rst!c_flag = 1
    rst!c_posting_id = c_posting_id
    rst!c_office_id = c_office_id
    rst!c_sequence = c_sequence
    rst!c_firstyear = c_firstyear
    rst!c_lastyear = c_lastyear
    rst!c_fy_nh_code = c_fy_nh_code
    rst!c_ly_nh_code = c_ly_nh_code
    rst!c_fy_nh_yr = c_fy_nh_year
    rst!c_ly_nh_yr = c_ly_nh_year
    rst!c_fy_range = c_fy_range
    rst!c_ly_range = c_ly_range
    rst!c_source = c_source
    rst!c_pages = c_pages
    rst!c_notes = c_notes
    rst.Update
    blnRecordAdded = True
    rst.Close
End If

       DoCmd.DoMenuItem acFormBar, acEditMenu, 8, , acMenuVer70
       DoCmd.DoMenuItem acFormBar, acEditMenu, 6, , acMenuVer70

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
    Dim tLabelLanguage(3, 3) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 3 And Not .EOF
             If !c_form = "SF_POST" Then
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
        Me.CmdAddNew.Caption = tLabelLanguage(tLang, 1)
        Me.CmdDelete.Caption = tLabelLanguage(tLang, 2)

          Me.POST_ADDR_Subform.Form.gDisplayLanguage = gDisplayLanguage
          Me.POST_ADDR_Subform.Form.changeDisplayLanguage

        Me.POSTING_OFFICE_DATA_Subform.Form.gDisplayLanguage = gDisplayLanguage
        Me.POSTING_OFFICE_DATA_Subform.Form.changeDisplayLanguage
    End If

End Sub
Form_POSTED_TO_ADDR_DATA_2 Subform - 1

Option Compare Database
Public gDisplayLanguage As String, gLabelsOK As Boolean, gTest As Integer

Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 23) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 24

        'Do While tI < 23 And Not .EOF
        '     If !c_form = "SF_POFF" Then
        '         gLabelsOK = True
        '         If tI <> !c_label_id Then
        '             MsgBox "Uh oh: mismatched label table"
        '             gLabelsOK = False
        '             Exit Do
        '         End If
        '         tLabelLanguage(1, tI) = !c_english
        '         tLabelLanguage(2, tI) = !c_fanti
        '         tLabelLanguage(3, tI) = !c_jianti
        '         tI = tI + 1
        '     End If
        '     .MoveNext
        'Loop
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
        'Me.LblSequence.Caption = tLabelLanguage(tLang, 1)
        'Me.LblOfficeCat.Caption = tLabelLanguage(tLang, 2)
        'Me.LblPostCat.Caption = tLabelLanguage(tLang, 3)
        'Me.LblFirstyear.Caption = tLabelLanguage(tLang, 4)
        'Me.LblFYRange.Caption = tLabelLanguage(tLang, 5)
        'Me.LblAssume.Caption = tLabelLanguage(tLang, 6)
        'Me.LblFYNHYear.Caption = tLabelLanguage(tLang, 7)
        'Me.LblFYIintercalary.Caption = tLabelLanguage(tLang, 8)
        'Me.LblFYGZ.Caption = tLabelLanguage(tLang, 9)
        'Me.LblLastyear.Caption = tLabelLanguage(tLang, 10)
        'Me.LblLYRange.Caption = tLabelLanguage(tLang, 11)
        'Me.LblLYNHYear.Caption = tLabelLanguage(tLang, 12)
        'Me.LblLYIntercalary.Caption = tLabelLanguage(tLang, 13)
        'Me.LblLYGZ.Caption = tLabelLanguage(tLang, 14)
        'Me.LblPages.Caption = tLabelLanguage(tLang, 15)
        'Me.LblNotes.Caption = tLabelLanguage(tLang, 16)
        'Me.CmdPickOffice.Caption = tLabelLanguage(tLang, 17)
        'Me.CmdPickFY_NH.Caption = tLabelLanguage(tLang, 18)
        'Me.CmdPickLY_NH.Caption = tLabelLanguage(tLang, 19)
        'Me.CmdPickSource.Caption = tLabelLanguage(tLang, 20)
        'Me.CmdAddNew.Caption = tLabelLanguage(tLang, 21)
        'Me.CmdDelete.Caption = tLabelLanguage(tLang, 22)

    End If

End Sub
Private Sub CmdPlace_Click()
On Error GoTo Err_CmdPlace_Click


    If Me.Dirty Then Me.Dirty = False
    DoCmd.Close
Form_POSTED_TO_ADDR_DATA_2 Subform - 2

Exit_CmdPlace_Click:
    Exit Sub

Err_CmdPlace_Click:
    MsgBox Err.Description
    Resume Exit_CmdPlace_Click

End Sub
Form_POSTED_TO_OFFICE_DATA_2 Subform - 1

Option Compare Database
Public gDisplayLanguage As String, gLabelsOK As Boolean


Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 23) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    ' set the language
    Dim tmli As MsoLanguageID
    ' get the labels
    tmli = Application.LanguageSettings.LanguageID(msoLanguageIDUI)
    If tmli = msoLanguageIDSimplifiedChinese Then
         gDisplayLanguage = "S"
    ElseIf tmli = msoLanguageIDTraditionalChinese Then
         gDisplayLanguage = "T"
    ElseIf tmli = msoLanguageIDEnglishUS Then
         gDisplayLanguage = "E"
    Else
         gDisplayLanguage = "E"
    End If


    'MsgBox "Beginning Posted to Office Data labels"
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
        'MsgBox "Beginning to change Posted to Office Data labels"
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
Form_POSTED_TO_OFFICE_DATA_2 Subform - 2

          Me.LblNotes.Caption = tLabelLanguage(tLang, 16)
          Me.LblOfficeName.Caption = tLabelLanguage(tLang, 17)
          Me.LblFYNH.Caption = tLabelLanguage(tLang, 18)
          Me.LblLYNH.Caption = tLabelLanguage(tLang, 19)
          Me.LblSource.Caption = tLabelLanguage(tLang, 20)
          ' Me.CmdAddNew.Caption = tLabelLanguage(tLang, 21)
          ' Me.CmdDelete.Caption = tLabelLanguage(tLang, 22)

        ' Me.POSTED_TO_ADDR_DATA_2_Subform.Form.gTest = 1
        '
        ' Me.POSTED_TO_ADDR_DATA_2_Subform.Form.gDisplayLanguage = gDisplayLanguage
        ' Me.POSTED_TO_ADDR_DATA_2_Subform.Form.changeDisplayLanguage
    End If

End Sub

Public Sub noEdits()

    Me.AllowAdditions = False
    Me.AllowDeletions = False
    Me.AllowEdits = False

End Sub
Form_POSTING_ADDR_DATA Subform - 1

Option Compare Database

Private Sub CmdPlace_Click()
On Error GoTo Err_CmdPlace_Click


    If Me.Dirty Then Me.Dirty = False
    DoCmd.Close

Exit_CmdPlace_Click:
    Exit Sub

Err_CmdPlace_Click:
    MsgBox Err.Description
    Resume Exit_CmdPlace_Click

End Sub
Form_POSTING_DATA_2 Subform - 1

Option Compare Database
Public gDisplayLanguage As String, gLabelsOK As Boolean

Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 3) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 3 And Not .EOF
             If !c_form = "SF_POST" Then
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
        ' Me.CmdAddNew.Caption = tLabelLanguage(tLang, 1)
        ' Me.CmdDelete.Caption = tLabelLanguage(tLang, 2)

          ' Me.POST_ADDR_Subform.Form.gDisplayLanguage = gDisplayLanguage
          ' Me.POST_ADDR_Subform.Form.changeDisplayLanguage

        'MsgBox "Beginning Posted_to_Office_data_2 subform 1"
        Me.POSTED_TO_OFFICE_DATA_2_Subform.Form.gDisplayLanguage = gDisplayLanguage
        'MsgBox "Beginning Posted_to_Office_data_2 subform 2"
        Me.POSTED_TO_OFFICE_DATA_2_Subform.Form.changeDisplayLanguage
    End If

End Sub

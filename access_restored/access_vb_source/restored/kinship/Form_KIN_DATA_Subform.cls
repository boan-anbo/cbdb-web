Option Compare Database
Public gDisplayLanguage As String, gLabelsOK As Boolean

Private Sub CmdPickKinID_Click()
On Error GoTo Err_CmdPickKinID_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strNH As String

    c_kin_id.Visible = True
    c_kin_id.SetFocus
    strNH = c_kin_id.Text

    stDocName = "frmPickPeople"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strNH

    If CurrentProject.AllForms("frmPickPeople").IsLoaded Then
        Dim intKinID As Long
        Dim strKinName As String
        Dim strKinNameChn As String

        Forms!frmPickPeople!frmPerson.Form!c_personid.Visible = True
        intKinID = Forms!frmPickPeople!frmPerson.Form!c_personid.Value

        Forms!frmPickPeople!frmPerson.Form!c_name.SetFocus
        strKinName = Forms!frmPickPeople!frmPerson.Form!c_name.Value

        Forms!frmPickPeople!frmPerson.Form!c_name_chn.SetFocus
        strKinNameChn = Forms!frmPickPeople!frmPerson.Form!c_name_chn.Value

        c_kin_id.Value = intKinID
        TxtKinNM.Value = strKinName
        TxtKinNM_CHN.Value = strKinNameChn

        DoCmd.Close acForm, stDocName
    End If

    CmdPickKinID.SetFocus
    c_kin_id.Visible = False

Exit_CmdPickKinID_Click:
    CmdPickKinID.SetFocus
    c_kin_id.Visible = False
    Exit Sub

Err_CmdPickKinID_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickKinID_Click

End Sub
Private Sub CmdPickKinRel_Click()
On Error GoTo Err_CmdPickKinRel_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strNH As String

        c_kin_code.Visible = True
        c_kin_code.SetFocus
        strKR = c_kin_code.Text

    stDocName = "frmPickKINSHIP_CODES"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strKR

        If CurrentProject.AllForms("frmPickKINSHIP_CODES").IsLoaded Then
           Dim intKR As Integer
           Dim strKR_EN As String
           Dim strKR_CHN As String

           Forms!frmPickKINSHIP_CODES!frmKINSHIP_CODES.Form!c_kincode.SetFocus
           intKR = Forms!frmPickKINSHIP_CODES!frmKINSHIP_CODES.Form!c_kincode.Value
           c_kin_code.Value = intKR

           Forms!frmPickKINSHIP_CODES!frmKINSHIP_CODES.Form!c_kinrel.SetFocus
           strKR_EN = Forms!frmPickKINSHIP_CODES!frmKINSHIP_CODES.Form!c_kinrel.Value
           TxtKinRel.Value = strKR_EN


           Forms!frmPickKINSHIP_CODES!frmKINSHIP_CODES.Form!c_kinrel_chn.SetFocus
             strKR_CHN = Forms!frmPickKINSHIP_CODES!frmKINSHIP_CODES.Form!c_kinrel_chn.Value
             TxtKinRel_CHN.Value = strKR_CHN

             DoCmd.Close acForm, stDocName
          End If

          CmdPickKinRel.SetFocus
          c_kin_code.Visible = False

Exit_CmdPickKinRel_Click:
    Exit Sub

Err_CmdPickKinRel_Click:
    MsgBox Err.Description
    Resume Exit_CmdPickKinRel_Click

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

    Dim intKinOld As Long
    Dim intKinCodeOld As Integer
    Dim intKinPairOld As Integer
    Dim tGenderOld As Integer
    Dim intKinCodeFind As Integer
    Dim intPersonFind As Long
    Dim intPerson As Long
    Dim blnRecordAdded As Boolean

    If STATUS = acDeleteOK Then

             'Find the old record (if there is one) and delete it
              intPerson = TxtDelPersonID.Value
              intKinOld = TxtDelKinID.Value
              intKinCodeOld = TxtDelKinCode.Value
             'Add a new entry to Del_Log
             rst.Open "DEL_LOG", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
             rst.AddNew
             rst!c_personid = intPerson
             rst!c_subform = "KINSHIP"
             rst!c_kin_id = intKinOld
             rst!c_kin_code = intKinCodeOld
             rst!c_source = TxtDelSource.Value
             rst!c_pages = TxtDelPages.Value
             rst!c_notes = TxtDelNotes.Value

             rst.Update
             blnRecordAdded = True
             rst.Close

             'Determine the gender of the kin
             rst.Open "BIOG_MAIN", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
             rst.Find "c_personid = " & intPerson
             tGenderOld = rst.Fields("c_female")
             rst.Close

             'Find the pair-code
             rst.Open "KINSHIP_CODES", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
             rst.Find "c_kincode = " & intKinCodeOld

             If tGenderOld = 0 Then
                  intKinPairOld = rst.Fields("c_kin_pair1")
             Else
                  intKinPairOld = rst.Fields("c_kin_pair2")
             End If

             rst.Close


             rst.Open "KIN_DATA", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
             Do
                 rst.Find "c_personid = " & intKinOld
                 intKinCodeFind = rst.Fields("c_kin_code")
                 intPersonFind = rst.Fields("c_kin_id")

                    If intKinCodeFind = intKinPairOld And intPersonFind = intPerson Then
                         rst.Delete
                         rst.Update
                         rst.Close
                         Exit Do
                    Else
                         rst.MoveNext
                    End If
             Loop
    End If
End Sub


Private Sub Form_BeforeUpdate(Cancel As Integer)
    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    Dim intKinCode As Integer
    Dim intKinPair As Integer
    Dim intPerson As Long
    Dim tGender As Integer
    Dim intKin As Long
    Dim blnRecordAdded As Boolean

    Dim intKinOld As Long
    Dim intKinPairOld As Integer
    Dim tGenderOld As Integer
    Dim intPersonFind As Long
    Dim intKinCodeFind As Integer


        intPerson = c_personid.Value
        intKin = c_kin_id.Value
        intKinCode = c_kin_code.Value

        'Determine the gender of the kin
        rst.Open "BIOG_MAIN", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
        rst.Find "c_personid = " & intPerson
        tGender = rst.Fields("c_female")
        rst.Close

          'Find the pair-code
          rst.Open "KINSHIP_CODES", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
          rst.Find "c_kincode = " & c_kin_code.Value

          If tGender = 0 Then
               intKinPair = rst.Fields("c_kin_pair1")
          Else
               intKinPair = rst.Fields("c_kin_pair2")
          End If

          rst.Close

          'Find the old record (if there is one) and delete it
          If Not IsNull(c_kin_code.OldValue) Or Not IsNull(c_kin_id.OldValue) Then
              If Not IsNull(c_kin_id.OldValue) Then
              intKinOld = c_kin_id.OldValue
              End If

              'Determine the gender of the kin
              rst.Open "BIOG_MAIN", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
              rst.Find "c_personid = " & intPerson
              tGenderOld = rst.Fields("c_female")
              rst.Close

              'Find the pair-code
              rst.Open "KINSHIP_CODES", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
              rst.Find "c_kincode = " & c_kin_code.OldValue

              If tGenderOld = 0 Then
                   intKinPairOld = rst.Fields("c_kin_pair1")
              Else
                   intKinPairOld = rst.Fields("c_kin_pair2")
              End If

              rst.Close


              rst.Open "KIN_DATA", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
              Do
                  rst.Find "c_personid = " & intKinOld
                  intKinCodeFind = rst.Fields("c_kin_code")
                  intPersonFind = rst.Fields("c_kin_id")

                     If intKinCodeFind = intKinPairOld And intPersonFind = intPerson Then
                          rst.Delete
                          rst.Update
                          rst.Close
                          Exit Do
                     Else
                          rst.MoveNext
                     End If
              Loop
          End If

          'Add the new entry
          rst.Open "KIN_DATA", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
          rst.AddNew
          rst!c_personid = intKin
          rst!c_kin_id = intPerson
          rst!c_kin_code = intKinPair

        rst!c_notes = c_notes
        rst!c_source = c_source
        rst!c_pages = c_pages
        rst!c_autogen_fr_id = intPerson
        rst!c_autogen_fr_code = intKinCode
        rst!c_autogen_notes = "Auto-generated from PersonID = " + Trim(intPerson) + ", KinCode = " + Trim(intKinC
ode) + "."

          rst.Update
          blnRecordAdded = True

          rst.Close

End Sub

Private Sub Form_Current()
    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    If IsNull(c_source.Value) Then
         TxtTitle_CHN.Value = ""
    Else
         rst.Open "TEXT_CODES", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_textid = " & c_source.Value

        TxtTitle_CHN.Value = rst.Fields("c_title_chn")
        rst.Close
    End If

    If IsNull(c_kin_code.Value) Then
         TxtKinRel.Value = ""
         TxtKinRel_CHN.Value = ""
    Else
         rst.Open "KINSHIP_CODES", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_kincode = " & c_kin_code.Value

        TxtKinRel.Value = rst.Fields("c_kinrel")
        TxtKinRel_CHN.Value = rst.Fields("c_kinrel_chn")

        rst.Close
    End If

    If IsNull(c_kin_id.Value) Then
         TxtKinNM.Value = ""
         TxtKinNM_CHN.Value = ""
    Else
         rst.Open "BIOG_MAIN", CurrentProject.Connection, adOpenDynamic, _
         adLockOptimistic
         rst.Find "c_personid = " & c_kin_id.Value

        TxtKinNM.Value = rst.Fields("c_name")
        TxtKinNM_CHN.Value = rst.Fields("c_name_chn")

        rst.Close
    End If

End Sub
Private Sub CmdDelete_Click()
On Error GoTo Err_CmdDelete_Click

    TxtDelPersonID.Value = c_personid
    TxtDelKinID.Value = c_kin_id
    TxtDelKinCode.Value = c_kin_code
    TxtDelSource.Value = c_source
    TxtDelPages.Value = c_pages
    TxtDelNotes.Value = c_notes

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
Private Sub CmdAutoGen_Click()
On Error GoTo Err_CmdAutoGen_Click

    Dim rst As ADODB.Recordset
    Set rst = New ADODB.Recordset

    Dim intKinCode As Integer
    Dim intKinPair As Integer
    Dim intPerson As Long
    Dim tGender As Integer
    Dim intKin As Long
    Dim blnRecordAdded As Boolean

    Dim intKinOld As Long
    Dim intKinPairOld As Integer
    Dim tGenderOld As Integer
    Dim intPersonFind As Long
    Dim intKinCodeFind As Integer


          intPerson = c_personid.Value
          intKin = c_kin_id.Value
          intKinCode = c_kin_code.Value

          'Determine the gender of the kin
          rst.Open "BIOG_MAIN", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
          rst.Find "c_personid = " & intPerson
          tGender = rst.Fields("c_female")
          rst.Close

          'Find the pair-code
          rst.Open "KINSHIP_CODES", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
          rst.Find "c_kincode = " & c_kin_code.Value

          If tGender = 0 Then
               intKinPair = rst.Fields("c_kin_pair1")
          Else
               intKinPair = rst.Fields("c_kin_pair2")
          End If

          rst.Close

          'Add the new entry
          rst.Open "KIN_DATA", CurrentProject.Connection, adOpenDynamic, adLockOptimistic
          rst.AddNew
          rst!c_personid = intKin
          rst!c_kin_id = intPerson
          rst!c_kin_code = intKinPair

        rst!c_notes = c_notes
        rst!c_source = c_source
        rst!c_pages = c_pages
        rst!c_autogen_fr_id = intPerson
        rst!c_autogen_fr_code = intKinCode
        rst!c_autogen_notes = "Auto-generated from PersonID = " + Trim(intPerson) + ", KinCode = " + Trim(intKinC
ode) + "."

          rst.Update
          blnRecordAdded = True

          rst.Close


Exit_CmdAutoGen_Click:
    Exit Sub

Err_CmdAutoGen_Click:
    MsgBox Err.Description
    Resume Exit_CmdAutoGen_Click

End Sub

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
        Me.CmdPickKinRel.Caption = tLabelLanguage(tLang, 3)
        Me.CmdPickKinID.Caption = tLabelLanguage(tLang, 4)
        Me.CmdPickSource.Caption = tLabelLanguage(tLang, 5)
        Me.CmdAddNew.Caption = tLabelLanguage(tLang, 6)
        Me.CmdDelete.Caption = tLabelLanguage(tLang, 7)
    End If

End Sub

Public Sub noEdits()

    Me.AllowAdditions = False
    Me.AllowDeletions = False
    Me.AllowEdits = False

End Sub

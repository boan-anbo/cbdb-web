Public gUseIndexYears As Boolean, gUseDynasties As Boolean, gFromDynasty As Integer, gToDynasty As Integer, gFrom
DynastyBegin As Integer, _
    gFromDynastyEnd As Integer, gToDynastyBegin As Integer, gToDynastyEnd As Integer
Option Compare Database

Private Sub CmdCancel_Click()
On Error GoTo Err_CmdCancel_Click


    DoCmd.Close

Exit_CmdCancel_Click:
    Exit Sub

Err_CmdCancel_Click:
    MsgBox Err.Description
    Resume Exit_CmdCancel_Click

End Sub

Private Sub CmdDynastyFrom_Click()
    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strFromDynasty As String, tStrFromDynastyText As String

    If gFromDynasty < 0 Then
         strFromDynasty = ""
    Else
         strFromDynasty = Str(gFromDynasty)
    End If

    stDocName = "frmPickDynasty"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strFromDynasty

    If CurrentProject.AllForms("frmPickDynasty").IsLoaded Then

           Forms!frmpickdynasty!frmDYNASTIES.Form!Dy_Code.SetFocus
           gFromDynasty = Forms!frmpickdynasty!frmDYNASTIES.Form!Dy_Code.Value

           Forms!frmpickdynasty!frmDYNASTIES.Form!c_start.SetFocus
           gFromDynastyBegin = Forms!frmpickdynasty!frmDYNASTIES.Form!c_start.Value

        Forms!frmpickdynasty!frmDYNASTIES.Form!c_end.SetFocus
        gFromDynastyEnd = Forms!frmpickdynasty!frmDYNASTIES.Form!c_end.Value
        '
        ' check to see if we have a problem and reject selection
        '
        If gToDynasty > -1 Then
            If gFromDynastyBegin > gToDynastyEnd Then
                MsgBox "Warning: There is a problem with chronology: the 'From' Dynasty begins after the 'To' D
ynasty ends!", vbExclamation
                gFromDynasty = -1
                TxtDynastyFrom.Value = ""
            End If
        End If
        '
        ' value is OK
        '
        If gFromDynasty > -1 Then
            Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty.SetFocus
            tStrFromDynastyText = Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty.Value

               Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty_chn.SetFocus
               TxtDynastyFrom.Value = tStrFromDynastyText + " " + Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty_c
hn.Value
           End If

        DoCmd.Close acForm, stDocName
        '
        ' reset ToDynasty if necessary (-2 = all dynasties)
        '
        If gToDynasty = -2 Then
            gToDynasty = -1
            TxtDynastyTo.Value = ""
        End If
        '
    End If

End Sub
Private Sub CmdDynastyTo_Click()
    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strToDynasty As String, tStrToDynastyText As String

       If gToDynasty = -1 Then
            strToDynasty = ""
       Else
            strToDynasty = Str(gToDynasty)
       End If

       stDocName = "frmPickDynasty"
       DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strFromDynasty

       If CurrentProject.AllForms("frmPickDynasty").IsLoaded Then

           Forms!frmpickdynasty!frmDYNASTIES.Form!Dy_Code.SetFocus
           gToDynasty = Forms!frmpickdynasty!frmDYNASTIES.Form!Dy_Code.Value

           Forms!frmpickdynasty!frmDYNASTIES.Form!c_start.SetFocus
           gToDynastyBegin = Forms!frmpickdynasty!frmDYNASTIES.Form!c_start.Value

        Forms!frmpickdynasty!frmDYNASTIES.Form!c_end.SetFocus
        gToDynastyEnd = Forms!frmpickdynasty!frmDYNASTIES.Form!c_end.Value
        '
        ' check to see if we have a problem and reject selection if needed
        '
        If gFromDynasty > -1 Then
            If gFromDynastyBegin > gToDynastyEnd Then
                MsgBox "Warning: There is a problem with chronology: the 'From' Dynasty begins after the 'To' D
ynasty ends!", vbExclamation
                gToDynasty = -1
                TxtDynastyTo.Value = ""
            End If
        End If
        '
        ' value is OK
        '
        If gToDynasty > -1 Then
            Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty.SetFocus
            tStrToDynastyText = Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty.Value

               Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty_chn.SetFocus
               TxtDynastyTo.Value = tStrToDynastyText + " " + Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty_chn.V
alue
           End If

           DoCmd.Close acForm, stDocName
           '
           ' reset FromDynasty if necessary (-2 = all dynasties)
           '
           If gFromDynasty = -2 Then
               gFromDynasty = -1
               TxtDynastyFrom.Value = ""
           End If
           '
       End If

End Sub

Private Sub CmdSearch_Click()
On Error GoTo Err_CmdSearch_Click

    Dim tStrSurname As String, tStrOffice As String, tStrQueryInsert As String, tStrQueryFrom As String, tStrQuer
yWhere As String, _
        tStrAndYears As String
    Dim cmdSQL As ADODB.Command, tRecCount

       tStrSurname = ""
       tStrOffice = ""
       tStrQuery = ""
       tRecCount = 0

       Set cmdSQL = New ADODB.Command
       cmdSQL.ActiveConnection = CurrentProject.Connection
       cmdSQL.CommandType = adCmdText
           '
       ' define the FROM joins
       '
       tStrQueryFrom = "FROM ZZZ_BIOG_MAIN INNER JOIN ZZZ_BIOG_NAME_OFFICE ON ZZZ_BIOG_MAIN.c_personid = ZZZ_BIOG_NA
ME_OFFICE.c_personid "

    ' define the additional WHERE logic as blank
    '
    tStrAndYears = ""

    If gUseIndexYears Then
        If IsNull(Me.TxtIndexYearFrom.Value) Then
            Me.TxtIndexYearFrom.Value = ""
        End If
        If IsNull(Me.TxtIndexYearTo.Value) Then
            Me.TxtIndexYearTo.Value = ""
        End If

        If Me.TxtIndexYearFrom.Value = "" And TxtIndexYearTo.Value = "" Then
             gUseIndexYears = False
        ElseIf Me.TxtIndexYearFrom.Value = "" Then
             tStrAndYears = "(ZZZ_BIOG_MAIN.c_index_year<= " + Str(TxtIndexYearTo.Value) + ") AND "
        ElseIf Me.TxtIndexYearTo.Value = "" Then
             tStrAndYears = "(ZZZ_BIOG_MAIN.c_index_year>= " + Str(TxtIndexYearFrom.Value) + ") AND "
        Else
             tStrAndYears = "((ZZZ_BIOG_MAIN.c_index_year<= " + Str(TxtIndexYearTo.Value) + ") AND (ZZZ_BIOG_MAIN.
c_index_year>= " + Str(TxtIndexYearFrom.Value) + ")) AND "
        End If
    ElseIf gUseDynasties Then
        If gFromDynasty = -2 Then
             tStrAndYears = "((ZZZ_BIOG_MAIN.c_dy) > 0 ) AND "
        ElseIf gFromDynasty = -1 And gToDynasty > 0 Then
             tStrAndYears = "((DYNASTIES.c_start)<" + Str(gToDynastyEnd) + ") AND "
             '
             ' redefine the FROM joins to include DYNASTIES
             '
             tStrQueryFrom = "FROM (ZZZ_BIOG_MAIN INNER JOIN ZZZ_BIOG_NAME_OFFICE ON ZZZ_BIOG_MAIN.c_personid = ZZ
Z_BIOG_NAME_OFFICE.c_personid) " + _
                 "INNER JOIN DYNASTIES ON ZZZ_BIOG_MAIN.c_dy = DYNASTIES.c_dy "
        ElseIf gFromDynasty > 0 And gToDynasty = -1 Then
             tStrAndYears = "((DYNASTIES.c_end)>" + Str(gFromDynastyBegin) + ") AND "
             '
             ' redefine the FROM joins to include DYNASTIES
             '
             tStrQueryFrom = "FROM (ZZZ_BIOG_MAIN INNER JOIN ZZZ_BIOG_NAME_OFFICE ON ZZZ_BIOG_MAIN.c_personid = ZZ
Z_BIOG_NAME_OFFICE.c_personid) " + _
                 "INNER JOIN DYNASTIES ON ZZZ_BIOG_MAIN.c_dy = DYNASTIES.c_dy "
        ElseIf gFromDynasty = gToDynasty And gFromDynasty > 0 Then
             tStrAndYears = "((ZZZ_BIOG_MAIN.c_dy) = " + Str(gToDynasty) + " ) AND "
        ElseIf gFromDynasty > 0 And gToDynasty > 0 Then
             tStrAndYears = "((DYNASTIES.c_end>" + Str(gFromDynastyBegin) + ") AND (DYNASTIES.c_start<=" + Str(gTo
DynastyEnd) + ")) AND "
             '
             ' redefine the FROM joins to include DYNASTIES
             '
             tStrQueryFrom = "FROM (ZZZ_BIOG_MAIN INNER JOIN ZZZ_BIOG_NAME_OFFICE ON ZZZ_BIOG_MAIN.c_personid = ZZ
Z_BIOG_NAME_OFFICE.c_personid) " + _
                 "INNER JOIN DYNASTIES ON ZZZ_BIOG_MAIN.c_dy = DYNASTIES.c_dy "
        Else
             tStrAndYears = "((ZZZ_BIOG_MAIN.c_dy) > 0 ) AND "
        End If

    End If

    'Me.TxtSurnameChn.SetFocus
    If TxtSurnameChn.Value <> "" And TxtOfficeChn.Value <> "" Then
         tStrSurname = Trim(TxtSurnameChn.Value)
         tStrOffice = Trim(TxtOfficeChn.Value)
             tStrQueryInsert = "INSERT INTO Z_NAME_SEARCH ( c_personid, c_name, c_name_chn ) " + _
                 "SELECT DISTINCT ZZZ_BIOG_MAIN.c_personid, ZZZ_BIOG_MAIN.c_name, ZZZ_BIOG_MAIN.c_name_chn "
             tStrQueryWhere = "WHERE (" + _
                 "(" + tStrAndYears + _
                 "(ZZZ_BIOG_NAME_OFFICE.c_surname_chn='" + tStrSurname + "') AND (ZZZ_BIOG_NAME_OFFICE.c_office_ch
n like '%" + tStrOffice + "%')) OR " + _
                 "(" + tStrAndYears + _
                 "(ZZZ_BIOG_NAME_OFFICE.c_surname_chn='" + tStrSurname + "') AND (ZZZ_BIOG_NAME_OFFICE.c_office_ch
n_alt like '%" + tStrOffice + "%')))"
    Else
         'TxtSearchPY.SetFocus
         If TxtSurnamePY.Value <> "" And TxtOfficePY.Value <> "" Then
             tStrSurname = Trim(TxtSurnamePY.Value)
             tStrOffice = Trim(TxtOfficePY.Value)
             tStrQueryInsert = "INSERT INTO Z_NAME_SEARCH ( c_personid, c_name, c_name_chn ) " + _
                 "SELECT DISTINCT ZZZ_BIOG_MAIN.c_personid, ZZZ_BIOG_MAIN.c_name, ZZZ_BIOG_MAIN.c_name_chn "
            tStrQueryWhere = "WHERE (" + _
                "(" + tStrAndYears + _
                "(ZZZ_BIOG_NAME_OFFICE.c_surname='" + tStrSurname + "') AND (ZZZ_BIOG_NAME_OFFICE.c_office_pinyin
 like '%" + tStrOffice + "%')) OR " + _
                "(" + tStrAndYears + _
                "(ZZZ_BIOG_NAME_OFFICE.c_surname='" + tStrSurname + "') AND (ZZZ_BIOG_NAME_OFFICE.c_office_pinyin
_alt like '%" + tStrOffice + "%')))"
        End If
    End If
    'MsgBox tStrAndYears

    If tStrQueryInsert <> "" Then
        cmdSQL.CommandText = "Delete * from Z_NAME_SEARCH"
        cmdSQL.Execute tRecCount

         cmdSQL.CommandText = tStrQueryInsert + tStrQueryFrom + tStrQueryWhere
         cmdSQL.Execute tRecCount
    End If
    If tRecCount > 0 Then
         Me.Form.Visible = False
         'Forms!frmSearchPeopleOffice.visibe = False
    Else
         DoCmd.Close
    End If

Exit_CmdSearch_Click:
    Exit Sub

Err_CmdSearch_Click:
    MsgBox Err.Description
    Resume Exit_CmdSearch_Click

End Sub

Private Sub Form_Open(Cancel As Integer)
    Me.TxtSurnameChn.Value = ""
    Me.TxtSurnamePY.Value = ""
    Me.TxtOfficeChn.Value = ""
    Me.TxtOfficePY.Value = ""
    Me.TxtIndexYearFrom.Value = ""
    Me.TxtIndexYearTo.Value = ""
    Me.CmdSearch.Enabled = False

    gFromDynasty = -1
    gToDynasty = -1
    gUseIndexYears = False
    gUseDynasties = False
End Sub


Private Sub FrameFilterYears_Click()
' disable all
    Me.CmdDynastyFrom.Enabled = False
    Me.CmdDynastyTo.Enabled = False
    Me.TxtDynastyFrom.Enabled = False
    Me.TxtDynastyTo.Enabled = False
    Me.TxtDynastyFrom.Locked = False
    Me.TxtDynastyTo.Locked = False

    Me.TxtIndexYearFrom.Enabled = False
    Me.TxtIndexYearTo.Enabled = False

    gUseIndexYears = False
    gUseDynasties = False

    If FrameFilterYears.Value = 2 Then

          ' enable index years
          Me.TxtIndexYearFrom.Enabled = True
          Me.TxtIndexYearTo.Enabled = True
          gUseIndexYears = True

    ElseIf FrameFilterYears.Value = 3 Then

          ' enable dynasties
          Me.CmdDynastyFrom.Enabled = True
          Me.CmdDynastyTo.Enabled = True
          Me.TxtDynastyFrom.Enabled = True
          Me.TxtDynastyTo.Enabled = True
          Me.TxtDynastyFrom.Locked = True
          Me.TxtDynastyTo.Locked = True
          gUseDynasties = True

    End If

End Sub

Private Sub TxtOfficeChn_Change()
    If Me.TxtSurnameChn.Value = "" Or Me.TxtOfficeChn.Text = "" Then
         Me.CmdSearch.Enabled = False
    Else
         Me.TxtSurnamePY.Value = ""
         Me.TxtOfficePY.Value = ""
         Me.CmdSearch.Enabled = True
    End If

End Sub

Private Sub TxtOfficePY_Change()
    If Me.TxtSurnamePY.Value = "" Or Me.TxtOfficePY.Text = "" Then
         Me.CmdSearch.Enabled = False
    Else
         Me.TxtSurnameChn.Value = ""
         Me.TxtOfficeChn.Value = ""
         Me.CmdSearch.Enabled = True
    End If

End Sub

Private Sub TxtSurnameChn_Change()
    If Me.TxtSurnameChn.Text = "" Or Me.TxtOfficeChn.Value = "" Then
         Me.CmdSearch.Enabled = False
    Else
         Me.TxtSurnamePY.Value = ""
         Me.TxtOfficePY.Value = ""
         Me.CmdSearch.Enabled = True
    End If

End Sub

Private Sub TxtSurnamePY_Change()
    If Me.TxtSurnamePY.Text = "" Or Me.TxtOfficePY.Value = "" Then
         Me.CmdSearch.Enabled = False
    Else
         Me.TxtSurnameChn.Value = ""
         Me.TxtOfficeChn.Value = ""
         Me.CmdSearch.Enabled = True
    End If

End Sub

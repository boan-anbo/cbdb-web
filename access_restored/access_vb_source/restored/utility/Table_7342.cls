' Original module name: 表
' Extracted from lines 7342-8887

è¡¨ - 1


Option Compare Database
Public gDisplayLanguage As String, gLabelsOK As Boolean, gPersonID As Long


Private Sub CmdSaveToFile_Click()
On Error GoTo Err_CmdSaveToFile_Click
    Dim tPersonName As String
    '
    ' first, just test if it knows the perdon ID
    '
    gPersonID = Me.BIOG_MAIN_2_Subform.Form.c_personid.Value
    'MsgBox Str(gPersonID)
    tPersonName = Me.frmPeopleLookup2.Form.c_name_chn.Value
    If IsNull(tPersonName) Then
        MsgBox "Name is NULL"
        Exit Sub
    End If

    ' the routine tests whether thre isinformation to be written for each category
    '
    ' set the language
    Dim tmli As MsoLanguageID, tLang As String
    ' get the labels
    tmli = Application.LanguageSettings.LanguageID(msoLanguageIDUI)

    If tmli = msoLanguageIDSimplifiedChinese Then
         tLang = "S"
    ElseIf tmli = msoLanguageIDTraditionalChinese Then
         tLang = "T"
    ElseIf tmli = msoLanguageIDEnglishUS Then
         tLang = "E"
    Else
         tLang = "E"
    End If
    '
    ' The challenge here is that we have 7 tables of results:
    '        ZZZ_BIOG_MAIN
    '        ZZ_SCRATCH_KIN
    '        ZZ_SCRATCH_STATUS
    '        ZZ_SCRATCH_OFFICE
    '        ZZ_SCRATCH_ENTRY
    '        ZZ_SCRATCH_BIOG_TEXT_DATA
    '        ZZ_SCRATCH_BIOG_ADDR_DATA
    '
    ' We need to check all of these for people (entry has 3 IDs) and address IDs, along with their specific data
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer, tFileName As String, tFN As Variant
    '
    Dim tRstPeople As DAO.Recordset, tRst As DAO.Recordset
    Dim tStr As String, tC As String
    Dim tQueryStr As String, tPersonID As Long, tCount As Long, tStrPersonID As String
    '

    tStrPersonID = Str(gPersonID)

    Dim gStream As ADODB.Stream, tCodeStr As String
    '
    ' set up the stream to write to

    Set gStream = New ADODB.Stream
    '
    gStream.Charset = "utf-8"
    tCodeStr = "UTF8"
    '
    ' Other options
        'gStream.Charset = "big5"
        'tCodeStr = "BIG5"
        'gStream.Charset = "gb2312"
        'tCodeStr = "GB2312"
        'gStream.Charset = "ascii"
        'tCodeStr = "ascii"
    '
    tC = Chr(44) ' the comma
    '
    Dim cmdSQL As ADODB.Command, tRecCount As Long
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
è¡¨ - 2


    ' get the basic information

    ' Create the file

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

    dlgSaveAs.InitialFileName = tPersonName + tCodeStr + ".htm"
    If dlgSaveAs.Show = -1 Then
        '
        tFileName = ""
        For Each tFN In dlgSaveAs.SelectedItems
             tFileName = tFN
             If Not tFileName = "" Then
                 Exit For
             End If
        Next
        If tFileName = "" Then
             MsgBox "Bad file Name."
             GoTo Exit_CmdSaveToFile_Click
        Else
             ' make sure the file name has a htm extension
             If Len(tFileName) < 5 Then
                 tFileName = tFileName + ".htm"
             ElseIf Not (LCase(Right(tFileName, 4)) = ".htm") Then
                 tFileName = tFileName + ".htm"
             End If
        End If
        '
        ' we have a file name: now open the stream for writing

          gStream.Mode = adModeReadWrite
          gStream.Type = adTypeText
          gStream.Open

         tQueryStr = "SELECT ZZZ_BIOG_MAIN.c_personid, ZZZ_BIOG_MAIN.c_name, ZZZ_BIOG_MAIN.c_name_chn, ZZZ_BIOG_MA
IN.c_index_year, " + _
                 "ZZZ_BIOG_MAIN.c_index_year_type_desc, ZZZ_BIOG_MAIN.c_index_year_type_hz, ZZZ_BIOG_MAIN.c_dynast
y, " + _
                 "ZZZ_BIOG_MAIN.c_dynasty_chn, ZZZ_BIOG_MAIN.c_female, ZZZ_BIOG_MAIN.c_index_addr_name, ZZZ_BIOG_M
AIN.c_index_addr_chn, " + _
                 "ZZZ_BIOG_MAIN.c_index_addr_type_desc, ZZZ_BIOG_MAIN.c_index_addr_type_chn, ZZZ_BIOG_MAIN.x_coord
, " + _
                 "ZZZ_BIOG_MAIN.y_coord, ZZZ_BIOG_MAIN.c_birthyear, ZZZ_BIOG_MAIN.c_deathyear, ZZZ_BIOG_MAIN.c_dea
th_age, " + _
                 "ZZZ_BIOG_MAIN.c_fl_earliest_year, ZZZ_BIOG_MAIN.c_fl_latest_year, ZZZ_BIOG_MAIN.c_fl_ly_nh_year,
 " + _
                 "ZZZ_BIOG_MAIN.c_name_proper, ZZZ_BIOG_MAIN.c_name_rm, ZZZ_BIOG_MAIN.c_ethnicity_chn, ZZZ_BIOG_MA
IN.c_ethnicity_rmn, " + _
                 "ZZZ_BIOG_MAIN.c_choronym_desc, ZZZ_BIOG_MAIN.c_choronym_chn, " + _
                 "ZZZ_BIOG_MAIN.c_household_status_desc, ZZZ_BIOG_MAIN.c_household_status_desc_chn " + _
             "FROM ZZZ_BIOG_MAIN " + _
             "WHERE (((ZZZ_BIOG_MAIN.c_personid)=" + tStrPersonID + "))"
         '
         MsgBox "Writing header"
         gStream.WriteText "<HTML>", adWriteLine
         gStream.WriteText "<BODY>", adWriteLine
         tStr = "<P><B>Basic Information</B></P>"
         gStream.WriteText tStr, adWriteLine
         '
         MsgBox "Getting Person Data"
         Set tRstPeople = CurrentDb.OpenRecordset(tQueryStr)
         MsgBox "Writing Person Basic Data"
         With tRstPeople
             .MoveFirst
             Do While Not .EOF
                 ' the ID of the person
                 gStream.WriteText "<P><I>CBDB ID</I>", adWriteLine
                 gStream.WriteText Trim(Str(!c_personid)) + "</P>", adWriteLine
                 '
                 ' name
                 '
                 gStream.WriteText "<P><I>Name</I>", adWriteLine
                 If IsNull(!c_name) Then
                      tStr = "[Missing]"
                 Else
                      tStr = !c_name
                 End If
                 '
                If IsNull(!c_name_chn) Then
è¡¨ - 3

                 tStr = tStr + " [Missing]"
          Else
              tStr = tStr + " " + !c_name_chn
          End If
          gStream.WriteText tStr, adWriteLine

          ' c_name_proper, c_name_rm
          If Not IsNull(!c_name_proper) Then
              gStream.WriteText "<BR>" + !c_name_proper, adWriteLine
          End If
          If Not IsNull(!c_name_rm) Then
              gStream.WriteText "<BR>" + !c_name_rm, adWriteLine
          End If
          gStream.WriteText "</P>", adWriteLine

          gStream.WriteText "<P><I>Sex</I>", adWriteLine
          If IsNull(!c_female) Then
               tStr = "[Unknown]"
          Else
               tStr = IIf(!c_female, "F", "M")
          End If
          gStream.WriteText tStr + "</P>", adWriteLine
          '
          ' indexyear = c_index_year INT
          '
          gStream.WriteText "<P><I>Index Year</I>", adWriteLine
          If IsNull(!c_index_year) Then
               tStr = "[Unknown]"
          Else
               tStr = Trim(Str(!c_index_year))
          End If
          gStream.WriteText tStr + "<BR>", adWriteLine
          '
          ' indexyear = c_index_year_type_desc STR
          '
          gStream.WriteText "<I>Index Year Type</I>", adWriteLine
          If IsNull(!c_index_year_type_desc) Then
               tStr = "Unknown "
          Else
               tStr = Trim(!c_index_year_type_desc) + " "
          End If
          '
          ' indexyear = c_index_year_type_hz STR
          '
          If Not IsNull(!c_index_year_type_hz) Then
               tStr = tStr + Trim(!c_index_year_type_hz)
          End If
          gStream.WriteText tStr, adWriteLine

          ' Additional Year Information

          '"c_birthyear, c_deathyear, c_death_age, c_fl_earliest_year, c_fl_latest_year "
          If Not IsNull(!c_birthyear) Then
              gStream.WriteText "<BR>Birth Year: " + Str(!c_birthyear), adWriteLine
          End If
          If Not IsNull(!c_deathyear) Then
              gStream.WriteText "<BR>Death Year: " + Str(!c_deathyear), adWriteLine
          End If
          If Not IsNull(!c_death_age) Then
              gStream.WriteText "<BR>Death Age: " + Str(!c_death_age), adWriteLine
          End If
          If Not IsNull(!c_fl_earliest_year) Then
              gStream.WriteText "<BR>Earliest Floruit Year: " + Str(!c_fl_earliest_year), adWriteLine
          End If
          If Not IsNull(!c_fl_latest_year) Then
              gStream.WriteText "<BR>Latest Floruit Year: " + Str(!c_fl_latest_year), adWriteLine
          End If
          gStream.WriteText "</P>", adWriteLine

          ' dynasty information
          '
          tStr = "<P><I>Dynasty</I>: "
          If IsNull(!c_dynasty) Then
               tStr = tStr + "[Unknown]"
          Else
               tStr = tStr + !c_dynasty + " " + !c_dynasty_chn
          End If
          gStream.WriteText tStr + "</P>", adWriteLine
          '
          ' Index Address information
è¡¨ - 4


                  'c_index_addr_name, c_index_addr_chn, c_index_addr_type_desc, c_index_addr_type_chn, x_coord, y_c
oord, "

                  gStream.WriteText "<P><I>Index Address</I>", adWriteLine
                  If IsNull(!c_index_addr_name) Then
                       gStream.WriteText "[Unknown]</P>", adWriteLine
                  Else
                       tStr = Trim(!c_index_addr_name) + " " + Trim(!c_index_addr_chn)
                       gStream.WriteText tStr + "<BR>", adWriteLine
                       If Not IsNull(!x_coord) Then
                           gStream.WriteText "Coordinates: " + Str(!x_coord) + tC + Str(!y_coord) + "<BR>", adWriteL
ine
                      End If
                      '
                      gStream.WriteText "<I>Index Address Type</I>", adWriteLine
                      If IsNull(!c_index_addr_type_desc) Then
                           tStr = "Unknown "
                      Else
                           tStr = Trim(!c_index_addr_type_desc) + " "
                      End If
                      '
                      If Not IsNull(!c_index_addr_type_chn) Then
                           tStr = tStr + Trim(!c_index_addr_type_chn)
                      End If
                      gStream.WriteText tStr + "</P>", adWriteLine
                  End If

                  '", c_ethnicity_chn, c_ethnicity_rmn, "
                  If Not IsNull(!c_ethnicity_chn) Then
                      gStream.WriteText "<P>Ethnicity: " + !c_ethnicity_rmn + " " + !c_ethnicity_chn + "</P>", adWr
iteLine
                  End If
                  '"c_choronym_desc, c_choronym_chn, "
                  If Not IsNull(!c_choronym_desc) Then
                      gStream.WriteText "<P>Choronym: " + !c_choronym_desc + " " + !c_choronym_chn + "</P>", adWrit
eLine
                  End If
                  '"c_household_status_desc, c_household_status_desc_chn "
                  If Not IsNull(!c_household_status_desc) Then
                      gStream.WriteText "<P>Household Status: " + !c_household_status_desc + " " + !c_household_sta
tus_desc_chn + "</P>", adWriteLine
                  End If
                  .MoveNext
             Loop
         End With
    Else
         'The user pressed Cancel.
         GoTo Exit_CmdSaveToFile_Click
    End If
    '
    ' Alt Names
    '
    MsgBox "Writing alternate names"
    tQueryStr = "SELECT ZZZ_ALTNAME_DATA.c_personid, ZZZ_ALTNAME_DATA.c_alt_name, ZZZ_ALTNAME_DATA.c_alt_name_chn
, " + _
             "ZZZ_ALTNAME_DATA.c_name_type_desc, ZZZ_ALTNAME_DATA.c_name_type_desc_chn, ZZZ_ALTNAME_DATA.c_sequenc
e, ZZZ_ALTNAME_DATA.c_source, " + _
             "ZZZ_ALTNAME_DATA.c_title_chn, ZZZ_ALTNAME_DATA.c_title, ZZZ_ALTNAME_DATA.c_pages, ZZZ_ALTNAME_DATA.c
_notes " + _
         "FROM ZZZ_ALTNAME_DATA " + _
         "WHERE (((ZZZ_ALTNAME_DATA.c_personid)=" + tStrPersonID + "))"
    Set tRst = CurrentDb.OpenRecordset(tQueryStr)

      If Not (tRst.EOF) Then
          '
          tRst.MoveLast
          tStr = "<P><B><I>Alternate Names</I></B> "
          If tRst.RecordCount = 1 Then
               tStr = tStr + "(1 record)"
          Else
               tStr = tStr + "(" + Trim(Str(tRst.RecordCount)) + " records)"
          End If
          gStream.WriteText tStr + "</P>", adWriteLine
          '
          ' !c_alt_name, !c_alt_name_chn, " + _
          ' !c_name_type_desc, !c_name_type_desc_chn, !c_sequence, !c_source, " + _
          ' !c_title_chn, !c_title, !c_pages, !c_notes
          '
          With tRst
è¡¨ - 5

            .MoveFirst
            Do While Not .EOF
                 '
                 tStr = "<P><I>Name</I>: " + Trim(!c_alt_name) + " " + Trim(!c_alt_name_chn) + "<BR>"
                 gStream.WriteText tStr, adWriteLine
                 '
                 tStr = "Type: " + Trim(!c_name_type_desc) + " " + Trim(!c_name_type_desc_chn) + "<BR>"
                 gStream.WriteText tStr, adWriteLine
                 '
                 If Not IsNull(!c_sequence) Then
                     tStr = "Sequence: " + Trim(Str(!c_sequence)) + "<BR>"
                     gStream.WriteText tStr, adWriteLine
                 End If
                 '
                 If Not IsNull(!c_title) Then
                     tStr = "Source: " + Trim(!c_title) + " " + Trim(!c_title_chn)
                     If Not IsNull(!c_pages) Then
                         tStr = tStr + " (" + Trim(!c_pages) + ")"
                     End If
                     gStream.WriteText tStr + "<BR>", adWriteLine
                 End If
                 '
                 If Not IsNull(!c_notes) Then
                     tStr = "Notes: " + Trim(!c_notes) + "<BR>"
                     gStream.WriteText tStr, adWriteLine
                 End If
                 '
                 gStream.WriteText "</P>", adWriteLine
                 '
                 .MoveNext
            Loop
        End With
    End If
    '
    ' now Places
    '
    ' replace the tLang condition with the count of addresses
    '
    tQueryStr = "SELECT ZZZ_BIOG_ADDR_DATA.c_personid, ZZZ_BIOG_ADDR_DATA.c_addr_name, ZZZ_BIOG_ADDR_DATA.c_addr_
chn, " + _
            "ZZZ_BIOG_ADDR_DATA.x_coord, ZZZ_BIOG_ADDR_DATA.y_coord, ZZZ_BIOG_ADDR_DATA.c_addr_desc, ZZZ_BIOG_ADD
R_DATA.c_addr_desc_chn, " + _
            "ZZZ_BIOG_ADDR_DATA.c_firstyear, ZZZ_BIOG_ADDR_DATA.c_lastyear, ZZZ_BIOG_ADDR_DATA.c_source_title, ZZ
Z_BIOG_ADDR_DATA.c_source_chn, " + _
            "ZZZ_BIOG_ADDR_DATA.c_pages, ZZZ_BIOG_ADDR_DATA.c_notes " + _
        "FROM ZZZ_BIOG_ADDR_DATA " + _
        "WHERE (((ZZZ_BIOG_ADDR_DATA.c_personid)=" + tStrPersonID + "))"

    Set tRst = CurrentDb.OpenRecordset(tQueryStr)

    MsgBox "Writing address information"
    If Not (tRst.EOF) Then
        '
        ' now the BIOG_ADDR data
        '
        tRst.MoveLast
        tStr = "<P><B><I>Place Information</I></B> "
        If tRst.RecordCount = 1 Then
             tStr = tStr + "(1 record)"
        Else
             tStr = tStr + "(" + Trim(Str(tRst.RecordCount)) + " records)"
        End If
        gStream.WriteText tStr + "</P>", adWriteLine
        '
        ' c_addr_name, c_addr_chn, x_coord, y_coord, c_addr_desc, c_addr_desc_chn, "
        ' c_firstyear, c_lastyear, "
        ' c_source_title, c_source_chn, c_pages, c_notes "

        With tRst
            .MoveFirst
            Do While Not .EOF
                tStr = "<P><I>" + Trim(!c_addr_desc) + " " + Trim(c_addr_desc_chn) + "</I>: " + Trim(!c_addr_name
) + " " + Trim(!c_addr_chn)
                gStream.WriteText tStr, adWriteLine

                If Not IsNull(!x_coord) Then
                    '
                    tStr = " (" + Trim(Str(!x_coord)) + tC + Trim(Str(!y_coord)) + ")<BR>"
                    gStream.WriteText tStr, adWriteLine
                End If
è¡¨ - 6


                    If Not IsNull(!c_firstyear) Then
                        tStr = "First year: " + Trim(Str(!c_firstyear)) + "<BR>"
                        gStream.WriteText tStr, adWriteLine
                    End If

                    If Not IsNull(!c_lastyear) Then
                        tStr = "Last year: " + Trim(Str(!c_lastyear)) + "<BR>"
                        gStream.WriteText tStr, adWriteLine
                    End If

                    If Not IsNull(!c_source_title) Then
                        tStr = "Source: " + Trim(!c_source_title) + " " + Trim(!c_source_chn)
                        If Not IsNull(!c_pages) Then
                            tStr = tStr + " " + Trim(!c_pages)
                        End If
                        tStr = tStr + "<BR>"
                        gStream.WriteText tStr, adWriteLine
                    End If

                    If Not IsNull(!c_notes) Then
                        tStr = "Notes: " + Trim(!c_notes) + ")<BR>"
                        gStream.WriteText tStr, adWriteLine
                    End If
                    gStream.WriteText "</P>", adWriteLine
                    .MoveNext
             Loop
         End With
         '
     End If

    ' now kinship
    '
    tQueryStr = "SELECT ZZ_SCRATCH_KIN.c_kin_id, ZZ_SCRATCH_KIN.c_kin_name, ZZ_SCRATCH_KIN.c_kin_chn, ZZ_SCRATCH_
KIN.c_kin_index_year, " + _
            "ZZ_SCRATCH_KIN.c_kin_dynasty, ZZ_SCRATCH_KIN.c_kin_dynasty_chn, ZZ_SCRATCH_KIN.c_kin_sex, ZZ_SCRATCH
_KIN.c_kin_rel_total, " + _
            "ZZ_SCRATCH_KIN.c_up, ZZ_SCRATCH_KIN.c_down, ZZ_SCRATCH_KIN.c_marriage, ZZ_SCRATCH_KIN.c_collateral,
ZZ_SCRATCH_KIN.c_kin_addr_name, " + _
            "ZZ_SCRATCH_KIN.c_kin_addr_chn, ZZ_SCRATCH_KIN.kin_x_coord, ZZ_SCRATCH_KIN.kin_y_coord, ZZ_SCRATCH_KI
N.c_source_text, " + _
            "ZZ_SCRATCH_KIN.c_source_text_chn, ZZ_SCRATCH_KIN.c_pages, ZZ_SCRATCH_KIN.c_notes " + _
        "FROM ZZ_SCRATCH_KIN"
    Set tRst = CurrentDb.OpenRecordset(tQueryStr)

     MsgBox "Writing kinship data"
     If Not (tRst.EOF) Then
         '
         tRst.MoveLast
         tStr = "<P><B><I>Kinship</I></B> "
         If tRst.RecordCount = 1 Then
              tStr = tStr + "(1 record)"
         Else
              tStr = tStr + "(" + Trim(Str(tRst.RecordCount)) + " records)"
         End If
         gStream.WriteText tStr + "</P>", adWriteLine

        ' c_kin_id, c_kin_name, c_kin_chn, c_kin_sex,
        ' c_kin_rel_total, c_up, c_down, c_marriage, c_collateral,
        ' c_kin_index_year, c_kin_dynasty, c_kin_dynasty_chn,
        ' c_kin_addr_name, c_kin_addr_chn, kin_x_coord, kin_y_coord,
        ' c_source_text, c_source_text_chn, c_pages, c_notes"
        '
        With tRst
            .MoveFirst
            Do While Not .EOF
                tStr = "<P>" + Trim(!c_kin_name) + " " + Trim(!c_kin_chn) + "(" + !c_kin_sex + ") [CBDB ID " + Tr
im(Str(!c_kin_id)) + "]<BR>"
                gStream.WriteText tStr, adWriteLine

                    tStr = "Relationship: " + Trim(!c_kin_rel_total) + " (" + Str(!c_up) + "-" + Str(!c_down) + "-" +
 _
                        Str(!c_marriage) + "-" + Str(!c_collateral) + ")<BR>"
                    gStream.WriteText tStr, adWriteLine

                    If Not IsNull(!c_kin_index_year) Then
                        tStr = "Index Year: " + Trim(Str(!c_kin_index_year)) + "<BR>"
                        gStream.WriteText tStr, adWriteLine
                    End If
è¡¨ - 7

                If Not IsNull(!c_kin_dynasty) Then
                    tStr = "Dynasty: " + Trim(!c_kin_dynasty) + " " + Trim(!c_kin_dynasty_chn) + "<BR>"
                    gStream.WriteText tStr, adWriteLine
                End If

                If Not IsNull(!c_kin_addr_name) Then
                    tStr = "Index Address: " + Trim(!c_kin_addr_name) + " " + Trim(!c_kin_addr_chn)
                    If Not IsNull(!kin_x_coord) Then
                        tStr = tStr + " (" + Trim(Str(!kin_x_coord)) + tC + Trim(Str(!kin_y_coord)) + ")"
                    End If
                    tStr = tStr + "<BR>"
                    gStream.WriteText tStr, adWriteLine
                End If

                If Not IsNull(!c_source_text) Then
                    tStr = "Source: " + Trim(!c_source_text) + " " + Trim(!c_source_text_chn)
                    If Not IsNull(!c_pages) Then
                        tStr = tStr + " (" + Trim(!c_pages) + ")"
                    End If
                    tStr = tStr + "<BR>"
                    gStream.WriteText tStr, adWriteLine
                End If

                If Not IsNull(!c_notes) Then
                    tStr = "Notes: " + Trim(!c_notes) + "<BR>"
                    gStream.WriteText tStr, adWriteLine
                End If
                gStream.WriteText "</P>", adWriteLine
                .MoveNext
             Loop
        End With
        '
    End If
    '
    ' now Associations
    '
    tQueryStr = "SELECT ZZZ_NONKIN_BIOG_ADDR.c_personid, ZZZ_NONKIN_BIOG_ADDR.c_node_id, ZZZ_NONKIN_BIOG_ADDR.c_n
ode_name, " + _
             "ZZZ_NONKIN_BIOG_ADDR.c_node_chn , ZZZ_NONKIN_BIOG_ADDR.c_node_index_year, ZZZ_NONKIN_BIOG_ADDR.c_nod
e_dynasty, " + _
             "ZZZ_NONKIN_BIOG_ADDR.c_node_dynasty_chn, ZZZ_NONKIN_BIOG_ADDR.c_node_female, ZZZ_NONKIN_BIOG_ADDR.c_
link_chn, " + _
             "ZZZ_NONKIN_BIOG_ADDR.c_link_desc, ZZZ_NONKIN_BIOG_ADDR.c_lit_genre_desc, ZZZ_NONKIN_BIOG_ADDR.c_lit_
genre_desc_chn, " + _
             "ZZZ_NONKIN_BIOG_ADDR.c_occasion_desc, ZZZ_NONKIN_BIOG_ADDR.c_occasion_desc_chn, ZZZ_NONKIN_BIOG_ADDR
.c_topic_desc, " + _
             "ZZZ_NONKIN_BIOG_ADDR.c_topic_desc_chn, ZZZ_NONKIN_BIOG_ADDR.c_text_title, ZZZ_NONKIN_BIOG_ADDR.c_nod
e_addr_name, " + _
             "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_chn, ZZZ_NONKIN_BIOG_ADDR.node_xcoord, ZZZ_NONKIN_BIOG_ADDR.node_yc
oord, " + _
             "ZZZ_NONKIN_BIOG_ADDR.c_inst_name_hz, ZZZ_NONKIN_BIOG_ADDR.c_inst_name_py, ZZZ_NONKIN_BIOG_ADDR.c_lin
k_count, " + _
             "ZZZ_NONKIN_BIOG_ADDR.c_assoc_year, ZZZ_NONKIN_BIOG_ADDR.c_source_chn, ZZZ_NONKIN_BIOG_ADDR.c_source_
title, " + _
             "ZZZ_NONKIN_BIOG_ADDR.c_pages, ZZZ_NONKIN_BIOG_ADDR.c_notes " + _
        "FROM ZZZ_NONKIN_BIOG_ADDR " + _
        "WHERE (((ZZZ_NONKIN_BIOG_ADDR.c_personid)=" + tStrPersonID + "))"
    Set tRst = CurrentDb.OpenRecordset(tQueryStr)

    MsgBox "Writing association data"
    If Not (tRst.EOF) Then
        '
        tRst.MoveLast
        tStr = "<P><B><I>Associations</I></B> "
        If tRst.RecordCount = 1 Then
             tStr = tStr + "(1 record)"
        Else
             tStr = tStr + "(" + Trim(Str(tRst.RecordCount)) + " records)"
        End If
        gStream.WriteText tStr + "</P>", adWriteLine
        '
        ' c_personid, c_node_id, c_node_name, c_node_chn , c_node_female,
        ' c_link_chn, c_link_desc, c_assoc_year, c_link_count,
        ' c_text_title,
        ' c_node_index_year, c_node_dynasty, c_node_dynasty_chn,
        ' c_node_addr_name, c_node_addr_chn, node_xcoord, node_ycoord,
        ' c_lit_genre_desc, c_lit_genre_desc_chn, c_occasion_desc, c_occasion_desc_chn, c_topic_desc, c_topic_des
c_chn,
        ' c_inst_name_hz, c_inst_name_py,
        ' c_source_chn, c_source_title,
è¡¨ - 8

          ' c_pages, c_notes

          With tRst
              .MoveFirst
              Do While Not .EOF
                  tStr = "<P>" + !c_node_name + " " + !c_node_chn + IIf(!c_node_female, " (F)", " (M)") + "<BR>"
                  gStream.WriteText tStr, adWriteLine

                     tStr = !c_link_desc + " " + !c_link_chn
                     If Not IsNull(!c_assoc_year) Then
                         tStr = tStr + "(Year: " + Trim(Str(!c_assoc_year)) + ")"
                     End If
                     If Not IsNull(!c_link_count) Then
                         tStr = tStr + "[Count: " + Trim(Str(!c_link_count)) + "]"
                     End If
                     gStream.WriteText tStr + "<BR>", adWriteLine

                     If Not IsNull(!c_text_title) Then
                         tStr = "Title: " + Trim(!c_text_title) + "<BR>"
                         gStream.WriteText tStr, adWriteLine
                     End If

                     tStr = "<I>Personal Information</I><BR>"
                     gStream.WriteText tStr, adWriteLine

                     If Not IsNull(!c_node_index_year) Then
                         tStr = "Index Year: " + Trim(Str(!c_node_index_year)) + "<BR>"
                         gStream.WriteText tStr, adWriteLine
                     End If

                     If Not IsNull(!c_node_dynasty) Then
                         tStr = "Dynasty: " + Trim(!c_node_dynasty) + Trim(!c_node_dynasty_chn) + "<BR>"
                         gStream.WriteText tStr, adWriteLine
                     End If

                     If Not IsNull(!c_node_addr_name) Then
                         tStr = "Index Address: " + Trim(!c_node_addr_name) + Trim(!c_node_addr_chn)
                         If Not IsNull(!node_xcoord) Then
                             tStr = tStr + " (" + Trim(Str(!node_xcoord)) + tC + Trim(Str(!node_ycoord)) + ")"
                         End If
                         gStream.WriteText tStr + "<BR>", adWriteLine
                     End If

                     If Not IsNull(!c_lit_genre_desc) Then
                         tStr = "Literary Genre: " + Trim(!c_lit_genre_desc) + Trim(!c_lit_genre_desc_chn) + "<BR>"
                         gStream.WriteText tStr, adWriteLine
                     End If

                     If Not IsNull(!c_occasion_desc) Then
                         tStr = "Occasion: " + Trim(!c_occasion_desc) + Trim(!c_occasion_desc_chn) + "<BR>"
                         gStream.WriteText tStr, adWriteLine
                     End If

                     If Not IsNull(!c_topic_desc) Then
                         tStr = "Topic: " + Trim(!c_topic_desc) + Trim(!c_topic_desc_chn) + "<BR>"
                         gStream.WriteText tStr, adWriteLine
                     End If

                     If Not IsNull(!c_inst_name_py) Then
                         tStr = "Institution: " + Trim(!c_inst_name_py) + Trim(!c_inst_name_hz) + "<BR>"
                         gStream.WriteText tStr, adWriteLine
                     End If

                     If Not IsNull(!c_source_title) Then
                         tStr = "Source: " + Trim(!c_source_title) + " " + Trim(!c_source_chn)
                         If Not IsNull(!c_pages) Then
                             tStr = tStr + " (" + Trim(!c_pages) + ")"
                         End If
                         tStr = tStr + "<BR>"
                         gStream.WriteText tStr, adWriteLine
                     End If

                     If Not IsNull(!c_notes) Then
                         tStr = "Notes: " + Trim(!c_notes) + "<BR>"
                         gStream.WriteText tStr, adWriteLine
                     End If
                     .MoveNext
                     gStream.WriteText "</P>", adWriteLine
              Loop
          End With
è¡¨ - 9

        '
    End If
    '
    ' now Entry
    '
    tQueryStr = "SELECT ZZZ_ENTRY_DATA.c_personid, ZZZ_ENTRY_DATA.c_entry_desc, ZZZ_ENTRY_DATA.c_entry_desc_chn,
" + _
             "ZZZ_ENTRY_DATA.c_sequence, ZZZ_ENTRY_DATA.c_exam_rank, ZZZ_ENTRY_DATA.c_kinrel_chn, ZZZ_ENTRY_DATA.c
_kinrel, " + _
             "ZZZ_ENTRY_DATA.c_kin_name, ZZZ_ENTRY_DATA.c_kin_name_chn, ZZZ_ENTRY_DATA.c_assoc_desc, ZZZ_ENTRY_DAT
A.c_assoc_desc_chn, " + _
             "ZZZ_ENTRY_DATA.c_assoc_name, ZZZ_ENTRY_DATA.c_assoc_name_chn, ZZZ_ENTRY_DATA.c_year, ZZZ_ENTRY_DATA.
c_inst_name_hz, " + _
             "ZZZ_ENTRY_DATA.c_inst_name_py, ZZZ_ENTRY_DATA.c_title_chn, ZZZ_ENTRY_DATA.c_title, ZZZ_ENTRY_DATA.c_
pages, " + _
             "ZZZ_ENTRY_DATA.c_notes, ZZZ_ENTRY_DATA.c_age, ZZZ_ENTRY_DATA.c_parental_status_desc, ZZZ_ENTRY_DATA.
c_parental_status_desc_chn, " + _
             "ZZZ_ENTRY_DATA.c_entry_addr_name, ZZZ_ENTRY_DATA.c_entry_addr_chn, ZZZ_ENTRY_DATA.c_entry_xcoord, ZZ
Z_ENTRY_DATA.c_entry_ycoord " + _
        "FROM ZZZ_ENTRY_DATA " + _
        "WHERE (((ZZZ_ENTRY_DATA.c_personid)=" + tStrPersonID + "))"
    Set tRst = CurrentDb.OpenRecordset(tQueryStr)

    MsgBox "Writing entry data"
    If Not (tRst.EOF) Then
        '
        ' !c_entry_desc, !c_entry_desc_chn, !c_year, !c_sequence,!c_age, !c_exam_rank,
        ' !c_parental_status_desc, !c_parental_status_desc_chn,
        ' !c_entry_addr_name, !c_entry_addr_chn, !c_entry_xcoord, !c_entry_ycoord
        ' !c_kinrel_chn, !c_kinrel, !c_kin_name, !c_kin_name_chn,
        ' !c_assoc_desc, !c_assoc_desc_chn, !c_assoc_name, !c_assoc_name_chn,
        ' !c_inst_name_hz, !c_inst_name_py,
        ' !c_title_chn, !c_title, !c_pages, !c_notes,
        '
        tRst.MoveLast
        tStr = "<P><B><I>Entry into Government</I></B> "
        If tRst.RecordCount = 1 Then
             tStr = tStr + "(1 record)"
        Else
             tStr = tStr + "(" + Trim(Str(tRst.RecordCount)) + " records)"
        End If
        gStream.WriteText tStr + "</P>", adWriteLine
        '
        With tRst
             .MoveFirst
             Do While Not .EOF
                 '
                 tStr = "<P><I>Entry</I>: " + Trim(!c_entry_desc) + " " + Trim(!c_entry_desc_chn) + "<BR>"
                 gStream.WriteText tStr, adWriteLine
                 '
                 If Not IsNull(!c_year) Then
                     tStr = "Year: " + Trim(Str(!c_year)) + "<BR>"
                     gStream.WriteText tStr, adWriteLine
                 End If
                 '
                 If Not IsNull(!c_sequence) Then
                     tStr = "Sequence: " + Trim(Str(!c_sequence)) + "<BR>"
                     gStream.WriteText tStr, adWriteLine
                 End If
                 '
                 If Not IsNull(!c_age) Then
                     tStr = "Age: " + Trim(Str(!c_age)) + "<BR>"
                     gStream.WriteText tStr, adWriteLine
                 End If
                 '
                 If Not IsNull(!c_exam_rank) Then
                     tStr = "Exam Rank: " + Trim(!c_exam_rank) + "<BR>"
                     gStream.WriteText tStr, adWriteLine
                 End If
                 '
                 If Not IsNull(!c_parental_status_desc) Then
                     tStr = "Parental Status: " + Trim(!c_parental_status_desc) + " " + Trim(!c_parental_status_de
sc_chn) + "<BR>"
                     gStream.WriteText tStr, adWriteLine
                 End If
                 '
                 If Not IsNull(!c_entry_addr_name) Then
                     tStr = "Location: " + Trim(!c_entry_addr_name) + " " + Trim(!c_entry_addr_chn)
                     If Not IsNull(!c_entry_xcoord) Then
                         tStr = tStr + " (" + Trim(Str(!c_entry_xcoord)) + tC + Trim(Str(!c_entry_ycoord)) + ")"
è¡¨ - 10

                    End If
                    gStream.WriteText tStr + "<BR>", adWriteLine
                End If
                '
                If Not IsNull(!c_kinrel) Then
                    tStr = "Kinship Relation: " + Trim(!c_kinrel) + " " + Trim(!c_kinrel_chn)
                    gStream.WriteText tStr + "<BR>", adWriteLine
                    If Not IsNull(!c_kin_name) Then
                        tStr = "Kin Name: " + Trim(!c_kin_name) + " " + Trim(!c_kin_name_chn)
                        gStream.WriteText tStr + "<BR>", adWriteLine
                    End If
                End If
                '
                If Not IsNull(!c_assoc_desc) Then
                    tStr = "Association: " + Trim(!c_assoc_desc) + " " + Trim(!c_assoc_desc_chn)
                    gStream.WriteText tStr + "<BR>", adWriteLine
                    If Not IsNull(!c_kin_name) Then
                        tStr = "Associate Name: " + Trim(!c_assoc_name) + " " + Trim(!c_assoc_name_chn)
                        gStream.WriteText tStr + "<BR>", adWriteLine
                    End If
                End If
                '
                If Not IsNull(!c_inst_name_py) Then
                    tStr = "Institution: " + Trim(!c_inst_name_py) + " " + Trim(!c_inst_name_hz) + "<BR>"
                    gStream.WriteText tStr, adWriteLine
                End If
                '
                If Not IsNull(!c_title) Then
                    tStr = "Source: " + Trim(!c_title) + " " + Trim(!c_title_chn)
                    If Not IsNull(!c_pages) Then
                        tStr = tStr + " (" + Trim(!c_pages) + ")"
                    End If
                    gStream.WriteText tStr + "<BR>", adWriteLine
                End If
                '
                If Not IsNull(!c_notes) Then
                    tStr = "Notes: " + Trim(!c_notes) + "<BR>"
                    gStream.WriteText tStr, adWriteLine
                End If
                '
                gStream.WriteText "</P>", adWriteLine
                '
                .MoveNext
             Loop
         End With
    End If
    '
    ' now Office
    '
    tQueryStr = "SELECT ZZZ_POSTED_TO_ADDR_DATA.c_personid, ZZZ_POSTED_TO_ADDR_DATA.c_office_pinyin, ZZZ_POSTED_T
O_ADDR_DATA.c_office_chn, " + _
             "ZZZ_POSTED_TO_ADDR_DATA.c_office_trans, ZZZ_POSTED_TO_ADDR_DATA.c_sequence, ZZZ_POSTED_TO_ADDR_DATA.
c_firstyear, " + _
             "ZZZ_POSTED_TO_ADDR_DATA.c_lastyear, ZZZ_POSTED_TO_ADDR_DATA.c_appt_desc_chn, ZZZ_POSTED_TO_ADDR_DATA
.c_appt_desc, " + _
             "ZZZ_POSTED_TO_ADDR_DATA.c_assume_office_desc_chn, ZZZ_POSTED_TO_ADDR_DATA.c_assume_office_desc, " +
_
             "ZZZ_POSTED_TO_ADDR_DATA.c_inst_name_py, ZZZ_POSTED_TO_ADDR_DATA.c_inst_name_hz, ZZZ_POSTED_TO_ADDR_D
ATA.c_title, " + _
             "ZZZ_POSTED_TO_ADDR_DATA.c_title_chn, ZZZ_POSTED_TO_ADDR_DATA.c_pages, ZZZ_POSTED_TO_ADDR_DATA.c_note
s, " + _
             "ZZZ_POSTED_TO_ADDR_DATA.c_dynasty, ZZZ_POSTED_TO_ADDR_DATA.c_dynasty_chn, ZZZ_POSTED_TO_ADDR_DATA.c_
category_desc, " + _
             "ZZZ_POSTED_TO_ADDR_DATA.c_category_desc_chn, ZZZ_POSTED_TO_ADDR_DATA.c_office_addr_name, ZZZ_POSTED_
TO_ADDR_DATA.c_office_addr_chn, " + _
             "ZZZ_POSTED_TO_ADDR_DATA.office_x_coord, ZZZ_POSTED_TO_ADDR_DATA.office_y_coord " + _
         "FROM ZZZ_POSTED_TO_ADDR_DATA " + _
         "WHERE (((ZZZ_POSTED_TO_ADDR_DATA.c_personid)=" + tStrPersonID + "))"
    Set tRst = CurrentDb.OpenRecordset(tQueryStr)

    MsgBox "Writing postings data"
    If Not (tRst.EOF) Then
        tRst.MoveLast
        tStr = "<P><B><I>Office Appointments</I></B> "
        If tRst.RecordCount = 1 Then
             tStr = tStr + "(1 record)"
        Else
             tStr = tStr + "(" + Trim(Str(tRst.RecordCount)) + " records)"
        End If
        gStream.WriteText tStr + "</P>", adWriteLine
è¡¨ - 11

           '
           With tRst
               .MoveFirst
               '
               ' !c_personid, !c_office_pinyin, !c_office_chn, !c_office_trans
               ' !c_office_addr_name, !c_office_addr_chn
               ' !office_x_coord, !office_y_coord
               ' !c_sequence, !c_dynasty, !c_dynasty_chn, !c_firstyear, !c_lastyear
               ' !c_category_desc, !c_category_desc_chn, !c_appt_desc_chn, !c_appt_desc
               ' !c_assume_office_desc_chn, !c_assume_office_desc
               ' !c_inst_name_py, !c_inst_name_hz
               ' !c_title, !c_title_chn, !c_pages, !c_notes

               Do While Not .EOF
                   ' the ID of the person
                   tStr = "<P><I>Appointment</I>: " + Trim(!c_office_pinyin) + " " + Trim(!c_office_chn)
                   If Not IsNull(!c_office_trans) Then
                       tStr = tStr + " " + Trim(!c_office_trans)
                   End If
                   gStream.WriteText tStr + "<BR>", adWriteLine
                   '
                   If Not IsNull(!c_office_addr_name) Then
                       tStr = "Location: " + Trim(!c_office_addr_name) + " " + Trim(!c_office_addr_chn)
                       If Not IsNull(!office_x_coord) Then
                           tStr = tStr + " (" + Trim(Str(!office_x_coord)) + tC + Trim(Str(!office_y_coord)) + ")"
                       End If
                       gStream.WriteText tStr + "<BR>", adWriteLine
                   End If
                   '
                   If Not IsNull(!c_sequence) Then
                       tStr = "Sequence: " + Trim(Str(!c_sequence)) + "<BR>"
                       gStream.WriteText tStr, adWriteLine
                   End If
                   '
                   If Not IsNull(!c_dynasty) Then
                       tStr = "Dynasty: " + Trim(!c_dynasty) + " " + Trim(!c_dynasty_chn) + "<BR>"
                       gStream.WriteText tStr, adWriteLine
                   End If
                   '
                   If Not IsNull(!c_firstyear) Then
                       tStr = "First Year: " + Trim(Str(!c_firstyear)) + "<BR>"
                       gStream.WriteText tStr, adWriteLine
                   End If
                   '
                   If Not IsNull(!c_lastyear) Then
                       tStr = "Last Year: " + Trim(Str(!c_lastyear)) + "<BR>"
                       gStream.WriteText tStr, adWriteLine
                   End If
                   '
                   If Not IsNull(!c_category_desc) Then
                       tStr = "Category: " + Trim(!c_category_desc) + " " + Trim(!c_category_desc_chn) + "<BR>"
                       gStream.WriteText tStr, adWriteLine
                   End If
                   '
                   If Not IsNull(!c_appt_desc) Then
                       tStr = "Appointment Type: " + Trim(!c_appt_desc) + " " + Trim(!c_appt_desc_chn) + "<BR>"
                       gStream.WriteText tStr, adWriteLine
                   End If
                   '
                   If Not IsNull(!c_assume_office_desc) Then
                       tStr = "Assuming Office: " + Trim(!c_assume_office_desc) + " " + Trim(!c_assume_office_desc_c
hn) + "<BR>"
                       gStream.WriteText tStr, adWriteLine
                   End If
                   '
                   If Not IsNull(!c_inst_name_py) Then
                       tStr = "Institution: " + Trim(!c_inst_name_py) + " " + Trim(!c_inst_name_hz) + "<BR>"
                       gStream.WriteText tStr, adWriteLine
                   End If
                   '
                   If Not IsNull(!c_title) Then
                       tStr = "Source: " + Trim(!c_title) + " " + Trim(!c_title_chn)
                       If Not IsNull(!c_pages) Then
                           tStr = tStr + " (" + Trim(!c_pages) + ")"
                       End If
                       gStream.WriteText tStr + "<BR>", adWriteLine
                   End If
                   '
                   If Not IsNull(!c_notes) Then
                       tStr = "Notes: " + Trim(!c_notes) + "<BR>"
è¡¨ - 12

                    gStream.WriteText tStr, adWriteLine
                End If
                '
                gStream.WriteText "</P>", adWriteLine
                '
                .MoveNext
            Loop
        End With
    End If
    '
    ' now Status
    '
    tQueryStr = "SELECT ZZZ_STATUS_DATA.c_personid, ZZZ_STATUS_DATA.c_status_desc, ZZZ_STATUS_DATA.c_status_desc_
chn, " + _
            "ZZZ_STATUS_DATA.c_firstyear, ZZZ_STATUS_DATA.c_lastyear, ZZZ_STATUS_DATA.c_source, ZZZ_STATUS_DATA.c
_title_chn, " + _
            "ZZZ_STATUS_DATA.c_title, ZZZ_STATUS_DATA.c_pages, ZZZ_STATUS_DATA.c_notes " + _
        "FROM ZZZ_STATUS_DATA " + _
        "WHERE (((ZZZ_STATUS_DATA.c_personid)=" + tStrPersonID + "))"
    Set tRst = CurrentDb.OpenRecordset(tQueryStr)

    MsgBox "Writing status data"
    If Not (tRst.EOF) Then
        '
        tRst.MoveLast
        tStr = "<P><B><I>Social Distinction</I></B> "
        If tRst.RecordCount = 1 Then
             tStr = tStr + "(1 record)"
        Else
             tStr = tStr + "(" + Trim(Str(tRst.RecordCount)) + " records)"
        End If
        gStream.WriteText tStr + "</P>", adWriteLine
        '
        ' !c_personid, !c_status_desc, !c_status_desc_chn,
        ' !c_firstyear, !c_lastyear, !c_source, !c_title_chn, !c_title, !c_pages, !c_notes
        '
        With tRst
             .MoveFirst
             Do While Not .EOF
                  '
                  tStr = "<P><I>Status</I>: " + Trim(!c_status_desc) + " " + Trim(!c_status_desc_chn) + "<BR>"
                  gStream.WriteText tStr, adWriteLine
                  '
                  If Not IsNull(!c_firstyear) Then
                      tStr = "First Year: " + Trim(Str(!c_firstyear)) + "<BR>"
                      gStream.WriteText tStr, adWriteLine
                  End If
                  '
                  If Not IsNull(!c_lastyear) Then
                      tStr = "Last Year: " + Trim(Str(!c_lastyear)) + "<BR>"
                      gStream.WriteText tStr, adWriteLine
                  End If
                  '
                  If Not IsNull(!c_title) Then
                      tStr = "Source: " + Trim(!c_title) + " " + Trim(!c_title_chn)
                      If Not IsNull(!c_pages) Then
                          tStr = tStr + " (" + Trim(!c_pages) + ")"
                      End If
                      gStream.WriteText tStr + "<BR>", adWriteLine
                  End If
                  '
                  If Not IsNull(!c_notes) Then
                      tStr = "Notes: " + Trim(!c_notes) + "<BR>"
                      gStream.WriteText tStr, adWriteLine
                  End If
                  '
                  gStream.WriteText "</P>", adWriteLine
                  '
                  .MoveNext
             Loop
        End With
    End If
    '
    ' now Organizations
    '
    tQueryStr = "SELECT ZZZ_BIOG_INST_DATA.c_personid, ZZZ_BIOG_INST_DATA.c_inst_name_hz, ZZZ_BIOG_INST_DATA.c_in
st_name_py, " + _
             "ZZZ_BIOG_INST_DATA.c_inst_type_hz, ZZZ_BIOG_INST_DATA.c_inst_addr_pinyin, ZZZ_BIOG_INST_DATA.c_inst_
addr_chn, " + _
             "ZZZ_BIOG_INST_DATA.c_inst_addr_type_desc, ZZZ_BIOG_INST_DATA.c_inst_addr_type_chn, ZZZ_BIOG_INST_DAT
è¡¨ - 13

A.c_bi_role_desc, " + _
            "ZZZ_BIOG_INST_DATA.c_bi_role_chn, ZZZ_BIOG_INST_DATA.c_bi_begin_year, ZZZ_BIOG_INST_DATA.c_bi_end_ye
ar, " + _
            "ZZZ_BIOG_INST_DATA.c_source_chn, ZZZ_BIOG_INST_DATA.c_source_py, ZZZ_BIOG_INST_DATA.c_pages, ZZZ_BIO
G_INST_DATA.c_notes, " + _
            "ZZZ_BIOG_INST_DATA.inst_xcoord, ZZZ_BIOG_INST_DATA.inst_ycoord " + _
        "FROM ZZZ_BIOG_INST_DATA " + _
        "WHERE (((ZZZ_BIOG_INST_DATA.c_personid)=" + tStrPersonID + "))"
    Set tRst = CurrentDb.OpenRecordset(tQueryStr)

    MsgBox "Writing institution data"
    If Not (tRst.EOF) Then
        '
        tRst.MoveLast
        tStr = "<P><B><I>Institurions</I></B> "
        If tRst.RecordCount = 1 Then
             tStr = tStr + "(1 record)"
        Else
             tStr = tStr + "(" + Trim(Str(tRst.RecordCount)) + " records)"
        End If
        gStream.WriteText tStr + "</P>", adWriteLine
        '
        ' !c_personid, !c_inst_name_hz, !c_inst_name_py, _
        ' !c_inst_type_hz, !c_inst_addr_pinyin, !c_inst_addr_chn,
        ' !c_inst_addr_type_desc, !c_inst_addr_type_chn, !c_bi_role_desc,
        ' !c_bi_role_chn, !c_bi_begin_year, !c_bi_end_year,
        ' !c_source_chn, !c_source_py, !c_pages, !c_notes, !inst_xcoord, !inst_ycoord
        '
        With tRst
             .MoveFirst
             Do While Not .EOF
                 '
                 tStr = "<P><I>Institution</I>: " + Trim(!c_inst_name_py) + " " + Trim(!c_inst_name_hz) + "<BR>"
                 gStream.WriteText tStr, adWriteLine
                 '
                 If Not IsNull(!c_inst_type_hz) Then
                     tStr = "Type: " + Trim(!c_inst_type_hz) + "<BR>"
                     gStream.WriteText tStr, adWriteLine
                 End If

                If Not IsNull(!c_inst_addr_pinyin) Then
                    tStr = "Location: " + Trim(!c_inst_addr_pinyin) + " " + Trim(!c_inst_addr_chn)
                    If Not IsNull(!inst_xcoord) Then
                        tStr = tStr + " (" + Trim(Str(!inst_xcoord)) + tC + Trim(Str(!inst_ycoord)) + ")"
                    End If
                    If Not IsNull(!c_inst_addr_type_desc) Then
                        gStream.WriteText tStr + "<BR>", adWriteLine
                        tStr = "Type: " + !c_inst_addr_type_desc + " " + !c_inst_addr_type_chn
                    End If
                    gStream.WriteText tStr + "<BR>", adWriteLine
                End If

                tStr = "Role: " + Trim(!c_bi_role_desc) + " " + Trim(!c_bi_role_chn) + "<BR>"
                gStream.WriteText tStr, adWriteLine

                If Not IsNull(!c_bi_begin_year) Then
                    tStr = "First Year: " + Trim(Str(!c_bi_begin_year)) + "<BR>"
                    gStream.WriteText tStr, adWriteLine
                End If
                '
                If Not IsNull(!c_bi_end_year) Then
                    tStr = "Last Year: " + Trim(Str(!c_bi_end_year)) + "<BR>"
                    gStream.WriteText tStr, adWriteLine
                End If
                '
                If Not IsNull(!c_source_py) Then
                    tStr = "Source: " + Trim(!c_source_py) + " " + Trim(!c_source_chn)
                    If Not IsNull(!c_pages) Then
                        tStr = tStr + " (" + Trim(!c_pages) + ")"
                    End If
                    gStream.WriteText tStr + "<BR>", adWriteLine
                End If
                '
                If Not IsNull(!c_notes) Then
                    tStr = "Notes: " + Trim(!c_notes) + "<BR>"
                    gStream.WriteText tStr, adWriteLine
                End If
                '
                gStream.WriteText "</P>", adWriteLine
                '
è¡¨ - 14

                  .MoveNext
             Loop
        End With
    End If
    '
    ' now Texts
    '
    tQueryStr = "SELECT ZZZ_BIOG_TEXT_DATA.c_title, ZZZ_BIOG_TEXT_DATA.c_title_chn, ZZZ_BIOG_TEXT_DATA.c_bibl_cat
_desc, " + _
             "ZZZ_BIOG_TEXT_DATA.c_bibl_cat_desc_chn, ZZZ_BIOG_TEXT_DATA.c_role_desc, ZZZ_BIOG_TEXT_DATA.c_role_de
sc_chn, " + _
             "ZZZ_BIOG_TEXT_DATA.c_source_title, ZZZ_BIOG_TEXT_DATA.c_source_chn, ZZZ_BIOG_TEXT_DATA.c_pages, ZZZ_
BIOG_TEXT_DATA.c_notes, " + _
             "ZZZ_BIOG_TEXT_DATA.c_personid " + _
        "FROM ZZZ_BIOG_TEXT_DATA " + _
        "WHERE (((ZZZ_BIOG_TEXT_DATA.c_personid)=" + tStrPersonID + "))"
    Set tRst = CurrentDb.OpenRecordset(tQueryStr)

    MsgBox "Writing text data"
    If Not (tRst.EOF) Then
        '
        tRst.MoveLast
        tStr = "<P><B><I>Texts</I></B> "
        If tRst.RecordCount = 1 Then
             tStr = tStr + "(1 record)"
        Else
             tStr = tStr + "(" + Trim(Str(tRst.RecordCount)) + " records)"
        End If
        gStream.WriteText tStr + "</P>", adWriteLine
        '
        ' !c_title, !c_title_chn, !c_bibl_cat_desc, !c_bibl_cat_desc_chn,
        ' !c_role_desc, !c_role_desc_chn,
        ' !c_source_title, !c_source_chn, !c_pages, !c_notes,

        With tRst
            .MoveFirst
            Do While Not .EOF
                 '
                 tStr = "<P><I>Text</I>: "
                 If Not IsNull(!c_title) Then
                      tStr = tStr + Trim(!c_title) + " "
                 End If
                 If IsNull(!c_title_chn) Then
                      tStr = tStr + "Title Missing"
                 Else
                      tStr = tStr + Trim(!c_title_chn)
                 End If
                 tStr = tStr + "<BR>"
                 gStream.WriteText tStr, adWriteLine
                 '
                 If Not IsNull(!c_bibl_cat_desc) Then
                      tStr = "Category: " + Trim(!c_bibl_cat_desc) + " " + Trim(!c_bibl_cat_desc_chn) + "<BR>"
                      gStream.WriteText tStr, adWriteLine
                 End If
                 '
                 If Not IsNull(!c_role_desc) Then
                      tStr = "Role: " + Trim(!c_role_desc) + " " + Trim(!c_role_desc_chn) + "<BR>"
                      gStream.WriteText tStr, adWriteLine
                 End If
                 '
                 If Not IsNull(!c_source_title) Then
                      tStr = "Source: " + Trim(!c_source_title) + " " + Trim(!c_source_chn)
                      If Not IsNull(!c_pages) Then
                          tStr = tStr + " (" + Trim(!c_pages) + ")"
                      End If
                      gStream.WriteText tStr + "<BR>", adWriteLine
                 End If
                 '
                 If Not IsNull(!c_notes) Then
                      tStr = "Notes: " + Trim(!c_notes) + "<BR>"
                      gStream.WriteText tStr, adWriteLine
                 End If
                 '
                 gStream.WriteText "</P>", adWriteLine
                 '
                 .MoveNext
            Loop
        End With
    End If
    '
è¡¨ - 15

    ' now Sources
    '
    tQueryStr = "SELECT ZZZ_BIOG_SOURCE_DATA.c_personid, ZZZ_BIOG_SOURCE_DATA.c_title_chn, ZZZ_BIOG_SOURCE_DATA.c
_title, " + _
            "ZZZ_BIOG_SOURCE_DATA.c_pages, ZZZ_BIOG_SOURCE_DATA.c_notes, ZZZ_BIOG_SOURCE_DATA.c_hyperlink " + _
        "FROM ZZZ_BIOG_SOURCE_DATA " + _
        "WHERE (((ZZZ_BIOG_SOURCE_DATA.c_personid)=" + tStrPersonID + "))"
    Set tRst = CurrentDb.OpenRecordset(tQueryStr)

    MsgBox "Writing source data"
    If Not (tRst.EOF) Then
        '
        tRst.MoveLast
        tStr = "<P><B><I>Sources</I></B> "
        If tRst.RecordCount = 1 Then
             tStr = tStr + "(1 record)"
        Else
             tStr = tStr + "(" + Trim(Str(tRst.RecordCount)) + " records)"
        End If
        gStream.WriteText tStr + "</P>", adWriteLine
        '
        ' !c_title_chn, !c_title,
        ' !c_pages, !c_notes, !c_hyperlink
        '
        With tRst
             .MoveFirst
             Do While Not .EOF
                  '
                  tStr = "<P><I>Source</I>: " + Trim(!c_title) + " " + Trim(!c_title_chn)
                  If Not IsNull(!c_pages) Then
                      tStr = tStr + " (" + Trim(!c_pages) + ")"
                  End If
                  gStream.WriteText tStr + "<BR>", adWriteLine
                  '
                  If Not IsNull(!c_hyperlink) Then
                      tStr = "Link: " + Trim(!c_hyperlink) + "<BR>"
                      gStream.WriteText tStr, adWriteLine
                  End If
                  '
                  If Not IsNull(!c_notes) Then
                      tStr = "Notes: " + Trim(!c_notes) + "<BR>"
                      gStream.WriteText tStr, adWriteLine
                  End If
                  '
                  gStream.WriteText "</P>", adWriteLine
                  '
                  .MoveNext
             Loop
        End With
    End If
    '
    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing
    gStream.WriteText "</BODY>", adWriteLine
    gStream.WriteText "</HTML>", adWriteLine
    ' now make sure all the data is copied to tStream
    gStream.Flush
    ' and write the stream to the file
    gStream.SaveToFile tFileName, adSaveCreateOverWrite
    '
    gStream.Close
    ' MsgBox "Finished"
    MsgBox "Finished saving to File"

Exit_CmdSaveToFile_Click:
    Exit Sub

Err_CmdSaveToFile_Click:
    MsgBox Err.Description
    Resume Exit_CmdSaveToFile_Click

End Sub

Private Sub CmdSearchByOffice_Click()
    Dim stDocName As String, stLinkCriteria As String
    Dim tRstSearch As DAO.Recordset

    stDocName = "frmSearchPeopleOffice"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog
è¡¨ - 16

    If CurrentProject.AllForms("frmSearchPeopleOffice").IsLoaded Then
        Set tRstSearch = CurrentDb.OpenRecordset("Z_NAME_SEARCH", dbOpenDynaset)
        If tRstSearch.RecordCount > 0 Then
            Me.CmdClearSearch.Enabled = True
            Set Me.frmPeopleLookup2.Form.Recordset = tRstSearch
        End If

        DoCmd.Close acForm, stDocName
    End If

End Sub

Private Sub CmdStoreID_Click()
    Dim cmdSQL As ADODB.Command, tRecCount As Variant, tRst As DAO.Recordset, tID As Long

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
        '
    If DCount("*", "ZZ_STORE_PERSON_ID") > 0 Then
        ' Display message.
        If MsgBox("Do you wish to replace the current stored values?", vbYesNo + vbQuestion + vbDefaultButton2) =
 vbNo Then
             Exit Sub
        Else
             cmdSQL.CommandText = "Delete * from ZZ_STORE_PERSON_ID"
             cmdSQL.Execute tRecCount
        End If
    End If
    '
    ' get the value
    '
    Set tRst = Me.frmPeopleLookup2.Form.Recordset
    tID = tRst!c_personid

    cmdSQL.CommandText = "INSERT INTO ZZ_STORE_PERSON_ID ( c_personid ) SELECT " + Str(tID) + " AS c_personid"
    cmdSQL.Execute tRecCount
    MsgBox "Person IDs successfully stored. Click on 'Recall Person IDs' to reuse these IDs in other forms."
End Sub


Private Sub Form_Open(Cancel As Integer)
    BIOG_MAIN_2_Subform.Form.OrderBy = "c_personid"
    BIOG_MAIN_2_Subform.Form.OrderByOn = True
    frmPeopleLookup2.Form.OrderBy = "c_name"
    frmPeopleLookup2.Form.OrderByOn = True

    ' set the language
    Dim tmli As MsoLanguageID
    ' get the labels
    tmli = Application.LanguageSettings.LanguageID(msoLanguageIDUI)
    gLabelsOK = True
    If tmli = msoLanguageIDSimplifiedChinese Then
         gDisplayLanguage = "S"
    ElseIf tmli = msoLanguageIDTraditionalChinese Then
         gDisplayLanguage = "T"
    ElseIf tmli = msoLanguageIDEnglishUS Then
         gDisplayLanguage = "E"
    Else
         gDisplayLanguage = "E"
    End If
    Call changeDisplayLanguage

    gPersonID = 0

End Sub
Private Sub CmdSearch_Click()
On Error GoTo Err_CmdSearch_Click

    Dim tRstSearch As DAO.Recordset, tStr As String, tQt As String, tQuery As QueryDef, tStrName As String
    Dim cmdSQL As ADODB.Command, tRecNum As Long

    ' the logic of search is to use the characters first, then the pinyin
    ' the search first looks at ZZZ_BIOG_MAIN's c_name and c_name_chn
    ' it then looks at c_name_proper and c_name_rm in ZZZ_BIOG_MAIN
    ' then it looks at ZZZ_ALTNAMES

    tQt = Chr(34)

    '     first make sure that the browser recordset is a dummy
è¡¨ - 17


    Set tRstSearch = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_NAME_SEARCH", dbOpenDynaset)
    Set Me.frmPeopleLookup2.Form.Recordset = tRstSearch

    '   Now zap Z_NAME_SEARCH

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    cmdSQL.CommandText = "Delete * from Z_NAME_SEARCH"
    cmdSQL.Execute tRecNum

    ' now populate from ZZZ_NAMES

    If IsNull(TxtNameChn.Value) Then
         If IsNull(TxtName.Value) Then
              tStr = "Quit"
         Else
              If Me.TxtName.Value = "" Then
                   tStr = "Quit"
              Else
                   tStrName = TxtName.Value
                   If Left(tStrName, 1) = "!" Then
                        tStrName = Mid(TxtName.Value, 2)
                        tStr = " Left(c_name," + Str(Len(tStrName)) + ") = " + tQt + Trim(tStrName) + tQt
                   ElseIf UCase(Left(tStrName, 1)) = Left(tStrName, 1) Then
                        tStr = " Left(c_name," + Str(Len(tStrName)) + ") = " + tQt + Trim(tStrName) + tQt + _
                             " OR c_name LIKE " + tQt + "%" + " " + Trim(tStrName) + "%" + tQt
                   Else
                        tStr = " c_name LIKE " + tQt + "%" + Trim(tStrName) + "%" + tQt
                   End If
              End If
         End If
    Else
         If Me.TxtNameChn.Value = "" Then
              If IsNull(TxtName.Value) Then
                   tStr = "Quit"
              Else
                   If Me.TxtName.Value = "" Then
                        tStr = "Quit"
                   Else
                        tStrName = TxtName.Value
                        If Left(tStrName, 1) = "!" Then
                             tStrName = Mid(TxtName.Value, 2)
                             tStr = " Left(c_name," + Str(Len(tStrName)) + ") = " + tQt + Trim(tStrName) + tQt
                        ElseIf UCase(Left(tStrName, 1)) = Left(tStrName, 1) Then
                             tStr = " Left(c_name," + Str(Len(tStrName)) + ") = " + tQt + Trim(tStrName) + tQt + _
                                 " OR c_name LIKE " + tQt + "%" + " " + Trim(tStrName) + "%" + tQt
                        Else
                             tStr = " c_name LIKE " + tQt + "%" + Trim(tStrName) + "%" + tQt
                        End If
                   End If
              End If
         Else
              tStr = " c_name_chn LIKE " + tQt + "%" + Trim(TxtNameChn.Value) + "%" + tQt
         End If
    End If

    If Not (tStr = "Quit") Then
        tStr = "INSERT INTO Z_NAME_SEARCH SELECT c_personid, c_name, c_name_chn " + _
            "FROM ZZZ_NAMES WHERE" + tStr

        cmdSQL.CommandText = tStr
        cmdSQL.Execute tRecNum
    End If

    Set tRstSearch = CurrentDb.OpenRecordset("Z_NAME_SEARCH", dbOpenDynaset)
    If tRstSearch.RecordCount = 0 Then
         Set tRstSearch = CurrentDb.OpenRecordset("ZZZ_BIOG_MAIN", dbOpenDynaset)
         Me.CmdClearSearch.Enabled = False
    Else
         Me.CmdClearSearch.Enabled = True
    End If
    ' tRstSearch.Index = "c_name"
    Set Me.frmPeopleLookup2.Form.Recordset = tRstSearch


Exit_CmdSearch_Click:
    Exit Sub
è¡¨ - 18


Err_CmdSearch_Click:
    MsgBox Err.Description
    Resume Exit_CmdSearch_Click


End Sub
Private Sub CmdFanti_Click()
On Error GoTo Err_CmdFanti_Click

    If gDisplayLanguage = "T" Then
         gDisplayLanguage = "E"
    Else
         gDisplayLanguage = "T"
    End If

    Call changeDisplayLanguage

Exit_CmdFanti_Click:
    Exit Sub

Err_CmdFanti_Click:
    MsgBox Err.Description
    Resume Exit_CmdFanti_Click

End Sub
Private Sub CmdJianti_Click()
On Error GoTo Err_CmdJianti_Click

    If gDisplayLanguage = "S" Then
         gDisplayLanguage = "E"
    Else
         gDisplayLanguage = "S"
    End If

    Call changeDisplayLanguage

Exit_CmdJianti_Click:
    Exit Sub

Err_CmdJianti_Click:
    MsgBox Err.Description
    Resume Exit_CmdJianti_Click

End Sub
Private Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 8) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 8 And Not .EOF
             If !c_form = "BROWSE" Then
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
è¡¨ - 19

                tLang = 1
           ElseIf gDisplayLanguage = "T" Then
                tLang = 2
           Else
                tLang = 3
           End If
           '
           ' now comes the basic routine
           '
           Me.CmdSearch.Caption = tLabelLanguage(tLang, 1)
           Me.CmdFanti.Caption = tLabelLanguage(tLang, 2)
           Me.CmdJianti.Caption = tLabelLanguage(tLang, 3)
           Me.CmdClearSearch.Caption = tLabelLanguage(tLang, 5)
           Me.CmdSearchByOffice.Caption = tLabelLanguage(tLang, 6)
           Me.CmdSaveToFile.Caption = tLabelLanguage(tLang, 7)

        ' now do the subform
        BIOG_MAIN_2_Subform.Form.gDisplayLanguage = gDisplayLanguage
        BIOG_MAIN_2_Subform.Form.changeDisplayLanguage
    End If

End Sub

Private Sub TxtNameChn_LostFocus()
    '
    ' clear the pinyin name
    '
    TxtName.Value = ""

End Sub

Private Sub TxtName_LostFocus()
    '
    ' clear the Chinese name
    '
    TxtNameChn.Value = ""
End Sub
Private Sub CmdClearSearch_Click()
On Error GoTo Err_CmdClearSearch_Click

    Dim tRst As DAO.Recordset, tQuery As QueryDef, tID As Long, tQueryStr As String

    Set tRst = Me.frmPeopleLookup2.Form.Recordset

    tID = tRst!c_personid

    tQueryStr = "SELECT BIOG_MAIN.c_personid, BIOG_MAIN.c_name, BIOG_MAIN.c_name_chn" + _
        " FROM BIOG_MAIN ORDER BY BIOG_MAIN.c_name"

    'Set tQuery = CurrentDb.QueryDefs("Selected PERSON_NAME_DATA Query")
    'Set tRst = tQuery.OpenRecordset(dbOpenDynaset)
    'Set tRst = CurrentDb.OpenRecordset("BIOG_MAIN", dbOpenDynaset)
    Set tRst = CurrentDb.OpenRecordset(tQueryStr)
    'tRst.Index = "c_name"
    tRst.FindFirst "c_personid = " + Trim(Str(tID))

    Set Me.frmPeopleLookup2.Form.Recordset = tRst

    Me.CmdClearSearch.Enabled = False
    Me.TxtName.Value = ""
    Me.TxtNameChn.Value = ""

Exit_CmdClearSearch_Click:
    Exit Sub

Err_CmdClearSearch_Click:
    MsgBox Err.Description
    Resume Exit_CmdClearSearch_Click

End Sub

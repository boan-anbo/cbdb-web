Option Compare Database
Public gValue As Long

Private Sub CmdDisableIndexAddress2_Click()
On Error GoTo Err_CmdDisableIndexAddress2_Click

    If Cmb_Index_addr_2.Enabled Then
         Cmb_Index_addr_2.Enabled = False
         CmdDisableIndexAddress2.Caption = "Enable"
         '
         ' now disable everything below it
         '
         Cmb_Index_addr_3.Enabled = False
         Cmb_Index_addr_4.Enabled = False
         Cmb_Index_addr_5.Enabled = False
         Cmb_Index_addr_6.Enabled = False
         Cmb_Index_addr_7.Enabled = False
         Cmb_Index_addr_8.Enabled = False
         Cmb_Index_addr_9.Enabled = False
         '
         CmdDisableIndexAddress3.Enabled = False
         CmdDisableIndexAddress4.Enabled = False
         CmdDisableIndexAddress5.Enabled = False
         CmdDisableIndexAddress6.Enabled = False
         CmdDisableIndexAddress7.Enabled = False
         CmdDisableIndexAddress8.Enabled = False
         CmdDisableIndexAddress9.Enabled = False
    Else
         If Cmb_Index_addr_1.Value = 1000 Then
              MsgBox "Please select an address type code for rank = 1 before enabling rank = 2"
         Else
              Cmb_Index_addr_2.Enabled = True
              CmdDisableIndexAddress2.Caption = "Disable"
              '
              ' re-enable the one below it
              '
              '
              CmdDisableIndexAddress3.Enabled = True
              CmdDisableIndexAddress3.Caption = "Enable"
         End If
    End If

Exit_CmdDisableIndexAddress2_Click:
    Exit Sub

Err_CmdDisableIndexAddress2_Click:
    MsgBox Err.Description
    Resume Exit_CmdDisableIndexAddress2_Click

End Sub

Private Sub CmdDisableIndexAddress3_Click()
    If Cmb_Index_addr_3.Enabled Then
         Cmb_Index_addr_3.Enabled = False
         CmdDisableIndexAddress3.Caption = "Enable"
         '
         ' now disable everything below it
         '
         Cmb_Index_addr_4.Enabled = False
         Cmb_Index_addr_5.Enabled = False
         Cmb_Index_addr_6.Enabled = False
         Cmb_Index_addr_7.Enabled = False
         Cmb_Index_addr_8.Enabled = False
         Cmb_Index_addr_9.Enabled = False
         '
         CmdDisableIndexAddress4.Enabled = False
         CmdDisableIndexAddress5.Enabled = False
         CmdDisableIndexAddress6.Enabled = False
         CmdDisableIndexAddress7.Enabled = False
         CmdDisableIndexAddress8.Enabled = False
         CmdDisableIndexAddress9.Enabled = False
    Else
         If Cmb_Index_addr_2.Value = 1000 Then
              MsgBox "Please select an address type code for rank = 2 before enabling rank = 3"
         Else
              Cmb_Index_addr_3.Enabled = True
              CmdDisableIndexAddress3.Caption = "Disable"
              '
              ' re-enable the one below it
              '
            '
            CmdDisableIndexAddress4.Enabled = True
            CmdDisableIndexAddress4.Caption = "Enable"
        End If
    End If

End Sub

Private Sub CmdDisableIndexAddress4_Click()
    If Cmb_Index_addr_4.Enabled Then
         Cmb_Index_addr_4.Enabled = False
         CmdDisableIndexAddress4.Caption = "Enable"
         '
         ' now disable everything below it
         '
         Cmb_Index_addr_5.Enabled = False
         Cmb_Index_addr_6.Enabled = False
         Cmb_Index_addr_7.Enabled = False
         Cmb_Index_addr_8.Enabled = False
         Cmb_Index_addr_9.Enabled = False
         '
         CmdDisableIndexAddress5.Enabled = False
         CmdDisableIndexAddress6.Enabled = False
         CmdDisableIndexAddress7.Enabled = False
         CmdDisableIndexAddress8.Enabled = False
         CmdDisableIndexAddress9.Enabled = False
    Else
         If Cmb_Index_addr_3.Value = 1000 Then
              MsgBox "Please select an address type code for rank = 3 before enabling rank = 4"
         Else
              Cmb_Index_addr_4.Enabled = True
              CmdDisableIndexAddress4.Caption = "Disable"
              '
              ' re-enable the one below it
              '
              '
              CmdDisableIndexAddress5.Enabled = True
              CmdDisableIndexAddress5.Caption = "Enable"
         End If
    End If

End Sub

Private Sub CmdDisableIndexAddress5_Click()
    If Cmb_Index_addr_5.Enabled Then
         Cmb_Index_addr_5.Enabled = False
         CmdDisableIndexAddress5.Caption = "Enable"
              '
         ' now disable everything below it
         '
         Cmb_Index_addr_6.Enabled = False
         Cmb_Index_addr_7.Enabled = False
         Cmb_Index_addr_8.Enabled = False
         Cmb_Index_addr_9.Enabled = False
         '
         CmdDisableIndexAddress6.Enabled = False
         CmdDisableIndexAddress7.Enabled = False
         CmdDisableIndexAddress8.Enabled = False
         CmdDisableIndexAddress9.Enabled = False
    Else
         If Cmb_Index_addr_4.Value = 1000 Then
              MsgBox "Please select an address type code for rank = 4 before enabling rank = 5"
         Else
              Cmb_Index_addr_5.Enabled = True
              CmdDisableIndexAddress5.Caption = "Disable"
              '
              ' re-enable the one below it
              '
              CmdDisableIndexAddress6.Enabled = True
              CmdDisableIndexAddress6.Caption = "Enable"
         End If
    End If

End Sub

Private Sub CmdDisableIndexAddress6_Click()
    If Cmb_Index_addr_6.Enabled Then
        Cmb_Index_addr_6.Enabled = False
        CmdDisableIndexAddress6.Caption = "Enable"
        '
           ' now disable everything below it
           '
           Cmb_Index_addr_7.Enabled = False
           Cmb_Index_addr_8.Enabled = False
           Cmb_Index_addr_9.Enabled = False
           '
           CmdDisableIndexAddress7.Enabled = False
           CmdDisableIndexAddress8.Enabled = False
           CmdDisableIndexAddress9.Enabled = False
    Else
        If Cmb_Index_addr_5.Value = 1000 Then
             MsgBox "Please select an address type code for rank = 5 before enabling rank = 6"
        Else
             Cmb_Index_addr_6.Enabled = True
             CmdDisableIndexAddress6.Caption = "Disable"
             '
             ' re-enable the one below it
             '
             CmdDisableIndexAddress7.Enabled = True
             CmdDisableIndexAddress7.Caption = "Enable"
        End If
    End If

End Sub

Private Sub CmdDisableIndexAddress7_Click()
    If Cmb_Index_addr_7.Enabled Then
         Cmb_Index_addr_7.Enabled = False
         CmdDisableIndexAddress7.Caption = "Enable"
         '
         ' now disable everything below it
         '
         Cmb_Index_addr_8.Enabled = False
         Cmb_Index_addr_9.Enabled = False
         '
         CmdDisableIndexAddress8.Enabled = False
         CmdDisableIndexAddress9.Enabled = False
    Else
         If Cmb_Index_addr_6.Value = 1000 Then
              MsgBox "Please select an address type code for rank = 6 before enabling rank = 7"
         Else
              Cmb_Index_addr_7.Enabled = True
              CmdDisableIndexAddress7.Caption = "Disable"
              '
              ' re-enable the one below it
              '
              CmdDisableIndexAddress8.Enabled = True
              CmdDisableIndexAddress8.Caption = "Enable"
         End If
    End If

End Sub

Private Sub CmdDisableIndexAddress8_Click()
    If Cmb_Index_addr_8.Enabled Then
         Cmb_Index_addr_8.Enabled = False
         CmdDisableIndexAddress8.Caption = "Enable"
         '
         ' now disable everything below it
         '
         Cmb_Index_addr_9.Enabled = False
         '
         CmdDisableIndexAddress9.Enabled = False
    Else
         If Cmb_Index_addr_7.Value = 1000 Then
              MsgBox "Please select an address type code for rank = 7 before enabling rank = 8"
         Else
              Cmb_Index_addr_8.Enabled = True
              CmdDisableIndexAddress8.Caption = "Disable"
              '
              ' re-enable the one below it
              '
              CmdDisableIndexAddress9.Enabled = True
              CmdDisableIndexAddress9.Caption = "Enable"
         End If
    End If

End Sub

Private Sub CmdDisableIndexAddress9_Click()
      If Cmb_Index_addr_9.Enabled Then
           Cmb_Index_addr_9.Enabled = False
           CmdDisableIndexAddress9.Caption = "Enable"
      Else
           If Cmb_Index_addr_8.Value = 1000 Then
                MsgBox "Please select an address type code for rank = 8 before enabling rank = 9"
           Else
                Cmb_Index_addr_9.Enabled = True
                CmdDisableIndexAddress9.Caption = "Disable"
           End If
      End If

End Sub

Private Sub CmdReset_Click()
    Dim cmdSQL As ADODB.Command, tRst As DAO.Recordset, tRecCount As Long
    Dim ti As Integer, tQueryStr As String

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    ' all I need to do is to use tRecCount to see if there are any changes
    '
    cmdSQL.CommandText = "UPDATE BIOG_ADDR_CODES SET BIOG_ADDR_CODES.c_index_addr_rank = [BIOG_ADDR_CODES].[c_ind
ex_addr_default_rank] " + _
        "WHERE (BIOG_ADDR_CODES.c_index_addr_rank<>[BIOG_ADDR_CODES].[c_index_addr_default_rank])"
    cmdSQL.Execute tRecCount
    '
    If tRecCount > 0 Then
        MsgBox "Updating BIOG_MAIN: This will take a while."
        Call UpdateBiogMain
        '
        MsgBox "Updating ZZZ_BIOG_MAIN: This will take a while."
        Call updateZZZ_BIOG_MAIN
        '
        MsgBox "Updating ZZZ_ENTRY_DATA."
        Call updateZZZ_ENTRY_DATA
        '
        MsgBox "Updating ZZZ_STATUS_DATA."
        Call updateZZZ_STATUS_DATA
        '
        MsgBox "Updating ZZZ_POSTED_TO_ADDR_DATA."
        Call updateZZZ_POSTED_TO_ADDR_DATA
        '
        MsgBox "Updating ZZZ_KIN_BIOG_ADDR: This will take a while."
        Call updateZZZ_KIN_BIOG_ADDR
        '
        MsgBox "Updating ZZZ_NONKIN_BIOG_ADDR: This will take a while."
        Call updateZZZ_NONKIN_BIOG_ADDR

             MsgBox "Finished! Please Compact the Database."
      Else
          MsgBox "The current ranking already is the default ranking."
          ' Exit Sub
      End If
      '
      ' finally, reser the form
      '
      ' set the values of the combo boxes
      '
      tQueryStr = "SELECT BIOG_ADDR_CODES.c_addr_type, BIOG_ADDR_CODES.c_index_addr_rank " + _
          "FROM BIOG_ADDR_CODES " + _
          "ORDER BY BIOG_ADDR_CODES.c_index_addr_rank"

      Set tRst = CurrentDb.OpenRecordset(tQueryStr)
      tRst.MoveFirst
      '
      '   since, in theory, the the records are sorted by rank, as soon as it hits 100, the initialization is compl
ete
      '
      ti = 1
      Do While ti < 10
          Select Case ti
              Case 1
                  Cmb_Index_addr_1.Value = tRst!c_addr_type
              Case 2
                  If tRst!c_index_addr_rank < 10 Then
                       Cmb_Index_addr_2.Value = tRst!c_addr_type
                       ' setting Enabled = False makes the click routine reset it to True
                         Cmb_Index_addr_2.Enabled = False
                  Else
                       ti = 100
                  End If
                  Call CmdDisableIndexAddress2_Click
              Case 3
                  If tRst!c_index_addr_rank < 10 Then
                       Cmb_Index_addr_3.Value = tRst!c_addr_type
                       Cmb_Index_addr_3.Enabled = False
                  Else
                       ti = 100
                  End If
                  Call CmdDisableIndexAddress3_Click
              Case 4
                  If tRst!c_index_addr_rank < 10 Then
                       Cmb_Index_addr_4.Value = tRst!c_addr_type
                       Cmb_Index_addr_4.Enabled = False
                  Else
                       ti = 100
                  End If
                  Call CmdDisableIndexAddress4_Click
              Case 5
                  If tRst!c_index_addr_rank < 10 Then
                       Cmb_Index_addr_5.Value = tRst!c_addr_type
                       Cmb_Index_addr_5.Enabled = False
                  Else
                       ti = 100
                  End If
                  Call CmdDisableIndexAddress5_Click
              Case 6
                  If tRst!c_index_addr_rank < 10 Then
                       Cmb_Index_addr_6.Value = tRst!c_addr_type
                       Cmb_Index_addr_6.Enabled = False
                  Else
                       ti = 100
                  End If
                  Call CmdDisableIndexAddress6_Click
              Case 7
                  If tRst!c_index_addr_rank < 10 Then
                       Cmb_Index_addr_7.Value = tRst!c_addr_type
                       Cmb_Index_addr_7.Enabled = False
                  Else
                       ti = 100
                  End If
                  Call CmdDisableIndexAddress7_Click
              Case 8
                  If tRst!c_index_addr_rank < 10 Then
                       Cmb_Index_addr_8.Value = tRst!c_addr_type
                       Cmb_Index_addr_8.Enabled = False
                  Else
                       ti = 100
                  End If
                  Call CmdDisableIndexAddress8_Click
              Case 9
                  If tRst!c_index_addr_rank < 10 Then
                       Cmb_Index_addr_9.Value = tRst!c_addr_type
                       Cmb_Index_addr_9.Enabled = False
                  Else
                       ti = 100
                  End If
                  Call CmdDisableIndexAddress9_Click
              Case Else
                  ti = 100
          End Select
          ti = ti + 1
          tRst.MoveNext
    Loop
    '
    ' clean up
    '
    tRst.Close
    Set tRst = Nothing

End Sub

Private Sub CmdUpdate_Click()
    Call SetIndexAddrRanks
End Sub

Private Sub Form_Open(Cancel As Integer)
      Dim tRst As DAO.Recordset, ti As Integer, tQueryStr As String
      '
      ' set initial values for the combo boxes
      '
      Cmb_Index_addr_2.Value = 1000
      Cmb_Index_addr_3.Value = 1000
      Cmb_Index_addr_4.Value = 1000
      Cmb_Index_addr_5.Value = 1000
      Cmb_Index_addr_6.Value = 1000
      Cmb_Index_addr_7.Value = 1000
      Cmb_Index_addr_8.Value = 1000
      Cmb_Index_addr_9.Value = 1000
      '
      ' next, set the values of the combo boxes from BIOG_ADDR_CODES
      '
      tQueryStr = "SELECT BIOG_ADDR_CODES.c_addr_type, BIOG_ADDR_CODES.c_index_addr_rank " + _
          "FROM BIOG_ADDR_CODES " + _
          "ORDER BY BIOG_ADDR_CODES.c_index_addr_rank"

      Set tRst = CurrentDb.OpenRecordset(tQueryStr)
      tRst.MoveFirst
      '
      '   since, in theory, the the records are sorted by rank, as soon as it hits 100, the initialization is compl
ete
      '
      ti = 1
      Do While ti < 10
          Select Case ti
              Case 1
                  Cmb_Index_addr_1.Value = tRst!c_addr_type
              Case 2
                  If tRst!c_index_addr_rank < 10 Then
                       Cmb_Index_addr_2.Value = tRst!c_addr_type
                  Else
                       ti = 100
                       Call CmdDisableIndexAddress2_Click
                  End If
              Case 3
                  If tRst!c_index_addr_rank < 10 Then
                       Cmb_Index_addr_3.Value = tRst!c_addr_type
                  Else
                       ti = 100
                       Call CmdDisableIndexAddress3_Click
                  End If
              Case 4
                  If tRst!c_index_addr_rank < 10 Then
                       Cmb_Index_addr_4.Value = tRst!c_addr_type
                  Else
                       ti = 100
                       Call CmdDisableIndexAddress4_Click
                  End If
              Case 5
                  If tRst!c_index_addr_rank < 10 Then
                       Cmb_Index_addr_5.Value = tRst!c_addr_type
                  Else
                       ti = 100
                       Call CmdDisableIndexAddress5_Click
                  End If
              Case 6
                  If tRst!c_index_addr_rank < 10 Then
                       Cmb_Index_addr_6.Value = tRst!c_addr_type
                  Else
                       ti = 100
                       Call CmdDisableIndexAddress6_Click
                  End If
              Case 7
                  If tRst!c_index_addr_rank < 10 Then
                       Cmb_Index_addr_7.Value = tRst!c_addr_type
                  Else
                       ti = 100
                       Call CmdDisableIndexAddress7_Click
                  End If
              Case 8
                  If tRst!c_index_addr_rank < 10 Then
                       Cmb_Index_addr_8.Value = tRst!c_addr_type
                  Else
                       ti = 100
                       Call CmdDisableIndexAddress8_Click
                  End If
              Case 9
                If tRst!c_index_addr_rank < 10 Then
                     Cmb_Index_addr_9.Value = tRst!c_addr_type
                Else
                     Call CmdDisableIndexAddress9_Click
                     ti = 100
                End If
            Case Else
                ti = 100
        End Select
        ti = ti + 1
        tRst.MoveNext
    Loop
    '
    ' clean up
    '
    tRst.Close
    Set tRst = Nothing
End Sub
Private Sub CmdCancel_Click()
On Error GoTo Err_CmdCancel_Click


    If Me.Dirty Then Me.Dirty = False
    DoCmd.Close

Exit_CmdCancel_Click:
    Exit Sub

Err_CmdCancel_Click:
    MsgBox Err.Description
    Resume Exit_CmdCancel_Click

End Sub
Private Function Compact_DB(tStrDatabase As String)
    Dim tStrPath As String, tRstLinkInit As DAO.Recordset, tNameLen As Integer

    ' get the current dataset

    Set tRstLinkInit = CurrentDb.OpenRecordset("LinkListInit", dbOpenDynaset)

    tRstLinkInit.MoveFirst
    tStrDataBaseVersion = tRstLinkInit!c_dataset
    tRstLinkInit.Close

    'MsgBox "Beginning"
    tStrPath = CurrentProject.FullName

    'MsgBox tStrPath

    If InStr(UCase(tStrPath), "ADMIN") > 0 Then
         tStrUserType = "ADMIN"
         tNameLen = 13
    Else
         tStrUserType = "User"
         tNameLen = 12
    End If

    tStrPathBase = Left(tStrPath, Len(tStrPath) - tNameLen) + "_" + Trim(tStrDataBaseVersion) + "_DATA"

    'SET PATH
    tStrPath = "C:\MyFiles\dev\"

    'COMPACT CHOSEN DATABASE, TO TEMPORARY DATABASE NAME
    DBEngine.CompactDatabase tStrPathBase + tStrDatabase + ".mdb", tStrPathBase + "TEMP" + tStrDatabase + ".mdb"

    'DELETE OLD DATABASE
    Kill tStrPathBase + tStrDatabase + ".mdb"

    'RENAME TEMPORARY DATABASE TO ORIGINAL NAME
    Name tStrPathBase + "TEMP" + tStrDatabase + ".mdb" As tStrPathBase + tStrDatabase + ".mdb"

End Function
Private Sub SetIndexAddrRanks()
    Dim tRankedCode(9) As Integer, ti As Integer, tj As Integer, tRst As DAO.Recordset, tQueryStr As String, tPro
ceed As Boolean
    Dim tContinue As Integer, cmdSQL As ADODB.Command
    '
    ' first, get the new ranking and check if it is OK
    '
    ' The first combo box is always enabled
    '
    tRankedCode(1) = Me.Cmb_Index_addr_1.Value
    '
    If Cmb_Index_addr_2.Enabled Then
         tRankedCode(2) = Cmb_Index_addr_2.Value
    Else
         tRankedCode(2) = 1000
    End If
    '
    If Cmb_Index_addr_3.Enabled Then
         tRankedCode(3) = Cmb_Index_addr_3.Value
    Else
         tRankedCode(3) = 1000
    End If
    '
    If Cmb_Index_addr_4.Enabled Then
         tRankedCode(4) = Cmb_Index_addr_4.Value
    Else
         tRankedCode(4) = 1000
    End If
    '
    If Cmb_Index_addr_5.Enabled Then
         tRankedCode(5) = Cmb_Index_addr_5.Value
    Else
         tRankedCode(5) = 1000
    End If
    '
    If Cmb_Index_addr_6.Enabled Then
         tRankedCode(6) = Cmb_Index_addr_6.Value
    Else
         tRankedCode(6) = 1000
    End If
    '
    If Cmb_Index_addr_7.Enabled Then
         tRankedCode(7) = Cmb_Index_addr_7.Value
    Else
         tRankedCode(7) = 1000
    End If
    '
    If Cmb_Index_addr_8.Enabled Then
         tRankedCode(8) = Cmb_Index_addr_8.Value
    Else
         tRankedCode(8) = 1000
    End If
    '
    If Cmb_Index_addr_9.Enabled Then
         tRankedCode(9) = Cmb_Index_addr_9.Value
    Else
         tRankedCode(9) = 1000
    End If
    '
    ' next, check duplicated value. The algorithm is brute-force but should be fast anyhow
    '
    ti = 2
    Do While ti < 10
         If tRankedCode(ti) = 1000 Then
              ti = 100
         Else
              tj = 1
              Do While tj < ti
                   If tRankedCode(ti) = tRankedCode(tj) Then
                       '
                       ' warn about the duplication and trigger the end of processing
                       '
                       MsgBox "The same address type is used in ranking " + Str(tj) + " and " + Str(ti) + ". Please
fix."
                       tj = 200
                       ti = 100
                   End If
                   tj = tj + 1
              Loop
         End If
         ti = ti + 1
    Loop
    '
    ' check for error
    '
    If tj = 201 Then
         Exit Sub
    End If
    '
    ' now see if the new ranking matches the current: if so, inform the user and exit
    '
    ' first, get the ranked BIOG_ADDR_CODES records
    '
    tQueryStr = "SELECT BIOG_ADDR_CODES.c_addr_type, BIOG_ADDR_CODES.c_index_addr_rank " + _
        "FROM BIOG_ADDR_CODES " + _
        "ORDER BY BIOG_ADDR_CODES.c_index_addr_rank"

    Set tRst = CurrentDb.OpenRecordset(tQueryStr)
    tRst.MoveFirst
    '
    ' now compare tRankedCode() with the current setting
    '
    tProceed = False
    ti = 1
    Do While ti < 10
        If tRst!c_index_addr_rank < 100 And tRankedCode(ti) = 1000 Then
            tProceed = True
            Exit Do
        ElseIf tRst!c_index_addr_rank = 100 And tRankedCode(ti) < 1000 Then
            tProceed = True
            Exit Do
        ElseIf tRst!c_index_addr_rank = 100 And tRankedCode(ti) = 1000 Then
            '
            ' we've come to the end of both the current and the new list with no changes
            '
            Exit Do
        ElseIf tRst!c_addr_type <> tRankedCode(ti) Then
            tProceed = True
            Exit Do
        End If

        ti = ti + 1
        tRst.MoveNext
    Loop
    tRst.Close
    '
    If tProceed Then
         tQueryStr = "This procedure updates many files and will take a long time. Do you wish to continue?"
         tContinue = MsgBox(tQueryStr, vbQuestion + vbYesNo + vbDefaultButton2, "Change Index Address Ranking?")
         If tContinue = vbYes Then
             '
             ' the next step is to update the rankings in BIOG_ADDR_CODES
             '
             Set cmdSQL = New ADODB.Command
             cmdSQL.ActiveConnection = CurrentProject.Connection
             cmdSQL.CommandType = adCmdText
             '
             ' first, reset all rankings to 100, and then update the relevent ones
             '
             cmdSQL.CommandText = "UPDATE BIOG_ADDR_CODES SET BIOG_ADDR_CODES.c_index_addr_rank = 100"
             cmdSQL.Execute tRecCount
             '
             ti = 1
             Do While ti < 10
                  If tRankedCode(ti) < 1000 Then
                       cmdSQL.CommandText = "UPDATE BIOG_ADDR_CODES SET BIOG_ADDR_CODES.c_index_addr_rank = " + Str(
ti) + " " + _
                           "WHERE (BIOG_ADDR_CODES.c_addr_type = " + Str(tRankedCode(ti)) + " )"
                       cmdSQL.Execute tRecCount
                       ti = ti + 1
                  Else
                       ti = 11
                  End If
             Loop
             '
             ' for debugging
             '
             'Exit Sub
             '
             ' Finally, call the procedures to update the clusters of tables for the three files (with the proced
ure to compact the files at the end)
             '
             MsgBox "Updating BIOG_MAIN: This will take a while."
             Call UpdateBiogMain
             'Exit Sub
             '
             MsgBox "Updating ZZZ_BIOG_MAIN: This will take a while."
             Call updateZZZ_BIOG_MAIN
                  'Exit Sub
                  '
                  MsgBox "Updating ZZZ_ENTRY_DATA."
                  Call updateZZZ_ENTRY_DATA
                  '
                  MsgBox "Updating ZZZ_STATUS_DATA."
                  Call updateZZZ_STATUS_DATA
                  '
                  MsgBox "Updating ZZZ_POSTED_TO_ADDR_DATA."
                  Call updateZZZ_POSTED_TO_ADDR_DATA
                  '
                  MsgBox "Updating ZZZ_KIN_BIOG_ADDR: This will take a while."
                  Call updateZZZ_KIN_BIOG_ADDR
                  '
                  MsgBox "Updating ZZZ_NONKIN_BIOG_ADDR: This will take a while."
                  Call updateZZZ_NONKIN_BIOG_ADDR

                  MsgBox "Finished! Please Compact the Database."
           Else
               MsgBox "Never mind."
           End If
    Else
        MsgBox "The new ranking matches the current ranking.        There is nothing to change."
    End If
    '
End Sub

Private Sub UpdateBiogMain()
    Dim cmdSQL As ADODB.Command, tRst As DAO.Recordset, tQueryStr As String, tRecCount As Long

    tQueryStr = "SELECT BIOG_ADDR_CODES.c_addr_type, BIOG_ADDR_CODES.c_index_addr_rank " + _
        "FROM BIOG_ADDR_CODES " + _
        "ORDER BY BIOG_ADDR_CODES.c_index_addr_rank"

    Set tRst = CurrentDb.OpenRecordset(tQueryStr)
    tRst.MoveFirst

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    '   first, delete all the index address values in BIOG_MAIN

    cmdSQL.CommandText = "UPDATE BIOG_MAIN SET BIOG_MAIN.c_index_addr_id = Null, BIOG_MAIN.c_index_addr_type_code
 = Null"
    cmdSQL.Execute tRecCount

    '   now fill in the new data
    '   note that because c_sequence in BIOG_ADDR_DATA allows one to have multiple values for any address type,
    '       this routine picks the maximum sequence number for any category.

    cmdSQL.CommandText = "DELETE * FROM TMP_BIOG_ADDR_DATA"
    cmdSQL.Execute tRecCount
    '
    cmdSQL.CommandText = "INSERT INTO TMP_BIOG_ADDR_DATA ( c_personid, c_addr_type, c_sequence ) " + _
        "SELECT BIOG_ADDR_DATA.c_personid, BIOG_ADDR_DATA.c_addr_type, Max(BIOG_ADDR_DATA.c_sequence) AS MaxOfc_s
equence " + _
        "FROM BIOG_ADDR_DATA " + _
        "GROUP BY BIOG_ADDR_DATA.c_personid, BIOG_ADDR_DATA.c_addr_type"
    cmdSQL.Execute tRecCount

    tQueryStr = "UPDATE (BIOG_MAIN INNER JOIN BIOG_ADDR_DATA " + _
            "ON BIOG_MAIN.c_personid = BIOG_ADDR_DATA.c_personid) INNER JOIN TMP_BIOG_ADDR_DATA " + _
            "ON (BIOG_ADDR_DATA.c_sequence = TMP_BIOG_ADDR_DATA.c_sequence) AND (BIOG_ADDR_DATA.c_addr_type = TMP
_BIOG_ADDR_DATA.c_addr_type) " + _
            "AND (BIOG_ADDR_DATA.c_personid = TMP_BIOG_ADDR_DATA.c_personid) " + _
        "SET BIOG_MAIN.c_index_addr_id = [BIOG_ADDR_DATA].[c_addr_id], " + _
            "BIOG_MAIN.c_index_addr_type_code = [BIOG_ADDR_DATA].[c_addr_type] " + _
        "WHERE (BIOG_MAIN.c_index_addr_id Is Null) AND (BIOG_ADDR_DATA.c_addr_type = "

    'tQueryStr = "UPDATE BIOG_MAIN INNER JOIN BIOG_ADDR_DATA " + _
        "ON BIOG_MAIN.c_personid = BIOG_ADDR_DATA.c_personid " + _
        "SET BIOG_MAIN.c_index_addr_id = [BIOG_ADDR_DATA].[c_addr_id], " + _
            "BIOG_MAIN.c_index_addr_type_code = [BIOG_ADDR_DATA].[c_addr_type] " + _
        "WHERE (BIOG_MAIN.c_index_addr_id is NULL) AND (BIOG_ADDR_DATA.c_addr_type = "

    '   now the loop

    Do While tRst!c_index_addr_rank < 100 And Not tRst.EOF
        cmdSQL.CommandText = tQueryStr + Str(tRst!c_addr_type) + ")"
           cmdSQL.Execute tRecCount

           tRst.MoveNext
    Loop

    cmdSQL.CommandText = "DELETE * FROM TMP_BIOG_ADDR_DATA"
    cmdSQL.Execute tRecCount
    '
    ' because the file is linked to tables, it is in use and cannot be compacted (rats)
    ' well, let's see what the cost is in terms of space for running this routine

    'Call Compact_DB("1")

End Sub
Private Sub updateZZZ_BIOG_MAIN()
    Dim cmdSQL As ADODB.Command, tRst As DAO.Recordset, tQueryStr As String, tRecCount As Long

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    ' strip values from the table
    cmdSQL.CommandText = "UPDATE ZZZ_BIOG_MAIN " + _
        "SET ZZZ_BIOG_MAIN.c_index_addr_id = Null, " + _
            "ZZZ_BIOG_MAIN.c_index_addr_type_code = Null, " + _
            "ZZZ_BIOG_MAIN.c_index_addr_name = Null, " + _
            "ZZZ_BIOG_MAIN.c_index_addr_chn = Null, " + _
            "ZZZ_BIOG_MAIN.c_index_addr_type_desc = Null, " + _
            "ZZZ_BIOG_MAIN.c_index_addr_type_chn = Null, " + _
            "ZZZ_BIOG_MAIN.x_coord = Null, " + _
            "ZZZ_BIOG_MAIN.y_coord = Null"
    cmdSQL.Execute tRecCount

    cmdSQL.CommandText = "UPDATE BIOG_ADDR_CODES INNER JOIN ((BIOG_MAIN INNER JOIN ZZZ_BIOG_MAIN " + _
            "ON BIOG_MAIN.c_personid = ZZZ_BIOG_MAIN.c_personid) INNER JOIN ADDR_CODES ON BIOG_MAIN.c_index_addr_
id = ADDR_CODES.c_addr_id) " + _
            "ON BIOG_ADDR_CODES.c_addr_type = BIOG_MAIN.c_index_addr_type_code " + _
        "SET ZZZ_BIOG_MAIN.c_index_addr_id = [BIOG_MAIN].[c_index_addr_id], " + _
            "ZZZ_BIOG_MAIN.c_index_addr_type_code = [BIOG_MAIN].[c_index_addr_type_code], " + _
            "ZZZ_BIOG_MAIN.c_index_addr_name = [ADDR_CODES].[c_name], " + _
            "ZZZ_BIOG_MAIN.c_index_addr_chn = [ADDR_CODES].[c_name_chn], " + _
            "ZZZ_BIOG_MAIN.c_index_addr_type_desc = [BIOG_ADDR_CODES].[c_addr_desc], " + _
            "ZZZ_BIOG_MAIN.c_index_addr_type_chn = [BIOG_ADDR_CODES].[c_addr_desc_chn], " + _
            "ZZZ_BIOG_MAIN.x_coord = [ADDR_CODES].[x_coord], " + _
            "ZZZ_BIOG_MAIN.y_coord = [ADDR_CODES].[y_coord]"
    cmdSQL.Execute tRecCount

End Sub
Private Sub updateZZZ_ENTRY_DATA()
    Dim cmdSQL As ADODB.Command, tRst As DAO.Recordset, tRecCount As Long

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    ' strip values from the table
    cmdSQL.CommandText = "UPDATE ZZZ_ENTRY_DATA " + _
        "SET ZZZ_ENTRY_DATA.c_addr_id = Null, " + _
            "ZZZ_ENTRY_DATA.c_addr_type = Null, " + _
            "ZZZ_ENTRY_DATA.c_addr_name = Null, " + _
            "ZZZ_ENTRY_DATA.c_addr_chn = Null, " + _
            "ZZZ_ENTRY_DATA.c_addr_desc = Null, " + _
            "ZZZ_ENTRY_DATA.c_addr_desc_chn = Null, " + _
            "ZZZ_ENTRY_DATA.x_coord = Null, " + _
            "ZZZ_ENTRY_DATA.y_coord = Null"
    cmdSQL.Execute tRecCount
    '
    cmdSQL.CommandText = "UPDATE ZZZ_ENTRY_DATA INNER JOIN ZZZ_BIOG_MAIN ON ZZZ_ENTRY_DATA.c_personid = ZZZ_BIOG_
MAIN.c_personid " + _
        "SET ZZZ_ENTRY_DATA.c_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], " + _
            "ZZZ_ENTRY_DATA.c_addr_type = [ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
            "ZZZ_ENTRY_DATA.c_addr_desc = [ZZZ_BIOG_MAIN].[c_index_addr_type_desc], " + _
            "ZZZ_ENTRY_DATA.c_addr_desc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn], " + _
            "ZZZ_ENTRY_DATA.c_addr_name = [ZZZ_BIOG_MAIN].[c_index_addr_name], " + _
            "ZZZ_ENTRY_DATA.c_addr_chn = [ZZZ_BIOG_MAIN].[c_index_addr_chn], " + _
            "ZZZ_ENTRY_DATA.x_coord = [ZZZ_BIOG_MAIN].[x_coord], " + _
            "ZZZ_ENTRY_DATA.y_coord = [ZZZ_BIOG_MAIN].[y_coord]"
    cmdSQL.Execute tRecCount

End Sub
Private Sub updateZZZ_STATUS_DATA()
    Dim cmdSQL As ADODB.Command, tRst As DAO.Recordset, tRecCount As Long

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    ' strip values from the table
    cmdSQL.CommandText = "UPDATE ZZZ_STATUS_DATA " + _
        "SET ZZZ_STATUS_DATA.c_addr_id = Null, " + _
            "ZZZ_STATUS_DATA.c_addr_type = Null, " + _
            "ZZZ_STATUS_DATA.c_addr_name = Null, " + _
            "ZZZ_STATUS_DATA.c_addr_chn = Null, " + _
            "ZZZ_STATUS_DATA.c_addr_desc = Null, " + _
            "ZZZ_STATUS_DATA.c_addr_desc_chn = Null, " + _
            "ZZZ_STATUS_DATA.x_coord = Null, " + _
            "ZZZ_STATUS_DATA.y_coord = Null"
    cmdSQL.Execute tRecCount
    '
    cmdSQL.CommandText = "UPDATE ZZZ_STATUS_DATA INNER JOIN ZZZ_BIOG_MAIN ON ZZZ_STATUS_DATA.c_personid = ZZZ_BIO
G_MAIN.c_personid " + _
        "SET ZZZ_STATUS_DATA.c_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], " + _
            "ZZZ_STATUS_DATA.c_addr_type = [ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
            "ZZZ_STATUS_DATA.c_addr_desc = [ZZZ_BIOG_MAIN].[c_index_addr_type_desc], " + _
            "ZZZ_STATUS_DATA.c_addr_desc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn], " + _
            "ZZZ_STATUS_DATA.c_addr_name = [ZZZ_BIOG_MAIN].[c_index_addr_name], " + _
            "ZZZ_STATUS_DATA.c_addr_chn = [ZZZ_BIOG_MAIN].[c_index_addr_chn], " + _
            "ZZZ_STATUS_DATA.x_coord = [ZZZ_BIOG_MAIN].[x_coord], " + _
            "ZZZ_STATUS_DATA.y_coord = [ZZZ_BIOG_MAIN].[y_coord]"
    cmdSQL.Execute tRecCount

End Sub
Private Sub updateZZZ_POSTED_TO_ADDR_DATA()
    Dim cmdSQL As ADODB.Command, tRst As DAO.Recordset, tRecCount As Long

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    ' strip values from the table
    cmdSQL.CommandText = "UPDATE ZZZ_POSTED_TO_ADDR_DATA " + _
        "SET ZZZ_POSTED_TO_ADDR_DATA.c_addr_id = Null, " + _
            "ZZZ_POSTED_TO_ADDR_DATA.c_addr_type = Null, " + _
            "ZZZ_POSTED_TO_ADDR_DATA.c_addr_name = Null, " + _
            "ZZZ_POSTED_TO_ADDR_DATA.c_addr_chn = Null, " + _
            "ZZZ_POSTED_TO_ADDR_DATA.c_addr_desc = Null, " + _
            "ZZZ_POSTED_TO_ADDR_DATA.c_addr_desc_chn = Null, " + _
            "ZZZ_POSTED_TO_ADDR_DATA.x_coord = Null, " + _
            "ZZZ_POSTED_TO_ADDR_DATA.y_coord = Null"
    cmdSQL.Execute tRecCount
    '
    cmdSQL.CommandText = "UPDATE ZZZ_POSTED_TO_ADDR_DATA INNER JOIN ZZZ_BIOG_MAIN ON ZZZ_POSTED_TO_ADDR_DATA.c_pe
rsonid = ZZZ_BIOG_MAIN.c_personid " + _
        "SET ZZZ_POSTED_TO_ADDR_DATA.c_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], " + _
            "ZZZ_POSTED_TO_ADDR_DATA.c_addr_type = [ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
            "ZZZ_POSTED_TO_ADDR_DATA.c_addr_desc = [ZZZ_BIOG_MAIN].[c_index_addr_type_desc], " + _
            "ZZZ_POSTED_TO_ADDR_DATA.c_addr_desc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn], " + _
            "ZZZ_POSTED_TO_ADDR_DATA.c_addr_name = [ZZZ_BIOG_MAIN].[c_index_addr_name], " + _
            "ZZZ_POSTED_TO_ADDR_DATA.c_addr_chn = [ZZZ_BIOG_MAIN].[c_index_addr_chn], " + _
            "ZZZ_POSTED_TO_ADDR_DATA.x_coord = [ZZZ_BIOG_MAIN].[x_coord], " + _
            "ZZZ_POSTED_TO_ADDR_DATA.y_coord = [ZZZ_BIOG_MAIN].[y_coord]"
    cmdSQL.Execute tRecCount

End Sub
Private Sub updateZZZ_KIN_BIOG_ADDR()
    Dim cmdSQL As ADODB.Command, tRst As DAO.Recordset, tRecCount As Long

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    ' strip values from the table
    cmdSQL.CommandText = "UPDATE ZZZ_KIN_BIOG_ADDR " + _
        "SET ZZZ_KIN_BIOG_ADDR.c_addr_id = Null, " + _
            "ZZZ_KIN_BIOG_ADDR.c_addr_type = Null, " + _
            "ZZZ_KIN_BIOG_ADDR.c_addr_name = Null, " + _
            "ZZZ_KIN_BIOG_ADDR.c_addr_chn = Null, " + _
            "ZZZ_KIN_BIOG_ADDR.c_addr_desc = Null, " + _
            "ZZZ_KIN_BIOG_ADDR.c_addr_desc_chn = Null, " + _
            "ZZZ_KIN_BIOG_ADDR.x_coord = Null, " + _
            "ZZZ_KIN_BIOG_ADDR.y_coord = Null, " + _
            "ZZZ_KIN_BIOG_ADDR.c_node_addr_id = Null, " + _
            "ZZZ_KIN_BIOG_ADDR.c_node_addr_type = Null, " + _
            "ZZZ_KIN_BIOG_ADDR.c_node_addr_desc = Null, " + _
            "ZZZ_KIN_BIOG_ADDR.c_node_addr_desc_chn = Null, " + _
            "ZZZ_KIN_BIOG_ADDR.c_node_addr_name = Null, " + _
            "ZZZ_KIN_BIOG_ADDR.c_node_addr_chn = Null, " + _
            "ZZZ_KIN_BIOG_ADDR.node_xcoord = Null, " + _
            "ZZZ_KIN_BIOG_ADDR.node_ycoord = Null"
    cmdSQL.Execute tRecCount
    '
    cmdSQL.CommandText = "UPDATE ZZZ_KIN_BIOG_ADDR INNER JOIN ZZZ_BIOG_MAIN ON ZZZ_KIN_BIOG_ADDR.c_personid = ZZZ
_BIOG_MAIN.c_personid " + _
        "SET ZZZ_KIN_BIOG_ADDR.c_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], " + _
            "ZZZ_KIN_BIOG_ADDR.c_addr_type = [ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
            "ZZZ_KIN_BIOG_ADDR.c_addr_desc = [ZZZ_BIOG_MAIN].[c_index_addr_type_desc], " + _
            "ZZZ_KIN_BIOG_ADDR.c_addr_desc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn], " + _
            "ZZZ_KIN_BIOG_ADDR.c_addr_name = [ZZZ_BIOG_MAIN].[c_index_addr_name], " + _
            "ZZZ_KIN_BIOG_ADDR.c_addr_chn = [ZZZ_BIOG_MAIN].[c_index_addr_chn], " + _
            "ZZZ_KIN_BIOG_ADDR.x_coord = [ZZZ_BIOG_MAIN].[x_coord], " + _
            "ZZZ_KIN_BIOG_ADDR.y_coord = [ZZZ_BIOG_MAIN].[y_coord]"
    cmdSQL.Execute tRecCount

    cmdSQL.CommandText = "UPDATE ZZZ_KIN_BIOG_ADDR INNER JOIN ZZZ_BIOG_MAIN ON ZZZ_KIN_BIOG_ADDR.c_node_id = ZZZ_
BIOG_MAIN.c_personid " + _
        "SET ZZZ_KIN_BIOG_ADDR.c_node_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], " + _
            "ZZZ_KIN_BIOG_ADDR.c_node_addr_type = [ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
            "ZZZ_KIN_BIOG_ADDR.c_node_addr_desc = [ZZZ_BIOG_MAIN].[c_index_addr_type_desc], " + _
            "ZZZ_KIN_BIOG_ADDR.c_node_addr_desc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn], " + _
            "ZZZ_KIN_BIOG_ADDR.c_node_addr_name = [ZZZ_BIOG_MAIN].[c_index_addr_name], " + _
            "ZZZ_KIN_BIOG_ADDR.c_node_addr_chn = [ZZZ_BIOG_MAIN].[c_index_addr_chn], " + _
            "ZZZ_KIN_BIOG_ADDR.node_xcoord = [ZZZ_BIOG_MAIN].[x_coord], " + _
            "ZZZ_KIN_BIOG_ADDR.node_ycoord = [ZZZ_BIOG_MAIN].[y_coord]"
    cmdSQL.Execute tRecCount

    cmdSQL.CommandText = "UPDATE ZZZ_KIN_BIOG_ADDR SET ZZZ_KIN_BIOG_ADDR.c_t_dist = " + _
        "Sqr((Sin(3.1415926536*(y_coord-node_ycoord)/360))^2+Cos(3.1415926536*y_coord/180)*" + _
        "Cos(3.1415926536*node_ycoord/180)*(Sin(3.1415926536*(x_coord-node_xcoord)/360))^2) " + _
        "WHERE (((ZZZ_KIN_BIOG_ADDR.x_coord)>0) AND ((ZZZ_KIN_BIOG_ADDR.y_coord)>0) AND " + _
        "((ZZZ_KIN_BIOG_ADDR.node_xcoord)>0) AND ((ZZZ_KIN_BIOG_ADDR.node_ycoord)>0));"

    cmdSQL.Execute tRecCount

    cmdSQL.CommandText = "UPDATE ZZZ_KIN_BIOG_ADDR SET ZZZ_KIN_BIOG_ADDR.c_distance = " + _
        "25484*Atn(c_t_dist/(1+Sqr(1-c_t_dist*c_t_dist))) " + _
        "WHERE (((ZZZ_KIN_BIOG_ADDR.x_coord)>0) AND ((ZZZ_KIN_BIOG_ADDR.y_coord)>0) AND " + _
        "((ZZZ_KIN_BIOG_ADDR.node_xcoord)>0) AND ((ZZZ_KIN_BIOG_ADDR.node_ycoord)>0))"

    cmdSQL.Execute tRecCount

End Sub
Private Sub updateZZZ_NONKIN_BIOG_ADDR()
    Dim cmdSQL As ADODB.Command, tRst As DAO.Recordset, tRecCount As Long

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    ' strip values from the table
    cmdSQL.CommandText = "UPDATE ZZZ_NONKIN_BIOG_ADDR " + _
        "SET ZZZ_NONKIN_BIOG_ADDR.c_addr_id = Null, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_addr_type = Null, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_addr_name = Null, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_addr_chn = Null, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_addr_desc = Null, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_addr_desc_chn = Null, " + _
            "ZZZ_NONKIN_BIOG_ADDR.x_coord = Null, " + _
            "ZZZ_NONKIN_BIOG_ADDR.y_coord = Null, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id = Null, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_type = Null, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_desc = Null, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_desc_chn = Null, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_name = Null, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_chn = Null, " + _
            "ZZZ_NONKIN_BIOG_ADDR.node_xcoord = Null, " + _
            "ZZZ_NONKIN_BIOG_ADDR.node_ycoord = Null"
    cmdSQL.Execute tRecCount
    '
    cmdSQL.CommandText = "UPDATE ZZZ_NONKIN_BIOG_ADDR INNER JOIN ZZZ_BIOG_MAIN ON ZZZ_NONKIN_BIOG_ADDR.c_personid
 = ZZZ_BIOG_MAIN.c_personid " + _
        "SET ZZZ_NONKIN_BIOG_ADDR.c_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_addr_type = [ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_addr_desc = [ZZZ_BIOG_MAIN].[c_index_addr_type_desc], " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_addr_desc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn], " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_addr_name = [ZZZ_BIOG_MAIN].[c_index_addr_name], " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_addr_chn = [ZZZ_BIOG_MAIN].[c_index_addr_chn], " + _
            "ZZZ_NONKIN_BIOG_ADDR.x_coord = [ZZZ_BIOG_MAIN].[x_coord], " + _
            "ZZZ_NONKIN_BIOG_ADDR.y_coord = [ZZZ_BIOG_MAIN].[y_coord]"
    cmdSQL.Execute tRecCount

    cmdSQL.CommandText = "UPDATE ZZZ_NONKIN_BIOG_ADDR INNER JOIN ZZZ_BIOG_MAIN ON ZZZ_NONKIN_BIOG_ADDR.c_node_id
= ZZZ_BIOG_MAIN.c_personid " + _
        "SET ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_type = [ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_desc = [ZZZ_BIOG_MAIN].[c_index_addr_type_desc], " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_desc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn], " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_name = [ZZZ_BIOG_MAIN].[c_index_addr_name], " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_node_addr_chn = [ZZZ_BIOG_MAIN].[c_index_addr_chn], " + _
            "ZZZ_NONKIN_BIOG_ADDR.node_xcoord = [ZZZ_BIOG_MAIN].[x_coord], " + _
            "ZZZ_NONKIN_BIOG_ADDR.node_ycoord = [ZZZ_BIOG_MAIN].[y_coord]"
    cmdSQL.Execute tRecCount

    cmdSQL.CommandText = "UPDATE ZZZ_NONKIN_BIOG_ADDR SET ZZZ_NONKIN_BIOG_ADDR.c_t_dist = " + _
        "Sqr((Sin(3.1415926536*(y_coord-node_ycoord)/360))^2+Cos(3.1415926536*y_coord/180)*" + _
        "Cos(3.1415926536*node_ycoord/180)*(Sin(3.1415926536*(x_coord-node_xcoord)/360))^2) " + _
        "WHERE (((ZZZ_NONKIN_BIOG_ADDR.x_coord)>0) AND ((ZZZ_NONKIN_BIOG_ADDR.y_coord)>0) AND " + _
        "((ZZZ_NONKIN_BIOG_ADDR.node_xcoord)>0) AND ((ZZZ_NONKIN_BIOG_ADDR.node_ycoord)>0));"

    cmdSQL.Execute tRecCount

    cmdSQL.CommandText = "UPDATE ZZZ_NONKIN_BIOG_ADDR SET ZZZ_NONKIN_BIOG_ADDR.c_distance = " + _
        "25484*Atn(c_t_dist/(1+Sqr(1-c_t_dist*c_t_dist))) " + _
        "WHERE (((ZZZ_NONKIN_BIOG_ADDR.x_coord)>0) AND ((ZZZ_NONKIN_BIOG_ADDR.y_coord)>0) AND " + _
        "((ZZZ_NONKIN_BIOG_ADDR.node_xcoord)>0) AND ((ZZZ_NONKIN_BIOG_ADDR.node_ycoord)>0))"

    cmdSQL.Execute tRecCount

End Sub

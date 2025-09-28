Option Compare Database
Public gFirstTime As Integer

Private Sub Form_Current()
    Dim tRst As DAO.Recordset

    If gFirstTime = 0 Then
         gFirstTime = 1
    Else
         Set tRst = Forms!CBDB_Browser_2!BIOG_MAIN_2_Subform.Form.Recordset
         tRst.FindFirst "c_personid = " & Str(c_personid.Value)
         If tRst.NoMatch Then
              gPersonID = 0
              Forms!CBDB_Browser_2.Form.CmdSaveToFile.Enabled = False
         Else
              gPersonID = c_personid.Value
              Forms!CBDB_Browser_2!BIOG_MAIN_2_Subform.Form.Refresh
              Call getKinship(c_personid.Value)
              Forms!CBDB_Browser_2.Form.CmdSaveToFile.Enabled = True
         End If
    End If
End Sub

Private Sub getKinship(t_personid As Long)
    '
    ' this routine searches for the immediate kin of the current person
    '
    Dim tMaxUp As Integer, tMaxDown As Integer, tMaxCol As Integer, tMaxMarr As Integer
    Dim tTrue As Integer, tFalse As Integer, tLoopCount As Long, tErrorStr As String
    Dim tContinue As Integer, tAddrID As Long, tExitDo As Boolean, tRecCount As Long, tRecDelete As Long
    Dim tRstDummy As DAO.Recordset, tAppendQuery As QueryDef
    Dim tSeekStr As String, tLoopMax As Long, tLoopInfoStr As String, tKinQueryStr As String, tQueryStr As String
    Dim tNodeDistQueryStr As String, tPruneTmpQueryDupesStr As String, tPruneTmpQuery As String
    Dim tPruneInversesQueryStr1 As String, tPruneTmpInversesQueryStr1 As String, tPruneInversesQueryStr2 As Strin
g, tAppendQueryStr As String, tPruneTmpInversesQueryStr2 As String
    Dim tKinFirstQueryStr As String, tPruneTmpQueryDupesStr2 As String, tPruneTmpQuery2 As String

    tTrue = -1
    tFalse = 0

    tLoopMax = 10
    tMaxUp = 2
    tMaxDown = 2
    tMaxCol = 1
    tMaxMarr = 1
    '
    Dim KinQuery As DAO.QueryDef
    Dim prm As DAO.Parameter
    Dim cmdSQL As ADODB.Command, tRecDeleted As Long, strSQL As String
    '
    ' Clear the tables
    '
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    ' clear the working files
    '
    cmdSQL.CommandText = "Delete * from ZZ_KIN_LIST"
    cmdSQL.Execute tRecCount
    '
    cmdSQL.CommandText = "Delete * from ZZ_KIN_LIST_TMP"
    cmdSQL.Execute tRecCount
    '
    ' now zap the ego-relative form person file
    '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_KIN"
    cmdSQL.Execute tRecCount
    '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_KINNET"
    cmdSQL.Execute tRecDeleted

    '
    ' this copies the people on the import list (which is just the selected person if one does not use a list)
    '
    tQueryStr = "INSERT INTO ZZ_KIN_LIST ( c_personid, c_kin_id, c_kinrel, c_kinrel_total, c_kinrel_total_raw, c_
kinrel_total_simplified, " + _
        "c_kin_code, c_up_total, c_down_total, c_mar_total, c_col_total, c_distance, c_up, c_down, c_mar, c_col,
" + _
        "c_prior_female, c_kin_female, c_kin_sex, c_female, c_sex, c_personid_root ) " + _
        "SELECT ZZZ_BIOG_MAIN.c_personid, ZZZ_BIOG_MAIN.c_personid AS c_kin_id, " + _
            "'ego' AS c_kin_rel, 'ego' AS c_kin_rel_total, 'ego' AS c_kin_rel_total_raw, 'ego' AS c_kin_rel_total
_simplified, -3 AS c_kin_code, " + _
            "0 AS c_up_total, 0 AS c_down_total, 0 AS c_mar_total, 0 AS c_col_total, 0 AS c_distance, " + _
            "0 AS c_up, 0 AS c_down, 0 AS c_mar, 0 AS c_col, ZZZ_BIOG_MAIN.c_female AS c_prior_female, ZZZ_BIOG_M
AIN.c_female AS c_kin_female, " + _
            "iif(ZZZ_BIOG_MAIN.c_female,'F','M'), ZZZ_BIOG_MAIN.c_female, iif(ZZZ_BIOG_MAIN.c_female,'F','M'), ZZ
Z_BIOG_MAIN.c_personid AS c_personid_root " + _
        "FROM ZZZ_BIOG_MAIN WHERE ZZZ_BIOG_MAIN.c_personid = " + Str(t_personid)

    ' the initial list of "ego" roots is now intialized in ZZ_KIN_LIST, and the personID is stored as c_personid_
root: use this to create ZZ_KIN_LIST_TMP
    ' in the first query, one begins to build out with a first layer of kinship relations
    ' as the first layer, we put the kin_rel as both the kin_rel and the kin_rel_total

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecCount

    ' the new logic is to not test the metrics until after the reduction routine is run
    ' the reduction routine will remove the first layer of kin who do not meet the 2-2-1-1 test criterion; these
will need to be added back in at the end

     tKinFirstQueryStr = "INSERT INTO ZZ_KIN_LIST_TMP ( c_personid, c_kin_id, c_kinrel, c_kinrel_total, " + _
         "c_kinrel_total_raw, c_kinrel_total_simplified, c_kin_code, c_up_total, c_down_total, c_mar_total, c_col_
total, c_distance, " + _
         "c_up, c_down, c_mar, c_col, c_personid_root, c_prior_female, c_kin_female, c_kin_sex, c_female, c_sex, c
_notes, " + _
         "c_source, c_source_text_chn, c_source_text ) " + _
         "SELECT DISTINCT ZZZ_KIN_BIOG_ADDR.c_personid, ZZZ_KIN_BIOG_ADDR.c_node_id, ZZZ_KIN_BIOG_ADDR.c_link_desc
, " + _
             "KINSHIP_CODES.c_kinrel_simplified AS c_kinrel_total, ZZZ_KIN_BIOG_ADDR.c_link_desc AS c_kinrel_total
_raw, " + _
             "KINSHIP_CODES.c_kinrel_simplified AS c_kinrel_total_simplified, " + _
             "ZZZ_KIN_BIOG_ADDR.c_link_code, ZZZ_KIN_BIOG_ADDR.c_upstep AS c_up_total, ZZZ_KIN_BIOG_ADDR.c_dwnstep
 AS c_down_total, " + _
             "ZZZ_KIN_BIOG_ADDR.c_marstep AS c_mar_total, ZZZ_KIN_BIOG_ADDR.c_colstep AS c_col_total, 0 AS c_dista
nce, " + _
             "ZZZ_KIN_BIOG_ADDR.c_upstep, ZZZ_KIN_BIOG_ADDR.c_dwnstep, ZZZ_KIN_BIOG_ADDR.c_marstep, ZZZ_KIN_BIOG_A
DDR.c_colstep, " + _
             "ZZ_KIN_LIST.c_personid_root, ZZ_KIN_LIST.c_female AS c_prior_female, ZZZ_KIN_BIOG_ADDR.c_node_female
, iif(ZZZ_KIN_BIOG_ADDR.c_node_female,'F','M'), " + _
             "ZZZ_KIN_BIOG_ADDR.c_female, iif(ZZZ_KIN_BIOG_ADDR.c_female,'F','M'), " + _
             "'Notes: ' + ZZZ_KIN_BIOG_ADDR.c_person_name_chn + ' > ' + ZZZ_KIN_BIOG_ADDR.c_node_chn + ' (' + ZZZ_
KIN_BIOG_ADDR.c_link_desc + ') ' AS c_notes, " + _
             "ZZZ_KIN_BIOG_ADDR.c_source, ZZZ_KIN_BIOG_ADDR.c_title_chn, ZZZ_KIN_BIOG_ADDR.c_title " + _
         "FROM (ZZZ_KIN_BIOG_ADDR INNER JOIN ZZ_KIN_LIST ON ZZZ_KIN_BIOG_ADDR.c_personid = ZZ_KIN_LIST.c_kin_id) "
 + _
             "INNER JOIN KINSHIP_CODES ON ZZZ_KIN_BIOG_ADDR.c_link_code = KINSHIP_CODES.c_kincode"

    ' each subsequent layer adds the new kin_rel to the kin_rel_total and the total cumulative steps are summed

      tKinQueryStr = "INSERT INTO ZZ_KIN_LIST_TMP ( c_personid, c_kin_id, c_kinrel, c_kinrel_total_simplified, c_ki
nrel_total, " + _
          "c_kinrel_total_raw, c_kin_code, c_up_total, c_down_total, c_mar_total, c_col_total, c_distance, " + _
          "c_up, c_down, c_mar, c_col, c_personid_root, c_prior_female, c_kin_female, c_kin_sex, c_female, c_sex, c
_notes, " + _
          "c_source, c_source_text_chn, c_source_text) " + _
          "SELECT DISTINCT ZZZ_KIN_BIOG_ADDR.c_personid, ZZZ_KIN_BIOG_ADDR.c_node_id, ZZZ_KIN_BIOG_ADDR.c_link_desc
, " + _
              "[ZZ_KIN_LIST].[c_kinrel_total_simplified]+[KINSHIP_CODES].[c_kinrel_simplified] AS c_kinrel_total_si
mplified, " + _
              "[ZZ_KIN_LIST].[c_kinrel_total]+[KINSHIP_CODES].[c_kinrel_simplified] AS c_kinrel_total, " + _
              "ZZ_KIN_LIST.c_kinrel_total_raw+ZZZ_KIN_BIOG_ADDR.c_link_desc AS c_kinrel_total_raw, " + _
              "ZZZ_KIN_BIOG_ADDR.c_link_code, ZZZ_KIN_BIOG_ADDR.c_upstep+ZZ_KIN_LIST.c_up_total AS c_up_total, " +
_
              "ZZZ_KIN_BIOG_ADDR.c_dwnstep+ZZ_KIN_LIST.c_down_total AS c_down_total, " + _
              "ZZZ_KIN_BIOG_ADDR.c_marstep+ZZ_KIN_LIST.c_mar_total AS c_mar_total, " + _
              "ZZZ_KIN_BIOG_ADDR.c_colstep+ZZ_KIN_LIST.c_col_total AS c_col_total, " + _
              "ZZ_KIN_LIST.c_distance, ZZZ_KIN_BIOG_ADDR.c_upstep, ZZZ_KIN_BIOG_ADDR.c_dwnstep, ZZZ_KIN_BIOG_ADDR.c
_marstep, ZZZ_KIN_BIOG_ADDR.c_colstep, " + _
              "ZZ_KIN_LIST.c_personid_root, ZZ_KIN_LIST.c_female AS c_prior_female, ZZZ_KIN_BIOG_ADDR.c_node_female
, iif(ZZZ_KIN_BIOG_ADDR.c_node_female,'F','M'), " + _
              "ZZZ_KIN_BIOG_ADDR.c_female, iif(ZZZ_KIN_BIOG_ADDR.c_female,'F','M'), " + _
              "ZZ_KIN_LIST.c_notes + ' > ' + ZZZ_KIN_BIOG_ADDR.c_node_chn + ' (' + ZZZ_KIN_BIOG_ADDR.c_link_desc +
') ', " + _
              "ZZZ_KIN_BIOG_ADDR.c_source, ZZZ_KIN_BIOG_ADDR.c_title_chn, ZZZ_KIN_BIOG_ADDR.c_title " + _
          "FROM (ZZZ_KIN_BIOG_ADDR INNER JOIN ZZ_KIN_LIST ON ZZZ_KIN_BIOG_ADDR.c_personid = ZZ_KIN_LIST.c_kin_id) "
  + _
              "INNER JOIN KINSHIP_CODES ON ZZZ_KIN_BIOG_ADDR.c_link_code = KINSHIP_CODES.c_kincode " + _
          "WHERE ((ZZ_KIN_LIST.c_distance)="

       '   the various queries for cleaning up the results (need editing)
       '   ZZ_KIN_LIST is our collection of current results
       '   ZZ_KIN_LIST_TMP is the new material coming from the most recent query loop which looks for kin of the c_ki
n_id

    ' if the new kin (in c_kin_id) does not already show up as a relative of someone else already in the databas
e, this is one more step distant
    tNodeDistQueryStr = "UPDATE ZZ_KIN_LIST_TMP LEFT JOIN ZZ_KIN_LIST ON ZZ_KIN_LIST_TMP.c_kin_id = ZZ_KIN_LIST.c
_kin_id " + _
        "SET ZZ_KIN_LIST_TMP.c_distance = [ZZ_KIN_LIST_TMP].[c_distance]+1 " + _
        "WHERE (((ZZ_KIN_LIST.c_personid) Is Null))"
    '
    ' for insurance, explicitly delete duplicate results
    '
    tPruneTmpQuery = "UPDATE ZZ_KIN_LIST INNER JOIN ZZ_KIN_LIST_TMP ON " + _
        "(ZZ_KIN_LIST.c_kin_id = ZZ_KIN_LIST_TMP.c_kin_id) AND " + _
        "(ZZ_KIN_LIST.c_personid = ZZ_KIN_LIST_TMP.c_personid) " + _
        "SET ZZ_KIN_LIST_TMP.c_delete = 1;"

       ' delete inverse results
       tPruneTmpQuery2 = "UPDATE ZZ_KIN_LIST INNER JOIN ZZ_KIN_LIST_TMP ON " + _
           "(ZZ_KIN_LIST.c_personid = ZZ_KIN_LIST_TMP.c_kin_id) AND " + _
           "(ZZ_KIN_LIST.c_kin_id = ZZ_KIN_LIST_TMP.c_personid) " + _
           "SET ZZ_KIN_LIST_TMP.c_delete = 1;"

    tPruneTmpQueryDupesStr = "UPDATE ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 INNER JOIN " + _
        "ZZ_KIN_LIST_TMP ON (ZZ_KIN_LIST_TMP_1.c_personid = ZZ_KIN_LIST_TMP.c_personid) " + _
        "AND (ZZ_KIN_LIST_TMP_1.c_kin_id = ZZ_KIN_LIST_TMP.c_kin_id) " + _
        "AND (ZZ_KIN_LIST_TMP_1.c_kin_code = ZZ_KIN_LIST_TMP.c_kin_code) " + _
        "SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
        "WHERE (([ZZ_KIN_LIST_TMP].[c_up_total]*1000+[ZZ_KIN_LIST_TMP].[c_down_total]*100+[ZZ_KIN_LIST_TMP].[c_co
l_total]*10+[ZZ_KIN_LIST_TMP].[c_mar_total]>" + _
        "[ZZ_KIN_LIST_TMP_1].[c_up_total]*1000+[ZZ_KIN_LIST_TMP_1].[c_down_total]*100+[ZZ_KIN_LIST_TMP_1].[c_col_
total]*10+[ZZ_KIN_LIST_TMP_1].[c_mar_total]))"

       ' if the data is good I should not need to do this
       tPruneTmpQueryDupesStr2 = "UPDATE ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 INNER JOIN " + _
           "ZZ_KIN_LIST_TMP ON (ZZ_KIN_LIST_TMP_1.c_personid = ZZ_KIN_LIST_TMP.c_personid) " + _
           "AND (ZZ_KIN_LIST_TMP_1.c_kin_id = ZZ_KIN_LIST_TMP.c_kin_id) " + _
           "AND (ZZ_KIN_LIST_TMP_1.c_kin_code = ZZ_KIN_LIST_TMP.c_kin_code) " + _
           "SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
           "WHERE (((StrComp([ZZ_KIN_LIST_TMP].[c_kinrel_total_raw], [ZZ_KIN_LIST_TMP_1].[c_kinrel_total_raw])) > 0)
)"

    tPruneInversesQueryStr1 = "UPDATE ZZ_KIN_LIST INNER JOIN (KINSHIP_CODES INNER JOIN ZZ_KIN_LIST_TMP ON KINSHIP
_CODES.c_kincode = ZZ_KIN_LIST_TMP.c_kin_code) ON " + _
        "(ZZ_KIN_LIST.c_kin_id = ZZ_KIN_LIST_TMP.c_personid) AND (ZZ_KIN_LIST.c_personid = ZZ_KIN_LIST_TMP.c_kin_
id) SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
        "WHERE (((ZZ_KIN_LIST.c_kin_code)=[KINSHIP_CODES].[c_kin_pair1])) OR (((ZZ_KIN_LIST.c_kin_code)=[KINSHIP_
CODES].[c_kin_pair2]))"

    tPruneInversesQueryStr2 = "UPDATE (ZZ_KIN_LIST INNER JOIN ZZ_KIN_LIST_TMP ON (ZZ_KIN_LIST.c_personid = ZZ_KIN
_LIST_TMP.c_kin_id) AND " + _
        "(ZZ_KIN_LIST.c_kin_id = ZZ_KIN_LIST_TMP.c_personid)) INNER JOIN KINSHIP_CODES ON ZZ_KIN_LIST.c_kin_code
= KINSHIP_CODES.c_kincode SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
        "WHERE (((ZZ_KIN_LIST_TMP.c_kin_code)=[KINSHIP_CODES].[c_kin_pair1] Or (ZZ_KIN_LIST_TMP.c_kin_code)=[KINS
HIP_CODES].[c_kin_pair2]))"


       tPruneTmpInversesQueryStr1 = "UPDATE KINSHIP_CODES INNER JOIN (ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 " + _
           "INNER JOIN ZZ_KIN_LIST_TMP ON (ZZ_KIN_LIST_TMP_1.c_personid = ZZ_KIN_LIST_TMP.c_kin_id) AND " + _
           "(ZZ_KIN_LIST_TMP_1.c_kin_id = ZZ_KIN_LIST_TMP.c_personid)) ON " + _
           "KINSHIP_CODES.c_kincode = ZZ_KIN_LIST_TMP.c_kin_code SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
           "WHERE (((ZZ_KIN_LIST_TMP.c_distance)>[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
           "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair1])) OR " + _
           "(((ZZ_KIN_LIST_TMP.c_distance)=[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
           "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair1]) AND " + _
           "((ZZ_KIN_LIST_TMP.c_personid)>[ZZ_KIN_LIST_TMP_1].[c_personid])) OR " + _
           "(((ZZ_KIN_LIST_TMP.c_distance)>[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
           "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair2])) OR " + _
           "(((ZZ_KIN_LIST_TMP.c_distance)=[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
           "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair2]) AND " + _
           "((ZZ_KIN_LIST_TMP.c_personid)>[ZZ_KIN_LIST_TMP_1].[c_personid]))"

       tPruneTmpInversesQueryStr2 = "UPDATE KINSHIP_CODES INNER JOIN (ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 " + _
           "INNER JOIN ZZ_KIN_LIST_TMP ON (ZZ_KIN_LIST_TMP_1.c_personid = ZZ_KIN_LIST_TMP.c_kin_id) AND " + _
           "(ZZ_KIN_LIST_TMP_1.c_kin_id = ZZ_KIN_LIST_TMP.c_personid)) ON " + _
           "KINSHIP_CODES.c_kincode = ZZ_KIN_LIST_TMP.c_kin_code SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
           "WHERE (((ZZ_KIN_LIST_TMP.c_distance)<[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
         "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair1])) OR " + _
         "(((ZZ_KIN_LIST_TMP.c_distance)=[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
         "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair1]) AND " + _
         "((ZZ_KIN_LIST_TMP.c_personid)<[ZZ_KIN_LIST_TMP_1].[c_personid])) OR " + _
         "(((ZZ_KIN_LIST_TMP.c_distance)<[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
         "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair2])) OR " + _
         "(((ZZ_KIN_LIST_TMP.c_distance)=[ZZ_KIN_LIST_TMP_1].[c_distance]) AND " + _
         "((ZZ_KIN_LIST_TMP_1.c_kin_code)=[KINSHIP_CODES].[c_kin_pair2]) AND " + _
         "((ZZ_KIN_LIST_TMP.c_personid)<[ZZ_KIN_LIST_TMP_1].[c_personid]))"

     tAppendQueryStr = "INSERT INTO ZZ_KIN_LIST ( c_personid, c_kin_id, c_kin_code, c_personid_root, c_kinrel, " +
 _
        "c_kinrel_total, c_kinrel_total_raw, c_kinrel_total_simplified, c_up, c_down, c_col, c_mar, c_up_total, c
_down_total, c_col_total, " + _
        "c_mar_total, c_distance, c_female, c_sex, c_kin_female, c_kin_sex, c_prior_female, c_notes, c_source, c_
source_text_chn, c_source_text ) " + _
        "SELECT DISTINCT ZZ_KIN_LIST_TMP.c_personid, ZZ_KIN_LIST_TMP.c_kin_id, ZZ_KIN_LIST_TMP.c_kin_code, " + _
            "ZZ_KIN_LIST_TMP.c_personid_root, ZZ_KIN_LIST_TMP.c_kinrel, ZZ_KIN_LIST_TMP.c_kinrel_total, " + _
            "ZZ_KIN_LIST_TMP.c_kinrel_total_raw, ZZ_KIN_LIST_TMP.c_kinrel_total_simplified, " + _
            "ZZ_KIN_LIST_TMP.c_up, ZZ_KIN_LIST_TMP.c_down, ZZ_KIN_LIST_TMP.c_col, ZZ_KIN_LIST_TMP.c_mar, " + _
            "ZZ_KIN_LIST_TMP.c_up_total, ZZ_KIN_LIST_TMP.c_down_total, ZZ_KIN_LIST_TMP.c_col_total, " + _
            "ZZ_KIN_LIST_TMP.c_mar_total, ZZ_KIN_LIST_TMP.c_distance, ZZ_KIN_LIST_TMP.c_female, ZZ_KIN_LIST_TMP.c
_sex, " + _
            "ZZ_KIN_LIST_TMP.c_kin_female, ZZ_KIN_LIST_TMP.c_kin_sex, ZZ_KIN_LIST_TMP.c_prior_female, ZZ_KIN_LIST
_TMP.c_notes, " + _
            "ZZ_KIN_LIST_TMP.c_source, ZZ_KIN_LIST_TMP.c_source_text_chn, ZZ_KIN_LIST_TMP.c_source_text " + _
        "FROM ZZ_KIN_LIST_TMP"

     tLoopCount = 1
     tExitDo = False

     Do While tLoopCount <= tLoopMax And tRecCount > 0
         If tLoopCount = 1 Then
              ' MsgBox "Running first query"
              cmdSQL.CommandText = tKinFirstQueryStr
         Else
              ' MsgBox "Running query"
              cmdSQL.CommandText = tKinQueryStr + Str(tLoopCount - 1) + ")"
         End If
         cmdSQL.Execute tRecCount

         If tRecCount > 0 Then
             '
             ' process the results for addition
             '
             ' update the distance
             '
             'MsgBox "Fixing node distance"
             cmdSQL.CommandText = tNodeDistQueryStr
             cmdSQL.Execute tRecDelete
             '
             ' then mark the duplicates and delete them
             '
             'MsgBox "Fixing dupes 1"
             cmdSQL.CommandText = tPruneTmpQuery
             cmdSQL.Execute tRecDelete
             cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
             cmdSQL.Execute tRecDelete
             '
             'MsgBox "Fixing dupes 2"
             cmdSQL.CommandText = tPruneTmpQuery2
             cmdSQL.Execute tRecDelete
             cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
             cmdSQL.Execute tRecDelete
             '
             'MsgBox "Fixing dupes 3"
             cmdSQL.CommandText = tPruneTmpQueryDupesStr
             cmdSQL.Execute tRecDelete
             cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
             cmdSQL.Execute tRecDelete
             '
             'MsgBox "Fixing dupes 4"
             cmdSQL.CommandText = tPruneTmpQueryDupesStr2
             cmdSQL.Execute tRecDelete
             cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
             cmdSQL.Execute tRecDelete
             '
             'MsgBox "Fixing inverses"
             cmdSQL.CommandText = tPruneTmpInversesQueryStr1
             cmdSQL.Execute tRecDelete
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
            cmdSQL.Execute tRecDelete
            '
            cmdSQL.CommandText = tPruneInversesQueryStr1
            cmdSQL.Execute tRecDelete
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
            cmdSQL.Execute tRecDelete
            '
            cmdSQL.CommandText = tPruneInversesQueryStr2
            cmdSQL.Execute tRecDelete
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
            cmdSQL.Execute tRecDelete
            '
            ' now simplify the kinship string, add to the total and reduce if possible
            '
            '
            ' Reduce kinship strings
            '
            ' first just get the string length

            cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP SET ZZ_KIN_LIST_TMP.c_kinrel_len = Len([ZZ_KIN_LIST_TMP]
.[c_kinrel_total])"
            cmdSQL.Execute tRecDelete
            '
            ' then deal with len = 2
            '
            cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP " + _
                "SET ZZ_KIN_LIST_TMP.c_kinrel_root_text = Left([ZZ_KIN_LIST_TMP].[c_kinrel_total],[ZZ_KIN_LIST_TM
P].[c_kinrel_len]-2), " + _
                    "ZZ_KIN_LIST_TMP.c_kinrel_test_text = Right([ZZ_KIN_LIST_TMP].[c_kinrel_total],2), " + _
                    "ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplified = Left([ZZ_KIN_LIST_TMP].[c_kinrel_total_simpl
ified],[ZZ_KIN_LIST_TMP].[c_kinrel_len]-2)" + _
                "WHERE (((ZZ_KIN_LIST_TMP.c_kinrel_len)=2))"
            cmdSQL.Execute tRecDelete
            '
            '   replace where relevant

            cmdSQL.CommandText = "UPDATE ZZZ_KINREL_REDUCTION RIGHT JOIN ZZ_KIN_LIST_TMP " + _
                "ON ZZZ_KINREL_REDUCTION.c_kinrel_target = ZZ_KIN_LIST_TMP.c_kinrel_test_text " + _
                "SET ZZ_KIN_LIST_TMP.c_kinrel_total = [ZZ_KIN_LIST_TMP].[c_kinrel_root_text]+[ZZZ_KINREL_REDUCTIO
N].[c_kinrel_replacement], " + _
                    "ZZ_KIN_LIST_TMP.c_kinrel_total_simplified = ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplified +
" + _
                                 "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kinr
el_replacement] + ')', " + _
                    "ZZ_KIN_LIST_TMP.c_notes = [ZZ_KIN_LIST_TMP].[c_notes] + " + _
                             "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kinrel_r
eplacement] + ') ', " + _
                    "ZZ_KIN_LIST_TMP.c_up_total = [ZZ_KIN_LIST_TMP].[c_up_total]+[ZZZ_KINREL_REDUCTION].[c_up_cha
nge], " + _
                    "ZZ_KIN_LIST_TMP.c_down_total = [ZZ_KIN_LIST_TMP].[c_down_total]+[ZZZ_KINREL_REDUCTION].[c_do
wn_change], " + _
                    "ZZ_KIN_LIST_TMP.c_col_total = [ZZ_KIN_LIST_TMP].[c_col_total]+[ZZZ_KINREL_REDUCTION].[c_col_
change], " + _
                    "ZZ_KIN_LIST_TMP.c_mar_total = [ZZ_KIN_LIST_TMP].[c_mar_total]+[ZZZ_KINREL_REDUCTION].[c_mar_
change] " + _
                "WHERE (((ZZZ_KINREL_REDUCTION.c_kinrel_target) Is Not Null AND ZZZ_KINREL_REDUCTION.c_required )
)"
            cmdSQL.Execute tRecDelete

            '   then deal with len > 2
            '
            '    copy the target string and string root

            cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP " + _
                "SET ZZ_KIN_LIST_TMP.c_kinrel_root_text = Left([ZZ_KIN_LIST_TMP].[c_kinrel_total],[ZZ_KIN_LIST_TM
P].[c_kinrel_len]-2), " + _
                    "ZZ_KIN_LIST_TMP.c_kinrel_test_text = Right([ZZ_KIN_LIST_TMP].[c_kinrel_total],2), " + _
                    "ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplified = Left([ZZ_KIN_LIST_TMP].[c_kinrel_total_simpl
ified],[ZZ_KIN_LIST_TMP].[c_kinrel_len]-2)" + _
                "WHERE (((ZZ_KIN_LIST_TMP.c_kinrel_len)>2))"
            cmdSQL.Execute tRecDelete
            '
            '   replace where relevant

            cmdSQL.CommandText = "UPDATE ZZZ_KINREL_REDUCTION RIGHT JOIN ZZ_KIN_LIST_TMP " + _
                "ON ZZZ_KINREL_REDUCTION.c_kinrel_target = ZZ_KIN_LIST_TMP.c_kinrel_test_text " + _
                "SET ZZ_KIN_LIST_TMP.c_kinrel_total = [ZZ_KIN_LIST_TMP].[c_kinrel_root_text]+[ZZZ_KINREL_REDUCTIO
N].[c_kinrel_replacement], " + _
                    "ZZ_KIN_LIST_TMP.c_kinrel_total_simplified = ZZ_KIN_LIST_TMP.c_kinrel_root_text_simplified +
" + _
                             "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kinrel_
replacement] + ')', " + _
                    "ZZ_KIN_LIST_TMP.c_notes = [ZZ_KIN_LIST_TMP].[c_notes] + " + _
                            "'(' + ZZZ_KINREL_REDUCTION.c_kinrel_target + '>' +[ZZZ_KINREL_REDUCTION].[c_kinrel_r
eplacement] + ') ', " + _
                    "ZZ_KIN_LIST_TMP.c_up_total = [ZZ_KIN_LIST_TMP].[c_up_total]+[ZZZ_KINREL_REDUCTION].[c_up_cha
nge], " + _
                    "ZZ_KIN_LIST_TMP.c_down_total = [ZZ_KIN_LIST_TMP].[c_down_total]+[ZZZ_KINREL_REDUCTION].[c_do
wn_change], " + _
                    "ZZ_KIN_LIST_TMP.c_col_total = [ZZ_KIN_LIST_TMP].[c_col_total]+[ZZZ_KINREL_REDUCTION].[c_col_
change], " + _
                    "ZZ_KIN_LIST_TMP.c_mar_total = [ZZ_KIN_LIST_TMP].[c_mar_total]+[ZZZ_KINREL_REDUCTION].[c_mar_
change] " + _
                "WHERE (((ZZZ_KINREL_REDUCTION.c_kinrel_target) Is Not Null AND ZZZ_KINREL_REDUCTION.c_required )
)"
            cmdSQL.Execute tRecDelete
            '
            ' now mark the records with bad metrics
            '
            cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
                "WHERE (((ZZ_KIN_LIST_TMP.c_up_total)>" + Str(tMaxUp) + ")) OR " + _
                      "(((ZZ_KIN_LIST_TMP.c_down_total)>" + Str(tMaxDown) + ")) OR " + _
                      "(((ZZ_KIN_LIST_TMP.c_col_total)>" + Str(tMaxCol) + ")) OR " + _
                      "(((ZZ_KIN_LIST_TMP.c_mar_total)>" + Str(tMaxMarr) + "))"
            cmdSQL.Execute tRecDelete
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
            cmdSQL.Execute tRecDelete
            '
            ' one final test: the only difference between ZZ_KIN_LIST_TEMP records is in PRIOR_FEMALE
            '
            cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 INNER JOIN ZZ_KIN_LIST_TMP " + _
                "ON (ZZ_KIN_LIST_TMP_1.c_kin_id = ZZ_KIN_LIST_TMP.c_kin_id) AND " + _
                "(ZZ_KIN_LIST_TMP_1.c_personid = ZZ_KIN_LIST_TMP.c_personid) AND " + _
                "(ZZ_KIN_LIST_TMP_1.c_kin_code = ZZ_KIN_LIST_TMP.c_kin_code) " + _
                "SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
                "WHERE (((ZZ_KIN_LIST_TMP.c_prior_female)=True) AND ((ZZ_KIN_LIST_TMP_1.c_prior_female)=False))"
            cmdSQL.Execute tRecDelete
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
            cmdSQL.Execute tRecDelete
            '
            ' it turns out that getting rid of inverse records is tougher than I would like, so we try one last
time
            '
            cmdSQL.CommandText = tPruneTmpInversesQueryStr2
            cmdSQL.Execute tRecDelete
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
            cmdSQL.Execute tRecDelete
            '
            ' one last pair of clean-up routines is necessary. One can arrive at the same results through differ
ent paths
            '
            ' first, take the shorter path
            '
            cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP INNER JOIN ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 ON " + _
                "(ZZ_KIN_LIST_TMP.c_personid_root = ZZ_KIN_LIST_TMP_1.c_personid_root) " + _
                "AND (ZZ_KIN_LIST_TMP.c_kin_id = ZZ_KIN_LIST_TMP_1.c_kin_id) AND (ZZ_KIN_LIST_TMP.c_personid = ZZ
_KIN_LIST_TMP_1.c_personid) " + _
                "AND (ZZ_KIN_LIST_TMP.c_kinrel = ZZ_KIN_LIST_TMP_1.c_kinrel) " + _
                "SET ZZ_KIN_LIST_TMP_1.c_delete = 1 " + _
                "WHERE (((Len([ZZ_KIN_LIST_TMP].[c_notes]))<Len([ZZ_KIN_LIST_TMP_1].[c_notes])))"
            cmdSQL.Execute tRecDelete
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
            cmdSQL.Execute tRecDelete
            '
            'MsgBox "Last step"
            '
            ' then take the string with the smaller value
            '
            cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP INNER JOIN ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 ON " + _
                "(ZZ_KIN_LIST_TMP.c_personid_root = ZZ_KIN_LIST_TMP_1.c_personid_root) " + _
                "AND (ZZ_KIN_LIST_TMP.c_kin_id = ZZ_KIN_LIST_TMP_1.c_kin_id) AND (ZZ_KIN_LIST_TMP.c_personid = ZZ
_KIN_LIST_TMP_1.c_personid) " + _
                "AND (ZZ_KIN_LIST_TMP.c_kinrel = ZZ_KIN_LIST_TMP_1.c_kinrel) " + _
                "SET ZZ_KIN_LIST_TMP_1.c_delete = 1 " + _
                "WHERE ('X'+[ZZ_KIN_LIST_TMP].[c_notes] > 'X'+[ZZ_KIN_LIST_TMP_1].[c_notes])"
            cmdSQL.Execute tRecDelete
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
            cmdSQL.Execute tRecDelete
            '
            ' now append the results: if no records are added, this should stop the looping
            '
            ' MsgBox "Copying to ZZ_KIN_LIST"
            cmdSQL.CommandText = tAppendQueryStr
            cmdSQL.Execute tRecCount
            '
            ' and clear ZZ_KIN_LIST_TMP
            '
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP"
            cmdSQL.Execute tRecDelete
            '
        End If

        tLoopCount = tLoopCount + 1

        If tLoopCount > tLoopMax Then
            MsgBox "Loop limit hit."
            tExitDo = True
            Exit Do
        End If
    Loop
    '
    ' clean up the results
    '
    'MsgBox "Fixing ZZ_KIN_LIST inverses"
    cmdSQL.CommandText = tAppendQueryStr
    cmdSQL.Execute tRecDelete
    '
    ' there is no need to copy to the kinship table
    '
    ' insert

    'tQueryStr = "INSERT INTO ZZ_SCRATCH_KINNET ( c_person_id, c_kin_id, c_kin_code, c_kin_rel, c_source, c_sourc
e_text_chn, c_source_text) " + _
                "SELECT DISTINCT ZZ_KIN_LIST.c_personid, ZZ_KIN_LIST.c_kin_id, ZZ_KIN_LIST.c_kin_code, ZZ_KIN_LIS
T.c_kinrel, ZZ_KIN_LIST.c_source, " + _
                    "ZZ_KIN_LIST.c_source_text_chn, ZZ_KIN_LIST.c_source_text " + _
                "FROM ZZ_KIN_LIST WHERE (((ZZ_KIN_LIST.c_personid)<>[ZZ_KIN_LIST].[c_kin_id]))"

    'cmdSQL.CommandText = tQueryStr
    'cmdSQL.Execute tRecDelete
    '
    ' update the person
    '
    'tQueryStr = "UPDATE ZZ_SCRATCH_KINNET INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_KINNET.c_person_id = ZZZ_BIOG_M
AIN.c_personid " + _
                "SET ZZ_SCRATCH_KINNET.c_name = [ZZZ_BIOG_MAIN].[c_name], ZZ_SCRATCH_KINNET.c_name_chn = [ZZZ_BIO
G_MAIN].[c_name_chn], " + _
                     "ZZ_SCRATCH_KINNET.c_female = [ZZZ_BIOG_MAIN].[c_female], ZZ_SCRATCH_KINNET.c_sex = IIf([ZZZ_
BIOG_MAIN].[c_female],'F','M'), " + _
                     "ZZ_SCRATCH_KINNET.c_index_year = [ZZZ_BIOG_MAIN].[c_index_year], " + _
                     "ZZ_SCRATCH_KINNET.c_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], " + _
                     "ZZ_SCRATCH_KINNET.c_addr_name = [ZZZ_BIOG_MAIN].[c_index_addr_name], " + _
                     "ZZ_SCRATCH_KINNET.c_addr_chn = [ZZZ_BIOG_MAIN].[c_index_addr_chn], " + _
                     "ZZ_SCRATCH_KINNET.x_coord = [ZZZ_BIOG_MAIN].[x_coord], ZZ_SCRATCH_KINNET.y_coord = [ZZZ_BIOG
_MAIN].[y_coord], " + _
                     "ZZ_SCRATCH_KINNET.c_addr_type = [ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
                     "ZZ_SCRATCH_KINNET.c_addr_desc = [ZZZ_BIOG_MAIN].[c_index_addr_type_desc], " + _
                     "ZZ_SCRATCH_KINNET.c_addr_desc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn]"

    'cmdSQL.CommandText = tQueryStr
    'cmdSQL.Execute tRecDelete
    '
    ' update the kin
    '
    'tQueryStr = "UPDATE ZZ_SCRATCH_KINNET INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_KINNET.c_kin_id = ZZZ_BIOG_MAIN
.c_personid " + _
                "SET ZZ_SCRATCH_KINNET.c_kin_name = [ZZZ_BIOG_MAIN].[c_name], ZZ_SCRATCH_KINNET.c_kin_chn = [ZZZ_
BIOG_MAIN].[c_name_chn], " + _
                     "ZZ_SCRATCH_KINNET.c_kin_female = [ZZZ_BIOG_MAIN].[c_female], ZZ_SCRATCH_KINNET.c_kin_sex = I
If([ZZZ_BIOG_MAIN].[c_female],'F','M'), " + _
                     "ZZ_SCRATCH_KINNET.c_kin_index_year = [ZZZ_BIOG_MAIN].[c_index_year], " + _
                     "ZZ_SCRATCH_KINNET.c_kin_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], " + _
                     "ZZ_SCRATCH_KINNET.c_kin_addr_name = [ZZZ_BIOG_MAIN].[c_index_addr_name], " + _
                     "ZZ_SCRATCH_KINNET.c_kin_addr_chn = [ZZZ_BIOG_MAIN].[c_index_addr_chn], " + _
                     "ZZ_SCRATCH_KINNET.kin_x_coord = [ZZZ_BIOG_MAIN].[x_coord], ZZ_SCRATCH_KINNET.kin_y_coord = [
ZZZ_BIOG_MAIN].[y_coord], " + _
                     "ZZ_SCRATCH_KINNET.c_kin_addr_type = [ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
                     "ZZ_SCRATCH_KINNET.c_kin_addr_desc = [ZZZ_BIOG_MAIN].[c_index_addr_type_desc], " + _
                     "ZZ_SCRATCH_KINNET.c_kin_addr_desc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn]"
     'cmdSQL.CommandText = tQueryStr
     'cmdSQL.Execute tRecDelete
     '
     ' update the relation
     '
     'tQueryStr = "UPDATE ZZ_SCRATCH_KINNET INNER JOIN ZZZ_KIN_BIOG_ADDR ON (ZZ_SCRATCH_KINNET.c_kin_code = ZZZ_KI
N_BIOG_ADDR.c_link_code) AND " + _
                     "(ZZ_SCRATCH_KINNET.c_kin_id = ZZZ_KIN_BIOG_ADDR.c_node_id) AND (ZZ_SCRATCH_KINNET.c_person_i
d = ZZZ_KIN_BIOG_ADDR.c_personid) " + _
                 "SET ZZ_SCRATCH_KINNET.c_notes = ZZZ_KIN_BIOG_ADDR.c_notes, " + _
                     "ZZ_SCRATCH_KINNET.c_upstep = ZZZ_KIN_BIOG_ADDR.c_upstep, ZZ_SCRATCH_KINNET.c_dwnstep = ZZZ_K
IN_BIOG_ADDR.c_dwnstep, " + _
                     "ZZ_SCRATCH_KINNET.c_marstep = ZZZ_KIN_BIOG_ADDR.c_marstep, ZZ_SCRATCH_KINNET.c_colstep = ZZZ
_KIN_BIOG_ADDR.c_colstep, " + _
                     "ZZ_SCRATCH_KINNET.c_distance = ZZZ_KIN_BIOG_ADDR.c_distance "
     'cmdSQL.CommandText = tQueryStr
     'cmdSQL.Execute tRecDelete
     '
     '
     ' the final step is to add the index year descriptive information
     '
     'cmdSQL.CommandText = "UPDATE (ZZ_SCRATCH_KINNET INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_KINNET.c_person_id =
ZZZ_BIOG_MAIN.c_personid) " + _
         "INNER JOIN ZZZ_BIOG_MAIN AS ZZZ_BIOG_MAIN_1 ON ZZ_SCRATCH_KINNET.c_kin_id = ZZZ_BIOG_MAIN_1.c_personid "
 + _
         "SET ZZ_SCRATCH_KINNET.c_index_year_type_code = [ZZZ_BIOG_MAIN].[c_index_year_type_code], " + _
             "ZZ_SCRATCH_KINNET.c_index_year_type_desc = [ZZZ_BIOG_MAIN].[c_index_year_type_desc], " + _
             "ZZ_SCRATCH_KINNET.c_index_year_type_hz = [ZZZ_BIOG_MAIN].[c_index_year_type_hz], " + _
             "ZZ_SCRATCH_KINNET.c_kin_index_year_type_code = [ZZZ_BIOG_MAIN_1].[c_index_year_type_code], " + _
             "ZZ_SCRATCH_KINNET.c_kin_index_year_type_desc = [ZZZ_BIOG_MAIN_1].[c_index_year_type_desc], " + _
             "ZZ_SCRATCH_KINNET.c_kin_index_year_type_hz = [ZZZ_BIOG_MAIN_1].[c_index_year_type_hz]"
     'cmdSQL.Execute tRecDelete
     '
     ' copy to the ego-relative kinship table
     '
     ' Before copying we need to clean up the data
     '
     ' There is a bug in the algorithm that creates the occasional null value in c_kinrel_total. To debug, for t
he moment plug the hole
     '
     'MsgBox "Patching NULL bug"
     cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST SET ZZ_KIN_LIST.c_kinrel_total_simplified = '[Program Error]' WHERE
(((ZZ_KIN_LIST.c_kinrel_total_simplified) Is Null))"
     cmdSQL.Execute tRecDelete
     '
     'MsgBox "Inserting ego-relative"
     tQueryStr = "INSERT INTO ZZ_KIN_LIST_TMP ( c_personid, c_kin_id, c_kinrel, c_kinrel_total, c_kinrel_total_sim
plified, c_up, c_down, c_col, c_mar, " + _
             "c_notes, c_kin_code, c_source, c_source_text, c_source_text_chn ) " + _
         "SELECT DISTINCT ZZ_KIN_LIST.c_personid_root, ZZ_KIN_LIST.c_kin_id, ZZ_KIN_LIST.c_kinrel_total_raw, ZZ_KI
N_LIST.c_kinrel_total, " + _
             "ZZ_KIN_LIST.c_kinrel_total_simplified, ZZ_KIN_LIST.c_up_total, ZZ_KIN_LIST.c_down_total, ZZ_KIN_LIST
.c_col_total, ZZ_KIN_LIST.c_mar_total, " + _
             "ZZ_KIN_LIST.c_notes, 0 AS c_kin_code, ZZ_KIN_LIST.c_source, ZZ_KIN_LIST.c_source_text, ZZ_KIN_LIST.c
_source_text_chn " + _
         "FROM ZZ_KIN_LIST"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDelete

    '   first just get the string length

    cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP SET ZZ_KIN_LIST_TMP.c_kinrel_len = Len([ZZ_KIN_LIST_TMP].[c_kinr
el_total_simplified])"
    cmdSQL.Execute tRecDelete

    '   delete the longer strings (this may solve most of the problems)

    cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP INNER JOIN ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 ON ZZ_KIN_LIST_T
MP.c_kin_id = ZZ_KIN_LIST_TMP_1.c_kin_id " + _
        "SET ZZ_KIN_LIST_TMP_1.c_delete = 1 " + _
        "WHERE (([ZZ_KIN_LIST_TMP_1].[c_kinrel_len]>[ZZ_KIN_LIST_TMP].[c_kinrel_len]))"
    cmdSQL.Execute tRecDelete

    cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE ZZ_KIN_LIST_TMP.c_delete = 1"
    cmdSQL.Execute tRecDelete
    '
    ' the next version uses the string-compare function because sometimes the strings are of the same length
    '
    cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 INNER JOIN " + _
        "ZZ_KIN_LIST_TMP ON (ZZ_KIN_LIST_TMP_1.c_kin_id = ZZ_KIN_LIST_TMP.c_kin_id) " + _
        "SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
        "WHERE (((StrComp([ZZ_KIN_LIST_TMP].[c_kinrel_total_simplified], [ZZ_KIN_LIST_TMP_1].[c_kinrel_total_simp
lified])) > 0))"
    cmdSQL.Execute tRecDelete

    cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
    cmdSQL.Execute tRecDelete
    '
    ' the last version uses the total kinship path: take the shortest value
    '
    cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 INNER JOIN " + _
        "ZZ_KIN_LIST_TMP ON (ZZ_KIN_LIST_TMP_1.c_kin_id = ZZ_KIN_LIST_TMP.c_kin_id) " + _
        "SET ZZ_KIN_LIST_TMP.c_delete = 1 " + _
        "WHERE (([ZZ_KIN_LIST_TMP].[c_down] + [ZZ_KIN_LIST_TMP].[c_col] + [ZZ_KIN_LIST_TMP].[c_mar] + [ZZ_KIN_LIS
T_TMP].[c_up]>" + _
                "[ZZ_KIN_LIST_TMP_1].[c_down]+[ZZ_KIN_LIST_TMP_1].[c_col]+[ZZ_KIN_LIST_TMP_1].[c_mar]+[ZZ_KIN_LIS
T_TMP_1].[c_up]))"
    cmdSQL.Execute tRecDelete

    cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
    cmdSQL.Execute tRecDelete
    '
    ' one last clean-up: remove results that are the same but takes a longer path to get there
    '
    cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP INNER JOIN ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 " + _
        "ON (ZZ_KIN_LIST_TMP.c_kinrel = ZZ_KIN_LIST_TMP_1.c_kinrel) AND (ZZ_KIN_LIST_TMP.c_personid = ZZ_KIN_LIST
_TMP_1.c_personid) AND " + _
           "(ZZ_KIN_LIST_TMP.c_kin_id = ZZ_KIN_LIST_TMP_1.c_kin_id) " + _
        "SET ZZ_KIN_LIST_TMP_1.c_delete = 1 " + _
        "WHERE ((Len([ZZ_KIN_LIST_TMP].[c_notes])<Len([ZZ_KIN_LIST_TMP_1].[c_notes])))"
    cmdSQL.Execute tRecDelete
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
    cmdSQL.Execute tRecDelete
    '
    'MsgBox "Last step"
    cmdSQL.CommandText = "UPDATE ZZ_KIN_LIST_TMP INNER JOIN ZZ_KIN_LIST_TMP AS ZZ_KIN_LIST_TMP_1 " + _
        "ON (ZZ_KIN_LIST_TMP.c_kinrel = ZZ_KIN_LIST_TMP_1.c_kinrel) AND (ZZ_KIN_LIST_TMP.c_personid = ZZ_KIN_LIST
_TMP_1.c_personid) AND " + _
           "(ZZ_KIN_LIST_TMP.c_kin_id = ZZ_KIN_LIST_TMP_1.c_kin_id) " + _
        "SET ZZ_KIN_LIST_TMP_1.c_delete = 1 " + _
        "WHERE ('X'+[ZZ_KIN_LIST_TMP].[c_notes] > 'X'+[ZZ_KIN_LIST_TMP_1].[c_notes])"
    cmdSQL.Execute tRecDelete
    '
    cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP WHERE c_delete = 1"
    cmdSQL.Execute tRecDelete
    '
    '
    tQueryStr = "INSERT INTO ZZ_SCRATCH_KIN ( c_person_id, c_kin_id, c_kin_rel, c_kin_rel_total, c_kin_rel_0, c_u
p, c_down, c_collateral, c_marriage, " + _
                "c_notes, c_source, c_source_text, c_source_text_chn ) " + _
        "SELECT DISTINCT ZZ_KIN_LIST_TMP.c_personid, ZZ_KIN_LIST_TMP.c_kin_id, ZZ_KIN_LIST_TMP.c_kinrel, ZZ_KIN_L
IST_TMP.c_kinrel_total, " + _
            "ZZ_KIN_LIST_TMP.c_kinrel_total_simplified, ZZ_KIN_LIST_TMP.c_up, ZZ_KIN_LIST_TMP.c_down, ZZ_KIN_LIST
_TMP.c_col, ZZ_KIN_LIST_TMP.c_mar, " + _
            "ZZ_KIN_LIST_TMP.c_notes, ZZ_KIN_LIST_TMP.c_source, ZZ_KIN_LIST_TMP.c_source_text, ZZ_KIN_LIST_TMP.c_
source_text_chn " + _
        "FROM ZZ_KIN_LIST_TMP"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDelete
    '
    ' add back in the kin not captures by the 2-2-1-1 parameters before updating the information
    '
    cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_KIN ( c_person_id, c_kin_id, c_kin_code, c_kin_rel, c_kin_rel_0,
 c_kin_rel_total, c_up, c_down, " + _
            "c_marriage, c_collateral ) " + _
        "SELECT ZZZ_KIN_BIOG_ADDR.c_personid, ZZZ_KIN_BIOG_ADDR.c_node_id, ZZZ_KIN_BIOG_ADDR.c_link_code, ZZZ_KIN
_BIOG_ADDR.c_link_chn, " + _
            "ZZZ_KIN_BIOG_ADDR.c_link_desc AS c_kel_rel_0, ZZZ_KIN_BIOG_ADDR.c_link_desc, ZZZ_KIN_BIOG_ADDR.c_ups
tep, ZZZ_KIN_BIOG_ADDR.c_dwnstep, " + _
            "ZZZ_KIN_BIOG_ADDR.c_marstep, ZZZ_KIN_BIOG_ADDR.c_colstep " + _
        "FROM ZZZ_KIN_BIOG_ADDR " + _
        "WHERE (ZZZ_KIN_BIOG_ADDR.c_personid = " + Str(t_personid) + " AND (ZZZ_KIN_BIOG_ADDR.c_upstep > 2 " + _
            "OR ZZZ_KIN_BIOG_ADDR.c_dwnstep > 2 OR ZZZ_KIN_BIOG_ADDR.c_marstep > 1 OR ZZZ_KIN_BIOG_ADDR.c_colstep
 > 1 ) )"
    cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_KIN ( c_person_id, c_kin_id, c_kin_code, c_kin_rel, c_kin_rel_0,
 c_kin_rel_total, c_up, " + _
             "c_down, c_marriage, c_collateral, c_source, c_pages, c_notes, c_source_text_chn, c_source_text ) " +
 _
         "SELECT ZZZ_KIN_BIOG_ADDR.c_personid, ZZZ_KIN_BIOG_ADDR.c_node_id, ZZZ_KIN_BIOG_ADDR.c_link_code, ZZZ_KIN
_BIOG_ADDR.c_link_chn, " + _
             "ZZZ_KIN_BIOG_ADDR.c_link_desc AS c_kel_rel_0, ZZZ_KIN_BIOG_ADDR.c_link_desc, ZZZ_KIN_BIOG_ADDR.c_ups
tep, ZZZ_KIN_BIOG_ADDR.c_dwnstep, " + _
             "ZZZ_KIN_BIOG_ADDR.c_marstep, ZZZ_KIN_BIOG_ADDR.c_colstep, ZZZ_KIN_BIOG_ADDR.c_source, ZZZ_KIN_BIOG_A
DDR.c_pages, ZZZ_KIN_BIOG_ADDR.c_notes, " + _
             "ZZZ_KIN_BIOG_ADDR.c_title_chn, ZZZ_KIN_BIOG_ADDR.c_title " + _
         "FROM ZZZ_KIN_BIOG_ADDR " + _
         "WHERE (((ZZZ_KIN_BIOG_ADDR.c_personid)= " + Str(t_personid) + " ) AND ((ZZZ_KIN_BIOG_ADDR.c_upstep)>2))
OR " + _
             "(((ZZZ_KIN_BIOG_ADDR.c_personid)= " + Str(t_personid) + " ) AND ((ZZZ_KIN_BIOG_ADDR.c_dwnstep)>2)) O
R " + _
             "(((ZZZ_KIN_BIOG_ADDR.c_personid)= " + Str(t_personid) + " ) AND ((ZZZ_KIN_BIOG_ADDR.c_marstep)>1)) O
R " + _
             "(((ZZZ_KIN_BIOG_ADDR.c_personid)= " + Str(t_personid) + " ) AND ((ZZZ_KIN_BIOG_ADDR.c_colstep)>1));"

    cmdSQL.Execute tRecDelete

     tQueryStr = "UPDATE (ZZZ_BIOG_MAIN INNER JOIN ZZ_SCRATCH_KIN ON ZZZ_BIOG_MAIN.c_personid = ZZ_SCRATCH_KIN.c_p
erson_id) " + _
         "INNER JOIN ZZZ_BIOG_MAIN AS ZZZ_BIOG_MAIN_1 ON ZZ_SCRATCH_KIN.c_kin_id = ZZZ_BIOG_MAIN_1.c_personid " +
_
         "SET ZZ_SCRATCH_KIN.c_kin_name = [ZZZ_BIOG_MAIN_1].[c_name], ZZ_SCRATCH_KIN.c_kin_chn = [ZZZ_BIOG_MAIN_1]
.[c_name_chn], " + _
             "ZZ_SCRATCH_KIN.c_kin_index_year = [ZZZ_BIOG_MAIN_1].[c_index_year], ZZ_SCRATCH_KIN.c_kin_female = [Z
ZZ_BIOG_MAIN_1].[c_female], " + _
             "ZZ_SCRATCH_KIN.c_kin_sex = iif([ZZZ_BIOG_MAIN_1].[c_female],'F','M'), ZZ_SCRATCH_KIN.c_kin_code = 0,
  " + _
             "ZZ_SCRATCH_KIN.c_kin_addr_id = [ZZZ_BIOG_MAIN_1].[c_index_addr_id], ZZ_SCRATCH_KIN.c_kin_addr_name =
  [ZZZ_BIOG_MAIN_1].[c_index_addr_name], " + _
             "ZZ_SCRATCH_KIN.c_kin_addr_chn = [ZZZ_BIOG_MAIN_1].[c_index_addr_chn], ZZ_SCRATCH_KIN.c_kin_addr_type
  = [ZZZ_BIOG_MAIN_1].[c_index_addr_type_code], " + _
             "ZZ_SCRATCH_KIN.c_kin_addr_desc = [ZZZ_BIOG_MAIN_1].[c_index_addr_type_desc], " + _
             "ZZ_SCRATCH_KIN.c_kin_addr_desc_chn = [ZZZ_BIOG_MAIN_1].[c_index_addr_type_chn], " + _
             "ZZ_SCRATCH_KIN.kin_x_coord = [ZZZ_BIOG_MAIN_1].[x_coord], " + _
             "ZZ_SCRATCH_KIN.kin_y_coord = [ZZZ_BIOG_MAIN_1].[y_coord]"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDelete
    '
    ' get the index year descriptive data
    '
    cmdSQL.CommandText = "UPDATE (ZZ_SCRATCH_KIN INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_KIN.c_person_id = ZZZ_BIO
G_MAIN.c_personid) " + _
        "INNER JOIN ZZZ_BIOG_MAIN AS ZZZ_BIOG_MAIN_1 ON ZZ_SCRATCH_KIN.c_kin_id = ZZZ_BIOG_MAIN_1.c_personid " +
_
        "SET ZZ_SCRATCH_KIN.c_kin_index_year_type_code = [ZZZ_BIOG_MAIN_1].[c_index_year_type_code], " + _
            "ZZ_SCRATCH_KIN.c_kin_index_year_type_desc = [ZZZ_BIOG_MAIN_1].[c_index_year_type_desc], " + _
            "ZZ_SCRATCH_KIN.c_kin_index_year_type_hz = [ZZZ_BIOG_MAIN_1].[c_index_year_type_hz]"
    cmdSQL.Execute tRecDelete
    '
    ' update the dynasty information
    '
    cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_KIN INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_KIN.c_kin_id = ZZZ_BIOG_MA
IN.c_personid " + _
        "SET ZZ_SCRATCH_KIN.c_kin_dy = [ZZZ_BIOG_MAIN].[c_dy], " + _
            "ZZ_SCRATCH_KIN.c_kin_dynasty = [ZZZ_BIOG_MAIN].[c_dynasty], " + _
            "ZZ_SCRATCH_KIN.c_kin_dynasty_chn = [ZZZ_BIOG_MAIN].[c_dynasty_chn]"
    cmdSQL.Execute tRecDelete

Exit_getKinship:
    '
    Exit Sub

Err_getKinship:
    MsgBox Err.Description + tErrorStr
    Resume Exit_getKinship

    Return
End Sub

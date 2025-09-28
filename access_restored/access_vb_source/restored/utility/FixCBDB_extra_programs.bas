Public gDisplay As String
Option Compare Database

Sub add_kin_name()
    Dim rstKIN As ADODB.Recordset
    Dim rstBIOG As ADODB.Recordset
    Dim tID As Long

    Set rstKIN = New ADODB.Recordset
    Set rstBIOG = New ADODB.Recordset

    rstKIN.Open "kin_data", CurrentProject.Con
        adLockOptimistic

    rstBIOG.Open "BIOG_MAIN", CurrentProject.C
        adLockOptimistic

    With rstKIN
        .MoveFirst
        .Find ("c_personid = 32534")
        ' .MoveNext
        Do While Not .EOF
            '
            If .EOF Then
                Exit Do
            End If
            '
            tID = .Fields("c_kin_id")
            rstBIOG.MoveFirst
            rstBIOG.Find ("c_personid = " & St
            If Not rstBIOG.EOF Then
    Set rstAssoc = Nothing
    Set rstBIOG = Nothing
End Sub

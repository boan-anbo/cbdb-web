' Original module name: 表
' Extracted from lines 1-7341

è¡¨ - 1

Option Compare Database
' g stands for global
Public gRstPersonID As DAO.Recordset, gCurPersonBookmark As Variant
Public gRstPeople As DAO.Recordset, gRstAddresses As DAO.Recordset
Public gRstPeopleLookUp As DAO.Recordset, gRstBiogAddrType As DAO.Recordset
Public gRstEdge As DAO.Recordset, gRst As DAO.Recordset, gRstBiogADDR As DAO.Recordset
Public gRstAssocFilter As DAO.Recordset, gRstImportPeople As DAO.Recordset
Public gMaxNodeDist As Integer
Public gMaxFilterMilitary As Integer, gFilterMilitaryCount As Integer
Public gMaxFilterScholar As Integer, gFilterScholarCount As Integer
Public gMaxFilterTotal As Integer, gFilterTotalCount As Integer
Public gMaxFilterWritings As Integer, gFilterWritingsCount As Integer
Public gMaxFilterPolitics As Integer, gFilterPoliticsCount As Integer
Public gDisplayLanguage As String, gLabelsOK As Boolean, gImportPeople As Boolean, gImportPlaces As Boolean
Public gUsePersonID As Boolean, gUseADDRID As Boolean
Public gRstKin As DAO.Recordset, gRstNonKin As DAO.Recordset

Public gQuerySelectKin As String, gQuerySelectNonkin As String, gQueryIndexYear As String
Public gQuerySelectKinADDR As String, gQuerySelectNonkinADDR As String
Public gQuerySelectNonkinADDRFiltered As String, gQuerySelectNonkinFiltered As String
Public gQueryKindist As String, gQueryAssocFilter As String
Public gQueryBaseKin As String, gQueryBase As String, gQueryBaseNonkin As String
Public gQueryStr As String, gLoopMax As Integer, gUseFilter As Integer
Public gQueryKinAddrFilter As String, gQueryNonKinAddrFilter As String
Public gFromDynasty As Integer, gToDynasty As Integer, gUseIndexYears As Boolean, gUseDynasties As Boolean, _
        gFromDynastyBegin As Integer, gFromDynastyEnd As Integer, gToDynastyBegin As Integer, gToDynastyEnd As Integer


Private Sub ChkFamily_Click()
    ' -1 (true) and 0 (false)

    If ChkFamily.Value = -1 Then
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterTotalCount = gFilterTotalCount - 1
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkFinance_Click()
    ' -1 (true) and 0 (false)

    If ChkFinance.Value = -1 Then
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterTotalCount = gFilterTotalCount - 1
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkFriendship_Click()
    ' -1 (true) and 0 (false)

    If ChkFriendship.Value = -1 Then
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterTotalCount = gFilterTotalCount - 1
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkIndexYear_Click()
    TxtFrom.Enabled = ChkIndexYear.Value
    TxtTo.Enabled = ChkIndexYear.Value
è¡¨ - 2

End Sub


Private Sub ChkKin_Click()

    If ChkKin.Value Then
         Me.ChkKinshipParam.Enabled = True
         TxtMaxUp.Enabled = True
         TxtMaxDwn.Enabled = True
         TxtMaxCol.Enabled = True
         TxtMaxMar.Enabled = True
    Else
         Me.ChkKinshipParam.Enabled = False
         TxtMaxUp.Enabled = False
         TxtMaxDwn.Enabled = False
         TxtMaxCol.Enabled = False
         TxtMaxMar.Enabled = False
    End If
    Call CheckRunCriteria
End Sub

Private Sub ChkMedicine_Click()
    ' -1 (true) and 0 (false)

    If ChkMedicine.Value = -1 Then
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterTotalCount = gFilterTotalCount - 1
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkMilitaryAll_Click()
    Dim tDelta As Integer
    ' -1 (true) and 0 (false)

    tDelta = gMaxFilterMilitary - gFilterMilitaryCount
    If ChkMilitaryAll.Value = -1 Then
        gFilterMilitaryCount = gMaxFilterMilitary
        gFilterTotalCount = gFilterTotalCount + tDelta

           ChkMilitaryOppose.Value = -1
           ChkMilitarySupport.Value = -1

           If gFilterTotalCount = gMaxFilterTotal Then
               ChkSelectAll.Value = -1
           End If
    Else
           gFilterTotalCount = gFilterTotalCount - gFilterMilitaryCount
           gFilterMilitaryCount = 0

           ChkMilitaryOppose.Value = 0
           ChkMilitarySupport.Value = 0

        ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkMilitaryOppose_Click()
    ' -1 (true) and 0 (false)

    If ChkMilitaryOppose.Value = -1 Then
         gFilterMilitaryCount = gFilterMilitaryCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterMilitaryCount = gMaxFilterMilitary Then
             ChkMilitaryAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterMilitaryCount = gFilterMilitaryCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
è¡¨ - 3

        ChkMilitaryAll.Value = 0
        ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkMilitarySupport_Click()
    ' -1 (true) and 0 (false)

    If ChkMilitarySupport.Value = -1 Then
         gFilterMilitaryCount = gFilterMilitaryCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterMilitaryCount = gMaxFilterMilitary Then
             ChkMilitaryAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterMilitaryCount = gFilterMilitaryCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkMilitaryAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkNonKin_Click()
    If ChkNonKin.Value = -1 Then

           ChkSelectAll.Enabled = True

           ChkMilitaryAll.Enabled = True
           ChkMilitaryOppose.Enabled = True
           ChkMilitarySupport.Enabled = True

           ChkPoliticsAll.Enabled = True
           ChkPolEqual.Enabled = True
           ChkPolOppose.Enabled = True
           ChkPolSponsor.Enabled = True
           ChkPolSub.Enabled = True
           ChkPolSup.Enabled = True
           ChkPolSupport.Enabled = True

           ChkScholarshipAll.Enabled = True
           ChkSchTeacher.Enabled = True
           ChkSchAffiliation.Enabled = True
           ChkSchAttack.Enabled = True
           ChkSchLitArt.Enabled = True
           ChkSchMember.Enabled = True
           ChkSchPatron.Enabled = True
           ChkSchTopic.Enabled = True

           ChkWritingsAll.Enabled = True
           ChkWriBiog.Enabled = True
           ChkWriCommem.Enabled = True
           ChkWriEpitaph.Enabled = True
           ChkWriExplain.Enabled = True
           ChkWriLetters.Enabled = True
           ChkWriMottos.Enabled = True
           ChkWriOccasion.Enabled = True
           ChkWriPreface.Enabled = True
           ChkWriRitual.Enabled = True

           ChkFamily.Enabled = True
           ChkFinance.Enabled = True
           ChkFriendship.Enabled = True
           ChkMedicine.Enabled = True
           ChkReligion.Enabled = True

    Else
           ChkSelectAll.Enabled = False

           ChkMilitaryAll.Enabled = False
           ChkMilitaryOppose.Enabled = False
           ChkMilitarySupport.Enabled = False

           ChkPoliticsAll.Enabled = False
è¡¨ - 4

           ChkPolEqual.Enabled = False
           ChkPolOppose.Enabled = False
           ChkPolSponsor.Enabled = False
           ChkPolSub.Enabled = False
           ChkPolSup.Enabled = False
           ChkPolSupport.Enabled = False

           ChkScholarshipAll.Enabled = False
           ChkSchTeacher.Enabled = False
           ChkSchAffiliation.Enabled = False
           ChkSchAttack.Enabled = False
           ChkSchLitArt.Enabled = False
           ChkSchMember.Enabled = False
           ChkSchPatron.Enabled = False
           ChkSchTopic.Enabled = False

           ChkWritingsAll.Enabled = False
           ChkWriBiog.Enabled = False
           ChkWriCommem.Enabled = False
           ChkWriEpitaph.Enabled = False
           ChkWriExplain.Enabled = False
           ChkWriLetters.Enabled = False
           ChkWriMottos.Enabled = False
           ChkWriOccasion.Enabled = False
           ChkWriPreface.Enabled = False
           ChkWriRitual.Enabled = False

           ChkFamily.Enabled = False
           ChkFinance.Enabled = False
           ChkFriendship.Enabled = False
           ChkMedicine.Enabled = False
           ChkReligion.Enabled = False

    End If
    Call CheckRunCriteria

End Sub

Private Sub chkPolEqual_Click()
    ' -1 (true) and 0 (false)

    If ChkPolEqual.Value = -1 Then
         gFilterPoliticsCount = gFilterPoliticsCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterPoliticsCount = gMaxFilterPolitics Then
             ChkPoliticsAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterPoliticsCount = gFilterPoliticsCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkPoliticsAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkPoliticsAll_Click()
    Dim tDelta As Integer
    ' -1 (true) and 0 (false)

    tDelta = gMaxFilterPolitics - gFilterPoliticsCount
    If ChkPoliticsAll.Value = -1 Then
        gFilterPoliticsCount = gMaxFilterPolitics
        gFilterTotalCount = gFilterTotalCount + tDelta

           ChkPolEqual.Value = -1
           ChkPolOppose.Value = -1
           ChkPolSponsor.Value = -1
           ChkPolSub.Value = -1
           ChkPolSup.Value = -1
           ChkPolSupport.Value = -1

           If gFilterTotalCount = gMaxFilterTotal Then
               ChkSelectAll.Value = -1
           End If
    Else
è¡¨ - 5

          gFilterTotalCount = gFilterTotalCount - gFilterPoliticsCount
          gFilterPoliticsCount = 0

          ChkPolEqual.Value = 0
          ChkPolOppose.Value = 0
          ChkPolSponsor.Value = 0
          ChkPolSub.Value = 0
          ChkPolSup.Value = 0
          ChkPolSupport.Value = 0

        ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkPolOppose_Click()
    ' -1 (true) and 0 (false)

    If ChkPolOppose.Value = -1 Then
         gFilterPoliticsCount = gFilterPoliticsCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterPoliticsCount = gMaxFilterPolitics Then
             ChkPoliticsAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterPoliticsCount = gFilterPoliticsCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkPoliticsAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkPolSponsor_Click()
    ' -1 (true) and 0 (false)

    If ChkPolSponsor.Value = -1 Then
         gFilterPoliticsCount = gFilterPoliticsCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterPoliticsCount = gMaxFilterPolitics Then
             ChkPoliticsAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterPoliticsCount = gFilterPoliticsCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkPoliticsAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkPolSub_Click()
    ' -1 (true) and 0 (false)

    If ChkPolSub.Value = -1 Then
         gFilterPoliticsCount = gFilterPoliticsCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterPoliticsCount = gMaxFilterPolitics Then
             ChkPoliticsAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterPoliticsCount = gFilterPoliticsCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkPoliticsAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria
è¡¨ - 6

End Sub

Private Sub ChkPolSup_Click()
    ' -1 (true) and 0 (false)

    If ChkPolSup.Value = -1 Then
         gFilterPoliticsCount = gFilterPoliticsCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterPoliticsCount = gMaxFilterPolitics Then
             ChkPoliticsAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterPoliticsCount = gFilterPoliticsCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkPoliticsAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkPolSupport_Click()
    ' -1 (true) and 0 (false)

    If ChkPolSupport.Value = -1 Then
         gFilterPoliticsCount = gFilterPoliticsCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterPoliticsCount = gMaxFilterPolitics Then
             ChkPoliticsAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterPoliticsCount = gFilterPoliticsCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkPoliticsAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkReligion_Click()
    ' -1 (true) and 0 (false)

    If ChkReligion.Value = -1 Then
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterTotalCount = gFilterTotalCount - 1
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkSchAffiliation_Click()

    '     -1 (true) and 0 (false)

    If ChkSchAffiliation.Value = -1 Then
         gFilterScholarCount = gFilterScholarCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterScholarCount = gMaxFilterScholar Then
             ChkScholarshipAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterScholarCount = gFilterScholarCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkScholarshipAll.Value = 0
         ChkSelectAll.Value = 0
è¡¨ - 7

    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkSchAttack_Click()

    '     -1 (true) and 0 (false)

    If ChkSchAttack.Value = -1 Then
         gFilterScholarCount = gFilterScholarCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterScholarCount = gMaxFilterScholar Then
             ChkScholarshipAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterScholarCount = gFilterScholarCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkScholarshipAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkSchLitArt_Click()

    '     -1 (true) and 0 (false)

    If ChkSchLitArt.Value = -1 Then
         gFilterScholarCount = gFilterScholarCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterScholarCount = gMaxFilterScholar Then
             ChkScholarshipAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterScholarCount = gFilterScholarCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkScholarshipAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkSchMember_Click()

    '     -1 (true) and 0 (false)

    If ChkSchMember.Value = -1 Then
         gFilterScholarCount = gFilterScholarCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterScholarCount = gMaxFilterScholar Then
             ChkScholarshipAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterScholarCount = gFilterScholarCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkScholarshipAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkScholarshipAll_Click()
    Dim tDelta As Integer
    ' -1 (true) and 0 (false)

    If ChkScholarshipAll.Value = -1 Then
        tDelta = gMaxFilterScholar - gFilterScholarCount
è¡¨ - 8

           gFilterScholarCount = gMaxFilterScholar
           gFilterTotalCount = gFilterTotalCount + tDelta

           ChkSchTeacher.Value = -1
           ChkSchAffiliation.Value = -1
           ChkSchAttack.Value = -1
           ChkSchLitArt.Value = -1
           ChkSchMember.Value = -1
           ChkSchPatron.Value = -1
           ChkSchTopic.Value = -1

           If gFilterTotalCount = gMaxFilterTotal Then
               ChkSelectAll.Value = -1
           End If
    Else
           gFilterTotalCount = gFilterTotalCount - gFilterScholarCount
           gFilterScholarCount = 0

           ChkSchTeacher.Value = 0
           ChkSchAffiliation.Value = 0
           ChkSchAttack.Value = 0
           ChkSchLitArt.Value = 0
           ChkSchMember.Value = 0
           ChkSchPatron.Value = 0
           ChkSchTopic.Value = 0

        ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkSchPatron_Click()

    '     -1 (true) and 0 (false)

    If ChkSchPatron.Value = -1 Then
         gFilterScholarCount = gFilterScholarCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterScholarCount = gMaxFilterScholar Then
             ChkScholarshipAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterScholarCount = gFilterScholarCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkScholarshipAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkSchTeacher_Click()

    '     -1 (true) and 0 (false)

    If ChkSchTeacher.Value = -1 Then
         gFilterScholarCount = gFilterScholarCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterScholarCount = gMaxFilterScholar Then
             ChkScholarshipAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterScholarCount = gFilterScholarCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkScholarshipAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria
End Sub

Private Sub ChkSchTopic_Click()

    '     -1 (true) and 0 (false)
è¡¨ - 9


    If ChkSchTopic.Value = -1 Then
         gFilterScholarCount = gFilterScholarCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterScholarCount = gMaxFilterScholar Then
             ChkScholarshipAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterScholarCount = gFilterScholarCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkScholarshipAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkSelectAll_Click()
    ' -1 (true) and 0 (false)

    If ChkSelectAll.Value = -1 Then
        gFilterTotalCount = gMaxFilterTotal
        gFilterPoliticsCount = gMaxFilterPolitics
        gFilterScholarCount = gMaxFilterScholar
        gFilterWritingsCount = gMaxFilterWritings
        gFilterMilitaryCount = gMaxFilterMilitary

           ChkMilitaryAll.Value = -1
           ChkMilitaryOppose.Value = -1
           ChkMilitarySupport.Value = -1

           ChkPoliticsAll.Value = -1
           ChkPolEqual.Value = -1
           ChkPolOppose.Value = -1
           ChkPolSponsor.Value = -1
           ChkPolSub.Value = -1
           ChkPolSup.Value = -1
           ChkPolSupport.Value = -1

           ChkScholarshipAll.Value = -1
           ChkSchTeacher.Value = -1
           ChkSchAffiliation.Value = -1
           ChkSchAttack.Value = -1
           ChkSchLitArt.Value = -1
           ChkSchMember.Value = -1
           ChkSchPatron.Value = -1
           ChkSchTopic.Value = -1

           ChkWritingsAll.Value = -1
           ChkWriBiog.Value = -1
           ChkWriCommem.Value = -1
           ChkWriEpitaph.Value = -1
           ChkWriExplain.Value = -1
           ChkWriLetters.Value = -1
           ChkWriMottos.Value = -1
           ChkWriOccasion.Value = -1
           ChkWriPreface.Value = -1
           ChkWriRitual.Value = -1

           ChkFamily.Value = -1
           ChkFinance.Value = -1
           ChkFriendship.Value = -1
           ChkMedicine.Value = -1
           ChkReligion.Value = -1

    Else
           gFilterTotalCount = 0
           gFilterWritingsCount = 0
           gFilterScholarCount = 0
           gFilterPoliticsCount = 0
           gFilterMilitaryCount = 0

           'ChkNonKin.Value = 0

           ChkMilitaryAll.Value = 0
           ChkMilitaryOppose.Value = 0
           ChkMilitarySupport.Value = 0
è¡¨ - 10


           ChkPoliticsAll.Value = 0
           ChkPolEqual.Value = 0
           ChkPolOppose.Value = 0
           ChkPolSponsor.Value = 0
           ChkPolSub.Value = 0
           ChkPolSup.Value = 0
           ChkPolSupport.Value = 0

           ChkScholarshipAll.Value = 0
           ChkSchTeacher.Value = 0
           ChkSchAffiliation.Value = 0
           ChkSchAttack.Value = 0
           ChkSchLitArt.Value = 0
           ChkSchMember.Value = 0
           ChkSchPatron.Value = 0
           ChkSchTopic.Value = 0

           ChkWritingsAll.Value = 0
           ChkWriBiog.Value = 0
           ChkWriCommem.Value = 0
           ChkWriEpitaph.Value = 0
           ChkWriExplain.Value = 0
           ChkWriLetters.Value = 0
           ChkWriMottos.Value = 0
           ChkWriOccasion.Value = 0
           ChkWriPreface.Value = 0
           ChkWriRitual.Value = 0

           ChkFamily.Value = 0
           ChkFinance.Value = 0
           ChkFriendship.Value = 0
           ChkMedicine.Value = 0
           ChkReligion.Value = 0

    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkWriBiog_Click()
    ' -1 (true) and 0 (false)

    If ChkWriBiog.Value = -1 Then
         gFilterWritingsCount = gFilterWritingsCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterWritingsCount = gMaxFilterWritings Then
             ChkWritingsAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterWritingsCount = gFilterWritingsCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkWritingsAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkWriCommem_Click()
    ' -1 (true) and 0 (false)

    If ChkWriCommem.Value = -1 Then
         gFilterWritingsCount = gFilterWritingsCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterWritingsCount = gMaxFilterWritings Then
             ChkWritingsAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterWritingsCount = gFilterWritingsCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkWritingsAll.Value = 0
         ChkSelectAll.Value = 0
    End If
è¡¨ - 11

    Call CheckRunCriteria

End Sub

Private Sub ChkWriEpitaph_Click()
    ' -1 (true) and 0 (false)

    If ChkWriEpitaph.Value = -1 Then
         gFilterWritingsCount = gFilterWritingsCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterWritingsCount = gMaxFilterWritings Then
             ChkWritingsAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterWritingsCount = gFilterWritingsCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkWritingsAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkWriExplain_Click()
    ' -1 (true) and 0 (false)

    If ChkWriExplain.Value = -1 Then
         gFilterWritingsCount = gFilterWritingsCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterWritingsCount = gMaxFilterWritings Then
             ChkWritingsAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterWritingsCount = gFilterWritingsCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkWritingsAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkWriLetters_Click()
    ' -1 (true) and 0 (false)

    If ChkWriLetters.Value = -1 Then
         gFilterWritingsCount = gFilterWritingsCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterWritingsCount = gMaxFilterWritings Then
             ChkWritingsAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterWritingsCount = gFilterWritingsCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkWritingsAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkWriMottos_Click()
    ' -1 (true) and 0 (false)

    If ChkWriMottos.Value = -1 Then
        gFilterWritingsCount = gFilterWritingsCount + 1
        gFilterTotalCount = gFilterTotalCount + 1
        If gFilterWritingsCount = gMaxFilterWritings Then
            ChkWritingsAll.Value = -1
        End If
        If gFilterTotalCount = gMaxFilterTotal Then
è¡¨ - 12

               ChkSelectAll.Value = -1
           End If
    Else
        gFilterWritingsCount = gFilterWritingsCount - 1
        gFilterTotalCount = gFilterTotalCount - 1
        ChkWritingsAll.Value = 0
        ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkWriOccasion_Click()
    ' -1 (true) and 0 (false)

    If ChkWriOccasion.Value = -1 Then
         gFilterWritingsCount = gFilterWritingsCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterWritingsCount = gMaxFilterWritings Then
             ChkWritingsAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterWritingsCount = gFilterWritingsCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkWritingsAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkWriPreface_Click()
    ' -1 (true) and 0 (false)

    If ChkWriPreface.Value = -1 Then
         gFilterWritingsCount = gFilterWritingsCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterWritingsCount = gMaxFilterWritings Then
             ChkWritingsAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterWritingsCount = gFilterWritingsCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkWritingsAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkWriRitual_Click()
    ' -1 (true) and 0 (false)

    If ChkWriRitual.Value = -1 Then
         gFilterWritingsCount = gFilterWritingsCount + 1
         gFilterTotalCount = gFilterTotalCount + 1
         If gFilterWritingsCount = gMaxFilterWritings Then
             ChkWritingsAll.Value = -1
         End If
         If gFilterTotalCount = gMaxFilterTotal Then
             ChkSelectAll.Value = -1
         End If
    Else
         gFilterWritingsCount = gFilterWritingsCount - 1
         gFilterTotalCount = gFilterTotalCount - 1
         ChkWritingsAll.Value = 0
         ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub ChkWritingsAll_Click()
    Dim tDelta As Integer
è¡¨ - 13

    '     -1 (true) and 0 (false)

    If ChkWritingsAll.Value = -1 Then
        tDelta = gMaxFilterWritings - gFilterWritingsCount
        gFilterWritingsCount = gMaxFilterWritings
        gFilterTotalCount = gFilterTotalCount + tDelta

           ChkWriBiog.Value = -1
           ChkWriCommem.Value = -1
           ChkWriEpitaph.Value = -1
           ChkWriExplain.Value = -1
           ChkWriLetters.Value = -1
           ChkWriMottos.Value = -1
           ChkWriOccasion.Value = -1
           ChkWriPreface.Value = -1
           ChkWriRitual.Value = -1

           If gFilterTotalCount = gMaxFilterTotal Then
               ChkSelectAll.Value = -1
           End If
    Else
           gFilterTotalCount = gFilterTotalCount - gFilterWritingsCount
           gFilterWritingsCount = 0

           ChkWriBiog.Value = 0
           ChkWriCommem.Value = 0
           ChkWriEpitaph.Value = 0
           ChkWriExplain.Value = 0
           ChkWriLetters.Value = 0
           ChkWriMottos.Value = 0
           ChkWriOccasion.Value = 0
           ChkWriPreface.Value = 0
           ChkWriRitual.Value = 0

        ChkSelectAll.Value = 0
    End If
    Call CheckRunCriteria

End Sub

Private Sub CmdAllDynasties_Click()
    gFromDynasty = -2
    gToDynasty = -2
    TxtFromDynasty.Value = ""
    TxtFromDynastyPY.Value = "All"
    TxtToDynasty.Value = ""
    TxtToDynastyPY.Value = "All"

End Sub

Private Sub CmdAllPeople_Click()
On Error GoTo Err_CmdAllPeople_Click

    TxtPersonID.Value = -1
    TxtNameChn.Value = ""
    TxtName.Value = ""
    gUsePersonID = False
    CmdAllPeople.Enabled = False
    'CmdRerun.Enabled = False
    Call CheckRunCriteria

Exit_CmdAllPeople_Click:
    Exit Sub

Err_CmdAllPeople_Click:
    MsgBox Err.Description
    Resume Exit_CmdAllPeople_Click

End Sub

Private Sub CmdAllPlaces_Click()
On Error GoTo Err_CmdAllPlaces_Click

    TxtAddrID.Value = -1

    TxtPlaceChn.Value = ""
    TxtPlace.Value = ""
    gUseADDRID = False
    ChkXYRef.Enabled = False
    ChkSubUnits.Enabled = False
è¡¨ - 14


    Me.ChkPlaceLimit.Enabled = False
    Call CheckRunCriteria

Exit_CmdAllPlaces_Click:
    Exit Sub

Err_CmdAllPlaces_Click:
    MsgBox Err.Description
    Resume Exit_CmdAllPlaces_Click

End Sub

Private Sub CmdClose_Click()
On Error GoTo Err_CmdClose_Click


    DoCmd.Close

Exit_CmdClose_Click:
    Exit Sub

Err_CmdClose_Click:
    MsgBox Err.Description
    Resume Exit_CmdClose_Click

End Sub

Private Sub CmdFantiDisplay_Click()
On Error GoTo Err_CmdFantiDisplay_Click
    If gDisplayLanguage = "T" Then
         gDisplayLanguage = "E"
    Else
         gDisplayLanguage = "T"
    End If

    Call changeDisplayLanguage

Exit_CmdFantiDisplay_Click:
    Exit Sub

Err_CmdFantiDisplay_Click:
    MsgBox Err.Description
    Resume Exit_CmdFantiDisplay_Click

End Sub

Private Sub CmdFromDynasty_Click()
    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strFromDynasty As String

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
                TxtFromDynasty.Value = ""
è¡¨ - 15

                   TxtFromDynastyPY.Value = ""
               End If
           End If
           '
           ' value is OK
           '
           If gFromDynasty > -1 Then
               Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty.SetFocus
               TxtFromDynastyPY.Value = Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty.Value

               Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty_chn.SetFocus
               TxtFromDynasty.Value = Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty_chn.Value
           End If

        DoCmd.Close acForm, stDocName
        '
        ' reset ToDynasty if necessary (-2 = all dynasties)
        '
        If gToDynasty = -2 Then
            gToDynasty = -1
            TxtToDynasty.Value = ""
            TxtToDynastyPY.Value = ""
        End If
        '
    End If


End Sub

Private Sub CmdGIS_Click()
On Error GoTo Err_CmdGIS_Click
    '
    ' If it is a KML file, call the routine and exit
    '
    If ChkKML.Value Then
        Call writeKML
        Exit Sub
    End If
    '
    ' This program will dump the results to a .gis file
    '
    If ZZ_SCRATCH_PEOPLE.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdGIS_Click
    End If
    '
    Dim tStream As ADODB.Stream
    Set tStream = New ADODB.Stream

    If GISFrame.Value = 1 Then
         tStream.Charset = "utf-8"
         tCodeStr = "UTF8"
    Else
         tStream.Charset = "gb2312"
         tCodeStr = "GB2312"
    End If
    tStream.Mode = adModeReadWrite
    tStream.Type = adTypeText
    tStream.Open
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant, tFemale As String
    Dim tRstNode As DAO.Recordset
    Dim tStr As String, tC As String, ti As Integer
    Dim tFileSystem, tGDF

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

    dlgSaveAs.InitialFileName = "network_gis_" + tCodeStr + ".tab"
    If dlgSaveAs.Show = -1 Then
        '
        tFileName = ""
        For Each tFN In dlgSaveAs.SelectedItems
            tFileName = tFN
            If Not tFileName = "" Then
                Exit For
            End If
è¡¨ - 16

           Next
           If tFileName = "" Then
                MsgBox "Bad file Name."
                GoTo Exit_CmdGIS_Click
           Else
                ' make sure the file name has a txt extension
                If Len(tFileName) < 5 Then
                    tFileName = tFileName + ".tab"
                ElseIf Not (LCase(Right(tFileName, 4)) = ".tab") Then
                    tFileName = tFileName + ".tab"
                End If
           End If
           '
           ' write the file
           '
           'Name,NameChn,Female,IndexYear,AddrName,AddrChn,X,Y,xy_count,NodeDist
           '
           ' process the table
           '
           Set tRstNode = ZZ_SCRATCH_PEOPLE.Form.Recordset
           tC = Chr(9) ' the tab
           '
           With tRstNode
                '
                ' write the header
                '
                tStr = "Name" + tC + "NameChn" + tC + "Female" + tC + "IndexYear" + tC
                tStr = tStr + "AddrName" + tC + "AddrChn" + tC + "X" + tC + "Y" + tC
                tStr = tStr + "xy_count" + tC + "NodeDist"
                tStream.WriteText tStr, adWriteLine
                .MoveFirst
                Do While Not .EOF
                    If !c_female = -1 Then
                         tFemale = "F"
                    Else
                         tFemale = "M"
                    End If
                    ' must guard against NULLs, even where there should not be any
                    '
                    If IsNull(!c_name) Then
                         tStr = "[Bad Data]" + tC
                    Else
                         tStr = !c_name + tC
                    End If

                   If IsNull(!c_name_chn) Then
                        tStr = tStr + "[Bad Data]" + tC
                   Else
                        If Trim(!c_name_chn) = "" Then
                             tStr = tStr + "[?]" + tC
                        Else
                             tStr = tStr + !c_name_chn + tC
                        End If
                   End If

                   tStr = tStr + tFemale + tC

                   If IsNull(!c_index_year) Then
                        tStr = tStr + "-2000" + tC
                   Else
                        tStr = tStr + Str(!c_index_year) + tC
                   End If

                   ' here guard against blanks as well
                   If IsNull(!c_addr_name) Then
                        tStr = tStr + "[?]" + tC
                   ElseIf Trim(!c_addr_name) = "" Then
                        tStr = tStr + "[?]" + tC
                   Else
                        tStr = tStr + !c_addr_name + tC
                   End If

                   If IsNull(!c_addr_chn) Then
                        tStr = tStr + "[?]" + tC
                   ElseIf Trim(!c_addr_chn) = "" Then
                        tStr = tStr + "[?]" + tC
                   Else
                        tStr = tStr + !c_addr_chn + tC
                   End If
è¡¨ - 17

                      If IsNull(!x_coord) Then
                           tStr = tStr + "0" + tC
                      Else
                           tStr = tStr + Str(!x_coord) + tC
                      End If

                      If IsNull(!y_coord) Then
                           tStr = tStr + "0" + tC
                      Else
                           tStr = tStr + Str(!y_coord) + tC
                      End If

                      If IsNull(!xy_count) Then
                           tStr = tStr + "0" + tC
                      Else
                           tStr = tStr + Str(!xy_count) + tC
                      End If

                      tStr = tStr + Str(!c_node_dist)

                      tStream.WriteText tStr, adWriteLine
                      .MoveNext
               Loop
           End With

           ' now make sure all the data is copied to tStream
           tStream.Flush
           ' and write the stream to the file
           tStream.SaveToFile tFileName, adSaveCreateOverWrite
           '
    Else
        'The user pressed Cancel.
    End If

    Set tRstNode = Nothing

    tStream.Close
    Set tStream = Nothing
    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdGIS_Click:
    Exit Sub

Err_CmdGIS_Click:
    MsgBox Err.Description
    Resume Exit_CmdGIS_Click

End Sub

Private Sub CmdGUESS_Click()
On Error GoTo Err_CmdGUESS_Click
    '
    ' This program will dump the results of the search to a .gdf file
    '
    ' for the moment I'll just describe the format of the .gdf file
    '
    ' nodedef> name, label, labelvisible, style, pinyin VARCHAR(50), nodedist INT
    '      name = str(c_person_id)
    '      label = c_name_chn
    '      style = 4 (text inside a rectangle)
    '      pinyin = c_name
    '      nodedist = c_node_dist INT
    '      indexyear = c_index_year INT
    '      sex = c_female > (F,M)
    '
    ' edgedef> node1, node2, label, labelvisible, edge_desc VARCHAR(50)
    '      node1 = str(c_person_id) for node1
    '      node2 = str(c_node_id) for node2
    '      label = c_link_chn
    '      edge_desc = c_link_desc
    '      edgetype= c_link_type (K,N)
    '
    ' the central question is whether to do distance optimizations
    '
    ' first see if there are any records to process
    '
    If ZZ_SOCIAL_NETWORK.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdGUESS_Click
è¡¨ - 18

    End If
    '
    If ZZ_SCRATCH_PEOPLE.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdGUESS_Click
    End If
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tRstNode As DAO.Recordset
    Dim tRstEdge As DAO.Recordset
    Dim tStr As String, tC As String, ti As Integer
    'Dim tFileSystem, tGDF

    Dim tStream As ADODB.Stream, tCodeStr As String
    Set tStream = New ADODB.Stream

    If CodeFrame.Value = 1 Then
         tStream.Charset = "utf-8"
         tCodeStr = "UTF8"
    ElseIf CodeFrame.Value = 2 Then
         tStream.Charset = "big5"
         tCodeStr = "BIG5"
    ElseIf CodeFrame.Value = 3 Then
         tStream.Charset = "gb2312"
         tCodeStr = "GB2312"
    Else
         tStream.Charset = "iso-8859-1"
         tCodeStr = "ASCII"
         tPinyin = True
    End If

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

    'Use a With...End With block to reference the FileDialog object.
    With dlgSaveAs
        .InitialFileName = "network_" + tCodeStr + ".gdf"
        If .Show = -1 Then
            '
            tFileName = ""
            For Each tFN In .SelectedItems
                 tFileName = tFN
                 If Not tFileName = "" Then
                     Exit For
                 End If
            Next
            If tFileName = "" Then
                 MsgBox "Bad file Name."
                 GoTo Exit_CmdGUESS_Click
            Else
                 ' make sure the file name has a gdf extension
                 If Len(tFileName) < 5 Then
                     tFileName = tFileName + ".gdf"
                 ElseIf Not (LCase(Right(tFileName, 4)) = ".gdf") Then
                     tFileName = tFileName + ".gdf"
                 End If
            End If
            '
            ' now process the file (second true removed to make ASCII)
            '
            'Set tFileSystem = CreateObject("Scripting.FileSystemObject")
            'Set tGDF = tFileSystem.CreateTextFile(tFileName, True, True)
            tStream.Mode = adModeReadWrite
            tStream.Type = adTypeText
            tStream.Open

            ' process the two tables
            '
            Set tRstEdge = CurrentDb.OpenRecordset("ZZ_SOCIAL_NETWORK", dbOpenDynaset)
            Set tRstNode = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
            tC = Chr(44) ' the comma
            tQuote = Chr(34) 'the Quote delimiter
            '
            ' first the nodes: define the record structure
            '   if ASCII, no characters, and no pinyin field
            If tCodeStr = "ASCII" Then
                tStr = "nodedef> name VARCHAR" + tC + "label VARCHAR" + tC + "labelvisible BOOLEAN" + _
è¡¨ - 19

                    tC + "style INT" + tC + "nodedist INT" + _
                    tC + "indexyear INT" + tC + "dynasty_code INT" + tC + "dynasty VARCHAR" + tC + "sex VARCHAR(1
)" + _
                    tC + "addr_name VARCHAR" + tC + "latitude DOUBLE" + tC + "longitude DOUBLE"
            Else
                tStr = "nodedef> name VARCHAR" + tC + "label VARCHAR" + tC + "labelvisible BOOLEAN" + _
                    tC + "style INT" + tC + "pinyin VARCHAR(50)" + tC + "nodedist INT" + _
                    tC + "indexyear INT" + tC + "dynasty_code INT" + tC + "dynasty VARCHAR" + tC + "dynasty_chn V
ARCHAR" + tC + "sex VARCHAR(1)" + _
                    tC + "addr_chn VARCHAR" + tC + "addr_name VARCHAR" + tC + "latitude DOUBLE" + tC + "longitude
 DOUBLE"
            End If
            'MsgBox "Writing " + tStr
            tStream.WriteText tStr, adWriteLine
            'tGDF.WriteLine (tStr)
            '
            With tRstNode
                .MoveFirst
                Do While Not .EOF
                    ' name = the ID of the person
                    tStr = Trim(Str(!c_person_id)) + tC

                    ' label
                    If tCodeStr = "ASCII" Then
                         If IsNull(!c_name) Then
                              tStr = tStr + "[Missing]" + tC
                         Else
                              tStr = tStr + !c_name + tC
                         End If
                    Else
                         If IsNull(!c_name_chn) Then
                              tStr = tStr + tC
                         Else
                              tStr = tStr + !c_name_chn + tC
                         End If
                    End If

                    ' labelvisible = true, style = 4 (text inside a rectangle)
                    tStr = tStr + "true" + tC + "4" + tC

                    If Not (tCodeStr = "ASCII") Then
                        ' pinyin = c_name
                        tStr = tStr + !c_name + tC
                    End If

                    ' nodedist = c_node_dist INT
                    tStr = tStr + Trim(Str(!c_node_dist)) + tC

                    ' indexyear = c_index_year INT
                    If IsNull(!c_index_year) Then
                         tStr = tStr + "-2000" + tC
                    Else
                         tStr = tStr + Trim(Str(!c_index_year)) + tC
                    End If

                    ' dynasty information
                    If tCodeStr = "ASCII" Then
                         If IsNull(!c_dynasty) Then
                              tStr = tStr + "0" + tC + "Unknown" + tC
                         Else
                              tStr = tStr + Str(!c_dy) + tC + !c_dynasty + tC
                         End If
                    Else
                         If IsNull(!c_dynasty) Then
                              tStr = tStr + "0" + tC + "Unknown" + tC + "Unknown" + tC
                         Else
                              tStr = tStr + Str(!c_dy) + tC + !c_dynasty + tC + !c_dynasty_chn + tC
                         End If
                    End If

                    '    sex = c_female > (F,M)
                    If !c_female = -1 Then
                         tStr = tStr + "F" + tC
                    Else
                         tStr = tStr + "M" + tC
                    End If

                    ' address names
                    If tCodeStr = "ASCII" Then
                        If IsNull(!c_addr_name) Then
è¡¨ - 20

                                  tStr = tStr + tC
                           Else
                               tStr = tStr + !c_addr_name + tC
                           End If
                    Else
                        If IsNull(!c_addr_chn) Then
                             tStr = tStr + tC
                        Else
                             tStr = tStr + !c_addr_chn + tC
                        End If
                        If IsNull(!c_addr_name) Then
                             tStr = tStr + tC
                        Else
                             tStr = tStr + !c_addr_name + tC
                        End If
                    End If

                    '    latitude = !y_coord
                    If IsNull(!y_coord) Then
                         tStr = tStr + "0.0" + tC
                    Else
                         tStr = tStr + Str(!y_coord) + tC
                    End If

                    '    longitude = !x_coord
                    If IsNull(!x_coord) Then
                         tStr = tStr + "0.0"
                    Else
                         tStr = tStr + Str(!x_coord)
                    End If

                    'MsgBox "Writing " + tStr
                    tStream.WriteText tStr, adWriteLine
                    'tGDF.WriteLine (tStr)
                    .MoveNext
                Loop
            End With
            '
            ' now the edges: define the record structure
            '   if ASCII, then the description is the English and there is no edge_desc
            If tCodeStr = "ASCII" Then
                tStr = "edgedef> node1 VARCHAR" + tC + "node2 VARCHAR" + tC + "label VARCHAR" + tC + "edgetype VA
RCHAR(1)"
            Else
                tStr = "edgedef> node1 VARCHAR" + tC + "node2 VARCHAR" + tC + "label VARCHAR" + _
                    tC + "edge_desc VARCHAR(50)" + tC + "edgetype VARCHAR(1)"
            End If
            'MsgBox "Writing " + tStr
            tStream.WriteText tStr, adWriteLine
            'tGDF.WriteLine (tStr)

            With tRstEdge
                .MoveFirst
                Do While Not .EOF
                    '   node1 = str(c_person_id) for node1
                    tStr = Trim(Str(!c_person_id)) + tC

                    '   node2 = str(c_node_id) for node2
                    tStr = tStr + Trim(Str(!c_node_id)) + tC

                    '    label
                    If tCodeStr = "ASCII" Then
                         If IsNull(!c_link_desc) Then
                              tStr = tStr + tC
                         Else
                              tStr = tStr + tQuote + Trim(Left(!c_link_desc + Space(50), 50)) + tQuote + tC
                         End If
                    Else
                         If IsNull(!c_link_chn) Then
                              tStr = tStr + tC
                         Else
                              tStr = tStr + tQuote + !c_link_chn + tQuote + tC
                         End If
                    End If

                    '   edge_desc = c_link_desc, if used
                    If Not (tCodeStr = "ASCII") Then
                        If IsNull(!c_link_desc) Then
                             tStr = tStr + tC
                        Else
è¡¨ - 21

                                  tStr = tStr + tQuote + Trim(Left(!c_link_desc + Space(50), 50)) + tQuote + tC
                              End If
                          End If

                          '   edgetype= c_link_type (K,N)
                          tStr = tStr + !c_link_type

                          'MsgBox "Writing " + tStr
                          tStream.WriteText tStr, adWriteLine
                          'tGDF.WriteLine (tStr)
                          .MoveNext
                      Loop
                  End With
                  '
                  ' now make sure all the data is copied to tStream
                  'MsgBox "Flushing..."
                  tStream.Flush
                  ' and write the stream to the file
                  'MsgBox "Writing..."
                  tStream.SaveToFile tFileName, adSaveCreateOverWrite
                  '
                  'MsgBox "Closing..."
                  tStream.Close
                  Set tStream = Nothing
                  'tGDF.Close
                  '
                  Set tRstNode = Nothing
                  Set tRstEdge = Nothing
                  'Set tGDF = Nothing
                  'Set tFileSystem = Nothing
           Else
             'The user pressed Cancel.
        End If
    End With

    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdGUESS_Click:
    Exit Sub

Err_CmdGUESS_Click:
    ' finish writing and close the file
    MsgBox Err.Description
    '
    If Not IsNull(tStr) Then
        tStream.WriteText tStr, adWriteLine
    End If
    tStream.Flush
    ' and write the stream to the file
    'MsgBox "Writing..."
    tStream.SaveToFile tFileName, adSaveCreateOverWrite
    '
    'MsgBox "Closing..."
    tStream.Close
    Set tStream = Nothing

    Resume Exit_CmdGUESS_Click

End Sub

Private Sub CmdImportPeople_Click()
    On Error GoTo Err_CmdImportPeople_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim tString As String, tAddrID As Long, ti As Integer, tStrID As String, tLen As Integer, tQuit As Boolean

    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tFileSystem, tList

    '
    tQuit = False
    If Not tQuit Then
        '
        ' open the list

           Set dlgSaveAs = Application.FileDialog(msoFileDialogOpen)
è¡¨ - 22


           'Use a With...End With block to reference the FileDialog object.
           With dlgSaveAs
               .InitialFileName = ""
               If .Show = -1 Then
                    '
                    tFileName = ""
                    For Each tFN In .SelectedItems
                         tFileName = tFN
                         If Not tFileName = "" Then
                             Exit For
                         End If
                    Next
                    If tFileName = "" Then
                         MsgBox "Bad file Name."
                         GoTo Exit_CmdImportPeople_Click
                    End If
                    '
               End If
           End With
           '
           ' Clear the various tables now that we are ready to go
           '
           Set cmdSQL = New ADODB.Command
           cmdSQL.ActiveConnection = CurrentProject.Connection
           cmdSQL.CommandType = adCmdText
           '
           cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_IMPORT_PEOPLE"
           cmdSQL.Execute tRecDeleted

           cmdSQL.CommandText = "Delete * from InputErrorList"
           cmdSQL.Execute tRecDeleted

           cmdSQL.CommandText = "Delete * from TempImportList"
           cmdSQL.Execute tRecDeleted

           DoCmd.TransferText acImportDelim, "ImportPeopleList_Space", "TempImportList", tFileName, 0
           '    TransferType=acImportDelim
           '    SpecificationName = "TempImportList" (apparently it is saved in the database itself)
           '    TableName = "TempImportList" (probably requires that I drop the table first, but I can test)
           '    HasFieldNames = False (0)
           '
           ' copy the bad IDs
           '
           tStrSQL = "INSERT INTO InputErrorList ( c_ID ) SELECT TempImportList.ImportID " + _
               "FROM BIOG_MAIN RIGHT JOIN TempImportList ON BIOG_MAIN.c_personid = TempImportList.ImportID " + _
               "WHERE (((BIOG_MAIN.c_personid) Is Null))"

           cmdSQL.CommandText = tStrSQL
           cmdSQL.Execute tRecDeleted

           If tRecDeleted > 0 Then
               MsgBox "Some ID were not successfully imported: please look at InputErrorList."
           End If
           '
           ' copy the good IDs
           '
           tStrSQL = "INSERT INTO ZZ_SCRATCH_IMPORT_PEOPLE ( c_person_id ) SELECT DISTINCT TempImportList.ImportID "
 + _
               "FROM BIOG_MAIN INNER JOIN TempImportList ON BIOG_MAIN.c_personid = TempImportList.ImportID"

           cmdSQL.CommandText = tStrSQL
           cmdSQL.Execute tRecDeleted

           If tRecDeleted > 0 Then
               TxtName.Value = "[Imported List]"
               TxtNameChn.Value = "[" + ChrW(&H8F38) + ChrW(&H5165) + ChrW(&H7684) + ChrW(&H4EBA) + ChrW(&H540D) + "
]"
               ' shu = 8F38, ru = 56DE, de = 7684, ren = 4EBA, ming = 540D
               gUsePersonID = True
               Me.CmdAllPeople.Enabled = True
               CmdRun.Enabled = True
               'CmdRerun.Enabled = False
           End If

           Set cmdSQL = Nothing
           Set tFileSystem = Nothing
       End If
       Call CheckRunCriteria
è¡¨ - 23

Exit_CmdImportPeople_Click:
    Exit Sub

Err_CmdImportPeople_Click:
    MsgBox Err.Description
    Resume Exit_CmdImportPeople_Click


End Sub

Private Sub CmdImportPlaces_Click()
    On Error GoTo Err_CmdImportPlaces_Click

    Dim stDocName As String, tRstAddresses As DAO.Recordset
    Dim stLinkCriteria As String
    Dim tString As String, tAddrID As Long, ti As Integer, tStrID As String, tLen As Integer, tQuit As Boolean

    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tFileSystem, tList

    '
    tQuit = False
    If Not tQuit Then
        ' open the list

           Set dlgSaveAs = Application.FileDialog(msoFileDialogOpen)

           'Use a With...End With block to reference the FileDialog object.
           With dlgSaveAs
               .InitialFileName = ""
               If .Show = -1 Then
                    '
                    tFileName = ""
                    For Each tFN In .SelectedItems
                         tFileName = tFN
                         If Not tFileName = "" Then
                             Exit For
                         End If
                    Next
                    If tFileName = "" Then
                         MsgBox "Bad file Name."
                         GoTo Exit_CmdImportPlaces_Click
                    End If
                    '
               End If
           End With
           '
           ' Clear the address table now that we are ready to go
           '
           Set cmdSQL = New ADODB.Command
           cmdSQL.ActiveConnection = CurrentProject.Connection
           cmdSQL.CommandType = adCmdText
           '
           cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_ADDR_LIST"
           cmdSQL.Execute tRecDeleted

           cmdSQL.CommandText = "Delete * from InputErrorList"
           cmdSQL.Execute tRecDeleted

           cmdSQL.CommandText = "Delete * from TempImportList"
           cmdSQL.Execute tRecDeleted

           DoCmd.TransferText acImportDelim, "ImportPlaceList_Space", "TempImportList", tFileName, 0
           '    TransferType=acImportDelim
           '    SpecificationName = "TempImportList" (apparently it is saved in the database itself)
           '    TableName = "TempImportList" (probably requires that I drop the table first, but I can test)
           '    HasFieldNames = False (0)
           '
           ' copy the bad IDs
           '
           tStrSQL = "INSERT INTO InputErrorList ( c_ID ) SELECT TempImportList.ImportID " + _
               "FROM ADDR_CODES RIGHT JOIN TempImportList ON ADDR_CODES.c_addr_id = TempImportList.ImportID " + _
               "WHERE (((ADDR_CODES.c_addr_id) Is Null))"

           cmdSQL.CommandText = tStrSQL
           cmdSQL.Execute tRecDeleted

           If tRecDeleted > 0 Then
è¡¨ - 24

               MsgBox "Some ID were not successfully imported: please look at InputErrorList."
           End If
           '
           ' copy the good IDs
           '
           tStrSQL = "INSERT INTO ZZ_SCRATCH_ADDR_LIST ( c_addr_id ) SELECT DISTINCT TempImportList.ImportID " + _
               "FROM ADDR_CODES INNER JOIN TempImportList ON ADDR_CODES.c_addr_id = TempImportList.ImportID"

           cmdSQL.CommandText = tStrSQL
           cmdSQL.Execute tRecDeleted

           If tRecDeleted > 0 Then
               TxtPlace.Value = "[Imported List]"
               Me.TxtPlaceChn.Value = "[Imported List]"
               TxtPlaceChn.Value = "[" + ChrW(&H8F38) + ChrW(&H5165) + ChrW(&H7684) + ChrW(&H5730) + ChrW(&H540D) +
"]"
               ' shu = 8F38, ru = 56DE, de = 7684, di = 5730, ming = 540D
               gUseADDRID = True
               ChkXYRef.Enabled = True
               ChkSubUnits.Enabled = True
               ChkPlaceLimit.Enabled = True
               CmdRun.Enabled = True
           End If

          Set cmdSQL = Nothing
          Set tFileSystem = Nothing
      End If

      Call CheckRunCriteria

Exit_CmdImportPlaces_Click:
    Exit Sub

Err_CmdImportPlaces_Click:
    MsgBox Err.Description
    Resume Exit_CmdImportPlaces_Click

End Sub

Private Sub CmdJiantiDisplay_Click()
On Error GoTo Err_CmdJiantiDisplay_Click
    If gDisplayLanguage = "S" Then
         gDisplayLanguage = "E"
    Else
         gDisplayLanguage = "S"
    End If

      Call changeDisplayLanguage

Exit_CmdJiantiDisplay_Click:
    Exit Sub

Err_CmdJiantiDisplay_Click:
    MsgBox Err.Description
    Resume Exit_CmdJiantiDisplay_Click


End Sub

Private Sub CmdPajek_Old_Click()
On Error GoTo Err_CmdPajek_Click
    '
    ' This program will dump the results of the search to a .net file
    '
    ' for the moment I'll just describe the format of the .gdf file
    '
    ' *Vertices NUM
    ' ID label "box" ic [color] bc [color]
    '      ID = str(c_person_id)
    '      label = c_name_chn
    '      color = red (1), orange (2), yellow (3), green (4), blue (5)
    '
    ' *Edges
    ' node1 node2 1 l "label"
    '      node1 = str(c_person_id) for node1
    '      node2 = str(c_node_id) for node2
    '      color = red (1), orange (2), yellow (3), green (4), blue (5)
    '      label = c_link_desc
    '
    '
è¡¨ - 25

    ' first see if there are any records to process
    '
    If ZZ_SOCIAL_NETWORK.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdPajek_Click
    End If
    '
    If ZZ_SCRATCH_PEOPLE.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdPajek_Click
    End If
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tRstNode As DAO.Recordset, tRstNodeList As DAO.Recordset
    Dim tRstEdge As DAO.Recordset, tRstAssocType As DAO.Recordset
    Dim tRstAssocCodeType As DAO.Recordset
    Dim tStr As String, tC As String, ti As Integer, tQuote As String, tFindStr As String
    Dim tColor(20) As String
    Dim tFileSystem

    Dim tStream As ADODB.Stream

    Set tStream = New ADODB.Stream
    tStream.Charset = "ascii"
    tStream.Mode = adModeReadWrite
    tStream.Type = adTypeText
    tStream.Open


    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)


    'Use a With...End With block to reference the FileDialog object.
    With dlgSaveAs
        .InitialFileName = "network.net"
        If .Show = -1 Then
            '
            tFileName = ""
            For Each tFN In .SelectedItems
                 tFileName = tFN
                 If Not tFileName = "" Then
                     Exit For
                 End If
            Next
            If tFileName = "" Then
                 MsgBox "Bad file Name."
                 GoTo Exit_CmdPajek_Click
            Else
                 ' make sure the file name has a net extension
                 If Len(tFileName) < 5 Then
                     tFileName = tFileName + ".net"
                 ElseIf Not (LCase(Right(tFileName, 4)) = ".net") Then
                     tFileName = tFileName + ".net"
                 End If
            End If
            '
            ' zap and open the scratch file
            '
            Dim cmdSQL As ADODB.Command
            Set cmdSQL = New ADODB.Command
            cmdSQL.ActiveConnection = CurrentProject.Connection
            cmdSQL.CommandType = adCmdText
            '
            cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PAJEK"
            cmdSQL.Execute tRecDeleted
            '
            ' fill the node list
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK ( c_ID, c_lbl, c_distance, c_v_num ) " + _
                 "SELECT DISTINCT ZZ_SCRATCH_PEOPLE.c_person_id, ZZ_SCRATCH_PEOPLE.c_name, " + _
                 "ZZ_SCRATCH_PEOPLE.c_node_dist, val(c_person_id) AS c_v_num FROM ZZ_SCRATCH_PEOPLE"

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted

            Set tRstNodeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK", dbOpenTable)
è¡¨ - 26

            tRstNodeList.Index = "c_ID"
            '
            ' there probably is an SQL way to do this, but...
            '
            ti = 1
            With tRstNodeList
                .MoveFirst
                Do While Not .EOF
                     .Edit
                     !c_v_num = Trim(Str(ti))
                     .Update
                     ti = ti + 1
                     .MoveNext
                Loop
            End With
            tRstNodeList.Close
            '
            cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PAJEK_EDGE"
            cmdSQL.Execute tRecDeleted
            '
            ' fill the edge list
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK_EDGE ( c_node_1, c_node_2, c_edge_count, c_edge_dist, c_edg
e_desc )" + _
                "SELECT Val([ZZ_SCRATCH_PAJEK].[c_v_num]) AS c_node_1, Val([ZZ_SCRATCH_PAJEK_1].[c_v_num]) " + _
                "AS c_node_2, ZZ_SOCIAL_NETWORK_AGGREGATE.c_link_count, ZZ_SOCIAL_NETWORK_AGGREGATE.c_edge_dist,
" + _
                "ZZ_SOCIAL_NETWORK_AGGREGATE.c_link_desc " + _
                "FROM ZZ_SCRATCH_PAJEK INNER JOIN (ZZ_SCRATCH_PAJEK AS ZZ_SCRATCH_PAJEK_1 INNER JOIN " + _
                "ZZ_SOCIAL_NETWORK_AGGREGATE ON ZZ_SCRATCH_PAJEK_1.c_ID = ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_id)
" + _
                "ON ZZ_SCRATCH_PAJEK.c_ID = ZZ_SOCIAL_NETWORK_AGGREGATE.c_person_id"

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            '
            ' set the Quote delimiter
            '
            tQuote = Chr(34)
            '
            ' define the colors for the nodes
            '
            tColor(1) = "White"
            tColor(2) = "Blue"
            tColor(3) = "Green"
            tColor(4) = "Yellow"
            tColor(5) = "Orange"
            For ti = 6 To 20
                 tColor(ti) = "Red"
            Next
            '
            ' process the two tables
            '
            Set tRstNodeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK", dbOpenDynaset)
            Set tRstEdgeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK_EDGE", dbOpenDynaset)
            tC = Chr(44) ' the comma
            '
            ' first the nodes: define the record structure
            tRstNodeList.MoveLast
            tStr = "*Vertices " + Trim(Str(tRstNodeList.RecordCount))
            tStream.WriteText tStr, adWriteLine
            '
            ti = 1
            With tRstNodeList
                 .MoveFirst
                 Do While Not .EOF
                     tStream.WriteText !c_v_num + " "
                     '
                     If IsNull(!c_lbl) Then
                          tStream.WriteText Chr(34)
                          tStream.WriteText "Error-" + Trim(Str(!c_ID))
                          tStream.WriteText Chr(34)
                          tStream.WriteText " box "
                     Else
                          If !c_lbl = "" Then
                              tStream.WriteText Chr(34)
                              tStream.WriteText "Error-" + Trim(Str(!c_ID))
                              tStream.WriteText Chr(34)
                              tStream.WriteText " box "
è¡¨ - 27

                                 Else
                                     tStream.WriteText Chr(34)
                                     tStream.WriteText !c_lbl
                                     If ChkIncludeID.Value Then
                                         tStream.WriteText ":" + Trim(Str(!c_ID))
                                     End If
                                     tStream.WriteText Chr(34)
                                     tStream.WriteText " box "
                                 End If
                             End If
                             ' label
                             tStr = " ic " + tColor(!c_distance + 1)
                             tStr = tStr + " bc " + tColor(!c_distance + 1)
                             ' color = white (1), blue (2), green (3), yellow (4), orange (5)
                             tStream.WriteText tStr, adWriteLine
                             '
                             .MoveNext
                      Loop
                  End With

                  '
                  ' now the edges: define the record structure
                  '
                  tStream.WriteText "*Edges", adWriteLine

                  If tRstEdgeList.RecordCount > 0 Then
                      With tRstEdgeList
                      .MoveFirst
                      Do While Not .EOF
                          tStr = Trim(Str(!c_node_1)) + " " + Trim(Str(!c_node_2))
                          '
                          ' now get the weight
                          '
                          If !c_edge_count < 6 Then
                               tStr = tStr + " " + Trim(Str(!c_edge_count)) + " "
                          Else
                               tStr = tStr + " 5 "
                          End If
                          '
                          ' now get the label
                          '
                          tStr = tStr + "l " + tQuote
                          If !c_edge_count = 1 Then
                               tStr = tStr + !c_edge_desc + tQuote + " "
                          Else
                               tStr = tStr + Trim(Str(!c_edge_count)) + " links" + tQuote + " "
                               '
                          End If

                             tStr = tStr + "c " + tColor(!c_edge_dist + 1)
                             '   color = white (1), blue (2), green (3), yellow (4), orange (5)
                             '
                             tStream.WriteText tStr, adWriteLine
                             '
                             .MoveNext
                      Loop
                      End With
                  End If
                  ' now make sure all the data is copied to tStream
                  tStream.Flush
                  ' and write the stream to the file
                  tStream.SaveToFile tFileName, adSaveCreateOverWrite
                  '
                  tRstNodeList.Close

                  tStream.Close
                  '
                  Set tStream = Nothing
                  Set tFileSystem = Nothing
                  Set tRstNodeList = Nothing
                  Set tRstEdgeList = Nothing
           Else
             'The user pressed Cancel.
        End If
    End With

    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdPajek_Click:
è¡¨ - 28

    Exit Sub

Err_CmdPajek_Click:
    MsgBox Err.Description
    Resume Exit_CmdPajek_Click

End Sub

Private Sub CmdRerun_Click()
On Error GoTo Err_CmdRerun_Click

    Dim tQueryStr As String, tRecCount As Long
    Dim cmdSQL As ADODB.Command

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_IMPORT_PEOPLE"
    cmdSQL.Execute tRecDeleted

    tQueryStr = "INSERT INTO ZZ_SCRATCH_IMPORT_PEOPLE ( c_person_id ) " + _
                "SELECT ZZ_SCRATCH_PEOPLE.c_person_id FROM ZZ_SCRATCH_PEOPLE"

    'MsgBox "Populating people list table: " + tQueryStr

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecCount

    If tRecCount > 0 Then
         gUsePersonID = True
         Call CmdRun_Click
    Else
         MsgBox "There were no results to reuse."
    End If

Exit_CmdRerun_Click:
    Exit Sub

Err_CmdRerun_Click:
    MsgBox Err.Description
    Resume Exit_CmdRerun_Click

End Sub

Private Sub CmdNeo4j_Click()
On Error GoTo Err_CmdNeo4j_Click
    '
    ' This routine will be close to that for LookAtAssociations and, if used, that for LookAtKinship
    ' The additional wrinkle is that, while the first step is to split associatin from kinship relations, we sti
ll need to gather all
    '    the people from both.
    '
    ' first see if there are any records to process
    '
    If Me.ZZ_SOCIAL_NETWORK.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdNeo4j_Click
    End If
    '
    ' allocate the file variables
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer, tFileName As String, tFN As Variant
    '
    ' next get the People file
    '
    Dim tRstPeople As DAO.Recordset, tRstAssoc As DAO.Recordset, tRstPlace As DAO.Recordset, tRstPeoplePlace As D
AO.Recordset
    Dim tStr As String, tC As String, tQueryStr As String, tRstAssocCode As DAO.Recordset, tRstKin As DAO.Records
et
    Dim gStream As ADODB.Stream, tCodeStr As String, tTempLong As Long
    '

    ' set up the stream to write to

    Set gStream = New ADODB.Stream
    If CodeFrame.Value = 1 Then
        gStream.Charset = "utf-8"
        tCodeStr = "UTF8"
è¡¨ - 29

    ElseIf CodeFrame.Value = 2 Then
         gStream.Charset = "big5"
         tCodeStr = "BIG5"
    ElseIf CodeFrame.Value = 3 Then
         gStream.Charset = "gb2312"
         tCodeStr = "GB2312"
    Else
         gStream.Charset = "ascii"
         tCodeStr = "ascii"
    End If

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

           dlgSaveAs.InitialFileName = "People_" + tCodeStr + ".csv"
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
                    GoTo Exit_CmdNeo4j_Click
               Else
                    ' make sure the file name has a txt extension
                    If Len(tFileName) < 5 Then
                        tFileName = tFileName + ".csv"
                    ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                        tFileName = tFileName + ".csv"
                    End If
               End If
               '
               ' now process the file (second true removed to make ASCII)
               '
               'Set tFileSystem = CreateObject("Scripting.FileSystemObject")
               'Set tGDF = tFileSystem.CreateTextFile(tFileName, True, True)
               '
               ' we have a file name: now open the stream for writing

               gStream.Mode = adModeReadWrite
               gStream.Type = adTypeText
               gStream.Open

               '
               '   prepare the temp tables for the people, place, peoplePlace and assoc codes

               Dim cmdSQL As ADODB.Command
               Set cmdSQL = New ADODB.Command
               cmdSQL.ActiveConnection = CurrentProject.Connection
               cmdSQL.CommandType = adCmdText
               '
               ' Get the people from 5 sources: c_person_id, c_node_id, c_kin_id, c_assoc_kin_id, and c_assoc_claim
er_id

               cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_P_TEXT"
               cmdSQL.Execute tRecDeleted
               '
               ' copy the data for people (1)
               '
               tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_person
_id " + _
                           "FROM ZZ_SOCIAL_NETWORK WHERE (((ZZ_SOCIAL_NETWORK.c_person_id)>0))"
               '
               cmdSQL.CommandText = tQueryStr
               cmdSQL.Execute tRecDeleted
               '
               ' copy the data for people (2)
               '
               tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_node_i
d " + _
                           "FROM ZZ_SOCIAL_NETWORK WHERE (((ZZ_SOCIAL_NETWORK.c_node_id)>0))"
               '
               cmdSQL.CommandText = tQueryStr
               cmdSQL.Execute tRecDeleted
               '
               ' copy the data for people (3)
               '
è¡¨ - 30

               tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_kin_id
 " + _
                           "FROM ZZ_SOCIAL_NETWORK WHERE (((ZZ_SOCIAL_NETWORK.c_kin_id)>0))"
               '
               cmdSQL.CommandText = tQueryStr
               cmdSQL.Execute tRecDeleted
               '
               ' copy the data for people (4)
               '
               tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_assoc_
kin_id " + _
                          "FROM ZZ_SOCIAL_NETWORK WHERE (((ZZ_SOCIAL_NETWORK.c_assoc_kin_id)>0))"
            '
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy the data for people (5)
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_assoc_
claimer_id " + _
                          "FROM ZZ_SOCIAL_NETWORK WHERE (((ZZ_SOCIAL_NETWORK.c_assoc_claimer_id)>0))"
            '
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_P_TEXT.c_person_id, ZZZ_BIOG_MAIN.c_name, ZZZ_BIOG_MAIN.c_nam
e_chn, ZZZ_BIOG_MAIN.c_index_year, " + _
                               "ZZZ_BIOG_MAIN.c_dynasty, ZZZ_BIOG_MAIN.c_dynasty_chn, ZZZ_BIOG_MAIN.c_index_addr_id,
 ZZZ_BIOG_MAIN.c_index_addr_name, " + _
                               "ZZZ_BIOG_MAIN.c_index_addr_chn, ZZZ_BIOG_MAIN.c_index_addr_type_code, ZZZ_BIOG_MAIN.
c_index_addr_type_desc, " + _
                               "ZZZ_BIOG_MAIN.c_index_addr_type_chn, ZZZ_BIOG_MAIN.c_female, ZZZ_BIOG_MAIN.x_coord,
ZZZ_BIOG_MAIN.y_coord " + _
                          "FROM ZZ_SCRATCH_P_TEXT INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_P_TEXT.c_person_id = ZZZ_B
IOG_MAIN.c_personid"
            '
            Set tRstPeople = CurrentDb.OpenRecordset(tQueryStr, dbOpenDynaset)
            '
            ' process the four tables
            '
            tC = Chr(44) ' the comma
            '
            ' first the nodes: define the record structure
            '
            ' if the file is strictly ASCII, the label is the pinyin, but if there are characters, then we add a
 pinyin field
            If tCodeStr = "ascii" Then
                 tStr = "nameID" + tC + "namePY" + tC + "indexyear" + tC + "dynasty" + tC + "sex"
            Else
                 tStr = "nameID" + tC + "nameHZ" + tC + "namePY" + tC + "indexyear" + tC + "dynasty" + tC + "sex"
            End If
            gStream.WriteText tStr, adWriteLine
            'tGDF.WriteLine (tStr)
            '
            With tRstPeople
                 .MoveFirst
                 Do While Not .EOF
                     ' the ID of the person
                     tStr = Trim(Str(!c_person_id)) + tC
                     '
                     ' name
                     '
                     If tCodeStr = "ascii" Then
                          If IsNull(!c_name) Then
                               tStr = tStr + tC
                          Else
                               tStr = tStr + !c_name + tC
                          End If
                     Else
                          If IsNull(!c_name_chn) Then
                               tStr = tStr + "Missing" + tC
                          Else
                               tStr = tStr + !c_name_chn + tC
                          End If

                           If IsNull(!c_name) Then
                                tStr = tStr + "Missing" + tC
                           Else
                                tStr = tStr + !c_name + tC
                           End If
è¡¨ - 31

                          End If
                          '
                          ' indexyear = c_index_year INT
                          '
                          If IsNull(!c_index_year) Then
                               tStr = tStr + "-2000" + tC
                          Else
                               tStr = tStr + Trim(Str(!c_index_year)) + tC
                          End If

                          ' dynasty information
                          '
                          If IsNull(!c_dynasty) Then
                               tStr = tStr + "unknown" + tC
                          Else
                               If tCodeStr = "ascii" Then
                                    tStr = tStr + !c_dynasty + tC
                               Else
                                    tStr = tStr + !c_dynasty_chn + tC
                               End If
                          End If
                          '
                          '    sex = c_female > (F,M)
                          tStr = tStr + IIf(!c_female, "F", "M")
                          '
                          gStream.WriteText tStr, adWriteLine
                          '
                          .MoveNext
                      Loop
                  End With
                  ' now make sure all the data is copied to tStream
                  gStream.Flush
                  ' and write the stream to the file
                  gStream.SaveToFile tFileName, adSaveCreateOverWrite
                  '
                  gStream.Close
           Else
            'The user pressed Cancel.
            GoTo Exit_CmdNeo4j_Click
        End If
        '
        ' now places: since the association "event" is not linked to a place, the only addresses are the index
addresses
        '                of the people involved, recorded in ZZ_SCRATCH_PEOPLE
        '
        ' get a file name
        '
        dlgSaveAs.InitialFileName = "Places_" + tCodeStr + ".csv"
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
                 GoTo Exit_CmdNeo4j_Click
            Else
                 ' make sure the file name has a txt extension
                 If Len(tFileName) < 5 Then
                     tFileName = tFileName + ".csv"
                 ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                     tFileName = tFileName + ".csv"
                 End If
            End If
            '
            gStream.Open
            '
            ' now process the file
            '
            tQueryStr = "SELECT DISTINCT ZZZ_BIOG_MAIN.c_index_addr_id, ZZZ_BIOG_MAIN.c_index_addr_name, " + _
                              "ZZZ_BIOG_MAIN.c_index_addr_chn, ZZZ_BIOG_MAIN.x_coord, ZZZ_BIOG_MAIN.y_coord " + _
                         "FROM ZZ_SCRATCH_P_TEXT INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_P_TEXT.c_person_id = ZZZ_B
IOG_MAIN.c_personid " + _
                         "WHERE (ZZZ_BIOG_MAIN.c_index_addr_id > 0)"

                  Set tRstPlace = CurrentDb.OpenRecordset(tQueryStr)
è¡¨ - 32

                  '
                  If tCodeStr = "ascii" Then
                       tStr = "placeID" + tC + "placePY" + tC + "placeX" + tC + "placeY"
                  Else
                       tStr = "placeID" + tC + "placePY" + tC + "placeHZ" + tC + "placeX" + tC + "placeY"
                  End If
                  gStream.WriteText tStr, adWriteLine
                  With tRstPlace
                       .MoveFirst
                       Do While Not .EOF
                           ' the ID of the place
                           If Not IsNull(!c_index_addr_id) Then
                               tStr = Trim(Str(!c_index_addr_id)) + tC
                               '
                               '   address name

                              If IsNull(!c_index_addr_name) Then
                                   tStr = tStr + "unknown" + tC
                              Else
                                   tStr = tStr + !c_index_addr_name + tC
                              End If
                              '
                              If Not (tCodeStr = "ascii") Then
                                   If IsNull(!c_index_addr_chn) Then
                                        tStr = tStr + "unknown" + tC
                                   Else
                                        tStr = tStr + !c_index_addr_chn + tC
                                   End If
                              End If

                              '    longitude = !x_coord
                              If IsNull(!x_coord) Then
                                   tStr = tStr + "0.0" + tC
                              Else
                                   tStr = tStr + Str(!x_coord) + tC
                              End If

                              '    latitude = !y_coord
                              If IsNull(!y_coord) Then
                                   tStr = tStr + "0.0"
                              Else
                                   tStr = tStr + Str(!y_coord)
                              End If
                              '
                              gStream.WriteText tStr, adWriteLine
                          End If
                          .MoveNext
                      Loop
                  End With
                  '
                  ' now make sure all the data is copied to tStream
                  gStream.Flush
                  ' and write the stream to the file
                  gStream.SaveToFile tFileName, adSaveCreateOverWrite
                  '
                  gStream.Close
           Else
               'The user pressed Cancel.
               GoTo Exit_CmdNeo4j_Click
           End If
           '
           ' now peoplePlaces
           '
           dlgSaveAs.InitialFileName = "PeoplePlaces_" + tCodeStr + ".csv"
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
                    GoTo Exit_CmdNeo4j_Click
               Else
                    ' make sure the file name has a txt extension
                    If Len(tFileName) < 5 Then
                        tFileName = tFileName + ".csv"
è¡¨ - 33

                ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                    tFileName = tFileName + ".csv"
                End If
            End If
            '
            gStream.Open
            '
            tQueryStr = "SELECT DISTINCT ZZ_SCRATCH_P_TEXT.c_person_id, ZZZ_BIOG_MAIN.c_index_addr_id, ZZZ_BIOG_M
AIN.c_index_addr_type_code, " + _
                             "ZZZ_BIOG_MAIN.c_index_addr_type_desc, ZZZ_BIOG_MAIN.c_index_addr_type_chn " + _
                         "FROM ZZ_SCRATCH_P_TEXT INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SCRATCH_P_TEXT.c_person_id = ZZZ_B
IOG_MAIN.c_personid " + _
                         "WHERE (ZZZ_BIOG_MAIN.c_index_addr_id > 0)"

                  Set tRstPeoplePlace = CurrentDb.OpenRecordset(tQueryStr)

                  If (tCodeStr = "ascii") Then
                       tStr = "nameID" + tC + "placeID" + tC + "personPlaceCode" + tC + "personPlaceTrans"
                  Else
                       tStr = "nameID" + tC + "placeID" + tC + "personPlaceCode" + tC + "personPlaceTrans" + tC + "perso
nPlaceHZ"
                  End If

                  gStream.WriteText tStr, adWriteLine

                  With tRstPeoplePlace
                      .MoveFirst
                      Do While Not .EOF
                           If Not IsNull(!c_index_addr_id) Then
                               '
                               tStr = Trim(Str(!c_person_id)) + tC
                               '
                               tStr = tStr + Trim(Str(!c_index_addr_id)) + tC
                               '
                               tStr = tStr + Trim(Str(!c_index_addr_type_code)) + tC
                               '
                               tStr = tStr + Trim(!c_index_addr_type_desc)
                               '
                               If Not (tCodeStr = "ascii") Then
                                   tStr = tStr + tC + Trim(!c_index_addr_type_chn)
                               End If
                               '
                               gStream.WriteText tStr, adWriteLine
                           End If
                           .MoveNext
                      Loop
                  End With
                  '
                  ' now make sure all the data is copied to tStream
                  gStream.Flush
                  ' and write the stream to the file
                  gStream.SaveToFile tFileName, adSaveCreateOverWrite
                  '
                  gStream.Close
           Else
               'The user pressed Cancel.
               GoTo Exit_CmdNeo4j_Click
           End If
           '
           ' now the association records
           '
           dlgSaveAs.InitialFileName = "PeopleAssociations_" + tCodeStr + ".csv"
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
                    GoTo Exit_CmdNeo4j_Click
               Else
                    ' make sure the file name has a txt extension
                    If Len(tFileName) < 5 Then
                        tFileName = tFileName + ".csv"
                    ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                        tFileName = tFileName + ".csv"
è¡¨ - 34

                   End If
               End If
               '
               gStream.Open
               '
               ' now the associations: define the record structure
               ' Because of the complexity of the primary key, this gets a bit complicated
               '
               Set tRstAssoc = CurrentDb.OpenRecordset("ZZ_SOCIAL_NETWORK", dbOpenDynaset)
               '
               tStr = "Person1_ID" + tC + "Person2_ID" + tC + "Association_Code" + tC + "Association_FirstYear" + tC
    + "Kin_ID" + tC + "Kin_Code" + tC + _
                       "AssocKin_ID" + tC + "AssocKin_Code" + tC + "LiteraryGenreCode" + tC + "OccasionCode" + tC +
_
                       "TopicCode" + tC + "InstitutionCode" + tC + "TextTitle" + tC + "AssociationClaimer_ID"
               gStream.WriteText tStr, adWriteLine
               'tGDF.WriteLine (tStr)

               With tRstAssoc
                   .MoveFirst
                   Do While Not .EOF
                       If !c_link_type = "N" And (Not IsNull(!c_link_code)) Then
                           tStr = Trim(Str(!c_person_id)) + tC
                           '   node1 = str(c_person_id) for node1
                           tStr = tStr + Trim(Str(!c_node_id)) + tC
                           '   node2 = str(c_node_id) for node2
                           tStr = tStr + Trim(Str(!c_link_code)) + tC
                           '
                           '   FirstYear (cannot be NULL)
                           '
                           tStr = tStr + Str(!c_link_first_year) + tC

                           '    kin ID
                           If IsNull(!c_kin_id) Then
                                tStr = tStr + "0" + tC
                           Else
                                tStr = tStr + Str(!c_kin_id) + tC
                           End If

                           '    kin code
                           If IsNull(!c_kin_code) Then
                                tStr = tStr + "0" + tC
                           Else
                                tStr = tStr + Str(!c_kin_code) + tC
                           End If

                           '    assoc kin ID
                           If IsNull(!c_assoc_kin_id) Then
                                tStr = tStr + "0" + tC
                           Else
                                tStr = tStr + Str(!c_assoc_kin_id) + tC
                           End If

                           '    assoc kin code
                           If IsNull(!c_assoc_kin_code) Then
                                tStr = tStr + "0" + tC
                           Else
                                tStr = tStr + Str(!c_assoc_kin_code) + tC
                           End If

                           '    literary genre code
                           If IsNull(!c_litgenre_code) Then
                                tStr = tStr + "0" + tC
                           Else
                                tStr = tStr + Str(!c_litgenre_code) + tC
                           End If

                           '    occasion code
                           If IsNull(!c_occasion_code) Then
                                tStr = tStr + "0" + tC
                           Else
                                tStr = tStr + Str(!c_occasion_code) + tC
                           End If

                           '    topic code
                           If IsNull(!c_topic_code) Then
                                tStr = tStr + "0" + tC
                           Else
                                tStr = tStr + Str(!c_topic_code) + tC
                           End If
è¡¨ - 35


                              '    institution code
                              If IsNull(!c_inst_code) Then
                                   tStr = tStr + "0" + tC
                              Else
                                   tStr = tStr + Str(!c_inst_code) + tC
                              End If

                              '    text title
                              If IsNull(!c_text_title) Then
                                   tStr = tStr + "N/A" + tC
                              Else
                                   tStr = tStr + !c_text_title + tC
                              End If

                              '    association claimer ID
                              If IsNull(!c_assoc_claimer_id) Then
                                   tStr = tStr + "0" + tC
                              Else
                                   tStr = tStr + Str(!c_assoc_claimer_id)
                              End If

                              gStream.WriteText tStr, adWriteLine
                          End If
                          .MoveNext
                      Loop
                  End With
                  '
                  ' now make sure all the data is copied to tStream
                  gStream.Flush
                  ' and write the stream to the file
                  gStream.SaveToFile tFileName, adSaveCreateOverWrite
                  '
                  gStream.Close
           Else
            'The user pressed Cancel.
        End If
        '
        ' now the kinship relations: first, will there be any? -1 = "True"
        '
        If ChkKin.Value = -1 Then
            cmdSQL.CommandText = "DELETE * FROM ZZ_KIN_LIST_TMP"
            cmdSQL.Execute tRecDeleted
            '
            tQueryStr = "INSERT INTO ZZ_KIN_LIST_TMP ( c_kin_code, c_kinrel, c_kinrel_total ) " + _
                         "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_link_code, ZZ_SOCIAL_NETWORK.c_link_desc, ZZ_SOCIAL_
NETWORK.c_link_chn " + _
                         "FROM ZZ_SOCIAL_NETWORK " + _
                         "WHERE (((ZZ_SOCIAL_NETWORK.c_link_type)='K') AND ((ZZ_SOCIAL_NETWORK.c_link_code)>0))"
            '
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted

                  If tRecDeleted > 0 Then
                      dlgSaveAs.InitialFileName = "KinshipRelations_" + tCodeStr + ".csv"
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
                               GoTo Exit_CmdNeo4j_Click
                          Else
                               ' make sure the file name has a txt extension
                               If Len(tFileName) < 5 Then
                                   tFileName = tFileName + ".csv"
                               ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                                   tFileName = tFileName + ".csv"
                               End If
                          End If
                          '
                          gStream.Open
                          '
                          tStr = "PersonID" + tC + "KinID" + tC + "KinCode"
è¡¨ - 36

                       gStream.WriteText tStr, adWriteLine
                       '
                       ' still using ZZ_SOCIAL_NETWORK
                       '
                       With tRstAssoc
                           .MoveFirst
                           Do While Not .EOF
                                If !c_link_type = "K" And (Not IsNull(!c_link_code)) Then
                                    '
                                    tStr = Trim(Str(!c_person_id)) + tC
                                    '
                                    tStr = Trim(Str(!c_node_id)) + tC
                                    '
                                    tStr = Trim(Str(!c_link_code))
                                    '
                                    gStream.WriteText tStr, adWriteLine
                                End If
                                .MoveNext
                           Loop
                       End With
                       '
                       ' now make sure all the data is copied to tStream
                       gStream.Flush
                       ' and write the stream to the file
                       gStream.SaveToFile tFileName, adSaveCreateOverWrite
                       '
                       gStream.Close
                Else
                     'The user pressed Cancel.
                     GoTo Exit_CmdNeo4j_Click
                 End If
            End If
        End If
        '
        ' now the association codes
        '
        dlgSaveAs.InitialFileName = "AssociationCodes_" + tCodeStr + ".csv"
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
                 GoTo Exit_CmdNeo4j_Click
            Else
                 ' make sure the file name has a txt extension
                 If Len(tFileName) < 5 Then
                     tFileName = tFileName + ".csv"
                 ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                     tFileName = tFileName + ".csv"
                 End If
            End If
            '
            gStream.Open
            '
            tQueryStr = "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_link_code, ZZ_SOCIAL_NETWORK.c_link_desc, ZZ_SOCIAL_
NETWORK.c_link_chn " + _
                         "FROM ZZ_SOCIAL_NETWORK " + _
                         "WHERE ((ZZ_SOCIAL_NETWORK.c_link_type = 'N') and (ZZ_SOCIAL_NETWORK.c_link_code > 0))"

            Set tRstAssocCode = CurrentDb.OpenRecordset(tQueryStr, dbOpenDynaset)
            '
            If tCodeStr = "ascii" Then
                 tStr = "AssociationCode" + tC + "AssociationTrans"
            Else
                 tStr = "AssociationCode" + tC + "AssociationTrans" + tC + "AssociationHZ"
            End If

            gStream.WriteText tStr, adWriteLine

            With tRstAssocCode
                .MoveFirst
                Do While Not .EOF
                    If Not IsNull(!c_link_code) Then
                        '
è¡¨ - 37

                              tStr = Trim(Str(!c_link_code)) + tC
                              '
                              tStr = tStr + Trim(!c_link_desc)
                              '
                              If Not (tCodeStr = "ascii") Then
                                  tStr = tStr + tC + Trim(!c_link_chn)
                              End If
                              gStream.WriteText tStr, adWriteLine
                          End If
                          .MoveNext
                      Loop
                  End With
                  '
                  ' now make sure all the data is copied to tStream
                  gStream.Flush
                  ' and write the stream to the file
                  gStream.SaveToFile tFileName, adSaveCreateOverWrite
                  '
                  gStream.Close
           Else
            'The user pressed Cancel.
            GoTo Exit_CmdNeo4j_Click
        End If
        '
        ' there are codes that MAY require additional tables: c_kin_code, c_litgenrte_code, c_occasion_code, c_t
opic_code, c_inst_code
        '
        ' test for kin codes
        '
        ' tRecDeleted is the number of kinship codes inserted into ZZ_KIN_LIST_TEMP for the earlier test
        '
        tTempLong = tRecDeleted
        tQueryStr = "INSERT INTO ZZ_KIN_LIST_TMP ( c_kin_code, c_kinrel, c_kinrel_total ) " + _
                    "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_kin_code, ZZ_SOCIAL_NETWORK.c_kin_desc, ZZ_SOCIAL_NETWOR
K.c_kin_desc_chn " + _
                    "FROM ZZ_SOCIAL_NETWORK " + _
                    "WHERE (((ZZ_SOCIAL_NETWORK.c_kin_code)>0))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted

        tTempLong = tTempLong + tRecDeleted
        tQueryStr = "INSERT INTO ZZ_KIN_LIST_TMP ( c_kin_code, c_kinrel, c_kinrel_total ) " + _
                    "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_assoc_kin_code, ZZ_SOCIAL_NETWORK.c_assoc_kin_desc, ZZ_S
OCIAL_NETWORK.c_assoc_kin_desc_chn " + _
                    "FROM ZZ_SOCIAL_NETWORK " + _
                    "WHERE (((ZZ_SOCIAL_NETWORK.c_assoc_kin_code)>0))"
        '
        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted

           tTempLong = tTempLong + tRecDeleted
           '
           ' debug
           '
           MsgBox "Kinship code records = " + Trim(Str(tTempLong))
           '
           If tTempLong > 0 Then
               dlgSaveAs.InitialFileName = "KinshipCodes_" + tCodeStr + ".csv"
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
                        GoTo Exit_CmdNeo4j_Click
                   Else
                        ' make sure the file name has a txt extension
                        If Len(tFileName) < 5 Then
                            tFileName = tFileName + ".csv"
                        ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                            tFileName = tFileName + ".csv"
                        End If
                   End If
                   '
è¡¨ - 38

                gStream.Open
                '
                tQueryStr = "SELECT DISTINCT ZZ_KIN_LIST_TMP.c_kin_code, ZZ_KIN_LIST_TMP.c_kinrel, ZZ_KIN_LIST_TM
P.c_kinrel_total " + _
                             "FROM ZZ_KIN_LIST_TMP"

                      Set tRstAssocCode = CurrentDb.OpenRecordset(tQueryStr)

                      If tCodeStr = "ascii" Then
                           tStr = "KinshipCode" + tC + "KinshipTrans"
                      Else
                           tStr = "KinshipCode" + tC + "KinshipTrans" + tC + "KinshipHZ"
                      End If

                      gStream.WriteText tStr, adWriteLine

                      With tRstAssocCode
                          .MoveFirst
                          Do While Not .EOF
                               If Not IsNull(!c_kin_code) Then
                                   '
                                   tStr = Trim(Str(!c_kin_code)) + tC
                                   '
                                   tStr = tStr + Trim(!c_kinrel)
                                   '
                                   If Not (tCodeStr = "ascii") Then
                                       tStr = tStr + tC + Trim(!c_kinrel_total)
                                   End If
                                   gStream.WriteText tStr, adWriteLine
                               End If
                               .MoveNext
                          Loop
                      End With
                      '
                      ' now make sure all the data is copied to tStream
                      gStream.Flush
                      ' and write the stream to the file
                      gStream.SaveToFile tFileName, adSaveCreateOverWrite
                      '
                      gStream.Close
               Else
                   'The user pressed Cancel.
                   GoTo Exit_CmdNeo4j_Click
               End If
           End If
           '
           ' test for literary genre codes
           '
           tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) " + _
                        "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_person_id " + _
                        "FROM ZZ_SOCIAL_NETWORK " + _
                        "WHERE (((ZZ_SOCIAL_NETWORK.c_litgenre_code)>0))"
           '
           cmdSQL.CommandText = tQueryStr
           cmdSQL.Execute tRecDeleted
           '
           ' debug
           '
           MsgBox "Literary genre code records = " + Trim(Str(tRecDeleted))
           '
           If tRecDeleted > 0 Then
               dlgSaveAs.InitialFileName = "LiteraryGenreCodes_" + tCodeStr + ".csv"
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
                        GoTo Exit_CmdNeo4j_Click
                   Else
                        ' make sure the file name has a txt extension
                        If Len(tFileName) < 5 Then
                            tFileName = tFileName + ".csv"
                        ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                            tFileName = tFileName + ".csv"
è¡¨ - 39

                    End If
                End If
                '
                gStream.Open
                '
                tQueryStr = "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_litgenre_code, ZZ_SOCIAL_NETWORK.c_litgenre_desc
, ZZ_SOCIAL_NETWORK.c_litgenre_desc_chn " + _
                             "FROM ZZ_SOCIAL_NETWORK " + _
                             "WHERE (((ZZ_SOCIAL_NETWORK.c_litgenre_code)>0))"

                      Set tRstAssocCode = CurrentDb.OpenRecordset(tQueryStr)

                      If tCodeStr = "ascii" Then
                           tStr = "LitGenreCode" + tC + "LitGenreTrans"
                      Else
                           tStr = "LitGenreCode" + tC + "LitGenreTrans" + tC + "LitGenreHZ"
                      End If

                      gStream.WriteText tStr, adWriteLine

                      With tRstAssocCode
                          .MoveFirst
                          Do While Not .EOF
                               If Not IsNull(!c_litgenre_code) Then
                                   '
                                   tStr = Trim(Str(!c_litgenre_code)) + tC
                                   '
                                   tStr = tStr + Trim(!c_litgenre_desc)
                                   '
                                   If Not (tCodeStr = "ascii") Then
                                       tStr = tStr + tC + Trim(!c_litgenre_desc_chn)
                                   End If
                                   gStream.WriteText tStr, adWriteLine
                               End If
                               .MoveNext
                          Loop
                      End With
                      '
                      ' now make sure all the data is copied to tStream
                      gStream.Flush
                      ' and write the stream to the file
                      gStream.SaveToFile tFileName, adSaveCreateOverWrite
                      '
                      gStream.Close
               Else
                   'The user pressed Cancel.
                   GoTo Exit_CmdNeo4j_Click
               End If
           End If
           '
           ' test for institution codes
           '
           tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) " + _
                        "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_person_id " + _
                        "FROM ZZ_SOCIAL_NETWORK " + _
                        "WHERE (((ZZ_SOCIAL_NETWORK.c_inst_code)>0))"
           '
           cmdSQL.CommandText = tQueryStr
           cmdSQL.Execute tRecDeleted
           '
           ' debug
           '
           MsgBox "Institution code records = " + Trim(Str(tRecDeleted))
           '
           If tRecDeleted > 0 Then
               dlgSaveAs.InitialFileName = "InstitutionCodes_" + tCodeStr + ".csv"
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
                        GoTo Exit_CmdNeo4j_Click
                   Else
                        ' make sure the file name has a txt extension
è¡¨ - 40

                    If Len(tFileName) < 5 Then
                        tFileName = tFileName + ".csv"
                    ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                        tFileName = tFileName + ".csv"
                    End If
                End If
                '
                gStream.Open
                '
                tQueryStr = "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_inst_code, ZZ_SOCIAL_NETWORK.c_inst_name_py, ZZ_
SOCIAL_NETWORK.c_inst_name_hz " + _
                             "FROM ZZ_SOCIAL_NETWORK " + _
                             "WHERE (((ZZ_SOCIAL_NETWORK.c_inst_code)>0))"

                      Set tRstAssocCode = CurrentDb.OpenRecordset(tQueryStr)

                      If tCodeStr = "ascii" Then
                           tStr = "InstitutionCode" + tC + "InstitutionNamePY"
                      Else
                           tStr = "InstitutionCode" + tC + "InstitutionNamePY" + tC + "InstitutionNameHZ"
                      End If

                      gStream.WriteText tStr, adWriteLine

                      With tRstAssocCode
                          .MoveFirst
                          Do While Not .EOF
                               If Not IsNull(!c_inst_code) Then
                                   '
                                   tStr = Trim(Str(!c_inst_code)) + tC
                                   '
                                   tStr = tStr + Trim(!c_inst_name_py)
                                   '
                                   If Not (tCodeStr = "ascii") Then
                                       tStr = tStr + tC + Trim(!c_inst_name_hz)
                                   End If
                                   gStream.WriteText tStr, adWriteLine
                               End If
                               .MoveNext
                          Loop
                      End With
                      '
                      ' now make sure all the data is copied to tStream
                      gStream.Flush
                      ' and write the stream to the file
                      gStream.SaveToFile tFileName, adSaveCreateOverWrite
                      '
                      gStream.Close
               Else
                   'The user pressed Cancel.
                   GoTo Exit_CmdNeo4j_Click
               End If
           End If
           '
           ' test for occasion codes
           '
           tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) " + _
                        "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_person_id " + _
                        "FROM ZZ_SOCIAL_NETWORK " + _
                        "WHERE (((ZZ_SOCIAL_NETWORK.c_occasion_code)>0))"
           '
           cmdSQL.CommandText = tQueryStr
           cmdSQL.Execute tRecDeleted
           '
           ' debug
           '
           MsgBox "Occasion code records = " + Trim(Str(tRecDeleted))
           '
           If tRecDeleted > 0 Then
               dlgSaveAs.InitialFileName = "OccasionCodes_" + tCodeStr + ".csv"
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
è¡¨ - 41

                             MsgBox "Bad file Name."
                             GoTo Exit_CmdNeo4j_Click
                      Else
                    ' make sure the file name has a txt extension
                    If Len(tFileName) < 5 Then
                        tFileName = tFileName + ".csv"
                    ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                        tFileName = tFileName + ".csv"
                    End If
                End If
                '
                gStream.Open
                '
                tQueryStr = "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_occasion_code, ZZ_SOCIAL_NETWORK.c_occasion_desc
, ZZ_SOCIAL_NETWORK.c_occasion_desc_chn " + _
                             "FROM ZZ_SOCIAL_NETWORK " + _
                             "WHERE (((ZZ_SOCIAL_NETWORK.c_occasion_code)>0))"

                      Set tRstAssocCode = CurrentDb.OpenRecordset(tQueryStr)

                      If tCodeStr = "ascii" Then
                           tStr = "OccasionCode" + tC + "OccasionTrans"
                      Else
                           tStr = "OccasionCode" + tC + "OccasionTrans" + tC + "OccasionHZ"
                      End If

                      gStream.WriteText tStr, adWriteLine

                      With tRstAssocCode
                          .MoveFirst
                          Do While Not .EOF
                               If Not IsNull(!c_occasion_code) Then
                                   '
                                   tStr = Trim(Str(!c_occasion_code)) + tC
                                   '
                                   tStr = tStr + Trim(!c_occasion_desc)
                                   '
                                   If Not (tCodeStr = "ascii") Then
                                       tStr = tStr + tC + Trim(!c_occasion_desc_chn)
                                   End If
                                   gStream.WriteText tStr, adWriteLine
                               End If
                               .MoveNext
                          Loop
                      End With
                      '
                      ' now make sure all the data is copied to tStream
                      gStream.Flush
                      ' and write the stream to the file
                      gStream.SaveToFile tFileName, adSaveCreateOverWrite
                      '
                      gStream.Close
               Else
                   'The user pressed Cancel.
                   GoTo Exit_CmdNeo4j_Click
               End If
           End If
           '
           ' test for topic codes
           '
           tQueryStr = "INSERT INTO ZZ_SCRATCH_P_TEXT ( c_person_id ) " + _
                       "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_person_id " + _
                       "FROM ZZ_SOCIAL_NETWORK " + _
                       "WHERE (((ZZ_SOCIAL_NETWORK.c_topic_code)>0))"
           '
           cmdSQL.CommandText = tQueryStr
           cmdSQL.Execute tRecDeleted
           '
           ' debug
           '
           MsgBox "Topic code records = " + Trim(Str(tRecDeleted))
           '
           If tRecDeleted > 0 Then
               dlgSaveAs.InitialFileName = "TopicCodes_" + tCodeStr + ".csv"
               If dlgSaveAs.Show = -1 Then
                   '
                   tFileName = ""
                   For Each tFN In dlgSaveAs.SelectedItems
                       tFileName = tFN
                       If Not tFileName = "" Then
è¡¨ - 42

                           Exit For
                       End If
                Next
                If tFileName = "" Then
                     MsgBox "Bad file Name."
                     GoTo Exit_CmdNeo4j_Click
                Else
                     ' make sure the file name has a txt extension
                     If Len(tFileName) < 5 Then
                         tFileName = tFileName + ".csv"
                     ElseIf Not (LCase(Right(tFileName, 4)) = ".csv") Then
                         tFileName = tFileName + ".csv"
                     End If
                End If
                '
                gStream.Open
                '
                ' because ZZZ_NONKIN_BIOG_ADDR does not have the topic descriptions (must fix), I need to use a j
oin to TOPIC_CODES
                '
                tQueryStr = "SELECT DISTINCT ZZ_SOCIAL_NETWORK.c_topic_code, SCHOLARLYTOPIC_CODES.c_topic_desc, S
CHOLARLYTOPIC_CODES.c_topic_desc_chn " + _
                             "FROM ZZ_SOCIAL_NETWORK INNER JOIN SCHOLARLYTOPIC_CODES ON ZZ_SOCIAL_NETWORK.c_topic_
code = SCHOLARLYTOPIC_CODES.c_topic_code " + _
                             "WHERE (((ZZ_SOCIAL_NETWORK.c_topic_code)>0))"

                   Set tRstAssocCode = CurrentDb.OpenRecordset(tQueryStr)

                   If tCodeStr = "ascii" Then
                        tStr = "TopicCode" + tC + "TopicTrans"
                   Else
                        tStr = "TopicCode" + tC + "TopicTrans" + tC + "TopicHZ"
                   End If

                   gStream.WriteText tStr, adWriteLine

                   With tRstAssocCode
                       .MoveFirst
                       Do While Not .EOF
                            If Not IsNull(!c_topic_code) Then
                                '
                                tStr = Trim(Str(!c_topic_code)) + tC
                                '
                                tStr = tStr + Trim(!c_topic_desc)
                                '
                                If Not (tCodeStr = "ascii") Then
                                    tStr = tStr + tC + Trim(!c_topic_desc_chn)
                                End If
                                gStream.WriteText tStr, adWriteLine
                            End If
                            .MoveNext
                       Loop
                   End With
                   '
                   ' now make sure all the data is copied to tStream
                   gStream.Flush
                   ' and write the stream to the file
                   gStream.SaveToFile tFileName, adSaveCreateOverWrite
                   '
                   gStream.Close
            Else
                'The user pressed Cancel.
                GoTo Exit_CmdNeo4j_Click
            End If
        End If
    MsgBox "Finished saving to Neo4j"
    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdNeo4j_Click:
    Exit Sub

Err_CmdNeo4j_Click:
    MsgBox Err.Description
    Resume Exit_CmdNeo4j_Click

End Sub

Private Sub CmdRun_Click()
On Error GoTo Err_CmdRun_Click
è¡¨ - 43


    Dim tTrue As Integer, tFalse As Integer, tLoop As Integer
    Dim tMale As Integer, tFemale As Integer, tBothSexes As Integer, tContinue As Integer
    Dim tRstDummy As DAO.Recordset
    Dim tLoopInfoStr As String, tNonkinQueryStr As String, tKinQueryStr As String
    Dim tRstAddrList As DAO.Recordset

    Dim tQueryAssocAddrAssocFromStr As String, tQueryAssocAddrFromStr As String, tQueryAssocAssocFromStr As Strin
g
    Dim tQueryAssocFromStr As String, tQueryKinAddrFromStr As String, tQueryKinFromStr As String
    Dim tQueryAssocLastAddrAssocFromStr As String, tQueryAssocLastAddrFromStr As String, tQueryAssocLastAssocFrom
Str As String
    Dim tQueryAssocLastFromStr As String, tQueryKinLastAddrFromStr As String, tQueryKinLastFromStr As String

    Dim tNonkinWhereQueryStr As String, tKinWhereQueryStr As String, tKinWhereFirstQueryStr As String
    Dim tQuerySelectFirstNonkin As String, tQuerySelectFirstKin As String, tNonkinWhereFirstQueryStr As String
    Dim tQueryAssocFirstAddrAssocFromStr As String, tQueryAssocFirstAddrFromStr As String
    Dim tQueryAssocFirstAssocFromStr As String, tQueryKinFirstAddrFromStr As String, tQueryAppendStr As String
    Dim tQueryAssocFirstFromStr As String, tPruneTmpQueryDupesStr As String

    Dim tQueryKinStr As String, tQueryKinFirstStr As String, tNodeDistQueryStr As String
    Dim tQueryNonkinStr As String, tQueryNonkinFirstStr As String, tPruneTmpQuery As String
    Dim tQueryNonkinLastStr As String, tQueryKinLastStr As String, tQueryCopyNonkinStr As String, tQueryCopyKinSt
r As String
    Dim tQueryPruneTmpAssocInverse1Str As String, tQueryPruneTmpAssocInverse2Str As String
    Dim tQueryPruneTmpKinInverse1Str As String, tQueryPruneTmpKinInverse2Str As String
    Dim tQueryPruneTmpKinInverse3Str As String, tQueryPruneTmpKinInverse4Str As String
    Dim tRecCountKin As Long, tRecCountNonkin As Long, tStrQuerySet As String

    tTrue = -1
    tFalse = 0
    tFemale = -1
    tMale = 0
    tBothSexes = 1
    gLoopMax = TxtMaxLoop.Value
    gMaxNodeDist = TxtNodeDist.Value
    '
    ' The design of this routine is to built the SQL queries that will sweep together the needed people
    '       The logic has three different query types
    '       1. Using a name or list of names to generate the first set of associations
    '       2. Using those results to look for the next cycles of associations
    '       3. When the final node distance has been reached, look among the new people for relations with one a
nother
    '
    ' We begin with error checking for the interface:
    '
    ' First thing is to see if the person has specified "everyone"
    '
    ' Do we need the association filter? We need to do this first because of the condition that follows
    '
    gUseFilter = tFalse
    If ChkNonKin.Value = tTrue Then
        If gFilterTotalCount < gMaxFilterTotal Then
            If gFilterTotalCount = 0 Then
                 ChkNonKin.Value = tFalse
            Else
                 gUseFilter = tTrue
            End If
        End If
    End If
    '
    If Not gUsePersonID And Not gUseADDRID And gUseFilter = tFalse Then
        MsgBox "Please select a person and/or a place."
        GoTo Exit_CmdRun_Click
    End If

    ' Next see if at least one network checkbox has been clicked
    '
    If ChkKin.Value = tFalse And ChkNonKin.Value = tFalse Then
         MsgBox "Please select the kinship and/or non-kinship option."
         GoTo Exit_CmdRun_Click
    Else
         If ChkKin.Value = tFalse And ChkNonKin.Value = tTrue Then
             If gFilterTotalCount = 0 Then
                 MsgBox "Please select at least one non-kinship relation."
                 GoTo Exit_CmdRun_Click
             End If
         End If
    End If
è¡¨ - 44

    ' Next see if at least one sex checkbox has been clicked

    If ChkMale.Value = tFalse And ChkFemale.Value = tFalse Then
        MsgBox "Please select the male and/or female option."
        GoTo Exit_CmdRun_Click
    End If
    '
    ' We've survived and now need to do the actual processing
    '
    Dim tQuery As DAO.QueryDef
    '
    Dim cmdSQL As ADODB.Command, tRecDeleted As Long, strSQL As String

    '
    ' Next we need to do the preliminaries of preparing scratch tables
    '
    ' Clear the output table and the scratch personID table, if needed
    '
    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    ' clear the two scratch files
    '
    'MsgBox "Clearing tables..."
    cmdSQL.CommandText = "Delete * from ZZ_NETWORK_LIST"
    cmdSQL.Execute tRecDeleted

    cmdSQL.CommandText = "Delete * from ZZ_NETWORK_LIST_TMP"
    cmdSQL.Execute tRecDeleted

    Set gRstEdge = ZZ_SOCIAL_NETWORK.Form.Recordset
    Set gRstPersonID = ZZ_SCRATCH_PEOPLE.Form.Recordset
    '
    Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SN", dbOpenDynaset)
    Set ZZ_SOCIAL_NETWORK.Form.Recordset = tRstDummy
    Set ZZ_SOCIAL_NETWORK_AGGREGATED.Form.Recordset = tRstDummy
    '
    gRstEdge.Close
    cmdSQL.CommandText = "Delete * from ZZ_SOCIAL_NETWORK"
    cmdSQL.Execute tRecDeleted
    '
    ' now zap the scratch person file
    '
    Set tRstDummy = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SP", dbOpenDynaset)
    Set ZZ_SCRATCH_PEOPLE.Form.Recordset = tRstDummy
    '
    ' to get rid of superfluous deleted records, briefly close ZZ_SCRATCH_PEOPLE
    '
    gRstPersonID.Close
    cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
    cmdSQL.Execute tRecDeleted
    '
    ' now zap the association filter table and refill, if needed
    '
    If gUseFilter = tTrue Then
        'MsgBox "Building ASSOC filter table..."

        cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_ASSOC_FILTER"
        cmdSQL.Execute tRecDeleted
        '
        Call makeAssocFilter
    End If
    '
    ' now see if address IDs will be used. If so, zap the scratch file and repopulate
    '
    If gUseADDRID Then
        'MsgBox "Starting to get Place data: clearing scratch file"
        '
        'MsgBox "Buildng address table"
        cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_ADDR"
        cmdSQL.Execute tRecDeleted
        '
        '
        ' get all the lower level address IDs, if needed
        '
        If ChkSubUnits.Value Then
            'MsgBox "adding addresses"
            tQueryStr = "INSERT INTO ZZ_SCRATCH_ADDR ( c_addr_id ) SELECT DISTINCT ZZZ_BELONGS_TO.c_addr_id " + _
                "FROM ZZ_SCRATCH_ADDR_LIST INNER JOIN ZZZ_BELONGS_TO ON ZZ_SCRATCH_ADDR_LIST.c_addr_id = " + _
è¡¨ - 45

                      "ZZZ_BELONGS_TO.c_belongs_to"
           Else
                  tQueryStr = "INSERT INTO ZZ_SCRATCH_ADDR ( c_addr_id ) SELECT DISTINCT c_addr_id FROM ZZ_SCRATCH_ADDR
_LIST"
           End If

           cmdSQL.CommandText = tQueryStr
           cmdSQL.Execute tRecDeleted
           '
           '
           ' see if we need to use the historical XY search
           '
           If ChkXYRef.Value Then
               '
               ' the strategy here is to dump the IDs to ZZ_ADDRESSES then copy to ZZ_SCRATCH_ADDR_LIST
               ' (I borrow ZZ_ADDRESSES from the Pick Addresses form in order to keep the initial selection
               '   of addresses for the query intact.)
               '
               ' zap the list
               '
               tQueryStr = "DELETE * FROM ZZ_ADDRESSES"
               cmdSQL.CommandText = tQueryStr
               cmdSQL.Execute tRecDeleted
               '
               ' run the query
               '
               tQueryStr = "INSERT INTO ZZ_ADDRESSES ( c_addr_id )SELECT DISTINCT ADDR_CODES.c_addr_id " + _
                   "FROM ADDR_CODES, ZZ_SCRATCH_ADDR INNER JOIN ADDR_CODES AS ADDR_CODES_1 ON " + _
                   "ZZ_SCRATCH_ADDR.c_addr_id = ADDR_CODES_1.c_addr_id " + _
                   "WHERE (((ADDR_CODES.x_coord)>=([ADDR_CODES_1].[x_coord]-0.03) And " + _
                   "(ADDR_CODES.x_coord)<=([ADDR_CODES_1].[x_coord]+0.03)) AND " + _
                   "((ADDR_CODES.y_coord)>=([ADDR_CODES_1].[y_coord]-0.03) And " + _
                   "(ADDR_CODES.y_coord)<=([ADDR_CODES_1].[y_coord]+0.03)))"

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            ' now get the address IDs from the initial list that have no xy coordinates
            '
            tQueryStr = "INSERT INTO ZZ_ADDRESSES ( c_addr_id ) SELECT ZZ_SCRATCH_ADDR.c_addr_id " + _
                "FROM ZZ_SCRATCH_ADDR INNER JOIN ADDR_CODES ON " + _
                "ZZ_SCRATCH_ADDR.c_addr_id = ADDR_CODES.c_addr_id " + _
                "WHERE (((ADDR_CODES.x_coord) Is Null)) OR (((ADDR_CODES.y_coord) Is Null))"
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            ' zap ZZ_SCRATCH_ADDR
            '
            tQueryStr = "DELETE * FROM ZZ_SCRATCH_ADDR"
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            ' copy the list
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_ADDR ( c_addr_id )SELECT DISTINCT ZZ_ADDRESSES.c_addr_id " + _
                "FROM ZZ_ADDRESSES"
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            ' zap the temporary list
            '
            tQueryStr = "DELETE * FROM ZZ_ADDRESSES"
            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
        End If
        '
        ' Importing place names does not automatically reset to gUseAddrid = TRUE
        '
        gUseADDRID = True
    End If
    '
    ' now, if available, populate the initial ZZ_SCRATCH_PEOPLE with either a single record or with the list
    '
    If gUsePersonID Then
        tQueryStr = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_node_dist ) " + _
            "SELECT ZZ_SCRATCH_IMPORT_PEOPLE.c_person_id, 0 as c_node_dist FROM ZZ_SCRATCH_IMPORT_PEOPLE"

           'MsgBox "Populating people list table: " + tQueryStr
è¡¨ - 46

        cmdSQL.CommandText = tQueryStr
        cmdSQL.Execute tRecDeleted
    End If
    '
    ' define the copy query strings for the step of copying over the data
    '       Note that the JOIN constraints for copying from ZZZ_NONKIN_BIOG_ADDR are just:
    '       1. Person ID
    '       2. Link code (i.e association code)
    '       3. Node ID (i.e. associate ID)
    '       This copies over ALL records that apply, so that the specificity of texts, years and place of associa
tion, etc. are captured here.
    '

    tQueryCopyNonkinStr = "INSERT INTO ZZ_SOCIAL_NETWORK ( c_node_id, c_person_id, c_link_code, c_link_chn, c_lin
k_desc, c_kin_code, c_kin_id, c_kin_name, " + _
            "c_kin_chn, c_assoc_kin_code, c_assoc_kin_desc, c_assoc_kin_desc_chn, c_assoc_kin_id, c_assoc_kin_nam
e, c_assoc_kin_chn, c_litgenre_code, " + _
            "c_litgenre_desc, c_litgenre_desc_chn, c_occasion_code, c_occasion_desc, c_occasion_desc_chn, c_topic
_code, c_topic_desc, c_topic_desc_chn, " + _
            "c_inst_code, c_inst_name_hz, c_text_title, c_assoc_claimer_id, c_assoc_claimer_name, c_assoc_claimer
_name_chn, c_kin_desc, c_kin_desc_chn, " + _
            "c_inst_name_py, c_link_count, type_id, c_edge_dist, c_link_type, c_distance, c_source, c_link_first_
year, c_link_last_year, c_link_addr_id ) " + _
        "SELECT DISTINCT NA.c_node_id, NA.c_personid, NA.c_link_code, NA.c_link_chn, NA.c_link_desc, NA.c_kin_cod
e, NA.c_kin_id, NA.c_kin_name, NA.c_kin_chn, " + _
            "NA.c_assoc_kin_code, NA.c_assoc_kinrel, NA.c_assoc_kinrel_chn, NA.c_assoc_kin_id, NA.c_assoc_kin_nam
e, NA.c_assoc_kin_chn, NA.c_litgenre_code, " + _
            "NA.c_lit_genre_desc, NA.c_lit_genre_desc_chn, NA.c_occasion_code, NA.c_occasion_desc, NA.c_occasion_
desc_chn, NA.c_topic_code, NA.c_topic_desc, " + _
            "NA.c_topic_desc_chn, NA.c_inst_code, NA.c_inst_name_hz, NA.c_text_title, NA.c_assoc_claimer_id, NA.c
_assoc_claimer_name, NA.c_assoc_claimer_chn, " + _
            "NA.c_kinrel, NA.c_kinrel_chn, NA.c_inst_name_py, NA.c_link_count, 'N' AS type_id, ZZ_NETWORK_LIST.c_
distance, 'N' AS c_link_type, NA.c_distance, " + _
            "NA.c_source, NA.c_assoc_first_year, NA.c_assoc_last_year, NA.c_assoc_addr_id " + _
        "FROM ZZZ_NONKIN_BIOG_ADDR AS NA INNER JOIN ZZ_NETWORK_LIST ON (NA.c_node_id = ZZ_NETWORK_LIST.c_node_id)
 AND (NA.c_link_code = ZZ_NETWORK_LIST.c_edge_id) " + _
            "AND (NA.c_personid = ZZ_NETWORK_LIST.c_personid) " + _
        "WHERE (((ZZ_NETWORK_LIST.c_edge_type)='N'))"

    '        Similarly, note that the JOIN constraints for copying from ZZZ_KIN_BIOG_ADDR are just:
    '        1. Person ID
    '        2. Link code (i.e kinship code)
    '        3. Node ID (i.e. kin ID)
    '        This copies over all records that apply


    tQueryCopyKinStr = "INSERT INTO ZZ_SOCIAL_NETWORK ( c_person_id, c_node_id, c_link_code, c_source, c_text_tit
le, c_link_count, c_distance, " + _
            "c_link_type, type_id, c_link_chn, c_link_desc ) " + _
        "SELECT ZZZ_KIN_BIOG_ADDR.c_personid, ZZZ_KIN_BIOG_ADDR.c_node_id, ZZZ_KIN_BIOG_ADDR.c_link_code, ZZZ_KIN
_BIOG_ADDR.c_source, " + _
            "ZZZ_KIN_BIOG_ADDR.c_title_chn, ZZZ_KIN_BIOG_ADDR.c_link_count, ZZZ_KIN_BIOG_ADDR.c_distance, ZZ_NETW
ORK_LIST.c_edge_type, 'K' AS type_id, " + _
            "ZZZ_KIN_BIOG_ADDR.c_link_chn, ZZZ_KIN_BIOG_ADDR.c_link_desc " + _
        "FROM ZZZ_KIN_BIOG_ADDR INNER JOIN ZZ_NETWORK_LIST ON (ZZZ_KIN_BIOG_ADDR.c_personid = ZZ_NETWORK_LIST.c_p
ersonid) AND " + _
            "(ZZZ_KIN_BIOG_ADDR.c_node_id = ZZ_NETWORK_LIST.c_node_id) AND (ZZZ_KIN_BIOG_ADDR.c_link_code = ZZ_NE
TWORK_LIST.c_edge_id) " + _
        "WHERE (((ZZ_NETWORK_LIST.c_edge_type)='K'));"

    '
    '   initialize basic components of Query strings
    '
    '   INSERT INTO ZZ_NETWORK_LIST_TMP ( c_personid, c_node_id, c_edge_id, c_edge_type, c_up_total, c_down_total,
    '   c_mar_total, c_col_total, c_distance )
    '   SELECT ZZ_NETWORK_LIST.c_node_id, ZZZ_KIN_BIOG_ADDR.c_node_id, ZZZ_KIN_BIOG_ADDR.c_link_code, "K" AS Expr1
,
    '   ZZ_NETWORK_LIST.c_up_total+ZZZ_KIN_BIOG_ADDR.c_upstep AS c_up_total,
    '   ZZ_NETWORK_LIST.c_down_total+ZZZ_KIN_BIOG_ADDR.c_dwnstep AS c_down_total,
    '   ZZ_NETWORK_LIST.c_mar_total+ZZZ_KIN_BIOG_ADDR.c_marstep AS c_mar_total,
    '   ZZ_NETWORK_LIST.c_col_total+ZZZ_KIN_BIOG_ADDR.c_colstep AS c_col_total,
    '   [ZZ_NETWORK_LIST].[c_distance]+1 AS c_distance
    '
    '   FROM ZZ_SCRATCH_ADDR INNER JOIN (ZZ_NETWORK_LIST INNER JOIN ZZZ_KIN_BIOG_ADDR ON
    '   ZZ_NETWORK_LIST.c_node_id = ZZZ_KIN_BIOG_ADDR.c_personid) ON ZZ_SCRATCH_ADDR.c_addr_id =
    '   ZZZ_KIN_BIOG_ADDR.c_node_addr_id
    '
    '   WHERE ((([ZZ_NETWORK_LIST].[c_up_total]+[ZZZ_KIN_BIOG_ADDR].[c_upstep])<4)
    '   AND (([ZZ_NETWORK_LIST].[c_down_total]+[ZZZ_KIN_BIOG_ADDR].[c_dwnstep])<4)
    '   AND (([ZZ_NETWORK_LIST].[c_mar_total]+[ZZZ_KIN_BIOG_ADDR].[c_marstep])<2)
è¡¨ - 47

    '     AND (([ZZ_NETWORK_LIST].[c_col_total]+[ZZZ_KIN_BIOG_ADDR].[c_colstep])<2))
    '     AND ((ZZ_NETWORK_LIST].[c_distance]=0)
    '
    '
    '     INSERT INTO ZZ_NETWORK_LIST_TMP ( c_personid, c_node_id, c_edge_id, c_edge_type, c_up_total,
    '     c_down_total, c_mar_total, c_col_total, c_distance )
    '     SELECT DISTINCT ZZ_NETWORK_LIST.c_node_id, ZZZ_NONKIN_BIOG_ADDR.c_node_id,
    '     ZZZ_NONKIN_BIOG_ADDR.c_link_code, "N" AS c_edge_type, ZZ_NETWORK_LIST.c_up_total,
    '     ZZ_NETWORK_LIST.c_down_total, ZZ_NETWORK_LIST.c_mar_total, ZZ_NETWORK_LIST.c_col_total,
    '     [ZZ_NETWORK_LIST].[c_distance]+1 AS c_distance
    '
    '     FROM ZZ_SCRATCH_ADDR INNER JOIN (ZZ_SCRATCH_ASSOC_FILTER INNER JOIN (ZZ_NETWORK_LIST INNER
    '     JOIN ZZZ_NONKIN_BIOG_ADDR ON ZZ_NETWORK_LIST.c_node_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) ON
    '     ZZ_SCRATCH_ASSOC_FILTER.c_assoc_code = ZZZ_NONKIN_BIOG_ADDR.c_link_code) ON
    '     ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id
    '
    '     WHERE ((([ZZ_NETWORK_LIST].[c_distance]+1)=1));

    tQuerySelectFirstNonkin = "INSERT INTO ZZ_NETWORK_LIST_TMP ( c_personid, c_node_id, c_edge_id, " + _
            "c_edge_type, c_up_total, c_down_total, c_mar_total, c_col_total, c_distance ) " + _
        "SELECT DISTINCT ZZZ_NONKIN_BIOG_ADDR.c_personid, ZZZ_NONKIN_BIOG_ADDR.c_node_id, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_link_code, 'N' AS c_edge_type, 0 AS c_up_total, 0 AS c_down_total, " + _
            "0 AS c_mar_total, 0 AS c_col_total, 0 AS c_distance "

    gQuerySelectNonkin = "INSERT INTO ZZ_NETWORK_LIST_TMP ( c_personid, c_node_id, c_edge_id, c_edge_type, " + _
            " c_up_total, c_down_total, c_mar_total, c_col_total, c_distance ) " + _
        "SELECT DISTINCT ZZ_SCRATCH_PEOPLE.c_person_id, ZZZ_NONKIN_BIOG_ADDR.c_node_id, " + _
            "ZZZ_NONKIN_BIOG_ADDR.c_link_code, 'N' AS c_edge_type, 0 AS c_up_total, " + _
            "0 AS c_down_total, 0 AS c_mar_total, 0 AS c_col_total, " + _
            "[ZZ_SCRATCH_PEOPLE].[c_node_dist] AS c_distance "

    tQuerySelectFirstKin = "INSERT INTO ZZ_NETWORK_LIST_TMP ( c_personid, c_node_id, c_edge_id, c_edge_type, " +
_
               "c_up_total, c_down_total, c_mar_total, c_col_total, c_distance ) " + _
           "SELECT DISTINCT ZZZ_KIN_BIOG_ADDR.c_personid, ZZZ_KIN_BIOG_ADDR.c_node_id, ZZZ_KIN_BIOG_ADDR.c_link_code
, " + _
               "'K' AS Expr1, ZZZ_KIN_BIOG_ADDR.c_upstep, ZZZ_KIN_BIOG_ADDR.c_dwnstep, ZZZ_KIN_BIOG_ADDR.c_marstep,
" + _
               "ZZZ_KIN_BIOG_ADDR.c_colstep, 0 AS c_distance "

    gQuerySelectKin = "INSERT INTO ZZ_NETWORK_LIST_TMP ( c_personid, c_node_id, c_edge_id, c_edge_type, " + _
             "c_up_total, c_down_total, c_mar_total, c_col_total, c_distance ) " + _
         "SELECT DISTINCT ZZ_SCRATCH_PEOPLE.c_person_id, ZZZ_KIN_BIOG_ADDR.c_node_id, ZZZ_KIN_BIOG_ADDR.c_link_cod
e, " + _
             "'K' AS Expr1, ZZZ_KIN_BIOG_ADDR.c_upstep AS c_up_total, " + _
             "ZZZ_KIN_BIOG_ADDR.c_dwnstep AS c_down_total, " + _
             "ZZZ_KIN_BIOG_ADDR.c_marstep AS c_mar_total, " + _
             "ZZZ_KIN_BIOG_ADDR.c_colstep AS c_col_total, " + _
             "[ZZ_SCRATCH_PEOPLE].[c_node_dist] AS c_distance "

    'gQueryIndexYear = "((c_index_year)>= " + Str(TxtFrom.Value) + _
        " And (c_index_year)<=" + Str(TxtTo.Value) + _
        " AND (c_node_index_year)>=" + Str(TxtFrom.Value) + _
        " And (c_node_index_year)<=" + Str(TxtTo.Value) + ") "
    '
    gQueryKindist = "((c_upstep)<=" + Str(TxtMaxUp.Value) + ")" + _
        " AND ((c_dwnstep)<=" + Str(TxtMaxDwn.Value) + ")" + _
        " AND ((c_marstep)<=" + Str(TxtMaxMar.Value) + ")" + _
        " AND ((c_colstep)<=" + Str(TxtMaxCol.Value) + ") "

    '     The various options for the tables used in FROM statements for restricted search

    '     (1) Non-restricted ASSOC starting with a people list (with and without dynasty restrictions)

    tQueryAssocFromStr = "FROM ZZ_SCRATCH_PEOPLE INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid "

    tQueryAssocDynastyFromStr = "FROM DYNASTIES AS DYNASTIES_1 INNER JOIN (ZZ_SCRATCH_PEOPLE INNER JOIN (DYNASTIE
S INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
        "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy) " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
        "ON DYNASTIES_1.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_node_dy "

    ' (2) ASSOC starting with a people list restricted by a list of association codes (with and without dynasty
restrictions)

    tQueryAssocAssocFromStr = "FROM ZZ_SCRATCH_ASSOC_FILTER INNER JOIN (ZZ_SCRATCH_PEOPLE INNER JOIN ZZZ_NONKIN_B
IOG_ADDR " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
        "ON ZZ_SCRATCH_ASSOC_FILTER.c_assoc_code = ZZZ_NONKIN_BIOG_ADDR.c_link_code "
è¡¨ - 48


          tQueryAssocAssocDynastyFromStr = "FROM ZZ_SCRATCH_ASSOC_FILTER INNER JOIN (DYNASTIES AS DYNASTIES_1 " + _
              "INNER JOIN (ZZ_SCRATCH_PEOPLE INNER JOIN (DYNASTIES INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
              "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy) " + _
              "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
              "ON DYNASTIES_1.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_node_dy) " + _
              "ON ZZ_SCRATCH_ASSOC_FILTER.c_assoc_code = ZZZ_NONKIN_BIOG_ADDR.c_link_code "

    ' (3) ASSOC starting with a people list restricted by a list of address codes (with and without dynasty rest
rictions)

    tQueryAssocAddrFromStr = "FROM ZZ_SCRATCH_ADDR INNER JOIN (ZZ_SCRATCH_PEOPLE INNER JOIN ZZZ_NONKIN_BIOG_ADDR
" + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id "

    tQueryAssocAddrDynastyFromStr = "FROM (DYNASTIES AS DYNASTIES_1 INNER JOIN (ZZ_SCRATCH_PEOPLE INNER JOIN (DYN
ASTIES INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
        "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy) " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
        "ON DYNASTIES_1.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_node_dy) " + _
        "INNER JOIN ZZ_SCRATCH_ADDR " + _
        "ON ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id = ZZ_SCRATCH_ADDR.c_addr_id "

       ' (4) ASSOC starting with a people list restricted by lists of association codes AND address codes (with and
    without dynasty restrictions)

    tQueryAssocAddrAssocFromStr = "FROM ZZ_SCRATCH_ADDR INNER JOIN (ZZ_SCRATCH_ASSOC_FILTER INNER JOIN (ZZ_SCRATC
H_PEOPLE INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
        "ON ZZ_SCRATCH_ASSOC_FILTER.c_assoc_code = ZZZ_NONKIN_BIOG_ADDR.c_link_code) " + _
        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id "

    tQueryAssocAddrAssocDynastyFromStr = "FROM ZZ_SCRATCH_ADDR INNER JOIN (ZZ_SCRATCH_ASSOC_FILTER " + _
        "INNER JOIN (DYNASTIES AS DYNASTIES_1 INNER JOIN (ZZ_SCRATCH_PEOPLE INNER JOIN (DYNASTIES INNER JOIN ZZZ_
NONKIN_BIOG_ADDR " + _
        "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy) " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
        "ON DYNASTIES_1.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_node_dy) " + _
        "ON ZZ_SCRATCH_ASSOC_FILTER.c_assoc_code = ZZZ_NONKIN_BIOG_ADDR.c_link_code) " + _
        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id "

          '   (5) ASSOC restricted by NOTHING AT ALL (with and without dynasty restrictions)

          tQueryAssocFirstFromStr = "FROM ZZZ_NONKIN_BIOG_ADDR "

    tQueryAssocDynastyFirstFromStr = "FROM DYNASTIES AS DYNASTIES_1 INNER JOIN (DYNASTIES INNER JOIN ZZZ_NONKIN_B
IOG_ADDR " + _
        "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy) " + _
        "ON DYNASTIES_1.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_node_dy "

          '   (6) ASSOC restricted by a list of association codes (with and without dynasty restrictions)

          tQueryAssocFirstAssocFromStr = "FROM ZZ_SCRATCH_ASSOC_FILTER INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
              "ON ZZ_SCRATCH_ASSOC_FILTER.c_assoc_code = ZZZ_NONKIN_BIOG_ADDR.c_link_code "

          tQueryAssocFirstAssocDynastyFromStr = "FROM ZZ_SCRATCH_ASSOC_FILTER INNER JOIN (DYNASTIES AS DYNASTIES_1 " +
_
               "INNER JOIN (DYNASTIES INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
               "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy) " + _
               "ON DYNASTIES_1.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_node_dy) " + _
               "ON ZZ_SCRATCH_ASSOC_FILTER.c_assoc_code = ZZZ_NONKIN_BIOG_ADDR.c_link_code "

          '   (7) ASSOC restricted by a list of address codes (with and without dynasty restrictions)

    tQueryAssocFirstAddrFromStr = "FROM ZZ_SCRATCH_ADDR AS ZZ_SCRATCH_ADDR_1 INNER JOIN (ZZ_SCRATCH_ADDR INNER JO
IN ZZZ_NONKIN_BIOG_ADDR " + _
        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id) " + _
        "ON ZZ_SCRATCH_ADDR_1.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_person_addr_id "

          tQueryAssocFirstAddrDynastyFromStr = "FROM ZZ_SCRATCH_ADDR AS ZZ_SCRATCH_ADDR_1 INNER JOIN (ZZ_SCRATCH_ADDR "
    + _
               "INNER JOIN (DYNASTIES AS DYNASTIES_1 INNER JOIN (DYNASTIES INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
               "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy) " + _
               "ON DYNASTIES_1.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_node_dy) " + _
               "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id) " + _
               "ON ZZ_SCRATCH_ADDR_1.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_person_addr_id "

          '   (8) ASSOC restricted by a list of association codes AND address codes (with and without dynasty restrictio
ns)
è¡¨ - 49


    tQueryAssocFirstAddrAssocFromStr = "FROM ZZ_SCRATCH_ADDR AS ZZ_SCRATCH_ADDR_1 INNER JOIN " + _
        "(ZZ_SCRATCH_ADDR INNER JOIN (ZZ_SCRATCH_ASSOC_FILTER INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
        "ON ZZ_SCRATCH_ASSOC_FILTER.c_assoc_code = ZZZ_NONKIN_BIOG_ADDR.c_link_code) " + _
        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id) " + _
        "ON ZZ_SCRATCH_ADDR_1.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_person_addr_id "

    tQueryAssocFirstAddrAssocDynastyFromStr = "FROM ZZ_SCRATCH_ASSOC_FILTER INNER JOIN (ZZ_SCRATCH_ADDR AS ZZ_SCR
ATCH_ADDR_1 " + _
        "INNER JOIN (ZZ_SCRATCH_ADDR INNER JOIN (DYNASTIES AS DYNASTIES_1 INNER JOIN (DYNASTIES INNER JOIN ZZZ_NO
NKIN_BIOG_ADDR " + _
        "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy) " + _
        "ON DYNASTIES_1.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_node_dy) " + _
        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id) " + _
        "ON ZZ_SCRATCH_ADDR_1.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_person_addr_id) " + _
        "ON ZZ_SCRATCH_ASSOC_FILTER.c_assoc_code = ZZZ_NONKIN_BIOG_ADDR.c_link_code "

    '   (9) Non-restricted KINSHIP starting with a people list (with and without dynasty restrictions)

    tQueryKinFromStr = "FROM ZZ_SCRATCH_PEOPLE INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_KIN_BIOG_ADDR.c_personid "

    tQueryKinDynastyFromStr = "FROM ZZ_SCRATCH_PEOPLE INNER JOIN (DYNASTIES AS DYNASTIES_1 INNER JOIN (DYNASTIES
INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
        "ON DYNASTIES.c_dy = ZZZ_KIN_BIOG_ADDR.c_dy) " + _
        "ON DYNASTIES_1.c_dy = ZZZ_KIN_BIOG_ADDR.c_node_dy) " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_KIN_BIOG_ADDR.c_personid "

    ' (10) KINSHIP starting with a people list restricted by a list of address codes (with and without dynasty r
estrictions)

    tQueryKinAddrFromStr = "FROM ZZ_SCRATCH_ADDR INNER JOIN (ZZ_SCRATCH_PEOPLE INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_KIN_BIOG_ADDR.c_personid) " + _
        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_KIN_BIOG_ADDR.c_node_addr_id "

    tQueryKinAddrDynastyFromStr = "FROM ZZ_SCRATCH_ADDR INNER JOIN (ZZ_SCRATCH_PEOPLE INNER JOIN (DYNASTIES AS DY
NASTIES_1 " + _
        "INNER JOIN (DYNASTIES INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
        "ON DYNASTIES.c_dy = ZZZ_KIN_BIOG_ADDR.c_dy) " + _
        "ON DYNASTIES_1.c_dy = ZZZ_KIN_BIOG_ADDR.c_node_dy) " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_KIN_BIOG_ADDR.c_personid) " + _
        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_KIN_BIOG_ADDR.c_node_addr_id "

    '   (11) KINSHIP restricted by a list of address codes (with and without dynasty restrictions)

    tQueryKinFirstAddrFromStr = "FROM ZZ_SCRATCH_ADDR AS ZZ_SCRATCH_ADDR_1 INNER JOIN (ZZ_SCRATCH_ADDR INNER JOIN
 ZZZ_KIN_BIOG_ADDR " + _
        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_KIN_BIOG_ADDR.c_node_addr_id) " + _
        "ON ZZ_SCRATCH_ADDR_1.c_addr_id = ZZZ_KIN_BIOG_ADDR.c_person_addr_id "
    '
    tQueryKinFirstAddrDynastyFromStr = "FROM ZZ_SCRATCH_ADDR AS ZZ_SCRATCH_ADDR_1 INNER JOIN (ZZ_SCRATCH_ADDR " +
 _
        "INNER JOIN (DYNASTIES AS DYNASTIES_1 INNER JOIN (DYNASTIES INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
        "ON DYNASTIES.c_dy = ZZZ_KIN_BIOG_ADDR.c_dy) " + _
        "ON DYNASTIES_1.c_dy = ZZZ_KIN_BIOG_ADDR.c_node_dy) " + _
        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_KIN_BIOG_ADDR.c_node_addr_id) " + _
        "ON ZZ_SCRATCH_ADDR_1.c_addr_id = ZZZ_KIN_BIOG_ADDR.c_person_addr_id "
    '
    ' (12) Final restricted search: Non-restricted ASSOC starting with a people list (with and without dynasty
restrictions)

    tQueryAssocLastFromStr = "FROM ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1 INNER JOIN " + _
        "(ZZ_SCRATCH_PEOPLE INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
        "ON ZZ_SCRATCH_PEOPLE_1.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_node_id "

    tQueryAssocDynastyLastFromStr = "FROM ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1 INNER JOIN " + _
        "(ZZ_SCRATCH_PEOPLE INNER JOIN (DYNASTIES AS DYNASTIES_1 INNER JOIN (DYNASTIES INNER JOIN ZZZ_NONKIN_BIOG
_ADDR " + _
        "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy) " + _
        "ON DYNASTIES_1.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_node_dy) " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
        "ON ZZ_SCRATCH_PEOPLE_1.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_node_id "

    ' (13) Final restricted search: ASSOC starting with a people list restricted by a list of association codes
 (with and without dynasty restrictions)

    tQueryAssocLastAssocFromStr = "FROM ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1 INNER JOIN " + _
        "(ZZ_SCRATCH_PEOPLE INNER JOIN (ZZ_SCRATCH_ASSOC_FILTER INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
        "ON ZZ_SCRATCH_ASSOC_FILTER.c_assoc_code = ZZZ_NONKIN_BIOG_ADDR.c_link_code) " + _
è¡¨ - 50

           "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
           "ON ZZ_SCRATCH_PEOPLE_1.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_node_id "

    tQueryAssocLastAssocDynastyFromStr = "FROM ZZ_SCRATCH_ASSOC_FILTER INNER JOIN (ZZ_SCRATCH_PEOPLE AS ZZ_SCRATC
H_PEOPLE_1 " + _
        "INNER JOIN (ZZ_SCRATCH_PEOPLE INNER JOIN (DYNASTIES AS DYNASTIES_1 INNER JOIN (DYNASTIES INNER JOIN ZZZ_
NONKIN_BIOG_ADDR " + _
        "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy) " + _
        "ON DYNASTIES_1.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_node_dy) " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
        "ON ZZ_SCRATCH_PEOPLE_1.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_node_id) " + _
        "ON ZZ_SCRATCH_ASSOC_FILTER.c_assoc_code = ZZZ_NONKIN_BIOG_ADDR.c_link_code "

    ' (14) Final restricted search:        ASSOC starting with a people list restricted by a list of address code (wit
h and without dynasty restrictions)

      tQueryAssocLastAddrFromStr = "FROM ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1 INNER JOIN " + _
          "(ZZ_SCRATCH_PEOPLE INNER JOIN (ZZ_SCRATCH_ADDR INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
          "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id) " + _
          "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
          "ON ZZ_SCRATCH_PEOPLE_1.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_node_id "

    tQueryAssocLastAddrDynastyFromStr = "FROM ZZ_SCRATCH_ADDR INNER JOIN (ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_
1 " + _
        "INNER JOIN (ZZ_SCRATCH_PEOPLE INNER JOIN (DYNASTIES AS DYNASTIES_1 INNER JOIN (DYNASTIES INNER JOIN ZZZ_
NONKIN_BIOG_ADDR " + _
        "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy) " + _
        "ON DYNASTIES_1.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_node_dy) " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
        "ON ZZ_SCRATCH_PEOPLE_1.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_node_id) " + _
        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id "

      '   (15) Final restricted search:    ASSOC starting with a people list restricted by lists of association codes
      '                                   AND address codes (with and without dynasty restrictions)

    tQueryAssocLastAddrAssocFromStr = "FROM ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1 INNER JOIN " + _
        "(ZZ_SCRATCH_PEOPLE INNER JOIN (ZZ_SCRATCH_ADDR INNER JOIN (ZZ_SCRATCH_ASSOC_FILTER INNER JOIN ZZZ_NONKIN
_BIOG_ADDR " + _
        "ON ZZ_SCRATCH_ASSOC_FILTER.c_assoc_code = ZZZ_NONKIN_BIOG_ADDR.c_link_code) " + _
        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id) " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
        "ON ZZ_SCRATCH_PEOPLE_1.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_node_id "

    tQueryAssocLastAddrAssocDynastyFromStr = "FROM ZZ_SCRATCH_ASSOC_FILTER INNER JOIN (ZZ_SCRATCH_ADDR " + _
        "INNER JOIN (ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1 INNER JOIN (ZZ_SCRATCH_PEOPLE INNER JOIN (DYNASTIES
 AS DYNASTIES_1 " + _
        "INNER JOIN (DYNASTIES INNER JOIN ZZZ_NONKIN_BIOG_ADDR " + _
        "ON DYNASTIES.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_dy) " + _
        "ON DYNASTIES_1.c_dy = ZZZ_NONKIN_BIOG_ADDR.c_node_dy) " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_personid) " + _
        "ON ZZ_SCRATCH_PEOPLE_1.c_person_id = ZZZ_NONKIN_BIOG_ADDR.c_node_id) " + _
        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_NONKIN_BIOG_ADDR.c_node_addr_id) " + _
        "ON ZZ_SCRATCH_ASSOC_FILTER.c_assoc_code = ZZZ_NONKIN_BIOG_ADDR.c_link_code "

    ' (16) Final restricted search:        Non-restricted KINSHIP starting with a people list (with and without dynast
y restrictions)

      tQueryKinLastFromStr = "FROM ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1 INNER JOIN " + _
          "(ZZ_SCRATCH_PEOPLE INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
          "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_KIN_BIOG_ADDR.c_personid) " + _
          "ON ZZ_SCRATCH_PEOPLE_1.c_person_id = ZZZ_KIN_BIOG_ADDR.c_node_id "

      tQueryKinDynastyLastFromStr = "FROM ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1 INNER JOIN (ZZ_SCRATCH_PEOPLE "
+ _
           "INNER JOIN (DYNASTIES AS DYNASTIES_1 INNER JOIN (DYNASTIES INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
           "ON DYNASTIES.c_dy = ZZZ_KIN_BIOG_ADDR.c_dy) " + _
           "ON DYNASTIES_1.c_dy = ZZZ_KIN_BIOG_ADDR.c_node_dy) " + _
           "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_KIN_BIOG_ADDR.c_personid) " + _
           "ON ZZ_SCRATCH_PEOPLE_1.c_person_id = ZZZ_KIN_BIOG_ADDR.c_node_id "

    ' (17) Final restricted search: KINSHIP starting with a people list restricted by a list of address codes (
with and without dynasty restrictions)

      tQueryKinLastAddrFromStr = "FROM ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1 INNER JOIN " + _
          "(ZZ_SCRATCH_PEOPLE INNER JOIN (ZZ_SCRATCH_ADDR INNER JOIN ZZZ_KIN_BIOG_ADDR " + _
          "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_KIN_BIOG_ADDR.c_node_addr_id) " + _
          "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_KIN_BIOG_ADDR.c_personid) " + _
          "ON ZZ_SCRATCH_PEOPLE_1.c_person_id = ZZZ_KIN_BIOG_ADDR.c_node_id "

      tQueryKinLastAddrDynastyFromStr = "FROM ZZ_SCRATCH_ADDR INNER JOIN (ZZ_SCRATCH_PEOPLE AS ZZ_SCRATCH_PEOPLE_1
è¡¨ - 51

" + _
        "INNER JOIN (ZZ_SCRATCH_PEOPLE INNER JOIN (DYNASTIES AS DYNASTIES_1 INNER JOIN (DYNASTIES INNER JOIN ZZZ_
KIN_BIOG_ADDR " + _
        "ON DYNASTIES.c_dy = ZZZ_KIN_BIOG_ADDR.c_dy) " + _
        "ON DYNASTIES_1.c_dy = ZZZ_KIN_BIOG_ADDR.c_node_dy) " + _
        "ON ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_KIN_BIOG_ADDR.c_personid) " + _
        "ON ZZ_SCRATCH_PEOPLE_1.c_person_id = ZZZ_KIN_BIOG_ADDR.c_node_id) " + _
        "ON ZZ_SCRATCH_ADDR.c_addr_id = ZZZ_KIN_BIOG_ADDR.c_node_addr_id "

    ' now determine the tables and constraints that need to be included in the query when building the WHERE par
t of the query
    '
    tNonkinWhereQueryStr = "Where ("
    tKinWhereQueryStr = "Where ("

    If gUseIndexYears Then
        tNonkinWhereQueryStr = tNonkinWhereQueryStr + _
            "((ZZZ_NONKIN_BIOG_ADDR.c_index_year)>= " + Str(TxtFrom.Value) + _
            " And (ZZZ_NONKIN_BIOG_ADDR.c_index_year)<=" + Str(TxtTo.Value) + _
            " AND (ZZZ_NONKIN_BIOG_ADDR.c_node_index_year)>=" + Str(TxtFrom.Value) + _
            " And (ZZZ_NONKIN_BIOG_ADDR.c_node_index_year)<=" + Str(TxtTo.Value) + ") "
        tKinWhereQueryStr = tKinWhereQueryStr + _
            "((ZZZ_KIN_BIOG_ADDR.c_index_year)>= " + Str(TxtFrom.Value) + _
            " And (ZZZ_KIN_BIOG_ADDR.c_index_year)<=" + Str(TxtTo.Value) + _
            " AND (ZZZ_KIN_BIOG_ADDR.c_node_index_year)>=" + Str(TxtFrom.Value) + _
            " And (ZZZ_KIN_BIOG_ADDR.c_node_index_year)<=" + Str(TxtTo.Value) + ") "
    ElseIf gUseDynasties Then
        '
        ' five possibilities (all, just from, just to, both from and to, and a cluelessly unset parameter)
        '
        '                           WHERE (((DYNASTIES.c_start)<5) AND ((DYNASTIES.c_end)>=6) AND ((DYNASTIES_1.c
_start)<7) AND ((DYNASTIES_1.c_end)>=8)
        '
        tStrToDynastyEnd = Str(gToDynastyEnd)
        tStrFromDynastyBegin = Str(gFromDynastyBegin)

           If gFromDynasty = -2 Then
               tNonkinWhereQueryStr = tNonkinWhereQueryStr + _
                   "((ZZZ_NONKIN_BIOG_ADDR.c_dy) > 0 AND (ZZZ_NONKIN_BIOG_ADDR.c_node_dy) > 0 ) "
               tKinWhereQueryStr = tKinWhereQueryStr + _
                   "((ZZZ_KIN_BIOG_ADDR.c_dy) > 0 AND (ZZZ_KIN_BIOG_ADDR.c_node_dy) > 0 ) "
           ElseIf gFromDynasty = -1 And gToDynasty > 0 Then
               tNonkinWhereQueryStr = tNonkinWhereQueryStr + _
                    "((DYNASTIES.c_start)<" + tStrToDynastyEnd + " AND (DYNASTIES_1.c_start)<" + tStrToDynastyEnd +
") "
                tKinWhereQueryStr = tKinWhereQueryStr + _
                     "((DYNASTIES.c_start)<" + tStrToDynastyEnd + " AND (DYNASTIES_1.c_start)<" + tStrToDynastyEnd +
") "
           ElseIf gFromDynasty > 0 And gToDynasty = -1 Then
               tNonkinWhereQueryStr = tNonkinWhereQueryStr + _
                    "((DYNASTIES.c_end)>" + tStrFromDynastyBegin + " AND (DYNASTIES_1.c_end)>" + tStrFromDynastyBegi
n + ") "
                tKinWhereQueryStr = tKinWhereQueryStr + _
                     "((DYNASTIES.c_end)>" + tStrFromDynastyBegin + " AND (DYNASTIES_1.c_end)>" + tStrFromDynastyBegi
n + ") "
        ElseIf gFromDynasty = gToDynasty And gFromDynasty > 0 Then
            tNonkinWhereQueryStr = tNonkinWhereQueryStr + _
                "((DYNASTIES.c_dy)=" + Str(gToDynasty) + ") "
            tKinWhereQueryStr = tKinWhereQueryStr + _
                "((DYNASTIES.c_dy)=" + Str(gToDynasty) + ") "
        ElseIf gFromDynasty > 0 And gToDynasty > 0 Then
            tNonkinWhereQueryStr = tNonkinWhereQueryStr + _
                "((DYNASTIES.c_end)>" + tStrFromDynastyBegin + " AND (DYNASTIES_1.c_end)>" + tStrFromDynastyBegin
 + ") AND " + _
                "((DYNASTIES.c_start)<" + tStrToDynastyEnd + " AND (DYNASTIES_1.c_start)<" + tStrToDynastyEnd + "
) "
            tKinWhereQueryStr = tKinWhereQueryStr + _
                "((DYNASTIES.c_end)>" + tStrFromDynastyBegin + " AND (DYNASTIES_1.c_end)>" + tStrFromDynastyBegin
 + ") AND " + _
                "((DYNASTIES.c_start)<" + tStrToDynastyEnd + " AND (DYNASTIES_1.c_start)<" + tStrToDynastyEnd + "
) "
        End If

       End If

       If ChkMale.Value = tTrue And ChkFemale.Value = tFalse Then

           If gUseIndexYears Or (gUseDynasties And Not (gFromDynasty = -1 And gToDynasty = -1)) Then
               tNonkinWhereQueryStr = tNonkinWhereQueryStr + " AND "
               tKinWhereQueryStr = tKinWhereQueryStr + " AND "
è¡¨ - 52

             End If
             tNonkinWhereQueryStr = tNonkinWhereQueryStr + "((ZZZ_NONKIN_BIOG_ADDR.c_node_female)=False) "
             tKinWhereQueryStr = tKinWhereQueryStr + "((ZZZ_KIN_BIOG_ADDR.c_node_female)=False) "

      ElseIf ChkMale.Value = tFalse And ChkFemale.Value = tTrue Then

             If gUseIndexYears Or (gUseDynasties And Not (gFromDynasty = -1 And gToDynasty = -1)) Then
                 tNonkinWhereQueryStr = tNonkinWhereQueryStr + " AND "
                 tKinWhereQueryStr = tKinWhereQueryStr + " AND "
             End If
             tNonkinWhereQueryStr = tNonkinWhereQueryStr + "((ZZZ_NONKIN_BIOG_ADDR.c_node_female)=True) "
             tKinWhereQueryStr = tKinWhereQueryStr + "((ZZZ_KIN_BIOG_ADDR.c_node_female)=True) "

      End If

      If Not (tKinWhereQueryStr = "WHERE (") Then
          tKinWhereQueryStr = tKinWhereQueryStr + "AND "
      End If

      If ChkKinshipParam.Value = tTrue Then
          'MsgBox "Up = " + Str(TxtMaxUp.Value) + " Down = " + Str(TxtMaxDwn.Value) + _
              " Mar = " + Str(Me.TxtMaxMar.Value) + " Col = " + Str(Me.TxtMaxCol.Value)
          tKinWhereFirstQueryStr = tKinWhereQueryStr + _
          "(([ZZZ_KIN_BIOG_ADDR].[c_upstep]<= " + Str(TxtMaxUp.Value) + ") " + _
          "AND ([ZZZ_KIN_BIOG_ADDR].[c_dwnstep]<= " + Str(TxtMaxDwn.Value) + ") " + _
          "AND ([ZZZ_KIN_BIOG_ADDR].[c_marstep]<= " + Str(Me.TxtMaxMar.Value) + ") " + _
          "AND ([ZZZ_KIN_BIOG_ADDR].[c_colstep]<= " + Str(Me.TxtMaxCol.Value) + ")) "

             tKinWhereQueryStr = tKinWhereFirstQueryStr + "AND ([ZZ_SCRATCH_PEOPLE].[c_node_dist]="

      Else
          tKinWhereQueryStr = tKinWhereQueryStr + "([ZZ_SCRATCH_PEOPLE].[c_node_dist]="
          If tKinWhereQueryStr = " WHERE (" Then
               tKinWhereFirstQueryStr = ""
          Else
               tKinWhereFirstQueryStr = tKinWhereQueryStr
          End If
      End If
      '
      ' In the new version, I filter out all node IDs with 0 for the non-kin search
      '

      If tNonkinWhereQueryStr = "WHERE (" Then
          tNonkinWhereQueryStr = "WHERE ((ZZZ_NONKIN_BIOG_ADDR.c_node_id > 0) AND ([ZZ_SCRATCH_PEOPLE].[c_node_dist
]="
             tNonkinWhereFirstQueryStr = "WHERE (ZZZ_NONKIN_BIOG_ADDR.c_node_id > 0)"
      Else
        tNonkinWhereFirstQueryStr = tNonkinWhereQueryStr + " AND (ZZZ_NONKIN_BIOG_ADDR.c_node_id > 0))"
        tNonkinWhereQueryStr = tNonkinWhereQueryStr + "AND (ZZZ_NONKIN_BIOG_ADDR.c_node_id > 0) AND ([ZZ_SCRATCH_
PEOPLE].[c_node_dist]="
    End If

      ' Now handle the 8 combinations of possibilities in defining the query using the three pieces

      If gUseFilter = tTrue Then

        If gUsePersonID Then
             '
             If gUseADDRID Then
                 '
                 ' uses ZZ_NETWORK_LIST from the start, uses the address and the assoc filters
                 '
                 'MsgBox "This query uses people, address, and assoc filter..."
                 If Me.ChkNonKin.Value = tTrue Then
                     If Me.ChkPlaceLimit.Value Then
                          If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                               tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAddrAssocDynastyFromStr + tNonkinWh
ereQueryStr
                               tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAddrAssocDynastyFromStr + t
NonkinWhereQueryStr
                          Else
                               tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAddrAssocFromStr + tNonkinWhereQuer
yStr
                               tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAddrAssocFromStr + tNonkinW
hereQueryStr
                          End If
                     Else
                          If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                               tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAssocDynastyFromStr + tNonkinWhereQ
ueryStr
è¡¨ - 53

                                        If gMaxNodeDist = 0 Then
                                            tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAddrAssocDynastyFromStr
 + tNonkinWhereQueryStr
                                        Else
                                               tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAssocDynastyFromStr + t
NonkinWhereQueryStr
                                        End If
                                 Else
                                        tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAssocFromStr + tNonkinWhereQueryStr
                                        If gMaxNodeDist = 0 Then
                                            tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAddrAssocFromStr + tNon
kinWhereQueryStr
                                        Else
                                               tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAssocFromStr + tNonkinW
hereQueryStr
                                   End If
                               End If
                          End If
                          If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                               tQueryNonkinFirstStr = gQuerySelectNonkin + tQueryAssocAddrAssocDynastyFromStr + _
                                   tNonkinWhereQueryStr + "0))"
                          Else
                               tQueryNonkinFirstStr = gQuerySelectNonkin + tQueryAssocAddrAssocFromStr + _
                                   tNonkinWhereQueryStr + "0))"
                          End If
                      End If

                      If ChkKin.Value = tTrue Then
                          If Me.ChkPlaceLimit.Value Then
                              If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                                  tQueryKinStr = gQuerySelectKin + tQueryKinAddrDynastyFromStr + tKinWhereQueryStr
                                  tQueryKinLastStr = gQuerySelectKin + tQueryKinLastAddrDynastyFromStr + tKinWhereQuery
Str
                                 Else
                                     tQueryKinStr = gQuerySelectKin + tQueryKinAddrFromStr + tKinWhereQueryStr
                                     tQueryKinLastStr = gQuerySelectKin + tQueryKinLastAddrFromStr + tKinWhereQueryStr
                                 End If
                          Else
                                 If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                                     tQueryKinStr = gQuerySelectKin + tQueryKinDynastyFromStr + tKinWhereQueryStr
                                     If gMaxNodeDist = 0 Then
                                         tQueryKinLastStr = gQuerySelectKin + tQueryKinLastAddrDynastyFromStr + tKinWhereQ
ueryStr
                                        Else
                                               tQueryKinLastStr = gQuerySelectKin + tQueryKinDynastyLastFromStr + tKinWhereQuery
Str
                                        End If
                                 Else
                                  tQueryKinStr = gQuerySelectKin + tQueryKinFromStr + tKinWhereQueryStr
                                  If gMaxNodeDist = 0 Then
                                       tQueryKinLastStr = gQuerySelectKin + tQueryKinLastAddrFromStr + tKinWhereQueryStr
                                  Else
                                       tQueryKinLastStr = gQuerySelectKin + tQueryKinLastFromStr + tKinWhereQueryStr
                                  End If
                              End If
                          End If
                          If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                              tQueryKinFirstStr = gQuerySelectKin + tQueryKinAddrDynastyFromStr + tKinWhereQueryStr + "
0))"
                          Else
                              tQueryKinFirstStr = gQuerySelectKin + tQueryKinAddrFromStr + tKinWhereQueryStr + "0))"
                          End If
                      End If
               Else
                      '
                      ' uses ZZ_NETWORK_LIST from the start, uses the assoc filters but NOT the address
                      '
                      'MsgBox "This query uses people, (NO address), and assoc filter..."
                      If Me.ChkNonKin.Value = tTrue Then
                          If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                              tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAssocDynastyFromStr + tNonkinWhereQuery
Str
                                 tQueryNonkinFirstStr = tQueryNonkinStr + "0))"
                                 tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAssocDynastyFromStr + tNonkinWh
ereQueryStr
                          Else
                                 tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAssocFromStr + tNonkinWhereQueryStr
                                 tQueryNonkinFirstStr = tQueryNonkinStr + "0))"
                                 tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAssocFromStr + tNonkinWhereQuer
yStr
è¡¨ - 54

                          End If
                      End If

                      If ChkKin.Value = tTrue Then
                          If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                               tQueryKinStr = gQuerySelectKin + tQueryKinDynastyFromStr + tKinWhereQueryStr
                               tQueryKinFirstStr = tQueryKinStr + "0))"
                               tQueryKinLastStr = gQuerySelectKin + tQueryKinDynastyLastFromStr + tKinWhereQueryStr
                          Else
                               tQueryKinStr = gQuerySelectKin + tQueryKinFromStr + tKinWhereQueryStr
                               tQueryKinFirstStr = tQueryKinStr + "0))"
                               tQueryKinLastStr = gQuerySelectKin + tQueryKinLastFromStr + tKinWhereQueryStr
                          End If
                      End If
                  End If
           Else
                  If gUseADDRID Then
                      '
                      ' does NOT use ZZ_NETWORK_LIST at first, uses the address and the assoc filters
                      '
                      'MsgBox "This query uses (NO people), address, and assoc filter..."
                      If Me.ChkNonKin.Value = tTrue Then
                          If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                              tQueryNonkinFirstStr = tQuerySelectFirstNonkin + tQueryAssocFirstAddrAssocDynastyFromStr
+ _
                                        tNonkinWhereFirstQueryStr
                          Else
                              tQueryNonkinFirstStr = tQuerySelectFirstNonkin + tQueryAssocFirstAddrAssocFromStr + _
                                  tNonkinWhereFirstQueryStr
                          End If

                          If ChkPlaceLimit.Value Then
                              If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                                  tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAddrAssocDynastyFromStr + tNonkinWh
ereQueryStr
                                        tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAddrAssocDynastyFromStr + t
NonkinWhereQueryStr
                                 Else
                                        tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAddrAssocFromStr + tNonkinWhereQuer
yStr
                                        tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAddrAssocFromStr + tNonkinW
hereQueryStr
                                 End If
                          Else
                                 If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                                     tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAssocDynastyFromStr + tNonkinWhereQ
ueryStr
                                        tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAssocDynastyFromStr + tNonk
inWhereQueryStr
                                 Else
                                        tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAssocFromStr + tNonkinWhereQueryStr
                                        tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAssocFromStr + tNonkinWhere
QueryStr
                              End If
                          End If
                      End If

                      If ChkKin.Value = tTrue Then
                          If ChkPlaceLimit.Value Then
                              If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                                  tQueryKinStr = gQuerySelectKin + tQueryKinAddrDynastyFromStr + tKinWhereQueryStr
                                  tQueryKinLastStr = gQuerySelectKin + tQueryKinLastAddrDynastyFromStr + tKinWhereQuery
Str
                                 Else
                                     tQueryKinStr = gQuerySelectKin + tQueryKinAddrFromStr + tKinWhereQueryStr
                                     tQueryKinLastStr = gQuerySelectKin + tQueryKinLastAddrFromStr + tKinWhereQueryStr
                                 End If
                          Else
                              If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                                   tQueryKinStr = gQuerySelectKin + tQueryKinDynastyFromStr + tKinWhereQueryStr
                                   tQueryKinLastStr = gQuerySelectKin + tQueryKinDynastyLastFromStr + tKinWhereQueryStr
                              Else
                                   tQueryKinStr = gQuerySelectKin + tQueryKinFromStr + tKinWhereQueryStr
                                   tQueryKinLastStr = gQuerySelectKin + tQueryKinLastFromStr + tKinWhereQueryStr
                              End If
                          End If

                          If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                              tQueryKinFirstStr = gQuerySelectKin + tQueryKinAddrDynastyFromStr + tKinWhereQueryStr + "
0))"
è¡¨ - 55

                             Else
                                 tQueryKinFirstStr = gQuerySelectKin + tQueryKinAddrFromStr + tKinWhereQueryStr + "0))"
                             End If
                         End If
                  Else
                         '
                         ' does NOT use ZZ_NETWORK_LIST from the start, uses the assoc filter but NOT address
                         '
                         'MsgBox "This query uses (NO people), (NO address), and assoc filter..."
                         If Me.ChkNonKin.Value = tTrue Then
                             If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                                 tQueryNonkinFirstStr = tQuerySelectFirstNonkin + tQueryAssocFirstAssocDynastyFromStr + _
                                     tNonkinWhereFirstQueryStr
                                 tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAssocDynastyFromStr + tNonkinWhereQuery
Str
                                    tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAssocDynastyFromStr + tNonkinWh
ereQueryStr
                             Else
                                    tQueryNonkinFirstStr = tQuerySelectFirstNonkin + tQueryAssocFirstAssocFromStr + _
                                        tNonkinWhereFirstQueryStr
                                    tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAssocFromStr + tNonkinWhereQueryStr
                                    tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAssocFromStr + tNonkinWhereQuer
yStr
                             End If
                         End If

                      If ChkKin.Value = tTrue Then
                          If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                               tQueryKinStr = gQuerySelectKin + tQueryKinDynastyFromStr + tKinWhereQueryStr
                               tQueryKinFirstStr = tQueryKinStr + "0))"
                               tQueryKinLastStr = gQuerySelectKin + tQueryKinDynastyLastFromStr + tKinWhereQueryStr
                          Else
                               tQueryKinStr = gQuerySelectKin + tQueryKinFromStr + tKinWhereQueryStr
                               tQueryKinFirstStr = tQueryKinStr + "0))"
                               tQueryKinLastStr = gQuerySelectKin + tQueryKinLastFromStr + tKinWhereQueryStr
                          End If
                      End If
                  End If
              End If
       Else
        If gUsePersonID Then
            If gUseADDRID Then
                '
                ' uses ZZ_NETWORK_LIST from the start, uses the address but NOT the assoc filters
                '
                'MsgBox "This query uses people, address, and (NO assoc filter)..."
                If Me.ChkNonKin.Value = tTrue Then
                    If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                         tQueryNonkinFirstStr = gQuerySelectNonkin + tQueryAssocAddrDynastyFromStr + tNonkinWhereQ
ueryStr + _
                                  "0))"
                    Else
                         tQueryNonkinFirstStr = gQuerySelectNonkin + tQueryAssocAddrFromStr + tNonkinWhereQueryStr
 + _
                                  "0))"
                    End If
                    If ChkPlaceLimit.Value Then
                         If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                              tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAddrDynastyFromStr + tNonkinWhereQu
eryStr
                              tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAddrDynastyFromStr + tNonki
nWhereQueryStr
                         Else
                              tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAddrFromStr + tNonkinWhereQueryStr
                              tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAddrFromStr + tNonkinWhereQ
ueryStr
                         End If
                    Else
                         If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                              tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocDynastyFromStr + tNonkinWhereQueryS
tr
                              tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocDynastyLastFromStr + tNonkinWhe
reQueryStr
                         Else
                              tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocFromStr + tNonkinWhereQueryStr
                              tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastFromStr + tNonkinWhereQuery
Str
                         End If
                    End If
                End If
è¡¨ - 56


                      If ChkKin.Value = tTrue Then
                          If ChkPlaceLimit.Value Then
                              If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                                  tQueryKinStr = gQuerySelectKin + tQueryKinAddrDynastyFromStr + tKinWhereQueryStr
                                  tQueryKinLastStr = gQuerySelectKin + tQueryKinLastAddrDynastyFromStr + tKinWhereQuery
Str
                                 Else
                                     tQueryKinStr = gQuerySelectKin + tQueryKinAddrFromStr + tKinWhereQueryStr
                                     tQueryKinLastStr = gQuerySelectKin + tQueryKinLastAddrFromStr + tKinWhereQueryStr
                                 End If
                          Else
                              If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                                   tQueryKinStr = gQuerySelectKin + tQueryKinDynastyFromStr + tKinWhereQueryStr
                                   tQueryKinLastStr = gQuerySelectKin + tQueryKinDynastyLastFromStr + tKinWhereQueryStr
                              Else
                                   tQueryKinStr = gQuerySelectKin + tQueryKinFromStr + tKinWhereQueryStr
                                   tQueryKinLastStr = gQuerySelectKin + tQueryKinLastFromStr + tKinWhereQueryStr
                              End If
                          End If

                          If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                              tQueryKinFirstStr = gQuerySelectKin + tQueryKinAddrDynastyFromStr + tKinWhereQueryStr + "
0))"
                          Else
                               tQueryKinFirstStr = gQuerySelectKin + tQueryKinAddrFromStr + tKinWhereQueryStr + "0))"
                           End If
                     End If
                  Else
                       '
                       ' uses ZZ_NETWORK_LIST from the start but does NOT use EITHER the address or the assoc filters
                       '
                       'MsgBox "This query uses people, (NO address), and (NO assoc filter)..."
                       If Me.ChkNonKin.Value = tTrue Then
                           If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                               tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocDynastyFromStr + tNonkinWhereQueryStr
                               tQueryNonkinFirstStr = gQuerySelectNonkin + tQueryAssocDynastyFromStr + tNonkinWhereQuery
Str + "0))"
                                 tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocDynastyLastFromStr + tNonkinWhereQu
eryStr
                          Else
                                 tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocFromStr + tNonkinWhereQueryStr
                                 tQueryNonkinFirstStr = gQuerySelectNonkin + tQueryAssocFromStr + tNonkinWhereQueryStr + "
0))"
                              tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastFromStr + tNonkinWhereQueryStr
                          End If
                      End If

                      If ChkKin.Value = tTrue Then
                          If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                               tQueryKinStr = gQuerySelectKin + tQueryKinDynastyFromStr + tKinWhereQueryStr
                               tQueryKinFirstStr = tQueryKinStr + "0))"
                               tQueryKinLastStr = gQuerySelectKin + tQueryKinDynastyLastFromStr + tKinWhereQueryStr
                          Else
                               tQueryKinStr = gQuerySelectKin + tQueryKinFromStr + tKinWhereQueryStr
                               tQueryKinFirstStr = tQueryKinStr + "0))"
                               tQueryKinLastStr = gQuerySelectKin + tQueryKinLastFromStr + tKinWhereQueryStr
                          End If
                      End If
                  End If
           Else
                  If gUseADDRID Then
                      '
                      ' does NOT use ZZ_NETWORK_LIST at first, uses the address but NOT the assoc filters
                      '
                      'MsgBox "This query uses (NO people), address, and (NO assoc filter)..."
                      If Me.ChkNonKin.Value = tTrue Then
                          If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                               tQueryNonkinFirstStr = tQuerySelectFirstNonkin + tQueryAssocFirstAddrDynastyFromStr + _
                                   tNonkinWhereFirstQueryStr
                          Else
                               tQueryNonkinFirstStr = tQuerySelectFirstNonkin + tQueryAssocFirstAddrFromStr + _
                                   tNonkinWhereFirstQueryStr
                          End If

                          If ChkPlaceLimit.Value Then
                              If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                                  tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAddrDynastyFromStr + tNonkinWhereQu
eryStr
                                        tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAddrDynastyFromStr + tNonki
è¡¨ - 57

nWhereQueryStr
                                Else
                                       tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocAddrFromStr + tNonkinWhereQueryStr
                                       tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastAddrFromStr + tNonkinWhereQ
ueryStr
                                End If
                         Else
                                If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                                    tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocDynastyFromStr + tNonkinWhereQueryS
tr
                                       tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocDynastyLastFromStr + tNonkinWhe
reQueryStr
                                Else
                                       tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocFromStr + tNonkinWhereQueryStr
                                       tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastFromStr + tNonkinWhereQuery
Str
                            End If
                        End If
                    End If

                    If ChkKin.Value = tTrue Then
                        If ChkPlaceLimit.Value Then
                            If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                                tQueryKinStr = gQuerySelectKin + tQueryKinAddrDynastyFromStr + tKinWhereQueryStr
                                tQueryKinLastStr = gQuerySelectKin + tQueryKinLastAddrDynastyFromStr + tKinWhereQuery
Str
                                Else
                                    tQueryKinStr = gQuerySelectKin + tQueryKinAddrFromStr + tKinWhereQueryStr
                                    tQueryKinLastStr = gQuerySelectKin + tQueryKinLastAddrFromStr + tKinWhereQueryStr
                                End If
                         Else
                             If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                                  tQueryKinStr = gQuerySelectKin + tQueryKinDynastyFromStr + tKinWhereQueryStr
                                  tQueryKinLastStr = gQuerySelectKin + tQueryKinDynastyLastFromStr + tKinWhereQueryStr
                             Else
                                  tQueryKinStr = gQuerySelectKin + tQueryKinFromStr + tKinWhereQueryStr
                                  tQueryKinLastStr = gQuerySelectKin + tQueryKinLastFromStr + tKinWhereQueryStr
                             End If
                         End If

                         If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                             tQueryKinFirstStr = gQuerySelectKin + tQueryKinAddrDynastyFromStr + tKinWhereQueryStr + "
0))"
                         Else
                            tQueryKinFirstStr = gQuerySelectKin + tQueryKinAddrFromStr + tKinWhereQueryStr + "0))"
                        End If
                    End If
             Else
                    '
                    '   does NOT uses ZZ_NETWORK_LIST from the start, and does NOT use the address or the assoc filter
s
                    ' This, by the way, should never happen unless someone wants all the records in the system
                    '
                    'MsgBox "This query uses (NO people), (NO address), and (NO assoc filter)..."
                    If Me.ChkNonKin.Value = tTrue Then
                        If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                        Else
                             tQueryNonkinFirstStr = tQuerySelectFirstNonkin + tQueryAssocDynastyFirstFromStr + _
                                 tNonkinWhereFirstQueryStr
                             tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocDynastyFromStr + tNonkinWhereQueryStr
                             tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocDynastyLastFromStr + tNonkinWhereQu
eryStr
                        End If
                            tQueryNonkinFirstStr = tQuerySelectFirstNonkin + tQueryAssocFirstFromStr + _
                                tNonkinWhereFirstQueryStr
                            tQueryNonkinStr = gQuerySelectNonkin + tQueryAssocFromStr + tNonkinWhereQueryStr
                            tQueryNonkinLastStr = gQuerySelectNonkin + tQueryAssocLastFromStr + tNonkinWhereQueryStr
                    End If

                    If ChkKin.Value = tTrue Then
                        If gUseDynasties And (gFromDynasty > -1 Or gToDynasty > -1) Then
                             tQueryKinStr = gQuerySelectKin + tQueryKinDynastyFromStr + tKinWhereQueryStr
                             tQueryKinFirstStr = tQueryKinStr + "0))"
                             tQueryKinLastStr = gQuerySelectKin + tQueryKinDynastyLastFromStr + tKinWhereQueryStr
                        Else
                             tQueryKinStr = gQuerySelectKin + tQueryKinFromStr + tKinWhereQueryStr
                             tQueryKinFirstStr = tQueryKinStr + "0))"
                             tQueryKinLastStr = gQuerySelectKin + tQueryKinLastFromStr + tKinWhereQueryStr
                        End If
                    End If
è¡¨ - 58

               End If
           End If
       End If

       '
       ' the query for moving the records
       '
       tQueryAppendStr = "INSERT INTO ZZ_NETWORK_LIST ( c_personid, c_node_id, c_edge_id, c_edge_type, c_up_total, "
 + _
           "c_down_total, c_col_total, c_mar_total, c_distance, c_delete ) " + _
           "SELECT ZZ_NETWORK_LIST_TMP.c_personid, ZZ_NETWORK_LIST_TMP.c_node_id, ZZ_NETWORK_LIST_TMP.c_edge_id, " +
 _
           "ZZ_NETWORK_LIST_TMP.c_edge_type, ZZ_NETWORK_LIST_TMP.c_up_total, ZZ_NETWORK_LIST_TMP.c_down_total, " + _
           "ZZ_NETWORK_LIST_TMP.c_col_total, ZZ_NETWORK_LIST_TMP.c_mar_total, ZZ_NETWORK_LIST_TMP.c_distance, " + _
           "0 as c_delete FROM ZZ_NETWORK_LIST_TMP"

       '   since the person ID in the query results already is in ZZ_NETWORK_LIST, the question is
       '   whether the c_node_id is in the list: if YES, then set c_node_dist at the current level

       tNodeDistQueryStr = "UPDATE ZZ_NETWORK_LIST INNER JOIN ZZ_SCRATCH_PEOPLE ON " + _
               "ZZ_NETWORK_LIST.c_node_id = ZZ_SCRATCH_PEOPLE.c_person_id " + _
               "SET ZZ_NETWORK_LIST.c_node_dist = [ZZ_SCRATCH_PEOPLE].[c_node_dist] " + _
               "WHERE ((ZZ_NETWORK_LIST.c_node_dist) Is Null)"
       '
       ' for insurance, explicitly delete duplicate results
       '
       tPruneTmpQuery = "UPDATE ZZ_NETWORK_LIST INNER JOIN ZZ_NETWORK_LIST_TMP ON " + _
           "(ZZ_NETWORK_LIST.c_edge_type = ZZ_NETWORK_LIST_TMP.c_edge_type) AND " + _
           "(ZZ_NETWORK_LIST.c_edge_id = ZZ_NETWORK_LIST_TMP.c_edge_id) AND " + _
           "(ZZ_NETWORK_LIST.c_node_id = ZZ_NETWORK_LIST_TMP.c_node_id) AND " + _
           "(ZZ_NETWORK_LIST.c_personid = ZZ_NETWORK_LIST_TMP.c_personid) " + _
           "SET ZZ_NETWORK_LIST_TMP.c_delete = 1;"

    tPruneTmpQueryDupesStr = "UPDATE ZZ_NETWORK_LIST_TMP AS ZZ_NETWORK_LIST_TMP_1 INNER JOIN " + _
        "ZZ_NETWORK_LIST_TMP ON (ZZ_NETWORK_LIST_TMP_1.c_personid = ZZ_NETWORK_LIST_TMP.c_personid) " + _
        "AND (ZZ_NETWORK_LIST_TMP_1.c_node_id = ZZ_NETWORK_LIST_TMP.c_node_id) " + _
        "AND (ZZ_NETWORK_LIST_TMP_1.c_edge_id = ZZ_NETWORK_LIST_TMP.c_edge_id) " + _
        "AND (ZZ_NETWORK_LIST_TMP_1.c_edge_type = ZZ_NETWORK_LIST_TMP.c_edge_type) " + _
        "SET ZZ_NETWORK_LIST_TMP.c_delete = 1 " + _
        "WHERE (([ZZ_NETWORK_LIST_TMP].[c_up_total]*1000+[ZZ_NETWORK_LIST_TMP].[c_down_total]*100+[ZZ_NETWORK_LIS
T_TMP].[c_col_total]*10+[ZZ_NETWORK_LIST_TMP].[c_mar_total]>" + _
        "[ZZ_NETWORK_LIST_TMP_1].[c_up_total]*1000+[ZZ_NETWORK_LIST_TMP_1].[c_down_total]*100+[ZZ_NETWORK_LIST_TM
P_1].[c_col_total]*10+[ZZ_NETWORK_LIST_TMP_1].[c_mar_total]))"

       tQueryPruneTmpAssocInverse1Str = "UPDATE (ZZ_NETWORK_LIST_TMP INNER JOIN ZZ_NETWORK_LIST ON " + _
           "(ZZ_NETWORK_LIST_TMP.c_edge_type = ZZ_NETWORK_LIST.c_edge_type) AND " + _
           "(ZZ_NETWORK_LIST_TMP.c_node_id = ZZ_NETWORK_LIST.c_personid) AND " + _
           "(ZZ_NETWORK_LIST_TMP.c_personid = ZZ_NETWORK_LIST.c_node_id)) " + _
           "INNER JOIN ASSOC_CODES ON (ZZ_NETWORK_LIST_TMP.c_edge_id = ASSOC_CODES.c_assoc_pair) AND " + _
           "(ZZ_NETWORK_LIST.c_edge_id = ASSOC_CODES.c_assoc_code) " + _
           "SET ZZ_NETWORK_LIST_TMP.c_delete = 1"

       tQueryPruneTmpAssocInverse2Str = "UPDATE (ZZ_NETWORK_LIST_TMP INNER JOIN ZZ_NETWORK_LIST_TMP AS " + _
           "ZZ_NETWORK_LIST_TMP_1 ON (ZZ_NETWORK_LIST_TMP.c_personid = ZZ_NETWORK_LIST_TMP_1.c_node_id) AND " + _
           "(ZZ_NETWORK_LIST_TMP.c_node_id = ZZ_NETWORK_LIST_TMP_1.c_personid) AND " + _
           "(ZZ_NETWORK_LIST_TMP.c_edge_type = ZZ_NETWORK_LIST_TMP_1.c_edge_type)) " + _
           "INNER JOIN ASSOC_CODES ON (ZZ_NETWORK_LIST_TMP.c_edge_id = ASSOC_CODES.c_assoc_code) AND " + _
           "(ZZ_NETWORK_LIST_TMP_1.c_edge_id = ASSOC_CODES.c_assoc_pair) " + _
           "SET ZZ_NETWORK_LIST_TMP.c_delete = 1 " + _
           "WHERE (((ZZ_NETWORK_LIST_TMP.c_edge_type)='N') AND (ASSOC_CODES.c_assoc_role_type = 'M') AND " + _
           "((ZZ_NETWORK_LIST_TMP.c_personid)>[ZZ_NETWORK_LIST_TMP_1].[c_personid]))"
       '
       tQueryPruneTmpAssocInverse3Str = "UPDATE (ZZ_NETWORK_LIST_TMP INNER JOIN ZZ_NETWORK_LIST_TMP AS " + _
           "ZZ_NETWORK_LIST_TMP_1 ON (ZZ_NETWORK_LIST_TMP.c_personid = ZZ_NETWORK_LIST_TMP_1.c_node_id) AND " + _
           "(ZZ_NETWORK_LIST_TMP.c_node_id = ZZ_NETWORK_LIST_TMP_1.c_personid) AND " + _
           "(ZZ_NETWORK_LIST_TMP.c_edge_type = ZZ_NETWORK_LIST_TMP_1.c_edge_type)) " + _
           "INNER JOIN ASSOC_CODES ON (ZZ_NETWORK_LIST_TMP.c_edge_id = ASSOC_CODES.c_assoc_code) AND " + _
           "(ZZ_NETWORK_LIST_TMP_1.c_edge_id = ASSOC_CODES.c_assoc_pair) " + _
           "SET ZZ_NETWORK_LIST_TMP.c_delete = 1 " + _
           "WHERE (((ZZ_NETWORK_LIST_TMP.c_edge_type)='N') AND " + _
           "(ASSOC_CODES.c_assoc_role_type = 'P'))"
       '
       tQueryPruneTmpKinInverse1Str = "UPDATE (KINSHIP_CODES INNER JOIN ZZ_NETWORK_LIST ON " + _
           "KINSHIP_CODES.c_kincode = ZZ_NETWORK_LIST.c_edge_id) INNER JOIN ZZ_NETWORK_LIST_TMP ON " + _
           "(ZZ_NETWORK_LIST_TMP.c_edge_id = KINSHIP_CODES.c_kin_pair1) AND " + _
           "(ZZ_NETWORK_LIST.c_edge_type = ZZ_NETWORK_LIST_TMP.c_edge_type) AND " + _
           "(ZZ_NETWORK_LIST.c_personid = ZZ_NETWORK_LIST_TMP.c_node_id) AND " + _
           "(ZZ_NETWORK_LIST.c_node_id = ZZ_NETWORK_LIST_TMP.c_personid) SET ZZ_NETWORK_LIST_TMP.c_delete = 1"

       tQueryPruneTmpKinInverse2Str = "UPDATE (KINSHIP_CODES INNER JOIN ZZ_NETWORK_LIST ON " + _
è¡¨ - 59

           "KINSHIP_CODES.c_kincode = ZZ_NETWORK_LIST.c_edge_id) INNER JOIN ZZ_NETWORK_LIST_TMP ON " + _
           "(ZZ_NETWORK_LIST_TMP.c_edge_id = KINSHIP_CODES.c_kin_pair2) AND " + _
           "(ZZ_NETWORK_LIST.c_edge_type = ZZ_NETWORK_LIST_TMP.c_edge_type) AND " + _
           "(ZZ_NETWORK_LIST.c_personid = ZZ_NETWORK_LIST_TMP.c_node_id) AND " + _
           "(ZZ_NETWORK_LIST.c_node_id = ZZ_NETWORK_LIST_TMP.c_personid) SET ZZ_NETWORK_LIST_TMP.c_delete = 1"

    tQueryPruneTmpKinInverse3Str = "UPDATE KINSHIP_CODES INNER JOIN (ZZ_NETWORK_LIST_TMP AS ZZ_NETWORK_LIST_TMP_1
 INNER JOIN " + _
        "ZZ_NETWORK_LIST_TMP ON (ZZ_NETWORK_LIST_TMP_1.c_node_id = ZZ_NETWORK_LIST_TMP.c_personid) AND " + _
        "(ZZ_NETWORK_LIST_TMP_1.c_personid = ZZ_NETWORK_LIST_TMP.c_node_id)) ON KINSHIP_CODES.c_kincode = " + _
        "ZZ_NETWORK_LIST_TMP.c_edge_id SET ZZ_NETWORK_LIST_TMP.c_delete = 1 " + _
        "WHERE (((ZZ_NETWORK_LIST_TMP.c_edge_type)='K') AND " + _
        "((ZZ_NETWORK_LIST_TMP.c_personid)>[ZZ_NETWORK_LIST_TMP_1].[c_personid]) AND " + _
        "((ZZ_NETWORK_LIST_TMP_1.c_edge_id)=[KINSHIP_CODES].[c_kin_pair1] " + _
        "OR (ZZ_NETWORK_LIST_TMP_1.c_edge_id)=[KINSHIP_CODES].[c_kin_pair2])) "

    ' the basic loop is to start with the first person in gRstPersonID
    ' and march through to the end. It will grow as the search continues
    '
    tDebug = 1
    If tDebug = 1 Then
        cmdSQL.CommandText = "DELETE * FROM ZZ_DEBUG"
        cmdSQL.Execute tRecCountKin
    End If
    tLoop = 1
    tRecCountKin = 1
    tRecCountNonkin = 1
    '
    Do While tLoop <= gMaxNodeDist + 1 And (tRecCountKin + tRecCountNonkin) > 0
        If Me.ChkNonKin.Value = tTrue Then
            'MsgBox "About to run Non-kin query"
            If tLoop = 1 Then
                 If gMaxNodeDist = 0 Then
                      'MsgBox tQueryNonkinFirstStr
                      cmdSQL.CommandText = tQueryNonkinLastStr + "0))"
                 Else
                      'MsgBox tQueryNonkinFirstStr
                      cmdSQL.CommandText = tQueryNonkinFirstStr
                 End If
            ElseIf tLoop = gMaxNodeDist + 1 Then
                 'MsgBox tQueryNonkinLastStr
                 cmdSQL.CommandText = tQueryNonkinLastStr + Str(gMaxNodeDist) + "))"
            Else

                   'MsgBox tQueryNonkinStr
                   cmdSQL.CommandText = tQueryNonkinStr + Str(tLoop - 1) + "))"
               End If
               '
               ' run the query
               '
               'MsgBox "gUseIndexYears = " + IIf(gUseIndexYears, "True", "False")
               'MsgBox Right(cmdSQL.CommandText, 300)
               '
               cmdSQL.Execute tRecCount
               '
               ' mark the internal dupes created by path dependencies
               '
               'MsgBox "Prune step 1"
               cmdSQL.CommandText = tPruneTmpQueryDupesStr
               cmdSQL.Execute tRecCount
               '
               ' remove duplicates
               '
               'MsgBox "Prune step 2"
               cmdSQL.CommandText = tPruneTmpQuery
               cmdSQL.Execute tRecCount

               '   remove the inverse dupes between ZZ_NETWORK_LIST and ZZ_NETWORK_LIST_TMP

               'MsgBox "Prune step 3"
               cmdSQL.CommandText = tQueryPruneTmpAssocInverse1Str
               cmdSQL.Execute tRecCount

               cmdSQL.CommandText = "Delete * from ZZ_NETWORK_LIST_TMP where c_delete = 1"
               cmdSQL.Execute tRecCount

               '   remove the inverse dupes internal to ZZ_NETWORK_LIST_TMP

               'MsgBox "Prune step 4"
               cmdSQL.CommandText = tQueryPruneTmpAssocInverse2Str
è¡¨ - 60

                  cmdSQL.Execute tRecCount

                  cmdSQL.CommandText = tQueryPruneTmpAssocInverse3Str
                  cmdSQL.Execute tRecCount

                  cmdSQL.CommandText = "Delete * from ZZ_NETWORK_LIST_TMP where c_delete = 1"
                  cmdSQL.Execute tRecCount
                  '
                  ' transfer the results
                  '
                  'MsgBox "Transferring results"
                  cmdSQL.CommandText = tQueryAppendStr
                  cmdSQL.Execute tRecCountNonkin
                  '
                  ' clear the scratch table

                  cmdSQL.CommandText = "Delete * from ZZ_NETWORK_LIST_TMP"
                  cmdSQL.Execute tRecDeleted
                  '
           Else
               tRecCountNonkin = 0
           End If

           If ChkKin.Value = tTrue Then
               '
               'MsgBox "About to run Kin query"
               If tLoop = 1 Then
                    If gMaxNodeDist = 0 Then
                         'MsgBox tQueryKinFirstStr
                         cmdSQL.CommandText = tQueryKinLastStr + "0))"
                    Else
                         'MsgBox tQueryKinFirstStr
                         cmdSQL.CommandText = tQueryKinFirstStr
                    End If
               ElseIf tLoop = gMaxNodeDist + 1 Then
                    'MsgBox tQueryKinLastStr
                    cmdSQL.CommandText = tQueryKinLastStr + Str(gMaxNodeDist) + "))"
               Else

                      'MsgBox tQueryKinStr
                      cmdSQL.CommandText = tQueryKinStr + Str(tLoop - 1) + "))"
                  End If
                  '
                  ' run the query
                  '
                  cmdSQL.Execute tRecCount
                  '
                  ' mark the internal dupes created by path dependencies
                  '
                  cmdSQL.CommandText = tPruneTmpQueryDupesStr
                  cmdSQL.Execute tRecCount
                  '
                  ' remove duplicates with ZZ_NETWORK_LIST
                  '
                  cmdSQL.CommandText = tPruneTmpQuery
                  cmdSQL.Execute tRecCount
                  '
                  ' remove inverses (two possible) between ZZ_NETWORK_LIST and ZZ_NETWORK_LIST_TMP
                  '
                  cmdSQL.CommandText = tQueryPruneTmpKinInverse1Str
                  cmdSQL.Execute tRecCount
                  '
                  cmdSQL.CommandText = tQueryPruneTmpKinInverse2Str
                  cmdSQL.Execute tRecCount
                  '
                  cmdSQL.CommandText = "Delete * from ZZ_NETWORK_LIST_TMP where c_delete = 1"
                  cmdSQL.Execute tRecCount
                  '
                  ' remove inverses internal to ZZ_NETWORK_LIST_TMP
                  '
                  cmdSQL.CommandText = tQueryPruneTmpKinInverse3Str
                  cmdSQL.Execute tRecCount
                  '
                  cmdSQL.CommandText = "Delete * from ZZ_NETWORK_LIST_TMP where c_delete = 1"
                  cmdSQL.Execute tRecCount
                  '
                  ' fix the node distance
                  '
                  cmdSQL.CommandText = tNodeDistQueryStr
                  cmdSQL.Execute tRecCount
è¡¨ - 61

                  '
                  ' transfer the results
                  '
                  'MsgBox "Transferring results"
                  cmdSQL.CommandText = tQueryAppendStr
                  cmdSQL.Execute tRecCountKin
                  '
                  ' clear the scratch table

                  cmdSQL.CommandText = "Delete * from ZZ_NETWORK_LIST_TMP"
                  cmdSQL.Execute tRecDeleted
                  '
           Else
               tRecCountKin = 0
           End If
           '
           ' if the first round of searching did not include people, add names using the IDs in the person ID field
           ' Set the node distance to 1 so the next round of search (which may be unrestricted) will use them as we
ll.
           '
           If tLoop = 1 And Not gUsePersonID Then
               '
               cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_node_dist ) " + _
                   "SELECT DISTINCT ZZ_NETWORK_LIST.c_personid, 1 AS c_node_dist " + _
                   "FROM ZZ_NETWORK_LIST"
               cmdSQL.Execute tRecDeleted
               '
               ' to make the node distances match, update all c_distance values to 1 in ZZ_NETWORK_LIST
               '
               cmdSQL.CommandText = "UPDATE ZZ_NETWORK_LIST SET ZZ_NETWORK_LIST.c_distance = 1"
               cmdSQL.Execute tRecDeleted
           End If
           '
           ' now identify the new people, assign them an incremented distance, and add them to ZZ_SCRATCH_PEOPLE
           '
           'MsgBox "Adding People step 1"
           cmdSQL.CommandText = "INSERT INTO ZZ_NETWORK_LIST_TMP (c_personid) " + _
               "SELECT DISTINCT ZZ_NETWORK_LIST.c_node_id FROM ZZ_NETWORK_LIST " + _
               "WHERE (((ZZ_NETWORK_LIST.c_node_dist) Is Null))"
           cmdSQL.Execute tRecDeleted
           '
           ' now mark for deletion those which already exist in ZZ_SCRATCH_PEOPLE
           '
           'MsgBox "Adding People step 2"
           cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_PEOPLE INNER JOIN ZZ_NETWORK_LIST_TMP ON " + _
               "ZZ_SCRATCH_PEOPLE.c_person_id = ZZ_NETWORK_LIST_TMP.c_personid " + _
               "SET ZZ_NETWORK_LIST_TMP.c_delete = 1"
           cmdSQL.Execute tRecDeleted
           '
           cmdSQL.CommandText = "Delete * from ZZ_NETWORK_LIST_TMP WHERE c_delete = 1"
           cmdSQL.Execute tRecDeleted
           '
           ' now copy the new records and zap ZZ_NETWORK_LIST_TMP
           '
           'MsgBox "Adding People step 3"
           cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_PEOPLE ( c_person_id, c_node_dist ) " + _
               "SELECT ZZ_NETWORK_LIST_TMP.c_personid, " + Trim(Str(tLoop)) + _
               " AS c_node_dist FROM ZZ_NETWORK_LIST_TMP"
           cmdSQL.Execute tRecDeleted
           '
           cmdSQL.CommandText = "Delete * from ZZ_NETWORK_LIST_TMP"
           cmdSQL.Execute tRecDeleted
           '
           ' finally, update the node distances in ZZ_NETWORK_LIST
           '
           'MsgBox "Updating ZZ_NETWORK_LIST c_node_dist"
           cmdSQL.CommandText = tNodeDistQueryStr
           cmdSQL.Execute tRecDeleted

           tLoop = tLoop + 1
      Loop
      '
      ' finally, use the results to build the full records
      '
      'MsgBox "About to fill the network table with ASSOC..."
      'Set tQuery = CurrentDb.QueryDefs("ZZ_NETWORK_LIST copy ASSOC Query")
      'tQuery.Execute
      cmdSQL.CommandText = tQueryCopyNonkinStr
      cmdSQL.Execute tRecDeleted
      '
è¡¨ - 62

    'MsgBox "About to fill the network table with KIN..."
    'Set tQuery = CurrentDb.QueryDefs("ZZ_NETWORK_LIST copy KIN Query")
    'tQuery.Execute
    cmdSQL.CommandText = tQueryCopyKinStr
    cmdSQL.Execute tRecDeleted
    '
    ' to keep life simple, I add the people, source, and address information last
    '
    tQueryStr = "UPDATE ZZ_SOCIAL_NETWORK INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SOCIAL_NETWORK.c_person_id = ZZZ_BIOG_MA
IN.c_personid " + _
        "SET ZZ_SOCIAL_NETWORK.c_name = [ZZZ_BIOG_MAIN].[c_name], ZZ_SOCIAL_NETWORK.c_name_chn = [ZZZ_BIOG_MAIN].
[c_name_chn], " + _
            "ZZ_SOCIAL_NETWORK.c_index_year = [ZZZ_BIOG_MAIN].[c_index_year], ZZ_SOCIAL_NETWORK.c_index_year_type
_code = [ZZZ_BIOG_MAIN].[c_index_year_type_code], " + _
            "ZZ_SOCIAL_NETWORK.c_index_year_type_desc = [ZZZ_BIOG_MAIN].[c_index_year_type_desc], " + _
            "ZZ_SOCIAL_NETWORK.c_index_year_type_hz = [ZZZ_BIOG_MAIN].[c_index_year_type_hz], " + _
            "ZZ_SOCIAL_NETWORK.c_dy = [ZZZ_BIOG_MAIN].[c_dy], ZZ_SOCIAL_NETWORK.c_dynasty = [ZZZ_BIOG_MAIN].[c_dy
nasty], " + _
            "ZZ_SOCIAL_NETWORK.c_dynasty_chn = [ZZZ_BIOG_MAIN].[c_dynasty_chn], ZZ_SOCIAL_NETWORK.c_female = [ZZZ
_BIOG_MAIN].[c_female], " + _
            "ZZ_SOCIAL_NETWORK.c_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], ZZ_SOCIAL_NETWORK.c_addr_name = [ZZ
Z_BIOG_MAIN].[c_index_addr_name], " + _
            "ZZ_SOCIAL_NETWORK.c_addr_chn = [ZZZ_BIOG_MAIN].[c_index_addr_chn], ZZ_SOCIAL_NETWORK.c_addr_type = [
ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
            "ZZ_SOCIAL_NETWORK.c_addr_desc = [ZZZ_BIOG_MAIN].[c_index_year_type_desc], ZZ_SOCIAL_NETWORK.c_addr_d
esc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn], " + _
            "ZZ_SOCIAL_NETWORK.x_coord = [ZZZ_BIOG_MAIN].[x_coord], ZZ_SOCIAL_NETWORK.y_coord = [ZZZ_BIOG_MAIN].[
y_coord]"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecCount
    '
    tQueryStr = "UPDATE ZZ_SOCIAL_NETWORK INNER JOIN ZZZ_BIOG_MAIN ON ZZ_SOCIAL_NETWORK.c_node_id = ZZZ_BIOG_MAIN
.c_personid " + _
        "SET ZZ_SOCIAL_NETWORK.c_node_name = [ZZZ_BIOG_MAIN].[c_name], ZZ_SOCIAL_NETWORK.c_node_chn = [ZZZ_BIOG_M
AIN].[c_name_chn], " + _
            "ZZ_SOCIAL_NETWORK.c_node_index_year = [ZZZ_BIOG_MAIN].[c_index_year], " + _
            "ZZ_SOCIAL_NETWORK.c_node_index_year_type_code = [ZZZ_BIOG_MAIN].[c_index_year_type_code], " + _
            "ZZ_SOCIAL_NETWORK.c_node_index_year_type_desc = [ZZZ_BIOG_MAIN].[c_index_year_type_desc], " + _
            "ZZ_SOCIAL_NETWORK.c_node_index_year_type_hz = [ZZZ_BIOG_MAIN].[c_index_year_type_hz], " + _
            "ZZ_SOCIAL_NETWORK.c_node_dy = [ZZZ_BIOG_MAIN].[c_dy], ZZ_SOCIAL_NETWORK.c_node_dynasty = [ZZZ_BIOG_M
AIN].[c_dynasty], " + _
            "ZZ_SOCIAL_NETWORK.c_node_dynasty_chn = [ZZZ_BIOG_MAIN].[c_dynasty_chn], ZZ_SOCIAL_NETWORK.c_node_fem
ale = [ZZZ_BIOG_MAIN].[c_female], " + _
            "ZZ_SOCIAL_NETWORK.c_node_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], ZZ_SOCIAL_NETWORK.c_node_addr_
name = [ZZZ_BIOG_MAIN].[c_index_addr_name], " + _
            "ZZ_SOCIAL_NETWORK.c_node_addr_chn = [ZZZ_BIOG_MAIN].[c_index_addr_chn], ZZ_SOCIAL_NETWORK.c_node_add
r_type = [ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
            "ZZ_SOCIAL_NETWORK.c_node_addr_desc = [ZZZ_BIOG_MAIN].[c_index_year_type_desc], " + _
            "ZZ_SOCIAL_NETWORK.c_node_addr_desc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn], " + _
            "ZZ_SOCIAL_NETWORK.node_xcoord = [ZZZ_BIOG_MAIN].[x_coord], ZZ_SOCIAL_NETWORK.node_ycoord = [ZZZ_BIOG
_MAIN].[y_coord]"
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecCount
    '
    tQueryStr = "UPDATE ZZ_SOCIAL_NETWORK INNER JOIN ADDR_CODES ON ZZ_SOCIAL_NETWORK.c_link_addr_id = ADDR_CODES.
c_addr_id " + _
        "SET ZZ_SOCIAL_NETWORK.c_link_addr_name = [ADDR_CODES].[c_name], " + _
            "ZZ_SOCIAL_NETWORK.c_link_addr_chn = [ADDR_CODES].[c_name_chn], " + _
            "ZZ_SOCIAL_NETWORK.c_link_xcoord = [ADDR_CODES].[x_coord], " + _
            "ZZ_SOCIAL_NETWORK.c_link_ycoord = [ADDR_CODES].[y_coord]"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecCount
    '
    tQueryStr = "UPDATE ZZ_SOCIAL_NETWORK INNER JOIN TEXT_CODES ON ZZ_SOCIAL_NETWORK.c_source = TEXT_CODES.c_text
id " + _
            "SET ZZ_SOCIAL_NETWORK.c_source_text = [TEXT_CODES].[c_title], " + _
                "ZZ_SOCIAL_NETWORK.c_source_txt_chn = [TEXT_CODES].[c_title_chn]"
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecCount

    '
    'MsgBox "About to fill the People table..."

    tQueryStr = "UPDATE ZZ_SCRATCH_PEOPLE INNER JOIN ZZZ_BIOG_MAIN ON " + _
        "ZZ_SCRATCH_PEOPLE.c_person_id = ZZZ_BIOG_MAIN.c_personid " + _
        "SET ZZ_SCRATCH_PEOPLE.c_name = [ZZZ_BIOG_MAIN].[c_name], " + _
            "ZZ_SCRATCH_PEOPLE.c_name_chn = [ZZZ_BIOG_MAIN].[c_name_chn], " + _
            "ZZ_SCRATCH_PEOPLE.c_index_year = [ZZZ_BIOG_MAIN].[c_index_year], " + _
è¡¨ - 63

            "ZZ_SCRATCH_PEOPLE.c_dy = [ZZZ_BIOG_MAIN].[c_dy], " + _
            "ZZ_SCRATCH_PEOPLE.c_dynasty = [ZZZ_BIOG_MAIN].[c_dynasty], " + _
            "ZZ_SCRATCH_PEOPLE.c_dynasty_chn = [ZZZ_BIOG_MAIN].[c_dynasty_chn], " + _
            "ZZ_SCRATCH_PEOPLE.c_female = [ZZZ_BIOG_MAIN].[c_female], " + _
            "ZZ_SCRATCH_PEOPLE.c_addr_id = [ZZZ_BIOG_MAIN].[c_index_addr_id], " + _
            "ZZ_SCRATCH_PEOPLE.c_addr_type = [ZZZ_BIOG_MAIN].[c_index_addr_type_code], " + _
            "ZZ_SCRATCH_PEOPLE.c_addr_desc = [ZZZ_BIOG_MAIN].[c_index_addr_type_desc], " + _
            "ZZ_SCRATCH_PEOPLE.c_addr_desc_chn = [ZZZ_BIOG_MAIN].[c_index_addr_type_chn], " + _
            "ZZ_SCRATCH_PEOPLE.c_addr_name = [ZZZ_BIOG_MAIN].[c_index_addr_name], " + _
            "ZZ_SCRATCH_PEOPLE.c_addr_chn = [ZZZ_BIOG_MAIN].[c_index_addr_chn], " + _
            "ZZ_SCRATCH_PEOPLE.x_coord = [ZZZ_BIOG_MAIN].[x_coord], " + _
            "ZZ_SCRATCH_PEOPLE.y_coord = [ZZZ_BIOG_MAIN].[y_coord]"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecCount
    '
    ' get the XY count
    '
    'MsgBox "About to count XYs..."
    '
    cmdSQL.CommandText = "Delete * from tmpXY"
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "INSERT INTO tmpXY ( x_coord, y_coord, CountOfx_coord, CountOfy_coord ) " + _
        "SELECT ZZ_SCRATCH_PEOPLE.x_coord, ZZ_SCRATCH_PEOPLE.y_coord, Count(ZZ_SCRATCH_PEOPLE.x_coord) " + _
        "AS CountOfx_coord, Count(ZZ_SCRATCH_PEOPLE.y_coord) AS CountOfy_coord " + _
        "FROM ZZ_SCRATCH_PEOPLE " + _
        "GROUP BY ZZ_SCRATCH_PEOPLE.x_coord, ZZ_SCRATCH_PEOPLE.y_coord;"
    '
    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    tQueryStr = "UPDATE tmpXY INNER JOIN ZZ_SCRATCH_PEOPLE ON (tmpXY.y_coord = " + _
        "ZZ_SCRATCH_PEOPLE.y_coord) AND (tmpXY.x_coord = ZZ_SCRATCH_PEOPLE.x_coord) SET " + _
        "ZZ_SCRATCH_PEOPLE.xy_count = [tmpXY].[CountOfx_coord];"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted
    '
    ' the final step is to fill in the aggregated version of the social network
    '
    cmdSQL.CommandText = "Delete * from ZZ_SOCIAL_NETWORK_AGGREGATE"
    cmdSQL.Execute tRecDeleted
    '
    ' make the aggregated list
    '
    tQueryStr = "INSERT INTO ZZ_SOCIAL_NETWORK_AGGREGATE ( c_person_id, c_node_id, c_link_count, c_edge_dist, c_r
ec_count ) " + _
        "SELECT ZZ_SOCIAL_NETWORK.c_person_id, ZZ_SOCIAL_NETWORK.c_node_id, " + _
                 "Sum(ZZ_SOCIAL_NETWORK.c_link_count) AS SumOfc_link_count, Min(ZZ_SOCIAL_NETWORK.c_edge_dist) AS
MinOfc_edge_dist, " + _
                 "Count(ZZ_SOCIAL_NETWORK.c_edge_dist) as c_rec_count " + _
        "FROM ZZ_SOCIAL_NETWORK " + _
        "GROUP BY ZZ_SOCIAL_NETWORK.c_person_id, ZZ_SOCIAL_NETWORK.c_node_id"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted

    '
    ' now fill in the basic information
    '
    tQueryStr = "UPDATE ZZ_SOCIAL_NETWORK INNER JOIN ZZ_SOCIAL_NETWORK_AGGREGATE ON " + _
        "(ZZ_SOCIAL_NETWORK.c_person_id = ZZ_SOCIAL_NETWORK_AGGREGATE.c_person_id) AND " + _
        "(ZZ_SOCIAL_NETWORK.c_node_id = ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_id) SET "
    tStrQuerySetPerson = "ZZ_SOCIAL_NETWORK_AGGREGATE.c_name = [ZZ_SOCIAL_NETWORK].[c_name], " + _
        "ZZ_SOCIAL_NETWORK_AGGREGATE.c_name_chn = [ZZ_SOCIAL_NETWORK].[c_name_chn], " + _
        "ZZ_SOCIAL_NETWORK_AGGREGATE.c_index_year = [ZZ_SOCIAL_NETWORK].[c_index_year], " + _
        "ZZ_SOCIAL_NETWORK_AGGREGATE.c_dy = [ZZ_SOCIAL_NETWORK].[c_dy], " + _
        "ZZ_SOCIAL_NETWORK_AGGREGATE.c_dynasty = [ZZ_SOCIAL_NETWORK].[c_dynasty], " + _
        "ZZ_SOCIAL_NETWORK_AGGREGATE.c_dynasty_chn = [ZZ_SOCIAL_NETWORK].[c_dynasty_chn], " + _
        "ZZ_SOCIAL_NETWORK_AGGREGATE.c_female = [ZZ_SOCIAL_NETWORK].[c_female], " + _
        "ZZ_SOCIAL_NETWORK_AGGREGATE.c_addr_id = [ZZ_SOCIAL_NETWORK].[c_addr_id], " + _
        "ZZ_SOCIAL_NETWORK_AGGREGATE.c_addr_name = [ZZ_SOCIAL_NETWORK].[c_addr_name], " + _
        "ZZ_SOCIAL_NETWORK_AGGREGATE.c_addr_chn = [ZZ_SOCIAL_NETWORK].[c_addr_chn], " + _
        "ZZ_SOCIAL_NETWORK_AGGREGATE.c_addr_type = [ZZ_SOCIAL_NETWORK].[c_addr_type], " + _
        "ZZ_SOCIAL_NETWORK_AGGREGATE.c_addr_desc = [ZZ_SOCIAL_NETWORK].[c_addr_desc], " + _
        "ZZ_SOCIAL_NETWORK_AGGREGATE.c_addr_desc_chn = [ZZ_SOCIAL_NETWORK].[c_addr_desc_chn], " + _
        "ZZ_SOCIAL_NETWORK_AGGREGATE.x_coord = [ZZ_SOCIAL_NETWORK].[x_coord], " + _
        "ZZ_SOCIAL_NETWORK_AGGREGATE.y_coord = [ZZ_SOCIAL_NETWORK].[y_coord], "
    tStrQuerySetNode = "ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_name = [ZZ_SOCIAL_NETWORK].[c_node_name], " + _
è¡¨ - 64

           "ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_chn = [ZZ_SOCIAL_NETWORK].[c_node_chn], " + _
           "ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_index_year = [ZZ_SOCIAL_NETWORK].[c_node_index_year], " + _
           "ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_dy = [ZZ_SOCIAL_NETWORK].[c_node_dy], " + _
           "ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_dynasty = [ZZ_SOCIAL_NETWORK].[c_node_dynasty], " + _
           "ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_dynasty_chn = [ZZ_SOCIAL_NETWORK].[c_node_dynasty_chn], " + _
           "ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_addr_id = [ZZ_SOCIAL_NETWORK].[c_node_addr_id], " + _
           "ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_addr_name = [ZZ_SOCIAL_NETWORK].[c_node_addr_name], " + _
           "ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_addr_chn = [ZZ_SOCIAL_NETWORK].[c_node_addr_chn], " + _
           "ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_addr_type = [ZZ_SOCIAL_NETWORK].[c_node_addr_type], " + _
           "ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_addr_desc = [ZZ_SOCIAL_NETWORK].[c_node_addr_desc], " + _
           "ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_addr_desc_chn = [ZZ_SOCIAL_NETWORK].[c_node_addr_desc_chn], " + _
           "ZZ_SOCIAL_NETWORK_AGGREGATE.node_xcoord = [ZZ_SOCIAL_NETWORK].[node_xcoord], " + _
           "ZZ_SOCIAL_NETWORK_AGGREGATE.node_ycoord = [ZZ_SOCIAL_NETWORK].[node_ycoord], " + _
           "ZZ_SOCIAL_NETWORK_AGGREGATE.c_distance = ZZ_SOCIAL_NETWORK.c_distance"

    cmdSQL.CommandText = tQueryStr + tStrQuerySetPerson + tStrQuerySetNode
    cmdSQL.Execute tRecDeleted

    'Set tQuery = CurrentDb.QueryDefs("ZZ_SOCIAL_NETWORK_AGGREGATE Query")
    'tQuery.Execute
    '
    ' get the descriptions
    '
    tQueryStr = "UPDATE (ZZ_SOCIAL_NETWORK INNER JOIN ZZ_SOCIAL_NETWORK_AGGREGATE ON " + _
            "ZZ_SOCIAL_NETWORK.c_person_id = ZZ_SOCIAL_NETWORK_AGGREGATE.c_person_id AND " + _
            "ZZ_SOCIAL_NETWORK.c_node_id = ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_id) " + _
            "SET ZZ_SOCIAL_NETWORK_AGGREGATE.c_link_desc = " + _
            "[ZZ_SOCIAL_NETWORK].[type_id]+':'+[ZZ_SOCIAL_NETWORK].[c_link_desc], " + _
            "ZZ_SOCIAL_NETWORK_AGGREGATE.c_link_chn = " + _
            "[ZZ_SOCIAL_NETWORK].[type_id]+':'+[ZZ_SOCIAL_NETWORK].[c_link_chn] " + _
            "WHERE (((ZZ_SOCIAL_NETWORK_AGGREGATE.c_rec_count)=1))"

    cmdSQL.CommandText = tQueryStr
    cmdSQL.Execute tRecDeleted

    tQueryStr = "UPDATE ZZ_SOCIAL_NETWORK_AGGREGATE SET ZZ_SOCIAL_NETWORK_AGGREGATE.c_link_desc = " + _
        "'Multiple associations merged', ZZ_SOCIAL_NETWORK_AGGREGATE.c_link_chn = '" + _
        ChrW(32317) + ChrW(21512) + ChrW(22810) + ChrW(31278) + ChrW(38364) + ChrW(20418) + "'" + _
        "WHERE (((ZZ_SOCIAL_NETWORK_AGGREGATE.c_rec_count)>1))"

     cmdSQL.CommandText = tQueryStr
     cmdSQL.Execute tRecDeleted
     '
     ' the code is messy enough that I put the task of updating the new index year information into three queries
  at the very end
     '
     cmdSQL.CommandText = "UPDATE ZZZ_BIOG_MAIN AS ZZZ_BIOG_MAIN_1 INNER JOIN (ZZZ_BIOG_MAIN INNER JOIN ZZ_SOCIAL_
NETWORK " + _
         "ON ZZZ_BIOG_MAIN.c_personid = ZZ_SOCIAL_NETWORK.c_person_id) ON ZZZ_BIOG_MAIN_1.c_personid = ZZ_SOCIAL_N
ETWORK.c_node_id " + _
         "SET ZZ_SOCIAL_NETWORK.c_index_year_type_code = [ZZZ_BIOG_MAIN].[c_index_year_type_code], " + _
             "ZZ_SOCIAL_NETWORK.c_index_year_type_desc = [ZZZ_BIOG_MAIN].[c_index_year_type_desc], " + _
             "ZZ_SOCIAL_NETWORK.c_index_year_type_hz = [ZZZ_BIOG_MAIN].[c_index_year_type_hz], " + _
             "ZZ_SOCIAL_NETWORK.c_node_index_year_type_code = [ZZZ_BIOG_MAIN_1].[c_index_year_type_code], " + _
             "ZZ_SOCIAL_NETWORK.c_node_index_year_type_desc = [ZZZ_BIOG_MAIN_1].[c_index_year_type_desc], " + _
             "ZZ_SOCIAL_NETWORK.c_node_index_year_type_hz = [ZZZ_BIOG_MAIN_1].[c_index_year_type_hz]"
     cmdSQL.Execute tRecDeleted
     '
     cmdSQL.CommandText = "UPDATE ZZZ_BIOG_MAIN AS ZZZ_BIOG_MAIN_1 INNER JOIN (ZZZ_BIOG_MAIN INNER JOIN ZZ_SOCIAL_
NETWORK_AGGREGATE " + _
         "ON ZZZ_BIOG_MAIN.c_personid = ZZ_SOCIAL_NETWORK_AGGREGATE.c_person_id) ON ZZZ_BIOG_MAIN_1.c_personid = Z
Z_SOCIAL_NETWORK_AGGREGATE.c_node_id " + _
         "SET ZZ_SOCIAL_NETWORK_AGGREGATE.c_index_year_type_code = [ZZZ_BIOG_MAIN].[c_index_year_type_code], " + _
             "ZZ_SOCIAL_NETWORK_AGGREGATE.c_index_year_type_desc = [ZZZ_BIOG_MAIN].[c_index_year_type_desc], " + _
             "ZZ_SOCIAL_NETWORK_AGGREGATE.c_index_year_type_hz = [ZZZ_BIOG_MAIN].[c_index_year_type_hz], " + _
             "ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_index_year_type_desc = [ZZZ_BIOG_MAIN_1].[c_index_year_type_desc]
, " + _
             "ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_index_year_type_hz = [ZZZ_BIOG_MAIN_1].[c_index_year_type_hz], "
+ _
             "ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_index_year_type_code = [ZZZ_BIOG_MAIN_1].[c_index_year_type_code]
"
     cmdSQL.Execute tRecDeleted
     '
     cmdSQL.CommandText = "UPDATE ZZZ_BIOG_MAIN INNER JOIN ZZ_SCRATCH_PEOPLE ON ZZZ_BIOG_MAIN.c_personid = ZZ_SCRA
TCH_PEOPLE.c_person_id " + _
         "SET ZZ_SCRATCH_PEOPLE.c_index_year_type_code = [ZZZ_BIOG_MAIN].[c_index_year_type_code], " + _
             "ZZ_SCRATCH_PEOPLE.c_index_year_type_desc = [ZZZ_BIOG_MAIN].[c_index_year_type_desc], " + _
             "ZZ_SCRATCH_PEOPLE.c_index_year_type_hz = [ZZZ_BIOG_MAIN].[c_index_year_type_hz]"
     cmdSQL.Execute tRecDeleted
è¡¨ - 65

Prepare_to_Exit_CmdRun_Click:
    '
    Set gRstEdge = CurrentDb.OpenRecordset("ZZ_SOCIAL_NETWORK", dbOpenDynaset)
    Set ZZ_SOCIAL_NETWORK.Form.Recordset = gRstEdge
    '
    Set gRstPersonID = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
    Set ZZ_SCRATCH_PEOPLE.Form.Recordset = gRstPersonID

    Set ZZ_SOCIAL_NETWORK_AGGREGATED.Form.Recordset = _
         CurrentDb.OpenRecordset("ZZ_SOCIAL_NETWORK_AGGREGATE", dbOpenDynaset)
    '
    If gRstPersonID.RecordCount > 0 Then
         Me.CmdGIS.Enabled = True
         Me.CmdGUESS.Enabled = True
         Me.CmdUCINet.Enabled = True
         Me.CmdPajek.Enabled = True
         Me.CmdNeo4j.Enabled = True
         Me.ChkIncludeID.Enabled = True
         'Me.CmdRerun.Enabled = True
         CmdStoreID.Enabled = True
    Else
         Me.CmdGIS.Enabled = False
         Me.CmdGUESS.Enabled = False
         Me.CmdUCINet.Enabled = False
         Me.CmdPajek.Enabled = False
         Me.CmdNeo4j.Enabled = False
         Me.ChkIncludeID.Enabled = False
         'Me.CmdRerun.Enabled = False
         CmdStoreID.Enabled = False
    End If
    '
Exit_CmdRun_Click:
    '
    ' close the tables
    Set gRstAssocFilter = Nothing
    Set tRstDummy = Nothing
    '
    'Forms("ZZZ_DONT_PANIC").Visible = False

    Exit Sub

Err_CmdRun_Click:
    MsgBox Err.Description
    Resume Exit_CmdRun_Click

End Sub
Private Sub update_info(tLoops As Integer)
    'Forms("ZZZ_DONT_PANIC").Modal = True
    'tLoopInfoStr = "Loops = " & Str(tLoops) & " Nodes = " & Str(gRstPersonID.RecordCount) _
        & " Edges = " & Str(gRstEdge.RecordCount)
    'Forms("ZZZ_DONT_PANIC")!LblCounter.Caption = tLoopInfoStr
    'Forms("ZZZ_DONT_PANIC").Repaint
    'Forms("ZZZ_DONT_PANIC").Modal = False

End Sub
Private Sub calculate_xy_count()
    Dim tX As Double, tY As Double, tXY As Integer, tBM As Variant, tWrite As Integer
    '
    ' the strategy is to first throw a bookmark at the first new value
    ' then count the number, then go back to the bookmark and update each record
    '
    With gRstPersonID
        .Index = "xy"
        .MoveFirst

           tX = -1#
           tY = -1#
           tXY = 0
           tWrite = 0
           tBM = .Bookmark

           Do While Not .EOF
               If tX <> !x_coord Or tY <> !y_coord Then
                   If tWrite = 1 Then
                       ' go back to the first record with the value
                       .Bookmark = tBM
                       Do While tX = !x_coord And tY = !y_coord
                           .Edit
                           !xy_count = tXY
                           .Update
è¡¨ - 66

                              .MoveNext
                       Loop
                Else
                    tWrite = 1
                End If
                ' reset
                tXY = 0
                tBM = .Bookmark
                tX = !x_coord
                tY = !y_coord
            End If
            ' increment the count and move to the next
            tXY = tXY + 1
            .MoveNext
        Loop
        '
        ' the last xy value still needs to be written
        '
        .Bookmark = tBM
        Do While Not .EOF
             .Edit
             !xy_count = tXY
             .Update
             .MoveNext
        Loop
        .Index = "index_year"
    End With
End Sub
Private Sub makeAssocFilter()
    '
    ' this is a brute-force routine that looks at the filer request and builds the filter
    ' table (remember true = -1, false = 0)
    '
    Dim cmdSQL As ADODB.Command, tRecCount As Long, strBaseSQL As String

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText
    '
    ' start with the single-unit categories
    '
    strBaseSQL = "INSERT INTO ZZ_SCRATCH_ASSOC_FILTER ( c_assoc_code ) SELECT ASSOC_CODE_TYPE_REL.c_assoc_code FR
OM ASSOC_CODE_TYPE_REL WHERE "
    '
    If ChkFamily.Value = -1 Then
        cmdSQL.CommandText = strBaseSQL + "((Left([ASSOC_CODE_TYPE_REL].[c_assoc_type_code],2)='09'))"
        cmdSQL.Execute tRecCount
    End If
    '
    If ChkFinance.Value = -1 Then
        cmdSQL.CommandText = strBaseSQL + "((Left([ASSOC_CODE_TYPE_REL].[c_assoc_type_code],2)='10'))"
        cmdSQL.Execute tRecCount
    End If
    '
    If ChkFriendship.Value = -1 Then
        cmdSQL.CommandText = strBaseSQL + "((Left([ASSOC_CODE_TYPE_REL].[c_assoc_type_code],2)='03'))"
        cmdSQL.Execute tRecCount
    End If
    '
    If ChkMedicine.Value = -1 Then
        cmdSQL.CommandText = strBaseSQL + "((Left([ASSOC_CODE_TYPE_REL].[c_assoc_type_code],2)='07'))"
        cmdSQL.Execute tRecCount
    End If
    '
    If ChkReligion.Value = -1 Then
        cmdSQL.CommandText = strBaseSQL + "((Left([ASSOC_CODE_TYPE_REL].[c_assoc_type_code],2)='08'))"
        cmdSQL.Execute tRecCount
    End If
    '
    ' now for the larger categories
    If gFilterMilitaryCount = gMaxFilterMilitary Then
        cmdSQL.CommandText = strBaseSQL + "((Left([ASSOC_CODE_TYPE_REL].[c_assoc_type_code],2)='06'))"
        cmdSQL.Execute tRecCount
    ElseIf gFilterMilitaryCount > 0 Then
        ' look for each component
        If ChkMilitarySupport.Value = -1 Then
            cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0602')"
            cmdSQL.Execute tRecCount
        End If
        '
è¡¨ - 67

        If ChkMilitaryOppose.Value = -1 Then
            cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0603')"
            cmdSQL.Execute tRecCount
        End If
    End If
    '
    If gFilterScholarCount = gMaxFilterScholar Then
        cmdSQL.CommandText = strBaseSQL + "((Left([ASSOC_CODE_TYPE_REL].[c_assoc_type_code],2)='02'))"
        cmdSQL.Execute tRecCount
    ElseIf gFilterScholarCount > 0 Then
        ' look for each component
        If ChkSchTeacher.Value = -1 Then
            cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0202')"
            cmdSQL.Execute tRecCount
        End If
        '
        If ChkSchAffiliation.Value = -1 Then
            cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0203')"
            cmdSQL.Execute tRecCount
        End If
        '
        If Me.ChkSchTopic.Value = -1 Then
            cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0204')"
            cmdSQL.Execute tRecCount
        End If
        '
        If ChkSchMember.Value = -1 Then
            cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0205')"
            cmdSQL.Execute tRecCount
        End If
        '
        If ChkSchPatron.Value = -1 Then
            cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0206')"
            cmdSQL.Execute tRecCount
        End If
        '
        If ChkSchLitArt.Value = -1 Then
            cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0207')"
            cmdSQL.Execute tRecCount
        End If
        '
        If ChkSchAttack.Value = -1 Then
            cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0208')"
            cmdSQL.Execute tRecCount
        End If
    End If
    '
    If gFilterPoliticsCount = gMaxFilterPolitics Then
        cmdSQL.CommandText = strBaseSQL + "((Left([ASSOC_CODE_TYPE_REL].[c_assoc_type_code],2)='04'))"
        cmdSQL.Execute tRecCount
    ElseIf gFilterPoliticsCount > 0 Then
        ' look for each component
        If ChkPolEqual.Value = -1 Then
            cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0402')"
            cmdSQL.Execute tRecCount
        End If
        '
        If ChkPolSub.Value = -1 Then
            cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0403')"
            cmdSQL.Execute tRecCount
        End If
        '
        If ChkPolSup.Value = -1 Then
            cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0404')"
            cmdSQL.Execute tRecCount
        End If
        '
        If ChkPolSupport.Value = -1 Then
            cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0405')"
            cmdSQL.Execute tRecCount
        End If
        '
        If ChkPolSponsor.Value = -1 Then
            cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0406')"
            cmdSQL.Execute tRecCount
        End If
        '
        If ChkPolOppose.Value = -1 Then
            cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0407')"
            cmdSQL.Execute tRecCount
è¡¨ - 68

         End If
         '
    End If
    '
    If gFilterWritingsCount = gMaxFilterWritings Then
         cmdSQL.CommandText = strBaseSQL + "((Left([ASSOC_CODE_TYPE_REL].[c_assoc_type_code],2)='05'))"
         cmdSQL.Execute tRecCount
    ElseIf gFilterWritingsCount > 0 Then
         ' look for each component
         If ChkWriCommem.Value = -1 Then
             cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0502')"
             cmdSQL.Execute tRecCount
         End If
         '
         If ChkWriEpitaph.Value = -1 Then
             cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0503')"
             cmdSQL.Execute tRecCount
         End If
         '
         If ChkWriPreface.Value = -1 Then
             cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0504')"
             cmdSQL.Execute tRecCount
         End If
         '
         If ChkWriRitual.Value = -1 Then
             cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0505')"
             cmdSQL.Execute tRecCount
         End If
         '
         If ChkWriBiog.Value = -1 Then
             cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0506')"
             cmdSQL.Execute tRecCount
         End If
         '
         If ChkWriExplain.Value = -1 Then
             cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0507')"
             cmdSQL.Execute tRecCount
         End If
         '
         If ChkWriMottos.Value = -1 Then
             cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0508')"
             cmdSQL.Execute tRecCount
         End If
         '
         If ChkWriLetters.Value = -1 Then
             cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0509')"
             cmdSQL.Execute tRecCount
         End If
         '
         If ChkWriOccasion.Value = -1 Then
             cmdSQL.CommandText = strBaseSQL + "([ASSOC_CODE_TYPE_REL].[c_assoc_type_code]='0510')"
             cmdSQL.Execute tRecCount
         End If
    End If
    '
End Sub
Private Sub fill_first_record()
    Dim tAddrID As Long, strSeek As String
    '
    ' fill in the data in the node file for the first record
    '
    gRst.MoveFirst
    gRstPersonID.MoveFirst
    gRstPersonID.Edit
    gRstPersonID!c_name = gRst!c_person_name
    gRstPersonID!c_name_chn = gRst!c_person_name_chn
    gRstPersonID!c_index_year = gRst!c_index_year
    gRstPersonID!c_female = gRst!c_female
    gRstPersonID!c_node_dist = 0
    '
    If IsNull(gRst!c_addr_id) Then
         gRstPersonID!x_coord = 0#
         gRstPersonID!y_coord = 0#
         gRstPersonID!c_addr_id = 0
         gRstPersonID!c_addr_name = ""
         gRstPersonID!c_addr_chn = ""
         gRstPersonID!c_addr_type = 0
         gRstPersonID!c_addr_desc = ""
         gRstPersonID!c_addr_desc_chn = ""
    Else
è¡¨ - 69

        gRstPersonID!x_coord = gRst!x_coord
        gRstPersonID!y_coord = gRst!y_coord
        gRstPersonID!c_addr_id = gRst!c_addr_id
        gRstPersonID!c_addr_name = gRst!c_addr_name
        gRstPersonID!c_addr_chn = gRst!c_addr_chn
        gRstPersonID!c_addr_type = 1
        gRstPersonID!c_addr_desc = "Basic"
        gRstPersonID!c_addr_desc_chn = ChrW(&H7C4D) & ChrW(&H8CAB)
    End If
    '
    gRstPersonID.Update

End Sub
Private Sub CmdSelectPerson_Click()
On Error GoTo Err_CmdSelectPerson_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strPERSON_ID As String, cmdSQL As ADODB.Command

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    TxtPersonID.Visible = True
    TxtPersonID.SetFocus
    strPERSON_ID = TxtPersonID.Text


           stDocName = "frmSelectPerson"
           DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strPERSON_ID

           If CurrentProject.AllForms("frmSelectPerson").IsLoaded Then
              Dim lngPERSON_ID As Long
              Dim strPERSON_NM As String
              Dim strPERSON_NM_CHN As String

              Forms!frmSelectPerson!frmPersonSearch.Form!c_personid.SetFocus
              lngPERSON_ID = Forms!frmSelectPerson!frmPersonSearch.Form!c_personid.Value
              TxtPersonID.Value = lngPERSON_ID

              Forms!frmSelectPerson!frmPersonSearch.Form!c_name_chn.SetFocus
              strPERSON_NM_CHN = Forms!frmSelectPerson!frmPersonSearch.Form!c_name_chn.Value
              TxtNameChn.Value = strPERSON_NM_CHN

              Forms!frmSelectPerson!frmPersonSearch.Form!c_name.SetFocus
              strPERSON_NM = Forms!frmSelectPerson!frmPersonSearch.Form!c_name.Value
              TxtName.Value = strPERSON_NM

               cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_IMPORT_PEOPLE"
               cmdSQL.Execute tRecDeleted

               '
               ' add the name
               '
               tStrQuery = "INSERT INTO ZZ_SCRATCH_IMPORT_PEOPLE ( c_person_id) SELECT " + Str(lngPERSON_ID) + " as
c_person_id"

               cmdSQL.CommandText = tStrQuery
               cmdSQL.Execute tRecDeleted

              gUsePersonID = True
              Me.CmdAllPeople.Enabled = True
              CmdRun.Enabled = True
              'CmdRerun.Enabled = False

              DoCmd.Close acForm, stDocName
           End If

    CmdSelectPerson.SetFocus
    TxtPersonID.Visible = False
    Call CheckRunCriteria

Exit_CmdSelectPerson_Click:
    Exit Sub

Err_CmdSelectPerson_Click:
    MsgBox Err.Description
    Resume Exit_CmdSelectPerson_Click
è¡¨ - 70

End Sub

Private Sub CmdSelectPlace_Click()
On Error GoTo Err_CmdSelectPlace_Click

    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strADDR As String
    Dim cmdSQL As ADODB.Command

    Set cmdSQL = New ADODB.Command
    cmdSQL.ActiveConnection = CurrentProject.Connection
    cmdSQL.CommandType = adCmdText

    TxtAddrID.Visible = True
    TxtAddrID.SetFocus
    strADDR = TxtAddrID.Text

    stDocName = "frmPickAddresses_multi"
    DoCmd.OpenForm stDocName, , , stLinkCriteria, , acDialog, strADDR

    If CurrentProject.AllForms("frmPickAddresses_multi").IsLoaded Then
        Dim tAddrID As Long, tRstAddr As DAO.Recordset
        Dim strADDR_CHN As String, strADDR_PY As String

           CmdAllPlaces.Enabled = True
           ChkPlaceLimit.Enabled = True
           ChkXYRef.Enabled = True
           ChkSubUnits.Enabled = True

           gUseADDRID = True

           'Set tRstAddresses = CurrentDb.OpenRecordset("ZZ_ADDRESSES", dbOpenDynaset)
           'tRstAddresses.MoveFirst
           'If tRstAddresses.RecordCount = 0 Then
           Forms!frmPickAddresses_multi.Form!TxtAddrFilter.Visible = True
           Forms!frmPickAddresses_multi.Form!TxtAddrFilter.SetFocus
           If Forms!frmPickAddresses_multi.Form!TxtAddrFilter.Value Then
               '
               TxtAddrID.Value = 0
               strADDR_PY = Forms!frmPickAddresses_multi.Form!TxtFilterPY
               strADDR_CHN = Forms!frmPickAddresses_multi.Form!TxtFilterChn

                  If strADDR_CHN = "" Then
                       TxtPlaceChn.Value = "[[Filter]]"
                       TxtPlace.Value = "[[" + strADDR_PY + "]]"
                  Else
                       TxtPlaceChn.Value = "[[" + strADDR_CHN + "]]"
                       TxtPlace.Value = "[[Filter]]"
                  End If
           Else
               Forms!frmPickAddresses_multi.Form!TxtSelectCount.Visible = True
               Forms!frmPickAddresses_multi.Form!TxtSelectCount.SetFocus
               If Forms!frmPickAddresses_multi.Form!TxtSelectCount.Value > 1 Then
                    TxtPlaceChn.Value = "[[" + ChrW(22810) + ChrW(36984) + "]]"
                    TxtPlace.Value = "[[Multi-Select]]"
                    TxtAddrID.Value = 0
               Else
                    ' only one record in ZZ_ADDRESSES: get its field values
                    '
                    Set tRstAddr = CurrentDb.OpenRecordset("ZZ_ADDRESSES", dbOpenDynaset)
                    tRstAddr.MoveFirst
                    'MsgBox "Checking zz_addresses: no records"
                    TxtAddrID.Value = tRstAddr!c_addr_id
                    TxtPlaceChn.Value = tRstAddr!c_name_chn
                    TxtPlace.Value = tRstAddr!c_name
                    tRstAddr.Close
                    Set tRstAddr = Nothing
              End If

           End If
           '
           ' now copy the records
           '
           cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_ADDR_LIST"
           cmdSQL.Execute tRecDeleted

           cmdSQL.CommandText = "INSERT INTO ZZ_SCRATCH_ADDR_LIST ( c_addr_id ) SELECT DISTINCT " + _
               "ZZ_ADDRESSES.c_addr_id FROM ZZ_ADDRESSES"
           cmdSQL.Execute tRecDeleted
è¡¨ - 71


        CmdRun.Enabled = True
        DoCmd.Close acForm, stDocName
    End If

    CmdSelectPlace.SetFocus
    TxtAddrID.Visible = False
    Call CheckRunCriteria

Exit_CmdSelectPlace_Click:
    Exit Sub

Err_CmdSelectPlace_Click:
    MsgBox Err.Description
    Resume Exit_CmdSelectPlace_Click

End Sub

Private Sub CmdToDynasty_Click()
    Dim stDocName As String
    Dim stLinkCriteria As String
    Dim strToDynasty As String

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
                TxtToDynasty.Value = ""
                TxtToDynastyPY.Value = ""
            End If
        End If
        '
        ' value is OK
        '
        If gToDynasty > -1 Then
            Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty.SetFocus
            TxtToDynastyPY.Value = Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty.Value

               Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty_chn.SetFocus
               TxtToDynasty.Value = Forms!frmpickdynasty!frmDYNASTIES.Form!c_dynasty_chn.Value
           End If

        DoCmd.Close acForm, stDocName
        '
        ' reset FromDynasty if necessary (-2 = all dynasties)
        '
        If gFromDynasty = -2 Then
            gFromDynasty = -1
            TxtFromDynasty.Value = ""
            TxtFromDynastyPY.Value = ""
        End If
        '
    End If

End Sub

Private Sub CmdUCINet_Click()
è¡¨ - 72

On Error GoTo Err_CmdUCINet_Click
    '
    ' This program will dump the results of the search to a .vna file
    '
    ' for the moment I'll just describe the format of the .vna file
    '
    ' *node data
    ' ID index_year sex x_coord y_coord nodedist
    '      ID = str(c_person_id)
    '      indexyear = c_index_year INT
    '      nodedist = c_node_dist INT
    '      sex = c_female > (F,M)
    ' *node properties
    ' ID color shape size shortlabel active
    '      color = red (1), orange (2), yellow (3), green (4), blue (5)
    '      shortlabel = c_name
    '      shape = 2
    '      active = TRUE
    '
    ' *tie data
    ' from to edgetype nodedist
    '      from = str(c_person_id)
    '      to = str(c_node_id)
    '      edgetype= c_link_type (K,N)
    '
    ' *tie properties
    ' from to color size active
    '      from = str(c_person_id)
    '      to = str(c_node_id)
    '      color = red (255), orange (26367), yellow (65535), green (32768), blue (16711680)
    '      size = 1-5 (the weight)
    '
    ' the central question is whether to do distance optimizations
    '
    ' first see if there are any records to process
    '
    If ZZ_SOCIAL_NETWORK.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdUCINet_Click
    End If
    '
    If ZZ_SCRATCH_PEOPLE.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdUCINet_Click
    End If
    '
    ' next get a file
    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer
    Dim tFileName As String, tFN As Variant
    Dim tRstNode As DAO.Recordset, tRstAssocType As DAO.Recordset
    Dim tRstEdge As DAO.Recordset
    Dim tStr As String, tC As String, ti As Integer, tSearchStr As String
    Dim tColor(20) As String, tQuote As String
    Dim tFileSystem, tVNA

    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

    ' open the assoc type look-up table
    Set tRstAssocType = CurrentDb.OpenRecordset("ASSOC_CODE_TYPE_REL", dbOpenDynaset)

    'Use a With...End With block to reference the FileDialog object.
    With dlgSaveAs
        .InitialFileName = "network.vna"
        If .Show = -1 Then
            '
            tFileName = ""
            For Each tFN In .SelectedItems
                 tFileName = tFN
                 If Not tFileName = "" Then
                     Exit For
                 End If
            Next
            If tFileName = "" Then
                 MsgBox "Bad file Name."
                 GoTo Exit_CmdUCINet_Click
            Else
                 ' make sure the file name has a vna extension
                 If Len(tFileName) < 5 Then
è¡¨ - 73

                   tFileName = tFileName + ".vna"
               ElseIf Not (LCase(Right(tFileName, 4)) = ".vna") Then
                   tFileName = tFileName + ".vna"
               End If
           End If
           '
           ' now process the file (second true removed to make ASCII)
           '
           Set tFileSystem = CreateObject("Scripting.FileSystemObject")
           Set tVNA = tFileSystem.CreateTextFile(tFileName, True)

           ' define the colors for the nodes
           '
           tColor(1) = "0 "             ' black
           tColor(2) = "16711680 " ' blue
           tColor(3) = "32768 "         ' green
           tColor(4) = "65535 "         ' yellow
           tColor(5) = "26367 "         ' orange
           For ti = 6 To 20
                tColor(ti) = "255 " ' red
           Next
           '
           ' process the two tables
           '
           Set tRstEdge = ZZ_SOCIAL_NETWORK.Form.Recordset
           Set tRstNode = ZZ_SCRATCH_PEOPLE.Form.Recordset
           tQuote = Chr(34) ' the quotation mark
           '
           ' first the nodes: define the node data structure
           tVNA.WriteLine ("*node data")
           tVNA.WriteLine ("ID index_year dynasty_code dynasty sex x_coord y_coord nodedist")
           '
           With tRstNode
                .MoveFirst
                Do While Not .EOF
                     ' name = the ID of the person
                     tStr = Trim(Str(!c_person_id)) + " "
                     '
                     ' indexyear = c_index_year INT
                     If IsNull(!c_index_year) Then
                          tStr = tStr + "0 "
                     Else
                          tStr = tStr + Trim(Str(!c_index_year)) + " "
                     End If
                     '
                     ' dynasty_code = c_dy INT
                     If IsNull(!c_dynasty) Then
                          tStr = tStr + "0 " + tQuote + "Unknown" + tQuote + " "
                     Else
                          tStr = tStr + Trim(Str(!c_dy)) + " " + tQuote + !c_dynasty + tQuote + " "
                     End If
                     '
                     '    sex = c_female > (F,M)
                     If !c_female = -1 Then
                          tStr = tStr + tQuote + "F" + tQuote + " "
                     Else
                          tStr = tStr + tQuote + "M" + tQuote + " "
                     End If
                     '
                     '    x_coord
                     If IsNull(!x_coord) Then
                          tStr = tStr + "0 "
                     Else
                          tStr = tStr + Trim(Str(!x_coord)) + " "
                     End If
                     '
                     '    y_coord
                     If IsNull(!y_coord) Then
                          tStr = tStr + "0 "
                     Else
                          tStr = tStr + Trim(Str(!y_coord)) + " "
                     End If
                     '
                     '    node distance
                     tStr = tStr + Trim(Str(!c_node_dist))
                     '
                     tVNA.WriteLine (tStr)
                     .MoveNext
                Loop
           End With
è¡¨ - 74

           '
           ' now the node properties
           '
           ' Note: ACTIVE was removed as a property (MAF 201807/22)
           '
           tVNA.WriteLine ("*node properties")
           tVNA.WriteLine ("ID color shape size shortlabel")
           '
           With tRstNode
               .MoveFirst
               Do While Not .EOF
                    ' ID = the ID of the person
                    tStr = Trim(Str(!c_person_id)) + " "
                    '
                    ' color = black (1), blue (2), green (3), yellow (4), orange (5)
                    tStr = tStr + tColor(!c_node_dist + 1)
                    '
                    ' shape = 2? / size = 1?
                    tStr = tStr + "2 1 "
                    '
                    ' shortlabel (+ Active = TRUE removed)
                    If IsNull(!c_name) Then
                         tStr = tStr + "[Missing]"
                    Else
                         tStr = tStr + tQuote + !c_name + tQuote
                    End If
                    tVNA.WriteLine (tStr)
                    .MoveNext
               Loop
           End With
           '
           ' now the edges: define the record structure
           '
           tStr = "from to " + tQuote + "EdgeWeight" + tQuote + " " + tQuote + "edgetype"
           tStr = tStr + tQuote + " " + tQuote + "edgelist" + tQuote
           tVNA.WriteLine ("*tie data")
           tVNA.WriteLine (tStr)
           '
           ' For the moment, I am not combining parallel edges
           '
           With tRstEdge
               .MoveFirst
               Do While Not .EOF
                    '
                    '    From = str(c_person_id) for node1
                    tStr = Trim(Str(!c_person_id)) + " "
                    '
                    '    to = str(c_node_id) for node2
                    tStr = tStr + Trim(Str(!c_node_id)) + " 1 "
                    '
                    '    edgetype
                    If !c_link_type = "K" Then
                         If IsNull(!c_link_desc) Then
                              tStr = tStr + "K "
                         Else
                              tStr = tStr + tQuote + "K_" + !c_link_desc + tQuote + " "
                         End If
                    Else
                         tSearchStr = "c_assoc_code = " + Trim(Str(!c_link_code))
                         tRstAssocType.FindFirst tSearchStr
                         If tRstAssocType.NoMatch Then
                              tStr = tStr + "N_00 "
                         Else
                              tStr = tStr + "N_" + Trim(tRstAssocType!c_assoc_type_code) + " "
                         End If
                    End If
                    '
                    '    edgedist
                    tStr = tStr + Trim(Str(!c_edge_dist))
                    '
                    tVNA.WriteLine (tStr)
                    .MoveNext
               Loop
           End With
           '
           ' now the edges properties
           '
           'tVNA.WriteLine ("*tie properties")
           'tVNA.WriteLine ("from to color size active")
è¡¨ - 75

                  'With tRstEdge
                      '.MoveFirst
                      'Do While Not .EOF
                          '
                          '   from = str(c_person_id) for node1
                          'tStr = Trim(Str(!c_person_id)) + " "
                          '
                          '   to = str(c_node_id) for node2
                          'tStr = tStr + Trim(Str(!c_node_id)) + " 1 "
                          '
                          '   color = black (1), blue (2), green (3), yellow (4), orange (5)
                          'tStr = tStr + tColor(!c_edge_dist)
                          '
                          '   size = 1? active = TRUE
                          'tStr = tStr + "1 TRUE"
                          '
                          'tVNA.WriteLine (tStr)
                          '.MoveNext
                      'Loop
                  'End With
                  '
                  tVNA.Close
                  '
                  Set tRstNode = Nothing
                  Set tRstEdge = Nothing
                  Set tVNA = Nothing
                  Set tFileSystem = Nothing
                  Set tRstAssocType = Nothing
           Else
             'The user pressed Cancel.
        End If
    End With

    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdUCINet_Click:
    Exit Sub

Err_CmdUCINet_Click:
    MsgBox Err.Description
    Resume Exit_CmdUCINet_Click


End Sub

Private Sub CmdPajek_Click()
On Error GoTo Err_CmdUTF8Pajek_Click
    '
    ' This program will dump the results of the search to a .net file
    '
    ' for the moment I'll just describe the format of the .gdf file
    '
    ' *Vertices NUM
    ' ID label "box" ic [color] bc [color]
    '      ID = str(c_person_id)
    '      label = c_name_chn
    '      color = red (1), orange (2), yellow (3), green (4), blue (5)
    '
    ' *Edges
    ' node1 node2 1 l "label"
    '      node1 = str(c_person_id) for node1
    '      node2 = str(c_node_id) for node2
    '      color = red (1), orange (2), yellow (3), green (4), blue (5)
    '      label = c_link_desc
    '
    '
    ' first see if there are any records to process
    '
    If ZZ_SOCIAL_NETWORK.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdUTF8Pajek_Click
    End If
    '
    If ZZ_SCRATCH_PEOPLE.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_CmdUTF8Pajek_Click
    End If
    '
    ' next get a file
è¡¨ - 76

    '
    Dim dlgSaveAs As FileDialog
    Dim tFileNum As Integer, tFileName As String, tFN As Variant
    Dim tPinyin As Boolean
    Dim tRstNode As DAO.Recordset, tRstNodeList As DAO.Recordset
    Dim tRstEdge As DAO.Recordset, tRstAssocType As DAO.Recordset
    Dim tRstAssocCodeType As DAO.Recordset, tRstEdgeList As DAO.Recordset
    Dim tStr As String, tC As String, ti As Integer, tQuote As String, tFindStr As String
    Dim tColor(20) As String, tStrNode1 As String, tStrNode2 As String, tCodeStr As String, tQueryStr As String

    tPinyin = False
    ' to write to a UTF-8 file, use the ADO stream object
    Dim tStream As ADODB.Stream
    Set tStream = New ADODB.Stream

    If CodeFrame.Value = 1 Then
         tStream.Charset = "utf-8"
         tCodeStr = "UTF8.net"
    ElseIf CodeFrame.Value = 2 Then
         tStream.Charset = "big5"
         tCodeStr = "BIG5.net"
    ElseIf CodeFrame.Value = 3 Then
         tStream.Charset = "gb2312"
         tCodeStr = "GB2312.net"
    Else
         tStream.Charset = "iso-8859-1"
         tCodeStr = ".net"
         tPinyin = True
    End If
    tStream.Mode = adModeReadWrite
    tStream.Type = adTypeText
    tStream.Open


    Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)


    'Use a With...End With block to reference the FileDialog object.
    With dlgSaveAs
         .InitialFileName = "network_" + tCodeStr
         If .Show = -1 Then
             '
             tFileName = ""
             For Each tFN In .SelectedItems
                  tFileName = tFN
                  If Not tFileName = "" Then
                      Exit For
                  End If
             Next
             If tFileName = "" Then
                  MsgBox "Bad file Name."
                  GoTo Exit_CmdUTF8Pajek_Click
             Else
                  ' make sure the file name has a net extension
                  If Len(tFileName) < 5 Then
                      tFileName = tFileName + ".net"
                  ElseIf Not (LCase(Right(tFileName, 4)) = ".net") Then
                      tFileName = tFileName + ".net"
                  End If
             End If
             '
             ' zap and open the scratch file
             '
             Dim cmdSQL As ADODB.Command
             Set cmdSQL = New ADODB.Command
             cmdSQL.ActiveConnection = CurrentProject.Connection
             cmdSQL.CommandType = adCmdText
             '
             cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PAJEK"
             cmdSQL.Execute tRecDeleted
             '
             ' fill the node list
             If tPinyin Then
                  tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK ( c_ID, c_lbl, c_distance, c_v_num, c_delete ) " + _
                      "SELECT DISTINCT ZZ_SCRATCH_PEOPLE.c_person_id, ZZ_SCRATCH_PEOPLE.c_name, " + _
                      "ZZ_SCRATCH_PEOPLE.c_node_dist, val(c_person_id) AS c_v_num, TRUE as c_delete FROM ZZ_SCRATCH
_PEOPLE"
             Else
                  tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK ( c_ID, c_lbl, c_distance, c_v_num, c_delete ) " + _
                      "SELECT DISTINCT ZZ_SCRATCH_PEOPLE.c_person_id, ZZ_SCRATCH_PEOPLE.c_name_chn, " + _
è¡¨ - 77

                     "ZZ_SCRATCH_PEOPLE.c_node_dist, val(c_person_id) AS c_v_num, TRUE as c_delete FROM ZZ_SCRATCH
_PEOPLE"
            End If

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            ' fill in any missing names
            '
            If Not tPinyin Then
                tQueryStr = "UPDATE ZZ_SCRATCH_PEOPLE INNER JOIN ZZ_SCRATCH_PAJEK ON " + _
                    "ZZ_SCRATCH_PEOPLE.c_person_id = ZZ_SCRATCH_PAJEK.c_ID SET ZZ_SCRATCH_PAJEK.c_lbl = " + _
                    "[ZZ_SCRATCH_PEOPLE].[c_name] WHERE (((ZZ_SCRATCH_PAJEK.c_lbl) Is Null))"

                cmdSQL.CommandText = tQueryStr
                cmdSQL.Execute tRecDeleted
            End If
            '
            ' if needed, find the 0-degree nodes, using the edge list to mark the node list
            '
            If ChkDegree.Value Then
                '
                cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_PAJEK INNER JOIN ZZ_SOCIAL_NETWORK_AGGREGATE " + _
                    "ON ZZ_SCRATCH_PAJEK.c_id = ZZ_SOCIAL_NETWORK_AGGREGATE.c_person_id " + _
                    "SET ZZ_SCRATCH_PAJEK.c_delete = False"
                cmdSQL.Execute tRecDeleted
                '
                cmdSQL.CommandText = "UPDATE ZZ_SCRATCH_PAJEK INNER JOIN ZZ_SOCIAL_NETWORK_AGGREGATE " + _
                    "ON ZZ_SCRATCH_PAJEK.c_id = ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_id " + _
                    "SET ZZ_SCRATCH_PAJEK.c_delete = False"
                cmdSQL.Execute tRecDeleted
                '
                ' remove records where c_delete = TRUE
                '
                'MsgBox "Got through update"
                '
                cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PAJEK WHERE ((ZZ_SCRATCH_PAJEK.c_delete) = TRUE )"
                cmdSQL.Execute tRecDeleted
            End If

            Set tRstNodeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK", dbOpenTable)
            tRstNodeList.Index = "c_ID"
            '
            ' there probably is an SQL way to do this, but...
            '
            ti = 1
            With tRstNodeList
                .MoveFirst
                Do While Not .EOF
                     .Edit
                     !c_v_num = Trim(Str(ti))
                     .Update
                     ti = ti + 1
                     .MoveNext
                Loop
            End With
            tRstNodeList.Close
            '
            cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_PAJEK_EDGE"
            cmdSQL.Execute tRecDeleted
            '
            ' fill the edge list
            '
            tQueryStr = "INSERT INTO ZZ_SCRATCH_PAJEK_EDGE ( c_node_1, c_node_2, c_edge_count, c_edge_dist, c_edg
e_desc )" + _
                "SELECT Val([ZZ_SCRATCH_PAJEK].[c_v_num]) AS c_node_1, Val([ZZ_SCRATCH_PAJEK_1].[c_v_num]) " + _
                "AS c_node_2, ZZ_SOCIAL_NETWORK_AGGREGATE.c_link_count, ZZ_SOCIAL_NETWORK_AGGREGATE.c_edge_dist,
" + _
                "ZZ_SOCIAL_NETWORK_AGGREGATE.c_link_desc " + _
                "FROM ZZ_SCRATCH_PAJEK INNER JOIN (ZZ_SCRATCH_PAJEK AS ZZ_SCRATCH_PAJEK_1 INNER JOIN " + _
                "ZZ_SOCIAL_NETWORK_AGGREGATE ON ZZ_SCRATCH_PAJEK_1.c_ID = ZZ_SOCIAL_NETWORK_AGGREGATE.c_node_id)
" + _
                "ON ZZ_SCRATCH_PAJEK.c_ID = ZZ_SOCIAL_NETWORK_AGGREGATE.c_person_id"

            cmdSQL.CommandText = tQueryStr
            cmdSQL.Execute tRecDeleted
            '
            '
            Set tRstNodeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK", dbOpenDynaset)
            Set tRstEdgeList = CurrentDb.OpenRecordset("ZZ_SCRATCH_PAJEK_EDGE", dbOpenDynaset)
è¡¨ - 78

           '
           ' set the Quote delimiter
           '
           tQuote = Chr(34)
           '
           ' define the colors for the nodes
           '
           tColor(1) = "Black"
           tColor(2) = "Blue"
           tColor(3) = "Green"
           tColor(4) = "Yellow"
           tColor(5) = "Orange"
           For ti = 6 To 20
                tColor(ti) = "Red"
           Next
           '
           tC = Chr(44) ' the comma
           '
           ' first the nodes: define the record structure
           '
           tRstNodeList.MoveLast
           tStr = "*Vertices " + Trim(Str(tRstNodeList.RecordCount))
           tStream.WriteText tStr, adWriteLine
           '
           ti = 1

           With tRstNodeList
               .MoveFirst
               Do While Not .EOF
                    tStream.WriteText !c_v_num + " "
                    '
                    If IsNull(!c_lbl) Then
                         tStream.WriteText Chr(34)
                         tStream.WriteText "Error-" + Trim(Str(!c_ID))
                         tStream.WriteText Chr(34)
                         tStream.WriteText " box "
                    Else
                         If !c_lbl = "" Then
                              tStream.WriteText Chr(34)
                              tStream.WriteText "Error-" + Trim(Str(!c_ID))
                              tStream.WriteText Chr(34)
                              tStream.WriteText " box "
                         Else
                              tStream.WriteText Chr(34)
                              tStream.WriteText !c_lbl
                              If ChkIncludeID.Value Then
                                  tStream.WriteText ":" + Trim(Str(!c_ID))
                              End If
                              tStream.WriteText Chr(34)
                              tStream.WriteText " box "
                         End If
                    End If
                    ' label
                    tStr = " ic " + tColor(!c_distance + 1)
                    tStr = tStr + " bc " + tColor(!c_distance + 1)
                    ' color = white (1), blue (2), green (3), yellow (4), orange (5)
                    tStream.WriteText tStr, adWriteLine
                    '
                    .MoveNext
               Loop
           End With

           '
           ' now the edges: define the record structure
           '
           tStream.WriteText "*Edges", adWriteLine

           If tRstEdgeList.RecordCount > 0 Then
               With tRstEdgeList
               .MoveFirst
               Do While Not .EOF
                   tStr = Trim(Str(!c_node_1)) + " " + Trim(Str(!c_node_2))
                   '
                   ' now get the weight
                   '
                   If !c_edge_count < 6 Then
                        tStr = tStr + " " + Trim(Str(!c_edge_count)) + " "
                   Else
                        tStr = tStr + " 5 "
                   End If
è¡¨ - 79

                          '
                          ' now get the label
                          '
                          tStr = tStr + "l " + tQuote
                          If !c_edge_count = 1 Then
                               tStr = tStr + !c_edge_desc + tQuote + " "
                          Else
                               tStr = tStr + Trim(Str(!c_edge_count)) + " links" + tQuote + " "
                               '
                          End If

                          tStr = tStr + "c " + tColor(!c_edge_dist + 1)
                          '   color = white (1), blue (2), green (3), yellow (4), orange (5)
                          '
                          tStream.WriteText tStr, adWriteLine
                          '
                          .MoveNext
                      Loop
                      End With
                  End If
                  '
                  ' now make sure all the data is copied to tStream
                  tStream.Flush
                  ' and write the stream to the file
                  tStream.SaveToFile tFileName, adSaveCreateOverWrite
                  '
                  tRstNodeList.Close

                  tStream.Close
                  Set tStream = Nothing
                  '
                  'Set tGDF = Nothing
                  'Set tFileSystem = Nothing
                  Set tRstNodeList = Nothing
                  Set tRstEdgeList = Nothing
           Else
             'The user pressed Cancel.
        End If
    End With

    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_CmdUTF8Pajek_Click:
    Exit Sub

Err_CmdUTF8Pajek_Click:
    MsgBox Err.Description
    Resume Exit_CmdUTF8Pajek_Click

End Sub


Private Sub Form_Open(Cancel As Integer)
    Dim tRstDummy As DAO.Recordset
    Dim cmdDel As ADODB.Command, tRecDeleted As Long
    '
    ' set the language
    Dim tmli As MsoLanguageID
    ' get the labels
    tmli = Application.LanguageSettings.LanguageID(msoLanguageIDUI)
    gLabelsOK = True
    If tmli = msoLanguageIDSimplifiedChinese Then
         gDisplayLanguage = "S"
         Call changeDisplayLanguage
    ElseIf tmli = msoLanguageIDTraditionalChinese Then
         gDisplayLanguage = "T"
         Call changeDisplayLanguage
    ElseIf tmli = msoLanguageIDEnglishUS Then
         gDisplayLanguage = "E"
    Else
         gDisplayLanguage = "E"
    End If
    '
    gUsePersonID = False
    gUseADDRID = False
    'gRerunQuery = False

    gFromDynasty = -1
    gToDynasty = -1
è¡¨ - 80


    Me.CmdAllPlaces.Enabled = False
    Me.ChkPlaceLimit.Enabled = False
    'Me.ChkIndexYear.Value = True
    If DCount("*", "ZZ_STORE_PERSON_ID") > 0 Then
        CmdRecallID.Enabled = True
    End If
    '
    ' Clear the Edge output table
    '
    Set cmdDel = New ADODB.Command
    cmdDel.ActiveConnection = CurrentProject.Connection
    cmdDel.CommandType = adCmdText
    '
    Set gRstEdge = Forms!LookAtNetworks!ZZ_SOCIAL_NETWORK.Form.Recordset
    '
    If gRstEdge.RecordCount > 0 Then
        '
        Set Forms!LookAtNetworks!ZZ_SOCIAL_NETWORK.Form.Recordset = _
            CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SN", dbOpenDynaset)
        gRstEdge.Close
        '
        cmdDel.CommandText = "Delete * from ZZ_SOCIAL_NETWORK"
        cmdDel.Execute tRecDeleted
        '
        Set gRstEdge = CurrentDb.OpenRecordset("ZZ_SOCIAL_NETWORK", dbOpenDynaset)
        Set Forms!LookAtNetworks!ZZ_SOCIAL_NETWORK.Form.Recordset = gRstEdge
        '
    End If
    '
    Set Forms!LookAtNetworks!ZZ_SOCIAL_NETWORK_AGGREGATED.Form.Recordset = _
        CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SN", dbOpenDynaset)
    '
    cmdDel.CommandText = "Delete * from ZZ_SOCIAL_NETWORK_AGGREGATE"
    cmdDel.Execute tRecDeleted
    '
    Set ZZ_SOCIAL_NETWORK_AGGREGATED.Form.Recordset = _
        CurrentDb.OpenRecordset("ZZ_SOCIAL_NETWORK_AGGREGATE", dbOpenDynaset)
    '
    ' Clear the Node output table
    '
    Set tRstDummy = ZZ_SCRATCH_PEOPLE.Form.Recordset
    '
    If tRstDummy.RecordCount > 0 Then
        '
        Set ZZ_SCRATCH_PEOPLE.Form.Recordset = CurrentDb.OpenRecordset("Z_SCRATCH_DUMMY_SP", dbOpenDynaset)
        tRstDummy.Close
        '
        cmdDel.CommandText = "Delete * from ZZ_SCRATCH_PEOPLE"
        cmdDel.Execute tRecDeleted
        '
        Set ZZ_SCRATCH_PEOPLE.Form.Recordset = CurrentDb.OpenRecordset("ZZ_SCRATCH_PEOPLE", dbOpenDynaset)
    End If
    '
    ' we no longer need to open the message window
    '
    'DoCmd.OpenForm "ZZZ_DONT_PANIC", acNormal
    'Forms("ZZZ_DONT_PANIC").Visible = False

    'initialize some global variables
    gMaxFilterTotal = 29
    gMaxFilterScholar = 7
    gMaxFilterWritings = 9
    gMaxFilterPolitics = 6
    gMaxFilterMilitary = 2
    gFilterTotalCount = 29
    gFilterScholarCount = 7
    gFilterWritingsCount = 9
    gFilterPoliticsCount = 6
    gFilterMilitaryCount = 2

    ' zap the scratch files

    cmdDel.CommandText = "Delete * from ZZ_SCRATCH_ADDR_LIST"
    cmdDel.Execute tRecDeleted

    cmdDel.CommandText = "Delete * from ZZ_SCRATCH_IMPORT_PEOPLE"
    cmdDel.Execute tRecDeleted

End Sub
è¡¨ - 81

Private Sub CmdDeselect_Click()
On Error GoTo Err_CmdDeselect_Click

    Dim tTrue As Integer, tFalse As Integer
    tTrue = -1
    tFalse = 0

    ChkFriendship.Value = tFalse
    ChkMedicine.Value = tFalse
    ChkReligion.Value = tFalse
    ChkFamily.Value = tFalse
    ChkFinance.Value = tFalse

    ChkMilitarySupport.Value = tFalse
    ChkMilitaryOppose.Value = tFalse
    ChkMilitaryAll.Value = tFalse

    ChkScholarshipAll.Value = tFalse
    ChkSchTeacher.Value = tFalse
    ChkSchAffiliation.Value = tFalse
    ChkSchTopic.Value = tFalse
    ChkSchMember.Value = tFalse
    ChkSchPatron.Value = tFalse
    ChkSchLitArt.Value = tFalse
    ChkSchAttack.Value = tFalse

    ChkPoliticsAll.Value = tFalse
    ChkPolEqual.Value = tFalse
    ChkPolSub.Value = tFalse
    ChkPolSup.Value = tFalse
    ChkPolSupport.Value = tFalse
    ChkPolSponsor.Value = tFalse
    ChkPolOppose.Value = tFalse

    ChkWritingsAll.Value = tFalse
    ChkWriCommem.Value = tFalse
    ChkWriEpitaph.Value = tFalse
    ChkWriPreface.Value = tFalse
    ChkWriRitual.Value = tFalse
    ChkWriBiog.Value = tFalse
    ChkWriExplain.Value = tFalse
    ChkWriMottos.Value = tFalse
    ChkWriLetters.Value = tFalse
    ChkWriOccasion.Value = tFalse


Exit_CmdDeselect_Click:
    Exit Sub

Err_CmdDeselect_Click:
    MsgBox Err.Description
    Resume Exit_CmdDeselect_Click

End Sub
Private Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 89) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

           Do While ti < 89 And Not .EOF
               If !c_form = "LAN" Then
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
è¡¨ - 82

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
        Me.CmdSelectPerson.Caption = tLabelLanguage(tLang, 1)
        Me.CmdAllPeople.Caption = tLabelLanguage(tLang, 2)
        Me.CmdSelectPlace.Caption = tLabelLanguage(tLang, 3)
        Me.CmdAllPlaces.Caption = tLabelLanguage(tLang, 4)
        Me.LblFrom.Caption = tLabelLanguage(tLang, 5)
        Me.LblTo.Caption = tLabelLanguage(tLang, 6)
        Me.LblMaxNode.Caption = tLabelLanguage(tLang, 7)
        Me.LblMaxLoop.Caption = tLabelLanguage(tLang, 8)
        Me.LblKin.Caption = tLabelLanguage(tLang, 9)
        Me.LblNonKin.Caption = tLabelLanguage(tLang, 10)
        Me.LblMale.Caption = tLabelLanguage(tLang, 11)
        Me.LblFemale.Caption = tLabelLanguage(tLang, 12)
        Me.CmdRun.Caption = tLabelLanguage(tLang, 13)

           Me.CmdFantiDisplay.Caption = tLabelLanguage(tLang, 14)
           Me.CmdJiantiDisplay.Caption = tLabelLanguage(tLang, 15)

           Me.PageRelFilter.Caption = tLabelLanguage(tLang, 16)
           Me.PageEdgeData.Caption = tLabelLanguage(tLang, 17)
           Me.PageNodeData.Caption = tLabelLanguage(tLang, 18)

           Me.LblChkSelectAll.Caption = tLabelLanguage(tLang, 19)
           Me.LblChkFriendship.Caption = tLabelLanguage(tLang, 20)
           Me.LblChkFamily.Caption = tLabelLanguage(tLang, 21)
           Me.LblChkReligion.Caption = tLabelLanguage(tLang, 22)
           Me.LblChkFinance.Caption = tLabelLanguage(tLang, 23)
           Me.LblChkMedicine.Caption = tLabelLanguage(tLang, 24)
           Me.LblChkMilitaryAll.Caption = tLabelLanguage(tLang, 25)
           Me.LblChkMilitarySupport.Caption = tLabelLanguage(tLang, 26)
           Me.LblChkMilitaryOppose.Caption = tLabelLanguage(tLang, 27)

           Me.LblChkScholarshipAll.Caption = tLabelLanguage(tLang, 28)
           Me.LblChkSchTeacher.Caption = tLabelLanguage(tLang, 29)
           Me.LblChkSchAffiliation.Caption = tLabelLanguage(tLang, 30)
           Me.LblChkSchTopic.Caption = tLabelLanguage(tLang, 31)
           Me.LblChkSchMember.Caption = tLabelLanguage(tLang, 32)
           Me.LblChkSchPatron.Caption = tLabelLanguage(tLang, 33)
           Me.LblChkSchLitArt.Caption = tLabelLanguage(tLang, 34)
           Me.LblChkSchAttack.Caption = tLabelLanguage(tLang, 35)

           Me.LblChkPoliticsAll.Caption = tLabelLanguage(tLang, 36)
           Me.LblChkPolEqual.Caption = tLabelLanguage(tLang, 37)
           Me.LblChkPolSub.Caption = tLabelLanguage(tLang, 38)
           Me.LblChkPolSup.Caption = tLabelLanguage(tLang, 39)
           Me.LblChkPolSupport.Caption = tLabelLanguage(tLang, 40)
           Me.LblChkPolSponsor.Caption = tLabelLanguage(tLang, 41)
           Me.LblChkPolOppose.Caption = tLabelLanguage(tLang, 42)

           Me.LblChkWritingsAll.Caption = tLabelLanguage(tLang, 43)
           Me.LblChkWriCommem.Caption = tLabelLanguage(tLang, 44)
           Me.LblChkWriEpitaph.Caption = tLabelLanguage(tLang, 45)
           Me.LblChkWriPreface.Caption = tLabelLanguage(tLang, 46)
           Me.LblChkWriRitual.Caption = tLabelLanguage(tLang, 47)
           Me.LblChkWriBiog.Caption = tLabelLanguage(tLang, 48)
           Me.LblChkWriExplain.Caption = tLabelLanguage(tLang, 49)
           Me.LblChkWriMotto.Caption = tLabelLanguage(tLang, 50)
           Me.LblChkWriLetters.Caption = tLabelLanguage(tLang, 51)
           Me.LblChkWriOccasion.Caption = tLabelLanguage(tLang, 52)

           Me.CmdUCINet.Caption = tLabelLanguage(tLang, 53)
           Me.CmdPajek.Caption = tLabelLanguage(tLang, 54)
           ' Me.CmdUTF8Pajek.Caption = tLabelLanguage(tLang, 55)
è¡¨ - 83

           Me.CmdGIS.Caption = tLabelLanguage(tLang, 56)
           Me.CmdGUESS.Caption = tLabelLanguage(tLang, 57)
           Me.CmdClose.Caption = tLabelLanguage(tLang, 58)

           Me.LblSaveClipboard.Caption = tLabelLanguage(tLang, 59)

           Me.Caption = tLabelLanguage(tLang, 60)

           Me.CmdImportPeople.Caption = tLabelLanguage(tLang, 61)
           Me.CmdImportPlaces.Caption = tLabelLanguage(tLang, 62)
           'Me.LblChkIndexYear.Caption = tLabelLanguage(tLang, 63)

           Me.PageAggregate.Caption = tLabelLanguage(tLang, 64)

           Me.LblIncludeID.Caption = tLabelLanguage(tLang, 65)
           Me.LblMaxUp.Caption = tLabelLanguage(tLang, 66)
           Me.LblMaxDwn.Caption = tLabelLanguage(tLang, 67)
           Me.LblMaxCol.Caption = tLabelLanguage(tLang, 68)
           Me.LblMaxMar.Caption = tLabelLanguage(tLang, 69)
           Me.LblKinshipParam.Caption = tLabelLanguage(tLang, 70)
           Me.LblDisplay.Caption = tLabelLanguage(tLang, 71)
           Me.CmdHelp.Caption = tLabelLanguage(tLang, 72)
           'Me.CmdRerun.Caption = tLabelLanguage(tLang, 73)
           Me.CmdStoreID.Caption = tLabelLanguage(tLang, 74)
           Me.CmdRecallID.Caption = tLabelLanguage(tLang, 75)
           Me.LblChkDegree.Caption = tLabelLanguage(tLang, 76)
           Me.LblXYRef.Caption = tLabelLanguage(tLang, 77)
           Me.Label152.Caption = tLabelLanguage(tLang, 78)
           Me.LblChkSubUnits.Caption = tLabelLanguage(tLang, 79)

           Me.LblDynasties.Caption = tLabelLanguage(tLang, 80)
           Me.CmdFromDynasty.Caption = tLabelLanguage(tLang, 81)
           Me.CmdToDynasty.Caption = tLabelLanguage(tLang, 82)
           Me.CmdAllDynasties.Caption = tLabelLanguage(tLang, 83)

           Me.LblIndexYears.Caption = tLabelLanguage(tLang, 84)
           Me.LblOptNoDates.Caption = tLabelLanguage(tLang, 85)
           Me.LblOptIndexYears.Caption = tLabelLanguage(tLang, 86)
           Me.LblOptDynasties.Caption = tLabelLanguage(tLang, 87)

           Me.CmdNeo4j.Caption = tLabelLanguage(tLang, 88)

        If gDisplayLanguage = "S" Or gDisplayLanguage = "T" Then
             Me.CmdClose.Caption = ChrW(&H9000) + ChrW(&H51FA)
        Else
             Me.CmdClose.Caption = "Exit"
        End If
    End If

End Sub

Private Sub CmdHelp_Click()
On Error GoTo Err_CmdHelp_Click

    Dim tStrPDF As String

    tStrPDF = Application.CurrentProject.Path + "\HelpFiles\HelpFile_LookAtNetworks.pdf"

    'MsgBox tStrPDF

    Application.FollowHyperlink tStrPDF, , True


Exit_CmdHelp_Click:
    Exit Sub

Err_CmdHelp_Click:
    MsgBox Err.Description
    Resume Exit_CmdHelp_Click

End Sub

Private Sub writeKML()
'<kml xmlns="http://www.opengis.net/kml/2.2">
'<Document>
'   <name>ExtendedData+SchemaData</name>
'   <open>1</open>
'   <!-- Create a balloon template referring to the user-defined type -->
'   <Style id="assoc-balloon-template">
'       <BalloonStyle>
è¡¨ - 84

'            <text>
'               <![CDATA[
'               $[AssocPerson/PersonNameHZ] <br/>
'               ID: $[AssocPerson/PersonID] <br/>
'               Index Year: $[AssocPerson/IndexYear] <br/>
'               Address: $[AssocPerson/AddrName] $[AssocPerson/AddrNameHZ] <br/>
'               XY Count: $[AssocPerson/XYCount] <br/><br/>
'                ]]>
'            </text>
'       </BalloonStyle>
'   </Style>
'   <!-- Declare the type "AssocPerson" with 6 fields -->
'   <Schema name="AssocPerson" id="AssocPersonId">
'       <SimpleField type="string" name="PersonNameHZ">
'            <displayName><![CDATA[<b>Person</b>]]></displayName>
'       </SimpleField>
'       <SimpleField type="string" name="AddrName">
'            <displayName><![CDATA[<b>Person</b>]]></displayName>
'       </SimpleField>
'       <SimpleField type="string" name="AddrNameHZ">
'            <displayName><![CDATA[<b>Person</b>]]></displayName>
'       </SimpleField>
'       <SimpleField type="uint" name="PersonID">
'            <displayName><![CDATA[ID]]></displayName>
'       </SimpleField>
'       <SimpleField type="int" name="IndexYear">
'            <displayName><![CDATA[Index Year]]></displayName>
'       </SimpleField>
'       <SimpleField type="int" name="XYCount">
'            <displayName><![CDATA[XY Count]]></displayName>
'       </SimpleField>
'   </Schema>
'   <!-- Instantiate some Placemarks extended with AssocPerson fields -->
'   <Placemark>
'       <name>Easy trail</name>
'       <styleUrl>#assoc-balloon-template</styleUrl>
'       <ExtendedData>
'            <SchemaData schemaUrl="#AssocPersonId">
'                <SimpleData name="PersonID">3.14159</SimpleData>
'                <SimpleData name="PersonNameHZ">Pi in the sky</SimpleData>
'                <SimpleData name="IndexYear">10</SimpleData>
'                <SimpleData name="AddrName">Pi in the sky</SimpleData>
'                <SimpleData name="AddrNameHZ">Pi in the sky</SimpleData>
'                <SimpleData name="XYCount">10</SimpleData>
'            </SchemaData>
'       </ExtendedData>
'       <Point>
'            <coordinates>-122.000,37.002</coordinates>
'       </Point>
'   </Placemark>
'   <Placemark>
'       <name>Difficult trail</name>
'       <styleUrl>#assoc-balloon-template</styleUrl>
'       <ExtendedData>
'            <SchemaData schemaUrl="#AssocPersonId">
'                <SimpleData name="TrailHeadName">Mount Everest</SimpleData>
'                <SimpleData name="TrailLength">347.45</SimpleData>
'                <SimpleData name="ElevationGain">10000</SimpleData>
'            </SchemaData>
'       </ExtendedData>
'       <Point>
'            <coordinates>-121.998,37.0078</coordinates>
'       </Point>
'   </Placemark>
'</Document>
'</kml>

    Dim tStrKML As String
    '
    ' This program will dump the results to a .gis file
    '
    If ZZ_SCRATCH_PEOPLE.Form.Recordset.RecordCount = 0 Then
        MsgBox "There are no records to save."
        GoTo Exit_writeKML
    End If
    '
    Dim tStream As ADODB.Stream
    Set tStream = New ADODB.Stream

    If GISFrame.Value = 1 Then
è¡¨ - 85

            tStream.Charset = "utf-8"
            tCodeStr = "UTF8"
     Else
         tStream.Charset = "gb2312"
         tCodeStr = "GB2312"
     End If
     tStream.Mode = adModeReadWrite
     tStream.Type = adTypeText
     tStream.Open
     '
     ' next get a file
     '
     Dim dlgSaveAs As FileDialog
     Dim tFileNum As Integer
     Dim tFileName As String, tFN As Variant, tFemale As String
     Dim tRstNode As DAO.Recordset
     Dim tStr As String, tC As String, tDQ As String, ti As Integer
     Dim tFileSystem, tGDF

     Set dlgSaveAs = Application.FileDialog(msoFileDialogSaveAs)

     dlgSaveAs.InitialFileName = "network_gis_" + tCodeStr + ".kml"
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
              GoTo Exit_writeKML
         Else
              ' make sure the file name has a txt extension
              If Len(tFileName) < 5 Then
                  tFileName = tFileName + ".kml"
              ElseIf Not (LCase(Right(tFileName, 4)) = ".kml") Then
                  tFileName = tFileName + ".kml"
              End If
         End If
         '
         ' write the file
         '
         'Name,NameChn,Female,IndexYear,AddrName,AddrChn,X,Y,xy_count,NodeDist
         '
         ' process the table
         '
         Set tRstNode = ZZ_SCRATCH_PEOPLE.Form.Recordset
         tC = Chr(9) ' the tab
         tDQ = Chr(34) ' the double quotation mark
         '
         ' write the header
         '
         tStream.WriteText "<kml xmlns=" + tDQ + "http://www.opengis.net/kml/2.2" + tDQ + ">", adWriteLine
         tStream.WriteText "<Document>", adWriteLine
         tStream.WriteText tC + "<name>ExtendedData+SchemaData</name>", adWriteLine
         tStream.WriteText tC + "<open>1</open>", adWriteLine '"
         tStream.WriteText tC + "<!-- Create a balloon template referring to the user-defined type -->", adWriteLi
ne
        tStream.WriteText tC + "<Style id=" + tDQ + "assoc-balloon-template" + tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + "<BalloonStyle>", adWriteLine
        tStream.WriteText tC + tC + tC + "<text>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "<![CDATA[", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "$[AssocPerson/PersonNameHZ] <br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "ID: $[AssocPerson/PersonID] <br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "Index Year: $[AssocPerson/IndexYear] <br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "Address: $[AssocPerson/AddrName] $[AssocPerson/AddrNameHZ] <br/>",
 adWriteLine
        tStream.WriteText tC + tC + tC + tC + "XY Count: $[AssocPerson/XYCount] <br/><br/>", adWriteLine
        tStream.WriteText tC + tC + tC + tC + "]]>", adWriteLine
        tStream.WriteText tC + tC + tC + "</text>", adWriteLine
        tStream.WriteText tC + tC + "</BalloonStyle>", adWriteLine
        tStream.WriteText tC + "</Style>", adWriteLine
        tStream.WriteText tC + "<!-- Declare the type " + tDQ + "AssocPerson" + tDQ + " with 6 fields -->", adWri
teLine
        tStream.WriteText tC + "<Schema name=" + tDQ + "AssocPerson" + tDQ + " id=" + tDQ + "AssocPersonId" + tDQ
 + ">", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "PersonNameHZ"
è¡¨ - 86

 + tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[<b>Person</b>]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "AddrName" + t
DQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[<b>Person</b>]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "AddrNameHZ" +
 tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[<b>Person</b>]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "uint" + tDQ + " name=" + tDQ + "PersonID" + tDQ
 + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[ID]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "string" + tDQ + " name=" + tDQ + "IndexYear" +
tDQ + ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[Index Year]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + tC + "<SimpleField type=" + tDQ + "int" + tDQ + " name=" + tDQ + "XYCount" + tDQ +
 ">", adWriteLine
        tStream.WriteText tC + tC + tC + "<displayName><![CDATA[XY Count]]></displayName>", adWriteLine
        tStream.WriteText tC + tC + "</SimpleField>", adWriteLine
        tStream.WriteText tC + "</Schema>", adWriteLine

           With tRstNode
               '
               .MoveFirst
               Do While Not .EOF
                   ' must guard against NULLs, even where there should not be any
                   '
                   ' write the point header
                   '
                   tStream.WriteText tC + "<Placemark>", adWriteLine

                   If IsNull(!c_name) Then
                        tStr = "[Bad Data]"
                   Else
                        tStr = !c_name
                   End If
                   tStream.WriteText tC + tC + "<name>" + tStr + "</name>", adWriteLine

                   tStream.WriteText tC + tC + "<styleUrl>#assoc-balloon-template</styleUrl>", adWriteLine
                   '
                   ' Index Year as time stamp
                   '
                   If IsNull(!c_index_year) Then
                        tStr = "N/A"
                   Else
                        tStr = Str(!c_index_year)
                   End If
                   tStream.WriteText tC + tC + "<TimeStamp>" + tStr + "</TimeStamp>", adWriteLine
                   '
                   tStream.WriteText tC + tC + "<ExtendedData>", adWriteLine
                   tStream.WriteText tC + tC + tC + "<SchemaData schemaUrl=" + tDQ + "#AssocPersonId" + tDQ + ">", a
dWriteLine
                '
                ' person ID
                '
                tStr = Str(!c_person_id)
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "PersonID" + tDQ + ">" + tStr +
 "</SimpleData>", adWriteLine
                '
                ' Chinese Name
                '
                If IsNull(!c_name_chn) Then
                     tStr = "[Bad Data]"
                Else
                     If Trim(!c_name_chn) = "" Then
                          tStr = "[?]"
                     Else
                          tStr = !c_name_chn
                     End If
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "PersonNameHZ" + tDQ + ">" + tS
tr + "</SimpleData>", adWriteLine
                '
                ' Index Year
                '
                If IsNull(!c_index_year) Then
è¡¨ - 87

                          tStr = "N/A"
                   Else
                     tStr = Str(!c_index_year)
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "IndexYear" + tDQ + ">" + tStr
+ "</SimpleData>", adWriteLine
                '
                ' Address Name
                '
                If IsNull(!c_addr_name) Then
                     tStr = "[?]"
                ElseIf Trim(!c_addr_name) = "" Then
                     tStr = "[?]"
                Else
                     tStr = !c_addr_name
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "AddrName" + tDQ + ">" + tStr +
 "</SimpleData>", adWriteLine
                '
                ' Address Name Chinese
                '
                If IsNull(!c_addr_chn) Then
                     tStr = "[?]"
                ElseIf Trim(!c_addr_chn) = "" Then
                     tStr = "[?]"
                Else
                     tStr = !c_addr_chn
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "AddrNameHZ" + tDQ + ">" + tStr
 + "</SimpleData>", adWriteLine
                '
                ' XY Count
                '
                If IsNull(!xy_count) Then
                     tStr = "0"
                Else
                     tStr = Str(!xy_count)
                End If
                tStream.WriteText tC + tC + tC + tC + "<SimpleData name=" + tDQ + "XYCount" + tDQ + ">" + tStr +
"</SimpleData>", adWriteLine
                '
                tStream.WriteText tC + tC + tC + "</SchemaData>", adWriteLine
                tStream.WriteText tC + tC + "</ExtendedData>", adWriteLine
                tStream.WriteText tC + tC + "<Point>", adWriteLine
                '
                ' coordinates
                If IsNull(!x_coord) Then
                     tStr = "0"
                Else
                     tStr = Str(!x_coord)
                End If

                   If IsNull(!y_coord) Then
                        tStr = tStr + ",0"
                   Else
                        tStr = tStr + "," + Str(!y_coord)
                   End If
                   tStream.WriteText tC + tC + tC + "<coordinates>" + tStr + "</coordinates>", adWriteLine
                   '
                   ' footer
                   '
                   tStream.WriteText tC + tC + "</Point>", adWriteLine
                   tStream.WriteText tC + "</Placemark>", adWriteLine
                   .MoveNext
               Loop
           End With
           '
           ' footer
           '
           tStream.WriteText "</Document>", adWriteLine
           tStream.WriteText "</kml>", adWriteLine
    Else
        'The user pressed Cancel.
    End If

    ' now make sure all the data is copied to tStream
    tStream.Flush
    ' and write the stream to the file
    tStream.SaveToFile tFileName, adSaveCreateOverWrite
    '
è¡¨ - 88

    Set tRstNode = Nothing

    tStream.Close
    Set tStream = Nothing
    'Set the object variable to Nothing.
    Set dlgSaveAs = Nothing

Exit_writeKML:
    Exit Sub

Err_writeKML:
    MsgBox Err.Description
    Resume Exit_writeKML

End Sub
Private Sub CheckRunCriteria()
    ' This routine checks whether it is OK to run the query and either enables or disables the CmdRun button

    Dim tTrue As Integer, tFalse As Integer
    tTrue = -1
    tFalse = 0

    '   using nonkin

    If ChkNonKin.Value = tTrue Then
         If gFilterTotalCount = gMaxFilterTotal Then
              If gUsePersonID Or gUseADDRID Then
                   CmdRun.Enabled = True
              Else
                   CmdRun.Enabled = False
              End If
         ElseIf gFilterTotalCount = 0 Then
              If (gUsePersonID Or gUseADDRID) And ChkKin.Value = tTrue Then
                   CmdRun.Enabled = True
              Else
                   CmdRun.Enabled = False
              End If
         Else
              CmdRun.Enabled = True
         End If
    ElseIf ChkKin.Value = tTrue Then
         If gUsePersonID Or gUseADDRID Then
              CmdRun.Enabled = True
         Else
              CmdRun.Enabled = False
         End If
    Else
         CmdRun.Enabled = False
    End If
    '

End Sub
Private Sub CmdStoreID_Click()
    Dim cmdSQL As ADODB.Command, tRecCount As Variant

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

    tStrQuery = "INSERT INTO ZZ_STORE_PERSON_ID ( c_personid ) SELECT DISTINCT ZZ_SCRATCH_PEOPLE.c_person_id FROM
 ZZ_SCRATCH_PEOPLE"

    cmdSQL.CommandText = tStrQuery
    cmdSQL.Execute tRecCount
    MsgBox "Person IDs successfully stored. Click on 'Recall Person IDs' to reuse these IDs in other forms."
    '
    ' update storage source
    cmdSQL.CommandText = "UPDATE PersonIDSource SET SourceForm ='Networks' WHERE PersonIDSource.LineNum =1"
    cmdSQL.Execute tRecCount
è¡¨ - 89


End Sub
Private Sub CmdRecallID_Click()
On Error GoTo Err_CmdRecallID_Click
    Dim tStrSQL As String, cmdSQL As ADODB.Command, tRecCount As Variant, tRst As DAO.Recordset

     Set cmdSQL = New ADODB.Command
     cmdSQL.ActiveConnection = CurrentProject.Connection
     cmdSQL.CommandType = adCmdText

    If DCount("*", "ZZ_SCRATCH_IMPORT_PEOPLE") > 0 Then
         ' Display message.
         If MsgBox("Do you wish to replace the current import list?", vbYesNo + vbQuestion + vbDefaultButton2) = v
bNo Then
              Exit Sub
         Else
              cmdSQL.CommandText = "Delete * from ZZ_SCRATCH_IMPORT_PEOPLE"
              cmdSQL.Execute tRecCount
         End If
    End If
    '
    ' Clear the error table now that we are ready to go
    '
    cmdSQL.CommandText = "Delete * from InputErrorList"
    cmdSQL.Execute tRecCount
    '
    ' copy the IDs
    '
    tStrSQL = "INSERT INTO ZZ_SCRATCH_IMPORT_PEOPLE ( c_person_id ) SELECT DISTINCT c_personid FROM ZZ_STORE_PERS
ON_ID"

     cmdSQL.CommandText = tStrSQL
     cmdSQL.Execute tRecCount

     If tRecCount = 0 Then
         TxtName.Value = "[Error]"
         TxtNameChn.Value = "[Error]"

            gUsePersonID = False
            CmdAllPeople.Enabled = False
            CmdRun.Enabled = False
            'CmdRerun.Enabled = True
     Else
            If tRecCount = 1 Then
                Set tRst = CurrentDb.OpenRecordset("SELECT ZZ_STORE_PERSON_ID.c_personid FROM ZZ_STORE_PERSON_ID")
                tRst.MoveFirst
                tID = tRst!c_personid

            Set tRst = CurrentDb.OpenRecordset("SELECT BIOG_MAIN.c_name, BIOG_MAIN.c_name_chn FROM BIOG_MAIN WHER
E (((BIOG_MAIN.c_personid)=" + Str(tID) + "))")
            tRst.MoveFirst

                   TxtName.Value = tRst!c_name
                   TxtNameChn.Value = tRst!c_name_chn
                   tRst.Close
                   Set tRst = Nothing
            Else
                   TxtName.Value = "[Recalled List]"
                   TxtNameChn.Value = "[" + ChrW(&H53EC) + ChrW(&H56DE) + ChrW(&H7684) + ChrW(&H4EBA) + ChrW(&H540D) + "
]"
            End If
            ' zhao = 53EC, hui = 56DE, de = 7684, ren = 4EBA, ming = 540D

         gUsePersonID = True
         CmdAllPeople.Enabled = True
         CmdRun.Enabled = True
         'CmdRerun.Enabled = Talse
     End If

     Set cmdSQL = Nothing

Exit_CmdRecallID_Click:
    Exit Sub

Err_CmdRecallID_Click:
    MsgBox Err.Description
    Resume Exit_CmdRecallID_Click

End Sub
è¡¨ - 90

Private Sub FrameFilterYears_Click()
    '
    ' the simplest approach is to turn it all off and then turn on the appropriate objects

    ' disable all
    Me.CmdFromDynasty.Enabled = False
    Me.CmdToDynasty.Enabled = False
    Me.CmdAllDynasties.Enabled = False
    Me.TxtFromDynasty.Enabled = False
    Me.TxtFromDynastyPY.Enabled = False
    Me.TxtToDynasty.Enabled = False
    Me.TxtToDynastyPY.Enabled = False
    Me.TxtFromDynasty.Locked = False
    Me.TxtFromDynastyPY.Locked = False
    Me.TxtToDynasty.Locked = False
    Me.TxtToDynastyPY.Locked = False

    Me.TxtFrom.Enabled = False
    Me.TxtTo.Enabled = False

    gUseIndexYears = False
    gUseDynasties = False

    If FrameFilterYears.Value = 2 Then

           ' enable index years
           Me.TxtFrom.Enabled = True
           Me.TxtTo.Enabled = True
           gUseIndexYears = True

    ElseIf FrameFilterYears.Value = 3 Then

           ' enable dynasties
           Me.CmdFromDynasty.Enabled = True
           Me.CmdToDynasty.Enabled = True
           Me.CmdAllDynasties.Enabled = True
           Me.TxtFromDynasty.Enabled = True
           Me.TxtFromDynastyPY.Enabled = True
           Me.TxtToDynasty.Enabled = True
           Me.TxtToDynastyPY.Enabled = True
           Me.TxtFromDynasty.Locked = True
           Me.TxtFromDynastyPY.Locked = True
           Me.TxtToDynasty.Locked = True
           Me.TxtToDynastyPY.Locked = True
           gUseDynasties = True

    End If
    'MsgBox "FrameFilterYears = " + Str(FrameFilterYears.Value)
    'MsgBox "gUseIndexYears = " + IIf(gUseIndexYears, "True", "False")

End Sub

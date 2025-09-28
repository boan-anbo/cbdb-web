'Build 025
'***************************************************************************
'
' Authors: JKP Application Development Services, info@jkp-ads.com, http://www.jkp-ads.com
'           Peter Thornton, pmbthornton@gmail.com
'
' (c)2013, all rights reserved to the authors
'
' You are free to use and adapt the code in these modules for
' your own purposes and to distribute as part of your overall project.
' However all headers and copyright notices should remain intact
'
' You may not publish the code in these modules, for example on a web site,
' without the explicit consent of the authors
'***************************************************************************

'-------------------------------------------------------------------------
' Module    : clsNode
' Company   : JKP Application Development Services (c)
' Author    : Jan Karel Pieterse (www.jkp-ads.com)
' Created   : 15-01-2013
' Purpose   : Holds all information of a node of the tree
'-------------------------------------------------------------------------
Option Explicit

Private mbExpanded As Boolean

Private mcolChildNodes As Collection

Private moParentNode As clsNode
Private moLastActiveNode As clsNode
Private moTree As clsTreeview

Private msKey As String
Private mvCaption
Private msControlTipText As Variant

Private mlChecked As Long         ' PT checkbox tristate boolean 0/-1 or 1 for null
'Private mbVisible As Boolean         ' PT determines if the node can be displayed
Private mnIndex As Long              ' PT order added to Treeview's mcolNodes, won't change
Private mlVisIndex As Long           ' PT the visible order in the current view, changes with expand/collapse
Private mvIconMainKey                ' PT string name or numeric index as icon Key for the Image collection
Private mvIconExpandedKey            ' PT ditto for expanded icon
Private mlIconCnt As Long            ' PT number of icons availabel for this node 0, 1 or 2
Private msngTextWidth As Single      ' PT autosized text width before the node is widened beyond the frame
Private mlBackColor As Long          ' PT
Private mbBold As Boolean            ' PT
Private mlForeColor As Long          ' PT
Private mvTag

Private WithEvents mctlControl As MSForms.Label
Private WithEvents mctlExpander As MSForms.Label
Private WithEvents moEditBox As MSForms.TextBox      ' PT editbox
Private WithEvents mctlCheckBox As MSForms.Label     ' PT checkbox

Private mctlExpanderBox As MSForms.Label
Private mctlVLine As MSForms.Label ' PT vertical line, only the first child node with children will have a verti
cal line
Private mctlHLine As MSForms.Label ' PT horizontal line
Private mctlIcon As MSForms.Image   ' PT separate icon image control

Public Enum ndSortOrder
    ndAscending = 1
    ndDescending = 2
End Enum
Public Enum ndCompareMethod
    ndBinaryCompare = 0
    ndTextCompare = 1
End Enum
Public Enum ndMouse
    ndDown = 1
    ndUp = 2
    ndMove = 3
    ndBeforeDragOver = 4
    ndBeforeDropOrPaste = 5
End Enum

#If Mac Then
    Const mcFullWidth As Long = 800
#Else
    Const mcFullWidth As Long = 600
#End If

'*********************
'* Public Properties *
'*********************

Public Property Get BackColor() As Long

    BackColor = mlBackColor ' if zero the treecaller will apply the frame container's backcolor

End Property

Public Property Let BackColor(lColor As Long)
'PT if lColor is written as 0/black, change it to 1 as 0 means default
    mlBackColor = lColor
    If mlBackColor = 0 Then mlBackColor = 1
    If Not mctlControl Is Nothing Then
        mctlControl.BackColor = lColor
    End If
End Property

Public Property Get Bold() As Boolean
    Bold = mbBold
End Property

Public Property Let Bold(bBold As Boolean)
    mbBold = bBold
    If Not mctlControl Is Nothing Then
        mctlControl.Font.Bold = mbBold
    End If
End Property

Public Property Get Caption()
    Caption = mvCaption
End Property

Public Property Let Caption(ByVal vCaption)
    mvCaption = vCaption
    If Not mctlControl Is Nothing Then
        mctlControl.Caption = CStr(vCaption)
    End If
End Property

Public Property Get Checked()    ' PT
     ' Checked values are -1 true, 0 false, +1 mixed
     ' If TriState is enabled be careful not to return a potential +1 to a boolean or it'll coerce to True
    Checked = mlChecked
End Property

Public Property Let Checked(vChecked) ' PT
    Dim bFlag As Boolean, bTriState As Boolean
    Dim lChecked As Long
    Dim cChild As clsNode

    ' Checked values are -1 true, 0 false, +1 mixed
    ' if vChecked is a boolean Checked will coerce to -1 or 0
    ' if vChecked is Null Checked is set as +1

    If VarType(vChecked) = vbBoolean Then
        lChecked = vChecked
    ElseIf IsNull(vChecked) Then
        lChecked = 1
    ElseIf vChecked >= -1 And vChecked <= 1 Then
        lChecked = vChecked
    End If

    bFlag = lChecked <> mlChecked
    mlChecked = lChecked

    If Not mctlCheckBox Is Nothing And bFlag Then
        moTree.Changed = True
        UpdateCheckbox
    End If

    If Not moTree Is Nothing Then    ' eg during clone
        bFlag = moTree.CheckBoxes(bTriState)
        If bTriState Then
            If ParentNode.Caption <> "RootHolder" Then
                ParentNode.CheckTriStateParent
               End If

            If Not ChildNodes Is Nothing Then
                For Each cChild In ChildNodes
                     cChild.CheckTriStateChildren mlChecked
                Next
            End If
        End If
    End If

End Property

Public Property Get Child() As clsNode
' PT Returns a reference to the first Child node, if any
    On Error Resume Next
    Set Child = mcolChildNodes(1)
End Property

Public Property Get ChildNodes() As Collection
    Set ChildNodes = mcolChildNodes
End Property

Public Property Set ChildNodes(colChildNodes As Collection)
    Set mcolChildNodes = colChildNodes
End Property

Public Property Get ControlTipText() As String
    ControlTipText = msControlTipText
End Property

Public Property Let ControlTipText(ByVal sControlTipText As String)
    msControlTipText = sControlTipText
    If Not mctlControl Is Nothing Then
        mctlControl.ControlTipText = msControlTipText
    End If
End Property

Public Property Get Expanded() As Boolean
    Expanded = mbExpanded
End Property

Public Property Let Expanded(ByVal bExpanded As Boolean)
    mbExpanded = bExpanded
    If Not Me.Expander Is Nothing Then
        UpdateExpanded bControlOnly:=False
    ElseIf Not Me.Control Is Nothing Then
        UpdateExpanded bControlOnly:=True
    End If
End Property

Public Property Get ForeColor() As Long
    ForeColor = mlForeColor
End Property

Public Property Let ForeColor(lColor As Long)
'PT if lColor is written as 0/black, change it to 1 as 0 means default
    mlForeColor = lColor
    If mlForeColor = 0 Then mlForeColor = 1
    If Not mctlControl Is Nothing Then
        mctlControl.ForeColor = lColor
    End If
End Property

Public Property Get FirstSibling() As clsNode
    If Not moParentNode Is Nothing Then    ' PT Root has no parent
        Set FirstSibling = moParentNode.GetChild(1)
    End If
End Property

Public Property Get LastSibling() As clsNode
    If Not moParentNode Is Nothing Then    ' PT Root has no parent
        Set LastSibling = moParentNode.GetChild(-1)    ' -1 flags GetChild to return the last Child
    End If
End Property

Public Property Get ImageExpanded()
' PT string name or numeric index for the main icon key
    ImageExpanded = mvIconExpandedKey
End Property
Public Property Let ImageExpanded(vImageExpanded)
' PT string name or numeric index for an expanded icon key
    On Error GoTo errExit
    If Not IsMissing(vImageExpanded) Then
         If Not IsEmpty(vImageExpanded) Then
             If Len(mvIconMainKey) = 0 Then
                 mvIconMainKey = vImageExpanded
             End If
             mvIconExpandedKey = vImageExpanded
             mlIconCnt = 2
         End If
    End If
errExit:
End Property

Public Property Get ImageMain()
' PT string name or numeric index for the main icon key
    ImageMain = mvIconMainKey
End Property

Public Property Let ImageMain(vImageMain)
' PT string name or numeric index for the main icon key
    On Error GoTo errExit
    If Not IsMissing(vImageMain) Then
         If Not IsEmpty(vImageMain) Then
             mvIconMainKey = vImageMain
             If mlIconCnt = 0 Then mlIconCnt = 1
         End If
    End If
errExit:
End Property

Public Property Get Key() As String
    Key = msKey
End Property

Public Property Let Key(ByVal sKey As String)
    Dim bIsInMainCol As Boolean
    Dim i As Long
    Dim cTmp As clsNode

    On Error GoTo errH

    If Tree Is Nothing Then
        msKey = sKey
        Exit Property
    ElseIf msKey = sKey Or Len(sKey) = 0 Then
        Exit Property
    End If

    On Error Resume Next
    Set cTmp = Tree.Nodes.Item(sKey)
    On Error GoTo errH

    If Not cTmp Is Nothing Then
        Err.Raise 457    ' standard duplicate key error
    End If

    ' to change the Key, remove Me and add Me back where it was with the new key
    For Each cTmp In Tree.Nodes
         i = i + 1
         If cTmp Is Me Then
             bIsInMainCol = True
             Exit For
         End If
    Next

    If bIsInMainCol Then
         With Tree.Nodes
             .Remove i
             If .Count Then
                  .Add Me, sKey, i
             Else
                  .Add Me
             End If
         End With
    Else
         ' Let Key called by via move/copy
    End If
    msKey = sKey

    Exit Property
errH:
    Err.Raise Err.Number, "Let Key", Err.Description
End Property

Public Property Get Level() As Long
    Dim lLevel As Long
    Dim cNode As clsNode

    On Error GoTo errH
    lLevel = -1
    Set cNode = Me.ParentNode
    While Not cNode Is Nothing
         lLevel = lLevel + 1
         Set cNode = cNode.ParentNode
    Wend
    Level = lLevel
    Exit Property
errH:
    #If DebugMode = 1 Then
         Stop
         Resume
    #End If
End Property

Public Property Get NextNode() As clsNode    ' can't name this proc 'Next' in VBA
' PT return the next sibling if there is one
    Dim i As Long
    Dim cNode As clsNode

    With Me.ParentNode
        For Each cNode In .ChildNodes
             i = i + 1
             If cNode Is Me Then
                 Exit For
             End If
        Next
        If .ChildNodes.Count > i Then
             Set NextNode = .ChildNodes(i + 1)
        End If
    End With
End Property

Public Property Get ParentNode() As clsNode
    Set ParentNode = moParentNode
End Property

Public Property Set ParentNode(oParentNode As clsNode)
    Set moParentNode = oParentNode
End Property

Public Property Get Previous() As clsNode
' PT return the previous sibling if there is one
    Dim i As Long
    Dim cNode As clsNode

    With Me.ParentNode
        For Each cNode In Me.ParentNode.ChildNodes
             i = i + 1
             If cNode Is Me Then
                 Exit For
             End If
        Next
        If i > 1 Then
             Set NextNode = .ChildNodes(i - 1)
        End If
    End With
End Property

Public Property Get Root() As clsNode
    Dim cTmp As clsNode
    Set cTmp = Me
    Do While Not cTmp.ParentNode.ParentNode Is Nothing
         Set cTmp = cTmp.ParentNode
    Loop
    Set Root = cTmp
End Property
Public Property Get Tag()
    Tag = mvTag
End Property

Public Property Let Tag(vTag)
    mvTag = vTag
End Property


'*****************************
'* Public subs and functions *
'*****************************

Public Function Sort(Optional ByVal ndOrder As ndSortOrder = ndAscending, _
                     Optional ByVal ndCompare As ndCompareMethod = ndTextCompare) As Boolean
' PT Sorts the child nodes,
'    returns True if the order has changed to flag Refresh should be called
    Dim sCaptions() As String
    Dim lStart As Long, lLast As Long, i As Long
    Dim colNodes As New Collection
    Dim bIsUnSorted As Boolean

      On Error GoTo errExit
      lStart = 1
      lLast = ChildNodes.Count       ' error if no childnodes to sort

      If lLast = 1 Then
          ' nothing to sort
          Exit Function
      End If

      ReDim idx(lStart To lLast) As Long
      ReDim sCaptions(lStart To lLast) As String
      For i = lStart To lLast
           idx(i) = i
           sCaptions(i) = ChildNodes.Item(i).Caption
      Next

      If ndOrder <> ndAscending Then ndOrder = -1    ' descending
      If ndCompare <> ndTextCompare Then ndCompare = ndBinaryCompare

      Call BinarySortIndexText(sCaptions(), lStart, lLast, idx, ndOrder, ndCompare)

      For i = lStart To lLast - 1
           If idx(i) <> idx(i + 1) - 1 Then
               bIsUnSorted = True
               Exit For
           End If
      Next

      If bIsUnSorted Then
          For i = lStart To lLast
               colNodes.Add ChildNodes(idx(i))
          Next
          Set ChildNodes = colNodes
          Sort = True
      End If

errExit:
'   Probably(?) any error was because there were no childnodes, no need to raise an error
End Function

Public Function AddChild(Optional sKey As String, _
                         Optional vCaption, _
                         Optional vImageMain, _
                         Optional vImageExpanded) As clsNode

      Dim cChild As clsNode

      On Error GoTo errH
      Set cChild = New clsNode

      With moTree.Nodes

          If Len(sKey) Then
100           .Add cChild, sKey
101
                 cChild.Key = sKey
          Else
                 .Add cChild
        End If

        cChild.Index = .Count
    End With

    If mcolChildNodes Is Nothing Then
        Set mcolChildNodes = New Collection
    End If

    mcolChildNodes.Add cChild

    With cChild
        If Not IsMissing(vImageMain) Then
            If Len(vImageMain) Then
                .ImageMain = vImageMain
            End If
        End If

        If Not IsMissing(vImageExpanded) Then
            If Len(vImageExpanded) Then
                .ImageExpanded = vImageExpanded
            End If
        End If

        .Caption = vCaption

        Set .Tree = moTree
        Set .ParentNode = Me
    End With

    Set AddChild = cChild

    Exit Function
errH:
    #If DebugMode = 1 Then
        Stop
        Resume
    #End If

    If Erl = 100 And Err.Number = 457 Then
         Err.Raise vbObjectError + 1, "clsNode.AddChild", "Duplicate key: '" & sKey & "'"
    Else
         Err.Raise Err.Number, "clsNode.AddChild", Err.Description
    End If
End Function

Public Function ChildIndex(sKey As String) As Long
'-------------------------------------------------------------------------
' Procedure : ChildIndex
' Company    : JKP Application Development Services (c)
' Author     : Jan Karel Pieterse (www.jkp-ads.com)
' Created    : 15-01-2013
' Purpose    : Returns the index of a childnode using its key
'-------------------------------------------------------------------------
    Dim cNode As clsNode
    Dim lCt As Long
    For Each cNode In mcolChildNodes
         lCt = lCt + 1
         If sKey = cNode.Key Then
             ChildIndex = lCt
             Set cNode = Nothing
             Exit Function
         End If
    Next
    Set cNode = Nothing
End Function

Public Function FullPath() As String
' PT, get all the grand/parent keys
' assumes use of key

    Dim s As String
    Dim cNode As clsNode

    On Error GoTo errDone
    s = Me.Key
    Set cNode = Me

    While Err.Number = 0
        Set cNode = cNode.ParentNode
           s = cNode.Key & "\" & s
    Wend

errDone:
    FullPath = s
End Function

Public Function GetChild(vKey As Variant) As clsNode
'-------------------------------------------------------------------------
' Procedure : GetChild
' Company   : JKP Application Development Services (c)
' Author    : Jan Karel Pieterse (www.jkp-ads.com)
' Created   : 15-01-2013
' Purpose   : Returns a childnode using its key
'-------------------------------------------------------------------------
    Dim cNode As clsNode
    Dim lIdx As Long

    If VarType(vKey) = vbString Then

           For Each cNode In mcolChildNodes
                If vKey = cNode.Key Then
                    Set GetChild = cNode
                    Set cNode = Nothing
                    Exit Function
                End If
           Next

    ElseIf Not mcolChildNodes Is Nothing Then
        lIdx = vKey
        If lIdx = -1 Then
            lIdx = mcolChildNodes.Count
        End If
        If lIdx > 0 Then
            Set GetChild = mcolChildNodes(lIdx)
        Else: Set mcolChildNodes = Nothing
        End If
    End If

    Set cNode = Nothing
End Function


'*************************************************************************
'*    Friend Properties, Subs & Funtions                                 *
'*    ** these procedures are visible throughout the project but should *
'*    ** only be used to communicate with the TreeView, ie clsTreeView   *
'*************************************************************************

Friend Property Get Control() As MSForms.Label
    Set Control = mctlControl
End Property

Friend Property Set Control(ctlControl As MSForms.Label)
    Set mctlControl = ctlControl
    If Not mctlControl Is Nothing Then
        If Not moTree Is Nothing Then
             Set mctlControl.Font = moTree.TreeControl.Font
        Else
             Stop
        End If
    End If
End Property

Friend Property Get Index() As Long       ' PT
    Index = mnIndex
End Property

Friend Property Let Index(idx As Long)
' PT Index: the order this node was added to Treeview's collection mcolNodes
'    Index will never increase but may decrement if previously added nodes are removed
    mnIndex = idx
End Property

Friend Property Let VisIndex(lVisIndex As Long)
    mlVisIndex = lVisIndex
End Property

Friend Property Get VisIndex() As Long        ' PT
    VisIndex = mlVisIndex
End Property

Friend Property Get Tree() As clsTreeview
    Set Tree = moTree
End Property

Friend Property Set Tree(oTree As clsTreeview)
    Set moTree = oTree
End Property

Friend Property Get Checkbox() As MSForms.Control
    Set Checkbox = mctlCheckBox
End Property

Friend Property Set Checkbox(oCtl As MSForms.Control)
    Set mctlCheckBox = oCtl
End Property

Friend Property Get Expander() As MSForms.Label
    Set Expander = mctlExpander
End Property

Friend Property Set Expander(ctlExpander As MSForms.Label)
    Set mctlExpander = ctlExpander
End Property

Friend Property Get ExpanderBox() As MSForms.Label
    Set ExpanderBox = mctlExpanderBox
End Property

Friend Property Set ExpanderBox(ctlExpanderBox As MSForms.Label)
    Set mctlExpanderBox = ctlExpanderBox
End Property

Friend Property Set HLine(ctlHLine As MSForms.Label)
    Set mctlHLine = ctlHLine
End Property

Friend Property Get HLine() As MSForms.Label
    Set HLine = mctlHLine
End Property

Friend Property Set Icon(ctlIcon As MSForms.Image)
    Set mctlIcon = ctlIcon
End Property

Friend Property Get Icon() As MSForms.Image
    Set Icon = mctlIcon
End Property

Friend Property Get TextWidth() As Single
    TextWidth = msngTextWidth
End Property

Friend Property Let TextWidth(sngTextWidth As Single)
    msngTextWidth = sngTextWidth
End Property

Friend Property Get VLine() As MSForms.Label
    Set VLine = mctlVLine
End Property

Friend Property Set VLine(ctlVLine As MSForms.Label)
    Set mctlVLine = ctlVLine
End Property

Friend Sub CheckTriStateParent()
' PT set triState value of parent according to its childnodes' values
    Dim alChecked(-1 To 1) As Long
    Dim cChild As clsNode

    If Not ChildNodes Is Nothing Then
        For Each cChild In ChildNodes
             alChecked(cChild.Checked) = alChecked(cChild.Checked) + 1
        Next
        If alChecked(1) Then
             alChecked(1) = 1
        ElseIf alChecked(-1) = ChildNodes.Count Then
             alChecked(1) = -1
        ElseIf alChecked(0) = ChildNodes.Count Then
                 alChecked(1) = 0
          Else
              alChecked(1) = 1
          End If

          If Checked <> alChecked(1) Then
              mlChecked = alChecked(1)
              UpdateCheckbox
          End If

    End If

    If Not Me.Caption = "RootHolder" Then
        If Not ParentNode.ParentNode Is Nothing Then
            ParentNode.CheckTriStateParent
        End If
    End If

End Sub

Friend Sub CheckTriStateChildren(lChecked As Long)
' PT, make checked values of children same as parent's
'     only called if triState is enabled
Dim cChild As clsNode

    mlChecked = lChecked
    UpdateCheckbox

    If Not ChildNodes Is Nothing Then
        For Each cChild In ChildNodes
             cChild.CheckTriStateChildren lChecked
        Next
    End If
End Sub

Friend Function hasIcon(vKey) As Boolean
' PT get the appropriate icon key/index, if any
    If mlIconCnt = 2 And mbExpanded Then
        vKey = mvIconExpandedKey
        hasIcon = True    'Not IsEmpty(vKey) '(True
    ElseIf mlIconCnt Then
        vKey = mvIconMainKey
        hasIcon = True    'Not IsEmpty(vKey)
    End If
End Function

Friend Sub EditBox(bEnterEdit As Boolean)    ' PT new in 006PT2 ,,move to clsTreView?
'-------------------------------------------------------------------------
' Procedure : moCtl_Click
' Author    : Peter Thornton
' Created   : 20-01-2013
' Purpose   : Enter/exit Editmode, show/hide the edit textbox
'-------------------------------------------------------------------------
    On Error Resume Next
    Set moEditBox = moTree.TreeControl.Controls("EditBox")
    On Error GoTo 0

    If bEnterEdit Then

          If moEditBox Is Nothing Then
              Set moEditBox = moTree.TreeControl.Controls.Add("forms.textbox.1", False)
              moEditBox.Name = "EditBox"
          End If

          With moEditBox
              .Left = Control.Left - 3
              .Top = Control.Top - 1.5
              .AutoSize = True
              .BorderStyle = fmBorderStyleSingle
              .Text = Caption
              Control.Visible = False    ' hide the node label while editing
              .ZOrder 0
              .Visible = True
              .SelStart = 0
              .SelLength = Len(.Text)
              .SetFocus
          End With

    ElseIf Not moEditBox Is Nothing Then
        ' exit editmode
        If Not moEditBox Is Nothing Then
            ' error if moEditBox has already been removed
            On Error Resume Next
            moEditBox.Visible = False
            moEditBox.Text = ""
            Set moEditBox = Nothing
        End If
        Control.Visible = True

    End If
End Sub

Friend Function RemoveChild(cNode As clsNode) As Boolean
'PT remove a node from the collection,
'   note, this is only one part of the process of removing a node

    Dim lCt As Long
    Dim cTmp As clsNode
    On Error GoTo errH

    For Each cTmp In mcolChildNodes
         lCt = lCt + 1
         If cTmp Is cNode Then
             mcolChildNodes.Remove lCt
             RemoveChild = True
             Exit For
         End If
    Next

    If mcolChildNodes.Count = 0 Then
        Set mcolChildNodes = Nothing
        Me.Expanded = False
    End If

    Exit Function
errH:
    Err.Raise vbObjectError, "RemoveChild", Err.Description
End Function

Friend Sub RemoveNodeControls()
    Dim cChild As clsNode
    If Not ChildNodes Is Nothing Then
        For Each cChild In ChildNodes
             cChild.RemoveNodeControls
        Next
    End If
    DeleteNodeControls False
End Sub

Friend Sub TerminateNode(Optional bDeleteNodeControls As Boolean)
'-------------------------------------------------------------------------
' Procedure : TerminateNode
' Company   : JKP Application Development Services (c)
' Author    : Jan Karel Pieterse (www.jkp-ads.com)
' Created   : 15-01-2013
' Purpose   : Terminates the class instance
'-------------------------------------------------------------------------
    Dim cChild As clsNode
    'Instead of the Terminate event of the class we use this public
    'method so it can be explicitly called by parent classes.
    'This is done because to break the two way or circular references
    'between the parent child classes.

    'The most important call in this routine is to destroy the reference
    'between this node class and the parent treeview class -
    '    < Set moTree = Nothing >
    'Once all the moTree references to have been destroyed everything else will
    ' 'tear down' normally

    If Not ChildNodes Is Nothing Then
        For Each cChild In ChildNodes
             ' recursively drill down to all child nodes in this branch
             cChild.TerminateNode bDeleteNodeControls
        Next
    End If

    ' If deleting individual nodes while the treeview is running we also want to
    ' remove all associated controls as well as removing references

    If bDeleteNodeControls Then
        DeleteNodeControls True
        If bDeleteNodeControls Then
            Index = -1
        End If
    End If

    Set mcolChildNodes = Nothing
    Set moTree = Nothing
End Sub


'******************************
'* Private subs and functions *
'******************************

Private Sub BinarySortIndexText(sCaptions() As String, ByVal lStart As Long, ByVal lEnd As Long, ByRef idx() As L
ong, ndOrder As Long, ndCompare As ndCompareMethod)
' PT sorts the index array based on the string array
    Dim lSmall As Long, lLarge As Long, sMid As String, lTmp As Long

    lSmall = lStart
    lLarge = lEnd
    sMid = sCaptions(idx((lSmall + lLarge) / 2))

    Do While lSmall <= lLarge
         Do While (StrComp(sCaptions(idx(lSmall)), sMid, ndCompare) = -ndOrder And lSmall < lEnd)
              lSmall = lSmall + 1
         Loop
         Do While (StrComp(sCaptions(idx(lLarge)), sMid, ndCompare) = ndOrder And lLarge > lStart)
              lLarge = lLarge - 1
         Loop
         If lSmall <= lLarge Then
              lTmp = idx(lSmall)
              idx(lSmall) = idx(lLarge)
              idx(lLarge) = lTmp
              lSmall = lSmall + 1
              lLarge = lLarge - 1
         End If
    Loop

    If lStart <= lLarge Then
        Call BinarySortIndexText(sCaptions(), lStart, lLarge, idx, ndOrder, ndCompare)
    End If
    If lSmall <= lEnd Then
        Call BinarySortIndexText(sCaptions(), lSmall, lEnd, idx, ndOrder, ndCompare)
    End If
End Sub

Private Sub DeleteNodeControls(bClearIndex As Boolean)
'PT Delete all controls linked to this node

    On Error GoTo errH

    With moTree.TreeControl.Controls
        If Not mctlControl Is Nothing Then
            .Remove mctlControl.Name
            Set mctlControl = Nothing
            If Not mctlHLine Is Nothing Then
                .Remove mctlHLine.Name
                Set mctlHLine = Nothing
            End If
            If Not mctlIcon Is Nothing Then
                .Remove mctlIcon.Name
                Set mctlIcon = Nothing
            End If
            If Not mctlIcon Is Nothing Then
                .Remove mctlIcon.Name
                Set mctlIcon = Nothing
            End If
        End If

        If Not mctlExpander Is Nothing Then
            .Remove mctlExpander.Name
            Set mctlExpander = Nothing
        End If
        If Not mctlExpanderBox Is Nothing Then
            .Remove mctlExpanderBox.Name
            Set mctlExpanderBox = Nothing
        End If
        If Not mctlVLine Is Nothing Then
            .Remove mctlVLine.Name
            Set mctlVLine = Nothing
        End If


        If Not moEditBox Is Nothing Then
            .Remove moEditBox.Name
            Set moEditBox = Nothing
        End If
        If Not mctlCheckBox Is Nothing Then
            .Remove mctlCheckBox.Name
            Set mctlCheckBox = Nothing
        End If

        If Not Me.ParentNode Is Nothing Then
            ' if Me is the last child delete parent's expander and VLine (if it has one)
            If FirstSibling Is LastSibling Then

                   If Not Me.ParentNode.VLine Is Nothing Then
                       .Remove Me.ParentNode.VLine.Name
                       Set Me.ParentNode.VLine = Nothing
                   End If

                   If Not Me.ParentNode.ExpanderBox Is Nothing Then
                       .Remove Me.ParentNode.ExpanderBox.Name
                       Set Me.ParentNode.ExpanderBox = Nothing
                   End If

                   If Not Me.ParentNode.Expander Is Nothing Then
                       .Remove Me.ParentNode.Expander.Name
                       Set Me.ParentNode.Expander = Nothing
                   End If

                   Me.ParentNode.Expanded = False

               End If

        End If

    End With

    If bClearIndex Then
        Me.Index = -1 ' flag this node to be removed from mcolNodes in NodeRemove
    End If

    Exit Sub
errH:
    ' Stop
    Resume Next
End Sub

Private Function UpdateCheckbox()
Dim pic As StdPicture
    If Not mctlCheckBox Is Nothing Then
        With mctlCheckBox
             If moTree.GetCheckboxIcon(mlChecked, pic) Then
                  .Picture = pic
             Else
                  .Caption = IIf(mlChecked, "a", "")
                  If (mlChecked = 1) <> (.ForeColor = RGB(180, 180, 180)) Then
                      .ForeColor = IIf(mlChecked = 1, RGB(180, 180, 180), vbWindowText)
                  End If
             End If
        End With
    End If
End Function

Private Sub UpdateExpanded(bControlOnly As Boolean)
'-------------------------------------------------------------------------
' Procedure : UpdateExpanded
' Author     : Peter Thornton
' Created    : 27-01-2013
' Purpose    : Called via an Expander click or arrow keys
'              Updates the Expanded property and changes +/- caption
'-------------------------------------------------------------------------
    Dim bFullWidth As Boolean
    Dim vKey
    Dim pic As StdPicture

    If Not bControlOnly Then
        With Me.Expander
            If moTree.GetExpanderIcon(mbExpanded, pic) Then
                 .Picture = pic
            Else
                 If mbExpanded Then
                      .Caption = "-"
                 Else
                      .Caption = "+"
                 End If
            End If
        End With
    End If

    On Error GoTo errExit
    If Me.hasIcon(vKey) Then
         If moTree.GetNodeIcon(vKey, pic, bFullWidth) Then
             If bFullWidth Then
                  Me.Icon.Picture = pic    ' potential error if Icon is nothing, let error abort
             Else
                  Me.Control.Picture = pic
             End If
         End If
    End If
errExit:
End Sub


'***********************
'*   Node Events       *
'***********************

Private Sub mctlCheckBox_Click()     ' PT new in 006PT2
'-------------------------------------------------------------------------
' Procedure : moCtl_Click
' Author     : Peter Thornton
' Created    : 20-01-2013
' Purpose    : Event fires when a Checkbox label is clicked
'-------------------------------------------------------------------------
    If moTree.EditMode(Me) Then
         ' exit editmode if in editmode
         moTree.EditMode(Me) = False
    End If
    If mlChecked = 0 Then

           Checked = -1
    Else
        Checked = 0
    End If

    Set moTree.ActiveNode = Me
    moTree.NodeClick mctlCheckBox, Me     ' share the checkbox click event
End Sub

Private Sub mctlControl_Click()
'-------------------------------------------------------------------------
' Procedure : mctlControl_Click
' Company   : JKP Application Development Services (c)
' Author    : Jan Karel Pieterse (www.jkp-ads.com)
' Created   : 15-01-2013
' Purpose   : Event fires when a treebranch is clicked
'-------------------------------------------------------------------------

' PT the call to NodeClick will raise the click event to the form
Dim bFlag As Boolean

    If Not moLastActiveNode Is Nothing Then
        moLastActiveNode.Control.BorderStyle = fmBorderStyleNone
        Set moLastActiveNode = Nothing
        bFlag = True
    End If

    If moTree.ActiveNode Is Nothing Then
        Set moTree.ActiveNode = Me
        bFlag = True
    ElseIf Not bFlag Then
        bFlag = mctlControl.BorderStyle <> fmBorderStyleNone
    End If

    If Not moTree.ActiveNode Is Me Or bFlag Then
        ' only raise the event the first time the node is activated
           moTree.NodeClick Control, Me

         ' if preferred the click event is always raised to the form (even if the
         ' node was previously active) simply comment or remove this If/EndIf check
    End If

End Sub

Private Sub mctlControl_DblClick(ByVal Cancel As MSForms.ReturnBoolean)
' PT a node label has been double-clicked, enter edit-mode if manual editing is enabled
    Dim bDummy As Boolean

          If moTree.EnableLabelEdit(bDummy) Then
              moTree.EditMode(Me) = True
              EditBox bEnterEdit:=True
          End If

End Sub

Private Sub mctlControl_MouseDown(ByVal Button As Integer, ByVal Shift As Integer, ByVal X As Single, ByVal Y As
Single)
'PT temporarily activate and highlight the MouseDown node and a grey border to the previous activenode
'   MouseUp and Click events will confirm the action or reset the previous active node
Dim bFlag As Boolean

    If moTree.ActiveNode Is Me Then
        bFlag = Me.Control.BackColor = vbHighlight
       ' bFlag = bFlag Or Me.Control.BorderStyle = fmBorderStyleSingle ' in Access this should be uncommented
    End If

    If Not bFlag Then
        Set moLastActiveNode = moTree.ActiveNode
        Set moTree.ActiveNode = Me
        If Not moLastActiveNode Is Nothing Then
            moLastActiveNode.Control.BorderStyle = fmBorderStyleSingle
            moLastActiveNode.Control.BorderColor = RGB(200, 200, 200)
        End If
    End If

    If moTree.EditMode(Me) Then
        ' if any node is in edit mode exit edit mode
        moTree.EditMode(Me) = False
    End If

End Sub

Private Sub mctlControl_MouseUp(ByVal Button As Integer, ByVal Shift As Integer, ByVal X As Single, ByVal Y As Si
ngle)
' PT MouseUp fires before the Click event, at this point we don't know 100% if user
'     definately wants to activate the MouseDown node. If user drags the mouse off the MouseDown node the
'     Click event will not fire which means user wants to cancel and revert to the previous activenode.
'
'     If MouseUp occurs with the cursor not over the node reset the original activenode

Dim bFlag As Boolean
Dim bMouseIsOver As Boolean
Dim bMoveCopy As Boolean

    If Not moLastActiveNode Is Nothing Then
        With Me.Control
            ' is the mouse over the node or within a pixel of it
            bMouseIsOver = (X >= -1 And X <= .Width + 1) And (Y >= -1 And Y <= .Height + 1)
        End With

          If Not bMouseIsOver Then
              ' if the last-activenode was marked for MoveCopy we will need to reset it
              bFlag = moLastActiveNode Is moTree.MoveCopyNode(bMoveCopy)

               ' reset the original activenode
               moLastActiveNode.Control.BorderStyle = fmBorderStyleNone
               Set moTree.ActiveNode = moLastActiveNode

               If bFlag Then
                   Set moTree.MoveCopyNode(bMoveCopy) = moLastActiveNode
               End If

               Set moLastActiveNode = Nothing

          ElseIf Button = 2 Then
              ' the click event doesn't fire with right click so explicitly call it
            mctlControl_Click
        End If
    End If

End Sub

Private Sub mctlExpander_Click()
'
    Expanded = Not Expanded
    If moTree.EditMode(Me) Then
        ' if any node is in edit mode exit edit mode
        moTree.EditMode(Me) = False
    End If
    Tree.NodeClick Expander, Me
End Sub

Private Sub moEditBox_KeyDown(ByVal KeyCode As MSForms.ReturnInteger, ByVal Shift As Integer)   'PT
' PT Textbox key events to Enter or Esc the Editbox,   006PT2

    Dim bCancel As Boolean
    Dim bSort As Boolean
    Dim sNewText As String

    If KeyCode = vbKeyReturn Then
        sNewText = moEditBox.Value
        If sNewText = Caption Then
             KeyCode = vbKeyEscape
        Else
             bCancel = moTree.RaiseAfterLabelEdit(Me, sNewText)
             If Not bCancel Then
                 Me.Caption = moEditBox.Value
                 Control.Caption = sNewText
                 Control.AutoSize = True
                 TextWidth = Control.Width
                 Control.AutoSize = False
                 If TextWidth < mcFullWidth And moTree.FullWidth Then
                     Control.Width = mcFullWidth
                 End If
                 moTree.UpdateScrollLeft ' scroll to show all the label
                 moTree.Changed = True
                 moTree.NodeClick Control, Me
                 bCancel = moTree.LabelEdit(bSort)
                 If bSort Then
                     If Me.ParentNode.Sort Then
                         moTree.Refresh
                     End If
                 End If
             End If
             EditBox False
        End If
    End If
    If KeyCode = vbKeyEscape Then
        moTree.EditMode(Me) = False
        EditBox False
    End If
End Sub

Private Sub Class_Initialize()
' default properties
    mbExpanded = True ' default

    #If DebugMode = 1 Then
        gClsNodeInit = gClsNodeInit + 1    ' PT, for testing only, remove, see ClassCounts() in the normal module
    #End If
End Sub

Private Sub Class_Terminate()
    #If DebugMode = 1 Then
        gClsNodeTerm = gClsNodeTerm + 1    ' PT, for testing,
    #End If
    Set moTree = Nothing
End Sub
clsTreeview - 1

'Build 025
'***************************************************************************
'
' Authors: JKP Application Development Services, info@jkp-ads.com, http://www.jkp-ads.com
'           Peter Thornton, pmbthornton@gmail.com
'
' (c)2013, all rights reserved to the authors
'
' You are free to use and adapt the code in these modules for
' your own purposes and to distribute as part of your overall project.
' However all headers and copyright notices should remain intact
'
' You may not publish the code in these modules, for example on a web site,
' without the explicit consent of the authors
'***************************************************************************

'-------------------------------------------------------------------------
' Module    : clsTreeView
' Company   : JKP Application Development Services (c)
' Author    : Jan Karel Pieterse (www.jkp-ads.com)
' Created   : 15-01-2013
' Purpose   : Creates a VBA Treeview control in a frame on your UserForm
'-------------------------------------------------------------------------
Option Explicit
#Const HostProject = "Access" ', or Excel or Word

Public WithEvents TreeControl As MSForms.Frame

Private mbInActive                  'PT the treeview is not in focus
Private mbAlwaysRedesign As Boolean    'PT temporary flag to force mbRedesign=true, see Move()
Private mbAutoSort As Boolean       'PT sort siblings after manual edit
Private mbChanged As Boolean        'PT "dirty", user has edited node(s)
Private mbCheckboxes As Boolean     'PT show checkboxes
Private mbLabelEdit As Boolean      'PT allow manual editing with F2 and double click
Private mbTriState As Boolean       'PT enable tripple state checkboxes
Private mbCheckboxImage As Boolean 'PT determins if icons are used for checkboxes
Private mbEditMode As Boolean       'PT flag if in editmode
Private mbFullWidth As Boolean      'PT use separate image controls for icons, can highlight nodes to full width
Private mbGotIcons As Boolean       'PT got a collection of images
Private mbExpanderImage As Boolean 'PT determines if icons will be used for collapse/expand controls
Private mbKeyDown As Boolean        'PT Enter-keyup in a Textbox occurs when next control gets focus
Private mbMove As Boolean           'PT flag intention of the MoveCopyNode
Private mbRedesign As Boolean       'PT flag to reset all dim's after changing NodeHeight or Indentation at runti
me
Private mbRootButton As Boolean     'PT Root has an expander button
Private mbShowExpanders As Boolean 'PT Show +/- buttons
Private mbShowLines As Boolean      'PT determines if lines will be created and shown
Private mlBackColor As Long         'PT frameholder's backcolor
Private mlForeColor As Long         'PT frameholder's ForeColor
Private mlLabelEdit As Long         'PT 0-Automatic, 1-Manual can't be edited
Private mlNodesCreated As Long      'PT in/de-cremented as clsNodes are added/deleted from mcolNodes
Private mlNodesDeleted As Long      'PT incremented as clsNode.controls are deleted, purpose to give unique id fo
r control names
Private mlVisCount As Long          'PT incremented from zero as each node is displayed
Private mlVisOrder() As Long        'PT an index array to identify displayed nodes in the order as displayed
Private msAppName As String         'JKP: Title of messageboxes
Private msngChkBoxPad As Single     'PT offset if using checkboxes
Private msngChkBoxSize As Single    'PT checkbox size
Private msngIndent As Single        'PT default 15
Private msngLineLeft As Single      'PT Left pos of Root H & V lines, 3 + alpha
Private msngNodeHeight As Single    'JKP: vertical distance between nodes
Private msngRootLine As Single      'PT if mbRootButton, same as msngIndent, else 0
Private msngTopChk As Single        'PT top checkbox (these "tops" are offsets down from the top a given node)
Private msngTopExpB As Single       'PT top expander button (a label)
Private msngTopExpT As Single       'PT top expander text (a label)
Private msngTopHV As Single         'PT top for Horiz' & Vert' lines (mid height of a node + top padding))
Private msngTopIcon As Single       'PT top icon
Private msngTopLabel As Single      'PT top node label, if font height less than NodeHeight
Private msngVisTop As Single        'PT activenode top relative to scroll-top
Private msngMaxWidths() As Single   'PT array, max width of text in each level, helps determine scroll-width
Private moActiveNode As clsNode     'JKP: refers to the selected node
Private moEditNode As clsNode       'PT the node in EditMode
Private moMoveNode As clsNode       'PT node waiting to be moved
Private moRootHolder As clsNode     'PT parent for the root node(s), although a clsNode it's not a real node
Private mcolIcons As Collection     'PT collection of stdPicture objects, their names as keys
Private mcolNodes As Collection     'JKP: global collection of all the nodes
Private moCheckboxImage(-1 To 1) As StdPicture   'PT checkbox true/false/triState icons
Private moExpanderImage(-1 To 0) As StdPicture   'PT collapse/expand icons
#If HostProject = "Access" Then
   Private moForm As Access.Form    'PT the main form, eg to return debug stats to the caption
clsTreeview - 2

#Else
  Private moForm As MSForms.UserForm
#End If
''-----------------------------------------------------------

'Public Enum tvMouse
'    tvDown = 1
'    tvUp = 2
'    tvMove = 3
'    tvBeforeDragOver = 4
'    tvBeforeDropOrPaste = 5
'End Enum

Public Enum tvTreeRelationship
    tvFirst = 0
    tvLast = 1
    tvNext = 2
    tvPrevious = 3
    tvChild = 4
End Enum

Event Click(cNode As clsNode)       'Node clcick event
Event NodeCheck(cNode As clsNode)   'Checkbox change event
Event AfterLabelEdit(ByRef Cancel As Boolean, NewString As String, cNode As clsNode)
Event KeyDown(cNode As clsNode, ByVal KeyCode As MSForms.ReturnInteger, ByVal Shift As Integer)

Private Type POINTAPI
    X As Long
    Y As Long
End Type

#If VBA7 And Not Mac Then
    Private Declare PtrSafe Function GetCursorPos Lib "user32.dll" ( _
            ByRef lpPoint As POINTAPI) As Long
    Private Declare PtrSafe Function SetCursorPos Lib "user32.dll" ( _
            ByVal X As Long, _
            ByVal Y As Long) As Long
    Private Declare PtrSafe Function getTickCount Lib "kernel32.dll" Alias "GetTickCount" () As Long
#Else
    Private Declare Function GetCursorPos Lib "user32.dll" ( _
                                          ByRef lpPoint As POINTAPI) As Long
    Private Declare Function SetCursorPos Lib "user32.dll" ( _
                                          ByVal X As Long, _
                                          ByVal Y As Long) As Long
    Private Declare Function getTickCount Lib "kernel32.dll" Alias "GetTickCount" () As Long
#End If

' Mac displays at 72 pixels per 72 points vs (typically) 96/72 in Windows
' The respective constants help size and position node controls appropriatelly in the different OS
' Search the project for instances of the Mac constant

#If Mac Then
    Const mcCheckboxFont As Long = 13
    Const mcCheckboxPad As Single = 19
    Const mcCheckboxPadImg As Single = 15
    Const mcChkBoxSize As Single = 13
    Const mcExpanderFont As Long = 13
    Const mcExpButSize As Single = 15
    Const mcExpBoxSize As Long = 12
    Const mcFullWidth As Long = 800
    Const mcIconPad As Single = 17
    Const mcIconSize As Long = 16
    Const mcTLpad As Long = 4
    Const mcLineLeft As Single = mcTLpad + 10
    Const mcPtPxl As Single = 1
#Else
    Const mcCheckboxFont As Long = 10
    Const mcCheckboxPad As Single = 15
    Const mcCheckboxPadImg As Single = 11.25
    Const mcChkBoxSize As Single = 10.5
    Const mcExpanderFont As Long = 10
    Const mcExpButSize As Single = 11.25
    Const mcExpBoxSize As Long = 9
    Const mcFullWidth As Long = 600
    Const mcIconPad As Single = 14.25
    Const mcIconSize As Long = 12
    Const mcTLpad As Long = 3
    Const mcLineLeft As Single = mcTLpad + 7.5
    Const mcPtPxl As Single = 0.75
#End If
clsTreeview - 3


Private Const mcSource As String = "clsTreeView"

'***************************
'*    Public Properties    *
'***************************

Public Property Get ActiveNode() As clsNode
    Set ActiveNode = moActiveNode
End Property

Public Property Set ActiveNode(oActiveNode As clsNode)
'-------------------------------------------------------------------------
' Procedure : ActiveNode
' Company   : JKP Application Development Services (c)
' Author    : Jan Karel Pieterse (www.jkp-ads.com)
' Created   : 17-01-2013
' Purpose   : Setting the activenode also updates the node colors
'             and ensures the node is scrolled into view
'-------------------------------------------------------------------------

    Dim cTmp As clsNode
    If oActiveNode Is MoveCopyNode(False) Then
        Set MoveCopyNode(False) = Nothing
    End If

    If moActiveNode Is oActiveNode Then
        SetActiveNodeColor
        Exit Property
    End If

    ResetActiveNodeColor ActiveNode

    If oActiveNode.Control Is Nothing Then
        Set cTmp = oActiveNode.ParentNode
        While Not cTmp.Caption = "RootHolder"
             cTmp.Expanded = True
             Set cTmp = cTmp.ParentNode
        Wend

          If mlNodesCreated Then
              BuildRoot False
          End If

    End If

    Set moActiveNode = oActiveNode
    SetActiveNodeColor

End Property

Public Sub ExpandNode(cNode As clsNode)
    Dim cTmp As clsNode

    Set cTmp = cNode.ParentNode
    While Not cTmp.Caption = "RootHolder"
         cTmp.Expanded = True
    Wend

End Sub

Public Property Get AppName() As String
    AppName = msAppName
End Property

Public Property Let AppName(ByVal sAppName As String)
    msAppName = sAppName
End Property

Public Property Get Changed() As Boolean
'PT user has edited node(s) and/or changed Checked value(s)
    Changed = mbChanged
End Property

Public Property Let Changed(ByVal bChanged As Boolean)
' called after manual node edit and Checked change
    mbChanged = bChanged
End Property

Public Property Get CheckBoxes(Optional bTriState As Boolean) As Boolean     ' PT
clsTreeview - 4

    CheckBoxes = mbCheckboxes
    bTriState = mbTriState
End Property

Public Property Let CheckBoxes(Optional bTriState As Boolean, ByVal bCheckboxes As Boolean)     ' PT
    Dim bOrig As Boolean
    Dim bOrigTriState As Boolean

      bOrig = mbCheckboxes
      mbCheckboxes = bCheckboxes

      bOrigTriState = mbTriState
      mbTriState = bTriState
      If bCheckboxes Then
           msngChkBoxPad = mcCheckboxPad
           If msngNodeHeight < mcExpButSize Then msngNodeHeight = mcExpButSize
      Else
           msngChkBoxPad = 0
      End If

      If Not TreeControl Is Nothing Then

          If TreeControl.Controls.Count And (bOrig <> mbCheckboxes Or bOrigTriState <> mbTriState) Then
              ' Checkboxes added changed after start-up so update the treeview
              mbRedesign = True
              Refresh
          End If
      End If

End Property

#If HostProject = "Access" Then
    Public Property Set Form(frm As Access.Form)
        Set moForm = frm
    End Property
#Else
    Public Property Set Form(frm As MSForms.UserForm)
        Set moForm = frm
    End Property
#End If

Public Property Get FullWidth() As Boolean
    FullWidth = mbFullWidth
End Property

Public Property Let FullWidth(bFullWidth As Boolean)
    mbFullWidth = bFullWidth
End Property

Public Property Set Images(objImages As Object)
    Dim sDesc As String
    Dim pic As stdole.StdPicture
    Dim obj As Object
    ' PT objImages can be a collection of StdPicture objects
    '     a Frame containing only Image controls (or controls with an image handle)
    '     stdole.IPictureDisp or stdole.StdPicture objects

    On Error GoTo errH
    If TypeName(objImages) = "Collection" Then
         Set mcolIcons = objImages
100      For Each pic In mcolIcons
              ' if not a valid picture let the error abort
         Next
    Else
         Set mcolIcons = New Collection

          '#If HostProject = "Access" Then
              '' if the frame is on an Access form include .Object
              'For Each obj In objImages.Object.Controls

200            For Each obj In objImages.Controls
                    mcolIcons.Add obj.Picture, obj.Name
               Next
      End If

      ' Flag we have a valid collection of images
      mbGotIcons = mcolIcons.Count >= 1

    Exit Property
errH:
clsTreeview - 5

    Set mcolIcons = Nothing
    If Erl = 100 Then
        sDesc = "The obImages collection includes an invalue StdPicture object"
    ElseIf Erl = 200 Then
        sDesc = "A control in objImages does not contain a valid Picture object"
    End If
    sDesc = sDesc & vbNewLine & Err.Description

    Err.Raise Err.Number, "Images", sDesc

End Property

Public Property Get Indentation() As Single
    Indentation = msngIndent
End Property

Public Property Let Indentation(sngIndent As Single)
    Dim cNode As clsNode
    Dim sngOld As Single

    sngOld = msngIndent

    #If Mac Then
        If sngIndent < 16 Then
             msngIndent = 16    ' min indent ?
        ElseIf sngIndent > 80 Then
             msngIndent = 80    ' max indent
        Else
             msngIndent = Int(sngIndent)
        End If
    #Else
        If sngIndent < 12 Then
             msngIndent = 12    ' min indent ?
        ElseIf sngIndent > 60 Then
             msngIndent = 60    ' max indent
        Else
             msngIndent = Int((sngIndent * 2 + mcPtPxl) / 3 * 2) * mcPtPxl
        End If
    #End If

    If mbRootButton Then msngRootLine = msngIndent

    If Not TreeControl Is Nothing And Not (sngOld = msngIndent) Then
        ' changed after start-up so update the treview
        If TreeControl.Controls.Count Then
             Set cNode = Me.ActiveNode
             Refresh
             If Not cNode Is Nothing Then
                 Set ActiveNode = cNode
             End If
        End If
    End If
End Property
Public Property Get EnableLabelEdit(Optional bAutoSort As Boolean) As Boolean
    EnableLabelEdit = mbLabelEdit
    bAutoSort = mbAutoSort
End Property

Public Property Let EnableLabelEdit(Optional bAutoSort As Boolean, ByVal bLabelEdit As Boolean)   ' PT
' optional bAutoSort: automatically resort siblings after a manual edit
    mbLabelEdit = bLabelEdit
    mbAutoSort = bAutoSort
End Property

Public Property Get LabelEdit(Optional bAutoSort As Boolean) As Long    ' PT
' PT, equivalent to Treeview.LabelEdit
' 0/tvwAutomatic nodes can be manually edited
' optional bAutoSort: automatically resort siblings after a manual edit

    LabelEdit = mlLabelEdit
    bAutoSort = mbAutoSort
End Property

Public Property Let LabelEdit(Optional bAutoSort As Boolean, ByVal nLabelEdit As Long)   ' PT
    mlLabelEdit = nLabelEdit
    mbLabelEdit = (nLabelEdit = 0)
    mbAutoSort = bAutoSort
End Property

Public Property Get MoveCopyNode(Optional bMove As Boolean, Optional lColor As Long) As clsNode
clsTreeview - 6

    bMove = mbMove
    Set MoveCopyNode = moMoveNode
End Property
Public Property Set MoveCopyNode(Optional bMove As Boolean, Optional lColor As Long, cNode As clsNode)
    Static lOrigBackcolor As Long

    mbMove = bMove
    If lColor = 0 Then
        If bMove Then
            lColor = RGB(255, 231, 162)
        Else: lColor = RGB(159, 249, 174)
        End If
    End If

    If Not moMoveNode Is Nothing Then
         moMoveNode.BackColor = lOrigBackcolor
         moMoveNode.Control.BackColor = lOrigBackcolor
         Set moMoveNode = Nothing
    Else

    End If

    If Not cNode Is Nothing Then
        lOrigBackcolor = cNode.BackColor
        If lOrigBackcolor = 0 Then lOrigBackcolor = mlBackColor
        cNode.BackColor = lColor

           cNode.Control.BackColor = cNode.BackColor
           cNode.Control.ForeColor = cNode.ForeColor
           Set moMoveNode = cNode
    Else

    End If
End Property

'Public Property Get MultiSelect() As Boolean
'    MultiSelect = mbMultiSelect
'End Property
'Public Property Let MultiSelect(mbMultiSelect As Boolean)
'    mbMultiSelect = MultiSelect
'End Property

Public Property Get NodeHeight() As Single
    If msngNodeHeight = 0 Then msngNodeHeight = 12
    NodeHeight = msngNodeHeight
End Property

Public Property Let NodeHeight(ByVal sngNodeHeight As Single)
    Dim cNode As clsNode
    Dim sngOld As Single

    sngOld = msngNodeHeight

    #If Mac Then
        If sngNodeHeight < 12 Then ' height of expander-box is 9
             msngNodeHeight = 12
        ElseIf sngNodeHeight > 60 Then
             msngNodeHeight = 60
        Else
             msngNodeHeight = Int(sngNodeHeight)
        End If
    #Else
        If sngNodeHeight < 9 Then ' height of expander-box is 9
             msngNodeHeight = 9
        ElseIf sngNodeHeight > 45 Then
             msngNodeHeight = 45
        Else
             msngNodeHeight = Int((sngNodeHeight * 2 + mcPtPxl) / 3 * 2) * mcPtPxl
        End If

    #End If
    If mbRootButton Then msngRootLine = msngIndent
    If Not TreeControl Is Nothing And Not (sngOld = msngNodeHeight) Then
        If TreeControl.Controls.Count Then
            Set cNode = Me.ActiveNode
            Refresh
            If Not cNode Is Nothing Then
                Set ActiveNode = cNode
            End If
        End If
clsTreeview - 7

    End If
End Property

Public Property Get Nodes() As Collection
' Global collection of the nodes
' *DO NOT USE* its Nodes.Add and Nodes.Remove methods
' To add & remove nodes use clsNode.AddChild() or clsTreeView.NodeAdd and clsTeevView.NodeRemove()
    If mcolNodes Is Nothing Then Set mcolNodes = New Collection
    Set Nodes = mcolNodes
End Property

Public Property Get RootButton() As Boolean
    If mbRootButton Then RootButton = 1
End Property

Public Property Let RootButton(lRootLeader As Boolean)
' PT The Root nodes have expanders and lines (if mbShowlines)

    mbRootButton = lRootLeader
    If mbRootButton Then
         msngRootLine = msngIndent
    Else
         msngRootLine = 0
    End If

    If Not Me.TreeControl Is Nothing Then
        If Not moRootHolder Is Nothing Then
             If Not moRootHolder.ChildNodes Is Nothing Then
                 Refresh
             End If
        End If
    End If
End Property

Public Property Get RootNodes() As Collection
'PT returns the collection of Root-nodes
' **should be treated as read only. Use AddRoot and NodeRemove to add/remove a root node**
    Set RootNodes = moRootHolder.ChildNodes
End Property

Public Property Get ShowExpanders() As Boolean
    ShowExpanders = mbShowExpanders
End Property

Public Property Let ShowExpanders(bShowExpanders As Boolean)

    mbShowExpanders = bShowExpanders

    If Not TreeControl Is Nothing Then
        If TreeControl.Controls.Count Then
             Refresh
        End If
    End If
End Property

Public Property Get ShowLines() As Boolean
    ShowLines = mbShowLines
End Property

Public Property Let ShowLines(bShowLines As Boolean)
' PT Show horizontal & vertical lines
Dim bOrig As Boolean
Dim cNode As clsNode

    bOrig = mbShowLines
    mbShowLines = bShowLines

    If Not TreeControl Is Nothing Then
        If TreeControl.Controls.Count Then
            If bOrig <> mbShowLines Then
                ' ShowLines added after start-up so update the treeview
                Refresh
            End If
        End If
    End If

End Property

'***********************************
'*    Public functions and subs    *
clsTreeview - 8

'***********************************

Public Function AddRoot(Optional sKey As String, Optional vCaption, Optional vImageMain, _
                        Optional vImageExpanded) As clsNode

    On Error GoTo errH

    If moRootHolder Is Nothing Then
        Set moRootHolder = New clsNode
        Set moRootHolder.ChildNodes = New Collection
        Set moRootHolder.Tree = Me
        moRootHolder.Caption = "RootHolder"
        If mcolNodes Is Nothing Then
            Set mcolNodes = New Collection
        End If
    End If

    Set AddRoot = moRootHolder.AddChild(sKey, vCaption, vImageMain, vImageExpanded)

    Exit Function
errH:
    #If DebugMode = 1 Then
        Stop
        Resume
    #End If
    Err.Raise Err.Number, "AddRoot", Err.Description

End Function

Public Sub CheckboxImage(picFalse As StdPicture, picTrue As StdPicture, Optional picTriState As StdPicture)
    On Error GoTo errExit:
    Set moCheckboxImage(0) = picFalse
    Set moCheckboxImage(-1) = picTrue
    If Not IsMissing(picTriState) Then
        Set moCheckboxImage(1) = picTriState
    End If

    mbCheckboxImage = True
errExit:
End Sub

Public Sub EnterExit(bExit As Boolean)
'PT WithEvents can't trap Enter/Exit events, if we need them here they can be
'   called from the TreeControl's Enter/Exit events in the form
    mbInActive = bExit
    SetActiveNodeColor bExit ' apply appropriate vbInactiveCaptionText / vbHighlight

End Sub

Public Sub ExpanderImage(picMinus As StdPicture, picPlus As StdPicture)
    On Error GoTo errExit:
    Set moExpanderImage(0) = picPlus
    Set moExpanderImage(-1) = picMinus
    mbExpanderImage = True
errExit:
End Sub

Public Sub ExpandToLevel(lExpansionLevel As Long, Optional bReActivate As Boolean = True)
' PT call SetTreeExpansionLevel and reactivates the closest expanded parent if necessary
'    eg, if activeNode.level = 4 and lExpansionLevel = 2, the activenode's grandparent will be activated
    Dim cTmp As clsNode

    Call SetTreeExpansionLevel(lExpansionLevel - 1)

    If bReActivate Then
        If ActiveNode.Level > lExpansionLevel Then
            Set cTmp = ActiveNode.ParentNode
            While cTmp.Level > lExpansionLevel
                 Set cTmp = cTmp.ParentNode
            Wend
            Set ActiveNode = cTmp
        End If
    End If

End Sub

Public Sub Copy(cSource As clsNode, cDest As clsNode, _
                Optional vBefore, Optional ByVal vAfter, _
                Optional ByVal bShowError As Boolean)
clsTreeview - 9

    Set MoveCopyNode(False) = Nothing
    Clone cDest, cSource, vBefore, vAfter
    SetActiveNodeColor

End Sub

Public Sub Move(cSource As clsNode, cDest As clsNode, _
                Optional vBefore, Optional ByVal vAfter, _
                Optional ByVal bShowError As Boolean)
' PT Move source node + children to destination node
'    cannot move the Root and cannot move to a descendant
'   vBefore/vAfter work as for normal collection; error if invalid, eg a new collection, after the last item, etc
'
    Dim sErrDesc As String
    Dim bIsParent As Boolean
    Dim cNode As clsNode
    Dim cSourceParent As clsNode

    Set MoveCopyNode(False) = Nothing
    On Error GoTo errH

    If cSource Is Nothing Or cDest Is Nothing Or cSource Is cDest Then   ' Or cSource Is Root
        Exit Sub
    End If

    Set cNode = cDest
    bIsParent = False
    Do
        Set cNode = cNode.ParentNode
        bIsParent = cNode Is cSource
    Loop Until cNode Is Nothing Or bIsParent

    If bIsParent Then
        Err.Raise vbObjectError + 110
    End If

    If cDest.ChildNodes Is Nothing Then
        ' the child becomes a parent for the first time
        Set cDest.ChildNodes = New Collection
        ' expander & VLine will get created automatically if necessary
    End If

    AddNodeToCol cDest.ChildNodes, cSource, False, vBefore, vAfter

    Set cSourceParent = cSource.ParentNode
    With cSourceParent
        .RemoveChild cSource '
        ' if the old parent has no more children remove its expander & VLine

          If .ChildNodes Is Nothing Then

              If Not .Expander Is Nothing Then
                  Me.TreeControl.Controls.Remove .Expander.Name
                  Set .Expander = Nothing
              End If

              If Not .ExpanderBox Is Nothing Then
                  Me.TreeControl.Controls.Remove .ExpanderBox.Name
                  Set .ExpanderBox = Nothing
              End If

              If Not .VLine Is Nothing Then
                  Me.TreeControl.Controls.Remove .VLine.Name
                  Set .VLine = Nothing
              End If

              .Expanded = False

        End If
    End With

    Set cSource.ParentNode = cDest
    cDest.Expanded = True

    If mbTriState Then
        cDest.CheckTriStateParent
        cSourceParent.CheckTriStateParent
    End If

    SetActiveNodeColor
clsTreeview - 10

      mbAlwaysRedesign = True       ' ensure Left's get recalc'd during future refresh

    Exit Sub
errH:

      Select Case Err.Number
      Case vbObjectError + 110
          sErrDesc = "Cannot cut and move a Node to a descendant node"
      Case Else
          sErrDesc = "Move: " & Err.Description
      End Select

      If bShowError Then
           MsgBox sErrDesc, , AppName
      Else
           Err.Raise Err.Number, mcSource, "Move: " & sErrDesc
      End If

End Sub

Public Function NodeAdd(Optional vRelative, _
                        Optional vRelationship, _
                        Optional sKey As String, _
                        Optional vCaption, _
                        Optional vImageMain, _
                        Optional vImageExpanded) As clsNode           '   As tvTreevRelationship

'PT, similar to the old tv's nodes.add method
'    main difference is vRelative can be a Node object as well as a key or index
'    see also clsNode.AddChild

      Dim i As Long
      Dim cNode As clsNode
      Dim cRelative As clsNode
      Dim cParent As clsNode
      Dim cTmp As clsNode
      '    tvFirst = 0 tvlast = 1 tvNext = 2 tvprevious = 3      tvChild = 4

      If IsMissing(vRelative) Then

             Set NodeAdd = Me.AddRoot(sKey, vCaption, vImageMain, vImageExpanded)
             Exit Function
      Else

             On Error Resume Next
             Set cRelative = vRelative
             If cRelative Is Nothing Then
                 Set cRelative = mcolNodes(vRelative)
             End If

          On Error GoTo errH
          If cRelative Is Nothing Then
              Err.Raise vbObjectError + 100, "NodeAdd", "vRelative is not a valid node or a node.key"
          End If
      End If

      If IsMissing(vRelationship) Then
          vRelationship = tvTreeRelationship.tvNext       ' default
      End If

      If vRelationship = tvChild Or cRelative Is cRelative.Root Then
           Set cParent = cRelative
      Else
           Set cParent = cRelative.ParentNode
      End If

      Set cNode = New clsNode

      If Len(sKey) Then
100       mcolNodes.Add cNode, sKey
101
      Else
          mcolNodes.Add cNode
      End If

      If cParent.ChildNodes Is Nothing Then
          Set cParent.ChildNodes = New Collection
      End If

      With cParent.ChildNodes
clsTreeview - 11

        If .Count = 0 Then
             .Add cNode
        Else
             i = 0
             If vRelationship = tvNext Or vRelationship = tvPrevious Then
                 For Each cTmp In cParent.ChildNodes
                      i = i + 1
                      If cTmp Is cRelative Then
                          Exit For
                      End If
                 Next
             End If
             Select Case vRelationship
             Case tvFirst: .Add cNode, , 1
             Case tvLast: .Add cNode, after:=.Count
             Case tvNext: .Add cNode, after:=i
             Case tvPrevious: .Add cNode, before:=i
             Case tvChild: .Add cNode
             End Select
        End If
    End With

    With cNode
        .Key = sKey
        .Caption = CStr(vCaption)
        .ImageMain = vImageMain
        .ImageExpanded = vImageExpanded
        .Index = mcolNodes.Count

        Set .ParentNode = cParent
        Set .Tree = Me
    End With

    Set cNode.Tree = Me    ' do this after let key = skey
    Set NodeAdd = cNode

    Exit Function
errH:
    If mcolNodes Is Nothing Then
         Set mcolNodes = New Collection
         Resume
    End If
    If Erl = 100 And Err.Number = 457 Then
         Err.Raise vbObjectError + 1, "clsNode.AddChild", "Duplicate key: '" & sKey & "'"
    Else
         #If DebugMode = 1 Then
             Stop
             Resume
         #End If
         Err.Raise Err.Number, "clsNode.AddChild", Err.Description
    End If
End Function

Public Sub NodeRemove(cNode As clsNode)
' PT Remove a Node, its children and grandchildrem
'    remove all associated controls and tear down class objects
'    Call Refresh() when done removing nodes

    Dim lIdx As Long
    Dim lNodeCtlsOrig As Long
    Dim cParent As clsNode
    Dim cNodeAbove As clsNode, cNd As clsNode

    On Error GoTo errH

    Set MoveCopyNode = Nothing

    Set cNodeAbove = NextVisibleNodeInTree(cNode, bUp:=True)
    Set cParent = cNode.ParentNode

    cNode.TerminateNode True

    cParent.RemoveChild cNode

    cNode.Index = -1    ' flag to get removed from mcolNodes in the loop
    If ActiveNode Is cNode Then
        Set moActiveNode = Nothing
    End If
    Set moEditNode = Nothing
clsTreeview - 12

    lIdx = 0
    lNodeCtlsOrig = mlNodesCreated
    mlNodesCreated = 0

    For Each cNd In mcolNodes
         lIdx = lIdx + 1
         If cNd.Index = -1 Then
              mcolNodes.Remove lIdx
              lIdx = lIdx - 1
         Else
              mlNodesCreated = mlNodesCreated - CLng(Not cNd.Control Is Nothing)
              cNd.Index = lIdx
         End If
    Next

    mlNodesDeleted = mlNodesDeleted + lNodeCtlsOrig - mlNodesCreated

    Set cNode = Nothing      ' should terminate the class

    If mlNodesCreated Then
         If Not cNodeAbove Is Nothing Then
             Set Me.ActiveNode = cNodeAbove
         ElseIf mcolNodes.Count Then
             Set Me.ActiveNode = mcolNodes(1)
         End If
    Else
         'all nodes deleted
         Erase mlVisOrder
         Erase msngMaxWidths
         mlVisCount = 0
         mlNodesCreated = 0
         mlNodesDeleted = 0
    End If

    Exit Sub
errH:
    #If DebugMode = 1 Then
        Debug.Print Err.Description, Err.Number
        Stop
        Resume
    #End If
End Sub

Public Sub NodesClear()
' PT, similar to Treeview.Nodes.Clear
    Dim i As Long
    On Error GoTo errH

    If Not TreeControl Is Nothing Then
        With TreeControl
            For i = TreeControl.Controls.Count - 1 To 0 Step -1
                 TreeControl.Controls.Remove i
            Next
            .ScrollBars = fmScrollBarsNone
        End With
    End If

    Erase mlVisOrder
    Erase msngMaxWidths
    mlVisCount = 0
    mlNodesCreated = 0
    mlNodesDeleted = 0

    TerminateTree

    mbChanged = False

    Exit Sub
errH:
    #If DebugMode = 1 Then
        Stop
        Resume
    #End If
End Sub

Public Sub PopulateTree()
' PT add and displays all the controls for the Treeview for the first time

    MsgBox "In beta-023 PopulateTree() was depricated and merged with Refresh()" & vbNewLine & vbNewLine & _
            "Please replace ''PopulateTree'' with ''Refresh'' in your code", , AppName
clsTreeview - 13


    Refresh

End Sub

Public Sub Refresh()
' Create node controls as required the first time respective parent's Expanded property = true
' hide or show and (re)position node controls as required
' Call Refresh after changing any Treeview properties or after adding/removing/moving any nodes
' or making any change that will alter placement of nodes in the treeview
    Dim bInit As Boolean

    If Me.TreeControl Is Nothing Then
        TerminateTree
        ' a Frame (container for the treeview) should have been referrenced to me.TreeControl
        Err.Raise vbObjectError + 10, mcSource, "Refresh: 'TreeControl' frame is not referenced"

    ElseIf moRootHolder Is Nothing Then
        '
        Err.Raise vbObjectError + 11, mcSource, "Refresh: No Root nodes have been created"
    ElseIf moRootHolder.ChildNodes Is Nothing Then
        ' nothing to do
        mlVisCount = 0
        mlNodesCreated = 0
        mlNodesDeleted = 0
        Erase mlVisOrder
        Erase msngMaxWidths
        Exit Sub

    ElseIf Me.TreeControl.Controls.Count = 0 Then
         ' display the treeview for first time
         bInit = True
    Else
         ' ensure all node properties are checked, eg after changing indentation or nodeheight during runtime
         mbRedesign = True
    End If

    On Error GoTo errExit

    BuildRoot bInit

    Exit Sub

errExit:
    Err.Raise Err.Number, mcSource, "Error in BuildRoot: " & Err.Description
End Sub

Public Sub ScrollToView(Optional cNode As clsNode, _
                        Optional Top1Bottom2 As Long, _
                        Optional bCollapseOthers As Boolean)
' PT scrolls the treeview to position the node in view
' Top1Bottom2= 0 roughly 1/3 from the top
' Top1Bottom2= 1 or -1 at the top
' Top1Bottom2= 2 or -2 at the bottom

    Dim bIsVisible As Boolean
    Dim bWasCollapsed As Boolean
    Dim lVisIndex As Long
    Dim sngTop As Single
    Dim sngBot As Single
    Dim sngVisHt As Single
    Dim sngScrollTop As Single
    Dim cTmp As clsNode

    If cNode Is Nothing Then
        Set cNode = ActiveNode
    End If

    If bCollapseOthers Then
        SetTreeExpansionLevel 0
    End If

    Set cTmp = cNode.ParentNode
    While Not cTmp.Caption = "RootHolder"
         If Not cTmp.Expanded Then
             bWasCollapsed = True
             cTmp.Expanded = True
         End If
         Set cTmp = cTmp.ParentNode
    Wend
clsTreeview - 14


    If bWasCollapsed Then
        BuildRoot False
    End If

    lVisIndex = cNode.VisIndex
    sngBot = mcTLpad + lVisIndex * NodeHeight
    sngTop = sngBot - NodeHeight

    With TreeControl
        sngVisHt = .InsideHeight
        If .ScrollBars = fmScrollBarsBoth Or .ScrollBars = fmScrollBarsHorizontal Then
            sngVisHt = sngVisHt - 15    ' roughly(?) width of a scrollbar
        End If

        bIsVisible = sngTop > .ScrollTop And _
                     sngBot < .ScrollTop + sngVisHt

        If Not bIsVisible Or Top1Bottom2 > 0 Then

            If Top1Bottom2 < 0 Then Top1Bottom2 = Top1Bottom2 * -1

            If Top1Bottom2 = 0 Then ' place about 1/3 from top
                sngScrollTop = lVisIndex * NodeHeight - .InsideHeight / 3

            ElseIf Top1Bottom2 = 1 Then ' scroll to top
                 sngScrollTop = sngTop - mcTLpad
            Else
                 sngScrollTop = sngBot - sngVisHt + mcTLpad   ' scroll to bottom
            End If

            If sngScrollTop < 0 Then
                sngScrollTop = 0
            End If

             .ScrollTop = sngScrollTop
        End If
    End With
End Sub

Public Sub TerminateTree()
'-------------------------------------------------------------------------
' Procedure : TerminateTree
' Company   : JKP Application Development Services (c)
' Author    : Jan Karel Pieterse (www.jkp-ads.com)
' Created   : 15-01-2013
' Purpose   : Terminates this class' instance
'-------------------------------------------------------------------------
Dim cNode As clsNode
    'Instead of the terminate event of the class
    'we use this public method so it can be
    'explicitly called by parent classes
    'this is done because we'll end up having multiple circular references
    'between parent and child classes, which may cause the terminate events to be ignored.

    If Not moRootHolder Is Nothing Then
        If Not moRootHolder.ChildNodes Is Nothing Then
            For Each cNode In moRootHolder.ChildNodes

                 cNode.TerminateNode
            Next
        End If
        moRootHolder.TerminateNode
    End If

    Set moMoveNode = Nothing
    Set moEditNode = Nothing
    Set moActiveNode = Nothing
    Set moRootHolder = Nothing
    Set mcolNodes = Nothing

    '** by design TerminateTree does NOT reset treeview properties or remove
    '** the reference TreeControl reference to the treeview's Frame control
    '
    '   If the form is being unloaded it's enough to call TerminateTree in it's close event, node controls will a
utomatically unload with the form.
    '   However the treeview is to be cleared or moved but the main form is not being unloaded
    '   call the NodesRemove method which will remove all node controls then call TerminateTree
End Sub
clsTreeview - 15

'***********************************************************************************************
'*    Friend properties, functions and subs                                                    *
'*    although visible throughout the project these are only intended to be called by clsNodes *
'***********************************************************************************************

Friend Property Get EditMode(cNode As clsNode) As Boolean   ' PT
    EditMode = mbEditMode
End Property

Friend Property Let EditMode(cNode As clsNode, ByVal bEditMode As Boolean)    ' PT

    Set MoveCopyNode(False) = Nothing
    mbEditMode = bEditMode

    If Not moEditNode Is Nothing Then
        moEditNode.EditBox False
    End If


    If bEditMode Then
         Set moEditNode = cNode
    Else
         Set moEditNode = Nothing
    End If
End Property

Friend Function GetExpanderIcon(bExpanded As Boolean, pic As StdPicture) As Boolean
    If mbExpanderImage Then
        Set pic = moExpanderImage(bExpanded)
        GetExpanderIcon = True
    End If
End Function
Friend Function GetCheckboxIcon(lChecked As Long, pic As StdPicture) As Boolean
    If mbCheckboxImage Then
        Set pic = moCheckboxImage(lChecked)
        GetCheckboxIcon = True
    End If
End Function

Friend Function GetNodeIcon(vKey, pic As StdPicture, bFullWidth As Boolean) As Boolean
    On Error GoTo errExit
    Set pic = mcolIcons(vKey)
    bFullWidth = mbFullWidth
    GetNodeIcon = True
errExit:
End Function

Friend Function RaiseAfterLabelEdit(cNode As clsNode, sNewText As String) As Boolean
' PT called from moEditBox_KeyDown after vbKeyEnter
'
    Dim Cancel As Boolean
    RaiseEvent AfterLabelEdit(Cancel, sNewText, cNode)
    RaiseAfterLabelEdit = Cancel
End Function

Friend Sub NodeClick(ByRef oCtl As MSForms.Control, ByRef cNode As clsNode)
'-------------------------------------------------------------------------
' Procedure : NodeClick
' Company   : JKP Application Development Services (c)
' Author    : Jan Karel Pieterse (www.jkp-ads.com)
' Created   : 15-01-2013
' Purpose   : Handles clicks on the treeview. Called from clsNode
'-------------------------------------------------------------------------

' PT also called from checkbox (label) click event in clsNode
    Dim bFlag As Boolean
    Dim lngViewable As Long
    Dim cLastChild As clsNode

    If oCtl.Name Like "Exp*" Then
        bFlag = Not ActiveNode Is cNode
        If bFlag Then
            Set ActiveNode = cNode
        End If

        BuildRoot False

        If cNode.Expanded Then
            If Not cNode.ChildNodes Is Nothing Then
                Set cLastChild = cNode.ChildNodes(cNode.ChildNodes.Count)
clsTreeview - 16

                  If Not NodeIsVisible(cLastChild, lngViewable) Then
                     If lngViewable > cNode.ChildNodes.Count Then
                           ScrollToView cLastChild, Top1Bottom2:=2
                      Else
                           ScrollToView cNode, Top1Bottom2:=1
                      End If
                  End If
              End If
          End If
          If bFlag Then
              RaiseEvent Click(cNode)
          End If

    ElseIf oCtl.Name Like "CheckBox*" Then   ' PT
        ' RaiseEvent for the checkbox moved to clsNode
        RaiseEvent NodeCheck(cNode)

    ElseIf oCtl.Name Like "Node*" Then
        If Not ActiveNode Is cNode Then
             Set ActiveNode = cNode
        Else
             SetActiveNodeColor
        End If
        RaiseEvent Click(cNode)
    End If

End Sub

Friend Function UniqueKey(sKey As String) As String
    Dim cNode As clsNode
    For Each cNode In Nodes
         If cNode.Key = sKey Then
             Err.Raise vbObjectError + 1, "clsTreeView", "Duplicate key: '" & sKey & "'"
         End If
    Next
    UniqueKey = sKey
End Function

Friend Sub UpdateScrollLeft()
' PT, moved all this from Let-Changed() in v025,
' called after manual node edit, update scrollLeft if/as necessary to show end of the new text
    Dim sngChangedRight As Single
    Dim sngIconPad As Single
    Dim pic As StdPicture
    Dim v

    If Not ActiveNode Is Nothing Then

          sngChangedRight = ActiveNode.Control.Left + ActiveNode.TextWidth + 15

          If mbFullWidth Then
              If ActiveNode.hasIcon(v) Then
                  sngIconPad = mcIconPad
              End If
          End If

          If ActiveNode.TextWidth + sngIconPad > msngMaxWidths(ActiveNode.Level) Then
              msngMaxWidths(ActiveNode.Level) = ActiveNode.TextWidth + sngIconPad
          End If

          With Me.TreeControl

              If MaxNodeWidth > .InsideWidth Then

                   If .ScrollBars > fmScrollBarsHorizontal Then
                        .ScrollBars = fmScrollBarsBoth
                   Else
                        .ScrollBars = fmScrollBarsHorizontal
                   End If

                   .ScrollWidth = MaxNodeWidth + mcTLpad

                   If .ScrollLeft + .InsideWidth < sngChangedRight Then
                       .ScrollLeft = sngChangedRight - .InsideWidth + mcTLpad
                   End If

            End If
        End With
    End If
clsTreeview - 17

End Sub

'*********************************************************************************************
'*    Private events    *
'**********************************************************************************************

Private Sub TreeControl_Click()
' PT exit editmode if an empty part of the treeview is clicked
    EditMode(ActiveNode) = False
End Sub

'************************************
'*    Private functions and subs    *
'************************************

Private Sub Class_Initialize()
' Set Root = New clsNode
' Set moRoot = New clsNode ' maybe(?) but keep Root() as read only

' set some defaults
    mbRootButton = True
    mbShowExpanders = True
    mbShowLines = True
    #If Mac Then
        msngIndent = 20
        msngNodeHeight = 16
    #Else
        msngIndent = 15
        msngNodeHeight = 12
    #End If
    msngRootLine = msngIndent
    msAppName = "TreeView"

    #If DebugMode = 1 Then
        gClsTreeViewInit = gClsTreeViewInit + 1      'for testing only
    #End If

End Sub

Private Sub Class_Terminate()
    #If DebugMode = 1 Then
        gClsTreeViewTerm = gClsTreeViewTerm + 1
    #End If
End Sub

Private Function AddNodeToCol(colNodes As Collection, cAddNode As clsNode, bTreeCol As Boolean, Optional vBefore,
 Optional vAfter)
    Dim i As Long
    Dim sKey As String
    Dim cTmp As clsNode
    Dim pos As Long

    If bTreeCol Then sKey = cAddNode.Key

    If Len(sKey) Then
        On Error Resume Next
        i = 0
        Set cTmp = colNodes(sKey)
        If Not cTmp Is Nothing Then
            pos = InStr(1, sKey, "_copy:")
            If pos Then
                 sKey = Left$(sKey, pos - 1)
            End If
            sKey = sKey & "_copy:"
            While Not cTmp Is Nothing
                 Set cTmp = Nothing
                 i = i + 1
                 Set cTmp = colNodes(sKey & i)
            Wend
            sKey = sKey & i

              If bTreeCol Then
                  cAddNode.Key = sKey
              End If

          End If

          On Error GoTo 0    ' error returns to caller

          If IsMissing(vBefore) And IsMissing(vAfter) Then
clsTreeview - 18

                colNodes.Add cAddNode, sKey
           ElseIf IsMissing(vAfter) Then
                colNodes.Add cAddNode, sKey, vBefore
           Else
                colNodes.Add cAddNode, sKey, , vAfter
           End If

    Else     ' no key
        If IsMissing(vBefore) And IsMissing(vAfter) Then
             colNodes.Add cAddNode
        ElseIf IsMissing(vAfter) Then
             colNodes.Add cAddNode, , vBefore
        Else
             colNodes.Add cAddNode, , , vAfter
        End If
    End If
End Function

Private Sub BuildRoot(bInit As Boolean)
    Dim bCursorWait As Boolean
    Dim bTriStateOrig As Boolean
    Dim lLastRootVisIndex As Long
    Dim sngActiveNodeScrollTop As Single       ' PT distance activenode was from scrolltop top before refresh, if vi
sible
    Dim sngChkBoxPad As Single
    Dim sngHeightAllNodes As Single
    Dim sngIconPad As Single
    Dim sngMaxWidth As Single
    Dim cRoot As clsNode
    Dim objCtrl As MSForms.Control
    Dim pt As POINTAPI
    Dim vIconKey

    Dim sCap As String
    Dim sngTickCnt As Single

    On Error GoTo locErr

    #If DebugMode Then
        #If Win32 Or Win64 Then
            sngTickCnt = getTickCount
        #Else ' Mac
            sngTickCnt = Timer
        #End If
    #End If

    bInit = TreeControl.Count = 0

    'TODO find equivalent for cancel key in Access & Word
    #If HostProject = "Access" Then
    #ElseIf HostProject = "Word" Then
    #Else
        Application.EnableCancelKey = xlErrorHandler
    #End If

    If mbAlwaysRedesign Then mbRedesign = True

    '       mcChkBoxSize = 10.5    ' 11.25
    '       mcLineLeft = 3 + 7.5    'msngIndent / 2

    ' PT if these arrays aren't large enough Redim Preserve is done in error handler
    ReDim mlVisOrder(1 To mlNodesCreated + 100)
    If bInit Or mbRedesign Then
        ReDim msngMaxWidths(0 To 7)
    End If

    If mcolNodes.Count - mlNodesCreated > 400 Then
        ' creating many controls might take a while
        #If HostProject = "Access" Then
            Application.DoCmd.Hourglass True
        #ElseIf HostProject = "Word" Then
            System.Cursor = wdCursorWait
        #Else
            Application.Cursor = xlWait
        #End If
        bCursorWait = True
    End If
    If Not bInit Then
        If NodeIsVisible Then
            sngActiveNodeScrollTop = (ActiveNode.VisIndex - 1) * NodeHeight - Me.TreeControl.ScrollTop
clsTreeview - 19

        End If
    End If

    mlVisCount = 0
    bTriStateOrig = mbTriState
    mbTriState = False

    If CheckBoxes Then
        If mbCheckboxImage Then
             sngChkBoxPad = mcCheckboxPadImg
        Else
             sngChkBoxPad = mcCheckboxPad
        End If
        If mcChkBoxSize > msngNodeHeight Then
             msngNodeHeight = mcChkBoxSize
        End If
    End If

    ' work out respective offsets to various node controls from node tops
    msngTopExpB = mcTLpad + (msngNodeHeight - mcExpButSize) / 2 + 1.5
    If mbExpanderImage Then
         msngTopExpT = mcTLpad + (msngNodeHeight - (mcExpButSize - 4)) / 2
    Else
         msngTopExpT = mcTLpad + (msngNodeHeight - mcExpButSize) / 2
    End If

    msngTopChk = mcTLpad + (msngNodeHeight - mcChkBoxSize) / 2
    msngTopIcon = mcTLpad + (msngNodeHeight - mcIconSize) / 2
    msngTopHV = mcTLpad + msngNodeHeight / 2
    Call Round75


    With TreeControl
        mlBackColor = .BackColor    ' default colours for node labels
        mlForeColor = .ForeColor

        If bInit Then
             .SpecialEffect = 2     ' fmSpecialEffectSunken
        Else
             ' PT, refresh, start by hiding all the controls
             For Each objCtrl In .Controls
                  objCtrl.Visible = False
             Next
        End If


        For Each cRoot In moRootHolder.ChildNodes
            sngIconPad = 0
            If mbFullWidth Then
                If mbGotIcons And cRoot.hasIcon(vIconKey) Then
                    sngIconPad = mcIconPad
                End If
            End If

            If cRoot.Control Is Nothing Then
                mlNodesCreated = mlNodesCreated + 1
                'Add the rootnode to the tree
                Set cRoot.Control = TreeControl.Controls.Add("Forms.label.1", "Node" & mlNodesDeleted + mlNodesCr
eated, False)
                With cRoot.Control

                    If Not mbFullWidth And mbGotIcons Then
                        If cRoot.hasIcon(vIconKey) Then
                            .PicturePosition = fmPicturePositionLeftCenter
                            .Picture = mcolIcons(vIconKey)
                        End If
                    End If

                    .Top = mcTLpad + mlVisCount * msngNodeHeight
                    .Left = mcTLpad + msngRootLine + sngIconPad + msngChkBoxPad

                    If cRoot.BackColor Then
                        .BackColor = cRoot.BackColor
                    End If
                    If cRoot.ForeColor Then
                        .ForeColor = cRoot.ForeColor
                    End If

                    If cRoot.Bold Then .Font.Bold = True
                    .Caption = cRoot.Caption
clsTreeview - 20

                       .AutoSize = True
                       .WordWrap = False

                       cRoot.TextWidth = .Width

                       If .Width + sngIconPad > msngMaxWidths(0) Then
                           msngMaxWidths(0) = .Width + sngIconPad
                       End If

                       ' calc msngTopLabel to align node label to mid NodeHeight
                       ' first calc min NodeHeight if not set higher by user
                       If .Height > msngNodeHeight Then
                           ' optimal HodeHeight for the current font
                           msngNodeHeight = .Height     ' 'don't use the Property method or Refresh will be called
                       ElseIf .Height < msngNodeHeight Then
                           #If Mac Then
                               msngTopLabel = Int(msngNodeHeight - .Height) / 2
                           #Else
                               msngTopLabel = Int((msngNodeHeight - .Height + mcPtPxl) / 3 * 2) * mcPtPxl
                           #End If
                           .Top = mcTLpad + msngTopLabel + mlVisCount * msngNodeHeight
                       End If

                       If mbFullWidth Then
                           If msngTopLabel < mcFullWidth Then
                               .Width = mcFullWidth
                               .AutoSize = False
                           End If
                       End If

                       If Len(cRoot.ControlTipText) Then
                           .ControlTipText = cRoot.ControlTipText
                       End If

                       .WordWrap = False
                       .ZOrder 0
                       .Visible = True

                   End With
            Else

                   With cRoot.Control

                       If mbRedesign Then
                           .Left = mcTLpad + msngRootLine + sngIconPad + msngChkBoxPad

                           If cRoot.TextWidth + sngIconPad > msngMaxWidths(0) Then
                               msngMaxWidths(0) = cRoot.TextWidth + sngIconPad
                           End If
                       End If

                       If .Height > msngNodeHeight Then
                           msngNodeHeight = .Height
                       ElseIf .Height < msngNodeHeight Then
                           #If Mac Then
                               msngTopLabel = Int(msngNodeHeight - .Height) / 2
                           #Else
                               msngTopLabel = Int((msngNodeHeight - .Height + mcPtPxl) / 3 * 2) * mcPtPxl
                           #End If
                       End If

                       .Top = mcTLpad + msngTopLabel + mlVisCount * msngNodeHeight

                       .Visible = True

                End With
            End If

            ' horizontal line
            If mbRootButton And mbShowLines Then
                If cRoot.HLine Is Nothing Then
                    Set cRoot.HLine = TreeControl.Controls.Add("Forms.label.1", "HLine" & cRoot.Control.Name, Fal
se)
                       With cRoot.HLine
                           .Top = msngTopHV + mlVisCount * msngNodeHeight
                           .Left = mcLineLeft
                           .Caption = ""
                           .BorderStyle = fmBorderStyleSingle
                           .BorderColor = vbScrollBars
                           .Width = msngIndent
clsTreeview - 21

                              .Height = mcPtPxl
                              .TextAlign = fmTextAlignCenter
                              .BackStyle = fmBackStyleTransparent
                              .ZOrder 1
                              .Visible = True
                          End With
                   Else
                    With cRoot.HLine
                        .Width = msngIndent
                        .Top = msngTopHV + mlVisCount * msngNodeHeight            ' 3 + NodeHeight/2 (to nearest 0.75)
                        .Visible = True
                    End With
                End If
            End If

            ' Checkbox
            If CheckBoxes Then
                If cRoot.Checkbox Is Nothing Then
                    Set cRoot.Checkbox = TreeControl.Controls.Add("Forms.label.1", "CheckBox" & cRoot.Control.Nam
e, False)
                          With cRoot.Checkbox
                              .Left = mcTLpad + msngRootLine
                              .Top = msngTopChk + mlVisCount * msngNodeHeight

                               If mbCheckboxImage Then
                                    'Use an image
                                    .BorderStyle = fmBorderStyleNone
                                    .Picture = moCheckboxImage(cRoot.Checked)
                                    .PicturePosition = fmPicturePositionLeftTop
                                    .AutoSize = True
                                    '.Width = 7.5
                                    '.Height = 7.5
                               Else
                                    .Width = mcChkBoxSize
                                    .Height = mcChkBoxSize
                                    .Font.Name = "Marlett" ' "a" is a tick
                                    .FontSize = mcCheckboxFont      '9
                                    .BorderStyle = fmBorderStyleSingle
                                    .BackColor = vbWindowBackground
                                    .ForeColor = vbWindowText
'''' NEW LINES '''''''''
        If cRoot.Checked Then
            .Caption = "a"
            If cRoot.Checked = 1 Then
                .ForeColor = RGB(180, 180, 180)
            End If
        End If
'''''''''''''''''''''''


                              End If
                           '   If cRoot.Checked Then cRoot.Checked = True
                              .Visible = True
                          End With
                   Else
                    With cRoot.Checkbox
                        .Left = mcTLpad + msngRootLine
                        .Top = msngTopChk + mlVisCount * msngNodeHeight
                        .Visible = True
                    End With
                End If
            End If

            ' Icon
            If mbFullWidth And mbGotIcons Then
                If cRoot.hasIcon(vIconKey) Then
                    If cRoot.Icon Is Nothing Then
                        Set cRoot.Icon = TreeControl.Controls.Add("Forms.Image.1", "Icon" & cRoot.Control.Name, F
alse)
                               With cRoot.Icon
                                   .BackStyle = fmBackStyleTransparent
                                   .BorderStyle = fmBorderStyleNone
                                   '.AutoSize
                                   .Width = mcIconSize
                                   .Height = mcIconSize
                                   .Left = mcTLpad + msngRootLine + msngChkBoxPad
                                   .Top = msngTopIcon + mlVisCount * msngNodeHeight
                                   .Picture = mcolIcons(vIconKey)
                                   .BackStyle = fmBackStyleTransparent
                                   .Visible = True
clsTreeview - 22

                                 End With
                          Else
                              With cRoot.Icon
                                  .Left = mcTLpad + msngRootLine + msngChkBoxPad
                                  .Top = msngTopIcon + mlVisCount * msngNodeHeight
                                  .Visible = True
                              End With
                          End If
                   Else
                       sngIconPad = 0
                   End If
               End If

               mlVisCount = mlVisCount + 1
               mlVisOrder(mlVisCount) = cRoot.Index
               cRoot.VisIndex = mlVisCount

               lLastRootVisIndex = mlVisCount

               'Now add this root's children
               If Not cRoot.ChildNodes Is Nothing Then
                   BuildTree cRoot, 1, True
               End If

        Next

        'Vertical line for multiple roots
        If mbRootButton And mbShowLines Then
            If moRootHolder.ChildNodes.Count > 1 Then

                   If moRootHolder.VLine Is Nothing Then
                       Set moRootHolder.VLine = TreeControl.Controls.Add("forms.label.1", "VLine_Roots")
                       With moRootHolder.VLine
                           .ZOrder 1
                           .Width = mcPtPxl
                           .Caption = ""
                           .BorderColor = vbScrollBars
                           .BorderStyle = fmBorderStyleSingle
                           .Top = msngTopHV
                           .Left = mcLineLeft
                           .Height = (lLastRootVisIndex - 1) * msngNodeHeight
                       End With

                   Else

                       With moRootHolder.VLine
                           .Top = msngTopHV
                           .Height = (lLastRootVisIndex - 1) * msngNodeHeight
                           .Visible = True
                       End With
                   End If

            End If
        End If

        sngHeightAllNodes = mlVisCount * NodeHeight + (mcTLpad * 2)          ' mcTLpad for top/bottom padding
        If bInit Then
            .ScrollHeight = 0
            .ScrollLeft = 0
        End If

        sngMaxWidth = MaxNodeWidth

        If sngHeightAllNodes > .InsideHeight Then
             If sngMaxWidth + 15 > .InsideWidth Then
                  .ScrollBars = fmScrollBarsBoth
                  .ScrollWidth = sngMaxWidth + mcTLpad
             Else
                  .ScrollBars = fmScrollBarsVertical
                  .ScrollLeft = 0
                  .ScrollWidth = 0
             End If
             .ScrollHeight = sngHeightAllNodes
        Else
             If sngMaxWidth > .InsideWidth + IIf(.ScrollBars > 1, 15, 0) Then
                  .ScrollBars = fmScrollBarsHorizontal
                  .ScrollWidth = sngMaxWidth + mcTLpad
             Else
                  .ScrollBars = fmScrollBarsNone
                  .ScrollLeft = 0
clsTreeview - 23

                   .ScrollWidth = 0
               End If

            .ScrollTop = 0
            .ScrollHeight = 0
        End If

        If bInit Then    ' startup
            '' make the first root node active but don't highlight it
            Set moActiveNode = moRootHolder.ChildNodes(1)
            '' or if preferred highlighted at startup
            'Set ActiveNode = moRootHolder.ChildNodes(1)
        ElseIf Not ActiveNode Is Nothing Then
            If Not NodeIsVisible Then
                .ScrollTop = (ActiveNode.VisIndex - 1) * NodeHeight - sngActiveNodeScrollTop
            End If
        End If

    End With

    #If DebugMode Then
        #If Win32 Or Win64 Then
            sngTickCnt = (getTickCount - sngTickCnt) / 1000
        #Else ' if Mac
            sngTickCnt = Timer - sngTickCnt
        #End If

        sCap = "Seconds: " & Format(sngTickCnt, "0.00") & _
               "    Nodes: " & mcolNodes.Count & _
               " created: " & mlNodesCreated & _
               " visible: " & mlVisCount & _
               "    Total controls: " & TreeControl.Controls.Count

        #If HostProject = "Access" Then
            If Not moForm Is Nothing Then
                moForm.Caption = sCap
            End If
        #Else
            Me.TreeControl.Parent.Caption = sCap
        #End If
    #End If

    mbRedesign = False
    mbTriState = bTriStateOrig
done:

    If bCursorWait Then

        #If HostProject = "Access" Then
            Application.DoCmd.Hourglass False
        #ElseIf HostProject = "Word" Then
            System.Cursor = wdCursorNormal
        #Else
            Application.Cursor = xlDefault
        #End If

        #If Win32 Or Win64 Then
            ' in some systems the cursor fails to reset to default, this forces it
            GetCursorPos pt
            SetCursorPos pt.X, pt.Y
        #End If
    End If

    'TODO: implement API equivalent for cancel key in Access & Word
    #If HostProject = "Access" Then
    #ElseIf HostProject = "Word" Then
    #Else
        Application.EnableCancelKey = xlInterrupt
    #End If

    Exit Sub

locErr:
    mbRedesign = False
    mbTriState = bTriStateOrig

    If Err.Number = 9 And (mlVisCount = UBound(mlVisOrder) + 1) Then
        ' most likely an array needs enlarging
        If mlVisCount = UBound(mlVisOrder) + 1 Then
            ReDim Preserve mlVisOrder(LBound(mlVisOrder) To mlVisCount + 100)
clsTreeview - 24

            Resume
        End If
    ElseIf Err.Number = 18 Then
        ' user pressed ctrl-break
        MsgBox "Loading/refreshing Treeview aborted", , AppName
        NodesClear
        Resume done
    End If

    #If DebugMode = 1 Then
        Debug.Print Err.Number, Err.Description
        Stop
        Resume
    #End If

    Err.Raise Err.Number, "BuildRoot", Err.Description
End Sub

Private Sub BuildTree(cNode As clsNode, ByVal lLevel As Long, Optional lMaxLevel As Long = -1)
    Dim cChild As clsNode
    Dim lVLineTopIdx As Long

   ' On Error GoTo locErr

    If (lLevel > 1 Or mbRootButton) And mbShowExpanders Then

         'Expand/collapse button box (not needed if we use icons are used for expanders)
         If Not mbExpanderImage Then
             If cNode.ExpanderBox Is Nothing Then
                 Set cNode.ExpanderBox = TreeControl.Controls.Add("Forms.label.1", "ExpBox" & cNode.Control.Name,
False)
                    With cNode.ExpanderBox
                        .Top = (mlVisCount - 1) * NodeHeight + msngTopExpB
                        .Left = mcTLpad * 2 + (lLevel - 2) * msngIndent + msngRootLine
                        .Width = mcExpBoxSize
                        .Height = mcExpBoxSize
                        .BorderStyle = fmBorderStyleSingle
                        .BorderColor = vbScrollBars
                        .BackStyle = fmBackStyleOpaque
                        .Visible = True
                    End With
             Else
                 With cNode.ExpanderBox
                     If mbRedesign Then .Left = mcTLpad * 2 + (lLevel - 2) * msngIndent + msngRootLine
                     .Top = (mlVisCount - 1) * NodeHeight + msngTopExpB
                     .Visible = True
                 End With
             End If
         End If

         'Expand/collapse button text (or icon)
         If cNode.Expander Is Nothing Then
             Set cNode.Expander = TreeControl.Controls.Add("Forms.label.1", "ExpText" & cNode.Control.Name, False)
             With cNode.Expander
                 .Left = mcTLpad * 2 + (lLevel - 2) * msngIndent + msngRootLine
                 .Top = (mlVisCount - 1) * NodeHeight + msngTopExpT

                    If mbExpanderImage Then
                         'Use an image
                         .AutoSize = True
                         .Width = 7.5
                         .Height = 7.5
                         .BorderStyle = fmBorderStyleNone
                         .PicturePosition = fmPicturePositionLeftTop
                         .Picture = moExpanderImage(cNode.Expanded)
                         #If Mac Then
                             .BackStyle = fmBackStyleTransparent
                         #End If
                    Else
                         'use +/- text
                         .Width = mcExpButSize
                         .Height = mcExpButSize

                        If cNode.Expanded = True Then
                             .Caption = "-"
                             .Font.Bold = True
                        Else
                             .Caption = "+"
                             .Font.Bold = False
                        End If
clsTreeview - 25


                        .Font.Size = mcExpanderFont
                        .TextAlign = fmTextAlignCenter
                        .BackStyle = fmBackStyleTransparent
                   End If
                   .Visible = True
               End With
        Else
            With cNode.Expander
                If mbRedesign Then .Left = mcTLpad * 2 + (lLevel - 2) * msngIndent + msngRootLine
                .Top = (mlVisCount - 1) * NodeHeight + msngTopExpT
                .Visible = True
            End With
        End If

    End If     ' lLevel > 1 Or mbRootButton) And mbShowExpanders

    If cNode.Expanded And (lMaxLevel < lLevel Or lMaxLevel = -1) Then

        'Vertical line
        If mbShowLines Then
            If cNode.VLine Is Nothing Then
                Set cNode.VLine = TreeControl.Controls.Add("Forms.label.1", "VLine" & cNode.Control.Name, False)
                lVLineTopIdx = mlVisCount
                With cNode.VLine
                    .ZOrder 1
                    .Top = msngTopHV + (lVLineTopIdx - 1) * NodeHeight
                    .Left = mcLineLeft + msngRootLine + msngIndent * (lLevel - 1)
                    .Width = mcPtPxl
                    .Height = NodeHeight
                    .Caption = ""
                    .BorderColor = vbScrollBars
                    .BorderStyle = fmBorderStyleSingle
                    .Visible = True
                End With

               Else
                lVLineTopIdx = mlVisCount
                With cNode.VLine
                    .Top = msngTopHV + (lVLineTopIdx - 1) * NodeHeight
                    If mbRedesign Then
                         .Left = mcLineLeft + msngRootLine + msngIndent * (lLevel - 1)
                         .Visible = True
                    End If
                End With
            End If
        End If

        For Each cChild In cNode.ChildNodes

               ' extend the vertical line
               If mbShowLines Then
                   With cNode.VLine
                       .Height = (mlVisCount - lVLineTopIdx + 1) * msngNodeHeight
                       .Visible = True
                   End With
               End If

               BuildNodeControls cChild, lLevel

               If Not cChild.ChildNodes Is Nothing Then
                   BuildTree cChild, lLevel + 1
               End If

        Next

    End If       ' cNode.Expanded And (lMaxLevel < lLevel Or lMaxLevel = -1)

    Exit Sub

'locErr:
'    #If DebugMode = 1 Then
'        Stop
'        Resume
'    #End If
End Sub

Private Sub BuildNodeControls(cNode As clsNode, ByVal lLevel As Long)
' PT, create or (un)hide the controls, size & position to suit
' all created nodes have a caption, and optionally a horizontal line, checkbox and seperate icon
clsTreeview - 26


      Dim sngIconPad As Single
      Dim sName As String
      Dim vKey

      On Error GoTo locErr

  '    Application.EnableCancelKey = xlErrorHandler

      If cNode.Control Is Nothing Then
          mlNodesCreated = mlNodesCreated + 1
          sName = "Node" & mlNodesDeleted + mlNodesCreated
      ElseIf mbRedesign Then
           sName = cNode.Control.Name
      End If

      'Horizontal line
      If mbShowLines Then
          If cNode.HLine Is Nothing Then
               Set cNode.HLine = TreeControl.Controls.Add("Forms.label.1", "HLine" & sName, False)
               With cNode.HLine
                   .Left = mcLineLeft + msngRootLine + msngIndent * (lLevel - 1)
                   .Top = msngTopHV + mlVisCount * NodeHeight
                   .Width = msngIndent
                   .Height = mcPtPxl
                   .Caption = ""
                   .BorderStyle = fmBorderStyleSingle
                   .BorderColor = vbScrollBars
                    If mbRedesign Then
                        .ZOrder 1
                    End If
                   .Visible = True
               End With
          Else
               With cNode.HLine
                   If mbRedesign Then
                        .Left = mcLineLeft + msngRootLine + msngIndent * (lLevel - 1)
                        .Width = msngIndent
                   End If
                   .Top = msngTopHV + mlVisCount * NodeHeight
                   .Visible = True
               End With
          End If
      End If

      ' Checkbox
      If CheckBoxes Then
          If cNode.Checkbox Is Nothing Then
              Set cNode.Checkbox = TreeControl.Controls.Add("Forms.label.1", "CheckBox" & sName, False)
              With cNode.Checkbox
                  .Left = mcTLpad + msngRootLine + msngIndent * lLevel
                  .Top = mlVisCount * NodeHeight + msngTopChk

                     If mbCheckboxImage Then
                          'Use an image
                          .BorderStyle = fmBorderStyleNone
                          .Picture = moCheckboxImage(cNode.Checked)
                          .PicturePosition = fmPicturePositionLeftBottom
                          .AutoSize = True
                     Else

                         .Width = mcChkBoxSize
                         .Height = mcChkBoxSize
                         .Font.Name = "Marlett"
                         .Font.Size = 10
                         .TextAlign = fmTextAlignCenter
                         .BorderStyle = fmBorderStyleSingle
                         If cNode.Checked Then
                             .Caption = "a"
                             If cNode.Checked = 1 Then
                                 .ForeColor = RGB(180, 180, 180)
                             End If
                         End If
                     End If

                     .Visible = True
                 End With
          Else
                 With cNode.Checkbox
                     If mbRedesign Then .Left = mcTLpad + msngRootLine + msngIndent * lLevel
clsTreeview - 27

                .Top = mlVisCount * NodeHeight + msngTopChk
                .Visible = True
            End With
        End If
    End If

    ' Icon, in its own image control if using FullWidth, otherwise it goes in the label
    If mbFullWidth And mbGotIcons Then
        If cNode.hasIcon(vKey) Then
             sngIconPad = mcIconPad
             If cNode.Icon Is Nothing Then
                  Set cNode.Icon = TreeControl.Controls.Add("Forms.Image.1", "Icon" & sName, False)
                  With cNode.Icon
                      .BorderStyle = fmBorderStyleNone
                      .Left = mcTLpad + msngRootLine + msngIndent * lLevel + msngChkBoxPad
                      .Top = mlVisCount * NodeHeight + msngTopIcon
                      '.AutoSize
                      .Width = mcIconSize
                      .Height = mcIconSize
                      .BackStyle = fmBackStyleTransparent
                      .Picture = mcolIcons(vKey)
                      .BackStyle = fmBackStyleTransparent
                      .Visible = True
                  End With
             Else
                  With cNode.Icon
                      If mbRedesign Then
                           .Left = mcTLpad + msngRootLine + msngIndent * lLevel + msngChkBoxPad
                      End If
                      .Top = mlVisCount * NodeHeight + msngTopIcon
                      .Visible = True
                  End With
             End If
        Else
             sngIconPad = 0
        End If
    End If

    'The node itself
    If cNode.Control Is Nothing Then

        Set cNode.Control = TreeControl.Controls.Add("Forms.label.1", sName, False)
        With cNode.Control
            .WordWrap = False
            .AutoSize = True
            .Left = mcTLpad + msngRootLine + msngIndent * lLevel + msngChkBoxPad + sngIconPad
            .Top = mcTLpad + msngTopLabel + mlVisCount * NodeHeight

            If Not mbFullWidth And mbGotIcons Then
                If cNode.hasIcon(vKey) Then
                    .PicturePosition = fmPicturePositionLeftCenter
                    .Picture = mcolIcons(vKey)
                End If
            End If

            If cNode.Bold Then .Font.Bold = True
            .WordWrap = False
            .AutoSize = True
            .Caption = cNode.Caption
            cNode.TextWidth = .Width

            If cNode.TextWidth + sngIconPad > msngMaxWidths(lLevel) Then
                msngMaxWidths(lLevel) = cNode.TextWidth + sngIconPad
            End If

            If mbFullWidth Then
                .AutoSize = False
                If .Width <= mcFullWidth Then .Width = mcFullWidth
            End If
            If cNode.BackColor Then
                .BackColor = cNode.BackColor
            End If
            If cNode.ForeColor Then
                .ForeColor = cNode.ForeColor
            End If

            If Len(cNode.ControlTipText) Then
                .ControlTipText = cNode.ControlTipText
            End If
clsTreeview - 28

               .Visible = True
           End With

    Else
           With cNode.Control
               If mbRedesign Then
                   .Left = mcTLpad + msngRootLine + msngIndent * lLevel + sngIconPad + msngChkBoxPad

                   If cNode.TextWidth + sngIconPad > msngMaxWidths(lLevel) Then
                       msngMaxWidths(lLevel) = cNode.TextWidth + sngIconPad
                   End If
               End If

               .Top = mlVisCount * NodeHeight + mcTLpad + msngTopLabel
               .Visible = True
           End With

    End If

    mlVisCount = mlVisCount + 1
    mlVisOrder(mlVisCount) = cNode.Index
    cNode.VisIndex = mlVisCount

    Exit Sub

locErr:
    If Err.Number = 9 Then
         ' most likely an array needs enlarging
         If mlVisCount = UBound(mlVisOrder) + 1 Then
             ReDim Preserve mlVisOrder(LBound(mlVisOrder) To mlVisCount + 100)
             Resume
         ElseIf lLevel > UBound(msngMaxWidths) Then
             ReDim Preserve msngMaxWidths(LBound(msngMaxWidths) To lLevel + 5)
             Resume
         End If
    ElseIf Err.Number = 18 Then
         Err.Raise 18    ' user pressed ctrl-break, pass to BuildRoot
    Else
         #If DebugMode = 1 Then
             Stop
             Resume
         #End If
         Err.Raise Err.Number, "BuildNodeControls", Err.Description
    End If

End Sub

Private Sub Clone(cParent As clsNode, cNode As clsNode, Optional vBefore, Optional ByVal vAfter)
' PT clone a node and add the 4-way references
    Dim bTriStateOrig As Boolean
    Dim cClone As clsNode
    Dim cChild As clsNode

    On Error GoTo errH

    If cParent Is Nothing Or cNode Is Nothing Then
        Exit Sub
    End If

    bTriStateOrig = mbTriState
    mbTriState = False

    Set cClone = New clsNode

    With cNode
        If .BackColor = 0 Then .BackColor = mlBackColor
        cClone.BackColor = .BackColor
        cClone.Caption = .Caption
        cClone.Checked = .Checked
        cClone.Expanded = .Expanded
        If .ForeColor = 0 Then .ForeColor = mlForeColor
        cClone.ImageExpanded = .ImageExpanded
        cClone.ImageMain = .ImageMain
        cClone.ForeColor = .ForeColor
        cClone.Key = .Key
    End With

    If cParent.ChildNodes Is Nothing Then
        Set cParent.ChildNodes = New Collection
    End If
clsTreeview - 29


    Set cClone.ParentNode = cParent

    If Not cNode.ChildNodes Is Nothing Then
        For Each cChild In cNode.ChildNodes
             Clone cClone, cChild   ' don't pass vBefore/vAfter
        Next
    End If

    AddNodeToCol cParent.ChildNodes, cClone, False, vBefore, vAfter

    Set cClone.Tree = Me

    AddNodeToCol mcolNodes, cClone, bTreeCol:=True

    cClone.Index = Nodes.Count

    mbTriState = bTriStateOrig
    If mbTriState Then
        cClone.ParentNode.CheckTriStateParent
    End If

    Exit Sub

errH:
    #If DebugMode = 1 Then
        Debug.Print Err.Description
        Stop
        Resume
    #End If
    mbTriState = bTriStateOrig
End Sub

Private Function MaxNodeWidth() As Single
'-------------------------------------------------------------------------
' Procedure : MaxNodeWidth
' Author    : Peter Thornton
' Created   : 27-01-2013
' Purpose   : Get the max right for horizontal scroll
'-------------------------------------------------------------------------
    Dim lLevel As Long
    Dim sngMax As Single

    ''' msngMaxWidths(), contains maximum text-width + additional icon width (if any) in each level
    ' tot-width = 3 + msngRootLine + msngIndent * lLevel + msngChkBoxPad + [ msngIconPad + text-width]

    For lLevel = 0 To UBound(msngMaxWidths)
         If msngMaxWidths(lLevel) Then
             If mcTLpad + msngRootLine + msngIndent * lLevel + msngChkBoxPad + msngMaxWidths(lLevel) > sngMax Then
                 sngMax = mcTLpad + msngRootLine + msngIndent * lLevel + msngChkBoxPad + msngMaxWidths(lLevel)
             End If
         End If
    Next
    MaxNodeWidth = sngMax

End Function

Private Function NextVisibleNodeInTree(ByRef cStartNode As clsNode, Optional bUp As Boolean = True) As clsNode
'-------------------------------------------------------------------------
' Procedure : NextVisibleNodeInTree
' Company   : JKP Application Development Services (c)
' Author    : Jan Karel Pieterse (www.jkp-ads.com)
' Created   : 16-01-2013
' Purpose   : Function that returns either the next or the previous node adjacent to the active node
'-------------------------------------------------------------------------

    Dim lStep As Long
    Dim lNextVis As Long    'PT

    On Error GoTo errH
    If bUp Then lStep = -1 Else lStep = 1

    If cStartNode Is Nothing Then
         Set NextVisibleNodeInTree = mcolNodes(1)
    Else

        lNextVis = cStartNode.VisIndex
        lNextVis = lNextVis + lStep
        If lNextVis >= 1 And lNextVis <= mlVisCount Then
            lNextVis = mlVisOrder(lNextVis)
clsTreeview - 30

             Set NextVisibleNodeInTree = mcolNodes(lNextVis)
        End If
    End If
    Exit Function
errH:
    #If DebugMode = 1 Then
        Stop
        Debug.Print Err.Description
        Resume
    #End If
End Function

Private Function NodeIsVisible(Optional cNode As clsNode, Optional lngCntVisible As Long) As Boolean
Dim idxFirstVis As Long
Dim idxLastVis As Long

    If TreeControl Is Nothing Then
        Exit Function
    End If

    With TreeControl
        idxFirstVis = .ScrollTop / NodeHeight + 1
        lngCntVisible = (.InsideHeight - mcTLpad) / NodeHeight
        idxLastVis = lngCntVisible + idxFirstVis - 1
    End With

    If cNode Is Nothing Then
        If Not ActiveNode Is Nothing Then

               Set cNode = ActiveNode
        Else
            Exit Function
        End If
    End If

    If idxLastVis > mlVisCount Then idxLastVis = mlVisCount

    If Not cNode Is Nothing Then
        NodeIsVisible = cNode.VisIndex >= idxFirstVis And cNode.VisIndex <= idxLastVis
    End If

End Function

Private Sub ResetActiveNodeColor(cNode As clsNode)
    Dim lBColor As Long
    Dim lFColor As Long
    If Not cNode Is Nothing Then
        lBColor = cNode.BackColor
        lFColor = cNode.ForeColor
        With cNode.Control
            .BorderStyle = fmBorderStyleNone
            .BackColor = IIf(lBColor, lBColor, mlBackColor)
            .ForeColor = IIf(lFColor, lFColor, mlForeColor)
        End With
    End If
End Sub

Private Sub Round75()
'-------------------------------------------------------------------------
' Procedure : Round75
' Author     : Peter Thornton
' Created    : 29-01-2013
' Purpose    : Make size & position dims a factor of 0.75 points (units of 1 pixel)
'-------------------------------------------------------------------------
#If Mac Then
    msngTopExpB = Int(msngTopExpB)
    msngTopExpT = Int(msngTopExpT)
    msngTopHV = Int(msngTopHV)
    msngTopIcon = Int(msngTopIcon)
    msngTopChk = Int(msngTopChk)
    msngTopLabel = Int(msngTopLabel)
#Else
    msngTopExpB = Int((msngTopExpB * 2 + mcPtPxl) / 3 * 2) * mcPtPxl
    msngTopExpT = Int((msngTopExpT * 2 + mcPtPxl) / 3 * 2) * mcPtPxl
    msngTopHV = Int((msngTopHV * 2 + mcPtPxl) / 3 * 2) * mcPtPxl
    msngTopIcon = Int((msngTopIcon * 2 + mcPtPxl) / 3 * 2) * mcPtPxl
    msngTopChk = Int((msngTopChk * 2 + mcPtPxl) / 3 * 2) * mcPtPxl
    msngTopLabel = Int((msngTopLabel * 2 + mcPtPxl) / 3 * 2) * mcPtPxl
#End If
End Sub
clsTreeview - 31


Private Sub SetActiveNodeColor(Optional bInactive)

    If Not ActiveNode Is Nothing Then

        If IsMissing(bInactive) Then
            On Error Resume Next
            #If HostProject = "Access" Then
                bInactive = mbInActive
            #Else
                bInactive = Not Me.TreeControl Is Me.TreeControl.Parent.ActiveControl
            #End If
            On Error GoTo 0
        End If

         ' system highlight colours, bInactive set and called from EnterExit event

        With ActiveNode.Control
            If bInactive Then
            ''' when treeeview not in focus

                    ResetActiveNodeColor moActiveNode
                    '' just a grey border
                    .BorderStyle = fmBorderStyleSingle
                    .BorderColor = RGB(190, 190, 190)

                    '' inactive colours
'                    .BackColor = vbInactiveTitleBar
'                    .ForeColor = vbWindowText
             Else
                 ' in focus
                 .BorderStyle = fmBorderStyleNone
                 .BackColor = vbHighlight
                 .ForeColor = vbHighlightText
            End If
        End With

    End If
End Sub

Private Sub SetTreeExpansionLevel(lLevel As Long, Optional lCurLevel As Long, _
                                          Optional cNode As clsNode, Optional bExit As Boolean = False)
'-------------------------------------------------------------------------
' Procedure : SetTreeExpansionLevel
' Company   : JKP Application Development Services (c)
' Author    : Jan Karel Pieterse (www.jkp-ads.com)
' Created   : 17-01-2013
' Purpose   : Updates the expanded properties according to lLevel
'             Called recursively.
'-------------------------------------------------------------------------
    Dim cChild As clsNode
    If bExit Then Exit Sub
    If cNode Is Nothing Then

        For Each cNode In moRootHolder.ChildNodes
             If lLevel > -1 Then
                  cNode.Expanded = True
             Else
                  cNode.Expanded = False
             End If
             If Not cNode.ChildNodes Is Nothing Then
                  For Each cChild In cNode.ChildNodes
                       cChild.Expanded = (lLevel > lCurLevel)
                       SetTreeExpansionLevel lLevel, lCurLevel + 1, cChild, False
                  Next
             End If
        Next

    ElseIf Not cNode.ChildNodes Is Nothing Then
        For Each cChild In cNode.ChildNodes
             cChild.Expanded = (lLevel > lCurLevel)
             SetTreeExpansionLevel lLevel, lCurLevel + 1, cChild, False
        Next
    End If
End Sub


Private Sub TreeControl_KeyDown(ByVal KeyCode As MSForms.ReturnInteger, ByVal Shift As Integer)
    Dim sngVisTop As Single
clsTreeview - 32

    Dim cNode As clsNode

    ' PT toggle expand/collapse with key Enter
    If KeyCode = vbKeyReturn Then
        If ActiveNode.Expanded Then
             KeyCode = vbKeyLeft
        Else
             KeyCode = vbKeyRight
        End If
    End If

    If Not ActiveNode Is Nothing Then
        Select Case KeyCode

        Case vbKeyLeft
            If ActiveNode.Level = 0 And Not mbRootButton Then
                ' don't attempt to collapse the Root if it doesn't have a button

            ElseIf Not ActiveNode.ChildNodes Is Nothing Then
                 If ActiveNode.Expanded Then
                      ActiveNode.Expanded = False
                      BuildRoot False
                 Else
                      If Not ActiveNode.ParentNode Is Nothing Then
                          If ActiveNode.ParentNode.Expanded Then
                              'If Not ActiveNode.ParentNode.Level = 0 And mbRootButton Then
                              If ActiveNode.ParentNode.Level >= 0 Then
                                  Set ActiveNode = ActiveNode.ParentNode
                                  ScrollToView , -1
                                  NodeClick ActiveNode.Control, ActiveNode     'AVDV
                              End If
                          End If
                      End If
                 End If
            Else
                 If Not ActiveNode.ParentNode Is Nothing Then
                      If ActiveNode.ParentNode.Level = 0 And Not mbRootButton Then
                          ' don't attempt to collapse the Root if it doesn't have a button
                          ' redundant ?
                      ElseIf ActiveNode.ParentNode.Expanded Then
                          If ActiveNode.ParentNode.Caption <> "RootHolder" Then
                              Set ActiveNode = ActiveNode.ParentNode
                              ScrollToView ActiveNode, -1
                              NodeClick ActiveNode.Control, ActiveNode     'AVDV
                          End If
                      End If
                 End If
            End If

        Case vbKeyRight
            If Not ActiveNode.ChildNodes Is Nothing Then
                If ActiveNode.Expanded = False Then
                     ActiveNode.Expanded = True
                     If Not ActiveNode.Expander Is Nothing Then
                          NodeClick ActiveNode.Expander, ActiveNode 'AVDV
                          ' BuildRoot False will be called in NodeClick
                     Else
                          ' a Root node and mbRootButton = False
                          BuildRoot False
                     End If
                Else
                     Set ActiveNode = ActiveNode.ChildNodes(1)
                     NodeClick ActiveNode.Control, ActiveNode     'AVDV
                End If

            End If

        Case vbKeyUp, vbKeyDown
            If ActiveNode.VisIndex = mlVisCount And KeyCode = vbKeyDown Then
                ' if the activenode is the last node and collaped, expand it and activate the 1st childnode
                If Not ActiveNode.ChildNodes Is Nothing Then
                    If ActiveNode.Expanded = False Then
                        ActiveNode.Expanded = True
                        BuildRoot False
                    End If
                End If
            End If

            Set cNode = NextVisibleNodeInTree(ActiveNode, (KeyCode = vbKeyUp))
clsTreeview - 33

            If Not cNode Is Nothing Then
                Set ActiveNode = cNode
                ScrollToView ActiveNode, IIf(KeyCode = vbKeyUp, -1, -2) ' the -ve means will scroll won't change
if the node is visible
                NodeClick ActiveNode.Control, ActiveNode
            End If

           Case vbKeyPageUp, vbKeyPageDown
               'store the activenode's vertical position to reset a similar in the keyup
               If Not mbKeyDown Then
                   sngVisTop = (ActiveNode.VisIndex - 1) * NodeHeight - TreeControl.ScrollTop
                   If sngVisTop > 0 And sngVisTop < TreeControl.InsideHeight Then
                        msngVisTop = sngVisTop
                   Else
                        msngVisTop = 0
                   End If
               End If

           Case vbKeyEscape
               Set MoveCopyNode(False) = Nothing

           Case vbKeySpace ' PT toggle checkbox with space
               If CheckBoxes Then
                   ActiveNode.Checked = Not ActiveNode.Checked

                   RaiseEvent NodeCheck(ActiveNode)
               End If
           End Select

           mbKeyDown = True      ' PT

           RaiseEvent KeyDown(ActiveNode, KeyCode, Shift)
    Else
        If Not mcolNodes Is Nothing Then
            If mcolNodes.Count Then
                Set ActiveNode = mcolNodes(1)
            End If
        End If
    End If

End Sub

Private Sub TreeControl_KeyUp(ByVal KeyCode As MSForms.ReturnInteger, ByVal Shift As Integer)
'-------------------------------------------------------------------------
' Procedure : TreeControl_KeyUp
' Company   : JKP Application Development Services (c)
' Author    : Jan Karel Pieterse (www.jkp-ads.com)
' Created   : 17-01-2013
' Purpose   : Handles collapsing and expanding of the tree using left and right arrow keys
'             and moving up/down the tree using up/down arrow keys
'             Also handles folding of the tree when you use the numeric keys.
'-------------------------------------------------------------------------
    Dim lIdx As Long
    Dim sngNewScrollTop As Single

    If Not mbKeyDown Then     'PT
         ' PT KeyDown was initiated in some other control,
         '   eg Key Enter in the Editbox or tabbing to the treecontrol (enter event)
         Exit Sub
    Else

        mbKeyDown = False
    End If

    If Not ActiveNode Is Nothing Then

           Select Case KeyCode

           ' PT look into moving more key events into KeyDown

           Case 48 To 57, 96 To 105
               If KeyCode >= 96 Then KeyCode = KeyCode - 48
               If (KeyCode > vbKey0 Or mbRootButton) And Shift = 0 Then
                   'SetTreeExpansionLevel (KeyCode - 49)
                   ExpandToLevel (KeyCode - 48)
                   BuildRoot False
               End If

           Case vbKeyF2, 93   ' F2 & key right/context menu (?) PT
               If mbLabelEdit Then
clsTreeview - 34

                   If Not ActiveNode Is Nothing Then
                       EditMode(ActiveNode) = True
                       ActiveNode.EditBox True
                   End If
               End If
           Case vbKeyPageUp, vbKeyPageDown
               ' PT activate node in the same position as previous activenode when scrolling
               With Me.TreeControl
                   sngNewScrollTop = .ScrollTop
                   lIdx = (sngNewScrollTop + msngVisTop) / NodeHeight + 1

                   If (lIdx - 1) * NodeHeight < .ScrollTop Then
                       lIdx = lIdx + 1

                   ElseIf lIdx * NodeHeight > .InsideHeight + .ScrollTop Then
                        lIdx = lIdx - 1
                   End If
               End With

               If lIdx > 1 And lIdx <= mlVisCount Then
                   lIdx = mlVisOrder(lIdx)
                   Set ActiveNode = mcolNodes(lIdx)
               End If

           Case vbKeyHome, vbKeyEnd
               If KeyCode = vbKeyHome Then lIdx = 1 Else lIdx = mlVisCount
               lIdx = mlVisOrder(lIdx)
               If ActiveNode.Index <> lIdx Then
                   Set ActiveNode = mcolNodes(lIdx)
               End If
           Case Else

           End Select
    Else
        If Not mcolNodes Is Nothing Then
            If mcolNodes.Count Then
                Set ActiveNode = mcolNodes(1)
            End If
        End If
    End If

End Sub

Option Compare Database
Public gDisplayLanguage As String, gLabelsOK As Boolean


Public Sub changeDisplayLanguage()
    Dim tLabelLanguage(3, 16) As String, tLang As Integer

    Dim tRstLabelList As DAO.Recordset, ti As Integer

    Set tRstLabelList = CurrentDb.OpenRecordset("FormLabels", dbOpenTable)

    tRstLabelList.Index = "label"

    gLabelsOK = False
    With tRstLabelList
        .MoveFirst
        ti = 1

        Do While ti < 16 And Not .EOF
             If !c_form = "SF_STATUS" Then
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
        Me.LblSequence.Caption = tLabelLanguage(tLang, 1)
        Me.LblFirstyear.Caption = tLabelLanguage(tLang, 2)
        Me.LblFYNHYear.Caption = tLabelLanguage(tLang, 3)
        Me.LblFYRange.Caption = tLabelLanguage(tLang, 4)
        Me.LblLastyear.Caption = tLabelLanguage(tLang, 5)
        Me.LblLYNHyear.Caption = tLabelLanguage(tLang, 6)
        Me.LblLYRange.Caption = tLabelLanguage(tLang, 7)
        Me.LblPages.Caption = tLabelLanguage(tLang, 8)
        Me.LblNotes.Caption = tLabelLanguage(tLang, 9)
        Me.LblStatus.Caption = tLabelLanguage(tLang, 10)
        Me.LblFYNH.Caption = tLabelLanguage(tLang, 11)
        Me.LblLYNH.Caption = tLabelLanguage(tLang, 12)
        Me.LblSource.Caption = tLabelLanguage(tLang, 13)
        ' Me.CmdDelete.Caption = tLabelLanguage(tLang, 14)
        ' Me.CmdAddNew.Caption = tLabelLanguage(tLang, 15)
    End If

End Sub

Public Sub noEdits()

    Me.AllowAdditions = False
    Me.AllowDeletions = False
    Me.AllowEdits = False

End Sub
Form_subTreeView - 1

'Build 025

'BC Requires references to MS Forms 2.0 (C:\Windows\system32\FM20.DLL)
'ufTreeView UserForm object must be inclued in the VBA project
'modStartup module demonstrates how to create an userform programmatically
'and can be used in development to create a new ufTreeview. The modStartup
'code must be executed before trying to using subTreeview due to early-binding
'Late-binding the userform does not appear to work very well.

'You should ensure that ufTreeview userform is blank during development and ensure
'you don't save changes to the ufTreeview with controls added which may cause errors
'next it is used.

Option Compare Text
Option Explicit

Private Const GWL_EXSTYLE = (-20)
Private Const GWL_STYLE = (-16)
Private Const WS_EX_APPWINDOW As Long = &H40000
Private Const SWP_SHOWWINDOW As Long = &H40

Private Type RECT
    pxLeft As Long
    pxTop As Long
    pxRight As Long
    pxBottom As Long
End Type

#If VBA7 Then

    Private Declare PtrSafe Function SetParent Lib "user32" ( _
                                                ByVal hWndChild As LongPtr, _
                                                ByVal hWndNewParent As LongPtr) As LongPtr

    Private Declare PtrSafe Function FindWindow Lib "user32" Alias "FindWindowA" ( _
                                                ByVal lpClassName As String, _
                                                ByVal lpWindowName As String) As LongPtr

    #If Win64 Then

        Private Declare PtrSafe Function GetWindowLongPtr Lib "user32" Alias "GetWindowLongPtrA" ( _
                                                    ByVal hwnd As LongPtr, _
                                                    ByVal nIndex As Long) As LongPtr

        Private Declare PtrSafe Function SetWindowLongPtr Lib "user32" Alias "SetWindowLongPtrA" ( _
                                                    ByVal hwnd As LongPtr, _
                                                    ByVal nIndex As Long, _
                                                    ByVal dwNewLong As LongPtr) As LongPtr

    #Else

        Private Declare PtrSafe Function GetWindowLongPtr Lib "user32" Alias "GetWindowLongA" ( _
                                                    ByVal hwnd As LongPtr, _
                                                    ByVal nIndex As Long) As LongPtr

        Private Declare PtrSafe Function SetWindowLongPtr Lib "user32" Alias "SetWindowLongA" ( _
                                                    ByVal hwnd As LongPtr, _
                                                    ByVal nIndex As Long, _
                                                    ByVal dwNewLong As LongPtr) As LongPtr

    #End If

    Private Declare PtrSafe Function DrawMenuBar Lib "user32" ( _
                                                ByVal hwnd As LongPtr) As Long


    Private Declare PtrSafe Function GetWindowRect Lib "user32" ( _
                                                ByVal hwnd As LongPtr, _
                                                lpRect As RECT) As Long

    Private Declare PtrSafe Function SetWindowPos Lib "user32" ( _
                                                ByVal hwnd As LongPtr, _
                                                ByVal hWndInsertAfter As LongPtr, _
                                                ByVal X As Long, _
                                                ByVal Y As Long, _
                                                ByVal cX As Long, _
                                                ByVal cY As Long, _
                                                ByVal uFlags As Long) As Long

    Private Declare PtrSafe Function BringWindowToTop Lib "user32.dll" ( _
Form_subTreeView - 2

                                                ByVal hwnd As LongPtr) As Long

    Private mUFhWnd As LongPtr

#Else

    Private Declare Function SetParent Lib "user32" ( _
                                       ByVal hWndChild As Long, _
                                       ByVal hWndNewParent As Long) As Long

    Private Declare Function FindWindow Lib "user32" Alias "FindWindowA" ( _
                                        ByVal lpClassName As String, _
                                        ByVal lpWindowName As String) As Long

    Private Declare Function GetWindowLongPtr Lib "user32" Alias "GetWindowLongA" ( _
                                              ByVal hwnd As Long, _
                                              ByVal nIndex As Long) As Long

    Private Declare Function SetWindowLongPtr Lib "user32" Alias "SetWindowLongA" ( _
                                              ByVal hwnd As Long, _
                                              ByVal nIndex As Long, _
                                              ByVal dwNewLong As Long) As Long

    Private Declare Function DrawMenuBar Lib "user32" ( _
                                         ByVal hwnd As Long) As Long

    Private Declare Function GetWindowRect Lib "user32" ( _
                                           ByVal hwnd As Long, _
                                           lpRect As RECT) As Long

    Private Declare Function SetWindowPos Lib "user32" ( _
                                          ByVal hwnd As Long, _
                                          ByVal hWndInsertAfter As Long, _
                                          ByVal X As Long, _
                                          ByVal Y As Long, _
                                          ByVal cX As Long, _
                                          ByVal cY As Long, _
                                          ByVal uFlags As Long) As Long

    Private Declare Function BringWindowToTop Lib "user32.dll" ( _
                                              ByVal hwnd As Long) As Long

    Private mUFhWnd As Long 'Ptr                     'BC Pointer to the UserForm
#End If

Private mUF As ufTreeView
Private mcolTabControls As VBA.Collection            'BC A sorted list of controls that may be tabbed to.
Private mlMaxTabIndex As Long                        'BC Identify the maximum value a containing form may have for
 tab index

Private WithEvents moSubControl As Access.SubForm    'BC reference to the containing form's subform control.
Private WithEvents mfrTreeControl As MSForms.Frame   'BC reference to the treeview containing control
Private WithEvents mTreeview As clsTreeview          'BC reference to the treeview for easy access

Public Property Get pTreeview() As clsTreeview
' create a new treeclass and assign the TreeControl frame
    Set mTreeview = New clsTreeview
    Set mTreeview.TreeControl = mfrTreeControl
    Set pTreeview = mTreeview
    #If DebugMode = 1 Then
        If IsSubform Then
             Set mTreeview.Form = Me.Parent
        Else
             Set mTreeview.Form = Me
        End If
    #End If
End Property

Public Property Get pTreeControl() As MSForms.Frame
' return a reference to the TreeControl frame,
' useful if want to change its default font properties which node labels inherit
    Set pTreeControl = mfrTreeControl
End Property

Private Sub ApplyDefaultFont()
' Node labels will inherit font properties from the frame container
' Adapt as required -
'
'    With pTreeControl.Font
'        .Name = "Calibri"
Form_subTreeView - 3

'        .Size = 9
'    End With
'    pTreeControl.ForeColor = 13995605   ' blue
'
End Sub

Private Function IsSubform() As Boolean
    On Error Resume Next
    IsSubform = (Not Me.Parent Is Nothing)
End Function

Private Sub Form_Close()
    If Not mTreeview Is Nothing Then
        mTreeview.TerminateTree
    End If
    Set mTreeview = Nothing
    Unload mUF
    Set mUF = Nothing
End Sub

Private Sub Form_Load()

#If Win64 Then
    Dim lStyle As LongPtr
    Dim res As LongPtr
#Else
    Dim lStyle As Long
    Dim res As Long
#End If

    Dim ctl As Access.Control
    Dim lngIndex As Long

    Set mUF = New ufTreeView

    'Determine if the form is loaded as a subform and if so,
    'find the containing subform control
    If IsSubform Then
        With Me.Parent
            For Each ctl In .Controls
                 If ctl.ControlType = acSubform Then
                     If ctl.Form Is Me Then
                         Set moSubControl = ctl
                         Exit For
                     End If
                 End If
            Next
        End With

        'When subform control has been found, enable it to raise events so that
        'the subTreeView can react to the Enter/Exit event of the subform control
        'Then, gather all controls within same section of the form where the subform
        'control resides and put them in a VBA collection using TabIndex as key,
        'so we have a sorted list of controls to tab through.
        If Not moSubControl Is Nothing Then
            moSubControl.OnEnter = "[Event Procedure]"
            moSubControl.OnExit = "[Event Procedure]"
            Set mcolTabControls = New VBA.Collection
            On Error Resume Next
            For Each ctl In moSubControl.Parent.Section(moSubControl.Section).Controls
                 lngIndex = ctl.TabIndex
                 If Err.Number = 0 Then
                      If ctl.TabIndex > mlMaxTabIndex Then
                          mlMaxTabIndex = ctl.TabIndex
                      End If
                      mcolTabControls.Add ctl.Name, CStr(ctl.TabIndex)
                 Else
                      Err.Clear
                 End If
            Next
            On Error GoTo 0
        End If
    End If

    ' load the userform
    Set mUF = New ufTreeView

    'For developer's convenience, the subTreeView's backcolor
    'can be set in design view to easily change the color of UF
    mUF.BackColor = Me.Section(acDetail).BackColor
Form_subTreeView - 4


    'Add a frame as the treeview's container
    '(the frame must be added to the userform at runtime, do not add any controls at design and save with the use
rform)
    Set mfrTreeControl = mUF.Controls.Add("Forms.Frame.1", "frTreeControl", True)

    ApplyDefaultFont ' apply any font properties to the frame for the treeview to inherit

    'Assign Form's hWnd to mUF's caption, to ensure we don't find the wrong mUF
    'and search for the UF's handle.
    mUF.Caption = mUF.Caption & Me.hwnd
    mUFhWnd = FindWindow("ThunderDFrame", mUF.Caption)

    ' make subTreeView the userform's parent window
    res = SetParent(mUFhWnd, Me.hwnd)

    ' remove the userform's border and caption
    lStyle = GetWindowLongPtr(mUFhWnd, GWL_STYLE)
    lStyle = lStyle And Not &HC00000
    SetWindowLongPtr mUFhWnd, GWL_STYLE, lStyle
    SetWindowLongPtr mUFhWnd, GWL_EXSTYLE, WS_EX_APPWINDOW
    DrawMenuBar mUFhWnd

    ResizeUF
End Sub

Private Sub Form_Resize()
    ResizeUF
End Sub

Private Sub ResizeUF()
    Dim r As RECT

    'Ensure that the treeview will take up all space that
    'the subform control occupies. APIs are used so that
    'anchoring can be used on the subform container, which
    'allows for dynamic sizing of the treeview.
    If Not mfrTreeControl Is Nothing Then
        Me.Painting = False
        GetWindowRect Me.hwnd, r
        SetWindowPos mUFhWnd, &H0, 0, 0, r.pxRight - r.pxLeft, r.pxBottom - r.pxTop, SWP_SHOWWINDOW
        mfrTreeControl.Height = mUF.InsideHeight
        mfrTreeControl.Width = mUF.InsideWidth
        Me.Painting = True
    End If
End Sub

Private Sub mfrTreeControl_KeyDown(ByVal KeyCode As MSForms.ReturnInteger, ByVal Shift As Integer)
    Dim lngCurrentIndex As Long
    Dim lngStep As Long
    Dim ctl As Access.Control

    If KeyCode = vbKeyTab Then
        If IsSubform Then
            'Tab key was pressed so we need to find the
            'next control on the subform control's section
            'to set focus.
            lngCurrentIndex = moSubControl.TabIndex
            'If Shift was held down, we want to go backward
            If Shift Then
                 lngStep = -1
            Else
                 lngStep = 1
            End If
            Do
                 lngCurrentIndex = lngCurrentIndex + lngStep
                 Select Case True
                     Case lngCurrentIndex < 0
                         lngCurrentIndex = mlMaxTabIndex
                     Case lngCurrentIndex > mlMaxTabIndex
                         lngCurrentIndex = 0
                 End Select
                 Set ctl = moSubControl.Parent.Controls(mcolTabControls(CStr(lngCurrentIndex)))
                 Select Case True
                     Case ctl.Enabled = False, ctl.Visible = False, ctl.TabStop = False
                         'Not eligible to receive focus, skip
                     Case Else
                         moSubControl.Parent.SetFocus
                         ctl.SetFocus
                         Exit Do
Form_subTreeView - 5

                End Select
            Loop Until lngCurrentIndex = moSubControl.TabIndex
        End If
    End If
End Sub

Private Sub moSubControl_Enter()
    'When the subform control gains focus, the focus
    'should be passed to the userform
    If Not mTreeview Is Nothing Then
        mTreeview.EnterExit False
        'mfrTreeControl.SetFocus
        BringWindowToTop mUFhWnd
    End If
End Sub

Private Sub moSubControl_Exit(Cancel As Integer)
    If Not mTreeview Is Nothing Then
        mTreeview.EnterExit bExit:=True
    End If
End Sub

Private Sub mTreeView_Click(cNode As clsNode)
    'We want to ensure that in case where user click
    'on the treeview directly, the containing form know
    'that the focus is now on the subform container
    moSubControl.SetFocus
End Sub

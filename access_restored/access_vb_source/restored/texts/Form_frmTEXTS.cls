Option Compare Database

Private Sub c_title_LostFocus()
    Dim intLastTextID As Long
    Dim intTextID As Long

    If IsNull(c_textid.Value) And Not IsNull(c_title) Then
        intLastTextID = DMax("c_textid", "TEXT_CODES")
        TxtLastTextID.Value = intLastTextID

        TxtLastTextID.Visible = True
        TxtLastTextID.SetFocus
        intTextID = TxtLastTextID.Value
        c_textid.Value = intTextID + 1

        c_textid.SetFocus
        TxtLastTextID.Visible = False
    End If
End Sub

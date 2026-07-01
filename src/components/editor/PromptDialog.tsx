import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material'

interface Props {
  open: boolean
  title: string
  label: string
  placeholder?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

const PromptDialog: React.FC<Props> = ({ open, title, label, placeholder, onConfirm, onCancel }) => {
  const [value, setValue] = useState('')

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim())
      setValue('')
    }
  }

  const handleCancel = () => {
    setValue('')
    onCancel()
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontSize: '1rem', pb: 1 }}>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label={label}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm() }}
          sx={{ mt: 0.5 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 1.5 }}>
        <Button onClick={handleCancel} color="inherit">取消</Button>
        <Button onClick={handleConfirm} variant="contained" disabled={!value.trim()}>确定</Button>
      </DialogActions>
    </Dialog>
  )
}

export default PromptDialog

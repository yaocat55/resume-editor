/**
 * FullPolishDialog — AI 全文润色结果对比弹窗
 *
 * 接收 AI 返回的 diff（修改前/修改后），逐条展示，用户确认后批量应用。
 * 浅色/深色模式自适应（左侧色条指示差异类型）。
 */
import React from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Box, Chip, Stack, Divider, Alert, CircularProgress,
  useTheme,
} from '@mui/material'

interface DiffEntry {
  section: string
  field: string
  before: string
  after: string
}

interface Props {
  open: boolean
  diffs: DiffEntry[]
  loading: boolean
  error: string
  onApply: () => void
  onClose: () => void
}

const DiffBox: React.FC<{ label: string; content: string; color: string; side: 'before' | 'after' }> = ({ label, content, color, side }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  return (
    <Box sx={{
      flex: 1,
      p: 1.5,
      bgcolor: isDark ? 'rgba(0,0,0,0.3)' : '#fafafa',
      borderLeft: '4px solid',
      borderColor: color,
      borderRadius: 1,
      fontSize: '0.8rem',
      lineHeight: 1.7,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      color: 'text.primary',
    }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color, display: 'block', mb: 0.5, fontSize: '0.7rem', letterSpacing: 0.5 }}>
        {label}
      </Typography>
      {content || <Typography variant="caption" color="text.disabled">(空)</Typography>}
    </Box>
  )
}

const FullPolishDialog: React.FC<Props> = ({ open, diffs, loading, error, onApply, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        🤖 AI 全文润色报告
        {!loading && diffs.length > 0 && (
          <Chip label={`${diffs.length} 处修改`} size="small" color="primary" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
        )}
      </DialogTitle>
      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary">AI 正在通读全文并优化…</Typography>
          </Box>
        )}
        {error && <Alert severity="error" sx={{ fontSize: '0.85rem' }}>{error}</Alert>}
        {!loading && !error && diffs.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            AI 未发现需要优化的文本内容
          </Typography>
        )}
        {!loading && diffs.map((d, i) => (
          <Box key={i} sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75, fontSize: '0.7rem' }}>
              {d.section} → {d.field}
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <DiffBox label="修改前" content={d.before} color="#d32f2f" side="before" />
              <DiffBox label="修改后" content={d.after} color="#2e7d32" side="after" />
            </Stack>
            {i < diffs.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>取消</Button>
        <Button onClick={onApply} variant="contained" disabled={loading || diffs.length === 0 || !!error}>
          应用全部修改
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default FullPolishDialog

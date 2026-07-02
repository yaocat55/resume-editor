import React, { useState } from 'react'
import { Box, TextField, Typography, Card, CardContent, Button, Snackbar, Alert, Tooltip } from '@mui/material'
import { AutoAwesome as AiIcon } from '@mui/icons-material'
import useResumeStore from '../../store/resumeStore'
import useAIStore from '../../store/aiStore'
import { optimizeProfile } from '../../utils/aiService'
import FieldTip from '../FieldTip'

const ProfileEditor: React.FC = () => {
  const profile = useResumeStore((s) => s.resume.profile)
  const updateProfile = useResumeStore((s) => s.updateProfile)
  const aiConfig = useAIStore((s) => s.config)
  const isConfigured = useAIStore((s) => s.isConfigured)

  const [aiLoading, setAiLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  })

  const handleAiOptimize = async () => {
    if (!isConfigured()) {
      setSnackbar({ open: true, message: '请先在侧边栏 🤖 中配置 AI 接口和密钥', severity: 'error' })
      return
    }
    if (!profile.trim()) {
      setSnackbar({ open: true, message: '请先填写个人简介内容', severity: 'error' })
      return
    }
    setAiLoading(true)
    try {
      const result = await optimizeProfile(aiConfig, profile)
      updateProfile(result)
      setSnackbar({ open: true, message: 'AI 润色完成 ✅', severity: 'success' })
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'AI 调用失败', severity: 'error' })
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          个人简介
        </Typography>
        <Tooltip title="AI 润色个人简介">
          <Button
            size="small"
            variant="outlined"
            startIcon={<AiIcon />}
            onClick={handleAiOptimize}
            disabled={aiLoading}
            sx={{ fontSize: '0.75rem' }}
          >
            {aiLoading ? '润色中…' : 'AI 润色'}
          </Button>
        </Tooltip>
      </Box>
      <Card variant="outlined">
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                个人简介
                <FieldTip tip="建议 50-100 字，提炼 1-3 个核心优势" />
              </Box>
            }
            value={profile}
            onChange={(e) => updateProfile(e.target.value)}
            placeholder="4 年前端开发经验，精通 React 生态，注重代码质量与工程效率。"
            multiline
            minRows={3}
            maxRows={6}
            fullWidth
          />
        </CardContent>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ fontSize: '0.85rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ProfileEditor

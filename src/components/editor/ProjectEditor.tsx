/**
 * ProjectEditor — 项目经验编辑
 *
 * 每条项目：名称、角色、时间、描述、技术栈、亮点、链接。
 * 集成 AI 润色（描述 + 亮点）。
 */
import React, { useState } from 'react'
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Stack,
  Chip,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material'
import { Add as AddIcon, Close as CloseIcon, AutoAwesome as AiIcon } from '@mui/icons-material'
import useResumeStore from '../../store/resumeStore'
import useAIStore from '../../features/ai/store'
import { optimizeProjectDescription, optimizeProjectHighlights } from '../../features/ai/service'
import PromptDialog from './PromptDialog'
import MonthPicker from './MonthPicker'

const ProjectEditor: React.FC = () => {
  const projects = useResumeStore((s) => s.resume.projects)
  const addProject = useResumeStore((s) => s.addProject)
  const updateProject = useResumeStore((s) => s.updateProject)
  const removeProject = useResumeStore((s) => s.removeProject)
  const resume = useResumeStore((s) => s.resume)
  const aiConfig = useAIStore((s) => s.config)
  const isConfigured = useAIStore((s) => s.isConfigured)

  const [techDialog, setTechDialog] = useState<{ open: boolean; projId: string }>({ open: false, projId: '' })
  const [hlDialog, setHlDialog] = useState<{ open: boolean; projId: string }>({ open: false, projId: '' })
  const [aiLoadingDesc, setAiLoadingDesc] = useState<string | null>(null)
  const [aiLoadingHl, setAiLoadingHl] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  })

  const showMsg = (message: string, severity: 'success' | 'error') =>
    setSnackbar({ open: true, message, severity })

  const checkConfig = () => {
    if (!isConfigured()) {
      showMsg('请先在侧边栏 🤖 中配置 AI 接口和密钥', 'error')
      return false
    }
    return true
  }

  const handleAiDescription = async (p: typeof projects[0]) => {
    if (!checkConfig()) return
    if (!p.description.trim()) { showMsg('请先填写项目描述', 'error'); return }
    setAiLoadingDesc(p.id)
    try {
      const result = await optimizeProjectDescription(aiConfig, resume, p.id)
      updateProject(p.id, { description: result })
      showMsg('AI 润色完成 ✅', 'success')
    } catch (e: any) {
      showMsg(e.message || 'AI 调用失败', 'error')
    } finally {
      setAiLoadingDesc(null)
    }
  }

  const handleAiHighlights = async (p: typeof projects[0]) => {
    if (!checkConfig()) return
    const items = p.highlights || []
    if (items.length === 0) { showMsg('请先添加亮点/成果', 'error'); return }
    setAiLoadingHl(p.id)
    try {
      const result = await optimizeProjectHighlights(aiConfig, resume, p.id)
      updateProject(p.id, { highlights: result })
      showMsg('AI 润色完成 ✅', 'success')
    } catch (e: any) {
      showMsg(e.message || 'AI 调用失败', 'error')
    } finally {
      setAiLoadingHl(null)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          项目经验
        </Typography>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={addProject}>
          添加
        </Button>
      </Box>

      <Stack spacing={2}>
        {projects.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            暂无项目经验，点击"添加"按钮新增
          </Typography>
        )}
        {projects.map((p) => (
          <Card key={p.id} variant="outlined">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1 }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
                {p.name || `项目经验 #${projects.indexOf(p) + 1}`}
              </Typography>
              <IconButton size="small" onClick={() => removeProject(p.id)} sx={{ color: 'text.disabled' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, pt: 0.5 }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="项目名称 *"
                    value={p.name}
                    onChange={(e) => updateProject(p.id, { name: e.target.value })}
                    placeholder="AI 辅助代码审查工具"
                    required
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="角色 *"
                    value={p.role}
                    onChange={(e) => updateProject(p.id, { role: e.target.value })}
                    placeholder="核心开发者"
                    required
                    sx={{ flex: 1 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <MonthPicker
                    label="开始时间"
                    value={p.startDate || ''}
                    onChange={(v) => updateProject(p.id, { startDate: v })}
                  />
                  <MonthPicker
                    label="结束时间"
                    value={p.endDate || ''}
                    onChange={(v) => updateProject(p.id, { endDate: v })}
                  />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      项目描述 *
                    </Typography>
                    <Tooltip title="AI 优化项目描述">
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<AiIcon sx={{ fontSize: 14 }} />}
                        onClick={() => handleAiDescription(p)}
                        disabled={aiLoadingDesc === p.id}
                        sx={{ fontSize: '0.7rem', minWidth: 0, p: '2px 6px' }}
                      >
                        {aiLoadingDesc === p.id ? '…' : 'AI 润色'}
                      </Button>
                    </Tooltip>
                  </Box>
                  <TextField
                    value={p.description}
                    onChange={(e) => updateProject(p.id, { description: e.target.value })}
                    placeholder="基于大模型 API 开发的 PR 代码审查辅助工具..."
                    multiline
                    minRows={2}
                    maxRows={4}
                    fullWidth
                    required
                  />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    技术栈
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {(p.technologies || []).map((tech, idx) => (
                      <Chip
                        key={idx}
                        label={tech}
                        size="small"
                        onDelete={() => {
                          const updated = (p.technologies || []).filter((_, i) => i !== idx)
                          updateProject(p.id, { technologies: updated })
                        }}
                      />
                    ))}
                    <Chip
                      label="+ 添加技术"
                      size="small"
                      variant="outlined"
                      onClick={() => setTechDialog({ open: true, projId: p.id })}
                    />
                  </Box>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      亮点/成果
                    </Typography>
                    {(p.highlights || []).length > 0 && (
                      <Tooltip title="AI 优化亮点/成果">
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<AiIcon sx={{ fontSize: 14 }} />}
                          onClick={() => handleAiHighlights(p)}
                          disabled={aiLoadingHl === p.id}
                          sx={{ fontSize: '0.7rem', minWidth: 0, p: '2px 6px' }}
                        >
                          {aiLoadingHl === p.id ? '…' : 'AI 润色'}
                        </Button>
                      </Tooltip>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {(p.highlights || []).map((hl, idx) => (
                      <Chip
                        key={idx}
                        label={hl}
                        size="small"
                        onDelete={() => {
                          const updated = (p.highlights || []).filter((_, i) => i !== idx)
                          updateProject(p.id, { highlights: updated })
                        }}
                      />
                    ))}
                    <Chip
                      label="+ 添加亮点"
                      size="small"
                      variant="outlined"
                      onClick={() => setHlDialog({ open: true, projId: p.id })}
                    />
                  </Box>
                </Box>
                <TextField
                  label="GitHub 链接"
                  value={p.githubUrl || ''}
                  onChange={(e) => updateProject(p.id, { githubUrl: e.target.value })}
                  placeholder="https://github.com/mingdev/ai-code-review"
                />
                <TextField
                  label="演示链接"
                  value={p.demoUrl || ''}
                  onChange={(e) => updateProject(p.id, { demoUrl: e.target.value })}
                  placeholder="https://ai-review.demo.com"
                />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
      <PromptDialog
        open={techDialog.open}
        title="添加技术"
        label="技术名称"
        placeholder="React"
        onConfirm={(val) => {
          const p = projects.find((x) => x.id === techDialog.projId)
          if (p) updateProject(p.id, { technologies: [...(p.technologies || []), val] })
          setTechDialog({ open: false, projId: '' })
        }}
        onCancel={() => setTechDialog({ open: false, projId: '' })}
      />
      <PromptDialog
        open={hlDialog.open}
        title="添加亮点/成果"
        label="亮点描述"
        placeholder="集成 GitHub App，自动监听 PR 事件并触发审查"
        onConfirm={(val) => {
          const p = projects.find((x) => x.id === hlDialog.projId)
          if (p) updateProject(p.id, { highlights: [...(p.highlights || []), val] })
          setHlDialog({ open: false, projId: '' })
        }}
        onCancel={() => setHlDialog({ open: false, projId: '' })}
      />
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

export default ProjectEditor
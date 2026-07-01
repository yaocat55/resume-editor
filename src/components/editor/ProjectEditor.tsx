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
} from '@mui/material'
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material'
import useResumeStore from '../../store/resumeStore'
import PromptDialog from './PromptDialog'
import MonthPicker from './MonthPicker'

const ProjectEditor: React.FC = () => {
  const projects = useResumeStore((s) => s.resume.projects)
  const addProject = useResumeStore((s) => s.addProject)
  const updateProject = useResumeStore((s) => s.updateProject)
  const removeProject = useResumeStore((s) => s.removeProject)

  const [techDialog, setTechDialog] = useState<{ open: boolean; projId: string }>({ open: false, projId: '' })
  const [hlDialog, setHlDialog] = useState<{ open: boolean; projId: string }>({ open: false, projId: '' })

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
                <TextField
                  label="项目描述 *"
                  value={p.description}
                  onChange={(e) => updateProject(p.id, { description: e.target.value })}
                  placeholder="基于大模型 API 开发的 PR 代码审查辅助工具..."
                  multiline
                  minRows={2}
                  maxRows={4}
                  required
                />
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
                  <Typography variant="caption" color="text.secondary">
                    亮点/成果
                  </Typography>
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
    </Box>
  )
}

export default ProjectEditor

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

const WorkEditor: React.FC = () => {
  const work = useResumeStore((s) => s.resume.work)
  const addWork = useResumeStore((s) => s.addWork)
  const updateWork = useResumeStore((s) => s.updateWork)
  const removeWork = useResumeStore((s) => s.removeWork)
  const [achDialog, setAchDialog] = useState<{ open: boolean; workId: string }>({ open: false, workId: '' })

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          工作经历
        </Typography>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={addWork}>
          添加
        </Button>
      </Box>

      <Stack spacing={2}>
        {work.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            暂无工作经历，点击"添加"按钮新增
          </Typography>
        )}
        {work.map((w) => (
          <Card key={w.id} variant="outlined">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1 }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
                {w.company || `工作经历 #${work.indexOf(w) + 1}`}
              </Typography>
              <IconButton size="small" onClick={() => removeWork(w.id)} sx={{ color: 'text.disabled' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, pt: 0.5 }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    label="公司名称 *"
                    value={w.company}
                    onChange={(e) => updateWork(w.id, { company: e.target.value })}
                    placeholder="字节跳动"
                    required
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="职位 *"
                    value={w.position}
                    onChange={(e) => updateWork(w.id, { position: e.target.value })}
                    placeholder="高级前端开发工程师"
                    required
                    sx={{ flex: 1 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <MonthPicker
                    label="开始时间 *"
                    value={w.startDate}
                    onChange={(v) => updateWork(w.id, { startDate: v })}
                    required
                  />
                  <MonthPicker
                    label="结束时间 *"
                    value={w.endDate}
                    onChange={(v) => updateWork(w.id, { endDate: v })}
                    required
                  />
                </Box>
                <TextField
                  label="工作描述 *"
                  value={w.description}
                  onChange={(e) => updateWork(w.id, { description: e.target.value })}
                  placeholder="负责抖音电商后台管理系统的前端架构设计与团队协作..."
                  multiline
                  minRows={2}
                  maxRows={4}
                  required
                />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    量化成果（强烈建议填写）
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {(w.achievements || []).map((ach, idx) => (
                      <Chip
                        key={idx}
                        label={ach}
                        size="small"
                        onDelete={() => {
                          const updated = (w.achievements || []).filter((_, i) => i !== idx)
                          updateWork(w.id, { achievements: updated })
                        }}
                      />
                    ))}
                    <Chip
                      label="+ 添加成果"
                      size="small"
                      variant="outlined"
                      onClick={() => setAchDialog({ open: true, workId: w.id })}
                    />
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
      <PromptDialog
        open={achDialog.open}
        title="添加量化成果"
        label="成果描述"
        placeholder="主导微前端架构改造，模块加载时间从 3.2s 优化至 0.8s"
        onConfirm={(val) => {
          const w = work.find((x) => x.id === achDialog.workId)
          if (w) updateWork(w.id, { achievements: [...(w.achievements || []), val] })
          setAchDialog({ open: false, workId: '' })
        }}
        onCancel={() => setAchDialog({ open: false, workId: '' })}
      />
    </Box>
  )
}

export default WorkEditor

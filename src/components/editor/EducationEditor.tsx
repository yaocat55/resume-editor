/**
 * EducationEditor — 教育经历编辑
 *
 * 学校、专业、学历、时间、GPA、荣誉奖项（chip 列表）。
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
  MenuItem,
  Chip,
} from '@mui/material'
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material'
import useResumeStore from '../../store/resumeStore'
import PromptDialog from './PromptDialog'
import MonthPicker from './MonthPicker'
import FieldTip from '../shared/FieldTip'

const degrees = ['本科', '硕士', '博士', '专科'] as const

const EducationEditor: React.FC = () => {
  const education = useResumeStore((s) => s.resume.education)
  const addEducation = useResumeStore((s) => s.addEducation)
  const updateEducation = useResumeStore((s) => s.updateEducation)
  const removeEducation = useResumeStore((s) => s.removeEducation)
  const [honorDialog, setHonorDialog] = useState<{ open: boolean; eduId: string }>({ open: false, eduId: '' })

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          教育经历
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={addEducation}
        >
          添加
        </Button>
      </Box>

      <Stack spacing={2}>
        {education.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            暂无教育经历，点击"添加"按钮新增
          </Typography>
        )}
        {education.map((edu) => (
          <Card key={edu.id} variant="outlined">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1 }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
                教育经历 #{education.indexOf(edu) + 1}
              </Typography>
              <IconButton size="small" onClick={() => removeEducation(edu.id)} sx={{ color: 'text.disabled' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, pt: 0.5 }}>
              <Stack spacing={1.5}>
                <TextField
                  label="学校名称 *"
                  value={edu.school}
                  onChange={(e) => updateEducation(edu.id, { school: e.target.value })}
                  placeholder="华中科技大学"
                  required
                />
                <TextField
                  label="专业名称 *"
                  value={edu.major}
                  onChange={(e) => updateEducation(edu.id, { major: e.target.value })}
                  placeholder="计算机科学与技术"
                  required
                />
                <TextField
                  label="学历 *"
                  select
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, { degree: e.target.value as any })}
                  required
                >
                  {degrees.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </TextField>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <MonthPicker
                    label="开始时间 *"
                    value={edu.startDate}
                    onChange={(v) => updateEducation(edu.id, { startDate: v })}
                    required
                  />
                  <MonthPicker
                    label="结束时间 *"
                    value={edu.endDate}
                    onChange={(v) => updateEducation(edu.id, { endDate: v })}
                    required
                  />
                </Box>
                <TextField
                  label={
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                      GPA
                      <FieldTip tip="3.5/4.0 以上建议填写" />
                    </Box>
                  }
                  value={edu.gpa || ''}
                  onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                  placeholder="3.8/4.0"
                />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    荣誉奖项
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {(edu.honors || []).map((honor, idx) => (
                      <Chip
                        key={idx}
                        label={honor}
                        size="small"
                        onDelete={() => {
                          const updated = (edu.honors || []).filter((_, i) => i !== idx)
                          updateEducation(edu.id, { honors: updated })
                        }}
                      />
                    ))}
                    <Chip
                      label="+ 添加荣誉"
                      size="small"
                      variant="outlined"
                      onClick={() => setHonorDialog({ open: true, eduId: edu.id })}
                    />
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
      <PromptDialog
        open={honorDialog.open}
        title="添加荣誉奖项"
        label="荣誉名称"
        placeholder="校级优秀毕业生（前5%）"
        onConfirm={(val) => {
          const edu = education.find((x) => x.id === honorDialog.eduId)
          if (edu) updateEducation(edu.id, { honors: [...(edu.honors || []), val] })
          setHonorDialog({ open: false, eduId: '' })
        }}
        onCancel={() => setHonorDialog({ open: false, eduId: '' })}
      />
    </Box>
  )
}

export default EducationEditor

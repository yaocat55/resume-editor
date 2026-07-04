/**
 * SkillsEditor — 专业技能编辑
 *
 * 技能分组（分组名 + 标签列表），支持添加/删除标签。
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
} from '@mui/material'
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material'
import useResumeStore from '../../store/resumeStore'

const SkillsEditor: React.FC = () => {
  const groups = useResumeStore((s) => s.resume.skills.groups)
  const addSkillGroup = useResumeStore((s) => s.addSkillGroup)
  const updateSkillGroup = useResumeStore((s) => s.updateSkillGroup)
  const removeSkillGroup = useResumeStore((s) => s.removeSkillGroup)
  const addSkillTag = useResumeStore((s) => s.addSkillTag)
  const removeSkillTag = useResumeStore((s) => s.removeSkillTag)

  const [newTagInput, setNewTagInput] = useState<Record<number, string>>({})

  const handleAddTag = (groupIndex: number) => {
    const tag = newTagInput[groupIndex]?.trim()
    if (tag) {
      addSkillTag(groupIndex, tag)
      setNewTagInput((prev) => ({ ...prev, [groupIndex]: '' }))
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          专业技能
        </Typography>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={addSkillGroup}>
          添加分组
        </Button>
      </Box>

      <Stack spacing={2}>
        {groups.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            暂无技能分组，点击"添加分组"按钮新增
          </Typography>
        )}
        {groups.map((group, index) => (
          <Card key={index} variant="outlined">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1 }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>
                {group.name || `技能分组 #${index + 1}`}
              </Typography>
              <IconButton size="small" onClick={() => removeSkillGroup(index)} sx={{ color: 'text.disabled' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, pt: 0.5 }}>
              <Stack spacing={1.5}>
                <TextField
                  label="分组名称 *"
                  value={group.name}
                  onChange={(e) => updateSkillGroup(index, { name: e.target.value })}
                  placeholder="前端"
                  required
                />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    技能标签 *（至少 1 个）
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5, mb: 1 }}>
                    {group.items.map((item, idx) => (
                      <Chip
                        key={idx}
                        label={item}
                        size="small"
                        onDelete={() => removeSkillTag(index, idx)}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <TextField
                      size="small"
                      placeholder="输入技能后按 Enter"
                      value={newTagInput[index] || ''}
                      onChange={(e) =>
                        setNewTagInput((prev) => ({ ...prev, [index]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag(index)
                        }
                      }}
                      sx={{ flex: 1 }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleAddTag(index)}
                    >
                      添加
                    </Button>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}

export default SkillsEditor

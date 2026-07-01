import React from 'react'
import { Box, TextField, Typography, Card, CardContent } from '@mui/material'
import useResumeStore from '../../store/resumeStore'

const ProfileEditor: React.FC = () => {
  const profile = useResumeStore((s) => s.resume.profile)
  const updateProfile = useResumeStore((s) => s.updateProfile)

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        个人简介
      </Typography>
      <Card variant="outlined">
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            label="个人简介"
            value={profile}
            onChange={(e) => updateProfile(e.target.value)}
            placeholder="4 年前端开发经验，精通 React 生态，注重代码质量与工程效率。"
            multiline
            minRows={3}
            maxRows={6}
            helperText="建议 50-100 字，提炼 1-3 个核心优势"
          />
        </CardContent>
      </Card>
    </Box>
  )
}

export default ProfileEditor

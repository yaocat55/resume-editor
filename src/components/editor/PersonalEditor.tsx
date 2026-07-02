import React from 'react'
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
} from '@mui/material'
import useResumeStore from '../../store/resumeStore'
import FieldTip from '../FieldTip'

const PersonalEditor: React.FC = () => {
  const personal = useResumeStore((s) => s.resume.personal)
  const updatePersonal = useResumeStore((s) => s.updatePersonal)

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        个人信息
      </Typography>
      <Card variant="outlined">
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                姓名 *
              </Box>
            }
            value={personal.fullName}
            onChange={(e) => updatePersonal({ fullName: e.target.value })}
            placeholder="张明"
            required
          />
          <TextField
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                求职意向
                <FieldTip tip="强烈建议填写，HR 第一眼判断匹配度" />
              </Box>
            }
            value={personal.jobTitle}
            onChange={(e) => updatePersonal({ jobTitle: e.target.value })}
            placeholder="前端开发工程师"
          />
          <TextField
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                手机号 *
              </Box>
            }
            value={personal.phone}
            onChange={(e) => updatePersonal({ phone: e.target.value })}
            placeholder="138-0000-8888"
            required
          />
          <TextField
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                邮箱 *
              </Box>
            }
            value={personal.email}
            onChange={(e) => updatePersonal({ email: e.target.value })}
            placeholder="ming.zhang@email.com"
            required
          />
          <TextField
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                所在城市
                <FieldTip tip="异地求职建议填写" />
              </Box>
            }
            value={personal.location}
            onChange={(e) => updatePersonal({ location: e.target.value })}
            placeholder="深圳"
          />
          <TextField
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                个人网站
              </Box>
            }
            value={personal.website}
            onChange={(e) => updatePersonal({ website: e.target.value })}
            placeholder="https://ming.dev"
          />
          <TextField
            label={
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                GitHub
                <FieldTip tip="计算机岗强烈建议填写" />
              </Box>
            }
            value={personal.github}
            onChange={(e) => updatePersonal({ github: e.target.value })}
            placeholder="https://github.com/mingdev"
          />
        </CardContent>
      </Card>
    </Box>
  )
}

export default PersonalEditor

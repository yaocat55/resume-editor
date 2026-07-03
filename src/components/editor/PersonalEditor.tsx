import React, { useRef } from 'react'
import {
  Box,
  TextField,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Close as CloseIcon, PhotoCamera as CameraIcon } from '@mui/icons-material'
import useResumeStore from '../../store/resumeStore'
import FieldTip from '../shared/FieldTip'

const PersonalEditor: React.FC = () => {
  const personal = useResumeStore((s) => s.resume.personal)
  const updatePersonal = useResumeStore((s) => s.updatePersonal)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      updatePersonal({ avatar: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    updatePersonal({ avatar: '' })
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        个人信息
      </Typography>
      <Card variant="outlined">
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, '&:last-child': { pb: 2 } }}>
          {/* 头像 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={personal.avatar || undefined}
                sx={{
                  width: 72,
                  height: 72,
                  cursor: 'pointer',
                  border: '2px dashed',
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                  '&:hover': { borderColor: 'primary.main', opacity: 0.8 },
                  transition: 'all 0.15s',
                }}
                onClick={() => fileRef.current?.click()}
              >
                <CameraIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
              </Avatar>
              {personal.avatar && (
                <Tooltip title="移除头像">
                  <IconButton
                    size="small"
                    onClick={handleRemove}
                    sx={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      width: 22,
                      height: 22,
                      '&:hover': { bgcolor: 'error.light' },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                头像
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                点击上传，推荐 1:1 正方形图片
              </Typography>
            </Box>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFile}
            />
          </Box>

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

export default React.memo(PersonalEditor)

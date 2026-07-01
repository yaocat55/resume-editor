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
import { Add as AddIcon, Close as CloseIcon, Translate as LangIcon } from '@mui/icons-material'
import useResumeStore from '../../store/resumeStore'

const CertificatesEditor: React.FC = () => {
  const certificates = useResumeStore((s) => s.resume.certificates)
  const addCertificate = useResumeStore((s) => s.addCertificate)
  const removeCertificate = useResumeStore((s) => s.removeCertificate)
  const updateCertificate = useResumeStore((s) => s.updateCertificate)
  const addLanguage = useResumeStore((s) => s.addLanguage)
  const updateLanguage = useResumeStore((s) => s.updateLanguage)
  const removeLanguage = useResumeStore((s) => s.removeLanguage)

  const [newCert, setNewCert] = useState('')

  const handleAddCert = () => {
    if (newCert.trim()) {
      addCertificate(newCert.trim())
      setNewCert('')
    }
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
        证书 & 语言
      </Typography>

      {/* Certificates */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            📜 证书
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {certificates.list.map((cert, idx) => (
              <Chip
                key={idx}
                label={
                  <TextField
                    variant="standard"
                    value={cert}
                    onChange={(e) => updateCertificate(idx, e.target.value)}
                    sx={{ width: `${Math.max(cert.length * 8 + 20, 60)}px`, '& .MuiInput-root:before': { borderBottom: 'none' } }}
                  />
                }
                size="small"
                onDelete={() => removeCertificate(idx)}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <TextField
              size="small"
              placeholder="输入证书名称"
              value={newCert}
              onChange={(e) => setNewCert(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCert()
                }
              }}
              sx={{ flex: 1 }}
            />
            <Button variant="outlined" size="small" onClick={handleAddCert}>
              添加
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card variant="outlined">
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LangIcon fontSize="small" /> 语言
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={addLanguage}>
              添加
            </Button>
          </Box>
          <Stack spacing={1.5}>
            {(certificates.languages || []).length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
                暂无语言信息
              </Typography>
            )}
            {(certificates.languages || []).map((lang, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'center',
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <TextField
                  label="语言 *"
                  value={lang.name}
                  onChange={(e) => updateLanguage(idx, { name: e.target.value })}
                  placeholder="中文"
                  size="small"
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="等级 *"
                  value={lang.level}
                  onChange={(e) => updateLanguage(idx, { level: e.target.value })}
                  placeholder="母语"
                  size="small"
                  sx={{ flex: 1 }}
                />
                <IconButton size="small"  onClick={() => removeLanguage(idx)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default CertificatesEditor

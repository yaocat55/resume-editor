import React, { useRef, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Chip,
  Alert,
  Grid,
  Tooltip,
} from '@mui/material'
import {
  Upload as UploadIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import useTemplateStore, { type TemplateValidationResult } from '../../store/templateStore'

// ── Template accent colors & metadata ──
const TEMPLATE_ACCENTS: Record<string, { gradient: string; icon: string; color: string }> = {
  '__default__': { gradient: 'linear-gradient(135deg, #2563eb, #7c3aed)', icon: '📋', color: '#2563eb' },
  'm3': { gradient: 'linear-gradient(135deg, #6366f1, #a5b4fc)', icon: '💠', color: '#6366f1' },
  'vscode': { gradient: 'linear-gradient(135deg, #1e1e1e, #007acc)', icon: '💻', color: '#007acc' },
  'github': { gradient: 'linear-gradient(135deg, #24292f, #2da44e)', icon: '🐙', color: '#2da44e' },
  'minimal': { gradient: 'linear-gradient(135deg, #475569, #94a3b8)', icon: '📄', color: '#475569' },
  'academic': { gradient: 'linear-gradient(135deg, #92400e, #f59e0b)', icon: '🎓', color: '#b45309' },
  'creative': { gradient: 'linear-gradient(135deg, #7c3aed, #ec4899)', icon: '🎨', color: '#9333ea' },
  'social': { gradient: 'linear-gradient(135deg, #ff2442, #ff6b81)', icon: '📕', color: '#ff2442' },
  'bento': { gradient: 'linear-gradient(135deg, #0891b2, #22d3ee)', icon: '🧩', color: '#0891b2' },
  'fde': { gradient: 'linear-gradient(135deg, #0d9488, #5eead4)', icon: '⚙️', color: '#0d9488' },
}

const SECTION_LABELS: Record<string, string> = {
  personal: '个人信息',
  profile: '个人简介',
  education: '教育经历',
  work: '工作经历',
  projects: '项目经验',
  skills: '专业技能',
  certificates: '证书语言',
}

// Fallback accent
const getAccent = (id: string, name: string) => {
  // Try matching by template ID first, then by name key
  const byId = TEMPLATE_ACCENTS[id]
  if (byId) return byId
  const key = Object.keys(TEMPLATE_ACCENTS).find((k) =>
    name.toLowerCase().includes(k.replace('__default__', 'classic'))
  )
  return key ? TEMPLATE_ACCENTS[key] : TEMPLATE_ACCENTS['__default__']
}

const TemplateManager: React.FC = () => {
  const templates = useTemplateStore((s) => s.templates)
  const currentTemplateId = useTemplateStore((s) => s.currentTemplateId)
  const setCurrentTemplate = useTemplateStore((s) => s.setCurrentTemplate)
  const addTemplate = useTemplateStore((s) => s.addTemplate)
  const removeTemplate = useTemplateStore((s) => s.removeTemplate)
  const validateTemplate = useTemplateStore((s) => s.validateTemplate)

  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadName, setUploadName] = useState('')
  const [uploadDesc, setUploadDesc] = useState('')
  const [uploadAuthor, setUploadAuthor] = useState('')
  const [htmlInput, setHtmlInput] = useState('')
  const [validationResult, setValidationResult] = useState<TemplateValidationResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const content = evt.target?.result as string
      setHtmlInput(content)
      if (!uploadName) setUploadName(file.name.replace(/\.html?$/i, ''))
      setValidationResult(validateTemplate(content))
    }
    reader.readAsText(file)
  }

  const handleUploadConfirm = () => {
    if (!htmlInput.trim() || !uploadName.trim()) return
    const result = validateTemplate(htmlInput)
    if (result.errors.length > 0) { setValidationResult(result); return }

    addTemplate({
      meta: {
        name: uploadName.trim(),
        description: uploadDesc.trim() || '用户上传模板',
        author: uploadAuthor.trim() || '未知',
        version: '1.0.0',
      },
      html: htmlInput,
    })
    handleCloseUpload()
  }

  const handleCloseUpload = () => {
    setUploadOpen(false)
    setHtmlInput('')
    setUploadName('')
    setUploadDesc('')
    setUploadAuthor('')
    setValidationResult(null)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          选择模板
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<UploadIcon />}
          onClick={() => setUploadOpen(true)}
        >
          上传模板
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        选择一个模板，预览区将实时展示效果。
      </Typography>

      {/* Template Gallery Grid */}
      <Grid container spacing={1.5}>
        {templates.map((template) => {
          const accent = getAccent(template.id, template.meta.name)
          const isSelected = currentTemplateId === template.id
          return (
            <Grid size={{ xs: 12, sm: 6 }} key={template.id}>
              <Card
                variant="outlined"
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                  borderColor: isSelected ? accent.color : 'divider',
                  borderWidth: isSelected ? 2 : 1,
                  bgcolor: isSelected ? 'action.selected' : 'background.paper',
                  '&:hover': {
                    borderColor: isSelected ? accent.color : 'primary.light',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                {/* Accent bar */}
                <Box
                  sx={{
                    height: 48,
                    background: accent.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    gap: 1,
                  }}
                >
                  <Typography sx={{ fontSize: '1.2rem', lineHeight: 1 }}>
                    {accent.icon}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: '#fff', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                  >
                    {template.meta.name}
                  </Typography>
                  {template.builtIn && (
                    <Chip
                      label="内置"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        ml: 'auto',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: '#fff',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {!template.builtIn && (
                    <Tooltip title="删除模板">
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); removeTemplate(template.id) }}
                        sx={{ ml: 'auto', color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <CardActionArea
                  onClick={() => setCurrentTemplate(template.id)}
                  sx={{ '&:hover .MuiCardActionArea-focusHighlight': { opacity: 0.04 } }}
                >
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      {/* Template sections preview */}
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.4,
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: '0.75rem',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {template.meta.description}
                        </Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                          作者: {template.meta.author} · v{template.meta.version}
                        </Typography>
                      </Box>

                      {/* Selection indicator */}
                      {isSelected && (
                        <CheckIcon
                          sx={{
                            fontSize: 24,
                            color: accent.color,
                            flexShrink: 0,
                            alignSelf: 'center',
                          }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          )
        })}
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onClose={handleCloseUpload} maxWidth="md" fullWidth>
        <DialogTitle>上传自定义模板</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
              模板使用 HTML + CSS 编写，通过 <code>{'{{personal.fullName}}'}</code> 占位符绑定数据。
              数组字段使用 <code>{'{{#each education}}...{{/each}}'}</code> 遍历。
              容器区块使用 <code>data-section="education"</code> 属性标记。
            </Alert>

            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
              >
                选择 HTML 文件
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm"
                  hidden
                  onChange={handleFileSelect}
                />
              </Button>
              {htmlInput && (
                <Chip
                  label={`已加载 ${htmlInput.length} 字符`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>

            <TextField
              label="模板名称 *"
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="我的自定义模板"
              required
            />
            <TextField
              label="模板描述"
              value={uploadDesc}
              onChange={(e) => setUploadDesc(e.target.value)}
              placeholder="模板的简短说明"
              multiline
              minRows={2}
            />
            <TextField
              label="作者"
              value={uploadAuthor}
              onChange={(e) => setUploadAuthor(e.target.value)}
              placeholder="作者名称"
            />

            {validationResult && (
              <Card variant="outlined">
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    模板检查结果
                  </Typography>
                  {validationResult.errors.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      {validationResult.errors.map((err, i) => (
                        <Alert key={i} severity="error" sx={{ mb: 0.5, fontSize: '0.8rem', py: 0 }}>
                          {err}
                        </Alert>
                      ))}
                    </Box>
                  )}
                  {validationResult.warnings.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      {validationResult.warnings.map((w, i) => (
                        <Alert key={i} severity="warning" sx={{ mb: 0.5, fontSize: '0.8rem', py: 0 }}>
                          {w}
                        </Alert>
                      ))}
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    检测到容器区块: {validationResult.sections.join(', ') || '无'}
                  </Typography>
                  {validationResult.valid ? (
                    <Chip icon={<CheckIcon />} label="模板兼容性检查通过" size="small" color="success" sx={{ mt: 0.5 }} />
                  ) : (
                    <Chip icon={<WarningIcon />} label="存在错误，请修正后上传" size="small" sx={{ mt: 0.5 }} />
                  )}
                </CardContent>
              </Card>
            )}

            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                或直接粘贴 HTML 代码
              </Typography>
              <TextField
                multiline
                minRows={6}
                maxRows={12}
                value={htmlInput}
                onChange={(e) => {
                  setHtmlInput(e.target.value)
                  if (e.target.value.trim()) {
                    setValidationResult(validateTemplate(e.target.value))
                  } else {
                    setValidationResult(null)
                  }
                }}
                placeholder="在此粘贴 HTML 模板代码..."
                sx={{ '& textarea': { fontFamily: 'monospace', fontSize: '0.8rem' } }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUpload}>取消</Button>
          <Button
            variant="contained"
            onClick={handleUploadConfirm}
            disabled={!htmlInput.trim() || !uploadName.trim() || (validationResult ? !validationResult.valid : false)}
          >
            上传
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TemplateManager

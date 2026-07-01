import React, { useRef, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
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
  List,
  ListItem,
  ListItemText,
  Radio,
  Tooltip,
} from '@mui/material'
import {
  Upload as UploadIcon,
  Close as CloseIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'
import useTemplateStore, { type TemplateValidationResult } from '../../store/templateStore'

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

      // Auto-detect name from filename
      if (!uploadName) {
        setUploadName(file.name.replace(/\.html?$/i, ''))
      }

      // Validate
      const result = validateTemplate(content)
      setValidationResult(result)
    }
    reader.readAsText(file)
  }

  const handleUploadConfirm = () => {
    if (!htmlInput.trim() || !uploadName.trim()) return

    // Final validation
    const result = validateTemplate(htmlInput)
    if (result.errors.length > 0) {
      setValidationResult(result)
      return
    }

    const id = addTemplate({
      meta: {
        name: uploadName.trim(),
        description: uploadDesc.trim() || '用户上传模板',
        author: uploadAuthor.trim() || '未知',
        version: '1.0.0',
      },
      html: htmlInput,
    })

    // Reset
    setUploadOpen(false)
    setHtmlInput('')
    setUploadName('')
    setUploadDesc('')
    setUploadAuthor('')
    setValidationResult(null)
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
          模板管理
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
        选择一个模板，简历预览将使用该模板渲染。模板使用 HTML + CSS，通过
        {'{{字段名}}'} 占位符与数据绑定。
      </Typography>

      {/* Template list */}
      <List sx={{ bgcolor: 'background.paper' }}>
        {templates.map((template) => (
          <Card
            key={template.id}
            variant="outlined"
            sx={{
              mb: 1,
              borderColor: currentTemplateId === template.id ? 'primary.main' : 'divider',
              bgcolor: currentTemplateId === template.id ? 'primary.light' : 'background.paper',
            }}
          >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Radio
                  checked={currentTemplateId === template.id}
                  onChange={() => setCurrentTemplate(template.id)}
                  size="small"
                />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">
                      {template.meta.name}
                    </Typography>
                    {template.builtIn && (
                      <Chip label="内置" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {template.meta.description}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                    作者: {template.meta.author} | v{template.meta.version}
                  </Typography>
                </Box>
                {!template.builtIn && (
                  <Tooltip title="删除模板">
                    <IconButton
                      size="small"
                      
                      onClick={() => removeTemplate(template.id)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </List>

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

            {/* Validation results */}
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
                    <Chip
                      icon={<CheckIcon />}
                      label="模板兼容性检查通过"
                      size="small"
                      color="success"
                      sx={{ mt: 0.5 }}
                    />
                  ) : (
                    <Chip
                      icon={<WarningIcon />}
                      label="存在错误，请修正后上传"
                      size="small"
                      
                      sx={{ mt: 0.5 }}
                    />
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

import React, { useState, useCallback } from 'react'
import {
  Box, Typography, Card, CardContent, Stack, TextField,
  CardActionArea, Chip, FormControlLabel, Switch, Slider,
  FormControl, InputLabel, Select, MenuItem, FormHelperText,
  Collapse, IconButton, Tooltip, Button, Link, Alert, Snackbar,
  Menu, ListSubheader, Divider,
} from '@mui/material'
import { ExpandMore as ExpandIcon, ExpandLess as CollapseIcon, ContentCopy as CopyIcon, OpenInNew as LinkIcon, CloudDownload as FetchIcon } from '@mui/icons-material'
import useAIStore, { PRESETS, getPreset } from '../../store/aiStore'

/* ── Provider 类别标签映射 ── */
const CATEGORY_LABEL: Record<string, { label: string; color: string }> = {
  cn_official: { label: '国产', color: '#4F46E5' },
  official: { label: '官方', color: '#059669' },
  aggregator: { label: '聚合', color: '#D97706' },
  third_party: { label: '第三方', color: '#6B7280' },
}

/* ── 各供应商参数面板 ── */

const DeepSeekParams: React.FC = () => {
  const env = useAIStore((s) => s.config.env) || {}
  const setEnv = useAIStore((s) => s.setEnv)
  return (
    <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>DeepSeek 参数</Typography>
      <Stack spacing={2}>
        <FormControlLabel
          control={<Switch checked={env.thinkingMode ?? false} onChange={(e) => setEnv('thinkingMode', e.target.checked)} size="small" />}
          label={<Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>思考模式（Thinking）</Typography>}
          sx={{ mx: 0 }}
        />
        {env.thinkingMode && (
          <FormControl fullWidth size="small">
            <InputLabel shrink>推理努力程度</InputLabel>
            <Select value={env.reasoningEffort || 'medium'} label="推理努力程度" onChange={(e) => setEnv('reasoningEffort', e.target.value)}>
              <MenuItem value="low">低</MenuItem>
              <MenuItem value="medium">中</MenuItem>
              <MenuItem value="high">高</MenuItem>
            </Select>
          </FormControl>
        )}
      </Stack>
    </Box>
  )
}

const SiliconFlowParams: React.FC = () => {
  const env = useAIStore((s) => s.config.env) || {}
  const model = useAIStore((s) => s.config.model)
  const setEnv = useAIStore((s) => s.setEnv)
  return (
    <Box sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5, display: 'block' }}>硅基流动参数</Typography>
      <Stack spacing={2}>
        <FormControlLabel
          control={<Switch checked={env.enableThinking ?? false} onChange={(e) => setEnv('enableThinking', e.target.checked)} size="small" />}
          label={
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>推理模式</Typography>
              <Typography variant="caption" color="text.secondary">部分模型支持展示思考链</Typography>
            </Box>
          }
          sx={{ alignItems: 'flex-start', mx: 0 }}
        />
        {env.enableThinking && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              思考预算：{env.thinkingBudget ?? 2048}
            </Typography>
            <Slider size="small" value={env.thinkingBudget ?? 2048} min={128} max={32768} step={128}
              onChange={(_, v) => setEnv('thinkingBudget', v as number)} />
          </Box>
        )}
        {model === 'deepseek-ai/DeepSeek-V4-Flash' && (
          <FormControl fullWidth size="small">
            <InputLabel shrink>推理努力程度</InputLabel>
            <Select value={env.reasoningEffort || 'high'} label="推理努力程度" onChange={(e) => setEnv('reasoningEffort', e.target.value)}>
              <MenuItem value="high">high</MenuItem>
              <MenuItem value="max">max</MenuItem>
            </Select>
            <FormHelperText>仅 DeepSeek V4 Flash 支持</FormHelperText>
          </FormControl>
        )}
      </Stack>
    </Box>
  )
}

const PARAM_PANELS: Record<string, React.FC> = {
  deepseek: DeepSeekParams,
  siliconflow: SiliconFlowParams,
}

/* ── 主页面 ── */

/* ── 从 API 获取模型列表 ── */
interface FetchedModel { id: string; ownedBy: string | null }

const AIConfigPage: React.FC = () => {
  const config = useAIStore((s) => s.config)
  const setConfig = useAIStore((s) => s.setConfig)
  const switchProvider = useAIStore((s) => s.switchProvider)

  const [showJson, setShowJson] = useState(false)
  const [fetchedModels, setFetchedModels] = useState<FetchedModel[]>([])
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [modelMenuAnchor, setModelMenuAnchor] = useState<HTMLElement | null>(null)

  const fetchModels = useCallback(async () => {
    if (!config.baseURL || !config.apiKey) {
      setFetchError('请先填写接口地址和密钥')
      return
    }
    setFetchLoading(true)
    setFetchError('')
    try {
      // 构造 /v1/models 地址
      const base = config.baseURL.replace(/\/+$/, '')
      const modelsURL = base.includes('/chat/completions')
        ? base.replace('/chat/completions', '/models')
        : `${base}/models`
      const res = await fetch(modelsURL, {
        headers: { Authorization: `Bearer ${config.apiKey}` },
      })
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new Error('认证失败，请检查密钥')
        if (res.status === 404) throw new Error('该服务商未提供模型列表接口')
        throw new Error(`请求失败 [${res.status}]`)
      }
      const data = await res.json()
      const list: FetchedModel[] = (data.data || data.models || []).map((m: any) => ({
        id: m.id || m.name,
        ownedBy: m.owned_by || m.ownedBy || null,
      }))
      if (list.length === 0) throw new Error('未获取到模型列表')
      setFetchedModels(list)
    } catch (e: any) {
      setFetchError(e.message || '获取失败')
    } finally {
      setFetchLoading(false)
    }
  }, [config.baseURL, config.apiKey])

  const preset = getPreset(config.providerId)
  const isCustom = config.providerId === 'custom' || config.providerId === 'openai-compatible'
  const ParamPanel = preset ? PARAM_PANELS[preset.id] : undefined

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>🤖 AI 配置</Typography>

      {/* 服务商选择 */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontWeight: 500 }}>
            服务商
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', mb: 2.5 }}>
            {PRESETS.filter(p => p.id !== 'openai-compatible').map((p) => (
              <Card key={p.id} variant="outlined" sx={{
                flex: '1 0 140px', cursor: 'pointer',
                borderColor: config.providerId === p.id ? 'primary.main' : 'divider',
                borderWidth: config.providerId === p.id ? 2 : 1,
                bgcolor: config.providerId === p.id ? 'action.selected' : 'background.paper',
              }}>
                <CardActionArea onClick={() => switchProvider(p.id)} sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontSize: '0.85rem' }}>{p.name}</Typography>
                    {p.category !== 'custom' && (
                      <Chip
                        label={CATEGORY_LABEL[p.category]?.label || ''}
                        size="small"
                        sx={{ height: 18, fontSize: '0.55rem', bgcolor: CATEGORY_LABEL[p.category]?.color, color: '#fff', fontWeight: 600 }}
                      />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">{p.description}</Typography>
                </CardActionArea>
              </Card>
            ))}
          </Stack>

          {/* Provider info & links */}
          {preset && !isCustom && (
            <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
              {preset.websiteUrl && (
                <Link href={preset.websiteUrl} target="_blank" underline="hover" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <LinkIcon sx={{ fontSize: 12 }} /> 官网
                </Link>
              )}
              {preset.apiKeyUrl && (
                <Link href={preset.apiKeyUrl} target="_blank" underline="hover" sx={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <LinkIcon sx={{ fontSize: 12 }} /> 获取密钥
                </Link>
              )}
            </Box>
          )}

          {/* 接口地址 */}
          <TextField
            label="接口地址"
            value={config.baseURL}
            onChange={(e) => setConfig({ baseURL: e.target.value })}
            placeholder="https://api.deepseek.com"
            slotProps={{ inputLabel: { shrink: true }, input: isCustom ? {} : { readOnly: true } }}
            size="small" fullWidth
            helperText={isCustom ? '填写兼容 OpenAI 格式的接口地址' : '已自动配置'}
            sx={{ mb: 2.5 }}
          />

          {/* 模型选择 */}
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>模型</Typography>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                {fetchedModels.length > 0 && (
                  <>
                    <Button
                      size="small" variant="text"
                      onClick={(e) => setModelMenuAnchor(e.currentTarget)}
                      sx={{ fontSize: '0.7rem', minWidth: 0, p: '2px 6px' }}
                    >
                      选获取的模型 ▼
                    </Button>
                    <Menu
                      anchorEl={modelMenuAnchor}
                      open={Boolean(modelMenuAnchor)}
                      onClose={() => setModelMenuAnchor(null)}
                      slotProps={{ paper: { sx: { maxHeight: 300, width: 280 } } }}
                    >
                      {(() => {
                        const grouped: Record<string, FetchedModel[]> = {}
                        fetchedModels.forEach(m => {
                          const k = m.ownedBy || '其他'
                          if (!grouped[k]) grouped[k] = []
                          grouped[k].push(m)
                        })
                        return Object.entries(grouped).flatMap(([vendor, models], vi) => [
                          vi > 0 && <Divider key={`d-${vendor}`} />,
                          <ListSubheader key={`h-${vendor}`} sx={{ lineHeight: '28px', fontSize: '0.7rem', fontWeight: 600 }}>
                            {vendor}
                          </ListSubheader>,
                          ...models.map(m => (
                            <MenuItem
                              key={m.id} dense
                              selected={config.model === m.id}
                              onClick={() => { setConfig({ model: m.id }); setModelMenuAnchor(null) }}
                              sx={{ fontSize: '0.78rem' }}
                            >
                              {m.id}
                            </MenuItem>
                          )),
                        ])
                      })()}
                    </Menu>
                  </>
                )}
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<FetchIcon sx={{ fontSize: 16, ...(fetchLoading ? { animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } } : {}) }} />}
                  onClick={fetchModels}
                  disabled={fetchLoading}
                  sx={{ fontSize: '0.7rem', py: 0.2, minWidth: 80 }}
                  color={fetchError ? 'error' : 'primary'}
                >
                  {fetchLoading ? '获取中…' : '获取模型'}
                </Button>
              </Box>
            </Box>
            {fetchError && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>{fetchError}</Typography>
            )}
            {preset && preset.models.length > 0 ? (
              <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                {preset.models.map((m) => (
                  <Card key={m.id} variant="outlined" sx={{
                    flex: '1 0 calc(50% - 8px)', minWidth: 120, cursor: 'pointer',
                    borderColor: config.model === m.id ? 'primary.main' : 'divider',
                    borderWidth: config.model === m.id ? 2 : 1,
                    bgcolor: config.model === m.id ? 'action.selected' : 'background.paper',
                  }}>
                    <CardActionArea onClick={() => setConfig({ model: m.id })} sx={{ p: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                        <Typography variant="subtitle2" sx={{ fontSize: '0.8rem' }}>{m.label}</Typography>
                        {m.badge && <Chip label={m.badge} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{m.desc}</Typography>
                    </CardActionArea>
                  </Card>
                ))}
              </Stack>
            ) : (
              <TextField label="模型名" value={config.model} onChange={(e) => setConfig({ model: e.target.value })} placeholder="gpt-4o-mini" slotProps={{ inputLabel: { shrink: true } }} size="small" fullWidth />
            )}
          </Box>

          {/* 参数面板 */}
          {ParamPanel && <ParamPanel />}
        </CardContent>
      </Card>

      {/* 密钥 */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontWeight: 500 }}>认证</Typography>
          <TextField label="API 密钥" value={config.apiKey} onChange={(e) => setConfig({ apiKey: e.target.value })} placeholder="sk-..." type="password" slotProps={{ inputLabel: { shrink: true } }} fullWidth />
        </CardContent>
      </Card>

      {/* 行业 */}
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontWeight: 500 }}>行业（可选）</Typography>
          <TextField label="行业 / 岗位方向" value={config.industry} onChange={(e) => setConfig({ industry: e.target.value })} placeholder="互联网 / 金融 / 制造业 / 医疗" slotProps={{ inputLabel: { shrink: true } }} fullWidth helperText="AI 根据行业特点优化简历措辞" />
        </CardContent>
      </Card>

      {/* JSON 预览 */}
      <Card variant="outlined">
        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
          <Box onClick={() => setShowJson(!showJson)} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', userSelect: 'none' }}>
            {showJson ? <CollapseIcon fontSize="small" color="action" /> : <ExpandIcon fontSize="small" color="action" />}
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1, fontWeight: 500 }}>本地配置（JSON）</Typography>
            {showJson && (
              <Tooltip title="复制配置">
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(JSON.stringify(config, null, 2)) }} sx={{ p: 0.3 }}>
                  <CopyIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Collapse in={showJson}>
            <Box component="pre" sx={{ mt: 1, p: 1, bgcolor: 'grey.900', color: 'grey.100', borderRadius: 1, fontSize: '0.7rem', lineHeight: 1.6, overflow: 'auto', maxHeight: 300, fontFamily: 'monospace' }}>
              {JSON.stringify(config, null, 2)}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AIConfigPage

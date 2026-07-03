import React, { useState, useCallback } from 'react'
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Tooltip,
  IconButton,
  Typography,
  Divider,
  Collapse,
  Snackbar,
  Alert,
} from '@mui/material'
import {
  Person as PersonIcon,
  TextSnippet as ProfileIcon,
  School as EduIcon,
  Work as WorkIcon,
  Folder as ProjectIcon,
  Build as SkillIcon,
  Verified as CertIcon,
  Palette as TemplateIcon,
  RestartAlt as ResetIcon,
  Visibility as VisibleIcon,
  VisibilityOff as HiddenIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  DarkMode as DarkIcon,
  LightMode as LightIcon,
  ChevronLeft as PanelCloseIcon,
  DragHandle as DragHandleIcon,
  Reorder as ReorderIcon,
  Check as CheckIcon,
  AutoAwesome as AiIcon,
} from '@mui/icons-material'
import useResumeStore from '../../store/resumeStore'
import useThemeStore from '../../store/themeStore'
import { useUndo } from '../../hooks/useUndo'
import { useTranslation } from 'react-i18next'
import useAIStore from '../../features/ai/store'
import { optimizeFullResume } from '../../features/ai/service'
import useLocaleStore from '../../store/localeStore'
import PersonalEditor from '../editor/PersonalEditor'
import ProfileEditor from '../editor/ProfileEditor'
import EducationEditor from '../editor/EducationEditor'
import WorkEditor from '../editor/WorkEditor'
import ProjectEditor from '../editor/ProjectEditor'
import SkillsEditor from '../editor/SkillsEditor'
import CertificatesEditor from '../editor/CertificatesEditor'
import AIConfigPage from '../../features/ai/AIConfigPage'
import TemplateManager from '../editor/TemplateManager'
import ResumePreview from '../preview/ResumePreview'
import ErrorBoundary from '../ErrorBoundary'
import FullPolishDialog from '../FullPolishDialog'
import type { Resume } from '../../types/resume'

const EditorLayout: React.FC = () => {
  const { t } = useTranslation()
  const activeTab = useResumeStore((s) => s.activeTab)
  const setActiveTab = useResumeStore((s) => s.setActiveTab)
  const resetResume = useResumeStore((s) => s.resetResume)
  const importResume = useResumeStore((s) => s.importResume)
  const themeMode = useThemeStore((s) => s.mode)
  const toggleTheme = useThemeStore((s) => s.toggleMode)
  const visibleSections = useResumeStore((s) => s.visibleSections)
  const toggleSection = useResumeStore((s) => s.toggleSection)
  const sectionOrder = useResumeStore((s) => s.sectionOrder)
  const moveSection = useResumeStore((s) => s.moveSection)

  const dataTabs = [
    { label: t('sidebar.personal'), value: 'personal', icon: <PersonIcon />, component: <PersonalEditor /> },
    { label: t('sidebar.profile'), value: 'profile', icon: <ProfileIcon />, component: <ProfileEditor /> },
    { label: t('sidebar.education'), value: 'education', icon: <EduIcon />, component: <EducationEditor /> },
    { label: t('sidebar.work'), value: 'work', icon: <WorkIcon />, component: <WorkEditor /> },
    { label: t('sidebar.projects'), value: 'projects', icon: <ProjectIcon />, component: <ProjectEditor /> },
    { label: t('sidebar.skills'), value: 'skills', icon: <SkillIcon />, component: <SkillsEditor /> },
    { label: t('sidebar.certificates'), value: 'certificates', icon: <CertIcon />, component: <CertificatesEditor /> },
    { label: t('sidebar.templates'), value: 'templates', icon: <TemplateIcon />, component: <TemplateManager /> },
    { label: t('sidebar.aiConfig'), value: 'ai', icon: <AiIcon />, component: <AIConfigPage /> },
  ]

  const { canUndo, canRedo, handleUndo, handleRedo } = useUndo()
  const locale = useLocaleStore((s) => s.locale)
  const toggleLocale = useLocaleStore((s) => s.toggleLocale)

  const handleReset = useCallback(() => {
    if (window.confirm('确定要清空所有简历数据吗？此操作不可撤销！')) {
      const currentResume = useResumeStore.getState().resume
      importResume(currentResume) // Push undo state before reset
      resetResume()
    }
  }, [importResume, resetResume])

  // ── 全文润色 ──
  const [polishOpen, setPolishOpen] = useState(false)
  const [polishLoading, setPolishLoading] = useState(false)
  const [polishDiffs, setPolishDiffs] = useState<{ section: string; field: string; before: string; after: string }[]>([])
  const [polishError, setPolishError] = useState('')
  const [optimizedResume, setOptimizedResume] = useState<Resume | null>(null)
  const aiConfig = useAIStore((s) => s.config)
  const isAiConfigured = useAIStore((s) => s.isConfigured)
  const [polishSnackbar, setPolishSnackbar] = useState('')

  // 计算 diff
  const computeDiffs = (original: Resume, optimized: Resume) => {
    const diffs: { section: string; field: string; before: string; after: string }[] = []
    if (original.profile !== optimized.profile) diffs.push({ section: '个人简介', field: 'profile', before: original.profile, after: optimized.profile })
    optimized.work.forEach((w, i) => {
      const ow = original.work[i]
      if (!ow) return
      if (ow.description !== w.description) diffs.push({ section: `工作经历 #${i+1}`, field: '描述', before: ow.description, after: w.description })
      if (JSON.stringify(ow.achievements) !== JSON.stringify(w.achievements)) diffs.push({ section: `工作经历 #${i+1}`, field: '量化成果', before: (ow.achievements || []).join('\n'), after: (w.achievements || []).join('\n') })
    })
    optimized.projects.forEach((p, i) => {
      const op = original.projects[i]
      if (!op) return
      if (op.description !== p.description) diffs.push({ section: `项目经验 #${i+1}`, field: '描述', before: op.description, after: p.description })
      if (JSON.stringify(op.highlights) !== JSON.stringify(p.highlights)) diffs.push({ section: `项目经验 #${i+1}`, field: '亮点', before: (op.highlights || []).join('\n'), after: (p.highlights || []).join('\n') })
    })
    return diffs
  }

  const handleFullPolish = async () => {
    if (!isAiConfigured()) {
      setPolishSnackbar('请先在 AI 配置中设置接口和密钥')
      return
    }
    setPolishOpen(true)
    setPolishLoading(true)
    setPolishDiffs([])
    setPolishError('')
    setOptimizedResume(null)

    try {
      const resume = useResumeStore.getState().resume
      const result = await optimizeFullResume(aiConfig, resume)
      const diffs = computeDiffs(resume, result)
      setPolishDiffs(diffs)
      setOptimizedResume(result)
    } catch (e: any) {
      setPolishError(e.message || 'AI 调用失败')
    } finally {
      setPolishLoading(false)
    }
  }

  const handleApplyFull = () => {
    if (optimizedResume) {
      importResume(optimizedResume)
    }
    setPolishOpen(false)
    setPolishSnackbar('AI 全文润色已应用 ✅')
  }

  // ── Section labels for drag-drop UI ──
  const SECTION_LABELS: Record<string, string> = {
    personal: '个人信息',
    profile: '个人简介',
    education: '教育经历',
    work: '工作经历',
    projects: '项目经验',
    skills: '专业技能',
    certificates: '证书语言',
  }

  // Drag-and-drop state
  const [reorderOpen, setReorderOpen] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)

  const handleDragStart = (idx: number) => {
    setDragIdx(idx)
  }
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    setOverIdx(idx)
  }
  const handleDrop = (idx: number) => {
    if (dragIdx !== null && dragIdx !== idx) {
      moveSection(dragIdx, idx)
    }
    setDragIdx(null)
    setOverIdx(null)
  }
  const handleDragEnd = () => {
    setDragIdx(null)
    setOverIdx(null)
  }

  // Sort data tabs by sectionOrder so sidebar matches preview order
  const sortedTabs = React.useMemo(() => {
    const dataTabsByValue: Record<string, typeof dataTabs[0]> = {}
    dataTabs.forEach((t) => { dataTabsByValue[t.value] = t })
    const ordered = sectionOrder
      .map((v) => dataTabsByValue[v])
      .filter(Boolean) as typeof dataTabs
    // Append template and AI config tabs at the end
    if (dataTabsByValue['templates']) ordered.push(dataTabsByValue['templates'])
    if (dataTabsByValue['ai']) ordered.push(dataTabsByValue['ai'])
    return ordered
  }, [sectionOrder])

  const currentTab = sortedTabs.find((t) => t.value === activeTab) || sortedTabs[0]
  const isDataTab = currentTab.value !== 'templates' && currentTab.value !== 'ai'
  const isVisible = isDataTab ? visibleSections[currentTab.value] : true
  const [drawerOpen, setDrawerOpen] = useState(true)

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Left Sidebar - Navigation */}
      <Paper
        sx={{
          width: 80,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 1.5,
          borderRight: '1px solid',
          borderColor: 'divider',
          borderRadius: 0,
          bgcolor: 'background.paper',
          zIndex: 1201,
        }}
        elevation={0}
      >
        <Divider sx={{ width: '80%', mb: 1 }} />
        <Tabs
          orientation="vertical"
          value={activeTab}
          onChange={(_, v) => { setActiveTab(v); setDrawerOpen(true) }}
          sx={{
            flex: 1,
            '& .MuiTab-root': {
              minHeight: 56,
              p: '4px 2px',
              fontSize: '0.7rem',
              fontWeight: 500,
            },
            '& .MuiTabs-indicator': {
              left: 0,
              width: 3,
              borderRadius: '0 3px 3px 0',
            },
          }}
        >
          {sortedTabs.map((t) => (
            <Tab
              key={t.value}
              value={t.value}
              icon={t.icon}
              label={t.label}
              sx={{ fontSize: '0.65rem', minHeight: 56 }}
            />
          ))}
        </Tabs>
        <Divider sx={{ width: '80%', mb: 0.5 }} />
        <Tooltip title="撤销 Ctrl+Z" placement="right">
              <span>
                <IconButton size="small" onClick={handleUndo} disabled={!canUndo} sx={{ color: canUndo ? 'text.secondary' : 'text.disabled' }}>
                  <UndoIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="重做 Ctrl+Shift+Z" placement="right">
              <span>
                <IconButton size="small" onClick={handleRedo} disabled={!canRedo} sx={{ color: canRedo ? 'text.secondary' : 'text.disabled' }}>
                  <RedoIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Divider sx={{ width: '80%', my: 0.5 }} />
            <Tooltip title="AI 全文润色 — 通读整份简历后统一优化" placement="right">
              <IconButton
                size="small"
                onClick={handleFullPolish}
                sx={{
                  color: '#fff',
                  bgcolor: 'primary.main',
                  width: 36,
                  height: 36,
                  '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.1)' },
                  transition: 'all 0.15s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
              >
                <AiIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={themeMode === 'dark' ? '切换亮色模式' : '切换深色模式'} placement="right">
          <IconButton size="small" onClick={toggleTheme} sx={{ color: 'text.secondary' }}>
            {themeMode === 'dark' ? <LightIcon fontSize="small" /> : <DarkIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title={locale === 'zh' ? 'Switch to English' : '切换到中文'} placement="right">
          <IconButton size="small" onClick={toggleLocale} sx={{ color: 'text.secondary', fontSize: '0.65rem', fontWeight: 700, width: 36 }}>
            {locale === 'zh' ? 'EN' : '中'}
          </IconButton>
        </Tooltip>
        <Tooltip title="清空所有数据" placement="right">
          <IconButton size="small" color="error" onClick={handleReset}>
            <ResetIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="填入示例数据" placement="right">
          <IconButton size="small" color="primary" onClick={() => { const r = useResumeStore.getState().resume; if (confirm('当前数据将被覆盖，确定？')) { pushState(r); resetResume() } }}>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>示例</Typography>
          </IconButton>
        </Tooltip>
        <Tooltip title="导出 JSON 数据" placement="right">
          <IconButton size="small" color="info" onClick={() => {
            const r = useResumeStore.getState().resume
            const blob = new Blob([JSON.stringify(r, null, 2)], { type: 'application/json' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `${r.personal.fullName || 'resume-data'}.json`
            a.click()
            URL.revokeObjectURL(blob)
          }}>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>导出</Typography>
          </IconButton>
        </Tooltip>
        <Tooltip title="导入 JSON 数据" placement="right">
          <IconButton size="small" color="info" onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = '.json'
            input.onchange = (e: any) => {
              const file = e.target?.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => {
                try { importResume(JSON.parse(reader.result as string)) }
                catch { alert('JSON 格式错误') }
              }
              reader.readAsText(file)
            }
            input.click()
          }}>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>导入</Typography>
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Editor Panel - animated width */}
      <Box
        sx={{
          width: drawerOpen ? 480 : 0,
          minWidth: 0,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          transition: 'width 225ms cubic-bezier(0, 0, 0.2, 1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', px: 1, minHeight: 40, flexShrink: 0 }}>
          {drawerOpen && (
            <Tooltip title="收起编辑面板">
              <IconButton size="small" onClick={() => setDrawerOpen(false)} sx={{ color: 'text.secondary' }}>
                <PanelCloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <Box sx={{ overflow: 'auto', flex: 1, px: drawerOpen ? 2.5 : 0, pb: 4, opacity: drawerOpen ? 1 : 0, transition: 'opacity 150ms ease' }}>
          <Typography variant="h6" sx={{ mb: 1.5, color: 'primary.main', fontWeight: 700, letterSpacing: 1 }}>
            📝 简历编辑
          </Typography>
          {isDataTab && (
            <Box sx={{ mb: 1, px: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Tooltip title="调整板块顺序">
                  <IconButton
                    size="small"
                    onClick={() => setReorderOpen(!reorderOpen)}
                    color={reorderOpen ? 'primary' : 'default'}
                  >
                    <ReorderIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={isVisible ? '点击隐藏此板块' : '点击显示此板块'}>
                  <IconButton
                    size="small"
                    onClick={() => toggleSection(currentTab.value)}
                    color={isVisible ? 'primary' : 'default'}
                    sx={{ fontSize: '0.75rem', gap: 0.5 }}
                  >
                    {isVisible ? <VisibleIcon fontSize="small" /> : <HiddenIcon fontSize="small" />}
                    <Typography variant="caption" color={isVisible ? 'primary' : 'text.disabled'}>
                      {isVisible ? '可见' : '隐藏'}
                    </Typography>
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Drag-and-drop reorder panel */}
              <Collapse in={reorderOpen}>
                <Paper
                  variant="outlined"
                  sx={{ mt: 1, p: 0.5, bgcolor: 'action.hover' }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 0.5, mb: 0.5, fontSize: '0.65rem' }}>
                    拖拽调整板块顺序
                  </Typography>
                  {sectionOrder.map((section, idx) => {
                    const label = SECTION_LABELS[section] || section
                    const isDragging = dragIdx === idx
                    const isOver = overIdx === idx && dragIdx !== idx
                    const tabIcon = dataTabs.find((t) => t.value === section)?.icon
                    return (
                      <Box
                        key={section}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDrop={() => handleDrop(idx)}
                        onDragEnd={handleDragEnd}
                        onClick={() => { setActiveTab(section); setReorderOpen(false) }}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 1,
                          py: 0.6,
                          mb: 0.3,
                          borderRadius: 1,
                          cursor: 'grab',
                          opacity: isDragging ? 0.4 : 1,
                          border: '1px solid',
                          borderColor: isOver ? 'primary.main' : 'transparent',
                          borderStyle: isOver ? 'dashed' : 'solid',
                          bgcolor: activeTab === section ? 'action.selected' : 'transparent',
                          transition: 'all 0.15s ease',
                          '&:hover': { bgcolor: 'action.focus' },
                          '&:active': { cursor: 'grabbing' },
                        }}
                      >
                        <DragHandleIcon
                          sx={{
                            fontSize: 16,
                            color: 'text.disabled',
                            flexShrink: 0,
                            cursor: 'grab',
                          }}
                        />
                        <Box sx={{ fontSize: '0.85rem', lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                          {tabIcon}
                        </Box>
                        <Typography variant="body2" sx={{ fontSize: '0.78rem', flex: 1 }}>
                          {label}
                        </Typography>
                        {activeTab === section && (
                          <CheckIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                        )}
                      </Box>
                    )
                  })}
                </Paper>
              </Collapse>
            </Box>
          )}
          {currentTab.component && (
            <ErrorBoundary name={currentTab.label}>
              {currentTab.component}
            </ErrorBoundary>
          )}
        </Box>
      </Box>

      {/* Toggle button when drawer is closed */}
      <Box sx={{ display: drawerOpen ? 'none' : 'flex', position: 'fixed', left: 80, top: 12, zIndex: 1200 }}>
        <Tooltip title="打开编辑面板" placement="right">
          <IconButton size="small" onClick={() => setDrawerOpen(true)} sx={{ bgcolor: 'background.paper', boxShadow: 1, '&:hover': { bgcolor: 'background.paper' } }}>
            <PanelCloseIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Right - Preview */}
      <Box sx={{ flex: 1, overflow: 'hidden', bgcolor: 'background.default' }}>
        <ErrorBoundary name="预览区域">
          <ResumePreview />
        </ErrorBoundary>
      </Box>
      {/* AI 全文润色弹窗 */}
      <FullPolishDialog
        open={polishOpen}
        diffs={polishDiffs}
        loading={polishLoading}
        error={polishError}
        onApply={handleApplyFull}
        onClose={() => setPolishOpen(false)}
      />
      <Snackbar
        open={!!polishSnackbar}
        autoHideDuration={3000}
        onClose={() => setPolishSnackbar('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ fontSize: '0.85rem' }}>{polishSnackbar}</Alert>
      </Snackbar>
    </Box>
  )
}

export default EditorLayout

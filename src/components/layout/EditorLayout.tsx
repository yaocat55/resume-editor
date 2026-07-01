import React, { useState } from 'react'
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Tooltip,
  IconButton,
  Typography,
  Divider,
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
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  DarkMode as DarkIcon,
  LightMode as LightIcon,
  ChevronLeft as PanelCloseIcon,
} from '@mui/icons-material'
import useResumeStore from '../../store/resumeStore'
import useThemeStore from '../../store/themeStore'
import PersonalEditor from '../editor/PersonalEditor'
import ProfileEditor from '../editor/ProfileEditor'
import EducationEditor from '../editor/EducationEditor'
import WorkEditor from '../editor/WorkEditor'
import ProjectEditor from '../editor/ProjectEditor'
import SkillsEditor from '../editor/SkillsEditor'
import CertificatesEditor from '../editor/CertificatesEditor'
import TemplateManager from '../editor/TemplateManager'
import ResumePreview from '../preview/ResumePreview'
import ErrorBoundary from '../ErrorBoundary'
import type { Resume } from '../../types/resume'

const dataTabs = [
  { label: '个人信息', value: 'personal', icon: <PersonIcon />, component: <PersonalEditor /> },
  { label: '个人简介', value: 'profile', icon: <ProfileIcon />, component: <ProfileEditor /> },
  { label: '教育经历', value: 'education', icon: <EduIcon />, component: <EducationEditor /> },
  { label: '工作经历', value: 'work', icon: <WorkIcon />, component: <WorkEditor /> },
  { label: '项目经验', value: 'projects', icon: <ProjectIcon />, component: <ProjectEditor /> },
  { label: '专业技能', value: 'skills', icon: <SkillIcon />, component: <SkillsEditor /> },
  { label: '证书语言', value: 'certificates', icon: <CertIcon />, component: <CertificatesEditor /> },
  { label: '模板管理', value: 'templates', icon: <TemplateIcon />, component: <TemplateManager /> },
]

const EditorLayout: React.FC = () => {
  const activeTab = useResumeStore((s) => s.activeTab)
  const setActiveTab = useResumeStore((s) => s.setActiveTab)
  const resetResume = useResumeStore((s) => s.resetResume)
  const importResume = useResumeStore((s) => s.importResume)
  const resumeData = useResumeStore((s) => s.resume)
  const themeMode = useThemeStore((s) => s.mode)
  const toggleTheme = useThemeStore((s) => s.toggleMode)
  const visibleSections = useResumeStore((s) => s.visibleSections)
  const toggleSection = useResumeStore((s) => s.toggleSection)
  const sectionOrder = useResumeStore((s) => s.sectionOrder)
  const moveSection = useResumeStore((s) => s.moveSection)

  const handleReset = () => {
    if (window.confirm('确定要清空所有简历数据吗？此操作不可撤销！')) {
      resetResume()
    }
  }

  // Sort data tabs by sectionOrder so sidebar matches preview order
  const sortedTabs = React.useMemo(() => {
    const dataTabsByValue: Record<string, typeof dataTabs[0]> = {}
    dataTabs.forEach((t) => { dataTabsByValue[t.value] = t })
    const ordered = sectionOrder
      .map((v) => dataTabsByValue[v])
      .filter(Boolean) as typeof dataTabs
    // Append template tab at the end
    if (dataTabsByValue['templates']) ordered.push(dataTabsByValue['templates'])
    return ordered
  }, [sectionOrder])

  const currentTab = sortedTabs.find((t) => t.value === activeTab) || sortedTabs[0]
  const isDataTab = currentTab.value !== 'templates'
  const isVisible = isDataTab ? visibleSections[currentTab.value] : true
  const [drawerOpen, setDrawerOpen] = useState(true)
  const sectionIdx = sectionOrder.indexOf(currentTab.value)
  const isFirst = sectionIdx <= 0
  const isLast = sectionIdx >= sectionOrder.length - 1

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
        <Tooltip title={themeMode === 'dark' ? '切换亮色模式' : '切换深色模式'} placement="right">
          <IconButton size="small" onClick={toggleTheme} sx={{ color: 'text.secondary' }}>
            {themeMode === 'dark' ? <LightIcon fontSize="small" /> : <DarkIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="清空所有数据" placement="right">
          <IconButton size="small" color="error" onClick={handleReset}>
            <ResetIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="填入示例数据" placement="right">
          <IconButton size="small" color="primary" onClick={() => { if (confirm('当前数据将被覆盖，确定？')) resetResume() }}>
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem' }}>示例</Typography>
          </IconButton>
        </Tooltip>
        <Tooltip title="导出 JSON 数据" placement="right">
          <IconButton size="small" color="info" onClick={() => {
            const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: 'application/json' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `${resumeData.personal.fullName || 'resume-data'}.json`
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, px: 0.5 }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="上移板块">
                  <span>
                    <IconButton size="small" disabled={isFirst} onClick={() => moveSection(sectionIdx, sectionIdx - 1)}>
                      <UpIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="下移板块">
                  <span>
                    <IconButton size="small" disabled={isLast} onClick={() => moveSection(sectionIdx, sectionIdx + 1)}>
                      <DownIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
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
    </Box>
  )
}

export default EditorLayout

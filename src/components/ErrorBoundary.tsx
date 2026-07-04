/**
 * ErrorBoundary — 错误边界
 *
 * 包裹每个编辑器面板和预览区，捕获渲染异常并显示重试按钮。
 */
import React from 'react'
import { Box, Typography, Button } from '@mui/material'
import { Refresh as RefreshIcon } from '@mui/icons-material'

interface Props {
  children: React.ReactNode
  name?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2, m: 1, border: '1px solid #fecaca', borderRadius: 1, bgcolor: '#fef2f2' }}>
          <Typography variant="body2" color="error" sx={{ fontWeight: 600, mb: 0.5 }}>
            ⚠️ {this.props.name || '区块'} 渲染异常
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontFamily: 'monospace', fontSize: '0.7rem' }}>
            {this.state.error?.message}
          </Typography>
          <Button size="small" variant="outlined" color="error" onClick={this.handleRetry} startIcon={<RefreshIcon />}>
            重试
          </Button>
        </Box>
      )
    }
    return this.props.children
  }
}

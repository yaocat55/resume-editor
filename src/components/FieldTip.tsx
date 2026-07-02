import React from 'react'
import { Tooltip } from '@mui/material'
import { HelpOutlined } from '@mui/icons-material'

interface FieldTipProps {
  tip: string
  size?: number
}

/**
 * 小圆圈「ⓘ」图标，悬浮时显示求职建议提示。
 * 用于替代冗长的 helperText 和内联说明文字。
 */
const FieldTip: React.FC<FieldTipProps> = ({ tip, size = 18 }) => (
  <Tooltip title={tip} arrow placement="top" enterDelay={200}>
    <HelpOutlined
      sx={{
        fontSize: size,
        color: 'text.secondary',
        cursor: 'help',
        verticalAlign: 'middle',
        ml: 0.5,
        '&:hover': { color: 'primary.main' },
      }}
    />
  </Tooltip>
)

export default FieldTip

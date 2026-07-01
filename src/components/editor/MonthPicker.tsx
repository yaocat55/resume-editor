import React from 'react'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'

interface Props {
  label: string
  value: string       // YYYY-MM format
  onChange: (val: string) => void
  required?: boolean
}

const MonthPicker: React.FC<Props> = ({ label, value, onChange, required }) => {
  const dateValue = value ? dayjs(value + '-01') : null

  return (
    <DatePicker
      label={label}
      value={dateValue}
      onChange={(newVal) => {
        if (newVal && newVal.isValid()) {
          onChange(newVal.format('YYYY-MM'))
        } else {
          onChange('')
        }
      }}
      views={['year', 'month']}
      format="YYYY-MM"
      slotProps={{
        textField: {
          size: 'small',
          required,
          fullWidth: true,
        },
        inputLabel: { shrink: true },
        field: { clearable: true },
        popper: { disablePortal: false },
      }}
      disableOpenPicker={false}
      sx={{ flex: 1 }}
    />
  )
}

export default MonthPicker

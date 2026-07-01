import type { Resume, ValidationErrors } from '../types/resume'

export function validateResume(data: Resume): ValidationErrors {
  const errors: ValidationErrors = {}

  // Personal
  if (!data.personal.fullName || data.personal.fullName.trim().length < 2) {
    errors['personal.fullName'] = '请输入姓名（至少2个字符）'
  }
  if (!data.personal.phone || !/^1[3-9]\d{9}$/.test(data.personal.phone)) {
    errors['personal.phone'] = '请输入正确的手机号'
  }
  if (!data.personal.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email)) {
    errors['personal.email'] = '请输入正确的邮箱'
  }

  // Education
  data.education.forEach((edu, i) => {
    const prefix = `education[${i}]`
    if (!edu.school) errors[`${prefix}.school`] = '请输入学校名称'
    if (!edu.major) errors[`${prefix}.major`] = '请输入专业名称'
    if (!edu.degree) errors[`${prefix}.degree`] = '请选择学历'
    if (!edu.startDate) errors[`${prefix}.startDate`] = '请选择开始时间'
    if (!edu.endDate) errors[`${prefix}.endDate`] = '请选择结束时间'
  })

  // Work
  data.work.forEach((w, i) => {
    const prefix = `work[${i}]`
    if (!w.company) errors[`${prefix}.company`] = '请输入公司名称'
    if (!w.position) errors[`${prefix}.position`] = '请输入职位名称'
    if (!w.startDate) errors[`${prefix}.startDate`] = '请选择开始时间'
    if (!w.endDate) errors[`${prefix}.endDate`] = '请选择结束时间'
    if (!w.description || w.description.trim().length < 10) {
      errors[`${prefix}.description`] = '请填写工作描述（至少10个字符）'
    }
  })

  // Projects
  data.projects.forEach((p, i) => {
    const prefix = `projects[${i}]`
    if (!p.name) errors[`${prefix}.name`] = '请输入项目名称'
    if (!p.role) errors[`${prefix}.role`] = '请输入角色'
    if (!p.description || p.description.trim().length < 10) {
      errors[`${prefix}.description`] = '请填写项目描述（至少10个字符）'
    }
  })

  // Skills
  if (data.skills.groups.length === 0) {
    errors['skills.groups'] = '请至少添加一个技能分组'
  }

  return errors
}

export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

/**
 * resumeStore — 简历数据全局状态
 *
 * 存储所有简历字段（personal / profile / education / work / projects / skills / certificates）
 * 以及板块可见性（visibleSections）和排序（sectionOrder）。
 * 使用 Zustand persist 中间件自动保存到 localStorage（key: resume-data）。
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type {
  Resume,
  Personal,
  Education,
  Work,
  Project,
  SkillGroup,
  Language,
} from '../types/resume'
import { defaultResume } from '../types/resume'

interface ResumeStore {
  // Data
  resume: Resume
  activeTab: string

  // Section visibility (which sections show in the preview)
  visibleSections: Record<string, boolean>

  // Toggle section visibility
  toggleSection: (section: string) => void

  // Section order (reorderable)
  sectionOrder: string[]
  moveSection: (fromIndex: number, toIndex: number) => void


  // Personal
  updatePersonal: (data: Partial<Personal>) => void

  // Profile
  updateProfile: (content: string) => void

  // Education
  addEducation: () => void
  updateEducation: (id: string, data: Partial<Education>) => void
  removeEducation: (id: string) => void

  // Work
  addWork: () => void
  updateWork: (id: string, data: Partial<Work>) => void
  removeWork: (id: string) => void

  // Projects
  addProject: () => void
  updateProject: (id: string, data: Partial<Project>) => void
  removeProject: (id: string) => void

  // Skills
  addSkillGroup: () => void
  updateSkillGroup: (index: number, data: Partial<SkillGroup>) => void
  removeSkillGroup: (index: number) => void
  addSkillTag: (groupIndex: number, tag: string) => void
  removeSkillTag: (groupIndex: number, tagIndex: number) => void
  updateSkillTag: (groupIndex: number, tagIndex: number, value: string) => void

  // Certificates
  addCertificate: (cert: string) => void
  removeCertificate: (index: number) => void
  updateCertificate: (index: number, value: string) => void
  addLanguage: () => void
  updateLanguage: (index: number, data: Partial<Language>) => void
  removeLanguage: (index: number) => void

  // Active tab
  setActiveTab: (tab: string) => void

  // Reset
  resetResume: () => void

  // Load/Import
  importResume: (data: Resume) => void
}

const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resume: { ...defaultResume },
      activeTab: 'personal',
      visibleSections: {
        personal: true,
        profile: true,
        education: true,
        work: true,
        projects: true,
        skills: true,
        certificates: true,
      },

      sectionOrder: ['personal', 'profile', 'skills', 'work', 'projects', 'education', 'certificates'],

      setActiveTab: (tab) => set({ activeTab: tab }),

      toggleSection: (section) =>
        set((state) => ({
          visibleSections: {
            ...state.visibleSections,
            [section]: !state.visibleSections[section],
          },
        })),

      moveSection: (fromIndex, toIndex) =>
        set((state) => {
          const order = [...state.sectionOrder]
          const [moved] = order.splice(fromIndex, 1)
          order.splice(toIndex, 0, moved)
          return { sectionOrder: order }
        }),

      updatePersonal: (data) =>
        set((state) => ({
          resume: { ...state.resume, personal: { ...state.resume.personal, ...data } },
        })),

      updateProfile: (content) =>
        set((state) => ({
          resume: { ...state.resume, profile: content },
        })),

      addEducation: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: [
              ...state.resume.education,
              {
                id: uuidv4(),
                school: '',
                major: '',
                degree: '本科',
                startDate: '',
                endDate: '',
              },
            ],
          },
        })),

      updateEducation: (id, data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: state.resume.education.map((edu) =>
              edu.id === id ? { ...edu, ...data } : edu
            ),
          },
        })),

      removeEducation: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: state.resume.education.filter((edu) => edu.id !== id),
          },
        })),

      addWork: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            work: [
              ...state.resume.work,
              {
                id: uuidv4(),
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                description: '',
              },
            ],
          },
        })),

      updateWork: (id, data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            work: state.resume.work.map((w) =>
              w.id === id ? { ...w, ...data } : w
            ),
          },
        })),

      removeWork: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            work: state.resume.work.filter((w) => w.id !== id),
          },
        })),

      addProject: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: [
              ...state.resume.projects,
              {
                id: uuidv4(),
                name: '',
                role: '',
                description: '',
              },
            ],
          },
        })),

      updateProject: (id, data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: state.resume.projects.map((p) =>
              p.id === id ? { ...p, ...data } : p
            ),
          },
        })),

      removeProject: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: state.resume.projects.filter((p) => p.id !== id),
          },
        })),

      addSkillGroup: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            skills: {
              groups: [...state.resume.skills.groups, { name: '', items: [] }],
            },
          },
        })),

      updateSkillGroup: (index, data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            skills: {
              groups: state.resume.skills.groups.map((g, i) =>
                i === index ? { ...g, ...data } : g
              ),
            },
          },
        })),

      removeSkillGroup: (index) =>
        set((state) => ({
          resume: {
            ...state.resume,
            skills: {
              groups: state.resume.skills.groups.filter((_, i) => i !== index),
            },
          },
        })),

      addSkillTag: (groupIndex, tag) =>
        set((state) => ({
          resume: {
            ...state.resume,
            skills: {
              groups: state.resume.skills.groups.map((g, i) =>
                i === groupIndex ? { ...g, items: [...g.items, tag] } : g
              ),
            },
          },
        })),

      removeSkillTag: (groupIndex, tagIndex) =>
        set((state) => ({
          resume: {
            ...state.resume,
            skills: {
              groups: state.resume.skills.groups.map((g, i) =>
                i === groupIndex
                  ? { ...g, items: g.items.filter((_, j) => j !== tagIndex) }
                  : g
              ),
            },
          },
        })),

      updateSkillTag: (groupIndex, tagIndex, value) =>
        set((state) => ({
          resume: {
            ...state.resume,
            skills: {
              groups: state.resume.skills.groups.map((g, i) =>
                i === groupIndex
                  ? {
                      ...g,
                      items: g.items.map((t, j) => (j === tagIndex ? value : t)),
                    }
                  : g
              ),
            },
          },
        })),

      // Certificates
      addCertificate: (cert) =>
        set((state) => ({
          resume: {
            ...state.resume,
            certificates: {
              ...state.resume.certificates,
              list: [...state.resume.certificates.list, cert],
            },
          },
        })),

      removeCertificate: (index) =>
        set((state) => ({
          resume: {
            ...state.resume,
            certificates: {
              ...state.resume.certificates,
              list: state.resume.certificates.list.filter((_, i) => i !== index),
            },
          },
        })),

      updateCertificate: (index, value) =>
        set((state) => ({
          resume: {
            ...state.resume,
            certificates: {
              ...state.resume.certificates,
              list: state.resume.certificates.list.map((c, i) =>
                i === index ? value : c
              ),
            },
          },
        })),

      addLanguage: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            certificates: {
              ...state.resume.certificates,
              languages: [
                ...(state.resume.certificates.languages || []),
                { name: '', level: '' },
              ],
            },
          },
        })),

      updateLanguage: (index, data) =>
        set((state) => ({
          resume: {
            ...state.resume,
            certificates: {
              ...state.resume.certificates,
              languages: (state.resume.certificates.languages || []).map((lang, i) =>
                i === index ? { ...lang, ...data } : lang
              ),
            },
          },
        })),

      removeLanguage: (index) =>
        set((state) => ({
          resume: {
            ...state.resume,
            certificates: {
              ...state.resume.certificates,
              languages: (state.resume.certificates.languages || []).filter(
                (_, i) => i !== index
              ),
            },
          },
        })),

      resetResume: () => set({ resume: { ...defaultResume } }),

      importResume: (data) => set({ resume: data }),
    }),
    {
      name: 'resume-data',
    }
  )
)

export default useResumeStore

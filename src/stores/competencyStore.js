import { defineStore } from 'pinia'

export const useCompetencyStore = defineStore('competency', {
  state: () => ({
    byLevel: {
      '2nd Level': {
        '23-25': {
          DSE: 'Superior',
          EI: 'Superior',
          IS: 'Superior',
          'P&O': 'Superior',
          'M&E': 'Superior',
          RM: 'Superior',
          'P&N': 'Superior',
          PM: 'Superior',
          AD: 'Superior',
          TSC: 'Superior',
          PSDM: 'Superior',
          BCIWR: 'Superior',
          MPCR: 'Superior',
        },
        '20-22': {
          DSE: 'Superior',
          EI: 'Superior',
          IS: 'Superior',
          'P&O': 'Superior',
          'M&E': 'Superior',
          RM: 'Superior',
          'P&N': 'Superior',
          PM: 'Superior',
          AD: 'Superior',
          TSC: 'Superior',
          PSDM: 'Superior',
          BCIWR: 'Superior',
          MPCR: 'Advanced',
        },
        '18-19': {
          DSE: 'Superior',
          EI: 'Superior',
          IS: 'Superior',
          'P&O': 'Superior',
          'M&E': 'Superior',
          RM: 'Superior',
          'P&N': 'Superior',
          PM: 'Superior',
          AD: 'Superior',
          TSC: 'Advanced',
          PSDM: 'Advanced',
          BCIWR: 'Advanced',
          MPCR: 'Advanced',
        },
        '15-17': {
          DSE: 'Superior',
          EI: 'Superior',
          IS: 'Superior',
          'P&O': 'Advanced',
          'M&E': 'Advanced',
          RM: 'Advanced',
          'P&N': 'Advanced',
          PM: 'Advanced',
          AD: 'Advanced',
          TSC: 'Intermediate',
          PSDM: 'Intermediate',
          BCIWR: 'Intermediate',
          MPCR: '-',
        },
        14: {
          DSE: 'Advanced',
          EI: 'Advanced',
          IS: 'Advanced',
          'P&O': '-',
          'M&E': '-',
          RM: 'Advanced',
          'P&N': '-',
          PM: 'Advanced',
          AD: 'Advanced',
          TSC: 'Intermediate',
          PSDM: 'Intermediate',
          BCIWR: 'Intermediate',
          MPCR: '-',
        },
        '12-13': {
          DSE: 'Advanced',
          EI: 'Advanced',
          IS: 'Advanced',
          'P&O': '-',
          'M&E': '-',
          RM: 'Advanced',
          'P&N': '-',
          PM: 'Advanced',
          AD: 'Advanced',
          TSC: 'Basic',
          PSDM: 'Basic',
          BCIWR: 'Basic',
          MPCR: '-',
        },
        '9-11': {
          DSE: 'Advanced',
          EI: 'Advanced',
          IS: 'Advanced',
          'P&O': '-',
          'M&E': '-',
          RM: 'Intermediate',
          'P&N': '-',
          PM: 'Intermediate',
          AD: 'Intermediate',
          TSC: 'Basic',
          PSDM: 'Basic',
          BCIWR: 'Basic',
          MPCR: '-',
        },
      },

      '1st Level': {
        18: {
          DSE: 'Superior',
          EI: 'Superior',
          IS: 'Superior',
          'P&O': 'Superior',
          'M&E': 'Superior',
          RM: 'Superior',
          'P&N': 'Superior',
          PM: 'Superior',
          AD: 'Superior',
          TSC: 'Advanced',
          PSDM: 'Advanced',
          BCIWR: 'Advanced',
          MPCR: 'Advanced',
        },
        14: {
          DSE: 'Advanced',
          EI: 'Advanced',
          IS: 'Advanced',
          'P&O': '-',
          'M&E': '-',
          RM: 'Advanced',
          'P&N': '-',
          PM: 'Advanced',
          AD: 'Advanced',
          TSC: 'Intermediate',
          PSDM: 'Intermediate',
          BCIWR: 'Intermediate',
          MPCR: '-',
        },
        13: {
          DSE: 'Advanced',
          EI: 'Advanced',
          IS: 'Advanced',
          'P&O': '-',
          'M&E': '-',
          RM: 'Advanced',
          'P&N': '-',
          PM: 'Advanced',
          AD: 'Advanced',
          TSC: 'Basic',
          PSDM: 'Basic',
          BCIWR: 'Basic',
          MPCR: '-',
        },
        '11-12': {
          DSE: 'Advanced',
          EI: 'Advanced',
          IS: 'Advanced',
          'P&O': '-',
          'M&E': '-',
          RM: 'Intermediate',
          'P&N': '-',
          PM: 'Intermediate',
          AD: 'Intermediate',
          TSC: 'Basic',
          PSDM: 'Basic',
          BCIWR: 'Basic',
          MPCR: '-',
        },
        10: {
          DSE: 'Intermediate',
          EI: 'Intermediate',
          IS: 'Intermediate',
          'P&O': '-',
          'M&E': '-',
          RM: 'Intermediate',
          'P&N': '-',
          PM: 'Intermediate',
          AD: 'Intermediate',
          TSC: '-',
          PSDM: '-',
          BCIWR: '-',
          MPCR: '-',
        },
        '8-9': {
          DSE: 'Intermediate',
          EI: 'Intermediate',
          IS: 'Intermediate',
          'P&O': '-',
          'M&E': '-',
          RM: 'Basic',
          'P&N': '-',
          PM: 'Basic',
          AD: 'Basic',
          TSC: '-',
          PSDM: '-',
          BCIWR: '-',
          MPCR: '-',
        },
        '3-7': {
          DSE: 'Basic',
          EI: 'Basic',
          IS: 'Basic',
          'P&O': '-',
          'M&E': '-',
          RM: 'Basic',
          'P&N': '-',
          PM: 'Basic',
          AD: 'Basic',
          TSC: '-',
          PSDM: '-',
          BCIWR: '-',
          MPCR: '-',
        },
      },
    },

    descriptions: {
      core: {
        DSE: 'Delivering Service Excellence',
        EI: 'Exemplifying Integrity',
        IS: 'Interpersonal Skills',
      },
      technical: {
        'P&O': 'Planning and Organizing',
        'M&E': 'Monitoring and Evaluation',
        RM: 'Records Management',
        'P&N': 'Partnering and Networking',
        PM: 'Process Management',
        AD: 'Attention to Details',
      },
      leadership: {
        TSC: 'Thinking Strategically and Creatively',
        PSDM: 'Problem Solving and Decision Making',
        BCIWR: 'Building Collaborative and Inclusive Working Relationships',
        MPCR: 'Managing Performance and Coaching for Results',
      },
    },
  }),

  getters: {
    getRow: (state) => (level, sg) => {
      return state.byLevel[level]?.[sg] ?? null
    },

    getBySG: (state) => (sg) => {
      // Convert sg to number for comparison
      const sgNum = parseInt(sg)

      for (const level of Object.keys(state.byLevel)) {
        const levelData = state.byLevel[level]

        // Check each SG key in this level
        for (const sgKey of Object.keys(levelData)) {
          // If it's a range (contains '-')
          if (typeof sgKey === 'string' && sgKey.includes('-')) {
            const [min, max] = sgKey.split('-').map(Number)
            if (sgNum >= min && sgNum <= max) {
              return levelData[sgKey]
            }
          }
          // If it's a single number (as string or number)
          else {
            const keyNum = parseInt(sgKey)
            if (keyNum === sgNum) {
              return levelData[sgKey]
            }
          }
        }
      }
      return null
    },

    getCompetency: (state) => (sg, code) => {
      const row = state.getBySG(sg)
      return row ? row[code] : null
    },

    getSalaryGrades: (state) => (level) => {
      return Object.keys(state.byLevel[level] || {})
    },
  },
})

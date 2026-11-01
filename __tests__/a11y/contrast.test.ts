import { contrastRatio, meetsWcagAA } from '@/lib/a11y/contrast'

describe('A11y Design Tokens Contrast (WCAG AA)', () => {
  const tokenPairs = [
    // Light Theme Core Tokens
    { name: 'Light BG vs Text Primary', fg: '#1A162B', bg: '#FAF8F5' },
    { name: 'Light BG vs Text Secondary', fg: '#4A4553', bg: '#FAF8F5' },
    { name: 'Light BG vs Plum Primary', fg: '#581C3F', bg: '#FAF8F5' },
    { name: 'White Text vs Plum Primary BG', fg: '#FFFFFF', bg: '#581C3F' },
    { name: 'Light BG vs Coral Accent', fg: '#9E2A18', bg: '#FAF8F5' },
    { name: 'White Text vs Coral Accent BG', fg: '#FFFFFF', bg: '#9E2A18' },

    // Dark Theme Core Tokens
    { name: 'Dark BG vs Text Primary', fg: '#FAF8FC', bg: '#141217' },
    { name: 'Dark BG vs Text Secondary', fg: '#B8B2C4', bg: '#141217' },
    { name: 'Dark BG vs Dark Plum', fg: '#E085BE', bg: '#141217' },
    { name: 'Dark Plum FG vs Dark Plum BG', fg: '#2A0A1F', bg: '#E085BE' },
    { name: 'Dark BG vs Dark Coral', fg: '#FF8A7A', bg: '#141217' },
    { name: 'Dark Coral FG vs Dark Coral BG', fg: '#2E0A05', bg: '#FF8A7A' },

    // Event Themes: Wedding (Rose-Gold)
    { name: 'Light BG vs Wedding Primary', fg: '#7E2548', bg: '#FAF8F5' },
    { name: 'White Text vs Wedding Primary BG', fg: '#FFFFFF', bg: '#7E2548' },
    { name: 'Light BG vs Wedding Accent', fg: '#7A5000', bg: '#FAF8F5' },
    { name: 'White Text vs Wedding Accent BG', fg: '#FFFFFF', bg: '#7A5000' },
    { name: 'Dark BG vs Wedding Primary Dark', fg: '#F08CB5', bg: '#141217' },
    {
      name: 'Wedding Dark FG vs Dark Primary BG',
      fg: '#260514',
      bg: '#F08CB5',
    },
    { name: 'Dark BG vs Wedding Accent Dark', fg: '#ECC276', bg: '#141217' },
    { name: 'Wedding Dark FG vs Dark Accent BG', fg: '#2E2003', bg: '#ECC276' },

    // Event Themes: Birthday (Violet-Amber)
    { name: 'Light BG vs Birthday Primary', fg: '#582484', bg: '#FAF8F5' },
    { name: 'White Text vs Birthday Primary BG', fg: '#FFFFFF', bg: '#582484' },
    { name: 'Light BG vs Birthday Accent', fg: '#8C4E00', bg: '#FAF8F5' },
    { name: 'White Text vs Birthday Accent BG', fg: '#FFFFFF', bg: '#8C4E00' },
    { name: 'Dark BG vs Birthday Primary Dark', fg: '#B78FF5', bg: '#141217' },
    {
      name: 'Birthday Dark FG vs Dark Primary BG',
      fg: '#1A0830',
      bg: '#B78FF5',
    },
    { name: 'Dark BG vs Birthday Accent Dark', fg: '#FDB654', bg: '#141217' },
    {
      name: 'Birthday Dark FG vs Dark Accent BG',
      fg: '#301B00',
      bg: '#FDB654',
    },

    // Event Themes: Community (Teal-Orange)
    { name: 'Light BG vs Community Primary', fg: '#0D5959', bg: '#FAF8F5' },
    {
      name: 'White Text vs Community Primary BG',
      fg: '#FFFFFF',
      bg: '#0D5959',
    },
    { name: 'Light BG vs Community Accent', fg: '#A83B00', bg: '#FAF8F5' },
    { name: 'White Text vs Community Accent BG', fg: '#FFFFFF', bg: '#A83B00' },
    { name: 'Dark BG vs Community Primary Dark', fg: '#45BFB8', bg: '#141217' },
    {
      name: 'Community Dark FG vs Dark Primary BG',
      fg: '#032422',
      bg: '#45BFB8',
    },
    { name: 'Dark BG vs Community Accent Dark', fg: '#FF8E4D', bg: '#141217' },
    {
      name: 'Community Dark FG vs Dark Accent BG',
      fg: '#331300',
      bg: '#FF8E4D',
    },
  ]

  for (const pair of tokenPairs) {
    it(`${pair.name} (${pair.fg} on ${pair.bg}) meets WCAG AA 4.5:1 ratio`, () => {
      const ratio = contrastRatio(pair.fg, pair.bg)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
      expect(meetsWcagAA(pair.fg, pair.bg)).toBe(true)
    })
  }
})

import type { GlobalThemeOverrides } from 'naive-ui'
import { theme } from '@unocss/preset-mini'

export const naiveThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: theme.colors.sky[500],
    primaryColorHover: theme.colors.sky[400],
    primaryColorPressed: theme.colors.sky[300],
  },
  Slider: {
    fillColor: theme.colors.sky[500],
    fillColorHover: theme.colors.sky[400],
  },

}

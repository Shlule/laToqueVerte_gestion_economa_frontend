import type { GlobalThemeOverrides } from 'naive-ui'
import { theme } from '@unocss/preset-mini'

export const naiveThemeOverrides: GlobalThemeOverrides = {
  common: {
    // primaryColor: theme.colors.sky[500],
    // primaryColorHover: theme.colors.sky[400],
    // primaryColorPressed: theme.colors.sky[300],
    // baseColor: theme.colors.sky[500],
    // bodyColor: theme.colors.stone[500],

  },
  Slider: {
    fillColor: theme.colors.sky[500],
    fillColorHover: theme.colors.sky[400],
  },

}

export const lightTheme: GlobalThemeOverrides = {
  common: {
    primaryColor: '#3498db',
    primaryColorHover: '#2980b9',
    primaryColorPressed: '#1abc9c',
    baseColor: '#ecf0f1',
  },
}

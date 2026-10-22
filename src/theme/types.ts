/**
 * Altın İz — Tema Tür Tanımları
 * 
 * Bu dosya tasarım sisteminin renk, boşluk, tipografi ve tema tercih modellerini tanımlar.
 */

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedColorScheme = 'light' | 'dark';

export interface ColorPalette {
  /** Ekran ana arka plan rengi */
  background: string;
  /** Kart ve kutu bileşenlerinin arka planı */
  card: string;
  /** Kart kenarlık rengi */
  cardBorder: string;
  /** Yükseltilmiş / öne çıkarılmış yüzey arka planı (modal, açılır menü vb.) */
  surfaceElevated: string;
  /** Ana marka rengi (koyu lacivert) */
  primary: string;
  /** Ana marka renginin açık tonu */
  primaryLight: string;
  /** Vurgu altın rengi */
  gold: string;
  /** Altın renginin açık / hafif şeffaf tonu (rozet zeminleri) */
  goldLight: string;
  /** Birincil okunabilir metin rengi */
  textPrimary: string;
  /** İkincil / açıklama metin rengi */
  textSecondary: string;
  /** Üçüncül / pasif metin rengi */
  textTertiary: string;
  /** Ters zemin metin rengi (koyu buton üstünde açık metin vb.) */
  textInverse: string;
  /** Kâr / pozitif getiri rengi (yalnızca renkle değil simge/+ ile desteklenmeli) */
  profit: string;
  /** Kâr arka plan rozet rengi */
  profitLight: string;
  /** Zarar / negatif getiri rengi (yalnızca renkle değil simge/- ile desteklenmeli) */
  loss: string;
  /** Zarar arka plan rozet rengi */
  lossLight: string;
  /** Uyarı / eski veri rengi */
  warning: string;
  /** Uyarı arka plan rozet rengi */
  warningLight: string;
  /** Genel kenarlık rengi */
  border: string;
  /** Çizgi / ayırıcı rengi */
  divider: string;
}

export interface SpacingSystem {
  none: number;
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
  /** Ekran kenar boşluğu (horizontal padding) */
  screenPadding: number;
  /** Kart içi dolgu */
  cardPadding: number;
  /** Form elemanları arası dikey boşluk */
  formGap: number;
}

export interface TypographyStyle {
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700';
}

export interface TypographySystem {
  caption: TypographyStyle;
  bodySmall: TypographyStyle;
  body: TypographyStyle;
  bodyBold: TypographyStyle;
  subtitle: TypographyStyle;
  title: TypographyStyle;
  headline: TypographyStyle;
  display: TypographyStyle;
}

export interface Theme {
  isDark: boolean;
  colors: ColorPalette;
  spacing: SpacingSystem;
  typography: TypographySystem;
}

export interface ThemeContextValue {
  theme: Theme;
  colors: ColorPalette;
  isDark: boolean;
  preference: ThemePreference;
  resolvedScheme: ResolvedColorScheme;
  setPreference: (preference: ThemePreference) => void;
}

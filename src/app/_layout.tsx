import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ThemeProvider } from '@/providers/ThemeProvider';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <ThemeProvider>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}

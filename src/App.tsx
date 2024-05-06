import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import "@mantine/notifications/styles.css";
import { RouterProvider } from 'react-router-dom';
import router from './routes';
import { useColorScheme, useHotkeys, useLocalStorage } from '@mantine/hooks';

export default function App() {
  const defaultColorScheme = useColorScheme();

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: 'mantine-color-scheme',
    defaultValue: defaultColorScheme,
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value?) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  useHotkeys([['mod+J', () => toggleColorScheme()]]);

  return (
    <>
      <ColorSchemeScript defaultColorScheme={defaultColorScheme} localStorageKey=''/>
      <MantineProvider
        withCssVariables
        withGlobalClasses
        withStaticClasses
      // defaultColorScheme='dark'
      >
        <Notifications position="top-right" zIndex={2077} />
        <RouterProvider router={router} />
      </MantineProvider>
    </>

  )
}

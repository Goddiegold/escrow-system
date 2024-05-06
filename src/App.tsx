import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import "@mantine/notifications/styles.css";
import { RouterProvider } from 'react-router-dom';
import router from './routes';

export default function App() {
  return (
    <MantineProvider
      withCssVariables
      withGlobalClasses
      withStaticClasses
      // defaultColorScheme='dark'
    >
      <Notifications position="top-right" zIndex={2077} />
      <RouterProvider router={router} />
    </MantineProvider>
  )
}

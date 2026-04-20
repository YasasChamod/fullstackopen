import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import { NotificationProvider } from './NotificationContext'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
	<QueryClientProvider client={queryClient}>
		<NotificationProvider>
			<App />
		</NotificationProvider>
	</QueryClientProvider>
)

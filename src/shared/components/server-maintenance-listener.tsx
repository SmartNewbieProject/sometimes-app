import { useServerMaintenanceModal } from '../hooks/use-server-maintenance-modal';

export function ServerMaintenanceListener() {
	useServerMaintenanceModal();
	return null;
}

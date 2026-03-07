type Listener = (isVisible: boolean) => void;

let isVisible = false;
const listeners = new Set<Listener>();

const notify = () => {
	for (const listener of listeners) {
		listener(isVisible);
	}
};

export const getLoggerVisibility = () => isVisible;

export const showLoggerOverlay = () => {
	isVisible = true;
	notify();
};

export const hideLoggerOverlay = () => {
	isVisible = false;
	notify();
};

export const subscribeLoggerVisibility = (listener: Listener) => {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
};

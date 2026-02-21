import { useEffect, useRef, useState } from 'react';

const TYPING_SPEED = 70;
const DELETE_SPEED = 35;
const HOLD_DURATION = 1800;
const SWITCH_DELAY = 350;

type Phase = 'typing' | 'holding' | 'deleting' | 'switching';

export function useTypingAnimation(words: string[]) {
	const [displayText, setDisplayText] = useState('');
	const [currentIndex, setCurrentIndex] = useState(0);
	const [phase, setPhase] = useState<Phase>('typing');
	const phaseRef = useRef<Phase>('typing');
	const charIndexRef = useRef(0);
	const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => {
		if (words.length === 0) return;

		const currentWord = words[currentIndex];

		const updatePhase = (p: Phase) => {
			phaseRef.current = p;
			setPhase(p);
		};

		const tick = () => {
			const p = phaseRef.current;

			if (p === 'typing') {
				charIndexRef.current += 1;
				setDisplayText(currentWord.slice(0, charIndexRef.current));

				if (charIndexRef.current >= currentWord.length) {
					updatePhase('holding');
					timerRef.current = setTimeout(tick, HOLD_DURATION);
				} else {
					timerRef.current = setTimeout(tick, TYPING_SPEED);
				}
			} else if (p === 'holding') {
				updatePhase('deleting');
				timerRef.current = setTimeout(tick, DELETE_SPEED);
			} else if (p === 'deleting') {
				charIndexRef.current -= 1;
				setDisplayText(currentWord.slice(0, charIndexRef.current));

				if (charIndexRef.current <= 0) {
					updatePhase('switching');
					timerRef.current = setTimeout(tick, SWITCH_DELAY);
				} else {
					timerRef.current = setTimeout(tick, DELETE_SPEED);
				}
			} else if (p === 'switching') {
				const nextIndex = (currentIndex + 1) % words.length;
				setCurrentIndex(nextIndex);
			}
		};

		updatePhase('typing');
		charIndexRef.current = 0;
		setDisplayText('');
		timerRef.current = setTimeout(tick, TYPING_SPEED);

		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, [currentIndex, words]);

	return { displayText, currentIndex, isHolding: phase === 'holding' };
}

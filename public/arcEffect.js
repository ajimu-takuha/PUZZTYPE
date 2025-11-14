(function () {
	const DEFAULT_OPTIONS = {
		color: '#3ec5ff',
		size: 12,
		duration: 600,
		curvature: 0.35,
		easing: t => 1 - Math.pow(1 - t, 3),
		zIndex: 9999,
		className: '',
		startDelay: 0,
		endOpacity: 0,
		shadowBlur: 12,
		shadowColor: 'rgba(62, 197, 255, 0.45)'
	};

	function getCenterPoint(element) {
		const rect = element.getBoundingClientRect();
		return {
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2
		};
	}

	function resolveSize(size) {
		if (typeof size === 'number') {
			return { width: size, height: size };
		}
		if (typeof size === 'object' && size !== null) {
			const width = typeof size.width === 'number' ? size.width : DEFAULT_OPTIONS.size;
			const height = typeof size.height === 'number' ? size.height : width;
			return { width, height };
		}
		return { width: DEFAULT_OPTIONS.size, height: DEFAULT_OPTIONS.size };
	}

	function createControlPoint(start, end, curvature) {
		const midX = (start.x + end.x) / 2;
		const midY = (start.y + end.y) / 2;
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const length = Math.hypot(dx, dy) || 1;
		const normalX = -dy / length;
		const normalY = dx / length;
		return {
			x: midX + normalX * length * curvature,
			y: midY + normalY * length * curvature
		};
	}

	function quadraticPoint(t, start, control, end) {
		const omT = 1 - t;
		return {
			x: omT * omT * start.x + 2 * omT * t * control.x + t * t * end.x,
			y: omT * omT * start.y + 2 * omT * t * control.y + t * t * end.y
		};
	}

	function createEffectElement(size, opts) {
		const el = document.createElement('div');
		el.style.position = 'fixed';
		el.style.pointerEvents = 'none';
		el.style.width = `${size.width}px`;
		el.style.height = `${size.height}px`;
		el.style.borderRadius = '9999px';
		el.style.background = opts.color;
		el.style.opacity = '0';
		el.style.transform = 'translate(-9999px, -9999px)';
		el.style.zIndex = String(opts.zIndex);
		if (opts.shadowBlur > 0) {
			el.style.boxShadow = `0 0 ${opts.shadowBlur}px ${opts.shadowColor}`;
		}
		if (opts.className) {
			el.className = opts.className;
		}
		return el;
	}

	function applyPosition(el, point, size) {
		const offsetX = point.x - size.width / 2;
		const offsetY = point.y - size.height / 2;
		el.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
	}

	function launchArcEffect(fromElement, toElement, options = {}) {
		if (!fromElement || !toElement) {
			console.warn('[ArcEffect] Both source and target elements are required.');
			return null;
		}

		const opts = { ...DEFAULT_OPTIONS, ...options };
		const size = resolveSize(opts.size);
		const start = getCenterPoint(fromElement);
		const end = getCenterPoint(toElement);
		const control = createControlPoint(start, end, opts.curvature);

		const effectEl = createEffectElement(size, opts);
		document.body.appendChild(effectEl);

		let shouldCancel = false;
		let animationFrameId = null;

		const startAnimation = startTime => {
			const tick = currentTime => {
				if (shouldCancel) {
					effectEl.remove();
					return;
				}
				const elapsed = currentTime - startTime;
				const rawT = Math.max(0, Math.min(1, elapsed / opts.duration));
				const easedT = typeof opts.easing === 'function' ? opts.easing(rawT) : rawT;
				const point = quadraticPoint(easedT, start, control, end);
				applyPosition(effectEl, point, size);
				const opacity = 1 - easedT + opts.endOpacity * easedT;
				effectEl.style.opacity = opacity.toString();

				if (rawT < 1) {
					animationFrameId = requestAnimationFrame(tick);
				} else {
					effectEl.remove();
					if (typeof opts.onComplete === 'function') {
						opts.onComplete();
					}
				}
			};
			animationFrameId = requestAnimationFrame(tick);
		};

		if (opts.startDelay > 0) {
			setTimeout(() => startAnimation(performance.now()), opts.startDelay);
		} else {
			requestAnimationFrame(startAnimation);
		}

		return {
			element: effectEl,
			cancel() {
				shouldCancel = true;
				if (animationFrameId !== null) {
					cancelAnimationFrame(animationFrameId);
				}
				effectEl.remove();
			}
		};
	}

	window.arcEffect = {
		launch: launchArcEffect,
		defaults: { ...DEFAULT_OPTIONS }
	};
})();


window.addEventListener("keydown", (e) => {
	console.log('エフェクト発射!');
	const player = document.getElementById('playerEffectOverlay');
	const opponent = document.getElementById('opponentEffectOverlay');

	arcEffect.launch(player, opponent, {
		color: '#3ec5ff',
		size: 140,
		duration: 650,
		curvature: 0.35,
	});
});
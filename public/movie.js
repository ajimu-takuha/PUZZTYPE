
const MOVIE_SRC = './movie/PUZZTYPE_movie_30fps_compressed.mp4';

function createOverlay() {
	const overlay = document.createElement('div');
	overlay.style.position = 'fixed';
	overlay.style.inset = '0';
	overlay.style.background = 'rgba(0,0,0,0.9)';
	overlay.style.display = 'flex';
	overlay.style.flexDirection = 'column';
	overlay.style.alignItems = 'center';
	overlay.style.justifyContent = 'center';
	overlay.style.zIndex = '9999';

	const container = document.createElement('div');
	container.style.width = 'min(90vw, 1280px)';
	container.style.maxWidth = '100%';
	container.style.aspectRatio = '16 / 9';
	container.style.position = 'relative';

	const video = document.createElement('video');
	video.src = MOVIE_SRC;
	video.controls = true;
	// video.autoplay = true;
	video.playsInline = true;
	video.style.width = '100%';
	video.style.height = '100%';
	video.style.backgroundColor = 'black';

	const closeBtn = document.createElement('button');
	closeBtn.textContent = 'CLOSE';
	closeBtn.className = 'toUseSE closeVideoButton';
	closeBtn.style.position = 'absolute';
	closeBtn.style.top = '1px';
	closeBtn.style.right = '1px';
	closeBtn.style.padding = '8px';
	closeBtn.style.margin = '0px';
	// closeBtn.style.fontSize = '14px';
	// closeBtn.style.cursor = 'pointer';

	closeBtn.addEventListener('mouseenter', () => {
		if (currentButtonSoundState === 'VALID') {
			soundManager.playSound('buttonHover', { volume: 1.2 });
		}
	});

	closeBtn.addEventListener('click', () => {
		if (currentButtonSoundState === 'VALID') {
			soundManager.playSound('buttonClick', { volume: 0.5 });
		}
		if (!video.paused) {
			video.pause();
		}
		overlay.remove();
	});

	video.addEventListener('ended', () => {
		overlay.remove();
	});

	container.appendChild(video);
	container.appendChild(closeBtn);
	overlay.appendChild(container);
	document.body.appendChild(overlay);

	// Handle autoplay restrictions
	// video.play().catch(() => {
	// 	// Show a centered play button overlay if autoplay is blocked
	// 	const playBtn = document.createElement('button');
	// 	playBtn.textContent = 'PLAY';
	// 	playBtn.className = 'toUseSE';
	// 	playBtn.style.position = 'absolute';
	// 	playBtn.style.left = '50%';
	// 	playBtn.style.top = '50%';
	// 	playBtn.style.transform = 'translate(-50%, -50%)';
	// 	playBtn.style.padding = '12px 18px';
	// 	playBtn.style.fontSize = '18px';
	// 	playBtn.style.cursor = 'pointer';
	// 	container.appendChild(playBtn);
	// 	playBtn.addEventListener('click', () => {
	// 		video.play().finally(() => playBtn.remove());
	// 	});
	// });
}

function showPlayVideoDialog() {
	const dialog = document.createElement('div');
	dialog.className = 'askPlayVideoDialog';
	dialog.innerHTML = `
    <div id="askVideoDialogContent">
      <h2 style="font-size:2.5vh;">ゲームのシステムをゆっくり解説する動画を作りました</h2>
      <h2 style="font-size:2.5vh;">視聴しますか？</h2>
      <h2 style="font-size:1.5vh;">ダイアログを閉じてもConfigから試聴が可能です</h2>
      <h2 style="font-size:1.5vh;">Configから「ASK WATCHING VIDEO」を変更するとこの文は出なくなります</h2>
      <h2 style="font-size:1.5vh;">※このゲーム内で再生され、音が出ます</h2>
      <div class="dialog-buttons">
        <button id="playVideoButton" class="dialogButton connectButton">WATCH</button>
        <button id="rejectVideoButton" class="dialogButton cancelButton">REJECT</button>
      </div>
    </div>
  `;
	document.body.appendChild(dialog);
	const dialogButton = document.querySelectorAll('.dialogButton');
	dialogButton.forEach(button => {
		// ホバー時の処理
		button.addEventListener('mouseenter', () => {
			if (currentButtonSoundState === 'VALID') {
				soundManager.playSound('buttonHover', { volume: 1.2 });
			}
		});

		// クリック時の処理
		button.addEventListener('click', () => {
			if (currentButtonSoundState === 'VALID') {
				soundManager.playSound('buttonClick', { volume: 0.5 });
			}
		});
	});

	const playVideoButton = dialog.querySelector('#playVideoButton');
	const rejectVideoButton = dialog.querySelector('#rejectVideoButton');

	playVideoButton.addEventListener('click', () => {
		dialog.remove();
		createOverlay();
	});
	rejectVideoButton.addEventListener('click', () => {
		dialog.remove();
	});
}

const dialogButton = document.querySelectorAll('.dialogButton');
dialogButton.forEach(button => {
	// ホバー時の処理
	button.addEventListener('mouseenter', () => {
		if (currentButtonSoundState === 'VALID') {
			soundManager.playSound('buttonHover', { volume: 1.2 });
		}
	});

	// クリック時の処理
	button.addEventListener('click', () => {
		if (currentButtonSoundState === 'VALID') {
			soundManager.playSound('buttonClick', { volume: 0.5 });
		}
	});
});

window.MoviePlayer = {
	askOnGameStart
};

function askOnGameStart() {
	if (currentAskVideoState === 'VALID') {
		showPlayVideoDialog();
	} else {
		return;
	}
}

const watchVideo = document.getElementById('watchVideo');
watchVideo.addEventListener('click', createOverlay);
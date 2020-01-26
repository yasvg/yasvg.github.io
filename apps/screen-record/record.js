window.onload = () => {
  const videoEl = document.querySelector("video#vid");

  // const allowBtn = document.querySelector("button#record");
  const recordBtn = document.querySelector("button#record");
  const stopBtn = document.querySelector("button#stop");
  const playBtn = document.querySelector("button#play");
  const downloadBtn = document.querySelector("button#download");
  const desktopCheckBx = document.querySelector("input#desktopAudio");
  const micCheckBx = document.querySelector("input#micAudio");
  const downloadLink = document.querySelector("a#downloadLink");

  let recordedBlobs;
  let mediaRecorder;
  let chunks;
  let recording;
  let desktopStream;
  let voiceStream;
  let stream;

  const mergeAudioStreams = (desktopStream, voiceStream) => {
    const context = new AudioContext();
    const destination = context.createMediaStreamDestination();

    if (desktopStream && desktopStream.getAudioTracks().length > 0) {
      const source1 = context.createMediaStreamSource(desktopStream);
      const desktopGain = context.createGain();
      desktopGain.gain.value = 0.7;
      source1.connect(desktopGain).connect(destination);
    }

    if (voiceStream && voiceStream.getAudioTracks().length > 0) {
      const source2 = context.createMediaStreamSource(voiceStream);
      const voiceGain = context.createGain();
      voiceGain.gain.value = 0.7;
      source2.connect(voiceGain).connect(destination);
    }

    return destination.stream.getAudioTracks();
  };


  recordBtn.addEventListener("click", async () => {
    const hasDesktop = desktopCheckBx.checked || false;
    const hasVoice = micCheckBx.checked || false;

    chunks = [];

    // if(hasDesktop) {
      desktopStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: hasDesktop
      });
    // }

    if(hasVoice) {
      voiceStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: hasVoice
      });
    }

    const audioTracks = mergeAudioStreams(desktopStream, voiceStream);

    const tracks = [
      ...desktopStream.getVideoTracks(),
      ...audioTracks
    ];

    stream = new MediaStream(tracks);

    videoEl.srcObject = stream;
    videoEl.src = null;
    videoEl.muted = true;

    mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    });

    mediaRecorder.start(10);

    stopBtn.disabled = false;
    recordBtn.disabled = true;
  });

  stopBtn.addEventListener("click", () => {
    console.log("stop capturing");
    mediaRecorder.stop();
    mediaRecorder = null;
    stream.getTracks().forEach(track => {
      track.stop();
    });

    stream = null;

    recordBtn.disabled = false;
    stopBtn.disabled = true;
    downloadBtn.disabled = false;
    recording = window.URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
  });

  playBtn.addEventListener('click', () => {
    videoEl.src = null;
    videoEl.srcObject = null;
    videoEl.src = window.URL.createObjectURL(new Blob(chunks, {type: 'video/webm'}));
  });

  downloadBtn.addEventListener("click", () => {
    console.log('download starting');

    downloadLink.addEventListener('progress', e => console.log(e));
    downloadLink.href = recording;
    downloadLink.download = 'screen-recording.webm';
    downloadLink.click();

  });
}

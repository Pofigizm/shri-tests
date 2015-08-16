/* */

var
  // elements
  audioInput  = _getNode('.audio .audio-input'),
  audioPlayer = _getNode('.audio .audio-player'),
  audioFile   = _getNode('.audio .audio-file'),
  audioPath   = _getNode('.audio .audio-file .file-path'),
  audioTime   = _getNode('.audio .audio-actions .time'),
  audioAction = {
    play:   _getNode('.audio .audio-actions .play-action'),
    mute:   _getNode('.audio .audio-actions .mute-action'),
    range:  _getNode('.audio .audio-actions .range-action'),
    rangeSet: false
  },
  fpsShow = _getNode('.fps-block'),

  // browsers compatable
  requestAF = window.requestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.msRequestAnimationFrame,
  AudioCtx  = window.AudioContext || window.webkitAudioContext,

  // audio parts of streams
  audioContext  = new AudioCtx(),
  audioSource   = audioContext.createMediaElementSource(audioPlayer),
  audioFreqs    = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000],
  audioFilters  = audioFreqs.map(_getFilter.bind(null, audioContext)),
  audioAnalyser = audioContext.createAnalyser(),
  audioBands    = new Uint8Array(audioAnalyser.frequencyBinCount);

  // audio strean route: audio >> filters >> analyser >> output
  [audioSource, audioFilters, audioAnalyser, audioContext.destination]
    .reduce( function(res, part) {
      return res.concat(part);
    }, [])
    .reduce( function(prev, curr) {
      prev.connect(curr);
      return curr;
    });

  // start settings
  audioAction.range.min = 0;
  audioAction.range.max = 1000;

  // event handlers

  // file open and d&d
  audioFile.ondragover = function(event) {
    event.preventDefault();
    _setClass(audioFile, 'hover', true);
  };
  audioFile.ondragleave = function(event) {
    event.preventDefault();
    _setClass(audioFile, 'hover', false);
  };
  audioFile.ondrop = function(event) {
    event.preventDefault();
    _setClass(audioFile, 'hover', false);
    _loadFile(event.dataTransfer.files[0]);
  };
  audioInput.onchange = function() {
    _loadFile(audioInput.files[0]);
  };

  function _loadFile(file) {
    var currentMessage;

    if (audioPlayer.canPlayType(file.type) === '') {
      currentMessage = audioPath.innerHTML;
      audioPath.innerHTML = 'Данный тип файла не поддерживается';
      _setClass(audioFile, 'error', true);
      setTimeout(function() {
        audioPath.innerHTML = currentMessage;
        _setClass(audioFile, 'error', false);
      }, 2000);
      return;
    }

    audioPath.innerHTML = file.name;
    audioPlayer.src = window.URL.createObjectURL(file);
    audioPlayer.load();
  }

  // audio control actions
  audioAction.play.onclick = function() {
    audioPlayer[audioPlayer.paused ? 'play' : 'pause']();
  };
  audioAction.mute.onclick = function() {
    audioPlayer.muted = !audioPlayer.muted;
  };
  audioAction.range.onmousedown = function() {
    audioAction.rangeSet = true;
  };
  audioAction.range.onmouseup = function() {
    audioPlayer.currentTime = audioAction.range.value *
                              audioPlayer.duration / 1000 || 0;
    audioAction.rangeSet = false;
  };

  // update all view every animation frame
  (function updateView(previousTime, count) {
    var currentTime = Date.now();

    // perfomance show
    if (currentTime - previousTime > 200) {
      fpsShow.innerHTML = Math.floor(60 * 16 * count / (currentTime - previousTime)) + ' fps';
      count = 0;
    } else {
      currentTime = previousTime;
      count++;
    }

    _setClass(audioAction.play, 'paused', audioPlayer.paused);
    _setClass(audioAction.mute, 'muted', audioPlayer.muted);
    if (!audioAction.rangeSet) {
      audioAction.range.value = 1000 * audioPlayer.currentTime /
                                       audioPlayer.duration;
    }
    audioTime.innerHTML = _getTime(audioPlayer.currentTime) +
                  ' / ' + _getTime(audioPlayer.duration);

    audioAnalyser.getByteFrequencyData(audioBands);

    requestAF(updateView.bind(null, currentTime, count));
  })(Date.now(), 0);

// util function

function _getFilter(audioCtx, frequency) {
  var filter = audioCtx.createBiquadFilter();

  filter.type = 'peaking';
  filter.frequency.value = frequency;
  filter.Q.value = 1;
  filter.gain.value = 0;

  return filter;
}

function _getTime(sec) {
  sec = sec || 0;
  return Math.floor(+sec / 60) + ':' +
        (Math.floor(+sec % 60) < 10 ? '0' : '') +
         Math.floor(+sec % 60);
}

function _setClass(node, klass, condition) {
  if (condition ^ node.classList.contains(klass)) {
    node.classList.toggle(klass);
  }
}

function _getNode(selector, context) {
  context = (context instanceof Node) ? context : document;
  return context.querySelectorAll(selector)[0];
}

function _getSupportedAudio() {
  var mimeTypes = {
    'audio/aac':  ['.aac'],
    'audio/mp4':  ['.mp4', '.m4a'],
    'audio/mpeg': ['.mp1', '.mp2', '.mp3', '.mpg', '.mpeg'],
    'audio/ogg':  ['.oga', '.ogg'],
    'audio/wav':  ['.wav'],
    'audio/webm': ['.webm'],
    'audio/flac': ['.flac']
  },
  audioElement = document.createElement('audio'),
  isSupport = audioElement.canPlayType.bind(audioElement);

  return Object.keys(mimeTypes).reduce(function(res, el) {
    return res.concat((isSupport(el) !== '') ? mimeTypes[el] : []);
  }, []);
}
console.log('You brouser is suppurt only ' + _getSupportedAudio().join(', ') + ' file types.');

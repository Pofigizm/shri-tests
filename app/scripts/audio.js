/* */

var
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
  requestAF = window.requestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.msRequestAnimationFrame;

  audioAction.range.min = 0;
  audioAction.range.max = 1000;

  audioInput.onchange = function() {
    var currentFile = audioInput.files[0],
        currentMessage;

    if (audioPlayer.canPlayType(currentFile.type) === '') {
      currentMessage = audioPath.innerHTML;
      audioPath.innerHTML = 'Данный тип файла не поддерживается';
      _setClass(audioFile, 'error', true);
      setTimeout(function() {
        audioPath.innerHTML = currentMessage;
        _setClass(audioFile, 'error', false);
      }, 2000);
      return;
    }

    audioPath.innerHTML = currentFile.name;
    audioPlayer.src = window.URL.createObjectURL(currentFile);
    audioPlayer.load();
  };

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

(function updateView() {
  _setClass(audioAction.play, 'paused', audioPlayer.paused);
  _setClass(audioAction.mute, 'muted', audioPlayer.muted);
  if (!audioAction.rangeSet) {
    audioAction.range.value = 1000 * audioPlayer.currentTime /
                                     audioPlayer.duration;
  }
  audioTime.innerHTML = _getTime(audioPlayer.currentTime) +
                ' / ' + _getTime(audioPlayer.duration);

  requestAF(updateView);
})();

/* util function */

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

function _getNode(selector) {
  return document.querySelectorAll(selector)[0];
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


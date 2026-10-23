/* The Official Spot (home page): the owner's 15-second commercial.
 * - Loads nothing until the section is near the screen (preload="none").
 * - Plays muted while on screen, pauses when scrolled away.
 * - "Sound on" unmutes and restarts from the top so the music lands.
 * - Reduced motion: no autoplay; a play button starts it on request.
 */
(function () {
  var video = document.querySelector('[data-spot-video]');
  if (!video) return;
  var soundBtn = document.querySelector('[data-spot-sound]');
  var soundLabel = document.querySelector('[data-spot-sound-label]');
  var playBtn = document.querySelector('[data-spot-play]');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var onScreen = false;
  var userStarted = false;

  function track(name, params) { try { if (typeof gtag === 'function') gtag('event', name, params || {}); } catch (e) {} }
  function play() {
    var p = video.play();
    if (p && typeof p.catch === 'function') p.catch(function () { if (playBtn) playBtn.hidden = false; });
  }
  function setSound(on) {
    video.muted = !on;
    if (soundBtn) {
      soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      soundBtn.classList.toggle('is-on', on);
    }
    if (soundLabel) soundLabel.textContent = on ? 'Sound off' : 'Sound on';
  }

  if (still) { if (playBtn) playBtn.hidden = false; }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        onScreen = e.isIntersecting;
        if (onScreen) {
          if (video.preload !== 'auto') video.preload = 'auto';
          if (!still || userStarted) play();
        } else if (!video.paused) {
          video.pause();
          // Leaving with sound on: mute so it doesn't blast on return.
          if (!video.muted) setSound(false);
        }
      });
    }, { threshold: 0.35 }).observe(video);
  } else if (!still) {
    play();
  }

  if (soundBtn) soundBtn.addEventListener('click', function () {
    var turnOn = video.muted;
    setSound(turnOn);
    if (turnOn) { video.currentTime = 0; userStarted = true; play(); track('commercial_sound_on'); }
  });
  if (playBtn) playBtn.addEventListener('click', function () {
    userStarted = true;
    playBtn.hidden = true;
    play();
    track('commercial_play');
  });
  video.addEventListener('playing', function () { if (playBtn) playBtn.hidden = true; });
})();

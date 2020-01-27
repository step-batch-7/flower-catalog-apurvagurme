const hideGif = function() {
  const gif = document.querySelector('#gif');
  gif.style.visibility = 'hidden';
  setTimeout(() => {
    gif.style.visibility = '';
  }, 1000);
};

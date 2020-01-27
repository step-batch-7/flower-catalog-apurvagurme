const hideGif = function() {
  const gif = document.querySelector('#gif');
  gif.style.display = 'none';
  setTimeout(() => {
    gif.style.display = 'block';
  }, 1000);
};

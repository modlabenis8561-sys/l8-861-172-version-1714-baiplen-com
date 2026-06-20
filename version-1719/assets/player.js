function initMoviePlayer(source){
  var video=document.getElementById('movie-player');
  var button=document.querySelector('.player-overlay');
  var message=document.querySelector('.player-message');
  var started=false;
  var hls=null;
  function showMessage(text){if(message){message.textContent=text;message.classList.add('show');}}
  function attach(){
    if(started){return;}
    started=true;
    if(video.canPlayType('application/vnd.apple.mpegurl')){
      video.src=source;
    }else if(window.Hls&&window.Hls.isSupported()){
      hls=new window.Hls({enableWorker:true,lowLatencyMode:true});
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR,function(event,data){if(data&&data.fatal){showMessage('视频暂时无法播放');}});
    }else{
      showMessage('视频暂时无法播放');
    }
  }
  function play(){
    attach();
    if(button){button.classList.add('hide');}
    var promise=video.play();
    if(promise&&promise.catch){promise.catch(function(){if(button){button.classList.remove('hide');}});}
  }
  if(button){button.addEventListener('click',play);}
  video.addEventListener('click',function(){if(video.paused){play();}else{video.pause();}});
  video.addEventListener('play',function(){if(button){button.classList.add('hide');}});
  video.addEventListener('pause',function(){if(!video.ended&&button){button.classList.remove('hide');}});
}
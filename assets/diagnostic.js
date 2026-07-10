/* ===== Экспресс-диагностика: общий модуль (попап-тест + баннер на страницах услуг).
   Подключается на /diagnostika и на всех страницах услуг. Требует в DOM попап
   #diagnostic-popup и печатный блок #diagnostic-print-report (партиал diagnostic-popup).
   Механика открытия/закрытия попапа и window.track — в scripts-base. ===== */
(function(){
  var diagPopup=document.getElementById('diagnostic-popup');
  if(!diagPopup)return;

  var LAYERS=[
    {id:'owner',name:'Решения собственника'},
    {id:'data',name:'База и аналитика'},
    {id:'service',name:'Сервис и процессы'},
    {id:'product',name:'Продукт и врач'},
    {id:'marketing',name:'Маркетинг и трафик'},
    {id:'strategy',name:'Связующая стратегия'}
  ];

  var QUESTIONS=[
    {q:'Что сейчас больше всего похоже на вашу ситуацию?',answers:[
      {text:'Нам нужно больше заявок',effect:{marketing:-15,strategy:-10,service:-5}},
      {text:'Администраторы плохо доводят до записи',effect:{service:-15,strategy:-8}},
      {text:'Пациенты не соглашаются на лечение',effect:{product:-15,service:-8}},
      {text:'Пациенты не возвращаются после первого визита',effect:{data:-10,service:-10,strategy:-8}},
      {text:'Есть CRM и сервисы, но порядка всё равно нет',effect:{data:-8,strategy:-10,owner:-8}}
    ]},
    {q:'Где чаще всего теряется пациент?',answers:[
      {text:'Между рекламой и заявкой',effect:{marketing:-12}},
      {text:'Между заявкой и записью',effect:{service:-12}},
      {text:'Между записью и приходом',effect:{service:-8,data:-8}},
      {text:'После консультации',effect:{product:-10,service:-8}},
      {text:'После первого визита',effect:{data:-10,strategy:-8}}
    ]},
    {q:'Как собственник понимает, что улучшать первым?',answers:[
      {text:'По ощущениям и разговорам с командой',effect:{owner:-12,data:-8,strategy:-8}},
      {text:'По отчётам, но они не объясняют причины',effect:{data:-8,strategy:-8}},
      {text:'Есть цифры, но нет понятного порядка действий',effect:{strategy:-8,owner:-6}},
      {text:'Есть ясная картина и приоритеты',effect:{owner:10,data:6,strategy:10}}
    ]},
    {q:'Как клиника работает с пациентской базой?',answers:[
      {text:'База есть, но с ней почти не работают',effect:{data:-12,service:-6}},
      {text:'Возвраты держатся на памяти администраторов',effect:{service:-10,data:-8}},
      {text:'Есть рассылки, но непонятно, что они дают',effect:{data:-8,strategy:-6}},
      {text:'База сегментирована, есть сценарии возврата',effect:{data:10,service:6,strategy:6}}
    ]},
    {q:'Что происходит после консультации?',answers:[
      {text:'Пациент часто берёт паузу и не возвращается',effect:{product:-10,service:-8,data:-6}},
      {text:'Врач объясняет лечение по-разному',effect:{product:-10,strategy:-6}},
      {text:'Пациент слышит цену, но не понимает ценность',effect:{product:-10,marketing:-6}},
      {text:'Есть понятный маршрут лечения',effect:{product:10,service:6}}
    ]},
    {q:'Как связаны маркетинг, сервис, продукт и аналитика?',answers:[
      {text:'Каждый блок живёт отдельно',effect:{strategy:-14,data:-6,owner:-6}},
      {text:'Связь есть, но многое держится в голове',effect:{strategy:-10,owner:-6}},
      {text:'Инструментов много, но ясности мало',effect:{data:-8,strategy:-8}},
      {text:'Есть единая логика и ответственные',effect:{strategy:12,owner:8,data:6}}
    ]}
  ];

  var HYPOTHESES={
    owner:['Какие данные собственник видит регулярно, а какие — нет'],
    data:['Видно ли по каждому источнику, кто из пациентов на самом деле ценный','Почему повторные визиты держатся на памяти команды, а не на данных'],
    service:['Где именно пациент выпадает между заявкой и записью','Есть ли контроль возврата после консультации'],
    product:['Понятен ли пациенту маршрут лечения и его ценность'],
    marketing:['Связана ли реклама с продуктовой линейкой и сервисом'],
    strategy:['Есть ли единая система, которая связывает маркетинг, сервис, продукт и аналитику']
  };

  var STORAGE_KEY='knuhov_diag_result';

  var steps=Array.prototype.slice.call(diagPopup.querySelectorAll('.diag-step'));
  function showStep(name){steps.forEach(function(s){s.hidden=s.dataset.step!==name;});}

  var state={answers:[],qIndex:0};
  function resetState(){state.answers=[];state.qIndex=0;}

  window.resetDiagnostic=function(){
    resetState();
    showStep('theory');
    var cb=document.getElementById('diag-attach-checkbox');
    if(cb)cb.checked=false;
  };

  document.getElementById('diag-start').addEventListener('click',function(){
    window.track('diagnostic_start',{});
    showStep('quiz');
    renderQuestion();
  });

  var progressFill=document.getElementById('diag-progress-fill');
  var stepLabel=document.getElementById('diag-step-label');
  var questionEl=document.getElementById('diag-question');
  var answersEl=document.getElementById('diag-answers');
  var backBtn=document.getElementById('diag-back');

  function renderQuestion(){
    var i=state.qIndex;
    var q=QUESTIONS[i];
    stepLabel.textContent='Вопрос '+(i+1)+' из '+QUESTIONS.length;
    progressFill.style.width=Math.round((i/QUESTIONS.length)*100)+'%';
    questionEl.textContent=q.q;
    answersEl.innerHTML='';
    var picked=state.answers[i];
    q.answers.forEach(function(a,ai){
      var b=document.createElement('button');
      b.type='button';
      b.className='diag-answer'+(picked&&picked.index===ai?' is-selected':'');
      b.textContent=a.text;
      b.addEventListener('click',function(){selectAnswer(i,ai,a);});
      answersEl.appendChild(b);
    });
    backBtn.disabled=i===0;
  }

  function selectAnswer(qi,ai,a){
    state.answers[qi]={index:ai,text:a.text,effect:a.effect};
    window.track('diagnostic_step_answered',{step:qi+1,answer:a.text});
    if(qi<QUESTIONS.length-1){
      state.qIndex=qi+1;
      renderQuestion();
    }else{
      finishQuiz();
    }
  }

  backBtn.addEventListener('click',function(){
    if(state.qIndex>0){state.qIndex--;renderQuestion();}
  });
  document.getElementById('diag-restart-mid').addEventListener('click',function(){
    window.track('diagnostic_restarted',{});
    window.resetDiagnostic();
  });
  document.getElementById('diag-restart').addEventListener('click',function(){
    window.track('diagnostic_restarted',{});
    window.resetDiagnostic();
  });

  function computeScores(){
    var scores={};
    LAYERS.forEach(function(l){scores[l.id]=50;});
    state.answers.forEach(function(ans){
      if(!ans)return;
      Object.keys(ans.effect).forEach(function(k){
        scores[k]=Math.max(0,Math.min(100,scores[k]+ans.effect[k]));
      });
    });
    return scores;
  }

  function colorForScore(score){
    if(score<35)return '#d02026';
    if(score<65)return '#e0a526';
    return '#1f9d55';
  }

  var systemTypeEl=document.getElementById('diag-system-type');
  var summaryEl=document.getElementById('diag-summary');
  var layersReportEl=document.getElementById('diag-layers-report');
  var weakListEl=document.getElementById('diag-weak-list');
  var hypListEl=document.getElementById('diag-hyp-list');
  var lastResult=null;

  function finishQuiz(){
    var scores=computeScores();
    var byScore=LAYERS.map(function(l){return {id:l.id,name:l.name,score:scores[l.id]};})
      .sort(function(a,b){return a.score-b.score;});
    var weak=byScore.filter(function(l){return l.score<50;}).slice(0,3);
    if(weak.length===0)weak=[byScore[0]];
    var weakCount=byScore.filter(function(l){return l.score<=35;}).length;

    var systemType,summary;
    if(weakCount>=3){
      systemType='Набор разрозненных инструментов';
      summary='Похоже, в клинике много отдельных инструментов, но единой системы пока нет — рост в одном месте может прятать потери в другом.';
    }else if(weakCount>=1){
      systemType='Система с разрывами';
      summary='Похоже, клиника теряет деньги не в одной точке, а на стыке слоёв: '+weak.map(function(w){return w.name.toLowerCase();}).join(', ')+'. Усиление рекламы без настройки этих слоёв может просто увеличить стоимость потерь.';
    }else{
      systemType='Управляемая система роста';
      summary='Слои держатся стабильно — сейчас задача не латать дыры, а закреплять то, что уже работает, и точечно усиливать слабое место.';
    }

    var hyps=[];
    weak.forEach(function(w){(HYPOTHESES[w.id]||[]).forEach(function(h){if(hyps.indexOf(h)===-1)hyps.push(h);});});
    if(hyps.length<3){
      Object.keys(HYPOTHESES).forEach(function(k){
        HYPOTHESES[k].forEach(function(h){if(hyps.indexOf(h)===-1&&hyps.length<5)hyps.push(h);});
      });
    }
    hyps=hyps.slice(0,5);

    lastResult={
      diagnostic_date:new Date().toISOString().slice(0,10),
      system_type:systemType,
      weak_layers:weak.map(function(w){return w.name;}),
      layer_scores:scores,
      answers:state.answers.map(function(a,i){return a?{question:QUESTIONS[i].q,answer:a.text}:null;}).filter(Boolean),
      summary:summary,
      audit_hypotheses:hyps
    };

    // Сохраняем результат, чтобы баннер на страницах услуг знал: тест пройден, PDF собран
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(lastResult));}catch(e){}
    document.dispatchEvent(new CustomEvent('diag:done',{detail:lastResult}));

    renderResult(lastResult);
    showStep('result');
    window.track('diagnostic_completed',{system_type:systemType,weak_layers:lastResult.weak_layers});
  }

  function renderResult(data){
    systemTypeEl.textContent=data.system_type;
    summaryEl.textContent=data.summary;
    layersReportEl.innerHTML=LAYERS.map(function(l){
      var score=data.layer_scores[l.id];
      var color=colorForScore(score);
      return '<div class="diag-layer-row"><span class="diag-layer-name">'+l.name+'</span>'+
        '<span class="diag-layer-bar"><span class="diag-layer-bar_fill" style="width:'+score+'%;background:'+color+'"></span></span>'+
        '<span class="diag-layer-score" style="color:'+color+'">'+score+'</span></div>';
    }).join('');
    weakListEl.innerHTML=data.weak_layers.map(function(w){return '<li>'+w+'</li>';}).join('');
    hypListEl.innerHTML=data.audit_hypotheses.map(function(h){return '<li>'+h+'</li>';}).join('');
  }

  /* ===== CTA на аудит из попапа ===== */
  document.getElementById('diag-audit-cta').addEventListener('click',function(){
    window.track('audit_cta_clicked',{system_type:lastResult&&lastResult.system_type});
    window.closePopup(diagPopup);
  });

  /* ===== Подсказка под действиями результата ===== */
  var hintEl=document.getElementById('diag-hint');
  var hintTimer=null;
  function showHint(text){
    hintEl.textContent=text;
    hintEl.hidden=false;
    clearTimeout(hintTimer);
    hintTimer=setTimeout(function(){hintEl.hidden=true;},3000);
  }

  /* ===== Поделиться результатом ===== */
  document.getElementById('diag-share').addEventListener('click',function(){
    if(!lastResult)return;
    window.track('diagnostic_share_clicked',{});
    var url=window.location.origin+'/diagnostika';
    var text='Я прошёл экспресс-диагностику клиники.\n\n'+
      'Предварительный результат: '+lastResult.system_type+'.\n'+
      'Слабые слои: '+lastResult.weak_layers.join(', ')+'.\n\n'+
      'Экспресс-диагностика показывает симптомы. На стратегическом аудите строят точную дорожную карту: что достроить первым, что не трогать и где клиника теряет деньги.\n\n'+
      'Пройти диагностику: '+url;
    if(navigator.share){
      navigator.share({title:'Результат экспресс-диагностики клиники',text:text}).then(function(){
        window.track('diagnostic_share_completed',{method:'webshare'});
      }).catch(function(){});
    }else if(navigator.clipboard){
      navigator.clipboard.writeText(text).then(function(){
        window.track('diagnostic_share_completed',{method:'clipboard'});
        showHint('Текст результата скопирован в буфер обмена');
      });
    }
  });

  /* ===== Сборка и печать PDF-отчёта (доступна и из баннера через window.buildDiagnosticPdf) ===== */
  var printReport=document.getElementById('diagnostic-print-report');
  window.buildDiagnosticPdf=function(data){
    if(!data||!printReport)return;
    printReport.innerHTML=
      '<h1>Экспресс-диагностика клиники</h1>'+
      '<p class="dp-date">Дата: '+data.diagnostic_date+'</p>'+
      '<h2>'+data.system_type+'</h2>'+
      '<p>'+data.summary+'</p>'+
      '<h3>Слабые слои</h3><ul>'+data.weak_layers.map(function(w){return '<li>'+w+'</li>';}).join('')+'</ul>'+
      '<h3>Оценка по слоям</h3><ul>'+LAYERS.map(function(l){return '<li>'+l.name+': '+data.layer_scores[l.id]+'</li>';}).join('')+'</ul>'+
      '<h3>Что стоит проверить на аудите</h3><ul>'+data.audit_hypotheses.map(function(h){return '<li>'+h+'</li>';}).join('')+'</ul>'+
      '<h3>Что даст стратегический аудит</h3><p>На аудите клиника разбирается глубже: путь пациента, сервис, продукт, аналитика, маркетинг и решения собственника. На выходе собственник получает дорожную карту: где теряются деньги, что достраивать первым и какие действия дадут рост.</p>'+
      '<p class="dp-cta">Заказать стратегический аудит — knuhov.ru</p>';
    window.track('diagnostic_pdf_generated',{});
    window.print();
  };
  document.getElementById('diag-pdf').addEventListener('click',function(){
    if(!lastResult)return;
    window.track('diagnostic_pdf_clicked',{});
    window.buildDiagnosticPdf(lastResult);
  });

  /* ===== Прикрепить результат к заявке на аудит (без бэкенда — заглушка через sessionStorage) ===== */
  var attachCheckbox=document.getElementById('diag-attach-checkbox');
  if(attachCheckbox){
    attachCheckbox.addEventListener('change',function(){
      if(!lastResult)return;
      if(attachCheckbox.checked){
        sessionStorage.setItem('knuhov_diagnostic_attached',JSON.stringify(lastResult));
        window.track('diagnostic_attached_to_audit',{system_type:lastResult.system_type});
        showHint('Результат будет прикреплён к заявке на аудит');
      }else{
        sessionStorage.removeItem('knuhov_diagnostic_attached');
        window.track('diagnostic_removed_from_audit',{});
      }
    });
  }

  resetState();
})();

/* ===== Баннер на страницах услуг: два состояния (тест не пройден / пройден) ===== */
(function(){
  var cta=document.querySelector('.svc-cta');
  if(!cta)return;
  var STORAGE_KEY='knuhov_diag_result';
  var idle=cta.querySelector('.svc-cta_idle');
  var done=cta.querySelector('.svc-cta_done');
  var typeEl=cta.querySelector('#svc-cta-type');

  function stored(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');}catch(e){return null;}}
  function render(result){
    if(result){
      idle.hidden=true; done.hidden=false;
      if(typeEl&&result.system_type)typeEl.textContent=result.system_type;
    }else{
      idle.hidden=false; done.hidden=true;
    }
  }
  render(stored());
  document.addEventListener('diag:done',function(e){render(e.detail||stored());});

  var auditBtn=cta.querySelector('#svc-cta-audit');
  if(auditBtn)auditBtn.addEventListener('click',function(){
    var r=stored();
    if(r){try{sessionStorage.setItem('knuhov_diagnostic_attached',JSON.stringify(r));}catch(e){}}
    window.track&&window.track('svc_use_result_for_audit',{system_type:r&&r.system_type});
  });

  var pdfBtn=cta.querySelector('#svc-cta-pdf');
  if(pdfBtn)pdfBtn.addEventListener('click',function(){
    var r=stored();
    if(r&&window.buildDiagnosticPdf)window.buildDiagnosticPdf(r);
  });
})();

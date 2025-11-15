
(function ($) {
  // animated hex background
  $(document).ready(function () {
    $('.animated-background').each(function (index) {
      var cnv = $("<canvas></canvas>").attr("id", "can" + index);

      colorRange = ['rgba(255, 255, 255, 1)', 'rgba(0, 0, 0, 1)'],
        strokeColor = 'rgb(0, 0, 0)';
      // strokeColor = 'rgba(255, 255, 255, 1)';


      $(this).prepend(cnv);

      var can = document.getElementById("can" + index);
      var w = can.width = $(this).width(),
        h = can.height = $(this).height(),
        sum = w + h,
        ctx = can.getContext('2d'),

        opts = {

          side: 80,
          picksParTick: 0.2, //originally 5
          baseTime: 5500,
          addedTime: 5500,
          colors: colorRange,
          addedAlpha: 0.1,
          strokeColor: strokeColor,
          hueSpeed: 10,
          repaintAlpha: 1
        },

        difX = Math.sqrt(3) * opts.side / 2,
        difY = opts.side * 3 / 2,
        rad = Math.PI / 6,
        cos = Math.cos(rad) * opts.side,
        sin = Math.sin(rad) * opts.side,

        hexs = [],
        tick = 0;

      function loop() {

        window.requestAnimationFrame(loop);

        tick += opts.hueSpeed;

        ctx.shadowBlur = 0;

        var backColor;


        // backColor = 'rgba(19, 23, 44, 0.1)';
        // backColor = 'rgba(29, 154, 242, 1)';
        // backColor = 'rgba(0, 0, 0, 1)';
        backColor = 'rgba(255, 255, 255, 1)';


        ctx.fillStyle = backColor.replace('alp', opts.repaintAlpha);
        ctx.fillRect(0, 0, w, h);

        for (var i = 0; i < opts.picksParTick; ++i)
          if (Math.random() < opts.picksParTick) {
            // picksParTickが確率として機能するように変更
            hexs[(Math.random() * hexs.length) | 0].pick();
          }

        hexs.map(function (hex) {
          hex.step();
        });
      }

      function Hex(x, y) {

        this.x = x;
        this.y = y;
        this.sum = this.x + this.y;
        // change between false and true to animate from left to right, or all at once
        this.picked = false;
        this.time = 0;
        this.targetTime = 0;

        this.xs = [this.x + cos, this.x, this.x - cos, this.x - cos, this.x, this.x + cos];
        this.ys = [this.y - sin, this.y - opts.side, this.y - sin, this.y + sin, this.y + opts.side, this.y + sin];
      }
      Hex.prototype.pick = function () {

        this.color = opts.colors[(Math.random() * opts.colors.length) | 0];
        this.picked = true;
        this.time = this.time || 0;
        this.targetTime = this.targetTime || (opts.baseTime + opts.addedTime * Math.random()) | 0;
      }
      Hex.prototype.step = function () {

        var prop = this.time / this.targetTime;

        ctx.beginPath();
        ctx.lineWidth = 2; // この行を追加（数値を変更して太さを調整）
        ctx.moveTo(this.xs[0], this.ys[0]);
        for (var i = 1; i < this.xs.length; ++i)
          ctx.lineTo(this.xs[i], this.ys[i]);
        ctx.lineTo(this.xs[0], this.ys[0]);

        if (this.picked) {
          ++this.time;
          if (this.time >= this.targetTime) {
            this.time = 0;
            this.targetTime = 0;
            this.picked = false;
          }

          ctx.fillStyle = ctx.shadowColor = this.color.replace('alp', Math.sin(prop * Math.PI));
          ctx.fill();
        }
        ctx.strokeStyle = ctx.shadowColor = opts.strokeColor;
        ctx.stroke();
      }

      for (var x = 0; x < w; x += difX * 2) {
        var i = 0;

        for (var y = 0; y < h; y += difY) {
          ++i;
          hexs.push(new Hex(x + difX * (i % 2), y));

        }
      }
      loop();

      window.addEventListener('resize', function () {

        w = can.width = window.innerWidth;
        h = can.height = window.innerHeight;
        sum = w + h;

        if (can.width < window.innerWidth) {
          can.alpha = 0.5;
          can.opacity = 0.5;
        }

        hexs.length = 0;
        for (var x = 0; x < w; x += difX * 2) {
          var i = 0;

          for (var y = 0; y < h; y += difY) {
            ++i;
            hexs.push(new Hex(x + difX * (i % 2), y));

          }
        }
      });
    });
  });
})(jQuery);


window.document.onkeydown = function (evt) {
  if ((evt.which == 32)
  ) {
    evt.which = null;
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    runDropAnimation();
  }, 3200);

  const welcomeOverlay = document.querySelector(".welcomeOverlay");

  const handleAnimationEnd = (event) => {
    if (event.animationName === 'overlayFadeOut') {
      welcomeOverlay.remove();
    }
  };

  welcomeOverlay.addEventListener("animationend", handleAnimationEnd);

  const howToPlayContent = document.getElementById('howToPlay');
  const pages = [
    {
      title: 'これだけ知ってて',
      content: `
      <div style="font-size:1.5vw; line-height:5vh;">
        ・
        <span style="color:rgb(255, 255, 255);">SPACEキー</span>
        もしくは
        <span style="color:rgb(255, 255, 255);">時間経過</span>
        でフィールドに単語が追加<br>
        ・
        <span style="color: rgb(255, 255, 255);">単語をタイプ</span>
        すると相手に単語を送って
        <span style="color: rgb(255, 255, 255);">攻撃</span>
        <span style="font-size:1vw; color: rgb(255, 255, 255);"> -ATTACK </span><br>
        ・タイプ中の文字は Backspace で1文字、 Delete または Ctrl で全て消去<br>
        ・タイプする単語の文字数を1ずつ変更すると攻撃力に
        <span style="color: rgba(255, 200, 50, 0.9);">ボーナス</span>
        <span style="font-size:1vw; color: rgba(255, 200, 50, 0.9);"> -CHAINBONUS </span><br>
        ・
        <span style="color: rgba(255, 200, 50, 0.9);">ボーナス</span>
        は文字数を
        <span style="color: rgb(0, 255, 255);">減らす</span>
        <span style="font-size:1vw; color: rgb(0, 255, 255);"> -UPCHAIN </span>
        と
        <span style="color: rgb(255, 0, 255);">増やす</span>
        <span style="font-size:1vw; color: rgb(255, 0, 255);"> -DOWNCHAIN </span>
        の各方向で増加<br>
        ・
        <span style="color: rgb(0, 255, 0);">しりとり</span>
        のように単語を連続タイプで
        <span style="color: rgba(255, 200, 50, 0.9);">ボーナス</span>
        を保持したまま方向リセット
        <span style="font-size:1vw; color: rgb(0, 255, 0);"> -CONNECT </span><br>
        ・
        <span style="color: rgb(255, 255, 255);">同じ文字数</span>
        の単語を連続タイプでボーナスは消えるけど
        <span style="color: rgb(255, 255, 255);">攻撃力2倍</span>
        <span style="font-size:1vw; color: rgb(255, 255, 255);"> -DOUBLE ATTACK </span><br>
        ・単語がフィールドからあふれたら負け<br>
        ・スタイルを変更して違ったプレイを楽しもう!<br>
        <span style="font-size:1vw; color: rgb(255, 255, 255);">
        　※オンラインは人がいなくて暇なとき作者が常駐してるだけです。とりあえずCPUと対戦してみてね!</span>
      </div>
      `
    },
    {
      title: 'スタイル  -その1',
      content: `
      <div style="font-size:1.2vw; line-height:4vh;">
        　CONFIG画面でSTYLEをクリックするとスタイルを変更でき、能力が変わります<br>
        　対戦時はフィールド横に現在のスタイルが表示されます<br>
        <span style="text-shadow:0px 0px 1px rgba(100, 255, 150, 1),1px 1px 0 rgba(100, 255, 150, 1),-1px 1px 0 rgba(100, 255, 150, 1),-1px -1px 0 rgba(100, 255, 150, 1),1px -1px 0 rgba(100, 255, 150, 1); color: rgb(0, 0, 0);">
        MUSCLE</span><br>
        　・<span style="color: rgb(255, 255, 255);">DOUBLE ATTACK</span>
        の威力が2倍から3倍になり、
        <span style="color: rgb(255, 255, 255);">DOUBLE ATTACK</span>
        によって
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        が1増えます<br>
        　・<span style="color: rgb(255, 255, 255);">DOUBLE ATTACK</span>
        以外で攻撃できず、
        <span style="color: rgb(0, 255, 255);">UPCHAIN</span>
        /
        <span style="color: rgb(255, 0, 255);">DOWNCHAIN</span>
        で
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        が0になります<br>
        　・<span style="color: rgb(0, 255, 0);">CONNECT</span>
        によって
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        を引き継げます<br>
        　・1文字でもミスタイプすると
        <span style="color:rgba(180, 200, 255, 0.8);">Nerf</span>
        が10になり、
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        が0になります
        <br>
        <span style="text-shadow:0px 0px 1px rgba(100, 255, 150, 1),1px 1px 0 rgba(100, 255, 150, 1),-1px 1px 0 rgba(100, 255, 150, 1),-1px -1px 0 rgba(100, 255, 150, 1),1px -1px 0 rgba(100, 255, 150, 1); color: rgb(0, 0, 0);">
        REFLECTOR</span><br>
        　・相殺時に同じ攻撃力を相殺した場合は1回の攻撃で2回まで相殺し、その攻撃力で2回相手に反撃します<br>
        　・相手から送られる攻撃が、50%の確率で2回送られます<br>
        <span style="text-shadow:0px 0px 1px rgba(100, 255, 150, 1),1px 1px 0 rgba(100, 255, 150, 1),-1px 1px 0 rgba(100, 255, 150, 1),-1px -1px 0 rgba(100, 255, 150, 1),1px -1px 0 rgba(100, 255, 150, 1); color: rgb(0, 0, 0);">
        TECHNICIAN</span><br>
        　・<span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        が5以上たまると5消費して攻撃し、加えて相手フィールドに消せないラインを送ります<br>
        　・攻撃力20以上の攻撃を行った場合は、攻撃力を10減少させ相手フィールドに消せないラインを送ります<br>
      </div>
      `
    },
    {
      title: 'スタイル -その2',
      content: `
      <div style="font-size:1.2vw; line-height:4vh;">
        <span style="text-shadow:0px 0px 1px rgba(100, 255, 150, 1),1px 1px 0 rgba(100, 255, 150, 1),-1px 1px 0 rgba(100, 255, 150, 1),-1px -1px 0 rgba(100, 255, 150, 1),1px -1px 0 rgba(100, 255, 150, 1); color: rgb(0, 0, 0);">
        GAMBLER</span><br>
        　・攻撃が各25%の確率で 
        自分に攻撃 / 
        MISS
        / 2回攻撃 / 3回攻撃 に変化します<br>
        　・<span style="color: rgb(0, 255, 255);">UPCHAIN</span>
        /
        <span style="color: rgb(255, 0, 255);">DOWNCHAIN</span>
        で
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        が0~4のうちランダムに上昇するようになります<br>
        <span style="text-shadow:0px 0px 1px rgba(100, 255, 150, 1),1px 1px 0 rgba(100, 255, 150, 1),-1px 1px 0 rgba(100, 255, 150, 1),-1px -1px 0 rgba(100, 255, 150, 1),1px -1px 0 rgba(100, 255, 150, 1); color: rgb(0, 0, 0);">
        OPTIMIST</span><br>
        　・ミスタイプによる
        <span style="color:rgba(180, 200, 255, 0.8);">Nerf</span>
        値の増加 / 
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        減少が起こりません<br>
        　・
        <span style="color: rgb(0, 255, 255);">UPCHAIN</span>
        /
        <span style="color: rgb(255, 0, 255);">DOWNCHAIN</span>
        による
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        上昇値が3になります<br>
        　・
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        が10以上になると攻撃後0になります<br>
        <span style="text-shadow:0px 0px 1px rgba(100, 255, 150, 1),1px 1px 0 rgba(100, 255, 150, 1),-1px 1px 0 rgba(100, 255, 150, 1),-1px -1px 0 rgba(100, 255, 150, 1),1px -1px 0 rgba(100, 255, 150, 1); color: rgb(0, 0, 0);">
        WORDCHAINER</span><br>
        　・<span style="color: rgb(0, 255, 0);">CONNECT</span>
        は
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        を5増加させたあとに<br>
        　・攻撃力20をランダムに振り分けた攻撃と、
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        による攻撃を行います<br>
        　・ミスタイプによる
        <span style="color:rgba(180, 200, 255, 0.8);">Nerf</span>
        値の増加 /
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        の減少が起こらず、
        <span style="color: rgb(0, 255, 0);">CONNECT</span>
        以外で攻撃できません<br>
        　・<span style="color: rgb(0, 255, 255);">UPCHAIN</span>
        /
        <span style="color: rgb(255, 0, 255);">DOWNCHAIN</span>
        による
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        の増加はできます<br>
        　<span style="font-size:1vw; color: rgb(255, 255, 255);">
        ※GAMBLER使用時の攻撃力表記は変化前のものが表記され、実際の攻撃力ではありません</span><br>
        
      </div>
      `
    },
    {
      title: 'CPU対戦',
      content: `
      <div style="font-size:1.5vw; line-height:5.2vh;">
        　・CPU MATCH ボタンからCPUと対戦ができます<br>
        　・対戦中に QUIT MATCH を押すとCPU対戦を中止します<br>
        　・各レベルで以下のCPUステータスが変わり、スライダーで自由に変更できます<br>
        　　--- INPUT&nbsp&nbsp RATE &nbsp-&nbsp CPUの1秒間の入力文字数 ( 文字 )<br>
        　　--- MISS&nbsp&nbsp&nbsp&nbsp&nbsp&nbspRATE &nbsp-&nbsp CPUの入力時におけるミス率 ( % )<br>
        　　--- MISS&nbsp&nbsp&nbsp&nbsp&nbsp&nbspWAIT &nbsp-&nbsp CPUのミス時の待機時間 ( 秒 )<br>
        　　--- SELECT&nbspWAIT &nbsp-&nbsp CPUが新たに入力する単語を選択するまでの時間 ( 秒 )<br>
        　CONFIG画面からINTERVALを変更すると<br>
        　時間経過による単語追加の秒数を「1秒」「10秒」「なし」に変更できます<br>

      </div>
      `
    },
    {
      title: '画面操作',
      content: `
      <div style="font-size:1.4vw; line-height:4.5vh;">
        <span style="font-size:1.8vw; color:rgba(85, 184, 255, 1); margin-bottom: 0.5vh;">CPU Match</span><br>
        　・強さを選んでCPUと対戦<br>
        <span style="font-size:1.8vw; color:rgba(255, 100, 100, 1); margin-bottom: 0.5vh;">Random Match</span><br>
        　・現在RANDOM MATCHを募集している相手を探して対戦 (タブを切り替えても機能します)<br>
        <span style="font-size:1.8vw; color: rgba(100, 100, 255, 1); margin-bottom: 0.5vh;">Room Match</span><br>
        　・4桁の数字を入力して同じ数字を入力しているプレイヤーと対戦<br>
        <span style="font-size:1.8vw; color: rgba(255, 200, 100, 1); margin-bottom: 0.5vh;">Config</span><br>
        　・対戦設定 / BGMやタイプ音の変更 / SEのオンオフ (設定はlocal storageに保存されます)<br>
        <span style="font-size:1.8vw; color: rgba(100, 255, 150, 1); margin-bottom: 0.5vh;">How To Play</span><br>
        　・現在の画面 - 操作方法や各種仕様を説明
      </div>
      `
    },
    {
      title: '攻撃の種類',
      content: `
      <div style="font-size:1vw; line-height:2.2vh;">
        <span style="color:rgb(255, 255, 255);">ATTACK</span><br>
        　・単語と同じ文字をタイプするとフィールドから消え、タイプした単語と同じ文字数の単語が相手フィールドに送られます<br>
        <br>
        <span style="color:rgb(0, 255, 255);">UPCHAIN</span><br>
        　・前にタイプした単語より文字数が1少ない単語をタイプすると
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        が得られます<br>
        　・1回目のボーナスは2で、以降
        <span style="color:rgb(0, 255, 255);">2ずつ</span>
        増えてゆきます<br>
        　・画面上で背景色が
        <span style="color:rgb(0, 255, 255);">ライトブルー</span>
        になっている単語が
        <span style="color:rgb(0, 255, 255);">UPCHAIN</span>
        対象です<br>
        <br>
        <span style="color:rgb(255, 0, 255);">DOWNCHAIN</span><br>
        　・前にタイプした単語より文字数が1多い単語をタイプすると
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        が得られます<br>
        　・1回目のボーナスは2で、以降は
        <span style="color:rgb(255, 0, 255);">1ずつ</span>
        増えてゆきます<br>
        　・画面上で背景色が
        <span style="color:rgb(255, 0, 255);">マゼンタ</span>
        になっている単語が
        <span style="color:rgb(255, 0, 255);">DOWNCHAIN</span>
        対象です<br>
        <br>
        <span style="color:rgb(255, 255, 255);">DOUBLE ATTACK</span><br>
        　・同じ文字数の単語を連続でタイプすると、攻撃力が2倍になります<br>
        　・
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        がある場合は2倍の数値として攻撃力に合算され、その後
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        が0になります<br>
        　・画面上で背景色が
        <span style="color:rgb(255, 255, 255);">ホワイト</span>
        になっている単語が
        <span style="color:rgb(255, 255, 255);">DOUBLE ATTACK</span>
        対象です<br>
        <br>
        <span style="color:rgb(0, 255, 0);">CONNECT</span><br>
        　・最後にタイプした単語の末尾文字と、次の単語の先頭文字が同じ場合、
        <span style="color:rgb(0, 255, 0);">CONNECT</span>
        となり攻撃力に
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        が加算されます<br>
        　・
        <span style="color:rgb(0, 255, 0);">CONNECT</span>
        は
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        を維持したまま
        <span style="color:rgb(0, 255, 255);">UPCHAIN</span>
        /
        <span style="color:rgb(255, 0, 255);">DOWNCHAIN</span>
        判定を解除します<br>
        　・
        <span style="color:rgb(0, 255, 0);">CONNECT</span>
        はほかの攻撃に優先され、
        <span style="color:rgb(0, 255, 255);">UPCHAIN</span>
        /
        <span style="color:rgb(255, 0, 255);">DOWNCHAIN</span>
        判定はなく、同じ文字数でも
        <span style="color:rgb(255, 255, 255);">DOUBLE ATTACK</span>
        となりません<br>
        　・画面上で
        <span style="color:rgb(0, 255, 0);">CONNECT</span>
        可能な単語の文字に同じ色のエフェクトが、現在
        <span style="color:rgb(0, 255, 0);">CONNECT</span>
        可能な単語に
        <span style="color:rgb(255, 255, 255);">ホワイト</span>
        のエフェクトがつきます<br>
      </div>
      `
    },
    {
      title: 'Nerfについて',
      content: `        
      <div style="font-size:1vw; line-height:4.5vh;">
        ・タイプミスをすると、入力フィールドが赤く光り、フィールド左側に
        <span style="color:rgba(180, 200, 255, 0.8);">Nerf</span>
        値が表示されます<br>
        ・
        <span style="color:rgba(180, 200, 255, 0.8);">Nerf</span>
        されると次の攻撃力から
        <span style="color:rgba(180, 200, 255, 0.8);">Nerf</span>
        値だけ減少させ、攻撃力が1以下になると相手に攻撃を送らなくなります<br>
        ・
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        があった場合は2減少し、CHAINBONUSが3の場合は2になります<br>
        ・
        <span style="color:rgba(180, 200, 255, 0.8);">Nerf</span>
        値は次の攻撃後に攻撃力を問わずリセットされます<br>
        ・
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        によって送られる攻撃や、
        <span style="color:rgb(255, 255, 255);">DOUBLE ATTACK</span>
        で2倍になった攻撃力のうち10以上の値は
        <span style="color:rgba(180, 200, 255, 0.8);">Nerf</span>
        対象になりません<br>
        ・
        <span style="color:rgba(180, 200, 255, 0.8);">Nerf</span>
        判定は、入力フィールドに表示されている文字の、1文字目から続く日本語部分がフィールドの単語と一致するかです<br>
        ・よってフィールドに「たいぷ」とあり、「たいぱ」のように入力した場合、
        <span style="color:rgba(180, 200, 255, 0.8);">Nerf</span>
        されます<br>
        ・しかし「tたいぺ」/「たいpf」/「たいpぱ」のように入力した場合は
        <span style="color:rgba(180, 200, 255, 0.8);">Nerf</span>
        されません<br>
        ・「たいぱぱ」と入力したあと、BackSpace を入力して「たいぱ」となった場合も
        <span style="color:rgba(180, 200, 255, 0.8);">Nerf</span>
        されます<br>
        ・
        <span style="color: rgba(255, 200, 50, 0.9);">CHAINBONUS</span>
        も減ってしまうので、2文字以上タイプミスした場合は文字をクリアするのも手です<br>
        ・スペースキーや時間経過によってフィールドに文字が追加された際にもその時点の入力に対して
        <span style="color:rgba(180, 200, 255, 0.8);">Nerf</span>
        判定が行われます<br>
      </div>
      `
    },
    {
      title: '英語モード',
      content: `
      <div style="font-size:1.2vw; line-height:4vh;">
        ・CONFIGからMODEをENGLISHにできます (以下、英語モードとします)<br>
        ・英語モードでは4-10文字の単語が出現します<br>
        ・攻撃相殺後、4未満になった相手の攻撃は消えます<br>
        ・攻撃相殺後、4未満になった自分の攻撃は消えます<br>
        ・英語モードでは、相手のモードにかかわらず、受ける攻撃力に+2されます<br>
        ・英語モードでは、相手のモードにかかわらず、与える攻撃力が-2されます<br>
        ・つまり、英語モード同士の対戦では通常の攻撃になり、日本語モード相手では難しくなります<br>
        ・これは日本語に対する入力量の差と、CONNECTしやすさのためです<br>
        ・スタイル「WORDCHAINER」は英語モードでの使用を前提としています<br>
        ・CPUは自分の入力モードと同じモードになります<br>
        ・ほかの仕様は日本語モードと同じです<br>
      </div>
      `
    },
    {
      title: '対戦の詳細仕様 (暇なら読んでください)',
      content: `
      <div style="font-size:1vw; line-height:2.9vh;">
        ・単語が追加される場所がフィールド、その下が入力フィールドで、プレイヤーは左側、対戦相手は右側です<br>
        ・フィールドには1行に1つずつ2-10文字の単語が追加され、開始時10個の単語が追加されます<br>
        ・タイプすると入力フィールドに文字が表示され、BacKSpace で1文字、 Delete/Ctrl で全ての文字がクリアされます<br>
        ・フィールドの単語をタイプするとその単語が消え、消した文字と同じ文字数(攻撃力)の単語が相手フィールドに送られます (攻撃)<br>
        ・CHAINBONUS は DOUBLE ATTACK 以外では攻撃力に合算されず、個別の攻撃となります<br>
        ・DOUBLE ATTACK / CHAINBONUSが10以上なら10ずつ使って攻撃し、攻撃力が10未満になった際は値が2以上の場合は攻撃します<br>
        ・DOUBLE ATTACK で10以上の超過攻撃後、残った攻撃力が10の場合は、ランダムな2回の攻撃に分けられます（ex.30->10+10+4+6）<br>
        ・攻撃すると相手フィールド左に、攻撃されると自分のフィールド左に送られた攻撃力が文字数とともに赤で表示されます<br>
        ・攻撃が送られた状態で自分が攻撃するとその攻撃力だけ送られた攻撃力を減らします(相殺)<br>
        ・相殺は同じ攻撃力があればそれを、なければ攻撃力が高い順に相殺し、相殺後2未満になるとその攻撃を無効化します<br>
        ・相殺後にこちらの攻撃力が2以上残っていれば攻撃しますが、そうでなければ相殺によって相手に攻撃は送られません<br>
        ・スペースキー押下時、もしくはフィールド下のプログレスバーで示す時間経過でフィールドに単語が追加されます<br>
        ・単語の追加は、攻撃を受けている場合はそれがすべて追加され、そうでない場合は、フィールド左のNEXTから単語が追加されます<br>
        ・時間経過の場合ゲーム開始後10秒で単語が追加され、5秒経過ごとに0.15秒ずつ加速し、最終的に2秒ごとに追加されます<br>
        ・スペースキー押下で単語を追加すると追加時間がリセットされます<br>
        ・NEXTに表示される単語は18回追加されるごとに2-10文字の9種類の長さのランダムな単語が各2回ずつ出現します<br>
        ・攻撃時にはNerf後の攻撃力がフィールドに表示され、相手の攻撃で単語がフィールドに21以上追加される場合フィールドが赤く点滅します<br>
        ・単語がフィールドに21以上追加されたら負けとなり、同時に2人が負けると上手く処理できず回線で勝敗が決まったりします<br>
      </div>
      `
    },
    {
      title: 'あとがき - ゲームについて',
      content: `        
      <div style="font-size:1vw; line-height:3.1vh;">
        なぜこのゲームを作ったかというと、まず
        <a href="https://ja.wikipedia.org/wiki/QWERTY%E9%85%8D%E5%88%97" target="_blank">QWERTY配列</a>
        をやめて
        <a href="https://o24.works/layout" target="_blank">大西配列</a>
        のタイピング練習をしていたら<br>
        「タイピングは音ゲー並みの入力量なのに、それを生かしたゲームスピードのタイピングゲームはないのでは」と考え<br>
        自分の中で早いゲームという印象が強い「
        <a href="https://tetr.io/" target="_blank">TETR.IO</a>
        」をモチーフにゲームが作れそうだと思ったからです<br>
        初めは高速で攻撃を送りあうゲームを考えていたのですが、途中からタイピングのためのタイピングゲームではなく<br>
        相殺するか、どの単語をタイプするか、タイプしない選択肢、それらの最適解
        を探すというのをこのゲームの本質にしようと思いました<br>
        モチーフがパズルゲームなのもありますが、パズル的思考が重要だと思ったためゲーム名を PUZZTYPE としました<br>
        当初考えていなかったのですが、その思考をより主軸とするため CONNECT システムを作りました<br>
        ゲームスピードは遅くなると思いましたが、対戦ゲームとしてはあるほうがいいと思います<br>
        ただ、フィールドサイズや出現する単語の文字数、追加時間、追加方法、相殺システム、何が最適なのかは謎<br>
        できればテトリスでミノを置けば次のミノが出るように、リソースの追加を完全自動にしたかったがアイデア不足...<br>
        デザインに関しても、同じ文字に同じ色のエフェクトをつけた結果、背景もカラフルにしないと浮いて見えてしまいました<br>
        音声も、
        <a href="https://freesound.org" target="_blank">freesound</a>
        のサンプルを数千は聞きましたが、既成のものでピッタリの SE はありませんでした<br>
        システムに関しては、対人ありきで作ってたので、先にCPUを作って対戦の調整をすべきでした<br>
        出題単語は8割趣味で一般性を欠きますが、「タイピングの例文はプロパガンダにピッタリ!」という
        <a href="https://o24.works/atc/" target="_blank">某タイピングゲーム</a>
        の例文にあるように、<br>
        聞いたことない単語を、ふとどこかで目にしたときの反応を期待してマニアックにしています<br>
        自分は
        <a href="https://sushida.net/play.html" target="_blank">寿司打</a>
        2万円/ 
        <a href="https://mikatype.github.io/MIKATYPE_JAVASCRIPT/index2.html" target="_blank">MIKATYPE</a>
        300文字がやっとなので、上手い人はCPUにどこまで勝てるのか気になります<br>
        <br>
      </div>
      `
    },
    {
      title: 'あとがき - その他',
      content: `
      <div style="font-size:1vw; line-height:2.7vh;">
        制作期間は2か月弱で、PUZZTYPEにおけるコード( 約7000行 )の9割くらいは<br>
        <a href="https://chatgpt.com" target="_blank">ChatGPT</a>
        と
        <a href="https://claude.ai/new" target="_blank">Claude</a>
        とかが作っています<br>
        サーバは
        <a href="https://render.com" target="_blank">Render</a>
        の無料枠を使っていますが、P2Pならサーバ借りずに作れる？らしいので作り方間違えたかも<br>
        <br>
        最も参考にした
        <a href="https://tetr.io" target="_blank">TETR.IO</a>
        は無料で遊べますが、実は未プレイです...<br><br>
        フォントについて、日本語の丸みは幾何学的、パズル的でないので合うフォントが少なかったです<br>
        この文章に使っているフォントの制作者が
        <a href="https://moji-waku.com/kenq/index.html" target="_blank">どういうことを考えてフォントを作っているのか</a>
        がとても面白かったです<br><br>
        それと、BGM作曲者watson氏が音楽を担当するフリーゲーム
        <a href="https://katatema.main.jp/mu" target="_blank">ムラサキ</a>
        、みんなもプレイしよう! ( Steamでも販売中! )<br>
        自分は以前
        <a href="https://plicy.net/GamePlay/175820" target="_blank">10パズル</a>
        というゲームを作っており、計算が好きなら遊んでみてください<br><br>
        このゲームの機能等について要望があればコメントください<br><br>
        <div style="font-size:0.8vw; line-height:2vh;">
        P.S.　 デバッグのために対戦してくれた merishiaru ありがとう!<br>
        P.P.S. せっかくいいキーボードを使ってる人は配列にもこだわって、既得権益に胡坐をかくQWERTY配列を市場から駆逐しよう!<br>
        　　　( この文やゲームの作成は途中からすべて
        <a href="https://o24.works/layout" target="_blank">大西配列</a>
        を使って記述してます )
      </div>      
        `
    },
    {
      title: '使用素材',
      content: `
      <div style="font-size:0.75vw; line-height:2vh;">   
      BGM　:      
      <a href="https://musmus.main.jp/" target="_blank"> MusMus (watson)</a><br>
      FONT :
      <a href="https://modi.jpn.org/font_senobi.php" target="_blank">せのびゴシック</a>
      /
      <a href="https://www.flopdesign.com/freefont/smartfont.html" target="_blank">スマートフォントUI</a>
      /
      <a href="https://www.flopdesign.com/syotai/yohaku.html" target="_blank">ヨハク</a>
      /
      <a href="https://fonts.google.com/specimen/Sawarabi+Mincho" target="_blank">さわらび明朝</a>
      /
      <a href="https://moji-waku.com/mamelon/index.html" target="_blank">マメロン</a>
      /
      <a href="https://yokutobanaitori.web.fc2.com/tegakifont.html#tegakifont4" target="_blank">にゃしぃフォント改二</a>
      /
      <a href="https://pm85122.onamae.jp/851Gkktt.html" target="_blank">851ゴチカクット</a>
      /
      <a href="https://moji-waku.com/makinas/index.html" target="_blank">マキナス4</a>
      /
      <a href="https://www.lazypolarbear.com/entry/kirin" target="_blank">キリンフォント</a>
      /
      <a href="https://www.lazypolarbear.com/zou" target="_blank">ゾウフォント</a>
      /
      <a href="https://apkadmin.com/3jl3bokx90dz/MADE_Evolve.mtz.html" target="_blank">MADE_Evolve</a><br>
      SE　　: <a href="https://freesound.org/people/Horn/sounds/9744" target="_blank">typewriter.wav by Horn -- https://freesound.org/s/9744/ -- License: Attribution NonCommercial 3.0</a><br>
      　　　　<a href="https://freesound.org/people/KorgMS2000B/sounds/54405/" target="_blank">Button Click.wav by KorgMS2000B -- https://freesound.org/s/54405/ -- License: Creative Commons 0</a><br>
      　　　　<a href="https://freesound.org/people/atari66/sounds/64119" target="_blank">beeps.wav by atari66 -- https://freesound.org/s/64119/ -- License: Sampling+</a><br>
      　　　　<a href="https://freesound.org/people/bubaproducer/sounds/107156" target="_blank">button 9 funny.wav by bubaproducer -- https://freesound.org/s/107156/ -- License: Attribution 4.0</a><br>
      　　　　<a href="https://freesound.org/people/noirenex/sounds/159399" target="_blank">Power Down by noirenex -- https://freesound.org/s/159399/ -- License: Creative Commons 0</a><br>
      　　　　<a href="https://freesound.org/people/jim-ph/sounds/194799" target="_blank">keyboard5.wav by jim-ph -- https://freesound.org/s/194799/ -- License: Creative Commons 0</a><br>
      　　　　<a href="https://freesound.org/people/unfa/sounds/240875" target="_blank">Anime jump / Loud Short SMS signal by unfa -- https://freesound.org/s/240875/ -- License: Creative Commons 0</a><br>
      　　　　<a href="https://freesound.org/people/farpro/sounds/264762" target="_blank">guiclick.ogg by farpro -- https://freesound.org/s/264762/ -- License: Creative Commons 0</a><br>
      　　　　<a href="https://freesound.org/people/LittleRobotSoundFactory/sounds/270548" target="_blank">Laser_04.wav by LittleRobotSoundFactory -- https://freesound.org/s/270548/ -- License: Attribution 4.0</a><br>
      　　　　<a href="https://freesound.org/people/LittleRobotSoundFactory/sounds/270551" target="_blank">Laser_07.wav by LittleRobotSoundFactory -- https://freesound.org/s/270551/ -- License: Attribution 4.0</a><br>
      　　　　<a href="https://freesound.org/people/magedu/sounds/277723" target="_blank">typewriter_electric_turn_off.wav by magedu -- https://freesound.org/s/277723/ -- License: Attribution 4.0</a><br>
      　　　　<a href="https://freesound.org/people/rhodesmas/sounds/342756" target="_blank">Failure 01 by rhodesmas -- https://freesound.org/s/342756/ -- License: Attribution 3.0</a><br>
      　　　　<a href="https://freesound.org/people/Julien_Matthey/sounds/346918/" target="_blank">JM_NOIZ_Laser 04.wav by Julien_Matthey -- https://freesound.org/s/346918/ -- License: Creative Commons 0</a><br>
      　　　　<a href="https://freesound.org/people/cabled_mess/sounds/360602" target="_blank">Typewriter snippet 02 by cabled_mess -- https://freesound.org/s/360602/ -- License: Creative Commons 0</a><br>
      　　　　<a href="https://freesound.org/people/bigmonmulgrew/sounds/378085/" target="_blank">mechanical key hard.wav by bigmonmulgrew -- https://freesound.org/s/378085/ -- License: Creative Commons 0</a><br>
      　　　　<a href="//https://freesound.org/people/broumbroum/sounds/50561/" target="_blank">sf3-sfx-menu-select.wav by broumbroum -- https://freesound.org/s/50561/ -- License: Attribution 3.0</a><br>
      　　　　<a href="https://freesound.org/people/mango777/sounds/547441" target="_blank">LazerCannon.ogg by mango777 -- https://freesound.org/s/547441/ -- License: Creative Commons 0</a><br>
      　　　　<a href="https://freesound.org/people/morganpurkis/sounds/577423" target="_blank">Zip Laser.wav by morganpurkis -- https://freesound.org/s/577423/ -- License: Creative Commons 0</a><br>
      　　　　<a href="https://freesound.org/people/Annyew/sounds/580116" target="_blank">Complete/obtained sound by Annyew -- https://freesound.org/s/580116/ -- License: Attribution 3.0</a><br>
      　　　　<a href="https://freesound.org/people/oysterqueen/sounds/582986" target="_blank">Low-battery.mp3 by oysterqueen -- https://freesound.org/s/582986/ -- License: Creative Commons 0</a><br>
      　　　　<a href="https://freesound.org/people/David819/sounds/668436/" target="_blank">win.mp3 by David819 -- https://freesound.org/s/668436/ -- License: Creative Commons 0</a><br>
      　　　　<a href="https://freesound.org/people/kreha/sounds/773604/" target="_blank">SmallClick by kreha -- https://freesound.org/s/773604/ -- License: Creative Commons 0</a><br>
      　　　　<a href="https://soundeffect-lab.info/sound/button/" target="_blank">効果音ラボ: カーソル移動2 / ビープ音4</a><br>
      　　　　<a href="https://commons.nicovideo.jp/works/nc312679" target="_blank">EMERGENCY 4 風biimシステム 16:9（1920x1080）</a><br>
      </div>      
      `
    },
  ];

  let currentPage = 0;

  // ページコンテンツの初期化
  function initializePages() {
    // コンテンツをクリア
    howToPlayContent.innerHTML = '';

    // ページコンテナを作成
    pages.forEach((page, index) => {
      const pageContainer = document.createElement('div');
      pageContainer.className = `page-container ${index === 0 ? 'active' : 'nextPage'}`;
      pageContainer.innerHTML = `
        <h2>${page.title}</h2>
        <div class="page-content">${page.content}</div>
      `;
      howToPlayContent.appendChild(pageContainer);
    });

    // ナビゲーションボタンを追加
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'page-buttons';
    buttonsContainer.innerHTML = `
      <button class="page-button prev-button" ${currentPage === 0 ? 'disabled' : ''}>Previous</button>
      <button class="page-button next-button" ${currentPage === pages.length - 1 ? 'disabled' : ''}>Next</button>
    `;
    howToPlayContent.appendChild(buttonsContainer);

    const pageButtons = document.querySelectorAll('.page-button');

    pageButtons.forEach(button => {
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

    // ページインジケーターを追加
    const indicatorContainer = document.createElement('div');
    indicatorContainer.className = 'page-indicator';
    indicatorContainer.innerHTML = pages.map((_, index) =>
      `<div class="page-dot ${index === currentPage ? 'active' : ''}"></div>`
    ).join('');
    howToPlayContent.appendChild(indicatorContainer);

    // イベントリスナーを設定
    setupPageNavigation();
  }

  // ページナビゲーションの設定
  function setupPageNavigation() {
    const prevButton = howToPlayContent.querySelector('.prev-button');
    const nextButton = howToPlayContent.querySelector('.next-button');
    const pageContainers = document.querySelectorAll('.page-container');
    const pageDots = document.querySelectorAll('.page-dot');

    prevButton.addEventListener('click', () => {
      if (currentPage > 0) {
        pageContainers[currentPage].classList.remove('active');
        pageContainers[currentPage].classList.add('nextPage');
        currentPage--;
        pageContainers[currentPage].classList.remove('prev');
        pageContainers[currentPage].classList.add('active');
        updateNavigation();
      }
    });

    nextButton.addEventListener('click', () => {
      if (currentPage < pages.length - 1) {
        pageContainers[currentPage].classList.remove('active');
        pageContainers[currentPage].classList.add('prev');
        currentPage++;
        pageContainers[currentPage].classList.remove('nextPage');
        pageContainers[currentPage].classList.add('active');
        updateNavigation();
      }
    });
  }

  // ナビゲーション状態の更新
  function updateNavigation() {
    const prevButton = howToPlayContent.querySelector('.prev-button');
    const nextButton = howToPlayContent.querySelector('.next-button');
    const pageDots = document.querySelectorAll('.page-dot');

    prevButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage === pages.length - 1;

    pageDots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentPage);
    });
  }

  // 初期化
  initializePages();
});

document.addEventListener('DOMContentLoaded', () => {
  const howToPlayWrapper = document.getElementById('howToPlayWrapper');
  const howToPlayButton = document.querySelector('.game-button.howToPlay');
  const closeHowToPlayButton = document.querySelector('.closeHowToPlay');

  // How To Playボタンクリック時の処理
  howToPlayButton.addEventListener('click', () => {
    if (gameState !== 'normal') {
      return;
    }
    gameState = 'howToPlay';
    howToPlayWrapper.classList.remove('closing');
    howToPlayWrapper.classList.add('active');
  });

  // Close HowToPlayボタンクリック時の処理
  closeHowToPlayButton.addEventListener('click', () => {
    howToPlayWrapper.classList.add('closing');
    gameState = 'normal'

    // アニメーション完了後にclassを削除
    setTimeout(() => {
      howToPlayWrapper.classList.remove('active', 'closing');
    }, 500);
  });
});

// ボタン要素を全て取得
const gameButtons = document.querySelectorAll('.toUseSE');

// 各ボタンにイベントリスナーを追加
gameButtons.forEach(button => {
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

let currentIndexState;
let currentfontState;
let currentBGMState;
let currentTypeSoundState;
let currentMissTypeSoundState;
let currentDeleteSoundState;
let currentAddWordSoundState;
let currentAttackSoundState;
let currentWarningSoundState;
let currentCountdownSoundState;
let currentGameOverSoundState;
let currentButtonSoundState;
let currentAskVideoState;

document.addEventListener('DOMContentLoaded', () => {
  selectedCategory = localStorage.getItem('modeState') || 'JAPANESE';
  interval = localStorage.getItem('intervalState') || 'NORMAL';
  currentIndexState = localStorage.getItem('styleState')
    ? styleKeys.indexOf(localStorage.getItem('styleState'))
    : 0;
  currentKey = styleKeys[currentIndexState];
  currentfontState = localStorage.getItem('fontState') || 'ヨハク';
  currentGridHorizonState = localStorage.getItem('gridHorizonState') || 'VALID';
  currentGridVerticalState = localStorage.getItem('gridVerticalState') || 'INVALID';
  document.documentElement.style.setProperty("--font-family-next", currentfontState);
  currentBGMState = localStorage.getItem('BGMState') || 'Consecutive Battle';
  currentTypeSoundState = localStorage.getItem('TypeSoundState') || 'type1';
  currentMissTypeSoundState = localStorage.getItem('MissTypeSoundState') || 'VALID';
  currentDeleteSoundState = localStorage.getItem('DeleteSoundState') || 'VALID';
  currentAddWordSoundState = localStorage.getItem('AddWordSoundState') || 'VALID';
  currentAttackSoundState = localStorage.getItem('AttackSoundState') || 'VALID';
  currentWarningSoundState = localStorage.getItem('WarningSoundState') || 'VALID';
  currentCountdownSoundState = localStorage.getItem('CountdownSoundState') || 'VALID';
  currentGameOverSoundState = localStorage.getItem('GameOverSoundState') || 'VALID';
  currentButtonSoundState = localStorage.getItem('ButtonSoundState') || 'VALID';
  currentAskVideoState = localStorage.getItem('askVideoState') || 'VALID';

  intervalRight.textContent = interval;
  intervalButton.addEventListener('click', toggleIntervalState);

  modeRight.textContent = selectedCategory;
  modeButton.addEventListener('click', toggleModeState);

  // styleRight.textContent = `${styles[styleKeys[currentIndexState]]}`;
  // styleLeft.textContent = `${styleKeys[currentIndexState]}`;
  styleRight.textContent = `${styleKeys[currentIndexState]}`;
  playerStyle.textContent = `${currentKey}`;
  styleButton.addEventListener('click', toggleStyleState);

  fontRight.textContent = currentfontState;
  fontButton.addEventListener('click', toggleFontState);

  gridHorizonRight.textContent = currentGridHorizonState;
  gridHorizonButton.addEventListener('click', toggleGridHorizonState);

  gridVerticalRight.textContent = currentGridVerticalState;
  gridVerticalButton.addEventListener('click', toggleGridVerticalState);

  // BGMLeft.textContent = 'BGM :';
  BGMRight.textContent = currentBGMState;
  BGMButton.addEventListener('click', toggleBGMState);

  // typeSELeft.textContent = 'TYPE SOUND :';
  typeSERight.textContent = currentTypeSoundState;
  typeSEButton.addEventListener('click', toggleTypeSoundState);

  // misstypeSELeft.textContent = 'MISSTYPE SOUND :';
  misstypeSERight.textContent = currentMissTypeSoundState;
  missTypeSEButton.addEventListener('click', toggleMissTypeSoundState);

  // deleteSELeft.textContent = 'DELETE SOUND :'
  deleteSERight.textContent = currentDeleteSoundState;
  deleteSEButton.addEventListener('click', toggleDeleteSoundState);

  // addWordSELeft.textContent = 'ADDWORD SOUND :'
  addWordSERight.textContent = currentAddWordSoundState;
  addWordSEButton.addEventListener('click', toggleAddWordSoundState);

  // attackSELeft.textContent = 'ATTACK SOUND :'
  attackSERight.textContent = currentAttackSoundState;
  attackSEButton.addEventListener('click', toggleAttackSoundState);

  // warningSELeft.textContent = 'WARNING SOUND :'
  warningSERight.textContent = currentWarningSoundState;
  warningSEButton.addEventListener('click', toggleWarningSoundState);

  // countdownSELeft.textContent = 'COUNTDOWN SOUND :';
  countdownSERight.textContent = currentCountdownSoundState;
  countdownSEButton.addEventListener('click', toggleCountdownSoundState);

  // gameOverSELeft.textContent = 'GAMEOVER SOUND :';
  gameOverSERight.textContent = currentGameOverSoundState;
  gameOverSEButton.addEventListener('click', toggleGameOverSoundState);

  // buttonSELeft.textContent = 'BUTTON SOUND :';
  buttonSERight.textContent = currentButtonSoundState;
  buttonSEButton.addEventListener('click', toggleButtonSoundState);

  askVideoRight.textContent = currentAskVideoState;
  askVideoButton.addEventListener('click', toggleAskVideoState);

  const configWrapper = document.getElementById('configWrapper');
  const configBtn = document.querySelector('.game-button.config');
  const closeConfigBtn = document.querySelector('.configButtons.closeConfig');
  const configButtons = document.querySelectorAll('.configButtons');

  // ボタンごとにインデックスを設定
  configButtons.forEach((button, index) => {
    button.style.setProperty('--button-index', index);
  });

  // Configボタンクリック時の処理
  configBtn.addEventListener('click', () => {
    if (gameState !== 'normal') {
      return;
    }
    configWrapper.classList.remove('closing');
    configWrapper.classList.add('active');
    gameState = 'config';
  });

  // Close Configボタンクリック時の処理
  closeConfigBtn.addEventListener('click', () => {
    configWrapper.classList.add('closing');
    gameState = 'normal';
    soundManager.stop('Consecutive Battle');
    soundManager.stop('Lightning Brain');
    soundManager.stop('R.E.B.O.R.N');
    isPlaying = false;

    // 背景のフェードアウトを遅らせる
    setTimeout(() => {
      configWrapper.classList.remove('active');
    }, 600); // ボタンのアニメーションが終わる頃に背景もフェードアウト

    // 完全に非表示にする前に全てのアニメーションを完了させる
    setTimeout(() => {
      configWrapper.classList.remove('closing');
    }, 600);
  });

  if (window.MoviePlayer && typeof window.MoviePlayer.askOnGameStart === 'function') {
    try { window.MoviePlayer.askOnGameStart(); } catch (_) { /* ignore */ }
  }
});

const styleRight = document.getElementById('styleRight');
// const styleLeft = document.getElementById('styleLeft');
const styleButton = document.querySelector('.configButtons.style');

const playerStyle = document.getElementById('playerStyle');
const opponentStyle = document.getElementById('opponentStyle');

let styles = {
  'NORMAL STYLE': "CLASSIC ABILITY",
  'MUSCLE': "DBL-ATK ONLY & ×3 / MISS PENALTY UP",
  'REFLECTOR': "OFFSET ×2 / REFLECT / DAMAGE 50% ×2",
  'TECHNICIAN': "OBSTRUCT USING BONUS OR ATK",
  'GAMBLER': "ATK 25% -> SELF-ATK / MISS / ×2 / ×3",
  'OPTIMIST': "BONUS UP & LIMITED / NO MISS PENALTY",
  'WORDCHAINER': "CONNECT ONLY ATK 20 & BONUS +5",
};

let styleKeys = Object.keys(styles);
let currentKey;

function toggleStyleState() {
  currentIndexState = (currentIndexState + 1) % styleKeys.length;
  currentKey = styleKeys[currentIndexState];

  localStorage.setItem('styleState', currentKey);

  // styleRight.textContent = `${styles[currentKey]}`;
  // styleLeft.textContent = `${currentKey}`;
  styleRight.textContent = `${currentKey}`;
  playerStyle.textContent = `${currentKey}`;
}

const intervalRight = document.getElementById('intervalRight');
const intervalButton = document.querySelector('.configButtons.interval');

let interval = "NORMAL"

function toggleIntervalState() {
  switch (interval) {
    case 'NORMAL':
      interval = 'SUDDEN DEATH (1s)';
      break;
    case 'SUDDEN DEATH (1s)':
      interval = 'PEACEFUL (10s)';
      break;
    case 'PEACEFUL (10s)':
      interval = 'NOTHING';
      break;
    case 'NOTHING':
      interval = 'NORMAL';
      break;
  }
  localStorage.setItem('intervalState', interval);
  intervalRight.textContent = interval;
}

const modeRight = document.getElementById('modeRight');
const modeButton = document.querySelector('.configButtons.mode');

function toggleModeState() {
  switch (selectedCategory) {
    case 'JAPANESE':
      selectedCategory = 'ENGLISH';
      break;
    case 'ENGLISH':
      selectedCategory = 'JAPANESE';
      break;
  }
  localStorage.setItem('modeState', selectedCategory);
  modeRight.textContent = selectedCategory;
}

// BGMの状態を管理するグローバル変数
const fontRight = document.getElementById('fontRight');
const fontButton = document.querySelector('.configButtons.font');
// let currentfontState = 'せのびゴシック';

// フォント切り替え用の関数
function toggleFontState() {
  // fontの状態を切り替え
  switch (currentfontState) {
    case 'せのびゴシック':
      currentfontState = 'スマートフォントUI';
      break;
    case 'スマートフォントUI':
      currentfontState = 'ヨハク';
      break;
    case 'ヨハク':
      currentfontState = 'さわらび明朝';
      break;
    case 'さわらび明朝':
      currentfontState = 'マメロン';
      break;
    case 'マメロン':
      currentfontState = 'にゃしぃフォント改二';
      break;
    case 'にゃしぃフォント改二':
      currentfontState = 'せのびゴシック';
      break;
  }
  localStorage.setItem('fontState', currentfontState);
  document.documentElement.style.setProperty("--font-family-next", currentfontState);
  fontRight.textContent = currentfontState;
  return currentfontState;
}

const gridHorizonRight = document.getElementById('gridHorizonRight');
const gridHorizonButton = document.querySelector('.configButtons.gridHorizon');

function toggleGridHorizonState() {
  if (currentGridHorizonState === 'VALID') {
    currentGridHorizonState = 'INVALID'
  } else {
    currentGridHorizonState = 'VALID'
  }
  localStorage.setItem('gridHorizonState', currentGridHorizonState);
  gridHorizonRight.textContent = currentGridHorizonState;
}

const gridVerticalRight = document.getElementById('gridVerticalRight');
const gridVerticalButton = document.querySelector('.configButtons.gridVertical');

function toggleGridVerticalState() {
  if (currentGridVerticalState === 'VALID') {
    currentGridVerticalState = 'INVALID'
  } else {
    currentGridVerticalState = 'VALID'
  }
  localStorage.setItem('gridVerticalState', currentGridVerticalState);
  gridVerticalRight.textContent = currentGridVerticalState;
}


// const BGMLeft = document.getElementById('BGMLeft');
const BGMRight = document.getElementById('BGMRight');
const BGMButton = document.querySelector('.configButtons.BGM');
// let currentBGMState = 'Consecutive Battle';

// BGM切り替え用の関数
function toggleBGMState() {

  // BGMの状態を切り替え
  switch (currentBGMState) {
    case 'Consecutive Battle':
      currentBGMState = 'Lightning Brain';
      break;
    case 'Lightning Brain':
      currentBGMState = 'R.E.B.O.R.N';
      break;
    case 'R.E.B.O.R.N':
      currentBGMState = 'OFF';
      break;
    case 'OFF':
      currentBGMState = 'Consecutive Battle';
      break;
  }
  localStorage.setItem('BGMState', currentBGMState);
  BGMRight.textContent = currentBGMState;
  return currentBGMState;
}

// const typeSELeft = document.getElementById('typeSELeft');
const typeSERight = document.getElementById('typeSERight');
const typeSEButton = document.querySelector('.configButtons.typeSE');
// let currentTypeSoundState = 'type1';

function toggleTypeSoundState() {

  switch (currentTypeSoundState) {
    case 'type1':
      currentTypeSoundState = 'type2';
      break;
    case 'type2':
      currentTypeSoundState = 'type3';
      break;
    case 'type3':
      currentTypeSoundState = 'type4';
      break;
    case 'type4':
      currentTypeSoundState = 'type5';
      break;
    case 'type5':
      currentTypeSoundState = 'type6';
      break;
    case 'type6':
      currentTypeSoundState = 'type7';
      break;
    case 'type7':
      currentTypeSoundState = 'type8';
      break;
    case 'type8':
      currentTypeSoundState = 'OFF';
      break;
    case 'OFF':
      currentTypeSoundState = 'type1';
      break;
  }

  // typeSELeft.textContent = 'TYPE SOUND(listen here):';
  localStorage.setItem('TypeSoundState', currentTypeSoundState);
  typeSERight.textContent = currentTypeSoundState;
  return currentTypeSoundState;
}

// const misstypeSELeft = document.getElementById('misstypeSELeft');
const misstypeSERight = document.getElementById('misstypeSERight');
const missTypeSEButton = document.querySelector('.configButtons.misstypeSE');
// let currentMissTypeSoundState = 'VALID';

function toggleMissTypeSoundState() {
  if (currentMissTypeSoundState === 'VALID') {
    currentMissTypeSoundState = 'INVALID'
  } else {
    currentMissTypeSoundState = 'VALID'
  }
  // misstypeSELeft.textContent = 'MISSTYPE SOUND :';
  localStorage.setItem('MissTypeSoundState', currentMissTypeSoundState);
  misstypeSERight.textContent = currentMissTypeSoundState;
  return currentMissTypeSoundState;
}

// const deleteSELeft = document.getElementById('deleteSELeft');
const deleteSERight = document.getElementById('deleteSERight');
const deleteSEButton = document.querySelector('.configButtons.deleteSE');
// let currentDeleteSoundState = 'VALID';

function toggleDeleteSoundState() {
  if (currentDeleteSoundState === 'VALID') {
    currentDeleteSoundState = 'INVALID'
  } else {
    currentDeleteSoundState = 'VALID'
  }
  // deleteSELeft.textContent = 'DELETE SOUND :';
  localStorage.setItem('DeleteSoundState', currentDeleteSoundState);
  deleteSERight.textContent = currentDeleteSoundState;
  return currentDeleteSoundState;
}

// const addWordSELeft = document.getElementById('addWordSELeft');
const addWordSERight = document.getElementById('addWordSERight');
const addWordSEButton = document.querySelector('.configButtons.addWordSE');
// let currentAddWordSoundState = 'VALID';

function toggleAddWordSoundState() {
  if (currentAddWordSoundState === 'VALID') {
    currentAddWordSoundState = 'INVALID'
  } else {
    currentAddWordSoundState = 'VALID'
  }
  // addWordSELeft.textContent = 'ADDWORD SOUND :';
  localStorage.setItem('AddWordSoundState', currentAddWordSoundState);
  addWordSERight.textContent = currentAddWordSoundState;
  return currentAddWordSoundState;
}

// const attackSELeft = document.getElementById('attackSELeft');
const attackSERight = document.getElementById('attackSERight');
const attackSEButton = document.querySelector('.configButtons.attackSE');
// let currentAttackSoundState = 'VALID';

function toggleAttackSoundState() {
  if (currentAttackSoundState === 'VALID') {
    currentAttackSoundState = 'INVALID'
  } else {
    currentAttackSoundState = 'VALID'
  }
  // attackSELeft.textContent = 'ATTACK SOUND :';
  localStorage.setItem('AttackSoundState', currentAttackSoundState);
  attackSERight.textContent = currentAttackSoundState;
  return currentAttackSoundState;
}


// const warningSELeft = document.getElementById('warningSELeft');
const warningSERight = document.getElementById('warningSERight');
const warningSEButton = document.querySelector('.configButtons.warningSE');
// let currentWarningSoundState = 'VALID';

function toggleWarningSoundState() {
  if (currentWarningSoundState === 'VALID') {
    currentWarningSoundState = 'INVALID'
  } else {
    currentWarningSoundState = 'VALID'
  }
  // warningSELeft.textContent = 'WARNING SOUND :';
  localStorage.setItem('WarningSoundState', currentWarningSoundState);
  warningSERight.textContent = currentWarningSoundState;
  return currentWarningSoundState;
}

// const countdownSELeft = document.getElementById('countdownSELeft');
const countdownSERight = document.getElementById('countdownSERight');
const countdownSEButton = document.querySelector('.configButtons.countdownSE');
// let currentCountdownSoundState = 'VALID';

function toggleCountdownSoundState() {
  if (currentCountdownSoundState === 'VALID') {
    currentCountdownSoundState = 'INVALID'
  } else {
    currentCountdownSoundState = 'VALID'
  }
  // countdownSELeft.textContent = 'COUNTDOWN SOUND :';
  localStorage.setItem('CountdownSoundState', currentCountdownSoundState);
  countdownSERight.textContent = currentCountdownSoundState;
  return currentCountdownSoundState;
}

// const gameOverSELeft = document.getElementById('gameOverSELeft');
const gameOverSERight = document.getElementById('gameOverSERight');
const gameOverSEButton = document.querySelector('.configButtons.gameOverSE');
// let currentGameOverSoundState = 'VALID';

function toggleGameOverSoundState() {

  if (currentGameOverSoundState === 'VALID') {
    currentGameOverSoundState = 'INVALID'
  } else {
    currentGameOverSoundState = 'VALID'
  }
  // gameOverSELeft.textContent = 'GAMEOVER SOUND :';
  localStorage.setItem('GameOverSoundState', currentGameOverSoundState);
  gameOverSERight.textContent = currentGameOverSoundState;
  return currentGameOverSoundState;
}

// const buttonSELeft = document.getElementById('buttonSELeft');
const buttonSERight = document.getElementById('buttonSERight');
const buttonSEButton = document.querySelector('.configButtons.buttonSE');
// let currentButtonSoundState = 'VALID';

function toggleButtonSoundState() {
  if (currentButtonSoundState === 'VALID') {
    currentButtonSoundState = 'INVALID'
  } else {
    currentButtonSoundState = 'VALID'
  }
  // buttonSELeft.textContent = 'BUTTON SOUND :';
  localStorage.setItem('ButtonSoundState', currentButtonSoundState);
  buttonSERight.textContent = currentButtonSoundState;
  return currentButtonSoundState;
}

const askVideoRight = document.getElementById('askVideoRight');
const askVideoButton = document.querySelector('.configButtons.askVideo');

function toggleAskVideoState() {
  if (currentAskVideoState === 'VALID') {
    currentAskVideoState = 'INVALID'
  } else {
    currentAskVideoState = 'VALID'
  }
  localStorage.setItem('askVideoState', currentAskVideoState);
  askVideoRight.textContent = currentAskVideoState;
  return currentAskVideoState;
}

let CELL_SIZE = 30;
// CELL_SIZE = calculateCellSize();

// セルサイズを計算する関数
function calculateCellSize() {
  const maxFieldWidth = window.innerWidth * 0.5; // 画面幅の40%をフィールドの最大幅に設定
  const maxFieldHeight = window.innerHeight * 0.65; // 画面高さの80%をフィールドの最大高さに設定

  // 各セルのサイズを決定（横方向と縦方向の比率を保つ）
  const cellWidth = maxFieldWidth / FIELD_WIDTH;
  const cellHeight = maxFieldHeight / FIELD_HEIGHT;

  // 最小値を採用してセルが画面内に収まるようにする
  return Math.min(cellWidth, cellHeight);
}

function setWordPool() {
  if (wordPool.length === 0) {
    for (let x = 0; x < 5; x++) {
      wordPool.push(getRandomWordForField(playerUsedLengths));
    }
  } else {
    wordPool = [];
    for (let x = 0; x < 5; x++) {
      wordPool.push(getRandomWordForField(playerUsedLengths));
    }
  }
}

// フィールドに単語を追加する関数
// 攻撃を受けていた場合はその値を、そうでなければプールから追加するため
// updateFieldAfterReceiveOffset内で使用
function moveWordToField(fieldWords) {
  let toPutFieldWord = wordPool.shift();
  fieldWords.push(toPutFieldWord);
  wordPool.push(getRandomWordForField(playerUsedLengths));

  // FieldWords を文字数昇順で並び替え
  fieldWords.sort((a, b) => b.length - a.length);
}

const colors = [
  "rgba(255, 0, 0, 0.3)",    // Bright Red
  "rgba(0, 255, 0, 0.3)",    // Bright Green
  "rgba(80, 80, 255, 0.3)",    // Bright Blue
  "rgba(255, 255, 0, 0.3)",  // Bright Yellow
  "rgba(255, 0, 255, 0.3)",  // Bright Magenta
  "rgba(0, 255, 255, 0.3)",  // Bright Cyan
  "rgba(255, 165, 0, 0.3)",  // Bright Orange
  "rgba(128, 0, 128, 0.3)",  // Purple
  "rgba(128, 128, 0, 0.3)",  // Olive
  "rgba(128, 0, 0, 0.3)",    // Maroon
  "rgba(0, 128, 0, 0.3)",    // Dark Green
  "rgba(0, 128, 128, 0.3)",  // Teal
  "rgba(0, 0, 128, 0.3)",    // Navy Blue
  "rgba(220, 20, 60, 0.3)",  // Crimson
  "rgba(255, 69, 0, 0.3)",   // Red-Orange
  "rgba(60, 179, 113, 0.3)", // Medium Sea Green
  "rgba(106, 90, 205, 0.3)", // Slate Blue
  "rgba(75, 0, 130, 0.3)",   // Indigo
  "rgba(218, 112, 214, 0.3)",// Orchid
  "rgba(139, 69, 19, 0.3)"   // Saddle Brown
];


// 色キャッシュ用のMap
const charColorMap = new Map();

// 使用されている色を把握
const usedColors = new Set([...charColorMap.values()].map((color) => color.baseColor));

// 色付き文字を生成する関数
function generateStyledCharacters(word, matchingChars, lastChar) {
  return word.split("").map((char, index) => {
    // 正規化した文字を使用
    const normalizedChar = normalizeHiragana(char);

    let baseColor = "";
    let borderColor = "";

    // charColorMap に既存の色があればそれを使用
    if (charColorMap.has(normalizedChar)) {
      ({ baseColor, borderColor } = charColorMap.get(normalizedChar));
    } else {
      // 新しい色を計算し保存
      const colorIndex = matchingChars.indexOf(normalizedChar);
      if (colorIndex !== -1) {
        baseColor = colors[colorIndex % colors.length];
        const rgbaMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        const [r, g, b] = rgbaMatch.slice(1).map(Number);
        borderColor = `rgba(${Math.max(r - 20, 0)}, ${Math.max(g - 20, 0)}, ${Math.max(b - 20, 0)}, 0.6)`;

        // charColorMap に保存
        charColorMap.set(normalizedChar, { baseColor, borderColor });
      }
    }

    // 先頭文字が一致かつ lastChar と同じ場合
    if (index === 0 && normalizedChar === lastChar) {
      return `
      <div class="aura-container" style="--aura-color: rgba(255, 255, 255, 0.3); --aura-border-color: rgba(255, 255, 255, 1);">
        <span class="character">${char}</span>
      </div>
    `;
    }
    // 最初の文字が一致（lastChar のチェックはなし）
    if (index === 0 && baseColor) {
      return `
      <div class="aura-container" style="--aura-color: ${baseColor}; --aura-border-color: ${borderColor}">
        <span class="character">${char}</span>
      </div>
    `;
    }

    // 最後の文字が一致
    if (index === word.length - 1 && baseColor) {
      return `
      <div class="aura-container" style="--aura-color: ${baseColor}; --aura-border-color: ${borderColor}">
        <span class="character">${char}</span>
      </div>
    `;
    }

    // マッチしない文字は通常表示
    return `<span class="character">${char}</span>`;
  }).join("");
}

// 色インデックスを計算する関数（文字コードを基に計算）
function calculateColorIndex(char) {
  // 文字コードの合計を用いてインデックスを生成
  const charCodeSum = [...char].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return charCodeSum;
}

// Next表示用の関数
function updateNextDisplay(words, isPlayer = true) {
  const prefix = isPlayer ? 'player' : 'opponent';

  // 一致する文字を取得
  const combinedWords = [...playerFieldWords.filter(word => word !== attackWord), ...wordPool];
  const matchingChars = getMatchingStartAndEndLetters(combinedWords).map(normalizeHiragana);

  // キャッシュを更新：前回のmatchingCharsを保持する
  matchingChars.forEach((char) => {
    if (!charColorMap.has(char)) {
      // 未使用の色を選択
      const availableColors = colors.filter((color) => !usedColors.has(color));
      const baseColor = availableColors[0] || colors[0];
      const rgbaMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
      const [r, g, b] = rgbaMatch.slice(1).map(Number);
      const borderColor = `rgba(${Math.max(r - 20, 0)}, ${Math.max(g - 20, 0)}, ${Math.max(b - 20, 0)}, 1)`;

      charColorMap.set(char, { baseColor, borderColor });
      usedColors.add(baseColor); // 新しく使用した色を追跡
    }
  });

  // charColorMap を更新：matchingChars に含まれない文字を削除
  // for (const [key] of charColorMap) {
  //   if (!matchingChars.includes(key)) {
  //     charColorMap.delete(key);
  //     usedColors.delete(baseColor);
  //   }
  // }

  const existingKeys = new Set(matchingChars);

  for (const [key, { baseColor }] of charColorMap.entries()) {
    if (!existingKeys.has(key)) {
      // 使っていた色を解放
      usedColors.delete(baseColor);
      // charColorMap から削除
      charColorMap.delete(key);
    }
  }


  // 5つのNextを表示
  for (let i = 1; i <= 5; i++) {
    const nextElement = document.getElementById(`${prefix}Next${i}`);
    const word = words[i - 1];
    if (!word) continue;

    const styledWord = generateStyledCharacters(word, matchingChars, lastChar);
    nextElement.innerHTML = styledWord;
  }

  // プレイヤーの場合、相手に情報を送信
  if (isPlayer && socket) {
    const styledWords = words.map((word) => generateStyledCharacters(word, matchingChars, lastChar));
    updateAllNextGradients(wordPool, true);

    socket.emit('nextWordsUpdate', {
      words: words,
      styledWords: styledWords
    });
  }
}

// // グラデーションの色を定義
// const GRADIENT_COLORS = {
//   LONGER_WORD: {
//     r: 0,
//     g: 125,
//     b: 230  // 青色 (lightblue)
//   },
//   SHORTER_WORD: {
//     r: 144,
//     g: 238,
//     b: 144  // 緑色 (lightgreen)
//   }
// };

// // グラデーションの透明度を定義
// const GRADIENT_OPACITY = {
//   CENTER: 0.05,
//   MIDDLE: 0.1,
//   EDGE: 0.3
// };

// グローバル変数でグラデーションスタイルを管理
let playerGradientStyles = Array(5).fill('');
let opponentGradientStyles = Array(5).fill('');

// グラデーションスタイルを生成する関数（横長用）
// function createGradientStyle(colorType) {
//   const color = GRADIENT_COLORS[colorType];
//   const rgbaEdge = `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.EDGE})`;
//   const rgbaMiddle = `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.MIDDLE})`;
//   const rgbaCenter = `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.CENTER})`;

//   // 横長のグラデーションを作成
//   return `
//     background: linear-gradient(to right, 
//       ${rgbaEdge} 0%, 
//       ${rgbaMiddle} 10%, 
//       ${rgbaCenter} 50%, 
//       ${rgbaMiddle} 90%, 
//       ${rgbaEdge} 100%);
//   `;
// }


// Next要素のグラデーション背景を更新する関数
function updateNextElementGradient(prefix, index, wordLength) {
  const nextElement = document.getElementById(`${prefix}Next${index}`);
  if (!nextElement || !wordLength) return;

  const lengthDiff = wordLength - memorizeLastAttackValue;
  let gradientStyle = '';
  if (lengthDiff === 0) {
    // DownAttack攻撃
    gradientStyle = 'background-color: rgb(120, 120, 120);';
  } else if (lengthDiff === 1) {
    // gradientStyle = createGradientStyle('LONGER_WORD');
    // DownChain攻撃
    gradientStyle = 'background: rgba(120, 0, 120, 1)';
  } else if (lengthDiff === -1) {
    // gradientStyle = createGradientStyle('SHORTER_WORD');
    // UpChain攻撃
    gradientStyle = 'background: rgba(0, 120, 120, 1)';
  } else {
    gradientStyle = 'background-color: rgba(5, 7, 19, 0.7);';
  }

  nextElement.style = gradientStyle;
  // nextElement.style.border = 'solid 2px rgba(${color.r}, ${color.g}, ${color.b})'
  return gradientStyle;
}

// 全てのNext要素のグラデーションを更新し、相手画面と同期する関数
function updateAllNextGradients(words, isPlayer = true) {
  const prefix = isPlayer ? 'player' : 'opponent';
  const gradientStyles = [];

  // 自分の画面のNext要素を更新
  for (let i = 1; i <= 5; i++) {
    const word = words[i - 1];
    const gradientStyle = updateNextElementGradient(prefix, i, word?.length);
    gradientStyles.push(gradientStyle || '');
  }

  if (isPlayer) {
    playerGradientStyles = [...gradientStyles];
  } else {
    opponentGradientStyles = [...gradientStyles];
  }

  // プレイヤーの操作の場合のみ、相手画面の同期を行う
  if (isPlayer && socket) {
    // 相手画面のNext要素を更新するためのイベントを発行
    socket.emit('syncOpponentGradients', {
      gradientStyles: gradientStyles
    });
  }

  return gradientStyles;
}


// checkAndRemoveWordからのみ呼び出され、単語を削除後、再描画する
function updateField(field, fieldWords) {
  // console.log("updateField実行");
  if (gameState !== 'playing') return;
  clearField(field);

  let row = FIELD_HEIGHT - 1;
  for (const word of fieldWords) {
    let col = 0;
    for (const char of word) {
      if (col >= FIELD_WIDTH) {
        row--;
        col = 0;
      }
      field[row][col] = { word: char, isHighlighted: false };
      col++;
    }
    row--;
  }
  syncFieldUpdate();
}

function updateFieldAfterReceiveOffset(field, fieldWords) {
  // console.log("updateFieldAfterReceiveOffset実行");
  // console.log("与えた攻撃:" + playerAttackValueToOffset);
  // console.log("受けた攻撃:" + playerReceiveValueToOffset);

  // calcReceiveOffset();
  // console.log("相殺後は:" + playerReceiveValueToOffset);

  if (playerReceiveValueToOffset.length === 0) {
    moveWordToField(fieldWords)
  }

  const soundCount = playerReceiveValueToOffset.length;
  const delayBetweenSounds = 70;
  if (currentAttackSoundState === 'VALID') {
    for (let i = 0; i < soundCount; i++) {
      setTimeout(() => {
        soundManager.playSound('receiveAttack', { volume: 0.5 });
      }, i * delayBetweenSounds);
    }
  }

  for (let x = 0; x < playerReceiveValueToOffset.length; x++) {
    let addFieldWord = getRandomWordForAttack(playerReceiveValueToOffset[x]);
    fieldWords.push(addFieldWord);
    // console.log("addFieldWordは:" + addFieldWord);
  }

  playerAttackValueToOffset = 0;
  playerReceiveValueToOffset = [];
  calcReceiveOffsetToDisplay();
  drawStatusField(ctxPlayerStatus, true);

  // FieldWords を文字数昇順で並び替え
  fieldWords.sort((a, b) => b.length - a.length);

  clearField(field);

  // 単語をフィールドに左詰めで配置
  let row = FIELD_HEIGHT - 1; // 下から配置
  for (const word of fieldWords) {
    let col = 0; // 左端から配置
    for (const char of word) {
      if (col >= FIELD_WIDTH) {
        row--; // 次の行に移動
        col = 0;
      }
      if (row === 0) {
        field[row][col] = { word: char, isHighlighted: false };
        col++;
      } else if (row < 0) {
        if (gameState === 'ended') return;

        drawField(ctxPlayer, playerField, memorizeLastAttackValue);

        // console.log("描写する行が上限を突破したためdrawField");

        syncFieldUpdate();
        handleGameOver(true);

        socket.emit('gameOver', { loserId: playerId });

        return;

      } else {
        // console.log(word + "描画");
        field[row][col] = { word: char, isHighlighted: false };
        col++;
      }
    }
    row--; // 次の単語を下の行に配置
  }

  // Next表示を更新
  updateNextDisplay(wordPool);
  highlightMatchingCells(playerField);

  syncFieldUpdate();
}

// ひらがなの大文字・小文字を正規化する関数
function normalizeHiragana(char) {
  const smallToLargeMap = {
    "ぁ": "あ", "ぃ": "い", "ぅ": "う", "ぇ": "え", "ぉ": "お",
    "ゃ": "や", "ゅ": "ゆ", "ょ": "よ", "ゎ": "わ",
    "っ": "つ", "ゕ": "か", "ゖ": "け"
  };
  return smallToLargeMap[char] || char; // 小文字なら変換、大文字はそのまま
}


function getMatchingStartAndEndLetters(combinedWords) {
  const startMap = new Map(); // 各文字の先頭での出現位置を記録
  const endMap = new Map();   // 各文字の終了での出現位置を記録

  // 各単語の先頭文字と終了文字を収集
  combinedWords.forEach((word, index) => {
    if (word.length === 0) return; // 空文字列は無視
    const startChar = normalizeHiragana(word[0]); // 先頭文字を正規化
    const endChar = normalizeHiragana(word[word.length - 1]); // 終了文字を正規化

    // 先頭文字の出現位置を記録
    if (!startMap.has(startChar)) {
      startMap.set(startChar, []);
    }
    startMap.get(startChar).push(index);

    // 終了文字の出現位置を記録
    if (!endMap.has(endChar)) {
      endMap.set(endChar, []);
    }
    endMap.get(endChar).push(index);
  });

  const matchingChars = [];

  // 先頭文字と終了文字で一致している文字を探す
  for (const char of startMap.keys()) {
    if (endMap.has(char)) {
      const startIndices = startMap.get(char);
      const endIndices = endMap.get(char);

      // 合計出現回数が2の場合
      if (startIndices.length + endIndices.length === 2) {
        // 出現位置が同じかどうかを確認
        if (startIndices[0] === endIndices[0]) {
          // 出現位置が同じ場合は除外（何もしない）
          continue;
        }
      }

      // それ以外は matchingChars に追加
      matchingChars.push(char);
    }
  }

  return matchingChars;
}

// 勝利数を管理するグローバル変数
let playerWins = 0;
let opponentWins = 0;

let playerIsLoser = false;
// ゲームオーバー処理
function handleGameOver(isLoser) {
  switch (currentBGMState) {
    case 'Consecutive Battle':
      soundManager.stop('Consecutive Battle');
      break;
    case 'Lightning Brain':
      soundManager.stop('Lightning Brain');
      break;
    case 'R.E.B.O.R.N':
      soundManager.stop('R.E.B.O.R.N');
      break;
    case 'OFF':
      break;
  }
  soundManager.stop('warning');

  if (gameState === 'ended') return;

  // console.log("handleGameOver実行");

  gameState = 'ended';

  isGameOver = true;

  if (isLoser) {
    opponentWins++;
    playerIsLoser = true;
  } else {
    playerIsLoser = false;
  }


  // drawGameOverUI(isLoser ? 'Lose' : 'Win');

  // 勝利数の確認
  if (playerWins === 2 || opponentWins === 2) {
    // 最終勝者が決定
    drawGameOverUI(playerWins === 2 ? 'Win' : 'Lose');
    setTimeout(() => {
      resetGameAnimation();
      setTimeout(() => {
        playerWins = 0;
        opponentWins = 0;
        playerIsLoser = false;
        showRetryDialog();
      }, 6000);
    }, 1500);
  } else {
    // 通常のゲーム終了処理
    drawGameOverUI(isLoser ? 'Lose' : 'Win');
    setTimeout(() => {
      resetGameAnimation();
      setTimeout(() => {
        startCountdown();
      }, 5000);
    }, 1500);
  }
  // 少し待ってからリトライダイアログを表示
  // setTimeout(() => {
  //   showRetryDialog();
  //   resetGameAnimation();
  // }, 2000);
}

function runDropAnimation() {
  const el = document.getElementById("allGameArea");

  // ① アニメーションを完全にリセット
  el.style.animation = "none";

  // ② 開始位置へ戻す
  el.style.top = "-100vh";

  // ③ レイアウト確定（ブラウザに状態を確実に認識させる）
  void el.offsetWidth;

  // ④ アニメーション設定を付け直す（＝アニメーションが最初から動く）
  el.style.animation = "drop 1s cubic-bezier(0.25, 1, 0.5, 1) forwards";
}


// リトライレスポンス処理
function handleRetryResponse(response) {
  if (!response) {
    gameState = 'normal';
  }
  const buttons = retryDialog.querySelectorAll('button');
  buttons.forEach(button => button.disabled = true); // ボタンを無効化
  socket.emit('retryResponse', { response });
}

function showGameOverEffect(elementId, isLoser) {
  const overlay = document.getElementById(elementId);
  const resultElement = document.createElement('div');
  resultElement.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 8vh;
    z-index: 1000;
  `;
  if (isLoser) {
    resultElement.textContent = "Lose";
  } else {
    resultElement.textContent = "Win";
  }
  overlay.appendChild(resultElement);
}

function animateGameOver(isLoser) {
  // テキスト表示
  showGameOverEffect('playerChildEffectOverlay', isLoser);
  showGameOverEffect('opponentChildEffectOverlay', !isLoser);

  // スタイルシートの追加
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
  @keyframes fallDown {
    0% {
      transform: translateY(0) rotate(0deg);
    }
    100% {
      transform: translateY(100vh) rotate(80deg);
      opacity: 0;
    }
  }
  
  @keyframes winnerScale {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  @keyframes fadeOut {
    to { opacity: 0; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
  document.head.appendChild(styleSheet);

  // 負けた側の要素をアニメーション
  const loserElement = document.getElementById(isLoser ? 'playerGameArea' : 'opponentGameArea');
  loserElement.style.animation = 'fallDown 1.5s cubic-bezier(.55, 0, .1, 1) forwards';

  // 勝った側の要素をアニメーション
  const winnerElement = document.getElementById(isLoser ? 'opponentGameArea' : 'playerGameArea');
  winnerElement.style.animation = 'winnerScale 2s ease-out forwards';
}

// フェードアウト用オーバーレイ
// const fadeOverlay = document.createElement('div');
// fadeOverlay.style.cssText = `
//   position: fixed;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background: black;
//   opacity: 0;
//   z-index: 1000;
//   pointer-events: none;
// `;

// // 新しいリセット関数を追加
// function resetGameAnimation() {
//   return new Promise((resolve) => {
//     document.body.appendChild(fadeOverlay);

//     // フェードアウト
//     fadeOverlay.style.animation = 'fadeOut 0.5s forwards';

//     setTimeout(() => {
//       // アニメーション効果のリセット
//       const playerArea = document.getElementById('playerGameArea');
//       const opponentArea = document.getElementById('opponentGameArea');
//       const playerOverlay = document.getElementById('playerChildEffectOverlay');
//       const opponentOverlay = document.getElementById('opponentChildEffectOverlay');

//       // アニメーションと変形をリセット
//       playerArea.style.animation = '';
//       opponentArea.style.animation = '';
//       playerArea.style.transform = '';
//       opponentArea.style.transform = '';

//       // オーバーレイのテキストをクリア
//       playerOverlay.innerHTML = '';
//       opponentOverlay.innerHTML = '';

//       // フェードイン
//       fadeOverlay.style.animation = 'fadeIn 0.5s reverse forwards';

//       setTimeout(() => {
//         document.body.removeChild(fadeOverlay);
//         resolve();
//       }, 500);
//     }, 500);
//   });
// }

// HTML から扉要素を取得
const doorLeft = document.querySelector('.door-left');
const doorRight = document.querySelector('.door-right');

// 扉を閉じる関数
function closeDoors() {
  return new Promise((resolve) => {
    // 扉を閉じるクラスを適用
    doorLeft.classList.remove('open-left');
    doorRight.classList.remove('open-right');
    doorLeft.classList.add('closed-left');
    doorRight.classList.add('closed-right');

    // アニメーション終了を待つ
    setTimeout(() => resolve(), 1500);
  });
}

// 扉を開く関数
function openDoors() {
  return new Promise((resolve) => {
    // 扉を開くクラスを適用
    doorLeft.classList.remove('closed-left');
    doorRight.classList.remove('closed-right');
    doorLeft.classList.add('open-left');
    doorRight.classList.add('open-right');

    // アニメーション終了を待つ
    setTimeout(() => resolve(), 500);
  });
}

async function resetGameAnimation() {
  await closeDoors(); // 扉を中央に閉じる

  if (currentGameOverSoundState === 'VALID') {
    if (playerWins === 2) {
      soundManager.playSound('win', { volume: 0.8 });
    } else if (opponentWins === 2) {
      soundManager.playSound('lose', { volume: 1.5 });
    } else if (!playerIsLoser) {
      soundManager.playSound('playerMatchPoint', { volume: 1 });
    } else if (playerIsLoser) {
      soundManager.playSound('opponentMatchPoint', { volume: 1.2 });
    }
  }

  // console.log(`相手の勝利数: ${opponentWins}`);
  // console.log(`プレイヤーの勝利数: ${playerWins}`);
  // console.log("resetGameAnimation実行");

  const playerArea = document.getElementById('playerGameArea');
  const opponentArea = document.getElementById('opponentGameArea');
  const playerOverlay = document.getElementById('playerChildEffectOverlay');
  const opponentOverlay = document.getElementById('opponentChildEffectOverlay');

  // アニメーションと変形をリセット
  playerArea.style.animation = '';
  opponentArea.style.animation = '';
  playerArea.style.transform = '';
  opponentArea.style.transform = '';

  // オーバーレイのテキストをクリア
  playerOverlay.innerHTML = '';
  opponentOverlay.innerHTML = '';

  // 背景と文字を描画
  if (playerWins < 2 && opponentWins < 2) {
    if (playerWins === 1) {
      setTimeout(() => {
        doorLeft.style.background = 'linear-gradient(to right, rgba(5, 7, 19, 1) 30%, rgb(155, 40, 40) 100%)';
      }, 350);
      doorLeft.innerHTML = `<div class="door-text matchpoint-text" 
      style="-webkit-text-stroke: 2px rgba(5, 7, 19, 0); color:  rgb(255, 255, 255); text-align: center; font-family:'zouver'; font-size: 10vh;line-height: 100%; margin-top: 40%;">MatchPoint</div>`;
    }
    if (opponentWins === 1) {
      setTimeout(() => {
        doorRight.style.background = 'linear-gradient(to left, rgba(5, 7, 19, 1) 30%, rgb(40, 40, 155) 100%)';
      }, 350);
      doorRight.innerHTML = `<div class="door-text matchpoint-text" 
      style="-webkit-text-stroke: 2px rgba(5, 7, 19, 0); color: rgb(255, 255, 255); text-aloign: center; font-family:'zouver'; font-size: 10vh; line-height: 100%; margin-top: 40%;">MatchPoint</div>`;
    }
  }

  if (playerWins === 2) {
    doorLeft.innerHTML = `<div class="door-text win-text" style="
  margin-top: 40%; color: white; text-align: center; font-family:'zouver'; font-size: 12vh; line-height: 100%; margin-left: 25%; margin-top: 40%;">Player</div>`;
    doorRight.innerHTML = `<div class="door-text win-text" style="
  margin-top: 40%; color: white; text-align: center; font-family:'zouver'; font-size: 12vh; line-height: 100%; margin-right: 25%; margin-top: 40%;">Win</div>`;
  }

  if (opponentWins === 2) {
    doorLeft.innerHTML = `<div class="door-text lose-text" style="
  margin-top: 40%; color: white; text-align: center; font-family:'zouver'; font-size: 12vh; line-height: 100%; margin-left: 25%; margin-top: 40%;">Player</div>`;
    doorRight.innerHTML = `<div class="door-text lose-text" style="
  margin-top: 40%; color: white; text-align: center; font-family:'zouver'; font-size: 12vh; line-height: 100%; margin-right: 25%; margin-top: 40%;">Lose</div>`;
  }

  const el = document.getElementById("allGameArea");
  el.style.animation = "none";
  el.style.top = "-100vh";
  void el.offsetWidth;

  // 2秒待ってから扉を開く
  setTimeout(async () => {
    await openDoors();
    doorLeft.innerHTML = '';
    doorRight.innerHTML = '';
    doorLeft.style.background = '';
    doorRight.style.background = '';
    runDropAnimation();
  }, 2500);

}

function drawGameOverUI(text) {
  const width = ctxPlayer.canvas.getBoundingClientRect().width;
  const height = ctxPlayer.canvas.getBoundingClientRect().height;
  ctxPlayer.save();
  ctxOpponent.save();

  // 半透明の背景
  ctxPlayer.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctxPlayer.fillRect(0, 0, width, height);

  ctxOpponent.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctxOpponent.fillRect(0, 0, width, height);

  ctxPlayer.restore();
  ctxOpponent.restore();

  // アニメーション開始
  const isLoser = text === 'Lose';
  animateGameOver(isLoser);
}

function syncFieldUpdate() {
  if (gameState === "playing") {
    socket.emit('fieldUpdate', {
      field: playerField,
      fieldWords: playerFieldWords,
      memorizeLastAttackValue: memorizeLastAttackValue
    });
  }
  // console.log("syncFieldUpdateのplayerFieldWords" + playerFieldWords);
}

function calcReceiveOffset() {
  // console.log("相殺前playerAttackValueToOffset:", playerAttackValueToOffset);
  // console.log("相殺前playerReceiveValueToOffset:", playerReceiveValueToOffset);
  if (playerReceiveValueToOffset.length === 0) {
    return playerAttackValueToOffset;
  };

  if (playerReceiveValueToOffset.includes(playerAttackValueToOffset)) {
    if (currentKey == "REFLECTOR") {
      let count = 0;
      console.log(playerAttackValueToOffset);
      while (playerReceiveValueToOffset.includes(playerAttackValueToOffset) && count < 2) {
        playerReceiveValueToOffset.splice(playerReceiveValueToOffset.indexOf(playerAttackValueToOffset), 1);
        count++;
      }
      if (gameState === 'CPUmatch') {
        opponentReceiveValueToOffset.push(playerAttackValueToOffset);
        opponentReceiveValueToOffset.push(playerAttackValueToOffset);
        opponentReceiveValueToOffset.sort((a, b) => a - b);
        opponentReceiveValueToDisplay = [...opponentReceiveValueToOffset];
        CPUdrawStatusField(ctxOpponentStatus, false);
        playerAtteckValueToAPM += playerAttackValueToOffset;
        playerAtteckValueToAPM += playerAttackValueToOffset;
      } else {
        playerAtteckValueToAPM += playerAttackValueToOffset;
        playerAtteckValueToAPM += playerAttackValueToOffset;
        socket.emit('attack', {
          attackValue: playerAttackValueToOffset
        });
        socket.emit('attack', {
          attackValue: playerAttackValueToOffset
        });
      }
      playerAttackValueToOffset = 0;
    } else {
      playerReceiveValueToOffset.splice(playerReceiveValueToOffset.indexOf(playerAttackValueToOffset), 1);
      playerAttackValueToOffset = 0;
    }
  }

  // console.log("相殺後playerAttackValueToOffset:", playerAttackValueToOffset);
  // console.log("相殺後playerReceiveValueToOffset:", playerReceiveValueToOffset);

  if (playerAttackValueToOffset === 0) return 0;

  while (playerAttackValueToOffset > 0 && playerReceiveValueToOffset.length > 0) {

    let maxIndex = playerReceiveValueToOffset.indexOf(Math.max(...playerReceiveValueToOffset));
    let maxValue = playerReceiveValueToOffset[maxIndex];

    if (playerAttackValueToOffset >= maxValue) {
      playerAttackValueToOffset -= maxValue;
      playerReceiveValueToOffset.splice(maxIndex, 1);
    } else {
      playerReceiveValueToOffset[maxIndex] -= playerAttackValueToOffset;
      playerAttackValueToOffset = 0;
      if (selectedCategory === "ENGLISH") {
        if (playerReceiveValueToOffset[maxIndex] < 4) {
          playerReceiveValueToOffset.splice(maxIndex, 1);
        }
      } else {
        if (playerReceiveValueToOffset[maxIndex] < 2) {
          playerReceiveValueToOffset.splice(maxIndex, 1);
        }
      }
    }
  }
  // console.log("相殺後playerAttackValueToOffset:", playerAttackValueToOffset);
  // console.log("相殺後playerReceiveValueToOffset:", playerReceiveValueToOffset);

  if (selectedCategory === "ENGLISH") {
    return playerAttackValueToOffset > 3 ? playerAttackValueToOffset : 0;
  } else {
    return playerAttackValueToOffset > 1 ? playerAttackValueToOffset : 0;
  }
}

let playerAttackValueToDisplay = 0;
let playerReceiveValueToDisplay = [];

function calcReceiveOffsetToDisplay() {

  playerAttackValueToDisplay = playerAttackValueToOffset;
  playerReceiveValueToDisplay = [...playerReceiveValueToOffset];

  if (playerReceiveValueToDisplay.includes(playerAttackValueToDisplay)) {
    if (currentKey == "REFLECTOR") {
      let count = 0;
      while (playerReceiveValueToDisplay.includes(playerAttackValueToDisplay) && count < 2) {
        playerReceiveValueToDisplay.splice(playerReceiveValueToDisplay.indexOf(playerAttackValueToDisplay), 1);
        count++;
      }
      playerAttackValueToDisplay = 0;
    } else {
      playerReceiveValueToDisplay.splice(playerReceiveValueToDisplay.indexOf(playerAttackValueToDisplay), 1);
      playerAttackValueToDisplay = 0;
    }
  }

  if (playerAttackValueToDisplay === 0) return 0;

  while (playerAttackValueToDisplay > 0 && playerReceiveValueToDisplay.length > 0) {

    let maxIndex = playerReceiveValueToDisplay.indexOf(Math.max(...playerReceiveValueToDisplay));
    let maxValue = playerReceiveValueToDisplay[maxIndex];

    if (playerAttackValueToDisplay >= maxValue) {
      playerAttackValueToDisplay -= maxValue;
      playerReceiveValueToDisplay.splice(maxIndex, 1);
    } else {
      playerReceiveValueToDisplay[maxIndex] -= playerAttackValueToDisplay;
      playerAttackValueToDisplay = 0;
      if (selectedCategory === "ENGLISH") {
        if (playerReceiveValueToDisplay[maxIndex] < 4) {
          playerReceiveValueToDisplay.splice(maxIndex, 1);
        }
      } else {
        if (playerReceiveValueToDisplay[maxIndex] < 2) {
          playerReceiveValueToDisplay.splice(maxIndex, 1);
        }
      }
    }
  }

  // 合算する
  // let attackSum = playerAttackValueToDisplay.reduce((sum, value) => sum + value, 0);

  // while (attackSum > 0 && playerReceiveValueToDisplay.length > 0) {
  //   // 最大値を探す
  //   let maxIndex = playerReceiveValueToDisplay.indexOf(Math.max(...playerReceiveValueToDisplay));
  //   let maxValue = playerReceiveValueToDisplay[maxIndex];

  //   if (attackSum >= maxValue) {
  //     // 合算値が最大値を超える場合、最大値を削除
  //     attackSum -= maxValue;
  //     playerReceiveValueToDisplay.splice(maxIndex, 1);
  //   } else {
  //     // 合算値が最大値未満の場合、最大値を減らす
  //     playerReceiveValueToDisplay[maxIndex] -= attackSum;
  //     attackSum = 0; // 合算値を使い切る

  //     // 残った値が2未満なら削除
  //     if (playerReceiveValueToDisplay[maxIndex] < 2) {
  //       playerReceiveValueToDisplay.splice(maxIndex, 1);
  //     }
  //   }
  // }

  // 降順にソート
  // playerAttackValueToDisplay.sort((a, b) => a - b);
  playerReceiveValueToDisplay.sort((a, b) => a - b);

  // console.log("playerReceiveValueToDisplay:" + playerReceiveValueToDisplay);
}

// グローバル変数の初期化
let playerOverlayElement = document.getElementById("playerChainStyleOverlay");
let opponentOverlayElement = document.getElementById("opponentChainStyleOverlay");;

// オーバーレイキャンバスの初期化関数
function initializeOverlayDivElement() {

  // playerOverlayElement = document.createElement('div');
  // playerOverlayElement.id = 'playerChainStyleOverlay';
  playerOverlayElement.style.position = 'absolute';
  playerOverlayElement.style.pointerEvents = 'none';
  const playerFieldWrapper = document.querySelector('#playerGameArea .field-wrapper');
  playerFieldWrapper.appendChild(playerOverlayElement);


  // opponentOverlayElement = document.createElement('div');
  // opponentOverlayElement.id = 'opponentChainStyleOverlay';
  opponentOverlayElement.style.position = 'absolute';
  opponentOverlayElement.style.pointerEvents = 'none';
  const opponentFieldWrapper = document.querySelector('#opponentGameArea .field-wrapper');
  opponentFieldWrapper.appendChild(opponentOverlayElement);

  // 両方のキャンバスをリサイズ
  resizeOverlayDivElement(playerOverlayElement);
  resizeOverlayDivElement(opponentOverlayElement);
}

function resizeOverlayDivElement(divElement) {
  const dpr = window.devicePixelRatio || 1;
  CELL_SIZE = calculateCellSize(); // セルサイズを再計算

  // フィールド全体のサイズを計算
  const width = CELL_SIZE * FIELD_WIDTH;
  const height = CELL_SIZE * FIELD_HEIGHT;

  // キャンバスの実際のサイズを設定（高解像度対応）
  divElement.width = width * dpr;
  divElement.height = height * dpr;

  // 表示サイズを設定
  divElement.style.width = `${width}px`;
  divElement.style.height = `${height}px`;

  // statusFieldの幅を考慮して位置を調整
  divElement.style.top = `1.5px`;
  divElement.style.left = `${CELL_SIZE / 2 + 3.5}px`;

}


// ハイライト処理関数を修正
function highlightMatchingCells(field) {

  let isPlayer = true;
  if (field === opponentField) {
    isPlayer = false;
  }
  // 使用するオーバーレイキャンバスを選択
  const overlayDiv = isPlayer ? playerOverlayElement : opponentOverlayElement;

  removeAuraEffectFromOverlay(overlayDiv);

  // ハイライト情報を保持する配列
  const highlightData = [];


  // 各行を上から順にチェック
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    // まず先頭(x=0)をチェック
    if (!field[y][0] || !field[y][0].word) {
      continue;
    }

    // 先頭の文字のチェック
    const startChar = field[y][0].word[0];
    if (isPlayer && startChar === lastChar) {
      // 先頭文字が一致かつ lastChar と同じ場合
      // 先頭文字が一致かつ lastChar と同じ場合
      const colorObj = { baseColor: 'rgba(255, 255, 255, 0.5)', borderColor: 'rgba(255, 255, 255)' }; // 白色を指定
      applyAuraEffectToCell(y, 0, colorObj, overlayDiv);
      highlightData.push({ x: 0, y, colorObj });
    }
    else if (charColorMap.has(startChar)) {
      // 最初の文字が一致（lastChar のチェックはなし）
      const colorObj = charColorMap.get(startChar);
      applyAuraEffectToCell(y, 0, colorObj, overlayDiv);
      highlightData.push({ x: 0, y, colorObj });
    }

    // その行の最後尾を探してチェック
    for (let x = FIELD_WIDTH - 1; x > 0; x--) {
      if (field[y][x] && field[y][x].word) {
        const endChar = normalizeHiragana(field[y][x].word[field[y][x].word.length - 1]);
        if (charColorMap.has(endChar)) {
          // 最後の文字が一致
          const colorObj = charColorMap.get(endChar);
          applyAuraEffectToCell(y, x, colorObj, overlayDiv);
          highlightData.push({ x, y, colorObj });
        }
        break;  // 最後尾が見つかったらその行の探索終了
      }
    }
  }

  // プレイヤーの場合、相手に情報を送信（同期用データ）
  if (isPlayer) {
    socket.emit('fieldHighlightUpdate', {
      highlightData: highlightData,
    });
  }
}

// auraElementをすべて削除するメソッド
function removeAuraEffectFromOverlay(overlayDiv) {
  // overlayDiv内のすべての子要素を削除
  while (overlayDiv.firstChild) {
    overlayDiv.removeChild(overlayDiv.firstChild);
  }
}

function applyAuraEffectToCell(y, x, colorObj, overlayDiv) {

  // セルの絶対位置を計算
  const cellX = x * CELL_SIZE;
  const cellY = y * CELL_SIZE;

  // アウラエフェクト用のコンテナを作成
  const auraElement = document.createElement('div');
  auraElement.className = 'field-aura-container';

  // 位置とサイズを設定
  auraElement.style.left = `${cellX}px`;
  auraElement.style.top = `${cellY}px`;
  auraElement.style.width = `${CELL_SIZE}px`;
  auraElement.style.height = `${CELL_SIZE}px`;

  // カラー変数を設定
  auraElement.style.setProperty('--aura-color', colorObj.baseColor);
  auraElement.style.setProperty('--aura-border-color', colorObj.borderColor);

  // オーバーレイに追加
  overlayDiv.appendChild(auraElement);
}

function drawField(ctx, field, receivedLastWordLength) {

  if (gameState !== "playing") return;
  ctx.clearRect(0, 0, ctx.canvas.getBoundingClientRect().width, ctx.canvas.getBoundingClientRect().height);

  ctx.fillStyle = "rgba(5, 7, 19, 0.7)";
  ctx.fillRect(0, 0, ctx.canvas.getBoundingClientRect().width, ctx.canvas.getBoundingClientRect().height);

  // if (receivedLastWordLength !== 0) {
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    let hasContent = false;
    for (let x = 0; x < FIELD_WIDTH; x++) {
      if (field[y][x] && field[y][x].word) {
        hasContent = true;
        break;
      }
    }

    if (!hasContent) {
      continue;
    }

    // 行の文字を1つの単語として結合
    let rowWord = '';
    for (let x = 0; x < FIELD_WIDTH; x++) {
      if (field[y][x] && field[y][x].word) {
        rowWord += field[y][x].word;
      }
    }

    // console.log(rowWord);

    // 単語が存在する場合のみ処理
    if (rowWord.length > 0) {

      const position = y * CELL_SIZE;
      const width = FIELD_WIDTH * CELL_SIZE;
      const height = CELL_SIZE;

      const hasLongerWord =
        // (receivedLastWordLength === 2 && rowWord.length === 3) ||
        (rowWord.length === receivedLastWordLength + 1);

      const hasShorterWord =
        // (receivedLastWordLength === 10 && rowWord.length === 9) ||
        // (receivedLastWordLength !== 2 &&
        (rowWord.length === receivedLastWordLength - 1);

      if (rowWord == attackWord) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(0, position, width, height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, position, width, height);

      } else if (rowWord.length === receivedLastWordLength) {
        ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
        ctx.fillRect(0, position, width, height);
        ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
        ctx.lineWidth = 2;
        ctx.strokeRect(0, position, width, height);

      } else if (hasLongerWord) {
        // drawHorizontalGradient(ctx, y, 'SHORTER_WORD');
        ctx.fillStyle = `rgba(255, 0, 255, 0.2)`;
        ctx.fillRect(0, position, width, height);
        ctx.strokeStyle = `rgba(255, 0, 255, 0.5)`;
        ctx.lineWidth = 2;
        ctx.strokeRect(0, position, width, height);

      } else if (hasShorterWord) {
        // drawHorizontalGradient(ctx, y, 'SHORTER_WORD');
        ctx.fillStyle = `rgba(0, 255, 255, 0.2)`;
        ctx.fillRect(0, position, width, height);
        ctx.strokeStyle = `rgba(0, 255, 255, 0.5)`;
        ctx.lineWidth = 2;
        ctx.strokeRect(0, position, width, height);
      }
    }
  }
  // }

  // 以下のレンダリング処理は変更なし
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    for (let x = 0; x < FIELD_WIDTH; x++) {
      const cell = field[y][x];
      if (cell) {
        const gradient = ctx.createRadialGradient(
          x * CELL_SIZE + CELL_SIZE / 2,
          y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE * 3,
          x * CELL_SIZE + CELL_SIZE / 2,
          y * CELL_SIZE + CELL_SIZE / 2,
          0
        );

        if (cell.isHighlighted) {
          gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        if (selectedCategory === "ENGLISH") {
          ctx.font = `${CELL_SIZE * 1}px "${currentfontState}", "スマートフォントUI", "せのびゴシック", serif`;
        } else {
          ctx.font = `${CELL_SIZE * 0.75}px "${currentfontState}", "ヨハク", "スマートフォントUI", "せのびゴシック", serif`;
        }
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.lineWidth = 0.5;

        const centerX = x * CELL_SIZE + CELL_SIZE / 2;
        const centerY = y * CELL_SIZE + CELL_SIZE / 2;

        if (cell.word == "×") {
          ctx.lineWidth = 2;
          ctx.fillStyle = 'rgb(0, 0, 0)';
          ctx.fillText(cell.word, centerX, centerY);
        }
        else if (cell.isHighlighted) {
          // ctx.strokeStyle = 'black';
          ctx.lineWidth = 2;
          // ctx.strokeText(cell.word, centerX, centerY);
          // ctx.fillStyle = 'white';
          ctx.fillStyle = 'rgb(0, 0, 0)';
          ctx.fillText(cell.word, centerX, centerY);
        } else {
          // すべての文字に黒い縁取りを追加
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.lineWidth = 2; // 縁取りの太さ
          ctx.strokeText(cell.word, centerX, centerY);
          ctx.fillStyle = 'white';
          ctx.fillText(cell.word, centerX, centerY);
        }
      }
    }
  }

  drawGrid(ctx);
}

// 横方向全体にグラデーションを描画する関数を修正
// function drawHorizontalGradient(ctx, row, colorType) {
//   const y = row * CELL_SIZE;
//   const width = FIELD_WIDTH * CELL_SIZE;
//   const height = CELL_SIZE;

//   const color = GRADIENT_COLORS[colorType];

//   // 左側のグラデーション
//   const gradientLeft = ctx.createLinearGradient(0, y + height / 2, width / 2, y + height / 2);
//   gradientLeft.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.EDGE})`);
//   gradientLeft.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.MIDDLE})`);
//   gradientLeft.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.CENTER})`);

//   // 右側のグラデーション
//   const gradientRight = ctx.createLinearGradient(width / 2, y + height / 2, width, y + height / 2);
//   gradientRight.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.CENTER})`);
//   gradientRight.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.MIDDLE})`);
//   gradientRight.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.EDGE})`);

//   // 左半分を描画
//   ctx.fillStyle = gradientLeft;
//   ctx.fillRect(0, y, width / 2, height);

//   // 右半分を描画
//   ctx.fillStyle = gradientRight;
//   ctx.fillRect(width / 2, y, width / 2, height);

//   // 枠線の描画（新しく追加）
//   ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b})`;
//   ctx.lineWidth = 3;
//   ctx.strokeRect(0, y, width, height);
// }


// キャンバスサイズをリサイズする関数
function resizeField(canvas) {

  const dpr = window.devicePixelRatio || 1; // デバイスピクセル比を取得
  CELL_SIZE = calculateCellSize(); // セルサイズを再計算

  const width = CELL_SIZE * FIELD_WIDTH; // 論理ピクセル幅
  const height = CELL_SIZE * FIELD_HEIGHT; // 論理ピクセル高さ

  // 実際の解像度を高く設定
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // CSSスタイルとして見た目のサイズを設定
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // コンテキストをスケーリング
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

}

function resizeInputField(canvas) {
  const dpr = window.devicePixelRatio || 1;
  CELL_SIZE = calculateCellSize(); // セルサイズを再計算

  const width = CELL_SIZE * FIELD_WIDTH; // 入力領域の幅
  const height = CELL_SIZE * 2; // 入力領域の高さを2セル分に設定

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr); // 高解像度スケーリング
}


// 親要素とspanを取得
// 全ての対象要素を取得
const inputFieldWrappers = document.querySelectorAll(".inputFieldWrapper");
const spans2 = document.querySelectorAll(".inputFieldWrapper span:nth-child(2)");
const spans4 = document.querySelectorAll(".inputFieldWrapper span:nth-child(4)");

// 親要素の高さを取得してspanのwidthに設定
function updateSpanSize() {
  inputFieldWrappers.forEach(wrapper => {
    wrapper.style.height = playerInputField.style.height;
    wrapper.style.width = playerInputField.style.width;
  });
  const updateHeight = window.getComputedStyle(playerInputField).height
  // 全てのspan2に対して処理
  spans2.forEach(span => {
    span.style.width = updateHeight;
  });

  // 全てのspan4に対して処理
  spans4.forEach(span => {
    span.style.width = updateHeight;
  });
}

// 既存のresizeAllCanvases関数に追加
function resizeAllCanvases() {

  // 既存のリサイズ処理
  resizeField(playerFieldElement);
  resizeField(opponentFieldElement);
  resizeInputField(playerInputField);
  resizeInputField(opponentInputField);

  // ステータスフィールドのリサイズ
  resizeStatusField(playerStatusElement);
  resizeStatusField(opponentStatusElement);

  // 全フィールドの再描画
  drawField(ctxPlayer, playerField, 0);
  drawField(ctxOpponent, opponentField, 0);

  drawInputField(ctxPlayerInput, playerInput, playerInputField);
  drawInputField(ctxOpponentInput, opponentInput, opponentInputField);
  drawStatusField(ctxPlayerStatus, true);
  drawStatusField(ctxOpponentStatus, false);

  // オーバーレイのリサイズ
  resizeWarningOverlay(overlayContexts.playerOverlay);
  resizeWarningOverlay(overlayContexts.opponentOverlay);

  resizeOverlayDivElement(playerOverlayElement);
  resizeOverlayDivElement(opponentOverlayElement);

  // 警告オーバーレイの再描画
  if (warningState.player.isVisible) {
    drawWarningOverlay(true);
  }
  if (warningState.opponent.isVisible) {
    drawWarningOverlay(false);
  }

  // 初期化
  updateSpanSize();

}

// ウィンドウリサイズ時のイベントリスナー
window.addEventListener('resize', () => {
  resizeAllCanvases();
});

// グリッドを描画する関数
function drawGrid(ctx) {
  if (currentGridHorizonState === 'INVALID' && currentGridVerticalState === 'INVALID') {
    return;
  }
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;

  if (currentGridHorizonState === 'VALID') {
    // 水平線を描画
    for (let y = 0; y <= FIELD_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(FIELD_WIDTH * CELL_SIZE, y * CELL_SIZE);
      ctx.stroke();
    }
  }

  if (currentGridVerticalState === 'VALID') {
    // 垂直線を描画
    for (let x = 0; x <= FIELD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, FIELD_HEIGHT * CELL_SIZE);
      ctx.stroke();
    }
  }
}


// 初期描画
resizeInputField(playerInputField);
resizeInputField(opponentInputField);

drawInputField(ctxPlayerInput, "", playerInputField);
drawInputField(ctxOpponentInput, "", opponentInputField);

// 初期化
updateSpanSize();

// 単語リストの読み込み
let wordList = null;
async function loadWordList() {
  const response = await fetch('./words.json');
  wordList = await response.json();

}

// ゲーム開始
// 初期化時の処理に追加
loadWordList().then(() => {

  resizeField(playerFieldElement);
  resizeField(opponentFieldElement);
  resizeStatusField(playerStatusElement);
  resizeStatusField(opponentStatusElement);

  drawInputField(ctxPlayerInput, "", playerInputField);
  drawInputField(ctxOpponentInput, "", opponentInputField);
  drawStatusField(ctxPlayerStatus, true);
  drawStatusField(ctxOpponentStatus, false);

  // drawGrid(ctxPlayer);
  // drawGrid(ctxOpponent);

  initializeOverlayDivElement();

  ctxPlayer.fillStyle = "rgba(5, 7, 19, 0.7)";
  ctxPlayer.fillRect(0, 0, ctxPlayer.canvas.getBoundingClientRect().width, ctxPlayer.canvas.getBoundingClientRect().height);
  drawField(ctxPlayer);

  ctxOpponent.fillStyle = "rgba(5, 7, 19, 0.7)";
  ctxOpponent.fillRect(0, 0, ctxOpponent.canvas.getBoundingClientRect().width, ctxOpponent.canvas.getBoundingClientRect().height);
  drawField(ctxOpponent);
});

function startGame() {
  if (gameState !== 'playing') return;

  setWordPool();
  if (playerFieldWords.length === 0) {
    for (let x = 0; x < 9; x++) {
      playerFieldWords.push(getRandomWordForField(playerUsedLengths));
    }
  }
  syncFieldUpdate();
  drawInfo();
  playerInput = "";
  opponentInput = "";
  drawInputField(ctxPlayerInput, '', playerInputField);
  drawInputField(ctxOpponentInput, '', opponentInputField);
  gameStep();
}

let gameStepInterval = 10000;
// const minInterval = 1000;
let gameStepTimeoutId;

function gameStep() {
  if (gameState !== 'playing') return;
  updateFieldAfterReceiveOffset(playerField, playerFieldWords);
  checkAndRemoveWord(playerField, playerFieldWords, playerInput);
  drawField(ctxPlayer, playerField, memorizeLastAttackValue);
  syncInputUpdate();

  gameStepInterval = updateBaseGameStepInterval();
  updateProgressBar(gameStepInterval);
  clearTimeout(gameStepTimeoutId);
  gameStepTimeoutId = setTimeout(gameStep, gameStepInterval);
}

// プログレスバーの制御用の変数とエレメント
const progressLineLeft = document.getElementById('progressLineLeft');
const progressLineRight = document.getElementById('progressLineRight');
let progressTimer = null;
let startTime = 0;

// プログレスバーのアニメーション制御関数
function updateProgressBar(currentInterval) {
  if (progressTimer) {
    clearInterval(progressTimer);
  }

  // アニメーションクラスを削除した状態でリセット
  progressLineLeft.classList.remove('animating');
  progressLineRight.classList.remove('animating');
  progressLineLeft.style.transform = 'scaleX(1)';
  progressLineRight.style.transform = 'scaleX(1)';

  // 少し遅延を入れてアニメーションクラスを追加
  setTimeout(() => {
    progressLineLeft.classList.add('animating');
    progressLineRight.classList.add('animating');
  }, 10);

  progressLineLeft.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  progressLineRight.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  progressLineLeft.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
  progressLineRight.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';

  startTime = Date.now();

  progressTimer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = currentInterval - elapsed;
    const progress = remaining / currentInterval;

    if (remaining <= currentInterval / 3) {
      const redColor = 'rgba(255, 50, 50, 0.8)';
      const redShadow = '0 0 10px rgba(255, 50, 50, 0.5)';
      progressLineLeft.style.backgroundColor = redColor;
      progressLineRight.style.backgroundColor = redColor;
      progressLineLeft.style.boxShadow = redShadow;
      progressLineRight.style.boxShadow = redShadow;
    }

    if (progress <= 0) {
      progressLineLeft.style.transform = 'scaleX(0)';
      progressLineRight.style.transform = 'scaleX(0)';
      clearInterval(progressTimer);
    } else {
      progressLineLeft.style.transform = `scaleX(${progress})`;
      progressLineRight.style.transform = `scaleX(${progress})`;
    }
  }, 16);
}

// プログレスバーをクリアする関数
function clearProgressBar() {
  if (progressTimer) {
    clearInterval(progressTimer);
  }
  progressLineLeft.classList.remove('animating');
  progressLineRight.classList.remove('animating');
  progressLineLeft.style.transform = 'scaleX(0)';
  progressLineRight.style.transform = 'scaleX(0)';
}

// ランダムな単語を取得
function getRandomWordForField(usedLengths) {
  // const words = wordList[selectedCategory]["test"];
  // return words[Math.floor(Math.random() * words.length)];
  if (!wordList || !wordList[selectedCategory]) return '';

  const allLengths = Object.keys(wordList[selectedCategory]);

  // すべての length が2回使用されていたらリセット
  if (Object.values(usedLengths).every(count => count >= 2)) {
    for (let length in usedLengths) {
      usedLengths[length] = 0;
    }
  }

  // 使用回数が2回未満のものを取得
  const availableLengths = allLengths.filter(length => (usedLengths[length] || 0) < 2);
  const randomLength = availableLengths[Math.floor(Math.random() * availableLengths.length)];

  // 使用回数を更新
  usedLengths[randomLength] = (usedLengths[randomLength] || 0) + 1;

  const words = wordList[selectedCategory][randomLength];
  return words[Math.floor(Math.random() * words.length)];
}

// 攻撃用の単語を取得
function getRandomWordForAttack(characterCount) {
  let character = [];
  if (selectedCategory === "JAPANESE") {
    character = ["two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  } else {
    character = ["four", "five", "six", "seven", "eight", "nine", "ten"];
  }

  try {
    if (!wordList || !wordList[selectedCategory]) {
      console.error('Error: Missing wordList or selectedCategory is undefined.');
      console.log('wordList:', wordList);
      console.log('selectedCategory:', selectedCategory);
      return 'えらーかくにんよう';
    }

    let words;

    if (selectedCategory === "JAPANESE") {
      words = wordList[selectedCategory][character[characterCount - 2]];
    } else {
      words = wordList[selectedCategory][character[characterCount - 4]];
    }

    // const words = wordList[selectedCategory][character[characterCount - 2]];
    return words[Math.floor(Math.random() * words.length)];
  } catch (error) {
    console.error('Unexpected error:', error.message);
    console.log('characterCount:', characterCount);
    console.log('character array:', character);
    console.log('wordList:', wordList);
    console.log('selectedCategory:', selectedCategory);
    return 'えらーかくにんよう';
  }
}

// キー入力リスナー
let isPlaying = false;
let isPractice = false;

window.addEventListener("keydown", (e) => {
  if (gameState === 'ended' || isRoomMatch === true || gameState === 'CPUmatch') return;
  const key = e.key;
  // 小文字 a-z、ハイフン(-)、Backspace、Delete 以外は return
  if (
    !(key.length === 1 && key.match(/[a-z]/)) && // a〜z
    key !== '-' && // ハイフン
    key !== 'Backspace' && // バックスペース
    key !== 'Delete' && // デリート
    key !== 'Control' && // コントロール
    key !== ' ' // スペース（空白）
  ) {
    return;
  }
  if (gameState === 'config') {
    if (e.key === ' ') {
      if (isPlaying === true) {
        soundManager.stop('Consecutive Battle');
        soundManager.stop('Lightning Brain');
        soundManager.stop('R.E.B.O.R.N');
        isPlaying = false;
      }
      switch (currentBGMState) {
        case 'Consecutive Battle':
          soundManager.playSound('Consecutive Battle', { volume: 0.6, loop: true });
          isPlaying = true;
          break;
        case 'Lightning Brain':
          soundManager.playSound('Lightning Brain', { volume: 0.6, loop: true });
          isPlaying = true;
          break;
        case 'R.E.B.O.R.N':
          soundManager.playSound('R.E.B.O.R.N', { volume: 0.6, loop: true });
          isPlaying = true;
          break;
        case 'OFF':
          soundManager.stop('Consecutive Battle');
          soundManager.stop('Lightning Brain');
          soundManager.stop('R.E.B.O.R.N');
          break;
      }
    }
    switch (currentTypeSoundState) {
      case 'type1':
        soundManager.playSound('type1');
        break;
      case 'type2':
        soundManager.playSound('type2');
        break;
      case 'type3':
        soundManager.playSound('type3');
        break;
      case 'type4':
        soundManager.playSound('type4');
        break;
      case 'type5':
        soundManager.playSound('type5');
        break;
      case 'type6':
        soundManager.playSound('type6');
        break;
      case 'type7':
        soundManager.playSound('type7');
        break;
      case 'type8':
        soundManager.playSound('type8')
        break;
      case 'OFF':
        break;
    }
    return;
  }

  // selectedCategoryがhiraganaの場合、ローマ字をひらがなに変換
  if (selectedCategory === "JAPANESE") {
    let convertedInput = "";
    // 入力内容を更新
    if (key.length === 1) {
      playerKeyValueToKPM++;
      // 文字を追加
      playerInput += key;

      if (key !== ' ') {
        animateInputField();
        switch (currentTypeSoundState) {
          case 'type1':
            soundManager.playSound('type1');
            break;
          case 'type2':
            soundManager.playSound('type2');
            break;
          case 'type3':
            soundManager.playSound('type3');
            break;
          case 'type4':
            soundManager.playSound('type4');
            break;
          case 'type5':
            soundManager.playSound('type5');
            break;
          case 'type6':
            soundManager.playSound('type6');
            break;
          case 'type7':
            soundManager.playSound('type7');
            break;
          case 'type8':
            soundManager.playSound('type8')
            break;
          case 'OFF':
            break;
        }
      }

      if (key === ' ') {
        if (gameState !== 'playing') return;
        playerInput = playerInput.trim();
        convertedInput = wanakana.toHiragana(playerInput);
        if (playerField.filter(row => row.some(item => item !== null)).length >= 20) {
          return;
        }
        if (currentAddWordSoundState === 'VALID') {
          soundManager.playSound('addFieldWord', { volume: 1 });
        }
        updateFieldAfterReceiveOffset(playerField, playerFieldWords);

        gameStepInterval = updateBaseGameStepInterval();
        updateProgressBar(gameStepInterval);
        clearTimeout(gameStepTimeoutId);
        gameStepTimeoutId = setTimeout(gameStep, gameStepInterval);

      } else if (key === "n") {
        // 押下キーが「n」の場合、それ以外を日本語に変換
        convertedInput = wanakana.toHiragana(playerInput.slice(0, -1));

        // 「nn」を「ん」に置き換える処理
        if (playerInput.slice(-2) === "nn") {
          playerInput = playerInput.slice(0, -2) + "n";
          // playerInput = playerInput.slice(0, -2) + "n"; // 「nn」を「n」に一時置き換え
        } else {
          // それから末尾に「n」を加えて描画
          convertedInput = convertedInput + "n";
        }
      } else if (key === "y") {
        convertedInput = wanakana.toHiragana(playerInput);

        // 日本語変換後、に文字消去して「ny」を追加して描画
        if (playerInput.slice(-2) === "ny") {
          convertedInput = convertedInput.slice(0, -2) + "ny";
        }

      } else if (key.match(/^[a-zA-Z-]$/)) {
        convertedInput = wanakana.toHiragana(playerInput);
      } else {
        if (currentDeleteSoundState === 'VALID') {
          soundManager.playSound('deleteInput', { volume: 1 });
        }
        convertedInput = ""
        resetHighlight(playerField);
      }
    } else if (key === "Backspace") {
      if (currentDeleteSoundState === 'VALID') {
        soundManager.playSound('deleteInput', { volume: 1 });
      }
      convertedInput = playerInput.slice(0, -1);
      if (convertedInput === "") {
        resetHighlight(playerField);
      }
    }
    // else if (key === 'ArrowUp') {
    //   // playerWins++;
    //   playerWins = 2;
    //   handleGameOver(false);
    // } else if (key === "ArrowDown") {
    //   opponentWins++;
    //   handleGameOver(true);
    // } else if (key === "ArrowLeft") {
    //   chainBonus++;
    //   updateChainInfoDisplay();
    // } 
    // else if (key === "ArrowRight") {
    //   showRetryDialog();
    // }
    // else if (key === "Enter") {
    //   console.log('エフェクト発射!');
    //   const player = document.getElementById('playerEffectOverlay');
    //   const opponent = document.getElementById('opponentEffectOverlay');

    //   arcEffect.launch(player, opponent, {
    //     color: '#3ec5ff',
    //     size: 14,
    //     duration: 650,
    //     curvature: 0.35,
    //   });
    // }
    else if (key === "Delete" || key === "Control") {
      if (currentDeleteSoundState === 'VALID') {
        soundManager.playSound('deleteInput', { volume: 1 });
      }
      convertedInput = ""
      resetHighlight(playerField);
    }
    else {
      return;
    }
    playerInput = convertedInput;

  } else if (selectedCategory === "ENGLISH") {
    if (key.length === 1) {
      playerKeyValueToKPM++;
      playerInput += key;
      if (key !== ' ') {
        animateInputField();
        switch (currentTypeSoundState) {
          case 'type1':
            soundManager.playSound('type1');
            break;
          case 'type2':
            soundManager.playSound('type2');
            break;
          case 'type3':
            soundManager.playSound('type3');
            break;
          case 'type4':
            soundManager.playSound('type4');
            break;
          case 'type5':
            soundManager.playSound('type5');
            break;
          case 'type6':
            soundManager.playSound('type6');
            break;
          case 'type7':
            soundManager.playSound('type7');
            break;
          case 'type8':
            soundManager.playSound('type8')
            break;
          case 'OFF':
            break;
        }
      }
      if (key === ' ') {
        if (gameState !== 'playing') return;
        playerInput = playerInput.trim();
        if (playerField.filter(row => row.some(item => item !== null)).length >= 20) {
          return;
        }
        if (currentAddWordSoundState === 'VALID') {
          soundManager.playSound('addFieldWord', { volume: 1 });
        }
        updateFieldAfterReceiveOffset(playerField, playerFieldWords);
      }
    }
    else if (key === "Backspace") {
      if (currentDeleteSoundState === 'VALID') {
        soundManager.playSound('deleteInput', { volume: 1 });
      }
      playerInput = playerInput.slice(0, -1); // バックスペースで最後の文字を削除
      if (playerInput === "") {
        resetHighlight(playerField);
      }
    }
    else if (key === "Delete" || key === "Control") {
      if (currentDeleteSoundState === 'VALID') {
        soundManager.playSound('deleteInput', { volume: 1 });
      }
      playerInput = ""
      resetHighlight(playerField);
    }
    else {
      return;
    }
  }

  if (gameState !== 'playing') {
    syncInputUpdate();
    drawInputField(ctxPlayerInput, playerInput, playerInputField);
    return;
  }

  // 単語のチェックと削除
  checkAndRemoveWord(playerField, playerFieldWords, playerInput);
  // checkAndRemoveWord(opponentField, opponentFieldWords, opponentInput);

  // 入力状態を同期
  syncInputUpdate();

  // フィールドと入力内容を再描画
  drawField(ctxPlayer, playerField, memorizeLastAttackValue);
  // drawField(ctxOpponent, opponentField, memorizeLastAttackValue);

  drawInputField(ctxPlayerInput, playerInput, playerInputField);
  // drawInputField(ctxOpponentInput, opponentInput, opponentInputField);


});

// アニメーションを開始する関数
function animateInputField() {
  const inputWrapper = document.querySelector('.inputFieldWrapper');

  // すでにアニメーション中の場合は一度クラスを除去
  inputWrapper.classList.remove('animate-input');

  // 次のフレームでアニメーションクラスを追加
  requestAnimationFrame(() => {
    inputWrapper.classList.add('animate-input');
  });
}

// アニメーションの終了時にクラスを削除
document.querySelector('.inputFieldWrapper').addEventListener('animationend', function () {
  this.classList.remove('animate-input');
});

function syncInputUpdate() {
  // 入力状態を同期
  if (gameState === "playing" || gameState === "countdown") {
    socket.emit('inputUpdate', {
      input: playerInput,
      memorizeLastAttackValue: memorizeLastAttackValue
    });
  }
}

function extractLeadingJapanese(input) {
  // 先頭から連続する日本語（ひらがな、カタカナ、漢字）を抽出する正規表現
  const match = input.match(/^[\u3040-\u30FF\u4E00-\u9FFF]+/);
  return match ? match[0] : ""; // 一致した部分を返す。なければ空文字を返す
}

function checkAndRemoveWord(field, fieldWords, input) {
  if (selectedCategory !== "ENGLISH") {

    // 入力された単語が fieldWords に存在するか確認
    if (input.length !== 0) {

      // 入力文字の先頭から続く日本語部分を抽出して、フィールド内の単語と一致しているか確認
      const wordIndex = fieldWords.findIndex((word) => word === extractLeadingJapanese(input));

      if (wordIndex !== -1) {
        // 一致する単語を取得
        const matchedWord = fieldWords[wordIndex];
        // const wordLength = matchedWord.length; // 単語の文字数を取得
        fieldWords.splice(wordIndex, 1); // 単語リストから削除

        // フィールドから単語を削除して再描画
        removeWordFromField(field, matchedWord);

        calcAttackValue(matchedWord);

        updateField(field, fieldWords);

        updateAllNextGradients(wordPool, true);

        updateNextDisplay(wordPool);
        highlightMatchingCells(playerField);
        return;
      }

      const highLightWordIndex = fieldWords.findIndex((word) => word.startsWith(extractLeadingJapanese(input)));

      if (highLightWordIndex !== -1) {

        const matchedLength = extractLeadingJapanese(input).length; // 単語の文字数を取得

        highlightMatchWords(field, highLightWordIndex, matchedLength);

        return 0; // 一致しない場合は 0 を返す
      }

      resetHighlight(field);

      // プレイヤー入力時、部分一致、完全一致しなかった場合、攻撃を弱体化
      if (playerInput.length !== 0) {
        if (input === playerInput) {
          if (currentKey !== "OPTIMIST" && currentKey !== "WORDCHAINER") {
            if (currentKey === "MUSCLE") {
              chainBonus = 0;
            } else if (chainBonus === 3) {
              chainBonus = 2
            } else if (chainBonus <= 2) {
              chainBonus = 0;
            } else {
              chainBonus = chainBonus - 2;
            }
            updateChainInfoDisplay();
            nerfAttackValue();
          }
          if (currentMissTypeSoundState === 'VALID') {
            soundManager.playSound('missType');
          }
          triggerMissColorFlash(playerInputField, true);
        }
      }
      return 0; // 一致しない場合は 0 を返す
    }
  } else {
    // 入力モードが英語のとき
    // 入力文字の先頭から続く部分を抽出して、フィールド内の単語と一致しているか確認
    const wordIndex = fieldWords.findIndex((word) => word === input);

    if (wordIndex !== -1) {
      const matchedWord = fieldWords[wordIndex];
      fieldWords.splice(wordIndex, 1);
      removeWordFromField(field, matchedWord);
      calcAttackValue(matchedWord);
      updateField(field, fieldWords);
      updateAllNextGradients(wordPool, true);
      updateNextDisplay(wordPool);
      highlightMatchingCells(playerField);
      return;
    }

    const highLightWordIndex = fieldWords.findIndex((word) => word.startsWith(input));
    if (highLightWordIndex !== -1) {
      const matchedLength = input.length;
      highlightMatchWords(field, highLightWordIndex, matchedLength);
      return 0;
    }
    resetHighlight(field);
    if (playerInput.length !== 0) {
      if (input === playerInput) {
        if (currentKey !== "OPTIMIST" && currentKey !== "WORDCHAINER") {
          if (currentKey === "MUSCLE") {
            chainBonus = 0;
          } else if (chainBonus === 3) {
            chainBonus = 2
          } else if (chainBonus <= 2) {
            chainBonus = 0;
          } else {
            chainBonus = chainBonus - 2;
          }
          updateChainInfoDisplay();
          nerfAttackValue();
        }
        if (currentMissTypeSoundState === 'VALID') {
          soundManager.playSound('missType');
        }
        triggerMissColorFlash(playerInputField, true);
      }
    }
    return 0;
  }
}

function highlightMatchWords(field, highLightWordIndex, matchedLength) {
  try {
    resetHighlight(field);
    for (let x = 0; x < matchedLength; x++) {
      field[field.length - 1 - highLightWordIndex][x].isHighlighted = true;
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.log('field:', field);
    console.log('highLightWordIndex:', highLightWordIndex);
    console.log('matchedLength:', matchedLength);
    return;
  }
}

// resetHighlight関数を修正
function resetHighlight(field) {
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    for (let x = 0; x < FIELD_WIDTH; x++) {
      if (field[y][x]) {
        field[y][x].isHighlighted = false;
      }
    }
  }
}

function removeWordFromField(field, word) {
  playerWordValueToWPM++;
  // console.log(`単語「${word}」を消去`);
  let remainingWord = word;
  for (let y = FIELD_HEIGHT - 1; y >= 0; y--) { // 下から上へスキャン
    for (let x = 0; x < FIELD_WIDTH; x++) { // 左から右へスキャン
      if (field[y][x] && field[y][x].word === remainingWord[0]) {
        field[y][x] = null; // セルを空にする
        remainingWord = remainingWord.slice(1); // 残りの文字列を更新
        if (remainingWord.length === 0) {
          playerInput = ""; // 入力をリセット
          syncInputUpdate();
          resetHighlight(field);
          return;
        }
      }
    }
  }
}

// 画面フィールドをクリア
function clearField(field) {
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    for (let x = 0; x < FIELD_WIDTH; x++) {
      field[y][x] = null;
    }
  }
}

function drawInputField(ctx, inputText, inputField) {
  const textY = CELL_SIZE;
  ctx.clearRect(0, 0, inputField.getBoundingClientRect().width, inputField.getBoundingClientRect().height);
  ctx.fillStyle = '#fff';
  ctx.font = `${CELL_SIZE * 1}px "${currentfontState}", "せのびゴシック", serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(inputText, inputField.getBoundingClientRect().width / 2, textY);
}

let memorizeLastAttackValue = 0;
function calcAttackValue(removeWord) {
  playerAttackValue = removeWord.length;
  memorizeLastAttackValue = playerAttackValue;
  let firstChar = removeWord.charAt(0);
  if (lastChar === firstChar) {
    isWordChain = true;
  } else {
    isWordChain = false;
  }
  if (isWordChain) {
    connect();
  }
  else if (currentKey == "WORDCHAINER" && !isWordChain) {
    if (playerLastAttackValue - 1 === removeWord.length) {
      nerfValue = 0;
      isUpChain = true;
      if (isDownChain === true) {
        isdownChain = false;
        chainBonus = 2;
      } else if (chainBonus === 0) {
        chainBonus = 2;
      } else {
        chainBonus = chainBonus + 2;
      }
    } else if (playerLastAttackValue + 1 === removeWord.length) {
      nerfValue = 0;
      isDownChain = true;
      if (isUpChain === true) {
        isUpChain = false;
        chainBonus = 2;
      } else if (chainBonus === 0) {
        chainBonus = 2;
      } else {
        chainBonus++;
      }
    } else {
      cancelChain();
      nerfValue = 0;
    }
    updateNerfInfoDisplay();
    updateChainInfoDisplay();
    animateAttackInfo(playerAttackKind, 'MISS', 'attack-miss');
    playerLastAttackValue = memorizeLastAttackValue;
    lastChar = normalizeHiragana(removeWord.charAt(removeWord.length - 1));
    return;
  }
  else if (playerLastAttackValue - 1 === removeWord.length) {
    // console.log("upChain攻撃！ もとになる攻撃力は:" + playerAttackValue);
    isSameChar = false;
    isUpChain = true;
    upChainAttack();

  } else if (playerLastAttackValue + 1 === removeWord.length) {
    // console.log("downChain攻撃！ もとになる攻撃力は:" + playerAttackValue);
    isSameChar = false;
    isDownChain = true;
    downChainAttack();

  } else if (playerLastAttackValue === removeWord.length) {
    // console.log("sameChar攻撃！ もとになる攻撃力は:" + playerAttackValue);
    isUpChain = false;
    isDownChain = false;
    isSameChar = true;
    sameCharAttack();

  } else {
    // console.log("通常攻撃！ 攻撃力は:" + playerAttackValue);
    let calculatedAttackVal = playerAttackValue - nerfValue;
    cancelChain();
    attack(playerAttackValue);
    if (calculatedAttackVal > 0 && calculatedAttackVal !== 1) {
      onAttackShake(calculatedAttackVal);
      displayAttackValue(playerEffectOverlay, calculatedAttackVal);
    }
  }
  playerLastAttackValue = memorizeLastAttackValue;
  // 現在の removeWord の最後の文字を記憶
  lastChar = normalizeHiragana(removeWord.charAt(removeWord.length - 1));
}

function cancelChain() {
  isUpChain = false;
  isDownChain = false;
  isSameChar = false;
  chainBonus = 0;
  updateChainInfoDisplay();
}

// main.js
const MAX_SHAKE_DISTANCE = 30;
const MIN_SHAKE_DISTANCE = 5;

// 自分の画面を縦に揺らす
function triggerPlayerVerticalShake(attackValue) {

  const shakeDistance = Math.min(MAX_SHAKE_DISTANCE, Math.max(MIN_SHAKE_DISTANCE, attackValue));
  const shakeScale = shakeDistance / 200; // 例: shakeDistance=10ならscale=0.9

  playerGameArea.style.setProperty('--shake-distance', `${shakeDistance}px`);
  playerGameArea.style.setProperty('--shake-scale', `${shakeScale}`); // scale値をCSSに渡す


  playerGameArea.classList.add('shake-vertical');
  setTimeout(() => playerGameArea.classList.remove('shake-vertical'), 300);
}

// 相手のフィールドを横に揺らす
function triggerOpponentHorizontalShake(attackValue) {
  const shakeDistance = Math.min(MAX_SHAKE_DISTANCE, Math.max(MIN_SHAKE_DISTANCE, attackValue));
  opponentGameArea.style.setProperty('--shake-distance', `${shakeDistance}px`);
  opponentGameArea.classList.add('shake-horizontal');
  setTimeout(() => opponentGameArea.classList.remove('shake-horizontal'), 300);
}

// 攻撃を受けた時のシェイク（自分は横、相手は縦）
function triggerShakeOnReceive(data) {
  const { shakeDistance } = data;

  // 自分の画面を横に揺らす
  playerGameArea.style.setProperty('--shake-distance', `${shakeDistance}px`);
  playerGameArea.classList.add('shake-horizontal');
  setTimeout(() => playerGameArea.classList.remove('shake-horizontal'), 300);

  // 相手の画面を縦に揺らす
  opponentGameArea.style.setProperty('--shake-distance', `${shakeDistance}px`);
  opponentGameArea.classList.add('shake-vertical');
  setTimeout(() => opponentGameArea.classList.remove('shake-vertical'), 300);
}

// 攻撃イベントの送信
function onAttackShake(attackValue) {
  triggerPlayerVerticalShake(attackValue);
  if (isAttackShake) {
    socket.emit('attackShake', { attackValue });
    triggerOpponentHorizontalShake(attackValue);
  }
}

function triggerColorFlash(element) {
  element.classList.add('flash-effect');
  setTimeout(() => element.classList.remove('flash-effect'), 300); // アニメーション後に削除
}

function triggerMissColorFlash(element, isPlayer) {
  // console.log(element);
  element.classList.add('playerMissEffect');
  setTimeout(() => element.classList.remove('playerMissEffect'), 300); // アニメーション後に削除
  if (isPlayer) {
    socket.emit('sendPlayerMissEffect', {
    });
  }
}

const playerEffectOverlay = document.getElementById('playerEffectOverlay');
const opponentEffectOverlay = document.getElementById('opponentEffectOverlay');
resizeOverlayDivElement(playerEffectOverlay);
resizeOverlayDivElement(opponentEffectOverlay);

const playerchildEffectOverlay = document.getElementById('childEffectOverlay');
// playerchildEffectOverlay.classList.add('glowingEffect');

function displayAttackValue(element, number) {
  if (isMiss && element === playerEffectOverlay) {
    number = 0;
  };

  if (typeof number !== 'number') {
    return;
  }

  if (currentAttackSoundState === 'VALID') {
    if (number <= 10) {
      soundManager.playSound('attackWeak', { volume: 0.5 });
    } else if (number <= 15) {
      soundManager.playSound('attackNormal', { volume: 1 });
    } else if (number <= 20) {
      soundManager.playSound('attackStrong', { volume: 0.8 });
    } else {
      soundManager.playSound('attackOP', { fadeOut: 0.5, volume: 0.8 });
    }
  }

  const containerRect = element.getBoundingClientRect();
  const fontSize = (CELL_SIZE * 1.5) + number * 1.5;
  const numberElement = document.createElement('span');
  numberElement.textContent = number;
  numberElement.className = 'displayAttackValue';
  numberElement.style.fontSize = `${fontSize}px`;

  // 色を設定 (numberの値によって変化)
  if (number < 10) {
    numberElement.style.color = 'rgba(0, 0, 0, 0.9)';
  } else if (number < 20) {
    numberElement.style.color = 'rgba(255, 125, 0, 0.9)';
  } else {
    numberElement.style.color = 'rgba(255, 0, 0, 0.9)';
  }

  // 固定位置の計算（上から25%、左から75%）
  const posX = containerRect.width * 0.75;
  const posY = containerRect.height * 0.25;

  // ランダムな角度を生成（135度から45度の間）
  const randomAngle = 45 + Math.random() * (-90);

  // ランダムな移動量を生成
  const randomTranslateX = Math.random() * 100 - 100; // -10px ～ 10px
  const randomTranslateY = Math.random() * 100 - 100; // -10px ～ 10px

  // 位置とアングルを設定
  numberElement.style.left = `${posX}px`;
  numberElement.style.top = `${posY}px`;
  numberElement.style.transform = `translate(-50%, -50%) rotate(${randomAngle}deg)`;

  // DOMに追加
  element.appendChild(numberElement);

  // アニメーションの適用
  requestAnimationFrame(() => {
    numberElement.style.transform += ` translate(${randomTranslateX}px, ${randomTranslateY}px) scale(1.2)`;
    numberElement.classList.add('fade-out');
  });

  setTimeout(() => {
    numberElement.remove();
  }, 1500);

  socket.emit('syncAttackValue', {
    number: number,
    // color: numberElement.style.color,
    // fontSize: fontSize,
    // transform: numberElement.style.transform,
  });
}

function technicianAttack() {
  socket.emit('syncTechnicianAttack');
}

function attack(attackValue, isRecursive = false) {
  isMiss = false;
  if (currentKey === "MUSCLE" && !isSameChar) {
    isMiss = true;
    nerfValue = 0;
    updateNerfInfoDisplay();
    animateAttackInfo(playerAttackKind, 'MISS', 'attack-miss');
    updateChainInfoDisplay();
    drawStatusField(ctxOpponentStatus, false);
    drawStatusField(ctxPlayerStatus, true);
    socket.emit('sendAttackInfo', {
      attackType: 'MISS',
      chainBonus: playerChainBonus,
    });
    return;
  }
  // if (currentKey == "OPTIMIST") {
  //   if (getBetterRandom() < 0.3) {
  //     isMiss = true;
  //     animateAttackInfo(playerAttackKind, 'MISS', 'attack-miss');
  //     updateChainInfoDisplay();
  //     drawStatusField(ctxOpponentStatus, false);
  //     drawStatusField(ctxPlayerStatus, true);
  //     socket.emit('sendAttackInfo', {
  //       attackType: 'MISS',
  //       chainBonus: playerChainBonus,
  //     });
  //     return;
  //   }
  // }
  if (currentKey == "GAMBLER") {
    if (!isRecursive) {
      const random = getBetterRandom();
      if (nerfValue !== 0) {
        attackValue = attackValue - nerfValue;
        nerfValue = 0;
      }
      if (random < 0.25) {
        if (attackValue >= 2) {
          playerReceiveValueToOffset.push(attackValue);
          playerReceiveValueToDisplay = [...playerReceiveValueToOffset];
          playerReceiveValueToDisplay.sort((a, b) => a - b);
          drawStatusField(ctxPlayerStatus, true);
          soundManager.playSound('receiveAttack', { volume: 0.5 });
          nerfValue = 0;
        }
        isMiss = true;
        updateNerfInfoDisplay();
        animateAttackInfo(playerAttackKind, 'SELF ATTACK', 'attack-miss');
        updateChainInfoDisplay();
        drawStatusField(ctxOpponentStatus, false);
        drawStatusField(ctxPlayerStatus, true);
        socket.emit('sendAttackInfo', {
          attackType: 'SELF ATTACK',
          chainBonus: playerChainBonus,
        });
        return;
      }
      else if (random < 0.5) {
        isMiss = true;
        nerfValue = 0;
        updateNerfInfoDisplay();
        animateAttackInfo(playerAttackKind, 'MISS', 'attack-miss');
        updateChainInfoDisplay();
        drawStatusField(ctxOpponentStatus, false);
        drawStatusField(ctxPlayerStatus, true);
        socket.emit('sendAttackInfo', {
          attackType: 'MISS',
          chainBonus: playerChainBonus,
        });
        return;
      } else if (random < 0.75) {
        if (attackValue >= 2) {
          attack(attackValue, true);
        }
      } else {
        if (attackValue >= 2) {
          attack(attackValue, true);
          attack(attackValue, true);
        }
      }
    }
  }
  if (selectedCategory === "ENGLISH") {
    attackValue = attackValue - 2;
    if (attackValue < 2 || attackValue >= 11) return;
    if (nerfValue !== 0) {
      let nerfAttackValue = attackValue - nerfValue;
      if (nerfAttackValue < 2) {
        nerfValue = 0;
        updateNerfInfoDisplay();
        updateAttackInfoDisplay();
        return;
      }
    }
  }
  if (attackValue <= 1 || attackValue >= 11) return;

  // if (isPractice === true) {
  //   opponentReceiveValueToDisplay.push(attackValue);
  //   opponentReceiveValueToDisplay.sort((a, b) => a - b);
  //   drawStatusField(ctxOpponentStatus, false);
  // }

  if (gameState === "playing") {
    if (nerfValue !== 0) {
      // isNerf = true;
      let nerfAttackValue = attackValue - nerfValue;
      nerfValue = 0;

      if (nerfAttackValue < 2) {
        // console.log("ナーフで攻撃無効 nerfAttackValue:" + nerfAttackValue);
        updateNerfInfoDisplay();
        updateAttackInfoDisplay();
        emitAttackInfo();
        return;

      } else {
        // console.log("ナーフ攻撃 nerfAttackValue:" + nerfAttackValue);
        playerAttackValueToOffset = nerfAttackValue;
        playerAtteckValueToAPM += nerfAttackValue;
        calcReceiveOffsetToDisplay();
        attackValue = calcReceiveOffset();
        playerAttackValueToOffset = 0;
        if (playerReceiveValueToOffset.length === 0) {
          if (attackValue > 1) {
            isAttackShake = true;
            socket.emit('attack', {
              attackValue: attackValue
            });
          }
        } else {
          isAttackShake = false;
        }
        updateAttackInfoDisplay();
        emitAttackInfo();
      }

      updateNerfInfoDisplay();

    } else {
      // isNerf = false;
      // console.log("攻撃します攻撃力は:" + attackValue);
      playerAttackValueToOffset = attackValue;
      playerAtteckValueToAPM += attackValue;
      calcReceiveOffsetToDisplay();
      attackValue = calcReceiveOffset();
      playerAttackValueToOffset = 0;
      isAttackShake = false;
      if (playerReceiveValueToOffset.length === 0) {
        // console.log("攻撃します、攻撃力は" + attackValue);
        if (attackValue > 1) {
          isAttackShake = true;
          socket.emit('attack', {
            attackValue: attackValue
          });
        }
      }
      updateAttackInfoDisplay();
      emitAttackInfo();
    }
    drawStatusField(ctxPlayerStatus, true);
  }
}

function emitAttackInfo() {
  // 攻撃タイプの判定
  let attackType = 'Attack';
  if (isWordChain) {
    attackType = 'Connect!';
  } else if (isUpChain) {
    attackType = 'UpChain';
  } else if (isDownChain) {
    attackType = 'DownChain';
  } else if (isSameChar) {
    attackType = 'DoubleAttack';
  }

  let playerChainBonus = 0;
  if (chainBonus !== 0) {
    playerChainBonus = chainBonus;
  }

  socket.emit('sendAttackInfo', {
    attackType: attackType,
    chainBonus: playerChainBonus,
  });
}

// 攻撃情報の表示を更新する関数
function updateAttackInfoDisplay() {

  let attackType = 'Attack';
  let colorClass = 'attack-normal';
  if (isWordChain) {
    attackType = 'Connect!';
    colorClass = 'attack-connect';
  } else if (isUpChain) {
    attackType = 'UpChain';
    colorClass = 'attack-upchain';
  } else if (isDownChain) {
    attackType = 'DownChain';
    colorClass = 'attack-downchain';
  } else if (isSameChar) {
    attackType = 'DoubleAttack';
    colorClass = 'attack-double';
  }

  // 表示の更新
  // playerAttackKind.textContent = attackType;
  animateAttackInfo(playerAttackKind, attackType, colorClass);
  updateChainInfoDisplay();
  // playerChainBonus.textContent = chainBonus !== 0 ? `Chain: ${chainBonus}` : '';
}

function updateOpponentAttackInfoDisplay(attackType) {
  // 攻撃タイプに応じてcolorClassを設定
  let colorClass = 'attack-normal';
  switch (attackType) {
    case 'Connect!':
      colorClass = 'attack-connect';
      break;
    case 'UpChain':
      colorClass = 'attack-upchain';
      break;
    case 'DownChain':
      colorClass = 'attack-downchain';
      break;
    case 'DoubleAttack':
      colorClass = 'attack-double';
      break;
    case 'MISS':
      colorClass = 'attack-miss';
      break;
  }
  animateAttackInfo(opponentAttackKind, attackType, colorClass);
}

// アニメーションを適用する関数
function animateAttackInfo(element, value, colorClass) {

  // 既存のカラークラスをすべて削除
  element.classList.remove('attack-normal', 'attack-connect', 'attack-upchain', 'attack-downchain', 'attack-double', 'attack-miss');

  if (colorClass !== false) {
    // 新しいカラークラスを追加
    element.classList.add(colorClass);
  }
  // 値を設定
  element.textContent = value;

  // 既存のアニメーションをリセット
  element.classList.remove('animate');
  element.classList.add('reset-animation');

  // リフロー（強制的な再描画）をトリガー
  void element.offsetWidth;

  // リセットクラスを削除してアニメーションを開始
  element.classList.remove('reset-animation');
  element.classList.add('animate');
}

let chainBonusColor;

function updateChainInfoDisplay() {
  if (currentKey == "TECHNICIAN") {
    if (chainBonus >= 5) {
      chainBonus = chainBonus - 5;
      attack(5);
      technicianAttack();
    }
  }
  if (chainBonus !== 0) {
    chainBonusColor = "rgb(0, 255, 0)";
    if (isUpChain === true) {
      chainBonusColor = "rgb(0, 255, 255)";
    }
    else if (isDownChain === true) {
      chainBonusColor = "rgb(255, 0, 255)";
    }
    document.documentElement.style.setProperty('--chainColor', chainBonusColor);

    animateAttackInfo(playerChainBonus, `Chain: ${chainBonus}`, false);

  } else {
    // フェードアウトアニメーションを適用
    playerChainBonus.classList.remove('animate');
    playerChainBonus.classList.add('fade-out');

    // アニメーション終了後に空文字列を設定
    setTimeout(() => {
      playerChainBonus.textContent = '';
      playerChainBonus.classList.remove('fade-out');
    }, 500); // フェードアウトアニメーションの時間と同じ
  }
  emitChainInfo();
}

function emitChainInfo() {
  socket.emit('sendChainInfo', {
    chainBonus: chainBonus,
    chainBonusColor: chainBonusColor,
  });
}

function updateOpponentChainInfoDisplay(chainBonus) {
  if (chainBonus !== 0) {
    animateAttackInfo(opponentChainBonus, `Chain: ${chainBonus}`, false);
  } else {
    // フェードアウトアニメーションを適用
    opponentChainBonus.classList.remove('animate');
    opponentChainBonus.classList.add('fade-out');

    // アニメーション終了後に空文字列を設定
    setTimeout(() => {
      opponentChainBonus.textContent = '';
      opponentChainBonus.classList.remove('fade-out');
    }, 500); // フェードアウトアニメーションの時間と同じ
  }
}

function updateNerfInfoDisplay() {
  // console.log("updateNerfInfoDisplay実行");
  // playerNerfValue.textContent = nerfValue !== 0 ? `Nerf: ${nerfValue}` : '';
  if (nerfValue !== 0) {
    animateAttackInfo(playerNerfValue, `Nerf: ${nerfValue}`, false);
  } else {
    // フェードアウトアニメーションを適用
    playerNerfValue.classList.remove('animate');
    playerNerfValue.classList.add('fade-out');

    // アニメーション終了後に空文字列を設定
    setTimeout(() => {
      playerNerfValue.textContent = '';
      playerNerfValue.classList.remove('fade-out');
    }, 500); // フェードアウトアニメーションの時間と同じ
  }
  emitNerfInfo();
}

function emitNerfInfo() {
  socket.emit('sendNerfInfo', {
    nerfValue: nerfValue,
  });
}

function updateOpponentNerfInfoDisplay(nerfValue) {
  opponentNerfValue.textContent = nerfValue !== 0 ? `Nerf: ${nerfValue}` : '';
  if (nerfValue !== 0) {
    animateAttackInfo(opponentNerfValue, `Nerf: ${nerfValue}`, false);
  } else {
    // フェードアウトアニメーションを適用
    opponentNerfValue.classList.remove('animate');
    opponentNerfValue.classList.add('fade-out');

    // アニメーション終了後に空文字列を設定
    setTimeout(() => {
      opponentNerfValue.textContent = '';
      opponentNerfValue.classList.remove('fade-out');
    }, 500); // フェードアウトアニメーションの時間と同じ
  }
}

function wordChainerAttack(total) {
  while (total > 0) {
    let attackValue;
    if (selectedCategory !== "ENGLISH") {
      attackValue = Math.floor(Math.random() * 9) + 2;
      if (total - attackValue < 2) {
        attackValue = Math.max(2, total - 2);
      } else if (attackValue > total) {
        attackValue = total;
      }
    } else {
      attackValue = Math.floor(Math.random() * 9) + 4;
      if (total - attackValue < 4) {
        attackValue = Math.max(4, total - 4);
      } else if (attackValue > total) {
        attackValue = total;
      }
    }
    if (attackValue > total) {
      attackValue = total;
    }
    attack(attackValue);
    total -= attackValue;
  }
}

function connect() {
  if (currentKey == "WORDCHAINER") {
    let calculatedAttackVal = 20;
    isUpChain = false;
    isDownChain = false;
    isSameChar = false;
    chainBonus += 5;
    calculatedAttackVal = calculatedAttackVal + chainBonus;
    wordChainerAttack(20);
    if (chainBonus > 10) {
      let toCalcChainBonusAttack = chainBonus;
      while (toCalcChainBonusAttack > 10) {
        attack(10);
        toCalcChainBonusAttack -= 10;
      }
      attack(toCalcChainBonusAttack);
    } else {
      attack(chainBonus);
    }
    if (calculatedAttackVal > 1) {
      onAttackShake(calculatedAttackVal);
      displayAttackValue(playerEffectOverlay, calculatedAttackVal);
    }
  } else {
    let calculatedAttackVal = playerAttackValue;
    if (nerfValue !== 0) {
      calculatedAttackVal = playerAttackValue - nerfValue;
      if (calculatedAttackVal < 2) {
        calculatedAttackVal = 0
      }
    }
    isUpChain = false;
    isDownChain = false;
    attack(playerAttackValue);

    if (chainBonus !== 0) {
      if (chainBonus > 10) {
        let toCalcChainBonusAttack = chainBonus;
        while (toCalcChainBonusAttack > 10) {
          attack(10); // 10を減らす
          toCalcChainBonusAttack -= 10;
        }
        attack(toCalcChainBonusAttack);
      } else if (chainBonus > 1) {
        attack(chainBonus);
      }
    }
    calculatedAttackVal = calculatedAttackVal + chainBonus;
    if (chainBonus % 10 === 1) {
      calculatedAttackVal -= 1;
    }
    if (calculatedAttackVal > 1) {
      onAttackShake(calculatedAttackVal);
      displayAttackValue(playerEffectOverlay, calculatedAttackVal);
    }
  }
}

function upChainAttack() {

  let calculatedAttackVal = playerAttackValue;
  if (nerfValue !== 0) {
    calculatedAttackVal = playerAttackValue - nerfValue;
    if (calculatedAttackVal < 2) {
      calculatedAttackVal = 0
    }
  }

  if (isDownChain === true) {
    isDownChain = false;
    if (currentKey === "MUSCLE") {
      chainBonus = 0;
    } else if (currentKey === "GAMBLER") {
      const bonus = Math.floor(Math.random() * 5);
      chainBonus = bonus;
    } else if (currentKey === "OPTIMIST") {
      chainBonus = 3;
    } else {
      chainBonus = 2;
    }
    attack(playerAttackValue);
    attack(chainBonus);
    calculatedAttackVal = calculatedAttackVal + chainBonus;
    onAttackShake(calculatedAttackVal);
    displayAttackValue(playerEffectOverlay, calculatedAttackVal);

    // console.log("upChainAttackに切り替わったのでchainBonusは2");
    // console.log("isDownChainは" + isDownChain);
    // console.log("isUpChainは" + isUpChain);
    return;
  }
  if (chainBonus === 0) {
    if (currentKey === "MUSCLE") {
      chainBonus = 0;
    } else if (currentKey === "GAMBLER") {
      const bonus = Math.floor(Math.random() * 5);
      chainBonus = bonus;
    } else if (currentKey === "OPTIMIST") {
      chainBonus = 3;
    } else {
      chainBonus = 2;
    }
    attack(playerAttackValue);
    attack(chainBonus);
    // console.log("初めてのchainBonusは" + chainBonus);
  } else {
    if (currentKey === "MUSCLE") {
      chainBonus = 0;
    } else if (currentKey === "GAMBLER") {
      const bonus = Math.floor(Math.random() * 5);
      chainBonus += bonus;
    } else {
      if (currentKey === "OPTIMIST") {
        chainBonus = chainBonus + 3;
      } else {
        chainBonus = chainBonus + 2;
      }
    }
    if (chainBonus > 10) {
      attack(playerAttackValue);
      let toCalcChainBonusAttack = chainBonus;
      while (toCalcChainBonusAttack > 10) {
        attack(10); // 10を減らす
        toCalcChainBonusAttack -= 10;
      }
      if (toCalcChainBonusAttack > 1) {
        attack(toCalcChainBonusAttack);
      }
    } else {
      attack(playerAttackValue);
      attack(chainBonus);
    }
  }
  calculatedAttackVal = calculatedAttackVal + chainBonus;
  if (chainBonus % 10 === 1) {
    calculatedAttackVal -= 1;
  }
  if (chainBonus > 10) {
    if (currentKey === "OPTIMIST") {
      chainBonus = 0;
      updateChainInfoDisplay();
    }
  }
  onAttackShake(calculatedAttackVal);
  displayAttackValue(playerEffectOverlay, calculatedAttackVal);
}

function downChainAttack() {

  let calculatedAttackVal = playerAttackValue;
  if (nerfValue !== 0) {
    calculatedAttackVal = playerAttackValue - nerfValue;
    if (calculatedAttackVal < 2) {
      calculatedAttackVal = 0
    }
  }

  if (isUpChain === true) {
    isUpChain = false;
    if (currentKey === "MUSCLE") {
      chainBonus = 0;
    } else {
      if (currentKey === "GAMBLER") {
        const bonus = Math.floor(Math.random() * 5);
        chainBonus = bonus;
      } else if (currentKey === "OPTIMIST") {
        chainBonus = 3;
      } else {
        chainBonus = 2;
      }
    }
    attack(playerAttackValue);
    attack(chainBonus);
    calculatedAttackVal = calculatedAttackVal + chainBonus;
    onAttackShake(calculatedAttackVal);
    displayAttackValue(playerEffectOverlay, calculatedAttackVal);
    return;
  }
  if (chainBonus === 0) {
    if (currentKey === "MUSCLE") {
      chainBonus = 0;
    } else if (currentKey === "GAMBLER") {
      const bonus = Math.floor(Math.random() * 5);
      chainBonus = bonus;
    } else if (currentKey === "OPTIMIST") {
      chainBonus = 3;
    } else {
      chainBonus = 2;
    }
    attack(playerAttackValue);
    attack(chainBonus);
  } else {
    if (currentKey === "MUSCLE") {
      chainBonus = 0;
    } else if (currentKey === "GAMBLER") {
      const bonus = Math.floor(Math.random() * 5);
      chainBonus += bonus;
    } else {
      if (currentKey === "OPTIMIST") {
        chainBonus = chainBonus + 3;
      } else {
        chainBonus++;
      }
    }
    if (chainBonus > 10) {

      attack(playerAttackValue);

      let toCalcChainBonusAttack = chainBonus;
      while (toCalcChainBonusAttack > 10) {
        attack(10); // 10を減らす
        toCalcChainBonusAttack -= 10;
      }
      if (toCalcChainBonusAttack > 1) {
        attack(toCalcChainBonusAttack);
      }
    } else {
      attack(playerAttackValue);
      attack(chainBonus);
    }
  }
  calculatedAttackVal = calculatedAttackVal + chainBonus;
  if (chainBonus % 10 === 1) {
    calculatedAttackVal -= 1;
  }
  if (chainBonus > 10) {
    if (currentKey === "OPTIMIST") {
      chainBonus = 0;
      updateChainInfoDisplay();
    }
  }
  onAttackShake(calculatedAttackVal);
  displayAttackValue(playerEffectOverlay, calculatedAttackVal);
}

function sameCharAttack() {

  let calculatedAttackVal

  if (currentKey === "MUSCLE") {
    chainBonus += 1;
    calculatedAttackVal = playerAttackValue * 3 + chainBonus * 3;
  } else {
    calculatedAttackVal = playerAttackValue * 2 + chainBonus * 2;
  }

  if (nerfValue !== 0) {
    if (nerfValue >= 10) {
      nerfValue = 10;
    }
    calculatedAttackVal = calculatedAttackVal - nerfValue;
    if ((calculatedAttackVal >= 10) && (calculatedAttackVal % 10 < 2)) {
      calculatedAttackVal = calculatedAttackVal - (calculatedAttackVal % 10)
    }
    if (calculatedAttackVal < 2) {
      calculatedAttackVal = 0;
    }
  }

  if (currentKey === "MUSCLE") {
    playerAttackValue = playerAttackValue * 3 + chainBonus * 3
  } else {
    playerAttackValue = playerAttackValue * 2 + chainBonus * 2
    chainBonus = 0;
    if (currentKey === "TECHNICIAN" && calculatedAttackVal >= 20) {
      calculatedAttackVal = calculatedAttackVal - 10;
      playerAttackValue = playerAttackValue - 10;
      technicianAttack();
    }
  }

  if (playerAttackValue > 10) {
    while (playerAttackValue > 10) {
      attack(10); // 10を減らす
      playerAttackValue -= 10;
    }

    if (playerAttackValue === 10) {
      const array = [2, 3, 4, 5, 6, 7, 8];
      const randomValue = array[Math.floor(Math.random() * array.length)];
      attack(randomValue); // ランダム値を攻撃
      attack(10 - randomValue); // 残りの値を攻撃
    } else if (playerAttackValue > 1) {
      attack(playerAttackValue); // 10未満の残りの値を攻撃
    }
  } else {
    attack(playerAttackValue);
  }
  // console.log("DoubleAttack! 攻撃力は:" + playerAttackValue);
  onAttackShake(calculatedAttackVal);
  displayAttackValue(playerEffectOverlay, calculatedAttackVal);
}

function nerfAttackValue() {
  if (currentKey === "MUSCLE") {
    nerfValue = 10;
  } else {
    nerfValue = nerfValue + 1;
  }
  updateNerfInfoDisplay();
}

// ゲームリセット関数
function resetGame() {
  soundManager.stop('warning');

  // ゲーム状態のリセット
  // gameState = 'waiting';
  isGameOver = false;
  gameStepInterval = 10000;

  // プレイヤーデータのリセット
  playerField = Array(FIELD_HEIGHT).fill().map(() => Array(FIELD_WIDTH).fill(null));
  playerFieldWords = [];
  playerInput = '';
  playerUsedLengths = [];
  playerAttackValue = 0;
  playerLastAttackValue = 0;
  playerAttackValueToOffset = 0;
  playerReceiveValueToOffset = [];
  playerAttackValueToDisplay = [];
  playerReceiveValueToDisplay = [];
  lastChar = "";
  isWordChain = false;
  nerfValue = 0;
  memorizeLastAttackValue = 0;

  charColorMap.clear();
  usedColors.clear();

  cancelChain();
  stopDrawInfo()

  clearProgressBar();
  clearTimeout(gameStepTimeoutId);

  // playerInfoをリセット
  playerKeyValueToKPM = 0;
  playerAtteckValueToAPM = 0;
  playerWordValueToWPM = 0;
  totalTime = 0;

  // 相手のデータもリセット
  opponentField = Array(FIELD_HEIGHT).fill().map(() => Array(FIELD_WIDTH).fill(null));
  opponentFieldWords = [];
  opponentInput = '';

  // キャンバスをクリア
  clearField(playerField);
  clearField(opponentField);
  drawField(ctxPlayer, playerField, memorizeLastAttackValue);
  drawField(ctxOpponent, opponentField, 0);
  drawInputField(ctxPlayerInput, '', playerInputField);
  drawInputField(ctxOpponentInput, '', opponentInputField);
  drawStatusField(ctxPlayerStatus, true);
  cleanupWarningAnimations();
  removeAuraEffectFromOverlay(playerOverlayElement);
  removeAuraEffectFromOverlay(opponentOverlayElement);

}

// カウントダウン表示
function showCountdown(count, elementId) {
  const overlay = document.getElementById(elementId);
  const countElement = document.createElement('div');

  // -webkit-text-stroke: 2px white;
  countElement.style.cssText = `
    position: absolute;
    top: 45%;
    left: 50%;
    color: white;
    font-size: 8vh;
    animation: countdownAnimation 0.9s ease-in forwards;
    transform-origin: center; 
  `;

  // アニメーションのキーフレーム定義を追加
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes countdownAnimation {
      0% {
        transform: translate(-45%, -40%) scaleX(2) scaleY(2);
        opacity: 1;
      }
      100% {
        transform: translate(-45%, -40%) scaleX(1.5) scaleY(1.5);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(styleSheet);

  countElement.textContent = count;
  overlay.appendChild(countElement);

  // アニメーション終了後に要素を削除
  setTimeout(() => {
    overlay.removeChild(countElement);
    // document.head.removeChild(styleSheet);
  }, 900);
}

function startCountdown() {
  // console.log(isDisConnect);
  if (isDisConnect) return;

  resetGame();
  gameState = 'countdown';
  let count = 3;
  const countInterval = setInterval(() => {


    if (count > 0) {
      // プレイヤーと相手両方の要素にカウントダウンを表示
      showCountdown(count, 'playerChildEffectOverlay');
      showCountdown(count, 'opponentChildEffectOverlay');

      if (currentCountdownSoundState === 'VALID') {
        soundManager.playSound('countdown', { fade: 0.2, volume: 1 });
      }

    } else if (count === 0) {
      // GOの表示
      showCountdown('GO!!', 'playerChildEffectOverlay');
      showCountdown('GO!!', 'opponentChildEffectOverlay');

      if (currentCountdownSoundState === 'VALID') {
        soundManager.playSound('countdown', { rate: 2, volume: 1.5 });
      }


    } else {
      clearInterval(countInterval);
      if (isDisConnect) return;
      gameState = 'playing';
      startGame();
      switch (currentBGMState) {
        case 'Consecutive Battle':
          soundManager.playSound('Consecutive Battle', { volume: 0.6, loop: true });
          break;
        case 'Lightning Brain':
          soundManager.playSound('Lightning Brain', { volume: 0.6, loop: true });
          break;
        case 'R.E.B.O.R.N':
          soundManager.playSound('R.E.B.O.R.N', { volume: 0.6, loop: true });
          break;
        case 'OFF':
          break;
      }
    }
    count--;
  }, 1000);
}

// リトライダイアログ表示
function showRetryDialog() {
  if (retryDialog) return;

  retryDialog = document.createElement('div');
  // retryDialog.style.cssText = `
  //   position: fixed;
  //   top: 50%;
  //   left: 50%;
  //   transform: translate(-50%, -50%);
  //   background-color: rgba(0, 0, 0, 0);
  //   color: white;
  //   padding: 20px;
  //   border-radius: 10px;
  //   font-family: '851Gkktt';
  //   font-size: 1.5vw;
  //   text-align: center;
  //   z-index: 1000;
  // `;

  retryDialog.innerHTML = `
    <div class="retryDialog dialog-content">
      <h2>もう一度プレイしますか？</h2>
      <div class="dialog-buttons">
        <button id="yesButton" class="retryDialogButton dialogButton" onclick="handleRetryResponse(true)">
          Yes
        </button>
        <button id="noButton" class="retryDialogButton dialogButton" onclick="handleRetryResponse(false)">
          No
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(retryDialog);
  const dialogButton = document.querySelectorAll('.retryDialogButton');
  dialogButton.forEach(button => {
    button.addEventListener('mouseenter', () => {
      if (currentButtonSoundState === 'VALID') {
        soundManager.playSound('buttonHover', { volume: 1.2 });
      }
    });
    button.addEventListener('click', () => {
      if (currentButtonSoundState === 'VALID') {
        soundManager.playSound('buttonClick', { volume: 0.5 });
      }
    });
  });
}

// 追加のJavaScript
const playerStatusElement = document.getElementById('playerStatusField');
const opponentStatusElement = document.getElementById('opponentStatusField');
const ctxPlayerStatus = playerStatusElement.getContext('2d');
const ctxOpponentStatus = opponentStatusElement.getContext('2d');

// グローバル変数に追加
let opponentReceiveValueToDisplay = [];

// ステータスフィールドのサイズ設定関数
function resizeStatusField(canvas) {
  const dpr = window.devicePixelRatio || 1;
  CELL_SIZE = calculateCellSize();

  const width = CELL_SIZE / 2; // 幅はセルの半分
  const height = CELL_SIZE * FIELD_HEIGHT;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
}

// オーバーレイのリサイズ関数を修正
function resizeWarningOverlay(overlayElement) {
  const dpr = window.devicePixelRatio || 1;
  const width = CELL_SIZE * FIELD_WIDTH + 3;
  const height = CELL_SIZE * FIELD_HEIGHT + 3;

  // 実際の解像度を高く設定
  overlayElement.width = width * dpr;
  overlayElement.height = height * dpr;

  // CSSスタイルとして見た目のサイズを設定
  overlayElement.style.width = `${width}px`;
  overlayElement.style.height = `${height}px`;

  // コンテキストをスケーリング
  const ctx = overlayElement.getContext('2d');
  ctx.scale(dpr, dpr);

  // statusFieldの幅を考慮して位置を調整
  overlayElement.style.top = `1.5px`;
  overlayElement.style.left = `${CELL_SIZE / 2 + 3.5}px`;
}


// setupWarningOverlay関数を修正
function setupWarningOverlay() {
  const playerWrapper = document.querySelector('#playerGameArea .field-wrapper');
  const opponentWrapper = document.querySelector('#opponentGameArea .field-wrapper');

  // プレイヤー側のオーバーレイ
  const playerOverlay = document.createElement('canvas');
  playerOverlay.id = 'playerWarningOverlay';
  playerOverlay.style.position = 'absolute';
  playerOverlay.style.pointerEvents = 'none';
  playerWrapper.style.position = 'relative';
  playerWrapper.appendChild(playerOverlay);

  // 対戦相手側のオーバーレイ
  const opponentOverlay = document.createElement('canvas');
  opponentOverlay.id = 'opponentWarningOverlay';
  opponentOverlay.style.position = 'absolute';
  opponentOverlay.style.pointerEvents = 'none';
  opponentWrapper.style.position = 'relative';
  opponentWrapper.appendChild(opponentOverlay);

  // 初期サイズを設定
  resizeWarningOverlay(playerOverlay);
  resizeWarningOverlay(opponentOverlay);

  return {
    playerCtx: playerOverlay.getContext('2d'),
    opponentCtx: opponentOverlay.getContext('2d'),
    playerOverlay,
    opponentOverlay
  };
}

// グローバル変数として追加したoverlayContextsの定義を修正
const overlayContexts = setupWarningOverlay();
const warningState = {
  player: {
    isVisible: false,
    interval: null
  },
  opponent: {
    isVisible: false,
    interval: null
  }
};

// 警告オーバーレイを描画する関数を修正
function drawWarningOverlay(isPlayer) {
  const ctx = isPlayer ? overlayContexts.playerCtx : overlayContexts.opponentCtx;
  const state = isPlayer ? warningState.player : warningState.opponent;

  // オーバーレイをクリア
  ctx.clearRect(0, 0, CELL_SIZE * FIELD_WIDTH, CELL_SIZE * FIELD_HEIGHT);

  if (state.isVisible) {
    // グラデーションの作成
    const centerX = CELL_SIZE * FIELD_WIDTH / 2;
    const centerY = CELL_SIZE * FIELD_HEIGHT / 2;

    // 対角線の長さを計算して、グラデーションの半径とする
    const radius = Math.sqrt(Math.pow(CELL_SIZE * FIELD_WIDTH, 2) + Math.pow(CELL_SIZE * FIELD_HEIGHT, 2)) / 2;

    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,          // 内側の円の中心座標とサイズ
      centerX, centerY, radius      // 外側の円の中心座標とサイズ
    );

    // グラデーションの色を設定
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.05)');   // 中心は薄く
    gradient.addColorStop(0.8, 'rgba(255, 0, 0, 0.15)'); // 中間
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0.3)');   // 端は濃く

    // グラデーションを適用して描画
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CELL_SIZE * FIELD_WIDTH, CELL_SIZE * FIELD_HEIGHT);
  }
}

// drawStatusField関数を修正
function drawStatusField(ctx, isPlayer = true) {
  if (gameState !== 'playing') return;
  // 既存のステータス描画処理
  ctx.fillStyle = "#13172c";
  ctx.fillRect(0, 0, CELL_SIZE / 2, CELL_SIZE * FIELD_HEIGHT);

  const displayValues = isPlayer ? playerReceiveValueToDisplay : opponentReceiveValueToDisplay;
  const fieldWords = isPlayer ? playerFieldWords : opponentFieldWords;
  const state = isPlayer ? warningState.player : warningState.opponent;

  // オーバーフロー状態の確認
  const isOverflowing = displayValues.length + fieldWords.length > FIELD_HEIGHT;

  // 警告アニメーションの管理
  if (isOverflowing && !state.interval) {
    // アニメーション開始

    if (currentWarningSoundState === 'VALID') {
      soundManager.playSound('warning', { volume: 0.8, loop: true });
    }

    state.interval = setInterval(() => {
      state.isVisible = !state.isVisible;
      drawWarningOverlay(isPlayer);
    }, 500);
  } else if (!isOverflowing && state.interval) {
    // オーバーフローが解消されたら該当プレイヤーのアニメーションのみを停止
    soundManager.stop('warning');
    clearInterval(state.interval);
    state.interval = null;
    state.isVisible = false;
    drawWarningOverlay(isPlayer);
  }

  // 既存の値表示処理
  if (displayValues.length > 0) {
    const startY = CELL_SIZE * (FIELD_HEIGHT - displayValues.length);

    for (let i = 0; i < displayValues.length; i++) {
      const cellY = startY + (i * CELL_SIZE);

      let fillColor = "rgb(135, 0, 0)";
      let fillStyle = "white";

      if (displayValues[i] === memorizeLastAttackValue - 1) {
        fillColor = "rgba(0, 255, 255, 0.5)";
      } else if (displayValues[i] === memorizeLastAttackValue + 1) {
        fillColor = "rgba(255, 0, 255, 0.5)";
      } else if (displayValues[i] === memorizeLastAttackValue) {
        fillColor = "rgba(255, 255, 255, 0.5)";
        fillStyle = 'black';
      }
      ctx.fillStyle = fillColor;

      // ctx.fillStyle = "rgb(135, 0, 0)";
      ctx.fillRect(0, cellY, CELL_SIZE / 2, CELL_SIZE);

      // ctx.fillStyle = "white";
      ctx.fillStyle = fillStyle;

      ctx.font = `${CELL_SIZE * 0.5}px 'kirin'`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.letterSpacing = "0.05em"

      const textX = CELL_SIZE / 4;
      const textY = cellY + (CELL_SIZE / 1.9);

      ctx.fillText(displayValues[i], textX, textY);
    }
  }

  // プレイヤーの状態を送信
  if (isPlayer && socket) {
    socket.emit('statusFieldUpdate', {
      receiveValues: playerReceiveValueToDisplay
    });
  }
}

// ゲーム終了時にクリーンアップを行う関数
function cleanupWarningAnimations() {
  // プレイヤー側のアニメーションをクリア
  if (warningState.player.interval) {
    clearInterval(warningState.player.interval);
    warningState.player.interval = null;
    warningState.player.isVisible = false;
  }

  // 対戦相手側のアニメーションをクリア
  if (warningState.opponent.interval) {
    clearInterval(warningState.opponent.interval);
    warningState.opponent.interval = null;
    warningState.opponent.isVisible = false;
  }

  // オーバーレイをクリア
  overlayContexts.playerCtx.clearRect(0, 0, CELL_SIZE * FIELD_WIDTH, CELL_SIZE * FIELD_HEIGHT);
  overlayContexts.opponentCtx.clearRect(0, 0, CELL_SIZE * FIELD_WIDTH, CELL_SIZE * FIELD_HEIGHT);
}

// inputFieldの高さを取得
const inputHeight = playerInputField.getBoundingClientRect().height;

// infoFieldWrapperの全ての要素を取得
const infoFieldWrappers = document.getElementsByClassName("infoFieldWrapper");

// 新しいマージンサイズを計算
const newMarginSize = `${inputHeight}px`;
// console.log(newMarginSize);

const unitChair = "/M"

// 各infoFieldWrapperに対してCSS変数を設定
Array.from(infoFieldWrappers).forEach((wrapper) => {
  wrapper.style.setProperty('--base-size', newMarginSize);
});

// 値を描写する関数
let drawInfoInterval;

function drawInfo() {
  let emitCounter = 0; // 送信タイミング制御用のカウンタ

  drawInfoInterval = setInterval(() => {
    if (gameState !== 'playing') {
      return;
    }

    // 0.1秒ごとに値を更新
    totalTime++; // 0.1秒追加

    // 秒と分を計算
    const minutes = Math.floor(totalTime / 600); // 600 = 60秒 * 10
    const seconds = Math.floor((totalTime % 600) / 10); // 秒部分
    const tenths = totalTime % 10; // 小数点第1位部分

    // 時間をフォーマット
    timeText = `${minutes}:${seconds.toString().padStart(2, "0")}.${tenths}`;

    // 値を動的に計算・更新（例: 適当に増加させる）
    playerKPMValue = playerKeyValueToKPM / totalTime * 600;
    playerAPMValue = playerAtteckValueToAPM / totalTime * 600;
    playerWPMValue = playerWordValueToWPM / totalTime * 600;

    // 各div要素に値を描画
    kpmText = `${playerKPMValue.toFixed(2)}/M`;
    apmText = `${playerAPMValue.toFixed(2)}/M`;
    wpmText = `${playerWPMValue.toFixed(2)}/M`;

    mainKPMText = kpmText.slice(0, -4);
    mainAPMText = apmText.slice(0, -4);
    mainWPMText = wpmText.slice(0, -4);
    mainTimeText = timeText.slice(0, -2);

    toSmallKPMChars = kpmText.slice(-4);
    toSmallAPMChars = apmText.slice(-4);
    toSmallWPMChars = wpmText.slice(-4);
    toSmallTimeText = timeText.slice(-2);

    kpmDiv.innerHTML = `${mainKPMText}<span class="smallText">${toSmallKPMChars}</span>`;
    apmDiv.innerHTML = `${mainAPMText}<span class="smallText">${toSmallAPMChars}</span>`;
    wpmDiv.innerHTML = `${mainWPMText}<span class="smallText">${toSmallWPMChars}</span>`;
    for (let timeDiv of timeDivs) {
      timeDiv.innerHTML = `${mainTimeText}<span class="smallText">${toSmallTimeText}</span>`;
    }

    // 相手に情報を送信
    // カウンタをインクリメント
    emitCounter++;

    // 1秒ごとに情報を送信
    if (emitCounter >= 10) { // 10 * 0.1秒 = 1秒
      socket.emit('playerInfoUpdate', {
        kpm: { main: mainKPMText, small: toSmallKPMChars },
        apm: { main: mainAPMText, small: toSmallAPMChars },
        wpm: { main: mainWPMText, small: toSmallWPMChars },
      });

      emitCounter = 0; // カウンタをリセット
    }

  }, 100);
}

// 停止させたい場合
function stopDrawInfo() {
  if (drawInfoInterval) {
    clearInterval(drawInfoInterval);
    drawInfoInterval = null;
  }
}

// ボタンのイベントリスナー設定
document.querySelector('.random-match').addEventListener('click', () => {
  if (gameState !== 'normal') {
    return;
  }
  isDisConnect = false;
  startRandomMatch();
});

document.querySelector('.room-match').addEventListener('click', () => {
  if (gameState !== 'normal') {
    return;
  }
  isDisConnect = false;
  showRoomMatchDialog();
});

// ランダムマッチング開始
function startRandomMatch() {
  gameState = "randomMatch";
  if (!socket) {
    initializeSocket();
  }
  socket.emit('findMatch');
  showLoadingOverlay('対戦相手を探しています...');
}

// let peerConnection = null;
// let dataChannel;

// function startRandomMatch() {
//     // WebRTC接続の再初期化を確実に行う
//     peerConnection = new RTCPeerConnection({
//       iceServers: [
//           { urls: 'stun:stun.l.google.com:19302' },
//           { urls: 'stun:stun1.l.google.com:19302' }
//       ]
//   });

//   // データチャネルの作成
//   dataChannel = peerConnection.createDataChannel("gameChannel");

//   // イベントリスナーの設定
//   setupPeerConnectionListeners();

//   // オファーの生成と送信
//   peerConnection.createOffer()
//       .then(offer => peerConnection.setLocalDescription(offer))
//       .then(() => {
//           socket.emit('webrtc-offer', {
//               offer: peerConnection.localDescription
//           });
//       })
//       .catch(error => {
//           console.error('オファー生成エラー:', error);
//       });

//   showLoadingOverlay('対戦相手を探しています...');
// }


// function setupPeerConnectionListeners() {
//   if (!peerConnection) return;

//   peerConnection.onicecandidate = (event) => {
//       if (event.candidate) {
//           socket.emit('ice-candidate', event.candidate);
//       }
//   };

//   peerConnection.ondatachannel = (event) => {
//       dataChannel = event.channel;
//       dataChannel.onopen = () => {
//           gameState = "playing";
//           showMatchingSuccess();
//           console.log('P2P接続確立');
//       };
//   };
// }

let isRoomMatch = false;
// ルームマッチングダイアログ表示
function showRoomMatchDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'room-match-dialog';
  dialog.innerHTML = `
    <div class="dialog-content">
      <h2>INPUT ROOM NUMBER</h2>
      <input type="text" id="roomInput" maxlength="4" placeholder="4桁の数字を入力" pattern="[0-9]*" inputmode="numeric">
      <div class="dialog-buttons">
        <button id="connectButton" class="dialogButton connectButton">CONNECT</button>
        <button id="cancelButton"  class="dialogButton cancelButton">CANCEL</button>
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

  isRoomMatch = true;

  const roomInput = dialog.querySelector('#roomInput');
  const connectButton = dialog.querySelector('#connectButton');
  const cancelButton = dialog.querySelector('#cancelButton');

  roomInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    connectButton.disabled = e.target.value.length !== 4;
    if (e.target.value.length === 4) {
      // connectButton.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
      connectButton.style.border = "solid 1px rgb(0, 255, 0)";
      connectButton.style.color = "rgb(0, 255, 0)";
      connectButton.style.cursor = 'pointer';
    } else {
      connectButton.style.border = 'solid 1px rgba(204, 204, 204, 0.5)';
      connectButton.style.color = "rgba(204, 204, 204, 0.5)";
      connectButton.style.cursor = 'not-allowed';
    }

  });

  connectButton.addEventListener('click', () => {
    gameState = "roomMatch";
    isRoomMatch = false;
    const roomNumber = roomInput.value;
    if (roomNumber.length === 4) {
      joinRoom(roomNumber);
      dialog.remove();
    }
  });

  cancelButton.addEventListener('click', () => {
    disconnectSocket();
    isRoomMatch = false;
    dialog.remove();
  });
}

// ルーム参加処理
function joinRoom(roomNumber) {
  if (!socket) {
    initializeSocket();
  }
  socket.emit('joinRoom', roomNumber);
  showLoadingOverlay('ルームに接続しています...');
}

// ローディングオーバーレイ表示/非表示
function showLoadingOverlay(message) {
  const overlay = document.querySelector('.overlay');
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="spinner"></div>
      <p>${message}</p>
      <button class="dialogButton cancelButton">CANCEL</button>
    </div>
  `;
  overlay.style.display = 'flex';
  // キャンセルボタンのイベントリスナーを追加
  const cancelButton = overlay.querySelector('.cancelButton');
  cancelButton.addEventListener('mouseenter', () => {
    if (currentButtonSoundState === 'VALID') {
      soundManager.playSound('buttonHover', { volume: 1.2 });
    }
  });
  cancelButton.addEventListener('click', () => {
    if (currentButtonSoundState === 'VALID') {
      soundManager.playSound('buttonClick', { volume: 0.5 });
    }
    if (gameState === "randomMatch") {
      cancelRandomMatch();
    } else {
      cancelRoomMatch();
      isRoomMatch = false;
    }
    disconnectSocket();
    gameState = "normal";
  });
}

function cancelRandomMatch() {
  if (socket) {
    socket.emit('cancelMatch');
  }
  hideLoadingOverlay();
}

// ルームマッチングのキャンセル処理
function cancelRoomMatch() {
  if (socket) {
    socket.emit('cancelRoomMatch');
  }
  hideLoadingOverlay();
}

function hideLoadingOverlay() {
  const overlay = document.querySelector('.overlay');
  overlay.style.display = 'none';
}

// マッチング成功時の表示
function showMatchingSuccess() {
  const overlay = document.querySelector('.overlay');
  overlay.innerHTML = `
    <div class="matching-success">
      <h2>対戦相手が見つかりました！</h2>
      <p>まもなくゲームが開始します...</p>
    </div>
  `;
  setTimeout(() => {
    gameState = "playing";
    hideLoadingOverlay();
    startCountdown();
  }, 2000);
}

function disconnectSocket() {
  if (socket) {
    socket.emit('cancelSearch');
    // socket.disconnect();
  } else {
    return;
  }
}


function initializeSocket() {

  // ここからRender用追記
  // const socketUrl = window.location.hostname === 'localhost'
  //   ? 'http://localhost:3000'
  //   : 'https://puzztype.onrender.com';

  const socketUrl = 'https://puzztype.onrender.com';

  socket = io(socketUrl);

  socket.on('connect_error', (error) => {
    console.error('Connection Error:', error);
  });

  console.log('接続先は' + window.location.origin);

  socket.on('waitingForPlayer', () => {
    // console.log('対戦相手を待っています...');
  });

  socket.on('matchCancelled', () => {
    hideLoadingOverlay();
  });

  //   // WebRTC接続のためのイベントリスナー
  //   socket.on('webrtc-offer', (data) => {
  //     if (!peerConnection) {
  //         peerConnection = new RTCPeerConnection({
  //             iceServers: [
  //                 { urls: 'stun:stun.l.google.com:19302' },
  //                 { urls: 'stun:stun1.l.google.com:19302' }
  //             ]
  //         });
  //         setupPeerConnectionListeners();
  //     }

  //     peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer))
  //         .then(() => peerConnection.createAnswer())
  //         .then(answer => peerConnection.setLocalDescription(answer))
  //         .then(() => {
  //             socket.emit('webrtc-answer', {
  //                 answer: peerConnection.localDescription
  //             });
  //         })
  //         .catch(error => {
  //             console.error('WebRTC接続エラー:', error);
  //         });
  // });

  // socket.on('webrtc-answer', (data) => {
  //     if (peerConnection) {
  //         peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer))
  //             .catch(error => {
  //                 console.error('リモート記述設定エラー:', error);
  //             });
  //     }
  // });

  // socket.on('ice-candidate', (candidate) => {
  //     if (peerConnection && peerConnection.remoteDescription) {
  //         peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
  //             .catch(error => {
  //                 console.error('ICEカンディデート追加エラー:', error);
  //             });
  //     }
  // });

  // ゲーム開始
  socket.on('gameStart', (data) => {
    playerId = socket.id;
    isPlayer1 = playerId === data.player1Id;
    opponentId = isPlayer1 ? data.player2Id : data.player1Id;
    playerWins = 0;
    opponentWins = 0;
    showMatchingSuccess();
    socket.emit('syncStyleName', currentKey);
    // console.log(`ゲーム開始: ${isPlayer1 ? 'プレイヤー1' : 'プレイヤー2'}`);
  });

  socket.on('updateStyleName', (data) => {
    opponentStyle.textContent = `${data.currentKey}`;
  });

  // socket.on イベントハンドラを追加・修正
  socket.on('gameOver', (data) => {
    playerWins++;
    // if()
    handleGameOver(data.loserId === socket.id);
    // console.log(data.loserId === socket.id);
  });

  // ルーム関連のイベント
  socket.on('roomJoined', (roomNumber) => {
    currentRoom = roomNumber;
    showLoadingOverlay(`ルーム${roomNumber}で対戦相手を待っています...`);
  });

  socket.on('roomFull', () => {
    alert('指定されたルームは満室です');
    hideLoadingOverlay();
  });

  socket.on('invalidRoom', () => {
    alert('無効なルーム番号です');
    hideLoadingOverlay();
  });

  socket.on('retryResponse', (data) => {
    if (data.bothPlayersAgreed) {
      if (retryDialog) {
        document.body.removeChild(retryDialog);
        retryDialog = null;
      }
      startCountdown(); // カウントダウンから再開
      // } else if (!data.canRetry) {
    } else {
      if (retryDialog) {
        gameState = 'normal';
        document.body.removeChild(retryDialog);
        retryDialog = null;
        alert('どちらかがNoを選択しました');
      }
    }
  });

  socket.on('inputSync', (data) => {
    opponentInput = data.input;
    checkAndRemoveWord(opponentField, opponentFieldWords, opponentInput);
    drawField(ctxOpponent, opponentField, data.memorizeLastAttackValue);
    drawInputField(ctxOpponentInput, opponentInput, opponentInputField);
  });

  socket.on('fieldSync', (data) => {
    opponentFieldWords = data.fieldWords;
    opponentField = data.field;

    clearField(opponentField);

    // 単語をフィールドに左詰めで配置
    let row = FIELD_HEIGHT - 1; // 下から配置
    for (const word of opponentFieldWords) {
      let col = 0; // 左端から配置
      for (const char of word) {
        if (col >= FIELD_WIDTH) {
          row--; // 次の行に移動
          col = 0;
        }
        if (row === 0) {
          opponentField[row][col] = { word: char, isHighlighted: false };
          col++;
          // console.log("相手のフィールド描画おわり");
        } else if (row < 0) {
          drawField(ctxOpponent, opponentField, data.memorizeLastAttackValue);

          // console.log("drawFieldして処理終了");
          return;

        } else {
          // console.log(word + "描画");
          opponentField[row][col] = { word: char, isHighlighted: false };
          col++;
        }
      }
      row--; // 次の単語を下の行に配置
    }
    checkAndRemoveWord(opponentField, opponentFieldWords, opponentInput);
    drawField(ctxOpponent, opponentField, data.memorizeLastAttackValue);
    drawStatusField(ctxOpponentStatus, false);
  });



  socket.on('opponentDisconnected', () => {
    soundManager.stop('Consecutive Battle');
    soundManager.stop('Lightning Brain');
    soundManager.stop('R.E.B.O.R.N');
    gameStarted = false;
    resetGame();
    playerWins = 0;
    opponentWins = 0;
    playerIsLoser = false;
    isDisConnect = true;
    gameState = 'normal';
    // console.log(isDisConnect);
    // console.log(gameState);
    alert('通信が切断されました');
  });

  socket.on('receiveTechnicianAttack', () => {
    if (currentAttackSoundState === 'VALID') {
      soundManager.playSound('receiveAttack', { volume: 0.5 });
    }

    playerFieldWords.push(attackWord);
    playerFieldWords.sort((a, b) => {
      if (a === attackWord && b !== attackWord) return -1;
      if (b === attackWord && a !== attackWord) return 1;
      return b.length - a.length;
    });
    clearField(playerField);
    let row = FIELD_HEIGHT - 1;
    for (const word of playerFieldWords) {
      let col = 0;
      for (const char of word) {
        if (col >= FIELD_WIDTH) {
          row--;
          col = 0;
        }
        if (row === 0) {
          playerField[row][col] = { word: char, isHighlighted: false };
          col++;
        } else if (row < 0) {
          if (gameState === 'ended') return;
          drawField(ctxPlayer, playerField, memorizeLastAttackValue);
          syncFieldUpdate();
          handleGameOver(true);
          socket.emit('gameOver', { loserId: playerId });
          return;
        } else {
          playerField[row][col] = { word: char, isHighlighted: false };
          col++;
        }
      }
      row--;
    }
    drawField(ctxPlayer, playerField, memorizeLastAttackValue);
    syncFieldUpdate();
  });

  socket.on('receiveAttack', (data) => {
    if (selectedCategory === "ENGLISH" && data.attackValue <= 8) {
      let receiveValueENG = data.attackValue + 2;
      if (currentKey == "REFLECTOR") {
        if (getBetterRandom() < 0.5) {
          playerReceiveValueToOffset.push(receiveValueENG);
          playerReceiveValueToOffset.push(receiveValueENG);
        } else {
          playerReceiveValueToOffset.push(receiveValueENG);
        }
      } else {
        playerReceiveValueToOffset.push(receiveValueENG);
      }
    } else {
      if (currentKey == "REFLECTOR") {
        if (getBetterRandom() < 0.5) {
          playerReceiveValueToOffset.push(data.attackValue);
          playerReceiveValueToOffset.push(data.attackValue);
        } else {
          playerReceiveValueToOffset.push(data.attackValue);
        }
      } else {
        playerReceiveValueToOffset.push(data.attackValue);
      }
    }

    // console.log("攻撃を受けました:" + playerReceiveValueToOffset);
    // calcReceiveOffsetToDisplay();

    playerReceiveValueToDisplay = [...playerReceiveValueToOffset];
    playerReceiveValueToDisplay.sort((a, b) => a - b);
    drawStatusField(ctxPlayerStatus, true);

    // console.log("playerAttackValueToDisplay:" + playerAttackValueToDisplay);
    // console.log("playerReceiveValueToDisplay:" + playerReceiveValueToDisplay);

  });

  socket.on('receiveAttackValue', (data) => {

    const number = data.number;

    if (typeof number !== 'number') {
      console.log('受け取った攻撃力の型がnumberではありません');
      return;
    }

    if (currentAttackSoundState === 'VALID') {
      if (number <= 10) {
        soundManager.playSound('attackWeak', { volume: 0.3 });
      } else if (number <= 15) {
        soundManager.playSound('attackNormal', { volume: 0.8 });
      } else if (number <= 20) {
        soundManager.playSound('attackStrong', { volume: 0.6 });
      } else {
        soundManager.playSound('attackOP', { fadeOut: 0.5, volume: 0.6 });
      }
    }

    const containerRect = opponentEffectOverlay.getBoundingClientRect();
    const fontSize = (CELL_SIZE * 1.5) + number * 1.5;
    const numberElement = document.createElement('span');
    numberElement.textContent = number;
    numberElement.className = 'displayAttackValue';
    numberElement.style.fontSize = `${fontSize}px`;

    if (number < 10) {
      numberElement.style.color = 'rgba(0, 0, 0, 0.9)';
    } else if (number < 20) {
      numberElement.style.color = 'rgba(255, 125, 0, 0.9)';
    } else {
      numberElement.style.color = 'rgba(255, 0, 0, 0.9)';
    }

    const posX = containerRect.width * 0.75;
    const posY = containerRect.height * 0.25;

    const randomAngle = 45 + Math.random() * (-90);

    const randomTranslateX = Math.random() * 100 - 100; // -10px ～ 10px
    const randomTranslateY = Math.random() * 100 - 100; // -10px ～ 10px

    numberElement.style.left = `${posX}px`;
    numberElement.style.top = `${posY}px`;
    numberElement.style.transform = `translate(-50%, -50%) rotate(${randomAngle}deg)`;

    opponentEffectOverlay.appendChild(numberElement);

    // アニメーションの適用
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { // 2段階にすると確実
        numberElement.style.transform += ` translate(${randomTranslateX}px, ${randomTranslateY}px) scale(1.2)`;
        numberElement.classList.add('fade-out');
      });
    });

    setTimeout(() => {
      numberElement.remove();
    }, 1500);
  });

  // 攻撃を受けた時のイベントリスナー
  socket.on('receiveAttackShake', (data) => {
    triggerShakeOnReceive(data); // シェイクを実行
    triggerColorFlash(playerFieldElement); // 色のフラッシュ効果を適用
  });

  // クライアント側のコード（main.jsなど）
  socket.on('updateAttackInfo', (data) => {
    updateOpponentAttackInfoDisplay(data.attackType);
  });

  socket.on('updeteNerfInfo', (data) => {
    updateOpponentNerfInfoDisplay(data.nerfValue);
  });

  socket.on('updetePlayerMissEffect', () => {
    triggerMissColorFlash(opponentInputField, false);
  });

  socket.on('updateChainInfo', (data) => {
    updateOpponentChainInfoDisplay(data.chainBonus);
    document.documentElement.style.setProperty('--opponentChainColor', data.chainBonusColor);
  });

  // Socket.IOイベントハンドラ: 相手から受信したNextを表示
  socket.on('nextWordsSync', (data) => {
    const prefix = 'opponent'; // 相手のNextを更新
    for (let i = 1; i <= 5; i++) {
      const nextElement = document.getElementById(`${prefix}Next${i}`);
      nextElement.innerHTML = data.styledWords[i - 1] || ""; // スタイル付きで表示
    }
  });

  // クライアント側のSocket.IOイベントリスナー
  socket.on('syncOpponentGradients', (data) => {
    data.gradientStyles.forEach((style, index) => {
      const nextElement = document.getElementById(`opponentNext${index + 1}`);
      if (nextElement && style) {
        nextElement.style = style;
      }
    });
  });

  socket.on('fieldHighlightSync', (data) => {
    // 受信したハイライトデータを使って opponentField を更新
    const overlayDiv = opponentOverlayElement;
    removeAuraEffectFromOverlay(overlayDiv);

    // データを基にハイライト処理
    data.highlightData.forEach(({ x, y, colorObj }) => {
      applyAuraEffectToCell(y, x, colorObj, overlayDiv);
    });
  });

  // Socket.IOのイベントハンドラを追加
  socket.on('statusFieldSync', (data) => {
    opponentReceiveValueToDisplay = data.receiveValues;
    // 対戦相手のステータスフィールドを更新
    drawStatusField(ctxOpponentStatus, false);
  });

  // クライアント側で相手の情報を受信して表示する処理を追加
  socket.on('opponentInfoSync', (data) => {
    // 相手の情報を更新
    opponentKpmDiv.innerHTML = `${data.kpm.main}<span class="smallText">${data.kpm.small}</span>`;
    opponentApmDiv.innerHTML = `${data.apm.main}<span class="smallText">${data.apm.small}</span>`;
    opponentWpmDiv.innerHTML = `${data.wpm.main}<span class="smallText">${data.wpm.small}</span>`;
  });

}
class SoundManager {
  constructor() {
    // クラス全体で単一のAudioContextを使用
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = new Map();
    this.masterVolume = 1.0;

    // マスターボリュームのゲインノード作成
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.audioContext.destination);
    this.masterGainNode.gain.value = this.masterVolume;

    // 再生中のサウンドを管理
    this.playingSounds = new Map();
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.masterGainNode.gain.value = this.masterVolume;
  }

  async loadSound(key, filepath) {
    try {
      const response = await fetch(filepath);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.sounds.set(key, {
        buffer: audioBuffer
      });
      // console.log(`Loaded sound: ${key}`);
    } catch (error) {
      // console.error(`Error loading sound ${key}:`, error);
    }
  }

  playSound(key, options = {}) {
    const sound = this.sounds.get(key);
    if (!sound) {
      // console.error(`Sound not found: ${key}`);
      return null;
    }

    // 共通のaudioContextを使用してノードを作成
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    const {
      volume = 1.0,
      rate = 1.0,
      detune = 0,
      loop = false,
      loopStart = 0,
      loopEnd = 0,
      fadeIn = 0,
      fadeOut = 0,
    } = options;

    source.buffer = sound.buffer;
    source.playbackRate.value = rate;
    source.detune.value = detune;
    source.loop = loop;
    if (loop && loopEnd > 0) {
      source.loopStart = loopStart;
      source.loopEnd = loopEnd;
    }

    gainNode.gain.value = volume * this.masterVolume;

    if (fadeIn > 0) {
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume * this.masterVolume,
        this.audioContext.currentTime + fadeIn
      );
    }

    if (fadeOut > 0 && !loop) {
      const duration = sound.buffer.duration;
      gainNode.gain.setValueAtTime(
        volume * this.masterVolume,
        this.audioContext.currentTime + duration - fadeOut
      );
      gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + duration
      );
    }

    source.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    // Chrome等のブラウザポリシーに対応
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    source.start(0);

    // 再生中のサウンドを管理
    const soundControl = {
      source,
      gainNode,
      stop: () => {
        try {
          source.stop();
        } catch (e) {
          return;
          console.warn('Sound already stopped');
        }
      },
      setVolume: (newVolume) => {
        gainNode.gain.value = Math.max(0, Math.min(1, newVolume)) * this.masterVolume;
      },
      setRate: (newRate) => {
        source.playbackRate.value = newRate;
      },
      setDetune: (newDetune) => {
        source.detune.value = newDetune;
      }
    };

    this.playingSounds.set(key, soundControl);

    return soundControl;
  }

  stop(key) {
    const playingSound = this.playingSounds.get(key);
    if (playingSound) {
      playingSound.stop();
      this.playingSounds.delete(key);
    } else {
      console.warn(`No playing sound found for key: ${key}`);
    }
  }
}

// グローバルなサウンドマネージャーのインスタンスを作成
const soundManager = new SoundManager();

// 画面ロード時に音声ファイルを読み込む
window.addEventListener('load', async () => {
  const soundFiles = {
    'Consecutive Battle': 'sounds/MusMus-CT-NV-23.mp3',
    'Lightning Brain': 'sounds/MusMus-BGM-172.mp3',
    'R.E.B.O.R.N': 'sounds/MusMus-BGM-176.mp3',
    'missType': 'sounds/ビープ音4.mp3',
    'type1': 'sounds/9744__horn__typewriter.wav',
    'type2': 'sounds/378085__bigmonmulgrew__mechanical-key-hard.wav',
    'type3': 'sounds/54405__korgms2000b__button-click.wav',
    'type4': 'sounds/カーソル移動2.mp3',
    'type5': 'sounds/194799__jim-ph__keyboard5.wav',
    'type6': 'sounds/277723__magedu__typewriter_electric_turn_off.wav',
    'type7': 'sounds/360602__cabled_mess__typewriter-snippet-02.wav',
    'type8': 'sounds/773604__kreha__smallclick.wav',
    'attackWeak': 'sounds/346918__julien_matthey__jm_noiz_laser-04.wav',
    'attackNormal': 'sounds/270548__littlerobotsoundfactory__laser_04.wav',
    'attackStrong': 'sounds/270551__littlerobotsoundfactory__laser_07.wav',
    'attackOP': 'sounds/547441__mango777__lazercannon.ogg',
    // 'buttonHover': 'sounds/533257__copyc4t__screen-lettering.wav',
    'buttonHover': 'sounds/50561__broumbroum__sf3-sfx-menu-select.wav',
    'buttonClick': 'sounds/240875__unfa__anime-jump-loud-short-sms-signal.flac',
    'receiveAttack': 'sounds/577423__morganpurkis__zip-laser.wav',
    'countdown': 'sounds/64119__atari66__beeps.wav',
    'addFieldWord': 'sounds/107156__bubaproducer__button-9-funny.wav',
    'deleteInput': 'sounds/264762__farpro__guiclick.ogg',
    'warning': 'sounds/582986__oysterqueen__low-battery.mp3',
    'playerMatchPoint': 'sounds/580116__annyew__completeobtained-sound.wav',
    'win': 'sounds/668436__david819__win.mp3',
    'opponentMatchPoint': 'sounds/342756__rhodesmas__failure-01.wav',
    'lose': 'sounds/159399__noirenex__power-down.wav',
  };

  // すべての音声ファイルを読み込む
  for (const [key, filepath] of Object.entries(soundFiles)) {
    await soundManager.loadSound(key, filepath);
  }
});
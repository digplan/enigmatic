element`element-cube, <div class="centered">
    <div class="cube">
      <div class="face top"></div>
      <div class="face bottom"></div>
      <div class="face left"></div>
      <div class="face right"></div>
      <div class="face front"></div>
      <div class="face back"></div>
    </div>
    </div>`
    
css`
    @keyframes turn {
      from {
        transform: rotate3d(0, 0, 0, 0);
      }
      to {
        transform: rotate3d(1, 1, 0, 360deg);
      }
    }

    .container {
      width: 200px;
      height: 200px;
      perspective: 500px;
      margin: 100px;
    }

    .cube {
      position: relative;
      width: 200px;
      height: 200px;
      transform-style: preserve-3d;
      animation: turn 5s linear infinite;
    }

    .face {
      width: 200px;
      height: 200px;
      position: absolute;

      display: flex;
      transition: transform 500ms;
    }

    .front {
      transform: translateZ(100px);
      background: Azure;
    }

    .back {
      transform: translateZ(-100px) rotateY(180deg);
      background: Ivory;
    }

    .left {
      transform: translateX(-100px) rotateY(-90deg);
      background: LightYellow;
    }

    .right {
      transform: translateX(100px) rotateY(90deg);
      background: Cornsilk;
    }

    .top {
      transform: translateY(-100px) rotateX(90deg);
      background: LightYellow;
    }

    .bottom {
      transform: translateY(100px) rotateX(-90deg);
      background: MistyRose;
    }

    @media (prefers-reduced-motion: reduce) {
      .cube {
        animation: none;
        transform: rotate3d(1, 1, 0, 45deg);
      }
    }

    h1 {
      font-size: 70px;
      color: Blu;
      text-align: center;
    }
    body {
    }
    .centered {
      position: fixed; /* or absolute */
      top: 25%;
      left: 35%;
    }
    h1 {
      position: fixed; /* or absolute */
      top: 25%;
      left: 47%;
      font-spacing: px;
    }

    html {
      scroll-behavior: smooth;
    }

    home {
      height: 200vh;
    }
    .footer {
      left: 0;
      bottom: 0;
      width: 100%;
      height: 5%;
      background-color: black;
      color: white;
      text-align: center;
    }
  `
// components/Loader.js

export default function Loader({ processingStep }) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
        <p>{processingStep}</p>
  
        <style jsx>{`
          .loader-container {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .loader {
            width: 120px;
            height: 20px;
            -webkit-mask: linear-gradient(90deg, #000 70%, #0000 0) left/20% 100%;
            background: linear-gradient(yellow 0 0) left -25% top 0 / 20% 100%
              no-repeat #222;
            animation: l7 1s infinite steps(6);
            margin: 20px auto;
          }
          @keyframes l7 {
            100% {
              background-position: right -25% top 0;
            }
          }
        `}</style>
      </div>
    );
  }
  
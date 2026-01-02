"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const MEME_FACES = [
  { emoji: "😎", name: "Cool Doge" },
  { emoji: "🐸", name: "Pepe" },
  { emoji: "💪", name: "Chad" },
  { emoji: "😭", name: "Crying Wojak" },
  { emoji: "🤡", name: "Clown" },
  { emoji: "💀", name: "Skull" },
  { emoji: "🗿", name: "Moai" },
  { emoji: "🧠", name: "Brain" },
];

const THEMES = {
  night: {
    bg: "from-[#0f0f1e] to-[#1a1a2e]",
    canvasGradient: ["#1a1a2e", "#16213e", "#0f1419"],
    particle: "rgba(255, 255, 255, 0.8)",
    particleType: "star",
    pipeGradient: ["#2a2a3e", "#1f1f2e"],
    pipeBorder: "#404055",
    title: "#e0e0e0",
    text: "#b0b0b0",
    textLight: "#a0a0a0",
    canvasBorder: "#2a2a3e",
    button: "#2a2a3e",
    buttonHover: "#3a3a4e",
    buttonBorder: "#404055",
    button2: "#3a3a4e",
    button2Hover: "#4a4a5e",
    button2Border: "#505065",
    buttonDanger: "#4a2a2a",
    buttonDangerHover: "#5a3a3a",
    buttonDangerBorder: "#6a4a4a",
  },
  day: {
    bg: "from-[#87CEEB] to-[#E0F6FF]",
    canvasGradient: ["#87CEEB", "#B0E2FF", "#E0F6FF"],
    particle: "rgba(255, 255, 255, 0.9)",
    particleType: "cloud",
    pipeGradient: ["#90EE90", "#76D676"],
    pipeBorder: "#5CB85C",
    title: "#2c3e50",
    text: "#34495e",
    textLight: "#546e7a",
    canvasBorder: "#5dade2",
    button: "#3498db",
    buttonHover: "#2980b9",
    buttonBorder: "#2471a3",
    button2: "#27ae60",
    button2Hover: "#229954",
    button2Border: "#1e8449",
    buttonDanger: "#e74c3c",
    buttonDangerHover: "#c0392b",
    buttonDangerBorder: "#a93226",
  },
};

export default function FlappyMeme() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState("start");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentMeme, setCurrentMeme] = useState(0);
  const [customImage, setCustomImage] = useState(null);
  const [customMusic, setCustomMusic] = useState(null);
  const [customText, setCustomText] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [theme, setTheme] = useState("night");
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
  const animationFrameRef = useRef(null);

  const gameRef = useRef({
    bird: { x: 100, y: 250, velocity: 0, radius: 25 },
    pipes: [],
    frame: 0,
    gravity: 0.5,
    jumpStrength: -9,
    pipeSpeed: 3,
    pipeGap: 180,
    pipeWidth: 60,
    scored: new Set(),
  });

  const audioContextRef = useRef(null);
  const customAudioRef = useRef(null);
  const imageRef = useRef(null);

  const currentTheme = THEMES[theme];

  // Handle canvas resize for responsive design
  useEffect(() => {
    const updateCanvasSize = () => {
      const maxWidth = Math.min(window.innerWidth - 32, 800); // 16px padding on each side
      const aspectRatio = 800 / 500;
      const width = maxWidth;
      const height = width / aspectRatio;
      setCanvasSize({ width, height });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // Initialize audio
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioContextRef.current = new (
        window.AudioContext || window.webkitAudioContext
      )();
    }
  }, []);

  // Handle custom image upload
  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          imageRef.current = img;
          setCustomImage(event.target.result);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Handle custom music upload
  const handleMusicUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      const url = URL.createObjectURL(file);
      setCustomMusic(url);
    }
  }, []);

  // Background music loop (both custom and generated)
  useEffect(() => {
    if (gameState !== "playing" || !audioContextRef.current) return;

    // If custom music exists, play it
    if (customMusic) {
      const audio = new Audio(customMusic);
      audio.loop = true;
      audio.volume = 0.3;
      audio.play().catch((err) => console.log("Audio play failed:", err));
      customAudioRef.current = audio;

      return () => {
        if (customAudioRef.current) {
          customAudioRef.current.pause();
          customAudioRef.current = null;
        }
      };
    }

    // Otherwise play generated music
    const ctx = audioContextRef.current;
    const notes = [261.63, 293.66, 329.63, 392.0, 440.0];
    let noteIndex = 0;

    const playNote = () => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = notes[noteIndex % notes.length];
      oscillator.type = "square";

      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);

      noteIndex++;
    };

    const interval = setInterval(playNote, 250);

    return () => {
      clearInterval(interval);
      if (customAudioRef.current) {
        customAudioRef.current.pause();
        customAudioRef.current = null;
      }
    };
  }, [gameState, customMusic]);

  const playSound = useCallback((type) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === "jump") {
      oscillator.frequency.value = 400;
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.1);
    } else if (type === "score") {
      oscillator.frequency.value = 800;
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.2);
    } else if (type === "die") {
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        100,
        ctx.currentTime + 0.3,
      );
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    }
  }, []);

  const startGame = useCallback(() => {
    gameRef.current = {
      bird: { x: 100, y: 250, velocity: 0, radius: 25 },
      pipes: [],
      frame: 0,
      gravity: 0.5,
      jumpStrength: -9,
      pipeSpeed: 3,
      pipeGap: 180,
      pipeWidth: 60,
      scored: new Set(),
    };
    setScore(0);
    setGameState("playing");
  }, []);

  const jump = useCallback(() => {
    if (gameState === "start") {
      startGame();
    } else if (gameState === "playing") {
      gameRef.current.bird.velocity = gameRef.current.jumpStrength;
      playSound("jump");
    }
  }, [gameState, startGame, playSound]);

  const changeMeme = useCallback(() => {
    setCurrentMeme((prev) => (prev + 1) % MEME_FACES.length);
    setCustomImage(null);
    imageRef.current = null;
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "night" ? "day" : "night"));
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [jump]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const game = gameRef.current;
    const scale = canvasSize.width / 800; // Calculate scale factor

    const gameLoop = () => {
      if (gameState !== "playing") {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        return;
      }

      game.frame++;

      // Clear canvas with theme-based gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasSize.height);
      gradient.addColorStop(0, currentTheme.canvasGradient[0]);
      gradient.addColorStop(0.5, currentTheme.canvasGradient[1]);
      gradient.addColorStop(1, currentTheme.canvasGradient[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

      // Draw stars or clouds based on theme
      ctx.fillStyle = currentTheme.particle;
      for (let i = 0; i < 50; i++) {
        const x = ((game.frame * 0.2 + i * 123) % (canvasSize.width + 50)) - 50;
        const y = (i * 67) % canvasSize.height;
        if (currentTheme.particleType === "star") {
          ctx.fillRect(x, y, 2 * scale, 2 * scale);
        } else {
          // Draw clouds for day theme
          ctx.beginPath();
          ctx.arc(x, y, 15 * scale, 0, Math.PI * 2);
          ctx.arc(x + 20 * scale, y, 20 * scale, 0, Math.PI * 2);
          ctx.arc(x + 40 * scale, y, 15 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update bird physics
      game.bird.velocity += game.gravity;
      game.bird.y += game.bird.velocity;

      // Spawn pipes
      if (game.frame % 90 === 0) {
        const gapY = Math.random() * (500 - game.pipeGap - 100) + 50;
        game.pipes.push({
          x: 800,
          gapY: gapY,
          id: game.frame,
        });
      }

      // Update and draw pipes with theme colors
      game.pipes = game.pipes.filter((pipe) => {
        pipe.x -= game.pipeSpeed;

        // Draw pipes with theme gradient (scaled)
        const gradient1 = ctx.createLinearGradient(
          pipe.x * scale,
          0,
          (pipe.x + game.pipeWidth) * scale,
          0,
        );
        gradient1.addColorStop(0, currentTheme.pipeGradient[0]);
        gradient1.addColorStop(1, currentTheme.pipeGradient[1]);

        // Top pipe
        ctx.fillStyle = gradient1;
        ctx.fillRect(
          pipe.x * scale,
          0,
          game.pipeWidth * scale,
          pipe.gapY * scale,
        );
        ctx.strokeStyle = currentTheme.pipeBorder;
        ctx.lineWidth = 3 * scale;
        ctx.strokeRect(
          pipe.x * scale,
          0,
          game.pipeWidth * scale,
          pipe.gapY * scale,
        );

        // Bottom pipe
        ctx.fillRect(
          pipe.x * scale,
          (pipe.gapY + game.pipeGap) * scale,
          game.pipeWidth * scale,
          (500 - pipe.gapY - game.pipeGap) * scale,
        );
        ctx.strokeRect(
          pipe.x * scale,
          (pipe.gapY + game.pipeGap) * scale,
          game.pipeWidth * scale,
          (500 - pipe.gapY - game.pipeGap) * scale,
        );

        // Check for score
        if (
          !game.scored.has(pipe.id) &&
          pipe.x + game.pipeWidth < game.bird.x - game.bird.radius
        ) {
          game.scored.add(pipe.id);
          setScore((prev) => {
            const newScore = prev + 1;
            setHighScore((hs) => Math.max(hs, newScore));
            return newScore;
          });
          playSound("score");
        }

        // Check collision
        const birdLeft = game.bird.x - game.bird.radius;
        const birdRight = game.bird.x + game.bird.radius;
        const birdTop = game.bird.y - game.bird.radius;
        const birdBottom = game.bird.y + game.bird.radius;

        if (
          birdRight > pipe.x &&
          birdLeft < pipe.x + game.pipeWidth &&
          (birdTop < pipe.gapY || birdBottom > pipe.gapY + game.pipeGap)
        ) {
          setGameState("gameOver");
          playSound("die");
          return false;
        }

        return pipe.x > -game.pipeWidth;
      });

      // Draw bird (scaled)
      ctx.save();
      ctx.translate(game.bird.x * scale, game.bird.y * scale);
      ctx.rotate(Math.min(game.bird.velocity * 0.05, Math.PI / 4));

      if (customText.trim()) {
        // Draw custom text at full opacity
        ctx.globalAlpha = 1.0;
        ctx.font = `bold ${game.bird.radius * 1.5 * scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = currentTheme.title;
        ctx.strokeStyle =
          currentTheme.bg === "from-[#0f0f1e] to-[#1a1a2e]" ? "#fff" : "#000";
        ctx.lineWidth = 3 * scale;
        ctx.strokeText(customText, 0, 0);
        ctx.fillText(customText, 0, 0);
      } else if (customImage && imageRef.current) {
        // Draw custom uploaded image at full opacity
        ctx.globalAlpha = 1.0;
        const size = game.bird.radius * 2 * scale;
        ctx.drawImage(imageRef.current, -size / 2, -size / 2, size, size);
      } else {
        // Draw meme face at full opacity
        ctx.globalAlpha = 1.0;
        ctx.font = `${game.bird.radius * 2 * scale}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(MEME_FACES[currentMeme].emoji, 0, 0);
      }
      ctx.restore();

      // Check ground/ceiling collision
      if (
        game.bird.y + game.bird.radius > 500 ||
        game.bird.y - game.bird.radius < 0
      ) {
        setGameState("gameOver");
        playSound("die");
        return;
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState === "playing") {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    gameState,
    currentMeme,
    customImage,
    customText,
    playSound,
    currentTheme,
    canvasSize,
  ]);

  const handleTextSubmit = useCallback(() => {
    if (customText.trim()) {
      setShowTextInput(false);
      setCustomImage(null);
      imageRef.current = null;
    }
  }, [customText]);

  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${currentTheme.bg} flex flex-col items-center justify-center p-4`}
    >
      <div className="text-center mb-4">
        <h1
          className="text-4xl md:text-6xl font-bold mb-2"
          style={{
            textShadow: "4px 4px 0 rgba(0,0,0,0.5)",
            color: currentTheme.title,
          }}
        >
          🎮 FLAPPY MEME 🎮
        </h1>
        <div
          className="flex gap-4 md:gap-8 justify-center text-lg md:text-2xl font-bold"
          style={{ color: currentTheme.text }}
        >
          <div>Score: {score}</div>
          <div>High Score: {highScore}</div>
        </div>
        <div
          className="mt-2 text-sm md:text-lg"
          style={{ color: currentTheme.textLight }}
        >
          Playing as:{" "}
          {customText.trim()
            ? `"${customText}" ✍️`
            : customImage
              ? "Custom Image 🖼️"
              : `${MEME_FACES[currentMeme].name} ${MEME_FACES[currentMeme].emoji}`}
        </div>
      </div>

      <div className="relative w-full max-w-[800px]">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onClick={gameState !== "gameOver" ? jump : undefined}
          className="rounded-lg shadow-2xl cursor-pointer w-full"
          style={{
            border: `4px md:border-8 solid ${currentTheme.canvasBorder}`,
          }}
        />

        {gameState === "start" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg">
            <div className="text-center px-4">
              <div className="text-6xl md:text-8xl mb-4">
                {customText.trim()
                  ? customText
                  : customImage
                    ? "🖼️"
                    : MEME_FACES[currentMeme].emoji}
              </div>
              <div
                className="text-2xl md:text-4xl font-bold mb-4"
                style={{ color: currentTheme.title }}
              >
                Click or Press SPACE to Flap!
              </div>
              <div
                className="text-lg md:text-xl"
                style={{ color: currentTheme.text }}
              >
                Avoid the pipes!
              </div>
            </div>
          </div>
        )}

        {gameState === "gameOver" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 rounded-lg">
            <div className="text-center px-4">
              <div className="text-6xl md:text-8xl mb-4">💀</div>
              <div
                className="text-3xl md:text-5xl font-bold mb-4"
                style={{ color: currentTheme.title }}
              >
                GAME OVER!
              </div>
              <div
                className="text-2xl md:text-3xl mb-6"
                style={{ color: currentTheme.text }}
              >
                Score: {score}
              </div>
              <button
                onClick={startGame}
                className="px-8 md:px-12 py-3 md:py-4 rounded-lg font-bold text-xl md:text-2xl transition-colors shadow-lg"
                style={{
                  backgroundColor: currentTheme.button,
                  color: currentTheme.title,
                  border: `2px solid ${currentTheme.buttonBorder}`,
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = currentTheme.buttonHover)
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = currentTheme.button)
                }
              >
                🔄 RETRY
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 md:gap-4 justify-center max-w-[800px]">
        <button
          onClick={toggleTheme}
          className="px-4 md:px-8 py-2 md:py-3 rounded-lg font-bold text-base md:text-xl transition-colors shadow-lg"
          style={{
            backgroundColor: currentTheme.button,
            color: currentTheme.title,
            border: `2px solid ${currentTheme.buttonBorder}`,
          }}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = currentTheme.buttonHover)
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = currentTheme.button)
          }
        >
          {theme === "night" ? "☀️ Day" : "🌙 Night"}
        </button>

        {!customImage && !customText.trim() && (
          <button
            onClick={changeMeme}
            className="px-4 md:px-8 py-2 md:py-3 rounded-lg font-bold text-base md:text-xl transition-colors shadow-lg"
            style={{
              backgroundColor: currentTheme.button,
              color: currentTheme.title,
              border: `2px solid ${currentTheme.buttonBorder}`,
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = currentTheme.buttonHover)
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = currentTheme.button)
            }
          >
            <span className="hidden md:inline">
              Change Meme {MEME_FACES[currentMeme].emoji}
            </span>
            <span className="md:hidden">
              Change {MEME_FACES[currentMeme].emoji}
            </span>
          </button>
        )}

        <button
          onClick={() => setShowTextInput(!showTextInput)}
          className="px-4 md:px-8 py-2 md:py-3 rounded-lg font-bold text-base md:text-xl transition-colors shadow-lg"
          style={{
            backgroundColor: currentTheme.button,
            color: currentTheme.title,
            border: `2px solid ${currentTheme.buttonBorder}`,
          }}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = currentTheme.buttonHover)
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = currentTheme.button)
          }
        >
          ✍️ Text
        </button>

        <label
          className="px-4 md:px-8 py-2 md:py-3 rounded-lg font-bold text-base md:text-xl transition-colors shadow-lg cursor-pointer"
          style={{
            backgroundColor: currentTheme.button2,
            color: currentTheme.title,
            border: `2px solid ${currentTheme.button2Border}`,
          }}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = currentTheme.button2Hover)
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = currentTheme.button2)
          }
        >
          <span className="hidden md:inline">📸 Upload Face</span>
          <span className="md:hidden">📸 Face</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        <label
          className="px-4 md:px-8 py-2 md:py-3 rounded-lg font-bold text-base md:text-xl transition-colors shadow-lg cursor-pointer"
          style={{
            backgroundColor: currentTheme.button2,
            color: currentTheme.title,
            border: `2px solid ${currentTheme.button2Border}`,
          }}
          onMouseEnter={(e) =>
            (e.target.style.backgroundColor = currentTheme.button2Hover)
          }
          onMouseLeave={(e) =>
            (e.target.style.backgroundColor = currentTheme.button2)
          }
        >
          <span className="hidden md:inline">🎵 Upload Music</span>
          <span className="md:hidden">🎵 Music</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleMusicUpload}
            className="hidden"
          />
        </label>

        {(customImage || customText.trim()) && (
          <button
            onClick={() => {
              setCustomImage(null);
              setCustomText("");
              imageRef.current = null;
            }}
            className="px-4 md:px-8 py-2 md:py-3 rounded-lg font-bold text-base md:text-xl transition-colors shadow-lg"
            style={{
              backgroundColor: currentTheme.buttonDanger,
              color: currentTheme.title,
              border: `2px solid ${currentTheme.buttonDangerBorder}`,
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = currentTheme.buttonDangerHover)
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = currentTheme.buttonDanger)
            }
          >
            <span className="hidden md:inline">❌ Reset to Meme</span>
            <span className="md:hidden">❌ Reset</span>
          </button>
        )}
      </div>

      {showTextInput && (
        <div className="mt-4 flex gap-2 items-center px-4 w-full max-w-[500px]">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleTextSubmit()}
            placeholder="Enter your text..."
            maxLength={10}
            className="flex-1 px-4 py-2 rounded-lg text-lg md:text-xl font-bold"
            style={{
              backgroundColor: currentTheme.button,
              color: currentTheme.title,
              border: `2px solid ${currentTheme.buttonBorder}`,
              outline: "none",
            }}
            autoFocus
          />
          <button
            onClick={handleTextSubmit}
            className="px-4 md:px-6 py-2 rounded-lg font-bold text-lg md:text-xl transition-colors shadow-lg"
            style={{
              backgroundColor: currentTheme.button2,
              color: currentTheme.title,
              border: `2px solid ${currentTheme.button2Border}`,
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = currentTheme.button2Hover)
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = currentTheme.button2)
            }
          >
            ✅
          </button>
        </div>
      )}

      <div
        className="mt-4 text-center px-4"
        style={{ color: currentTheme.textLight }}
      >
        <div className="text-xs md:text-sm opacity-75">
          Desktop: Press SPACE to jump
        </div>
        <div className="text-xs md:text-sm opacity-75">
          Mobile: Tap anywhere to jump
        </div>
        {customMusic && (
          <div className="text-xs md:text-sm opacity-75 mt-2">
            🎵 Playing your custom music!
          </div>
        )}
      </div>
    </div>
  );
}

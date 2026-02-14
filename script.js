:root {
  color-scheme: light dark;
}

* {
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-content: center;
  background: #101418;
}

.calculator {
  width: min(360px, 92vw);
  background: #1c232b;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

h1 {
  color: #f6f8fb;
  font-size: 1.2rem;
  margin: 0 0 0.75rem;
  text-align: center;
}

.display {
  display: block;
  width: 100%;
  min-height: 64px;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: #0f141a;
  color: #f6f8fb;
  font-size: 2rem;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
}

.keys {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

button {
  border: 0;
  border-radius: 8px;
  padding: 0.9rem;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  background: #2e3947;
  color: #ffffff;
}

button:hover {
  filter: brightness(1.1);
}

button:active {
  transform: scale(0.98);
}

button[data-action='operator'],
button[data-action='equals'] {
  background: #ff8c00;
  color: #111;
}

button[data-action='clear'] {
  background: #d7263d;
}

.span-2 {
  grid-column: span 2;
}

# Tamil Aathichudi Draw & Learn Game

An interactive letter tracing game for children aged 3-8 to learn Tamil and English letters through drawing.

## Features

- **4 Game Modes:**
  - Tamil Vowels (உயிர் எழுத்து) - 12 letters
  - Tamil Consonants (மெய் எழுத்து) - 18 letters
  - English Capital Letters - 26 letters
  - English Small Letters - 26 letters

- **Interactive Drawing:** Touch/mouse letter tracing with real-time feedback
- **Responsive Design:** Optimized for mobile, tablet, and desktop
- **Audio Support:** Letter pronunciation (requires audio files)
- **Progress Tracking:** Visual feedback and automatic progression

## Technology Stack

- **React 18** - UI framework
- **HTML5 Canvas** - Drawing mechanics and letter rendering
- **Vite** - Build tool and dev server
- **CSS3** - Responsive styling with CSS variables

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Audio Files (Optional)

To enable audio pronunciation, add audio files to the `public/audio/` directory:

```
public/
├── audio/
│   ├── tamil/
│   │   ├── a.mp3, aa.mp3, i.mp3, ... (vowels)
│   │   ├── ka.mp3, nga.mp3, cha.mp3, ... (consonants)
│   └── english/
│       ├── A.mp3, B.mp3, C.mp3, ... (capitals)
│       ├── a-small.mp3, b-small.mp3, ... (small letters)
```

## Browser Support

- Chrome 80+
- Firefox 74+
- Safari 13+
- Edge 80+

## Mobile Optimization

- Touch-optimized drawing
- Responsive font scaling
- Orientation change handling
- Safe area support for notched devices

## Development

The game uses a modular architecture:

- `src/components/` - React components including Canvas-based drawing
- `src/data/` - Letter collections and configurations
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions


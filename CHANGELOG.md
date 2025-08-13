# Changelog

## Version 2.0.0 - Manual Letter Progression

### Changed
- **Manual Letter Progression**: Letters no longer advance automatically after tracing
- **User Control**: Users must click the "Next →" button to advance to the next letter
- **Visual Feedback**: Enhanced UI indicators when tracing is complete:
  - Success message changes to "✓ Great! Click Next →"
  - Next button glows and scales when ready to advance
  - Drawing progress indicator shows "✓ Good tracing!" when sufficient tracing is done

### Technical Improvements
- Replaced Phaser 3 with HTML5 Canvas for better performance
- Reduced bundle size from 1.6MB to 155KB (90% reduction)
- Improved touch responsiveness on mobile devices
- Better letter visibility with proper stroke rendering

### Features
- ✅ 4 Game Modes: Tamil Vowels, Tamil Consonants, English Capital, English Small
- ✅ Manual progression control
- ✅ Responsive design for all devices
- ✅ Visual feedback during tracing
- ✅ Audio support ready (requires audio files)
- ✅ Progress tracking with completion screens

### User Experience
- Users now have full control over when to move to the next letter
- Clear visual indicators show when tracing is sufficient
- No more unexpected automatic advancement
- Better for learning at individual pace
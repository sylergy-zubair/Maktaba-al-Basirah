# Voice Control Navigation Implementation Plan

## Overview

This document outlines the implementation plan for adding voice control navigation to the Shamela TTS Reader application. The feature will support English and Bengali (Bangla) voice commands with a push-to-talk mechanism, focusing on Chrome and Edge browsers.

## Goals

- Enable hands-free navigation for users
- Support both English and Bengali (Bangla) voice commands
- Implement push-to-talk to avoid TTS interference
- Provide clear feedback and user guidance
- Maintain existing keyboard navigation as primary method

---

## Phase 1: Setup & Core Infrastructure ✅ COMPLETED

### 1.1 Browser Detection & Feature Flag

**Tasks:**

- ✅ Create utility to detect Web Speech API support
- ✅ Check if browser is Chrome/Edge (show feature only if supported)
- ✅ Create feature flag in user settings/preferences
- ✅ Store preference in localStorage

**Implementation:** `frontend/src/utils/voiceControl.ts`

**Implementation:**

```javascript
// utils/voiceControl.js
export function isVoiceControlSupported() {
  return "webkitSpeechRecognition" in window || "SpeechRecognition" in window;
}

export function isChromeOrEdge() {
  const userAgent = navigator.userAgent;
  return (
    (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) ||
    /Edg/.test(userAgent)
  );
}
```

**Acceptance Criteria:**

- Voice control option only appears if browser supports it
- Users can enable/disable voice control in settings
- Preference persists across sessions

---

## Phase 2: Voice Recognition Component ✅ COMPLETED

### 2.1 Core Voice Recognition Service

**Tasks:**

- ✅ Create VoiceRecognitionService class
- ✅ Initialize Web Speech API
- ✅ Configure language settings (Bengali + English)
- ✅ Handle recognition events
- ✅ Implement error handling

**Implementation:** `frontend/src/services/voiceRecognition.ts`

**Language Configuration:**

```javascript
const LANGUAGE_CONFIG = {
  primary: "bn-BD", // Bengali (Bangladesh)
  secondary: "en-US", // English (US)
  fallback: "en-US", // Fallback if Bengali not supported
};
```

**Key Features:**

- Continuous recognition disabled (better for commands)
- Interim results handling
- Confidence threshold for command matching
- Error handling with user-friendly messages

**Acceptance Criteria:**

- Service initializes correctly in Chrome/Edge
- Language preference is set correctly
- Errors are caught and reported gracefully
- Service can be started/stopped cleanly

---

## Phase 3: Push-to-Talk Implementation ✅ COMPLETED

### 3.1 Push-to-Talk Button Component

**Tasks:**

- ✅ Create PushToTalkButton component
- ✅ Implement mouse/touch hold interaction
- ✅ Implement keyboard hold interaction (default: V key)
- ✅ Visual feedback during recording
- ⚠️ Audio feedback (optional - can be added later)

**Implementation:** `frontend/src/components/PushToTalkButton.tsx`

**Interaction Modes:**

1. **Mouse/Touch:** Click and hold button
2. **Keyboard:** Hold configured key (default: Space, but configurable to avoid conflict with play/pause)
3. **Alternative Key:** Consider using "V" key for voice (mnemonic: "Voice")

**Visual States:**

- Idle: Button shows microphone icon
- Recording: Button highlighted/glowing, shows "Listening..."
- Processing: Button shows spinner
- Error: Button shows error indicator

**Acceptance Criteria:**

- Button responds to mouse down/up events
- Button responds to keyboard hold (keydown/keyup)
- Clear visual feedback during recording
- Button accessibility (ARIA labels, keyboard focusable)

---

### 3.2 Recognition Flow

**Flow:**

1. User presses and holds push-to-talk button/key
2. Recognition starts (show "Listening..." feedback)
3. User speaks command while holding
4. User releases button/key
5. Recognition stops, processes result
6. Command executed (if valid)
7. Audio/visual confirmation of action

**Edge Cases:**

- User releases too quickly (< 0.5s) → Ignore (likely accidental)
- No speech detected → Show "No command detected"
- Recognition timeout → Auto-stop after 5 seconds
- TTS playing during recognition → Optionally pause TTS

---

## Phase 4: Command Vocabulary & Parsing ✅ COMPLETED

### 4.1 Command Definitions

**Implementation:** `frontend/src/services/commandParser.ts`

**English Commands:**

```javascript
const ENGLISH_COMMANDS = {
  play: ["play", "start", "resume"],
  pause: ["pause", "stop"],
  next: ["next", "next unit", "next chapter", "forward"],
  previous: ["previous", "prev", "back", "backward", "last"],
  bookmark: ["bookmark", "save", "mark"],
  removeBookmark: ["remove bookmark", "unbookmark", "delete bookmark"],
  home: ["home", "back to books", "books", "library"],
  goToUnit: ["go to unit", "unit", "chapter"], // Followed by number
};
```

**Bengali Commands:**

```javascript
const BENGALI_COMMANDS = {
  play: ["চালাও", "চালান", "শুরু কর", "play"],
  pause: ["থামাও", "থামান", "বন্ধ কর", "pause"],
  next: ["পরবর্তী", "আগামী", "সামনে", "next"],
  previous: ["পূর্ববর্তী", "পিছনে", "গত", "previous"],
  bookmark: ["বুকমার্ক", "সংরক্ষণ", "মার্ক", "bookmark"],
  removeBookmark: ["বুকমার্ক সরাও", "অসংরক্ষণ", "remove bookmark"],
  home: ["বাড়ি", "হোম", "বই", "home"],
  goToUnit: ["ইউনিটে যাও", "অধ্যায়", "unit"], // Followed by number
};
```

### 4.2 Command Parser

**Tasks:**

- Create CommandParser class
- Implement fuzzy matching for commands
- Handle number extraction (for "go to unit 5")
- Normalize text (trim, lowercase, remove punctuation)
- Handle partial matches

**Parsing Strategy:**

1. Normalize input text
2. Check for exact matches first
3. Check for partial matches (contains command phrase)
4. Extract numbers for "go to unit" commands
5. Return command object: `{ action: string, params: object }`

**Acceptance Criteria:**

- Recognizes commands in both languages
- Handles variations and synonyms
- Extracts numbers correctly
- Returns structured command objects

---

## Phase 5: Command Execution ✅ COMPLETED

### 5.1 Command Handler

**Tasks:**

- ✅ Create CommandHandler (via useVoiceControl hook)
- ✅ Map commands to existing navigation functions
- ✅ Execute actions (play, pause, navigate, bookmark, etc.)
- ⚠️ Provide audio feedback for executed commands (can be enhanced)
- ✅ Handle invalid commands gracefully

**Implementation:** `frontend/src/hooks/useVoiceControl.ts`

**Command Actions:**

```javascript
const commandActions = {
  play: () => audioPlayer.play(),
  pause: () => audioPlayer.pause(),
  next: () => bookReader.goToNext(),
  previous: () => bookReader.goToPrevious(),
  bookmark: () => bookmarkButton.toggle(),
  removeBookmark: () => bookmarkButton.remove(),
  home: () => router.push("/"),
  goToUnit: (unitNumber) => bookReader.goToUnit(unitNumber),
};
```

**Feedback:**

- Visual: Brief flash or message
- Audio: Optional short confirmation sound (non-intrusive)
- Screen Reader: Announce action ("Playing audio", "Next unit", etc.)

**Acceptance Criteria:**

- All navigation actions work via voice
- Feedback is provided for each action
- Invalid commands show helpful message
- Errors don't break the application

---

## Phase 6: User Experience Enhancements ✅ COMPLETED

### 6.1 Settings/Preferences UI

**Tasks:**

- ✅ Add voice control section to settings
- ✅ Toggle to enable/disable voice control
- ✅ Select primary command language (Bengali/English)
- ✅ Configure push-to-talk key
- ✅ Show command reference

**Implementation:**

- `frontend/src/components/VoiceControlSettings.tsx`
- `frontend/src/app/settings/page.tsx`

**Settings Options:**

- [ ] Enable Voice Control
- Command Language: [Bengali + English ▼]
- Push-to-Talk Key: [V (recommended) ▼]
- [ ] Pause TTS when listening
- [ ] Audio confirmation sounds

### 6.2 Command Reference/Help ✅ COMPLETED

**Tasks:**

- ✅ Create command reference page
- ✅ Display commands in both languages
- ✅ Show examples for each command
- ✅ Accessible via settings page

**Implementation:** `frontend/src/components/VoiceCommandReference.tsx`

**Command Reference Format:**

```
Navigation Commands:
  English: "next", "previous", "go to unit 5"
  Bengali: "পরবর্তী", "পূর্ববর্তী", "ইউনিটে যাও ৫"

Audio Controls:
  English: "play", "pause"
  Bengali: "চালাও", "থামাও"

[Show full list...]
```

### 6.3 Visual Feedback

**Tasks:**

- Listening indicator (animated microphone icon)
- Command recognized indicator
- Error indicator with message
- Status message area (optional, non-intrusive)

**Design Principles:**

- Non-intrusive (doesn't block content)
- Clear but subtle
- Accessible (high contrast, ARIA labels)
- Consistent with existing UI

### 6.4 Audio Feedback (Optional)

**Considerations:**

- Short confirmation beep (100ms, low volume)
- Different tones for success vs. error
- Can be disabled in settings
- Should not interfere with TTS playback

**Acceptance Criteria:**

- All feedback is clear but non-intrusive
- Settings are easy to find and configure
- Help documentation is accessible
- Users understand how to use voice control

---

## Phase 7: Integration with Existing Components ✅ COMPLETED

### 7.1 AudioPlayer Integration

**Tasks:**

- ✅ Integrate voice commands with AudioPlayer component
- ✅ Handle play/pause commands (via refs)
- ✅ Ensure no conflicts with keyboard shortcuts (push-to-talk uses V key)

**Implementation:** Updated `frontend/src/components/AudioPlayer.tsx` and `frontend/src/app/book/[id]/page.tsx`

**Considerations:**

- Space key conflict: If Space is push-to-talk, may conflict with play/pause
- Solution: Use different key for push-to-talk (recommend "V")
- Or: Make push-to-talk key configurable

### 7.2 BookReader Integration

**Tasks:**

- Integrate navigation commands (next/previous)
- Integrate "go to unit" command
- Integrate bookmark commands
- Handle home command

### 7.3 AuthContext/App Integration

**Tasks:**

- Add voice control preference to user context
- Persist preference (localStorage or user profile)
- Load preference on app start

**Acceptance Criteria:**

- All existing features continue to work
- Voice commands integrate seamlessly
- No conflicts with keyboard shortcuts
- Settings persist correctly

---

## Phase 8: Error Handling & Edge Cases ✅ COMPLETED

### 8.1 Error Scenarios

**Tasks:**

- ✅ Handle microphone permission denied (with user-friendly message and guidance)
- ✅ Handle recognition service unavailable
- ✅ Handle network issues (if using cloud recognition)
- ✅ Handle unrecognized commands (with help suggestion)
- ✅ Handle commands during invalid states (e.g., "next" on last unit, "previous" on first unit)

**Implementation:** Enhanced error handling in:

- `frontend/src/services/voiceRecognition.ts` - User-friendly error messages
- `frontend/src/hooks/useVoiceControl.ts` - Command validation and state checking
- `frontend/src/components/PushToTalkButton.tsx` - Error display and recovery

**Error Messages:**

- Microphone permission: "Microphone access required. Please enable in browser settings."
- Service unavailable: "Voice recognition unavailable. Please try again."
- Unrecognized command: "Command not recognized. Say 'help' for available commands."
- Invalid state: "Cannot go to next unit. You're on the last unit."

### 8.2 Edge Cases ✅ COMPLETED

**Tasks:**

- ✅ Handle rapid command sequences (rate limiting with 500ms minimum interval)
- ✅ Handle commands while TTS is playing (pause TTS when listening starts)
- ✅ Handle background tab (pause recognition when tab is hidden)
- ✅ Handle browser focus changes (stop recognition on window blur)
- ✅ Handle multiple recognition attempts (prevent duplicate processing with debouncing)
- ✅ Handle recognition start errors (already running, permission issues)
- ✅ Auto-clear error messages after 5 seconds
- ✅ Cleanup on component unmount

**Implementation:** Edge case handling in:

- `frontend/src/components/PushToTalkButton.tsx` - Rate limiting, debouncing, focus/blur handlers, visibility change detection
- `frontend/src/hooks/useVoiceControl.ts` - Command result validation

**Acceptance Criteria:**

- ✅ All errors are handled gracefully
- ✅ User receives helpful error messages with actionable guidance
- ✅ Application doesn't break on errors
- ✅ Edge cases don't cause unexpected behavior
- ✅ Commands are validated before execution

---

## Phase 9: Testing Plan

### 9.1 Unit Tests

**Test Coverage:**

- Command parser (English and Bengali)
- Command handler
- Push-to-talk button interactions
- Language configuration
- Error handling

### 9.2 Integration Tests

**Test Scenarios:**

- Full command flow (push → speak → execute)
- Settings persistence
- Integration with AudioPlayer
- Integration with BookReader
- Navigation commands

### 9.3 Browser Testing

**Test Browsers:**

- Chrome (latest) - Primary
- Edge (latest) - Primary
- Test on Windows 10/11
- Test on Android (Chrome)

### 9.4 User Acceptance Testing

**Test with:**

- Native Bengali speakers (various dialects)
- English speakers
- Users with different accents
- Test in quiet and noisy environments
- Test with TTS playback active

**Success Metrics:**

- Command recognition accuracy > 80%
- User satisfaction > 4/5
- Feature adoption rate
- Error rate < 5%

---

## Phase 10: Documentation & Launch

### 10.1 User Documentation

**Tasks:**

- Update README with voice control section
- Create voice control guide
- Add command reference
- Create video tutorial (optional)

### 10.2 Developer Documentation

**Tasks:**

- Document VoiceRecognitionService API
- Document command vocabulary extension
- Document settings schema
- Code comments and JSDoc

### 10.3 Release Checklist

- [ ] All tests passing
- [ ] Documentation complete
- [ ] Settings UI implemented
- [ ] Help/command reference available
- [ ] Browser compatibility verified
- [ ] User testing completed
- [ ] Feature flag enabled for production
- [ ] Monitoring/analytics added (optional)

---

## Implementation Timeline Estimate

**Phase 1-2:** Core infrastructure (2-3 days)
**Phase 3:** Push-to-talk (2-3 days)
**Phase 4-5:** Commands & execution (3-4 days)
**Phase 6:** UX enhancements (3-4 days)
**Phase 7:** Integration (2-3 days)
**Phase 8:** Error handling (2-3 days)
**Phase 9:** Testing (3-5 days)
**Phase 10:** Documentation (1-2 days)

**Total Estimated Time:** 20-30 days (with testing and refinement)

---

## Technical Stack

- **Web Speech API:** Native browser API
- **React Hooks:** For component state management
- **TypeScript:** For type safety (frontend)
- **localStorage:** For preference persistence
- **Existing Components:** Integrate with AudioPlayer, BookReader, etc.

---

## Browser Support Matrix

| Browser | Platform  | Support    | Notes                   |
| ------- | --------- | ---------- | ----------------------- |
| Chrome  | Windows   | ✅ Full    | Primary target          |
| Chrome  | Android   | ✅ Full    | Good support            |
| Edge    | Windows   | ✅ Full    | Primary target          |
| Edge    | Android   | ✅ Full    | Good support            |
| Safari  | macOS/iOS | ❌ Limited | Not targeting initially |
| Firefox | All       | ⚠️ Partial | Not targeting initially |

---

## Future Enhancements (Out of Scope)

- Continuous listening mode (no push-to-talk)
- Cloud-based recognition (improved accuracy)
- Custom command training
- Voice control for text input/search
- Support for additional languages
- Analytics for command usage
- Accessibility improvements (screen reader integration)

---

## Risk Assessment

**Low Risk:**

- Code implementation (straightforward API usage)
- Browser compatibility (Chrome/Edge well-supported)

**Medium Risk:**

- Bengali recognition accuracy (varies by accent/dialect)
- User adoption (needs clear documentation)

**Mitigation:**

- Extensive testing with native speakers
- Provide clear command reference
- Allow easy disable if not working well
- Keep keyboard navigation as primary method

---

## Success Criteria

✅ Voice commands work reliably in Chrome/Edge
✅ Bengali and English commands are recognized
✅ Push-to-talk is intuitive and responsive
✅ Users can enable/disable feature easily
✅ Commands integrate seamlessly with existing navigation
✅ Clear feedback for all actions
✅ Comprehensive error handling
✅ Documentation is clear and helpful

---

## Notes

- Voice control is an **enhancement**, not a replacement for keyboard navigation
- Keep keyboard shortcuts as primary navigation method
- Always provide visual alternatives for all voice commands
- Consider accessibility implications (screen readers, etc.)
- Regular testing with actual users is crucial for success

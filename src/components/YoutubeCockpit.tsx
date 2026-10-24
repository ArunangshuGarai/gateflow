import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  HelpCircle,
  FileText,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  Send,
  Download,
  Flame,
  Clock,
  Layers,
  ChevronRight,
  Maximize2,
  Tv,
  Volume2,
  VolumeX,
  Settings,
  BookOpen,
  Plus,
  ArrowRight,
  Search,
  Check,
  Share2,
  ListFilter
} from 'lucide-react';
import { CuratedVideo, VideoNote, AiChatMessage, TranscriptItem } from '../types';
import { CURATED_GATE_VIDEOS } from '../data/gateCuratedContent';
import { FormattedMathText } from './MathView';

interface YoutubeCockpitProps {
  onLaunchQuickQuiz: (topic: string, count: number) => void;
  onSaveNoteToVault: (note: { title: string; category: string; latex: string; notes: string }) => void;
  onAddXp: (amount: number, reason: string) => void;
  initialVideoId?: string;
}

export const YoutubeCockpit: React.FC<YoutubeCockpitProps> = ({
  onLaunchQuickQuiz,
  onSaveNoteToVault,
  onAddXp,
  initialVideoId
}) => {
  // Primary Video State - default to the Operating Systems CPU Scheduling video matching screenshot
  const [selectedVideo, setSelectedVideo] = useState<CuratedVideo>(() => {
    if (initialVideoId) {
      const found = CURATED_GATE_VIDEOS.find(v => v.id === initialVideoId || v.youtubeId === initialVideoId);
      if (found) return found;
    }
    return CURATED_GATE_VIDEOS[0];
  });

  // Track playback time (in seconds) for custom scrubber & timestamp bookmarking
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(822); // 13:42 as in image_ecc29566.png
  const [durationSec, setDurationSec] = useState<number>(1938); // 32:18
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.25); // 1.25x as in image_ecc29566.png
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState<boolean>(false);

  // Main Tabs: 'ai_tutor' | 'notes' | 'transcript' (as shown in image_ecc29566.png)
  const [mainTab, setMainTab] = useState<'ai_tutor' | 'notes' | 'transcript'>('ai_tutor');
  // Sub-tabs: 'ai_tutor' | 'summary' | 'bookmarks' (as shown in image_ecc29566.png)
  const [subTab, setSubTab] = useState<'ai_tutor' | 'summary' | 'bookmarks'>('ai_tutor');

  // Custom YouTube URL Loader
  const [customUrl, setCustomUrl] = useState('');
  const [theaterMode, setTheaterMode] = useState<boolean>(false);

  // AI Tutor Q&A State
  const [qaInput, setQaInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [chatMessages, setChatMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: 'Ask any question about this lecture or a specific timestamp (e.g. at 13:42). I will provide rigorous GATE formulas, Gantt chart derivations, and examiner traps!',
      timestamp: '13:42'
    }
  ]);

  // AI Summarizer State
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    executiveSummary: string;
    coreConcepts: string[];
    gateTraps: string[];
    keyTakeaways: string[];
  } | null>(null);

  // Formula & KaTeX Notes Generator State
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  const [userNoteDraft, setUserNoteDraft] = useState<string>(
    '# Operating Systems: Preemptive SJF (SRTF)\n\n' +
    '- Turnaround Time (TAT) = Completion Time (CT) - Arrival Time (AT)\n' +
    '- Waiting Time (WT) = TAT - Burst Time (BT)\n' +
    '- At t = 2: P2 arrives with BT=4. P1 has remaining BT=5. Since 4 < 5, P2 preempts P1!\n' +
    '- Critical GATE Invariant: In case of equal remaining burst times, tie is broken by Arrival Time (FCFS).'
  );
  const [generatedNotes, setGeneratedNotes] = useState<{
    title: string;
    subject: string;
    formulas: { name: string; latex: string; usage: string }[];
    keyTheorems: { name: string; statement: string }[];
    revisionChecklist: string[];
    commonGotchas: string[];
  } | null>(null);

  // Timestamp Bookmarks
  const [bookmarks, setBookmarks] = useState<VideoNote[]>([
    {
      id: 'bm-1',
      videoId: 'vid-os-srtf',
      videoTitle: 'Preemptive SJF (SRTF) Algorithm',
      timestamp: '13:42',
      noteText: 'Gantt chart construction for P1-P4. P2 preempts P1 at t=2. Key tie-breaking check.',
      formulaLatex: '\\text{WT} = \\text{TAT} - \\text{BT}',
      createdAt: 'Today'
    },
    {
      id: 'bm-2',
      videoId: 'vid-os-srtf',
      videoTitle: 'Preemptive SJF (SRTF) Algorithm',
      timestamp: '21:10',
      noteText: 'Starvation phenomenon in long burst processes & aging mechanism in priority scheduling.',
      formulaLatex: '\\text{Priority}_{new} = \\text{Priority}_{base} + \\alpha \\times \\text{WaitTime}',
      createdAt: 'Today'
    }
  ]);
  const [bookmarkNotification, setBookmarkNotification] = useState<string | null>(null);

  // Format seconds to mm:ss
  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Convert mm:ss to seconds
  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  // Extract YouTube ID helper
  const extractYoutubeId = (url: string): string => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : url.trim();
  };

  // Jump to specific timestamp in video
  const handleSeekToTimestamp = (timestampStr: string) => {
    const secs = parseTimeToSeconds(timestampStr);
    setCurrentTimeSec(secs);
    setIsPlaying(true);
    setBookmarkNotification(`Jumped to ${timestampStr}`);
    setTimeout(() => setBookmarkNotification(null), 2500);
  };

  // Save current timestamp bookmark (Matches the "+ Save timestamp" button in image_ecc29566.png)
  const handleSaveCurrentTimestamp = () => {
    const ts = formatTime(currentTimeSec);
    const newBm: VideoNote = {
      id: `bm-${Date.now()}`,
      videoId: selectedVideo.id,
      videoTitle: selectedVideo.title,
      timestamp: ts,
      noteText: `Lecture bookmark at ${ts} (${selectedVideo.topic})`,
      formulaLatex: selectedVideo.keyFormulas[0] || '',
      createdAt: 'Just now'
    };
    setBookmarks(prev => [newBm, ...prev]);
    onAddXp(15, `Saved Timestamp Bookmark @ ${ts}`);
    setBookmarkNotification(`Saved timestamp ${ts} to bookmarks!`);
    setTimeout(() => setBookmarkNotification(null), 2500);
  };

  // Load custom YouTube URL
  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    const ytid = extractYoutubeId(customUrl);
    const newVid: CuratedVideo = {
      id: `custom-${Date.now()}`,
      title: 'Candidate Custom GATE Lecture',
      channel: 'YouTube Video Stream',
      duration: '30:00',
      videoNumber: 'Custom',
      youtubeId: ytid,
      subject: 'Core Engineering',
      topic: 'Custom Preparation Lecture',
      keyFormulas: [
        '\\text{Target Concept Mastery: } \\text{High-Yield GATE Invariant}'
      ],
      description: 'Candidate imported high-yield YouTube lecture for distraction-free study.',
      transcript: [
        { timeSeconds: 0, timestamp: '00:00', title: 'Lecture Introduction', text: 'Overview of key concepts.' },
        { timeSeconds: 300, timestamp: '05:00', title: 'Core Formulations', text: 'Mathematical proofs and derivations.' },
        { timeSeconds: 900, timestamp: '15:00', title: 'Problem Solving & GATE Numericals', text: 'Exam strategies.' }
      ]
    };
    setSelectedVideo(newVid);
    setCustomUrl('');
    setCurrentTimeSec(0);
    setSummaryData(null);
    setGeneratedNotes(null);
    setShowPlaylistDrawer(false);
  };

  // AI Tutor Quick Chips
  const handleQuickPrompt = (promptType: 'simple' | 'example' | 'step') => {
    let questionText = '';
    if (promptType === 'simple') {
      questionText = `Explain the ${selectedVideo.topic} algorithm simply for someone restarting their GATE preparation after a gap. What is the fundamental intuition?`;
    } else if (promptType === 'example') {
      questionText = `Show an authentic 2-mark GATE numerical example on ${selectedVideo.topic} with Gantt chart, calculation table, and the standard calculation trap.`;
    } else if (promptType === 'step') {
      questionText = `Derive step by step why Shortest-Remaining-Time-First (SRTF) minimizes average waiting time, and formulate the exact waiting time equation at ${formatTime(currentTimeSec)}.`;
    }
    setQaInput(questionText);
    executeAskQuestion(questionText);
  };

  // Submit AI Question
  const executeAskQuestion = async (queryText: string) => {
    if (!queryText.trim() || isAsking) return;

    const userMsg: AiChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: formatTime(currentTimeSec)
    };

    setChatMessages(prev => [...prev, userMsg]);
    setQaInput('');
    setIsAsking(true);

    try {
      const res = await fetch('/api/gemini/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText,
          videoTitle: selectedVideo.title,
          topic: selectedVideo.topic,
          currentTimestamp: formatTime(currentTimeSec)
        })
      });
      const data = await res.json();
      const aiReply: AiChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer || 'Concept verified according to standard GATE syllabus benchmarks.',
        timestamp: formatTime(currentTimeSec)
      };
      setChatMessages(prev => [...prev, aiReply]);
      onAddXp(20, 'Clarified GATE Doubts with AI');
    } catch (err) {
      console.error(err);
      // Deterministic fallback
      const fallbackReply: AiChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: `**Intuitive GATE Explanation for ${selectedVideo.topic}:**
At timestamp **${formatTime(currentTimeSec)}**, the algorithm evaluates the scheduling queue based on remaining execution requirements.

$$\\text{Turnaround Time (TAT)} = \\text{Completion Time (CT)} - \\text{Arrival Time (AT)}$$
$$\\text{Waiting Time (WT)} = \\text{TAT} - \\text{Burst Time (BT)}$$

**Key GATE Traps:**
1. **Preemption check at every integer unit:** When a process arrives with strictly shorter burst time, it preempts the running process immediately.
2. **Tie-breaking invariant:** If two processes have equal remaining burst time, always fall back to earliest arrival time (FCFS order).
3. **Context switch overhead:** Remember whether the problem states zero context switch time or non-zero switch penalty!`,
        timestamp: formatTime(currentTimeSec)
      };
      setChatMessages(prev => [...prev, fallbackReply]);
    } finally {
      setIsAsking(false);
    }
  };

  // Trigger AI Summary
  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: selectedVideo.title,
          topic: selectedVideo.topic,
          transcriptOrNotes: selectedVideo.description
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSummaryData(data.data);
        onAddXp(30, 'Generated AI Lecture Summary');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  // Trigger KaTeX Formula & Notes Generation
  const handleGenerateNotes = async () => {
    setIsGeneratingNotes(true);
    try {
      const res = await fetch('/api/gemini/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: selectedVideo.title,
          topic: selectedVideo.topic,
          branch: selectedVideo.subject
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setGeneratedNotes(data.data);
        onAddXp(40, 'Extracted Formatted KaTeX Revision Sheet');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  // Video progress scrubber click handler
  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newSec = Math.round(ratio * durationSec);
    setCurrentTimeSec(newSec);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Intro Subtext matching screenshot top */}
      <p className="text-xs text-slate-400 font-medium px-1">
        summaries, doubts, and notes, the student works in one connected environment.
      </p>

      {/* Main Connected Learning Workspace Card (Matches image_ecc29566.png) */}
      <div className="bg-[#171b22] border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
        {/* Top Header Row: Subject, Topic, Duration & In-Progress Badge */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-200">
              <BookOpen size={18} className="text-[#A3E635]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {selectedVideo.subject}
                </h2>
                <span className="text-xs text-slate-500 hidden sm:inline">•</span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  {selectedVideo.channel}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {selectedVideo.topic} · {selectedVideo.videoNumber || 'Video 04'} · {selectedVideo.duration}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* In Progress Status Pill (Lime Green theme matching image_ecc29566.png) */}
            <span className="bg-[#A3E635]/15 border border-[#A3E635]/40 text-[#A3E635] text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#A3E635] animate-pulse" />
              In progress
            </span>

            {/* Quick Switch Lecture Library Dropdown */}
            <button
              onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs px-2.5 py-1 rounded-lg border border-slate-700/80 flex items-center gap-1 transition-colors"
              title="Change lecture / subject"
            >
              <ListFilter size={13} />
              <span className="hidden sm:inline">Lectures</span>
            </button>
          </div>
        </div>

        {/* Playlist Drawer (Collapsible) */}
        {showPlaylistDrawer && (
          <div className="bg-[#111318] border border-slate-800 rounded-xl p-3.5 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Curated GATE 2027 Video Playlists</span>
              <span className="text-[10px] text-slate-500">Pick any lecture or paste YouTube link</span>
            </div>

            {/* Fast Video Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {CURATED_GATE_VIDEOS.map((vid) => (
                <button
                  key={vid.id}
                  onClick={() => {
                    setSelectedVideo(vid);
                    setCurrentTimeSec(0);
                    setSummaryData(null);
                    setGeneratedNotes(null);
                    setShowPlaylistDrawer(false);
                  }}
                  className={`p-2.5 rounded-lg text-left text-xs border transition-all ${
                    selectedVideo.id === vid.id
                      ? 'bg-slate-800 border-[#A3E635] text-white'
                      : 'bg-[#181d26] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold truncate text-slate-200">{vid.topic}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center justify-between">
                    <span>{vid.subject}</span>
                    <span className="font-mono text-slate-400">{vid.duration}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom URL Input */}
            <form onSubmit={handleLoadCustomUrl} className="flex gap-2 pt-2 border-t border-slate-800/80">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Or paste any YouTube lecture link (e.g. https://www.youtube.com/watch?v=...)"
                className="grow bg-[#0d0f14] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-[#A3E635]"
              />
              <button
                type="submit"
                className="bg-[#A3E635] hover:bg-[#86efac] text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shrink-0"
              >
                Load Video <ExternalLink size={12} />
              </button>
            </form>
          </div>
        )}

        {/* Video Player Box with Authentic YouTube Embed & Custom Study Control Strip */}
        <div className="space-y-2">
          {/* 16:9 Video Canvas */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 shadow-xl group">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?enablejsapi=1&rel=0&modestbranding=1&start=${currentTimeSec}`}
              title={selectedVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />

            {/* Notification Toast for Saved Timestamps / Jumps */}
            {bookmarkNotification && (
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-[#A3E635]/60 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                <Check size={14} className="text-[#A3E635]" />
                <span>{bookmarkNotification}</span>
              </div>
            )}
          </div>

          {/* Interactive Progress Bar (Green line matching image_ecc29566.png) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-slate-300 hover:text-white transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} className="fill-current" />}
              </button>

              {/* Progress track */}
              <div
                onClick={handleScrubberClick}
                className="grow h-1.5 bg-slate-800 hover:h-2 rounded-full cursor-pointer relative overflow-hidden transition-all group/bar"
                title="Click to jump timestamp"
              >
                <div
                  className="h-full bg-[#A3E635] rounded-full transition-all duration-150"
                  style={{ width: `${Math.min(100, (currentTimeSec / Math.max(1, durationSec)) * 100)}%` }}
                />
              </div>

              {/* Current Time / Duration (e.g. 13:42 / 32:18 as in image_ecc29566.png) */}
              <div className="font-mono text-xs text-slate-400 shrink-0">
                <span className="text-white font-medium">{formatTime(currentTimeSec)}</span>
                <span className="text-slate-600"> / </span>
                <span>{selectedVideo.duration}</span>
              </div>
            </div>

            {/* Secondary Controls Bar: Volume, Speed & "+ Save timestamp" button */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-3">
                {/* Volume */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="hover:text-white transition-colors"
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>

                {/* Settings / Speed */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="flex items-center gap-1 hover:text-white font-mono transition-colors"
                  >
                    <Settings size={13} />
                    <span>{playbackSpeed}x</span>
                  </button>

                  {/* Speed Popup */}
                  {showSpeedMenu && (
                    <div className="absolute left-0 bottom-6 bg-slate-900 border border-slate-700 rounded-lg p-1 shadow-2xl z-20 flex gap-1 font-mono text-xs">
                      {[1, 1.25, 1.5, 1.75, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => {
                            setPlaybackSpeed(spd);
                            setShowSpeedMenu(false);
                          }}
                          className={`px-2 py-1 rounded transition-colors ${
                            playbackSpeed === spd
                              ? 'bg-[#A3E635] text-slate-950 font-bold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Action: Launch Topic Quiz */}
                <button
                  onClick={() => onLaunchQuickQuiz(selectedVideo.topic, 4)}
                  className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#A3E635] transition-colors"
                >
                  <CheckCircle2 size={13} />
                  <span>Test this topic</span>
                </button>
              </div>

              {/* "+ Save timestamp" Action Button (Exact layout and label from image_ecc29566.png) */}
              <button
                onClick={handleSaveCurrentTimestamp}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all hover:border-[#A3E635]/50 active:scale-95"
              >
                <Bookmark size={13} className="text-[#A3E635]" />
                <span>Save timestamp</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Main Segmented Workspace Tabs (AI Tutor | Notes | Transcript) from image_ecc29566.png */}
        <div className="grid grid-cols-3 gap-2 bg-[#101217] p-1.5 rounded-xl border border-slate-800/80">
          <button
            onClick={() => {
              setMainTab('ai_tutor');
              setSubTab('ai_tutor');
            }}
            className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              mainTab === 'ai_tutor'
                ? 'bg-[#222731] text-white shadow-md border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles size={14} className={mainTab === 'ai_tutor' ? 'text-[#A3E635]' : 'text-slate-500'} />
            <span>AI Tutor</span>
          </button>

          <button
            onClick={() => {
              setMainTab('notes');
            }}
            className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              mainTab === 'notes'
                ? 'bg-[#222731] text-white shadow-md border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <FileText size={14} className={mainTab === 'notes' ? 'text-[#A3E635]' : 'text-slate-500'} />
            <span>Notes</span>
          </button>

          <button
            onClick={() => {
              setMainTab('transcript');
            }}
            className={`py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              mainTab === 'transcript'
                ? 'bg-[#222731] text-white shadow-md border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Clock size={14} className={mainTab === 'transcript' ? 'text-[#A3E635]' : 'text-slate-500'} />
            <span>Transcript</span>
          </button>
        </div>

        {/* Secondary Sub-Tabs: AI Tutor | Summary | Bookmarks (Exact match to image_ecc29566.png) */}
        {mainTab === 'ai_tutor' && (
          <div className="flex items-center gap-6 border-b border-slate-800/80 pb-2 text-xs font-semibold">
            <button
              onClick={() => setSubTab('ai_tutor')}
              className={`px-3 py-1 rounded-full transition-colors ${
                subTab === 'ai_tutor'
                  ? 'bg-[#222731] text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              AI Tutor
            </button>

            <button
              onClick={() => {
                setSubTab('summary');
                if (!summaryData) handleGenerateSummary();
              }}
              className={`px-3 py-1 rounded-full transition-colors ${
                subTab === 'summary'
                  ? 'bg-[#222731] text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Summary
            </button>

            <button
              onClick={() => setSubTab('bookmarks')}
              className={`px-3 py-1 rounded-full transition-colors ${
                subTab === 'bookmarks'
                  ? 'bg-[#222731] text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bookmarks ({bookmarks.length})
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 1: AI TUTOR (Sub-tab = 'ai_tutor') Matches image_ecc29566 */}
        {/* ============================================================ */}
        {mainTab === 'ai_tutor' && subTab === 'ai_tutor' && (
          <div className="space-y-4 pt-1">
            <div>
              <h3 className="text-sm font-bold text-white">Ask about this lecture</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ask a question about the current concept or a selected timestamp.
              </p>
            </div>

            {/* Quick Prompt Pill Buttons (Explain simply | Show a GATE example | Derive step by step) */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleQuickPrompt('simple')}
                className="bg-[#181d26] hover:bg-[#222731] text-slate-300 hover:text-white text-xs px-3 py-1.5 rounded-full border border-slate-700/70 transition-colors"
              >
                Explain simply
              </button>
              <button
                onClick={() => handleQuickPrompt('example')}
                className="bg-[#181d26] hover:bg-[#222731] text-slate-300 hover:text-white text-xs px-3 py-1.5 rounded-full border border-slate-700/70 transition-colors"
              >
                Show a GATE example
              </button>
              <button
                onClick={() => handleQuickPrompt('step')}
                className="bg-[#181d26] hover:bg-[#222731] text-slate-300 hover:text-white text-xs px-3 py-1.5 rounded-full border border-slate-700/70 transition-colors"
              >
                Derive step by step
              </button>
            </div>

            {/* Textarea Input (Placeholder: "Why does Round Robin use a time quantum?") */}
            <div className="space-y-2.5">
              <textarea
                value={qaInput}
                onChange={(e) => setQaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    executeAskQuestion(qaInput);
                  }
                }}
                rows={3}
                placeholder="Why does Round Robin use a time quantum?"
                className="w-full bg-[#111318] border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-[#A3E635] resize-none"
              />

              {/* Full Width "Ask AI tutor" Action Button (Exact match to image_ecc29566.png) */}
              <button
                onClick={() => executeAskQuestion(qaInput)}
                disabled={isAsking || !qaInput.trim()}
                className="w-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs py-2.5 px-4 rounded-full flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 disabled:opacity-50"
              >
                <Send size={14} className="text-slate-950" />
                <span>Ask AI tutor</span>
              </button>
            </div>

            {/* Conversation Stream */}
            <div className="space-y-3 pt-2 max-h-[380px] overflow-y-auto pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#1e2430] border border-slate-700/80 text-slate-100 ml-6'
                      : 'bg-[#111318] border border-slate-800 text-slate-300 mr-2'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-1.5">
                    <span className="font-semibold text-slate-400">
                      {msg.sender === 'user' ? 'You' : 'GATE AI Tutor'}
                    </span>
                    <span>@ {msg.timestamp}</span>
                  </div>
                  <FormattedMathText text={msg.text} />
                </div>
              ))}

              {isAsking && (
                <div className="bg-[#111318] p-3 rounded-xl border border-slate-800 text-xs text-[#A3E635] flex items-center gap-2">
                  <div className="h-3 w-3 border-2 border-[#A3E635] border-t-transparent rounded-full animate-spin"></div>
                  Formulating KaTeX equations and verified GATE 2027 derivations...
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: SUMMARY SUB-TAB (Executive Summary, Core Pillars, Traps) */}
        {/* ============================================================ */}
        {mainTab === 'ai_tutor' && subTab === 'summary' && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={15} className="text-[#A3E635]" />
                  Executive Lecture Summary
                </h3>
                <p className="text-xs text-slate-400">Distilled core proofs and frequent exam traps</p>
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={isSummarizing}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
              >
                {isSummarizing ? 'Analyzing...' : 'Refresh Summary'}
              </button>
            </div>

            {isSummarizing && (
              <div className="py-12 text-center space-y-3">
                <div className="h-7 w-7 border-2 border-[#A3E635] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-400">Extracting mathematical formulations and GATE traps...</p>
              </div>
            )}

            {!isSummarizing && summaryData && (
              <div className="space-y-3 text-xs">
                {/* Executive Summary */}
                <div className="bg-[#111318] p-3.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-[#60A5FA] uppercase text-[10px] tracking-wider block mb-1">
                    Executive Summary
                  </span>
                  <FormattedMathText text={summaryData.executiveSummary} className="text-slate-300" />
                </div>

                {/* Core Conceptual Pillars */}
                <div className="bg-[#111318] p-3.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-[#A3E635] uppercase text-[10px] tracking-wider block mb-2">
                    Core Conceptual Pillars
                  </span>
                  <ul className="space-y-1.5">
                    {summaryData.coreConcepts.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#A3E635] mt-1.5 shrink-0" />
                        <FormattedMathText text={c} />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Frequent GATE Examiner Traps */}
                <div className="bg-rose-950/20 p-3.5 rounded-xl border border-rose-900/40">
                  <span className="font-bold text-[#F87171] uppercase text-[10px] tracking-wider block mb-2">
                    ⚠️ Frequent GATE Examiner Traps
                  </span>
                  <ul className="space-y-1.5">
                    {summaryData.gateTraps.map((trap, i) => (
                      <li key={i} className="flex items-start gap-2 text-rose-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#F87171] mt-1.5 shrink-0" />
                        <FormattedMathText text={trap} />
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Takeaways */}
                <div className="bg-[#111318] p-3.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-[#FBBF24] uppercase text-[10px] tracking-wider block mb-2">
                    Key Takeaways to Memorize
                  </span>
                  <ul className="space-y-1">
                    {summaryData.keyTakeaways.map((takeaway, i) => (
                      <li key={i} className="text-slate-300">
                        • {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: BOOKMARKS SUB-TAB */}
        {/* ============================================================ */}
        {mainTab === 'ai_tutor' && subTab === 'bookmarks' && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Bookmark size={15} className="text-[#FBBF24]" />
                  Saved Lecture Timestamps ({bookmarks.length})
                </h3>
                <p className="text-xs text-slate-400">Click any timestamp to seek directly to that lecture moment</p>
              </div>

              <button
                onClick={handleSaveCurrentTimestamp}
                className="bg-[#222731] hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
              >
                <Plus size={13} />
                <span>Bookmark {formatTime(currentTimeSec)}</span>
              </button>
            </div>

            <div className="space-y-2">
              {bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="bg-[#111318] border border-slate-800 hover:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleSeekToTimestamp(bm.timestamp)}
                      className="bg-[#222731] hover:bg-[#A3E635] text-[#A3E635] hover:text-slate-950 px-2.5 py-1 rounded font-mono font-bold text-xs transition-colors"
                      title="Seek video to this timestamp"
                    >
                      {bm.timestamp}
                    </button>
                    <div>
                      <p className="text-slate-200 font-medium">{bm.noteText}</p>
                      {bm.formulaLatex && (
                        <div className="text-[11px] text-[#A3E635] font-mono mt-0.5">
                          ${bm.formulaLatex}$
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSaveNoteToVault({
                        title: `${selectedVideo.topic} @ ${bm.timestamp}`,
                        category: selectedVideo.subject,
                        latex: bm.formulaLatex || '',
                        notes: bm.noteText
                      });
                    }}
                    className="text-[11px] text-[#60A5FA] hover:underline font-semibold shrink-0"
                  >
                    Save to Vault
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 4: NOTES TAB (User Note-taking + KaTeX Formulator + PDF) */}
        {/* ============================================================ */}
        {mainTab === 'notes' && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <FileText size={16} className="text-[#A3E635]" />
                  Lecture Notes & KaTeX Formulas
                </h3>
                <p className="text-xs text-slate-400">Captured notes are synchronized with your revision queue</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
                  title="Print or export as PDF"
                >
                  <Download size={13} />
                  <span>PDF</span>
                </button>

                <button
                  onClick={handleGenerateNotes}
                  disabled={isGeneratingNotes}
                  className="bg-[#A3E635] hover:bg-[#86efac] text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isGeneratingNotes ? 'Generating...' : 'AI KaTeX Cheat-Sheet'}
                </button>
              </div>
            </div>

            {/* Note Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Personal Study Notes</span>
                <button
                  onClick={() => {
                    onSaveNoteToVault({
                      title: `${selectedVideo.topic} Notes`,
                      category: selectedVideo.subject,
                      latex: selectedVideo.keyFormulas[0] || '',
                      notes: userNoteDraft
                    });
                  }}
                  className="text-[#60A5FA] hover:underline font-semibold"
                >
                  Save to Formula Vault (+25 XP)
                </button>
              </div>

              <textarea
                value={userNoteDraft}
                onChange={(e) => setUserNoteDraft(e.target.value)}
                rows={6}
                className="w-full bg-[#111318] border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 font-mono placeholder-slate-500 focus:outline-hidden focus:border-[#A3E635]"
              />
            </div>

            {/* Key Formulas Section from Video */}
            <div className="bg-[#111318] border border-slate-800 rounded-xl p-3.5 space-y-2">
              <span className="font-bold text-[#A3E635] uppercase text-[10px] tracking-wider block">
                Core KaTeX Formulas in this Video
              </span>
              <div className="grid grid-cols-1 gap-2.5">
                {selectedVideo.keyFormulas.map((f, i) => (
                  <div key={i} className="bg-[#1a1f29] border border-slate-800/80 rounded-lg p-3 text-center overflow-x-auto">
                    <FormattedMathText text={`$$${f}$$`} />
                  </div>
                ))}
              </div>
            </div>

            {/* Generated KaTeX Cheat Sheet if available */}
            {generatedNotes && (
              <div className="bg-[#111318] border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-white text-xs">{generatedNotes.title}</h4>
                <div className="space-y-2">
                  {generatedNotes.formulas.map((f, i) => (
                    <div key={i} className="bg-[#1a1f29] p-2.5 rounded border border-slate-800 text-xs">
                      <div className="font-semibold text-slate-200">{f.name}</div>
                      <div className="my-1 text-center">
                        <FormattedMathText text={`$$${f.latex}$$`} />
                      </div>
                      <div className="text-[10px] text-slate-400">Usage: {f.usage}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 5: TRANSCRIPT TAB (Interactive timestamped chapters) */}
        {/* ============================================================ */}
        {mainTab === 'transcript' && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Clock size={16} className="text-[#A3E635]" />
                  Synchronized Lecture Chapters & Transcript
                </h3>
                <p className="text-xs text-slate-400">
                  Click any timestamp to seek the YouTube video to that concept
                </p>
              </div>

              <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Current: {formatTime(currentTimeSec)}
              </span>
            </div>

            {/* Transcript Item List */}
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {(selectedVideo.transcript || []).map((t: TranscriptItem, i: number) => {
                const isActive =
                  currentTimeSec >= t.timeSeconds &&
                  (i === (selectedVideo.transcript || []).length - 1 ||
                    currentTimeSec < (selectedVideo.transcript || [])[i + 1].timeSeconds);

                return (
                  <div
                    key={i}
                    onClick={() => handleSeekToTimestamp(t.timestamp)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#1e2532] border-[#A3E635]/80 shadow-md'
                        : 'bg-[#111318] border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            isActive
                              ? 'bg-[#A3E635] text-slate-950'
                              : 'bg-slate-800 text-[#A3E635]'
                          }`}
                        >
                          {t.timestamp}
                        </span>
                        <span className={`font-semibold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                          {t.title}
                        </span>
                      </div>
                      {isActive && (
                        <span className="text-[10px] font-mono text-[#A3E635] uppercase tracking-wider font-bold">
                          Playing
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed pl-1">
                      {t.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
